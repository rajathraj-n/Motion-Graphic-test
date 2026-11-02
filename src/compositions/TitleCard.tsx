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

export const titleCardSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  backgroundColor: zColor(),
  textColor: zColor(),
  accentColor: zColor(),
  showSafeGuide: z.boolean(),
});

export type TitleCardProps = z.infer<typeof titleCardSchema>;

export const TITLE_CARD_DURATION_SEC = 5;

export const TitleCard: React.FC<TitleCardProps> = ({
  title,
  subtitle,
  backgroundColor,
  textColor,
  accentColor,
  showSafeGuide,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const u = useUnit();

  const common = { frame, fps, durationInFrames, exitFrames: sec(0.6, fps) };

  // Title enters first, line second, subtitle third. On exit the order reverses
  // (subtitle leaves first) by starting each exit a little earlier.
  const titleAnim = enterExit({ ...common, enterFrames: sec(1, fps) });
  const lineAnim = enterExit({
    ...common,
    enterDelay: sec(0.25, fps),
    enterFrames: sec(0.8, fps),
    exitAdvance: sec(0.1, fps),
  });
  const subAnim = enterExit({
    ...common,
    enterDelay: sec(0.45, fps),
    enterFrames: sec(1, fps),
    exitAdvance: sec(0.2, fps),
  });

  // Translate: rise in from below, drift up and out.
  const rise = (a: { enter: number; exit: number }, distance: number) =>
    interpolate(a.enter, [0, 1], [u(distance), 0]) -
    interpolate(a.exit, [0, 1], [0, u(distance)]);

  // Line grows from the center on enter and shrinks on exit.
  const lineScale = interpolate(
    lineAnim.visible,
    [0, 1],
    [0, 1],
    { easing: Easing.inOut(Easing.quad) },
  );

  return (
    <AbsoluteFill style={{ backgroundColor, fontFamily: FONT_FAMILY }}>
      <TitleSafe
        showGuide={showSafeGuide}
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: textColor,
            fontSize: u(110),
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            opacity: titleAnim.visible,
            transform: `translateY(${rise(titleAnim, 40)}px)`,
          }}
        >
          {title}
        </div>
        <div
          style={{
            width: u(120),
            height: u(4),
            marginTop: u(36),
            marginBottom: u(32),
            backgroundColor: accentColor,
            transform: `scaleX(${lineScale})`,
          }}
        />
        <div
          style={{
            color: textColor,
            fontSize: u(40),
            fontWeight: 400,
            opacity: subAnim.visible * 0.8,
            transform: `translateY(${rise(subAnim, 24)}px)`,
          }}
        >
          {subtitle}
        </div>
      </TitleSafe>
    </AbsoluteFill>
  );
};
