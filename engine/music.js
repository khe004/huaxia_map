// ---------- 背景音：原创合成曲（起承转合四段循环：古琴、箫、琵琶轮指、堂鼓、编钟、和声与江水），或播放用户自选的本地音频 ----------
const music = { ctx: null, on: false, timer: null, master: null, rev: null, nextBar: 0, bar: 0, plan: null, file: null, audio: null };
const BEAT = 0.8, BAR = 4 * BEAT;
const SCALE = [0, 2, 4, 7, 9]; // D 宫调：宫 商 角 徵 羽
const D2 = 73.42;
const deg2f = (deg) => { const n = SCALE.length, o = Math.floor(deg / n), s = SCALE[((deg % n) + n) % n]; return D2 * 4 * Math.pow(2, (s + 12 * o) / 12); }; // deg 0 = D4
const semi2f = (s, oct) => D2 * Math.pow(2, (s + 12 * oct) / 12);
const pick = a => a[Math.floor(Math.random() * a.length)];

// 和声进行（相对 D 的半音）：每小节一个根音，配五度与一个五声音
const PROGS = [
  [[0, 4], [9, 0], [7, 2], [9, 4], [0, 4], [4, 2], [7, 9], [9, 4]],
  [[0, 4], [7, 2], [9, 0], [2, 9], [0, 4], [9, 0], [7, 2], [9, 4]],
  [[9, 0], [7, 2], [0, 4], [9, 4], [4, 2], [7, 9], [9, 0], [0, 4]],
];
// 原创动机：[音级, 拍数]，音级以 D4 为 0
const MOTIFS = [
  [[0, 1], [1, .5], [2, .5], [3, 1.5], [2, .5]],
  [[4, 1], [3, .5], [2, .5], [1, 1], [0, 1]],
  [[2, .5], [3, .5], [4, 1], [5, 1], [4, .5], [3, .5]],
  [[3, 2], [2, 1], [1, 1]],
  [[2, 1.5], [3, .5], [4, 1], [3, 1]],
  [[-2, 1], [0, 1], [1, .5], [2, .5], [0, 1]],
  [[5, 1], [4, .5], [3, .5], [4, 2]],
];
const CADENCE = [[[1, .5], [0, .5], [-1, 1], [0, 2]], [[4, 1], [3, 1], [3, 2]], [[2, 1], [1, .5], [-1, .5], [0, 2]]];
const SECTIONS = ['qi', 'cheng', 'zhuan', 'he'];
const SEC_LEN = { qi: 8, cheng: 8, zhuan: 8, he: 4 };

function noiseBuffer(ctx, sec) {
  const b = ctx.createBuffer(2, ctx.sampleRate * sec, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  return b;
}
function initAudio() {
  if (music.ctx) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.connect(ctx.destination);
  const master = ctx.createGain(); master.gain.value = 0; master.connect(comp);
  const rev = ctx.createConvolver(); const ir = noiseBuffer(ctx, 3.6);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] *= Math.pow(1 - i / d.length, 3); }
  rev.buffer = ir; const rg = ctx.createGain(); rg.gain.value = .5; rev.connect(rg).connect(master);
  // 江水声
  const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx, 4); src.loop = true;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 480;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 240; bp.Q.value = .6;
  const wg = ctx.createGain(); wg.gain.value = .05;
  const lfo = ctx.createOscillator(); lfo.frequency.value = .07; const lg = ctx.createGain(); lg.gain.value = .022; lfo.connect(lg).connect(wg.gain);
  const lfo2 = ctx.createOscillator(); lfo2.frequency.value = .11; const lg2 = ctx.createGain(); lg2.gain.value = 120; lfo2.connect(lg2).connect(bp.frequency);
  src.connect(lp).connect(bp).connect(wg).connect(master); src.start(); lfo.start(); lfo2.start();
  Object.assign(music, { ctx, master, rev });
}
function voiceOut(t, wet = .5) { const g = music.ctx.createGain(); g.connect(music.master); const s = music.ctx.createGain(); s.gain.value = wet; g.connect(s).connect(music.rev); return g; }

