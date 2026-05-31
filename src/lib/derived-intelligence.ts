import { PrismaClient } from '@prisma/client'

const INTEL_START  = new Date('2023-01-01T00:00:00Z')
const SKIP_REGIONS = new Set(['Myanmar', 'Burma', '', 'unknown'])

function effectiveStart(since: Date): Date {
  return since < INTEL_START ? INTEL_START : since
}

// ── Territorial control ───────────────────────────────────────────────────────

export interface TerritorialControl {
  region:      string
  adminArea:   string | null
  seizedBy:    string | null
  controlType: 'SEIZED' | 'RECAPTURED' | 'CONTESTED'
  lastEvent:   Date
}

export async function getTerritorialControl(
  prisma: PrismaClient,
  region?: string,
): Promise<TerritorialControl[]> {
  const rows = await prisma.analysedEvent.findMany({
    where: {
      isActiveIntelligence: true,
      conflictEvent: {
        date:      { gte: INTEL_START },
        eventType: { in: ['SIEGE_SEIZED', 'RECAPTURED'] },
        ...(region ? { region } : {}),
      },
    },
    include: { conflictEvent: true },
    orderBy: { conflictEvent: { date: 'desc' } },
  })

  const seen    = new Set<string>()
  const results: TerritorialControl[] = []

  for (const row of rows) {
    const ev  = row.conflictEvent
    const key = `${ev.region}|${ev.adminArea ?? ''}`
    if (seen.has(key)) continue
    seen.add(key)

    let seizedBy:    string | null = null
    let controlType: 'SEIZED' | 'RECAPTURED' | 'CONTESTED' = 'CONTESTED'

    if (ev.eventType === 'SIEGE_SEIZED') {
      seizedBy    = row.attackerActor ?? row.actors[0] ?? null
      controlType = 'SEIZED'
    } else if (ev.eventType === 'RECAPTURED') {
      seizedBy    = row.defenderActor ?? row.actors[0] ?? null
      controlType = 'RECAPTURED'
    }

    results.push({ region: ev.region, adminArea: ev.adminArea, seizedBy, controlType, lastEvent: ev.date })
  }

  return results
}

// ── Region volatility ─────────────────────────────────────────────────────────

export interface RegionVolatility {
  region:          string
  eventCount:      number
  avgConfidence:   number
  uniqueActors:    string[]
  hotEventTypes:   string[]
  fatalitiesTotal: number
  lastActivity:    Date
  volatilityScore: number
}

export async function getRegionVolatility(
  prisma: PrismaClient,
  days = 30,
): Promise<RegionVolatility[]> {
  const since = effectiveStart(new Date(Date.now() - days * 864e5))

  const rows = await prisma.analysedEvent.findMany({
    where: {
      isActiveIntelligence: true,
      conflictEvent: { date: { gte: since } },
    },
    include: { conflictEvent: true },
  })

  const byRegion = new Map<string, typeof rows>()
  for (const row of rows) {
    const region = row.conflictEvent.region
    if (SKIP_REGIONS.has(region)) continue
    const list = byRegion.get(region) ?? []
    list.push(row)
    byRegion.set(region, list)
  }

  const results: RegionVolatility[] = []
  for (const [region, evs] of byRegion) {
    const actors   = [...new Set(evs.flatMap(e => e.actors))]
    const typeCnts = new Map<string, number>()
    evs.forEach(e => typeCnts.set(e.conflictEvent.eventType, (typeCnts.get(e.conflictEvent.eventType) ?? 0) + 1))
    const hotTypes  = [...typeCnts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t)
    const avgConf   = evs.reduce((s, e) => s + e.confidence, 0) / evs.length
    const fatals    = evs.reduce((s, e) => s + e.conflictEvent.fatalities, 0)
    const lastAct   = evs.reduce((l, e) => e.conflictEvent.date > l ? e.conflictEvent.date : l, evs[0].conflictEvent.date)

    const countNorm   = Math.min(1, evs.length / 50)
    const actorNorm   = Math.min(1, actors.length / 8)
    const fatalNorm   = Math.min(1, fatals / 100)
    const ageDays     = (Date.now() - lastAct.getTime()) / 864e5
    const recencyNorm = Math.exp(-ageDays / 7)
    const score       = Math.min(100, Math.round(
      countNorm * 40 + actorNorm * 20 + fatalNorm * 25 + recencyNorm * 15
    ))

    results.push({ region, eventCount: evs.length, avgConfidence: Math.round(avgConf * 100) / 100,
      uniqueActors: actors, hotEventTypes: hotTypes, fatalitiesTotal: fatals, lastActivity: lastAct, volatilityScore: score })
  }

  return results.sort((a, b) => b.volatilityScore - a.volatilityScore)
}

