export type ThreatLevel = 'HIGH' | 'MEDIUM' | 'LOW'
export type BaseStatus  = 'OPERATIONAL' | 'CONTESTED' | 'SEIZED_PDF' | 'SEIZED_EAO' | 'UNKNOWN'
export type BaseType    = 'LIB' | 'COMMAND' | 'STRATEGIC' | 'LOGISTICS' | 'BGP'

export interface MilitaryBase {
  id:         number
  regimentMm: string
  regimentEn: string
  locationMm: string
  locationEn: string
  region:     string
  lat:        number
  lng:        number
  type:       BaseType
  threat:     ThreatLevel
  status:     BaseStatus
}

// Status visual encoding
export const STATUS_COLORS: Record<BaseStatus, string> = {
  OPERATIONAL: '#22c55e',   // green
  CONTESTED:   '#eab308',   // yellow
  SEIZED_PDF:  '#ef4444',   // red   — People's Defence Force
  SEIZED_EAO:  '#f97316',   // orange — Ethnic Armed Organisations
  UNKNOWN:     '#6b7280',   // gray
}

export const STATUS_LABELS: Record<BaseStatus, string> = {
  OPERATIONAL: 'Operational',
  CONTESTED:   'Contested',
  SEIZED_PDF:  'Seized — PDF',
  SEIZED_EAO:  'Seized — EAO',
  UNKNOWN:     'Unknown',
}

export const THREAT_COLORS: Record<ThreatLevel, string> = {
  HIGH:   '#ef4444',
  MEDIUM: '#f59e0b',
  LOW:    '#22c55e',
}

