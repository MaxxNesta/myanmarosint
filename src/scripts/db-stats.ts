import { makePrisma } from './make-prisma'

const prisma = makePrisma()

async function main() {
  const [
    totalArticles,
    articlesFrom2021,
    unextracted2021,
    totalConflict,
    activeEvents,
    skipMarkers,
    oldestArticle,
    newestArticle,
  ] = await Promise.all([
    prisma.rawArticle.count(),
    prisma.rawArticle.count({ where: { publishedAt: { gte: new Date('2021-02-01') } } }),
    prisma.rawArticle.count({ where: { publishedAt: { gte: new Date('2021-02-01') }, conflictEvents: { none: {} } } }),
    prisma.conflictEvent.count(),
    prisma.analysedEvent.count({ where: { isActiveIntelligence: true } }),
    prisma.analysedEvent.count({ where: { isActiveIntelligence: false } }),
    prisma.rawArticle.findFirst({ orderBy: { publishedAt: 'asc' }, select: { publishedAt: true, channelName: true } }),
    prisma.rawArticle.findFirst({ orderBy: { publishedAt: 'desc' }, select: { publishedAt: true, channelName: true } }),
  ])

  // Sample event type distribution
  const eventTypeDist = await prisma.conflictEvent.groupBy({
    by: ['eventType'],
    _count: { eventType: true },
    orderBy: { _count: { eventType: 'desc' } },
  })

  // Region distribution
  const regionDist = await prisma.conflictEvent.groupBy({
    by: ['region'],
    _count: { region: true },
    orderBy: { _count: { region: 'desc' } },
    take: 10,
  })

  // Articles by year
  const years = [2021, 2022, 2023, 2024, 2025, 2026]
  const articlesByYear: Record<string, number> = {}
  for (const y of years) {
    articlesByYear[y] = await prisma.rawArticle.count({
      where: {
        publishedAt: {
          gte: new Date(`${y}-01-01`),
          lt:  new Date(`${y + 1}-01-01`),
        }
      }
    })
  }

  // Unextracted by year
  const unextractedByYear: Record<string, number> = {}
  for (const y of years) {
    unextractedByYear[y] = await prisma.rawArticle.count({
      where: {
        publishedAt: {
          gte: new Date(`${y}-01-01`),
          lt:  new Date(`${y + 1}-01-01`),
        },
        conflictEvents: { none: {} },
      }
    })
  }

  console.log('\n=== DATABASE STATS ===')
  console.log(`Total RawArticles:        ${totalArticles}`)
  console.log(`Articles from 2021-02-01: ${articlesFrom2021}`)
  console.log(`Unextracted from 2021:    ${unextracted2021}`)
  console.log(`Total ConflictEvents:     ${totalConflict}`)
  console.log(`Active (on map) events:   ${activeEvents}`)
  console.log(`Skip markers (inactive):  ${skipMarkers}`)
  console.log(`Oldest article:           ${oldestArticle?.publishedAt?.toISOString()} (${oldestArticle?.channelName})`)
  console.log(`Newest article:           ${newestArticle?.publishedAt?.toISOString()} (${newestArticle?.channelName})`)

  console.log('\n=== ARTICLES BY YEAR ===')
  for (const y of years) {
    const total  = articlesByYear[y]
    const unex   = unextractedByYear[y]
    const done   = total - unex
    const pct    = total > 0 ? Math.round((done / total) * 100) : 0
    console.log(`  ${y}: ${total.toString().padStart(6)} articles | ${done.toString().padStart(6)} extracted (${pct}%) | ${unex} unextracted`)
  }

  console.log('\n=== EVENT TYPE DISTRIBUTION ===')
  for (const row of eventTypeDist) {
    console.log(`  ${row.eventType.padEnd(24)} ${row._count.eventType}`)
  }

  console.log('\n=== TOP REGIONS ===')
  for (const row of regionDist) {
    console.log(`  ${row.region.padEnd(30)} ${row._count.region}`)
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
