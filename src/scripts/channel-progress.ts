/**
 * Show extraction progress for a specific channel.
 * Usage: tsx --env-file=.env.local src/scripts/channel-progress.ts "Myanmar Now TG"
 */
import { makePrisma } from './make-prisma'

const prisma      = makePrisma()
const channelName = process.argv[2] ?? 'Myanmar Now TG'

async function main() {
  const [total, unextracted, events] = await Promise.all([
    prisma.rawArticle.count({ where: { channelName } }),
    prisma.rawArticle.count({ where: { channelName, conflictEvents: { none: {} } } }),
    prisma.conflictEvent.count({
      where: {
        rawArticle:   { channelName },
        analysedEvent: { isActiveIntelligence: true },
      },
    }),
  ])

  const extracted = total - unextracted
  const pct       = total > 0 ? Math.round((extracted / total) * 100) : 0
  const bar       = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5))

  console.log(`\nChannel: ${channelName}`)
  console.log(`  [${bar}] ${pct}%`)
  console.log(`  Processed : ${extracted} / ${total}`)
  console.log(`  Remaining : ${unextracted}`)
  console.log(`  Map events: ${events}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
