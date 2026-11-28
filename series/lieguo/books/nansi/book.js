// 列国舆图 · 南斯拉夫解体（1991 – 2008）数据包：斯洛文尼亚、克罗地亚、马其顿、波黑独立 — 南斯拉夫联盟共和国 — 代顿协定 — 东斯拉沃尼亚交还 —
// 科索沃由联合国管理 — 塞尔维亚和黑山 — 黑山独立 — 科索沃宣布独立。
// 只记疆域与国家的变动，以及这一地区的文化、科技大事；不写评价，各国领导人只写职务与任期；战事只写结果。
// 日期据各国的宪法与法令、国际协定、联合国的记录。本卷不收引文。
// 月份写成 md(月, 日)，只用来给同月的事件排先后；页面上的日期见各事件的 cal。地块用欧洲底图（各国按今天的州、县或地区）。
// 战事期间的实际控制线与今天的行政区不重合：克罗地亚与波黑境内由不同武装控制的地方，只在所在的县或地区上加斜线说明。

const md = (m, d) => +(m + (d - 1) / 31).toFixed(3);

const BOOK = {
  id: 'nansi',
  title: '南斯拉夫解体舆图',
  brand: '南斯拉夫解体',
  seal: '列',
  subtitle: '据各国宪法与法令、国际协定与联合国记录 · 斯洛文尼亚、克罗地亚、马其顿、波黑 — 代顿协定 — 科索沃 — 塞尔维亚和黑山 — 黑山 · 1991 – 2008',
  basemap: 'europe',
  range: [1991, 2008],
  startYear: 1991,
  baseFaction: 'yu',
  viewMax: 6,
  view: [[12.5, 46.8], [17, 47.6], [23, 46.5], [24.5, 41], [21, 39.6], [17.5, 41], [13, 44.5]],
  scope: { provinces: ['斯洛文尼亚', '克罗地亚', '波黑', '塞尔维亚', '黑山', '北马其顿', '科索沃', '阿尔巴尼亚', '意大利', '奥地利', '匈牙利', '罗马尼亚', '保加利亚', '希腊'] },
  regions: {
    toggle: '今国界',
    unit: '地区', group: '',
    legendNote: '地块按今天的行政区拼合（克罗地亚按县，塞尔维亚按州，波黑按州与地区，科索沃按市镇）。战事期间的控制线与这些行政区不重合，有关的地方只加斜线说明',
    order: ['斯洛文尼亚', '克罗地亚', '波黑', '塞尔维亚', '黑山', '北马其顿', '科索沃', '阿尔巴尼亚', '意大利', '奥地利', '匈牙利', '罗马尼亚', '保加利亚', '希腊'],
  },
  calendar: { ganzhi: false, label: () => [] },
  source: {
    type: 'sections', heading: '依据',
    titles: {
      '各国法令': '各国的宪法、独立宣言、全民公决结果与议会决定',
      '国际协定': '1991 年的布里俄尼宣言，1992 年的萨拉热窝停火协议，1995 年的埃尔杜特协定与代顿协定，1999 年的库马诺沃军事技术协定，2003 年的塞尔维亚和黑山宪章',
      '联合国记录': '联合国安理会的决议、接纳会员国的记录与秘书长特使的报告',
      '战事记录': '各方军队进驻与撤离的记录',
      '文化记录': '电影节、体育赛事、歌唱大赛与世界遗产的记录',
      '科技记录': '欧洲核子研究组织的记录',
    },
  },
  tags: {},
  quoteLabel: '原文',
  hatchNote: '斜线：境内部分地方由他方武装控制，由联合国临时管理，或归属有争议',
  ziLabel: '',
  vassalRealm: '附属',
  otherRealm: '各国',
  peopleGroups: [['si', '斯洛文尼亚'], ['hr', '克罗地亚'], ['ba', '波黑'], ['yu', '南斯拉夫与塞尔维亚'], ['me', '黑山'], ['mk', '马其顿'], ['ks', '科索沃'], ['xx', '其他国家']],
  otherGroup: '其他',
  storyDefault: ['斯洛博丹·米洛舍维奇', '弗拉尼奥·图季曼', '阿利亚·伊泽特贝戈维奇'],
  searchHint: '搜索地名或人物，如：卢布尔雅那、克宁、莫斯塔尔、代顿、库昌',
  notes: '1991 年初南斯拉夫社会主义联邦共和国由斯洛文尼亚、克罗地亚、波斯尼亚和黑塞哥维那、塞尔维亚、黑山、马其顿六个共和国组成，塞尔维亚境内有伏伊伏丁那与科索沃两个自治省。1991 年斯洛文尼亚、克罗地亚、马其顿相继独立，1992 年波黑独立，塞尔维亚与黑山组成南斯拉夫联盟共和国。克罗地亚与波黑境内的战事到 1995 年结束，东斯拉沃尼亚 1998 年交还克罗地亚。1999 年起科索沃由联合国临时管理。2003 年南斯拉夫联盟共和国改为塞尔维亚和黑山，2006 年黑山独立，2008 年科索沃宣布独立。这些年里，《地下》获戛纳金棕榈奖，莫斯塔尔古桥重建开放，雅典举办奥运会，贝尔格莱德举办欧洲歌唱大赛，日内瓦的大型强子对撞机开始运行。',
  musicTitle: '原创合成的背景音。',
};

