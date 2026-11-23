import React, {useId as useReactId, useMemo} from 'react';
import {getLength, getPointAtLength} from '@remotion/paths';
import {useCurrentFrame} from 'remotion';
import {C, EASE_IO, prog} from '../theme';

const useId = (p: string) => p + useReactId().replace(/[^a-zA-Z0-9]/g, '');

/** Smooth Catmull-Rom → cubic Bézier path through points. */
export const smoothPath = (pts: [number, number][]) => {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const t = 0.18;
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d;
};

export const toPoints = (data: number[], w: number, h: number, pad = 6, min?: number, max?: number) => {
  const lo = min ?? Math.min(...data);
  const hi = max ?? Math.max(...data);
  return data.map((v, i) => [
    (i / (data.length - 1)) * w,
    pad + (1 - (v - lo) / (hi - lo || 1)) * (h - pad * 2),
  ]) as [number, number][];
};

/** Line chart with path-draw animation, gradient area and optional data dots. */
export const LineChart: React.FC<{
  data: number[];
  w: number;
  h: number;
  delay: number;
  dur?: number;
  color?: string;
  stroke?: number;
  area?: boolean;
  dots?: boolean;
  grid?: boolean;
  dashed?: boolean;
  min?: number;
  max?: number;
}> = ({data, w, h, delay, dur = 45, color = C.orange, stroke = 3, area = true, dots, grid = true, dashed, min, max}) => {
  const f = useCurrentFrame();
  const id = useId('lc');
  const pts = useMemo(() => toPoints(data, w, h, 10, min, max), [data, w, h, min, max]);
  const d = useMemo(() => smoothPath(pts), [pts]);
  const len = useMemo(() => getLength(d), [d]);
  const p = prog(f, delay, dur, EASE_IO);
  return (
    <svg width={w} height={h} style={{overflow: 'visible', display: 'block'}}>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={0.35} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <rect x={-10} y={-20} width={(w + 20) * p} height={h + 40} />
        </clipPath>
      </defs>
      {grid &&
        [0.25, 0.5, 0.75, 1].map((g) => (
          <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
        ))}
      {area && <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill={`url(#${id}g)`} clipPath={`url(#${id}c)`} />}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={dashed ? '8 8' : `${len} ${len}`}
        strokeDashoffset={dashed ? 0 : len * (1 - p)}
        clipPath={dashed ? `url(#${id}c)` : undefined}
        style={{filter: `drop-shadow(0 0 6px ${color}88)`}}
      />
      {dots &&
        pts.map(([x, y], i) => {
          const t = i / (pts.length - 1);
          const s = prog(f, delay + t * dur, 10);
          return <circle key={i} cx={x} cy={y} r={4.5 * s} fill={C.graphite} stroke={color} strokeWidth={2} />;
        })}
    </svg>
  );
};

/** Bar chart with staggered growth. */
export const Bars: React.FC<{
  data: number[];
  w: number;
  h: number;
  delay: number;
  stagger?: number;
  highlight?: number;
  missing?: number[];
  gap?: number;
  color?: string;
}> = ({data, w, h, delay, stagger = 2, highlight, missing = [], gap = 0.38, color = C.orange}) => {
  const f = useCurrentFrame();
  const max = Math.max(...data);
  const bw = w / data.length;
  return (
    <svg width={w} height={h} style={{display: 'block', overflow: 'visible'}}>
      {data.map((v, i) => {
        const p = prog(f, delay + i * stagger, 22);
        const bh = (v / max) * h * p;
        const x = i * bw + (bw * gap) / 2;
        const isMissing = missing.includes(i);
        const hl = highlight === i;
        return isMissing ? (
          <rect
            key={i}
            x={x}
            y={h - (v / max) * h}
            width={bw * (1 - gap)}
            height={(v / max) * h}
            rx={4}
            fill="none"
            stroke="rgba(255,255,255,0.22)"
            strokeDasharray="4 4"
            opacity={p}
          />
        ) : (
          <rect
            key={i}
            x={x}
            y={h - bh}
            width={bw * (1 - gap)}
            height={bh}
            rx={4}
            fill={hl ? C.yellow : color}
            opacity={hl ? 1 : 0.35 + 0.65 * (v / max)}
          />
        );
      })}
    </svg>
  );
};

