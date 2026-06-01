/**
 * Manually insert known recapture events with verified coordinates.
 * Run: tsx --env-file=.env.local src/scripts/manual-events.ts
 */
import * as crypto from 'crypto'
import { makePrisma } from './make-prisma'

const prisma     = makePrisma()
const INTEL_START = new Date('2023-01-01T00:00:00Z')

interface ManualEvent {
  url:       string
  title:     string
  source:    string
  eventType: 'RECAPTURED' | 'SIEGE_SEIZED'
  location:  string
  adminArea: string
  region:    string
  lat:       number
  lng:       number
  date:      string   // YYYY-MM-DD
  attacker:  string
  defender:  string
  summary:   string
}

const EVENTS: ManualEvent[] = [
  {
    url:       'https://www.irrawaddy.com/news/burma/myanmar-regime-recaptures-strategic-chin-state-town-of-tonzang.html',
    title:     'Myanmar Regime Recaptures Strategic Chin State Town of Tonzang',
    source:    'irrawaddy.com',
    eventType: 'RECAPTURED',
    location:  'Tonzang', adminArea: 'Tonzang', region: 'Chin State',
    lat: 23.606703018520346, lng: 93.68805078833118,
    date: '2026-05-21',
    attacker: 'Tatmadaw', defender: 'Chin National Front',
    summary: 'Myanmar military (SAC) recaptures Tonzang, a strategic Chin State town, from resistance forces.',
  },
  {
    url:       'https://monnews.org/2025/07/17/military-junta-troops-enter-naung-cho-town/',
    title:     'Military Junta Troops Enter Naung Cho Town',
    source:    'monnews.org',
    eventType: 'RECAPTURED',
    location:  'Naung Cho', adminArea: 'Naung Cho', region: 'Shan State',
    lat: 22.331815727888806, lng: 96.80051555128497,
    date: '2025-07-17',
    attacker: 'Tatmadaw', defender: "Ta'ang National Liberation Army",
    summary: 'Myanmar junta troops enter and secure Naung Cho town in northern Shan State.',
  },
  {
    url:       'https://www.irrawaddy.com/news/war-against-the-junta/myanmar-junta-troops-secure-kyaukme-town-after-capture.html',
    title:     'Myanmar Junta Troops Secure Kyaukme Town After Capture',
    source:    'irrawaddy.com',
    eventType: 'RECAPTURED',
    location:  'Kyaukme', adminArea: 'Kyaukme', region: 'Shan State',
    lat: 22.544702384833364, lng: 97.03337405314063,
    date: '2025-10-03',
    attacker: 'Tatmadaw', defender: "Ta'ang National Liberation Army",
    summary: 'Myanmar junta secures Kyaukme town in northern Shan State after recapture from TNLA.',
  },
  {
    url:       'https://www.irrawaddy.com/news/war-against-the-junta/myanmar-junta-recaptures-hsipaw-key-n-shan-town-from-tnla.html',
    title:     'Myanmar Junta Recaptures Hsipaw, Key N. Shan Town, From TNLA',
    source:    'irrawaddy.com',
    eventType: 'RECAPTURED',
    location:  'Hsipaw', adminArea: 'Hsipaw', region: 'Shan State',
    lat: 22.623957970266222, lng: 97.29984476490311,
    date: '2025-10-16',
    attacker: 'Tatmadaw', defender: "Ta'ang National Liberation Army",
    summary: 'Myanmar junta recaptures Hsipaw, a key northern Shan State town, from TNLA forces.',
  },
  {
    url:       'https://myanmar-now.org/en/news/myanmar-military-retakes-key-town-north-of-mandalay-after-month-long-offensive/',
    title:     'Myanmar Military Retakes Key Town North of Mandalay After Month-Long Offensive',
    source:    'myanmar-now.org',
    eventType: 'RECAPTURED',
    location:  'Singu', adminArea: 'Singu', region: 'Mandalay Region',
    lat: 22.598211560981685, lng: 95.88073781904029,
    date: '2025-12-19',
    attacker: 'Tatmadaw', defender: "People's Defence Force",
    summary: 'Myanmar military retakes Singu, a key town north of Mandalay, after a month-long offensive.',
  },
  {
    url:       'https://myanmar-now.org/en/news/myanmar-junta-continues-advance-towards-tagaung/',
    title:     'Myanmar Junta Continues Advance Towards Tagaung',
    source:    'myanmar-now.org',
    eventType: 'RECAPTURED',
    location:  'Tagaung', adminArea: 'Tagaung', region: 'Sagaing Region',
    lat: 23.49619040820264, lng: 96.01205302186074,
    date: '2026-03-12',
    attacker: 'Tatmadaw', defender: "People's Defence Force",
    summary: 'Myanmar junta advances and recaptures Tagaung in Sagaing Region.',
  },
  {
    url:       'https://myanmar-now.org/en/news/resistance-withdraws-from-tigyaing-as-junta-advances-in-sagaing/',
    title:     'Resistance Withdraws From Tigyaing as Junta Advances in Sagaing',
    source:    'myanmar-now.org',
    eventType: 'RECAPTURED',
    location:  'Tigyaing', adminArea: 'Tigyaing', region: 'Sagaing Region',
    lat: 23.756515515995428, lng: 96.14603480927514,
    date: '2026-04-01',
    attacker: 'Tatmadaw', defender: "People's Defence Force",
    summary: 'Resistance forces withdraw from Tigyaing as Myanmar junta advances in Sagaing Region.',
  },
  {
    url:       'https://www.irrawaddy.com/news/war-against-the-junta/regime-forces-advance-toward-resistance-held-indaw-in-sagaing-offensive.html',
    title:     'Regime Forces Advance Toward Resistance-Held Indaw in Sagaing Offensive',
    source:    'irrawaddy.com',
    eventType: 'RECAPTURED',
    location:  'Indaw', adminArea: 'Indaw', region: 'Sagaing Region',
    lat: 24.221737844447365, lng: 96.1429222005248,
    date: '2026-04-28',
    attacker: 'Tatmadaw', defender: "People's Defence Force",
    summary: 'Myanmar regime forces advance and recapture resistance-held Indaw in Sagaing Region offensive.',
  },
  {
    url:       'https://www.irrawaddy.com/news/war-against-the-junta/myanmar-regime-recaptures-chin-states-falam.html',
    title:     "Myanmar Regime Recaptures Chin State's Falam",
    source:    'irrawaddy.com',
    eventType: 'RECAPTURED',
    location:  'Falam', adminArea: 'Falam', region: 'Chin State',
    lat: 22.914774917539948, lng: 93.67548291843883,
    date: '2026-04-24',
    attacker: 'Tatmadaw', defender: 'Chin National Front',
    summary: "Myanmar regime recaptures Falam, Chin State's second-largest town, from resistance forces.",
  },
]

