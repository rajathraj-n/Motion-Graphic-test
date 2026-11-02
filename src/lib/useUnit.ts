import { useVideoConfig } from "remotion";

/** The design height every size in this project is authored against. */
export const DESIGN_HEIGHT = 1080;

/**
 * Returns a function that converts "1080p pixels" to real pixels for the
 * current canvas. At 1080p, u(64) === 64. At 4K, u(64) === 128.
 * Uses the shorter side so vertical / square formats scale sensibly too.
 */
export const useUnit = () => {
  const { width, height } = useVideoConfig();
  const scale = Math.min(width, height) / DESIGN_HEIGHT;
  return (px: number) => px * scale;
};
