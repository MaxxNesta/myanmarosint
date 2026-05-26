export type CoordPrecision = 'exact' | 'township' | 'district' | 'region'

export interface GeoResult {
  coords:    [number, number]  // [lng, lat]
  precision: CoordPrecision
  region?:   string            // authoritative region name derived from township lookup
}

// Myanmar township centroids — covers the primary conflict zones
// Format: lowercase normalized name → [longitude, latitude]
const TOWNSHIP_COORDS: Record<string, [number, number]> = {
  // Kachin State
  'myitkyina':           [97.3963, 25.3791],
  'bhamo':               [97.2376, 24.2623],
  'hpakant':             [96.0333, 25.8833],
  'mogaung':             [96.9333, 25.3000],
  'putao':               [97.4000, 27.3333],
  'tanai':               [96.0667, 26.0167],
  'waingmaw':            [97.4500, 25.4000],
  'chipwi':              [97.9167, 26.1333],
  'mansi':               [97.0333, 24.7500],
  'momauk':              [97.2667, 24.3333],
  'laiza':               [97.6667, 25.0333],
  'pansai':              [98.7000, 23.5167],

  // Sagaing Region (major conflict zone)
  'shwebo':              [95.7000, 22.5667],
  'monywa':              [95.1333, 22.1167],
  'kale':                [94.0167, 23.1833],
  'kalay':               [94.0167, 23.1833],
  'tamu':                [94.3000, 24.2167],
  'ye-u':                [95.4500, 22.8333],
  'yeu':                 [95.4500, 22.8333],
  'indaw':               [96.1000, 24.1500],
  'kanbalu':             [95.5167, 23.2000],
  'kawlin':              [95.6833, 23.7833],
  'wuntho':              [95.6667, 23.9333],
  'pinlebu':             [95.4667, 24.0833],
  'banmauk':             [95.8667, 24.4333],
  'tigyaing':            [95.9500, 23.7000],
  'sagaing':             [95.9833, 21.8833],
  'myaung':              [95.3000, 22.0167],
  'pale':                [94.7000, 22.9667],
  'mingin':              [94.4000, 22.6167],
  'chaung-u':            [95.1667, 22.0000],
  'mawlaik':             [94.4167, 23.6333],
  'homlin':              [94.9000, 24.8667],
  'hkamti':              [95.6833, 26.0000],
  'nanyun':              [95.7000, 25.5500],
  'khampat':             [94.2500, 23.5833],
  'kalewa':              [94.3000, 23.2000],
  'gangaw':              [94.1333, 22.1667],
  'kyunhla':             [95.2000, 22.8500],
  'wetlet':              [95.5000, 22.2333],
  'ayadaw':              [95.2667, 22.5500],
  'budalin':             [95.1667, 22.3833],
  'yinmarbin':           [95.2500, 22.1500],
  'rhamo':               [95.7333, 22.4333],
  'taze':                [95.4333, 23.0167],
  'depayin':             [95.4167, 22.9167],

  // Magway Region
  'magway':              [94.9333, 20.1500],
  'minbu':               [94.8833, 20.1833],
  'pakokku':             [95.0833, 21.3333],
  'tilin':               [94.1000, 21.7000],
  'htilin':              [94.1000, 21.7000],
  'saw':                 [94.5667, 21.0667],
  'sidoktaya':           [95.0500, 20.5000],
  'myaing':              [95.1333, 21.6000],
  'pauk':                [94.4667, 21.4333],
  'seikphyu':            [94.4833, 22.6333],
  'yesagyo':             [95.0333, 21.6167],
  'natmauk':             [95.4167, 20.4333],
  'taungdwingyi':        [95.5500, 20.0167],
  'myothit':             [95.7167, 19.9500],
  'pwintbyu':            [94.7000, 19.7833],
  'sinbaungwe':          [95.1667, 19.7333],
  'aunglan':             [95.2167, 19.3833],
  'kamma':               [94.8667, 22.3500],

  // Mandalay Region
  'mandalay':            [96.0891, 21.9588],
  'pyin oo lwin':        [96.4667, 22.0333],
  'kyaukse':             [96.1333, 21.6000],
  'meiktila':            [95.8667, 20.8833],
  'myingyan':            [95.3833, 21.4500],
  'natogyi':             [95.6000, 21.4000],
  'ngazun':              [95.7667, 21.7167],
  'taungtha':            [95.3500, 20.9333],
  'mahlaing':            [95.7000, 20.8500],
  'pyigyitagon':         [96.1167, 21.8667],
  'amarapura':           [96.0500, 21.9000],
  'patheingyi':          [96.0333, 22.0167],
  'sintgaing':           [96.2000, 21.6667],
  'myittha':             [95.5333, 21.3333],
  'wundwin':             [95.9833, 20.7000],

  // Chin State
  'hakha':               [93.6000, 22.6500],
  'falam':               [93.6667, 23.0000],
  'tedim':               [93.9833, 23.3667],
  'mindat':              [93.9667, 21.3667],
  'paletwa':             [92.9667, 21.6333],
  'thantlang':           [93.7833, 23.2833],
  'matupi':              [94.2833, 23.0167],
  'kanpetlet':           [93.9667, 21.1833],
  'rezua':               [92.8667, 22.0833],
  'tongzang':            [93.6667, 23.4833],
  'tiddim':              [93.9833, 23.3667],

  // Karen/Kayin State
  'hpa-an':              [97.6334, 16.8898],
  'pa-an':               [97.6334, 16.8898],
  'myawaddy':            [98.4997, 16.6899],
  'kawkareik':           [98.2333, 16.5333],
  'kyainseikgyi':        [98.0667, 16.1500],
  'hlaingbwe':           [97.9333, 17.0500],
  'thandaunggyi':        [97.5167, 18.3833],
  'pharpon':             [97.7500, 16.6167],
  'bilin':               [97.2167, 17.2333],
  'three pagodas pass':  [98.4500, 15.2833],
  'kyaukkyi':            [97.0833, 18.4000],
  'shwegyin':            [96.9333, 17.9333],

  // Kayah/Karenni State
  'loikaw':              [97.2103, 19.6739],
  'demoso':              [97.2500, 19.3000],
  'hpruso':              [97.3333, 19.7333],
  'bawlakhe':            [97.3333, 19.1333],
  'mese':                [98.3333, 19.5833],
  'shadaw':              [97.4167, 19.9000],
  'kholam':              [97.7333, 19.4167],
  'hpasawng':            [97.4667, 19.1167],

  // Mon State
  'mawlamyine':          [97.6280, 16.4913],
  'moulmein':            [97.6280, 16.4913],
  'thaton':              [97.3692, 16.9231],
  'ye':                  [97.8572, 15.2545],
  'kyaikto':             [97.0167, 17.3167],
  'thanbyuzayat':        [98.1833, 15.9667],
  'kyaikmaraw':          [97.7333, 16.4667],
  'mudon':               [97.7167, 16.2500],
  'chaungzon':           [97.6667, 16.2833],

  // Rakhine/Arakan State
  'sittwe':              [92.8990, 20.1430],
  'buthidaung':          [92.5333, 20.8667],
  'maungdaw':            [92.3667, 20.8167],
  'kyauktaw':            [92.9833, 20.8333],
  'mrauk-u':             [93.2000, 20.5833],
  'rathedaung':          [92.7667, 20.6000],
  'myebon':              [93.3667, 19.9833],
  'minbya':              [93.2667, 20.3667],
  'pauktaw':             [92.9667, 20.1667],
  'toungup':             [94.2333, 18.8000],
  'gwa':                 [94.5833, 17.6000],
  'thandwe':             [94.3666, 18.4566],
  'an':                  [94.0167, 19.7667],
  'kyaukphyu':           [93.5500, 19.4500],
  'ramree':              [93.8000, 19.1167],
  'taungup':             [94.2333, 18.8000],
  'ponnagyun':           [92.9500, 20.3333],
  'yanbye':              [93.4500, 19.5000],
  'munaung':             [93.7500, 18.8833],

  // Shan State
  'taunggyi':            [97.0333, 20.7833],
  'lashio':              [97.7528, 22.9333],
  'kengtung':            [99.6000, 21.2833],
  'hsipaw':              [97.3000, 22.6167],
  'namhkam':             [97.7833, 23.8333],
  'muse':                [97.9833, 23.9833],
  'kyaukme':             [97.0167, 22.5333],
  'mongmit':             [96.5167, 23.1000],
  'mogok':               [96.5000, 22.9167],
  'namtu':               [97.4167, 23.0833],
  'kutkai':              [98.0500, 23.4667],
  'loilen':              [98.2833, 21.3833],
  'hopang':              [99.3167, 23.3500],
  'panglong':            [97.3167, 20.7333],
  'pinlaung':            [96.8667, 20.0833],
  'pekon':               [96.8833, 19.8833],
  'langkho':             [98.4500, 21.3000],
  'kokang':              [98.5167, 23.4000],
  'nawnghkio':           [96.9667, 22.3167],
  'hseni':               [97.8167, 22.7833],
  'tangyan':             [97.7667, 23.0500],
  'kyethi':              [97.7333, 22.7667],
  'mongshu':             [98.9833, 20.5333],
  'laukkaing':           [99.1167, 23.7667],
  'matman':              [99.8500, 22.4833],
  'mongla':              [101.1667, 21.5167],
  'tachileik':           [99.8833, 20.4500],
  'mong hsat':           [99.2167, 20.5333],
  'nyaungshwe':          [96.9667, 20.6333],
  'kalaw':               [96.5667, 20.6333],
  'heho':                [96.8000, 20.7333],
  'aungban':             [96.6667, 20.6833],

  // Bago Region
  'bago':                [96.4833, 17.3333],
  'toungoo':             [96.4383, 18.9317],
  'taungoo':             [96.4383, 18.9317],
  'pyay':                [95.2167, 18.8167],
  'thayarwady':          [95.8833, 17.7333],
  'letpadan':            [95.7500, 17.7833],
  'pyu':                 [96.4333, 18.4833],
  'oktwin':              [96.3833, 18.5500],
  'nyaunglebin':         [96.7333, 17.9500],
  'phyu':                [96.4500, 18.4833],
  'daik-u':              [96.6167, 17.8000],
  'thanatpin':           [96.6667, 17.3667],

  // Tanintharyi Region
  'dawei':               [98.1932, 14.0833],
  'myeik':               [98.5960, 12.4349],
  'kawthoung':           [98.5548, 9.9849],
  'palaw':               [98.6333, 13.1667],
  'yebyu':               [98.5167, 14.2833],
  'thayetchaung':        [98.6333, 14.3167],
  'launglon':            [98.2667, 13.7167],
  'kyunsu':              [98.0833, 13.0000],

  // Yangon Region
  'yangon':              [96.1561, 16.8661],
  'rangoon':             [96.1561, 16.8661],
  'hlaing tharyar':      [96.0167, 16.9000],
  'shwepyitha':          [96.0833, 17.0333],
  'north okkalapa':      [96.2167, 16.9167],
  'south okkalapa':      [96.2167, 16.8667],
  'thanlyin':            [96.2500, 16.7667],
  'insein':              [96.1333, 16.9667],
  'mingaladon':          [96.1333, 17.0333],
  'hmawbi':              [96.1000, 17.1333],

  // Ayeyarwady Region
  'pathein':             [94.7333, 16.7833],
  'bassein':             [94.7333, 16.7833],
  'hinthada':            [95.4667, 17.6500],
  'myanaung':            [95.3167, 18.2833],
  'maubin':              [95.6500, 16.7333],
  'labutta':             [94.7667, 16.1500],
  'pyapon':              [95.6833, 16.2833],
  'dedaye':              [95.7000, 16.4667],
  'bogale':              [95.4000, 16.2833],
  'ngapudaw':            [95.1667, 16.5000],
  'wakema':              [95.1667, 16.6000],
  'mawgyun':             [95.5833, 16.3167],

  // Naypyidaw Union Territory
  'naypyidaw':           [96.1297, 19.7633],
  'nay pyi taw':         [96.1297, 19.7633],
  'pyinmana':            [96.2000, 19.7333],
  'lewe':                [96.1167, 19.6333],
  'tatkon':              [96.0667, 19.9000],
  'ottarathiri':         [96.1297, 19.7633],
  'dekkhina':            [96.1667, 19.6667],
  'pobbathiri':          [96.0667, 19.8000],
  'zabuthiri':           [96.1667, 19.9167],
}

