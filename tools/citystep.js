// 用法：node tools/citystep.js [书 …]：检查 CITIES 中城邑出现、改名、废弃的阈值是否落在对应事件上。
// 引擎按当前一步的时刻 t = 年 + (月 − 1) / 12 判断城邑名（整数年份从该年年初一步起生效）。两类问题：
//   提前：阈值生效在“年初”一步（没有事件），而同年稍后有提到该城的事件——迁都、置城、改名其实发生在年中，应把阈值改成该事件的 t；
//   推迟：生效那一步之前一年内已有提到该城的事件——点到事件时城名还没变，应改到不大于事件的 t（不是对应事件的写进 OK）。
// 判定“提到该城”：事件标题、地点、正文中出现新名或旧名（两字以上；单字名只看标题和地点）。
// 已核对、确无对应事件的写进 OK：'书:新名或旧名:阈值'
const ids = process.argv.slice(2).length ? process.argv.slice(2) : require('./books.js')();
const OK = new Set([
  'wuyue:姑苏:-514',    // 阖闾即位后才筑大城，专诸刺王僚一事只提到吴
  'danggu:弹汗山:182',  // 檀石槐死后王庭渐散，无确切年月的事件
  'yongjia:建康:313.333', // 避愍帝讳改名在愍帝即位时；石勒据襄国的正文只顺带提到建邺
]);
let n = 0;
for (const id of ids) {
  const { X: { BOOK: B, CITIES }, steps } = require('./steps.js').load(id), [Y0] = B.range;
  const evs = steps.filter(s => s.e);
  const says = (e, w) => w.length >= 2 ? (e.t + (e.p || '') + e.d).includes(w) : (e.t + (e.p || '')).includes(w);
  const out = [];
  for (const city of CITIES) city.n.forEach(([X, name], j) => {
    if (X <= Y0) return;
    const old = j ? city.n[j - 1][1] : '';
    const words = [name, old].filter(Boolean);
    if (words.some(w => OK.has(`${id}:${w}:${X}`))) return;
    const label = `${old || '（无）'}→${name || '（废）'} @${X}`;
    const k = steps.findIndex(s => X <= s.t + 1e-9); if (k < 0) return;
    // 生效那一步是年初、或是没提到该城的事件（如整数年份落在当年的正月事件上），而同年稍后有提到它的事件
    if (!steps[k].e || !words.some(w => says(steps[k].e, w))) {
      const hit = evs.find(s => s.t > steps[k].t && s.y === steps[k].y && words.some(w => says(s.e, w)));
      if (hit) out.push(`  提前：${label} 生效于 ${steps[k].e ? `「${steps[k].e.t}」` : steps[k].y + ' 年初'}；对应事件「${hit.e.t}」${hit.y}/${hit.e.mo}（t=${hit.t.toFixed(3)}）`);
      // 整数年份碰上当年的正月事件（年初一步取 y − 1e-6），本意是年初却挂到了无关的正月事件上：写成 y − 0.001
      else if (steps[k].e && Number.isInteger(X)) out.push(`  错挂：${label} 本意是 ${X} 年初，却落在无关的正月事件「${steps[k].e.t}」上，应写 ${X - 0.001}`);
    }
    // 推迟：生效那一步之前一年内已有提到该城的事件（含阈值落在年中却无事件、拖到次年年初才生效的）
    const near = steps[k].e && words.some(w => says(steps[k].e, w)) ? null : evs.filter(s => s.t < steps[k].t - 1e-9 && steps[k].t - s.t < 1 && words.some(w => says(s.e, w))).pop();
    if (near) out.push(`  推迟：${label} 生效于 ${steps[k].e ? `「${steps[k].e.t}」` : steps[k].y + ' 年初'}，晚于「${near.e.t}」${near.y}/${near.e.mo}（t=${near.t.toFixed(3)}）`);
  });
  if (out.length) { console.log(`== ${id}`); out.forEach(l => console.log(l)); n += out.length; }
}
console.log(`共 ${n} 处`);
