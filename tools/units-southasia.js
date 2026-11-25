// 生成南亚底图包的陆地拼块 basemaps/southasia/units.topo.json（列国舆图《南亚分治》等卷用）。
// 用法：node tools/units-southasia.js <数据目录>（在 tools/ 下 npm i 之后）
// 数据目录里放 Natural Earth 1:1000 万的 ne_10m_admin_1_states_provinces.geojson、ne_10m_admin_0_countries.geojson（https://github.com/nvkelso/natural-earth-vector）。
// 拼块：印度、巴基斯坦、孟加拉国、斯里兰卡、缅甸、尼泊尔、不丹、马尔代夫、阿富汗的 Natural Earth 一级行政区；锡亚琴冰川（Natural Earth 单列为国家级单位）补作一个拼块（p 记为克什米尔）。
// 克什米尔各区按 Natural Earth 的实际管辖线分属印度（查谟和克什米尔、拉达克）与巴基斯坦（自由克什米尔、北部地区），名称照 Natural Earth，不表示归属。
// 其余国家按国家放进 nb，只画陆地、不分拼块。
// 所有陆地一起清理、一起简化，拼块外缘、国界与海岸线共用同一套边。拼块属性：n 名称（Natural Earth 英文名），p 今国名（中文）。
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const dir = process.argv[2];
if (!dir) { console.error('用法：node tools/units-southasia.js <数据目录>'); process.exit(1); }
const OUT = path.join(__dirname, '..', 'basemaps', 'southasia');
const rd = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));

const CN = { IND: '印度', PAK: '巴基斯坦', BGD: '孟加拉国', LKA: '斯里兰卡', MMR: '缅甸', NPL: '尼泊尔', BTN: '不丹', MDV: '马尔代夫', AFG: '阿富汗' };
// nb 只保留与这个经纬度范围相交的国家
const BIG = [40, -12, 125, 50];

const bboxOf = g => { let a = [Infinity, Infinity, -Infinity, -Infinity];
  const walk = c => (typeof c[0] === 'number' ? (a = [Math.min(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[2], c[0]), Math.max(a[3], c[1])]) : c.forEach(walk));
  walk(g.coordinates); return a; };

const units = [], nb = [];
for (const f of rd('ne_10m_admin_1_states_provinces.geojson').features) {
  const a3 = f.properties.adm0_a3; if (!CN[a3] || !f.geometry) continue;
  units.push({ type: 'Feature', properties: { n: f.properties.name, p: CN[a3], g: f.properties.adm1_code }, geometry: f.geometry });
}
for (const f of rd('ne_10m_admin_0_countries.geojson').features) {
  const a3 = f.properties.ADM0_A3; if (!f.geometry) continue;
  if (a3 === 'KAS') { units.push({ type: 'Feature', properties: { n: 'Siachen Glacier', p: '克什米尔', g: 'siachen' }, geometry: f.geometry }); continue; }
  if (CN[a3]) continue;
  const b = bboxOf(f.geometry); if (b[2] < BIG[0] || b[0] > BIG[2] || b[3] < BIG[1] || b[1] > BIG[3]) continue;
  nb.push({ type: 'Feature', properties: { n: f.properties.NAME_EN || f.properties.NAME, g: 'nb-' + a3 }, geometry: f.geometry });
}

const T = fs.mkdtempSync(path.join(require('os').tmpdir(), 'sa-'));
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