// State/region centroids for fallback
const REGION_CENTROIDS: Record<string, [number, number]> = {
  'kachin':                           [97.0, 25.5],
  'kachin state':                     [97.0, 25.5],
  'sagaing':                          [95.4, 23.0],
  'sagaing region':                   [95.4, 23.0],
  'magway':                           [94.8, 20.1],
  'magway region':                    [94.8, 20.1],
  'mandalay':                         [96.1, 21.5],
  'mandalay region':                  [96.1, 21.5],
  'chin':                             [93.5, 22.0],
  'chin state':                       [93.5, 22.0],
  'karen':                            [97.8, 17.5],
  'kayin':                            [97.8, 17.5],
  'karen state':                      [97.8, 17.5],
  'kayin state':                      [97.8, 17.5],
  'kayah':                            [97.2, 19.2],
  'karenni':                          [97.2, 19.2],
  'kayah state':                      [97.2, 19.2],
  'karenni state':                    [97.2, 19.2],
  'mon':                              [97.6, 16.1],
  'mon state':                        [97.6, 16.1],
  'rakhine':                          [93.6, 20.3],
  'arakan':                           [93.6, 20.3],
  'rakhine state':                    [93.6, 20.3],
  'arakan state':                     [93.6, 20.3],
  'shan':                             [97.5, 22.0],
  'shan state':                       [97.5, 22.0],
  'bago':                             [96.5, 17.8],
  'bago region':                      [96.5, 17.8],
  'tanintharyi':                      [98.5, 13.5],
  'tanintharyi region':               [98.5, 13.5],
  'yangon':                           [96.2, 16.9],
  'yangon region':                    [96.2, 16.9],
  'ayeyarwady':                       [95.2, 17.0],
  'ayeyarwady region':                [95.2, 17.0],
  'irrawaddy':                        [95.2, 17.0],
  'naypyidaw':                        [96.1, 19.8],
  'nay pyi taw':                      [96.1, 19.8],
  'naypyidaw union territory':        [96.1, 19.8],
}

