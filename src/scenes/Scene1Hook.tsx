import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Camera, Glass, Layer} from '../components/Stage';
import {Connector, LineChart, Bars, LiveDot} from '../components/Charts';
import {MaskedText} from '../components/Text';
import {font, PanelHeader, Pill} from '../components/UI';
import {C, EASE_IO, keys, prog, tween} from '../theme';

const HUB = {x: 960, y: 520};

const TRAILS = [
  'M -80 160 C 360 120, 560 470, 960 520',
  'M 2000 230 C 1560 260, 1320 560, 960 520',
  'M 300 1160 C 520 820, 760 700, 960 520',
  'M 1700 1160 C 1460 860, 1180 720, 960 520',
];

const NODES: [number, number, number][] = [
  [520, 330, 14],
  [1390, 380, 18],
  [700, 760, 22],
  [1270, 790, 26],
  [300, 520, 30],
  [1640, 610, 32],
];

const LINKS: [number, number][] = [
  [0, 4],
  [1, 5],
  [0, 2],
  [1, 3],
  [2, 3],
];

export const Scene1Hook: React.FC = () => {
  const f = useCurrentFrame();

  // Elegant camera push-in across the scene.
  const camZ = keys(f, [0, 158], [-60, 170], EASE_IO);
  const camRy = keys(f, [0, 158], [4, -2], EASE_IO);
  const camRx = keys(f, [0, 158], [3, 0], EASE_IO);

  // Bass impact on "OPPORTUNITY".
  const IMPACT = 74;
  const impact = prog(f, IMPACT, 26);
  const bump = f >= IMPACT ? Math.sin(Math.min(1, (f - IMPACT) / 14) * Math.PI) * 0.012 : 0;

  const lineDim = tween(f, [40, 70], [1, 0.32]);
  const hubOn = prog(f, 26, 16);

  const panel = (i: number) => prog(f, 34 + i * 6, 26);

  return (
    <AbsoluteFill style={{transform: `scale(${1 + bump})`}}>
      <Camera z={camZ} ry={camRy} rx={camRx}>
        {/* Floating glass panels at depth */}
        <Layer left={90} top={150} w={430} h={290} z={-380} ry={22} style={{opacity: panel(0)}}>
          <Glass glow={0.25}>
            <div style={{padding: 22}}>
              <PanelHeader icon="trend" title="Signals" sub="Live stream" right={<LiveDot />} />
              <div style={{marginTop: 26}}>
                <LineChart data={[12, 18, 14, 22, 19, 28, 25, 34, 31, 40]} w={386} h={150} delay={40} dur={50} />
              </div>
            </div>
          </Glass>
        </Layer>
        <Layer left={1400} top={160} w={430} h={300} z={-380} ry={-22} style={{opacity: panel(1)}}>
          <Glass glow={0.25}>
            <div style={{padding: 22, display: 'flex', flexDirection: 'column', gap: 14}}>
              <PanelHeader icon="flow" title="Systems" sub="Connected services" />
              {['Platform', 'Data layer', 'Workflows', 'Insights'].map((t, i) => (
                <div key={t} style={{display: 'flex', alignItems: 'center', gap: 12, opacity: prog(f, 50 + i * 5, 14)}}>
                  <span style={{width: 8, height: 8, borderRadius: 8, background: i < 2 ? C.orange : C.yellow}} />
                  <span style={font(14, 500, C.textDim)}>{t}</span>
                  <div style={{flex: 1, height: 1, background: C.hair}} />
                  <Pill text="Linked" tone={i < 2 ? 'orange' : 'yellow'} size={11} />
                </div>
              ))}
            </div>
          </Glass>
        </Layer>
        <Layer left={760} top={40} w={400} h={200} z={-700} style={{opacity: panel(2) * 0.9}}>
          <Glass>
            <div style={{padding: 20}}>
              <PanelHeader icon="chart" title="Throughput" size={15} />
              <div style={{marginTop: 18}}>
                <Bars data={[5, 8, 6, 9, 7, 11, 10, 13, 12, 15]} w={360} h={90} delay={52} />
              </div>
            </div>
          </Glass>
        </Layer>

        {/* Orange light trails converging into a digital network */}
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: lineDim}}>
          {LINKS.map(([a, b], i) => {
            const [x1, y1] = NODES[a];
            const [x2, y2] = NODES[b];
            return (
              <Connector
                key={`l${i}`}
                d={`M ${x1} ${y1} L ${x2} ${y2}`}
                delay={30 + i * 4}
                dur={22}
                width={1.2}
                color="rgba(240,96,35,0.6)"
                glow={false}
              />
            );
          })}
          {NODES.map(([x, y, d], i) => {
            const [hx, hy] = [HUB.x, HUB.y];
            return (
              <Connector
                key={`h${i}`}
                d={`M ${x} ${y} Q ${(x + hx) / 2} ${(y + hy) / 2 - 60} ${hx} ${hy}`}
                delay={d + 10}
                dur={24}
                width={1}
                color="rgba(255,255,255,0.22)"
                glow={false}
              />
            );
          })}
          {TRAILS.map((d, i) => (
            <Connector key={`t${i}`} d={d} delay={i * 5} dur={34} width={3} pulses={[0, 0.5]} speed={0.45} />
          ))}
          {NODES.map(([x, y, d], i) => {
            const s = prog(f, d + 4, 14);
            return (
              <g key={`n${i}`} transform={`translate(${x} ${y}) scale(${s})`}>
                <circle r={16} fill="rgba(240,96,35,0.12)" />
                <circle r={5.5} fill={i % 2 ? C.yellow : C.orange} />
              </g>
            );
          })}
          <g transform={`translate(${HUB.x} ${HUB.y}) scale(${hubOn})`}>
            <circle r={70} fill="url(#hubGlow)" />
            <circle r={10} fill="#fff" />
            <circle r={22} fill="none" stroke={C.orange} strokeWidth={2} opacity={0.8} />
          </g>
          <defs>
            <radialGradient id="hubGlow">
              <stop offset="0" stopColor={C.orange} stopOpacity={0.55} />
              <stop offset="1" stopColor={C.orange} stopOpacity={0} />
            </radialGradient>
          </defs>
        </svg>
      </Camera>

      {/* Impact ring */}
      {f >= IMPACT && (
        <div
          style={{
            position: 'absolute',
            left: 960 - 400,
            top: 540 - 400,
            width: 800,
            height: 800,
            borderRadius: '50%',
            border: `2px solid ${C.orange}`,
            transform: `scale(${0.2 + impact * 1.6})`,
            opacity: (1 - impact) * 0.6,
            boxShadow: `0 0 60px ${C.orangeGlow}`,
          }}
        />
      )}
      <AbsoluteFill
        style={{
          background: `radial-gradient(40% 35% at 50% 50%, rgba(240,96,35,${0.28 * Math.sin(Math.min(1, impact * 1.6) * Math.PI)}) 0%, transparent 100%)`,
        }}
      />

      {/* Kinetic typography */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 34,
            padding: '26px 48px',
            background: `radial-gradient(closest-side, rgba(17,19,24,${0.75 * prog(f, 44, 20)}), transparent)`,
          }}
        >
          <MaskedText text="COMPLEXITY" delay={48} size={88} weight={600} tracking="0.05em" />
          <Arrow delay={62} />
          <MaskedText text="OPPORTUNITY" delay={IMPACT - 4} size={88} weight={700} tracking="0.05em" gradient />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Arrow: React.FC<{delay: number}> = ({delay}) => {
  const f = useCurrentFrame();
  const p = prog(f, delay, 16);
  const h = prog(f, delay + 8, 12);
  return (
    <svg width={120} height={40} viewBox="0 0 120 40" style={{overflow: 'visible'}}>
      <line x1={4} y1={20} x2={4 + 106 * p} y2={20} stroke={C.orange} strokeWidth={4} strokeLinecap="round" />
      <path
        d="M 96 8 L 112 20 L 96 32"
        fill="none"
        stroke={C.orange}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={h}
        transform={`translate(${(1 - h) * -10} 0)`}
      />
    </svg>
  );
};
