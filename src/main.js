/* Record deck: one side of vinyl, three tracks, one tonearm.
   Everything on the deck is laid out on a 1120 × 884 grid (see styles.css). */

const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const wrapPi = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
const DEG = 180 / Math.PI;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

const el = {
  deck: $('#deck'), spin: $('#spin'), record: $('#record'),
  arm: $('#arm'), armShadow: $('#armShadow'), shadowBlur: $('#shadowBlur'), restPost: $('#restPost'),
  armHit: $('#armHit'), recordHit: $('#recordHit'), start: $('#startBtn'),
  prev: $('#prevBtn'), next: $('#nextBtn'),
  meta: $('.meta'), title: $('#title'), artist: $('#artist'), hint: $('#hint'),
  audio: $('#audio')
};

/* ───────── geometry (design units) ───────── */
const C = { x: 442, y: 442 };            // spindle
const P = { x: 960, y: 190 };            // tonearm pivot
const R_OUT = 338, R_IN = 135;           // first / last groove
const R_STOP = 124;                      // innermost the needle may travel
const R_REST = 424;                      // needle distance from spindle when parked
const HEAD = 14 / DEG;                   // headshell offset angle
const TIP = { x: 522 + 63.5 * Math.cos(HEAD), y: 63.5 * Math.sin(HEAD) };   // stylus in arm space
const L = Math.hypot(TIP.x, TIP.y), TIP_ANGLE = Math.atan2(TIP.y, TIP.x);
const D = Math.hypot(C.x - P.x, C.y - P.y), PSI = Math.atan2(C.y - P.y, C.x - P.x);

// arm rotation (radians) that puts the stylus at distance d from the spindle
const thetaForD = (d) => PSI - Math.acos(clamp((L * L + D * D - d * d) / (2 * L * D), -1, 1)) - TIP_ANGLE;
const dForTheta = (t) => Math.sqrt(Math.max(0, L * L + D * D - 2 * L * D * Math.cos(PSI - (t + TIP_ANGLE))));
const THETA_REST = thetaForD(R_REST), THETA_IN = thetaForD(R_STOP);
const fForD = (d) => clamp((R_OUT - d) / (R_OUT - R_IN), 0, 1);
const OMEGA = (Math.PI * 2 * 100) / 3 / 60;   // 33⅓ rpm

/* ───────── state ───────── */
const audio = el.audio;
const state = {
  tracks: [], dur: [], cum: [0], total: 1,
  index: 0, playing: false, onRecord: false, wait: false
};
let cueToken = 0;
let shownIndex = -1;

const arm = { theta: THETA_REST, lift: 1 };
let omega = 0, rot = 0;
let drag = null;

/* ───────── tracks ───────── */
const FALLBACK = ['song1', 'song2', 'song3'].map((n, i) => ({ filename: `${n}.mp3`, title: `Track ${i + 1}` }));

async function loadTracks() {
  let list = null;
  try {
    const res = await fetch('/songs/songs.json', { cache: 'no-cache' });
    if (res.ok) list = (await res.json()).tracks;
  } catch { /* fall through */ }
  if (!Array.isArray(list) || !list.length) list = FALLBACK;

  state.tracks = list.map((t) => ({ url: `/songs/${t.filename}`, title: t.title || '', artist: t.artist || '' }));
  state.dur = list.map((t) => (Number(t.duration) > 0 ? Number(t.duration) : 0));
  relayout();
  load(0);
  state.dur.forEach((d, i) => { if (!d) probeDuration(i); });
}

function probeDuration(i) {
  const a = new Audio();
  a.preload = 'metadata';
  a.addEventListener('loadedmetadata', () => {
    if (Number.isFinite(a.duration)) { state.dur[i] = a.duration; relayout(); }
  }, { once: true });
  a.src = state.tracks[i].url;
}

function relayout() {
  const known = state.dur.filter(Boolean);
  const fill = known.length ? known.reduce((a, b) => a + b, 0) / known.length : 1;
  const d = state.dur.map((v) => v || fill);
  state.cum = [0];
  d.forEach((v) => state.cum.push(state.cum[state.cum.length - 1] + v));
  state.total = state.cum[state.cum.length - 1] || 1;
  state.span = d;
  buildGaps();
}

