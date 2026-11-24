import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { ease, lerp, prog, springIn } from "../lib/anim";
import { BrandMark } from "../components/BrandMark";
import { KineticText } from "../components/KineticText";
import { useCopy } from "../copy";

/** 00:37–00:40 — Logo, "Start with a conversation.", chatgpt.com */
export const Scene08Brand: React.FC = () => {
  const f = useCurrentFrame();
  const copy = useCopy();
  const mask = prog(f, 0, 36, ease.out);
  const draw = prog(f, 0, 46, ease.inOut);
  const glow = prog(f, 4, 50) * (1 - prog(f, 150, 180) * 0.5);
  const flash = Math.exp(-f / 10);
  const logoS = springIn(f, 0, { damping: 14, stiffness: 120 });
  const tag = prog(f, 50, 82, ease.out);
  const url = prog(f, 82, 112, ease.soft);
  const fadeOut = 1 - prog(f, 150, 180, ease.inOut);
  const drift = lerp(1, 1.025, prog(f, 0, 180, ease.soft));

  return (
    <AbsoluteFill style={{ opacity: fadeOut, transform: `scale(${drift})` }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 44%, rgba(255,255,255,${0.12 * glow + 0.2 * flash}) 0%, rgba(16,163,127,${0.12 * glow}) 14%, transparent 40%)` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ clipPath: `circle(${mask * 75}% at 50% 50%)`, transform: `scale(${0.85 + 0.15 * logoS})`, filter: `drop-shadow(0 0 ${30 * glow}px rgba(255,255,255,0.35))` }}>
          <BrandMark size={150} draw={draw} />
        </div>
        <div style={{ marginTop: 30 }}>
          <KineticText text={copy.brandName} frame={f} start={16} stagger={2.4} fontSize={84} weight={650} mode="rise" gradient />
        </div>
        <div style={{ marginTop: 26, fontFamily: FONT, fontSize: 34, fontWeight: 400, color: "#E4E4E7", letterSpacing: "-0.015em", opacity: tag, transform: `translateY(${(1 - tag) * 22}px)`, filter: `blur(${(1 - tag) * 6}px)` }}>
          {copy.brandTagline}
        </div>
        <div style={{ marginTop: 34, fontFamily: FONT, fontSize: 22, fontWeight: 500, color: C.silver, letterSpacing: "0.04em", opacity: url }}>
          {copy.brandUrl}
        </div>
      </div>
    </AbsoluteFill>
  );
};
