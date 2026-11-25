// 非洲底图（列国舆图《非洲独立》上下卷等）：tools/units-ne.js、tools/waters-ne.js 的配置
// 疆域变动牵涉省区的国家（摩洛哥、喀麦隆、尼日利亚、刚果（金）、坦桑尼亚、纳米比亚、索马里等）按一级行政区作拼块，其余整国一块
module.exports = {
  CN: { EGY: '埃及', SDN: '苏丹', SDS: '南苏丹', ETH: '埃塞俄比亚', SOM: '索马里', SOL: '索马里', KEN: '肯尼亚', TZA: '坦桑尼亚', MOZ: '莫桑比克', AGO: '安哥拉',
    COD: '刚果（金）', CMR: '喀麦隆', NGA: '尼日利亚', GHA: '加纳', MAR: '摩洛哥', NAM: '纳米比亚', ZAF: '南非', TCD: '乍得' },
  WHOLE: { DZA: '阿尔及利亚', TUN: '突尼斯', LBY: '利比亚', MRT: '毛里塔尼亚', MLI: '马里', NER: '尼日尔', SEN: '塞内加尔', GMB: '冈比亚', GNB: '几内亚比绍', GIN: '几内亚',
    SLE: '塞拉利昂', LBR: '利比里亚', CIV: '科特迪瓦', BFA: '布基纳法索', TGO: '多哥', BEN: '贝宁', CAF: '中非', GNQ: '赤道几内亚', GAB: '加蓬', COG: '刚果（布）',
    UGA: '乌干达', RWA: '卢旺达', BDI: '布隆迪', ZMB: '赞比亚', MWI: '马拉维', ZWE: '津巴布韦', BWA: '博茨瓦纳', LSO: '莱索托', SWZ: '斯威士兰', MDG: '马达加斯加',
    COM: '科摩罗', MUS: '毛里求斯', SYC: '塞舌尔', CPV: '佛得角', STP: '圣多美和普林西比', SAH: '西撒哈拉', DJI: '吉布提', ERI: '厄立特里亚', BRT: '比尔泰维勒' },
  SKIP: [],
  BIG: [-26, -36, 60, 38],
  // 按经纬度框切出：西属摩洛哥北部、丹吉尔国际区、伊夫尼、塔尔法亚（北纬 27°40′ 至德拉河），鲸湾。
  // 西撒哈拉：Natural Earth 把西部画进摩洛哥的一级行政区（盖勒敏—斯马拉区北纬 27°40′ 以南的部分、阿尤恩区、达赫拉区），
  // 东部单列为 Western Sahara；两部分都改记今地名“西撒哈拉”，东部按北纬 24 度切开（以南近似 1976—1979 年由毛里塔尼亚管理的部分）
  CUT: [
    ['MAR', '*', [-6.4, 34.95, -2.3, 35.95], 'Spanish north {n}'],
    ['MAR', '*', [-6.05, 35.55, -5.5, 35.95], 'Tangier zone'],
    ['MAR', '*', [-10.4, 29.05, -9.85, 29.6], 'Ifni'],
    ['MAR', 'Guelmim - Es-Semara', [-13.5, 25.9, -8.66, 27.666], 'Saguia {n}'],
    ['MAR', '*', [-13.5, 27.666, -8.667, 28.75], 'Tarfaya {n}'],
    ['SAH', '*', [-18, 20, -12, 24], 'Western Sahara south'],
    ['NAM', 'Erongo', [14.3, -23.15, 14.8, -22.7], 'Walvis Bay'],
  ],
  PSET: { 'Saguia Guelmim - Es-Semara': '西撒哈拉', 'Laâyoune - Boujdour - Sakia El Hamra': '西撒哈拉', 'Oued el Dahab': '西撒哈拉' },
  SIMPLIFY: '4%',
  WATERS: {
    BOX: [-20, -36, 56, 37],
    ZH: { Nile: '尼罗河', 'Rosetta Branch': '尼罗河', 'Damietta Branch': '尼罗河', 'El Bahr el Abyad': '白尼罗河', 'Bahr el Jebel': '白尼罗河', 'Albert Nile': '白尼罗河', 'Victoria Nile': '维多利亚尼罗河',
      'El Bahr el Azraq': '青尼罗河', Abay: '青尼罗河', Atbara: '阿特巴拉河', Sobat: '索巴特河', Kagera: '卡盖拉河', Congo: '刚果河', Lualaba: '刚果河', Ubangi: '乌班吉河', Uele: '韦莱河',
      Kasai: '开赛河', Niger: '尼日尔河', 'Bénoué': '贝努埃河', Benue: '贝努埃河', Zambezi: '赞比西河', Shire: '希雷河', Orange: '奥兰治河', Vaal: '瓦尔河', 'Sénégal': '塞内加尔河', Bafing: '塞内加尔河',
      Volta: '沃尔特河', Mouhoun: '黑沃尔特河', Nakanbé: '白沃尔特河', Limpopo: '林波波河', Okavango: '奥卡万戈河', Cubango: '奥卡万戈河', Chari: '沙里河', Logone: '洛贡河', Gambia: '冈比亚河',
      Cuanza: '宽扎河', Cunene: '库内内河', Ruvuma: '鲁伍马河', Rufiji: '鲁菲吉河', Jubba: '朱巴河', Genale: '朱巴河', Shebele: '谢贝利河', Shabeelle: '谢贝利河', Omo: '奥莫河', Awash: '阿瓦什河',
      Tana: '塔纳河', Sanaga: '萨纳加河', 'Ogooué': '奥果韦河', Kafue: '卡富埃河', Luangwa: '卢安瓜河', Save: '萨韦河', Kwango: '宽果河', Sangha: '桑加河', 'Oum Er Rbia': '乌姆赖比阿河', Moulouya: '穆卢耶河',
      Tekeze: '特克泽河', Setit: '特克泽河' },
    MAJOR: ['尼罗河', '白尼罗河', '青尼罗河', '刚果河', '尼日尔河', '赞比西河'],
    SKIP_RV: ['Suez Canal', 'Ismailiya Canal', 'Gharraf Canal', 'Hindiyah Channel', 'Shatt al Hillah', 'Euphrates', 'Firat', 'Al Furat', 'Tigris', 'Shatt al Arab', 'Guadalquivir'],
    LZH: { 'Lake Victoria': '维多利亚湖', 'Lake Albert': '艾伯特湖', 'Lake Tanganyika': '坦噶尼喀湖', 'Lake Malawi': '马拉维湖', 'Lake Chad': '乍得湖', 'Lake Tana': '塔纳湖', 'Lake Turkana': '图尔卡纳湖',
      'Lac Moeru': '姆韦鲁湖', 'Lake Bangweulu': '班韦乌卢湖', 'Lake Kivu': '基伍湖', 'Lake Edward': '爱德华湖', 'Lake Kyoga': '基奥加湖', 'Lake Rukwa': '鲁夸湖' },
    SKIP_LK: 'Reservoir|Res\\.|Dam|Nasser|Volta|Kariba|Cahora|Kainji|Kossou|Buyo|Tharthar|Razazah|Habbaniyah|Assad|Dead Sea|Galilee|Hammar',
  },
};
