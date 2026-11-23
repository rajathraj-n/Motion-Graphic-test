# Audio cue sheet: In Time Tec, 50 s SaaS promo

30 fps · 1500 frames · music ≈ 118 BPM (1 beat ≈ 0.508 s ≈ 15.25 frames)

Deliver three separate stems, all full length (0:00–0:50) and aligned to frame 0:

| Stem | File (suggested) | Notes |
|---|---|---|
| Music | `public/audio/music.wav` | Ducked about 8 dB under VO automatically (`src/components/AudioTracks.tsx`) |
| Voiceover | `public/audio/voiceover.wav` | Warm, confident, global English, natural pacing |
| SFX | `public/audio/sfx.wav` | Soft and refined, never louder than VO |

Then set the paths in `src/config.ts → audio`.

## Voiceover

| # | In | Out | Line |
|---|---|---|---|
| 1 | 0:00.4 | 0:04.4 | What if complexity could become your competitive advantage? |
| 2 | 0:05.3 | 0:10.6 | Disconnected systems, scattered data, and slow handoffs hold businesses back. |
| 3 | 0:11.4 | 0:16.2 | In Time Tec connects the pieces and turns ideas into impact. |
| 4 | 0:17.4 | 0:23.2 | With custom AI, teams move from information overload to intelligent action. |
| 5 | 0:24.4 | 0:30.4 | We design software and intuitive experiences around how people really work. |
| 6 | 0:31.4 | 0:37.4 | We bring data, automation, and real-time visibility into one seamless workflow. |
| 7 | 0:38.4 | 0:43.4 | Built for security, scale, and results that matter to your business. |
| 8 | 0:44.6 | 0:49.2 | In Time Tec. Creating Abundance. Let's build what's next. |

The windows are the source of truth in `src/timeline.ts` (`VO`). If the recorded reads differ, update them there. Music ducking and the optional captions follow automatically.

## Music energy map

| Time | Section | Direction |
|---|---|---|
| 0:00–0:11 | Tension / problem | Low atmospheric synth pulse, digital ticks, restrained riser into 0:11 |
| 0:11 | Lift | Brief musical lift exactly on the dashboard reveal (frame ≈ 360) |
| 0:11–0:38 | Reveal / momentum | Rhythmic percussion, warm bass, crisp electronic accents, uplifting synth motif |
| 0:38–0:44 | Peak | Beat-synced panel landings at 0:38.1 · 0:39.3 · 0:40.6 |
| 0:44–0:50 | Resolve | Controlled cinematic rise → resolved ending at 0:46.5, clean reverb tail, fade by 0:50 |

## Sound effects (frame-accurate)

| Time | Frame | Event | SFX |
|---|---|---|---|
| 0:00.0 | 0 | Light trails start drawing | Soft airy whoosh (L→R) |
| 0:01.0 | 30 | Network nodes pop | 4–6 tiny digital ticks |
| 0:01.3 | 40 | Glass panels emerge | Refined glass shimmer |
| 0:02.5 | 74 | "OPPORTUNITY" lands | **Low-frequency impact / bass hit** |
| 0:05.0 | 150 | Cut to challenge cards | Subtle whoosh |
| 0:05.8–6.3 | 174–190 | Connector lines break | Three muted "disconnect" clicks |
| 0:06.1 / 0:06.7 / 0:07.3 | 182 / 200 / 218 | Challenge chips appear | Three soft UI pops |
| 0:10.9 | 326 | Cards converge | Reverse-swell whoosh into… |
| 0:11.9–12.5 | 358–375 | Dashboard reveal | Glass "bloom" + musical lift |
| 0:12.8 | 384 | Workflow connectors draw | Gentle data-flow pulse loop (low) |
| 0:16.9 | 508 | AI panel enters | Whoosh + glass |
| 0:19.9 | 598 | Recommendation card | Soft UI pop |
| 0:22.3 | 670 | "Apply" selected | UI confirmation click |
| 0:25.8 / 0:28.0 | 774 / 840 | Camera moves between screens | Two short lateral swooshes |
| 0:29.6 | 888 | Cursor click "Mark complete" | **Crisp UI click** |
| 0:30.0 | 900 | Toast appears | Success chime (very short) |
| 0:31.4–33.9 | 942–1016 | Workflow steps trigger | Four rising ticks, one per step |
| 0:34.3 | 1030 | Analytics dashboard | Glass slide |
| 0:38.1 / 0:39.3 / 0:40.6 | 1142 / 1180 / 1218 | Capability panels land (on beat) | Three layered low impacts |
| 0:41.1 | 1232 | Pull back to grid | Wide whoosh |
| 0:44.6 | 1338 | Panels converge into orange circle | Reverse swell |
| 0:45.4 | 1362 | White end card wipes in | Bright airy sweep |
| 0:45.9 / 0:46.8 | 1378 / 1406 | Logo reveal / light sweep | **Minimal logo shimmer** |
| 0:48.0 | 1440 | Final composition complete | Music resolves; reverb tail to 0:50 |

Mix guide: VO about −14 LUFS-I for web delivery. Music sits 6–10 dB under narration (automated in code when you use the music stem). SFX sit about 6 dB under VO peaks.
