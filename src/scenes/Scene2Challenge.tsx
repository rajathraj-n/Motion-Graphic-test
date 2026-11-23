import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {Camera, Glass, Layer} from '../components/Stage';
import {Bars, ProgressBar} from '../components/Charts';
import {Kicker} from '../components/Text';
import {Icon} from '../components/Icons';
import {font, PanelHeader, Pill} from '../components/UI';
import {C, EASE_IO, FONT, keys, prog, tween} from '../theme';

/* ---------- Fragmented interface cards (re-used by Scene 3) ---------- */

export const AnalyticsCard: React.FC<{delay?: number}> = ({delay = 0}) => (
  <div style={{padding: 24, display: 'flex', flexDirection: 'column', height: '100%', gap: 18}}>
    <PanelHeader icon="chart" title="Revenue Analytics" sub="Source: spreadsheet export" right={<Pill text="Out of sync" tone="warn" dot />} />
    <div style={{display: 'flex', gap: 26}}>
      {[
        ['Region A', '—'],
        ['Region B', '—'],
        ['Region C', '—'],
      ].map(([k, v]) => (
        <div key={k}>
          <div style={font(12, 500, C.textFaint)}>{k}</div>
          <div style={font(22, 600, C.textDim)}>{v}</div>
        </div>
      ))}
    </div>
    <div style={{flex: 1, display: 'flex', alignItems: 'flex-end'}}>
      <Bars data={[6, 9, 7, 11, 8, 12, 10, 13, 9, 14]} w={470} h={150} delay={delay + 8} missing={[3, 4, 7]} />
    </div>
  </div>
);

const TASKS: [string, string, 'orange' | 'warn' | 'muted' | 'yellow', number][] = [
  ['Requirements sign-off', 'Waiting', 'yellow', 0.7],
  ['API handoff', 'Blocked', 'orange', 0.35],
  ['QA review', 'Pending', 'warn', 0.15],
  ['Release prep', 'Not started', 'muted', 0.04],
];

export const TasksCard: React.FC<{delay?: number}> = ({delay = 0}) => (
  <div style={{padding: 24, display: 'flex', flexDirection: 'column', gap: 16}}>
    <PanelHeader icon="tasks" title="Project Tasks" sub="4 open · 2 owners unassigned" />
    {TASKS.map(([t, s, tone, v], i) => (
      <div
        key={t}
        style={{
          padding: '12px 14px',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.035)',
          border: `1px solid ${C.hair}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 9,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 5,
              border: `1.5px dashed ${i === 1 ? C.orange : 'rgba(255,255,255,0.3)'}`,
            }}
          />
          <div style={{...font(14, 500), flex: 1}}>{t}</div>
          <Pill text={s} tone={tone} size={11} />
        </div>
        <ProgressBar value={v} delay={delay + 10 + i * 4} color={i === 1 ? C.orange : 'rgba(255,255,255,0.35)'} h={4} />
      </div>
    ))}
  </div>
);

const ROWS = [
  ['A-1042', 'North', 'Active', '—'],
  ['A-1043', '—', 'Active', 'J. Lee'],
  ['A-1042', 'North', '?', '—'],
  ['A-1051', 'West', 'Lapsed', 'M. Ortiz'],
  ['—', 'East', 'Active', '—'],
];

export const TableCard: React.FC<{delay?: number}> = ({delay = 0}) => {
  const f = useCurrentFrame();
  return (
    <div style={{padding: 24, display: 'flex', flexDirection: 'column', gap: 14}}>
      <PanelHeader icon="database" title="Customer Records" sub="3 duplicate IDs detected" right={<Pill text="Manual" tone="muted" />} />
      <div style={{display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr 1fr', ...font(12, 600, C.textFaint, {letterSpacing: '0.08em'}), padding: '6px 10px'}}>
        <div>ACCOUNT</div>
        <div>REGION</div>
        <div>STATUS</div>
        <div>OWNER</div>
      </div>
      {ROWS.map((r, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr 1fr 1fr',
            padding: '9px 10px',
            borderRadius: 8,
            background: i === 2 ? 'rgba(240,96,35,0.10)' : i % 2 ? 'rgba(255,255,255,0.03)' : 'transparent',
            border: i === 2 ? '1px dashed rgba(240,96,35,0.45)' : '1px solid transparent',
            opacity: prog(f, delay + 6 + i * 3, 14),
            ...font(13.5, 500, C.textDim),
          }}
        >
          {r.map((c, j) => (
            <div key={j} style={{color: c === '—' || c === '?' ? C.textFaint : undefined}}>
              {c}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

/* ---------- Scene ---------- */

const CHIPS = ['CRM', 'ERP', 'CSV', 'Email', 'Sheets', 'Tickets', 'Chat', 'PDF', 'API', 'Legacy DB'];

const BrokenLink: React.FC<{x1: number; y1: number; x2: number; y2: number; at: number}> = ({x1, y1, x2, y2, at}) => {
  const f = useCurrentFrame();
  const draw = prog(f, 4, 18, EASE_IO);
  const brk = prog(f, at, 30, EASE_IO);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  // Each half retracts toward its own end, opening a gap in the middle.
  const half = (ax: number, ay: number, bx: number, by: number) => {
    const t = draw * (1 - 0.75 * brk);
    return {x: ax + (bx - ax) * t, y: ay + (by - ay) * t};
  };
  const a = half(x1, y1, mx, my);
  const b = half(x2, y2, mx, my);
  const col = brk > 0.5 ? 'rgba(255,255,255,0.28)' : C.orange;
  return (
    <g>
      <line x1={x1} y1={y1} x2={a.x} y2={a.y} stroke={col} strokeWidth={2.5} strokeLinecap="round" strokeDasharray={brk > 0.5 ? '6 8' : undefined} />
      <line x1={x2} y1={y2} x2={b.x} y2={b.y} stroke={col} strokeWidth={2.5} strokeLinecap="round" strokeDasharray={brk > 0.5 ? '6 8' : undefined} />
      <circle cx={x1} cy={y1} r={5} fill={C.orange} />
      <circle cx={x2} cy={y2} r={5} fill={C.orange} />
      {brk > 0.2 && (
        <g transform={`translate(${mx} ${my})`} opacity={tween(brk, [0.2, 0.7], [0, 1])}>
          <circle r={15} fill={C.graphite2} stroke="rgba(255,255,255,0.25)" />
          <path d="M -5 -5 L 5 5 M 5 -5 L -5 5" stroke={C.textDim} strokeWidth={2} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

const ChallengeChip: React.FC<{text: string; delay: number; x: number; y: number}> = ({text, delay, x, y}) => {
  const f = useCurrentFrame();
  const p = prog(f, delay, 22);
  const float = Math.sin((f + delay * 3) / 28) * 4;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + float,
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px) scale(${0.94 + 0.06 * p})`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '16px 26px',
          borderRadius: 999,
          background: 'rgba(17,19,24,0.82)',
          border: '1px solid rgba(240,96,35,0.5)',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6), 0 0 30px rgba(240,96,35,0.18)',
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 24,
          letterSpacing: '0.14em',
          color: '#fff',
        }}
      >
        <span style={{width: 10, height: 10, borderRadius: 10, background: C.orange, boxShadow: `0 0 12px ${C.orange}`}} />
        {text}
      </div>
    </div>
  );
};

