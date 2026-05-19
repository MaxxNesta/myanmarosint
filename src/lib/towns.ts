export interface Town {
  name_en:  string
  name_mm:  string
  lat:      number
  lng:      number
  region:   string
  aliases?: string[]
}

export const TOWNS: Town[] = [
  // Shan North / East
  { name_en: 'Lashio',       name_mm: 'လားရှိုး',         lat: 22.93, lng: 97.75, region: 'Shan State' },
  { name_en: 'Hsipaw',       name_mm: 'သီပေါ',            lat: 22.62, lng: 97.30, region: 'Shan State' },
  { name_en: 'Kyaukme',      name_mm: 'ကျောက်မဲ',         lat: 22.55, lng: 96.96, region: 'Shan State' },
  { name_en: 'Muse',         name_mm: 'မူဆယ်',            lat: 23.98, lng: 97.90, region: 'Shan State' },
  { name_en: 'Kutkai',       name_mm: 'ကွတ်ခိုင်',         lat: 23.19, lng: 97.33, region: 'Shan State' },
  { name_en: 'Laukkai',      name_mm: 'လောက်ကိုင်',        lat: 23.16, lng: 97.40, region: 'Shan State', aliases: ['kokang'] },
  { name_en: 'Namtu',        name_mm: 'နမ္မတူ',            lat: 23.08, lng: 97.40, region: 'Shan State' },
  { name_en: 'Mongkoe',      name_mm: 'မုံးကိုး',          lat: 23.36, lng: 98.52, region: 'Shan State' },
  { name_en: 'Naungcho',     name_mm: 'နောင်ချို',         lat: 22.31, lng: 96.80, region: 'Shan State' },
  { name_en: 'Kengtung',     name_mm: 'ကျိုင်းတုံ',        lat: 21.30, lng: 99.60, region: 'Shan State' },
  { name_en: 'Taunggyi',     name_mm: 'တောင်ကြီး',         lat: 20.79, lng: 97.04, region: 'Shan State' },
  { name_en: 'Loilen',       name_mm: 'လွိုင်လင်',          lat: 22.48, lng: 98.02, region: 'Shan State' },
  { name_en: 'Nawnghkio',    name_mm: 'နောင်ချို',          lat: 22.74, lng: 96.35, region: 'Shan State', aliases: ['naung kio', 'nawnghkio'] },
  { name_en: 'Taung Kham',   name_mm: 'တောင်ခမ်း',         lat: 22.15, lng: 96.85, region: 'Shan State' },
  { name_en: 'Mong Yai',     name_mm: 'မိုင်းရယ်',          lat: 23.09, lng: 97.54, region: 'Shan State' },

  // Kachin
  { name_en: 'Myitkyina',    name_mm: 'မြစ်ကြီးနား',       lat: 25.38, lng: 97.40, region: 'Kachin State' },
  { name_en: 'Bhamo',        name_mm: 'ဗန်းမော်',           lat: 24.27, lng: 97.25, region: 'Kachin State' },
  { name_en: 'Mogaung',      name_mm: 'မိုးကောင်း',         lat: 25.30, lng: 96.93, region: 'Kachin State' },
  { name_en: 'Mohnyin',      name_mm: 'မိုးညှင်း',          lat: 24.78, lng: 96.37, region: 'Kachin State' },
  { name_en: 'Hpakant',      name_mm: 'ဖားကန့်',            lat: 25.88, lng: 96.03, region: 'Kachin State' },
  { name_en: 'Tanai',        name_mm: 'တနိုင်း',            lat: 26.07, lng: 96.07, region: 'Kachin State' },
  { name_en: 'Laiza',        name_mm: 'လိုင်ဇာ',            lat: 25.03, lng: 97.67, region: 'Kachin State' },

  // Sagaing
  { name_en: 'Sagaing',      name_mm: 'စစ်ကိုင်း',          lat: 21.88, lng: 95.98, region: 'Sagaing Region' },
  { name_en: 'Monywa',       name_mm: 'မုံရွာ',             lat: 22.11, lng: 95.14, region: 'Sagaing Region' },
  { name_en: 'Shwebo',       name_mm: 'ရွှေဘို',            lat: 22.57, lng: 95.70, region: 'Sagaing Region' },
  { name_en: 'Kale',         name_mm: 'ကလေး',              lat: 23.19, lng: 94.05, region: 'Sagaing Region', aliases: ['kalay', 'kalemyo'] },
  { name_en: 'Tamu',         name_mm: 'တမူး',              lat: 24.23, lng: 94.30, region: 'Sagaing Region' },
  { name_en: 'Khin U',       name_mm: 'ခင်ဦး',             lat: 22.79, lng: 95.68, region: 'Sagaing Region' },
  { name_en: 'Yinmarbin',    name_mm: 'ရင်းမာပင်',          lat: 22.17, lng: 95.29, region: 'Sagaing Region' },
  { name_en: 'Kantbalu',     name_mm: 'ကန့်ဘလူ',           lat: 23.00, lng: 95.68, region: 'Sagaing Region', aliases: ['kanbalu'] },
  { name_en: 'Depayin',      name_mm: 'ဒီပဲယင်း',           lat: 22.53, lng: 95.43, region: 'Sagaing Region' },
  { name_en: 'Taze',         name_mm: 'တန့်ဆည်',           lat: 23.00, lng: 95.40, region: 'Sagaing Region' },
  { name_en: 'Pyinoolwin',   name_mm: 'ပြင်ဦးလွင်',         lat: 22.03, lng: 96.47, region: 'Mandalay Region', aliases: ['pyin oo lwin', 'maymyo'] },
  { name_en: 'Wetlet',       name_mm: 'ဝက်လက်',            lat: 22.64, lng: 95.53, region: 'Sagaing Region' },
  { name_en: 'Pale',         name_mm: 'ပဲလည်',             lat: 22.20, lng: 94.68, region: 'Sagaing Region' },

  // Mandalay
  { name_en: 'Mandalay',     name_mm: 'မန္တလေး',            lat: 21.98, lng: 96.08, region: 'Mandalay Region' },
  { name_en: 'Meiktila',     name_mm: 'မိတ္ထီလာ',           lat: 20.88, lng: 95.87, region: 'Mandalay Region' },
  { name_en: 'Thabeikkyin',  name_mm: 'သပိတ်ကျင်း',         lat: 22.88, lng: 95.98, region: 'Mandalay Region' },
  { name_en: 'Madaya',       name_mm: 'မတ္တရာ',             lat: 22.20, lng: 96.15, region: 'Mandalay Region', aliases: ['mattara'] },
  { name_en: 'Singu',        name_mm: 'ဆင်ကူး',             lat: 23.22, lng: 96.03, region: 'Mandalay Region' },

  // Magway
  { name_en: 'Magway',       name_mm: 'မကွေး',             lat: 20.14, lng: 94.92, region: 'Magway Region' },
  { name_en: 'Pakokku',      name_mm: 'ပခုက္ကူ',            lat: 21.33, lng: 95.10, region: 'Magway Region' },
  { name_en: 'Minbu',        name_mm: 'မင်းဘူး',            lat: 20.18, lng: 94.88, region: 'Magway Region' },
  { name_en: 'Gangaw',       name_mm: 'ဂန့်ဂေါ',            lat: 22.17, lng: 94.13, region: 'Magway Region' },
  { name_en: 'Tilin',        name_mm: 'တီးလင်း',            lat: 21.69, lng: 94.08, region: 'Magway Region' },

  // Rakhine
  { name_en: 'Sittwe',       name_mm: 'စစ်တွေ',             lat: 20.15, lng: 92.90, region: 'Rakhine State' },
  { name_en: 'Kyaukphyu',    name_mm: 'ကျောက်ဖြူ',          lat: 19.43, lng: 93.54, region: 'Rakhine State' },
  { name_en: 'Maungdaw',     name_mm: 'မောင်တော',           lat: 20.82, lng: 92.37, region: 'Rakhine State' },
  { name_en: 'Buthidaung',   name_mm: 'ဘူးသီးတောင်',        lat: 20.86, lng: 92.53, region: 'Rakhine State' },
  { name_en: 'Minbya',       name_mm: 'မင်းဘြာ',            lat: 20.36, lng: 93.26, region: 'Rakhine State' },
  { name_en: 'Ponnagyun',    name_mm: 'ပုဏ္ဏကျွန်း',         lat: 20.42, lng: 92.92, region: 'Rakhine State' },
  { name_en: 'Mrauk-U',      name_mm: 'မြောက်ဦး',           lat: 20.59, lng: 93.20, region: 'Rakhine State' },
  { name_en: 'Ann',          name_mm: 'အမ်း',              lat: 19.77, lng: 94.03, region: 'Rakhine State' },

  // Kayin (Karen)
  { name_en: 'Hpa-An',       name_mm: 'ဘားအံ',             lat: 16.89, lng: 97.63, region: 'Kayin State' },
  { name_en: 'Myawaddy',     name_mm: 'မြဝတီ',             lat: 16.68, lng: 98.51, region: 'Kayin State' },
  { name_en: 'Kawkareik',    name_mm: 'ကော်ကရိတ်',          lat: 16.54, lng: 98.24, region: 'Kayin State' },
  { name_en: 'Kyainseikgyi', name_mm: 'ကျိုင်းဆိပ်ကြီး',    lat: 16.09, lng: 98.46, region: 'Kayin State' },

  // Kayah
  { name_en: 'Loikaw',       name_mm: 'လွိုင်ကော်',          lat: 19.67, lng: 97.21, region: 'Kayah State' },
  { name_en: 'Demoso',       name_mm: 'ဒီမိုဆို',            lat: 19.48, lng: 97.27, region: 'Kayah State' },

  // Mon
  { name_en: 'Mawlamyine',   name_mm: 'မော်လမြိုင်',         lat: 16.49, lng: 97.63, region: 'Mon State', aliases: ['moulmein'] },
  { name_en: 'Thaton',       name_mm: 'သထုံ',              lat: 16.92, lng: 97.37, region: 'Mon State' },

  // Bago
  { name_en: 'Bago',         name_mm: 'ပဲခူး',             lat: 17.34, lng: 96.48, region: 'Bago Region' },
  { name_en: 'Taungoo',      name_mm: 'တောင်ငူ',            lat: 18.94, lng: 96.43, region: 'Bago Region' },
  { name_en: 'Pyay',         name_mm: 'ပြည်',              lat: 18.82, lng: 95.22, region: 'Bago Region' },

  // Yangon
  { name_en: 'Yangon',       name_mm: 'ရန်ကုန်',            lat: 16.87, lng: 96.20, region: 'Yangon Region' },

  // Ayeyarwady
  { name_en: 'Pathein',      name_mm: 'ပုသိမ်',             lat: 16.78, lng: 94.73, region: 'Ayeyarwady Region' },
  { name_en: 'Hinthada',     name_mm: 'ဟင်္သာတ',           lat: 17.65, lng: 95.46, region: 'Ayeyarwady Region' },

  // Tanintharyi
  { name_en: 'Dawei',        name_mm: 'ထားဝယ်',            lat: 14.08, lng: 98.20, region: 'Tanintharyi Region' },
  { name_en: 'Myeik',        name_mm: 'မြိတ်',             lat: 12.44, lng: 98.60, region: 'Tanintharyi Region', aliases: ['mergui'] },
  { name_en: 'Kawthaung',    name_mm: 'ကော့သောင်း',         lat: 10.05, lng: 98.56, region: 'Tanintharyi Region' },

  // Naypyidaw
  { name_en: 'Naypyidaw',    name_mm: 'နေပြည်တော်',         lat: 19.75, lng: 96.12, region: 'Naypyidaw Union Territory', aliases: ['nay pyi taw', 'naypytaw'] },

  // Chin
  { name_en: 'Hakha',        name_mm: 'ဟားခါး',             lat: 22.64, lng: 93.61, region: 'Chin State' },
  { name_en: 'Falam',        name_mm: 'ဖလမ်း',             lat: 22.91, lng: 93.67, region: 'Chin State' },
  { name_en: 'Mindat',       name_mm: 'မင်းတပ်',            lat: 21.36, lng: 93.97, region: 'Chin State' },
]

