// 按各卷篇目表（BOOK.source.titles）抓取维基文库原文，供 tools/quotecheck.js 核对引文。
// 用法：node tools/fetch-corpus.js [书 …]   （先在 tools/ 下 npm i，要用 opencc-js）
// 缓存在 tools/.corpus/（不入库）：idx/ 各书的页面目录，raw/ 维基文本，cn/ 简体纯文本，map.json 各卷用到的页面与未能对上的篇目。
// 篇目对页面：键带“汉书·”前缀的、值里写《某书》的按该书，否则按本卷 source.heading 的第一部书；值里的“卷N（上中下）”“卷N至M”对到该书的分卷页面，
// 页面名的写法（卷001、卷1、卷五十三）各书不一，先列出该书全部子页面再按卷数匹配；没有卷数的诗文、文献按篇名（含 srcFull 的全名、值里《》中的名字）找同名页面。
// 只用 User-Agent“yutu-map/1.0”，逐个请求、每次间隔 1.5 秒，遇到限流退避重试。
const fs = require('fs'), path = require('path'), vm = require('vm');
const OpenCC = require('opencc-js');
const { clean } = require('./corpus.js');
const books = require('./books.js');
const R = path.join(__dirname, '..'), C = path.join(__dirname, '.corpus');
const UA = 'yutu-map/1.0', API = 'https://zh.wikisource.org/w/api.php', RAW = 'https://zh.wikisource.org/w/index.php';
const toTw = OpenCC.Converter({ from: 'cn', to: 'tw' });
['idx', 'raw', 'cn'].forEach(d => fs.mkdirSync(path.join(C, d), { recursive: true }));

