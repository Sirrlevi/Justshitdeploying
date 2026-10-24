/* A working record deck. Nothing is scripted: the platter has momentum, the stylus follows the groove, and
   sound is whatever the groove does at the speed the record is turning (held still = silence, backwards = reversed). */

import {
  C, P, R_OUT, R_IN, DEG, clamp, wrapPi, OMEGA0, THETA_REST, THETA_IN, THETA_MIN,
  thetaForD, dForTheta, fForD, dForF
} from './geom.js';
import { DeckAudio } from './audio.js';
import { initMascot } from './mascot.js';
import { buildArm, buildDecor, buildLever, buildTicks, LEVER, LEVER_SIL } from './parts.js';

const $ = (s) => document.querySelector(s);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

const el = {
  deck: $('#deck'), spin: $('#spin'), record: $('#record'), platterHit: $('#platterHit'),
  armSvg: $('#armSvg'), armDefs: $('#armDefs'), arm: $('#arm'), armShadow: $('#armShadow'),
  decorStatic: $('#decorStatic'), restStand: $('#restStand'),
  lever: $('#lever'), leverBody: $('#leverBody'), leverShadow: $('#leverShadow'), leverHit: $('#leverHit'),
  armKey: $('#armKey'), power: $('#power'), volume: $('#volume'), trim: $('#trim'), lamp: $('#lamp'),
  prev: $('#prevBtn'), next: $('#nextBtn'),
  meta: $('.meta'), title: $('#title'), artist: $('#artist'), hint: $('#hint'),
  seek: $('#seek'), tCur: $('#tCur'), tDur: $('#tDur'), dots: $('#dots')
};

/* ───────── tuning ───────── */
const LIFT_PARKED = 0.42;           // arm height while resting in its stand (0 = in the groove, 1 = held in the air)
const LIFT_CUE = 0.78;              // raised by the cue lever
const CONTACT = 0.14;               // stylus touches the record below this height
const OMEGA_MAX = 30;               // rad/s a flick can reach
const SW_OFF = -50, SW_ON = 50;     // switch positions, degrees
const REST_TOLERANCE = 4.5 / DEG;

/* ───────── state ───────── */
const S = {
  tracks: [], dur: [], span: [], cum: [0], total: 1,
  rec: { index: 0, pos: 0 },        // where the stylus is on the record
  motor: false, omega: 0, spin: 0, releaseT: 0,
  trim: 0, volume: 0.8,
  arm: { mode: 'parked', theta: THETA_REST, lift: LIFT_PARKED, fly: null, cueRaised: false },
  hold: null, grab: null,
  sw: { angle: SW_OFF, vel: 0, target: SW_OFF, drag: null },
  lever: { angle: LEVER.down, vel: 0 },
  glow: 0, shownIndex: -1, hintState: '', succeeded: false
};
const A = S.arm;
const audio = new DeckAudio([], onAudio);

/* ───────── build artwork ───────── */
const art = buildArm();
el.armDefs.innerHTML = art.defs;
el.arm.innerHTML = art.body;
el.armShadow.innerHTML = art.sil;
const decor = buildDecor();
el.decorStatic.innerHTML = decor.stat;
el.restStand.innerHTML = decor.stand;
el.leverBody.innerHTML = buildLever();
el.leverShadow.innerHTML = LEVER_SIL;
$('#volTicks').innerHTML = buildTicks();
const armBlur = $('#armBlur');
el.powerRotor = el.power.querySelector('.power__rotor');

