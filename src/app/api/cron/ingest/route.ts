export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { classifySourceReliability, calculateConfidence, deriveSeverity } from '@/lib/confidence'
import { differenceInDays } from 'date-fns'
import type { EventType } from '@/lib/types'

const ACLED_URL = 'https://api.acleddata.com/acled/read'

function mapAcledType(acledType: string): EventType {
  const t = acledType.toLowerCase()
  if (t.includes('battle') || t.includes('explosions') || t.includes('remote'))
    return 'ARMED_CONFLICT'
  if (t.includes('violence against civilians'))
    return 'HUMANITARIAN_ALERT'
  if (t.includes('protest') || t.includes('riot'))
    return 'POLITICAL_UNREST'
  return 'INFRASTRUCTURE_DISRUPTION'
}

export async function GET(req: NextRequest) {
  // Verify cron secret on production
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (process.env.NODE_ENV === 'production' && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const key   = process.env.ACLED_API_KEY
  const email = process.env.ACLED_EMAIL

  if (!key || !email) {
    return NextResponse.json({ error: 'ACLED credentials not configured' }, { status: 500 })
  }

  const url = new URL(ACLED_URL)
  url.searchParams.set('key', key)
  url.searchParams.set('email', email)
  url.searchParams.set('country', 'Myanmar')
  url.searchParams.set('limit', '500')
  url.searchParams.set('fields',
    'event_id_cnty|event_date|event_type|sub_event_type|admin1|location|latitude|longitude|source|notes|fatalities|actor1|actor2'
  )

  let acledData: Record<string, unknown>[]
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 0 } })
    const json = await res.json() as { data?: Record<string, unknown>[] }
    acledData = json.data ?? []
  } catch (err) {
    console.error('ACLED fetch failed:', err)
    return NextResponse.json({ error: 'ACLED fetch failed' }, { status: 502 })
  }

  let inserted = 0
  let skipped  = 0

  for (const row of acledData) {
    const sourceId = String(row.event_id_cnty)

    // Check for existing raw event
    const existing = await prisma.rawEvent.findUnique({ where: { sourceId } })
    if (existing) { skipped++; continue }

    // Store raw
    await prisma.rawEvent.create({
      data: { sourceId, source: 'ACLED', rawData: row as object },
    })

    // Process immediately
    const eventDate  = new Date(String(row.event_date))
    const ageDays    = differenceInDays(new Date(), eventDate)
    const reliability = classifySourceReliability('ACLED')
    const confidence  = calculateConfidence(reliability, 2, ageDays)
    const severity    = deriveSeverity(Number(row.fatalities ?? 0), String(row.sub_event_type ?? ''))
    const actors      = [row.actor1, row.actor2].filter(Boolean).map(String)

    await prisma.processedEvent.upsert({
      where: { id: sourceId },
      create: {
        id:          sourceId,
        date:        eventDate,
        region:      String(row.admin1 ?? 'Unknown'),
        adminArea:   String(row.location ?? null),
        type:        mapAcledType(String(row.event_type ?? '')),
        severity,
        summary:     String(row.notes ?? '').slice(0, 500),
        source:      'ACLED',
        reliability,
        confidence,
        latitude:    row.latitude  ? Number(row.latitude)  : null,
        longitude:   row.longitude ? Number(row.longitude) : null,
        fatalities:  Number(row.fatalities ?? 0),
        actors,
        tags:        [String(row.event_type), String(row.sub_event_type)].filter(Boolean),
        rawEventId:  sourceId,
      },
      update: { confidence, severity, updatedAt: new Date() },
    })

    await prisma.rawEvent.update({
      where: { sourceId },
      data:  { processed: true },
    })

    inserted++
  }

  await prisma.updateLog.create({
    data: {
      change: `Ingested ${inserted} new events, skipped ${skipped} duplicates from ACLED`,
      reason: 'Scheduled 6-hour ingestion',
      source: 'ACLED API',
      metadata: { inserted, skipped, total: acledData.length },
    },
  })

  return NextResponse.json({ inserted, skipped, total: acledData.length })
}
