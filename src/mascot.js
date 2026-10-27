/* Static — the after-hours mascot. A silent SVG/CSS/JS overlay: no mic, no speech, no network.
   It reads the real player state, lip-syncs to the real audio level, and only ever stands in free space
   or on the outer edge of things (it never covers text or controls). */
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const R = (a, b) => a + Math.random() * (b - a), pick = (a) => a[(Math.random() * a.length) | 0], cl = (v, a, b) => Math.min(b, Math.max(a, v));
const PAPER = '#f4ecd9', INK = '#1d140e', BR = '#d9b47a', TAU = Math.PI * 2;
const PAL = { shout: ['#ffe3d8', '#8a1c14'], angry: ['#ffe3d8', '#8a1c14'], sly: ['#f1eab9', '#4f4210'], sleepy: ['#dde6ec', '#27394a'] };   // bubble colours per mood
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
  curious: ['ooh. what’s that shiny thing?', 'is that a giant cookie?', 'huh. a very flat wheel.', 'a record! i can’t resist.'],
  spin: ['spin spin spin…', 'weeeee. look, it spins!', 'i’m a DJ now.', 'so many tiny grooves…'],
  toss: ['ta-da!', 'pizza style!', 'nailed it. (almost)'],
  back: ['perfect fit!', 'back where you belong.', 'good as new. better.'],
  prod: ['it’s heavier than it looks.', 'typo? no. perfect.', 'boop. the words wobble.', 'these letters are ticklish.'],
  proud: ['tour complete. i’m kind of a big deal.', 'five stars. i’d rate myself five stars.', 'you’re welcome. now go play.'],
  effort: ['nngh…', 'hnnnngh!', 'c’mon c’mon c’mon…', 'it’s stuck… no wait, it’s not.', 'heavy! who made this?', 'just. a. little. more…', 'push! push! push!'],
  purr: ['mmm… right there.', 'ahhh. okay that’s nice.', 'purr purr (i’m not a cat).', 'more. more. don’t stop.', 'you’re hired. forever. 💛', 'my favourite human 💛'],
  hurt: ['OW!', 'ouch! that hurt!', 'hey!! not so hard!', 'my head!!', 'bonk. rude.'],
  rage: ['#@$%&!! WHO DID THAT?!', 'I’LL BREAK THIS WHOLE %$#@ DECK!', 'ARGH!! *!@#$%^&*', 'you %@#$! you stupid &*$#!', 'GRRRR. @#$%!!', 'I. AM. NOT. A. DRUM!! $#@%'],
  calm: ['…okay. i’m calm. i’m calm.', 'sorry. i lost it. that was a lot.', 'deep breath. in… out… phew.', 'we don’t speak of that. 🙈'],
  annoyed: ['OI! i was VIBING, you %$#@!', 'who stopped it?! @#$%!!', 'rude. RUDE. $%@#!!', 'my song! my stage! you #$%@!'],
  smug: ['told you. my song, my rules.', 'back on. don’t touch it again.', 'try me. i dare you. 😤', 'there. fixed. you’re welcome.'],
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
<filter id="sbl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.8"/></filter>
<clipPath id="ecl"><ellipse rx="10.5" ry="13.5"/></clipPath><clipPath id="mcl"><path class="mo2"/></clipPath></defs>
<ellipse class="sh" cx="50" cy="118" rx="32" ry="5.5" fill="#000" opacity=".5" filter="url(#sbl)"/>
<ellipse class="fl" cx="35" cy="113" rx="12" ry="6.5" fill="url(#sh2)"/><ellipse class="fr" cx="65" cy="113" rx="12" ry="6.5" fill="url(#sh2)"/>
<g class="bd"><path class="an" d="M34 14Q26-2 22-9" stroke="#8a7352" stroke-width="3" fill="none" stroke-linecap="round"/><circle class="bu" cx="22" cy="-10" r="5" fill="url(#se)"/>
<path d="M50 7C83 7 99 34 99 66C99 98 80 114 50 114C20 114 1 98 1 66C1 34 17 7 50 7Z" fill="url(#sb)"/><path d="M50 7C83 7 99 34 99 66C99 98 80 114 50 114C20 114 1 98 1 66C1 34 17 7 50 7Z" fill="url(#ss)"/>
<path d="M87 30C97 48 98 74 88 94" stroke="${BR}" stroke-opacity=".6" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="34" cy="22" rx="17" ry="7" fill="#fff" opacity=".3" transform="rotate(-26 34 22)" filter="url(#sbl)"/>
<ellipse cx="22" cy="68" rx="6.5" ry="4" fill="#e59a78" style="opacity:var(--bl,.35)"/><ellipse cx="78" cy="68" rx="6.5" ry="4" fill="#e59a78" style="opacity:var(--bl,.35)"/>
<circle cx="50" cy="97" r="11" fill="url(#se)" stroke="#6e5530"/><circle cx="50" cy="97" r="3.4" fill="#2a1d12"/><circle cx="46" cy="92.5" r="1.8" fill="#fff" opacity=".7"/>
${['el', 'er'].map((c) => `<g class="${c}"><ellipse rx="10.5" ry="13.5" fill="url(#se)" stroke="#6e5530"/><ellipse class="pp" rx="4.9" ry="7" fill="#24180e"/><circle cx="-3.2" cy="-4.8" r="2.4" fill="#fff" opacity=".92"/><circle cx="2.8" cy="3.2" r="1.1" fill="#fff" opacity=".6"/><g clip-path="url(#ecl)"><rect class="lid" x="-16" y="-18" width="32" height="3" fill="#5f5043"/><ellipse class="lo" cx="0" cy="15" rx="15" ry="0" fill="#5f5043"/></g></g>`).join('')}
<g class="brs" opacity="0"><line class="bl" x1="25" y1="29" x2="43" y2="29" stroke="#2b2018" stroke-width="3.4" stroke-linecap="round"/><line class="br" x1="57" y1="29" x2="75" y2="29" stroke="#2b2018" stroke-width="3.4" stroke-linecap="round"/></g>
<path class="mo" fill="${INK}" stroke="${BR}" stroke-width="1.4" stroke-linejoin="round"/><ellipse class="tg" cx="50" cy="86" rx="7" ry="4" fill="#e8838f" clip-path="url(#mcl)" opacity="0"/>
<g class="mn" opacity="0"><path d="M17 22L7-4L35 12Z" fill="#eadcb4" stroke="#5a4730" stroke-width="1.5"/><path d="M83 22L93-4L65 12Z" fill="#eadcb4" stroke="#5a4730" stroke-width="1.5"/><path d="M20 30L45 41M80 30L55 41" stroke="#1d140e" stroke-width="6" stroke-linecap="round"/><path d="M39 79h5l-2.5 9zM56 79h5l-2.5 9z" fill="#fff"/></g>
<line class="al" stroke="#4e4136" stroke-width="11" stroke-linecap="round"/><line class="al2" stroke="#9a8570" stroke-width="3.6" stroke-linecap="round" opacity=".55"/><circle class="hl" r="8" fill="url(#sh2)" stroke="${BR}" stroke-width="1.5"/>
<g class="mc"><rect x="-3" y="-3" width="6" height="19" rx="3" fill="#8a6f45"/><circle cy="-11" r="8" fill="url(#se)" stroke="#7a5f36" stroke-width="1.2"/><path d="M-6-11H6M-5.4-8H5.4M-5.4-14H5.4" stroke="#7a5f36"/></g>
<line class="ar" stroke="#4e4136" stroke-width="11" stroke-linecap="round"/><line class="ar2" stroke="#9a8570" stroke-width="3.6" stroke-linecap="round" opacity=".55"/><circle class="hr" r="8" fill="url(#sh2)" stroke="${BR}" stroke-width="1.5"/>
<g class="fg" style="display:none"><rect x="-2.8" y="-19" width="5.6" height="17" rx="2.8" fill="url(#sh2)" stroke="${BR}" stroke-width="1.1"/><circle cx="-6.5" cy="-3" r="3.8" fill="url(#sh2)" stroke="${BR}" stroke-width="1"/><circle cx="6.5" cy="-3" r="3.8" fill="url(#sh2)" stroke="${BR}" stroke-width="1"/></g></g>
<g class="bi" style="display:none"><text font-size="13" text-anchor="middle">🐤</text><text font-size="13" text-anchor="middle">🐤</text><text font-size="13" text-anchor="middle">🐤</text></g></svg>`;
const mouthD = (o, w, sm = .35) => { const hw = 6 + w * 7, yc = 78 - sm * 2.6, top = 77 - o * 2 - sm * .8, bot = 78 + (2 + o * 15) * 1.35 + sm * 5; return `M${50 - hw} ${yc}Q50 ${top} ${50 + hw} ${yc}Q50 ${bot} ${50 - hw} ${yc}Z`; };   // sm: -1 frown … +1 smile
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
  const q = (c) => btn.querySelector('.' + c), E = Object.fromEntries('bd sh fl fr an bu el er mo mo2 al al2 hl ar ar2 hr mc bi fg mn brs bl br tg'.split(' ').map((c) => [c, q(c)]));
  const pps = btn.querySelectorAll('.pp'), bsvg = bub.querySelector('svg'), tt = bub.querySelector('b'), gg = bub.querySelector('i');
  const lids = [...btn.querySelectorAll('.lid')], los = [...btn.querySelectorAll('.lo')];
  let size = 72, BW = 29, BH = 63, gen = 0, alive = true, playing = false, idleAt = performance.now(), T0 = 0, B = null, ht = 0, noteT = 0, told = new Set(), queue = [], lastIdx = S.rec.index, needleT = 0, tapN = 0, welcomed = false, tourT = performance.now() + 9000, mx = -1, my = -1;
  const M = { mood: { n: 'calm', t: 0 }, shake: 0, tilt: 0, nod: 0, mad: 0, pet: 0, petting: 0, eff: 0, grip: null, fing: 0, mon: 0, mode: 'walk', vx: 0, vy: 0, vr: 0, rot: 0, sq: 0, peak: 0, dizzy: 0, wide: 0, hx: 0, hy: 0, jp: null, dc: null, dance: 0, struggle: 0, sway: 0, run: 0, x: 0, y: 0, face: 1, pop: 0, ph: 0, mic: 0, micT: 0, o: 0, ot: 0, w: .5, wt: .5, lx: 0, ly: 0, nb: 2, bl: 0, sleep: 0, sit: 0, sp: 0, glad: 0, go: null, tgt: null, hold: 0,
    L: { a: 102, l: 22, ta: 102, tl: 22 }, Rm: { a: 78, l: 22, ta: 78, tl: 22 } };
  const REST = [[102, 22], [78, 22]], arms = (l, r) => { if (l) [M.L.ta, M.L.tl] = l; if (r) [M.Rm.ta, M.Rm.tl] = r; };
  const pend = new Set();
  const wait = (ms, g) => new Promise((res, rej) => { if (g !== gen) return rej('x'); const p = { rej }; p.t = setTimeout(() => { pend.delete(p); res(); }, ms); pend.add(p); });
  const interrupt = () => { gen++; pend.forEach((p) => { clearTimeout(p.t); p.rej('x'); }); pend.clear(); };
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
  const goTo = (p, g, jump) => { const path = plan({ x: M.x, y: M.y }, p, rects()); if (!path) return jump ? hop(p.x, p.y, g, 700 + Math.hypot(p.x - M.x, p.y - M.y) * .8) : Promise.reject('x'); return new Promise((res, rej) => { M.go = { path, i: 1, res, rej, g, t0: performance.now() }; }); };   // no walkable way (e.g. the deck spans the phone): hop over it

  /* ── manga bubbles ── */
  const BUB = { say: ['#fffdf6', '#f5e6c4'], think: ['#f6fbff', '#dcebf7'], sly: ['#f6ffdc', '#d4f08e'], angry: ['#fff1ec', '#ffb5a3'], shout: ['#fff4f7', '#ffc3d2'], sleepy: ['#f0f3fb', '#cdd7ea'] };
  function shape(kind, w, h, tip) {
    const m = 26, cx = m + w / 2, cy = m + h / 2, [c1, c2] = BUB[kind] || BUB.say, fill = 'url(#bg)';
    let s = `<defs><linearGradient id="bg" gradientUnits="userSpaceOnUse" x1="0" y1="${m - 12}" x2="0" y2="${m + h + 8}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>`;
    if (kind === 'think' || kind === 'sleepy') {                       // fluffy cloud
      const rx = w / 2 + 3, ry = h / 2 + 2, n = Math.max(8, Math.round(((rx + ry) * Math.PI) / 20)); s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
      for (let i = 0; i < n; i++) { const a = (i / n) * TAU; s += `<circle cx="${cx + Math.cos(a) * rx}" cy="${cy + Math.sin(a) * ry}" r="11" fill="${fill}"/>`; }
    } else {                                                            // soft pill with two little cloud bumps
      const rr = Math.min(h / 2 + 2, 26), bx = m + Math.min(34, w * .25);
      s += `<rect x="${m - 2}" y="${m - 1}" width="${w + 4}" height="${h + 2}" rx="${rr}" fill="${fill}"/><circle cx="${bx}" cy="${m}" r="${Math.min(12, h * .42)}" fill="${fill}"/><circle cx="${bx + 17}" cy="${m - 3}" r="${Math.min(9, h * .32)}" fill="${fill}"/>`;
    }
    s += `<ellipse cx="${cx}" cy="${m + 6}" rx="${Math.max(10, w * .34)}" ry="3.2" fill="#fff" opacity=".55"/>`;
    const dx = tip.x - cx, dy = tip.y - cy, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d, edge = Math.min(w / 2 / Math.max(Math.abs(ux), .001), h / 2 / Math.max(Math.abs(uy), .001)) + 6;
    [[7, 0], [4.6, 1], [3, 2]].slice(0, kind === 'think' ? 3 : 2).forEach(([r, i]) => { const f = Math.min(d - 3, edge + 7 + i * (r * 2 + 3)); s += `<circle cx="${cx + ux * f}" cy="${cy + uy * f}" r="${r}" fill="${c2}"/>`; });   // little trail of dots from the bubble to the pet
    return s;
  }
  function bestSpot(w, h, gap) {
    const rs = rects(), head = { x: M.x, y: M.y - BH * .55 }, C = [];
    for (let a = 0; a < 360; a += 30) for (const e of [0, 16]) { const r = (a * Math.PI) / 180; C.push([head.x + Math.cos(r) * (w / 2 + BW + gap + e) - w / 2, head.y + Math.sin(r) * (h / 2 + BH * .62 + gap + e) - h / 2]); }
    const ov = (x, y, k) => Math.max(0, Math.min(x + w, k.r) - Math.max(x, k.l)) * Math.max(0, Math.min(y + h, k.b) - Math.max(y, k.t)); let best = { x: 6, y: 6 }, bs = 1e12;
    for (const [x0, y0] of C) { const x = cl(x0, 6, innerWidth - w - 6), y = cl(y0, 6, innerHeight - h - 6); let s = (Math.abs(x - x0) + Math.abs(y - y0)) * 40 + Math.max(0, y + h / 2 - head.y) * .05; rs.forEach((k) => (s += ov(x, y, k) * (k.n === 'deck' ? 1.2 : k.n ? 3 : 8)));   // text matters most, then props, then the deck art
    s += ov(x, y, { l: M.x - BW - 6, r: M.x + BW + 6, t: M.y - BH - 6, b: M.y + 4 }) * 1000; if (s < bs) { bs = s; best = { x, y }; } }
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
  const hide = () => { bub.hidden = true; B = null; M.hold = 0; M.tgt = null; };
  let speechUntil = 0;
  const readMs = (t) => 1900 + t.length * 62;                           // reading time: ~16 characters a second, plus a beat
  async function say(text, kind, g, hold, urgent) {
    const gap = speechUntil - performance.now(); if (gap > 0 && !urgent) await wait(gap, g);          // never talk over a bubble someone is still reading
    show(text, kind);
    if (text === '…') { tt.innerHTML = '<span class="dd"><i></i><i></i><i></i></span>'; gg.textContent = ''; const h = Math.max(hold ?? 0, 1300); speechUntil = performance.now() + h + 400; await wait(h, g); hide(); return; }
    for (let i = 1; i <= text.length; i++) { tt.textContent = text.slice(0, i); gg.textContent = text.slice(i); [M.ot, M.wt] = visemeOf(text[i - 1].toLowerCase()); await wait(/[.,!?…]/.test(text[i - 1]) ? 190 : 46, g); }
    M.ot = .05; const h = Math.max(hold ?? 0, readMs(text)); speechUntil = performance.now() + h + 600; await wait(h, g); hide();
  }
  function blurt(text, kind = 'say', ms = 1500) { const h = Math.max(ms, readMs(text)); show(text, kind); tt.textContent = text; gg.textContent = ''; speechUntil = performance.now() + h + 500; setTimeout(() => { if (B && B.text === text) hide(); }, h); }   // instant bubble, for reactions that can't wait

  /* ── behaviours ── */
  const notes = () => { if (reduce) return; const e = Object.assign(document.createElement('span'), { className: 'mn', textContent: pick(['♪', '♫']) }); const r = E.hr.getBoundingClientRect(); e.style.cssText = `left:${r.left + R(-10, 14)}px;top:${r.top - 10}px;--dx:${R(-22, 22)}px;--r:${R(-25, 25)}deg`; document.body.append(e); e.onanimationend = () => e.remove(); };
  const hearts = () => { if (reduce) return; const e = Object.assign(document.createElement('span'), { className: 'mn mh', textContent: '♥' }), r = btn.getBoundingClientRect(); e.style.cssText = `left:${r.left + R(r.width * .2, r.width * .8)}px;top:${r.top + 4}px;--dx:${R(-18, 18)}px;--r:${R(-20, 20)}deg`; document.body.append(e); e.onanimationend = () => e.remove(); };
  async function perform(g) {
    M.micT = 0; let first = true, moved = true;
    while (playing) {
      const mv = first && Math.random() < .5 ? 'mic' : reduce ? pick(['mic', 'dance']) : !moved && Math.random() < .8 ? pick(['strut', 'jump', 'groove', 'strut']) : pick(['mic', 'dance', 'dance', 'strut', 'jump', 'spin', 'bang', 'groove']); first = false; moved = mv === 'strut' || mv === 'jump' || mv === 'groove';   // never parked in one spot for long
      if (mv === 'mic') { M.micT = 1; arms([-40, 24], [138, 30]); M.sway = 1; for (let i = 0, n = 4 + ((R(0, 5)) | 0); playing && i < n; i++) { arms([-50 + Math.sin(performance.now() / 380) * 22, 24], null); if (Math.random() < .55) notes(); await wait(520, g); } M.sway = 0; M.micT = 0; }
      else if (mv === 'dance') { M.dance = pick([1, 2, 3]); await wait(R(2500, 4800), g); M.dance = 0; }
      else if (mv === 'bang') { M.dance = 4; await wait(R(2600, 4200), g); M.dance = 0; }
      else if (mv === 'spin') { M.dance = 1; for (let i = 0; i < 3 && playing; i++) { M.sp = 1; await wait(950, g); } M.dance = 0; }
      else if (mv === 'jump') { for (let i = 0; i < 3 && playing; i++) { const x = cl(M.x + R(-90, 90), BW + 8, innerWidth - BW - 8); await hop(hit(x, M.y, rects()) ? M.x : x, M.y, g, 520); } }
      else { if (mv === 'groove') { M.micT = 1; arms(null, [138, 30]); } else M.dance = 3; const sp = spots(rects()); if (sp.length) await goTo(pick(sp), g); M.dance = 0; M.micT = 0; }
    }
    M.micT = 0;
  }
  /* ── hands-on: reach, hop, tour (only when asked), pranks, disc ride, physics ── */
  let tourOn = false, tourStop = false, pr = false, prankAt = performance.now() + 20000, pokeAt = 0, born = performance.now(), drag = null, lastHit = '', chipExp = 0, chipP = { x: -9, y: -9 };
  const PROPS = [['plant', 0, 0, 165, 250], ['books', 750, 0, 941, 290], ['headphones', 0, 960, 62, 1370], ['mug', 872, 1180, 941, 1400], ['sketchbook', 0, 1470, 165, 1672], ['oldbook', 835, 1550, 941, 1672]];
  const props = () => { const sc = $('#scene')?.getBoundingClientRect(); if (!sc) return []; const u = sc.width / 941; return PROPS.map(([n, l, t, r, b]) => ({ n, l: sc.left + l * u, t: sc.top + t * u, r: sc.left + r * u, b: sc.top + b * u })); };
  const nearTo = (tx, ty, w = 0) => { const rs = rects(), c = spots(rs); for (const k of [w / 2 + 50, w / 2 + 90, w / 2 + 130]) for (let a = 0; a < 360; a += 20) { const x = tx + Math.cos((a * Math.PI) / 180) * k, y = ty + Math.sin((a * Math.PI) / 180) * k * .8 + BH * .5; if (inV(x, y) && !hit(x, y, rs)) c.push({ x, y }); } c.sort((a, b) => Math.hypot(a.x - tx, a.y - BH * .5 - ty) - Math.hypot(b.x - tx, b.y - BH * .5 - ty)); return c[0]; };
  const nearSpot = (el) => { const r = el.getBoundingClientRect(), tx = r.left + r.width / 2, ty = r.top + r.height / 2; return { r, tx, ty, s: nearTo(tx, ty, r.width) }; };
  const reach = (tx, ty, max = 60) => { const u = size / 140, a = Math.atan2(ty - (M.y - 52 * u), tx - (M.x + 38 * u * M.face)), d = Math.hypot(tx - M.x, ty - M.y); arms(null, [((M.face > 0 ? a : Math.PI - a) * 180) / Math.PI, cl(d / u - 22, 18, max)]); };
  const ringOn = (r) => { ringAt = performance.now(); Object.assign(ring.style, { left: r.left - 6 + 'px', top: r.top - 6 + 'px', width: r.width + 12 + 'px', height: r.height + 12 + 'px' }); ring.hidden = false; };
  const hop = (x, y, g, ms = 650, ah) => new Promise((res, rej) => { M.mode = 'jump'; M.jp = { x0: M.x, y0: M.y, x1: x, y1: y, t: 0, ms: reduce ? 60 : ms, res, rej, g, h: ah ?? Math.min(150, 58 + Math.hypot(x - M.x, y - M.y) * .14) }; });
  const until = async (f, g) => { while (!f()) await wait(120, g); };
  const chip = Object.assign(document.createElement('div'), { className: 'mchip', hidden: true }); document.body.append(chip);
  const hideChip = () => { chip.hidden = true; chipExp = 0; };
  const placeChip = () => { if (chip.hidden) return; const p = bestSpot(chip.offsetWidth, chip.offsetHeight, 10); chipP = { x: M.x, y: M.y }; chip.style.transform = `translate(${p.x}px,${p.y}px)`; };
  const setChip = (text, btns, ms = 0) => { chip.hidden = false; chip.textContent = ''; const s = document.createElement('span'); s.textContent = text; chip.append(s); btns.forEach(([t, f]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.onclick = (e) => { e.stopPropagation(); f(); }; chip.append(b); }); chipExp = ms ? performance.now() + ms : 0; placeChip(); };
  const GK = 'static.guide.v1';          // stays on this device: localStorage, with a plain cookie as a fallback. Nothing is sent anywhere.
  const gget = () => { try { const v = JSON.parse(localStorage.getItem(GK)); if (v) return v; if (localStorage.getItem('static.guide') === '1') return { s: 'accepted', asked: 1 }; } catch { /* blocked */ } try { const c = document.cookie.match(/(?:^|; )static_guide=([^;]+)/); if (c) return JSON.parse(decodeURIComponent(c[1])); } catch { /* none */ } return null; };
  const gset = (v) => { const s = JSON.stringify(v); try { localStorage.setItem(GK, s); } catch { /* blocked */ } try { document.cookie = `static_guide=${encodeURIComponent(s)};max-age=31536000;path=/;SameSite=Lax`; } catch { /* blocked */ } };
  let gs = /[?&]tour\b/.test(location.search) ? { s: 'new', asked: 0 } : gget() || { s: 'new', asked: 0 };       // ?tour brings the offer back
  const offer = () => {
    if (gs.s !== 'new' || gs.asked >= 3) return;                         // answered once (yes or no) = never asked again; ignored 3 times = stop nagging
    gs = { s: 'new', asked: gs.asked + 1 }; gset(gs);
    setChip('new here? want a quick tour?', [['yes!', () => { gs = { s: 'accepted', asked: gs.asked }; gset(gs); hideChip(); queue.push({ k: 'tour' }); interrupt(); }], ['no thanks', () => { gs = { s: 'declined', asked: gs.asked }; gset(gs); hideChip(); queue.push({ k: 'later' }); interrupt(); }]], 16000);
  };
  let fingAt = 0, ringAt = 0, lastTick = performance.now(), wLast = 'walk', wSince = performance.now(), raging = false, op = false, singSince = 0, lastTapAt = 0, annoy = 0, purrAt = 0, heartAt = 0, lastF = -1;
  const ease = (p) => p * p * (3 - 2 * p), lerp = (a, b, p) => a + (b - a) * p;
  function hands2(a, b) {                       // both hands onto two screen points (stretchy cartoon arms)
    const u = size / 140, hs = [a, b].map((p) => [50 + ((p.x - M.x) / u) * M.face, 118 + (p.y - M.y) / u]).sort((p, q) => p[0] - q[0]), A2 = ([sx, sy], px) => [(Math.atan2(sy - 68, sx - px) * 180) / Math.PI, Math.hypot(sx - px, sy - 68)];
    arms(A2(hs[0], 12), A2(hs[1], 88));
  }
  /* walk up to a real control, take hold with both hands, and only act once the hands are really on it. The body stands NEXT to the
     control (never on it); the hands follow the control's real movement (knob rotation, lever swing, arm sweep); strain time is random. */
  async function operate(el, g, o = {}) {
    const p0 = o.pt ? o.pt() : null, r = p0 ? { left: p0.x - 9, right: p0.x + 9, top: p0.y - 9, bottom: p0.y + 9, width: 18, height: 18 } : el.getBoundingClientRect(); if (!r.width && !r.height) return false;
    const tx = r.left + r.width / 2, ty = r.top + r.height / 2, rc = Math.max(9, Math.min(r.width, r.height) / 2 + 2), rotor = el.querySelector?.('[class$="__rotor"]'), readRot = rotor ? () => parseFloat(rotor.style.getPropertyValue('--rot')) || 0 : null;
    const pt = o.pt || (() => { const q = (o.track || el).getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
    const touching = () => { const G = M.grip; return !!G && [E.hl, E.hr].some((h) => { const q = h.getBoundingClientRect(); return Math.hypot(q.left + q.width / 2 - G.x, q.top + q.height / 2 - G.y) <= G.r + 16; }); };
    op = true;
    try {
      if (Math.hypot(tx - M.x, ty - (M.y - BH * .5)) > BW + rc + 26) {
        const oth = $$('#power,#volume,#lever,#trim').filter((e) => e !== el && !el.contains?.(e)).map((e) => e.getBoundingClientRect()), own = { l: r.left - 3, t: r.top - 3, r: r.right + 3, b: r.bottom + 3 };
        const a0 = r.width * r.height, anc = (k) => (k.r - k.l) * (k.b - k.t) > a0 * 1.6 + 400 && tx > k.l && tx < k.r && ty > k.t && ty < k.b;       // bigger boxes around the target (a whole bar) are not obstacles, other text is
        const extra = o.avoid ? $$(o.avoid).map((e) => { const q = e.getBoundingClientRect(); return { l: q.left - 4, t: q.top - 4, r: q.right + 4, b: q.bottom + 4 }; }) : [];
        const obs = rects().filter((k) => k.n !== 'deck' && !anc(k)).concat(own, extra), c = [];
        const ovl = (x, y) => oth.reduce((s, q) => s + Math.max(0, Math.min(x + BW, q.right) - Math.max(x - BW, q.left)) * Math.max(0, Math.min(y, q.bottom) - Math.max(y - BH, q.top)), 0);
        for (const d of [rc + BW + 4, rc + BW + 16]) for (let a = 0; a < 360; a += 15) { const x = tx + Math.cos((a * Math.PI) / 180) * d, y = ty + Math.sin((a * Math.PI) / 180) * d + BH * .5; if (inV(x, y) && !hit(x, y, obs)) c.push({ x, y, sc: ovl(x, y) * .03 + Math.hypot(x - M.x, y - M.y) * .4 + (d > rc + BW + 5 ? 40 : 0) }); }
        c.sort((p, q) => p.sc - q.sc); const st = c[0];
        if (!st) { blurt(pick(['no room to squeeze in there.', 'i can’t get close enough.', 'hmm. too crowded here.']), 'say', 1800); return false; }
        if (hit(st.x, st.y, rects())) { const w = nearTo(st.x, st.y - BH * .5, 0); if (w) await goTo(w, g, true); await hop(st.x, st.y, g, 520); } else await goTo(st, g, true);
      }
      M.face = tx >= M.x ? 1 : -1; const q0 = pt(); M.grip = { x: q0.x, y: q0.y, r: rc, spin: 0, pt, rot: readRot, rot0: readRot ? readRot() : 0, follow: !!o.follow, ox: M.x - q0.x, oy: M.y - q0.y }; M.eff = o.rage ? 1 : .3;
      await wait(o.rage ? 110 : 450, g); for (let i = 0; i < 4 && !touching(); i++) await wait(150, g);
      if (!touching()) { blurt(pick(['can’t reach that one!', 'too far for my little arms.', 'hmm. not from here.']), 'say', 1800); return false; }       // no contact, no action
      if (o.say) await say(o.say, 'say', g, 500);
      o.start?.(); await wait(o.rage ? 80 : R(200, 500), g);
      const T = Math.max(o.quick || o.rage ? R(260, 600) : pick([R(700, 1300), R(1200, 2200), R(1200, 2200), R(2400, 3600)]), o.minT || 0);
      if (T > 2300 && !o.rage && !o.start) { M.eff = 1; blurt(L('effort'), 'say', 1200); await wait(R(500, 800), g); M.eff = 0; const gk = M.grip; M.grip = null; arms([-40, 24], [-40, 24]); blurt('ow. my hands.', 'say', 1000); await wait(850, g); M.grip = gk; }   // slips, shakes its hands out, tries again
      M.eff = 1; if (!o.rage && T > 900) blurt(L('effort'), 'say', Math.min(T, 1700));
      for (const t0 = performance.now(); ;) { const p = cl((performance.now() - t0) / T, 0, 1); o.progress?.(p); if (p >= 1) break; await wait(40, g); }
      o.done?.(); M.sq = o.rage ? 1 : .35; M.eff = 0; M.glad = 1; mood('happy', 1.2); await wait(o.rage ? 100 : 420, g);
      return true;
    } finally { o.abort?.(); M.grip = null; M.eff = 0; op = false; }
  }
  const armPt = () => { const p = $('.arm-hit'); if (!p || !p.getScreenCTM()) return null; const q = p.getPointAtLength(p.getTotalLength() * .62), s = p.ownerSVGElement.createSVGPoint(); s.x = q.x; s.y = q.y; const w = s.matrixTransform(p.getScreenCTM()); return { x: w.x, y: w.y }; };
  const STEPS = [
    { sel: '#power', text: 'this is the power switch. watch me flip it!', mk: () => ({ done: () => api.setMotor(true) }) },
    { sel: '#arm', ring: false, when: () => S.arm.mode !== 'down', text: 'now the needle. i’ll carry the tonearm onto the record.', mk: () => { const th0 = api.theta(), th1 = api.thetaFor(S.rec.index, S.rec.pos); return { pt: armPt, follow: true, minT: 1800, start: () => api.armStart(), progress: (p) => api.armMove(lerp(th0, th1, ease(p))), done: () => api.armDrop(), abort: () => api.armDrop() }; } },
    { sel: '#lever', when: () => S.arm.mode === 'down', text: 'this little lever lifts the needle…', mk: () => ({ track: $('#leverBody'), done: () => api.lever() }) },
    { sel: '#lever', when: () => S.arm.cueRaised, text: '…and sets it back down.', mk: () => ({ track: $('#leverBody'), quick: true, done: () => api.lever() }) },
    { sel: '#volume', text: 'turn this knob for volume. like so…', mk: () => { const v0 = S.volume; return { progress: (p) => api.setVolume(p < .5 ? lerp(v0, .2, ease(p * 2)) : lerp(.2, v0, ease(p * 2 - 1))), done: () => api.setVolume(v0) }; } },
    { sel: '.seek__knob', text: 'drag this knob to jump around the song.', mk: () => ({ avoid: '.seek__bar', done: () => api.cueTo(S.rec.index, (S.span[S.rec.index] || 60) * .55) }) },
    { sel: () => { const d = $$('.dot'); return d[S.rec.index === d.length - 1 ? 0 : d.length - 1]; }, text: 'and tap a dot to pick another song.', mk: () => ({ quick: true, done: () => api.skipTo(S.rec.index === S.tracks.length - 1 ? 0 : S.tracks.length - 1) }) },
  ];
  async function tour(g) {
    tourOn = true; tourStop = false; setChip('tour on', [['stop', () => { tourStop = true; interrupt(); }]]);
    try {
      M.face = 1; arms(null, [-62, 30]); mood('happy', 3); await say('okay! follow me. i’ll show you everything.', 'say', g, 800);
      for (const st of STEPS) {
        if (st.when && !st.when()) continue; const el = typeof st.sel === 'function' ? st.sel() : $(st.sel); if (!el) continue;
        if (st.ring !== false) ringOn(el.getBoundingClientRect()); const ok = await operate(el, g, { ...st.mk(), say: st.text }); ring.hidden = true; arms(...REST); if (!ok) await wait(600, g);
      }
      mood('happy', 3); M.dance = 1; await say(L('proud'), 'say', g, 2000);
    } finally { tourOn = false; M.sway = 0; M.dance = 0; ring.hidden = true; hideChip(); }
  }
  async function prank(g) {
    const kinds = ['stop', 'vol', 'vol', 'trim', 'skip']; if (S.arm.mode === 'down') kinds.push('lever', 'lever');
    const kind = pick(kinds), el = $({ stop: '#power', lever: '#lever', vol: '#volume', trim: '#trim', skip: '#nextBtn' }[kind]); if (!el) return;
    pr = true; const v0 = S.volume, t0 = S.trim, i0 = S.rec.index, p0 = S.rec.pos, was = playing;
    try {
      if (kind === 'stop') { if (!(await operate(el, g, { done: () => api.setMotor(false) }))) return; await say(L('prank'), 'sly', g, 1000); await wait(900, g); await operate(el, g, { quick: true, done: () => api.autoCue() }); }
      else if (kind === 'lever') { const o = { track: $('#leverBody') }; if (!(await operate(el, g, { ...o, done: () => api.lever() }))) return; await say(L('prank'), 'sly', g, 1000); await wait(700, g); await operate(el, g, { ...o, quick: true, done: () => { if (S.arm.cueRaised) api.lever(); } }); }
      else if (kind === 'vol') { if (!(await operate(el, g, { progress: (p) => api.setVolume(lerp(v0, .06, ease(p))) }))) return; await say('shhh…', 'sly', g, 900); await operate(el, g, { quick: true, progress: (p) => api.setVolume(lerp(.06, 1, ease(p))) }); await say('LOUDER!!', 'shout', g, 900); }
      else if (kind === 'trim') { if (!(await operate(el, g, { progress: (p) => api.setTrim(lerp(t0, .8, ease(p))) }))) return; await say('speeeed!', 'sly', g, 1200); await operate(el, g, { quick: true, progress: (p) => api.setTrim(lerp(.8, -.8, ease(p))) }); await say('…or slooow.', 'sly', g, 1200); }
      else { if (!(await operate(el, g, { quick: true, done: () => api.skipTo((i0 + 1) % S.tracks.length) }))) return; await say('oops. wrong track. or is it?', 'sly', g, 1400); await wait(2600, g); }
    } finally {            // pranks never leave things broken, even if you grab the bot halfway
      if (kind === 'vol') api.setVolume(v0); if (kind === 'trim') api.setTrim(t0); if (kind === 'lever' && S.arm.cueRaised) api.lever();
      if (kind === 'skip') { if (S.rec.index !== i0) api.cueTo(i0, p0); } else if (was && kind === 'stop' && (!S.motor || S.arm.mode !== 'down')) api.autoCue();
      pr = false;
    }
  }
  async function ride(g) {
    const rc = $('#record').getBoundingClientRect(), cx = rc.left + rc.width / 2, cy = rc.top + rc.height / 2, R0 = rc.width * .44, th = R(0, TAU), r = R(.3, .65) * R0, s = nearTo(cx, cy, rc.width + 40); if (!s) return;
    await goTo(s, g, true); M.face = cx >= M.x ? 1 : -1; await say(L('ride'), 'say', g, 700);
    await hop(cx + Math.cos(th) * r, cy + Math.sin(th) * r + BH * .5, g, 650); M.dc = mkDisc(cx, cy, R0, th, r); M.mode = 'disc'; await until(() => M.mode !== 'disc', g);
  }
  async function tantrum(g) {      // monster mode: swears (censored), slams the switch, yanks the lever, shakes the record, then calms down
    raging = true; pr = true; const was = playing;
    try {
      M.mad = 1.6; M.sq = 1; await say(L('rage'), 'angry', g, 1300);
      const pw = $('#power'), lv = $('#lever');
      if (pw) for (let i = 0, n = 3 + ((R(0, 3)) | 0); i < n; i++) await operate(pw, g, { rage: true, done: () => api.setMotor(!S.motor) });
      if (lv) for (let i = 0; i < 2; i++) await operate(lv, g, { rage: true, track: $('#leverBody'), done: () => api.lever() });
      if (!S.motor && S.arm.mode === 'parked') await inspect(g, true);
      await say(L('rage'), 'angry', g, 1000);
    } finally { raging = false; pr = false; if (was) { if (!S.motor || S.arm.mode !== 'down') api.autoCue(); } else { if (S.arm.mode === 'down') api.park(); if (S.motor) api.setMotor(false); } M.mad = Math.min(M.mad, .7); }
    await say(L('calm'), 'say', g, 1800);
  }
  async function annoyed(g) {      // the visitor stopped the song while it was vibing: swears, flips them off, puts the song back on itself
    annoy++; pr = true; M.mad = Math.max(M.mad, .9);
    try {
      M.face = 1; M.fing = 1; fingAt = performance.now(); arms(null, [-78, 36]); await say(L('annoyed'), 'angry', g, 1700); M.fing = 0;
      const pw = $('#power'); if (pw) await operate(pw, g, { rage: true, done: () => api.autoCue() });
      M.face = 1; M.fing = 1; arms(null, [-78, 36]); await say(L('smug'), 'sly', g, 1500); M.fing = 0; M.dance = 1; await wait(1800, g);
    } finally { pr = false; M.fing = 0; M.dance = 0; }
    if (annoy >= 3) { annoy = 0; queue.push({ k: 'tantrum' }); }
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
  const mkDisc = (cx, cy, R0, th, r) => ({ cx, cy, R: R0, th, r, t: 0, bal: 1, skill: R(.7, 1.35), grace: R(.9, 2.3), tire: R(7, 13), said: 0 });
  function disc(dt, t) {
    const D = M.dc, w = S.omega || 0, aw = Math.abs(w), sg = Math.sign(w) || 1; D.t += dt;
    const cap = 150 * D.skill, load = (aw * D.r) / cap; let net = w, mode;       // load = how fast the record moves under its feet vs how fast it can run
    if (aw < .12) { mode = 'stand'; net = 0; D.bal = Math.min(1, D.bal + dt); D.r = cl(D.r + Math.sin(t * .6) * 9 * dt, D.R * .18, D.R * .8); D.th += Math.sin(t * .4) * .3 * dt; }                       // stopped record: just stands about
    else if (load <= 1) { mode = 'run'; net = 0; D.bal += ((load > .75 ? 1 - (load - .75) * .9 : 1) - D.bal) * Math.min(1, dt * 2.5); D.r = Math.max(D.R * .18, D.r - dt * 14); }                  // keeps up: treadmill, edging towards the centre
    else { mode = 'slip'; net = w - (sg * cap * .9) / Math.max(D.r, 24); D.bal -= dt * Math.min(1.2, (load - 1) * .28 + .12) * (D.t < D.grace ? .25 : 1); D.r = Math.min(D.R, D.r + dt * (6 + (load - 1) * 14)); }   // can't keep up: runs, wobbles, gets carried outward
    D.th += net * dt; M.run = mode === 'stand' ? 0 : 1; M.struggle = mode === 'slip' || (mode === 'run' && load > .75) ? 1 : 0;
    const wob = 1 - D.bal; M.x = D.cx + Math.cos(D.th) * D.r; M.y = D.cy + Math.sin(D.th) * D.r + BH * .5; if (aw >= .12) M.face = sg * Math.sin(D.th) >= 0 ? 1 : -1;
    M.rot = (M.run ? -M.face * (6 + load * 3) : 0) + Math.sin(t * (8 + 8 * wob)) * (3 + 24 * wob);
    if (M.run) { const f = 14 + 10 * wob, a = 30 + 50 * wob; arms([-110 + Math.sin(t * f) * a, 26], [-70 - Math.sin(t * f + 1) * a, 26]); } else arms(...REST);
    if (mode === 'slip' && !D.said && D.t > D.grace * .6) { D.said = 1; blurt(pick(['whoa whoa whoa!', 'it’s moving!!', 'steady… steady…']), 'shout', 1300); }
    if (wob > .55 && D.said < 2) { D.said = 2; blurt(pick(['i’m going!! i’m going!!', 'too fast!! help!!', 'no no no no—']), 'shout', 1300); }
    if (mode === 'stand' && D.t > D.tire + 4) { M.vx = Math.cos(D.th) * 220; M.vy = -520; M.vr = 0; M.mode = 'fall'; M.peak = 300; M.dc = null; return; }                                    // hops off by itself
    if (mode === 'run' && D.t > D.tire) { M.vx = -Math.sin(D.th) * sg * 80 + Math.cos(D.th) * 160; M.vy = -380; M.vr = 300 * sg; M.mode = 'fall'; M.peak = 1500; M.dizzy = 3; M.dc = null; return; }   // tired out: dizzy tumble
    if (D.bal <= 0 || D.r >= D.R - 3) { const v = w * D.r * .85; M.vx = -Math.sin(D.th) * v + Math.cos(D.th) * (80 + 40 * load); M.vy = Math.cos(D.th) * v * .5 + Math.sin(D.th) * 80 - 300; M.vr = 420 * sg; M.mode = 'fall'; M.peak = 1500; M.dizzy = 3; M.dc = null; }   // flung off
  }
  function modeStep(dt, t, k) {
    discFrame(dt); const md = M.mode, now = performance.now();
    M.wide += ((md === 'held' || md === 'fall' || M.struggle || M.mad > 1 ? 1 : 0) - M.wide) * k; M.sq = Math.max(0, M.sq - dt * 3.2); M.dizzy = Math.max(0, M.dizzy - dt); if (md !== 'disc') { M.struggle = 0; M.run = 0; }
    M.mon += ((raging ? 1 : 0) - M.mon) * Math.min(1, dt * 4); if (!raging) M.mad = Math.max(0, M.mad - dt * (M.petting ? .45 : .08)); M.pet = M.petting ? Math.min(1, M.pet + dt * .6) : Math.max(0, M.pet - dt * .2);
    if (M.petting) { M.glad = 1; if (now > purrAt) { purrAt = now + 3200; blurt(L('purr'), 'say', 1800); } if (now > heartAt) { heartAt = now + 700; hearts(); } }
    if (md === 'walk' || md === 'jump') { const rt = M.sway ? Math.sin(t * 5) * 10 : M.dizzy ? Math.sin(t * 7) * 9 : M.petting ? 7 * M.face : M.eff ? -M.face * 6 * M.eff + Math.sin(t * 18) * 2.5 : raging ? Math.sin(t * 22) * 4 : M.sleep ? 7 * M.face + Math.sin(t * 1.2) * 2 : M.nod ? 5 + Math.sin(t * 2.6) * 6 : M.tilt ? M.tilt : M.dance === 2 ? Math.sin(t * 4.5) * 14 : M.dance === 4 ? Math.sin(t * 13) * 10 : Math.sin(t * .7) * 1.2; M.rot += (rt - M.rot) * k * 2; }
    if (M.eff) { M.ot = .2; M.wt = .12; M.glad = Math.max(M.glad, .5 * M.eff); }
    if (md === 'held') { M.x += (M.hx - M.x) * Math.min(1, dt * 18); M.y += (M.hy + BH * .95 - M.y) * Math.min(1, dt * 18); M.rot = cl((M.hx - M.x) * .9, -28, 28) + Math.sin(t * 9) * 7; M.ot = .9; M.wt = .5; arms([-150 + Math.sin(t * 17) * 40, 26], [-30 - Math.sin(t * 15) * 40, 26]); }
    else if (md === 'fall') physics(dt); else if (md === 'disc') disc(dt, t);
    else if (M.jp) { const j = M.jp; if (j.g !== gen) { M.jp = null; M.mode = 'fall'; M.vx = M.vy = 0; j.rej('x'); } else { j.t += (dt * 1000) / j.ms; const u = Math.min(1, j.t); M.x = j.x0 + (j.x1 - j.x0) * u; M.y = j.y0 + (j.y1 - j.y0) * u - Math.sin(u * Math.PI) * j.h; M.face = j.x1 >= j.x0 ? 1 : -1; if (u >= 1) { M.jp = null; M.mode = 'walk'; j.res(); } } }
    else if (M.grip) {                 // hands stay on the control wherever it goes, and turn with it by exactly the amount (and direction) it really turns
      const G = M.grip, p = G.pt && G.pt(); if (p) { G.x = p.x; G.y = p.y; } if (G.rot) G.spin = ((G.rot() - G.rot0) * Math.PI) / 180;
      if (G.follow) { const q = Math.min(1, dt * 10); M.x += (G.x + G.ox - M.x) * q; M.y += (G.y + G.oy - M.y) * q; }
      const a0 = Math.atan2(M.y - BH * .5 - G.y, M.x - G.x) + G.spin, rr = G.r * .9; hands2({ x: G.x + Math.cos(a0 - .75) * rr, y: G.y + Math.sin(a0 - .75) * rr }, { x: G.x + Math.cos(a0 + .75) * rr, y: G.y + Math.sin(a0 + .75) * rr });
    }
    else if (M.dance) { const s = Math.sin(t * 9), c = Math.cos(t * 9), f = [[[-60 + s * 50, 26], [-60 - s * 50, 26]], [[-30 + s * 40, 28], [-150 - s * 40, 28]], [[-100 + c * 30, 34], [-80 - c * 30, 34]], [[-75 + s * 12, 26], [-105 - s * 12, 26]]][M.dance - 1] || [[-60, 26], [-60, 26]]; arms(...f); }
    E.bi.style.display = M.dizzy ? '' : 'none'; if (M.dizzy) E.bi.querySelectorAll('text').forEach((e, i) => { const a = t * 5 + i * 2.09; e.setAttribute('x', 50 + Math.cos(a) * 24); e.setAttribute('y', 2 + Math.sin(a) * 7); });
    if (!chip.hidden) { if (chipExp && performance.now() > chipExp) hideChip(); else if (Math.hypot(chipP.x - M.x, chipP.y - M.y) > 8) placeChip(); }
  }

  /* ── curiosity: lift the real record with both hands, inspect it, spin it, toss it, put it back ── */
  let curious = false;
  const D = { el: null, W: 1, x: 0, y: 0, s: 1, a: 0, spin: 0, lift: 0, p: 1, ms: 1, from: { x: 0, y: 0, s: 1 }, to: () => ({ x: 0, y: 0, s: 1 }), hold: false };
  function discFrame(dt) {
    if (!D.el) return; D.a += D.spin * dt; if (D.p < 1) D.p = Math.min(1, D.p + (dt * 1000) / D.ms);
    const t = D.to(), e = 1 - Math.pow(1 - D.p, 3), f = D.from; D.x = f.x + (t.x - f.x) * e; D.y = f.y + (t.y - f.y) * e; D.s = f.s + (t.s - f.s) * e;
    D.el.style.transform = `translate(${D.x - D.W / 2}px,${D.y - D.W / 2 - D.lift}px)scale(${D.s})rotate(${D.a}deg)`;
    if (D.hold) { const u = size / 140, r = (D.W * D.s) / 2, y2 = D.y - D.lift + .7 * r, hs = [-.62, .62].map((k) => [50 + ((D.x + k * r - M.x) / u) * M.face, 118 + (y2 - M.y) / u]).sort((p, q) => p[0] - q[0]), A2 = ([sx, sy], px) => [(Math.atan2(sy - 68, sx - px) * 180) / Math.PI, Math.hypot(sx - px, sy - 68)]; arms(A2(hs[0], 12), A2(hs[1], 88)); }   // both hands under the disc
  }
  const flyTo = (to, ms, g) => { D.from = { x: D.x, y: D.y, s: D.s }; D.to = to; D.ms = ms; D.p = 0; return until(() => D.p >= 1, g); };
  async function inspect(g, rage) {
    const rec = $('#record'), sheen = $('.sheen'); if (!rec || S.motor || S.arm.mode !== 'parked') return;
    const rc = rec.getBoundingClientRect(), cx = rc.left + rc.width / 2, cy = rc.top + rc.height / 2, s = nearTo(cx, cy, rc.width + 40); if (!s) return;
    curious = true; const bh0 = BH, Dh = size * .95;
    try {
      await goTo(s, g, true); M.face = cx >= M.x ? 1 : -1; M.tgt = { x: cx, y: cy }; reach(cx, cy, 60); await say(rage ? L('rage') : L('curious'), rage ? 'angry' : 'say', g, 800);
      const el = Object.assign(document.createElement('div'), { className: 'mdisc' }); el.style.cssText = `width:${rc.width}px;height:${rc.width}px;--k:${rc.width / 704}px`;
      const c2 = rec.cloneNode(true); c2.removeAttribute('id'); c2.style.cssText = 'left:0;top:0;transform:none;visibility:visible'; el.append(c2); document.body.append(el);
      Object.assign(D, { el, W: rc.width, x: cx, y: cy, s: 1, a: ((S.spin % TAU) * 180) / Math.PI, spin: 700, lift: 0, hold: false }); rec.style.visibility = 'hidden'; if (sheen) sheen.style.visibility = 'hidden';
      await flyTo(() => ({ x: M.x, y: M.y - bh0 - Dh * .38, s: Dh / rc.width }), rage ? 450 : 900, g);
      D.hold = true; BH = bh0 + Dh * .9; D.spin = 40; M.tgt = null; M.sway = 1; await say('whoa. it’s heavy… and so shiny.', 'say', g, 900);
      D.spin = rage ? 1500 : 420; await say(rage ? L('rage') : L('spin'), rage ? 'angry' : 'say', g, 1100); M.glad = 1;
      for (let i = 0; i <= 30; i++) { D.lift = Math.sin((i / 30) * Math.PI) * 80; D.spin = 900; await wait(30, g); } D.lift = 0; D.spin = 60;
      await say(L('toss'), 'say', g, 900); D.hold = false; BH = bh0; M.sway = 0; arms([-70, 28], [-70, 28]);
      D.spin = 500; await flyTo(() => ({ x: cx, y: cy, s: 1 }), 950, g);
    } finally { D.hold = false; D.spin = 0; if (D.el) { D.el.remove(); D.el = null; } rec.style.visibility = ''; if (sheen) sheen.style.visibility = ''; BH = bh0; M.tgt = null; M.sway = 0; curious = false; }   // always puts the real record back
    if (!rage) { M.dance = 1; await say(L('back'), 'say', g, 1500); }
  }
  /* nudge a line of text, but only from right beside it, with the hands on its edge (no pushing things from across the room) */
  async function shove(g) {
    const el = $(pick(['.tagline', '#title', '#artist'])); if (!el || !el.offsetWidth) return;
    const rg = document.createRange(); rg.selectNodeContents(el); const r = rg.getBoundingClientRect(); if (r.width < 8) return;
    const cy = (r.top + r.bottom) / 2, rs = rects(), side = pick([-1, 1]);
    for (const s of [side, -side]) {
      const x = s < 0 ? r.left - 5 - BW - 2 : r.right + 5 + BW + 2, y = cy + BH * .55, ex = s < 0 ? r.left : r.right;
      if (!inV(x, y) || hit(x, y, rs)) continue;
      await goTo({ x, y }, g); M.face = -s; M.grip = { x: ex, y: cy, r: 8, spin: 0, pt: () => ({ x: ex, y: cy }) }; M.eff = .4; op = true;
      try {
        await wait(500, g); const G = M.grip, hs = [E.hl, E.hr].map((h) => h.getBoundingClientRect());
        if (!hs.some((q) => Math.hypot(q.left + q.width / 2 - G.x, q.top + q.height / 2 - G.y) <= G.r + 16)) return;      // hands not on the text: leave it alone
        M.eff = 1; blurt(L('effort'), 'say', 1300); await wait(700, g); el.style.setProperty('--wd', `${-s * 6}px`); el.classList.add('m-wob'); setTimeout(() => el.classList.remove('m-wob'), 900); mood('smug', 2); await wait(500, g); await say(L('prod'), 'sly', g, 1000);
      } finally { M.grip = null; M.eff = 0; op = false; }
      return;
    }
  }
  on(bub.querySelector('.mtx'), 'click', () => { if (!tourOn && !curious) interrupt(); });   // tap a bubble to dismiss it
  async function antic(g) {
    const k = pick(reduce ? ['look', 'chat', 'yawn', 'stretch'] : ['look', 'look', 'chat', 'chat', 'yawn', 'stretch', 'hum', 'spin', 'dance', 'hiccup', 'sneeze', 'scratch', 'shiver', 'tilt', 'proud', 'rage']);
    if (k === 'look') { mood('curious', 2.6); M.tgt = { x: R(0, innerWidth), y: R(0, innerHeight) }; await wait(R(1400, 2600), g); M.tgt = null; }
    else if (k === 'stretch') { mood('happy', 1.8); arms([-70, 30], [-110, 30]); await wait(1300, g); arms(...REST); }
    else if (k === 'yawn') { mood('sleepy', 2.4); M.ot = 1; M.wt = .3; await wait(1500, g); M.ot = 0; }
    else if (k === 'spin' && !reduce) { mood('happy', 1.6); M.sp = 1; await wait(1000, g); }
    else if (k === 'chat') { mood(pick(['curious', 'happy', 'calm']), 2.6); await say(L('chat'), 'say', g); }
    else if (k === 'dance') { mood('happy', 3.4); M.dance = pick([1, 2, 3]); await wait(3200, g); M.dance = 0; }
    else if (k === 'hiccup') { for (let i = 0; i < 2; i++) { M.sq = .55; await hop(M.x, M.y, g, 300, 14); blurt('hic!', 'say', 900); await wait(900, g); } }
    else if (k === 'sneeze') { mood('surprised', 1.2); arms([-70, 26], [-110, 26]); await wait(700, g); M.sq = .8; M.rot = 14; blurt('…ah… ACHOO!', 'shout', 1500); await wait(1500, g); }
    else if (k === 'scratch') { mood('happy', 2.2); arms(null, [-125, 30]); for (let i = 0; i < 6; i++) { M.Rm.ta = -125 + (i % 2) * 18; await wait(260, g); } }
    else if (k === 'shiver') { mood('sad', 2); M.shake = 1.4; blurt('brr. cold desk.', 'think', 1600); await wait(1600, g); }
    else if (k === 'tilt') { mood('curious', 2.4); M.tilt = pick([-12, 12]); await wait(2000, g); M.tilt = 0; }
    else if (k === 'proud') { mood('smug', 2.6); arms([-30, 24], [-150, 24]); await say(pick(['i look good today.', 'strong. handsome. a little round.', 'still got it.']), 'sly', g); }
    else if (k === 'rage') { btn.classList.add('mad'); mood('angry', 1.6); await say(L('angry'), 'angry', g, 900); btn.classList.remove('mad'); }
    else await say(L('sing'), 'think', g, 900);
    await wait(R(2200, 4600), g);
  }
  async function wander(g) {
    if (!reduce && Math.random() < .14) return shove(g);
    const rs = rects(), sp = spots(rs); if (!sp.length || reduce) { await antic(g); return; }
    const home = sp.find((s) => s.kind === 'home'), t = home && Math.random() < .2 ? home : pick(sp);
    await goTo(t, g); M.sit = t.kind === 'edge' ? 1 : 0;
    for (let i = 0, n = 1 + ((R(0, 2)) | 0); i < n; i++) await antic(g);
  }
  async function run(a, g) {
    if (a.k === 'wake') { mood('surprised', 1); await say(L('wake'), 'say', g); return; }
    if (a.k === 'move') return goTo(a, g, true);
    if (a.k === 'tour') return tour(g);
    if (a.k === 'ride') return ride(g);
    if (a.k === 'prank') return prank(g);
    if (a.k === 'inspect') return inspect(g);
    if (a.k === 'shove') return shove(g);
    if (a.k === 'tantrum') return tantrum(g);
    if (a.k === 'annoyed') return annoyed(g);
    if (a.k === 'later') { mood('happy', 1.5); return say('okay! i’m here if you need me.', 'say', g, 1000); }
    if (a.k === 'tap') {
      const n = tapN++; M.sit = 0;
      if (!a.hard && speechUntil - performance.now() > 900) { M.glad = 1; M.sq = .45; arms([-60, 28], [-60, 28]); mood('surprised', .5); await wait(500, g); return; }     // mid-sentence: a little jump, no new bubble
      M.glad = 1;
      if (a.hard) { M.sq = .7; mood('sad', 1.4); arms([-60, 28], [-60, 28]); await say(L('hurt'), 'shout', g, 1000, true); }
      else if (n % 4 === 1 && !playing && !reduce) { M.micT = 1; M.hold = 1; mood('happy', 2); arms(null, [138, 30]); notes(); await say(L('mic'), 'think', g, 1400); M.hold = 0; M.micT = 0; }
      else { if (n % 3 === 0 && !reduce) M.sp = 1; mood('happy', 1.6); arms([-60, 28], [-60, 28]); await say(L('tap'), 'say', g); }
    } else if (a.k === 'track') { if (playing && !reduce) { arms([-70, 28], [-70, 28]); M.sp = 1; } mood('excited', 2); await say(L('track', a.title), 'say', g, 1200); }
    else if (a.k === 'end') { mood('sad', 1.8); await say(L('end'), 'say', g); }
    else if (a.k === 'land') {
      arms([-50, 26], [-50, 26]);
      if (a.v > 1000) { M.dizzy = 3; await say(L('dizzy'), 'think', g, 1800, true); mood('sad', 2); }
      else if (a.v < 520) { mood('happy', 2); if (!reduce) M.sp = 1; await say(pick(['wheee! again!', 'soft landing. 10/10.', 'ha! i bounced.']), 'say', g, 1000, true); }
      else { mood('surprised', 1.2); await say(a.n && LINES['hit_' + a.n] ? L('hit_' + a.n) : L('land'), 'say', g, 1000, true); }
    }
    else if (a.k === 'poke') { const s = nearTo(a.x, a.y, 0); if (s && Math.hypot(s.x - a.x, s.y - BH * .5 - a.y) < 110) { await goTo(s, g, true); M.face = a.x >= M.x ? 1 : -1; reach(a.x, a.y, 50); M.tgt = { x: a.x, y: a.y }; mood('curious', 2); await say(L('touch'), 'say', g, 1000); } else { M.tgt = { x: a.x, y: a.y }; mood('curious', 1.6); await wait(1600, g); } }     // too far to reach: just look at it
  }
  async function decide(g) {
    while (M.mode !== 'walk') await wait(140, g);
    const now = performance.now(); lastTick = now; if (!playing && !M.hold) M.micT = 0; arms(...REST); M.tgt = null; M.dance = 0; M.sway = 0; M.fing = 0; M.tilt = 0; M.nod = 0; M.shake = 0;
    if (queue.length) return run(queue.shift(), g);
    if (!welcomed) { welcomed = true; mood('happy', 3); arms(null, [-62, 30]); await say(L('hi'), 'say', g, 1000); offer(); return; }
    if (chipExp && !chip.hidden) { await wait(500, g); return; }
    const quiet = now - idleAt;
    if (!playing && quiet > 30000) { mood('sleepy', 6); M.ot = 1; M.wt = .3; M.nod = 1; await wait(1500, g); M.ot = 0; await wait(1300, g); M.nod = 0; M.sleep = 1; show('zZz…', 'sleepy'); return wait(6e5, g); }        // yawns, nods off, then sleeps until touched
    if (!reduce && now > prankAt && quiet > 3500 && (playing || quiet < 26000) && now - born > 18000 && !M.petting) { prankAt = now + R(22000, 48000); return playing ? prank(g) : Math.random() < .5 && !S.motor && S.arm.mode === 'parked' ? inspect(g) : ride(g); }
    if (playing) return perform(g);
    return wander(g);
  }
  async function loop() { while (alive) { const g = ++gen; try { await decide(g); } catch (e) { if (e !== 'x') console.warn(e); hide(); btn.classList.remove('mad'); M.dance = 0; M.sway = 0; M.fing = 0; M.grip = null; M.eff = 0; M.tilt = 0; M.nod = 0; M.shake = 0; speechUntil = Math.min(speechUntil, performance.now() + 300); await new Promise((r) => setTimeout(r, 80)); } } }

  const MOODS = {
    calm: { cover: .05, tilt: 0, low: 0, smile: .4, brow: 0, bt: 0, pup: 1 }, happy: { cover: 0, tilt: 0, low: .45, smile: 1, brow: .3, bt: -3, pup: 1.08 },
    excited: { cover: 0, tilt: 0, low: .3, smile: 1, brow: .9, bt: -5, pup: 1.22 }, sleepy: { cover: .66, tilt: 0, low: .08, smile: .15, brow: -.2, bt: 0, pup: .9 },
    angry: { cover: .34, tilt: 20, low: 0, smile: -.9, brow: -.6, bt: 22, pup: .8 }, sad: { cover: .3, tilt: -16, low: 0, smile: -.7, brow: .4, bt: -18, pup: 1.18 },
    scared: { cover: 0, tilt: 0, low: 0, smile: -.35, brow: 1, bt: -8, pup: .55 }, surprised: { cover: 0, tilt: 0, low: 0, smile: -.1, brow: 1, bt: -4, pup: .7 },
    smug: { cover: .38, tilt: 8, low: .12, smile: .8, brow: .1, bt: 8, pup: .95 }, curious: { cover: 0, tilt: 0, low: 0, smile: .5, brow: .6, bt: -4, pup: 1.12 },
    dizzy: { cover: .12, tilt: 0, low: 0, smile: -.25, brow: 0, bt: 0, pup: .85 }, shy: { cover: .18, tilt: -6, low: .3, smile: .55, brow: .2, bt: -6, pup: 1.1 },
  };
  const FS = { ...MOODS.calm }, mood = (n, s = 2) => { M.mood = { n, t: s }; };
  function faceTarget() {
    const base = M.sleep ? 'sleepy' : M.dizzy > 0 ? 'dizzy' : M.mode === 'held' || M.mode === 'fall' ? 'scared' : raging ? 'angry' : M.petting ? 'happy' : M.mood.t > 0 ? M.mood.n : M.mad > .35 ? 'angry' : playing ? 'happy' : 'calm';
    const f = { ...MOODS[base] }, a = raging ? 1 : cl((M.mad - .15) / .85, 0, 1); if (a > 0 && base !== 'angry') for (const key in f) f[key] = lerp(f[key], MOODS.angry[key], a * .8);
    if (M.sleep) f.cover = .97; f.low = cl(f.low + M.glad * .4, 0, .85); return f;
  }

  /* ── frame: smooth everything, then write the SVG ── */
  function frame(now) {
    if (!alive) return; requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - T0) / 1000 || .016), t = now / 1000, k = 1 - Math.pow(.001, dt); T0 = now;
    const pl = !!(S.motor && S.arm.mode === 'down'); if (pl !== playing) { playing = pl; if (pl) singSince = performance.now(); if (!tourOn && !pr && !raging && M.mode === 'walk') { if (!pl) queue.push(singSince && performance.now() - singSince > 4000 && S.rec.pos > .6 ? { k: 'annoyed' } : { k: 'end' }); interrupt(); } }
    if (S.rec.index !== lastIdx) { lastIdx = S.rec.index; if (S.motor && welcomed && !tourOn && !pr) { queue.push({ k: 'track', title: S.tracks[lastIdx]?.title || 'this one' }); interrupt(); } }
    modeStep(dt, t, k);
    if (M.go) { const go = M.go; if (go.g !== gen) { M.go = null; go.rej('x'); } else { const p = go.path[go.i], dx = p.x - M.x, dy = p.y - M.y, d = Math.hypot(dx, dy), v = (reduce ? 400 : 210) * dt;
      if (d <= Math.max(2, v)) { M.x = p.x; M.y = p.y; if (++go.i >= go.path.length) { M.go = null; go.res(); } } else { M.x += (dx / d) * v; M.y += (dy / d) * v; if (Math.abs(dx) > 1) M.face = dx > 0 ? 1 : -1; M.ph += dt * 13; M.sit = 0; } } }
    M.pop = Math.min(1, M.pop + dt * (reduce ? 20 : 2.6)); const pop = 1 + Math.sin(M.pop * Math.PI) * .12 * (M.pop < 1), sc = M.pop < 1 ? Math.min(1, M.pop * 1.6) : 1;
    let lv = 0; if (playing) { lv = audio.level ? audio.level() : 0; if (lv < .02) lv = .22 + .2 * Math.abs(Math.sin(t * 7)); M.ot = cl(lv * 1.7, .05, 1); M.wt = .45 + Math.sin(t * 9) * .3; }
    M.o += (M.ot - M.o) * (1 - Math.pow(1e-4, dt)); M.w += (M.wt - M.w) * k; M.glad = Math.max(0, M.glad - dt * .8); M.sp = Math.max(0, M.sp - dt * 1.3); M.shake = Math.max(0, M.shake - dt);
    if (!playing && !B && !M.hold && !M.go) { M.ot = Math.max(0, M.ot - dt); } M.mic += (M.micT - M.mic) * k;
    // face: the current mood decides lids, brows, mouth curve and pupils; blinking is a lid, so every mood blinks in its own way
    M.mood.t = Math.max(0, M.mood.t - dt); M.nb -= dt; if (M.nb < 0) { M.bl = 1; M.nb = Math.random() < .2 ? .3 : R(2, 5); } M.bl = Math.max(0, M.bl - dt * 7);
    const hx = M.x, hy = M.y - BH * .55, tg = M.tgt || (mx >= 0 ? { x: mx, y: my } : null); const lx = tg ? cl((tg.x - hx) / 180, -1, 1) * M.face : 0, ly = tg ? cl((tg.y - hy) / 180, -1, 1) : 0; M.lx += (lx - M.lx) * k; M.ly += (ly - M.ly) * k;
    const F = faceTarget(); for (const key in F) FS[key] += (F[key] - FS[key]) * Math.min(1, dt * 7);
    const cover = cl(FS.cover + Math.sin(M.bl * Math.PI) * (1 - FS.cover), 0, 1), ew = 1 + M.wide * .25;
    E.el.setAttribute('transform', `translate(34 46)scale(${ew})`); E.er.setAttribute('transform', `translate(66 46)scale(${ew})`);
    lids.forEach((l, i) => { l.setAttribute('height', (3.5 + cover * 27).toFixed(1)); l.setAttribute('transform', `rotate(${((i ? -1 : 1) * FS.tilt).toFixed(1)})`); }); los.forEach((l) => l.setAttribute('ry', (FS.low * 14).toFixed(1)));
    pps.forEach((p, i) => { const sw = M.dizzy > 0 ? 2.5 : 0; p.setAttribute('rx', (4.9 * FS.pup).toFixed(2)); p.setAttribute('ry', (7 * FS.pup).toFixed(2)); p.setAttribute('cx', (M.lx * 3.6 + Math.cos(t * 9 + i * 2) * sw).toFixed(2)); p.setAttribute('cy', (M.ly * 4 + Math.sin(t * 9 + i * 2) * sw).toFixed(2)); });
    E.brs.setAttribute('opacity', cl(Math.abs(FS.brow) * 1.1 + Math.abs(FS.bt) / 22, 0, 1).toFixed(2)); E.bl.setAttribute('transform', `translate(0 ${(-FS.brow * 5).toFixed(2)})rotate(${FS.bt.toFixed(1)} 34 29)`); E.br.setAttribute('transform', `translate(0 ${(-FS.brow * 5).toFixed(2)})rotate(${(-FS.bt).toFixed(1)} 66 29)`);
    const mo = M.sleep ? .08 + Math.max(0, Math.sin(t * 1.4)) * .06 : M.o, md2 = mouthD(mo, M.w, FS.smile); E.mo.setAttribute('d', md2); E.mo2.setAttribute('d', md2); E.tg.setAttribute('opacity', (mo > .3 ? cl((mo - .3) * 2.2, 0, 1) : 0).toFixed(2)); E.tg.setAttribute('cy', (80 + mo * 8).toFixed(1));
    // arms + mic
    const sw = Math.sin(t * 1.7) * 2.5, A = (m, ln, hd, px, w, l2) => { m.a += (m.ta - m.a) * k; m.l += (m.tl - m.l) * k; const a = ((m.a + sw * w) * Math.PI) / 180, x = px + Math.cos(a) * m.l, y = 68 + Math.sin(a) * m.l; ln.setAttribute('x1', px); ln.setAttribute('y1', 68); ln.setAttribute('x2', x); ln.setAttribute('y2', y); l2.setAttribute('x1', px - 2); l2.setAttribute('y1', 66); l2.setAttribute('x2', x - 2); l2.setAttribute('y2', y - 2); hd.setAttribute('cx', x); hd.setAttribute('cy', y); return [x, y]; };
    A(M.L, E.al, E.hl, 12, 1, E.al2); const [hxr, hyr] = A(M.Rm, E.ar, E.hr, 88, -1, E.ar2);
    E.mc.setAttribute('transform', `translate(${hxr} ${hyr})rotate(-36)scale(${M.mic})`); E.mc.style.display = M.mic > .03 ? '' : 'none'; E.fg.style.display = M.fing ? '' : 'none'; if (M.fing) E.fg.setAttribute('transform', `translate(${hxr} ${hyr})`);
    E.an.setAttribute('transform', `rotate(${Math.sin(t * 3) * 5 + lv * 14 + (M.sleep ? 14 : 0)} 34 12)`); E.bu.setAttribute('opacity', M.sleep ? .15 : playing ? .35 + lv : .55 + Math.sin(t * 2) * .35);
    // body
    const walk = !!M.go, hop = walk ? Math.abs(Math.sin(M.ph)) * 5 : M.dance || M.run ? Math.abs(Math.sin(t * 9)) * (4 + 10 * (playing ? Math.max(.3, lv) : .7)) : 0, bob = hop + (playing ? lv * 3 : Math.sin(t * (M.sleep ? 1.2 : 2)) * (M.sleep ? 1.6 : .8)) + (M.sit && !walk ? 4 : 0) + (M.sleep ? 5 : 0), fx = Math.cos((1 - M.sp) * TAU);
    E.bd.setAttribute('transform', `rotate(${M.rot} 50 84)translate(50 118)scale(${M.face * (M.sp ? fx : 1) * sc * pop} ${sc * pop * (1 + (walk ? Math.sin(M.ph * 2) * .03 : Math.sin(t * 2) * .012))})translate(-50 -118)translate(0 ${-bob})`);
    const sw2 = walk ? Math.sin(M.ph) * 4 : M.mode === 'held' || M.struggle || M.run ? Math.sin(t * 24) * 7 : M.sit ? Math.sin(t * 3) * 2 : 0; E.fl.setAttribute('cy', 113 + sw2); E.fr.setAttribute('cy', 113 - sw2); E.sh.setAttribute('opacity', .5 * sc);
    const jx = (M.eff ? Math.sin(t * 55) * 1.4 * M.eff : raging ? Math.sin(t * 40) * 2 : 0) + (M.shake > 0 ? Math.sin(t * 50) * 1.3 : 0), mk = Math.round(Math.min(1.5, M.mad) * 20), key = mk * 100 + Math.round(M.mon * 10) * 10 + Math.round(M.pet * 5);
    if (key !== lastF) { lastF = key; const v = mk / 20; btn.style.filter = v > .02 || M.mon > .3 ? `hue-rotate(${-24 * v}deg) saturate(${1 + 1.5 * v}) brightness(${1 + .1 * v})${M.mon > .3 ? ' drop-shadow(0 0 12px rgba(255,70,40,.85))' : ''}` : ''; btn.style.setProperty('--bl', (.35 + .5 * M.pet + .25 * Math.min(1, M.mad)).toFixed(2)); E.mn.setAttribute('opacity', M.mon.toFixed(2)); }
    const big = 1 + .28 * M.mon; btn.style.transform = `translate3d(${M.x - size / 2 + jx}px,${M.y - 0.943 * size}px,0)scale(${(1 + M.sq * .18) * big},${(1 - M.sq * .28) * big})`;
    if (B && Math.hypot(B.px - M.x, B.py - M.y) > 8) place();
  }

  /* ── wiring ── */
  const wake = (quiet) => { if (!M.sleep) return; M.sleep = 0; hide(); mood('surprised', 1.4); M.sq = .6; M.nod = 0; if (!quiet) queue.unshift({ k: 'wake' }); interrupt(); };   // touching it wakes it at once, face included
  const activity = () => { idleAt = performance.now(); wake(); };
  const grab = () => { wake(true); interrupt(); M.go = null; M.jp = null; M.dc = null; M.grip = null; M.mode = 'held'; M.micT = 0; M.peak = 0; M.petting = 0; btn.classList.add('held'); setTimeout(() => { if (M.mode === 'held') { show(L('scared'), 'shout'); tt.textContent = B.text; gg.textContent = ''; speechUntil = performance.now() + 2600; } }, 90); };
  let pt = 0;
  on(btn, 'pointerdown', (e) => { e.preventDefault(); btn.setPointerCapture(e.pointerId); drag = { id: e.pointerId, x: e.clientX, y: e.clientY, px: e.clientX, py: e.clientY, t0: performance.now(), moved: false, pet: false, hist: [], shake: 0 }; activity(); clearTimeout(pt); pt = setTimeout(() => { if (drag && !drag.moved && !tourOn) { drag.pet = true; M.petting = 1; } }, 520); });   // hold still = gentle petting
  on(btn, 'pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return; const now = performance.now(), d = Math.hypot(e.clientX - drag.x, e.clientY - drag.y);
    if (!drag.moved) {
      const b = btn.getBoundingClientRect(), inside = e.clientX > b.left && e.clientX < b.right && e.clientY > b.top && e.clientY < b.bottom;
      if (d > 14 && (now - drag.t0 < 320 || !inside || d > size * 1.1)) { drag.moved = true; clearTimeout(pt); M.petting = 0; grab(); }          // quick or far = pick it up
      else if (d > 3 && !tourOn) { drag.pet = true; M.petting = 1; M.pet = Math.min(1, M.pet + .01); }                                          // slow strokes on the body = petting
    }
    if (drag.moved) {
      drag.hist.push([now, e.clientX, e.clientY]); drag.hist = drag.hist.filter((h) => now - h[0] < 90); M.hx = e.clientX; M.hy = e.clientY;
      const dtm = Math.max(8, now - (drag.lt || now - 16)), vx = ((e.clientX - (drag.lx ?? e.clientX)) / dtm) * 1000, vy = ((e.clientY - (drag.ly ?? e.clientY)) / dtm) * 1000;
      if (drag.lvx !== undefined && vx * drag.lvx + vy * drag.lvy < 0 && Math.hypot(vx, vy) > 450) drag.shake++;          // direction keeps flipping fast = being shaken
      drag.lvx = vx; drag.lvy = vy; drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = now;
      if (drag.shake >= 6) { drag.shake = 0; M.dizzy = 3.5; blurt(pick(['stop shaking!! i’m dizzy…', 'ohhh the room is spinning', 'not the shaking! not the shaking!']), 'shout', 1800); }
    }
  });
  const drop = (e, cancel) => {
    if (!drag || e.pointerId !== drag.id) return; const d = drag; drag = null; clearTimeout(pt); M.petting = 0; btn.classList.remove('held');
    if (!d.moved) {
      if (!cancel && !d.pet && !tourOn && !raging) { const now = performance.now(), gap = now - lastTapAt, hard = gap < 750; lastTapAt = now; M.mad = Math.min(1.7, M.mad + (hard ? .3 : gap < 1800 ? .14 : .05)); queue.push(M.mad >= 1 ? { k: 'tantrum' } : { k: 'tap', hard }); interrupt(); }   // rapid taps hurt; too many and it snaps
      return;
    }
    const h = d.hist; let vx = 0, vy = 0; if (h.length > 1) { const a = h[0], b = h[h.length - 1], dt = (b[0] - a[0]) / 1000 || 1; vx = (b[1] - a[1]) / dt; vy = (b[2] - a[2]) / dt; }
    const rc = $('#record')?.getBoundingClientRect(), cx = rc ? rc.left + rc.width / 2 : -1e4, cy = rc ? rc.top + rc.height / 2 : -1e4, rr = Math.hypot(M.x - cx, M.y - BH * .5 - cy);
    hide(); if (rc && rr < rc.width * .44) { M.dc = mkDisc(cx, cy, rc.width * .44, Math.atan2(M.y - BH * .5 - cy, M.x - cx), rr); M.mode = 'disc'; }
    else { M.vx = cl(vx, -1600, 1600); M.vy = cl(vy, -1600, 1600); M.vr = M.vx * .3; M.peak = 0; M.mode = 'fall'; }
  };
  on(btn, 'pointerup', (e) => drop(e, false)); on(btn, 'pointercancel', (e) => drop(e, true));
  on(btn, 'click', (e) => { if (e.detail === 0 && !tourOn) { queue.push({ k: 'tap' }); interrupt(); } });
  on(document, 'pointerdown', (e) => { activity(); if (curious && e.target.closest && e.target.closest('#deckFit')) interrupt(); if (e.target.closest && e.target.closest('.stm,.mchip,button,[role],a,#deckFit') || tourOn || reduce || performance.now() < pokeAt || Math.random() > .3) return; pokeAt = performance.now() + 14000; queue.push({ k: 'poke', x: e.clientX, y: e.clientY }); interrupt(); }, { capture: true });
  on(window, 'pointermove', (e) => { if (e.pointerType === 'mouse') { mx = e.clientX; my = e.clientY; } idleAt = performance.now(); if (M.sleep) activity(); });
  on(window, 'keydown', () => { activity(); if (curious) interrupt(); }); on(window, 'scroll', activity, { passive: true });
  let rt = 0; on(window, 'resize', () => { clearTimeout(rt); rt = setTimeout(() => { measure(); if (M.mode === 'walk' && !op && !raging && !curious && (hit(M.x, M.y, rects()) || !inV(M.x, M.y))) { const s = spots(rects()); if (s.length) { const p = pick(s); M.x = p.x; M.y = p.y; interrupt(); } } }, 160); });
  const settle = setInterval(() => { if (!M.go && !M.sleep && M.mode === 'walk' && !tourOn && !curious && !op && !raging && !M.grip && hit(M.x, M.y, rects())) { const s = spots(rects()); if (s.length) { queue.unshift({ k: 'move', ...pick(s) }); interrupt(); } } }, 800);
  const watch = setInterval(() => {       // watchdog: no mode, flag or loop can stay stuck
    const now = performance.now(); if (M.mode !== wLast) { wLast = M.mode; wSince = now; }
    if (M.mode === 'held' && !drag) { M.mode = 'fall'; M.vx = M.vy = 0; }
    if (M.mode !== 'walk' && now - wSince > (M.mode === 'disc' ? 40000 : 15000)) { M.mode = 'fall'; M.dc = null; M.jp = null; M.vx = M.vy = 0; interrupt(); }
    if (M.go && now - M.go.t0 > 16000) interrupt();
    if (!op && M.grip) M.grip = null; if (!op && !raging && M.eff) M.eff = 0;
    if (!tourOn && !op && !ring.hidden && now - ringAt > 15000) ring.hidden = true;
    if (!drag && M.petting) M.petting = 0; if (!playing && M.micT && !M.hold && !tourOn) M.micT = 0;
    if (M.fing && now - fingAt > 9000) M.fing = 0; if (M.sleep && M.mode !== 'walk') M.sleep = 0;
    if (!M.sleep && !tourOn && M.mode === 'walk' && now - lastTick > 80000) interrupt();
  }, 1000);

  measure(); const sp = spots(rects()), home = sp.find((s) => s.kind === 'home'), s0 = (home && Math.random() < .5 ? home : pick(sp.filter((s) => s.kind !== 'home')) || home) || { x: innerWidth / 2, y: innerHeight - 12 };
  M.x = s0.x; M.y = s0.y; M.sit = s0.kind === 'edge' ? 1 : 0; btn.classList.add('on'); requestAnimationFrame(frame); setTimeout(loop, reduce ? 300 : 1100);
  if (location.search.includes('debug')) window.__static = { M, get pr() { return pr; }, setIdle: (ms) => { idleAt = performance.now() - ms; interrupt(); }, get raging() { return raging; }, get op() { return op; }, get curious() { return curious; }, queue, interrupt, chip, get tourOn() { return tourOn; }, get bub() { return B; }, rects, spots, say, get playing() { return playing; }, hit, BW: () => BW, BH: () => BH };
  return () => { mq.remove(); chip.remove(); D.el?.remove(); alive = false; interrupt(); ac.abort(); clearInterval(settle); clearInterval(watch); clearTimeout(ht); btn.remove(); bub.remove(); ring.remove(); };
}
