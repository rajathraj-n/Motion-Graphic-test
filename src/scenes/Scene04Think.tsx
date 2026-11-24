import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { clamp, ease, lerp, prog, springIn, typed } from "../lib/anim";
import { Glass } from "../components/Glass";
import { KineticText } from "../components/KineticText";
import { PromptBar } from "../components/PromptBar";
import { IconCheck, IconSheet, IconSpark } from "../components/Icons";

const PROMPT = "Analyze this sales data and highlight key insights.";
const DATA = [
  { m: "Apr", rev: 310, units: "4,120", region: "NA" },
  { m: "May", rev: 345, units: "4,480", region: "EU" },
  { m: "Jun", rev: 362, units: "4,705", region: "NA" },
  { m: "Jul", rev: 398, units: "5,010", region: "APAC" },
  { m: "Aug", rev: 451, units: "5,690", region: "APAC" },
  { m: "Sep", rev: 534, units: "6,840", region: "APAC" },
];
const MAX = 560;
const LP = { x: 170, y: 196, w: 1000, h: 640 }; // left panel
const BASE_Y = LP.y + LP.h - 70;
const CHART_H = 380;
const barX = (k: number) => LP.x + 90 + k * 145;
const BAR_W = 88;
const barH = (k: number) => (DATA[k].rev / MAX) * CHART_H;
const rowRect = (k: number) => ({ x: LP.x + 36, y: LP.y + 120 + k * 72, w: LP.w - 72, h: 58 });

const DONUT = { cx: 1352, cy: 368, r: 92 };
const REGIONS = [
  { n: "APAC", v: 0.38, c: C.green },
  { n: "North America", v: 0.34, c: "#E4E4E7" },
  { n: "Europe", v: 0.28, c: "#52525B" },
];

