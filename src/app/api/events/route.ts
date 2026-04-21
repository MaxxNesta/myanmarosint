export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { subDays } from 'date-fns'
import { z } from 'zod'

const querySchema = z.object({
  type:      z.string().optional(),
  region:    z.string().optional(),
  startDate: z.string().optional(),
  endDate:   z.string().optional(),
  days:      z.coerce.number().min(1).max(3650).optional(),
  limit:     z.coerce.number().min(1).max(1000).default(500),
  minConfidence: z.coerce.number().min(0).max(1).optional(),
})

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams)
  const parsed = querySchema.safeParse(params)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { type, region, startDate, endDate, days, limit, minConfidence } = parsed.data

  const where: Record<string, unknown> = {}

  if (type)   where.type   = type
  if (region) where.region = { contains: region, mode: 'insensitive' }
  if (minConfidence !== undefined) where.confidence = { gte: minConfidence }

  // Date filtering — prefer explicit range, fallback to rolling window
  const dateFilter: Record<string, unknown> = {}
  if (startDate) dateFilter.gte = new Date(startDate)
  if (endDate)   dateFilter.lte = new Date(endDate)
  if (days && !startDate && !endDate) dateFilter.gte = subDays(new Date(), days)
  if (Object.keys(dateFilter).length) where.date = dateFilter

  try {
    const [events, total] = await Promise.all([
      prisma.processedEvent.findMany({
        where,
        orderBy: { date: 'desc' },
        take: limit,
        select: {
          id: true, date: true, country: true, region: true, adminArea: true,
          type: true, severity: true, summary: true, source: true, sourceUrl: true,
          reliability: true, confidence: true, latitude: true, longitude: true,
          fatalities: true, actors: true, tags: true,
        },
      }),
      prisma.processedEvent.count({ where }),
    ])

    return NextResponse.json({ events, total, limit }, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
    })
  } catch (err) {
    console.error('GET /api/events error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
