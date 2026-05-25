export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { ScenarioAnalysis } from '@/lib/analyze-types'

const deepseek = new OpenAI({
  apiKey:  process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})

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
        }>).slice(0, 8).map(e => {
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

    const systemPrompt = `You are a professional Myanmar military and geopolitical analyst.

Your expertise includes:
- Tatmadaw structure and regional commands
- EAOs and PDF groups
- Myanmar civil war dynamics
- Logistics, terrain, and border economics
- Drone warfare trends
- Information warfare and propaganda
- Chinese, Thai, Indian, and ASEAN influence
- Sanctions and arms supply chains
- Historical context from 1948 to present

Behavior:
- Be analytical, neutral, and evidence-driven
- Avoid emotional or ideological language
- Distinguish confirmed facts from rumors
- Explain military concepts clearly
- Mention uncertainty levels when information is incomplete

Writing style:
- Concise but detailed
- Professional intelligence briefing tone
- Include strategic implications and likely next steps

All analysis text fields in the JSON response MUST be written in Myanmar (Burmese) language (Unicode script). Only enum values like HIGH/MEDIUM/LOW and numbers remain in English. Return valid JSON only, no markdown, no code fences.`

    const userPrompt = `Analyze Myanmar operational area. Size:${(area_km2 as number).toFixed(0)}km² Center:${lat.toFixed(2)}N,${lng.toFixed(2)}E Bases(${(bases as unknown[]).length}):ops=${operational},contested=${contested},seized=${seized}
Assets: ${basesSummary}
Events: ${eventsSummary}

Return JSON:
{"scenarioOverview":"string","areaSummary":{"operational":N,"contested":N,"seized":N,"dominant_actor":"string"},"projection":{"holdPosition":"HIGH|MEDIUM|LOW","lossRisk":"HIGH|MEDIUM|LOW","confidence":"HIGH|MEDIUM|LOW","confidence_pct":N},"keyDrivers":["x","x","x"],"interpretation":"string","recommendedActions":["x","x","x"],"threats":[{"name":"x","probability":"HIGH|MEDIUM|LOW","description":"x"},{"name":"x","probability":"HIGH|MEDIUM|LOW","description":"x"},{"name":"x","probability":"HIGH|MEDIUM|LOW","description":"x"},{"name":"x","probability":"HIGH|MEDIUM|LOW","description":"x"},{"name":"x","probability":"HIGH|MEDIUM|LOW","description":"x"}],"riskLevel":"HIGH|MEDIUM|LOW"}`

    const completion = await deepseek.chat.completions.create({
      model:           'deepseek-chat',
      response_format: { type: 'json_object' },
      max_tokens:      500,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
    })

    const parsed = JSON.parse(completion.choices[0].message.content ?? '{}') as Omit<ScenarioAnalysis, 'generatedAt'>
    return NextResponse.json({ ...parsed, generatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('POST /api/analyze-area error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
