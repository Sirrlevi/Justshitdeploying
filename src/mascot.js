/* Static Mk-II — a silent, tactile-feeling SVG mascot for the record deck.
   The character reads the real deck state. Guidance is opt-in; idle antics never start a tour. */
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const R = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[(Math.random() * a.length) | 0];
const cl = (v, a, b) => Math.min(b, Math.max(a, v));
const PAPER = '#f4ecd9', INK = '#21170f', BR = '#d9b47a', TAU = Math.PI * 2;

const LINES = {
  tap: [
    'excuse me. these are premium buttons.', 'ow. i have exactly one brain cell.', 'you poked me. i shall remember this for 3 seconds.',
    'arre, gudgudi!', 'i am not the play button. i am much more dramatic.', 'again? okay. but act surprised this time.',
    'that was a very human thing to do.', 'my lawyer will be hearing about this.', 'gentle hands, dj.', 'i was literally minding my business.',
    'boop received. dignity lost.', 'you found the secret button. it does absolutely nothing.', 'i have been perceived. horrifying.',
    'hmm. suspicious finger activity.', 'if you keep that up i am charging rent.'
  ],
  mic: ['♪ check. one, two. one, two.', 'mic check. emotionally ready? no.', 'i sing for free. my agent hates this.', '♪ testing, testing. dramatic pause.', 'tiny mic. enormous ego.'],
  wake: ['…huh? i was buffering.', 'i was resting my pixels.', 'back already? i saved your seat.', 'five more minutes. what do you mean it is not morning?'],
  track: ['new track. new personality.', 'oh this one has a *vibe*.', 'excellent taste. questionable sleep schedule.', 'track changed. my tiny feet approve.', 'a fresh song? say less.', 'i will pretend i picked this.'],
  end: ['…and scene.', 'encore? i am emotionally prepared.', 'the needle has left the chat.', 'quiet now. suspiciously quiet.'],
  object: {
    plant: ['asking the plant for advice. no response. relatable.', 'the plant has better emotional regulation than me.', 'photosynthesis? in this economy?'],
    books: ['very thick books. very thin attention span.', 'i can read. i choose to be mysterious.', 'researching my next tiny crime.'],
    headphones: ['i would wear these but my ears are decorative.', 'headphones: for when the world needs a mute button.', 'i am absolutely DJ-qualified. source: me.'],
    mug: ['is that coffee? i am 90% caffeine in spirit.', 'the mug is looking at me funny.', 'no sipping. i have no mouth budget.'],
    notebook: ['writing that down. in invisible ink.', 'dear diary: i have committed another small nonsense.', 'all my plans are just squiggles.'],
    deck: ['walnut finish. excellent taste, human.', 'i live here now. the rent is one song.', 'tiny feet. very expensive furniture.']
  },
  prank: ['i did not touch that. okay, tiny chance i touched that.', 'a lil remix. you are welcome. probably.', 'look away for one second and i become a sound engineer.', 'that was a calibration test. very official.', 'nothing happened. we all saw nothing.'],
  angry: ['HEY. i have three pixels left of patience. [BLEEP].', 'beep. that was my very serious warning beep.', 'i am about to write a strongly worded sticky note.', 'EXCUSE YOU. my union rep is a moth.', 'you have activated tiny menace mode. censored edition.'],
  poke: ['you tapped the void and somehow summoned me.', 'was that a secret knock? terrible security.', 'i saw that. pretending i did not.', 'the floor says hello. i speak fluent floor.', 'random screen boop detected. investigating.'],
  dance: ['this song has me acting like rent is paid.', 'my knees are imaginary but the rhythm is real.', 'i call this move the legally distinct shuffle.', 'tiny feet. industrial-strength groove.', 'one-person dance crew. membership: me.']
};

const GUIDE_STEPS = [
  { selector: '#power', name: 'motor switch', text: 'this switch wakes the platter. flip it on and the vinyl starts turning.', demo: 'motor' },
  { selector: '#platterHit', name: 'the record', text: 'tap the vinyl to toggle the motor. drag across it to spin or slow it with your finger.', demo: 'motor' },
  { selector: '#arm .arm-hit', name: 'tonearm', text: 'lift and carry the tonearm over the record, then drop the needle to hear the groove underneath.', demo: 'arm' },
  { selector: '#lever', name: 'cue lever', text: 'this little lever lifts the stylus without moving the arm sideways. tiny lever, big responsibility.', demo: 'lever' },
  { selector: '#volume', name: 'volume knob', text: 'turn this metal knob to change the volume. you can drag it or use the arrow keys.', demo: 'volume' },
  { selector: '#trim', name: 'speed trim', text: 'this dial nudges playback speed a little faster or slower. turn it back to the centre for normal speed.', demo: 'trim' },
  { selector: '#seek', name: 'progress line', text: 'drag along this line to cue a different moment in the song. the needle follows the position.' },
  { selector: '#dots .dot', name: 'track dots', text: 'these dots select a song directly. yes, i have opinions about your queue.', demo: 'track' },
  { selector: '#prevBtn', name: 'previous track', text: 'go back one track. the record moves to the matching groove.', demo: 'prev' },
  { selector: '#nextBtn', name: 'next track', text: 'skip forward. i will pretend i was the one who picked the next song.', demo: 'next' },
  { selector: '.links a', name: 'social links', text: 'the links below take you to the other corners of this internet.' }
];

function getGuideSteps() {
  return GUIDE_STEPS.flatMap((step) => {
    if (step.selector === '#dots .dot') {
      const dots = [...document.querySelectorAll('#dots .dot')];
      if (!dots.length) return [step];
      return dots.map((dot, index) => {
        const title = dot.querySelector('span')?.textContent?.trim() || `track ${index + 1}`;
        return { ...step, selector: `#dots .dot[data-index=\"${index}\"]`, name: `song: ${title}`, text: `this dot selects “${title}”. tap it whenever you want this track.`, dotIndex: index };
      });
    }
    if (step.selector === '.links a') {
      const links = [...document.querySelectorAll('.links a')];
      if (!links.length) return [step];
      return links.map((link, index) => {
        const title = link.textContent?.trim() || `link ${index + 1}`;
        return { ...step, selector: `.links a:nth-child(${index + 1})`, name: `${title} link`, text: `this opens ${title}. it will take you to a different corner of my little internet.` };
      });
    }
    return [step];
  });
}

