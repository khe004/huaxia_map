// 列国舆图 · 战后重划（1945 – 1949）数据包：德国投降 — 四国分区占领德国与奥地利 — 奥得河—尼斯河线 — 巴黎和约 — 的里雅斯特自由区 — 两个德国。
// 只记疆域与国家的变动，以及欧洲的文化、科技大事；不写评价，各国领导人只写职务与任期。日期据盟国的《柏林宣言》、波茨坦会议公报、
// 关于奥地利占领区的协定、1947 年 2 月 10 日的巴黎和约、各国的宪法与法令，以及联合国与各专门机构的记录。
// 本卷不收引文。月份写成 md(月, 日)，只用来给同月的事件排先后；页面上的日期见各事件的 cal。
// 地块用欧洲底图（德国按 NUTS-2，奥地利、波兰等按 NUTS-3），占领区与割让地区的界线按今天的行政区取近似。

const md = (m, d) => +(m + (d - 1) / 31).toFixed(3);

const BOOK = {
  id: 'zhanhou',
  title: '战后重划舆图',
  brand: '战后重划',
  seal: '列',
  subtitle: '据柏林宣言、波茨坦会议公报、巴黎和约与各国宪法 · 四国占领 — 奥得河—尼斯河线 — 巴黎和约 — 两个德国 · 1945 – 1949',
  basemap: 'europe',
  range: [1945, 1949],
  startYear: 1945,
  baseFaction: 'deocc',
  viewMax: 3,
  view: [[-1, 46], [2, 55], [16, 57], [27, 54], [27, 40], [12, 39]],
  scope: { provinces: ['德国', '奥地利', '波兰', '捷克', '斯洛伐克', '匈牙利', '罗马尼亚', '保加利亚', '斯洛文尼亚', '克罗地亚', '波黑', '塞尔维亚', '黑山', '北马其顿', '科索沃', '阿尔巴尼亚', '希腊', '意大利', '法国', '比利时', '荷兰', '卢森堡', '瑞士', '丹麦', '芬兰', '俄罗斯', '乌克兰', '白俄罗斯', '摩尔多瓦', '立陶宛', '拉脱维亚', '爱沙尼亚', '英国', '爱尔兰', '西班牙', '葡萄牙', '瑞典', '挪威', '冰岛'] },
  regions: {
    toggle: '今国界',
    unit: '地区', group: '',
    legendNote: '地块按今天的行政区拼合（德国按州下的行政区，奥地利、波兰等按更小的地区），占领区和割让地区的界线因此只是近似。斜线表示归属留待和约确定、由几国共管，或由他国军队管理（按实际管辖上色）',
    order: ['德国', '奥地利', '波兰', '捷克', '斯洛伐克', '匈牙利', '罗马尼亚', '保加利亚', '斯洛文尼亚', '克罗地亚', '波黑', '塞尔维亚', '黑山', '北马其顿', '科索沃', '阿尔巴尼亚', '希腊', '意大利', '法国', '比利时', '荷兰', '卢森堡', '瑞士', '丹麦', '芬兰', '俄罗斯', '乌克兰', '白俄罗斯', '摩尔多瓦', '立陶宛', '拉脱维亚', '爱沙尼亚', '英国', '爱尔兰', '西班牙', '葡萄牙', '瑞典', '挪威', '冰岛'],
  },
  calendar: { ganzhi: false, label: () => [] },
  source: {
    type: 'sections', heading: '依据',
    titles: {
      '盟国文件': '1945 年 6 月 5 日的《柏林宣言》、波茨坦会议公报（1945 年 8 月 2 日）、关于奥地利占领区与维也纳管理的协定（1945 年 7 月 9 日）',
      '条约与协定': '1945 年的捷克斯洛伐克与苏联条约、波兰与苏联边界条约，1947 年 2 月 10 日在巴黎签署的对意大利、罗马尼亚、匈牙利、保加利亚、芬兰和约',
      '各国法令': '各国的宪法、基本法、全民公决结果与政府法令',
      '联合国记录': '联合国及其专门机构（教科文组织、世界卫生组织）的章程与大会决议',
      '文化记录': '电影节、艺术节、出版与体育赛事的记录',
      '科技记录': '计算机与科学仪器的研制记录',
      '城市记录': '城市改名的法令',
    },
  },
  tags: {},
  quoteLabel: '原文',
  hatchNote: '斜线：归属留待和约确定、几国共管，或由他国军队管理',
  ziLabel: '',
  vassalRealm: '附属',
  otherRealm: '各国',
  peopleGroups: [['de', '联邦德国'], ['dd', '民主德国'], ['at', '奥地利'], ['yu', '南斯拉夫'], ['nl', '荷兰'], ['cs', '捷克斯洛伐克'], ['gb', '英国']],
  otherGroup: '其他',
  storyDefault: ['康拉德·阿登纳', '特奥多尔·豪斯', '卡尔·伦纳', '约瑟普·布罗兹·铁托'],
  searchHint: '搜索地名或人物，如：的里雅斯特、柯尼斯堡、阿登纳',
  notes: '1945 年 5 月 8 日，德国武装部队的无条件投降生效，欧洲的战事结束。6 月 5 日，美国、英国、苏联、法国四国在柏林宣布接管德国的最高权力，把德国分为四个占领区，柏林由四国共管；7 月，奥地利与维也纳也照此划分。8 月的波茨坦会议议定，奥得河与尼斯河以东的原德国领土交由波兰管理，柯尼斯堡及其周边交由苏联管理，最终边界留待和约确定。1947 年 2 月 10 日，同盟国在巴黎与意大利、罗马尼亚、匈牙利、保加利亚、芬兰签署和约：意大利把伊斯特拉等地割给南斯拉夫，把多德卡尼斯群岛割给希腊，的里雅斯特及其周边成为联合国安理会保障的自由区。1949 年，西部三个占领区成立德意志联邦共和国，苏联占领区成立德意志民主共和国。这几年里，联合国教科文组织与世界卫生组织成立，戛纳与爱丁堡办起了电影节和艺术节，伦敦举办了战后第一届奥运会，曼彻斯特的一台实验机第一次运行了存储在内存里的程序。',
  musicTitle: '原创合成的背景音。',
};

// 颜色：同一国家在列国舆图各卷用同一颜色（苏联沿用《苏联解体》卷）。占领区用占领国颜色的浅色。
const FACTIONS = {
  deocc: { color: '#b5a48a', name: () => '盟军占领下的德国', mapName: () => '德国' },
  deus:  { color: '#7d9fd0', name: () => '德国·美国占领区', mapName: () => '美占区' },
  degb:  { color: '#a3b46a', name: () => '德国·英国占领区', mapName: () => '英占区' },
  defr:  { color: '#9a88c8', name: () => '德国·法国占领区', mapName: () => '法占区' },
  desu:  { color: '#d88676', name: () => '德国·苏联占领区', mapName: () => '苏占区' },
  berlin: { color: '#a8a29a', name: () => '柏林（四国共管）', mapName: () => '柏林' },
  saar:  { color: '#c9b06a', name: () => '萨尔（与法国组成经济与关税联盟）', mapName: () => '萨尔' },
  de:    { color: '#d9a63a', name: () => '德意志联邦共和国', mapName: () => '联邦德国' },
  dd:    { color: '#8c6a50', name: () => '德意志民主共和国', mapName: () => '民主德国' },
  at:    { color: '#e08890', name: () => '奥地利共和国', mapName: () => '奥地利' },
  atus:  { color: '#a2bde2', name: () => '奥地利·美国占领区', mapName: () => '美占区', hideLabel: true },
  atgb:  { color: '#c0cc88', name: () => '奥地利·英国占领区', mapName: () => '英占区', hideLabel: true },
  atfr:  { color: '#b4a6da', name: () => '奥地利·法国占领区', mapName: () => '法占区', hideLabel: true },
  atsu:  { color: '#e6a294', name: () => '奥地利·苏联占领区', mapName: () => '奥地利' },
  wien:  { color: '#cbb898', name: () => '维也纳（四国共管）', mapName: () => '维也纳', hideLabel: true },
  ussr:  { color: '#b8483e', name: () => '苏联（苏维埃社会主义共和国联盟）', mapName: () => '苏联' },
  pl:    { color: '#e2a0a8', name: () => '波兰', mapName: () => '波兰' },
  cs:    { color: '#4f8fbf', name: () => '捷克斯洛伐克共和国', mapName: () => '捷克斯洛伐克' },
  hu:    { color: '#8cb44a', name: t => (t < 1946.0833 ? '匈牙利王国' : t < 1949.6344 ? '匈牙利共和国' : '匈牙利人民共和国'), mapName: () => '匈牙利' },
  ro:    { color: '#e8d070', name: t => (t < 1947.9945 ? '罗马尼亚王国' : '罗马尼亚人民共和国'), mapName: () => '罗马尼亚' },
  bg:    { color: '#4a9a7a', name: t => (t < 1946.7043 ? '保加利亚王国' : '保加利亚人民共和国'), mapName: () => '保加利亚' },
  yu:    { color: '#9a6ab0', name: t => (t < 1945.9085 ? '南斯拉夫民主联邦' : '南斯拉夫联邦人民共和国'), mapName: () => '南斯拉夫' },
  al:    { color: '#c87850', name: t => (t < 1946.0269 ? '阿尔巴尼亚' : '阿尔巴尼亚人民共和国'), mapName: () => '阿尔巴尼亚' },
  gr:    { color: '#46b4d4', name: () => '希腊王国', mapName: () => '希腊' },
  it:    { color: '#5a9e5a', name: t => (t < 1946.4193 ? '意大利王国' : '意大利共和国'), mapName: () => '意大利' },
  amg:   { color: '#a8b49c', name: () => '盟军军政府管理区（的里雅斯特、戈里齐亚）', mapName: () => 'A 区', hideLabel: true },
  ftt:   { color: '#c2c89a', name: () => '的里雅斯特自由区', mapName: () => '的里雅斯特', hideLabel: true },
  fr:    { color: '#3f63a8', name: () => '法兰西共和国', mapName: () => '法国' },
  be:    { color: '#b87c3a', name: () => '比利时王国', mapName: () => '比利时' },
  nl:    { color: '#ef9a3a', name: () => '荷兰王国', mapName: () => '荷兰' },
  lu:    { color: '#6ab0b0', name: () => '卢森堡大公国', mapName: () => '卢森堡' },
  ch:    { color: '#a8608c', name: () => '瑞士联邦', mapName: () => '瑞士' },
  dk:    { color: '#d4507a', name: () => '丹麦王国', mapName: () => '丹麦' },
  fi:    { color: '#c4e0d8', name: () => '芬兰共和国', mapName: () => '芬兰' },
  gb:    { color: '#8fa0b8', name: () => '大不列颠及北爱尔兰联合王国', mapName: () => '英国' },
  gbadm: { color: '#7088a8', name: () => '英国军政府管理区（多德卡尼斯群岛）', mapName: () => '英管', hideLabel: true },
  ie:    { color: '#7cc08a', name: () => '爱尔兰', mapName: () => '爱尔兰' },
  es:    { color: '#e0a050', name: () => '西班牙', mapName: () => '西班牙' },
  pt:    { color: '#3f8040', name: () => '葡萄牙共和国', mapName: () => '葡萄牙' },
  se:    { color: '#6a8ae0', name: () => '瑞典王国', mapName: () => '瑞典' },
  no:    { color: '#b06050', name: () => '挪威王国', mapName: () => '挪威' },
  is:    { color: '#9ad0c8', name: () => '冰岛共和国', mapName: () => '冰岛' },
};

