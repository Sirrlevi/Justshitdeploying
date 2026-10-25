/* Static — the after-hours mascot. A silent SVG/CSS/JS overlay: no mic, no speech, no network.
   It reads the real player state, lip-syncs to the real audio level, and only ever stands in free space
   or on the outer edge of things (it never covers text or controls). */
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const R = (a, b) => a + Math.random() * (b - a), pick = (a) => a[(Math.random() * a.length) | 0], cl = (v, a, b) => Math.min(b, Math.max(a, v));
const PAPER = '#f4ecd9', INK = '#1d140e', BR = '#d9b47a', TAU = Math.PI * 2;
const LINES = {
  hi: ['yo. welcome in.', 'oh hey, a human!', 'namaste! chai ho gayi?', 'you made it. sit. spin something.', 'arre wah, mehmaan!', 'psst. the record is the main act.'],
  tap: ["hey! that's my forehead.", 'ow. rude.', "i'm static, not a button.", 'arre, gudgudi!', 'again? okay. again.', 'careful. i bite. (i don’t.)', 'booped. no refunds.', 'stop poking, start vibing.', 'is that all you got?', 'bro. bro. BRO.', 'tap tap tap. i know you’re there.'],
  mic: ['♪ check. one, two.', '♪ sound check. sab theek?', '♪ la la laaa~', 'mic: on. dignity: off.'],
  sing: ['♪ this is MY song now', '♪ na na na na~', '♪ feel it in the groove', '♪ dil se, dil se~', 'ooh this part slaps ♪', '♪ ek baar fir se~'],
  wake: ['…huh? i’m up.', 'i was only resting my eyes.', 'five more minutes…', 'zzz— who? what? oh, hi.'],
  end: ['…and scene.', 'encore? flip the switch again.', 'silence. my favourite song.', 'aaand that’s a wrap.'],
  angry: ['#@$%&!! that was MY spot!', 'you little $%@#!', '@#$%! ... sorry, mom.', 'grrr. %&$#@!!', 'ARGH. *!@#$%^&*', 'who did that?! #$%@!'],
  scared: ['AAAAAH!', 'put me down put me down!', 'no no no NO NO—', 'i can’t fly!!', 'mummyyyy!', 'wheeeee— no wait, AAAH!'],
  land: ['oof.', 'i meant to do that.', 'ow my everything.', 'gravity: 1, me: 0.', 'that was the plan. totally.', 'five stars. would fall again.'],
  dizzy: ['the room is spinning… oh wait, that’s me', 'tweet tweet?', 'i see birds. they’re judging me.', 'wobble wobble…'],
  prank: ['oops. my finger slipped.', 'who touched that? not me.', 'hehe. surprise!', 'just… testing the switch.', 'gotcha!', 'kidding, kidding! back on.'],
  ride: ['hop on! zoom zoom!', 'wooo, a merry-go-round!', 'running in place. cardio!', 'is this a treadmill?!'],
  touch: ['what’s that over there?', 'ooh, shiny.', 'i saw that.', 'poke! got it.'],
  chat: ['i wonder what’s in that mug…', 'that plant is judging me.', 'do headphones dream?', 'someone should dust this desk.', 'i could do this all day.', 'psst, try dragging me.', 'pro tip: fling me. i dare you.', 'i have 0 chill and 3 moods.'],
  track: ['ooh. {t}.', '{t}? good taste.', 'oh this one. {t}!', '{t} hits different.', 'new track: {t}. vibe check.'],
  hit_mug: ['the mug did not move. i did.', 'ow. mug 1, me 0.', 'is it empty? asking for a friend.'], hit_headphones: ['headphones! soft landing.', 'boing. nice cushions.', 'do not borrow my ears.'],
  hit_plant: ['the plant caught me. thanks, plant.', 'leafy. judging me quietly.'], hit_books: ['ow. hardcover.', 'reading is dangerous.'], hit_deck: ['solid wood. ow.', 'the deck says no.'],
  hit_sketchbook: ['soft landing on the sketchbook.', 'i’m in the drawing now.'], hit_oldbook: ['dusty. achoo!', 'old book. older bruise.'],
};
const bags = {};
const L = (k, t) => { const b = bags[k] || (bags[k] = { q: [], last: '' }); if (!b.q.length) { b.q = [...LINES[k]].sort(() => Math.random() - .5); if (b.q.length > 1 && b.q[b.q.length - 1] === b.last) b.q.reverse(); } b.last = b.q.pop(); return t ? b.last.replace('{t}', t) : b.last; };
const SVG = `<svg viewBox="-20 -14 140 140" aria-hidden="true" focusable="false"><defs>
<radialGradient id="sb" cx=".33" cy=".22" r=".95"><stop offset="0" stop-color="#a08a75"/><stop offset=".42" stop-color="#5a4c40"/><stop offset="1" stop-color="#1e1712"/></radialGradient>
<linearGradient id="ss" x1="0" y1=".4" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
<radialGradient id="se" cx=".38" cy=".28" r=".85"><stop offset="0" stop-color="#fff3d2"/><stop offset=".5" stop-color="${BR}"/><stop offset="1" stop-color="#8f6f3e"/></radialGradient>
<radialGradient id="sh2" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#a28d78"/><stop offset="1" stop-color="#33291f"/></radialGradient>
<filter id="sbl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.8"/></filter></defs>
<ellipse class="sh" cx="50" cy="118" rx="32" ry="5.5" fill="#000" opacity=".5" filter="url(#sbl)"/>
<ellipse class="fl" cx="35" cy="113" rx="12" ry="6.5" fill="url(#sh2)"/><ellipse class="fr" cx="65" cy="113" rx="12" ry="6.5" fill="url(#sh2)"/>
<g class="bd"><path class="an" d="M34 14Q26-2 22-9" stroke="#8a7352" stroke-width="3" fill="none" stroke-linecap="round"/><circle class="bu" cx="22" cy="-10" r="5" fill="url(#se)"/>
<path d="M50 7C83 7 99 34 99 66C99 98 80 114 50 114C20 114 1 98 1 66C1 34 17 7 50 7Z" fill="url(#sb)"/><path d="M50 7C83 7 99 34 99 66C99 98 80 114 50 114C20 114 1 98 1 66C1 34 17 7 50 7Z" fill="url(#ss)"/>
<path d="M87 30C97 48 98 74 88 94" stroke="${BR}" stroke-opacity=".6" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="34" cy="22" rx="17" ry="7" fill="#fff" opacity=".3" transform="rotate(-26 34 22)" filter="url(#sbl)"/>
<ellipse cx="22" cy="68" rx="6.5" ry="4" fill="#e59a78" opacity=".35"/><ellipse cx="78" cy="68" rx="6.5" ry="4" fill="#e59a78" opacity=".35"/>
<circle cx="50" cy="97" r="11" fill="url(#se)" stroke="#6e5530"/><circle cx="50" cy="97" r="3.4" fill="#2a1d12"/><circle cx="46" cy="92.5" r="1.8" fill="#fff" opacity=".7"/>
${['el', 'er'].map((c) => `<g class="${c}"><ellipse rx="10" ry="13" fill="url(#se)" stroke="#6e5530"/><ellipse class="pp" rx="4.8" ry="6.8" fill="#24180e"/><circle cx="-3" cy="-4.5" r="2.2" fill="#fff" opacity=".92"/><circle cx="2.6" cy="3" r="1" fill="#fff" opacity=".6"/></g>`).join('')}
<path class="mo" fill="${INK}" stroke="${BR}" stroke-width="1.4" stroke-linejoin="round"/>
<line class="al" stroke="#4e4136" stroke-width="11" stroke-linecap="round"/><line class="al2" stroke="#9a8570" stroke-width="3.6" stroke-linecap="round" opacity=".55"/><circle class="hl" r="8" fill="url(#sh2)" stroke="${BR}" stroke-width="1.5"/>
<g class="mc"><rect x="-3" y="-3" width="6" height="19" rx="3" fill="#8a6f45"/><circle cy="-11" r="8" fill="url(#se)" stroke="#7a5f36" stroke-width="1.2"/><path d="M-6-11H6M-5.4-8H5.4M-5.4-14H5.4" stroke="#7a5f36"/></g>
<line class="ar" stroke="#4e4136" stroke-width="11" stroke-linecap="round"/><line class="ar2" stroke="#9a8570" stroke-width="3.6" stroke-linecap="round" opacity=".55"/><circle class="hr" r="8" fill="url(#sh2)" stroke="${BR}" stroke-width="1.5"/></g>
<g class="bi" style="display:none"><text font-size="13" text-anchor="middle">🐤</text><text font-size="13" text-anchor="middle">🐤</text><text font-size="13" text-anchor="middle">🐤</text></g></svg>`;
const mouthD = (o, w) => { const hw = 6 + w * 7, y = 78; return `M${50 - hw} ${y}Q50 ${y - 1 - o * 2} ${50 + hw} ${y}Q50 ${y + (2 + o * 15) * 1.35} ${50 - hw} ${y}Z`; };
const visemeOf = (c) => ('aeiy'.includes(c) ? [.85, .9] : 'ou'.includes(c) ? [.8, .1] : /[a-z]/.test(c) ? [.3, .5] : [.04, .5]);
const star = (cx, cy, rx, ry, st) => { let p = ''; for (let i = 0; i < 24; i++) { const a = (i / 24) * TAU, k = i % 2 ? 1 : 1.16; p += `${cx + Math.cos(a) * rx * k},${cy + Math.sin(a) * ry * k} `; } return `<polygon points="${p}" ${st}/>`; };