/* ───────── record geometry ───────── */
const thetaForRec = (index, pos) => thetaForD(dForF(clamp((S.cum[index] + pos) / S.total, 0, 1)));
function locate(f) {
  const t = f * S.total;
  let i = S.tracks.findIndex((_, k) => t < S.cum[k + 1]);
  if (i < 0) i = S.tracks.length - 1;
  return { index: i, pos: clamp(t - S.cum[i], 0, Math.max(0, S.span[i] - 0.3)) };
}
function relayout() {
  const known = S.dur.filter(Boolean);
  const fill = known.length ? known.reduce((a, b) => a + b, 0) / known.length : 1;
  S.span = S.dur.map((v) => v || fill);
  S.cum = [0];
  S.span.forEach((v) => S.cum.push(S.cum[S.cum.length - 1] + v));
  S.total = S.cum[S.cum.length - 1] || 1;
  el.record.querySelectorAll('.gap').forEach((n) => n.remove());
  const label = el.record.querySelector('.label');
  for (let i = 1; i < S.tracks.length; i++) {
    const ring = document.createElement('div');
    ring.className = 'gap';
    ring.style.setProperty('--r', (R_OUT - (S.cum[i] / S.total) * (R_OUT - R_IN)).toFixed(2));
    el.record.insertBefore(ring, label);
  }
}

/* ───────── tracks ───────── */
async function loadTracks() {
  let list = null;
  try {
    const res = await fetch('/songs/songs.json', { cache: 'no-cache' });
    if (res.ok) list = (await res.json()).tracks;
  } catch { /* fall through */ }
  if (!Array.isArray(list) || !list.length) list = ['song1.m4a', 'song2.mp3', 'song3.m4a'].map((f, i) => ({ filename: f, title: `Track ${i + 1}` }));
  S.tracks = list.map((t) => ({ url: `/songs/${t.filename}`, title: t.title || '', artist: t.artist || '' }));
  S.dur = list.map((t) => (Number(t.duration) > 0 ? Number(t.duration) : 0));
  audio.tracks = S.tracks;
  relayout();
  setMeta(0, true);
  buildDots();
  audio.setVolume(S.volume);
}

function setMeta(index, instant) {
  if (index === S.shownIndex || !S.tracks[index]) return;
  S.shownIndex = index;
  const t = S.tracks[index];
  const write = () => {
    el.title.textContent = t.title;
    el.artist.textContent = t.artist;
    el.artist.hidden = !t.artist;
    el.meta.classList.remove('swap');
  };
  if (instant || reduceMotion.matches) return write();
  el.meta.classList.add('swap');
  setTimeout(() => { if (S.shownIndex === index) write(); }, 200);
}

/* ───────── audio events ───────── */
function onAudio(m) {
  if (m.type === 'duration') {
    if (Math.abs((S.dur[m.index] || 0) - m.duration) > 0.05) { S.dur[m.index] = m.duration; relayout(); }
    return;
  }
  if (m.type !== 'pos') return;
  audio.selected = m.index;
  if (S.contact && !S.needSelect) {          // only a stylus that is in the groove can move the record position
    S.rec.index = m.index;
    S.rec.pos = m.pos;
  }
  if (m.edge === 'end') {
    if (m.index < S.tracks.length - 1) {
      audio.ensure(m.index + 1).then(() => { S.rec.index = m.index + 1; S.rec.pos = 0; audio.select(m.index + 1, 0); });
    } else endOfSide();
  } else if (m.edge === 'start' && m.index > 0) {
    const prev = m.index - 1;
    audio.ensure(prev).then((d) => { S.rec.index = prev; S.rec.pos = Math.max(0, (d || S.span[prev]) - 0.05); audio.select(prev, S.rec.pos); });
  }
}

/* ───────── arm actions ───────── */
function pickUp() { A.mode = 'held'; A.cueRaised = false; S.contact = false; }
function flyTo(theta, then) { A.mode = 'flying'; A.fly = { theta, then }; A.cueRaised = false; S.contact = false; }
function park() { flyTo(THETA_REST, 'park'); }

function cueTo(index, pos) {
  S.rec = { index, pos };
  S.needSelect = true;
  audio.keepNear(index);
  flyTo(thetaForRec(index, pos), 'down');
}

