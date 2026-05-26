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

const BATCH = 15
const INTEL_START = new Date('2023-01-01T00:00:00Z')

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (process.env.NODE_ENV === 'production' && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Process articles ingested in the last 2 days — dedupHash prevents true duplicates
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

    // Stage 1 — Groq: fast bulk event extraction
    let events
    try {
      events = await extractEvents(article.title, article.content, article.sourceName, pubDate)
    } catch { skipped++; continue }

    if (events.length === 0) { skipped++; continue }

    // Stage 2 — DeepSeek: military interpretation (attacker/defender/summary/confidence)
    const enriched = await enrichEvents(
      events.map(ev => ({
        eventType:  ev.eventType,
        actors:     ev.actors,
        location:   ev.location,
        region:     normalizeRegion(ev.region),
        rawSummary: ev.summary,
        fatalities: ev.fatalities,
      })),
      article.title,
    )

    const baseReliability = getBaseReliability(article.sourceName)

    for (let i = 0; i < events.length; i++) {
      const ev  = events[i]
      const enr = enriched[i]

      const actors    = normalizeActors(ev.actors)
      const region    = normalizeRegion(ev.region)
      const evDate    = new Date(ev.date)
      const dedupHash = buildDedupHash({ actors, region, adminArea: ev.adminArea, eventType: ev.eventType, date: evDate })

      // Prioritise the specific town name over admin area label for geocoding
      const geo = resolveCoordinates(
        ev.location ?? ev.adminArea ?? '',
        ev.adminArea ?? '',
        region,
      )

      const confidence = Math.min(
        1,
        Math.round((baseReliability * 0.6 + enr.confidence * 0.4) * 100) / 100,
      )

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
            attackerActor: enr.attackerActor ?? undefined,
            defenderActor: enr.defenderActor ?? undefined,
          },
        })
        saved++
      } catch (err) {
        console.error('extract upsert error:', String(err).slice(0, 200))
        skipped++
      }
    }
  }

  return NextResponse.json({ articles: articles.length, saved, skipped })
}
