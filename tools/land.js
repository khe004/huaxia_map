// 与引擎一致的“地块 → 种子点”归属，供 seam.js、snapev.js、legendname.js 使用（不依赖第三方包）：
// 按 BOOK.scope 挑出现代地级拼块，UNIT_OVERRIDES 指定的归指定种子，其余归质心最近的种子点（经度差乘 cos 纬度）。
// 质心按经纬度平面计算，与引擎的球面质心在极个别边界拼块上可能不同；以 noland.js（无头 Chrome 跑引擎）为准。
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
let UNITS = null;
function units() {
  if (UNITS) return UNITS;
  const T = JSON.parse(fs.readFileSync(R + '/basemaps/china/units.topo.json', 'utf8')), [sx, sy] = T.transform.scale, [tx, ty] = T.transform.translate;
  const arcs = T.arcs.map(a => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; }); });
  const ring = r => r.flatMap((i, k) => { const a = i < 0 ? arcs[~i].slice().reverse() : arcs[i]; return k ? a.slice(1) : a; });
  // 每个拼块（多块的拆开，与引擎一致）：名称、省区、质心
  UNITS = T.objects.units.geometries.flatMap(g => {
    const polys = g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : [];
    return polys.map(p => {
      let A = 0, X = 0, Y = 0;
      for (const [k, rr] of p.entries()) { const r = ring(rr), sg = k ? -1 : 1;
        for (let i = 0; i + 1 < r.length; i++) { const c = r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1]; A += sg * c; X += sg * (r[i][0] + r[i + 1][0]) * c; Y += sg * (r[i][1] + r[i + 1][1]) * c; } }
      return { n: g.properties.n, p: g.properties.p, c: A ? [X / (3 * A), Y / (3 * A)] : ring(p[0])[0] };
    });
  });
  return UNITS;
}
// X：书的 { BOOK, SEEDS_RAW, UNIT_OVERRIDES }；返回 { seeds, assign: [{ n, p, j }], hasLand: Set(种子序号) }
function land(X) {
  const seeds = X.SEEDS_RAW.split(/\s{2,}|\n+/).map(s => s.trim()).filter(Boolean).map(s => { const [z, n, c] = s.split('|'); const [lon, lat] = c.split(',').map(Number); return { z, n, lon, lat }; });
  const by = new Map(); seeds.forEach((s, i) => by.set(s.n, i));
  const SC = X.BOOK.scope || {}, O = X.UNIT_OVERRIDES || {};
  const inScope = u => (SC.provinces || []).includes(u.p) || ((SC.partial || {})[u.p] ? SC.partial[u.p].includes(u.n) : (SC.minLat || {})[u.p] != null && u.c[1] >= SC.minLat[u.p]);
  const assign = units().filter(inScope).map(u => {
    let j = O[u.n] != null && by.has(O[u.n]) ? by.get(O[u.n]) : -1;
    if (j < 0) { let bd = Infinity; seeds.forEach((s, i) => { const dx = (s.lon - u.c[0]) * Math.cos(u.c[1] * Math.PI / 180), dy = s.lat - u.c[1], d = dx * dx + dy * dy; if (d < bd) { bd = d; j = i; } }); }
    return { n: u.n, p: u.p, j };
  });
  return { seeds, assign, hasLand: new Set(assign.map(a => a.j)) };
}
module.exports = { land };
