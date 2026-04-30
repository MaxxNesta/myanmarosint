export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { subDays } from 'date-fns'
import { z } from 'zod'

const querySchema = z.object({
  region:        z.string().optional(),
  eventType:     z.string().optional(),
  actor:         z.string().optional(),
  sourceType:    z.string().optional(),
  startDate:     z.string().optional(),
  endDate:       z.string().optional(),
  days:          z.coerce.number().min(1).max(3650).optional(),
  limit:         z.coerce.number().min(1).max(5000).default(1000),
  minConfidence: z.coerce.number().min(0).max(1).optional(),
  activeOnly:    z.coerce.boolean().default(true),
})

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams)
  const parsed = querySchema.safeParse(params)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { region, eventType, actor, sourceType, startDate, endDate, days, limit, minConfidence, activeOnly } = parsed.data

  const where: Record<string, unknown> = {}

  if (activeOnly)                      where.isActiveIntelligence = true
  if (region)                          where.region = { contains: region, mode: 'insensitive' }
  if (eventType)                       where.eventType = eventType
  if (sourceType)                      where.sourceType = sourceType
  if (minConfidence !== undefined)     where.confidence = { gte: minConfidence }
  if (actor)                           where.actors = { has: actor }

  const dateFilter: Record<string, unknown> = {}
  if (startDate) dateFilter.gte = new Date(startDate)
  if (endDate)   dateFilter.lte = new Date(endDate)
  if (days && !startDate && !endDate)  dateFilter.gte = subDays(new Date(), days)
  if (Object.keys(dateFilter).length)  where.date = dateFilter

  try {
    const [events, total] = await Promise.all([
      prisma.conflictEvent.findMany({
        where,
        orderBy: { date: 'desc' },
        take: limit,
        select: {
          id: true, eventType: true, date: true, region: true, adminArea: true,
          location: true, lat: true, lng: true, actors: true,
          attackerActor: true, defenderActor: true, summary: true,
          fatalities: true, fatalitiesMin: true, fatalitiesMax: true,
          sourceUrl: true, sourceName: true, sourceType: true,
          biasFlag: true, confidence: true,
        },
      }),
      prisma.conflictEvent.count({ where }),
    ])

    return NextResponse.json({ events, total, limit }, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=3600' },
    })
  } catch (err) {
    console.error('GET /api/conflict-events error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
