// 列国舆图 · 冷战欧洲（1950 – 1988）数据包：的里雅斯特分归意大利与南斯拉夫 — 奥地利国家条约 — 萨尔回归联邦德国 — 塞浦路斯、马耳他独立 —
// 柏林墙 — 奥得河—尼斯河线的条约 — 1974 年的塞浦路斯 — 欧洲共同体扩大。
// 只记疆域与国家的变动，以及欧洲的文化、科技大事；不写评价，各国领导人只写职务与任期；战事只写结果。
// 日期据各国之间的条约与协定、各国的宪法与法令、联合国的记录。本卷不收引文。
// 月份写成 md(月, 日)，只用来给同月的事件排先后；页面上的日期见各事件的 cal。地块用欧洲底图（德国按州下的行政区，奥地利、波兰等按更小的地区）；
// 柏林、塞浦路斯在底图里各是一整块，城内与岛上的分界没有画出，只用斜线说明。

const md = (m, d) => +(m + (d - 1) / 31).toFixed(3);

const BOOK = {
  id: 'lengzhan',
  title: '冷战欧洲舆图',
  brand: '冷战欧洲',
  seal: '列',
  subtitle: '据各国之间的条约与协定、各国宪法与法令 · 的里雅斯特 — 奥地利国家条约 — 萨尔 — 塞浦路斯、马耳他 — 柏林墙 — 奥得河—尼斯河线 — 欧洲共同体 · 1950 – 1988',
  basemap: 'europe',
  range: [1950, 1988],
  startYear: 1950,
  baseFaction: 'fr',
  viewMax: 3,
  view: [[-10, 37], [-8, 58], [16, 60], [30, 58], [36, 35], [14, 35]],
  scope: { provinces: ['德国', '奥地利', '波兰', '捷克', '斯洛伐克', '匈牙利', '罗马尼亚', '保加利亚', '斯洛文尼亚', '克罗地亚', '波黑', '塞尔维亚', '黑山', '北马其顿', '科索沃', '阿尔巴尼亚', '希腊', '意大利',
    '法国', '比利时', '荷兰', '卢森堡', '瑞士', '丹麦', '芬兰', '俄罗斯', '乌克兰', '白俄罗斯', '摩尔多瓦', '立陶宛', '拉脱维亚', '爱沙尼亚', '英国', '爱尔兰', '西班牙', '葡萄牙', '瑞典', '挪威', '冰岛',
    '塞浦路斯', '马耳他', '土耳其'] },
  regions: {
    toggle: '今国界',
    unit: '地区', group: '',
    legendNote: '地块按今天的行政区拼合（德国按州下的行政区，奥地利、波兰等按更小的地区）。柏林与塞浦路斯在底图里各是一整块，城内与岛上的分界线没有画出。斜线表示归属留待和约确定、几国共管，或部分地方由他国军队控制',
    order: ['德国', '奥地利', '波兰', '捷克', '斯洛伐克', '匈牙利', '罗马尼亚', '保加利亚', '斯洛文尼亚', '克罗地亚', '波黑', '塞尔维亚', '黑山', '北马其顿', '科索沃', '阿尔巴尼亚', '希腊', '意大利',
      '法国', '比利时', '荷兰', '卢森堡', '瑞士', '丹麦', '芬兰', '俄罗斯', '乌克兰', '白俄罗斯', '摩尔多瓦', '立陶宛', '拉脱维亚', '爱沙尼亚', '英国', '爱尔兰', '西班牙', '葡萄牙', '瑞典', '挪威', '冰岛',
      '塞浦路斯', '马耳他', '土耳其'],
  },
  calendar: { ganzhi: false, label: () => [] },
  source: {
    type: 'sections', heading: '依据',
    titles: {
      '条约与协定': '1950 年的格尔利茨条约，1954 年的伦敦谅解备忘录，1955 年的奥地利国家条约，1956 年的卢森堡条约，1959 年的苏黎世—伦敦协定，1970 年的华沙条约，1971 年的柏林四方协定，1972 年的两德基础条约，欧洲共同体的条约',
      '各国法令': '各国的宪法、独立法令、全民公决结果与政府公告',
      '联合国记录': '联合国安理会的决议与接纳会员国的记录',
      '战事记录': '各方军队进驻与撤离的记录',
      '文化记录': '音乐、电视节目与研究机构的记录',
      '科技记录': '航天、航空、生物学与核能的记录',
    },
  },
  tags: {},
  quoteLabel: '原文',
  hatchNote: '斜线：归属留待和约确定、几国共管，或部分地方由他国军队控制',
  ziLabel: '',
  vassalRealm: '附属',
  otherRealm: '各国',
  peopleGroups: [['de', '联邦德国'], ['dd', '民主德国'], ['at', '奥地利'], ['pl', '波兰'], ['yu', '南斯拉夫'], ['cy', '塞浦路斯'], ['mt', '马耳他'], ['fi', '芬兰'], ['ussr', '苏联'], ['gb', '英国']],
  otherGroup: '其他',
  storyDefault: ['康拉德·阿登纳', '维利·勃兰特', '谢尔盖·科罗廖夫'],
  searchHint: '搜索地名或人物，如：的里雅斯特、萨尔、尼科西亚、勃兰特',
  notes: '1950 年欧洲分为东西两部分，德国分为联邦德国与民主德国，柏林仍由四国占领，奥地利仍分为四个占领区。1954 年的里雅斯特自由区的 A 区交给意大利、B 区交给南斯拉夫；1955 年奥地利国家条约生效，占领结束；1957 年萨尔回归联邦德国。1960 年塞浦路斯、1964 年马耳他独立。1961 年民主德国在东西柏林之间修起柏林墙。1970 年联邦德国与波兰签订条约，承认奥得河—尼斯河线；1973 年两个德国同时加入联合国。1974 年塞浦路斯北部由土耳其军队控制。欧洲经济共同体 1957 年由六国创立，此后陆续扩大到十二国。这些年里，DNA 双螺旋结构发表，欧洲核子研究组织成立，苏联发射第一颗人造卫星并送加加林进入太空，协和式客机首飞，切尔诺贝利核电站发生事故。',
  musicTitle: '原创合成的背景音。',
};

// 颜色：同一国家在列国舆图各卷用同一颜色（沿用《战后重划》卷）。
const FACTIONS = {
  saar:  { color: '#c9b06a', name: () => '萨尔（与法国组成经济与关税联盟）', mapName: () => '萨尔' },
  berlin: { color: '#a8a29a', name: () => '柏林（四国占领，东西分治）', mapName: () => '柏林', hideLabel: true },
  de:    { color: '#d9a63a', name: () => '德意志联邦共和国', mapName: () => '联邦德国' },
  dd:    { color: '#8c6a50', name: () => '德意志民主共和国', mapName: () => '民主德国' },
  at:    { color: '#e08890', name: () => '奥地利共和国', mapName: () => '奥地利' },
  atus:  { color: '#4e43b1', name: () => '奥地利·美国占领区', mapName: () => '美占区', hideLabel: true },
  atgb:  { color: '#c0cc88', name: () => '奥地利·英国占领区', mapName: () => '英占区', hideLabel: true },
  atfr:  { color: '#9961d1', name: () => '奥地利·法国占领区', mapName: () => '法占区', hideLabel: true },
  atsu:  { color: '#d98cc9', name: () => '奥地利·苏联占领区', mapName: () => '奥地利' },
  wien:  { color: '#cbb898', name: () => '维也纳（四国共管）', mapName: () => '维也纳', hideLabel: true },
  ussr:  { color: '#b8483e', name: () => '苏联（苏维埃社会主义共和国联盟）', mapName: () => '苏联' },
  pl:    { color: '#e2a0a8', name: () => '波兰人民共和国', mapName: () => '波兰' },
  cs:    { color: '#4f8fbf', name: () => '捷克斯洛伐克', mapName: () => '捷克斯洛伐克' },
  hu:    { color: '#8cb44a', name: () => '匈牙利人民共和国', mapName: () => '匈牙利' },
  ro:    { color: '#e8d070', name: () => '罗马尼亚', mapName: () => '罗马尼亚' },
  bg:    { color: '#4a9a7a', name: () => '保加利亚人民共和国', mapName: () => '保加利亚' },
  yu:    { color: '#9a6ab0', name: () => '南斯拉夫', mapName: () => '南斯拉夫' },
  al:    { color: '#c87850', name: () => '阿尔巴尼亚', mapName: () => '阿尔巴尼亚' },
  gr:    { color: '#46b4d4', name: () => '希腊', mapName: () => '希腊' },
  it:    { color: '#5a9e5a', name: () => '意大利共和国', mapName: () => '意大利' },
  amg:   { color: '#a8b49c', name: () => '的里雅斯特自由区 A 区（英美军政府管理）', mapName: () => 'A 区', hideLabel: true },
  ftb:   { color: '#d161d1', name: () => '的里雅斯特自由区 B 区（南斯拉夫军队管理）', mapName: () => 'B 区', hideLabel: true },
  fr:    { color: '#3f63a8', name: () => '法兰西共和国', mapName: () => '法国' },
  be:    { color: '#b87c3a', name: () => '比利时王国', mapName: () => '比利时' },
  nl:    { color: '#ef9a3a', name: () => '荷兰王国', mapName: () => '荷兰' },
  lu:    { color: '#6ab0b0', name: () => '卢森堡大公国', mapName: () => '卢森堡' },
  ch:    { color: '#a8608c', name: () => '瑞士联邦', mapName: () => '瑞士' },
  dk:    { color: '#d4507a', name: () => '丹麦王国', mapName: () => '丹麦' },
  fi:    { color: '#c4e0d8', name: () => '芬兰共和国', mapName: () => '芬兰' },
  gb:    { color: '#8fa0b8', name: () => '大不列颠及北爱尔兰联合王国', mapName: () => '英国' },
  brcy:  { color: '#a8c8e8', name: () => '塞浦路斯（英国殖民地）', mapName: () => '塞浦路斯', hideLabel: true },
  brmt:  { color: '#61d161', name: () => '马耳他（英国殖民地）', mapName: () => '', hideLabel: true },
  cy:    { color: '#e2deca', name: () => '塞浦路斯共和国', mapName: () => '塞浦路斯', hideLabel: true },
  mt:    { color: '#b14390', name: () => '马耳他（1974 年起为共和国）', mapName: () => '', hideLabel: true },
  tr:    { color: '#c8b4d8', name: () => '土耳其共和国', mapName: () => '土耳其' },
  ie:    { color: '#7cc08a', name: () => '爱尔兰', mapName: () => '爱尔兰' },
  es:    { color: '#e0a050', name: () => '西班牙', mapName: () => '西班牙' },
  pt:    { color: '#3f8040', name: () => '葡萄牙共和国', mapName: () => '葡萄牙' },
  se:    { color: '#6a8ae0', name: () => '瑞典王国', mapName: () => '瑞典' },
  no:    { color: '#b06050', name: () => '挪威王国', mapName: () => '挪威' },
  is:    { color: '#9ad0c8', name: () => '冰岛共和国', mapName: () => '冰岛' },
};