// 种子点：每个国家一个（在首都），占领区、割让与托管地区各一个；地块按 UNIT_OVERRIDES 归属，
// 只有德国的 Freiburg、法国的 Jura 两个名称与瑞士的州同名，按最近的种子点归属（法占区种子放在弗赖堡，法国另在贝桑松放一个“法国东部”）
const SEEDS_RAW = `
德国|美占区|8.68,50.11  德国|英占区|9.73,52.37  德国|法占区|7.85,47.99  德国|萨尔|7.0,49.23  德国|苏占区|12.7,51.8  德国|柏林|13.4,52.52
奥地利|奥地利苏占区|15.63,48.2  奥地利|奥地利美占区|13.04,47.8  奥地利|奥地利英占区|15.44,47.07  奥地利|奥地利法占区|11.4,47.27  奥地利|维也纳|16.37,48.21
波兰|波兰|21.01,52.23  波兰|奥得河—尼斯河以东|17.03,51.11  俄罗斯|加里宁格勒|20.51,54.71  乌克兰|外喀尔巴阡|22.29,48.62
俄罗斯|苏联|37.62,55.75  爱沙尼亚|爱沙尼亚|24.75,59.44  拉脱维亚|拉脱维亚|24.11,56.95  立陶宛|立陶宛|25.28,54.69
捷克|捷克斯洛伐克|14.42,50.09  匈牙利|匈牙利|19.04,47.5  罗马尼亚|罗马尼亚|26.1,44.43  保加利亚|保加利亚|23.32,42.7
塞尔维亚|南斯拉夫|20.46,44.82  斯洛文尼亚|科佩尔|13.73,45.55  克罗地亚|伊斯特拉|13.85,45.24  阿尔巴尼亚|阿尔巴尼亚|19.82,41.33
希腊|希腊|23.73,37.98  希腊|多德卡尼斯|28.22,36.43  意大利|意大利|12.5,41.9  意大利|的里雅斯特|13.77,45.65  意大利|戈里齐亚|13.62,45.94
法国|法国|2.35,48.85  法国|法国东部|6.02,47.24  比利时|比利时|4.35,50.85  荷兰|荷兰|4.9,52.37  卢森堡|卢森堡|6.13,49.61  瑞士|瑞士|7.45,46.95
丹麦|丹麦|12.57,55.68  丹麦|博恩霍尔姆|14.92,55.1  芬兰|芬兰|24.94,60.17
英国|英国|-0.13,51.51  爱尔兰|爱尔兰|-6.26,53.35  西班牙|西班牙|-3.7,40.42  葡萄牙|葡萄牙|-9.14,38.72  瑞典|瑞典|18.07,59.33  挪威|挪威|10.75,59.91  冰岛|冰岛|-21.9,64.14
`;

