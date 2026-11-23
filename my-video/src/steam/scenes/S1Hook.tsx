import React from 'react';
import {AbsoluteFill, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {GameArt} from '../GameArt';
import {GAMES, fmt, salePrice} from '../games';
import {C, font} from '../theme';
import {ease, easeOutro, Headline, NavBar, PriceBlock, Subtitle} from '../ui';
import type {SceneProps} from './types';

const OFFERS = [GAMES.neon, GAMES.tactics, GAMES.dune, GAMES.ember];

export const S1Hook: React.FC<SceneProps> = ({subtitles, logoSrc}) => {
	const frame = useCurrentFrame();
	const g = GAMES.starfall;

	const line = ease(frame, 0, 18);
	const reveal = ease(frame, 14, 26);
	const card = (delay: number) => ease(frame, delay, 26);
	const push = easeOutro(frame, 96, 24);
	const scrim = interpolate(frame, [40, 52, 88, 98], [0, 0.72, 0.72, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: C.bg}}>
			{/* Camera: pushes into the featured card at the end */}
			<AbsoluteFill
				style={{
					transformOrigin: '740px 400px',
					scale: String(1 + push * 1.8),
					filter: `blur(${push * 10}px) brightness(${1 + push * 0.4})`,
				}}
			>
				{/* Store UI revealed through a mask that opens from the line */}
				<AbsoluteFill style={{clipPath: `inset(${(1 - reveal) * 50}% 0 ${(1 - reveal) * 50}% 0)`}}>
					<AbsoluteFill style={{background: `linear-gradient(180deg, ${C.ui} 0%, #213a52 100%)`}} />
					<NavBar active="STORE" logoSrc={logoSrc} />
					<div style={{position: 'absolute', left: 240, top: 112, fontFamily: font, fontSize: 22, fontWeight: 600, letterSpacing: 2, color: C.text, opacity: card(20)}}>
						FEATURED &amp; RECOMMENDED
					</div>
					<div style={{position: 'absolute', inset: 0, perspective: 1600}}>
						{/* Featured carousel card */}
						<div
							style={{
								position: 'absolute',
								left: 240,
								top: 156,
								width: 1440,
								height: 480,
								display: 'flex',
								boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
								transformOrigin: '50% 100%',
								rotate: `x ${(1 - card(20)) * 28}deg`,
								translate: `0px ${(1 - card(20)) * 80}px`,
								opacity: card(20),
							}}
						>
							<GameArt game={g} t={frame} width={1000} height={480} radius={0} titleSize={54} />
							<div style={{flex: 1, background: '#0f1922', padding: 28, fontFamily: font, color: C.text, display: 'flex', flexDirection: 'column', gap: 18}}>
								<div style={{fontSize: 34, fontWeight: 700, color: C.white}}>{g.title}</div>
								<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
									{[1, 2, 3, 4].map((i) => (
										<GameArt key={i} game={g} t={frame + i * 40} width={186} height={104} showTitle={false} radius={2} style={{filter: `hue-rotate(${i * 25}deg)`}} />
									))}
								</div>
								<div style={{fontSize: 22}}>Now Available</div>
								<div style={{display: 'flex', gap: 8}}>
									{g.tags.slice(0, 3).map((t) => (
										<div key={t} style={{fontSize: 16, background: 'rgba(103,193,245,0.15)', color: C.blue, padding: '4px 10px', borderRadius: 3}}>
											{t}
										</div>
									))}
								</div>
								<div style={{flex: 1}} />
								<PriceBlock discount={g.discount} price={fmt(g.price)} sale={fmt(salePrice(g))} />
							</div>
						</div>
						{/* Special offers row */}
						<div style={{position: 'absolute', left: 240, top: 668, fontFamily: font, fontSize: 22, fontWeight: 600, letterSpacing: 2, color: C.text, opacity: card(30)}}>
							SPECIAL OFFERS
						</div>
						{OFFERS.map((game, i) => {
							const p = card(30 + i * 4);
							return (
								<div
									key={game.id}
									style={{
										position: 'absolute',
										left: 240 + i * 368,
										top: 706,
										transformOrigin: '50% 100%',
										rotate: `x ${(1 - p) * 35}deg`,
										translate: `0px ${(1 - p) * 90}px`,
										scale: String(0.92 + p * 0.08),
										opacity: p,
										boxShadow: '0 20px 40px rgba(0,0,0,0.45)',
									}}
								>
									<GameArt game={game} t={frame} width={336} height={157} radius={4} />
								</div>
							);
						})}
					</div>
				</AbsoluteFill>
			</AbsoluteFill>

			{/* The electric-blue line that opens the scene */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 539,
					height: 3,
					width: `${line * 100}%`,
					background: C.blue,
					boxShadow: `0 0 24px 4px ${C.blue}`,
					opacity: interpolate(frame, [18, 30], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
				}}
			/>

			{/* Kinetic hook headline over a dark scrim */}
			<AbsoluteFill style={{background: `rgba(23,26,33,${scrim})`}} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 160px'}}>
				<Interactive.Div name="Hook headline" style={{maxWidth: 1500}}>
					<Headline text="YOUR NEXT ADVENTURE STARTS HERE." start={44} size={128} align="center" accentWords={['ADVENTURE']} exitAt={88} />
				</Interactive.Div>
			</AbsoluteFill>

			{subtitles ? (
				<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 48}}>
					<Interactive.Div name="Subtitle 1">
						<Subtitle text="Every great game starts with discovery." start={6} end={100} />
					</Interactive.Div>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};
