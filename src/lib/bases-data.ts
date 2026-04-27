export type ThreatLevel = 'HIGH' | 'MEDIUM' | 'LOW'
export type BaseStatus  = 'ACTIVE' | 'CONTESTED' | 'UNKNOWN'
export type BaseType    = 'LIB' | 'COMMAND' | 'STRATEGIC' | 'LOGISTICS' | 'BGP'

export interface MilitaryBase {
  id:         number
  regimentMm: string      // Burmese script
  regimentEn: string      // e.g. "LIB 1"
  locationMm: string      // Burmese location
  locationEn: string      // English location
  region:     string
  lat:        number
  lng:        number
  type:       BaseType
  threat:     ThreatLevel
  status:     BaseStatus
}

export const BASES: MilitaryBase[] = [
  { id:1,  regimentMm:'ခလရ (၁)',  regimentEn:'LIB 1',  locationMm:'ပဲခူးတိုင်းဒေသကြီး၊ မင်းလှမြို့',              locationEn:'Minhlha, Bago Region',          region:'Bago Region',              lat:17.67, lng:96.15, type:'LIB', threat:'MEDIUM', status:'ACTIVE' },
  { id:2,  regimentMm:'ခလရ (၂)',  regimentEn:'LIB 2',  locationMm:'ကျိုက်ထိုမြို့',                                locationEn:'Kyaikhto, Mon State',           region:'Mon State',                lat:17.47, lng:97.02, type:'LIB', threat:'MEDIUM', status:'ACTIVE' },
  { id:3,  regimentMm:'ခလရ (၃)',  regimentEn:'LIB 3',  locationMm:'ရှမ်းပြည်နယ်၊ ကလောမြို့',                     locationEn:'Kalaw, Shan State',             region:'Shan State',               lat:20.63, lng:96.58, type:'LIB', threat:'HIGH',   status:'CONTESTED' },
  { id:4,  regimentMm:'ခလရ (၄)',  regimentEn:'LIB 4',  locationMm:'မန္တလေးတိုင်း၊ ပုသိမ်ကြီးမြို့',               locationEn:'Patheingyi, Mandalay Region',   region:'Mandalay Region',          lat:22.07, lng:96.22, type:'LIB', threat:'MEDIUM', status:'ACTIVE' },
  { id:5,  regimentMm:'ခလရ (၅)',  regimentEn:'LIB 5',  locationMm:'ပဲခူးတိုင်း၊ ဖြူးမြို့နယ်',                   locationEn:'Phyu, Bago Region',             region:'Bago Region',              lat:18.49, lng:96.43, type:'LIB', threat:'MEDIUM', status:'ACTIVE' },
  { id:6,  regimentMm:'ခလရ (၆)',  regimentEn:'LIB 6',  locationMm:'ရန်ကုန်၊ ရွှေပြည်သာမြို့နယ်',                  locationEn:'Shwepyithar, Yangon',           region:'Yangon Region',            lat:17.02, lng:96.07, type:'LIB', threat:'LOW',    status:'ACTIVE' },
  { id:7,  regimentMm:'ခလရ (၇)',  regimentEn:'LIB 7',  locationMm:'ရှမ်းပြည်နယ်(တောင်ပိုင်း)၊ ကလောမြို့',        locationEn:'Kalaw, Southern Shan',         region:'Shan State',               lat:20.61, lng:96.56, type:'LIB', threat:'HIGH',   status:'CONTESTED' },
  { id:8,  regimentMm:'ခလရ (၈)',  regimentEn:'LIB 8',  locationMm:'မွန်ပြည်နယ်၊ ဘီးလင်းမြို့',                   locationEn:'Bilin, Mon State',              region:'Mon State',                lat:17.23, lng:97.21, type:'LIB', threat:'MEDIUM', status:'ACTIVE' },
  { id:9,  regimentMm:'ခလရ (၉)',  regimentEn:'LIB 9',  locationMm:'အရှေ့အလယ်ပိုင်းတိုင်းစစ်ဌာနချုပ်နယ်မြေ',     locationEn:'Eastern Central Command AO',    region:'Mandalay Region',          lat:21.20, lng:96.50, type:'LIB', threat:'MEDIUM', status:'UNKNOWN' },
  { id:10, regimentMm:'ခလရ (၁၀)', regimentEn:'LIB 10', locationMm:'မကွေးတိုင်းဒေသကြီး၊ စကုမြို့',                locationEn:'Sagu, Magway Region',           region:'Magway Region',            lat:21.00, lng:95.10, type:'LIB', threat:'MEDIUM', status:'ACTIVE' },
  { id:11, regimentMm:'ခလရ (၁၁)', regimentEn:'LIB 11', locationMm:'ဧရာဝတီတိုင်း၊ ပုသိမ်မြို့နယ်',                locationEn:'Pathein, Ayeyarwady Region',    region:'Ayeyarwady Region',        lat:16.78, lng:94.73, type:'LIB', threat:'LOW',    status:'ACTIVE' },
  { id:12, regimentMm:'ခလရ (၁၂)', regimentEn:'LIB 12', locationMm:'ရှမ်းပြည်နယ်(တောင်ပိုင်း)၊ လွိုင်လင်မြို့',  locationEn:'Loilem, Southern Shan State',   region:'Shan State',               lat:20.28, lng:97.74, type:'LIB', threat:'HIGH',   status:'CONTESTED' },
  { id:13, regimentMm:'ခလရ (၁၃)', regimentEn:'LIB 13', locationMm:'မကွေးတိုင်းဒေသကြီး၊ ချောက်မြို့',            locationEn:'Chauk, Magway Region',          region:'Magway Region',            lat:20.89, lng:94.82, type:'LIB', threat:'MEDIUM', status:'ACTIVE' },
  { id:14, regimentMm:'ခလရ (၁၄)', regimentEn:'LIB 14', locationMm:'ပဲခူးတိုင်းဒေသကြီး၊ ပြည်မြို့',              locationEn:'Pyay, Bago Region',             region:'Bago Region',              lat:18.82, lng:95.23, type:'LIB', threat:'LOW',    status:'ACTIVE' },
  { id:15, regimentMm:'ခလရ (၁၅)', regimentEn:'LIB 15', locationMm:'ကချင်ပြည်နယ်၊ မိုးညှင်းမြို့',               locationEn:'Momauk, Kachin State',          region:'Kachin State',             lat:25.46, lng:96.65, type:'LIB', threat:'HIGH',   status:'CONTESTED' },
  { id:16, regimentMm:'ခလရ (၁၆)', regimentEn:'LIB 16', locationMm:'စစ်ကိုင်းတိုင်းဒေသကြီး၊ မုံရွာမြို့',        locationEn:'Monywa, Sagaing Region',        region:'Sagaing Region',           lat:22.11, lng:95.14, type:'LIB', threat:'HIGH',   status:'CONTESTED' },
  { id:17, regimentMm:'ခလရ (၁၇)', regimentEn:'LIB 17', locationMm:'ရှမ်းပြည်နယ်(မြောက်ပိုင်း)၊ သီပေါမြို့နယ်', locationEn:'Hsipaw Township, N.Shan State', region:'Shan State',               lat:22.62, lng:97.30, type:'LIB', threat:'HIGH',   status:'CONTESTED' },
  { id:18, regimentMm:'ခလရ (၁၈)', regimentEn:'LIB 18', locationMm:'ဧရာဝတီတိုင်း၊ ဟင်္သာတမြို့',                 locationEn:'Hinthada, Ayeyarwady Region',   region:'Ayeyarwady Region',        lat:17.65, lng:95.47, type:'LIB', threat:'LOW',    status:'ACTIVE' },
  { id:19, regimentMm:'ခလရ (၁၉)', regimentEn:'LIB 19', locationMm:'ကရင်ပြည်နယ်၊ ဖာပွန်မြို့',                   locationEn:'Papun, Kayin State',            region:'Kayin State',              lat:18.04, lng:97.45, type:'LIB', threat:'HIGH',   status:'CONTESTED' },
  { id:20, regimentMm:'ခလရ (၂၀)', regimentEn:'LIB 20', locationMm:'တနင်္သာရီတိုင်းဒေသကြီး၊ ခမောက်ကြီးမြို့',   locationEn:'Kamauk Gyi, Tanintharyi Region',region:'Tanintharyi Region',       lat:14.03, lng:98.21, type:'LIB', threat:'LOW',    status:'ACTIVE' },
  { id:21, regimentMm:'ခလရ (၂၁)', regimentEn:'LIB 21', locationMm:'ကချင်ပြည်နယ်၊ မြစ်ကြီးနားမြို့နယ်',          locationEn:'Myitkyina, Kachin State',       region:'Kachin State',             lat:25.38, lng:97.39, type:'LIB', threat:'HIGH',   status:'CONTESTED' },
  { id:22, regimentMm:'ခလရ (၂၂)', regimentEn:'LIB 22', locationMm:'ရှမ်းပြည်နယ်(မြောက်ပိုင်း)၊ မိုင်းရယ်မြို့နယ်',locationEn:'Muse Township, N.Shan State',  region:'Shan State',               lat:23.99, lng:97.64, type:'LIB', threat:'HIGH',   status:'CONTESTED' },
  { id:23, regimentMm:'ခလရ (၂၃)', regimentEn:'LIB 23', locationMm:'ရှမ်းပြည်နယ်(မြောက်ပိုင်း)၊ သီပေါမြို့',    locationEn:'Hsipaw, N.Shan State',          region:'Shan State',               lat:22.60, lng:97.29, type:'LIB', threat:'HIGH',   status:'CONTESTED' },
  { id:24, regimentMm:'ခလရ (၂၄)', regimentEn:'LIB 24', locationMm:'ရှမ်းပြည်နယ်(မြောက်ပိုင်း)၊ သီပေါမြို့နယ်', locationEn:'Hsipaw Township, N.Shan State', region:'Shan State',               lat:22.58, lng:97.27, type:'LIB', threat:'HIGH',   status:'CONTESTED' },
  { id:25, regimentMm:'ခလရ (၂၅)', regimentEn:'LIB 25', locationMm:'တနင်္သာရီတိုင်းဒေသကြီး၊ ထားဝယ်မြို့',        locationEn:'Dawei, Tanintharyi Region',     region:'Tanintharyi Region',       lat:14.09, lng:98.19, type:'LIB', threat:'LOW',    status:'ACTIVE' },
  { id:26, regimentMm:'ခလရ (၂၆)', regimentEn:'LIB 26', locationMm:'ပဲခူးတိုင်းဒေသကြီး၊ တောင်ငူမြို့',           locationEn:'Taungoo, Bago Region',          region:'Bago Region',              lat:18.93, lng:96.43, type:'LIB', threat:'MEDIUM', status:'ACTIVE' },
  { id:27, regimentMm:'ခလရ (၂၇)', regimentEn:'LIB 27', locationMm:'ဧရာဝတီတိုင်းဒေသကြီး၊ မအူပင်မြို့',           locationEn:'Maubin, Ayeyarwady Region',     region:'Ayeyarwady Region',        lat:16.73, lng:95.65, type:'LIB', threat:'LOW',    status:'ACTIVE' },
  { id:28, regimentMm:'ခလရ (၂၈)', regimentEn:'LIB 28', locationMm:'ကရင်ပြည်နယ်၊ လှိုင်းဘွဲမြို့',               locationEn:'Hlaingbwe, Kayin State',        region:'Kayin State',              lat:17.09, lng:97.86, type:'LIB', threat:'HIGH',   status:'CONTESTED' },
  { id:29, regimentMm:'ခလရ (၂၉)', regimentEn:'LIB 29', locationMm:'ကရင်ပြည်နယ် (လုံခြုံရေးထိန်းချုပ်မှုအောက်)', locationEn:'Kayin State (reported)',        region:'Kayin State',              lat:17.15, lng:97.55, type:'LIB', threat:'HIGH',   status:'UNKNOWN' },
  { id:30, regimentMm:'ခလရ (၃၀)', regimentEn:'LIB 30', locationMm:'ပဲခူးတိုင်း၊ ဒိုက်ဦးမြို့နယ်',               locationEn:'Daik-U, Bago Region',           region:'Bago Region',              lat:17.95, lng:96.73, type:'LIB', threat:'MEDIUM', status:'ACTIVE' },
  { id:31, regimentMm:'ခလရ (၃၁)', regimentEn:'LIB 31', locationMm:'မွန်ပြည်နယ်၊ ရေးမြို့နယ်၊ ခေါဇာမြို့',       locationEn:'Ye Township, Mon State',        region:'Mon State',                lat:15.25, lng:97.85, type:'LIB', threat:'MEDIUM', status:'ACTIVE' },
  { id:32, regimentMm:'ခလရ (၃၂)', regimentEn:'LIB 32', locationMm:'ကရင်ပြည်နယ်၊ ကြာအင်းဆိပ်ကြီးမြို့',          locationEn:'Kya In Seikgyi, Kayin State',   region:'Kayin State',              lat:16.55, lng:98.12, type:'LIB', threat:'HIGH',   status:'CONTESTED' },
  { id:33, regimentMm:'ခလရ (၃၃)', regimentEn:'LIB 33', locationMm:'ရှမ်းပြည်နယ်(မြောက်ပိုင်း)၊ တန့်ယန်းမြို့',  locationEn:'Tangyan, N.Shan State',         region:'Shan State',               lat:23.02, lng:98.51, type:'LIB', threat:'HIGH',   status:'CONTESTED' },
  { id:34, regimentMm:'ခလရ (၃၄)', regimentEn:'LIB 34', locationMm:'ရခိုင်ပြည်နယ်၊ ကျောက်ဖြူမြို့နယ်',            locationEn:'Kyaukphyu, Rakhine State',      region:'Rakhine State',            lat:19.44, lng:93.55, type:'LIB', threat:'HIGH',   status:'CONTESTED' },
  { id:35, regimentMm:'ခလရ (၃၅)', regimentEn:'LIB 35', locationMm:'ပဲခူးတိုင်းဒေသကြီး၊ သာယာဝတီမြို့',           locationEn:'Thayarwady, Bago Region',       region:'Bago Region',              lat:17.74, lng:95.69, type:'LIB', threat:'LOW',    status:'ACTIVE' },
  { id:36, regimentMm:'ခလရ (၃၆)', regimentEn:'LIB 36', locationMm:'ဧရာဝတီတိုင်း၊ ကျုံပျော်မြို့',               locationEn:'Kyonpyaw, Ayeyarwady Region',   region:'Ayeyarwady Region',        lat:17.12, lng:95.18, type:'LIB', threat:'LOW',    status:'ACTIVE' },
  { id:37, regimentMm:'ခလရ (၃၇)', regimentEn:'LIB 37', locationMm:'ကချင်ပြည်နယ်၊ ဝိုင်းမော်မြို့နယ်',            locationEn:'Waingmaw, Kachin State',        region:'Kachin State',             lat:25.36, lng:97.47, type:'LIB', threat:'HIGH',   status:'CONTESTED' },
  { id:38, regimentMm:'ခလရ (၃၈)', regimentEn:'LIB 38', locationMm:'ဧရာဝတီတိုင်းဒေသကြီး၊ ပုသိမ်မြို့နယ်',        locationEn:'Pathein Township, Ayeyarwady',  region:'Ayeyarwady Region',        lat:16.76, lng:94.71, type:'LIB', threat:'LOW',    status:'ACTIVE' },
  { id:39, regimentMm:'ခလရ (၃၉)', regimentEn:'LIB 39', locationMm:'ပဲခူးတိုင်း၊ တောင်ငူမြို့',                   locationEn:'Taungoo, Bago Region',          region:'Bago Region',              lat:18.95, lng:96.41, type:'LIB', threat:'MEDIUM', status:'ACTIVE' },
  { id:40, regimentMm:'ခလရ (၄၀)', regimentEn:'LIB 40', locationMm:'ကချင်ပြည်နယ်၊ ဟိုပင်မြို့',                  locationEn:'Hpakant, Kachin State',         region:'Kachin State',             lat:25.90, lng:95.96, type:'LIB', threat:'HIGH',   status:'CONTESTED' },
]

export const THREAT_COLORS: Record<ThreatLevel, string> = {
  HIGH:   '#ef4444',
  MEDIUM: '#f59e0b',
  LOW:    '#22c55e',
}

export const STATUS_LABELS: Record<BaseStatus, string> = {
  ACTIVE:    'Active',
  CONTESTED: 'Contested',
  UNKNOWN:   'Unknown',
}

export function baseStats(bases: MilitaryBase[]) {
  return {
    total:     bases.length,
    active:    bases.filter(b => b.status === 'ACTIVE').length,
    contested: bases.filter(b => b.status === 'CONTESTED').length,
    highThreat:bases.filter(b => b.threat === 'HIGH').length,
  }
}
