import React from 'react';
import {AbsoluteFill, Interactive, interpolate, random, useCurrentFrame} from 'remotion';
import {easeIn, easeInOut, lerp} from '../anim';
import {SnowLeopard} from '../animals/SnowLeopard';
import {Caption} from '../props/Caption';
import {LocationTag} from '../props/LocationTag';
import {Mountain} from '../props/Scenery';
import {INK} from '../theme';

const FLAKES = Array.from({length: 70}).map((_, i) => ({
	x: random(`x${i}`) * 1920,
	y: random(`y${i}`) * 1080,
	r: 3 + random(`r${i}`) * 6,
	v: 1.5 + random(`v${i}`) * 2.5,
}));

const Rock: React.FC<{readonly x: number; readonly y: number; readonly s: number}> = ({x, y, s}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<path d="M-200 200 L-170 20 L-90 -30 L40 -40 L150 0 L210 200 Z" fill="#8d97ad" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
		<path d="M-170 20 L-90 -30 L40 -40 L150 0 L120 10 L40 -10 L-80 0 Z" fill="#ffffff" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
		<path d="M20 30 L80 120 M-60 60 L-100 150" stroke={INK} strokeWidth={4} opacity={0.4} />
	</g>
);

const LEAP_START = 40;
const LEAP_END = 76;

export const HimalayaScene: React.FC = () => {
	const frame = useCurrentFrame();
	const layer = (i: number) => (1 - easeIn(frame, i * 6, 28)) * 600;

	const leapP = easeInOut(frame, LEAP_START, LEAP_END - LEAP_START);
	const inLeap = frame > LEAP_START && frame < LEAP_END;
	const crouch = interpolate(frame, [LEAP_START - 12, LEAP_START, LEAP_START + 2], [0, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const landSquash = interpolate(frame, [LEAP_END, LEAP_END + 4, LEAP_END + 12], [0, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const leoX = lerp(420, 1480, leapP);
	const leoY = lerp(842, 866, leapP) - Math.sin(Math.PI * leapP) * 320;
	const stretch = inLeap ? Math.sin(Math.PI * leapP) : 0;
	const tilt = inLeap ? lerp(-18, 16, leapP) : 0;
	const squash = 1 - crouch * 0.12 - landSquash * 0.1;

	return (
		<AbsoluteFill style={{background: 'linear-gradient(#a9dcff 0%, #d8f0ff 60%, #f3fbff 100%)'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute'}}>
				<g transform={`translate(0 ${layer(0)})`}>
					<Mountain x={300} y={760} w={760} h={560} color="#b7c3e6" />
					<Mountain x={980} y={760} w={900} h={680} color="#c3cdef" />
					<Mountain x={1650} y={760} w={760} h={540} color="#b7c3e6" />
				</g>
				<g transform={`translate(0 ${layer(1)})`}>
					<Mountain x={0} y={860} w={700} h={430} color="#8e9fd1" />
					<Mountain x={640} y={860} w={720} h={480} color="#98a8d8" />
					<Mountain x={1300} y={860} w={760} h={460} color="#8e9fd1" />
					<Mountain x={1960} y={860} w={700} h={420} color="#98a8d8" />
				</g>
				<g transform={`translate(0 ${layer(2)})`}>
					<path d="M-50 880 C400 830 900 900 1980 850 L1980 1100 L-50 1100 Z" fill="#ffffff" stroke={INK} strokeWidth={5} />
					<Rock x={420} y={880} s={1.1} />
					<Rock x={1480} y={900} s={1.0} />
				</g>

				<g
					transform={`translate(${leoX} ${leoY + layer(2)}) rotate(${tilt}) scale(${0.95 * (2 - squash)} ${0.95 * squash})`}
				>
					<SnowLeopard t={frame} stretch={stretch} />
				</g>

				{FLAKES.map((f, i) => (
					<circle
						key={i}
						cx={(f.x + Math.sin(frame / 20 + i) * 30 + 1920) % 1920}
						cy={(f.y + frame * f.v) % 1100}
						r={f.r}
						fill="#ffffff"
						opacity={0.9}
					/>
				))}
			</svg>
			<AbsoluteFill style={{padding: '60px 90px'}}>
				<Interactive.Div
					name="Himalaya tag"
					style={{
						alignSelf: 'flex-start',
						translate: `${interpolate(easeIn(frame, 18, 20), [0, 1], [-560, 0])}px 0px`,
					}}
				>
					<LocationTag label="The Himalayas" color="#3fa9e0" />
				</Interactive.Div>
			</AbsoluteFill>
			<AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 200}}>
				<Interactive.Div name="Himalaya caption" style={{opacity: easeIn(frame, 6, 6)}}>
					<Caption line="High in the Himalayas, *snow leopards* roam!" startFrame={8} />
				</Interactive.Div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
