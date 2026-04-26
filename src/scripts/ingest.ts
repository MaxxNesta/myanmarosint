/**
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
  }

  await prisma.updateLog.create({
    data: {
      change:   `RSS ingestion: ${saved} new articles scraped`,
      reason:   'Manual npm run ingest',
      source:   'RSS feeds',
      metadata: { saved, skipped },
    },
  })

  console.log('✅ Done')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
