// 地球页（engine/globe.html）的数据：把 globe.json 列出的各套合集（目前华夏舆图、西方舆图，可再加其他地区）的各卷合到同一个地球上。由 build-globe.mjs 调用。
// 每卷记：现代拼块 → 种子点的归属（与 tools/land.js、引擎同一规则）、已解析成种子序号的疆域快照、势力名称与颜色随时刻的取值、
// 城邑、卷的年代与地域中心、底图外周边陆地的着色（BOOK.outer）；另附两套底图的拼块拓扑（原样）、河湖、全球陆地轮廓与全部事件的点位。
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const { land, units } = require('../tools/land.js');

const REPO = new URL('../', import.meta.url);
const rf = f => readFileSync(new URL(f, REPO), 'utf8');
const val = (v, t) => (typeof v === 'function' ? v(t) : v);
const r3 = x => Math.round(x * 1000) / 1000;
const r2 = x => Math.round(x * 100) / 100;

// 引擎的时刻：年 + (月 − 1) / 12；第一条快照是开局形势，不论几月都从卷首生效（记为 -1e9）
function snapshots(X, seeds) {
  const by = new Map(); seeds.forEach((s, i) => by.set(s.n, i));
  let cur = seeds.map(s => (s.z === 'x' ? 'x' : X.BOOK.baseFaction));
  const out = [];
  for (const [j, [y, m, list]] of X.SNAPSHOTS.entries()) {
    const prev = cur.slice();
    for (const [f, tok] of list) for (const k of tok.split(/\s+/).filter(Boolean)) {
      let idx = [];
      if (k === '*') seeds.forEach((s, i) => s.z !== 'x' && idx.push(i));
      else if (k[0] === '@') seeds.forEach((s, i) => s.z === k.slice(1) && idx.push(i));
      else if (k[0] === '#') cur.forEach((g, i) => g === k.slice(1) && idx.push(i));
      else if (by.has(k)) idx = [by.get(k)];
      idx.forEach(i => { cur[i] = f; });
    }
    const set = {};
    cur.forEach((f, i) => { if (j === 0 || f !== prev[i]) (set[f] = set[f] || []).push(i); });
    if (j === 0 || Object.keys(set).length) out.push([j === 0 ? -1e9 : r3(y + (m - 1) / 12), set]);
  }
  return { snaps: out, end: cur };
}

