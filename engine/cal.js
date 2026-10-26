// 事件的纪年写法：引擎的事件详情与目录页检索共用（build.mjs 嵌入 app.js，build-series.mjs 直接执行）。
// C = BOOK.calendar，range = BOOK.range，eras(y) 返回该年各家纪年 [{d: 国号, s: '黄初二年'}]。
// 只有一家纪年时不加国号；多家并列时加国号（鲁庄公十年 · 周庄王十三年），s 已以国号开头的不重复。
// 各家在某年的纪年：引擎 eras() 与目录页 erasOf() 共用。C.eras 每项 [起年, 年号, 起年记作第几年 = 1, 改元的公历月份]；
// 同一年先后改元的（嗣圣、文明、光宅），这一年合写作“嗣圣、文明、光宅元年”；C.zai 让天宝三载至至德三载写“载”
const cnNumC = n => { const D = '〇一二三四五六七八九'; if (n === 1) return '元'; if (n < 10) return D[n]; const t = Math.floor(n / 10), o = n % 10; return (t === 1 ? '' : D[t]) + '十' + (o ? D[o] : ''); };
const zaiOfC = (C, y, k) => { const z = Array.isArray(C.zai) ? C.zai : (C.zai || {})[k]; return z && y >= z[0] && y <= z[1] ? '载' : '年'; };
const eraLabel = (C, k, it, y, all) => {
  const n = y - it[0] + (it[2] || 1) - (it[0] < 0 && y > 0 ? 1 : 0);
  const same = n === 1 && all ? all.filter(x => x[0] === y && (x[2] || 1) === 1) : [];
  return (same.length > 1 ? same.map(x => x[1]).join('、') : it[1]) + cnNumC(n) + zaiOfC(C, y, k);
};
function erasFor(C, y) {
  if (C.label) return C.label(y) || [];
  const out = [];
  for (const k of Object.keys(C.eras || {})) {
    const span = (C.spans || {})[k]; if (span && (y < span[0] || y > span[1])) continue;
    let e = null; for (const it of C.eras[k]) if (it[0] <= y) e = it;
    // 年号写作 null 的一项表示这一家从此年起中断纪年（如武周代唐的 691–704 年）
    if (e && e[1]) out.push({ d: k, s: eraLabel(C, k, e, y, C.eras[k]) });
  }
  return out;
}
const eraFmt = x => (x.d && !x.s.startsWith(x.d) ? x.d : '') + x.s;
function calText(e, C, range, eras) {
  const es0 = eras(e.y);
  if (!e.cal) {
    // 没写原书纪年的事件：年中改元、建国的（eras 第四项），按事件月份取新旧年号，事件在建国之前的不列
    const es = es0.map(x => {
      const list = (C.eras || {})[x.d] || [], cur = list.filter(it => it[0] <= e.y).pop(), sp0 = (C.spans || {})[x.d];
      if (sp0 && sp0[2] && sp0[1] === e.y && e.mo >= sp0[2]) return null;
      if (!cur || cur[0] !== e.y || (cur[2] || 1) > 1 || !cur[3] || e.mo >= cur[3]) return x;
      const prev = list.filter(it => it[0] < e.y).pop(), sp = (C.spans || {})[x.d];
      return prev && prev[1] && !(sp && sp[0] === e.y && sp[0] > range[0]) ? { d: x.d, s: eraLabel(C, x.d, prev, e.y, null) } : null;
    }).filter(Boolean);
    return !es.length ? '' : es.length === 1 ? es[0].s : es.map(eraFmt).join(' · ');
  }
  // 春秋卷：cal 用鲁历，补周王纪年（王年踰年改元，按公历年即可）
  if (C.label) {
    const hit = es0.filter(x => e.cal.includes(x.s)); if (!hit.length) return e.cal;
    return [e.cal, ...es0.filter(x => !hit.some(h => h.d === x.d)).map(eraFmt)].join(' · ');
  }
  // 年号纪年：由 cal 开头的年号名与年数（“年”或天宝至德间的“载”）推出它实际所在的年份。年中改元（嘉平六年二月，公历年表已是正元元年）、
  // 夏历十二月折成公历次年（建兴六年十二月）时，这一年与事件的公历年不同；同名年号（蜀、吴都有建兴）按年份区分
  const N = '〇一二三四五六七八九', d1 = c => Math.max(0, N.indexOf(c || '〇'));
  const num = s => (s === '元' ? 1 : s.includes('十') ? (d1(s.split('十')[0]) || 1) * 10 + d1(s.split('十')[1]) : d1(s));
  // 上一年：公历无 0 年，公元 1 年的上一年是前 1 年（-1）
  const prevY = e.y === 1 ? -1 : e.y - 1;
  let own = null, yr = e.y, best = 0;
  // cal 可以带国号（“魏正始十年”“后赵建武四年”）：去掉与该家国号相同的前缀再匹配年号名
  for (const d of Object.keys(C.eras || {})) for (const [st, name, n0 = 1] of C.eras[d]) {
    if (!name) continue;
    const body = e.cal.startsWith(d + name) ? e.cal.slice(d.length) : e.cal;
    if (name.length <= best || !body.startsWith(name)) continue;
    const m = body.slice(name.length).match(/^(元|[〇一二三四五六七八九十]+)[年载]/); if (!m) continue;
    let y = st + num(m[1]) - n0; if (st < 0 && y >= 0) y++;
    // 周正的正月（夏历十一月）落在公历上一年末：年号所在年份比事件的公历年晚一年
    if (y === e.y || y === prevY || y === e.y + 1) { own = d; yr = y; best = name.length; }
  }
  if (!own) {
    // 推不出年份（如“景元年间”）时，只按本年与上一年在用的年号名定所属，多家并列时加国号
    const nm = x => x.s.replace(/(元|[〇一二三四五六七八九十]+)[年载]$/, '');
    const ds = [...new Set([...es0, ...eras(prevY)].filter(x => nm(x) && (e.cal.startsWith(nm(x)) || e.cal.startsWith(x.d + nm(x)))).map(x => x.d))];
    return es0.length > 1 && ds.length === 1 && !e.cal.startsWith(ds[0]) ? ds[0] + e.cal : e.cal;
  }
  // 夏历十二月折成公历次年的（yr 比事件公历年早一年），e.y 才开始的一家若在 yr 年末已改元（第四项写 13），也要补出
  const es = eras(yr), es1 = yr < e.y ? eras(e.y).filter(x => !es.some(z => z.d === x.d)).map(x => ({ ...x, late: 1 })) : [];
  // 事件月份折算到 yr 这一年（夏历十二月折成公历次年的，算作 yr 的第 13 个月）
  const mon = e.mo + 12 * (e.y - yr);
  // 他家的元年（年中改元）与卷末之前结束的最后一年（年中亡国）未必覆盖事件所在月份，不补；纪年写到卷末只是本卷止于此年。
  // spans 写第三项（亡国或停用的公历月份）时，这一年在此月之前的事件照补
  const ends = x => { const sp = (C.spans || {})[x.d]; return sp && sp[1] === yr && (sp[2] ? mon >= sp[2] : sp[1] < range[1]); };
  // 他家这一年改元的：给了改元月份（C.eras 第四项）就按事件月份取新旧年号，没给的不补
  const other = x => {
    const list = (C.eras || {})[x.d] || [], cur = list.filter(it => it[0] <= yr).pop();
    if (!cur || !cur[1]) return null;
    if (x.late) return cur[0] === yr && cur[3] && mon >= cur[3] ? eraLabel(C, x.d, cur, yr, null) : null;
    // 第三项大于 1 的（[558, '明帝', 2]）是接续纪年，不是这一年改元
    if (cur[0] !== yr || (cur[2] || 1) > 1) return x.s;
    if (!cur[3]) return null;
    if (mon >= cur[3]) return eraLabel(C, x.d, cur, yr, null);
    const prev = list.filter(it => it[0] < yr).pop();
    const sp = (C.spans || {})[x.d];
    return prev && prev[1] && !(sp && sp[0] === yr && sp[0] > range[0]) ? eraLabel(C, x.d, prev, yr, null) : null;
  };
  const more = [...es, ...es1].filter(x => x.d !== own && !ends(x)).map(x => ({ d: x.d, s: other(x) })).filter(x => x.s && !e.cal.includes(x.s));
  // 只剩本家一种纪年时不加国号
  const head = more.length && !e.cal.startsWith(own) ? own + e.cal : e.cal;
  return [head, ...more.map(eraFmt)].join(' · ');
}