// 种子点：每个国家一个（在首都），占领区与托管地区各一个；地块按 UNIT_OVERRIDES 归属，
// 德国的 Freiburg、法国的 Jura 与瑞士的州同名，按最近的种子点归属（联邦德国在弗赖堡另放一个，法国在贝桑松另放一个）
const SEEDS_RAW = `
德国|联邦德国|7.1,50.73  德国|弗赖堡|7.85,47.99  德国|萨尔|7.0,49.23  德国|民主德国|12.7,51.8  德国|柏林|13.4,52.52
奥地利|奥地利苏占区|15.63,48.2  奥地利|奥地利美占区|13.04,47.8  奥地利|奥地利英占区|15.44,47.07  奥地利|奥地利法占区|11.4,47.27  奥地利|维也纳|16.37,48.21
波兰|波兰|21.01,52.23  波兰|奥得河—尼斯河以东|17.03,51.11  俄罗斯|加里宁格勒|20.51,54.71  乌克兰|外喀尔巴阡|22.29,48.62
俄罗斯|苏联|37.62,55.75  爱沙尼亚|爱沙尼亚|24.75,59.44  拉脱维亚|拉脱维亚|24.11,56.95  立陶宛|立陶宛|25.28,54.69
捷克|捷克斯洛伐克|14.42,50.09  匈牙利|匈牙利|19.04,47.5  罗马尼亚|罗马尼亚|26.1,44.43  保加利亚|保加利亚|23.32,42.7
塞尔维亚|南斯拉夫|20.46,44.82  斯洛文尼亚|科佩尔|13.73,45.55  阿尔巴尼亚|阿尔巴尼亚|19.82,41.33
希腊|希腊|23.73,37.98  意大利|意大利|12.5,41.9  意大利|的里雅斯特|13.77,45.65
法国|法国|2.35,48.85  法国|法国东部|6.02,47.24  比利时|比利时|4.35,50.85  荷兰|荷兰|4.9,52.37  卢森堡|卢森堡|6.13,49.61  瑞士|瑞士|7.45,46.95
丹麦|丹麦|12.57,55.68  芬兰|芬兰|24.94,60.17  塞浦路斯|塞浦路斯|33.36,35.17  马耳他|马耳他|14.51,35.9  土耳其|土耳其|32.85,39.93
英国|英国|-0.13,51.51  爱尔兰|爱尔兰|-6.26,53.35  西班牙|西班牙|-3.7,40.42  葡萄牙|葡萄牙|-9.14,38.72  瑞典|瑞典|18.07,59.33  挪威|挪威|10.75,59.91  冰岛|冰岛|-21.9,64.14
`;