// 颜色：同一国家在列国舆图各卷用同一颜色（南斯拉夫、阿尔巴尼亚、希腊、意大利等沿用前几卷）。
const FACTIONS = {
  yu:    { color: '#9a6ab0', name: t => (t < 1992.3199 ? '南斯拉夫社会主义联邦共和国' : t < 2003.0914 ? '南斯拉夫联盟共和国' : t < 2006.4274 ? '塞尔维亚和黑山' : '塞尔维亚共和国'),
           mapName: t => (t < 2003.0914 ? '南斯拉夫' : t < 2006.4274 ? '塞尔维亚和黑山' : '塞尔维亚') },
  si:    { color: '#3a7fd0', name: () => '斯洛文尼亚共和国', mapName: () => '斯洛文尼亚' },
  hr:    { color: '#d16161', name: () => '克罗地亚共和国', mapName: () => '克罗地亚' },
  ba:    { color: '#e0c050', name: () => '波斯尼亚和黑塞哥维那', mapName: () => '波黑' },
  mk:    { color: '#f0b030', name: () => '马其顿共和国（今北马其顿）', mapName: () => '马其顿' },
  me:    { color: '#6a8a4a', name: () => '黑山', mapName: () => '黑山' },
  unmik: { color: '#a8b8c8', name: () => '科索沃（联合国临时行政当局管理）', mapName: () => '科索沃' },
  ks:    { color: '#7a5ac8', name: () => '科索沃共和国', mapName: () => '科索沃' },
  al:    { color: '#c87850', name: () => '阿尔巴尼亚共和国', mapName: () => '阿尔巴尼亚' },
  gr:    { color: '#46b4d4', name: () => '希腊共和国', mapName: () => '希腊' },
  it:    { color: '#5a9e5a', name: () => '意大利共和国', mapName: () => '意大利' },
  at:    { color: '#e08890', name: () => '奥地利共和国', mapName: () => '奥地利' },
  hu:    { color: '#8cb44a', name: () => '匈牙利共和国', mapName: () => '匈牙利' },
  ro:    { color: '#e8d070', name: () => '罗马尼亚', mapName: () => '罗马尼亚' },
  bg:    { color: '#4a9a7a', name: () => '保加利亚共和国', mapName: () => '保加利亚' },
  xx:    { color: '#9a9a9a', name: () => '其他国家', mapName: () => '' },
};

// 种子点：每个国家一个（在首都）；克罗地亚的克拉伊纳、东斯拉沃尼亚与科索沃北部另放一个，便于单独加斜线
const SEEDS_RAW = `
塞尔维亚|南斯拉夫|20.46,44.82  斯洛文尼亚|斯洛文尼亚|14.51,46.05  克罗地亚|克罗地亚|15.98,45.81  克罗地亚|克拉伊纳|16.2,44.04  克罗地亚|东斯拉沃尼亚|19.0,45.35
波黑|波黑|18.41,43.86  北马其顿|马其顿|21.43,42.0  黑山|黑山|19.26,42.44  科索沃|科索沃|21.17,42.67  科索沃|科索沃北部|20.6,43.0
阿尔巴尼亚|阿尔巴尼亚|19.82,41.33  希腊|希腊|23.73,37.98  意大利|意大利|12.5,41.9  奥地利|奥地利|16.37,48.21  匈牙利|匈牙利|19.04,47.5  罗马尼亚|罗马尼亚|26.1,44.43  保加利亚|保加利亚|23.32,42.7
`;

