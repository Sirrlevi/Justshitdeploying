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
  easter: ['secret move unlocked. never saw that.', 'the groove has chosen me.', '…did you see that? no? good.', 'one tiny victory dance. carry on.'],
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
<filter id="sbl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.8"/></filter></defs>
<ellipse class="sh" cx="50" cy="118" rx="32" ry="5.5" fill="#000" opacity=".5" filter="url(#sbl)"/>
<ellipse class="fl" cx="35" cy="113" rx="12" ry="6.5" fill="url(#sh2)"/><ellipse class="fr" cx="65" cy="113" rx="12" ry="6.5" fill="url(#sh2)"/>
<g class="bd"><path class="an" d="M34 14Q26-2 22-9" stroke="#8a7352" stroke-width="3" fill="none" stroke-linecap="round"/><circle class="bu" cx="22" cy="-10" r="5" fill="url(#se)"/>
<path d="M50 7C83 7 99 34 99 66C99 98 80 114 50 114C20 114 1 98 1 66C1 34 17 7 50 7Z" fill="url(#sb)"/><path d="M50 7C83 7 99 34 99 66C99 98 80 114 50 114C20 114 1 98 1 66C1 34 17 7 50 7Z" fill="url(#ss)"/>
<path d="M87 30C97 48 98 74 88 94" stroke="${BR}" stroke-opacity=".6" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="34" cy="22" rx="17" ry="7" fill="#fff" opacity=".3" transform="rotate(-26 34 22)" filter="url(#sbl)"/>
<ellipse cx="22" cy="68" rx="6.5" ry="4" fill="#e59a78" style="opacity:var(--bl,.35)"/><ellipse cx="78" cy="68" rx="6.5" ry="4" fill="#e59a78" style="opacity:var(--bl,.35)"/>
<circle cx="50" cy="97" r="11" fill="url(#se)" stroke="#6e5530"/><circle cx="50" cy="97" r="3.4" fill="#2a1d12"/><circle cx="46" cy="92.5" r="1.8" fill="#fff" opacity=".7"/>
${['el', 'er'].map((c) => `<g class="${c}"><ellipse rx="10" ry="13" fill="url(#se)" stroke="#6e5530"/><ellipse class="pp" rx="4.8" ry="6.8" fill="#24180e"/><circle cx="-3" cy="-4.5" r="2.2" fill="#fff" opacity=".92"/><circle cx="2.6" cy="3" r="1" fill="#fff" opacity=".6"/></g>`).join('')}
<path class="ebl" d="M24 29Q34 24 44 29" fill="none" stroke="#d9b47a" stroke-width="3" stroke-linecap="round" opacity=".76"/><path class="ebr" d="M56 29Q66 24 76 29" fill="none" stroke="#d9b47a" stroke-width="3" stroke-linecap="round" opacity=".76"/>
<path class="mo" fill="${INK}" stroke="${BR}" stroke-width="1.4" stroke-linejoin="round"/>
<g class="mn" opacity="0"><path d="M17 22L7-4L35 12Z" fill="#eadcb4" stroke="#5a4730" stroke-width="1.5"/><path d="M83 22L93-4L65 12Z" fill="#eadcb4" stroke="#5a4730" stroke-width="1.5"/><path d="M20 30L45 41M80 30L55 41" stroke="#1d140e" stroke-width="6" stroke-linecap="round"/><path d="M39 79h5l-2.5 9zM56 79h5l-2.5 9z" fill="#fff"/></g>
<line class="al" stroke="#4e4136" stroke-width="11" stroke-linecap="round"/><line class="al2" stroke="#9a8570" stroke-width="3.6" stroke-linecap="round" opacity=".55"/><circle class="hl" r="8" fill="url(#sh2)" stroke="${BR}" stroke-width="1.5"/>
<g class="mc"><rect x="-3" y="-3" width="6" height="19" rx="3" fill="#8a6f45"/><circle cy="-11" r="8" fill="url(#se)" stroke="#7a5f36" stroke-width="1.2"/><path d="M-6-11H6M-5.4-8H5.4M-5.4-14H5.4" stroke="#7a5f36"/></g>
<line class="ar" stroke="#4e4136" stroke-width="11" stroke-linecap="round"/><line class="ar2" stroke="#9a8570" stroke-width="3.6" stroke-linecap="round" opacity=".55"/><circle class="hr" r="8" fill="url(#sh2)" stroke="${BR}" stroke-width="1.5"/>
<g class="fg" style="display:none"><rect x="-2.8" y="-19" width="5.6" height="17" rx="2.8" fill="url(#sh2)" stroke="${BR}" stroke-width="1.1"/><circle cx="-6.5" cy="-3" r="3.8" fill="url(#sh2)" stroke="${BR}" stroke-width="1"/><circle cx="6.5" cy="-3" r="3.8" fill="url(#sh2)" stroke="${BR}" stroke-width="1"/></g></g>
<g class="bi" style="display:none"><text font-size="13" text-anchor="middle">🐤</text><text font-size="13" text-anchor="middle">🐤</text><text font-size="13" text-anchor="middle">🐤</text></g></svg>`;
const mouthD = (o, w) => { const hw = 6 + w * 7, y = 78; return `M${50 - hw} ${y}Q50 ${y - 1 - o * 2} ${50 + hw} ${y}Q50 ${y + (2 + o * 15) * 1.35} ${50 - hw} ${y}Z`; };
const visemeOf = (c) => ('aeiy'.includes(c) ? [.85, .9] : 'ou'.includes(c) ? [.8, .1] : /[a-z]/.test(c) ? [.3, .5] : [.04, .5]);
const star = (cx, cy, rx, ry, st) => { let p = ''; for (let i = 0; i < 24; i++) { const a = (i / 24) * TAU, k = i % 2 ? 1 : 1.16; p += `${cx + Math.cos(a) * rx * k},${cy + Math.sin(a) * ry * k} `; } return `<polygon points="${p}" ${st}/>`; };

export function initMascot(S, audio, api) {
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const readPref = (key, fallback = '') => { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } };
  const writePref = (key, value) => { try { localStorage.setItem(key, value); } catch { /* local-only preference storage may be unavailable */ } };
  let reduce = motionQuery.matches || readPref('thinking.reduceMotion') === '1';
  let quietMode = readPref('thinking.quiet') === '1';
  let hiddenByUser = readPref('thinking.hidden') === '1';
  const ac = new AbortController();
  const on = (t, e, f, o) => t.addEventListener(e, f, { signal: ac.signal, ...o });
  const btn = Object.assign(document.createElement('button'), { className: 'stm', type: 'button', innerHTML: SVG });
  btn.setAttribute('aria-label', '@Thinking. Tap to interact, drag to carry, or press and hold for settings.');
  btn.setAttribute('aria-description', 'Hold for mascot settings and guide options.');
  if (hiddenByUser) { btn.classList.add('user-hidden'); btn.setAttribute('aria-hidden', 'true'); btn.tabIndex = -1; }
  const bub = Object.assign(document.createElement('div'), { className: 'mbub', hidden: true, innerHTML: '<svg></svg><div class="mtx"><b></b><i></i></div>' });
  bub.setAttribute('role', 'status');
  const ring = Object.assign(document.createElement('div'), { className: 'mring', hidden: true });
  const launcher = Object.assign(document.createElement('button'), { className: 'mrestore', type: 'button', textContent: 'show @Thinking', hidden: !hiddenByUser });
  launcher.setAttribute('aria-label', 'Show @Thinking mascot');
  document.body.append(ring, bub, btn, launcher);
  const q = (c) => btn.querySelector('.' + c), E = Object.fromEntries('bd sh fl fr an bu el er ebl ebr mo al al2 hl ar ar2 hr mc bi fg mn'.split(' ').map((c) => [c, q(c)]));
  btn.classList.toggle('motion-reduced', reduce);
  document.documentElement.classList.toggle('thinking-reduced-motion', reduce);
  const pps = btn.querySelectorAll('.pp'), bsvg = bub.querySelector('svg'), tt = bub.querySelector('b'), gg = bub.querySelector('i');
  let size = 72, BW = 29, BH = 63, gen = 0, alive = true, playing = false, idleAt = performance.now(), T0 = 0, B = null, ht = 0, bubbleSeq = 0, speechBusy = false, queue = [], lastIdx = S.rec.index, tapN = 0, welcomed = false, mx = -1, my = -1, actionState = 'boot', lastBeatAt = 0, lastLevel = 0, hoverTarget = null, lastHoverReact = 0, lastEggAt = 0;
  const M = { mad: 0, pet: 0, petting: 0, eff: 0, grip: null, fing: 0, mon: 0, mode: 'walk', vx: 0, vy: 0, vr: 0, rot: 0, sq: 0, peak: 0, dizzy: 0, wide: 0, hx: 0, hy: 0, jp: null, dc: null, dance: 0, struggle: 0, sway: 0, run: 0, x: 0, y: 0, face: 1, pop: 0, ph: 0, mic: 0, micT: 0, o: 0, ot: 0, w: .5, wt: .5, lx: 0, ly: 0, nb: 2, bl: 0, sleep: 0, sit: 0, sp: 0, glad: 0, go: null, tgt: null, hold: 0,
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
    rs.forEach((r) => [.2, .5, .8].forEach((f) => add(r.l + (r.r - r.l) * f, r.t, r.n === 'deck' ? 'perch' : 'edge')));
    for (let i = 0; i < 14; i++) add(R(BW + 8, innerWidth - BW - 8), R(BH + 8, innerHeight - 8), 'floor');
    const sc = $('#scene')?.getBoundingClientRect(); if (sc) add(sc.left + sc.width / 2, sc.top + sc.height * .115, 'home');   // where the old title used to be
    return out;
  }
  const goTo = (p, g, jump) => { const path = plan({ x: M.x, y: M.y }, p, rects()); if (!path) return jump ? hop(p.x, p.y, g, 700 + Math.hypot(p.x - M.x, p.y - M.y) * .8) : Promise.reject('x'); return new Promise((res, rej) => { M.go = { path, i: 1, res, rej, g }; }); };   // no walkable way (e.g. the deck spans the phone): hop over it

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
    if (!B) return;
    // Re-measure after rotation/resizing because a narrower viewport changes text wrapping.
    const kind = B.kind, m = 26, textBox = bub.querySelector('.mtx'), w = textBox.offsetWidth, h = textBox.offsetHeight;
    B.w = w; B.h = h;
    // Place the complete SVG bubble, including its decorative margin, inside the viewport.
    const outer = bestSpot(w + 2 * m, h + 2 * m, kind === 'think' ? 46 : 18);
    const p = { x: outer.x + m, y: outer.y + m };
    Object.assign(B, { x: p.x, y: p.y, px: M.x, py: M.y });
    const tip = { x: cl(p.x + w / 2, M.x - BW - 7, M.x + BW + 7) - p.x + m, y: cl(p.y + h / 2, M.y - BH - 7, M.y + 7) - p.y + m };
    bsvg.setAttribute('width', w + 2 * m); bsvg.setAttribute('height', h + 2 * m); bsvg.innerHTML = shape(kind, w, h, tip); bub.style.transform = `translate(${outer.x}px,${outer.y}px)`;
  }
  function show(text, kind) {
    clearTimeout(ht); ht = 0;
    bub.hidden = false; bub.className = 'mbub ' + kind; tt.textContent = ''; gg.textContent = text;
    const b = bub.querySelector('.mtx'); B = { w: b.offsetWidth, h: b.offsetHeight, kind, text }; place();
  }
  function dismissBubble(id) {
    if (id != null && id !== bubbleSeq) return;
    clearTimeout(ht); ht = 0; bub.hidden = true; B = null; M.hold = 0; ring.hidden = true; M.tgt = null; speechBusy = false;
  }
  const hide = () => { bubbleSeq++; dismissBubble(); };
  async function say(text, kind, g, hold) {
    const id = ++bubbleSeq; speechBusy = true; clearTimeout(ht); ht = 0; show(text, kind);
    try {
      if (text === '…') {
        tt.innerHTML = '<span class="dd"><i></i><i></i><i></i></span>'; gg.textContent = '';
        await wait(Math.max(hold ?? 0, 1500), g); dismissBubble(id); return;
      }
      for (let i = 1; i <= text.length; i++) {
        tt.textContent = text.slice(0, i); gg.textContent = text.slice(i);
        [M.ot, M.wt] = visemeOf(text[i - 1].toLowerCase());
        const c = text[i - 1];
        await wait(/[.!?…]/.test(c) ? 240 : /[,;:—]/.test(c) ? 160 : c === ' ' ? 24 : 48, g);
      }
      M.ot = .05;
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      const readingPause = Math.max(1600, words * 220, text.length * 24);
      await wait(Math.max(hold ?? 0, readingPause), g); dismissBubble(id);
    } catch (err) {
      dismissBubble(id); throw err;
    }
  }
  function blurt(text, kind = 'say', ms = 1500) {
    // A physical reaction may happen while a line is being read. Never replace that line mid-sentence.
    if (speechBusy || (!bub.hidden && B)) return;
    const id = ++bubbleSeq; speechBusy = true; show(text, kind); tt.textContent = text; gg.textContent = '';
    ht = setTimeout(() => dismissBubble(id), Math.max(ms, 1500));
  }

  /* ── behaviours ── */
  const notes = () => { if (reduce || quietMode || hiddenByUser) return; const e = Object.assign(document.createElement('span'), { className: 'mn', textContent: pick(['♪', '♫']) }); const r = E.hr.getBoundingClientRect(); e.style.cssText = `left:${r.left + R(-10, 14)}px;top:${r.top - 10}px;--dx:${R(-22, 22)}px;--r:${R(-25, 25)}deg`; document.body.append(e); e.onanimationend = () => e.remove(); };
  const hearts = () => { if (reduce || quietMode || hiddenByUser) return; const e = Object.assign(document.createElement('span'), { className: 'mn mh', textContent: '♥' }), r = btn.getBoundingClientRect(); e.style.cssText = `left:${r.left + R(r.width * .2, r.width * .8)}px;top:${r.top + 4}px;--dx:${R(-18, 18)}px;--r:${R(-20, 20)}deg`; document.body.append(e); e.onanimationend = () => e.remove(); };
  async function perform(g) {
    M.micT = 0; let first = true, moved = true;
    while (playing) {
      const mv = reduce ? 'rest' : first && Math.random() < .5 ? 'mic' : !moved && Math.random() < .8 ? pick(['strut', 'jump', 'groove', 'strut']) : pick(['mic', 'dance', 'dance', 'strut', 'jump', 'spin', 'bang', 'groove']); first = false; moved = mv === 'strut' || mv === 'jump' || mv === 'groove';   // never parked in one spot for long
      if (mv === 'rest') { M.micT = 0; M.dance = 0; await wait(1000, g); }
      else if (mv === 'mic') { M.micT = 1; arms([-40, 24], [138, 30]); M.sway = 1; for (let i = 0, n = 4 + ((R(0, 5)) | 0); playing && i < n; i++) { arms([-50 + Math.sin(performance.now() / 380) * 22, 24], null); if (Math.random() < .55) notes(); await wait(520, g); } M.sway = 0; M.micT = 0; }
      else if (mv === 'dance') { M.dance = pick([1, 2, 3]); await wait(R(2500, 4800), g); M.dance = 0; }
      else if (mv === 'bang') { M.dance = 4; await wait(R(2600, 4200), g); M.dance = 0; }
      else if (mv === 'spin') { M.dance = 1; for (let i = 0; i < 3 && playing; i++) { M.sp = 1; await wait(950, g); } M.dance = 0; }
      else if (mv === 'jump') { for (let i = 0; i < 3 && playing; i++) { const x = cl(M.x + R(-90, 90), BW + 8, innerWidth - BW - 8); await hop(hit(x, M.y, rects()) ? M.x : x, M.y, g, 520); } }
      else { if (mv === 'groove') { M.micT = 1; arms(null, [138, 30]); } else M.dance = 3; const sp = spots(rects()); if (sp.length) await goTo(pick(sp), g); M.dance = 0; M.micT = 0; }
    }
    M.micT = 0;
  }
  /* ── hands-on: reach, hop, opt-in tour, record antics, physics ── */
  let tourOn = false, tourStop = false, pr = false, nextIdleAnticAt = performance.now() + 20000, pokeAt = 0, born = performance.now(), drag = null, lastHit = '', chipExp = 0, chipP = { x: -9, y: -9 };
  const PROPS = [['plant', 0, 0, 165, 250], ['books', 750, 0, 941, 290], ['headphones', 0, 960, 62, 1370], ['mug', 872, 1180, 941, 1400], ['sketchbook', 0, 1470, 165, 1672], ['oldbook', 835, 1550, 941, 1672]];
  const props = () => { const sc = $('#scene')?.getBoundingClientRect(); if (!sc) return []; const u = sc.width / 941; return PROPS.map(([n, l, t, r, b]) => ({ n, l: sc.left + l * u, t: sc.top + t * u, r: sc.left + r * u, b: sc.top + b * u })); };
  const nearTo = (tx, ty, w = 0) => {
    const rs = rects(), c = spots(rs), base = Math.max(BW + 7, w / 2 + BW + 6);
    for (const k of [base, base + 22, base + 44]) for (let a = 0; a < 360; a += 15) {
      const x = tx + Math.cos((a * Math.PI) / 180) * k;
      const y = ty + Math.sin((a * Math.PI) / 180) * k * .8 + BH * .5;
      if (inV(x, y) && !hit(x, y, rs)) c.push({ x, y });
    }
    c.sort((a, b) => Math.hypot(a.x - tx, a.y - BH * .5 - ty) - Math.hypot(b.x - tx, b.y - BH * .5 - ty));
    return c[0];
  };
  const nearSpot = (el) => {
    const r = el.getBoundingClientRect();
    // Aim at the nearest visible edge, not the centre of a wide text block (which causes rubber arms).
    const tx = cl(M.x, r.left + Math.min(5, r.width / 2), r.right - Math.min(5, r.width / 2));
    const cy = M.y - BH * .55;
    const ty = cl(cy, r.top + Math.min(5, r.height / 2), r.bottom - Math.min(5, r.height / 2));
    return { r, tx, ty, s: nearTo(tx, ty, 0) };
  };
  const screenToBody = (x, y) => {
    try {
      const ctm = E.bd.getScreenCTM();
      if (ctm) { const pt = btn.querySelector('svg').createSVGPoint(); pt.x = x; pt.y = y; const p = pt.matrixTransform(ctm.inverse()); return { x: p.x, y: p.y }; }
    } catch { /* use the geometric fallback on older SVG engines */ }
    const u = size / 140; return { x: 50 + ((x - M.x) / u) * M.face, y: 118 + (y - M.y) / u };
  };
  const armPoseTo = (pt, shoulderX) => {
    const p = screenToBody(pt.x, pt.y), dx = p.x - shoulderX, dy = p.y - 68;
    return [Math.atan2(dy, dx) * 180 / Math.PI, Math.hypot(dx, dy)];
  };
  const reach = (tx, ty, max = 52) => {
    const pose = armPoseTo({ x: tx, y: ty }, 88);
    arms(null, [pose[0], cl(pose[1], 18, max)]); M.tgt = { x: tx, y: ty };
  };
  const handPoint = () => {
    const r = E.hr.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const handTouches = (r, pad = 7) => {
    const h = handPoint(); return h.x >= r.left - pad && h.x <= r.right + pad && h.y >= r.top - pad && h.y <= r.bottom + pad;
  };
  const ringOn = (r) => { Object.assign(ring.style, { left: r.left - 6 + 'px', top: r.top - 6 + 'px', width: r.width + 12 + 'px', height: r.height + 12 + 'px' }); ring.hidden = false; };
  const hop = (x, y, g, ms = 650) => new Promise((res, rej) => { M.mode = 'jump'; M.jp = { x0: M.x, y0: M.y, x1: x, y1: y, t: 0, ms: reduce ? 60 : ms, res, rej, g, h: Math.min(150, 58 + Math.hypot(x - M.x, y - M.y) * .14) }; });
  const until = async (f, g) => { while (!f()) await wait(120, g); };
  const chip = Object.assign(document.createElement('div'), { className: 'mchip', hidden: true }); document.body.append(chip);
  const hideChip = () => { chip.hidden = true; chipExp = 0; };
  const placeChip = () => { if (chip.hidden) return; const p = bestSpot(chip.offsetWidth, chip.offsetHeight, 10); chipP = { x: M.x, y: M.y }; chip.style.transform = `translate(${p.x}px,${p.y}px)`; };
  const setChip = (text, btns, ms = 0, options = false) => {
    chip.hidden = false; chip.textContent = ''; chip.classList.toggle('options', options);
    const s = document.createElement('span'); s.textContent = text; chip.append(s);
    btns.forEach(([t, f]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.setAttribute('aria-label', t); b.onclick = (e) => { e.stopPropagation(); f(); }; chip.append(b); });
    chipExp = ms ? performance.now() + ms : 0; placeChip();
  };
  const offer = () => {
    if (guideChoice || !chip.hidden) return;
    setChip('new here? want a quick tour?', [
      ['yes!', () => { saveGuideChoice('accepted'); hideChip(); queue.push({ k: 'tour' }); interrupt(); }],
      ['no thanks', () => { saveGuideChoice('rejected'); hideChip(); }]
    ]);
  };
  let raging = false, op = false, singSince = 0, lastTapAt = 0, annoy = 0, purrAt = 0, heartAt = 0, lastF = -1;
  const ease = (p) => p * p * (3 - 2 * p), lerp = (a, b, p) => a + (b - a) * p;
  function hands2(a, b) {                       // place both hands in the body's actual transformed coordinate space
    const hs = [screenToBody(a.x, a.y), screenToBody(b.x, b.y)].sort((p, q) => p.x - q.x);
    const pose = (p, px) => [Math.atan2(p.y - 68, p.x - px) * 180 / Math.PI, Math.hypot(p.x - px, p.y - 68)];
    arms(pose(hs[0], 12), pose(hs[1], 88));
  }
  /* walk up to a real control, take hold with both hands, strain for a random time (sometimes it slips and retries),
     and let the real control move while the hands move with it. The body stands NEXT to the control, never on it. */
  async function operate(el, g, o = {}) {
    const r = el.getBoundingClientRect(), tx = r.left + r.width / 2, ty = r.top + r.height / 2, rc = Math.max(9, Math.min(r.width, r.height) / 2 + 2); op = true;
    try {
      if (Math.hypot(tx - M.x, ty - (M.y - BH * .5)) > BW + rc + 8) {
        const oth = $$('#power,#volume,#lever,#trim').filter((e) => e !== el).map((e) => e.getBoundingClientRect()), own = [{ l: r.left - 3, t: r.top - 3, r: r.right + 3, b: r.bottom + 3 }];
        const obs = rects().filter((k) => k.n !== 'deck').concat(own), d = rc + BW + 4, c = [];       // never on the control itself or on text; other knobs are avoided when there is room
        const ovl = (x, y) => oth.reduce((s, q) => s + Math.max(0, Math.min(x + BW, q.right) - Math.max(x - BW, q.left)) * Math.max(0, Math.min(y, q.bottom) - Math.max(y - BH, q.top)), 0);
        for (let a = 0; a < 360; a += 15) { const x = tx + Math.cos((a * Math.PI) / 180) * d, y = ty + Math.sin((a * Math.PI) / 180) * d + BH * .5; if (inV(x, y) && !hit(x, y, obs)) c.push({ x, y, sc: ovl(x, y) * .03 + Math.hypot(x - M.x, y - M.y) * .4 }); }
        c.sort((p, q) => p.sc - q.sc);
        const st = c[0] || nearTo(tx, ty, rc * 2); if (!st) return;
        if (hit(st.x, st.y, rects())) { const w = nearTo(st.x, st.y - BH * .5, 0); if (w) await goTo(w, g, true); await hop(st.x, st.y, g, 520); } else await goTo(st, g, true);
      }
      M.face = tx >= M.x ? 1 : -1; M.grip = { x: tx, y: ty, r: rc, spin: 0 }; M.eff = o.rage ? 1 : .3; await wait(o.rage ? 90 : R(250, 650), g);
      const T = o.quick || o.rage ? R(260, 600) : pick([R(700, 1300), R(1200, 2200), R(1200, 2200), R(2400, 3600)]);
      if (T > 2300) { M.eff = 1; blurt(L('effort'), 'say', 1200); await wait(R(500, 800), g); M.eff = 0; M.grip = null; arms([-40, 24], [-40, 24]); blurt('ow. my hands.', 'say', 1000); await wait(850, g); M.grip = { x: tx, y: ty, r: rc, spin: 0 }; }
      M.eff = 1; if (!o.rage && T > 900) blurt(L('effort'), 'say', Math.min(T, 1600));
      for (const t0 = performance.now(); ;) { const p = cl((performance.now() - t0) / T, 0, 1); M.grip.spin = (o.spin || 0) * ease(p); o.progress?.(p); if (p >= 1) break; await wait(40, g); }
      o.done?.(); M.sq = o.rage ? 1 : .35; M.eff = 0; M.glad = 1; await wait(o.rage ? 100 : 380, g);
    } finally { M.grip = null; M.eff = 0; op = false; }
  }
  const STEPS = [
    ['#power', 'this is the power switch. watch me flip it!', () => ({ done: () => api.setMotor(true) })],
    ['#lever', 'now the needle. i’ll pull this lever to drop it.', () => ({ done: () => api.autoCue() })],
    ['#volume', 'turn this knob for volume. like so…', () => { const v0 = S.volume; return { spin: 2.4, progress: (p) => api.setVolume(p < .5 ? lerp(v0, .2, ease(p * 2)) : lerp(.2, v0, ease(p * 2 - 1))) }; }],
    ['#trim', 'this little dial fine-tunes the record speed.', () => { const v0 = S.trim; return { spin: 1.7, progress: (p) => api.setTrim(p < .5 ? lerp(v0, 1.2, ease(p * 2)) : lerp(1.2, v0, ease(p * 2 - 1))) }; }],
    ['.seek__knob', 'drag this knob to jump around the song.', () => ({ done: () => api.cueTo(S.rec.index, (S.span[S.rec.index] || 60) * .55) })],
    ['.dot:nth-child(2)', 'and tap a dot to pick another song.', () => ({ quick: true, done: () => api.skipTo((S.rec.index + 1) % S.tracks.length) })],
  ];
  async function tour(g, only) {
    const full = only == null || only < 0, list = full ? STEPS : [STEPS[only]]; tourOn = true; tourStop = false; setChip('tour on', [['stop', () => { tourStop = true; interrupt(); }]]);
    try {
      M.face = 1; arms(null, [-62, 30]); await say(full ? 'okay! follow me. i’ll show you everything.' : 'sure! watch this.', 'say', g, 1000);
      for (const [sel, text, mk] of list) {
        const el = $(sel); if (!el) continue; const n = nearSpot(el); if (!n.s) continue;
        await goTo(n.s, g, true); M.face = n.tx >= M.x ? 1 : -1; ringOn(n.r); reach(n.tx, n.ty); await say(text, 'say', g, 700);
        await operate(el, g, mk()); ring.hidden = true; arms(...REST);
      }
      if (full) saveGuideChoice('accepted');
      M.dance = 1; await say(full ? L('proud') : 'that’s that. enjoy the record.', 'say', g, 2200);
    } finally { tourOn = false; M.sway = 0; M.dance = 0; ring.hidden = true; hideChip(); }
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
      if (lv) for (let i = 0; i < 2; i++) await operate(lv, g, { rage: true, done: () => (S.arm.mode === 'down' ? api.park() : api.autoCue()) });
      if (!S.motor && S.arm.mode === 'parked') await inspect(g, true);
      await say(L('rage'), 'angry', g, 1000);
    } finally { raging = false; pr = false; if (was) { if (!S.motor || S.arm.mode !== 'down') api.autoCue(); } else { if (S.arm.mode === 'down') api.park(); if (S.motor) api.setMotor(false); } M.mad = Math.min(M.mad, .7); }
    await say(L('calm'), 'say', g, 1800);
  }
  async function annoyed(g) {      // the visitor stopped the song while it was vibing: swears, flips them off, puts the song back on itself
    annoy++; pr = true; M.mad = Math.max(M.mad, .9);
    try {
      M.face = 1; M.fing = 1; arms(null, [-78, 36]); await say(L('annoyed'), 'angry', g, 1700); M.fing = 0;
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
    if (M.petting) { M.glad = 1; if (now > purrAt) { purrAt = now + 2700; blurt(L('purr'), 'say', 1800); } if (now > heartAt) { heartAt = now + 700; hearts(); } }
    if (md === 'walk' || md === 'jump') M.rot += ((M.sway ? Math.sin(t * 5) * 10 : M.dizzy ? Math.sin(t * 7) * 9 : M.petting ? 7 * M.face : M.eff ? -M.face * 6 * M.eff + Math.sin(t * 18) * 2.5 : raging ? Math.sin(t * 22) * 4 : M.dance === 2 ? Math.sin(t * 4.5) * 14 : M.dance === 4 ? Math.sin(t * 13) * 10 : 0) - M.rot) * k * 2;
    if (M.eff) { M.ot = .2; M.wt = .12; M.glad = Math.max(M.glad, .5 * M.eff); }
    if (md === 'held') { M.x += (M.hx - M.x) * Math.min(1, dt * 18); M.y += (M.hy + BH * .95 - M.y) * Math.min(1, dt * 18); M.rot = cl((M.hx - M.x) * .9, -28, 28) + Math.sin(t * 9) * 7; M.ot = .9; M.wt = .5; arms([-150 + Math.sin(t * 17) * 40, 26], [-30 - Math.sin(t * 15) * 40, 26]); }
    else if (md === 'fall') physics(dt); else if (md === 'disc') disc(dt, t);
    else if (M.jp) { const j = M.jp; if (j.g !== gen) { M.jp = null; M.mode = 'fall'; M.vx = M.vy = 0; j.rej('x'); } else { j.t += (dt * 1000) / j.ms; const u = Math.min(1, j.t); M.x = j.x0 + (j.x1 - j.x0) * u; M.y = j.y0 + (j.y1 - j.y0) * u - Math.sin(u * Math.PI) * j.h; M.face = j.x1 >= j.x0 ? 1 : -1; if (u >= 1) { M.jp = null; M.mode = 'walk'; j.res(); } } }
    else if (M.grip) { const G = M.grip, a0 = Math.atan2(M.y - BH * .5 - G.y, M.x - G.x) + G.spin, rr = G.r * .9; hands2({ x: G.x + Math.cos(a0 - .75) * rr, y: G.y + Math.sin(a0 - .75) * rr }, { x: G.x + Math.cos(a0 + .75) * rr, y: G.y + Math.sin(a0 + .75) * rr }); }
    else if (M.dance) { const s = Math.sin(t * 9), c = Math.cos(t * 9), f = [[[-60 + s * 50, 26], [-60 - s * 50, 26]], [[-30 + s * 40, 28], [-150 - s * 40, 28]], [[-100 + c * 30, 34], [-80 - c * 30, 34]], [[-75 + s * 12, 26], [-105 - s * 12, 26]]][M.dance - 1] || [[-60, 26], [-60, 26]]; arms(...f); }
    E.bi.style.display = M.dizzy ? '' : 'none'; if (M.dizzy) E.bi.querySelectorAll('text').forEach((e, i) => { const a = t * 5 + i * 2.09; e.setAttribute('x', 50 + Math.cos(a) * 24); e.setAttribute('y', 2 + Math.sin(a) * 7); });
    if (!chip.hidden) { if (chipExp && performance.now() > chipExp) hideChip(); else if (Math.hypot(chipP.x - M.x, chipP.y - M.y) > 8) placeChip(); }
  }

  /* ── curiosity: lift the real record with both hands, inspect it, spin it, toss it, put it back ── */
  let curious = false, guideChoice = '';
  try {
    const saved = localStorage.getItem('static.guide.choice.v1');
    const legacyDone = localStorage.getItem('static.guide') === '1';
    guideChoice = saved === 'accepted' || saved === 'rejected' ? saved : legacyDone ? 'accepted' : '';
    if (!saved && legacyDone) localStorage.setItem('static.guide.choice.v1', 'accepted');
  } catch { /* storage unavailable: this visit still remembers the choice in memory */ }
  function saveGuideChoice(choice) {
    guideChoice = choice;
    writePref('static.guide.choice.v1', choice);
    if (choice === 'accepted') writePref('static.guide', '1');
  }
  function setMascotHidden(hidden) {
    hiddenByUser = !!hidden; writePref('thinking.hidden', hiddenByUser ? '1' : '0');
    btn.classList.toggle('user-hidden', hiddenByUser);
    btn.setAttribute('aria-hidden', hiddenByUser ? 'true' : 'false');
    btn.tabIndex = hiddenByUser ? -1 : 0;
    launcher.hidden = !hiddenByUser;
    hideChip(); hide();
    if (!hiddenByUser) {
      measure(); const spotsNow = spots(rects());
      if (!inV(M.x, M.y) || hit(M.x, M.y, rects())) { const safe = pick(spotsNow); if (safe) { M.x = safe.x; M.y = safe.y; M.sit = safe.kind === 'edge' ? 1 : 0; } }
      btn.classList.add('on'); idleAt = performance.now();
    }
    interrupt();
  }
  function setQuietMode(onOff) {
    quietMode = !!onOff; writePref('thinking.quiet', quietMode ? '1' : '0');
    if (quietMode) { queue = []; hide(); } else idleAt = performance.now();
    interrupt();
  }
  function setReducedMotion(onOff) {
    if (motionQuery.matches) { reduce = true; btn.classList.add('motion-reduced'); return; }
    writePref('thinking.reduceMotion', onOff ? '1' : '0'); reduce = !!onOff;
    btn.classList.toggle('motion-reduced', reduce);
    document.documentElement.classList.toggle('thinking-reduced-motion', reduce);
    if (reduce) { M.sp = 0; M.dance = 0; M.sway = 0; M.run = 0; M.vr = 0; M.rot = 0; }
    interrupt();
  }
  function showOptions() {
    // Opening settings takes priority over any idle animation or unfinished speech.
    queue = queue.filter((a) => a.k === 'land');
    hide(); interrupt(); recoverInterruptedAction();
    setChip('@Thinking · settings', [
      ['guide again', () => { saveGuideChoice('accepted'); hideChip(); queue.push({ k: 'tour' }); interrupt(); }],
      [quietMode ? 'unquiet' : 'quiet mode', () => { setQuietMode(!quietMode); showOptions(); }],
      [hiddenByUser ? 'show mascot' : 'hide mascot', () => { setMascotHidden(!hiddenByUser); }],
      [motionQuery.matches ? 'system reduced motion' : (reduce ? 'reduced motion: on' : 'reduce motion'), () => { if (motionQuery.matches) setChip('motion is limited by your device preference', [['close', () => hideChip()]], 2600, true); else { setReducedMotion(!reduce); showOptions(); } }],
      ['close', () => hideChip()]
    ], 0, true);
    setTimeout(() => chip.querySelector('button')?.focus(), 0);
  }
  on(launcher, 'click', () => setMascotHidden(false));
  on(launcher, 'keydown', (e) => { if (e.key === 'Escape') launcher.blur(); });
  on(btn, 'keydown', (e) => { if ((e.shiftKey && e.key === 'F10') || e.key === 'ContextMenu') { e.preventDefault(); if (!tourOn) showOptions(); } });
  on(chip, 'keydown', (e) => { if (e.key === 'Escape') { hideChip(); btn.focus(); } });
  on(motionQuery, 'change', () => { reduce = motionQuery.matches || readPref('thinking.reduceMotion') === '1'; btn.classList.toggle('motion-reduced', reduce); document.documentElement.classList.toggle('thinking-reduced-motion', reduce); if (reduce) { M.dance = 0; M.sp = 0; M.sway = 0; M.vr = 0; } interrupt(); });
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
  async function prod(g) {
    const el = $(pick(['.tagline', '#title', '#artist'])); if (!el || !el.offsetWidth) return;
    const n = nearSpot(el); if (!n.s) return; await goTo(n.s, g, true); M.face = n.tx >= M.x ? 1 : -1; reach(n.tx, n.ty, 52); M.tgt = { x: n.tx, y: n.ty }; await wait(620, g);
    const r = n.r, touching = handTouches(r, 8);
    if (touching) { el.classList.add('m-wob'); setTimeout(() => el.classList.remove('m-wob'), 900); await say(L('prod'), 'sly', g, 1100); }
    else { M.tgt = null; arms(...REST); await wait(250, g); }
  }
  on(bub.querySelector('.mtx'), 'click', () => { if (!tourOn && !curious) interrupt(); });   // tap a bubble to dismiss it
  async function antic(g) {
    const now = performance.now();
    const eggReady = !reduce && !quietMode && now - lastEggAt > 90000 && Math.random() < .035;
    const k = eggReady ? 'easter' : pick(reduce ? ['look', 'chat', 'yawn', 'stretch', 'hum'] : ['look', 'chat', 'chat', 'yawn', 'stretch', 'hum', 'spin', 'dance', 'dance', 'surprise', 'wave', 'shrug', 'tilt']);
    if (eggReady) lastEggAt = now;
    if (k === 'look') { M.tgt = { x: R(0, innerWidth), y: R(0, innerHeight) }; await wait(R(1200, 2400), g); M.tgt = null; }
    else if (k === 'stretch') { arms([-70, 30], [-110, 30]); await wait(1100, g); arms(...REST); }
    else if (k === 'yawn') { M.ot = 1; M.wt = .3; await wait(1300, g); M.ot = 0; }
    else if (k === 'spin' && !reduce) { M.sp = 1; await wait(900, g); }
    else if (k === 'chat') await say(L('chat'), 'say', g);
    else if (k === 'dance') { M.dance = 1; await wait(3200, g); M.dance = 0; }
    else if (k === 'surprise') { M.wide = 1; M.glad = 1; arms([-125, 30], [-55, 30]); await wait(480, g); M.wide = 0; arms(...REST); await wait(220, g); }
    else if (k === 'wave') { await say(pick(['oh, hey.', 'you still here? nice.', 'hi again.']), 'say', g, 350); for (let i = 0; i < 3; i++) { arms(null, [-122 + (i % 2 ? 22 : -8), 26]); await wait(240, g); } arms(...REST); }
    else if (k === 'shrug') { M.wide = .25; arms([-58, 25], [-124, 25]); await wait(850, g); arms(...REST); M.wide = 0; }
    else if (k === 'tilt') { M.rot = M.face * 10; M.tgt = mx >= 0 ? { x: mx, y: my } : { x: M.x + 80 * M.face, y: M.y - 60 }; await wait(650, g); M.rot = 0; M.tgt = null; await wait(180, g); }
    else if (k === 'easter') { M.wide = 1; M.glad = 1; arms([-128, 30], [-48, 30]); await wait(220, g); M.wide = 0; M.dance = 1; M.sp = 1; await wait(1150, g); M.dance = 0; arms([-55, 25], [-125, 25]); await wait(260, g); arms(...REST); await say(L('easter'), 'sly', g, 1000); }
    else if (k === 'rage') { btn.classList.add('mad'); await say(L('angry'), 'angry', g, 900); btn.classList.remove('mad'); }
    else await say(L('sing'), 'think', g, 900);
    await wait(R(900, 2200), g);
  }
  async function wander(g) {
    if (!reduce && Math.random() < .08) return prod(g);
    const rs = rects(), sp = spots(rs); if (!sp.length || reduce) { await antic(g); return; }
    const restSpots = sp.filter((s) => ['edge', 'perch', 'home'].includes(s.kind));
    const home = sp.find((s) => s.kind === 'home'), t = home && Math.random() < .2 ? home : restSpots.length && Math.random() < .58 ? pick(restSpots) : pick(sp);
    await goTo(t, g); M.sit = ['edge', 'perch', 'home'].includes(t.kind) ? 1 : 0;
    if (M.sit) { M.face = M.x < innerWidth * .5 ? 1 : -1; arms([-82, 19], [-96, 18]); await wait(R(650, 1300), g); }
    for (let i = 0, n = 1 + ((R(0, 2)) | 0); i < n; i++) await antic(g);
    if (M.sit) { arms(...REST); M.sit = 0; }
  }
  async function run(a, g) {
    if (M.sleep || a.k === 'wake') { M.sleep = 0; await say(L('wake'), 'say', g); return; }
    if (a.k === 'move') return goTo(a, g, true);
    if (a.k === 'tour') return tour(g, a.only);
    if (a.k === 'ride') return ride(g);
    if (a.k === 'inspect') return inspect(g);
    if (a.k === 'prod') return prod(g);
    if (a.k === 'tantrum') return tantrum(g);
    if (a.k === 'annoyed') return annoyed(g);
    if (a.k === 'later') return say('okay. i’m right here. tap me anytime.', 'say', g, 1400);
    if (a.k === 'tap') {
      const n = tapN++; M.glad = 1; M.sit = 0; 
      if (a.hard) { M.sq = .7; arms([-60, 28], [-60, 28]); await say(L('hurt'), 'shout', g, 1000); }
      else if (n % 4 === 1 && !playing && !reduce) { M.micT = 1; M.hold = 1; arms(null, [138, 30]); notes(); await say(L('mic'), 'think', g, 1400); M.hold = 0; M.micT = 0; }
      else { if (n % 3 === 0 && !reduce) M.sp = 1; arms([-60, 28], [-60, 28]); await say(L('tap'), 'say', g); }
    } else if (a.k === 'track') { if (playing && !reduce) { arms([-70, 28], [-70, 28]); M.sp = 1; } await say(L('track', a.title), 'say', g, 1200); }
    else if (a.k === 'end') await say(L('end'), 'say', g);
    else if (a.k === 'land') { arms([-50, 26], [-50, 26]); if (a.v > 1000) { M.dizzy = 3; await say(L('dizzy'), 'think', g, 2200); } else await say(a.n && LINES['hit_' + a.n] ? L('hit_' + a.n) : L('land'), 'say', g, 1200); }
    else if (a.k === 'poke') { const s = nearTo(a.x, a.y, 0); if (s) { await goTo(s, g, true); M.face = a.x >= M.x ? 1 : -1; reach(a.x, a.y, 50); M.tgt = { x: a.x, y: a.y }; await say(L('touch'), 'say', g, 1000); } }
  }
  async function decide(g) {
    while (M.mode !== 'walk') await wait(140, g);
    const now = performance.now(); if (!playing && !M.hold) M.micT = 0; arms(...REST); M.tgt = null; M.dance = 0; M.sway = 0; M.fing = 0;
    if (hiddenByUser) { await wait(1100, g); return; }
    if (queue.length) return run(queue.shift(), g);
    if (!welcomed) {
      welcomed = true;
      if (quietMode) return;
      arms(null, [-62, 30]); await say(L('hi'), 'say', g, 1800); if (!guideChoice) offer(); return;
    }
    if (quietMode) { await wait(1000, g); return; }
    if (!chip.hidden) { await wait(500, g); return; }
    if (!reduce && now > nextIdleAnticAt && now - idleAt > 10000 && now - born > 18000 && !M.petting) {
      // Idle antics may inspect the record, but must never change the user's switches, volume or speed.
      nextIdleAnticAt = now + R(30000, 55000);
      if (!playing && !S.motor && S.arm.mode === 'parked' && Math.random() < .32) return inspect(g);
    }
    if (playing) return perform(g);
    if (now - idleAt > 40000) { await say('…', 'think', g, 700); M.sleep = 1; show('zZz…', 'sleepy'); return wait(6e5, g); }
    return wander(g);
  }
  function recoverInterruptedAction() {
    // A cancelled interaction must never leave a stale reach, pose or movement promise behind.
    M.go = null; M.jp = null; M.grip = null; M.eff = 0; M.fing = 0; M.micT = 0; M.hold = 0;
    M.dance = 0; M.sway = 0; M.struggle = 0; M.wide = 0; M.glad = 0; M.tgt = null; M.ot = 0; M.wt = .5;
    if (M.mode === 'jump') { M.mode = 'walk'; M.vx = M.vy = M.vr = 0; M.rot = 0; }
    if (M.mode === 'walk') { M.rot = 0; M.sq = 0; M.sit = 0; }
    // Preserve user-driven physics and dragging: only reset the pose, never steal a held/falling mascot.
    arms(...REST); ring.hidden = true;
  }
  async function loop() {
    while (alive) {
      const g = ++gen;
      try { await decide(g); }
      catch (e) {
        if (e !== 'x') console.warn(e);
        hide(); btn.classList.remove('mad');
        recoverInterruptedAction();
        await new Promise((r) => setTimeout(r, 80));
      }
    }
  }

  /* ── frame: smooth everything, then write the SVG ── */
  function frame(now) {
    if (!alive) return; requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - T0) / 1000 || .016), t = now / 1000, k = 1 - Math.pow(.001, dt); T0 = now;
    const pl = !!(S.motor && S.arm.mode === 'down'); if (pl !== playing) { playing = pl; if (pl) singSince = performance.now(); if (!quietMode && !tourOn && !pr && !raging && M.mode === 'walk') { if (!pl) queue.push(singSince && performance.now() - singSince > 4000 && S.rec.pos > .6 ? { k: 'annoyed' } : { k: 'end' }); interrupt(); } }
    if (S.rec.index !== lastIdx) { lastIdx = S.rec.index; if (!quietMode && S.motor && welcomed && !tourOn && !pr) { queue.push({ k: 'track', title: S.tracks[lastIdx]?.title || 'this one' }); interrupt(); } }
    modeStep(dt, t, k);
    if (M.go) { const go = M.go; if (go.g !== gen) { M.go = null; go.rej('x'); } else { const p = go.path[go.i], dx = p.x - M.x, dy = p.y - M.y, d = Math.hypot(dx, dy), v = (reduce ? 400 : 210) * dt;
      if (d <= Math.max(2, v)) { M.x = p.x; M.y = p.y; if (++go.i >= go.path.length) { M.go = null; go.res(); } } else { M.x += (dx / d) * v; M.y += (dy / d) * v; if (Math.abs(dx) > 1) M.face = dx > 0 ? 1 : -1; M.ph += dt * 13; M.sit = 0; } } }
    M.pop = Math.min(1, M.pop + dt * (reduce ? 20 : 2.6)); const pop = 1 + Math.sin(M.pop * Math.PI) * .12 * (M.pop < 1), sc = M.pop < 1 ? Math.min(1, M.pop * 1.6) : 1;
    let lv = 0;
    if (playing) {
      lv = audio.level ? cl(audio.level(), 0, 1) : 0;
      // Speech owns the mouth while a bubble is being read; music only lip-syncs when there is real signal.
      if (!speechBusy) { M.ot = cl((lv - .025) * 2.15, 0, .88); M.wt = .45 + lv * .22; }
      // React to a real transient, not every animation frame: tiny shoulder bounce / note, never a control action.
      const beatNow = performance.now();
      if (!reduce && !quietMode && !tourOn && !speechBusy && lv > .24 && lv - lastLevel > .12 && beatNow - lastBeatAt > 520) {
        lastBeatAt = beatNow; M.glad = Math.max(M.glad, .28); M.sway = Math.max(M.sway, .22);
        if (lv > .48 && Math.random() < .22) notes();
      }
      lastLevel = lv;
    } else { lastLevel = 0; }
    if (M.sway > 0 && M.sway < .35) M.sway = Math.max(0, M.sway - dt * .72);
    M.o += (M.ot - M.o) * (1 - Math.pow(1e-4, dt)); M.w += (M.wt - M.w) * k; M.glad = Math.max(0, M.glad - dt * .8); M.sp = Math.max(0, M.sp - dt * 1.3);
    if ((!playing || speechBusy) && !B && !M.hold && !M.go) { M.ot = Math.max(0, M.ot - dt * 1.4); } M.mic += (M.micT - M.mic) * k;
    // eyes
    M.nb -= dt; if (M.nb < 0) { M.bl = 1; M.nb = R(2, 5); } M.bl = Math.max(0, M.bl - dt * 7);
    const hx = M.x, hy = M.y - BH * .55, activePointer = mx >= 0 && performance.now() - idleAt < 4200, tg = M.tgt || hoverTarget || (activePointer ? { x: mx, y: my } : null);
    const lx = tg ? cl((tg.x - hx) / 180, -1, 1) * M.face : Math.sin(t * .7) * .12, ly = tg ? cl((tg.y - hy) / 180, -1, 1) : Math.sin(t * .53) * .08; M.lx += (lx - M.lx) * k; M.ly += (ly - M.ly) * k;
    const es = M.sleep ? .08 : Math.max(.08, 1 - Math.sin(M.bl * Math.PI)) * (1 - M.glad * .35);
    const ew = 1 + M.wide * .25, an = 14 * Math.min(1, M.mad) + (M.mon > .5 ? 10 : 0); E.el.setAttribute('transform', `translate(34 46)rotate(${an})scale(${ew} ${es * ew})`); E.er.setAttribute('transform', `translate(66 46)rotate(${-an})scale(${ew} ${es * ew})`);
    const brow = M.sleep ? 3 : M.mad > .45 ? -8 - M.mad * 4 : M.wide > .45 ? 5 : M.glad > .6 ? -3 : Math.sin(t * .55) * .8;
    E.ebl.setAttribute('transform', `rotate(${brow} 34 29)`); E.ebr.setAttribute('transform', `rotate(${-brow} 66 29)`);
    pps.forEach((p) => { p.setAttribute('cx', M.lx * 3.6); p.setAttribute('cy', M.ly * 4); });
    E.mo.setAttribute('d', mouthD(M.sleep ? .1 : M.o, M.w));
    // arms + mic
    const sw = (M.tgt || M.grip || tourOn) ? 0 : Math.sin(t * (M.sit ? 1.05 : 1.7)) * (M.sit ? 1.1 : 2.5), A = (m, ln, hd, px, w, l2) => { m.a += (m.ta - m.a) * k; m.l += (m.tl - m.l) * k; const a = ((m.a + sw * w) * Math.PI) / 180, x = px + Math.cos(a) * m.l, y = 68 + Math.sin(a) * m.l; ln.setAttribute('x1', px); ln.setAttribute('y1', 68); ln.setAttribute('x2', x); ln.setAttribute('y2', y); l2.setAttribute('x1', px - 2); l2.setAttribute('y1', 66); l2.setAttribute('x2', x - 2); l2.setAttribute('y2', y - 2); hd.setAttribute('cx', x); hd.setAttribute('cy', y); return [x, y]; };
    A(M.L, E.al, E.hl, 12, 1, E.al2); const [hxr, hyr] = A(M.Rm, E.ar, E.hr, 88, -1, E.ar2);
    E.mc.setAttribute('transform', `translate(${hxr} ${hyr})rotate(-36)scale(${M.mic})`); E.mc.style.display = M.mic > .03 ? '' : 'none'; E.fg.style.display = M.fing ? '' : 'none'; if (M.fing) E.fg.setAttribute('transform', `translate(${hxr} ${hyr})`);
    E.an.setAttribute('transform', `rotate(${Math.sin(t * (M.sleep ? .7 : 3)) * (M.sleep ? 1.4 : 5) + lv * 14} 34 12)`); E.bu.setAttribute('opacity', playing ? .35 + lv * .35 : .48 + Math.sin(t * 1.4) * .2);
    // A small alternating gait and softer breathing keep movement from looking like a sliding sticker.
    const walk = !!M.go, gait = walk ? Math.sin(M.ph) : 0;
    const hop = reduce ? 0 : walk ? Math.abs(gait) * 4.6 : M.dance || M.run ? Math.abs(Math.sin(t * 9)) * (4 + 10 * (playing ? Math.max(.3, lv) : .7)) : 0;
    const breath = M.sleep ? Math.sin(t * .65) * 1.1 : Math.sin(t * 2) * .8;
    const bob = hop + (playing ? lv * 3 : breath) + (M.sit && !walk ? 5.5 : 0), fx = Math.cos((1 - M.sp) * TAU);
    E.bd.setAttribute('transform', `rotate(${M.rot + (walk ? gait * 3.2 : 0)} 50 84)translate(50 118)scale(${M.face * (M.sp ? fx : 1) * sc * pop} ${sc * pop * (1 + (walk ? Math.sin(M.ph * 2) * .03 : Math.sin(t * (M.sleep ? .65 : 2)) * .012))})translate(-50 -118)translate(0 ${-bob})`);
    const sw2 = walk ? gait * 4.5 : M.mode === 'held' || M.struggle || M.run ? Math.sin(t * 24) * 7 : M.sit ? Math.sin(t * 1.7) * .8 : 0;
    E.fl.setAttribute('cx', 35 + (walk ? gait * 1.4 : 0)); E.fr.setAttribute('cx', 65 - (walk ? gait * 1.4 : 0));
    E.fl.setAttribute('cy', 113 + sw2); E.fr.setAttribute('cy', 113 - sw2); E.sh.setAttribute('opacity', .5 * sc);
    const jx = M.eff ? Math.sin(t * 55) * 1.4 * M.eff : raging ? Math.sin(t * 40) * 2 : 0, mk = Math.round(Math.min(1.5, M.mad) * 20), key = mk * 100 + Math.round(M.mon * 10) * 10 + Math.round(M.pet * 5);
    if (key !== lastF) { lastF = key; const v = mk / 20; btn.style.filter = v > .02 || M.mon > .3 ? `hue-rotate(${-24 * v}deg) saturate(${1 + 1.5 * v}) brightness(${1 + .1 * v})${M.mon > .3 ? ' drop-shadow(0 0 12px rgba(255,70,40,.85))' : ''}` : ''; btn.style.setProperty('--bl', (.35 + .5 * M.pet + .25 * Math.min(1, M.mad)).toFixed(2)); E.mn.setAttribute('opacity', M.mon.toFixed(2)); }
    const big = 1 + .28 * M.mon; btn.style.transform = `translate3d(${M.x - size / 2 + jx}px,${M.y - 0.943 * size}px,0)scale(${(1 + M.sq * .18) * big},${(1 - M.sq * .28) * big})`;
    syncActionState();
    if (B && Math.hypot(B.px - M.x, B.py - M.y) > 8) place();
  }

  /* ── one authoritative interaction state for diagnostics and styling ── */
  function syncActionState() {
    const next = hiddenByUser ? 'hidden' : M.mode === 'held' ? 'held' : (M.mode === 'fall' || M.mode === 'disc') ? 'tumbling' : M.sleep ? 'sleeping' : tourOn ? 'guiding' : curious ? 'curious' : (op || M.grip) ? 'reaching' : (M.go || M.jp) ? 'moving' : M.dance ? 'dancing' : speechBusy ? 'speaking' : quietMode ? 'quiet' : 'idle';
    if (next !== actionState) { actionState = next; btn.dataset.state = next; }
  }

  /* ── wiring ── */
  const activity = () => {
    idleAt = performance.now();
    if (M.sleep) {
      M.sleep = 0; hide();
      if (!queue.some((a) => a.k === 'wake')) queue.unshift({ k: 'wake' });
      interrupt();
    }
  };
  const grab = () => { interrupt(); M.go = null; M.jp = null; M.dc = null; M.grip = null; M.mode = 'held'; M.micT = 0; M.peak = 0; M.petting = 0; btn.classList.add('held'); setTimeout(() => { if (M.mode === 'held') { show(L('scared'), 'shout'); tt.textContent = B.text; gg.textContent = ''; } }, 90); };
  let pt = 0, menuPt = 0;
  on(btn, 'pointerdown', (e) => { e.preventDefault(); btn.setPointerCapture(e.pointerId); drag = { id: e.pointerId, x: e.clientX, y: e.clientY, px: e.clientX, py: e.clientY, t0: performance.now(), moved: false, pet: false, options: false, hist: [] }; activity(); clearTimeout(pt); clearTimeout(menuPt); pt = setTimeout(() => { if (drag && !drag.moved && !tourOn) { drag.pet = true; M.petting = 1; } }, 520); menuPt = setTimeout(() => { if (drag && !drag.moved && !tourOn) { drag.options = true; M.petting = 0; hide(); showOptions(); } }, 1750); });   // hold still to pet; longer hold opens options
  on(btn, 'pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return; const now = performance.now(), d = Math.hypot(e.clientX - drag.x, e.clientY - drag.y);
    if (!drag.moved) {
      const b = btn.getBoundingClientRect(), inside = e.clientX > b.left && e.clientX < b.right && e.clientY > b.top && e.clientY < b.bottom;
      if (d > 14 && (now - drag.t0 < 320 || !inside || d > size * 1.1)) { drag.moved = true; clearTimeout(pt); M.petting = 0; grab(); }          // quick or far = pick it up
      else if (d > 3 && !tourOn) { drag.pet = true; M.petting = 1; M.pet = Math.min(1, M.pet + .01); }                                          // slow strokes on the body = petting
    }
    if (drag.moved) { drag.hist.push([now, e.clientX, e.clientY]); drag.hist = drag.hist.filter((h) => now - h[0] < 90); M.hx = e.clientX; M.hy = e.clientY; }
  });
  const drop = (e, cancel) => {
    if (!drag || e.pointerId !== drag.id) return; const d = drag; drag = null; clearTimeout(pt); clearTimeout(menuPt); M.petting = 0; btn.classList.remove('held');
    if (!d.moved) {
      hoverTarget = null; M.tgt = null;
      if (!d.options && !cancel && !d.pet && !tourOn && !raging) { const now = performance.now(), gap = now - lastTapAt, hard = gap < 750; lastTapAt = now; M.mad = Math.min(1.7, M.mad + (hard ? .3 : gap < 1800 ? .14 : .05)); queue.push(M.mad >= 1 ? { k: 'tantrum' } : { k: 'tap', hard }); interrupt(); }   // rapid taps hurt; too many and it snaps
      return;
    }
    const h = d.hist; let vx = 0, vy = 0; if (h.length > 1) { const a = h[0], b = h[h.length - 1], dt = (b[0] - a[0]) / 1000 || 1; vx = (b[1] - a[1]) / dt; vy = (b[2] - a[2]) / dt; }
    const rc = $('#record')?.getBoundingClientRect(), cx = rc ? rc.left + rc.width / 2 : -1e4, cy = rc ? rc.top + rc.height / 2 : -1e4, rr = Math.hypot(M.x - cx, M.y - BH * .5 - cy);
    hide(); if (rc && rr < rc.width * .44) { M.dc = mkDisc(cx, cy, rc.width * .44, Math.atan2(M.y - BH * .5 - cy, M.x - cx), rr); M.mode = 'disc'; }
    else { M.vx = cl(vx, -1600, 1600); M.vy = cl(vy, -1600, 1600); M.vr = M.vx * .3; M.peak = 0; M.mode = 'fall'; }
  };
  on(btn, 'pointerup', (e) => drop(e, false)); on(btn, 'pointercancel', (e) => drop(e, true));
  on(btn, 'contextmenu', (e) => { e.preventDefault(); if (!tourOn) { hide(); showOptions(); } });
  on(btn, 'click', (e) => { if (e.detail === 0 && !tourOn) { queue.push({ k: 'tap' }); interrupt(); } });
  on(document, 'pointerover', (e) => {
    const el = e.target.closest && e.target.closest('#power,#volume,#lever,#trim,.seek,.seek__knob,.dot,#record,.skip');
    if (!el || quietMode || hiddenByUser || tourOn) return;
    const r = el.getBoundingClientRect(); hoverTarget = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; M.tgt = hoverTarget;
    const now = performance.now();
    if (!reduce && now - lastHoverReact > 9000 && !speechBusy && bub.hidden && M.mode === 'walk' && !M.go && Math.random() < .22) { lastHoverReact = now; M.wide = .35; setTimeout(() => { M.wide = Math.max(0, M.wide - .35); }, 550); }
  }, { capture: true });
  on(document, 'pointerout', (e) => { const from = e.target.closest && e.target.closest('#power,#volume,#lever,#trim,.seek,.seek__knob,.dot,#record,.skip'); const to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('#power,#volume,#lever,#trim,.seek,.seek__knob,.dot,#record,.skip'); if (from && !to) { hoverTarget = null; if (!op && !tourOn && !curious && !M.grip) M.tgt = null; } }, { capture: true });
  on(document, 'pointerdown', (e) => { activity(); if (curious && e.target.closest && e.target.closest('#deckFit')) interrupt(); if (e.target.closest && e.target.closest('.stm,.mchip,.mrestore,button,[role],a,#deckFit') || tourOn || reduce || quietMode || hiddenByUser || performance.now() < pokeAt || Math.random() > .3) return; pokeAt = performance.now() + 14000; queue.push({ k: 'poke', x: e.clientX, y: e.clientY }); interrupt(); }, { capture: true });
  on(window, 'pointermove', (e) => { if (e.pointerType === 'mouse') { mx = e.clientX; my = e.clientY; } idleAt = performance.now(); if (M.sleep) activity(); });
  on(window, 'keydown', () => { activity(); if (curious) interrupt(); }); on(window, 'scroll', activity, { passive: true });
  let rt = 0; on(window, 'resize', () => { clearTimeout(rt); rt = setTimeout(() => { measure(); if (M.mode === 'walk' && !op && !raging && !curious && (hit(M.x, M.y, rects()) || !inV(M.x, M.y))) { const s = spots(rects()); if (s.length) { const p = pick(s); M.x = p.x; M.y = p.y; interrupt(); } } if (B) place(); if (!chip.hidden) placeChip(); }, 160); });
  const settle = setInterval(() => { if (!M.go && !M.sleep && M.mode === 'walk' && !tourOn && !curious && !op && !raging && !M.grip && hit(M.x, M.y, rects())) { const s = spots(rects()); if (s.length) { queue.unshift({ k: 'move', ...pick(s) }); interrupt(); } } }, 800);

  measure(); const sp = spots(rects()), home = sp.find((s) => s.kind === 'home'), s0 = (home && Math.random() < .5 ? home : pick(sp.filter((s) => s.kind !== 'home')) || home) || { x: innerWidth / 2, y: innerHeight - 12 };
  M.x = s0.x; M.y = s0.y; M.sit = s0.kind === 'edge' ? 1 : 0; btn.classList.add('on');
  if (hiddenByUser) { launcher.hidden = false; }
  requestAnimationFrame(frame); setTimeout(loop, reduce ? 300 : 1100);
  if (location.search.includes('debug')) window.__static = { M, get raging() { return raging; }, get op() { return op; }, get curious() { return curious; }, get hidden() { return hiddenByUser; }, get quiet() { return quietMode; }, get actionState() { return actionState; }, queue, interrupt, chip, showOptions, get tourOn() { return tourOn; }, get bub() { return B; }, rects, spots, say, get playing() { return playing; }, hit, BW: () => BW, BH: () => BH };
  return () => { chip.remove(); launcher.remove(); document.documentElement.classList.remove('thinking-reduced-motion'); D.el?.remove(); alive = false; interrupt(); ac.abort(); clearInterval(settle); clearTimeout(ht); clearTimeout(pt); clearTimeout(menuPt); btn.remove(); bub.remove(); ring.remove(); };
}