// 每个今天的行政区（底图里的名称）归哪个种子点
const UNIT_OVERRIDES = Object.fromEntries([
  ['葡萄牙', ['Região Autónoma da Madeira', 'Algarve', 'Baixo Alentejo', 'Alentejo Litoral', 'Alentejo Central', 'Área Metropolitana de Lisboa', 'Lezíria do Tejo', 'Alto Alentejo', 'Oeste', 'Médio Tejo', 'Região de Leiria', 'Beira Baixa', 'Região de Coimbra', 'Beiras e Serra da Estrela', 'Viseu Dão Lafões', 'Região de Aveiro', 'Área Metropolitana do Porto', 'Douro', 'Tâmega e Sousa', 'Ave', 'Terras de Trás-os-Montes', 'Cávado', 'Alto Tâmega', 'Alto Minho']],
  ['西班牙', ['Ceuta', 'Cádiz', 'Málaga', 'Granada', 'Huelva', 'Sevilla', 'Jaén', 'Córdoba', 'Melilla', 'Almería', 'Murcia', 'Alicante/Alacant', 'Albacete', 'Valencia/València', 'Cuenca', 'Teruel', 'Guadalajara', 'Soria', 'Badajoz', 'Ciudad Real', 'Cáceres', 'Toledo', 'Madrid', 'Ávila', 'Salamanca', 'Eivissa y Formentera', 'Mallorca', 'Castellón/Castelló', 'Tarragona', 'Barcelona', 'Lleida', 'Girona', 'Huesca', 'Segovia', 'Zamora', 'Valladolid', 'Ourense', 'Burgos', 'Pontevedra', 'Palencia', 'León', 'Lugo', 'A Coruña', 'Cantabria', 'Asturias', 'Menorca', 'Zaragoza', 'La Rioja', 'Navarra', 'Araba/Álava', 'Gipuzkoa', 'Bizkaia']],
  ['法国', ['Pyrénées-Orientales', 'Ariège', 'Var', 'Bouches-du-Rhône', 'Gard', 'Vaucluse', 'Alpes-de-Haute-Provence', 'Hautes-Alpes', 'Drôme', 'Ardèche', 'Isère', 'Pyrénées-Atlantiques', 'Landes', 'Gironde', 'Charente-Maritime', 'Corse-du-Sud', 'Haute-Corse', 'Alpes-Maritimes', 'Savoie', 'Loire', 'Rhône', 'Ain', 'Haute-Savoie', 'Saône-et-Loire', 'Territoire de Belfort', 'Aude', 'Hautes-Pyrénées', 'Haute-Garonne', 'Hérault', 'Gers', 'Tarn', 'Tarn-et-Garonne', 'Aveyron', 'Lot-et-Garonne', 'Lozère', 'Lot', 'Cantal', 'Haute-Loire', 'Dordogne', 'Corrèze', 'Charente', 'Puy-de-Dôme', 'Haute-Vienne', 'Creuse', 'Allier', 'Deux-Sèvres', 'Vienne', 'Indre', 'Cher', 'Nièvre', 'Indre-et-Loire', 'Loir-et-Cher', 'Yonne', 'Loiret', 'Sarthe', 'Doubs', 'Côte-d’Or', 'Haute-Saône', 'Haute-Marne', 'Vosges', 'Aube', 'Meurthe-et-Moselle', 'Marne', 'Meuse', 'Vendée', 'Loire-Atlantique', 'Maine-et-Loire', 'Morbihan', 'Mayenne', 'Ille-et-Vilaine', 'Côtes-d’Armor', 'Manche', 'Eure-et-Loir', 'Essonne', 'Orne', 'Seine-et-Marne', 'Yvelines', 'Val-de-Marne', 'Hauts-de-Seine', 'Paris', 'Seine-Saint-Denis', 'Val-d’Oise', 'Finistère', 'Eure', 'Calvados', 'Oise', 'Aisne', 'Seine-Maritime', 'Somme', 'Pas-de-Calais', 'Nord', 'Haut-Rhin', 'Bas-Rhin', 'Moselle', 'Ardennes']],
  ['意大利', ['Cagliari', 'Sud Sardegna', 'Oristano', 'Nuoro', 'Sassari', 'Savona', 'Genova', 'Alessandria', 'Imperia', 'Cuneo', 'Asti', 'Torino', 'Vercelli', 'Biella', 'Valle d’Aosta/Vallée d’Aoste', 'Pavia', 'Milano', 'Novara', 'Monza e della Brianza', 'Varese', 'Lecco', 'Como', 'Verbano-Cusio-Ossola', 'Mantova', 'Cremona', 'Lodi', 'Verona', 'Bergamo', 'Brescia', 'Sondrio', 'Agrigento', 'Ragusa', 'Siracusa', 'Caltanissetta', 'Catania', 'Enna', 'Palermo', 'Messina', 'Reggio di Calabria', 'Vibo Valentia', 'Catanzaro', 'Crotone', 'Cosenza', 'Lecce', 'Matera', 'Potenza', 'Taranto', 'Brindisi', 'Trapani', 'Roma', 'Viterbo', 'Terni', 'Grosseto', 'Perugia', 'Siena', 'Arezzo', 'Firenze', 'Prato', 'Salerno', 'Napoli', 'Avellino', 'Caserta', 'Benevento', 'Latina', 'Frosinone', 'Isernia', 'Campobasso', 'Chieti', 'L’Aquila', 'Pescara', 'Rieti', 'Teramo', 'Ascoli Piceno', 'Fermo', 'Macerata', 'Ancona', 'Pesaro e Urbino', 'Livorno', 'Pisa', 'Pistoia', 'Lucca', 'Massa-Carrara', 'La Spezia', 'Modena', 'Reggio nell’Emilia', 'Parma', 'Piacenza', 'Rimini', 'Forlì-Cesena', 'Ravenna', 'Bologna', 'Ferrara', 'Rovigo', 'Padova', 'Venezia', 'Vicenza', 'Treviso', 'Gorizia', 'Udine', 'Bari', 'Barletta-Andria-Trani', 'Foggia', 'Pordenone', 'Trento', 'Belluno', 'Bolzano-Bozen']],
  ['瑞士', ['Valais', 'Ticino', 'Uri', 'Genève', 'Vaud', 'Neuchâtel', 'Graubünden', 'Bern', 'Obwalden', 'Luzern', 'Solothurn', 'Aargau', 'Basel-Landschaft', 'Basel-Stadt', 'Nidwalden', 'Glarus', 'Schwyz', 'Zug', 'St. Gallen', 'Appenzell Innerrhoden', 'Appenzell Ausserrhoden', 'Zürich', 'Thurgau', 'Schaffhausen']],
  ['奥地利法占区', ['Tiroler Oberland', 'Bludenz-Bregenzer Wald', 'Außerfern', 'Rheintal-Bodenseegebiet', 'Innsbruck', 'Tiroler Unterland']],
  ['联邦德国', ['Schwaben', 'Tübingen', 'Karlsruhe', 'Oberbayern', 'Stuttgart', 'Mittelfranken', 'Rheinhessen-Pfalz', 'Koblenz', 'Darmstadt', 'Unterfranken', 'Trier', 'Gießen', 'Köln', 'Arnsberg', 'Düsseldorf', 'Kassel', 'Detmold', 'Münster', 'Weser-Ems', 'Hannover', 'Lüneburg', 'Braunschweig', 'Bremen', 'Hamburg', 'Schleswig-Holstein', 'Niederbayern', 'Oberpfalz', 'Oberfranken']],
  ['萨尔', ['Saarland']],
  ['英国', ['Isle of Wight', 'Bournemouth, Christchurch and Poole', 'Plymouth', 'Cornwall and Isles of Scilly', 'Torbay', 'Devon CC', 'Cardiff and Vale of Glamorgan', 'Bridgend and Neath Port Talbot', 'Swansea', 'Central Valleys', 'Gwent Valleys', 'Brighton and Hove', 'East Sussex CC', 'West Sussex (North East)', 'Dorset', 'Portsmouth', 'South Hampshire', 'West Sussex (South West)', 'Southampton', 'Central Hampshire', 'Somerset', 'North Hampshire', 'West Surrey', 'Wiltshire CC', 'East Kent', 'Mid Kent', 'West Kent', 'East Surrey', 'Kent Thames Gateway', 'Croydon', 'Bromley', 'Merton, Kingston upon Thames and Sutton', 'Medway', 'Hounslow and Richmond upon Thames', 'Wandsworth', 'Bexley and Greenwich', 'Lambeth', 'Lewisham and Southwark', 'Kensington & Chelsea and Hammersmith & Fulham', 'Thurrock', 'Westminster', 'Tower Hamlets', 'Ealing', 'Hackney and Newham', 'Camden and City of London', 'Harrow and Hillingdon', 'Southend-on-Sea', 'Barking & Dagenham and Havering', 'Brent', 'Berkshire', 'Bristol, City of', 'Bath and North East Somerset, North Somerset and South Gloucestershire', 'Swindon', 'Monmouthshire and Newport', 'Buckinghamshire CC', 'Oxfordshire', 'Gloucestershire', 'Luton', 'Central Bedfordshire', 'Haringey and Islington', 'Essex Thames Gateway', 'Redbridge and Waltham Forest', 'Barnet', 'Enfield', 'Heart of Essex', 'Hertfordshire', 'West Essex', 'Essex Haven Gateway', 'Suffolk', 'Milton Keynes', 'Herefordshire, County of', 'Bedford', 'Worcestershire', 'West Northamptonshire', 'Warwickshire', 'Coventry', 'North Northamptonshire', 'Solihull', 'Dudley', 'South West Wales', 'Powys', 'Gwynedd', 'Conwy and Denbighshire', 'Flintshire and Wrexham', 'Isle of Anglesey', 'Birmingham', 'Sandwell', 'Wolverhampton', 'Walsall', 'Leicester', 'Shropshire CC', 'Leicestershire CC and Rutland', 'Telford and Wrekin', 'Staffordshire CC', 'Derby', 'Cambridgeshire CC', 'Breckland and South Norfolk', 'Peterborough', 'Norwich and East Norfolk', 'North and West Norfolk', 'Lincolnshire', 'Kingston upon Hull, City of', 'South Nottinghamshire', 'Nottingham', 'Stoke-on-Trent', 'South and West Derbyshire', 'Cheshire West and Chester', 'Cheshire East', 'East Derbyshire', 'North Nottinghamshire', 'Warrington', 'Liverpool', 'Sheffield', 'East Merseyside', 'Greater Manchester South East', 'Manchester', 'Greater Manchester South West', 'Barnsley, Doncaster and Rotherham', 'Greater Manchester North West', 'Sefton', 'North and North East Lincolnshire', 'Greater Manchester North East', 'Wirral', 'Newry, Mourne and Down', 'Armagh City, Banbridge and Craigavon', 'Fermanagh and Omagh', 'Lisburn and Castlereagh', 'West Cumbria', 'Ards and North Down', 'Chorley and West Lancashire', 'Wakefield', 'Calderdale and Kirklees', 'Blackburn with Darwen', 'East Lancashire', 'Leeds', 'Blackpool', 'Bradford', 'Mid Lancashire', 'East Riding of Yorkshire', 'York', 'Lancaster and Wyre', 'North Yorkshire CC', 'Darlington', 'South Teesside', 'Hartlepool and Stockton-on-Tees', 'East Cumbria', 'Durham CC', 'Sunderland', 'Tyneside', 'Belfast', 'Mid Ulster', 'Antrim and Newtownabbey', 'Derry City and Strabane', 'Mid and East Antrim', 'Dumfries & Galloway', 'Causeway Coast and Glens', 'South Ayrshire', 'East Ayrshire and North Ayrshire mainland', 'South Lanarkshire', 'Inverclyde, East Renfrewshire and Renfrewshire', 'Glasgow City', 'North Lanarkshire', 'West Lothian', 'Edinburgh, City of', 'Falkirk', 'East Dunbartonshire, West Dunbartonshire and Helensburgh & Lomond', 'Clackmannanshire and Fife', 'Perth & Kinross and Stirling', 'Northumberland', 'Scottish Borders', 'East Lothian and Midlothian', 'Angus and Dundee City', 'Aberdeen City and Aberdeenshire', 'Orkney Islands', 'Shetland Islands', 'Lochaber, Skye & Lochalsh, Arran & Cumbrae and Argyll & Bute', 'Inverness & Nairn and Moray, Badenoch & Strathspey', 'Na h-Eileanan Siar (Western Isles)', 'Caithness & Sutherland and Ross & Cromarty']],
  ['比利时', ['Arr. Ath', 'Arr. Tournai-Mouscron', 'Arr. Kortrijk', 'Arr. Ieper', 'Arr. Oudenaarde', 'Arr. Roeselare', 'Arr. Tielt', 'Arr. Diksmuide', 'Arr. Veurne', 'Arr. Virton', 'Arr. Arlon', 'Arr. Neufchâteau', 'Arr. Bastogne', 'Arr. Dinant', 'Arr. Philippeville', 'Arr. Thuin', 'Arr. Marche-en-Famenne', 'Arr. La Louvière', 'Arr. Charleroi', 'Bezirk Verviers — Deutschsprachige Gemeinschaft', 'Arr. Namur', 'Arr. Mons', 'Arr. Huy', 'Arr. Verviers — communes francophones', 'Arr. Soignies', 'Arr. Liège', 'Arr. Waremme', 'Arr. Nivelles', 'Arr. de Bruxelles-Capitale/Arr. Brussel-Hoofdstad', 'Arr. Tongeren', 'Arr. Aalst', 'Arr. Halle-Vilvoorde', 'Arr. Leuven', 'Arr. Hasselt', 'Arr. Dendermonde', 'Arr. Mechelen', 'Arr. Maaseik', 'Arr. Sint-Niklaas', 'Arr. Turnhout', 'Arr. Antwerpen', 'Arr. Gent', 'Arr. Oostende', 'Arr. Brugge', 'Arr. Eeklo']],
  ['卢森堡', ['Luxembourg']],
  ['荷兰', ['Zuid-Limburg', 'Midden-Limburg', 'Zuidoost-Noord-Brabant', 'Arnhem/Nijmegen', 'Delft en Westland', 'Achterhoek', 'Oost-Zuid-Holland', 'Agglomeratie ’s-Gravenhage', 'Utrecht', 'Agglomeratie Leiden en Bollenstreek', 'Veluwe', 'Het Gooi en Vechtstreek', 'Twente', 'Zeeuwsch-Vlaanderen', 'Noord-Limburg', 'West-Noord-Brabant', 'Overig Zeeland', 'Midden-Noord-Brabant', 'Noordoost-Noord-Brabant', 'Zuidoost-Zuid-Holland', 'Groot-Rijnmond', 'Zuidwest-Gelderland', 'Zuidwest-Overijssel', 'Agglomeratie Haarlem', 'Groot-Amsterdam', 'Zaanstreek', 'IJmond', 'Flevoland', 'Alkmaar en omgeving', 'Noord-Overijssel', 'Zuidwest-Drenthe', 'Kop van Noord-Holland', 'Zuidoost-Drenthe', 'Oost-Groningen', 'Delfzijl en omgeving', 'Zuidwest-Friesland', 'Noord-Drenthe', 'Zuidoost-Friesland', 'Noord-Friesland', 'Overig Groningen']],
  ['爱尔兰', ['South-West', 'South-East', 'Mid-West', 'Midland', 'Mid-East', 'Dublin', 'West', 'Border']],
  ['丹麦', ['Sydjylland', 'Vestjylland', 'Fyn', 'Østjylland', 'Nordjylland', 'Bornholm', 'Vest- og Sydsjælland', 'Østsjælland', 'Byen København', 'Københavns omegn', 'Nordsjælland']],
  ['挪威', ['Vestfold og Telemark', 'Rogaland', 'Vestland', 'Agder', 'Møre og Romsdal', 'Oslo', 'Viken', 'Innlandet', 'Jan Mayen', 'Trøndelag', 'Nordland', 'Troms og Finnmark']],
  ['冰岛', ['Höfuðborgarsvæði', 'Landsbyggð']],
  ['塞浦路斯', ['Kýpros']],
  ['希腊', ['Kalymnos, Karpathos, Kasos, Kos, Rodos', 'Lasithi', 'Irakleio', 'Rethymni', 'Chania', 'Peiraias, Nisoi', 'Andros, Thira, Kea, Milos, Mykonos, Naxos, Paros,  Syros, Tinos', 'Argolida, Arkadia', 'Ikaria, Samos', 'Notios Tomeas Athinon', 'Korinthia', 'Lakonia, Messinia', 'Zakynthos', 'Ileia', 'Achaia', 'Ithaki, Kefallinia', 'Fokida', 'Lefkada', 'Aitoloakarnania', 'Evrytania', 'Arta, Preveza', 'Kentrikos Tomeas Athinon', 'Anatoliki Attiki', 'Dytikos Tomeas Athinon', 'Voreios Tomeas Athinon', 'Dytiki Attiki', 'Voiotia', 'Chios', 'Evvoia', 'Fthiotida', 'Magnisia, Sporades', 'Karditsa, Trikala', 'Kerkyra', 'Thesprotia', 'Larisa', 'Ioannina', 'Pieria', 'Grevena, Kozani', 'Kastoria', 'Lesvos, Limnos', 'Chalkidiki', 'Thessaloniki', 'Thasos, Kavala', 'Kilkis', 'Evros', 'Serres', 'Rodopi', 'Xanthi', 'Imathia', 'Florina', 'Pella', 'Drama']],
  ['土耳其', ['Hatay', 'Mersin', 'Antalya', 'Kilis', 'Muğla', 'Karaman', 'Gaziantep', 'Mardin', 'Şanlıurfa', 'Osmaniye', 'Burdur', 'Hakkari', 'Şırnak', 'Adana', 'Denizli', 'Aydın', 'Adıyaman', 'Niğde', 'Kahramanmaraş', 'Isparta', 'Siirt', 'Konya', 'Batman', 'Diyarbakır', 'Bitlis', 'Aksaray', 'Kayseri', 'Afyonkarahisar', 'Malatya', 'Van', 'Uşak', 'İzmir', 'Elazığ', 'Manisa', 'Nevşehir', 'Muş', 'Bingöl', 'Tunceli', 'Kırşehir', 'Kütahya', 'Ağrı', 'Sivas', 'Erzincan', 'Yozgat', 'Eskişehir', 'Ankara', 'Kırıkkale', 'Balıkesir', 'Iğdır', 'Erzurum', 'Bilecik', 'Bursa', 'Bayburt', 'Gümüşhane', 'Tokat', 'Kars', 'Giresun', 'Bolu', 'Çanakkale', 'Yalova', 'Çorum', 'Amasya', 'Çankırı', 'Sakarya', 'Ordu', 'Trabzon', 'Düzce', 'Kocaeli', 'Rize', 'Artvin', 'Tekirdağ', 'Ardahan', 'İstanbul', 'Karabük', 'Zonguldak', 'Samsun', 'Kastamonu', 'Bartın', 'Sinop', 'Edirne', 'Kırklareli']],
  ['阿尔巴尼亚', ['Gjirokastër', 'Vlorë', 'Korcë', 'Berat', 'Fier', 'Elbasan', 'Tiranë', 'Durrës', 'Dibër', 'Lezhë', 'Kukës', 'Shkodër']],
  ['马耳他', ['Malta', 'Gozo and Comino/Għawdex u Kemmuna']],
  ['南斯拉夫', ['Primorsko-goranska županija', 'Brodsko-posavska županija', 'Karlovačka županija', 'Sisačko-moslavačka županija', 'Požeško-slavonska županija', 'Osječko-baranjska županija', 'Zapadnobačka oblast', 'Virovitičko-podravska županija', 'Zagrebačka županija', 'Bjelovarsko-bilogorska županija', 'Grad Zagreb', 'Istarska županija', 'Primorsko-notranjska', 'Jugovzhodna Slovenija', 'Osrednjeslovenska', 'Zasavska', 'Goriška', 'Posavska', 'Krapinsko-zagorska županija', 'Koprivničko-križevačka županija', 'Varaždinska županija', 'Međimurska županija', 'Podravska', 'Pelagoniski', 'Jugozapaden', 'Jugoistočen', 'Istočen', 'Vardarski', 'Pološki', 'Skopski', 'Severoistočen', 'Pčinjska oblast', 'Pirotska oblast', 'Crna Gora', 'Dubrovačko-neretvanska županija', 'Splitsko-dalmatinska županija', 'Šibensko-kninska županija', 'Zadarska županija', 'Ličko-senjska županija', 'Vukovarsko-srijemska županija', 'Jablanička oblast', 'Toplička oblast', 'Raška oblast', 'Nišavska oblast', 'Rasinska oblast', 'Zlatiborska oblast', 'Zaječarska oblast', 'Moravička oblast', 'Pomoravska oblast', 'Šumadijska oblast', 'Savinjska', 'Gorenjska', 'Koroška', 'Pomurska', 'Borska oblast', 'Kolubarska oblast', 'Braničevska oblast', 'Podunavska oblast', 'Mačvanska oblast', 'City of Belgrade', 'Sremska oblast', 'Južnobanatska oblast', 'Srednjobanatska oblast', 'Južnobačka oblast', 'Severnobanatska oblast', 'Severnobačka oblast', 'Dečani', 'Đakovica', 'Dragaš', 'Prizren', 'Gnjilane', 'Vitina', 'Kačanik', 'Štrpce', 'Herzegovina-Neretva', 'Trebinje', 'Leposavić', 'Podujevo', 'Zubin Potok', 'Zvečan', 'Istok', 'Priština', 'Kosovska Kamenica', 'Peć', 'Foča', 'Banja Luka', 'Una-Sana', 'Doboj', 'Posavina', 'Brčko Distrikt', 'Bijeljina', 'West Bosnia', 'West Herzegovina', 'Vlasenica', 'Central Bosnia', 'Zenica-Doboj', 'Tuzla', 'Sarajevo-romanija', 'Sarajevo', 'Bosnian Podrinje', 'Orahovac', 'Srbica', 'Klina', 'Kosovska Mitrovica', 'Glogovac', 'Mališevo', 'Suva Reka', 'Uroševac', 'Novo Brdo', 'Obilić', 'Kosovo Polje', 'Lipljan', 'Štimlje', 'Vučitrn']],
  ['科佩尔', ['Obalno-kraška']],
  ['的里雅斯特', ['Trieste']],
  ['匈牙利', ['Baranya', 'Somogy', 'Tolna', 'Zala', 'Vas', 'Veszprém', 'Fejér', 'Budapest', 'Komárom-Esztergom', 'Győr-Moson-Sopron', 'Csongrád', 'Bács-Kiskun', 'Békés', 'Jász-Nagykun-Szolnok', 'Hajdú-Bihar', 'Pest', 'Heves', 'Nógrád', 'Szabolcs-Szatmár-Bereg', 'Borsod-Abaúj-Zemplén']],
  ['保加利亚', ['Kardzhali', 'Smolyan', 'Blagoevgrad', 'Haskovo', 'Pazardzhik', 'Plovdiv', 'Yambol', 'Kyustendil', 'Stara Zagora', 'Pernik', 'Sofia', 'Sliven', 'Sofia (stolitsa)', 'Gabrovo', 'Lovech', 'Burgas', 'Varna', 'Shumen', 'Dobrich', 'Silistra', 'Veliko Tarnovo', 'Targovishte', 'Vratsa', 'Montana', 'Pleven', 'Razgrad', 'Ruse', 'Vidin']],
  ['罗马尼亚', ['Constanţa', 'Călăraşi', 'Ialomiţa', 'Tulcea', 'Teleorman', 'Giurgiu', 'Dolj', 'Olt', 'Bucureşti', 'Ilfov', 'Mehedinţi', 'Dâmboviţa', 'Gorj', 'Argeş', 'Vâlcea', 'Prahova', 'Caraş-Severin', 'Braşov', 'Hunedoara', 'Sibiu', 'Covasna', 'Alba', 'Bacău', 'Mureş', 'Harghita', 'Cluj', 'Neamţ', 'Timiş', 'Arad', 'Bihor', 'Sălaj', 'Bistriţa-Năsăud', 'Suceava', 'Maramureş', 'Satu Mare', 'Brăila', 'Buzău', 'Galaţi', 'Vrancea', 'Vaslui', 'Iaşi', 'Botoşani']],
  ['奥地利英占区', ['Osttirol', 'Klagenfurt-Villach', 'Unterkärnten', 'Oberkärnten', 'Westliche Obersteiermark', 'Liezen', 'West- und Südsteiermark', 'Graz', 'Oststeiermark', 'Östliche Obersteiermark']],
  ['奥地利美占区', ['Lungau', 'Pinzgau-Pongau', 'Salzburg und Umgebung', 'Traunviertel', 'Steyr-Kirchdorf', 'Linz-Wels', 'Innviertel']],
  ['奥地利苏占区', ['Südburgenland', 'Mittelburgenland', 'Mostviertel-Eisenwurzen', 'Niederösterreich-Süd', 'Nordburgenland', 'Wiener Umland/Südteil', 'Sankt Pölten', 'Mühlviertel', 'Wiener Umland/Nordteil', 'Waldviertel', 'Weinviertel']],
  ['维也纳', ['Wien']],
  ['捷克斯洛伐克', ['Nitriansky kraj', 'Trnavský kraj', 'Bratislavský kraj', 'Jihočeský kraj', 'Plzeňský kraj', 'Hlavní město Praha', 'Banskobystrický kraj', 'Košický kraj', 'Prešovský kraj', 'Trenčiansky kraj', 'Jihomoravský kraj', 'Žilinský kraj', 'Zlínský kraj', 'Kraj Vysočina', 'Moravskoslezský kraj', 'Olomoucký kraj', 'Pardubický kraj', 'Královéhradecký kraj', 'Středočeský kraj', 'Karlovarský kraj', 'Ústecký kraj', 'Liberecký kraj']],
  ['波兰', ['Krośnieński', 'Bielski', 'Nowotarski', 'Nowosądecki', 'Tarnowski', 'Miasto Kraków', 'Krakowski', 'Oświęcimski', 'Rzeszowski', 'Tarnobrzeski', 'Sosnowiecki', 'Sandomiersko-jędrzejowski', 'Przemyski', 'Chełmsko-zamojski', 'Lubelski', 'Bialski', 'Łomżyński', 'Kielecki', 'Piotrkowski', 'Puławski', 'Radomski', 'Łódzki', 'Miasto Łódź', 'Żyrardowski', 'Skierniewicki', 'Siedlecki', 'Warszawski wschodni', 'Tyski', 'Rybnicki', 'Katowicki', 'Częstochowski', 'Sieradzki', 'Kaliski', 'Leszczyński', 'Koniński', 'Miasto Poznań', 'Poznański', 'Włocławski', 'Inowrocławski', 'Pilski', 'Bydgosko-toruński', 'Grudziądzki', 'Świecki', 'Chojnicki', 'Starogardzki', 'Gdański', 'Miasto Warszawa', 'Warszawski zachodni', 'Płocki', 'Ciechanowski', 'Ostrołęcki', 'Białostocki', 'Suwalski']],
  ['奥得河—尼斯河以东', ['Gliwicki', 'Wałbrzyski', 'Nyski', 'Bytomski', 'Opolski', 'Jeleniogórski', 'Miasto Wrocław', 'Wrocławski', 'Legnicko-głogowski', 'Zielonogórski', 'Gorzowski', 'Szczecinecko-pyrzycki', 'Szczeciński', 'Miasto Szczecin', 'Koszaliński', 'Słupski', 'Trójmiejski', 'Elbląski', 'Olsztyński', 'Ełcki']],
  ['民主德国', ['Thüringen', 'Chemnitz', 'Dresden', 'Sachsen-Anhalt', 'Leipzig', 'Brandenburg', 'Mecklenburg-Vorpommern']],
  ['柏林', ['Berlin']],
  ['瑞典', ['Skåne län', 'Blekinge län', 'Kronobergs län', 'Hallands län', 'Kalmar län', 'Gotlands län', 'Östergötlands län', 'Jönköpings län', 'Västra Götalands län', 'Örebro län', 'Värmlands län', 'Dalarnas län', 'Jämtlands län', 'Södermanlands län', 'Stockholms län', 'Västmanlands län', 'Uppsala län', 'Gävleborgs län', 'Västernorrlands län', 'Västerbottens län', 'Norrbottens län']],
  ['拉脱维亚', ['Latgale', 'Zemgale', 'Rīga', 'Pierīga', 'Vidzeme', 'Kurzeme']],
  ['爱沙尼亚', ['Kirde-Eesti', 'Lõuna-Eesti', 'Lääne-Eesti', 'Kesk-Eesti', 'Põhja-Eesti']],
  ['芬兰', ['Kymenlaakso', 'Helsinki-Uusimaa', 'Kanta-Häme', 'Etelä-Karjala', 'Etelä-Savo', 'Pohjois-Karjala', 'Pohjois-Savo', 'Kainuu', 'Pohjois-Pohjanmaa', 'Päijät-Häme', 'Pirkanmaa', 'Keski-Suomi', 'Etelä-Pohjanmaa', 'Keski-Pohjanmaa', 'Lappi', 'Åland', 'Varsinais-Suomi', 'Satakunta', 'Pohjanmaa']],
  ['立陶宛', ['Klaipėdos apskritis', 'Telšių apskritis', 'Alytaus apskritis', 'Marijampolės apskritis', 'Vilniaus apskritis', 'Kauno apskritis', 'Tauragės apskritis', 'Utenos apskritis', 'Panevėžio apskritis', 'Šiaulių apskritis']],
  ['苏联', ['Chernihiv', 'Gomel', 'Volyn', 'Brest', 'Rivne', 'Zhytomyr', 'Kiev', 'Vitebsk', 'Grodno', 'Pskov', 'Krasnodar', 'Karachay-Cherkess', 'Kabardin-Balkar', 'North Ossetia', 'Ingush', 'Chechnya', 'Dagestan', 'Murmansk', 'Karelia', 'Leningrad', 'Briceni', 'Edineţ', 'Rîşcani', 'Glodeni', 'Făleşti', 'Ungheni', 'Nisporeni', 'Hîncesti', 'Leova', 'Cantemir', 'Cahul', 'Chernivtsi', 'Ivano-Frankivs\'k', 'Odessa', 'Ocniţa', 'Vinnytsya', 'Donduseni', 'Soroca', 'Camenca', 'Rezina', 'Stîngă Nistrului', 'Grigoriopol', 'Bender', 'Ștefan Vodă', 'Causeni', 'Cimişlia', 'Basarabeasca', 'Taraclia', 'Comrat', 'L\'viv', 'Smolensk', 'Mogilev', 'Bryansk', 'Sumy', 'Kursk', 'Belgorod', 'Kharkiv', 'Luhans\'k', 'Voronezh', 'Rostov', 'Donets\'k', 'Chelyabinsk', 'Orenburg', 'Saratov', 'Astrakhan\'', 'Volgograd', 'Crimea', 'Kherson', 'Zaporizhzhya', 'Sevastopol', 'Mykolayiv', 'Nenets', 'City of St. Petersburg', 'Arkhangel\'sk', 'Kalmyk', 'Poltava', 'Khmel\'nyts\'kyy', 'Ternopil\'', 'Dnipropetrovs\'k', 'Cherkasy', 'Kirovohrad', 'Criuleni', 'Străşeni', 'Anenii Noi', 'Orhei', 'Transnistria', 'Chişinău', 'Teleneşti', 'Şoldăneşti', 'Floreşti', 'Ialoveni', 'Călărași', 'Drochia', 'Sîngerei', 'Bălţi', 'Minsk', 'Bashkortostan', 'Sverdlovsk', 'Lipetsk', 'Tambov', 'Tatarstan', 'Ul\'yanovsk', 'Penza', 'Orel', 'Mordovia', 'Kaluga', 'Kostroma', 'Yaroslavl\'', 'Vladimir', 'Ryazan\'', 'Ivanovo', 'Nizhegorod', 'Tula', 'Chuvash', 'Vologda', 'Novgorod', 'Tver\'', 'Moskovskaya', 'Moskva', 'Mariy-El', 'Kirov', 'Udmurt', 'Komi', 'Perm\'', 'Samara', 'Stavropol\'', 'Adygey', 'City of Minsk', 'Kiev City']],
  ['外喀尔巴阡', ['Transcarpathia']],
  ['加里宁格勒', ['Kaliningrad']],
].flatMap(([s, ns]) => ns.map(n => [n, s])));

