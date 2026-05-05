import type { ConflictEventDTO, ConflictEventType } from './types'

interface NeatogeoFeature {
  type: 'Feature'
  properties: { name: string; description?: string; styleUrl?: string }
  geometry: { type: string; coordinates: number[] }
}

// Rough bounding-box lookup for Myanmar states/regions
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

// Finds the first date-like pattern anywhere in a string
function extractDateFromString(s: string): string | null {
  // YYYY/MM/DD or YYYY-MM-DD (allow 1-2 digit day)
  const full = s.match(/(\d{4})[\/\-](\d{2})[\/\-](\d{1,2})/)
  if (full) return `${full[1]}-${full[2]}-${full[3].padStart(2, '0')}`
  // YYYY/MM or YYYY-MM (may be followed by non-digit junk like "..", "??")
  const partial = s.match(/(\d{4})[\/\-](\d{2})/)
  if (partial) return `${partial[1]}-${partial[2]}-01`
  // Bare YYYY
  const year = s.match(/\b(\d{4})\b/)
  if (year && parseInt(year[1]) >= 2020 && parseInt(year[1]) <= 2026) return `${year[1]}-06-01`
  return null
}

// Split name into { actorRaw, date, location } regardless of separator style
function parseName(name: string): { actorRaw: string; date: string; location: string } | null {
  if (!name) return null

  // Try ' - ' split first and look for a date in any segment
  const parts = name.split(' - ')
  for (let i = 0; i < parts.length; i++) {
    const d = extractDateFromString(parts[i].trim())
    if (d) {
      return {
        actorRaw: parts.slice(0, i).join(' - ').trim() || 'Unknown',
        date:     d,
        location: parts.slice(i + 1).join(' - ').trim(),
      }
    }
  }

  // No date in any ' - ' segment — try finding a date anywhere in the full string
  // (handles "MNDAA- 2024/08/01 - Loc" or "PDF 2024/06/08 Loc")
  const dateMatch = name.match(/(\d{4}[\/\-]\d{2}(?:[\/\-]\d{1,2})?)/)
  if (dateMatch) {
    const d = extractDateFromString(dateMatch[0])
    if (d) {
      const idx      = dateMatch.index!
      const actorRaw = name.slice(0, idx).replace(/[\s\-]+$/, '').trim() || 'Unknown'
      const location = name.slice(idx + dateMatch[0].length).replace(/^[\s\-]+/, '').trim()
      return { actorRaw, date: d, location }
    }
  }

  return null // no date anywhere → skip (static position markers)
}

function inferEventType(actorRaw: string, location: string): ConflictEventType {
  const s = (actorRaw + ' ' + location).toLowerCase()
  if (s.includes('airstrike') || s.includes('air strike')) return 'AIRSTRIKE'
  if (s.includes('shelling') || s.includes('artillery'))   return 'ARTILLERY_SHELLING'
  if (s.includes('seized') || s.includes('captured'))      return 'SIEGE_SEIZED'
  if (s.includes('ambush'))                                 return 'AMBUSH'
  if (s.includes('burn') || s.includes('war crime'))       return 'CIVILIAN_HARM'
  if (s.includes('withdraw') || s.includes('retreat'))     return 'WITHDRAWAL'
  return 'CLASH'
}

export function parseNeatogeo(geojson: { features: NeatogeoFeature[] }): ConflictEventDTO[] {
  const results: ConflictEventDTO[] = []

  for (let i = 0; i < geojson.features.length; i++) {
    const feat = geojson.features[i]
    if (feat.geometry.type !== 'Point') continue

    const [lng, lat] = feat.geometry.coordinates
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) continue

    const parsed = parseName(feat.properties.name || '')
    if (!parsed) continue

    const { actorRaw, date, location } = parsed
    const actorParts = actorRaw.split(/[\/\+]/).map(s => s.trim()).filter(Boolean)

    const desc     = feat.properties.description || ''
    const urlMatch = desc.match(/https?:\/\/[^\s<>"]+/)

    results.push({
      id:            `neatogeo-${i}`,
      eventType:     inferEventType(actorRaw, location),
      date,
      region:        inferRegion(lat, lng),
      adminArea:     null,
      location:      location || actorRaw,
      lat,
      lng,
      actors:        actorParts,
      attackerActor: actorParts[0] || null,
      defenderActor: actorParts[1] || null,
      summary:       location ? `${actorRaw} — ${location}` : actorRaw,
      fatalities:    0,
      fatalitiesMin: 0,
      fatalitiesMax: 0,
      sourceUrl:     urlMatch ? urlMatch[0] : '',
      sourceName:    'neatogeo',
      biasFlag:      'neutral',
      confidence:    0.85,
    })
  }

  return results
}
