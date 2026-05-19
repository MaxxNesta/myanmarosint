import type { ProcessedEventDTO, RiskScoreDTO, RiskTrend, EventType } from './types'
import { differenceInDays } from 'date-fns'

const TYPE_WEIGHT: Record<EventType, number> = {
  ARMED_CONFLICT:            3,
  HUMANITARIAN_ALERT:        2,
  POLITICAL_UNREST:          2,
  INFRASTRUCTURE_DISRUPTION: 1,
}

const SEVERITY_MULTIPLIER = [0, 0.6, 0.8, 1.0, 1.3, 1.6]  // index = severity 0..5

/**
 * Compute risk score (0–100) for a set of events in a region/time window.
 * Formula: weighted sum of (typeWeight × severityMultiplier × recencyDecay) / normFactor
 */
export function computeRiskScore(events: ProcessedEventDTO[]): number {
  if (!events.length) return 0

  const now = new Date()
  let weighted = 0

  for (const e of events) {
    const ageDays = differenceInDays(now, new Date(e.date))
    const recency = Math.exp(-ageDays / 21)  // 21-day half-life
    const w = TYPE_WEIGHT[e.type] * SEVERITY_MULTIPLIER[e.severity] * recency
    weighted += w
  }

  // Normalize: 30 max-weight events per period ≈ 100
  const raw = (weighted / (30 * 3 * 1.6)) * 100
  return Math.min(100, Math.round(raw * 10) / 10)
}

export function computeSubScores(events: ProcessedEventDTO[]): {
  conflictScore: number
  protestScore: number
  disruptionScore: number
  humanScore: number
} {
  const byType = (t: EventType) => events.filter(e => e.type === t)
  return {
    conflictScore:    computeRiskScore(byType('ARMED_CONFLICT')),
    protestScore:     computeRiskScore(byType('POLITICAL_UNREST')),
    disruptionScore:  computeRiskScore(byType('INFRASTRUCTURE_DISRUPTION')),
    humanScore:       computeRiskScore(byType('HUMANITARIAN_ALERT')),
  }
}

/**
 * Compare current-week score to previous-week score to derive trend.
 */
export function deriveTrend(
  currentScore: number,
  previousScore: number,
): RiskTrend {
  const delta = currentScore - previousScore
  if (delta > 5)  return 'rising'
  if (delta < -5) return 'declining'
  return 'stable'
}

/**
 * Group events by region and return a RiskScoreDTO per region.
 */
export function buildRegionRiskScores(
  events: ProcessedEventDTO[],
  prevWeekEvents: ProcessedEventDTO[],
): RiskScoreDTO[] {
  const regions = [...new Set(events.map(e => e.region))]

  return regions.map(region => {
    const curr = events.filter(e => e.region === region)
    const prev = prevWeekEvents.filter(e => e.region === region)
    const score = computeRiskScore(curr)
    const prevScore = computeRiskScore(prev)
    const subs = computeSubScores(curr)

    return {
      region,
      date: new Date().toISOString().split('T')[0],
      score,
      ...subs,
      eventCount: curr.length,
      trend: deriveTrend(score, prevScore),
      calculatedAt: new Date().toISOString(),
    }
  })
}

/**
 * Convert risk score (0–100) to THREATCON level (1–5).
 */
export function scoresToThreatcon(scores: RiskScoreDTO[]): 1 | 2 | 3 | 4 | 5 {
  if (!scores.length) return 1
  const max = Math.max(...scores.map(s => s.score))
  if (max >= 80) return 5
  if (max >= 60) return 4
  if (max >= 40) return 3
  if (max >= 20) return 2
  return 1
}

export const THREATCON_LABELS: Record<number, string> = {
  1: 'LOW',
  2: 'GUARDED',
  3: 'ELEVATED',
  4: 'HIGH',
  5: 'CRITICAL',
}
