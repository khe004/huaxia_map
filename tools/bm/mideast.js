// 中东与东北非底图（列国舆图《中东新国》《海湾与阿拉伯半岛》等卷）：tools/units-ne.js、tools/waters-ne.js 的配置
module.exports = {
  CN: { EGY: '埃及', LBY: '利比亚', SDN: '苏丹', SDS: '南苏丹', ETH: '埃塞俄比亚', ERI: '厄立特里亚', DJI: '吉布提', SOM: '索马里', SOL: '索马里',
    ISR: '以色列', PSX: '巴勒斯坦', JOR: '约旦', SYR: '叙利亚', LBN: '黎巴嫩', IRQ: '伊拉克', SAU: '沙特阿拉伯', YEM: '也门', OMN: '阿曼', ARE: '阿联酋',
    QAT: '卡塔尔', BHR: '巴林', KWT: '科威特', IRN: '伊朗', TUR: '土耳其', CYP: '塞浦路斯', CYN: '塞浦路斯' },
  WHOLE: { CNM: '塞浦路斯', WSB: '塞浦路斯', ESB: '塞浦路斯', BRT: '比尔泰维勒' },
  SKIP: [],
  BIG: [5, -6, 68, 44],
  WATERS: {
    BOX: [8, -3, 64, 43],
    ZH: { Nile: '尼罗河', 'Rosetta Branch': '尼罗河', 'Damietta Branch': '尼罗河', 'El Bahr el Abyad': '白尼罗河', 'Bahr el Jebel': '白尼罗河', 'Albert Nile': '白尼罗河', 'Victoria Nile': '维多利亚尼罗河',
      'El Bahr el Azraq': '青尼罗河', Abay: '青尼罗河', Atbara: '阿特巴拉河', Tekeze: '特克泽河', Setit: '特克泽河', Sobat: '索巴特河', Pibor: '皮博尔河', Akobo: '阿科博河', 'Bahr el  Zeraf': '杰拉夫河',
      Awash: '阿瓦什河', Omo: '奥莫河', Genale: '朱巴河', Jubba: '朱巴河', Shebele: '谢贝利河', Shabeelle: '谢贝利河', Euphrates: '幼发拉底河', Firat: '幼发拉底河', 'Al Furat': '幼发拉底河',
      Tigris: '底格里斯河', Dicle: '底格里斯河', 'Shatt al Arab': '阿拉伯河', Jordan: '约旦河', Karkheh: '卡尔黑河', Kangen: '卡伦河', Ceyhan: '杰伊汉河', 'Kiz?lirmak': '克孜勒河',
      Sakarya: '萨卡里亚河', Murat: '穆拉特河', Aras: '阿拉斯河', Kura: '库拉河', 'Qezel Owzan': '克孜勒乌宗河', Sefid: '塞菲德河', Helmand: '赫尔曼德河', Harirud: '哈里河', Atrek: '阿特拉克河',
      'Byk Menderes': '大门德雷斯河', Chari: '沙里河', Logone: '洛贡河' },
    MAJOR: ['尼罗河', '白尼罗河', '青尼罗河', '幼发拉底河', '底格里斯河'],
    SKIP_RV: ['Suez Canal', 'Ismailiya Canal', 'Gharraf Canal', 'Hindiyah Channel', 'Shatt al Hillah'],
    LZH: { 'Lake Victoria': '维多利亚湖', 'Lake Albert': '艾伯特湖', 'Lake Tana': '塔纳湖', 'Lake Turkana': '图尔卡纳湖', 'Sea of Galilee': '加利利海', 'Dead Sea': '死海',
      'Lake Urmia': '乌尔米耶湖', 'Lake Van': '凡湖', 'Lake Tuz': '图兹湖', 'Lake Sevan': '塞凡湖', 'Lake Chad': '乍得湖', 'Lake Abaya': '阿巴亚湖', 'Lake Assal': '阿萨勒湖', 'Lake Hammar': '哈马尔湖' },
    SKIP_LK: 'Reservoir|Nasser|Razazah|Tharthar|Sarygamysh|Habbaniyah|Koka|Masinga',
  },
};
