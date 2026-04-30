/**
 * Unified conflict event extraction pipeline.
 * Run: npm run extract
 *
 * Pipeline:
 *   1. Load RawArticles published 2023+ (batched, 100 at a time)
 *   2. Extract structured ConflictEvents via Claude Haiku (regex fallback if no API key)
 *   3. Normalize actor names and region labels
 *   4. Deduplicate via SHA-256 hash (actor + location + event_type + 6-hour bucket)
 *   5. Upsert into ConflictEvent — duplicate hashes bump confidence by 0.02
 *   6. Write UpdateLog entry
 */

import { PrismaClient } from '@prisma/client'
import { extractEvents } from '../lib/event-extractor'
import { normalizeActors, normalizeRegion } from '../lib/normalizer'
import { buildDedupHash } from '../lib/dedup'
import { resolveCoordinates } from '../lib/geocoding'
import { getBaseReliability } from '../lib/confidence'

const prisma      = new PrismaClient()
const INTEL_START = new Date('2023-01-01T00:00:00Z')
const BATCH_SIZE  = 100
const AI_DELAY    = 200  // ms between Claude calls

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function processBatch(
  offset: number,
): Promise<{ processed: number; saved: number; skipped: number }> {
  const articles = await prisma.rawArticle.findMany({
    where: {
      OR: [
        { publishedAt: { gte: INTEL_START } },
        { publishedAt: null, ingestedAt: { gte: INTEL_START } },
      ],
    },
    orderBy: { publishedAt: 'desc' },
    skip: offset,
    take: BATCH_SIZE,
  })

  if (articles.length === 0) return { processed: 0, saved: 0, skipped: 0 }

  let saved = 0, skipped = 0

  for (const article of articles) {
    const pubDate = article.publishedAt ?? article.ingestedAt
    if (pubDate < INTEL_START) { skipped++; continue }

    let events
    try {
      events = await extractEvents(article.title, article.content, article.sourceName, pubDate)
      if (process.env.ANTHROPIC_API_KEY) await sleep(AI_DELAY)
    } catch { skipped++; continue }

    if (events.length === 0) { skipped++; continue }

    const baseReliability = getBaseReliability(article.sourceName)

    for (const ev of events) {
      const actors    = normalizeActors(ev.actors)
      const region    = normalizeRegion(ev.region)
      const evDate    = new Date(ev.date)
      const dedupHash = buildDedupHash({ actors, region, adminArea: ev.adminArea, eventType: ev.eventType, date: evDate })
      const geo       = resolveCoordinates(ev.adminArea ?? '', ev.location ?? '', region)

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
            confidence:           Math.round(baseReliability * 100) / 100,
            dedupHash,
            isActiveIntelligence: evDate >= INTEL_START,
            rawArticleId:         article.id,
          },
          update: {
            confidence: { increment: 0.02 },
          },
        })
        saved++
      } catch { skipped++ }
    }
  }

  return { processed: articles.length, saved, skipped }
}

async function main() {
  const useAI = !!process.env.ANTHROPIC_API_KEY
  console.log(`🧠 Conflict event extraction [${useAI ? 'AI — Claude Haiku' : 'regex fallback (no ANTHROPIC_API_KEY)'}]`)
  console.log(`   Intelligence boundary: 2023-01-01+`)

  let offset = 0, totalProcessed = 0, totalSaved = 0, totalSkipped = 0

  while (true) {
    process.stdout.write(`   Batch @${offset}… `)
    const { processed, saved, skipped } = await processBatch(offset)
    console.log(`${processed} articles → ${saved} saved, ${skipped} skipped/deduped`)
    totalProcessed += processed
    totalSaved     += saved
    totalSkipped   += skipped
    if (processed < BATCH_SIZE) break
    offset += BATCH_SIZE
  }

  console.log(`\n✅ Total: ${totalProcessed} articles → ${totalSaved} events, ${totalSkipped} skipped`)

  await prisma.updateLog.create({
    data: {
      change:   `Event extraction: ${totalSaved} conflict events upserted`,
      reason:   'npm run extract',
      source:   'extract-events.ts',
      metadata: { processed: totalProcessed, saved: totalSaved, skipped: totalSkipped, mode: useAI ? 'ai' : 'regex' },
    },
  })
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
