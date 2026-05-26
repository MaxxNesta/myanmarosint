export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { differenceInDays } from 'date-fns'
import prisma from '@/lib/db'
import { resolveCoordinates } from '@/lib/geocoding'
import { findBestDuplicate } from '@/lib/similarity'
import {
  getBaseReliability,
  scoreToEnum,
  calculateEventConfidence,
  bayesianReliability,
} from '@/lib/confidence'
import type { EventType } from '@/lib/types'

const groq  = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' })
const BATCH = 20

// ─── Event type mapping ───────────────────────────────────────────────────────

function mapEventType(t: string): EventType {
  switch (t) {
    case 'clash':
    case 'airstrike':
    case 'shelling':
    case 'seized':
    case 'recaptured':   return 'ARMED_CONFLICT'
    case 'displacement':
    case 'humanitarian': return 'HUMANITARIAN_ALERT'
    case 'political':    return 'POLITICAL_UNREST'
    default:             return 'ARMED_CONFLICT'
  }
}

// ─── Claude output type ───────────────────────────────────────────────────────

type CasualtiesRange = {
  killed_min:   number | null
  killed_max:   number | null
  wounded_min:  number | null
  wounded_max:  number | null
  captured_min: number | null
  captured_max: number | null
}

type ClaudeEvent = {
  id:                    string
  date:                  string
  event_type:            string
  severity:              number
  reliability:           string
  bias_flag:             string
  perpetrator:           string
  target:                string
  source_article_indices: number[]  // 1-based indices into the articles array
  location: {
    township:    string
    district:    string
    state_region: string
    coordinates: [number, number]   // Claude's suggestion — will be cross-checked
  }
  casualties_range: CasualtiesRange | null
  displacement:     number | null
  source_name:      string
  source_url:       string | null
  summary:          string
}

// ─── System prompt ────────────────────────────────────────────────────────────

const OSINT_SYSTEM_PROMPT = `You are an OSINT system for Myanmar conflict analysis.

## SKIP — return {"events":[]} for:
Business / economy / trade / investment / sanctions (economic context)
Military conscription / drafting / forced recruitment / labour / workers
Diplomatic talks without active fighting
Sports, tourism, governance without violence

## EXTRACT ONLY these 8 event types:
clash | airstrike | shelling | seized | recaptured | displacement | humanitarian | political

## ACTORS
Resistance: PDF, NUG, KIA, KNLA/KNU, TNLA, MNDAA, AA, CNF, RCSS, UWSA
Junta: Tatmadaw, SAC, BGF, Pyu Saw Htee

## SEVERITY 1–5
1=unconfirmed, 2=1-3 killed, 3=4-10 killed or town seized, 4=11-50 killed or 1k+ displaced, 5=50+ killed or 10k+ displaced

## NATO RELIABILITY A–F
A=multiple confirmed, B=one trusted source, C=single open source, D=unverified, E=contradicted, F=unknown

## JSON SCHEMA
{
  "events": [
    {
      "id": "evt_<8-char-hex>",
      "date": "YYYY-MM-DD",
      "event_type": "<one of the 8 types>",
      "severity": <1-5>,
      "reliability": "<A-F>",
      "bias_flag": "neutral|pro_resistance|pro_junta|unverified_claim",
      "perpetrator": "<actor>",
      "target": "<actor or civilian>",
      "source_article_indices": [<1-based>],
      "location": {
        "township": "<Myanmar township name>",
        "district": "<district>",
        "state_region": "<state or region>",
        "coordinates": [<lng>, <lat>]
      },
      "casualties_range": {
        "killed_min": <int|null>, "killed_max": <int|null>,
        "wounded_min": <int|null>, "wounded_max": <int|null>,
        "captured_min": <int|null>, "captured_max": <int|null>
      },
      "displacement": <int|null>,
      "source_name": "<outlet>",
      "source_url": <"url"|null>,
      "summary": "<factual summary max 200 chars>"
    }
  ],
  "meta": { "processed_at": "<ISO>", "event_count": <int>, "source_articles": <int> }
}`

// ─── Groq call ────────────────────────────────────────────────────────────────

async function callGroq(
  articles: Array<{ id: string; content: string; sourceName: string; url: string }>,
): Promise<ClaudeEvent[]> {
  const body = articles
    .map((a, i) =>
      `=== ARTICLE ${i + 1} | source: ${a.sourceName} | url: ${a.url} ===\n${a.content.slice(0, 2000)}`,
    )
    .join('\n\n')

  const completion = await groq.chat.completions.create({
    model:           'llama-3.3-70b-versatile',
    response_format: { type: 'json_object' },
    max_tokens:      4096,
    temperature:     0.1,
    messages: [
      { role: 'system', content: OSINT_SYSTEM_PROMPT },
      { role: 'user',   content: `Process these ${articles.length} articles. Extract conflict events and return ONLY the JSON with "events" array.\n\n${body}` },
    ],
  })

  const raw = completion.choices[0].message.content ?? '{}'
  try {
    return (JSON.parse(raw) as { events: ClaudeEvent[] }).events ?? []
  } catch {
    return []
  }
}

