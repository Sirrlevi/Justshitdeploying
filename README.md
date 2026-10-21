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
