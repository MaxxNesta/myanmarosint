/**
 * Import geo-confirmed conflict events from neatogeo_Myanmar War Map.geojson.
 * Each event links to a RawArticle with the ACTUAL source URL from the feature
 * description (e.g. Narinjara, DVB, Shan News, Twitter/X) so the map shows
 * real, clickable source links instead of a generic NeatoGeo entry.
 *
 * Re-run safe: deletes existing NeatoGeo-sourced events by dedupHash before
 * inserting, so source links update on re-import.
 *
 * Run: tsx --env-file=.env.local src/scripts/ingest-neatogeo.ts
 */
import * as fs     from 'fs'
import * as path   from 'path'
import * as crypto from 'crypto'
import type { ConflictEventType } from '@prisma/client'
import { makePrisma }                   from './make-prisma'
import { parseNeatogeo }                from '../lib/parse-neatogeo'
import { normalizeRegion, normalizeActors } from '../lib/normalizer'

const prisma      = makePrisma()
const INTEL_START = new Date('2023-01-01T00:00:00Z')
const CHUNK       = 50

// Map NeatoGeo extended types → Prisma ConflictEventType enum
const TYPE_REMAP: Record<string, ConflictEventType> = {
  AMBUSH:             'CLASH',
  CIVILIAN_HARM:      'HUMANITARIAN_CRISIS',
  WITHDRAWAL:         'CLASH',
  CEASEFIRE:          'POLITICAL_DEVELOPMENT',
  ARMED_MOBILIZATION: 'CLASH',
}
const remapType = (t: string): ConflictEventType =>
  (TYPE_REMAP[t] ?? t) as ConflictEventType

// Deterministic dedupHash for NeatoGeo events
function neatoHash(lat: number | null, lng: number | null, date: string, actors: string[]): string {
  return crypto
    .createHash('sha256')
    .update(`neatogeo-${lat?.toFixed(5)}-${lng?.toFixed(5)}-${date}-${actors.join('+')}`)
    .digest('hex')
    .slice(0, 32)
}

// RawArticle cache: url → id  (avoids redundant DB lookups for repeated URLs)
const articleCache = new Map<string, string>()

async function getOrCreateArticle(
  sourceUrl:   string,
  sourceName:  string,
  publishedAt: Date,
  fallbackId:  string,
): Promise<string> {
  if (!sourceUrl) return fallbackId

  if (articleCache.has(sourceUrl)) return articleCache.get(sourceUrl)!

  // Try existing (could have been ingested by RSS pipeline too)
  const existing = await prisma.rawArticle.findUnique({ where: { url: sourceUrl } })
  if (existing) {
    articleCache.set(sourceUrl, existing.id)
    return existing.id
  }

  try {
    const created = await prisma.rawArticle.create({
      data: {
        url:         sourceUrl,
        channelName: sourceName,
        title:       `NeatoGeo event — ${sourceName}`,
        content:     '',
        sourceType:  'EXTERNAL',
        publishedAt,
      },
    })
    articleCache.set(sourceUrl, created.id)
    return created.id
  } catch {
    // Race condition or URL too long — fall back
    return fallbackId
  }
}

