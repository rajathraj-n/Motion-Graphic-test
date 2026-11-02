# Motion-Graphic-test

A minimal, neutral **Remotion + TypeScript** starter for motion graphics that you design in React and export into any video editor (Premiere, Resolve, Final Cut, After Effects…).

It's meant as a starting point to take in your own direction, not a finished style.

- Remotion `4.0.540`, React 19, TypeScript, zod 4
- 4 starter graphics, each with a full **enter and exit** and a live-editable **zod schema**
- Exports MP4, **ProRes 4444 with real alpha**, or PNG sequences

---

## Quick start

```bash
npm install
npm run studio        # live preview at http://localhost:3000
```

Requires Node 18+ (Node 20/22 recommended).

---

## Project structure

```
remotion.config.ts        Global render settings (CLI + Studio)
src/
  index.ts                Entry point (registerRoot)
  Root.tsx                Registers every composition ← add new graphics here
  config/video.ts         Canvas settings: resolution, fps, title-safe margin
  compositions/           One file per graphic
    TitleCard.tsx         a) Title card            (fullscreen)
    LowerThird.tsx        b) Lower third           (transparent)
    KineticText.tsx       c) Kinetic text          (fullscreen)
    OverlayBadge.tsx      d) Transparent badge + sound effect demo
  lib/
    animation.ts          enterExit() helper + sec()
    useUnit.ts            Resolution-independent sizing
    fonts.ts              Google Font loading (Inter)
    TitleSafe.tsx         Lays content out inside the title-safe area
public/                   Static files → use with staticFile("…")
  audio/pop.wav           Demo sound effect
  fonts/  images/
scripts/render.mjs        Shortcut for the npm render:* scripts
out/                      Renders go here (git-ignored)
```

---

## Canvas: resolution & fps

Everything lives in **`src/config/video.ts`**. Change one line:

```ts
export const ACTIVE_PRESET: PresetName = "4k60"; // was "1080p30"
```

Presets: `1080p30`, `1080p60`, `4k30`, `4k60`, `vertical1080p30`, `square1080p30` (add your own).

This works without touching the graphics because:

- **Sizes** are written in "1080p pixels" through `useUnit()`: `u(64)` is 64px at 1080p and 128px at 4K.
- **Timing** is written in seconds through `sec()`: `sec(0.5, fps)` is 15 frames at 30fps and 30 frames at 60fps.

Keep using `u()` and `sec()` in new graphics and they'll scale the same way.

---

## Preview

```bash
npm run studio
```

- Pick a composition in the left sidebar.
- Edit text, colors, numbers and toggles live in the **Props** panel on the right (generated from each zod schema). Click save to write your changes back into the inline `defaultProps` in `Root.tsx`.
- Turn on `showSafeGuide` to see the title-safe box.
- Transparent compositions show a checkerboard where the frame is see-through.
- You can also render from the Studio's **Render** button. Overlays default to ProRes 4444 with alpha there.

---

## Adding a new graphic

1. **Create the component**: `src/compositions/MyGraphic.tsx`

   ```tsx
   import React from "react";
   import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
   import { zColor } from "@remotion/zod-types";
   import { z } from "zod";
   import { enterExit, sec } from "../lib/animation";
   import { FONT_FAMILY } from "../lib/fonts";
   import { TitleSafe } from "../lib/TitleSafe";
   import { useUnit } from "../lib/useUnit";

   export const myGraphicSchema = z.object({
     text: z.string(),
     color: zColor(),
   });
   export type MyGraphicProps = z.infer<typeof myGraphicSchema>;

   export const MyGraphic: React.FC<MyGraphicProps> = ({ text, color }) => {
     const frame = useCurrentFrame();
     const { fps, durationInFrames } = useVideoConfig();
     const u = useUnit();
     const a = enterExit({
       frame, fps, durationInFrames,
       enterFrames: sec(0.8, fps),
       exitFrames: sec(0.5, fps),
     });
     return (
       // No backgroundColor here → transparent. Add one for a fullscreen graphic.
       <AbsoluteFill style={{ fontFamily: FONT_FAMILY }}>
         <TitleSafe style={{ alignItems: "center", justifyContent: "center" }}>
           <div style={{
             color, fontSize: u(80), opacity: a.visible,
             transform: `translateY(${interpolate(a.enter, [0, 1], [u(30), 0])}px)`,
           }}>
             {text}
           </div>
         </TitleSafe>
       </AbsoluteFill>
     );
   };
   ```

2. **Register it** in `src/Root.tsx`:

   ```tsx
   <Composition
     id="MyGraphic"                       // used in render commands
     component={MyGraphic}
     width={VIDEO.width}                  // or a custom size for this graphic
     height={VIDEO.height}
     fps={VIDEO.fps}
     durationInFrames={sec(4)}            // 4 seconds at any fps
     schema={myGraphicSchema}             // → live props panel
     defaultProps={{ text: "Hello", color: "#ffffff" }}  // keep inline (see below)
     // calculateMetadata={transparentDefaults}  // ← add for overlays
   />
   ```

   Write `defaultProps` as an inline object literal, as above. That lets the Studio's **save** button write your prop edits back into `Root.tsx`.

3. Run `npm run studio` and it appears in the sidebar.

### Animation building blocks

