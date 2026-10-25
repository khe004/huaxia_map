// 用法：node tools/posthumous.js [书 …]：按生卒年检查事件人物是否已故
// 列出卒年早于事件年份、却没写进该事件 post 的人物（夏正十二月去世折算到公历次年一二月的不算），
// 以及写进 post 但卒年不早于事件的人物。前者若在事件中只是身后出现（追尊、图像、平反、改葬），应写进 post；
// 若是生前的言行被一并叙述（如事件跨越数年），可以不改。
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = path.join(__dirname, '..');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : require('./books.js')();
const pc = {}; vm.createContext(pc); vm.runInContext(fs.readFileSync(R + '/books/_people.js', 'utf8') + ';this.PC=commonOf', pc);
const death = s => { const m = (s || '').match(/[–-]\s*约?(前)?(\d+)\??\s*$/); return m ? (m[1] ? -m[2] : +m[2]) : null; };
let n = 0;
for (const id of ids) {
  const c = {}; vm.createContext(c);
  vm.runInContext(fs.readFileSync(`${R}/books/${id}/book.js`, 'utf8') + ';this.X={EVENTS,PEOPLE_RAW}', c);
  const life = new Map(c.X.PEOPLE_RAW.map(p => [p[0], (pc.PC(p[0], id) || [])[1] || p[3]])), out = [];
  // 标题写着此人之死的事件（“某某之死”“杀某某”“某某自缢”等）：当场死难的不应标身后；同年此后的事件里再出现应标身后
  const DEATH = /(之死|卒|崩|自杀|被杀|遇刺|遇害|自刎|自刭|自缢|自经|饿死|被醢|弃市|腰斩|被弑|遇弑|伏诛|之诛|族诛|死于|殉节|冤死|败死|败亡|赐死|自尽)/;
  // 按标题中“ · ”分隔的各段判断：含此人之名的那一段写着死亡
  const diesIn = (e, w) => e.t.split(/\s*·\s*/).some(seg => seg.includes(w) && (new RegExp('(斩|杀|诛|鸩|弑|缢杀)' + w).test(seg) || (DEATH.test(seg) && !new RegExp(w + '(诛|杀|斩|弑)').test(seg))));
  const tE = e => e.y + (e.mo - 1) / 12, diedAt = new Map();
  for (const e of c.X.EVENTS) for (const w of e.who) if (diesIn(e, w) && !(diedAt.has(w) && tE(diedAt.get(w)) <= tE(e))) diedAt.set(w, e);
  for (const e of c.X.EVENTS) for (const w of e.who) {
    const de = diedAt.get(w), post0 = (e.post || []).includes(w);
    if (de === e && post0) out.push(`  ${e.y} ${e.t}：${w} 在此事件中死去，却标了身后`);
    if (de && de !== e && de.y === e.y && tE(e) > tE(de) + 1e-9 && !post0 && !e.src) out.push(`  ${e.y} ${e.t}：${w} 已死于同年早些的「${de.t}」，未标身后`);
  }
  for (const e of c.X.EVENTS) for (const w of e.who) {
    const d = death(life.get(w)), post = (e.post || []).includes(w);
    if (d == null) continue;
    if (e.src) continue; // 演义情节等虚构事件不按史实生卒检查
    const gone = d < e.y && !(d === e.y - 1 && e.mo < 3);
    if (gone && !post) out.push(`  ${e.y} ${e.t}：${w}（卒 ${d}）未标身后`);
    if (post && d > e.y) out.push(`  ${e.y} ${e.t}：${w}（卒 ${d}）标了身后但当时在世`);
  }
  if (out.length) { console.log(`== ${id}`); out.forEach(l => console.log(l)); n += out.length; }
}
console.log(`共 ${n} 条待确认`);
