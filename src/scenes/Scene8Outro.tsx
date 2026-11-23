import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Camera, Glass, Layer} from '../components/Stage';
import {Bars, LineChart, Ring} from '../components/Charts';
import {Icon, IconName} from '../components/Icons';
import {Logo} from '../components/Logo';
import {MaskedText, Underline} from '../components/Text';
import {font} from '../components/UI';
import {C, EASE, EASE_IO, FONT, keys, prog, tween} from '../theme';

const TILES: {icon: IconName; label: string; kind: 'line' | 'bars' | 'ring' | 'none'}[] = [
  {icon: 'grid', label: 'Dashboard', kind: 'line'},
  {icon: 'spark', label: 'AI Insights', kind: 'line'},
  {icon: 'users', label: 'Customers', kind: 'none'},
  {icon: 'flow', label: 'Automation', kind: 'bars'},
  {icon: 'database', label: 'Data', kind: 'bars'},
  {icon: 'tasks', label: 'Operations', kind: 'none'},
  {icon: 'shield', label: 'Security', kind: 'ring'},
  {icon: 'cloud', label: 'Cloud', kind: 'ring'},
  {icon: 'trend', label: 'Results', kind: 'line'},
];

const TW = 380;
const TH = 220;
const GX = 430;
const GY = 270;

export const Scene8Outro: React.FC = () => {
  const f = useCurrentFrame();

  // 1) pull back to reveal the ecosystem
  const camS = keys(f, [0, 30], [1.25, 0.92], EASE_IO);
  // 2) converge into a single orange circle
  const conv = prog(f, 26, 24, EASE_IO);
  const circle = prog(f, 34, 18, EASE);
  // 3) circle expands to a clean white end card
  const white = prog(f, 50, 24, EASE_IO);
  const whiteR = 60 + white * 1300;

  const logoP = prog(f, 66, 26, EASE);
  const sweep = tween(f, [94, 130], [-0.3, 1.3], EASE_IO);
  const settle = keys(f, [66, 92, 188], [0.94, 1, 1.015], EASE);

  return (
    <AbsoluteFill>
      {/* Ecosystem of glass panels */}
      <Camera scale={camS}>
        {TILES.map((t, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const x = 960 + (col - 1) * GX - TW / 2;
          const y = 540 + (row - 1) * GY - TH / 2;
          const cx = 960 - TW / 2;
          const cy = 540 - TH / 2;
          const delay = Math.abs(col - 1) + Math.abs(row - 1);
          const c = prog(f, 24 + delay * 3, 22, EASE_IO);
          return (
            <Layer
              key={t.label}
              left={x + (cx - x) * c}
              top={y + (cy - y) * c}
              w={TW}
              h={TH}
              z={-(row * 3 + col) * 12}
              scale={1 - 0.9 * c}
              rz={(col - 1) * 6 * c}
              style={{opacity: 1 - prog(f, 34 + delay * 3, 12)}}
            >
              <Glass glow={0.3 + 0.7 * c}>
                <div style={{padding: 20, display: 'flex', flexDirection: 'column', gap: 14, height: '100%'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                    <Icon name={t.icon} size={20} color="#FF8A52" />
                    <div style={font(15, 600)}>{t.label}</div>
                  </div>
                  <div style={{flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: t.kind === 'ring' ? 'center' : undefined}}>
                    {t.kind === 'line' && <LineChart data={[10, 14, 12, 18, 16, 22, 26]} w={340} h={110} delay={-60} grid={false} />}
                    {t.kind === 'bars' && <Bars data={[5, 7, 6, 9, 8, 10, 12]} w={340} h={110} delay={-60} />}
                    {t.kind === 'ring' && <Ring size={110} value={0.8} delay={-60} stroke={10} />}
                    {t.kind === 'none' && (
                      <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: 10}}>
                        {[0.9, 0.7, 0.8].map((w, k) => (
                          <div key={k} style={{display: 'flex', alignItems: 'center', gap: 10}}>
                            <div style={{width: 26, height: 26, borderRadius: 26, background: k === 0 ? C.orange : 'rgba(255,255,255,0.12)'}} />
                            <div style={{width: `${w * 80}%`, height: 8, borderRadius: 8, background: 'rgba(255,255,255,0.12)'}} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Glass>
            </Layer>
          );
        })}
      </Camera>

      {/* Central orange circle */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 30%, #FF8A52, ${C.orange} 60%, #D9481A)`,
            boxShadow: `0 0 ${80 * circle}px rgba(240,96,35,0.8), 0 0 ${200 * circle}px rgba(240,96,35,0.4)`,
            transform: `scale(${circle * (1 + 0.08 * Math.sin(tween(f, [40, 56], [0, Math.PI], (t) => t)))})`,
          }}
        />
      </AbsoluteFill>

      {/* White end card revealed through an expanding circle */}
      <AbsoluteFill
        style={{
          clipPath: `circle(${white > 0 ? whiteR : 0}px at 50% 50%)`,
          background: `radial-gradient(90% 80% at 50% 45%, #FFFFFF 0%, ${C.offWhite} 70%, #ECEEF2 100%)`,
        }}
      >
        {/* soft warm light */}
        <AbsoluteFill style={{background: 'radial-gradient(40% 35% at 50% 40%, rgba(240,96,35,0.07), transparent 70%)'}} />
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${settle})`}}>
            <div style={{position: 'relative', opacity: logoP, transform: `translateY(${(1 - logoP) * 18}px)`}}>
              <Logo />
              {/* light sweep */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-20px -40px',
                  background: `linear-gradient(105deg, transparent ${sweep * 100 - 12}%, rgba(255,255,255,0.85) ${sweep * 100}%, transparent ${sweep * 100 + 12}%)`,
                  mixBlendMode: 'soft-light',
                  pointerEvents: 'none',
                }}
              />
            </div>
            <Underline delay={84} width={280} height={5} style={{marginTop: 34}} />
            <div style={{marginTop: 30}}>
              <MaskedText text="CREATING ABUNDANCE" delay={92} size={30} weight={600} tracking="0.32em" color={C.graphite} stagger={3} />
            </div>
            <div style={{marginTop: 34}}>
              <MaskedText text="Let's Build What's Next." delay={102} size={44} weight={600} tracking="0.01em" color={C.graphite} stagger={3} />
            </div>
            <div
              style={{
                marginTop: 22,
                opacity: prog(f, 112, 18),
                transform: `translateY(${(1 - prog(f, 112, 18)) * 10}px)`,
                fontFamily: FONT,
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: C.orange,
              }}
            >
              intimetec.com
            </div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Expanding orange ring on the white transition */}
      {white > 0 && white < 1 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div
            style={{
              width: whiteR * 2,
              height: whiteR * 2,
              borderRadius: '50%',
              border: `${3 + 6 * (1 - white)}px solid ${C.orange}`,
              opacity: 1 - white,
              boxShadow: `0 0 40px rgba(240,96,35,${0.6 * (1 - white)})`,
              flexShrink: 0,
            }}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
