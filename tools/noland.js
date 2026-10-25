// 用法：node tools/noland.js [书 …]
// 列出在页面里分不到任何地块的种子点（HAS_LAND 之外），这些种子的归属变化在地图上看不出来。需要本机的 Chrome（无头模式）。
// 结果写入 tools/noland.json（改过种子坐标或 scope 后重跑）。
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const R = path.join(__dirname, '..');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : require('./books.js')();
const inSeries = JSON.parse(fs.readFileSync(R + '/series.json')).books.map(b => b.id);
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const probe = `
;(() => { const out = SEEDS.map((s, i) => [s.n, i]).filter(([, i]) => !HAS_LAND.has(i)).map(([n]) => n);
  document.documentElement.setAttribute('data-noland', JSON.stringify(out)); })();
})();`;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'noland-'));
let bad = 0; const cacheF = path.join(__dirname, 'noland.json'), cache = fs.existsSync(cacheF) ? JSON.parse(fs.readFileSync(cacheF, 'utf8')) : {};
for (const id of ids) {
  const src = path.join(R, inSeries.includes(id) ? 'dist/series' : 'dist', id, 'index.html');
  if (!fs.existsSync(src)) { console.log(`== ${id}：没有找到 ${path.relative(R, src)}，先构建`); continue; }
  let html = fs.readFileSync(src, 'utf8'); const k = html.lastIndexOf('})();');
  html = html.slice(0, k) + probe + html.slice(k + 5);
  fs.mkdirSync(path.join(tmp, id), { recursive: true }); fs.writeFileSync(path.join(tmp, id, 'index.html'), html);
  const dom = execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--virtual-time-budget=20000', '--dump-dom', 'file://' + path.join(tmp, id, 'index.html')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 28 });
  const m = dom.match(/data-noland="([^"]*)"/); if (!m) { console.log(`== ${id}：页面没有返回结果`); continue; }
  const rows = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
  cache[id] = rows;
  if (rows.length) { bad += rows.length; console.log(`== ${id}：${rows.join(' ')}`); }
}
// 结果缓存到 tools/noland.json，供 coexist.js、palette.js 剔除没有地块的种子点
fs.writeFileSync(cacheF, JSON.stringify(cache, null, 0) + '\n');
console.log(`共 ${bad} 个种子点没有地块`);
