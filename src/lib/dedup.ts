import { createHash } from 'crypto'

const SIX_HOURS_MS = 6 * 60 * 60 * 1000

/**
 * Generates a deduplication hash for a conflict event.
 *
 * Two events with the same actor set, location, event type, and 6-hour
 * time bucket produce the same hash and are treated as duplicates.
 * The 6-hour window absorbs reporting lags across different outlets.
 */
export function buildDedupHash(params: {
  actors:    string[]
  region:    string
  adminArea: string | null
  eventType: string
  date:      Date
}): string {
  const { actors, region, adminArea, eventType, date } = params

  const actorKey    = [...actors].sort().join('|').toLowerCase()
  const locationKey = `${region.toLowerCase()}|${(adminArea ?? '').toLowerCase()}`
  const typeKey     = eventType.toLowerCase()
  const bucket      = Math.floor(date.getTime() / SIX_HOURS_MS)

  const raw = `${actorKey}::${locationKey}::${typeKey}::${bucket}`
  return createHash('sha256').update(raw).digest('hex')
}
