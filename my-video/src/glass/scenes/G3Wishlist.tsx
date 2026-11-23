import React from 'react';
import {AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {GameArt} from '../../steam/GameArt';
import {GAMES, fmt, salePrice} from '../../steam/games';
import {C, font} from '../../steam/theme';
import {Cursor, ease, easeIO, Headline, lerp, Subtitle} from '../../steam/ui';
import {Tag} from '../content';
import {GlassPanel} from '../Glass';
import {CAM0, Environment, place, project, Stage} from '../stage';
import {PRODUCT} from './G2Discover';
import type {GlassSceneProps} from './types';

const PAD = 26;
// Art slot inside the product panel (panel-local, top-left origin).
const ART = {x: PAD, y: PAD, w: 700, h: 394};
// Where the art lands in the library (screen space; shared with G4).
export const LIB_COVER = {x: 660, y: 330, w: 170, h: 255};
// Wishlist button inside the product panel (panel-local, top-left origin).
const WISH = {x: 760, y: 500, w: 300, h: 64};

const pop = (frame: number, start: number) =>
	interpolate(frame, [start, start + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.34, 1.56, 0.64, 1)});

export const G3Wishlist: React.FC<GlassSceneProps> = ({subtitles}) => {
	const frame = useCurrentFrame();
	const g = GAMES.starfall;

	const settle = easeIO(frame, 0, 20);
	const content = ease(frame, 14, 20);
	const promoIn = ease(frame, 10, 24);
	const promoGlow = ease(frame, 30, 18);
	const priceIn = ease(frame, 34, 16);
	const darken = ease(frame, 30, 20) * 0.35;
	const out = easeIO(frame, 102, 18);

	// Gentle push-in with a little glass parallax; flattens before the hand-off.
	const flatten = easeIO(frame, 92, 10);
	const cam = {...CAM0, z: lerp(0, 60, easeIO(frame, 0, 92)) * (1 - flatten), ry: lerp(2, -2, easeIO(frame, 0, 92)) * (1 - flatten)};
	const panelRy = lerp(5, 0, flatten);

	const prod = {...PRODUCT, z: 0, ry: panelRy};
	const promo = {x: 640, y: -170, z: 140, w: 400, h: 330, ry: lerp(-10, 0, flatten)};
	const conf = {
		x: lerp(560, 640, ease(frame, 92, 16)),
		y: 170,
		z: lerp(lerp(-200, 240, ease(frame, 74, 16)), -260, ease(frame, 92, 16)),
		w: 420,
		h: 120,
		ry: lerp(0, -18, ease(frame, 92, 16)),
	};

	// Screen-space positions (panel is flat by the time these matter most).
	const panelTL = {x: 960 + PRODUCT.x - PRODUCT.w / 2, y: 540 + PRODUCT.y - PRODUCT.h / 2};
	const k = project(0, 0, 0, cam).k;
	const wishCenter = {x: 960 + (panelTL.x - 960 + WISH.x + WISH.w / 2) * k, y: 540 + (panelTL.y - 540 + WISH.y + WISH.h / 2) * k};

	const cur = ease(frame, 54, 16);
	const curX = lerp(1450, wishCenter.x + 40, cur);
	const curY = lerp(1000, wishCenter.y, cur);
	const press = interpolate(frame, [69, 72, 75], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const wished = frame >= 72;
	const pulse = interpolate(frame, [72, 96], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const flash = interpolate(frame, [80, 84, 94], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	// Art: fills the panel at first (continuing the morph), then sits in its slot,
	// then flies out of the page into the library cover position.
	const slotScreen = {x: panelTL.x + ART.x, y: panelTL.y + ART.y, w: ART.w, h: ART.h};
	const artIn = {
		x: lerp(PAD, ART.x, settle),
		y: lerp(PAD, ART.y, settle),
		w: lerp(PRODUCT.w - 2 * PAD, ART.w, settle),
		h: lerp(PRODUCT.h - 2 * PAD, ART.h, settle),
	};

	return (
		<AbsoluteFill>
			<Environment darken={darken} hazeX={42} />
			<Stage>
				{/* Product details panel */}
				<GlassPanel style={place(prod, cam)} glow={0.4} sweep={(frame - 40) / 30} opacity={1 - out}>
					{frame < 104 ? (
						<div style={{position: 'absolute', left: artIn.x, top: artIn.y}}>
							<GameArt game={g} t={frame} width={artIn.w} height={artIn.h} radius={10} titleSize={lerp(60, 44, settle)} />
						</div>
					) : null}
					<div style={{position: 'absolute', left: ART.x + ART.w + 30, top: PAD, width: PRODUCT.w - ART.w - 3 * PAD - 30, fontFamily: font, color: C.text, opacity: content, translate: `${(1 - content) * 30}px 0px`, display: 'flex', flexDirection: 'column', gap: 14}}>
						<div style={{fontSize: 36, fontWeight: 800, color: C.white, lineHeight: 1.1}}>{g.title}</div>
						<div style={{fontSize: 18, color: C.muted, lineHeight: 1.5}}>Chart a course through a living galaxy. Explore uncharted planets and build your crew.</div>
						<div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
							{g.tags.map((tg) => (
								<Tag key={tg}>{tg}</Tag>
							))}
						</div>
						<div style={{fontSize: 17, display: 'grid', gridTemplateColumns: '130px 1fr', rowGap: 6}}>
							<span style={{color: C.muted}}>REVIEWS</span>
							<span style={{color: C.blue}}>Very Positive</span>
							<span style={{color: C.muted}}>DEVELOPER</span>
							<span style={{color: C.blue}}>Nova Forge Studio</span>
						</div>
					</div>
					<div style={{position: 'absolute', left: PAD, top: ART.y + ART.h + 34, display: 'flex', gap: 14, opacity: content}}>
						{[1, 2, 3].map((i) => (
							<GameArt key={i} game={g} t={frame + i * 30} width={160} height={90} showTitle={false} radius={8} style={{filter: `hue-rotate(${i * 30}deg)`}} />
						))}
					</div>
					{/* Buttons */}
					<div style={{position: 'absolute', left: WISH.x - 200, top: WISH.y, width: 180, height: WISH.h, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontSize: 20, fontWeight: 700, color: C.white, background: `linear-gradient(180deg, ${C.green}, #5c9a1a)`, opacity: content}}>
						Add to Cart
					</div>
					<div
						style={{
							position: 'absolute',
							left: WISH.x,
							top: WISH.y,
							width: WISH.w,
							height: WISH.h,
							borderRadius: 12,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontFamily: font,
							fontSize: 20,
							fontWeight: 800,
							letterSpacing: 1.2,
							color: C.white,
							background: wished ? `linear-gradient(180deg, ${C.cta}, #1580d6)` : 'rgba(103,193,245,0.18)',
							border: `1px solid ${wished ? 'rgba(190,230,255,0.9)' : 'rgba(103,193,245,0.45)'}`,
							boxShadow: wished ? '0 0 26px rgba(26,159,255,0.6)' : 'none',
							opacity: content,
						}}
					>
						{wished ? '✓ ON WISHLIST' : '+ ADD TO WISHLIST'}
					</div>
				</GlassPanel>

				{/* Promotional offer panel */}
				<GlassPanel style={place({...promo, x: lerp(900, promo.x, promoIn)}, cam)} opacity={promoIn * (1 - out)} glow={0.3 + promoGlow * 0.6} padding={30} sweep={(frame - 44) / 22}>
					<div style={{fontFamily: font, color: C.text, display: 'flex', flexDirection: 'column', gap: 16}}>
						<div style={{fontSize: 16, letterSpacing: 3, color: C.blue, fontWeight: 700}}>WEEKEND DEAL</div>
						<div style={{display: 'flex', alignItems: 'baseline', gap: 16, translate: `${(1 - priceIn) * 40}px 0px`, opacity: priceIn}}>
							<div style={{fontSize: 96, fontWeight: 900, lineHeight: 1, color: C.discountText, scale: String(pop(frame, 36))}}>-60%</div>
						</div>
						<div style={{display: 'flex', alignItems: 'baseline', gap: 14, translate: `${(1 - priceIn) * 60}px 0px`, opacity: priceIn}}>
							<span style={{fontSize: 24, color: '#738895', textDecoration: 'line-through'}}>{fmt(g.price)}</span>
							<span style={{fontSize: 40, fontWeight: 800, color: C.white}}>{fmt(salePrice(g))}</span>
						</div>
						<div style={{fontSize: 18, color: C.muted}}>Offer ends in 2 days</div>
					</div>
				</GlassPanel>

				{/* Wishlist confirmation card */}
				<GlassPanel style={place(conf, cam)} opacity={ease(frame, 74, 10) * (1 - ease(frame, 100, 10))} glow={0.5} flash={flash} padding={24} radius={20}>
					<div style={{display: 'flex', alignItems: 'center', gap: 18, height: '100%', fontFamily: font}}>
						<div style={{width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${C.blue}, ${C.cta})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
							<svg width={30} height={28} viewBox="0 0 30 28">
								<path d="M15 27 C6 20 0 14 0 8 A8 8 0 0 1 15 4 A8 8 0 0 1 30 8 C30 14 24 20 15 27 Z" fill="#ffffff" />
							</svg>
						</div>
						<div>
							<div style={{fontSize: 24, fontWeight: 700, color: C.white}}>Added to your wishlist</div>
							<div style={{fontSize: 17, color: C.muted}}>We'll let you know about new deals</div>
						</div>
					</div>
				</GlassPanel>
			</Stage>

			{/* Blue circular pulse around the wishlist button */}
			{pulse > 0 && pulse < 1 ? (
				<div
					style={{
						position: 'absolute',
						left: wishCenter.x - 200,
						top: wishCenter.y - 200,
						width: 400,
						height: 400,
						borderRadius: '50%',
						border: `3px solid ${C.blue}`,
						boxShadow: `0 0 30px rgba(103,193,245,0.6), inset 0 0 30px rgba(103,193,245,0.3)`,
						scale: String(0.2 + pulse * 0.9),
						opacity: (1 - pulse) * 0.9,
					}}
				/>
			) : null}

			{/* Artwork flies out of the page to become a Library cover */}
			{frame >= 104 ? (
				<div style={{position: 'absolute', left: lerp(slotScreen.x, LIB_COVER.x, out), top: lerp(slotScreen.y, LIB_COVER.y, out), boxShadow: '0 30px 60px rgba(0,0,0,0.5)', borderRadius: 10}}>
					<GameArt game={g} t={frame} width={lerp(slotScreen.w, LIB_COVER.w, out)} height={lerp(slotScreen.h, LIB_COVER.h, out)} radius={10} titleSize={lerp(44, 20, out)} />
				</div>
			) : null}

			<div style={{position: 'absolute', left: 160, top: 828}}>
				<Interactive.Div name="Glass wishlist headline">
					<Headline text="EXPLORE. WISHLIST. PLAY." start={30} size={92} accentWords={['WISHLIST.']} exitAt={100} />
				</Interactive.Div>
			</div>

			<Cursor x={curX} y={curY} press={press} opacity={interpolate(frame, [54, 60, 90, 96], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />

			{subtitles ? (
				<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 48}}>
					<Interactive.Div name="Glass subtitle 3">
						<Subtitle text="Find incredible deals. Save your favorites." start={6} end={100} />
					</Interactive.Div>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};
