import React from 'react';
import {AbsoluteFill, Interactive, interpolate, random, useCurrentFrame} from 'remotion';
import {easeIn, easeInOut, lerp} from '../anim';
import {Rhino} from '../animals/Rhino';
import {Caption} from '../props/Caption';
import {LocationTag} from '../props/LocationTag';
import {Cloud, GrassBlade} from '../props/Scenery';
import {INK} from '../theme';

const BACK_GRASS = Array.from({length: 46}).map((_, i) => ({
	x: i * 44 + random(`bg${i}`) * 20,
	h: 120 + random(`bh${i}`) * 90,
}));
const FRONT_GRASS = Array.from({length: 34}).map((_, i) => ({
	x: i * 60 + random(`fg${i}`) * 30,
	h: 150 + random(`fh${i}`) * 120,
}));

export const WetlandScene: React.FC = () => {
	const frame = useCurrentFrame();
	const rhinoP = easeInOut(frame, 4, 76);
	const rhinoX = lerp(2300, 1080, rhinoP);
	const walk = interpolate(frame, [72, 86], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	// Grass bounces when the rhino walks past it.
	const bend = (x: number, i: number, amp: number) => {
		const near = Math.max(0, 1 - Math.abs(x - rhinoX) / 260) * walk;
		return Math.sin(frame / 8 + i * 0.7) * amp + near * Math.sin(frame / 2 + i) * 40;
	};

	return (
		<AbsoluteFill style={{background: 'linear-gradient(#c9efff 0%, #a6e2fb 50%, #d9f3d0 100%)'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute'}}>
				<Cloud x={260 + frame * 0.5} y={450} s={1.1} />
				<Cloud x={1650 - frame * 0.4} y={430} s={1} />
				{/* distant blue hills of Assam */}
				<path d="M-50 640 C200 520 420 560 620 610 C860 500 1100 520 1300 600 C1520 520 1760 540 1980 620 L1980 760 L-50 760 Z" fill="#8fc7d9" />
				<path d="M-50 700 C300 620 600 680 900 650 C1200 620 1500 690 1980 650 L1980 780 L-50 780 Z" fill="#76b88a" />
				{/* back grass */}
				{BACK_GRASS.map((g, i) => (
					<GrassBlade key={i} x={g.x} y={780} h={g.h} bend={bend(g.x, i, 10)} color={i % 2 ? '#7fcf5a' : '#6cbf4c'} />
				))}
				{/* wetland water */}
				<path d="M-20 770 L1940 770 L1940 1100 L-20 1100 Z" fill="#5ab8e0" stroke={INK} strokeWidth={5} />
				{Array.from({length: 9}).map((_, i) => {
					const p = ((frame + i * 14) % 60) / 60;
					return (
						<ellipse
							key={i}
							cx={150 + i * 210 + (i % 2) * 60}
							cy={830 + (i % 3) * 70}
							rx={30 + p * 70}
							ry={6 + p * 12}
							fill="none"
							stroke="#ffffff"
							strokeWidth={4}
							opacity={0.8 * (1 - p)}
						/>
					);
				})}
				{/* rhino wading */}
				<g transform={`translate(${rhinoX} 930) scale(-1.05 1.05)`}>
					<Rhino t={frame} walk={walk} />
				</g>
				<path d="M-20 935 C400 925 900 945 1940 930 L1940 1100 L-20 1100 Z" fill="#4aa8d4" opacity={0.75} />
				{/* front grass */}
				{FRONT_GRASS.map((g, i) => (
					<GrassBlade key={i} x={g.x} y={1090} h={g.h} bend={bend(g.x, i, 14)} color={i % 2 ? '#5fbf45' : '#4aa83a'} />
				))}
			</svg>
			<AbsoluteFill style={{padding: '60px 90px'}}>
				<Interactive.Div
					name="Assam tag"
					style={{
						alignSelf: 'flex-start',
						translate: `${interpolate(easeIn(frame, 18, 20), [0, 1], [-500, 0])}px 0px`,
					}}
				>
					<LocationTag label="Kaziranga, Assam" color="#ff5d8f" />
				</Interactive.Div>
			</AbsoluteFill>
			<AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 200}}>
				<Interactive.Div name="Wetland caption" style={{opacity: easeIn(frame, 6, 6)}}>
					<Caption line="Spot the *one-horned rhinoceros* in Assam!" startFrame={8} />
				</Interactive.Div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
