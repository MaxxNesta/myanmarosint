import { makePrisma } from './make-prisma'

const prisma = makePrisma()

async function main() {
  const rows = await prisma.rawArticle.groupBy({
    by:      ['channelName', 'sourceType'],
    _count:  { id: true },
    orderBy: { _count: { id: 'desc' } },
  })

  console.log('\n' + 'Channel'.padEnd(32) + 'Type'.padEnd(12) + 'Posts')
  console.log('-'.repeat(55))
  for (const r of rows) {
    console.log(r.channelName.padEnd(32) + r.sourceType.padEnd(12) + r._count.id)
  }

  const total = rows.reduce((s, r) => s + r._count.id, 0)
  console.log('-'.repeat(55))
  console.log('TOTAL'.padEnd(44) + total)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
