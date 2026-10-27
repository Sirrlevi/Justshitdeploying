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

## Static, the mascot (`src/mascot.js`)

A silent little pet that lives on the page (no mic, no speech, no network; plain SVG/CSS/JS). It reacts to how you treat it.

- **Tour, only when asked, and remembered.** On a first visit a small "want a quick tour?" chip appears. The answer is stored **on the visitor's own device only** (`localStorage` key `static.guide.v1`, with a plain cookie `static_guide` as a fallback): *yes* or *no thanks* = never asked again; ignoring it 3 times = it stops asking. Nothing is sent anywhere. Add `?tour` to the URL (or clear site data) to see the offer again. During the tour the bot walks up to each real control, stands **next to** it, takes hold with both hands, and acts only once its hands are really on it; if it cannot get close enough without covering text (small phones) it says so and moves on. Steps live in `STEPS`.
- **Real controls, real motion.** Hands follow the control's actual movement: they turn with the volume/trim/power knob by the same angle and direction, ride the cue lever, and carry the tonearm onto the record (`armStart/armMove/armDrop` in `main.js` do exactly what a finger drag does). Strain time is random; sometimes it slips and retries.
- **Feelings.** The face has lids, brows, a mouth curve, a tongue and blush that change with its mood (calm, happy, excited, sleepy, angry, sad, scared, surprised, smug, curious, dizzy, shy). Idle life: blinks (sometimes twice), yawns, stretches, hiccups, sneezes, scratches its head, shivers, tilts its head, dances, spins, gets drowsy and falls asleep after 30 s untouched. Any touch, key press or throw wakes it at once.
- **Touch.** Tap = poke (fast repeated taps hurt and make it angry). Hold still or stroke slowly = petting (blush, hearts, purring). Too many hard taps: red monster tantrum (censored swearing, slams the switch, yanks the lever, shakes the record), then it calms down and puts everything back. Drag = pick it up (it panics); shake it and it gets dizzy; fling it: gravity, bounces on the deck, text, mug, headphones, plant and books (`PROPS`).
- **The record.** Drop it on a stopped record and it just stands there. On a spinning one it balances, runs against the spin, and at full speed gets flung off after a different time every try. It also lifts the real record with both hands, inspects it, spins and tosses it, then puts it back.
- **Music.** While a song plays it performs (mic only sometimes, dance, headbang, spin, jumps, struts around). Its mouth follows `audio.level()`. If you stop a song it was vibing to, it swears (censored), shows you the finger, and puts the song back on.
- **Mischief, always undone.** While music plays it now and then stops the motor, lifts the needle with the lever, drops or blasts the volume, twists the speed trim or skips a track, then restores everything. Timing: `prankAt` in `decide`.
- **Speech.** Bubbles are soft floating clouds, paced for reading (about 16 characters a second plus a beat) and a new one never replaces one still being read. Tap a bubble to dismiss it. Lines live in `LINES` (shuffle-bag, no repeats back to back).
- **Safety nets.** A watchdog resets any mode, flag or loop that gets stuck. `prefers-reduced-motion`: no wandering, pranks or rides. Keyboard: the bot is a focusable button. Add `?debug` to the URL to expose `window.__static`.
