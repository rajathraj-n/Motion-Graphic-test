import {Easing, interpolate} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 with a bouncy spring between `start` and `start + dur` frames. */
export const springIn = (frame: number, start: number, dur = 18, damping = 10) =>
	interpolate(frame, [start, start + dur], [0, 1], {...clamp, easing: Easing.spring({damping})});

/** 0→1 with a smooth ease-out. */
export const easeIn = (frame: number, start: number, dur = 20) =>
	interpolate(frame, [start, start + dur], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)});

/** 0→1 with ease-in-out. */
export const easeInOut = (frame: number, start: number, dur = 20) =>
	interpolate(frame, [start, start + dur], [0, 1], {...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1)});

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
