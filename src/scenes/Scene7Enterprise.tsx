import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {Camera, Glass, Layer} from '../components/Stage';
import {Connector, LineChart, Ring} from '../components/Charts';
import {Icon} from '../components/Icons';
import {font} from '../components/UI';
import {C, EASE, FONT, keys, prog} from '../theme';

const PW = 500;
const PH = 520;
const PY = 290;
const PX = [180, 710, 1240];
// ~118 BPM → one beat ≈ 15.25 frames; panels land on every second beat.
const BEAT = 15.25;
const LAND = [10, 10 + BEAT * 2.5, 10 + BEAT * 5];

const CheckRow: React.FC<{text: string; at: number}> = ({text, at}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 14);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, opacity: 0.3 + 0.7 * p, ...font(15, 500, C.textDim)}}>
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 24,
          background: `rgba(240,96,35,${0.18 * p})`,
          border: `1.5px solid ${p > 0.5 ? C.orange : 'rgba(255,255,255,0.2)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{transform: `scale(${p})`}}>
          <Icon name="check" size={14} color="#FF8A52" stroke={2.6} />
        </div>
      </div>
      {text}
    </div>
  );
};

const PanelTitle: React.FC<{word: string; sub: string}> = ({word, sub}) => (
  <div>
    <div style={font(30, 700, '#fff', {letterSpacing: '0.08em'})}>{word}</div>
    <div style={font(14, 500, C.textFaint, {marginTop: 4})}>{sub}</div>
  </div>
);

const SecurePanel: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const draw = prog(f, d + 4, 30);
  return (
    <div style={{padding: 30, display: 'flex', flexDirection: 'column', gap: 26, height: '100%'}}>
      <div style={{height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
        <div
          style={{
            position: 'absolute',
            width: 190,
            height: 190,
            borderRadius: '50%',
            background: `conic-gradient(from ${f * 4}deg, rgba(240,96,35,0.55), transparent 30%, transparent)`,
            WebkitMask: 'radial-gradient(circle, transparent 66%, #000 67%)',
            mask: 'radial-gradient(circle, transparent 66%, #000 67%)',
            opacity: draw,
          }}
        />
        <div style={{position: 'absolute', width: 190, height: 190, borderRadius: '50%', border: `1px solid ${C.hair2}`}} />
        <div style={{position: 'absolute', width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,96,35,0.25), transparent 70%)', opacity: draw}} />
        <Icon name="shield" size={96} color="#FF8A52" stroke={1.3} draw={draw} />
      </div>
      <PanelTitle word="SECURE" sub="Security built into every layer" />
      <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
        <CheckRow text="Identity & access control" at={d + 22} />
        <CheckRow text="Encryption in transit & at rest" at={d + 28} />
        <CheckRow text="Continuous monitoring" at={d + 34} />
      </div>
    </div>
  );
};

const SCALE_NODES: [number, number][] = [
  [-150, -50],
  [-120, 60],
  [0, -85],
  [0, 85],
  [120, 60],
  [150, -50],
];

const ScalablePanel: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const cx = 220;
  const cy = 105;
  return (
    <div style={{padding: 30, display: 'flex', flexDirection: 'column', gap: 26, height: '100%'}}>
      <div style={{height: 210, position: 'relative'}}>
        <svg width={440} height={210} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {SCALE_NODES.map(([x, y], i) => (
            <Connector key={i} d={`M ${cx} ${cy} L ${cx + x} ${cy + y}`} delay={d + 8 + i * 3} dur={14} width={2} glow={false} pulses={[i / 6]} speed={0.8} />
          ))}
          {SCALE_NODES.map(([x, y], i) => {
            const s = prog(f, d + 18 + i * 3, 14);
            return (
              <g key={`n${i}`} transform={`translate(${cx + x} ${cy + y}) scale(${s})`}>
                <rect x={-22} y={-16} width={44} height={32} rx={8} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.22)" />
                <circle cx={-10} cy={0} r={3} fill={i % 2 ? C.yellow : C.orange} />
                <rect x={-3} y={-2} width={16} height={4} rx={2} fill="rgba(255,255,255,0.35)" />
              </g>
            );
          })}
        </svg>
        <div
          style={{
            position: 'absolute',
            left: cx - 44,
            top: cy - 44,
            width: 88,
            height: 88,
            borderRadius: 24,
            background: 'linear-gradient(145deg, rgba(240,96,35,0.35), rgba(240,96,35,0.1))',
            border: '1px solid rgba(240,96,35,0.6)',
            boxShadow: '0 0 40px rgba(240,96,35,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${prog(f, d + 2, 18)})`,
          }}
        >
          <Icon name="cloud" size={48} color="#fff" stroke={1.5} />
        </div>
      </div>
      <PanelTitle word="SCALABLE" sub="Cloud architecture that grows with you" />
      <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
        <CheckRow text="Cloud-native services" at={d + 22} />
        <CheckRow text="Elastic, auto-scaling capacity" at={d + 28} />
        <CheckRow text="Resilient by design" at={d + 34} />
      </div>
    </div>
  );
};

