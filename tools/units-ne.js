// 按配置生成底图包的陆地拼块 basemaps/<底图>/units.topo.json（Natural Earth 一级行政区）。做法与 tools/units-dongya.js 相同，范围、国家与切块写在 tools/bm/<底图>.js 里。
// 用法：node tools/units-ne.js <底图> <数据目录>（在 tools/ 下 npm i 之后）
// 数据目录里放 Natural Earth 1:1000 万的 ne_10m_admin_1_states_provinces.geojson、ne_10m_admin_0_countries.geojson（https://github.com/nvkelso/natural-earth-vector）。
// 配置项：
//   CN        { 国家代码: 中文今国名 }：这些国家按一级行政区作拼块（Natural Earth 没有一级行政区的国家，整国作一个拼块）
//   WHOLE     { 国家代码: 中文今国名 }：这些国家（或 Natural Earth 单列的地区）整国作一个拼块
//   ADM1      { 国家代码: [一级行政区名, …] }：只取这几个一级行政区作拼块（如俄罗斯远东），其余部分留在 nb
//   SKIP      [一级行政区名, …]：不画
//   BIG       [西, 南, 东, 北]：画进底图的经纬度范围，范围外裁掉
//   CUT       [[国家代码, 拼块名或 '*', [西, 南, 东, 北], 切出部分的名称（{n} 代原名）], …]：按经纬度框切开拼块，余下部分保留原名；按顺序依次切
//   PSET      { 拼块名: 中文今地名 }：切开之后改写这些拼块的今国名（如摩洛哥一级行政区里属于西撒哈拉的部分）
//   NB_SKIP   [国家代码, …]：不放进 nb 的国家（其范围已由别国的拼块画出）
//   SIMPLIFY  简化比例（默认 '5%'）
// 拼块属性：n 名称（Natural Earth 英文名），p 今国名（中文）。其余国家按国家放进 nb，只画陆地、不分拼块。
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const [bm, dir] = process.argv.slice(2);
if (!bm || !dir) { console.error('用法：node tools/units-ne.js <底图> <数据目录>'); process.exit(1); }
const C = require(path.join(__dirname, 'bm', bm + '.js'));
const OUT = path.join(__dirname, '..', 'basemaps', bm);
const rd = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const MS = path.join(__dirname, 'node_modules', '.bin', 'mapshaper');
const T = fs.mkdtempSync(path.join(os.tmpdir(), bm + '-'));
const CN = C.CN || {}, WHOLE = C.WHOLE || {}, ADM1 = C.ADM1 || {}, SKIP = new Set(C.SKIP || []), BIG = C.BIG;

const bboxOf = g => { let a = [Infinity, Infinity, -Infinity, -Infinity];
  const walk = c => (typeof c[0] === 'number' ? (a = [Math.min(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[2], c[0]), Math.max(a[3], c[1])]) : c.forEach(walk));
  walk(g.coordinates); return a; };
let seq = 0;
const ms = (fc, args) => { const i = path.join(T, `c${seq}.json`), o = path.join(T, `c${seq++}.out.json`);
  fs.writeFileSync(i, JSON.stringify(fc));
  execFileSync(MS, ['-i', i, ...args, '-o', o, 'format=geojson'], { stdio: 'pipe' });
  const j = JSON.parse(fs.readFileSync(o, 'utf8')); return (j.features || (j.geometries ? j.geometries.map(g => ({ geometry: g })) : [])).filter(x => x.geometry); };
const one = f => ({ type: 'FeatureCollection', features: [f] });

