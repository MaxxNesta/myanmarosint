import { makePrisma } from './make-prisma'

const prisma = makePrisma()
const SOURCE = 'AAPP Burma'

async function main() {
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

  console.log(`Deleted: ${ce.count} ConflictEvents, ${ea.count} EventArticle links, ${ra.count} RawArticles for "${SOURCE}"`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
