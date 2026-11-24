# In Time Tec: 50-second premium SaaS motion graphics video

**Concept:** *Turning Complexity Into Opportunity*. This is a corporate technology film built entirely as code in [Remotion](https://www.remotion.dev). It uses floating 2.5D glass dashboards, kinetic typography, animated data visualizations and restrained camera moves, all in the In Time Tec orange/yellow/graphite palette.

| Spec | Value |
|---|---|
| Duration | 50.0 s (1500 frames) |
| Frame rate | 30 fps |
| Output | 3840 × 2160 (4K UHD, 16:9) |
| Design grid | 1920 × 1080, rendered at 2× device-pixel scale for razor-sharp 4K vectors and text |
| Style | 2.5D UI motion graphics, glassmorphism, kinetic type |

Every headline, card, chart, icon and number is an editable React layer. Nothing is baked video or AI-generated imagery.

---

## Quick start

```bash
npm install
npm run studio          # live preview / scrub timeline in the browser
npm run render:preview  # 1920×1080 H.264 → out/intimetec-promo-1080p.mp4
npm run render:4k       # 3840×2160 H.264 → out/intimetec-promo-4k.mp4
npm run render:prores   # 3840×2160 ProRes 422 HQ master → out/intimetec-promo-4k.mov
npm run build:player    # single-file browser editor + player → out/player.html (open it directly, no server)
npm run build:studio    # static Remotion Studio → out/studio/ (host on any static web server)
```

`npm run studio` opens Remotion Studio at http://localhost:3000: a timeline with scrubbing, per-scene sequences and hot reload. Edit any file in `src/` and the preview updates instantly.

All on-screen copy lives in **`src/content.ts`**. You can also change it in Studio's props panel, or in the browser editor (`out/player.html`), whose **Copy for code** button produces a block to paste back into `src/content.ts`.

Requirements: Node 18+. Remotion downloads its own headless Chrome on first run, and the fonts are self-hosted, so rendering needs no network.

---

## Storyboard → code map

| Time | Scene | File | On-screen |
|---|---|---|---|
| 0:00–0:05 | 1 · The Hook | `src/scenes/Scene1Hook.tsx` | COMPLEXITY → OPPORTUNITY |
| 0:05–0:11 | 2 · The Challenge | `src/scenes/Scene2Challenge.tsx` | SCATTERED DATA • SLOW HANDOFFS • DISCONNECTED TOOLS |
| 0:11–0:17 | 3 · The Solution | `src/scenes/Scene3Solution.tsx` | CONNECTED BY DESIGN |
| 0:17–0:24 | 4 · AI-Powered Intelligence | `src/scenes/Scene4AI.tsx` | AI-POWERED INTELLIGENCE |
| 0:24–0:31 | 5 · Custom Software & UX/UI | `src/scenes/Scene5Software.tsx` | CUSTOM SOFTWARE • INTUITIVE EXPERIENCES |
| 0:31–0:38 | 6 · Data & Workflow Automation | `src/scenes/Scene6Automation.tsx` | FROM DATA TO ACTION |
| 0:38–0:44 | 7 · Secure, Scalable, Results | `src/scenes/Scene7Enterprise.tsx` | SECURE. SCALABLE. RESULTS-DRIVEN. |
| 0:44–0:50 | 8 · Brand Reveal | `src/scenes/Scene8Outro.tsx` | IN TIME TEC • CREATING ABUNDANCE • intimetec.com |

Scene boundaries and VO windows live in `src/timeline.ts`. Scenes overlap by about 0.5 s with a soft depth cross-dissolve (`SceneShell` in `src/components/UI.tsx`).

### Motion system (`src/theme.ts`)
- **Easing:** cubic-bezier curves. `EASE` (0.16, 1, 0.3, 1) is used for entrances and `EASE_IO` (0.65, 0, 0.35, 1) for camera moves.
- **Card entrance:** scale 94 % → 100 %, opacity 0 → 1, with a slight upward translation (`enter()`).
- **Stagger:** 4–6 frames, about 0.13–0.20 s.
- **Panels:** 14 px radius on the design grid, which is 28 px at 4K. Translucent glass with backdrop blur, an inner highlight, soft shadow, a hairline border and an optional orange glow (`Glass` in `src/components/Stage.tsx`).
- **Camera:** a real CSS 3D camera (`Camera` / `Layer`) with perspective, depth parallax, an orbit kept under 8° in scene 3, a lateral track in scene 2, a screen-to-screen dolly in scene 5 and beat-synced focus pulls in scene 7.
- **Deterministic:** all motion is a pure function of the frame number, with seeded `random()` and no per-frame noise, so there is no flicker.

### Content guardrails
- All numbers are labelled or framed as **illustrative UI data** ("Illustrative data" captions). There are no client results, ROI claims or certifications.
- Customer and company names in the mock UIs are generic placeholders. URLs use the reserved `example.com` domain.
- There are no glitch effects, lens flares or neon overload.

---

## Brand assets: required before release

### 1. Logo (required)
The end card currently shows a **plainly typeset placeholder** labelled *"LOGO PLACEHOLDER — REPLACE WITH OFFICIAL ASSET"*. It is not the In Time Tec logo.

1. Put the official logo file in `public/brand/`, for example `public/brand/intimetec-logo.svg`. Prefer SVG; otherwise use a PNG at least 2000 px wide with transparency.
2. In `src/config.ts`, set:
   ```ts
   logoFile: 'brand/intimetec-logo.svg',
   logoHeight: 120, // design px (240 px at 4K)
   ```
The asset renders at a fixed height with its native aspect ratio. It is never stretched, recoloured or redrawn.

### 2. Typeface
The approved In Time Tec brand font could not be verified. **Montserrat** (SIL OFL, self-hosted in `public/fonts/`) is used as a temporary fallback: SemiBold/Bold for headings and Regular/Medium for UI text. To swap it, add the brand font files to `public/fonts/` and update the `loadFont()` call at the top of `src/theme.ts`.

### 3. Colours
`#F06023` orange · `#FFD600` yellow · `#111318` / `#191C22` graphite · `#FFFFFF` / `#F7F8FA` white. These are all defined in `src/theme.ts → C`.

---

## Audio

Three separate, optional stems: music, voiceover and SFX. See **[docs/audio-cue-sheet.md](docs/audio-cue-sheet.md)** for the VO script with in/out points, the music energy map and a frame-accurate SFX list.

1. Drop the full-length stems (aligned to 0:00) into `public/audio/`.
2. Set `config.audio.music / voiceover / sfx` in `src/config.ts`.

Music is automatically ducked by about 8 dB under each VO line (`duckGain`) and fades out over the last 1.4 s. To render a **silent** master for the editor, leave the paths `null`. For muted homepage autoplay, set `showCaptions: true` to burn in VO subtitles.

---

## Project structure

```
src/
  index.ts / Root.tsx      composition registration (1920×1080 @ 30 fps → --scale=2 for 4K)
  Video.tsx                master timeline: background, 8 scenes, captions, audio
  timeline.ts              scene boundaries + VO script
  config.ts                logo / audio / caption settings
  theme.ts                 palette, fonts, easing, animation helpers
  components/
    Stage.tsx              Camera, Layer, Glass, Background
    Text.tsx               MaskedText, Kicker, Underline, Counter
    Charts.tsx             LineChart, Bars, Ring, ProgressBar, Connector, LiveDot
    Icons.tsx              line-icon set
    UI.tsx                 Browser frame, Sidebar, Pill, Avatar, Cursor, Ripple, SceneShell
    Logo.tsx               logo slot (official asset or placeholder)
    AudioTracks.tsx        music / VO / SFX stems with ducking
    Captions.tsx           optional VO subtitles
  scenes/                  Scene1Hook … Scene8Outro
public/fonts/              self-hosted Montserrat (OFL)
docs/audio-cue-sheet.md    VO, music and SFX timing
```
