/**
 * Rule-based processor for RSS articles — no Anthropic API key required.
 * Extracts event type, location, fatalities, and severity using regex heuristics,
 * then creates ProcessedEvent + EventArticle records.
 *
 * Run: npm run process:local
 */

import { PrismaClient } from '@prisma/client'
import { resolveCoordinates } from '../lib/geocoding'
import { calculateConfidence, classifySourceReliability } from '../lib/confidence'
import { differenceInDays } from 'date-fns'
import type { EventType } from '../lib/types'

const prisma = new PrismaClient()

// ── Event type classification ─────────────────────────────────────────────────

function classifyType(title: string, content: string): EventType {
  const t = `${title} ${content}`.toLowerCase()

  if (/airstrike|air.?strike|bombing|drone.?strike|artillery|mortar|shelling|shell|landmine|gyrocopter|paramotor|paraglider|ambush|offensive|clash|battle|killed|fatalities|troops overrun|gunfire|sniper|blow up|explode/.test(t))
    return 'ARMED_CONFLICT'

  if (/displaced|displacement|refugee|food shortage|hunger|humanitarian|aid block|aid access|civilian.{0,20}kill|hospital.{0,20}bomb|monastery.{0,20}bomb|village.{0,20}burn|burn.{0,20}village|idp|icp/.test(t))
    return 'HUMANITARIAN_ALERT'

  if (/road.{0,20}block|bridge.{0,20}destroy|power.{0,20}cut|supply.{0,20}chain|blockade|trade route|electricity|internet.{0,20}cut/.test(t))
    return 'INFRASTRUCTURE_DISRUPTION'

  return 'POLITICAL_UNREST'
}

// ── Fatality extraction ───────────────────────────────────────────────────────

function extractFatalities(text: string): number {
  const patterns = [
    /kills?\s+(\d+)\s*(?:civilians?|monks?|people|individuals?|residents?|children?|women|men)?/i,
    /(\d+)\s*(?:civilians?|monks?|people|individuals?|residents?|children?|women|men)?\s*(?:were\s+)?killed/i,
    /(\d+)\s+dead\b/i,
    /death toll[^.]{0,30}(\d+)/i,
    /(\d+)\s+fatalities/i,
    /killing\s+(\d+)/i,
    /(\d+)\s+(?:were\s+)?killed\b/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) {
      const n = parseInt(m[1])
      if (n > 0 && n < 300) return n
    }
  }
  return 0
}

// ── Location extraction ───────────────────────────────────────────────────────

interface Location { township: string; district: string; stateRegion: string }

const REGION_PATTERNS: [RegExp, string][] = [
  [/sagaing region/i,          'Sagaing Region'],
  [/rakhine state/i,           'Rakhine State'],
  [/kachin state/i,            'Kachin State'],
  [/northern shan|shan state/i,'Shan State'],
  [/kayah state|karenni state/i,'Kayah State'],
  [/kayin state|karen state/i, 'Kayin State'],
  [/chin state/i,              'Chin State'],
  [/mon state/i,               'Mon State'],
  [/mandalay region/i,         'Mandalay Region'],
  [/yangon region/i,           'Yangon Region'],
  [/bago region/i,             'Bago Region'],
  [/magway region/i,           'Magway Region'],
  [/ayeyarwady region/i,       'Ayeyarwady Region'],
  [/tanintharyi region/i,      'Tanintharyi Region'],
  [/naypyidaw/i,               'Naypyidaw Union Territory'],
  // bare state names
  [/\bsagaing\b/i,  'Sagaing Region'],
  [/\brakhine\b|\barakan\b/i, 'Rakhine State'],
  [/\bkachin\b/i,   'Kachin State'],
  [/\bshan\b/i,     'Shan State'],
  [/\bkarenni\b|\bkayah\b/i, 'Kayah State'],
  [/\bkaren\b|\bkayin\b/i,   'Kayin State'],
  [/\bchin\b/i,     'Chin State'],
  [/\bmandalay\b/i, 'Mandalay Region'],
  [/\byangon\b/i,   'Yangon Region'],
  [/\bbago\b/i,     'Bago Region'],
  [/\bmagway\b/i,   'Magway Region'],
  [/\bayeyarwady\b|\birrawaddy\b/i, 'Ayeyarwady Region'],
]

