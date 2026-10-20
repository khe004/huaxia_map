// 组装合集：node build-series.mjs
// 按 series.json 的卷目逐卷以 --series 方式构建到 dist/series/<书>/，再生成目录页 dist/series/index.html。
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
const r = f => readFileSync(new URL(f, import.meta.url), 'utf8');
const S = JSON.parse(r('./series.json'));
const cn = n => { const D = '〇一二三四五六七八九', t = Math.floor(n / 10), o = n % 10; return n < 10 ? D[n] : (t === 1 ? '' : D[t]) + '十' + (o ? D[o] : ''); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const rows = S.books.map((b, i) => {
  execFileSync('node', [new URL('./build.mjs', import.meta.url).pathname, b.id, '--series'], { stdio: 'inherit' });
  const c = {}; vm.createContext(c);
  vm.runInContext(r(`./books/${b.id}/book.js`) + '\n;this.__ = { BOOK, EVENTS, PEOPLE_RAW };', c);
  const { BOOK, EVENTS, PEOPLE_RAW } = c.__;
  return `<li${b.era !== S.books[i - 1]?.era ? ' class="era-start"' : ''}>
  <span class="era">${b.era !== S.books[i - 1]?.era ? esc(b.era) : ''}</span>
  <a class="vol" href="${b.id}/index.html?at=start">
    <span class="seal">${esc(BOOK.seal || b.era[0])}</span>
    <span class="body">
      <span class="no">卷${cn(i + 1)}</span>
      <span class="name">${esc(BOOK.brand)}</span>
      <span class="yrs">${esc(b.years)}</span>
      <span class="blurb">${esc(b.blurb)}</span>
      <span class="meta">${EVENTS.length} 事件 · ${PEOPLE_RAW.length} 人物</span>
    </span>
    <span class="go" aria-hidden="true">›</span>
  </a>
</li>`;
});
const html = `<title>${esc(S.title)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@500;700;900&display=swap">
<style>
:root {
  --bg: #e6e8e1; --panel: #f7f7f2; --chip: #ebece5; --ink: #1c2125; --ink2: #49525a; --muted: #747d84; --line: #b3bbba;
  --seal: #b3322a; --land: #f3f2eb; --hl: #d8941c;
  --f-display: "Ma Shan Zheng", "STKaiti", "KaiTi", serif;
  --f-serif: "Noto Serif SC", "Songti SC", "SimSun", serif;
  --f-sans: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --bg: #0f1317; --panel: #141920; --chip: #1f262c; --ink: #e8e5db; --ink2: #bcb9af; --muted: #868b8e; --line: #343d44; --seal: #e3624f; --land: #232a30; --hl: #f0b43c; color-scheme: dark; }
}
:root[data-theme="dark"] { --bg: #0f1317; --panel: #141920; --chip: #1f262c; --ink: #e8e5db; --ink2: #bcb9af; --muted: #868b8e; --line: #343d44; --seal: #e3624f; --land: #232a30; --hl: #f0b43c; color-scheme: dark; }
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
.body { display: grid; grid-template-columns: auto auto minmax(0, 1fr); column-gap: 10px; row-gap: 3px; align-items: baseline; }
.no { color: var(--muted); font-size: 12.5px; }
.name { font-family: var(--f-serif); font-weight: 700; font-size: 18px; }
.yrs { color: var(--ink2); font-size: 13px; }
.blurb { grid-column: 1 / -1; color: var(--ink2); }
.meta { grid-column: 1 / -1; color: var(--muted); font-size: 12px; }
.go { color: var(--muted); font-size: 22px; }
.vol:hover .go { color: var(--seal); }
.note { margin-top: 28px; color: var(--muted); font-size: 12.5px; line-height: 1.8; }
@media (max-width: 520px) {
  main { padding-top: 24px; }
  h1 { font-size: 34px; }
  li { grid-template-columns: 1fr; gap: 4px; }
  .era { text-align: left; padding-top: 0; font-size: 20px; }
  .era:empty { display: none; }
  .body { grid-template-columns: auto minmax(0, 1fr); }
  .yrs { grid-column: 1 / -1; }
}
@media (prefers-reduced-motion: reduce) { .vol { transition: none; } .vol:hover { transform: none; } }
</style>
<main>
  <h1>${esc(S.title)}<span class="seal">史</span></h1>
  <p class="sub">${esc(S.subtitle)}</p>
  <a class="start" href="${S.books[0].id}/index.html?at=start">从卷一读起 ›</a>
  <ol>
${rows.join('\n')}
  </ol>
  <p class="note">每卷页头有上一卷、下一卷和目录的链接。读到一卷的最后一个事件，时间轴右侧的“下一卷”按钮会亮起，点它从下一卷的开头接着读。</p>
</main>
`;
writeFileSync(new URL('./dist/series/index.html', import.meta.url), html);
console.log('dist/series/index.html', S.books.length, '卷');