/** 00:15–00:21 — "Turn complexity into clarity." */
export const Scene04Think: React.FC = () => {
  const f = useCurrentFrame();
  const fadeIn = prog(f, 0, 22);

  // file fly-in on an arc into the composer
  const fly = prog(f, 6, 56, ease.inOut);
  const fx = lerp(-120, 610, fly);
  const fy = lerp(560, 960, fly) - Math.sin(fly * Math.PI) * 220;
  const landed = f >= 56;
  const upload = prog(f, 56, 96, ease.inOut);
  const sent = f >= 128;

  const tableIn = springIn(f, 128, { damping: 20, stiffness: 100 });
  const morph = prog(f, 168, 214, ease.inOut);
  const trim = prog(f, 206, 262, ease.inOut);
  const right = (k: number) => springIn(f, 196 + k * 10, { damping: 18, stiffness: 110 });

  // rack focus
  const focusShift = prog(f, 246, 286, ease.inOut);
  const leftBlur = lerp(0, 6, focusShift);
  const rightBlur = lerp(5, 0, focusShift) * prog(f, 190, 200);

  // match cut: donut travels to centre and grows
  const mc = prog(f, 300, 356, ease.inOut);
  const dcx = lerp(DONUT.cx, 960, mc);
  const dcy = lerp(DONUT.cy, 540, mc);
  const dr = lerp(DONUT.r, 220, mc);
  const others = 1 - prog(f, 298, 330);
  const donutDraw = prog(f, 206, 256, ease.inOut);
  const donutFade = 1 - prog(f, 360, 380);

  const total = interpolate(f, [220, 280], [0, 2.4], { ...clamp, easing: ease.out });
  const growth = interpolate(f, [230, 290], [0, 36], { ...clamp, easing: ease.out });

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <div style={{ position: "absolute", top: 64, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: others }}>
        <KineticText text="Turn complexity into clarity." frame={f} start={12} stagger={2.4} fontSize={60} weight={650} gradient />
      </div>

      {/* LEFT: table that morphs into a chart */}
      <div style={{ opacity: others, filter: leftBlur > 0.1 ? `blur(${leftBlur}px)` : undefined }}>
        {f >= 128 && (
          <Glass fill={0.07} radius={24} sweep={interpolate(f, [130, 230], [0, 1], clamp)} style={{ left: LP.x, top: LP.y, width: LP.w, height: LP.h, opacity: tableIn, transform: `translateY(${(1 - tableIn) * 40}px)` }}>
            <div style={{ position: "absolute", left: 36, top: 30, right: 36, display: "flex", justifyContent: "space-between", fontFamily: FONT }}>
              <div style={{ position: "relative", height: 30 }}>
                <div style={{ position: "absolute", whiteSpace: "nowrap", fontSize: 20, fontWeight: 600, color: C.white, opacity: 1 - morph }}>Sales_2026.xlsx</div>
                <div style={{ position: "absolute", whiteSpace: "nowrap", fontSize: 20, fontWeight: 600, color: C.white, opacity: morph }}>Monthly revenue <span style={{ color: C.silver, fontWeight: 400 }}>· $K</span></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, color: C.silver }}>
                <IconSpark size={18} /> {morph > 0.5 ? "Insights ready" : "Reading 6 rows…"}
              </div>
            </div>
            {/* column headers */}
            <div style={{ position: "absolute", left: 56, top: 84, right: 56, display: "flex", fontFamily: FONT, fontSize: 14, color: C.dim, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 1 - morph }}>
              {["Month", "Revenue", "Units", "Region"].map((h) => (
                <div key={h} style={{ flex: 1 }}>{h}</div>
              ))}
            </div>
            {/* gridlines for the chart */}
            {[0, 1, 2, 3].map((g) => (
              <div key={g} style={{ position: "absolute", left: 60, right: 40, top: BASE_Y - LP.y - (g * CHART_H) / 3, height: 1, background: "rgba(255,255,255,0.06)", opacity: morph }} />
            ))}
          </Glass>
        )}

        {/* rows -> bars */}
        {f >= 132 &&
          DATA.map((d, k) => {
            const r = rowRect(k);
            const rowIn = prog(f, 134 + k * 4, 150 + k * 4);
            const m = prog(f, 168 + k * 3, 208 + k * 3, ease.inOut);
            const h = barH(k);
            const x = lerp(r.x, barX(k), m);
            const y = lerp(r.y, BASE_Y - h, m);
            const w = lerp(r.w, BAR_W, m);
            const hh = lerp(r.h, h, m);
            const isPeak = k === DATA.length - 1;
            const val = Math.round(interpolate(f, [190 + k * 4, 240 + k * 4], [0, d.rev], { ...clamp, easing: ease.out }));
            return (
              <React.Fragment key={k}>
                <div
                  style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    width: w,
                    height: hh,
                    borderRadius: lerp(12, 10, m),
                    background: m > 0 ? `linear-gradient(180deg, ${isPeak ? `rgba(16,163,127,${0.4 + 0.6 * m})` : `rgba(255,255,255,${0.06 + 0.26 * m})`}, rgba(255,255,255,${0.04 + 0.04 * m}))` : "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    opacity: rowIn,
                    transform: `translateY(${(1 - rowIn) * 16}px)`,
                    boxShadow: isPeak && m > 0.5 ? `0 0 40px rgba(16,163,127,${0.35 * m})` : undefined,
                  }}
                >
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 20px", fontFamily: FONT, fontSize: 18, color: "#E4E4E7", opacity: 1 - m * 3 }}>
                    <div style={{ flex: 1, fontWeight: 600 }}>{d.m}</div>
                    <div style={{ flex: 1 }}>${d.rev}K</div>
                    <div style={{ flex: 1, color: C.silver }}>{d.units}</div>
                    <div style={{ flex: 1, color: d.region === "APAC" ? C.green : C.silver }}>{d.region}</div>
                  </div>
                </div>
                {/* bar label + counter */}
                <div style={{ position: "absolute", left: barX(k), width: BAR_W, top: BASE_Y + 14, textAlign: "center", fontFamily: FONT, fontSize: 16, color: C.silver, opacity: m }}>{d.m}</div>
                <div style={{ position: "absolute", left: barX(k) - 10, width: BAR_W + 20, top: BASE_Y - h - 34, textAlign: "center", fontFamily: FONT, fontSize: 17, fontWeight: 600, color: isPeak ? C.green : C.white, opacity: prog(f, 192 + k * 4, 204 + k * 4), fontVariantNumeric: "tabular-nums" }}>{val}</div>
              </React.Fragment>
            );
          })}

        {/* trim-path trend line */}
        {f >= 200 && (
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <linearGradient id="trend" x1="0" x2="1">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
                <stop offset="100%" stopColor={C.green} />
              </linearGradient>
            </defs>
            <path
              d={DATA.map((_, k) => `${k === 0 ? "M" : "L"}${barX(k) + BAR_W / 2},${BASE_Y - barH(k) - 54}`).join(" ")}
              fill="none"
              stroke="url(#trend)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - trim}
            />
            {DATA.map((_, k) => (
              <circle key={k} cx={barX(k) + BAR_W / 2} cy={BASE_Y - barH(k) - 54} r={5} fill={k === 5 ? C.green : "#fff"} opacity={trim > k / 5 ? 1 : 0} />
            ))}
          </svg>
        )}
      </div>

      {/* RIGHT: donut + insight cards */}
      <div style={{ filter: rightBlur > 0.1 ? `blur(${rightBlur}px)` : undefined, transform: `scale(${1 + focusShift * 0.02})`, transformOrigin: "1480px 540px" }}>
        {f >= 196 && (
          <Glass fill={0.08} style={{ left: 1210, top: 196, width: 540, height: 312, opacity: right(0) * others, transform: `translateX(${(1 - right(0)) * 60}px)` }}>
            <div style={{ position: "absolute", left: 28, top: 24, fontFamily: FONT, fontSize: 18, fontWeight: 600, color: C.white }}>Revenue by region</div>
            <div style={{ position: "absolute", left: 300, top: 96, fontFamily: FONT }}>
              {REGIONS.map((r) => (
                <div key={r.n} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, fontSize: 16, color: "#E4E4E7" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 5, background: r.c }} />
                  <span style={{ width: 130 }}>{r.n}</span>
                  <span style={{ color: C.silver, fontVariantNumeric: "tabular-nums" }}>{Math.round(r.v * 100 * donutDraw)}%</span>
                </div>
              ))}
            </div>
          </Glass>
        )}
        {[
          { label: "Total revenue · Apr–Sep", value: `$${total.toFixed(1)}M`, accent: false },
          { label: "Q3 vs Q2 growth", value: `+${Math.round(growth)}%`, accent: true },
        ].map((card, k) =>
          f >= 206 + k * 10 ? (
            <Glass key={k} fill={0.08} style={{ left: 1210, top: 530 + k * 160, width: 540, height: 140, opacity: right(k + 1) * others, transform: `translateX(${(1 - right(k + 1)) * 60}px)` }}>
              <div style={{ position: "absolute", left: 28, top: 22, fontFamily: FONT, fontSize: 16, color: C.silver }}>{card.label}</div>
              <div style={{ position: "absolute", left: 28, top: 52, fontFamily: FONT, fontSize: 54, fontWeight: 650, letterSpacing: "-0.03em", color: card.accent ? C.green : C.white, fontVariantNumeric: "tabular-nums" }}>{card.value}</div>
              <div style={{ position: "absolute", right: 28, top: 26 }}>
                <IconCheck size={26} />
              </div>
            </Glass>
          ) : null,
        )}
      </div>

      {/* donut (lives outside the card so it can match-cut) */}
      {f >= 196 && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: right(0) * donutFade, filter: rightBlur > 0.1 && mc === 0 ? `blur(${rightBlur}px)` : undefined }}>
          <circle cx={dcx} cy={dcy} r={dr} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={lerp(22, 6, mc)} />
          {(() => {
            let acc = 0;
            return REGIONS.map((r, k) => {
              const start = acc;
              acc += r.v;
              const len = r.v * donutDraw * (1 - mc * (k === 0 ? 0 : 1)) + (k === 0 ? mc * (1 - r.v) : 0);
              return (
                <circle
                  key={k}
                  cx={dcx}
                  cy={dcy}
                  r={dr}
                  fill="none"
                  stroke={r.c}
                  strokeWidth={lerp(22, 6, mc)}
                  pathLength={1}
                  strokeDasharray={`${Math.max(0, len - 0.006)} 1`}
                  strokeDashoffset={-start * (1 - mc)}
                  transform={`rotate(${-90 + mc * 180} ${dcx} ${dcy})`}
                  strokeLinecap="round"
                />
              );
            });
          })()}
          {mc > 0 && <circle cx={dcx} cy={dcy} r={dr} fill="none" stroke={C.green} strokeWidth={30} opacity={0.15 * mc} style={{ filter: "blur(12px)" }} />}
        </svg>
      )}

      {/* flying spreadsheet file */}
      {!landed && f >= 6 && (
        <div style={{ position: "absolute", left: fx - 28, top: fy - 34, transform: `rotate(${(1 - fly) * -24}deg) scale(${lerp(1.5, 0.6, fly)})`, filter: `drop-shadow(0 20px 30px rgba(0,0,0,0.6))` }}>
          <IconSheet size={56} />
        </div>
      )}

      {/* composer with attachment */}
      <div style={{ opacity: others }}>
        <PromptBar
          x={960}
          y={960}
          width={820}
          text={sent ? "" : typed(PROMPT, f, 60, 122)}
          placeholder="Ask anything"
          sendActive={prog(f, 60, 66) * (1 - prog(f, 128, 134))}
          press={interpolate(f, [120, 132], [0, 1], clamp)}
          attachment={
            landed ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px 6px 8px", borderRadius: 12, background: "rgba(255,255,255,0.08)", flexShrink: 0, transform: `scale(${springIn(f, 56)})` }}>
                <div style={{ position: "relative", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconSheet size={20} />
                  <svg width={34} height={34} style={{ position: "absolute", inset: 0 }}>
                    <circle cx={17} cy={17} r={15} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
                    <circle cx={17} cy={17} r={15} fill="none" stroke={C.green} strokeWidth={2.2} pathLength={1} strokeDasharray={`${upload} 1`} transform="rotate(-90 17 17)" strokeLinecap="round" opacity={1 - prog(f, 98, 106)} />
                  </svg>
                </div>
                <span style={{ fontFamily: FONT, fontSize: 15, color: C.white }}>Sales_2026.xlsx</span>
                {upload >= 1 && <IconCheck size={16} />}
              </div>
            ) : undefined
          }
        />
      </div>
    </AbsoluteFill>
  );
};
