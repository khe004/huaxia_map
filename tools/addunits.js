// 在现有底图上增补拼块：从周边陆地（nb）里按另一份底图的拼块轮廓切出新拼块，原有拼块原样保留（序号不变，新拼块排在后面）。
// 新拼块 = 来源拼块 ∩ 指定的周边陆地；周边陆地扣掉切出的部分。同名的来源拼块合成一块（如阿斯塔纳并入阿克莫拉）。
// 用法：node tools/addunits.js <底图名> <配置.json> <工作目录>，输出 <工作目录>/out.json（量化参数与原底图相同）；
// 之后跑 tools/topo-retopo.js（按量化网格重建共用弧段），再用 tools/land.js 逐卷核对原有拼块的归属没有变。
// 配置：{ "src": "eurasia", "add": [{ "nb": "Kazakhstan", "p": "哈萨克斯坦", "c": "KAZ", "units": { "新名": ["来源名", …] }, "absorb": { "周边陆地名": "新名" }, "boxes": { "新名": [经纬度框] }, "outside": [周边陆地的裁切框] }, …] }
// 依赖：mapshaper、topojson-client（见 tools/package.json）
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process'), tc = require('topojson-client'), d3 = require('d3-geo');
const [BM, CONF, D] = process.argv.slice(2);
if (!BM || !CONF || !D) { console.error('用法：node tools/addunits.js <底图名> <配置.json> <工作目录>'); process.exit(2); }
const root = path.join(__dirname, '..', 'basemaps');
const T = JSON.parse(fs.readFileSync(path.join(root, BM, 'units.topo.json')));
const cf = JSON.parse(fs.readFileSync(CONF));
const S = JSON.parse(fs.readFileSync(path.join(root, cf.src, 'units.topo.json')));
const P = f => path.join(D, f), w = (f, o) => fs.writeFileSync(P(f), JSON.stringify(o));
fs.mkdirSync(D, { recursive: true });
const ms = require.resolve('mapshaper/bin/mapshaper');
const run = a => execFileSync(process.execPath, [ms, ...a], { stdio: ['ignore', 'ignore', 'inherit'] });
const U = tc.feature(T, T.objects.units), N = tc.feature(T, T.objects.nb), SU = tc.feature(S, S.objects.units).features;
w('u.json', U);
let nb = N, added = [];
cf.add.forEach((A, k) => {
  const src = [];
  for (const [n, from] of Object.entries(A.units)) for (const f of from) {
    const g = SU.find(x => x.properties.n === f); if (!g) throw new Error('来源底图没有拼块 ' + f);
    let geom = g.geometry;
    // boxes：某个新拼块只取来源在经纬度框里的部分（如哈巴罗夫斯克边疆区只取北纬 55 度以北的鄂霍次克海沿岸）
    if (A.boxes && A.boxes[n]) {
      w('bx.json', { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: geom }] });
      run(['-i', P('bx.json'), '-clip', 'bbox=' + A.boxes[n].join(','), '-o', P('bx.json'), 'force']);
      { const j = JSON.parse(fs.readFileSync(P('bx.json'))); geom = j.features ? j.features[0].geometry : j.geometries ? j.geometries[0] : j; }
    }
    src.push({ type: 'Feature', properties: { n }, geometry: geom });
  }
  w(`s${k}.json`, { type: 'FeatureCollection', features: src });
  w(`c${k}.json`, { type: 'FeatureCollection', features: nb.features.filter(f => f.properties.n === A.nb) });
  try { run(['-i', P(`s${k}.json`), '-dissolve', 'n', '-clip', P(`c${k}.json`), '-filter-slivers', 'min-area=20km2', '-o', P(`a${k}.json`)]); }
  catch (e) { w(`a${k}.json`, { type: 'FeatureCollection', features: [] }); } // 与周边陆地不重叠（全在框外）
  // 来源与本底图的边界不完全重合，切剩的细条（小于 5000 平方公里、离新拼块不到 0.05 度）并入最近的新拼块
  run(['-i', P(`a${k}.json`), '-dissolve', '-o', P(`d${k}.json`)]);
  run(['-i', P(`c${k}.json`), '-erase', P(`d${k}.json`), '-explode', '-o', P(`l${k}.json`)]);
  const a = JSON.parse(fs.readFileSync(P(`a${k}.json`))), left = JSON.parse(fs.readFileSync(P(`l${k}.json`))).features;
  const pts = g => (g.type === 'Polygon' ? g.coordinates.flat() : g.coordinates.flat(2));
  const AV = a.features.map(f => pts(f.geometry));
  let nIn = 0;
  for (const f of left) {
    if (!f.geometry) continue;
    let ar = d3.geoArea(f); if (ar > 2 * Math.PI) ar = 4 * Math.PI - ar; if (ar * 6371 * 6371 > 5000) continue;
    const P0 = pts(f.geometry); let best = -1, bd = Infinity;
    AV.forEach((V, j) => { for (const p of P0) for (const q of V) { const d = Math.hypot((p[0] - q[0]) * Math.cos(p[1] * Math.PI / 180), p[1] - q[1]); if (d < bd) { bd = d; best = j; } } });
    if (bd < 0.05) { a.features.push({ type: 'Feature', properties: { n: a.features[best].properties.n }, geometry: f.geometry }); nIn++; }
  }
  // outside：底图周边陆地只裁到这个框（如欧洲底图到东经 110 度），来源拼块在框外的部分不经裁切直接加进来
  if (A.outside) {
    run(['-i', P(`s${k}.json`), '-erase', 'bbox=' + A.outside.join(','), '-o', P(`o${k}.json`)]);
    const o = JSON.parse(fs.readFileSync(P(`o${k}.json`))).features.filter(f => f.geometry);
    o.forEach(f => a.features.push({ type: 'Feature', properties: { n: f.properties.n }, geometry: f.geometry }));
    console.log(A.nb, '框外部分', o.length);
  }
  // absorb：整块并入某个新拼块的周边陆地（如拜科努尔租借区并入克孜勒奥尔达）
  for (const [m, n] of Object.entries(A.absorb || {})) { nb.features.filter(f => f.properties.n === m).forEach(f => a.features.push({ type: 'Feature', properties: { n }, geometry: f.geometry })); nb = { ...nb, features: nb.features.filter(f => f.properties.n !== m) }; }
  w(`a${k}.json`, a);
  run(['-i', P(`a${k}.json`), 'snap', '-dissolve', 'n', '-o', P(`a${k}.json`), 'force']);
  console.log(A.nb, '并入细条', nIn);
  run(['-i', P(`a${k}.json`), '-dissolve', '-o', P(`d${k}.json`), 'force']);
  w(`nb${k}.json`, nb);
  run(['-i', P(`nb${k}.json`), '-erase', P(`d${k}.json`), '-o', P(`nbo${k}.json`)]);
  nb = JSON.parse(fs.readFileSync(P(`nbo${k}.json`)));
  added.push(...JSON.parse(fs.readFileSync(P(`a${k}.json`))).features.map(f => ({ ...f, properties: { n: f.properties.n, p: A.p, c: A.c } })));
});
const u = JSON.parse(fs.readFileSync(P('u.json'))); u.features.push(...added); w('u2.json', u); w('nb2.json', nb);
run(['-i', P('u2.json'), P('nb2.json'), 'combine-files', 'snap', '-rename-layers', 'units,nb', '-o', 'format=topojson', 'no-quantization', P('raw.json')]);
const O = JSON.parse(fs.readFileSync(P('raw.json')));
const [sx, sy] = T.transform.scale, [tx, ty] = T.transform.translate;
O.transform = T.transform;
O.arcs = O.arcs.map(a => { let px = 0, py = 0; const r = []; for (const [x, y] of a) { const qx = Math.round((x - tx) / sx), qy = Math.round((y - ty) / sy); if (r.length && qx === px && qy === py) continue; r.push([qx - px, qy - py]); px = qx; py = qy; } if (r.length < 2) r.push([0, 0]); return r; });
delete O.bbox;
// 原有拼块的属性原样带回（mapshaper 会丢掉空属性、改动类型）
O.objects.units.geometries.forEach((g, i) => { if (i < T.objects.units.geometries.length) g.properties = T.objects.units.geometries[i].properties; });
console.log('拼块', T.objects.units.geometries.length, '→', O.objects.units.geometries.length, '新增', added.map(f => f.properties.n).join(' '));
fs.writeFileSync(P('out.json'), JSON.stringify(O));
