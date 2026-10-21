// 用法：node tools/legendname.js [书 …]：按引擎的时间步逐步计算各势力的图例名称、地图标签与所属分组（realm），
// 名称在“年初”一步（没有事件）就变了、而此后一年内有对应事件的列出来——阈值写得比对应事件早（如整数年份、或按上一个月写的小数），
// 点到改名的那个事件之前，图例已经换了新名。应把阈值改到不大于对应事件的 t = 年 + (月 − 1) / 12（与 thresholds.js 相配：也不能晚于它）。
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = path.join(__dirname, '..');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : require('./books.js')();
// 已核对、确无对应事件的（关键词只是碰巧出现在别的事件里）：'书:势力:年'
const OK = new Set([
  'waiqi:han:145',      // 顺帝崩于 144 年 9 月，本卷无此事件；145 年 3 月梁并招降一事的正文提到冲帝
  'shanggu:haidai:-2600', // 大汶口→山东龙山是文化分期，同年的涿鹿之战与之无关
  'zhengheng:gongsun:238', // 公孙渊 237 年称燕王，本卷无此事件；238 年 9 月的事件是其败亡
  'sanguo:sun:222',     // 孙权 221 年称吴王，书中无此事件；222 年夷陵之战与之无关
]);
let n = 0;
for (const id of ids) {
  const c = {}; vm.createContext(c);
  vm.runInContext(fs.readFileSync(`${R}/books/${id}/book.js`, 'utf8') + ';this.X={BOOK,FACTIONS,SEEDS_RAW,SNAPSHOTS,EVENTS,PHASES,PEOPLE_RAW}', c);
  const { BOOK: B, FACTIONS: F, SEEDS_RAW, SNAPSHOTS, EVENTS, PHASES, PEOPLE_RAW } = c.X;
  const [Y0, Y1] = B.range, tOf = (y, m) => y + (m - 1) / 12;
  let YEARS = [];
  if (B.yearStride) {
    const keep = new Set([Y0, Y1, ...EVENTS.map(e => e.y), ...SNAPSHOTS.map(s => s[0]), ...PHASES.flatMap(p => [p[0], p[1]])]);
    B.yearStride.forEach(([a, k], j) => { const b = (B.yearStride[j + 1] || [Y1 + 1])[0]; for (let y = a; y < b; y += k) keep.add(y); });
    YEARS = [...keep].filter(y => y >= Y0 && y <= Y1 && y !== 0).sort((a, b) => a - b);
  } else for (let y = Y0; y <= Y1; y++) if (y !== 0) YEARS.push(y);
  const seeds = SEEDS_RAW.split(/\s{2,}|\n+/).map(s => s.trim()).filter(Boolean).map(s => { const [z, n] = s.split('|'); return { z, n }; });
  const by = new Map(); seeds.forEach((s, i) => s.z !== 'x' && by.set(s.n, i));
  const resolve = (tok, cur) => { const out = []; for (const t of tok.split(/\s+/).filter(Boolean)) {
    if (t === '*') seeds.forEach((s, i) => s.z !== 'x' && out.push(i)); else if (t[0] === '@') seeds.forEach((s, i) => s.z === t.slice(1) && out.push(i));
    else if (t[0] === '#') cur.forEach((f, i) => f === t.slice(1) && out.push(i)); else if (by.has(t)) out.push(by.get(t)); } return out; };
  const steps = [];
  for (const y of YEARS) { steps.push({ y, t: tOf(y, 1) - (EVENTS.some(e => e.y === y && e.mo <= 1) ? 1e-6 : 0), e: null });
    EVENTS.filter(e => e.y === y).sort((a, b) => a.mo - b.mo).forEach(e => steps.push({ y, t: tOf(y, e.mo), e })); }
  let cur = seeds.map(s => (s.z === 'x' ? 'x' : B.baseFaction)), si = 0;
  if (SNAPSHOTS.length) { for (const [f, tok] of SNAPSHOTS[0][2]) resolve(tok, cur).forEach(i => { cur[i] = f; }); si = 1; }
  const out = []; let prev = null;
  // 每个势力在每一步的三种标签：图例名称 name、地图标签 mapName、所属分组 realm（字符串或 t => 字符串）
  const ppl = new Map(PEOPLE_RAW.map(p => [p[0], p[1]]));
  const realmName = r => (r ? (B.realms || {})[r] || r : '');
  const labels = (f, t) => { const F0 = F[f], r = typeof F0.realm === 'function' ? F0.realm(t) : F0.realm;
    return { 名称: F0.name(t), 地图标签: F0.mapName ? F0.mapName(t) : null, 分组: realmName(r) }; };
  const base = x => x.replace(/（[^）]*）/g, '');
  steps.forEach((st, k) => {
    while (si < SNAPSHOTS.length && tOf(SNAPSHOTS[si][0], SNAPSHOTS[si][1]) <= st.t + 1e-9) { for (const [f, tok] of SNAPSHOTS[si][2]) resolve(tok, cur).forEach(i => { cur[i] = f; }); si++; }
    const shown = new Set(cur.filter(f => f !== 'x' && F[f]));
    const now = {}; for (const f of shown) now[f] = labels(f, st.t);
    if (prev && !st.e) for (const f of shown) if (prev[f]) for (const kind of Object.keys(now[f])) {
      const a = prev[f][kind], b = now[f][kind]; if (a == null || b == null || a === b) continue;
      // 只报有对应事件的：同年稍后有事件，且新标签里新出现的词（含单字、去掉括号后的主名）见于标题或正文，或事件人物属于此势力。
      // 没有对应事件的改名（如匈奴单于更替、上古文化分期）本就只能在年初切换，不报
      const toks = [...new Set([...b.split(/[（）·、\s]+/), base(b)])].filter(w => w && !a.includes(w));
      const later = steps.slice(k + 1).filter(s => s.e && s.y === st.y);
      const hit = later.find(s => toks.some(w => (w.length >= 2 ? s.e.t + s.e.d : s.e.t).includes(w)))
        || later.find(s => s.e.who.some(w => ppl.get(w) === f));
      if (hit && !OK.has(`${id}:${f}:${st.y}`)) out.push(`  ${st.y} 年初：${f} ${kind}「${a}」→「${b}」，对应事件「${hit.e.t}」${hit.y}/${hit.e.mo}（t=${hit.t.toFixed(3)}）`);
    }
    prev = now;
  });
  if (out.length) { console.log(`== ${id}`); out.forEach(l => console.log(l)); n += out.length; }
}
console.log(`共 ${n} 处`);
