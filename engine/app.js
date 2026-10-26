// 舆图引擎：读取 BOOK（书的配置与数据）和 BASEMAP（底图配置），不含任何具体某本书的内容。
(() => {
const B = BOOK;
const [W, H] = BASEMAP.size, [Y0, Y1] = B.range;
// 合集里的位置（单本构建时 SERIES 为 null）
const SER = SERIES && SERIES.books.findIndex(b => b.id === B.id) >= 0 ? SERIES : null;
const serIdx = SER ? SER.books.findIndex(b => b.id === B.id) : -1;
const $ = s => document.querySelector(s);
const KIND = { war: '战事', pol: '政事', dip: '外交' };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// 年份：公元前用负数，没有公元 0 年
// B.approxBefore：此年以前的年代只是约数，显示“约”，不推干支
const APPROX = y => B.approxBefore != null && y < B.approxBefore;
const fmtYear = y => (APPROX(y) ? '约' : '') + (y < 0 ? `前${-y}` : `${y}`);
const fmtYearFull = y => (APPROX(y) ? '约' : '') + (y < 0 ? `公元前 ${-y} 年` : `公元 ${y} 年`);
// 时间轴的年份。B.yearStride = [[起年, 间隔], …] 时按段抽稀（如史前每百年一格），事件、疆域变化、阶段、城邑增删改名与势力改名的年份总会保留
const YEARS = [];
if (B.yearStride) {
  const keep = new Set([Y0, Y1, ...EVENTS.map(e => e.y), ...SNAPSHOTS.map(s => s[0]), ...PHASES.flatMap(p => [p[0], p[1]]),
    ...(typeof CITIES === 'undefined' ? [] : CITIES).flatMap(c => [...c.n, ...(Array.isArray(c.cap) ? c.cap : [])].map(([yy]) => Math.floor(yy)))]);
  // 势力的名称、地图标签、分组按 t 切换：逐月比较，变化所在的年份保留
  const lab = (f, t) => { const F0 = FACTIONS[f]; return [F0.name(t), F0.mapName ? F0.mapName(t) : '', typeof F0.realm === 'function' ? F0.realm(t) : F0.realm].join('|'); };
  for (const f of Object.keys(FACTIONS)) { let a = lab(f, Y0);
    for (let k = 1; k <= (Y1 - Y0 + 1) * 12; k++) { const t = Y0 + k / 12, b = lab(f, t); if (b !== a) keep.add(Math.floor(t + 1e-9)); a = b; } }
  B.yearStride.forEach(([a, k], j) => { const b = (B.yearStride[j + 1] || [Y1 + 1])[0]; for (let y = a; y < b; y += k) keep.add(y); });
  YEARS.push(...[...keep].filter(y => y >= Y0 && y <= Y1 && y !== 0).sort((a, b) => a - b));
} else for (let y = Y0; y <= Y1; y++) if (y !== 0) YEARS.push(y);

// ---------- data prep ----------
const SEEDS = SEEDS_RAW.split(/\s{2,}|\n+/).map(s => s.trim()).filter(Boolean).map(s => {
  const [z, n, c] = s.split('|'); const [lon, lat] = c.split(',').map(Number); return { z, n, lon, lat };
});
const byName = new Map();
SEEDS.forEach((s, i) => { if (s.z !== 'x') byName.set(s.n, i); });

function resolve(tok, cur) {
  const out = [];
  for (const t of tok.split(/\s+/).filter(Boolean)) {
    if (t === '*') SEEDS.forEach((s, i) => s.z !== 'x' && out.push(i));
    else if (t[0] === '@') SEEDS.forEach((s, i) => s.z === t.slice(1) && out.push(i));
    else if (t[0] === '#') cur.forEach((f, i) => f === t.slice(1) && out.push(i));
    else if (byName.has(t)) out.push(byName.get(t));
    else console.warn('unknown seed', t);
  }
  return out;
}
const tOf = (y, m) => y + (m - 1) / 12;

const PEOPLE = new Map(PEOPLE_RAW.map(([n, f, zi, life, bio]) => [n, { n, f, zi, life, bio, ev: [], live: [] }]));
// post：事件发生时此人已故（追尊、图像、平反，或事件开头追述其生前之事）。行迹、交汇图、同场人物、编号都只计 live（在世时的事件）
const isPost = (e, n) => !!(e.post && e.post.includes(n));
EVENTS.forEach((e, i) => { e.i = i; e.who.forEach(n => { const p = PEOPLE.get(n); if (p) { p.ev.push(i); if (!isPost(e, n)) p.live.push(i); } else console.warn('missing person', n); }); });

// 时间轴步进：每年一个“年初”步，其后是当年各事件（按月份）。疆域按步计算，同一年内可多次变化。
const STEPS = [], YEAR_STEP = {}, EV_STEP = [];
for (const y of YEARS) {
  // 年初一步排在当年正月事件之前：当年有正月事件时 t 取略早于 y，否则写成 t < y 的改名阈值、(y, 1) 的疆域快照会在年初一步就生效，比正月的那个事件早一步
  YEAR_STEP[y] = STEPS.length; STEPS.push({ y, t: tOf(y, 1) - (EVENTS.some(e => e.y === y && e.mo <= 1) ? 1e-6 : 0), ev: null });
  EVENTS.filter(e => e.y === y).sort((a, b) => a.mo - b.mo || a.i - b.i)
    .forEach(e => { EV_STEP[e.i] = STEPS.length; STEPS.push({ y, t: tOf(y, e.mo), ev: e.i }); });
}
const STATES = [];
{
  let cur = SEEDS.map(s => (s.z === 'x' ? 'x' : B.baseFaction));
  // 第一条快照是开局形势：不论写的是几月，都从卷首第一步起生效（否则卷首年初一步全图退回 baseFaction 底色）
  if (SNAPSHOTS.length) for (const [f, tok] of SNAPSHOTS[0][2]) resolve(tok, cur).forEach(i => { cur[i] = f; });
  let si = SNAPSHOTS.length ? 1 : 0;
  for (const st of STEPS) {
    while (si < SNAPSHOTS.length && tOf(SNAPSHOTS[si][0], SNAPSHOTS[si][1]) <= st.t + 1e-9) {
      for (const [f, tok] of SNAPSHOTS[si][2]) resolve(tok, cur).forEach(i => { cur[i] = f; });
      si++;
    }
    STATES.push(cur.slice());
  }
}
const EV_SORTED = EVENTS.slice().sort((a, b) => EV_STEP[a.i] - EV_STEP[b.i]);

// ---------- calendar ----------
const DIG = '〇一二三四五六七八九';
function cnNum(n) {
  if (n === 1) return '元';
  if (n < 10) return DIG[n];
  const t = Math.floor(n / 10), o = n % 10;
  return (t === 1 ? '' : DIG[t]) + '十' + (o ? DIG[o] : '');
}
// 年号：BOOK.calendar.eras / spans（[起年, 年号, 起年记作第几年]，第三项缺省为 1，用于不立年号、以帝号接续纪年的“明帝二年”）；也可以直接给 BOOK.calendar.label(y) 返回 [{d, s}]
// 唐天宝三载至至德三载（744–758）称“载”：BOOK.calendar.zai = [744, 758]（各家都写“载”），或 { 唐: [744, 758] }（只有这一家）
function eras(y) { return erasFor(B.calendar || {}, y); }
// 干支：按天文纪年（公元前 1 年 = 0 年）推算
function ganzhi(y) { if (APPROX(y)) return ''; const a = y < 0 ? y + 1 : y; const i = ((a - 4) % 60 + 60) % 60; return '甲乙丙丁戊己庚辛壬癸'[i % 10] + '子丑寅卯辰巳午未申酉戌亥'[i % 12]; }
function phaseOf(y) { return PHASES.find(p => y >= p[0] && y <= p[1]) || [y, y, '']; }
/*CAL*/
// 时间轴与年份标题只列 BOOK.calendar.axis 中的几家（五代十国并存的年号太多）；事件详情仍按家补全
function eraLine(y, sep = ' · ') { const ax = (B.calendar || {}).axis, es = eras(y).filter(x => !ax || ax.includes(x.d)); return !es.length ? '' : es.length === 1 ? es[0].s : es.map(eraFmt).join(sep); }
const calLine = e => calText(e, B.calendar || {}, B.range, eras);
const yearLine = (y, sep = ' · ') => [ganzhi(y) && ganzhi(y) + '年', eraLine(y, sep)].filter(Boolean).join(sep);
const fName = (f, y) => FACTIONS[f].name(y);
// 所属：FACTIONS[f].realm（字符串或 t => 字符串）。同一所属的势力之间只画细边界，图例和面板按 BOOK.realms 分组
const realmOf = (f, t) => { const r = FACTIONS[f] && FACTIONS[f].realm; return (typeof r === 'function' ? r(t) : r) || null; };
// B.looseRealms 中的所属只用于图例分组，彼此之间仍画粗线（如互相攻伐的群雄）
const sameRealm = (a, b, t) => { const r = realmOf(a, t); return r != null && r === realmOf(b, t) && !(B.looseRealms || []).includes(r); };
// 把 [[势力, 数]] 按 BOOK.realms 的顺序分组，返回 [[所属名或 null, 小计, [[势力, 数]…]]…]
function groupByRealm(counts, t) {
  if (!B.realms) return [[null, 0, counts]];
  const keys = Object.keys(B.realms), out = keys.map(k => [B.realms[k], 0, []]), rest = [B.otherRealm || '周边', 0, []];
  for (const fc of counts) { const k = keys.indexOf(realmOf(fc[0], t)); const g = k >= 0 ? out[k] : rest; g[2].push(fc); g[1] += fc[1]; }
  return [...out, rest].filter(g => g[2].length);
}
// 地图上的势力名：可用 FACTIONS[f].mapName(t) 单独指定；BOOK.shortMapLabels 时去掉括号里的说明（如“齐（刘肥）”只标“齐”）
const mapName = (f, y) => FACTIONS[f].mapName ? FACTIONS[f].mapName(y) : B.shortMapLabels ? fName(f, y).replace(/（[^）]*）/g, '') : fName(f, y);
// 势力填充为不透明色：势力色与陆地底色按 --fo 混合，盖住下面的地形着色
let FILL = {};
function fillOf(f) {
  // blank：不着色（如史前聚落稀少之地），透出地形
  if (FACTIONS[f].blank) return 'transparent';
  if (!FILL[f]) {
    const cs = getComputedStyle(document.documentElement);
    FILL[f] = d3.interpolateRgb(cs.getPropertyValue('--land').trim(), FACTIONS[f].color)(+cs.getPropertyValue('--fo') || .56);
  }
  return FILL[f];
}
const fColor = f => FACTIONS[f].color;

// ---------- map ----------
// GeoJSON 采用逆时针外环（RFC 7946），d3-geo 需要顺时针，逐个多边形翻转
function rewind(fc) {
  for (const f of fc.features) {
    const g = f.geometry; if (!g) continue;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    for (const rings of polys) {
      if (d3.geoArea({ type: 'Polygon', coordinates: rings }) > 2 * Math.PI) rings.forEach(r => r.reverse());
    }
  }
}
// 陆地数据与拼块同在一份拓扑里时（UNITS.objects.nb），今省区、国界轮廓和周边国家都由拼块合并得到，与拼块外缘完全重合
if (UNITS.objects.nb) {
  // 拼块属性 c 为外国国家代码（朝鲜、越南、蒙古等）；没有 c 的是中国的地级行政区
  const ug = UNITS.objects.units.geometries, isCN = g => !g.properties.c;
  const byP = d3.group(ug, g => g.properties.p);
  const mergeFeat = (n, gs) => ({ type: 'Feature', properties: { n }, geometry: topojson.merge(UNITS, gs) });
  GEO.cn = { type: 'FeatureCollection', features: [...byP].filter(([, gs]) => isCN(gs[0])).map(([p, gs]) => mergeFeat(p, gs)) };
  GEO.cnout = { type: 'FeatureCollection', features: [mergeFeat('中国', ug.filter(isCN))] };
  GEO.nb = topojson.feature(UNITS, UNITS.objects.nb);
  GEO.nb.features = GEO.nb.features.filter(f => f.geometry);
  GEO.nb.features.push(...[...byP].filter(([, gs]) => !isCN(gs[0])).map(([p, gs]) => mergeFeat(p, gs)));
}
rewind(GEO.cn); rewind(GEO.nb); rewind(GEO.cnout);
const svg = d3.select('#map').attr('viewBox', `0 0 ${W} ${H}`);
const PJ = BASEMAP.projection;
const proj = ({ conicEqualArea: d3.geoConicEqualArea, conicConformal: d3.geoConicConformal, mercator: d3.geoMercator, equirectangular: d3.geoEquirectangular })[PJ.type]()
  .rotate(PJ.rotate || [0, 0]);
if (PJ.parallels && proj.parallels) proj.parallels(PJ.parallels);
proj.fitExtent(PJ.fitPadding, { type: 'MultiPoint', coordinates: PJ.fitPoints });
const path = d3.geoPath(proj);

const root = svg.append('g');
root.append('rect').attr('x', -2000).attr('y', -1500).attr('width', W + 4000).attr('height', H + 3000).attr('fill', 'var(--sea)');
const gLand = root.append('g');
gLand.selectAll('path.nb').data(GEO.nb.features).join('path').attr('class', 'land-x').attr('d', path);
gLand.selectAll('path.cn').data(GEO.cn.features).join('path').attr('class', 'land').attr('d', path);
// 地形：底图配置里的图层，base 位于势力着色之下，relief（中性明暗）叠在之上
// 地形图只画在陆地上（按陆地轮廓裁切，海面不出现阴影）
svg.append('defs').append('clipPath').attr('id', 'landclip').selectAll('path').data([...GEO.cn.features, ...GEO.nb.features]).join('path').attr('d', path);
const terrainLayer = (g, layer) => BASEMAP.terrain.filter(t => t.layer === layer).forEach(t => g.append('image').attr('class', 'terrain').attr('clip-path', 'url(#landclip)').attr('href', t.href)
  .attr('x', t.ext[0]).attr('y', t.ext[1]).attr('width', t.ext[2] - t.ext[0]).attr('height', t.ext[3] - t.ext[1]).attr('preserveAspectRatio', 'none'));
terrainLayer(root, 'base');
// 海岸线：所有陆地（拼块与周边国家）的外缘；周边国家彼此之间的陆上国界不画
if (UNITS.objects.nb) root.append('path').attr('class', 'coast')
  .attr('d', path(topojson.mesh(UNITS, { type: 'GeometryCollection', geometries: [...UNITS.objects.units.geometries, ...UNITS.objects.nb.geometries] }, (a, b) => a === b)));

const pts = SEEDS.map(s => proj([s.lon, s.lat]));

// 古政区的范围：按 BOOK.scope 挑出现代地级行政区，再归入最近的种子点（或 UNIT_OVERRIDES 指定）拼合
const SC = B.scope || {};
// 有飞地的地级区（如伊犁州的奎屯、海西州的唐古拉山镇）拆成几块，各自归入最近的种子点
UNITS.objects.units.geometries = UNITS.objects.units.geometries.flatMap(g =>
  g.type === 'MultiPolygon' && g.arcs.length > 1 ? g.arcs.map(a => ({ type: 'Polygon', arcs: a, properties: { ...g.properties } })) : [g]);
const UALL = topojson.feature(UNITS, UNITS.objects.units); rewind(UALL);
const inScope = f => {
  // 底图里少数要素没有几何（如越南昆仑岛），不纳入
  if (!f.geometry) return false;
  const { n, p } = f.properties;
  if ((SC.provinces || []).includes(p)) return true;
  if ((SC.partial || {})[p]) return SC.partial[p].includes(n);
  if ((SC.minLat || {})[p] != null) return d3.geoCentroid(f)[1] >= SC.minLat[p];
  return false;
};
const keep = UALL.features.map(inScope);
const UOBJ = { type: 'GeometryCollection', geometries: UNITS.objects.units.geometries.filter((g, k) => keep[k]) };
const UF = { type: 'FeatureCollection', features: UALL.features.filter((f, k) => keep[k]) };
UF.features.forEach((f, k) => {
  const o = (typeof UNIT_OVERRIDES !== 'undefined' ? UNIT_OVERRIDES : {})[f.properties.n];
  let j = o != null ? byName.get(o) : -1;
  if (j == null || j < 0) {
    const c = d3.geoCentroid(f); let bd = Infinity;
    SEEDS.forEach((s, i) => { const dx = (s.lon - c[0]) * Math.cos(c[1] * Math.PI / 180), dy = s.lat - c[1], d = dx * dx + dy * dy; if (d < bd) { bd = d; j = i; } });
  }
  f.properties.j = j; UOBJ.geometries[k].properties.j = j;
});
const HAS_LAND = new Set(UF.features.map(f => f.properties.j));
const meshBy = fn => path(topojson.mesh(UNITS, UOBJ, fn));
const gTerr = root.append('g');
const cells = gTerr.selectAll('path').data(UF.features).join('path').attr('class', 'cell').attr('d', path);
// 势力着色之上只叠中性的局部明暗（已去掉大范围明暗），同一势力内颜色保持一致
terrainLayer(root, 'relief');
root.append('path').attr('class', 'junline').attr('d', meshBy((a, b) => a !== b && a.properties.j !== b.properties.j));
root.append('path').attr('class', 'zhouline').attr('d', meshBy((a, b) => a !== b && SEEDS[a.properties.j].z !== SEEDS[b.properties.j].z));
const facBorderIn = root.append('path').attr('class', 'fborder-in');
const facBorder = root.append('path').attr('class', 'fborder');
// 拼块外缘：与不上色的陆地相邻的一段按势力国界画粗线，临海的一段画细线
if (UNITS.objects.nb) {
  const ALL = { type: 'GeometryCollection', geometries: [...UNITS.objects.units.geometries, ...UNITS.objects.nb.geometries] };
  const inS = g => g.properties && g.properties.j != null;
  root.append('path').attr('class', 'fborder').attr('d', path(topojson.mesh(UNITS, ALL, (a, b) => a !== b && inS(a) !== inS(b))));
  root.append('path').attr('class', 'frontier').attr('d', path(topojson.mesh(UNITS, ALL, (a, b) => a === b && inS(a))));
} else root.append('path').attr('class', 'frontier').attr('d', meshBy((a, b) => a === b));
root.append('path').attr('class', 'natline').attr('d', path(GEO.cnout));

// 水系：河流取自 OpenStreetMap（长江、黄河等主要河流，至入海口），湖泊取自 Natural Earth
rewind(GEO.lk);
root.append('g').selectAll('path').data(GEO.lk.features).join('path').attr('class', 'lake').attr('d', path);
root.append('g').selectAll('path').data(GEO.rv.features).join('path')
  .attr('class', d => 'river' + (d.properties.m ? ' major' : '')).attr('d', path)
  .append('title').text(d => d.properties.n);
const gModern = root.append('g').attr('class', 'modern');
gModern.selectAll('path').data(GEO.cn.features).join('path').attr('d', path);

const gLabels = root.append('g');
// 不在本书范围内（或只部分纳入）的今省区，始终显示省名
const OUTSIDE = new Set(GEO.cn.features.map(f => f.properties.n).filter(n => !(SC.provinces || []).includes(n)));
const provLbl = gLabels.append('g').selectAll('text').data(GEO.cn.features.filter(f => !['香港', '澳门'].includes(f.properties.n))).join('text')
  .attr('class', f => 'lbl prov-lbl' + (OUTSIDE.has(f.properties.n) ? ' always' : '')).attr('text-anchor', 'middle')
  .attr('transform', f => { const c = proj(d3.geoCentroid(f)); return `translate(${c})`; })
  .text(f => '今' + f.properties.n);
const zhouLbl = gLabels.append('g').selectAll('text').data(ZHOU_LABELS).join('text')
  .attr('class', 'lbl zhou').attr('text-anchor', 'middle').attr('transform', d => `translate(${proj([d[1], d[2]])})`).text(d => d[0]);
gLabels.append('g').selectAll('text').data(SEEDS.filter(s => HAS_LAND.has(byName.get(s.n)))).join('text')
  .attr('class', 'lbl jun-lbl').attr('text-anchor', 'middle').attr('transform', d => `translate(${proj([d.lon, d.lat])})`).attr('dy', 13).text(d => d.n);
gLabels.append('g').selectAll('text').data(BASEMAP.countryLabels || []).join('text')
  .attr('class', 'lbl country-lbl').attr('text-anchor', 'middle').attr('transform', d => `translate(${proj([d[1], d[2]])})`).text(d => d[0]);

const gCity = root.append('g');
const cityG = gCity.selectAll('g').data(CITIES).join('g').attr('class', 'city')
  .attr('transform', d => `translate(${proj(d.ll)})`);
const cityInner = cityG.append('g').attr('class', 'sc');
const cityDot = cityInner.append('circle');
const cityText = cityInner.append('text').attr('class', 'lbl').attr('x', 5).attr('y', -4);
cityG.on('mousemove', (ev, d) => showTip(ev, `<b>${cityName(d, curT())}</b><div class="s">${d.m}</div>`)).on('mouseleave', hideTip);
// 城邑名随时间变化，按当前一步的时刻 t（年 + (月 − 1) / 12，与 FACTIONS 的阈值同一口径）判断，阈值写成对应事件的 t 即落在该事件上；
// 整数年份从该年年初一步起生效（当年有正月事件时，年初一步取 y − 1e-6，则落在正月事件上）；不晚于卷首 Y0 的从第一步起就显示（与开局快照一致）。
// 第一个阈值之前、或名字写作空串时不显示该城
const cityName = (d, t) => { let n = ''; for (const [yy, nn] of d.n) if (yy <= t + 1e-9 || yy <= Y0) n = nn; return n; };
// 都城：cap: 1 全卷为都；迁都的写成 [[阈值, 1 或 0], …]，与城名同一口径
const cityCap = (d, t) => { if (!Array.isArray(d.cap)) return !!d.cap; let c = 0; for (const [yy, v] of d.cap) if (yy <= t + 1e-9 || yy <= Y0) c = v; return !!c; };

const gFac = root.append('g');
const gPath = root.append('g');
const gEv = root.append('g');

// ---------- zoom ----------
let K = 1;
// 初始视野：BOOK.view 给出若干经纬度点，缩放到恰好容纳它们（可以小于 1，用于需要看到漠北、西域的书）
const HOME = (() => {
  if (!B.view) return d3.zoomIdentity;
  const ps = B.view.map(c => proj(c)), xs = ps.map(p => p[0]), ys = ps.map(p => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const k = Math.min(1, W / (x1 - x0), H / (y1 - y0));
  return d3.zoomIdentity.translate(W / 2 - k * (x0 + x1) / 2, H / 2 - k * (y0 + y1) / 2).scale(k);
})();
const zoom = d3.zoom().scaleExtent([Math.min(1, HOME.k), 9]).translateExtent(BASEMAP.pan || [[0, 0], [W, H]])
  .on('zoom', e => {
    root.attr('transform', e.transform); K = e.transform.k;
    root.selectAll('.sc').attr('transform', `scale(${1 / K})`);
    gFac.selectAll('text').attr('transform', d => `translate(${d.p}) scale(${1 / Math.sqrt(K)})`);
    zhouLbl.style('font-size', `${15 / Math.sqrt(K)}px`);
    provLbl.style('font-size', `${10 / K * 1.3}px`);
    svg.classed('show-prov', K >= 1.8 && $('#tg-modern').checked);
    svg.classed('show-jun', K >= 2.4);
    gLabels.selectAll('.jun-lbl').style('font-size', `${10 / K * 1.4}px`).attr('dy', 13 / K);
  })
  .on('end', () => placeLabels());
svg.call(zoom).on('dblclick.zoom', null);
$('#zin').onclick = () => svg.transition().duration(300).call(zoom.scaleBy, 1.6);
$('#zout').onclick = () => svg.transition().duration(300).call(zoom.scaleBy, 1 / 1.6);
$('#zreset').onclick = () => svg.transition().duration(400).call(zoom.transform, HOME);
function focusPoint(p) {
  if (K < HOME.k * 1.15) return;
  const t = d3.zoomTransform(svg.node());
  const [x, y] = t.apply(p);
  if (x > 80 && x < W - 80 && y > 80 && y < H - 80) return;
  svg.transition().duration(500).call(zoom.translateTo, p[0], p[1]);
}

// ---------- tooltip ----------
const tip = $('#tip');
function showTip(ev, html) {
  tip.innerHTML = html; tip.hidden = false;
  let x = ev.clientX + 14, y = ev.clientY + 12;
  if (x + tip.offsetWidth > innerWidth - 6) x = ev.clientX - tip.offsetWidth - 12;
  if (y + tip.offsetHeight > innerHeight - 6) y = ev.clientY - tip.offsetHeight - 10;
  tip.style.left = x + 'px'; tip.style.top = y + 'px';
}
function hideTip() { tip.hidden = true; }
cells.on('mousemove', (ev, d) => {
  const j = d.properties.j, s = SEEDS[j], f = curSt()[j];
  const today = d.properties.p === d.properties.n || /^(北京|天津|上海|重庆)$/.test(d.properties.p) ? `今${d.properties.p}${d.properties.p === d.properties.n ? '' : d.properties.n}` : `今${d.properties.p}${d.properties.n}`;
  showTip(ev, `<b>${s.n}</b> <span class="s">· ${s.z}</span><div>属 <span style="color:${fColor(f)}">●</span> ${fName(f, curT())}</div><div class="s">${today}</div>`);
}).on('mouseleave', hideTip);

// ---------- state ----------
const state = { mode: 'map', step: 0, year: B.startYear || YEARS[0], view: { t: 'year' }, stack: [], person: null, sel: null, tab: 'year' };
const curSt = () => STATES[state.step];
const curT = () => STEPS[state.step].t;

// ---------- render: territory ----------
function renderTerritory() {
  const y = state.year, st = curSt(), T = curT();
  cells.transition().duration(450).attr('fill', d => fillOf(st[d.properties.j]));
  const fa = (a, b) => a !== b && st[a.properties.j] !== st[b.properties.j];
  facBorder.attr('d', meshBy((a, b) => fa(a, b) && !sameRealm(st[a.properties.j], st[b.properties.j], T)));
  facBorderIn.attr('d', meshBy((a, b) => fa(a, b) && sameRealm(st[a.properties.j], st[b.properties.j], T)));

  // faction labels at the medoid of each faction's commanderies
  const evPts = EVENTS.filter(e => e.y === y && EV_STEP[e.i] <= state.step).map(e => proj(e.ll));
  const groups = d3.group(st.map((f, i) => [f, i]).filter(([f, i]) => HAS_LAND.has(i) && !(typeof FACTIONS[f].hideLabel === 'function' ? FACTIONS[f].hideLabel(T) : FACTIONS[f].hideLabel)), d => d[0]);
  const labels = [];
  for (const [f, arr] of groups) {
    const idx = arr.map(d => d[1]);
    // 取最居中的郡，并避开当年事件标记
    const score = i => idx.reduce((s, j) => s + Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]), 0);
    const ranked = idx.map(i => [i, score(i)]).sort((a, b) => a[1] - b[1]).map(d => d[0]);
    const best = ranked.find(i => evPts.every(p => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]) > 45)) ?? ranked[0];
    const n = idx.length;
    labels.push({ f, p: [pts[best][0], pts[best][1] + 6], fs: Math.max(15, Math.min(40, 12 + Math.sqrt(n) * 3.6)), name: mapName(f, T) });
  }
  gFac.selectAll('text').data(labels, d => d.f).join(
    en => en.append('text').attr('class', 'fac-lbl').style('opacity', 0).call(s => s.transition().duration(400).style('opacity', null)),
    up => up, ex => ex.remove())
    .attr('transform', d => `translate(${d.p}) scale(${1 / Math.sqrt(K)})`)
    .attr('font-size', d => d.fs).text(d => d.name);

  // legend
  // 与 renderYear 一致：只计分得地块的种子点，没有地块的势力不进图例
  const counts = d3.rollups(st.filter((f, i) => f !== 'x' && HAS_LAND.has(i)), v => v.length, f => f).sort((a, b) => b[1] - a[1]);
  $('#legend').innerHTML = groupByRealm(counts, T).map(([rn, , fs]) => (rn ? `<span class="rg">${rn}</span>` : '') + fs.map(([f]) => `<span><i style="background:${fColor(f)}"></i>${fName(f, T)}</span>`).join('')).join('') +
    (B.regions?.legendNote ? `<span class="note">· ${B.regions.legendNote}</span>` : '');
  cityText.text(d => cityName(d, T));
  cityG.style('display', d => (cityName(d, T) ? null : 'none')).classed('cap', d => cityCap(d, T));
  cityDot.attr('r', d => (cityCap(d, T) ? 3.2 : 2.6));
}

