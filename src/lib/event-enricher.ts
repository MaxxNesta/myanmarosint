import OpenAI from 'openai'

const deepseek = new OpenAI({
  apiKey:  process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})

export interface EnrichmentInput {
  eventType:  string
  actors:     string[]
  location:   string | null
  region:     string
  rawSummary: string
  fatalities: number
}

export interface EnrichmentResult {
  attackerActor: string | null
  defenderActor: string | null
  summary:       string
  confidence:    number
}

const SYSTEM = `You are a professional Myanmar military intelligence analyst.

For each conflict event, determine:
- attackerActor: the force that INITIATED the attack (use exact code below, or null if unclear)
- defenderActor: the force that was defending / targeted (exact code or null)
- summary: precise military intelligence summary, English only, max 180 chars
- confidence: 0.3–1.0 based on how clearly the article supports this interpretation

Actor codes: Tatmadaw | PDF | TNLA | MNDAA | AA | KIA | NUG | KNU | KNLA | CNF | RCSS | UWSA | Local Defence Force

Rules:
- For AIRSTRIKE/ARTILLERY_SHELLING — Tatmadaw is almost always the attacker unless stated otherwise
- For AMBUSH — resistance groups are usually the attacker
- For SIEGE_SEIZED / RECAPTURED — identify which side gained territory
- If actors list only contains one side, the other is likely the implicit target
- Return ONLY valid JSON: {"results": [{...}, ...]} in same order as input`

export async function enrichEvents(
  events:       EnrichmentInput[],
  articleTitle: string,
): Promise<EnrichmentResult[]> {
  if (!process.env.DEEPSEEK_API_KEY || events.length === 0) {
    return events.map(ev => ({
      attackerActor: ev.actors[0] ?? null,
      defenderActor: ev.actors[1] ?? null,
      summary:       ev.rawSummary.slice(0, 180),
      confidence:    0.5,
    }))
  }

  const eventsJson = JSON.stringify(
    events.map((ev, i) => ({
      i,
      type:       ev.eventType,
      actors:     ev.actors,
      location:   ev.location ?? ev.region,
      fatalities: ev.fatalities,
      summary:    ev.rawSummary.slice(0, 300),
    })),
    null, 2,
  )

  try {
    const completion = await deepseek.chat.completions.create({
      model:           'deepseek-chat',
      response_format: { type: 'json_object' },
      max_tokens:      800,
      temperature:     0.2,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user',   content: `Article: "${articleTitle}"\n\nEvents:\n${eventsJson}` },
      ],
    })

    const raw     = completion.choices[0].message.content ?? '{}'
    const parsed  = JSON.parse(raw) as { results?: EnrichmentResult[] }
    const results = parsed.results ?? []

    if (results.length === events.length) return results

    // If counts mismatch, return what we got and fill the rest with defaults
    return events.map((ev, i) => results[i] ?? {
      attackerActor: ev.actors[0] ?? null,
      defenderActor: ev.actors[1] ?? null,
      summary:       ev.rawSummary.slice(0, 180),
      confidence:    0.5,
    })
  } catch {
    return events.map(ev => ({
      attackerActor: ev.actors[0] ?? null,
      defenderActor: ev.actors[1] ?? null,
      summary:       ev.rawSummary.slice(0, 180),
      confidence:    0.5,
    }))
  }
}
