import React from 'react';
import {AbsoluteFill, Interactive, interpolate, random, useCurrentFrame} from 'remotion';
import {easeIn, easeInOut, lerp, springIn} from '../anim';
import {Elephant} from '../animals/Elephant';
import {Lion} from '../animals/Lion';
import {Peacock} from '../animals/Peacock';
import {Rhino} from '../animals/Rhino';
import {SnowLeopard} from '../animals/SnowLeopard';
import {Tiger} from '../animals/Tiger';
import {Caption} from '../props/Caption';
import {IndiaMap, MAP_H, MAP_W, project} from '../props/IndiaMap';
import {fontFamily, INK} from '../theme';

// Final layout ("world") coordinates.
const MAP_SCALE = 0.6;
const MAP_X = 960 - (MAP_W * MAP_SCALE) / 2;
const MAP_Y = 585 - (MAP_H * MAP_SCALE) / 2;
const onMap = (lon: number, lat: number): [number, number] => {
	const [x, y] = project(lon, lat);
	return [MAP_X + x * MAP_SCALE, MAP_Y + y * MAP_SCALE];
};

const PEACOCK_BADGE: [number, number] = [1530, 840];
const ZOOM_START = 50;
const ZOOM_DUR = 34;

type BadgeDef = {
	name: string;
	at: [number, number];
	home: [number, number];
	color: string;
	delay: number;
	render: (t: number) => React.ReactNode;
};

const BADGES: BadgeDef[] = [
	{name: 'snow', at: [400, 330], home: [77.6, 34.0], color: '#d8efff', delay: 0, render: (t) => <g transform="scale(0.36) translate(30 140)"><SnowLeopard t={t} /></g>},
	{name: 'tiger', at: [300, 600], home: [80.6, 22.3], color: '#ffe2b8', delay: 4, render: (t) => <g transform="scale(0.42) translate(-20 140)"><Tiger t={t} walk={0} /></g>},
	{name: 'lion', at: [420, 860], home: [70.8, 21.2], color: '#ffe9a8', delay: 8, render: (t) => <g transform="scale(0.4) translate(-20 150)"><Lion t={t} /></g>},
	{name: 'rhino', at: [1520, 330], home: [93.4, 26.6], color: '#dff5d6', delay: 2, render: (t) => <g transform="scale(-0.38 0.38) translate(-50 130)"><Rhino t={t} walk={0} /></g>},
	{name: 'elephant', at: [1620, 600], home: [76.6, 10.2], color: '#e6e9f7', delay: 6, render: (t) => <g transform="scale(-0.34 0.34) translate(-50 170)"><Elephant t={t} walk={0} trunk={0.6 + Math.sin(t / 8) * 0.2} /></g>},
];

const Badge: React.FC<{
	readonly x: number;
	readonly y: number;
	readonly pop: number;
	readonly color: string;
	readonly children: React.ReactNode;
	readonly line?: [number, number];
}> = ({x, y, pop, color, children, line}) => (
	<g>
		{line ? (
			<g opacity={pop}>
				<path d={`M${x} ${y} L${line[0]} ${line[1]}`} stroke={INK} strokeWidth={5} strokeDasharray="4 14" strokeLinecap="round" />
				<circle cx={line[0]} cy={line[1]} r={12 * pop} fill="#ff5d8f" stroke={INK} strokeWidth={4} />
			</g>
		) : null}
		<g transform={`translate(${x} ${y}) scale(${pop})`}>
			<circle cx={0} cy={8} r={112} fill={INK} />
			<circle cx={0} cy={0} r={112} fill={color} stroke={INK} strokeWidth={7} />
			<clipPath id={`badge-${x}-${y}`}>
				<circle cx={0} cy={0} r={106} />
			</clipPath>
			<g clipPath={`url(#badge-${x}-${y})`}>{children}</g>
		</g>
	</g>
);

const Sparkle: React.FC<{readonly x: number; readonly y: number; readonly s: number}> = ({x, y, s}) => (
	<path
		transform={`translate(${x} ${y}) scale(${s})`}
		d="M0 -30 C4 -6 6 -4 30 0 C6 4 4 6 0 30 C-4 6 -6 4 -30 0 C-6 -4 -4 -6 0 -30 Z"
		fill="#fff6a8"
		stroke={INK}
		strokeWidth={3}
	/>
);

