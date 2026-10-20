// 用法：node tools/posthumous.js [书 …]：按生卒年检查事件人物是否已故
// 列出卒年早于事件年份、却没写进该事件 post 的人物（夏正十二月去世折算到公历次年一二月的不算），
// 以及写进 post 但卒年不早于事件的人物。前者若在事件中只是身后出现（追尊、图像、平反、改葬），应写进 post；
// 若是生前的言行被一并叙述（如事件跨越数年），可以不改。
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = path.join(__dirname, '..');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : JSON.parse(fs.readFileSync(R + '/series.json')).books.map(b => b.id);
const pc = {}; vm.createContext(pc); vm.runInContext(fs.readFileSync(R + '/books/_people.js', 'utf8') + ';this.PC=PEOPLE_COMMON', pc);
const death = s => { const m = (s || '').match(/[–-]\s*(前)?(\d+)\s*$/); return m ? (m[1] ? -m[2] : +m[2]) : null; };
let n = 0;
for (const id of ids) {
  const c = {}; vm.createContext(c);
  vm.runInContext(fs.readFileSync(`${R}/books/${id}/book.js`, 'utf8') + ';this.X={EVENTS,PEOPLE_RAW}', c);
  const life = new Map(c.X.PEOPLE_RAW.map(p => [p[0], (pc.PC[p[0]] || [])[1] || p[3]])), out = [];
  for (const e of c.X.EVENTS) for (const w of e.who) {
    const d = death(life.get(w)), post = (e.post || []).includes(w);
    if (d == null) continue;
    const gone = d < e.y && !(d === e.y - 1 && e.mo < 3);
    if (gone && !post) out.push(`  ${e.y} ${e.t}：${w}（卒 ${d}）未标身后`);
    if (post && d > e.y) out.push(`  ${e.y} ${e.t}：${w}（卒 ${d}）标了身后但当时在世`);
  }
  if (out.length) { console.log(`== ${id}`); out.forEach(l => console.log(l)); n += out.length; }
}
console.log(`共 ${n} 条待确认`);