// 简体书名 → 维基文库的书名
const WS = { 史记: '史記', 汉书: '漢書', 后汉书: '後漢書', 三国志: '三國志', 晋书: '晉書', 宋书: '宋書', 南齐书: '南齊書', 梁书: '梁書', 陈书: '陳書', 魏书: '魏書', 北齐书: '北齊書', 周书: '周書', 北史: '北史', 南史: '南史', 隋书: '隋書', 旧唐书: '舊唐書', 新唐书: '新唐書', 旧五代史: '舊五代史', 新五代史: '新五代史', 宋史: '宋史', 辽史: '遼史', 金史: '金史', 元史: '元史', 明史: '明史', 清史稿: '清史稿', 资治通鉴: '資治通鑑', 续资治通鉴长编: '續資治通鑑長編', 建炎以来系年要录: '建炎以來繫年要錄', 春秋左氏传: '春秋左氏傳' };
const CN = '零〇一二三四五六七八九';
function cnNum(s) {
  if (/^\d+$/.test(s)) return +s;
  let n = 0, cur = 0;
  for (const ch of s) {
    const d = CN.indexOf(ch);
    if (d >= 0) cur = d > 1 ? d - 1 : 0;
    else if (ch === '十') { n += (cur || 1) * 10; cur = 0; } else if (ch === '百') { n += (cur || 1) * 100; cur = 0; } else if (ch === '千') { n += (cur || 1) * 1000; cur = 0; }
  }
  return n + cur;
}
const NUM = '[零〇一二三四五六七八九十百千\\d]+';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let last = 0;
async function get(url) {
  for (let k = 0; k < 6; k++) {
    const wait = last + 1500 - Date.now(); if (wait > 0) await sleep(wait);
    last = Date.now();
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (r.status === 404) return null;
      if (r.ok) return await r.text();
      console.error('  HTTP', r.status, '退避重试');
    } catch (e) { console.error('  ', e.message, '退避重试'); }
    await sleep(15000 * (k + 1));
  }
  throw new Error('抓取失败：' + url);
}
const api = async q => JSON.parse(await get(API + '?' + new URLSearchParams({ format: 'json', ...q })));
const fname = t => t.replace(/[\/:*?"<>|]/g, '_');

// 一部书的全部子页面名
async function index(ws) {
  const f = path.join(C, 'idx', fname(ws) + '.json');
  if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf8'));
  const out = []; let cont = {};
  for (;;) {
    const d = await api({ action: 'query', list: 'allpages', apprefix: ws + '/', aplimit: 500, ...cont });
    out.push(...d.query.allpages.map(p => p.title));
    if (!d.continue) break; cont = d.continue;
  }
  fs.writeFileSync(f, JSON.stringify(out));
  return out;
}
// 卷 n（后缀上中下，可空）对应的页面：后缀为空时，分上下的卷全部取
function juanPages(idx, ws, n, suf) {
  const re = new RegExp(`^${ws}/卷(${NUM})([上中下]?)$`);
  return idx.filter(t => { const m = t.match(re); return m && cnNum(m[1]) === n && (!suf || m[2] === suf); });
}
// 抓一页（跟随重定向；消歧义页按作者取其中一篇），存 raw 与 cn。raw 已有的不再抓，cn 每次按 raw 重新生成（改了 clean 规则后重跑即可）
async function page(title, author) {
  const fr = path.join(C, 'raw', fname(title) + '.txt');
  if (!fs.existsSync(fr)) {
    let t = title, raw;
    for (let k = 0; k < 4; k++) {
      raw = await get(RAW + '?' + new URLSearchParams({ title: t, action: 'raw' }));
      if (raw == null) return false;
      const m = raw.match(/^#(?:REDIRECT|重定向)\s*\[\[([^\]|#]+)/i);
      if (m) { t = m[1].trim(); continue; }
      if (/\{\{\s*(消歧義|消歧义|disambig)/i.test(raw)) {
        const links = [...raw.matchAll(/\[\[([^\]|#]+)/g)].map(x => x[1].trim()).filter(x => !/^(Category|分類|分类|Author|作者):/i.test(x));
        const pick = author && links.find(x => x.includes(toTw(author)) || x.includes(author));
        if (!pick) return false;
        t = pick; continue;
      }
      break;
    }
    // 页面由子页面嵌入拼成（{{:某诗 (首句)}}）的，展开一层
    const subs = [...raw.matchAll(/\{\{:([^{}|]+)\}\}/g)].slice(0, 20);
    for (const [all, sub] of subs) { const r = await get(RAW + '?' + new URLSearchParams({ title: sub.trim(), action: 'raw' })); raw = raw.replace(all, r || ''); }
    // 扫描本校对页（<pages index="某.djvu" from=a to=b />）：逐页取 Page:某.djvu/n
    for (const [all, ix, a, b] of [...raw.matchAll(/<pages\s+index="([^"]+)"\s+from="?(\d+)"?\s+to="?(\d+)"?[^>]*>/g)]) {
      let out = '';
      for (let n = +a; n <= Math.min(+b, +a + 40); n++) out += (await get(RAW + '?' + new URLSearchParams({ title: `Page:${ix}/${n}`, action: 'raw' }))) || '';
      raw = raw.replace(all, out);
    }
    // 目录页（正文分在子页面，列作 *[[/某章|…]]）：把子页面接在后面
    const kids = [...raw.matchAll(/^\*+\s*\[\[(\/[^\]|#]+)/gm)].map(x => t + x[1].trim().replace(/\/$/, ''));
    if (kids.length >= 2) for (const kid of kids.slice(0, 40)) raw += '\n' + ((await get(RAW + '?' + new URLSearchParams({ title: kid, action: 'raw' }))) || '');
    fs.writeFileSync(fr, raw);
  }
  fs.writeFileSync(path.join(C, 'cn', fname(title) + '.txt'), clean(fs.readFileSync(fr, 'utf8')));
  return true;
}
// 没有卷数的篇目：按候选名查维基文库是否有同名页面（批量查询，跟随重定向）
async function exists(names) {
  const tw = [...new Set(names.flatMap(n => [n, toTw(n)]))].slice(0, 40);
  const d = await api({ action: 'query', titles: tw.join('|'), redirects: 1 });
  const ps = Object.values(d.query.pages || {}).filter(p => !('missing' in p) && !('invalid' in p));
  // 按候选名的先后取第一个存在的
  const red = Object.fromEntries((d.query.redirects || []).map(r => [r.from, r.to]));
  const norm = Object.fromEntries((d.query.normalized || []).map(r => [r.from, r.to]));
  for (const n of tw) { const t = red[norm[n] || n] || norm[n] || n; if (ps.some(p => p.title === t)) return t; }
  return null;
}

(async () => {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : books();
  const mapF = path.join(C, 'map.json'), MAP = fs.existsSync(mapF) ? JSON.parse(fs.readFileSync(mapF, 'utf8')) : {};
  for (const id of ids) {
    const c = {}; vm.createContext(c);
    vm.runInContext(fs.readFileSync(`${R}/books/${id}/book.js`, 'utf8') + ';this.X={BOOK}', c);
    const B = c.X.BOOK, titles = (B.source && B.source.type !== 'chapters' && B.source.titles) || {};  // 章回体（《三国演义》）没有史书引文，不抓
    const def = ((B.source.heading || '').match(/《([^》]+)》/) || (B.quoteLabel || '').match(/《([^》]+)》/) || [])[1];
    const pages = new Set(), miss = [];
    for (const [k, v0] of Object.entries(titles)) {
      const v = String(v0), pre = k.includes('·') ? k.split('·')[0] : null, inV = (v.match(/《([^》·]+)/) || [])[1];
      let jm = v.match(new RegExp(`卷(${NUM})([上中下]?)(?:\\s*[至—–-]\\s*卷?(${NUM})([上中下]?))?`));
      // 《三国志》按魏、蜀、吴书各自编号（魏书一至三十、蜀书一至十五、吴书一至二十），维基文库按全书卷01至卷65
      const sg = (pre || def) === '三国志' && v.match(new RegExp(`^(魏|蜀|吴)书(${NUM})`));
      const bk2 = sg ? '三国志' : null;
      if (sg) jm = [, String({ 魏: 0, 蜀: 30, 吴: 45 }[sg[1]] + cnNum(sg[2])), ''];
      const bk = bk2 || (pre && WS[pre] ? pre : inV && WS[inV] ? inV : WS[def] && /卷/.test(v) ? def : null);
      let got = [];
      if (bk && jm) {
        const ws = WS[bk], idx = await index(ws), a = cnNum(jm[1]), b = jm[3] ? cnNum(jm[3]) : a;
        for (let n = a; n <= b; n++) got.push(...juanPages(idx, ws, n, a === b ? jm[2] : ''));
      } else if (bk === '春秋左氏传') got = (await index(WS[bk])).filter(t => !/\/.*\//.test(t));
      else {
        const names = [(B.srcFull || {})[k], k.replace(/^.*·/, ''), ...[...v.matchAll(/《([^》]+)》/g)].map(m => m[1].replace(/^.*·/, ''))].filter(Boolean);
        const t = await exists(names); if (t) got = [t];
      }
      const ok = [];
      // 诗文篇目的值多写作“某某作”“某某《……》”：取作者名，用于在消歧义页里挑选
      const author = (v.match(/^([^\s《，（作]{2,4})(?:作|《)/) || [])[1];
      for (const t of got) if (await page(t, author)) ok.push(t);
      if (ok.length) ok.forEach(t => pages.add(t)); else miss.push(k);
    }
    MAP[id] = { pages: [...pages], miss };
    fs.writeFileSync(mapF, JSON.stringify(MAP, null, 1));
    console.log(id, pages.size, '页', miss.length ? `· 未对上 ${miss.length}：${miss.join('、')}` : '');
  }
})();