// ---------- render: events ----------
function visibleEvents() {
  const y = state.year;
  // 人物行迹模式只显示此人在世时的事件；当前选中的事件（如点开的“身后”事件）也一并显示
  if (state.person) { const L = PEOPLE.get(state.person).live; return (state.sel != null && !L.includes(state.sel) ? L.concat(state.sel) : L).map(i => EVENTS[i]); }
  return EVENTS.filter(e => EV_STEP[e.i] <= state.step);
}
function renderEvents() {
  const y = state.year, focusP = state.person ? new Set(PEOPLE.get(state.person).live) : null;
  const evs = visibleEvents();
  const sel = gEv.selectAll('g.ev').data(evs, d => d.i).join(en => {
    const g = en.append('g').attr('transform', d => `translate(${proj(d.ll)})`);
    const s = g.append('g').attr('class', 'sc').attr('transform', `scale(${1 / K})`);
    s.append('circle').attr('class', 'hit').attr('r', 11);
    s.append('circle').attr('class', 'ring').attr('r', 9);
    s.append('path').attr('class', 'mk');
    s.append('text');
    g.on('click', (ev, d) => { ev.stopPropagation(); openEvent(d.i, true); })
      .on('mousemove', (ev, d) => showTip(ev, `<b>${d.t}</b><div class="s">${fmtYear(d.y)} 年 · ${d.p}（${d.m}）</div>`))
      .on('mouseleave', hideTip);
    return g;
  });
  sel.attr('class', d => {
    const cur = focusP ? true : d.y === y;
    return `ev ${d.k}${cur ? ' cur' : ' past'}${state.sel === d.i ? ' sel' : ''}`;
  });
  sel.select('path.mk').attr('d', d => {
    const cur = focusP || d.y === y; const r = cur ? 6.5 : 3.2;
    return d.k === 'war' ? `M0,${-r * 1.15}L${r * 1.15},0L0,${r * 1.15}L${-r * 1.15},0Z` : d.k === 'dip' ? d3.symbol(d3.symbolSquare, 3.2 * r * r)() : d3.symbol(d3.symbolCircle, Math.PI * r * r)();
  });
  sel.sort((a, b) => (a.y === y) - (b.y === y) || (state.sel === a.i) - (state.sel === b.i));
  renderPersonPath();
  placeLabels();
}
function placeLabels() {
  const y = state.year, t = d3.zoomTransform(svg.node());
  const focus = !!state.person;
  const boxes = [];
  const items = gEv.selectAll('g.ev').filter(d => focus || d.y === y || state.sel === d.i).data()
    .sort((a, b) => (b.i === state.sel) - (a.i === state.sel) || a.ll[0] - b.ll[0]);
  // markers themselves are obstacles
  items.forEach(d => { const [x, yy] = t.apply(proj(d.ll)); boxes.push([x - 7, yy - 7, x + 7, yy + 7]); });
  const pos = new Map();
  for (const d of items) {
    const [x, yy] = t.apply(proj(d.ll));
    const label = focus ? `${fmtYear(d.y)} ${d.t}` : d.t;
    const w = label.length * 12.5 * (focus ? 0.82 : 1) + 4, h = 15;
    const cands = [[10, 4, 'start', x + 9, yy - 9], [-10, 4, 'end', x - 9 - w, yy - 9], [0, -11, 'middle', x - w / 2, yy - 25], [0, 21, 'middle', x - w / 2, yy + 8],
      [10, -10, 'start', x + 8, yy - 23], [10, 18, 'start', x + 8, yy + 5], [-10, -10, 'end', x - 8 - w, yy - 23], [-10, 18, 'end', x - 8 - w, yy + 5]];
    let pick = null;
    for (const c of cands) {
      const b = [c[3], c[4], c[3] + w, c[4] + h];
      if (!boxes.some(o => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1])) { pick = c; boxes.push(b); break; }
    }
    pos.set(d.i, pick ? { c: pick, label } : (d.i === state.sel ? { c: cands[0], label } : null));
  }
  gEv.selectAll('g.ev').each(function (d) {
    const txt = d3.select(this).select('text');
    const p = pos.get(d.i);
    if (!p) { txt.text(''); return; }
    txt.attr('x', p.c[0]).attr('y', p.c[1]).attr('text-anchor', p.c[2]).text(null);
    if (focus) { txt.append('tspan').attr('class', 'yr').text(fmtYear(d.y) + ' '); txt.append('tspan').text(d.t); }
    else txt.text(d.t);
  });
}
function renderPersonPath() {
  gPath.selectAll('*').remove();
  if (!state.person) return;
  // 身后出现的事件不计入行迹
  const evs = PEOPLE.get(state.person).live.map(i => EVENTS[i]).sort((a, b) => EV_STEP[a.i] - EV_STEP[b.i]);
  const ps = []; evs.forEach(e => { const p = proj(e.ll); const l = ps[ps.length - 1]; if (!l || Math.hypot(l[0] - p[0], l[1] - p[1]) > 1) ps.push(p); });
  if (ps.length > 1) gPath.append('path').attr('class', 'ppath').attr('d', d3.line().curve(d3.curveCatmullRom.alpha(.5))(ps));
  const nums = new Map();
  evs.forEach((e, k) => { const key = e.ll.join(); if (!nums.has(key)) nums.set(key, { p: proj(e.ll), n: [] }); nums.get(key).n.push(k + 1); });
  const g = gPath.selectAll('g').data([...nums.values()]).join('g').attr('class', 'pnum').attr('transform', d => `translate(${d.p[0]},${d.p[1]})`)
    .append('g').attr('class', 'sc').attr('transform', `scale(${1 / K})`);
  g.append('circle').attr('r', 7.5).attr('cy', -15);
  g.append('text').attr('y', -11.5).text(d => d.n.length > 1 ? d.n[0] + '+' : d.n[0]);
}