/** Progress ring. */
export const Ring: React.FC<{size: number; value: number; delay: number; dur?: number; stroke?: number; color?: string; children?: React.ReactNode}> = ({
  size,
  value,
  delay,
  dur = 40,
  stroke = 10,
  color = C.orange,
  children,
}) => {
  const f = useCurrentFrame();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = prog(f, delay, dur, EASE_IO) * value;
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <svg width={size} height={size} style={{transform: 'rotate(-90deg)'}}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - p)}
          style={{filter: `drop-shadow(0 0 6px ${color}aa)`}}
        />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {children}
      </div>
    </div>
  );
};

/** Horizontal progress bar. */
export const ProgressBar: React.FC<{value: number; delay: number; dur?: number; color?: string; h?: number}> = ({
  value,
  delay,
  dur = 35,
  color = C.orange,
  h = 6,
}) => {
  const f = useCurrentFrame();
  const p = prog(f, delay, dur, EASE_IO) * value;
  return (
    <div style={{height: h, borderRadius: h, background: 'rgba(255,255,255,0.08)', overflow: 'hidden'}}>
      <div
        style={{
          width: `${p * 100}%`,
          height: '100%',
          borderRadius: h,
          background: `linear-gradient(90deg, ${color}, ${color === C.orange ? '#FF9A3D' : color})`,
          boxShadow: `0 0 10px ${color}88`,
        }}
      />
    </div>
  );
};

/**
 * Glowing connector path: draws on, and optionally carries travelling pulses.
 * `pulses` are phase offsets in [0,1); `speed` is loops per second.
 */
export const Connector: React.FC<{
  d: string;
  delay: number;
  dur?: number;
  color?: string;
  width?: number;
  pulses?: number[];
  pulseColor?: string;
  speed?: number;
  opacity?: number;
  glow?: boolean;
}> = ({d, delay, dur = 24, color = C.orange, width = 2.5, pulses = [], pulseColor = C.yellow, speed = 0.6, opacity = 1, glow = true}) => {
  const f = useCurrentFrame();
  const len = useMemo(() => getLength(d), [d]);
  const p = prog(f, delay, dur, EASE_IO);
  const live = f > delay + dur;
  return (
    <g opacity={opacity}>
      {glow && (
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={width * 4}
          strokeLinecap="round"
          opacity={0.18}
          strokeDasharray={`${len} ${len}`}
          strokeDashoffset={len * (1 - p)}
          style={{filter: 'blur(6px)'}}
        />
      )}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={`${len} ${len}`}
        strokeDashoffset={len * (1 - p)}
      />
      {p > 0 && p < 1 && (() => {
        const pt = getPointAtLength(d, len * p);
        if (!pt) return null;
        return <circle cx={pt.x} cy={pt.y} r={width * 2.2} fill="#fff" style={{filter: `drop-shadow(0 0 8px ${color})`}} />;
      })()}
      {live &&
        pulses.map((ph, i) => {
          const t = (((f - delay - dur) / 30) * speed + ph) % 1;
          const pt = getPointAtLength(d, len * t);
          if (!pt) return null;
          const fade = Math.sin(t * Math.PI);
          return (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={width * 2}
              fill={pulseColor}
              opacity={fade}
              style={{filter: `drop-shadow(0 0 8px ${pulseColor})`}}
            />
          );
        })}
    </g>
  );
};

/** Pulsing status dot. */
export const LiveDot: React.FC<{color?: string; size?: number}> = ({color = C.orange, size = 8}) => {
  const f = useCurrentFrame();
  const t = (f % 40) / 40;
  return (
    <span style={{position: 'relative', display: 'inline-block', width: size, height: size}}>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: color,
          transform: `scale(${1 + t * 1.8})`,
          opacity: (1 - t) * 0.5,
        }}
      />
      <span style={{position: 'absolute', inset: 0, borderRadius: '50%', background: color}} />
    </span>
  );
};

