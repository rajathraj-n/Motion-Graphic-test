import { Easing, interpolate, spring } from "remotion";
import { FPS } from "../theme";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Premium "expo-out" style curves. */
export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
  soft: Easing.bezier(0.25, 0.1, 0.25, 1),
  backIn: Easing.bezier(0.6, -0.28, 0.735, 0.045),
  backOut: Easing.bezier(0.34, 1.56, 0.64, 1),
};

/** 0→1 progress between two frames with an easing curve. */
export const prog = (f: number, a: number, b: number, e: (t: number) => number = ease.out) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });

/** Map frame range to value range, clamped, eased. */
export const tween = (
  f: number,
  a: number,
  b: number,
  from: number,
  to: number,
  e: (t: number) => number = ease.out,
) => interpolate(f, [a, b], [from, to], { ...clamp, easing: e });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Spring-based 0→1 starting at `delay` frames. */
export const springIn = (
  frame: number,
  delay = 0,
  config: { damping?: number; stiffness?: number; mass?: number } = {},
) =>
  spring({
    frame: frame - delay,
    fps: FPS,
    config: { damping: 18, stiffness: 120, mass: 0.9, ...config },
  });

/** Typewriter: how many characters of `text` are visible between frames a and b. */
export const typed = (text: string, f: number, a: number, b: number) => {
  const n = Math.round(interpolate(f, [a, b], [0, text.length], clamp));
  return text.slice(0, n);
};

/** Blink helper (on for half of the period). */
export const blink = (f: number, period = 30) => (Math.floor(f / (period / 2)) % 2 === 0 ? 1 : 0);

/** Fade in at the start and out at the end of a window. */
export const window01 = (f: number, a: number, b: number, c: number, d: number) =>
  interpolate(f, [a, b, c, d], [0, 1, 1, 0], clamp);