function dropAt(theta) {
  const d = dForTheta(theta);
  if (d <= R_OUT + 5) {
    const at = locate(Math.min(fForD(d), 0.995));
    S.rec = at;
    S.needSelect = true;
    A.mode = 'down';
    A.cueRaised = false;
    audio.keepNear(at.index);
  } else if (Math.abs(theta - THETA_REST) <= REST_TOLERANCE) {
    A.mode = 'parked';
  } else park();
}

function autoCue() { setMotor(true); cueTo(S.rec.index, S.rec.pos); }
function skipTo(i) {
  const n = S.tracks.length;
  if (!n) return;
  setMotor(true);
  cueTo((i + n) % n, 0);
}
function endOfSide() {
  if (A.mode !== 'down') return;
  S.rec = { index: 0, pos: 0 };
  park();
  setMotor(false);
}

/* ───────── motor + switch ───────── */
function setMotor(on) {
  S.motor = on;
  S.sw.target = on ? SW_ON : SW_OFF;
  el.power.setAttribute('aria-checked', String(on));
  if (on) audio.unlock().then(() => audio.keepNear(S.rec.index));
}

el.power.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  e.preventDefault();
  el.power.setPointerCapture(e.pointerId);
  const r = el.power.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  S.sw.drag = { id: e.pointerId, cx, cy, ang0: Math.atan2(e.clientY - cy, e.clientX - cx), a0: S.sw.angle, moved: false, t0: performance.now() };
  el.power.classList.add('is-grabbing');
});
el.power.addEventListener('pointermove', (e) => {
  const d = S.sw.drag;
  if (!d || e.pointerId !== d.id) return;
  const delta = wrapPi(Math.atan2(e.clientY - d.cy, e.clientX - d.cx) - d.ang0) * DEG;
  if (Math.abs(delta) > 4) d.moved = true;
  if (d.moved) { S.sw.angle = clamp(d.a0 + delta, SW_OFF - 6, SW_ON + 6); S.sw.vel = 0; }
});
const endSwitch = (e, cancel) => {
  const d = S.sw.drag;
  if (!d || e.pointerId !== d.id) return;
  S.sw.drag = null;
  el.power.classList.remove('is-grabbing');
  if (cancel) return;
  if (!d.moved) setMotor(!S.motor);
  else setMotor(S.sw.angle > 0);
};
el.power.addEventListener('pointerup', (e) => endSwitch(e, false));
el.power.addEventListener('pointercancel', (e) => endSwitch(e, true));
el.power.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setMotor(!S.motor); } });

/* ───────── generic rotary dial (volume, speed trim) ───────── */
function bindDial(node, { get, set, range, arc, detent = 0, label }) {
  const rotor = node.querySelector('[class$="__rotor"]');
  let drag = null;
  const paint = () => {
    const t = (get() - range[0]) / (range[1] - range[0]);
    rotor.style.setProperty('--rot', (arc[0] + (arc[1] - arc[0]) * t).toFixed(2) + 'deg');
    node.setAttribute('aria-valuenow', String(Math.round(label(get()))));
  };
  node.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    node.setPointerCapture(e.pointerId);
    const r = node.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    drag = { id: e.pointerId, cx, cy, last: Math.atan2(e.clientY - cy, e.clientX - cx) };
    node.classList.add('is-grabbing');
    audio.unlock();
  });
  node.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const ang = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx);
    const d = wrapPi(ang - drag.last) * DEG;
    drag.last = ang;
    const span = arc[1] - arc[0];
    set(clamp(get() + (d / span) * (range[1] - range[0]), range[0], range[1]));
    paint();
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    node.classList.remove('is-grabbing');
    if (detent && Math.abs(get()) < detent) { set(0); paint(); }
  };
  node.addEventListener('pointerup', end);
  node.addEventListener('pointercancel', end);
  node.addEventListener('wheel', (e) => { e.preventDefault(); set(clamp(get() - Math.sign(e.deltaY) * (range[1] - range[0]) * 0.04, range[0], range[1])); paint(); }, { passive: false });
  node.addEventListener('keydown', (e) => {
    const step = (range[1] - range[0]) * 0.05;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') set(clamp(get() + step, range[0], range[1]));
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') set(clamp(get() - step, range[0], range[1]));
    else return;
    e.preventDefault();
    paint();
  });
  paint();
  return paint;
}