// 每个今天的行政区（底图里的名称）归哪个种子点
const UNIT_OVERRIDES = Object.fromEntries([
  ['美占区', ['Oberbayern', 'Niederbayern', 'Oberpfalz', 'Oberfranken', 'Mittelfranken', 'Unterfranken', 'Schwaben', 'Darmstadt', 'Gießen', 'Kassel', 'Stuttgart', 'Karlsruhe', 'Bremen']],
  ['法占区', ['Tübingen', 'Koblenz', 'Trier', 'Rheinhessen-Pfalz']],
  ['萨尔', ['Saarland']],
  ['英占区', ['Schleswig-Holstein', 'Hamburg', 'Braunschweig', 'Hannover', 'Lüneburg', 'Weser-Ems', 'Düsseldorf', 'Köln', 'Münster', 'Detmold', 'Arnsberg']],
  ['苏占区', ['Mecklenburg-Vorpommern', 'Brandenburg', 'Sachsen-Anhalt', 'Thüringen', 'Dresden', 'Chemnitz', 'Leipzig']],
  ['柏林', ['Berlin']],
  ['奥地利苏占区', ['Nordburgenland', 'Mittelburgenland', 'Südburgenland', 'Mostviertel-Eisenwurzen', 'Niederösterreich-Süd', 'Sankt Pölten', 'Waldviertel', 'Weinviertel', 'Wiener Umland/Nordteil', 'Wiener Umland/Südteil', 'Mühlviertel']],
  ['奥地利美占区', ['Salzburg und Umgebung', 'Pinzgau-Pongau', 'Lungau', 'Innviertel', 'Linz-Wels', 'Steyr-Kirchdorf', 'Traunviertel']],
  ['奥地利英占区', ['Graz', 'Liezen', 'Östliche Obersteiermark', 'Westliche Obersteiermark', 'Oststeiermark', 'West- und Südsteiermark', 'Klagenfurt-Villach', 'Oberkärnten', 'Unterkärnten', 'Osttirol']],
  ['奥地利法占区', ['Tiroler Oberland', 'Tiroler Unterland', 'Innsbruck', 'Außerfern', 'Bludenz-Bregenzer Wald', 'Rheintal-Bodenseegebiet']],
  ['维也纳', ['Wien']],
  ['奥得河—尼斯河以东', ['Szczeciński', 'Miasto Szczecin', 'Szczecinecko-pyrzycki', 'Koszaliński', 'Słupski', 'Gorzowski', 'Zielonogórski', 'Wrocławski', 'Miasto Wrocław', 'Legnicko-głogowski', 'Jeleniogórski', 'Wałbrzyski', 'Nyski', 'Opolski', 'Gliwicki', 'Bytomski', 'Olsztyński', 'Elbląski', 'Ełcki', 'Trójmiejski']],
  ['加里宁格勒', ['Kaliningrad']],
  ['外喀尔巴阡', ['Transcarpathia']],
  ['爱沙尼亚', ['Kirde-Eesti', 'Lõuna-Eesti', 'Lääne-Eesti', 'Kesk-Eesti', 'Põhja-Eesti']],
  ['拉脱维亚', ['Latgale', 'Zemgale', 'Rīga', 'Pierīga', 'Vidzeme', 'Kurzeme']],
  ['立陶宛', ['Klaipėdos apskritis', 'Telšių apskritis', 'Alytaus apskritis', 'Marijampolės apskritis', 'Vilniaus apskritis', 'Kauno apskritis', 'Tauragės apskritis', 'Utenos apskritis', 'Panevėžio apskritis', 'Šiaulių apskritis']],
  ['的里雅斯特', ['Trieste']],
  ['戈里齐亚', ['Gorizia']],
  ['科佩尔', ['Obalno-kraška']],
  ['伊斯特拉', ['Istarska županija', 'Primorsko-goranska županija', 'Goriška', 'Primorsko-notranjska']],
  ['多德卡尼斯', ['Kalymnos, Karpathos, Kasos, Kos, Rodos']],
  ['博恩霍尔姆', ['Bornholm']],
  ['波兰', ['Krośnieński', 'Bielski', 'Nowotarski', 'Nowosądecki', 'Tarnowski', 'Miasto Kraków', 'Krakowski', 'Oświęcimski', 'Rzeszowski', 'Tarnobrzeski', 'Sosnowiecki', 'Sandomiersko-jędrzejowski', 'Przemyski', 'Chełmsko-zamojski', 'Lubelski', 'Bialski', 'Łomżyński', 'Kielecki', 'Piotrkowski', 'Puławski', 'Radomski', 'Łódzki', 'Miasto Łódź', 'Żyrardowski', 'Skierniewicki', 'Siedlecki', 'Warszawski wschodni', 'Tyski', 'Rybnicki', 'Katowicki', 'Częstochowski', 'Sieradzki', 'Kaliski', 'Leszczyński', 'Koniński', 'Miasto Poznań', 'Poznański', 'Włocławski', 'Inowrocławski', 'Pilski', 'Bydgosko-toruński', 'Grudziądzki', 'Świecki', 'Chojnicki', 'Starogardzki', 'Gdański', 'Miasto Warszawa', 'Warszawski zachodni', 'Płocki', 'Ciechanowski', 'Ostrołęcki', 'Białostocki', 'Suwalski']],
  ['捷克斯洛伐克', ['Jihočeský kraj', 'Plzeňský kraj', 'Hlavní město Praha', 'Jihomoravský kraj', 'Zlínský kraj', 'Kraj Vysočina', 'Moravskoslezský kraj', 'Olomoucký kraj', 'Pardubický kraj', 'Královéhradecký kraj', 'Středočeský kraj', 'Karlovarský kraj', 'Ústecký kraj', 'Liberecký kraj', 'Nitriansky kraj', 'Trnavský kraj', 'Bratislavský kraj', 'Banskobystrický kraj', 'Košický kraj', 'Prešovský kraj', 'Trenčiansky kraj', 'Žilinský kraj']],
  ['匈牙利', ['Baranya', 'Somogy', 'Tolna', 'Zala', 'Vas', 'Veszprém', 'Fejér', 'Budapest', 'Komárom-Esztergom', 'Győr-Moson-Sopron', 'Csongrád', 'Bács-Kiskun', 'Békés', 'Jász-Nagykun-Szolnok', 'Hajdú-Bihar', 'Pest', 'Heves', 'Nógrád', 'Szabolcs-Szatmár-Bereg', 'Borsod-Abaúj-Zemplén']],
  ['罗马尼亚', ['Constanţa', 'Călăraşi', 'Ialomiţa', 'Tulcea', 'Teleorman', 'Giurgiu', 'Dolj', 'Olt', 'Bucureşti', 'Ilfov', 'Mehedinţi', 'Dâmboviţa', 'Gorj', 'Argeş', 'Vâlcea', 'Prahova', 'Caraş-Severin', 'Braşov', 'Hunedoara', 'Sibiu', 'Covasna', 'Alba', 'Bacău', 'Mureş', 'Harghita', 'Cluj', 'Neamţ', 'Timiş', 'Arad', 'Bihor', 'Sălaj', 'Bistriţa-Năsăud', 'Suceava', 'Maramureş', 'Satu Mare', 'Brăila', 'Buzău', 'Galaţi', 'Vrancea', 'Vaslui', 'Iaşi', 'Botoşani']],
  ['保加利亚', ['Kardzhali', 'Smolyan', 'Blagoevgrad', 'Haskovo', 'Pazardzhik', 'Plovdiv', 'Yambol', 'Kyustendil', 'Stara Zagora', 'Pernik', 'Sofia', 'Sliven', 'Sofia (stolitsa)', 'Gabrovo', 'Lovech', 'Burgas', 'Varna', 'Shumen', 'Dobrich', 'Silistra', 'Veliko Tarnovo', 'Targovishte', 'Vratsa', 'Montana', 'Pleven', 'Razgrad', 'Ruse', 'Vidin']],
  ['南斯拉夫', ['Jugovzhodna Slovenija', 'Osrednjeslovenska', 'Zasavska', 'Posavska', 'Podravska', 'Savinjska', 'Gorenjska', 'Koroška', 'Pomurska', 'Brodsko-posavska županija', 'Karlovačka županija', 'Sisačko-moslavačka županija', 'Požeško-slavonska županija', 'Osječko-baranjska županija', 'Virovitičko-podravska županija', 'Zagrebačka županija', 'Bjelovarsko-bilogorska županija', 'Grad Zagreb', 'Krapinsko-zagorska županija', 'Koprivničko-križevačka županija', 'Varaždinska županija', 'Međimurska županija', 'Dubrovačko-neretvanska županija', 'Splitsko-dalmatinska županija', 'Šibensko-kninska županija', 'Zadarska županija', 'Ličko-senjska županija', 'Vukovarsko-srijemska županija', 'Herzegovina-Neretva', 'Trebinje', 'Foča', 'Banja Luka', 'Una-Sana', 'Doboj', 'Posavina', 'Brčko Distrikt', 'Bijeljina', 'West Bosnia', 'West Herzegovina', 'Vlasenica', 'Central Bosnia', 'Zenica-Doboj', 'Tuzla', 'Sarajevo-romanija', 'Sarajevo', 'Bosnian Podrinje', 'Zapadnobačka oblast', 'Pčinjska oblast', 'Pirotska oblast', 'Jablanička oblast', 'Toplička oblast', 'Raška oblast', 'Nišavska oblast', 'Rasinska oblast', 'Zlatiborska oblast', 'Zaječarska oblast', 'Moravička oblast', 'Pomoravska oblast', 'Šumadijska oblast', 'Borska oblast', 'Kolubarska oblast', 'Braničevska oblast', 'Podunavska oblast', 'Mačvanska oblast', 'City of Belgrade', 'Sremska oblast', 'Južnobanatska oblast', 'Srednjobanatska oblast', 'Južnobačka oblast', 'Severnobanatska oblast', 'Severnobačka oblast', 'Crna Gora', 'Pelagoniski', 'Jugozapaden', 'Jugoistočen', 'Istočen', 'Vardarski', 'Pološki', 'Skopski', 'Severoistočen', 'Dečani', 'Đakovica', 'Dragaš', 'Prizren', 'Gnjilane', 'Vitina', 'Kačanik', 'Štrpce', 'Leposavić', 'Podujevo', 'Zubin Potok', 'Zvečan', 'Istok', 'Priština', 'Kosovska Kamenica', 'Peć', 'Orahovac', 'Srbica', 'Klina', 'Kosovska Mitrovica', 'Glogovac', 'Mališevo', 'Suva Reka', 'Uroševac', 'Novo Brdo', 'Obilić', 'Kosovo Polje', 'Lipljan', 'Štimlje', 'Vučitrn']],
  ['阿尔巴尼亚', ['Gjirokastër', 'Vlorë', 'Korcë', 'Berat', 'Fier', 'Elbasan', 'Tiranë', 'Durrës', 'Dibër', 'Lezhë', 'Kukës', 'Shkodër']],
  ['希腊', ['Lasithi', 'Irakleio', 'Rethymni', 'Chania', 'Peiraias, Nisoi', 'Andros, Thira, Kea, Milos, Mykonos, Naxos, Paros,  Syros, Tinos', 'Argolida, Arkadia', 'Ikaria, Samos', 'Notios Tomeas Athinon', 'Korinthia', 'Lakonia, Messinia', 'Zakynthos', 'Ileia', 'Achaia', 'Ithaki, Kefallinia', 'Fokida', 'Lefkada', 'Aitoloakarnania', 'Evrytania', 'Arta, Preveza', 'Kentrikos Tomeas Athinon', 'Anatoliki Attiki', 'Dytikos Tomeas Athinon', 'Voreios Tomeas Athinon', 'Dytiki Attiki', 'Voiotia', 'Chios', 'Evvoia', 'Fthiotida', 'Magnisia, Sporades', 'Karditsa, Trikala', 'Kerkyra', 'Thesprotia', 'Larisa', 'Ioannina', 'Pieria', 'Grevena, Kozani', 'Kastoria', 'Lesvos, Limnos', 'Chalkidiki', 'Thessaloniki', 'Thasos, Kavala', 'Kilkis', 'Evros', 'Serres', 'Rodopi', 'Xanthi', 'Imathia', 'Florina', 'Pella', 'Drama']],
  ['意大利', ['Cagliari', 'Sud Sardegna', 'Oristano', 'Nuoro', 'Sassari', 'Savona', 'Genova', 'Alessandria', 'Imperia', 'Cuneo', 'Asti', 'Torino', 'Vercelli', 'Biella', 'Valle d’Aosta/Vallée d’Aoste', 'Pavia', 'Milano', 'Novara', 'Monza e della Brianza', 'Varese', 'Lecco', 'Como', 'Verbano-Cusio-Ossola', 'Mantova', 'Cremona', 'Lodi', 'Verona', 'Bergamo', 'Brescia', 'Sondrio', 'Agrigento', 'Ragusa', 'Siracusa', 'Caltanissetta', 'Catania', 'Enna', 'Palermo', 'Messina', 'Reggio di Calabria', 'Vibo Valentia', 'Catanzaro', 'Crotone', 'Cosenza', 'Lecce', 'Matera', 'Potenza', 'Taranto', 'Brindisi', 'Trapani', 'Roma', 'Viterbo', 'Terni', 'Grosseto', 'Perugia', 'Siena', 'Arezzo', 'Firenze', 'Prato', 'Salerno', 'Napoli', 'Avellino', 'Caserta', 'Benevento', 'Latina', 'Frosinone', 'Isernia', 'Campobasso', 'Chieti', 'L’Aquila', 'Pescara', 'Rieti', 'Teramo', 'Ascoli Piceno', 'Fermo', 'Macerata', 'Ancona', 'Pesaro e Urbino', 'Livorno', 'Pisa', 'Pistoia', 'Lucca', 'Massa-Carrara', 'La Spezia', 'Modena', 'Reggio nell’Emilia', 'Parma', 'Piacenza', 'Rimini', 'Forlì-Cesena', 'Ravenna', 'Bologna', 'Ferrara', 'Rovigo', 'Padova', 'Venezia', 'Vicenza', 'Treviso', 'Udine', 'Bari', 'Barletta-Andria-Trani', 'Foggia', 'Pordenone', 'Trento', 'Belluno', 'Bolzano-Bozen']],
  ['法国', ['Pyrénées-Orientales', 'Ariège', 'Var', 'Bouches-du-Rhône', 'Gard', 'Vaucluse', 'Alpes-de-Haute-Provence', 'Hautes-Alpes', 'Drôme', 'Ardèche', 'Isère', 'Pyrénées-Atlantiques', 'Landes', 'Gironde', 'Charente-Maritime', 'Corse-du-Sud', 'Haute-Corse', 'Alpes-Maritimes', 'Savoie', 'Loire', 'Rhône', 'Ain', 'Haute-Savoie', 'Saône-et-Loire', 'Territoire de Belfort', 'Aude', 'Hautes-Pyrénées', 'Haute-Garonne', 'Hérault', 'Gers', 'Tarn', 'Tarn-et-Garonne', 'Aveyron', 'Lot-et-Garonne', 'Lozère', 'Lot', 'Cantal', 'Haute-Loire', 'Dordogne', 'Corrèze', 'Charente', 'Puy-de-Dôme', 'Haute-Vienne', 'Creuse', 'Allier', 'Deux-Sèvres', 'Vienne', 'Indre', 'Cher', 'Nièvre', 'Indre-et-Loire', 'Loir-et-Cher', 'Yonne', 'Loiret', 'Sarthe', 'Doubs', 'Côte-d’Or', 'Haute-Saône', 'Haute-Marne', 'Vosges', 'Aube', 'Meurthe-et-Moselle', 'Marne', 'Meuse', 'Vendée', 'Loire-Atlantique', 'Maine-et-Loire', 'Morbihan', 'Mayenne', 'Ille-et-Vilaine', 'Côtes-d’Armor', 'Manche', 'Eure-et-Loir', 'Essonne', 'Orne', 'Seine-et-Marne', 'Yvelines', 'Val-de-Marne', 'Hauts-de-Seine', 'Paris', 'Seine-Saint-Denis', 'Val-d’Oise', 'Finistère', 'Eure', 'Calvados', 'Oise', 'Aisne', 'Seine-Maritime', 'Somme', 'Pas-de-Calais', 'Nord', 'Haut-Rhin', 'Bas-Rhin', 'Moselle', 'Ardennes']],
  ['比利时', ['Arr. Ath', 'Arr. Tournai-Mouscron', 'Arr. Kortrijk', 'Arr. Ieper', 'Arr. Oudenaarde', 'Arr. Roeselare', 'Arr. Tielt', 'Arr. Diksmuide', 'Arr. Veurne', 'Arr. Virton', 'Arr. Arlon', 'Arr. Neufchâteau', 'Arr. Bastogne', 'Arr. Dinant', 'Arr. Philippeville', 'Arr. Thuin', 'Arr. Marche-en-Famenne', 'Arr. La Louvière', 'Arr. Charleroi', 'Bezirk Verviers — Deutschsprachige Gemeinschaft', 'Arr. Namur', 'Arr. Mons', 'Arr. Huy', 'Arr. Verviers — communes francophones', 'Arr. Soignies', 'Arr. Liège', 'Arr. Waremme', 'Arr. Nivelles', 'Arr. de Bruxelles-Capitale/Arr. Brussel-Hoofdstad', 'Arr. Tongeren', 'Arr. Aalst', 'Arr. Halle-Vilvoorde', 'Arr. Leuven', 'Arr. Hasselt', 'Arr. Dendermonde', 'Arr. Mechelen', 'Arr. Maaseik', 'Arr. Sint-Niklaas', 'Arr. Turnhout', 'Arr. Antwerpen', 'Arr. Gent', 'Arr. Oostende', 'Arr. Brugge', 'Arr. Eeklo']],
  ['荷兰', ['Zuid-Limburg', 'Midden-Limburg', 'Zuidoost-Noord-Brabant', 'Arnhem/Nijmegen', 'Delft en Westland', 'Achterhoek', 'Oost-Zuid-Holland', 'Agglomeratie ’s-Gravenhage', 'Utrecht', 'Agglomeratie Leiden en Bollenstreek', 'Veluwe', 'Het Gooi en Vechtstreek', 'Twente', 'Zeeuwsch-Vlaanderen', 'Noord-Limburg', 'West-Noord-Brabant', 'Overig Zeeland', 'Midden-Noord-Brabant', 'Noordoost-Noord-Brabant', 'Zuidoost-Zuid-Holland', 'Groot-Rijnmond', 'Zuidwest-Gelderland', 'Zuidwest-Overijssel', 'Agglomeratie Haarlem', 'Groot-Amsterdam', 'Zaanstreek', 'IJmond', 'Flevoland', 'Alkmaar en omgeving', 'Noord-Overijssel', 'Zuidwest-Drenthe', 'Kop van Noord-Holland', 'Zuidoost-Drenthe', 'Oost-Groningen', 'Delfzijl en omgeving', 'Zuidwest-Friesland', 'Noord-Drenthe', 'Zuidoost-Friesland', 'Noord-Friesland', 'Overig Groningen']],
  ['卢森堡', ['Luxembourg']],
  ['瑞士', ['Valais', 'Ticino', 'Uri', 'Genève', 'Vaud', 'Neuchâtel', 'Graubünden', 'Bern', 'Obwalden', 'Luzern', 'Solothurn', 'Aargau', 'Basel-Landschaft', 'Basel-Stadt', 'Nidwalden', 'Glarus', 'Schwyz', 'Zug', 'St. Gallen', 'Appenzell Innerrhoden', 'Appenzell Ausserrhoden', 'Zürich', 'Thurgau', 'Schaffhausen']],
  ['丹麦', ['Sydjylland', 'Vestjylland', 'Fyn', 'Østjylland', 'Nordjylland', 'Vest- og Sydsjælland', 'Østsjælland', 'Byen København', 'Københavns omegn', 'Nordsjælland']],
  ['芬兰', ['Kymenlaakso', 'Helsinki-Uusimaa', 'Kanta-Häme', 'Etelä-Karjala', 'Etelä-Savo', 'Pohjois-Karjala', 'Pohjois-Savo', 'Kainuu', 'Pohjois-Pohjanmaa', 'Päijät-Häme', 'Pirkanmaa', 'Keski-Suomi', 'Etelä-Pohjanmaa', 'Keski-Pohjanmaa', 'Lappi', 'Åland', 'Varsinais-Suomi', 'Satakunta', 'Pohjanmaa']],
  ['苏联', ['Pskov', 'Krasnodar', 'Karachay-Cherkess', 'Kabardin-Balkar', 'North Ossetia', 'Ingush', 'Chechnya', 'Dagestan', 'Murmansk', 'Karelia', 'Leningrad', 'Smolensk', 'Bryansk', 'Kursk', 'Belgorod', 'Voronezh', 'Rostov', 'Chelyabinsk', 'Orenburg', 'Saratov', 'Astrakhan\'', 'Volgograd', 'Nenets', 'City of St. Petersburg', 'Arkhangel\'sk', 'Kalmyk', 'Bashkortostan', 'Sverdlovsk', 'Lipetsk', 'Tambov', 'Tatarstan', 'Ul\'yanovsk', 'Penza', 'Orel', 'Mordovia', 'Kaluga', 'Kostroma', 'Yaroslavl\'', 'Vladimir', 'Ryazan\'', 'Ivanovo', 'Nizhegorod', 'Tula', 'Chuvash', 'Vologda', 'Novgorod', 'Tver\'', 'Moskovskaya', 'Moskva', 'Mariy-El', 'Kirov', 'Udmurt', 'Komi', 'Perm\'', 'Samara', 'Stavropol\'', 'Adygey', 'Chernihiv', 'Volyn', 'Rivne', 'Zhytomyr', 'Kiev', 'Chernivtsi', 'Ivano-Frankivs\'k', 'Odessa', 'Vinnytsya', 'L\'viv', 'Sumy', 'Kharkiv', 'Luhans\'k', 'Donets\'k', 'Crimea', 'Kherson', 'Zaporizhzhya', 'Sevastopol', 'Mykolayiv', 'Poltava', 'Khmel\'nyts\'kyy', 'Ternopil\'', 'Dnipropetrovs\'k', 'Cherkasy', 'Kirovohrad', 'Kiev City', 'Gomel', 'Brest', 'Vitebsk', 'Grodno', 'Mogilev', 'Minsk', 'City of Minsk', 'Briceni', 'Edineţ', 'Rîşcani', 'Glodeni', 'Făleşti', 'Ungheni', 'Nisporeni', 'Hîncesti', 'Leova', 'Cantemir', 'Cahul', 'Ocniţa', 'Donduseni', 'Soroca', 'Camenca', 'Rezina', 'Stîngă Nistrului', 'Grigoriopol', 'Bender', 'Ștefan Vodă', 'Causeni', 'Cimişlia', 'Basarabeasca', 'Taraclia', 'Comrat', 'Criuleni', 'Străşeni', 'Anenii Noi', 'Orhei', 'Transnistria', 'Chişinău', 'Teleneşti', 'Şoldăneşti', 'Floreşti', 'Ialoveni', 'Călărași', 'Drochia', 'Sîngerei', 'Bălţi']],
  ['英国', ['Isle of Wight', 'Bournemouth, Christchurch and Poole', 'Plymouth', 'Cornwall and Isles of Scilly', 'Torbay', 'Devon CC', 'Cardiff and Vale of Glamorgan', 'Bridgend and Neath Port Talbot', 'Swansea', 'Central Valleys', 'Gwent Valleys', 'Brighton and Hove', 'East Sussex CC', 'West Sussex (North East)', 'Dorset', 'Portsmouth', 'South Hampshire', 'West Sussex (South West)', 'Southampton', 'Central Hampshire', 'Somerset', 'North Hampshire', 'West Surrey', 'Wiltshire CC', 'East Kent', 'Mid Kent', 'West Kent', 'East Surrey', 'Kent Thames Gateway', 'Croydon', 'Bromley', 'Merton, Kingston upon Thames and Sutton', 'Medway', 'Hounslow and Richmond upon Thames', 'Wandsworth', 'Bexley and Greenwich', 'Lambeth', 'Lewisham and Southwark', 'Kensington & Chelsea and Hammersmith & Fulham', 'Thurrock', 'Westminster', 'Ealing', 'Hackney and Newham', 'Camden and City of London', 'Harrow and Hillingdon', 'Southend-on-Sea', 'Barking & Dagenham and Havering', 'Brent', 'Berkshire', 'Bristol, City of', 'Bath and North East Somerset, North Somerset and South Gloucestershire', 'Swindon', 'Monmouthshire and Newport', 'Buckinghamshire CC', 'Oxfordshire', 'Gloucestershire', 'Luton', 'Central Bedfordshire', 'Haringey and Islington', 'Essex Thames Gateway', 'Redbridge and Waltham Forest', 'Barnet', 'Enfield', 'Heart of Essex', 'Hertfordshire', 'West Essex', 'Essex Haven Gateway', 'Suffolk', 'Milton Keynes', 'Herefordshire, County of', 'Bedford', 'Worcestershire', 'West Northamptonshire', 'Warwickshire', 'Coventry', 'North Northamptonshire', 'Solihull', 'Dudley', 'South West Wales', 'Powys', 'Gwynedd', 'Conwy and Denbighshire', 'Flintshire and Wrexham', 'Isle of Anglesey', 'Birmingham', 'Sandwell', 'Wolverhampton', 'Walsall', 'Leicester', 'Shropshire CC', 'Leicestershire CC and Rutland', 'Telford and Wrekin', 'Staffordshire CC', 'Derby', 'Cambridgeshire CC', 'Breckland and South Norfolk', 'Peterborough', 'Norwich and East Norfolk', 'North and West Norfolk', 'Lincolnshire', 'Kingston upon Hull, City of', 'South Nottinghamshire', 'Nottingham', 'Stoke-on-Trent', 'South and West Derbyshire', 'Cheshire West and Chester', 'Cheshire East', 'East Derbyshire', 'North Nottinghamshire', 'Warrington', 'Liverpool', 'Sheffield', 'East Merseyside', 'Greater Manchester South East', 'Manchester', 'Greater Manchester South West', 'Barnsley, Doncaster and Rotherham', 'Greater Manchester North West', 'Sefton', 'North and North East Lincolnshire', 'Greater Manchester North East', 'Wirral', 'Newry, Mourne and Down', 'Armagh City, Banbridge and Craigavon', 'Fermanagh and Omagh', 'Lisburn and Castlereagh', 'West Cumbria', 'Ards and North Down', 'Chorley and West Lancashire', 'Wakefield', 'Calderdale and Kirklees', 'Blackburn with Darwen', 'East Lancashire', 'Leeds', 'Blackpool', 'Bradford', 'Mid Lancashire', 'East Riding of Yorkshire', 'York', 'Lancaster and Wyre', 'North Yorkshire CC', 'Darlington', 'South Teesside', 'Hartlepool and Stockton-on-Tees', 'East Cumbria', 'Durham CC', 'Sunderland', 'Tyneside', 'Belfast', 'Mid Ulster', 'Antrim and Newtownabbey', 'Derry City and Strabane', 'Mid and East Antrim', 'Dumfries & Galloway', 'Causeway Coast and Glens', 'South Ayrshire', 'East Ayrshire and North Ayrshire mainland', 'South Lanarkshire', 'Inverclyde, East Renfrewshire and Renfrewshire', 'Glasgow City', 'North Lanarkshire', 'West Lothian', 'Edinburgh, City of', 'Falkirk', 'East Dunbartonshire, West Dunbartonshire and Helensburgh & Lomond', 'Clackmannanshire and Fife', 'Perth & Kinross and Stirling', 'Northumberland', 'Scottish Borders', 'East Lothian and Midlothian', 'Angus and Dundee City', 'Aberdeen City and Aberdeenshire', 'Orkney Islands', 'Shetland Islands', 'Lochaber, Skye & Lochalsh, Arran & Cumbrae and Argyll & Bute', 'Inverness & Nairn and Moray, Badenoch & Strathspey', 'Na h-Eileanan Siar (Western Isles)', 'Caithness & Sutherland and Ross & Cromarty']],
  ['爱尔兰', ['South-West', 'South-East', 'Mid-West', 'Midland', 'Mid-East', 'Dublin', 'West', 'Border']],
  ['西班牙', ['Ceuta', 'Cádiz', 'Málaga', 'Granada', 'Huelva', 'Sevilla', 'Jaén', 'Córdoba', 'Melilla', 'Almería', 'Murcia', 'Alicante/Alacant', 'Albacete', 'Valencia/València', 'Cuenca', 'Teruel', 'Guadalajara', 'Soria', 'Badajoz', 'Ciudad Real', 'Cáceres', 'Toledo', 'Madrid', 'Ávila', 'Salamanca', 'Eivissa y Formentera', 'Mallorca', 'Castellón/Castelló', 'Tarragona', 'Barcelona', 'Lleida', 'Girona', 'Huesca', 'Segovia', 'Zamora', 'Valladolid', 'Ourense', 'Burgos', 'Pontevedra', 'Palencia', 'León', 'Lugo', 'A Coruña', 'Cantabria', 'Asturias', 'Menorca', 'Zaragoza', 'La Rioja', 'Navarra', 'Araba/Álava', 'Gipuzkoa', 'Bizkaia']],
  ['葡萄牙', ['Região Autónoma da Madeira', 'Algarve', 'Baixo Alentejo', 'Alentejo Litoral', 'Alentejo Central', 'Área Metropolitana de Lisboa', 'Lezíria do Tejo', 'Alto Alentejo', 'Oeste', 'Médio Tejo', 'Região de Leiria', 'Beira Baixa', 'Região de Coimbra', 'Beiras e Serra da Estrela', 'Viseu Dão Lafões', 'Região de Aveiro', 'Área Metropolitana do Porto', 'Douro', 'Tâmega e Sousa', 'Ave', 'Terras de Trás-os-Montes', 'Cávado', 'Alto Tâmega', 'Alto Minho']],
  ['瑞典', ['Skåne län', 'Blekinge län', 'Kronobergs län', 'Hallands län', 'Kalmar län', 'Gotlands län', 'Östergötlands län', 'Jönköpings län', 'Västra Götalands län', 'Örebro län', 'Värmlands län', 'Dalarnas län', 'Jämtlands län', 'Södermanlands län', 'Stockholms län', 'Västmanlands län', 'Uppsala län', 'Gävleborgs län', 'Västernorrlands län', 'Västerbottens län', 'Norrbottens län']],
  ['挪威', ['Vestfold og Telemark', 'Rogaland', 'Vestland', 'Agder', 'Møre og Romsdal', 'Oslo', 'Viken', 'Innlandet', 'Jan Mayen', 'Trøndelag', 'Nordland', 'Troms og Finnmark']],
  ['冰岛', ['Höfuðborgarsvæði', 'Landsbyggð']],
].flatMap(([s, ns]) => ns.map(n => [n, s])));

