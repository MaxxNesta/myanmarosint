export interface RegionalCommand {
  id:      string
  abbr:    string
  name:    string
  burmese: string
  hq:      string
  region:  string
  lat:     number
  lng:     number
  insignia: string
}

export const REGIONAL_COMMANDS: RegionalCommand[] = [
  { id:'cmd', abbr:'လပခ',  name:'Central Command',           burmese:'အလယ်ပိုင်းတိုင်းစစ်ဌာနချုပ်',       hq:'Mandalay',   region:'Mandalay Region',              lat:21.9937599, lng:96.1005036,  insignia:'https://upload.wikimedia.org/wikipedia/commons/5/5f/Shoulder_sleeve_insignia_of_Central_Command.svg' },
  { id:'nc',  abbr:'မပခ',  name:'Northern Command',           burmese:'မြောက်ပိုင်းတိုင်းစစ်ဌာနချုပ်',      hq:'Myitkyina', region:'Kachin State',                 lat:25.3796876, lng:97.3478656,  insignia:'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_sleeve_insignia_of_Northern_Command_of_Myanmar_Army.svg' },
  { id:'nec', abbr:'ရမခ',  name:'North-East Command',         burmese:'အရှေ့မြောက်တိုင်းစစ်ဌာနချုပ်',      hq:'Lashio',    region:'Northern Shan State',          lat:22.9652171, lng:97.7493032,  insignia:'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_sleeve_insignia_of_Northern_East_Command_of_Myanmar_Army.svg' },
  { id:'ec',  abbr:'ရပခ',  name:'Eastern Command',            burmese:'အရှေ့တိုင်းစစ်ဌာနချုပ်',            hq:'Taunggyi',  region:'Shan & Kayah States',          lat:20.8096903, lng:97.0418811,  insignia:'https://upload.wikimedia.org/wikipedia/commons/c/c0/Shoulder_sleeve_insignia_of_Eastern_Command.svg' },
  { id:'sec', abbr:'ရတခ',  name:'South-East Command',         burmese:'အရှေ့တောင်တိုင်းစစ်ဌာနချုပ်',       hq:'Mawlamyine',region:'Karen State & Mon Region',     lat:16.4064697, lng:97.6566520,  insignia:'https://upload.wikimedia.org/wikipedia/commons/6/68/Shoulder_sleeve_insignia_of_South_East_Command_%28right_side%29.svg' },
  { id:'sc',  abbr:'တပခ',  name:'Southern Command',           burmese:'တောင်ပိုင်းတိုင်းစစ်ဌာနချုပ်',       hq:'Taungoo',   region:'Bago & Magway Regions',        lat:19.0104133, lng:96.4137879,  insignia:'https://upload.wikimedia.org/wikipedia/commons/0/09/Shoulder_sleeve_insignia_of_Southern_Command.svg' },
  { id:'swc', abbr:'နတခ',  name:'South-West Command',         burmese:'အနောက်တောင်တိုင်းစစ်ဌာနချုပ်',      hq:'Pathein',   region:'Ayeyarwady Region',            lat:16.8315545, lng:94.7593807,  insignia:'https://upload.wikimedia.org/wikipedia/commons/f/f7/Shoulder_Sleeve_Insignia_of_Southern_West_Command_of_Myanmar_Army.svg' },
  { id:'wc',  abbr:'နပခ',  name:'Western Command',            burmese:'အနောက်ပိုင်းတိုင်းစစ်ဌာနချုပ်',      hq:'Ann',       region:'Rakhine State & Chin',         lat:19.7557387, lng:94.0348137,  insignia:'https://upload.wikimedia.org/wikipedia/commons/1/13/Shoulder_sleeve_insignia_of_Western_Command.svg' },
  { id:'nwc', abbr:'နမခ',  name:'North-West Command',         burmese:'အနောက်မြောက်တိုင်းစစ်ဌာနချုပ်',     hq:'Monywa',    region:'Sagaing Region',               lat:22.2313228, lng:95.1078045,  insignia:'https://upload.wikimedia.org/wikipedia/commons/4/42/Shoulder_sleeve_insignia_of_North_West_Command.svg' },
  { id:'trc', abbr:'တသခ',  name:'Triangle Regional Command',  burmese:'တြိဂံတိုင်းစစ်ဌာနချုပ်',             hq:'Kengtung',  region:'Eastern Shan State',           lat:21.2805120, lng:99.6124072,  insignia:'https://upload.wikimedia.org/wikipedia/commons/8/82/Shoulder_sleeve_insignia_of_Triangle_Region_Command.svg' },
  { id:'ygt', abbr:'ရကတ', name:'Yangon Command',              burmese:'ရန်ကုန်တိုင်းစစ်ဌာနချုပ်',          hq:'Mayangone', region:'Yangon Region',                lat:16.8712665, lng:96.1497122,  insignia:'https://upload.wikimedia.org/wikipedia/commons/3/32/Shoulder_sleeve_insignia_of_Yangon_Region_Command.svg' },
  { id:'kyk', abbr:'ကရခ',  name:'Coastal Region Command',     burmese:'ကမ်းရိုးတန်းတိုင်းစစ်ဌာနချုပ်',     hq:'Myeik',     region:'Tanintharyi Region',           lat:12.4639235, lng:98.6831856,  insignia:'https://upload.wikimedia.org/wikipedia/commons/5/56/Shoulder_sleeve_insignia_of_Coastal_Region_Command.svg' },
  { id:'npt', abbr:'နပတ',  name:'Naypyidaw Command',           burmese:'နေပြည်တော်တိုင်းစစ်ဌာနချုပ်',       hq:'Pyinmana',  region:'Naypyidaw Union Territory',    lat:19.7680732, lng:96.0791026,  insignia:'https://upload.wikimedia.org/wikipedia/commons/c/cd/Shoulder_sleeve_insignia_of_Nay_Pyi_Daw_Command.svg' },
  { id:'ecc', abbr:'ရလခ',  name:'Eastern Central Command',    burmese:'အရှေ့အလယ်ပိုင်းတိုင်းစစ်ဌာနချုပ်',  hq:'Kholam',    region:'Middle Shan State',            lat:21.1246277, lng:98.1024922,  insignia:'https://upload.wikimedia.org/wikipedia/commons/d/d4/Shoulder_sleeve_insignia_of_Central_East_Command.svg' },
]
