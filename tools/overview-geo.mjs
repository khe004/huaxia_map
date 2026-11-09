// 目录页“疆域总览”用的简化底图：把 basemaps/china/units.topo.json 的地级拼块按底图投影（与引擎相同）投到平面，
// 逐条公共边（arc）做 Douglas–Peucker 简化（相邻拼块共用同一条边，简化后仍严丝合缝），输出 SVG 路径到 basemaps/china/overview.json（入库）。
// 拼块的顺序、多块拆分与 tools/land.js 的 units() 完全一致（合集构建时按序号对应各卷的归属）。
// 用法：node tools/overview-geo.mjs（在 tools/ 下 npm i 之后；底图改了重跑）
import { readFileSync, writeFileSync } from 'fs';
import * as d3 from 'd3-geo';

const R = new URL('../basemaps/china/', import.meta.url);
const T = JSON.parse(readFileSync(new URL('units.topo.json', R), 'utf8'));
const BM = JSON.parse(readFileSync(new URL('basemap.json', R), 'utf8'));
const PJ = BM.projection, [W, H] = BM.size;
const proj = ({ conicEqualArea: d3.geoConicEqualArea, conicConformal: d3.geoConicConformal, mercator: d3.geoMercator, equirectangular: d3.geoEquirectangular })[PJ.type]().rotate(PJ.rotate || [0, 0]);
if (PJ.parallels) proj.parallels(PJ.parallels);
proj.fitExtent(PJ.fitPadding, { type: 'MultiPoint', coordinates: PJ.fitPoints });

const TOL = 0.9;  // 简化容差（像素，地图宽 1000）
const [sx, sy] = T.transform.scale, [tx, ty] = T.transform.translate;
const dp = (pts, tol) => {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  // 首尾重合的闭合边（海岛、飞地）先在离起点最远处断开，否则基线退化成一点，整条边被删光
  const n = pts.length - 1, [x0, y0] = pts[0], closed = Math.hypot(pts[n][0] - x0, pts[n][1] - y0) < 1e-9;
  let st = [[0, n]];
  if (closed) { let m = 1, md = -1; for (let i = 1; i < n; i++) { const d = Math.hypot(pts[i][0] - x0, pts[i][1] - y0); if (d > md) { md = d; m = i; } } keep[m] = 1; st = [[0, m], [m, n]]; }
  while (st.length) {
    const [a, b] = st.pop(); let md = 0, mi = -1;
    const [x1, y1] = pts[a], [x2, y2] = pts[b], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1e-9;
    for (let i = a + 1; i < b; i++) { const d = Math.abs(dy * (pts[i][0] - x1) - dx * (pts[i][1] - y1)) / L; if (d > md) { md = d; mi = i; } }
    if (md > tol) { keep[mi] = 1; st.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
};
const raw = T.arcs.map(a => { let x = 0, y = 0; return a.map(([ddx, ddy]) => { x += ddx; y += ddy; return proj([x * sx + tx, y * sy + ty]); }); });
const arcs = raw.map(a => dp(a, TOL));
const r1 = v => Math.round(v * 10) / 10;
const ringPts = (r, A) => r.flatMap((i, k) => { const a = i < 0 ? A[~i].slice().reverse() : A[i]; return k ? a.slice(1) : a; });
const ringD = r => { const pts = ringPts(r, arcs);
  return pts.length < 4 ? '' : 'M' + pts.map(p => r1(p[0]) + ',' + r1(p[1])).join('L') + 'Z'; };
const polyD = p => p.map(ringD).join('');
// 质心（投影平面，外环减内环），供总览的势力标签取位置
const cent = ps => { let A = 0, X = 0, Y = 0;
  for (const p of ps) for (const [k, rr] of p.entries()) { const pts = rr.flatMap((i, j) => { const a = i < 0 ? arcs[~i].slice().reverse() : arcs[i]; return j ? a.slice(1) : a; }), sg = k ? -1 : 1;
    for (let i = 0; i + 1 < pts.length; i++) { const c = pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1]; A += sg * c; X += sg * (pts[i][0] + pts[i + 1][0]) * c; Y += sg * (pts[i][1] + pts[i + 1][1]) * c; } }
  return A ? [r1(X / (3 * A)), r1(Y / (3 * A)), Math.round(Math.abs(A) / 2)] : [0, 0, 0]; };
// 与 tools/land.js 的 units() 同序：MultiPolygon 拆块（属性 w 的整块），无几何的跳过
const units = T.objects.units.geometries.flatMap(g => {
  const polys = g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : [];
  return g.properties.w ? [{ d: polys.map(polyD).join(''), c: cent(polys) }] : polys.map(p => ({ d: polyD(p), c: cent([p]) }));
});
const nb = (T.objects.nb ? T.objects.nb.geometries : []).flatMap(g => g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : []).map(polyD).join('');
writeFileSync(new URL('overview.json', R), JSON.stringify({ w: W, h: H, units: units.map(u => u.d), c: units.map(u => u.c), nb }));
console.log('overview.json', units.length, '拼块', Math.round(JSON.stringify({ units, nb }).length / 1024), 'KB');
