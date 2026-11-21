// 生成欧洲底图包的陆地拼块 basemaps/europe/units.topo.json。
// 用法：node tools/units-europe.js <数据目录>（在 tools/ 下 npm i 之后）
// 数据目录里放：
//   nuts3.json   Eurostat NUTS-3（2021 版，1:300 万，EPSG:4326），取自 https://raw.githubusercontent.com/eurostat/Nuts2json/master/pub/v2/2021/4326/03M/nutsrg_3.json
//   ne_10m_admin_1_states_provinces.geojson、ne_10m_admin_0_countries.geojson   Natural Earth 1:1000 万（https://github.com/nvkelso/natural-earth-vector）
// 拼块：欧盟、英国、欧洲自由贸易联盟和候选国（含土耳其、巴尔干）用 NUTS-3（德国合并到 NUTS-2，免得拼块比别处细太多）；
// 其余在范围内的国家（北非、近东、伊朗、乌克兰、白俄罗斯、俄罗斯欧洲部分、高加索）用 Natural Earth 一级行政区。
// 范围以外的陆地（撒哈拉以南、阿拉伯半岛南部、中亚、西伯利亚、北美等）按国家放进 nb，只画陆地、不分拼块。
// 所有陆地一起清理（去重叠、补缝）、一起简化，拼块外缘、国界与海岸线共用同一套边。
// 拼块属性：n 名称（NUTS 用当地名，Natural Earth 用英文名），p 今国名（中文）。
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const dir = process.argv[2];
if (!dir) { console.error('用法：node tools/units-europe.js <数据目录>'); process.exit(1); }
const OUT = path.join(__dirname, '..', 'basemaps', 'europe');
const rd = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));

// 今国名：NUTS 的国家代码（希腊为 EL，英国为 UK）与 ISO 3166-1 二字码
const CN = {
  PT: '葡萄牙', ES: '西班牙', FR: '法国', IT: '意大利', CH: '瑞士', AT: '奥地利', DE: '德国', LI: '列支敦士登', UK: '英国', GB: '英国', BE: '比利时',
  LU: '卢森堡', NL: '荷兰', IE: '爱尔兰', DK: '丹麦', NO: '挪威', IS: '冰岛', CY: '塞浦路斯', EL: '希腊', GR: '希腊', TR: '土耳其', AL: '阿尔巴尼亚',
  MT: '马耳他', HR: '克罗地亚', RS: '塞尔维亚', SI: '斯洛文尼亚', HU: '匈牙利', MK: '北马其顿', BG: '保加利亚', ME: '黑山', RO: '罗马尼亚',
  SK: '斯洛伐克', CZ: '捷克', PL: '波兰', SE: '瑞典', LV: '拉脱维亚', EE: '爱沙尼亚', FI: '芬兰', LT: '立陶宛',
  BA: '波黑', XK: '科索沃', UA: '乌克兰', BY: '白俄罗斯', MD: '摩尔多瓦', RU: '俄罗斯', GE: '格鲁吉亚', AM: '亚美尼亚', AZ: '阿塞拜疆',
  MA: '摩洛哥', EH: '西撒哈拉', DZ: '阿尔及利亚', TN: '突尼斯', LY: '利比亚', EG: '埃及', IL: '以色列', PS: '巴勒斯坦', LB: '黎巴嫩',
  SY: '叙利亚', JO: '约旦', IQ: '伊拉克', IR: '伊朗', SA: '沙特阿拉伯', KW: '科威特', AD: '安道尔', SM: '圣马力诺', MC: '摩纳哥',
};
// 用 Natural Earth 一级行政区做拼块的国家（adm0_a3）
const NE_UNITS = { BIH: 'BA', KOS: 'XK', UKR: 'UA', BLR: 'BY', MDA: 'MD', RUS: 'RU', GEO: 'GE', ARM: 'AM', AZE: 'AZ', MAR: 'MA', SAH: 'EH', DZA: 'DZ',
  TUN: 'TN', LBY: 'LY', EGY: 'EG', ISR: 'IL', PSX: 'PS', LBN: 'LB', SYR: 'SY', JOR: 'JO', IRQ: 'IQ', IRN: 'IR', KWT: 'KW', AND: 'AD', SMR: 'SM', MCO: 'MC' };
