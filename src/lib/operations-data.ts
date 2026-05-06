import type { Actor, ActorId, Campaign, TownControlEvent } from './operations-types'

export const ACTORS: Record<ActorId, Actor> = {
  MILITARY: { id: 'MILITARY', name: 'Tatmadaw / SAC',                              shortName: 'SAC',   color: '#6b7a2a', side: 'junta'      },
  TNLA:     { id: 'TNLA',     name: "Ta'ang National Liberation Army",              shortName: 'TNLA',  color: '#f97316', side: 'resistance' },
  MNDAA:    { id: 'MNDAA',    name: 'Myanmar National Democratic Alliance Army',    shortName: 'MNDAA', color: '#eab308', side: 'resistance' },
  AA:       { id: 'AA',       name: 'Arakan Army / ULA',                            shortName: 'AA',    color: '#06b6d4', side: 'resistance' },
  KIA:      { id: 'KIA',      name: 'Kachin Independence Army',                     shortName: 'KIA',   color: '#a855f7', side: 'resistance' },
  PDF_NUG:  { id: 'PDF_NUG',  name: "People's Defence Force / NUG",                shortName: 'PDF',   color: '#22c55e', side: 'resistance' },
  KNLA:     { id: 'KNLA',     name: 'Karen National Liberation Army',               shortName: 'KNLA',  color: '#10b981', side: 'resistance' },
  KNDO:     { id: 'KNDO',     name: 'Karen National Defence Organisation',          shortName: 'KNDO',  color: '#34d399', side: 'resistance' },
  CNF:      { id: 'CNF',      name: 'Chin National Front / Chin Brotherhood',       shortName: 'CNF',   color: '#f43f5e', side: 'resistance' },
  SSPP_SSA: { id: 'SSPP_SSA', name: 'Shan State Progress Party / SSA-North',       shortName: 'SSPP',  color: '#8b5cf6', side: 'resistance' },
  KNPP:     { id: 'KNPP',     name: 'Karenni National People\'s Party / KRF',       shortName: 'KNPP',  color: '#db2777', side: 'resistance' },
  UWSA:     { id: 'UWSA',     name: 'United Wa State Army',                         shortName: 'UWSA',  color: '#0369a1', side: 'resistance' },
  UNKNOWN:  { id: 'UNKNOWN',  name: 'Unknown / Unconfirmed',                        shortName: '?',     color: '#6b7280', side: 'resistance' },
}

// ── Campaigns ─────────────────────────────────────────────────────────────────
export const CAMPAIGNS: Campaign[] = []

