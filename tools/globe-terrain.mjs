// 地球页（engine/globe.html）的地形贴图：由 AWS Terrarium 高程瓦片直接按经纬度等距渲染，画法与 tools/terrain.js 相同
// （base 层：山体阴影 + 高程着色；relief 层：中性的高通明暗）。输出两组，入库：
//   basemaps/globe/world-{base,relief}.webp    全球，globe.json 的 terrain.world（默认 4096×2048，Terrarium z4）
//   basemaps/globe/terrain-{base,relief}.webp  高清区（目前欧洲、近东到中国），globe.json 的 terrain（范围、每度像素，Terrarium z5）
// 页面在高清区内取高清贴图，边缘几度内与全球贴图渐变。加了新地区的合集，可把高清区放大，或只靠全球贴图。
// 用法：cd tools && npm i && node globe-terrain.mjs   瓦片缓存在 tools/.dem/（不入库）
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require('sharp'), { PNG } = require('pngjs');
const REPO = new URL('../', import.meta.url);
const CACHE = new URL('.dem/', import.meta.url);
mkdirSync(CACHE, { recursive: true });
const GJ = JSON.parse(readFileSync(new URL('globe.json', REPO), 'utf8'));
const HI = GJ.terrain || { lon: [-40, 160], lat: [-15, 75], ppd: 16 };
const WORLD = HI.world || { w: 4096, h: 2048, z: 4 };

