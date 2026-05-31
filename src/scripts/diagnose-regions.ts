import { makePrisma } from './make-prisma'

const prisma = makePrisma()

async function main() {
  const myanmarEvents = await prisma.conflictEvent.findMany({
    where: {
      region: 'Myanmar',
      analysedEvent: { isActiveIntelligence: true },
    },
    include: {
      rawArticle: { select: { title: true, content: true, channelName: true } },
      analysedEvent: { select: { summary: true, confidence: true } },
    },
    orderBy: { date: 'desc' },
  })

  console.log(`\n=== ${myanmarEvents.length} events with region="Myanmar" ===\n`)
  for (const ev of myanmarEvents) {
    console.log(`[${ev.eventType}] ${ev.date.toISOString().slice(0, 10)}`)
    console.log(`  Title:    ${ev.rawArticle.title.slice(0, 90)}`)
    console.log(`  Location: ${ev.location ?? 'null'} | Admin: ${ev.adminArea ?? 'null'}`)
    console.log(`  Summary:  ${ev.analysedEvent?.summary?.slice(0, 100) ?? 'N/A'}`)
    console.log(`  Source:   ${ev.rawArticle.channelName}`)
    console.log()
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