const SVG = `<svg viewBox="-18 -18 136 150" aria-hidden="true" focusable="false">
<defs>
  <radialGradient id="stg" cx=".27" cy=".13" r="1.02"><stop offset="0" stop-color="#857360"/><stop offset=".24" stop-color="#625344"/><stop offset=".55" stop-color="#40352d"/><stop offset=".82" stop-color="#2b241f"/><stop offset="1" stop-color="#171412"/></radialGradient>
  <linearGradient id="stBevel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1d7a0" stop-opacity=".85"/><stop offset=".22" stop-color="#b68a4e" stop-opacity=".55"/><stop offset=".52" stop-color="#130f0c" stop-opacity=".25"/><stop offset=".79" stop-color="#080706" stop-opacity=".9"/><stop offset="1" stop-color="#e2bc78" stop-opacity=".35"/></linearGradient>
  <linearGradient id="stFace" x1="0" y1="0" x2=".1" y2="1"><stop offset="0" stop-color="#29231e"/><stop offset=".36" stop-color="#151311"/><stop offset=".8" stop-color="#211b16"/><stop offset="1" stop-color="#0d0b09"/></linearGradient>
  <linearGradient id="stMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2dba9"/><stop offset=".3" stop-color="#ad8751"/><stop offset=".52" stop-color="#6c4e2e"/><stop offset=".73" stop-color="#e0bd7f"/><stop offset="1" stop-color="#533b25"/></linearGradient>
  <radialGradient id="stEye" cx=".3" cy=".18" r=".9"><stop offset="0" stop-color="#fff0c9"/><stop offset=".25" stop-color="#f0cf8f"/><stop offset=".62" stop-color="#d19c50"/><stop offset="1" stop-color="#6c4926"/></radialGradient>
  <filter id="stShadow" x="-45%" y="-45%" width="190%" height="200%"><feGaussianBlur stdDeviation="3.4"/></filter>
  <filter id="stGlow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="1.5"/></filter>
</defs>
<ellipse class="sh" cx="50" cy="122" rx="31" ry="5.6" fill="#000" opacity=".62" filter="url(#stShadow)"/>
<ellipse class="fl" cx="35" cy="115" rx="11.5" ry="7" fill="#171310" stroke="#806343" stroke-width="1.7"/><ellipse class="fr" cx="65" cy="115" rx="11.5" ry="7" fill="#171310" stroke="#806343" stroke-width="1.7"/>
<g class="bd">
  <path d="M12 40Q1 34 3 47Q4 58 13 60Z" fill="#2b231d" stroke="#8c6a3f" stroke-width="2"/><path d="M88 40Q99 34 97 47Q96 58 87 60Z" fill="#2b231d" stroke="#8c6a3f" stroke-width="2"/>
  <rect x="8" y="9" width="84" height="104" rx="29" fill="#0b0908" opacity=".7" transform="translate(1.5 2.4)"/>
  <rect x="8" y="8" width="84" height="104" rx="29" fill="url(#stg)" stroke="#b58b53" stroke-width="2"/>
  <rect x="10.5" y="10.5" width="79" height="99" rx="26" fill="none" stroke="url(#stBevel)" stroke-width="2.8"/>
  <path d="M20 15Q35 7 54 11" fill="none" stroke="#fff0d7" stroke-width="2" stroke-linecap="round" opacity=".28"/>
  <path d="M14 33Q11 55 15 76" fill="none" stroke="#d7ba8d" stroke-width="1.2" stroke-linecap="round" opacity=".2"/>
  <path d="M86 31Q91 52 86 79" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" opacity=".55"/>
  <rect x="16" y="29" width="68" height="60" rx="21" fill="#070605" opacity=".55" transform="translate(1 2)"/>
  <rect x="17" y="29" width="66" height="59" rx="21" fill="url(#stFace)" stroke="#a7804d" stroke-width="1.5"/>
  <path d="M28 32Q48 26 72 32" fill="none" stroke="#f0d5a5" stroke-width="1.3" stroke-linecap="round" opacity=".35"/>
  <circle cx="22" cy="21" r="2.2" fill="#d9b47a"/><circle cx="78" cy="21" r="2.2" fill="#d9b47a"/><circle cx="22" cy="21" r=".7" fill="#fff1d0"/><circle cx="78" cy="21" r=".7" fill="#fff1d0"/>
  <path class="an" d="M34 12Q26-2 22-9" stroke="url(#stMetal)" stroke-width="3.8" fill="none" stroke-linecap="round"/><circle class="bu" cx="22" cy="-10" r="5" fill="url(#stMetal)" stroke="#4f3822" stroke-width="1.2"/><circle cx="20.5" cy="-11.5" r="1.4" fill="#fff2d2" opacity=".85"/>
  ${['el', 'er'].map((c) => `<g class="${c}"><ellipse rx="10.2" ry="13.4" fill="#100d0a" opacity=".9" transform="translate(1 1.8)"/><ellipse rx="9.7" ry="12.4" fill="url(#stEye)" stroke="#694722" stroke-width="1.2"/><ellipse class="pp" rx="4.3" ry="6.3" fill="#2a1b10"/><ellipse cx="-2.4" cy="-4.1" rx="2.2" ry="2.6" fill="#fff9e9" opacity=".93"/><ellipse cx="3.4" cy="3.2" rx="1.2" ry="1.8" fill="#fff2d0" opacity=".55"/></g>`).join('')}
  <path class="browl" d="M22 31Q32 25 42 31" fill="none" stroke="#9d7949" stroke-width="2.6" stroke-linecap="round"/>
  <path class="browr" d="M58 31Q68 25 78 31" fill="none" stroke="#9d7949" stroke-width="2.6" stroke-linecap="round"/>
  <path class="mo" fill="#050403" stroke="#d9b47a" stroke-width="1.6" stroke-linejoin="round"/>
  <path class="cheekl" d="M20 68Q25 73 30 68" fill="none" stroke="#c28b65" stroke-width="2" stroke-linecap="round" opacity=".35"/><path class="cheekr" d="M70 68Q75 73 80 68" fill="none" stroke="#c28b65" stroke-width="2" stroke-linecap="round" opacity=".35"/>
  <g class="dz" opacity="0"><path d="M27 3l2.4 7.1 7.6.1-6.1 4.5 2.3 7.2-6.2-4.4-6.1 4.4 2.3-7.2-6.1-4.5 7.6-.1Z" fill="#f0d394" stroke="#9c713c" stroke-width=".9"/><path d="M74 2l1.8 5.1 5.5.1-4.4 3.2 1.7 5.2-4.6-3.2-4.4 3.2 1.7-5.2-4.4-3.2 5.5-.1Z" fill="#f0d394" stroke="#9c713c" stroke-width=".9"/></g>
  <line class="al" stroke="#40332a" stroke-width="10" stroke-linecap="round"/><line class="ar" stroke="#40332a" stroke-width="10" stroke-linecap="round"/>
  <g class="hl"><ellipse rx="8.7" ry="7.5" fill="url(#stMetal)" stroke="#3b2918" stroke-width="1.5"/><path d="M-4-5Q-1-8 3-5M-4 0Q0-2 4 0M-2 4Q0 3 2 4" stroke="#fff0cb" stroke-width="1" stroke-linecap="round" opacity=".72"/></g>
  <g class="hr"><ellipse rx="8.7" ry="7.5" fill="url(#stMetal)" stroke="#3b2918" stroke-width="1.5"/><path d="M-4-5Q-1-8 3-5M-4 0Q0-2 4 0M-2 4Q0 3 2 4" stroke="#fff0cb" stroke-width="1" stroke-linecap="round" opacity=".72"/></g>
  <g class="mc"><rect x="-4" y="-2" width="8" height="20" rx="4" fill="url(#stMetal)" stroke="#49311a" stroke-width="1"/><circle cy="-10" r="9" fill="url(#stMetal)" stroke="#49311a" stroke-width="1.4"/><circle cy="-10" r="5.5" fill="#241b13" stroke="#e7c489" stroke-width="1"/><path d="M-4-12H4M-4-9H4M-4-6H4" stroke="#d2aa6c" stroke-width=".8"/><path d="M-2-16Q0-18 2-16" fill="none" stroke="#fff0ce" stroke-width="1.1"/></g>
  <g class="sweat" opacity="0"><path d="M80 45C80 45 74 53 74 57a6 6 0 0 0 12 0c0-4-6-12-6-12Z" fill="#93c8dc" stroke="#e4f4f8" stroke-width="1"/><circle cx="78" cy="56" r="1.3" fill="#fff"/></g>
</g></svg>`;
const mouthD = (o, w) => { const hw = 5.8 + w * 7.1, y = 78; return `M${50 - hw} ${y}Q50 ${y - 1 - o * 2} ${50 + hw} ${y}Q50 ${y + (2 + o * 15) * 1.35} ${50 - hw} ${y}Z`; };
const visemeOf = (c) => ('aeiy'.includes(c) ? [.85, .9] : 'ou'.includes(c) ? [.8, .1] : /[a-z]/.test(c) ? [.3, .5] : [.04, .5]);

