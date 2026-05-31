export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { subDays } from 'date-fns'
import { z } from 'zod'
import { BATTLE_EVENT_TYPES } from '@/lib/event-extractor'

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
  battleOnly:    z.coerce.boolean().default(true),
})

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams)
  const parsed = querySchema.safeParse(params)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { region, eventType, actor, sourceType, startDate, endDate, days, limit, minConfidence, activeOnly, battleOnly } = parsed.data

  // Filters on AnalysedEvent
  const analysedWhere: Record<string, unknown> = {}
  if (activeOnly)                  analysedWhere.isActiveIntelligence = true
  if (minConfidence !== undefined) analysedWhere.confidence = { gte: minConfidence }
  if (actor)                       analysedWhere.actors = { has: actor }

  // Filters on nested ConflictEvent
  const conflictWhere: Record<string, unknown> = {}
  if (region)     conflictWhere.region = { contains: region, mode: 'insensitive' }
  if (eventType)  conflictWhere.eventType = eventType
  else if (battleOnly) conflictWhere.eventType = { in: BATTLE_EVENT_TYPES }

  const dateFilter: Record<string, unknown> = {}
  if (startDate) dateFilter.gte = new Date(startDate)
  if (endDate)   dateFilter.lte = new Date(endDate)
  if (days && !startDate && !endDate) dateFilter.gte = subDays(new Date(), days)
  if (Object.keys(dateFilter).length) conflictWhere.date = dateFilter

  // Filters on nested RawArticle
  const rawWhere: Record<string, unknown> = {}
  if (sourceType) rawWhere.sourceType = sourceType

  if (Object.keys(conflictWhere).length) analysedWhere.conflictEvent = conflictWhere
  if (Object.keys(rawWhere).length && analysedWhere.conflictEvent) {
    (analysedWhere.conflictEvent as Record<string, unknown>).rawArticle = rawWhere
  }

  try {
    const [rows, total] = await Promise.all([
      prisma.analysedEvent.findMany({
        where:   analysedWhere,
        orderBy: { conflictEvent: { date: 'desc' } },
        take:    limit,
        include: {
          conflictEvent: {
            include: { rawArticle: true },
          },
        },
      }),
      prisma.analysedEvent.count({ where: analysedWhere }),
    ])

    // Flatten into the shape the map/frontend expects
    const events = rows.map(a => ({
      id:            a.conflictEvent.id,
      eventType:     a.conflictEvent.eventType,
      date:          a.conflictEvent.date.toISOString(),
      region:        a.conflictEvent.region,
      adminArea:     a.conflictEvent.adminArea,
      location:      a.conflictEvent.location,
      lat:           a.conflictEvent.lat,
      lng:           a.conflictEvent.lng,
      attackerActor: a.attackerActor,
      defenderActor: a.defenderActor,
      actors:        a.actors,
      summary:       a.summary,
      fatalities:    a.conflictEvent.fatalities,
      fatalitiesMin: a.conflictEvent.fatalitiesMin,
      fatalitiesMax: a.conflictEvent.fatalitiesMax,
      sourceUrl:     a.conflictEvent.rawArticle.url,
      sourceName:    a.conflictEvent.rawArticle.channelName,
      sourceType:    a.conflictEvent.rawArticle.sourceType,
      biasFlag:      a.conflictEvent.biasFlag,
      confidence:    a.confidence,
    }))

    return NextResponse.json({ events, total, limit }, {
      headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' },
    })
  } catch (err) {
    console.error('GET /api/conflict-events error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
