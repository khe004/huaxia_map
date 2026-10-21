// 用法：node tools/coexist.js [书 …] [--th=10]：同一时期并存（同时出现在图例中）的势力两两色差（CIELAB ΔE），
// 低于阈值（默认 10，几乎分不出）的列出。接壤势力另由 tools/adjcolor.js 按 ΔE 20 检查。
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = path.join(__dirname, '..');
const args = process.argv.slice(2), th = +((args.find(a => a.startsWith('--th=')) || '--th=10').slice(5));
const ids = args.filter(a => !a.startsWith('--')).length ? args.filter(a => !a.startsWith('--')) : require('./books.js')();
const lab = h => { let [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => (c > .04045 ? ((c + .055) / 1.055) ** 2.4 : c / 12.92));
  const x = (r * .4124 + g * .3576 + b * .1805) / .95047, y = r * .2126 + g * .7152 + b * .0722, z = (r * .0193 + g * .1192 + b * .9505) / 1.08883;
  const f = t => (t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116); return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]; };
const dE = (a, b) => { const p = lab(a), q = lab(b); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };
let n = 0;
for (const id of ids) {
  const c = {}; vm.createContext(c);
  vm.runInContext(fs.readFileSync(`${R}/books/${id}/book.js`, 'utf8') + ';this.D={BOOK,FACTIONS,SEEDS_RAW,SNAPSHOTS}', c);
  const { BOOK, FACTIONS, SEEDS_RAW, SNAPSHOTS } = c.D;
  const S = SEEDS_RAW.split(/\s{2,}|\n+/).map(s => s.trim()).filter(Boolean).map(s => s.split('|'));
  let cur = S.map(() => BOOK.baseFaction); const seen = new Map();
  for (const [y, , ops] of SNAPSHOTS) {
    for (const [f, t] of ops) { const out = [];
      for (const k of t.split(/\s+/)) { if (k === '*') S.forEach((s, i) => out.push(i)); else if (k[0] === '@') S.forEach((s, i) => s[0] === k.slice(1) && out.push(i));
        else if (k[0] === '#') cur.forEach((g, i) => g === k.slice(1) && out.push(i)); else out.push(S.findIndex(s => s[1] === k)); }
      out.forEach(i => { cur[i] = f; }); }
    const u = [...new Set(cur)].filter(f => FACTIONS[f]);
    for (const a of u) for (const b of u) if (a < b && !seen.has(a + '|' + b)) { const d = dE(FACTIONS[a].color, FACTIONS[b].color); if (d < th) seen.set(a + '|' + b, [d, y]); }
  }
  for (const [k, [d, y]] of seen) { const [a, b] = k.split('|'); console.log(`${id}: ${a} ${FACTIONS[a].color} — ${b} ${FACTIONS[b].color}  ΔE ${d.toFixed(1)}（${y} 年起并存）`); n++; }
}
console.log(`共 ${n} 对并存势力 ΔE < ${th}`);
