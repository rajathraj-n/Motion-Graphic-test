import { ensureFonts } from "./fonts";

ensureFonts();

export const FONT = `Inter, "SF Pro Display", system-ui, sans-serif`;
export const MONO = `"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace`;

/** Suggested creative palette (not an official brand spec). */
export const C = {
  black: "#0A0A0A",
  white: "#FFFFFF",
  graphite: "#171717",
  graphite2: "#1F1F22",
  silver: "#A1A1AA",
  dim: "#52525B",
  green: "#10A37F",
  greenSoft: "rgba(16,163,127,0.35)",
};

/** Everything is authored on a 1920x1080 logical stage and scaled 2x to 4K. */
export const STAGE_W = 1920;
export const STAGE_H = 1080;
export const FPS = 60;
export const OUTPUT_SCALE = 2; // 3840x2160

/** 120 BPM -> one beat every 0.5 s = 30 frames. */
export const BEAT = 30;

/** Frames each scene stays mounted after its nominal end, so the next scene can cross over it. */
export const TAIL = 24;

export const SCENES = [
  { id: "hook", start: 0, dur: 240 }, //       00:00 – 00:04
  { id: "meet", start: 240, dur: 300 }, //     00:04 – 00:09
  { id: "create", start: 540, dur: 360 }, //   00:09 – 00:15
  { id: "think", start: 900, dur: 360 }, //    00:15 – 00:21
  { id: "imagine", start: 1260, dur: 360 }, // 00:21 – 00:27
  { id: "workspace", start: 1620, dur: 360 }, // 00:27 – 00:33
  { id: "payoff", start: 1980, dur: 240 }, //  00:33 – 00:37
  { id: "brand", start: 2220, dur: 180 }, //   00:37 – 00:40
] as const;

export const TOTAL_FRAMES = 2400; // exactly 40 s @ 60 fps