// ---------- timeline ----------
const range = $('#year');
const NS = STEPS.length - 1;
range.min = 0; range.max = NS;
const at = k => `${k / NS * 100}%`;
const nextYearStep = b => { const i = YEARS.indexOf(b); return i >= 0 && i < YEARS.length - 1 ? YEAR_STEP[YEARS[i + 1]] : NS; };
$('#phases').innerHTML = PHASES.map(([a, b, n]) => `<div data-a="${a}" style="left:${at(YEAR_STEP[a])};width:${(nextYearStep(b) - YEAR_STEP[a]) / NS * 100}%">${n}</div>`).join('');
// 年份刻度：按时间跨度自动取整
{
  const span = Y1 - Y0, stepY = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500].find(v => span / v <= 11) || 1000;
  let ticks = [Y0]; for (let y = Math.ceil((Y0 + 1) / stepY) * stepY; y < Y1; y += stepY) if (y !== 0 && y - Y0 > stepY * .65 && Y1 - y > stepY * .65) ticks.push(y);
  ticks.push(Y1);
  if (B.axisTicks) ticks = B.axisTicks.filter(y => YEAR_STEP[y] != null);
  $('#axis').innerHTML = ticks.map(y => `<span style="left:${at(YEAR_STEP[y])}">${fmtYear(y)}</span>`).join('');
}
$('#ticks').innerHTML = EVENTS.map(e => `<button data-ev="${e.i}" class="${e.k === 'pol' ? '' : e.k}" style="left:${at(EV_STEP[e.i])};width:7px;height:7px;top:3.5px" title="${fmtYear(e.y)}：${esc(e.t)}" aria-label="${fmtYear(e.y)} ${esc(e.t)}"></button>`).join('');
$('#ticks').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { stop(); setStep(EV_STEP[+b.dataset.ev], state.view.t !== 'event'); } });
range.addEventListener('input', () => { setStep(+range.value); });
$('#prevEv').onclick = () => { stop(); const e = [...EV_SORTED].reverse().find(e => EV_STEP[e.i] < state.step); if (e) setStep(EV_STEP[e.i], state.view.t !== 'event'); };
$('#nextEv').onclick = () => { stop(); const e = EV_SORTED.find(e => EV_STEP[e.i] > state.step); if (e) setStep(EV_STEP[e.i], state.view.t !== 'event'); };
let timer = null;
function stop() { clearInterval(timer); timer = null; $('#play').textContent = '▶ 播放'; }
$('#play').onclick = () => {
  if (timer) return stop();
  // 播放时逐个事件推进，跳过没有大事的年份
  const nextEv = () => EV_SORTED.find(e => EV_STEP[e.i] > state.step);
  if (!nextEv()) setStep(0, true);
  $('#play').textContent = '❚❚ 暂停';
  const tick = () => { const e = nextEv(); if (!e) return stop(); setStep(EV_STEP[e.i], true); };
  tick(); timer = setInterval(tick, 1600);
};

