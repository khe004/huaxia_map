// 生成北欧亚底图包的陆地拼块 basemaps/eurasia/units.topo.json（列国舆图《苏联解体》等卷用）。
// 用法：node tools/units-eurasia.js <数据目录>（在 tools/ 下 npm i 之后）
// 数据目录里放 Natural Earth 1:1000 万的 ne_10m_admin_1_states_provinces.geojson、ne_10m_admin_0_countries.geojson（https://github.com/nvkelso/natural-earth-vector）。
// 拼块：原苏联 15 个加盟共和国的 Natural Earth 一级行政区；另把萨哈林州的南千岛群岛（择捉、国后、色丹、齿舞）拆成单独的拼块，
// 拜科努尔租借区（Natural Earth 单列为国家级单位）补作哈萨克斯坦的拼块；克里米亚与塞瓦斯托波尔按国际通行的看法记作乌克兰（与 europe 底图一致）。
// 其余国家按国家放进 nb，只画陆地、不分拼块（美国只留阿拉斯加）。
// 所有陆地一起清理、一起简化，拼块外缘、国界与海岸线共用同一套边。拼块属性：n 名称（Natural Earth 英文名），p 今国名（中文）。
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const dir = process.argv[2];
if (!dir) { console.error('用法：node tools/units-eurasia.js <数据目录>'); process.exit(1); }
const OUT = path.join(__dirname, '..', 'basemaps', 'eurasia');
const rd = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));

const CN = { RUS: '俄罗斯', UKR: '乌克兰', BLR: '白俄罗斯', MDA: '摩尔多瓦', EST: '爱沙尼亚', LVA: '拉脱维亚', LTU: '立陶宛', GEO: '格鲁吉亚', ARM: '亚美尼亚',
  AZE: '阿塞拜疆', KAZ: '哈萨克斯坦', UZB: '乌兹别克斯坦', TKM: '土库曼斯坦', KGZ: '吉尔吉斯斯坦', TJK: '塔吉克斯坦' };
// nb 只保留与这个经纬度范围相交的国家
const BIG = [-10, 20, 180, 85];

const bboxOf = g => { let a = [Infinity, Infinity, -Infinity, -Infinity];
  const walk = c => (typeof c[0] === 'number' ? (a = [Math.min(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[2], c[0]), Math.max(a[3], c[1])]) : c.forEach(walk));
  walk(g.coordinates); return a; };
const polysOf = g => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates);
const mp = ps => ({ type: 'MultiPolygon', coordinates: ps });

const units = [], nb = [];
for (const f of rd('ne_10m_admin_1_states_provinces.geojson').features) {
  let a3 = f.properties.adm0_a3; if (!CN[a3] || !f.geometry) continue;
  const n = f.properties.name;
  if (['Crimea', 'Sevastopol'].includes(n)) a3 = 'UKR';
  if (n === 'Sakhalin') {
    // 南千岛群岛：萨哈林州在东经 145° 以东、北纬 45.8° 以南的各岛
    const south = [], rest = [];
    for (const p of polysOf(f.geometry)) { const b = bboxOf({ coordinates: p }); (b[0] > 145 && b[3] < 45.8 ? south : rest).push(p); }
    units.push({ type: 'Feature', properties: { n: 'South Kurils', p: CN.RUS, g: 'south-kurils' }, geometry: mp(south) });
    units.push({ type: 'Feature', properties: { n, p: CN.RUS, g: f.properties.adm1_code }, geometry: mp(rest) });
    continue;
  }
  units.push({ type: 'Feature', properties: { n, p: CN[a3], g: f.properties.adm1_code }, geometry: f.geometry });
}
for (const f of rd('ne_10m_admin_0_countries.geojson').features) {
  const a3 = f.properties.ADM0_A3; if (!f.geometry) continue;
  if (a3 === 'KAB') { units.push({ type: 'Feature', properties: { n: 'Baikonur', p: CN.KAZ, g: 'baikonur' }, geometry: f.geometry }); continue; }
  if (CN[a3]) continue;
  let g = f.geometry;
  if (a3 === 'USA') { g = mp(polysOf(g).filter(p => { const b = bboxOf({ coordinates: p }); return b[2] < -129 && b[1] > 50; })); if (!g.coordinates.length) continue; }
  else if (['CAN', 'GRL'].includes(a3)) continue;
  const b = bboxOf(g); if (b[2] < BIG[0] || b[0] > BIG[2] || b[3] < BIG[1] || b[1] > BIG[3]) continue;
  nb.push({ type: 'Feature', properties: { n: f.properties.NAME_EN || f.properties.NAME, g: 'nb-' + a3 }, geometry: g });
}

const T = fs.mkdtempSync(path.join(require('os').tmpdir(), 'ea-'));
const all = { type: 'FeatureCollection', features: [...units.map(f => ({ ...f, properties: { ...f.properties, k: 'u' } })), ...nb.map(f => ({ ...f, properties: { ...f.properties, k: 'nb' } }))] };
fs.writeFileSync(path.join(T, 'all.json'), JSON.stringify(all));
console.log('拼块', units.length, '· 范围外', nb.length);
const MS = path.join(__dirname, 'node_modules', '.bin', 'mapshaper');
execFileSync(MS, ['-i', path.join(T, 'all.json'), 'snap', 'snap-interval=0.0002',
  '-dissolve2', 'g', 'copy-fields=n,p,k',
  '-clean', 'gap-fill-area=200km2', 'snap-interval=0.0002',
  '-simplify', 'weighted', 'percentage=5%', 'keep-shapes',
  '-clean',
  '-filter-slivers', 'min-area=3km2',
  '-each', 'delete g',
  '-split', 'k',
  '-each', 'delete k',
  '-o', path.join(T, 'out.topo.json'), 'format=topojson', 'quantization=60000', 'combine-layers'], { stdio: 'inherit' });
const topo = JSON.parse(fs.readFileSync(path.join(T, 'out.topo.json'), 'utf8'));
const o = topo.objects, key = v => Object.keys(o).find(k => k === v || k.endsWith('-' + v)), U = o[key('u')], N = o[key('nb')];
if (!U || !N) { console.error('拆层失败：', Object.keys(o)); process.exit(1); }
topo.objects = { units: U, nb: N };
for (const g of N.geometries) g.properties = { n: g.properties.n };
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'units.topo.json'), JSON.stringify(topo));
console.log('units.topo.json', U.geometries.length, '拼块,', N.geometries.length, '范围外,', Math.round(fs.statSync(path.join(OUT, 'units.topo.json')).size / 1024), 'KB');
