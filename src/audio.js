/* Sound comes from wherever the stylus is in the groove, at whatever speed the platter is turning.
   Preferred path: decoded PCM + an AudioWorklet (any speed, forwards or backwards, held still = silence).
   Fallback: a plain <audio> element (forward only), used if the worklet or decoding is unavailable. */

import { clamp } from './geom.js';

/* 16-bit copy of a channel, done in slices so the page keeps animating while a track is prepared */
const tick = () => new Promise((r) => setTimeout(r, 0));
async function toInt16(f) {
  const o = new Int16Array(f.length);
  const STEP = 1 << 17;
  for (let s = 0; s < f.length; s += STEP) {
    const e = Math.min(f.length, s + STEP);
    for (let i = s; i < e; i++) { const v = f[i]; o[i] = v <= -1 ? -32768 : v >= 1 ? 32767 : (v * 32767) | 0; }
    if (e < f.length) await tick();
  }
  return o;
}

export class DeckAudio {
  constructor(tracks, onEvent) {
    this.tracks = tracks;
    this.onEvent = onEvent;
    this.mode = 'idle';            // idle → worklet | element
    this.volume = 0.8;
    this.seq = 0;
    this.selected = -1;
    this.loaded = new Map();       // index → Promise<duration>
    this.done = new Set();
    this.lastRate = 0;
    this._boot = null;
    this.el = null;
  }

