// 用法：node tools/caltext.js <书> [年份…]：列出各事件在页面上显示的纪年（engine/cal.js 的 calText）与该年的年号表（erasFor）
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = path.join(__dirname, '..'), [id, ...ys] = process.argv.slice(2);
const c = {}; vm.createContext(c);
vm.runInContext(fs.readFileSync(R + '/engine/cal.js', 'utf8') + '\n' + fs.readFileSync(`${R}/books/${id}/book.js`, 'utf8') + ';this.__ = { BOOK, EVENTS, calText, erasFor };', c);
const { BOOK, EVENTS, calText, erasFor } = c.__, C = BOOK.calendar || {}, eras = y => erasFor(C, y);
for (const e of EVENTS) if (!ys.length || ys.includes(String(e.y))) console.log(e.y, String(e.mo).padEnd(5), e.t.padEnd(14), '|', calText(e, C, BOOK.range, eras), '|', eras(e.y).map(x => x.d + ':' + x.s).join(' '));
