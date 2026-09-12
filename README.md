# For Priya — A Private Pressing

A premium single-page vinyl love letter, built with plain HTML, CSS, and vanilla JavaScript.

## Deploy to Cloudflare Pages

Use this folder as the static site root. No build command is required.

- **Build command:** leave empty
- **Build output directory:** `/` (or the repository root)

## Music files

The player reads `songs/songs.json`. Keep the matching audio files in the same folder:

```text
songs/
├── songs.json
├── song1.mp3
├── song2.mp3
└── song3.mp3
```

Edit the titles or filenames in `songs/songs.json` whenever you change the tracks.

## Included interactions

- Tap/click the vinyl to play or pause
- Use **Next love song** to advance tracks
- Click or use arrow keys on the progress bar to seek
- Tonearm, platter light, ambient glow, equalizer, and vinyl respond to playback
- Desktop pointer movement adds subtle depth
- Motion automatically simplifies for visitors who prefer reduced motion