  /* Call from a user gesture. Safe to call repeatedly. */
  unlock() {
    // let Web Audio play even when an iPhone's silent switch is on (Safari 16.4+)
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* unsupported */ }
    if (!this._boot) this._boot = this._start();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this._boot;
  }

  async _start() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC || !window.AudioWorkletNode) throw new Error('no worklet');
      this.ctx = new AC({ latencyHint: 'interactive' });
      await this.ctx.audioWorklet.addModule('/worklet.js');
      this.node = new AudioWorkletNode(this.ctx, 'deck', { numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2] });
      this.rateParam = this.node.parameters.get('rate');
      this.gain = this.ctx.createGain();
      this.gain.gain.value = this.volume * this.volume;
      this.node.connect(this.gain).connect(this.ctx.destination);
      this.an = this.ctx.createAnalyser(); this.an.fftSize = 1024; this.an.smoothingTimeConstant = 0.3; this.node.connect(this.an); this.abuf = new Uint8Array(this.an.fftSize); this.fbuf = new Float32Array(this.an.frequencyBinCount);   // passive tap for the mascot's lip-sync
      this.node.port.onmessage = (e) => { const m = e.data; if (m.type === 'pos' && m.seq === this.seq) this.onEvent(m); };
      if (this.ctx.state === 'suspended') await this.ctx.resume().catch(() => {});
      this.mode = 'worklet';
    } catch {
      this._useElement();
    }
    return this.mode;
  }

  _useElement() {
    this.mode = 'element';
    const a = this.el = new Audio();
    a.preload = 'auto';
    a.preservesPitch = a.mozPreservesPitch = a.webkitPreservesPitch = false;
    a.volume = this.volume * this.volume;
    a.addEventListener('ended', () => this.onEvent({ type: 'pos', index: this.selected, pos: a.duration || 0, edge: 'end' }));
  }

  isReady(i) { return this.mode === 'element' || this.done.has(i); }

  /* decode a track and hand it to the worklet; resolves to its duration in seconds (0 if unknown).
     `urgent` is the track the visitor is waiting for: it gets the network first (neighbours are fetched at low priority, one after the other) */
  ensure(i, urgent = true) {
    if (i < 0 || i >= this.tracks.length) return Promise.resolve(0);
    if (this.loaded.has(i)) return this.loaded.get(i);
    const job = (async () => {
      await this.unlock();
      if (this.mode !== 'worklet') return 0;
      try {
        const res = await fetch(this.tracks[i].url, { priority: urgent ? 'high' : 'low' });
        const buf = await this.ctx.decodeAudioData(await res.arrayBuffer());
        const l = await toInt16(buf.getChannelData(0));
        const r = buf.numberOfChannels > 1 ? await toInt16(buf.getChannelData(1)) : l.slice();
        this.node.port.postMessage({ type: 'buf', index: i, l, r }, [l.buffer, r.buffer]);
        this.done.add(i);
        this.onEvent({ type: 'duration', index: i, duration: buf.duration });
        return buf.duration;
      } catch {
        // decoding failed (codec, memory…): fall back to the element for everything
        this.loaded.delete(i);
        if (this.mode === 'worklet') { try { this.node.disconnect(); } catch { /* ignore */ } this._useElement(); this.onEvent({ type: 'fallback' }); }
        return 0;
      }
    })();
    this.loaded.set(i, job);
    return job;
  }

  /* keep the neighbours of the current track resident, release the rest */
  keepNear(i) {
    if (this.mode !== 'worklet') return;
    for (const k of [...this.loaded.keys()]) {
      if (Math.abs(k - i) > 1 && this.done.has(k)) {
        this.node.port.postMessage({ type: 'drop', index: k });
        this.loaded.delete(k); this.done.delete(k);
      }
    }
    // the song you are on first, then the next one, then the previous one: loading all three at once used to make the current song compete with its own neighbours for the connection (the 5-8 MB tracks took ages on a phone)
    const mine = (this._near = (this._near || 0) + 1);
    this.ensure(i).then(() => {
      if (mine !== this._near || this.mode !== 'worklet') return;
      return this.ensure(i + 1, false).then(() => { if (mine === this._near && this.mode === 'worklet') this.ensure(i - 1, false); });
    });
  }

  select(index, pos) {
    this.selected = index;
    this.seq++;
    if (this.mode === 'worklet') {
      this.node.port.postMessage({ type: 'select', index, pos, seq: this.seq });
    } else if (this.el) {
      if (this.el.dataset.i !== String(index)) { this.el.dataset.i = String(index); this.el.src = this.tracks[index].url; }
      try { this.el.currentTime = pos; } catch { /* metadata not loaded yet */ }
    }
  }

  setRate(r) {
    if (this.mode === 'worklet') {
      if (Math.abs(r - this.lastRate) > 1e-4) { this.rateParam.value = r; this.lastRate = r; }
    } else if (this.el) {
      if (r > 0.07) {
        this.el.playbackRate = clamp(r, 0.0625, 4);
        if (this.el.paused) this.el.play().catch(() => {});
      } else if (!this.el.paused) this.el.pause();
    }
  }

  level() {
    if (!this.an) return 0;
    this.an.getByteTimeDomainData(this.abuf);
    let s = 0; for (let i = 0; i < this.abuf.length; i++) { const v = (this.abuf[i] - 128) / 128; s += v * v; }
    return Math.min(1, Math.sqrt(s / this.abuf.length) * 3.4);
  }
  /* bass / mid / high energy from the same passive tap, for the mascot's beat tracker; null without an analyser.
     Linear amplitude (x10, unclipped) from the float spectrum: the byte spectrum clips on loud bass and hides the kicks. */
  bands() {
    if (!this.an) return null;
    this.an.getFloatFrequencyData(this.fbuf);
    const hz = this.ctx.sampleRate / this.an.fftSize, avg = (lo, hi) => {
      const a = Math.max(0, Math.floor(lo / hz)), b = Math.min(this.fbuf.length - 1, Math.max(a, Math.ceil(hi / hz)));
      let s = 0; for (let i = a; i <= b; i++) s += Math.pow(10, this.fbuf[i] / 10);
      return Math.sqrt(s / (b - a + 1)) * 10;
    };
    return { bass: avg(40, 200), mid: avg(200, 2200), high: avg(2200, 8000) };
  }
  setVolume(v) {
    this.volume = v;
    const g = v * v;
    if (this.gain) this.gain.gain.setTargetAtTime(g, this.ctx.currentTime, 0.02);
    if (this.el) this.el.volume = g;
  }

  /* the element has no push messages for position; poll it each frame */
  tick() {
    if (this.mode === 'element' && this.el && !this.el.paused) {
      this.onEvent({ type: 'pos', index: this.selected, pos: this.el.currentTime, edge: '' });
    }
  }
}
