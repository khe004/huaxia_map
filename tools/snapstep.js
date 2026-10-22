// 用法：node tools/snapstep.js [书 …]：按引擎的时间步，找出疆域快照（开局之后）实际生效在“年初”一步、而不是某个事件上的。
// 常见原因：快照月份写得比对应事件晚（点到事件时疆域未变，要到次年年初才变），
// 或夏历十二月的快照没像事件那样折成次年公历一月（在事件前一步的年初就提前变了）。
// 也报出快照所在月份没有事件、顺延到同年稍后某个事件上才生效的（那个事件多半与之无关）。
// 列出生效步之前、之后最近的事件，把快照的 [年, 月] 改成对应事件的年月；确无对应事件的改成正月（有意在年初渐变）。
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = path.join(__dirname, '..');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : require('./books.js')();
let n = 0;
for (const id of ids) {
  const c = {}; vm.createContext(c);
  vm.runInContext(fs.readFileSync(`${R}/books/${id}/book.js`, 'utf8') + ';this.X={BOOK,SNAPSHOTS,EVENTS,PHASES}', c);
  const { BOOK: B, SNAPSHOTS, EVENTS, PHASES } = c.X, [Y0, Y1] = B.range, tOf = (y, m) => y + (m - 1) / 12;
  let YEARS = [];
  if (B.yearStride) {
    const keep = new Set([Y0, Y1, ...EVENTS.map(e => e.y), ...SNAPSHOTS.map(s => s[0]), ...PHASES.flatMap(p => [p[0], p[1]])]);
    B.yearStride.forEach(([a, k], j) => { const b = (B.yearStride[j + 1] || [Y1 + 1])[0]; for (let y = a; y < b; y += k) keep.add(y); });
    YEARS = [...keep].filter(y => y >= Y0 && y <= Y1 && y !== 0).sort((a, b) => a - b);
  } else for (let y = Y0; y <= Y1; y++) if (y !== 0) YEARS.push(y);
  const steps = [];
  for (const y of YEARS) { steps.push({ y, t: tOf(y, 1) - (EVENTS.some(e => e.y === y && e.mo <= 1) ? 1e-6 : 0), e: null });
    EVENTS.filter(e => e.y === y).sort((a, b) => a.mo - b.mo).forEach(e => steps.push({ y, t: tOf(y, e.mo), e })); }
  const out = [];
  // 引擎按顺序扫描 SNAPSHOTS，乱序的快照会推迟到前一条之后才生效
  SNAPSHOTS.forEach(([y, m], i) => { if (i && tOf(y, m) < tOf(...SNAPSHOTS[i - 1]) - 1e-9) out.push(`  [${y}, ${m}] 排在 [${SNAPSHOTS[i - 1][0]}, ${SNAPSHOTS[i - 1][1]}] 之后，顺序颠倒`); });
  SNAPSHOTS.slice(1).forEach(([y, m, list]) => {
    // 写成正月、当年又没有正月事件的，是有意在年初渐变（如《三国演义》单行本中没有对应事件的地盘变化），不报
    if (m === 1) return;
    const k = steps.findIndex(s => s.t >= tOf(y, m) - 1e-9); if (k < 0) return;
    const pv = steps.slice(0, k).reverse().find(s => s.e), nx = steps.slice(k).find(s => s.e);
    const f = e => e ? `「${e.e.t}」${e.y}/${e.e.mo}` : '—';
    if (!steps[k].e) out.push(`  [${y}, ${m}] ${list.map(x => x[0]).join(',')} → 生效于 ${steps[k].y} 年初；前一事件 ${f(pv)}，后一事件 ${f(nx)}`);
    // 生效在某个事件上、但快照的月份并没有事件：疆域变化顺延到了同年稍后（多半无关）的事件上
    else if (steps[k].t - tOf(y, m) > 1e-6) out.push(`  [${y}, ${m}] ${list.map(x => x[0]).join(',')} → 该月无事件，顺延到 ${f(steps[k])}；前一事件 ${f(pv)}`);
  });
  if (out.length) { console.log(`== ${id}`); out.forEach(l => console.log(l)); n += out.length; }
}
console.log(`共 ${n} 条`);
