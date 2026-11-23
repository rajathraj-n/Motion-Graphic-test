# In Time Tec — "Transform Complexity Into Possibility"

A 50-second, 4K (3840×2160, 30 fps) SaaS-style motion-graphics film with
floating 3D glass UI panels, orange rim light, animated data visualizations,
camera dollies and orbits, and kinetic typography. It follows the
eight-scene production script.

Everything is generated in code. A WebGL compositor renders the glass panels
as true perspective planes, with rounded corners, soft shadows, an orange
edge glow and a moving specular sweep. The interfaces, charts and typography
are drawn in 2D on top. Frames depend only on time, so the preview and the
export match exactly.

## Run it

```bash
# from the repository root
python3 -m http.server 8000             # preview: http://localhost:8000/intimetec/
node tools/render.mjs --project intimetec --hd   # → out/intimetec_1080p.mp4
node tools/render.mjs --project intimetec        # → out/intimetec_4k.mp4
node tools/render.mjs --project intimetec --hd --stills 3.5,24.95,49.9   # PNG stills
node tools/render.mjs --project intimetec --hd --from 18 --to 26         # one scene
```

You need Node 18+, ffmpeg, and Playwright's Chromium with WebGL2.

## Before final delivery

- **Logo:** I didn't have the official logo file. The end card shows a plain
  "IN TIME TEC" wordmark as a placeholder. Save the approved logo as
  `intimetec/assets/logo.svg` (or `logo.png`) and the end card uses it
  unmodified, at its original aspect ratio.
- **Font:** Poppins is a temporary substitute, as the brief suggests. To use
  the official brand font, replace the files in `assets/fonts/` and keep the
  family name `Poppins` in `index.html`, or rename it in `src/ui.js`
  (`F = …`).
- **Colors:** the palette (#F06023, #FFD600, #FFFFFF, #171717, #F5F6F8) is
  set in `src/engine.js` and `src/ui.js`. Check it against the current brand
  kit.
- **Voiceover:** the lines and their start times are in
  `audio/voiceover-script.txt`. Drop `01.mp3`–`08.mp3` into
  `intimetec/audio/voiceover/`. The renderer places each line, ducks the
  music under the voice, and normalizes the mix to −16 LUFS.
- **Music:** `src/audio.js` synthesizes an original 118 BPM guide track
  (groove enters at 11 s, risers at each transition, lift at 41–46 s, logo
  hit at 47 s) plus UI sound effects. For a final mix, replace it with a
  licensed or composed track.
- **Content:** all interfaces are illustrative, with generic labels. There
  are no client names, product names or performance figures.

## Scene map

| Time | Scene | Transition out |
|---|---|---|
| 0–5 | Orange line and light dot → three glass panels → COMPLEXITY → OPPORTUNITY | camera pushes through the hero panel |
| 5–11 | CRM, board, spreadsheet and report panels; connections break; problem labels | orange light sweep |
| 11–18 | Lines reconnect → unified workspace → PEOPLE / PROCESS / TECHNOLOGY | line races into a light wipe |
| 18–26 | AI workflow (Input → AI Analysis → Recommendation → Human Review), analysis card, cursor approves | panel morphs into the app |
| 26–34 | Desktop SaaS dashboard, shared-element page change, mobile app, "Software built around you" | camera tracks the orange line |
| 34–41 | Data & Analytics / Cloud & Modernization / Cybersecurity panels | centre point → circular light wipe |
| 41–46 | Insights dashboard; CLARITY / CONFIDENCE / GROWTH on the beat | orange-and-white gradient wipe |
| 46–50 | Logo, orange line, CREATING ABUNDANCE, "Let's build what's next", www.intimetec.com | hold |

## Files

```
index.html        preview player (Space = play/pause, ←/→ = step a frame)
src/engine.js     camera (35 mm), WebGL glass-panel shader, compositor
src/ui.js         UI kit: cards, charts, icons, kinetic type, cursor, light lines
src/scenes.js     the eight scenes, interface designs, transitions, logo
src/audio.js      118 BPM guide track + UI SFX
src/main.js       player and renderer hooks
```
