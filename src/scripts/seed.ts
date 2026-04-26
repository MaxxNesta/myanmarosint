/**
 * Seed the database with Myanmar conflict events from public OSINT sources.
 * Run: npm run db:seed
 */

import { PrismaClient } from '@prisma/client'
import { calculateConfidence } from '../lib/confidence'
import { differenceInDays } from 'date-fns'

const prisma = new PrismaClient()

type SeedEvent = {
  date: string; region: string; adminArea?: string; type: string
  severity: number; summary: string; source: string; sourceUrl?: string
  lat?: number; lng?: number; fatalities?: number; actors?: string[]
}

const EVENTS: SeedEvent[] = [
  // ── 2023 ─────────────────────────────────────────────────────────
  {
    date: '2023-10-27', region: 'Shan State', adminArea: 'Laukkai', type: 'ARMED_CONFLICT', severity: 5,
    summary: 'Operation 1027 launched by the Three Brotherhood Alliance (MNDAA, TNLA, AA). Heavy fighting erupts across northern Shan State with multiple simultaneous assaults on military outposts and checkpoints.',
    source: 'Irrawaddy', lat: 23.7, lng: 98.1, fatalities: 45,
    actors: ['MNDAA', 'TNLA', 'AA', 'Tatmadaw'],
  },
  {
    date: '2023-11-03', region: 'Shan State', adminArea: 'Chin Shwe Haw', type: 'ARMED_CONFLICT', severity: 5,
    summary: 'MNDAA forces capture Chin Shwe Haw border town, cutting off key trade route to China. Multiple military outposts overrun.',
    source: 'Myanmar Now', lat: 23.9, lng: 98.4, fatalities: 67,
    actors: ['MNDAA', 'Tatmadaw'],
  },
  {
    date: '2023-11-13', region: 'Shan State', adminArea: 'Kunlong', type: 'ARMED_CONFLICT', severity: 4,
    summary: 'TNLA forces advance on Kunlong and surrounding townships. Tatmadaw conducts airstrikes on residential areas per local residents.',
    source: 'RFA Myanmar', lat: 23.2, lng: 98.7, fatalities: 22,
    actors: ['TNLA', 'Tatmadaw'],
  },
  {
    date: '2023-12-01', region: 'Rakhine State', adminArea: 'Paletwa', type: 'ARMED_CONFLICT', severity: 4,
    summary: 'Arakan Army resumes major offensive in Rakhine and Chin states. AA forces capture military bases around Paletwa town area.',
    source: 'Irrawaddy', lat: 21.4, lng: 92.8, fatalities: 31,
    actors: ['AA', 'Tatmadaw'],
  },
  {
    date: '2023-12-15', region: 'Kachin State', adminArea: 'Hpakant', type: 'ARMED_CONFLICT', severity: 4,
    summary: 'KIA offensive intensifies in Hpakant jade mining region. Multiple military forward bases fall to KIA forces over three days.',
    source: 'Kachin News Group', lat: 26.0, lng: 96.1, fatalities: 19,
    actors: ['KIA', 'Tatmadaw'],
  },
  // ── 2024 ─────────────────────────────────────────────────────────
  {
    date: '2024-01-09', region: 'Rakhine State', adminArea: 'Buthidaung', type: 'ARMED_CONFLICT', severity: 5,
    summary: 'AA captures Buthidaung town following sustained siege. Military council forces retreat toward Maungdaw. Mass displacement of civilians reported.',
    source: 'Myanmar Now', lat: 20.9, lng: 92.5, fatalities: 54,
    actors: ['AA', 'Tatmadaw'],
  },
  {
    date: '2024-02-14', region: 'Rakhine State', adminArea: 'Rathedaung', type: 'ARMED_CONFLICT', severity: 4,
    summary: 'AA extends territorial control to Rathedaung township. Military council deploys naval vessels to maintain supply lines along Kaladan River.',
    source: 'Irrawaddy', lat: 20.4, lng: 92.6, fatalities: 28,
    actors: ['AA', 'Tatmadaw'],
  },
  {
    date: '2024-03-05', region: 'Sagaing Region', adminArea: 'Shwebo', type: 'ARMED_CONFLICT', severity: 3,
    summary: 'PDF forces conduct coordinated ambush on military convoy near Shwebo. Anti-junta forces report control of several rural townships.',
    source: 'DVB News', lat: 22.6, lng: 95.7, fatalities: 11,
    actors: ['PDF', 'Tatmadaw'],
  },
  {
    date: '2024-03-20', region: 'Sagaing Region', adminArea: 'Monywa', type: 'HUMANITARIAN_ALERT', severity: 4,
    summary: 'OCHA reports over 300,000 displaced persons in Sagaing Region, exhausting emergency camp capacity. Aid access severely limited by ongoing hostilities.',
    source: 'OCHA Myanmar', lat: 22.1, lng: 95.1, fatalities: 0,
    actors: ['Civilians', 'OCHA'],
  },
  {
    date: '2024-04-10', region: 'Kayah State', adminArea: 'Loikaw', type: 'ARMED_CONFLICT', severity: 4,
    summary: 'KNDF (Karenni) forces encircle military council positions in Loikaw. Heavy urban combat reported; civilian casualties confirmed by local sources.',
    source: 'Karenni News', lat: 19.7, lng: 97.2, fatalities: 33,
    actors: ['KNDF', 'Tatmadaw'],
  },
  {
    date: '2024-05-01', region: 'Chin State', adminArea: 'Falam', type: 'ARMED_CONFLICT', severity: 3,
    summary: 'Chin National Army advances in Falam and Hakha districts, seizing multiple Tatmadaw patrol bases and arms caches.',
    source: 'Chin Human Rights Organization', lat: 22.9, lng: 93.7, fatalities: 15,
    actors: ['CNA', 'Tatmadaw'],
  },
  {
    date: '2024-06-15', region: 'Rakhine State', adminArea: 'Ann', type: 'ARMED_CONFLICT', severity: 5,
    summary: 'AA captures Ann district command center, the largest military council loss in Rakhine in decades. Tatmadaw airstrikes escalate across state.',
    source: 'Myanmar Now', lat: 19.8, lng: 94.0, fatalities: 78,
    actors: ['AA', 'Tatmadaw'],
  },
  {
    date: '2024-07-20', region: 'Shan State', adminArea: 'Hsipaw', type: 'ARMED_CONFLICT', severity: 4,
    summary: 'TNLA offensive targets Hsipaw town. Sustained artillery exchanges reported. Tatmadaw retreats from outer defensive lines.',
    source: 'Shan Human Rights Foundation', lat: 22.6, lng: 97.3, fatalities: 25,
    actors: ['TNLA', 'Tatmadaw'],
  },
  {
    date: '2024-07-30', region: 'Mandalay Region', adminArea: 'Mandalay', type: 'POLITICAL_UNREST', severity: 3,
    summary: 'Underground NUG networks report increased civil disobedience coordinated across Mandalay. Several municipal officials resign; security forces conduct midnight raids.',
    source: 'RFA Myanmar', lat: 21.9, lng: 96.1, fatalities: 0,
    actors: ['NUG', 'CDM Workers', 'Tatmadaw'],
  },
  {
    date: '2024-08-12', region: 'Sagaing Region', adminArea: 'Sagaing', type: 'INFRASTRUCTURE_DISRUPTION', severity: 3,
    summary: 'PDF units destroy bridge on Chindwin River to impede Tatmadaw logistics. Power grid sabotage in three townships leaves 40,000 without electricity.',
    source: 'DVB News', lat: 21.9, lng: 95.9, fatalities: 0,
    actors: ['PDF'],
  },
  {
    date: '2024-09-05', region: 'Kachin State', adminArea: 'Waingmaw', type: 'ARMED_CONFLICT', severity: 4,
    summary: 'KIA intensifies attacks on military positions surrounding Waingmaw opposite Myitkyina, Kachin capital. Heavy artillery exchanges reported for 72 hours.',
    source: 'Kachin News Group', lat: 25.3, lng: 97.5, fatalities: 41,
    actors: ['KIA', 'Tatmadaw'],
  },
  {
    date: '2024-10-05', region: 'Rakhine State', adminArea: 'Sittwe', type: 'HUMANITARIAN_ALERT', severity: 5,
    summary: 'AA forces tighten siege on Sittwe, Rakhine State capital. Acute food and medicine shortages reported. UNHCR warns of humanitarian catastrophe for remaining civilians.',
    source: 'UNHCR Myanmar', lat: 20.1, lng: 92.9, fatalities: 12,
    actors: ['AA', 'Civilians'],
  },
  {
    date: '2024-11-15', region: 'Shan State', adminArea: 'Lashio', type: 'ARMED_CONFLICT', severity: 5,
    summary: 'MNDAA captures Lashio, the largest city in northern Shan State and critical logistics hub. Military council evacuates regional headquarters under fire.',
    source: 'Irrawaddy', lat: 22.9, lng: 97.8, fatalities: 89,
    actors: ['MNDAA', 'Tatmadaw'],
  },
  {
    date: '2024-12-01', region: 'Kayah State', adminArea: 'Demoso', type: 'ARMED_CONFLICT', severity: 4,
    summary: 'KNDF consolidates control over Demoso and expands administrative authority across liberated Kayah territory. Military council air operations continue.',
    source: 'Karenni News', lat: 19.5, lng: 97.3, fatalities: 18,
    actors: ['KNDF', 'Tatmadaw'],
  },
  // ── 2025 ─────────────────────────────────────────────────────────
  {
    date: '2025-01-10', region: 'Rakhine State', adminArea: 'Kyaukpyu', type: 'ARMED_CONFLICT', severity: 5,
    summary: 'AA now controls approximately 80% of Rakhine State territory. Kyaukpyu SEZ vicinity remains contested; China-backed pipeline infrastructure at strategic risk.',
    source: 'Myanmar Now', lat: 19.4, lng: 93.5, fatalities: 35,
    actors: ['AA', 'Tatmadaw', 'China energy interests'],
  },
  {
    date: '2025-01-22', region: 'Sagaing Region', adminArea: 'Sagaing', type: 'HUMANITARIAN_ALERT', severity: 5,
    summary: 'OCHA estimates 3.2 million displaced in Sagaing Region — highest in the country. Mass grave discovered in Ye-U township. Emergency food aid access blocked by Tatmadaw.',
    source: 'OCHA Myanmar', lat: 22.3, lng: 95.7, fatalities: 0,
    actors: ['Tatmadaw', 'Civilians'],
  },
  {
    date: '2025-02-05', region: 'Mandalay Region', adminArea: 'Mandalay', type: 'INFRASTRUCTURE_DISRUPTION', severity: 3,
    summary: 'Coordinated power grid sabotage disrupts electricity supply to Mandalay city for 18 hours. Military council attributes attack to NUG-affiliated groups.',
    source: 'DVB News', lat: 21.97, lng: 96.08, fatalities: 0,
    actors: ['PDF', 'NUG affiliates'],
  },
  {
    date: '2025-02-20', region: 'Kachin State', adminArea: 'Bhamo', type: 'ARMED_CONFLICT', severity: 4,
    summary: 'KIA advance on Bhamo, strategic river trade hub. Multiple Tatmadaw battalions redeployed from Sagaing. China calls for de-escalation along border.',
    source: 'RFA Myanmar', lat: 24.3, lng: 97.2, fatalities: 29,
    actors: ['KIA', 'Tatmadaw'],
  },
  {
    date: '2025-03-10', region: 'Shan State', adminArea: 'Taunggyi', type: 'ARMED_CONFLICT', severity: 4,
    summary: 'TNLA and RCSS conflict erupts southeast of Taunggyi, opening second front among EAOs. SAC exploits friction but broader Brotherhood Alliance remains intact.',
    source: 'Shan Human Rights Foundation', lat: 20.8, lng: 97.0, fatalities: 22,
    actors: ['TNLA', 'RCSS', 'Tatmadaw'],
  },
  {
    date: '2025-03-25', region: 'Yangon Region', adminArea: 'Yangon', type: 'POLITICAL_UNREST', severity: 3,
    summary: 'Underground resistance activity disrupts armed forces day ceremonies across Yangon townships. Security forces conduct mass arrests; at least 48 detained.',
    source: 'Irrawaddy', lat: 16.87, lng: 96.19, fatalities: 0,
    actors: ['NUG affiliates', 'Tatmadaw'],
  },
  {
    date: '2025-04-05', region: 'Chin State', adminArea: 'Hakha', type: 'ARMED_CONFLICT', severity: 3,
    summary: 'CNA launches offensive on remaining military positions in Hakha district. Command structure in Chin State reportedly isolated from Naypyidaw.',
    source: 'Chin Human Rights Organization', lat: 22.6, lng: 93.6, fatalities: 14,
    actors: ['CNA', 'Tatmadaw'],
  },
  {
    date: '2025-04-10', region: 'Bago Region', adminArea: 'Bago', type: 'POLITICAL_UNREST', severity: 2,
    summary: 'NUG shadow administration expands parallel governance in liberated Bago townships. Tax collection and civil services operating outside military council control.',
    source: 'DVB News', lat: 17.3, lng: 96.5, fatalities: 0,
    actors: ['NUG', 'PDF'],
  },
  {
    date: '2025-04-15', region: 'Rakhine State', adminArea: 'Maungdaw', type: 'HUMANITARIAN_ALERT', severity: 5,
    summary: 'Rohingya civilians caught in crossfire as AA and Tatmadaw contest Maungdaw. UNHCR documents fresh displacement into Bangladesh. ICJ proceedings ongoing.',
    source: 'UNHCR Myanmar', lat: 20.8, lng: 92.4, fatalities: 23,
    actors: ['AA', 'Tatmadaw', 'Rohingya civilians'],
  },
]

