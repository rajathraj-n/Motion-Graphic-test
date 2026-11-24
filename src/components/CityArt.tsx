import React from "react";
import { random } from "remotion";

/**
 * Procedural "futuristic city surrounded by nature", built as separate
 * depth layers so the camera can move through it with 2.5D parallax.
 * To use real AI-generated artwork instead, replace each <Layer> body
 * with an <Img> of the matching cut-out plate (sky / far / mid / near).
 */

const W = 1920;
const H = 1080;

type Cam = { push: number; pan: number };

const Layer: React.FC<{ depth: number; cam: Cam; children: React.ReactNode }> = ({ depth, cam, children }) => {
  const s = 1 + cam.push * depth * 0.35;
  const x = -cam.pan * depth * 90;
  const y = cam.push * depth * 30;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: "50% 62%", overflow: "visible" }}
    >
      {children}
    </svg>
  );
};

const TOWERS = new Array(26).fill(0).map((_, i) => {
  const x = 120 + i * 66 + (random(`tx${i}`) - 0.5) * 40;
  const centre = 1 - Math.abs(x - 980) / 980;
  const h = 180 + random(`th${i}`) * 260 + centre * 300;
  const w = 34 + random(`tw${i}`) * 46;
  return { x, h, w, round: random(`tr${i}`) > 0.5, garden: random(`tg${i}`) > 0.35, seed: i };
});

const FAR = new Array(30).fill(0).map((_, i) => ({
  x: i * 66 + random(`fx${i}`) * 30,
  h: 90 + random(`fh${i}`) * 170,
  w: 22 + random(`fw${i}`) * 28,
}));

const TREES = new Array(34).fill(0).map((_, i) => ({
  x: (i / 33) * W + (random(`nx${i}`) - 0.5) * 50,
  r: 50 + random(`nr${i}`) * 70,
  y: 930 + random(`ny${i}`) * 70 + Math.abs(i - 16) * 4,
  shade: random(`ns${i}`),
}));

