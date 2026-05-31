import OpenAI from 'openai'
import type { ConflictEventType } from '@prisma/client'
import { findTownInText } from './towns'

export interface ExtractedEvent {
  eventType:     ConflictEventType
  date:          string
  region:        string
  adminArea:     string | null
  location:      string | null
  actors:        string[]
  attackerActor: string | null
  defenderActor: string | null
  summary:       string
  fatalities:    number
  fatalitiesMin: number
  fatalitiesMax: number
  biasFlag:      'neutral' | 'pro_resistance' | 'pro_junta' | 'unverified_claim'
}

export const BATTLE_EVENT_TYPES: ConflictEventType[] = [
  'CLASH', 'AIRSTRIKE', 'ARTILLERY_SHELLING',
  'SIEGE_SEIZED', 'RECAPTURED',
  'DISPLACEMENT', 'HUMANITARIAN_CRISIS', 'POLITICAL_DEVELOPMENT',
]

const BATTLE_SET = new Set<string>(BATTLE_EVENT_TYPES)

// ── Raw shape from Gemini response ────────────────────────────────────────────

interface RawExtractedEvent {
  date:            string
  actors:          string[]
  event_types:     string[]
  location?:       { name_en?: string; name_mm?: string }
  region?:         string
  admin_area?:     string
  summary:         string
  attacker_actor?: string
  defender_actor?: string
  fatalities?:     number
  fatalities_min?: number
  fatalities_max?: number
  bias_flag?:      string
  // legacy fields
  eventType?:      string
  adminArea?:      string
  attackerActor?:  string
  defenderActor?:  string
  fatalitiesMin?:  number
  fatalitiesMax?:  number
  biasFlag?:       string
}

const EVENT_TYPE_PRIORITY: ConflictEventType[] = [
  'AIRSTRIKE', 'ARTILLERY_SHELLING', 'SIEGE_SEIZED', 'RECAPTURED',
  'DISPLACEMENT', 'HUMANITARIAN_CRISIS', 'POLITICAL_DEVELOPMENT', 'CLASH',
]

function pickEventType(types: string[]): ConflictEventType | null {
  const valid = new Set(types.map(t => t.toUpperCase()))
  for (const t of EVENT_TYPE_PRIORITY) {
    if (valid.has(t)) return t
  }
  return null
}

const VALID_BIAS = new Set(['neutral', 'pro_resistance', 'pro_junta', 'unverified_claim'])
function toBiasFlag(raw?: string): ExtractedEvent['biasFlag'] {
  return VALID_BIAS.has(raw ?? '') ? (raw as ExtractedEvent['biasFlag']) : 'neutral'
}

// ── Gemini system prompt ──────────────────────────────────────────────────────

const EXTRACTION_SYSTEM = `You are a Myanmar conflict OSINT analyst. Analyze articles in English and Myanmar (Burmese) script.

## SKIP ENTIRELY — return {"events":[]} for these topics:
- Business, economy, trade, investment, GDP, sanctions (economic)
- Military conscription / drafting / forced recruitment / labour
- Workers, wages, strikes, factories, industry
- Diplomatic meetings, peace talks (unless fighting actually occurred)
- Sports, entertainment, tourism
- General governance, elections, administration without violence
- Drug enforcement, anti-drug operations, gambling crackdowns, crime without armed combat
- Infrastructure events: bridge openings/closings, road construction, border crossing status changes
- Any article that explicitly states "no conflict", "no fighting", or "peaceful" with no battle described

## EXTRACT ONLY these 8 event types:
CLASH              — armed clash / battle / firefight / တိုက်ပွဲ / တိုက်ခိုက်
AIRSTRIKE          — airstrike / bombing / drone strike / လေကြောင်းတိုက်ခိုက်
ARTILLERY_SHELLING — artillery / mortar / shelling / ဒုံးကျည် / မော်တာ / အမြောက်
SIEGE_SEIZED       — town or base seized / captured / fell / သိမ်းပိုက် / ကျဆုံး
RECAPTURED         — town or base retaken / recaptured / ပြန်သိမ်း
DISPLACEMENT       — civilians forced to flee / internally displaced / ဒုက္ခသည်
HUMANITARIAN_CRISIS — civilian casualties / aid blocked / mass arrests / atrocity
POLITICAL_DEVELOPMENT — significant political event directly affecting the conflict

## Actor codes
TATMADAW | PDF | TNLA | MNDAA | AA | KIA | NUG | KNU | KNLA | CNF | RCSS | UWSA

## Output format
{"events":[{
  "date": "YYYY-MM-DD",
  "actors": ["TATMADAW", "PDF"],
  "event_types": ["AIRSTRIKE"],
  "attacker_actor": "TATMADAW",
  "defender_actor": "PDF",
  "location": { "name_en": "Kale", "name_mm": "ကလေး" },
  "region": "Sagaing Region",
  "admin_area": "Kale Township",
  "summary": "[Action] in [location]. [Attacker] vs [Defender]. Max 180 chars.",
  "fatalities": 5,
  "fatalities_min": 3,
  "fatalities_max": 7,
  "bias_flag": "neutral"
}]}

## Rules
- Return {"events":[]} for irrelevant articles (business, economy, drafting, workers, etc.)
- location.name_en must be a real Myanmar town name
- bias_flag: neutral | pro_resistance | pro_junta | unverified_claim`

