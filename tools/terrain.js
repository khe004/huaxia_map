// 生成与底图投影一致的地形图层，输出带透明度的 WebP。
// 用法：node tools/terrain.js <高程瓦片目录> <输出.webp> '<配置 JSON>'
//   高程瓦片：AWS Terrarium（https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png），文件名 {z}_{x}_{y}.png
//   配置：{"z":7,"tiles":[x0,x1,y0,y1],"ext":[x0,y0,x1,y1],"sc":2.5,"feather":50,"mode":"shade"}
//     ext 为底图坐标范围（与 basemap.json 中 terrain[].ext 一致），sc 为每单位像素数，
//     mode 省略 = 山体阴影 + 高程着色（base 层）；"shade" = 中性高通明暗（relief 层）
// 注意：投影参数写在下面，需与 basemap.json 的 projection 保持一致。
const fs = require('fs'), path = require('path'), { PNG } = require('pngjs'), d3 = require('d3-geo'), sharp = require('sharp');
const [demDir, out, cfg] = process.argv.slice(2);
const C = JSON.parse(cfg); // {z, tiles:[x0,x1,y0,y1], ext:[x0,y0,x1,y1], sc, feather}
const W = 1000, H = 760, SC = C.sc, Z = C.z;
const proj = d3.geoConicEqualArea().parallels([25, 45]).rotate([-111, 0])
  .fitExtent([[20, 30], [W - 20, H - 20]], { type: 'MultiPoint', coordinates: [[94, 18.5], [127.5, 18.5], [94, 42.8], [127.5, 42.8], [111, 44]] });
