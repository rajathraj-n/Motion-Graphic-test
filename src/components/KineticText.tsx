import React from "react";
import { interpolate, spring } from "remotion";
import { FONT, FPS } from "../theme";
import { clamp } from "../lib/anim";

type Props = {
  text: string;
  frame: number;
  start?: number;
  /** frames between characters (spec: 40–80 ms ≈ 2.4–4.8 frames). */
  stagger?: number;
  fontSize?: number;
  weight?: number;
  color?: string;
  style?: React.CSSProperties;
  /** Clip each word so characters rise from behind an invisible mask line. */
  mask?: boolean;
  /** depth = rotateX + Z, rise = simple vertical. */
  mode?: "depth" | "rise" | "scale";
  /** frame at which characters begin to exit (blur up and out). */
  exitAt?: number;
  exitStagger?: number;
  letterSpacing?: string;
  gradient?: boolean;
};

/** Per-character kinetic typography with depth, blur and masked reveals. */
export const KineticText: React.FC<Props> = ({
  text,
  frame,
  start = 0,
  stagger = 3,
  fontSize = 72,
  weight = 600,
  color = "#fff",
  style,
  mask = true,
  mode = "depth",
  exitAt,
  exitStagger = 1.2,
  letterSpacing = "-0.035em",
  gradient = false,
}) => {
  const words = text.split(" ");
  let idx = 0;
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize,
        fontWeight: weight,
        color,
        letterSpacing,
        lineHeight: 1.08,
        perspective: 900,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {words.map((w, wi) => (
        <span
          key={wi}
          style={{
            display: "inline-block",
            overflow: mask ? "hidden" : "visible",
            padding: "0.08em 0.02em 0.16em",
            margin: "-0.08em 0 -0.16em",
            verticalAlign: "top",
          }}
        >
          {w.split("").map((ch) => {
            const i = idx++;
            const p = spring({
              frame: frame - start - i * stagger,
              fps: FPS,
              config: { damping: 20, stiffness: 110, mass: 0.8 },
            });
            const e =
              exitAt === undefined
                ? 0
                : interpolate(frame - exitAt - i * exitStagger, [0, 14], [0, 1], clamp);
            const inv = 1 - p;
            let transform = "";
            if (mode === "depth") {
              transform = `translateY(${inv * 0.9}em) translateZ(${-inv * 220}px) rotateX(${-inv * 75}deg)`;
            } else if (mode === "rise") {
              transform = `translateY(${inv * 1.05}em)`;
            } else {
              transform = `scale(${0.6 + 0.4 * p})`;
            }
            transform += ` translateY(${-e * 0.5}em)`;
            const blur = inv * 14 + e * 12;
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  transform,
                  transformOrigin: "50% 100%",
                  opacity: Math.min(1, p * 1.4) * (1 - e),
                  filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
                  ...(gradient
                    ? {
                        backgroundImage: "linear-gradient(180deg,#FFFFFF 30%,#A1A1AA 120%)",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                      }
                    : {}),
                }}
              >
                {ch}
              </span>
            );
          })}
          {wi < words.length - 1 && <span style={{ display: "inline-block", width: "0.26em" }} />}
        </span>
      ))}
    </div>
  );
};
