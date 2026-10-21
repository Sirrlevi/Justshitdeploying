# Justshitdeploying

A small record deck: one side of vinyl, three tracks, one tonearm. Plain HTML/CSS/JS, no runtime dependencies.

## Using it

- Tap the record (or the round button) to play and pause.
- Drag the tonearm onto the record to drop the needle anywhere. The rings on the record mark where each track sits.
- Drag it back off the record to park it.
- Keyboard: `Space` play/pause, `←` `→` previous/next.

## Your tracks

Edit `public/songs/songs.json` and drop the files next to it. `duration` (seconds) is optional; if it is missing the page reads it from the file.

```json
{ "tracks": [ { "filename": "song1.m4a", "title": "Hoor", "artist": "Sama, Starboy X", "duration": 158 } ] }
```

Everything in `public/` is copied to the site root as-is, so `public/songs/…` is served at `/songs/…`.

## Run / build

```bash
npm install
npm run dev
npm run build   # → dist/  (Cloudflare Pages: build command `npm run build`, output `dist`)
```

## Layout

```
index.html        markup
src/styles.css    the whole deck is drawn in CSS on a 1120 × 884 grid
src/main.js       tonearm geometry, audio, dragging, motion
public/assets/    walnut, desk and groove textures, favicon
public/fonts/     Lora (OFL), subset
public/songs/     audio + songs.json
```
