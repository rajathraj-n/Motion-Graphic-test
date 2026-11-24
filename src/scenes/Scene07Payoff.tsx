import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ease, lerp, prog } from "../lib/anim";
import { KineticText } from "../components/KineticText";
import { useCopy } from "../copy";

const CY = 560;

/** 00:33–00:37 — "Less friction. More possibilities." */
export const Scene07Payoff: React.FC = () => {
  const f = useCurrentFrame();
  const copy = useCopy();

  // pill (from S6) collapses into an illuminated line
  const toLine = prog(f, 0, 28, ease.inOut);
  const lineW = lerp(560, 1100, prog(f, 10, 60, ease.out)) * (1 - prog(f, 206, 236, ease.in));
  const h = lerp(64, 2, toLine);
  const pillOpacity = 1 - prog(f, 20, 34);

  // camera slowly pulls back
  const pull = lerp(1.06, 0.94, prog(f, 0, 240, ease.soft));

  // swap
  const swap = prog(f, 112, 150, ease.inOut);
  const lightIn = prog(f, 20, 200, ease.soft);
  const rays = f * 0.08;

  const exit = 1 - prog(f, 200, 236, ease.inOut);

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      {/* volumetric light */}
      <AbsoluteFill style={{ transform: `scale(${pull})` }}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 38% 26% at 50% ${(CY / 1080) * 100}%, rgba(255,255,255,${0.10 * lightIn}), rgba(16,163,127,${0.08 * lightIn}) 40%, transparent 75%)` }} />
        <AbsoluteFill
          style={{
            background: `conic-gradient(from ${rays}deg at 50% ${(CY / 1080) * 100}%, transparent 0deg, rgba(255,255,255,0.05) 8deg, transparent 18deg, transparent 40deg, rgba(255,255,255,0.04) 52deg, transparent 64deg, transparent 100deg, rgba(255,255,255,0.05) 112deg, transparent 126deg, transparent 180deg, rgba(255,255,255,0.04) 196deg, transparent 210deg, transparent 260deg, rgba(255,255,255,0.05) 276deg, transparent 290deg, transparent 360deg)`,
            WebkitMaskImage: "radial-gradient(ellipse 55% 45% at 50% 52%, #000 10%, transparent 80%)",
            opacity: lightIn,
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ transform: `scale(${pull})` }}>
        {/* the line */}
        <div style={{ position: "absolute", left: 960 - lineW / 2, top: CY - h / 2, width: lineW, height: h, borderRadius: h / 2, background: toLine < 1 ? `rgba(255,255,255,${lerp(0.1, 0.9, toLine)})` : "linear-gradient(90deg, transparent, #fff 20%, #fff 80%, transparent)", boxShadow: `0 0 24px rgba(255,255,255,0.6), 0 0 60px rgba(16,163,127,0.5)`, border: pillOpacity > 0 ? `1px solid rgba(255,255,255,${0.12 * pillOpacity})` : undefined }} />

        {/* "Less friction." — rises from behind the line (vertical mask) */}
        <div style={{ position: "absolute", left: 0, right: 0, top: CY - 150, height: 140, overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ transform: `scale(${1 + swap * 0.35})`, opacity: 1 - swap, filter: swap > 0 ? `blur(${swap * 16}px)` : undefined, paddingBottom: 18 }}>
            <KineticText text={copy.payoffLine1} frame={f} start={26} stagger={2.2} fontSize={96} weight={650} mode="rise" mask={false} gradient />
          </div>
        </div>

        {/* "More possibilities." — scales in through the same space */}
        <div style={{ position: "absolute", left: 0, right: 0, top: CY - 150, height: 140, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ transform: `scale(${lerp(0.7, 1, swap)})`, opacity: swap, filter: swap < 1 ? `blur(${(1 - swap) * 14}px)` : undefined, paddingBottom: 18, transformOrigin: "50% 80%" }}>
            <KineticText text={copy.payoffLine2} frame={f} start={112} stagger={1.6} fontSize={96} weight={650} mode="scale" mask={false} gradient />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
