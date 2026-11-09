// 用法：node tools/smoke.js [书 …]（先 node build-series.mjs）
// 页面冒烟测试：在无头 Chrome 里打开合集各卷与目录页，模拟读者操作，收集脚本报错。各卷逐个翻完全部事件，打开人物页，切换右栏各页签、
// 人物交汇图与文化线；目录页逐个打开各页签，在总览里翻几帧、播放，在检索里搜一个词。
// 脚本报错、未处理的 Promise 拒绝、console.error、引擎的“unknown seed / missing person”警告、图片等资源加载失败都算失败；
// 外部字体（Google Fonts）加载失败不算。地图没有画出拼块也算失败。有失败即以 1 退出，CI 构建后跑这一步。
// 需要 Chrome（tools/chrome.js 按平台查找，或用环境变量 CHROME 指定），默认同时开 4 个。
const fs = require('fs'), path = require('path'), { execFile } = require('child_process');
const { findChrome, tempDir } = require('./chrome.js');
const R = path.join(__dirname, '..'), D = path.join(R, 'dist/series');
const CHROME = findChrome(), TMP = tempDir('smoke-');
const S = JSON.parse(fs.readFileSync(path.join(R, 'series.json'), 'utf8'));
const ids = process.argv.slice(2).length ? process.argv.slice(2) : S.books.map(b => b.id);

// 最先运行：收集报错
const HEAD = `<script>(function(){var E=window.__smokeErr=[];
addEventListener('error',function(e){var t=e.target;if(t&&t!==window&&(t.src||t.href)){var u=t.src||t.href;if(!/fonts\\.(googleapis|gstatic)\\.com/.test(u))E.push('资源加载失败：'+u);}else E.push('脚本错误：'+e.message+' @'+(e.filename||'').slice(-40)+':'+e.lineno);},true);
addEventListener('unhandledrejection',function(e){E.push('未处理的拒绝：'+(e.reason&&e.reason.message||e.reason));});
var ce=console.error,cw=console.warn;
console.error=function(){E.push('console.error：'+[].map.call(arguments,String).join(' '));ce.apply(console,arguments);};
console.warn=function(){var m=[].map.call(arguments,String).join(' ');if(/unknown seed|missing person/.test(m))E.push('引擎警告：'+m);cw.apply(console,arguments);};
})();</script>`;
// 页面载入后：模拟操作，最后把结果写到 <html data-smoke>
const ACT_BOOK = `<script>addEventListener('load',function(){var $=function(s){return document.querySelector(s)},E=window.__smokeErr,n=0;
function click(el){if(el)el.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
function done(){var r={err:E,cells:document.querySelectorAll('#map path.cell').length,steps:n,panel:($('#pbody')||{}).textContent?$('#pbody').textContent.length:0};document.documentElement.setAttribute('data-smoke',JSON.stringify(r));}
function tail(){try{
  click($('#pbody .chips button, #pbody .chip[data-person], #pbody [data-person]'));
  [].forEach.call(document.querySelectorAll('#tabs button'),function(b){click(b);});
  click($('#viewsw button[data-mode="story"]'));click($('#viewsw button[data-mode="map"]'));
  var ls=$('#linesw');if(ls&&!ls.hidden){click($('#linesw button[data-line="cul"]'));click($('#linesw button[data-line="main"]'));}
  var tl=$('#tg-lines');if(tl){tl.click();tl.click();}
}catch(x){E.push('操作出错：'+x.message);}setTimeout(done,1500);}
function next(){var b=$('#nextEv');if(n<400&&b&&!b.disabled){click(b);n++;setTimeout(next,60);}else tail();}
setTimeout(next,800);});</script>`;
const ACT_INDEX = `<script>addEventListener('load',function(){var $=function(s){return document.querySelector(s)},E=window.__smokeErr;
function click(el){if(el)el.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
function done(){var r={err:E,ov:document.querySelectorAll('#ovmap .ovu path').length,strip:document.querySelectorAll('#ovstrip .db').length,about:($('#about')||{}).textContent?$('#about').textContent.length:0};document.documentElement.setAttribute('data-smoke',JSON.stringify(r));}
setTimeout(function(){try{
  [].forEach.call(document.querySelectorAll('#tabs [role=tab]'),function(b){click(b);});
  click($('[data-tab="overview"]'));for(var i=0;i<5;i++)click($('#ovnext'));click($('#ovprev'));click($('#ovrep button'));click($('#ovplay'));
  var q=$('#q');if(q){click($('[data-tab="search"]'));q.value='项羽';q.dispatchEvent(new Event('input',{bubbles:true}));}
}catch(x){E.push('操作出错：'+x.message);}setTimeout(function(){click($('#ovplay'));setTimeout(done,800);},3000);},800);});</script>`;

