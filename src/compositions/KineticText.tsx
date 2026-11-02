import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { zColor } from "@remotion/zod-types";
import { z } from "zod";
import { enterExit, sec } from "../lib/animation";
import { FONT_FAMILY } from "../lib/fonts";
import { TitleSafe } from "../lib/TitleSafe";
import { useUnit } from "../lib/useUnit";

export const kineticTextSchema = z.object({
  text: z.string(),
  /** Seconds between each word starting to animate. */
  staggerSec: z.number().min(0).max(0.5).step(0.01),
  fontSize: z.number().min(20).max(300),
  backgroundColor: zColor(),
  textColor: zColor(),
  showSafeGuide: z.boolean(),
});

export type KineticTextProps = z.infer<typeof kineticTextSchema>;

export const KINETIC_TEXT_DURATION_SEC = 5;

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  staggerSec,
  fontSize,
  backgroundColor,
  textColor,
  showSafeGuide,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const u = useUnit();

  const words = text.split(/\s+/).filter(Boolean);
  const stagger = sec(staggerSec, fps);

  return (
    <AbsoluteFill style={{ backgroundColor, fontFamily: FONT_FAMILY }}>
      <TitleSafe
        showGuide={showSafeGuide}
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          alignContent: "center",
          columnGap: u(fontSize * 0.28),
          rowGap: u(fontSize * 0.1),
          textAlign: "center",
        }}
      >
        {words.map((word, i) => {
          // Words enter left → right and exit left → right too:
          // the first word starts leaving first, the last word leaves on the final frame.
          const a = enterExit({
            frame,
            fps,
            durationInFrames,
            enterDelay: i * stagger,
            enterFrames: sec(0.8, fps),
            exitFrames: sec(0.4, fps),
            exitAdvance: (words.length - 1 - i) * stagger,
          });

          const y =
            interpolate(a.enter, [0, 1], [u(fontSize * 0.6), 0]) -
            interpolate(a.exit, [0, 1], [0, u(fontSize * 0.6)], {
              easing: Easing.in(Easing.quad),
            });
          const blur = interpolate(a.visible, [0, 1], [u(8), 0]);

          return (
            // Overflow mask so words slide out of an invisible line box.
            <span
              key={`${word}-${i}`}
              style={{ display: "inline-block", overflow: "hidden" }}
            >
              <span
                style={{
                  display: "inline-block",
                  color: textColor,
                  fontSize: u(fontSize),
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  opacity: a.visible,
                  filter: `blur(${blur}px)`,
                  transform: `translateY(${y}px)`,
                }}
              >
                {word}
              </span>
            </span>
          );
        })}
      </TitleSafe>
    </AbsoluteFill>
  );
};
