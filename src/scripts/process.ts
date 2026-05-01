/**
 * Post-ingestion processing script.
 * Recalculates risk scores for all regions and persists them.
 * Run: npm run process
 */

import { makePrisma } from './make-prisma'
import { buildRegionRiskScores } from '../lib/risk'
import { subDays } from 'date-fns'

const prisma = makePrisma()

type EventType = 'ARMED_CONFLICT' | 'POLITICAL_UNREST' | 'INFRASTRUCTURE_DISRUPTION' | 'HUMANITARIAN_ALERT'
type SourceReliability = 'HIGH' | 'MEDIUM' | 'LOW'

async function main() {
  console.log('⚙️  Processing risk scores…')

  const now      = new Date()
  const cutoff   = subDays(now, 14)
  const prevCutoff = subDays(now, 28)

  const [currRows, prevRows] = await Promise.all([
    prisma.processedEvent.findMany({ where: { date: { gte: cutoff } } }),
    prisma.processedEvent.findMany({ where: { date: { gte: prevCutoff, lt: cutoff } } }),
  ])

  console.log(`   Current period: ${currRows.length} events`)
  console.log(`   Previous period: ${prevRows.length} events`)

  const toDTO = (r: typeof currRows[0]) => ({
    id: r.id, date: r.date.toISOString(), country: r.country, region: r.region,
    adminArea: r.adminArea, type: r.type as EventType,
    severity: r.severity, summary: r.summary, source: r.source,
    sourceUrl: r.sourceUrl, reliability: r.reliability as SourceReliability,
    confidence: r.confidence, latitude: r.latitude, longitude: r.longitude,
    fatalities: r.fatalities, actors: r.actors, tags: r.tags,
  })

  const scores = buildRegionRiskScores(currRows.map(toDTO), prevRows.map(toDTO))

  let upserted = 0
  for (const s of scores) {
    await prisma.riskScore.upsert({
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
    })
    upserted++
  }

  await prisma.updateLog.create({
    data: {
      change:   `Recomputed risk scores for ${upserted} regions`,
      reason:   'Manual process run',
      source:   'process.ts',
      metadata: { upserted, regions: scores.map(s => s.region) },
    },
  })

  console.log(`✅ Upserted ${upserted} risk score records`)
  scores.forEach(s =>
    console.log(`   ${s.region.padEnd(30)} score=${s.score.toFixed(1).padStart(5)}  trend=${s.trend}  events=${s.eventCount}`),
  )
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
