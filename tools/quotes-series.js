// 合集（如 series/west）逐卷核对译文引文，结果写入合集根目录的 quotes-log.json，目录页“凡例”据此统计
// 用法：YUTU_SERIES=series/west node tools/quotes-series.js tools/.corpus/west
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const R = require('./root.js').R, dir = process.argv[2];
if (!dir) { console.error('用法：YUTU_SERIES=series/west node tools/quotes-series.js <原文目录>'); process.exit(2); }
const S = JSON.parse(fs.readFileSync(path.join(R, 'series.json'), 'utf8')), log = {}, today = new Date().toISOString().slice(0, 10);
for (const id of S.books.map(b => b.id)) {
  let out = '';
  try { out = execFileSync('node', [path.join(__dirname, 'quotes.js'), id, dir], { encoding: 'utf8' }); } catch (e) { out = String(e.stdout || ''); }
  const m = out.match(/(\d+) 条引文.*?(\d+) 条找到/);
  log[id] = { date: today, quotes: m ? +m[1] : 0, found: m ? +m[2] : 0, missing: out.split('\n').filter(l => /未找到：|✗/.test(l)) };
  console.log(id, log[id].quotes, log[id].found);
}
fs.writeFileSync(path.join(R, 'quotes-log.json'), JSON.stringify(log, null, 1) + '\n');
