# Visualizer intro video

Tooling for `docs/assets/video/rulebox-visualizer-intro.mp4`, the one-minute tour (with music) on the docs home page, the Visualizer guide and lesson 9 of the course.

| File | Purpose |
| --- | --- |
| `record.js` | Playwright script. Title card; Dashboard with its Problem and Slowest rules panels; the chain view of a failing rulebook; Dry Run; Metrics with rule health, sorting and a rule's errors and stack traces; the Live Tracker with traffic and an opened failure; outro and end screen. Serves CDN and font files from memory (fetched once with curl) so every page renders styled. Saves the raw `.webm`, `poster.png` and `marks.json` (approximate scene start times) into `out/`. |
| `Demo.bx` | Temporary handler that runs the harness JSON rulebooks with random facts, plus a `fraudcheck` rulebook it declares on the first run, with a slow rule and a rule that sometimes fails (a timeout caused by a socket error, or a bad response). The screens get rule health to show and the Live Tracker gets traffic. |
| `edit.sh` | ffmpeg cut: trims, speeds the tour up 1.1x (`TOUR_SPEED`), crossfades, fades in and out, adds the music, encodes H.264 + AAC. |
| `music.py` | Original background track, synthesized with numpy (no samples, no third-party audio). `edit.sh` passes the length and the outro's start, so the breakdown lands on the outro card. |
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

   The screenshots in `docs/assets/visualizer/` come from the same demo state: call `/demo/run` about a hundred times first, so every panel has data.

3. Cut, score and encode (needs ffmpeg with libx264 and aac, `bc`, and Python 3 with numpy):

   ```bash
   build/video/edit.sh build/video/out/<recording>.webm
   cp build/video/out/poster.png docs/assets/video/rulebox-visualizer-intro-poster.png
   ```

   The trim points in `edit.sh` match one recording. Page loads vary, so check yours and adjust them first. `out/marks.json` says roughly where each scene starts; the recorded video's clock runs a few percent behind it, so the real change is a little later. Use the `ffmpeg` scene command in `edit.sh` to find it.

4. Clean up: `rm -r test-harness/handlers/Demo.bx build/video/out`.
