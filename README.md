# Memorial Photo Montage — Tom Bronder

A self-contained web slideshow: 724 photos with gentle crossfades and a slow
Ken Burns drift, set to "Quiet Remembrance" on loop. Runs entirely offline —
no internet needed at the venue.

## To play it

1. Copy this whole `montage/` folder to whatever laptop is hooked to the TV.
2. Run `./start.sh` (or double-click it if your file manager supports it).
3. Open **http://localhost:8000** in the browser, press **F** for fullscreen
   (or just click **Begin** — it tries fullscreen automatically).
4. That's it. The show runs about **73 minutes** and then loops forever.

If the TV computer can't run the server for some reason, you can also just
open `index.html` directly from the file manager — it works from `file://` too.

## Controls

| Key | Action |
|-----|--------|
| Space / click | Pause / resume |
| ← / → | Previous / next photo |
| F | Toggle fullscreen |
| M | Mute music |

The cursor and progress bar hide themselves after a few seconds of stillness.

## To customize

Open `app.js` — at the very top there's a clearly marked **SETTINGS**
block:

- `years` — add e.g. `"1947 – 2026"` under the name on the title card
  (blank by default)
- `photoSeconds` — seconds per photo (currently **6**)
- `musicVolume` — currently 0.85
- `kenBurns` — set `false` for perfectly still photos

Just save and refresh the browser; no rebuild needed.

## Folder contents

- `index.html` — the slideshow page (markup and styling)
- `app.js` — the slideshow engine, with the SETTINGS block at the top
- `photos.js` — generated list of photos (don't edit by hand)
- `photos/` — your 724 photos, converted/renamed from the originals
  (62 HEIC files became JPGs; originals in Downloads are untouched)
- `music.mp3` — "Quiet Remembrance"
- `start.sh` — tiny local web server launcher
