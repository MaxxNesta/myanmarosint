export const dynamic    = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'

const BASE = process.env.NEXT_PUBLIC_APP_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

const headers = () => ({
  Authorization:  `Bearer ${process.env.CRON_SECRET ?? ''}`,
  'Content-Type': 'application/json',
  'cache':        'no-store',
})

// POST /api/admin/pipeline?step=scrape|extract
export async function POST(req: NextRequest) {
  const step = req.nextUrl.searchParams.get('step')

  if (step === 'scrape') {
    const res  = await fetch(`${BASE}/api/scrape`, { headers: headers() })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  }

  if (step === 'extract') {
    const res  = await fetch(`${BASE}/api/cron/extract`, { headers: headers() })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  }

  return NextResponse.json({ error: 'Unknown step' }, { status: 400 })
}
