// 地球入口页：node build-globe.mjs  →  dist/series/<globe.json 的 out>/index.html（默认 dist/series/globe/）
// 把 globe.json 列出的各套合集画在同一个可旋转的地球上（engine/globe.html、engine/globe.mjs），各卷页面不变。
// 链接按发布站点的目录关系写成相对地址（各合集的 site 相对站点根目录，地球页在站点根目录下的 out/）：
// 打开某卷 → ../<site><卷>/index.html，事件简介 → ../<site>data/events.json（构建合集时导出）。
// --standalone：单独发布（如 artifact）时用。卷的链接改为 globe.json 的 pages 绝对地址，并把各合集的 events.json 复制到地球页旁边。
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { globeData } from './engine/globe.mjs';
const r = f => readFileSync(new URL(f, import.meta.url), 'utf8');
const GJ = JSON.parse(r('./globe.json'));
const STANDALONE = process.argv.includes('--standalone');
const OUT = new URL(`./dist/series/${GJ.out || 'globe'}/`, import.meta.url);
mkdirSync(OUT, { recursive: true });
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const SERIES = GJ.series.map(S => ({ ...S, books: JSON.parse(r(`./${S.dir}series.json`)).books }));
const D = globeData(SERIES);
writeFileSync(new URL('globe-data.json', OUT), JSON.stringify(D));
for (const f of ['terrain-base.webp', 'terrain-relief.webp']) copyFileSync(new URL(`./basemaps/globe/${f}`, import.meta.url), new URL(f, OUT));

const conf = {
  data: 'globe-data.json', terrain: '',
  range: GJ.range, start: GJ.start, jump: GJ.jump,
  series: SERIES.map((S, i) => {
    const vol = STANDALONE ? GJ.pages + S.site.replace(/^\.\//, '') : '../' + S.site.replace(/^\.\//, '');
    let events = vol + 'data/events.json';
    if (STANDALONE) {
      const src = new URL(`./dist/series/${S.site.replace(/^\.\//, '')}data/events.json`, import.meta.url);
      if (existsSync(src)) { copyFileSync(src, new URL(`events-${i}.json`, OUT)); events = `events-${i}.json`; }
      else console.warn(`没有 ${src.pathname}（先构建这套合集），事件简介不可用`);
    }
    return { vol, events, color: S.color, dark: S.dark || S.color };
  }),
};
// 各合集的目录页
const nav = SERIES.map((S, i) => `<a href="${esc(conf.series[i].vol)}index.html">${esc(S.name)}目录</a>`).join('');
const html = r('./engine/globe.html')
  .replace('{{SUBTITLE}}', esc(GJ.subtitle)).replace('{{NAV}}', nav).replace(/寰宇舆图/g, esc(GJ.title))
  .replace('{{CONF}}', JSON.stringify(conf).replace(/</g, '\\u003c'));
writeFileSync(new URL('index.html', OUT), html);
const kb = f => (readFileSync(new URL(f, OUT)).length / 1024).toFixed(0) + ' KB';
console.log(`${OUT.pathname}index.html · ${D.vols.length} 卷 · ${D.events.length} 事件 · 数据 ${kb('globe-data.json')}`);
