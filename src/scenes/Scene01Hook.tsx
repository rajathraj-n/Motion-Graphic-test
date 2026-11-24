import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { blink, ease, lerp, prog, tween } from "../lib/anim";
import { KineticText } from "../components/KineticText";
import { PromptBar } from "../components/PromptBar";
import { useCopy } from "../copy";

const CX = 960;
const CY = 540;
const N = 320;
const PARTICLES = new Array(N).fill(0).map((_, i) => {
  const a = random(`a${i}`) * Math.PI * 2;
  const d = 700 + random(`d${i}`) * 900;
  const ringA = (i / N) * Math.PI * 2 + random(`ra${i}`) * 0.05;
  return {
    sx: CX + Math.cos(a) * d,
    sy: CY + Math.sin(a) * d * 0.7,
    ringA,
    ringR: 300 + (random(`rr${i}`) - 0.5) * 40,
    delay: random(`dl${i}`) * 40,
    size: 0.8 + random(`sz${i}`) * 2.2,
    o: 0.35 + random(`o${i}`) * 0.65,
    green: random(`g${i}`) < 0.18,
  };
});

/** 00:00–00:04 — "Everything starts with an idea." */
export const Scene01Hook: React.FC = () => {
  const f = useCurrentFrame();
  const copy = useCopy();

  // camera push through typography
  const push = prog(f, 165, 215, ease.in);
  const textScale = lerp(1, 1.06, prog(f, 80, 165, ease.soft)) * lerp(1, 5.5, push);
  const textOpacity = 1 - prog(f, 185, 212, ease.soft);
  const textBlur = push * 18;

  // energy field
  const ringForm = prog(f, 30, 130, ease.inOut);
  const ringExpand = prog(f, 170, 230, ease.in);
  const ringRot = f * 0.004;
  const fieldGlow = prog(f, 90, 140) * (1 - prog(f, 180, 230));

  // cursor
  const cursorVisible = f < 70 ? 1 : f > 188 ? 1 : 0;
  const cursorIntro = prog(f, 4, 20);
  const morph = prog(f, 200, 238, ease.inOut);
  const glide = prog(f, 210, 240, ease.inOut);

  return (
    <AbsoluteFill>
      {/* energy field glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(16,163,127,${0.16 * fieldGlow}) 0%, rgba(255,255,255,${0.05 * fieldGlow}) 18%, transparent ${35 + ringExpand * 30}%)`,
        }}
      />
      {/* particles */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="pglow">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {PARTICLES.map((p, i) => {
          const t = prog(f, 10 + p.delay, 110 + p.delay, ease.inOut);
          const a = p.ringA + ringRot * (1 + (i % 3) * 0.3);
          const r = p.ringR * (1 + ringExpand * 2.4);
          const tx = CX + Math.cos(a) * r;
          const ty = CY + Math.sin(a) * r;
          // spiral path toward the ring
          const swirl = (1 - t) * 1.2;
          const mx = lerp(p.sx, tx, t) + Math.cos(a + swirl) * 60 * (1 - t);
          const my = lerp(p.sy, ty, t) + Math.sin(a + swirl) * 60 * (1 - t);
          const op = p.o * Math.min(1, f / 20) * (0.5 + 0.5 * ringForm) * (1 - ringExpand);
          return (
            <circle
              key={i}
              cx={mx}
              cy={my}
              r={p.size * (1 + fieldGlow * 0.4)}
              fill={p.green ? C.green : "#fff"}
              opacity={op}
            />
          );
        })}
        {/* thin luminous ring that resolves from the particles */}
        <circle
          cx={CX}
          cy={CY}
          r={300 * (1 + ringExpand * 2.4)}
          fill="none"
          stroke="url(#ringStroke)"
          strokeWidth={1.2}
          opacity={fieldGlow * 0.6}
        />
        <defs>
          <linearGradient id="ringStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="50%" stopColor={C.green} stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      {/* headline */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${textScale})`,
          opacity: textOpacity,
          filter: textBlur > 0.1 ? `blur(${textBlur}px)` : undefined,
        }}
      >
        <KineticText text={copy.hookHeadline} frame={f} start={72} stagger={2.6} fontSize={88} weight={600} gradient />
      </AbsoluteFill>

      {/* cursor -> prompt field */}
      {cursorVisible > 0 && morph < 0.02 && (
        <div
          style={{
            position: "absolute",
            left: CX - 2,
            top: CY - 26,
            width: 4,
            height: 52,
            borderRadius: 2,
            background: "#fff",
            boxShadow: "0 0 18px rgba(255,255,255,0.6)",
            opacity: blink(f, 60) * cursorIntro * (f < 70 ? 1 - prog(f, 58, 70) : 1),
          }}
        />
      )}
      {morph >= 0.02 && (
        <PromptBar
          x={CX}
          y={lerp(CY, 860, glide)}
          width={lerp(8, 760, morph)}
          height={lerp(52, 64, morph)}
          text=""
          placeholder={morph > 0.75 ? "Ask anything" : ""}
          chrome={prog(f, 222, 240)}
          caretOn={blink(f, 60) === 1}
          sweep={morph}
          style={{ opacity: Math.min(1, morph * 4) }}
        />
      )}
    </AbsoluteFill>
  );
};