// 中途退出时删掉还留着的 __smoke.html
const LEFT = new Set(); process.on('exit', () => LEFT.forEach(f => { try { fs.unlinkSync(f); } catch (e) { /* 已删 */ } }));
function inject(html, act) {
  const i = html.indexOf('<meta charset="utf-8">'), j = i + '<meta charset="utf-8">'.length;
  const k = html.lastIndexOf('</body>'), body = k >= 0 ? k : html.length;
  return html.slice(0, j) + HEAD + html.slice(j, body) + act + html.slice(body);
}
function run(id) {
  const isIndex = id === '(目录页)', dir = isIndex ? D : path.join(D, id), src = path.join(dir, 'index.html');
  if (!fs.existsSync(src)) return Promise.resolve({ id, fail: ['没有找到 ' + path.relative(R, src) + '，先构建'] });
  // 改过的页面放在原目录（相对路径的地形图等资源照常加载），跑完删除
  const f = path.join(dir, '__smoke.html');
  fs.writeFileSync(f, inject(fs.readFileSync(src, 'utf8'), isIndex ? ACT_INDEX : ACT_BOOK));
  LEFT.add(f);
  const prof = path.join(TMP, 'p-' + Math.random().toString(36).slice(2));
  return new Promise(res => execFile(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', '--user-data-dir=' + prof, '--window-size=1400,900',
    '--virtual-time-budget=60000', '--dump-dom', 'file://' + f + (isIndex ? '#tab=overview' : '')], { encoding: 'utf8', maxBuffer: 1 << 28, timeout: 180000 }, (err, out) => {
    try { fs.unlinkSync(f); } catch (e) { /* ignore */ } LEFT.delete(f);
    const m = (out || '').match(/data-smoke="([^"]*)"/);
    if (!m) return res({ id, fail: ['页面没有返回结果' + (err ? '：' + err.message.split('\n')[0] : '')] });
    const r = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
    const fail = [...r.err];
    if (isIndex) { if (!r.ov) fail.push('总览地图没有画出拼块'); if (!r.strip) fail.push('朝代条带为空'); if (!r.about) fail.push('凡例为空'); }
    else { if (!r.cells) fail.push('地图没有画出拼块'); if (!r.steps) fail.push('“下一事件”一步也没有翻'); }
    res({ id, fail, info: isIndex ? `总览 ${r.ov} 块` : `${r.steps} 步` });
  }));
}
(async () => {
  const queue = [...ids, '(目录页)'], out = [];
  const N = +process.env.SMOKE_JOBS || 4;
  await Promise.all(Array.from({ length: N }, async () => { while (queue.length) { const id = queue.shift(); let r = await run(id);
    // CDN 上的脚本偶尔加载失败（网络波动），这种情况重跑一次
    if (r.fail.some(x => /资源加载失败：https?:/.test(x))) r = await run(id);
    out.push(r);
    console.log(`${r.fail.length ? '✗' : '✓'} ${r.id}${r.info ? '（' + r.info + '）' : ''}${r.fail.length ? '\n    ' + [...new Set(r.fail)].slice(0, 8).join('\n    ') : ''}`); } }));
  const bad = out.filter(r => r.fail.length);
  console.log(`共 ${out.length} 页，${bad.length} 页有问题`);
  process.exit(bad.length ? 1 : 0);
})();
