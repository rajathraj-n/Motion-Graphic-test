import { Easing, interpolate, spring } from "remotion";

export { sec } from "../config/video";

/**
 * Small, reusable animation helpers. Every graphic in this project uses the
 * same pattern:
 *
 *   visibility = enter (0 → 1, spring) − exit (0 → 1, eased)
 *
 * so it starts invisible on frame 0 and is invisible again on the final
 * frame — no pops or hard cuts when you drop it on a timeline.
 */

type EnterExitOptions = {
  frame: number;
  fps: number;
  durationInFrames: number;
  /** Delay before the enter starts, in frames. */
  enterDelay?: number;
  /** Length of the enter spring, in frames. */
  enterFrames: number;
  /** Length of the exit, in frames. It always ends on the last frame. */
  exitFrames: number;
  /** Extra frames to start the exit earlier (for staggered exits). */
  exitAdvance?: number;
};

/** Spring-driven enter, 0 → 1. Critically damped = no overshoot. */
export const enterProgress = (
  frame: number,
  fps: number,
  durationInFrames: number,
  delay = 0,
  damping = 200,
) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: { damping },
  });

/** Eased exit, 0 → 1, finishing exactly on `endFrame`. */
export const exitProgress = (
  frame: number,
  endFrame: number,
  exitFrames: number,
) =>
  interpolate(frame, [endFrame - exitFrames, endFrame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

/** Combined enter + exit. Returns values in the 0..1 range. */
export const enterExit = ({
  frame,
  fps,
  durationInFrames,
  enterDelay = 0,
  enterFrames,
  exitFrames,
  exitAdvance = 0,
}: EnterExitOptions) => {
  // Last visible frame index is durationInFrames - 1.
  const endFrame = durationInFrames - 1 - exitAdvance;
  const enter = enterProgress(frame, fps, enterFrames, enterDelay);
  const exit = exitProgress(frame, endFrame, exitFrames);
  return { enter, exit, visible: Math.max(0, enter - exit) };
};