// 斜线的说明（q）
const q = (s, ref = '条约与协定') => ({ ref, q: s });
const ODER = q('原属德国；1945 年起由波兰管理。民主德国 1950 年以格尔利茨条约承认奥得河—尼斯河线，联邦德国 1970 年以华沙条约承认，1972 年生效');
const KAL = q('原属德国东普鲁士；1945 年起由苏联管理，划入俄罗斯苏维埃联邦社会主义共和国；最终边界留待对德和约确定');
const BALT = q('1940 年并入苏联；美国等国不承认这一并入', '各国法令');
const BER = q('四国占领；西柏林由美英法三国管理，与联邦德国联系；东柏林由苏联管理，民主德国以它为首都');
const CY74 = q('1974 年 8 月起岛的北部约三分之一由土耳其军队控制，联合国部队驻守停火线之间的缓冲区；1983 年北部宣布成立“北塞浦路斯土耳其共和国”，只有土耳其承认', '战事记录');
const AT = '奥地利苏占区 奥地利美占区 奥地利英占区 奥地利法占区 维也纳';

const SNAPSHOTS = [
  // 开局：1950 年 1 月 1 日
  [1950, md(1, 1), [['de', '联邦德国 弗赖堡'], ['saar', '萨尔', q('1947 年起与法国组成经济与关税联盟，有自己的政府；归属留待和约确定')], ['dd', '民主德国'], ['berlin', '柏林', BER],
    ['atsu', '奥地利苏占区'], ['atus', '奥地利美占区'], ['atgb', '奥地利英占区'], ['atfr', '奥地利法占区'], ['wien', '维也纳', q('四国共管，分为四个占领区')],
    ['pl', '波兰'], ['pl', '奥得河—尼斯河以东', ODER], ['ussr', '苏联 外喀尔巴阡'], ['ussr', '加里宁格勒', KAL],
    ['ussr', '爱沙尼亚', BALT], ['ussr', '拉脱维亚', BALT], ['ussr', '立陶宛', BALT],
    ['cs', '捷克斯洛伐克'], ['hu', '匈牙利'], ['ro', '罗马尼亚'], ['bg', '保加利亚'], ['yu', '南斯拉夫'], ['al', '阿尔巴尼亚'],
    ['amg', '的里雅斯特', q('1947 年巴黎和约设的里雅斯特自由区，由英美军政府管理')], ['ftb', '科佩尔', q('1947 年巴黎和约设的里雅斯特自由区，由南斯拉夫军队管理')],
    ['gr', '希腊'], ['it', '意大利'], ['fr', '法国 法国东部'], ['be', '比利时'], ['nl', '荷兰'], ['lu', '卢森堡'], ['ch', '瑞士'], ['dk', '丹麦'], ['fi', '芬兰'],
    ['gb', '英国'], ['ie', '爱尔兰'], ['es', '西班牙'], ['pt', '葡萄牙'], ['se', '瑞典'], ['no', '挪威'], ['is', '冰岛'],
    ['brcy', '塞浦路斯'], ['brmt', '马耳他'], ['tr', '土耳其']]],
  [1954, md(10, 26), [['it', '的里雅斯特', '条约与协定'], ['yu', '科佩尔', '条约与协定']]],
  [1955, md(7, 27), [['at', AT, '条约与协定']]],
  [1957, md(1, 1), [['de', '萨尔', '条约与协定']]],
  [1960, md(8, 16), [['cy', '塞浦路斯', '条约与协定']]],
  [1964, md(9, 21), [['mt', '马耳他', '各国法令']]],
  [1972, md(6, 3), [['pl', '奥得河—尼斯河以东', '条约与协定']]],
  [1974, md(7, 20), [['cy', '塞浦路斯', CY74]]],
];

