import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { makePrisma } from './make-prisma'

const prisma = makePrisma()

// ── Region inference ────────────────────────────────────────────────────────
function inferRegion(lat: number, lng: number): string {
  if (lat > 23 && lng > 95.5 && lng < 98.5)                            return 'Kachin State'
  if (lat > 20 && lat <= 26 && lng >= 92 && lng < 94.5)                return 'Chin State'
  if (lat > 21 && lat <= 26 && lng >= 94.5 && lng < 96.5)              return 'Sagaing Region'
  if (lat > 19 && lat <= 22 && lng >= 95 && lng < 97)                  return 'Mandalay Region'
  if (lat > 18 && lat <= 21 && lng >= 93.5 && lng < 95.5)              return 'Magway Region'
  if (lat > 16 && lat <= 18 && lng >= 95.5 && lng < 96.5)              return 'Yangon Region'
  if (lat > 17 && lat <= 19 && lng >= 95 && lng < 97)                  return 'Bago Region'
  if (lat > 15.5 && lat <= 17.5 && lng >= 94 && lng < 96.5)            return 'Ayeyarwady Region'
  if (lat > 17 && lat <= 21.5 && lng >= 92 && lng < 95)                return 'Rakhine State'
  if (lat > 18.5 && lat <= 19.5 && lng >= 96.5 && lng < 97.5)         return 'Kayah State'
  if (lat > 15.5 && lat <= 18.5 && lng >= 97 && lng < 99)             return 'Kayin State'
  if (lat > 15 && lat <= 17.5 && lng >= 96.5 && lng < 98)             return 'Mon State'
  if (lat <= 16 && lng >= 97.5)                                         return 'Tanintharyi Region'
  if (lat > 18 && lng >= 96.5)                                          return 'Shan State'
  return 'Myanmar'
}

// ── Date / name parsing (mirrors parse-neatogeo.ts logic) ──────────────────
function extractDateISO(s: string): string | null {
  const full = s.match(/(\d{4})[\/\-](\d{2})[\/\-](\d{1,2})/)
  if (full) return `${full[1]}-${full[2]}-${full[3].padStart(2, '0')}`
  const partial = s.match(/(\d{4})[\/\-](\d{2})/)
  if (partial) return `${partial[1]}-${partial[2]}-01`
  const year = s.match(/\b(\d{4})\b/)
  if (year && parseInt(year[1]) >= 2020 && parseInt(year[1]) <= 2026) return `${year[1]}-06-01`
  return null
}

function parseName(name: string): { actorRaw: string; dateISO: string; location: string } | null {
  if (!name) return null
  const parts = name.split(' - ')
  for (let i = 0; i < parts.length; i++) {
    const d = extractDateISO(parts[i].trim())
    if (d) {
      return {
        actorRaw: parts.slice(0, i).join(' - ').trim() || 'Unknown',
        dateISO:  d,
        location: parts.slice(i + 1).join(' - ').trim(),
      }
    }
  }
  const dateMatch = name.match(/(\d{4}[\/\-]\d{2}(?:[\/\-]\d{1,2})?)/)
  if (dateMatch) {
    const d = extractDateISO(dateMatch[0])
    if (d) {
      const idx      = dateMatch.index!
      const actorRaw = name.slice(0, idx).replace(/[\s\-]+$/, '').trim() || 'Unknown'
      const location = name.slice(idx + dateMatch[0].length).replace(/^[\s\-]+/, '').trim()
      return { actorRaw, dateISO: d, location }
    }
  }
  return null
}

// ── Event type inference ────────────────────────────────────────────────────
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

// ── Main ────────────────────────────────────────────────────────────────────
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

  const records = []
  let skipped = 0

  for (const feat of features) {
    if (feat.geometry.type !== 'Point') { skipped++; continue }

    const [lng, lat] = feat.geometry.coordinates
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) { skipped++; continue }

    const parsed = parseName(feat.properties.name || '')
    if (!parsed) { skipped++; continue }

    const { actorRaw, dateISO, location } = parsed
    const date = new Date(`${dateISO}T12:00:00Z`)
    if (isNaN(date.getTime())) { skipped++; continue }

    const actorParts = actorRaw.split(/[\/\+]/).map((s: string) => s.trim()).filter(Boolean)
    const desc       = feat.properties.description || ''
    const urlMatch   = desc.match(/https?:\/\/[^\s<>"]+/)
    const sourceUrl  = urlMatch ? urlMatch[0] : 'https://neatogeo.com'

    const dedupHash = crypto
      .createHash('sha256')
      .update(`neatogeo-${lat.toFixed(5)}-${lng.toFixed(5)}-${dateISO}-${actorRaw}`)
      .digest('hex')
      .slice(0, 32)

    records.push({
      eventType:    inferEventType(actorRaw, location),
      date,
      region:       inferRegion(lat, lng),
      adminArea:    null as string | null,
      location:     location || actorRaw,
      lat,
      lng,
      actors:       actorParts,
      attackerActor: actorParts[0] || null as string | null,
      defenderActor: actorParts[1] || null as string | null,
      summary:      location ? `${actorRaw} — ${location}` : actorRaw,
      fatalities:   0,
      fatalitiesMin: 0,
      fatalitiesMax: 0,
      sourceUrl,
      sourceName:   'neatogeo',
      sourceType:   'GEOCONFIRMED',
      biasFlag:     'neutral',
      confidence:   0.85,
      dedupHash,
      isActiveIntelligence: true,
    })
  }

  console.log(`Parsed: ${records.length} records, skipped: ${skipped}`)

  // Batch insert in chunks of 200, skip duplicates
  const CHUNK = 200
  let inserted = 0
  let dupes    = 0

  for (let i = 0; i < records.length; i += CHUNK) {
    const chunk = records.slice(i, i + CHUNK)
    const result = await prisma.conflictEvent.createMany({
      data:          chunk,
      skipDuplicates: true,
    })
    inserted += result.count
    dupes    += chunk.length - result.count
    process.stdout.write(`\r  ${i + chunk.length}/${records.length} — inserted: ${inserted}, dupes skipped: ${dupes}`)
  }

  console.log(`\nDone. Inserted: ${inserted}, duplicates skipped: ${dupes}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
