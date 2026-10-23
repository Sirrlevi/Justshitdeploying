/* Plays 16-bit PCM at any signed speed: 1 = the record at nominal speed, 0 = held still, < 0 = backwards.
   Holds several tracks and rolls over to the neighbour when the head crosses a track boundary. */

class DeckProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{ name: 'rate', defaultValue: 0, minValue: -64, maxValue: 64, automationRate: 'k-rate' }];
  }

  constructor() {
    super();
    this.bufs = new Map();
    this.cur = -1;
    this.pos = 0;
    this.r = 0;
    this.seq = 0;
    this.since = 0;
    this.edge = '';
    this.port.onmessage = (e) => {
      const m = e.data;
      if (m.type === 'buf') this.bufs.set(m.index, { l: m.l, r: m.r, len: m.l.length });
      else if (m.type === 'drop') this.bufs.delete(m.index);
      else if (m.type === 'select') { this.cur = m.index; this.pos = Math.max(0, m.pos * sampleRate); this.seq = m.seq; this.edge = ''; this.since = 1e9; }
    };
  }

  process(_in, outputs, params) {
    const out = outputs[0];
    const L = out[0], R = out[1] || out[0], N = L.length;
    const target = params.rate[0];
    let b = this.bufs.get(this.cur);
    if (!b) {
      L.fill(0); if (R !== L) R.fill(0);
      this.r = target;
      return true;
    }
    let pos = this.pos, r = this.r;
    const dr = (target - r) / N;
    let edge = '';
    for (let i = 0; i < N; i++) {
      r += dr;
      pos += r;
      let silent = false;
      if (pos >= b.len - 1) {
        const nb = r > 0 ? this.bufs.get(this.cur + 1) : null;
        if (nb) { pos -= b.len - 1; this.cur++; b = nb; this.port.postMessage({ type: 'pos', seq: this.seq, index: this.cur, pos: pos / sampleRate, edge: '' }); }
        else { pos = b.len - 1; silent = true; edge = 'end'; }
      } else if (pos < 0) {
        const pb = r < 0 ? this.bufs.get(this.cur - 1) : null;
        if (pb) { this.cur--; b = pb; pos += pb.len - 1; this.port.postMessage({ type: 'pos', seq: this.seq, index: this.cur, pos: pos / sampleRate, edge: '' }); }
        else { pos = 0; silent = true; edge = 'start'; }
      }
      if (silent) { L[i] = 0; R[i] = 0; continue; }
      const i0 = pos | 0, f = pos - i0;
      const l0 = b.l[i0], r0 = b.r[i0];
      // a cartridge reads groove velocity: slower means quieter, held still means silence
      const g = Math.pow(Math.min(1, Math.abs(r)), 0.6) / 32768;
      L[i] = (l0 + (b.l[i0 + 1] - l0) * f) * g;
      R[i] = (r0 + (b.r[i0 + 1] - r0) * f) * g;
    }
    this.pos = pos;
    this.r = r;
    this.since += N;
    if (edge !== this.edge || this.since >= 1024) {
      this.edge = edge;
      this.since = 0;
      this.port.postMessage({ type: 'pos', seq: this.seq, index: this.cur, pos: pos / sampleRate, edge });
    }
    return true;
  }
}

registerProcessor('deck', DeckProcessor);
