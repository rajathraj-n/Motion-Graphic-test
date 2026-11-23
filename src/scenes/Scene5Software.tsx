import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Camera, Layer} from '../components/Stage';
import {Bars, LineChart, Ring} from '../components/Charts';
import {Counter, Kicker, MaskedText} from '../components/Text';
import {Icon} from '../components/Icons';
import {Avatar, Browser, Cursor, font, Pill, Ripple, Sidebar} from '../components/UI';
import {C, EASE, EASE_IO, enter, keys, prog, tween} from '../theme';

const SW = 1180;
const SH = 700;
const SPACING = 1320;
const TOP = 300;

const tile: React.CSSProperties = {
  borderRadius: 12,
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${C.hair}`,
  padding: 18,
};

/* ---------- Screen 1: interactive dashboard ---------- */
const DashboardScreen: React.FC = () => {
  const f = useCurrentFrame();
  const hover = prog(f, 40, 10) * (1 - prog(f, 62, 10));
  const kpis: [string, number, string, number][] = [
    ['Active projects', 18, '', 0],
    ['Open tasks', 126, '', 0],
    ['Avg. cycle time', 4.2, ' d', 1],
    ['Team members', 32, '', 0],
  ];
  return (
    <div style={{display: 'flex', height: '100%'}}>
      <Sidebar
        delay={4}
        active={0}
        width={190}
        items={[
          {icon: 'home', label: 'Dashboard'},
          {icon: 'users', label: 'Customers'},
          {icon: 'tasks', label: 'Tasks'},
          {icon: 'chart', label: 'Reports'},
        ]}
      />
      <div style={{flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 18}}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <div style={{...font(22, 600), flex: 1}}>Dashboard</div>
          <Pill text="This quarter" tone="muted" />
        </div>
        <div style={{display: 'flex', gap: 14}}>
          {kpis.map(([k, v, s, d], i) => {
            const h = i === 1 ? hover : 0;
            return (
              <div
                key={k}
                style={{
                  ...tile,
                  flex: 1,
                  transform: `translateY(${-6 * h}px)`,
                  border: `1px solid ${h > 0.01 ? `rgba(240,96,35,${0.3 + 0.5 * h})` : C.hair}`,
                  boxShadow: `0 ${14 * h}px ${30 * h}px -10px rgba(0,0,0,0.6), 0 0 ${24 * h}px rgba(240,96,35,${0.3 * h})`,
                  ...enter(f, 10 + i * 4, 18),
                }}
              >
                <div style={font(12.5, 500, C.textFaint)}>{k}</div>
                <div style={font(28, 600)}>
                  <Counter to={v} decimals={d} suffix={s} delay={14 + i * 4} dur={36} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{display: 'flex', gap: 14, flex: 1}}>
          <div style={{...tile, flex: 2, ...enter(f, 22, 20)}}>
            <div style={{...font(15, 600), marginBottom: 14}}>Delivery trend</div>
            <LineChart data={[22, 28, 25, 33, 31, 38, 35, 42, 46, 44, 52]} w={560} h={350} delay={26} dur={45} dots />
          </div>
          <div style={{...tile, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, ...enter(f, 28, 20)}}>
            <div style={{...font(15, 600), alignSelf: 'flex-start'}}>Sprint progress</div>
            <Ring size={170} value={0.72} delay={32} stroke={14}>
              <div style={font(30, 600)}>
                <Counter to={72} delay={32} suffix="%" />
              </div>
            </Ring>
            <div style={{display: 'flex', gap: 14, ...font(12, 500, C.textDim)}}>
              <span>● Done</span>
              <span style={{color: C.textFaint}}>● Remaining</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Screen 2: customer workspace ---------- */
const CUSTOMERS = [
  'Harbor Logistics',
  'Summit Health',
  'Northfield Retail',
  'Crestline Energy',
  'Bluewater Finance',
  'Meridian Labs',
  'Oakridge Foods',
  'Pioneer Mobility',
  'Silverline Media',
  'Vantage Systems',
];

const CustomerScreen: React.FC = () => {
  const f = useCurrentFrame();
  const scroll = tween(f, [78, 112], [0, -150], EASE_IO);
  const selected = f > 110 ? 5 : 1;
  const hoverRow = Math.round(tween(f, [78, 112], [1, 5]));
  const sel = prog(f, 108, 12);
  const name = CUSTOMERS[selected];
  return (
    <div style={{display: 'flex', height: '100%'}}>
      <div style={{width: 360, borderRight: `1px solid ${C.hair}`, padding: 20, display: 'flex', flexDirection: 'column', gap: 14}}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <div style={{...font(20, 600), flex: 1}}>Customers</div>
          <Pill text="248" tone="orange" />
        </div>
        <div
          style={{
            height: 36,
            borderRadius: 9,
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${C.hair}`,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 12px',
            ...font(13, 500, C.textFaint),
          }}
        >
          <Icon name="search" size={14} color={C.textFaint} /> Search customers
        </div>
        <div style={{flex: 1, overflow: 'hidden', position: 'relative'}}>
          <div style={{transform: `translateY(${scroll}px)`, display: 'flex', flexDirection: 'column', gap: 6}}>
            {CUSTOMERS.map((c, i) => {
              const isSel = i === selected;
              const isHover = i === hoverRow && !isSel && f > 78 && f < 112;
              return (
                <div
                  key={c}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: isSel ? `rgba(240,96,35,${0.1 + 0.06 * sel})` : isHover ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border: `1px solid ${isSel ? 'rgba(240,96,35,0.5)' : 'transparent'}`,
                  }}
                >
                  <Avatar initials={c.split(' ').map((w) => w[0]).join('')} size={34} hue={i} />
                  <div style={{flex: 1}}>
                    <div style={font(14, 600)}>{c}</div>
                    <div style={font(12, 500, C.textFaint)}>{['Enterprise', 'Mid-market', 'Growth'][i % 3]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{flex: 1, padding: 26, display: 'flex', flexDirection: 'column', gap: 20}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, opacity: f > 110 ? sel : 1}}>
          <Avatar initials={name.split(' ').map((w) => w[0]).join('')} size={58} hue={selected} />
          <div style={{flex: 1}}>
            <div style={font(24, 600)}>{name}</div>
            <div style={font(13, 500, C.textFaint)}>Account workspace · Owner: Customer Success</div>
          </div>
          <Pill text="Healthy" tone="yellow" dot />
        </div>
        <div style={{display: 'flex', gap: 26, borderBottom: `1px solid ${C.hair}`, ...font(14, 600, C.textDim)}}>
          {['Overview', 'Projects', 'Tickets', 'Documents'].map((t, i) => (
            <div key={t} style={{paddingBottom: 12, color: i === 0 ? '#fff' : undefined, borderBottom: i === 0 ? `2px solid ${C.orange}` : '2px solid transparent'}}>
              {t}
            </div>
          ))}
        </div>
        <div style={{display: 'flex', gap: 14}}>
          {[
            ['Open requests', '6'],
            ['Active projects', '3'],
            ['Next review', 'Mon'],
          ].map(([k, v]) => (
            <div key={k} style={{...tile, flex: 1}}>
              <div style={font(12.5, 500, C.textFaint)}>{k}</div>
              <div style={font(24, 600)}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{...tile, flex: 1, display: 'flex', flexDirection: 'column', gap: 14}}>
          <div style={font(15, 600)}>Recent activity</div>
          {[
            ['Onboarding checklist completed', '2h ago'],
            ['Integration request approved', 'Yesterday'],
            ['Quarterly review scheduled', '2 days ago'],
          ].map(([t, w], i) => (
            <div key={t} style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <div style={{width: 10, height: 10, borderRadius: 10, border: `2px solid ${i === 0 ? C.orange : C.textFaint}`}} />
              <div style={{...font(14, 500), flex: 1}}>{t}</div>
              <div style={font(12.5, 500, C.textFaint)}>{w}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------- Screen 3: operational task workspace ---------- */
const COLS = ['To do', 'In progress', 'Done'];

const TaskCard: React.FC<{title: string; tag: string; done?: boolean; active?: boolean; button?: boolean; press?: number; glow?: number}> = ({
  title,
  tag,
  done,
  active,
  button,
  press = 0,
  glow = 0,
}) => (
  <div
    style={{
      borderRadius: 12,
      padding: 16,
      background: active ? 'rgba(240,96,35,0.08)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${glow > 0 ? `rgba(255,214,0,${0.3 + 0.5 * glow})` : active ? 'rgba(240,96,35,0.45)' : C.hair}`,
      boxShadow: glow > 0 ? `0 0 ${30 * glow}px rgba(255,214,0,${0.25 * glow})` : '0 10px 20px -12px rgba(0,0,0,0.6)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}
  >
    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
      <Pill text={tag} tone={done ? 'yellow' : active ? 'orange' : 'muted'} size={11} />
      <div style={{flex: 1}} />
      {done && <Icon name="check" size={16} color={C.yellow} stroke={2.2} />}
    </div>
    <div style={{...font(14.5, 600), textDecoration: done ? 'line-through' : undefined, color: done ? C.textDim : C.text}}>{title}</div>
    {button && (
      <div
        style={{
          alignSelf: 'flex-start',
          padding: '7px 14px',
          borderRadius: 8,
          background: done ? 'rgba(255,214,0,0.15)' : C.orange,
          transform: `scale(${1 - 0.05 * press})`,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          ...font(12.5, 600, done ? C.yellow : '#fff'),
        }}
      >
        <Icon name="check" size={13} color={done ? C.yellow : '#fff'} stroke={2.4} />
        {done ? 'Completed' : 'Mark complete'}
      </div>
    )}
  </div>
);

const TaskScreen: React.FC = () => {
  const f = useCurrentFrame();
  const CLICK = 176;
  const cursorIn = prog(f, 140, 14);
  const cx = keys(f, [140, 172], [760, 405], EASE_IO);
  const cy = keys(f, [140, 172], [560, 200], EASE_IO);
  const press = f >= CLICK && f < CLICK + 6 ? 1 : 0;
  const done = f >= CLICK + 3;
  const move = prog(f, CLICK + 10, 24, EASE_IO); // card travels to Done column
  const expand = prog(f, CLICK + 4, 14);
  const toast = prog(f, CLICK + 12, 18);
  const colW = 300;
  const colGap = 20;
  return (
    <div style={{padding: 26, height: '100%', display: 'flex', flexDirection: 'column', gap: 20, position: 'relative'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <div style={{...font(22, 600), flex: 1}}>Operations board</div>
        <Pill text="Sprint 14" tone="muted" />
        <div style={{display: 'flex'}}>
          {['AR', 'JL', 'MO'].map((a, i) => (
            <div key={a} style={{marginLeft: i ? -8 : 0}}>
              <Avatar initials={a} size={30} hue={i} />
            </div>
          ))}
        </div>
      </div>
      <div style={{display: 'flex', gap: colGap, flex: 1, position: 'relative'}}>
        {COLS.map((c, i) => (
          <div key={c} style={{width: colW, display: 'flex', flexDirection: 'column', gap: 12, padding: 12, borderRadius: 14, background: 'rgba(0,0,0,0.15)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, ...font(13.5, 600, C.textDim)}}>
              <span style={{width: 8, height: 8, borderRadius: 8, background: [C.textFaint, C.orange, C.yellow][i]}} />
              {c}
            </div>
            {i === 0 && (
              <>
                <TaskCard title="Map approval workflow" tag="Process" />
                <TaskCard title="Draft onboarding emails" tag="Content" />
                <TaskCard title="Review access roles" tag="Security" />
              </>
            )}
            {i === 1 && (
              <>
                <div style={{height: 140 * (1 - move), opacity: 0}} />
                <TaskCard title="Sync CRM contacts" tag="Integration" active />
              </>
            )}
            {i === 2 && (
              <>
                <div style={{height: 140 * move}} />
                <TaskCard title="Set up dashboards" tag="Reporting" done />
              </>
            )}
          </div>
        ))}
        {/* the clicked card — lifts, completes and travels to "Done" */}
        <div
          style={{
            position: 'absolute',
            left: 12 + (colW + colGap) * (1 + move),
            top: 40 - 8 * Math.sin(move * Math.PI),
            width: colW - 24,
            transform: `scale(${1 + 0.04 * Math.sin(move * Math.PI)})`,
            zIndex: 5,
          }}
        >
          <TaskCard title="Validate data import" tag={done ? 'Done' : 'Data'} active={!done} done={done} button press={press} glow={done ? expand * (1 - move * 0.6) : 0} />
        </div>
        <div style={{flex: 1, ...tile, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={font(14, 600)}>Workload</div>
          <Bars data={[4, 6, 5, 7, 3]} w={160} h={240} delay={150} />
          <div style={font(12, 500, C.textFaint)}>Tasks per teammate</div>
        </div>
      </div>
      <Ripple x={cx + 4} y={cy + 4} at={CLICK} />
      <Cursor x={cx} y={cy} press={press} opacity={cursorIn * (1 - prog(f, 205, 10))} />
      {/* toast */}
      <div
        style={{
          position: 'absolute',
          right: 26,
          bottom: 26,
          opacity: toast,
          transform: `translateY(${(1 - toast) * 20}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 18px',
          borderRadius: 12,
          background: 'rgba(17,19,24,0.92)',
          border: '1px solid rgba(255,214,0,0.45)',
          boxShadow: '0 20px 40px -12px rgba(0,0,0,0.7)',
          ...font(14, 600),
        }}
      >
        <div style={{width: 26, height: 26, borderRadius: 26, background: C.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Icon name="check" size={15} color={C.graphite} stroke={2.6} />
        </div>
        Task completed · team notified
      </div>
    </div>
  );
};

export const Scene5Software: React.FC = () => {
  const f = useCurrentFrame();
  // Camera tracks between the three screens with holds.
  const camX = keys(f, [0, 62, 86, 128, 152], [0, 0, -SPACING, -SPACING, -SPACING * 2]);
  // velocity-based swing & breathing pull-back during moves
  const moving = Math.max(
    Math.sin(tween(f, [62, 86], [0, 1], (t) => t) * Math.PI),
    Math.sin(tween(f, [128, 152], [0, 1], (t) => t) * Math.PI),
  );
  const camZ = -120 * moving + keys(f, [0, 226], [-40, 40]);
  const ry = -5 * moving;

  const screens = [
    {url: 'app.example.com/dashboard', node: <DashboardScreen />},
    {url: 'app.example.com/customers', node: <CustomerScreen />},
    {url: 'app.example.com/operations', node: <TaskScreen />},
  ];

  return (
    <AbsoluteFill>
      <Camera x={camX} z={camZ} ry={ry} rx={3} perspective={2400}>
        {screens.map((s, i) => {
          const center = 960 + i * SPACING + camX;
          const focus = 1 - Math.min(1, Math.abs(center - 960) / SPACING);
          const slide = i === 0 ? prog(f, 0, 26, EASE) : 1;
          return (
            <Layer
              key={s.url}
              left={960 - SW / 2 + i * SPACING + (1 - slide) * 260}
              top={TOP}
              w={SW}
              h={SH}
              z={-160 * (1 - focus)}
              ry={(1 - focus) * (center > 960 ? -10 : 10)}
              style={{opacity: (0.35 + 0.65 * focus) * slide}}
            >
              <Browser url={s.url} glow={0.15 + 0.45 * focus}>
                {s.node}
              </Browser>
            </Layer>
          );
        })}
      </Camera>

      <div style={{position: 'absolute', left: 0, right: 0, top: 62, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
        <MaskedText text="CUSTOM SOFTWARE" delay={10} size={64} weight={700} tracking="0.06em" />
        <Kicker text="INTUITIVE EXPERIENCES" delay={22} />
      </div>
    </AbsoluteFill>
  );
};