const ResultsPanel: React.FC<{d: number}> = ({d}) => (
  <div style={{padding: 30, display: 'flex', flexDirection: 'column', gap: 26, height: '100%'}}>
    <div style={{height: 210, display: 'flex', alignItems: 'center', gap: 20}}>
      <Ring size={150} value={0.82} delay={d + 4} dur={40} stroke={12} color={C.orange}>
        <Icon name="gauge" size={50} color={C.yellow} stroke={1.6} />
      </Ring>
      <div style={{flex: 1}}>
        <LineChart data={[10, 14, 12, 18, 17, 24, 23, 30, 34]} w={230} h={150} delay={d + 8} dur={40} color={C.yellow} grid={false} />
      </div>
    </div>
    <PanelTitle word="RESULTS-DRIVEN" sub="Outcomes measured against your goals" />
    <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
      <CheckRow text="Clear success metrics" at={d + 22} />
      <CheckRow text="Performance visibility" at={d + 28} />
      <CheckRow text="Continuous improvement" at={d + 34} />
    </div>
  </div>
);

export const Scene7Enterprise: React.FC = () => {
  const f = useCurrentFrame();
  // Beat-synced camera: focus each panel, then pull back to the unified grid.
  const t = [0, LAND[0] + 12, LAND[1] - 4, LAND[1] + 12, LAND[2] - 4, LAND[2] + 14, 140, 196];
  const camX = keys(f, t, [650, 660, 0, 0, -660, -660, 0, 0]);
  const camS = keys(f, t, [1.3, 1.25, 1.25, 1.25, 1.25, 1.25, 1, 1.02]);
  const camRy = keys(f, t, [8, 6, 0, 0, -6, -6, 0, 0]);

  const settle = prog(f, 120, 30);

  // Expanding background network
  const net = Array.from({length: 22}, (_, i) => {
    const a = random(`a${i}`) * Math.PI * 2;
    const r = 300 + random(`r${i}`) * 700;
    return [960 + Math.cos(a) * r * 1.3, 560 + Math.sin(a) * r * 0.7] as [number, number];
  });

  const words = ['SECURE.', 'SCALABLE.', 'RESULTS-DRIVEN.'];

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 0.55}}>
        {net.map(([x, y], i) => (
          <Connector key={i} d={`M 960 560 L ${x} ${y}`} delay={4 + i * 2} dur={40} width={1} color="rgba(240,96,35,0.35)" glow={false} pulses={i % 3 === 0 ? [random(`p${i}`)] : []} speed={0.35} pulseColor={C.orange} />
        ))}
        {net.map(([x, y], i) => (
          <circle key={`c${i}`} cx={x} cy={y} r={3 * prog(f, 30 + i * 2, 12)} fill={i % 4 === 0 ? C.yellow : C.orange} opacity={0.7} />
        ))}
      </svg>

      <Camera x={camX} scale={camS} ry={camRy} perspective={2200} y={20}>
        {[SecurePanel, ScalablePanel, ResultsPanel].map((P, i) => {
          const land = prog(f, LAND[i] - 14, 26, EASE);
          return (
            <Layer
              key={i}
              left={PX[i]}
              top={PY}
              w={PW}
              h={PH}
              z={-700 * (1 - land)}
              ry={(1 - land) * (i === 2 ? -55 : 55)}
              x={(1 - land) * (i - 1) * 140}
              style={{opacity: land}}
            >
              <Glass glow={0.25 + 0.6 * settle * (0.75 + 0.25 * Math.sin(f / 10 + i))}>
                <P d={LAND[i] - 10} />
              </Glass>
            </Layer>
          );
        })}
      </Camera>

      <div style={{position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center', gap: 30}}>
        {words.map((w, i) => {
          const p = prog(f, LAND[i] - 2, 18);
          return (
            <div key={w} style={{overflow: 'hidden', padding: '4px 2px 10px'}}>
              <div
                style={{
                  transform: `translateY(${(1 - p) * 110}%)`,
                  fontFamily: FONT,
                  fontSize: 62,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  color: i === 2 ? undefined : '#fff',
                  ...(i === 2
                    ? {
                        backgroundImage: `linear-gradient(90deg, ${C.orange}, ${C.yellow})`,
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                      }
                    : {}),
                }}
              >
                {w}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