function buildGaps() {
  el.record.querySelectorAll('.gap').forEach((n) => n.remove());
  const label = el.record.querySelector('.label');
  for (let i = 1; i < state.tracks.length; i++) {
    const r = R_OUT - (state.cum[i] / state.total) * (R_OUT - R_IN);
    const ring = document.createElement('div');
    ring.className = 'gap';
    ring.style.setProperty('--r', r.toFixed(2));
    el.record.insertBefore(ring, label);
  }
}

const fAt = (index, t) => clamp((state.cum[index] + t) / state.total, 0, 1);
function locate(f) {
  const time = f * state.total;
  let i = state.tracks.findIndex((_, k) => time < state.cum[k + 1]);
  if (i < 0) i = state.tracks.length - 1;
  return { index: i, time: clamp(time - state.cum[i], 0, Math.max(0, state.span[i] - 0.25)) };
}

function load(index) {
  state.index = index;
  audio.src = state.tracks[index].url;
  setMeta(index, true);
}

function setMeta(index, instant) {
  if (index === shownIndex) return;
  shownIndex = index;
  const t = state.tracks[index];
  const write = () => {
    el.title.textContent = t.title;
    el.artist.textContent = t.artist;
    el.artist.hidden = !t.artist;
    el.meta.classList.remove('swap');
  };
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: t.artist });
  }
  if (instant || reduceMotion.matches) return write();
  el.meta.classList.add('swap');
  setTimeout(() => { if (shownIndex === index) write(); }, 200);
}

/* ───────── transport ───────── */
function syncUI() {
  document.body.classList.toggle('playing', state.playing);
  const label = state.playing ? 'Pause' : 'Play';
  el.recordHit.setAttribute('aria-label', label);
  el.start.setAttribute('aria-label', label);
  if (!drag) setMeta(state.index);
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = state.playing ? 'playing' : 'paused';
}

function startAt(index, time) {
  const token = ++cueToken;
  state.wait = false;
  if (index !== state.index || !audio.getAttribute('src')) load(index);
  try { audio.currentTime = time; } catch { /* metadata not ready yet; browser keeps it as start position */ }
  state.onRecord = true;
  state.playing = true;
  syncUI();
  seenHint();
  const p = audio.play();
  if (p) p.catch(() => { if (token === cueToken) { state.playing = false; syncUI(); } });
}

function pause() {
  cueToken++;
  state.wait = false;
  audio.pause();
  state.playing = false;
  syncUI();
}

function toRest() {
  cueToken++;
  state.wait = false;
  audio.pause();
  state.playing = false;
  state.onRecord = false;
  load(0);
  syncUI();
}

function toggle() {
  if (state.playing) return pause();
  if (state.onRecord) return startAt(state.index, audio.currentTime || 0);
  startAt(0, 0);
}

function skip(dir) {
  const n = state.tracks.length;
  if (!n) return;
  if (dir < 0 && state.onRecord && audio.currentTime > 3) return startAt(state.index, 0);
  startAt((state.index + dir + n) % n, 0);
}

function onEnded() {
  const next = state.index + 1;
  if (next < state.tracks.length) return startAt(next, 0);
  // end of the side: lift, travel back to the first groove, drop again
  const token = ++cueToken;
  state.wait = true;
  load(0);
  setTimeout(() => { if (token === cueToken) startAt(0, 0); }, 1500);
}

audio.addEventListener('ended', onEnded);
audio.addEventListener('play', () => { if (!state.playing && !drag) { state.playing = true; state.onRecord = true; syncUI(); } });
audio.addEventListener('pause', () => {
  if (audio.ended || state.wait || drag) return;
  if (state.playing) { state.playing = false; syncUI(); }
});
audio.addEventListener('error', () => { if (state.playing) { state.playing = false; syncUI(); } });

let lastAria = 0;
audio.addEventListener('timeupdate', () => {
  const now = performance.now();
  if (now - lastAria < 900) return;
  lastAria = now;
  const t = state.tracks[state.index];
  el.armHit.setAttribute('aria-valuenow', String(Math.round(fAt(state.index, audio.currentTime) * 100)));
  if (t) el.armHit.setAttribute('aria-valuetext', t.title);
});

