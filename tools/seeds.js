// 用法：node tools/seeds.js [书 …]（缺省为 series.json 中的全部书）
// 检查快照里引用的种子点都存在，且不是 x 组（排除在疆域外的种子点）：引擎建表时跳过 x 组（engine/app.js），
// 快照写到 x 组种子会在运行时报 unknown seed，Pages 的 smoke 随之失败。
const fs = require('fs'), vm = require('vm');
const R = require('./root.js').R;
const ids = process.argv.slice(2).length ? process.argv.slice(2) : require('./books.js')();
let total = 0;
for (const id of ids) {
  const c = {}; vm.createContext(c);
  vm.runInContext(fs.readFileSync(`${R}/books/${id}/book.js`, 'utf8') + ';this.X={SEEDS_RAW,SNAPSHOTS}', c);
  const seeds = c.X.SEEDS_RAW.split(/\s{2,}|\n+/).map(s => s.trim()).filter(Boolean).map(s => { const [z, n] = s.split('|'); return { z, n }; });
  const ok = new Set(seeds.filter(s => s.z !== 'x').map(s => s.n)), xs = new Set(seeds.filter(s => s.z === 'x').map(s => s.n));
  const zs = new Set(seeds.map(s => s.z));
  for (const [y, m, list] of c.X.SNAPSHOTS) for (const [, tok] of list) for (const k of tok.split(/\s+/).filter(Boolean)) {
    if (k === '*' || k[0] === '#') continue;
    if (k[0] === '@') { if (!zs.has(k.slice(1))) { console.log(`${id} [${y}, ${m}] 未知分组 ${k}`); total++; } continue; }
    if (!ok.has(k)) { console.log(`${id} [${y}, ${m}] ${xs.has(k) ? 'x 组种子不能写进快照' : '未知种子'}：${k}`); total++; }
  }
}
console.log(`共 ${total} 处`);
