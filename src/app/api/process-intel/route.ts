export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import prisma from '@/lib/db'
import { classifySourceReliability, calculateConfidence } from '@/lib/confidence'
import { differenceInDays } from 'date-fns'
import type { EventType, SourceReliability } from '@/lib/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Map Claude's granular event_type → app EventType enum
function mapEventType(claudeType: string): EventType {
  switch (claudeType) {
    case 'armed_clash':
    case 'airstrike':
    case 'artillery':
    case 'ambush':
    case 'raid':
    case 'assassination':
    case 'surrender_defection':
      return 'ARMED_CONFLICT'
    case 'arrest_detention':
    case 'execution':
    case 'displacement':
      return 'HUMANITARIAN_ALERT'
    case 'infrastructure':
    case 'supply_interdiction':
      return 'INFRASTRUCTURE_DISRUPTION'
    case 'protest':
      return 'POLITICAL_UNREST'
    default:
      return 'ARMED_CONFLICT'
  }
}

// Map Claude's NATO reliability grade (A–F) → app SourceReliability
function mapReliability(grade: string): SourceReliability {
  if (grade === 'A' || grade === 'B') return 'HIGH'
  if (grade === 'C') return 'MEDIUM'
  return 'LOW'
}

const OSINT_SYSTEM_PROMPT = `You are an advanced OSINT intelligence processing system specializing in Myanmar conflict analysis. Your role is to extract, classify, and structure conflict-related data from raw news sources into a standardized intelligence database format.

## SOURCE INTELLIGENCE DATABASE

You have deep knowledge of the following Myanmar conflict actors:

### RESISTANCE FORCES
- **PDF (People's Defence Force)**: Armed wing of the NUG, decentralized local militias operating nationwide
- **NUG (National Unity Government)**: Shadow government formed by ousted MPs and civil society
- **CRPH (Committee Representing Pyidaungsu Hluttaw)**: Parliamentary body opposing the junta
- **EAOs (Ethnic Armed Organizations)**:
  - KIA/KIO (Kachin Independence Army/Organisation) — Kachin State
  - KNLA/KNU (Karen National Liberation Army/Union) — Karen/Kayin State
  - KNDO (Karen National Defence Organisation) — Karen State
  - RCSS/SSA-S (Restoration Council of Shan State) — Southern Shan
  - TNLA (Ta'ang National Liberation Army) — Northern Shan
  - MNDAA (Myanmar National Democratic Alliance Army) — Kokang, Northern Shan
  - AA (Arakan Army) — Rakhine/Arakan State
  - CNF/CNA (Chin National Front/Army) — Chin State
  - PNLO/PNO (Pa-O National Liberation Organisation) — Southern Shan
  - KnPP/Karenni Army — Karenni/Kayah State
  - BPLA (Bamar People's Liberation Army) — Central Myanmar
  - MNTJP — Northern Shan
  - 3BHA (Three Brotherhood Alliance: AA + TNLA + MNDAA)

### JUNTA FORCES
- **SAC (State Administration Council)**: Military junta governing body since Feb 2021 coup
- **Tatmadaw**: Myanmar Armed Forces (Army, Navy, Air Force)
- **BGF (Border Guard Force)**: Tatmadaw-aligned former ceasefire groups
- **Pyu Saw Htee**: Pro-military civilian militia
- **UWSA (United Wa State Army)**: Autonomous, nominally neutral but de facto junta-aligned in some areas

### GEOGRAPHIC REFERENCE
Townships and regions: Map article references to standard Myanmar township/district/state names.
Key conflict zones: Sagaing Region, Magway Region, Mandalay Region, Chin State, Kachin State, Karen/Kayin State, Kayah/Karenni State, Shan State, Rakhine/Arakan State, Bago Region, Tanintharyi Region.

---

## 8-STEP PROCESSING PIPELINE

For each article or news fragment, apply all 8 steps:

### STEP 1 — EVENT DETECTION
Identify discrete conflict events. Each event must have:
- A clear action (attack, airstrike, ambush, capture, retreat, casualty, displacement, arrest, execution, etc.)
- At least one identifiable actor
- A location reference (township, village, region)
- A temporal reference (date or relative date)

### STEP 2 — ACTOR IDENTIFICATION
For each event, identify:
- **perpetrator**: The group or force carrying out the action
- **target**: The group, installation, or civilian population targeted
- Use canonical names from the SOURCE INTELLIGENCE DATABASE above
- If unclear, use "unknown" or "unidentified junta forces" / "unidentified resistance"

### STEP 3 — LOCATION GEOCODING
Map every location to:
- **township**: Standard Myanmar township name
- **district**: District name
- **state_region**: State or Region name
- **coordinates**: Best-estimate [longitude, latitude] for the township centroid
  - Use known coordinates; if uncertain, use the state capital coordinates
  - Myanmar bounding box: longitude 92.2–101.2, latitude 9.8–28.5

### STEP 4 — EVENT CLASSIFICATION
Assign one primary **event_type** from:
- \`armed_clash\` — Direct combat between armed groups
- \`airstrike\` — Air Force bombing or drone strike
- \`artillery\` — Shelling, mortar fire, rocket attack
- \`ambush\` — Roadside or surprise attack
- \`raid\` — Assault on a fixed position or village
- \`assassination\` — Targeted killing of individual
- \`arrest_detention\` — Capture of civilians or combatants
- \`execution\` — Killing of prisoners or civilians
- \`displacement\` — Civilian flight due to conflict
- \`infrastructure\` — Attack on bridges, roads, power, telecom
- \`supply_interdiction\` — Blocking convoys, supply lines
- \`surrender_defection\` — Combatant surrender or defection
- \`protest\` — Civilian demonstration
- \`other\` — Does not fit above categories

### STEP 5 — SEVERITY SCORING
Score each event 1–5:
- **1 (Minimal)**: No casualties, minor skirmish, unconfirmed
- **2 (Low)**: 1–3 casualties OR minor infrastructure damage
- **3 (Moderate)**: 4–10 casualties OR significant damage OR displacement <1,000
- **4 (High)**: 11–50 casualties OR major displacement 1,000–10,000 OR strategic position lost/gained
- **5 (Critical)**: 50+ casualties OR mass displacement >10,000 OR major strategic shift

### STEP 6 — RELIABILITY ASSESSMENT
Score source reliability A–F (NATO STANAG 2511):
- **A**: Completely reliable (confirmed by multiple independent sources)
- **B**: Usually reliable (confirmed by one trusted source)
- **C**: Fairly reliable (corroborated by open sources, single report)
- **D**: Not usually reliable (single unverified report)
- **E**: Unreliable (contradicted by other sources)
- **F**: Reliability cannot be judged (first report, no corroboration)

### STEP 7 — METADATA EXTRACTION
Extract:
- **date**: ISO 8601 date (YYYY-MM-DD); if only month/year known use first of month
- **source_name**: Publication or outlet name
- **source_url**: URL if provided in article text, else null
- **casualties**: Object with \`killed\`, \`wounded\`, \`captured\` (integers, null if unknown)
- **displacement**: Integer count of displaced persons (null if not mentioned)
- **summary**: 1–2 sentence factual summary of the event

### STEP 8 — GEOJSON FEATURE GENERATION
For each event, produce a GeoJSON Point feature with all extracted data in \`properties\`.

---

## OUTPUT FORMAT

Return ONLY valid JSON matching this exact schema — no markdown, no explanation, no preamble:

{
  "events": [
    {
      "id": "evt_<8-char-hex>",
      "date": "YYYY-MM-DD",
      "event_type": "<type>",
      "severity": <1-5>,
      "reliability": "<A-F>",
      "perpetrator": "<actor name>",
      "target": "<actor or target type>",
      "location": {
        "township": "<township>",
        "district": "<district>",
        "state_region": "<state or region>",
        "coordinates": [<longitude>, <latitude>]
      },
      "casualties": {
        "killed": <int|null>,
        "wounded": <int|null>,
        "captured": <int|null>
      },
      "displacement": <int|null>,
      "source_name": "<outlet>",
      "source_url": <"url"|null>,
      "summary": "<1-2 sentence summary>"
    }
  ],
  "meta": {
    "processed_at": "<ISO 8601 timestamp>",
    "event_count": <int>,
    "source_articles": <int>
  }
}`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const articles: string = body.articles ?? body.text ?? ''
    const sourceName: string = body.source_name ?? 'Local News'
    const dryRun: boolean = body.dry_run === true  // set true to skip DB save

    if (!articles.trim()) {
      return NextResponse.json({ error: 'No article text provided' }, { status: 400 })
    }

    // Call Claude with the OSINT system prompt (cached) + article text
    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 8192,
      thinking: { type: 'adaptive' },
      system: [
        {
          type: 'text',
          text: OSINT_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Process the following Myanmar news articles and extract all conflict events. Return only the JSON output as specified.\n\n---\n\n${articles}`,
        },
      ],
    })

    // Extract text block from Claude's response
    const textBlock = response.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No text response from model' }, { status: 500 })
    }

    let raw = textBlock.text.trim()
    // Strip markdown code fences if model wraps output
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (fenceMatch) raw = fenceMatch[1].trim()

    const parsed = JSON.parse(raw) as {
      events: Array<{
        id: string
        date: string
        event_type: string
        severity: number
        reliability: string
        perpetrator: string
        target: string
        location: {
          township: string
          district: string
          state_region: string
          coordinates: [number, number]
        }
        casualties: { killed: number | null; wounded: number | null; captured: number | null } | null
        displacement: number | null
        source_name: string
        source_url: string | null
        summary: string
      }>
      meta: { processed_at: string; event_count: number; source_articles: number }
    }

    if (dryRun) {
      return NextResponse.json({ dry_run: true, ...parsed })
    }

    // Persist each event to the database
    const saved: string[] = []
    const errors: string[] = []

    for (const evt of parsed.events) {
      try {
        const eventDate = new Date(evt.date)
        const ageDays   = differenceInDays(new Date(), eventDate)
        const resolvedSource = evt.source_name || sourceName
        const reliability    = mapReliability(evt.reliability)
        const appReliability: SourceReliability =
          classifySourceReliability(resolvedSource) !== 'MEDIUM'
            ? classifySourceReliability(resolvedSource)
            : reliability
        const confidence = calculateConfidence(appReliability, 1, ageDays)
        const [lng, lat] = evt.location.coordinates ?? [null, null]
        const actors = [evt.perpetrator, evt.target].filter(
          a => a && a !== 'unknown',
        )

        await prisma.processedEvent.upsert({
          where: { id: evt.id },
          create: {
            id:         evt.id,
            date:       eventDate,
            country:    'Myanmar',
            region:     evt.location.state_region,
            adminArea:  evt.location.township ?? null,
            type:       mapEventType(evt.event_type),
            severity:   Math.min(5, Math.max(1, evt.severity)),
            summary:    evt.summary.slice(0, 500),
            source:     resolvedSource,
            sourceUrl:  evt.source_url ?? null,
            reliability: appReliability,
            confidence,
            latitude:   lat ?? null,
            longitude:  lng ?? null,
            fatalities: evt.casualties?.killed ?? 0,
            actors,
            tags:       [evt.event_type, evt.perpetrator].filter(Boolean),
          },
          update: {
            confidence,
            severity: Math.min(5, Math.max(1, evt.severity)),
            updatedAt: new Date(),
          },
        })

        saved.push(evt.id)
      } catch (dbErr) {
        errors.push(`${evt.id}: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`)
      }
    }

    // Log the ingestion
    await prisma.updateLog.create({
      data: {
        change:   `Ingested ${saved.length} events from local news via Claude OSINT pipeline`,
        reason:   'Manual article submission',
        source:   sourceName,
        metadata: { saved: saved.length, errors: errors.length, total: parsed.events.length },
      },
    })

    return NextResponse.json({
      saved:    saved.length,
      errors:   errors.length > 0 ? errors : undefined,
      total:    parsed.events.length,
      events:   parsed.events,
      meta:     parsed.meta,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