const ZHOU_LABELS = [];

// 城邑：各国首都，以及条约、文化与科技事件所在的城市
const CITIES = [
  { n: [[1950, '波恩']], ll: [7.1, 50.73], m: '今德国波恩', cap: 1 },
  { n: [[1950, '柏林']], ll: [13.4, 52.52], m: '今德国柏林' },
  { n: [[1950, '萨尔布吕肯']], ll: [7.0, 49.23], m: '今德国萨尔布吕肯' },
  { n: [[1950, '卢森堡']], ll: [6.13, 49.61], m: '今卢森堡', cap: 1 },
  { n: [[1950, '格尔利茨']], ll: [14.99, 51.15], m: '今德国格尔利茨' },
  { n: [[1950, '维也纳']], ll: [16.37, 48.21], m: '今奥地利维也纳', cap: 1 },
  { n: [[1950, '华沙']], ll: [21.01, 52.23], m: '今波兰华沙', cap: 1 },
  { n: [[1950, '布拉格']], ll: [14.42, 50.09], m: '今捷克布拉格', cap: 1 },
  { n: [[1950, '布达佩斯']], ll: [19.04, 47.5], m: '今匈牙利布达佩斯', cap: 1 },
  { n: [[1950, '贝尔格莱德']], ll: [20.46, 44.82], m: '今塞尔维亚贝尔格莱德', cap: 1 },
  { n: [[1950, '的里雅斯特']], ll: [13.77, 45.65], m: '今意大利的里雅斯特' },
  { n: [[1950, '科佩尔']], ll: [13.73, 45.55], m: '今斯洛文尼亚科佩尔' },
  { n: [[1950, '罗马']], ll: [12.5, 41.9], m: '今意大利罗马', cap: 1 },
  { n: [[1950, '巴黎']], ll: [2.35, 48.85], m: '今法国巴黎', cap: 1 },
  { n: [[1950, '图卢兹']], ll: [1.44, 43.6], m: '今法国图卢兹' },
  { n: [[1950, '日内瓦']], ll: [6.14, 46.2], m: '今瑞士日内瓦' },
  { n: [[1950, '卢加诺']], ll: [8.95, 46.0], m: '今瑞士卢加诺' },
  { n: [[1950, '伦敦']], ll: [-0.13, 51.51], m: '今英国伦敦', cap: 1 },
  { n: [[1950, '剑桥']], ll: [0.12, 52.2], m: '今英国剑桥' },
  { n: [[1950, '利物浦']], ll: [-2.98, 53.41], m: '今英国利物浦' },
  { n: [[1950, '赫尔辛基']], ll: [24.94, 60.17], m: '今芬兰赫尔辛基', cap: 1 },
  { n: [[1950, '莫斯科']], ll: [37.62, 55.75], m: '今俄罗斯莫斯科', cap: 1 },
  { n: [[1950, '恩格斯']], ll: [46.12, 51.48], m: '今俄罗斯萨拉托夫州恩格斯' },
  { n: [[1950, '普里皮亚季']], ll: [30.06, 51.4], m: '今乌克兰普里皮亚季' },
  { n: [[1950, '尼科西亚']], ll: [33.36, 35.17], m: '今塞浦路斯尼科西亚', cap: 1 },
  { n: [[1950, '瓦莱塔']], ll: [14.51, 35.9], m: '今马耳他瓦莱塔', cap: 1 },
  { n: [[1950, '安卡拉']], ll: [32.85, 39.93], m: '今土耳其安卡拉', cap: 1 },
  { n: [[1950, '雅典']], ll: [23.73, 37.98], m: '今希腊雅典', cap: 1 },
  { n: [[1950, '马德里']], ll: [-3.7, 40.42], m: '今西班牙马德里', cap: 1 },
  { n: [[1950, '里斯本']], ll: [-9.14, 38.72], m: '今葡萄牙里斯本', cap: 1 },
];