// 拼块的经纬度范围：质心落在其中的才算拼块（俄罗斯只取乌拉尔以西，沙特只取北部）
const inBox = ([x, y]) => x >= -25 && x <= 62 && y >= 20 && y <= 72;
// 陆地总范围（nb 只保留与之相交的国家）
const BIG = [-75, -5, 110, 82];

const bboxOf = g => { let a = [Infinity, Infinity, -Infinity, -Infinity];
  const walk = c => (typeof c[0] === 'number' ? (a = [Math.min(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[2], c[0]), Math.max(a[3], c[1])]) : c.forEach(walk));
  walk(g.coordinates); return a; };
// 面积加权质心（经纬度平面，够判断落在哪个范围）
const centroid = g => { let A = 0, X = 0, Y = 0;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  for (const p of polys) for (const [k, r] of p.entries()) { const sg = k ? -1 : 1;
    for (let i = 0; i + 1 < r.length; i++) { const c = r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1]; A += sg * c; X += sg * (r[i][0] + r[i + 1][0]) * c; Y += sg * (r[i][1] + r[i + 1][1]) * c; } }
  return A ? [X / (3 * A), Y / (3 * A)] : bboxOf(g).slice(0, 2); };

const units = [], nb = [];
// NUTS-3：去掉海外领地（质心不在范围内的，如加那利以外的大西洋诸岛、法属圭亚那、留尼汪）
for (const f of rd('nuts3.json').features) {
  const id = f.properties.id, cc = id.slice(0, 2);
  if (!inBox(centroid(f.geometry))) continue;
  // 德国按 NUTS-2 合并（mapshaper 里按 g 字段合并）
  units.push({ type: 'Feature', properties: { n: f.properties.na, p: CN[cc], g: cc === 'DE' ? id.slice(0, 4) : id }, geometry: f.geometry });
}
const DE2 = { DE11: 'Stuttgart', DE12: 'Karlsruhe', DE13: 'Freiburg', DE14: 'Tübingen', DE21: 'Oberbayern', DE22: 'Niederbayern', DE23: 'Oberpfalz',
  DE24: 'Oberfranken', DE25: 'Mittelfranken', DE26: 'Unterfranken', DE27: 'Schwaben', DE30: 'Berlin', DE40: 'Brandenburg', DE50: 'Bremen', DE60: 'Hamburg',
  DE71: 'Darmstadt', DE72: 'Gießen', DE73: 'Kassel', DE80: 'Mecklenburg-Vorpommern', DE91: 'Braunschweig', DE92: 'Hannover', DE93: 'Lüneburg',
  DE94: 'Weser-Ems', DEA1: 'Düsseldorf', DEA2: 'Köln', DEA3: 'Münster', DEA4: 'Detmold', DEA5: 'Arnsberg', DEB1: 'Koblenz', DEB2: 'Trier',
  DEB3: 'Rheinhessen-Pfalz', DEC0: 'Saarland', DED2: 'Dresden', DED4: 'Chemnitz', DED5: 'Leipzig', DEE0: 'Sachsen-Anhalt', DEF0: 'Schleswig-Holstein', DEG0: 'Thüringen' };
