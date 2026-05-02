export type ActorId =
  | 'MILITARY'
  | 'TNLA'
  | 'MNDAA'
  | 'AA'
  | 'KIA'
  | 'PDF_NUG'
  | 'KNLA'
  | 'KNDO'
  | 'CNF'
  | 'SSPP_SSA'
  | 'KNPP'
  | 'UWSA'
  | 'UNKNOWN'

export interface Actor {
  id: ActorId
  name: string
  shortName: string
  color: string
  side: 'junta' | 'resistance'
}

export type CampaignStatus = 'ongoing' | 'completed' | 'failed' | 'stalled'
export type StrategicImportance = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export interface Campaign {
  id: string
  name: string
  actor: ActorId
  /** Slug matching coordinate-cities NAME: lowercase, spaces → hyphens */
  fromTownId: string
  toTownId: string
  waypointTownIds?: string[]
  startDate: string  // 'YYYY-MM-DD'
  endDate?: string
  status: CampaignStatus
  casualties?: number
  strategicImportance: StrategicImportance
  description?: string
}

export interface TownControlEvent {
  townId: string
  date: string  // 'YYYY-MM-DD'
  actor: ActorId
  /** true = control is contested (triggers pulse effect) */
  contested?: boolean
}

export interface MyanmarCity {
  id: string
  name: string
  lat: number
  lng: number
}
