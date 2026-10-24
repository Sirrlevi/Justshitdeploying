/* Static — the after-hours mascot. A silent SVG/CSS/JS overlay: no mic, no speech, no network.
   It reads the real player state, lip-syncs to the real audio level, and only ever stands in free space
   or on the outer edge of things (it never covers text or controls). */
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const R = (a, b) => a + Math.random() * (b - a), pick = (a) => a[(Math.random() * a.length) | 0], cl = (v, a, b) => Math.min(b, Math.max(a, v));
const PAPER = '#f4ecd9', INK = '#1d140e', BR = '#d9b47a', TAU = Math.PI * 2;
const LINES = {
  hi: ['yo. welcome in.', 'oh hey. pull up a chair.'],
  tap: ['hey. watch the fur.', 'ow. rude.', "i'm static, not a button.", 'arre, gudgudi!', 'again? okay. again.', 'careful. i bite. (i don’t.)'],
  mic: ['♪ check. one, two.', '♪ sound check. sab theek?'],
  wake: ['…huh? i’m up.', 'i was only resting my eyes.'],
  needle: ['it’s spinning. now drop the needle: tap the arm.'],
  end: ['…and scene.', 'encore? flip the switch again.'],
};
const TIPS = [['#power', 'flip this switch. the record starts spinning.'], ['#lever', 'this little lever lifts or drops the needle.'], ['#volume', 'turn the knob. that’s volume.'],
  ['#seek', 'drag this line to jump around the song.'], ['#dots', 'pick a song right here.'], ['#nextBtn', 'skip tracks with these arrows.'], ['#prevBtn', 'skip tracks with these arrows.']];
const SVG = `<svg viewBox="-20 -14 140 140" aria-hidden="true" focusable="false"><defs><radialGradient id="stg" cx=".32" cy=".22" r=".95"><stop offset="0" stop-color="#7d6a58"/><stop offset=".55" stop-color="#4b4037"/><stop offset="1" stop-color="#2b231d"/></radialGradient></defs>
<ellipse class="sh" cx="50" cy="118" rx="30" ry="5" fill="#000" opacity=".5"/><ellipse class="fl" cx="35" cy="113" rx="11" ry="6" fill="#33291f"/><ellipse class="fr" cx="65" cy="113" rx="11" ry="6" fill="#33291f"/>
<g class="bd"><path class="an" d="M34 12Q26-2 22-9" stroke="${BR}" stroke-width="3" fill="none" stroke-linecap="round"/><circle class="bu" cx="22" cy="-10" r="4.5" fill="${BR}"/>
<rect x="8" y="8" width="84" height="104" rx="40" fill="url(#stg)" stroke="${BR}" stroke-opacity=".7" stroke-width="2"/><ellipse cx="36" cy="24" rx="15" ry="6" fill="#fff" opacity=".13" transform="rotate(-24 36 24)"/>
${['el', 'er'].map((c) => `<g class="${c}"><ellipse rx="9.5" ry="12.5" fill="${BR}"/><ellipse class="pp" rx="4.2" ry="6.2" fill="#2a1d12"/><circle cx="-2.6" cy="-4" r="1.9" fill="#fff" opacity=".85"/></g>`).join('')}
<path class="mo" fill="${INK}" stroke="${BR}" stroke-width="1.4" stroke-linejoin="round"/>
<line class="al" stroke="#4b4037" stroke-width="11" stroke-linecap="round"/><circle class="hl" r="7.5" fill="#5e5045" stroke="${BR}" stroke-width="1.6"/>
<g class="mc"><rect x="-3" y="-3" width="6" height="19" rx="3" fill="#8a6f45"/><circle cy="-11" r="8" fill="${BR}" stroke="#7a5f36" stroke-width="1.2"/><path d="M-6-11H6M-5.4-8H5.4M-5.4-14H5.4" stroke="#7a5f36"/></g>
<line class="ar" stroke="#4b4037" stroke-width="11" stroke-linecap="round"/><circle class="hr" r="7.5" fill="#5e5045" stroke="${BR}" stroke-width="1.6"/></g></svg>`;
const mouthD = (o, w) => { const hw = 6 + w * 7, y = 78; return `M${50 - hw} ${y}Q50 ${y - 1 - o * 2} ${50 + hw} ${y}Q50 ${y + (2 + o * 15) * 1.35} ${50 - hw} ${y}Z`; };
const visemeOf = (c) => ('aeiy'.includes(c) ? [.85, .9] : 'ou'.includes(c) ? [.8, .1] : /[a-z]/.test(c) ? [.3, .5] : [.04, .5]);
const star = (cx, cy, rx, ry, st) => { let p = ''; for (let i = 0; i < 24; i++) { const a = (i / 24) * TAU, k = i % 2 ? 1 : 1.16; p += `${cx + Math.cos(a) * rx * k},${cy + Math.sin(a) * ry * k} `; } return `<polygon points="${p}" ${st}/>`; };

