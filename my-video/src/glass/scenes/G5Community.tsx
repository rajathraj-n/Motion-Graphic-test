import React from 'react';
import {AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {GameArt} from '../../steam/GameArt';
import {GAMES} from '../../steam/games';
import {C, font} from '../../steam/theme';
import {ease, easeIO, easeOutro, Headline, lerp, Subtitle} from '../../steam/ui';
import {ArtCard, Label} from '../content';
import {GlassPanel} from '../Glass';
import {Environment, place, project, Stage, type Placement} from '../stage';
import type {GlassSceneProps} from './types';

type Status = 'ingame' | 'online' | 'away' | 'offline';
const STATUS: Record<Status, string> = {ingame: '#90BA3C', online: '#57CBDE', away: '#E5B53B', offline: '#6b7480'};
const FRIENDS: {name: string; status: Status; detail: string; color: string}[] = [
	{name: 'NovaRider', status: 'ingame', detail: 'Playing Starfall Odyssey', color: '#ff7a59'},
	{name: 'PixelMage', status: 'online', detail: 'Online', color: '#a66bff'},
	{name: 'Kestrel', status: 'ingame', detail: 'Playing Neon Drift', color: '#36c2a8'},
	{name: 'ByteKnight', status: 'online', detail: 'Online', color: '#ffb547'},
	{name: 'Lumen', status: 'away', detail: 'Away', color: '#5aa2ff'},
	{name: 'OrbitFox', status: 'offline', detail: 'Offline', color: '#7a8693'},
];

const PANEL = {w: 430, h: 560, y: -70};

const AchIcon: React.FC<{readonly size: number; readonly shine: number}> = ({size, shine}) => (
	<div style={{position: 'relative', width: size, height: size, borderRadius: 16, overflow: 'hidden', flexShrink: 0, background: `linear-gradient(135deg, #9fdcff, ${C.cta} 55%, #0b4f9c)`, boxShadow: '0 0 20px rgba(103,193,245,0.5)'}}>
		<svg width={size} height={size} viewBox="0 0 100 100" style={{position: 'absolute'}}>
			<path d="M50 18 L60 40 L84 42 L66 58 L71 82 L50 70 L29 82 L34 58 L16 42 L40 40 Z" fill="#ffffff" />
		</svg>
		<div style={{position: 'absolute', top: -20, bottom: -20, width: 30, left: -60 + shine * (size + 120), rotate: '20deg', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)'}} />
	</div>
);

export const G5Community: React.FC<GlassSceneProps> = ({subtitles}) => {
	const frame = useCurrentFrame();

	const arrive = easeIO(frame, 0, 24);
	const friendsFwd = easeIO(frame, 20, 22);
	const achFwd = easeIO(frame, 44, 22);
	const achBack = easeIO(frame, 76, 16);
	const pullBack = easeIO(frame, 74, 26);
	const pulse = interpolate(frame, [88, 92, 102], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const collapse = easeOutro(frame, 100, 18);

	// Camera arrives from the previous scene's pass-through, tracks right, then pulls back wide.
	const cam = {
		x: lerp(0, 120, friendsFwd) * (1 - pullBack),
		y: 0,
		z: lerp(700, 40, arrive) - pullBack * 260,
		rx: 0,
		ry: lerp(-6, 4, easeIO(frame, 0, 74)) * (1 - pullBack),
	};

	const sym = pullBack; // panels align symmetrically as the camera pulls back
	const left = {x: -560, y: PANEL.y, z: lerp(-40, -80, sym), w: PANEL.w, h: PANEL.h, ry: lerp(16, 12, sym)};
	const center = {x: 0, y: PANEL.y, z: lerp(-160, -80, sym), w: 500, h: 600};
	const right = {x: lerp(560, lerp(500, 560, sym), friendsFwd), y: PANEL.y, z: lerp(-40, lerp(110, -80, sym), friendsFwd), w: PANEL.w, h: PANEL.h, ry: lerp(-16, -12, sym)};

	const panelGlow = 0.3 + pulse * 0.7;
	const sy = 1 - collapse * 0.985;
	const fade = 1 - interpolate(frame, [112, 119], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	// Light line connecting the centre dashboard to the Friends panel.
	const a = project(center.x + center.w / 2, center.y - 120, center.z, cam);
	const b = project(right.x - right.w / 2, right.y - 120, right.z, cam);
	const lineP = ease(frame, 30, 20);

	// Foreground achievement card
	const ach = {
		x: lerp(-560, -250, achFwd * (1 - achBack)),
		y: lerp(60, 150, achFwd * (1 - achBack)),
		z: lerp(-30, 280, achFwd * (1 - achBack)),
		w: 560,
		h: 150,
		ry: lerp(16, 4, achFwd * (1 - achBack)),
	};

	const wrap = (p: Placement) => ({...p, h: p.h * sy});

	return (
		<AbsoluteFill>
			<Environment hazeX={55} />
			<Stage>
				{/* Left: achievements */}
				<GlassPanel style={place(wrap(left), cam)} glow={panelGlow} padding={26} sweep={(frame - 10) / 40} opacity={fade}>
					<Label>ACHIEVEMENTS</Label>
					<div style={{fontFamily: font, fontSize: 26, fontWeight: 700, color: C.white, marginTop: 8}}>Starfall Odyssey</div>
					<div style={{height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)', marginTop: 14}}>
						<div style={{width: `${frame > 60 ? 70 : 67.5}%`, height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${C.cta}, ${C.blue})`}} />
					</div>
					{['First Contact', 'Stellar Navigator', 'Deep Space Diver'].map((t, i) => (
						<div key={t} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 22, fontFamily: font, opacity: ease(frame, 12 + i * 4, 14)}}>
							<div style={{width: 54, height: 54, borderRadius: 12, background: `linear-gradient(135deg, ${['#3fd0ff', '#ffd08a', '#a66bff'][i]}, #1b2838)`}} />
							<div>
								<div style={{fontSize: 20, fontWeight: 700, color: C.white}}>{t}</div>
								<div style={{fontSize: 15, color: C.muted}}>Unlocked</div>
							</div>
						</div>
					))}
				</GlassPanel>

				{/* Centre: active game library */}
				<GlassPanel style={place(wrap(center), cam)} glow={panelGlow} padding={26} sweep={(frame - 18) / 40} opacity={fade}>
					<Label>NOW PLAYING</Label>
					<div style={{marginTop: 14}}>
						<ArtCard game={GAMES.starfall} t={frame} w={448} h={250} titleSize={32} active={0.4} />
					</div>
					<div style={{display: 'flex', gap: 14, marginTop: 18}}>
						{[GAMES.neon, GAMES.frost, GAMES.ember].map((gm) => (
							<GameArt key={gm.id} game={gm} t={frame} width={140} height={190} radius={10} titleSize={15} />
						))}
					</div>
				</GlassPanel>

				{/* Right: friends & chat */}
				<GlassPanel style={place(wrap(right), cam)} glow={panelGlow + friendsFwd * 0.2} padding={0} sweep={(frame - 26) / 30} opacity={fade}>
					<div style={{padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(103,193,245,0.15)', fontFamily: font}}>
						<div style={{width: 50, height: 50, borderRadius: 12, background: `linear-gradient(135deg, ${C.blue}, ${C.cta})`, border: `2px solid ${STATUS.online}`}} />
						<div>
							<div style={{fontSize: 21, fontWeight: 700, color: C.white}}>Friends &amp; Chat</div>
							<div style={{fontSize: 15, color: STATUS.online}}>4 friends online</div>
						</div>
					</div>
					{FRIENDS.map((f, i) => {
						const row = ease(frame, 22 + i * 4, 14);
						const dot = interpolate(frame, [28 + i * 4, 36 + i * 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.34, 1.56, 0.64, 1)});
						return (
							<div key={f.name} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '11px 24px', fontFamily: font, opacity: row, translate: `${(1 - row) * 30}px 0px`}}>
								<div style={{position: 'relative', width: 48, height: 48, flexShrink: 0}}>
									<div style={{width: 48, height: 48, borderRadius: 12, background: f.color, opacity: f.status === 'offline' ? 0.45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: 'rgba(255,255,255,0.92)'}}>{f.name[0]}</div>
									<div style={{position: 'absolute', right: -4, bottom: -4, width: 16, height: 16, borderRadius: '50%', background: STATUS[f.status], border: '3px solid #1b2838', scale: String(dot), boxShadow: f.status === 'offline' ? 'none' : `0 0 10px ${STATUS[f.status]}`}} />
								</div>
								<div>
									<div style={{fontSize: 19, fontWeight: 600, color: f.status === 'offline' ? C.muted : C.white}}>{f.name}</div>
									<div style={{fontSize: 15, color: STATUS[f.status]}}>{f.detail}</div>
								</div>
							</div>
						);
					})}
				</GlassPanel>

				{/* Supporting achievement cards stacked behind */}
				{[2, 1].map((n) => (
					<GlassPanel key={n} style={place({...ach, x: ach.x - n * 18, y: ach.y - n * 18, z: ach.z - n * 50, w: ach.w, h: ach.h * sy}, cam)} opacity={achFwd * (1 - achBack) * 0.6 * fade} glow={0.2} radius={20} />
				))}
				{/* Foreground achievement card */}
				<GlassPanel style={place({...ach, h: ach.h * sy}, cam)} opacity={achFwd * (1 - achBack) * fade} glow={0.55} radius={20} padding={22} sweep={(frame - 56) / 20}>
					<div style={{display: 'flex', alignItems: 'center', gap: 20, height: '100%', fontFamily: font}}>
						<AchIcon size={92} shine={interpolate(frame, [58, 72], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
						<div style={{flex: 1}}>
							<div style={{fontSize: 15, letterSpacing: 3, color: C.blue, fontWeight: 700}}>ACHIEVEMENT UNLOCKED</div>
							<div style={{fontSize: 30, fontWeight: 800, color: C.white, marginTop: 4}}>Legend of the Void</div>
							<div style={{fontSize: 16, color: C.muted, marginTop: 2}}>Rare · 2.1% of players</div>
						</div>
					</div>
				</GlassPanel>
			</Stage>

			{/* Light line between the centre dashboard and the friends panel */}
			{lineP > 0 && frame < 100 ? (
				<svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
					<line x1={a.x} y1={a.y} x2={lerp(a.x, b.x, lineP)} y2={lerp(a.y, b.y, lineP)} stroke={C.blue} strokeWidth={2.5} style={{filter: `drop-shadow(0 0 6px ${C.blue})`}} opacity={1 - ease(frame, 88, 10)} />
					<circle cx={lerp(a.x, b.x, (frame / 24) % 1)} cy={lerp(a.y, b.y, (frame / 24) % 1)} r={4} fill="#ffffff" opacity={lineP * (1 - ease(frame, 88, 10))} />
				</svg>
			) : null}

			{/* Panels collapse into a single glowing line */}
			{collapse > 0 ? (
				<div
					style={{
						position: 'absolute',
						left: 960 - 760,
						top: 540 - 1.5 + project(0, PANEL.y, -80, cam).y - 540,
						width: 1520,
						height: 3,
						borderRadius: 3,
						background: `linear-gradient(90deg, rgba(103,193,245,0), ${C.blue} 20%, #ffffff 50%, ${C.blue} 80%, rgba(103,193,245,0))`,
						boxShadow: '0 0 20px 4px rgba(103,193,245,0.7)',
						opacity: collapse,
					}}
				/>
			) : null}

			<div style={{position: 'absolute', left: 160, top: 828, opacity: 1 - collapse}}>
				<Interactive.Div name="Glass community headline">
					<Headline text="PLAY. CONNECT. ACHIEVE." start={30} size={92} accentWords={['CONNECT.']} />
				</Interactive.Div>
			</div>

			{subtitles ? (
				<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 48}}>
					<Interactive.Div name="Glass subtitle 5">
						<Subtitle text="Connect with friends. Celebrate every achievement." start={8} end={100} />
					</Interactive.Div>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};