for (const u of units) if (DE2[u.properties.g]) u.properties.n = DE2[u.properties.g];
// Natural Earth 一级行政区
const NEU = new Set(Object.keys(NE_UNITS)), rest = new Map();
for (const f of rd('ne_10m_admin_1_states_provinces.geojson').features) {
  const a3 = f.properties.adm0_a3; if (!NEU.has(a3) || !f.geometry) continue;
  let cc = NE_UNITS[a3];
  // 克里米亚与塞瓦斯托波尔按国际通行的看法记作乌克兰
  if (['Crimea', 'Sevastopol'].includes(f.properties.name) || /^UA-4[03]$/.test(f.properties.iso_3166_2 || '')) cc = 'UA';
  const ft = { type: 'Feature', properties: { n: f.properties.name, p: CN[cc], g: f.properties.adm1_code }, geometry: f.geometry };
  if (inBox(centroid(f.geometry))) units.push(ft);
  else (rest.get(a3) || rest.set(a3, []).get(a3)).push(ft);
}
// 范围以外：其余国家整体，加上上面国家落在范围以外的一级行政区（按国家合并）
for (const f of rd('ne_10m_admin_0_countries.geojson').features) {
  const a3 = f.properties.ADM0_A3; if (!f.geometry || NEU.has(a3)) continue;
  const b = bboxOf(f.geometry); if (b[2] < BIG[0] || b[0] > BIG[2] || b[3] < BIG[1] || b[1] > BIG[3]) continue;
  // NUTS 已覆盖的国家不再放 nb（塞浦路斯北部也在 NUTS 的 CY000 里）
  if (['PRT', 'ESP', 'FRA', 'ITA', 'CHE', 'AUT', 'DEU', 'LIE', 'GBR', 'BEL', 'LUX', 'NLD', 'IRL', 'DNK', 'NOR', 'ISL', 'CYP', 'CYN', 'GRC', 'TUR', 'ALB', 'MLT',
    'HRV', 'SRB', 'SVN', 'HUN', 'MKD', 'BGR', 'MNE', 'ROU', 'SVK', 'CZE', 'POL', 'SWE', 'LVA', 'EST', 'FIN', 'LTU', 'VAT'].includes(a3)) continue;
  nb.push({ type: 'Feature', properties: { n: f.properties.NAME_EN || f.properties.NAME, g: 'nb-' + a3 }, geometry: f.geometry });
}
for (const [a3, fs0] of rest) for (const f of fs0) nb.push({ ...f, properties: { n: { RUS: 'Russia' }[a3] || a3, g: 'nb-' + a3 } });

const T = fs.mkdtempSync(path.join(require('os').tmpdir(), 'eu-'));
const all = { type: 'FeatureCollection', features: [...units.map(f => ({ ...f, properties: { ...f.properties, k: 'u' } })), ...nb.map(f => ({ ...f, properties: { ...f.properties, k: 'nb' } }))] };
fs.writeFileSync(path.join(T, 'all.json'), JSON.stringify(all));
console.log('拼块', units.length, '（合并前）· 范围外', nb.length);
const MS = path.join(__dirname, 'node_modules', '.bin', 'mapshaper');
// 合并（德国 NUTS-2、nb 按国家）→ 裁到总范围 → 清理重叠与缝隙 → 一起简化 → 拆成 units 与 nb 两层输出拓扑
execFileSync(MS, ['-i', path.join(T, 'all.json'), 'snap', 'snap-interval=0.0002',
  '-dissolve2', 'g', 'copy-fields=n,p,k',
  '-clip', 'bbox=' + BIG.join(','),
  '-clean', 'gap-fill-area=200km2', 'snap-interval=0.0002',
  '-simplify', 'weighted', 'percentage=6%', 'keep-shapes',
  '-clean',
  '-filter-slivers', 'min-area=3km2',
  '-each', 'delete g',
  '-split', 'k',
  '-each', 'delete k',
  '-o', path.join(T, 'out.topo.json'), 'format=topojson', 'quantization=60000', 'combine-layers'], { stdio: 'inherit' });
const topo = JSON.parse(fs.readFileSync(path.join(T, 'out.topo.json'), 'utf8'));
// 层名按 split 的取值，统一改成 units 与 nb
const o = topo.objects, key = v => Object.keys(o).find(k => k === v || k.endsWith('-' + v)), U = o[key('u')], N = o[key('nb')];
if (!U || !N) { console.error('拆层失败：', Object.keys(o)); process.exit(1); }
topo.objects = { units: U, nb: N };
for (const g of N.geometries) g.properties = { n: g.properties.n };
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'units.topo.json'), JSON.stringify(topo));
console.log('units.topo.json', U.geometries.length, '拼块,', N.geometries.length, '范围外,', Math.round(fs.statSync(path.join(OUT, 'units.topo.json')).size / 1024), 'KB');
