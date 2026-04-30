/**
 * One-time backfill: tag existing RawArticle rows with the correct sourceType.
 * - Articles from TELEGRAM_SOURCES channel names → 'TELEGRAM'
 * - Everything else stays 'RSS'
 * Run: tsx --env-file=.env.local src/scripts/backfill-source-types.ts
 */
import { PrismaClient } from '@prisma/client'
import { TELEGRAM_SOURCES } from '../lib/rss'


const prisma = new PrismaClient()
const TELEGRAM_NAMES = new Set(TELEGRAM_SOURCES.map(s => s.name))

async function main() {
  console.log(`🔄 Backfilling sourceType for ${TELEGRAM_NAMES.size} Telegram source names…`)

  let updated = 0
  for (const name of TELEGRAM_NAMES) {
    const result = await prisma.rawArticle.updateMany({
      where: { sourceName: name, sourceType: 'RSS' },
      data:  { sourceType: 'TELEGRAM' },
    })
    if (result.count > 0) {
      console.log(`  ${name}: ${result.count} articles → TELEGRAM`)
      updated += result.count
    }
  }

  // Also backfill ConflictEvent.sourceType via its sourceName
  let ceUpdated = 0
  for (const name of TELEGRAM_NAMES) {
    const result = await prisma.conflictEvent.updateMany({
      where: { sourceName: name, sourceType: 'RSS' },
      data:  { sourceType: 'TELEGRAM' },
    })
    ceUpdated += result.count
  }

  console.log(`\n✅ RawArticle: ${updated} rows updated`)
  console.log(`✅ ConflictEvent: ${ceUpdated} rows updated`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
