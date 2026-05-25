export const dynamic = 'force-dynamic'
export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { ScenarioAnalysis } from '@/lib/analyze-types'

const deepseek = new OpenAI({
  apiKey:  process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})

// Attempt to salvage truncated JSON by closing open structures
function repairJson(raw: string): string {
  let s = raw.trim()
  // Close any unterminated string by appending quote before closing
  const stack: string[] = []
  let inString = false
  let escaped  = false
  for (const ch of s) {
    if (escaped)           { escaped = false; continue }
    if (ch === '\\')       { escaped = true;  continue }
    if (ch === '"')        { inString = !inString; continue }
    if (inString)          continue
    if (ch === '{' || ch === '[') stack.push(ch)
    if (ch === '}' || ch === ']') stack.pop()
  }
  if (inString) s += '"'
  for (let i = stack.length - 1; i >= 0; i--) {
    s += stack[i] === '{' ? '}' : ']'
  }
  return s
}

export async function POST(req: NextRequest) {
  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json({ error: 'DEEPSEEK_API_KEY not set — add it to Vercel environment variables' }, { status: 500 })
  }

  try {
    const body = await req.json()
    const { bases = [], events = [], area_km2 = 0, center = [96.5, 19.5] } = body

    const basesSummary = bases.length
      ? (bases as Array<{ regimentEn: string; status: string; threat: string }>)
          .map(b => `${b.regimentEn}:${b.status}:${b.threat}`)
          .join(', ')
      : 'none'

    const eventsSummary = events.length
      ? (events as Array<{
          date: string; eventType: string; location?: string | null; region: string
          attackerActor?: string | null; defenderActor?: string | null; actors: string[]
          fatalities?: number | null
        }>).slice(0, 6).map(e => {
          const actor = (e.attackerActor ?? e.actors[0] ?? '?')
          const kia = e.fatalities ? `${e.fatalities}KIA` : ''
          return `[${String(e.date).slice(0, 10)}] ${e.eventType} ${e.location ?? e.region} ${actor} ${kia}`
        }).join('\n')
      : 'none'

    const operational = (bases as Array<{ status: string }>).filter(b => b.status === 'OPERATIONAL').length
    const contested   = (bases as Array<{ status: string }>).filter(b => b.status === 'CONTESTED').length
    const seized      = (bases as Array<{ status: string }>).filter(b => b.status.startsWith('SEIZED')).length
    const lng = (center as [number, number])[0]
    const lat = (center as [number, number])[1]

    const systemPrompt = `You are a professional Myanmar military and geopolitical analyst. Expert in Tatmadaw structure, EAOs, PDF, civil war dynamics, logistics, terrain, drone warfare, and regional geopolitics (China, Thailand, India, ASEAN). Be analytical, neutral, evidence-driven. Reason deeply — use your token budget for sharp intelligence insight, not verbose text. Each string field must be concise (max 20 words). Return valid JSON only — no markdown, no code fences.`

    const userPrompt = `Analyze this Myanmar operational area. Size:${(area_km2 as number).toFixed(0)}km² Center:${lat.toFixed(2)}N,${lng.toFixed(2)}E Bases(${(bases as unknown[]).length}):ops=${operational},contested=${contested},seized=${seized}
Assets: ${basesSummary}
Events: ${eventsSummary}

Return ONLY valid JSON, all fields in English, each string max 20 words:
{"scenarioOverview":"...","areaSummary":{"operational":${operational},"contested":${contested},"seized":${seized},"dominant_actor":"..."},"projection":{"holdPosition":"HIGH|MEDIUM|LOW","lossRisk":"HIGH|MEDIUM|LOW","confidence":"HIGH|MEDIUM|LOW","confidence_pct":0},"keyDrivers":["...","...","..."],"interpretation":"...","recommendedActions":["...","...","..."],"threats":[{"name":"...","probability":"HIGH|MEDIUM|LOW","description":"..."},{"name":"...","probability":"HIGH|MEDIUM|LOW","description":"..."},{"name":"...","probability":"HIGH|MEDIUM|LOW","description":"..."}],"riskLevel":"HIGH|MEDIUM|LOW"}`

    const completion = await deepseek.chat.completions.create({
      model:           'deepseek-chat',
      response_format: { type: 'json_object' },
      max_tokens:      2000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
    })

    const raw = completion.choices[0].message.content ?? '{}'
    let parsed: Omit<ScenarioAnalysis, 'generatedAt'>
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = JSON.parse(repairJson(raw))
    }

    return NextResponse.json({ ...parsed, generatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('POST /api/analyze-area error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
