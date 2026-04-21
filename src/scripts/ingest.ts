/**
<<<<<<< HEAD
 * Standalone RSS ingestion script.
 * Run locally:  npm run ingest
 * Or trigger via the admin UI at /admin
 *
 * Pipeline:
 *   1. Fetch all RSS feeds defined in src/lib/rss.ts
 *   2. Save new articles to RawArticle (skip duplicates by URL)
 *   3. Call the Claude processing pipeline to convert articles → ProcessedEvents
 */

import { PrismaClient } from '@prisma/client'
import { fetchAllFeeds } from '../lib/rss'

const prisma = new PrismaClient()

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

async function scrapeFeeds(): Promise<{ saved: number; skipped: number }> {
  const items = await fetchAllFeeds()
  let saved = 0, skipped = 0

  for (const item of items) {
    if (!item.url || !item.title) { skipped++; continue }

    const exists = await prisma.rawArticle.findUnique({ where: { url: item.url } })
    if (exists) { skipped++; continue }

    const text = `${item.title} ${item.content}`.toLowerCase()
    const relevant =
      text.includes('myanmar') || text.includes('burma')    ||
      text.includes('tatmadaw') || text.includes('junta')   ||
      text.includes('pdf')     || text.includes('nug')      ||
      text.includes('sagaing') || text.includes('arakan')   ||
      text.includes('kachin')  || text.includes('shan')     ||
      text.includes('karenni') || text.includes('kayah')    ||
      text.includes('mon')     || text.includes('chin')

    if (!relevant) { skipped++; continue }

    await prisma.rawArticle.create({
      data: {
        url:         item.url,
        title:       item.title,
        content:     `${item.title}\n\n${item.content}`,
        sourceName:  item.sourceName,
        publishedAt: item.publishedAt ?? undefined,
      },
    })
    saved++
  }

  return { saved, skipped }
}

async function processArticles(): Promise<{ batches: number; events: number }> {
  let batches = 0, totalEvents = 0

  // Drain up to 5 batches of 10 articles each
  for (let i = 0; i < 5; i++) {
    const res  = await fetch(`${BASE_URL}/api/cron/process`, { cache: 'no-store' })
    const data = await res.json() as { message?: string; articles?: number; saved?: number }

    if (data.message === 'No unprocessed articles' || (data.articles ?? 0) === 0) break

    batches++
    totalEvents += data.saved ?? 0
    console.log(`   Batch ${batches}: processed ${data.articles} articles → ${data.saved} events saved`)
  }

  return { batches, events: totalEvents }
}

