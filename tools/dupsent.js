// 用法：node tools/dupsent.js [书 …]：找出事件简介（d）里意思重复的句子——
// 两句共享 8 字以上的相同片段，或两句的二字组重合度过半（引文 **…** 里的原文不计）。多是后来补写人物时在末尾追加了与前文重复的句子。
const { load } = require('./steps.js');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : require('./books.js')();
const plain = s => s.replace(/\*\*[^*]*\*\*/g, '').replace(/“[^”]*”/g, '').replace(/[，、；：（）《》·\s]/g, '');
const bi = s => { const b = new Set(); for (let i = 0; i < s.length - 1; i++) b.add(s.slice(i, i + 2)); return b; };
const common = (a, b) => { let best = ''; for (let i = 0; i < a.length; i++) for (let j = i + best.length + 1; j <= a.length; j++) { const w = a.slice(i, j); if (b.includes(w)) best = w; else break; } return best; };
let n = 0;
const TH = +(process.env.TH || 0.5);
for (const id of ids) {
  const { X: { EVENTS } } = load(id), out = [];
  for (const e of EVENTS) {
    // 按句号断句，引号里的句号不断
    const ss = []; let cur = '', q = 0;
    for (const ch of e.d) { cur += ch; if (ch === '“') q++; else if (ch === '”') q = Math.max(0, q - 1); else if ('。！？'.includes(ch) && !q) { ss.push(cur.trim()); cur = ''; } }
    if (cur.trim()) ss.push(cur.trim());
    const P = ss.map(plain);
    for (let i = 0; i < ss.length; i++) for (let j = i + 1; j < ss.length; j++) {
      if (P[i].length < 10 || P[j].length < 10) continue;
      const A = bi(P[i]), B = bi(P[j]), inter = [...A].filter(x => B.has(x)).length, r = inter / Math.min(A.size, B.size), c = common(P[i], P[j]);
      if (c.length >= 8 || r > TH) out.push(`  「${e.t}」重合 ${(r * 100).toFixed(0)}%${c.length >= 8 ? `，共同片段「${c}」` : ''}\n    ① ${ss[i]}\n    ② ${ss[j]}`);
    }
  }
  if (out.length) { console.log(`== ${id}`); out.forEach(l => console.log(l)); n += out.length; }
}
console.log(`共 ${n} 处`);