| API | Use it for |
| --- | --- |
| `useCurrentFrame()` | The current frame number. Every animation is a function of this. |
| `interpolate(frame, [in], [out], { easing, extrapolateLeft/Right: "clamp" })` | Map a frame range to any value (opacity, px, degrees…). |
| `spring({ frame, fps, config: { damping } })` | Natural 0 → 1 motion. `damping: 200` gives no overshoot; `damping: 10–15` bounces. |
| `Easing.in/out/inOut(Easing.cubic \| quad \| sin \| back(…))` | Shape an `interpolate` curve. |
| `enterExit()` (in `src/lib/animation.ts`) | Spring enter + eased exit that's fully gone on the last frame. |

---

## Rendering / export

All renders go to `out/`. Replace `<id>` with a composition id (`TitleCard`, `LowerThird`, `KineticText`, `OverlayBadge`, …).

### MP4 (H.264, opaque)

```bash
npx remotion render <id> out/<id>.mp4 --codec=h264 --crf=18
```

### Transparent: ProRes 4444 `.mov` with alpha

```bash
npx remotion render <id> out/<id>.mov --codec=prores \
  --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png
```

Drop the `.mov` on a track above your footage. Any area the composition doesn't paint stays transparent. ProRes 4444 is supported by Premiere, Resolve, Final Cut and After Effects.

### PNG sequence (alpha preserved)

```bash
npx remotion render <id> out/<id> --sequence --image-format=png \
  --image-sequence-pattern="frame-[frame].[ext]"
```

This writes `out/<id>/frame-000.png`, `frame-001.png`, … (`[frame]` is zero-padded to fit the frame count).

> In Remotion 4.0.540, a pattern in the output path (`out/<id>/frame-%04d.png`) **doesn't work**: Remotion treats it as a video filename and errors out. Use `--sequence` with an output folder and `--image-sequence-pattern` as shown above.

### npm shortcuts (same commands)

```bash
npm run render:mp4 -- TitleCard
npm run render:mov -- OverlayBadge
npm run render:png -- LowerThird
```

Extra flags pass through, e.g. `npm run render:mov -- LowerThird --frames=0-59` or `--props='{"name":"Alex Kim"}'`.

### Other useful commands

```bash
npm run compositions                       # list ids, size, fps, duration
npx remotion still <id> out/<id>.png --frame=60   # single frame
npm run typecheck
```

**Per-composition defaults:** `LowerThird` and `OverlayBadge` use `calculateMetadata={transparentDefaults}` in `Root.tsx`. That makes ProRes 4444 + alpha the default for the Studio Render button and for CLI renders without flags. CLI flags always take priority.

---

## Fonts

`src/lib/fonts.ts` loads **Inter** from Google Fonts using `@remotion/google-fonts`. Remotion waits for the font before rendering any frame, so renders never show a fallback font. To switch fonts:

```ts
import { loadFont } from "@remotion/google-fonts/Montserrat";
const { fontFamily } = loadFont("normal", { weights: ["400", "700"], subsets: ["latin"] });
```

Load only the weights you use. For your own font files, put them in `public/fonts/` and load them with `@remotion/fonts` (`npm i @remotion/fonts@4.0.540`) and `staticFile("fonts/…")`.

Google Fonts are fetched at render time, so rendering needs internet access. To render offline, use a local font file.

---

## Sound effects

See `OverlayBadge.tsx`. Put audio in `public/audio/`, then place each sound inside a `<Sequence>` so it starts on a specific frame:

```tsx
import { Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";

<Sequence from={0} durationInFrames={sec(0.5, fps)}>
  <Audio src={staticFile("audio/pop.wav")} volume={0.6} />
</Sequence>
```

Remotion 4.0.540 deprecates `<Audio>` from `"remotion"` (it's renamed `Html5Audio`). The current recommended component is `<Audio>` from `@remotion/media`, which uses the same JSX.

Audio is embedded in MP4 and MOV renders. PNG sequences have no audio.

---

## Tips

- **Keep text in the title-safe area.** Wrap content in `<TitleSafe>`, which leaves a 10% margin on each side (`TITLE_SAFE` in `config/video.ts`). Toggle `showSafeGuide` in the Studio to see the box. Platforms, TVs and editors' UI overlays can crop the edges.
- **Always give animations a full enter and exit.** Frame 0 and the last frame should be empty (or fully transparent), so a graphic never pops on or cuts off mid-move when dropped on a timeline. `enterExit()` does this for you. Scrub to the first and last frame in the Studio to check.
- **Trim leading silence on sound effects.** Even 50 ms of silence at the start of a file makes the sound land late. Trim it in an audio editor so the transient starts at sample 0, then line it up with a `<Sequence from={…}>`.
- **Author in seconds and 1080p units** (`sec()`, `u()`) so switching to 4K / 60fps is a one-line change.
- **Don't use CSS transitions/animations or `Math.random()`.** Every frame must be a pure function of `useCurrentFrame()` (use `random(seed)` from `remotion` for randomness).
- **Transparency:** don't set a `backgroundColor` on the outer `AbsoluteFill` of overlays, and export with ProRes 4444 or PNG. H.264 MP4 cannot carry alpha.

---

## Docs

- Remotion docs: https://www.remotion.dev/docs
- Transparent videos: https://www.remotion.dev/docs/transparent-videos
- Props & schemas: https://www.remotion.dev/docs/schemas
- Google Fonts: https://www.remotion.dev/docs/google-fonts
