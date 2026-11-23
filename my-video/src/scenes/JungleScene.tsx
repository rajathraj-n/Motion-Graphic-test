import React from 'react';
import {AbsoluteFill, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {easeIn, easeInOut, lerp} from '../anim';
import {Elephant} from '../animals/Elephant';
import {Tiger} from '../animals/Tiger';
import {Caption} from '../props/Caption';
import {Bush, Tree} from '../props/Scenery';
import {INK} from '../theme';

const Leaf: React.FC<{readonly x: number; readonly y: number; readonly r: number; readonly s: number; readonly c: string}> = ({x, y, r, s, c}) => (
	<g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
		<path d="M0 0 C60 -40 160 -30 220 0 C160 30 60 40 0 0 Z" fill={c} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
		<path d="M10 0 L200 0" stroke={INK} strokeWidth={3} opacity={0.5} />
	</g>
);

export const JungleScene: React.FC = () => {
	const frame = useCurrentFrame();
	const pan = frame * 0.8;

	// Tiger walks in from the left, then stops.
	const tigerP = easeInOut(frame, 4, 64);
	const tigerX = lerp(-420, 520, tigerP);
	const tigerWalk = interpolate(frame, [58, 72], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	// Elephant walks in from the right, stops, then swings its trunk.
	const eleP = easeInOut(frame, 36, 60);
	const eleX = lerp(2350, 1440, eleP);
	const eleWalk = interpolate(frame, [88, 100], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const trunk =
		frame < 96
			? Math.sin(frame / 6) * 0.15
			: interpolate(frame, [96, 108, 122, 132], [0, 1, 0.6, 0.9], {extrapolateRight: 'clamp'}) +
				Math.sin(frame / 3) * 0.06;

	return (
		<AbsoluteFill style={{background: 'linear-gradient(#bdf2c8 0%, #8fe0a6 45%, #5fc985 100%)'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute'}}>
				<circle cx={1500} cy={210} r={90} fill="#fff2a8" opacity={0.8} />
				{/* far hills */}
				<g transform={`translate(${-pan * 0.2} 0)`}>
					<path d="M-200 700 C100 520 300 560 520 640 C760 500 1000 520 1240 640 C1460 520 1760 520 2200 660 L2200 1080 L-200 1080 Z" fill="#46b06c" />
				</g>
				{/* mid trees */}
				<g transform={`translate(${-pan * 0.45} 0)`}>
					{[-60, 200, 430, 700, 980, 1240, 1500, 1760, 2020].map((x, i) => (
						<Tree key={x} x={x} y={820} s={1.5 + (i % 3) * 0.25} color="#2fa35a" dark="#1d7d47" sway={Math.sin(frame / 14 + i) * 1.5} />
					))}
				</g>
				{/* ground */}
				<path d="M0 840 C400 820 800 860 1200 835 C1500 820 1700 840 1920 830 L1920 1080 L0 1080 Z" fill="#7cc56a" stroke={INK} strokeWidth={5} />
				<path d="M0 930 C500 910 1100 950 1920 920 L1920 1080 L0 1080 Z" fill="#69b25b" />
				{/* animals */}
				<g transform={`translate(${tigerX} 900) scale(1.05)`}>
					<Tiger t={frame} walk={tigerWalk} />
				</g>
				<g transform={`translate(${eleX} 905) scale(-1.0 1.0)`}>
					<Elephant t={frame} walk={eleWalk} trunk={trunk} />
				</g>
				{/* foreground foliage */}
				<g transform={`translate(${-pan * 0.9} 0)`}>
					<Bush x={150} y={1080} s={1.6} />
					<Bush x={1000} y={1095} s={1.1} color="#5ad27a" />
					<Bush x={1900} y={1080} s={1.7} />
				</g>
				<Leaf x={-30} y={60} r={20 + Math.sin(frame / 10) * 4} s={1.4} c="#2fa35a" />
				<Leaf x={-40} y={170} r={40 + Math.sin(frame / 12) * 4} s={1.1} c="#45c46b" />
				<Leaf x={1950} y={80} r={160 + Math.sin(frame / 11) * 4} s={1.4} c="#2fa35a" />
				<Leaf x={1960} y={200} r={140 + Math.sin(frame / 9) * 4} s={1.0} c="#45c46b" />
			</svg>
			<AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 110}}>
				<Interactive.Div name="Jungle caption" style={{opacity: easeIn(frame, 6, 6)}}>
					<Caption line="Meet the *Bengal tiger* and the mighty *Asian elephant*!" startFrame={8} />
				</Interactive.Div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
