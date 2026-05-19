export interface LightInfDiv {
  num:       number
  name:      string
  loc:       string
  cmd:       string
  lat:       number
  lng:       number
  est:       number
  regiments: number
  insignia:  string
}

export const LIGHT_INF_DIVS: LightInfDiv[] = [
  { num:11,  name:'11th Light Infantry Division',  loc:'Inn Taing', cmd:'Central Command',    lat:17.1297845, lng:96.3326951, est:1999, regiments:10, insignia:'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_sleeve_insignia_of_No.(11)_Light_Infantry_Division_of_the_Myanmar_Army.svg'   },
  { num:22,  name:'22nd Light Infantry Division',  loc:'Hpa-An',    cmd:'North-West Command', lat:16.8636095, lng:97.6358216, est:1999, regiments:10, insignia:'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_sleeve_insignia_of_No.(22)_Light_Infantry_Division_of_the_Myanmar_Army.svg'   },
  { num:33,  name:'33rd Light Infantry Division',  loc:'Sagaing',   cmd:'North-West Command', lat:21.9200872, lng:95.9624303, est:1990, regiments:10, insignia:'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_sleeve_insignia_of_No.(33)_Light_Infantry_Division_of_the_Myanmar_Army.svg'   },
  { num:44,  name:'44th Light Infantry Division',  loc:'Thaton',    cmd:'Southern Command',   lat:17.3414024, lng:97.0541279, est:1990, regiments:10, insignia:'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_sleeve_insignia_of_No.(44)_Light_Infantry_Division_of_the_Myanmar_Army.svg'   },
  { num:55,  name:'55th Light Infantry Division',  loc:'Kalaw',     cmd:'Western Command',    lat:20.6314470, lng:96.5721390, est:1990, regiments:10, insignia:'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_sleeve_insignia_of_No.(55)_Light_Infantry_Division_of_the_Myanmar_Army.svg'   },
  { num:66,  name:'66th Light Infantry Division',  loc:'Innma',     cmd:'Southern Command',   lat:18.5542097, lng:95.3093657, est:1990, regiments:10, insignia:'https://upload.wikimedia.org/wikipedia/commons/f/fa/Shoulder_sleeve_insignia_of_No.%2866%29_Light_Infantry_Division_of_the_Myanmar_Army.svg' },
  { num:77,  name:'77th Light Infantry Division',  loc:'Bago',      cmd:'South-West Command', lat:17.3218036, lng:96.4378139, est:1990, regiments:10, insignia:'https://upload.wikimedia.org/wikipedia/commons/a/a6/Shoulder_sleeve_insignia_of_No.%2877%29_Light_Infantry_Division_of_the_Myanmar_Army.svg' },
  { num:88,  name:'88th Light Infantry Division',  loc:'Magway',    cmd:'Central Command',    lat:20.1781837, lng:94.9527174, est:1990, regiments:10, insignia:'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_sleeve_insignia_of_No.(88)_Light_Infantry_Division_of_the_Myanmar_Army.svg'   },
  { num:99,  name:'99th Light Infantry Division',  loc:'Meiktila',  cmd:'Central Command',    lat:20.8642296, lng:95.8650326, est:1988, regiments:10, insignia:'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_sleeve_insignia_of_No.(99)_Light_Infantry_Division_of_the_Myanmar_Army.svg'   },
  { num:101, name:'101st Light Infantry Division', loc:'Pakokku',   cmd:'North-West Command', lat:21.3333254, lng:95.0509416, est:2000, regiments:10, insignia:'https://upload.wikimedia.org/wikipedia/commons/b/be/Shoulder_sleeve_insignia_of_No.%28101%29_Light_Infantry_Division_of_the_Myanmar_Army.svg' },
]
