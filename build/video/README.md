# Visualizer intro video

Tooling for `docs/assets/video/rulebox-visualizer-intro.mp4`, the one-minute tour on the docs home page, the Visualizer guide and lesson 9 of the course.

| File | Purpose |
| --- | --- |
| `record.js` | Playwright script. Title card, Dashboard, Chain, Dry Run, Metrics, Live Tracker with traffic, outro and end screen. Saves the raw `.webm` and `poster.png` into `out/`. |
| `Demo.bx` | Temporary handler that runs the harness JSON rulebooks with random facts, so the screens have data and the Live Tracker has traffic. |
| `edit.sh` | ffmpeg cut: trims, speeds the tour up 1.15x, crossfades, fades in and out, encodes H.264. |
| `*-icon-full.svg` | ColdBox and BoxLang marks for the end screen. |

## Steps

1. Start the test harness (the Visualizer is enabled there):

   ```bash
   box run-script install:dependencies
   cp build/video/Demo.bx test-harness/handlers/
   box run-script start
   ```

2. Record (needs Node and Playwright with Chromium):

   ```bash
   cd build/video
   npm install --no-save playwright
   BASE_URL=http://localhost:60299 node record.js
   ```

3. Cut and encode (needs ffmpeg with libx264 and `bc`):

   ```bash
   build/video/edit.sh build/video/out/<recording>.webm
   cp build/video/out/poster.png docs/assets/video/rulebox-visualizer-intro-poster.png
   ```

   The trim points in `edit.sh` match one recording. Page loads vary, so check yours and adjust them first.

4. Clean up: `rm -r test-harness/handlers/Demo.bx build/video/out`.
