export const dynamic = 'force-dynamic'

import { subDays } from 'date-fns'
import prisma from '@/lib/db'
import { buildRegionRiskScores, scoresToThreatcon, THREATCON_LABELS } from '@/lib/risk'
import type { IntelSummaryDTO, RiskScoreDTO, ProcessedEventDTO, RegionSummary, EventType } from '@/lib/types'
import DailyBrief from '@/components/intel/DailyBrief'
import RiskOutlook from '@/components/intel/RiskOutlook'
import ScenarioAnalysis from '@/components/intel/ScenarioAnalysis'
import EventClusters from '@/components/intel/EventClusters'
import EscalationSignals from '@/components/intel/EscalationSignals'
import VolatilityTable from '@/components/intel/VolatilityTable'
import ThreatconBanner from '@/components/shared/ThreatconBanner'

// ── ConflictEvent → ProcessedEventDTO adapter ─────────────────────────────────
// ConflictEvent is the live table populated by cron/extract (Groq + DeepSeek).
// We map it to ProcessedEventDTO so DailyBrief, RiskOutlook, EventClusters
// can all read from the same source as VolatilityTable and EscalationSignals.

const CONFLICT_TYPE_TO_EVENT: Record<string, EventType> = {
  CLASH:                 'ARMED_CONFLICT',
  AIRSTRIKE:             'ARMED_CONFLICT',
  ARTILLERY_SHELLING:    'ARMED_CONFLICT',
  AMBUSH:                'ARMED_CONFLICT',
  SIEGE_SEIZED:          'ARMED_CONFLICT',
  RECAPTURED:            'ARMED_CONFLICT',
  WITHDRAWAL:            'ARMED_CONFLICT',
  CEASEFIRE:             'POLITICAL_UNREST',
  ARMED_MOBILIZATION:    'ARMED_CONFLICT',
  CIVILIAN_HARM:         'HUMANITARIAN_ALERT',
  DISPLACEMENT:          'HUMANITARIAN_ALERT',
  HUMANITARIAN_CRISIS:   'HUMANITARIAN_ALERT',
  POLITICAL_DEVELOPMENT: 'POLITICAL_UNREST',
}

// Infer return type from a typed helper so it works with generated Prisma client
const _analysedQuery = () => prisma.analysedEvent.findMany({ include: { conflictEvent: { include: { rawArticle: true } } } })
type AnalysedRow = Awaited<ReturnType<typeof _analysedQuery>>[0]

function analysedToDTO(row: AnalysedRow): ProcessedEventDTO {
  const ev         = row.conflictEvent
  const type       = CONFLICT_TYPE_TO_EVENT[ev.eventType] ?? 'ARMED_CONFLICT'
  const severity   =
    ev.fatalities >= 50 ? 5 :
    ev.fatalities >= 11 ? 4 :
    ev.fatalities >= 4  ? 3 :
    ev.fatalities >= 1  ? 2 :
    row.confidence >= 0.7 ? 2 : 1
  const reliability: ProcessedEventDTO['reliability'] =
    row.confidence >= 0.7 ? 'HIGH' : row.confidence >= 0.4 ? 'MEDIUM' : 'LOW'

  return {
    id:         ev.id,
    date:       ev.date.toISOString(),
    country:    'Myanmar',
    region:     ev.region,
    adminArea:  ev.adminArea,
    type,
    severity,
    summary:    row.summary,
    source:     ev.rawArticle?.channelName ?? '',
    sourceUrl:  ev.rawArticle?.url ?? null,
    reliability,
    confidence: row.confidence,
    latitude:   ev.lat,
    longitude:  ev.lng,
    fatalities: ev.fatalities,
    actors:     row.actors,
    tags:       [ev.eventType, ev.biasFlag].filter(Boolean),
  }
}

// ── Data fetchers ─────────────────────────────────────────────────────────────

