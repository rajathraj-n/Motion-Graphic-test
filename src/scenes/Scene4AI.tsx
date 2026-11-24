import {useContent} from '../content';
import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {getPointAtLength, getLength} from '@remotion/paths';
import {Camera, Glass, Layer} from '../components/Stage';
import {LiveDot, smoothPath, toPoints} from '../components/Charts';
import {Counter, Kicker, MaskedText, Underline} from '../components/Text';
import {Icon} from '../components/Icons';
import {font, Pill} from '../components/UI';
import {C, EASE, EASE_IO, enter, keys, prog, tween} from '../theme';

const HIST = [30, 34, 31, 38, 36, 42, 40, 47, 45, 52, 50, 57];
const FORE = [57, 60, 63, 62, 67, 70];

/** Glowing AI core with rotating conic ring. */
const AICore: React.FC<{size: number; delay: number}> = ({size, delay}) => {
  const f = useCurrentFrame();
  const p = prog(f, delay, 26);
  const breathe = 0.5 + 0.5 * Math.sin(f / 18);
  return (
    <div style={{position: 'relative', width: size, height: size, transform: `scale(${0.6 + 0.4 * p})`, opacity: p}}>
      <div
        style={{
          position: 'absolute',
          inset: -size * 0.35,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(240,96,35,${0.35 + 0.15 * breathe}) 0%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `conic-gradient(from ${f * 3}deg, ${C.orange}, ${C.yellow}, rgba(240,96,35,0.1), ${C.orange})`,
          WebkitMask: 'radial-gradient(circle, transparent 62%, #000 64%)',
          mask: 'radial-gradient(circle, transparent 62%, #000 64%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: size * 0.16,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #2A2E37, #15171C)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="spark" size={size * 0.36} color="#FF8A52" stroke={1.5} />
      </div>
    </div>
  );
};

/** Trend chart: history, "now" marker, predictive dashed forecast with confidence band, streaming dots. */
const InsightChart: React.FC<{w: number; h: number; delay: number}> = ({w, h, delay}) => {
  const f = useCurrentFrame();
  const all = [...HIST, ...FORE.slice(1)];
  const min = 20;
  const max = 80;
  const pts = useMemo(() => toPoints(all, w, h, 10, min, max), [w, h]);
  const nowIdx = HIST.length - 1;
  const hist = pts.slice(0, nowIdx + 1);
  const fore = pts.slice(nowIdx);
  const dH = useMemo(() => smoothPath(hist), [hist]);
  const dF = useMemo(() => smoothPath(fore), [fore]);
  const lenH = useMemo(() => getLength(dH), [dH]);
  const pH = prog(f, delay, 55, EASE_IO);
  const pF = prog(f, delay + 55, 35, EASE_IO);
  const nowX = hist[hist.length - 1][0];

  const band = (sign: number) =>
    fore.map(([x, y], i) => [x, y + sign * (8 + i * 9)] as [number, number]);
  const up = band(-1);
  const dn = band(1).reverse();
  const dBand = `${smoothPath(up)} L ${dn[0][0]} ${dn[0][1]} ${smoothPath(dn).slice(1)} Z`;

  // streaming data points flowing along the history line
  const streams = [0, 0.25, 0.5, 0.75].map((ph) => {
    if (pH < 1) return null;
    const t = (((f - delay - 55) / 30) * 0.5 + ph) % 1;
    const pt = getPointAtLength(dH, lenH * t);
    return pt ? {x: pt.x, y: pt.y, o: Math.sin(t * Math.PI)} : null;
  });

  return (
    <svg width={w} height={h} style={{overflow: 'visible', display: 'block'}}>
      <defs>
        <linearGradient id="aiArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.orange} stopOpacity={0.32} />
          <stop offset="1" stopColor={C.orange} stopOpacity={0} />
        </linearGradient>
        <clipPath id="aiClipH">
          <rect x={-10} y={-20} width={nowX * pH + 10} height={h + 40} />
        </clipPath>
        <clipPath id="aiClipF">
          <rect x={nowX} y={-40} width={(w - nowX + 20) * pF} height={h + 80} />
        </clipPath>
      </defs>
      {[0.2, 0.4, 0.6, 0.8, 1].map((g) => (
        <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke="rgba(255,255,255,0.06)" />
      ))}
      <path d={`${dH} L ${nowX} ${h} L 0 ${h} Z`} fill="url(#aiArea)" clipPath="url(#aiClipH)" />
      <path
        d={dH}
        fill="none"
        stroke={C.orange}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeDasharray={`${lenH} ${lenH}`}
        strokeDashoffset={lenH * (1 - pH)}
        style={{filter: 'drop-shadow(0 0 8px rgba(240,96,35,0.7))'}}
      />
      <g clipPath="url(#aiClipF)">
        <path d={dBand} fill="rgba(255,214,0,0.10)" />
        <path d={dF} fill="none" stroke={C.yellow} strokeWidth={3} strokeDasharray="9 9" strokeLinecap="round" />
      </g>
      {/* now marker */}
      <g opacity={prog(f, delay + 50, 14)}>
        <line x1={nowX} x2={nowX} y1={0} y2={h} stroke="rgba(255,255,255,0.25)" strokeDasharray="4 6" />
        <rect x={nowX - 30} y={-30} width={60} height={22} rx={11} fill="rgba(255,255,255,0.1)" />
        <text x={nowX} y={-15} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={600} style={{fontFamily: 'inherit'}}>
          Now
        </text>
      </g>
      {hist.map(([x, y], i) => {
        const s = prog(f, delay + (i / nowIdx) * 55, 10);
        return <circle key={i} cx={x} cy={y} r={4.5 * s} fill={C.graphite} stroke={C.orange} strokeWidth={2} />;
      })}
      {streams.map((s, i) => (s ? <circle key={i} cx={s.x} cy={s.y} r={6} fill="#fff" opacity={s.o} style={{filter: `drop-shadow(0 0 8px ${C.orange})`}} /> : null))}
      {(() => {
        const [x, y] = fore[fore.length - 1];
        const s = prog(f, delay + 88, 14);
        return (
          <g transform={`translate(${x} ${y}) scale(${s})`}>
            <circle r={16} fill="rgba(255,214,0,0.18)" />
            <circle r={6} fill={C.yellow} />
          </g>
        );
      })()}
    </svg>
  );
};

export const Scene4AI: React.FC = () => {
  const f = useCurrentFrame();
  const t = useContent().s4;
  const D = 226;
  const ry = keys(f, [0, D], [-14, -6]);
  const rx = keys(f, [0, D], [6, 2]);
  const x = keys(f, [0, D], [60, 0]);
  const z = keys(f, [0, D], [-80, 30]);

  const applyAt = 168;
  const sel = prog(f, applyAt, 14);

  return (
    <AbsoluteFill>
      <Camera ry={ry} rx={rx} x={x} z={z} perspective={2000}>
        {/* main insights panel */}
        <Layer left={800} top={150} w={1000} h={580} style={enter(f, 6, 26)}>
          <Glass glow={0.55}>
            <div style={{padding: 28, display: 'flex', flexDirection: 'column', gap: 26, height: '100%'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                <AICore size={52} delay={10} />
                <div style={{flex: 1}}>
                  <div style={font(22, 600)}>AI Insights</div>
                  <div style={font(13, 500, C.textFaint)}>Trend analysis · Predictive forecast · Illustrative data</div>
                </div>
                <Pill text="Model active" tone="orange" dot />
                <div style={{display: 'flex', gap: 6}}>
                  {['7D', '30D', '90D'].map((t, i) => (
                    <div
                      key={t}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: i === 1 ? 'rgba(255,214,0,0.14)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${i === 1 ? 'rgba(255,214,0,0.5)' : C.hair}`,
                        ...font(12, 600, i === 1 ? C.yellow : C.textDim),
                      }}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display: 'flex', gap: 22, alignItems: 'center', ...font(13, 500, C.textDim)}}>
                <Legend color={C.orange} label="Observed" />
                <Legend color={C.yellow} label="Forecast" dashed />
                <Legend color="rgba(255,214,0,0.35)" label="Confidence range" block />
              </div>
              <div style={{paddingTop: 20}}>
                <InsightChart w={940} h={330} delay={20} />
              </div>
            </div>
          </Glass>
        </Layer>

        {/* recommendation card */}
        <Layer left={720} top={640} w={560} h={210} z={140} style={enter(f, 96, 24)}>
          <Glass glow={0.3 + 0.5 * sel}>
            <div style={{padding: 24, display: 'flex', flexDirection: 'column', gap: 14}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${C.orange}, ${C.yellow})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="spark" size={18} color={C.graphite} stroke={2} />
                </div>
                <div style={{...font(13, 600, '#FF8A52', {letterSpacing: '0.12em'}), flex: 1}}>RECOMMENDED ACTION</div>
                <Pill text="Auto-generated" tone="muted" size={11} />
              </div>
              <MaskedText
                text="Rebalance review capacity to clear the approval backlog."
                delay={106}
                stagger={2}
                size={19}
                weight={500}
                tracking="0"
                style={{whiteSpace: 'normal', lineHeight: 1.35}}
              />
              <div style={{display: 'flex', gap: 10}}>
                <div
                  style={{
                    padding: '9px 20px',
                    borderRadius: 9,
                    background: C.orange,
                    boxShadow: `0 0 0 ${3 * sel}px rgba(255,214,0,0.9), 0 0 ${24 * sel}px rgba(255,214,0,0.5)`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    ...font(13.5, 600, '#fff'),
                  }}
                >
                  {sel > 0.5 && <Icon name="check" size={15} color="#fff" stroke={2.4} />}
                  {sel > 0.5 ? 'Applied' : 'Apply'}
                </div>
                <div style={{padding: '9px 20px', borderRadius: 9, border: `1px solid ${C.hair2}`, ...font(13.5, 600, C.textDim)}}>
                  Review details
                </div>
              </div>
            </div>
          </Glass>
        </Layer>

        {/* floating metric cards */}
        <Layer left={1340} top={700} w={300} h={130} z={90} style={enter(f, 118, 22)}>
          <Glass>
            <div style={{padding: 20}}>
              <div style={font(12.5, 500, C.textFaint)}>Signals analyzed</div>
              <div style={{...font(34, 600), marginTop: 4}}>
                <Counter to={24860} delay={122} dur={60} />
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, ...font(12, 500, C.textDim)}}>
                <LiveDot size={7} /> streaming
              </div>
            </div>
          </Glass>
        </Layer>
        <Layer left={1420} top={30} w={290} h={110} z={120} style={enter(f, 132, 22)}>
          <Glass>
            <div style={{padding: 20, display: 'flex', gap: 14, alignItems: 'center'}}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(255,214,0,0.12)',
                  border: '1px solid rgba(255,214,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="trend" size={22} color={C.yellow} />
              </div>
              <div>
                <div style={font(12.5, 500, C.textFaint)}>Patterns detected</div>
                <div style={font(28, 600)}>
                  <Counter to={12} delay={136} dur={40} />
                </div>
              </div>
            </div>
          </Glass>
        </Layer>
      </Camera>

      {/* left column copy */}
      <div style={{position: 'absolute', left: 120, top: 330, display: 'flex', flexDirection: 'column', gap: 18}}>
        <Kicker text={t.kicker} delay={14} />
        <MaskedText text={t.line1} delay={20} size={70} weight={700} tracking="0.03em" />
        <MaskedText text={t.line2} delay={26} size={70} weight={700} tracking="0.03em" gradient />
        <Underline delay={40} width={180} />
        <div
          style={{
            ...font(24, 500, C.textDim, {lineHeight: 1.45}),
            width: 520,
            marginTop: 10,
            opacity: prog(f, 48, 24),
            transform: `translateY(${(1 - prog(f, 48, 24, EASE)) * 14}px)`,
          }}
        >
          {t.sub1}
          <br />
          <span style={{color: '#fff', fontWeight: 600}}>{t.sub2}</span>
        </div>
      </div>

      {/* subtle edge light */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(90deg, transparent 60%, rgba(240,96,35,${0.06 + 0.04 * Math.sin(f / 25)}) 100%)`,
          opacity: tween(f, [0, 30], [0, 1]),
        }}
      />
    </AbsoluteFill>
  );
};

const Legend: React.FC<{color: string; label: string; dashed?: boolean; block?: boolean}> = ({color, label, dashed, block}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
    {block ? (
      <span style={{width: 18, height: 10, borderRadius: 3, background: color}} />
    ) : (
      <span
        style={{
          width: 22,
          height: 0,
          borderTop: `3px ${dashed ? 'dashed' : 'solid'} ${color}`,
        }}
      />
    )}
    {label}
  </div>
);