// 每个今天的行政区（底图里的名称）归哪个种子点
const UNIT_OVERRIDES = Object.fromEntries([
  ['意大利', ['Cagliari', 'Sud Sardegna', 'Oristano', 'Nuoro', 'Sassari', 'Savona', 'Genova', 'Alessandria', 'Imperia', 'Cuneo', 'Asti', 'Torino', 'Vercelli', 'Biella', 'Valle d’Aosta/Vallée d’Aoste', 'Pavia', 'Milano', 'Novara', 'Monza e della Brianza', 'Varese', 'Lecco', 'Como', 'Verbano-Cusio-Ossola', 'Mantova', 'Cremona', 'Lodi', 'Verona', 'Bergamo', 'Brescia', 'Sondrio', 'Agrigento', 'Ragusa', 'Siracusa', 'Caltanissetta', 'Catania', 'Enna', 'Palermo', 'Messina', 'Reggio di Calabria', 'Vibo Valentia', 'Catanzaro', 'Crotone', 'Cosenza', 'Lecce', 'Matera', 'Potenza', 'Taranto', 'Brindisi', 'Trapani', 'Roma', 'Viterbo', 'Terni', 'Grosseto', 'Perugia', 'Siena', 'Arezzo', 'Firenze', 'Prato', 'Salerno', 'Napoli', 'Avellino', 'Caserta', 'Benevento', 'Latina', 'Frosinone', 'Isernia', 'Campobasso', 'Chieti', 'L’Aquila', 'Pescara', 'Rieti', 'Teramo', 'Ascoli Piceno', 'Fermo', 'Macerata', 'Ancona', 'Pesaro e Urbino', 'Livorno', 'Pisa', 'Pistoia', 'Lucca', 'Massa-Carrara', 'La Spezia', 'Modena', 'Reggio nell’Emilia', 'Parma', 'Piacenza', 'Rimini', 'Forlì-Cesena', 'Ravenna', 'Bologna', 'Ferrara', 'Rovigo', 'Padova', 'Venezia', 'Vicenza', 'Treviso', 'Trieste', 'Gorizia', 'Udine', 'Bari', 'Barletta-Andria-Trani', 'Foggia', 'Pordenone', 'Trento', 'Belluno', 'Bolzano-Bozen']],
  ['奥地利', ['Tiroler Oberland', 'Bludenz-Bregenzer Wald', 'Außerfern', 'Rheintal-Bodenseegebiet', 'Osttirol', 'Innsbruck', 'Tiroler Unterland', 'Klagenfurt-Villach', 'Unterkärnten', 'Oberkärnten', 'Lungau', 'Westliche Obersteiermark', 'Pinzgau-Pongau', 'Liezen', 'West- und Südsteiermark', 'Graz', 'Oststeiermark', 'Südburgenland', 'Mittelburgenland', 'Östliche Obersteiermark', 'Salzburg und Umgebung', 'Traunviertel', 'Steyr-Kirchdorf', 'Mostviertel-Eisenwurzen', 'Linz-Wels', 'Innviertel', 'Niederösterreich-Süd', 'Nordburgenland', 'Wiener Umland/Südteil', 'Sankt Pölten', 'Wien', 'Mühlviertel', 'Wiener Umland/Nordteil', 'Waldviertel', 'Weinviertel']],
  ['希腊', ['Kalymnos, Karpathos, Kasos, Kos, Rodos', 'Lasithi', 'Irakleio', 'Rethymni', 'Chania', 'Peiraias, Nisoi', 'Andros, Thira, Kea, Milos, Mykonos, Naxos, Paros,  Syros, Tinos', 'Argolida, Arkadia', 'Ikaria, Samos', 'Notios Tomeas Athinon', 'Korinthia', 'Lakonia, Messinia', 'Zakynthos', 'Ileia', 'Achaia', 'Ithaki, Kefallinia', 'Fokida', 'Lefkada', 'Aitoloakarnania', 'Evrytania', 'Arta, Preveza', 'Kentrikos Tomeas Athinon', 'Anatoliki Attiki', 'Dytikos Tomeas Athinon', 'Voreios Tomeas Athinon', 'Dytiki Attiki', 'Voiotia', 'Chios', 'Evvoia', 'Fthiotida', 'Magnisia, Sporades', 'Karditsa, Trikala', 'Kerkyra', 'Thesprotia', 'Larisa', 'Ioannina', 'Pieria', 'Grevena, Kozani', 'Kastoria', 'Lesvos, Limnos', 'Chalkidiki', 'Thessaloniki', 'Thasos, Kavala', 'Kilkis', 'Evros', 'Serres', 'Rodopi', 'Xanthi', 'Imathia', 'Florina', 'Pella', 'Drama']],
  ['阿尔巴尼亚', ['Gjirokastër', 'Vlorë', 'Korcë', 'Berat', 'Fier', 'Elbasan', 'Tiranë', 'Durrës', 'Dibër', 'Lezhë', 'Kukës', 'Shkodër']],
  ['克罗地亚', ['Primorsko-goranska županija', 'Brodsko-posavska županija', 'Požeško-slavonska županija', 'Virovitičko-podravska županija', 'Zagrebačka županija', 'Bjelovarsko-bilogorska županija', 'Grad Zagreb', 'Istarska županija', 'Krapinsko-zagorska županija', 'Koprivničko-križevačka županija', 'Varaždinska županija', 'Međimurska županija', 'Dubrovačko-neretvanska županija', 'Splitsko-dalmatinska županija']],
  ['克拉伊纳', ['Karlovačka županija', 'Sisačko-moslavačka županija', 'Šibensko-kninska županija', 'Zadarska županija', 'Ličko-senjska županija']],
  ['东斯拉沃尼亚', ['Osječko-baranjska županija', 'Vukovarsko-srijemska županija']],
  ['南斯拉夫', ['Zapadnobačka oblast', 'Pčinjska oblast', 'Pirotska oblast', 'Jablanička oblast', 'Toplička oblast', 'Raška oblast', 'Nišavska oblast', 'Rasinska oblast', 'Zlatiborska oblast', 'Zaječarska oblast', 'Moravička oblast', 'Pomoravska oblast', 'Šumadijska oblast', 'Borska oblast', 'Kolubarska oblast', 'Braničevska oblast', 'Podunavska oblast', 'Mačvanska oblast', 'City of Belgrade', 'Sremska oblast', 'Južnobanatska oblast', 'Srednjobanatska oblast', 'Južnobačka oblast', 'Severnobanatska oblast', 'Severnobačka oblast']],
  ['斯洛文尼亚', ['Obalno-kraška', 'Primorsko-notranjska', 'Jugovzhodna Slovenija', 'Osrednjeslovenska', 'Zasavska', 'Goriška', 'Posavska', 'Podravska', 'Savinjska', 'Gorenjska', 'Koroška', 'Pomurska']],
  ['匈牙利', ['Baranya', 'Somogy', 'Tolna', 'Zala', 'Vas', 'Veszprém', 'Fejér', 'Budapest', 'Komárom-Esztergom', 'Győr-Moson-Sopron', 'Csongrád', 'Bács-Kiskun', 'Békés', 'Jász-Nagykun-Szolnok', 'Hajdú-Bihar', 'Pest', 'Heves', 'Nógrád', 'Szabolcs-Szatmár-Bereg', 'Borsod-Abaúj-Zemplén']],
  ['马其顿', ['Pelagoniski', 'Jugozapaden', 'Jugoistočen', 'Istočen', 'Vardarski', 'Pološki', 'Skopski', 'Severoistočen']],
  ['保加利亚', ['Kardzhali', 'Smolyan', 'Blagoevgrad', 'Haskovo', 'Pazardzhik', 'Plovdiv', 'Yambol', 'Kyustendil', 'Stara Zagora', 'Pernik', 'Sofia', 'Sliven', 'Sofia (stolitsa)', 'Gabrovo', 'Lovech', 'Burgas', 'Varna', 'Shumen', 'Dobrich', 'Silistra', 'Veliko Tarnovo', 'Targovishte', 'Vratsa', 'Montana', 'Pleven', 'Razgrad', 'Ruse', 'Vidin']],
  ['黑山', ['Crna Gora']],
  ['罗马尼亚', ['Constanţa', 'Călăraşi', 'Ialomiţa', 'Tulcea', 'Teleorman', 'Giurgiu', 'Dolj', 'Olt', 'Bucureşti', 'Ilfov', 'Mehedinţi', 'Dâmboviţa', 'Gorj', 'Argeş', 'Vâlcea', 'Prahova', 'Caraş-Severin', 'Braşov', 'Hunedoara', 'Sibiu', 'Covasna', 'Alba', 'Bacău', 'Mureş', 'Harghita', 'Cluj', 'Neamţ', 'Timiş', 'Arad', 'Bihor', 'Sălaj', 'Bistriţa-Năsăud', 'Suceava', 'Maramureş', 'Satu Mare', 'Brăila', 'Buzău', 'Galaţi', 'Vrancea', 'Vaslui', 'Iaşi', 'Botoşani']],
  ['科索沃', ['Dečani', 'Đakovica', 'Dragaš', 'Prizren', 'Gnjilane', 'Vitina', 'Kačanik', 'Štrpce', 'Podujevo', 'Istok', 'Priština', 'Kosovska Kamenica', 'Peć', 'Orahovac', 'Srbica', 'Klina', 'Kosovska Mitrovica', 'Glogovac', 'Mališevo', 'Suva Reka', 'Uroševac', 'Novo Brdo', 'Obilić', 'Kosovo Polje', 'Lipljan', 'Štimlje', 'Vučitrn']],
  ['波黑', ['Herzegovina-Neretva', 'Trebinje', 'Foča', 'Banja Luka', 'Una-Sana', 'Doboj', 'Posavina', 'Brčko Distrikt', 'Bijeljina', 'West Bosnia', 'West Herzegovina', 'Vlasenica', 'Central Bosnia', 'Zenica-Doboj', 'Tuzla', 'Sarajevo-romanija', 'Sarajevo', 'Bosnian Podrinje']],
  ['科索沃北部', ['Leposavić', 'Zubin Potok', 'Zvečan']],
].flatMap(([s, ns]) => ns.map(n => [n, s])));

