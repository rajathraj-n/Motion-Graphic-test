# FREEDOM — The Colors of Courage

A 30-second watercolor motion-graphics tribute to India's freedom fighters:
Rani Lakshmibai, Bhagat Singh, Mahatma Gandhi and Netaji Subhas Chandra Bose,
ending on 15 August 1947.

The whole film is generated in code. A small watercolor engine on HTML canvas
paints every frame: layered pigment washes, ink and charcoal lines, paper
grain, pigment bleeds and 2.5D parallax. Frames depend only on time, so the
browser preview and the 4K export match frame for frame. The score and sound
effects are also synthesized (Web Audio).

## Quick start

```bash
# Preview with scrubbing and sound (any static server works)
python3 -m http.server 8000      # then open http://localhost:8000
```

```bash
# Render the 4K master (3840×2160, 24 fps, H.264 + AAC) → out/freedom_4k.mp4
npm install        # installs Playwright (skip if it is already available)
npm run render
```

```bash
npm run render:hd                               # 1080p → out/freedom_1080p.mp4
node tools/render.mjs --hd --stills 6.5,22      # PNG stills → out/stills/
node tools/render.mjs --hd --from 9 --to 14     # render one scene
```

You need Node 18+, ffmpeg on your `PATH`, and Playwright's Chromium.

## Timeline (follows the script)

| Time | Scene | Transition out |
|---|---|---|
| 00:00–00:04 | Opening: ink drop → map of India → saffron stroke → title | saffron bleed |
| 00:04–00:09 | Rani Lakshmibai, Jhansi Fort, gallop → heroic pose | ink-brush wipe |
| 00:09–00:14 | Bhagat Singh: newspaper collage, charcoal → paint, protesters, ink rays | dissolve to white paper |
| 00:14–00:19 | Mahatma Gandhi: Salt March coast, walk cycle, followers, ink circle | expanding ink circle |
| 00:19–00:24 | Netaji: green wash, silhouette → portrait, INA soldiers marching | tricolor brush sweep |
| 00:24–00:30 | Flag forms (24-spoke Chakra), pull-back to portrait collage, final title | hold to last frame |

## Voiceover (ElevenLabs)

The script, with timings, is in `audio/voiceover-script.txt`. Generate each
line as its own file and drop them into `audio/voiceover/` as `01.mp3` …
`06.mp3`. The renderer places each line at the start of its scene, ducks the
music under the voice (sidechain compression), and normalizes the mix to
−16 LUFS. You can also supply one pre-timed `audio/voiceover.mp3`. With no
voiceover present, the export has music and SFX only.

ElevenLabs' free tier allows only non-commercial use, with attribution. Use a
paid plan for client or commercial delivery.

## Music

`src/audio.js` synthesizes an original guide score at 88 BPM that follows the
music-direction table: tanpura drone, dhol-style percussion, a bowed
sarangi-like line, a bansuri-style flute for Gandhi, a build, and a D-major
climax at about 27 s, plus SFX (ink drop, brush sweeps, hooves, paper,
breeze, footsteps, marching, wind). For a richer final mix, replace
`out/score.wav` with a composed or licensed track, using the music prompt
from the brief.

## Portraits

The four portraits are stylized illustrations built in code
(`src/figures.js`), with each figure's characteristic attire. For broadcast
work, you can swap in hand-painted artwork without touching code. Save
transparent PNGs as `assets/portraits/rani.png`, `bhagat.png`, `gandhi.png`
and `netaji.png`, at 820×900 (or the same aspect ratio), with the head
centered near (410, 320). The scene reveals and the finale medallions use
them automatically. The charcoal trace overlay still follows the procedural
line art, so remove the `inkFig` calls in `src/scenes.js` if it no longer
lines up.

## Project layout

```
index.html          preview player (Space = play/pause, ←/→ = step a frame)
src/core.js         watercolor engine: washes, ink, masks, paper, typography
src/figures.js      portraits, Rani on horseback, Gandhi walk cycle, crowds
src/scenes.js       the six scenes, camera/parallax, transitions, timeline
src/audio.js        synthesized score + SFX
src/main.js         player and renderer hooks
tools/render.mjs    headless frame renderer → ffmpeg (video, score, VO mix)
assets/fonts/       Cinzel + Cormorant Garamond (SIL Open Font License)
```