try { const v = parseFloat(localStorage.getItem('deck.volume')); if (v >= 0 && v <= 1) S.volume = v; } catch { /* storage unavailable */ }
bindDial(el.volume, {
  get: () => S.volume,
  set: (v) => { S.volume = v; audio.setVolume(v); try { localStorage.setItem('deck.volume', v.toFixed(3)); } catch { /* ignore */ } },
  range: [0, 1], arc: [-135, 135], label: (v) => v * 100
});
bindDial(el.trim, {
  get: () => S.trim, set: (v) => { S.trim = v; },
  range: [-1, 1], arc: [-135, 135], detent: 0.07, label: (v) => v * 6
});

/* ───────── record: put a finger on it ───────── */
const toDesign = (e) => {
  const r = el.deck.getBoundingClientRect();
  const s = 1120 / r.width;
  return { x: (e.clientX - r.left) * s, y: (e.clientY - r.top) * s };
};

el.platterHit.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  e.preventDefault();
  el.platterHit.setPointerCapture(e.pointerId);
  audio.unlock().then(() => audio.keepNear(S.rec.index));
  const q = toDesign(e);
  S.hold = {
    id: e.pointerId, t0: performance.now(), x0: e.clientX, y0: e.clientY, active: false, travel: 0,
    lastAng: Math.atan2(q.y - C.y, q.x - C.x), lastT: e.timeStamp, vel: 0, lastMove: performance.now()
  };
});
el.platterHit.addEventListener('pointermove', (e) => {
  const h = S.hold;
  if (!h || e.pointerId !== h.id) return;
  const q = toDesign(e);
  const dx = q.x - C.x, dy = q.y - C.y, r = Math.hypot(dx, dy);
  if (r < 40) return;
  const ang = Math.atan2(dy, dx);
  const d = wrapPi(ang - h.lastAng);
  const dt = Math.max(4, e.timeStamp - h.lastT) / 1000;
  h.travel += Math.abs(d) * r;
  h.lastAng = ang; h.lastT = e.timeStamp;
  if (!h.active && h.travel > 8) activateHold(h);
  if (h.active) {
    S.spin += d;
    h.vel = h.vel * 0.5 + (d / dt) * 0.5;
    h.lastMove = performance.now();
  }
});
function activateHold(h) {
  h.active = true;
  S.releaseT = 0;
  el.platterHit.classList.add('is-grabbing');
}
function endHold(e, cancel) {
  const h = S.hold;
  if (!h || e.pointerId !== h.id) return;
  S.hold = null;
  el.platterHit.classList.remove('is-grabbing');
  if (h.active) { S.releaseT = 1.4; return; }
  if (!cancel && performance.now() - h.t0 < 240) setMotor(!S.motor);      // a tap works the switch
}
el.platterHit.addEventListener('pointerup', (e) => endHold(e, false));
el.platterHit.addEventListener('pointercancel', (e) => endHold(e, true));

