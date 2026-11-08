// 生成底图的陆地数据（TopoJSON）：中国地级行政区拼块 + 周边国家，放在同一份拓扑里一起简化，
// 这样拼块的外缘、今省界、国界和海岸线都由同一组弧段构成，不会出现两条对不齐的线。
// 用法：node tools/units.js <数据目录> <Natural Earth 国界.geojson> <输出文件>
// 数据目录需包含：
//   <省级行政区代码>.json   阿里云 DataV 地级边界（geo.datav.aliyun.com/areas_v3/bound/<代码>_full.json）
//   <地级代码>_full.json    要按县切开的地级区的县界（见下面 SPLITS）
//   china.json              DataV 全国省级边界（取香港、澳门、台湾整体）
//   PRK VNM KOR MNG RUS KAZ KGZ TJK UZB JPN .json   geoBoundaries 一级行政区（gbOpen 简化版）
// Natural Earth：ne_10m_admin_0_countries.geojson（1:1000 万国界），只取周边国家，并先扣掉上面这些拼块覆盖的范围。
// 输出对象：units（拼块，属性 n 名称、p 所属省区或国家、c 外国的国家代码）、nb（周边国家，属性 n）。
// 依赖：mapshaper（见 tools/package.json）
// 省区“西伯利亚”（伊尔库茨克州与克拉斯诺亚尔斯克南部）是事后用 tools/siberia.js 增补的，重新生成时要再跑一次；
// 之后依次跑 tools/topo-retopo.js（按量化网格重建共用弧段）、tools/topo-sliver.js（夹在拼块之间的周边陆地细缝并入拼块）、
// tools/topo-stitch.js（中俄、中蒙等两套数据源界线不重合处，把一侧的独用弧换成另一侧的弧链），免得同属一方的两岸之间残留国界线
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const [dir, neFile, out] = process.argv.slice(2);
if (!dir || !neFile || !out) { console.error('用法：node tools/units.js <数据目录> <Natural Earth 国界.geojson> <输出文件>'); process.exit(2); }
const PROV = { 110000: '北京', 120000: '天津', 130000: '河北', 140000: '山西', 150000: '内蒙古', 210000: '辽宁', 220000: '吉林', 230000: '黑龙江', 310000: '上海', 320000: '江苏', 330000: '浙江', 340000: '安徽', 350000: '福建', 360000: '江西', 370000: '山东', 410000: '河南', 420000: '湖北', 430000: '湖南', 440000: '广东', 450000: '广西', 460000: '海南', 500000: '重庆', 510000: '四川', 520000: '贵州', 530000: '云南', 540000: '西藏', 610000: '陕西', 620000: '甘肃', 630000: '青海', 640000: '宁夏', 650000: '新疆' };
const feats = [];
for (const [code, p] of Object.entries(PROV)) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, code + '.json')));
  for (const f of j.features) if (f.properties.name && f.geometry) feats.push({ type: 'Feature', properties: { n: f.properties.name, p, kind: 'u' }, geometry: f.geometry });
}
const cn = JSON.parse(fs.readFileSync(path.join(dir, 'china.json')));
for (const f of cn.features) {
  const m = (f.properties.name || '').match(/^(香港|澳门|台湾)/);
  if (m) feats.push({ type: 'Feature', properties: { n: m[1], p: m[1], kind: 'u' }, geometry: f.geometry });
}
// 周边国家中需要上色的部分（朝鲜半岛、越南北部、蒙古高原、南西伯利亚、中亚东部），属性 c 为国家代码
const FOREIGN = [['PRK', '朝鲜'], ['KOR', '韩国'], ['VNM', '越南'], ['MNG', '蒙古'],
  ['RUS', '俄罗斯', ['Altai Republic', 'Tuva', 'Buryatia', 'Zabaykalsky Krai', 'Khakassia']],
  ['KAZ', '哈萨克斯坦', ['Almaty Region', 'Almaty', 'Jambyl Region', 'South Kazakhstan Region', 'East Kazakhstan Region']],
  ['KGZ', '吉尔吉斯斯坦'], ['TJK', '塔吉克斯坦', ['Sughd Region', 'Gorno-Badakhshan Autonomous Region']],
  ['UZB', '乌兹别克斯坦', ['Andijan Region', 'Namangan Region', 'Fergana Region', 'Tashkent Region', 'Tashkent', 'Sirdaryo Region', 'Jizzakh Region', 'Samarqand Region', 'Qashqadaryo Region', 'Surxondaryo Region', 'Bukhara Region']],
  // 清代各卷用：黑龙江以北、乌苏里江以东（省区“远东”，1858、1860 年割俄），冲绳（省区“琉球”）
  ['RUS', '远东', ['Amur Oblast', 'Jewish Autonomous Oblast', 'Khabarovsk Krai', 'Primorsky Krai', 'Sakhalin Oblast']],
  ['JPN', '琉球', ['Okinawa Prefecture']]];
