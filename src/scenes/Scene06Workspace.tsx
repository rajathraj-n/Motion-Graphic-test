import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BEAT, C, FONT, MONO } from "../theme";
import { clamp, ease, lerp, prog, springIn } from "../lib/anim";
import { Glass } from "../components/Glass";
import { BrandMark } from "../components/BrandMark";
import { useCopy } from "../copy";
import { IconBulb, IconChart, IconCode, IconImage, IconPen } from "../components/Icons";

const CX = 960;
const CY = 560;
const R = 700;
const PERSP = 1900;
const PW = 320;
const PH = 200;

const FEATURES = [
  { name: "Writing", sub: "Draft · polish · rewrite", icon: IconPen },
  { name: "Brainstorming", sub: "Ideas on demand", icon: IconBulb },
  { name: "Data analysis", sub: "Charts & insights", icon: IconChart },
  { name: "Coding", sub: "Build & debug", icon: IconCode },
  { name: "Image creation", sub: "Imagine anything", icon: IconImage },
];

/** start points of the bezier entry paths (off-screen) */
const ENTRY = [
  { x: -400, y: 120 },
  { x: 960, y: -320 },
  { x: 2300, y: 200 },
  { x: 2300, y: 1250 },
  { x: -380, y: 1200 },
];

const bez = (a: number, b: number, c: number, d: number, t: number) => {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};


