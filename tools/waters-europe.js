// 生成欧洲底图包的水系 basemaps/europe/geo.json（rv 河流、lk 湖泊）。
// 用法：node tools/waters-europe.js <数据目录>（在 tools/ 下 npm i 之后）
// 数据目录里放 Natural Earth 1:1000 万的 ne_10m_rivers_lake_centerlines.geojson、ne_10m_lakes.geojson、ne_10m_lakes_europe.geojson。
// 河流：范围内的全部河道，主要河流译成中文名（ZH），m:1 为加粗的大河；近代开凿的运河（苏伊士运河等）不画。
// 湖泊：天然湖泊（有中文名的，或 scalerank 不大于 4 的大湖），近代水库（featurecla 为 Reservoir，及纳赛尔湖、艾瑟尔湖等）不画；欧洲小湖只收与史事有关的几个（特拉西梅诺湖等）。
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const dir = process.argv[2];
if (!dir) { console.error('用法：node tools/waters-europe.js <数据目录>'); process.exit(1); }
const OUT = path.join(__dirname, '..', 'basemaps', 'europe', 'geo.json');
const rd = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const BOX = [-26, 15, 68, 72];
const ZH = {
  Rhein: '莱茵河', Rhin: '莱茵河', Rhine: '莱茵河', Nederrijn: '莱茵河', Waal: '瓦尔河', Lek: '莱克河', IJssel: '艾瑟尔河',
  Danube: '多瑙河', Donau: '多瑙河', 'Soroksari Duna': '多瑙河', 'Bratul Chillia': '多瑙河', 'Bratul Sulina': '多瑙河', 'Bratul Sfintu Gheorghe': '多瑙河', Borcea: '多瑙河',
  Dnipro: '第聂伯河', Dnepre: '第聂伯河', Dniester: '德涅斯特河', Don: '顿河', Volga: '伏尔加河', Ural: '乌拉尔河', Kama: '卡马河', Oka: '奥卡河',
  Donets: '北顿涅茨河', 'Southern Bug': '南布格河', Bug: '布格河', Pripyat: '普里皮亚季河', Desna: '杰斯纳河', Kuban: '库班河', Kura: '库拉河', Aras: '阿拉斯河',
  Neva: '涅瓦河', Daugava: '道加瓦河', Neman: '涅曼河', Vistula: '维斯瓦河', Oder: '奥得河', Warta: '瓦尔塔河', Elbe: '易北河', Vltava: '伏尔塔瓦河',
  Weser: '威悉河', Ems: '埃姆斯河', Main: '美因河', Mosel: '摩泽尔河', Maas: '马斯河', Schelde: '斯海尔德河', Seine: '塞纳河', Marne: '马恩河', Yonne: '约讷河',
  Loire: '卢瓦尔河', Vienne: '维埃纳河', Garonne: '加龙河', Dordogne: '多尔多涅河', Tarn: '塔恩河', Rhône: '罗讷河', Rhne: '罗讷河', Sane: '索恩河', Doubs: '杜河',
  Durance: '迪朗斯河', Thames: '泰晤士河', Severn: '塞文河', Trent: '特伦特河', Shannon: '香农河', Ebro: '埃布罗河', Tajo: '塔霍河', Tejo: '塔霍河',
  Duero: '杜罗河', Guadiana: '瓜迪亚纳河', Guadalquivir: '瓜达尔基维尔河', Minho: '米尼奥河', Segre: '塞格雷河', Esla: '埃斯拉河', Po: '波河', Tevere: '台伯河',
  Adige: '阿迪杰河', Ticino: '提契诺河', Mincio: '明乔河', 'Dora Baltea': '多拉巴尔泰阿河', Ofanto: '奥凡托河', Inn: '因河', Drau: '德拉瓦河', Mur: '穆尔河',
  Sava: '萨瓦河', Drina: '德里纳河', Morava: '摩拉瓦河', Tisa: '蒂萨河', Mures: '穆列什河', Olt: '奥尔特河', Prut: '普鲁特河', Ialomita: '雅洛米察河',
  Evros: '马里查河', Strymnas: '斯特鲁马河', Haliacmon: '阿利阿克蒙河', Drin: '德林河', Bojana: '博亚纳河', 'Kiz?lirmak': '克孜勒河', Sakarya: '萨卡里亚河',
  'Byk Menderes': '大门德雷斯河', Simav: '西马夫河', Ceyhan: '杰伊汉河', Kelkit: '凯尔基特河', Murat: '穆拉特河', Euphrates: '幼发拉底河', Firat: '幼发拉底河',
  'Al Furat': '幼发拉底河', Tigris: '底格里斯河', Dicle: '底格里斯河', 'Shatt al Arab': '阿拉伯河', 'Shatt al Hillah': '希拉河', Karkheh: '卡尔黑河',
  'Qezel Owzan': '克孜勒乌赞河', Sefid: '塞菲德河', Atrek: '阿特雷克河', Jordan: '约旦河', Nile: '尼罗河', 'Rosetta Branch': '尼罗河', 'Damietta Branch': '尼罗河',
  Moulouya: '穆卢耶河', 'Oued Sebou': '塞布河', 'Oum Er Rbia': '乌姆赖比阿河', Sous: '苏斯河', 'Syr  Darya': '锡尔河', 'Amu  Darya': '阿姆河',
};
const MAJOR = new Set(['莱茵河', '多瑙河', '第聂伯河', '伏尔加河', '顿河', '尼罗河', '幼发拉底河', '底格里斯河', '罗讷河', '波河', '埃布罗河', '易北河', '维斯瓦河', '卢瓦尔河', '塞纳河', '塔霍河']);
const SKIP_RV = new Set(['Suez Canal', 'Ismailiya Canal', 'Caledonian Canal', 'Ferenc Csatorna', 'Gharraf Canal', 'Hindiyah Channel']);
const LZH = { 'Lake Geneva': '日内瓦湖', Bodensee: '博登湖', 'Lake Balaton': '巴拉顿湖', 'Sea of Galilee': '加利利海', 'Dead Sea': '死海', 'Lake Van': '凡湖',
  'Lake Urmia': '乌尔米耶湖', 'Lake Tuz': '图兹湖', 'Lake Sevan': '塞凡湖', 'Lake Skadar': '斯库台湖', 'Lake Ladoga': '拉多加湖', 'Lake Onega': '奥涅加湖',
  Vänern: '维纳恩湖', Vättern: '韦特恩湖', 'Lake Peipus': '楚德湖', 'Lough Neagh': '内伊湖', "Lake Il'Men'": '伊尔门湖', Syvash: '锡瓦什湖', Mälaren: '梅拉伦湖',
  'Lake Hammar': '哈马尔湖', 'Lake Habbaniyah': '哈巴尼亚湖', 'Lake Ohrid': '奥赫里德湖', 'Lake Prespa': '普雷斯帕湖', 'Lago di Garda': '加尔达湖', 'Lago Maggiore': '马焦雷湖',
  Trasimeno: '特拉西梅诺湖', 'Lago di Bolsena': '博尔塞纳湖', 'Lago di Como': '科莫湖', 'Zürichsee': '苏黎世湖', 'Neuchâtel': '纳沙泰尔湖' };
