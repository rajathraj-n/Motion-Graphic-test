import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { blink, clamp, ease, lerp, prog, springIn, typed } from "../lib/anim";
import { Glass } from "../components/Glass";
import { KineticText } from "../components/KineticText";
import { PromptBar } from "../components/PromptBar";
import { IconChart, IconCode, IconImage, IconPen, IconSpark } from "../components/Icons";
import { BrandMark } from "../components/BrandMark";

const PANEL = { x: 308, y: 250, w: 1240, h: 680 };
const RAIL = 64;
const PROMPT = "Help me turn an idea into something great.";
const RESPONSE =
  "Absolutely — let's shape it together. Share the spark, and I'll help you define the audience, sharpen the story, and map the first steps to bring it to life.";

/** 00:04–00:09 — "Meet ChatGPT. Your ideas. Reimagined." */
export const Scene02Meet: React.FC = () => {
  const f = useCurrentFrame();

  const enter = springIn(f, 0, { damping: 22, stiffness: 70 });
  const rot = (1 - enter) * 20;
  const fadeIn = prog(f, 0, 24);

  // exit: camera dives into the prompt bar
  const dive = prog(f, 262, 318, ease.inOut);
  const camera = `translateY(${(540 - 860) * dive}px) scale(${1 + 0.5 * dive})`;

  const typedText = typed(PROMPT, f, 70, 150);
  const sent = f >= 165;
  const press = interpolate(f, [156, 170], [0, 1], clamp);
  const sendActive = prog(f, 72, 80) * (1 - prog(f, 166, 172));
  const pulse = prog(f, 160, 205, ease.out);

  // response morph: dot -> rounded panel
  const thinking = prog(f, 178, 188);
  const morph = prog(f, 192, 236, ease.inOut);
  const respW = lerp(28, 820, morph);
  const respH = lerp(28, 150, morph);
  const respR = lerp(14, 20, morph);
  const streamChars = Math.round(interpolate(f, [208, 272], [0, RESPONSE.length], clamp));

  const bubble = springIn(f, 165, { damping: 16, stiffness: 140 });
  const greetOut = prog(f, 160, 178);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * (1 - prog(f, 298, 322)) }}>
      <AbsoluteFill style={{ transform: camera, transformOrigin: "960px 860px" }}>
        {/* headline */}
        <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: 1 - prog(f, 250, 280) }}>
          <KineticText text="Meet ChatGPT." frame={f} start={18} stagger={3} fontSize={72} weight={650} gradient />
          <KineticText text="Your ideas. Reimagined." frame={f} start={46} stagger={2} fontSize={28} weight={400} color={C.silver} mode="rise" letterSpacing="-0.01em" />
        </div>

        {/* 3D panel */}
        <div style={{ position: "absolute", inset: 0, perspective: 1800, perspectiveOrigin: "960px 700px" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "960px 860px",
              transform: `rotateX(${rot}deg) rotateY(${-rot * 0.35}deg) translateY(${(1 - enter) * 50}px)`,
              opacity: Math.min(1, enter * 1.5),
            }}
          >
            <Glass sweep={interpolate(f, [20, 120], [0.05, 1.05], clamp)} radius={24} fill={0.07} style={{ left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h }}>
              {/* rail */}
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: RAIL, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 22, gap: 26 }}>
                {[<BrandMark key="b" size={26} />, <IconPen key="p" size={20} color={C.silver} />, <IconChart key="c" size={20} color={C.silver} />, <IconImage key="i" size={20} color={C.silver} />, <IconCode key="d" size={20} color={C.silver} />].map((ic, i) => {
                  const s = springIn(f, 14 + i * 4);
                  return (
                    <div key={i} style={{ opacity: s, transform: `translateX(${(1 - s) * -16}px)` }}>
                      {ic}
                    </div>
                  );
                })}
              </div>
              {/* top bar */}
              {(() => {
                const s = springIn(f, 22);
                return (
                  <div style={{ position: "absolute", left: RAIL + 28, top: 22, right: 28, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: FONT, opacity: s, transform: `translateY(${(1 - s) * -12}px)` }}>
                    <div style={{ fontSize: 19, fontWeight: 600, color: C.white, letterSpacing: "-0.01em" }}>
                      ChatGPT <span style={{ color: C.silver, fontWeight: 400 }}>⌄</span>
                    </div>
                    <div style={{ width: 32, height: 32, borderRadius: 16, background: "linear-gradient(135deg,#3F3F46,#18181B)", border: "1px solid rgba(255,255,255,0.12)" }} />
                  </div>
                );
              })()}

              {/* greeting */}
              {(() => {
                const s = springIn(f, 30);
                return (
                  <div style={{ position: "absolute", left: RAIL, right: 0, top: 250, textAlign: "center", fontFamily: FONT, fontSize: 34, fontWeight: 500, color: C.white, letterSpacing: "-0.02em", opacity: s * (1 - greetOut), transform: `translateY(${(1 - s) * 18 - greetOut * 20}px)`, filter: `blur(${greetOut * 8}px)` }}>
                    What&apos;s on your mind today?
                  </div>
                );
              })()}

              {/* user bubble */}
              {sent && (
                <div style={{ position: "absolute", right: 60, top: 96, padding: "14px 22px", borderRadius: 22, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: FONT, fontSize: 19, color: C.white, opacity: bubble, transform: `translateY(${(1 - bubble) * 120}px) scale(${0.9 + 0.1 * bubble})`, transformOrigin: "100% 100%" }}>
                  {PROMPT}
                </div>
              )}

              {/* response morph */}
              {f >= 178 && (
                <div style={{ position: "absolute", left: RAIL + 160, top: 178, display: "flex", alignItems: "flex-start", gap: 18 }}>
                  <div style={{ marginTop: 6, opacity: thinking }}>
                    <IconSpark size={26} />
                  </div>
                  <div
                    style={{
                      width: respW,
                      height: respH,
                      borderRadius: respR,
                      background: `rgba(255,255,255,${lerp(0.9, 0.04, morph)})`,
                      border: `1px solid rgba(255,255,255,${0.1 * morph})`,
                      transform: `scale(${morph < 0.01 ? 0.85 + 0.15 * Math.sin(f / 3) : 1})`,
                      overflow: "hidden",
                      padding: morph > 0.6 ? "20px 26px" : 0,
                      boxSizing: "border-box",
                      fontFamily: FONT,
                      fontSize: 20,
                      lineHeight: 1.55,
                      color: "#E4E4E7",
                      opacity: thinking,
                    }}
                  >
                    {morph > 0.6 && (
                      <>
                        {RESPONSE.slice(0, streamChars)}
                        {streamChars < RESPONSE.length && <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 5, background: "#fff", marginLeft: 4 }} />}
                      </>
                    )}
                  </div>
                </div>
              )}
            </Glass>
          </div>
        </div>

        {/* radial light pulse from submit */}
        {pulse > 0 && pulse < 1 && (
          <div
            style={{
              position: "absolute",
              left: 1310 - 400 * pulse,
              top: 860 - 400 * pulse,
              width: 800 * pulse,
              height: 800 * pulse,
              borderRadius: "50%",
              border: `2px solid rgba(255,255,255,${0.6 * (1 - pulse)})`,
              background: `radial-gradient(circle, rgba(16,163,127,${0.25 * (1 - pulse)}) 0%, transparent 65%)`,
            }}
          />
        )}

        <PromptBar
          x={960}
          y={860}
          width={760}
          text={sent ? "" : typedText}
          caretOn={f < 70 ? blink(f, 60) === 1 : true}
          sendActive={sendActive}
          press={press}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
