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
import { fetchAllFeeds, TELEGRAM_SOURCE_NAMES } from '../lib/rss'
import { resolveCoordinates } from '../lib/geocoding'
import { calculateConfidence, classifySourceReliability } from '../lib/confidence'
import { differenceInDays } from 'date-fns'
import type { EventType } from '../lib/types'

const prisma = new PrismaClient()

async function scrapeFeeds(): Promise<{ saved: number; skipped: number }> {
  const items = await fetchAllFeeds()
  let saved = 0, skipped = 0

  for (const item of items) {
    if (!item.url || !item.title) { skipped++; continue }

    const exists = await prisma.rawArticle.findUnique({ where: { url: item.url } })
    if (exists) { skipped++; continue }

    // Telegram channels are Myanmar-specific by definition — skip keyword filter.
    // For RSS, check for Myanmar keywords or Myanmar Unicode script (U+1000–U+109F).
    const isTelegram = TELEGRAM_SOURCE_NAMES.has(item.sourceName)
    const text = `${item.title} ${item.content}`.toLowerCase()
    const hasMyanmarScript = /[က-႟]/.test(item.title + item.content)
    const relevant = isTelegram || hasMyanmarScript ||
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

// ── Rule-based classifier (no API key needed) ─────────────────────────────────

function classifyType(title: string, content: string): EventType {
  const t = `${title} ${content}`.toLowerCase()
  if (/airstrike|air.?strike|bombing|drone.?strike|artillery|mortar|shelling|shell|landmine|ambush|offensive|clash|battle|killed|fatalities|troops overrun|gunfire|sniper|blow up|explode/.test(t))
    return 'ARMED_CONFLICT'
  if (/displaced|displacement|refugee|food shortage|hunger|humanitarian|aid block|civilian.{0,20}kill|hospital.{0,20}bomb|village.{0,20}burn|idp/.test(t))
    return 'HUMANITARIAN_ALERT'
  if (/road.{0,20}block|bridge.{0,20}destroy|power.{0,20}cut|supply.{0,20}chain|blockade|trade route|electricity|internet.{0,20}cut/.test(t))
    return 'INFRASTRUCTURE_DISRUPTION'
  return 'POLITICAL_UNREST'
}

function extractFatalities(text: string): number {
  const patterns = [
    /kills?\s+(\d+)/i,
    /(\d+)\s*(?:civilians?|people|soldiers?|troops?)?\s*(?:were\s+)?killed/i,
    /(\d+)\s+dead\b/i,
    /death toll[^.]{0,30}(\d+)/i,
    /(\d+)\s+fatalities/i,
    /killing\s+(\d+)/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) { const n = parseInt(m[1]); if (n > 0 && n < 300) return n }
  }
  return 0
}

const REGION_PATTERNS: [RegExp, string][] = [
  [/sagaing region/i,'Sagaing Region'],[/rakhine state/i,'Rakhine State'],
  [/kachin state/i,'Kachin State'],[/northern shan|shan state/i,'Shan State'],
  [/kayah state|karenni state/i,'Kayah State'],[/kayin state|karen state/i,'Kayin State'],
  [/chin state/i,'Chin State'],[/mon state/i,'Mon State'],
  [/mandalay region/i,'Mandalay Region'],[/yangon region/i,'Yangon Region'],
  [/bago region/i,'Bago Region'],[/magway region/i,'Magway Region'],
  [/ayeyarwady region/i,'Ayeyarwady Region'],[/naypyidaw/i,'Naypyidaw Union Territory'],
  [/\bsagaing\b/i,'Sagaing Region'],[/\brakhine\b|\barakan\b/i,'Rakhine State'],
  [/\bkachin\b/i,'Kachin State'],[/\bshan\b/i,'Shan State'],
  [/\bkarenni\b|\bkayah\b/i,'Kayah State'],[/\bkaren\b|\bkayin\b/i,'Kayin State'],
  [/\bchin\b/i,'Chin State'],[/\bmandalay\b/i,'Mandalay Region'],
  [/\byangon\b/i,'Yangon Region'],[/\bbago\b/i,'Bago Region'],
  [/\bmagway\b/i,'Magway Region'],[/\bayeyarwady\b|\birrawaddy\b/i,'Ayeyarwady Region'],
]

const TOWNSHIP_PATTERNS: [RegExp, string][] = [
  [/\btaze\b/i,'Taze'],[/\bmonywa\b/i,'Monywa'],[/\bshwebo\b/i,'Shwebo'],
  [/\bhpakant\b/i,'Hpakant'],[/\bmyitkyina\b/i,'Myitkyina'],[/\bsittwe\b/i,'Sittwe'],
  [/\bloikaw\b/i,'Loikaw'],[/\blashio\b/i,'Lashio'],[/\btaunggyi\b/i,'Taunggyi'],
  [/\bmyawaddy\b/i,'Myawaddy'],[/\bthandwe\b/i,'Thandwe'],[/\bkyaukphyu\b/i,'Kyaukphyu'],
  [/\bmaungdaw\b/i,'Maungdaw'],[/\bbuthidaung\b/i,'Buthidaung'],[/\bhakha\b/i,'Hakha'],
  [/\bfalam\b/i,'Falam'],[/\btoungoo\b/i,'Toungoo'],[/\bpyay\b/i,'Pyay'],
  [/\bpakokku\b/i,'Pakokku'],[/\bmyingyan\b/i,'Myingyan'],[/\bwaingmaw\b/i,'Waingmaw'],
  [/\bbhamo\b/i,'Bhamo'],[/\bkengtung\b/i,'Kengtung'],[/\bhsipaw\b/i,'Hsipaw'],
  [/\btanai\b/i,'Tanai'],[/\bkale\b|\bkalay\b/i,'Kale'],[/\bkalewa\b/i,'Kalewa'],
  [/\bmawlamyine\b|\bmoulmein\b/i,'Mawlamyine'],[/\bpathein\b/i,'Pathein'],
  [/\bhinthada\b/i,'Hinthada'],[/\bkawkareik\b/i,'Kawkareik'],[/\bdemoso\b/i,'Demoso'],
]

function extractLocation(text: string): { township: string; stateRegion: string } {
  let stateRegion = 'Myanmar', township = ''
  for (const [rx, r] of REGION_PATTERNS)   { if (rx.test(text)) { stateRegion = r; break } }
  for (const [rx, t] of TOWNSHIP_PATTERNS) { if (rx.test(text)) { township    = t; break } }
  return { township, stateRegion }
}

function deriveSeverity(fatalities: number, type: EventType): number {
  if (type === 'POLITICAL_UNREST')          return fatalities > 0 ? 3 : 2
  if (type === 'INFRASTRUCTURE_DISRUPTION') return 2
  if (fatalities >= 15) return 5
  if (fatalities >= 8)  return 4
  if (fatalities >= 3)  return 3
  if (fatalities >= 1)  return 2
  return type === 'HUMANITARIAN_ALERT' ? 3 : 2
}

async function processArticles(): Promise<{ processed: number; saved: number }> {
  const articles = await prisma.rawArticle.findMany({
    where:   { processed: false },
    orderBy: { publishedAt: 'desc' },
  })

  if (articles.length === 0) return { processed: 0, saved: 0 }

  let saved = 0
  for (const art of articles) {
    const text        = `${art.title}\n\n${art.content}`
    const type        = classifyType(art.title, art.content)
    const fatals      = extractFatalities(text)
    const loc         = extractLocation(text)
    const geo         = resolveCoordinates(loc.township, loc.township, loc.stateRegion)
    const reliability = classifySourceReliability(art.sourceName)
    const ageDays     = differenceInDays(new Date(), art.publishedAt ?? art.ingestedAt)
    const confidence  = calculateConfidence(reliability, 1, ageDays)
    const severity    = deriveSeverity(fatals, type)
    const eventId     = `rss-${art.id}`

    try {
      await prisma.$transaction(async tx => {
        await tx.processedEvent.upsert({
          where:  { id: eventId },
          create: {
            id: eventId, date: art.publishedAt ?? art.ingestedAt,
            region: loc.stateRegion, adminArea: loc.township || null,
            type, severity, summary: art.title.slice(0, 500),
            source: art.sourceName, sourceUrl: art.url,
            reliability, confidence,
            latitude: geo.coords[1], longitude: geo.coords[0],
            fatalities: fatals, actors: [], tags: [type, loc.stateRegion].filter(Boolean),
            rawEventId: null,
          },
          update: {},
        })
        await tx.eventArticle.upsert({
          where:  { processedEventId_rawArticleId: { processedEventId: eventId, rawArticleId: art.id } },
          create: { processedEventId: eventId, rawArticleId: art.id },
          update: {},
        })
        await tx.rawArticle.update({ where: { id: art.id }, data: { processed: true } })
      })
      saved++
    } catch { /* skip duplicates */ }
  }

  return { processed: articles.length, saved }
}

async function main() {
  console.log('📡 Fetching Myanmar news RSS feeds…')
  const { saved, skipped } = await scrapeFeeds()
  console.log(`   Saved: ${saved} new articles, skipped: ${skipped}`)

  console.log('🤖 Processing unprocessed articles…')
  const { processed, saved: events } = await processArticles()
  if (processed === 0) {
    console.log('ℹ️  No unprocessed articles.')
  } else {
    console.log(`   Processed ${processed} articles → ${events} events saved`)
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
