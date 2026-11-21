// 抓取西方各卷引文核对用的原典英译（Perseus Digital Library 的 TEI 文本，托管在 GitHub 的 PerseusDL/canonical-* 仓库），
// 去掉标签与注释，存成 tools/.corpus/west/<名>.txt，供 node tools/quotes.js <卷> tools/.corpus/west 核对 **译文||原文** 的原文一侧。
// 用法：node tools/fetch-perseus.js [名 …]（不写则全部；已有的跳过，加 -f 重抓）
// 译本都是公有领域的旧译：波利比乌斯为 Shuckburgh（1889），李维为 Roberts，阿庇安为 White（1899），普鲁塔克为 Perrin（1914–1921），撒路斯提乌斯为 Watson（1899）。
const fs = require('fs'), path = require('path'), https = require('https');
const G = 'https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/', L = 'https://raw.githubusercontent.com/PerseusDL/canonical-latinLit/master/data/';
const WORKS = {
  波利比乌斯: G + 'tlg0543/tlg001/tlg0543.tlg001.perseus-eng2.xml',
  李维: L + 'phi0914/phi001/phi0914.phi001.perseus-eng3.xml',
  阿庇安西西里: G + 'tlg0551/tlg006/tlg0551.tlg006.perseus-eng2.xml',
  阿庇安西班牙: G + 'tlg0551/tlg007/tlg0551.tlg007.perseus-eng2.xml',
  阿庇安汉尼拔: G + 'tlg0551/tlg008/tlg0551.tlg008.perseus-eng2.xml',
  阿庇安布匿: G + 'tlg0551/tlg009/tlg0551.tlg009.perseus-eng2.xml',
  阿庇安努米底亚: G + 'tlg0551/tlg010/tlg0551.tlg010.perseus-eng2.xml',
  阿庇安马其顿: G + 'tlg0551/tlg011/tlg0551.tlg011.perseus-eng2.xml',
  阿庇安伊利里亚: G + 'tlg0551/tlg012/tlg0551.tlg012.perseus-eng2.xml',
  阿庇安叙利亚: G + 'tlg0551/tlg013/tlg0551.tlg013.perseus-eng2.xml',
  阿庇安米特拉达梯: G + 'tlg0551/tlg014/tlg0551.tlg014.perseus-eng2.xml',
  阿庇安内战: G + 'tlg0551/tlg017/tlg0551.tlg017.perseus-eng2.xml',
  普鲁塔克费边: G + 'tlg0007/tlg013/tlg0007.tlg013.perseus-eng2.xml',
  普鲁塔克埃米利乌斯: G + 'tlg0007/tlg019/tlg0007.tlg019.perseus-eng2.xml',
  普鲁塔克马塞卢斯: G + 'tlg0007/tlg022/tlg0007.tlg022.perseus-eng2.xml',
  普鲁塔克加图: G + 'tlg0007/tlg025/tlg0007.tlg025.perseus-eng2.xml',
  普鲁塔克弗拉米尼努斯: G + 'tlg0007/tlg028/tlg0007.tlg028.perseus-eng2.xml',
  普鲁塔克马略: G + 'tlg0007/tlg031/tlg0007.tlg031.perseus-eng2.xml',
  普鲁塔克苏拉: G + 'tlg0007/tlg033/tlg0007.tlg033.perseus-eng2.xml',
  普鲁塔克格拉古: G + 'tlg0007/tlg052/tlg0007.tlg052.perseus-eng1.xml',
  撒路斯提乌斯朱古达: L + 'phi0631/phi002/phi0631.phi002.perseus-eng2.xml',
};
const OUT = path.join(__dirname, '.corpus', 'west');
fs.mkdirSync(OUT, { recursive: true });
const get = u => new Promise((ok, no) => https.get(u, r => { if (r.statusCode !== 200) return no(new Error(r.statusCode + ' ' + u)); const b = []; r.on('data', d => b.push(d)); r.on('end', () => ok(Buffer.concat(b).toString('utf8'))); }).on('error', no));
// TEI → 纯文本：去掉注释、校勘、页码等，保留正文；实体与多余空白规整
const toText = x => x.replace(/<teiHeader[\s\S]*?<\/teiHeader>/, '').replace(/<(note|bibl|head|milestone|pb|lb)\b[^>]*\/>/g, ' ')
  .replace(/<(note|bibl)\b[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&[a-z]+;/g, ' ')
  .replace(/[ \t\r\n]+/g, ' ').trim();
(async () => {
  const force = process.argv.includes('-f'), names = process.argv.slice(2).filter(a => a !== '-f');
  for (const [k, u] of Object.entries(WORKS)) {
    if (names.length && !names.includes(k)) continue;
    const f = path.join(OUT, k + '.txt'); if (!force && fs.existsSync(f)) continue;
    try { fs.writeFileSync(f, toText(await get(u))); console.log(k, Math.round(fs.statSync(f).size / 1024) + ' KB'); } catch (e) { console.log('✗', k, e.message); }
  }
})();