// 斜线的说明（q）：归属留待和约确定、几国共管，或由他国军队管理
const q = (s, ref = '盟国文件') => ({ ref, q: s });
const ODER1 = q('原属德国；苏军占领，波兰在当地设立行政机构');
const ODER2 = q('原属德国；波茨坦会议议定交由波兰管理，最终边界留待和约确定');
const KAL1 = q('原属德国东普鲁士；苏军占领');
const KAL2 = q('原属德国东普鲁士；波茨坦会议同意交由苏联管理，最终边界留待和约确定');
const KAL3 = q('1946 年 4 月设柯尼斯堡州，划入俄罗斯苏维埃联邦社会主义共和国；波茨坦会议议定最终边界留待和约确定', '各国法令');
const BALT = q('1940 年并入苏联；美国等国不承认这一并入', '各国法令');
const VG1 = q('原属意大利；5 月 1 日起南斯拉夫军队进驻，归属留待和约确定');
const VG2 = q('原属意大利；南斯拉夫军队管理，归属留待和约确定', '条约与协定');
const ZA = q('A 区：英美军政府管理，归属留待和约确定', '条约与协定');
const ZB = q('B 区：南斯拉夫军队管理，归属留待和约确定', '条约与协定');
const ALL = '美占区 英占区 法占区 萨尔 苏占区 柏林';
const AT = '奥地利苏占区 奥地利美占区 奥地利英占区 奥地利法占区 维也纳';

