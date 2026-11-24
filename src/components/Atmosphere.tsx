import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { C, STAGE_H, STAGE_W } from "../theme";

/** Persistent deep-black environment: graphite falloff, soft key light, drifting dust. */
export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const drift = Math.sin(f / 240) * 40;
  return (
    <AbsoluteFill style={{ background: C.black, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 60% at ${50 + drift / 40}% 42%, rgba(38,38,42,0.85) 0%, rgba(23,23,23,0.6) 35%, rgba(10,10,10,0) 75%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 45% 35% at 50% 110%, rgba(16,163,127,0.10) 0%, rgba(16,163,127,0) 70%)",
        }}
      />
      <Dust />
      {/* vignette */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 55%, rgba(0,0,0,0.75) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const DUST = new Array(70).fill(0).map((_, i) => ({
  x: random(`dx${i}`) * STAGE_W,
  y: random(`dy${i}`) * STAGE_H,
  r: 0.6 + random(`dr${i}`) * 1.6,
  s: 0.05 + random(`ds${i}`) * 0.25,
  o: 0.08 + random(`do${i}`) * 0.25,
  ph: random(`dp${i}`) * Math.PI * 2,
}));

const Dust: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <svg width={STAGE_W} height={STAGE_H} style={{ position: "absolute", inset: 0 }}>
      {DUST.map((d, i) => {
        const y = (((d.y - f * d.s) % STAGE_H) + STAGE_H) % STAGE_H;
        const x = d.x + Math.sin(f / 90 + d.ph) * 12;
        return <circle key={i} cx={x} cy={y} r={d.r} fill="#fff" opacity={d.o * (0.6 + 0.4 * Math.sin(f / 50 + d.ph))} />;
      })}
    </svg>
  );
};

/** Subtle animated film grain (~1.5%). */
export const FilmGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  const f = useCurrentFrame();
  const seed = f % 12;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity }}>
      <svg width="100%" height="100%">
        <filter id={`grain${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
