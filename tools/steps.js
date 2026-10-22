// 各检查工具共用：按引擎（engine/app.js）的同一规则生成时间轴的年份与步。
// load(id) 读入一卷，返回 { X: 书的各项数据, YEARS, steps, tOf }；steps[k] = { y, t, e }，e 为事件（年初一步为 null）。
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = path.join(__dirname, '..');
const tOf = (y, m) => y + (m - 1) / 12;
function load(id) {
  const c = {}; vm.createContext(c);
  vm.runInContext(fs.readFileSync(`${R}/books/${id}/book.js`, 'utf8') +
    ';this.X={BOOK,FACTIONS,SEEDS_RAW,SNAPSHOTS,EVENTS,PHASES,PEOPLE_RAW,CITIES:typeof CITIES==="undefined"?[]:CITIES}', c);
  const X = c.X, { BOOK: B, FACTIONS: F, SNAPSHOTS, EVENTS, PHASES, CITIES } = X, [Y0, Y1] = B.range;
  let YEARS = [];
  if (B.yearStride) {
    const keep = new Set([Y0, Y1, ...EVENTS.map(e => e.y), ...SNAPSHOTS.map(s => s[0]), ...PHASES.flatMap(p => [p[0], p[1]]),
      ...CITIES.flatMap(c => c.n.map(([yy]) => Math.floor(yy)))]);
    const lab = (f, t) => { const F0 = F[f]; return [F0.name(t), F0.mapName ? F0.mapName(t) : '', typeof F0.realm === 'function' ? F0.realm(t) : F0.realm].join('|'); };
    for (const f of Object.keys(F)) { let a = lab(f, Y0);
      for (let k = 1; k <= (Y1 - Y0 + 1) * 12; k++) { const t = Y0 + k / 12, b = lab(f, t); if (b !== a) keep.add(Math.floor(t + 1e-9)); a = b; } }
    B.yearStride.forEach(([a, k], j) => { const b = (B.yearStride[j + 1] || [Y1 + 1])[0]; for (let y = a; y < b; y += k) keep.add(y); });
    YEARS = [...keep].filter(y => y >= Y0 && y <= Y1 && y !== 0).sort((a, b) => a - b);
  } else for (let y = Y0; y <= Y1; y++) if (y !== 0) YEARS.push(y);
  const steps = [];
  EVENTS.forEach((e, i) => { e.i = i; });
  for (const y of YEARS) { steps.push({ y, t: tOf(y, 1) - (EVENTS.some(e => e.y === y && e.mo <= 1) ? 1e-6 : 0), e: null });
    EVENTS.filter(e => e.y === y).sort((a, b) => a.mo - b.mo || a.i - b.i).forEach(e => steps.push({ y, t: tOf(y, e.mo), e })); }
  return { X, YEARS, steps, tOf };
}
module.exports = { load, tOf };