function dedupHash(actors: string[], region: string, adminArea: string | null, eventType: string, date: Date): string {
  const key = [actors.sort().join('+'), region, adminArea ?? '', eventType, date.toISOString().slice(0, 10)].join('|')
  return crypto.createHash('sha256').update(key).digest('hex').slice(0, 32)
}

async function main() {
  // ── Fix existing Maw Taung SIEGE_SEIZED coordinates ──────────────────────────
  console.log('Fixing Maw Taung coordinates...')
  const mawtaung = await prisma.conflictEvent.findFirst({
    where: { location: 'Maw Taung' }
  })
  if (mawtaung) {
    await prisma.conflictEvent.update({
      where: { id: mawtaung.id },
      data: { lat: 11.797194283733495, lng: 99.62418881076528 }
    })
    console.log('✓ Maw Taung SIEGE_SEIZED coords hardcoded')
  }

  // ── Insert manual events ──────────────────────────────────────────────────────
  console.log('\nInserting manual recapture events...\n')
  let saved = 0

  for (const ev of EVENTS) {
    const evDate  = new Date(ev.date)
    const actors  = [ev.attacker, ev.defender]
    const hash    = dedupHash(actors, ev.region, ev.adminArea, ev.eventType, evDate)

    // Find or create RawArticle
    let article = await prisma.rawArticle.findUnique({ where: { url: ev.url } })
    if (!article) {
      article = await prisma.rawArticle.create({
        data: {
          url:         ev.url,
          channelName: ev.source,
          title:       ev.title,
          content:     ev.title,
          sourceType:  'RSS',
          publishedAt: evDate,
        },
      })
    }

    const conflict = await prisma.conflictEvent.upsert({
      where:  { dedupHash: hash },
      create: {
        rawArticleId:  article.id,
        eventType:     ev.eventType,
        date:          evDate,
        region:        ev.region,
        adminArea:     ev.adminArea,
        location:      ev.location,
        lat:           ev.lat,
        lng:           ev.lng,
        summary:       ev.title,
        fatalities:    0, fatalitiesMin: 0, fatalitiesMax: 0,
        biasFlag:      'neutral',
        dedupHash:     hash,
      },
      update: { lat: ev.lat, lng: ev.lng, region: ev.region, location: ev.location },
    })

    await prisma.analysedEvent.upsert({
      where:  { conflictEventId: conflict.id },
      create: {
        conflictEventId:      conflict.id,
        attackerActor:        ev.attacker,
        defenderActor:        ev.defender,
        actors,
        confidence:           0.90,
        summary:              ev.summary,
        isActiveIntelligence: evDate >= INTEL_START,
      },
      update: {
        attackerActor: ev.attacker,
        defenderActor: ev.defender,
        summary:       ev.summary,
      },
    })

    console.log(`✓ ${ev.eventType.padEnd(12)} ${ev.region.padEnd(22)} ${ev.location}  (${ev.date})`)
    saved++
  }

  console.log(`\n✓ Done — ${saved} events inserted/updated`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
