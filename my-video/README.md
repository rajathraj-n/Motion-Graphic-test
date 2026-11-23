# Remotion video

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Commands

**Install Dependencies**

```console
npm i --loglevel=error
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).

## Wild India (24 s, 1920×1080)

- `src/WildIndia.tsx`: the main timeline (6 scenes, circle-reveal transitions, music and SFX tracks)
- `src/scenes/`: one file per scene · `src/animals/`: the SVG animals · `src/props/`: map, captions, scenery
- `scripts/make-audio.mjs`: regenerates `public/music.wav` and `public/sfx/*.wav` (`node scripts/make-audio.mjs`)
- Voiceover: put a recording in `public/` (e.g. `voiceover.mp3`) and set the `voiceover` prop to its file name; the music ducks automatically.

Render: `npx remotion render WildIndia out/WildIndia.mp4`