/* ───────── tonearm: grab, lift, carry ───────── */
el.arm.addEventListener('pointerdown', (e) => {
  if (!e.target.classList.contains('arm-hit')) return;
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  e.preventDefault();
  el.arm.setPointerCapture(e.pointerId);
  audio.unlock().then(() => audio.keepNear(S.rec.index));
  const q = toDesign(e);
  S.grab = {
    id: e.pointerId, ang0: Math.atan2(q.y - P.y, q.x - P.x), theta0: A.theta, theta: A.theta,
    x0: e.clientX, y0: e.clientY, t0: performance.now(), moved: false, mode0: A.mode
  };
  pickUp();
  el.armSvg.classList.add('is-grabbing');
});
el.arm.addEventListener('pointermove', (e) => {
  const g = S.grab;
  if (!g || e.pointerId !== g.id) return;
  if (!g.moved && Math.hypot(e.clientX - g.x0, e.clientY - g.y0) < 6) return;
  g.moved = true;
  const q = toDesign(e);
  g.theta = clamp(g.theta0 + wrapPi(Math.atan2(q.y - P.y, q.x - P.x) - g.ang0), THETA_MIN, THETA_IN);
});
function endGrab(e, cancel) {
  const g = S.grab;
  if (!g || e.pointerId !== g.id) return;
  S.grab = null;
  el.armSvg.classList.remove('is-grabbing');
  if (cancel) return dropAt(g.theta);
  if (!g.moved && performance.now() - g.t0 < 260) {          // a tap: let the deck do it
    if (g.mode0 === 'down') park(); else autoCue();
    return;
  }
  dropAt(g.theta);
}
el.arm.addEventListener('pointerup', (e) => endGrab(e, false));
el.arm.addEventListener('pointercancel', (e) => endGrab(e, true));

/* cue lever: lifts the arm where it is */
let leverNudge = 0;
const leverToggle = () => {
  if (A.mode === 'down') A.cueRaised = !A.cueRaised;
  else leverNudge = 7;                                      // locked while the arm is not over the record
};
el.armKey.addEventListener('click', () => { audio.unlock(); if (A.mode === 'down') park(); else autoCue(); });
el.leverHit.addEventListener('pointerdown', (e) => { e.preventDefault(); audio.unlock(); leverToggle(); });
el.lever.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); leverToggle(); } });

/* track buttons + keys */
el.prev.addEventListener('click', () => {
  audio.unlock();
  skipTo(A.mode === 'down' && S.rec.pos > 3 ? S.rec.index : S.rec.index - 1);
});
el.next.addEventListener('click', () => { audio.unlock(); skipTo(S.rec.index + 1); });
addEventListener('keydown', (e) => {
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target.closest && e.target.closest('button,a,[role="slider"],[role="switch"],[role="button"],input,textarea')) return;
  if (e.code === 'Space') { e.preventDefault(); setMotor(!S.motor); }
  else if (e.key === 'ArrowRight') skipTo(S.rec.index + 1);
  else if (e.key === 'ArrowLeft') skipTo(S.rec.index - 1);
});
addEventListener('pointerdown', () => audio.unlock(), { capture: true, passive: true });

/* ───────── hint ───────── */
const seen = () => { try { return localStorage.getItem('deck.played') === '1'; } catch { return false; } };
S.succeeded = seen();
let hintTimer = setTimeout(() => { S.hintReady = true; }, 1800);
function updateHint() {
  let want = '';
  if (!S.succeeded && S.hintReady) {
    if (!S.motor && A.mode !== 'down') want = 'flip the switch';
    else if (A.mode === 'parked' || A.mode === 'flying') want = 'lift the arm onto the record';
  }
  if (want === S.hintState) return;
  S.hintState = want;
  el.hint.classList.remove('show');
  setTimeout(() => { if (S.hintState === want) { el.hint.textContent = want; if (want) el.hint.classList.add('show'); } }, 260);
}

/* ───────── frame loop ───────── */
let last = performance.now();
let paintedSpin = NaN, paintedTheta = NaN, paintedLift = NaN, paintedLever = NaN;
const lamp = { tx: 0, ty: 0, x: 0, y: 0 };
const root = document.documentElement;
if (matchMedia('(pointer: fine)').matches) {
  addEventListener('pointermove', (e) => { lamp.tx = e.clientX / innerWidth - 0.5; lamp.ty = e.clientY / innerHeight - 0.5; }, { passive: true });
}
const spring = (o, target, k, c, dt) => {
  const n = Math.max(1, Math.ceil(dt / 0.004)), h = dt / n;     // small steps keep the spring stable on slow frames
  for (let i = 0; i < n; i++) { o.vel += ((target - o.angle) * k - o.vel * c) * h; o.angle += o.vel * h; }
};

