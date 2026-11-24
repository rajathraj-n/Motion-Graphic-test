import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { blink, clamp, ease, lerp, prog, springIn, typed } from "../lib/anim";
import { Glass } from "../components/Glass";
import { KineticText } from "../components/KineticText";
import { PromptBar } from "../components/PromptBar";
import { CityArt } from "../components/CityArt";
import { IconImage, IconSpark } from "../components/Icons";

const PROMPT = "Create a futuristic city surrounded by nature.";
const PANEL = { x: 400, y: 180, w: 1120, h: 630 };
const FULL = { x: 0, y: 0, w: 1920, h: 1080 };
const CARD = { x: 580, y: 316, w: 760, h: 428 };
const COLS = 28;
const ROWS = 16;
const CELLS = new Array(COLS * ROWS).fill(0).map((_, i) => {
  const c = i % COLS;
  const r = Math.floor(i / COLS);
  // diagonal sweep + noise
  const t = (c / COLS) * 0.55 + (r / ROWS) * 0.25 + random(`cell${i}`) * 0.2;
  return { c, r, t };
});

const rectLerp = (a: typeof PANEL, b: typeof PANEL, t: number) => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
});

/** 00:21–00:27 — "Bring imagination to life." */
export const Scene05Imagine: React.FC = () => {
  const f = useCurrentFrame();

  // iris in from the S4 donut ring (r = 220)
  const iris = interpolate(f, [0, 34], [220, 1250], { ...clamp, easing: ease.in });
  const ringOp = 1 - prog(f, 10, 34);

  // macro camera on the composer
  const macro = prog(f, 0, 96, ease.inOut);
  const stageScale = lerp(1.4, 1, macro);
  const stageDrift = Math.sin(f / 30) * 4 * (1 - macro);

  const sent = f >= 82;
  const panelIn = springIn(f, 74, { damping: 20, stiffness: 90 });
  const grid = prog(f, 86, 124);
  const reveal = interpolate(f, [112, 196], [0, 1], clamp);
  const imgBlur = interpolate(f, [112, 200], [26, 0], { ...clamp, easing: ease.out });

  const expand = prog(f, 200, 248, ease.inOut);
  const pullBack = prog(f, 294, 336, ease.inOut);
  let rect = rectLerp(PANEL, FULL, expand);
  if (pullBack > 0) rect = rectLerp(FULL, CARD, pullBack);
  const radius = pullBack > 0 ? lerp(0, 26, pullBack) : lerp(24, 0, expand);
  const cam = { push: prog(f, 204, 306, ease.inOut), pan: interpolate(f, [150, 330], [-0.6, 0.8], clamp) };
  const uiOut = 1 - prog(f, 194, 220);
  const cardTilt = pullBack * -8;

  const sweep = interpolate(f, [322, 368], [-0.4, 1.4], { ...clamp, easing: ease.inOut });
  const exitFade = 1 - prog(f, 346, 384);

  return (
    <AbsoluteFill style={{ clipPath: `circle(${iris}px at 960px 540px)`, opacity: exitFade }}>
      <AbsoluteFill style={{ transform: `translateY(${lerp(-400, 0, macro) + stageDrift}px) scale(${stageScale})`, transformOrigin: "960px 950px" }}>
        {/* headline */}
        <div style={{ position: "absolute", top: 60, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: uiOut }}>
          <KineticText text="Bring imagination to life." frame={f} start={18} stagger={2.4} fontSize={60} weight={650} gradient />
        </div>

        {/* image-generation panel */}
        {f >= 74 && (
          <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, perspective: 1600 }}>
            <div
              style={{
                position: "absolute",
                left: rect.x,
                top: rect.y,
                width: rect.w,
                height: rect.h,
                borderRadius: radius,
                overflow: "hidden",
                opacity: panelIn,
                transform: `translateY(${(1 - panelIn) * 40}px) rotateY(${cardTilt}deg)`,
                boxShadow: "0 50px 100px -20px rgba(0,0,0,0.8)",
                border: expand > 0.98 && pullBack === 0 ? "none" : "1px solid rgba(255,255,255,0.12)",
                background: "rgba(23,23,23,0.6)",
              }}
            >
              {/* artwork (rendered at full-frame size, cropped by the container) */}
              <div style={{ position: "absolute", left: (rect.w - 1920) / 2, top: (rect.h - 1080) / 2, width: 1920, height: 1080, transform: `scale(${Math.max(rect.w / 1920, rect.h / 1080)})`, filter: imgBlur > 0.1 ? `blur(${imgBlur}px) saturate(${lerp(1, 0.4, imgBlur / 26)})` : undefined }}>
                <CityArt cam={cam} frame={f} />
              </div>

              {/* pixel-to-image mosaic */}
              {reveal < 1 && (
                <svg viewBox={`0 0 ${COLS} ${ROWS}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  {CELLS.map((cell, i) => {
                    const local = interpolate(reveal, [cell.t * 0.8, cell.t * 0.8 + 0.2], [1, 0], clamp);
                    if (local <= 0) return null;
                    return <rect key={i} x={cell.c} y={cell.r} width={1.02} height={1.02} fill="#141416" opacity={local} />;
                  })}
                  {/* particle grid */}
                  {CELLS.map((cell, i) => {
                    const wave = 0.5 + 0.5 * Math.sin(f / 6 - cell.c * 0.5 - cell.r * 0.3);
                    const local = interpolate(reveal, [cell.t * 0.8, cell.t * 0.8 + 0.2], [1, 0], clamp);
                    return <circle key={`d${i}`} cx={cell.c + 0.5} cy={cell.r + 0.5} r={0.06 + 0.06 * wave} fill={wave > 0.85 ? C.green : "#fff"} opacity={grid * local * (0.25 + 0.6 * wave)} />;
                  })}
                </svg>
              )}

              {/* panel chrome */}
              <div style={{ position: "absolute", left: 22, top: 18, display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 12, background: "rgba(10,10,10,0.55)", backdropFilter: "blur(16px)", fontFamily: FONT, fontSize: 15, color: C.white, opacity: uiOut }}>
                {reveal < 1 ? <IconSpark size={16} /> : <IconImage size={16} />}
                {reveal < 1 ? `Creating image… ${Math.round(reveal * 100)}%` : "Futuristic city · 16:9"}
              </div>
            </div>
          </div>
        )}

        {/* caption over the full-bleed artwork */}
        <div style={{ position: "absolute", left: 120, bottom: 110, fontFamily: FONT, opacity: prog(f, 232, 256) * (1 - prog(f, 290, 306)), transform: `translateY(${(1 - prog(f, 232, 262)) * 20}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, color: "rgba(255,255,255,0.85)" }}>
            <IconSpark size={18} color="#fff" /> Created with ChatGPT
          </div>
          <div style={{ marginTop: 10, fontSize: 40, fontWeight: 600, color: C.white, letterSpacing: "-0.02em", textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}>“{PROMPT}”</div>
        </div>

        {/* composer */}
        <div style={{ opacity: uiOut }}>
          <PromptBar x={960} y={950} width={820} text={sent ? "" : typed(PROMPT, f, 8, 76)} caretOn={sent ? blink(f, 60) === 1 : true} sendActive={prog(f, 10, 16) * (1 - prog(f, 82, 88))} press={interpolate(f, [76, 88], [0, 1], clamp)} />
        </div>
      </AbsoluteFill>

      {/* match-cut ring */}
      {ringOp > 0 && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <circle cx={960} cy={540} r={iris} fill="none" stroke={C.green} strokeWidth={6} opacity={ringOp} />
        </svg>
      )}

      {/* cinematic light sweep */}
      {sweep > -0.4 && sweep < 1.4 && (
        <AbsoluteFill
          style={{
            background: `linear-gradient(105deg, transparent ${sweep * 100 - 22}%, rgba(255,255,255,0.10) ${sweep * 100 - 8}%, rgba(255,255,255,0.55) ${sweep * 100}%, rgba(255,255,255,0.10) ${sweep * 100 + 8}%, transparent ${sweep * 100 + 22}%)`,
            mixBlendMode: "screen",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
