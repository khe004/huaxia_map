// 生成南亚底图包的水系 basemaps/dongya/geo.json（rv 河流、lk 湖泊），做法与 tools/waters-europe.js 相同，范围与译名不同（东亚与东南亚）。
// 用法：node tools/waters-dongya.js <数据目录>（在 tools/ 下 npm i 之后）
// 数据目录里放 Natural Earth 1:1000 万的 ne_10m_rivers_lake_centerlines.geojson、ne_10m_lakes.geojson、ne_10m_lakes_europe.geojson。
// 河流：范围内的全部河道，主要河流译成中文名（ZH），m:1 为加粗的大河；近代开凿的运河（苏伊士运河等）不画。
// 湖泊：天然湖泊（有中文名的，或 scalerank 不大于 4 的大湖），近代水库（featurecla 为 Reservoir，及纳赛尔湖、艾瑟尔湖等）不画；欧洲小湖只收与史事有关的几个（特拉西梅诺湖等）。
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const dir = process.argv[2];
if (!dir) { console.error('用法：node tools/waters-dongya.js <数据目录>'); process.exit(1); }
const OUT = path.join(__dirname, '..', 'basemaps', 'dongya', 'geo.json');
const rd = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const BOX = [72, -12, 152, 56];
const ZH = {
  'Chang Jiang': '长江', Yangtze: '长江', Jinsha: '金沙江', Tongtian: '通天河', Tuotuo: '沱沱河', Huang: '黄河', 'Heilong Jiang': '黑龙江', Amur: '黑龙江', 'Argun’': '额尔古纳河',
  Songhua: '松花江', 'Di’er Songhua': '第二松花江', Nen: '嫩江', Ussuri: '乌苏里江', Liao: '辽河', Xiliao: '西辽河', Yalu: '鸭绿江', Tumen: '图们江', Hai: '海河', Huai: '淮河',
  Wei: '渭河', Fen: '汾河', Han: '汉江', Jialing: '嘉陵江', Min: '岷江', Dadu: '大渡河', Yalong: '雅砻江', Wu: '乌江', Xiang: '湘江', Yuan: '沅江', Gan: '赣江', Xi: '西江',
  Bei: '北江', Dong: '东江', Hongshui: '红水河', Nanpan: '南盘江', Xun: '浔江', Qiantang: '钱塘江', Fuchun: '富春江', Jiulong: '九龙江', Luan: '滦河', Yongding: '永定河', Sanggan: '桑干河',
  'Xar Moron': '西拉木伦河', Tarim: '塔里木河', Yarkant: '叶尔羌河', Ertix: '额尔齐斯河', Ertis: '额尔齐斯河', Irtysh: '额尔齐斯河', Yarlung: '雅鲁藏布江', Dihang: '布拉马普特拉河',
  Brahmaputra: '布拉马普特拉河', Ganges: '恒河', Indus: '印度河', Shiquan: '狮泉河', Lancang: '湄公河', Mekong: '湄公河', Nu: '萨尔温江', Salween: '萨尔温江',
  Ayeyarwady: '伊洛瓦底江', 'Irrawaddy Delta': '伊洛瓦底江', Chindwin: '钦敦江', Sittong: '锡当河', Hong: '红河', Da: '沱江', 'Chao Phraya': '湄南河', Ping: '滨河', Yom: '永河',
  Mun: '蒙河', Chi: '栖河', 'Tonle Sap': '洞里萨河', Pahang: '彭亨河', Kapuas: '卡普阿斯河', Mahakam: '马哈坎河', Barito: '巴里托河', Cagayan: '卡加延河',
  Nakdong: '洛东江', Namhan: '南汉江', Tone: '利根川', Ishikari: '石狩川', Mogami: '最上川', Selenga: '色楞格河', Orhon: '鄂尔浑河', Herlen: '克鲁伦河', Onon: '鄂嫩河',
  Shilka: '石勒喀河', Zeya: '结雅河', Hailar: '海拉尔河', Mamberamo: '曼伯拉莫河', Digul: '迪古尔河', Sepik: '塞皮克河', Fly: '弗莱河',
};
const MAJOR = new Set(['长江', '黄河', '黑龙江', '湄公河', '珠江', '西江', '萨尔温江', '伊洛瓦底江', '雅鲁藏布江', '布拉马普特拉河', '恒河']);
const SKIP_RV = new Set(['Grand Canal']);
const LZH = { 'Nam Co': '纳木错', 'Siling Co': '色林错', 'Qinghai Hu': '青海湖', 'Poyang Hu': '鄱阳湖', 'Dongting Hu': '洞庭湖', 'Tai Hu': '太湖', 'Hongze Hu': '洪泽湖',
  'Hulun Nuur': '呼伦湖', 'Lake Khanka': '兴凯湖', 'Tonlé Sap': '洞里萨湖', 'Lake Baikal': '贝加尔湖', 'Khövsgöl Nuur': '库苏古尔湖', 'Uvs Nuur': '乌布苏湖', 'Bosten Hu': '博斯腾湖',
  'Lake Biwa': '琵琶湖', 'Lake Toba': '多巴湖', 'Laguna de Bay': '内湖', 'Har Us Nuur': '哈尔乌苏湖', 'Chao Hu': '巢湖' };
