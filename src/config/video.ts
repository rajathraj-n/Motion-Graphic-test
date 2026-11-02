/**
 * Shared canvas settings — the ONE place to change resolution and frame rate.
 *
 * Switch to 4K / 60fps by changing ACTIVE_PRESET below. Everything else
 * (layout sizes, animation timing) is written so it adapts automatically:
 *   - Sizes are authored in "1080p pixels" and scaled with useUnit().
 *   - Durations are authored in seconds and converted with sec().
 */
export const PRESETS = {
  "1080p30": { width: 1920, height: 1080, fps: 30 },
  "1080p60": { width: 1920, height: 1080, fps: 60 },
  "4k30": { width: 3840, height: 2160, fps: 30 },
  "4k60": { width: 3840, height: 2160, fps: 60 },
  "vertical1080p30": { width: 1080, height: 1920, fps: 30 },
  "square1080p30": { width: 1080, height: 1080, fps: 30 },
} as const;

export type PresetName = keyof typeof PRESETS;

/** 👉 Change this to switch every composition at once. */
export const ACTIVE_PRESET: PresetName = "1080p30";

export const VIDEO = PRESETS[ACTIVE_PRESET];

/** Convert seconds to a whole number of frames at the given fps. */
export const sec = (seconds: number, fps: number = VIDEO.fps): number =>
  Math.round(seconds * fps);

/**
 * Title-safe margin as a fraction of the frame (10% on each side = the
 * classic 80% title-safe box). Keep text inside it.
 */
export const TITLE_SAFE = 0.1;
