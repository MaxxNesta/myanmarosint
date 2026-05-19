import type { ScenarioParams, SimulationOutput, DistributionBucket } from './types'

// Box-Muller transform — standard normal sample
function randn(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x))
}

interface SimState {
  conflictIntensity: number   // 0–1
  economicStability: number   // 0–1
  escalationRisk: number      // 0–1
  humanitarianImpact: number  // 0–1
}

function stepState(s: SimState, params: ScenarioParams): SimState {
  // Logistic-inspired conflict growth — saturates near 1
  const conflictGrowth =
    0.008 * s.conflictIntensity * (1 - s.conflictIntensity) +
    (params.externalSupport ? 0.004 : 0) -
    (params.ceasefireAttempt ? 0.006 : 0) +
    randn() * 0.018

  // Economy erodes under conflict and sanctions
  const economyDecay =
    -0.006 * s.conflictIntensity -
    (params.internationalSanctions ? 0.003 : 0) +
    randn() * 0.012

  const newConflict  = clamp(s.conflictIntensity  + conflictGrowth, 0, 1)
  const newEconomy   = clamp(s.economicStability  + economyDecay,   0, 1)

  // Derived state variables
  const newEscalation   = clamp(newConflict * 0.70 + (1 - newEconomy) * 0.30, 0, 1)
  const newHumanitarian = clamp(newConflict * 0.55 + (1 - newEconomy) * 0.45, 0, 1)

  return {
    conflictIntensity:  newConflict,
    economicStability:  newEconomy,
    escalationRisk:     newEscalation,
    humanitarianImpact: newHumanitarian,
  }
}

function buildHistogram(values: number[], bins = 20): DistributionBucket[] {
  const sorted = [...values].sort((a, b) => a - b)
  const buckets: DistributionBucket[] = []
  const step = 1 / bins

  for (let i = 0; i < bins; i++) {
    const lo = i * step
    const hi = lo + step
    const count = sorted.filter(v => v >= lo && (i === bins - 1 ? v <= hi : v < hi)).length
    buckets.push({ bin: lo, count, probability: count / values.length })
  }
  return buckets
}

function mean(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

function stdDev(arr: number[], m: number): number {
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length)
}

export function runMonteCarlo(params: ScenarioParams): SimulationOutput {
  const n = Math.max(100, Math.min(params.iterations, 5000))
  const finalStates: SimState[] = []

  for (let i = 0; i < n; i++) {
    let state: SimState = {
      conflictIntensity:  clamp(params.initialConflict + randn() * 0.04, 0, 1),
      economicStability:  clamp(params.initialEconomy  + randn() * 0.04, 0, 1),
      escalationRisk:     clamp(params.initialConflict * 0.75, 0, 1),
      humanitarianImpact: clamp((1 - params.initialEconomy) * 0.55, 0, 1),
    }

    for (let day = 0; day < params.timeHorizonDays; day++) {
      state = stepState(state, params)
    }

    finalStates.push(state)
  }

  const escRisks  = finalStates.map(s => s.escalationRisk)
  const econ      = finalStates.map(s => s.economicStability)
  const human     = finalStates.map(s => s.humanitarianImpact)
  const conflict  = finalStates.map(s => s.conflictIntensity)

  const sorted = [...escRisks].sort((a, b) => a - b)
  const mu     = mean(escRisks)
  const sigma  = stdDev(escRisks, mu)

  return {
    escalationProbability:       escRisks.filter(r => r > 0.70).length / n,
    collapseRisk:                econ.filter(e => e < 0.20).length / n,
    humanitarianCrisisProbability: human.filter(h => h > 0.75).length / n,
    p10:    sorted[Math.floor(n * 0.10)],
    p50:    sorted[Math.floor(n * 0.50)],
    p90:    sorted[Math.floor(n * 0.90)],
    mean:   mu,
    stdDev: sigma,
    distribution: buildHistogram(escRisks, 20),
    stateDistributions: {
      conflictIntensity:  buildHistogram(conflict, 20),
      economicStability:  buildHistogram(econ,     20),
      humanitarianImpact: buildHistogram(human,    20),
    },
    scenarioParams: params,
    runAt: new Date().toISOString(),
  }
}
