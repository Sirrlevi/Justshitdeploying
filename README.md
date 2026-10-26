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

## @Thinking mascot (`src/mascot.js`)

A local SVG/CSS/JS companion. It has no database and does not send guide preferences to a server; settings are saved in the visitor's browser with `localStorage`.

- **Guide prompt:** The welcome prompt appears only when the visitor has not chosen. `yes!` and `no thanks` are remembered on that browser. To replay it later, hold the mascot for about 1.75 seconds (or use the mouse context menu / keyboard `Shift+F10`) and choose **guide again**.
- **Mascot settings:** The same menu offers quiet mode, reduced motion and hide/show controls. Hide/show and the two preferences are local to that browser. `Escape` closes the menu.
- **Touch:** Tap to interact; hold still to pet; drag to carry and fling. Fast repeated taps can trigger the deliberately dramatic tantrum behavior. The existing guided demo and character reactions that operate player controls are retained.
- **Movement:** The mascot navigates open space, uses the transformed SVG coordinates for reaches, and checks the rendered hand position before making nearby text wobble. Speech waits through punctuation and leaves a reading pause; active dialogue is not replaced by quick reactions.
- **Music:** The mouth follows the player's real audio level when a song is audible. During silence it does not fake lip-sync. Music mode, sleep/wake, expressions, short gestures and physics remain part of the character.
- **Reduced motion:** The system preference is respected, and visitors can save a reduced-motion choice in the settings menu. This tones down mascot-only motion without adding a server or database.
- Dialogue lives in `LINES`. Add `?debug` to the URL to expose `window.__static` for troubleshooting.

### Mascot v7 polish

- The floating `?` shortcut was removed. Guide acceptance/rejection persists as `static.guide.choice.v1`.
- Bubble typing and reading time are slower, and fast reactions cannot overwrite active speech.
- Pointer/reach calculations use the transformed mascot body and the actual rendered hand for contact checks.
- Animation interruptions run a recovery path so transient arm, mouth and movement state does not remain stuck.
- Mascot CSS has one consolidated component section, with viewport-aware bubbles and a safe-area-aware restore button on mobile.
