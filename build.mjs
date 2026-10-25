// 组装某本书的单文件页面：node build.mjs <书目录名>，例如 node build.mjs sanguo
// 输出 dist/<书>/index.html，并复制底图的地形图片。
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
const id = process.argv[2];
// --series：作为合集的一卷输出到 dist/series/<书>/，地形图共用合集根目录的一份
const SERIES_MODE = process.argv.includes('--series');
if (!id || !existsSync(new URL(`./books/${id}/book.js`, import.meta.url))) {
  console.error('用法：node build.mjs <书目录名>，书目录在 books/ 下'); process.exit(1);
}
const r = f => readFileSync(new URL(f, import.meta.url), 'utf8');
const bookSrc = r(`./books/${id}/book.js`);
// 在沙箱里执行一次书的数据，读取配置并做基本校验
const ctx = {}; vm.createContext(ctx);
vm.runInContext(bookSrc + '\n;this.__ = { BOOK, FACTIONS, EVENTS, PEOPLE_RAW, SNAPSHOTS, SEEDS_RAW, PHASES: typeof PHASES === "undefined" ? [] : PHASES };', ctx);
const { BOOK, FACTIONS, EVENTS, PEOPLE_RAW, PHASES } = ctx.__;
const people = new Set(PEOPLE_RAW.map(p => p[0])), problems = [];
EVENTS.forEach(e => {
  e.who.forEach(w => people.has(w) || problems.push(`事件「${e.t}」的人物「${w}」不在人物表中`));
  // 稀疏数组（如 [, '某']）或空名：length 比实际人数多，详情的人数与悬浮提示的顿号都会错
  for (const k of ['who', 'post']) { const a = e[k] || []; if (Object.keys(a).length !== a.length || a.some(w => !w)) problems.push(`事件「${e.t}」的 ${k} 有空位或空名：${JSON.stringify(a)}`); }
  (e.post || []).forEach(w => e.who.includes(w) || problems.push(`事件「${e.t}」的身后人物「${w}」不在 who 中`));
  if (e.y === 0) problems.push(`事件「${e.t}」的年份为 0（没有公元 0 年）`);
  if (e.y < BOOK.range[0] || e.y > BOOK.range[1]) problems.push(`事件「${e.t}」的年份 ${e.y} 超出时间轴范围`);
});
PEOPLE_RAW.forEach(p => FACTIONS[p[1]] || problems.push(`人物「${p[0]}」的势力「${p[1]}」未定义`));
// 交汇图只画在世事件不少于 2 件的人物，storyDefault 里不够的人会被静默去掉，这里直接报出来
const liveN = n => EVENTS.filter(e => e.who.includes(n) && !(e.post || []).includes(n)).length;
(BOOK.storyDefault || []).forEach(n => (!people.has(n) ? problems.push(`storyDefault 的「${n}」不在人物表中`)
  : liveN(n) < 2 && problems.push(`storyDefault 的「${n}」在世事件只有 ${liveN(n)} 件（交汇图要求不少于 2 件）`)));
// BOOK 顶层键重复时后一个静默覆盖前一个（如两个 regions），按源码缩进两格的键检查
{ const m = bookSrc.match(/\nconst BOOK = \{\n([\s\S]*?)\n\};/), seen = new Set();
  if (m) for (const [, k] of m[1].matchAll(/^  (\w+)\s*:/gm)) seen.has(k) ? problems.push(`BOOK 的「${k}」重复定义`) : seen.add(k); }
// 阶段按闭区间 [起年, 止年] 归入事件，相邻阶段不能共用同一年，否则该年的事件在大事记里出现两次
PHASES.forEach((ph, i) => { if (i && ph[0] <= PHASES[i - 1][1]) problems.push(`阶段「${PHASES[i - 1][2]}」与「${ph[2]}」在 ${ph[0]} 年重叠`); });
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
// 跨卷人物的统一简介（books/_people.js）：覆盖本书同名人物的字、生卒、简介；引文出处与本书默认出处相同的去掉前缀
const common = (() => { const c = {}; vm.createContext(c); vm.runInContext(r('./books/_people.js') + '\n;this.p = commonOf;', c); return c.p; })();
const defSrc = ((BOOK.quoteLabel || '').match(/《(.+?)》/) || [])[1];
const commonSub = {};
for (const [n] of PEOPLE_RAW) if (common(n, id)) commonSub[n] = common(n, id).slice(0, 3).map(v => (defSrc ? v.split(`**${defSrc}|`).join('**') : v));
// 卒年晚于本卷第一个事件、本卷却没有一件在世事件的人物（只在身后被提及），多半是漏标了他生前参与的事件
{ const t0 = Math.min(...EVENTS.map(e => e.y));
  for (const [n, , , life0] of PEOPLE_RAW) { const life = common(n, id) ? common(n, id)[1] : life0, m = String(life || '').match(/[–-]\s*约?(前)?(\d+)/);
    if (m && (m[1] ? -m[2] : +m[2]) > t0 && liveN(n) === 0) problems.push(`人物「${n}」（${life}）卒于本卷首个事件之后，却没有在世事件`); } }
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
// 没写 CITIES、PHASES 的书补空表，引擎各处直接遍历
const dataSrc = bookSrc + (/\bconst CITIES\b/.test(bookSrc) ? '' : '\nconst CITIES = [];') + (/\bconst PHASES\b/.test(bookSrc) ? '' : '\nconst PHASES = [];') + `\n// 跨卷人物的统一简介（构建时由 books/_people.js 注入）\nconst PEOPLE_COMMON = ${JSON.stringify(commonSub)};\nPEOPLE_RAW.forEach(p => { const c = PEOPLE_COMMON[p[0]]; if (c) [p[2], p[3], p[4]] = c; });\n`;