// —— 乐器 ——
function qin(t, f, vel = 1, len = 2.6) {
  const ctx = music.ctx, out = voiceOut(t, .6);
  out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(.2 * vel, t + .008); out.gain.exponentialRampToValueAtTime(.0006, t + len);
  const flt = ctx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.setValueAtTime(2800, t); flt.frequency.exponentialRampToValueAtTime(650, t + len * .6);
  [[1, 'triangle', 1], [2, 'sine', .3], [3, 'sine', .1]].forEach(([m, type, g]) => {
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f * m * (Math.random() < .3 ? .983 : 1), t); o.frequency.linearRampToValueAtTime(f * m, t + .2);
    const og = ctx.createGain(); og.gain.value = g; o.connect(og).connect(flt); o.start(t); o.stop(t + len + .1);
  });
  flt.connect(out);
}
function xiao(t, f, dur, vel = 1, slideFrom) {
  const ctx = music.ctx, out = voiceOut(t, .55), end = t + dur * BEAT;
  out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(.11 * vel, t + .12);
  out.gain.setValueAtTime(.11 * vel, Math.max(t + .13, end - .18)); out.gain.linearRampToValueAtTime(0, end + .25);
  const o = ctx.createOscillator(); o.type = 'sine';
  if (slideFrom) { o.frequency.setValueAtTime(slideFrom, t); o.frequency.exponentialRampToValueAtTime(f, t + .14); } else o.frequency.setValueAtTime(f, t);
  const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = f * 2; const g2 = ctx.createGain(); g2.gain.value = .12; o2.connect(g2).connect(out);
  const vib = ctx.createOscillator(); vib.frequency.value = 5.2; const vg = ctx.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * .012, t + Math.min(.6, dur * BEAT));
  vib.connect(vg).connect(o.frequency);
  const br = ctx.createBufferSource(); br.buffer = music.breath || (music.breath = noiseBuffer(ctx, 2)); br.loop = true;
  const bf = ctx.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = f * 2; bf.Q.value = 2.5; const bg = ctx.createGain(); bg.gain.value = .35;
  br.connect(bf).connect(bg).connect(out);
  o.connect(out); [o, o2, vib, br].forEach(n => { n.start(t); n.stop(end + .3); });
}
function pad(t, semis, bars, vel = 1) {
  const ctx = music.ctx, out = voiceOut(t, .7), end = t + bars * BAR;
  out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(.035 * vel, t + 1.4); out.gain.setValueAtTime(.035 * vel, end - .6); out.gain.linearRampToValueAtTime(0, end + .8);
  const flt = ctx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 650; flt.connect(out);
  for (const [s, oct] of semis) for (const det of [-6, 6]) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = semi2f(s, oct); o.detune.value = det; o.connect(flt); o.start(t); o.stop(end + 1);
  }
}
function bass(t, s, vel = 1) {
  const ctx = music.ctx, out = voiceOut(t, .3);
  out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(.16 * vel, t + .01); out.gain.exponentialRampToValueAtTime(.001, t + 3);
  const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = semi2f(s, 0); o.connect(out); o.start(t); o.stop(t + 3.1);
}
function drum(t, vel = 1) {
  const ctx = music.ctx, out = voiceOut(t, .35);
  out.gain.setValueAtTime(.5 * vel, t); out.gain.exponentialRampToValueAtTime(.001, t + .9);
  const o = ctx.createOscillator(); o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(48, t + .35); o.connect(out); o.start(t); o.stop(t + 1);
  const n = ctx.createBufferSource(); n.buffer = music.breath || (music.breath = noiseBuffer(ctx, 2));
  const nf = ctx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 900; const ng = ctx.createGain(); ng.gain.setValueAtTime(.25 * vel, t); ng.gain.exponentialRampToValueAtTime(.001, t + .12);
  n.connect(nf).connect(ng).connect(out); n.start(t); n.stop(t + .15);
}
function bell(t, f, vel = 1) {
  const ctx = music.ctx, out = voiceOut(t, .7);
  [[1, 1, 5], [2.76, .4, 3], [5.4, .2, 1.6], [.5, .3, 6]].forEach(([m, g, len]) => {
    const o = ctx.createOscillator(); o.frequency.value = f * m; const og = ctx.createGain();
    og.gain.setValueAtTime(.09 * g * vel, t); og.gain.exponentialRampToValueAtTime(.0005, t + len);
    o.connect(og).connect(out); o.start(t); o.stop(t + len + .1);
  });
}
function pipaTremolo(t, f, beats, vel = 1) {
  const n = Math.floor(beats * BEAT / .075);
  for (let k = 0; k < n; k++) {
    const tt = t + k * .075, v = vel * (.35 + .5 * Math.sin(Math.PI * k / n));
    const ctx = music.ctx, out = voiceOut(tt, .4);
    out.gain.setValueAtTime(0, tt); out.gain.linearRampToValueAtTime(.07 * v, tt + .004); out.gain.exponentialRampToValueAtTime(.001, tt + .2);
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 2200;
    o.connect(fl).connect(out); o.start(tt); o.stop(tt + .22);
  }
}