if ('mediaSession' in navigator) {
  const ms = navigator.mediaSession;
  ms.setActionHandler('play', () => { if (!state.playing) toggle(); });
  ms.setActionHandler('pause', () => { if (state.playing) pause(); });
  ms.setActionHandler('nexttrack', () => skip(1));
  ms.setActionHandler('previoustrack', () => skip(-1));
}

/* ───────── hint ───────── */
let hintTimer = null;
const seen = () => { try { return localStorage.getItem('deck.seen') === '1'; } catch { return false; } };
function seenHint() {
  clearTimeout(hintTimer);
  el.hint.classList.remove('show');
  try { localStorage.setItem('deck.seen', '1'); } catch { /* storage unavailable */ }
}
if (!seen()) hintTimer = setTimeout(() => el.hint.classList.add('show'), 1800);

/* ───────── input ───────── */
el.recordHit.addEventListener('click', toggle);
el.start.addEventListener('click', toggle);
el.prev.addEventListener('click', () => skip(-1));
el.next.addEventListener('click', () => skip(1));

const toDesign = (e) => {
  const r = el.deck.getBoundingClientRect();
  const s = 1120 / r.width;
  return { x: (e.clientX - r.left) * s, y: (e.clientY - r.top) * s };
};

el.armHit.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  e.preventDefault();
  el.armHit.setPointerCapture(e.pointerId);
  const q = toDesign(e);
  drag = {
    id: e.pointerId, ang0: Math.atan2(q.y - P.y, q.x - P.x), theta0: arm.theta, theta: arm.theta,
    x0: e.clientX, y0: e.clientY, moved: false, wasPlaying: state.playing
  };
  if (state.playing) { cueToken++; state.wait = false; audio.pause(); state.playing = false; syncUI(); }
  el.armHit.classList.add('is-dragging');
});

el.armHit.addEventListener('pointermove', (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 5) return;
  drag.moved = true;
  const q = toDesign(e);
  const ang = Math.atan2(q.y - P.y, q.x - P.x);
  drag.theta = clamp(drag.theta0 + wrapPi(ang - drag.ang0), THETA_REST, THETA_IN);
  const d = dForTheta(drag.theta);
  setMeta(d <= R_OUT + 10 ? locate(fForD(d)).index : state.index);
});

function endDrag(e, cancelled) {
  if (!drag || e.pointerId !== drag.id) return;
  const d0 = drag;
  drag = null;
  el.armHit.classList.remove('is-dragging');
  try { el.armHit.releasePointerCapture(e.pointerId); } catch { /* already released */ }
  if (cancelled) return d0.wasPlaying ? startAt(state.index, audio.currentTime) : syncUI();
  if (!d0.moved) {                                   // a tap on the arm behaves like start / stop
    if (d0.wasPlaying) { state.onRecord = true; return syncUI(); }
    return toggle();
  }
  const d = dForTheta(d0.theta);
  if (d > R_OUT + 10) return toRest();
  const at = locate(fForD(d));
  startAt(at.index, at.time);
}
el.armHit.addEventListener('pointerup', (e) => endDrag(e, false));
el.armHit.addEventListener('pointercancel', (e) => endDrag(e, true));

el.armHit.addEventListener('keydown', (e) => {
  const act = { ArrowRight: () => skip(1), ArrowDown: () => skip(1), ArrowLeft: () => skip(-1), ArrowUp: () => skip(-1), Enter: toggle, ' ': toggle }[e.key];
  if (act) { e.preventDefault(); act(); }
});
addEventListener('keydown', (e) => {
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target.closest && e.target.closest('button,a,[role="slider"],input,textarea')) return;
  if (e.code === 'Space') { e.preventDefault(); toggle(); }
  else if (e.key === 'ArrowRight') skip(1);
  else if (e.key === 'ArrowLeft') skip(-1);
});

