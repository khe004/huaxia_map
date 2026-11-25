// 按配置生成底图包的水系 basemaps/<底图>/geo.json（rv 河流、lk 湖泊），做法与 tools/waters-europe.js 相同；范围与译名写在 tools/bm/<底图>.js 的 WATERS 里（BOX、ZH、MAJOR、SKIP_RV、LZH、SKIP_LK）。
// 用法：node tools/waters-ne.js <底图> <数据目录>（在 tools/ 下 npm i 之后）
// 数据目录里放 Natural Earth 1:1000 万的 ne_10m_rivers_lake_centerlines.geojson、ne_10m_lakes.geojson、ne_10m_lakes_europe.geojson。
// 河流：范围内的全部河道，主要河流译成中文名（ZH），m:1 为加粗的大河；近代开凿的运河（苏伊士运河等）不画。
// 湖泊：天然湖泊（有中文名的，或 scalerank 不大于 4 的大湖），近代水库（featurecla 为 Reservoir，及纳赛尔湖、艾瑟尔湖等）不画；欧洲小湖只收与史事有关的几个（特拉西梅诺湖等）。
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const [bm, dir] = process.argv.slice(2);
if (!bm || !dir) { console.error('用法：node tools/waters-ne.js <底图> <数据目录>'); process.exit(1); }
const OUT = path.join(__dirname, '..', 'basemaps', bm, 'geo.json');
const rd = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const C = require(path.join(__dirname, 'bm', bm + '.js')), W = C.WATERS;
const BOX = W.BOX, ZH = W.ZH, MAJOR = new Set(W.MAJOR), SKIP_RV = new Set(W.SKIP_RV || []), LZH = W.LZH || {}, SKIP_LK = new RegExp(W.SKIP_LK || 'Reservoir', 'i'), EU_KEEP = new Set();
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
