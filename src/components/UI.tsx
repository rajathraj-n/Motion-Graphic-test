import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FONT, prog, tween} from '../theme';
import {Glass} from './Stage';
import {Icon, IconName} from './Icons';

export const font = (size: number, weight = 500, color: string = C.text, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: FONT,
  fontSize: size,
  fontWeight: weight,
  color,
  lineHeight: 1.25,
  ...extra,
});

/** Panel header row: icon + title + optional right slot. */
export const PanelHeader: React.FC<{icon?: IconName; title: string; sub?: string; right?: React.ReactNode; size?: number}> = ({
  icon,
  title,
  sub,
  right,
  size = 17,
}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
    {icon && (
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: 'rgba(240,96,35,0.15)',
          border: '1px solid rgba(240,96,35,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={18} color="#FF8A52" />
      </div>
    )}
    <div style={{flex: 1}}>
      <div style={font(size, 600)}>{title}</div>
      {sub && <div style={font(12.5, 500, C.textFaint, {marginTop: 2})}>{sub}</div>}
    </div>
    {right}
  </div>
);

export const Pill: React.FC<{
  text: string;
  tone?: 'orange' | 'yellow' | 'muted' | 'ok' | 'warn';
  dot?: boolean;
  size?: number;
  style?: React.CSSProperties;
}> = ({text, tone = 'muted', dot, size = 12, style}) => {
  const tones = {
    orange: ['rgba(240,96,35,0.16)', 'rgba(240,96,35,0.5)', '#FF8A52'],
    yellow: ['rgba(255,214,0,0.12)', 'rgba(255,214,0,0.45)', C.yellow],
    muted: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.14)', C.textDim],
    ok: ['rgba(255,214,0,0.10)', 'rgba(255,214,0,0.35)', '#FFE15C'],
    warn: ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.18)', 'rgba(255,255,255,0.55)'],
  }[tone];
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: `${size * 0.35}px ${size * 0.85}px`,
        borderRadius: 999,
        background: tones[0],
        border: `1px solid ${tones[1]}`,
        ...font(size, 600, tones[2], {letterSpacing: '0.02em', whiteSpace: 'nowrap'}),
        ...style,
      }}
    >
      {dot && <span style={{width: 6, height: 6, borderRadius: 6, background: tones[2]}} />}
      {text}
    </div>
  );
};

export const Avatar: React.FC<{initials: string; size?: number; hue?: number}> = ({initials, size = 32, hue = 0}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size,
      flexShrink: 0,
      background: [
        'linear-gradient(135deg, #F06023, #FF9A3D)',
        'linear-gradient(135deg, #3A3F4B, #5A606E)',
        'linear-gradient(135deg, #FFD600, #F6A21E)',
        'linear-gradient(135deg, #2A2E37, #474C58)',
      ][hue % 4],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...font(size * 0.36, 700, hue % 4 === 2 ? C.graphite : '#fff'),
    }}
  >
    {initials}
  </div>
);

/** Neutral placeholder line used sparingly for secondary copy. */
export const Skel: React.FC<{w: number | string; h?: number; o?: number}> = ({w, h = 8, o = 0.1}) => (
  <div style={{width: w, height: h, borderRadius: h, background: `rgba(255,255,255,${o})`}} />
);

/** A glass card wrapper with padding. */
export const Card: React.FC<{glow?: number; pad?: number; style?: React.CSSProperties; children?: React.ReactNode; blur?: boolean}> = ({
  glow = 0,
  pad = 22,
  style,
  children,
  blur,
}) => (
  <Glass glow={glow} blur={blur} style={{padding: pad, display: 'flex', flexDirection: 'column', ...style}}>
    {children}
  </Glass>
);