const TOWNSHIP_PATTERNS: [RegExp, string][] = [
  [/\btaze\b/i,          'Taze'],
  [/\bmonywa\b/i,        'Monywa'],
  [/\bshwebo\b/i,        'Shwebo'],
  [/\bhpakant\b/i,       'Hpakant'],
  [/\bmyitkyina\b/i,     'Myitkyina'],
  [/\bsittwe\b/i,        'Sittwe'],
  [/\bloikaw\b/i,        'Loikaw'],
  [/\blashio\b/i,        'Lashio'],
  [/\btaunggyi\b/i,      'Taunggyi'],
  [/\bmyawaddy\b/i,      'Myawaddy'],
  [/\bthandwe\b/i,       'Thandwe'],
  [/\bkyaukphyu\b/i,     'Kyaukphyu'],
  [/\bmaungdaw\b/i,      'Maungdaw'],
  [/\bbuthidaung\b/i,    'Buthidaung'],
  [/\bhakha\b/i,         'Hakha'],
  [/\bfalam\b/i,         'Falam'],
  [/\btoungoo\b/i,       'Toungoo'],
  [/\bpyay\b/i,          'Pyay'],
  [/\bpakokku\b/i,       'Pakokku'],
  [/\btilin\b/i,         'Tilin'],
  [/\bmahlaing\b/i,      'Mahlaing'],
  [/\bmyingyan\b/i,      'Myingyan'],
  [/\bsalingyi\b/i,      'Salingyi'],
  [/\bnyaung.u\b/i,      'Nyaung-U'],
  [/\bwaingmaw\b/i,      'Waingmaw'],
  [/\bbhamo\b/i,         'Bhamo'],
  [/\bkengtung\b/i,      'Kengtung'],
  [/\bhsipaw\b/i,        'Hsipaw'],
  [/\btanai\b/i,         'Tanai'],
  [/\bkale\b|\bkalay\b/i,'Kale'],
  [/\bkalewa\b/i,        'Kalewa'],
  [/\bmawlamyine\b|\bmoulmein\b/i, 'Mawlamyine'],
  [/\bpathein\b/i,       'Pathein'],
  [/\bhinthada\b/i,      'Hinthada'],
  [/\bkawkareik\b/i,     'Kawkareik'],
  [/\bdemoso\b/i,        'Demoso'],
]

function extractLocation(text: string): Location {
  let stateRegion = 'Myanmar'
  let township    = ''

  for (const [rx, region] of REGION_PATTERNS) {
    if (rx.test(text)) { stateRegion = region; break }
  }

  for (const [rx, twp] of TOWNSHIP_PATTERNS) {
    if (rx.test(text)) { township = twp; break }
  }

  return { township, district: township, stateRegion }
}

// ── Severity ──────────────────────────────────────────────────────────────────

function deriveSeverity(fatalities: number, type: EventType): number {
  if (type === 'POLITICAL_UNREST')      return fatalities > 0 ? 3 : 2
  if (type === 'INFRASTRUCTURE_DISRUPTION') return 2
  if (fatalities >= 15) return 5
  if (fatalities >= 8)  return 4
  if (fatalities >= 3)  return 3
  if (fatalities >= 1)  return 2
  return type === 'HUMANITARIAN_ALERT' ? 3 : 2
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const articles = await prisma.rawArticle.findMany({
    where:   { processed: false },
    orderBy: { publishedAt: 'desc' },
  })
  console.log(`📰 Processing ${articles.length} unprocessed articles…\n`)

  let created = 0, failed = 0

  for (const art of articles) {
    const text  = `${art.title}\n\n${art.content}`
    const type  = classifyType(art.title, art.content)
    const fatals = extractFatalities(text)
    const loc   = extractLocation(text)
    const geo   = resolveCoordinates(loc.township, loc.district, loc.stateRegion)
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
            id:          eventId,
            date:        art.publishedAt ?? art.ingestedAt,
            region:      loc.stateRegion,
            adminArea:   loc.township || null,
            type,
            severity,
            summary:     art.title.slice(0, 500),
            source:      art.sourceName,
            sourceUrl:   art.url,
            reliability,
            confidence,
            latitude:    geo.coords[1],
            longitude:   geo.coords[0],
            fatalities:  fatals,
            actors:      [],
            tags:        [type, loc.stateRegion].filter(Boolean),
            rawEventId:  null,
          },
          update: {},
        })

        await tx.eventArticle.upsert({
          where:  { processedEventId_rawArticleId: { processedEventId: eventId, rawArticleId: art.id } },
          create: { processedEventId: eventId, rawArticleId: art.id },
          update: {},
        })

        await tx.rawArticle.update({
          where: { id: art.id },
          data:  { processed: true },
        })
      })

      console.log(`  ✓ [${type.padEnd(26)}] ${art.title.slice(0, 65)}`)
      created++
    } catch (e) {
      console.error(`  ✗ ${art.title.slice(0, 60)}:`, e)
      failed++
    }
  }

  console.log(`\n✅ Created ${created} events, ${failed} failed`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
