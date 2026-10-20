// 用法：node tools/refs.js [书 …]：列出事件 refs 中不在 BOOK.source.titles 里的篇名
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = path.join(__dirname, '..');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : JSON.parse(fs.readFileSync(R + '/series.json')).books.map(b => b.id);
let n = 0;
for (const id of ids) {
  const c = {}; vm.createContext(c);
  vm.runInContext(fs.readFileSync(`${R}/books/${id}/book.js`, 'utf8') + ';this.X={BOOK,EVENTS}', c);
  const S = c.X.BOOK.source; if (!S || S.type !== 'sections') continue;
  const keys = new Set(Object.keys(S.titles || {})), miss = new Map();
  c.X.EVENTS.forEach(e => (e.refs || []).forEach(r => { if (!keys.has(r)) miss.set(r, [...(miss.get(r) || []), e.t]); }));
  if (miss.size) { console.log(`== ${id}`); miss.forEach((ts, r) => console.log(`  ${r}  ← ${ts.slice(0, 3).join('；')}${ts.length > 3 ? ' …' : ''}`)); n += [...miss.values()].reduce((a, v) => a + v.length, 0); }
}
console.log(`共 ${n} 处引用不在篇目表中`);
