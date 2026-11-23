import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, H, RADIUS, W} from '../theme';

type Xform = {
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  scale?: number;
};

const xform = ({x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, scale = 1}: Xform) =>
  `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`;

/**
 * Virtual camera. Establishes perspective and moves the whole world.
 * Keep filters/opacity OFF this element so the 3D context is not flattened.
 */
export const Camera: React.FC<
  Xform & {perspective?: number; children: React.ReactNode}
> = ({perspective = 2200, children, ...t}) => (
  <AbsoluteFill style={{perspective, perspectiveOrigin: '50% 50%'}}>
    <div
      style={{
        position: 'absolute',
        width: W,
        height: H,
        transformStyle: 'preserve-3d',
        transformOrigin: '50% 50%',
        transform: xform(t),
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

/** An absolutely-positioned element placed in camera space. */
export const Layer: React.FC<
  Xform & {
    left: number;
    top: number;
    w: number;
    h: number;
    origin?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }
> = ({left, top, w, h, origin = '50% 50%', style, children, ...t}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      width: w,
      height: h,
      transformStyle: 'preserve-3d',
      transformOrigin: origin,
      transform: xform(t),
      ...style,
    }}
  >
    {children}
  </div>
);

/** Translucent glass surface with luminous hairline border and optional orange glow. */
export const Glass: React.FC<{
  glow?: number; // 0..1
  tone?: 'dark' | 'light';
  radius?: number;
  blur?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({glow = 0, tone = 'dark', radius = RADIUS, blur = true, style, children}) => {
  const dark = tone === 'dark';
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: radius,
        overflow: 'hidden',
        backgroundColor: dark ? 'rgba(27,30,37,0.72)' : 'rgba(255,255,255,0.78)',
        backgroundImage: dark
          ? 'linear-gradient(160deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.035) 38%, rgba(255,255,255,0.02) 70%, rgba(255,255,255,0.06) 100%)'
          : 'linear-gradient(160deg, rgba(255,255,255,0.95), rgba(247,248,250,0.7))',
        border: `1px solid ${
          glow > 0
            ? `rgba(240,96,35,${0.25 + 0.55 * glow})`
            : dark
              ? 'rgba(255,255,255,0.14)'
              : 'rgba(17,19,24,0.08)'
        }`,
        boxShadow: [
          dark ? 'inset 0 1px 0 rgba(255,255,255,0.16)' : 'inset 0 1px 0 #fff',
          dark ? '0 40px 80px -30px rgba(0,0,0,0.75)' : '0 30px 60px -30px rgba(17,19,24,0.25)',
          `0 0 ${50 * glow}px rgba(240,96,35,${0.4 * glow})`,
        ].join(', '),
        backdropFilter: blur ? 'blur(18px) saturate(140%)' : undefined,
        color: dark ? C.text : C.graphite,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Deep graphite backdrop with a masked dot grid and slowly drifting orange light. */
export const Background: React.FC<{energy?: number}> = ({energy = 1}) => {
  const f = useCurrentFrame();
  const a = f / 30;
  const orb = (cx: number, cy: number, r: number, color: string, o: number) => (
    <div
      style={{
        position: 'absolute',
        left: cx - r,
        top: cy - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
        opacity: o,
      }}
    />
  );
  return (
    <AbsoluteFill style={{backgroundColor: C.graphite, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at 50% 40%, ${C.graphite2} 0%, ${C.graphite} 60%, #0B0C10 100%)`,
        }}
      />
      {orb(1500 + Math.sin(a * 0.25) * 140, 160 + Math.cos(a * 0.2) * 80, 700, 'rgba(240,96,35,0.22)', 0.9 * energy)}
      {orb(320 + Math.cos(a * 0.18) * 120, 920 + Math.sin(a * 0.22) * 60, 620, 'rgba(240,96,35,0.14)', energy)}
      {orb(960 + Math.sin(a * 0.15) * 200, 560, 520, 'rgba(255,150,60,0.05)', energy)}
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1.2px)',
          backgroundSize: '34px 34px',
          backgroundPosition: `${(-a * 4) % 34}px 0px`,
          WebkitMaskImage: 'radial-gradient(70% 65% at 50% 50%, #000 0%, transparent 100%)',
          maskImage: 'radial-gradient(70% 65% at 50% 50%, #000 0%, transparent 100%)',
        }}
      />
      <AbsoluteFill
        style={{background: 'radial-gradient(130% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)'}}
      />
    </AbsoluteFill>
  );
};
