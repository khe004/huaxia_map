// 用法：node tools/unlinked.js [书 …]：列出事件简介里提到、却没写进该事件 who 的人物
// 人名取自本卷、合集中前后各两卷的人物表与 books/_people.js 的跨卷人物；本卷人物表里没有的标“＋”（需要先补进本卷人物表）
// 与年号、本卷势力名相同的人名不算（如年号“建兴”、官称“单于”）
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = path.join(__dirname, '..');
const all = require('./books.js')();
const ids = process.argv.slice(2).length ? process.argv.slice(2) : all;
const load = id => { const c = {}; vm.createContext(c); vm.runInContext(fs.readFileSync(`${R}/books/${id}/book.js`, 'utf8') + ';this.X={EVENTS,PEOPLE_RAW,BOOK,FACTIONS}', c); return c.X; };
const pc = (() => { const c = {}; vm.createContext(c); vm.runInContext(fs.readFileSync(`${R}/books/_people.js`, 'utf8') + ';this.P=PEOPLE_COMMON', c); return c.P; })();
const series = JSON.parse(fs.readFileSync(R + '/series.json')).books.map(b => b.id);
const cache = new Map(), get = id => { if (!cache.has(id)) cache.set(id, load(id)); return cache.get(id); };
const poolOf = id => {
  const k = series.indexOf(id), near = k < 0 ? [id] : series.slice(Math.max(0, k - 2), k + 3);
  const names = new Set(Object.keys(pc)); near.forEach(b => get(b).PEOPLE_RAW.forEach(p => names.add(p[0])));
  const X = get(id), stop = new Set();
  Object.values((X.BOOK.calendar || {}).eras || {}).forEach(l => l.forEach(it => it[1] && stop.add(it[1])));
  // 势力名只取括号外的国号部分作停用词（“吴（杨行密）”只停用“吴”）；括号里的君主、首领名照常检查
  Object.values(X.FACTIONS).forEach(F => { try { F.name(X.BOOK.range[0]).replace(/（[^）]*）/g, ' ').split(/[·\s]+/).forEach(w => w && stop.add(w)); } catch (e) {} });
  // 只取两字以上；一个名字是另一个名字的一部分时，以最长匹配为准
  return [...names].filter(n => n.length >= 2 && !stop.has(n)).sort((a, b) => b.length - a.length);
};
let total = 0;
for (const id of ids) {
  const X = get(id), list = poolOf(id), mine = new Set(X.PEOPLE_RAW.map(p => p[0])), out = [];
  for (const e of X.EVENTS) {
    let d = e.d.replace(/\*\*[^*]*\*\*/g, m => ' '.repeat(m.length)); const hit = []; // 剔除原书引文：引文里的古人名多是被提及而非参与
    for (const n of list) if (d.includes(n)) { hit.push(n); d = d.split(n).join('□'.repeat(n.length)); }
    const miss = hit.filter(n => !e.who.includes(n));
    if (miss.length) out.push(`  ${e.y} ${e.t}：${miss.map(n => (mine.has(n) ? '' : '＋') + n).join('、')}`);
  }
  if (out.length) { console.log(`== ${id}`); out.forEach(l => console.log(l)); total += out.length; }
}
console.log(`共 ${total} 条事件有未挂名的人物`);
