// ---------- 人物交汇图：横轴为事件（时间顺序），纵轴为地点（按州、郡），人物画成线 ----------
const story = $('#story'), sLeft = $('#s-left'), sScroll = $('#s-scroll'), sBody = $('#s-body'), sChips = $('#s-chips');
const ZHOU_ORDER = B.regions?.order || [];
// 事件归入哪一郡：与地图一致，先取事件点所在的拼块（已按 UNIT_OVERRIDES 归属），落在拼块外（海上、境外）再取最近的种子点
function nearestSeed([lon, lat]) {
  const f = UF.features.find(u => d3.geoContains(u, [lon, lat]));
  if (f && SEEDS[f.properties.j] && SEEDS[f.properties.j].z !== 'x') return f.properties.j;
  let best = -1, bd = Infinity;
  SEEDS.forEach((s, i) => { if (s.z === 'x') return; const dx = (s.lon - lon) * Math.cos(lat * Math.PI / 180), dy = s.lat - lat, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } });
  return best;
}
EVENTS.forEach(e => { e.j = nearestSeed(e.ll); });
// 只画当前一条线（史事或文化）的事件与人物，切换时重算
let ROWS, rowOf, COLS, colOf;
function storyData() {
  COLS = EV_SORTED; colOf = new Map(COLS.map((e, k) => [e.i, k]));
  ROWS = [...new Set(COLS.map(e => e.j))]
    .sort((a, b) => (ZHOU_ORDER.indexOf(SEEDS[a].z) + 1 || 99) - (ZHOU_ORDER.indexOf(SEEDS[b].z) + 1 || 99) || SEEDS[a].z.localeCompare(SEEDS[b].z) || SEEDS[b].lat - SEEDS[a].lat);
  rowOf = new Map(ROWS.map((j, k) => [j, k]));
}
storyData();
const liveOn = n => PEOPLE.get(n).live.filter(i => onLine(EVENTS[i]));
// 列宽随事件数伸缩：事件少（如文化线）时放宽到 120，铺满可视宽度，阶段标题与人名也有地方放
let COLW = 46;
const HEAD = 94, PADX0 = 24, NAMEW = n => n.length * 11.5 + 4;
const PCOL = ['#d1495b', '#2f7fbf', '#e09f1f', '#2a9d8f', '#8d6cab', '#e0602f', '#5aa83c', '#c2569b', '#7a6a4f', '#3fb6d6', '#a83232', '#6b7fd7'];
// 交汇图只画在世事件不少于 2 件的人物（与顶栏人物按钮一致），默认人选和本地保存的人选都按此过滤
const storyable = n => PEOPLE.has(n) && liveOn(n).length >= 2;
// 默认人选：史事线用本卷的 storyDefault，文化线取文化事件最多的十人；人选按线分别记在本机
const defaultSel = () => (LINE === 'main' && B.storyDefault ? B.storyDefault : [...PEOPLE.keys()].sort((a, b) => liveOn(b).length - liveOn(a).length).slice(0, 10)).filter(storyable);
const storeKey = () => `yutu-${B.id}-story${LINE === 'main' ? '' : '-' + LINE}`;
let sel;
function loadSel() {
  sel = defaultSel();
  try { const v = JSON.parse(localStorage.getItem(storeKey())); if (Array.isArray(v) && v.every(n => PEOPLE.has(n))) sel = v.filter(storyable); } catch (e) { /* 无本地存储时用默认 */ }
}
loadSel();
const saveSel = () => { try { localStorage.setItem(storeKey(), JSON.stringify(sel)); } catch (e) { /* ignore */ } };
LINE_HOOKS.push(() => { storyData(); loadSel(); renderChips(); renderStory(); storyCursor(); });
const pColor = n => PCOL[sel.indexOf(n) % PCOL.length];
const shortT = t => { const s = t.split(' · ')[0]; return s.length > 6 ? s.slice(0, 6) : s; };
let geom = null;

function renderChips() {
  // 只计在世时的事件（身后出现的追尊、图像等不连线）
  const list = [...PEOPLE.values()].map(p => [p, liveOn(p.n).length]).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]);
  sChips.innerHTML = list.map(([p, c]) => {
    const on = sel.includes(p.n);
    return `<button class="schip${on ? ' on' : ''}" data-sp="${p.n}" style="${on ? `--pc:${pColor(p.n)}` : ''}">${p.n}<small>${c}</small></button>`;
  }).join('');
}
sChips.addEventListener('click', e => {
  const b = e.target.closest('[data-sp]'); if (!b) return;
  const n = b.dataset.sp; sel = sel.includes(n) ? sel.filter(x => x !== n) : sel.concat(n);
  saveSel(); renderChips(); renderStory();
});
$('#s-reset').onclick = () => { sel = defaultSel(); saveSel(); renderChips(); renderStory(); };
$('#s-clear').onclick = () => { sel = []; saveSel(); renderChips(); renderStory(); };

