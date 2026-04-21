import type { SourceReliability } from './types'

const RELIABILITY_WEIGHT: Record<SourceReliability, number> = {
  HIGH:   0.90,
  MEDIUM: 0.65,
  LOW:    0.40,
}

// Sources ranked by reliability for Myanmar conflict data
const SOURCE_RELIABILITY_MAP: Record<string, SourceReliability> = {
  acled:          'HIGH',
  'acled api':    'HIGH',
  irrawaddy:      'HIGH',
  'the irrawaddy': 'HIGH',
  'dvb news':     'HIGH',
  dvb:            'HIGH',
  'myanmar now':  'HIGH',
  'myanmar now news': 'HIGH',
  rfa:            'HIGH',
  'radio free asia': 'HIGH',
  'khit thit':    'MEDIUM',
  'mizzima':      'MEDIUM',
  '7day':         'MEDIUM',
  'eleven media': 'MEDIUM',
  'gnlm':         'LOW',   // state media — government narrative, not neutral
  'global new light of myanmar': 'LOW',
  myawady:        'LOW',
  'social media': 'LOW',
  twitter:        'LOW',
  telegram:       'LOW',
}

export function classifySourceReliability(source: string): SourceReliability {
  const key = source.toLowerCase().trim()
  for (const [pattern, level] of Object.entries(SOURCE_RELIABILITY_MAP)) {
    if (key.includes(pattern)) return level
  }
  return 'MEDIUM'
}

/**
 * Composite confidence score (0–1) weighted across three dimensions:
 *  - Source reliability   50%
 *  - Corroboration        30%  (log-scaled from report count)
 *  - Recency              20%  (exponential decay, 30-day half-life)
 */
export function calculateConfidence(
  sourceReliability: SourceReliability,
  reportCount: number,
  daysSinceEvent: number,
): number {
  const reliabilityScore = RELIABILITY_WEIGHT[sourceReliability]

  // log₁₀ scale: 1 report → 0, 10 → 1.0
  const corroborationScore = Math.min(1, Math.log10(Math.max(reportCount, 1) + 1))

  // exponential decay: full confidence on day 0, ~50% at day 30
  const recencyScore = Math.exp(-daysSinceEvent / 43.3)   // ln(2)/30d ≈ 1/43.3

  const raw = reliabilityScore * 0.50 + corroborationScore * 0.30 + recencyScore * 0.20

  return Math.round(raw * 100) / 100
}

/**
 * Severity heuristic from ACLED fatality and event-type data.
 * Returns 1–5.
 */
export function deriveSeverity(fatalities: number, eventSubtype: string): number {
  const sub = eventSubtype.toLowerCase()
  let base = 1
  if (sub.includes('airstrike') || sub.includes('shelling'))   base = 4
  else if (sub.includes('battle'))                              base = 3
  else if (sub.includes('explosion'))                           base = 3
  else if (sub.includes('protest') || sub.includes('riot'))     base = 2
  else if (sub.includes('displacement'))                        base = 2

  if (fatalities >= 50) return Math.min(5, base + 2)
  if (fatalities >= 10) return Math.min(5, base + 1)
  if (fatalities >= 1)  return Math.min(5, base)
  return base
}
