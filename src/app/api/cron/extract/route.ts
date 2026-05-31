export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { extractEvents } from '@/lib/event-extractor'
import { enrichEvents } from '@/lib/event-enricher'
import { normalizeActors, normalizeRegion } from '@/lib/normalizer'
import { buildDedupHash } from '@/lib/dedup'
import { resolveCoordinates } from '@/lib/geocoding'
import { getBaseReliability } from '@/lib/confidence'
import { subDays } from 'date-fns'

const BATCH = 20
const INTEL_START = new Date('2023-01-01T00:00:00Z')

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (process.env.NODE_ENV === 'production' && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Skip articles already extracted into a ConflictEvent
  const extractedIds = await prisma.conflictEvent.findMany({
    select: { rawArticleId: true },
  })
  const alreadyExtracted = new Set(extractedIds.map(e => e.rawArticleId!))

  const articles = await prisma.rawArticle.findMany({
    where: {
      ingestedAt: { gte: subDays(new Date(), 7) },
      ...(alreadyExtracted.size > 0 ? { id: { notIn: [...alreadyExtracted] } } : {}),
      OR: [{ publishedAt: { gte: INTEL_START } }, { publishedAt: null }],
    },
    orderBy: { publishedAt: 'desc' },
    take:    BATCH,
  })

  if (articles.length === 0) {
    return NextResponse.json({ message: 'No unextracted articles', extracted: 0 })
  }

  let saved = 0, skipped = 0

  for (const article of articles) {
    const pubDate = article.publishedAt ?? article.ingestedAt
    if (pubDate < INTEL_START) { skipped++; continue }

    // Stage 1 — Groq extraction
    let events
    try {
      events = await extractEvents(article.title, article.content, article.channelName, pubDate)
    } catch { skipped++; continue }
    if (events.length === 0) { skipped++; continue }

    const ev = events[0]

    // Stage 2 — DeepSeek: attacker/defender analysis + location validation
    const [enr] = await enrichEvents(
      [{
        eventType:      ev.eventType,
        actors:         ev.actors,
        location:       ev.location,
        region:         normalizeRegion(ev.region),
        rawSummary:     ev.summary,
        fatalities:     ev.fatalities,
        articleContent: article.content.slice(0, 500),
      }],
      article.title,
    )

    const actors  = normalizeActors(ev.actors)
    const evDate  = new Date(ev.date)

    // Location resolution: prefer DeepSeek-validated > township lookup > Groq extraction
    const rawRegion   = normalizeRegion(ev.region)
    const rawLocation = ev.location ?? ev.adminArea ?? ''
    const rawAdmin    = ev.adminArea ?? null

    // Use DeepSeek's corrected location if provided
    const dsLocation  = enr.location  ?? rawLocation
    const dsAdmin     = enr.adminArea ?? rawAdmin
    let   region      = enr.region    ? normalizeRegion(enr.region) : rawRegion

    // Township lookup can still override if it finds an authoritative match
    const geo = resolveCoordinates(dsLocation, dsAdmin ?? '', region)
    if (geo.region) region = geo.region

    const finalLocation = dsLocation || null
    const finalAdmin    = dsAdmin || null

    const dedupHash = buildDedupHash({ actors, region, adminArea: finalAdmin, eventType: ev.eventType, date: evDate })

    const confidence = Math.round(
      (getBaseReliability(article.channelName) * 0.6 + enr.confidence * 0.4) * 100,
    ) / 100

    try {
      // Upsert ConflictEvent, then upsert AnalysedEvent in a transaction
      await prisma.$transaction(async (tx) => {
        const conflict = await tx.conflictEvent.upsert({
          where:  { dedupHash },
          create: {
            rawArticleId:  article.id,
            eventType:     ev.eventType,
            date:          evDate,
            region,
            adminArea:     finalAdmin,
            location:      finalLocation,
            lat:           geo.coords[1],
            lng:           geo.coords[0],
            summary:       ev.summary.slice(0, 800),
            fatalities:    ev.fatalities,
            fatalitiesMin: ev.fatalitiesMin,
            fatalitiesMax: ev.fatalitiesMax,
            biasFlag:      ev.biasFlag,
            dedupHash,
          },
          update: {
            // on duplicate, update location precision if better
            lat:      geo.coords[1],
            lng:      geo.coords[0],
            region,
          },
        })

        // Always upsert AnalysedEvent (Option A — fallback to nulls if DeepSeek failed)
        await tx.analysedEvent.upsert({
          where:  { conflictEventId: conflict.id },
          create: {
            conflictEventId:      conflict.id,
            attackerActor:        enr.attackerActor ? normalizeActors([enr.attackerActor])[0] ?? null : null,
            defenderActor:        enr.defenderActor ? normalizeActors([enr.defenderActor])[0] ?? null : null,
            actors,
            confidence,
            summary:              enr.summary.slice(0, 800),
            isActiveIntelligence: evDate >= INTEL_START,
          },
          update: {
            attackerActor: enr.attackerActor ? normalizeActors([enr.attackerActor])[0] ?? undefined : undefined,
            defenderActor: enr.defenderActor ? normalizeActors([enr.defenderActor])[0] ?? undefined : undefined,
            confidence:    { increment: 0.02 },
            summary:       enr.summary.slice(0, 800),
          },
        })
      })
      saved++
    } catch (err) {
      console.error('extract error:', String(err).slice(0, 200))
      skipped++
    }
  }

  return NextResponse.json({ articles: articles.length, saved, skipped })
}