/** Desktop browser frame. */
export const Browser: React.FC<{url: string; glow?: number; children: React.ReactNode}> = ({url, glow = 0, children}) => (
  <Glass glow={glow} style={{display: 'flex', flexDirection: 'column'}}>
    <div
      style={{
        height: 46,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 18px',
        borderBottom: `1px solid ${C.hair}`,
        background: 'rgba(255,255,255,0.03)',
      }}
    >
      {['#FF6159', '#FFBD2E', '#2ACB42'].map((c) => (
        <span key={c} style={{width: 11, height: 11, borderRadius: 11, background: c, opacity: 0.75}} />
      ))}
      <div
        style={{
          marginLeft: 22,
          flex: 1,
          maxWidth: 420,
          height: 26,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 12px',
          ...font(12.5, 500, C.textDim),
        }}
      >
        <Icon name="lock" size={12} color={C.textFaint} />
        {url}
      </div>
    </div>
    <div style={{flex: 1, position: 'relative', overflow: 'hidden'}}>{children}</div>
  </Glass>
);

/** App sidebar used in dashboards. */
export const Sidebar: React.FC<{items: {icon: IconName; label: string}[]; active: number; delay: number; width?: number}> = ({
  items,
  active,
  delay,
  width = 210,
}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        width,
        height: '100%',
        borderRight: `1px solid ${C.hair}`,
        padding: '22px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        background: 'rgba(0,0,0,0.12)',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px 20px'}}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${C.orange}, ${C.yellow})`,
          }}
        />
        <Skel w={80} h={9} o={0.22} />
      </div>
      {items.map((it, i) => {
        const p = prog(f, delay + i * 3, 16);
        const on = i === active;
        return (
          <div
            key={it.label}
            style={{
              opacity: p,
              transform: `translateX(${(1 - p) * -14}px)`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 10,
              background: on ? 'rgba(240,96,35,0.14)' : 'transparent',
              position: 'relative',
              ...font(14, on ? 600 : 500, on ? '#fff' : C.textDim),
            }}
          >
            {on && (
              <div style={{position: 'absolute', left: -14, top: 8, bottom: 8, width: 3, borderRadius: 3, background: C.orange}} />
            )}
            <Icon name={it.icon} size={17} color={on ? '#FF8A52' : C.textFaint} />
            {it.label}
          </div>
        );
      })}
    </div>
  );
};

/** Pointer cursor with press state. */
export const Cursor: React.FC<{x: number; y: number; press?: number; opacity?: number}> = ({x, y, press = 0, opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      opacity,
      transform: `scale(${1 - press * 0.14})`,
      transformOrigin: '4px 4px',
      filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))',
      zIndex: 20,
    }}
  >
    <svg width={30} height={30} viewBox="0 0 24 24">
      <path d="M5 3.2l13.6 7.6-6 1.5-2.7 5.9z" fill="#fff" stroke={C.graphite} strokeWidth={1.2} strokeLinejoin="round" />
    </svg>
  </div>
);

/** Click ripple. */
export const Ripple: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 18);
  if (f < at) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 30,
        top: y - 30,
        width: 60,
        height: 60,
        borderRadius: 60,
        border: `2px solid ${C.yellow}`,
        transform: `scale(${0.3 + p * 1.2})`,
        opacity: 1 - p,
        zIndex: 19,
      }}
    />
  );
};

/** Wraps a scene: soft cross-dissolve with gentle depth on enter/exit. */
export const SceneShell: React.FC<{
  dur: number;
  fadeIn?: number;
  fadeOut?: number;
  children: React.ReactNode;
}> = ({dur, fadeIn = 16, fadeOut = 16, children}) => {
  const f = useCurrentFrame();
  const i = fadeIn > 0 ? tween(f, [0, fadeIn], [0, 1]) : 1;
  const o = fadeOut > 0 ? tween(f, [dur - fadeOut, dur], [1, 0]) : 1;
  const scale = (fadeIn > 0 ? 1.035 - 0.035 * i : 1) * (fadeOut > 0 ? 1 - 0.025 * (1 - o) : 1);
  const blur = (1 - i) * 10 + (1 - o) * 10;
  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(i, o),
        transform: `scale(${scale})`,
        filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
