// 校验书中标注的原文引文（**…** 或 **出处|…**）是否确实出现在原书文本中。
// 用法：node tools/quotes.js <书目录名 | _people> <原文目录> [出处=原文目录 …]
//   第一个目录核对不带出处的引文；其余如 左传=dir 核对 **左传|…**；*=dir 核对其余未单列的出处（如诗文篇名）。
//   原文目录下为若干 .txt（简体），引文去掉标点、空白后在全部文本中查找。
const fs = require('fs'), path = require('path');
// 原文的异体字按通行字比较（籓→藩、砲→炮、於→于、籐→藤、隣→邻、篛→箬、鴈→雁、疎→疏、臯→皋、粧→妆、祇→只、瘖→喑、囘→回、靑→青、衞→卫、淸→清、戸→户；简繁转换把“著”多转成“着”，两边都按“著”比），书中引文写通行字
const strip = s => s.replace(/[籓砲於籐隣篛鴈疎臯粧祇瘖囘靑衞淸着戸]/g, c => ({ 籓: '藩', 砲: '炮', 於: '于', 籐: '藤', 隣: '邻', 篛: '箬', 鴈: '雁', 疎: '疏', 臯: '皋', 粧: '妆', 祇: '只', 瘖: '喑', 囘: '回', 靑: '青', 衞: '卫', 淸: '清', 着: '著', 戸: '户' })[c]).replace(/-\{|\}-/g, '').replace(/[［］\s，。．、；：？！〈〉“”‘’「」『』《》（）()\-—…·,.;:?!'"]/g, '');
// 原文文本（维基文库）里的个别讹字：书中引文按正字写，核对前先把原文改正
const ERRATA = [['晋一等候爵', '晋一等侯爵'], ['温州为里安府', '温州为瑞安府'], ['置行台尚书省为汴', '置行台尚书省于汴'], ['荒为酒', '荒于酒'],
  ['右都临完颜思敬', '右都监完颜思敬'], ['尽遂卫士', '尽逐卫士']].map(([a, b]) => [strip(a), strip(b)]);
const fixText = t => ERRATA.reduce((s, [a, b]) => s.split(a).join(b), t);
// 书中的引文：注释行里的 **…**（说明引文写法的示例）不算；返回 [出处前缀, 引文] 列表
const quotesIn = src => [...src.replace(/^\s*\/\/.*$/gm, '').matchAll(/\*\*(?:([^|*]{1,6})\|)?(.+?)\*\*/g)].map(m => [m[1] || '', m[2]]);
module.exports = { strip, fixText, quotesIn };
if (require.main === module) {
const [id, dir, ...more] = process.argv.slice(2);
if (!id || !dir) { console.error('用法：node tools/quotes.js <书目录名 | _people> <原文目录> [出处=原文目录 …]'); process.exit(2); }
const load = d => fs.readdirSync(d).filter(f => f.endsWith('.txt')).map(f => [f.replace(/\.txt$/, ''), fixText(strip(fs.readFileSync(path.join(d, f), 'utf8')))]);
const corpora = { '': load(dir) };
for (const m of more) { const [k, d] = m.split('='); corpora[k] = load(d); }
// 以 _ 开头的是 books/ 下的共用数据文件（如 _people 跨卷人物简介）
const src = fs.readFileSync(path.join(__dirname, '..', 'books', ...(id[0] === '_' ? [id + '.js'] : [id, 'book.js'])), 'utf8');
let n = 0, bad = 0; const cnt = {};
// 注释行里的 **…**（说明引文写法的示例）不算引文
for (const m of src.replace(/^\s*\/\/.*$/gm, '').matchAll(/\*\*(?:([^|*]{1,6})\|)?(.+?)\*\*/g)) {
  n++;
  const k = m[1] || '', q = strip(m[2]); cnt[k || '默认'] = (cnt[k || '默认'] || 0) + 1;
  const c = corpora[k] || (k && corpora['*']);
  if (!c) { bad++; console.log('? 未提供原文：', k, m[2]); continue; }
  // 去掉标点后为空的（如 **……**）不算找到
  if (!q || !c.find(([, t]) => t.includes(q))) { bad++; console.log('✗', k ? k + '|' : '', m[2]); }
}
console.log(`${n} 条引文（${Object.entries(cnt).map(([k, v]) => k + ' ' + v).join('，')}），${n - bad} 条找到，${bad} 条未找到`);
process.exit(bad ? 1 : 0);
}
