// 给 geo.json 补上境外及边疆的河流、湖泊（原有的 rv、lk 只覆盖中国内地主要水系）。
// 用法：node tools/waters.js <ne_10m_rivers_lake_centerlines.geojson> <ne_10m_lakes.geojson> <osm.json> <geo.json>
// Natural Earth 1:1000 万河流、湖泊；osm.json 为 Overpass `out geom;` 导出的若干河流 relation（NE 缺的：
// 鄂尔浑河、土拉河、克鲁伦河、弱水、大同江、楚河、塔拉斯河、喀什噶尔河）。
// 补进去的要素带属性 s:'x'，重跑时先删掉旧的再加，原有要素不动。依赖：mapshaper
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const [neRv, neLk, osmFile, geoFile] = process.argv.slice(2);
const read = f => JSON.parse(fs.readFileSync(f));

// NE 河名 → 中文名、是否大河
const RIVERS = {
  'Selenga': ['色楞格河', 1], 'Ideriyn': ['色楞格河', 1], 'Orhon': null, 'Herlen': null,
  'Onon': ['鄂嫩河'], 'Angara': ['安加拉河', 1], 'Yenisey': ['叶尼塞河', 1], 'Verkhniy Yenisey': ['叶尼塞河', 1],
  'Malyy Yenisey': ['小叶尼塞河'], 'Bol’shoy Yenisey': ['大叶尼塞河'], 'Kyzyl-Khem': ['小叶尼塞河'],
  'Ob': ['鄂毕河', 1], 'Katun': ['卡通河'], 'Biya': ['比亚河'],
  'Ertis': ['额尔齐斯河', 1], 'Ertix': ['额尔齐斯河', 1], 'Irtysh': ['额尔齐斯河', 1],
  'Ile': ['伊犁河', 1], 'Künes': ['巩乃斯河'], 'Tarim': ['塔里木河', 1], 'Yarkant': ['叶尔羌河'],
  'Aksu': ['阿克苏河'], 'Toxkan': ['托什干河'], 'Yurungkax': ['玉龙喀什河'], 'Qarqan': ['车尔臣河'], 'Konqi': ['孔雀河'],
  'Syr  Darya': ['锡尔河', 1], 'Naryn': ['纳伦河'], 'Amu  Darya': ['阿姆河', 1], 'Panj': ['喷赤河'], 'Zarafshon': ['泽拉夫尚河'],
  'Amur': ['黑龙江', 1], 'Heilong Jiang': ['黑龙江', 1], 'Argun’': ['额尔古纳河'], 'Hailar': ['海拉尔河'],
  'Shilka': ['石勒喀河'], 'Ingoda': ['音果达河'], 'Zeya': ['结雅河'],
  'Songhua': ['松花江', 1], 'Di’er Songhua': ['松花江'], 'Nen': ['嫩江'], 'Ussuri': ['乌苏里江'], 'Tumen': ['图们江'], 'Yalu': ['鸭绿江'],
  'Xar Moron': ['西拉木伦河'], 'Xiliao': ['西辽河'], 'Tao’er': ['洮儿河'],
  'Nakdong': ['洛东江'], 'Namhan': ['汉江（朝鲜半岛）'],
  'Yarlung': ['雅鲁藏布江', 1], 'Maquan': ['雅鲁藏布江', 1], 'Dihang': ['雅鲁藏布江', 1],
  'Hong': ['红河', 0, 'out'],
};
const OSM = { 172308: ['鄂尔浑河'], 172373: ['土拉河'], 962066: ['克鲁伦河'], 2470221: ['弱水'], 3858130: ['大同江'],
  10674492: ['楚河'], 13034734: ['塔拉斯河'], 19745074: ['喀什噶尔河'] };

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'waters-'));
const T = f => path.join(tmp, f);
const ms = require.resolve('mapshaper/bin/mapshaper');
const run = args => execFileSync(process.execPath, [ms, ...args], { stdio: ['ignore', 'ignore', 'inherit'] });
const BBOX = '55,8,150,59';

// 河流
const rv = [], rvOut = [];
for (const f of read(neRv).features) {
  const r = RIVERS[f.properties.name];
  if (!r) continue;
  (r[2] === 'out' ? rvOut : rv).push({ type: 'Feature', properties: { n: r[0], m: r[1] ? 1 : 0 }, geometry: f.geometry });
}
for (const e of read(osmFile).elements) {
  const r = OSM[e.id];
  if (!r) continue;
  const lines = e.members.filter(m => m.type === 'way' && m.geometry && m.role !== 'side_stream' && m.role !== 'tributary')
    .map(m => m.geometry.map(p => [p.lon, p.lat]));
  rv.push({ type: 'Feature', properties: { n: r[0], m: 0 }, geometry: { type: 'MultiLineString', coordinates: lines } });
}
fs.writeFileSync(T('rv.json'), JSON.stringify({ type: 'FeatureCollection', features: rv }));
fs.writeFileSync(T('rvo.json'), JSON.stringify({ type: 'FeatureCollection', features: rvOut }));
// 中国境内已有 OSM 河道的（红河），只取境外一段
const topo = require('topojson-client');
const U = read(path.join(path.dirname(geoFile), 'units.topo.json'));
const cnPoly = topo.merge(U, U.objects.units.geometries.filter(g => !g.properties.c));
fs.writeFileSync(T('cn.json'), JSON.stringify({ type: 'Feature', properties: {}, geometry: cnPoly }));
run([T('rv.json'), '-clip', 'bbox=' + BBOX, '-dissolve', 'n', 'copy-fields=m', '-simplify', 'interval=800', 'keep-shapes', '-o', 'precision=0.001', T('rv2.json')]);
run([T('rvo.json'), '-erase', T('cn.json'), '-simplify', 'interval=800', '-o', 'precision=0.001', T('rvo2.json')]);

// 湖泊：NE 1:1000 万中规模较大的天然湖（另加斋桑泊），已有的不重复
const geo = read(geoFile);
const strip = fc => (fc.features = fc.features.filter(f => f.properties.s !== 'x'), fc);
strip(geo.rv); strip(geo.lk);
const have = new Set(geo.lk.features.map(f => f.properties.n));
const lk = read(neLk).features.filter(f => {
  const p = f.properties;
  if (!p.name || have.has(p.name)) return false;
  return (p.scalerank <= 6 && /Lake/.test(p.featurecla)) || p.name === 'Lake Zaysan';
}).map(f => ({ type: 'Feature', properties: { n: f.properties.name_zh || f.properties.name }, geometry: f.geometry }));
fs.writeFileSync(T('lk.json'), JSON.stringify({ type: 'FeatureCollection', features: lk }));
run([T('lk.json'), '-clip', 'bbox=' + BBOX, '-simplify', 'interval=600', 'keep-shapes', '-o', 'precision=0.001', T('lk2.json')]);

const add = (fc, f) => { for (const x of read(T(f)).features) if (x.geometry) fc.features.push({ ...x, properties: { ...x.properties, s: 'x' } }); };
add(geo.rv, 'rv2.json'); add(geo.rv, 'rvo2.json'); add(geo.lk, 'lk2.json');
fs.writeFileSync(geoFile, JSON.stringify(geo));
console.log('rv', geo.rv.features.length, 'lk', geo.lk.features.length, (fs.statSync(geoFile).size / 1024).toFixed(0) + 'KB');