export function initMascot(S, audio) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, ac = new AbortController();
  const on = (t, e, f, o) => t.addEventListener(e, f, { signal: ac.signal, ...o });
  const btn = Object.assign(document.createElement('button'), { className: 'stm', type: 'button', innerHTML: SVG });
  btn.setAttribute('aria-label', 'Static, the little mascot. Tap to poke it.');
  const bub = Object.assign(document.createElement('div'), { className: 'mbub', hidden: true, innerHTML: '<svg></svg><div class="mtx"><b></b><i></i></div>' });
  bub.setAttribute('role', 'status');
  const ring = Object.assign(document.createElement('div'), { className: 'mring', hidden: true });
  document.body.append(ring, bub, btn);
  const q = (c) => btn.querySelector('.' + c), E = Object.fromEntries('bd sh fl fr an bu el er mo al hl ar hr mc'.split(' ').map((c) => [c, q(c)]));
  const pps = btn.querySelectorAll('.pp'), bsvg = bub.querySelector('svg'), tt = bub.querySelector('b'), gg = bub.querySelector('i');
  let size = 72, BW = 29, BH = 63, gen = 0, alive = true, playing = false, idleAt = performance.now(), T0 = 0, B = null, ht = 0, noteT = 0, told = new Set(), queue = [], lastIdx = S.rec.index, needleT = 0, tapN = 0, welcomed = false, tourT = performance.now() + 9000, mx = -1, my = -1;
  const M = { x: 0, y: 0, face: 1, pop: 0, ph: 0, mic: 0, micT: 0, o: 0, ot: 0, w: .5, wt: .5, lx: 0, ly: 0, nb: 2, bl: 0, sleep: 0, sit: 0, sp: 0, glad: 0, go: null, tgt: null, hold: 0,
    L: { a: 102, l: 22, ta: 102, tl: 22 }, Rm: { a: 78, l: 22, ta: 78, tl: 22 } };
  const REST = [[102, 22], [78, 22]], arms = (l, r) => { if (l) [M.L.ta, M.L.tl] = l; if (r) [M.Rm.ta, M.Rm.tl] = r; };
  const wait = (ms, g) => new Promise((res, rej) => setTimeout(() => (g === gen ? res() : rej('x')), ms)), interrupt = () => { gen++; };
  const measure = () => { size = btn.offsetWidth || 72; BW = size * .4; BH = size * .88; };
  const inV = (x, y) => x >= BW + 6 && x <= innerWidth - BW - 6 && y >= BH + 6 && y <= innerHeight - 6;

  /* ── what must never be covered: the deck, all text, all controls ── */
  function rects() {
    const out = [], add = (r, p = 5) => r.width > 1 && r.height > 1 && out.push({ l: r.left - p, t: r.top - p, r: r.right + p, b: r.bottom + p });
    const d = $('#deckFit'); if (d) add(d.getBoundingClientRect(), 0);
    const tx = (e) => { const g = document.createRange(); g.selectNodeContents(e); return g.getBoundingClientRect(); };
    $$('.title,.artist,.tagline,.hint.show,.seek__t,.dot span').forEach((e) => add(tx(e)));
    $$('.skip,.seek,.dot,.links a').forEach((e) => add(e.getBoundingClientRect()));
    return out;
  }
  const hit = (x, y, rs) => rs.some((k) => x - BW < k.r && x + BW > k.l && y - BH < k.b - .01 && y > k.t + .01);
  const clear = (a, b, rs) => { const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 8); for (let i = 1; i < n; i++) { const x = a.x + ((b.x - a.x) * i) / n, y = a.y + ((b.y - a.y) * i) / n; if (!inV(x, y) || hit(x, y, rs)) return false; } return true; };
  function plan(from, to, rs) {
    const C = 12, cols = Math.ceil(innerWidth / C), rows = Math.ceil(innerHeight / C), memo = new Map(), id = (x, y) => y * cols + x;
    const free = (x, y) => { const k = id(x, y); if (!memo.has(k)) memo.set(k, inV(x * C + C / 2, y * C + C / 2) && !hit(x * C + C / 2, y * C + C / 2, rs)); return memo.get(k); };
    const cell = (p) => [cl((p.x / C) | 0, 0, cols - 1), cl((p.y / C) | 0, 0, rows - 1)], s = cell(from), g = cell(to), par = new Map([[id(...s), null]]), qu = [s];
    for (let i = 0; i < qu.length && !par.has(id(...g)); i++) { const [x, y] = qu[i]; for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const nx = x + dx, ny = y + dy; if ((dx || dy) && nx >= 0 && ny >= 0 && nx < cols && ny < rows && !par.has(id(nx, ny)) && ((nx === g[0] && ny === g[1]) || free(nx, ny))) { par.set(id(nx, ny), [x, y]); qu.push([nx, ny]); } } }
    if (!par.has(id(...g))) return null;
    const pts = []; for (let c = g; c; c = par.get(id(...c))) pts.push({ x: c[0] * C + C / 2, y: c[1] * C + C / 2 });
    pts.reverse(); pts[0] = from; pts.push(to); const out = [from]; let i = 0;
    while (i < pts.length - 1) { let j = pts.length - 1; while (j > i + 1 && !clear(pts[i], pts[j], rs)) j--; out.push(pts[j]); i = j; }
    return out;
  }
  function spots(rs) {
    const out = [], add = (x, y, kind) => inV(x, y) && !hit(x, y, rs) && out.push({ x, y, kind });
    rs.forEach((r) => [.2, .5, .8].forEach((f) => add(r.l + (r.r - r.l) * f, r.t, 'edge')));
    for (let i = 0; i < 14; i++) add(R(BW + 8, innerWidth - BW - 8), R(BH + 8, innerHeight - 8), 'floor');
    const sc = $('#scene')?.getBoundingClientRect(); if (sc) add(sc.left + sc.width / 2, sc.top + sc.height * .115, 'home');   // where the old title used to be
    return out;
  }
  const goTo = (p, g) => new Promise((res, rej) => { const path = plan({ x: M.x, y: M.y }, p, rects()); if (!path) return rej('x'); M.go = { path, i: 1, res, rej, g }; });

  /* ── manga bubbles ── */
  function shape(kind, w, h, tip) {
    const m = 26, cx = m + w / 2, cy = m + h / 2, st = `fill="${PAPER}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"`; let s = '';
    if (kind === 'think') {
      const rx = w / 2 + 2, ry = h / 2 + 2, n = Math.max(8, Math.round(((rx + ry) * Math.PI) / 21)); let a = '', b = '';
      for (let i = 0; i < n; i++) { const t = (i / n) * TAU, x = cx + Math.cos(t) * rx, y = cy + Math.sin(t) * ry; a += `<circle cx="${x}" cy="${y}" r="12" ${st}/>`; b += `<circle cx="${x}" cy="${y}" r="12" fill="${PAPER}"/>`; }
      const dx = tip.x - cx, dy = tip.y - cy, d = Math.hypot(dx, dy) || 1;
      s = a + `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${PAPER}"/>` + b + [[34, 6], [20, 4.2], [8, 2.8]].map(([k, r]) => `<circle cx="${tip.x - (dx / d) * k}" cy="${tip.y - (dy / d) * k}" r="${r}" ${st}/>`).join('');
    } else {
      const dx = tip.x - cx, dy = tip.y - cy, hz = Math.abs(dx) / (w / 2 + 1) > Math.abs(dy) / (h / 2 + 1);
      const bx = hz ? cx + Math.sign(dx) * (w / 2) : cl(tip.x, m + 16, m + w - 16), by = hz ? cl(tip.y, m + 10, m + h - 10) : cy + Math.sign(dy || 1) * (h / 2), px = hz ? 0 : 9, py = hz ? 9 : 0, mx2 = (bx + tip.x) / 2, my2 = (by + tip.y) / 2;
      s = `<path d="M${bx - px} ${by - py}Q${mx2} ${my2 - 3} ${tip.x} ${tip.y}Q${mx2 + 3} ${my2} ${bx + px} ${by + py}Z" ${st}/>` + (kind === 'shout' ? star(cx, cy, w / 2 + 10, h / 2 + 8, st) : `<rect x="${m}" y="${m}" width="${w}" height="${h}" rx="${Math.min(h / 2, 22)}" ${st}/>`);
    }
    return s;
  }
  function place() {
    const { w, h, kind } = B, m = 26, rs = rects(), gap = kind === 'think' ? 46 : 14, head = { x: M.x, y: M.y - BH * .55 };
    const C = []; for (let a = 0; a < 360; a += 30) for (const e of [0, 16]) { const r = (a * Math.PI) / 180; C.push([head.x + Math.cos(r) * (w / 2 + BW + gap + e) - w / 2, head.y + Math.sin(r) * (h / 2 + BH * .62 + gap + e) - h / 2]); }
    let best, bs = 1e12; const ov = (x, y, k) => Math.max(0, Math.min(x + w, k.r) - Math.max(x, k.l)) * Math.max(0, Math.min(y + h, k.b) - Math.max(y, k.t));
    for (const [x0, y0] of C) { const x = cl(x0, 6, innerWidth - w - 6), y = cl(y0, 6, innerHeight - h - 6); let s = (Math.abs(x - x0) + Math.abs(y - y0)) * 40 + Math.max(0, y + h / 2 - head.y) * .05; rs.forEach((k) => (s += ov(x, y, k) * 4)); s += ov(x, y, { l: M.x - BW, r: M.x + BW, t: M.y - BH, b: M.y }) * 8; if (s < bs) { bs = s; best = { x, y }; } }
    Object.assign(B, { x: best.x, y: best.y, px: M.x, py: M.y });
    bsvg.setAttribute('width', w + 2 * m); bsvg.setAttribute('height', h + 2 * m); bsvg.innerHTML = shape(kind, w, h, { x: head.x - best.x + m, y: head.y - best.y + m });
    bub.style.transform = `translate(${best.x - m}px,${best.y - m}px)`;
  }
  function show(text, kind) {
    bub.hidden = false; bub.className = 'mbub ' + kind; tt.textContent = ''; gg.textContent = text;
    const b = bub.querySelector('.mtx'); B = { w: b.offsetWidth, h: b.offsetHeight, kind, text }; place();
  }
  const hide = () => { bub.hidden = true; B = null; M.hold = 0; ring.hidden = true; M.tgt = null; };
  async function say(text, kind, g, hold) {
    show(text, kind);
    for (let i = 1; i <= text.length; i++) { tt.textContent = text.slice(0, i); gg.textContent = text.slice(i); [M.ot, M.wt] = visemeOf(text[i - 1].toLowerCase()); await wait(/[.,!?…]/.test(text[i - 1]) ? 140 : 34, g); }
    M.ot = .05; await wait(hold ?? 1300 + text.length * 45, g); hide();
  }

  /* ── behaviours ── */
  const notes = () => { if (reduce) return; const e = Object.assign(document.createElement('span'), { className: 'mn', textContent: pick(['♪', '♫']) }); const r = E.hr.getBoundingClientRect(); e.style.cssText = `left:${r.left + R(-10, 14)}px;top:${r.top - 10}px;--dx:${R(-22, 22)}px;--r:${R(-25, 25)}deg`; document.body.append(e); e.onanimationend = () => e.remove(); };
  async function sing(g) {
    M.micT = 1; arms([-40, 24], [138, 30]);
    while (playing) { arms([-50 + Math.sin(performance.now() / 380) * 22, 24], null); if (Math.random() < .5) notes(); await wait(520, g); }
  }
  async function guide(el, text, g) {
    const r = el.getBoundingClientRect(), tx = r.left + r.width / 2, ty = r.top + r.height / 2, rs = rects(), c = spots(rs);
    for (const k of [r.width / 2 + 50, r.width / 2 + 90, r.width / 2 + 130]) for (let a = 0; a < 360; a += 20) { const x = tx + Math.cos((a * Math.PI) / 180) * k, y = ty + Math.sin((a * Math.PI) / 180) * k * .8 + BH * .5; if (inV(x, y) && !hit(x, y, rs)) c.push({ x, y }); }
    c.sort((a, b) => Math.hypot(a.x - tx, a.y - BH * .5 - ty) - Math.hypot(b.x - tx, b.y - BH * .5 - ty));
    if (!c[0]) return say(text, 'say', g);
    await goTo(c[0], g); M.face = tx >= M.x ? 1 : -1; M.tgt = { x: tx, y: ty };
    const u = size / 140, a = Math.atan2(ty - (M.y - 52 * u), tx - (M.x + 38 * u * M.face)), ab = ((M.face > 0 ? a : Math.PI - a) * 180) / Math.PI, d = Math.hypot(tx - M.x, ty - M.y);
    arms(null, [ab, cl(d / u - 22, 18, 60)]);
    Object.assign(ring.style, { left: r.left - 6 + 'px', top: r.top - 6 + 'px', width: r.width + 12 + 'px', height: r.height + 12 + 'px' }); ring.hidden = false;
    await say(text, 'say', g, 2200 + text.length * 30);
  }
  async function antic(g) {
    const k = pick(['look', 'look', 'yawn', 'stretch', 'hum', 'spin']);
    if (k === 'look') { M.tgt = { x: R(0, innerWidth), y: R(0, innerHeight) }; await wait(R(1200, 2400), g); M.tgt = null; }
    else if (k === 'stretch') { arms([-70, 30], [-110, 30]); await wait(1100, g); arms(...REST); }
    else if (k === 'yawn') { M.ot = 1; M.wt = .3; await wait(1300, g); M.ot = 0; }
    else if (k === 'spin' && !reduce) { M.sp = 1; await wait(900, g); }
    else { await say('♪ …', 'think', g, 900); }
    await wait(R(900, 2200), g);
  }
  async function wander(g) {
    const rs = rects(), sp = spots(rs); if (!sp.length || reduce) { await antic(g); return; }
    const home = sp.find((s) => s.kind === 'home'), t = home && Math.random() < .2 ? home : pick(sp);
    await goTo(t, g); M.sit = t.kind === 'edge' ? 1 : 0;
    for (let i = 0, n = 1 + ((R(0, 2)) | 0); i < n; i++) await antic(g);
  }
  async function run(a, g) {
    if (M.sleep || a.k === 'wake') { M.sleep = 0; await say(pick(LINES.wake), 'say', g); return; }
    if (a.k === 'move') return goTo(a, g);
    if (a.k === 'tap') {
      const n = tapN++; M.glad = 1; M.sit = 0;
      if (n % 4 === 1 && !playing && !reduce) { M.micT = 1; M.hold = 1; arms(null, [138, 30]); notes(); await say(pick(LINES.mic), 'think', g, 1400); M.hold = 0; M.micT = 0; }
      else { if (n % 3 === 0 && !reduce) M.sp = 1; arms([-60, 28], [-60, 28]); await say(pick(LINES.tap), n % 5 === 4 ? 'shout' : 'say', g); }
    } else if (a.k === 'guide') { told.add(a.key); await guide(a.el, a.text, g); tourT = performance.now(); }
    else if (a.k === 'track') { if (playing && !reduce) { arms([-70, 28], [-70, 28]); M.sp = 1; } await say(`ooh. ${a.title}.`, 'say', g, 1200); }
    else if (a.k === 'needle') { const l = $('#lever'); if (l) await guide(l, pick(LINES.needle), g); }
    else if (a.k === 'end') await say(pick(LINES.end), 'say', g);
  }
  async function decide(g) {
    const now = performance.now(); if (!playing && !M.hold) M.micT = 0; arms(...REST); M.tgt = null; M.sit = M.sit && !queue.length;
    if (queue.length) return run(queue.shift(), g);
    if (playing) return sing(g);
    if (!welcomed) { welcomed = true; arms(null, [-62, 30]); return say(pick(LINES.hi), 'say', g, 2200); }
    if (now - idleAt > 30000) { await say('…', 'think', g, 700); M.sleep = 1; show('zZz…', 'think'); return wait(6e5, g); }
    const next = TIPS.find(([s]) => !told.has(s));
    if (next && now - tourT > 16000 && now - idleAt > 4000) { told.add(next[0]); tourT = now; const el = $(next[0]); if (el) return guide(el, next[1], g); }
    return wander(g);
  }
  async function loop() { while (alive) { const g = ++gen; try { await decide(g); } catch (e) { if (e !== 'x') console.warn(e); hide(); await new Promise((r) => setTimeout(r, 150)); } } }

  /* ── frame: smooth everything, then write the SVG ── */
  function frame(now) {
    if (!alive) return; requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - T0) / 1000 || .016), t = now / 1000, k = 1 - Math.pow(.001, dt); T0 = now;
    const pl = !!(S.motor && S.arm.mode === 'down'); if (pl !== playing) { playing = pl; if (!pl) queue.push({ k: 'end' }); interrupt(); }
    if (S.rec.index !== lastIdx) { lastIdx = S.rec.index; if (S.motor && welcomed) { queue.push({ k: 'track', title: S.tracks[lastIdx]?.title || 'this one' }); interrupt(); } }
    needleT = S.motor && S.arm.mode === 'parked' ? needleT + dt : 0; if (needleT > 6 && !told.has('needle')) { told.add('needle'); queue.push({ k: 'needle' }); interrupt(); }
    if (M.go) { const go = M.go; if (go.g !== gen) { M.go = null; go.rej('x'); } else { const p = go.path[go.i], dx = p.x - M.x, dy = p.y - M.y, d = Math.hypot(dx, dy), v = (reduce ? 400 : 210) * dt;
      if (d <= Math.max(2, v)) { M.x = p.x; M.y = p.y; if (++go.i >= go.path.length) { M.go = null; go.res(); } } else { M.x += (dx / d) * v; M.y += (dy / d) * v; if (Math.abs(dx) > 1) M.face = dx > 0 ? 1 : -1; M.ph += dt * 13; M.sit = 0; } } }
    M.pop = Math.min(1, M.pop + dt * (reduce ? 20 : 2.6)); const pop = 1 + Math.sin(M.pop * Math.PI) * .12 * (M.pop < 1), sc = M.pop < 1 ? Math.min(1, M.pop * 1.6) : 1;
    let lv = 0; if (playing) { lv = audio.level ? audio.level() : 0; if (lv < .02) lv = .22 + .2 * Math.abs(Math.sin(t * 7)); M.ot = cl(lv * 1.7, .05, 1); M.wt = .45 + Math.sin(t * 9) * .3; }
    M.o += (M.ot - M.o) * (1 - Math.pow(1e-4, dt)); M.w += (M.wt - M.w) * k; M.glad = Math.max(0, M.glad - dt * .8); M.sp = Math.max(0, M.sp - dt * 1.3);
    if (!playing && !B && !M.hold && !M.go) { M.ot = Math.max(0, M.ot - dt); } M.mic += (M.micT - M.mic) * k;
    // eyes
    M.nb -= dt; if (M.nb < 0) { M.bl = 1; M.nb = R(2, 5); } M.bl = Math.max(0, M.bl - dt * 7);
    const hx = M.x, hy = M.y - BH * .55, tg = M.tgt || (mx >= 0 ? { x: mx, y: my } : null); const lx = tg ? cl((tg.x - hx) / 180, -1, 1) * M.face : 0, ly = tg ? cl((tg.y - hy) / 180, -1, 1) : 0; M.lx += (lx - M.lx) * k; M.ly += (ly - M.ly) * k;
    const es = M.sleep ? .08 : Math.max(.08, 1 - Math.sin(M.bl * Math.PI)) * (1 - M.glad * .35);
    E.el.setAttribute('transform', `translate(34 46)scale(1 ${es})`); E.er.setAttribute('transform', `translate(66 46)scale(1 ${es})`);
    pps.forEach((p) => { p.setAttribute('cx', M.lx * 3.6); p.setAttribute('cy', M.ly * 4); });
    E.mo.setAttribute('d', mouthD(M.sleep ? .1 : M.o, M.w));
    // arms + mic
    const sw = Math.sin(t * 1.7) * 2.5, A = (m, ln, hd, px, w) => { m.a += (m.ta - m.a) * k; m.l += (m.tl - m.l) * k; const a = ((m.a + sw * w) * Math.PI) / 180, x = px + Math.cos(a) * m.l, y = 68 + Math.sin(a) * m.l; ln.setAttribute('x1', px); ln.setAttribute('y1', 68); ln.setAttribute('x2', x); ln.setAttribute('y2', y); hd.setAttribute('cx', x); hd.setAttribute('cy', y); return [x, y]; };
    A(M.L, E.al, E.hl, 12, 1); const [hxr, hyr] = A(M.Rm, E.ar, E.hr, 88, -1);
    E.mc.setAttribute('transform', `translate(${hxr} ${hyr})rotate(-36)scale(${M.mic})`); E.mc.style.display = M.mic > .03 ? '' : 'none';
    E.an.setAttribute('transform', `rotate(${Math.sin(t * 3) * 5 + lv * 14} 34 12)`); E.bu.setAttribute('opacity', playing ? .35 + lv : .55 + Math.sin(t * 2) * .35);
    // body
    const walk = !!M.go, hop = walk ? Math.abs(Math.sin(M.ph)) * 5 : 0, bob = hop + (playing ? lv * 3 : Math.sin(t * 2) * .8) + (M.sit && !walk ? 4 : 0), fx = Math.cos((1 - M.sp) * TAU);
    E.bd.setAttribute('transform', `translate(50 118)scale(${M.face * (M.sp ? fx : 1) * sc * pop} ${sc * pop * (1 + (walk ? Math.sin(M.ph * 2) * .03 : Math.sin(t * 2) * .012))})translate(-50 -118)translate(0 ${-bob})`);
    const sw2 = walk ? Math.sin(M.ph) * 4 : M.sit ? Math.sin(t * 3) * 2 : 0; E.fl.setAttribute('cy', 113 + sw2 - (M.sit ? 0 : 0)); E.fr.setAttribute('cy', 113 - sw2); E.sh.setAttribute('opacity', .5 * sc);
    btn.style.transform = `translate3d(${M.x - size / 2}px,${M.y - 0.943 * size}px,0)`;
    if (B && Math.hypot(B.px - M.x, B.py - M.y) > 8) place();
  }

  /* ── wiring ── */
  const ctl = (e) => { const t = e.target.closest && TIPS.find(([s]) => e.target.closest(s)); return t && { el: e.target.closest(t[0]), text: t[1], key: t[0] }; };
  const sched = (e) => { const c = ctl(e); if (!c || told.has(c.key) || reduce) return; clearTimeout(ht); ht = setTimeout(() => { if (!told.has(c.key)) { queue.push({ k: 'guide', ...c }); interrupt(); } }, 900); };
  const activity = () => { idleAt = performance.now(); if (M.sleep) { queue.unshift({ k: 'wake' }); interrupt(); } };
  on(document, 'focusin', sched); on(document, 'pointerover', (e) => e.pointerType === 'mouse' && sched(e));
  on(document, 'pointerdown', (e) => { clearTimeout(ht); const c = ctl(e); if (c) { told.add(c.key); if (ring.hidden === false) { ring.hidden = true; } } activity(); }, { capture: true });
  on(window, 'pointermove', (e) => { if (e.pointerType === 'mouse') { mx = e.clientX; my = e.clientY; } idleAt = performance.now(); if (M.sleep) activity(); });
  on(window, 'keydown', activity); on(window, 'scroll', activity, { passive: true });
  on(btn, 'click', () => { queue.push({ k: 'tap' }); interrupt(); activity(); });
  let rt = 0; on(window, 'resize', () => { clearTimeout(rt); rt = setTimeout(() => { measure(); if (hit(M.x, M.y, rects()) || !inV(M.x, M.y)) { const s = spots(rects()); if (s.length) { const p = pick(s); M.x = p.x; M.y = p.y; interrupt(); } } }, 160); });
  const settle = setInterval(() => { if (!M.go && !M.sleep && hit(M.x, M.y, rects())) { const s = spots(rects()); if (s.length) { queue.unshift({ k: 'move', ...pick(s) }); interrupt(); } } }, 800);

  measure(); const sp = spots(rects()), home = sp.find((s) => s.kind === 'home'), s0 = (home && Math.random() < .5 ? home : pick(sp.filter((s) => s.kind !== 'home')) || home) || { x: innerWidth / 2, y: innerHeight - 12 };
  M.x = s0.x; M.y = s0.y; M.sit = s0.kind === 'edge' ? 1 : 0; btn.classList.add('on'); requestAnimationFrame(frame); setTimeout(loop, reduce ? 300 : 1100);
  if (location.search.includes('debug')) window.__static = { M, get bub() { return B; }, rects, spots, say, get playing() { return playing; }, hit, BW: () => BW, BH: () => BH };
  return () => { alive = false; interrupt(); ac.abort(); clearInterval(settle); clearTimeout(ht); btn.remove(); bub.remove(); ring.remove(); };
}