// ── Fallback patterns (regex, English + Burmese) ──────────────────────────────

const FALLBACK_TYPE_MAP: [RegExp, ConflictEventType][] = [
  [/airstrike|air.?strike|bomb(?:ing|ed)|drone.?strike|လေကြောင်းတိုက်ခိုက်|လေတိုက်/i,          'AIRSTRIKE'],
  [/artillery|mortar|shelling|shell(?:ed|ing)\b|ဒုံးကျည်|မော်တာ|အမြောက်/i,                    'ARTILLERY_SHELLING'],
  [/seize[sd]?|captur|overrun|fell\s+to|taken\s+by|storm(?:ed)?|သိမ်းပိုက်|သိမ်းယူ|ကျဆုံး/i, 'SIEGE_SEIZED'],
  [/recaptur|retook|retaken|liberat|ပြန်သိမ်း|ပြန်ယူ/i,                                        'RECAPTURED'],
  [/displace[sd]?|flee|fled|evacuat|refugee|ဒုက္ခသည်|ထွက်ပြေး/i,                              'DISPLACEMENT'],
  [/humanitarian|civilian.{0,20}kill|atrocit|massacre|aid.{0,10}block/i,                       'HUMANITARIAN_CRISIS'],
  [/political\s+develop|NUG|NLD|CRPH|parliament|government.{0,20}form/i,                       'POLITICAL_DEVELOPMENT'],
  [/clash|battle|fight|combat|gun.?fight|firefight|skirmish|တိုက်ပွဲ|တိုက်ခိုက်/i,            'CLASH'],
]

const REGION_MAP: [RegExp, string][] = [
  [/sagaing|စစ်ကိုင်း/i,                       'Sagaing Region'],
  [/rakhine|arakan|ရခိုင်/i,                    'Rakhine State'],
  [/kachin|ကချင်/i,                             'Kachin State'],
  [/shan state|northern shan|southern shan|eastern shan|ရှမ်းပြည်/i, 'Shan State'],
  [/kayah|karenni|ကယား/i,                       'Kayah State'],
  [/kayin|karen state|ကရင်/i,                   'Kayin State'],
  [/chin state|ချင်းပြည်/i,                     'Chin State'],
  [/\bmon state\b|မွန်ပြည်/i,                   'Mon State'],
  [/mandalay|မန္တလေး/i,                         'Mandalay Region'],
  [/yangon|ရန်ကုန်/i,                            'Yangon Region'],
  [/\bbago\b|ပဲခူး/i,                           'Bago Region'],
  [/magway|မကွေး/i,                             'Magway Region'],
  [/ayeyarwady|irrawaddy|ဧရာဝတီ/i,             'Ayeyarwady Region'],
  [/naypyidaw|နေပြည်တော်/i,                    'Naypyidaw Union Territory'],
  [/tanintharyi|mergui|တနင်္သာရီ/i,             'Tanintharyi Region'],
  [/\bshan\b/i,                                 'Shan State'],
  [/\bchin\b/i,                                 'Chin State'],
  [/\bmon\b/i,                                  'Mon State'],
]

const FATAL_PATTERNS = [
  /kills?\s+(\d+)/i,
  /(\d+)\s*(?:soldiers?|troops?|fighters?|civilians?|people)?\s*(?:were\s+)?killed/i,
  /(\d+)\s+dead\b/i,
  /death toll[^.]{0,30}(\d+)/i,
  /(\d+)\s+fatalities/i,
  /killing\s+at least\s+(\d+)/i,
  /killing\s+(\d+)/i,
  /(\d+)\s*(?:ဦး|ယောက်)\s*(?:ကျဆုံး|သဆုံး|ဆုံးပါး)/,
]

