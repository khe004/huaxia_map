// 地球页（engine/globe.html）的地形贴图：把 globe.json 各合集用到的底图包（目前 china、europe）按各自投影渲染好的地形图
// 反投影成一张经纬度等距的贴图，写到 basemaps/globe/terrain-base.webp、terrain-relief.webp（入库，构建时不再生成）。
// 底图的地形图改过之后重跑：cd tools && npm i && node globe-terrain.mjs
// 底图包取自 globe.json 所列各合集的各卷（BOOK.basemap）。每套底图内宽幅图层在下、精细图层叠在上；几套底图都覆盖的地方，
// 按离各底图投影中心（rotate 的经度、parallels 的中值纬度）的远近加权混合，越近权重越大。双线性取样。
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require('sharp');
const d3 = require('d3-geo');
const REPO = new URL('../', import.meta.url);


async function loadLayer(bm, t) {
  const { data, info } = await sharp(new URL(`basemaps/${bm}/${t.href}`, REPO).pathname).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height, ext: t.ext };
}
async function loadBasemap(bm) {
  const B = JSON.parse(readFileSync(new URL(`basemaps/${bm}/basemap.json`, REPO), 'utf8')), PJ = B.projection;
  const proj = ({ conicEqualArea: d3.geoConicEqualArea, conicConformal: d3.geoConicConformal, mercator: d3.geoMercator, equirectangular: d3.geoEquirectangular })[PJ.type]().rotate(PJ.rotate || [0, 0]);
  if (PJ.parallels && proj.parallels) proj.parallels(PJ.parallels);
  proj.fitExtent(PJ.fitPadding, { type: 'MultiPoint', coordinates: PJ.fitPoints });
  const L = {};
  for (const layer of ['base', 'relief']) {
    const ts = B.terrain.filter(t => t.layer === layer);
    // 面积大的（宽幅）在前，精细的在后
    ts.sort((a, b) => (b.ext[2] - b.ext[0]) - (a.ext[2] - a.ext[0]));
    L[layer] = await Promise.all(ts.map(t => loadLayer(bm, t)));
  }
  const ctr = [-(PJ.rotate || [0])[0], PJ.parallels ? (PJ.parallels[0] + PJ.parallels[1]) / 2 : 0];
  return { bm, proj, L, ctr };
}
// 在图层 g 的投影坐标 (x, y) 处双线性取样；不在范围内返回 null
function sample(g, x, y, out) {
  const [x0, y0, x1, y1] = g.ext;
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const fx = (x - x0) / (x1 - x0) * g.w - 0.5, fy = (y - y0) / (y1 - y0) * g.h - 0.5;
  const ix = Math.max(0, Math.min(g.w - 2, Math.floor(fx))), iy = Math.max(0, Math.min(g.h - 2, Math.floor(fy)));
  const ax = Math.min(1, Math.max(0, fx - ix)), ay = Math.min(1, Math.max(0, fy - iy));
  for (let c = 0; c < 4; c++) {
    const p = (yy, xx) => g.data[((iy + yy) * g.w + ix + xx) * 4 + c];
    out[c] = (p(0, 0) * (1 - ax) + p(0, 1) * ax) * (1 - ay) + (p(1, 0) * (1 - ax) + p(1, 1) * ax) * ay;
  }
  return true;
}

// globe.json 各合集各卷用到的底图包
const GJ = JSON.parse(readFileSync(new URL('globe.json', REPO), 'utf8')), BMN = new Set();
for (const S of GJ.series) for (const b of JSON.parse(readFileSync(new URL(S.dir + 'series.json', REPO), 'utf8')).books) {
  const m = readFileSync(new URL(`${S.dir}books/${b.id}/book.js`, REPO), 'utf8').match(/basemap:\s*'([^']+)'/); BMN.add(m ? m[1] : 'china');
}
const bms = await Promise.all([...BMN].sort().map(loadBasemap));
// 贴图范围与分辨率：globe.json 的 terrain（加了新地区的合集要把范围放大），写进 basemaps/globe/globe.json，页面据此取样
const EXT = GJ.terrain || { lon: [-40, 160], lat: [-15, 75], ppd: 16 };
const gdist = (a, b) => d3.geoDistance(a, b);
const W = (EXT.lon[1] - EXT.lon[0]) * EXT.ppd, H = (EXT.lat[1] - EXT.lat[0]) * EXT.ppd;
mkdirSync(new URL('basemaps/globe/', REPO), { recursive: true });
for (const layer of ['base', 'relief']) {
  const buf = Buffer.alloc(W * H * 4), px = [0, 0, 0, 0];
  for (let j = 0; j < H; j++) {
    const lat = EXT.lat[1] - (j + 0.5) / EXT.ppd;
    for (let i = 0; i < W; i++) {
      const lon = EXT.lon[0] + (i + 0.5) / EXT.ppd;
      // 每套底图：宽幅图层在下、精细图层叠在上（按透明度合成）；两套都覆盖的地方在分界经度两侧 5° 内渐变
      let acc = [0, 0, 0, 0], wsum = 0;
      for (const B of bms) {
        const xy = B.proj([lon, lat]); if (!xy) continue;
        const c = [0, 0, 0, 0]; let hit = false;
        for (const g of B.L[layer]) if (sample(g, xy[0], xy[1], px)) {
          hit = true; const a = px[3] / 255, ca = c[3] / 255, oa = a + ca * (1 - a);
          for (let k = 0; k < 3; k++) c[k] = oa ? (px[k] * a + c[k] * ca * (1 - a)) / oa : 0;
          c[3] = oa * 255;
        }
        if (!hit) continue;
        // 权重：离投影中心越近越大（距离的 6 次方反比，交界处过渡较窄）
        B.c = c; B.w = 1 / Math.max(1e-6, gdist([lon, lat], B.ctr)) ** 6; B.hit = true;
      }
      const hits = bms.filter(B => B.hit);
      for (const B of hits) { const w = B.w; wsum += w; for (let k = 0; k < 4; k++) acc[k] += B.c[k] * w; B.hit = false; }
      if (!wsum) continue;
      for (let k = 0; k < 4; k++) px[k] = acc[k] / wsum;
      const o = (j * W + i) * 4; for (let c = 0; c < 4; c++) buf[o + c] = Math.round(px[c]);
    }
  }
  const f = new URL(`basemaps/globe/terrain-${layer}.webp`, REPO).pathname;
  await sharp(buf, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: layer === 'base' ? 72 : 60, alphaQuality: 60, effort: 6 }).toFile(f);
  console.log(f, W + '×' + H);
}
writeFileSync(new URL('basemaps/globe/globe.json', REPO), JSON.stringify({ terrain: { lon: EXT.lon, lat: EXT.lat, base: 'terrain-base.webp', relief: 'terrain-relief.webp' } }, null, 2) + '\n');
