// ─── Haversine distance ───────────────────────────────────────────────────────

const EARTH_KM = 6371

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * Returns the great-circle distance in kilometres between two [lng, lat] points.
 */
export function haversineKm(
  a: [number, number],
  b: [number, number],
): number {
  const [lng1, lat1] = a
  const [lng2, lat2] = b
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h))
}

// ─── Text similarity ──────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'of', 'for',
  'by', 'with', 'from', 'was', 'were', 'is', 'are', 'has', 'have', 'had',
  'be', 'been', 'that', 'this', 'which', 'who', 'said', 'according',
  'reported', 'sources', 'local', 'area', 'region', 'state',
])

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2 && !STOP_WORDS.has(t)),
  )
}

/**
 * Jaccard similarity coefficient on word sets.
 * Returns 0–1 (1 = identical word sets).
 */
export function jaccardSimilarity(a: string, b: string): number {
  const setA = tokenize(a)
  const setB = tokenize(b)
  if (setA.size === 0 && setB.size === 0) return 1
  if (setA.size === 0 || setB.size === 0) return 0

  let intersection = 0
  for (const word of setA) {
    if (setB.has(word)) intersection++
  }
  const union = setA.size + setB.size - intersection
  return intersection / union
}

// ─── Duplicate detector ───────────────────────────────────────────────────────

export interface DupCandidate {
  id:        string
  latitude:  number | null
  longitude: number | null
  date:      Date
  summary:   string
}

export interface DupMatch {
  id:         string
  distanceKm: number
  hoursApart: number
  similarity: number
}

const DISTANCE_THRESHOLD_KM  = 10   // events within 10 km
const TIME_THRESHOLD_HOURS   = 48   // events within 48 hours
const SIMILARITY_THRESHOLD   = 0.25 // 25% word overlap

/**
 * Given a new event and a list of DB candidates, returns the best duplicate
 * match (or null if none qualify).
 *
 * A match requires ALL three conditions:
 *   - distance < DISTANCE_THRESHOLD_KM
 *   - time gap  < TIME_THRESHOLD_HOURS
 *   - Jaccard   > SIMILARITY_THRESHOLD
 */
export function findBestDuplicate(
  newEvent: { coords: [number, number]; date: Date; summary: string },
  candidates: DupCandidate[],
): DupMatch | null {
  let best: DupMatch | null = null

  for (const c of candidates) {
    if (!c.latitude || !c.longitude) continue

    const distKm = haversineKm(newEvent.coords, [c.longitude, c.latitude])
    if (distKm > DISTANCE_THRESHOLD_KM) continue

    const hoursApart =
      Math.abs(newEvent.date.getTime() - c.date.getTime()) / 3_600_000
    if (hoursApart > TIME_THRESHOLD_HOURS) continue

    const sim = jaccardSimilarity(newEvent.summary, c.summary)
    if (sim < SIMILARITY_THRESHOLD) continue

    // Score: lower distance + lower time gap + higher similarity = better match
    const score = distKm / DISTANCE_THRESHOLD_KM +
                  hoursApart / TIME_THRESHOLD_HOURS -
                  sim
    if (!best || score < (
      best.distanceKm / DISTANCE_THRESHOLD_KM +
      best.hoursApart / TIME_THRESHOLD_HOURS -
      best.similarity
    )) {
      best = { id: c.id, distanceKm: distKm, hoursApart, similarity: sim }
    }
  }

  return best
}
