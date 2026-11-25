// 生成东亚与东南亚底图包的陆地拼块 basemaps/dongya/units.topo.json（列国舆图《东亚与东南亚》等卷用）。
// 用法：node tools/units-dongya.js <数据目录>（在 tools/ 下 npm i 之后）
// 数据目录里放 Natural Earth 1:1000 万的 ne_10m_admin_1_states_provinces.geojson、ne_10m_admin_0_countries.geojson（https://github.com/nvkelso/natural-earth-vector）。
// 拼块：中国、蒙古、朝鲜、韩国、日本、东南亚各国与俄罗斯远东各区的 Natural Earth 一级行政区。西沙群岛不画。
// 为了画出当时的分界，几个拼块按经纬度切开：朝鲜半岛各道按北纬 38 度切开（38 线与今天的军事分界线不重合）；越南广治省按北纬 17 度切开（1954 年的临时军事分界线在贤良河，约在北纬 17 度）；
// 冲绳县切出奄美群岛（Natural Earth 把奄美画在冲绳县里），鹿儿岛县切出吐噶喇列岛，东京都切出小笠原群岛，萨哈林州切出库页岛北纬 50 度以南部分、千岛群岛，以及择捉、国后、色丹与齿舞诸岛（日本称北方四岛）。切出的拼块名称照 Natural Earth 原名加注，不表示归属。
// 其余国家按国家放进 nb，只画陆地、不分拼块。所有陆地一起清理、一起简化，拼块外缘、国界与海岸线共用同一套边。拼块属性：n 名称，p 今国名（中文）。
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const dir = process.argv[2];
if (!dir) { console.error('用法：node tools/units-dongya.js <数据目录>'); process.exit(1); }
const OUT = path.join(__dirname, '..', 'basemaps', 'dongya');
const rd = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const MS = path.join(__dirname, 'node_modules', '.bin', 'mapshaper');
const T = fs.mkdtempSync(path.join(os.tmpdir(), 'dy-'));

const CN = { CHN: '中国', TWN: '中国台湾', HKG: '中国香港', MAC: '中国澳门', MNG: '蒙古', PRK: '朝鲜', KOR: '韩国', JPN: '日本', VNM: '越南', LAO: '老挝', KHM: '柬埔寨',
  THA: '泰国', MYS: '马来西亚', SGP: '新加坡', BRN: '文莱', IDN: '印度尼西亚', PHL: '菲律宾', TLS: '东帝汶', MMR: '缅甸' };
const RUS = new Set(['Sakhalin', "Primor'ye", 'Yevrey', 'Amur', 'Khabarovsk', 'Chita', 'Buryat', 'Tuva', 'Gorno-Altay']);
const SKIP = new Set(['Paracel Islands']);
const BIG = [60, -16, 160, 60];
// 切块：[国家, 拼块名, 切出部分的经纬度框, 切出部分的名称, 余下部分的名称]
const CUT = [
  ['KOR', '*', [120, 38, 135, 45], n => n + ' (north of 38°N)', n => n],
  ['PRK', '*', [120, 30, 135, 38], n => n + ' (south of 38°N)', n => n],
  ['VNM', 'Quảng Trị', [100, 17.0, 112, 25], () => 'Quảng Trị (north of 17°N)', n => n],
  ['JPN', 'Okinawa', [128.2, 27, 131, 28.6], () => 'Amami Islands', n => n],
  ['JPN', 'Tokyo', [138, 20, 146, 28.5], () => 'Ogasawara Islands', n => n],
  ['RUS', 'Sakhalin', [145.3, 43.2, 149.0, 45.55], () => 'Southern Kuril Islands', n => n],
];
// 再切：库页岛北纬 50 度以南（1945 年前属日本），千岛群岛北部与中部（1945 年前属日本）
const CUT2 = [['JPN', 'Kagoshima', [128.8, 29.0, 130.2, 30.05], () => 'Tokara Islands', n => n],
  ['RUS', 'Sakhalin', [140, 45.6, 145.2, 50], () => 'Southern Sakhalin', n => n]];
const CUT3 = [['RUS', 'Sakhalin', [145.2, 45.55, 157, 51.5], () => 'Kuril Islands', n => n]];

const bboxOf = g => { let a = [Infinity, Infinity, -Infinity, -Infinity];
  const walk = c => (typeof c[0] === 'number' ? (a = [Math.min(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[2], c[0]), Math.max(a[3], c[1])]) : c.forEach(walk));
  walk(g.coordinates); return a; };
