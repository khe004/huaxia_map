// 检查势力配色：同一时期并存的势力两两色差（CIELAB ΔE），列出最接近的几对。
// 用法：node tools/palette.js <书目录名> [阈值，默认 25] [相邻距离（度）]
//   给出相邻距离时只检查地盘相邻的势力（两势力有种子点相距不超过该值），适合春秋这类小国林立的时期。
const fs = require('fs'), path = require('path'), vm = require('vm');
const [id, th = 25, near] = process.argv.slice(2);
if (!id) { console.log('用法：node tools/palette.js <书目录名> [阈值，默认 25] [相邻距离（度）]'); process.exit(1); }
const NL = new Set((() => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, 'noland.json'), 'utf8'))[id] || []; } catch (e) { return []; } })());
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'books', id, 'book.js'), 'utf8') + ';this.D={BOOK,FACTIONS,SEEDS_RAW,SNAPSHOTS}', ctx);
const { BOOK, FACTIONS, SEEDS_RAW, SNAPSHOTS } = ctx.D;
const S = SEEDS_RAW.split(/\s{2,}|\n+/).map(s => s.trim()).filter(Boolean).map(s => s.split('|'));
let cur = S.map(() => BOOK.baseFaction); const co = new Set();
for (const [, , ops] of SNAPSHOTS) {
  for (const [f, t] of ops) {
    const out = [];
    for (const k of t.split(/\s+/).filter(Boolean)) {
      if (k === '*') S.forEach((s, i) => out.push(i));
      else if (k[0] === '@') S.forEach((s, i) => s[0] === k.slice(1) && out.push(i));
      else if (k[0] === '#') cur.forEach((g, i) => g === k.slice(1) && out.push(i));
      else out.push(S.findIndex(s => s[1] === k));
    }
    out.filter(i => i >= 0).forEach(i => { cur[i] = f; });
  }
  if (!near) { const u = [...new Set(cur.filter((f, i) => !NL.has(S[i][1])))]; for (const a of u) for (const b of u) if (a < b) co.add(a + '|' + b); continue; }
  S.forEach((s, i) => S.forEach((t, j) => {
    const a = cur[i], b = cur[j]; if (a >= b || NL.has(s[1]) || NL.has(t[1])) return;
    const [x1, y1] = s[2].split(',').map(Number), [x2, y2] = t[2].split(',').map(Number);
    if (Math.hypot((x1 - x2) * Math.cos(y1 * Math.PI / 180), y1 - y2) <= +near) co.add(a + '|' + b);
  }));
}
const lab = h => { let [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => (c > .04045 ? ((c + .055) / 1.055) ** 2.4 : c / 12.92)); const x = (r * .4124 + g * .3576 + b * .1805) / .95047, y = r * .2126 + g * .7152 + b * .0722, z = (r * .0193 + g * .1192 + b * .9505) / 1.08883; const f = t => (t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116); return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]; };
const dE = (a, b) => { const p = lab(a), q = lab(b); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };
const rows = [...co].map(p => p.split('|')).filter(([a, b]) => FACTIONS[a] && FACTIONS[b]).map(([a, b]) => [a, b, dE(FACTIONS[a].color, FACTIONS[b].color)]).sort((x, y) => x[2] - y[2]);
rows.slice(0, 8).forEach(([a, b, d]) => console.log(`${d < th ? '✗' : '✓'} ${a} ${FACTIONS[a].color} — ${b} ${FACTIONS[b].color}  ΔE ${d.toFixed(1)}`));
