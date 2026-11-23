import React from 'react';
import {AbsoluteFill, Easing, Interactive, interpolate, random, useCurrentFrame} from 'remotion';
import {GameArt} from '../GameArt';
import {GAMES} from '../games';
import {C, font} from '../theme';
import {ClickRipple, Cursor, ease, easeIO, Headline, lerp, Logo, Subtitle} from '../ui';
import {LIBRARY_TARGET} from './S3Wishlist';
import type {SceneProps} from './types';

const WIN = {x: 120, y: 50, w: 1680, h: 740};
const COVER_W = 170;
const COVER_H = 255;
const GRID = [GAMES.ember, GAMES.starfall, GAMES.frost, GAMES.neon, GAMES.hollow, GAMES.skyreach];
const SIDEBAR = [GAMES.abyss, GAMES.dune, GAMES.ember, GAMES.frost, GAMES.hollow, GAMES.neon, GAMES.skyreach, GAMES.starfall, GAMES.tactics, GAMES.wildgrove];
const PLAY = {x: 1080, y: 662, w: 250, h: 76};

const coverPos = (i: number) => ({x: 460 + (i % 3) * (COVER_W + 24), y: LIBRARY_TARGET.y + Math.floor(i / 3) * (COVER_H + 24)});

export const S4Library: React.FC<SceneProps> = ({subtitles, logoSrc}) => {
	const frame = useCurrentFrame();
	const g = GAMES.starfall;

	const slide = ease(frame, 0, 22);
	const highlight = ease(frame, 40, 12);
	const panel = ease(frame, 42, 16);
	const progress = interpolate(frame, [46, 78], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.45, 0, 0.25, 1)});
	const done = frame >= 78;
	const playPop = interpolate(frame, [78, 86], [0.85, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.34, 1.56, 0.64, 1)});
	const glow = done ? 0.5 + 0.5 * Math.sin((frame - 78) / 4) : 0;

	const cur = ease(frame, 82, 14);
	const curX = lerp(1520, PLAY.x + PLAY.w / 2, cur);
	const curY = lerp(1020, PLAY.y + PLAY.h / 2, cur);
	const press = interpolate(frame, [95, 98, 101], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	const wipe = easeIO(frame, 100, 20);
	const wipeR = wipe * 2300;
	const winY = WIN.y + (1 - slide) * 820;

	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 60% 30%, #1f3448 0%, #171A21 70%)'}} />

			{/* Library window slides up */}
			<div
				style={{
					position: 'absolute',
					left: WIN.x,
					top: winY,
					width: WIN.w,
					height: WIN.h,
					borderRadius: 12,
					overflow: 'hidden',
					background: `linear-gradient(180deg, #20354a 0%, ${C.ui} 100%)`,
					boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
					border: '1px solid rgba(255,255,255,0.06)',
				}}
			>
				<div style={{height: 64, background: C.bg, display: 'flex', alignItems: 'center', gap: 44, padding: '0 32px', fontFamily: font, fontWeight: 700, fontSize: 20, letterSpacing: 1.5, color: C.text}}>
					<Logo size={24} src={logoSrc} />
					<span>STORE</span>
					<span style={{color: C.blue}}>LIBRARY</span>
					<span>COMMUNITY</span>
					<span>PROFILE</span>
				</div>
				{/* Sidebar */}
				<div style={{position: 'absolute', left: 0, top: 64, bottom: 0, width: 300, background: '#171d25', padding: '20px 18px', fontFamily: font, fontSize: 19, color: C.text, display: 'flex', flexDirection: 'column', gap: 10}}>
					<div style={{fontSize: 15, letterSpacing: 2, color: C.muted, marginBottom: 6}}>ALL GAMES (10)</div>
					{SIDEBAR.map((game) => (
						<div
							key={game.id}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 12,
								padding: '5px 8px',
								borderRadius: 4,
								background: game.id === g.id ? `rgba(103,193,245,${0.25 * highlight})` : 'transparent',
								color: game.id === g.id && highlight > 0.5 ? C.white : C.text,
							}}
						>
							<GameArt game={game} t={frame} width={30} height={30} showTitle={false} radius={3} />
							{game.title}
						</div>
					))}
				</div>
				<div style={{position: 'absolute', left: 340, top: 84, fontFamily: font, fontSize: 18, letterSpacing: 2, color: C.muted}}>RECENT GAMES</div>
			</div>

			{/* Grid of covers (positioned in screen space so the S3 thumbnail lands exactly) */}
			{GRID.map((game, i) => {
				const pos = coverPos(i);
				const isSel = game.id === g.id;
				const fly = isSel ? 1 : ease(frame, 12 + i * 3, 22);
				const fromX = (random(`fx${i}`) - 0.5) * 900;
				const fromY = 500 + random(`fy${i}`) * 300;
				const rot = (random(`fr${i}`) - 0.5) * 40;
				return (
					<div
						key={game.id}
						style={{
							position: 'absolute',
							left: pos.x,
							top: pos.y + (isSel ? 0 : winY - WIN.y),
							translate: `${(1 - fly) * fromX}px ${(1 - fly) * fromY}px`,
							rotate: `${(1 - fly) * rot}deg`,
							opacity: isSel ? 1 : fly * (1 - highlight * 0.55),
							scale: String(isSel ? 1 + highlight * 0.06 : 1),
							borderRadius: 6,
							boxShadow: isSel ? `0 0 ${highlight * 40}px rgba(103,193,245,${highlight * 0.8}), 0 20px 40px rgba(0,0,0,0.5)` : '0 16px 30px rgba(0,0,0,0.45)',
							outline: isSel ? `${highlight * 3}px solid ${C.blue}` : 'none',
						}}
					>
						<GameArt game={game} t={frame} width={COVER_W} height={COVER_H} titleSize={20} />
					</div>
				);
			})}

			{/* Detail panel for the highlighted game */}
			<div
				style={{
					position: 'absolute',
					left: 1080,
					top: LIBRARY_TARGET.y,
					width: 680,
					fontFamily: font,
					color: C.text,
					opacity: panel,
					translate: `${(1 - panel) * 40}px 0px`,
					display: 'flex',
					flexDirection: 'column',
					gap: 16,
				}}
			>
				<GameArt game={g} t={frame} width={680} height={300} titleSize={40} />
				<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 20}}>
					<span style={{color: done ? C.green : C.blue, fontWeight: 700, letterSpacing: 1}}>{done ? 'DOWNLOAD COMPLETE' : 'DOWNLOADING…'}</span>
					<span>{(progress * 12.6).toFixed(1)} GB / 12.6 GB</span>
				</div>
				<div style={{height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.1)', overflow: 'hidden'}}>
					<div style={{width: `${progress * 100}%`, height: '100%', background: done ? C.green : `linear-gradient(90deg, ${C.cta}, ${C.blue})`}} />
				</div>
			</div>

			{/* PLAY button */}
			<div
				style={{
					position: 'absolute',
					left: PLAY.x,
					top: PLAY.y,
					width: PLAY.w,
					height: PLAY.h,
					borderRadius: 4,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 14,
					fontFamily: font,
					fontSize: 30,
					fontWeight: 800,
					letterSpacing: 2,
					color: C.white,
					background: done ? `linear-gradient(90deg, ${C.green}, #5c9a1a)` : '#3d4f5f',
					boxShadow: done ? `0 0 ${20 + glow * 40}px rgba(117,176,34,${0.5 + glow * 0.4})` : 'none',
					opacity: panel,
					scale: String(done ? playPop * (1 - press * 0.05) : 1),
				}}
			>
				<svg width={24} height={26} viewBox="0 0 24 26">
					<path d="M2 1 L23 13 L2 25 Z" fill="#ffffff" />
				</svg>
				{done ? 'PLAY' : 'INSTALL'}
			</div>

			{/* Headline */}
			<div style={{position: 'absolute', left: 160, top: 812}}>
				<Interactive.Div name="Library headline">
					<Headline text="READY WHEN YOU ARE." start={56} size={104} accentWords={['READY']} />
				</Interactive.Div>
			</div>

			<Cursor x={curX} y={curY} press={press} opacity={interpolate(frame, [82, 88], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
			<ClickRipple x={curX + 6} y={curY + 4} at={98} />

			{subtitles ? (
				<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 48}}>
					<Interactive.Div name="Subtitle 4">
						<Subtitle text="Your entire gaming library. One place." start={6} end={100} />
					</Interactive.Div>
				</AbsoluteFill>
			) : null}

			{/* Play button expands into a full-screen blue circular wipe */}
			{wipe > 0 ? (
				<div
					style={{
						position: 'absolute',
						left: PLAY.x + PLAY.w / 2 - wipeR,
						top: PLAY.y + PLAY.h / 2 - wipeR,
						width: wipeR * 2,
						height: wipeR * 2,
						borderRadius: '50%',
						background: C.cta,
					}}
				/>
			) : null}
		</AbsoluteFill>
	);
};