// 斜线的说明（q）
const q = (s, ref = '战事记录') => ({ ref, q: s });
const KRAJINA = q('1991 年至 1995 年 8 月，县内部分地方由当地塞尔维亚族武装控制；1991 年 12 月他们宣布成立“塞尔维亚克拉伊纳共和国”，没有得到任何国家承认。1992 年起联合国保护部队驻守');
const ESLAV = q('1991 年至 1998 年 1 月，县内东部（武科瓦尔、巴拉尼亚一带）由当地塞尔维亚族武装控制；1996 年 1 月起由联合国东斯拉沃尼亚过渡行政当局管理，1998 年 1 月 15 日交还克罗地亚');
const BIH = q('1992 年 4 月至 1995 年 10 月的战事期间，境内各地由波黑政府军、波黑塞尔维亚族武装与波黑克罗地亚族武装分别控制，控制线随战事变动');
const UNMIK = q('联合国安理会第 1244 号决议：由联合国科索沃临时行政当局管理，北约领导的科索沃部队驻守；决议重申南斯拉夫联盟共和国的主权与领土完整', '联合国记录');
const KS08 = q('2008 年 2 月 17 日科索沃议会宣布独立；塞尔维亚不承认，仍视为本国的自治省。到 2008 年底约五十个国家承认。联合国科索沃临时行政当局仍在', '各国法令');
const KSN = q('北部以塞尔维亚族为主的市镇不接受科索沃政府管理，仍由联合国科索沃临时行政当局与塞尔维亚设立的机构运作', '联合国记录');

const SNAPSHOTS = [
  // 开局：1991 年 1 月 1 日
  [1991, md(1, 1), [['yu', '南斯拉夫 斯洛文尼亚 克罗地亚 克拉伊纳 东斯拉沃尼亚 波黑 马其顿 黑山 科索沃 科索沃北部'],
    ['al', '阿尔巴尼亚'], ['gr', '希腊'], ['it', '意大利'], ['at', '奥地利'], ['hu', '匈牙利'], ['ro', '罗马尼亚'], ['bg', '保加利亚']]],
  [1991, md(9, 8), [['mk', '马其顿', '各国法令']]],
  [1991, md(10, 8), [['si', '斯洛文尼亚', '各国法令'], ['hr', '克罗地亚', '各国法令'], ['hr', '克拉伊纳', KRAJINA], ['hr', '东斯拉沃尼亚', ESLAV]]],
  [1992, md(3, 3), [['ba', '波黑', BIH]]],
  [1995, md(8, 7), [['hr', '克拉伊纳', '战事记录']]],
  [1995, md(12, 14), [['ba', '波黑', '国际协定']]],
  [1998, md(1, 15), [['hr', '东斯拉沃尼亚', '联合国记录']]],
  [1999, md(6, 10), [['unmik', '科索沃 科索沃北部', UNMIK]]],
  [2006, md(6, 3), [['me', '黑山', '各国法令']]],
  [2008, md(2, 17), [['ks', '科索沃', KS08], ['unmik', '科索沃北部', KSN]]],
];

const ZHOU_LABELS = [];