export const FinaleScene: React.FC = () => {
	const frame = useCurrentFrame();
	const fan = springIn(frame, 6, 30, 12);

	// Camera: starts zoomed in on the peacock, then zooms out to the whole layout.
	const z = easeInOut(frame, ZOOM_START, ZOOM_DUR);
	const camScale = lerp(3.0, 1, z);
	const focusX = lerp(PEACOCK_BADGE[0], 960, z);
	const focusY = lerp(PEACOCK_BADGE[1] - 20, 540, z);
	const screenY = lerp(660, 540, z);

	const reveal = (d: number) => springIn(frame, ZOOM_START + 10 + d, 18, 10);
	const peacockBadgeBg = easeIn(frame, ZOOM_START + 8, 16);
	const mapPop = springIn(frame, ZOOM_START + 4, 22, 11);

	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #fff4d6 0%, #ffd27a 45%, #ff9f5a 100%)'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute'}}>
				{/* rays */}
				<g transform={`translate(960 560) rotate(${frame * 0.3})`} opacity={0.3}>
					{Array.from({length: 18}).map((_, i) => (
						<path key={i} transform={`rotate(${i * 20})`} d="M0 0 L-70 -1300 L70 -1300 Z" fill="#ffffff" />
					))}
				</g>

				<g transform={`translate(960 ${screenY}) scale(${camScale}) translate(${-focusX} ${-focusY})`}>
					{/* the map */}
					<g transform={`translate(960 585) scale(${mapPop}) translate(-960 -585)`} opacity={Math.min(1, mapPop * 2)}>
						<g transform={`translate(${MAP_X} ${MAP_Y}) scale(${MAP_SCALE})`}>
							<IndiaMap id="finale" />
						</g>
					</g>
					{/* badges around the map */}
					{BADGES.map((b) => (
						<Badge key={b.name} x={b.at[0]} y={b.at[1]} pop={reveal(b.delay)} color={b.color} line={onMap(b.home[0], b.home[1])}>
							{b.render(frame)}
						</Badge>
					))}
					{/* the peacock lives in the last badge */}
					<g opacity={peacockBadgeBg}>
						<path
							d={`M${PEACOCK_BADGE[0]} ${PEACOCK_BADGE[1]} L${onMap(75.8, 26.9)[0]} ${onMap(75.8, 26.9)[1]}`}
							stroke={INK}
							strokeWidth={5}
							strokeDasharray="4 14"
							strokeLinecap="round"
						/>
						<circle cx={onMap(75.8, 26.9)[0]} cy={onMap(75.8, 26.9)[1]} r={12} fill="#ff5d8f" stroke={INK} strokeWidth={4} />
						<circle cx={PEACOCK_BADGE[0]} cy={PEACOCK_BADGE[1] + 8} r={112} fill={INK} />
						<circle cx={PEACOCK_BADGE[0]} cy={PEACOCK_BADGE[1]} r={112} fill="#d9f2ff" stroke={INK} strokeWidth={7} />
					</g>
					<g transform={`translate(${PEACOCK_BADGE[0] + 8} ${PEACOCK_BADGE[1] + 72}) scale(${lerp(0.36, 0.3, z)})`}>
						<Peacock t={frame} fan={fan} />
					</g>
					{/* sparkles around the peacock while it fans out */}
					{Array.from({length: 10}).map((_, i) => {
						const start = 10 + i * 4;
						const p = interpolate(frame, [start, start + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
						const ang = random(`sa${i}`) * Math.PI * 2;
						const dist = 70 + random(`sd${i}`) * 80;
						return (
							<Sparkle
								key={i}
								x={PEACOCK_BADGE[0] + Math.cos(ang) * dist}
								y={PEACOCK_BADGE[1] - 30 + Math.sin(ang) * dist * 0.8}
								s={Math.sin(Math.PI * p) * 0.35 * (1 - z)}
							/>
						);
					})}
				</g>
			</svg>

			{/* Narration for the peacock, fades before the title */}
			<AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 90}}>
				<Interactive.Div
					name="Peacock caption"
					style={{opacity: interpolate(frame, [6, 12, ZOOM_START + 6, ZOOM_START + 14], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}
				>
					<Caption line="And don't forget India's beautiful *peacocks*!" startFrame={8} />
				</Interactive.Div>
			</AbsoluteFill>

			{/* End title */}
			<AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 50}}>
				<Interactive.Div
					name="End title"
					style={{
						display: 'flex',
						fontFamily,
						fontWeight: 800,
						fontSize: 170,
						lineHeight: 1,
						letterSpacing: 4,
					}}
				>
					{'WILD INDIA!'.split('').map((ch, i) => {
						const p = springIn(frame, ZOOM_START + 24 + i * 1.5, 16, 8);
						const colors = ['#ff9933', '#ffffff', '#3dbb5c'];
						return (
							<span
								key={i}
								style={{
									display: 'inline-block',
									whiteSpace: 'pre',
									color: colors[Math.floor(i / 4) % 3],
									opacity: Math.min(1, p * 3),
									scale: String(p),
									translate: `0px ${(1 - p) * -120}px`,
									rotate: `${Math.sin(frame / 6 + i) * 3 * p}deg`,
									WebkitTextStroke: `16px ${INK}`,
									paintOrder: 'stroke fill',
									textShadow: `0 12px 0 ${INK}`,
								}}
							>
								{ch}
							</span>
						);
					})}
				</Interactive.Div>
			</AbsoluteFill>
			<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 46}}>
				<Interactive.Div
					name="End subtitle"
					style={{
						fontFamily,
						fontWeight: 800,
						fontSize: 64,
						color: INK,
						background: '#ffffff',
						border: `6px solid ${INK}`,
						boxShadow: `0 8px 0 ${INK}`,
						borderRadius: 999,
						padding: '6px 44px',
						scale: String(springIn(frame, ZOOM_START + 40, 16, 10)),
					}}
				>
					A World of Amazing Animals!
				</Interactive.Div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
