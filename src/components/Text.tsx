import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, EASE, FONT, prog} from '../theme';

export const gradientText: React.CSSProperties = {
  backgroundImage: `linear-gradient(90deg, ${C.orange} 0%, #F68A1E 55%, ${C.yellow} 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

/** Masked kinetic typography: each word slides up from behind a mask. */
export const MaskedText: React.FC<{
  text: string;
  delay: number;
  stagger?: number;
  dur?: number;
  size: number;
  weight?: number;
  color?: string;
  tracking?: string;
  gradient?: boolean;
  style?: React.CSSProperties;
  wordStyle?: (i: number) => React.CSSProperties;
}> = ({
  text,
  delay,
  stagger = 4,
  dur = 22,
  size,
  weight = 600,
  color = C.text,
  tracking = '0.02em',
  gradient,
  style,
  wordStyle,
}) => {
  const f = useCurrentFrame();
  const words = text.split(' ');
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: tracking,
        lineHeight: 1.08,
        color,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = prog(f, delay + i * stagger, dur, EASE);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              overflow: 'hidden',
              verticalAlign: 'top',
              padding: '0.06em 0.02em 0.12em',
              marginRight: i < words.length - 1 ? '0.26em' : 0,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - p) * 115}%)`,
                ...(gradient ? gradientText : {}),
                ...wordStyle?.(i),
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Small letter-spaced orange label with a leading line. */
export const Kicker: React.FC<{text: string; delay: number; style?: React.CSSProperties; color?: string}> = ({
  text,
  delay,
  style,
  color = C.orange,
}) => {
  const f = useCurrentFrame();
  const p = prog(f, delay, 20);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: 17,
        letterSpacing: '0.28em',
        color,
        ...style,
      }}
    >
      <div style={{width: 36 * p, height: 2, background: color, borderRadius: 2}} />
      <div style={{opacity: p, transform: `translateX(${(1 - p) * -12}px)`}}>{text}</div>
    </div>
  );
};

/** Orange underline drawing left → right. */
export const Underline: React.FC<{delay: number; width: number; dur?: number; style?: React.CSSProperties; height?: number}> = ({
  delay,
  width,
  dur = 22,
  style,
  height = 4,
}) => {
  const f = useCurrentFrame();
  const p = prog(f, delay, dur);
  return (
    <div
      style={{
        width: width * p,
        height,
        borderRadius: height,
        background: `linear-gradient(90deg, ${C.orange}, ${C.yellow})`,
        boxShadow: `0 0 18px ${C.orangeGlow}`,
        ...style,
      }}
    />
  );
};

/** Animated number. */
export const Counter: React.FC<{
  to: number;
  delay: number;
  dur?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
}> = ({to, delay, dur = 40, decimals = 0, prefix = '', suffix = '', style}) => {
  const f = useCurrentFrame();
  const v = to * prog(f, delay, dur, EASE);
  const s = v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
  return (
    <span style={{fontVariantNumeric: 'tabular-nums', ...style}}>
      {prefix}
      {s}
      {suffix}
    </span>
  );
};
