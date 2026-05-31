import { makePrisma } from './make-prisma'

const prisma = makePrisma()

async function main() {
  const result = await prisma.$queryRaw<{ total: string; tbl: string }[]>`
    SELECT
      relname::text AS tbl,
      pg_size_pretty(pg_total_relation_size(relid)) AS total
    FROM pg_catalog.pg_statio_user_tables
    ORDER BY pg_total_relation_size(relid) DESC
  `

  const dbSize = await prisma.$queryRaw<{ size: string }[]>`
    SELECT pg_size_pretty(pg_database_size(current_database())) AS size
  `

  console.log('\nTable sizes:')
  for (const r of result) {
    console.log(`  ${r.tbl.padEnd(30)} ${r.total}`)
  }
  console.log(`\nTotal DB size: ${dbSize[0]?.size}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
