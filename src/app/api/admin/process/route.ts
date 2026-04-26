export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

const BASE   = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const SECRET = process.env.CRON_SECRET ?? ''

export async function GET() {
  const res  = await fetch(`${BASE}/api/cron/process`, {
    cache:   'no-store',
    headers: { Authorization: `Bearer ${SECRET}` },
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