export const Scene2Challenge: React.FC = () => {
  const f = useCurrentFrame();
  const D = 196;
  const camX = keys(f, [0, D], [90, -90]);
  const camRy = keys(f, [0, D], [-5, 5]);

  // Panels drift apart into separate depth layers after the links break.
  const drift = prog(f, 40, 140, EASE_IO);

  return (
    <AbsoluteFill>
      <Camera x={camX} ry={camRy} rx={4}>
        {/* floating data chips */}
        {CHIPS.map((c, i) => {
          const x = 120 + random(`cx${i}`) * 1680;
          const y = 120 + random(`cy${i}`) * 840;
          const z = -500 + random(`cz${i}`) * 400;
          const dx = (random(`dx${i}`) - 0.5) * 120 * drift;
          const dy = (random(`dy${i}`) - 0.5) * 80 * drift + Math.sin((f + i * 20) / 30) * 6;
          return (
            <Layer key={c} left={x + dx} top={y + dy} w={120} h={36} z={z} style={{opacity: prog(f, 6 + i * 3, 20) * 0.55}}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 14px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${C.hair2}`,
                  ...font(14, 600, C.textDim),
                }}
              >
                <Icon name="folder" size={14} color={C.textFaint} />
                {c}
              </div>
            </Layer>
          );
        })}

        <Layer
          left={130}
          top={200}
          w={540}
          h={360}
          x={-70 * drift}
          y={-30 * drift}
          z={-260 * drift}
          rz={-3 * drift}
          ry={8 * drift}
          style={{opacity: prog(f, 2, 20)}}
        >
          <Glass>
            <AnalyticsCard delay={0} />
          </Glass>
        </Layer>
        <Layer
          left={720}
          top={330}
          w={500}
          h={410}
          y={40 * drift}
          z={160 * drift}
          rz={2 * drift}
          style={{opacity: prog(f, 7, 20)}}
        >
          <Glass>
            <TasksCard delay={6} />
          </Glass>
        </Layer>
        <Layer
          left={1270}
          top={190}
          w={540}
          h={370}
          x={80 * drift}
          y={-20 * drift}
          z={-380 * drift}
          rz={4 * drift}
          ry={-10 * drift}
          style={{opacity: prog(f, 12, 20)}}
        >
          <Glass>
            <TableCard delay={12} />
          </Glass>
        </Layer>

        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <BrokenLink x1={670} y1={420} x2={720} y2={520} at={32} />
          <BrokenLink x1={1220} y1={500} x2={1270} y2={400} at={40} />
          <BrokenLink x1={400} y1={560} x2={720} y2={680} at={48} />
        </svg>
      </Camera>

      <Kicker text="THE CHALLENGE" delay={4} style={{position: 'absolute', left: 120, top: 86}} />

      <ChallengeChip text="SCATTERED DATA" delay={40} x={170} y={700} />
      <ChallengeChip text="SLOW HANDOFFS" delay={58} x={740} y={860} />
      <ChallengeChip text="DISCONNECTED TOOLS" delay={76} x={1250} y={680} />
    </AbsoluteFill>
  );
};