const SKIP_LK = /Reservoir|Zaysan|Bratsk|Krasnoyarsk|Novosibirsk|Sayano/i;
const EU_KEEP = new Set();

const inBox = g => { let hit = false; const walk = c => { if (hit) return; if (typeof c[0] === 'number') { if (c[0] >= BOX[0] && c[0] <= BOX[2] && c[1] >= BOX[1] && c[1] <= BOX[3]) hit = true; } else c.forEach(walk); }; walk(g.coordinates); return hit; };
const rv = rd('ne_10m_rivers_lake_centerlines.geojson').features.filter(f => f.geometry && inBox(f.geometry) && !SKIP_RV.has(f.properties.name))
  .map(f => { const zh = ZH[f.properties.name]; return { type: 'Feature', properties: { n: zh || f.properties.name || '', ...(MAJOR.has(zh) ? { m: 1 } : {}) }, geometry: f.geometry }; });
const lk = [...rd('ne_10m_lakes.geojson').features.filter(f => f.properties.featurecla !== 'Reservoir' && (LZH[f.properties.name] || f.properties.scalerank <= 4)),
  ...rd('ne_10m_lakes_europe.geojson').features.filter(f => EU_KEEP.has(f.properties.name))]
  .filter(f => f.geometry && inBox(f.geometry) && !SKIP_LK.test(f.properties.name || ''))
  .map(f => ({ type: 'Feature', properties: { n: LZH[f.properties.name] || f.properties.name || '' }, geometry: f.geometry }));
// 简化：河流与湖泊各自用 mapshaper 简化、截取小数位
const T = fs.mkdtempSync(path.join(require('os').tmpdir(), 'euw-'));
const MS = path.join(__dirname, 'node_modules', '.bin', 'mapshaper');
const simp = (name, fc, pct) => { fs.writeFileSync(path.join(T, name + '.json'), JSON.stringify({ type: 'FeatureCollection', features: fc }));
  execFileSync(MS, ['-i', path.join(T, name + '.json'), '-simplify', 'weighted', pct, 'keep-shapes', '-o', path.join(T, name + '.out.json'), 'format=geojson', 'precision=0.001'], { stdio: 'inherit' });
  return JSON.parse(fs.readFileSync(path.join(T, name + '.out.json'), 'utf8')); };
const out = { rv: simp('rv', rv, '25%'), lk: simp('lk', lk, '30%') };
for (const k of ['rv', 'lk']) out[k] = { type: 'FeatureCollection', features: out[k].features.filter(f => f.geometry) };
fs.writeFileSync(OUT, JSON.stringify(out));
console.log('geo.json 河流', out.rv.features.length, '湖泊', out.lk.features.length, Math.round(fs.statSync(OUT).size / 1024), 'KB');
