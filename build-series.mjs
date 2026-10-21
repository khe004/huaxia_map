// 组装合集：node build-series.mjs
// 按 series.json 的卷目逐卷以 --series 方式构建到 dist/series/<书>/，再生成目录页 dist/series/index.html。
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
const r = f => readFileSync(new URL(f, import.meta.url), 'utf8');
const S = JSON.parse(r('./series.json'));
const cn = n => { const D = '〇一二三四五六七八九', t = Math.floor(n / 10), o = n % 10; return n < 10 ? D[n] : (t === 1 ? '' : D[t]) + '十' + (o ? D[o] : ''); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const fy = y => (y < 0 ? `前 ${-y}` : `${y}`);
let prevLast = null;
// 目录页检索用的索引：全部事件与人物（跨卷人物合为一条，列出所在各卷）
const pcx = {}; vm.createContext(pcx); vm.runInContext(r('./books/_people.js') + ';this.PC = PEOPLE_COMMON;', pcx);
const plain = s => String(s).replace(/\*\*(?:[^|*]{1,6}\|)?([^*]*)\*\*/g, '“$1”').replace(/““/g, '“').replace(/””/g, '”');
const IDX = { books: [], events: [], people: {} };
const rows = S.books.map((b, i) => {
  execFileSync('node', [new URL('./build.mjs', import.meta.url).pathname, b.id, '--series'], { stdio: 'inherit' });
  const c = {}; vm.createContext(c);
  vm.runInContext(r(`./books/${b.id}/book.js`) + '\n;this.__ = { BOOK, EVENTS, PEOPLE_RAW, FACTIONS };', c);
  const { BOOK, EVENTS, PEOPLE_RAW, FACTIONS } = c.__;
  IDX.books.push([b.id, BOOK.brand, BOOK.approxBefore ?? null]);
  const evOf = new Map();
  for (const e of EVENTS) {
    IDX.events.push([i, e.y, e.mo, e.t, e.p, e.m, e.k, e.who.join('、'), plain(e.d), e.cal || '']);
    // 人物的各卷事件数只计在世时的事件（post 身后出场不算）
    for (const n of e.who) if (!(e.post || []).includes(n)) evOf.set(n, (evOf.get(n) || []).concat(e));
  }
  for (const [n, f, zi, life, bio] of PEOPLE_RAW) {
    const cm = pcx.PC[n], es = (evOf.get(n) || []).sort((u, v) => u.y - v.y || u.mo - v.mo), t = es.length ? es[0].y + (es[0].mo - 1) / 12 : BOOK.range[0];
    let fn = f; try { fn = FACTIONS[f].name(t).replace(/（[^）]*）/g, ''); } catch (err) {}
    const P = IDX.people[n] || (IDX.people[n] = [cm ? cm[0] : zi, cm ? cm[1] : life, plain(cm ? cm[2] : bio), []]);
    if (!cm && bio && !P[2]) P[2] = plain(bio);
    // [卷序, 势力名, 在世事件数, 首个在世事件的时间]：人物页签按首次出场先后排列
    P[3].push([i, fn, es.length, es.length ? +t.toFixed(3) : null]);
  }
  // 与上一卷时间重叠（上卷末事件晚于本卷首事件）时，在年份后注明
  const es = EVENTS.slice().sort((u, v) => u.y - v.y || u.mo - v.mo), f = es[0], l = es[es.length - 1];
  const ov = prevLast && prevLast.y + (prevLast.mo - 1) / 12 > f.y + (f.mo - 1) / 12 ? `与上卷重叠 ${f.y === prevLast.y ? fy(f.y) + ' 年' : fy(f.y) + ' – ' + fy(prevLast.y)}` : '';
  prevLast = l;
  return `<li${b.era !== S.books[i - 1]?.era ? ' class="era-start"' : ''}>
  <span class="era">${b.era !== S.books[i - 1]?.era ? esc(b.era) : ''}</span>
  <a class="vol" href="${b.id}/index.html?at=start">
    <span class="seal">${esc(BOOK.seal || b.era[0])}</span>
    <span class="body">
      <span class="no">卷${cn(i + 1)}</span>
      <span class="name">${esc(BOOK.brand)}</span>
      <span class="yrs">${esc(b.years)}${ov ? `<em class="ovl">${ov}</em>` : ''}</span>
      <span class="blurb">${esc(b.blurb)}</span>
      <span class="meta">${EVENTS.length} 事件 · ${PEOPLE_RAW.length} 人物</span>
    </span>
    <span class="go" aria-hidden="true">›</span>
  </a>
</li>`;
});
const searchJs = `(() => {
const CN = n => { const D = '〇一二三四五六七八九', t = Math.floor(n / 10), o = n % 10; return n < 10 ? D[n] : (t === 1 ? '' : D[t]) + '十' + (o ? D[o] : ''); };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const B = IDX.books, vol = k => '卷' + CN(k + 1);
const fy = (y, k) => (B[k][2] != null && y < B[k][2] ? '约' : '') + (y < 0 ? '前' + -y : y);
const KN = { war: '战事', pol: '政事', dip: '外交' };
const EV = IDX.events.map(([k, y, mo, t, p, m, kind, who, d, cal]) => ({ k, y, mo, t, p, m, kind, who, d, cal }));
const PP = Object.entries(IDX.people).map(([n, [zi, life, bio, bk]]) => ({ n, zi, life, bio, bk, ne: bk.reduce((a, b) => a + b[2], 0) }));
const $ = s => document.querySelector(s), q = $('#q'), res = $('#res'), opts = $('#sopts'), cnt = $('#cnt'), volSel = $('#vol');
// 页签：卷目 / 人物 / 事件 / 检索，当前页签与筛选记在地址的 # 后面
const TABS = ['vols', 'people', 'events', 'search'], tabs = [...document.querySelectorAll('[role=tab]')];
const pf = { v: '', x: false }, ef = { v: '', k: 'all' }, done = {};
function setHash(tab) {
  let h = tab === 'vols' ? '' : 'tab=' + tab;
  if (tab === 'people') h += (pf.v !== '' ? '&v=' + pf.v : '') + (pf.x ? '&x=1' : '');
  if (tab === 'events') h += (ef.v !== '' ? '&v=' + ef.v : '') + (ef.k !== 'all' ? '&k=' + ef.k : '');
  try { history.replaceState(null, '', h ? '#' + h : location.pathname + location.search); } catch (err) {}
}
function show(tab, keep) {
  tabs.forEach(b => { const on = b.dataset.tab === tab; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; $('#' + b.getAttribute('aria-controls')).hidden = !on; });
  if (tab === 'people' && !done.p) { done.p = 1; renderP(); }
  if (tab === 'events' && !done.e) { done.e = 1; renderE(); }
  if (!keep) { if (tab === 'search') run(); else setHash(tab); }
}
$('#tabs').addEventListener('click', ev => { const b = ev.target.closest('[role=tab]'); if (b) show(b.dataset.tab); });
$('#tabs').addEventListener('keydown', ev => { const i = tabs.indexOf(document.activeElement), d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
  if (i < 0 || !d) return; ev.preventDefault(); const b = tabs[(i + d + tabs.length) % tabs.length]; b.focus(); show(b.dataset.tab); });
const head = (k, n, unit) => '<h3><span class="hv">' + vol(k) + '</span>' + esc(B[k][1]) + '<small>' + n + ' ' + unit + '</small></h3>';
function renderP() {
  const v = pf.v === '' ? null : +pf.v, g = new Map();
  for (const p of PP) {
    if (pf.x && p.bk.length < 2) continue;
    const b = v != null ? p.bk.find(b => b[0] === v) : p.bk[0]; if (!b) continue;
    (g.get(b[0]) || g.set(b[0], []).get(b[0])).push([p, b]);
  }
  let n = 0, h = '';
  for (const [k, arr] of [...g].sort((a, b) => a[0] - b[0])) {
    arr.sort((a, b) => (a[1][3] ?? 1e9) - (b[1][3] ?? 1e9)); n += arr.length;
    h += '<section class="grp">' + head(k, arr.length, '位') + '<div class="pg">' + arr.map(([p, b]) => {
      const k0 = v != null ? v : p.bk.slice().sort((a, b) => b[2] - a[2])[0][0];
      return '<a class="pc" href="' + pHref(p.n, k0) + '" title="' + esc((p.zi ? '字' + p.zi + '。' : '') + p.bio) + '"><b>' + esc(p.n) + '</b>' + (p.life ? '<span>' + esc(p.life) + '</span>' : '')
        + (p.bk.length > 1 ? '<i title="出现在 ' + p.bk.map(b => vol(b[0])).join('、') + '">' + p.bk.length + ' 卷</i>' : '') + '</a>'; }).join('') + '</div></section>';
  }
  $('#pcnt').textContent = n + ' 位人物';
  $('#plist').innerHTML = h || '<p class="empty">没有符合条件的人物。</p>';
}
function renderE() {
  const v = ef.v === '' ? null : +ef.v, g = new Map();
  for (const e of EV) if ((v == null || e.k === v) && (ef.k === 'all' || e.kind === ef.k)) (g.get(e.k) || g.set(e.k, []).get(e.k)).push(e);
  let n = 0, h = '';
  for (const [k, arr] of [...g].sort((a, b) => a[0] - b[0])) {
    arr.sort((a, b) => a.y - b.y || a.mo - b.mo); n += arr.length;
    h += '<section class="grp">' + head(k, arr.length, '个') + '<div class="el">' + arr.map(e => '<a class="er" href="' + evHref(e) + '"' + (e.cal ? ' title="' + esc(e.cal) + '"' : '') + '><span class="y">' + fy(e.y, e.k) + '</span><span class="t"><i class="k ' + e.kind + '" title="' + KN[e.kind] + '"></i>' + esc(e.t) + '</span><span class="pl">' + esc(e.p) + '</span></a>').join('') + '</div></section>';
  }
  $('#ecnt').textContent = n + ' 个事件';
  $('#elist').innerHTML = h || '<p class="empty">没有符合条件的事件。</p>';
}
$('#pvol').addEventListener('change', ev => { pf.v = ev.target.value; renderP(); setHash('people'); });
$('#pcross').addEventListener('click', ev => { pf.x = !pf.x; ev.currentTarget.setAttribute('aria-pressed', pf.x); renderP(); setHash('people'); });
$('#evol').addEventListener('change', ev => { ef.v = ev.target.value; renderE(); setHash('events'); });
$('#ekind').addEventListener('click', ev => { const b = ev.target.closest('button[data-k]'); if (!b) return; ef.k = b.dataset.k;
  $('#ekind').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); renderE(); setHash('events'); });
let filt = 'all', lim = { p: 12, e: 30 };
const mk = (s, terms) => { let h = esc(s); for (const t of terms) h = h.split(esc(t)).join('\\u0002' + esc(t) + '\\u0003'); return h.replace(/\\u0002/g, '<mark>').replace(/\\u0003/g, '</mark>'); };
const snip = (s, terms, n = 46) => { let i = -1; for (const t of terms) { const j = s.indexOf(t); if (j >= 0 && (i < 0 || j < i)) i = j; }
  if (i < 0) return s.length > n * 2 ? s.slice(0, n * 2) + '…' : s; const a = Math.max(0, i - n), b = Math.min(s.length, i + n);
  return (a ? '…' : '') + s.slice(a, b) + (b < s.length ? '…' : ''); };
const evHref = e => B[e.k][0] + '/index.html?ev=' + encodeURIComponent(e.t);
const pHref = (n, k) => B[k][0] + '/index.html?p=' + encodeURIComponent(n);
function scoreP(p, terms) { let s = 0; for (const t of terms) {
  if (p.n === t) s += 100; else if (p.n.startsWith(t)) s += 60; else if (p.n.includes(t)) s += 40; else if (p.zi && p.zi.includes(t)) s += 30;
  else if (p.bio.includes(t) || p.bk.some(b => b[1].includes(t))) s += 5; else return 0; } return s + Math.min(p.ne, 20) / 10; }
function scoreE(e, terms) { let s = 0; for (const t of terms) {
  if (e.t.includes(t)) s += 50; else if (e.who.split('、').includes(t)) s += 30; else if (e.p.includes(t) || e.m.includes(t) || e.cal.includes(t)) s += 20;
  else if (e.who.includes(t)) s += 15; else if (e.d.includes(t)) s += 5; else return 0; } return s; }
function run() {
  const raw = q.value.trim(), terms = raw.split(/\\s+/).filter(Boolean), v = volSel.value === '' ? null : +volSel.value;
  try { history.replaceState(null, '', raw ? '#q=' + encodeURIComponent(raw) + (v != null ? '&v=' + v : '') : '#tab=search'); } catch (err) {}
  const on = terms.length > 0; res.hidden = opts.hidden = !on; $('#shint').hidden = on; if (!on) return;
  const psS = filt === 'e' ? [] : PP.filter(p => v == null || p.bk.some(b => b[0] === v)).map(p => [p, scoreP(p, terms)]).filter(x => x[1]).sort((a, b) => b[1] - a[1]), ps = psS.map(x => x[0]);
  const esS = filt === 'p' ? [] : EV.filter(e => v == null || e.k === v).map(e => [e, scoreE(e, terms)]).filter(x => x[1]).sort((a, b) => b[1] - a[1] || a[0].y - b[0].y || a[0].mo - b[0].mo), es = esS.map(x => x[0]);
  // 两类都有结果时，人物只先列 6 位；最佳匹配更好的一类排在前面
  const lp = filt === 'all' && es.length && lim.p < 1e9 ? 6 : lim.p, evFirst = esS.length && (!psS.length || esS[0][1] > psS[0][1]);
  cnt.textContent = (filt !== 'e' ? ps.length + ' 位人物' : '') + (filt === 'all' ? ' · ' : '') + (filt !== 'p' ? es.length + ' 个事件' : '');
  let hp = '', he = '';
  if (ps.length) hp = '<div><h2><span>人物</span></h2><div class="rl">' + ps.slice(0, lp).map(p => { const k0 = (v != null ? p.bk.find(b => b[0] === v) : p.bk.slice().sort((a, b) => b[2] - a[2])[0])[0];
    return '<div class="hit" data-href="' + pHref(p.n, k0) + '"><span class="y">' + esc(p.life || '') + '</span><a class="t" href="' + pHref(p.n, k0) + '">' + mk(p.n, terms) + (p.zi ? '<small>字' + mk(p.zi, terms) + '</small>' : '') + '</a>'
      + '<span class="s">' + mk(snip(p.bio, terms), terms) + '</span><span class="m">' + p.bk.map(([k, f, n]) => '<a class="vb" href="' + pHref(p.n, k) + '" title="' + esc(B[k][1]) + ' · ' + esc(f) + ' · ' + n + ' 个事件">' + vol(k) + ' ' + esc(B[k][1]) + '</a>').join('') + '</span></div>'; }).join('')
    + '</div>' + (ps.length > lp ? '<button class="more" data-more="p">显示全部 ' + ps.length + ' 位 ›</button>' : '') + '</div>';
  if (es.length) he = '<div><h2><span>事件</span></h2><div class="rl">' + es.slice(0, lim.e).map(e => '<a class="hit" href="' + evHref(e) + '"><span class="y">' + fy(e.y, e.k) + '</span><span class="t"><i class="k ' + e.kind + '"></i>' + mk(e.t, terms) + '</span>'
      + '<span class="s">' + mk(snip(e.d, terms), terms) + '</span><span class="m"><span>' + vol(e.k) + '《' + esc(B[e.k][1]) + '》</span><span>' + mk(e.p + '（' + e.m + '）', terms) + '</span><span>' + KN[e.kind] + '</span>' + (e.who ? '<span>' + mk(e.who.length > 40 ? e.who.slice(0, 40) + '…' : e.who, terms) + '</span>' : '') + '</span></a>').join('')
    + '</div>' + (es.length > lim.e ? '<button class="more" data-more="e">显示全部 ' + es.length + ' 个 ›</button>' : '') + '</div>';
  const h = evFirst ? he + hp : hp + he;
  res.innerHTML = h || '<p class="empty">没有找到“' + esc(raw) + '”。可以换个写法，如人名、字、古地名、今地名或年号。</p>';
  kb = -1;
}
let kb = -1, timer;
q.addEventListener('input', () => { lim = { p: 12, e: 30 }; clearTimeout(timer); timer = setTimeout(run, 80); });
volSel.addEventListener('change', run);
opts.addEventListener('click', ev => { const b = ev.target.closest('button[data-f]'); if (!b) return; filt = b.dataset.f; opts.querySelectorAll('button[data-f]').forEach(x => x.setAttribute('aria-pressed', x === b)); run(); });
res.addEventListener('click', ev => { const b = ev.target.closest('[data-more]'); if (b) { lim[b.dataset.more] = 1e9; run(); return; }
  const h = ev.target.closest('div.hit'); if (h && !ev.target.closest('a')) location.href = h.dataset.href; });
q.addEventListener('keydown', ev => { const hs = [...res.querySelectorAll('.hit')]; if (!hs.length) return;
  if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') { ev.preventDefault(); kb = Math.max(0, Math.min(hs.length - 1, kb + (ev.key === 'ArrowDown' ? 1 : -1))); hs.forEach((h, i) => h.classList.toggle('kb', i === kb)); hs[kb].scrollIntoView({ block: 'nearest' }); }
  if (ev.key === 'Enter') { const h = hs[kb >= 0 ? kb : 0]; location.href = h.dataset.href || h.href; }
  if (ev.key === 'Escape') { q.value = ''; run(); } });
document.addEventListener('keydown', ev => { if (ev.key === '/' && document.activeElement !== q && !/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName)) { ev.preventDefault(); show('search'); q.focus(); } });
const hp = new URLSearchParams(location.hash.slice(1)), t0 = hp.get('q') ? 'search' : TABS.includes(hp.get('tab')) ? hp.get('tab') : 'vols';
if (t0 === 'search' && hp.get('q')) { q.value = hp.get('q'); if (hp.get('v') != null) volSel.value = hp.get('v'); }
if (t0 === 'people') { pf.v = $('#pvol').value = hp.get('v') ?? ''; pf.x = hp.get('x') === '1'; $('#pcross').setAttribute('aria-pressed', pf.x); }
if (t0 === 'events') { ef.v = $('#evol').value = hp.get('v') ?? ''; const k = hp.get('k'); if (KN[k]) { ef.k = k; $('#ekind').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x.dataset.k === k)); } }
show(t0, true); if (t0 === 'search') run();
})();`;
const html = `<title>${esc(S.title)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@500;700;900&display=swap">
<style>
:root {
  --bg: #e6e8e1; --panel: #f7f7f2; --chip: #ebece5; --ink: #1c2125; --ink2: #49525a; --muted: #747d84; --line: #b3bbba;
  --seal: #b3322a; --land: #f3f2eb; --hl: #d8941c; --dip: #2a7068;
  --f-display: "Ma Shan Zheng", "STKaiti", "KaiTi", serif;
  --f-serif: "Noto Serif SC", "Songti SC", "SimSun", serif;
  --f-sans: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --bg: #0f1317; --panel: #141920; --chip: #1f262c; --ink: #e8e5db; --ink2: #bcb9af; --muted: #868b8e; --line: #343d44; --seal: #e3624f; --land: #232a30; --hl: #f0b43c; --dip: #5fb3a6; color-scheme: dark; }
}
:root[data-theme="dark"] { --bg: #0f1317; --panel: #141920; --chip: #1f262c; --ink: #e8e5db; --ink2: #bcb9af; --muted: #868b8e; --line: #343d44; --seal: #e3624f; --land: #232a30; --hl: #f0b43c; --dip: #5fb3a6; color-scheme: dark; }
body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--f-sans); font-size: 14px; }
:focus-visible { outline: 2px solid var(--hl); outline-offset: 2px; }
main { max-width: 760px; margin: 0 auto; padding: 40px max(16px, env(safe-area-inset-left, 0px)) 56px; }
h1 { margin: 0; font-family: var(--f-display); font-weight: 400; font-size: 44px; letter-spacing: .06em; line-height: 1.1; }
h1 .seal { display: inline-grid; place-items: center; width: 38px; height: 38px; margin-left: 8px; background: var(--seal); color: var(--land); font-size: 22px; border-radius: 4px; vertical-align: 6px; }
.sub { margin: 10px 0 0; color: var(--muted); letter-spacing: .06em; }
.start { display: inline-block; margin-top: 20px; padding: 8px 18px; border-radius: 6px; background: var(--seal); color: var(--land); text-decoration: none; font-weight: 500; }
.start:hover { filter: brightness(1.08); }
ol { list-style: none; margin: 32px 0 0; padding: 0; display: grid; gap: 10px; }
li { display: grid; grid-template-columns: 56px minmax(0, 1fr); gap: 12px; align-items: stretch; }
li.era-start:not(:first-child) { margin-top: 14px; }
.era { font-family: var(--f-display); font-size: 24px; color: var(--seal); padding-top: 14px; text-align: right; }
.vol { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 14px; align-items: center; padding: 14px 16px; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; color: inherit; text-decoration: none; transition: border-color .15s, transform .15s; }
.vol:hover { border-color: var(--seal); transform: translateX(2px); }
.vol .seal { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 4px; background: var(--chip); color: var(--seal); font-family: var(--f-display); font-size: 20px; }
.ovl { font-style: normal; color: var(--hl); margin-left: 8px; }
.body { display: grid; grid-template-columns: auto auto minmax(0, 1fr); column-gap: 10px; row-gap: 3px; align-items: baseline; }
.no { color: var(--muted); font-size: 12.5px; }
.name { font-family: var(--f-serif); font-weight: 700; font-size: 18px; }
.yrs { color: var(--ink2); font-size: 13px; }
.blurb { grid-column: 1 / -1; color: var(--ink2); }
.meta { grid-column: 1 / -1; color: var(--muted); font-size: 12px; }
.go { color: var(--muted); font-size: 22px; }
.vol:hover .go { color: var(--seal); }
.note { margin-top: 28px; color: var(--muted); font-size: 12.5px; line-height: 1.8; }
.tabs { display: flex; gap: 4px; margin-top: 28px; border-bottom: 1px solid var(--line); overflow-x: auto; }
.tabs button { font: inherit; font-family: var(--f-serif); font-weight: 700; font-size: 16px; letter-spacing: .1em; padding: 8px 16px 9px; margin-bottom: -1px; border: 0; border-bottom: 2px solid transparent; background: none; color: var(--muted); cursor: pointer; white-space: nowrap; }
.tabs button:hover { color: var(--ink); }
.tabs button[aria-selected="true"] { color: var(--seal); border-bottom-color: var(--seal); }
.panel { margin-top: 18px; }
.panel[hidden] { display: none; }
.vols ol { margin-top: 0; }
.panel > .sopts:first-child { margin: 0 0 6px; }
.seg { display: inline-flex; gap: 6px; flex-wrap: wrap; }
.sopts .k { margin-right: 5px; }
.grp { margin-top: 18px; }
.grp h3 { margin: 0 0 8px; font-family: var(--f-serif); font-size: 16px; font-weight: 700; display: flex; align-items: baseline; gap: 8px; position: sticky; top: 0; background: var(--bg); padding: 6px 0; z-index: 1; }
.grp h3 .hv { font-family: var(--f-sans); font-weight: 400; font-size: 12.5px; color: var(--seal); }
.grp h3 small { margin-left: auto; font-family: var(--f-sans); font-weight: 400; font-size: 12px; color: var(--muted); }
.pg { display: flex; flex-wrap: wrap; gap: 6px; }
.pc { display: inline-flex; align-items: baseline; gap: 6px; padding: 5px 10px; background: var(--panel); border: 1px solid var(--line); border-radius: 6px; color: inherit; text-decoration: none; }
.pc:hover { border-color: var(--seal); }
.pc b { font-family: var(--f-serif); font-weight: 700; font-size: 15px; }
.pc span { color: var(--muted); font-size: 11.5px; font-variant-numeric: tabular-nums; }
.pc i { font-style: normal; font-size: 11px; color: var(--seal); border: 1px solid color-mix(in srgb, var(--seal) 40%, transparent); border-radius: 999px; padding: 0 5px; }
.el { display: grid; }
.er { display: grid; grid-template-columns: 64px minmax(0, 1fr) auto; gap: 12px; align-items: baseline; padding: 6px 10px; margin-inline: -10px; border-radius: 6px; color: inherit; text-decoration: none; }
.er:hover { background: var(--chip); }
.er .y { color: var(--muted); font-size: 12.5px; font-variant-numeric: tabular-nums; }
.er .t { font-family: var(--f-serif); font-weight: 500; font-size: 15px; }
.er .pl { color: var(--muted); font-size: 12.5px; }
.k { display: inline-block; width: 7px; height: 7px; margin-right: 8px; vertical-align: 2px; background: var(--ink); border-radius: 50%; }
.k.war { background: var(--seal); border-radius: 0; transform: rotate(45deg); }
.k.dip { background: var(--dip); border-radius: 0; }
.sbox { position: relative; }
.sbox input { width: 100%; box-sizing: border-box; font: inherit; font-size: 15px; padding: 11px 14px 11px 38px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); color: var(--ink); }
.sbox input:focus { outline: none; border-color: var(--seal); box-shadow: 0 0 0 3px color-mix(in srgb, var(--seal) 18%, transparent); }
.sbox svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 17px; height: 17px; color: var(--muted); pointer-events: none; }
.sbox kbd { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font: 11px var(--f-sans); color: var(--muted); border: 1px solid var(--line); border-radius: 4px; padding: 1px 6px; }
.sbox input:not(:placeholder-shown) ~ kbd { display: none; }
.sopts { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 10px; font-size: 13px; }
.sopts button, .sopts select { font: inherit; font-size: 13px; border: 1px solid var(--line); background: var(--panel); color: var(--ink2); border-radius: 999px; padding: 3px 12px; cursor: pointer; }
.sopts button[aria-pressed="true"] { background: var(--ink); border-color: var(--ink); color: var(--land); }
.sopts select { border-radius: 6px; padding: 3px 8px; }
.sopts .cnt { margin-left: auto; color: var(--muted); font-size: 12.5px; }
.res { margin-top: 14px; display: grid; gap: 18px; }
.res[hidden], .vols[hidden] { display: none; }
.res h2 { margin: 0 0 6px; font-size: 13px; font-weight: 500; color: var(--muted); letter-spacing: .08em; display: flex; justify-content: space-between; }
.rl { display: grid; gap: 2px; }
.hit { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 2px 12px; padding: 9px 10px; margin-inline: -10px; border-radius: 6px; color: inherit; text-decoration: none; }
.hit:hover, .hit.kb { background: var(--chip); }
div.hit { cursor: pointer; }
.hit .y { color: var(--muted); font-size: 12.5px; font-variant-numeric: tabular-nums; padding-top: 2px; }
.hit .t { color: inherit; text-decoration: none; font-family: var(--f-serif); font-weight: 700; font-size: 15.5px; }
.hit .t small { font-family: var(--f-sans); font-weight: 400; font-size: 12.5px; color: var(--muted); margin-left: 6px; }
.hit .s { grid-column: 2; color: var(--ink2); font-size: 13px; line-height: 1.65; }
.hit .m { grid-column: 2; color: var(--muted); font-size: 12px; display: flex; flex-wrap: wrap; gap: 4px 8px; align-items: center; }
.hit .k { display: inline-block; width: 7px; height: 7px; margin-right: 6px; vertical-align: 2px; background: var(--ink); border-radius: 50%; }
.hit .k.war { background: var(--seal); border-radius: 0; transform: rotate(45deg); }
.hit .k.dip { background: var(--dip); border-radius: 0; }
.hit .vb { border: 1px solid var(--line); border-radius: 999px; padding: 0 8px; color: var(--ink2); text-decoration: none; font-size: 12px; }
.hit .vb:hover { border-color: var(--seal); color: var(--seal); }
mark { background: color-mix(in srgb, var(--hl) 35%, transparent); color: inherit; border-radius: 2px; padding: 0 1px; }
.more { font: inherit; font-size: 13px; margin-top: 6px; border: 0; background: none; color: var(--seal); cursor: pointer; padding: 4px 0; }
.empty { color: var(--muted); padding: 10px 0; }
@media (max-width: 520px) {
  main { padding-top: 24px; }
  h1 { font-size: 34px; }
  li { grid-template-columns: 1fr; gap: 4px; }
  .era { text-align: left; padding-top: 0; font-size: 20px; }
  .era:empty { display: none; }
  .body { grid-template-columns: auto minmax(0, 1fr); }
  .yrs { grid-column: 1 / -1; }
  .hit { grid-template-columns: 1fr; }
  .hit .s, .hit .m { grid-column: 1; }
  .tabs button { padding-inline: 12px; }
  .er { grid-template-columns: 52px minmax(0, 1fr); gap: 2px 10px; }
  .er .pl { grid-column: 2; }
}
@media (prefers-reduced-motion: reduce) { .vol { transition: none; } .vol:hover { transform: none; } }
</style>
<main>
  <h1>${esc(S.title)}<span class="seal">史</span></h1>
  <p class="sub">${esc(S.subtitle)}</p>
  <a class="start" href="${S.books[0].id}/index.html?at=start">从卷一读起 ›</a>
  <div class="tabs" id="tabs" role="tablist" aria-label="目录">
    <button type="button" role="tab" id="t-vols" data-tab="vols" aria-controls="vols" aria-selected="true">卷目</button><button type="button" role="tab" id="t-people" data-tab="people" aria-controls="people" aria-selected="false" tabindex="-1">人物</button><button type="button" role="tab" id="t-events" data-tab="events" aria-controls="events" aria-selected="false" tabindex="-1">事件</button><button type="button" role="tab" id="t-search" data-tab="search" aria-controls="search" aria-selected="false" tabindex="-1">检索</button>
  </div>
  <section class="panel" id="people" role="tabpanel" aria-labelledby="t-people" hidden>
    <div class="sopts"><select id="pvol" aria-label="限定卷"><option value="">全部卷（按首次出场分组）</option>${S.books.map((b, i) => `<option value="${i}">卷${cn(i + 1)} ${esc(IDX.books[i][1])}</option>`).join('')}</select><button type="button" id="pcross" aria-pressed="false">只看跨卷人物</button><span class="cnt" id="pcnt"></span></div>
    <div id="plist"></div>
  </section>
  <section class="panel" id="events" role="tabpanel" aria-labelledby="t-events" hidden>
    <div class="sopts"><span id="ekind" class="seg"><button type="button" data-k="all" aria-pressed="true">全部</button><button type="button" data-k="war" aria-pressed="false"><i class="k war"></i>战事</button><button type="button" data-k="pol" aria-pressed="false"><i class="k pol"></i>政事</button><button type="button" data-k="dip" aria-pressed="false"><i class="k dip"></i>外交</button></span><select id="evol" aria-label="限定卷"><option value="">全部卷</option>${S.books.map((b, i) => `<option value="${i}">卷${cn(i + 1)} ${esc(IDX.books[i][1])}</option>`).join('')}</select><span class="cnt" id="ecnt"></span></div>
    <div id="elist"></div>
  </section>
  <section class="panel search" id="search" role="tabpanel" aria-labelledby="t-search" hidden>
    <div class="sbox"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="q" type="search" placeholder="检索全部 ${IDX.events.length} 个事件、${Object.keys(IDX.people).length} 位人物：人名、字、地名、年号、事件……" autocomplete="off" aria-label="检索人物与事件"><kbd>/</kbd></div>
    <div class="sopts" id="sopts" hidden>
      <button type="button" data-f="all" aria-pressed="true">全部</button><button type="button" data-f="p" aria-pressed="false">人物</button><button type="button" data-f="e" aria-pressed="false">事件</button>
      <select id="vol" aria-label="限定卷"><option value="">全部卷</option>${S.books.map((b, i) => `<option value="${i}">卷${cn(i + 1)} ${esc(IDX.books[i][1])}</option>`).join('')}</select>
      <span class="cnt" id="cnt"></span>
    </div>
    <p class="empty" id="shint">可以输入人名、字、古地名、今地名、年号或事件中的词，多个词用空格隔开。在其他页签按 / 也能跳到这里。</p>
    <div class="res" id="res" hidden></div>
  </section>
  <div class="panel vols" id="vols" role="tabpanel" aria-labelledby="t-vols">
  <ol>
${rows.join('\n')}
  </ol>
  <p class="note">每卷页头有上一卷、下一卷和目录的链接。读到一卷的最后一个事件，时间轴右侧的“下一卷”按钮会亮起，点它从下一卷的开头接着读。</p>
  </div>
</main>
<script>
const IDX = ${JSON.stringify(IDX).replace(/</g, '\\u003c')};
${searchJs}
</script>
`;
writeFileSync(new URL('./dist/series/index.html', import.meta.url), html);
console.log('dist/series/index.html', S.books.length, '卷');
