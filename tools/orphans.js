// 用法：node tools/orphans.js [书 …]：列出人物表里没有挂到任何事件上的人物
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = path.join(__dirname, '..');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : require('./books.js')();
let n = 0;
for (const id of ids) {
  const c = {}; vm.createContext(c);
  vm.runInContext(fs.readFileSync(`${R}/books/${id}/book.js`, 'utf8') + ';this.X={EVENTS,PEOPLE_RAW}', c);
  const used = new Set(c.X.EVENTS.flatMap(e => e.who));
  const lone = c.X.PEOPLE_RAW.map(p => p[0]).filter(p => !used.has(p));
  if (lone.length) { console.log(`${id}：${lone.join('、')}`); n += lone.length; }
}
console.log(`共 ${n} 人没有事件`);
