// 用法：node tools/adjcolor.js [书 …] [--th=20]
// 检查地图上相邻色块的颜色是否相近：在构建好的页面（合集各卷 dist/series/<书>/index.html，独立书 dist/<书>/index.html）里
// 按页面实际的拼块归属求出相邻的种子点，逐个时间步列出接壤的势力对，计算两色的 CIELAB ΔE。
// ΔE 低于阈值（默认 20）的标 ✗。需要本机的 Chrome（无头模式）。
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const R = path.join(__dirname, '..');
const args = process.argv.slice(2), th = +((args.find(a => a.startsWith('--th=')) || '--th=20').slice(5));
const ids = args.filter(a => !a.startsWith('--')).length ? args.filter(a => !a.startsWith('--')) : require('./books.js')();
const inSeries = JSON.parse(fs.readFileSync(R + '/series.json')).books.map(b => b.id);
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const probe = `
;(() => {
  const lab = h => { let [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => (c > .04045 ? ((c + .055) / 1.055) ** 2.4 : c / 12.92)); const x = (r * .4124 + g * .3576 + b * .1805) / .95047, y = r * .2126 + g * .7152 + b * .0722, z = (r * .0193 + g * .1192 + b * .9505) / 1.08883; const f = t => (t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116); return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]; };
  const dE = (a, b) => { const p = lab(a), q = lab(b); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };
  const G = UOBJ.geometries, adj = new Set();
  topojson.neighbors(G).forEach((ns, a) => ns.forEach(b => { const x = G[a].properties.j, y = G[b].properties.j; if (x !== y) adj.add(Math.min(x, y) * 10000 + Math.max(x, y)); }));
  const pairs = new Map();
  STATES.forEach((cur, k) => { for (const p of adj) { const a = Math.floor(p / 10000), b = p % 10000, fa = cur[a], fb = cur[b];
    if (fa === fb || !FACTIONS[fa] || !FACTIONS[fb] || FACTIONS[fa].blank || FACTIONS[fb].blank) continue;
    const key = fa < fb ? fa + '|' + fb : fb + '|' + fa, o = pairs.get(key);
    if (!o) pairs.set(key, { y0: STEPS[k].y, y1: STEPS[k].y, at: SEEDS[a].n + '/' + SEEDS[b].n, n: 1 }); else { o.y1 = STEPS[k].y; o.n++; } } });
  const out = [...pairs].map(([k, o]) => { const [a, b] = k.split('|'); return [a, b, FACTIONS[a].color, FACTIONS[b].color, +dE(FACTIONS[a].color, FACTIONS[b].color).toFixed(1), o.y0, o.y1, o.at,
    (() => { try { return FACTIONS[a].name(o.y0) + '｜' + FACTIONS[b].name(o.y0); } catch (e) { return a + '｜' + b; } })()]; });
  document.documentElement.setAttribute('data-adj', JSON.stringify(out));
})();
})();`;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'adj-'));
let bad = 0;
for (const id of ids) {
  // 合集各卷在 dist/series/<书>/（build-series.mjs），独立成书的在 dist/<书>/（node build.mjs <书>）
  const src = path.join(R, inSeries.includes(id) ? 'dist/series' : 'dist', id, 'index.html');
  if (!fs.existsSync(src)) { console.log(`== ${id}：没有找到 ${path.relative(R, src)}，先构建`); continue; }
  let html = fs.readFileSync(src, 'utf8'); const k = html.lastIndexOf('})();');
  html = html.slice(0, k) + probe + html.slice(k + 5);
  fs.mkdirSync(path.join(tmp, id), { recursive: true }); fs.writeFileSync(path.join(tmp, id, 'index.html'), html);
  const dom = execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--virtual-time-budget=20000', '--dump-dom', 'file://' + path.join(tmp, id, 'index.html')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 28 });
  const m = dom.match(/data-adj="([^"]*)"/); if (!m) { console.log(`== ${id}：页面没有返回结果`); continue; }
  const rows = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&')).sort((a, b) => a[4] - b[4]);
  const hit = rows.filter(r => r[4] < th);
  console.log(`== ${id}：接壤势力 ${rows.length} 对，ΔE 最小 ${rows[0] ? rows[0][4] : '-'}`);
  hit.forEach(r => console.log(`  ✗ ΔE ${r[4]}  ${r[0]} ${r[2]} — ${r[1]} ${r[3]}  ${r[8]}  ${r[5] === r[6] ? r[5] : r[5] + '~' + r[6]}  如 ${r[7]}`));
  bad += hit.length;
}
console.log(`共 ${bad} 对相邻势力 ΔE < ${th}`);
