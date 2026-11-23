import React from 'react';
import {AbsoluteFill, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {GameArt} from '../GameArt';
import {GAMES, fmt, salePrice} from '../games';
import {C, font} from '../theme';
import {ClickRipple, Cursor, ease, easeIO, Headline, lerp, NavBar, PriceBlock, Subtitle} from '../ui';
import type {SceneProps} from './types';

const ROW = [GAMES.neon, GAMES.ember, GAMES.frost, GAMES.tactics, GAMES.starfall, GAMES.skyreach, GAMES.hollow, GAMES.dune, GAMES.abyss, GAMES.wildgrove];
const SELECTED = 4;
const CARD_W = 520;
const CARD_H = 243;
const GAP = 40;
const ROW_X = 160;
const ROW_Y = 230;
const SCROLL = 1700;
const HOVER = 1.12;

const TABS = ['ACTION', 'RPG', 'STRATEGY'];

export const S2Discover: React.FC<SceneProps> = ({subtitles, logoSrc}) => {
	const frame = useCurrentFrame();
	const intro = ease(frame, 0, 18);
	const scroll = easeIO(frame, 10, 48) * SCROLL;
	const hover = ease(frame, 72, 14);
	const expand = easeIO(frame, 98, 22);

	// Active genre tab moves ACTION -> RPG -> STRATEGY while scrolling.
	const tabPos = interpolate(frame, [30, 42, 52, 64], [0, 1, 1, 2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const activeTab = Math.round(tabPos);

	// Cursor path
	const cur = ease(frame, 56, 18);
	const curX = lerp(1560, 1060, cur);
	const curY = lerp(980, 400, cur);
	const press = interpolate(frame, [89, 92, 95], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	// Hovered card rectangle (scaled around its centre) and the full-screen target.
	const cx = ROW_X + SELECTED * (CARD_W + GAP) - SCROLL + CARD_W / 2;
	const cy = ROW_Y + CARD_H / 2;
	const hw = CARD_W * HOVER;
	const hh = CARD_H * HOVER;
	const rect = {
		x: lerp(cx - hw / 2, 0, expand),
		y: lerp(cy - hh / 2, 0, expand),
		w: lerp(hw, 1920, expand),
		h: lerp(hh, 1080, expand),
	};
	const g = GAMES.starfall;

	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{scale: String(1.3 - intro * 0.3), filter: `blur(${(1 - intro) * 12}px)`}}>
				<AbsoluteFill style={{background: `linear-gradient(180deg, ${C.ui} 0%, #213a52 100%)`}} />
				<NavBar active="STORE" logoSrc={logoSrc} />

				{/* Genre tabs */}
				<div style={{position: 'absolute', left: ROW_X, top: 124, display: 'flex', gap: 16, fontFamily: font}}>
					{TABS.map((tab, i) => {
						const p = ease(frame, 8 + i * 4, 14);
						const active = i === activeTab;
						return (
							<div
								key={tab}
								style={{
									padding: '12px 30px',
									borderRadius: 999,
									fontSize: 24,
									fontWeight: 700,
									letterSpacing: 2,
									color: active ? C.white : C.text,
									background: active ? C.cta : 'rgba(255,255,255,0.06)',
									border: `1px solid ${active ? C.cta : 'rgba(255,255,255,0.12)'}`,
									opacity: p,
									translate: `0px ${(1 - p) * 20}px`,
								}}
							>
								{tab}
							</div>
						);
					})}
				</div>

				{/* Scrolling row of game cards */}
				{ROW.map((game, i) => {
					const x = ROW_X + i * (CARD_W + GAP) - scroll;
					const isSel = i === SELECTED;
					const enter = ease(frame, 6 + Math.min(i, 5) * 3, 20);
					return (
						<div
							key={game.id}
							style={{
								position: 'absolute',
								left: x,
								top: ROW_Y,
								opacity: isSel && expand > 0 ? 0 : enter * (isSel ? 1 : 1 - hover * 0.55),
								translate: `0px ${(1 - enter) * 40}px`,
								scale: String(isSel ? 1 + hover * (HOVER - 1) : 1),
								boxShadow: isSel ? `0 ${20 + hover * 20}px ${40 + hover * 30}px rgba(0,0,0,0.55)` : '0 16px 30px rgba(0,0,0,0.4)',
								outline: isSel ? `${hover * 3}px solid ${C.blue}` : 'none',
								borderRadius: 6,
							}}
						>
							<GameArt game={game} t={frame} width={CARD_W} height={CARD_H} />
						</div>
					);
				})}

				{/* Hover info panel */}
				<div
					style={{
						position: 'absolute',
						left: cx - hw / 2,
						top: cy + hh / 2 + 22,
						width: hw,
						padding: 22,
						background: 'rgba(15,25,34,0.95)',
						borderRadius: 6,
						fontFamily: font,
						color: C.text,
						opacity: ease(frame, 76, 12) * (1 - expand),
						translate: `0px ${(1 - ease(frame, 76, 12)) * 16}px`,
						display: 'flex',
						flexDirection: 'column',
						gap: 12,
					}}
				>
					<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
						<div style={{fontSize: 30, fontWeight: 700, color: C.white}}>{g.title}</div>
						<PriceBlock discount={g.discount} price={fmt(g.price)} sale={fmt(salePrice(g))} />
					</div>
					<div style={{display: 'flex', gap: 8}}>
						{g.tags.map((t) => (
							<div key={t} style={{fontSize: 17, background: 'rgba(103,193,245,0.15)', color: C.blue, padding: '4px 10px', borderRadius: 3}}>
								{t}
							</div>
						))}
					</div>
					<div style={{fontSize: 19, color: C.muted}}>Very Positive · 24,812 reviews</div>
				</div>

				{/* Headline */}
				<div style={{position: 'absolute', left: ROW_X, top: 792}}>
					<Interactive.Div name="Discover headline">
						<Headline text="DISCOVER MORE." start={28} size={112} accentWords={['MORE.']} exitAt={94} />
					</Interactive.Div>
				</div>
			</AbsoluteFill>

			{/* Selected card expanding to fill the screen */}
			{expand > 0 ? (
				<div style={{position: 'absolute', left: rect.x, top: rect.y}}>
					<GameArt game={g} t={frame} width={rect.w} height={rect.h} radius={6 * (1 - expand)} titleSize={lerp(42, 96, expand)} />
				</div>
			) : null}

			<Cursor x={curX} y={curY} press={press} opacity={interpolate(frame, [56, 62, 98, 104], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
			<ClickRipple x={curX + 6} y={curY + 4} at={92} />

			{subtitles ? (
				<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 48}}>
					<Interactive.Div name="Subtitle 2">
						<Subtitle text="Explore new worlds, tailored to your taste." start={6} end={100} />
					</Interactive.Div>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};
