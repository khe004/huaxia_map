// 亚洲南部与东部底图（列国舆图《东南亚与南亚（下）》等卷）：tools/units-ne.js、tools/waters-ne.js 的配置
// 疆域变动牵涉省区的国家（印度、巴基斯坦、越南、马来西亚、印度尼西亚）按一级行政区作拼块，其余整国一块
module.exports = {
  CN: { IND: '印度', PAK: '巴基斯坦', VNM: '越南', MYS: '马来西亚', IDN: '印度尼西亚' },
  WHOLE: { CHN: '中国', TWN: '中国台湾', HKG: '中国香港', MAC: '中国澳门', MNG: '蒙古', PRK: '朝鲜', KOR: '韩国', JPN: '日本', PHL: '菲律宾', THA: '泰国', KHM: '柬埔寨', LAO: '老挝',
    MMR: '缅甸', BGD: '孟加拉国', LKA: '斯里兰卡', MDV: '马尔代夫', NPL: '尼泊尔', BTN: '不丹', AFG: '阿富汗', BRN: '文莱', SGP: '新加坡', TLS: '东帝汶', PNG: '巴布亚新几内亚', KAS: '克什米尔' },
  SKIP: [],
  BIG: [58, -13, 152, 47],
  // 冲绳（1972 年由美国交还日本）与小笠原群岛（1968 年交还）从日本切出；阿克赛钦从中国切出（中印两国都主张主权，由中国管理）
  CUT: [
    ['JPN', '*', [122.5, 24.0, 131.5, 26.98], 'Ryukyu'],
    ['JPN', '*', [141.0, 24.0, 143.0, 28.0], 'Bonin'],
    ['CHN', '*', [77.8, 34.3, 80.4, 36.1], 'Aksai Chin'],
  ],
  PSET: { 'Aksai Chin': '中国' },
  SIMPLIFY: '4%',
  WATERS: {
    BOX: [60, -11, 150, 45],
    ZH: { Ganges: '恒河', Ganga: '恒河', Padma: '恒河', Brahmaputra: '布拉马普特拉河', Jamuna: '布拉马普特拉河', Indus: '印度河', Sutlej: '萨特莱杰河', Chenab: '杰纳布河', Jhelum: '杰赫勒姆河',
      Yamuna: '亚穆纳河', Godavari: '戈达瓦里河', Krishna: '克里希纳河', Narmada: '讷尔默达河', Mahanadi: '默哈讷迪河', Kaveri: '高韦里河', Irrawaddy: '伊洛瓦底江', Ayeyarwady: '伊洛瓦底江', Salween: '萨尔温江', Thanlwin: '萨尔温江',
      Mekong: '湄公河', 'Chao Phraya': '湄南河', 'Red': '红河', 'Song Hong': '红河', Yangtze: '长江', 'Chang Jiang': '长江', 'Huang He': '黄河', Xi: '珠江', 'Xi Jiang': '珠江', Kapuas: '卡普阿斯河', Mahakam: '马哈坎河',
      Barito: '巴里托河', Musi: '穆西河', Fly: '弗莱河', Sepik: '塞皮克河', Mamberamo: '曼伯拉莫河', Rajang: '拉让江', Pahang: '彭亨河', 'Amu Darya': '阿姆河', Helmand: '赫尔曼德河', Kabul: '喀布尔河' },
    MAJOR: ['恒河', '印度河', '布拉马普特拉河', '湄公河', '长江', '黄河'],
    SKIP_RV: [],
    LZH: { 'Tonle Sap': '洞里萨湖', 'Dongting Hu': '洞庭湖', 'Poyang Hu': '鄱阳湖', 'Qinghai Hu': '青海湖', 'Lake Toba': '多巴湖', 'Biwa-ko': '琵琶湖' },
    SKIP_LK: 'Reservoir|Res\\.|Dam',
  },
};
