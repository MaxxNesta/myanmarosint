/**
 * 1. Cleanup: delete ConflictEvents linked to non-conflict articles
 *    (drug/gambling crackdowns, bridge reopenings, etc.)
 * 2. Backfill: extract conflict events from all unprocessed articles
 *    published between 2026-01-01 and today.
 *
 * Run: tsx --env-file=.env.local src/scripts/cleanup-backfill-2026.ts
 */
import { makePrisma } from './make-prisma'
import { extractEvents } from '../lib/event-extractor'
import { enrichEvents }  from '../lib/event-enricher'
import { normalizeActors, normalizeRegion } from '../lib/normalizer'
import { buildDedupHash }    from '../lib/dedup'
import { resolveCoordinates } from '../lib/geocoding'
import { getBaseReliability } from '../lib/confidence'

const prisma         = makePrisma()
const BACKFILL_START = new Date('2021-02-01T00:00:00Z')
const INTEL_START    = new Date('2023-01-01T00:00:00Z')
const BATCH          = 10
const DELAY_MS       = 1500

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// ─── Step 1: Cleanup bad events ───────────────────────────────────────────────

async function cleanup() {
  console.log('\n=== STEP 1: CLEANUP ===')

  // Broad match first, then filter precisely in JS
  const candidates = await prisma.conflictEvent.findMany({
    where: {
      OR: [
        { rawArticle: { title: { contains: 'DKBA',             mode: 'insensitive' } } },
        { rawArticle: { title: { contains: 'Friendship Bridge', mode: 'insensitive' } } },
        { rawArticle: { title: { contains: 'crack down',        mode: 'insensitive' } } },
        { rawArticle: { title: { contains: 'outthink',           mode: 'insensitive' } } },
        { rawArticle: { title: { contains: 'outfight',           mode: 'insensitive' } } },
        { rawArticle: { title: { contains: 'losing the narrat',  mode: 'insensitive' } } },
        { rawArticle: { title: { contains: 'winning ground',     mode: 'insensitive' } } },
        { rawArticle: { title: { contains: 'must not forsake',   mode: 'insensitive' } } },
        { rawArticle: { title: { contains: 'crossroads',         mode: 'insensitive' } } },
        { rawArticle: { title: { contains: 'break the cycle',    mode: 'insensitive' } } },
        { rawArticle: { title: { contains: 'trafficked to fight',mode: 'insensitive' } } },
        { rawArticle: { title: { contains: 'alliance built',     mode: 'insensitive' } } },
        { rawArticle: { title: { contains: 'impunity',           mode: 'insensitive' } } },
      ]
    },
    include: { rawArticle: { select: { title: true } } },
  })

  const OPINION_PATTERNS = [
    /(crack\s*down|crackdown)\s+on\s+(drug|gambl)/i,
    /\banti[-\s]?drug\b/i,
    /friendship\s+bridge.*(open|reopen|close)/i,
    /outthink|outsmart|outmaneuver|outfight/i,
    /winning\s+ground\s+but\s+losing/i,
    /losing\s+the\s+narrative/i,
    /must\s+not\s+forsake/i,
    /\bcrossroads\b.*world\s+must/i,
    /\b(opinion|editorial|commentary|analysis)\b/i,
    /built\s+to\s+win.*civil\s+war/i,
    /new\s+.{0,30}alliance\s+built/i,
    /\bbreak\s+the\s+cycle\s+of\s+impunity/i,
    /trafficked\s+to\s+fight/i,
    /\bholds?\s+.{0,30}hostage\b/i,
  ]

  const bad = candidates.filter(ev =>
    OPINION_PATTERNS.some(rx => rx.test(ev.rawArticle.title))
  )

  if (bad.length === 0) {
    console.log('No bad events found — already clean.')
    return
  }

  console.log(`Found ${bad.length} bad event(s) to delete:`)
  for (const ev of bad) {
    console.log(`  [${ev.eventType}] ${ev.rawArticle.title.slice(0, 90)}`)
  }

  const { count } = await prisma.conflictEvent.deleteMany({
    where: { id: { in: bad.map(e => e.id) } },
  })
  console.log(`✓ Deleted ${count} event(s).`)

  // Create skip markers so these articles are never re-processed
  for (const ev of bad) {
    await createSkipMarker(ev.rawArticleId, ev.rawArticle.title, ev.date)
  }
  console.log(`✓ Skip markers created for ${bad.length} article(s).`)
}

// ─── Step 2: Backfill ────────────────────────────────────────────────────────
// Optional: --channel <name>  to process only one channel

