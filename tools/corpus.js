// 把维基文库 action=raw 抓下的原文整理为简体纯文本，供 tools/quotes.js 核对引文。
// 用法：node tools/corpus.js <原始文件目录> <输出目录> <映射 JSON 文件>
//   映射 JSON：{ "j007.txt": "项羽本纪", ... }
// 处理：保留 {{专名号|…}} 等模板里的文字、-{…}- 字形标记，去掉其余模板与标签，繁转简（opencc-js）。
const fs = require('fs'), path = require('path');
const OpenCC = require('opencc-js'); const cv = OpenCC.Converter({ from: 'tw', to: 'cn' });
const [inDir, outDir, mapFile] = process.argv.slice(2);
const map = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });
for (const [file, name] of Object.entries(map)) {
  let t = fs.readFileSync(path.join(inDir, file), 'utf8');
  t = t.replace(/-\{([^{}]*)\}-/g, '$1');
  for (let k = 0; k < 5; k++) t = t.replace(/\{\{[^{}|]*\|([^{}]*)\}\}/g, '$1');
  t = t.replace(/\{\{[^{}]*\}\}/g, '').replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1').replace(/\[\[([^\]|]*)\]\]/g, '$1').replace(/<[^>]+>/g, '');
  fs.writeFileSync(path.join(outDir, name + '.txt'), cv(t).replace(/\n+/g, '\n'));
}
console.log(Object.keys(map).length, '篇 →', outDir);
