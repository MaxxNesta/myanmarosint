const ACTOR_ALIASES: Record<string, string> = {
  'tatmadaw':                                  'Tatmadaw',
  'myanmar military':                          'Tatmadaw',
  'myanmar army':                              'Tatmadaw',
  'sac':                                       'Tatmadaw',
  'state administration council':              'Tatmadaw',
  'junta':                                     'Tatmadaw',
  'regime':                                    'Tatmadaw',
  'myanmar air force':                         'Tatmadaw',
  'maf':                                       'Tatmadaw',
  'pdf':                                       "People's Defence Force",
  "people's defence force":                    "People's Defence Force",
  "people's defense force":                    "People's Defence Force",
  'peoples defence force':                     "People's Defence Force",
  'nug':                                       'National Unity Government',
  'national unity government':                 'National Unity Government',
  'tnla':                                      "Ta'ang National Liberation Army",
  "ta'ang national liberation army":           "Ta'ang National Liberation Army",
  'ta ang national liberation army':           "Ta'ang National Liberation Army",
  'mndaa':                                     'Myanmar National Democratic Alliance Army',
  'myanmar national democratic alliance army': 'Myanmar National Democratic Alliance Army',
  'kokang':                                    'Myanmar National Democratic Alliance Army',
  'aa':                                        'Arakan Army',
  'arakan army':                               'Arakan Army',
  'kia':                                       'Kachin Independence Army',
  'kachin independence army':                  'Kachin Independence Army',
  'kio':                                       'Kachin Independence Organisation',
  'kachin independence organisation':          'Kachin Independence Organisation',
  'knu':                                       'Karen National Union',
  'karen national union':                      'Karen National Union',
  'knla':                                      'Karen National Liberation Army',
  'karen national liberation army':            'Karen National Liberation Army',
  'kndo':                                      'Karen National Defence Organisation',
  'karen national defence organisation':       'Karen National Defence Organisation',
  'cnf':                                       'Chin National Front',
  'chin national front':                       'Chin National Front',
  'rcss':                                      'Restoration Council of Shan State',
  'ssa-s':                                     'Restoration Council of Shan State',
  'restoration council of shan state':         'Restoration Council of Shan State',
  'sspp':                                      'Shan State Progress Party',
  'ssa-n':                                     'Shan State Progress Party',
  'shan state progress party':                 'Shan State Progress Party',
  'uwsa':                                      'United Wa State Army',
  'united wa state army':                      'United Wa State Army',
  'ndaa':                                      'National Democratic Alliance Army',
  'national democratic alliance army':         'National Democratic Alliance Army',
  'dkba':                                      'Democratic Karen Benevolent Army',
  'democratic karen benevolent army':          'Democratic Karen Benevolent Army',
  'kpc':                                       'Karen Peace Council',
  'karen peace council':                       'Karen Peace Council',
  'pno':                                       "Pa-O National Organisation",
  "pa-o national organisation":                "Pa-O National Organisation",
  'pnlo':                                      "Pa-O National Liberation Organisation",
  'resistance':                                "People's Defence Force",
  'pro-democracy forces':                      "People's Defence Force",
  'opposition forces':                         "People's Defence Force",
  'local defence force':                       'Local Defence Force',
  'ldf':                                       'Local Defence Force',
}

export function normalizeActor(raw: string): string {
  const key = raw.trim().toLowerCase()
  if (ACTOR_ALIASES[key]) return ACTOR_ALIASES[key]
  // Partial match: check if any alias is a substring
  for (const [alias, canonical] of Object.entries(ACTOR_ALIASES)) {
    if (key.includes(alias) || alias.includes(key)) return canonical
  }
  return raw.trim()
}

export function normalizeActors(actors: string[]): string[] {
  return [...new Set(actors.map(normalizeActor).filter(Boolean))]
}

const REGION_ALIASES: Record<string, string> = {
  'sagaing':             'Sagaing Region',
  'rakhine':             'Rakhine State',
  'arakan':              'Rakhine State',
  'kachin':              'Kachin State',
  'shan':                'Shan State',
  'northern shan':       'Shan State',
  'southern shan':       'Shan State',
  'eastern shan':        'Shan State',
  'kayah':               'Kayah State',
  'karenni':             'Kayah State',
  'kayin':               'Kayin State',
  'karen':               'Kayin State',
  'chin':                'Chin State',
  'mon':                 'Mon State',
  'mandalay':            'Mandalay Region',
  'yangon':              'Yangon Region',
  'bago':                'Bago Region',
  'magway':              'Magway Region',
  'ayeyarwady':          'Ayeyarwady Region',
  'irrawaddy':           'Ayeyarwady Region',
  'naypyidaw':           'Naypyidaw Union Territory',
  'tanintharyi':         'Tanintharyi Region',
  'mergui':              'Tanintharyi Region',
}

export function normalizeRegion(raw: string): string {
  const key = raw.trim().toLowerCase()
  if (REGION_ALIASES[key]) return REGION_ALIASES[key]
  for (const [alias, canonical] of Object.entries(REGION_ALIASES)) {
    if (key.includes(alias)) return canonical
  }
  return raw.trim()
}
