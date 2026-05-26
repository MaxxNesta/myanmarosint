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

  // Skip articles already used to create a ConflictEvent
  const extractedRows = await prisma.conflictEvent.findMany({
    where:  { rawArticleId: { not: null } },
    select: { rawArticleId: true },
  })
  const alreadyExtracted = new Set(extractedRows.map(e => e.rawArticleId!))

  const articles = await prisma.rawArticle.findMany({
    where: {
      ingestedAt: { gte: subDays(new Date(), 7) },
      ...(alreadyExtracted.size > 0 ? { id: { notIn: [...alreadyExtracted] } } : {}),
      OR: [
        { publishedAt: { gte: INTEL_START } },
        { publishedAt: null },
      ],
    },
    orderBy: { publishedAt: 'desc' },
    take:    BATCH,
  })

  if (articles.length === 0) {
    return NextResponse.json({ message: 'No unextracted articles in window', extracted: 0 })
  }

  let saved = 0, skipped = 0

  for (const article of articles) {
    const pubDate = article.publishedAt ?? article.ingestedAt
    if (pubDate < INTEL_START) { skipped++; continue }

    // Stage 1 — Groq: fast extraction of top battle event
    let events
    try {
      events = await extractEvents(article.title, article.content, article.sourceName, pubDate)
    } catch { skipped++; continue }

    if (events.length === 0) { skipped++; continue }

    // Only the top event per article
    const ev = events[0]

    // Stage 2 — DeepSeek: interpret attacker/defender, write structured summary
    const [enr] = await enrichEvents(
      [{ eventType: ev.eventType, actors: ev.actors, location: ev.location, region: normalizeRegion(ev.region), rawSummary: ev.summary, fatalities: ev.fatalities }],
      article.title,
    )

    const actors    = normalizeActors(ev.actors)
    let   region    = normalizeRegion(ev.region)
    const evDate    = new Date(ev.date)
    const dedupHash = buildDedupHash({ actors, region, adminArea: ev.adminArea, eventType: ev.eventType, date: evDate })

    // Geocode — township lookup returns the authoritative region, overriding AI value
    const geo = resolveCoordinates(
      ev.location ?? ev.adminArea ?? '',
      ev.adminArea ?? '',
      region,
    )
    if (geo.region) region = geo.region

    const confidence = Math.round(
      (getBaseReliability(article.sourceName) * 0.6 + enr.confidence * 0.4) * 100,
    ) / 100

    try {
      await prisma.conflictEvent.upsert({
        where:  { dedupHash },
        create: {
          eventType:            ev.eventType,
          date:                 evDate,
          region,
          adminArea:            ev.adminArea ?? null,
          location:             ev.location ?? null,
          lat:                  geo.coords[1],
          lng:                  geo.coords[0],
          actors,
          attackerActor:        enr.attackerActor ? normalizeActors([enr.attackerActor])[0] ?? null : null,
          defenderActor:        enr.defenderActor ? normalizeActors([enr.defenderActor])[0] ?? null : null,
          summary:              enr.summary.slice(0, 800),
          fatalities:           ev.fatalities,
          fatalitiesMin:        ev.fatalitiesMin,
          fatalitiesMax:        ev.fatalitiesMax,
          sourceUrl:            article.url,
          sourceName:           article.sourceName,
          sourceType:           article.sourceType,
          biasFlag:             ev.biasFlag,
          confidence,
          dedupHash,
          isActiveIntelligence: evDate >= INTEL_START,
          rawArticleId:         article.id,
        },
        update: {
          confidence:    { increment: 0.02 },
          attackerActor: enr.attackerActor ? normalizeActors([enr.attackerActor])[0] ?? undefined : undefined,
          defenderActor: enr.defenderActor ? normalizeActors([enr.defenderActor])[0] ?? undefined : undefined,
          summary:       enr.summary.slice(0, 800),
        },
      })
      saved++
    } catch (err) {
      console.error('extract upsert error:', String(err).slice(0, 200))
      skipped++
    }
  }

  return NextResponse.json({ articles: articles.length, saved, skipped })
}
