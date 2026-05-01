export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ScenarioAnalysis } from '@/lib/analyze-types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { bases = [], events = [], area_km2 = 0, center = [96.5, 19.5] } = body

    const basesSummary = bases.length
      ? (bases as Array<{ regimentEn: string; locationEn: string; status: string; threat: string }>)
          .map(b => `  • ${b.regimentEn} at ${b.locationEn} — Status: ${b.status} — Threat: ${b.threat}`)
          .join('\n')
      : '  (no known military bases in selected area)'

    const eventsSummary = events.length
      ? (events as Array<{
          date: string; eventType: string; location?: string | null; region: string
          attackerActor?: string | null; defenderActor?: string | null; actors: string[]
          summary?: string | null; fatalities?: number | null
        }>).slice(0, 40).map(e => {
          const actors = [e.attackerActor, e.defenderActor].filter(Boolean).join(' vs ')
            || e.actors.slice(0, 2).join(', ')
          const kia = e.fatalities ? ` (${e.fatalities} KIA)` : ''
          return `  [${String(e.date).slice(0, 10)}] ${e.eventType} — ${e.location ?? e.region} — ${actors}${kia} — ${e.summary?.slice(0, 100) ?? ''}`
        }).join('\n')
      : '  (no recent conflict events recorded near this area)'

    const operational = (bases as Array<{ status: string }>).filter(b => b.status === 'OPERATIONAL').length
    const contested   = (bases as Array<{ status: string }>).filter(b => b.status === 'CONTESTED').length
    const seized      = (bases as Array<{ status: string }>).filter(b => b.status.startsWith('SEIZED')).length
    const lng = (center as [number, number])[0]
    const lat = (center as [number, number])[1]

    const prompt = `You are a senior military intelligence analyst specializing in Myanmar's civil war (2021–present). Analyze the selected operational area and produce a concise commander's situation assessment.

AREA PARAMETERS:
- Size: ${(area_km2 as number).toFixed(0)} km²
- Center: ${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E
- Tatmadaw Bases: ${(bases as unknown[]).length} total (${operational} operational, ${contested} contested, ${seized} seized)

MILITARY ASSETS IN AREA:
${basesSummary}

CONFLICT INTELLIGENCE (recent events near area):
${eventsSummary}

Respond with ONLY valid JSON matching this exact schema — no markdown, no explanation:
{
  "scenarioOverview": "2–3 sentence operational situation summary",
  "areaSummary": {
    "operational": <number>,
    "contested": <number>,
    "seized": <number>,
    "dominant_actor": "which armed force controls this area"
  },
  "projection": {
    "holdPosition": "HIGH|MEDIUM|LOW",
    "lossRisk": "HIGH|MEDIUM|LOW",
    "confidence": "HIGH|MEDIUM|LOW",
    "confidence_pct": <integer 0–100>
  },
  "keyDrivers": ["factor 1", "factor 2", "factor 3"],
  "interpretation": "2–3 sentence operational interpretation with tactical implications",
  "recommendedActions": ["action 1", "action 2", "action 3"],
  "threats": [
    {"name": "threat name", "probability": "HIGH|MEDIUM|LOW", "description": "1-sentence description"},
    {"name": "threat name", "probability": "HIGH|MEDIUM|LOW", "description": "1-sentence description"},
    {"name": "threat name", "probability": "HIGH|MEDIUM|LOW", "description": "1-sentence description"},
    {"name": "threat name", "probability": "HIGH|MEDIUM|LOW", "description": "1-sentence description"},
    {"name": "threat name", "probability": "HIGH|MEDIUM|LOW", "description": "1-sentence description"}
  ],
  "riskLevel": "CRITICAL|HIGH|MEDIUM|LOW"
}`

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      generationConfig: { responseMimeType: 'application/json' },
    })

    const result = await model.generateContent(prompt)
    const parsed  = JSON.parse(result.response.text()) as Omit<ScenarioAnalysis, 'generatedAt'>

    return NextResponse.json({ ...parsed, generatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('POST /api/analyze-area error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
