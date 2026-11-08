// 把维基文库 action=raw 抓下的原文整理为简体纯文本，供 tools/quotes.js 核对引文。
// 用法：node tools/corpus.js <原始文件目录> <输出目录> <映射 JSON 文件>
//   映射 JSON：{ "j007.txt": "项羽本纪", ... }
// 处理：保留 {{专名号|…}} 等模板里的文字、-{…}- 字形标记，去掉其余模板与标签，繁转简（opencc-js）。
const fs = require('fs'), path = require('path');
const OpenCC = require('opencc-js'); const cv = OpenCC.Converter({ from: 'tw', to: 'cn' });
// 维基文库 wikitext → 简体纯文本（tools/fetch-corpus.js 也用）
function clean(t) {
  t = t.replace(/-\{([^{}]*)\}-/g, '$1');
  // 异文模板 {{另|甲|乙}}：取正文的读法（第一项）
  t = t.replace(/\{\{(?:另|異文|异文)\|([^{}|]*)(?:\|[^{}]*)?\}\}/g, '$1');
  for (let k = 0; k < 5; k++) t = t.replace(/\{\{[^{}|]*\|([^{}]*)\}\}/g, '$1');
  t = t.replace(/\{\{[^{}]*\}\}/g, '').replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1').replace(/\[\[([^\]|]*)\]\]/g, '$1').replace(/<[^>]+>/g, '');
  return cv(t).replace(/\n+/g, '\n');
}
module.exports = { clean };
if (require.main === module) {
  const [inDir, outDir, mapFile] = process.argv.slice(2);
  const map = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
  fs.mkdirSync(outDir, { recursive: true });
  for (const [file, name] of Object.entries(map)) fs.writeFileSync(path.join(outDir, name + '.txt'), clean(fs.readFileSync(path.join(inDir, file), 'utf8')));
  console.log(Object.keys(map).length, '篇 →', outDir);
}
