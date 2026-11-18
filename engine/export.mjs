// 数据下载：build-series.mjs 构建时把全书的事件、人物与各卷疆域变化写到 dist/series/data/，供读者下载再利用（CC BY-SA 4.0）。
//   events.csv / events.json     全部事件（相邻两卷交界处重复收录的同一件事各卷各留一条）
//   people.csv / people.json     全部人物（跨卷人物合为一条，列出所在各卷）
//   territory.json               各卷的种子点、势力与每次疆域变化（只记变化的种子点）
// CSV 用 UTF-8 带 BOM，Excel 直接打开不乱码。
import { mkdirSync, writeFileSync } from 'node:fs';

const KN = { war: '战事', pol: '政事', dip: '外交', eco: '民生', cul: '文化' };
const val = (v, t) => (typeof v === 'function' ? v(t) : v);
const csv = rows => '﻿' + rows.map(r => r.map(x => {
  const s = x == null ? '' : String(x);
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}).join(',')).join('\r\n') + '\r\n';

// 一卷的疆域：种子点、势力（名称、上色、所属，按快照时刻取值，只记变化）、快照（首条为开局全量，其后只记变化的种子点）
// 解析规则与引擎、tools/land.js 的 stateAt 相同：* 全部（境外除外）、@州 某州全部、#势力 当前属该势力的、种子名
export function territory(id, BOOK, EVENTS, FACTIONS, SNAPSHOTS, SEEDS_RAW) {
  const seeds = SEEDS_RAW.split(/\s{2,}|\n+/).map(s => s.trim()).filter(Boolean).map(s => { const [z, n, c] = s.split('|'); const [lon, lat] = c.split(',').map(Number); return [z, n, lon, lat]; });
  const by = new Map(); seeds.forEach((s, i) => by.set(s[1], i));
  let cur = seeds.map(s => (s[0] === 'x' ? 'x' : BOOK.baseFaction));
  const snaps = [];
  for (const [j, [y, m, list]] of SNAPSHOTS.entries()) {
    const prev = cur.slice();
    for (const [f, tok] of list) for (const k of tok.split(/\s+/).filter(Boolean)) {
      let idx = [];
      if (k === '*') seeds.forEach((s, i) => s[0] !== 'x' && idx.push(i));
      else if (k[0] === '@') seeds.forEach((s, i) => s[0] === k.slice(1) && idx.push(i));
      else if (k[0] === '#') cur.forEach((g, i) => g === k.slice(1) && idx.push(i));
      else if (by.has(k)) idx = [by.get(k)];
      idx.forEach(i => { cur[i] = f; });
    }
    const set = {};
    cur.forEach((f, i) => { if (j === 0 || f !== prev[i]) (set[f] = set[f] || []).push(i); });
    if (!Object.keys(set).length) continue;
    const ev = EVENTS.find(e => e.y === y && e.mo === m);
    snaps.push({ y, mo: Math.floor(m), event: ev ? ev.t : null, set });
  }
  // 势力的名称、颜色与所属随时间变化：在卷首、各快照与卷末取值，相同的不重复记
  const ts = [BOOK.range[0], ...SNAPSHOTS.map(([y, m]) => y + (m - 1) / 12), BOOK.range[1]].sort((a, b) => a - b);
  const factions = {};
  for (const [k, F] of Object.entries(FACTIONS)) {
    const o = { names: [], colors: [], of: [] };
    for (const t of ts) for (const [key, v] of [['names', val(F.name, t) ?? k], ['colors', val(F.color, t)], ['of', val(F.of, t) ?? null]]) {
      const a = o[key]; if (!a.length || a[a.length - 1][1] !== v) a.push([+t.toFixed(3), v]);
    }
    factions[k] = { name: o.names.length === 1 ? o.names[0][1] : o.names, color: o.colors.length === 1 ? o.colors[0][1] : o.colors };
    if (o.of.some(x => x[1])) factions[k].of = o.of.length === 1 ? o.of[0][1] : o.of;
  }
  return { id, title: BOOK.brand, range: BOOK.range, baseFaction: BOOK.baseFaction, factions, seeds, snapshots: snaps };
}

export function writeData(dir, S, IDX, EXP) {
  mkdirSync(dir, { recursive: true });
  const vol = i => ({ vol: i + 1, book: S.books[i].id, bookTitle: IDX.books[i][1] });
  const events = EXP.events.map(([i, e, text, cal]) => ({ ...vol(i), year: e.y, month: Math.floor(e.mo), cal: cal || '', title: e.t, kind: e.k, kindName: KN[e.k] || e.k,
    place: e.p, modern: e.m || '', lon: e.ll[0], lat: e.ll[1], people: e.who, posthumous: e.post || [], refs: e.refs || [], text }));
  const people = Object.entries(IDX.people).map(([k, [zi, life, bio, bk]]) => ({ name: k.split('\u0001')[0], zi: zi || '', life: life || '', alias: IDX.alias[k] || [], bio,
    volumes: bk.map(([i, faction, n, , post]) => ({ ...vol(i), faction, events: n, posthumous: post })) }));
  const W = (f, s) => writeFileSync(new URL(f, dir), s);
  W('events.json', JSON.stringify(events));
  W('events.csv', csv([['卷', '卷目', '公历年', '公历月', '原书纪年', '事件', '类别', '地点', '今地', '经度', '纬度', '人物', '身后提及', '出处篇目', '正文'],
    ...events.map(e => [e.vol, e.bookTitle, e.year, e.month, e.cal, e.title, e.kindName, e.place, e.modern, e.lon, e.lat, e.people.join('、'), e.posthumous.join('、'), e.refs.join('、'), e.text])]));
  W('people.json', JSON.stringify(people));
  W('people.csv', csv([['姓名', '字', '生卒', '别名', '简介', '所在各卷'],
    ...people.map(p => [p.name, p.zi, p.life, p.alias.join('、'), p.bio, p.volumes.map(v => `卷${v.vol}${v.bookTitle}`).join('、')])]));
  W('territory.json', JSON.stringify({ note: '每卷：seeds 为 [州, 种子点名, 经度, 纬度]；snapshots 的 set 为 {势力键: [种子点序号…]}，首条是开局全量，其后只记变化；势力键 x 表示底图外不上色。地图上的拼块（今地级区）归最近的种子点。', books: EXP.territory }));
  console.log('dist/series/data/', events.length, '事件', people.length, '人物', EXP.territory.length, '卷疆域');
}
