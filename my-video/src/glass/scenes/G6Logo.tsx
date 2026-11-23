import React from 'react';
import {AbsoluteFill, Img, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {GameArt} from '../../steam/GameArt';
import {GAMES} from '../../steam/games';
import {C, font} from '../../steam/theme';
import {ease, easeIO, lerp, Subtitle} from '../../steam/ui';
import {Label} from '../content';
import {Beam, GlassPanel} from '../Glass';
import {CAM0, Environment, place, Stage} from '../stage';
import type {GlassSceneProps} from './types';

const PANELS = [
	{name: 'STORE', x: -560, art: [GAMES.starfall, GAMES.neon, GAMES.ember, GAMES.frost]},
	{name: 'LIBRARY', x: 0, art: [GAMES.hollow, GAMES.skyreach, GAMES.dune, GAMES.abyss]},
	{name: 'COMMUNITY', x: 560, art: []},
];

export const G6Logo: React.FC<GlassSceneProps> = ({subtitles, logoSrc}) => {
	const frame = useCurrentFrame();

	// The line from the previous scene becomes a horizontal light sweep.
	const beamW = easeIO(frame, 0, 16);
	const beamY = lerp(480, 540, easeIO(frame, 0, 14));
	const beamFade = 1 - interpolate(frame, [16, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	const emerge = (i: number) => ease(frame, 10 + i * 4, 22);
	const turn = easeIO(frame, 30, 14);
	const recede = (i: number) => easeIO(frame, 40 + i * 4, 20);
	const halo = ease(frame, 30, 30);
	const logo = ease(frame, 60, 16);
	const tagline = (i: number) => ease(frame, 82 + i * 5, 14);
	const cta = ease(frame, 98, 14);

	// Slow controlled pull-back that settles into a static hero composition.
	const cam = {...CAM0, z: lerp(120, 0, easeIO(frame, 0, 60))};

	return (
		<AbsoluteFill>
			<Environment haze={0.6 + halo * 0.6} />
			<AbsoluteFill style={{background: `radial-gradient(circle at 50% 46%, rgba(26,159,255,${0.18 * halo}) 0%, rgba(26,159,255,0) 38%)`}} />
			<Stage>
				{PANELS.map((p, i) => {
					const ry = lerp(i === 0 ? 14 : i === 2 ? -14 : 0, i === 0 ? 6 : i === 2 ? -6 : 0, turn);
					const pl = {x: p.x * lerp(1, 0.8, recede(i)), y: lerp(40, -10, emerge(i)), z: lerp(-200, -80, emerge(i)) - recede(i) * 1400, w: 480, h: 300, ry};
					return (
						<GlassPanel key={p.name} style={place(pl, cam)} opacity={emerge(i) * (1 - recede(i))} glow={0.45 * (1 - recede(i))} padding={20} sweep={(frame - 14 - i * 4) / 24}>
							<Label style={{color: C.blue}}>{p.name}</Label>
							{p.name === 'COMMUNITY' ? (
								<div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14, fontFamily: font}}>
									{['NovaRider', 'PixelMage', 'Kestrel'].map((n, j) => (
										<div key={n} style={{display: 'flex', alignItems: 'center', gap: 12}}>
											<div style={{width: 40, height: 40, borderRadius: 10, background: ['#ff7a59', '#a66bff', '#36c2a8'][j]}} />
											<div style={{flex: 1, height: 36, borderRadius: 10, background: 'rgba(103,193,245,0.12)', color: C.text, fontSize: 16, display: 'flex', alignItems: 'center', padding: '0 12px'}}>{n}: GG! 🎉</div>
										</div>
									))}
								</div>
							) : (
								<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14}}>
									{p.art.map((g) => (
										<GameArt key={g.id} game={g} t={frame} width={214} height={100} radius={8} titleSize={13} />
									))}
								</div>
							)}
						</GlassPanel>
					);
				})}
			</Stage>

			<Beam progress={1} width={lerp(1520, 1920, beamW)} y={beamY} thickness={lerp(3, 2, beamW)} opacity={beamFade} />
			{/* Bright band sweeping along the line */}
			<div style={{position: 'absolute', left: lerp(-200, 1920, beamW), top: beamY - 40, width: 260, height: 80, background: 'radial-gradient(ellipse, rgba(200,235,255,0.55) 0%, rgba(103,193,245,0) 70%)', opacity: beamFade}} />

			{/* End card */}
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 30, paddingBottom: 40}}>
				<Interactive.Div name="Glass logo" style={{opacity: logo, scale: String(0.98 + logo * 0.02)}}>
					{logoSrc ? (
						<Img src={logoSrc} style={{height: 180}} />
					) : (
						<div style={{fontFamily: font, fontWeight: 900, fontSize: 190, lineHeight: 1, letterSpacing: '0.14em', marginRight: '-0.14em', color: C.white}}>STEAM</div>
					)}
				</Interactive.Div>
				<Interactive.Div name="Glass tagline" style={{display: 'flex', gap: 30, fontFamily: font, fontWeight: 600, fontSize: 38, letterSpacing: '0.32em', marginRight: '-0.32em', color: C.blue}}>
					{['DISCOVER.', 'PLAY.', 'CONNECT.'].map((w, i) => (
						<span key={w} style={{opacity: tagline(i), translate: `0px ${(1 - tagline(i)) * 16}px`}}>
							{w}
						</span>
					))}
				</Interactive.Div>
				<Interactive.Div
					name="Glass CTA"
					style={{
						position: 'relative',
						overflow: 'hidden',
						marginTop: 14,
						padding: '20px 56px',
						borderRadius: 14,
						background: `linear-gradient(180deg, rgba(26,159,255,0.95), rgba(21,128,214,0.95))`,
						border: '1px solid rgba(190,230,255,0.8)',
						boxShadow: `0 0 ${24 * cta}px rgba(26,159,255,0.55), inset 0 1px 0 rgba(255,255,255,0.4)`,
						fontFamily: font,
						fontWeight: 800,
						fontSize: 30,
						letterSpacing: '0.14em',
						color: C.white,
						opacity: cta,
						translate: `0px ${(1 - cta) * 14}px`,
					}}
				>
					EXPLORE STEAM
					<div style={{position: 'absolute', top: 0, bottom: 0, width: 70, left: interpolate(frame, [106, 118], [-100, 460], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), rotate: '18deg', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)'}} />
				</Interactive.Div>
			</AbsoluteFill>

			{subtitles ? (
				<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 48}}>
					<Interactive.Div name="Glass subtitle 6">
						<Subtitle text="Steam. Discover more. Play your way." start={8} end={120} />
					</Interactive.Div>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};