export function initMascot(S, audio, api) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, ac = new AbortController();
  const on = (t, e, f, o) => t.addEventListener(e, f, { signal: ac.signal, ...o });
  const btn = Object.assign(document.createElement('button'), { className: 'stm', type: 'button', innerHTML: SVG });
  btn.setAttribute('aria-label', 'Static, the little mascot. Tap to poke it, or drag to carry it.');
  const bub = Object.assign(document.createElement('div'), { className: 'mbub', hidden: true, innerHTML: '<svg></svg><div class="mtx"><b></b><i></i></div>' });
  bub.setAttribute('role', 'status');
  const ring = Object.assign(document.createElement('div'), { className: 'mring', hidden: true });
  document.body.append(ring, bub, btn);
  const q = (c) => btn.querySelector('.' + c), E = Object.fromEntries('bd sh fl fr an bu el er mo al al2 hl ar ar2 hr mc bi'.split(' ').map((c) => [c, q(c)]));
  const pps = btn.querySelectorAll('.pp'), bsvg = bub.querySelector('svg'), tt = bub.querySelector('b'), gg = bub.querySelector('i');
  let size = 72, BW = 29, BH = 63, gen = 0, alive = true, playing = false, idleAt = performance.now(), T0 = 0, B = null, ht = 0, noteT = 0, told = new Set(), queue = [], lastIdx = S.rec.index, needleT = 0, tapN = 0, welcomed = false, tourT = performance.now() + 9000, mx = -1, my = -1;
  const M = { mode: 'walk', vx: 0, vy: 0, vr: 0, rot: 0, sq: 0, peak: 0, dizzy: 0, wide: 0, hx: 0, hy: 0, jp: null, dc: null, dance: 0, struggle: 0, sway: 0, run: 0, x: 0, y: 0, face: 1, pop: 0, ph: 0, mic: 0, micT: 0, o: 0, ot: 0, w: .5, wt: .5, lx: 0, ly: 0, nb: 2, bl: 0, sleep: 0, sit: 0, sp: 0, glad: 0, go: null, tgt: null, hold: 0,
    L: { a: 102, l: 22, ta: 102, tl: 22 }, Rm: { a: 78, l: 22, ta: 78, tl: 22 } };
  const REST = [[102, 22], [78, 22]], arms = (l, r) => { if (l) [M.L.ta, M.L.tl] = l; if (r) [M.Rm.ta, M.Rm.tl] = r; };
  const wait = (ms, g) => new Promise((res, rej) => setTimeout(() => (g === gen ? res() : rej('x')), ms)), interrupt = () => { gen++; };
  const measure = () => { size = btn.offsetWidth || 72; BW = size * .4; BH = size * .88; };
  const inV = (x, y) => x >= BW + 6 && x <= innerWidth - BW - 6 && y >= BH + 6 && y <= innerHeight - 6;

  /* ── what must never be covered: the deck, all text, all controls ── */
  function rects() {
    const out = [], add = (r, p = 5, n) => r.width > 1 && r.height > 1 && out.push({ l: r.left - p, t: r.top - p, r: r.right + p, b: r.bottom + p, n });
    const d = $('#deckFit'); if (d) add(d.getBoundingClientRect(), 0, 'deck'); props().forEach((p) => out.push(p));
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
  const goTo = (p, g, jump) => { const path = plan({ x: M.x, y: M.y }, p, rects()); if (!path) return jump ? hop(p.x, p.y, g, 700 + Math.hypot(p.x - M.x, p.y - M.y) * .8) : Promise.reject('x'); return new Promise((res, rej) => { M.go = { path, i: 1, res, rej, g }; }); };   // no walkable way (e.g. the deck spans the phone): hop over it

  /* ── manga bubbles ── */
  function shape(kind, w, h, tip) {
    const m = 26, cx = m + w / 2, cy = m + h / 2, st = `fill="${kind === 'shout' ? '#ffe3d8' : PAPER}" stroke="${kind === 'shout' ? '#8a1c14' : INK}" stroke-width="2.4" stroke-linejoin="round"`; let s = '';
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
  function bestSpot(w, h, gap) {
    const rs = rects(), head = { x: M.x, y: M.y - BH * .55 }, C = [];
    for (let a = 0; a < 360; a += 30) for (const e of [0, 16]) { const r = (a * Math.PI) / 180; C.push([head.x + Math.cos(r) * (w / 2 + BW + gap + e) - w / 2, head.y + Math.sin(r) * (h / 2 + BH * .62 + gap + e) - h / 2]); }
    const ov = (x, y, k) => Math.max(0, Math.min(x + w, k.r) - Math.max(x, k.l)) * Math.max(0, Math.min(y + h, k.b) - Math.max(y, k.t)); let best = { x: 6, y: 6 }, bs = 1e12;
    for (const [x0, y0] of C) { const x = cl(x0, 6, innerWidth - w - 6), y = cl(y0, 6, innerHeight - h - 6); let s = (Math.abs(x - x0) + Math.abs(y - y0)) * 40 + Math.max(0, y + h / 2 - head.y) * .05; rs.forEach((k) => (s += ov(x, y, k) * 4)); s += ov(x, y, { l: M.x - BW - 6, r: M.x + BW + 6, t: M.y - BH - 6, b: M.y + 4 }) * 1000; if (s < bs) { bs = s; best = { x, y }; } }
    return best;
  }
  function place() {
    const { w, h, kind } = B, m = 26, p = bestSpot(w, h, kind === 'think' ? 46 : 18); Object.assign(B, { x: p.x, y: p.y, px: M.x, py: M.y });
    const tip = { x: cl(p.x + w / 2, M.x - BW - 7, M.x + BW + 7) - p.x + m, y: cl(p.y + h / 2, M.y - BH - 7, M.y + 7) - p.y + m };   // tail stops on a margin around the bot: it never touches the face
    bsvg.setAttribute('width', w + 2 * m); bsvg.setAttribute('height', h + 2 * m); bsvg.innerHTML = shape(kind, w, h, tip); bub.style.transform = `translate(${p.x - m}px,${p.y - m}px)`;
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
  /* ── hands-on: reach, hop, tour (only when asked), pranks, disc ride, physics ── */
  let tourOn = false, tourStop = false, pr = false, prankAt = performance.now() + 35000, pokeAt = 0, born = performance.now(), drag = null, lastHit = '', chipExp = 0, chipP = { x: -9, y: -9 };
  const PROPS = [['plant', 0, 0, 165, 250], ['books', 750, 0, 941, 290], ['headphones', 0, 960, 62, 1370], ['mug', 872, 1180, 941, 1400], ['sketchbook', 0, 1470, 165, 1672], ['oldbook', 835, 1550, 941, 1672]];
  const props = () => { const sc = $('#scene')?.getBoundingClientRect(); if (!sc) return []; const u = sc.width / 941; return PROPS.map(([n, l, t, r, b]) => ({ n, l: sc.left + l * u, t: sc.top + t * u, r: sc.left + r * u, b: sc.top + b * u })); };
  const nearTo = (tx, ty, w = 0) => { const rs = rects(), c = spots(rs); for (const k of [w / 2 + 50, w / 2 + 90, w / 2 + 130]) for (let a = 0; a < 360; a += 20) { const x = tx + Math.cos((a * Math.PI) / 180) * k, y = ty + Math.sin((a * Math.PI) / 180) * k * .8 + BH * .5; if (inV(x, y) && !hit(x, y, rs)) c.push({ x, y }); } c.sort((a, b) => Math.hypot(a.x - tx, a.y - BH * .5 - ty) - Math.hypot(b.x - tx, b.y - BH * .5 - ty)); return c[0]; };
  const nearSpot = (el) => { const r = el.getBoundingClientRect(), tx = r.left + r.width / 2, ty = r.top + r.height / 2; return { r, tx, ty, s: nearTo(tx, ty, r.width) }; };
  const reach = (tx, ty, max = 60) => { const u = size / 140, a = Math.atan2(ty - (M.y - 52 * u), tx - (M.x + 38 * u * M.face)), d = Math.hypot(tx - M.x, ty - M.y); arms(null, [((M.face > 0 ? a : Math.PI - a) * 180) / Math.PI, cl(d / u - 22, 18, max)]); };
  const ringOn = (r) => { Object.assign(ring.style, { left: r.left - 6 + 'px', top: r.top - 6 + 'px', width: r.width + 12 + 'px', height: r.height + 12 + 'px' }); ring.hidden = false; };
  const hop = (x, y, g, ms = 650) => new Promise((res, rej) => { M.mode = 'jump'; M.jp = { x0: M.x, y0: M.y, x1: x, y1: y, t: 0, ms: reduce ? 60 : ms, res, rej, g, h: Math.min(150, 58 + Math.hypot(x - M.x, y - M.y) * .14) }; });
  const until = async (f, g) => { while (!f()) await wait(120, g); };
  const chip = Object.assign(document.createElement('div'), { className: 'mchip', hidden: true }); document.body.append(chip);
  const hideChip = () => { chip.hidden = true; chipExp = 0; };
  const placeChip = () => { if (chip.hidden) return; const p = bestSpot(chip.offsetWidth, chip.offsetHeight, 10); chipP = { x: M.x, y: M.y }; chip.style.transform = `translate(${p.x}px,${p.y}px)`; };
  const setChip = (text, btns, ms = 0) => { chip.hidden = false; chip.textContent = ''; const s = document.createElement('span'); s.textContent = text; chip.append(s); btns.forEach(([t, f]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.onclick = (e) => { e.stopPropagation(); f(); }; chip.append(b); }); chipExp = ms ? performance.now() + ms : 0; placeChip(); };
  const offer = () => setChip('new here? want a quick tour?', [['yes!', () => { hideChip(); queue.push({ k: 'tour' }); interrupt(); }], ['later', () => { hideChip(); queue.push({ k: 'later' }); interrupt(); }]], 16000);
  const STEPS = [
    ['#power', 'this is the power switch. flip it and the record starts spinning!', async (g) => { api.setMotor(true); await wait(900, g); }],
    ['#lever', 'now the needle. this little lever drops it onto the record. watch!', async (g) => { api.autoCue(); await wait(1700, g); }],
    ['#volume', 'turn this knob for volume. like so…', async (g) => { const v = S.volume; for (const x of [.2, .5, 1, v]) { api.setVolume(x); M.Rm.ta = -90 + x * 80; await wait(450, g); } }],
    ['#seek', 'drag this line to jump around the song.', async (g) => { api.cueTo(S.rec.index, (S.span[S.rec.index] || 60) * .55); await wait(1500, g); }],
    ['#dots', 'and pick another song right here. i like the second one.', async (g) => { api.skipTo((S.rec.index + 1) % S.tracks.length); await wait(1500, g); }],
  ];
  async function tour(g) {
    tourOn = true; tourStop = false; setChip('tour on', [['stop', () => { tourStop = true; interrupt(); }]]);
    try {
      M.face = 1; arms(null, [-62, 30]); await say('okay! follow me. i’ll show you everything.', 'say', g, 1000);
      for (const [sel, text, act] of STEPS) {
        const el = $(sel); if (!el) continue; const n = nearSpot(el); if (!n.s) continue;
        await goTo(n.s, g, true); M.face = n.tx >= M.x ? 1 : -1; ringOn(n.r); reach(n.tx, n.ty); await say(text, 'say', g, 700);
        await hop(n.tx, n.ty + BH * .35, g, 600); M.sway = 1; arms([-95, 30], [-95, 30]); await act(g); await wait(500, g); M.sway = 0;
        await hop(n.s.x, n.s.y, g, 600); ring.hidden = true; arms(...REST);
      }
      M.dance = 1; await say('that’s the whole tour! now go play. i’ll be around.', 'say', g, 2200);
    } finally { tourOn = false; M.sway = 0; M.dance = 0; ring.hidden = true; hideChip(); }
  }
  async function prank(g) {
    const kind = pick(['stop', 'lift', 'vol', 'trim']), el = $({ stop: '#power', lift: '#lever', vol: '#volume', trim: '#trim' }[kind]); if (!el) return;
    const n = nearSpot(el); if (!n.s) return; pr = true; const v0 = S.volume, t0 = S.trim, was = playing;
    try {
      await goTo(n.s, g, true); M.face = n.tx >= M.x ? 1 : -1; reach(n.tx, n.ty); await wait(450, g);
      if (kind === 'stop') { api.setMotor(false); await say(L('prank'), 'say', g, 1000); api.autoCue(); }
      else if (kind === 'lift') { api.park(); await say(L('prank'), 'say', g, 1000); await wait(900, g); api.autoCue(); }
      else if (kind === 'vol') { api.setVolume(.08); await say('shhh…', 'think', g, 900); api.setVolume(1); await say('LOUDER!!', 'shout', g, 1000); }
      else { api.setTrim(6); await say('speeeeed!', 'shout', g, 1400); api.setTrim(-6); await say('…or slow…', 'think', g, 1400); }
    } finally { if (kind === 'vol') api.setVolume(v0); if (kind === 'trim') api.setTrim(t0); if (was && (kind === 'stop' || kind === 'lift') && !S.motor || was && kind === 'lift') api.autoCue(); pr = false; }   // pranks never leave the music broken, even if interrupted
  }
  async function ride(g) {
    const rc = $('#record').getBoundingClientRect(), cx = rc.left + rc.width / 2, cy = rc.top + rc.height / 2, R0 = rc.width * .44, th = R(0, TAU), r = R(.35, .7) * R0, s = nearTo(cx, cy, rc.width + 40); if (!s) return;
    await goTo(s, g, true); M.face = cx >= M.x ? 1 : -1; await say(L('ride'), 'say', g, 700);
    await hop(cx + Math.cos(th) * r, cy + Math.sin(th) * r + BH * .5, g, 650); M.dc = { cx, cy, R: R0, th, r, t: 0, slip: 0 }; M.mode = 'disc'; await until(() => M.mode !== 'disc', g);
  }
  function physics(dt) {
    const rs = rects(), py = M.y; M.vy += 1900 * dt; M.x += M.vx * dt; M.y += M.vy * dt; M.rot += M.vr * dt; M.vr *= Math.pow(.25, dt); let land = 0;
    if (M.x < BW) { M.x = BW; M.vx = Math.abs(M.vx) * .5; } if (M.x > innerWidth - BW) { M.x = innerWidth - BW; M.vx = -Math.abs(M.vx) * .5; }
    for (const k of rs) {
      const l = M.x - BW, r = M.x + BW, t = M.y - BH, b = M.y; if (l >= k.r || r <= k.l || t >= k.b || b <= k.t) continue;
      const w = Math.min(r - k.l, k.r - l), top = b - k.t, bot = k.b - t;
      if (py <= k.t + 2 && M.vy > 0 && top <= w + 10) { land = Math.max(land, M.vy); M.y = k.t; M.vy *= -.3; M.vx *= .75; }
      else if (w <= bot) { const left = M.x < (k.l + k.r) / 2; M.x += left ? -(r - k.l) : k.r - l; M.vx = (left ? -1 : 1) * (Math.abs(M.vx) * .45 + 60); M.vr = (left ? -1 : 1) * 260; }
      else { M.y = k.b + BH; M.vy = Math.abs(M.vy) * .3; }
      if (k.n) lastHit = k.n;
    }
    if (M.y > innerHeight - 8) { M.y = innerHeight - 8; land = Math.max(land, M.vy); M.vy *= -.3; M.vx *= .75; }
    if (land) { M.peak = Math.max(M.peak, land); M.sq = Math.min(1, land / 1400); if (Math.abs(M.vy) < 150) { M.mode = 'walk'; M.vx = M.vy = M.vr = 0; queue.push({ k: 'land', v: M.peak, n: lastHit }); M.peak = 0; lastHit = ''; interrupt(); } }
  }
  function disc(dt) {
    const D = M.dc, w = S.omega || 0, aw = Math.abs(w), slow = aw < 1.4; D.t += dt; M.run = slow && aw > .2 ? 1 : 0; M.struggle = slow ? 0 : 1;
    D.th += (M.run ? 0 : w) * dt;                                  // slow: it runs against the spin and stays put (treadmill); fast: it gets carried round
    D.slip = slow ? Math.max(0, D.slip - dt) : D.slip + dt * (aw - 1.2) * .9; if (!slow) D.r = Math.min(D.R, D.r + dt * 28 * aw);
    M.x = D.cx + Math.cos(D.th) * D.r; M.y = D.cy + Math.sin(D.th) * D.r + BH * .5; M.face = w >= 0 ? -1 : 1;
    if (D.slip > 1.1 || D.r >= D.R - 2 || (slow && D.t > 6.5)) { const v = w * D.r * .85; M.vx = -Math.sin(D.th) * v + Math.cos(D.th) * 140; M.vy = Math.cos(D.th) * v + Math.sin(D.th) * 140 - 300; M.vr = 380 * (Math.sign(w) || 1); M.mode = 'fall'; M.peak = 1500; M.dizzy = 3; M.dc = null; }
  }
  function modeStep(dt, t, k) {
    const md = M.mode; M.wide += ((md === 'held' || md === 'fall' || M.struggle ? 1 : 0) - M.wide) * k; M.sq = Math.max(0, M.sq - dt * 3.2); M.dizzy = Math.max(0, M.dizzy - dt); if (md !== 'disc') { M.struggle = 0; M.run = 0; }
    if (md === 'walk' || md === 'jump') M.rot += ((M.sway ? Math.sin(t * 5) * 10 : M.dizzy ? Math.sin(t * 7) * 9 : 0) - M.rot) * k * 2;
    if (md === 'held') { M.x += (M.hx - M.x) * Math.min(1, dt * 18); M.y += (M.hy + BH * .95 - M.y) * Math.min(1, dt * 18); M.rot = cl((M.hx - M.x) * .9, -28, 28) + Math.sin(t * 9) * 7; M.ot = .9; M.wt = .5; arms([-150 + Math.sin(t * 17) * 40, 26], [-30 - Math.sin(t * 15) * 40, 26]); }
    else if (md === 'fall') physics(dt); else if (md === 'disc') { disc(dt); if (M.struggle) arms([-120 + Math.sin(t * 20) * 50, 26], [-60 - Math.sin(t * 20) * 50, 26]); }
    else if (M.jp) { const j = M.jp; if (j.g !== gen) { M.jp = null; M.mode = 'fall'; M.vx = M.vy = 0; j.rej('x'); } else { j.t += (dt * 1000) / j.ms; const u = Math.min(1, j.t); M.x = j.x0 + (j.x1 - j.x0) * u; M.y = j.y0 + (j.y1 - j.y0) * u - Math.sin(u * Math.PI) * j.h; M.face = j.x1 >= j.x0 ? 1 : -1; if (u >= 1) { M.jp = null; M.mode = 'walk'; j.res(); } } }
    else if (M.dance) arms([-60 + Math.sin(t * 9) * 50, 26], [-60 - Math.sin(t * 9) * 50, 26]);
    E.bi.style.display = M.dizzy ? '' : 'none'; if (M.dizzy) E.bi.querySelectorAll('text').forEach((e, i) => { const a = t * 5 + i * 2.09; e.setAttribute('x', 50 + Math.cos(a) * 24); e.setAttribute('y', 2 + Math.sin(a) * 7); });
    if (!chip.hidden) { if (chipExp && performance.now() > chipExp) hideChip(); else if (Math.hypot(chipP.x - M.x, chipP.y - M.y) > 8) placeChip(); }
  }
  async function antic(g) {
    const k = pick(reduce ? ['look', 'chat', 'yawn', 'stretch', 'hum'] : ['look', 'chat', 'chat', 'yawn', 'stretch', 'hum', 'spin', 'dance', 'dance', 'rage']);
    if (k === 'look') { M.tgt = { x: R(0, innerWidth), y: R(0, innerHeight) }; await wait(R(1200, 2400), g); M.tgt = null; }
    else if (k === 'stretch') { arms([-70, 30], [-110, 30]); await wait(1100, g); arms(...REST); }
    else if (k === 'yawn') { M.ot = 1; M.wt = .3; await wait(1300, g); M.ot = 0; }
    else if (k === 'spin' && !reduce) { M.sp = 1; await wait(900, g); }
    else if (k === 'chat') await say(L('chat'), 'say', g);
    else if (k === 'dance') { M.dance = 1; await wait(3200, g); M.dance = 0; }
    else if (k === 'rage') { btn.classList.add('mad'); await say(L('angry'), 'shout', g, 900); btn.classList.remove('mad'); }
    else await say(L('sing'), 'think', g, 900);
    await wait(R(900, 2200), g);
  }
  async function wander(g) {
    const rs = rects(), sp = spots(rs); if (!sp.length || reduce) { await antic(g); return; }
    const home = sp.find((s) => s.kind === 'home'), t = home && Math.random() < .2 ? home : pick(sp);
    await goTo(t, g); M.sit = t.kind === 'edge' ? 1 : 0;
    for (let i = 0, n = 1 + ((R(0, 2)) | 0); i < n; i++) await antic(g);
  }
  async function run(a, g) {
    if (M.sleep || a.k === 'wake') { M.sleep = 0; await say(L('wake'), 'say', g); return; }
    if (a.k === 'move') return goTo(a, g, true);
    if (a.k === 'tour') return tour(g);
    if (a.k === 'ride') return ride(g);
    if (a.k === 'prank') return prank(g);
    if (a.k === 'later') return say('okay. i’m right here. tap me anytime.', 'say', g, 1400);
    if (a.k === 'tap') {
      const n = tapN++; M.glad = 1; M.sit = 0; if (n % 5 === 4) offer();
      if (n % 4 === 1 && !playing && !reduce) { M.micT = 1; M.hold = 1; arms(null, [138, 30]); notes(); await say(L('mic'), 'think', g, 1400); M.hold = 0; M.micT = 0; }
      else { if (n % 3 === 0 && !reduce) M.sp = 1; arms([-60, 28], [-60, 28]); await say(L('tap'), n % 5 === 3 ? 'shout' : 'say', g); }
    } else if (a.k === 'track') { if (playing && !reduce) { arms([-70, 28], [-70, 28]); M.sp = 1; } await say(L('track', a.title), 'say', g, 1200); }
    else if (a.k === 'end') await say(L('end'), 'say', g);
    else if (a.k === 'land') { arms([-50, 26], [-50, 26]); if (a.v > 1000) { M.dizzy = 3; await say(L('dizzy'), 'think', g, 2200); } else await say(a.n && LINES['hit_' + a.n] ? L('hit_' + a.n) : L('land'), 'say', g, 1200); }
    else if (a.k === 'poke') { const s = nearTo(a.x, a.y, 0); if (s) { await goTo(s, g, true); M.face = a.x >= M.x ? 1 : -1; reach(a.x, a.y, 50); M.tgt = { x: a.x, y: a.y }; await say(L('touch'), 'say', g, 1000); } }
  }
  async function decide(g) {
    while (M.mode !== 'walk') await wait(140, g);
    const now = performance.now(); if (!playing && !M.hold) M.micT = 0; arms(...REST); M.tgt = null; M.dance = 0; M.sway = 0;
    if (queue.length) return run(queue.shift(), g);
    if (!welcomed) { welcomed = true; arms(null, [-62, 30]); await say(L('hi'), 'say', g, 1800); return offer(); }
    if (chipExp && !chip.hidden) { await wait(500, g); return; }
    if (!reduce && now > prankAt && now - idleAt > 3500 && now - born > 30000) { prankAt = now + R(55000, 95000); return playing ? prank(g) : ride(g); }
    if (playing) return sing(g);
    if (now - idleAt > 40000) { await say('…', 'think', g, 700); M.sleep = 1; show('zZz…', 'think'); return wait(6e5, g); }
    return wander(g);
  }
  async function loop() { while (alive) { const g = ++gen; try { await decide(g); } catch (e) { if (e !== 'x') console.warn(e); hide(); btn.classList.remove('mad'); M.dance = 0; M.sway = 0; await new Promise((r) => setTimeout(r, 80)); } } }

  /* ── frame: smooth everything, then write the SVG ── */
  function frame(now) {
    if (!alive) return; requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - T0) / 1000 || .016), t = now / 1000, k = 1 - Math.pow(.001, dt); T0 = now;
    const pl = !!(S.motor && S.arm.mode === 'down'); if (pl !== playing) { playing = pl; if (!tourOn && !pr && M.mode === 'walk') { if (!pl) queue.push({ k: 'end' }); interrupt(); } }
    if (S.rec.index !== lastIdx) { lastIdx = S.rec.index; if (S.motor && welcomed && !tourOn && !pr) { queue.push({ k: 'track', title: S.tracks[lastIdx]?.title || 'this one' }); interrupt(); } }
    modeStep(dt, t, k);
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
    const ew = 1 + M.wide * .25; E.el.setAttribute('transform', `translate(34 46)scale(${ew} ${es * ew})`); E.er.setAttribute('transform', `translate(66 46)scale(${ew} ${es * ew})`);
    pps.forEach((p) => { p.setAttribute('cx', M.lx * 3.6); p.setAttribute('cy', M.ly * 4); });
    E.mo.setAttribute('d', mouthD(M.sleep ? .1 : M.o, M.w));
    // arms + mic
    const sw = Math.sin(t * 1.7) * 2.5, A = (m, ln, hd, px, w, l2) => { m.a += (m.ta - m.a) * k; m.l += (m.tl - m.l) * k; const a = ((m.a + sw * w) * Math.PI) / 180, x = px + Math.cos(a) * m.l, y = 68 + Math.sin(a) * m.l; ln.setAttribute('x1', px); ln.setAttribute('y1', 68); ln.setAttribute('x2', x); ln.setAttribute('y2', y); l2.setAttribute('x1', px - 2); l2.setAttribute('y1', 66); l2.setAttribute('x2', x - 2); l2.setAttribute('y2', y - 2); hd.setAttribute('cx', x); hd.setAttribute('cy', y); return [x, y]; };
    A(M.L, E.al, E.hl, 12, 1, E.al2); const [hxr, hyr] = A(M.Rm, E.ar, E.hr, 88, -1, E.ar2);
    E.mc.setAttribute('transform', `translate(${hxr} ${hyr})rotate(-36)scale(${M.mic})`); E.mc.style.display = M.mic > .03 ? '' : 'none';
    E.an.setAttribute('transform', `rotate(${Math.sin(t * 3) * 5 + lv * 14} 34 12)`); E.bu.setAttribute('opacity', playing ? .35 + lv : .55 + Math.sin(t * 2) * .35);
    // body
    const walk = !!M.go, hop = walk ? Math.abs(Math.sin(M.ph)) * 5 : M.dance || M.run ? Math.abs(Math.sin(t * 9)) * 9 : 0, bob = hop + (playing ? lv * 3 : Math.sin(t * 2) * .8) + (M.sit && !walk ? 4 : 0), fx = Math.cos((1 - M.sp) * TAU);
    E.bd.setAttribute('transform', `rotate(${M.rot} 50 84)translate(50 118)scale(${M.face * (M.sp ? fx : 1) * sc * pop} ${sc * pop * (1 + (walk ? Math.sin(M.ph * 2) * .03 : Math.sin(t * 2) * .012))})translate(-50 -118)translate(0 ${-bob})`);
    const sw2 = walk ? Math.sin(M.ph) * 4 : M.mode === 'held' || M.struggle || M.run ? Math.sin(t * 24) * 7 : M.sit ? Math.sin(t * 3) * 2 : 0; E.fl.setAttribute('cy', 113 + sw2 - (M.sit ? 0 : 0)); E.fr.setAttribute('cy', 113 - sw2); E.sh.setAttribute('opacity', .5 * sc);
    btn.style.transform = `translate3d(${M.x - size / 2}px,${M.y - 0.943 * size}px,0)scale(${1 + M.sq * .18},${1 - M.sq * .28})`;
    if (B && Math.hypot(B.px - M.x, B.py - M.y) > 8) place();
  }

  /* ── wiring ── */
  const activity = () => { idleAt = performance.now(); if (M.sleep) { queue.unshift({ k: 'wake' }); interrupt(); } };
  const grab = () => { interrupt(); M.go = null; M.jp = null; M.dc = null; M.mode = 'held'; M.micT = 0; M.peak = 0; btn.classList.add('held'); setTimeout(() => { if (M.mode === 'held') { show(L('scared'), 'shout'); tt.textContent = B.text; gg.textContent = ''; } }, 90); };
  on(btn, 'pointerdown', (e) => { e.preventDefault(); btn.setPointerCapture(e.pointerId); drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, hist: [] }; activity(); });
  on(btn, 'pointermove', (e) => { if (!drag || e.pointerId !== drag.id) return; if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) { drag.moved = true; grab(); } if (drag.moved) { const t = performance.now(); drag.hist.push([t, e.clientX, e.clientY]); drag.hist = drag.hist.filter((h) => t - h[0] < 90); M.hx = e.clientX; M.hy = e.clientY; } });
  const drop = (e, cancel) => {
    if (!drag || e.pointerId !== drag.id) return; const d = drag; drag = null; btn.classList.remove('held');
    if (!d.moved) { if (!cancel && !tourOn) { queue.push({ k: 'tap' }); interrupt(); } return; }
    const h = d.hist; let vx = 0, vy = 0; if (h.length > 1) { const a = h[0], b = h[h.length - 1], dt = (b[0] - a[0]) / 1000 || 1; vx = (b[1] - a[1]) / dt; vy = (b[2] - a[2]) / dt; }
    const rc = $('#record')?.getBoundingClientRect(), cx = rc ? rc.left + rc.width / 2 : -1e4, cy = rc ? rc.top + rc.height / 2 : -1e4, onDisc = rc && Math.hypot(M.x - cx, M.y - BH * .5 - cy) < rc.width * .44;
    hide(); if (onDisc) { M.dc = { cx, cy, R: rc.width * .44, th: Math.atan2(M.y - BH * .5 - cy, M.x - cx), r: Math.hypot(M.x - cx, M.y - BH * .5 - cy), t: 0, slip: 0 }; M.mode = 'disc'; queue.push({ k: 'chat' }); }
    else { M.vx = cl(vx, -1600, 1600); M.vy = cl(vy, -1600, 1600); M.vr = M.vx * .3; M.peak = 0; M.mode = 'fall'; }
  };
  on(btn, 'pointerup', (e) => drop(e, false)); on(btn, 'pointercancel', (e) => drop(e, true));
  on(btn, 'click', (e) => { if (e.detail === 0 && !tourOn) { queue.push({ k: 'tap' }); interrupt(); } });
  on(document, 'pointerdown', (e) => { activity(); if (e.target.closest && e.target.closest('.stm,.mchip,button,[role],a,#deckFit') || tourOn || reduce || performance.now() < pokeAt || Math.random() > .3) return; pokeAt = performance.now() + 14000; queue.push({ k: 'poke', x: e.clientX, y: e.clientY }); interrupt(); }, { capture: true });
  on(window, 'pointermove', (e) => { if (e.pointerType === 'mouse') { mx = e.clientX; my = e.clientY; } idleAt = performance.now(); if (M.sleep) activity(); });
  on(window, 'keydown', activity); on(window, 'scroll', activity, { passive: true });
  let rt = 0; on(window, 'resize', () => { clearTimeout(rt); rt = setTimeout(() => { measure(); if (M.mode === 'walk' && (hit(M.x, M.y, rects()) || !inV(M.x, M.y))) { const s = spots(rects()); if (s.length) { const p = pick(s); M.x = p.x; M.y = p.y; interrupt(); } } }, 160); });
  const settle = setInterval(() => { if (!M.go && !M.sleep && M.mode === 'walk' && !tourOn && hit(M.x, M.y, rects())) { const s = spots(rects()); if (s.length) { queue.unshift({ k: 'move', ...pick(s) }); interrupt(); } } }, 800);

  measure(); const sp = spots(rects()), home = sp.find((s) => s.kind === 'home'), s0 = (home && Math.random() < .5 ? home : pick(sp.filter((s) => s.kind !== 'home')) || home) || { x: innerWidth / 2, y: innerHeight - 12 };
  M.x = s0.x; M.y = s0.y; M.sit = s0.kind === 'edge' ? 1 : 0; btn.classList.add('on'); requestAnimationFrame(frame); setTimeout(loop, reduce ? 300 : 1100);
  if (location.search.includes('debug')) window.__static = { M, queue, interrupt, chip, get tourOn() { return tourOn; }, get bub() { return B; }, rects, spots, say, get playing() { return playing; }, hit, BW: () => BW, BH: () => BH };
  return () => { alive = false; interrupt(); ac.abort(); clearInterval(settle); clearTimeout(ht); btn.remove(); bub.remove(); ring.remove(); };
}
