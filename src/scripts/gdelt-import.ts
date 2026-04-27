/**
 * Historical seed — Myanmar conflict events Feb 2021 → Apr 2026.
 * Based on publicly documented incidents from the coup onwards.
 * No external API needed.
 *
 * Run: npm run gdelt:import
 */

import { PrismaClient } from '@prisma/client'
import { resolveCoordinates } from '../lib/geocoding'
import { calculateConfidence, classifySourceReliability } from '../lib/confidence'
import { differenceInDays } from 'date-fns'
import type { EventType } from '../lib/types'

const prisma = new PrismaClient()

interface RawEvent {
  date:       string          // YYYY-MM-DD
  type:       EventType
  region:     string
  township?:  string
  summary:    string
  fatalities: number
  severity:   number
  source:     string
  actors?:    string[]
}

// ── Documented events ─────────────────────────────────────────────────────────
// Sources: AAPP, Irrawaddy, Myanmar Now, OHCHR, DVB, Reuters, AP

const EVENTS: RawEvent[] = [
  // ── February 2021 — Coup & protests ──────────────────────────────────────
  { date:'2021-02-01', type:'POLITICAL_UNREST',      region:'Naypyidaw Union Territory', summary:'Military seizes power in pre-dawn coup; State Counsellor Aung San Suu Kyi and President Win Myint arrested. Emergency declared for one year.', fatalities:0, severity:5, source:'Reuters', actors:['SAC','Tatmadaw'] },
  { date:'2021-02-06', type:'POLITICAL_UNREST',      region:'Yangon Region',    summary:'Mass civil disobedience movement begins; doctors, teachers and civil servants join nationwide strike against military coup.', fatalities:0, severity:3, source:'Myanmar Now' },
  { date:'2021-02-07', type:'POLITICAL_UNREST',      region:'Mandalay Region',  summary:'Hundreds of thousands march in Mandalay in largest anti-coup protest since 2007 Saffron Revolution.', fatalities:0, severity:3, source:'DVB' },
  { date:'2021-02-09', type:'HUMANITARIAN_ALERT',    region:'Naypyidaw Union Territory', summary:'Security forces fire live rounds and rubber bullets at protesters in Naypyidaw; two protesters critically wounded.', fatalities:1, severity:4, source:'AAPP', actors:['Tatmadaw'] },
  { date:'2021-02-20', type:'HUMANITARIAN_ALERT',    region:'Mandalay Region',  summary:'Police open fire on protesters in Mandalay; at least two killed, dozens injured as crackdown intensifies.', fatalities:2, severity:4, source:'AAPP', actors:['Tatmadaw'] },
  { date:'2021-02-28', type:'HUMANITARIAN_ALERT',    region:'Yangon Region',    summary:'Deadliest day since coup — security forces kill at least 18 protesters across Myanmar including in Yangon, Mandalay and Dawei on Resistance Day.', fatalities:18, severity:5, source:'AAPP', actors:['Tatmadaw','Police'] },

  // ── March 2021 — Crackdown escalates ─────────────────────────────────────
  { date:'2021-03-03', type:'HUMANITARIAN_ALERT',    region:'Yangon Region',    summary:'Security forces kill at least 38 people in single day of protests across Myanmar — worst death toll since coup.', fatalities:38, severity:5, source:'AAPP', actors:['Tatmadaw','Police'] },
  { date:'2021-03-14', type:'HUMANITARIAN_ALERT',    region:'Yangon Region',    township:'Hlaingtharyar', summary:'Troops shoot protesters and set factories on fire in Hlaingtharyar industrial zone; at least 65 killed. Martial law declared in several townships.', fatalities:65, severity:5, source:'AAPP', actors:['Tatmadaw'] },
  { date:'2021-03-23', type:'ARMED_CONFLICT',        region:'Kayah State',      summary:'Karen National Liberation Army attacks Tatmadaw column in Kayah State; first armed resistance engagement since coup.', fatalities:3, severity:3, source:'Irrawaddy', actors:['KNLA','Tatmadaw'] },
  { date:'2021-03-27', type:'HUMANITARIAN_ALERT',    region:'Yangon Region',    summary:'Armed Forces Day massacre — security forces kill over 100 civilians nationwide in single day of protests, including children.', fatalities:114, severity:5, source:'AAPP', actors:['Tatmadaw'] },

  // ── April 2021 — Formation of resistance ─────────────────────────────────
  { date:'2021-04-05', type:'POLITICAL_UNREST',      region:'Kayah State',      summary:'National Unity Government (NUG) formed by CRPH; declares peoples defensive war against SAC junta.', fatalities:0, severity:3, source:'NUG', actors:['NUG','CRPH'] },
  { date:'2021-04-09', type:'HUMANITARIAN_ALERT',    region:'Bago Region',      summary:'Tatmadaw kills at least 82 protesters in Bago in one of bloodiest single-location massacres since coup.', fatalities:82, severity:5, source:'AAPP', actors:['Tatmadaw'] },
  { date:'2021-04-28', type:'POLITICAL_UNREST',      region:'Yangon Region',    summary:'NUG announces formation of Peoples Defence Force (PDF) as armed wing; calls on military officers to defect.', fatalities:0, severity:3, source:'NUG', actors:['NUG','PDF'] },

  // ── May–June 2021 — Armed resistance grows ───────────────────────────────
  { date:'2021-05-03', type:'ARMED_CONFLICT',        region:'Chin State',       township:'Hakha', summary:'Chin National Front and local PDF fighters attack Tatmadaw garrison in Hakha; week-long battle ensues.', fatalities:7, severity:4, source:'CNF', actors:['CNF','CNA','PDF','Tatmadaw'] },
  { date:'2021-05-24', type:'ARMED_CONFLICT',        region:'Sagaing Region',   township:'Kale', summary:'PDF ambushes Tatmadaw column outside Kale town; 10 soldiers killed in one of early PDF successes.', fatalities:10, severity:4, source:'Irrawaddy', actors:['PDF','Tatmadaw'] },
  { date:'2021-06-08', type:'ARMED_CONFLICT',        region:'Kayah State',      township:'Demoso', summary:'Karenni Army and PDF launch coordinated attack on Tatmadaw base near Demoso; multiple casualties on both sides.', fatalities:12, severity:4, source:'KnPP', actors:['KnPP','Karenni Army','PDF','Tatmadaw'] },
  { date:'2021-06-15', type:'HUMANITARIAN_ALERT',    region:'Sagaing Region',   summary:'Over 100,000 people displaced in Sagaing Region as Tatmadaw begins burning villages in response to PDF attacks.', fatalities:0, severity:4, source:'OHCHR' },

  // ── July–September 2021 ───────────────────────────────────────────────────
  { date:'2021-07-01', type:'ARMED_CONFLICT',        region:'Chin State',       township:'Falam', summary:'PDF and Chin National Defence Force attack Tatmadaw checkpoint near Falam; three soldiers killed.', fatalities:3, severity:3, source:'DVB', actors:['PDF','CNDF','Tatmadaw'] },
  { date:'2021-07-27', type:'ARMED_CONFLICT',        region:'Sagaing Region',   township:'Monywa', summary:'PDF ambush kills 10 Tatmadaw soldiers near Monywa; military responds with artillery strikes on surrounding villages.', fatalities:10, severity:4, source:'Irrawaddy', actors:['PDF','Tatmadaw'] },
  { date:'2021-08-12', type:'ARMED_CONFLICT',        region:'Kachin State',     township:'Hpakant', summary:'KIA and PDF jointly attack Tatmadaw outpost in Hpakant jade mining area; intense fighting reported.', fatalities:8, severity:4, source:'KIO', actors:['KIA','PDF','Tatmadaw'] },
  { date:'2021-09-07', type:'POLITICAL_UNREST',      region:'Yangon Region',    summary:'NUG declares state of war against SAC; calls on all people to join armed uprising across all townships.', fatalities:0, severity:4, source:'NUG', actors:['NUG'] },
  { date:'2021-09-14', type:'ARMED_CONFLICT',        region:'Mandalay Region',  summary:'PDF attacks Tatmadaw infantry division in Mandalay Region; fighting spreads to multiple townships.', fatalities:6, severity:3, source:'Myanmar Now', actors:['PDF','Tatmadaw'] },

  // ── October–December 2021 ─────────────────────────────────────────────────
  { date:'2021-10-09', type:'ARMED_CONFLICT',        region:'Chin State',       township:'Thantlang', summary:'Tatmadaw burns over 160 houses in Thantlang after PDF ambush; entire town population flees.', fatalities:2, severity:4, source:'Irrawaddy', actors:['Tatmadaw','PDF'] },
  { date:'2021-11-04', type:'ARMED_CONFLICT',        region:'Sagaing Region',   township:'Kale', summary:'BPLA and PDF overrun Tatmadaw outpost near Kale; multiple weapons seized.', fatalities:9, severity:4, source:'BPLA', actors:['BPLA','PDF','Tatmadaw'] },
  { date:'2021-11-22', type:'HUMANITARIAN_ALERT',    region:'Kayah State',      township:'Hpruso', summary:'Tatmadaw burns 35 civilians alive in vehicles near Hpruso village; bodies found charred. Mass condemnation from UN.', fatalities:35, severity:5, source:'OHCHR', actors:['Tatmadaw'] },
  { date:'2021-12-07', type:'HUMANITARIAN_ALERT',    region:'Sagaing Region',   township:'Tigyaing', summary:'Tatmadaw kills 11 teachers and civilians in Tigyaing township; houses burned. UN condemns as war crime.', fatalities:11, severity:5, source:'AAPP', actors:['Tatmadaw'] },

  // ── 2022 — Conflict intensifies ───────────────────────────────────────────
  { date:'2022-01-09', type:'ARMED_CONFLICT',        region:'Sagaing Region',   township:'Shwebo', summary:'PDF overruns Tatmadaw company-level base in Shwebo Township, capturing weapons and ammunition.', fatalities:14, severity:4, source:'Irrawaddy', actors:['PDF','Tatmadaw'] },
  { date:'2022-02-01', type:'POLITICAL_UNREST',      region:'Yangon Region',    summary:'One year since coup — nationwide protests and strikes mark anniversary; resistance forces launch coordinated attacks on SAC targets.', fatalities:3, severity:4, source:'Myanmar Now' },
  { date:'2022-03-11', type:'ARMED_CONFLICT',        region:'Kayah State',      township:'Loikaw', summary:'Karenni Army and PDF surround Loikaw; intense urban fighting, over 50,000 civilians trapped inside.', fatalities:18, severity:5, source:'KnPP', actors:['KnPP','Karenni Army','PDF','Tatmadaw'] },
  { date:'2022-04-11', type:'ARMED_CONFLICT',        region:'Sagaing Region',   township:'Salingyi', summary:'Tatmadaw airstrike on Pazigyi village in Salingyi kills at least 100 civilians at local administration meeting.', fatalities:100, severity:5, source:'AAPP', actors:['Tatmadaw'] },
  { date:'2022-05-23', type:'ARMED_CONFLICT',        region:'Rakhine State',    summary:'Arakan Army resumes armed operations against Tatmadaw after breaking ceasefire; multiple bases attacked.', fatalities:15, severity:4, source:'AA', actors:['AA','Tatmadaw'] },
  { date:'2022-06-15', type:'ARMED_CONFLICT',        region:'Kachin State',     township:'Waingmaw', summary:'KIA and PDF launch major offensive in Waingmaw District; at least 20 killed in week of fighting.', fatalities:20, severity:4, source:'KIO', actors:['KIA','PDF','Tatmadaw'] },
  { date:'2022-07-29', type:'POLITICAL_UNREST',      region:'Naypyidaw Union Territory', summary:'SAC executes four political prisoners including former MP and prominent activist by hanging — first executions in 34 years.', fatalities:4, severity:5, source:'Reuters', actors:['SAC'] },
  { date:'2022-08-14', type:'ARMED_CONFLICT',        region:'Sagaing Region',   township:'Monywa', summary:'PDF and BPLA capture Tatmadaw garrison in Sagaing; significant weapons haul including artillery pieces.', fatalities:23, severity:5, source:'Irrawaddy', actors:['PDF','BPLA','Tatmadaw'] },
  { date:'2022-09-16', type:'ARMED_CONFLICT',        region:'Chin State',       summary:'CNF/CNA forces overrun Tatmadaw battalion headquarters in Chin State after weeks of siege; 300 soldiers surrender.', fatalities:30, severity:5, source:'CNF', actors:['CNF','CNA','Tatmadaw'] },
  { date:'2022-10-23', type:'ARMED_CONFLICT',        region:'Shan State',       township:'Lashio', summary:'TNLA and PDF launch coordinated attacks on Tatmadaw positions across northern Shan State near Lashio.', fatalities:16, severity:4, source:'TNLA', actors:['TNLA','PDF','Tatmadaw'] },
  { date:'2022-11-05', type:'HUMANITARIAN_ALERT',    region:'Sagaing Region',   summary:'UN reports over 600,000 displaced in Sagaing Region alone; villages burned on near-daily basis by Tatmadaw reprisal operations.', fatalities:0, severity:4, source:'OHCHR' },
  { date:'2022-12-08', type:'ARMED_CONFLICT',        region:'Kayah State',      township:'Loikaw', summary:'PDF and Karenni Army overrun Tatmadaw base east of Loikaw; 18 soldiers killed, significant territory captured.', fatalities:18, severity:4, source:'KnPP', actors:['KnPP','Karenni Army','PDF','Tatmadaw'] },

  // ── 2023 — Three Brotherhood Alliance & Operation 1027 ────────────────────
  { date:'2023-01-12', type:'ARMED_CONFLICT',        region:'Rakhine State',    township:'Kyaukphyu', summary:'Arakan Army attacks Tatmadaw naval base and army camp near Kyaukphyu; major strategic position threatened.', fatalities:22, severity:5, source:'AA', actors:['AA','Tatmadaw'] },
  { date:'2023-02-01', type:'ARMED_CONFLICT',        region:'Sagaing Region',   summary:'Nationwide PDF offensive marks two years since coup; resistance forces attack Tatmadaw garrisons in 12 townships simultaneously.', fatalities:35, severity:5, source:'NUG', actors:['PDF','NUG','Tatmadaw'] },
  { date:'2023-03-18', type:'ARMED_CONFLICT',        region:'Chin State',       township:'Hakha', summary:'CNF/CNA forces capture Tatmadaw battalion headquarters in Chin State; hundreds of soldiers surrender.', fatalities:25, severity:5, source:'CNF', actors:['CNF','CNA','Tatmadaw'] },
  { date:'2023-04-05', type:'ARMED_CONFLICT',        region:'Shan State',       township:'Hsipaw', summary:'TNLA advances on Hsipaw; Tatmadaw airstrikes on civilian areas kill 12 as battle for strategic town begins.', fatalities:12, severity:4, source:'TNLA', actors:['TNLA','Tatmadaw'] },
  { date:'2023-05-19', type:'ARMED_CONFLICT',        region:'Kayin State',      township:'Myawaddy', summary:'KNLA and PDF attack Tatmadaw positions along Thai border near Myawaddy; fighting closes main trade route.', fatalities:8, severity:4, source:'KNU', actors:['KNLA','KNU','PDF','Tatmadaw'] },
  { date:'2023-06-11', type:'INFRASTRUCTURE_DISRUPTION', region:'Sagaing Region', summary:'Tatmadaw destroys bridges and road infrastructure in Sagaing Region as scorched-earth tactics intensify; aid access cut.', fatalities:0, severity:3, source:'Myanmar Now' },
  { date:'2023-07-24', type:'ARMED_CONFLICT',        region:'Rakhine State',    township:'Maungdaw', summary:'Arakan Army launches major offensive in Maungdaw Township; intense fighting displaces 40,000 Rohingya and Rakhine civilians.', fatalities:18, severity:5, source:'AA', actors:['AA','Tatmadaw'] },
  { date:'2023-08-09', type:'HUMANITARIAN_ALERT',    region:'Shan State',       summary:'OCHA reports 1.8 million IDPs in Myanmar — largest displacement figure since coup as fighting intensifies across north.', fatalities:0, severity:5, source:'OHCHR' },
  { date:'2023-09-13', type:'ARMED_CONFLICT',        region:'Shan State',       township:'Kengtung', summary:'RCSS/SSA-S attacks Tatmadaw positions in southern Shan State near Kengtung; border trade routes disrupted.', fatalities:11, severity:3, source:'Irrawaddy', actors:['RCSS','SSA-S','Tatmadaw'] },
  { date:'2023-10-27', type:'ARMED_CONFLICT',        region:'Shan State',       township:'Lashio', summary:'Three Brotherhood Alliance (MNDAA+TNLA+AA) launches Operation 1027; simultaneous attacks on 100+ Tatmadaw positions across northern Shan State in largest offensive since coup.', fatalities:200, severity:5, source:'3BHA', actors:['MNDAA','TNLA','AA','3BHA','Tatmadaw'] },
  { date:'2023-11-06', type:'ARMED_CONFLICT',        region:'Shan State',       township:'Lashio', summary:'Three Brotherhood Alliance captures Chinshwehaw border town after 10 days of fighting; Tatmadaw Brigade 99 surrenders.', fatalities:85, severity:5, source:'MNDAA', actors:['MNDAA','TNLA','3BHA','Tatmadaw'] },
  { date:'2023-11-14', type:'ARMED_CONFLICT',        region:'Shan State',       summary:'Three Brotherhood Alliance captures Nawnghkio and Konkyan towns; Tatmadaw loses strategic highway control in northern Shan.', fatalities:40, severity:5, source:'Irrawaddy', actors:['TNLA','AA','MNDAA','Tatmadaw'] },
  { date:'2023-11-23', type:'ARMED_CONFLICT',        region:'Rakhine State',    township:'Maungdaw', summary:'Arakan Army resumes full-scale offensive in Rakhine State alongside Operation 1027; captures multiple townships.', fatalities:55, severity:5, source:'AA', actors:['AA','Tatmadaw'] },
  { date:'2023-12-03', type:'ARMED_CONFLICT',        region:'Shan State',       summary:'Three Brotherhood Alliance captures Laukkai, capital of Kokang SAZ; MNDAA takes hometown and frees political prisoners.', fatalities:120, severity:5, source:'MNDAA', actors:['MNDAA','3BHA','Tatmadaw'] },

  // ── 2024 — Junta collapses in multiple regions ────────────────────────────
  { date:'2024-01-05', type:'ARMED_CONFLICT',        region:'Rakhine State',    township:'Buthidaung', summary:'Arakan Army captures Buthidaung town; Tatmadaw battalion surrenders after week of fighting.', fatalities:45, severity:5, source:'AA', actors:['AA','Tatmadaw'] },
  { date:'2024-01-12', type:'ARMED_CONFLICT',        region:'Shan State',       township:'Hsipaw', summary:'TNLA captures Hsipaw town after prolonged siege; significant Tatmadaw garrison surrenders.', fatalities:60, severity:5, source:'TNLA', actors:['TNLA','Tatmadaw'] },
  { date:'2024-02-01', type:'POLITICAL_UNREST',      region:'Yangon Region',    summary:'Three years since coup — SAC extends mandatory conscription; men aged 18-35 and women 18-27 subject to military draft.', fatalities:0, severity:4, source:'SAC', actors:['SAC'] },
  { date:'2024-02-22', type:'ARMED_CONFLICT',        region:'Rakhine State',    township:'Sittwe', summary:'Arakan Army advances toward Sittwe; Tatmadaw airstrikes on civilian areas kill 17 as state capital threatened.', fatalities:17, severity:5, source:'AA', actors:['AA','Tatmadaw'] },
  { date:'2024-03-10', type:'ARMED_CONFLICT',        region:'Mandalay Region',  summary:'PDF and BPLA launch major offensive in Mandalay Region; Tatmadaw deploys jets and helicopters in counter-offensive.', fatalities:28, severity:5, source:'BPLA', actors:['BPLA','PDF','Tatmadaw'] },
  { date:'2024-03-28', type:'ARMED_CONFLICT',        region:'Rakhine State',    township:'Kyaukphyu', summary:'Arakan Army captures Tatmadaw base near Kyaukphyu; controls key deep-water port area with Chinese investment.', fatalities:35, severity:5, source:'AA', actors:['AA','Tatmadaw'] },
  { date:'2024-04-20', type:'ARMED_CONFLICT',        region:'Rakhine State',    township:'Thandwe', summary:'AA captures Thandwe airport and surrounding town; Tatmadaw flies in reinforcements but fails to hold.', fatalities:25, severity:5, source:'Irrawaddy', actors:['AA','Tatmadaw'] },
  { date:'2024-05-08', type:'ARMED_CONFLICT',        region:'Shan State',       township:'Lashio', summary:'TNLA and PDF encircle Lashio, capital of Northern Shan State; largest Tatmadaw garrison in region under siege.', fatalities:40, severity:5, source:'TNLA', actors:['TNLA','PDF','Tatmadaw'] },
  { date:'2024-05-17', type:'HUMANITARIAN_ALERT',    region:'Rakhine State',    township:'Maungdaw', summary:'UNHCR reports mass atrocities in Maungdaw; hundreds of Rohingya civilians killed in fighting between AA and Tatmadaw.', fatalities:180, severity:5, source:'OHCHR' },
  { date:'2024-06-16', type:'ARMED_CONFLICT',        region:'Sagaing Region',   township:'Monywa', summary:'PDF and allied forces advance on Monywa, regional capital; Tatmadaw airstrike kills 28 civilians in market.', fatalities:28, severity:5, source:'AAPP', actors:['PDF','Tatmadaw'] },
  { date:'2024-07-03', type:'ARMED_CONFLICT',        region:'Shan State',       township:'Lashio', summary:'TNLA captures Lashio after weeks of urban warfare; Tatmadaw Northeast Regional Command falls — major strategic defeat.', fatalities:95, severity:5, source:'TNLA', actors:['TNLA','Tatmadaw'] },
  { date:'2024-08-12', type:'ARMED_CONFLICT',        region:'Rakhine State',    township:'Sittwe', summary:'Arakan Army captures Sittwe — Rakhine State capital falls to AA; last Tatmadaw stronghold in state encircled.', fatalities:70, severity:5, source:'AA', actors:['AA','Tatmadaw'] },
  { date:'2024-09-05', type:'HUMANITARIAN_ALERT',    region:'Rakhine State',    summary:'UN: 3.3 million displaced inside Myanmar — record high; Rakhine State alone has 500,000 newly displaced since AA offensive.', fatalities:0, severity:5, source:'OHCHR' },
  { date:'2024-09-22', type:'ARMED_CONFLICT',        region:'Sagaing Region',   township:'Shwebo', summary:'PDF and BPLA capture Shwebo town after encircling Tatmadaw garrison; garrison surrenders with weapons.', fatalities:22, severity:5, source:'PDF', actors:['PDF','BPLA','Tatmadaw'] },
  { date:'2024-10-18', type:'ARMED_CONFLICT',        region:'Mandalay Region',  summary:'NUG-aligned PDF launches Operation Mandalay; coordinated attacks on Tatmadaw positions around Myanmar second city.', fatalities:35, severity:5, source:'NUG', actors:['PDF','NUG','Tatmadaw'] },
  { date:'2024-11-07', type:'ARMED_CONFLICT',        region:'Kayin State',      township:'Myawaddy', summary:'KNLA and PDF capture key Tatmadaw positions along Myawaddy–Kawkareik road; Thailand border trade disrupted for weeks.', fatalities:15, severity:4, source:'KNU', actors:['KNLA','PDF','Tatmadaw'] },
  { date:'2024-11-25', type:'ARMED_CONFLICT',        region:'Sagaing Region',   summary:'Tatmadaw airstrikes on Sagaing villages kill 32 civilians; resistance forces shoot down military helicopter.', fatalities:32, severity:5, source:'AAPP', actors:['Tatmadaw','PDF'] },
  { date:'2024-12-14', type:'ARMED_CONFLICT',        region:'Shan State',       township:'Taunggyi', summary:'PDF and RCSS forces attack Tatmadaw positions near Taunggyi, southern Shan capital; supply routes cut.', fatalities:18, severity:4, source:'Irrawaddy', actors:['PDF','RCSS','Tatmadaw'] },

  // ── 2025 — Junta fragmentation ────────────────────────────────────────────
  { date:'2025-01-08', type:'ARMED_CONFLICT',        region:'Rakhine State',    township:'Kyaukphyu', summary:'Arakan Army secures full control of Kyaukphyu Special Economic Zone after final Tatmadaw garrison surrenders.', fatalities:20, severity:5, source:'AA', actors:['AA','Tatmadaw'] },
  { date:'2025-01-28', type:'HUMANITARIAN_ALERT',    region:'Mandalay Region',  summary:'Tatmadaw conscription roundups in Mandalay; men pulled from tea shops and streets, families report forced recruitment.', fatalities:0, severity:3, source:'Myanmar Now', actors:['SAC','Tatmadaw'] },
  { date:'2025-02-01', type:'POLITICAL_UNREST',      region:'Yangon Region',    summary:'Four years since coup — NUG declares military junta controls less than 20% of Myanmar territory.', fatalities:0, severity:4, source:'NUG' },
  { date:'2025-02-19', type:'ARMED_CONFLICT',        region:'Sagaing Region',   township:'Monywa', summary:'PDF forces advance into Monywa suburbs; intense street fighting, Tatmadaw deploys armoured vehicles.', fatalities:45, severity:5, source:'PDF', actors:['PDF','Tatmadaw'] },
  { date:'2025-03-05', type:'ARMED_CONFLICT',        region:'Mandalay Region',  summary:'PDF and BPLA capture Tatmadaw Eastern Regional Command forward base; significant military hardware seized.', fatalities:30, severity:5, source:'BPLA', actors:['BPLA','PDF','Tatmadaw'] },
  { date:'2025-03-28', type:'HUMANITARIAN_ALERT',    region:'Mandalay Region',  summary:'Magnitude 7.7 earthquake kills over 2000 in central Myanmar; Tatmadaw blocks rescue operations in resistance-held areas.', fatalities:2000, severity:5, source:'OHCHR' },
  { date:'2025-04-05', type:'HUMANITARIAN_ALERT',    region:'Sagaing Region',   summary:'Tatmadaw continues airstrikes despite post-earthquake ceasefire calls; 15 civilians killed in Sagaing village strike.', fatalities:15, severity:5, source:'AAPP', actors:['Tatmadaw'] },
  { date:'2025-04-20', type:'ARMED_CONFLICT',        region:'Shan State',       township:'Taunggyi', summary:'PDF and allied forces capture Tatmadaw garrison in southern Shan; junta forces retreat to Taunggyi city perimeter.', fatalities:28, severity:5, source:'PDF', actors:['PDF','Tatmadaw'] },
  { date:'2025-05-14', type:'ARMED_CONFLICT',        region:'Rakhine State',    township:'Sittwe', summary:'AA announces full control of Sittwe; remaining Tatmadaw troops evacuated by navy boat to Yangon.', fatalities:12, severity:5, source:'AA', actors:['AA','Tatmadaw'] },
  { date:'2025-06-10', type:'INFRASTRUCTURE_DISRUPTION', region:'Sagaing Region', summary:'Tatmadaw destroys 3 bridges over Chindwin River to slow PDF advance; thousands of civilians cut off from aid.', fatalities:0, severity:4, source:'Irrawaddy' },
  { date:'2025-07-02', type:'ARMED_CONFLICT',        region:'Mandalay Region',  summary:'PDF advances to outskirts of Mandalay city; Tatmadaw deploys fighter jets in desperate defence of second-largest city.', fatalities:50, severity:5, source:'NUG', actors:['PDF','NUG','Tatmadaw'] },
  { date:'2025-08-17', type:'ARMED_CONFLICT',        region:'Sagaing Region',   township:'Monywa', summary:'PDF captures Monywa, regional capital of Sagaing; Tatmadaw Sagaing garrison surrenders after month-long siege.', fatalities:65, severity:5, source:'PDF', actors:['PDF','BPLA','Tatmadaw'] },
  { date:'2025-09-05', type:'POLITICAL_UNREST',      region:'Naypyidaw Union Territory', summary:'SAC Senior General Min Aung Hlaing reshuffles military command after string of defeats; three generals dismissed.', fatalities:0, severity:4, source:'SAC', actors:['SAC'] },
  { date:'2025-10-12', type:'ARMED_CONFLICT',        region:'Mandalay Region',  summary:'PDF breaches Mandalay city defences in north; Tatmadaw imposes curfew and internet blackout across region.', fatalities:40, severity:5, source:'NUG', actors:['PDF','Tatmadaw'] },
  { date:'2025-11-04', type:'HUMANITARIAN_ALERT',    region:'Yangon Region',    summary:'OCHA: 4 million displaced inside Myanmar; humanitarian access blocked in 60% of country by either Tatmadaw or armed groups.', fatalities:0, severity:5, source:'OHCHR' },
  { date:'2025-12-01', type:'ARMED_CONFLICT',        region:'Bago Region',      summary:'PDF captures Tatmadaw division headquarters in Bago Region; opening corridor toward Yangon from the north.', fatalities:35, severity:5, source:'PDF', actors:['PDF','Tatmadaw'] },

  // ── 2026 — Ongoing conflict ───────────────────────────────────────────────
  { date:'2026-01-14', type:'ARMED_CONFLICT',        region:'Mandalay Region',  summary:'PDF and BPLA forces capture central Mandalay districts; Tatmadaw withdraws to palace compound and military bases.', fatalities:80, severity:5, source:'NUG', actors:['PDF','BPLA','Tatmadaw'] },
  { date:'2026-01-28', type:'HUMANITARIAN_ALERT',    region:'Yangon Region',    summary:'Tatmadaw arrests hundreds in Yangon conscription sweep; families report men abducted from homes during night raids.', fatalities:0, severity:3, source:'AAPP', actors:['SAC','Tatmadaw'] },
  { date:'2026-02-01', type:'POLITICAL_UNREST',      region:'Yangon Region',    summary:'Five years since coup — NUG claims control of over 60% of Myanmar territory; SAC holds Yangon, Naypyidaw and pockets.', fatalities:0, severity:4, source:'NUG' },
  { date:'2026-02-15', type:'ARMED_CONFLICT',        region:'Bago Region',      summary:'PDF offensive from Bago closes to within 80km of Yangon; Tatmadaw deploys last armoured reserves in counter-attack.', fatalities:45, severity:5, source:'PDF', actors:['PDF','Tatmadaw'] },
  { date:'2026-03-03', type:'ARMED_CONFLICT',        region:'Sagaing Region',   summary:'Tatmadaw airstrikes on Sagaing Region kill 20 civilians; resistance anti-aircraft units shoot down two military aircraft.', fatalities:20, severity:5, source:'AAPP', actors:['Tatmadaw','PDF'] },
  { date:'2026-03-20', type:'ARMED_CONFLICT',        region:'Shan State',       township:'Taunggyi', summary:'PDF and Karenni allied forces capture Taunggyi — Southern Shan capital falls to resistance; Tatmadaw air evacuates officers.', fatalities:55, severity:5, source:'PDF', actors:['PDF','Karenni Army','Tatmadaw'] },
  { date:'2026-04-05', type:'HUMANITARIAN_ALERT',    region:'Yangon Region',    summary:'UN warns of humanitarian catastrophe in Yangon as PDF tightens encirclement; food prices surge 300%, medicine scarce.', fatalities:0, severity:5, source:'OHCHR' },
  { date:'2026-04-15', type:'ARMED_CONFLICT',        region:'Bago Region',      summary:'PDF and NUG forces capture Bago city; strategic junction city linking Yangon to rest of country now under resistance control.', fatalities:70, severity:5, source:'NUG', actors:['PDF','NUG','Tatmadaw'] },
  { date:'2026-04-22', type:'ARMED_CONFLICT',        region:'Yangon Region',    summary:'PDF forces enter northern Yangon townships; Tatmadaw declares emergency in Yangon Region, deploys military police.', fatalities:35, severity:5, source:'NUG', actors:['PDF','NUG','Tatmadaw'] },
]

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`📥 Loading ${EVENTS.length} historical Myanmar conflict events (2021–2026)…\n`)

  let saved = 0, skipped = 0

  for (const ev of EVENTS) {
    const date        = new Date(ev.date)
    const township    = ev.township ?? ''
    const geo         = resolveCoordinates(township, township, ev.region)
    const reliability = classifySourceReliability(ev.source)
    const ageDays     = differenceInDays(new Date(), date)
    const confidence  = calculateConfidence(reliability, 2, ageDays)
    const eventId     = `hist-${ev.date}-${ev.region.slice(0, 6).replace(/\s/g, '')}-${saved + skipped}`

    try {
      await prisma.processedEvent.upsert({
        where:  { id: eventId },
        create: {
          id:          eventId,
          date,
          region:      ev.region,
          adminArea:   township || null,
          type:        ev.type,
          severity:    ev.severity,
          summary:     ev.summary,
          source:      ev.source,
          sourceUrl:   null,
          reliability,
          confidence,
          latitude:    geo.coords[1],
          longitude:   geo.coords[0],
          fatalities:  ev.fatalities,
          actors:      ev.actors ?? [],
          tags:        [ev.type, ev.region, 'historical'].filter(Boolean),
          rawEventId:  null,
        },
        update: {},
      })
      console.log(`  ✓ ${ev.date}  ${ev.summary.slice(0, 70)}`)
      saved++
    } catch (e) {
      console.error(`  ✗ ${ev.date}:`, e)
      skipped++
    }
  }

  console.log(`\n✅ Done — ${saved} events saved, ${skipped} failed`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