// 城邑：各国首都，以及协定、文化与科技事件所在的城市
const CITIES = [
  { n: [[1991, '贝尔格莱德']], ll: [20.46, 44.82], m: '今塞尔维亚贝尔格莱德', cap: 1 },
  { n: [[1991, '卢布尔雅那']], ll: [14.51, 46.05], m: '今斯洛文尼亚卢布尔雅那', cap: 1 },
  { n: [[1991, '萨格勒布']], ll: [15.98, 45.81], m: '今克罗地亚萨格勒布', cap: 1 },
  { n: [[1991, '萨拉热窝']], ll: [18.41, 43.86], m: '今波黑萨拉热窝', cap: 1 },
  { n: [[1991, '斯科普里']], ll: [21.43, 42.0], m: '今北马其顿斯科普里', cap: 1 },
  { n: [[1991, '波德戈里察']], ll: [19.26, 42.44], m: '今黑山波德戈里察', cap: 1 },
  { n: [[1991, '普里什蒂纳']], ll: [21.17, 42.67], m: '今科索沃普里什蒂纳', cap: 1 },
  { n: [[1991, '地拉那']], ll: [19.82, 41.33], m: '今阿尔巴尼亚地拉那', cap: 1 },
  { n: [[1991, '雅典']], ll: [23.73, 37.98], m: '今希腊雅典', cap: 1 },
  { n: [[1991, '索非亚']], ll: [23.32, 42.7], m: '今保加利亚索非亚', cap: 1 },
  { n: [[1991, '布加勒斯特']], ll: [26.1, 44.43], m: '今罗马尼亚布加勒斯特', cap: 1 },
  { n: [[1991, '布达佩斯']], ll: [19.04, 47.5], m: '今匈牙利布达佩斯', cap: 1 },
  { n: [[1991, '维也纳']], ll: [16.37, 48.21], m: '今奥地利维也纳', cap: 1 },
  { n: [[1991, '罗马']], ll: [12.5, 41.9], m: '今意大利罗马', cap: 1 },
  { n: [[1991, '克宁']], ll: [16.2, 44.04], m: '今克罗地亚克宁' },
  { n: [[1991, '武科瓦尔']], ll: [19.0, 45.35], m: '今克罗地亚武科瓦尔' },
  { n: [[1991, '埃尔杜特']], ll: [19.06, 45.53], m: '今克罗地亚埃尔杜特' },
  { n: [[1991, '莫斯塔尔']], ll: [17.81, 43.34], m: '今波黑莫斯塔尔' },
  { n: [[1991, '巴尼亚卢卡']], ll: [17.19, 44.77], m: '今波黑巴尼亚卢卡' },
  { n: [[1991, '诺维萨德']], ll: [19.84, 45.25], m: '今塞尔维亚诺维萨德' },
  { n: [[1991, '尼什']], ll: [21.9, 43.32], m: '今塞尔维亚尼什' },
  { n: [[1991, '库马诺沃']], ll: [21.71, 42.13], m: '今北马其顿库马诺沃' },
  { n: [[1991, '米特罗维察']], ll: [20.87, 42.89], m: '今科索沃米特罗维察' },
  { n: [[1991, '斯普利特']], ll: [16.44, 43.51], m: '今克罗地亚斯普利特' },
  { n: [[1991, '杜布罗夫尼克']], ll: [18.09, 42.65], m: '今克罗地亚杜布罗夫尼克' },
  { n: [[1991, '的里雅斯特']], ll: [13.77, 45.65], m: '今意大利的里雅斯特' },
];

const PHASES = [
  [1991, 1992, '各共和国独立'], [1993, 1998, '代顿协定与东斯拉沃尼亚'], [1999, 2008, '科索沃与黑山'],
];