function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  const still = reduceMotion.matches;

  /* platter */
  const h = S.hold;
  if (h && !h.active && now - h.t0 > 240) activateHold(h);        // a resting finger is a brake
  if (h && h.active) {
    if (now - h.lastMove > 100) h.vel *= Math.exp(-dt / 0.06);
    S.omega = clamp(h.vel, -OMEGA_MAX, OMEGA_MAX);
  } else {
    const w0 = OMEGA0 * (1 + 0.06 * S.trim);
    const target = S.motor ? w0 : 0;
    const tau = S.motor ? (S.releaseT > 0 ? 0.32 : 0.55) : 1.1;
    S.omega += (target - S.omega) * (1 - Math.exp(-dt / tau));
    if (!S.motor) {                                           // bearing friction: it really does come to rest
      S.omega -= Math.sign(S.omega) * 0.5 * dt;
      if (Math.abs(S.omega) < 0.06) S.omega = 0;
    }
    S.spin += S.omega * dt * (still ? 0.25 : 1);
    S.releaseT = Math.max(0, S.releaseT - dt);
  }

  /* tonearm */
  let tTheta, tLift, tau;
  const g = S.grab;
  if (A.mode === 'held') { tTheta = g ? g.theta : A.theta; tLift = 1; tau = 0.05; }
  else if (A.mode === 'flying') {
    tTheta = A.lift > 0.72 ? A.fly.theta : A.theta; tLift = 1; tau = 0.26;
    if (Math.abs(A.theta - A.fly.theta) < 0.0035 && A.lift > 0.9) { A.mode = A.fly.then === 'down' ? 'down' : 'parked'; }
  } else if (A.mode === 'down') {
    tTheta = thetaForRec(S.rec.index, S.rec.pos);
    tLift = A.cueRaised ? LIFT_CUE : 0;
    tau = 0.07;
  } else { tTheta = THETA_REST; tLift = LIFT_PARKED; tau = 0.3; }
  if (still) tau = 0.001;
  A.theta += (tTheta - A.theta) * (1 - Math.exp(-dt / tau));
  A.lift += (tLift - A.lift) * (1 - Math.exp(-dt / (still ? 0.001 : A.mode === 'down' && !A.cueRaised ? 0.12 : 0.16)));

  /* groove → sound */
  const contact = A.mode === 'down' && !A.cueRaised && A.lift < CONTACT;
  S.contact = contact;
  if (contact) {
    const rate = S.omega / OMEGA0;
    stepRecord(rate * dt);
    const i = S.rec.index;
    if (audio.isReady(i)) {
      if (S.needSelect || audio.selected !== i) { S.needSelect = false; audio.select(i, S.rec.pos); }
      audio.setRate(rate);
    } else { audio.setRate(0); audio.ensure(i); }
    if (!S.succeeded && S.motor && Math.abs(rate) > 0.5) {
      S.succeeded = true;
      try { localStorage.setItem('deck.played', '1'); } catch { /* ignore */ }
    }
  } else audio.setRate(0);
  audio.tick();

  /* controls */
  if (!S.sw.drag) spring(S.sw, S.sw.target, 900, 36, dt);
  S.glow += ((S.motor ? 1 : 0) - S.glow) * (1 - Math.exp(-dt / (S.motor ? 0.22 : 0.45)));
  leverNudge *= Math.exp(-dt / 0.1);
  const leverTarget = A.cueRaised ? LEVER.up : LEVER.down;
  spring(S.lever, leverTarget, 520, 30, dt);

  paint(still);
  if (!still) {
    lamp.x += (lamp.tx - lamp.x) * (1 - Math.exp(-dt / 0.35));
    lamp.y += (lamp.ty - lamp.y) * (1 - Math.exp(-dt / 0.35));
    root.style.setProperty('--lamp-x', (42 + lamp.x * 7).toFixed(2) + '%');
    root.style.setProperty('--lamp-y', (38 + lamp.y * 6).toFixed(2) + '%');
    el.deck.style.setProperty('--lx', (22 + lamp.x * 12).toFixed(2) + '%');
    el.deck.style.setProperty('--ly', (6 + lamp.y * 10).toFixed(2) + '%');
  }
  updateHint();
  requestAnimationFrame(frame);
}

