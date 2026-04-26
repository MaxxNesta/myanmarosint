export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { fetchAllFeeds } from '@/lib/rss'

export async function GET() {
  const items = await fetchAllFeeds()

  let saved   = 0
  let skipped = 0

  for (const item of items) {
    if (!item.url || !item.title) { skipped++; continue }

    const exists = await prisma.rawArticle.findUnique({ where: { url: item.url } })
    if (exists) { skipped++; continue }

    const text = `${item.title} ${item.content}`.toLowerCase()
    const relevant =
      text.includes('myanmar') ||
      text.includes('burma')   ||
      text.includes('tatmadaw') ||
      text.includes('junta')   ||
      text.includes('pdf')     ||
      text.includes('nug')     ||
      text.includes('sagaing') ||
      text.includes('arakan')  ||
      text.includes('kachin')  ||
      text.includes('shan')

    if (!relevant) { skipped++; continue }

    await prisma.rawArticle.create({
      data: {
        url:         item.url,
        title:       item.title,
        content:     `${item.title}\n\n${item.content}`,
        sourceName:  item.sourceName,
        publishedAt: item.publishedAt ?? undefined,
      },
    })
    saved++
  }

  return NextResponse.json({ fetched: items.length, saved, skipped })
}
