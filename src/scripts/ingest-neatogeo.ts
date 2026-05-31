/**
 * Import geo-confirmed conflict events from neatogeo_Myanmar War Map.geojson
 * into ConflictEvent + AnalysedEvent tables.
 *
 * Uses one synthetic RawArticle (channelName='NeatoGeo') shared by all events.
 * Safe to re-run — deletes previous NeatoGeo events first.
 *
 * Run: tsx --env-file=.env.local src/scripts/ingest-neatogeo.ts
 */
import * as fs   from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import type { ConflictEventType } from '@prisma/client'
import { makePrisma }       from './make-prisma'
import { parseNeatogeo }    from '../lib/parse-neatogeo'
import { normalizeRegion, normalizeActors } from '../lib/normalizer'

const prisma = makePrisma()

const INTEL_START = new Date('2023-01-01T00:00:00Z')
const CHUNK = 100

// Map NeatoGeo extended types → Prisma enum (which lacks AMBUSH, CIVILIAN_HARM, etc.)
const TYPE_REMAP: Record<string, ConflictEventType> = {
  AMBUSH:             'CLASH',
  CIVILIAN_HARM:      'HUMANITARIAN_CRISIS',
  WITHDRAWAL:         'CLASH',
  CEASEFIRE:          'POLITICAL_DEVELOPMENT',
  ARMED_MOBILIZATION: 'CLASH',
}

function remapType(t: string): ConflictEventType {
  return (TYPE_REMAP[t] ?? t) as ConflictEventType
}

async function main() {
  // ── Load GeoJSON ────────────────────────────────────────────────────────────
  const geojsonPath = path.join(process.cwd(), 'neatogeo_Myanmar War Map.geojson')
  console.log('Reading:', geojsonPath)
  const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'))

  // State polygon file for accurate region lookup
  const stateGeoPath = path.join(process.cwd(), 'map data/dist/geojson/state-regions.geojson')
  let stateFeatures: unknown[] | undefined
  if (fs.existsSync(stateGeoPath)) {
    stateFeatures = JSON.parse(fs.readFileSync(stateGeoPath, 'utf8')).features
    console.log('Loaded state polygons for region lookup')
  } else {
    console.warn('state-regions.geojson not found — using bounding-box fallback')
  }

  const parsed = parseNeatogeo(geojson, stateFeatures as Parameters<typeof parseNeatogeo>[1])
  console.log(`Parsed ${parsed.length} valid Point features from ${geojson.features.length} total`)

  // ── Upsert synthetic NeatoGeo RawArticle ────────────────────────────────────
  let neatoArticle = await prisma.rawArticle.findFirst({ where: { channelName: 'NeatoGeo' } })
  if (!neatoArticle) {
    neatoArticle = await prisma.rawArticle.create({
      data: {
        url:         null,
        channelName: 'NeatoGeo',
        title:       'NeatoGeo Myanmar War Map — Geo-confirmed Events',
        content:     'External geo-confirmed conflict events from NeatoGeo Myanmar War Map.',
        sourceType:  'EXTERNAL',
        publishedAt: new Date('2024-01-01'),
      },
    })
    console.log('Created NeatoGeo synthetic RawArticle:', neatoArticle.id)
  } else {
    console.log('Reusing NeatoGeo RawArticle:', neatoArticle.id)
  }

  // ── Delete previous NeatoGeo ConflictEvents ──────────────────────────────────
  const existing = await prisma.conflictEvent.findMany({
    where:  { rawArticleId: neatoArticle.id },
    select: { id: true },
  })
  if (existing.length > 0) {
    await prisma.conflictEvent.deleteMany({ where: { rawArticleId: neatoArticle.id } })
    console.log(`Deleted ${existing.length} previous NeatoGeo events`)
  }

  // ── Build insert batches ─────────────────────────────────────────────────────
  let inserted = 0, skipped = 0

  for (let i = 0; i < parsed.length; i += CHUNK) {
    const chunk = parsed.slice(i, i + CHUNK)

    for (const ev of chunk) {
      const region = normalizeRegion(ev.region)
      if (region === 'Myanmar') { skipped++; continue }   // no useful location

      const eventType  = remapType(ev.eventType)
      const actors     = normalizeActors(ev.actors)
      const evDate     = new Date(`${ev.date}T12:00:00Z`)
      if (isNaN(evDate.getTime())) { skipped++; continue }

      const dedupHash = crypto
        .createHash('sha256')
        .update(`neatogeo-${ev.lat?.toFixed(5)}-${ev.lng?.toFixed(5)}-${ev.date}-${ev.actors.join('+')}`)
        .digest('hex')
        .slice(0, 32)

      try {
        const conflict = await prisma.conflictEvent.upsert({
          where:  { dedupHash },
          create: {
            rawArticleId:  neatoArticle!.id,
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
            lat:    ev.lat,
            lng:    ev.lng,
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
        if (skipped <= 5) console.error('  insert error:', String(err).slice(0, 120))
      }
    }

    process.stdout.write(`\r  ${Math.min(i + CHUNK, parsed.length)}/${parsed.length} — inserted: ${inserted}, skipped: ${skipped}`)
  }

  console.log(`\n\n✓ NeatoGeo import complete — inserted: ${inserted}, skipped: ${skipped}`)

  // Summary by year
  const byYear = await prisma.conflictEvent.groupBy({
    by:      ['date'],
    where:   { rawArticleId: neatoArticle!.id },
    _count:  { date: true },
  })
  const yearCounts: Record<string, number> = {}
  for (const r of byYear) {
    const y = new Date(r.date).getFullYear().toString()
    yearCounts[y] = (yearCounts[y] || 0) + r._count.date
  }
  console.log('\nEvents by year:', JSON.stringify(yearCounts, null, 2))
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