/* local extrapolation between worklet position reports; the worklet is the source of truth when it speaks */
function stepRecord(dp) {
  const r = S.rec;
  r.pos += dp;
  const last = S.tracks.length - 1;
  while (r.pos > S.span[r.index] && r.index < last) { r.pos -= S.span[r.index]; r.index++; }
  while (r.pos < 0 && r.index > 0) { r.index--; r.pos += S.span[r.index]; }
  if (r.pos < 0) r.pos = 0;
  if (r.index === last && r.pos >= S.span[last] - 0.02) { r.pos = S.span[last] - 0.02; if (audio.mode !== 'worklet' || dp > 0) endOfSide(); }
}

function paint(still) {
  if (S.spin !== paintedSpin) { paintedSpin = S.spin; el.spin.style.transform = `rotate(${(S.spin % (Math.PI * 2)).toFixed(4)}rad)`; }

  const deg = A.theta * DEG;
  if (!(Math.abs(deg - paintedTheta) <= 0.003 && Math.abs(A.lift - paintedLift) <= 0.002)) {
    paintedTheta = deg; paintedLift = A.lift;
    const s = 1 + 0.03 * A.lift;
    el.arm.setAttribute('transform', `translate(${P.x} ${P.y}) rotate(${deg.toFixed(3)}) scale(${s.toFixed(4)})`);
    el.armShadow.setAttribute('transform', `translate(${(P.x + 7 + 20 * A.lift).toFixed(2)} ${(P.y + 10 + 28 * A.lift).toFixed(2)}) rotate(${deg.toFixed(3)}) scale(${s.toFixed(4)})`);
    armBlur.setAttribute('stdDeviation', (2.2 + 6 * A.lift).toFixed(2));
    el.armShadow.setAttribute('opacity', (0.55 - 0.15 * A.lift).toFixed(2));
  }

  const swDeg = S.sw.angle;
  el.powerRotor.style.setProperty('--rot', swDeg.toFixed(2) + 'deg');

  const la = S.lever.angle + leverNudge;
  if (!(Math.abs(la - paintedLever) <= 0.01)) {
    paintedLever = la;
    const lift = (LEVER.down - la) / (LEVER.down - LEVER.up);
    el.leverBody.setAttribute('transform', `translate(${LEVER.x} ${LEVER.y}) rotate(${la.toFixed(2)})`);
    el.leverShadow.setAttribute('transform', `translate(${(LEVER.x + 4 + 5 * lift).toFixed(2)} ${(LEVER.y + 6 + 7 * lift).toFixed(2)}) rotate(${la.toFixed(2)})`);
    const a = la / DEG;
    el.leverHit.setAttribute('d', `M${LEVER.x} ${LEVER.y}L${(LEVER.x + 84 * Math.cos(a)).toFixed(1)} ${(LEVER.y + 84 * Math.sin(a)).toFixed(1)}`);
    el.lever.setAttribute('aria-pressed', String(A.cueRaised));
  }

  el.lamp.style.setProperty('--glow', S.glow.toFixed(3));

  // caption follows the groove under the stylus (or under the finger while the arm is carried)
  let idx = S.rec.index, pos = S.rec.pos;
  if (A.mode === 'held') {
    const th = S.grab ? S.grab.theta : A.theta;
    const d = dForTheta(th);
    if (d <= R_OUT + 5) { const at = locate(fForD(d)); idx = at.index; pos = at.pos; }
  }
  setMeta(idx);
  paintTransport(idx, seekDrag ? seekDrag.pos : pos);
}

