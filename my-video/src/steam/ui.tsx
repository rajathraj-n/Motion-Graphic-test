import React from 'react';
import {Easing, Img, interpolate, useCurrentFrame} from 'remotion';
import {C, font} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Smooth 0→1 with a premium ease-out (expo-like). */
export const ease = (frame: number, start: number, dur = 20) =>
	interpolate(frame, [start, start + dur], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)});
/** Smooth 0→1 ease-in-out. */
export const easeIO = (frame: number, start: number, dur = 20) =>
	interpolate(frame, [start, start + dur], [0, 1], {...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1)});
/** Accelerating 0→1, for exits. */
export const easeOutro = (frame: number, start: number, dur = 20) =>
	interpolate(frame, [start, start + dur], [0, 1], {...clamp, easing: Easing.bezier(0.7, 0, 0.84, 0)});
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Headline whose words slide up out of a mask, one after another. */
export const Headline: React.FC<{
	readonly text: string;
	readonly start: number;
	readonly size?: number;
	readonly color?: string;
	readonly accent?: string;
	readonly accentWords?: string[];
	readonly align?: 'left' | 'center';
	readonly exitAt?: number;
}> = ({text, start, size = 96, color = C.white, accent = C.blue, accentWords = [], align = 'left', exitAt}) => {
	const frame = useCurrentFrame();
	const words = text.split(' ');
	const exit = exitAt === undefined ? 0 : easeOutro(frame, exitAt, 12);
	return (
		<div
			style={{
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: align === 'center' ? 'center' : 'flex-start',
				columnGap: size * 0.26,
				fontFamily: font,
				fontWeight: 800,
				fontSize: size,
				lineHeight: 1.04,
				letterSpacing: -size * 0.02,
				color,
				opacity: 1 - exit,
				translate: `0px ${-exit * 40}px`,
			}}
		>
			{words.map((w, i) => {
				const p = ease(frame, start + i * 3, 18);
				return (
					<span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: size * 0.08}}>
						<span
							style={{
								display: 'inline-block',
								translate: `0px ${(1 - p) * 110}%`,
								color: accentWords.includes(w) ? accent : color,
							}}
						>
							{w}
						</span>
					</span>
				);
			})}
		</div>
	);
};

/** Voiceover line as a subtitle, fading in and out inside its scene. */
export const Subtitle: React.FC<{readonly text: string; readonly start?: number; readonly end?: number}> = ({
	text,
	start = 4,
	end = 112,
}) => {
	const frame = useCurrentFrame();
	const o = interpolate(frame, [start, start + 8, end - 8, end], [0, 1, 1, 0], clamp);
	return (
		<div
			style={{
				opacity: o,
				translate: `0px ${(1 - o) * 10}px`,
				fontFamily: font,
				fontWeight: 500,
				fontSize: 40,
				color: '#ffffff',
				background: 'rgba(10, 12, 18, 0.72)',
				padding: '10px 28px',
				borderRadius: 10,
				letterSpacing: 0.2,
			}}
		>
			{text}
		</div>
	);
};

export const Logo: React.FC<{readonly size?: number; readonly src?: string}> = ({size = 34, src}) =>
	src ? (
		<Img src={src} style={{height: size * 1.4}} />
	) : (
		<div style={{fontFamily: font, fontWeight: 900, fontSize: size, letterSpacing: size * 0.12, color: C.white}}>
			STEAM
		</div>
	);

/** Top navigation bar in the style of the Steam client. */
export const NavBar: React.FC<{readonly active: string; readonly logoSrc?: string}> = ({active, logoSrc}) => (
	<div
		style={{
			position: 'relative',
			height: 80,
			display: 'flex',
			alignItems: 'center',
			gap: 56,
			padding: '0 64px',
			background: C.bg,
			fontFamily: font,
			fontWeight: 700,
			fontSize: 22,
			letterSpacing: 1.5,
			color: C.text,
			borderBottom: '1px solid rgba(255,255,255,0.06)',
		}}
	>
		<Logo size={28} src={logoSrc} />
		{['STORE', 'LIBRARY', 'COMMUNITY', 'PROFILE'].map((item) => (
			<div
				key={item}
				style={{
					color: item === active ? C.blue : C.text,
					borderBottom: item === active ? `3px solid ${C.blue}` : '3px solid transparent',
					padding: '26px 0 23px',
				}}
			>
				{item}
			</div>
		))}
		<div style={{flex: 1}} />
		<div style={{width: 280, height: 40, borderRadius: 6, background: '#316282', opacity: 0.5}} />
		<div style={{width: 40, height: 40, borderRadius: 6, background: 'linear-gradient(135deg, #67C1F5, #1A9FFF)'}} />
	</div>
);

/** Mouse pointer. `press` (0..1) scales it down for a click. */
export const Cursor: React.FC<{readonly x: number; readonly y: number; readonly press?: number; readonly opacity?: number}> = ({
	x,
	y,
	press = 0,
	opacity = 1,
}) => (
	<svg
		width={44}
		height={52}
		viewBox="0 0 44 52"
		style={{position: 'absolute', left: x, top: y, opacity, scale: String(1 - press * 0.15), transformOrigin: '6px 4px', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))'}}
	>
		<path d="M6 4 L6 40 L15 31 L22 47 L29 44 L22 28 L35 28 Z" fill="#ffffff" stroke="#111" strokeWidth={2.5} strokeLinejoin="round" />
	</svg>
);

/** Expanding ring at a click point. */
export const ClickRipple: React.FC<{readonly x: number; readonly y: number; readonly at: number}> = ({x, y, at}) => {
	const frame = useCurrentFrame();
	const p = interpolate(frame, [at, at + 14], [0, 1], clamp);
	if (p <= 0 || p >= 1) return null;
	return (
		<div
			style={{
				position: 'absolute',
				left: x - 40,
				top: y - 40,
				width: 80,
				height: 80,
				borderRadius: '50%',
				border: `4px solid ${C.blue}`,
				scale: String(0.2 + p),
				opacity: 1 - p,
			}}
		/>
	);
};

/** Steam-style discount block: -60% | $59.99 $23.99 */
export const PriceBlock: React.FC<{readonly discount?: number; readonly price: string; readonly sale: string; readonly scale?: number}> = ({
	discount,
	price,
	sale,
	scale = 1,
}) => (
	<div style={{display: 'flex', alignItems: 'stretch', fontFamily: font, scale: String(scale), transformOrigin: 'left center'}}>
		{discount ? (
			<div style={{background: C.discountBg, color: C.discountText, fontWeight: 800, fontSize: 30, padding: '6px 14px', display: 'flex', alignItems: 'center'}}>
				-{discount}%
			</div>
		) : null}
		<div style={{background: '#344654', padding: '4px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1.1}}>
			{discount ? <div style={{color: '#738895', fontSize: 16, textDecoration: 'line-through'}}>{price}</div> : null}
			<div style={{color: discount ? C.discountText : C.text, fontSize: 24, fontWeight: 600}}>{discount ? sale : price}</div>
		</div>
	</div>
);