// 合集：上一卷 / 下一卷。链接带 ?at=start|end，接着上一卷的结尾或从下一卷的开头读起
const bookHref = (b, at) => `../${b.id}/index.html${at ? '?at=' + at : ''}`;
// 相邻两卷的时间重叠：前卷末事件晚于后卷首事件（同月首尾相接、同一事件衔接的不算）。返回说明文字，没有重叠时为空
function overlapNote(a, b) {
  if (!a || !b || !a.last || !b.first) return '';
  const [y0, m0] = b.first, [y1, m1] = a.last;
  if (y1 + (m1 - 1) / 12 <= y0 + (m0 - 1) / 12) return '';
  return `在 ${ovSpan(b, a)} 重叠，两卷各从不同的线索叙述`;
}
function ovSpan(b, a) {
  const y0 = b.first[0], y1 = a.last[0];
  return y0 === y1 ? `${fmtYear(y0)} 年` : `${fmtYear(y0)}–${fmtYear(y1)} 年`;
}
if (SER) {
  const prev = SER.books[serIdx - 1], next = SER.books[serIdx + 1];
  const nav = $('#series'); nav.hidden = false;
  nav.innerHTML = `<span class="pos">卷${serIdx ? cnNum(serIdx + 1) : '一'} / ${cnNum(SER.books.length)}</span>`
    + `<a class="btn" href="../index.html" title="全部卷目">目录</a>`
    + (prev ? `<a class="btn" href="${bookHref(prev, 'end')}" title="上一卷：${esc(prev.brand)}（${esc(prev.years)}），从结尾读起">‹ ${esc(prev.brand)}</a>` : '');
  const ov = overlapNote(prev, SER.books[serIdx]);
  if (ov) nav.insertAdjacentHTML('beforeend', `<span class="ovl" title="与上一卷《${esc(prev.brand)}》${esc(ov)}">与上卷重叠 ${ovSpan(SER.books[serIdx], prev)}</span>`);
  if (next) {
    const a = $('#nextBook'); a.hidden = false; a.href = bookHref(next, 'start');
    a.textContent = `下一卷：${next.brand} ›`; const nov = overlapNote(SER.books[serIdx], next);
    a.title = [next.years, nov && `与本卷${nov}`, next.gap && `注意：${next.gap}`].filter(Boolean).join(' · ');
  }
}
function markBookEnd() { if (SER) $('#nextBook').classList.toggle('end', !EV_SORTED.some(e => EV_STEP[e.i] > state.step)); }