const SNAPSHOTS = [
  // 开局：1945 年 5 月 8 日，德国无条件投降生效
  [1945, md(5, 8), [['deocc', ALL, q('无条件投降生效，全境由盟军各部队占领')], ['at', AT, q('4 月 27 日临时政府宣布恢复独立；全境由盟军各部队占领', '各国法令')],
    ['pl', '波兰'], ['pl', '奥得河—尼斯河以东', ODER1], ['ussr', '苏联'], ['ussr', '加里宁格勒', KAL1],
    ['ussr', '爱沙尼亚', BALT], ['ussr', '拉脱维亚', BALT], ['ussr', '立陶宛', BALT],
    ['ussr', '外喀尔巴阡', q('捷克斯洛伐克的领土；苏军进驻，当地成立的委员会要求并入苏维埃乌克兰', '条约与协定')],
    ['ussr', '博恩霍尔姆', q('丹麦的领土；苏军驻留')],
    ['cs', '捷克斯洛伐克'], ['hu', '匈牙利'], ['ro', '罗马尼亚'], ['bg', '保加利亚'], ['yu', '南斯拉夫'], ['al', '阿尔巴尼亚'],
    ['yu', '的里雅斯特 戈里齐亚 科佩尔 伊斯特拉', VG1],
    ['gr', '希腊'], ['gbadm', '多德卡尼斯', q('原属意大利；英国军政府管理，归属留待和约确定')],
    ['it', '意大利'], ['fr', '法国 法国东部'], ['be', '比利时'], ['nl', '荷兰'], ['lu', '卢森堡'], ['ch', '瑞士'], ['dk', '丹麦'], ['fi', '芬兰'],
    ['gb', '英国'], ['ie', '爱尔兰'], ['es', '西班牙'], ['pt', '葡萄牙'], ['se', '瑞典'], ['no', '挪威'], ['is', '冰岛']]],
  // 柏林宣言：四国接管德国最高权力，分为四个占领区
  [1945, md(6, 5), [['deus', '美占区', '盟国文件'], ['degb', '英占区', '盟国文件'], ['defr', '法占区 萨尔', '盟国文件'], ['desu', '苏占区', '盟国文件'],
    ['berlin', '柏林', q('四国共管，分为四个占领区')]]],
  // 南斯拉夫军队撤出的里雅斯特与戈里齐亚
  [1945, md(6, 12), [['amg', '的里雅斯特 戈里齐亚', ZA], ['yu', '科佩尔 伊斯特拉', ZB]]],
  [1945, md(6, 29), [['ussr', '外喀尔巴阡', '条约与协定']]],
  // 奥地利与维也纳分区占领
  [1945, md(7, 9), [['atsu', '奥地利苏占区', '盟国文件'], ['atus', '奥地利美占区', '盟国文件'], ['atgb', '奥地利英占区', '盟国文件'], ['atfr', '奥地利法占区', '盟国文件'],
    ['wien', '维也纳', q('四国共管，分为四个占领区，市中心由四国轮流管理')]]],
  [1945, md(8, 2), [['pl', '奥得河—尼斯河以东', ODER2], ['ussr', '加里宁格勒', KAL2]]],
  [1946, md(4, 5), [['dk', '博恩霍尔姆', '盟国文件']]],
  [1946, md(4, 7), [['ussr', '加里宁格勒', KAL3]]],
  [1947, md(3, 31), [['gr', '多德卡尼斯', q('希腊军政府管理；和约生效前仍属意大利', '条约与协定')]]],
  // 巴黎和约生效
  [1947, md(9, 15), [['ftt', '的里雅斯特', q('的里雅斯特自由区 A 区，英美军政府管理', '条约与协定')], ['yu', '科佩尔', q('的里雅斯特自由区 B 区，南斯拉夫军政府管理', '条约与协定')],
    ['it', '戈里齐亚', '条约与协定'], ['yu', '伊斯特拉', '条约与协定'], ['gr', '多德卡尼斯', q('和约生效，主权归希腊；仍由希腊军政府管理', '条约与协定')]]],
  [1947, md(12, 17), [['saar', '萨尔', q('与法国组成经济与关税联盟，最终地位留待和约确定', '各国法令')]]],
  [1948, md(3, 7), [['gr', '多德卡尼斯', '各国法令']]],
  [1949, md(5, 23), [['de', '美占区 英占区 法占区', '各国法令']]],
  [1949, md(10, 7), [['dd', '苏占区', '各国法令']]],
];

const ZHOU_LABELS = [];