/** 00:27–00:33 — "Write. Think. Create. Discover." (beat drop) */
export const Scene06Workspace: React.FC = () => {
  const f = useCurrentFrame();
  const copy = useCopy();
  const WORDS = copy.workspaceWords.split(/\s+/).filter(Boolean);
  const fadeIn = prog(f, 0, 16);

  // 180° orbit of the camera around the central interface
  const orbit = interpolate(f, [30, 270], [0, 180], { ...clamp, easing: ease.inOut });
  // magnetic collapse
  const collapse = prog(f, 268, 318, ease.backIn);
  const radius = R * (1 - collapse);
  const beatPulse = Math.exp(-((f % BEAT) / 7)); // decays after every beat

  // central interface -> minimal pill
  const centralIn = springIn(f, 0, { damping: 16, stiffness: 120 });
  const minimal = prog(f, 318, 356, ease.inOut);
  const cw = lerp(560, 560, minimal);
  const ch = lerp(330, 64, minimal);
  const impact = Math.exp(-Math.max(0, f - 318) / 8) * (f >= 318 ? 1 : 0);

  const panels = FEATURES.map((ft, i) => {
    const theta = ((i / FEATURES.length) * 360 + orbit + 18) * (Math.PI / 180);
    const ox = Math.sin(theta) * radius;
    const oz = Math.cos(theta) * radius * 0.85 - radius * 0.15;
    // tilted orbit plane: panels pass below the interface in front, above it behind
    const oy = Math.cos(theta) * radius * 0.42 + Math.sin(f / 40 + i) * 8;
    const s = PERSP / (PERSP - oz);
    const tx = CX + ox * s;
    const ty = CY + oy * s;
    // bezier entry
    const e = prog(f, i * 7, 54 + i * 7, ease.out);
    const st = ENTRY[i];
    const px = bez(st.x, st.x * 0.4 + CX * 0.6, tx + (i % 2 ? 200 : -200), tx, e);
    const py = bez(st.y, st.y * 0.2 + CY * 0.8, ty - 160, ty, e);
    return { ft, i, x: px, y: py, z: oz, s: s * (1 - collapse * 0.7), theta, e };
  });

  const sorted = [...panels].sort((a, b) => a.z - b.z);

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      {/* beat-reactive floor glow */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 50% 30% at 50% 60%, rgba(16,163,127,${0.08 + 0.12 * beatPulse * (1 - minimal)}), transparent 70%)` }} />

      {/* connecting light trails */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="trail" x1="0" x2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.8" />
            <stop offset="100%" stopColor={C.green} stopOpacity="0" />
          </linearGradient>
        </defs>
        {panels.map((p) => {
          const op = p.e * (1 - collapse) * (p.z < -200 ? 0.35 : 0.8);
          const mx = (p.x + CX) / 2;
          const my = Math.min(p.y, CY) - 90;
          return (
            <g key={p.i} opacity={op}>
              <path d={`M${CX},${CY} Q${mx},${my} ${p.x},${p.y}`} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1.2} />
              <path d={`M${CX},${CY} Q${mx},${my} ${p.x},${p.y}`} fill="none" stroke="url(#trail)" strokeWidth={2.2} pathLength={1} strokeDasharray="0.18 0.82" strokeDashoffset={-((f / 45 + p.i * 0.2) % 1)} />
            </g>
          );
        })}
        {panels.map((p, k) => {
          const q = panels[(k + 1) % panels.length];
          return <line key={`l${k}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} opacity={p.e * q.e * (1 - collapse)} />;
        })}
      </svg>

      {/* panels behind the centre */}
      {sorted.filter((p) => p.z < 0).map((p) => <FeaturePanel key={p.i} p={p} f={f} collapse={collapse} />)}

      {/* central interface (billboarded) */}
      <div style={{ position: "absolute", left: CX - cw / 2, top: CY - ch / 2, width: cw, height: ch, transform: `scale(${(0.8 + 0.2 * centralIn) * (1 + 0.025 * beatPulse * (1 - minimal) + 0.05 * impact)})`, opacity: centralIn, zIndex: 10 }}>
        <Glass radius={lerp(26, 32, minimal)} fill={0.1 + 0.04 * impact} sweep={(f / 90) % 1} style={{ inset: 0, boxShadow: `0 0 ${80 * impact}px rgba(16,163,127,${0.5 * impact}), 0 40px 80px -20px rgba(0,0,0,0.8)` }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, opacity: 1 - minimal * 2.5, fontFamily: FONT }}>
            <BrandMark size={58} />
            <div style={{ fontSize: 30, fontWeight: 600, color: C.white, letterSpacing: "-0.02em" }}>{copy.brandName}</div>
            <div style={{ width: 420, height: 50, borderRadius: 25, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", padding: "0 20px", fontSize: 17, color: C.silver }}>Ask anything</div>
          </div>
        </Glass>
      </div>

      {/* panels in front */}
      {sorted.filter((p) => p.z >= 0).map((p) => <FeaturePanel key={p.i} p={p} f={f} collapse={collapse} front />)}

      {/* beat-synced keywords */}
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 26, fontFamily: FONT, opacity: 1 - prog(f, 300, 326) }}>
        {WORDS.map((w, i) => {
          const at = i * 2 * BEAT; // every second beat: 0, 1, 2, 3 s into the drop
          const s = springIn(f, at, { damping: 12, stiffness: 180 });
          const hit = Math.exp(-Math.max(0, f - at) / 10) * (f >= at ? 1 : 0);
          const active = f >= at && f < at + 2 * BEAT;
          return (
            <span key={w} style={{ display: "inline-block", fontSize: 64, fontWeight: 650, letterSpacing: "-0.035em", color: active ? C.white : f > 4 * 2 * BEAT ? C.white : "rgba(255,255,255,0.45)", opacity: s, transform: `translateY(${(1 - s) * 40}px) scale(${1 + 0.12 * hit})`, filter: `blur(${(1 - s) * 10}px)`, textShadow: active ? `0 0 ${30 * hit}px rgba(16,163,127,0.8)` : undefined }}>
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

type PanelData = { ft: (typeof FEATURES)[number]; i: number; x: number; y: number; z: number; s: number; theta: number; e: number };

const FeaturePanel: React.FC<{ p: PanelData; f: number; collapse: number; front?: boolean }> = ({ p, f, collapse }) => {
  const Icon = p.ft.icon;
  const depthBlur = p.z < 0 ? Math.min(6, (-p.z / R) * 6) : 0;
  const facing = Math.sin(p.theta) * -22 * (1 - collapse);
  return (
    <div
      style={{
        position: "absolute",
        left: p.x - PW / 2,
        top: p.y - PH / 2,
        width: PW,
        height: PH,
        transform: `perspective(1200px) rotateY(${facing}deg) scale(${p.s})`,
        opacity: Math.min(1, p.e * 1.5) * (1 - prog(collapse, 0.75, 1)) * (p.z < 0 ? 0.75 : 1),
        filter: depthBlur > 0.2 ? `blur(${depthBlur}px)` : undefined,
        zIndex: p.z >= 0 ? 20 : 1,
      }}
    >
      <Glass radius={20} fill={0.1} style={{ inset: 0 }}>
        <div style={{ position: "absolute", inset: 0, padding: 22, fontFamily: FONT }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: p.i === 4 ? C.green : "rgba(255,255,255,0.09)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={19} />
            </div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 600, color: C.white, letterSpacing: "-0.01em" }}>{p.ft.name}</div>
              <div style={{ fontSize: 13, color: C.silver }}>{p.ft.sub}</div>
            </div>
          </div>
          <PanelBody i={p.i} f={f} />
        </div>
      </Glass>
    </div>
  );
};

const PanelBody: React.FC<{ i: number; f: number }> = ({ i, f }) => {
  const box: React.CSSProperties = { marginTop: 18 };
  if (i === 0)
    return (
      <div style={box}>
        {[0.95, 0.8, 0.88, 0.55].map((w, k) => (
          <div key={k} style={{ height: 7, width: `${w * 100}%`, borderRadius: 4, background: k === 3 ? C.green : "rgba(255,255,255,0.14)", marginBottom: 11 }} />
        ))}
      </div>
    );
  if (i === 1)
    return (
      <svg width={276} height={100} style={box}>
        {[[40, 50], [138, 26], [138, 76], [236, 50]].map(([x, y], k) => (
          <g key={k}>
            {k > 0 && <line x1={k === 3 ? 138 : 40} y1={k === 3 ? 26 : 50} x2={x} y2={y} stroke="rgba(255,255,255,0.25)" />}
            <circle cx={x} cy={y} r={k === 0 ? 14 : 10} fill={k === 0 ? C.green : "rgba(255,255,255,0.3)"} />
          </g>
        ))}
      </svg>
    );
  if (i === 2)
    return (
      <div style={{ ...box, display: "flex", alignItems: "flex-end", gap: 10, height: 96 }}>
        {[40, 55, 48, 70, 82, 96].map((h, k) => (
          <div key={k} style={{ flex: 1, height: `${h * (0.85 + 0.15 * Math.sin(f / 12 + k))}%`, borderRadius: 5, background: k === 5 ? C.green : "rgba(255,255,255,0.22)" }} />
        ))}
      </div>
    );
  if (i === 3)
    return (
      <div style={{ ...box, fontFamily: MONO, fontSize: 13, lineHeight: 1.7, color: "#D4D4D8" }}>
        <div><span style={{ color: C.green }}>const</span> idea = <span style={{ color: "#fff" }}>spark</span>();</div>
        <div><span style={{ color: C.green }}>await</span> build(idea);</div>
        <div style={{ color: C.dim }}>{"// ✓ all tests pass"}</div>
      </div>
    );
  return (
    <div style={{ ...box, height: 96, borderRadius: 12, background: "linear-gradient(180deg,#173B45 0%,#5E8A86 55%,#E9C79C 80%,#20383C 81%)", position: "relative", overflow: "hidden" }}>
      {[20, 60, 95, 130, 170, 210, 245].map((x, k) => (
        <div key={k} style={{ position: "absolute", left: x, bottom: 18, width: 18, height: 30 + ((k * 37) % 45), borderRadius: 6, background: "#2D4950" }} />
      ))}
    </div>
  );
};