let seq = 0;
const ms = (f, op, box) => { const i = path.join(T, `c${seq}.json`), o = path.join(T, `c${seq++}.out.json`);
  fs.writeFileSync(i, JSON.stringify({ type: 'FeatureCollection', features: [f] }));
  execFileSync(MS, ['-i', i, op, 'bbox=' + box.join(','), '-o', o, 'format=geojson'], { stdio: 'pipe' });
  const r = JSON.parse(fs.readFileSync(o, 'utf8')).features.filter(x => x.geometry); return r[0] ? r[0].geometry : null; };
const cut = (list, units) => units.flatMap(u => {
  const c = list.find(([a3, n]) => a3 === u.a3 && (n === '*' || n === u.properties.n)); if (!c) return [u];
  const b = bboxOf(u.geometry), [x0, y0, x1, y1] = c[2]; if (b[2] < x0 || b[0] > x1 || b[3] < y0 || b[1] > y1) return [u];
  const inG = ms(u, '-clip', c[2]), outG = ms(u, '-erase', c[2]), r = [];
  if (inG) r.push({ ...u, properties: { ...u.properties, n: c[3](u.properties.n), g: u.properties.g + '-a' }, geometry: inG });
  if (outG) r.push({ ...u, properties: { ...u.properties, n: c[4](u.properties.n), g: u.properties.g + '-b' }, geometry: outG });
  return r; });

let units = [];
const nb = [];
for (const f of rd('ne_10m_admin_1_states_provinces.geojson').features) {
  const a3 = f.properties.adm0_a3; if (!f.geometry || SKIP.has(f.properties.name)) continue;
  if (CN[a3] || (a3 === 'RUS' && RUS.has(f.properties.name)))
    units.push({ type: 'Feature', a3, properties: { n: f.properties.name, p: CN[a3] || '俄罗斯', g: f.properties.adm1_code }, geometry: f.geometry });
}
units = cut(CUT3, cut(CUT2, cut(CUT, units)));
for (const f of rd('ne_10m_admin_0_countries.geojson').features) {
  const a3 = f.properties.ADM0_A3; if (!f.geometry || CN[a3] || a3 === 'PGA' || a3 === 'SCR') continue;
  const b = bboxOf(f.geometry); if (b[2] < BIG[0] || b[0] > BIG[2] || b[3] < BIG[1] || b[1] > BIG[3]) continue;
  nb.push({ type: 'Feature', properties: { n: f.properties.NAME_EN || f.properties.NAME, g: 'nb-' + a3 }, geometry: f.geometry });
}
// 今俄罗斯：远东各区已作拼块，nb 里的俄罗斯扣掉这些区，免得重叠
{ const ri = nb.findIndex(f => f.properties.g === 'nb-RUS'), a = path.join(T, 'ru.json'), b = path.join(T, 'ruu.json'), o = path.join(T, 'ru.out.json');
  fs.writeFileSync(a, JSON.stringify({ type: 'FeatureCollection', features: [nb[ri]] }));
  fs.writeFileSync(b, JSON.stringify({ type: 'FeatureCollection', features: units.filter(u => u.a3 === 'RUS').map(u => ({ type: 'Feature', properties: {}, geometry: u.geometry })) }));
  execFileSync(MS, ['-i', a, '-erase', b, '-o', o, 'format=geojson'], { stdio: 'pipe' });
  nb[ri] = { ...nb[ri], geometry: JSON.parse(fs.readFileSync(o, 'utf8')).features[0].geometry }; }
const all = { type: 'FeatureCollection', features: [...units.map(f => ({ type: 'Feature', properties: { ...f.properties, k: 'u' }, geometry: f.geometry })), ...nb.map(f => ({ ...f, properties: { ...f.properties, k: 'nb' } }))] };
fs.writeFileSync(path.join(T, 'all.json'), JSON.stringify(all));
console.log('拼块', units.length, '· 范围外', nb.length);
execFileSync(MS, ['-i', path.join(T, 'all.json'), 'snap', 'snap-interval=0.0002', '-clip', 'bbox=' + BIG.join(','),
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
const names = U.geometries.map(g => g.properties.n), dup = names.filter((n, i) => names.indexOf(n) !== i);
console.log('units.topo.json', U.geometries.length, '拼块,', N.geometries.length, '范围外,', Math.round(fs.statSync(path.join(OUT, 'units.topo.json')).size / 1024), 'KB', dup.length ? '重名：' + dup.join('、') : '');
