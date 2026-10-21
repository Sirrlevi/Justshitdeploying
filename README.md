# Track Three — Realistic Record Deck

A rebuilt version of the supplied vinyl landing page, using the supplied assets and the `god-tier-webdev` skill guidance.

## What was audited

- Original project was a single 1,601-line `index.html` containing all CSS + JS.
- It already had a strong visual direction, custom vinyl asset, warm room texture, mechanical tonearm choreography and audio manifest.
- The supplied `songs/songs.json` references `song1.mp3`, `song2.mp3`, and `song3.mp3`, but those MP3 files were **not present in the supplied ZIP**. The rebuilt experience therefore treats audio as progressive enhancement and never crashes when the files are missing.
- The visual deck was predominantly CSS/image-based rather than a true 3D scene. This rebuild moves the physical deck, platter, vinyl, grooves and tonearm into Three.js while keeping a static image fallback.

## Rebuild highlights

- Real 3D turntable geometry and materials.
- Physical-style lighting, shadows, clearcoat and metal response.
- Supplied vinyl image used as the record surface texture.
- Animated platter with eased motor start/stop.
- Tonearm cue / lift / tracking movement tied to audio progress.
- Pointer parallax on desktop, touch-safe controls on mobile.
- Static fallback for no WebGL / failed 3D initialization.
- Reduced-motion support.
- WCAG-friendly semantic controls and focus-visible states.
- Modern OKLCH design tokens, fluid type and responsive layout.
- Split source files for maintainability.
- Cloudflare Pages-ready config.

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

```bash
npx wrangler pages deploy dist --project-name=track-three-record-deck
```

For audio playback, place the actual MP3 files at:

- `songs/song1.mp3`
- `songs/song2.mp3`
- `songs/song3.mp3`

The manifest can be edited in `songs/songs.json` without changing the app code.

## Performance notes

The renderer caps DPR at 1.75, uses a modest polygon budget, reuses groove geometry, pauses its motor when the tab is hidden, and provides a non-WebGL fallback. For production, self-hosting Three.js and the fonts can remove third-party runtime dependencies and improve cache control.
