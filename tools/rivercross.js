// 用法：node tools/rivercross.js [书 …]。检查拼块跨大河归属：拼块中心到所归种子点的连线若穿过大河（geo.json 中 m:1 的河流，
// 境内的长江、金沙江、黄河、淮河、汉江、渭河、湘江、赣江、西江、松花江、黑龙江），就找本岸最近的种子点；
// 两者在本卷任一快照时刻分属不同势力的列出来（地图上看得出的错），附分歧的年份。只列出、不判错：
// 市域本来跨江的（如马鞍山、铜陵）、河道古今不同的（黄河 1128–1855 年南流夺淮）要人工判断，确认无误的写进 OK 名单。
const fs = require('fs'), vm = require('vm'), path = require('path');
const { R, REPO } = require('./root.js');
// 底图包取合集 series.json 的 basemap（默认 china）；大河名单写在底图包的 basemap.json（bigRivers）
const BMN = (() => { try { return JSON.parse(fs.readFileSync(R + '/series.json')).basemap || 'china'; } catch (e) { return 'china'; } })();
const BMJ = JSON.parse(fs.readFileSync(`${REPO}/basemaps/${BMN}/basemap.json`, 'utf8'));
const { land, units } = require('./land.js');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : require('./books.js')();
const BIG = new Set(BMJ.bigRivers || ['长江', '金沙江', '黄河', '淮河', '汉江', '渭河', '湘江', '赣江', '西江', '松花江', '黑龙江']);
// 人工核过、跨河归属合理的：'书/拼块' 或 '*/拼块'（各卷通用）
// 2026-11-20 逐条核过：盐城属广陵、益阳属长沙、新余吉安属豫章、郴州永州属长沙、娄底属长沙、西宁海东属金城（汉郡如此）；
// 江门、阳江、双鸭山、佳木斯、香港的“本岸”是英、法、俄的租借地或属地；黔东南靠近湘江源头，算不上跨河
const OK = new Set(['*/马鞍山市', '*/铜陵市', '*/崇明区', '*/盐城市', '*/益阳市', '*/新余市', '*/吉安市', '*/郴州市', '*/永州市', '*/娄底市',
  '*/西宁市', '*/海东市', '*/江门市', '*/阳江市', '*/双鸭山市', '*/佳木斯市', '*/香港', '*/黔东南苗族侗族自治州',
  // 巴渝一带长江曲折，判为跨江的多是误报：彭水、黔江、酉阳为汉涪陵县属巴郡，城口、开州、达州皆巴地；遵义、萍乡古属难定，不改
  '*/彭水苗族土家族自治县', '*/黔江区', '*/酉阳土家族苗族自治县', '*/城口县', '*/开州区', '*/达州市', '*/遵义市', '*/萍乡市',
  // 战国：景德镇属楚（衡山），沧州南部属齐
  '*/景德镇市', '*/沧州市',
  // 唐末五代柳州属马楚（951 年才归南汉），归零陵（楚）合适
  'tangmo/柳州市', 'liangjin/柳州市', 'yanyun/柳州市']);
const segs = [];
for (const f of JSON.parse(fs.readFileSync(`${REPO}/basemaps/${BMN}/geo.json`)).rv.features) {
  if (!BIG.has(f.properties.n)) continue;
  const lines = f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const l of lines) for (let i = 0; i + 1 < l.length; i++) segs.push([l[i], l[i + 1], f.properties.n]);
}
const cross = (p, q) => {
  const [x0, x1] = [Math.min(p[0], q[0]), Math.max(p[0], q[0])], [y0, y1] = [Math.min(p[1], q[1]), Math.max(p[1], q[1])];
  const o = (a, b, c) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
  for (const [a, b, n] of segs) {
    if (Math.max(a[0], b[0]) < x0 || Math.min(a[0], b[0]) > x1 || Math.max(a[1], b[1]) < y0 || Math.min(a[1], b[1]) > y1) continue;
    if (o(p, q, a) !== o(p, q, b) && o(a, b, p) !== o(a, b, q)) return n;
  }
  return null;
};
const U = units(BMN);
// 各拼块的外环（与 units() 同样的拆分顺序）；大河从拼块中间穿过的（河道顶点落在拼块内）算跨河的市，不查
const POLY = (() => {
  const T = JSON.parse(fs.readFileSync(`${REPO}/basemaps/${BMN}/units.topo.json`, 'utf8')), [sx, sy] = T.transform.scale, [tx, ty] = T.transform.translate;
  const arcs = T.arcs.map(a => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; }); });
  const ring = r => r.flatMap((i, k) => { const a = i < 0 ? arcs[~i].slice().reverse() : arcs[i]; return k ? a.slice(1) : a; });
  return T.objects.units.geometries.flatMap(g => {
    const polys = g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : [];
    return g.properties.w ? [polys.map(p => ring(p[0]))] : polys.map(p => [ring(p[0])]);
  });
})();
const inRing = (pt, r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c; } return c; };
const straddle = new Map();
const riverIn = i => { if (straddle.has(i)) return straddle.get(i);
  let hit = false;
  for (const r of POLY[i]) { const xs = r.map(p => p[0]), ys = r.map(p => p[1]), b = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    for (const [a] of segs) if (a[0] > b[0] && a[0] < b[1] && a[1] > b[2] && a[1] < b[3] && inRing(a, r)) { hit = true; break; }
    if (hit) break; }
  straddle.set(i, hit); return hit; };
