# Track Three — record deck

A single-page Three.js vinyl record player with a restrained dark editorial look.

## Features

- Three.js turntable scene with a metallic tonearm, cartridge, and visible stylus.
- Smooth 33⅓ RPM record spin-up / spin-down, with tonearm cueing and track-progress tracking.
- Stable camera framing; tapping the record does not move the page or camera.
- MP3 tracks and manifest served from `public/songs/`.
- Images and texture assets served from `public/assets/` so Vite copies them into production output.
- Procedural vinyl texture fallback if the supplied record texture cannot load.
- Graceful static fallback if WebGL is unavailable, including a visible tonearm illustration.
- Reduced-motion support and responsive mobile layout.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Cloudflare Pages

Use `npm run build` as the build command and `dist` as the build output directory. The `wrangler.toml` file is configured for `dist`.

Add any valid `.mp3` file to `public/songs/`, commit it to GitHub, and let Cloudflare Pages rebuild. The pre-build script scans that folder and regenerates `public/songs/songs.json` automatically. Track titles come from filenames: `mohabbat-tere-dil.mp3` displays as `mohabbat tere dil`. No manual manifest edits or GitHub API token are required.


## Adding music

Keep every track in the single folder `public/songs/` (do not create another songs folder). Upload an MP3 there and commit it to GitHub. Cloudflare Pages runs `npm run build`, which automatically regenerates `public/songs/songs.json` from the MP3 filenames before the Vite build. The title shown on the page is derived from the filename: `mohabbat-tere-dil.mp3` becomes `mohabbat tere dil`. The built-in first-three order is `Hoor.mp3`, `Tu.mp3`, then `Safar.mp3`; other MP3 files are added after these in filename order. A new GitHub commit triggers the next deploy and updates the list.

## Record deck interactions

- Tap the vinyl surface to play or pause.
- Tap the tonearm/pivot to select the next track. While audio is playing, the track changes without parking the arm; when paused, it only changes the selection.
- The arm parks in its lower-right cradle only when playback stops.
