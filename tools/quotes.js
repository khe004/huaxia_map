// 校验书中标注的原文引文（**…** 或 **出处|…**）是否确实出现在原书文本中。
// 用法：node tools/quotes.js <书目录名 | _people> <原文目录> [出处=原文目录 …]
//   第一个目录核对不带出处的引文；其余如 左传=dir 核对 **左传|…**。
//   原文目录下为若干 .txt（简体），引文去掉标点、空白后在全部文本中查找。
const fs = require('fs'), path = require('path');
const [id, dir, ...more] = process.argv.slice(2);
const strip = s => s.replace(/-\{|\}-/g, '').replace(/[［］\s，。．、；：？！〈〉“”‘’「」『』《》（）()\-—…·,.;:?!'"]/g, '');
const load = d => fs.readdirSync(d).filter(f => f.endsWith('.txt')).map(f => [f.replace(/\.txt$/, ''), strip(fs.readFileSync(path.join(d, f), 'utf8'))]);
const corpora = { '': load(dir) };
for (const m of more) { const [k, d] = m.split('='); corpora[k] = load(d); }
// 以 _ 开头的是 books/ 下的共用数据文件（如 _people 跨卷人物简介）
const src = fs.readFileSync(path.join(__dirname, '..', 'books', ...(id[0] === '_' ? [id + '.js'] : [id, 'book.js'])), 'utf8');
let n = 0, bad = 0; const cnt = {};
for (const m of src.matchAll(/\*\*(?:([^|*]{1,6})\|)?(.+?)\*\*/g)) {
  n++;
  const k = m[1] || '', q = strip(m[2]); cnt[k || '默认'] = (cnt[k || '默认'] || 0) + 1;
  const c = corpora[k];
  if (!c) { bad++; console.log('? 未提供原文：', k, m[2]); continue; }
  if (!c.find(([, t]) => t.includes(q))) { bad++; console.log('✗', k ? k + '|' : '', m[2]); }
}
console.log(`${n} 条引文（${Object.entries(cnt).map(([k, v]) => k + ' ' + v).join('，')}），${n - bad} 条找到，${bad} 条未找到`);
process.exit(bad ? 1 : 0);