// 城邑：各国首都，以及几座疆界变动所在的城市
const CITIES = [
  { n: [[1945, '柏林']], ll: [13.4, 52.52], m: '今德国柏林', cap: 1 },
  { n: [[1945, '波恩']], ll: [7.1, 50.73], m: '今德国波恩' },
  { n: [[1945, '法兰克福']], ll: [8.68, 50.11], m: '今德国美因河畔法兰克福' },
  { n: [[1945, '汉堡']], ll: [9.99, 53.55], m: '今德国汉堡' },
  { n: [[1945, '慕尼黑']], ll: [11.58, 48.14], m: '今德国慕尼黑' },
  { n: [[1945, '波茨坦']], ll: [13.06, 52.4], m: '今德国波茨坦' },
  { n: [[1945, '萨尔布吕肯']], ll: [7.0, 49.23], m: '今德国萨尔布吕肯' },
  { n: [[1945, '维也纳']], ll: [16.37, 48.21], m: '今奥地利维也纳', cap: 1 },
  { n: [[1945, '华沙']], ll: [21.01, 52.23], m: '今波兰华沙', cap: 1 },
  { n: [[1945, '什切青']], ll: [14.55, 53.43], m: '今波兰什切青' },
  { n: [[1945, '弗罗茨瓦夫']], ll: [17.03, 51.11], m: '今波兰弗罗茨瓦夫' },
  { n: [[1945, '格但斯克']], ll: [18.65, 54.35], m: '今波兰格但斯克' },
  { n: [[1945, '柯尼斯堡'], [1946.508, '加里宁格勒']], ll: [20.51, 54.71], m: '今俄罗斯加里宁格勒' },
  { n: [[1945, '乌日霍罗德']], ll: [22.29, 48.62], m: '今乌克兰乌日霍罗德' },
  { n: [[1945, '莫斯科']], ll: [37.62, 55.75], m: '今俄罗斯莫斯科', cap: 1 },
  { n: [[1945, '布拉格']], ll: [14.42, 50.09], m: '今捷克布拉格', cap: 1 },
  { n: [[1945, '布达佩斯']], ll: [19.04, 47.5], m: '今匈牙利布达佩斯', cap: 1 },
  { n: [[1945, '布加勒斯特']], ll: [26.1, 44.43], m: '今罗马尼亚布加勒斯特', cap: 1 },
  { n: [[1945, '索非亚']], ll: [23.32, 42.7], m: '今保加利亚索非亚', cap: 1 },
  { n: [[1945, '贝尔格莱德']], ll: [20.46, 44.82], m: '今塞尔维亚贝尔格莱德', cap: 1 },
  { n: [[1945, '地拉那']], ll: [19.82, 41.33], m: '今阿尔巴尼亚地拉那', cap: 1 },
  { n: [[1945, '雅典']], ll: [23.73, 37.98], m: '今希腊雅典', cap: 1 },
  { n: [[1945, '罗得']], ll: [28.22, 36.43], m: '今希腊罗得岛罗得城' },
  { n: [[1945, '罗马']], ll: [12.5, 41.9], m: '今意大利罗马', cap: 1 },
  { n: [[1945, '的里雅斯特']], ll: [13.77, 45.65], m: '今意大利的里雅斯特' },
  { n: [[1945, '戈里齐亚']], ll: [13.62, 45.94], m: '今意大利戈里齐亚' },
  { n: [[1945, '普拉']], ll: [13.85, 44.87], m: '今克罗地亚普拉' },
  { n: [[1945, '里耶卡']], ll: [14.44, 45.33], m: '今克罗地亚里耶卡，当时意大利称阜姆' },
  { n: [[1945, '科佩尔']], ll: [13.73, 45.55], m: '今斯洛文尼亚科佩尔' },
  { n: [[1945, '巴黎']], ll: [2.35, 48.85], m: '今法国巴黎', cap: 1 },
  { n: [[1945, '戛纳']], ll: [7.02, 43.55], m: '今法国戛纳' },
  { n: [[1945, '布鲁塞尔']], ll: [4.35, 50.85], m: '今比利时布鲁塞尔', cap: 1 },
  { n: [[1945, '阿姆斯特丹']], ll: [4.9, 52.37], m: '今荷兰阿姆斯特丹', cap: 1 },
  { n: [[1945, '卢森堡']], ll: [6.13, 49.61], m: '今卢森堡', cap: 1 },
  { n: [[1945, '伯尔尼']], ll: [7.45, 46.95], m: '今瑞士伯尔尼', cap: 1 },
  { n: [[1945, '日内瓦']], ll: [6.14, 46.2], m: '今瑞士日内瓦' },
  { n: [[1945, '哥本哈根']], ll: [12.57, 55.68], m: '今丹麦哥本哈根', cap: 1 },
  { n: [[1945, '赫尔辛基']], ll: [24.94, 60.17], m: '今芬兰赫尔辛基', cap: 1 },
  { n: [[1945, '伦敦']], ll: [-0.13, 51.51], m: '今英国伦敦', cap: 1 },
  { n: [[1945, '爱丁堡']], ll: [-3.19, 55.95], m: '今英国爱丁堡' },
  { n: [[1945, '曼彻斯特']], ll: [-2.24, 53.48], m: '今英国曼彻斯特' },
  { n: [[1945, '都柏林']], ll: [-6.26, 53.35], m: '今爱尔兰都柏林', cap: 1 },
  { n: [[1945, '马德里']], ll: [-3.7, 40.42], m: '今西班牙马德里', cap: 1 },
  { n: [[1945, '里斯本']], ll: [-9.14, 38.72], m: '今葡萄牙里斯本', cap: 1 },
  { n: [[1945, '斯德哥尔摩']], ll: [18.07, 59.33], m: '今瑞典斯德哥尔摩', cap: 1 },
  { n: [[1945, '奥斯陆']], ll: [10.75, 59.91], m: '今挪威奥斯陆', cap: 1 },
  { n: [[1945, '雷克雅未克']], ll: [-21.9, 64.14], m: '今冰岛雷克雅未克', cap: 1 },
];

const PHASES = [
  [1945, 1945, '四国占领'], [1946, 1947, '巴黎和约'], [1948, 1949, '两个德国'],
];

