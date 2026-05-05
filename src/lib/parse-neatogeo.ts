import type { ConflictEventDTO, ConflictEventType } from './types'
import { point, booleanPointInPolygon } from '@turf/turf'

interface StateFeature {
  type: 'Feature'
  properties: { ST: string; ST_RG: string }
  geometry: { type: string; coordinates: unknown }
}

function normalizeStateName(st: string, stRg: string): string {
  const base = st.replace(/ \(.*\)$/, '').trim()
  if (base === 'Nay Pyi Taw') return 'Nay Pyi Taw'
  return `${base} ${stRg}`
}

interface NeatogeoFeature {
  type: 'Feature'
  properties: { name: string; description?: string; styleUrl?: string }
  geometry: { type: string; coordinates: number[] }
}

// ── Domain → readable source name ───────────────────────────────────────────
const DOMAIN_SOURCE: Record<string, string> = {
  'narinjara.com':              'Narinjara',
  'burmese.narinjara.com':      'Narinjara',
  'myanmar-now.org':            'Myanmar Now',
  'yktnews.com':                'YKT News',
  'bnionline.net':              'BNI Online',
  'kachinnews.com':             'Kachin News',
  'burmese.kachinnews.com':     'Kachin News',
  'irrawaddy.com':              'The Irrawaddy',
  'burma.irrawaddy.com':        'The Irrawaddy',
  'burmese.dvb.no':             'DVB',
  'dvb.no':                     'DVB',
  'eng.mizzima.com':            'Mizzima',
  'mizzima.com':                'Mizzima',
  'shannews.org':               'Shan News',
  'burmese.shannews.org':       'Shan News',
  'shwepheemyay.org':           'Shwe Phee Myay',
  'khrg.org':                   'KHRG',
  'kicnews.org':                'KIC News',
  'rfa.org':                    'RFA',
  'specialadvisorycouncil.org': 'SAC-M',
  'pct.com.mm':                 'PCT Myanmar',
  'tntynews.com':               'Tanintharyi News',
  'mohingamatters.com':         'Mohinga Matters',
  'x.com':                      'Twitter/X',
  'twitter.com':                'Twitter/X',
  't.me':                       'Telegram',
}

const SOCIAL = new Set(['x.com', 'twitter.com', 't.me', 'facebook.com'])