export const BASES: MilitaryBase[] = [
  // ── Operational ─────────────────────────────────────────────────────────────
  { id:1,  regimentMm:'ခလရ (၁)',  regimentEn:'LIB 1',  locationMm:'ပဲခူးတိုင်းဒေသကြီး၊ မင်းလှမြို့',              locationEn:'Minhlha, Bago Region',          region:'Bago Region',              lat:17.67, lng:96.15, type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },
  { id:2,  regimentMm:'ခလရ (၂)',  regimentEn:'LIB 2',  locationMm:'ကျိုက်ထိုမြို့',                                locationEn:'Kyaikhto, Mon State',           region:'Mon State',                lat:17.47, lng:97.02, type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },
  { id:4,  regimentMm:'ခလရ (၄)',  regimentEn:'LIB 4',  locationMm:'မန္တလေးတိုင်း၊ ပုသိမ်ကြီးမြို့',               locationEn:'Patheingyi, Mandalay Region',   region:'Mandalay Region',          lat:22.0022184, lng:96.1799024, type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },
  { id:5,  regimentMm:'ခလရ (၅)',  regimentEn:'LIB 5',  locationMm:'ပဲခူးတိုင်း၊ ဖြူးမြို့နယ်',                   locationEn:'Phyu, Bago Region',             region:'Bago Region',              lat:18.49, lng:96.43, type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },
  { id:6,  regimentMm:'ခလရ (၆)',  regimentEn:'LIB 6',  locationMm:'ရန်ကုန်၊ ရွှေပြည်သာမြို့နယ်',                  locationEn:'Shwepyithar, Yangon',           region:'Yangon Region',            lat:17.0058120, lng:96.0834157, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:8,  regimentMm:'ခလရ (၈)',  regimentEn:'LIB 8',  locationMm:'မွန်ပြည်နယ်၊ ဘီးလင်းမြို့',                   locationEn:'Bilin, Mon State',              region:'Mon State',                lat:17.2115495, lng:97.2216275, type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },
  { id:10, regimentMm:'ခလရ (၁၀)', regimentEn:'LIB 10', locationMm:'မကွေးတိုင်းဒေသကြီး၊ စကုမြို့',                locationEn:'Sagu, Magway Region',           region:'Magway Region',            lat:20.2236585, lng:94.7894295, type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },
  { id:11, regimentMm:'ခလရ (၁၁)', regimentEn:'LIB 11', locationMm:'ဧရာဝတီတိုင်း၊ ပုသိမ်မြို့နယ်',                locationEn:'Pathein, Ayeyarwady Region',    region:'Ayeyarwady Region',        lat:16.78, lng:94.73, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:12, regimentMm:'ခလရ (၁၂)', regimentEn:'LIB 12', locationMm:'ရှမ်းပြည်နယ်(တောင်ပိုင်း)၊ လွိုင်လင်မြို့',  locationEn:'Loilem, Southern Shan State',   region:'Shan State',               lat:20.92498091235672, lng:97.56406045810037, type:'LIB', threat:'LOW',   status:'OPERATIONAL' },
  { id:13, regimentMm:'ခလရ (၁၃)', regimentEn:'LIB 13', locationMm:'မကွေးတိုင်းဒေသကြီး၊ ချောက်မြို့',            locationEn:'Chauk, Magway Region',          region:'Magway Region',            lat:20.8817773, lng:94.8079069, type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },
  { id:14, regimentMm:'ခလရ (၁၄)', regimentEn:'LIB 14', locationMm:'ပဲခူးတိုင်းဒေသကြီး၊ ပြည်မြို့',              locationEn:'Pyay, Bago Region',             region:'Bago Region',              lat:18.82, lng:95.23, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:16, regimentMm:'ခလရ (၁၆)', regimentEn:'LIB 16', locationMm:'စစ်ကိုင်းတိုင်းဒေသကြီး၊ မုံရွာမြို့',        locationEn:'Monywa, Sagaing Region',        region:'Sagaing Region',           lat:22.11, lng:95.14, type:'LIB', threat:'HIGH',   status:'OPERATIONAL' },
  { id:18, regimentMm:'ခလရ (၁၈)', regimentEn:'LIB 18', locationMm:'ဧရာဝတီတိုင်း၊ ဟင်္သာတမြို့',                 locationEn:'Hinthada, Ayeyarwady Region',   region:'Ayeyarwady Region',        lat:17.65, lng:95.47, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:20, regimentMm:'ခလရ (၂၀)', regimentEn:'LIB 20', locationMm:'တနင်္သာရီတိုင်းဒေသကြီး၊ ခမောက်ကြီးမြို့',   locationEn:'Kamauk Gyi, Tanintharyi',       region:'Tanintharyi Region',       lat:14.03, lng:98.21, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:25, regimentMm:'ခလရ (၂၅)', regimentEn:'LIB 25', locationMm:'တနင်္သာရီတိုင်းဒေသကြီး၊ ထားဝယ်မြို့',        locationEn:'Dawei, Tanintharyi Region',     region:'Tanintharyi Region',       lat:14.09, lng:98.19, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:26, regimentMm:'ခလရ (၂၆)', regimentEn:'LIB 26', locationMm:'ပဲခူးတိုင်းဒေသကြီး၊ တောင်ငူမြို့',           locationEn:'Taungoo, Bago Region',          region:'Bago Region',              lat:18.93, lng:96.43, type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },
  { id:27, regimentMm:'ခလရ (၂၇)', regimentEn:'LIB 27', locationMm:'ဧရာဝတီတိုင်းဒေသကြီး၊ မအူပင်မြို့',           locationEn:'Maubin, Ayeyarwady Region',     region:'Ayeyarwady Region',        lat:16.73, lng:95.65, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:30, regimentMm:'ခလရ (၃၀)', regimentEn:'LIB 30', locationMm:'ပဲခူးတိုင်း၊ ဒိုက်ဦးမြို့နယ်',               locationEn:'Daik-U, Bago Region',           region:'Bago Region',              lat:17.95, lng:96.73, type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },
  { id:31, regimentMm:'ခလရ (၃၁)', regimentEn:'LIB 31', locationMm:'မွန်ပြည်နယ်၊ ရေးမြို့နယ်',                   locationEn:'Ye Township, Mon State',        region:'Mon State',                lat:15.25, lng:97.85, type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },
  { id:35, regimentMm:'ခလရ (၃၅)', regimentEn:'LIB 35', locationMm:'ပဲခူးတိုင်းဒေသကြီး၊ သာယာဝတီမြို့',           locationEn:'Thayarwady, Bago Region',       region:'Bago Region',              lat:17.74, lng:95.69, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:36, regimentMm:'ခလရ (၃၆)', regimentEn:'LIB 36', locationMm:'ဧရာဝတီတိုင်း၊ ကျုံပျော်မြို့',               locationEn:'Kyonpyaw, Ayeyarwady Region',   region:'Ayeyarwady Region',        lat:17.12, lng:95.18, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:38, regimentMm:'ခလရ (၃၈)', regimentEn:'LIB 38', locationMm:'ဧရာဝတီတိုင်းဒေသကြီး၊ ပုသိမ်မြို့နယ်',        locationEn:'Pathein Township, Ayeyarwady',  region:'Ayeyarwady Region',        lat:16.76, lng:94.71, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:39, regimentMm:'ခလရ (၃၉)', regimentEn:'LIB 39', locationMm:'ပဲခူးတိုင်း၊ တောင်ငူမြို့',                   locationEn:'Taungoo, Bago Region',          region:'Bago Region',              lat:18.95, lng:96.41, type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },

  // ── Contested ────────────────────────────────────────────────────────────────
  { id:21, regimentMm:'ခလရ (၂၁)', regimentEn:'LIB 21', locationMm:'ကချင်ပြည်နယ်၊ မြစ်ကြီးနားမြို့နယ်',          locationEn:'Myitkyina, Kachin State',       region:'Kachin State',             lat:25.38, lng:97.39, type:'LIB', threat:'HIGH',   status:'CONTESTED' },
  { id:32, regimentMm:'ခလရ (၃၂)', regimentEn:'LIB 32', locationMm:'ကရင်ပြည်နယ်၊ ကြာအင်းဆိပ်ကြီးမြို့',          locationEn:'Kya In Seikgyi, Kayin State',   region:'Kayin State',              lat:16.55, lng:98.12, type:'LIB', threat:'HIGH',   status:'CONTESTED' },
 

  // ── Seized by EAO ────────────────────────────────────────────────────────────
  // TNLA / PSLF — Shan State
  { id:3,  regimentMm:'ခလရ (၃)',  regimentEn:'LIB 3',  locationMm:'ရှမ်းပြည်နယ်၊ ကလောမြို့',                     locationEn:'Kalaw, Shan State',             region:'Shan State',               lat:20.63, lng:96.58, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO' },
  { id:7,  regimentMm:'ခလရ (၇)',  regimentEn:'LIB 7',  locationMm:'ရှမ်းပြည်နယ်(တောင်ပိုင်း)၊ ကလောမြို့',        locationEn:'Kalaw, S.Shan State',           region:'Shan State',               lat:20.61, lng:96.56, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO' },
  { id:17, regimentMm:'ခလရ (၁၇)', regimentEn:'LIB 17', locationMm:'ရှမ်းပြည်နယ်(မြောက်ပိုင်း)၊ သီပေါမြို့နယ်', locationEn:'Hsipaw Township, N.Shan',       region:'Shan State',               lat:22.62, lng:97.30, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO' },
  { id:23, regimentMm:'ခလရ (၂၃)', regimentEn:'LIB 23', locationMm:'ရှမ်းပြည်နယ်(မြောက်ပိုင်း)၊ သီပေါမြို့',    locationEn:'Hsipaw, N.Shan State',          region:'Shan State',               lat:22.60, lng:97.29, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO' },
  { id:24, regimentMm:'ခလရ (၂၄)', regimentEn:'LIB 24', locationMm:'ရှမ်းပြည်နယ်(မြောက်ပိုင်း)၊ သီပေါမြို့နယ်', locationEn:'Hsipaw Township, N.Shan',       region:'Shan State',               lat:22.58, lng:97.27, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO' },
  { id:33, regimentMm:'ခလရ (၃၃)', regimentEn:'LIB 33', locationMm:'ရှမ်းပြည်နယ်(မြောက်ပိုင်း)၊ တန့်ယန်းမြို့',  locationEn:'Tangyan, N.Shan State',         region:'Shan State',               lat:23.02, lng:98.51, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO' },
  // MNDAA — Kokang / N.Shan
  { id:22, regimentMm:'ခလရ (၂၂)', regimentEn:'LIB 22', locationMm:'ရှမ်းပြည်နယ်(မြောက်ပိုင်း)၊ မိုင်းရယ်မြို့နယ်',locationEn:'Muse Township, N.Shan',         region:'Shan State',               lat:23.99, lng:97.64, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO' },
  // KIA — Kachin State
  { id:15, regimentMm:'ခလရ (၁၅)', regimentEn:'LIB 15', locationMm:'ကချင်ပြည်နယ်၊ မိုးညှင်းမြို့',               locationEn:'Momauk, Kachin State',          region:'Kachin State',             lat:25.46, lng:96.65, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO' },
  { id:37, regimentMm:'ခလရ (၃၇)', regimentEn:'LIB 37', locationMm:'ကချင်ပြည်နယ်၊ ဝိုင်းမော်မြို့နယ်',            locationEn:'Waingmaw, Kachin State',        region:'Kachin State',             lat:25.36, lng:97.47, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO' },
  { id:40, regimentMm:'ခလရ (၄၀)', regimentEn:'LIB 40', locationMm:'ကချင်ပြည်နယ်၊ ဟိုပင်မြို့',                  locationEn:'Hpakant, Kachin State',         region:'Kachin State',             lat:24.9873705, lng:96.5078813, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO' },
  // KNLA — Kayin State
  { id:19, regimentMm:'ခလရ (၁၉)', regimentEn:'LIB 19', locationMm:'ကရင်ပြည်နယ်၊ ဖာပွန်မြို့',                   locationEn:'Papun, Kayin State',            region:'Kayin State',              lat:18.048235578281876, lng:97.43934362772524, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO' },
  { id:28, regimentMm:'ခလရ (၂၈)', regimentEn:'LIB 28', locationMm:'ကရင်ပြည်နယ်၊ လှိုင်းဘွဲမြို့',               locationEn:'Hlaingbwe, Kayin State',        region:'Kayin State',              lat:17.09, lng:97.86, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO' },
  { id:29, regimentMm:'ခလရ (၂၉)', regimentEn:'LIB 29', locationMm:'ကရင်ပြည်နယ် (KNLA ထိန်းချုပ်)',               locationEn:'Kayin State (KNLA held)',       region:'Kayin State',              lat:17.15, lng:97.55, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO' },
  // AA — Rakhine State
  { id:34, regimentMm:'ခလရ (၃၄)', regimentEn:'LIB 34', locationMm:'ရခိုင်ပြည်နယ်၊ ကျောက်ဖြူမြို့နယ်',            locationEn:'Kyaukphyu, Rakhine State',      region:'Rakhine State',            lat:19.4286637, lng:93.5142758, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO' },

  
  { id:9,  regimentMm:'ခလရ (၉)',  regimentEn:'LIB 9',  locationMm:'ရှမ်းပြည်နယ်(အရှေ့ပိုင်း)၊ ခိုလမ်မြို့',       locationEn:'Kholam, Eastern Shan State',    region:'Shan State',          lat:21.09922581112035, lng:98.09246590813594, type:'LIB', threat:'MEDIUM', status:'OPERATIONAL'     },
  { id:66, regimentMm:'ခလရ (၆၆)', regimentEn:'LIB 66', locationMm:'နမ့်စန်မြို့နယ်၊ ခိုလမ်မြို့',                locationEn:'Kholan, Namsang, Shan State',   region:'Shan State',               lat:20.91486303852639, lng:97.70324133704442, type:'LIB', threat:'MEDIUM', status:'OPERATIONAL'     },

  // ── LIB 41–80 ────────────────────────────────────────────────────────────────
  // Operational
  { id:42, regimentMm:'ခလရ (၄၂)', regimentEn:'LIB 42', locationMm:'စစ်ကိုင်းတိုင်းဒေသကြီး၊ ရွှေဘိုမြို့',        locationEn:'Shwebo, Sagaing Region',        region:'Sagaing Region',           lat:22.57, lng:95.70, type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },
  { id:43, regimentMm:'ခလရ (၄၃)', regimentEn:'LIB 43', locationMm:'ရှမ်းပြည်နယ်(အရှေ့ပိုင်း)၊ မိုင်းပြင်းမြို့',  locationEn:'Mong Phyak, E.Shan State',      region:'Shan State',               lat:20.89180248346235, lng:99.91902088495135, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:44, regimentMm:'ခလရ (၄၄)', regimentEn:'LIB 44', locationMm:'မကွေးတိုင်း၊ သရက်မြို့',                       locationEn:'Salay, Magway Region',          region:'Magway Region',            lat:20.65, lng:95.01, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:46, regimentMm:'ခလရ (၄၆)', regimentEn:'LIB 46', locationMm:'ကချင်ပြည်နယ်၊ ပူတာအိုခရိုင်၊ ဆွမ်ပရာဘွမ်မြို့',locationEn:'Sumprabum, Putao, Kachin',      region:'Kachin State',             lat:26.5557811, lng:97.5668694, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:48, regimentMm:'ခလရ (၄၈)', regimentEn:'LIB 48', locationMm:'တနင်္သာရီတိုင်း၊ မြိတ်မြို့',                  locationEn:'Myeik, Tanintharyi',   region:'Tanintharyi Region',       lat:12.44, lng:98.60, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:49, regimentMm:'ခလရ (၄၉)', regimentEn:'LIB 49', locationMm:'ရှမ်းပြည်နယ်(အရှေ့ပိုင်း)၊ မိုင်းဆတ်မြို့',   locationEn:'Mong Hsat, E.Shan State',       region:'Shan State',               lat:20.51936235507661, lng:99.26364038002514, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:51, regimentMm:'ခလရ (၅၁)', regimentEn:'LIB 51', locationMm:'ဧရာဝတီတိုင်းဒေသကြီး၊ မြန်အောင်မြို့',          locationEn:'Myanaung, Ayeyarwady Region',   region:'Ayeyarwady Region',        lat:18.28, lng:95.33, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:50, regimentMm:'ခလရ (၅၀)', regimentEn:'LIB 50', locationMm:'မကွေးတိုင်း၊ ဂန့်ဂေါမြို့နယ်',                 locationEn:'Gangaw, Magway Region',         region:'Magway Region',            lat:22.17, lng:94.13, type:'LIB', threat:'HIGH',   status:'OPERATIONAL'  },
  { id:53, regimentMm:'ခလရ (၅၃)', regimentEn:'LIB 53', locationMm:'ပဲခူးတိုင်း၊ ပေါက်ခေါင်းမြို့နယ်',             locationEn:'Paukkaung, Bago Region',        region:'Bago Region',              lat:18.52, lng:95.69, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:57, regimentMm:'ခလရ (၅၇)', regimentEn:'LIB 57', locationMm:'ပဲခူးတိုင်း၊ ရွှေကျင်မြို့နယ်',                locationEn:'Shwekyin, Bago Region',         region:'Bago Region',              lat:17.83, lng:96.92, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:59, regimentMm:'ခလရ (၅၉)', regimentEn:'LIB 59', locationMm:'ပဲခူးမြို့နယ်၊ ဘောနက်ကြီးကျေးရွာ',             locationEn:'Bago Township (Bone Net Gyi)',  region:'Bago Region',              lat:17.36, lng:96.52, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:60, regimentMm:'ခလရ (၆၀)', regimentEn:'LIB 60', locationMm:'ပဲခူးတိုင်း၊ ကျောက်ကြီးမြို့နယ်၊ သံဘိုရွာ',   locationEn:'Kyaukgyi, Bago Region',         region:'Bago Region',              lat:18.20, lng:96.70, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:61, regimentMm:'ခလရ (၆၁)', regimentEn:'LIB 61', locationMm:'မွန်ပြည်နယ်၊ ရေးမြို့',                        locationEn:'Ye Town, Mon State',            region:'Mon State',                lat:15.27, lng:97.87, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:62, regimentMm:'ခလရ (၆၂)', regimentEn:'LIB 62', locationMm:'မွန်ပြည်နယ်၊ သံဖြူဇရပ်မြို့',                  locationEn:'Thanbyuzayat, Mon State',       region:'Mon State',                lat:15.97, lng:97.73, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:63, regimentMm:'ခလရ (၆၃)', regimentEn:'LIB 63', locationMm:'ဧရာဝတီတိုင်းဒေသကြီး၊ အိမ်မဲမြို့',             locationEn:'Hinthada Dist., Ayeyarwady',    region:'Ayeyarwady Region',        lat:16.58, lng:95.13, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:65, regimentMm:'ခလရ (၆၅)', regimentEn:'LIB 65', locationMm:'ရှမ်းပြည်နယ်(အရှေ့ပိုင်း)၊ မိုင်းတုံမြို့',   locationEn:'Mong Ton, E.Shan State',        region:'Shan State',               lat:20.30, lng:98.74, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:70, regimentMm:'ခလရ (၇၀)', regimentEn:'LIB 70', locationMm:'ရန်ကုန်တိုင်းဒေသကြီး၊ တွံတေးမြို့',            locationEn:'Twantay, Yangon Region',        region:'Yangon Region',            lat:16.77, lng:95.98, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:71, regimentMm:'ခလရ (၇၁)', regimentEn:'LIB 71', locationMm:'မကွေးတိုင်းဒေသကြီး၊ အောင်လံမြို့',             locationEn:'Aunglan, Magway Region',        region:'Magway Region',            lat:19.35, lng:95.22, type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },
  { id:73, regimentMm:'ခလရ (၇၃)', regimentEn:'LIB 73', locationMm:'ပဲခူးတိုင်း၊ ထန်းတပင်မြို့နယ်',               locationEn:'Htantabin Township, Bago',      region:'Bago Region',              lat:17.51, lng:96.21, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:75, regimentMm:'ခလရ (၇၅)', regimentEn:'LIB 75', locationMm:'ပဲခူးတိုင်း၊ ကျောက်ကြီးမြို့နယ်',             locationEn:'Kyaukgyi Township, Bago',       region:'Bago Region',              lat:18.15, lng:96.73, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:76, regimentMm:'ခလရ (၇၆)', regimentEn:'LIB 76', locationMm:'မန္တလေးတိုင်းဒေသကြီး၊ အုန်းချောမြို့နယ်',      locationEn:'Wundwin, Mandalay Region',      region:'Mandalay Region',          lat:21.8699301, lng:96.2403333, type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },
  { id:77, regimentMm:'ခလရ (၇၇)', regimentEn:'LIB 77', locationMm:'မကွေးတိုင်း၊ ရေနံချောင်းမြို့',                locationEn:'Yenangyaung, Magway Region',    region:'Magway Region',            lat:20.46, lng:94.88, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:78, regimentMm:'ခလရ (၇၈)', regimentEn:'LIB 78', locationMm:'မန္တလေးတိုင်း၊ ကျောက်ပန်းတောင်းမြို့နယ်',      locationEn:'Poppa, Kyaukpadaung, Mandalay', region:'Mandalay Region',          lat:20.87, lng:95.20, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:79, regimentMm:'ခလရ (၇၉)', regimentEn:'LIB 79', locationMm:'မန္တလေးတိုင်း၊ မိတ္ထီလာမြို့',                 locationEn:'Meiktila, Mandalay Region',     region:'Mandalay Region',          lat:20.88, lng:95.86, type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },
  { id:80, regimentMm:'ခလရ (၈၀)', regimentEn:'LIB 80', locationMm:'ပဲခူးတိုင်း၊ ပြည်ခရိုင်၊ အင်းမမြို့နယ်',       locationEn:'Inma, Pyay District, Bago',     region:'Bago Region',              lat:18.58, lng:95.39, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },

  // Contested
  { id:47, regimentMm:'ခလရ (၄၇)', regimentEn:'LIB 47', locationMm:'ကချင်ပြည်နယ်၊ ဗန်းမော်မြို့',                  locationEn:'Bhamo, Kachin State',           region:'Kachin State',             lat:24.27, lng:97.23, type:'LIB', threat:'HIGH',   status:'CONTESTED'   },
  { id:52, regimentMm:'ခလရ (၅၂)', regimentEn:'LIB 52', locationMm:'စစ်ကိုင်းတိုင်း၊ ခန္တီးခရိုင်၊ ခန္တီးမြို့',   locationEn:'Hkamti, Sagaing Region',        region:'Sagaing Region',           lat:25.9941407, lng:95.6763774, type:'LIB', threat:'HIGH',   status:'CONTESTED'   },
  { id:56, regimentMm:'ခလရ (၅၆)', regimentEn:'LIB 56', locationMm:'ကချင်ပြည်နယ်၊ ရွှေကူမြို့နယ်',                 locationEn:'Shwegu, Kachin State',          region:'Kachin State',             lat:24.24, lng:96.85, type:'LIB', threat:'HIGH',   status:'CONTESTED'   },
  { id:64, regimentMm:'ခလရ (၆၄)', regimentEn:'LIB 64', locationMm:'ရှမ်းပြည်နယ်၊ လွိုင်လင်ခရိုင်၊ လဲချားမြို့',  locationEn:'Lel Char, Loilen, Shan State',  region:'Shan State',               lat:21.27961639667563, lng:97.6600548110156, type:'LIB', threat:'HIGH',   status:'CONTESTED'   },
  { id:74, regimentMm:'ခလရ (၇၄)', regimentEn:'LIB 74', locationMm:'ကချင်ပြည်နယ်၊ မိုးကောင်းမြို့',               locationEn:'Mogaung, Kachin State',         region:'Kachin State',             lat:25.30, lng:96.93, type:'LIB', threat:'HIGH',   status:'CONTESTED'   },

 
  

  // Seized by EAO
  { id:41, regimentMm:'ခလရ (၄၁)', regimentEn:'LIB 41', locationMm:'ရှမ်းပြည်နယ်(မြောက်ပိုင်း)၊ လားရှိုးမြို့နယ်', locationEn:'Lashio Township, N.Shan',       region:'Shan State',               lat:22.9250177, lng:97.7247941, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO'  },
  { id:45, regimentMm:'ခလရ (၄၅)', regimentEn:'LIB 45', locationMm:'ရှမ်းပြည်နယ်(မြောက်ပိုင်း)၊ ကွတ်ခိုင်မြို့',  locationEn:'Kutkai, N.Shan State',          region:'Shan State',               lat:23.46, lng:97.73, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO'  },
  { id:54, regimentMm:'ခလရ (၅၄)', regimentEn:'LIB 54', locationMm:'ကယားပြည်နယ်၊ လွိုင်ကော်မြို့',                locationEn:'Loikaw, Kayah State',           region:'Kayah State',              lat:19.67, lng:97.21, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO'  },
  { id:55, regimentMm:'ခလရ (၅၅)', regimentEn:'LIB 55', locationMm:'ရခိုင်ပြည်နယ်၊ သံတွဲမြို့',                   locationEn:'Thandwe, Rakhine State',        region:'Rakhine State',            lat:18.46, lng:94.37, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO'  },
  { id:58, regimentMm:'ခလရ (၅၈)', regimentEn:'LIB 58', locationMm:'ကချင်ပြည်နယ်၊ ဝိုင်းမော်မြို့၊ မဒိန်ကျေးရွာ',  locationEn:'Madin Village, Waingmaw, Kachin',region:'Kachin State',             lat:25.35, lng:97.40, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO'  },
  { id:67, regimentMm:'ခလရ (၆၇)', regimentEn:'LIB 67', locationMm:'ရှမ်းပြည်နယ်(မြောက်ပိုင်း)၊ မိုင်းရယ်မြို့နယ်',locationEn:'Hoya Village, Muse, N.Shan',    region:'Shan State',               lat:23.88, lng:97.93, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO'  },
  { id:68, regimentMm:'ခလရ (၆၈)', regimentEn:'LIB 68', locationMm:'ရှမ်းပြည်နယ်(မြောက်ပိုင်း)၊ လားရှိုးမြို့ မြောက်ဘက်',locationEn:'North Lashio, N.Shan State',  region:'Shan State',               lat:23.05, lng:97.76, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO'  },
  { id:69,  regimentMm:'ခလရ (၆၉)',  regimentEn:'LIB 69',  locationMm:'ရှမ်းပြည်နယ်(မြောက်ပိုင်း)၊ လားရှိုးခရိုင်၊ သိန္နီမြို့', locationEn:'Hseni (Theinni), Lashio Dist., N.Shan', region:'Shan State', lat:23.27204321500635, lng:97.94398947847218, type:'LIB', threat:'HIGH', status:'SEIZED_EAO'  },
  { id:238, regimentMm:'ခလရ (၂၃၈)', regimentEn:'LIB 238', locationMm:'ကချင်ပြည်နယ်၊ တနိုင်းမြို့',                                            locationEn:'Tanai, Kachin State',                   region:'Kachin State', lat:26.3488884, lng:96.7250685, type:'LIB', threat:'HIGH', status:'UNKNOWN'     },
  { id:240, regimentMm:'ခလရ (၂၄၀)', regimentEn:'LIB 240', locationMm:'ရှမ်းပြည်နယ်(မြောက်ပိုင်း)၊ လားရှိုးခရိုင်၊ သိန္နီမြို့', locationEn:'Hseni (Theinni), Lashio Dist., N.Shan', region:'Shan State', lat:23.252952393012514, lng:97.92891128453286, type:'LIB', threat:'HIGH', status:'SEIZED_EAO'  },
  { id:72, regimentMm:'ခလရ (၇၂)', regimentEn:'LIB 72', locationMm:'ကယားပြည်နယ်၊ လောပိတမြို့',                    locationEn:'Lawpita, Kayah State',          region:'Kayah State',              lat:19.541332569326368, lng:97.3282338261299, type:'LIB', threat:'HIGH',   status:'SEIZED_EAO'  },

  // ── LIB 81–108 ───────────────────────────────────────────────────────────────

  // Operational
  { id:82,  regimentMm:'ခလရ (၈၂)',  regimentEn:'LIB 82',  locationMm:'ရန်ကုန်တိုင်း၊ မင်္ဂလာဒုံမြို့နယ်',                                locationEn:'Mingaladon, Yangon Region',          region:'Yangon Region',             lat:16.92, lng:96.13,          type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:84,  regimentMm:'ခလရ (၈၄)',  regimentEn:'LIB 84',  locationMm:'ပဲခူးတိုင်းဒေသကြီး၊ ရေတာရှည်မြို့နယ်၊ ဆွာမြို့',                 locationEn:'Zwa, Yedashe Twp, Bago Region',      region:'Bago Region',               lat:18.00, lng:96.68,          type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },
  { id:85,  regimentMm:'ခလရ (၈၅)',  regimentEn:'LIB 85',  locationMm:'နေပြည်တော်',                                                         locationEn:'Naypyidaw',                          region:'Naypyidaw Union Territory', lat:19.76, lng:96.12,          type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:91,  regimentMm:'ခလရ (၉၁)',  regimentEn:'LIB 91',  locationMm:'ရန်ကုန်တိုင်း၊ မှော်ဘီမြို့',                                      locationEn:'Hmawbi, Yangon Region',              region:'Yangon Region',             lat:17.10, lng:96.02,          type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:92,  regimentMm:'ခလရ (၉၂)',  regimentEn:'LIB 92',  locationMm:'ပဲခူးတိုင်း(အနောက်ခြမ်း)၊ ပန်းတောင်းမြို့နယ်၊ တောင်ဘွေရွာ',      locationEn:'Taungbwe, Pantanaw Twp, Bago (W)',   region:'Bago Region',               lat:17.00, lng:95.60,          type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },
  { id:95,  regimentMm:'ခလရ (၉၅)',  regimentEn:'LIB 95',  locationMm:'မန္တလေးမြို့',                                                       locationEn:'Mandalay',                           region:'Mandalay Region',           lat:22.0072807, lng:96.1117227, type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },
  { id:98,  regimentMm:'ခလရ (၉၈)',  regimentEn:'LIB 98',  locationMm:'ဧရာဝတီတိုင်း၊ ဖျာပုံမြို့',                                        locationEn:'Pyapon, Ayeyarwady Region',          region:'Ayeyarwady Region',         lat:16.28, lng:95.68,          type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },
  { id:101, regimentMm:'ခလရ (၁၀၁)', regimentEn:'LIB 101', locationMm:'တနင်္သာရီတိုင်း၊ မြိတ်မြို့',                                      locationEn:'Myeik (Mergui), Tanintharyi',         region:'Tanintharyi Region',        lat:12.4698496, lng:98.6553168, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:103, regimentMm:'ခလရ (၁၀၃)', regimentEn:'LIB 103', locationMm:'တနင်္သာရီတိုင်း၊ မြိတ်မြို့',                                      locationEn:'Myeik (Mergui), Tanintharyi',         region:'Tanintharyi Region',        lat:12.4677280, lng:98.6569050, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:106, regimentMm:'ခလရ (၁၀၆)', regimentEn:'LIB 106', locationMm:'မွန်ပြည်နယ်၊ ရေးမြို့နယ်',                                         locationEn:'Ye Township, Mon State',             region:'Mon State',                 lat:15.25, lng:97.85,          type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },
  { id:107, regimentMm:'ခလရ (၁၀၇)', regimentEn:'LIB 107', locationMm:'တနင်္သာရီတိုင်း၊ မြိတ်မြို့',                                      locationEn:'Myeik (Mergui), Tanintharyi',         region:'Tanintharyi Region',        lat:12.4625168, lng:98.6607362, type:'LIB', threat:'LOW',    status:'OPERATIONAL' },
  { id:108, regimentMm:'ခလရ (၁၀၈)', regimentEn:'LIB 108', locationMm:'ဧရာဝတီတိုင်းဒေသကြီး၊ ဓနုဖြူမြို့',                               locationEn:'Danubyu, Ayeyarwady Region',          region:'Ayeyarwady Region',         lat:17.25, lng:95.57,          type:'LIB', threat:'MEDIUM', status:'OPERATIONAL' },

  // Contested
  { id:81,  regimentMm:'ခလရ (၈၁)',  regimentEn:'LIB 81',  locationMm:'မွန်ပြည်နယ်၊ ကျိုက်မရောမြို့နယ်၊ ချောင်းနှစ်ခွကျေးရွာ',          locationEn:'Chaung Hnit Khwar, Kyaikmaraw, Mon', region:'Mon State',                 lat:16.45, lng:97.50,          type:'LIB', threat:'HIGH',   status:'CONTESTED'   },
  { id:83,  regimentMm:'ခလရ (၈၃)',  regimentEn:'LIB 83',  locationMm:'ကချင်ပြည်နယ်၊ ဗန်းမော်မြို့',                                      locationEn:'Bhamo (Banmaw), Kachin State',        region:'Kachin State',              lat:24.26, lng:97.24,          type:'LIB', threat:'HIGH',   status:'CONTESTED'   },
  { id:86,  regimentMm:'ခလရ (၈၆)',  regimentEn:'LIB 86',  locationMm:'ကချင်ပြည်နယ်၊ တနိုင်းမြို့နယ်',                                    locationEn:'Tanai Township, Kachin State',        region:'Kachin State',              lat:26.02, lng:96.14,          type:'LIB', threat:'HIGH',   status:'CONTESTED'   },
  { id:87,  regimentMm:'ခလရ (၈၇)',  regimentEn:'LIB 87',  locationMm:'စစ်ကိုင်းတိုင်းဒေသကြီး၊ ကလေးမြို့',                              locationEn:'Kalay (Kale), Sagaing Region',        region:'Sagaing Region',            lat:23.19, lng:94.03,          type:'LIB', threat:'HIGH',   status:'CONTESTED'   },
  { id:89,  regimentMm:'ခလရ (၈၉)',  regimentEn:'LIB 89',  locationMm:'စစ်ကိုင်းတိုင်းဒေသကြီး၊ ကလေးမြို့',                              locationEn:'Kalay (Kale), Sagaing Region',        region:'Sagaing Region',            lat:23.21, lng:94.05,          type:'LIB', threat:'HIGH',   status:'CONTESTED'   },
  { id:96,  regimentMm:'ခလရ (၉၆)',  regimentEn:'LIB 96',  locationMm:'မွန်ပြည်နယ်၊ ကျိုက်ထိုမြို့နယ်',                                   locationEn:'Kyaikhto Township, Mon State',        region:'Mon State',                 lat:17.3161850, lng:97.0223809, type:'LIB', threat:'HIGH',   status:'CONTESTED'   },
  { id:97,  regimentMm:'ခလရ (၉၇)',  regimentEn:'LIB 97',  locationMm:'ကရင်ပြည်နယ်၊ ကော့ကရိတ်မြို့',                                     locationEn:'Kawkareik, Kayin State',             region:'Kayin State',               lat:16.54, lng:98.24,          type:'LIB', threat:'HIGH',   status:'CONTESTED'   },
  { id:99,  regimentMm:'ခလရ (၉၉)',  regimentEn:'LIB 99',  locationMm:'ရှမ်းပြည်နယ်၊ လင်းခေးမြို့',                                       locationEn:'Linchan, Shan State',                region:'Shan State',                lat:20.3157052, lng:97.9764960, type:'LIB', threat:'HIGH',   status:'CONTESTED'   },
  { id:102, regimentMm:'ခလရ (၁၀၂)', regimentEn:'LIB 102', locationMm:'ကယားပြည်နယ်၊ ဒီးမော့ဆိုမြို့',                                     locationEn:'Demoso, Kayah State',                region:'Kayah State',               lat:19.5488422, lng:97.1876154, type:'LIB', threat:'HIGH',   status:'CONTESTED'   },
  { id:105, regimentMm:'ခလရ (၁၀၅)', regimentEn:'LIB 105', locationMm:'ကချင်ပြည်နယ်၊ မိုးကောင်းမြို့နယ်၊ ဆားမှော်ကျေးရွာ',             locationEn:'Sar Maw, Mogaung Twp, Kachin',       region:'Kachin State',              lat:25.25, lng:96.85,          type:'LIB', threat:'HIGH',   status:'CONTESTED'   },

  // Unknown
  { id:88,  regimentMm:'ခလရ (၈၈)',  regimentEn:'LIB 88',  locationMm:'မကွေးတိုင်း၊ မင်းဘူးမြို့နယ်၊ စကုမြို့',        locationEn:'Sagu, Minbu Twp, Magway Region',  region:'Magway Region',  lat:20.1863370, lng:94.8603079, type:'LIB', threat:'MEDIUM', status:'UNKNOWN' },
  { id:90,  regimentMm:'ခလရ (၉၀)',  regimentEn:'LIB 90',  locationMm:'ရန်ကုန်တိုင်း၊ သန်လျင်မြို့',                  locationEn:'Thanlyin, Yangon Region',         region:'Yangon Region',  lat:16.77, lng:96.25, type:'LIB', threat:'LOW',    status:'UNKNOWN' },
  { id:93,  regimentMm:'ခလရ (၉၃)',  regimentEn:'LIB 93',  locationMm:'ဧရာဝတီတိုင်း၊ မြောင်းမြမြို့',                  locationEn:'Myaungmya, Ayeyarwady Region',     region:'Ayeyarwady Region', lat:16.59, lng:94.93, type:'LIB', threat:'LOW',    status:'UNKNOWN' },
  { id:94,  regimentMm:'ခလရ (၉၄)',  regimentEn:'LIB 94',  locationMm:'ရှမ်းပြည်နယ်တောင်ပိုင်း၊ ညောင်ရွှေမြို့',       locationEn:'Nyaungshwe, Southern Shan State', region:'Shan State',     lat:20.63, lng:96.96, type:'LIB', threat:'MEDIUM', status:'UNKNOWN' },
  { id:104, regimentMm:'ခလရ (၁၀၄)', regimentEn:'LIB 104', locationMm:'တနင်္သာရီတိုင်း၊ လောင်းလုံးမြို့နယ်',           locationEn:'Launglon Township, Tanintharyi',  region:'Tanintharyi Region', lat:14.116595345228125, lng:98.14782970274186, type:'LIB', threat:'LOW', status:'UNKNOWN' },
]

export function baseStats(bases: MilitaryBase[]) {
  return {
    total:       bases.length,
    operational: bases.filter(b => b.status === 'OPERATIONAL').length,
    contested:   bases.filter(b => b.status === 'CONTESTED').length,
    seizedPdf:   bases.filter(b => b.status === 'SEIZED_PDF').length,
    seizedEao:   bases.filter(b => b.status === 'SEIZED_EAO').length,
    unknown:     bases.filter(b => b.status === 'UNKNOWN').length,
  }
}