const bm = `./basemaps/${BOOK.basemap}/`;
const BASEMAP = JSON.parse(r(bm + 'basemap.json'));
let SERIES = null;
if (SERIES_MODE) {
  SERIES = JSON.parse(r('./series.json'));
  // 每卷的页头名取自各书的 BOOK.brand
  // 跨卷人物：在两卷以上出现的人物，记下各卷中参与的事件 [卷序, 年, 月, 标题]，人物页据此补全其他卷的经历
  const seen = {};
  SERIES.books.forEach((b, k) => {
    const c = {}; vm.createContext(c);
    vm.runInContext(r(`./books/${b.id}/book.js`) + '\n;this.b = BOOK; this.p = PEOPLE_RAW; this.e = EVENTS;', c);
    b.brand = c.b.brand;
    // 首末事件 [年, 月, 标题]：相邻两卷时间重叠时，页面据此提示重叠的年份
    const es = c.e.slice().sort((u, v) => u.y - v.y || u.mo - v.mo), f = es[0], l = es[es.length - 1];
    b.first = [f.y, f.mo, f.t]; b.last = [l.y, l.mo, l.t];
    // 同名异人只计其条目适用的卷
    for (const [n] of c.p) if (common(n, b.id)) (seen[n] = seen[n] || []).push(k);
    for (const e of c.e) for (const n of e.who) if (common(n, b.id)) (seen['\0' + n] = seen['\0' + n] || []).push([k, e.y, e.mo, e.t, e.post && e.post.includes(n) ? 1 : 0]);
  });
  SERIES.people = {};
  // 只有 books/_people.js 登记的才算同一人；未登记的同名者（如西晋刘毅与东晋刘毅）各归各卷，不互相补全经历
  for (const n of Object.keys(seen)) if (n[0] !== '\0' && common(n, id) && new Set(seen[n]).size > 1) SERIES.people[n] = seen['\0' + n] || [];
  BASEMAP.terrain = BASEMAP.terrain.map(t => ({ ...t, href: '../' + t.href }));
}
const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const html = r('./engine/page.html')
  .replace(/\{\{(\w+)\}\}/g, (_, k) => escAttr(({ title: BOOK.title, brand: BOOK.brand, seal: BOOK.seal || '', subtitle: BOOK.subtitle || '', regionToggle: BOOK.regions?.toggle || '古政区' })[k] ?? ''))
  .replace('/*BASEMAP*/null', () => JSON.stringify(BASEMAP))
  .replace('/*SERIES*/null', () => JSON.stringify(SERIES))
  .replace('/*GEO*/null', () => r(bm + 'geo.json').trim())
  .replace('/*UNITS*/null', () => r(bm + 'units.topo.json').trim())
  .replace('/*DATA*/', () => dataSrc)
  .replace('/*APP*/', () => r('./engine/app.js').replace('/*STORY*/', () => r('./engine/story.js')).replace('/*CAL*/', () => r('./engine/cal.js')).replace('/*MUSIC*/', () => r('./engine/music.js')));
const out = new URL(SERIES_MODE ? `./dist/series/${id}/` : `./dist/${id}/`, import.meta.url);
mkdirSync(out, { recursive: true });
// 合集里的分卷是独立网页，要自带文档头
writeFileSync(new URL('index.html', out), `<!doctype html>\n<html lang="zh-CN">\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n${html}`);
if (SERIES_MODE) for (const t of BASEMAP.terrain) copyFileSync(new URL(bm + t.href.slice(3), import.meta.url), new URL(t.href, out));
else for (const t of BASEMAP.terrain) copyFileSync(new URL(bm + t.href, import.meta.url), new URL(t.href, out));
console.log(SERIES_MODE ? `dist/series/${id}/index.html` : `dist/${id}/index.html`, (html.length / 1024).toFixed(1) + ' KB', `· ${EVENTS.length} 事件 · ${PEOPLE_RAW.length} 人物`);