// 事件：y 年，mo 月（md(月, 日) 只用于排序），cal 页面上显示的日期，ll [经度, 纬度]，k pol|dip|eco|cul，refs 依据，who 参与人物
const EVENTS = [
  { y: 1945, mo: md(4, 27), cal: '1945 年 4 月 27 日', t: '奥地利宣布恢复独立', p: '维也纳', m: '今奥地利维也纳', ll: [16.37, 48.21], k: 'pol', refs: ['各国法令'],
    d: '维也纳的临时政府发表宣言，宣布奥地利共和国恢复独立，1938 年与德国的合并无效，卡尔·伦纳任临时政府总理。这时奥地利各地仍在盟军各部队的占领之下。', who: ['卡尔·伦纳'] },
  { y: 1945, mo: md(5, 8), cal: '1945 年 5 月 8 日', t: '德国无条件投降生效', p: '柏林卡尔斯霍斯特', m: '今德国柏林', ll: [13.53, 52.48], k: 'pol', refs: ['盟国文件'],
    d: '德国武装部队的无条件投降书在柏林卡尔斯霍斯特再次签署，于当天中欧时间 23 时 01 分生效，欧洲的战事结束。德国全境由盟军各部队占领，地图上暂用一种颜色，叠斜线。', who: [] },
  { y: 1945, mo: md(6, 5), cal: '1945 年 6 月 5 日', t: '柏林宣言：德国分为四个占领区', p: '柏林', m: '今德国柏林', ll: [13.4, 52.52], k: 'pol', refs: ['盟国文件'],
    d: '美国、英国、苏联、法国四国的军事长官在柏林签署宣言，宣布接管德国的最高权力，德国按 1937 年 12 月 31 日的疆界分为四个占领区，由四国军事长官组成的盟国管制委员会处理全德事务；柏林单列，由四国共管。各国部队在 7 月初调整到各自的占领区。', who: [] },
  { y: 1945, mo: md(6, 12), cal: '1945 年 6 月 12 日', t: '的里雅斯特分为 A、B 两区', p: '的里雅斯特', m: '今意大利的里雅斯特', ll: [13.77, 45.65], k: 'pol', refs: ['条约与协定'],
    d: '按 6 月 9 日南斯拉夫政府（总理铁托）与英美两国在贝尔格莱德签订的协定，5 月 1 日进入的里雅斯特的南斯拉夫军队撤出该城。原属意大利的威尼斯朱利亚地区以“摩根线”为界：西侧的 A 区（的里雅斯特、戈里齐亚和伊斯特拉南端的普拉）由英美军政府管理，东侧的 B 区由南斯拉夫军队管理，归属留待和约确定。', who: ['约瑟普·布罗兹·铁托'] },
  { y: 1945, mo: md(6, 29), cal: '1945 年 6 月 29 日', t: '外喀尔巴阡划归苏联', p: '乌日霍罗德', m: '今乌克兰乌日霍罗德', ll: [22.29, 48.62], k: 'dip', refs: ['条约与协定'],
    d: '捷克斯洛伐克与苏联在莫斯科签订条约，把捷克斯洛伐克东端的外喀尔巴阡乌克兰（首府乌日霍罗德）划归苏联，并入乌克兰苏维埃社会主义共和国。', who: [] },
  { y: 1945, mo: md(7, 9), cal: '1945 年 7 月 9 日', t: '奥地利分为四个占领区', p: '奥地利', m: '今奥地利', ll: [14.5, 47.6], k: 'pol', refs: ['盟国文件'],
    d: '四国在伦敦的欧洲咨询委员会签订协定，把奥地利分为四个占领区：东北部归苏联，西北部的萨尔茨堡与上奥地利南部归美国，南部的施蒂里亚、克恩滕与东蒂罗尔归英国，西部的蒂罗尔与福拉尔贝格归法国。维也纳也分为四区，市中心由四国轮流管理。奥地利保留自己的政府。', who: [] },
  { y: 1945, mo: md(8, 2), cal: '1945 年 8 月 2 日', t: '波茨坦会议议定新的东部边界', p: '波茨坦', m: '今德国波茨坦', ll: [13.06, 52.4], k: 'dip', refs: ['盟国文件'],
    d: '美国、英国、苏联三国首脑在波茨坦的会议结束，发表公报：奥得河与西尼斯河以东的原德国领土（包括原但泽自由市）交由波兰管理，不算作苏联占领区的一部分；柯尼斯堡及其周边交由苏联管理；最终边界都留待和约确定。会议还议定把留在波兰、捷克斯洛伐克、匈牙利的德意志人迁往德国。', who: [] },
  { y: 1945, mo: md(8, 16), cal: '1945 年 8 月 16 日', t: '波兰与苏联签订边界条约', p: '布格河一带', m: '今波兰与白俄罗斯、乌克兰的边界', ll: [23.6, 52.4], k: 'dip', refs: ['条约与协定'],
    d: '波兰与苏联在莫斯科签订边界条约，两国的边界大体沿“寇松线”划定，个别地段（如比亚韦斯托克一带）划在线的东侧、归波兰。1939 年以前属波兰的利沃夫、维尔纽斯等地留在苏联境内。', who: [] },
  { y: 1945, mo: md(11, 16), cal: '1945 年 11 月 16 日', t: '联合国教科文组织组织法签署', p: '伦敦', m: '今英国伦敦', ll: [-0.13, 51.51], k: 'cul', refs: ['联合国记录'],
    d: '在伦敦召开的会议通过并签署《联合国教育、科学及文化组织组织法》，三十七个国家签字。组织法在第二年 11 月 4 日生效，总部设在巴黎。', who: [] },
  { y: 1945, mo: md(11, 29), cal: '1945 年 11 月 29 日', t: '南斯拉夫联邦人民共和国成立', p: '贝尔格莱德', m: '今塞尔维亚贝尔格莱德', ll: [20.46, 44.82], k: 'pol', refs: ['各国法令'],
    d: '南斯拉夫制宪议会宣布成立南斯拉夫联邦人民共和国，由塞尔维亚、克罗地亚、斯洛文尼亚、波斯尼亚和黑塞哥维那、马其顿、黑山六个共和国组成。', who: ['约瑟普·布罗兹·铁托'] },
  { y: 1945, mo: md(12, 20), cal: '1945 年 12 月 20 日', t: '伦纳当选奥地利总统', p: '维也纳', m: '今奥地利维也纳', ll: [16.37, 48.21], k: 'pol', refs: ['各国法令'],
    d: '奥地利联邦大会选举卡尔·伦纳为联邦总统。', who: ['卡尔·伦纳'] },
  { y: 1946, mo: md(1, 11), cal: '1946 年 1 月 11 日', t: '阿尔巴尼亚人民共和国成立', p: '地拉那', m: '今阿尔巴尼亚地拉那', ll: [19.82, 41.33], k: 'pol', refs: ['各国法令'],
    d: '阿尔巴尼亚制宪议会宣布成立阿尔巴尼亚人民共和国。', who: [] },
  { y: 1946, mo: md(2, 1), cal: '1946 年 2 月 1 日', t: '匈牙利改为共和国', p: '布达佩斯', m: '今匈牙利布达佩斯', ll: [19.04, 47.5], k: 'pol', refs: ['各国法令'],
    d: '匈牙利国民议会通过法律，宣布匈牙利为共和国。', who: [] },
  { y: 1946, mo: md(4, 5), cal: '1946 年 4 月 5 日', t: '苏军撤离博恩霍尔姆岛', p: '博恩霍尔姆', m: '今丹麦博恩霍尔姆', ll: [14.92, 55.1], k: 'pol', refs: ['盟国文件'],
    d: '1945 年 5 月进驻丹麦博恩霍尔姆岛的苏军撤离，岛上交还丹麦管理。', who: [] },
  { y: 1946, mo: md(4, 7), cal: '1946 年 4 月 7 日', t: '设柯尼斯堡州', p: '柯尼斯堡', m: '今俄罗斯加里宁格勒', ll: [20.51, 54.71], k: 'pol', refs: ['各国法令'],
    d: '苏联最高苏维埃主席团颁布法令，在原东普鲁士北部设柯尼斯堡州，划入俄罗斯苏维埃联邦社会主义共和国。', who: [] },
  { y: 1946, mo: md(6, 2), cal: '1946 年 6 月 2 日', t: '意大利公决改为共和国', p: '罗马', m: '今意大利罗马', ll: [12.5, 41.9], k: 'pol', refs: ['各国法令'],
    d: '意大利举行全民公决，多数票赞成共和制，同时选举制宪议会；这是意大利妇女第一次在全国选举中投票。6 月 13 日，国王翁贝托二世离开意大利。', who: [] },
  { y: 1946, mo: md(7, 4), cal: '1946 年 7 月 4 日', t: '柯尼斯堡改名加里宁格勒', p: '加里宁格勒', m: '今俄罗斯加里宁格勒', ll: [20.51, 54.71], k: 'pol', refs: ['城市记录'],
    d: '苏联最高苏维埃主席团颁布法令，把柯尼斯堡改名为加里宁格勒，柯尼斯堡州随之改称加里宁格勒州。', who: [] },
  { y: 1946, mo: md(7, 29), cal: '1946 年 7 月 29 日', t: '巴黎和会开幕', p: '巴黎卢森堡宫', m: '今法国巴黎', ll: [2.34, 48.85], k: 'dip', refs: ['条约与协定'],
    d: '二十一个国家的代表在巴黎卢森堡宫开会，讨论对意大利、罗马尼亚、匈牙利、保加利亚、芬兰五国的和约草案。会议开到 10 月 15 日。', who: [] },
  { y: 1946, mo: md(9, 15), cal: '1946 年 9 月 15 日', t: '保加利亚人民共和国成立', p: '索非亚', m: '今保加利亚索非亚', ll: [23.32, 42.7], k: 'pol', refs: ['各国法令'],
    d: '9 月 8 日的全民公决多数票赞成废除君主制，9 月 15 日保加利亚宣布为人民共和国。', who: [] },
  { y: 1946, mo: md(9, 20), cal: '1946 年 9 月 20 日', t: '第一届戛纳电影节', p: '戛纳', m: '今法国戛纳', ll: [7.02, 43.55], k: 'cul', refs: ['文化记录'],
    d: '原定 1939 年 9 月举办、因战争取消的戛纳国际电影节，在战后第一次举行，开到 10 月 5 日，十几个国家的影片参展。', who: [] },
  { y: 1947, mo: md(1, 1), cal: '1947 年 1 月 1 日', t: '美英占领区合并经济管理', p: '法兰克福', m: '今德国美因河畔法兰克福', ll: [8.68, 50.11], k: 'eco', refs: ['盟国文件'],
    d: '美国与英国占领区在经济上合并管理，称“双占区”。两国的占领区在行政上仍各自分开。', who: [] },
  { y: 1947, mo: md(2, 10), cal: '1947 年 2 月 10 日', t: '巴黎和约签署', p: '巴黎', m: '今法国巴黎', ll: [2.35, 48.85], k: 'dip', refs: ['条约与协定'],
    d: '同盟国在巴黎与意大利、罗马尼亚、匈牙利、保加利亚、芬兰分别签署和约。意大利把伊斯特拉、阜姆（里耶卡）、扎拉（扎达尔）等地割给南斯拉夫，把多德卡尼斯群岛割给希腊，把阿尔卑斯山边界上的坦德、布里格两地割给法国，的里雅斯特及其周边设为自由区；罗马尼亚确认北特兰西瓦尼亚归还，比萨拉比亚与北布科维纳归苏联；芬兰确认佩琴加割给苏联，波卡拉半岛租给苏联五十年。和约在 9 月 15 日生效。', who: [] },
  { y: 1947, mo: md(3, 31), cal: '1947 年 3 月 31 日', t: '多德卡尼斯群岛交希腊管理', p: '罗得岛', m: '今希腊罗得岛', ll: [28.22, 36.43], k: 'pol', refs: ['条约与协定'],
    d: '英国军政府把多德卡尼斯群岛移交希腊军政府管理。', who: [] },
  { y: 1947, mo: md(6, 25), cal: '1947 年 6 月 25 日', t: '《安妮日记》出版', p: '阿姆斯特丹', m: '今荷兰阿姆斯特丹', ll: [4.88, 52.38], k: 'cul', refs: ['文化记录'],
    d: '阿姆斯特丹的出版社出版安妮·弗兰克在藏身处写下的日记，荷兰文书名《后屋》，初版印了三千册。安妮 1945 年初死在贝尔根-贝尔森集中营，日记由她的父亲奥托·弗兰克整理出版，后来译成七十多种文字。', who: ['奥托·弗兰克'] },
  { y: 1947, mo: md(8, 24), cal: '1947 年 8 月 24 日', t: '第一届爱丁堡国际艺术节', p: '爱丁堡', m: '今英国爱丁堡', ll: [-3.19, 55.95], k: 'cul', refs: ['文化记录'],
    d: '爱丁堡国际艺术节第一次举办，有音乐、戏剧与舞蹈演出。没有受到邀请的八个剧团自行在城里演出，后来发展成同时举办的边缘艺术节。', who: [] },
  { y: 1947, mo: md(9, 15), cal: '1947 年 9 月 15 日', t: '巴黎和约生效，的里雅斯特自由区成立', p: '的里雅斯特', m: '今意大利的里雅斯特', ll: [13.77, 45.65], k: 'dip', refs: ['条约与协定'],
    d: '巴黎和约生效。伊斯特拉与阜姆（里耶卡）划归南斯拉夫，戈里齐亚城留在意大利。的里雅斯特自由区成立，由联合国安理会保障，在选定总督以前，北部的 A 区（的里雅斯特城）仍由英美军政府管理，南部的 B 区（科佩尔一带）由南斯拉夫军政府管理。', who: [] },
  { y: 1947, mo: md(12, 17), cal: '1947 年 12 月 17 日', t: '萨尔宪法生效', p: '萨尔布吕肯', m: '今德国萨尔布吕肯', ll: [7.0, 49.23], k: 'pol', refs: ['各国法令'],
    d: '萨尔宪法生效。萨尔在政治上与德国其他部分分开，与法国组成经济与关税联盟，法国派驻高级专员，最终地位留待和约确定。', who: [] },
  { y: 1947, mo: md(12, 30), cal: '1947 年 12 月 30 日', t: '罗马尼亚人民共和国成立', p: '布加勒斯特', m: '今罗马尼亚布加勒斯特', ll: [26.1, 44.43], k: 'pol', refs: ['各国法令'],
    d: '罗马尼亚国王米哈伊一世退位，议会宣布成立罗马尼亚人民共和国。', who: [] },
  { y: 1948, mo: md(3, 7), cal: '1948 年 3 月 7 日', t: '多德卡尼斯群岛并入希腊', p: '罗得岛', m: '今希腊罗得岛', ll: [28.22, 36.43], k: 'pol', refs: ['各国法令'],
    d: '多德卡尼斯群岛正式并入希腊，岛上的军政府结束。', who: [] },
  { y: 1948, mo: md(4, 7), cal: '1948 年 4 月 7 日', t: '世界卫生组织成立', p: '日内瓦', m: '今瑞士日内瓦', ll: [6.14, 46.2], k: 'cul', refs: ['联合国记录'],
    d: '《世界卫生组织组织法》在第二十六个会员国批准后生效，世界卫生组织成立，总部设在日内瓦。这一天后来定为世界卫生日。', who: [] },
  { y: 1948, mo: md(4, 16), cal: '1948 年 4 月 16 日', t: '欧洲经济合作组织成立', p: '巴黎', m: '今法国巴黎', ll: [2.35, 48.85], k: 'eco', refs: ['条约与协定'],
    d: '十六个西欧国家与西部占领区的代表在巴黎签署公约，成立欧洲经济合作组织，协调分配美国的援助（马歇尔计划）。', who: [] },
  { y: 1948, mo: md(6, 20), cal: '1948 年 6 月 20 日', t: '西部占领区发行德国马克', p: '法兰克福', m: '今德国美因河畔法兰克福', ll: [8.68, 50.11], k: 'eco', refs: ['盟国文件'],
    d: '美、英、法三国占领区进行货币改革，以德国马克取代帝国马克。几天后，苏联占领区也发行了自己的新货币。', who: [] },
  { y: 1948, mo: md(6, 21), cal: '1948 年 6 月 21 日', t: '曼彻斯特小型实验机运行第一个程序', p: '曼彻斯特大学', m: '今英国曼彻斯特', ll: [-2.23, 53.47], k: 'cul', refs: ['科技记录'],
    d: '曼彻斯特大学的“小型实验机”第一次运行了存储在自己内存里的程序，程序求一个数的最大真因数，运行了五十多分钟。这是第一台能运行存储程序的电子计算机。', who: ['汤姆·基尔伯恩', '弗雷德里克·威廉斯'] },
  { y: 1948, mo: md(6, 24), cal: '1948 年 6 月 24 日', t: '柏林封锁开始', p: '柏林', m: '今德国柏林', ll: [13.4, 52.52], k: 'pol', refs: ['盟国文件'],
    d: '通往柏林西部三个占领区的铁路、公路与水路全部中断。两天后，美国与英国开始用飞机向柏林西区运送食品与燃料，这次空运持续了将近十一个月。', who: [] },
  { y: 1948, mo: md(7, 29), cal: '1948 年 7 月 29 日', t: '伦敦奥运会开幕', p: '伦敦温布利球场', m: '今英国伦敦', ll: [-0.28, 51.56], k: 'cul', refs: ['文化记录'],
    d: '第十四届夏季奥运会在伦敦温布利球场开幕，五十九个国家和地区的约四千名运动员参加，是 1936 年以后的第一届奥运会。德国与日本没有受到邀请。第二天，捷克斯洛伐克的扎托佩克赢得男子一万米金牌。', who: ['埃米尔·扎托佩克'] },
  { y: 1948, mo: md(8, 7), cal: '1948 年 8 月 7 日', t: '布兰克斯-科恩获得第四枚金牌', p: '伦敦温布利球场', m: '今英国伦敦', ll: [-0.28, 51.56], k: 'cul', refs: ['文化记录'],
    d: '荷兰的布兰克斯-科恩随荷兰队赢得女子四乘一百米接力，这是她在伦敦奥运会上的第四枚金牌，此前她赢得了一百米、八十米栏和二百米。', who: ['范妮·布兰克斯-科恩'] },
  { y: 1948, mo: md(12, 10), cal: '1948 年 12 月 10 日', t: '联合国大会通过世界人权宣言', p: '巴黎夏乐宫', m: '今法国巴黎', ll: [2.29, 48.86], k: 'dip', refs: ['联合国记录'],
    d: '联合国大会在巴黎夏乐宫开会，通过《世界人权宣言》，四十八票赞成，八票弃权。这一天后来定为人权日。', who: [] },
  { y: 1949, mo: md(1, 25), cal: '1949 年 1 月 25 日', t: '经济互助委员会成立', p: '莫斯科', m: '今俄罗斯莫斯科', ll: [37.62, 55.75], k: 'eco', refs: ['条约与协定'],
    d: '苏联、波兰、捷克斯洛伐克、匈牙利、罗马尼亚、保加利亚六国宣布成立经济互助委员会，总部设在莫斯科。阿尔巴尼亚在一个月后加入。', who: [] },
  { y: 1949, mo: md(4, 18), cal: '1949 年 4 月 18 日', t: '爱尔兰共和国法生效', p: '都柏林', m: '今爱尔兰都柏林', ll: [-6.26, 53.35], k: 'pol', refs: ['各国法令'],
    d: '爱尔兰的《爱尔兰共和国法》生效，宣布国家称为爱尔兰共和国，并离开英联邦。', who: [] },
  { y: 1949, mo: md(5, 5), cal: '1949 年 5 月 5 日', t: '欧洲委员会成立', p: '伦敦', m: '今英国伦敦', ll: [-0.13, 51.51], k: 'dip', refs: ['条约与协定'],
    d: '十个西欧国家在伦敦签署《欧洲委员会规约》，成立欧洲委员会，总部设在法国斯特拉斯堡。', who: [] },
  { y: 1949, mo: md(5, 12), cal: '1949 年 5 月 12 日', t: '柏林封锁结束', p: '柏林', m: '今德国柏林', ll: [13.4, 52.52], k: 'pol', refs: ['盟国文件'],
    d: '通往柏林西区的陆路与水路恢复通行。空运又持续到 9 月底，前后共运送了两百多万吨物资。', who: [] },
  { y: 1949, mo: md(5, 23), cal: '1949 年 5 月 23 日', t: '德意志联邦共和国成立', p: '波恩', m: '今德国波恩', ll: [7.1, 50.73], k: 'pol', refs: ['各国法令'],
    d: '议会委员会在波恩签署并公布《德意志联邦共和国基本法》，美、英、法三国占领区的十一个州组成德意志联邦共和国，波恩为临时首都。议会委员会主席阿登纳和委员豪斯等人在基本法上签字。占领国仍保留部分权力。', who: ['康拉德·阿登纳', '特奥多尔·豪斯'] },
  { y: 1949, mo: md(8, 20), cal: '1949 年 8 月 20 日', t: '匈牙利人民共和国成立', p: '布达佩斯', m: '今匈牙利布达佩斯', ll: [19.04, 47.5], k: 'pol', refs: ['各国法令'],
    d: '匈牙利新宪法生效，国名改为匈牙利人民共和国。', who: [] },
  { y: 1949, mo: md(9, 12), cal: '1949 年 9 月 12 日', t: '豪斯当选联邦总统', p: '波恩', m: '今德国波恩', ll: [7.1, 50.73], k: 'pol', refs: ['各国法令'],
    d: '联邦大会在波恩选举特奥多尔·豪斯为联邦德国第一任联邦总统。', who: ['特奥多尔·豪斯'] },
  { y: 1949, mo: md(9, 15), cal: '1949 年 9 月 15 日', t: '阿登纳当选联邦总理', p: '波恩', m: '今德国波恩', ll: [7.1, 50.73], k: 'pol', refs: ['各国法令'],
    d: '联邦议院选举康拉德·阿登纳为联邦德国第一任联邦总理。', who: ['康拉德·阿登纳'] },
  { y: 1949, mo: md(10, 7), cal: '1949 年 10 月 7 日', t: '德意志民主共和国成立', p: '柏林', m: '今德国柏林', ll: [13.4, 52.52], k: 'pol', refs: ['各国法令'],
    d: '在柏林举行的德国人民委员会宣布成为临时人民议院，宪法生效，苏联占领区成立德意志民主共和国。', who: [] },
  { y: 1949, mo: md(10, 11), cal: '1949 年 10 月 11 日', t: '皮克当选民主德国总统', p: '柏林', m: '今德国柏林', ll: [13.4, 52.52], k: 'pol', refs: ['各国法令'],
    d: '民主德国的临时人民议院与临时州议院选举威廉·皮克为总统。', who: ['威廉·皮克'] },
];