function renderStory() {
  if (story.hidden) return;
  // 行高按可用高度计算，扣掉横向滚动条，使常见屏幕上无需上下滚动
  const sb = sScroll.offsetHeight - sScroll.clientHeight || 12;
  const avail = sBody.clientHeight - sb - 2;
  const RH = Math.max(12, Math.min(34, Math.floor((avail - HEAD) / ROWS.length)));
  // 起止人名画在线的两端外侧：首列、末列的人名要留出左右边距
  const firstCol = new Map(), lastCol = new Map();
  for (const n of sel) { const ks = liveOn(n).map(i => colOf.get(i)).filter(k => k != null); if (ks.length) { firstCol.set(n, Math.min(...ks)); lastCol.set(n, Math.max(...ks)); } }
  const padL = Math.max(PADX0, ...[...firstCol].filter(([, k]) => k === 0).map(([n]) => NAMEW(n) + 16));
  const padR = Math.max(PADX0, ...[...lastCol].filter(([, k]) => k === COLS.length - 1).map(([n]) => NAMEW(n) + 16));
  COLW = Math.max(46, Math.min(120, Math.floor((sScroll.clientWidth - padL - padR) / Math.max(1, COLS.length))));
  const H = HEAD + ROWS.length * RH, WD = padL + padR + COLS.length * COLW;
  const yRow = k => HEAD + k * RH + RH / 2, xCol = k => padL + k * COLW + COLW / 2;
  geom = { xCol, WD };

  // 左侧：州、郡标签
  const L = d3.select(sLeft).html('').append('svg').attr('width', 118).attr('height', H);
  const zg = d3.groups(ROWS.map((j, k) => ({ j, k })), d => SEEDS[d.j].z);
  zg.forEach(([z, rs], gi) => {
    const a = rs[0].k, b = rs[rs.length - 1].k;
    L.append('rect').attr('class', 'szband' + (gi % 2 ? ' alt' : '')).attr('x', 0).attr('y', HEAD + a * RH).attr('width', 118).attr('height', (b - a + 1) * RH);
    L.append('text').attr('class', 'szhou').attr('x', 15).attr('y', HEAD + (a + b + 1) / 2 * RH).text((B.regions?.group && z.endsWith(B.regions.group) ? z.slice(0, -B.regions.group.length) : z) || z);
  });
  L.selectAll('text.sjun').data(ROWS).join('text').attr('class', 'sjun').style('font-size', Math.min(12, RH - 2.5) + 'px').attr('x', 110).attr('y', (j, k) => yRow(k) + 4).text(j => SEEDS[j].n);
  L.append('text').attr('class', 'shead').attr('x', 110).attr('y', HEAD - 8).text('地点 ↓  事件 →');

  // 主图
  const S = d3.select(sScroll).html('').append('svg').attr('width', WD).attr('height', H);
  zg.forEach(([z, rs], gi) => {
    const a = rs[0].k, b = rs[rs.length - 1].k;
    S.append('rect').attr('class', 'szband' + (gi % 2 ? ' alt' : '')).attr('x', 0).attr('y', HEAD + a * RH).attr('width', WD).attr('height', (b - a + 1) * RH);
  });
  S.append('g').selectAll('line').data(ROWS).join('line').attr('class', 'srow').attr('x1', 0).attr('x2', WD).attr('y1', (j, k) => yRow(k)).attr('y2', (j, k) => yRow(k));
  // 阶段与年份
  for (const [a, b, n] of PHASES) {
    const cs = COLS.filter(e => e.y >= a && e.y <= b); if (!cs.length) continue;
    const x0 = xCol(colOf.get(cs[0].i)) - COLW / 2, x1 = xCol(colOf.get(cs[cs.length - 1].i)) + COLW / 2;
    S.append('line').attr('class', 'sphase').attr('x1', x0).attr('x2', x0).attr('y1', 4).attr('y2', H);
    // 阶段标题按阶段宽度取舍：全称带年份 → 只写名称 → 截短加省略号；放不下的悬停看全称
    const full = `${n} ${fmtYear(a)}–${fmtYear(b)}`, room = (x1 - x0 - 10) / 14;
    const fit = full.length <= room ? full : n.length <= room ? n : room >= 2 ? n.slice(0, Math.floor(room) - 1) + '…' : '';
    S.append('text').attr('class', 'sphase-t').attr('x', x0 + 6).attr('y', 13).text(fit).append('title').text(full);
    S.append('line').attr('class', 'sphase-u').attr('x1', x0 + 2).attr('x2', x1 - 2).attr('y1', 17).attr('y2', 17);
  }
  let lastY = null;
  COLS.forEach((e, k) => {
    if (e.y !== lastY) { S.append('text').attr('class', 'syear').attr('x', xCol(k)).attr('y', 29).text(fmtYear(e.y)); lastY = e.y; }
    S.append('text').attr('class', 'sev-t' + (e.k === 'pol' ? '' : ' ' + e.k)).attr('x', xCol(k)).attr('y', 34).attr('data-c', e.i).text(shortT(e.t));
  });
  S.append('rect').attr('class', 'scursor').attr('id', 's-cursor').attr('y', 20).attr('width', COLW).attr('height', H - 20);

  // 人物线
  const off = new Map(); // `${person}|${event}` → y 偏移
  const gap = Math.min(4, (RH - 6) / Math.max(1, sel.length));
  for (const e of COLS) {
    const ps = sel.filter(n => e.who.includes(n) && !isPost(e, n));
    ps.forEach((n, i) => off.set(n + '|' + e.i, (i - (ps.length - 1) / 2) * gap));
  }
  const lines = S.append('g').attr('class', 'slines' + (state.person && sel.includes(state.person) ? ' hot' : ''));
  const names = [];
  for (const n of sel) {
    const evs = liveOn(n).map(i => EVENTS[i]).sort((a, b) => EV_STEP[a.i] - EV_STEP[b.i]);
    if (!evs.length) continue;
    const P = evs.map(e => [xCol(colOf.get(e.i)), yRow(rowOf.get(e.j)) + off.get(n + '|' + e.i)]);
    let d = `M${P[0][0] - 10},${P[0][1]}L${P[0][0]},${P[0][1]}`;
    for (let k = 1; k < P.length; k++) {
      const [xa, ya] = P[k - 1], [xb, yb] = P[k];
      if (xb - xa > COLW * 1.6) { const xm = xb - COLW * 0.95; d += `L${xm},${ya}C${xm + COLW * .5},${ya} ${xb - COLW * .45},${yb} ${xb},${yb}`; }
      else { const xm = (xa + xb) / 2; d += `C${xm},${ya} ${xm},${yb} ${xb},${yb}`; }
    }
    const last = P[P.length - 1]; d += `L${last[0] + 10},${last[1]}`;
    const g = lines.append('g').attr('class', 'sline' + (state.person === n ? ' on' : '')).attr('data-p', n).style('--pc', pColor(n));
    g.append('path').attr('class', 'shalo').attr('d', d);
    g.append('path').attr('class', 'sstroke').attr('d', d);
    names.push({ n, x: P[0][0] - 13, y: P[0][1], end: false }, { n, x: last[0] + 13, y: last[1], end: true });
    g.on('mouseenter', () => { lines.classed('hover', true); labs.classed('hover', true); g.classed('hov', true); labs.selectAll(`[data-p="${CSS.escape(n)}"]`).classed('hov', true); })
      .on('mouseleave', () => { lines.classed('hover', false); labs.classed('hover', false); g.classed('hov', false); labs.selectAll('.sline').classed('hov', false); hideTip(); })
      .on('mousemove', ev => showTip(ev, `<b>${esc(n)}</b><div class="s">${esc(PEOPLE.get(n).life)} · 共 ${evs.length} 个事件</div>`))
      .on('click', () => openPerson(n));
  }

  // 事件节点
  const nodes = S.append('g'), nodeBox = [];
  for (const e of COLS) {
    const x = xCol(colOf.get(e.i)), y = yRow(rowOf.get(e.j));
    const os = sel.filter(n => e.who.includes(n) && !isPost(e, n)).map(n => off.get(n + '|' + e.i));
    const lo = os.length ? Math.min(...os) : 0, hi = os.length ? Math.max(...os) : 0;
    nodeBox.push({ x0: x - 7, x1: x + 7, y0: y + lo - 7, y1: y + hi + 7 });
    const g = nodes.append('g').attr('class', 'snode ' + e.k + (state.sel === e.i ? ' sel' : '')).attr('data-e', e.i);
    g.append('rect').attr('x', x - 6).attr('y', y + lo - 6).attr('width', 12).attr('height', hi - lo + 12).attr('rx', 6);
    g.on('mousemove', ev => showTip(ev, `<b>${esc(e.t)}</b><div class="s">${fmtYear(e.y)} 年 · ${esc(e.p)}（${esc(e.m)}）· ${esc(SEEDS[e.j].z + SEEDS[e.j].n)}</div><div>${e.who.map(w => sel.includes(w) && !isPost(e, w) ? `<span style="color:${pColor(w)}">●</span>${w}` : w).join('、')}</div>`))
      .on('mouseleave', hideTip).on('click', () => openEvent(e.i));
  }
  // 人名放在最上层（不被别的线、节点压住）；同一处起止的人名互相错开：按横向先后逐个放，与已放的重叠就上下挪一行
  const labs = S.append('g').attr('class', lines.attr('class'));
  // 人名也避开事件节点（圆点）
  const boxes = nodeBox.slice(), hit = b => boxes.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  for (const L of names.sort((a, b) => a.x - b.x || a.y - b.y)) {
    const w = NAMEW(L.n), x0 = L.end ? L.x : L.x - w, x1 = L.end ? L.x + w : L.x;
    let dy = 0;
    for (const t of [0, -13, 13, -26, 26, -39, 39]) { const y = L.y + t; if (y - 9 < HEAD - 4 || y + 6 > H) continue; if (!hit({ x0, x1, y0: y - 9, y1: y + 4 })) { dy = t; break; } }
    boxes.push({ x0, x1, y0: L.y + dy - 9, y1: L.y + dy + 4 });
    labs.append('g').attr('class', 'sline' + (state.person === L.n ? ' on' : '')).attr('data-p', L.n).style('--pc', pColor(L.n))
      .append('text').attr('class', 'sname' + (L.end ? ' end' : '')).attr('x', L.x).attr('y', L.y + dy + 4).text(L.n)
      .on('click', () => openPerson(L.n));
  }
  storyCursor(false);
}
function storyCursor(scroll = true) {
  if (story.hidden || !geom) return;
  const st = STEPS[state.step];
  // 当前一步的事件不在交汇图上（另一条线的事件、交汇图未选的人物）时，光标落在其后的第一列之前
  const onCol = st.ev != null && colOf.has(st.ev);
  let k = onCol ? colOf.get(st.ev) : COLS.findIndex(e => EV_STEP[e.i] > state.step);
  const between = !onCol;
  if (k < 0) k = COLS.length;
  const x = geom.xCol(k) - COLW / 2 - (between ? COLW / 2 : 0);
  d3.select('#s-cursor').attr('x', between ? x + COLW / 2 - 2 : x).attr('width', between ? 4 : COLW);
  d3.select(sScroll).selectAll('.snode').classed('sel', function () { return +this.dataset.e === state.sel; });
  d3.select(sScroll).selectAll('.sev-t').classed('on', function () { return +this.dataset.c === st.ev; });
  if (scroll) {
    const vw = sScroll.clientWidth, sl = sScroll.scrollLeft;
    if (x < sl + 40 || x > sl + vw - 80) sScroll.scrollTo({ left: Math.max(0, x - vw / 2), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
}
function storyFocus(n) {
  if (story.hidden || !n) return;
  if (!sel.includes(n) && storyable(n)) { sel = sel.concat(n); saveSel(); renderChips(); }
  renderStory();
}

// 视图切换：地图 / 人物交汇
function setMode(m) {
  state.mode = m;
  $('#mapwrap').hidden = m !== 'map';
  story.hidden = m !== 'story';
  $('.toggles').hidden = m !== 'map';
  document.querySelectorAll('#viewsw button').forEach(b => { b.classList.toggle('on', b.dataset.mode === m); b.setAttribute('aria-pressed', b.dataset.mode === m); });
  hideTip();
  // 切到交汇图时，地图上已选中的人物加入交汇图
  if (m === 'story') { if (state.person && !sel.includes(state.person) && storyable(state.person)) { sel = sel.concat(state.person); saveSel(); } renderChips(); renderStory(); storyCursor(); }
}
$('#viewsw').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setMode(b.dataset.mode); });
addEventListener('resize', () => { if (!story.hidden) renderStory(); });
