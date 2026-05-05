import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { makePrisma } from './make-prisma'
import { extractSource, inferRegion, parseName } from '../lib/parse-neatogeo'

const prisma = makePrisma()

// Load actual state/region polygon boundaries for accurate region lookup
const stateGeoJSON = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'map data/dist/geojson/state-regions.geojson'), 'utf8')
)
const stateFeatures = stateGeoJSON.features

type EventType = 'CLASH' | 'AIRSTRIKE' | 'ARTILLERY_SHELLING' | 'AMBUSH' |
  'SIEGE_SEIZED' | 'RECAPTURED' | 'WITHDRAWAL' | 'CEASEFIRE' |
  'ARMED_MOBILIZATION' | 'CIVILIAN_HARM' | 'DISPLACEMENT' |
  'HUMANITARIAN_CRISIS' | 'POLITICAL_DEVELOPMENT'

function inferEventType(actorRaw: string, location: string): EventType {
  const s = (actorRaw + ' ' + location).toLowerCase()
  if (s.includes('airstrike') || s.includes('air strike')) return 'AIRSTRIKE'
  if (s.includes('shelling') || s.includes('artillery'))   return 'ARTILLERY_SHELLING'
  if (s.includes('seized') || s.includes('captured'))      return 'SIEGE_SEIZED'
  if (s.includes('ambush'))                                 return 'AMBUSH'
  if (s.includes('burn') || s.includes('war crime'))       return 'CIVILIAN_HARM'
  if (s.includes('withdraw') || s.includes('retreat'))     return 'WITHDRAWAL'
  return 'CLASH'
}

async function main() {
  const geojsonPath = path.join(process.cwd(), 'neatogeo_Myanmar War Map.geojson')
  console.log('Reading:', geojsonPath)
  const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'))
  const features = geojson.features as Array<{
    type: string
    properties: { name: string; description?: string }
    geometry: { type: string; coordinates: number[] }
  }>

  console.log(`Total features: ${features.length}`)

  // Delete previous import so re-runs cleanly replace with updated source names
  const deleted = await prisma.conflictEvent.deleteMany({ where: { sourceType: 'GEOCONFIRMED' } })
  console.log(`Deleted ${deleted.count} previous GEOCONFIRMED records`)

  const records = []
  let skipped = 0

  for (const feat of features) {
    if (feat.geometry.type !== 'Point') { skipped++; continue }

    const [lng, lat] = feat.geometry.coordinates
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) { skipped++; continue }

    const parsed = parseName(feat.properties.name || '')
    if (!parsed) { skipped++; continue }

    const { actorRaw, date: dateISO, location } = parsed
    const date = new Date(`${dateISO}T12:00:00Z`)
    if (isNaN(date.getTime())) { skipped++; continue }

    const actorParts = actorRaw.split(/[\/\+]/).map((s: string) => s.trim()).filter(Boolean)
    const { sourceName, sourceUrl } = extractSource(feat.properties.description || '')

    const dedupHash = crypto
      .createHash('sha256')
      .update(`neatogeo-${lat.toFixed(5)}-${lng.toFixed(5)}-${dateISO}-${actorRaw}`)
      .digest('hex')
      .slice(0, 32)

    records.push({
      eventType:          inferEventType(actorRaw, location),
      date,
      region:             inferRegion(lat, lng, stateFeatures),
      adminArea:          null as string | null,
      location:           location || actorRaw,
      lat,
      lng,
      actors:             actorParts,
      attackerActor:      actorParts[0] || null as string | null,
      defenderActor:      actorParts[1] || null as string | null,
      summary:            location ? `${actorRaw} — ${location}` : actorRaw,
      fatalities:         0,
      fatalitiesMin:      0,
      fatalitiesMax:      0,
      sourceUrl,
      sourceName,
      sourceType:         'GEOCONFIRMED',
      biasFlag:           'neutral',
      confidence:         0.85,
      dedupHash,
      isActiveIntelligence: true,
    })
  }

  console.log(`Parsed: ${records.length} records, skipped: ${skipped}`)

  // Preview source distribution
  const srcCount: Record<string, number> = {}
  records.forEach(r => { srcCount[r.sourceName] = (srcCount[r.sourceName] || 0) + 1 })
  const topSources = Object.entries(srcCount).sort((a, b) => b[1] - a[1]).slice(0, 10)
  console.log('Source breakdown:')
  topSources.forEach(([s, c]) => console.log(`  ${c.toString().padStart(4)}  ${s}`))

  // Batch insert
  const CHUNK = 200
  let inserted = 0
  let dupes    = 0

  for (let i = 0; i < records.length; i += CHUNK) {
    const chunk = records.slice(i, i + CHUNK)
    const result = await prisma.conflictEvent.createMany({
      data:           chunk,
      skipDuplicates: true,
    })
    inserted += result.count
    dupes    += chunk.length - result.count
    process.stdout.write(`\r  ${Math.min(i + CHUNK, records.length)}/${records.length} — inserted: ${inserted}, dupes: ${dupes}`)
  }

  console.log(`\nDone. Inserted: ${inserted}, duplicates skipped: ${dupes}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
