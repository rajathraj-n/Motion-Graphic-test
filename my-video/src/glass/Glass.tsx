import React from 'react';
import {C} from '../steam/theme';

/**
 * A physical-looking glass panel: translucent tint over a backdrop blur, a
 * beveled edge with thickness, a thin blue perimeter, a selective edge glow,
 * a soft top specular highlight and an animated reflection sweep.
 *
 * Place it with `style` (usually from `place()`), and fill it with content.
 */
export const GlassPanel: React.FC<{
	readonly style: React.CSSProperties;
	readonly children?: React.ReactNode;
	/** 0..1 edge glow strength */
	readonly glow?: number;
	/** Reflection sweep position; sweeps across while going 0 -> 1 */
	readonly sweep?: number;
	readonly radius?: number;
	readonly opacity?: number;
	readonly blur?: number;
	readonly padding?: number;
	/** Brief white-blue flash on the border, 0..1 */
	readonly flash?: number;
	readonly tint?: number;
}> = ({style, children, glow = 0.3, sweep = -1, radius = 24, opacity = 1, blur = 0, padding = 0, flash = 0, tint = 1}) => {
	const borderAlpha = 0.28 + 0.55 * glow;
		// Opacity and blur go on the layers, not the wrapper, so the backdrop blur still sees what is behind.
	const fx: React.CSSProperties = {opacity, filter: blur > 0.2 ? `blur(${blur}px)` : undefined};
	return (
		<div style={style}>
			{/* Edge thickness (bevel), seen just below the face */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					transform: 'translate3d(0px, 4px, -4px)',
					borderRadius: radius,
					background: 'rgba(103,193,245,0.10)',
					border: '1px solid rgba(103,193,245,0.18)',
					...fx,
				}}
			/>
			{/* Face */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					borderRadius: radius,
					overflow: 'hidden',
					background: `linear-gradient(150deg, rgba(103,193,245,${0.12 * tint}) 0%, rgba(27,40,56,${0.2 * tint}) 38%, rgba(27,40,56,${0.32 * tint}) 100%)`,
					backdropFilter: 'blur(28px) saturate(140%)',
					WebkitBackdropFilter: 'blur(28px) saturate(140%)',
					border: `1.5px solid rgba(${flash > 0 ? '220,240,255' : '103,193,245'},${Math.min(1, borderAlpha + flash)})`,
					boxShadow: [
						`0 0 ${12 + 12 * glow + flash * 20}px rgba(103,193,245,${0.18 + 0.42 * glow + flash * 0.4})`,
						'0 40px 90px rgba(0,0,0,0.55)',
						'inset 0 1px 0 rgba(255,255,255,0.30)',
						'inset 0 0 0 3px rgba(255,255,255,0.035)',
						'inset 0 -3px 8px rgba(0,0,0,0.35)',
					].join(', '),
					...fx,
				}}
			>
				<div style={{position: 'absolute', inset: 0, padding}}>{children}</div>
				{/* Top specular highlight */}
				<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 28%)', pointerEvents: 'none'}} />
				{/* Moving reflection */}
				{sweep > -0.5 && sweep < 1.5 ? (
					<div
						style={{
							position: 'absolute',
							top: '-20%',
							bottom: '-20%',
							width: '45%',
							left: `${-50 + sweep * 160}%`,
							background: 'linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(200,235,255,0.16) 45%, rgba(255,255,255,0.24) 50%, rgba(200,235,255,0.16) 55%, rgba(255,255,255,0) 100%)',
							rotate: '12deg',
							pointerEvents: 'none',
						}}
					/>
				) : null}
			</div>
		</div>
	);
};

/** A blue glowing horizontal beam, used at the start and end. */
export const Beam: React.FC<{readonly progress: number; readonly y?: number; readonly thickness?: number; readonly opacity?: number; readonly width?: number}> = ({
	progress,
	y = 540,
	thickness = 2,
	opacity = 1,
	width = 1920,
}) => (
	<div
		style={{
			position: 'absolute',
			left: 960 - width / 2,
			top: y - thickness / 2,
			width: width * progress,
			height: thickness,
			background: `linear-gradient(90deg, rgba(103,193,245,0) 0%, ${C.blue} 30%, #ffffff 92%, ${C.blue} 100%)`,
			boxShadow: `0 0 18px 3px rgba(103,193,245,0.7)`,
			opacity,
			borderRadius: thickness,
		}}
	/>
);

/** Diagonal light that sweeps across the whole frame (foreground glass reflection). */
export const ScreenSweep: React.FC<{readonly progress: number; readonly strength?: number}> = ({progress, strength = 1}) =>
	progress > 0 && progress < 1 ? (
		<div
			style={{
				position: 'absolute',
				top: -400,
				bottom: -400,
				width: 520,
				left: -700 + progress * 3300,
				rotate: '22deg',
				background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(190,230,255,${0.07 * strength}) 50%, rgba(255,255,255,0) 100%)`,
			}}
		/>
	) : null;

/** Thin moving light around a rounded button border. */
export const BorderRunner: React.FC<{readonly w: number; readonly h: number; readonly r: number; readonly t: number; readonly color?: string}> = ({
	w,
	h,
	r,
	t,
	color = '#ffffff',
}) => {
	const per = 2 * (w + h - 4 * r) + 2 * Math.PI * r;
	return (
		<svg width={w + 4} height={h + 4} style={{position: 'absolute', left: -2, top: -2, overflow: 'visible', pointerEvents: 'none'}}>
			<rect
				x={2}
				y={2}
				width={w}
				height={h}
				rx={r}
				fill="none"
				stroke={color}
				strokeWidth={2.5}
				strokeLinecap="round"
				strokeDasharray={`${per * 0.18} ${per * 0.82}`}
				strokeDashoffset={-t * per}
				style={{filter: `drop-shadow(0 0 6px ${C.blue})`}}
			/>
		</svg>
	);
};
