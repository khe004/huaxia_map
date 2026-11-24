// 抓取西方各卷引文核对用的原典英译（Perseus Digital Library 的 TEI 文本，托管在 GitHub 的 PerseusDL/canonical-* 仓库），
// 去掉标签与注释，存成 tools/.corpus/west/<名>.txt，供 node tools/quotes.js <卷> tools/.corpus/west 核对 **译文||原文** 的原文一侧。
// 近东各卷另用古腾堡计划的公版书（GITenberg 在 GitHub 上的镜像，{ gut: '仓库/分支/文件' }）与钦定本《圣经》（{ kjv: [书卷 …] }，aruljohn/Bible-kjv 的 JSON）。
// 用法：node tools/fetch-perseus.js [名 …]（不写则全部；已有的跳过，加 -f 重抓）
// 译本都是公有领域的旧译：波利比乌斯为 Shuckburgh（1889），李维为 Roberts，阿庇安为 White（1899），普鲁塔克为 Perrin（1914–1921），撒路斯提乌斯为 Watson（1899），希罗多德为 Godley（1920），修昔底德为 Crawley（1874），荷马为 Murray（1919–1924），色诺芬为 Brownson、Dakyns 等。
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
  希罗多德: G + 'tlg0016/tlg001/tlg0016.tlg001.perseus-eng2.xml',
  修昔底德: G + 'tlg0003/tlg001/tlg0003.tlg001.perseus-eng6.xml',
  伊利亚特: G + 'tlg0012/tlg001/tlg0012.tlg001.perseus-eng3.xml',
  奥德赛: G + 'tlg0012/tlg002/tlg0012.tlg002.perseus-eng3.xml',
  普鲁塔克忒修斯: G + 'tlg0007/tlg001/tlg0007.tlg001.perseus-eng3.xml',
  普鲁塔克罗慕路斯: G + 'tlg0007/tlg002/tlg0007.tlg002.perseus-eng2.xml',
  普鲁塔克吕库古: G + 'tlg0007/tlg004/tlg0007.tlg004.perseus-eng2.xml',
  普鲁塔克努马: G + 'tlg0007/tlg005/tlg0007.tlg005.perseus-eng2.xml',
  普鲁塔克梭伦: G + 'tlg0007/tlg007/tlg0007.tlg007.perseus-eng2.xml',
  普鲁塔克普布利科拉: G + 'tlg0007/tlg008/tlg0007.tlg008.perseus-eng2.xml',
  普鲁塔克地米斯托克利: G + 'tlg0007/tlg010/tlg0007.tlg010.perseus-eng2.xml',
  普鲁塔克卡米卢斯: G + 'tlg0007/tlg011/tlg0007.tlg011.perseus-eng2.xml',
  普鲁塔克伯利克利: G + 'tlg0007/tlg012/tlg0007.tlg012.perseus-eng2.xml',
  普鲁塔克亚西比德: G + 'tlg0007/tlg015/tlg0007.tlg015.perseus-eng2.xml',
  普鲁塔克科里奥兰纳斯: G + 'tlg0007/tlg016/tlg0007.tlg016.perseus-eng2.xml',
  普鲁塔克提摩利昂: G + 'tlg0007/tlg018/tlg0007.tlg018.perseus-eng2.xml',
  普鲁塔克佩洛皮达斯: G + 'tlg0007/tlg021/tlg0007.tlg021.perseus-eng2.xml',
  普鲁塔克阿里斯提德: G + 'tlg0007/tlg024/tlg0007.tlg024.perseus-eng2.xml',
  普鲁塔克皮洛士: G + 'tlg0007/tlg030/tlg0007.tlg030.perseus-eng2.xml',
  普鲁塔克吕山德: G + 'tlg0007/tlg032/tlg0007.tlg032.perseus-eng2.xml',
  普鲁塔克客蒙: G + 'tlg0007/tlg035/tlg0007.tlg035.perseus-eng2.xml',
  普鲁塔克尼西阿斯: G + 'tlg0007/tlg038/tlg0007.tlg038.perseus-eng2.xml',
  普鲁塔克欧迈尼斯: G + 'tlg0007/tlg041/tlg0007.tlg041.perseus-eng2.xml',
  普鲁塔克阿格西劳斯: G + 'tlg0007/tlg044/tlg0007.tlg044.perseus-eng2.xml',
  普鲁塔克亚历山大: G + 'tlg0007/tlg047/tlg0007.tlg047.perseus-eng2.xml',
  普鲁塔克狄摩西尼: G + 'tlg0007/tlg054/tlg0007.tlg054.perseus-eng2.xml',
  普鲁塔克德米特里: G + 'tlg0007/tlg057/tlg0007.tlg057.perseus-eng2.xml',
  普鲁塔克福基翁: G + 'tlg0007/tlg049/tlg0007.tlg049.perseus-eng2.xml',
  普鲁塔克卢库卢斯: G + 'tlg0007/tlg036/tlg0007.tlg036.perseus-eng2.xml',
  普鲁塔克克拉苏: G + 'tlg0007/tlg039/tlg0007.tlg039.perseus-eng2.xml',
  普鲁塔克塞多留: G + 'tlg0007/tlg042/tlg0007.tlg042.perseus-eng2.xml',
  普鲁塔克庞培: G + 'tlg0007/tlg045/tlg0007.tlg045.perseus-eng2.xml',
  普鲁塔克恺撒: G + 'tlg0007/tlg048/tlg0007.tlg048.perseus-eng2.xml',
  普鲁塔克小加图: G + 'tlg0007/tlg050/tlg0007.tlg050.perseus-eng2.xml',
  普鲁塔克西塞罗: G + 'tlg0007/tlg055/tlg0007.tlg055.perseus-eng2.xml',
  普鲁塔克安东尼: G + 'tlg0007/tlg058/tlg0007.tlg058.perseus-eng2.xml',
  普鲁塔克布鲁图斯: G + 'tlg0007/tlg061/tlg0007.tlg061.perseus-eng2.xml',
  恺撒高卢战记: L + 'phi0448/phi001/phi0448.phi001.perseus-eng2.xml',
  恺撒内战记: L + 'phi0448/phi002/phi0448.phi002.perseus-eng2.xml',
  苏埃托尼乌斯恺撒传: L + 'phi1348/abo011/phi1348.abo011.perseus-eng2.xml',
  色诺芬希腊史: G + 'tlg0032/tlg001/tlg0032.tlg001.perseus-eng2.xml',
  色诺芬远征记: G + 'tlg0032/tlg006/tlg0032.tlg006.perseus-eng2.xml',
  // 近东：楔形文字与象形文字文献的公版英译（多收在当时的通史与文献集里）
  汉谟拉比法典: { gut: 'The-Oldest-Code-of-Laws-in-the-WorldB.C.-2285-2242_17150/master/17150.txt' },       // Johns 译（1903）
  吉尔伽美什古巴比伦本: { gut: 'An-Old-Babylonian-Version-of-the-Gilgamesh-Epic_11000/master/11000-8.txt' }, // Jastrow、Clay 译（1920）
  苏美尔阿卡德史: { gut: 'A-History-of-Sumer-and-Akkad_49345/master/49345-0.txt' },                           // L. W. King（1910），书中引铭文英译
  普塔霍特普箴言: { gut: 'The-Instruction-of-Ptah-Hotep-and-the-Instruction-of-Ke-GemniThe-Oldest-Books-in-the-World_30508/master/30508.txt' }, // Gunn 译（1906）
  埃及文学: { gut: 'Egyptian-Literature--13-Comprising-Egyptian-tales-hymns-litanies-invocations-the-Book-of-the-__28282/master/28282.txt' },   // Wilson 编（1901）
  巴比伦亚述法律契约书信: { gut: 'Babylonian-and-Assyrian-Laws-Contracts-and-Letters_28674/master/28674.txt' },   // Johns（1904）
  巴比伦亚述文学: { gut: 'Babylonian-and-Assyrian-Literature_10887/master/10887.txt' },                        // Harper 编（1901）
  迦勒底: { gut: 'ChaldeaFrom-the-Earliest-Times-to-the-Rise-of-Assyria_24654/master/24654.txt' },             // Ragozin（1886）
  ...Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => ['马斯佩罗' + k, { gut: `${k === 1 ? 'History-of-Egypt-Chaldea-Syria-Babylonia-and-Assyria-in-the-Light-of-Recent-Discovery' : `History-of-Egypt-Chald-a-Syria-Babylonia-and-Assyria-Volume-${k}--of-12-`}_${17320 + k}/master/${17320 + k}.txt` }])), // Maspero（1903–1904），书中引铭文英译
  圣经: { kjv: ['Genesis', 'Exodus', 'Joshua', 'Judges', '1Samuel', '2Samuel', '1Kings', '2Kings', '2Chronicles', 'Ezra', 'Nehemiah', 'Isaiah', 'Jeremiah', 'Ezekiel', 'Daniel', 'Nahum'] },
};
const GUT = 'https://raw.githubusercontent.com/GITenberg/', KJV = 'https://raw.githubusercontent.com/aruljohn/Bible-kjv/master/';
// 古腾堡文本去掉卷首卷尾的版权说明
const gutText = t => { const a = t.search(/\*\*\* ?START OF (THE|THIS) PROJECT GUTENBERG[^\n]*\n/i), b = t.search(/\*\*\* ?END OF (THE|THIS) PROJECT GUTENBERG/i);
  return t.slice(a >= 0 ? t.indexOf('\n', a) + 1 : 0, b >= 0 ? b : undefined).replace(/\r/g, ''); };