// ── Town Control Events ────────────────────────────────────────────────────────
// townId = city name from myanmar-cities.json → lowercase, non-alphanumeric → hyphens
export const TOWN_CONTROL_EVENTS: TownControlEvent[] = [

  // ── Sagaing Region ────────────────────────────────────────────────────────
  { townId: 'shwepiyaye',  date: '2023-11-22', actor: 'PDF_NUG' },
  { townId: 'khampat',     date: '2023-11-07', actor: 'PDF_NUG' },
  { townId: 'maw-lu',     date: '2023-12-13', actor: 'PDF_NUG' }, // ABSDF + allied resistance
  { townId: 'pinlebu',     date: '2024-10-08', actor: 'PDF_NUG' },
  { townId: 'myothit',     date: '2024-05-11', actor: 'PDF_NUG' },

  // ── Chin State ────────────────────────────────────────────────────────────
  { townId: 'cikha',       date: '2024-05-19', actor: 'CNF' },
  { townId: 'rikhwardar',  date: '2023-11-13', actor: 'CNF' },
  { townId: 'surkhua',     date: '2023-11-30', actor: 'CNF' },
  { townId: 'lailempi',    date: '2024-07-11', actor: 'AA'  },
  { townId: 'samee',       date: '2024-01-16', actor: 'AA'  },
  { townId: 'tonzang',     date: '2024-05-21', actor: 'CNF' },
  { townId: 'waibula',     date: '2023-11-30', actor: 'CNF' },
  { townId: 'rezua',       date: '2023-11-29', actor: 'CNF' },
  { townId: 'm-kuiimnu',   date: '2021-07-24', actor: 'CNF' },
  { townId: 'kanpetlet',   date: '2024-12-22', actor: 'CNF' },
  { townId: 'mindat',      date: '2024-12-21', actor: 'CNF' },
  { townId: 'hanring',     date: '2023-11-30', actor: 'CNF' },
  { townId: 'matupi',      date: '2024-06-29', actor: 'CNF' },
  { townId: 'paletwa',     date: '2024-01-14', actor: 'AA'  },
  { townId: 'kyindwe',     date: '2024-04-29', actor: 'AA'  },

  // ── Karen State / Bago ────────────────────────────────────────────────────
  { townId: 'mone',        date: '2023-12-04', actor: 'KNLA' },
  { townId: 'lay-kay-kaw', date: '2024-10-17', actor: 'KNLA' },
  { townId: 'hpapun',      date: '2024-03-28', actor: 'KNLA' },
  { townId: 'kyaikdon',    date: '2024-03-14', actor: 'KNLA' },

  // ── Karenni / Kayah State ─────────────────────────────────────────────────
  { townId: 'moebye',       date: '2023-11-13', actor: 'KNPP'    },
  { townId: 'moebye',       date: '2025-07-07', actor: 'MILITARY', contested: true }, // disputed SAC reclaim
  { townId: 'nan-mei-khon', date: '2023-11-13', actor: 'KNPP' },
  { townId: 'ywar-thit',    date: '2024-01-28', actor: 'KNPP' },
  { townId: 'shadaw',       date: '2024-02-12', actor: 'KNPP' },
  { townId: 'mawchi',       date: '2024-01-28', actor: 'KNPP' },
  { townId: 'mese',         date: '2023-06-24', actor: 'KNPP' },

  // ── Kachin State ──────────────────────────────────────────────────────────
  { townId: 'sumprabum',    date: '2024-05-05', actor: 'KIA' },
  { townId: 'chiphwe',      date: '2024-09-29', actor: 'KIA' },
  { townId: 'chipwi',       date: '2024-09-29', actor: 'KIA' }, // MIMU: Chipwi
  { townId: 'sadon',        date: '2024-06-11', actor: 'KIA' },
  { townId: 'myohla',       date: '2024-02-22', actor: 'KIA' },
  { townId: 'kan-paik-ti',  date: '2024-11-20', actor: 'KIA' },
  { townId: 'tsawlaw',      date: '2024-10-02', actor: 'KIA' },
  { townId: 'sinbo',        date: '2024-02-10', actor: 'KIA' },
  { townId: 'momauk',       date: '2024-08-19', actor: 'KIA' },
  { townId: 'phimaw',       date: '2024-11-02', actor: 'KIA' },
  { townId: 'pang-war',     date: '2024-10-18', actor: 'KIA' },
  { townId: 'dawthponyean', date: '2024-03-08', actor: 'KIA' },
  { townId: 'lwegel',       date: '2024-03-29', actor: 'KIA' },
  { townId: 'mansi',        date: '2025-01-08', actor: 'KIA' },

  // ── Shan State (North) ────────────────────────────────────────────────────
  { townId: 'chinshwehaw',  date: '2023-11-02', actor: 'MNDAA' },
  { townId: 'hpawngsheng',  date: '2023-11-02', actor: 'MNDAA' },
  { townId: 'kyukoke',      date: '2023-11-02', actor: 'MNDAA' },
  { townId: 'theinni',      date: '2023-11-02', actor: 'MNDAA' },
  { townId: 'monekoe',      date: '2023-11-07', actor: 'MNDAA' },
  { townId: 'kunlong',      date: '2023-11-12', actor: 'MNDAA' },
  { townId: 'manhsan',      date: '2023-12-15', actor: 'TNLA'  },
  { townId: 'namhsan',      date: '2023-12-15', actor: 'TNLA'  }, // MIMU: Namhsan
  { townId: 'namkham',      date: '2023-12-18', actor: 'TNLA'  },
  { townId: 'namhkan',      date: '2023-12-18', actor: 'TNLA'  }, // MIMU: Namhkan
  { townId: 'mantong',      date: '2023-12-22', actor: 'TNLA'  },
  { townId: 'manton',       date: '2023-12-22', actor: 'TNLA'  }, // MIMU: Manton
  { townId: 'hopang',       date: '2024-01-10', actor: 'UWSA'  }, // 3BA seized 5 Jan, handed to UWSA 10 Jan
  { townId: 'panglong',     date: '2024-01-10', actor: 'UWSA'  }, // same handover
  { townId: 'kongeyan',     date: '2023-11-28', actor: 'MNDAA' },
  { townId: 'konkyan',      date: '2023-11-28', actor: 'MNDAA' }, // MIMU: Konkyan
  { townId: 'monglon',      date: '2023-12-05', actor: 'TNLA'  },
  { townId: 'kutkai',       date: '2024-01-07', actor: 'MNDAA' },
  { townId: 'mahein',       date: '2024-01-21', actor: 'KIA'   },
  { townId: 'mabein',       date: '2024-01-21', actor: 'KIA'   }, // MIMU: Mabein
  { townId: 'nawnghkio',    date: '2024-06-26', actor: 'TNLA'  },
  { townId: 'mongmit',      date: '2024-07-16', actor: 'TNLA'  },
  { townId: 'lashio',       date: '2024-07-25', actor: 'MNDAA' },
  { townId: 'kyaukme',      date: '2024-08-06', actor: 'TNLA'  },
  { townId: 'naungcho',     date: '2024-08-19', actor: 'TNLA'  },
  { townId: 'nyaphu',       date: '2024-08-12', actor: 'UNKNOWN'},

  // ── Mandalay Region ───────────────────────────────────────────────────────
  { townId: 'tagauging',    date: '2024-08-12', actor: 'PDF_NUG' },
  { townId: 'mogok',        date: '2024-07-24', actor: 'TNLA'    },
  { townId: 'mogoke',       date: '2024-07-24', actor: 'TNLA'    }, // MIMU: Mogoke
  { townId: 'thabeikkyin',  date: '2024-08-25', actor: 'PDF_NUG' },
  { townId: 'singu',        date: '2024-07-17', actor: 'PDF_NUG' },

  // ── Arakan / Rakhine State ────────────────────────────────────────────────
  { townId: 'kanhtaunggyi', date: '2024-02-15', actor: 'AA' },
  { townId: 'thandwe',      date: '2024-07-16', actor: 'AA' },
  { townId: 'ann',          date: '2024-12-20', actor: 'AA' },
  { townId: 'ramree',       date: '2024-03-11', actor: 'AA' },
  { townId: 'maungdaw',     date: '2024-12-08', actor: 'AA' },
  { townId: 'gwa',          date: '2024-12-29', actor: 'AA' },
  { townId: 'taungup',      date: '2024-11-24', actor: 'AA' },
  { townId: 'toungup',      date: '2024-11-24', actor: 'AA' }, // MIMU slug alias
  { townId: 'buthidaung',   date: '2024-05-18', actor: 'AA' },
  { townId: 'kha-maung-seik', date: '2024-12-08', actor: 'AA' },
  { townId: 'kyauktaw',     date: '2024-02-07', actor: 'AA' }, // MIMU: Kyauktaw
  { townId: 'minbya',       date: '2024-02-06', actor: 'AA' },
  { townId: 'myin-hlut',    date: '2024-12-08', actor: 'AA' },
  { townId: 'rathedaung',   date: '2024-03-17', actor: 'AA' },
  { townId: 'myebon',       date: '2024-02-15', actor: 'AA' },
  { townId: 'tat-taung',    date: '2024-12-20', actor: 'AA' },
  { townId: 'pauktaw',      date: '2024-01-24', actor: 'AA' },
  { townId: 'sane',         date: '2024-05-09', actor: 'AA' },
  { townId: 'tan-lwe-ywar-ma', date: '2024-11-24', actor: 'AA' },
  { townId: 'taungpyo',     date: '2024-02-06', actor: 'AA' },
  { townId: 'mrauk-u',      date: '2024-02-08', actor: 'AA' },
  { townId: 'ponnagyun',    date: '2024-03-04', actor: 'AA' }, // MIMU: Ponnagyun
  { townId: 'maei',         date: '2024-02-16', actor: 'AA' },
  { townId: 'kyeintali',    date: '2024-08-14', actor: 'AA' },

  // ── New towns — initial resistance captures (estimated dates) ─────────────
  { townId: 'hsipaw',       date: '2024-09-15', actor: 'TNLA'    }, // after Kyaukme fell Aug 6
  { townId: 'banmauk',      date: '2024-03-01', actor: 'KIA'     }, // KIA + PDF Sagaing push
  { townId: 'falam',        date: '2024-07-01', actor: 'CNF'     }, // Chin Brotherhood advance
  { townId: 'hpasawng',     date: '2024-03-01', actor: 'KNPP'    }, // Karenni Kayah push
  { townId: 'tigyaing',     date: '2024-06-01', actor: 'PDF_NUG' }, // Sagaing PDF
  { townId: 'indaw',        date: '2025-04-08', actor: 'PDF_NUG' }, // Sagaing PDF
  { townId: 'madaya',       date: '2024-11-01', actor: 'PDF_NUG' }, // Mandalay PDF advance
  { townId: 'kawlin',       date: '2023-12-01', actor: 'PDF_NUG' }, // Sagaing PDF

  // ── SAC / Military recaptures 2025–2026 ───────────────────────────────────
  { townId: 'lashio',       date: '2025-04-22', actor: 'MILITARY' },
  { townId: 'nawnghkio',    date: '2025-07-16', actor: 'MILITARY' },
  { townId: 'kyaukme',      date: '2025-09-30', actor: 'MILITARY' },
  { townId: 'hsipaw',       date: '2025-10-16', actor: 'MILITARY' },
  { townId: 'mogok',        date: '2025-11-30', actor: 'MILITARY' }, // agreed TNLA withdrawal
  { townId: 'mogoke',       date: '2025-11-30', actor: 'MILITARY' }, // MIMU alias
  { townId: 'mongmit',      date: '2025-11-30', actor: 'MILITARY' }, // agreed TNLA withdrawal
  { townId: 'madaya',       date: '2025-12-31', actor: 'MILITARY' },
  { townId: 'singu',        date: '2025-12-31', actor: 'MILITARY' },
  { townId: 'thabeikkyin',  date: '2025-12-31', actor: 'MILITARY' },
  { townId: 'banmauk',      date: '2026-02-06', actor: 'MILITARY' },
  { townId: 'hpasawng',     date: '2026-02-15', actor: 'MILITARY', contested: true }, // disputed
  { townId: 'tagauging',    date: '2026-03-12', actor: 'MILITARY' }, // Tagaung / Tagauging
  { townId: 'tigyaing',     date: '2026-03-25', actor: 'MILITARY' },
  { townId: 'kawlin',       date: '2026-01-31', actor: 'MILITARY' },
  { townId: 'falam',        date: '2026-04-25', actor: 'MILITARY' },
  { townId: 'indaw',        date: '2026-04-30', actor: 'MILITARY' },
  { townId: 'maw-lu',     date: '2026-05-05', actor: 'MILITARY' }, // SAC recapture
]
