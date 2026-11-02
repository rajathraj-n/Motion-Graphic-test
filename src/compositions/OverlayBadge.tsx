import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { zColor } from "@remotion/zod-types";
import { z } from "zod";
import { exitProgress, sec } from "../lib/animation";
import { FONT_FAMILY } from "../lib/fonts";
import { TitleSafe } from "../lib/TitleSafe";
import { useUnit } from "../lib/useUnit";

// Transparent overlay demo: NO background color is painted anywhere, so the
// frame is transparent wherever the badge isn't. The Studio shows a
// checkerboard there. Render with ProRes 4444 / PNG to keep the alpha channel.

export const overlayBadgeSchema = z.object({
  label: z.string(),
  position: z.enum(["top-left", "top-right", "bottom-left", "bottom-right", "center"]),
  badgeColor: zColor(),
  textColor: zColor(),
  dotColor: zColor(),
  /** Plays public/audio/pop.wav on enter and exit. */
  playSound: z.boolean(),
  showSafeGuide: z.boolean(),
});

export type OverlayBadgeProps = z.infer<typeof overlayBadgeSchema>;

export const OVERLAY_BADGE_DURATION_SEC = 4;

const ALIGN: Record<OverlayBadgeProps["position"], React.CSSProperties> = {
  "top-left": { alignItems: "flex-start", justifyContent: "flex-start" },
  "top-right": { alignItems: "flex-start", justifyContent: "flex-end" },
  "bottom-left": { alignItems: "flex-end", justifyContent: "flex-start" },
  "bottom-right": { alignItems: "flex-end", justifyContent: "flex-end" },
  center: { alignItems: "center", justifyContent: "center" },
};

export const OverlayBadge: React.FC<OverlayBadgeProps> = ({
  label,
  position,
  badgeColor,
  textColor,
  dotColor,
  playSound,
  showSafeGuide,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const u = useUnit();

  const exitFrames = sec(0.4, fps);
  const exitStart = durationInFrames - 1 - exitFrames;

  // Enter: a slightly bouncy spring (low damping = overshoot) for a "pop".
  const pop = spring({ frame, fps, config: { damping: 12, stiffness: 180 } });
  // Exit: ease-in so it accelerates away and is fully gone on the last frame.
  const exit = exitProgress(frame, durationInFrames - 1, exitFrames);

  const scale = pop * interpolate(exit, [0, 1], [1, 0.6]);
  const opacity =
    interpolate(frame, [0, sec(0.15, fps)], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    (1 - exit);

  // The label slides out from behind the dot after the pop.
  const reveal = spring({
    frame: frame - sec(0.2, fps),
    fps,
    config: { damping: 200 },
  });
  const labelReveal = reveal * (1 - exit);

  // The dot pulses gently while on screen.
  const pulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.55, 1],
    { easing: Easing.inOut(Easing.sin) },
  );

  return (
    <AbsoluteFill style={{ fontFamily: FONT_FAMILY }}>
      {/* Sound effects: each <Audio> lives in a <Sequence> so it starts on cue.
          Trim leading silence from SFX files so the hit lands on the frame. */}
      {playSound ? (
        <>
          <Sequence from={0} durationInFrames={sec(0.5, fps)} name="SFX enter">
            <Audio src={staticFile("audio/pop.wav")} volume={0.6} />
          </Sequence>
          <Sequence from={exitStart} durationInFrames={exitFrames} name="SFX exit">
            <Audio src={staticFile("audio/pop.wav")} volume={0.35} playbackRate={0.8} />
          </Sequence>
        </>
      ) : null}

      <TitleSafe showGuide={showSafeGuide} style={ALIGN[position]}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: u(14) * labelReveal,
            backgroundColor: badgeColor,
            borderRadius: u(999),
            padding: `${u(14)}px ${u(24)}px`,
            opacity,
            transform: `scale(${scale})`,
            transformOrigin: "center",
          }}
        >
          <div
            style={{
              width: u(20),
              height: u(20),
              borderRadius: "50%",
              backgroundColor: dotColor,
              opacity: pulse,
            }}
          />
          <div
            style={{
              // Width-reveal the label without measuring text: max-width animates.
              maxWidth: `${labelReveal * 20}em`,
              overflow: "hidden",
              whiteSpace: "nowrap",
              color: textColor,
              fontSize: u(34),
              fontWeight: 700,
              letterSpacing: "0.08em",
              opacity: labelReveal,
            }}
          >
            {label}
          </div>
        </div>
      </TitleSafe>
    </AbsoluteFill>
  );
};
