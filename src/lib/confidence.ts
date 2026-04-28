import type { SourceReliability } from './types'
import type { CoordPrecision } from './geocoding'

// ─── Static base reliability by source ───────────────────────────────────────
// Used as the Bayesian prior before enough history is accumulated.

const BASE_RELIABILITY: Record<string, number> = {
  'the irrawaddy':                 0.90,
  'irrawaddy':                     0.90,
  'dvb news':                      0.88,
  'dvb':                           0.88,
  'myanmar now':                   0.87,
  'rfa myanmar':                   0.87,
  'radio free asia':               0.87,
  'rfa':                           0.87,
  'aapp burma':                    0.85,
  'aapp':                          0.85,
  'bni multimedia':                0.75,
  'bnionline':                     0.75,
  'khit thit':                     0.72,
  'khit thit media':               0.72,
  'khit thit news tg':             0.72,
  'mizzima':                       0.70,
  'eleven media':                  0.68,
  '7day news':                     0.65,
  'mandalay free press':           0.68,
  'vom news':                      0.70,
  'bbc news burmese tg':           0.90,
  'dvb tv news tg':                0.85,
  'the irrawaddy tg':              0.90,
  'myanmar now tg':                0.87,
  // Pro-military Telegram channels — useful for counter-intelligence,
  // low factual reliability (junta-aligned narrative)
  'combat news 7723':              0.30,
  'snow queen 023':                0.30,
  'ba ba nyunt':                   0.30,
  'hmi ne wai':                    0.30,
  'union politics news':           0.30,
  'gnlm':                          0.35,  // state media
  'global new light of myanmar':   0.35,
  'myawady':                       0.30,
  'myawady news':                  0.30,
  'telegram':                      0.45,
  'social media':                  0.40,
  'twitter':                       0.40,
  'facebook':                      0.42,
}

// Bayesian prior weight — equivalent to observing this many events before any data
const PRIOR_WEIGHT = 5

/**
 * Looks up the static base reliability for a source name (case-insensitive).
 * Returns 0.65 (neutral MEDIUM) if the source is unknown.
 */
export function getBaseReliability(sourceName: string): number {
  const key = sourceName.toLowerCase().trim()
  for (const [pattern, score] of Object.entries(BASE_RELIABILITY)) {
    if (key.includes(pattern) || pattern.includes(key)) return score
  }
  return 0.65
}

/**
 * Converts a dynamic reliability score (0–1) to the SourceReliability enum.
 */
export function scoreToEnum(score: number): SourceReliability {
  if (score >= 0.75) return 'HIGH'
  if (score >= 0.50) return 'MEDIUM'
  return 'LOW'
}

/**
 * Legacy helper — kept for backward compat with existing callers.
 */
export function classifySourceReliability(source: string): SourceReliability {
  return scoreToEnum(getBaseReliability(source))
}

// ─── Multi-factor confidence score ───────────────────────────────────────────

export interface ConfidenceParams {
  /** Dynamic reliability score from SourceStats, or falls back to base. */
  dynamicReliabilityScore: number
  /** How many independent sources reported this event (1 = single source). */
  sourceCount: number
  /** Days since the event occurred. */
  ageDays: number
  /** Geocoding precision of the coordinates. */
  coordPrecision: CoordPrecision
  /** Claude's bias classification for the event. */
  biasFlag: string
}

/**
 * Calculates a composite confidence score (0–1) from five factors:
 *
 *   35% Source reliability  — dynamic (Bayesian) per-source score
 *   30% Cross-source agreement — log-scaled number of corroborating sources
 *   20% Recency             — exponential decay, 30-day half-life
 *   10% Coordinate precision — exact > township > district > region
 *    5% Bias adjustment      — unverified claims penalised
 */
export function calculateEventConfidence(p: ConfidenceParams): number {
  // Source reliability component (0–1)
  const sourceScore = Math.min(1, Math.max(0, p.dynamicReliabilityScore))

  // Agreement component — log₁₀ scale: 1 source → 0, 2 → 0.43, 5 → 0.78, 10 → 1.0
  const agreementScore = Math.min(1, Math.log10(Math.max(p.sourceCount, 1) + 1))

  // Recency component — exponential decay with 43.3-day constant (≈ 30-day half-life)
  const recencyScore = Math.exp(-Math.max(0, p.ageDays) / 43.3)

  // Coordinate precision component
  const coordScore = {
    exact:    1.00,
    township: 0.85,
    district: 0.60,
    region:   0.30,
  }[p.coordPrecision] ?? 0.30

  // Bias adjustment multiplier
  const biasMultiplier =
    p.biasFlag === 'neutral'            ? 1.00 :
    p.biasFlag === 'pro_resistance'     ? 0.85 :
    p.biasFlag === 'pro_junta'          ? 0.80 :
    p.biasFlag === 'unverified_claim'   ? 0.55 :
    0.85

  const raw =
    sourceScore   * 0.35 +
    agreementScore * 0.30 +
    recencyScore   * 0.20 +
    coordScore     * 0.15

  return Math.round(Math.min(1, raw * biasMultiplier) * 100) / 100
}

/**
 * Updates the Bayesian reliability score for a source given new observations.
 *
 * Formula: (corroborated + PRIOR_WEIGHT * base) / (total + PRIOR_WEIGHT)
 *
 * @param sourceName     The outlet name.
 * @param totalEvents    Total events attributed to this source (including the new batch).
 * @param corroborated   How many of those events were confirmed by ≥1 other source.
 */
export function bayesianReliability(
  sourceName:    string,
  totalEvents:   number,
  corroborated:  number,
): number {
  const base = getBaseReliability(sourceName)
  const updated =
    (corroborated + PRIOR_WEIGHT * base) / (totalEvents + PRIOR_WEIGHT)
  return Math.round(Math.min(0.99, Math.max(0.10, updated)) * 1000) / 1000
}

/**
 * Legacy signature — kept for callers that haven't migrated yet.
 */
export function calculateConfidence(
  reliability: SourceReliability,
  reportCount: number,
  ageDays:     number,
): number {
  const scoreMap: Record<SourceReliability, number> = {
    HIGH:   0.88,
    MEDIUM: 0.65,
    LOW:    0.40,
  }
  return calculateEventConfidence({
    dynamicReliabilityScore: scoreMap[reliability],
    sourceCount:             reportCount,
    ageDays,
    coordPrecision:          'region',
    biasFlag:                'neutral',
  })
}
