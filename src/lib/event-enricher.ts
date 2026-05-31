import OpenAI from 'openai'

const deepseek = new OpenAI({
  apiKey:  process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})

export interface EnrichmentInput {
  eventType:       string
  actors:          string[]
  location:        string | null
  region:          string
  rawSummary:      string
  fatalities:      number
  articleContent?: string   // snippet used for location validation
}

export interface EnrichmentResult {
  attackerActor: string | null
  defenderActor: string | null
  summary:       string
  confidence:    number
  // Location validation — DeepSeek corrects Groq's extracted location
  region:        string | null   // validated Myanmar state/region (null = unknown)
  adminArea:     string | null   // validated township/district
  location:      string | null   // validated specific place name
}

const MYANMAR_REGIONS = [
  'Sagaing Region', 'Mandalay Region', 'Magway Region', 'Bago Region',
  'Yangon Region', 'Ayeyarwady Region', 'Tanintharyi Region',
  'Mon State', 'Kayin State', 'Kayah State', 'Shan State',
  'Kachin State', 'Chin State', 'Rakhine State', 'Naypyidaw Union Territory',
].join(' | ')

const SYSTEM = `You are a professional Myanmar military intelligence analyst.

## SIDES IN MYANMAR CONFLICT
Junta side: Tatmadaw, SAC, BGF, Pyu Saw Htee
Resistance side: PDF, NUG, CDF, KIA, KNU, KNLA, TNLA, MNDAA, AA, CNF, RCSS, UWSA, Local Defence Force

## TASK 1 — ACTORS
Identify the TWO SIDES:
- attackerActor: actor(s) that INITIATED the attack. Join allied actors as "PDF / CDF". null if unclear.
- defenderActor: actor(s) that were TARGETED. Same joining rule. null if unclear.
- summary: precise military intelligence summary, English only, max 180 chars
- confidence: 0.3–1.0

## ALLIANCE RULES (CRITICAL)
- PDF and CDF always fight on the SAME side. NEVER split them.
- TNLA + MNDAA + AA are Brotherhood Alliance (3BHA) — always same side.
- All EAOs oppose Tatmadaw. Never put two resistance groups on opposite sides.

## TASK 2 — LOCATION VALIDATION
The location extracted by the first AI may be wrong. Validate and correct it:
- region: the Myanmar state/region where the event PHYSICALLY OCCURRED
- adminArea: specific township or district name (null if unknown)
- location: specific town, village, or base name (null if not precise enough)

Valid regions: ${MYANMAR_REGIONS}

COMMON LOCATION ERRORS TO CORRECT:
- Article mentions place A (event location) AND place B (where source is based) → use place A
- Multiple conflict zones mentioned → use where the MAIN event happened, not secondary mentions
- Article about Karen/KNU but region says Rakhine → correct to Kayin State
- Region says Myanmar/Burma (generic) → find the actual state from context

Return null for region only if the article genuinely gives no location.

## OUTPUT FORMAT
Return ONLY valid JSON:
{"results": [{
  "attackerActor": "...",
  "defenderActor": "...",
  "summary": "...",
  "confidence": 0.0,
  "region": "...",
  "adminArea": "...",
  "location": "..."
}, ...]} in same order as input`

export async function enrichEvents(
  events:       EnrichmentInput[],
  articleTitle: string,
): Promise<EnrichmentResult[]> {
  const fallback = (ev: EnrichmentInput): EnrichmentResult => ({
    attackerActor: ev.actors[0] ?? null,
    defenderActor: null,
    summary:       ev.rawSummary.slice(0, 180),
    confidence:    0.4,
    region:        null,
    adminArea:     null,
    location:      null,
  })

  if (!process.env.DEEPSEEK_API_KEY || events.length === 0) {
    return events.map(fallback)
  }

  const eventsJson = JSON.stringify(
    events.map((ev, i) => ({
      i,
      type:           ev.eventType,
      actors:         ev.actors,
      extracted_location: ev.location ?? null,
      extracted_region:   ev.region,
      fatalities:     ev.fatalities,
      summary:        ev.rawSummary.slice(0, 300),
    })),
    null, 2,
  )

  // Include a content snippet for location context
  const contentSnippet = events[0]?.articleContent?.slice(0, 500) ?? ''
  const userMsg = `Article title: "${articleTitle}"${contentSnippet ? `\nArticle snippet: ${contentSnippet}` : ''}\n\nEvents:\n${eventsJson}`

  try {
    const completion = await deepseek.chat.completions.create({
      model:           'deepseek-chat',
      response_format: { type: 'json_object' },
      max_tokens:      1000,
      temperature:     0.2,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user',   content: userMsg },
      ],
    })

    const raw    = completion.choices[0].message.content ?? '{}'
    const parsed = JSON.parse(raw) as { results?: EnrichmentResult[] }
    const results = parsed.results ?? []

    if (results.length === events.length) return results

    return events.map((ev, i) => results[i] ?? fallback(ev))
  } catch {
    return events.map(fallback)
  }
}
