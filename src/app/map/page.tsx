export const dynamic = 'force-dynamic'

import type { RiskScoreDTO } from '@/lib/types'
import MapShell from '@/components/map/MapShell'
import prisma from '@/lib/db'
import { buildRegionRiskScores } from '@/lib/risk'
import { subDays } from 'date-fns'

const CONFLICT_TYPE_TO_EVENT: Record<string, 'ARMED_CONFLICT' | 'HUMANITARIAN_ALERT' | 'POLITICAL_UNREST'> = {
  CLASH:                 'ARMED_CONFLICT',
  AIRSTRIKE:             'ARMED_CONFLICT',
  ARTILLERY_SHELLING:    'ARMED_CONFLICT',
  SIEGE_SEIZED:          'ARMED_CONFLICT',
  RECAPTURED:            'ARMED_CONFLICT',
  DISPLACEMENT:          'HUMANITARIAN_ALERT',
  HUMANITARIAN_CRISIS:   'HUMANITARIAN_ALERT',
  POLITICAL_DEVELOPMENT: 'POLITICAL_UNREST',
}

async function getRiskScores(): Promise<RiskScoreDTO[]> {
  try {
    const cutoff = subDays(new Date(), 30)
    const [currRows, prevRows] = await Promise.all([
      prisma.analysedEvent.findMany({
        where:   { isActiveIntelligence: true, conflictEvent: { date: { gte: cutoff } } },
        include: { conflictEvent: true },
      }),
      prisma.analysedEvent.findMany({
        where:   { isActiveIntelligence: true, conflictEvent: { date: { gte: subDays(new Date(), 60), lt: cutoff } } },
        include: { conflictEvent: true },
      }),
    ])

    const toDTO = (row: (typeof currRows)[0]) => {
      const ev       = row.conflictEvent
      const type     = CONFLICT_TYPE_TO_EVENT[ev.eventType] ?? 'ARMED_CONFLICT'
      const severity =
        ev.fatalities >= 50 ? 5 : ev.fatalities >= 11 ? 4 :
        ev.fatalities >= 4  ? 3 : ev.fatalities >= 1  ? 2 : 1
      return {
        id: ev.id, date: ev.date.toISOString(), country: 'Myanmar',
        region: ev.region, adminArea: ev.adminArea, type, severity,
        summary: row.summary, source: '', sourceUrl: null,
        reliability: (row.confidence >= 0.7 ? 'HIGH' : row.confidence >= 0.4 ? 'MEDIUM' : 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW',
        confidence: row.confidence, latitude: ev.lat, longitude: ev.lng,
        fatalities: ev.fatalities, actors: row.actors, tags: [ev.eventType],
      }
    }

    return buildRegionRiskScores(currRows.map(toDTO), prevRows.map(toDTO))
  } catch (err) {
    console.error('[map] getRiskScores error:', err)
    return []
  }
}

export const metadata = {
  title: 'Conflict Map — Myanmar Risk Platform',
}

export default async function MapPage() {
  const riskScores = await getRiskScores()
  return <MapShell initialEvents={[]} initialRiskScores={riskScores} />
}