async function main() {
  // ── Load files ────────────────────────────────────────────────────────────────
  const geojsonPath = path.join(process.cwd(), 'neatogeo_Myanmar War Map.geojson')
  console.log('Reading:', geojsonPath)
  const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'))

  const stateGeoPath = path.join(process.cwd(), 'map data/dist/geojson/state-regions.geojson')
  let stateFeatures: unknown[] | undefined
  if (fs.existsSync(stateGeoPath)) {
    stateFeatures = JSON.parse(fs.readFileSync(stateGeoPath, 'utf8')).features
    console.log('Loaded state polygons')
  }

  const parsed = parseNeatogeo(geojson, stateFeatures as Parameters<typeof parseNeatogeo>[1])
  console.log(`Parsed ${parsed.length} valid features from ${geojson.features.length} total`)

  // ── Fallback RawArticle for events without a source URL ───────────────────────
  let fallback = await prisma.rawArticle.findFirst({ where: { channelName: 'NeatoGeo', url: null } })
  if (!fallback) {
    fallback = await prisma.rawArticle.create({
      data: {
        url:         null,
        channelName: 'NeatoGeo',
        title:       'NeatoGeo Myanmar War Map — Geo-confirmed Events',
        content:     'Geo-confirmed conflict events from NeatoGeo Myanmar War Map.',
        sourceType:  'EXTERNAL',
        publishedAt: new Date('2024-01-01'),
      },
    })
  }
  const fallbackId = fallback.id
  console.log('Fallback RawArticle:', fallbackId)

  // ── Collect all dedupHashes to delete existing records cleanly ────────────────
  const allHashes = parsed
    .map(ev => neatoHash(ev.lat, ev.lng, ev.date, ev.actors))
    .filter(Boolean)

  // Delete in chunks (IN clause has limits)
  const HASH_CHUNK = 500
  let deleted = 0
  for (let i = 0; i < allHashes.length; i += HASH_CHUNK) {
    const batch = allHashes.slice(i, i + HASH_CHUNK)
    const result = await prisma.conflictEvent.deleteMany({
      where: { dedupHash: { in: batch } },
    })
    deleted += result.count
  }
  if (deleted > 0) console.log(`Deleted ${deleted} previous NeatoGeo events`)

  // ── Insert ────────────────────────────────────────────────────────────────────
  let inserted = 0, skipped = 0

  for (let i = 0; i < parsed.length; i += CHUNK) {
    const chunk = parsed.slice(i, i + CHUNK)

    for (const ev of chunk) {
      const region = normalizeRegion(ev.region)
      if (region === 'Myanmar') { skipped++; continue }

      const eventType  = remapType(ev.eventType)
      const actors     = normalizeActors(ev.actors)
      const evDate     = new Date(`${ev.date}T12:00:00Z`)
      if (isNaN(evDate.getTime())) { skipped++; continue }

      const dedupHash = neatoHash(ev.lat, ev.lng, ev.date, ev.actors)
      const articleId = await getOrCreateArticle(ev.sourceUrl, ev.sourceName, evDate, fallbackId)

      try {
        const conflict = await prisma.conflictEvent.upsert({
          where:  { dedupHash },
          create: {
            rawArticleId:  articleId,
            eventType,
            date:          evDate,
            region,
            adminArea:     ev.adminArea,
            location:      ev.location,
            lat:           ev.lat,
            lng:           ev.lng,
            summary:       ev.summary.slice(0, 800),
            fatalities:    ev.fatalities,
            fatalitiesMin: ev.fatalitiesMin,
            fatalitiesMax: ev.fatalitiesMax,
            biasFlag:      ev.biasFlag,
            dedupHash,
          },
          update: {
            rawArticleId: articleId,   // update source link on re-import
            lat:          ev.lat,
            lng:          ev.lng,
            region,
          },
        })

        await prisma.analysedEvent.upsert({
          where:  { conflictEventId: conflict.id },
          create: {
            conflictEventId:      conflict.id,
            attackerActor:        actors[0] ?? null,
            defenderActor:        actors[1] ?? null,
            actors,
            confidence:           0.85,
            summary:              ev.summary.slice(0, 800),
            isActiveIntelligence: evDate >= INTEL_START,
          },
          update: {},
        })

        inserted++
      } catch (err) {
        skipped++
        if (skipped <= 5) console.error('  err:', String(err).slice(0, 100))
      }
    }

    process.stdout.write(`\r  ${Math.min(i + CHUNK, parsed.length)}/${parsed.length} — inserted: ${inserted}, skipped: ${skipped}`)
  }

  console.log(`\n\n✓ Done — inserted: ${inserted}, skipped: ${skipped}`)

  // Source breakdown
  const breakdown = await prisma.rawArticle.groupBy({
    by:      ['channelName'],
    where:   { conflictEvents: { some: {} } },
    _count:  { channelName: true },
    orderBy: { _count: { channelName: 'desc' } },
    take:    15,
  })
  console.log('\nTop source channels for NeatoGeo events:')
  for (const r of breakdown) {
    console.log(`  ${r.channelName.padEnd(28)} ${r._count.channelName}`)
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