async function backfill() {
  const arg = (flag: string) => {
    const idx = process.argv.indexOf(flag)
    return idx !== -1 ? process.argv[idx + 1] : null
  }

  const channelFilter = arg('--channel')
  const fromDate      = arg('--from') ? new Date(arg('--from')!) : BACKFILL_START
  const toDate        = arg('--to')   ? new Date(arg('--to')!)   : new Date()

  const label = [
    channelFilter ? `channel: ${channelFilter}` : 'all channels',
    `${fromDate.toISOString().slice(0, 10)} → ${toDate.toISOString().slice(0, 10)}`,
  ].join(' | ')
  console.log(`\n=== STEP 2: BACKFILL (${label}) ===`)

  const where = {
    publishedAt:    { gte: fromDate, lte: toDate },
    conflictEvents: { none: {} },
    ...(channelFilter ? { channelName: channelFilter } : {}),
  }

  const total = await prisma.rawArticle.count({ where })
  console.log(`${total} unprocessed articles in range.\n`)
  if (total === 0) { console.log('Nothing to backfill.'); return }

  let saved = 0, skipped = 0, processed = 0

  while (true) {
    const articles = await prisma.rawArticle.findMany({
      where,
      orderBy: { publishedAt: 'asc' },
      take: BATCH,
    })

    if (articles.length === 0) break

    for (const article of articles) {
      processed++
      const pubDate = article.publishedAt ?? article.ingestedAt

      // Pre-2023 articles: still extract them (stored with isActiveIntelligence=false)
      // but create a skip marker if no event found so they don't loop infinitely

      // Stage 1 — Groq extraction
      let events
      try {
        events = await extractEvents(article.title, article.content, article.channelName, pubDate)
      } catch (err) {
        console.log(`  [${processed}] SKIP extraction error: ${String(err).slice(0, 60)}`)
        skipped++
        // Insert a placeholder ConflictEvent so it won't be re-tried (avoids infinite loop)
        await createSkipMarker(article.id, article.title, pubDate)
        await sleep(DELAY_MS)
        continue
      }

      if (events.length === 0) {
        skipped++
        process.stdout.write(`\r  [${processed}/${total}] skip — ${article.title.slice(0, 50).padEnd(50)}`)
        await createSkipMarker(article.id, article.title, pubDate)
        await sleep(500)
        continue
      }

      const ev = events[0]

      // Stage 2 — DeepSeek enrichment
      let enr
      try {
        ;[enr] = await enrichEvents(
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
      } catch {
        enr = {
          attackerActor: ev.actors[0] ?? null,
          defenderActor: null,
          summary:       ev.summary.slice(0, 180),
          confidence:    0.4,
          region:        null,
          adminArea:     null,
          location:      null,
        }
      }

      const actors      = normalizeActors(ev.actors)
      const evDate      = new Date(ev.date)
      const rawRegion   = normalizeRegion(ev.region)
      const rawLocation = ev.location ?? ev.adminArea ?? ''
      const rawAdmin    = ev.adminArea ?? null
      const dsLocation  = enr.location  ?? rawLocation
      const dsAdmin     = enr.adminArea ?? rawAdmin
      let   region      = enr.region ? normalizeRegion(enr.region) : rawRegion

      const geo = resolveCoordinates(dsLocation, dsAdmin ?? '', region)
      if (geo.region) region = geo.region

      const finalLocation = dsLocation || null
      const finalAdmin    = dsAdmin    || null
      const dedupHash     = buildDedupHash({ actors, region, adminArea: finalAdmin, eventType: ev.eventType, date: evDate })
      const confidence    = Math.round(
        (getBaseReliability(article.channelName) * 0.6 + enr.confidence * 0.4) * 100,
      ) / 100

      try {
        // Sequential upserts (avoids interactive-transaction issues with Neon pooler)
        const conflict = await prisma.conflictEvent.upsert({
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
          update: { lat: geo.coords[1], lng: geo.coords[0], region },
        })

        await prisma.analysedEvent.upsert({
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
        saved++
        console.log(`  [${processed}/${total}] ✓ ${ev.eventType.padEnd(22)} ${region.padEnd(22)} ${article.title.slice(0, 55)}`)
      } catch (err) {
        console.log(`  [${processed}/${total}] ✗ db: ${String(err).slice(0, 80)}`)
        skipped++
        await createSkipMarker(article.id, article.title, pubDate)
      }

      await sleep(DELAY_MS)
    }
  }

  console.log(`\n✓ Backfill done — saved: ${saved}, skipped: ${skipped}`)
}

// Insert a minimal ConflictEvent so the article won't be re-queried on the next run.
// Uses a dedicated POLITICAL_DEVELOPMENT type + a deterministic dedupHash.
async function createSkipMarker(articleId: string, title: string, date: Date) {
  const dedupHash = `skip_${articleId}`
  try {
    await prisma.conflictEvent.upsert({
      where:  { dedupHash },
      create: {
        rawArticleId:  articleId,
        eventType:     'POLITICAL_DEVELOPMENT',
        date,
        region:        'Myanmar',
        summary:       title.slice(0, 800),
        lat:           null,
        lng:           null,
        fatalities:    0,
        fatalitiesMin: 0,
        fatalitiesMax: 0,
        biasFlag:      'neutral',
        dedupHash,
      },
      update: {},
    })
    // Create a minimal AnalysedEvent with isActiveIntelligence = false so it won't show on the map
    const ce = await prisma.conflictEvent.findUnique({ where: { dedupHash } })
    if (ce) {
      await prisma.analysedEvent.upsert({
        where:  { conflictEventId: ce.id },
        create: {
          conflictEventId:      ce.id,
          actors:               [],
          confidence:           0.0,
          summary:              title.slice(0, 800),
          isActiveIntelligence: false,
        },
        update: {},
      })
    }
  } catch { /* ignore duplicate */ }
}

async function main() {
  await cleanup()
  await backfill()
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