// SERIES：[{ name, dir（合集根目录，相对仓库）, books（series.json 的 books） }]。各卷用到的底图包按出现顺序编号（卷的 bm）
export function globeData(SERIES) {
  const vols = [], events = [], BMS = [], TC = {};
  const TOPO = b => (TC[b] = TC[b] || JSON.parse(rf(`basemaps/${b}/units.topo.json`)));
  SERIES.forEach((S, si) => S.books.forEach((b, bi) => {
    const c = {}; vm.createContext(c);
    vm.runInContext(rf(`${S.dir}books/${b.id}/book.js`) +
      ';this.X={BOOK,FACTIONS,SEEDS_RAW,SNAPSHOTS,EVENTS,CITIES:typeof CITIES!=="undefined"?CITIES:[],UNIT_OVERRIDES:typeof UNIT_OVERRIDES!=="undefined"?UNIT_OVERRIDES:{}}', c);
    const X = c.X, B = X.BOOK, bm = B.basemap || 'china', L = land(X), U = units(bm);
    if (!BMS.includes(bm)) BMS.push(bm);
    const ts = X.EVENTS.map(e => e.y + (e.mo - 1) / 12), t0 = Math.min(...ts), t1 = Math.max(...ts);
    const assign = new Array(U.length).fill(-1); L.assign.forEach(a => { assign[a.i] = a.j; });
    const { snaps, end } = snapshots(X, L.seeds);
    // 势力：在卷首、各快照与卷末取值，相同的不重复记。[地图名, 颜色, blank, 全名(卷末)]
    const tt = [B.range[0], ...X.SNAPSHOTS.map(([y, m]) => y + (m - 1) / 12), t1].sort((p, q) => p - q);
    const fac = {};
    for (const [k, F] of Object.entries(X.FACTIONS)) {
      const nm = [], co = [], fu = [];
      for (const t of tt) {
        let n = String((F.mapName ? val(F.mapName, t) : val(F.name, t)) ?? k).replace(/（[^）]*）/g, '');
        if (F.hideLabel && val(F.hideLabel, t)) n = '';
        if (!nm.length || nm[nm.length - 1][1] !== n) nm.push([r3(t), n]);
        const cc = val(F.color, t); if (!co.length || co[co.length - 1][1] !== cc) co.push([r3(t), cc]);
        const f = String(val(F.name, t) ?? k); if (!fu.length || fu[fu.length - 1][1] !== f) fu.push([r3(t), f]);
      }
      fac[k] = [nm, co, F.blank ? 1 : 0, fu];
    }
    // 卷的地域中心：卷末着色拼块质心的单位向量平均
    let vx = 0, vy = 0, vz = 0;
    L.assign.forEach(a => { const F = X.FACTIONS[end[a.j]]; if (!F || F.blank) return; const [lo, la] = U[a.i].c.map(d => d * Math.PI / 180);
      vx += Math.cos(la) * Math.cos(lo); vy += Math.cos(la) * Math.sin(lo); vz += Math.sin(la); });
    const ctr = [Math.atan2(vy, vx) * 180 / Math.PI, Math.atan2(vz, Math.hypot(vx, vy)) * 180 / Math.PI].map(d => Math.round(d * 10) / 10);
    // 城邑：[名随年, 经, 纬, 都城（1 或 [[阈值, 0|1], …]）, 今地]
    const cities = X.CITIES.map(C => [C.n, r2(C.ll[0]), r2(C.ll[1]), C.cap || 0, C.m || '']);
    // 底图范围以外的周边陆地（拓扑 nb）按 BOOK.outer 上色：[[nb 序号, [[时刻, 势力], …]], …]（与引擎的 outerOf 同一规则）
    const NBN = TOPO(bm).objects.nb ? TOPO(bm).objects.nb.geometries.map(g => g.properties && g.properties.n) : [];
    const outer = [];
    for (const [n, v] of Object.entries(B.outer || {})) {
      const seq = typeof v === 'string' ? [[-1e9, v]] : v.map(([t, f]) => [r3(t), f]);
      NBN.forEach((m, k) => { if (m === n) outer.push([k, seq]); });
    }
    const vi = vols.length;
    vols.push({ s: si, n: bi + 1, id: b.id, brand: B.brand, era: b.era, years: b.years, t0: r3(t0), t1: r3(t1), c: ctr, bm: BMS.indexOf(bm), fac, assign, snaps, cities, outer });
    for (const e of X.EVENTS) events.push([vi, e.y, Math.floor(e.mo), e.t, r2(e.ll[0]), r2(e.ll[1]), e.k]);
  }));
  const topo = BMS.map(TOPO);
  // 河湖：坐标保留两位小数；大河（china 的 m、底图配置的 bigRivers）画粗一些
  const water = BMS.map(b => {
    const G = JSON.parse(rf(`basemaps/${b}/geo.json`)), big = new Set(JSON.parse(rf(`basemaps/${b}/basemap.json`)).bigRivers || []);
    const rnd = c => (typeof c[0] === 'number' ? [r2(c[0]), r2(c[1])] : c.map(rnd));
    return { rv: G.rv.features.filter(f => f.geometry).map(f => [f.properties.m || big.has(f.properties.n) ? 1 : 0, f.geometry.type, rnd(f.geometry.coordinates)]),
      lk: G.lk.features.filter(f => f.geometry).map(f => [f.geometry.type, rnd(f.geometry.coordinates)]) };
  });
  const world = JSON.parse(rf('basemaps/globe/land-110m.json'));
  const terrain = JSON.parse(rf('basemaps/globe/globe.json')).terrain;
  return { series: SERIES.map(S => ({ name: S.name })), vols, events, topo, water, world, terrain };
}