/* ───────── arm rest ───────── */
(function buildRestPost() {
  const s = 498;
  const x = P.x + s * Math.cos(THETA_REST), y = P.y + s * Math.sin(THETA_REST);
  el.restPost.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(THETA_REST * DEG + 90).toFixed(2)})`);
  el.restPost.innerHTML = `
    <filter id="fPost" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.6"/></filter>
    <rect x="-18" y="-11" width="44" height="30" rx="8" fill="#000" opacity=".5" filter="url(#fPost)"/>
    <rect x="-22" y="-15" width="44" height="30" rx="8" fill="url(#gTube)"/>
    <rect x="-22" y="-15" width="44" height="30" rx="8" fill="none" stroke="#000" stroke-opacity=".35"/>
    <rect x="-13" y="-5.5" width="26" height="11" rx="5.5" fill="#141311"/>
    <rect x="-13" y="-5.5" width="26" height="11" rx="5.5" fill="none" stroke="#fff" stroke-opacity=".1"/>`;
})();

/* ───────── frame loop ───────── */
let last = performance.now();
let appliedDeg = NaN, appliedLift = NaN;
const lamp = { tx: 0, ty: 0, x: 0, y: 0 };
const root = document.documentElement;

if (matchMedia('(pointer: fine)').matches) {
  addEventListener('pointermove', (e) => { lamp.tx = e.clientX / innerWidth - 0.5; lamp.ty = e.clientY / innerHeight - 0.5; }, { passive: true });
}

function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  const still = reduceMotion.matches;

  // platter: eased motor, long coast when it stops
  const spinning = (state.playing || (drag && drag.wasPlaying)) && !still;
  const target = spinning ? OMEGA : 0;
  omega += (target - omega) * (1 - Math.exp(-dt / (target ? 0.9 : 1.9)));
  if (omega > 0.004) {
    rot = (rot + omega * dt) % (Math.PI * 2);
    el.spin.style.transform = `rotate(${rot.toFixed(4)}rad)`;
  }

  // tonearm
  let tTheta, tLift, tau;
  if (drag) { tTheta = drag.theta; tLift = 1; tau = 0.05; }
  else if (state.onRecord) {
    tTheta = thetaForD(R_OUT - fAt(state.index, audio.currentTime || 0) * (R_OUT - R_IN));
    tLift = state.playing && !state.wait ? 0 : 1;
    tau = 0.32;
  } else { tTheta = THETA_REST; tLift = 1; tau = 0.5; }
  if (still) tau = 0.001;
  arm.theta += (tTheta - arm.theta) * (1 - Math.exp(-dt / tau));
  arm.lift += (tLift - arm.lift) * (1 - Math.exp(-dt / (still ? 0.001 : 0.22)));
  paintArm();

  // lamp follows the pointer, barely
  if (!still) {
    lamp.x += (lamp.tx - lamp.x) * (1 - Math.exp(-dt / 0.35));
    lamp.y += (lamp.ty - lamp.y) * (1 - Math.exp(-dt / 0.35));
    root.style.setProperty('--lamp-x', (42 + lamp.x * 7).toFixed(2) + '%');
    root.style.setProperty('--lamp-y', (40 + lamp.y * 6).toFixed(2) + '%');
    el.deck.style.setProperty('--lx', (22 + lamp.x * 12).toFixed(2) + '%');
    el.deck.style.setProperty('--ly', (6 + lamp.y * 10).toFixed(2) + '%');
  }
  requestAnimationFrame(frame);
}

function paintArm() {
  const deg = arm.theta * DEG;
  if (Math.abs(deg - appliedDeg) < 0.003 && Math.abs(arm.lift - appliedLift) < 0.002) return;
  appliedDeg = deg; appliedLift = arm.lift;
  const s = 1 + 0.012 * arm.lift;
  el.arm.setAttribute('transform', `translate(${P.x} ${P.y}) rotate(${deg.toFixed(3)}) scale(${s.toFixed(4)})`);
  el.armShadow.setAttribute('transform', `translate(${(P.x + 8 + 16 * arm.lift).toFixed(2)} ${(P.y + 11 + 22 * arm.lift).toFixed(2)}) rotate(${deg.toFixed(3)}) scale(${s.toFixed(4)})`);
  el.shadowBlur.setAttribute('stdDeviation', (2.4 + 4.4 * arm.lift).toFixed(2));
  el.armHit.style.transform = `rotate(${deg.toFixed(3)}deg) translateY(-50%)`;
}

/* ───────── go ───────── */
paintArm();
requestAnimationFrame(frame);
loadTracks();

const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
const imagesReady = Promise.all([...document.images].map((i) => (i.decode ? i.decode().catch(() => {}) : Promise.resolve())));
Promise.race([Promise.all([fontsReady, imagesReady]), new Promise((r) => setTimeout(r, 1200))])
  .then(() => requestAnimationFrame(() => document.body.classList.add('is-ready')));
