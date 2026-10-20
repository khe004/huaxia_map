// 用法：node tools/unlinked.js [书 …]：列出事件简介里提到、却没写进该事件 who 的人物
// 人名取自全部各卷的人物表；本卷人物表里没有的标“＋”（需要先补进本卷人物表）
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = path.join(__dirname, '..');
const all = JSON.parse(fs.readFileSync(R + '/series.json')).books.map(b => b.id);
const ids = process.argv.slice(2).length ? process.argv.slice(2) : all;
const load = id => { const c = {}; vm.createContext(c); vm.runInContext(fs.readFileSync(`${R}/books/${id}/book.js`, 'utf8') + ';this.X={EVENTS,PEOPLE_RAW}', c); return c.X; };
const names = new Set(); all.forEach(id => load(id).PEOPLE_RAW.forEach(p => names.add(p[0])));
// 只取两字以上；一个名字是另一个名字的一部分时（如“刘表”与“刘表之子”无关，但“刘备”与“刘备之”…），以最长匹配为准
const list = [...names].filter(n => n.length >= 2).sort((a, b) => b.length - a.length);
let total = 0;
for (const id of ids) {
  const X = load(id), mine = new Set(X.PEOPLE_RAW.map(p => p[0])), out = [];
  for (const e of X.EVENTS) {
    let d = e.d.replace(/\*\*[^*]*\*\*/g, m => m); const hit = [];
    for (const n of list) if (d.includes(n)) { hit.push(n); d = d.split(n).join('□'.repeat(n.length)); }
    const miss = hit.filter(n => !e.who.includes(n));
    if (miss.length) out.push(`  ${e.y} ${e.t}：${miss.map(n => (mine.has(n) ? '' : '＋') + n).join('、')}`);
  }
  if (out.length) { console.log(`== ${id}`); out.forEach(l => console.log(l)); total += out.length; }
}
console.log(`共 ${total} 条事件有未挂名的人物`);
