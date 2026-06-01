export const dynamic = 'force-dynamic'
export const maxDuration = 300

import { NextRequest, NextResponse } from 'next/server'
import { purgeExpiredRateLimits } from '@/lib/rate-limit'

const BASE = process.env.NEXT_PUBLIC_APP_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

function authHeaders(req: NextRequest) {
  const secret = req.headers.get('authorization') ?? ''
  return { Authorization: secret, 'Content-Type': 'application/json' }
}

/**
 * GET /api/cron/ingest  — Vercel Cron entry point (runs every 6 hours)
 *
 * Orchestrates the full automated pipeline:
 *   1. /api/scrape          — fetch all Myanmar news RSS feeds → save new RawArticles
 *   2. /api/cron/process    — run unprocessed articles through Claude OSINT pipeline → save ProcessedEvents
 *   3. /api/cron/extract    — extract ConflictEvents from recent articles → populate conflict map
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

  // Step 2 — Extract ConflictEvents + AnalysedEvents (loop to drain 7-day backlog)
  results.extract = []
  for (let i = 0; i < 4; i++) {
    try {
      const extractRes = await fetch(`${BASE}/api/cron/extract`, { cache: 'no-store', headers })
      const data       = await extractRes.json() as { message?: string; articles?: number }
      ;(results.extract as unknown[]).push(data)
      if (data.message || (data.articles ?? 0) === 0) break
    } catch (err) {
      ;(results.extract as unknown[]).push({ error: String(err) })
      break
    }
  }

  // Purge stale rate-limit records
  try { await purgeExpiredRateLimits() } catch { /* non-critical */ }

  return NextResponse.json({ ok: true, ...results })
}