export const CityArt: React.FC<{ cam: Cam; frame: number }> = ({ cam, frame }) => {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#0B1418" }}>
      {/* SKY */}
      <Layer depth={0.05} cam={cam}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#071219" />
            <stop offset="45%" stopColor="#173B45" />
            <stop offset="72%" stopColor="#5E8A86" />
            <stop offset="86%" stopColor="#E9C79C" />
            <stop offset="100%" stopColor="#F3D9B1" />
          </linearGradient>
          <radialGradient id="sun" cx="0.58" cy="0.66" r="0.35">
            <stop offset="0%" stopColor="#FFF4DE" stopOpacity="1" />
            <stop offset="18%" stopColor="#FFE2B0" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FFE2B0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#sky)" />
        <rect width={W} height={H} fill="url(#sun)" />
        {new Array(40).fill(0).map((_, i) => (
          <circle key={i} cx={random(`s${i}`) * W} cy={random(`sy${i}`) * 300} r={random(`sr${i}`) * 1.4 + 0.3} fill="#fff" opacity={0.3 + 0.3 * Math.sin(frame / 20 + i)} />
        ))}
      </Layer>

      {/* FAR: mountains + distant skyline in haze */}
      <Layer depth={0.2} cam={cam}>
        <path d="M0 720 L180 560 L320 640 L520 470 L700 600 L860 520 L1040 610 L1260 450 L1460 590 L1650 500 L1920 640 L1920 1080 L0 1080 Z" fill="#3E6667" opacity={0.75} />
        <path d="M0 760 L240 640 L420 700 L640 590 L900 690 L1120 620 L1380 700 L1600 610 L1920 720 L1920 1080 L0 1080 Z" fill="#355A5B" opacity={0.85} />
        {FAR.map((t, i) => (
          <rect key={i} x={t.x} y={760 - t.h} width={t.w} height={t.h + 40} rx={t.w / 2.5} fill="#4F7471" opacity={0.65} />
        ))}
        <rect y={680} width={W} height={200} fill="#E9C79C" opacity={0.12} />
      </Layer>

      {/* MID: hero towers with gardens, ring structure */}
      <Layer depth={0.5} cam={cam}>
        <defs>
          <linearGradient id="tower" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1C3036" />
            <stop offset="55%" stopColor="#2D4950" />
            <stop offset="100%" stopColor="#E6C29A" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="glassT" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9FD3CF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#9FD3CF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* floating ring */}
        <ellipse cx={980} cy={420} rx={360} ry={70} fill="none" stroke="#CFEDE6" strokeOpacity={0.55} strokeWidth={6} />
        <ellipse cx={980} cy={420} rx={360} ry={70} fill="none" stroke="#10A37F" strokeOpacity={0.35} strokeWidth={18} style={{ filter: "blur(6px)" }} />
        {TOWERS.map((t) => {
          const top = 880 - t.h;
          return (
            <g key={t.seed}>
              <rect x={t.x} y={top} width={t.w} height={t.h + 60} rx={t.round ? t.w / 2 : 6} fill="url(#tower)" />
              <rect x={t.x + 4} y={top + 6} width={t.w * 0.35} height={t.h * 0.6} rx={3} fill="url(#glassT)" />
              {new Array(Math.floor(t.h / 26)).fill(0).map((__, k) =>
                random(`w${t.seed}-${k}`) > 0.55 ? (
                  <rect key={k} x={t.x + t.w * 0.55} y={top + 20 + k * 26} width={t.w * 0.25} height={3} fill="#FFE1A8" opacity={0.75} />
                ) : null,
              )}
              {t.garden && (
                <>
                  <ellipse cx={t.x + t.w / 2} cy={top + 6} rx={t.w * 0.7} ry={14} fill="#2F7A55" />
                  <ellipse cx={t.x + t.w / 2} cy={top + t.h * 0.45} rx={t.w * 0.65} ry={10} fill="#2F7A55" opacity={0.9} />
                  <circle cx={t.x + t.w * 0.3} cy={top - 4} r={10} fill="#3C9466" />
                  <circle cx={t.x + t.w * 0.7} cy={top - 2} r={8} fill="#46A374" />
                </>
              )}
            </g>
          );
        })}
        {/* sky bridge */}
        <path d="M560 640 Q980 560 1400 640" fill="none" stroke="#D9F2EC" strokeOpacity={0.5} strokeWidth={4} />
        {/* waterline */}
        <rect y={880} width={W} height={200} fill="#20383C" />
        <rect y={880} width={W} height={200} fill="url(#glassT)" opacity={0.35} />
        {TOWERS.filter((_, i) => i % 2 === 0).map((t) => (
          <rect key={`r${t.seed}`} x={t.x + 4} y={886} width={t.w - 8} height={60 + (t.h / 600) * 80} fill="#E6C29A" opacity={0.08 + 0.04 * Math.sin(frame / 15 + t.seed)} />
        ))}
      </Layer>

      {/* NEAR: foreground foliage */}
      <Layer depth={1.1} cam={cam}>
        {TREES.map((t, i) => (
          <g key={i}>
            <circle cx={t.x} cy={t.y} r={t.r} fill={t.shade > 0.5 ? "#0E2A1F" : "#12352A"} />
            <circle cx={t.x - t.r * 0.4} cy={t.y - t.r * 0.5} r={t.r * 0.55} fill="#1B4A36" opacity={0.8} />
          </g>
        ))}
        {/* fronds */}
        {[-1, 1].map((side) =>
          new Array(6).fill(0).map((_, k) => {
            const bx = side < 0 ? 40 : W - 40;
            const a = (side < 0 ? -70 : -110) + k * 14 * side + Math.sin(frame / 40 + k) * 2;
            return <ellipse key={`${side}${k}`} cx={bx} cy={H - 40} rx={260} ry={34} fill="#0A2018" transform={`rotate(${a} ${bx} ${H - 40}) translate(${side * 200} 0)`} />;
          }),
        )}
        <rect y={H - 60} width={W} height={80} fill="#06140F" />
      </Layer>

      {/* atmosphere + grade */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 58% 64%, rgba(255,226,176,0.25), transparent 70%)", mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.25), transparent 30%, transparent 70%, rgba(0,0,0,0.5))" }} />
    </div>
  );
};
