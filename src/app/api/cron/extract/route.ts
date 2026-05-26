export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { extractEvents } from '@/lib/event-extractor'
import { normalizeActors, normalizeRegion } from '@/lib/normalizer'
import { buildDedupHash } from '@/lib/dedup'
import { resolveCoordinates } from '@/lib/geocoding'
import { getBaseReliability } from '@/lib/confidence'
import { subDays } from 'date-fns'

const BATCH = 15
const INTEL_START = new Date('2023-01-01T00:00:00Z')

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (process.env.NODE_ENV === 'production' && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const articles = await prisma.rawArticle.findMany({
    where: {
      ingestedAt: { gte: subDays(new Date(), 2) },
      OR: [
        { publishedAt: { gte: INTEL_START } },
        { publishedAt: null },
      ],
    },
    orderBy: { publishedAt: 'desc' },
    take: BATCH,
  })

  if (articles.length === 0) {
    return NextResponse.json({ message: 'No recent articles to extract', extracted: 0 })
  }

  let saved = 0, skipped = 0

  for (const article of articles) {
    const pubDate = article.publishedAt ?? article.ingestedAt
    if (pubDate < INTEL_START) { skipped++; continue }

    // DeepSeek: classify, categorise, extract single top event with attacker/defender
    let events
    try {
      events = await extractEvents(article.title, article.content, article.sourceName, pubDate)
    } catch { skipped++; continue }

    if (events.length === 0) { skipped++; continue }

    // Only the top event per article
    const ev = events[0]

    const actors    = normalizeActors(ev.actors)
    // Normalise AI-provided region
    let   region    = normalizeRegion(ev.region)
    const evDate    = new Date(ev.date)
    const dedupHash = buildDedupHash({ actors, region, adminArea: ev.adminArea, eventType: ev.eventType, date: evDate })

    // Geocode — township lookup also returns the authoritative region name
    const geo = resolveCoordinates(
      ev.location ?? ev.adminArea ?? '',
      ev.adminArea ?? '',
      region,
    )

    // Override AI region with lookup-verified region to prevent mismatches
    // (e.g. AI says "Rakhine State" but town is Naypyitaw → use "Naypyidaw Union Territory")
    if (geo.region) region = geo.region

    const confidence = Math.round(getBaseReliability(article.sourceName) * 100) / 100

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
          attackerActor:        ev.attackerActor ? normalizeActors([ev.attackerActor])[0] ?? null : null,
          defenderActor:        ev.defenderActor ? normalizeActors([ev.defenderActor])[0] ?? null : null,
          summary:              ev.summary.slice(0, 800),
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
          attackerActor: ev.attackerActor ? normalizeActors([ev.attackerActor])[0] ?? undefined : undefined,
          defenderActor: ev.defenderActor ? normalizeActors([ev.defenderActor])[0] ?? undefined : undefined,
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