const PHASES = [
  [1950, 1957, '占领结束'], [1958, 1969, '柏林墙与新国家'], [1970, 1988, '条约与共同体'],
];

// 事件：y 年，mo 月（md(月, 日) 只用于排序），cal 页面上显示的日期，ll [经度, 纬度]，k pol|dip|eco|cul，refs 依据，who 参与人物
const EVENTS = [
  { y: 1950, mo: md(7, 6), cal: '1950 年 7 月 6 日', t: '格尔利茨条约', p: '格尔利茨', m: '今德国格尔利茨', ll: [14.99, 51.15], k: 'dip', refs: ['条约与协定'],
    d: '民主德国与波兰在边境城市格尔利茨签订条约，承认奥得河—尼斯河线为两国边界。联邦德国当时不承认这条线。', who: ['瓦尔特·乌布利希'] },
  { y: 1951, mo: md(4, 18), cal: '1951 年 4 月 18 日', t: '欧洲煤钢共同体条约签订', p: '巴黎', m: '今法国巴黎', ll: [2.35, 48.85], k: 'eco', refs: ['条约与协定'],
    d: '法国、联邦德国、意大利、比利时、荷兰、卢森堡六国在巴黎签订条约，把各国的煤炭与钢铁生产交由共同的高级机构管理，1952 年生效。', who: ['康拉德·阿登纳'] },
  { y: 1952, mo: md(2, 18), cal: '1952 年 2 月 18 日', t: '希腊、土耳其加入北大西洋公约组织', p: '安卡拉', m: '今土耳其安卡拉', ll: [32.85, 39.93], k: 'dip', refs: ['条约与协定'],
    d: '希腊与土耳其同日加入 1949 年成立的北大西洋公约组织，成员国增为十四个。', who: [] },
  { y: 1953, mo: md(4, 25), cal: '1953 年 4 月 25 日', t: 'DNA 双螺旋结构发表', p: '剑桥', m: '今英国剑桥', ll: [0.12, 52.2], k: 'cul', refs: ['科技记录'],
    d: '沃森与克里克在《自然》杂志发表论文，提出 DNA 分子的双螺旋结构模型；同一期还刊登了富兰克林等人的 X 射线衍射研究。这一模型说明了遗传信息如何复制。', who: ['弗朗西斯·克里克', '罗莎琳德·富兰克林'] },
  { y: 1954, mo: md(9, 29), cal: '1954 年 9 月 29 日', t: '欧洲核子研究组织成立', p: '日内瓦', m: '今瑞士日内瓦附近的梅兰', ll: [6.05, 46.23], k: 'cul', refs: ['科技记录'],
    d: '十二个欧洲国家签署的公约生效，欧洲核子研究组织在日内瓦近郊成立，建设大型粒子加速器，供各国物理学家共同使用。', who: [] },
  { y: 1954, mo: md(10, 26), cal: '1954 年 10 月 26 日', t: '的里雅斯特 A 区交给意大利', p: '的里雅斯特', m: '今意大利的里雅斯特', ll: [13.77, 45.65], k: 'dip', refs: ['条约与协定'],
    d: '按 10 月 5 日意大利、南斯拉夫、英国、美国签署的伦敦谅解备忘录，的里雅斯特自由区的 A 区（包括的里雅斯特市）交由意大利管理，B 区交由南斯拉夫管理，两区之间的界线略作调整。1975 年两国签订奥西莫条约，确认这条边界。', who: ['约瑟普·布罗兹·铁托'] },
  { y: 1955, mo: md(5, 9), cal: '1955 年 5 月', t: '联邦德国加入北约，华沙条约组织成立', p: '华沙', m: '今波兰华沙', ll: [21.01, 52.23], k: 'dip', refs: ['条约与协定'],
    d: '5 月 9 日联邦德国加入北大西洋公约组织；5 月 14 日苏联与东欧七国在华沙签订友好合作互助条约，成立华沙条约组织。', who: ['康拉德·阿登纳'] },
  { y: 1955, mo: md(5, 15), cal: '1955 年 5 月 15 日', t: '奥地利国家条约签订', p: '维也纳', m: '今奥地利维也纳', ll: [16.38, 48.19], k: 'dip', refs: ['条约与协定'],
    d: '苏联、美国、英国、法国与奥地利在维也纳美景宫签订国家条约，恢复奥地利的主权。', who: ['利奥波德·菲格尔', '尤利乌斯·拉布'] },
  { y: 1955, mo: md(7, 27), cal: '1955 年 7 月 27 日', t: '奥地利国家条约生效', p: '维也纳', m: '今奥地利维也纳', ll: [16.37, 48.21], k: 'pol', refs: ['条约与协定'],
    d: '条约生效，四国对奥地利的占领结束，各国军队在九十天内撤出，最后一批 10 月 25 日离开。次日奥地利议会通过永久中立法。', who: ['尤利乌斯·拉布'] },
  { y: 1955, mo: md(10, 23), cal: '1955 年 10 月 23 日', t: '萨尔公民投票', p: '萨尔布吕肯', m: '今德国萨尔布吕肯', ll: [7.0, 49.23], k: 'pol', refs: ['各国法令'],
    d: '萨尔居民就法国与联邦德国商定的“萨尔地位法”投票，约三分之二的票反对。此后法德两国谈判，1956 年 10 月签订卢森堡条约，同意萨尔回归德国。', who: [] },
  { y: 1956, mo: md(5, 24), cal: '1956 年 5 月 24 日', t: '第一届欧洲歌唱大赛', p: '卢加诺', m: '今瑞士卢加诺', ll: [8.95, 46.0], k: 'cul', refs: ['文化记录'],
    d: '欧洲广播联盟在卢加诺举办第一届欧洲歌唱大赛，七个国家参加，各国电台与电视台同时转播，瑞士歌手获胜。此后每年举办。', who: [] },
  { y: 1956, mo: md(11, 4), cal: '1956 年 11 月 4 日', t: '苏联军队进入布达佩斯', p: '布达佩斯', m: '今匈牙利布达佩斯', ll: [19.04, 47.5], k: 'pol', refs: ['战事记录'],
    d: '10 月 23 日布达佩斯发生大规模示威，匈牙利政府宣布退出华沙条约组织。11 月 4 日苏联军队进入布达佩斯，另组新政府。约二十万人离开匈牙利。', who: [] },
  { y: 1957, mo: md(1, 1), cal: '1957 年 1 月 1 日', t: '萨尔回归联邦德国', p: '萨尔布吕肯', m: '今德国萨尔布吕肯', ll: [7.0, 49.24], k: 'pol', refs: ['条约与协定'],
    d: '按卢森堡条约，萨尔在政治上并入联邦德国，成为一个州；经济上的回归到 1959 年 7 月完成。', who: ['康拉德·阿登纳'] },
  { y: 1957, mo: md(3, 25), cal: '1957 年 3 月 25 日', t: '罗马条约签订', p: '罗马', m: '今意大利罗马', ll: [12.5, 41.9], k: 'eco', refs: ['条约与协定'],
    d: '煤钢共同体六国在罗马签订条约，成立欧洲经济共同体与欧洲原子能共同体，1958 年 1 月 1 日生效。', who: ['康拉德·阿登纳'] },
  { y: 1957, mo: md(10, 4), cal: '1957 年 10 月 4 日', t: '第一颗人造卫星', p: '拜科努尔', m: '今哈萨克斯坦拜科努尔发射场', ll: [63.34, 45.92], k: 'cul', refs: ['科技记录'],
    d: '苏联用 R-7 火箭从拜科努尔发射场发射人造地球卫星一号，这是第一颗进入轨道的人造卫星，直径五十八厘米，绕地球运行约三个月。', who: ['谢尔盖·科罗廖夫'] },
  { y: 1960, mo: md(8, 16), cal: '1960 年 8 月 16 日', t: '塞浦路斯独立', p: '尼科西亚', m: '今塞浦路斯尼科西亚', ll: [33.36, 35.17], k: 'pol', refs: ['条约与协定'],
    d: '按苏黎世—伦敦协定，英国殖民地塞浦路斯独立为共和国，马卡里奥斯三世任总统，英国保留岛南部的两处主权基地区。', who: ['马卡里奥斯三世'] },
  { y: 1961, mo: md(4, 12), cal: '1961 年 4 月 12 日', t: '加加林进入太空', p: '恩格斯', m: '今俄罗斯萨拉托夫州恩格斯附近（降落地点）', ll: [46.12, 51.48], k: 'cul', refs: ['科技记录'],
    d: '加加林乘东方一号飞船从拜科努尔起飞，绕地球一圈，飞行一百零八分钟，在萨拉托夫州恩格斯附近着陆，是第一个进入太空的人。', who: ['尤里·加加林', '谢尔盖·科罗廖夫'] },
  { y: 1961, mo: md(8, 13), cal: '1961 年 8 月 13 日', t: '柏林墙修建', p: '柏林', m: '今德国柏林', ll: [13.4, 52.52], k: 'pol', refs: ['各国法令'],
    d: '民主德国在一夜之间封闭东西柏林之间的通道，此后修起长约一百五十公里的围墙，环绕西柏林。到 1989 年 11 月开放为止，柏林墙存在了二十八年。', who: ['瓦尔特·乌布利希'] },
  { y: 1962, mo: md(10, 5), cal: '1962 年 10 月 5 日', t: '披头士发行第一张单曲', p: '利物浦', m: '今英国利物浦', ll: [-2.98, 53.41], k: 'cul', refs: ['文化记录'],
    d: '利物浦的四人乐队披头士发行第一张单曲《爱我吧》。此后几年间乐队风靡英国与美国，是唱片销量最高的乐队之一。', who: [] },
  { y: 1964, mo: md(9, 21), cal: '1964 年 9 月 21 日', t: '马耳他独立', p: '瓦莱塔', m: '今马耳他瓦莱塔', ll: [14.51, 35.9], k: 'pol', refs: ['各国法令'],
    d: '英国殖民地马耳他独立，博尔格·奥利维尔任总理。1974 年 12 月 13 日马耳他改为共和国。', who: ['乔治·博尔格·奥利维尔'] },
  { y: 1968, mo: md(8, 21), cal: '1968 年 8 月 21 日', t: '华约军队进入捷克斯洛伐克', p: '布拉格', m: '今捷克布拉格', ll: [14.42, 50.09], k: 'pol', refs: ['战事记录'],
    d: '8 月 20 日夜间，苏联与波兰、匈牙利、保加利亚的军队进入捷克斯洛伐克，次日控制布拉格。此后苏联军队在当地驻扎到 1991 年。', who: [] },
  { y: 1969, mo: md(1, 1), cal: '1969 年 1 月 1 日', t: '捷克斯洛伐克改为联邦', p: '布拉格', m: '今捷克布拉格', ll: [14.43, 50.08], k: 'pol', refs: ['各国法令'],
    d: '按 1968 年 10 月通过的联邦法，捷克斯洛伐克由捷克社会主义共和国与斯洛伐克社会主义共和国两个联邦成员组成。1993 年两部分分为两个国家。', who: [] },
  { y: 1969, mo: md(3, 2), cal: '1969 年 3 月 2 日', t: '协和式客机首飞', p: '图卢兹', m: '今法国图卢兹', ll: [1.44, 43.6], k: 'cul', refs: ['科技记录'],
    d: '英法两国联合研制的协和式超音速客机原型机在图卢兹首次试飞。1976 年开始定期航班，巡航速度约为音速的两倍，2003 年退役。', who: [] },
  { y: 1970, mo: md(12, 7), cal: '1970 年 12 月 7 日', t: '联邦德国与波兰签订华沙条约', p: '华沙', m: '今波兰华沙', ll: [21.0, 52.24], k: 'dip', refs: ['条约与协定'],
    d: '联邦德国总理勃兰特与波兰总理西伦凯维兹在华沙签订条约，联邦德国承认奥得河—尼斯河线为波兰的西部边界，1972 年 6 月 3 日生效。', who: ['维利·勃兰特', '约瑟夫·西伦凯维兹'] },
  { y: 1971, mo: md(9, 3), cal: '1971 年 9 月 3 日', t: '柏林四方协定', p: '柏林', m: '今德国柏林', ll: [13.38, 52.51], k: 'dip', refs: ['条约与协定'],
    d: '美国、英国、法国、苏联签订关于柏林的协定，保证西柏林与联邦德国之间的交通，西柏林居民可以探访东柏林与民主德国。', who: [] },
  { y: 1972, mo: md(6, 3), cal: '1972 年 6 月 3 日', t: '华沙条约生效', p: '波恩', m: '今德国波恩', ll: [7.1, 50.73], k: 'dip', refs: ['条约与协定'],
    d: '联邦德国议会批准的华沙条约与对苏条约同日生效，柏林四方协定也在这一天签署最后议定书。', who: ['维利·勃兰特'] },
  { y: 1972, mo: md(12, 21), cal: '1972 年 12 月 21 日', t: '两德基础条约', p: '柏林', m: '今德国柏林', ll: [13.41, 52.53], k: 'dip', refs: ['条约与协定'],
    d: '联邦德国与民主德国在东柏林签订关于两国关系基础的条约，互相承认对方的主权，互设常驻代表处。1973 年 9 月 18 日两个德国同时加入联合国。', who: ['维利·勃兰特', '埃里希·昂纳克'] },
  { y: 1973, mo: md(1, 1), cal: '1973 年 1 月 1 日', t: '英国、丹麦、爱尔兰加入欧洲共同体', p: '伦敦', m: '今英国伦敦', ll: [-0.13, 51.51], k: 'eco', refs: ['条约与协定'],
    d: '英国、丹麦、爱尔兰加入欧洲共同体，成员国由六国增为九国。挪威在 1972 年的全民公决中决定不加入。', who: [] },
  { y: 1974, mo: md(7, 20), cal: '1974 年 7 月 20 日', t: '土耳其军队在塞浦路斯登陆', p: '尼科西亚', m: '今塞浦路斯尼科西亚', ll: [33.37, 35.18], k: 'pol', refs: ['战事记录', '联合国记录'],
    d: '7 月 15 日塞浦路斯发生政变，7 月 20 日土耳其军队在岛北部登陆，8 月中旬推进后控制北部约三分之一。此后联合国部队驻守双方停火线之间的缓冲区。1983 年北部宣布成立“北塞浦路斯土耳其共和国”，只有土耳其承认。', who: ['马卡里奥斯三世'] },
  { y: 1975, mo: md(8, 1), cal: '1975 年 8 月 1 日', t: '赫尔辛基最后文件', p: '赫尔辛基', m: '今芬兰赫尔辛基', ll: [24.94, 60.17], k: 'dip', refs: ['条约与协定'],
    d: '欧洲安全与合作会议在赫尔辛基闭幕，三十五国领导人签署最后文件，各国承诺不以武力改变边界，并在经济、科技、人员往来等方面合作。', who: ['乌尔霍·吉科宁', '埃里希·昂纳克'] },
  { y: 1981, mo: md(1, 1), cal: '1981 年 1 月 1 日', t: '希腊加入欧洲共同体', p: '雅典', m: '今希腊雅典', ll: [23.73, 37.98], k: 'eco', refs: ['条约与协定'],
    d: '希腊加入欧洲共同体，成为第十个成员国。', who: [] },
  { y: 1986, mo: md(1, 1), cal: '1986 年 1 月 1 日', t: '西班牙、葡萄牙加入欧洲共同体', p: '马德里', m: '今西班牙马德里', ll: [-3.7, 40.42], k: 'eco', refs: ['条约与协定'],
    d: '西班牙与葡萄牙加入欧洲共同体，成员国增为十二个。同年各国签署单一欧洲法令，约定到 1992 年底建成统一市场。', who: [] },
  { y: 1986, mo: md(4, 26), cal: '1986 年 4 月 26 日', t: '切尔诺贝利核电站事故', p: '普里皮亚季', m: '今乌克兰普里皮亚季', ll: [30.06, 51.4], k: 'cul', refs: ['科技记录'],
    d: '乌克兰北部切尔诺贝利核电站四号机组在试验中发生爆炸，放射性物质飘散到欧洲大部分地区。电站周围三十公里内的居民全部撤离，至今仍是禁区。', who: [] },
];