export function extractSource(description: string): { sourceName: string; sourceUrl: string } {
  const urls = (description.match(/https?:\/\/[^\s<>"']+/g) ?? [])
    .map(u => u.replace(/[?&]_x_tr[^&\s]*/g, '').replace(/-com\.translate\.goog/, '.com'))

  if (urls.length === 0) return { sourceName: 'Geoconfirmed', sourceUrl: '' }

  // Prefer first non-social URL, fall back to first URL
  const primary = urls.find(u => {
    try { return !SOCIAL.has(new URL(u).hostname.replace(/^www\./, '')) }
    catch { return false }
  }) ?? urls[0]

  let sourceName = 'Geoconfirmed'
  try {
    const host = new URL(primary).hostname.replace(/^www\./, '')
    sourceName = DOMAIN_SOURCE[host]
      ?? host.replace(/^burmese\./, '').replace(/\.(com|org|net|no|mm)$/, '')
  } catch { /* keep default */ }

  return { sourceName, sourceUrl: primary }
}

// ── Region inference ─────────────────────────────────────────────────────────
// Pass stateFeatures (from state-regions.geojson) for exact polygon lookup;
// falls back to bounding boxes when not provided.
export function inferRegion(lat: number, lng: number, stateFeatures?: StateFeature[]): string {
  if (stateFeatures) {
    const pt = point([lng, lat])
    for (const feat of stateFeatures) {
      if (booleanPointInPolygon(pt, feat as Parameters<typeof booleanPointInPolygon>[1])) {
        return normalizeStateName(feat.properties.ST, feat.properties.ST_RG)
      }
    }
  }
  // Bounding-box fallback
  if (lat > 23 && lng > 95.5 && lng < 98.5)                   return 'Kachin State'
  if (lat > 20 && lat <= 26 && lng >= 93.5 && lng < 94.5)      return 'Chin State'
  if (lat > 21 && lat <= 26 && lng >= 94.5 && lng < 96.5)      return 'Sagaing Region'
  if (lat > 19 && lat <= 22 && lng >= 95 && lng < 97)          return 'Mandalay Region'
  if (lat > 18 && lat <= 21 && lng >= 93.5 && lng < 95.5)      return 'Magway Region'
  if (lat > 16 && lat <= 18 && lng >= 95.5 && lng < 96.5)      return 'Yangon Region'
  if (lat > 17 && lat <= 19 && lng >= 95 && lng < 97)          return 'Bago Region'
  if (lat > 15.5 && lat <= 17.5 && lng >= 94 && lng < 96.5)    return 'Ayeyarwady Region'
  if (lat > 17 && lat <= 21.5 && lng >= 92 && lng < 95)        return 'Rakhine State'
  if (lat > 18.5 && lat <= 19.5 && lng >= 96.5 && lng < 97.5)  return 'Kayah State'
  if (lat > 15.5 && lat <= 18.5 && lng >= 97 && lng < 99)      return 'Kayin State'
  if (lat > 15 && lat <= 17.5 && lng >= 96.5 && lng < 98)      return 'Mon State'
  if (lat <= 16 && lng >= 97.5)                                 return 'Tanintharyi Region'
  if (lat > 18 && lng >= 96.5)                                  return 'Shan State'
  return 'Myanmar'
}

// ── Date extraction ──────────────────────────────────────────────────────────
export function extractDateISO(s: string): string | null {
  const full = s.match(/(\d{4})[\/\-](\d{2})[\/\-](\d{1,2})/)
  if (full) return `${full[1]}-${full[2]}-${full[3].padStart(2, '0')}`
  const partial = s.match(/(\d{4})[\/\-](\d{2})/)
  if (partial) return `${partial[1]}-${partial[2]}-01`
  const year = s.match(/\b(\d{4})\b/)
  if (year && parseInt(year[1]) >= 2020 && parseInt(year[1]) <= 2026) return `${year[1]}-06-01`
  return null
}

// ── Name parsing ─────────────────────────────────────────────────────────────
export function parseName(name: string): { actorRaw: string; date: string; location: string } | null {
  if (!name) return null

  const parts = name.split(' - ')
  for (let i = 0; i < parts.length; i++) {
    const d = extractDateISO(parts[i].trim())
    if (d) {
      return {
        actorRaw: parts.slice(0, i).join(' - ').trim() || 'Unknown',
        date:     d,
        location: parts.slice(i + 1).join(' - ').trim(),
      }
    }
  }

  const m = name.match(/(\d{4}[\/\-]\d{2}(?:[\/\-]\d{1,2})?)/)
  if (m) {
    const d = extractDateISO(m[0])
    if (d) {
      const idx = m.index!
      return {
        actorRaw: name.slice(0, idx).replace(/[\s\-]+$/, '').trim() || 'Unknown',
        date:     d,
        location: name.slice(idx + m[0].length).replace(/^[\s\-]+/, '').trim(),
      }
    }
  }

  return null
}

// ── Event type inference ─────────────────────────────────────────────────────
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

// ── Main parser ──────────────────────────────────────────────────────────────
export function parseNeatogeo(
  geojson: { features: NeatogeoFeature[] },
  stateFeatures?: StateFeature[],
): ConflictEventDTO[] {
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
    const { sourceName, sourceUrl } = extractSource(feat.properties.description || '')

    results.push({
      id:            `neatogeo-${i}`,
      eventType:     inferEventType(actorRaw, location),
      date,
      region:        inferRegion(lat, lng, stateFeatures),
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
      sourceUrl,
      sourceName,
      biasFlag:      'neutral',
      confidence:    0.85,
    })
  }

  return results
}