// Authoritative township → region mapping (prevents AI region hallucinations)
const TOWNSHIP_REGION: Record<string, string> = {
  // Kachin State
  'myitkyina': 'Kachin State', 'bhamo': 'Kachin State', 'hpakant': 'Kachin State',
  'mogaung': 'Kachin State', 'putao': 'Kachin State', 'tanai': 'Kachin State',
  'waingmaw': 'Kachin State', 'chipwi': 'Kachin State', 'mansi': 'Kachin State',
  'momauk': 'Kachin State', 'laiza': 'Kachin State', 'pansai': 'Kachin State',
  // Sagaing Region
  'shwebo': 'Sagaing Region', 'monywa': 'Sagaing Region', 'kale': 'Sagaing Region',
  'kalay': 'Sagaing Region', 'tamu': 'Sagaing Region', 'ye-u': 'Sagaing Region',
  'yeu': 'Sagaing Region', 'indaw': 'Sagaing Region', 'kanbalu': 'Sagaing Region',
  'kawlin': 'Sagaing Region', 'wuntho': 'Sagaing Region', 'pinlebu': 'Sagaing Region',
  'banmauk': 'Sagaing Region', 'tigyaing': 'Sagaing Region', 'sagaing': 'Sagaing Region',
  'myaung': 'Sagaing Region', 'pale': 'Sagaing Region', 'mingin': 'Sagaing Region',
  'chaung-u': 'Sagaing Region', 'mawlaik': 'Sagaing Region', 'homlin': 'Sagaing Region',
  'hkamti': 'Sagaing Region', 'nanyun': 'Sagaing Region', 'khampat': 'Sagaing Region',
  'kalewa': 'Sagaing Region', 'gangaw': 'Sagaing Region', 'kyunhla': 'Sagaing Region',
  'wetlet': 'Sagaing Region', 'ayadaw': 'Sagaing Region', 'budalin': 'Sagaing Region',
  'yinmarbin': 'Sagaing Region', 'rhamo': 'Sagaing Region', 'taze': 'Sagaing Region',
  'depayin': 'Sagaing Region',
  // Magway Region
  'magway': 'Magway Region', 'minbu': 'Magway Region', 'pakokku': 'Magway Region',
  'tilin': 'Magway Region', 'htilin': 'Magway Region', 'saw': 'Magway Region',
  'sidoktaya': 'Magway Region', 'myaing': 'Magway Region', 'pauk': 'Magway Region',
  'seikphyu': 'Magway Region', 'yesagyo': 'Magway Region', 'natmauk': 'Magway Region',
  'taungdwingyi': 'Magway Region', 'myothit': 'Magway Region', 'pwintbyu': 'Magway Region',
  'sinbaungwe': 'Magway Region', 'aunglan': 'Magway Region', 'kamma': 'Magway Region',
  // Mandalay Region
  'mandalay': 'Mandalay Region', 'pyin oo lwin': 'Mandalay Region',
  'kyaukse': 'Mandalay Region', 'meiktila': 'Mandalay Region',
  'myingyan': 'Mandalay Region', 'natogyi': 'Mandalay Region', 'ngazun': 'Mandalay Region',
  'taungtha': 'Mandalay Region', 'mahlaing': 'Mandalay Region',
  'pyigyitagon': 'Mandalay Region', 'amarapura': 'Mandalay Region',
  'patheingyi': 'Mandalay Region', 'sintgaing': 'Mandalay Region',
  'myittha': 'Mandalay Region', 'wundwin': 'Mandalay Region',
  // Chin State
  'hakha': 'Chin State', 'falam': 'Chin State', 'tedim': 'Chin State',
  'mindat': 'Chin State', 'paletwa': 'Chin State', 'thantlang': 'Chin State',
  'matupi': 'Chin State', 'kanpetlet': 'Chin State', 'rezua': 'Chin State',
  'tongzang': 'Chin State', 'tiddim': 'Chin State',
  // Kayin/Karen State
  'hpa-an': 'Kayin State', 'pa-an': 'Kayin State', 'myawaddy': 'Kayin State',
  'kawkareik': 'Kayin State', 'kyainseikgyi': 'Kayin State', 'hlaingbwe': 'Kayin State',
  'thandaunggyi': 'Kayin State', 'pharpon': 'Kayin State', 'bilin': 'Kayin State',
  'three pagodas pass': 'Kayin State', 'kyaukkyi': 'Kayin State', 'shwegyin': 'Kayin State',
  // Kayah State
  'loikaw': 'Kayah State', 'demoso': 'Kayah State', 'hpruso': 'Kayah State',
  'bawlakhe': 'Kayah State', 'mese': 'Kayah State', 'shadaw': 'Kayah State',
  'kholam': 'Kayah State', 'hpasawng': 'Kayah State',
  // Mon State
  'mawlamyine': 'Mon State', 'moulmein': 'Mon State', 'thaton': 'Mon State',
  'ye': 'Mon State', 'kyaikto': 'Mon State', 'thanbyuzayat': 'Mon State',
  'kyaikmaraw': 'Mon State', 'mudon': 'Mon State', 'chaungzon': 'Mon State',
  // Rakhine State
  'sittwe': 'Rakhine State', 'buthidaung': 'Rakhine State', 'maungdaw': 'Rakhine State',
  'kyauktaw': 'Rakhine State', 'mrauk-u': 'Rakhine State', 'rathedaung': 'Rakhine State',
  'myebon': 'Rakhine State', 'minbya': 'Rakhine State', 'pauktaw': 'Rakhine State',
  'toungup': 'Rakhine State', 'gwa': 'Rakhine State', 'thandwe': 'Rakhine State',
  'an': 'Rakhine State', 'kyaukphyu': 'Rakhine State', 'ramree': 'Rakhine State',
  'taungup': 'Rakhine State', 'ponnagyun': 'Rakhine State', 'yanbye': 'Rakhine State',
  'munaung': 'Rakhine State',
  // Shan State
  'taunggyi': 'Shan State', 'lashio': 'Shan State', 'kengtung': 'Shan State',
  'hsipaw': 'Shan State', 'namhkam': 'Shan State', 'muse': 'Shan State',
  'kyaukme': 'Shan State', 'mongmit': 'Shan State', 'mogok': 'Shan State',
  'namtu': 'Shan State', 'kutkai': 'Shan State', 'loilen': 'Shan State',
  'hopang': 'Shan State', 'panglong': 'Shan State', 'pinlaung': 'Shan State',
  'pekon': 'Shan State', 'langkho': 'Shan State', 'kokang': 'Shan State',
  'nawnghkio': 'Shan State', 'hseni': 'Shan State', 'tangyan': 'Shan State',
  'kyethi': 'Shan State', 'mongshu': 'Shan State', 'laukkaing': 'Shan State',
  'matman': 'Shan State', 'mongla': 'Shan State', 'tachileik': 'Shan State',
  'mong hsat': 'Shan State', 'nyaungshwe': 'Shan State', 'kalaw': 'Shan State',
  'heho': 'Shan State', 'aungban': 'Shan State',
  // Bago Region
  'bago': 'Bago Region', 'toungoo': 'Bago Region', 'taungoo': 'Bago Region',
  'pyay': 'Bago Region', 'thayarwady': 'Bago Region', 'letpadan': 'Bago Region',
  'pyu': 'Bago Region', 'oktwin': 'Bago Region', 'nyaunglebin': 'Bago Region',
  'phyu': 'Bago Region', 'daik-u': 'Bago Region', 'thanatpin': 'Bago Region',
  // Tanintharyi Region
  'dawei': 'Tanintharyi Region', 'myeik': 'Tanintharyi Region',
  'kawthoung': 'Tanintharyi Region', 'palaw': 'Tanintharyi Region',
  'yebyu': 'Tanintharyi Region', 'thayetchaung': 'Tanintharyi Region',
  'launglon': 'Tanintharyi Region', 'kyunsu': 'Tanintharyi Region',
  // Yangon Region
  'yangon': 'Yangon Region', 'rangoon': 'Yangon Region',
  'hlaing tharyar': 'Yangon Region', 'shwepyitha': 'Yangon Region',
  'north okkalapa': 'Yangon Region', 'south okkalapa': 'Yangon Region',
  'thanlyin': 'Yangon Region', 'insein': 'Yangon Region',
  'mingaladon': 'Yangon Region', 'hmawbi': 'Yangon Region',
  // Ayeyarwady Region
  'pathein': 'Ayeyarwady Region', 'bassein': 'Ayeyarwady Region',
  'hinthada': 'Ayeyarwady Region', 'myanaung': 'Ayeyarwady Region',
  'maubin': 'Ayeyarwady Region', 'labutta': 'Ayeyarwady Region',
  'pyapon': 'Ayeyarwady Region', 'dedaye': 'Ayeyarwady Region',
  'bogale': 'Ayeyarwady Region', 'ngapudaw': 'Ayeyarwady Region',
  'wakema': 'Ayeyarwady Region', 'mawgyun': 'Ayeyarwady Region',
  // Naypyidaw Union Territory
  'naypyidaw': 'Naypyidaw Union Territory', 'nay pyi taw': 'Naypyidaw Union Territory',
  'pyinmana': 'Naypyidaw Union Territory', 'lewe': 'Naypyidaw Union Territory',
  'tatkon': 'Naypyidaw Union Territory', 'ottarathiri': 'Naypyidaw Union Territory',
  'dekkhina': 'Naypyidaw Union Territory', 'pobbathiri': 'Naypyidaw Union Territory',
  'zabuthiri': 'Naypyidaw Union Territory',
}

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+township$/i, '')
    .replace(/\s+sub-township$/i, '')
    .replace(/\s+district$/i, '')
    .replace(/\s+state$/i, '')
    .replace(/\s+region$/i, '')
    .replace(/['']/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

interface TownshipHit {
  coords: [number, number]
  region: string | undefined
}

function tryLookup(name: string): TownshipHit | null {
  const key = normalize(name)
  if (!key) return null
  if (TOWNSHIP_COORDS[key]) return { coords: TOWNSHIP_COORDS[key], region: TOWNSHIP_REGION[key] }
  for (const [k, v] of Object.entries(TOWNSHIP_COORDS)) {
    if (k.includes(key) || key.includes(k)) return { coords: v, region: TOWNSHIP_REGION[k] }
  }
  return null
}

export function resolveCoordinates(
  township:    string,
  district:    string,
  stateRegion: string,
  suggested?: [number, number],
): GeoResult {
  // 1. Exact or partial township match — region from lookup overrides AI-extracted region
  const fromTownship = tryLookup(township)
  if (fromTownship) {
    return { coords: fromTownship.coords, precision: 'township', region: fromTownship.region }
  }

  // 2. Try district name
  const fromDistrict = tryLookup(district)
  if (fromDistrict) {
    return { coords: fromDistrict.coords, precision: 'district', region: fromDistrict.region }
  }

  // 3. Accept suggested coords only when within Myanmar bounding box
  if (
    suggested &&
    suggested[0] !== 0 && suggested[1] !== 0 &&
    suggested[0] >= 92.2 && suggested[0] <= 101.2 &&
    suggested[1] >= 9.8  && suggested[1] <= 28.5
  ) {
    return { coords: suggested, precision: 'exact' }
  }

  // 4. Region centroid fallback
  const regionKey = normalize(stateRegion)
  const fromRegion =
    REGION_CENTROIDS[regionKey] ??
    REGION_CENTROIDS[regionKey + ' state'] ??
    REGION_CENTROIDS[regionKey + ' region']
  if (fromRegion) {
    return { coords: fromRegion, precision: 'region' }
  }

  // 5. Myanmar centroid — absolute fallback
  return { coords: [96.0, 19.5], precision: 'region' }
}
