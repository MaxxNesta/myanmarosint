export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { buildRegionRiskScores, scoresToThreatcon, THREATCON_LABELS } from '@/lib/risk'
import { subDays } from 'date-fns'
import type { ProcessedEventDTO, IntelSummaryDTO, RegionSummary, EventType } from '@/lib/types'

const toDTO = (r: Awaited<ReturnType<typeof prisma.processedEvent.findMany>>[0]): ProcessedEventDTO => ({
  id: r.id, date: r.date.toISOString(), country: r.country, region: r.region,
  adminArea: r.adminArea, type: r.type as EventType,
  severity: r.severity, summary: r.summary, source: r.source,
  sourceUrl: r.sourceUrl, reliability: r.reliability as ProcessedEventDTO['reliability'],
  confidence: r.confidence, latitude: r.latitude, longitude: r.longitude,
  fatalities: r.fatalities, actors: r.actors, tags: r.tags,
})

export async function GET() {
  try {
    const now      = new Date()
    const week1    = subDays(now, 7)
    const week2    = subDays(now, 14)

    const [currEvents, prevEvents] = await Promise.all([
      prisma.processedEvent.findMany({ where: { date: { gte: week1 } }, orderBy: { date: 'desc' } }),
      prisma.processedEvent.findMany({ where: { date: { gte: week2, lt: week1 } } }),
    ])

    const curr = currEvents.map(toDTO)
    const prev = prevEvents.map(toDTO)

    const riskScores = buildRegionRiskScores(curr, prev)
    const threatcon  = scoresToThreatcon(riskScores)

    // Key events: severity ≥ 3, high confidence, most recent first, capped at 8
    const keyEvents = curr
      .filter(e => e.severity >= 3 && e.confidence >= 0.5)
      .slice(0, 8)

    // Regional summary
    const regionSummary: RegionSummary[] = riskScores
      .sort((a, b) => b.score - a.score)
      .map(s => {
        const regionEvents = curr.filter(e => e.region === s.region)
        const typeCounts = regionEvents.reduce<Record<string, number>>((acc, e) => {
          acc[e.type] = (acc[e.type] ?? 0) + 1
          return acc
        }, {})
        const dominantType = (Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'ARMED_CONFLICT') as EventType
        return {
          region:       s.region,
          riskScore:    s.score,
          trend:        s.trend,
          dominantType,
          eventCount:   s.eventCount,
        }
      })

    // Top alert text — build from highest-risk regions
    const topAlerts = regionSummary
      .filter(r => r.riskScore >= 40)
      .slice(0, 3)
      .map(r => `${r.region}: risk score ${r.riskScore.toFixed(0)}/100 (${r.trend}) — ${r.eventCount} events this week`)

    // Weekly delta
    const vsLastWeek = prev.length
      ? Math.round(((curr.length - prev.length) / prev.length) * 100)
      : 0
    const newEscalated = riskScores
      .filter(s => s.trend === 'rising' && s.score >= 50)
      .map(s => s.region)

    const summary: IntelSummaryDTO = {
      generatedAt:  now.toISOString(),
      threatcon,
      threatconLabel: THREATCON_LABELS[threatcon],
      keyEvents,
      regionSummary,
      topAlerts:    topAlerts.length ? topAlerts : ['No critical alerts in the current period.'],
      weeklyDelta: {
        totalEvents:          curr.length,
        vsLastWeek,
        newRegionsEscalated:  newEscalated,
        topRegion:            regionSummary[0]?.region ?? '—',
      },
    }

    return NextResponse.json(summary, {
      headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600' },
    })
  } catch (err) {
    console.error('GET /api/intel-summary error:', err)
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}
