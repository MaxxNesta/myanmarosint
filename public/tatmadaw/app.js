// ═══════════════════════════════════════════════════════════════
// TATMADAW DATA — Myanmar Armed Forces Information Portal
// Sources: SIPRI, IISS Military Balance, Global Security, Jane's
// ═══════════════════════════════════════════════════════════════

const T = {

  // ── ARMY ──────────────────────────────────────────────────────
  army: {
    name: 'Tatmadaw Kyi', burmese: 'တပ်မတော် (ကြည်း)',
    founded: 1945, personnel: 325000, divisions: 10, lids: 10, mocs: 19,
    motto: '"We shall not betray the national cause"',

    regionalCommands: [
      { id:'cmd', abbr:'လပခ', name:'Central Command',          burmese:'အလယ်ပိုင်းတိုင်းစစ်ဌာနချုပ်',    hq:'Mandalay',          region:'Mandalay Region',              coords:[21.9588,96.0891], mocs:['MOC-2','MOC-17'],        personnel:'~35,000', established:1972, area:'Mandalay Region (central heartland)',            desc:'Controls the central heartland of Myanmar around Mandalay, the cultural capital. One of the most strategically important commands due to its central location.', insignia:'https://upload.wikimedia.org/wikipedia/commons/5/5f/Shoulder_sleeve_insignia_of_Central_Command.svg' },
      { id:'nc',  abbr:'မပခ',  name:'Northern Command',          burmese:'မြောက်ပိုင်းတိုင်းစစ်ဌာနချုပ်', hq:'Myitkyina',       region:'Kachin State',                 coords:[25.3824,97.3961], mocs:['MOC-16','MOC-21'],      personnel:'~30,000', established:1968, area:'Kachin State, far northern Sagaing Region',     desc:'Controls Kachin State and far northern regions, bordering China and India. Long-running armed conflict zone with the Kachin Independence Army (KIA).',     insignia:'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_sleeve_insignia_of_Northern_Command_of_Myanmar_Army.svg' },
      { id:'nec', abbr:'ရမခ',  name:'North-East Command',        burmese:'အရှေ့မြောက်တိုင်းစစ်ဌာနချုပ်', hq:'Lashio',          region:'Northern Shan State',          coords:[22.9333,97.7500], mocs:['MOC-4','MOC-21'],       personnel:'~28,000', established:1966, area:'Northern Shan State (border with China)',         desc:'Controls Northern Shan State, a complex area with multiple ethnic armed groups and China border trade routes. HQ located at Lashio.',                       insignia:'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_sleeve_insignia_of_Northern_East_Command_of_Myanmar_Army.svg' },
      { id:'ec',  abbr:'ရပခ',   name:'Eastern Command',           burmese:'အရှေ့တိုင်းစစ်ဌာနချုပ်',    hq:'Taunggyi',          region:'Southern Shan & Kayah States', coords:[20.7903, 97.0362], mocs:['MOC-3','MOC-5','MOC-6'], personnel:'~32,000', established:1966, area:'Southern Shan State, Kayah (Karenni) State',     desc:'Controls Southern Shan State and Kayah State, bordering Thailand and Laos. The diverse ethnic landscape includes multiple armed groups.',                  insignia:'https://upload.wikimedia.org/wikipedia/commons/c/c0/Shoulder_sleeve_insignia_of_Eastern_Command.svg' },
      { id:'sec', abbr:'ရတခ',  name:'South-East Command',        burmese:'အရှေ့တောင်တိုင်းစစ်ဌာနချုပ်', hq:'Mawlamyine',         region:'Karen State & Mon Region',    coords:[16.4543, 97.6440], mocs:['MOC-7','MOC-14'],       personnel:'~33,000', established:1966, area:'Karen (Kayin) State, eastern Bago Region',        desc:'Controls Karen State — one of the longest-running conflict zones in the world. The Karen National Union (KNU) has opposed the Tatmadaw since 1949.',        insignia:'https://upload.wikimedia.org/wikipedia/commons/6/68/Shoulder_sleeve_insignia_of_South_East_Command_%28right_side%29.svg' },
      { id:'sc',  abbr:'တပခ',   name:'Southern Command',          burmese:'တောင်ပိုင်းတိုင်းစစ်ဌာနချုပ်', hq:'Taungoo', region:'Bago & Magway Regions',     coords:[18.9430, 96.4430], mocs:['MOC-13','MOC-15'],      personnel:'~30,000', established:1966, area:'Yangon Region, Mon State, northern Tanintharyi',  desc:'Controls the Yangon area and surrounding regions. HQ at Mingaladon military base north of Yangon. Includes the country\'s largest city and commercial capital.', insignia:'https://upload.wikimedia.org/wikipedia/commons/0/09/Shoulder_sleeve_insignia_of_Southern_Command.svg' },
      { id:'swc', abbr:'နတခ',  name:'South-West Command',        burmese:'အနောက်တောင်တိုင်းစစ်ဌာနချုပ်', hq:'Pathein',         region:'Ayeyarwady Region',            coords:[16.7749,94.9348], mocs:['MOC-10'],              personnel:'~25,000', established:1966, area:'Ayeyarwady (Irrawaddy) Delta Region',            desc:'Controls the Ayeyarwady Delta, Myanmar\'s most productive agricultural region and critical water transport network. HQ at Pathein (Bassein).',               insignia:'https://upload.wikimedia.org/wikipedia/commons/f/f7/Shoulder_Sleeve_Insignia_of_Southern_West_Command_of_Myanmar_Army.svg' },
      { id:'wc',  abbr:'နပခ',   name:'Western Command',           burmese:'အနောက်ပိုင်းတိုင်းစစ်ဌာနချုပ်',    hq:'Ann',               region:'Rakhine State & Chin',       coords:[19.7704,94.0292], mocs:['MOC-9','MOC-20'],       personnel:'~28,000', established:1966, area:'Rakhine (Arakan) State, western Magway Region',   desc:'Controls Rakhine State along the Bay of Bengal coast. This command has been heavily involved in operations in Rakhine State.',                              insignia:'https://upload.wikimedia.org/wikipedia/commons/1/13/Shoulder_sleeve_insignia_of_Western_Command.svg' },
      { id:'nwc', abbr:'နမခ',  name:'North-West Command',        burmese:'အနောက်မြောက်တိုင်းစစ်ဌာနချုပ်', hq:'Monywa',          region:'Sagaing Region',               coords:[22.1167,95.1417], mocs:['MOC-1','MOC-11'],       personnel:'~30,000', established:1966, area:'Sagaing Region (south), Chin State',              desc:'Controls Sagaing Region. Since the February 2021 coup, this region has seen significant People\'s Defence Force (PDF) resistance activity.',                insignia:'https://upload.wikimedia.org/wikipedia/commons/4/42/Shoulder_sleeve_insignia_of_North_West_Command.svg' },
      { id:'trc', abbr:'တသခ',  name:'Triangle Regional Command', burmese:'တြိဂံတိုင်းစစ်ဌာနချုပ်',    hq:'Kengtung',          region:'Eastern Shan State',           coords:[21.2944,99.6100], mocs:['MOC-5'],               personnel:'~22,000', established:1997, area:'Eastern Shan State (Golden Triangle)',              desc:'Controls the Golden Triangle border region at the intersection of Myanmar, China, Laos, and Thailand. Established in 1997 to address border security.',      insignia:'https://upload.wikimedia.org/wikipedia/commons/8/82/Shoulder_sleeve_insignia_of_Triangle_Region_Command.svg' },
      { id:'ygt', abbr:'ရကတ', name:'Yangon Command',          burmese:'ရန်ကုန်တိုင်းစစ်ဌာနချုပ်',    hq:'Mayangone Township-Kone-Myint-Thar',          region:'Yangon Region',              coords:[16.9000,96.1333], mocs:['MOC-2','MOC-17'],        personnel:'~35,000', established:1969, area:'Yangon Region',            desc:'Responsible for security of Yangon, largest city of Myanmar and commercial hub. Strategically important due to economic assets, infrastructure, and political significance. HQ based near Mingaladon.', insignia:'https://upload.wikimedia.org/wikipedia/commons/3/32/Shoulder_sleeve_insignia_of_Yangon_Region_Command.svg' },
      { id:'kyk',  abbr:'ကရခ',  name:'Coastal Region Command',          burmese:'ကမ်းရိုးတန်းတိုင်းစစ်ဌာနချုပ်', hq:'Myeik',       region:'Tanintharyi Region',                 coords:[12.4395,98.6003], mocs:['MOC-12'],      personnel:'~20,000', established:1996, area:'Tanintharyi Region (southern coastal strip)',     desc:'Oversees the long southern coastline along the Andaman Sea. Important for maritime security, offshore resources, and border proximity to Thailand.',     insignia:'https://upload.wikimedia.org/wikipedia/commons/5/56/Shoulder_sleeve_insignia_of_Coastal_Region_Command.svg' },
      { id:'npt', abbr:'နပတ',  name:'Naypyidaw Command',        burmese:'နေပြည်တော်တိုင်းစစ်ဌာနချုပ်', hq:'Pyinmana',          region:'Naypyidaw',          coords:[19.7633,96.0785], mocs:['MOC-4','MOC-21'],       personnel:'~25,000', established:2005, area:'Naypyidaw Region',         desc:'Responsible for the defense and security of Naypyidaw, administrative capital of Myanmar. Protects key government institutions, military headquarters, and strategic infrastructure.',                       insignia:'https://upload.wikimedia.org/wikipedia/commons/c/cd/Shoulder_sleeve_insignia_of_Nay_Pyi_Daw_Command.svg' },
      { id:'ecc',  abbr:'ရလခ',   name:'Eastern Central Command',           burmese:'အရှေ့အလယ်ပိုင်းတိုင်းစစ်ဌာနချုပ်',    hq:'Kholam',          region:'Middle Shan State', coords:[20.7080,97.0800], mocs:['MOC-3','MOC-5','MOC-6'], personnel:'~32,000', established:2011, area:'Central and southern Shan State',     desc:'Important for internal security, logistics corridors, and operations in Shan State\'s contested areas involving multiple ethnic armed groups.',                  insignia:'https://upload.wikimedia.org/wikipedia/commons/d/d4/Shoulder_sleeve_insignia_of_Central_East_Command.svg' },
    ],

    lids: [
      { num:11,  name:'11th Light Infantry Division', loc:'Kyaukpadaung', cmd:'Central Command',    coords:[20.8428,95.1312], est:1999, regiments:10, spec:'Counter-insurgency & Urban Warfare', insignia:'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_sleeve_insignia_of_No.(11)_Light_Infantry_Division_of_the_Myanmar_Army.svg',    desc:'Established 1999 and garrisoned at Kyaukpadaung, a strategic town near Mount Popa in Mandalay Region. Operates under Central Command covering the heartland of Myanmar. Has been deployed in counter-insurgency operations against Shan State resistance groups and against post-2021 PDFs across Mandalay and Magway regions. Specialises in urban clearing and close-quarter operations in central towns.' },
      { num:22,  name:'22nd Light Infantry Division', loc:'Mawlaik',      cmd:'North-West Command', coords:[23.6429,94.4100], est:1999, regiments:10, spec:'Mountain & Jungle Warfare',          insignia:'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_sleeve_insignia_of_No.(22)_Light_Infantry_Division_of_the_Myanmar_Army.svg',    desc:'Established 1999 at Mawlaik on the Chindwin River near the India-Myanmar border. Specialises in mountain and jungle warfare across the rugged terrain of Chin State and western Sagaing. Has conducted sustained operations against the Chin National Front (CNF) and, post-2021, against People\'s Defence Forces (PDFs) operating along India-Myanmar border corridors.' },
      { num:33,  name:'33rd Light Infantry Division', loc:'Sagaing',      cmd:'North-West Command', coords:[21.8972,95.9758], est:1990, regiments:10, spec:'Rapid Deployment Force',              insignia:'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_sleeve_insignia_of_No.(33)_Light_Infantry_Division_of_the_Myanmar_Army.svg',    desc:'Established 1990 at Sagaing, across the Irrawaddy from Mandalay. One of the most widely and controversially deployed LIDs in Tatmadaw history — sent across multiple theaters including Rakhine, Kachin, Karen, and Sagaing states. Infamously deployed during the 2017 clearance operations in Rakhine State, which drew international condemnation and UN investigations. Its rapid-deployment designation reflects its consistent use as an expeditionary strike force.' },
      { num:44,  name:'44th Light Infantry Division', loc:'Hmawbi',       cmd:'Southern Command',   coords:[17.2367,95.9622], est:1990, regiments:10, spec:'Counter-insurgency',                  insignia:'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_sleeve_insignia_of_No.(44)_Light_Infantry_Division_of_the_Myanmar_Army.svg',    desc:'Established 1990 at Hmawbi, approximately 45 km northwest of Yangon. Stationed near Myanmar\'s largest city, it serves as the primary rapid-reaction force for the Yangon metropolitan area and is tasked with internal security of the commercial capital. Has been deployed in counter-insurgency in Karen and Mon states, and was heavily involved in post-2021 security operations in Yangon\'s peri-urban zones.' },
      { num:55,  name:'55th Light Infantry Division', loc:'Magway',       cmd:'Western Command',    coords:[20.1458,94.9325], est:1990, regiments:10, spec:'Dry Zone & Desert Warfare',           insignia:'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_sleeve_insignia_of_No.(55)_Light_Infantry_Division_of_the_Myanmar_Army.svg',    desc:'Established 1990 at Magway, capital of Magway Region in central Myanmar\'s dry zone. After the February 2021 coup, Magway became one of the most intense resistance theatres in the country. LID-55 has been heavily engaged in sustained operations against PDFs in the Magway-Chin border corridor, participating in airstrikes and ground offensives against civilian and resistance targets documented by international human rights organisations.' },
      { num:66,  name:'66th Light Infantry Division', loc:'Pyinmana',     cmd:'Southern Command',   coords:[19.7419,96.2127], est:1990, regiments:10, spec:'Strategic Reserve',                   insignia:'https://upload.wikimedia.org/wikipedia/commons/f/fa/Shoulder_sleeve_insignia_of_No.%2866%29_Light_Infantry_Division_of_the_Myanmar_Army.svg',  desc:'Established 1990 at Pyinmana, adjacent to the national capital Naypyidaw. Functions as both a strategic reserve and guardian of the administrative capital\'s outer defence. Its proximity to senior SAC military leadership and key government installations gives it considerable political significance. Considered one of the most politically reliable LIDs due to its direct role in capital protection.' },
      { num:77,  name:'77th Light Infantry Division', loc:'Prome (Pyay)', cmd:'South-West Command', coords:[18.8213,95.2198], est:1990, regiments:10, spec:'River & Amphibious Warfare',          insignia:'https://upload.wikimedia.org/wikipedia/commons/a/a6/Shoulder_sleeve_insignia_of_No.%2877%29_Light_Infantry_Division_of_the_Myanmar_Army.svg',  desc:'Established 1990 at Prome (Pyay), a historic city on the Ayeyarwady River and site of the ancient Pyu capital Sri Ksetra. Specialises in river and amphibious operations along the Ayeyarwady basin. Historically used in delta clearance operations. Since 2021, actively deployed against PDF forces in Magway, Bago, and Ayeyarwady regions, frequently conducting river-corridor assault operations.' },
      { num:88,  name:'88th Light Infantry Division', loc:'Meiktila',     cmd:'Central Command',    coords:[20.8771,95.8579], est:1990, regiments:10, spec:'Armored Infantry Support',            insignia:'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_sleeve_insignia_of_No.(88)_Light_Infantry_Division_of_the_Myanmar_Army.svg',    desc:'Established 1990 at Meiktila, a strategically important junction city in Mandalay Region. The "88" designation carries heavy historical resonance — Meiktila was a flashpoint of the 1988 pro-democracy uprising. Serves as the armored infantry support force in central Myanmar, operating alongside Central Command\'s armor assets. Was present during the 1988 suppression of protests at Meiktila military barracks.' },
      { num:99,  name:'99th Light Infantry Division', loc:'Meiktila',     cmd:'Central Command',    coords:[20.8850,95.8700], est:1988, regiments:10, spec:'Strategic Reserve / Rapid Response',  insignia:'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_sleeve_insignia_of_No.(99)_Light_Infantry_Division_of_the_Myanmar_Army.svg',    desc:'Established 1988 — the oldest and most senior LID, formed in direct response to the nationwide 8888 pro-democracy uprising. Based in Meiktila alongside LID-88. Its 1988 founding date marks the Tatmadaw\'s institutional shift toward elite mobile formations to suppress internal threats. Considered the most politically loyal and battle-hardened LID; serves as the strategic reserve and rapid response force of highest priority.' },
      { num:101, name:'101st Light Infantry Division',loc:'Pakokku',      cmd:'North-West Command', coords:[21.3360,95.0838], est:2000, regiments:10, spec:'Counter-insurgency',                  insignia:'https://upload.wikimedia.org/wikipedia/commons/b/be/Shoulder_sleeve_insignia_of_No.%28101%29_Light_Infantry_Division_of_the_Myanmar_Army.svg', desc:'Established 2000 at Pakokku, Magway Region — the newest LID and the only one with a triple-digit number. Pakokku gained international prominence in September 2007 when military personnel beat monks protesting rising fuel prices there, directly igniting the Saffron Revolution. Post-2021, LID-101 has seen the highest operational tempo of any LID as Sagaing and Chin regions became the epicentre of PDF resistance against military rule.' },
    ],

    mocs: [
      { num:1,  loc:'Sagaing',        cmd:'North-West Command', area:'Northern Sagaing Region',          battalions:'~15 IB/LIB' },
      { num:2,  loc:'Mandalay',       cmd:'Central Command',    area:'Mandalay Region (central)',         battalions:'~15 IB/LIB' },
      { num:3,  loc:'Meiktila',       cmd:'Central Command',    area:'Southern Mandalay Region',          battalions:'~12 IB/LIB' },
      { num:4,  loc:'Lashio',         cmd:'North-East Command', area:'Northern Shan State',               battalions:'~15 IB/LIB' },
      { num:5,  loc:'Tachilek',       cmd:'Eastern Command',    area:'Eastern Shan (Thailand border)',    battalions:'~12 IB/LIB' },
      { num:6,  loc:'Taunggyi',       cmd:'Eastern Command',    area:'Southern Shan State',               battalions:'~15 IB/LIB' },
      { num:7,  loc:'Thaton',         cmd:'South-East Command', area:'Mon State & Karen State',           battalions:'~15 IB/LIB' },
      { num:8,  loc:'Dawei (Tavoy)',  cmd:'Southern Command',   area:'Tanintharyi Region',                battalions:'~12 IB/LIB' },
      { num:9,  loc:'Ye',             cmd:'Western Command',    area:'Southern Mon / Northern Rakhine',   battalions:'~12 IB/LIB' },
      { num:10, loc:'Labutta',        cmd:'South-West Command', area:'Ayeyarwady Delta',                  battalions:'~12 IB/LIB' },
      { num:11, loc:'Pakokku',        cmd:'North-West Command', area:'Western Mandalay, Magway Region',   battalions:'~12 IB/LIB' },
      { num:12, loc:'Sittwe',         cmd:'Western Command',    area:'Rakhine State (northern)',          battalions:'~15 IB/LIB' },
      { num:13, loc:'Myeik (Mergui)', cmd:'Southern Command',   area:'Southern Tanintharyi Region',       battalions:'~10 IB/LIB' },
      { num:14, loc:'Hpa-An',        cmd:'South-East Command', area:'Karen (Kayin) State',               battalions:'~15 IB/LIB' },
      { num:15, loc:'Nay Pyi Taw',   cmd:'Southern Command',   area:'Nay Pyi Taw Union Territory',       battalions:'~10 IB/LIB' },
      { num:16, loc:'Khin-U',        cmd:'Northern Command',   area:'Southern Sagaing (Kachin border)',  battalions:'~12 IB/LIB' },
      { num:17, loc:'Kyaukse',       cmd:'Central Command',    area:'Southern Mandalay Region',          battalions:'~12 IB/LIB' },
      { num:20, loc:'Kyaukphyu',     cmd:'Western Command',    area:'Central Rakhine State',             battalions:'~10 IB/LIB' },
      { num:21, loc:'Laukkaing',     cmd:'Northern Command',   area:'Northern Shan (Kokang Region)',     battalions:'~10 IB/LIB' },
    ],

    oocs: [
      { num:1,  abbr:'စကခ(၁)',  burmese:'အမှတ်(၁)စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ်',  hq:'Kyaukme',     hqBurmese:'ကျောက်မဲမြို့',   state:'Shan State',          stateBurmese:'ရှမ်းပြည်နယ်',              cmd:'North-East Command',      cmdAbbr:'ရမခ',  coords:[22.5333,97.0167], insignia:'' },
      { num:2,  abbr:'စကခ(၂)',  burmese:'အမှတ်(၂)စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ်',  hq:'Mong Nawng',  hqBurmese:'မိုင်းနောင်မြို့', state:'Shan State',          stateBurmese:'ရှမ်းပြည်နယ်',              cmd:'Eastern Central Command', cmdAbbr:'ရလခ',  coords:[20.4333,98.2833], insignia:'' },
      { num:3,  abbr:'စကခ(၃)',  burmese:'အမှတ်(၃)စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ်',  hq:'Mogaung',     hqBurmese:'မိုးကောင်းမြို့',  state:'Kachin State',        stateBurmese:'ကချင်ပြည်နယ်',              cmd:'Northern Command',        cmdAbbr:'မပခ',  coords:[25.3167,96.9167], insignia:'' },
      { num:4,  abbr:'စကခ(၄)',  burmese:'အမှတ်(၄)စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ်',  hq:'Taikkyi',     hqBurmese:'တိုက်ကြီးမြို့',   state:'Yangon Region',       stateBurmese:'ရန်ကုန်တိုင်းဒေသကြီး',     cmd:'Yangon Command',          cmdAbbr:'ရကတ', coords:[17.3667,95.9667], insignia:'' },
      { num:5,  abbr:'စကခ(၅)',  burmese:'အမှတ်(၅)စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ်',  hq:'Taunggok',    hqBurmese:'တောင်ကုတ်မြို့',   state:'Rakhine State',       stateBurmese:'ရခိုင်ပြည်နယ်',             cmd:'Western Command',         cmdAbbr:'နပခ',  coords:[18.4667,94.2500], insignia:'' },
      { num:6,  abbr:'စကခ(၆)',  burmese:'အမှတ်(၆)စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ်',  hq:'Naypyidaw',   hqBurmese:'နေပြည်တော်မြို့',  state:'Naypyidaw Union Territory', stateBurmese:'နေပြည်တော် ပြည်ထောင်စုနယ်မြေ', cmd:'Naypyidaw Command',      cmdAbbr:'နပတ',  coords:[19.7400,96.0900], insignia:'' },
      { num:7,  abbr:'စကခ(၇)',  burmese:'အမှတ်(၇)စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ်',  hq:'Pekhon',      hqBurmese:'ဖယ်ခုံမြို့',      state:'Kayah State',         stateBurmese:'ကယားပြည်နယ်',               cmd:'Eastern Command',         cmdAbbr:'ရပခ',  coords:[20.0667,97.2667], insignia:'' },
      { num:8,  abbr:'စကခ(၈)',  burmese:'အမှတ်(၈)စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ်',  hq:'Dawei',       hqBurmese:'ထားဝယ်မြို့',      state:'Tanintharyi Region',  stateBurmese:'တနင်္သာရီတိုင်းဒေသကြီး',   cmd:'Coastal Region Command',  cmdAbbr:'ကရခ', coords:[14.0833,98.1833], insignia:'' },
      { num:9,  abbr:'စကခ(၉)',  burmese:'အမှတ်(၉)စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ်',  hq:'Kyauktaw',    hqBurmese:'ကျောက်တော်မြို့',  state:'Rakhine State',       stateBurmese:'ရခိုင်ပြည်နယ်',             cmd:'Western Command',         cmdAbbr:'နပခ',  coords:[20.8333,93.0000], insignia:'' },
      { num:10, abbr:'စကခ(၁၀)', burmese:'အမှတ်(၁၀)စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ်', hq:'Kalay',       hqBurmese:'ကလေးမြို့',        state:'Sagaing Region',      stateBurmese:'စစ်ကိုင်းတိုင်းဒေသကြီး',   cmd:'North-West Command',      cmdAbbr:'နမခ',  coords:[23.1833,94.0333], insignia:'' },
      { num:12, abbr:'စကခ(၁၂)', burmese:'အမှတ်(၁၂)စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ်', hq:'Kawkareik',   hqBurmese:'ကော့ကရိတ်မြို့',   state:'Karen State',         stateBurmese:'ကရင်ပြည်နယ်',               cmd:'South-East Command',      cmdAbbr:'ရတခ', coords:[16.5333,98.2333], insignia:'' },
      { num:13, abbr:'စကခ(၁၃)', burmese:'အမှတ်(၁၃)စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ်', hq:'Bokepyin',    hqBurmese:'ဘုတ်ပြင်းမြို့',   state:'Tanintharyi Region',  stateBurmese:'တနင်္သာရီတိုင်းဒေသကြီး',   cmd:'Coastal Region Command',  cmdAbbr:'ကရခ', coords:[10.9833,98.7667], insignia:'' },
      { num:14, abbr:'စကခ(၁၄)', burmese:'အမှတ်(၁၄)စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ်', hq:'Mong Sat',    hqBurmese:'မိုင်းဆတ်မြို့',   state:'Shan State',          stateBurmese:'ရှမ်းပြည်နယ်',              cmd:'Triangle Regional Command',cmdAbbr:'တသခ', coords:[20.1500,99.9667], insignia:'' },
      { num:15, abbr:'စကခ(၁၅)', burmese:'အမှတ်(၁၅)စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ်', hq:'Rathedaung',  hqBurmese:'ရသေ့တောင်မြို့',   state:'Rakhine State',       stateBurmese:'ရခိုင်ပြည်နယ်',             cmd:'Western Command',         cmdAbbr:'နပခ',  coords:[20.4500,92.8333], insignia:'' },
      { num:16, abbr:'စကခ(၁၆)', burmese:'အမှတ်(၁၆)စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ်', hq:'Hseni',       hqBurmese:'သိန္နီမြို့',       state:'Shan State',          stateBurmese:'ရှမ်းပြည်နယ်',              cmd:'North-East Command',      cmdAbbr:'ရမခ',  coords:[23.2833,98.1167], insignia:'' },
      { num:17, abbr:'စကခ(၁၇)', burmese:'အမှတ်(၁၇)စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ်', hq:'Mong Pan',    hqBurmese:'မိုင်းပန်မြို့',   state:'Shan State',          stateBurmese:'ရှမ်းပြည်နယ်',              cmd:'Eastern Central Command', cmdAbbr:'ရလခ',  coords:[20.4833,98.3333], insignia:'' },
      { num:18, abbr:'စကခ(၁၈)', burmese:'အမှတ်(၁၈)စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ်', hq:'Mong Hsat',   hqBurmese:'မိုင်းဖြတ်မြို့',  state:'Shan State',          stateBurmese:'ရှမ်းပြည်နယ်',              cmd:'Triangle Regional Command',cmdAbbr:'တသခ', coords:[20.5333,99.2500], insignia:'' },
      { num:19, abbr:'စကခ(၁၉)', burmese:'အမှတ်(၁၉)စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ်', hq:'Ye',          hqBurmese:'ရေးမြို့',          state:'Mon State',           stateBurmese:'မွန်ပြည်နယ်',               cmd:'South-East Command',      cmdAbbr:'ရတခ', coords:[15.2500,97.8500], insignia:'' },
      { num:20, abbr:'စကခ(၂၀)', burmese:'အမှတ်(၂၀)စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ်', hq:'Khamaukgyi',  hqBurmese:'ခမောက်ကြီးမြို့',  state:'Tanintharyi Region',  stateBurmese:'တနင်္သာရီတိုင်းဒေသကြီး',   cmd:'Coastal Region Command',  cmdAbbr:'ကရခ', coords:[15.6500,98.1333], insignia:'' },
      { num:21, abbr:'စကခ(၂၁)', burmese:'အမှတ်(၂၁)စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ်', hq:'Bhamo',       hqBurmese:'ဗန်းမော်မြို့',    state:'Kachin State',        stateBurmese:'ကချင်ပြည်နယ်',              cmd:'Northern Command',        cmdAbbr:'မပခ',  coords:[24.2667,97.2333], insignia:'' },
    ],

    rchqs: [
      { id:'kalay',    abbr:'ဒကစ(ကလေး)',  burmese:'ဒေသကွပ်ကဲမှုစစ်ဌာနချုပ်(ကလေး)',  hq:'Kalay',    hqBurmese:'ကလေးမြို့',    state:'Sagaing Region', stateBurmese:'စစ်ကိုင်းတိုင်းဒေသကြီး', cmd:'North-West Command', cmdAbbr:'နမခ', coords:[23.1833,94.0333], insignia:'' },
      { id:'sittwe',   abbr:'ဒကစ(စစ်တွေ)', burmese:'ဒေသကွပ်ကဲမှုစစ်ဌာနချုပ်(စစ်တွေ)', hq:'Sittwe',   hqBurmese:'စစ်တွေမြို့',   state:'Rakhine State',  stateBurmese:'ရခိုင်ပြည်နယ်',            cmd:'Western Command',    cmdAbbr:'နပခ', coords:[20.1500,92.9000], insignia:'' },
      { id:'tanai',    abbr:'ဒကစ(တနိုင်း)', burmese:'ဒေသကွပ်ကဲမှုစစ်ဌာနချုပ်(တနိုင်း)', hq:'Tanai',   hqBurmese:'တနိုင်းမြို့',  state:'Kachin State',   stateBurmese:'ကချင်ပြည်နယ်',             cmd:'Northern Command',   cmdAbbr:'မပခ', coords:[26.0167,96.1500], insignia:'' },
      { id:'pyay',     abbr:'ဒကစ(ပြည်)',   burmese:'ဒေသကွပ်ကဲမှုစစ်ဌာနချုပ်(ပြည်)',   hq:'Pyay',     hqBurmese:'ပြည်မြို့',     state:'Bago Region',    stateBurmese:'ပဲခူးတိုင်းဒေသကြီး',       cmd:'Southern Command',   cmdAbbr:'တပခ', coords:[18.8167,95.2167], insignia:'' },
      { id:'loikaw',   abbr:'ဒကစ(လွိုင်ကော်)', burmese:'ဒေသကွပ်ကဲမှုစစ်ဌာနချုပ်(လွိုင်ကော်)', hq:'Loikaw', hqBurmese:'လွိုင်ကော်မြို့', state:'Kayah State', stateBurmese:'ကယားပြည်နယ်',             cmd:'Eastern Command',    cmdAbbr:'ရပခ', coords:[19.6733,97.2100], insignia:'' },
      { id:'laukkaing',abbr:'ဒကစ(လောက်ကိုင်)', burmese:'ဒေသကွပ်ကဲမှုစစ်ဌာနချုပ်(လောက်ကိုင်)', hq:'Laukkaing', hqBurmese:'လောက်ကိုင်မြို့', state:'Kokang SAZ', stateBurmese:'ကိုးကန့်ကိုယ်ပိုင်အုပ်ချုပ်ခွင့်ရဒေသ', cmd:'North-East Command', cmdAbbr:'ရမခ', coords:[23.7500,98.7667], insignia:'' },
    ],
  },

  // ── NAVY ──────────────────────────────────────────────────────
  navy: {
    name: 'Tatmadaw Yay', burmese: 'တပ်မတော် (ရေ)',
    founded: 1948, personnel: 16000,

    commands: [
      { name:'Naval Operations Command 1 (NOC-1)', hq:'Thanlyin, Yangon Region',    area:'Gulf of Martaban, western coast', coords:[16.7677,96.2503] },
      { name:'Naval Operations Command 2 (NOC-2)', hq:'Myeik, Tanintharyi Region',  area:'Andaman Sea, Mergui Archipelago', coords:[12.0983,98.6380] },
      { name:'Naval Operations Command 3 (NOC-3)', hq:'Kyaukphyu, Rakhine State',   area:'Bay of Bengal, Rakhine coast',   coords:[19.4275,93.5505] },
    ],

    vessels: [
      // Frigates
      { name:'UMS Aung Zeya',       desig:'F-11', type:'Frigate',                cls:'Aung Zeya-class',       disp:'2,800t', built:'China',    yr:2012, status:'Active', crew:300, arm:'76mm OTO, HHQ-7 SAM, torpedoes', notes:'Lead ship of class; commissioned 2012' },
      { name:'UMS Kyan Sittha',     desig:'F-12', type:'Frigate',                cls:'Aung Zeya-class',       disp:'2,800t', built:'China',    yr:2014, status:'Active', crew:300, arm:'76mm OTO, HHQ-7 SAM, torpedoes', notes:'Second of class' },
      { name:'UMS Mahar Bandula',   desig:'F-13', type:'Frigate',                cls:'Aung Zeya-class',       disp:'2,800t', built:'Myanmar', yr:2020, status:'Active', crew:300, arm:'76mm gun, SAM, torpedoes',         notes:'First major warship built domestically in Myanmar' },
      // Corvettes/Large Patrol
      { name:'UMS Mahar Thiha Thura',desig:'F-21',type:'Corvette',               cls:'Mahar Thiha Thura-cl.', disp:'1,900t', built:'Myanmar', yr:2001, status:'Active', crew:180, arm:'57mm, 40mm guns',                  notes:'Rebuilt Yugoslav-era hull' },
      { name:'UMS Inlay',           desig:'PGG-51',type:'Patrol Vessel (Large)', cls:'Inlay-class',           disp:'800t',   built:'Myanmar', yr:2001, status:'Active', crew: 90, arm:'57mm, AK-230 30mm CIWS',           notes:'Myanmar-built class' },
      { name:'UMS Indaw',           desig:'PGG-52',type:'Patrol Vessel (Large)', cls:'Inlay-class',           disp:'800t',   built:'Myanmar', yr:2003, status:'Active', crew: 90, arm:'57mm, AK-230 30mm CIWS',           notes:'' },
      { name:'UMS Inya',            desig:'PGG-53',type:'Patrol Vessel (Large)', cls:'Inlay-class',           disp:'800t',   built:'Myanmar', yr:2005, status:'Active', crew: 90, arm:'57mm, AK-230 30mm CIWS',           notes:'' },
      { name:'UMS Innlay',          desig:'PGG-54',type:'Patrol Vessel (Large)', cls:'Inlay-class',           disp:'800t',   built:'Myanmar', yr:2008, status:'Active', crew: 90, arm:'57mm, AK-230 30mm CIWS',           notes:'' },
      // Patrol Craft Escort
      { name:'UMS Yan Aung Myin',   desig:'PCE-41',type:'Patrol Craft (Escort)', cls:'Yan Aung Myin-class',  disp:'550t',   built:'Myanmar', yr:1998, status:'Active', crew: 70, arm:'40mm, 20mm Oerlikon guns',         notes:'' },
      { name:'UMS Yan Gyi Aung',    desig:'PCE-42',type:'Patrol Craft (Escort)', cls:'Yan Aung Myin-class',  disp:'550t',   built:'Myanmar', yr:2000, status:'Active', crew: 70, arm:'40mm, 20mm Oerlikon guns',         notes:'' },
      { name:'UMS Yan Paing Aung',  desig:'PCE-43',type:'Patrol Craft (Escort)', cls:'Yan Aung Myin-class',  disp:'550t',   built:'Myanmar', yr:2002, status:'Active', crew: 70, arm:'40mm, 20mm Oerlikon guns',         notes:'' },
      { name:'UMS Yan Myo Aung',    desig:'PCE-44',type:'Patrol Craft (Escort)', cls:'Yan Aung Myin-class',  disp:'550t',   built:'Myanmar', yr:2004, status:'Active', crew: 70, arm:'40mm, 20mm guns',                  notes:'' },
      // Fast Attack Craft
      { name:'FAC #1 (Houxin-class)',desig:'PGM-11',type:'Fast Attack Craft',   cls:'Houxin-class',          disp:'235t',   built:'China',   yr:1994, status:'Active', crew: 28, arm:'YJ-12 SSM, 37mm twin gun',         notes:'Anti-ship missile capability' },
      { name:'FAC #2 (Houxin-class)',desig:'PGM-12',type:'Fast Attack Craft',   cls:'Houxin-class',          disp:'235t',   built:'China',   yr:1994, status:'Active', crew: 28, arm:'YJ-12 SSM, 37mm twin gun',         notes:'' },
      { name:'FAC #3 (Houxin-class)',desig:'PGM-13',type:'Fast Attack Craft',   cls:'Houxin-class',          disp:'235t',   built:'China',   yr:1996, status:'Active', crew: 28, arm:'37mm twin gun',                    notes:'' },
      // River Gunboats
      { name:'Irrawaddy River Gunboat I', desig:'PBR-01',type:'River Gunboat',  cls:'Irrawaddy-class',       disp:'150t',   built:'Myanmar', yr:1990, status:'Active', crew: 20, arm:'20mm, 12.7mm HMG',                 notes:'River patrol operations' },
      { name:'Irrawaddy River Gunboat II',desig:'PBR-02',type:'River Gunboat',  cls:'Irrawaddy-class',       disp:'150t',   built:'Myanmar', yr:1992, status:'Active', crew: 20, arm:'20mm, 12.7mm HMG',                 notes:'' },
      { name:'Irrawaddy River Gunboat III',desig:'PBR-03',type:'River Gunboat', cls:'Irrawaddy-class',       disp:'150t',   built:'Myanmar', yr:1995, status:'Active', crew: 20, arm:'20mm, 12.7mm HMG',                 notes:'' },
      // Mine Warfare
      { name:'UMS Minefield',       desig:'AM-01', type:'Minesweeper',          cls:'Admirable-class (ex-US)',disp:'890t',   built:'USA',     yr:1943, status:'Reserve',crew: 60, arm:'20mm guns',                        notes:'WWII-era, partially serviceable' },
      // Support
      { name:'UMS Hsinbyushin',     desig:'AOR-01',type:'Replenishment Ship',   cls:'Support',               disp:'3,500t', built:'Myanmar', yr:2010, status:'Active', crew:120, arm:'Unarmed',                          notes:'Fleet replenishment & logistics' },
    ],

    bases: [
      { name:'Thanlyin Naval Base',       loc:'Thanlyin, Yangon Region',   coords:[16.7677,96.2503], type:'Main Naval Base',       vessels:'NOC-1 flagship, frigates, corvettes' },
      { name:'Kyaukphyu Naval Base',      loc:'Kyaukphyu, Rakhine State',  coords:[19.4275,93.5505], type:'Regional Naval Base',   vessels:'NOC-3 vessels, patrol craft' },
      { name:'Myeik Naval Base',          loc:'Myeik, Tanintharyi Region', coords:[12.4395,98.5985], type:'Regional Naval Base',   vessels:'NOC-2 vessels, FAC' },
      { name:'Pathein Naval Station',     loc:'Pathein, Ayeyarwady',       coords:[16.7749,94.7348], type:'Naval Station',         vessels:'River patrol craft' },
      { name:'Dawei Naval Station',       loc:'Dawei, Tanintharyi',        coords:[14.0831,98.1963], type:'Naval Station',         vessels:'Patrol craft, fast boats' },
      { name:'Kawthaung Naval Station',   loc:'Kawthaung, Tanintharyi',    coords:[ 9.9832,98.5472], type:'Forward Naval Station', vessels:'Fast patrol boats' },
      { name:'Sittwe Naval Station',      loc:'Sittwe, Rakhine State',     coords:[20.1328,92.8982], type:'Naval Station',         vessels:'Coastal patrol craft' },
    ],
  },

  // ── AIR FORCE ─────────────────────────────────────────────────
  airForce: {
    name: 'Tatmadaw Lay', burmese: 'တပ်မတော် (လေ)',
    founded: 1947, personnel: 15000,

    commands: [
      { name:'Air Operations Command 1 (AOC-1)', hq:'Meiktila Air Base',        area:'Central & Northern Myanmar', coords:[20.6646,95.9254] },
      { name:'Air Operations Command 2 (AOC-2)', hq:'Hmawbi Air Base (Yangon)', area:'Southern Myanmar, Yangon',   coords:[17.2367,95.9622] },
      { name:'Air Operations Command 3 (AOC-3)', hq:'Naypyidaw Air Base',       area:'Eastern Myanmar, Shan State',coords:[19.6233,96.1791] },
    ],

    aircraft: [
      { type:'Sukhoi Su-30SME Flanker-H', role:'Multirole Fighter', origin:'Russia', qty:6, acquired:'2022–2024', status:'Active', bases:['Naypyidaw'], engine:'2× AL-31FP (123kN)', speed:'Mach 2.0', range:'3,000 km', price:'~$66M/unit', notes:'Most capable aircraft in inventory; $400M contract signed 2018; delivered in pairs Dec 2022, Dec 2023, Dec 2024', img:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj4Fyv3UyqRrnFBSAg4hDXKPWT-V5nFArZnSqShC6F3vaUMBN2Z_rGnDw_2dLGDNPrkfrxRo_g3JtN1mFbHLToEJLQnE59p_AovbG4g18J8VsPvjKjvadgislOJixJtSOsqWZ88G_5DbPQ/s1600/71042_1573703280.jpg', roleClass:'role-fighter' },
      { type:'MiG-29B/UB Fulcrum',  role:'Fighter', origin:'Russia/Belarus', qty:20, acquired:'2001–2011', status:'Active',  bases:['Meiktila','Hmawbi'],   engine:'2× RD-33',        speed:'Mach 2.25', range:'1,430 km', price:'~$35M/unit', notes:'Primary air superiority fighter; also 4 UB trainers', img:'https://upload.wikimedia.org/wikipedia/commons/f/fc/Myanmar_Air_Force_MiG-29_MRD.jpg', roleClass:'role-fighter' },
      { type:'Chengdu F-7M Airguard',role:'Fighter', origin:'China',          qty:30, acquired:'1991–2001', status:'Partial', bases:['Meiktila','Hmawbi','Mandalay'], engine:'WP-7B',  speed:'Mach 2.05', range:'1,100 km', price:'~$12M/unit', notes:'Aging; some airframes retired; FT-7 trainers included', img:'https://upload.wikimedia.org/wikipedia/commons/6/6b/Myanmar_Air_Force_Chengdu_F-7_MRD.jpg', roleClass:'role-fighter' },
      { type:'Yakovlev Yak-130',     role:'Trainer/Light Attack', origin:'Russia', qty:16, acquired:'2018–2021', status:'Active', bases:['Meiktila'], engine:'2× AI-222-25', speed:'1,060 km/h', range:'1,960 km', price:'~$20M/unit', notes:'Latest acquisition; serves as lead-in fighter trainer', img:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgEVftrK9BoP3bMcTc9gIwo62p6A3tUNffeonqVKi8PA1UX8A3oXQI2IYi0X06I5w9ybw5mNl_uMwsoRS4UX34bBlgyDsafNrBVp4-urqoAmaP56RkgbKzdTwQkOHBuUkR8MUfk4yP-FWnJ/s1600/Capture.JPG', roleClass:'role-trainer' },
      { type:'NAMC K-8 Karakorum',   role:'Trainer/Light Attack', origin:'China/Pakistan', qty:26, acquired:'2000–2010', status:'Active', bases:['Hmawbi','Meiktila'], engine:'TFE731-2A', speed:'800 km/h', range:'1,400 km', price:'~$6M/unit', notes:'Primary advanced jet trainer and light attack', img:'https://english.dvb.no/wp-content/uploads/2025/02/1738833225492.jpg', roleClass:'role-trainer' },
      { type:'Shaanxi Y-8 (AN-12)',  role:'Transport', origin:'China', qty:6, acquired:'1994–2000', status:'Active', bases:['Mingaladon','Meiktila'], engine:'4× WJ-6C turboprop', speed:'550 km/h', range:'5,620 km', price:'~$18M/unit', notes:'Primary medium transport aircraft', img:'https://upload.wikimedia.org/wikipedia/commons/a/aa/Myanmar_Air_Force_Shaanxi_Y-8_MRD.jpg', roleClass:'role-transport' },
      { type:'Pilatus PC-6 Porter',  role:'Transport', origin:'Switzerland', qty:14, acquired:'1965–1990', status:'Active', bases:['Various'], engine:'PT6A-27', speed:'263 km/h', range:'830 km', price:'~$0.8M/unit', notes:'STOL transport for remote area operations', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Pilatus_PC-6_Turbo_Porter.jpg?width=320', roleClass:'role-transport' },
      { type:'Beechcraft King Air 200',role:'Liaison/VIP', origin:'USA', qty:5, acquired:'1990s', status:'Active', bases:['Mingaladon','Naypyidaw'], engine:'2× PT6A-41', speed:'510 km/h', range:'2,700 km', price:'~$2M/unit', notes:'VIP and liaison transport', img:'https://commons.wikimedia.org/wiki/Special:FilePath/King_Air_200.jpg?width=320', roleClass:'role-transport' },
      { type:'Mil Mi-35 Hind-E',     role:'Attack Helicopter', origin:'Russia', qty:10, acquired:'2009–2016', status:'Active', bases:['Hmawbi','Meiktila'], engine:'2× TV3-117VMA', speed:'310 km/h', range:'460 km', price:'~$18M/unit', notes:'Primary attack helicopter; Shturm ATGM + 12.7mm gun', img:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhbZcJtYPV9fJpySNJqpqeyfyUasl5LpQsHhz8J5uBkeMJ8-ZB3DRe51jz4_WKkWiIVRblOdgeIRv74Q6Do8dfhw82aFJiCyDIhHS9BIW1Rk6XYqir0rJeKr31cPJ1o-j4XBJXMqEXzbP7L/s1600/22089968_1436656123057020_5096777926480027419_n.jpg', roleClass:'role-attack-helo' },
      { type:'Mil Mi-38', role:'Transport Helicopter', origin:'Russia', qty:3, acquired:'2022–present', status:'Active', bases:['Naypyidaw','Hmawbi'], engine:'2× TV7-117V', speed:'310 km/h', range:'1,000 km',price:'~$18M/unit', notes:'Max Payload: 6,000 kg (Internal) / 7,000 kg (External)',img:'https://vpk.name/file/img/myanma-poluchila-tri-vertoleta-mi-38t-nx2wn3w9-1762733161.t.jpg', roleClass:'role-transport-helo' },
      { type:'Mil Mi-17-1V Hip-H',   role:'Transport Helicopter', origin:'Russia', qty:12, acquired:'2008–2020', status:'Active', bases:['Hmawbi','Meiktila','Naypyidaw'], engine:'2× TV3-117MT', speed:'250 km/h', range:'950 km', price:'~$12M/unit', notes:'Primary transport helicopter; SAR capable', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Mi-17_helicopter.jpg?width=320', roleClass:'role-transport-helo' },
      { type:'Bell 212 Twin Huey',   role:'Utility Helicopter', origin:'Canada/USA', qty:8, acquired:'1980s', status:'Active', bases:['Hmawbi'], engine:'PT6T-3B (Pratt)', speed:'240 km/h', range:'440 km', price:'~$1.5M/unit', notes:'Utility, VIP and troop transport', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Bell_212_in_Flight.jpg?width=320', roleClass:'role-transport-helo' },
      { type:'PZL W-3A Sokół',       role:'Utility Helicopter', origin:'Poland', qty:10, acquired:'2000s', status:'Active', bases:['Various'], engine:'PZL-10W turboshaft', speed:'260 km/h', range:'745 km', price:'~$6M/unit', notes:'SAR, utility, and medevac operations', img:'https://commons.wikimedia.org/wiki/Special:FilePath/PZL-Swidnik_W-3_Sokol_Aerofair_2005.jpg?width=320', roleClass:'role-transport-helo' },
    ],

    bases: [
      { name:'Mingaladon Air Base',  loc:'Yangon (Rangoon)',        coords:[16.9073,96.1332], type:'Main Transport Base',    units:'Transport sqns, VIP airlift, IAF training' },
      { name:'Hmawbi Air Base',      loc:'Hmawbi, Yangon Region',   coords:[17.2367,95.9622], type:'Combat Air Base (AOC-2)',units:'F-7M, K-8, Mi-35, Mi-17 squadrons' },
      { name:'Meiktila Air Base',    loc:'Meiktila, Mandalay Rgn',  coords:[20.6646,95.9254], type:'Primary Combat Base (AOC-1)', units:'MiG-29, Yak-130, K-8 sqns; AOC-1 HQ' },
      { name:'Mandalay Air Base',    loc:'Mandalay',                coords:[21.7022,95.9779], type:'Secondary Air Base',    units:'F-7M sqn, transport' },
      { name:'Naypyidaw Air Base',   loc:'Naypyidaw (Capital)',     coords:[19.6233,96.1791], type:'Capital Air Base (AOC-3)', units:'VIP transport, AOC-3 HQ, K-8 sqn' },
      { name:'Myeik Air Base',       loc:'Myeik, Tanintharyi',      coords:[12.4395,98.5985], type:'Forward Air Base',      units:'F-7 detachment, patrol aircraft' },
      { name:'Sittwe Air Base',      loc:'Sittwe, Rakhine State',   coords:[20.1328,92.8982], type:'Regional Air Base',     units:'Transport, Y-8 aircraft' },
      { name:'Shante Air Base',      loc:'Shan State',              coords:[20.9000,96.9000], type:'Forward Air Base',      units:'Tactical detachment' },
    ],
  },

  // ── EQUIPMENT ─────────────────────────────────────────────────
  equipment: [
    // ARMOR
    { name:'T-72 Ural (variants)',    cat:'armor',     type:'Main Battle Tank',          origin:'Russia/Ukraine', qty:'~50',  status:'Active',  gun:'125mm 2A46M smoothbore', speed:'60 km/h', weight:'41.5t', crew:3,   yr:'2000s',      price:'~$2.5M/unit', img:'https://commons.wikimedia.org/wiki/Special:FilePath/T-72_Tampere.jpg?width=320', notes:'Primary heavy tank; T-72M1 variants' },
    { name:'Type 59 (WZ-120)',        cat:'armor',     type:'Main Battle Tank',          origin:'China',          qty:'~100', status:'Active',  gun:'100mm Type 59 rifled',   speed:'50 km/h', weight:'36t',   crew:4,   yr:'1970–1990s', price:'~$1.5M/unit', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Type59Tank.jpg?width=320', notes:'Bulk of tank force; aging fleet' },
    { name:'Type 69-IIG',             cat:'armor',     type:'Main Battle Tank',          origin:'China',          qty:'~10',  status:'Active',  gun:'100mm smoothbore',       speed:'50 km/h', weight:'36.7t', crew:4,   yr:'1990s',      price:'~$1.8M/unit', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Type_69_tank_3.jpg?width=320', notes:'Improved Type 59 derivative' },
    { name:'Al-Khalid / MBT-2000',   cat:'armor',     type:'Main Battle Tank',          origin:'China/Pakistan', qty:'~10',  status:'Active',  gun:'125mm smoothbore autoload',speed:'65 km/h',weight:'48t',  crew:3,   yr:'2010s',      price:'~$4M/unit',   img:'https://commons.wikimedia.org/wiki/Special:FilePath/Al-Khalid_MBT.jpg?width=320', notes:'Most modern MBT in inventory' },
    { name:'PT-76 (Amphibious)',      cat:'armor',     type:'Light Tank',                origin:'Russia',         qty:'~15',  status:'Limited', gun:'76.2mm D-56T',           speed:'44 km/h', weight:'14t',   crew:3,   yr:'1970s',      price:'~$0.5M/unit', img:'https://commons.wikimedia.org/wiki/Special:FilePath/PT-76_tank.jpg?width=320', notes:'Amphibious capability; aging' },
    { name:'Comet A34',               cat:'armor',     type:'Medium Tank',               origin:'UK',             qty:'~10',  status:'Limited', gun:'77mm HV QF',             speed:'51 km/h', weight:'35.7t', crew:5,   yr:'1950s',      price:'Heritage',    img:'https://commons.wikimedia.org/wiki/Special:FilePath/Comet_tank_Bovington.jpg?width=320', notes:'WWII-era; ceremonial/reserve' },
    { name:'BTR-3U Guardian',         cat:'armor',     type:'Armored Personnel Carrier', origin:'Ukraine',        qty:'~100', status:'Active',  gun:'30mm KBA cannon + PKT',  speed:'80 km/h', weight:'16.4t', crew:'3+8', yr:'2013–2022', price:'~$0.8M/unit', img:'https://commons.wikimedia.org/wiki/Special:FilePath/BTR-3_IFV.jpg?width=320', notes:'Primary APC; fully amphibious' },
    { name:'Type 85 APC',             cat:'armor',     type:'Armored Personnel Carrier', origin:'China',          qty:'~60',  status:'Active',  gun:'12.7mm HMG',             speed:'65 km/h', weight:'15t',   crew:'2+10', yr:'1990s',   price:'~$0.5M/unit', img:'https://commons.wikimedia.org/wiki/Special:FilePath/WZ551_APC.jpg?width=320', notes:'Standard infantry APC' },
    { name:'Humber Armored Car',      cat:'armor',     type:'Armored Car (Light)',        origin:'UK',             qty:'~20',  status:'Limited', gun:'7.7mm Bren',             speed:'72 km/h', weight:'6.8t',  crew:3,   yr:'1950s',      price:'Heritage',    img:'https://commons.wikimedia.org/wiki/Special:FilePath/Humber_Armoured_Car_Mk_IV.jpg?width=320', notes:'Historical; some in museum/reserve' },
    // ARTILLERY
    { name:'D-30 122mm Howitzer',     cat:'artillery', type:'122mm Towed Howitzer',      origin:'Russia',         qty:'~100', status:'Active',  range:'15.4 km',   weight:'3.2t',  crew:8, yr:'1970–90s', price:'~$200K/unit', img:'https://commons.wikimedia.org/wiki/Special:FilePath/D30-howitzer.jpg?width=320', notes:'Standard divisional howitzer' },
    { name:'M-101 105mm Howitzer',    cat:'artillery', type:'105mm Towed Howitzer',      origin:'USA',            qty:'~50',  status:'Active',  range:'11.3 km',   weight:'2.26t', crew:8, yr:'1950–60s', price:'~$150K/unit', img:'https://commons.wikimedia.org/wiki/Special:FilePath/M101_howitzer_Fort_Sill.jpg?width=320', notes:'Ex-US military aid era' },
    { name:'Type 54-1 Howitzer',      cat:'artillery', type:'122mm Towed Howitzer',      origin:'China',          qty:'~50',  status:'Active',  range:'17.2 km',   weight:'3.1t',  crew:8, yr:'1980–90s', price:'~$200K/unit', img:'https://commons.wikimedia.org/wiki/Special:FilePath/D30-howitzer.jpg?width=320', notes:'Chinese D-30 equivalent' },
    { name:'M-46 130mm Field Gun',    cat:'artillery', type:'130mm Towed Field Gun',     origin:'Russia',         qty:'~24',  status:'Active',  range:'27.5 km',   weight:'8.45t', crew:9, yr:'1990s',    price:'~$180K/unit', img:'https://commons.wikimedia.org/wiki/Special:FilePath/M-46_field_gun.jpg?width=320', notes:'Long-range field gun' },
    { name:'BM-21 Grad MLRS',         cat:'artillery', type:'122mm Multiple Rocket Sys.',origin:'Russia',         qty:'~12',  status:'Active',  range:'40 km',     weight:'13.7t', crew:3, yr:'1990s',    price:'~$1.5M/unit', img:'https://commons.wikimedia.org/wiki/Special:FilePath/BM-21_Grad_MLRS.jpg?width=320', notes:'40-round area saturation' },
    { name:'Type 63 MLRS',            cat:'artillery', type:'107mm Rocket Launcher',     origin:'China',          qty:'~24',  status:'Active',  range:'8.5 km',    weight:'1.5t',  crew:4, yr:'1980s',    price:'~$50K/unit',  img:'https://commons.wikimedia.org/wiki/Special:FilePath/Type_63_multiple_rocket_launcher.jpg?width=320', notes:'Portable man-portable MLRS' },
    // AIRCRAFT
    { name:'Sukhoi Su-30SME',         cat:'aircraft',  type:'Multirole Fighter (Heavy)',  origin:'Russia',         qty:6,    status:'Active',  price:'~$66M/unit', img:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj4Fyv3UyqRrnFBSAg4hDXKPWT-V5nFArZnSqShC6F3vaUMBN2Z_rGnDw_2dLGDNPrkfrxRo_g3JtN1mFbHLToEJLQnE59p_AovbG4g18J8VsPvjKjvadgislOJixJtSOsqWZ88G_5DbPQ/s1600/71042_1573703280.jpg', speed:'Mach 2.0', range:'3,000 km', notes:'Most capable; 12 hardpoints; $400M contract 2018; Naypyidaw AB' },
    { name:'MiG-29B/UB Fulcrum',      cat:'aircraft',  type:'Multirole Fighter',         origin:'Russia/Belarus', qty:'~20', status:'Active',  price:'~$35M/unit', img:'https://upload.wikimedia.org/wikipedia/commons/f/fc/Myanmar_Air_Force_MiG-29_MRD.jpg' },
    { name:'Chengdu F-7M Airguard',   cat:'aircraft',  type:'Fighter / Interceptor',     origin:'China',          qty:'~30', status:'Partial', price:'~$12M/unit', img:'https://upload.wikimedia.org/wikipedia/commons/6/6b/Myanmar_Air_Force_Chengdu_F-7_MRD.jpg', speed:'Mach 2.05', range:'1,100 km', notes:'Aging delta-wing fighter' },
    { name:'Yakovlev Yak-130',        cat:'aircraft',  type:'Advanced Trainer/Lt. Attack',origin:'Russia',        qty:'~16', status:'Active',  price:'~$20M/unit', img:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgEVftrK9BoP3bMcTc9gIwo62p6A3tUNffeonqVKi8PA1UX8A3oXQI2IYi0X06I5w9ybw5mNl_uMwsoRS4UX34bBlgyDsafNrBVp4-urqoAmaP56RkgbKzdTwQkOHBuUkR8MUfk4yP-FWnJ/s1600/Capture.JPG', speed:'1,060 km/h', range:'1,960 km', notes:'Newest combat aircraft' },
    { name:'NAMC K-8 Karakorum',      cat:'aircraft',  type:'Jet Trainer / Light Attack',origin:'China/Pakistan', qty:'~26', status:'Active',  price:'~$6M/unit',  img:'https://english.dvb.no/wp-content/uploads/2025/02/1738833225492.jpg', speed:'800 km/h', range:'1,400 km', notes:'Advanced trainer fleet' },
    { name:'Shaanxi Y-8 Transport',   cat:'aircraft',  type:'Medium Military Transport', origin:'China',          qty:'~6',  status:'Active',  price:'~$18M/unit', img:'https://upload.wikimedia.org/wikipedia/commons/a/aa/Myanmar_Air_Force_Shaanxi_Y-8_MRD.jpg', speed:'550 km/h', range:'5,620 km', notes:'Primary medium transport' },
    // HELICOPTERS
    { name:'Mil Mi-35 Hind-E',        cat:'helicopter',type:'Attack Helicopter',         origin:'Russia',         qty:'~10', status:'Active',  price:'~$18M/unit', img:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhbZcJtYPV9fJpySNJqpqeyfyUasl5LpQsHhz8J5uBkeMJ8-ZB3DRe51jz4_WKkWiIVRblOdgeIRv74Q6Do8dfhw82aFJiCyDIhHS9BIW1Rk6XYqir0rJeKr31cPJ1o-j4XBJXMqEXzbP7L/s1600/22089968_1436656123057020_5096777926480027419_n.jpg', speed:'310 km/h', range:'460 km', notes:'Armed with Shturm ATGMs, 12.7mm gun' },
    { name:'Mil Mi-38',        cat:'helicopter',type:'Transport Helicopter',         origin:'Russia',         qty:'3', status:'Active',  price:'~$18M/unit', img:'https://aerospaceglobalnews.com/wp-content/uploads/2025/11/Myanmar-Mi-38T-helicopter-1024x568.jpg', speed:'310 km/h', range:'1000 km', notes:'The cockpit is fully digital and equipped with night-capable flight-management systems' },
    { name:'Mil Mi-17-1V Hip',        cat:'helicopter',type:'Medium Transport Helicopter',origin:'Russia',        qty:'~12', status:'Active',  price:'~$12M/unit', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Mi-17_helicopter.jpg?width=320', speed:'250 km/h', range:'950 km', notes:'Troop lift, resupply, SAR' },
    { name:'Bell 212 Twin Huey',      cat:'helicopter',type:'Utility Helicopter',        origin:'Canada/USA',     qty:'~8',  status:'Active',  price:'~$1.5M/unit', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Bell_212_in_Flight.jpg?width=320', speed:'240 km/h', range:'440 km', notes:'VIP and utility transport' },
    { name:'PZL W-3A Sokół',          cat:'helicopter',type:'Utility / SAR Helicopter',  origin:'Poland',         qty:'~10', status:'Active',  price:'~$6M/unit',  img:'https://commons.wikimedia.org/wiki/Special:FilePath/PZL-Swidnik_W-3_Sokol_Aerofair_2005.jpg?width=320', speed:'260 km/h', range:'745 km', notes:'Search and rescue, utility' },
    // NAVAL
    { name:'UMS Aung Zeya (F-11)',    cat:'naval',     type:'Frigate',                   origin:'China',          qty:1,    status:'Active',  price:'~$250M/unit', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Jiangkai_II_class_frigate.jpg?width=320', notes:'Lead ship, 76mm OTO gun, HHQ-7 SAM', disp:'2,800t' },
    { name:'UMS Kyan Sittha (F-12)',  cat:'naval',     type:'Frigate',                   origin:'China',          qty:1,    status:'Active',  price:'~$250M/unit', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Jiangkai_II_class_frigate.jpg?width=320', notes:'Second frigate', disp:'2,800t' },
    { name:'UMS Mahar Bandula (F-13)',cat:'naval',     type:'Frigate',                   origin:'Myanmar',        qty:1,    status:'Active',  price:'~$200M/unit', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Jiangkai_II_class_frigate.jpg?width=320', notes:'First domestically-built frigate', disp:'2,800t' },
    { name:'UMS Mahar Thiha Thura',   cat:'naval',     type:'Corvette',                  origin:'Myanmar',        qty:1,    status:'Active',  price:'~$100M/unit', img:'https://commons.wikimedia.org/wiki/Special:FilePath/Corvette_Nanuchka.jpg?width=320', notes:'Rebuilt; 57mm + 40mm guns', disp:'1,900t' },
    { name:'Inlay-class PV',          cat:'naval',     type:'Patrol Vessel (Large)',      origin:'Myanmar',        qty:4,    status:'Active',  price:'~$30M/unit',  img:'https://commons.wikimedia.org/wiki/Special:FilePath/HTMS_Hua_Hin.jpg?width=320', notes:'Myanmar-built offshore patrol', disp:'800t' },
    { name:'Houxin-class FAC',        cat:'naval',     type:'Fast Attack Craft',         origin:'China',          qty:3,    status:'Active',  price:'~$25M/unit',  img:'https://commons.wikimedia.org/wiki/Special:FilePath/Houjian-class_missile_boat.jpg?width=320', notes:'Anti-ship missile capability', disp:'235t' },
    { name:'Yan Aung Myin-class PCE', cat:'naval',     type:'Patrol Craft (Escort)',     origin:'Myanmar',        qty:4,    status:'Active',  price:'~$20M/unit',  img:'https://commons.wikimedia.org/wiki/Special:FilePath/HTMS_Hua_Hin.jpg?width=320', notes:'Myanmar-built coastal patrol', disp:'550t' },
    { name:'Irrawaddy-class Gunboat', cat:'naval',     type:'River Gunboat',             origin:'Myanmar',        qty:3,    status:'Active',  price:'~$5M/unit',   img:'https://commons.wikimedia.org/wiki/Special:FilePath/PGM-39_gunboat.jpg?width=320', notes:'Inland waterway patrol', disp:'150t' },
  ],

  // ── ADMINISTRATION ────────────────────────────────────────────
  admin: {
    cinc: { name:'Senior General Min Aung Hlaing', rank:'Senior General', title:'Commander-in-Chief of Defence Services', since:'March 2011', notes:'Also Chairman, State Administration Council (SAC) since February 1, 2021 military coup d\'état' },
    dcinc:{ name:'Vice Senior General Soe Win',     rank:'Vice Senior General', title:'Deputy Commander-in-Chief of Defence Services' },
    services:[
      { branch:'Army',      title:"Commander-in-Chief (Army)",      rank:'General',  icon:'🪖' },
      { branch:'Navy',      title:"Commander-in-Chief (Navy)",      rank:'Admiral',  icon:'⚓' },
      { branch:'Air Force', title:"Commander-in-Chief (Air Force)", rank:'General',  icon:'✈' },
    ],
    ministry:{ name:'Ministry of Defence', minister:'Controlled by Tatmadaw under SAC' },
  },
};

// ═══════════════════════════════════════════════════════════════
// UTILITY HELPERS
// ═══════════════════════════════════════════════════════════════
const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];
const icon = { armor:'🛡️', artillery:'💥', aircraft:'✈️', helicopter:'🚁', naval:'⚓' };
const catLabel = { armor:'Armor', artillery:'Artillery', aircraft:'Aircraft', helicopter:'Helicopter', naval:'Naval' };

function statusBadge(s) {
  const cls = s==='Active'?'status-active':s==='Limited'||s==='Partial'?'status-limited':'status-reserve';
  return `<span class="status-badge ${cls}">${s}</span>`;
}
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ═══════════════════════════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════════════════════════
function initNav() {
  const navbar = $('#navbar');
  const toggle = $('#nav-toggle');
  const links  = $('#nav-links');

  toggle.addEventListener('click', () => links.classList.toggle('open'));
  document.addEventListener('click', e => { if(!navbar.contains(e.target)) links.classList.remove('open'); });

  window.addEventListener('scroll', () => {
    $$('.nav-links a').forEach(a => {
      const sec = document.getElementById(a.dataset.sec);
      if(!sec) return;
      const r = sec.getBoundingClientRect();
      a.classList.toggle('active', r.top <= 80 && r.bottom > 80);
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════════
function initTabs() {
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const container = btn.closest('.tab-container');
      $$('.tab-btn', container).forEach(b => b.classList.remove('active'));
      $$('.tab-content', container).forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const target = $(`#${btn.dataset.tab}`, container);
      if(target) target.classList.add('active');
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// RENDER ARMY — COMMANDS
// ═══════════════════════════════════════════════════════════════
function renderCommands() {
  const grid = $('#commands-grid');
  if(!grid) return;
  grid.innerHTML = T.army.regionalCommands.map((c, i) => `
    <div class="command-card reveal" onclick="openCommandModal('${c.id}')">
      <div class="command-card-header">
        <div class="cmd-insignia-wrap">
          ${c.insignia
            ? `<img src="${esc(c.insignia)}" class="cmd-insignia-img" alt="${esc(c.name)} insignia" referrerpolicy="no-referrer" onerror="this.style.display='none';document.getElementById('cmdfb${i}').style.display='flex'">`
            : ''}
          <div class="command-number" id="cmdfb${i}" ${c.insignia ? 'style="display:none"' : ''}>${esc(c.abbr)}</div>
        </div>
        <div>
          <div class="command-name">${esc(c.name)}</div>
          <div class="command-hq">📍 ${esc(c.hq)}</div>
        </div>
      </div>
      <div class="command-info">
        <div class="command-info-item"><span class="command-info-label">Region</span><span class="command-info-value">${esc(c.region)}</span></div>
        <div class="command-info-item"><span class="command-info-label">Personnel</span><span class="command-info-value">${esc(c.personnel)}</span></div>
        <div class="command-info-item"><span class="command-info-label">Est.</span><span class="command-info-value">${esc(c.established)}</span></div>
        <div class="command-info-item"><span class="command-info-label">MOCs</span><span class="command-info-value">${c.mocs.length}</span></div>
      </div>
      <div class="command-desc">${esc(c.desc)}</div>
      <div class="command-mocs">${c.mocs.map(m=>`<span class="command-moc-tag">${esc(m)}</span>`).join('')}</div>
    </div>`).join('');
}

// ═══════════════════════════════════════════════════════════════
// RENDER ARMY — LIDs
// ═══════════════════════════════════════════════════════════════
function renderLIDs() {
  const grid = $('#lids-grid');
  if(!grid) return;
  grid.innerHTML = T.army.lids.map((l, i) => `
    <div class="lid-card reveal" onclick="openLIDModal(${l.num})">
      <div class="lid-insignia-wrap">
        ${l.insignia
          ? `<img src="${esc(l.insignia)}" class="lid-insignia-img" alt="${esc(l.name)} insignia" referrerpolicy="no-referrer" onerror="this.style.display='none';document.getElementById('lidfb${i}').style.display='flex'">`
          : ''}
        <div class="lid-insignia-fb" id="lidfb${i}" ${l.insignia ? 'style="display:none"' : ''}>
          <span class="lid-fb-num">${l.num}</span>
          <span class="lid-fb-label">LID</span>
        </div>
      </div>
      <div class="lid-name">${esc(l.name)}</div>
      <div class="lid-location">📍 ${esc(l.loc)}</div>
      <div class="lid-command">${esc(l.cmd)}</div>
      <div class="lid-spec">${esc(l.spec)}</div>
      <div class="lid-info">
        <div class="lid-info-item"><span class="lid-info-label">Est.</span><span class="lid-info-value">${l.est}</span></div>
        <div class="lid-info-item"><span class="lid-info-label">Regiments</span><span class="lid-info-value">${l.regiments} LIR</span></div>
      </div>
    </div>`).join('');
}

// ═══════════════════════════════════════════════════════════════
// RENDER ARMY — MOCs TABLE
// ═══════════════════════════════════════════════════════════════
function renderMOCs() {
  const tbl = $('#mocs-tbody');
  if(!tbl) return;
  tbl.innerHTML = T.army.mocs.map(m => `
    <tr>
      <td><strong>MOC-${m.num}</strong></td>
      <td>${esc(m.loc)}</td>
      <td>${esc(m.cmd)}</td>
      <td>${esc(m.area)}</td>
      <td>${esc(m.battalions)}</td>
    </tr>`).join('');
}

// ═══════════════════════════════════════════════════════════════
// RENDER ARMY — OOCs
// ═══════════════════════════════════════════════════════════════
function renderOOCs() {
  const grid = $('#oocs-grid');
  if(!grid) return;
  const rmcIns = abbr => { const rc = T.army.regionalCommands.find(c=>c.abbr===abbr); return rc ? rc.insignia : ''; };
  grid.innerHTML = T.army.oocs.map((o, i) => {
    const fbId = 'oocfb' + i;
    const ins = rmcIns(o.cmdAbbr);
    return `
    <div class="lid-card reveal" onclick="openOOCModal(${o.num})">
      <div class="lid-insignia-wrap">
        ${ins ? `<img src="${esc(ins)}" class="lid-insignia-img" alt="${esc(o.cmdAbbr)} insignia" referrerpolicy="no-referrer" onerror="this.style.display='none';document.getElementById('${fbId}').style.display='flex'">` : ''}
        <div class="lid-insignia-fb" id="${fbId}" ${ins ? 'style="display:none"' : ''}>
          <span class="lid-fb-num">${o.num}</span>
          <span class="lid-fb-label">OOC</span>
        </div>
      </div>
      <div class="lid-name" style="font-size:0.78rem">${esc(o.abbr)}</div>
      <div class="lid-location">📍 ${esc(o.hqBurmese)}</div>
      <div class="lid-command">${esc(o.stateBurmese)}</div>
      <div class="lid-spec" style="font-size:0.72rem;color:var(--gold-dim)">${esc(o.cmdAbbr)}</div>
      <div class="lid-info">
        <div class="lid-info-item"><span class="lid-info-label">Parent</span><span class="lid-info-value">${esc(o.cmdAbbr)}</span></div>
        <div class="lid-info-item"><span class="lid-info-label">HQ</span><span class="lid-info-value">${esc(o.hq)}</span></div>
      </div>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════
// RENDER ARMY — RCHQs
// ═══════════════════════════════════════════════════════════════
function renderRCHQs() {
  const grid = $('#rchqs-grid');
  if(!grid) return;
  const rmcIns = abbr => { const rc = T.army.regionalCommands.find(c=>c.abbr===abbr); return rc ? rc.insignia : ''; };
  grid.innerHTML = T.army.rchqs.map((r, i) => {
    const fbId = 'rchqfb' + i;
    const ins = rmcIns(r.cmdAbbr);
    return `
    <div class="lid-card reveal" onclick="openRCHQModal('${r.id}')">
      <div class="lid-insignia-wrap">
        ${ins ? `<img src="${esc(ins)}" class="lid-insignia-img" alt="${esc(r.cmdAbbr)} insignia" referrerpolicy="no-referrer" onerror="this.style.display='none';document.getElementById('${fbId}').style.display='flex'">` : ''}
        <div class="lid-insignia-fb" id="${fbId}" ${ins ? 'style="display:none"' : ''}>
          <span class="lid-fb-num" style="font-size:0.65rem;line-height:1.2">${esc(r.hq)}</span>
          <span class="lid-fb-label">RCHQ</span>
        </div>
      </div>
      <div class="lid-name" style="font-size:0.78rem">${esc(r.abbr)}</div>
      <div class="lid-location">📍 ${esc(r.hqBurmese)}</div>
      <div class="lid-command">${esc(r.stateBurmese)}</div>
      <div class="lid-spec" style="font-size:0.72rem;color:var(--gold-dim)">${esc(r.cmdAbbr)}</div>
      <div class="lid-info">
        <div class="lid-info-item"><span class="lid-info-label">Parent</span><span class="lid-info-value">${esc(r.cmdAbbr)}</span></div>
        <div class="lid-info-item"><span class="lid-info-label">HQ</span><span class="lid-info-value">${esc(r.hq)}</span></div>
      </div>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════
// RENDER NAVY FLEET TABLE
// ═══════════════════════════════════════════════════════════════
function renderFleet() {
  const tbl = $('#fleet-tbody');
  if(!tbl) return;
  const typeClass = { Frigate:'type-frigate', Corvette:'type-corvette', 'Patrol Vessel (Large)':'type-patrol', 'Fast Attack Craft':'type-fac', 'River Gunboat':'type-river', Minesweeper:'type-mine', 'Replenishment Ship':'type-support', 'Patrol Craft (Escort)':'type-patrol' };
  tbl.innerHTML = T.navy.vessels.map(v => `
    <tr class="${typeClass[v.type]||''}">
      <td><strong>${esc(v.name)}</strong></td>
      <td>${esc(v.desig)}</td>
      <td>${esc(v.type)}</td>
      <td>${esc(v.cls)}</td>
      <td>${esc(v.disp)}</td>
      <td>${esc(v.built)}</td>
      <td>${v.yr}</td>
      <td>${statusBadge(v.status)}</td>
      <td>${v.crew}</td>
      <td style="font-size:0.75rem;max-width:180px">${esc(v.notes)}</td>
    </tr>`).join('');
}

// ═══════════════════════════════════════════════════════════════
// RENDER NAVY BASES
// ═══════════════════════════════════════════════════════════════
function renderNavyBases() {
  const grid = $('#navy-bases-grid');
  if(!grid) return;
  grid.innerHTML = `<div class="bases-grid">${T.navy.bases.map(b=>`
    <div class="base-card">
      <div class="base-name">⚓ ${esc(b.name)}</div>
      <div class="base-location">📍 ${esc(b.loc)}</div>
      <div class="base-type">${esc(b.type)}</div>
      <div class="base-units">${esc(b.vessels)}</div>
    </div>`).join('')}</div>`;
}

// ═══════════════════════════════════════════════════════════════
// RENDER NAVY COMMANDS (overview tab)
// ═══════════════════════════════════════════════════════════════
function renderNavyOverview() {
  const el = $('#navy-overview-content');
  if(!el) return;
  el.innerHTML = `
    <div class="overview-grid">
      <div class="stats-panel">
        <div class="stat-row"><span class="stat-row-label">Full Name</span><span class="stat-row-value">Tatmadaw Yay</span></div>
        <div class="stat-row"><span class="stat-row-label">Burmese</span><span class="stat-row-value">တပ်မတော် (ရေ)</span></div>
        <div class="stat-row"><span class="stat-row-label">Founded</span><span class="stat-row-value">1948</span></div>
        <div class="stat-row"><span class="stat-row-label">Personnel</span><span class="stat-row-value">~16,000</span></div>
        <div class="stat-row"><span class="stat-row-label">Commands</span><span class="stat-row-value">3 Naval Operations Commands</span></div>
        <div class="stat-row"><span class="stat-row-label">Frigates</span><span class="stat-row-value">3 active</span></div>
        <div class="stat-row"><span class="stat-row-label">Corvettes</span><span class="stat-row-value">1 active</span></div>
        <div class="stat-row"><span class="stat-row-label">Patrol Vessels</span><span class="stat-row-value">20+</span></div>
        <div class="stat-row"><span class="stat-row-label">Naval Bases</span><span class="stat-row-value">7 (3 main + 4 stations)</span></div>
      </div>
      <div class="info-panel">
        <h4>Naval Operations Commands</h4>
        <div class="commands-list">${T.navy.commands.map(c=>`
          <div class="cmd-item">
            <div class="cmd-icon">⚓</div>
            <div>
              <div class="cmd-name">${esc(c.name)}</div>
              <div class="cmd-detail">📍 ${esc(c.hq)} — ${esc(c.area)}</div>
            </div>
          </div>`).join('')}
        </div>
        <h4 style="margin-top:1.25rem">Key Capabilities</h4>
        <ul class="info-list">
          <li>Surface combatant operations in territorial waters</li>
          <li>Coastal and offshore patrol in the Andaman Sea and Bay of Bengal</li>
          <li>River and inland waterway patrol across major river systems</li>
          <li>Domestic frigate construction capability (Myanmar Shipyard)</li>
          <li>Anti-piracy and maritime security operations</li>
          <li>Amphibious support for ground forces</li>
        </ul>
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════
// RENDER AIR FORCE TABLE
// ═══════════════════════════════════════════════════════════════
function renderAirForce() {
  const tbl = $('#aircraft-tbody');
  if(!tbl) return;
  tbl.innerHTML = T.airForce.aircraft.map((a, idx) => `
    <tr class="${a.roleClass||''}" onclick="openAircraftModal(${idx})" title="Click for full details & specifications">
      <td style="padding:0.4rem 0.75rem">
        <div style="display:flex;align-items:center;gap:0.6rem">
          ${a.img
            ? `<img src="${esc(a.img)}" class="ac-img-thumb" alt="${esc(a.type)}" onerror="this.style.display='none'">`
            : `<div class="ac-placeholder">✈</div>`}
          <strong style="font-size:0.82rem;line-height:1.3">${esc(a.type)}</strong>
        </div>
      </td>
      <td>${esc(a.role)}</td>
      <td>${esc(a.origin)}</td>
      <td style="text-align:center;font-weight:700;color:var(--gold2)">${a.qty}</td>
      <td>${esc(a.acquired)}</td>
      <td>${statusBadge(a.status)}</td>
      <td style="font-size:0.78rem">${esc(a.bases.join(', '))}</td>
      <td>${esc(a.speed)}</td>
      <td>${esc(a.range)}</td>
      <td style="color:var(--gold2);font-weight:600;font-size:0.8rem;white-space:nowrap">${a.price || '—'}</td>
      <td style="font-size:0.75rem;max-width:160px;color:var(--txt2)">${esc(a.notes)}</td>
    </tr>`).join('');
}

function renderAirBases() {
  const grid = $('#air-bases-grid');
  if(!grid) return;
  grid.innerHTML = `<div class="bases-grid">${T.airForce.bases.map(b=>`
    <div class="base-card">
      <div class="base-name">✈ ${esc(b.name)}</div>
      <div class="base-location">📍 ${esc(b.loc)}</div>
      <div class="base-type">${esc(b.type)}</div>
      <div class="base-units">${esc(b.units)}</div>
    </div>`).join('')}</div>`;
}

function renderAirOverview() {
  const el = $('#air-overview-content');
  if(!el) return;
  el.innerHTML = `
    <div class="overview-grid">
      <div class="stats-panel">
        <div class="stat-row"><span class="stat-row-label">Full Name</span><span class="stat-row-value">Tatmadaw Lay</span></div>
        <div class="stat-row"><span class="stat-row-label">Burmese</span><span class="stat-row-value">တပ်မတော် (လေ)</span></div>
        <div class="stat-row"><span class="stat-row-label">Founded</span><span class="stat-row-value">1947</span></div>
        <div class="stat-row"><span class="stat-row-label">Personnel</span><span class="stat-row-value">~15,000</span></div>
        <div class="stat-row"><span class="stat-row-label">Commands</span><span class="stat-row-value">3 Air Operations Commands</span></div>
        <div class="stat-row"><span class="stat-row-label">Fixed Wing</span><span class="stat-row-value">~100 aircraft</span></div>
        <div class="stat-row"><span class="stat-row-label">Rotary Wing</span><span class="stat-row-value">~40 helicopters</span></div>
        <div class="stat-row"><span class="stat-row-label">Air Bases</span><span class="stat-row-value">8 major bases</span></div>
        <div class="stat-row"><span class="stat-row-label">Main Fighter</span><span class="stat-row-value">MiG-29 Fulcrum</span></div>
      </div>
      <div class="info-panel">
        <h4>Air Operations Commands</h4>
        <div class="commands-list">${T.airForce.commands.map(c=>`
          <div class="cmd-item">
            <div class="cmd-icon">✈</div>
            <div>
              <div class="cmd-name">${esc(c.name)}</div>
              <div class="cmd-detail">📍 ${esc(c.hq)} — ${esc(c.area)}</div>
            </div>
          </div>`).join('')}
        </div>
        <h4 style="margin-top:1.25rem">Key Capabilities</h4>
        <ul class="info-list">
          <li>Air superiority with MiG-29 Fulcrum fighters</li>
          <li>Ground attack and close air support (Yak-130, K-8)</li>
          <li>Armed helicopter operations (Mi-35 Hind)</li>
          <li>Strategic and tactical airlift (Y-8, Mi-17)</li>
          <li>Pilot training and force development pipeline</li>
          <li>Air defence radar network coverage</li>
        </ul>
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════
// RENDER EQUIPMENT GALLERY
// ═══════════════════════════════════════════════════════════════
function renderEquipment(filter='all') {
  const grid = $('#equipment-grid');
  if(!grid) return;
  const items = filter==='all' ? T.equipment : T.equipment.filter(e=>e.cat===filter);
  grid.innerHTML = items.map((e, i) => {
    const pid = 'eqph' + i;
    return `
    <div class="equip-card" onclick="openEquipModal(this)" data-name="${esc(e.name)}">
      <div class="equip-img-wrap">
        ${e.img
          ? `<img src="${esc(e.img)}" alt="${esc(e.name)}" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:contain;padding:0.5rem" onerror="this.style.display='none';var ph=document.getElementById('${pid}');if(ph)ph.style.display='flex';">`
          : ''}
        <div class="equip-img-placeholder" id="${pid}" ${e.img ? 'style="display:none"' : ''}><span>${icon[e.cat]||'🔫'}</span><span>${catLabel[e.cat]||''}</span></div>
        <span class="equip-cat-badge cat-${e.cat}">${catLabel[e.cat]||e.cat}</span>
      </div>
      <div class="equip-body">
        <div class="equip-name">${esc(e.name)}</div>
        <div class="equip-type">${esc(e.type)}</div>
        <div class="equip-specs">
          ${e.speed ? `<div class="equip-spec"><span class="equip-spec-label">Speed</span><span class="equip-spec-val">${esc(e.speed)}</span></div>` : ''}
          ${e.range ? `<div class="equip-spec"><span class="equip-spec-label">Range</span><span class="equip-spec-val">${esc(e.range)}</span></div>` : ''}
          ${e.gun   ? `<div class="equip-spec"><span class="equip-spec-label">Main Gun</span><span class="equip-spec-val">${esc(e.gun)}</span></div>` : ''}
          ${e.disp  ? `<div class="equip-spec"><span class="equip-spec-label">Displacement</span><span class="equip-spec-val">${esc(e.disp)}</span></div>` : ''}
        </div>
        <div class="equip-footer">
          <span class="equip-qty">Qty: ${esc(String(e.qty))}</span>
          ${e.price ? `<span style="font-size:0.72rem;color:var(--gold2);font-weight:600">${esc(e.price)}</span>` : ''}
        </div>
        ${e.notes ? `<div class="equip-notes">${esc(e.notes)}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

function initEquipmentFilters() {
  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderEquipment(btn.dataset.filter);
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// RENDER ADMINISTRATION / ORG CHART
// ═══════════════════════════════════════════════════════════════
function renderAdmin() {
  const el = $('#admin-content');
  if(!el) return;
  el.innerHTML = `
    <div class="admin-grid">
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-rank-badge">★</div>
          <div>
            <div class="admin-title">Commander-in-Chief of Defence Services</div>
            <div class="admin-name">${esc(T.admin.cinc.name)}</div>
            <div class="admin-rank">${esc(T.admin.cinc.rank)}</div>
          </div>
        </div>
        <ul class="info-list">
          <li>Appointed: ${esc(T.admin.cinc.since)}</li>
          <li>${esc(T.admin.cinc.notes)}</li>
        </ul>
      </div>
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-rank-badge">☆</div>
          <div>
            <div class="admin-title">Deputy Commander-in-Chief</div>
            <div class="admin-name">${esc(T.admin.dcinc.name)}</div>
            <div class="admin-rank">${esc(T.admin.dcinc.rank)}</div>
          </div>
        </div>
        <ul class="info-list">
          <li>Second in command of all three services</li>
          <li>Deputises for C-in-C in all matters</li>
        </ul>
      </div>
    </div>
    <div class="admin-grid" style="grid-template-columns:repeat(3,1fr)">
      ${T.admin.services.map(s=>`
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-rank-badge">${s.icon}</div>
          <div>
            <div class="admin-title">${esc(s.title)}</div>
            <div class="admin-name">${s.branch} Commander</div>
            <div class="admin-rank">${esc(s.rank)}</div>
          </div>
        </div>
      </div>`).join('')}
    </div>
    <div style="margin-top:2rem">
      <h4 style="font-family:'Rajdhani',sans-serif;color:var(--gold2);margin-bottom:1.25rem;font-size:1.1rem">Command Structure — Org Chart</h4>
      <div style="overflow-x:auto;padding-bottom:1rem">
        <div style="min-width:900px">
          <div style="display:flex;flex-direction:column;align-items:center;gap:0">
            <!-- Top node -->
            <div class="org-node-box top" style="min-width:260px">
              <div class="org-node-title">Senior General Min Aung Hlaing</div>
              <div class="org-node-subtitle">Commander-in-Chief of Defence Services<br>Chairman, State Administration Council</div>
            </div>
            <div class="org-connector"></div>
            <div class="org-node-box deputy" style="min-width:240px">
              <div class="org-node-title">Vice Sr. General Soe Win</div>
              <div class="org-node-subtitle">Deputy Commander-in-Chief</div>
            </div>
            <div class="org-connector"></div>
            <!-- Three branches -->
            <div style="display:flex;gap:2rem;position:relative;align-items:flex-start;justify-content:center;width:100%">
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:0">
                <div class="org-node-box army-branch" style="width:100%;max-width:260px;text-align:center">
                  <div class="org-node-title">🪖 General</div>
                  <div class="org-node-subtitle">Commander-in-Chief (Army)<br>Tatmadaw Kyi</div>
                </div>
                <div class="org-connector"></div>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.4rem;width:100%">
                  ${T.army.regionalCommands.map(c=>`<div class="org-node-box" style="font-size:0.7rem;padding:0.5rem;text-align:center;border-color:#2d5a3d"><div style="font-weight:700;color:var(--txt)">${c.abbr}</div><div style="color:var(--txt3);font-size:0.62rem">${c.hq}</div></div>`).join('')}
                </div>
              </div>
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:0">
                <div class="org-node-box navy-branch" style="width:100%;max-width:260px;text-align:center">
                  <div class="org-node-title">⚓ Admiral</div>
                  <div class="org-node-subtitle">Commander-in-Chief (Navy)<br>Tatmadaw Yay</div>
                </div>
                <div class="org-connector"></div>
                <div style="display:grid;grid-template-columns:1fr;gap:0.4rem;width:100%">
                  ${T.navy.commands.map(c=>`<div class="org-node-box" style="font-size:0.7rem;padding:0.5rem;text-align:center;border-color:#1a3a6e"><div style="font-weight:700;color:var(--txt);font-size:0.75rem">${c.name.split(' (')[0]}</div><div style="color:var(--txt3);font-size:0.62rem">${c.hq}</div></div>`).join('')}
                </div>
              </div>
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:0">
                <div class="org-node-box air-branch" style="width:100%;max-width:260px;text-align:center">
                  <div class="org-node-title">✈ General</div>
                  <div class="org-node-subtitle">Commander-in-Chief (Air Force)<br>Tatmadaw Lay</div>
                </div>
                <div class="org-connector"></div>
                <div style="display:grid;grid-template-columns:1fr;gap:0.4rem;width:100%">
                  ${T.airForce.commands.map(c=>`<div class="org-node-box" style="font-size:0.7rem;padding:0.5rem;text-align:center;border-color:#6e3a1a"><div style="font-weight:700;color:var(--txt);font-size:0.75rem">${c.name.split(' (')[0]}</div><div style="color:var(--txt3);font-size:0.62rem">${c.hq}</div></div>`).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════
// INTERACTIVE MAP (Leaflet)
// ═══════════════════════════════════════════════════════════════
let map, layers = {};

function initMap() {
  map = L.map('myanmar-map', { center:[19.5,96.2], zoom:6, zoomControl:true });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution:'© OpenStreetMap contributors © CARTO',
    subdomains:'abcd', maxZoom:18
  }).addTo(map);

  const mkIcon = (color, letter, size=28) => L.divIcon({
    className:'',
    html:`<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.7);display:flex;align-items:center;justify-content:center;font-size:${size*0.4}px;font-weight:700;color:#fff;font-family:Rajdhani,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.5)">${letter}</div>`,
    iconSize:[size,size], iconAnchor:[size/2,size/2], popupAnchor:[0,-size/2]
  });

  const mkInsigniaIcon = (imgUrl, size=40) => L.divIcon({
    className:'',
    html:`<div style="width:${size}px;height:${size}px;background:#0b131c;border:1.5px solid rgba(255,255,255,0.32);border-radius:${Math.round(size*0.22)}px;overflow:hidden;box-shadow:0 3px 14px rgba(0,0,0,0.9)"><img src="${imgUrl}" style="width:100%;height:100%;object-fit:contain;padding:4px" referrerpolicy="no-referrer"></div>`,
    iconSize:[size,size], iconAnchor:[size/2,size/2], popupAnchor:[0,-size/2]
  });

  // Army commands layer
  layers.army = L.layerGroup();
  T.army.regionalCommands.forEach(c => {
    L.marker(c.coords, { icon: mkInsigniaIcon(c.insignia, 42) })
      .bindPopup(`<div class="popup-title">🪖 ${c.name}</div>
        <div style="text-align:center;margin:0.4rem 0"><img src="${c.insignia}" style="height:48px;object-fit:contain" referrerpolicy="no-referrer" onerror="this.style.display='none'"></div>
        <div class="popup-row"><span class="popup-label">HQ:</span>${c.hq}</div>
        <div class="popup-row"><span class="popup-label">Burmese:</span>${c.burmese}</div>
        <div class="popup-row"><span class="popup-label">Region:</span>${c.region}</div>
        <div class="popup-row"><span class="popup-label">Personnel:</span>${c.personnel}</div>
        <div class="popup-row"><span class="popup-label">OOCs:</span>${c.mocs.join(', ')}</div>
        <div class="popup-row" style="margin-top:0.5rem;font-size:0.75rem;color:#8a9ab2">${c.desc}</div>`)
      .addTo(layers.army);
  });

  // LIDs layer
  layers.lids = L.layerGroup();
  T.army.lids.forEach(l => {
    L.marker(l.coords, { icon: mkInsigniaIcon(l.insignia, 34) })
      .bindPopup(`<div class="popup-title">⭐ ${l.name}</div>
        <div style="text-align:center;margin:0.4rem 0"><img src="${l.insignia}" style="height:44px;object-fit:contain" referrerpolicy="no-referrer" onerror="this.style.display='none'"></div>
        <div class="popup-row"><span class="popup-label">Location:</span>${l.loc}</div>
        <div class="popup-row"><span class="popup-label">Command:</span>${l.cmd}</div>
        <div class="popup-row"><span class="popup-label">Specialization:</span>${l.spec}</div>
        <div class="popup-row"><span class="popup-label">Est.:</span>${l.est}</div>
        <div class="popup-row" style="margin-top:0.5rem;font-size:0.75rem;color:#8a9ab2">${l.desc ? l.desc.substring(0,120)+'…' : ''}</div>`)
      .addTo(layers.lids);
  });

  // Navy layer
  layers.navy = L.layerGroup();
  T.navy.bases.forEach(b => {
    L.marker(b.coords, { icon: mkIcon('#1a5aac','N',28) })
      .bindPopup(`<div class="popup-title">⚓ ${b.name}</div>
        <div class="popup-row"><span class="popup-label">Location:</span>${b.loc}</div>
        <div class="popup-row"><span class="popup-label">Type:</span>${b.type}</div>
        <div class="popup-row"><span class="popup-label">Vessels:</span>${b.vessels}</div>`)
      .addTo(layers.navy);
  });

  // Air Force layer
  layers.airForce = L.layerGroup();
  T.airForce.bases.forEach(b => {
    L.marker(b.coords, { icon: mkIcon('#8b3a1a','✈',28) })
      .bindPopup(`<div class="popup-title">✈ ${b.name}</div>
        <div class="popup-row"><span class="popup-label">Location:</span>${b.loc}</div>
        <div class="popup-row"><span class="popup-label">Type:</span>${b.type}</div>
        <div class="popup-row"><span class="popup-label">Units:</span>${b.units}</div>`)
      .addTo(layers.airForce);
  });

  // Conflict zones layer
  layers.conflicts = L.layerGroup();
  const conflictZones = [
    { name:'Sagaing Region', coords:[22.2,94.9], r:130000, intensity:'high',   actors:'PDF vs Tatmadaw — heavy airstrikes, village burnings reported' },
    { name:'Chin State',     coords:[22.1,93.5], r:80000,  intensity:'high',   actors:'Chinland Defence Force (CDF) — controls significant territory' },
    { name:'Kachin State',   coords:[25.5,97.2], r:100000, intensity:'medium', actors:'KIA (Kachin Independence Army) — recaptured Hpakant, Indaw' },
    { name:'N. Shan State',  coords:[23.2,97.8], r:110000, intensity:'high',   actors:'3 Brotherhood Alliance — Operation 1027; captured Lashio, Hsipaw' },
    { name:'Karen/Kayin St.',coords:[18.2,97.2], r:80000,  intensity:'medium', actors:'KNU/KNLA + PDF — active border operations, ongoing clashes' },
    { name:'Rakhine State',  coords:[20.3,93.0], r:120000, intensity:'high',   actors:'Arakan Army (AA) — controls most of Rakhine State' },
    { name:'Kayah State',    coords:[19.4,97.4], r:55000,  intensity:'medium', actors:'KNPP (Karenni Army) + PDF — significant territorial control' },
    { name:'Mon State',      coords:[16.5,97.6], r:50000,  intensity:'low',    actors:'MNLA — sporadic border operations' },
  ];
  const iColors = { high:'#e83333', medium:'#f5a623', low:'#f5d623' };
  conflictZones.forEach(z => {
    L.circle(z.coords, {
      radius: z.r, color: iColors[z.intensity],
      fillColor: iColors[z.intensity], fillOpacity: 0.13,
      weight: 1.5, dashArray: z.intensity==='high' ? null : '6,4'
    }).bindPopup(`
      <div style="min-width:200px">
        <div style="font-weight:700;font-size:0.9rem;color:${iColors[z.intensity]};margin-bottom:0.3rem">${z.name}</div>
        <span style="display:inline-block;padding:0.15rem 0.5rem;background:${iColors[z.intensity]}22;border:1px solid ${iColors[z.intensity]}55;border-radius:3px;font-size:0.68rem;color:${iColors[z.intensity]};margin-bottom:0.5rem;font-weight:700;letter-spacing:0.05em">${z.intensity.toUpperCase()} INTENSITY</span>
        <p style="font-size:0.76rem;color:#8a9ab2;line-height:1.5;margin:0">${z.actors}</p>
      </div>`).addTo(layers.conflicts);
  });

  // Add all layers by default
  Object.values(layers).forEach(l => l.addTo(map));

  // Map controls
  $$('.map-ctrl').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const key = btn.dataset.layer;
      const lyr = layers[key] || layers[key === 'airforce' ? 'airForce' : key];
      if(!lyr) return;
      if(map.hasLayer(lyr)) map.removeLayer(lyr);
      else lyr.addTo(map);
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// CHARTS (Chart.js)
// ═══════════════════════════════════════════════════════════════
function initCharts() {
  Chart.defaults.color = '#8a9ab2';
  Chart.defaults.borderColor = '#1e2e3e';
  Chart.defaults.font.family = "'Exo 2', sans-serif";

  const gridOpts = { color:'rgba(30,46,62,0.6)', drawBorder:false };
  const tooltipOpts = {
    backgroundColor:'#131c24', borderColor:'#1e2e3e', borderWidth:1,
    titleColor:'#c8973b', bodyColor:'#8a9ab2', padding:10
  };

  // 1. Personnel Distribution
  new Chart($('#chart-personnel'), {
    type:'doughnut',
    data:{
      labels:['Army (Tatmadaw Kyi)','Navy (Tatmadaw Yay)','Air Force (Tatmadaw Lay)'],
      datasets:[{ data:[325000,16000,15000], backgroundColor:['#2d5a3d','#1a3a6e','#6e3a1a'], borderColor:['#3d8c52','#2a5aac','#c0652a'], borderWidth:2 }]
    },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', labels:{ padding:16, font:{ size:11 } } }, tooltip:{ callbacks:{ label: ctx => ` ${ctx.label}: ${ctx.raw.toLocaleString()} personnel` }, ...tooltipOpts } } }
  });

  // 2. Aircraft Inventory by Role
  const roleMap = {};
  T.airForce.aircraft.forEach(a => { roleMap[a.role] = (roleMap[a.role]||0)+a.qty; });
  new Chart($('#chart-aircraft'), {
    type:'bar',
    data:{
      labels: Object.keys(roleMap),
      datasets:[{ label:'Aircraft', data:Object.values(roleMap), backgroundColor:['#8b1a1a','#8b1a1a','#c0652a','#c0652a','#4a5a3a','#4a5a3a','#3a3a6a','#3a3a6a','#6a3a6a','#6a3a6a','#4a6a4a'], borderColor:'transparent', borderRadius:4 }]
    },
    options:{ responsive:true, maintainAspectRatio:false, indexAxis:'y', plugins:{ legend:{display:false}, tooltip:tooltipOpts }, scales:{ x:{ grid:gridOpts }, y:{ grid:gridOpts, ticks:{ font:{size:10} } } } }
  });

  // 3. Naval Fleet Composition
  const fleetCats = {};
  T.navy.vessels.forEach(v => { fleetCats[v.type]=(fleetCats[v.type]||0)+1; });
  new Chart($('#chart-naval'), {
    type:'polarArea',
    data:{
      labels:Object.keys(fleetCats),
      datasets:[{ data:Object.values(fleetCats), backgroundColor:['rgba(26,90,172,0.7)','rgba(26,72,140,0.7)','rgba(26,58,110,0.7)','rgba(26,44,80,0.7)','rgba(40,60,100,0.7)','rgba(60,80,120,0.7)','rgba(80,100,140,0.7)'], borderColor:'#1e3a6e', borderWidth:1 }]
    },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'right', labels:{ padding:10, font:{size:10} } }, tooltip:tooltipOpts } }
  });

  // 4. Ground Equipment Distribution
  new Chart($('#chart-ground'), {
    type:'bar',
    data:{
      labels:['MBTs (T-72)','MBTs (Type 59)','MBTs (Other)','APCs (BTR-3U)','APCs (Type 85)','D-30 Howitzer','BM-21 Grad','M-46 Gun'],
      datasets:[{ label:'Units', data:[50,100,30,100,60,100,12,24], backgroundColor:['#2d5a3d','#3d7a52','#4d8a62','#4a6a4a','#5a7a5a','#c0652a','#d0752a','#e0852a'], borderColor:'transparent', borderRadius:4 }]
    },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, tooltip:tooltipOpts }, scales:{ x:{ grid:gridOpts, ticks:{font:{size:10}} }, y:{ grid:gridOpts } } }
  });

  // 5. Regional Command Strength
  new Chart($('#chart-commands'), {
    type:'radar',
    data:{
      labels: T.army.regionalCommands.map(c=>c.abbr),
      datasets:[{
        label:'Personnel (×1000)',
        data: T.army.regionalCommands.map(c=>parseInt(c.personnel.replace(/[^0-9]/g,''))/1000),
        backgroundColor:'rgba(45,90,61,0.2)', borderColor:'#3d8c52', borderWidth:2,
        pointBackgroundColor:'#3d8c52', pointRadius:4
      }]
    },
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:tooltipOpts },
      scales:{ r:{ grid:{ color:'rgba(30,46,62,0.6)' }, ticks:{ display:false }, pointLabels:{ color:'#8a9ab2', font:{size:11} } } }
    }
  });

  // 6. Acquisition Timeline
  new Chart($('#chart-timeline'), {
    type:'line',
    data:{
      labels:['1940s','1950s','1960s','1970s','1980s','1990s','2000s','2010s','2020s'],
      datasets:[
        { label:'Army Equipment', data:[5,15,8,20,15,35,18,12,8], borderColor:'#3d8c52', backgroundColor:'rgba(45,90,61,0.1)', tension:0.4, fill:true, pointRadius:4, pointBackgroundColor:'#3d8c52' },
        { label:'Naval Vessels',  data:[2, 3,2, 4, 3, 8, 6, 3,2], borderColor:'#2a5aac', backgroundColor:'rgba(26,58,110,0.1)', tension:0.4, fill:true, pointRadius:4, pointBackgroundColor:'#2a5aac' },
        { label:'Aircraft',       data:[0, 4,6,10, 8,22,18,14,6], borderColor:'#c0652a', backgroundColor:'rgba(110,58,26,0.1)', tension:0.4, fill:true, pointRadius:4, pointBackgroundColor:'#c0652a' },
      ]
    },
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ position:'bottom', labels:{ padding:12, font:{size:11} } }, tooltip:tooltipOpts },
      scales:{ x:{ grid:gridOpts }, y:{ grid:gridOpts, title:{ display:true, text:'Acquisitions (approx.)', color:'#8a9ab2' } } }
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════════════════════
function openCommandModal(id) {
  const c = T.army.regionalCommands.find(x=>x.id===id);
  if(!c) return;
  showModal(`${c.name}`, c.burmese, `
    <div class="modal-section">
      <div class="modal-section-title">Command Details</div>
      <div class="modal-details">
        <div class="modal-detail"><span class="modal-detail-label">Headquarters</span><span class="modal-detail-value">📍 ${esc(c.hq)}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Region</span><span class="modal-detail-value">${esc(c.region)}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Personnel</span><span class="modal-detail-value">${esc(c.personnel)}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Established</span><span class="modal-detail-value">${c.established}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Abbreviation</span><span class="modal-detail-value">${c.abbr}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Area of Ops</span><span class="modal-detail-value">${esc(c.area)}</span></div>
      </div>
    </div>
    <div class="modal-section">
      <div class="modal-section-title">Subordinate MOCs</div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">${c.mocs.map(m=>`<span class="command-moc-tag">${esc(m)}</span>`).join('')}</div>
    </div>
    <div class="modal-section">
      <div class="modal-section-title">Description</div>
      <p style="font-size:0.85rem;color:var(--txt2);line-height:1.7">${esc(c.desc)}</p>
    </div>
    <div class="modal-section">
      <div class="modal-section-title">Coordinates</div>
      <p style="font-size:0.82rem;color:var(--txt3)">${c.coords[0].toFixed(4)}°N, ${c.coords[1].toFixed(4)}°E</p>
    </div>`);
}

function openLIDModal(num) {
  const l = T.army.lids.find(x=>x.num===num);
  if(!l) return;
  showModal(`${l.num}th Light Infantry Division`, l.name, `
    <div class="modal-section">
      <div class="modal-section-title">Unit Details</div>
      <div class="modal-details">
        <div class="modal-detail"><span class="modal-detail-label">Location</span><span class="modal-detail-value">📍 ${esc(l.loc)}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Command</span><span class="modal-detail-value">${esc(l.cmd)}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Established</span><span class="modal-detail-value">${l.est}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Regiments</span><span class="modal-detail-value">${l.regiments} Light Infantry Regiments</span></div>
      </div>
    </div>
    <div class="modal-section">
      <div class="modal-section-title">Specialization</div>
      <p style="font-size:0.9rem;color:var(--gold2)">${esc(l.spec)}</p>
    </div>
    ${l.desc ? `<div class="modal-section"><div class="modal-section-title">Unit History & Notes</div><p style="font-size:0.85rem;color:var(--txt2);line-height:1.7">${esc(l.desc)}</p></div>` : ''}
    <div class="modal-section">
      <div class="modal-section-title">ခြေမြန်တပ်မ — About LIDs</div>
      <p style="font-size:0.85rem;color:var(--txt2);line-height:1.7">ခြေမြန်တပ်မ (LID) သည် မြန်မာ့တပ်မတော် (ကြည်း) ၏ အဓိကတိုက်ခိုက်ရေးနှင့် ခြေလျင်တပ်များဖြစ်သည်။ ပြည်တွင်းပုန်ကန်မှုများ စတင်ပေါ်ပေါက်လာချိန်မှစ၍ ဒေသအသီးသီးသို့ လွယ်ကူလျင်မြန်စွာ ရွှေ့ပြောင်းစစ်ဆင်နိုင်ရန်အတွက် ဖွဲ့စည်းခဲ့ခြင်းဖြစ်သည်။ Each LID consists of ~10 Light Infantry Regiments (LIRs), each comprising multiple Light Infantry Battalions (LIBs).</p>
    </div>`);
}

function openOOCModal(num) {
  const o = T.army.oocs.find(x=>x.num===num);
  if(!o) return;
  showModal(`OOC-${o.num}`, o.abbr, `
    <div class="modal-section">
      <div class="modal-section-title">စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ် — Operations Command</div>
      <div class="modal-details">
        <div class="modal-detail"><span class="modal-detail-label">Burmese Name</span><span class="modal-detail-value">${esc(o.burmese)}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Headquarters</span><span class="modal-detail-value">📍 ${esc(o.hq)} (${esc(o.hqBurmese)})</span></div>
        <div class="modal-detail"><span class="modal-detail-label">State / Region</span><span class="modal-detail-value">${esc(o.state)} · ${esc(o.stateBurmese)}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Parent Command</span><span class="modal-detail-value">${esc(o.cmd)} (${esc(o.cmdAbbr)})</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Coordinates</span><span class="modal-detail-value">${o.coords[0].toFixed(4)}°N, ${o.coords[1].toFixed(4)}°E</span></div>
      </div>
    </div>
    <div class="modal-section">
      <div class="modal-section-title">About Operations Commands (OOCs)</div>
      <p style="font-size:0.85rem;color:var(--txt2);line-height:1.7">Operations Commands (စစ်ဆင်ရေးကွပ်ကဲမှုဌာနချုပ် — စကခ) are division-level formations transformed for flexible offensive operations. Unlike territorial commands, OOCs have no fixed operational zone — they are redeployed based on enemy strength and mission requirements, under direct command of the Commander-in-Chief (Army/Operations). No OOC-11 exists; OOC-21 is the active formation in the Kachin northern sector.</p>
    </div>`);
}

function openRCHQModal(id) {
  const r = T.army.rchqs.find(x=>x.id===id);
  if(!r) return;
  showModal(r.abbr, r.burmese, `
    <div class="modal-section">
      <div class="modal-section-title">ဒေသကွပ်ကဲမှုစစ်ဌာနချုပ် — Regional Control HQ</div>
      <div class="modal-details">
        <div class="modal-detail"><span class="modal-detail-label">Burmese Name</span><span class="modal-detail-value">${esc(r.burmese)}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Headquarters</span><span class="modal-detail-value">📍 ${esc(r.hq)} (${esc(r.hqBurmese)})</span></div>
        <div class="modal-detail"><span class="modal-detail-label">State / Region</span><span class="modal-detail-value">${esc(r.state)} · ${esc(r.stateBurmese)}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Parent Command</span><span class="modal-detail-value">${esc(r.cmd)} (${esc(r.cmdAbbr)})</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Coordinates</span><span class="modal-detail-value">${r.coords[0].toFixed(4)}°N, ${r.coords[1].toFixed(4)}°E</span></div>
      </div>
    </div>
    <div class="modal-section">
      <div class="modal-section-title">About Regional Control HQs (RCHQs)</div>
      <p style="font-size:0.85rem;color:var(--txt2);line-height:1.7">Regional Control Headquarters (ဒေသကွပ်ကဲမှုစစ်ဌာနချုပ် — ဒကစ) are assigned to frontier areas and remote locations far from the regional capital. They hold administrative authority, judicial authority, and supply authority within their area. The RCHQ commander reports military staff matters to the Regional Military Commander, and holds a rank slightly below that of a Division/OOC commander.</p>
    </div>`);
}

function openEquipModal(el) {
  const name = el.dataset.name;
  const e = T.equipment.find(x=>x.name===name);
  if(!e) return;
  showModal(e.name, `${e.type} · ${e.origin}`, `
    ${e.img ? `<div style="margin-bottom:1.25rem;border-radius:8px;overflow:hidden;height:200px;background:#0d1117"><img src="${esc(e.img)}" style="width:100%;height:100%;object-fit:contain;padding:0.5rem" alt="${esc(e.name)}" onerror="this.parentElement.style.display='none'"></div>` : ''}
    <div class="modal-section">
      <div class="modal-section-title">Specifications & Cost</div>
      <div class="modal-details">
        <div class="modal-detail"><span class="modal-detail-label">Category</span><span class="modal-detail-value">${catLabel[e.cat]||e.cat}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Country of Origin</span><span class="modal-detail-value">${esc(e.origin)}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Quantity</span><span class="modal-detail-value">${esc(String(e.qty))}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Est. Unit Cost</span><span class="modal-detail-value" style="color:var(--gold2);font-weight:600">${e.price || 'N/A'}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Status</span>${statusBadge(e.status)}</div>
        ${e.gun   ? `<div class="modal-detail"><span class="modal-detail-label">Main Gun</span><span class="modal-detail-value">${esc(e.gun)}</span></div>` : ''}
        ${e.speed ? `<div class="modal-detail"><span class="modal-detail-label">Speed</span><span class="modal-detail-value">${esc(e.speed)}</span></div>` : ''}
        ${e.range ? `<div class="modal-detail"><span class="modal-detail-label">Range</span><span class="modal-detail-value">${esc(e.range)}</span></div>` : ''}
        ${e.weight? `<div class="modal-detail"><span class="modal-detail-label">Weight</span><span class="modal-detail-value">${esc(e.weight)}</span></div>` : ''}
        ${e.crew  ? `<div class="modal-detail"><span class="modal-detail-label">Crew</span><span class="modal-detail-value">${esc(String(e.crew))}</span></div>` : ''}
        ${e.disp  ? `<div class="modal-detail"><span class="modal-detail-label">Displacement</span><span class="modal-detail-value">${esc(e.disp)}</span></div>` : ''}
        ${e.yr    ? `<div class="modal-detail"><span class="modal-detail-label">Acquired</span><span class="modal-detail-value">${esc(String(e.yr))}</span></div>` : ''}
      </div>
    </div>
    ${e.notes ? `<div class="modal-section"><div class="modal-section-title">Notes</div><p style="font-size:0.85rem;color:var(--txt2);line-height:1.6">${esc(e.notes)}</p></div>` : ''}`);
}

function openAircraftModal(idx) {
  const a = T.airForce.aircraft[idx];
  if(!a) return;
  showModal(a.type, `${a.role} · ${a.origin}`, `
    ${a.img ? `<div style="margin-bottom:1.25rem;border-radius:8px;overflow:hidden;height:220px;background:#0d1117"><img src="${esc(a.img)}" style="width:100%;height:100%;object-fit:contain;padding:0.75rem" alt="${esc(a.type)}" onerror="this.parentElement.style.display='none'"></div>` : ''}
    <div class="modal-section">
      <div class="modal-section-title">Specifications & Cost</div>
      <div class="modal-details">
        <div class="modal-detail"><span class="modal-detail-label">Role</span><span class="modal-detail-value">${esc(a.role)}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Origin</span><span class="modal-detail-value">${esc(a.origin)}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Fleet Size</span><span class="modal-detail-value">${a.qty} aircraft</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Est. Unit Cost</span><span class="modal-detail-value" style="color:var(--gold2);font-weight:600">${a.price || 'Classified'}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Acquired</span><span class="modal-detail-value">${esc(a.acquired)}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Status</span>${statusBadge(a.status)}</div>
        <div class="modal-detail"><span class="modal-detail-label">Max Speed</span><span class="modal-detail-value">${esc(a.speed)}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Range</span><span class="modal-detail-value">${esc(a.range)}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Engine</span><span class="modal-detail-value">${esc(a.engine)}</span></div>
        <div class="modal-detail"><span class="modal-detail-label">Primary Bases</span><span class="modal-detail-value">${esc(a.bases.join(', '))}</span></div>
      </div>
    </div>
    ${a.notes ? `<div class="modal-section"><div class="modal-section-title">Notes</div><p style="font-size:0.85rem;color:var(--txt2);line-height:1.6">${esc(a.notes)}</p></div>` : ''}`);
}

function showModal(title, subtitle, body) {
  const overlay = $('#modal-overlay');
  $('#modal-title').textContent = title;
  $('#modal-subtitle').textContent = subtitle;
  $('#modal-body').innerHTML = body;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $('#modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ═══════════════════════════════════════════════════════════════
// SCROLL REVEAL
// ═══════════════════════════════════════════════════════════════
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if(e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 60);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  $$('.reveal').forEach(el => obs.observe(el));
}

function reObserve() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e,i) => { if(e.isIntersecting){ setTimeout(()=>e.target.classList.add('visible'),i*60); obs.unobserve(e.target); } });
  }, { threshold: 0.08 });
  $$('.reveal:not(.visible)').forEach(el => obs.observe(el));
}

// ═══════════════════════════════════════════════════════════════
// ANIMATED COUNTER
// ═══════════════════════════════════════════════════════════════
function animateCounters() {
  $$('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const duration = 2000;
    const step = target / (duration / 16);
    let cur = 0;
    const timer = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = Math.floor(cur).toLocaleString();
      if(cur >= target) clearInterval(timer);
    }, 16);
  });
}

// ═══════════════════════════════════════════════════════════════
// OPERATIONS INTELLIGENCE FEED
// ═══════════════════════════════════════════════════════════════
const INTEL_SOURCES = [
  { name:'DVB English',    url:'https://english.dvb.no/feed/',           color:'#e8823a' },
  { name:'Irrawaddy',      url:'https://www.irrawaddy.com/feed',          color:'#3a8ae8' },
  { name:'Myanmar Now',    url:'https://myanmar-now.org/en/feed',         color:'#e83a3a' },
];
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

const CONFLICT_ZONES_DATA = [
  { name:'Sagaing Region',  intensity:'high',   color:'#e83333', actors:'PDF, NUG vs Tatmadaw',   status:'Heavy airstrikes & village burnings; largest resistance stronghold' },
  { name:'Rakhine State',   intensity:'high',   color:'#e83333', actors:'Arakan Army (AA)',        status:'AA controls ~80% of Rakhine; ongoing Tatmadaw retreat' },
  { name:'N. Shan State',   intensity:'high',   color:'#e83333', actors:'MNDAA, TNLA, AA (3BHA)', status:'Operation 1027: Lashio, Hsipaw, Namhsan captured' },
  { name:'Chin State',      intensity:'high',   color:'#e83333', actors:'CDF, CNF vs Tatmadaw',   status:'CDF holds major towns; airstrikes ongoing' },
  { name:'Karen/Kayin St.', intensity:'medium', color:'#f5a623', actors:'KNU/KNLA, KNDO + PDF',   status:'Bridgeheads across Salween; raids on bases' },
  { name:'Kayah State',     intensity:'medium', color:'#f5a623', actors:'KNPP, KPDF vs Tatmadaw', status:'Most towns under resistance control' },
  { name:'Kachin State',    intensity:'medium', color:'#f5a623', actors:'KIA vs Tatmadaw',        status:'KIA advancing; recaptured Hpakant goldfields' },
  { name:'Mon State',       intensity:'low',    color:'#f5d623', actors:'MNLA, PDF cells',        status:'Sporadic clashes; relative stability vs other regions' },
];

let intelCountdownSecs = 300;
let intelCountdownTimer = null;
let intelRefreshInterval = null;

function initIntelFeed() {
  renderConflictPanel();
  refreshIntelFeed();
  intelRefreshInterval = setInterval(refreshIntelFeed, 300000);
  startIntelCountdown();
}

function renderConflictPanel() {
  const el = $('#intel-conflict-list');
  if(!el) return;
  const iLabel = { high:'HIGH', medium:'MEDIUM', low:'LOW' };
  el.innerHTML = CONFLICT_ZONES_DATA.map(z => `
    <div class="intel-conflict-item">
      <div class="conflict-intensity-dot" style="background:${z.color}"></div>
      <div style="flex:1;min-width:0">
        <div class="conflict-item-name">${z.name}</div>
        <div class="conflict-item-actors" style="color:${z.color}88;font-weight:600;font-size:0.7rem;margin-bottom:0.2rem">${z.actors}</div>
        <div class="conflict-item-actors">${z.status}</div>
      </div>
      <span class="conflict-intensity-badge" style="background:${z.color}18;color:${z.color};border:1px solid ${z.color}44">${iLabel[z.intensity]}</span>
    </div>`).join('');
}

function startIntelCountdown() {
  intelCountdownSecs = 300;
  clearInterval(intelCountdownTimer);
  intelCountdownTimer = setInterval(() => {
    intelCountdownSecs = Math.max(0, intelCountdownSecs - 1);
    const el = $('#intel-countdown');
    const m = Math.floor(intelCountdownSecs / 60);
    const s = String(intelCountdownSecs % 60).padStart(2, '0');
    if(el) el.textContent = `${m}:${s}`;
  }, 1000);
}

async function refreshIntelFeed() {
  const container = $('#intel-articles');
  if(!container) return;
  const btn = $('#intel-refresh-btn');
  if(btn) btn.classList.add('spinning');

  const all = [];
  const KEYWORDS = ['myanmar','tatmadaw','military','junta','coup','pdf','resistance','airstrike','offensive','sac','drone','bomb','kia','knla','knu','arakan','rakhine','sagaing','shan','chin','karenni','civil war'];

  await Promise.allSettled(INTEL_SOURCES.map(async src => {
    try {
      const res = await fetch(CORS_PROXY + encodeURIComponent(src.url), { signal: AbortSignal.timeout(9000) });
      if(!res.ok) throw new Error(res.status);
      const txt = await res.text();
      const xml = new DOMParser().parseFromString(txt, 'application/xml');
      [...xml.querySelectorAll('item')].slice(0, 10).forEach(item => {
        const title = item.querySelector('title')?.textContent?.trim() || '';
        const link  = item.querySelector('link')?.textContent?.trim() || '#';
        const raw   = item.querySelector('description')?.textContent || '';
        const desc  = raw.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim().slice(0, 220);
        const pub   = item.querySelector('pubDate')?.textContent?.trim() || '';
        const date  = pub ? new Date(pub) : new Date(0);
        const combined = (title + ' ' + desc).toLowerCase();
        const relevant = KEYWORDS.some(k => combined.includes(k));
        if(title) all.push({ title, link, desc, date, source: src.name, color: src.color, relevant });
      });
    } catch(err) { /* silently skip failed sources */ }
  }));

  all.sort((a, b) => b.date - a.date);

  if(all.length === 0) {
    container.innerHTML = `
      <div style="padding:1.5rem 1.25rem;color:var(--txt3);font-size:0.82rem;line-height:1.6">
        <p style="margin-bottom:0.75rem">⚠ Live news could not be fetched (network/CORS issue). Visit sources directly:</p>
        ${INTEL_SOURCES.map(s=>`<a href="${s.url}" target="_blank" rel="noopener" style="display:block;color:${s.color};text-decoration:none;padding:0.2rem 0">${s.name}</a>`).join('')}
      </div>`;
  } else {
    container.innerHTML = all.map(a => `
      <div class="intel-article${a.relevant ? ' intel-relevant' : ''}">
        <div class="intel-article-header">
          <span class="intel-source-badge" style="background:${a.color}18;color:${a.color};border-color:${a.color}44">${esc(a.source)}</span>
          <span class="intel-date">${fmtAge(a.date)}</span>
          ${a.relevant ? '<span class="intel-relevant-badge">⚡ RELEVANT</span>' : ''}
        </div>
        <a href="${esc(a.link)}" target="_blank" rel="noopener" class="intel-article-title">${esc(a.title)}</a>
        ${a.desc ? `<p class="intel-article-desc">${esc(a.desc)}…</p>` : ''}
      </div>`).join('');
  }

  const ts = $('#intel-last-updated');
  if(ts) ts.textContent = `Updated: ${new Date().toLocaleTimeString()}`;
  if(btn) btn.classList.remove('spinning');
  startIntelCountdown();
}

function fmtAge(date) {
  const d = Date.now() - date;
  if(d < 0) return 'just now';
  const m = Math.floor(d / 60000);
  const h = Math.floor(d / 3600000);
  const dy = Math.floor(d / 86400000);
  if(m < 60)  return `${m}m ago`;
  if(h < 24)  return `${h}h ago`;
  if(dy < 7)  return `${dy}d ago`;
  return date.toLocaleDateString();
}

// ═══════════════════════════════════════════════════════════════
// PRELOADER
// ═══════════════════════════════════════════════════════════════
function hidePreloader() {
  setTimeout(() => $('#preloader').classList.add('hidden'), 1200);
}

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  hidePreloader();
  initNav();
  initTabs();

  // Render all sections
  renderCommands();
  renderLIDs();
  renderMOCs();
  renderOOCs();
  renderRCHQs();
  renderFleet();
  renderNavyBases();
  renderNavyOverview();
  renderAirForce();
  renderAirBases();
  renderAirOverview();
  renderEquipment();
  renderAdmin();
  initEquipmentFilters();

  // Map (after DOM ready)
  if($('#myanmar-map')) setTimeout(initMap, 100);

  // Charts
  if($('#chart-personnel')) setTimeout(initCharts, 200);

  // Scroll reveal
  setTimeout(initScrollReveal, 300);

  // Intel Feed (defer slightly so page renders first)
  if($('#intel-articles')) setTimeout(initIntelFeed, 800);

  // Modal events
  const overlay = $('#modal-overlay');
  overlay.addEventListener('click', e => { if(e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });

  // Also attach close button listener directly (belt-and-suspenders alongside onclick attr)
  const closeBtn = $('#modal-close');
  if(closeBtn) closeBtn.addEventListener('click', closeModal);

  // Tab change → re-observe
  $$('.tab-btn').forEach(btn => btn.addEventListener('click', () => setTimeout(reObserve, 50)));

  // Counter animation on hero in view
  const heroObs = new IntersectionObserver(entries => {
    if(entries[0].isIntersecting){ animateCounters(); heroObs.disconnect(); }
  }, { threshold:0.5 });
  const hero = $('#hero');
  if(hero) heroObs.observe(hero);
});