function setYear(y, toYearView) { setStep(YEAR_STEP[YEARS.reduce((b, v) => (Math.abs(v - y) < Math.abs(b - y) ? v : b), YEARS[0])], toYearView); }
function setStep(k, toYearView) {
  k = Math.max(0, Math.min(NS, k));
  const changed = k !== state.step;
  state.step = k; state.year = STEPS[k].y; range.value = k;
  // 人物页拖动滑块：只选中与此人有关的事件，免得无关事件画进人物轨迹
  if (state.view.t === 'person' && state.person) { const L = PEOPLE.get(state.person).live; state.sel = STEPS[k].ev != null && L.includes(STEPS[k].ev) ? STEPS[k].ev : null; }
  else if (STEPS[k].ev != null || state.view.t === 'year' || state.view.t === 'events') state.sel = STEPS[k].ev;
  if (toYearView && (state.view.t === 'event' || state.view.t === 'person')) { state.person = null; state.sel = null; state.stack = []; state.view = { t: state.tab === 'people' ? 'people' : state.tab === 'events' ? 'events' : 'year' }; }
  // 事件详情页中翻到、拖到另一个事件：就地换成该事件的详情（不压入返回栈）
  // 拖到没有事件的年初一步：回到当年的年份视图（不压入返回栈）
  const swap = state.view.t === 'event' && STEPS[k].ev !== state.view.i;
  if (swap) { if (STEPS[k].ev != null) state.view = { t: 'event', i: STEPS[k].ev }; else { state.view = { t: state.tab === 'people' ? 'people' : state.tab === 'events' ? 'events' : 'year' }; state.stack = []; state.sel = null; state.person = null; } }
  renderStamp();
  if (changed || toYearView) { renderTerritory(); }
  renderEvents();
  markTimeline();
  storyCursor();
  markBookEnd();
  if (state.view.t === 'year' || state.view.t === 'events' || swap) renderPanel();
}
function markTimeline() {
  const y = state.year, ev = STEPS[state.step].ev;
  document.querySelectorAll('#ticks button').forEach(b => b.classList.toggle('on', +b.dataset.ev === ev));
  document.querySelectorAll('#phases div').forEach(d => d.classList.toggle('on', +d.dataset.a === phaseOf(y)[0]));
}
function renderStamp() {
  const y = state.year;
  const ev = STEPS[state.step].ev;
  const ph = phaseOf(y)[2];
  $('#stamp').innerHTML = `<div class="big">${fmtYear(y)}<small>年</small></div><div class="era">${yearLine(y)}</div>${ev != null ? `<div class="now">▸ ${EVENTS[ev].t}</div>` : ''}${ph ? `<div class="phase">${ph}</div>` : ''}`;
}

