/* Beat + mood tracker for the mascot. Pure maths, no DOM: feed it the analyser bands once per frame.

   - beat      true on the single frame a beat lands (low-band onset against a running average)
   - pulse     1 on a beat, falling to 0 in ~240 ms (drives bobbing, antenna flicks, pupil pulses)
   - bpm       median of recent beat gaps, folded into 72–168 (0 until it has heard enough)
   - drop      true once when loudness comes back hard after a quiet breakdown
   - mood      'chill' | 'groove' | 'hype' | 'moody', judged from loudness, tempo and brightness
   - judged    true on the frame a track's first mood judgement is made (once per track)

   Without an analyser (audio fallback mode) it keeps a gentle 100 bpm metronome so the bot still moves. */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export class BeatTracker {
  constructor() { this.reset(); this.mood = 'groove'; }

  reset() {
    this.beat = false; this.pulse = 0; this.strength = 0; this.bpm = 0;
    this.drop = false; this.judged = false;
    this.fast = 0; this.energy = 0; this.bright = .2;
    this._avg = 0; this._prev = 0; this._last = 0; this._iv = []; this._quiet = 0; this._dropAt = 0;
    this._age = 0; this._judgeAt = 9000; this._cand = ''; this._candN = 0; this._synth = 0; this._firstDone = false;
  }

  /* a new track (or a seek): forget tempo, judge the mood again after a few seconds */
  newTrack() {
    this._iv = []; this.bpm = 0; this._age = 0; this._judgeAt = 9000; this._cand = ''; this._candN = 0; this._firstDone = false;
    this._quiet = 0; this._dropAt = performance.now();
  }

  /* now: ms · dt: s · b: {bass, mid, high} 0..1 or null · lvl: overall level 0..1 · on: music is really playing */
  update(now, dt, b, lvl, on) {
    this.beat = false; this.drop = false; this.judged = false;
    this.pulse = Math.max(0, this.pulse - dt * 4.2);
    if (!on) { this.fast *= Math.pow(.2, dt); this.energy *= Math.pow(.5, dt); this._avg *= Math.pow(.3, dt); return this; }
    this._age += dt;

    // loudness envelopes (the slow one learns quickly at the start of a track)
    this.fast += (lvl - this.fast) * Math.min(1, dt / .22);
    this.energy += (lvl - this.energy) * Math.min(1, dt / Math.min(5, .5 + this._age * .7));
    if (b) { const tot = b.bass + b.mid + b.high + .02; this.bright += ((b.high + b.mid * .35) / tot - this.bright) * Math.min(1, dt / 3); }

    // beats: a low-band onset well above its running average, rising, not closer than ~240 ms to the last one
    const low = b ? b.bass : lvl;
    this._avg += (low - this._avg) * Math.min(1, dt / .8);
    if (low > this._avg * 1.28 + .035 && low > this._prev && now - this._last > 240) {
      const gap = now - this._last; this._last = now;
      this.beat = true; this.pulse = 1; this.strength = clamp((low - this._avg) / (this._avg + .12) * 1.6, .25, 1);
      if (gap > 250 && gap < 1500) {
        this._iv.push(gap); if (this._iv.length > 20) this._iv.shift();
        if (this._iv.length >= 4) {
          const s = [...this._iv].sort((p, q) => p - q), med = s[s.length >> 1]; let bpm = 60000 / med;
          while (bpm < 72) bpm *= 2; while (bpm > 168) bpm /= 2; this.bpm = this.bpm ? this.bpm + (bpm - this.bpm) * .2 : bpm;     // smoothed, so the dance tempo does not jitter
        }
      }
    }
    this._prev = low;

    // no analyser at all: a gentle metronome so the bot still has something to move to
    if (!b && lvl < .01) {
      this._synth += dt;
      if (this._synth > .6) { this._synth = 0; this.beat = true; this.pulse = 1; this.strength = .5; this.bpm = 100; }
    }

    // a drop: loudness slumps for a moment (breakdown) and then comes back hard
    const slow = Math.max(.1, this.energy);
    if (this.fast < slow * .5) this._quiet += dt;
    else if (this.fast > slow * 1.25) { if (this._quiet > .6 && now - this._dropAt > 12000) { this.drop = true; this._dropAt = now; } this._quiet = 0; }
    else this._quiet = Math.max(0, this._quiet - dt);

    // mood, judged a few seconds into a track and then every ~4 s (it has to agree twice before it switches)
    this._judgeAt -= dt * 1000;
    if (this._judgeAt <= 0) {
      this._judgeAt = 4000;
      const e = this.energy, bp = this.bpm, dark = this.bright < .16;
      let m = 'groove';
      if (e < .22 || (bp && bp < 82 && e < .5)) m = dark && e < .42 ? 'moody' : 'chill';
      else if (e > .52 && (!bp || bp >= 108)) m = 'hype';
      if (!this._firstDone) { this._firstDone = true; this.mood = m; this._cand = m; this._candN = 0; this.judged = true; }
      else if (m === this.mood) { this._cand = m; this._candN = 0; }
      else if (m === this._cand) { if (++this._candN >= 1) { this.mood = m; this._candN = 0; } }
      else { this._cand = m; this._candN = 0; }
    }
    return this;
  }
}