async function main() {
  console.log('📡 Fetching Myanmar news RSS feeds…')
  const { saved, skipped } = await scrapeFeeds()
  console.log(`   Saved: ${saved} new articles, skipped: ${skipped}`)

  if (saved === 0) {
    console.log('ℹ️  No new articles — nothing to process.')
  } else {
    console.log('🤖 Processing articles through Claude OSINT pipeline…')
    const { batches, events } = await processArticles()
    console.log(`   Completed ${batches} batch(es) → ${events} events saved to database`)
=======
 * Standalone ingestion script — fetches ACLED data and stores to DB.
 * Can be run locally: npm run ingest
 * Or triggered via: GET /api/cron/ingest
 */

import { PrismaClient } from '@prisma/client'
import { calculateConfidence, classifySourceReliability, deriveSeverity } from '../lib/confidence'
import { differenceInDays } from 'date-fns'

const prisma = new PrismaClient()

type AcledRow = {
  event_id_cnty: string
  event_date:    string
  event_type:    string
  sub_event_type:string
  admin1:        string
  location:      string
  latitude:      string
  longitude:     string
  source:        string
  notes:         string
  fatalities:    string
  actor1:        string
  actor2:        string
}

type EventType = 'ARMED_CONFLICT' | 'POLITICAL_UNREST' | 'INFRASTRUCTURE_DISRUPTION' | 'HUMANITARIAN_ALERT'

function mapEventType(acledType: string): EventType {
  const t = acledType.toLowerCase()
  if (t.includes('battle') || t.includes('explosions') || t.includes('remote violence')) return 'ARMED_CONFLICT'
  if (t.includes('violence against civilians')) return 'HUMANITARIAN_ALERT'
  if (t.includes('protest') || t.includes('riot')) return 'POLITICAL_UNREST'
  return 'INFRASTRUCTURE_DISRUPTION'
}

async function fetchAcled(key: string, email: string): Promise<AcledRow[]> {
  const url = new URL('https://api.acleddata.com/acled/read')
  url.searchParams.set('key', key)
  url.searchParams.set('email', email)
  url.searchParams.set('country', 'Myanmar')
  url.searchParams.set('limit', '500')
  url.searchParams.set('fields', [
    'event_id_cnty', 'event_date', 'event_type', 'sub_event_type',
    'admin1', 'location', 'latitude', 'longitude',
    'source', 'notes', 'fatalities', 'actor1', 'actor2',
  ].join('|'))

  const res  = await fetch(url.toString())
  const json = await res.json() as { data?: AcledRow[] }
  return json.data ?? []
}

async function processRow(row: AcledRow): Promise<'created' | 'skipped'> {
  const sourceId = row.event_id_cnty

  const rawExisting = await prisma.rawEvent.findUnique({ where: { sourceId } })
  if (rawExisting?.processed) return 'skipped'

  // Store raw event
  if (!rawExisting) {
    await prisma.rawEvent.create({
      data: { sourceId, source: 'ACLED', rawData: row as object },
    })
  }

  const eventDate   = new Date(row.event_date)
  const ageDays     = differenceInDays(new Date(), eventDate)
  const reliability = classifySourceReliability('ACLED')
  const confidence  = calculateConfidence(reliability, 2, ageDays)
  const severity    = deriveSeverity(Number(row.fatalities ?? 0), row.sub_event_type)
  const actors      = [row.actor1, row.actor2].filter(Boolean)

  await prisma.processedEvent.upsert({
    where: { id: sourceId },
    create: {
      id: sourceId,
      date:       eventDate,
      region:     row.admin1 || 'Unknown',
      adminArea:  row.location || null,
      type:       mapEventType(row.event_type),
      severity,
      summary:    (row.notes || '').slice(0, 500),
      source:     'ACLED',
      reliability,
      confidence,
      latitude:   row.latitude  ? Number(row.latitude)  : null,
      longitude:  row.longitude ? Number(row.longitude) : null,
      fatalities: Number(row.fatalities ?? 0),
      actors,
      tags:       [row.event_type, row.sub_event_type].filter(Boolean),
      rawEventId: sourceId,
    },
    update: { confidence, severity, updatedAt: new Date() },
  })

  await prisma.rawEvent.update({ where: { sourceId }, data: { processed: true } })
  return 'created'
}

async function main() {
  const key   = process.env.ACLED_API_KEY
  const email = process.env.ACLED_EMAIL

  if (!key || !email) {
    console.error('❌ ACLED_API_KEY and ACLED_EMAIL must be set in environment')
    process.exit(1)
  }

  console.log('📡 Fetching ACLED data for Myanmar…')
  const rows = await fetchAcled(key, email)
  console.log(`   Received ${rows.length} rows`)

  let created = 0, skipped = 0

  for (const row of rows) {
    const outcome = await processRow(row)
    outcome === 'created' ? created++ : skipped++
>>>>>>> 09b2b01ac2f052933cfb7e42cd731c579678812a
  }

  await prisma.updateLog.create({
    data: {
<<<<<<< HEAD
      change: `RSS ingestion: ${saved} new articles scraped`,
      reason: 'Manual npm run ingest',
      source: 'RSS feeds',
      metadata: { saved, skipped },
    },
  })

  console.log('✅ Done')
=======
      change:   `ACLED ingestion: ${created} new events, ${skipped} skipped`,
      reason:   'Manual ingestion run',
      source:   'ACLED API',
      metadata: { created, skipped, total: rows.length },
    },
  })

  console.log(`✅ Done — created: ${created}, skipped: ${skipped}`)
>>>>>>> 09b2b01ac2f052933cfb7e42cd731c579678812a
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
