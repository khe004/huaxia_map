// 用法：node tools/leaderfac.js [书 …]：找出在 FACTIONS 中有专属势力、人物表里却仍归在别的势力下的首领。
// 判定：势力在本卷任一时刻的图例名称或地图标签（name / mapName）里写出了某人的名字（两字以上），而此人在 PEOPLE_RAW 中不属于该势力。
// 另列出势力名里写出、本卷人物表却没有收录的人（名字取自全部各卷人物表与 books/_people.js）。
// 一人先后为几个势力之首的（如先属旧朝、后自立），人物表只能填一个：取其一生主要所属，核对后写进 OK：'书:人名'。
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = path.join(__dirname, '..');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : require('./books.js')();
const OK = new Set([
  'chuhan:韩信',  // 汉所封齐王、楚王，楚汉战争中一直是汉将
  'chuhan:彭越',  // 汉所封梁王，楚汉战争中附汉
  'chibi:张燕',   // 黑山军 205 年降曹，本卷（200–220）主要是曹操部属
]);
// 势力名里写出、但不必收入人物表的（只作年代标识或泛称）：'书:人名'
const NAMED_OK = new Set([
  'zhaoxuan:狐鹿姑单于', 'zhaoxuan:乌珠留若鞮单于', // 匈奴图例按年标注在位单于，本卷事件不涉其本人
  'qunxiong:檀石槐', 'chibi:檀石槐',               // “檀石槐后裔诸部”是泛称
  'sanguo:刘焉', 'sanguo:士燮', 'sanguo:张杨', 'sanguo:公孙度', // 《三国演义》单行本：图例沿用割据者名，演义情节未写其人
]);
const ALL = new Set();
{ const pc = {}; vm.createContext(pc); vm.runInContext(fs.readFileSync(R + '/books/_people.js', 'utf8') + ';this.P=PEOPLE_COMMON', pc); Object.keys(pc.P).forEach(k => ALL.add(k));
  for (const id of require('./books.js')()) { const c = {}; vm.createContext(c); vm.runInContext(fs.readFileSync(`${R}/books/${id}/book.js`, 'utf8') + ';this.R=PEOPLE_RAW', c); c.R.forEach(p => ALL.add(p[0])); } }
let n = 0;
for (const id of ids) {
  const c = {}; vm.createContext(c);
  vm.runInContext(fs.readFileSync(`${R}/books/${id}/book.js`, 'utf8') + ';this.X={BOOK,FACTIONS,PEOPLE_RAW}', c);
  const { BOOK: B, FACTIONS: F, PEOPLE_RAW } = c.X, [Y0, Y1] = B.range;
  const lab = {};
  for (const f of Object.keys(F)) { const s = new Set();
    for (let t = Y0; t <= Y1 + 1; t += 1 / 12) { s.add(F[f].name(t)); if (F[f].mapName) s.add(F[f].mapName(t)); }
    // “某某专政 / 辅政”是该势力的权臣，不是首领，不算
    lab[f] = [...s].join('|').replace(/[^（）·|\s]+(专政|辅政)/g, ''); }
  const out = [];
  for (const [who, fac] of PEOPLE_RAW) {
    if (who.length < 2 || OK.has(`${id}:${who}`)) continue;
    const own = Object.keys(F).filter(f => lab[f].includes(who));
    if (own.length && !own.includes(fac)) out.push(`  ${who}：人物表归 ${fac}（${F[fac] ? F[fac].name(Y1) : '?'}），专属势力 ${own.map(f => `${f}（${lab[f].split('|').filter(x => x.includes(who))[0]}）`).join('、')}`);
  }
  const mine = new Set(PEOPLE_RAW.map(p => p[0]));
  // 只是本卷某个更长人名的一部分（如“刘武”之于“刘武周”）的不算
  const inLonger = (nm, s) => [...mine].some(m => m.length > nm.length && m.includes(nm) && s.split(m).join('').indexOf(nm) < 0);
  for (const nm of ALL) if (nm.length >= 2 && !mine.has(nm) && !NAMED_OK.has(`${id}:${nm}`)) for (const f of Object.keys(F)) if (lab[f].includes(nm) && !inLonger(nm, lab[f])) out.push(`  ${nm}：写在势力 ${f}（${lab[f].split('|').find(x => x.includes(nm))}）的名称里，本卷人物表未收`);
  if (out.length) { console.log(`== ${id}`); out.forEach(l => console.log(l)); n += out.length; }
}
console.log(`共 ${n} 人`);
