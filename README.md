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

Track names can be edited in `public/songs/songs.json`; audio files should be valid MP3s with matching filenames in `public/songs/`.
