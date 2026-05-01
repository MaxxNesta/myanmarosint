import type { MilitaryBase } from './bases-data'

export interface AreaSelection {
  bases:    MilitaryBase[]
  area_km2: number
  center:   [number, number]
  polygon:  object
}

export interface ThreatItem {
  name:        string
  probability: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  description: string
}

export interface ScenarioAnalysis {
  scenarioOverview: string
  areaSummary: {
    operational:    number
    contested:      number
    seized:         number
    dominant_actor: string
  }
  projection: {
    holdPosition:   'HIGH' | 'MEDIUM' | 'LOW'
    lossRisk:       'HIGH' | 'MEDIUM' | 'LOW'
    confidence:     'HIGH' | 'MEDIUM' | 'LOW'
    confidence_pct: number
  }
  keyDrivers:         string[]
  interpretation:     string
  recommendedActions: string[]
  threats:            ThreatItem[]
  riskLevel:          'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  generatedAt:        string
}
