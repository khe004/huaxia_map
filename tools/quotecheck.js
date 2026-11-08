// 用 tools/fetch-corpus.js 抓下的维基文库原文逐卷核对引文（**…**、**出处|…**），结果写入 tools/quotes-log.json（入库，留作核对记录）。
// 用法：node tools/quotecheck.js [书 …]   不带参数时核对全部各卷与 books/_people.js
// 每条引文先在本卷篇目对应的原文里找，找不到再到全部已抓原文里找（记为“见于他卷原文”，仍算找到）；都找不到的列出，
// 本卷篇目表里没能对上维基文库页面的篇目也一并记下（这些出处的引文无从核对，多半就在未找到之列）。
const fs = require('fs'), path = require('path');
const { strip, fixText, quotesIn } = require('./quotes.js');
const books = require('./books.js');
const R = path.join(__dirname, '..'), C = path.join(__dirname, '.corpus'), LOG = path.join(__dirname, 'quotes-log.json');
const MAP = JSON.parse(fs.readFileSync(path.join(C, 'map.json'), 'utf8'));
const fname = t => t.replace(/[\/:*?"<>|]/g, '_');
const cache = {};
// 缓存里缺的页面（抓取中断、手工删掉待重抓的）按空文本处理
const text = t => cache[t] ??= (f => (fs.existsSync(f) ? fixText(strip(fs.readFileSync(f, 'utf8'))) : ''))(path.join(C, 'cn', fname(t) + '.txt'));
const ALL = [...new Set(Object.values(MAP).flatMap(m => m.pages))];
const log = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, 'utf8')) : {};
const ids = process.argv.slice(2).length ? process.argv.slice(2) : [...books(), '_people'];
const today = new Date().toISOString().slice(0, 10);
let T = [0, 0, 0];
for (const id of ids) {
  const src = fs.readFileSync(path.join(R, 'books', ...(id[0] === '_' ? [id + '.js'] : [id, 'book.js'])), 'utf8');
  const m = MAP[id];
  if (!m && id[0] !== '_') { console.log(id, '没有抓取记录，先跑 node tools/fetch-corpus.js', id); continue; }
  const own = m ? m.pages : [];
  let found = 0, other = 0, split = 0; const missing = [];
  // 整句找不到时按分句找：各分句（四字以上）都出现在同一篇原文里也算找到（原文句间夹着校注、异文的诗文），单独计数
  const parts = q0 => q0.split(/[，。；？！、：]/).map(strip).filter(p => p.length >= 4);
  const has = (ts, q, ps) => ts.some(t => text(t).includes(q)) ? 1 : ps.length > 1 && ts.some(t => ps.every(p => text(t).includes(p))) ? 2 : 0;
  for (const [k, q0] of quotesIn(src)) {
    const q = strip(q0), ps = parts(q0);
    let h = q ? has(own, q, ps) : 0, o = 0;
    if (!h && q) { h = has(ALL, q, ps); o = 1; }
    if (h) { found++; other += o; if (h === 2) split++; } else missing.push((k ? k + '|' : '') + q0);
  }
  const n = found + missing.length;
  log[id] = { date: today, quotes: n, found, other, split, missing, unmatched: m ? m.miss : [] };
  T[0] += n; T[1] += found; T[2] += missing.length;
  console.log(`${id} ${n} 条，找到 ${found}${other ? `（其中 ${other} 条见于他卷原文）` : ''}${split ? `（${split} 条按分句找到）` : ''}，未找到 ${missing.length}${m && m.miss.length ? ` · 篇目未对上 ${m.miss.length}` : ''}`);
}
fs.writeFileSync(LOG, JSON.stringify(Object.fromEntries(Object.entries(log).sort()), null, 1) + '\n');
console.log(`共 ${T[0]} 条，找到 ${T[1]}，未找到 ${T[2]}`);