// —— 作曲：每段 8（或 4）小节，按“起句—应句—发展—收束”取动机并变化 ——
function vary(m, shift) {
  let notes = m.map(([d, b]) => [d + shift, b]);
  if (Math.random() < .3) { // 节奏变化：前两音附点
    const [a, b] = notes; if (a && b && a[1] === b[1]) { a[1] *= 1.5; b[1] *= .5; }
  }
  return notes;
}
function planSection(sec) {
  const prog = pick(PROGS), bars = SEC_LEN[sec], mel = [];
  const A = pick(MOTIFS), B = pick(MOTIFS);
  const seq = sec === 'he' ? [A, vary(A, -1), B, pick(CADENCE)] : [A, vary(A, 1), B, pick(CADENCE), vary(A, Math.random() < .5 ? 2 : 0), B, vary(B, -1), pick(CADENCE)];
  for (let i = 0; i < bars; i++) mel.push(seq[i] || seq[seq.length - 1]);
  return { sec, prog, mel };
}
function playBar(t, plan, i) {
  const { sec, prog, mel } = plan, [root, colour] = prog[i % prog.length];
  // 和声与低音
  if (i % 2 === 0) pad(t, [[root, 1], [root + 7, 1], [colour, 2]], 2, sec === 'zhuan' ? 1.4 : sec === 'qi' ? .6 : 1);
  bass(t, root, sec === 'qi' ? .6 : 1);
  if (sec === 'zhuan') bass(t + 2 * BEAT, root + 7, .6);
  // 段首编钟
  if (i === 0 && (sec === 'he' || sec === 'qi')) bell(t, semi2f(root, 2), .9);
  // 旋律
  let x = 0;
  for (const [d, b] of mel[i]) {
    const tt = t + x * BEAT, f = deg2f(d);
    if (sec === 'qi' || sec === 'he') qin(tt, f, .7 + Math.random() * .3, Math.max(1.6, b * BEAT * 1.8));
    else {
      xiao(tt, f, b, sec === 'zhuan' ? 1.15 : 1, Math.random() < .25 ? deg2f(d - 1) : null);
      if (sec === 'zhuan') { qin(tt, f / 2, .5, 1.8); if (b >= 1.5) pipaTremolo(tt, f, b, .9); }
    }
    x += b;
  }
  // 伴奏：承段古琴分解和弦，转段堂鼓
  if (sec === 'cheng') [0, 1, 2, 3].forEach(k => qin(t + k * BEAT + BEAT / 2, semi2f([root, root + 7, colour + 12, root + 12][k], 1), .3, 1.4));
  if (sec === 'zhuan') { drum(t, 1); drum(t + 2 * BEAT, .7); if (i === SEC_LEN.zhuan - 1) [2.5, 3, 3.25, 3.5, 3.75].forEach((b, k) => drum(t + b * BEAT, .4 + k * .12)); }
  if (sec === 'he' && i === SEC_LEN.he - 1) bell(t + 2 * BEAT, semi2f(0, 3), .7);
}
function schedule() {
  const { ctx } = music;
  while (music.nextBar < ctx.currentTime + 1.2) {
    if (!music.plan || music.bar >= SEC_LEN[music.plan.sec]) {
      const si = music.plan ? (SECTIONS.indexOf(music.plan.sec) + 1) % SECTIONS.length : 0;
      music.plan = planSection(SECTIONS[si]); music.bar = 0;
    }
    playBar(music.nextBar, music.plan, music.bar);
    music.bar++; music.nextBar += BAR;
  }
}

function musicOn() {
  if (music.file) {
    if (!music.audio) { music.audio = new Audio(music.file); music.audio.loop = true; music.audio.volume = .6; }
    music.audio.play().catch(() => {});
  } else {
    initAudio(); music.ctx.resume();
    music.master.gain.cancelScheduledValues(music.ctx.currentTime);
    music.master.gain.setTargetAtTime(.75, music.ctx.currentTime, .6);
    music.nextBar = music.ctx.currentTime + .2; music.plan = null; music.bar = 0;
    clearInterval(music.timer); music.timer = setInterval(schedule, 200); schedule();
  }
  music.on = true; renderMusicBtn();
}
function musicOff() {
  if (music.audio) music.audio.pause();
  if (music.ctx) { music.master.gain.setTargetAtTime(0, music.ctx.currentTime, .3); clearInterval(music.timer); }
  music.on = false; renderMusicBtn();
}
function renderMusicBtn() {
  const b = $('#music');
  b.classList.toggle('on', music.on);
  b.setAttribute('aria-pressed', music.on);
  b.textContent = music.on ? '♪ 背景音 · 开' : '♪ 背景音 · 关';
  $('#music-src').textContent = music.file ? '自选音频 ✓' : '自选音频';
}
$('#music').onclick = () => (music.on ? musicOff() : musicOn());
$('#music-src').onclick = () => $('#music-file').click();
$('#music-file').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  musicOff();
  if (music.audio) { music.audio.pause(); music.audio = null; }
  if (music.file) URL.revokeObjectURL(music.file);
  music.file = URL.createObjectURL(f);
  $('#music-src').title = `正在使用：${f.name}（仅在本机播放）`;
  musicOn();
});
renderMusicBtn();
