// 用法：node tools/evorder.js [书 …]：检查事件的时间先后是否自相矛盾
// 1. 人物在自己的死亡事件（标题含其名与“死、卒、崩、被杀”等，或“斩、杀、诛、鸩、弑”紧接其名）之后又出现在其他事件中（标了 post 的除外）
// 2. 人物出现在出生年之前的事件中
// 3. 事件的 cal（原书纪年）里的月份与 mo 的换算关系和本卷多数事件不一致（小数月份为同月排序而设，不比较）
// 4. 同年同月的几个事件，排在后面的事件简介里写着前一个事件的人“死后”等字样（按数组顺序排先后，可能颠倒）
// 5. 两个事件的年、月完全相同：两步的时刻 t 相同，后一事件的疆域快照、势力或城邑改名会提前落在前一事件上，应给其一个小数月份（如 9.5）
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = path.join(__dirname, '..');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : require('./books.js')();
const pc = {}; vm.createContext(pc); vm.runInContext(fs.readFileSync(R + '/books/_people.js', 'utf8') + ';this.PC=commonOf', pc);
const yr = (q, n) => (n ? (q ? -n : +n) : null);
const lifeOf = s => { const m = (s || '').match(/^(前)?(\d+)?\??\s*[–-]\s*(前)?(\d+)?/); return m ? [yr(m[1], m[2]), yr(m[3], m[4])] : [null, null]; };
const DEATH = /(之死|卒|崩|自杀|被杀|遇刺|遇害|自刎|自刭|自缢|自经|饿死|被醢|弃市|腰斩|被弑|饮酖|败亡|伏诛|之诛|族诛|死于)/;
const CN = { 正: 1, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10, 十一: 11, 十二: 12 };
let total = 0;
for (const id of ids) {
  const c = {}; vm.createContext(c);
  vm.runInContext(fs.readFileSync(`${R}/books/${id}/book.js`, 'utf8') + ';this.X={EVENTS,PEOPLE_RAW}', c);
  const E = c.X.EVENTS.map((e, i) => ({ ...e, i })).sort((a, b) => a.y + (a.mo - 1) / 12 - (b.y + (b.mo - 1) / 12) || a.i - b.i);
  E.forEach((e, k) => { e.k = k; });
  const life = new Map(c.X.PEOPLE_RAW.map(p => [p[0], lifeOf((pc.PC(p[0], id) || [])[1] || p[3])]));
  const out = [], post = (e, n) => (e.post || []).includes(n);
  // 1
  const dead = new Map();
  // “斩、杀、诛、鸩、弑”只算紧跟其后的人名（“马援斩征侧”是征侧死，不是马援死）
  const slain = (s, n) => new RegExp('(斩|杀|诛|鸩|弑)' + n).test(s);
  for (const e of E) for (const n of e.who) { const seg = e.t.split(' · ').find(s => s.includes(n)) || '';
    if (e.t.includes(n) && (DEATH.test(seg.replace(new RegExp('(斩|杀|诛|鸩|弑)[^ ·]*'), m => (m.includes(n) ? m : ''))) || slain(seg, n))) dead.has(n) || dead.set(n, e); }
  for (const e of E) for (const n of e.who) { const d = dead.get(n); if (d && e.k > d.k && !post(e, n)) out.push(`  ✗ ${n} 死于「${d.t}」(${d.y}/${d.mo})，之后又出现在「${e.t}」(${e.y}/${e.mo})`); }
  // 2
  for (const e of E) for (const n of e.who) { const [b] = life.get(n) || []; if (b != null && e.y < b) out.push(`  ✗ ${n} 生于 ${b}，却出现在「${e.t}」(${e.y})`); }
  // 3
  const off = new Map(), rows = [];
  // 王莽始建国、天凤、地皇年间改用丑正（以夏正十二月为正月），月份换算与他朝差一个月，不比较
  // 武周载初至久视年间行周正（以十一月为正月、十二月为腊月，夏正正月改称一月），正月、腊月的换算与他月不同，不比较
  for (const e of E) { if (/始建国|天凤|地皇/.test(e.cal || '') || /(载初|天授|如意|长寿|延载|证圣|天册万岁|万岁登封|万岁通天|神功|圣历|久视)[^月]*(正|腊)月/.test(e.cal || '')) continue; const m = (e.cal || '').match(/(?:^|[年载])(闰)?(正|十二|十一|十|一|二|三|四|五|六|七|八|九)月/); if (!m) continue;
    const d = ((Math.floor(e.mo) - CN[m[2]]) % 12 + 12) % 12; rows.push([e, d, m[0]]); off.set(d, (off.get(d) || 0) + 1); }
  const main = [...off].sort((a, b) => b[1] - a[1])[0];
  for (const [e, d, s] of rows) if (main && d !== main[0] && !(e.cal.includes('闰') && d === (main[0] + 11) % 12) && Math.floor(e.mo) === e.mo) out.push(`  ? 「${e.t}」cal ${e.cal} 与 mo ${e.mo} 的换算（差 ${d} 个月）和本卷多数（差 ${main[0]}）不同`);
  // 4
  for (let k = 1; k < E.length; k++) { const a = E[k - 1], b = E[k]; if (a.y !== b.y || Math.floor(a.mo) !== Math.floor(b.mo)) continue;
    for (const n of b.who) if (a.d.includes(n + '死后') || a.d.includes(n + '死前')) {} 
    for (const n of a.who) if (b.d.includes(n + '死后') && !dead.has(n)) {}
    for (const n of new Set([...a.who, ...b.who])) if (a.d.includes(n + '死后') && b.t.includes(n) && DEATH.test(b.t)) out.push(`  ? 同月「${a.t}」写着“${n}死后”，却排在「${b.t}」之前`); }
  // 5
  E.forEach((e, k) => { if (k && e.y === E[k - 1].y && e.mo === E[k - 1].mo) out.push(`  ✗ 「${E[k - 1].t}」与「${e.t}」同为 ${e.y}/${e.mo}，时刻相同`); });
  if (out.length) { console.log(`== ${id}`); [...new Set(out)].forEach(l => console.log(l)); total += new Set(out).size; }
}
console.log(`共 ${total} 条`);
