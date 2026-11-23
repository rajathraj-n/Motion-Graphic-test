import React from 'react';
import {AbsoluteFill, Img, Interactive, interpolate, random, useCurrentFrame} from 'remotion';
import {GameArt} from '../GameArt';
import {GAMES} from '../games';
import {C, font} from '../theme';
import {ease, easeOutro, Subtitle} from '../ui';
import type {SceneProps} from './types';

const WALL = [GAMES.neon, GAMES.ember, GAMES.frost, GAMES.tactics, GAMES.starfall, GAMES.skyreach, GAMES.hollow, GAMES.dune, GAMES.abyss];
const CW = 460;
const CH = 215;
const GAP = 28;

export const S6Brand: React.FC<SceneProps> = ({subtitles, logoSrc}) => {
	const frame = useCurrentFrame();
	const wallOut = easeOutro(frame, 38, 20);
	const logo = ease(frame, 56, 26);
	const glow = ease(frame, 50, 30);
	const cta = ease(frame, 92, 16);

	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, rgba(26,159,255,${0.22 * glow}) 0%, transparent 55%)`}} />

			{/* Cards and panels assemble into a tilted wall, then the camera passes through it */}
			<AbsoluteFill style={{perspective: 1400, opacity: 1 - wallOut}}>
				<div
					style={{
						position: 'absolute',
						left: 960 - (3 * CW + 2 * GAP) / 2,
						top: 540 - (3 * CH + 2 * GAP) / 2,
						width: 3 * CW + 2 * GAP,
						height: 3 * CH + 2 * GAP,
						transformStyle: 'preserve-3d',
						rotate: `x ${16 - wallOut * 10}deg`,
						scale: String(0.9 + wallOut * 0.8),
					}}
				>
					<div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', rotate: `y ${-14 + frame * 0.12}deg`}}>
						{WALL.map((game, i) => {
							const p = ease(frame, i * 3, 26);
							const ang = random(`a${i}`) * Math.PI * 2;
							const fromX = Math.cos(ang) * 1400;
							const fromY = Math.sin(ang) * 900;
							return (
								<div
									key={game.id}
									style={{
										position: 'absolute',
										left: (i % 3) * (CW + GAP),
										top: Math.floor(i / 3) * (CH + GAP),
										translate: `${(1 - p) * fromX}px ${(1 - p) * fromY}px`,
										rotate: `${(1 - p) * (random(`r${i}`) - 0.5) * 50}deg`,
										opacity: p,
										boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
										borderRadius: 6,
									}}
								>
									<GameArt game={game} t={frame} width={CW} height={CH} />
								</div>
							);
						})}
					</div>
				</div>
			</AbsoluteFill>

			{/* Logo, tagline and call to action */}
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 34}}>
				<Interactive.Div
					name="Logo"
					style={{
						opacity: logo,
						scale: String(0.9 + logo * 0.1),
						filter: `drop-shadow(0 0 ${30 * glow}px rgba(103,193,245,0.55))`,
					}}
				>
					{logoSrc ? (
						<Img src={logoSrc} style={{height: 190}} />
					) : (
						<div style={{fontFamily: font, fontWeight: 900, fontSize: 200, lineHeight: 1, color: C.white, letterSpacing: `${interpolate(logo, [0, 1], [0.32, 0.14])}em`, marginRight: '-0.14em'}}>
							STEAM
						</div>
					)}
				</Interactive.Div>
				<Interactive.Div name="Tagline" style={{display: 'flex', gap: 34, fontFamily: font, fontWeight: 600, fontSize: 40, letterSpacing: '0.32em', marginRight: '-0.32em', color: C.blue}}>
					{['DISCOVER.', 'PLAY.', 'CONNECT.'].map((w, i) => {
						const p = ease(frame, 74 + i * 6, 16);
						return (
							<span key={w} style={{opacity: p, translate: `0px ${(1 - p) * 18}px`}}>
								{w}
							</span>
						);
					})}
				</Interactive.Div>
				<Interactive.Div
					name="CTA button"
					style={{
						position: 'relative',
						overflow: 'hidden',
						marginTop: 16,
						padding: '22px 60px',
						borderRadius: 6,
						background: C.cta,
						fontFamily: font,
						fontWeight: 800,
						fontSize: 34,
						letterSpacing: '0.12em',
						color: C.white,
						boxShadow: `0 16px 40px rgba(26,159,255,${0.45 * cta})`,
						opacity: cta,
						scale: String(0.92 + cta * 0.08),
					}}
				>
					EXPLORE STEAM
					<div
						style={{
							position: 'absolute',
							top: 0,
							bottom: 0,
							width: 80,
							left: interpolate(frame, [100, 116], [-120, 520], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
							background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)',
							rotate: '20deg',
						}}
					/>
				</Interactive.Div>
			</AbsoluteFill>

			{subtitles ? (
				<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 48}}>
					<Interactive.Div name="Subtitle 6">
						<Subtitle text="Steam. Discover more. Play your way." start={8} end={120} />
					</Interactive.Div>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};
