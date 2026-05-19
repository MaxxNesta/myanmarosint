import { makePrisma } from './make-prisma'
const prisma = makePrisma()

async function main() {
  const [total, rss, telegram, rssEvents, telegramEvents] = await Promise.all([
    prisma.rawArticle.count(),
    prisma.rawArticle.count({ where: { sourceType: 'RSS' } }),
    prisma.rawArticle.count({ where: { sourceType: 'TELEGRAM' } }),
    prisma.conflictEvent.count({ where: { sourceType: 'RSS' } }),
    prisma.conflictEvent.count({ where: { sourceType: 'TELEGRAM' } }),
  ])
  console.log('RawArticles:    total=%d  RSS=%d  TELEGRAM=%d', total, rss, telegram)
  console.log('ConflictEvents: RSS=%d   TELEGRAM=%d', rssEvents, telegramEvents)
}
main().catch(console.error).finally(() => prisma.$disconnect())
