import React from 'react';
import {AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {GameArt} from '../GameArt';
import {GAMES, fmt, salePrice} from '../games';
import {C, font} from '../theme';
import {ClickRipple, Cursor, ease, easeIO, Headline, lerp, NavBar, PriceBlock, Subtitle} from '../ui';
import type {SceneProps} from './types';

// Where the cover lands in the next scene's library grid (see S4Library).
export const LIBRARY_TARGET = {x: 654, y: 170, w: 170, h: 255};

const HERO = {x: 160, y: 170, w: 1000, h: 470};
const WISH_BTN = {x: 1468, y: 696, w: 268, h: 64};

const pop = (frame: number, start: number) =>
	interpolate(frame, [start, start + 14], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.34, 1.56, 0.64, 1),
	});

export const S3Wishlist: React.FC<SceneProps> = ({subtitles, logoSrc}) => {
	const frame = useCurrentFrame();
	const g = GAMES.starfall;

	const settle = easeIO(frame, 0, 22);
	const page = ease(frame, 12, 22);
	const out = easeIO(frame, 100, 20);
	const pageOpacity = page * (1 - ease(frame, 98, 10));

	// Hero art: full screen -> hero banner -> library thumbnail.
	const heroRect = {
		x: lerp(lerp(0, HERO.x, settle), LIBRARY_TARGET.x, out),
		y: lerp(lerp(0, HERO.y, settle), LIBRARY_TARGET.y, out),
		w: lerp(lerp(1920, HERO.w, settle), LIBRARY_TARGET.w, out),
		h: lerp(lerp(1080, HERO.h, settle), LIBRARY_TARGET.h, out),
	};

	const cur = ease(frame, 32, 20);
	const curX = lerp(1300, WISH_BTN.x + 150, cur);
	const curY = lerp(1000, WISH_BTN.y + 26, cur);
	const press = interpolate(frame, [53, 56, 59], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const wished = frame >= 57;
	const wishPulse = interpolate(frame, [57, 62, 70], [1, 1.08, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const toast = ease(frame, 60, 16) * (1 - ease(frame, 96, 10));

	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{opacity: pageOpacity}}>
				<AbsoluteFill style={{background: `linear-gradient(180deg, #2a475e 0%, ${C.ui} 45%)`}} />
				<NavBar active="STORE" logoSrc={logoSrc} />
				<div style={{position: 'absolute', left: HERO.x, top: 98, fontFamily: font, fontWeight: 700, fontSize: 48, color: C.white, translate: `0px ${(1 - page) * 20}px`}}>
					{g.title}
				</div>

				{/* Right column */}
				<div style={{position: 'absolute', left: 1200, top: HERO.y, width: 560, fontFamily: font, color: C.text, display: 'flex', flexDirection: 'column', gap: 16, translate: `${(1 - page) * 40}px 0px`}}>
					<GameArt game={g} t={frame} width={560} height={210} showTitle={false} />
					<div style={{fontSize: 20, lineHeight: 1.45, color: C.muted}}>
						Chart a course through a living galaxy. Explore uncharted planets, build your crew and uncover the secret of the stars.
					</div>
					<div style={{fontSize: 18, display: 'grid', gridTemplateColumns: '170px 1fr', rowGap: 6}}>
						<span style={{color: C.muted}}>ALL REVIEWS:</span>
						<span style={{color: C.blue}}>Very Positive</span>
						<span style={{color: C.muted}}>DEVELOPER:</span>
						<span style={{color: C.blue}}>Nova Forge Studio</span>
					</div>
					<div style={{display: 'flex', gap: 8}}>
						{g.tags.map((t) => (
							<div key={t} style={{fontSize: 16, background: 'rgba(103,193,245,0.15)', color: C.blue, padding: '4px 10px', borderRadius: 3}}>
								{t}
							</div>
						))}
					</div>
				</div>

				{/* Purchase box */}
				<div
					style={{
						position: 'absolute',
						left: 160,
						top: 676,
						width: 1600,
						height: 104,
						borderRadius: 4,
						background: 'linear-gradient(90deg, rgba(103,193,245,0.14), rgba(0,0,0,0.25))',
						display: 'flex',
						alignItems: 'center',
						padding: '0 28px',
						gap: 24,
						fontFamily: font,
						color: C.white,
						translate: `0px ${(1 - page) * 30}px`,
					}}
				>
					<div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
						<div style={{fontSize: 28, fontWeight: 700}}>Buy {g.title}</div>
						<div style={{fontSize: 17, color: C.blue, letterSpacing: 1}}>SPECIAL PROMOTION! Offer ends soon</div>
					</div>
					<div style={{flex: 1}} />
					<div style={{scale: String(pop(frame, 26))}}>
						<PriceBlock discount={g.discount} price={fmt(g.price)} sale={fmt(salePrice(g))} scale={1.15} />
					</div>
					<div style={{width: 40}} />
					<div style={{fontSize: 22, padding: '18px 26px', borderRadius: 3, background: 'linear-gradient(90deg, #75B022, #588a1b)', fontWeight: 600}}>Add to Cart</div>
					<div style={{width: WISH_BTN.w}} />
				</div>
				<div
					style={{
						position: 'absolute',
						left: WISH_BTN.x,
						top: WISH_BTN.y,
						width: WISH_BTN.w,
						height: WISH_BTN.h,
						borderRadius: 3,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 10,
						fontFamily: font,
						fontSize: 22,
						fontWeight: 700,
						letterSpacing: 1,
						color: C.white,
						background: wished ? C.cta : 'rgba(103,193,245,0.22)',
						boxShadow: wished ? `0 0 30px rgba(26,159,255,0.6)` : 'none',
						scale: String(wishPulse),
						translate: `0px ${(1 - page) * 30}px`,
					}}
				>
					{wished ? '✓ ON WISHLIST' : 'ADD TO WISHLIST'}
				</div>

				{/* Headline */}
				<div style={{position: 'absolute', left: 160, top: 812}}>
					<Interactive.Div name="Wishlist headline">
						<Headline text="WISHLIST YOUR FAVORITES." start={62} size={104} accentWords={['FAVORITES.']} />
					</Interactive.Div>
				</div>
			</AbsoluteFill>

			{/* Hero art (lives outside the page so it can fly into the library) */}
			<div style={{position: 'absolute', left: heroRect.x, top: heroRect.y, boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
				<GameArt game={g} t={frame} width={heroRect.w} height={heroRect.h} radius={lerp(0, 6, settle)} titleSize={lerp(96, lerp(56, 20, out), settle)} />
				{/* Sale tag */}
				<div
					style={{
						position: 'absolute',
						left: 24,
						top: 24,
						padding: '10px 20px',
						borderRadius: 4,
						background: C.discountBg,
						color: C.discountText,
						fontFamily: font,
						fontWeight: 800,
						fontSize: 26,
						letterSpacing: 1,
						scale: String(pop(frame, 30) * Math.max(0, 1 - out * 3)),
						transformOrigin: 'left top',
					}}
				>
					-60% WEEKEND DEAL
				</div>
			</div>

			{/* Wishlist toast */}
			<div
				style={{
					position: 'absolute',
					right: 64,
					top: 104,
					display: 'flex',
					alignItems: 'center',
					gap: 16,
					padding: '18px 28px',
					background: '#1e2a38',
					borderLeft: `5px solid ${C.cta}`,
					borderRadius: 6,
					boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
					fontFamily: font,
					fontSize: 24,
					fontWeight: 600,
					color: C.white,
					opacity: toast,
					translate: `${(1 - toast) * 80}px 0px`,
				}}
			>
				<svg width={30} height={28} viewBox="0 0 30 28">
					<path d="M15 27 C6 20 0 14 0 8 A8 8 0 0 1 15 4 A8 8 0 0 1 30 8 C30 14 24 20 15 27 Z" fill={C.cta} />
				</svg>
				Added to your wishlist
			</div>

			<Cursor x={curX} y={curY} press={press} opacity={interpolate(frame, [32, 38, 90, 98], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
			<ClickRipple x={curX + 6} y={curY + 4} at={56} />

			{subtitles ? (
				<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 48}}>
					<Interactive.Div name="Subtitle 3">
						<Subtitle text="Find incredible deals. Save your favorites." start={6} end={100} />
					</Interactive.Div>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};
