import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { buildRegionRiskScores } from '@/lib/risk'
import { subDays } from 'date-fns'
import type { ProcessedEventDTO } from '@/lib/types'

export async function GET(req: NextRequest) {
  const days  = Number(req.nextUrl.searchParams.get('days')  ?? '14')
  const fresh = req.nextUrl.searchParams.get('fresh') === '1'

  // Try cached DB scores first (unless fresh recalculation requested)
  if (!fresh) {
    try {
      const cached = await prisma.riskScore.findMany({
        where: { date: { gte: subDays(new Date(), 2) } },
        orderBy: [{ date: 'desc' }, { score: 'desc' }],
      })

      if (cached.length > 0) {
        const scores = cached.map(s => ({
          region:         s.region,
          date:           s.date.toISOString().split('T')[0],
          score:          s.score,
          conflictScore:  s.conflictScore,
          protestScore:   s.protestScore,
          disruptionScore: s.disruptionScore,
          humanScore:     s.humanScore,
          eventCount:     s.eventCount,
          trend:          s.trend as 'rising' | 'stable' | 'declining',
          calculatedAt:   s.calculatedAt.toISOString(),
        }))
        return NextResponse.json({ scores, source: 'cache' }, {
          headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
        })
      }
    } catch { /* fall through to live computation */ }
  }

  // Live computation from processed events
  try {
    const cutoff     = subDays(new Date(), days)
    const prevCutoff = subDays(new Date(), days * 2)

    const [currRows, prevRows] = await Promise.all([
      prisma.processedEvent.findMany({ where: { date: { gte: cutoff } } }),
      prisma.processedEvent.findMany({ where: { date: { gte: prevCutoff, lt: cutoff } } }),
    ])

    const toDTO = (r: typeof currRows[0]): ProcessedEventDTO => ({
      id: r.id, date: r.date.toISOString(), country: r.country, region: r.region,
      adminArea: r.adminArea, type: r.type as ProcessedEventDTO['type'],
      severity: r.severity, summary: r.summary, source: r.source,
      sourceUrl: r.sourceUrl, reliability: r.reliability as ProcessedEventDTO['reliability'],
      confidence: r.confidence, latitude: r.latitude, longitude: r.longitude,
      fatalities: r.fatalities, actors: r.actors, tags: r.tags,
    })

    const scores = buildRegionRiskScores(currRows.map(toDTO), prevRows.map(toDTO))

    // Persist scores to DB (upsert)
    await Promise.allSettled(
      scores.map(s =>
        prisma.riskScore.upsert({
          where: { region_date: { region: s.region, date: new Date(s.date) } },
          create: {
            region: s.region, date: new Date(s.date), score: s.score,
            conflictScore: s.conflictScore, protestScore: s.protestScore,
            disruptionScore: s.disruptionScore, humanScore: s.humanScore,
            eventCount: s.eventCount, trend: s.trend,
          },
          update: {
            score: s.score, conflictScore: s.conflictScore, protestScore: s.protestScore,
            disruptionScore: s.disruptionScore, humanScore: s.humanScore,
            eventCount: s.eventCount, trend: s.trend,
          },
        }),
      ),
    )

    return NextResponse.json({ scores, source: 'computed' })
  } catch (err) {
    console.error('GET /api/risk error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
