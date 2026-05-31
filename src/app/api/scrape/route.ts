export const dynamic = 'force-dynamic'
export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { fetchAllFeeds } from '@/lib/rss'

const KEYWORDS = [
  'myanmar','burma','tatmadaw','junta','pdf','nug','sagaing','arakan',
  'kachin','shan','chin','karenni','kayah','rakhine','karen','tedim','tiddim','mandalay',
]

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (process.env.NODE_ENV === 'production' && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const items = await fetchAllFeeds()
  let saved = 0, skipped = 0

  for (const item of items) {
    if (!item.url || !item.title) { skipped++; continue }

    const exists = await prisma.rawArticle.findUnique({ where: { url: item.url } })
    if (exists) { skipped++; continue }

    const text = `${item.title} ${item.content}`.toLowerCase()
    if (!KEYWORDS.some(k => text.includes(k))) { skipped++; continue }

    await prisma.rawArticle.create({
      data: {
        url:         item.url,
        channelName: item.sourceName,
        title:       item.title,
        content:     `${item.title}\n\n${item.content}`,
        publishedAt: item.publishedAt ?? undefined,
        sourceType:  'RSS',
      },
    })
    saved++
  }

  return NextResponse.json({ fetched: items.length, saved, skipped })
}