// ── Actor activity ────────────────────────────────────────────────────────────

export interface ActorActivity {
  actor:           string
  eventCount:      number
  regions:         string[]
  eventTypes:      string[]
  fatalitiesTotal: number
  lastActive:      Date
}

export async function getActorActivity(
  prisma: PrismaClient,
  days = 90,
): Promise<ActorActivity[]> {
  const since = effectiveStart(new Date(Date.now() - days * 864e5))

  const rows = await prisma.analysedEvent.findMany({
    where: {
      isActiveIntelligence: true,
      conflictEvent: { date: { gte: since } },
    },
    include: { conflictEvent: true },
  })

  const byActor = new Map<string, { regions: Set<string>; types: Set<string>; count: number; fatals: number; last: Date }>()

  for (const row of rows) {
    for (const actor of row.actors) {
      const entry = byActor.get(actor) ?? { regions: new Set(), types: new Set(), count: 0, fatals: 0, last: row.conflictEvent.date }
      entry.regions.add(row.conflictEvent.region)
      entry.types.add(row.conflictEvent.eventType)
      entry.count++
      entry.fatals += row.conflictEvent.fatalities
      if (row.conflictEvent.date > entry.last) entry.last = row.conflictEvent.date
      byActor.set(actor, entry)
    }
  }

  return [...byActor.entries()].map(([actor, d]) => ({
    actor, eventCount: d.count, regions: [...d.regions], eventTypes: [...d.types],
    fatalitiesTotal: d.fatals, lastActive: d.last,
  })).sort((a, b) => b.eventCount - a.eventCount)
}

// ── Escalation detection ──────────────────────────────────────────────────────

export interface EscalationSignal {
  region:       string
  windowEvents: number
  priorEvents:  number
  deltaPercent: number
  topActors:    string[]
  isEscalating: boolean
}

export async function detectEscalation(
  prisma: PrismaClient,
  windowDays = 7,
): Promise<EscalationSignal[]> {
  const now         = Date.now()
  const windowStart = effectiveStart(new Date(now - windowDays * 864e5))
  const priorStart  = effectiveStart(new Date(now - windowDays * 2 * 864e5))
  const priorEnd    = windowStart

  const [windowRows, priorRows] = await Promise.all([
    prisma.analysedEvent.findMany({
      where: { isActiveIntelligence: true, conflictEvent: { date: { gte: windowStart } } },
      include: { conflictEvent: true },
    }),
    prisma.analysedEvent.findMany({
      where: { isActiveIntelligence: true, conflictEvent: { date: { gte: priorStart, lt: priorEnd } } },
      include: { conflictEvent: true },
    }),
  ])

  const windowByRegion = new Map<string, typeof windowRows>()
  for (const row of windowRows) {
    const region = row.conflictEvent.region
    if (SKIP_REGIONS.has(region)) continue
    const list = windowByRegion.get(region) ?? []
    list.push(row)
    windowByRegion.set(region, list)
  }

  const priorByRegion = new Map<string, number>()
  for (const row of priorRows) {
    const region = row.conflictEvent.region
    if (SKIP_REGIONS.has(region)) continue
    priorByRegion.set(region, (priorByRegion.get(region) ?? 0) + 1)
  }

  const results: EscalationSignal[] = []
  for (const [region, evs] of windowByRegion) {
    const wCount      = evs.length
    const pCount      = priorByRegion.get(region) ?? 0
    const hasBaseline = pCount > 0
    const delta       = hasBaseline ? Math.round(((wCount - pCount) / pCount) * 100) : 0
    const actors      = [...new Set(evs.flatMap(e => e.actors))].slice(0, 5)

    results.push({
      region, windowEvents: wCount, priorEvents: pCount,
      deltaPercent:  delta,
      topActors:     actors,
      isEscalating:  hasBaseline && delta >= 25 && wCount >= 3,
    })
  }

  return results.sort((a, b) => b.deltaPercent - a.deltaPercent)
}
