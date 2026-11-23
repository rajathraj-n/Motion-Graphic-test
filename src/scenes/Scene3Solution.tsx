import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Camera, Glass, Layer} from '../components/Stage';
import {Connector, LineChart, LiveDot, ProgressBar} from '../components/Charts';
import {Kicker, MaskedText, Underline} from '../components/Text';
import {Icon, IconName} from '../components/Icons';
import {Avatar, font, Pill, Sidebar} from '../components/UI';
import {C, EASE_IO, enter, keys, prog, tween} from '../theme';
import {AnalyticsCard, TableCard, TasksCard} from './Scene2Challenge';

const DASH = {left: 250, top: 250, w: 1420, h: 760};

const STEPS: {icon: IconName; title: string; status: string; v: number}[] = [
  {icon: 'search', title: 'Discover', status: 'Complete', v: 1},
  {icon: 'grid', title: 'Design', status: 'Complete', v: 1},
  {icon: 'settings', title: 'Build', status: 'In progress', v: 0.68},
  {icon: 'bolt', title: 'Deliver', status: 'Scheduled', v: 0.22},
];

export const MainDashboard: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const cardW = 248;
  const gap = 46;
  const x0 = 30;
  const cy = 75;
  return (
    <div style={{display: 'flex', height: '100%'}}>
      <Sidebar
        delay={d + 6}
        active={0}
        items={[
          {icon: 'home', label: 'Overview'},
          {icon: 'tasks', label: 'Projects'},
          {icon: 'database', label: 'Data'},
          {icon: 'flow', label: 'Automation'},
          {icon: 'spark', label: 'Insights'},
          {icon: 'settings', label: 'Settings'},
        ]}
      />
      <div style={{flex: 1, padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: 22}}>
        {/* top bar */}
        <div style={{display: 'flex', alignItems: 'center', gap: 16, ...enter(f, d + 8, 18)}}>
          <div style={{flex: 1}}>
            <div style={font(13, 500, C.textFaint)}>Workspace</div>
            <div style={font(24, 600)}>Operations Overview</div>
          </div>
          <div
            style={{
              width: 260,
              height: 38,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${C.hair}`,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0 14px',
              ...font(13, 500, C.textFaint),
            }}
          >
            <Icon name="search" size={15} color={C.textFaint} />
            Search
          </div>
          <Pill text="All systems connected" tone="orange" dot />
          <Avatar initials="IT" size={38} />
        </div>

        {/* process cards with continuous connectors */}
        <div style={{position: 'relative', height: 150}}>
          <svg width={1160} height={150} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            {STEPS.slice(0, -1).map((_, i) => {
              const xa = x0 + i * (cardW + gap) + cardW - 30;
              const xb = x0 + (i + 1) * (cardW + gap) - 30;
              return (
                <Connector
                  key={i}
                  d={`M ${xa} ${cy} L ${xb} ${cy}`}
                  delay={d + 26 + i * 8}
                  dur={14}
                  width={3}
                  pulses={[0, 0.5]}
                  speed={1.2}
                />
              );
            })}
          </svg>
          {/* yellow pulse sweeping across the whole workflow */}
          {f > d + 60 && (
            <div
              style={{
                position: 'absolute',
                top: cy - 40,
                height: 80,
                width: 160,
                left: -30 + ((((f - d - 60) % 60) / 60) * 1220),
                background: 'radial-gradient(closest-side, rgba(255,214,0,0.28), transparent)',
                pointerEvents: 'none',
              }}
            />
          )}
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              style={{
                position: 'absolute',
                left: x0 + i * (cardW + gap) - 30,
                top: 0,
                width: cardW,
                height: 150,
                borderRadius: 12,
                padding: 18,
                background: i === 2 ? 'rgba(240,96,35,0.10)' : 'rgba(255,255,255,0.045)',
                border: `1px solid ${i === 2 ? 'rgba(240,96,35,0.6)' : C.hair2}`,
                boxShadow: i === 2 ? '0 0 30px rgba(240,96,35,0.25)' : undefined,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                ...enter(f, d + 14 + i * 4, 18),
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                <Icon name={s.icon} size={20} color={i <= 2 ? '#FF8A52' : C.textDim} />
                <div style={font(16, 600)}>{s.title}</div>
                <div style={{flex: 1}} />
                {s.v === 1 && <Icon name="check" size={18} color={C.yellow} />}
              </div>
              <div style={font(12.5, 500, C.textFaint)}>Stage {i + 1} of 4</div>
              <div style={{flex: 1}} />
              <ProgressBar value={s.v} delay={d + 30 + i * 6} />
              <div style={font(12, 600, i === 2 ? '#FF8A52' : C.textDim)}>{s.status}</div>
            </div>
          ))}
        </div>

        {/* lower area */}
        <div style={{flex: 1, display: 'flex', gap: 22}}>
          <div
            style={{
              flex: 1.7,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.035)',
              border: `1px solid ${C.hair}`,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              ...enter(f, d + 24, 20),
            }}
          >
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div style={{flex: 1}}>
                <div style={font(16, 600)}>Delivery flow</div>
                <div style={font(12.5, 500, C.textFaint)}>Illustrative data</div>
              </div>
              <Pill text="Live" tone="orange" dot />
            </div>
            <LineChart data={[20, 26, 24, 32, 30, 38, 36, 44, 42, 50, 54, 60]} w={720} h={330} delay={d + 34} dur={50} />
          </div>
          <div
            style={{
              flex: 1,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.035)',
              border: `1px solid ${C.hair}`,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              ...enter(f, d + 30, 20),
            }}
          >
            <div style={font(16, 600)}>Team activity</div>
            {[
              ['DS', 'Design handoff approved', 'Design → Build'],
              ['AK', 'Pipeline connected', 'Data → Insights'],
              ['RM', 'Release scheduled', 'Build → Deliver'],
              ['JP', 'Dashboard shared', 'Insights → Teams'],
              ['LN', 'Workflow automated', 'Intake → Routing'],
            ].map(([a, t, s], i) => (
              <div key={t} style={{display: 'flex', alignItems: 'center', gap: 12, ...enter(f, d + 40 + i * 6, 16)}}>
                <Avatar initials={a} size={34} hue={i} />
                <div style={{flex: 1}}>
                  <div style={font(14, 600)}>{t}</div>
                  <div style={font(12, 500, C.textFaint)}>{s}</div>
                </div>
                <LiveDot color={i === 0 ? C.yellow : C.orange} size={7} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Scene3Solution: React.FC = () => {
  const f = useCurrentFrame();
  const D = 196;

  // Camera orbit (< 8°) and gentle scale.
  const ry = keys(f, [0, D], [-7, 4]);
  const rx = keys(f, [0, D], [7, 3]);
  const sc = keys(f, [0, 60, D], [0.9, 0.9, 0.95]);

  // Fragments converge into the unified interface.
  const conv = prog(f, 4, 44, EASE_IO);
  const fragO = tween(f, [32, 50], [1, 0]);
  const dashIn = prog(f, 36, 30);

  // Music lift / light bloom.
  const lift = prog(f, 38, 30);
  const bloom = Math.sin(Math.min(1, lift) * Math.PI);

  const frag = (from: {x: number; y: number; z: number; rz: number}, w: number, h: number, node: React.ReactNode, key: string) => {
    const cx = DASH.left + DASH.w / 2 - w / 2;
    const cyy = DASH.top + DASH.h / 2 - h / 2;
    return (
      <Layer
        key={key}
        left={from.x + (cx - from.x) * conv}
        top={from.y + (cyy - from.y) * conv}
        w={w}
        h={h}
        z={from.z * (1 - conv)}
        rz={from.rz * (1 - conv)}
        ry={(1 - conv) * 12 - 6}
        scale={1 - 0.35 * conv}
        style={{opacity: fragO}}
      >
        <Glass glow={conv}>{node}</Glass>
      </Layer>
    );
  };

  return (
    <AbsoluteFill>
      <Camera ry={ry} rx={rx} scale={sc} y={40}>
        {frag({x: 60, y: 170, z: -260, rz: -3}, 540, 360, <AnalyticsCard delay={-30} />, 'a')}
        {frag({x: 720, y: 370, z: 160, rz: 2}, 500, 410, <TasksCard delay={-30} />, 'b')}
        {frag({x: 1350, y: 170, z: -380, rz: 4}, 540, 370, <TableCard delay={-30} />, 'c')}

        <Layer
          left={DASH.left}
          top={DASH.top}
          w={DASH.w}
          h={DASH.h}
          scale={0.9 + 0.1 * dashIn}
          style={{opacity: dashIn}}
        >
          <Glass glow={0.35 + 0.4 * bloom}>
            <MainDashboard d={36} />
          </Glass>
        </Layer>
      </Camera>

      <AbsoluteFill
        style={{
          background: `radial-gradient(45% 40% at 50% 55%, rgba(240,96,35,${0.22 * bloom}) 0%, transparent 100%)`,
          mixBlendMode: 'screen',
        }}
      />

      <div style={{position: 'absolute', left: 0, right: 0, top: 58, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        <Kicker text="IN TIME TEC" delay={44} />
        <MaskedText text="CONNECTED BY DESIGN" delay={50} size={66} weight={600} tracking="0.06em" />
        <Underline delay={66} width={220} />
      </div>
    </AbsoluteFill>
  );
};
