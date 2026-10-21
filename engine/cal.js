// 事件的纪年写法：引擎的事件详情与目录页检索共用（build.mjs 嵌入 app.js，build-series.mjs 直接执行）。
// C = BOOK.calendar，range = BOOK.range，eras(y) 返回该年各家纪年 [{d: 国号, s: '黄初二年'}]。
// 只有一家纪年时不加国号；多家并列时加国号（鲁庄公十年 · 周庄王十三年），s 已以国号开头的不重复。
const eraFmt = x => (x.d && !x.s.startsWith(x.d) ? x.d : '') + x.s;
function calText(e, C, range, eras) {
  const es0 = eras(e.y);
  if (!e.cal) return !es0.length ? '' : es0.length === 1 ? es0[0].s : es0.map(eraFmt).join(' · ');
  // 春秋卷：cal 用鲁历，补周王纪年（王年踰年改元，按公历年即可）
  if (C.label) {
    const hit = es0.filter(x => e.cal.includes(x.s)); if (!hit.length) return e.cal;
    return [e.cal, ...es0.filter(x => !hit.some(h => h.d === x.d)).map(eraFmt)].join(' · ');
  }
  // 年号纪年：由 cal 开头的年号名与年数推出它实际所在的年份。年中改元（嘉平六年二月，公历年表已是正元元年）、
  // 夏历十二月折成公历次年（建兴六年十二月）时，这一年与事件的公历年不同；同名年号（蜀、吴都有建兴）按年份区分
  const N = '〇一二三四五六七八九', d1 = c => Math.max(0, N.indexOf(c || '〇'));
  const num = s => (s === '元' ? 1 : s.includes('十') ? (d1(s.split('十')[0]) || 1) * 10 + d1(s.split('十')[1]) : d1(s));
  let own = null, yr = e.y, best = 0;
  // cal 可以带国号（“魏正始十年”“后赵建武四年”）：去掉与该家国号相同的前缀再匹配年号名
  for (const d of Object.keys(C.eras || {})) for (const [st, name] of C.eras[d]) {
    const body = e.cal.startsWith(d + name) ? e.cal.slice(d.length) : e.cal;
    if (name.length <= best || !body.startsWith(name)) continue;
    const m = body.slice(name.length).match(/^(元|[〇一二三四五六七八九十]+)年/); if (!m) continue;
    let y = st + num(m[1]) - 1; if (st < 0 && y >= 0) y++;
    if (y === e.y || y === e.y - 1) { own = d; yr = y; best = name.length; }
  }
  if (!own) {
    // 推不出年份（如“景元年间”）时，只按本年与上一年在用的年号名定所属，多家并列时加国号
    const nm = x => x.s.replace(/(元|[〇一二三四五六七八九十]+)年$/, '');
    const ds = [...new Set([...es0, ...eras(e.y - 1)].filter(x => nm(x) && (e.cal.startsWith(nm(x)) || e.cal.startsWith(x.d + nm(x)))).map(x => x.d))];
    return es0.length > 1 && ds.length === 1 && !e.cal.startsWith(ds[0]) ? ds[0] + e.cal : e.cal;
  }
  const es = eras(yr), head = es.length > 1 && !e.cal.startsWith(own) ? own + e.cal : e.cal;
  // 他家的元年（年中改元）与卷末之前结束的最后一年（年中亡国）未必覆盖事件所在月份，不补；纪年写到卷末只是本卷止于此年
  const ends = x => { const sp = (C.spans || {})[x.d]; return sp && sp[1] === yr && sp[1] < range[1]; };
  const more = es.filter(x => x.d !== own && !e.cal.includes(x.s) && !x.s.includes('元年') && !ends(x));
  return [head, ...more.map(eraFmt)].join(' · ');
}