// ─── Persist one event ────────────────────────────────────────────────────────

async function saveEvent(
  evt:            ClaudeEvent,
  articleIds:     string[],         // RawArticle IDs for source_article_indices
  sourceScoreMap: Map<string, number>,
): Promise<'saved' | 'merged' | 'error'> {
  try {
    const eventDate = new Date(evt.date)
    const ageDays   = differenceInDays(new Date(), eventDate)

    // Geocoding: resolve coords with our lookup table + cross-check Claude's suggestion
    const geo = resolveCoordinates(
      evt.location.township,
      evt.location.district,
      evt.location.state_region,
      evt.location.coordinates,
    )
    const [lng, lat] = geo.coords

    // Dynamic source reliability (from SourceStats cache or static base)
    const dynamicScore =
      sourceScoreMap.get(evt.source_name.toLowerCase()) ??
      getBaseReliability(evt.source_name)

    // Confidence — multi-factor
    const confidence = calculateEventConfidence({
      dynamicReliabilityScore: dynamicScore,
      sourceCount:             evt.source_article_indices.length,
      ageDays,
      coordPrecision:          geo.precision,
      biasFlag:                evt.bias_flag,
    })

    const reliability = scoreToEnum(dynamicScore)
    const actors      = [evt.perpetrator, evt.target].filter(a => a && a !== 'unknown')
    const cr          = evt.casualties_range

    // ── Dedup check ──────────────────────────────────────────────────────────
    // Fetch nearby candidates: same event type, date ±48h, coords within ~0.1°
    const windowStart = new Date(eventDate.getTime() - 48 * 3_600_000)
    const windowEnd   = new Date(eventDate.getTime() + 48 * 3_600_000)
    const LAT_DELTA   = 0.10   // ≈ 11 km
    const LNG_DELTA   = 0.11

    const candidates = await prisma.processedEvent.findMany({
      where: {
        type:      mapEventType(evt.event_type),
        date:      { gte: windowStart, lte: windowEnd },
        latitude:  { gte: lat - LAT_DELTA, lte: lat + LAT_DELTA },
        longitude: { gte: lng - LNG_DELTA, lte: lng + LNG_DELTA },
      },
      select: { id: true, latitude: true, longitude: true, date: true, summary: true,
                sourceCount: true, fatalitiesMin: true, fatalitiesMax: true,
                woundedMin: true, woundedMax: true, capturedMin: true, capturedMax: true,
                actors: true, confidence: true, severity: true },
    })

    const dup = findBestDuplicate(
      { coords: [lng, lat], date: eventDate, summary: evt.summary },
      candidates.map(c => ({
        id:        c.id,
        latitude:  c.latitude,
        longitude: c.longitude,
        date:      c.date,
        summary:   c.summary,
      })),
    )

    if (dup) {
      const existing = candidates.find(c => c.id === dup.id)!
      const newCount = (existing.sourceCount ?? 1) + (evt.source_article_indices.length > 1 ? evt.source_article_indices.length - 1 : 1)

      await prisma.processedEvent.update({
        where: { id: dup.id },
        data: {
          // Expand casualty ranges — keep the union of min/max
          fatalitiesMin:  Math.min(existing.fatalitiesMin, cr?.killed_min   ?? existing.fatalitiesMin),
          fatalitiesMax:  Math.max(existing.fatalitiesMax, cr?.killed_max   ?? existing.fatalitiesMax),
          woundedMin:     Math.min(existing.woundedMin,    cr?.wounded_min  ?? existing.woundedMin),
          woundedMax:     Math.max(existing.woundedMax,    cr?.wounded_max  ?? existing.woundedMax),
          capturedMin:    Math.min(existing.capturedMin,   cr?.captured_min ?? existing.capturedMin),
          capturedMax:    Math.max(existing.capturedMax,   cr?.captured_max ?? existing.capturedMax),
          fatalities:     Math.round(
            (Math.min(existing.fatalitiesMin, cr?.killed_min ?? existing.fatalitiesMin) +
             Math.max(existing.fatalitiesMax, cr?.killed_max ?? existing.fatalitiesMax)) / 2
          ),
          sourceCount:    newCount,
          confidence:     Math.max(existing.confidence, confidence),
          severity:       Math.max(existing.severity,   Math.min(5, Math.max(1, evt.severity))),
          actors:         [...new Set([...existing.actors, ...actors])],
          updatedAt:      new Date(),
        },
      })

      // Link source articles to the existing event
      await linkArticles(dup.id, articleIds, evt.source_article_indices)
      return 'merged'
    }

    // ── New event ────────────────────────────────────────────────────────────
    const killed_min  = cr?.killed_min   ?? 0
    const killed_max  = cr?.killed_max   ?? 0

    const created = await prisma.processedEvent.create({
      data: {
        id:             evt.id,
        date:           eventDate,
        country:        'Myanmar',
        region:         evt.location.state_region,
        adminArea:      evt.location.township || null,
        type:           mapEventType(evt.event_type),
        severity:       Math.min(5, Math.max(1, evt.severity)),
        summary:        evt.summary.slice(0, 500),
        source:         evt.source_name,
        sourceUrl:      evt.source_url ?? null,
        reliability,
        confidence,
        latitude:       lat,
        longitude:      lng,
        coordPrecision: geo.precision,
        fatalities:     Math.round(((killed_min ?? 0) + (killed_max ?? 0)) / 2),
        fatalitiesMin:  killed_min  ?? 0,
        fatalitiesMax:  killed_max  ?? 0,
        woundedMin:     cr?.wounded_min  ?? 0,
        woundedMax:     cr?.wounded_max  ?? 0,
        capturedMin:    cr?.captured_min ?? 0,
        capturedMax:    cr?.captured_max ?? 0,
        displacement:   evt.displacement ?? null,
        sourceCount:    evt.source_article_indices.length || 1,
        actors,
        tags:           [evt.event_type, evt.bias_flag, evt.perpetrator].filter(Boolean),
      },
    })

    await linkArticles(created.id, articleIds, evt.source_article_indices)
    return 'saved'
  } catch (err) {
    if (String(err).includes('Unique constraint')) return 'merged'
    console.error('saveEvent error:', err)
    return 'error'
  }
}