// 事件：y 年，mo 月（md(月, 日) 只用于排序），cal 页面上显示的日期，ll [经度, 纬度]，k pol|dip|eco|cul，refs 依据，who 参与人物
const EVENTS = [
  { y: 1991, mo: md(6, 25), cal: '1991 年 6 月 25 日', t: '斯洛文尼亚、克罗地亚宣布独立', p: '卢布尔雅那', m: '今斯洛文尼亚卢布尔雅那', ll: [14.51, 46.05], k: 'pol', refs: ['各国法令'],
    d: '斯洛文尼亚与克罗地亚两个共和国的议会同日通过独立宣言。两国此前都举行过全民公决，多数赞成独立。此后南斯拉夫人民军与斯洛文尼亚地方武装交火十天。', who: ['米兰·库昌', '弗拉尼奥·图季曼'] },
  { y: 1991, mo: md(7, 7), cal: '1991 年 7 月 7 日', t: '布里俄尼宣言', p: '布里俄尼群岛', m: '今克罗地亚布里俄尼群岛', ll: [13.76, 44.91], k: 'dip', refs: ['国际协定'],
    d: '在欧洲共同体斡旋下，南斯拉夫联邦政府与斯洛文尼亚、克罗地亚的代表同意停火，两国把独立决定暂缓三个月执行。南斯拉夫人民军随后撤出斯洛文尼亚，10 月下旬撤完。', who: ['米兰·库昌'] },
  { y: 1991, mo: md(9, 8), cal: '1991 年 9 月 8 日', t: '马其顿全民公决通过独立', p: '斯科普里', m: '今北马其顿斯科普里', ll: [21.43, 42.0], k: 'pol', refs: ['各国法令'],
    d: '马其顿共和国举行全民公决，多数赞成成为独立的主权国家，这一天后来定为独立日。11 月 17 日议会通过新宪法；1992 年 3 月南斯拉夫人民军撤出，没有发生战事。', who: ['基罗·格利戈罗夫'] },
  { y: 1991, mo: md(10, 8), cal: '1991 年 10 月 8 日', t: '斯洛文尼亚、克罗地亚的独立生效', p: '萨格勒布', m: '今克罗地亚萨格勒布', ll: [15.98, 45.81], k: 'pol', refs: ['各国法令', '战事记录'],
    d: '三个月的暂缓期满，两国议会宣布断绝与南斯拉夫联邦的一切法律关系。克罗地亚境内约三分之一的地方当时由当地塞尔维亚族武装与南斯拉夫人民军控制，战事仍在继续。', who: ['米兰·库昌', '弗拉尼奥·图季曼'] },
  { y: 1992, mo: md(1, 2), cal: '1992 年 1 月 2 日', t: '克罗地亚停火协议在萨拉热窝签订', p: '萨拉热窝', m: '今波黑萨拉热窝', ll: [18.41, 43.86], k: 'dip', refs: ['国际协定', '联合国记录'],
    d: '在联合国秘书长特使万斯主持下，克罗地亚与南斯拉夫人民军的代表签订停火协议。2 月联合国安理会决定组建联合国保护部队，驻守克罗地亚境内由塞尔维亚族控制的地区。', who: ['赛勒斯·万斯'] },
  { y: 1992, mo: md(1, 15), cal: '1992 年 1 月 15 日', t: '欧洲共同体承认斯洛文尼亚与克罗地亚', p: '布鲁塞尔', m: '今比利时布鲁塞尔', ll: [4.35, 50.85], k: 'dip', refs: ['各国法令', '联合国记录'],
    d: '欧洲共同体十二国同日承认斯洛文尼亚与克罗地亚的独立，此后多国相继承认。1992 年 5 月 22 日两国与波黑一同加入联合国。', who: ['米兰·库昌', '弗拉尼奥·图季曼'] },
  { y: 1992, mo: md(3, 3), cal: '1992 年 3 月 3 日', t: '波黑宣布独立', p: '萨拉热窝', m: '今波黑萨拉热窝', ll: [18.41, 43.86], k: 'pol', refs: ['各国法令', '战事记录'],
    d: '2 月 29 日至 3 月 1 日波黑举行全民公决，塞尔维亚族的主要政党抵制，投票者绝大多数赞成独立；3 月 3 日波黑宣布独立。4 月 6 日欧洲共同体承认，5 月 22 日加入联合国。4 月起境内战事持续到 1995 年秋。', who: ['阿利亚·伊泽特贝戈维奇'] },
  { y: 1992, mo: md(4, 27), cal: '1992 年 4 月 27 日', t: '南斯拉夫联盟共和国成立', p: '贝尔格莱德', m: '今塞尔维亚贝尔格莱德', ll: [20.46, 44.82], k: 'pol', refs: ['各国法令', '联合国记录'],
    d: '塞尔维亚与黑山两个共和国通过新宪法，组成南斯拉夫联盟共和国。1992 年 9 月联合国大会决定它不能自动继承原南斯拉夫的联合国席位，须重新申请加入。', who: ['斯洛博丹·米洛舍维奇'] },
  { y: 1993, mo: md(4, 8), cal: '1993 年 4 月 8 日', t: '马其顿加入联合国', p: '斯科普里', m: '今北马其顿斯科普里', ll: [21.43, 42.0], k: 'dip', refs: ['联合国记录'],
    d: '马其顿以“前南斯拉夫的马其顿共和国”的暂用名称加入联合国，国名问题由它与希腊另行谈判。1995 年 9 月两国签订临时协议，建立联络关系。', who: ['基罗·格利戈罗夫'] },
  { y: 1995, mo: md(5, 28), cal: '1995 年 5 月 28 日', t: '《地下》获戛纳金棕榈奖', p: '戛纳', m: '今法国戛纳', ll: [7.02, 43.55], k: 'cul', refs: ['文化记录'],
    d: '生于萨拉热窝的导演库斯图里察以影片《地下》获第 48 届戛纳电影节金棕榈奖，这是他第二次获得这一奖项（第一次是 1985 年）。', who: ['埃米尔·库斯图里察'] },
  { y: 1995, mo: md(8, 7), cal: '1995 年 8 月 7 日', t: '克罗地亚恢复对克拉伊纳的控制', p: '克宁', m: '今克罗地亚克宁', ll: [16.2, 44.04], k: 'pol', refs: ['战事记录'],
    d: '5 月克罗地亚军队收回西斯拉沃尼亚；8 月 4 日起又发起行动，到 8 月 7 日收回“塞尔维亚克拉伊纳共和国”控制的克宁一带，大批塞尔维亚族居民离开。武科瓦尔、巴拉尼亚一带不在这次行动的范围内。', who: ['弗拉尼奥·图季曼'] },
  { y: 1995, mo: md(11, 12), cal: '1995 年 11 月 12 日', t: '埃尔杜特协定', p: '埃尔杜特', m: '今克罗地亚埃尔杜特', ll: [19.06, 45.53], k: 'dip', refs: ['国际协定', '联合国记录'],
    d: '克罗地亚政府与东斯拉沃尼亚的塞尔维亚族代表签订协定，同意这一地区经过一段由联合国管理的过渡期后交还克罗地亚。1996 年 1 月联合国东斯拉沃尼亚过渡行政当局成立。', who: [] },
  { y: 1995, mo: md(12, 14), cal: '1995 年 12 月 14 日', t: '代顿协定在巴黎签订', p: '巴黎', m: '今法国巴黎', ll: [2.35, 48.85], k: 'dip', refs: ['国际协定'],
    d: '协定 11 月 21 日在美国俄亥俄州代顿草签，12 月 14 日由波黑、克罗地亚、南斯拉夫联盟共和国三国总统在巴黎正式签订。波黑保持一个国家，内部分为“波黑联邦”与“塞族共和国”两个实体，土地约各占百分之五十一与四十九；北约领导的多国部队进驻。', who: ['阿利亚·伊泽特贝戈维奇', '弗拉尼奥·图季曼', '斯洛博丹·米洛舍维奇', '理查德·霍尔布鲁克'] },
  { y: 1998, mo: md(1, 15), cal: '1998 年 1 月 15 日', t: '东斯拉沃尼亚交还克罗地亚', p: '武科瓦尔', m: '今克罗地亚武科瓦尔', ll: [19.0, 45.35], k: 'pol', refs: ['联合国记录'],
    d: '联合国东斯拉沃尼亚过渡行政当局的任期结束，武科瓦尔、巴拉尼亚一带交还克罗地亚管理。至此克罗地亚恢复对全境的管理。', who: ['弗拉尼奥·图季曼'] },
  { y: 1999, mo: md(6, 10), cal: '1999 年 6 月 10 日', t: '联合国开始管理科索沃', p: '普里什蒂纳', m: '今科索沃普里什蒂纳', ll: [21.17, 42.67], k: 'pol', refs: ['联合国记录', '战事记录'],
    d: '1999 年 3 月 24 日起北约对南斯拉夫联盟共和国进行空袭。6 月 9 日双方在库马诺沃签订军事技术协定，南联盟的军队与警察撤出科索沃。6 月 10 日联合国安理会通过第 1244 号决议，科索沃由联合国科索沃临时行政当局管理，北约领导的科索沃部队驻守。', who: ['斯洛博丹·米洛舍维奇'] },
  { y: 2000, mo: md(11, 1), cal: '2000 年 11 月 1 日', t: '南斯拉夫联盟共和国加入联合国', p: '贝尔格莱德', m: '今塞尔维亚贝尔格莱德', ll: [20.46, 44.82], k: 'dip', refs: ['联合国记录'],
    d: '10 月 7 日科什图尼察就任南联盟总统后，南联盟以新会员国的身份申请并获准加入联合国。', who: ['沃伊斯拉夫·科什图尼察'] },
  { y: 2001, mo: md(7, 9), cal: '2001 年 7 月 9 日', t: '伊万尼塞维奇获温布尔登冠军', p: '伦敦', m: '今英国伦敦温布尔登', ll: [-0.21, 51.43], k: 'cul', refs: ['文化记录'],
    d: '克罗地亚选手伊万尼塞维奇凭外卡参赛，在决赛中五盘获胜，夺得温布尔登网球锦标赛男子单打冠军；他此前三次进入这项赛事的决赛未能夺冠。', who: ['戈兰·伊万尼塞维奇'] },
  { y: 2002, mo: md(1, 1), cal: '2002 年 1 月 1 日', t: '欧元现钞开始流通', p: '波德戈里察', m: '今黑山波德戈里察', ll: [19.26, 42.44], k: 'eco', refs: ['各国法令'],
    d: '欧元区十二国开始使用欧元现钞。黑山与科索沃此前以德国马克为通用货币，也随之改用欧元。', who: [] },
  { y: 2003, mo: md(2, 4), cal: '2003 年 2 月 4 日', t: '南斯拉夫联盟共和国改为塞尔维亚和黑山', p: '贝尔格莱德', m: '今塞尔维亚贝尔格莱德', ll: [20.46, 44.82], k: 'pol', refs: ['国际协定', '各国法令'],
    d: '联邦议会通过宪章，南斯拉夫联盟共和国改为国家联盟“塞尔维亚和黑山”，“南斯拉夫”的国名不再使用。宪章规定三年后两个成员国可以经全民公决退出。', who: ['沃伊斯拉夫·科什图尼察', '米洛·久卡诺维奇'] },
  { y: 2004, mo: md(5, 1), cal: '2004 年 5 月 1 日', t: '斯洛文尼亚加入欧洲联盟', p: '卢布尔雅那', m: '今斯洛文尼亚卢布尔雅那', ll: [14.51, 46.05], k: 'dip', refs: ['各国法令'],
    d: '斯洛文尼亚与其他九国同日加入欧洲联盟，成员国由十五个增为二十五个。斯洛文尼亚 3 月 29 日已加入北大西洋公约组织。', who: [] },
  { y: 2004, mo: md(7, 23), cal: '2004 年 7 月 23 日', t: '莫斯塔尔古桥重建开放', p: '莫斯塔尔', m: '今波黑莫斯塔尔', ll: [17.81, 43.34], k: 'cul', refs: ['文化记录'],
    d: '内雷特瓦河上的莫斯塔尔古桥建于 1566 年，1993 年 11 月 9 日在战事中被毁。按原样重建后开放，2005 年连同老城列入世界遗产名录。', who: [] },
  { y: 2004, mo: md(8, 13), cal: '2004 年 8 月 13 日', t: '雅典奥运会开幕', p: '雅典', m: '今希腊雅典', ll: [23.73, 37.98], k: 'cul', refs: ['文化记录'],
    d: '第 28 届夏季奥运会在雅典开幕，201 个国家和地区参赛；奥运会在 1896 年首届之后再次回到雅典。', who: [] },
  { y: 2006, mo: md(6, 3), cal: '2006 年 6 月 3 日', t: '黑山宣布独立', p: '波德戈里察', m: '今黑山波德戈里察', ll: [19.26, 42.44], k: 'pol', refs: ['各国法令', '联合国记录'],
    d: '5 月 21 日黑山举行全民公决，赞成独立的票数约占百分之五十五点五，超过欧盟商定的百分之五十五的门槛。6 月 3 日黑山议会宣布独立，6 月 28 日黑山加入联合国。', who: ['米洛·久卡诺维奇'] },
  { y: 2006, mo: md(6, 5), cal: '2006 年 6 月 5 日', t: '塞尔维亚承继国家联盟的地位', p: '贝尔格莱德', m: '今塞尔维亚贝尔格莱德', ll: [20.46, 44.82], k: 'pol', refs: ['各国法令', '联合国记录'],
    d: '塞尔维亚议会宣布塞尔维亚共和国承继塞尔维亚和黑山的国际法地位，包括联合国的席位。', who: ['鲍里斯·塔迪奇', '沃伊斯拉夫·科什图尼察'] },
  { y: 2007, mo: md(1, 1), cal: '2007 年 1 月 1 日', t: '保加利亚、罗马尼亚加入欧盟', p: '索非亚', m: '今保加利亚索非亚', ll: [23.32, 42.7], k: 'dip', refs: ['各国法令'],
    d: '保加利亚与罗马尼亚加入欧洲联盟，成员国增为二十七个。同日斯洛文尼亚改用欧元。', who: [] },
  { y: 2007, mo: md(3, 26), cal: '2007 年 3 月 26 日', t: '科索沃地位方案提交安理会', p: '维也纳', m: '今奥地利维也纳', ll: [16.37, 48.21], k: 'dip', refs: ['联合国记录'],
    d: '2006 年起塞尔维亚与科索沃双方在维也纳谈判科索沃的地位，没有达成协议。联合国秘书长特使阿赫蒂萨里把方案提交安理会，建议科索沃在国际监督下独立；塞尔维亚拒绝，安理会没有通过新的决议。', who: ['马尔蒂·阿赫蒂萨里'] },
  { y: 2008, mo: md(2, 17), cal: '2008 年 2 月 17 日', t: '科索沃议会宣布独立', p: '普里什蒂纳', m: '今科索沃普里什蒂纳', ll: [21.17, 42.67], k: 'pol', refs: ['各国法令'],
    d: '科索沃议会宣布科索沃独立。塞尔维亚不承认，仍视科索沃为本国的自治省。到 2008 年底约五十个国家承认。北部以塞尔维亚族为主的市镇不接受科索沃政府管理。', who: ['哈希姆·萨奇', '法特米尔·塞迪乌'] },
  { y: 2008, mo: md(5, 24), cal: '2008 年 5 月 24 日', t: '贝尔格莱德举办欧洲歌唱大赛', p: '贝尔格莱德', m: '今塞尔维亚贝尔格莱德', ll: [20.46, 44.82], k: 'cul', refs: ['文化记录'],
    d: '2007 年在赫尔辛基，塞尔维亚歌手谢里福维奇以塞尔维亚语歌曲《祈祷》获得欧洲歌唱大赛冠军，按惯例次年由塞尔维亚主办，决赛在贝尔格莱德举行。', who: ['玛丽亚·谢里福维奇'] },
  { y: 2008, mo: md(9, 10), cal: '2008 年 9 月 10 日', t: '大型强子对撞机首次运行', p: '日内瓦', m: '今瑞士日内瓦附近，跨法瑞边境', ll: [6.05, 46.23], k: 'cul', refs: ['科技记录'],
    d: '欧洲核子研究组织的大型强子对撞机第一次让质子束绕周长约 27 千米的环形隧道运行，九天后因故障停机，2009 年恢复运行。', who: [] },
  { y: 2008, mo: md(12, 10), cal: '2008 年 12 月 10 日', t: '阿赫蒂萨里获诺贝尔和平奖', p: '奥斯陆', m: '今挪威奥斯陆', ll: [10.75, 59.91], k: 'dip', refs: ['各国法令'],
    d: '前芬兰总统阿赫蒂萨里在奥斯陆领取诺贝尔和平奖，表彰他在纳米比亚、印度尼西亚亚齐、科索沃等地的调解工作。', who: ['马尔蒂·阿赫蒂萨里'] },
];

