// ─── Domain enums ────────────────────────────────────────────────────────────

export type EventType =
  | 'ARMED_CONFLICT'
  | 'POLITICAL_UNREST'
  | 'INFRASTRUCTURE_DISRUPTION'
  | 'HUMANITARIAN_ALERT'

export type SourceReliability = 'HIGH' | 'MEDIUM' | 'LOW'

export type RiskTrend = 'rising' | 'stable' | 'declining'

// ─── API DTOs ─────────────────────────────────────────────────────────────────

export interface ProcessedEventDTO {
  id: string
  date: string          // ISO string
  country: string
  region: string
  adminArea: string | null
  type: EventType
  severity: number      // 1–5
  summary: string
  source: string
  sourceUrl: string | null
  reliability: SourceReliability
  confidence: number    // 0–1
  latitude: number | null
  longitude: number | null
  fatalities: number
  actors: string[]
  tags: string[]
}

export interface RiskScoreDTO {
  region: string
  date: string
  score: number
  conflictScore: number
  protestScore: number
  disruptionScore: number
  humanScore: number
  eventCount: number
  trend: RiskTrend
  calculatedAt: string
}

export interface IntelSummaryDTO {
  generatedAt: string
  threatcon: 1 | 2 | 3 | 4 | 5
  threatconLabel: string
  keyEvents: ProcessedEventDTO[]
  regionSummary: RegionSummary[]
  topAlerts: string[]
  weeklyDelta: WeeklyDelta
}

export interface RegionSummary {
  region: string
  riskScore: number
  trend: RiskTrend
  dominantType: EventType
  eventCount: number
}

export interface WeeklyDelta {
  totalEvents: number
  vsLastWeek: number      // percentage change
  newRegionsEscalated: string[]
  topRegion: string
}

// ─── Simulation ───────────────────────────────────────────────────────────────

export interface ScenarioParams {
  initialConflict: number       // 0–1
  initialEconomy: number        // 0–1
  externalSupport: boolean      // resistance receives external support
  internationalSanctions: boolean
  ceasefireAttempt: boolean
  timeHorizonDays: number       // 30 | 60 | 90 | 180
  iterations: number            // default 1000
}

export interface DistributionBucket {
  bin: number     // lower bound of bucket (0–1)
  count: number
  probability: number
}

export interface SimulationOutput {
  escalationProbability: number     // P(escalationRisk > 0.7)
  collapseRisk: number              // P(economicStability < 0.2)
  humanitarianCrisisProbability: number
  p10: number
  p50: number
  p90: number
  mean: number
  stdDev: number
  distribution: DistributionBucket[]
  stateDistributions: {
    conflictIntensity: DistributionBucket[]
    economicStability: DistributionBucket[]
    humanitarianImpact: DistributionBucket[]
  }
  scenarioParams: ScenarioParams
  runAt: string
}

// ─── Map types ────────────────────────────────────────────────────────────────

export type LayerType = EventType | 'RISK_HEATMAP'

export interface GeoFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: ProcessedEventDTO
}

export interface GeoFeatureCollection {
  type: 'FeatureCollection'
  features: GeoFeature[]
}

// ─── Myanmar regions ──────────────────────────────────────────────────────────

export interface MyanmarRegion {
  id: string
  name: string
  burmese: string
  centroid: [number, number]  // [lng, lat]
}

export const MYANMAR_REGIONS: MyanmarRegion[] = [
  { id: 'ayeyarwady',    name: 'Ayeyarwady Region',      burmese: 'အိုင်ရဝတီတိုင်း',          centroid: [95.2, 17.0] },
  { id: 'bago',          name: 'Bago Region',            burmese: 'ပဲခူးတိုင်း',               centroid: [96.5, 17.8] },
  { id: 'chin',          name: 'Chin State',             burmese: 'ချင်းပြည်နယ်',              centroid: [93.5, 22.0] },
  { id: 'kachin',        name: 'Kachin State',           burmese: 'ကချင်ပြည်နယ်',              centroid: [97.0, 25.5] },
  { id: 'kayah',         name: 'Kayah State',            burmese: 'ကယားပြည်နယ်',              centroid: [97.2, 19.2] },
  { id: 'kayin',         name: 'Kayin State',            burmese: 'ကရင်ပြည်နယ်',              centroid: [97.8, 17.5] },
  { id: 'magway',        name: 'Magway Region',          burmese: 'မကွေးတိုင်း',               centroid: [94.8, 20.1] },
  { id: 'mandalay',      name: 'Mandalay Region',        burmese: 'မန္တလေးတိုင်း',             centroid: [96.1, 21.5] },
  { id: 'mon',           name: 'Mon State',              burmese: 'မွန်ပြည်နယ်',               centroid: [97.6, 16.1] },
  { id: 'naypyidaw',     name: 'Naypyidaw Union Territory', burmese: 'နေပြည်တော်',             centroid: [96.2, 19.8] },
  { id: 'rakhine',       name: 'Rakhine State',          burmese: 'ရခိုင်ပြည်နယ်',             centroid: [93.6, 20.3] },
  { id: 'sagaing',       name: 'Sagaing Region',         burmese: 'စစ်ကိုင်းတိုင်း',            centroid: [95.4, 23.0] },
  { id: 'shan',          name: 'Shan State',             burmese: 'ရှမ်းပြည်နယ်',              centroid: [97.5, 22.0] },
  { id: 'tanintharyi',   name: 'Tanintharyi Region',     burmese: 'တနင်္သာရီတိုင်း',           centroid: [98.5, 13.5] },
  { id: 'yangon',        name: 'Yangon Region',          burmese: 'ရန်ကုန်တိုင်း',             centroid: [96.2, 16.9] },
]

// ─── Event type metadata ──────────────────────────────────────────────────────

export const EVENT_TYPE_META: Record<EventType, { label: string; color: string; icon: string }> = {
  ARMED_CONFLICT:            { label: 'Armed Conflict',             color: '#ef4444', icon: '⚔' },
  POLITICAL_UNREST:          { label: 'Political Unrest',           color: '#f59e0b', icon: '✊' },
  INFRASTRUCTURE_DISRUPTION: { label: 'Infrastructure Disruption',  color: '#8b5cf6', icon: '⚡' },
  HUMANITARIAN_ALERT:        { label: 'Humanitarian Alert',         color: '#06b6d4', icon: '🚨' },
}

export const RISK_LEVEL_META: Record<1 | 2 | 3 | 4 | 5, { label: string; color: string }> = {
  1: { label: 'Low',      color: '#22c55e' },
  2: { label: 'Guarded',  color: '#84cc16' },
  3: { label: 'Elevated', color: '#f59e0b' },
  4: { label: 'High',     color: '#f97316' },
  5: { label: 'Critical', color: '#ef4444' },
}
