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

## SIDES IN MYANMAR CONFLICT
Junta side: Tatmadaw, SAC, BGF, Pyu Saw Htee
Resistance side: PDF, NUG, CDF, KIA, KNU, KNLA, TNLA, MNDAA, AA, CNF, RCSS, UWSA, Local Defence Force

## TASK
For each conflict event, identify the TWO SIDES — the initiating side (attackers) and the targeted side (defenders):
- attackerActor: the actor(s) that INITIATED the attack. If multiple allied actors attacked together, join them as "PDF / CDF". Use null if genuinely unclear.
- defenderActor: the actor(s) that were TARGETED / defending. Same joining rule. Use null if unclear.
- summary: precise military intelligence summary, English only, max 180 chars
- confidence: 0.3–1.0 based on how clearly the article supports this interpretation

## ALLIANCE RULES (CRITICAL)
- PDF and CDF always fight on the SAME side (both resistance). NEVER set one as attacker and the other as defender.
- TNLA + MNDAA + AA are Brotherhood Alliance (3BHA) — always on the same side.
- All EAOs (KIA, KNU/KNLA, TNLA, MNDAA, AA, CNF, RCSS) are resistance groups opposed to the Tatmadaw.
- When multiple resistance actors cooperate: attackerActor = "PDF / CDF" (or whatever combination), defenderActor = "Tatmadaw" (or BGF etc.)
- When two actors are from the SAME side, they are BOTH attackers or BOTH defenders — never split them across sides.

## EVENT TYPE RULES
- AIRSTRIKE / ARTILLERY_SHELLING — Tatmadaw is almost always the attacker unless article says otherwise
- CLASH / AMBUSH — resistance groups often initiate; read context
- SIEGE_SEIZED / RECAPTURED — identify which side gained territory (they are the attackers)
- DISPLACEMENT / HUMANITARIAN — attacker is who caused the displacement (usually Tatmadaw or airstrikes)

Actor codes: Tatmadaw | PDF | TNLA | MNDAA | AA | KIA | NUG | KNU | KNLA | CNF | RCSS | UWSA | CDF | Local Defence Force | BGF | Pyu Saw Htee

Return ONLY valid JSON: {"results": [{attackerActor, defenderActor, summary, confidence}, ...]} in same order as input`

export async function enrichEvents(
  events:       EnrichmentInput[],
  articleTitle: string,
): Promise<EnrichmentResult[]> {
  if (!process.env.DEEPSEEK_API_KEY || events.length === 0) {
    return events.map(ev => ({
      attackerActor: ev.actors[0] ?? null,
      defenderActor: null,  // don't guess defender without analysis — allied actors would be split wrongly
      summary:       ev.rawSummary.slice(0, 180),
      confidence:    0.4,
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
      defenderActor: null,
      summary:       ev.rawSummary.slice(0, 180),
      confidence:    0.4,
    })
  } catch {
    return events.map(ev => ({
      attackerActor: ev.actors[0] ?? null,
      defenderActor: null,
      summary:       ev.rawSummary.slice(0, 180),
      confidence:    0.4,
    }))
  }
}
