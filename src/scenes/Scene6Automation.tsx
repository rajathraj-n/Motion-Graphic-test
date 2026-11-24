import {useContent} from '../content';
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Camera, Glass, Layer} from '../components/Stage';
import {Bars, Connector, LineChart, LiveDot, ProgressBar} from '../components/Charts';
import {Counter, Kicker, MaskedText} from '../components/Text';
import {Icon, IconName, IconTile} from '../components/Icons';
import {font, Pill} from '../components/UI';
import {C, enter, keys, prog} from '../theme';

const MW = 340;
const MH = 270;
const MY = 250;
const MX = [140, 590, 1040, 1490];

const STEP_AT = [14, 40, 66, 92]; // sequential workflow triggers

const Module: React.FC<{i: number; icon: IconName; title: string; sub: string; children: React.ReactNode}> = ({i, icon, title, sub, children}) => {
  const f = useCurrentFrame();
  const t = STEP_AT[i];
  const active = prog(f, t + 6, 12) * (1 - prog(f, (STEP_AT[i + 1] ?? 160) + 10, 16) * 0.65);
  return (
    <Layer left={MX[i]} top={MY} w={MW} h={MH} z={30 * active} style={enter(f, t - 8, 20)}>
      <Glass glow={active}>
        <div style={{padding: 22, display: 'flex', flexDirection: 'column', gap: 16, height: '100%'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <IconTile name={icon} size={46} active={active > 0.2} />
            <div style={{flex: 1}}>
              <div style={font(12, 600, C.textFaint, {letterSpacing: '0.14em'})}>STEP {i + 1}</div>
              <div style={font(19, 600)}>{title}</div>
            </div>
            {active > 0.3 && <LiveDot />}
          </div>
          <div style={font(12.5, 500, C.textFaint)}>{sub}</div>
          {children}
        </div>
      </Glass>
    </Layer>
  );
};

const FEED = [
  'Weekly report delivered to Ops',
  'Invoice batch validated',
  'Ticket routed to Support Tier 2',
  'Inventory sync completed',
  'Alert resolved automatically',
  'New records enriched',
  'Approval request sent',
];

const ActivityFeed: React.FC<{delay: number}> = ({delay}) => {
  const f = useCurrentFrame();
  const step = 16;
  const n = Math.max(0, Math.floor((f - delay) / step));
  const sub = ((f - delay) % step) / step;
  const slide = f < delay ? 0 : Math.min(1, sub * 2.2);
  const items = Array.from({length: 5}, (_, k) => FEED[(n - k + FEED.length * 10) % FEED.length]);
  return (
    <div style={{position: 'relative', height: 250, overflow: 'hidden'}}>
      <div style={{transform: `translateY(${(slide - 1) * 50}px)`, display: 'flex', flexDirection: 'column', gap: 8}}>
        {items.map((t, k) => (
          <div
            key={`${n}-${k}`}
            style={{
              height: 42,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '0 12px',
              borderRadius: 9,
              background: k === 0 ? 'rgba(240,96,35,0.10)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${k === 0 ? 'rgba(240,96,35,0.35)' : 'transparent'}`,
              opacity: k === 0 ? slide : 1 - k * 0.15,
            }}
          >
            <Icon name="check" size={15} color={k === 0 ? C.yellow : C.textFaint} stroke={2.2} />
            <div style={{...font(13.5, 500, k === 0 ? '#fff' : C.textDim), flex: 1}}>{t}</div>
            <div style={font(11.5, 500, C.textFaint)}>{k === 0 ? 'now' : `${k * 2}m`}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Scene6Automation: React.FC = () => {
  const f = useCurrentFrame();
  const t = useContent().s6;
  const D = 226;
  const rx = keys(f, [0, D], [12, 4]);
  const sc = keys(f, [0, D], [0.94, 1]);
  const y = keys(f, [0, D], [30, 0]);

  const link = (i: number) => {
    const x1 = MX[i] + MW;
    const x2 = MX[i + 1];
    const yy = MY + MH / 2;
    return `M ${x1} ${yy} C ${x1 + 50} ${yy - 70}, ${x2 - 50} ${yy - 70}, ${x2} ${yy}`;
  };

  return (
    <AbsoluteFill>
      <Camera rx={rx} scale={sc} y={y} perspective={2400}>
        <Module i={0} icon="database" title="Data Sources" sub="Connected systems">
          {['CRM', 'ERP', 'Cloud storage', 'IoT streams'].map((s, k) => {
            const blink = (Math.floor((f - 20) / 6) % 4 + 4) % 4 === k && f > 20;
            return (
              <div key={s} style={{display: 'flex', alignItems: 'center', gap: 10, ...font(13.5, 500, C.textDim)}}>
                <span style={{width: 7, height: 7, borderRadius: 7, background: blink ? C.yellow : C.orange, boxShadow: blink ? `0 0 10px ${C.yellow}` : undefined}} />
                {s}
                <div style={{flex: 1}} />
                <span style={font(11.5, 500, C.textFaint)}>synced</span>
              </div>
            );
          })}
        </Module>
        <Module i={1} icon="flow" title="Automation" sub="Rules & workflows">
          {['Validate', 'Transform', 'Route'].map((s, k) => (
            <div key={s} style={{display: 'flex', flexDirection: 'column', gap: 6}}>
              <div style={{display: 'flex', ...font(13, 500, C.textDim)}}>
                <span style={{flex: 1}}>{s}</span>
                {f > STEP_AT[1] + 16 + k * 10 + 30 && <Icon name="check" size={14} color={C.yellow} stroke={2.2} />}
              </div>
              <ProgressBar value={1} delay={STEP_AT[1] + 12 + k * 10} dur={30} h={5} />
            </div>
          ))}
        </Module>
        <Module i={2} icon="chart" title="Analytics" sub="Real-time visibility">
          <div style={{flex: 1, display: 'flex', alignItems: 'flex-end'}}>
            <Bars data={[5, 7, 6, 9, 8, 11, 10, 13]} w={296} h={100} delay={STEP_AT[2] + 8} highlight={7} />
          </div>
        </Module>
        <Module i={3} icon="bolt" title="Action" sub="Automated outcomes">
          {['Alerts sent', 'Tickets created', 'Reports scheduled'].map((s, k) => {
            const p = prog(f, STEP_AT[3] + 14 + k * 8, 12);
            return (
              <div key={s} style={{display: 'flex', alignItems: 'center', gap: 10, ...font(13.5, 500, C.textDim)}}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    background: `rgba(255,214,0,${0.15 * p})`,
                    border: `1.5px solid ${p > 0.5 ? C.yellow : 'rgba(255,255,255,0.25)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{transform: `scale(${p})`}}>
                    <Icon name="check" size={13} color={C.yellow} stroke={2.6} />
                  </div>
                </div>
                {s}
              </div>
            );
          })}
        </Module>

        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {[0, 1, 2].map((i) => (
            <Connector key={i} d={link(i)} delay={STEP_AT[i] + 14} dur={18} width={3} pulses={[0, 0.33, 0.66]} speed={0.9} />
          ))}
        </svg>

        {/* Refined analytics dashboard */}
        <Layer left={140} top={590} w={1690} h={420} style={enter(f, 108, 26)}>
          <Glass glow={0.3}>
            <div style={{padding: 24, display: 'flex', gap: 24, height: '100%'}}>
              <div style={{flex: 1.15, display: 'flex', flexDirection: 'column', gap: 14}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <div style={{...font(17, 600), flex: 1}}>Records processed</div>
                  <Pill text="Pipeline healthy" tone="yellow" dot />
                </div>
                <div style={font(40, 600)}>
                  <Counter to={1284500} delay={116} dur={70} />
                </div>
                <div style={{flex: 1, display: 'flex', alignItems: 'flex-end'}}>
                  <Bars data={[8, 11, 9, 13, 12, 15, 14, 17, 16, 19, 18, 21]} w={520} h={190} delay={118} stagger={2} highlight={11} />
                </div>
              </div>
              <div style={{width: 1, background: C.hair}} />
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <div style={{...font(17, 600), flex: 1}}>Automations running</div>
                  <div style={font(28, 600)}>
                    <Counter to={36} delay={122} dur={50} />
                  </div>
                </div>
                <div style={font(12.5, 500, C.textFaint)}>Processing time · illustrative data</div>
                <LineChart data={[60, 54, 57, 48, 50, 42, 44, 36, 38, 31, 30]} w={460} h={230} delay={124} dur={50} />
              </div>
              <div style={{width: 1, background: C.hair}} />
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                  <div style={{...font(17, 600), flex: 1}}>Live activity</div>
                  <LiveDot />
                </div>
                <ActivityFeed delay={130} />
              </div>
            </div>
          </Glass>
        </Layer>
      </Camera>

      <div style={{position: 'absolute', left: 0, right: 0, top: 58, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
        <Kicker text={t.kicker} delay={4} />
        <MaskedText text={t.headline} delay={8} size={64} weight={700} tracking="0.06em" />
      </div>
    </AbsoluteFill>
  );
};
