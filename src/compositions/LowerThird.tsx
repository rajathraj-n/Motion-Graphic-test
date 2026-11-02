import React from "react";
import {
  AbsoluteFill,
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

// Rendered on a transparent background so it can sit over footage.
// See README → "Transparent export".

export const lowerThirdSchema = z.object({
  name: z.string(),
  role: z.string(),
  panelColor: zColor(),
  nameColor: zColor(),
  roleColor: zColor(),
  showSafeGuide: z.boolean(),
});

export type LowerThirdProps = z.infer<typeof lowerThirdSchema>;

export const LOWER_THIRD_DURATION_SEC = 6;

export const LowerThird: React.FC<LowerThirdProps> = ({
  name,
  role,
  panelColor,
  nameColor,
  roleColor,
  showSafeGuide,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const u = useUnit();

  const common = { frame, fps, durationInFrames };

  // Panel wipes in first and wipes out last…
  const panel = enterExit({
    ...common,
    enterFrames: sec(0.7, fps),
    exitFrames: sec(0.5, fps),
  });
  // …text arrives after the panel and leaves before it.
  const nameAnim = enterExit({
    ...common,
    enterDelay: sec(0.25, fps),
    enterFrames: sec(0.7, fps),
    exitFrames: sec(0.35, fps),
    exitAdvance: sec(0.3, fps),
  });
  const roleAnim = enterExit({
    ...common,
    enterDelay: sec(0.4, fps),
    enterFrames: sec(0.7, fps),
    exitFrames: sec(0.35, fps),
    exitAdvance: sec(0.25, fps),
  });

  // Wipe: reveal from the left on enter, hide toward the right on exit.
  const clipRight = interpolate(panel.enter, [0, 1], [100, 0]);
  const clipLeft = interpolate(panel.exit, [0, 1], [0, 100]);

  const slide = (a: { enter: number; exit: number }) =>
    interpolate(a.enter, [0, 1], [u(30), 0]) -
    interpolate(a.exit, [0, 1], [0, u(20)]);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_FAMILY }}>
      <TitleSafe
        showGuide={showSafeGuide}
        style={{ alignItems: "flex-end", justifyContent: "flex-start" }}
      >
        <div
          style={{
            backgroundColor: panelColor,
            padding: `${u(22)}px ${u(36)}px`,
            clipPath: `inset(0 ${clipRight}% 0 ${clipLeft}%)`,
            display: "flex",
            flexDirection: "column",
            gap: u(6),
          }}
        >
          <div
            style={{
              color: nameColor,
              fontSize: u(48),
              fontWeight: 700,
              lineHeight: 1.1,
              opacity: nameAnim.visible,
              transform: `translateY(${slide(nameAnim)}px)`,
            }}
          >
            {name}
          </div>
          <div
            style={{
              color: roleColor,
              fontSize: u(28),
              fontWeight: 400,
              opacity: roleAnim.visible,
              transform: `translateY(${slide(roleAnim)}px)`,
            }}
          >
            {role}
          </div>
        </div>
      </TitleSafe>
    </AbsoluteFill>
  );
};
