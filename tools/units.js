// 生成底图的陆地数据（TopoJSON）：中国地级行政区拼块 + 周边国家，放在同一份拓扑里一起简化，
// 这样拼块的外缘、今省界、国界和海岸线都由同一组弧段构成，不会出现两条对不齐的线。
// 用法：node tools/units.js <数据目录> <Natural Earth 国界.geojson> <输出文件>
// 数据目录需包含：
//   <省级行政区代码>.json   阿里云 DataV 地级边界（geo.datav.aliyun.com/areas_v3/bound/<代码>_full.json）
//   china.json              DataV 全国省级边界（取香港、澳门、台湾整体）
//   PRK VNM KOR MNG RUS KAZ KGZ TJK UZB .json   geoBoundaries 一级行政区（gbOpen 简化版）
// Natural Earth：ne_10m_admin_0_countries.geojson（1:1000 万国界），只取周边国家，并先扣掉上面这些拼块覆盖的范围。
// 输出对象：units（拼块，属性 n 名称、p 所属省区或国家、c 外国的国家代码）、nb（周边国家，属性 n）。
// 依赖：mapshaper（见 tools/package.json）
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const [dir, neFile, out] = process.argv.slice(2);
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
  ['UZB', '乌兹别克斯坦', ['Andijan Region', 'Namangan Region', 'Fergana Region', 'Tashkent Region', 'Tashkent', 'Sirdaryo Region', 'Jizzakh Region', 'Samarqand Region', 'Qashqadaryo Region', 'Surxondaryo Region', 'Bukhara Region']]];
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
// 3. 合并后统一吸附、清理缝隙、简化，再拆回两个图层
run(['-i', T('u.json'), T('nb.json'), 'combine-files', '-merge-layers', 'force', 'name=all',
  '-snap', 'interval=0.005', '-clean', 'gap-fill-area=150km2',
  '-simplify', 'interval=3000', 'keep-shapes', '-filter-islands', 'min-area=150km2',
  '-filter', "kind=='u'", '+', 'name=units',
  '-filter', "kind=='nb'", 'target=all', '+', 'name=nb',
  '-filter-fields', 'n,p,c', 'target=units', '-filter-fields', 'n', 'target=nb',
  '-o', 'format=topojson', 'quantization=20000', 'target=units,nb', out]);
fs.rmSync(tmp, { recursive: true });
// 简化、去小岛后有的要素没有几何了（如越南昆仑岛、印度洋小岛国），去掉，免得引擎渲染与悬停时出错
const topo = JSON.parse(fs.readFileSync(out, 'utf8'));
for (const k of Object.keys(topo.objects)) topo.objects[k].geometries = topo.objects[k].geometries.filter(g => g.type != null);
fs.writeFileSync(out, JSON.stringify(topo));
console.log(feats.length, 'units →', out);
