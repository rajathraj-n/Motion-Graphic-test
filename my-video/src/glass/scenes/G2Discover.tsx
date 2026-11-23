import React from 'react';
import {AbsoluteFill, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {GAMES, fmt, salePrice} from '../../steam/games';
import {C, font} from '../../steam/theme';
import {ClickRipple, Cursor, ease, easeIO, Headline, lerp, PriceBlock, Subtitle} from '../../steam/ui';
import {ArtCard, Tag} from '../content';
import {BorderRunner, GlassPanel} from '../Glass';
import {dof, Environment, place, project, Stage} from '../stage';
import type {GlassSceneProps} from './types';

const CARD = {w: 440, h: 262};
const CARDS = [
	{game: GAMES.ember, x: -880, z: -380},
	{game: GAMES.frost, x: -450, z: -170},
	{game: GAMES.starfall, x: 0, z: 0},
	{game: GAMES.neon, x: 450, z: -170},
	{game: GAMES.tactics, x: 880, z: -380},
];
const CARDS_Y = 60;

// The product-details panel the selected card morphs into (shared with G3).
export const PRODUCT = {x: -180, y: -50, w: 1180, h: 600};

const TABS = ['ACTION', 'RPG', 'STRATEGY'];

export const G2Discover: React.FC<GlassSceneProps> = ({subtitles}) => {
	const frame = useCurrentFrame();
	const g = GAMES.starfall;

	const pull = easeIO(frame, 0, 24);
	const searchIn = ease(frame, 26, 24);
	const lift = ease(frame, 62, 16);
	const info = ease(frame, 68, 14);
	const morph = easeIO(frame, 92, 28);

	const cam = {
		x: lerp(0, -40, easeIO(frame, 0, 120)) + Math.sin(frame / 40) * 6,
		y: 0,
		z: lerp(900, 0, pull),
		rx: 0,
		ry: lerp(-4, 3, easeIO(frame, 0, 120)),
	};

	// Active category moves ACTION -> RPG -> STRATEGY.
	const active = frame < 46 ? 0 : frame < 56 ? 1 : 2;

	// Selected card: lifts 80px toward camera, then morphs into the product panel.
	const sel = {
		x: lerp(0, PRODUCT.x, morph),
		y: lerp(CARDS_Y, PRODUCT.y, morph),
		z: lerp(lift * 80, 0, morph),
		w: lerp(CARD.w, PRODUCT.w, morph),
		h: lerp(CARD.h, PRODUCT.h, morph),
		ry: 0,
	};
	const selScreen = project(sel.x, sel.y, sel.z, cam);
	const curTarget = {x: selScreen.x + 60, y: selScreen.y + 10};
	const cur = ease(frame, 50, 16);
	const curX = lerp(1500, curTarget.x, cur);
	const curY = lerp(1000, curTarget.y, cur);
	const press = interpolate(frame, [59, 62, 65], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill>
			<Environment darken={lift * 0.25} />
			<Stage>
				{CARDS.map((c, i) => {
					if (i === 2) return null;
					const bob = Math.sin(frame / 22 + i) * 8;
					const away = morph;
					const p = {
						x: c.x * (1 + away * 0.6),
						y: CARDS_Y + bob,
						z: c.z + away * 1300,
						w: CARD.w,
						h: CARD.h,
						ry: c.x > 0 ? -10 : 10,
					};
					return (
						<GlassPanel key={c.game.id} style={place(p, cam)} padding={12} radius={20} glow={0.2} blur={dof(c.z, 0, 0.9) + away * 4} opacity={(1 - lift * 0.4) * (1 - away)} sweep={(frame - i * 8) / 50}>
							<ArtCard game={c.game} t={frame} w={CARD.w - 24} h={CARD.h - 24} titleSize={26} />
						</GlassPanel>
					);
				})}

				{/* Search & category glass panel */}
				<GlassPanel
					style={place({x: 0, y: lerp(-520, -300, searchIn), z: 160, w: 1040, h: 120, rx: 0}, cam)}
					opacity={searchIn * (1 - morph)}
					glow={0.3}
					padding={24}
					radius={22}
					sweep={(frame - 40) / 30}
				>
					<div style={{display: 'flex', alignItems: 'center', gap: 18, height: '100%', fontFamily: font}}>
						<div style={{flex: 1, height: 64, borderRadius: 14, background: 'rgba(23,26,33,0.6)', border: '1px solid rgba(103,193,245,0.2)', display: 'flex', alignItems: 'center', padding: '0 22px', gap: 14, color: C.muted, fontSize: 22}}>
							<svg width={24} height={24} viewBox="0 0 24 24">
								<circle cx={10} cy={10} r={7} fill="none" stroke={C.muted} strokeWidth={2.5} />
								<path d="M15 15 L22 22" stroke={C.muted} strokeWidth={2.5} strokeLinecap="round" />
							</svg>
							Search the store
						</div>
						{TABS.map((tab, i) => {
							const p = ease(frame, 34 + i * 5, 12);
							const on = i === active;
							return (
								<div
									key={tab}
									style={{
										position: 'relative',
										width: 170,
										height: 64,
										borderRadius: 14,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontSize: 20,
										fontWeight: 700,
										letterSpacing: 2,
										color: on ? C.white : C.text,
										background: on ? 'linear-gradient(180deg, rgba(26,159,255,0.85), rgba(26,159,255,0.6))' : 'rgba(255,255,255,0.05)',
										border: `1px solid ${on ? 'rgba(160,215,255,0.9)' : 'rgba(255,255,255,0.12)'}`,
										boxShadow: on ? '0 0 22px rgba(26,159,255,0.55)' : 'none',
										opacity: p,
										translate: `0px ${(1 - p) * 14}px`,
									}}
								>
									{tab}
									{on ? <BorderRunner w={170} h={64} r={14} t={frame / 30} /> : null}
								</div>
							);
						})}
					</div>
				</GlassPanel>

				{/* Selected card -> product details panel */}
				<GlassPanel style={place(sel, cam)} padding={lerp(12, 26, morph)} radius={lerp(20, 26, morph)} glow={0.3 + lift * 0.5} sweep={(frame - 70) / 26}>
					<ArtCard game={g} t={frame} w={sel.w - 2 * lerp(12, 26, morph)} h={sel.h - 2 * lerp(12, 26, morph)} active={lift * (1 - morph)} titleSize={lerp(26, 60, morph)} />
				</GlassPanel>

				{/* Translucent info panel beside the selected card */}
				<GlassPanel style={place({x: 420, y: CARDS_Y - 10, z: 120, w: 360, h: 250, ry: -8}, cam)} opacity={info * (1 - morph * 2)} glow={0.35} padding={22} radius={20}>
					<div style={{fontFamily: font, color: C.text, display: 'flex', flexDirection: 'column', gap: 12}}>
						<div style={{fontSize: 26, fontWeight: 700, color: C.white}}>{g.title}</div>
						<div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
							{g.tags.slice(0, 3).map((tg) => (
								<Tag key={tg}>{tg}</Tag>
							))}
						</div>
						<div style={{fontSize: 17, color: C.muted}}>Very Positive · 24,812 reviews</div>
						<PriceBlock discount={g.discount} price={fmt(g.price)} sale={fmt(salePrice(g))} />
					</div>
				</GlassPanel>
			</Stage>

			<div style={{position: 'absolute', left: 160, top: 828}}>
				<Interactive.Div name="Glass discover headline">
					<Headline text="DISCOVER NEW WORLDS" start={30} size={92} accentWords={['NEW', 'WORLDS']} exitAt={92} />
				</Interactive.Div>
			</div>

			<Cursor x={curX} y={curY} press={press} opacity={interpolate(frame, [50, 56, 86, 92], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
			<ClickRipple x={curX + 6} y={curY + 4} at={62} />

			{subtitles ? (
				<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 48}}>
					<Interactive.Div name="Glass subtitle 2">
						<Subtitle text="Explore new worlds, tailored to your taste." start={6} end={100} />
					</Interactive.Div>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};
