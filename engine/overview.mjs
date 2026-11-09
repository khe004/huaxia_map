// 目录页“总览”：历代疆域总览（可拖动）与历代纪年的朝代并立条带，由 build-series.mjs 调用。
// 疆域：取各卷卷末一刻，加上谭其骧《中国历史地图集》各册总图的年份（落在哪卷就按哪卷的快照），
// 用与引擎相同的“现代地级拼块 → 种子点 → 势力”归属（tools/land.js）给 basemaps/china/overview.json 的简化拼块上色。
import { createRequire } from 'node:module';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const { land, stateAt } = require('../tools/land.js');

// 谭图各册总图的年份
const REP = [[-210, '秦'], [2, '西汉'], [140, '东汉'], [262, '三国'], [281, '西晋'], [382, '东晋十六国'], [497, '南北朝'], [546, '南北朝'], [572, '南北朝'],
  [612, '隋'], [669, '唐'], [741, '唐'], [820, '唐'], [943, '五代十国'], [1111, '北宋'], [1142, '南宋'], [1330, '元'], [1433, '明'], [1582, '明'], [1820, '清']];
const fy = y => (y < 0 ? `前${-y}` : `${y}`);

export function overview(S, r) {
  const G = JSON.parse(r('./basemaps/china/overview.json'));
  const vols = S.books.map(b => {
    const c = {}; vm.createContext(c);
    vm.runInContext(r(`./books/${b.id}/book.js`) + ';this.X={BOOK,FACTIONS,SEEDS_RAW,SNAPSHOTS,EVENTS,UNIT_OVERRIDES:typeof UNIT_OVERRIDES!=="undefined"?UNIT_OVERRIDES:{}}', c);
    const X = c.X, ts = X.EVENTS.map(e => e.y + (e.mo - 1) / 12);
    return { id: b.id, X, L: land(X), t0: Math.min(...ts), t1: Math.max(...ts) };
  });
  // 一帧：某卷某时刻各拼块的势力（帧内调色板序号，'.' 为不着色），以及标签位置
  const frame = (k, t, y, rep) => {
    const V = vols[k], cur = stateAt(V.X, t), pal = [], pi = new Map(), a = new Array(G.units.length).fill('.');
    const acc = [];
    for (const u of V.L.assign) {
      const f = cur[u.j], F = V.X.FACTIONS[f];
      if (!F || F.blank) continue;
      if (!pi.has(f)) { pi.set(f, pal.length); pal.push(f); acc.push({ A: 0, X: 0, Y: 0, us: [] }); }
      const q = pi.get(f), [cx, cy, ar] = G.c[u.i];
      a[u.i] = String.fromCharCode(48 + q);
      acc[q].A += ar; acc[q].X += cx * ar; acc[q].Y += cy * ar; acc[q].us.push(u.i);
    }
    const nm = (F, f) => { const v = F.name ? F.name(t) : f; return String(v); };
    const mn = (F, f) => { const v = F.mapName ? F.mapName(t) : nm(F, f); return String(v).replace(/（[^）]*）/g, ''); };
    const fs = pal.map((f, q) => {
      const F = V.X.FACTIONS[f], o = acc[q];
      // 标签放在离面积加权中心最近的那块拼块的质心上（飞地多的势力不至于落在别家地盘里）
      let lx = null, ly = null;
      if (o.A > 900) { const mx = o.X / o.A, my = o.Y / o.A; let bd = Infinity; for (const i of o.us) { const [x, yy] = G.c[i], d = (x - mx) ** 2 + (yy - my) ** 2; if (d < bd) { bd = d; lx = x; ly = yy; } } }
      return [F.color, mn(F, f), nm(F, f), lx, ly, Math.round(o.A)];
    });
    return { t, y, k, rep: rep || null, f: fs, a: a.join('') };
  };
  const frames = [];
  // 各卷卷末
  vols.forEach((V, k) => frames.push(frame(k, V.t1, Math.floor(V.t1), null)));
  // 谭图总图年份：落在哪卷就取哪卷（几卷都含时取离两端最远的一卷），取该年年中
  for (const [y, n] of REP) {
    let best = -1, bd = -1;
    vols.forEach((V, k) => { const a = V.X.BOOK.range[0], b = V.X.BOOK.range[1]; if (y >= a && y <= b) { const d = Math.min(y - a, b - y); if (d > bd) { bd = d; best = k; } } });
    if (best >= 0) frames.push(frame(best, y + 0.5, y, n));
  }
  frames.sort((p, q) => p.t - q.t || (p.rep ? 1 : -1));
  // 同一年的卷末帧与总图帧并存时只留总图帧
  const out = frames.filter((f, i) => !(!f.rep && frames.some(g => g !== f && g.rep && g.y === f.y)));
  return { w: G.w, h: G.h, units: G.units, nb: G.nb, frames: out, books: vols.map(V => [V.id, V.X.BOOK.brand, V.X.BOOK.range]) };
}

// 朝代条带：books/_dynasties.js，按类别分组、组内首次适配分行
export function dynasties(r) {
  const c = {}; vm.createContext(c); vm.runInContext(r('./books/_dynasties.js') + ';this.D=DYNASTIES', c);
  const order = ['p', 'z', 'n', 'b', 'x'], rows = [];
  for (const g of order) {
    const lanes = [];
    for (const [n, a, b, k] of c.D.filter(d => d[3] === g).sort((p, q) => p[1] - q[1])) {
      let li = lanes.findIndex(e => e < a); if (li < 0) { li = lanes.length; lanes.push(-Infinity); }
      lanes[li] = b; rows.push([n, a, b, g, rows.filter(x => x[3] !== g).length ? 0 : 0, li]);
    }
    rows.forEach(x => { if (x[3] === g) x[4] = lanes.length; });
  }
  // 行号：各组依次排下去
  let base = 0; const out = [];
  for (const g of order) { const rs = rows.filter(x => x[3] === g); const nl = rs.length ? Math.max(...rs.map(x => x[5])) + 1 : 0; rs.forEach(x => out.push([x[0], x[1], x[2], g, base + x[5]])); base += nl; }
  return { rows: out, lanes: base };
}
export { fy };
