// 用法：node tools/snapev.js [书 …]（缺省为 series.json 中的全部书）
// 检查每次地图变动（SNAPSHOTS 中开局之后的每一条）落在哪个事件上：
// 地图在“第一个时间 ≥ 快照时间的事件”处显示变化，读者按事件翻页时就在那里看到。
// 若该事件简介里没有提到变动涉及的任何种子点名，也不在三个月之内，就列出来人工复核，
// 同时列出前一个事件，便于判断是该把快照挪到前一个事件、补一句简介，还是补一个事件。
// 另检查快照是否按时间排序。开局快照（不晚于第一个事件）和不改变任何地块的快照不列。
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = path.join(__dirname, '..');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : JSON.parse(fs.readFileSync(R + '/series.json')).books.map(b => b.id);
const tOf = (y, m) => y + (m - 1) / 12;
let total = 0;
for (const id of ids) {
  const src = fs.readFileSync(`${R}/books/${id}/book.js`, 'utf8');
  const c = {}; vm.createContext(c);
  vm.runInContext(src + ';this.X={BOOK,FACTIONS,SEEDS_RAW,SNAPSHOTS,EVENTS}', c);
  const X = c.X, out = [];
  const seeds = X.SEEDS_RAW.split(/\s{2,}|\n+/).map(s => s.trim()).filter(Boolean).map(s => { const [z, n] = s.split('|'); return { z, n }; });
  const by = new Map(); seeds.forEach((s, i) => by.set(s.n, i));
  let cur = seeds.map(s => (s.z === 'x' ? 'x' : X.BOOK.baseFaction));
  const evT = e => tOf(e.y, e.mo);
  const EV = X.EVENTS.slice().sort((a, b) => evT(a) - evT(b));
  const t0 = evT(EV[0]);
  const nm = (f, t) => { const F = X.FACTIONS[f]; try { return F && F.name ? F.name(t) : f; } catch (e) { return f; } };
  let prevT = -Infinity;
  X.SNAPSHOTS.forEach(([y, m, list]) => {
    const t = tOf(y, m), prev = cur.slice();
    if (t < prevT - 1e-9) out.push(`  ✗ 快照顺序：[${y}, ${m}] 早于上一条`);
    prevT = t;
    for (const [f, tok] of list) for (const k of tok.split(/\s+/).filter(Boolean)) {
      let idx = [];
      if (k === '*') idx = seeds.map((_, i) => i);
      else if (k[0] === '@') seeds.forEach((s, i) => s.z === k.slice(1) && idx.push(i));
      else if (k[0] === '#') cur.forEach((g, i) => g === k.slice(1) && idx.push(i));
      else if (by.has(k)) idx = [by.get(k)];
      else out.push(`  ? 未知的种子点：${k}（[${y}, ${m}]）`);
      idx.forEach(i => { cur[i] = f; });
    }
    const ch = []; cur.forEach((f, i) => { if (f !== prev[i]) ch.push(i); });
    if (t <= t0 + 1e-9 || !ch.length) return;
    const names = ch.map(i => seeds[i].n);
    const eff = EV.find(e => evT(e) >= t - 1e-9);
    // 势力名（含括号中的人名）中两字以上的词，出现在事件标题里也算相关
    const keys = new Set();
    [...new Set([...ch.map(i => cur[i]), ...ch.map(i => prev[i])])].forEach(f => nm(f, t).split(/[\s·、，（）()]+/).forEach(w => { if (w.length >= 2) keys.add(w); }));
    if (eff && evT(eff) - t < 0.26 && (names.some(n => (eff.t + eff.d).includes(n)) || [...keys].some(k => eff.t.includes(k)))) return;
    const pv = [...EV].reverse().find(e => evT(e) < t - 1e-9);
    const show = e => (e ? `${e.y}/${e.mo} ${e.t}` : '—');
    const who = [...new Set(ch.map(i => nm(prev[i], t)))].join('/') + ' → ' + [...new Set(ch.map(i => nm(cur[i], t)))].join('/');
    out.push(`  [${y}, ${m}] ${who}：${names.slice(0, 8).join(' ')}${names.length > 8 ? ' …' : ''}\n      显示于：${show(eff)}　前一事件：${show(pv)}`);
  });
  if (out.length) { console.log(`== ${id}`); out.forEach(l => console.log(l)); total += out.length; }
}
console.log(`共 ${total} 条待复核（事件简介未直接写出地名的，确认标题或正文与变动相符即可）`);
