export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

interface ActorStat {
  id:        string
  shortName: string
  recent7:   number   // incidents last 7 days
  prev7:     number   // incidents days 7-14
  captures:  number   // towns captured last 30 days
  losses:    number   // towns lost last 30 days
}

interface MomentumResult {
  id:    string
  trend: 'up' | 'down' | 'stable'
  label: string
  note:  string
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY not set' }, { status: 500 })
  }

  let stats: ActorStat[]
  try {
    const body = await req.json()
    stats = body.stats as ActorStat[]
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!stats?.length) {
    return NextResponse.json({ momentum: [] })
  }

  const rows = stats.map(s => {
    const pct = s.prev7 > 0 ? Math.round(((s.recent7 - s.prev7) / s.prev7) * 100) : null
    const net = s.captures - s.losses
    return `${s.shortName}: ${s.recent7} incidents (7d), ${pct != null ? (pct > 0 ? '+' : '') + pct + '% vs prev week' : 'no prior data'}, net territory ${net > 0 ? '+' : ''}${net} towns (30d)`
  }).join('\n')

  const prompt = `You are an analyst summarizing Myanmar armed conflict momentum. Today's actor data:

${rows}

For each actor, return a JSON array (no markdown, no text outside JSON):
[{"id":"<ID>","trend":"up|down|stable","label":"<2-3 word label>","note":"<one short sentence, max 12 words>"}]

Labels examples: "Expanding", "Losing ground", "Stable", "Pressure mounting", "Counter-offensive", "Consolidating gains", "Under pressure", "Active operations"
Trend rules: up = more incidents OR net positive towns, down = fewer incidents AND/OR net negative towns, stable = little change.
IDs must match exactly: ${stats.map(s => s.id).join(', ')}`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model:       'llama-3.1-8b-instant',
        temperature: 0.2,
        max_tokens:  512,
        messages: [
          { role: 'system', content: 'You are a conflict intelligence analyst. Return only valid JSON arrays.' },
          { role: 'user',   content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Groq error:', err)
      return NextResponse.json({ error: 'Groq request failed' }, { status: 502 })
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content ?? ''

    // Extract JSON array from response
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) {
      console.error('No JSON array in Groq response:', text)
      return NextResponse.json({ error: 'Invalid Groq response' }, { status: 502 })
    }

    const momentum: MomentumResult[] = JSON.parse(match[0])
    return NextResponse.json({ momentum }, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
    })
  } catch (err) {
    console.error('actor-momentum route error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