let units = [];
const nb = [], has1 = new Set();
for (const f of rd('ne_10m_admin_1_states_provinces.geojson').features) {
  const a3 = f.properties.adm0_a3, n = f.properties.name; if (!f.geometry || SKIP.has(n)) continue;
  if (CN[a3] || (ADM1[a3] && ADM1[a3].includes(n))) {
    has1.add(a3);
    units.push({ type: 'Feature', a3, properties: { n, p: CN[a3] || (C.ADM1P || {})[a3] || a3, g: f.properties.adm1_code }, geometry: f.geometry });
  }
}
const ADM0 = rd('ne_10m_admin_0_countries.geojson').features.filter(f => f.geometry);
for (const f of ADM0) {
  const a3 = f.properties.ADM0_A3, name = f.properties.NAME_EN || f.properties.NAME;
  if (WHOLE[a3] || (CN[a3] && !has1.has(a3))) units.push({ type: 'Feature', a3, properties: { n: name, p: WHOLE[a3] || CN[a3], g: 'u-' + a3 }, geometry: f.geometry });
}
for (const [a3, which, box, nn] of C.CUT || []) {
  units = units.flatMap(u => {
    if (u.a3 !== a3 || (which !== '*' && which !== u.properties.n)) return [u];
    const b = bboxOf(u.geometry); if (b[2] < box[0] || b[0] > box[2] || b[3] < box[1] || b[1] > box[3]) return [u];
    const inG = ms(one(u), ['-clip', 'bbox=' + box.join(',')])[0], outG = ms(one(u), ['-erase', 'bbox=' + box.join(',')])[0], r = [];
    if (inG) r.push({ ...u, properties: { ...u.properties, n: nn.replace('{n}', u.properties.n), g: u.properties.g + '-a' + seq }, geometry: inG.geometry });
    if (outG) r.push({ ...u, properties: { ...u.properties, g: u.properties.g + '-b' + seq }, geometry: outG.geometry });
    return r; });
}
for (const u of units) if ((C.PSET || {})[u.properties.n]) u.properties.p = C.PSET[u.properties.n];
const NBSKIP = new Set(C.NB_SKIP || []);
for (const f of ADM0) {
  const a3 = f.properties.ADM0_A3; if (CN[a3] || WHOLE[a3] || NBSKIP.has(a3)) continue;
  const b = bboxOf(f.geometry); if (b[2] < BIG[0] || b[0] > BIG[2] || b[3] < BIG[1] || b[1] > BIG[3]) continue;
  let g = f.geometry;
  // 只取部分一级行政区作拼块的国家：nb 里扣掉这些拼块，免得重叠
  if (ADM1[a3]) { const own = units.filter(u => u.a3 === a3); if (own.length) {
    const b2 = path.join(T, `e${seq}.json`); fs.writeFileSync(b2, JSON.stringify({ type: 'FeatureCollection', features: own.map(u => ({ type: 'Feature', properties: {}, geometry: u.geometry })) }));
    const r = ms(one(f), ['-erase', b2]); if (!r[0]) continue; g = r[0].geometry; } }
  nb.push({ type: 'Feature', properties: { n: f.properties.NAME_EN || f.properties.NAME, g: 'nb-' + a3 }, geometry: g });
}
const all = { type: 'FeatureCollection', features: [...units.map(f => ({ type: 'Feature', properties: { ...f.properties, k: 'u' }, geometry: f.geometry })), ...nb.map(f => ({ ...f, properties: { ...f.properties, k: 'nb' } }))] };
fs.writeFileSync(path.join(T, 'all.json'), JSON.stringify(all));
console.log('拼块', units.length, '· 范围外', nb.length);
execFileSync(MS, ['-i', path.join(T, 'all.json'), 'snap', 'snap-interval=0.0002', '-clip', 'bbox=' + BIG.join(','),
  '-dissolve2', 'g', 'copy-fields=n,p,k',
  '-clean', 'gap-fill-area=200km2', 'snap-interval=0.0002',
  '-simplify', 'weighted', 'percentage=' + (C.SIMPLIFY || '5%'), 'keep-shapes',
  '-clean',
  '-filter-slivers', 'min-area=' + (C.SLIVER || '3km2'),
  '-each', 'delete g',
  '-split', 'k',
  '-each', 'delete k',
  '-o', path.join(T, 'out.topo.json'), 'format=topojson', 'quantization=' + (C.QUANT || 60000), 'combine-layers'], { stdio: 'inherit' });
const topo = JSON.parse(fs.readFileSync(path.join(T, 'out.topo.json'), 'utf8'));
const o = topo.objects, key = v => Object.keys(o).find(k => k === v || k.endsWith('-' + v)), U = o[key('u')], N = o[key('nb')];
if (!U || !N) { console.error('拆层失败：', Object.keys(o)); process.exit(1); }
topo.objects = { units: U, nb: N };
for (const g of N.geometries) g.properties = { n: g.properties.n };
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'units.topo.json'), JSON.stringify(topo));
const names = U.geometries.map(g => g.properties.n), dup = [...new Set(names.filter((n, i) => names.indexOf(n) !== i))];
console.log('units.topo.json', U.geometries.length, '拼块,', N.geometries.length, '范围外,', Math.round(fs.statSync(path.join(OUT, 'units.topo.json')).size / 1024), 'KB', dup.length ? '重名：' + dup.join('、') : '');