// ---------- panel ----------
const pbody = $('#pbody');
const fdot = f => `<i style="background:${fColor(f)}"></i>`;
// post：身后出现在事件中（追尊、图像、平反等），此人当时已故
const chip = (n, post) => { const p = PEOPLE.get(n); return `<button class="chip${post ? ' post' : ''}" data-person="${n}"${post ? ' title="此时已故，身后出现在这一事件中"' : ''}>${fdot(p.f)}${n}${p.zi ? `<small>${p.zi}</small>` : ''}${post ? '<em>身后</em>' : ''}</button>`; };
// 出处：chapters（章回体，回数 + 回目）或 sections（篇目名）
const SRC = B.source || { type: 'sections', heading: '出处' };
function chapterNum(n) {
  const h = Math.floor(n / 100), r = n % 100;
  if (!h) return n === 1 ? '一' : cnNum(n);
  // 一百零一、一百一十、一百一十五、一百二十
  return DIG[h] + '百' + (r ? (r < 10 ? '零' + DIG[r] : r < 20 ? '一' + cnNum(r) : cnNum(r)) : '');
}
function srcShort(refs) {
  if (!refs || !refs.length) return '';
  if (SRC.type === 'chapters') {
    const a = refs.slice().sort((x, y) => x - y), parts = []; let s = a[0], p = a[0];
    for (const n of a.slice(1).concat(null)) { if (n === p + 1) { p = n; continue; } parts.push(s === p ? s : `${s}–${p}`); s = p = n; }
    return `第${parts.join('、')}${SRC.unit || '回'}`;
  }
  return refs.map(r => `《${r}》`).join('');
}
function srcBlock(refs) {
  if (!refs || !refs.length) return '';
  const rows = SRC.type === 'chapters'
    ? refs.map(n => { const t = SRC.titles && SRC.titles[n - 1]; return `<div class="hui"><span class="hn">第${chapterNum(n)}${SRC.unit || '回'}</span><span class="ht">${t ? t.join('<br>') : ''}</span></div>`; })
    : refs.map(r => { const t = SRC.titles && SRC.titles[r]; return `<div class="hui"><span class="hn">《${r}》</span><span class="ht">${t || ''}</span></div>`; });
  return `<h3>${SRC.heading || '出处'} <span>${srcShort(refs)}</span></h3><div class="huis">${rows.join('')}</div>`;
}
// 正文中的原书引文：**…** → 加粗下划线
// 可写作 **左传|…** 注明另一出处：悬停显示“《左传》原文”，下划线换色
const rich = t => esc(t).replace(/\*\*(?:([^|*]{1,6})\|)?(.+?)\*\*/g, (_, src, q) => src
  ? `<b class="yw yw2" title="《${src}》原文">${q}</b>` : `<b class="yw" title="${esc(B.quoteLabel || '原文')}">${q}</b>`);
const tagOf = e => (e.src ? (B.tags || {})[e.src] || e.src : '');
const evItem = (e, on) => `<button class="item${on ? ' on' : ''}" data-event="${e.i}"><span class="y">${fmtYear(e.y)}</span><span class="t"><i class="${e.k}"></i>${e.t}</span><span class="s">${[e.p + ' · ' + e.m, srcShort(e.refs), tagOf(e)].filter(Boolean).join(' · ')}</span></button>`;