// tile mosaic
const [X0, X1, Y0, Y1] = C.tiles, TW = (X1 - X0 + 1) * 256, TH = (Y1 - Y0 + 1) * 256;
const E = new Float32Array(TW * TH).fill(-1);
for (let x = X0; x <= X1; x++) for (let y = Y0; y <= Y1; y++) {
  const f = path.join(demDir, `${Z}_${x}_${y}.png`); if (!fs.existsSync(f)) continue;
  const p = PNG.sync.read(fs.readFileSync(f));
  for (let j = 0; j < 256; j++) for (let i = 0; i < 256; i++) {
    const k = (j * 256 + i) * 4; const e = p.data[k] * 256 + p.data[k + 1] + p.data[k + 2] / 256 - 32768;
    E[((y - Y0) * 256 + j) * TW + (x - X0) * 256 + i] = e;
  }
}
function elev(lon, lat) {
  const n = 2 ** Z;
  const fx = (lon + 180) / 360 * n * 256 - X0 * 256;
  const r = lat * Math.PI / 180, fy = (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n * 256 - Y0 * 256;
  const x = Math.floor(fx), y = Math.floor(fy); if (x < 0 || y < 0 || x >= TW - 1 || y >= TH - 1) return NaN;
  const a = fx - x, b = fy - y, g = (i, j) => E[j * TW + i];
  return g(x, y) * (1 - a) * (1 - b) + g(x + 1, y) * a * (1 - b) + g(x, y + 1) * (1 - a) * b + g(x + 1, y + 1) * a * b;
}
const [EX0, EY0, EX1, EY1] = C.ext, OW = Math.round((EX1 - EX0) * SC), OH = Math.round((EY1 - EY0) * SC);
const Z2 = new Float32Array(OW * OH);
for (let j = 0; j < OH; j++) for (let i = 0; i < OW; i++) {
  const ll = proj.invert([i / SC + EX0, j / SC + EY0]); Z2[j * OW + i] = ll ? elev(ll[0], ll[1]) : NaN;
}
// metres per output pixel
const mpp = 6371000 / proj.scale() / SC;
const az = 315 * Math.PI / 180, alt = 45 * Math.PI / 180, zf = 4.5;
const buf = Buffer.alloc(OW * OH * 4);
// shade 模式：只输出中性明暗，并做高通（减去大范围平均），避免整片区域偏深或偏浅
const SH = C.mode === 'shade' ? new Float32Array(OW * OH) : null;
const tint = e => e < 200 ? null : e < 1000 ? [150, 135, 95, (e - 200) / 800 * .16] : e < 3000 ? [140, 115, 80, .16 + (e - 1000) / 2000 * .2] : [175, 165, 150, .36 + Math.min(1, (e - 3000) / 2000) * .14];
for (let j = 1; j < OH - 1; j++) for (let i = 1; i < OW - 1; i++) {
  const k = j * OW + i, e = Z2[k]; if (!(e > 0)) continue;
  const zz = (a, b) => { const v = Z2[(j + b) * OW + i + a]; return Number.isFinite(v) ? Math.max(0, v) : Math.max(0, e); };
  const dzdx = ((zz(1, -1) + 2 * zz(1, 0) + zz(1, 1)) - (zz(-1, -1) + 2 * zz(-1, 0) + zz(-1, 1))) / (8 * mpp) * zf;
  const dzdy = ((zz(-1, 1) + 2 * zz(0, 1) + zz(1, 1)) - (zz(-1, -1) + 2 * zz(0, -1) + zz(1, -1))) / (8 * mpp) * zf;
  const slope = Math.atan(Math.hypot(dzdx, dzdy)), aspect = Math.atan2(dzdy, -dzdx);
  const sh = Math.sin(alt) * Math.cos(slope) + Math.cos(alt) * Math.sin(slope) * Math.cos(az - Math.PI / 2 - aspect);
  const d = sh - Math.sin(alt);
  if (SH) { SH[k] = d; continue; }
  // start from elevation tint, then composite light/shadow
  let r = 0, g = 0, b = 0, a = 0;
  const t = tint(e); if (t) { [r, g, b] = t; a = t[3]; }
  const sa = Math.min(.82, Math.abs(d) * (d < 0 ? 1.9 : 1.1)), sc = d < 0 ? 20 : 255;
  // "over" composite
  const na = sa + a * (1 - sa);
  if (na > 0) { r = (sc * sa + r * a * (1 - sa)) / na; g = (sc * sa + g * a * (1 - sa)) / na; b = (sc * sa + b * a * (1 - sa)) / na; }
  let fa = 1;
  if (C.feather) { const dd = Math.min(i, j, OW - 1 - i, OH - 1 - j) / (C.feather * SC); if (dd < 1) fa = dd * dd * (3 - 2 * dd); }
  const o = k * 4; buf[o] = r; buf[o + 1] = g; buf[o + 2] = b; buf[o + 3] = Math.round(na * fa * 255);
}
if (SH) {
  const R = Math.round(14 * SC), tmp = new Float32Array(OW * OH), lo = new Float32Array(OW * OH);
  for (let j = 0; j < OH; j++) { let acc = 0; const row = j * OW; for (let i = -R; i < OW; i++) { if (i + R < OW) acc += SH[row + i + R]; if (i - R - 1 >= 0) acc -= SH[row + i - R - 1]; if (i >= 0) tmp[row + i] = acc / (2 * R + 1); } }
  for (let i = 0; i < OW; i++) { let acc = 0; for (let j = -R; j < OH; j++) { if (j + R < OH) acc += tmp[(j + R) * OW + i]; if (j - R - 1 >= 0) acc -= tmp[(j - R - 1) * OW + i]; if (j >= 0) lo[j * OW + i] = acc / (2 * R + 1); } }
  for (let j = 0; j < OH; j++) for (let i = 0; i < OW; i++) {
    const k = j * OW + i; if (!(Z2[k] > 0)) continue;
    const d = SH[k] - lo[k], a = Math.min(.55, Math.abs(d) * 1.6);
    let fa = 1;
    if (C.feather) { const dd = Math.min(i, j, OW - 1 - i, OH - 1 - j) / (C.feather * SC); if (dd < 1) fa = dd * dd * (3 - 2 * dd); }
    const o = k * 4, c = d < 0 ? 20 : 255; buf[o] = c; buf[o + 1] = c; buf[o + 2] = c; buf[o + 3] = Math.round(a * fa * 255);
  }
}
sharp(buf, { raw: { width: OW, height: OH, channels: 4 } }).webp({ quality: 62, alphaQuality: 60, effort: 5 }).toFile(out)
  .then(i => console.log(out, OW + 'x' + OH, (i.size / 1024).toFixed(0) + ' KB'));
