import React from 'react';
import {AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {GameArt} from '../GameArt';
import {GAMES} from '../games';
import {C, font} from '../theme';
import {ease, easeOutro, Headline, Subtitle} from '../ui';
import type {SceneProps} from './types';

type Status = 'ingame' | 'online' | 'away' | 'offline';
const FRIENDS: {name: string; status: Status; detail: string; color: string}[] = [
	{name: 'NovaRider', status: 'ingame', detail: 'Starfall Odyssey', color: '#ff7a59'},
	{name: 'PixelMage', status: 'online', detail: 'Online', color: '#a66bff'},
	{name: 'Kestrel', status: 'ingame', detail: 'Neon Drift', color: '#36c2a8'},
	{name: 'ByteKnight', status: 'online', detail: 'Online', color: '#ffb547'},
	{name: 'Lumen', status: 'away', detail: 'Away', color: '#5aa2ff'},
	{name: 'OrbitFox', status: 'offline', detail: 'Last online 2 hrs ago', color: '#7a8693'},
];
const STATUS_COLOR: Record<Status, string> = {ingame: '#90BA3C', online: '#57CBDE', away: '#E5B53B', offline: '#6b7480'};

const ACHIEVEMENTS = [
	{title: 'First Contact', desc: 'Discover your first alien world', rarity: '68.4% of players', icon: 'planet', colors: ['#3fd0ff', '#4a1a78']},
	{title: 'Stellar Navigator', desc: 'Chart 50 star systems', rarity: '21.7% of players', icon: 'compass', colors: ['#ffd08a', '#f0567a']},
	{title: 'Legend of the Void', desc: 'Defeat the Void Leviathan', rarity: '2.1% of players · Rare', icon: 'star', colors: ['#67C1F5', '#1A9FFF']},
];

const Icon: React.FC<{readonly kind: string; readonly colors: string[]; readonly size: number}> = ({kind, colors, size}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" style={{borderRadius: 8, flexShrink: 0}}>
		<defs>
			<linearGradient id={`ic-${kind}`} x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stopColor={colors[0]} />
				<stop offset="1" stopColor={colors[1]} />
			</linearGradient>
		</defs>
		<rect width={100} height={100} fill={`url(#ic-${kind})`} />
		{kind === 'planet' ? (
			<>
				<circle cx={50} cy={50} r={22} fill="#ffffff" />
				<ellipse cx={50} cy={50} rx={38} ry={10} fill="none" stroke="#ffffff" strokeWidth={5} transform="rotate(-20 50 50)" />
			</>
		) : kind === 'compass' ? (
			<>
				<circle cx={50} cy={50} r={30} fill="none" stroke="#ffffff" strokeWidth={6} />
				<path d="M50 24 L58 50 L50 76 L42 50 Z" fill="#ffffff" />
			</>
		) : (
			<path d="M50 16 L60 40 L86 42 L66 58 L72 84 L50 70 L28 84 L34 58 L14 42 L40 40 Z" fill="#ffffff" />
		)}
	</svg>
);

export const S5Friends: React.FC<SceneProps> = ({subtitles}) => {
	const frame = useCurrentFrame();
	const revealR = interpolate(frame, [0, 16], [0, 1400], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1)});
	const panelIn = ease(frame, 6, 22);
	const badge = interpolate(frame, [60, 76], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.34, 1.56, 0.64, 1)});
	const collapse = easeOutro(frame, 100, 20);

	return (
		<AbsoluteFill style={{background: C.bg}}>
			{/* In-game backdrop */}
			<AbsoluteFill style={{opacity: 0.35, filter: 'blur(16px)', scale: '1.1'}}>
				<GameArt game={GAMES.starfall} t={frame} width={1920} height={1080} showTitle={false} radius={0} />
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(23,26,33,0.92) 0%, rgba(23,26,33,0.6) 60%, rgba(23,26,33,0.9) 100%)'}} />

			{/* Everything collapses toward the centre at the end */}
			<AbsoluteFill style={{scale: String(1 - collapse * 0.8), opacity: 1 - collapse, filter: `blur(${collapse * 6}px)`}}>
				{/* Achievements */}
				<div style={{position: 'absolute', left: 200, top: 120, width: 800, fontFamily: font, color: C.text, opacity: ease(frame, 14, 16)}}>
					<div style={{fontSize: 18, letterSpacing: 3, color: C.muted}}>ACHIEVEMENTS</div>
					<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6}}>
						<div style={{fontSize: 36, fontWeight: 700, color: C.white}}>Starfall Odyssey</div>
						<div style={{fontSize: 22}}>{frame >= 70 ? 28 : 27} / 40</div>
					</div>
					<div style={{height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)', marginTop: 12, overflow: 'hidden'}}>
						<div style={{width: `${interpolate(frame, [20, 40, 70, 80], [0, 67.5, 67.5, 70], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}%`, height: '100%', background: `linear-gradient(90deg, ${C.cta}, ${C.blue})`}} />
					</div>
				</div>
				{ACHIEVEMENTS.map((a, i) => {
					const p = ease(frame, 24 + i * 9, 22);
					const isRare = i === 2;
					return (
						<div
							key={a.title}
							style={{
								position: 'absolute',
								left: 200,
								top: 290 + i * 134,
								width: 800,
								height: 116,
								display: 'flex',
								alignItems: 'center',
								gap: 22,
								padding: '0 22px',
								borderRadius: 8,
								background: isRare ? 'linear-gradient(90deg, rgba(26,159,255,0.28), rgba(30,42,56,0.95))' : 'rgba(30,42,56,0.92)',
								border: isRare ? `1px solid ${C.blue}` : '1px solid rgba(255,255,255,0.06)',
								boxShadow: `0 ${10 + i * 6}px ${24 + i * 8}px rgba(0,0,0,0.45)`,
								fontFamily: font,
								opacity: p,
								translate: `0px ${(1 - p) * 70}px`,
								scale: String(0.94 + p * 0.06),
							}}
						>
							<Icon kind={a.icon} colors={a.colors} size={76} />
							<div style={{display: 'flex', flexDirection: 'column', gap: 4, flex: 1}}>
								<div style={{fontSize: 28, fontWeight: 700, color: C.white}}>{a.title}</div>
								<div style={{fontSize: 19, color: C.muted}}>{a.desc}</div>
							</div>
							<div style={{fontSize: 17, color: isRare ? C.blue : C.muted, textAlign: 'right'}}>
								Unlocked
								<br />
								{a.rarity}
							</div>
						</div>
					);
				})}

				{/* Achievement badge with premium glow */}
				<div style={{position: 'absolute', left: 1200 - 160, top: 470 - 160, width: 320, height: 320}}>
					<svg width={320} height={320} viewBox="-160 -160 320 320" style={{position: 'absolute', overflow: 'visible'}}>
						<defs>
							<radialGradient id="badge-glow">
								<stop offset="0" stopColor={C.blue} stopOpacity="0.7" />
								<stop offset="1" stopColor={C.blue} stopOpacity="0" />
							</radialGradient>
							<linearGradient id="badge-fill" x1="0" y1="0" x2="1" y2="1">
								<stop offset="0" stopColor="#9fdcff" />
								<stop offset="0.5" stopColor={C.cta} />
								<stop offset="1" stopColor="#0b4f9c" />
							</linearGradient>
						</defs>
						<circle r={230 * badge} fill="url(#badge-glow)" opacity={0.6 + 0.2 * Math.sin(frame / 6)} />
						<g transform={`rotate(${frame * 0.6})`} opacity={badge * 0.35}>
							{Array.from({length: 12}).map((_, i) => (
								<path key={i} transform={`rotate(${i * 30})`} d="M-8 -120 L0 -210 L8 -120 Z" fill={C.blue} />
							))}
						</g>
						<g transform={`scale(${badge})`}>
							<path d="M0 -110 L95 -55 L95 55 L0 110 L-95 55 L-95 -55 Z" fill="url(#badge-fill)" stroke="#d8f1ff" strokeWidth={6} />
							<path d="M0 -86 L74 -43 L74 43 L0 86 L-74 43 L-74 -43 Z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={3} />
							<path d="M0 -50 L14 -16 L50 -14 L22 8 L31 44 L0 24 L-31 44 L-22 8 L-50 -14 L-14 -16 Z" fill="#ffffff" />
							{/* shine sweep */}
							<path d={`M${-160 + ((frame - 66) * 14)} -120 l40 0 l-80 240 l-40 0 Z`} fill="#ffffff" opacity={0.25} />
						</g>
					</svg>
				</div>
				<div style={{position: 'absolute', left: 1200 - 200, top: 650, width: 400, textAlign: 'center', fontFamily: font, opacity: ease(frame, 70, 12), translate: `0px ${(1 - ease(frame, 70, 12)) * 16}px`}}>
					<div style={{fontSize: 17, letterSpacing: 4, color: C.blue, fontWeight: 700}}>ACHIEVEMENT UNLOCKED</div>
					<div style={{fontSize: 28, color: C.white, fontWeight: 700, marginTop: 6}}>Legend of the Void</div>
				</div>

				{/* Friends panel */}
				<div
					style={{
						position: 'absolute',
						left: 1420,
						top: 60,
						width: 400,
						height: 740,
						borderRadius: 10,
						background: 'rgba(30,35,41,0.97)',
						boxShadow: '0 30px 60px rgba(0,0,0,0.55)',
						translate: `${(1 - panelIn) * 520}px 0px`,
						fontFamily: font,
						overflow: 'hidden',
					}}
				>
					<div style={{padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 14, background: '#262c34'}}>
						<div style={{width: 54, height: 54, borderRadius: 6, background: 'linear-gradient(135deg, #67C1F5, #1A9FFF)', border: `3px solid ${STATUS_COLOR.online}`}} />
						<div>
							<div style={{fontSize: 22, fontWeight: 700, color: C.white}}>You</div>
							<div style={{fontSize: 16, color: STATUS_COLOR.online}}>Online</div>
						</div>
					</div>
					<div style={{padding: '18px 24px 8px', fontSize: 15, letterSpacing: 3, color: C.muted}}>FRIENDS · 4 ONLINE</div>
					{FRIENDS.map((f, i) => {
						const row = ease(frame, 16 + i * 4, 16);
						const dot = interpolate(frame, [24 + i * 4, 32 + i * 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.34, 1.56, 0.64, 1)});
						const ring = ((frame - 30 - i * 4) % 40) / 40;
						return (
							<div key={f.name} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', opacity: row, translate: `${(1 - row) * 40}px 0px`}}>
								<div style={{position: 'relative', width: 52, height: 52, flexShrink: 0}}>
									<div style={{width: 52, height: 52, borderRadius: 6, background: f.color, opacity: f.status === 'offline' ? 0.45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'rgba(255,255,255,0.9)'}}>
										{f.name[0]}
									</div>
									<div style={{position: 'absolute', right: -4, bottom: -4, width: 18, height: 18, borderRadius: '50%', background: STATUS_COLOR[f.status], border: '3px solid #1e2329', scale: String(dot)}} />
									{f.status !== 'offline' && ring > 0 ? (
										<div style={{position: 'absolute', right: -4, bottom: -4, width: 18, height: 18, borderRadius: '50%', border: `2px solid ${STATUS_COLOR[f.status]}`, scale: String(1 + ring * 1.5), opacity: (1 - ring) * dot}} />
									) : null}
								</div>
								<div style={{minWidth: 0}}>
									<div style={{fontSize: 21, fontWeight: 600, color: f.status === 'offline' ? C.muted : f.status === 'ingame' ? '#d8f0b0' : C.white}}>{f.name}</div>
									<div style={{fontSize: 16, color: STATUS_COLOR[f.status]}}>{f.status === 'ingame' ? `Playing ${f.detail}` : f.detail}</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Headline */}
				<div style={{position: 'absolute', left: 200, top: 812}}>
					<Interactive.Div name="Friends headline">
						<Headline text="PLAY BETTER. TOGETHER." start={48} size={104} accentWords={['TOGETHER.']} />
					</Interactive.Div>
				</div>
			</AbsoluteFill>

			{subtitles ? (
				<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 48}}>
					<Interactive.Div name="Subtitle 5">
						<Subtitle text="Connect with friends. Celebrate every achievement." start={10} end={100} />
					</Interactive.Div>
				</AbsoluteFill>
			) : null}

			{/* Blue circle from the PLAY button opens up to reveal this scene */}
			{revealR < 1400 ? (
				<AbsoluteFill
					style={{
						background: C.cta,
						maskImage: `radial-gradient(circle at 50% 50%, transparent ${revealR}px, black ${revealR + 1}px)`,
						WebkitMaskImage: `radial-gradient(circle at 50% 50%, transparent ${revealR}px, black ${revealR + 1}px)`,
					}}
				/>
			) : null}
		</AbsoluteFill>
	);
};
