// 用法：node tools/legendname.js [书 …]：按引擎的时间步逐步计算各势力的图例名称、地图标签与所属分组（realm），
// 名称在“年初”一步（没有事件）就变了、而此后一年内有对应事件的列出来——阈值写得比对应事件早（如整数年份、或按上一个月写的小数），
// 点到改名的那个事件之前，图例已经换了新名。应把阈值改到不大于对应事件的 t = 年 + (月 − 1) / 12（与 thresholds.js 相配：也不能晚于它）。
const path = require('path');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : require('./books.js')();
// 已核对、确无对应事件的（关键词只是碰巧出现在别的事件里）：'书:势力:年'
const OK = new Set([
  'waiqi:han:145',      // 顺帝崩于 144 年 9 月，本卷无此事件；145 年 3 月梁并招降一事的正文提到冲帝
  'shanggu:haidai:-2600', // 大汶口→山东龙山是文化分期，同年的涿鹿之战与之无关
  'zhengheng:gongsun:238', // 公孙渊 237 年称燕王，本卷无此事件；238 年 9 月的事件是其败亡
  'sanguo:sun:222',     // 孙权 221 年称吴王，书中无此事件；222 年夷陵之战与之无关
  'chuhan:zhao:-206', 'chuhan:qi:-206', 'chuhan:han:-206', // 常山、代、三齐、汉王都是项羽分封十八王所立，落在“分封十八王”正对
  'wuyue:yue:-494',     // 以下几处正落在对应的正月事件上，只是新标签的字样正文未写：夫椒之战后越臣服于吴
  'hanchu:chu:-201',    // 擒韩信后分楚为二，刘交为楚王
  'mingzhang:xiyuhan:92', // 班超为都护
  'bawang:jin:304',     // 长沙王乂死后成都王颖遥执朝政
  'jinsong:tuoba:399',  // 拓跋珪称帝
  'sanguo:han:190',     // 关东联军讨董，东汉瓦解为各地割据
  'bawang:jin:303',     // 长沙王乂杀齐王冏后执政，正落在该事件上（标签里的“执政”二字正文未写）
  'wuzhou:tang:684',    // 高宗崩于弘道元年十二月（折合 684 年 1 月），中宗随即即位，正落在“高宗崩”事件上
  'yongjia:jin:307',    // 惠帝崩于 306 年 12 月（上卷末事件），本卷无此事件；307 年 3 月的事件只是正文提到怀帝
]);
let n = 0;
for (const id of ids) {
  const { X: { BOOK: B, FACTIONS: F, SEEDS_RAW, SNAPSHOTS, EVENTS, PEOPLE_RAW }, steps, tOf } = require('./steps.js').load(id);
  const seeds = SEEDS_RAW.split(/\s{2,}|\n+/).map(s => s.trim()).filter(Boolean).map(s => { const [z, n] = s.split('|'); return { z, n }; });
  const by = new Map(); seeds.forEach((s, i) => s.z !== 'x' && by.set(s.n, i));
  const resolve = (tok, cur) => { const out = []; for (const t of tok.split(/\s+/).filter(Boolean)) {
    if (t === '*') seeds.forEach((s, i) => s.z !== 'x' && out.push(i)); else if (t[0] === '@') seeds.forEach((s, i) => s.z === t.slice(1) && out.push(i));
    else if (t[0] === '#') cur.forEach((f, i) => f === t.slice(1) && out.push(i)); else if (by.has(t)) out.push(by.get(t)); } return out; };
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
    if (prev) for (const f of shown) if (prev[f]) for (const kind of Object.keys(now[f])) {
      const a = prev[f][kind], b = now[f][kind]; if (a == null || b == null || a === b) continue;
      // 只报有对应事件的：同年稍后有事件，且新标签里新出现的词（含单字、去掉括号后的主名）见于标题或正文（年初一步还认事件人物属于此势力的）。
      // 切换落在某个事件上、而新词见于该事件的，就是落对了；落在无关事件上（如整数阈值碰上正月事件、或同月稍后的事件）而同年稍后有对应事件的，报出。
      // 没有对应事件的改名（如匈奴单于更替、上古文化分期）本就只能在年初切换，不报
      const words = x => [...new Set([...x.split(/[（）·、\s]+/), base(x)])];
      // 新标签里新出现的词；没有时（如“孝武帝 · 谢安辅政”→“孝武帝”）取旧标签里消失的词，去掉“辅政”等尾巴
      let toks = words(b).filter(w => w && !a.includes(w));
      if (!toks.length) toks = words(a).filter(w => w && !b.includes(w)).map(w => w.replace(/(辅政|专政|专权|执政)$/, '')).filter(w => w.length >= 2);
      const says = e => toks.some(w => (w.length >= 2 ? e.t + e.d : e.t).includes(w));
      if (st.e && says(st.e)) continue;
      const later = steps.slice(k + 1).filter(s => s.e && s.y === st.y);
      const hit = later.find(s => says(s.e)) || (!st.e && later.find(s => s.e.who.some(w => ppl.get(w) === f)));
      const at = st.e ? `「${st.e.t}」${st.y}/${st.e.mo}` : `${st.y} 年初`;
      if (OK.has(`${id}:${f}:${st.y}`)) continue;
      if (hit) out.push(`  ${at}：${f} ${kind}「${a}」→「${b}」，对应事件「${hit.e.t}」${hit.y}/${hit.e.mo}（t=${hit.t.toFixed(3)}）`);
      // 没有对应事件、却挂在当年无关的正月事件上（整数阈值，年初一步取 y − 1e-6）：本意是年初，应写 y − 0.001
      else if (st.e && st.e.mo <= 1) out.push(`  ${at}：${f} ${kind}「${a}」→「${b}」，本意是年初却挂在无关的正月事件上，阈值应写 ${st.y - 0.001}`);
    }
    prev = now;
  });
  if (out.length) { console.log(`== ${id}`); out.forEach(l => console.log(l)); n += out.length; }
}
console.log(`共 ${n} 处`);
