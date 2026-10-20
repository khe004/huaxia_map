// ---------- 人物交汇图：横轴为事件（时间顺序），纵轴为地点（按州、郡），人物画成线 ----------
const story = $('#story'), sLeft = $('#s-left'), sScroll = $('#s-scroll'), sBody = $('#s-body'), sChips = $('#s-chips');
const ZHOU_ORDER = B.regions?.order || [];
function nearestSeed([lon, lat]) {
  let best = -1, bd = Infinity;
  SEEDS.forEach((s, i) => { if (s.z === 'x') return; const dx = (s.lon - lon) * Math.cos(lat * Math.PI / 180), dy = s.lat - lat, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } });
  return best;
}
EVENTS.forEach(e => { e.j = nearestSeed(e.ll); });
const ROWS = [...new Set(EVENTS.map(e => e.j))]
  .sort((a, b) => (ZHOU_ORDER.indexOf(SEEDS[a].z) + 1 || 99) - (ZHOU_ORDER.indexOf(SEEDS[b].z) + 1 || 99) || SEEDS[a].z.localeCompare(SEEDS[b].z) || SEEDS[b].lat - SEEDS[a].lat);
const rowOf = new Map(ROWS.map((j, k) => [j, k]));
const COLS = EV_SORTED, colOf = new Map(COLS.map((e, k) => [e.i, k]));
const COLW = 46, HEAD = 94, PADX = 24;
const PCOL = ['#d1495b', '#2f7fbf', '#e09f1f', '#2a9d8f', '#8d6cab', '#e0602f', '#5aa83c', '#c2569b', '#7a6a4f', '#3fb6d6', '#a83232', '#6b7fd7'];
const DEFAULT_SEL = (B.storyDefault || [...PEOPLE.values()].sort((a, b) => b.ev.length - a.ev.length).slice(0, 10).map(p => p.n)).filter(n => PEOPLE.has(n));
const STORE = `yutu-${B.id}-story`;
let sel = DEFAULT_SEL.slice();
try { const v = JSON.parse(localStorage.getItem(STORE)); if (Array.isArray(v) && v.every(n => PEOPLE.has(n))) sel = v; } catch (e) { /* 无本地存储时用默认 */ }
const saveSel = () => { try { localStorage.setItem(STORE, JSON.stringify(sel)); } catch (e) { /* ignore */ } };
const pColor = n => PCOL[sel.indexOf(n) % PCOL.length];
const shortT = t => { const s = t.split(' · ')[0]; return s.length > 6 ? s.slice(0, 6) : s; };
let geom = null;

function renderChips() {
  const list = [...PEOPLE.values()].filter(p => p.ev.length >= 2).sort((a, b) => b.ev.length - a.ev.length);
  sChips.innerHTML = list.map(p => {
    const on = sel.includes(p.n);
    return `<button class="schip${on ? ' on' : ''}" data-sp="${p.n}" style="${on ? `--pc:${pColor(p.n)}` : ''}">${p.n}<small>${p.ev.length}</small></button>`;
  }).join('');
}
sChips.addEventListener('click', e => {
  const b = e.target.closest('[data-sp]'); if (!b) return;
  const n = b.dataset.sp; sel = sel.includes(n) ? sel.filter(x => x !== n) : sel.concat(n);
  saveSel(); renderChips(); renderStory();
});
$('#s-reset').onclick = () => { sel = DEFAULT_SEL.slice(); saveSel(); renderChips(); renderStory(); };
$('#s-clear').onclick = () => { sel = []; saveSel(); renderChips(); renderStory(); };

function renderStory() {
  if (story.hidden) return;
  // 行高按可用高度计算，扣掉横向滚动条，使常见屏幕上无需上下滚动
  const sb = sScroll.offsetHeight - sScroll.clientHeight || 12;
  const avail = sBody.clientHeight - sb - 2;
  const RH = Math.max(12, Math.min(34, Math.floor((avail - HEAD) / ROWS.length)));
  const H = HEAD + ROWS.length * RH, WD = PADX * 2 + COLS.length * COLW;
  const yRow = k => HEAD + k * RH + RH / 2, xCol = k => PADX + k * COLW + COLW / 2;
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
    S.append('text').attr('class', 'sphase-t').attr('x', x0 + 6).attr('y', 13).text(`${n} ${fmtYear(a)}–${fmtYear(b)}`);
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
    const ps = sel.filter(n => e.who.includes(n));
    ps.forEach((n, i) => off.set(n + '|' + e.i, (i - (ps.length - 1) / 2) * gap));
  }
  const lines = S.append('g').attr('class', 'slines' + (state.person && sel.includes(state.person) ? ' hot' : ''));
  for (const n of sel) {
    const evs = PEOPLE.get(n).ev.map(i => EVENTS[i]).sort((a, b) => EV_STEP[a.i] - EV_STEP[b.i]);
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
    g.append('text').attr('class', 'sname').attr('x', P[0][0] - 13).attr('y', P[0][1] + 4).text(n);
    g.append('text').attr('class', 'sname end').attr('x', last[0] + 13).attr('y', last[1] + 4).text(n);
    g.on('mouseenter', () => { lines.classed('hover', true); g.classed('hov', true); })
      .on('mouseleave', () => { lines.classed('hover', false); g.classed('hov', false); hideTip(); })
      .on('mousemove', ev => showTip(ev, `<b>${n}</b><div class="s">${PEOPLE.get(n).life} · 共 ${evs.length} 个事件</div>`))
      .on('click', () => openPerson(n));
  }

  // 事件节点
  const nodes = S.append('g');
  for (const e of COLS) {
    const x = xCol(colOf.get(e.i)), y = yRow(rowOf.get(e.j));
    const os = sel.filter(n => e.who.includes(n)).map(n => off.get(n + '|' + e.i));
    const lo = os.length ? Math.min(...os) : 0, hi = os.length ? Math.max(...os) : 0;
    const g = nodes.append('g').attr('class', 'snode ' + e.k + (state.sel === e.i ? ' sel' : '')).attr('data-e', e.i);
    g.append('rect').attr('x', x - 6).attr('y', y + lo - 6).attr('width', 12).attr('height', hi - lo + 12).attr('rx', 6);
    g.on('mousemove', ev => showTip(ev, `<b>${e.t}</b><div class="s">${fmtYear(e.y)} 年 · ${e.p}（${e.m}）· ${SEEDS[e.j].z}${SEEDS[e.j].n}</div><div>${e.who.map(w => sel.includes(w) ? `<span style="color:${pColor(w)}">●</span>${w}` : w).join('、')}</div>`))
      .on('mouseleave', hideTip).on('click', () => openEvent(e.i));
  }
  storyCursor(false);
}
function storyCursor(scroll = true) {
  if (story.hidden || !geom) return;
  const st = STEPS[state.step];
  let k = st.ev != null ? colOf.get(st.ev) : COLS.findIndex(e => EV_STEP[e.i] > state.step);
  const between = st.ev == null;
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
  if (story.hidden) return;
  if (!sel.includes(n)) { sel = sel.concat(n); saveSel(); renderChips(); }
  renderStory();
}

// 视图切换：地图 / 人物交汇
function setMode(m) {
  state.mode = m;
  $('#mapwrap').hidden = m !== 'map';
  story.hidden = m !== 'story';
  $('.toggles').hidden = m !== 'map';
  document.querySelectorAll('#viewsw button').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
  hideTip();
  if (m === 'story') { renderChips(); renderStory(); storyCursor(); }
}
$('#viewsw').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setMode(b.dataset.mode); });
addEventListener('resize', () => { if (!story.hidden) renderStory(); });
