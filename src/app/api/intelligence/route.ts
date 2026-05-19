export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import {
  getRegionVolatility,
  detectEscalation,
  getActorActivity,
  getTerritorialControl,
} from '@/lib/derived-intelligence'

export async function GET(req: NextRequest) {
  const sp       = req.nextUrl.searchParams
  const days     = Math.min(365, Math.max(1, parseInt(sp.get('days') ?? '30')))
  const window   = Math.min(90,  Math.max(1, parseInt(sp.get('window') ?? '7')))

  try {
    const [volatility, escalation, actorActivity, control] = await Promise.all([
      getRegionVolatility(prisma, days),
      detectEscalation(prisma, window),
      getActorActivity(prisma, days),
      getTerritorialControl(prisma),
    ])

    return NextResponse.json(
      { volatility, escalation, actorActivity, control, generatedAt: new Date() },
      { headers: { 'Cache-Control': 's-maxage=600, stale-while-revalidate=1800' } },
    )
  } catch (err) {
    console.error('GET /api/intelligence error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