async function getIntelSummary(): Promise<IntelSummaryDTO | null> {
  try {
    const now   = new Date()
    const week1 = subDays(now, 7)
    const week2 = subDays(now, 14)

    const regionFilter = { notIn: ['Myanmar', 'Burma', '', 'unknown'] }
    const [currRows, prevRows] = await Promise.all([
      prisma.analysedEvent.findMany({
        where:   { isActiveIntelligence: true, conflictEvent: { date: { gte: week1 }, region: regionFilter } },
        include: { conflictEvent: { include: { rawArticle: true } } },
        orderBy: { conflictEvent: { date: 'desc' } },
      }),
      prisma.analysedEvent.findMany({
        where: { isActiveIntelligence: true, conflictEvent: { date: { gte: week2, lt: week1 }, region: regionFilter } },
        include: { conflictEvent: { include: { rawArticle: true } } },
      }),
    ])

    const curr = currRows.map(analysedToDTO)
    const prev = prevRows.map(analysedToDTO)

    const riskScores = buildRegionRiskScores(curr, prev)
    const threatcon  = scoresToThreatcon(riskScores)

    const keyEvents = curr
      .filter(e => e.severity >= 3)
      .slice(0, 8)

    const regionSummary: RegionSummary[] = riskScores
      .sort((a, b) => b.score - a.score)
      .map(s => {
        const regionEvents  = curr.filter(e => e.region === s.region)
        const typeCounts    = regionEvents.reduce<Record<string, number>>((acc: Record<string, number>, e: ProcessedEventDTO) => {
          acc[e.type] = (acc[e.type] ?? 0) + 1
          return acc
        }, {})
        const dominantType = (Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'ARMED_CONFLICT') as EventType
        return { region: s.region, riskScore: s.score, trend: s.trend, dominantType, eventCount: s.eventCount }
      })

    const topAlerts = regionSummary
      .filter(r => r.riskScore >= 40)
      .slice(0, 3)
      .map(r => `${r.region}: risk score ${r.riskScore.toFixed(0)}/100 (${r.trend}) — ${r.eventCount} events this week`)

    const vsLastWeek = prev.length
      ? Math.round(((curr.length - prev.length) / prev.length) * 100)
      : 0

    return {
      generatedAt:    now.toISOString(),
      threatcon,
      threatconLabel: THREATCON_LABELS[threatcon],
      keyEvents,
      regionSummary,
      topAlerts: topAlerts.length ? topAlerts : ['No critical alerts in the current period.'],
      weeklyDelta: {
        totalEvents:         curr.length,
        vsLastWeek,
        newRegionsEscalated: riskScores.filter(s => s.trend === 'rising' && s.score >= 50).map(s => s.region),
        topRegion:           regionSummary[0]?.region ?? '—',
      },
    }
  } catch (err) {
    console.error('[intel] getIntelSummary error:', err)
    return null
  }
}

async function getRiskScores(): Promise<RiskScoreDTO[]> {
  try {
    const cutoff       = subDays(new Date(), 30)
    const regionFilter = { notIn: ['Myanmar', 'Burma', '', 'unknown'] }
    const [currRows, prevRows] = await Promise.all([
      prisma.analysedEvent.findMany({
        where:   { isActiveIntelligence: true, conflictEvent: { date: { gte: cutoff }, region: regionFilter } },
        include: { conflictEvent: { include: { rawArticle: true } } },
      }),
      prisma.analysedEvent.findMany({
        where:   { isActiveIntelligence: true, conflictEvent: { date: { gte: subDays(new Date(), 60), lt: cutoff }, region: regionFilter } },
        include: { conflictEvent: { include: { rawArticle: true } } },
      }),
    ])
    return buildRegionRiskScores(currRows.map(analysedToDTO), prevRows.map(analysedToDTO))
  } catch (err) {
    console.error('[intel] getRiskScores error:', err)
    return []
  }
}

async function getRecentEvents(): Promise<ProcessedEventDTO[]> {
  try {
    const rows = await prisma.analysedEvent.findMany({
      where:   { isActiveIntelligence: true, conflictEvent: { date: { gte: subDays(new Date(), 30) }, region: { notIn: ['Myanmar', 'Burma', '', 'unknown'] } } },
      include: { conflictEvent: true },
      orderBy: { conflictEvent: { date: 'desc' } },
      take:    200,
    })
    return rows.map(analysedToDTO)
  } catch (err) {
    console.error('[intel] getRecentEvents error:', err)
    return []
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Intel Dashboard — Myanmar Risk Platform',
}

export default async function IntelPage() {
  const [summary, scores, events] = await Promise.all([
    getIntelSummary(),
    getRiskScores(),
    getRecentEvents(),
  ])

  const threatcon      = summary?.threatcon ?? 3
  const threatconLabel = THREATCON_LABELS[threatcon]

  return (
    <div className="min-h-screen bg-surface-0">
      <ThreatconBanner level={threatcon} label={threatconLabel} />

      <div className="max-w-screen-2xl mx-auto px-4 py-6 space-y-6">
        {/* Row 1 — Brief + Risk outlook */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-2">
            <DailyBrief summary={summary} />
          </div>
          <div className="xl:col-span-3">
            <RiskOutlook scores={scores} />
          </div>
        </div>

        {/* Row 2 — Scenario + Clusters */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ScenarioAnalysis />
          <EventClusters events={events} />
        </div>

        {/* Row 3 — Conflict intelligence */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="h-96">
            <EscalationSignals />
          </div>
          <div className="h-96">
            <VolatilityTable />
          </div>
        </div>
      </div>
    </div>
  )
}