function go(view) { state.stack.push({ view: state.view, person: state.person, sel: state.sel }); state.view = view; }
function back() {
  const s = state.stack.pop();
  if (!s) { state.view = { t: state.tab }; state.person = null; state.sel = null; }
  else { state.view = s.view; state.person = s.person; state.sel = s.sel; }
  renderEvents(); renderPanel(); renderStory();
}
function openEvent(i, fromMap) {
  const e = EVENTS[i];
  if (fromMap && state.view.t !== 'person' && !(state.view.t === 'event' && state.person)) state.person = null;
  go({ t: 'event', i }); state.sel = i;
  if (EV_STEP[i] !== state.step) { state.step = EV_STEP[i]; state.year = e.y; range.value = state.step; renderStamp(); renderTerritory(); markTimeline(); }
  renderEvents(); renderPanel(); focusPoint(proj(e.ll)); storyCursor();
}
function openPerson(n) {
  go({ t: 'person', n }); state.person = n; state.sel = null;
  renderEvents(); renderPanel(); storyFocus(n);
}
function setTab(t) {
  state.tab = t; state.stack = []; state.person = null; state.sel = null; state.view = { t };
  renderEvents(); renderPanel(); renderStory();
}
$('#tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setTab(b.dataset.tab); });
pbody.addEventListener('click', e => {
  const t = e.target.closest('[data-event],[data-person],[data-year],.back');
  if (!t) return;
  if (t.classList.contains('back')) return back();
  if (t.dataset.event != null) return openEvent(+t.dataset.event);
  if (t.dataset.person) return openPerson(t.dataset.person);
  if (t.dataset.year) return setYear(+t.dataset.year, true);
});
pbody.addEventListener('input', e => { if (e.target.id === 'psearch') { state.q = e.target.value; renderPeopleList(); } });

function renderPanel() {
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === state.tab));
  const v = state.view;
  if (v.t === 'year') return renderYear();
  if (v.t === 'events') return renderEventList();
  if (v.t === 'people') return renderPeople();
  if (v.t === 'event') return renderEvent(v.i);
  if (v.t === 'person') return renderPerson(v.n);
}
function renderYear() {
  const y = state.year, evs = EVENTS.filter(e => e.y === y);
  const st = curSt().filter((f, i) => f !== 'x' && HAS_LAND.has(i));
  const counts = d3.rollups(st, v => v.length, f => f).sort((a, b) => b[1] - a[1]);
  const max = counts.length ? counts[0][1] : 1;
  let evHtml;
  if (evs.length) evHtml = `<div class="list">${evs.sort((a, b) => EV_STEP[a.i] - EV_STEP[b.i]).map(e => evItem(e, e.i === STEPS[state.step].ev)).join('')}</div>`;
  else {
    const pv = [...EV_SORTED].reverse().find(e => e.y < y)?.y, nx = EV_SORTED.find(e => e.y > y)?.y;
    evHtml = `<div class="empty">本年没有收录大事。地图上的灰点是此前发生过的事件。</div><div class="pnav">${pv != null ? `<button class="btn" data-year="${pv}">‹ ${fmtYear(pv)} 年</button>` : '<span></span>'}${nx != null ? `<button class="btn" data-year="${nx}">${fmtYear(nx)} 年 ›</button>` : ''}</div>`;
  }
  pbody.innerHTML = `
    <div class="yhead"><div class="n">${fmtYear(y)}</div><div class="e">${yearLine(y, '<br>')}</div></div>
    <h3>本年大事 <span>${evs.length || ''}</span></h3>${evHtml}
    <h3>势力 <span>按所据${B.regions?.unit || '地'}数</span></h3>
    <div class="bars">${groupByRealm(counts, curT()).map(([rn, sum, fs]) => (rn ? `<div class="bargrp">${rn}<span>${sum}</span></div>` : '') + fs.map(([f, c]) => `<div class="bar"><span>${fName(f, curT())}</span><div class="track2"><div style="width:${c / max * 100}%;background:${fColor(f)}"></div></div><span class="c">${c}</span></div>`).join('')).join('')}</div>
    ${B.notes ? `<div class="note">${B.notes}</div>` : ''}`;
}
function renderEventList() {
  let html = '';
  for (const [a, b, n] of PHASES) {
    const evs = EV_SORTED.filter(e => e.y >= a && e.y <= b);
    html += `<div class="grp">${n}<small>${fmtYear(a)}–${fmtYear(b)}</small></div><div class="list">${evs.map(e => evItem(e, e.y === state.year)).join('')}</div>`;
  }
  pbody.innerHTML = html;
  const on = pbody.querySelector('.item.on'); if (on) on.scrollIntoView({ block: 'center' });
}
const FORDER = Object.keys(FACTIONS);
const FGROUP = Object.fromEntries(B.peopleGroups || []);
function renderPeople() {
  pbody.innerHTML = `<input class="search" id="psearch" type="search" placeholder="${esc(B.searchHint || '搜索人物')}" value="${state.q || ''}"><div id="plist" style="display:grid;gap:12px"></div>`;
  renderPeopleList();
}
function renderPeopleList() {
  const q = (state.q || '').trim();
  const list = [...PEOPLE.values()].filter(p => !q || p.n.includes(q) || (p.zi && p.zi.includes(q)));
  const main = (B.peopleGroups || []).map(g => g[0]);
  const groups = d3.groups(list, p => (main.includes(p.f) ? p.f : 'other'));
  groups.sort((a, b) => (main.indexOf(a[0]) + 1 || 9) - (main.indexOf(b[0]) + 1 || 9));
  $('#plist').innerHTML = groups.map(([g, ps]) => {
    ps.sort((a, b) => b.ev.length - a.ev.length || FORDER.indexOf(a.f) - FORDER.indexOf(b.f));
    return `<div class="grp">${FGROUP[g] || B.otherGroup || '其他'}<small>${ps.length} 人</small></div><div class="chips">${ps.map(p => chip(p.n)).join('')}</div>`;
  }).join('') || '<div class="empty">没有找到这个人物。</div>';
}
function renderEvent(i) {
  const e = EVENTS[i];
  const backLabel = state.stack.length && state.stack[state.stack.length - 1].view.t === 'person' ? `‹ 返回 ${state.stack[state.stack.length - 1].view.n}` : '‹ 返回';
  // 沿人物行迹浏览时只在其在世事件间前后翻；当前是身后事件时，取时间上前后最近的在世事件
  const order = state.person ? PEOPLE.get(state.person).live.slice().sort((a, b) => EV_STEP[a] - EV_STEP[b]) : EV_SORTED.map(x => x.i);
  let k = order.indexOf(i), pv, nx;
  if (k >= 0) { pv = order[k - 1]; nx = order[k + 1]; } else { pv = [...order].reverse().find(j => EV_STEP[j] < EV_STEP[i]); nx = order.find(j => EV_STEP[j] > EV_STEP[i]); }
  pbody.innerHTML = `
    <button class="back">${backLabel}</button>
    <div class="kicker">${[fmtYearFull(e.y), ganzhi(e.y), calLine(e)].filter(Boolean).join(' · ')}</div>
    <h2>${e.t}</h2>
    <div class="meta"><span>${e.p}（${e.m}）</span><span class="tag">${KIND[e.k] || '政事'}</span>${e.src ? `<span class="tag yy">${tagOf(e)}</span>` : ''}</div>
    <p>${rich(e.d)}</p>
    ${srcBlock(e.refs)}
    <h3>参与人物 <span>${e.who.length} 人</span></h3>
    <div class="chips">${e.who.map(n => chip(n, isPost(e, n))).join('')}</div>
    <div class="pnav">${pv != null ? `<button class="btn" data-event="${pv}">‹ ${EVENTS[pv].t}</button>` : '<span></span>'}${nx != null ? `<button class="btn" data-event="${nx}">${EVENTS[nx].t} ›</button>` : ''}</div>
    ${state.person ? `<div class="note">正在沿 ${state.person} 的行迹浏览。</div>` : ''}`;
}
const otherItem = (x, n) => { const bk = SER.books[x.k];
  return `<a class="item other" href="${bookHref(bk)}?ev=${encodeURIComponent(x.t)}&p=${encodeURIComponent(n)}" title="打开卷${x.k ? cnNum(x.k + 1) : '一'}《${esc(bk.brand)}》中的这一事件"><span class="y">${fmtYear(x.y)}</span><span class="t">${esc(x.t)}${x.post ? '<em class="post" title="此时已故，身后出现在这一事件中">身后</em>' : ''}</span><span class="s">见卷${x.k ? cnNum(x.k + 1) : '一'}《${esc(bk.brand)}》 ›</span></a>`; };