for (const [c, p, only] of FOREIGN) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, c + '.json')));
  for (const f of j.features) {
    const n = f.properties.shapeName.trim();
    if (!only || only.includes(n)) feats.push({ type: 'Feature', properties: { n, p, c, kind: 'u' }, geometry: f.geometry });
  }
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'units-'));
const T = f => path.join(tmp, f);
fs.writeFileSync(T('u.json'), JSON.stringify({ type: 'FeatureCollection', features: feats }));
const ms = require.resolve('mapshaper/bin/mapshaper');
const run = args => execFileSync(process.execPath, [ms, ...args], { stdio: ['ignore', 'ignore', 'inherit'] });
// 1. 拼块覆盖范围
run(['-i', T('u.json'), '-dissolve', '-o', T('mask.json')]);
// 2. 周边国家：去掉已由拼块提供的中国、朝鲜、韩国、越南，再扣掉拼块范围（争议地区以拼块为准）
run(['-i', neFile, '-filter', "!['CHN','TWN','HKG','MAC','KOR','PRK','VNM','MNG','KGZ'].includes(ADM0_A3)",
  '-clip', 'bbox=40,-15,170,72', '-erase', T('mask.json'), '-each', "n=NAME, kind='nb'", '-filter-fields', 'n,kind', '-o', T('nb.json')]);
// 2b. 种子点比地级区密的地方（山东、喀什、燕云），把地级区按县界切出一块，免得古郡分不到地块（东平、胶东、菑川、疏勒、捐毒），或古郡治所落进邻郡（酒泉），或割地的边界画不出来（瀛莫、涿州、瓦桥与益津二关）。
//     县界取 DataV <地级代码>_full.json，放在数据目录；切线以外的一侧外扩 6 公里，免得两份边界不重合处留下碎条
const SPLITS = [['370900', '泰安市', '东平县', ['东平县']], ['370700', '潍坊市', '临朐、昌乐、安丘', ['临朐县', '昌乐县', '安丘市']],
  ['370200', '青岛市', '平度、莱西、即墨', ['平度市', '莱西市', '即墨区']], ['620900', '酒泉市', '肃州、金塔、玉门', ['肃州区', '金塔县', '玉门市']],
  ['653100', '喀什地区', '喀什、疏勒、疏附、伽师', ['喀什市', '疏附县', '疏勒县', '伽师县', '岳普湖县', '英吉沙县']],
  ['130900', '沧州市', '任丘、河间', ['任丘市', '河间市', '肃宁县', '献县']], ['130600', '保定市', '涿州、高碑店', ['涿州市', '高碑店市']],
  ['130600', '保定市', '雄县、容城、安新', ['雄县', '容城县', '安新县']], ['131000', '廊坊市', '霸州、文安、大城', ['霸州市', '文安县', '大城县']]];
