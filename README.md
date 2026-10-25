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

A silent little character that lives on the page (no mic, no speech, no network; plain SVG/CSS/JS). It is a physical object in your page: drag it with a finger, fling it, drop it on the record.

- **Tour, only when asked.** On every load it shows a small "want a quick tour?" chip. Nothing starts by itself. On "yes" the bot hops to each control and operates the real thing (power switch, needle lever, volume knob, seek line, song dots) while explaining it; "stop" ends it. Edit the steps in `STEPS`.
- **Carry and throw.** Picking it up makes it panic like a carried character. Letting go gives it gravity: it lands on the deck, text, the mug, headphones, plant and books (the `PROPS` list maps those photo props to boxes), bounces, shouts a line about what it hit, and gets dizzy (birds) after a hard fall. Dropping it on the record makes it ride the platter: slow = treadmill run then a dizzy tumble, full speed = it struggles and is flung off.
- **Mischief, always undone.** Now and then, while a song plays, it stops the motor, lifts the needle, drops or blasts the volume, or twists the speed trim, then puts everything back. It also dances, gets angry (censored swearing), sings with a mic (mouth follows `audio.level()`), pokes where you tap the screen, sleeps when idle, and sometimes appears where the old title was.
- Dialogue lives in `LINES` (shuffle-bag, so lines don't repeat back to back).
- `prefers-reduced-motion`: no wandering, pranks or disc rides; it stays put. Keyboard: it is a focusable button. Add `?debug` to the URL to expose `window.__static`.
