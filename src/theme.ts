import type {CSSProperties} from 'react';
import {Easing, interpolate} from 'remotion';
import {staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

// Temporary motion-design fallback (Montserrat, SIL OFL) until the approved In Time Tec
// brand font is supplied. Self-hosted so renders never depend on the network.
// To swap: drop the brand font files into /public/fonts and change the loadFont call(s) below.
const FAMILY = 'ITT Display';
loadFont({
  family: FAMILY,
  url: staticFile('fonts/Montserrat-latin-variable.woff2'),
  weight: '100 900',
  format: 'woff2',
});
export const FONT = `'${FAMILY}', 'Montserrat', 'Helvetica Neue', Arial, sans-serif`;

export const C = {
  orange: '#F06023',
  yellow: '#FFD600',
  graphite: '#111318',
  graphite2: '#191C22',
  white: '#FFFFFF',
  offWhite: '#F7F8FA',
  text: 'rgba(255,255,255,0.94)',
  textDim: 'rgba(255,255,255,0.62)',
  textFaint: 'rgba(255,255,255,0.38)',
  hair: 'rgba(255,255,255,0.10)',
  hair2: 'rgba(255,255,255,0.16)',
  orangeSoft: 'rgba(240,96,35,0.16)',
  orangeGlow: 'rgba(240,96,35,0.45)',
};

/** Design space. The composition is 1920×1080 and renders to 3840×2160 with --scale=2. */
export const W = 1920;
export const H = 1080;
export const FPS = 30;

// Easing — cubic-bezier curves in the spirit of After Effects Easy Ease.
export const EASE = Easing.bezier(0.16, 1, 0.3, 1); // decisive ease-out for entrances
export const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1); // camera moves
export const EASE_SOFT = Easing.bezier(0.33, 1, 0.68, 1);

/** Clamped interpolate with easing. */
export const tween = (
  f: number,
  input: [number, number],
  output: [number, number],
  easing: (t: number) => number = EASE,
) =>
  interpolate(f, input, output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** Multi-keyframe clamped interpolate where every segment uses the same easing. */
export const keys = (
  f: number,
  input: number[],
  output: number[],
  easing: (t: number) => number = EASE_IO,
) => {
  if (f <= input[0]) return output[0];
  for (let i = 0; i < input.length - 1; i++) {
    if (f <= input[i + 1]) {
      return tween(f, [input[i], input[i + 1]], [output[i], output[i + 1]], easing);
    }
  }
  return output[output.length - 1];
};

/** Progress 0→1 between two frames. */
export const prog = (f: number, start: number, dur: number, easing = EASE) =>
  tween(f, [start, start + dur], [0, 1], easing);

/**
 * Card entrance: scale 94%→100%, opacity 0→1, slight upward translation.
 */
export const enter = (f: number, delay: number, dur = 20, dist = 26): CSSProperties => {
  const p = prog(f, delay, dur);
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * dist}px) scale(${0.94 + 0.06 * p})`,
  };
};

export const STAGGER = 5; // ≈0.17 s at 30 fps

export const RADIUS = 14; // = 28 px at 4K output