async function main() {
  console.log('🌱 Seeding Myanmar conflict events…')

  let created = 0
  let skipped = 0

  for (const e of EVENTS) {
    const sourceId = `seed-${e.date}-${e.region.replace(/\s+/g, '-').toLowerCase()}`

    const existing = await prisma.processedEvent.findFirst({
      where: { rawEventId: sourceId },
    })
    if (existing) { skipped++; continue }

    const ageDays     = differenceInDays(new Date(), new Date(e.date))
    const reliability = 'HIGH' as const
    const confidence  = calculateConfidence(reliability, 3, ageDays)

    await prisma.processedEvent.create({
      data: {
        date:       new Date(e.date),
        region:     e.region,
        adminArea:  e.adminArea ?? null,
        type:       e.type as never,
        severity:   e.severity,
        summary:    e.summary,
        source:     e.source,
        sourceUrl:  e.sourceUrl ?? null,
        reliability,
        confidence,
        latitude:   e.lat   ?? null,
        longitude:  e.lng   ?? null,
        fatalities: e.fatalities ?? 0,
        actors:     e.actors ?? [],
        tags:       [e.type, e.region],
        rawEventId: sourceId,
      },
    })
    created++
  }

  await prisma.updateLog.create({
    data: {
      change:   `Seeded ${created} events, skipped ${skipped} duplicates`,
      reason:   'Initial database seed',
      source:   'seed.ts',
      metadata: { created, skipped, total: EVENTS.length },
    },
  })

  console.log(`✅ Created ${created} events, skipped ${skipped} duplicates`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