/* ───────── transport: progress + track dots (read the real record position, drive the real arm) ───────── */
const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
let paintedT = '', paintedDot = -1, seekDrag = null;
function buildDots() {
  el.dots.textContent = '';
  S.tracks.forEach((t, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'dot';
    b.innerHTML = '<i></i><span></span>';
    b.lastChild.textContent = t.title || `Track ${i + 1}`;
    b.setAttribute('aria-label', `Play ${t.title || 'track ' + (i + 1)}`);
    b.addEventListener('click', () => { audio.unlock(); skipTo(i); });
    el.dots.appendChild(b);
  });
  paintedDot = -1;
}
function paintTransport(idx, pos) {
  const span = S.span[idx] || 0, f = span ? clamp(pos / span, 0, 1) : 0;
  const key = `${idx}|${fmt(pos)}|${fmt(span)}|${f.toFixed(4)}`;
  if (key !== paintedT) {
    paintedT = key;
    el.seek.style.setProperty('--p', (f * 100).toFixed(2) + '%');
    el.tCur.textContent = fmt(pos); el.tDur.textContent = fmt(span);
    el.seek.setAttribute('aria-valuenow', String(Math.round(f * 100)));
    el.seek.setAttribute('aria-valuetext', `${fmt(pos)} of ${fmt(span)}`);
  }
  if (idx !== paintedDot) {
    paintedDot = idx;
    el.dots.querySelectorAll('.dot').forEach((d, i) => { d.classList.toggle('is-on', i === idx); if (i === idx) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
  }
}
function seekTo(i, pos) {
  if (!S.tracks[i]) return;
  setMotor(true);
  cueTo(i, clamp(pos, 0, Math.max(0, (S.span[i] || 0) - 0.3)));
}
const seekFrac = (e) => { const r = el.seek.querySelector('.seek__bar').getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width, 0, 1); };
el.seek.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  if (S.shownIndex < 0) return;
  e.preventDefault();
  el.seek.setPointerCapture(e.pointerId);
  audio.unlock();
  seekDrag = { id: e.pointerId, idx: S.shownIndex, pos: seekFrac(e) * (S.span[S.shownIndex] || 0) };
  el.seek.classList.add('is-drag');
});
el.seek.addEventListener('pointermove', (e) => {
  if (seekDrag && e.pointerId === seekDrag.id) seekDrag.pos = seekFrac(e) * (S.span[seekDrag.idx] || 0);
});
const endSeek = (e, cancel) => {
  if (!seekDrag || e.pointerId !== seekDrag.id) return;
  const d = seekDrag; seekDrag = null;
  el.seek.classList.remove('is-drag');
  if (!cancel) seekTo(d.idx, d.pos);
};
el.seek.addEventListener('pointerup', (e) => endSeek(e, false));
el.seek.addEventListener('pointercancel', (e) => endSeek(e, true));
el.seek.addEventListener('keydown', (e) => {
  const step = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 5 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -5 : 0;
  if (!step) return;
  e.preventDefault();
  audio.unlock();
  seekTo(S.rec.index, S.rec.pos + step);
});

/* ───────── go ───────── */
loadTracks();
paint(false);
requestAnimationFrame(frame);

const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
const imagesReady = Promise.all([...document.images].map((i) => (i.decode ? i.decode().catch(() => {}) : Promise.resolve())));
Promise.race([Promise.all([fontsReady, imagesReady]), new Promise((r) => setTimeout(r, 1500))])
  .then(() => requestAnimationFrame(() => document.body.classList.add('is-ready')))
  .then(() => setTimeout(() => initMascot(S, audio), 1400));   // after the deck has settled, so it never perches on a moving edge

if (location.search.includes('debug')) window.__deck = { S, audio };