const kjvText = j => j.chapters.map(c => c.verses.map(v => `${j.book} ${c.chapter}:${v.verse} ${v.text}`).join('\n')).join('\n');
const OUT = path.join(__dirname, '.corpus', 'west');
fs.mkdirSync(OUT, { recursive: true });
const get = u => new Promise((ok, no) => https.get(u, r => { if (r.statusCode !== 200) return no(new Error(r.statusCode + ' ' + u)); const b = []; r.on('data', d => b.push(d)); r.on('end', () => ok(Buffer.concat(b).toString('utf8'))); }).on('error', no));
// TEI → 纯文本：去掉注释、校勘、页码等，保留正文；实体与多余空白规整
const toText = x => x.replace(/<teiHeader[\s\S]*?<\/teiHeader>/, '').replace(/<(note|bibl|head|milestone|pb|lb)\b[^>]*\/>/g, ' ')
  .replace(/<(note|bibl|reg)\b[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&[a-z]+;/g, ' ')
  .replace(/[ \t\r\n]+/g, ' ').trim();
(async () => {
  const force = process.argv.includes('-f'), names = process.argv.slice(2).filter(a => a !== '-f');
  for (const [k, u] of Object.entries(WORKS)) {
    if (names.length && !names.includes(k)) continue;
    const f = path.join(OUT, k + '.txt'); if (!force && fs.existsSync(f)) continue;
    try {
      const t = typeof u === 'string' ? toText(await get(u)) : u.gut ? gutText(await get(GUT + u.gut))
        : (await Promise.all(u.kjv.map(b => get(KJV + b + '.json')))).map(x => kjvText(JSON.parse(x))).join('\n');
      fs.writeFileSync(f, t); console.log(k, Math.round(fs.statSync(f).size / 1024) + ' KB');
    } catch (e) { console.log('✗', k, e.message); }
  }
})();
