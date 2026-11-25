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
  普鲁塔克菲洛皮门: G + 'tlg0007/tlg027/tlg0007.tlg027.perseus-eng2.xml',
  普鲁塔克阿吉斯与克列奥美涅斯: G + 'tlg0007/tlg051/tlg0007.tlg051.perseus-eng1.xml',
  普鲁塔克阿拉图斯: G + 'tlg0007/tlg063/tlg0007.tlg063.perseus-eng2.xml',
  约瑟夫斯犹太古史: G + 'tlg0526/tlg001/tlg0526.tlg001.perseus-eng2.xml',
  苏埃托尼乌斯奥古斯都传: L + 'phi1348/abo012/phi1348.abo012.perseus-eng2.xml',
  苏埃托尼乌斯提比略传: L + 'phi1348/abo013/phi1348.abo013.perseus-eng2.xml',
  塔西佗编年史: L + 'phi1351/phi005/phi1351.phi005.perseus-eng2.xml',
  维吉尔埃涅阿斯纪: L + 'phi0690/phi003/phi0690.phi003.perseus-eng2.xml',
  奥维德变形记: L + 'phi0959/phi006/phi0959.phi006.perseus-eng3.xml',
  苏埃托尼乌斯卡利古拉传: L + 'phi1348/abo014/phi1348.abo014.perseus-eng2.xml',
  苏埃托尼乌斯克劳狄乌斯传: L + 'phi1348/abo015/phi1348.abo015.perseus-eng2.xml',
  苏埃托尼乌斯尼禄传: L + 'phi1348/abo016/phi1348.abo016.perseus-eng2.xml',
  苏埃托尼乌斯加尔巴传: L + 'phi1348/abo017/phi1348.abo017.perseus-eng2.xml',
  苏埃托尼乌斯奥托传: L + 'phi1348/abo018/phi1348.abo018.perseus-eng2.xml',
  苏埃托尼乌斯维特利乌斯传: L + 'phi1348/abo019/phi1348.abo019.perseus-eng2.xml',
  塔西佗历史: L + 'phi1351/phi004/phi1351.phi004.perseus-eng2.xml',
  约瑟夫斯犹太战记: G + 'tlg0526/tlg004/tlg0526.tlg004.perseus-eng2.xml',
  苏埃托尼乌斯韦斯巴芗传: L + 'phi1348/abo020/phi1348.abo020.perseus-eng2.xml',
  苏埃托尼乌斯提图斯传: L + 'phi1348/abo021/phi1348.abo021.perseus-eng2.xml',
  苏埃托尼乌斯图密善传: L + 'phi1348/abo022/phi1348.abo022.perseus-eng2.xml',
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
  次经: { gut: 'Deuterocanonical-Books-of-the-Bible--13-Apocrypha_124/master/124.txt' },                    // 钦定本次经（含马加比一书、二书）
  奥古斯都功业录: { gut: 'Monumentum-Ancyranum-The-Deeds-of-Augustus_66595/master/66595-0.txt' },   // Fairley 译（1898）
  小普林尼书信: { gut: 'Letters-of-Pliny_2811/master/2811.txt' },                                   // Melmoth 译、Bosanquet 校（1915）
  塔西佗阿古利可拉: { gut: 'The-Germany-and-the-Agricola-of-Tacitus_7524/master/7524.txt' },          // Church 与 Brodribb 译，含《日耳曼尼亚志》
  尤维纳利斯讽刺诗: { gut: 'The-Satires-of-Juvenal-Persius-Sulpicia-and-Lucilius_50657/master/50657-0.txt' }, // Evans 译（1869）
  马可沉思录: { gut: 'Thoughts-of-Marcus-Aurelius-Antoninus_15877/master/15877.txt' },               // George Long 译（1862）
  爱比克泰德: { gut: 'A-Selection-from-the-Discourses-of-Epictetus-with-the-Encheiridion_10661/master/10661.txt' }, // George Long 译
  吉本衰亡史一: { gut: 'History-of-the-Decline-and-Fall-of-the-Roman-Empire---Volume-1_731/master/731.txt' }, // 吉本《罗马帝国衰亡史》第一卷（1776），书中转述狄奥、赫罗狄安、《罗马帝王纪》
  普罗提诺: { gut: 'Plotinos--Complete-Works-v.-1In-Chronological-Order-Grouped-in-Four-Periods_42930/master/42930.txt' }, // Guthrie 译（1918），卷首附波菲利《普罗提诺传》
  奥利金一: { gut: 'The-writings-of-Origen-Vol-1-of-2_70561/master/70561-0.txt' },          // 《驳塞尔苏斯》等，Crombie 译（1869）
  奥利金二: { gut: 'The-writings-of-Origen-vol-2-of-2_70693/master/70693-0.txt' },
  阿米阿努斯: { gut: 'The-Roman-History-of-Ammianus-Marcellinus--13-During-the-Reigns-of-the-Emperors-Constantius-J__28587/master/28587.txt' }, // Yonge 译（1862）
  吉本衰亡史二: { gut: 'History-of-the-Decline-and-Fall-of-the-Roman-Empire---Volume-2_732/master/732.txt' },
  尤利安一: { gut: 'The-Works-of-the-Emperor-Julian-Vol-1_48664/master/48664-0.txt' },
  尤利安二: { gut: 'The-Works-of-the-Emperor-Julian-Vol-2_48768/master/48768-0.txt' },
  君士坦丁传记: { gut: 'Constantine-the-Great-The-reorganization-of-the-Empire-and-the-triumph-of-the-Church_68703/master/68703-0.txt' },
  吉本衰亡史三: { gut: 'History-of-the-Decline-and-Fall-of-the-Roman-Empire---Volume-3_733/master/733.txt' },
  吉本衰亡史四: { gut: 'History-of-the-Decline-and-Fall-of-the-Roman-Empire---Volume-4_734/master/734.txt' },
  奥古斯丁忏悔录: { gut: 'The-Confessions-of-St.-Augustine_3296/master/3296.txt' },
  上帝之城一: { gut: 'The-City-of-God-Volume-I_45304/master/45304-0.txt' },
  约达尼斯哥特史: { gut: 'The-Origin-and-Deeds-of-the-Goths_14809/master/14809.txt' },
  普罗科匹乌斯波斯战争: { gut: 'History-of-the-Wars-Books-I-and-II--13-The-Persian-War_16764/master/16764.txt' },
  普罗科匹乌斯汪达尔战争: { gut: 'History-of-the-Wars-Books-III-and-IV--13-The-Vandalic-War_16765/master/16765.txt' },
  普罗科匹乌斯哥特战争: { gut: 'ProcopiusHistory-of-the-Wars-Books-V.-and-VI._20298/master/20298.txt' },
  普罗科匹乌斯秘史: { gut: 'The-Secret-History-of-the-Court-of-Justinian_12916/master/12916.txt' },
  普罗科匹乌斯建筑: { gut: 'Of-the-Buildings-of-Justinian_65404/master/65404-0.txt' },
  波爱修斯哲学的慰藉: { gut: 'The-Consolation-of-Philosophy_14328/master/14328.txt' },
  格雷戈里法兰克人史: { gut: 'History-of-the-Franks_74955/master/74955-0.txt' },
  查士丁尼法学阶梯: { gut: 'The-Institutes-of-Justinian_5983/master/5983.txt' },
  比德英吉利教会史: { gut: 'Bede-s-Ecclesiastical-History-of-England_38326/master/38326-0.txt' },
  吉本衰亡史五: { gut: 'History-of-the-Decline-and-Fall-of-the-Roman-Empire---Volume-5_735/master/735.txt' },
  吉本衰亡史六: { gut: 'History-of-the-Decline-and-Fall-of-the-Roman-Empire---Volume-6_736/master/736.txt' },
  古兰经: { gut: 'The-Koran-Al-Qur-an_3434/master/3434.txt' },
  盎格鲁撒克逊编年史: { gut: 'The-Anglo-Saxon-Chronicle_657/master/657.txt' },
  贝奥武甫: { gut: 'Beowulf_981/master/981.txt' },
  艾因哈德查理曼传: { gut: 'Early-Lives-of-Charlemagne-by-Eginhard-and-the-Monk-of-St-Gall-edited-by-Prof-A-J-Grant_48870/master/48870-0.txt' },
  罗兰之歌: { gut: 'The-Song-of-Roland_391/master/391.txt' },
  贺拉斯颂歌: { gut: 'Horace--Odes-and-Epodes_9646/master/9646.txt' },
  圣经: { kjv: ['Genesis', 'Exodus', 'Joshua', 'Judges', '1Samuel', '2Samuel', '1Kings', '2Kings', '2Chronicles', 'Ezra', 'Nehemiah', 'Isaiah', 'Jeremiah', 'Ezekiel', 'Daniel', 'Nahum', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', 'Revelation'] },
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