const SKIP_LK = /Reservoir|Nasser|IJsselmeer|Razazah|Tharthar|Aral|Sarygamysh|Barsakelmes|Qusmuryn/i;
const EU_KEEP = new Set(['Trasimeno', 'Lago di Bolsena', 'Lago di Como', 'Zürichsee', 'Neuchâtel']);

const inBox = g => { let hit = false; const walk = c => { if (hit) return; if (typeof c[0] === 'number') { if (c[0] >= BOX[0] && c[0] <= BOX[2] && c[1] >= BOX[1] && c[1] <= BOX[3]) hit = true; } else c.forEach(walk); }; walk(g.coordinates); return hit; };
const rv = rd('ne_10m_rivers_lake_centerlines.geojson').features.filter(f => f.geometry && inBox(f.geometry) && !SKIP_RV.has(f.properties.name))
  .map(f => { const zh = ZH[f.properties.name]; return { type: 'Feature', properties: { n: zh || f.properties.name || '', ...(MAJOR.has(zh) ? { m: 1 } : {}) }, geometry: f.geometry }; });
const lk = [...rd('ne_10m_lakes.geojson').features.filter(f => f.properties.featurecla !== 'Reservoir' && (LZH[f.properties.name] || f.properties.scalerank <= 4)),
  ...rd('ne_10m_lakes_europe.geojson').features.filter(f => EU_KEEP.has(f.properties.name))]
  .filter(f => f.geometry && inBox(f.geometry) && !SKIP_LK.test(f.properties.name || ''))
  .map(f => ({ type: 'Feature', properties: { n: LZH[f.properties.name] || f.properties.name || '' }, geometry: f.geometry }));
// 简化：河流与湖泊各自用 mapshaper 简化、截取小数位
const T = fs.mkdtempSync(path.join(require('os').tmpdir(), 'euw-'));
const MS = path.join(__dirname, 'node_modules', '.bin', 'mapshaper');
const simp = (name, fc, pct) => { fs.writeFileSync(path.join(T, name + '.json'), JSON.stringify({ type: 'FeatureCollection', features: fc }));
  execFileSync(MS, ['-i', path.join(T, name + '.json'), '-simplify', 'weighted', pct, 'keep-shapes', '-o', path.join(T, name + '.out.json'), 'format=geojson', 'precision=0.001'], { stdio: 'inherit' });
  return JSON.parse(fs.readFileSync(path.join(T, name + '.out.json'), 'utf8')); };
const out = { rv: simp('rv', rv, '25%'), lk: simp('lk', lk, '30%') };
for (const k of ['rv', 'lk']) out[k] = { type: 'FeatureCollection', features: out[k].features.filter(f => f.geometry) };
fs.writeFileSync(OUT, JSON.stringify(out));
console.log('geo.json 河流', out.rv.features.length, '湖泊', out.lk.features.length, Math.round(fs.statSync(OUT).size / 1024), 'KB');
