import Anthropic from '@anthropic-ai/sdk'
import type { ConflictEventType } from '@prisma/client'

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

const EXTRACTION_SYSTEM = `You are a Myanmar conflict intelligence analyst. Extract structured events from news articles. Output valid JSON only — no markdown, no prose.

Event types: CLASH, AIRSTRIKE, ARTILLERY_SHELLING, AMBUSH, SIEGE_SEIZED, RECAPTURED, WITHDRAWAL, CEASEFIRE, ARMED_MOBILIZATION, CIVILIAN_HARM, DISPLACEMENT, HUMANITARIAN_CRISIS, POLITICAL_DEVELOPMENT

Actor normalization — always use these canonical names:
Tatmadaw/SAC/junta/Myanmar military → "Tatmadaw"
PDF/People's Defence Force → "People's Defence Force"
NUG → "National Unity Government"
TNLA → "Ta'ang National Liberation Army"
MNDAA/Kokang → "Myanmar National Democratic Alliance Army"
AA → "Arakan Army"
KIA → "Kachin Independence Army"
KNU → "Karen National Union"
KNLA → "Karen National Liberation Army"
CNF → "Chin National Front"
RCSS/SSA-S → "Restoration Council of Shan State"
UWSA → "United Wa State Army"

Bias flags: neutral | pro_resistance | pro_junta | unverified_claim

Output (JSON array, max 3 events per article):
[{"eventType":"CLASH","date":"2024-03-15","region":"Sagaing Region","adminArea":"Taze","location":"near Kanbalu","actors":["Tatmadaw","People's Defence Force"],"attackerActor":"Tatmadaw","defenderActor":"People's Defence Force","summary":"...","fatalities":5,"fatalitiesMin":3,"fatalitiesMax":7,"biasFlag":"neutral"}]

Return [] if the article contains no conflict events.`

const FALLBACK_TYPE_MAP: [RegExp, ConflictEventType][] = [
  [/airstrike|air.?strike|bomb(?:ing|ed)|drone.?strike/i,          'AIRSTRIKE'],
  [/artillery|mortar|shelling|shell(?:ed|ing)\b/i,                  'ARTILLERY_SHELLING'],
  [/\bambush(?:ed)?\b/i,                                            'AMBUSH'],
  [/seize[sd]?|captur|overrun|fell\s+to|taken\s+by|storm(?:ed)?/i, 'SIEGE_SEIZED'],
  [/recaptur|retook|retaken|liberat/i,                              'RECAPTURED'],
  [/withdraw|retreat|pull.?back/i,                                  'WITHDRAWAL'],
  [/ceasefire|cease-fire|truce/i,                                   'CEASEFIRE'],
  [/deploy|mobiliz|reinforc|troop.{0,20}mov/i,                     'ARMED_MOBILIZATION'],
  [/civilian.{0,30}kill|village.{0,30}burn|execut|torture/i,       'CIVILIAN_HARM'],
  [/displace|flee|refugee|exodus|idp\b/i,                           'DISPLACEMENT'],
  [/humanitarian|aid.{0,20}block|food.{0,20}short|medicine.{0,20}short/i, 'HUMANITARIAN_CRISIS'],
  [/clash|battle|fight|combat|gun.?fight|firefight|skirmish/i,     'CLASH'],
]

const REGION_MAP: [RegExp, string][] = [
  [/sagaing/i,'Sagaing Region'],[/rakhine|arakan/i,'Rakhine State'],
  [/kachin/i,'Kachin State'],[/northern shan|southern shan|eastern shan|shan state/i,'Shan State'],
  [/kayah|karenni/i,'Kayah State'],[/kayin|karen state/i,'Kayin State'],
  [/chin state/i,'Chin State'],[/\bmon state\b/i,'Mon State'],
  [/mandalay/i,'Mandalay Region'],[/yangon/i,'Yangon Region'],
  [/\bbago\b/i,'Bago Region'],[/magway/i,'Magway Region'],
  [/ayeyarwady|irrawaddy/i,'Ayeyarwady Region'],
  [/naypyidaw/i,'Naypyidaw Union Territory'],
  [/tanintharyi|mergui/i,'Tanintharyi Region'],
  // Short-form fallback (only after full-form failed)
  [/\bshan\b/i,'Shan State'],[/\bchin\b/i,'Chin State'],[/\bmon\b/i,'Mon State'],
]

const FATAL_PATTERNS = [
  /kills?\s+(\d+)/i,
  /(\d+)\s*(?:soldiers?|troops?|fighters?|civilians?|people)?\s*(?:were\s+)?killed/i,
  /(\d+)\s+dead\b/i,
  /death toll[^.]{0,30}(\d+)/i,
  /(\d+)\s+fatalities/i,
  /killing\s+at least\s+(\d+)/i,
  /killing\s+(\d+)/i,
]

const RANGE_PATTERN = /(\d+)\s*(?:to|-)\s*(\d+)\s*(?:soldiers?|troops?|people|civilians?)?\s*killed/i

const CONFLICT_SIGNAL = /kill|clash|attack|airstrike|bomb|shell|seize|captur|fight|battle|troops|military|tatmadaw|pdf\b|armed|artillery|offensive|ambush|withdraw|displace/i

function fallbackExtract(
  title:      string,
  content:    string,
  publishedAt: Date | null,
): ExtractedEvent | null {
  const text = `${title}\n${content}`
  if (!CONFLICT_SIGNAL.test(text)) return null

  let eventType: ConflictEventType = 'CLASH'
  for (const [rx, t] of FALLBACK_TYPE_MAP) {
    if (rx.test(text)) { eventType = t; break }
  }

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

  let region = 'Myanmar'
  for (const [rx, r] of REGION_MAP) { if (rx.test(text)) { region = r; break } }

  return {
    eventType,
    date:          (publishedAt ?? new Date()).toISOString().split('T')[0],
    region,
    adminArea:     null,
    location:      null,
    actors:        [],
    attackerActor: null,
    defenderActor: null,
    summary:       title.slice(0, 300),
    fatalities:    fatals,
    fatalitiesMin: fatalMin,
    fatalitiesMax: fatalMax,
    biasFlag:      'neutral',
  }
}

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic()
  return _client
}

export async function extractEvents(
  title:       string,
  content:     string,
  sourceName:  string,
  publishedAt: Date | null,
): Promise<ExtractedEvent[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    const ev = fallbackExtract(title, content, publishedAt)
    return ev ? [ev] : []
  }

  const prompt =
    `Source: ${sourceName}\nPublished: ${publishedAt?.toISOString() ?? 'unknown'}\n\nTitle: ${title}\n\nContent:\n${content.slice(0, 3500)}`

  try {
    const msg = await getClient().messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system:     EXTRACTION_SYSTEM,
      messages:   [{ role: 'user', content: prompt }],
    })

    const text = msg.content[0]?.type === 'text' ? msg.content[0].text.trim() : '[]'
    const parsed = JSON.parse(text)
    if (!Array.isArray(parsed)) return []
    return (parsed as ExtractedEvent[]).slice(0, 3)
  } catch {
    const ev = fallbackExtract(title, content, publishedAt)
    return ev ? [ev] : []
  }
}