run(['-i', T('u.json'), '-o', T('cur.json')]);
for (const [code, city, name, cs] of SPLITS) {
  const f = path.join(dir, code + '_full.json'), js = `${JSON.stringify(cs)}.includes(name)`;
  run(['-i', f, '-filter', js, '-dissolve', '-buffer', 'radius=6km', '-o', T('g.json')]);
  run(['-i', f, '-filter', `!(${js})`, '-dissolve', '-o', T('r.json')]);
  run(['-i', T('g.json'), '-erase', T('r.json'), '-simplify', 'interval=1500', '-o', T('mk.json')]);
  run(['-i', T('cur.json'), '-filter', `n=='${city}'`, '-clip', T('mk.json'), '-each', `n='${name}'`, '-filter-islands', 'min-area=50km2', '-o', T('piece.json')]);
  run(['-i', T('cur.json'), '-filter', `n=='${city}'`, '-erase', T('mk.json'), '-filter-islands', 'min-area=50km2', '-o', T('rest.json')]);
  run(['-i', T('cur.json'), '-filter', `n!='${city}'`, '-o', T('other.json')]);
  run(['-i', T('other.json'), T('rest.json'), T('piece.json'), 'combine-files', '-merge-layers', 'force', '-o', T('cur.json')]);
}
// 2c. 远东与南海的修整：
//   - 哈巴罗夫斯克边疆区只取北纬 55.5 度以南（乌第河以南），以北的鄂霍次克海沿岸并入周边陆地，不上色
//   - 萨哈林州只取库页岛本岛，千岛群岛并入周边陆地；本岛按北纬 50 度切成南北两块（1905 年南库页割日本）
//   - 三沙市（南海诸岛）不作拼块，免得被越南、占城的种子点分去
//   - 湛江市按方框切出广州湾租借地（1899 年租与法国）
//   - 冲绳、越南广宁、广州湾带离岛，加属性 w 整块归属，免得离岛被对岸的种子点分走
{
  const J = JSON.parse(fs.readFileSync(T('cur.json'))), units = [], nbAdd = [];
  const cut = (f, bbox, op = '-clip') => { fs.writeFileSync(T('f.json'), JSON.stringify({ type: 'FeatureCollection', features: [f] }));
    run(['-i', T('f.json'), op, 'bbox=' + bbox.join(','), '-o', T('f2.json')]); return JSON.parse(fs.readFileSync(T('f2.json'))).features; };
  const named = (fs_, n, extra = {}) => fs_.map(x => ({ ...x, properties: { ...x.properties, n, ...extra } }));
  for (const f of J.features) {
    const { n } = f.properties;
    if (n === '三沙市') continue;
    if (n === 'Sakhalin Oblast') {
      const ps = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates], big = ps.reduce((a, b) => (b[0].length > a[0].length ? b : a));
      ps.filter(q => q !== big).forEach(q => nbAdd.push({ type: 'Feature', properties: { n: (q[0].reduce((s, p) => s + p[0], 0) / q[0].length < 149.2 ? 'South' : 'North') + ' Kuril Islands', kind: 'nb' }, geometry: { type: 'Polygon', coordinates: q } }));
      const isl = { ...f, geometry: { type: 'Polygon', coordinates: big } };
      units.push(...cut(isl, [139, 49.999, 146, 56]), ...named(cut(isl, [139, 44, 146, 49.999]), 'Sakhalin South'));
      continue;
    }
    if (n === 'Khabarovsk Krai') { units.push(...cut(f, [125, 40, 150, 55.5])); nbAdd.push(...cut(f, [125, 55.5, 160, 70]).map(x => ({ ...x, properties: { n: 'Russia', kind: 'nb' } }))); continue; }
    if (n === '湛江市') { const B = [110.2, 20.8, 110.7, 21.45]; units.push(...named(cut(f, B), '广州湾', { w: 1 }), ...cut(f, B, '-erase')); continue; }
    if (n === 'Okinawa Prefecture' || n === 'Quảng Ninh') f.properties.w = 1;
    units.push(f);
  }
  fs.writeFileSync(T('cur.json'), JSON.stringify({ type: 'FeatureCollection', features: units }));
  const nb = JSON.parse(fs.readFileSync(T('nb.json'))); nb.features.push(...nbAdd); fs.writeFileSync(T('nb.json'), JSON.stringify(nb));
}
fs.copyFileSync(T('cur.json'), T('u.json'));
// 3. 合并后统一吸附、清理缝隙、简化，再拆回两个图层
run(['-i', T('u.json'), T('nb.json'), 'combine-files', '-merge-layers', 'force', 'name=all',
  '-snap', 'interval=0.005', '-clean', 'gap-fill-area=150km2',
  '-simplify', 'interval=3000', 'keep-shapes', '-filter-islands', 'min-area=150km2',
  '-filter', "kind=='u'", '+', 'name=units',
  '-filter', "kind=='nb'", 'target=all', '+', 'name=nb',
  '-filter-fields', 'n,p,c,w', 'target=units', '-filter-fields', 'n', 'target=nb',
  '-o', 'format=topojson', 'quantization=20000', 'target=units,nb', out]);
fs.rmSync(tmp, { recursive: true });
// 简化、去小岛后有的要素没有几何了（如越南昆仑岛、印度洋小岛国），去掉，免得引擎渲染与悬停时出错
const topo = JSON.parse(fs.readFileSync(out, 'utf8'));
for (const k of Object.keys(topo.objects)) topo.objects[k].geometries = topo.objects[k].geometries.filter(g => g.type != null);
fs.writeFileSync(out, JSON.stringify(topo));
console.log(feats.length, 'units →', out);
