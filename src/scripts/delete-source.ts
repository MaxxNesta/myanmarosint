import { makePrisma } from './make-prisma'

const prisma = makePrisma()

const SOURCES = [
  'Hmi Ne Wai',
]

async function main() {
  for (const SOURCE of SOURCES) {
    // Must delete EventArticle join rows before RawArticle (FK constraint)
    const rawIds = await prisma.rawArticle.findMany({
      where:  { sourceName: SOURCE },
      select: { id: true },
    })
    const ids = rawIds.map(r => r.id)

    const ea = ids.length > 0
      ? await prisma.eventArticle.deleteMany({ where: { rawArticleId: { in: ids } } })
      : { count: 0 }

    const ce = await prisma.conflictEvent.deleteMany({ where: { sourceName: SOURCE } })
    const ra = await prisma.rawArticle.deleteMany({ where: { sourceName: SOURCE } })
    const ss = await prisma.sourceStats.deleteMany({ where: { sourceName: SOURCE } })
    const re = await prisma.rawEvent.deleteMany({ where: { source: SOURCE } })

    console.log(`"${SOURCE}" → deleted: ${ra.count} RawArticles, ${ea.count} EventArticle links, ${ce.count} ConflictEvents, ${ss.count} SourceStats, ${re.count} RawEvents`)
  }
  console.log('Done.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
