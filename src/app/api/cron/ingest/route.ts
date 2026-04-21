export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const BASE = process.env.NEXT_PUBLIC_APP_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

function authHeaders(req: NextRequest) {
  const secret = req.headers.get('authorization') ?? ''
  return { Authorization: secret, 'Content-Type': 'application/json' }
}

/**
 * GET /api/cron/ingest  — Vercel Cron entry point (runs hourly)
 *
 * Orchestrates the full automated pipeline:
 *   1. /api/scrape        — fetch all Myanmar news RSS feeds → save new RawArticles
 *   2. /api/cron/process  — run unprocessed articles through Claude OSINT pipeline → save events
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (process.env.NODE_ENV === 'production' && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const headers = authHeaders(req)
  const results: Record<string, unknown> = {}

  // Step 1 — Scrape RSS feeds
  try {
    const scrapeRes = await fetch(`${BASE}/api/scrape`, { cache: 'no-store', headers })
    results.scrape  = await scrapeRes.json()
  } catch (err) {
    results.scrape = { error: String(err) }
  }

  // Step 2 — Process with Claude (run up to 3 batches per cron tick to drain the queue)
  results.process = []
  for (let i = 0; i < 3; i++) {
    try {
      const processRes = await fetch(`${BASE}/api/cron/process`, { cache: 'no-store', headers })
      const data       = await processRes.json() as { message?: string; articles?: number }
      ;(results.process as unknown[]).push(data)
      if (data.message === 'No unprocessed articles' || (data.articles ?? 0) === 0) break
    } catch (err) {
      ;(results.process as unknown[]).push({ error: String(err) })
      break
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