function renderPerson(n) {
  const p = PEOPLE.get(n);
  const evs = p.ev.slice().sort((a, b) => EV_STEP[a] - EV_STEP[b]).map(i => EVENTS[i]);
  // 合集里，此人在其他卷的事件按时间插入，标明见第几卷，点击跳到那一卷的该事件
  // 两卷重叠处同一事件在本卷已有的，不再重复列出：同年，且标题有一段相同（如“商鞅变法”与“商鞅变法 · 徙木立信”、“魏拔邯郸 · 桂陵之战”与“桂陵之战 · 围魏救赵”）
  const segs = t => t.split(' · '), sameEv = (e, y, t) => e.y === y && segs(e.t).some(s => segs(t).includes(s));
  const others = (SER && SER.people && SER.people[n] || []).filter(x => x[0] !== serIdx && !evs.some(e => sameEv(e, x[1], x[3]))).map(([k, y, mo, t, post]) => ({ k, y, mo, t, post }));
  const merged = [...evs.map(e => ({ e, y: e.y, mo: e.mo })), ...others].sort((u, v) => u.y - v.y || u.mo - v.mo || (u.e ? serIdx : u.k) - (v.e ? serIdx : v.k));
  const co = new Map();
  evs.filter(e => !isPost(e, n)).forEach(e => e.who.forEach(w => { if (w !== n && !isPost(e, w)) co.set(w, (co.get(w) || 0) + 1); }));
  const coTop = [...co].sort((a, b) => b[1] - a[1]).slice(0, 10);
  // 生卒年：形如 161–223、?–220、前232–前202、约前390–前338、?–约前200、531–?（卒年不详）
  const lm = p.life.match(/^约?(前)?(\d+)?\??\s*[–-]\s*约?(前)?(\d+)?/);
  const a = lm && lm[2] ? (lm[1] ? -lm[2] : +lm[2]) : null, b0 = lm && lm[4] ? (lm[3] ? -lm[4] : +lm[4]) : null;
  const liveEvs = evs.filter(e => !isPost(e, n)), tOf = e => e.y + (e.mo - 1) / 12,
    // 势力名按最后一个在世事件的时刻取（年中改号的，如杨行密死后淮南改称吴）
    fy = liveEvs.length ? tOf(liveEvs[liveEvs.length - 1]) : evs.length ? tOf(evs[0]) : state.year;
  const pad = Math.max(10, (Y1 - Y0) * .3), lo = Y0 - pad, hi = Y1 + pad * .5, sc = v => (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * 100;
  // 夏历十二月去世折成公历次年一二月，事件年份可能比卒年晚一年，寿命条画到最后一个在世事件为止（最多延长一年；演义等虚构情节不计）
  const hist = p.live.filter(i => !EVENTS[i].src), lastLive = hist.length ? Math.max(...hist.map(i => EVENTS[i].y)) : null;
  // 卒年不详的，寿命条画到最后一个在世事件
  const b = b0 != null ? b0 : a != null ? lastLive ?? a : null, b2 = b != null && lastLive != null && lastLive > b ? Math.min(lastLive, b + 1) : b;
  // 演义等虚构情节若落在生卒之外（如华佗卒后的刮骨疗毒），刻度画成虚线，并在提示里注明
  // 生年不详时左端默认按活 40 岁算，若有更早的在世事件则延伸到该事件
  const firstLive = hist.length ? Math.min(...hist.map(i => EVENTS[i].y)) : null, a2 = a != null ? a : b != null ? Math.min(b - 40, firstLive ?? b - 40) : null;
  const life = b ? `<div class="lifebar" title="生卒年"><div style="left:${sc(a2)}%;width:${sc(b2) - sc(a2)}%;background:${fColor(p.f)};${a != null && b0 != null ? '' : 'opacity:.45'}"></div>${evs.filter(e => !isPost(e, n)).map(e => (e.src && (e.y > b2 || e.y < a2)
    ? `<div class="fic" style="left:${sc(e.y)}%" title="${tagOf(e)}：${e.t}（${fmtYearFull(e.y)}，与史实生卒不合）"></div>`
    : `<div style="left:${sc(e.y)}%;width:2px;background:var(--ink)"></div>`)).join('')}</div>` : '';
  pbody.innerHTML = `
    <button class="back">‹ 返回</button>
    <h2>${n}${p.zi ? `<small>字${p.zi}</small>` : ''}</h2>
    <div class="meta"><span class="chip" style="cursor:default">${fdot(p.f)}${fName(p.f, fy)}</span><span>${p.life}</span></div>
    ${life}
    <p>${rich(p.bio)}</p>
    <h3>经历事件 <span>${p.live.length} 件${evs.length > p.live.length ? `，身后 ${evs.length - p.live.length} 件` : ''}${others.length ? `，另有 ${others.length} 件见其他卷` : ''}${p.live.length ? ' · 地图上以金色虚线连出行迹，序号与金圈一致' : ''}</span></h3>
    <div class="list">${(() => { let k = 0; return merged.map(x => {
      // 序号只给本卷在世时的事件，与地图上金圈的序号一致；他卷事件与身后事件不编号
      if (!x.e) return otherItem(x, n);
      if (isPost(x.e, n)) return evItem(x.e).replace('</span><span class="s">', '<em class="post" title="此时已故，身后出现在这一事件中">身后</em></span><span class="s">');
      return evItem(x.e).replace('<span class="y">', `<span class="y">${++k}. `); }).join(''); })()}</div>
    ${coTop.length ? `<h3>同场人物 <span>共同出现的事件数</span></h3><div class="chips">${coTop.map(([w, c]) => chip(w).replace('</button>', `<small>×${c}</small></button>`)).join('')}</div>` : ''}`;
}

// ---------- toggles ----------
const tg = (id, cls) => { const el = $(id); const f = () => { svg.classed(cls, !el.checked); svg.classed('show-prov', K >= 1.8 && $('#tg-modern').checked); }; el.addEventListener('change', f); f(); };
tg('#tg-terrain', 'hide-terrain'); tg('#tg-modern', 'hide-modern'); tg('#tg-zhou', 'hide-zhou'); tg('#tg-city', 'hide-city');
$('#music').title = B.musicTitle || '原创合成的背景音';

// 主题切换时重算填充色
const refill = () => { FILL = {}; cells.interrupt().attr('fill', d => fillOf(curSt()[d.properties.j])); };
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', refill);
new MutationObserver(refill).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

/*STORY*/

/*MUSIC*/

// ---------- start ----------
state.step = YEAR_STEP[state.year];
// 从上一卷接着读或从目录进入：停在第一个事件（此时开篇的疆域快照已生效）；从下一卷倒回来：停在最后一个事件
// ?at=start|end、?ev=、?p= 深链：合集各卷与独立单卷都支持
const startAt = new URLSearchParams(location.search).get('at');
if (startAt === 'start') state.step = EV_STEP[EV_SORTED[0].i];
if (startAt === 'end') state.step = EV_STEP[EV_SORTED[EV_SORTED.length - 1].i];
if (startAt) { state.year = STEPS[state.step].y; state.sel = STEPS[state.step].ev; }
range.value = state.step;
renderStamp(); renderTerritory(); renderEvents(); renderPanel(); markTimeline(); markBookEnd();
if (B.view) svg.call(zoom.transform, HOME);
// 从其他卷的人物页跳来：?ev=事件标题&p=人物，打开该事件，并沿此人的行迹浏览
{
  const q = new URLSearchParams(location.search), ei = EVENTS.findIndex(e => e.t === q.get('ev')), pn = q.get('p');
  if (ei >= 0) { if (pn && PEOPLE.has(pn)) { setTab('people'); openPerson(pn); } openEvent(ei); }
  // 只带 ?p=人物（如从目录页的检索进入）：打开此人的人物页
  else if (pn && PEOPLE.has(pn)) {
    // 时间轴与疆域跳到此人在本卷的第一个（在世）事件，与人物页、金色行迹一致
    const P = PEOPLE.get(pn), first = (P.live.length ? P.live : P.ev).slice().sort((a, b) => EV_STEP[a] - EV_STEP[b])[0];
    if (first != null) setStep(EV_STEP[first]);
    setTab('people'); openPerson(pn);
  }
}
})();
