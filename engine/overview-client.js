// 目录页“总览”页签：疆域总览（OV，engine/overview.mjs 生成）与朝代条带（DY）。首次打开页签时才画（renderO）。
function renderO() {
  const $ = s => document.querySelector(s), E = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const fy = y => (y < 0 ? '前 ' + -y : '' + y), O = OV, N = O.frames.length;
  const CN = n => { const D = '〇一二三四五六七八九', t = Math.floor(n / 10), o = n % 10; return n < 10 ? D[n] : (t === 1 ? '' : D[t]) + '十' + (o ? D[o] : ''); };
  const map = $('#ovmap');
  map.innerHTML = '<path class="ovnb" d="' + O.nb + '"/><g class="ovu">' + O.units.map(d => '<path d="' + d + '"/>').join('') + '</g><g class="ovl"></g>';
  const P = [...map.querySelectorAll('.ovu path')], gl = map.querySelector('.ovl'), rg = $('#ovr');
  rg.max = N - 1;
  // 势力色与陆地底色按引擎的比例调和（与各卷地图的色块一致），随明暗主题重算
  const hex = h => { h = h.trim().replace('#', ''); if (h.length === 3) h = h.replace(/./g, c => c + c); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
  const mix = (a, b, k) => { const A = hex(a), B = hex(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',') + ')'; };
  let cur = 0;
  // 朝代条带
  const PX = 1.3, Y0 = -1100, Y1 = 1949, LH = 19, TOP = 22, X = y => (y - Y0) * PX, SW = X(Y1) + 40, SH = TOP + DY.lanes * LH + 6;
  const ticks = []; for (let y = -1000; y <= 1900; y += 100) ticks.push(y);
  $('#ovstrip').innerHTML = '<svg width="' + SW + '" height="' + SH + '" viewBox="0 0 ' + SW + ' ' + SH + '">' +
    ticks.map(y => '<line class="tk" x1="' + X(y) + '" x2="' + X(y) + '" y1="14" y2="' + SH + '"/><text class="tkl" x="' + (X(y) + 3) + '" y="11">' + fy(y) + '</text>').join('') +
    DY.rows.map(([n, a, b, g, l]) => { const x = X(Math.max(a, Y0)), w = Math.max(2, X(b) - x), y = TOP + l * LH, fits = w > n.length * 12 + 6;
      return '<g class="db ' + g + '" data-a="' + a + '" data-b="' + b + '"><title>' + E(n) + '　' + fy(a) + '–' + fy(b) + '</title><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + (LH - 3) + '" rx="2"/>' +
        (fits ? '<text x="' + (x + w / 2) + '" y="' + (y + LH - 7.5) + '">' + E(n) + '</text>' : '') + '</g>'; }).join('') +
    '<line class="cur" id="ovcur" y1="14" y2="' + SH + '"/></svg>';
  const strip = $('#ovstrip'), curL = $('#ovcur');
  // 谭图总图年份的快捷按钮
  $('#ovrep').innerHTML = O.frames.map((f, i) => f.rep ? '<button type="button" data-i="' + i + '">' + E(f.rep) + '<small>' + fy(f.y) + '</small></button>' : '').join('');
  function draw(i, keepScroll) {
    cur = i; rg.value = i; const F = O.frames[i], B = O.books[F.k], cs = getComputedStyle(document.documentElement), land = cs.getPropertyValue('--land');
    const fill = F.f.map(x => mix(land, x[0], 0.6));
    for (let u = 0; u < P.length; u++) { const c = F.a.charCodeAt(u) - 48; if (c >= 0) { P[u].style.fill = fill[c]; P[u].style.stroke = fill[c]; } else { P[u].style.fill = ''; P[u].style.stroke = ''; } }
    // 标签：按面积从大到小放，与已放的重叠就略去
    const placed = [];
    gl.innerHTML = F.f.map((x, q) => [x, q]).filter(([x]) => x[3] != null).sort((p, q) => q[0][5] - p[0][5]).map(([x]) => {
      const fs = x[5] > 60000 ? 38 : x[5] > 15000 ? 22 : 15, w = x[1].length * fs * 1.02 + 4, h = fs + 2, bx = [x[3] - w / 2, x[4] - h / 2, x[3] + w / 2, x[4] + h / 2];
      if (placed.some(b => bx[0] < b[2] && bx[2] > b[0] && bx[1] < b[3] && bx[3] > b[1])) return '';
      placed.push(bx);
      return '<text x="' + x[3] + '" y="' + (x[4] + fs * 0.35) + '" font-size="' + fs + '"' + (fs > 30 ? ' class="big"' : '') + '>' + E(x[1]) + '</text>';
    }).join('');
    $('#ovy').textContent = fy(F.y) + ' 年';
    $('#ovn').innerHTML = (F.rep ? '<span class="rep">谭图' + E(F.rep) + '总图之年</span>' : '<span>卷末</span>') + '据卷' + CN(F.k + 1) + '《' + E(B[1]) + '》';
    $('#ovgo').href = B[0] + '/index.html?y=' + F.y;
    $('#ovleg').innerHTML = F.f.map(x => x).sort((p, q) => q[5] - p[5]).slice(0, 14).map(x => '<span><i style="background:' + mix(land, x[0], 0.6) + '"></i>' + E(x[2]) + '</span>').join('');
    document.querySelectorAll('#ovrep button').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
    const cx = X(F.y + 0.5); curL.setAttribute('x1', cx); curL.setAttribute('x2', cx);
    try { history.replaceState(null, '', '#tab=overview&y=' + F.y + (F.rep ? '' : '&v=' + B[0])); } catch (err) {}
    if (!keepScroll && (cx < strip.scrollLeft + 40 || cx > strip.scrollLeft + strip.clientWidth - 40)) strip.scrollLeft = cx - strip.clientWidth / 2;
  }
  rg.addEventListener('input', () => { stop(); draw(+rg.value); });
  $('#ovprev').addEventListener('click', () => { stop(); draw(Math.max(0, cur - 1)); });
  $('#ovnext').addEventListener('click', () => { stop(); draw(Math.min(N - 1, cur + 1)); });
  $('#ovrep').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { stop(); draw(+b.dataset.i); } });
  // 点条带上的朝代：跳到落在它年代里的第一帧（总图之年优先），没有就跳到最近的一帧
  strip.addEventListener('click', e => {
    const g = e.target.closest('.db'); let y;
    if (g) { const a = +g.dataset.a, b = +g.dataset.b, inside = O.frames.map((f, i) => [f, i]).filter(([f]) => f.y >= a && f.y <= b);
      if (inside.length) { const p = inside.find(([f]) => f.rep) || inside[0]; stop(); draw(p[1], true); return; } y = (a + b) / 2; }
    else { const r = strip.querySelector('svg').getBoundingClientRect(); y = (e.clientX - r.left) / PX + Y0; }
    let bi = 0, bd = Infinity; O.frames.forEach((f, i) => { const d = Math.abs(f.y - y); if (d < bd) { bd = d; bi = i; } }); stop(); draw(bi, true);
  });
  let timer = null; const pb = $('#ovplay');
  function stop() { if (timer) { clearInterval(timer); timer = null; pb.textContent = '▶ 播放'; pb.setAttribute('aria-pressed', 'false'); } }
  pb.addEventListener('click', () => { if (timer) return stop(); if (cur >= N - 1) draw(0); pb.textContent = '❚❚ 暂停'; pb.setAttribute('aria-pressed', 'true');
    timer = setInterval(() => { if (cur >= N - 1) return stop(); draw(cur + 1); }, 1100); });
  document.addEventListener('keydown', e => { if ($('#overview').hidden || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName) && document.activeElement !== rg) return;
    if (e.key === 'ArrowRight' && document.activeElement !== rg) { stop(); draw(Math.min(N - 1, cur + 1)); } if (e.key === 'ArrowLeft' && document.activeElement !== rg) { stop(); draw(Math.max(0, cur - 1)); } });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => draw(cur, true));
  new MutationObserver(() => draw(cur, true)).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  // 地址栏带 y（及卷末帧的 v）时停在那一帧，否则停在第一个总图年份（秦）
  const hp = new URLSearchParams(location.hash.slice(1)), hy = hp.get('y'), hv = hp.get('v');
  let i0 = O.frames.findIndex(f => f.rep);
  if (hy != null && !isNaN(+hy)) { let bd = Infinity; O.frames.forEach((f, i) => { const d = Math.abs(f.y - +hy) + (hv ? (O.books[f.k][0] === hv ? 0 : 0.5) : (f.rep ? 0 : 0.25)); if (d < bd) { bd = d; i0 = i; } }); }
  draw(Math.max(0, i0));
}