const PEOPLE_RAW = [
  // 各国领导人：只写职务与任期，不作评价
  ['康拉德·阿登纳', 'de', '', '1876–1967', '1948 年 9 月起任议会委员会主席，1949 年 9 月当选联邦德国第一任联邦总理，任职到 1963 年 10 月。'],
  ['特奥多尔·豪斯', 'de', '', '1884–1963', '1949 年 9 月当选联邦德国第一任联邦总统，1954 年连任，任职到 1959 年 9 月。'],
  ['威廉·皮克', 'dd', '', '1876–1960', '1949 年 10 月当选民主德国总统，1953 年、1957 年连任，任职到 1960 年 9 月去世。民主德国此后不再设总统。'],
  ['卡尔·伦纳', 'at', '', '1870–1950', '1918 年至 1920 年任奥地利第一共和国总理。1945 年 4 月任奥地利临时政府总理，12 月当选联邦总统，任职到 1950 年 12 月去世。'],
  ['约瑟普·布罗兹·铁托', 'yu', '', '1892–1980', '1945 年 3 月起任南斯拉夫政府总理，1953 年起任总统，1974 年起为终身总统，任职到 1980 年 5 月去世。'],
  // 文化、科学、体育
  ['奥托·弗兰克', 'nl', '', '1889–1980', '安妮·弗兰克的父亲，生于法兰克福，1933 年移居阿姆斯特丹。一家藏身处的八个人里，只有他在集中营里活了下来。1947 年整理出版女儿的日记，后来设立安妮·弗兰克基金会。'],
  ['范妮·布兰克斯-科恩', 'nl', '', '1918–2004', '荷兰田径运动员。1948 年伦敦奥运会上赢得一百米、二百米、八十米栏和四乘一百米接力四枚金牌，当时已是两个孩子的母亲。'],
  ['埃米尔·扎托佩克', 'cs', '', '1922–2000', '捷克斯洛伐克长跑运动员。1948 年伦敦奥运会赢得男子一万米金牌；1952 年赫尔辛基奥运会在一周内赢得五千米、一万米和马拉松三枚金牌。'],
  ['汤姆·基尔伯恩', 'gb', '', '1921–2001', '英国计算机工程师。与威廉斯在曼彻斯特大学造出“小型实验机”，为它编写了第一个程序，后来主持设计了曼彻斯特的几代计算机。'],
  ['弗雷德里克·威廉斯', 'gb', '', '1911–1977', '英国电气工程师。发明用阴极射线管存储数据的“威廉斯管”，曼彻斯特的“小型实验机”用它作内存。'],
];
