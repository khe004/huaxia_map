// 无头 Chrome：noland.js、adjcolor.js 共用。环境变量 CHROME 指定可执行文件；未指定时按平台找常见路径（macOS、Linux、Windows）
const fs = require('fs'), os = require('os'), path = require('path'), { execFileSync } = require('child_process');
const CANDIDATES = {
  darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'],
  linux: ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'],
  win32: ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'],
};
function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  for (const c of CANDIDATES[process.platform] || []) {
    if (path.isAbsolute(c)) { if (fs.existsSync(c)) return c; continue; }
    try { execFileSync(process.platform === 'win32' ? 'where' : 'which', [c], { stdio: 'ignore' }); return c; } catch (e) { /* 下一个 */ }
  }
  throw new Error('找不到 Chrome，请用环境变量 CHROME 指定可执行文件路径');
}
// 临时目录（页面副本与 Chrome 的用户数据目录都放在这里），进程退出时删除
function tempDir(prefix) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  const clean = () => { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* ignore */ } };
  process.on('exit', clean); process.on('SIGINT', () => { clean(); process.exit(130); });
  return tmp;
}
// 打开本地页面，等页面脚本跑完后返回 DOM
function dumpDom(chrome, file, tmp) {
  return execFileSync(chrome, ['--headless=new', '--disable-gpu', '--user-data-dir=' + path.join(tmp, 'profile'), '--virtual-time-budget=20000', '--dump-dom', 'file://' + file],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 28 });
}
module.exports = { findChrome, tempDir, dumpDom };
