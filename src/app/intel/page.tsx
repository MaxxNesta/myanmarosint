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

// ── Direct DB helpers (no HTTP round-trip, no BASE URL dependency) ────────────

function toDTO(r: Awaited<ReturnType<typeof prisma.processedEvent.findMany>>[0]): ProcessedEventDTO {
  return {
    id: r.id, date: r.date.toISOString(), country: r.country, region: r.region,
    adminArea: r.adminArea, type: r.type as EventType,
    severity: r.severity, summary: r.summary, source: r.source,
    sourceUrl: r.sourceUrl, reliability: r.reliability as ProcessedEventDTO['reliability'],
    confidence: r.confidence, latitude: r.latitude, longitude: r.longitude,
    fatalities: r.fatalities, actors: r.actors, tags: r.tags,
  }
}

async function getIntelSummary(): Promise<IntelSummaryDTO | null> {
  try {
    const now   = new Date()
    const week1 = subDays(now, 7)
    const week2 = subDays(now, 14)

    const [currRows, prevRows] = await Promise.all([
      prisma.processedEvent.findMany({ where: { date: { gte: week1 } }, orderBy: { date: 'desc' } }),
      prisma.processedEvent.findMany({ where: { date: { gte: week2, lt: week1 } } }),
    ])

    const curr = currRows.map(toDTO)
    const prev = prevRows.map(toDTO)

    const riskScores = buildRegionRiskScores(curr, prev)
    const threatcon  = scoresToThreatcon(riskScores)

    const keyEvents = curr
      .filter(e => e.severity >= 3 && e.confidence >= 0.4)
      .slice(0, 8)

    const regionSummary: RegionSummary[] = riskScores
      .sort((a, b) => b.score - a.score)
      .map(s => {
        const regionEvents = curr.filter(e => e.region === s.region)
        const typeCounts   = regionEvents.reduce<Record<string, number>>((acc, e) => {
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
      generatedAt:  now.toISOString(),
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
    // Try cached scores first
    const cached = await prisma.riskScore.findMany({
      where:   { date: { gte: subDays(new Date(), 2) } },
      orderBy: [{ date: 'desc' }, { score: 'desc' }],
    })
    if (cached.length > 0) {
      return cached.map(s => ({
        region: s.region, date: s.date.toISOString().split('T')[0],
        score: s.score, conflictScore: s.conflictScore, protestScore: s.protestScore,
        disruptionScore: s.disruptionScore, humanScore: s.humanScore,
        eventCount: s.eventCount, trend: s.trend as RiskScoreDTO['trend'],
        calculatedAt: s.calculatedAt.toISOString(),
      }))
    }

    // Compute live from ProcessedEvent
    const cutoff = subDays(new Date(), 30)
    const [currRows, prevRows] = await Promise.all([
      prisma.processedEvent.findMany({ where: { date: { gte: cutoff } } }),
      prisma.processedEvent.findMany({ where: { date: { gte: subDays(new Date(), 60), lt: cutoff } } }),
    ])
    return buildRegionRiskScores(currRows.map(toDTO), prevRows.map(toDTO))
  } catch (err) {
    console.error('[intel] getRiskScores error:', err)
    return []
  }
}

async function getRecentEvents(): Promise<ProcessedEventDTO[]> {
  try {
    const rows = await prisma.processedEvent.findMany({
      where:   { date: { gte: subDays(new Date(), 30) } },
      orderBy: { date: 'desc' },
      take:    200,
    })
    return rows.map(toDTO)
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