export function initMascot(S, audio, api = {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, ac = new AbortController();
  const on = (t, e, f, o) => t.addEventListener(e, f, { signal: ac.signal, ...o });
  const btn = Object.assign(document.createElement('button'), { className: 'stm', type: 'button', innerHTML: SVG });
  btn.setAttribute('aria-label', 'Static, the after-hours companion. Tap to interact or drag to move.');
  const bub = Object.assign(document.createElement('div'), { className: 'mbub', hidden: true, innerHTML: '<svg></svg><div class="mtx"><small class="mbub-label">STATIC</small><span class="mbub-copy"></span><div class="mb-actions" hidden></div></div>' });
  bub.setAttribute('role', 'status');
  const ring = Object.assign(document.createElement('div'), { className: 'mring', hidden: true });
  document.body.append(ring, bub, btn);
  const q = (c) => btn.querySelector('.' + c), E = Object.fromEntries('bd sh fl fr an bu el er mo al hl ar hr mc dz sweat browl browr'.split(' ').map((c) => [c, q(c)]));
  const pps = btn.querySelectorAll('.pp'), bsvg = bub.querySelector('svg'), btxt = bub.querySelector('.mbub-copy'), blabel = bub.querySelector('.mbub-label'), actions = bub.querySelector('.mb-actions');
  let size = 72, BW = 29, BH = 63, gen = 0, alive = true, playing = false, idleAt = performance.now(), T0 = 0, B = null, ht = 0, told = new Set(), queue = [], lastIdx = S.rec.index, tapN = 0, mx = -1, my = -1, activitySeq = 0;
  let lastSpeechAt = 0, lastObjectAt = 0, playingSince = 0, prankThreshold = R(48000, 95000), prankUsed = false;
  let inviteVisible = false, loopStarted = false, guideOfferAvailable = true, inviteTimer = 0, lastGlobalPokeAt = 0, motorControlSeq = 0, armControlSeq = 0, leverControlSeq = 0, volumeControlSeq = 0, trimControlSeq = 0, tour = { active: false, index: 0, resolve: null, steps: [] }, drag = null, suppressClick = false;
  const M = { x: 0, y: 0, face: 1, pop: 0, ph: 0, mic: 0, micT: 0, o: 0, ot: 0, w: .5, wt: .5, lx: 0, ly: 0, nb: 2, bl: 0, sleep: 0, sit: 0, sp: 0, glad: 0, mood: 'neutral', moodUntil: 0, go: null, tgt: null, hold: 0, grab: 0, onRecord: false, rideStart: 0, rideAngle: 0, rideSpeed: 0, rideRadius: { x: 20, y: 20 }, eject: null, dizzy: 0, sweat: 0, throwV: null, lastPoke: -1e9,
    L: { a: 102, l: 22, ta: 102, tl: 22 }, Rm: { a: 78, l: 22, ta: 78, tl: 22 } };
  const REST = [[102, 22], [78, 22]], arms = (l, r) => { if (l) [M.L.ta, M.L.tl] = l; if (r) [M.Rm.ta, M.Rm.tl] = r; };
  const setMood = (name, ms = 1300) => { M.mood = name; M.moodUntil = performance.now() + ms; };
  const wait = (ms, g) => new Promise((res, rej) => setTimeout(() => (g === gen ? res() : rej('x')), ms));
  const interrupt = () => { gen++; };
  const measure = () => { size = btn.offsetWidth || 72; BW = size * .42; BH = size * .9; };
  const inV = (x, y) => x >= BW + 6 && x <= innerWidth - BW - 6 && y >= BH + 6 && y <= innerHeight - 6;
  const overlap = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));
  const rectOf = (r, p = 5) => ({ l: r.left - p, t: r.top - p, r: r.right + p, b: r.bottom + p });

  /* Text, buttons, and the vinyl are collision targets. The wooden plinth itself is perchable. */
  function rects(includeDeck = false) {
    const out = [], add = (r, p = 5) => r && r.width > 1 && r.height > 1 && out.push(rectOf(r, p));
    if (includeDeck) add($('#deckFit')?.getBoundingClientRect(), 0);
    const ranged = new Set();
    $$('.title,.artist,.tagline,.hint.show,.seek__t,.dot span,.domain,.sub,.engrave').forEach((e) => {
      try { const g = document.createRange(); g.selectNodeContents(e); add(g.getBoundingClientRect(), 5); ranged.add(e); } catch { add(e.getBoundingClientRect(), 5); }
    });
    $$('.skip,.seek,.dot,.links a,#power,#volume,#trim,#lever,#leverHit,#platterHit,.arm-hit').forEach((e) => add(e.getBoundingClientRect(), 6));
    return out;
  }
  function bubbleRects(targetEl = null) {
    const out = rects(false), add = (r, p = 4) => r && r.width > 1 && r.height > 1 && out.push(rectOf(r, p));
    if (targetEl) add(targetEl.getBoundingClientRect(), 5);
    add(btn.getBoundingClientRect(), 4);
    add(ring.hidden ? null : ring.getBoundingClientRect(), 0);
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
  const SCENE_OBJECTS = [
    { key: 'plant', name: 'the plant', x: .075, y: .065, rx: .105, ry: .075 },
    { key: 'books', name: 'those old books', x: .91, y: .075, rx: .085, ry: .08 },
    { key: 'headphones', name: 'the headphones', x: .055, y: .69, rx: .075, ry: .13 },
    { key: 'mug', name: 'the mug', x: .94, y: .78, rx: .06, ry: .075 },
    { key: 'notebook', name: 'the notebook', x: .09, y: .925, rx: .10, ry: .06 }
  ];
  function objectAt(x, y) {
    const sc = $('#scene')?.getBoundingClientRect(); if (!sc) return null;
    const nx = (x - sc.left) / sc.width, ny = (y - sc.top) / sc.height;
    return SCENE_OBJECTS.find((o) => Math.abs(nx - o.x) <= o.rx && Math.abs(ny - o.y) <= o.ry) || null;
  }
  function spots(rs) {
    const out = [], add = (x, y, kind, object = null) => inV(x, y) && !hit(x, y, rs) && out.push({ x, y, kind, object });
    rs.forEach((r) => [.2, .5, .8].forEach((f) => add(r.l + (r.r - r.l) * f, r.t - BH * .03, 'edge')));
    for (let i = 0; i < 24; i++) add(R(BW + 8, innerWidth - BW - 8), R(BH + 8, innerHeight - 8), 'floor');
    const deck = $('#deckFit')?.getBoundingClientRect();
    if (deck) {
      // Safe wood-frame perches: every point is still rejected if the mascot would cover a control or text.
      for (const [fx, fy, kind] of [[.08,.12,'wood'],[.91,.32,'wood'],[.91,.55,'wood'],[.9,.94,'wood'],[.45,.94,'wood'],[.08,.9,'wood']]) add(deck.left + deck.width * fx, deck.top + deck.height * fy, kind);
    }
    const sc = $('#scene')?.getBoundingClientRect(); if (sc) {
      add(sc.left + sc.width / 2, sc.top + sc.height * .115, 'home');
      for (const o of SCENE_OBJECTS) {
        const ox = sc.left + sc.width * o.x, oy = sc.top + sc.height * o.y;
        const radiusX = Math.max(25, sc.width * o.rx), radiusY = Math.max(22, sc.height * o.ry);
        for (const [dx, dy] of [[0, -1], [1, 0], [-1, 0], [0, 1], [.7, -.7], [-.7, -.7]]) add(ox + dx * (radiusX + BW * .35), oy + dy * (radiusY + BH * .3), 'object', o);
      }
    }
    return out;
  }
  const goTo = (p, g) => new Promise((res, rej) => { const path = plan({ x: M.x, y: M.y }, p, rects()); if (!path) return rej('x'); M.go = { path, i: 1, res, rej, g }; });

  /* Friendly comic speech bubbles. The card and pointer are separate so the bubble can be placed clear of the character and UI. */
  function tailShape(kind, w, h, tip) {
    const m = 26, left = m, top = m, right = m + w, bottom = m + h;
    const edges = [
      { d: Math.abs(tip.y - top), x: cl(tip.x, left + 20, right - 20), y: top, dx: 0, dy: -1 },
      { d: Math.abs(tip.y - bottom), x: cl(tip.x, left + 20, right - 20), y: bottom, dx: 0, dy: 1 },
      { d: Math.abs(tip.x - left), x: left, y: cl(tip.y, top + 18, bottom - 18), dx: -1, dy: 0 },
      { d: Math.abs(tip.x - right), x: right, y: cl(tip.y, top + 18, bottom - 18), dx: 1, dy: 0 }
    ].sort((a, b) => a.d - b.d);
    const e = edges[0], spread = kind === 'shout' ? 16 : 12;
    return `<path d="M${e.x - e.dy * spread} ${e.y + e.dx * spread} L${tip.x} ${tip.y} L${e.x + e.dy * spread} ${e.y - e.dx * spread} Z" fill="${PAPER}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`;
  }
  function place() {
    if (!B || bub.hidden) return;
    const w = B.w || bub.querySelector('.mtx').offsetWidth || 190, h = B.h || bub.querySelector('.mtx').offsetHeight || 58, m = 26;
    const rs = bubbleRects(B.targetEl), head = { x: M.x, y: M.y - BH * .58 }, cb = { l: M.x - BW, r: M.x + BW, t: M.y - BH, b: M.y };
    const gap = 13, candidates = [];
    const add = (x, y) => candidates.push({ x: cl(x, 6, innerWidth - w - 6), y: cl(y, 6, innerHeight - h - 6) });
    add(head.x + BW + gap, head.y - h / 2); add(head.x - BW - gap - w, head.y - h / 2);
    add(head.x - w / 2, head.y - BH * .55 - h - gap); add(head.x - w / 2, head.y + 12 + gap);
    // Global fallback anchors keep bubbles readable on small screens.
    add(8, 8); add(innerWidth - w - 8, 8); add(8, innerHeight - h - 8); add(innerWidth - w - 8, innerHeight - h - 8);
    add((innerWidth - w) / 2, 8); add((innerWidth - w) / 2, innerHeight - h - 8);
    for (let a = 0; a < 360; a += 18) { const t = a * Math.PI / 180; add(head.x + Math.cos(t) * (BW + w * .55 + gap) - w / 2, head.y + Math.sin(t) * (BH * .55 + h * .55 + gap) - h / 2); }
    // Guided bubbles are essential UI: scan the viewport grid for a genuinely free rectangle
    // instead of sacrificing placement quality when the closest candidates overlap something.
    if (B.sticky) {
      const sx = Math.max(28, Math.floor(w * .42)), sy = Math.max(28, Math.floor(h * .48));
      for (let y = 8; y + h <= innerHeight - 8; y += sy) {
        for (let x = 8; x + w <= innerWidth - 8; x += sx) add(x, y);
      }
    }
    let best = null, bestBlocked = Infinity, bestDistance = Infinity;
    for (const c of candidates) {
      const br = { l: c.x - 1, t: c.y - 1, r: c.x + w + 1, b: c.y + h + 1 };
      let blocked = overlap(br, cb);
      rs.forEach((r) => { blocked += overlap(br, r); });
      const distance = Math.hypot((c.x + w / 2) - head.x, (c.y + h / 2) - head.y);
      if (blocked < bestBlocked || (blocked === bestBlocked && distance < bestDistance)) { bestBlocked = blocked; bestDistance = distance; best = c; }
      if (blocked === 0) break;
    }
    // Never put a card over the mascot, text, or an interactive control. If a crowded viewport
    // leaves no legal position, skip ordinary chatter, dismiss the invitation cleanly, and advance
    // an impossible guide step rather than leaving the tour Promise hanging forever.
    if (!best || bestBlocked > 0) {
      const kind = B.kind; hide();
      if (kind === 'invite') dismissInvite(true);
      if (kind === 'guide' && tour.resolve) { const resolve = tour.resolve; tour.resolve = null; resolve('next'); }
      return;
    }
    B.x = best.x; B.y = best.y; B.px = M.x; B.py = M.y;
    bsvg.setAttribute('width', w + m * 2); bsvg.setAttribute('height', h + m * 2); bsvg.setAttribute('viewBox', `0 0 ${w + m * 2} ${h + m * 2}`);
    bsvg.innerHTML = tailShape(B.kind, w, h, { x: head.x - best.x + m, y: head.y - best.y + m });
    bub.style.transform = `translate(${best.x - m}px,${best.y - m}px)`;
  }
  function setBubble(text, kind = 'say', opts = {}) {
    bub.hidden = false; bub.className = `mbub ${kind}${opts.actions ? ' interactive' : ''}`;
    blabel.textContent = opts.label || (kind === 'think' ? 'STATIC IS THINKING' : kind === 'guide' ? 'STATIC • FIELD GUIDE' : kind === 'shout' ? 'BREAKING NEWS' : 'STATIC');
    btxt.textContent = text;
    if (opts.actions) { actions.hidden = false; actions.innerHTML = opts.actions; }
    else { actions.hidden = true; actions.innerHTML = ''; }
    B = { w: bub.querySelector('.mtx').offsetWidth, h: bub.querySelector('.mtx').offsetHeight, kind, targetEl: opts.targetEl || null, sticky: !!opts.sticky };
    requestAnimationFrame(() => { if (B) { B.w = bub.querySelector('.mtx').offsetWidth; B.h = bub.querySelector('.mtx').offsetHeight; place(); } });
  }
  const hide = () => { bub.hidden = true; B = null; M.hold = 0; ring.hidden = true; M.tgt = null; };
  const say = async (text, kind, g, hold) => {
    lastSpeechAt = performance.now(); setBubble(text, kind);
    // Animate the mouth while the line is visible, without making the speech bubble itself jitter or duplicate text.
    for (let i = 0; i < text.length; i++) { if (g !== gen) throw 'x'; [M.ot, M.wt] = visemeOf(text[i].toLowerCase()); await wait(/[.,!?…]/.test(text[i]) ? 65 : 22, g); }
    M.ot = .05; await wait(hold ?? cl(850 + text.length * 24, 1050, 2400), g); if (g === gen && !tour.active) hide();
  };
  let recentLines = new Set();
  const fresh = (arr) => { let pool = arr.filter((x) => !recentLines.has(x)); if (!pool.length) { recentLines.clear(); pool = arr; } const value = pick(pool); recentLines.add(value); return value; };
  const notes = () => { if (reduce) return; const e = Object.assign(document.createElement('span'), { className: 'mn', textContent: pick(['♪', '♫', '♬', '✦']) }); const r = E.hr.getBoundingClientRect(); e.style.cssText = `left:${r.left + R(-10, 14)}px;top:${r.top - 10}px;--dx:${R(-22, 22)}px;--r:${R(-25, 25)}deg`; document.body.append(e); e.onanimationend = () => e.remove(); };

  const startFreePlay = () => { if (!loopStarted) { loopStarted = true; setTimeout(loop, 80); } };
  function dismissInvite(reopenable = true) {
    clearTimeout(inviteTimer); inviteTimer = 0;
    if (!inviteVisible) return;
    inviteVisible = false; guideOfferAvailable = reopenable; hide(); startFreePlay();
  }
  function invite() {
    if (!alive || tour.active || inviteVisible) return;
    clearTimeout(inviteTimer); inviteVisible = true;
    setBubble('new here? want a tiny tour? i can show you every control. no lecture, just vibes.', 'invite', {
      sticky: true, label: 'HEY, YOU', actions: '<div class="mb-action-row"><button type="button" data-m-action="start">show me around</button><button type="button" class="mb-quiet" data-m-action="later">not now</button></div>'
    });
    // The offer is optional, never sticky enough to obstruct someone who just came to listen.
    inviteTimer = setTimeout(() => dismissInvite(true), 12500);
  }
  function startTour() {
    clearTimeout(inviteTimer); inviteTimer = 0; inviteVisible = false; guideOfferAvailable = false;
    tour.active = true; tour.index = 0; tour.steps = getGuideSteps(); hide(); interrupt(); startFreePlay();
  }
  on(bub, 'click', (e) => {
    const b = e.target.closest('[data-m-action]'); if (!b) return;
    e.preventDefault(); e.stopPropagation(); activity();
    const action = b.dataset.mAction;
    if (action === 'start') { startTour(); return; }
    if (action === 'later') { guideOfferAvailable = false; dismissInvite(false); return; }
    if (tour.resolve) tour.resolve(action);
  });

  async function sing(g) {
    M.micT = 1; arms([-40, 24], [138, 30]);
    while (playing && !tour.active && !inviteVisible) {
      const rhythm = performance.now() / 380;
      arms([-46 + Math.sin(rhythm) * 24, 24], [132 + Math.sin(rhythm * .75) * 19, 28]);
      if (Math.random() < .58) notes();
      await wait(460, g);
    }
  }
  async function guide(el, text, g, index) {
    const r = el?.getBoundingClientRect();
    if (!r || r.width < 1 || r.height < 1) return 'next';
    const tx = r.left + r.width / 2, ty = r.top + r.height / 2, rs = rects(), candidates = spots(rs);
    for (const k of [r.width / 2 + 48, r.width / 2 + 78, r.width / 2 + 116, r.width / 2 + 154]) {
      for (let a = 0; a < 360; a += 20) { const x = tx + Math.cos(a * Math.PI / 180) * k, y = ty + Math.sin(a * Math.PI / 180) * k * .8 + BH * .48; if (inV(x, y) && !hit(x, y, rs)) candidates.push({ x, y, kind: 'floor' }); }
    }
    candidates.sort((a, b) => Math.hypot(a.x - tx, a.y - BH * .5 - ty) - Math.hypot(b.x - tx, b.y - BH * .5 - ty));
    if (candidates[0] && !reduce && !M.drag) await goTo(candidates[0], g);
    M.face = tx >= M.x ? 1 : -1; M.tgt = { x: tx, y: ty };
    const u = size / 140, a = Math.atan2(ty - (M.y - 52 * u), tx - (M.x + 38 * u * M.face)), ab = ((M.face > 0 ? a : Math.PI - a) * 180) / Math.PI, d = Math.hypot(tx - M.x, ty - M.y);
    arms(null, [ab, cl(d / u - 22, 18, 66)]);
    Object.assign(ring.style, { left: r.left - 5 + 'px', top: r.top - 5 + 'px', width: r.width + 10 + 'px', height: r.height + 10 + 'px' }); ring.hidden = false;
    const total = tour.steps.length || getGuideSteps().length, step = tour.steps[index] || GUIDE_STEPS[index % GUIDE_STEPS.length], last = index >= total - 1;
    const demo = step?.demo ? '<button type="button" data-m-action="demo">watch demo</button>' : '';
    setBubble(text, 'guide', { targetEl: el, sticky: true, label: `${String(index + 1).padStart(2, '0')} / ${total}  •  ${step.name}`, actions: `<div class="mb-action-row"><button type="button" data-m-action="prev" ${index === 0 ? 'disabled' : ''}>back</button>${demo}<button type="button" data-m-action="${last ? 'exit' : 'next'}">${last ? 'finish' : 'next'}</button><button type="button" class="mb-quiet" data-m-action="exit" aria-label="Exit guide">×</button></div>` });
    const action = await new Promise((resolve) => { tour.resolve = resolve; });
    tour.resolve = null; ring.hidden = true; hide(); arms(...REST); M.tgt = null; return action;
  }
  async function demoStep(step, g) {
    M.glad = 1; M.sit = 0; setMood('curious', 950); notes();
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const target = $(step.selector), r = target?.getBoundingClientRect();
    let reach = null;
    if (r && r.width > 0 && r.height > 0) {
      const tx = r.left + r.width / 2, ty = r.top + r.height / 2, u = size / 140;
      M.face = tx >= M.x ? 1 : -1; M.tgt = { x: tx, y: ty };
      const a = Math.atan2(ty - (M.y - 52 * u), tx - (M.x + 38 * u * M.face));
      const angle = ((M.face > 0 ? a : Math.PI - a) * 180) / Math.PI;
      reach = [angle, cl(Math.hypot(tx - M.x, ty - M.y) / u - 14, 18, 66)];
      arms([-72, 27], reach);
    } else arms([-72, 28], [138, 30]);
    // A tiny reach → squeeze → release makes the example feel like Static is operating the real control.
    M.grab = .35; await delay(110); M.grab = 1; await delay(130);
    try {
      if (step.demo === 'motor') {
        const old = api.getMotor?.() ?? !!S.motor, motorSeq = motorControlSeq;
        api.setMotor?.(!old); await delay(680);
        if (motorSeq === motorControlSeq && (api.getMotor?.() ?? !!S.motor) === !old) api.setMotor?.(old);
      } else if (step.demo === 'arm' && api.toggleArm) {
        const old = api.getArmDown?.() ?? false, armSeq = armControlSeq; api.toggleArm(); await delay(850);
        if (armSeq === armControlSeq && api.getArmDown && api.getArmDown() !== old) api.toggleArm();
      } else if (step.demo === 'lever' && api.toggleLever) {
        const leverSeq = leverControlSeq; api.toggleLever(); await delay(480); if (leverSeq === leverControlSeq) api.toggleLever();
      } else if (step.demo === 'volume' && api.setVolume) {
        const old = api.getVolume?.() ?? .8, v = old > .62 ? Math.max(0, old - .18) : Math.min(1, old + .18), volumeSeq = volumeControlSeq;
        api.setVolume(v); await delay(640); if (volumeSeq === volumeControlSeq && Math.abs((api.getVolume?.() ?? v) - v) < .015) api.setVolume(old);
      } else if (step.demo === 'trim' && api.setTrim) {
        const old = api.getTrim?.() ?? 0, v = old > .1 ? -.42 : .42, trimSeq = trimControlSeq;
        api.setTrim(v); await delay(640); if (trimSeq === trimControlSeq && Math.abs((api.getTrim?.() ?? v) - v) < .02) api.setTrim(old);
      } else if (step.demo === 'track' && Number.isInteger(step.dotIndex)) {
        api.skipTo?.(step.dotIndex); await delay(520);
      } else if (step.demo === 'next' || step.demo === 'prev') {
        const n = Math.max(1, S.tracks.length), old = S.rec.index, next = (old + (step.demo === 'next' ? 1 : -1) + n) % n;
        api.skipTo?.(next); await delay(550);
      }
    } finally {
      M.grab = 0;
      if (g === gen || tour.active) { arms(...REST); M.tgt = null; M.glad = 1; }
    }
  }

  async function runTour(g) {
    while (tour.active && g === gen) {
      if (tour.index < 0) tour.index = 0;
      if (tour.index >= tour.steps.length) { tour.active = false; guideOfferAvailable = true; hide(); await say('tour complete. go make some noise.', 'say', g, 1700); return; }
      const step = tour.steps[tour.index], el = $(step.selector);
      if (!el) { tour.index++; continue; }
      const action = await guide(el, step.text, g, tour.index);
      if (action === 'exit') { tour.active = false; guideOfferAvailable = true; hide(); arms(...REST); M.tgt = null; await say('you are on your own now. behave. or do not.', 'say', g, 1650); return; }
      if (action === 'demo') { await demoStep(step, g); continue; }
      if (action === 'prev') tour.index = Math.max(0, tour.index - 1); else tour.index++;
    }
  }
  async function inspectObject(o, g) {
    if (!o || performance.now() - lastObjectAt < 15000) return;
    lastObjectAt = performance.now();
    const sc = $('#scene')?.getBoundingClientRect(); if (sc) M.tgt = { x: sc.left + sc.width * o.x, y: sc.top + sc.height * o.y };
    arms([-68, 24], [-110, 26]); M.glad = .7;
    await wait(650, g); M.tgt = null; arms(...REST);
    if (Math.random() < .42) await say(fresh(LINES.object[o.key] || LINES.object.deck), 'think', g, 1050);
  }
  async function antic(g) {
    const k = pick(['look', 'look', 'stretch', 'stretch', 'yawn', 'hum', 'spin', 'inspect']);
    if (k === 'look') { M.tgt = { x: R(0, innerWidth), y: R(0, innerHeight) }; await wait(R(900, 1700), g); M.tgt = null; }
    else if (k === 'stretch') { arms([-72, 30], [-112, 30]); await wait(780, g); arms(...REST); }
    else if (k === 'yawn') { M.ot = .9; M.wt = .25; await wait(850, g); M.ot = 0; }
    else if (k === 'spin' && !reduce) { M.sp = 1; await wait(700, g); }
    else if (k === 'inspect') { const sc = $('#scene')?.getBoundingClientRect(); if (sc) { const o = pick(SCENE_OBJECTS); M.tgt = { x: sc.left + sc.width * o.x, y: sc.top + sc.height * o.y }; await wait(850, g); M.tgt = null; } }
    else { M.ot = .35; await wait(400, g); M.ot = 0; }
    await wait(R(500, 1100), g);
  }
  async function wander(g) {
    const rs = rects(), sp = spots(rs); if (!sp.length || reduce || M.drag || M.onRecord) { await antic(g); return; }
    let t;
    if (Math.random() < .26) { const obj = pick(SCENE_OBJECTS); const found = sp.filter((s) => s.object?.key === obj.key); t = found.length ? pick(found) : pick(sp); }
    else { const home = sp.find((s) => s.kind === 'home'); t = home && Math.random() < .16 ? home : pick(sp.filter((s) => s.kind !== 'home') || sp); }
    await goTo(t, g); M.sit = t.kind === 'edge' || t.kind === 'object' ? 1 : 0;
    if (t.object) await inspectObject(t.object, g); else await antic(g);
  }
  async function performDrop(g, x, y) {
    const thrown = M.throwV; M.throwV = null;
    const cx = x, cy = y - BH * .52, rec = $('#record')?.getBoundingClientRect();
    if (rec) {
      const ex = (cx - (rec.left + rec.width / 2)) / (rec.width * .48), ey = (cy - (rec.top + rec.height / 2)) / (rec.height * .48);
      if (ex * ex + ey * ey < 1) {
        M.onRecord = true; M.rideStart = performance.now(); M.rideAngle = Math.atan2(ey, ex); M.rideSpeed = Math.abs(S.omega || 0); M.rideRadius = { x: rec.width * cl(Math.hypot(ex, ey), .18, .37), y: rec.height * cl(Math.hypot(ex, ey), .18, .37) };
        M.x = rec.left + rec.width / 2 + Math.cos(M.rideAngle) * M.rideRadius.x; M.y = rec.top + rec.height / 2 + Math.sin(M.rideAngle) * M.rideRadius.y + BH * .5;
        M.sit = 0; M.glad = 1; M.sweat = 0; M.throwV = null; M.onRecord = true; interrupt(); queue.unshift({ k: 'ride' }); return;
      }
    }
    const controls = [
      ['#power', 'motor'], ['#volume', 'volume'], ['#trim', 'trim'], ['#lever', 'lever'], ['#arm .arm-hit', 'arm'], ['#nextBtn', 'next'], ['#prevBtn', 'prev'], ['.dot', 'dot']
    ];
    const target = controls.flatMap(([selector, what]) => $$(selector).map((element) => ({ selector, what, element }))).find(({ element }) => { const r = element.getBoundingClientRect(); return cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom; });
    if (target) {
      const { selector, what, element: targetEl } = target;
      const u = size / 140, tx = cx, ty = cy, a = Math.atan2(ty - (M.y - 52 * u), tx - (M.x + 38 * u * M.face)), ab = ((M.face > 0 ? a : Math.PI - a) * 180) / Math.PI;
      M.tgt = { x: tx, y: ty }; arms([-60, 26], [ab, cl(Math.hypot(tx - M.x, ty - M.y) / u - 22, 18, 66)]); M.grab = 1; setMood('playful', 1300);
      if (what === 'motor') { api.toggleMotor?.(); await say(fresh(['i flipped it. you dropped me there.', 'switch says: engaged.', 'i touched the switch. technically teamwork.']), 'shout', g, 1100); }
      else if (what === 'volume') { const old = api.getVolume?.() ?? .8, v = old > .62 ? .48 : .82, volumeSeq = volumeControlSeq; api.setVolume?.(v); try { await say(fresh(['volume check. you are welcome.', 'i turned it down a smidge. ears are precious.', 'was that too loud? i have tiny hands.']), 'think', g, 900); await wait(700, g); } finally { if (volumeControlSeq === volumeSeq && Math.abs((api.getVolume?.() ?? v) - v) < .015) api.setVolume?.(old); } }
      else if (what === 'trim') { const old = api.getTrim?.() ?? 0, v = old > .1 ? -.35 : .38, trimSeq = trimControlSeq; api.setTrim?.(v); try { await say('speed seasoning. just a pinch.', 'think', g, 900); await wait(650, g); } finally { if (trimControlSeq === trimSeq && Math.abs((api.getTrim?.() ?? v) - v) < .015) api.setTrim?.(old); } }
      else if (what === 'lever') { api.toggleLever?.(); await say('cue lever. up, down, tiny mechanical drama.', 'say', g, 1100); }
      else if (what === 'arm') { api.toggleArm?.(); await say('i moved the arm. please admire my technique.', 'say', g, 1000); }
      else if (what === 'next' || what === 'prev') { api.skipTo?.((S.rec.index + (what === 'next' ? 1 : -1) + S.tracks.length) % Math.max(1, S.tracks.length)); await say('i picked the next groove. no take-backs.', 'shout', g, 1000); }
      else if (what === 'dot') { const index = Number(targetEl.dataset.index); if (Number.isFinite(index)) api.skipTo?.(index); await say('direct track selection. look at me, being useful.', 'say', g, 1000); }
      M.grab = 0; M.glad = 1; M.sit = 0; M.sweat = 0; M.tgt = null; const p = nearestSafeSpot(); if (p) await bounceToSafe(p, g); arms(...REST); return;
    }
    const o = objectAt(cx, cy);
    if (o) { setMood('curious', 1200); arms([-68, 25], [-110, 28]); await say(fresh(LINES.object[o.key] || LINES.object.deck), 'think', g, 1100); }
    if (!hit(M.x, M.y, rects()) && thrown && (thrown.lift > 90 || Math.hypot(thrown.vx, thrown.vy) > 720)) {
      const sp = spots(rects()).filter((p) => Math.hypot(p.x - M.x, p.y - M.y) > 44);
      const aim = { x: cl(M.x + thrown.vx * .13, BW + 8, innerWidth - BW - 8), y: cl(M.y + thrown.vy * .11 + 35, BH + 8, innerHeight - 8) };
      const land = sp.sort((p, q) => Math.hypot(p.x-aim.x,p.y-aim.y)-Math.hypot(q.x-aim.x,q.y-aim.y))[0] || nearestSafeSpot();
      if (land) { setMood('scared', 1200); M.sweat = 1; M.eject = { from: { x: M.x, y: M.y }, to: land, start: performance.now(), duration: cl(420 + Math.hypot(thrown.vx, thrown.vy) * .12, 420, 720) }; arms([-130, 34], [145, 35]); await wait(M.eject.duration + 30, g); M.dizzy = thrown.lift > 130 ? .85 : .5; M.sweat = 0; await say(fresh(['i was not emotionally prepared for gravity.', 'drop test failed. please submit a bug report.', 'my ancestors are tiny pixels and they are disappointed.']), 'think', g, 950); M.dizzy = Math.max(M.dizzy, .38); arms(...REST); }
    }
    if (hit(M.x, M.y, rects())) {
      const safe = nearestSafeSpot(); if (safe) { M.glad = .8; await say('bonk. cannot park on important stuff, sorry.', 'say', g, 900); await bounceToSafe(safe, g); }
    } else { const safe = nearestSafeSpot(); if (safe && Math.random() < .25) await bounceToSafe(safe, g); }
    M.sweat = 0; M.throwV = null;
  }
  function nearestSafeSpot() {
    const sp = spots(rects()); if (!sp.length) return null;
    return sp.reduce((best, p) => !best || Math.hypot(p.x - M.x, p.y - M.y) < Math.hypot(best.x - M.x, best.y - M.y) ? p : best, null);
  }
  async function bounceToSafe(p, g) {
    if (!p) return;
    M.go = null; M.eject = { from: { x: M.x, y: M.y }, to: p, start: performance.now(), duration: 520 };
    await wait(555, g); M.sit = p.kind === 'edge' || p.kind === 'object' ? 1 : 0;
  }
  async function rideRecord(g) {
    const initial = Math.abs(S.omega || 0); M.rideSpeed = initial;
    if (initial < .65) {
      arms([-68, 27], [-102, 28]); await say('slow mode. treadmill time. i am absolutely not scared.', 'think', g, 900);
    } else if (initial < 5.2) {
      arms([-40, 22], [138, 26]); await say('i am walking. the floor is moving. normal.', 'say', g, 800);
    } else {
      arms([-115, 34], [150, 32]); M.sweat = 1; await say('WHY IS THE FLOOR AT TURBO SPEED?!', 'shout', g, 750);
    }
    const rideFor = initial > 5.2 ? 1800 : 1450;
    await wait(rideFor, g); M.dizzy = initial > 1.2 ? 1 : .35; M.sweat = initial > 5.2 ? 1 : 0; M.sp = initial > 5.2 ? 1 : .45; arms([-125, 33], [150, 33]);
    if (initial > 1.2) await say(fresh(['birds. there are birds. i do not own birds.', 'who installed the spin cycle on the floor?', 'i am fine. the stars are just being friendly.', 'my entire world is now a screensaver.']), 'think', g, 800);
    M.onRecord = false; M.dizzy = Math.max(M.dizzy, initial > 1.2 ? .78 : .3); M.sweat = 0; M.sp = .7; setMood('dizzy', 1100); arms([-85, 27], [130, 28]);
    const p = nearestSafeSpot();
    if (p) { M.eject = { from: { x: M.x, y: M.y }, to: p, start: performance.now(), duration: 620 }; await wait(660, g); M.sit = p.kind === 'edge' || p.kind === 'object' ? 1 : 0; }
    await wait(300, g); M.sp = 0; M.glad = .8;
  }
  async function prank(g) {
    if (!playing || tour.active || inviteVisible || M.drag || M.onRecord) return;
    prankUsed = true; const kind = pick(['volume', 'trim', 'motor', 'tonearm']);
    M.glad = 1; setMood('playful', 1500); arms([-70, 26], [138, 28]);
    if (kind === 'volume' && api.setVolume) {
      const old = api.getVolume?.() ?? .8, low = Math.max(.32, old * .56), volumeSeq = volumeControlSeq; api.setVolume(low);
      try { await say(fresh(LINES.prank), 'shout', g, 700); await wait(750, g); }
      finally { if (volumeControlSeq === volumeSeq && Math.abs((api.getVolume?.() ?? low) - low) < .015) api.setVolume(old); }
    } else if (kind === 'trim' && api.setTrim) {
      const old = api.getTrim?.() ?? 0, nudge = old > .1 ? -.42 : .42, trimSeq = trimControlSeq; api.setTrim(nudge);
      try { await say(fresh(LINES.prank), 'think', g, 700); await wait(700, g); }
      finally { if (trimControlSeq === trimSeq && Math.abs((api.getTrim?.() ?? nudge) - nudge) < .02) api.setTrim(old); }
    } else if (kind === 'motor' && api.setMotor && api.getMotor?.()) {
      // This prank intentionally changes the playback state, so don't use generation-bound waits:
      // a state transition interrupts normal animation tasks. Restore unless the visitor touched the motor.
      const motorSeq = motorControlSeq, bubbleLine = fresh(LINES.prank); api.setMotor(false); setBubble(bubbleLine, 'shout');
      M.ot = .9; const ownBubble = B; await new Promise((resolve) => setTimeout(resolve, 470));
      if (motorSeq === motorControlSeq && !api.getMotor?.()) api.setMotor(true);
      if (B === ownBubble) hide();
    } else if (kind === 'tonearm' && api.toggleArm && api.getArmDown?.()) {
      const armSeq = armControlSeq, bubbleLine = fresh(['needle break. tiny intermission.', 'i needed a dramatic pause. blame me.', 'the stylus has taken a tiny coffee break.']);
      api.toggleArm(); setBubble(bubbleLine, 'think'); const ownBubble = B;
      await new Promise((resolve) => setTimeout(resolve, 610));
      if (armSeq === armControlSeq && !api.getArmDown?.()) api.toggleArm();
      if (B === ownBubble) hide();
    } else await say(fresh(LINES.prank), 'say', g, 900);
    arms(...REST);
  }
  async function run(a, g) {
    if (M.sleep || a.k === 'wake') { M.sleep = 0; await say(fresh(LINES.wake), 'say', g); return; }
    if (a.k === 'move') return goTo(a, g);
    if (a.k === 'tap') {
      const n = tapN++; M.glad = 1; M.sit = 0;
      if (a.rapid) { setMood('angry', 1800); M.ot = .65; arms([-35, 25], [140, 29]); await say(fresh(LINES.angry), 'shout', g, 1100); }
      else if (playing) { setMood('happy', 1450); M.sp = reduce ? 0 : .7; arms([-70, 30], [135, 31]); if (!reduce) { notes(); notes(); } await say(fresh(LINES.dance), 'say', g, 950); }
      else if (n % 4 === 1 && !reduce) { setMood('curious', 1200); M.micT = 1; M.hold = 1; arms(null, [138, 30]); notes(); await say(fresh(LINES.mic), 'think', g, 1200); M.hold = 0; M.micT = 0; }
      else { if (n % 3 === 0 && !reduce) M.sp = 1; setMood(n % 3 === 0 ? 'skeptical' : 'playful', 1200); arms([-60, 28], [-60, 28]); await say(fresh(LINES.tap), n % 5 === 4 ? 'shout' : 'say', g); }
    } else if (a.k === 'poke') {
      M.tgt = { x: a.x, y: a.y }; setMood('curious', 1500); arms([-48, 23], [128, 29]); M.glad = .8;
      await wait(370, g);
      const o = objectAt(a.x, a.y);
      if (o) { await inspectObject(o, g); }
      else { const candidates = spots(rects()).filter((p) => Math.hypot(p.x - a.x, p.y - a.y) < 115).sort((p, q) => Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(q.x-a.x,q.y-a.y)); if (candidates[0] && Math.random() < .55) await goTo(candidates[0], g); M.tgt = { x: a.x, y: a.y }; if (Math.random() < .62) await say(fresh(LINES.poke), 'think', g, 900); }
      M.tgt = null; arms(...REST);
    } else if (a.k === 'track') { if (playing && !reduce) { arms([-70, 28], [-70, 28]); M.sp = 1; } setMood('happy', 1300); await say(fresh(LINES.track).replace('new track', `new track: ${a.title}`), 'say', g, 1050); }
    else if (a.k === 'ride') return rideRecord(g);
    else if (a.k === 'drop') return performDrop(g, a.x, a.y);
    else if (a.k === 'prank') return prank(g);
    else if (a.k === 'object') return inspectObject(a.object, g);
    else if (a.k === 'ambient') { await say(a.text, 'say', g, 950); return; }
  }
  async function decide(g) {
    const now = performance.now();
    if (inviteVisible || tour.active) return wait(500, g);
    if (!playing && !M.hold) M.micT = 0; arms(...REST); if (!M.onRecord) M.tgt = null; M.sit = M.sit && !queue.length;
    if (queue.length) return run(queue.shift(), g);
    if (playing) return sing(g);
    if (now - idleAt > 30000 && now - lastSpeechAt > 30000) { await say('zzz. wake me when there is a good bridge.', 'think', g, 850); M.sleep = 1; return wait(6e5, g); }
    // No automatic tutorial. The only tour starts from the explicit invite button.
    return wander(g);
  }
  async function loop() {
    while (alive) {
      const g = ++gen;
      try { if (tour.active) await runTour(g); else await decide(g); }
      catch (e) { if (e !== 'x') console.warn('[Static]', e); hide(); M.tgt = null; M.sweat = 0; M.hold = 0; M.grab = 0; arms(...REST); await new Promise((r) => setTimeout(r, 120)); }
    }
  }
  function activity() {
    activitySeq++; idleAt = performance.now();
    if (M.sleep && !tour.active) { M.sleep = 0; queue.unshift({ k: 'wake' }); interrupt(); }
  }
  const controlReaction = (el) => {
    if (!el || tour.active || inviteVisible || Math.random() > .19) return;
    if (el.matches('#power,#platterHit')) queue.push({ k: 'ambient', text: fresh(['switch flipped. excellent lever work, human.', 'the motor is awake. as am i, unfortunately.', 'vinyl goes round. my rent remains unpaid.']) });
    else if (el.matches('#volume')) queue.push({ k: 'ambient', text: fresh(['volume changed. my imaginary ears appreciate you.', 'tiny knob, big sound.', 'audio engineer by accident.']) });
    else if (el.matches('#trim')) queue.push({ k: 'ambient', text: fresh(['speed trim. fancy way of saying tiny fast.', 'tempo nudged. vibes recalibrated.']) });
    else if (el.matches('#lever,.arm-hit')) queue.push({ k: 'ambient', text: fresh(['careful with the needle. it has a tiny job.', 'tonearm choreography. elegant.']) });
    else if (el.matches('#nextBtn,#prevBtn,.dot')) queue.push({ k: 'ambient', text: fresh(['new groove. new emotional support track.', 'you DJ, i supervise.']) });
    else return;
    interrupt();
  };
  on(document, 'pointerdown', (e) => {
    if (e.target.closest?.('.mbub')) return;
    activity();
    if (inviteVisible) dismissInvite(true); // normal site use should never be blocked by the guide invitation
    const control = e.target.closest?.('#power,#volume,#trim,#lever,#nextBtn,#prevBtn,.dot,#seek,#platterHit,.arm-hit');
    if (control?.matches?.('#power,#platterHit')) motorControlSeq++;
    if (control?.matches?.('#arm .arm-hit,#armKey')) armControlSeq++;
    if (control?.matches?.('#lever')) leverControlSeq++;
    if (control?.matches?.('#volume')) volumeControlSeq++;
    if (control?.matches?.('#trim')) trimControlSeq++;
    if (!M.drag && control) controlReaction(control);
    const excluded = e.target.closest?.('.stm,.mbub,#power,#volume,#trim,#lever,#nextBtn,#prevBtn,.dot,#seek,#platterHit,.arm-hit,.links a,[role=slider],[role=switch]');
    if (!excluded && loopStarted && !tour.active && !inviteVisible && performance.now() - lastGlobalPokeAt > 5200 && Math.random() < .075) {
      lastGlobalPokeAt = performance.now(); queue.push({ k: 'poke', x: e.clientX, y: e.clientY }); interrupt();
    }
    if (M.sleep) hide();
  }, { capture: true });
  on(document, 'focusin', activity);
  on(window, 'pointermove', (e) => { if (e.pointerType === 'mouse') { mx = e.clientX; my = e.clientY; idleAt = performance.now(); } });
  on(window, 'keydown', (e) => { activity(); if (e.code === 'Space') motorControlSeq++; if (e.target.closest?.('#armKey,.arm-hit')) armControlSeq++; if (e.target.closest?.('#lever')) leverControlSeq++; if (e.target.closest?.('#volume')) volumeControlSeq++; if (e.target.closest?.('#trim')) trimControlSeq++; });
  on(window, 'scroll', activity, { passive: true });
  on(btn, 'click', () => {
    if (suppressClick) { suppressClick = false; return; }
    activity(); if (tour.active || inviteVisible) return;
    if (guideOfferAvailable) { invite(); return; }
    const now = performance.now(), rapid = now - M.lastPoke < 1650; M.lastPoke = now;
    queue.push({ k: 'tap', rapid }); interrupt();
  });

  /* Long-press/drag the mascot. Drop on the vinyl for a short physics gag; drop on a control to let it interact. */
  on(btn, 'pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    M.eject = null; M.throwV = null;
    drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: M.x - e.clientX, oy: M.y - e.clientY, lastX: e.clientX, lastY: e.clientY, lastT: performance.now(), vx: 0, vy: 0, maxLift: 0, moved: false };
    try { btn.setPointerCapture(e.pointerId); } catch { /* unsupported */ }
  });
  on(btn, 'pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const now = performance.now(), dx = e.clientX - drag.sx, dy = e.clientY - drag.sy, dt = Math.max(12, now - drag.lastT);
    drag.vx = (e.clientX - drag.lastX) / dt * 1000; drag.vy = (e.clientY - drag.lastY) / dt * 1000; drag.lastX = e.clientX; drag.lastY = e.clientY; drag.lastT = now; drag.maxLift = Math.max(drag.maxLift, drag.sy - e.clientY);
    if (!drag.moved && Math.hypot(dx, dy) > 7) { drag.moved = true; interrupt(); hide(); M.go = null; M.onRecord = false; M.sit = 0; setMood('scared', 1600); M.sweat = 1; M.ot = .6; }
    if (drag.moved) {
      M.x = cl(e.clientX + drag.ox, BW + 6, innerWidth - BW - 6);
      M.y = cl(e.clientY + drag.oy, BH + 6, innerHeight - 6);
      M.tgt = { x: e.clientX, y: e.clientY }; M.ph += .35;
      arms([-125 + Math.sin(M.ph) * 25, 33], [145 + Math.cos(M.ph) * 20, 34]);
    }
  });
  const finishDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    if (d.moved) { suppressClick = true; setTimeout(() => { suppressClick = false; }, 350); activity(); M.tgt = null; M.glad = 1; M.throwV = { vx: d.vx, vy: d.vy, lift: d.maxLift }; if (d.maxLift > 90 || Math.hypot(d.vx, d.vy) > 720) { setMood('scared', 1400); M.sweat = 1; } else M.sweat = 0; arms(...REST); queue.unshift({ k: 'drop', x: M.x, y: M.y }); interrupt(); }
  };
  on(btn, 'pointerup', finishDrag); on(btn, 'pointercancel', finishDrag);

  let resizeT = 0;
  on(window, 'resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { measure(); if (!M.onRecord && !M.eject && (hit(M.x, M.y, rects()) || !inV(M.x, M.y) || btn.style.visibility === 'hidden')) { const s = nearestSafeSpot(); if (s) { M.x = s.x; M.y = s.y; btn.style.visibility = 'visible'; interrupt(); } else btn.style.visibility = 'hidden'; } if (B) place(); }, 150); });
  const settle = setInterval(() => {
    if (!M.go && !M.sleep && !tour.active && !inviteVisible && !M.onRecord && !M.eject && !M.drag) {
      const needsSafePlace = btn.style.visibility === 'hidden' || hit(M.x, M.y, rects());
      if (needsSafePlace) { const s = nearestSafeSpot(); if (s) { M.x = s.x; M.y = s.y; M.sit = s.kind === 'edge' || s.kind === 'object' ? 1 : 0; btn.style.visibility = 'visible'; queue.unshift({ k: 'move', ...s }); interrupt(); } }
    }
  }, 850);

  measure(); const sp = spots(rects()), home = sp.find((s) => s.kind === 'home'), away = sp.filter((s) => s.kind !== 'home');
  const s0 = (home && Math.random() < .5 ? home : pick(away.length ? away : sp));
  if (s0) { M.x = s0.x; M.y = s0.y; M.sit = s0.kind === 'edge' || s0.kind === 'object' ? 1 : 0; }
  else { M.x = innerWidth / 2; M.y = innerHeight / 2; btn.style.visibility = 'hidden'; }
  btn.classList.add('on'); requestAnimationFrame(frame); setTimeout(invite, reduce ? 900 : 1700);
  if (location.search.includes('debug')) window.__static = { M, get bubble() { return B; }, rects, spots, say, get playing() { return playing; }, hit, BW: () => BW, BH: () => BH, startTour };

  function frame(now) {
    if (!alive) return; requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - T0) / 1000 || .016), t = now / 1000, k = 1 - Math.pow(.001, dt); T0 = now;
    const pl = !!(S.contact && Math.abs(S.omega || 0) > .35);
    if (pl !== playing) {
      playing = pl;
      if (pl) playingSince = now;
      if (!tour.active && !inviteVisible && !pl && queue.length === 0 && now - lastSpeechAt > 22000 && Math.random() < .2) queue.push({ k: 'ambient', text: fresh(LINES.end) });
      if (!tour.active && !inviteVisible) interrupt();
    }
    if (S.rec.index !== lastIdx) { lastIdx = S.rec.index; if (S.motor && !tour.active && !inviteVisible) { queue.push({ k: 'track', title: S.tracks[lastIdx]?.title || 'this one' }); interrupt(); } }
    if (!tour.active && !inviteVisible && playing && !prankUsed && now - playingSince > prankThreshold && now - idleAt > 16000 && !M.drag && !M.onRecord) { prankUsed = true; queue.push({ k: 'prank' }); interrupt(); }
    if (M.onRecord && !M.drag) {
      const rec = $('#record')?.getBoundingClientRect();
      if (rec) {
        M.rideSpeed = Math.abs(S.omega || 0);
        const spinRate = M.rideSpeed < .6 ? .45 : M.rideSpeed < 5.2 ? M.rideSpeed * .65 : M.rideSpeed * 1.8;
        M.rideAngle += dt * spinRate;
        M.x = rec.left + rec.width / 2 + Math.cos(M.rideAngle) * M.rideRadius.x;
        M.y = rec.top + rec.height / 2 + Math.sin(M.rideAngle) * M.rideRadius.y + BH * .5;
        M.ph += dt * (4 + Math.min(20, M.rideSpeed * 3));
      }
    }
    if (M.eject && !M.drag) {
      const f = cl((now - M.eject.start) / M.eject.duration, 0, 1), ease = 1 - Math.pow(1 - f, 3);
      M.x = M.eject.from.x + (M.eject.to.x - M.eject.from.x) * ease;
      M.y = M.eject.from.y + (M.eject.to.y - M.eject.from.y) * ease - Math.sin(f * Math.PI) * 48;
      if (f >= 1) { M.x = M.eject.to.x; M.y = M.eject.to.y; M.eject = null; }
    }
    if (M.go && !M.drag && !M.onRecord && !M.eject) {
      const go = M.go;
      if (go.g !== gen) { M.go = null; go.rej('x'); }
      else { const p = go.path[go.i], dx = p.x - M.x, dy = p.y - M.y, d = Math.hypot(dx, dy), v = (reduce ? 400 : 210) * dt;
        if (d <= Math.max(2, v)) { M.x = p.x; M.y = p.y; if (++go.i >= go.path.length) { M.go = null; go.res(); } }
        else { M.x += (dx / d) * v; M.y += (dy / d) * v; if (Math.abs(dx) > 1) M.face = dx > 0 ? 1 : -1; M.ph += dt * 13; M.sit = 0; }
      }
    }
    M.pop = Math.min(1, M.pop + dt * (reduce ? 20 : 2.6)); const pop = 1 + Math.sin(M.pop * Math.PI) * .1 * (M.pop < 1), sc = M.pop < 1 ? Math.min(1, M.pop * 1.6) : 1;
    let lv = 0; if (playing) { lv = audio.level ? audio.level() : 0; if (lv < .02) lv = .16 + .16 * Math.abs(Math.sin(t * 7)); M.ot = cl(lv * 1.7, .05, 1); M.wt = .45 + Math.sin(t * 9) * .3; }
    M.o += (M.ot - M.o) * (1 - Math.pow(1e-4, dt)); M.w += (M.wt - M.w) * k; M.glad = Math.max(0, M.glad - dt * .8); M.sp = Math.max(0, M.sp - dt * 1.3);
    if (!playing && !B && !M.hold && !M.go && !M.onRecord) M.ot = Math.max(0, M.ot - dt); M.mic += (M.micT - M.mic) * k;
    M.dizzy = Math.max(0, M.dizzy - dt * .22); M.sweat = M.sweat ? 1 : 0;
    M.nb -= dt; if (M.nb < 0) { M.bl = 1; M.nb = R(2.4, 5.8); } M.bl = Math.max(0, M.bl - dt * 7);
    const hx = M.x, hy = M.y - BH * .55, tg = M.tgt || (mx >= 0 ? { x: mx, y: my } : null), lx = tg ? cl((tg.x - hx) / 180, -1, 1) * M.face : 0, ly = tg ? cl((tg.y - hy) / 180, -1, 1) : 0;
    M.lx += (lx - M.lx) * k; M.ly += (ly - M.ly) * k;
    if (M.mood !== 'neutral' && now > M.moodUntil) M.mood = 'neutral';
    const moodEye = M.mood === 'sleepy' ? .48 : M.mood === 'angry' || M.mood === 'skeptical' ? .78 : M.mood === 'scared' ? 1.12 : 1;
    const es = (M.sleep ? .08 : Math.max(.08, 1 - Math.sin(M.bl * Math.PI)) * (1 - M.glad * .3)) * moodEye;
    E.el.setAttribute('transform', `translate(34 46)scale(1 ${es})`); E.er.setAttribute('transform', `translate(66 46)scale(1 ${es})`);
    const brows = {
      angry: ['M22 27Q32 34 42 37', 'M58 37Q68 34 78 27'],
      skeptical: ['M22 27Q32 24 42 31', 'M58 34Q68 25 78 29'],
      curious: ['M22 26Q32 20 42 28', 'M58 31Q68 27 78 31'],
      scared: ['M22 26Q32 18 42 25', 'M58 25Q68 18 78 26'],
      sleepy: ['M22 34Q32 31 42 34', 'M58 34Q68 31 78 34'],
      playful: ['M22 31Q32 23 42 29', 'M58 29Q68 23 78 31']
    }[M.mood];
    if (E.browl && brows) { E.browl.setAttribute('d', brows[0]); E.browr.setAttribute('d', brows[1]); } else { E.browl?.setAttribute('d', 'M22 31Q32 25 42 31'); E.browr?.setAttribute('d', 'M58 31Q68 25 78 31'); }
    pps.forEach((p) => { p.setAttribute('cx', M.lx * 3.6); p.setAttribute('cy', M.ly * 4); });
    E.mo.setAttribute('d', mouthD(M.sleep ? .1 : M.o, M.w));
    E.dz?.setAttribute('opacity', M.dizzy ? String(cl(M.dizzy * 1.8, .3, 1) * (.65 + .35 * Math.sin(t * 12))) : '0');
    E.sweat?.setAttribute('opacity', M.sweat ? String(.6 + .4 * Math.sin(t * 14)) : '0');
    const sw = Math.sin(t * (playing ? 5.8 : 1.7)) * (playing ? 10 : 2.5), A = (m, ln, hd, px, w) => {
      m.a += (m.ta - m.a) * k; m.l += (m.tl - m.l) * k; const a = ((m.a + sw * w) * Math.PI) / 180, x = px + Math.cos(a) * m.l, y = 68 + Math.sin(a) * m.l;
      ln.setAttribute('x1', px); ln.setAttribute('y1', 68); ln.setAttribute('x2', x); ln.setAttribute('y2', y); hd.setAttribute('transform', `translate(${x} ${y}) rotate(${m.a + sw * w}) scale(${1 - M.grab * .13})`); return [x, y];
    };
    A(M.L, E.al, E.hl, 12, 1); const [hxr, hyr] = A(M.Rm, E.ar, E.hr, 88, -1);
    E.mc.setAttribute('transform', `translate(${hxr} ${hyr})rotate(-36)scale(${M.mic})`); E.mc.style.display = M.mic > .03 ? '' : 'none';
    E.an.setAttribute('transform', `rotate(${Math.sin(t * 3) * 5 + lv * 14} 34 12)`); E.bu.setAttribute('opacity', playing ? .35 + lv : .55 + Math.sin(t * 2) * .35);
    const walk = !!M.go || M.onRecord || (!!drag && drag.moved), hop = walk ? Math.abs(Math.sin(M.ph)) * (M.onRecord && M.rideSpeed > 5.2 ? 10 : 5) : 0, bob = hop + (playing ? lv * 3 : Math.sin(t * 2) * .8) + (M.sit && !walk ? 4 : 0), fx = Math.cos((1 - M.sp) * TAU);
    E.bd.setAttribute('transform', `translate(50 118)scale(${M.face * (M.sp ? fx : 1) * sc * pop} ${sc * pop * (1 + (walk ? Math.sin(M.ph * 2) * .045 : Math.sin(t * 2) * .012))})translate(-50 -118)translate(0 ${-bob})`);
    const sw2 = walk ? Math.sin(M.ph) * 5 : M.sit ? Math.sin(t * 3) * 2 : 0; E.fl.setAttribute('cy', 115 + sw2); E.fr.setAttribute('cy', 115 - sw2); E.fl.setAttribute('cx', 35 + (walk ? Math.sin(M.ph) * 4 : 0)); E.fr.setAttribute('cx', 65 - (walk ? Math.sin(M.ph) * 4 : 0)); E.sh.setAttribute('opacity', .6 * sc);
    btn.style.transform = `translate3d(${M.x - size / 2}px,${M.y - .943 * size}px,0)${M.onRecord ? ` rotate(${Math.sin(t * 4) * (M.rideSpeed > 5.2 ? 18 : 4)}deg)` : ''}`;
    if (B && Math.hypot(B.px - M.x, B.py - M.y) > 8 && !B.sticky) place();
  }

  return () => { alive = false; interrupt(); ac.abort(); clearInterval(settle); clearTimeout(ht); clearTimeout(inviteTimer); btn.remove(); bub.remove(); ring.remove(); };
}
