# Justshitdeploying

A working record deck: a walnut turntable with one side of vinyl, three tracks and a real tonearm, set on a dark desk. Plain HTML/CSS/JS, no runtime dependencies.

## How it behaves

Nothing is scripted. The platter has weight, the stylus follows the groove, and what you hear is the groove at the speed the record is actually turning.

- **Motor switch** (the black knob, bottom): turn it to start the platter. The lamp lights; the platter spins up and, when you switch off, coasts to a stop. Tapping the record also works the switch.
- **Tonearm**: tap-and-hold (or drag) to lift it. Carry it onto the record to drop the needle anywhere. The rings on the record are the gaps between tracks, so wherever the needle lands is the track you hear. Carry it back to the rest stand to park it. A quick tap on the arm cues it (or parks it) for you.
- **Cue lever** (beside the arm base): lifts the arm where it is, silently.
- **Record**: put a finger on it to stop it, turn it either way at any speed, flick it. Backwards plays backwards.
- **Volume** (steel knob) and **speed trim** (small dial on the arm plate, ±6%, snaps to 0).
- Track arrows beneath the deck jump to the previous/next track. Keyboard: `Space` motor, `←` `→` tracks.
- **Progress line** shows the real position of the stylus in the current track. Click or drag it to carry the arm to that spot and play from there (the preview follows your finger; release to drop the needle). Focus it and use `←` `→` for ±5 s.
- **Track dots** (one per entry in `songs.json`) cue that track, just like the arrows.

At the end of the side the arm lifts, returns to its rest and the motor stops.

## Your tracks

Edit `public/songs/songs.json` and put the files next to it. `duration` (seconds) is optional.

```json
{ "tracks": [ { "filename": "song1.m4a", "title": "Hoor", "artist": "Sama, Starboy X", "duration": 158 } ] }
```

Everything in `public/` is served from the site root (`public/songs/…` → `/songs/…`).

## Make it yours

- The engraving bottom-left is plain text: `<p class="engrave">` in `index.html`.
- The tagline and links are in the `<footer class="caption">` block of `index.html`.

## Run / build

```bash
npm install
npm run dev
npm run build   # → dist/  (Cloudflare Pages: build command `npm run build`, output `dist`)
```

## The look

The page is laid out on the 941 × 1672 reference scene (`--u` in the CSS = 1 scene unit), so the desk, header, deck and caption keep their proportions on every screen; on wide screens the scene sits centred and fades into the desk.

- `public/assets/scene.webp` – the desk, props and lighting (the deck itself is drawn live on top of it)
- `public/assets/deck.jpg` – the walnut plinth photograph the live parts sit on
- `public/assets/grooves.webp`, `label.webp`, `sheen.webp` – the record (spins), its label (spins) and the fixed highlights that stay still while it turns

## Layout

```
index.html        the deck's parts, in stacking order
src/styles.css    all artwork is CSS on a 1120 × 900 grid
src/geom.js       deck geometry and tonearm maths
src/parts.js      SVG artwork for the tonearm, rest stand, cue lever
src/audio.js      sound engine (decoded audio + AudioWorklet; <audio> fallback)
src/main.js       physics, tonearm state machine, input
public/worklet.js plays audio at any signed speed
public/assets/    walnut, frame, label and groove textures, favicon
public/fonts/     Lora (OFL), a small engraving face
public/songs/     audio + songs.json
```

## Static Mk-II, the after-hours companion (`src/mascot.js`)

Static is a silent, draggable SVG character integrated with the real deck state. No voice output, recording, AI API, backend, or added runtime dependency is used.

- **Opt-in onboarding:** on a fresh page view, Static offers `show me around` / `not now`. The tour never starts on its own. Dismissing the offer lets the visitor use the site normally; only the explicit button launches the step-by-step tour. The offer is per page view, so reloading shows it again.
- **Real control guidance:** the tour points out the motor, record, tonearm, cue lever, volume, speed trim, progress line, each song selector, previous/next buttons, and social links. `watch demo` temporarily demonstrates supported controls and restores the prior value unless the visitor changes that same control while the demo is running.
- **Character reactions:** audio-level mouth movement, a tiny microphone, singing/dancing, expressive eyes and brows, notes, curiosity, sleepy/angry/scared/dizzy reactions, random screen taps, dragging, playful object inspection and vinyl treadmill gags.
- **Real player actions, with guardrails:** rare pranks may briefly nudge volume/speed, stop the motor, or lift the arm, then restore the prior state unless the visitor touches that control. Dragging Static onto an actual control performs that action through the existing deck API. These are scripted gags, not a language-model bot.
- **Bubble placement:** manga-style speech cards search for a free viewport rectangle and are hidden/skipped if there is no safe position; they are not intentionally drawn over important text or controls. The bot's body also treats text and interactive controls as obstacles. Wooden deck areas remain valid perches, while the platter and hardware are collision targets.
- **Drag physics:** pick Static up and drop it elsewhere, on the vinyl, or onto a supported control. The vinyl ride includes a low-speed treadmill gag and a high-speed dizzy/ejection animation. Object interactions are best-effort, based on the background scene's known prop regions, rather than a full 3D collision engine.
- **Responsive and accessible:** keyboard-focusable mascot, touch-friendly drag, reduced-motion handling, and small-screen sizing.
- **Debug:** open the site with `?debug` to expose `window.__static` and `window.__deck`.

The speaking bubble is visual only: there is no spoken audio. The mouth follows the decoded song's live analysis level while music is playing and uses lightweight text-driven mouth poses for on-screen reactions. The character does not understand arbitrary natural-language prompts; its behavior is deliberately rule-based and tied to the website's controls and state.