const PEOPLE_RAW = [
  // 各国领导人：只写职务与任期，不作评价
  ['米兰·库昌', 'si', '', '1941–', '1990 年 4 月起任斯洛文尼亚主席团主席，1991 年独立后任总统，到 2002 年 12 月。'],
  ['弗拉尼奥·图季曼', 'hr', '', '1922–1999', '1990 年 5 月起任克罗地亚主席团主席、总统，任职到 1999 年 12 月去世。'],
  ['阿利亚·伊泽特贝戈维奇', 'ba', '', '1925–2003', '1990 年 12 月至 1996 年 10 月任波黑主席团主席，1996 年至 2000 年为波黑三人主席团成员。'],
  ['基罗·格利戈罗夫', 'mk', '', '1917–2012', '1991 年 1 月至 1999 年 11 月任马其顿总统。'],
  ['斯洛博丹·米洛舍维奇', 'yu', '', '1941–2006', '1989 年 5 月至 1997 年 7 月任塞尔维亚主席团主席、总统，1997 年 7 月至 2000 年 10 月任南斯拉夫联盟共和国总统。'],
  ['沃伊斯拉夫·科什图尼察', 'yu', '', '1944–', '2000 年 10 月至 2003 年 3 月任南斯拉夫联盟共和国总统，2004 年 3 月至 2008 年 7 月任塞尔维亚总理。'],
  ['鲍里斯·塔迪奇', 'yu', '', '1958–', '2004 年 7 月至 2012 年 4 月任塞尔维亚总统。'],
  ['米洛·久卡诺维奇', 'me', '', '1962–', '1991 年至 1998 年、2003 年至 2006 年、2008 年至 2010 年任黑山总理，1998 年至 2002 年任黑山总统。'],
  ['哈希姆·萨奇', 'ks', '', '1968–', '2008 年 1 月至 2014 年 12 月任科索沃总理。'],
  ['法特米尔·塞迪乌', 'ks', '', '1951–', '2006 年 2 月至 2010 年 9 月任科索沃总统。'],
  ['赛勒斯·万斯', 'xx', '', '1917–2002', '1977 年至 1980 年任美国国务卿，1991 年至 1993 年任联合国秘书长南斯拉夫问题个人特使。'],
  ['理查德·霍尔布鲁克', 'xx', '', '1941–2010', '1994 年至 1996 年任美国助理国务卿（主管欧洲与加拿大事务），主持代顿谈判。'],
  ['马尔蒂·阿赫蒂萨里', 'xx', '', '1937–2023', '1994 年至 2000 年任芬兰总统，2005 年至 2007 年任联合国秘书长科索沃地位问题特使，2008 年获诺贝尔和平奖。'],
  // 文化
  ['埃米尔·库斯图里察', 'yu', '', '1954–', '电影导演，生于萨拉热窝，1985 年、1995 年两度获戛纳电影节金棕榈奖。'],
  ['戈兰·伊万尼塞维奇', 'hr', '', '1971–', '克罗地亚网球运动员，2001 年获温布尔登网球锦标赛男子单打冠军。'],
  ['玛丽亚·谢里福维奇', 'yu', '', '1984–', '塞尔维亚歌手，2007 年获欧洲歌唱大赛冠军。'],
];
