// 用法：node tools/thresholds.js [书 …]：检查 FACTIONS / CITIES 等按时间切换的阈值（t < X）是否落在本该触发的事件之后
// 引擎的时刻 t = 年 + (月 − 1) / 12。若某事件的 t 比阈值 X 小不到 0.125 年（一个半月），点到这个事件时名称还没变，
// 多半是按 年 + 月/12 写的阈值，列出来（阈值离后一个事件更近的不列）；应把 X 改到不大于该事件的 t（如 220 年 11 月 → 220.83）。
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = path.join(__dirname, '..');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : require('./books.js')();
let n = 0;
for (const id of ids) {
  const src = fs.readFileSync(`${R}/books/${id}/book.js`, 'utf8');
  const c = {}; vm.createContext(c); vm.runInContext(src + ';this.E=EVENTS', c);
  const ev = c.E.map(e => ({ t: e.y + (e.mo - 1) / 12, e }));
  const out = [];
  src.split('\n').forEach((line, li) => {
    if (!/\b[ty]\s*[<>]=?\s*-?\d/.test(line)) return;
    for (const m of line.matchAll(/\b[ty]\s*([<>]=?)\s*(-?\d+(?:\.\d+)?)/g)) {
      const X = +m[2];
      if (Number.isInteger(X)) continue; // 整数年份是有意在年初切换
      const near = ev.filter(({ t }) => t < X - 1e-9 && X - t < 0.125).sort((a, b) => b.t - a.t)[0];
      const next = ev.filter(({ t }) => t >= X - 1e-9).sort((a, b) => a.t - b.t)[0];
      // 阈值离后一个事件更近时，本意多半是在后一个事件处切换，不列
      if (near && !(next && next.t - X < X - near.t)) out.push(`  L${li + 1} t ${m[1]} ${X}：「${near.e.t}」${near.e.y}/${near.e.mo} → t=${near.t.toFixed(3)}，阈值晚了 ${(X - near.t).toFixed(3)}`);
    }
  });
  if (out.length) { console.log(`== ${id}`); out.forEach(l => console.log(l)); n += out.length; }
}
console.log(`共 ${n} 处`);