async function linkArticles(
  eventId:        string,
  batchArticleIds: string[],
  indices:         number[],   // 1-based
) {
  const ids = indices
    .map(i => batchArticleIds[i - 1])
    .filter(Boolean)

  if (ids.length === 0) return

  await prisma.eventArticle.createMany({
    data:           ids.map(rawArticleId => ({ processedEventId: eventId, rawArticleId })),
    skipDuplicates: true,
  })
}

// ─── Update dynamic source reliability ───────────────────────────────────────

async function updateSourceStats(events: ClaudeEvent[]) {
  // Group events by source, count corroborations (events with ≥2 source indices)
  const stats = new Map<string, { total: number; corroborated: number }>()
  for (const evt of events) {
    const key = evt.source_name.toLowerCase()
    const s   = stats.get(key) ?? { total: 0, corroborated: 0 }
    s.total++
    if ((evt.source_article_indices?.length ?? 0) >= 2) s.corroborated++
    stats.set(key, s)
  }

  for (const [sourceName, { total, corroborated }] of stats.entries()) {
    const existing = await prisma.sourceStats.findUnique({ where: { sourceName } })
    const newTotal = (existing?.totalEvents ?? 0) + total
    const newCorr  = (existing?.corroborated ?? 0) + corroborated
    const score    = bayesianReliability(sourceName, newTotal, newCorr)

    await prisma.sourceStats.upsert({
      where:  { sourceName },
      create: { sourceName, totalEvents: total, corroborated, reliabilityScore: score },
      update: { totalEvents: newTotal, corroborated: newCorr, reliabilityScore: score },
    })
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (process.env.NODE_ENV === 'production' && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 })
  }

  const articles = await prisma.rawArticle.findMany({
    where:   { processed: false },
    orderBy: { ingestedAt: 'asc' },
    take:    BATCH,
  })

  if (articles.length === 0) {
    return NextResponse.json({ message: 'No unprocessed articles', processed: 0 })
  }

  // Pre-load dynamic reliability scores for sources in this batch
  const sourceNames = [...new Set(articles.map(a => a.sourceName.toLowerCase()))]
  const storedStats = await prisma.sourceStats.findMany({
    where: { sourceName: { in: sourceNames } },
  })
  const scoreMap = new Map(storedStats.map(s => [s.sourceName, s.reliabilityScore]))

  // Groq extraction
  let events: ClaudeEvent[] = []
  try {
    events = await callGroq(
      articles.map(a => ({ id: a.id, content: a.content, sourceName: a.sourceName, url: a.url })),
    )
  } catch (err) {
    return NextResponse.json({ error: 'Groq processing failed', detail: String(err) }, { status: 500 })
  }

  const articleIds = articles.map(a => a.id)

  // Save with dedup, geocoding, casualties range, source tracing
  let saved = 0, merged = 0, errors = 0
  for (const evt of events) {
    const r = await saveEvent(evt, articleIds, scoreMap)
    if (r === 'saved')  saved++
    if (r === 'merged') merged++
    if (r === 'error')  errors++
  }

  // Mark articles processed
  await prisma.rawArticle.updateMany({
    where: { id: { in: articleIds } },
    data:  { processed: true },
  })

  // Update dynamic source reliability
  await updateSourceStats(events)

  await prisma.updateLog.create({
    data: {
      change:   `Processed ${articles.length} articles → ${saved} new events, ${merged} merged`,
      reason:   'Automated Groq OSINT pipeline',
      source:   'AI Extraction',
      metadata: { articles: articles.length, events: events.length, saved, merged, errors },
    },
  })

  return NextResponse.json({ articles: articles.length, events: events.length, saved, merged, errors })
}
