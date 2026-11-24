import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { blink, clamp, ease, lerp, prog, springIn, typed } from "../lib/anim";
import { Glass } from "../components/Glass";
import { KineticText } from "../components/KineticText";
import { PromptBar } from "../components/PromptBar";
import { useCopy } from "../copy";
import { IconBulb, IconImage, IconPen, IconSpark } from "../components/Icons";


const SECTIONS = [
  {
    title: "Campaign Strategy",
    icon: <IconBulb size={22} />,
    line: "Theme “Made for Tomorrow” — a 3-phase, 6-week launch built around early adopters.",
  },
  {
    title: "Social Content",
    icon: <IconPen size={22} />,
    line: "12 platform-native posts, a creator series and a teaser countdown across 4 channels.",
  },
  {
    title: "Creative Concepts",
    icon: <IconImage size={22} />,
    line: "Light as a material: monochrome product films with a single emerald accent.",
  },
];

const PANEL = { x: 470, y: 270, w: 980, h: 540 };
const sectionRect = (i: number) => ({ x: PANEL.x + 40, y: PANEL.y + 84 + i * 146, w: PANEL.w - 80, h: 128 });
const CARD = { w: 460, h: 540 };
const ORBIT_R = 1050;
const BASE = [-32, 0, 32];

/** 00:09–00:15 — "Create without limits." */
export const Scene03Create: React.FC = () => {
  const f = useCurrentFrame();
  const copy = useCopy();
  const PROMPT = copy.createPrompt;
  const fadeIn = prog(f, 0, 20);

  // --- prompt macro shot -> pull back
  const pull = prog(f, 70, 112, ease.inOut);
  const barScale = lerp(1.5, 1, pull);
  const barY = lerp(540, 960, pull);
  const typedText = typed(PROMPT, f, 16, 64);
  const sent = f >= 72;
  const barOut = prog(f, 296, 326);

  // --- response panel + streaming
  const panelIn = springIn(f, 82, { damping: 20, stiffness: 90 });
  const stream = (i: number) => interpolate(f, [96 + i * 24, 120 + i * 24], [0, 1], clamp);
  const split = prog(f, 172, 214, ease.inOut);
  const panelBg = 1 - prog(f, 168, 196);

  // --- orbit
  const phi = interpolate(f, [176, 330], [18, -14], { ...clamp, easing: ease.inOut });
  const expand = prog(f, 318, 372, ease.in);
  const expandFade = 1 - prog(f, 352, 384);

  const bubbleIn = springIn(f, 74, { damping: 16, stiffness: 140 });
  const bubbleOut = prog(f, 176, 192);

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      {/* user bubble */}
      {sent && (
        <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: bubbleIn * (1 - bubbleOut), transform: `translateY(${(1 - bubbleIn) * 300 - bubbleOut * 30}px)`, filter: `blur(${bubbleOut * 10}px)` }}>
          <div style={{ padding: "14px 24px", borderRadius: 22, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: FONT, fontSize: 20, color: C.white }}>{PROMPT}</div>
        </div>
      )}

      {/* headline */}
      <div style={{ position: "absolute", top: 64, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: 1 - prog(f, 300, 330) }}>
        <KineticText text={copy.createHeadline} frame={f} start={186} stagger={2.6} fontSize={64} weight={650} gradient />
      </div>

      {/* response panel (background dissolves as sections become cards) */}
      {f >= 82 && (
        <Glass
          sweep={interpolate(f, [86, 170], [0, 1], clamp)}
          fill={0.07}
          radius={24}
          style={{ left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h, opacity: panelIn * panelBg, transform: `translateY(${(1 - panelIn) * 40}px) scale(${0.96 + 0.04 * panelIn})` }}
        >
          <div style={{ position: "absolute", left: 40, top: 30, display: "flex", alignItems: "center", gap: 12, fontFamily: FONT, fontSize: 18, color: C.silver }}>
            <IconSpark size={22} /> Here&apos;s a launch campaign in three parts:
          </div>
        </Glass>
      )}

      {/* section blocks -> 3D orbital cards */}
      <div style={{ position: "absolute", inset: 0, perspective: 1700, perspectiveOrigin: "960px 560px" }}>
        {SECTIONS.map((s, i) => {
          if (f < 92) return null;
          const r = sectionRect(i);
          const a = BASE[i] + phi;
          const rad = (a * Math.PI) / 180;
          const ox = ORBIT_R * Math.sin(rad);
          const oz = ORBIT_R * (Math.cos(rad) - 1);
          const pop = springIn(f, 176 + i * 7, { damping: 14, stiffness: 120 });
          const t = Math.min(split, 1) * 0.5 + pop * 0.5 * (split > 0 ? 1 : 0);

          const w = lerp(r.w, CARD.w, t);
          const h = lerp(r.h, CARD.h, t);
          const cx = lerp(r.x + r.w / 2, 960, t);
          const cy = lerp(r.y + r.h / 2, 560, t);
          const isCenter = i === 1;

          // exit: centre card expands beyond the frame, side cards fly wide
          const ex = isCenter ? expand : 0;
          const side = isCenter ? 0 : expand;
          const blur = (isCenter ? 0 : 5 * t) + side * 10;
          const sc = 1 + ex * 5.5;

          const textIn = stream(i);
          return (
            <div key={i}>
              {/* floor shadow */}
              <div style={{ position: "absolute", left: cx - w / 2 + ox * t, top: 850, width: w, height: 60, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.7), transparent 70%)", filter: "blur(14px)", opacity: t * (1 - expand), transform: `translateZ(${oz * t}px)` }} />
              <div
                style={{
                  position: "absolute",
                  left: cx - w / 2,
                  top: cy - h / 2,
                  width: w,
                  height: h,
                  transform: `translate3d(${ox * t + (i - 1) * side * 900}px, 0, ${oz * t}px) rotateY(${a * t * (1 - ex)}deg) scale(${sc})`,
                  filter: blur > 0.1 ? `blur(${blur}px)` : undefined,
                  opacity: (isCenter ? expandFade : 1 - side) * Math.min(1, textIn * 2 + t),
                  zIndex: isCenter ? 3 : 1,
                }}
              >
                <Glass
                  radius={lerp(16, 24, t)}
                  fill={lerp(0.04, 0.1, t) + ex * 0.04}
                  sweep={t > 0.5 ? (f / 120 + i * 0.33) % 1 : undefined}
                  shadow={t > 0.2}
                  style={{ inset: 0, background: ex > 0 ? `rgba(20,20,22,${0.4 + 0.6 * ex})` : undefined }}
                >
                  <div style={{ position: "absolute", inset: 0, padding: lerp(20, 34, t), fontFamily: FONT, opacity: 1 - prog(f, 318, 336) }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: textIn }}>
                      <div style={{ width: 40 + 8 * t, height: 40 + 8 * t, borderRadius: 12, background: isCenter ? C.green : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
                      <div style={{ fontSize: lerp(22, 26, t), fontWeight: 600, color: C.white, letterSpacing: "-0.02em" }}>{s.title}</div>
                    </div>
                    <div style={{ marginTop: lerp(10, 22, t), fontSize: lerp(17, 19, t), lineHeight: 1.5, color: "#D4D4D8", maxWidth: lerp(820, 360, t) }}>
                      {s.line.slice(0, Math.round(s.line.length * textIn))}
                    </div>
                    <CardBody i={i} t={prog(f, 200 + i * 6, 240 + i * 6)} f={f} />
                  </div>
                </Glass>
              </div>
            </div>
          );
        })}
      </div>

      {/* composer */}
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${barY - 540}px) scale(${barScale})`, transformOrigin: "960px 540px", opacity: 1 - barOut }}>
        <PromptBar x={960} y={540} width={760} text={sent ? "" : typedText} caretOn={sent ? blink(f, 60) === 1 : true} sendActive={prog(f, 18, 24) * (1 - prog(f, 72, 78))} press={interpolate(f, [64, 76], [0, 1], clamp)} />
      </div>
    </AbsoluteFill>
  );
};

/** Extra detail that grows inside each card once it has become a card. */
const CardBody: React.FC<{ i: number; t: number; f: number }> = ({ i, t, f }) => {
  if (t <= 0) return null;
  const wrap: React.CSSProperties = { marginTop: 26, opacity: t, transform: `translateY(${(1 - t) * 16}px)` };
  if (i === 0) {
    return (
      <div style={wrap}>
        {["Tease", "Reveal", "Amplify"].map((p, k) => (
          <div key={p} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, color: C.silver, marginBottom: 7 }}>
              <span>Phase {k + 1} · {p}</span>
              <span>Wk {k * 2 + 1}–{k * 2 + 2}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)" }}>
              <div style={{ height: 6, borderRadius: 3, width: `${t * (45 + k * 22)}%`, background: k === 0 ? C.green : "rgba(255,255,255,0.5)" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (i === 1) {
    return (
      <div style={wrap}>
        <div style={{ padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 16, color: "#E4E4E7", lineHeight: 1.5 }}>
          “The future doesn&apos;t wait. Neither should you.” <span style={{ color: C.green }}>#MadeForTomorrow</span>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {[0, 1, 2].map((k) => (
            <div key={k} style={{ flex: 1, height: 70, borderRadius: 10, background: `linear-gradient(${135 + k * 40 + f * 0.3}deg, #27272A, ${k === 1 ? "#0E5E4A" : "#3F3F46"})` }} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={wrap}>
      <div style={{ height: 120, borderRadius: 14, background: `radial-gradient(circle at ${30 + Math.sin(f / 40) * 10}% 30%, rgba(255,255,255,0.35), transparent 40%), linear-gradient(135deg,#18181B,#0A0A0A 60%,#0E5E4A)` }} />
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        {["#FFFFFF", "#A1A1AA", "#171717", "#10A37F"].map((c) => (
          <div key={c} style={{ width: 34, height: 34, borderRadius: 17, background: c, border: "1px solid rgba(255,255,255,0.2)" }} />
        ))}
      </div>
    </div>
  );
};
