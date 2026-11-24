# Remotion Studio project

Opens both films in Remotion Studio, where you can scrub through them, edit
their on-screen text in the props panel, and render them.

```bash
cd remotion
npm install
npm run dev          # opens Remotion Studio at http://localhost:3000
```

- Pick **InTimeTec** or **Freedom** in the left sidebar.
- Edit the text in the right-hand **Props** panel; the preview updates
  instantly. Click the save icon to write your changes into `src/Root.tsx`.
- Click **Render** (bottom right), or use the command line:

```bash
npm run render:intimetec        # 1080p → remotion/out/intimetec.mp4
npm run render:intimetec:4k     # 3840×2160
npm run render:freedom
npm run render:freedom:4k
```

The animation code itself lives in `../intimetec/src/*.js` and `../src/*.js`.
Edit those files and the Studio hot-reloads.

Assets are copied in automatically when you start the Studio or render:
- logo → `intimetec/assets/logo.svg` or `logo.png`
- portraits → `assets/portraits/`
- voiceover → `intimetec/audio/voiceover/01.mp3 …` and
  `audio/voiceover/01.mp3 …`

The music is in `public/audio/`.