let total = 0; const AG = new Map();
for (const id of ids) {
  const c = {}; vm.createContext(c);
  vm.runInContext(fs.readFileSync(`${R}/books/${id}/book.js`, 'utf8') + ';this.X={BOOK,FACTIONS,SEEDS_RAW,SNAPSHOTS,EVENTS,UNIT_OVERRIDES:typeof UNIT_OVERRIDES!=="undefined"?UNIT_OVERRIDES:{}}', c);
  const X = c.X, L = land(X), S = L.seeds, by = new Map(); S.forEach((s, i) => by.set(s.n, i));
  // 各快照时刻的归属（与 stateAt 同一规则，逐条累积）
  const states = []; let cur = S.map(s => (s.z === 'x' ? 'x' : X.BOOK.baseFaction));
  for (const [y, m, list] of X.SNAPSHOTS) {
    for (const [f, tok] of list) for (const k of tok.split(/\s+/).filter(Boolean)) {
      let idx = [];
      if (k === '*') S.forEach((s, i) => s.z !== 'x' && idx.push(i));
      else if (k[0] === '@') S.forEach((s, i) => s.z === k.slice(1) && idx.push(i));
      else if (k[0] === '#') cur.forEach((g, i) => g === k.slice(1) && idx.push(i));
      else if (by.has(k)) idx = [by.get(k)];
      idx.forEach(i => { cur[i] = f; });
    }
    states.push([y, cur.slice()]);
  }
  const out = [];
  for (const a of L.assign) {
    if (OK.has('*/' + a.n) || OK.has(id + '/' + a.n)) continue;
    // UNIT_OVERRIDES 已逐块指定归属的（如列国舆图按今国界归属的各卷），不按“最近种子点”判断
    if (Object.prototype.hasOwnProperty.call(X.UNIT_OVERRIDES, a.n)) continue;
    const u = U[a.i].c, s = S[a.j], rv = cross(u, [s.lon, s.lat]);
    if (!rv || riverIn(a.i)) continue;
    const d = t => { const dx = (t.lon - u[0]) * Math.cos(u[1] * Math.PI / 180), dy = t.lat - u[1]; return dx * dx + dy * dy; };
    const alt = S.map((t, i) => [d(t), i]).filter(([, i]) => i !== a.j && S[i].z !== 'x').sort((p, q) => p[0] - q[0]).slice(0, 25).find(([, i]) => !cross(u, [S[i].lon, S[i].lat]));
    // 本岸的种子点远得多（超过 1.5 倍距离）的不算：多半是跨江的大市或本岸没有对应的郡
    if (!alt || alt[0] > d(s) * 2.25) continue;
    const j2 = alt[1], diff = states.filter(([, st]) => st[a.j] !== st[j2] && st[a.j] !== 'x' && st[j2] !== 'x');
    if (!diff.length) continue;
    const ys = [...new Set(diff.map(([y]) => y))];
    out.push(`  ${a.p}${a.n}：跨${rv}归 ${s.n}，本岸最近 ${S[j2].n}；${ys.length} 个快照分属两方（${ys.slice(0, 4).join('、')}${ys.length > 4 ? '…' : ''}，如 ${diff[0][1][a.j]}/${diff[0][1][j2]}）`);
    const key = `${a.p}${a.n}　跨${rv}归 ${s.n}，本岸 ${S[j2].n}`; AG.set(key, (AG.get(key) || []).concat(`${id}(${ys[0]}${ys.length > 1 ? '…' + ys[ys.length - 1] : ''} ${diff[0][1][a.j]}/${diff[0][1][j2]})`));
  }
  if (out.length && process.env.DETAIL) { console.log(id); out.forEach(l => console.log(l)); } total += out.length;
}
for (const [k, v] of AG) console.log(k + '：' + v.length + ' 卷　' + v.join(' '));
console.log(`共 ${total} 处（${AG.size} 类）`);
if (total) process.exitCode = 1;