const RANGE_PATTERN = /(\d+)\s*(?:to|-)\s*(\d+)\s*(?:soldiers?|troops?|people|civilians?)?\s*killed/i

// Battle signal — must match at least one for fallback to trigger
const BATTLE_SIGNAL =
  /clash|battle|fight|airstrike|bomb|shell|seize|captur|displace|flee|fled|humanitarian|တိုက်ပွဲ|တိုက်ခိုက်|သိမ်းယူ|ဒုံး|လေကြောင်း|ကျဆုံး|ဒုက္ခသည်/i

const ACTOR_PATTERNS: [RegExp, string][] = [
  [/\btatmadaw\b|myanmar\s+(?:military|army|air\s+force)|state\s+administration\s+council|\bsac\b(?!\w)|\bjunta\b|\bregime\b|military\s+council|စစ်တပ်|တပ်မတော်|စစ်ကောင်စီ/i, 'Tatmadaw'],
  [/\bpdf\b|people'?s\s+def[e]?nc[e]\s+force|resistance\s+force|ပြည်သူ့ကာကွယ်ရေးတပ်/i,                                                                                       "People's Defence Force"],
  [/\btnla\b|ta'?ang\s+national\s+liberation|တအာင်း|တအောင်း/i,                                                                                                               "Ta'ang National Liberation Army"],
  [/\bmndaa\b|\bkokang\b|myanmar\s+national\s+democratic\s+alliance|ကိုးကန့်/i,                                                                                               'Myanmar National Democratic Alliance Army'],
  [/\barakan\s+army\b|\baa\b(?=\s+(?:forces?|troops?|fighters?|soldiers?|captured|seized|launched|attacked|advanced))|ရခိုင်တပ်မတော်|ရခိုင်တပ်တော်/i,                        'Arakan Army'],
  [/\bkia\b|kachin\s+independence\s+army|ကချင်လွတ်မြောက်ရေးတပ်မတော်/i,                                                                                                      'Kachin Independence Army'],
  [/\bnug\b|national\s+unity\s+government/i,                                                                                                                                  'National Unity Government'],
  [/\bknu\b|karen\s+national\s+union/i,                                                                                                                                       'Karen National Union'],
  [/\bknla\b|karen\s+national\s+liberation\s+army/i,                                                                                                                          'Karen National Liberation Army'],
  [/\bcnf\b|chin\s+national\s+front/i,                                                                                                                                        'Chin National Front'],
  [/\brcss\b|\bssa-s\b|restoration\s+council\s+of\s+shan/i,                                                                                                                   'Restoration Council of Shan State'],
  [/\buwsa\b|united\s+wa\s+state\s+army/i,                                                                                                                                    'United Wa State Army'],
]

function detectActors(text: string): string[] {
  const found: string[] = []
  for (const [rx, name] of ACTOR_PATTERNS) {
    if (rx.test(text)) found.push(name)
  }
  return found
}

function fallbackExtract(
  title:      string,
  content:    string,
  publishedAt: Date | null,
): ExtractedEvent | null {
  const text = `${title}\n${content}`
  if (!BATTLE_SIGNAL.test(text)) return null

  let eventType: ConflictEventType = 'CLASH'
  for (const [rx, t] of FALLBACK_TYPE_MAP) {
    if (rx.test(text)) { eventType = t; break }
  }

  // Only keep battle event types
  if (!BATTLE_SET.has(eventType)) return null

  let fatals = 0, fatalMin = 0, fatalMax = 0
  const rangeM = text.match(RANGE_PATTERN)
  if (rangeM) {
    fatalMin = parseInt(rangeM[1])
    fatalMax = parseInt(rangeM[2])
    fatals   = Math.round((fatalMin + fatalMax) / 2)
  } else {
    for (const p of FATAL_PATTERNS) {
      const m = text.match(p)
      if (m) { const n = parseInt(m[1]); if (n > 0 && n < 500) { fatals = fatalMin = fatalMax = n; break } }
    }
  }

  let region    = 'Myanmar'
  let adminArea: string | null = null
  let location:  string | null = null

  const town = findTownInText(text)
  if (town) {
    region    = town.region
    adminArea = town.name_en
    location  = town.name_en
  } else {
    for (const [rx, r] of REGION_MAP) { if (rx.test(text)) { region = r; break } }
  }

  return {
    eventType,
    date:          (publishedAt ?? new Date()).toISOString().split('T')[0],
    region,
    adminArea,
    location,
    actors:        detectActors(text),
    attackerActor: null,
    defenderActor: null,
    summary:       title.slice(0, 300),
    fatalities:    fatals,
    fatalitiesMin: fatalMin,
    fatalitiesMax: fatalMax,
    biasFlag:      'neutral',
  }
}

// ── Response parser (shared between Gemini and fallback) ─────────────────────

function parseResponse(raw: unknown, fullText: string): ExtractedEvent[] {
  if (!Array.isArray(raw)) return []

  return (raw as RawExtractedEvent[]).slice(0, 3).flatMap(ev => {
    if (!ev || typeof ev !== 'object') return []

    const types: string[] = Array.isArray(ev.event_types)
      ? ev.event_types
      : ev.eventType ? [ev.eventType] : []

    const eventType = pickEventType(types)
    if (!eventType) return []  // skip non-battle events

    const date = typeof ev.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(ev.date)
      ? ev.date
      : new Date().toISOString().split('T')[0]

    let region    = 'Myanmar'
    let adminArea: string | null = ev.admin_area ?? ev.adminArea ?? null
    let location:  string | null = null

    if (ev.location?.name_en) {
      location  = ev.location.name_en
      adminArea = adminArea ?? ev.location.name_en
    }

    if (ev.region && ev.region !== 'Myanmar') {
      region = ev.region
    } else {
      const lookupText = [ev.location?.name_en, ev.location?.name_mm, location, fullText].filter(Boolean).join(' ')
      const town = findTownInText(lookupText)
      if (town) {
        region    = town.region
        if (!location)   location  = town.name_en
        if (!adminArea)  adminArea = town.name_en
      }
    }

    const actors = Array.isArray(ev.actors) ? ev.actors.filter(a => typeof a === 'string') : []

    const fatalities    = Number(ev.fatalities)                    || 0
    const fatalitiesMin = Number(ev.fatalities_min ?? ev.fatalitiesMin) || fatalities
    const fatalitiesMax = Number(ev.fatalities_max ?? ev.fatalitiesMax) || fatalities

    return [{
      eventType,
      date,
      region,
      adminArea,
      location,
      actors,
      attackerActor: ev.attacker_actor ?? ev.attackerActor ?? null,
      defenderActor: ev.defender_actor ?? ev.defenderActor ?? null,
      summary:       String(ev.summary ?? '').slice(0, 800),
      fatalities,
      fatalitiesMin,
      fatalitiesMax,
      biasFlag:      toBiasFlag(ev.bias_flag ?? ev.biasFlag),
    } satisfies ExtractedEvent]
  })
}

// ── Groq client (fast bulk extraction) ───────────────────────────────────────

let _groq: OpenAI | null = null
function getGroq() {
  if (!_groq) _groq = new OpenAI({
    apiKey:  process.env.GROQ_API_KEY!,
    baseURL: 'https://api.groq.com/openai/v1',
  })
  return _groq
}

async function extractWithGroq(
  title:       string,
  content:     string,
  sourceName:  string,
  publishedAt: Date | null,
): Promise<ExtractedEvent[]> {
  const prompt =
    `Source: ${sourceName}\nPublished: ${publishedAt?.toISOString().slice(0, 10) ?? 'unknown'}\n\nTitle: ${title}\n\nContent:\n${content.slice(0, 3500)}`

  const completion = await getGroq().chat.completions.create({
    model:           'llama-3.3-70b-versatile',
    response_format: { type: 'json_object' },
    max_tokens:      800,
    temperature:     0.1,
    messages: [
      { role: 'system', content: `${EXTRACTION_SYSTEM}\n\nReturn {"events":[...]} with EXACTLY ONE event (most important). Include attacker_actor and defender_actor fields.` },
      { role: 'user',   content: prompt },
    ],
  })

  const raw  = completion.choices[0].message.content ?? '{}'
  const json = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

  try {
    const parsed = JSON.parse(json)
    const arr    = Array.isArray(parsed) ? parsed : (parsed.events ?? [])
    const events = parseResponse(arr, `${title}\n${content}`)
    if (events.length > 0) return [events[0]]
  } catch { /* fall through to regex */ }

  return []
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function extractEvents(
  title:       string,
  content:     string,
  sourceName:  string,
  publishedAt: Date | null,
): Promise<ExtractedEvent[]> {
  if (process.env.GROQ_API_KEY) {
    try {
      const events = await extractWithGroq(title, content, sourceName, publishedAt)
      if (events.length > 0) return events
    } catch { /* fall through to regex */ }
  }

  const ev = fallbackExtract(title, content, publishedAt)
  return ev ? [ev] : []
}
