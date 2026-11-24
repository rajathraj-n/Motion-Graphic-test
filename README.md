# Beyond Possibilities — 40-second ChatGPT promo (Remotion)

A 40-second promo in a cinematic SaaS style, built entirely in code with [Remotion](https://www.remotion.dev).

| Spec | Value |
| --- | --- |
| Duration | exactly 40 s (2,400 frames) |
| Resolution | 3840 × 2160 (4K UHD), 16:9 |
| Frame rate | 60 fps |
| Tempo grid | 120 BPM → 1 beat = 30 frames |
| Typeface | Inter (bundled, SIL OFL), JetBrains Mono for code |
| Palette | #0A0A0A · #FFFFFF · #171717 · #A1A1AA · accent #10A37F |

## Quick start

```bash
npm install
npm run dev            # Remotion Studio: scrub the timeline, tweak, preview
npm run render         # final 4K/60 H.264 → out/beyond-possibilities-4k.mp4
npm run render:preview # fast 1080p/60 review copy → out/preview-1080p.mp4
npm run stills         # review PNGs of key frames → out/stills/
npm run music          # regenerate public/audio/soundtrack.wav
```

Everything is drawn on a 1920 × 1080 stage that is scaled 2× (`OUTPUT_SCALE` in `src/theme.ts`), so type and vectors render sharply at 4K rather than being upscaled.

## Storyboard → code

| # | Time | On-screen text | File | Key motion |
| --- | --- | --- | --- | --- |
| 01 | 00:00–00:04 | Everything starts with an idea. | `Scene01Hook.tsx` | 320 particles spiral into an energy ring; per-character depth/blur type reveal; camera pushes through the type; cursor morphs into the prompt field |
| 02 | 00:04–00:09 | Meet ChatGPT. / Your ideas. Reimagined. | `Scene02Meet.tsx` | Glass interface rotates from 20° into a front-facing position; staggered spring UI; edge light sweep; typed prompt; send press and radial pulse; response grows from a dot into a panel |
| 03 | 00:09–00:15 | Create without limits. | `Scene03Create.tsx` | Macro shot of the prompt; streamed response; its three sections become three 3D cards on an orbit; the camera orbits around them with depth-of-field on the side cards; the centre card expands past the frame |
| 04 | 00:15–00:21 | Turn complexity into clarity. | `Scene04Think.tsx` | Spreadsheet flies along an arc into the composer; circular upload ring; table rows turn into bar-chart bars; trend line drawn with trim paths; number counters; rack focus; donut chart match-cuts into the next scene |
| 05 | 00:21–00:27 | Bring imagination to life. | `Scene05Imagine.tsx` | Circular iris continuing from the donut; macro push on the prompt; particle grid, then a pixel-mosaic reveal of the city; panel expands to full frame; 4-layer 2.5D parallax; pull back into a card; light sweep |
| 06 | 00:27–00:33 | Write. Think. Create. Discover. | `Scene06Workspace.tsx` | Beat drop: five feature panels fly in on Bézier paths, then a 180° orbit on a tilted ring; keywords land every 2 beats; light trails; magnetic collapse; the panel shrinks to a pill |
| 07 | 00:33–00:37 | Less friction. / More possibilities. | `Scene07Payoff.tsx` | Pill → illuminated line; type rises from behind the line; scale/blur swap to the second line; volumetric rays; slow camera pull-back |
| 08 | 00:37–00:40 | ChatGPT / Start with a conversation. / chatgpt.com | `Scene08Brand.tsx` | Mask and stroke reveal of the logo; radial glow; tagline rises; URL fades in; hold; fade to black |

Scene start times and lengths are in `SCENES` in `src/theme.ts`. After its nominal end, each scene stays on screen for `TAIL` (24) more frames, so the next scene can play over it (transitions take 400 ms).

```
src/
  theme.ts           palette, stage size, beat grid, scene timeline
  fonts.ts           bundled font loading (no network needed at render time)
  Video.tsx          master timeline, 2× stage scale, background, grain, audio
  lib/anim.ts        easing curves, springs, typewriter, helpers
  components/        Glass, KineticText, PromptBar, CityArt, BrandMark, Icons, Atmosphere
  scenes/            Scene01…Scene08
scripts/
  generate-soundtrack.mjs   procedural 120 BPM score + synced SFX
  stills.mjs                renders review frames
```

## Before you ship: replace these placeholders

1. **Logo.** The spec calls for the real ChatGPT logo. This project does not redraw trademarked logos, so `BrandMark.tsx` shows a neutral placeholder glyph. Put the official asset in `public/brand/logo.svg` and set `BRAND_LOGO_FILE = "brand/logo.svg"`. Using OpenAI/ChatGPT names, marks and UI in an advertisement requires OpenAI's permission and must follow their brand guidelines.
2. **Music.** `public/audio/soundtrack.wav` is an original synthesized score with all sound effects (typing, glass clicks, pops, whooshes, impacts, shimmer, sonic logo) already placed on the scene timings. It is there so the edit has a beat to sync to. For a final cut, swap in a produced track that follows the same structure (prompt below) and replace that file.
3. **City artwork.** Scene 05 uses a procedural, stylised city split into sky, far, mid and near layers. For a photoreal look, generate the image, cut it into the same four plates, and swap each `<Layer>` body in `CityArt.tsx` for an `<Img>`. The parallax will keep working.
4. **Voice-over (optional).** Add `<Audio src={staticFile("audio/vo.wav")} />` in `Video.tsx`. The script and timecodes are in the brief.

### Music generation prompt

> Create an exactly 40-second premium cinematic electronic soundtrack for a high-end AI SaaS product commercial. 120 BPM, sophisticated cinematic tech-house, deep controlled bass, punchy kick drums, crisp percussion, rhythmic synth arpeggios, atmospheric pads and uplifting melodic synth layers. Mysterious minimal digital pulse 0–4 s; clean electronic groove 4–9 s; build rhythmic momentum 9–21 s; uplifting melodic layers 21–27 s; powerful sophisticated beat drop 27–33 s; reduce percussion 33–37 s; memorable cinematic sonic logo impact and resolving chord 37–40 s. No vocals, no acoustic guitars, no ukulele, no aggressive EDM distortion.

## Render notes

- `remotion.config.ts` sets JPEG frames at quality 95, yuv420p, and concurrency 2. Backdrop blur at 4K uses a lot of memory, so raise concurrency only if you have the RAM.
- To deliver a mezzanine master, add `--codec=prores --prores-profile=hq`.

## Editing the text

All on-screen text lives in one place: `DEFAULT_COPY` in `src/copy.tsx`. You can change it in three ways:
- edit that file;
- in Remotion Studio, select **BeyondPossibilities** and change `copy` in the props panel on the right;
- use the web editor in `web/`. It is the same scenes running in Remotion's player, with a text panel beside them. Rebuild it with `npm run build:web`. Its **Copy text as JSON** button gives you `{ "copy": … }`, which you can paste into Studio's props panel.
