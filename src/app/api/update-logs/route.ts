export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? '50'), 200)

  try {
    const logs = await prisma.updateLog.findMany({
      orderBy: { timestamp: 'desc' },
      take:    limit,
      select:  { id: true, timestamp: true, change: true, reason: true, source: true, metadata: true },
    })

    return NextResponse.json({ logs }, {
      headers: { 'Cache-Control': 's-maxage=300' },
    })
  } catch (err) {
    console.error('GET /api/update-logs error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
