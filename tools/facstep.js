// 用法：node tools/facstep.js [书 …]：逐个核对 FACTIONS（name / mapName / realm）与 CITIES 里的时间阈值落在哪一步。
// 约定：整数年份 y（或 y − 0.001）表示在该年“年初”切换；带小数的阈值应写成对应事件的 t = 年 + (月 − 1) / 12（不大于它）。
// 切换实际落在的那一步离阈值半个月以上的列出：小数阈值滑到了同年稍后的别的事件上（多半无关）、或拖到了次年年初。
// 负数年份的小数要按 t 算：前 120 年 8 月是 -120 + 7/12 = -119.417，不是 -119.4（那会被当成前 119 年）。
const { load } = require('./steps.js');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : require('./books.js')();
let n = 0;
for (const id of ids) {
  const { X: { BOOK: B, FACTIONS: F, CITIES }, steps } = load(id), [Y0, Y1] = B.range;
  const out = [];
  const where = k => (k < 0 ? '卷末之后' : steps[k].e ? `「${steps[k].e.t}」${steps[k].y}/${steps[k].e.mo}（t=${steps[k].t.toFixed(4)}）` : `${steps[k].y} 年初`);
  const check = (label, X) => {
    if (X <= Y0 || X > Y1 + 1) return;
    if (Number.isInteger(X) || Number.isInteger(+(X + 0.001).toFixed(6))) return; // 年初
    const k = steps.findIndex(s => X <= s.t + 1e-9);
    const ok = k >= 0 && steps[k].e && steps[k].t - X < 1 / 24;
    if (!ok) {
      const ev = steps.filter(s => s.e && Math.abs(s.t - X) < 0.25).map(s => `「${s.e.t}」${s.y}/${s.e.mo}（t=${s.t.toFixed(4)}）`);
      out.push(`  ${label} < ${X}：落在 ${where(k)}；附近事件 ${ev.join('、') || '—'}`);
    }
  };
  for (const [f, F0] of Object.entries(F)) for (const key of ['name', 'mapName', 'realm']) {
    if (typeof F0[key] !== 'function') continue;
    for (const m of F0[key].toString().matchAll(/\b[ty]\s*<=?\s*(-?\d+(?:\.\d+)?)/g)) check(`${f}.${key}`, +m[1]);
  }
  for (const c of CITIES) c.n.forEach(([X, nm], j) => check(`城 ${nm || (c.n[j - 1] || [])[1] + '（废）'}`, X));
  // 分段都城标记 cap: [[阈值, 1 或 0], …]
  for (const c of CITIES) if (Array.isArray(c.cap)) c.cap.forEach(([X, v]) => X > B.range[0] && check(`城 ${c.n[0][1]} ${v ? '为都' : '不再为都'}`, X));
  if (out.length) { console.log(`== ${id}`); out.forEach(l => console.log(l)); n += out.length; }
}
console.log(`共 ${n} 处`);
