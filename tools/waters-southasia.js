// 生成南亚底图包的水系 basemaps/southasia/geo.json（rv 河流、lk 湖泊），做法与 tools/waters-europe.js 相同，范围与译名不同。
// 用法：node tools/waters-southasia.js <数据目录>（在 tools/ 下 npm i 之后）
// 数据目录里放 Natural Earth 1:1000 万的 ne_10m_rivers_lake_centerlines.geojson、ne_10m_lakes.geojson、ne_10m_lakes_europe.geojson。
// 河流：范围内的全部河道，主要河流译成中文名（ZH），m:1 为加粗的大河；近代开凿的运河（苏伊士运河等）不画。
// 湖泊：天然湖泊（有中文名的，或 scalerank 不大于 4 的大湖），近代水库（featurecla 为 Reservoir，及纳赛尔湖、艾瑟尔湖等）不画；欧洲小湖只收与史事有关的几个（特拉西梅诺湖等）。
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const dir = process.argv[2];
if (!dir) { console.error('用法：node tools/waters-southasia.js <数据目录>'); process.exit(1); }
const OUT = path.join(__dirname, '..', 'basemaps', 'southasia', 'geo.json');
const rd = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const BOX = [55, -2, 105, 40];
const ZH = {
  Indus: '印度河', Jhelum: '杰赫勒姆河', Chenab: '杰纳布河', Ravi: '拉维河', Beas: '比亚斯河', Sutlej: '萨特莱杰河', Helmand: '赫尔曼德河', Harirud: '哈里河',
  Panj: '喷赤河', 'Amu  Darya': '阿姆河', Kabul: '喀布尔河', Ganges: '恒河', Yamuna: '亚穆纳河', 'Ghäghara': '格尔格拉河', Gandak: '根德格河', Son: '松河',
  Chambal: '昌巴尔河', Betwa: '贝特瓦河', Brahmaputra: '布拉马普特拉河', Dihang: '布拉马普特拉河', Yarlung: '雅鲁藏布江', Luhit: '洛希特河', Tista: '提斯塔河',
  Narmada: '讷尔默达河', Tapi: '达布蒂河', 'Godävari': '戈达瓦里河', Krishna: '克里希纳河', Bhima: '比马河', Tungabhadra: '栋格珀德拉河', Cauvery: '高韦里河',
  'Mahäna Nadï': '默哈讷迪河', Penner: '本内尔河', Mahi: '马希河', Indravati: '因德拉瓦蒂河', Wainganga: '温根加河', Mahaweli: '马哈威利河',
  Ayeyarwady: '伊洛瓦底江', 'Irrawaddy Delta': '伊洛瓦底江', Chindwin: '钦敦江', Salween: '萨尔温江', Nu: '萨尔温江', Sittong: '锡当河', Kaladan: '加拉丹河',
  Mekong: '湄公河', Lancang: '湄公河', 'Chao Phraya': '湄南河', Ping: '滨河', Yom: '永河', Jinsha: '金沙江', Yarkant: '叶尔羌河',
};
const MAJOR = new Set(['印度河', '恒河', '布拉马普特拉河', '雅鲁藏布江', '伊洛瓦底江', '萨尔温江', '湄公河']);
const SKIP_RV = new Set(['Suez Canal', 'Ismailiya Canal', 'Caledonian Canal', 'Ferenc Csatorna', 'Gharraf Canal', 'Hindiyah Channel']);
const LZH = { 'Nam Co': '纳木错', 'Siling Co': '色林错', 'Mapam Yumco': '玛旁雍错', 'Yamzho Yumco': '羊卓雍错', 'Banggong Co': '班公错' };
const SKIP_LK = /Reservoir|Nasser|IJsselmeer|Razazah|Tharthar|Sarygamysh|Barsakelmes|Qusmuryn/i;
const EU_KEEP = new Set();

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