const PEOPLE_RAW = [
  // 各国领导人：只写职务与任期，不作评价
  ['康拉德·阿登纳', 'de', '', '1876–1967', '1949 年 9 月至 1963 年 10 月任联邦德国总理。'],
  ['维利·勃兰特', 'de', '', '1913–1992', '1957 年至 1966 年任西柏林市长，1969 年 10 月至 1974 年 5 月任联邦德国总理，1971 年获诺贝尔和平奖。'],
  ['瓦尔特·乌布利希', 'dd', '', '1893–1973', '1950 年至 1971 年任德国统一社会党中央第一书记，1960 年至 1973 年任民主德国国务委员会主席。'],
  ['埃里希·昂纳克', 'dd', '', '1912–1994', '1971 年至 1989 年 10 月任德国统一社会党中央第一书记（总书记），1976 年至 1989 年任民主德国国务委员会主席。'],
  ['尤利乌斯·拉布', 'at', '', '1891–1964', '1953 年 4 月至 1961 年 4 月任奥地利总理。'],
  ['利奥波德·菲格尔', 'at', '', '1902–1965', '1945 年至 1953 年任奥地利总理，1953 年至 1959 年任外交部长，代表奥地利签署国家条约。'],
  ['约瑟夫·西伦凯维兹', 'pl', '', '1911–1989', '1947 年至 1952 年、1954 年至 1970 年 12 月任波兰部长会议主席。'],
  ['约瑟普·布罗兹·铁托', 'yu', '', '1892–1980', '1945 年至 1963 年任南斯拉夫政府首脑，1953 年 1 月起任南斯拉夫总统，任职到 1980 年 5 月去世。'],
  ['马卡里奥斯三世', 'cy', '', '1913–1977', '塞浦路斯正教会大主教，1960 年 8 月起任塞浦路斯总统，任职到 1977 年 8 月去世（1974 年 7 月至 12 月离任）。'],
  ['乔治·博尔格·奥利维尔', 'mt', '', '1911–1980', '1950 年至 1955 年、1962 年至 1971 年任马耳他总理。'],
  ['乌尔霍·吉科宁', 'fi', '', '1900–1986', '1956 年 3 月至 1982 年 1 月任芬兰总统。'],
  // 科技
  ['弗朗西斯·克里克', 'gb', '', '1916–2004', '英国分子生物学家，1953 年与沃森提出 DNA 双螺旋结构，1962 年获诺贝尔生理学或医学奖。'],
  ['罗莎琳德·富兰克林', 'gb', '', '1920–1958', '英国化学家、晶体学家，拍摄的 DNA 纤维 X 射线衍射照片为双螺旋模型提供了依据。'],
  ['谢尔盖·科罗廖夫', 'ussr', '', '1907–1966', '苏联火箭与航天器总设计师，主持研制 R-7 火箭、第一颗人造卫星与东方号载人飞船。'],
  ['尤里·加加林', 'ussr', '', '1934–1968', '苏联航天员，1961 年 4 月 12 日乘东方一号成为第一个进入太空的人。'],
];
