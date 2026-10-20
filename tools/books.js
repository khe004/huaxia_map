// 检查脚本默认处理的书：合集 series.json 的各卷，加上 books/ 下其他独立成书的目录（如《三国演义》 sanguo；以 _ 开头的模板等除外）
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
module.exports = () => {
  const series = JSON.parse(fs.readFileSync(R + '/series.json')).books.map(b => b.id);
  const extra = fs.readdirSync(R + '/books').filter(d => !d.startsWith('_') && !series.includes(d) && fs.existsSync(`${R}/books/${d}/book.js`));
  return [...series, ...extra];
};