// ── Fast lookup helpers ───────────────────────────────────────────────────────

const _lower = (s: string) => s.toLowerCase().replace(/[-\s]+/g, '')

// Pre-built lookup maps for O(1) search
const BY_EN  = new Map<string, Town>()
const BY_MM  = new Map<string, Town>()
const BY_ALT = new Map<string, Town>()

for (const t of TOWNS) {
  BY_EN.set(_lower(t.name_en), t)
  BY_MM.set(t.name_mm.trim(), t)
  for (const a of t.aliases ?? []) BY_ALT.set(_lower(a), t)
}

/**
 * Finds a town by searching English name, Burmese name, and aliases.
 * Returns null if nothing matches.
 */
export function findTown(text: string): Town | null {
  if (!text) return null

  // Exact Burmese match first (fast)
  for (const [mm, town] of BY_MM) {
    if (text.includes(mm)) return town
  }

  // Normalized English / alias match
  const key = _lower(text)
  for (const [en, town] of BY_EN) {
    if (key.includes(en) || en.includes(key)) return town
  }
  for (const [alt, town] of BY_ALT) {
    if (key.includes(alt) || alt.includes(key)) return town
  }

  return null
}

/**
 * Scans a full article text and returns the FIRST matching town.
 */
export function findTownInText(text: string): Town | null {
  // Burmese scan — check each town name
  for (const [mm, town] of BY_MM) {
    if (text.includes(mm)) return town
  }

  const lower = text.toLowerCase()
  for (const [en, town] of BY_EN) {
    const idx = lower.indexOf(en)
    if (idx !== -1) return town
  }
  for (const [alt, town] of BY_ALT) {
    if (lower.includes(alt)) return town
  }

  return null
}