// —— 高程瓦片
const tileUrl = (z, x, y) => `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;
async function getTile(z, x, y) {
  const f = new URL(`${z}_${x}_${y}.png`, CACHE);
  if (!existsSync(f)) {
    for (let k = 0; ; k++) {
      try { const r = await fetch(tileUrl(z, x, y), { headers: { 'User-Agent': 'yutu-map/1.0' } }); if (!r.ok) throw new Error(r.status); writeFileSync(f, Buffer.from(await r.arrayBuffer())); break; }
      catch (e) { if (k >= 3) throw e; await new Promise(s => setTimeout(s, 1000 * (k + 1))); }
    }
  }
  const p = PNG.sync.read(readFileSync(f)), E = new Float32Array(256 * 256);
  for (let i = 0; i < 256 * 256; i++) E[i] = p.data[i * 4] * 256 + p.data[i * 4 + 1] + p.data[i * 4 + 2] / 256 - 32768;
  return E;
}
const ty = (lat, n) => (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n;
// 经纬度范围内的高程网格（墨卡托瓦片拼起来），返回 elev(lon, lat)
async function dem(z, lon0, lon1, lat0, lat1) {
  const n = 2 ** z, LM = 85.05;
  const X0 = Math.max(0, Math.floor((lon0 + 180) / 360 * n)), X1 = Math.min(n - 1, Math.floor((lon1 + 180) / 360 * n - 1e-9));
  const Y0 = Math.max(0, Math.floor(ty(Math.min(LM, lat1), n))), Y1 = Math.min(n - 1, Math.floor(ty(Math.max(-LM, lat0), n)));
  const TW = (X1 - X0 + 1) * 256, TH = (Y1 - Y0 + 1) * 256, G = new Float32Array(TW * TH);
  const jobs = []; for (let x = X0; x <= X1; x++) for (let y = Y0; y <= Y1; y++) jobs.push([x, y]);
  let done = 0;
  const work = async () => { for (let j; (j = jobs.shift());) { const [x, y] = j, E = await getTile(z, x, y);
    for (let r = 0; r < 256; r++) G.set(E.subarray(r * 256, r * 256 + 256), ((y - Y0) * 256 + r) * TW + (x - X0) * 256);
    if (++done % 50 === 0) process.stdout.write(`  z${z} ${done} 张\r`); } };
  await Promise.all(Array.from({ length: 8 }, work));
  console.log(`  z${z} 瓦片 ${(X1 - X0 + 1) * (Y1 - Y0 + 1)} 张`);
  return (lon, lat) => {
    if (Math.abs(lat) > LM) return NaN;
    const fx = (lon + 180) / 360 * n * 256 - X0 * 256 - 0.5, fy = ty(lat, n) * 256 - Y0 * 256 - 0.5;
    const x = Math.floor(fx), y = Math.floor(fy); if (x < 0 || y < 0 || x >= TW - 1 || y >= TH - 1) return NaN;
    const a = fx - x, b = fy - y, g = (i, j) => G[j * TW + i];
    return (g(x, y) * (1 - a) + g(x + 1, y) * a) * (1 - b) + (g(x, y + 1) * (1 - a) + g(x + 1, y + 1) * a) * b;
  };
}

// —— 渲染（与 tools/terrain.js 同一套参数：光源方位 315°、高度 45°、高程夸大 4.5，着色分段相同）
const az = 315 * Math.PI / 180, alt = 45 * Math.PI / 180, zf = 4.5;
const tint = e => e < 200 ? null : e < 1000 ? [150, 135, 95, (e - 200) / 800 * .16] : e < 3000 ? [140, 115, 80, .16 + (e - 1000) / 2000 * .2] : [175, 165, 150, .36 + Math.min(1, (e - 3000) / 2000) * .14];
async function render(name, elev, lon0, lat1, ppd, W, H, wrap) {
  const Z = new Float32Array(W * H);
  for (let j = 0; j < H; j++) { const lat = lat1 - (j + 0.5) / ppd; for (let i = 0; i < W; i++) Z[j * W + i] = elev(lon0 + (i + 0.5) / ppd, lat); }
  const base = Buffer.alloc(W * H * 4), rel = Buffer.alloc(W * H * 4), SH = new Float32Array(W * H);
  const my = 6371000 * Math.PI / 180 / ppd;
  for (let j = 1; j < H - 1; j++) {
    const lat = lat1 - (j + 0.5) / ppd, mx = Math.max(my * 0.05, my * Math.cos(lat * Math.PI / 180));
    for (let i = 0; i < W; i++) {
      const k = j * W + i, e = Z[k]; if (!(e > 0)) continue;
      const ix = d => { let q = i + d; if (wrap) q = (q + W) % W; return Math.min(W - 1, Math.max(0, q)); };
      const zz = (a, b) => { const v = Z[(j + b) * W + ix(a)]; return Number.isFinite(v) ? Math.max(0, v) : Math.max(0, e); };
      const dzdx = ((zz(1, -1) + 2 * zz(1, 0) + zz(1, 1)) - (zz(-1, -1) + 2 * zz(-1, 0) + zz(-1, 1))) / (8 * mx) * zf;
      const dzdy = ((zz(-1, 1) + 2 * zz(0, 1) + zz(1, 1)) - (zz(-1, -1) + 2 * zz(0, -1) + zz(1, -1))) / (8 * my) * zf;
      const slope = Math.atan(Math.hypot(dzdx, dzdy)), aspect = Math.atan2(dzdy, -dzdx);
      const d = Math.sin(alt) * Math.cos(slope) + Math.cos(alt) * Math.sin(slope) * Math.cos(az - Math.PI / 2 - aspect) - Math.sin(alt);
      SH[k] = d;
      let r = 0, g = 0, b = 0, a = 0;
      const t = tint(e); if (t) { [r, g, b] = t; a = t[3]; }
      const sa = Math.min(.82, Math.abs(d) * (d < 0 ? 1.9 : 1.1)), sc = d < 0 ? 20 : 255, na = sa + a * (1 - sa);
      if (na > 0) { r = (sc * sa + r * a * (1 - sa)) / na; g = (sc * sa + g * a * (1 - sa)) / na; b = (sc * sa + b * a * (1 - sa)) / na; }
      const o = k * 4; base[o] = r; base[o + 1] = g; base[o + 2] = b; base[o + 3] = Math.round(na * 255);
    }
  }
  // relief：减去约 0.5° 范围的平均明暗（与 terrain.js 的 14 个底图单位相当），只留局部起伏
  const R = Math.max(2, Math.round(0.47 * ppd)), tmp = new Float32Array(W * H), lo = new Float32Array(W * H);
  for (let j = 0; j < H; j++) { let acc = 0; const row = j * W; for (let i = -R; i < W; i++) { if (i + R < W) acc += SH[row + i + R]; if (i - R - 1 >= 0) acc -= SH[row + i - R - 1]; if (i >= 0) tmp[row + i] = acc / (2 * R + 1); } }
  for (let i = 0; i < W; i++) { let acc = 0; for (let j = -R; j < H; j++) { if (j + R < H) acc += tmp[(j + R) * W + i]; if (j - R - 1 >= 0) acc -= tmp[(j - R - 1) * W + i]; if (j >= 0) lo[j * W + i] = acc / (2 * R + 1); } }
  for (let k = 0; k < W * H; k++) {
    if (!(Z[k] > 0)) continue;
    const d = SH[k] - lo[k], a = Math.min(.55, Math.abs(d) * 1.6), o = k * 4, c = d < 0 ? 20 : 255;
    rel[o] = c; rel[o + 1] = c; rel[o + 2] = c; rel[o + 3] = Math.round(a * 255);
  }
  for (const [buf, layer, q] of [[base, 'base', 72], [rel, 'relief', 45]]) {
    const f = new URL(`basemaps/globe/${name}-${layer}.webp`, REPO).pathname;
    const info = await sharp(buf, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: q, alphaQuality: 50, effort: 6 }).toFile(f);
    console.log(f, `${W}×${H}`, (info.size / 1024).toFixed(0) + ' KB');
  }
}

mkdirSync(new URL('basemaps/globe/', REPO), { recursive: true });
// 全球
{
  const elev = await dem(WORLD.z, -180, 180, -90, 90);
  await render('world', elev, -180, 90, WORLD.w / 360, WORLD.w, WORLD.h, true);
}
// 高清区
{
  const elev = await dem(5, HI.lon[0], HI.lon[1], HI.lat[0], HI.lat[1]);
  await render('terrain', elev, HI.lon[0], HI.lat[1], HI.ppd, (HI.lon[1] - HI.lon[0]) * HI.ppd, (HI.lat[1] - HI.lat[0]) * HI.ppd, false);
}
writeFileSync(new URL('basemaps/globe/globe.json', REPO), JSON.stringify({ terrain: { lon: HI.lon, lat: HI.lat, base: 'terrain-base.webp', relief: 'terrain-relief.webp',
  world: { base: 'world-base.webp', relief: 'world-relief.webp' } } }, null, 2) + '\n');
