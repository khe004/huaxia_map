// 用法：node tools/enclave.js [书 …]：找出地图上的“内陆孤岛”——
// 某势力的一片连通地块（按现代地级拼块的邻接，经 tools/land.js 的种子归属）四面都被另一个势力包围、不临海也不靠图边，
// 并且这片地块从开局起没被任何快照改动过（多半是忘了分配的 baseFaction 种子点）。
// 每片孤岛只报它第一次出现时的快照，以及它持续到哪一条快照；确属历史上的飞地（如海运接济的据点）可不改。
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = path.join(__dirname, '..');
const argv = process.argv.slice(2), probe = (argv.find(a => a.startsWith('--seed=')) || '').slice(7), bk = argv.filter(a => !a.startsWith('--'));
const ids = bk.length ? bk : require('./books.js')();
const T = JSON.parse(fs.readFileSync(R + '/basemaps/china/units.topo.json', 'utf8'));
// 拼块的各块（与 land.js 的拆法一致：带 w 的整块算一个，其余每块一个）及其用到的弧
const PARTS = T.objects.units.geometries.flatMap(g => {
  const polys = g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : [];
  const arcsOf = ps => ps.flat(2).map(i => (i < 0 ? ~i : i));
  return g.properties.w ? [{ g, arcs: arcsOf(polys) }] : polys.map(p => ({ g, arcs: arcsOf([p]) }));
});
let total = 0;
for (const id of ids) {
  const src = fs.readFileSync(`${R}/books/${id}/book.js`, 'utf8');
  const c = {}; vm.createContext(c);
  vm.runInContext(src + ';this.X={BOOK,FACTIONS,SEEDS_RAW,SNAPSHOTS,EVENTS,UNIT_OVERRIDES:typeof UNIT_OVERRIDES!=="undefined"?UNIT_OVERRIDES:{}}', c);
  const X = c.X;
  const L = require('./land.js').land(X), seeds = L.seeds;
  const by = new Map(); seeds.forEach((s, i) => by.set(s.n, i));
  // 用 land 的 assign（已过滤）按 (n, p) 依次对上各块
  const queue = new Map(); L.assign.forEach(a => { const key = a.n + '|' + a.p; (queue.get(key) || queue.set(key, []).get(key)).push(a.j); });
  const P = []; // { j, arcs }
  for (const { g, arcs } of PARTS) { const q = queue.get(g.properties.n + '|' + g.properties.p); if (q && q.length) P.push({ j: q.shift(), arcs }); }
  // 弧 → 用到它的块；只被一块用到的弧是海岸或图边
  const arcUse = new Map(); P.forEach((p, k) => p.arcs.forEach(a => (arcUse.get(a) || arcUse.set(a, new Set()).get(a)).add(k)));
  const adj = seeds.map(() => new Set()), edge = new Set();
  for (const [, ks] of arcUse) { const js = [...new Set([...ks].map(k => P[k].j))]; if (ks.size === 1) edge.add(js[0]); else for (const a of js) for (const b of js) if (a !== b) adj[a].add(b); }
  // 其他书范围外的邻接（拼块挨着范围外拼块）也算图边：被范围外拼块共用的弧
  { const used = new Map(); PARTS.forEach(({ arcs: ar }) => ar.forEach(a => used.set(a, (used.get(a) || 0) + 1)));
    P.forEach(p => p.arcs.forEach(a => { if ((used.get(a) || 0) > (arcUse.get(a) || new Set()).size) edge.add(p.j); })); }
  let cur = seeds.map(s => (s.z === 'x' ? 'x' : X.BOOK.baseFaction)), touched = new Set();
  const open = new Map(), out = [];
  const report = (key, msg) => { if (!open.has(key)) open.set(key, msg); };
  X.SNAPSHOTS.forEach(([y, m, list]) => {
    for (const [f, tok] of list) for (const k of tok.split(/\s+/).filter(Boolean)) {
      let idx = [];
      if (k === '*') idx = seeds.map((_, i) => i);
      else if (k[0] === '@') seeds.forEach((s, i) => s.z === k.slice(1) && idx.push(i));
      else if (k[0] === '#') cur.forEach((g, i) => g === k.slice(1) && idx.push(i));
      else if (by.has(k)) idx = [by.get(k)];
      idx.forEach(i => { if (cur[i] !== f) touched.add(i); cur[i] = f; });
    }
    if (probe && by.has(probe)) { const i = by.get(probe); console.log(`  [${y}, ${m}] ${probe}=${cur[i]} 地块=${L.hasLand.has(i)} 临边=${edge.has(i)} 动过=${touched.has(i)} 邻：${[...adj[i]].map(b => seeds[b].n + '=' + cur[b]).join(' ')}`); }
    const seen = new Set();
    for (const s0 of L.hasLand) {
      if (seen.has(s0) || touched.has(s0) || cur[s0] === 'x') continue;
      const f = cur[s0], comp = [s0], nb = new Set(); seen.add(s0);
      for (let q = 0; q < comp.length; q++) for (const b of adj[comp[q]]) { if (!L.hasLand.has(b)) continue; if (cur[b] === f) { if (!seen.has(b)) { seen.add(b); comp.push(b); } } else nb.add(cur[b]); }
      if (comp.some(i => edge.has(i) || touched.has(i)) || !nb.size || nb.has('x')) continue;
      const key = comp.slice().sort().join(',');
      report(key, `  [${y}, ${m}] ${f} 被 ${[...nb].join('/')} 包围：${comp.map(i => seeds[i].n).join(' ')}`);
    }
  });
  for (const [, msg] of open) out.push(msg);
  if (out.length) { console.log(`== ${id}`); out.forEach(l => console.log(l)); total += out.length; }
}
console.log(`共 ${total} 处`);
