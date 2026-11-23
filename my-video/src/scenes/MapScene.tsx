import React from 'react';
import {AbsoluteFill, Interactive, useCurrentFrame} from 'remotion';
import {easeIn, springIn} from '../anim';
import {Caption} from '../props/Caption';
import {IndiaMap, MAP_H, MAP_W, project} from '../props/IndiaMap';
import {Cloud, Mountain, Palm, Tree} from '../props/Scenery';

const MOUNTAINS: {lon: number; lat: number; w: number; h: number}[] = [
	{lon: 75.6, lat: 34.6, w: 110, h: 95},
	{lon: 78.6, lat: 32.6, w: 130, h: 115},
	{lon: 81.4, lat: 30.0, w: 120, h: 105},
	{lon: 84.6, lat: 28.2, w: 140, h: 125},
	{lon: 88.4, lat: 27.9, w: 110, h: 100},
	{lon: 93.6, lat: 28.6, w: 120, h: 100},
];

const TREES: {lon: number; lat: number; s: number; palm?: boolean}[] = [
	{lon: 78.2, lat: 23.6, s: 0.55},
	{lon: 81.8, lat: 21.6, s: 0.6},
	{lon: 85.6, lat: 23.0, s: 0.5},
	{lon: 74.6, lat: 19.2, s: 0.5},
	{lon: 79.4, lat: 18.4, s: 0.55},
	{lon: 75.4, lat: 14.6, s: 0.5},
	{lon: 77.8, lat: 13.2, s: 0.5},
	{lon: 76.6, lat: 10.2, s: 0.45, palm: true},
	{lon: 92.6, lat: 26.0, s: 0.45},
	{lon: 95.4, lat: 27.6, s: 0.4},
	{lon: 83.6, lat: 25.6, s: 0.45},
	{lon: 73.6, lat: 23.4, s: 0.4, palm: true},
];

export const MapScene: React.FC = () => {
	const frame = useCurrentFrame();
	const scale = 0.84;
	const mapPop = springIn(frame, 0, 22, 9);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #b6ecff 0%, #6fcdf4 55%, #3aa6e0 100%)'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute'}}>
				{/* slowly rotating sun rays */}
				<g transform={`translate(960 420) rotate(${frame * 0.25})`} opacity={0.35}>
					{Array.from({length: 16}).map((_, i) => (
						<path key={i} transform={`rotate(${i * 22.5})`} d="M0 0 L-60 -1200 L60 -1200 Z" fill="#ffffff" opacity={i % 2 ? 0.35 : 0.6} />
					))}
				</g>
				<Cloud x={240 + frame * 0.6} y={190} s={1.3} />
				<Cloud x={1650 - frame * 0.5} y={260} s={1.1} />
				<Cloud x={380 - frame * 0.4} y={720} s={0.9} opacity={0.9} />
				<Cloud x={1560 + frame * 0.45} y={680} s={1.2} opacity={0.9} />

				<g
					transform={`translate(960 ${450 + (1 - mapPop) * 60}) scale(${scale * mapPop}) rotate(${(1 - mapPop) * -10}) translate(${-MAP_W / 2} ${-MAP_H / 2})`}
				>
					<IndiaMap id="intro" />
					{MOUNTAINS.map((m, i) => {
						const [x, y] = project(m.lon, m.lat);
						const g = springIn(frame, 16 + i * 3, 16, 9);
						return (
							<g key={i} transform={`translate(${x} ${y}) scale(${g})`}>
								<Mountain x={0} y={0} w={m.w} h={m.h} color={i % 2 ? '#8f8fc9' : '#7b7fbf'} />
							</g>
						);
					})}
					{TREES.map((t, i) => {
						const [x, y] = project(t.lon, t.lat);
						const g = springIn(frame, 26 + i * 3, 16, 8);
						const sway = Math.sin(frame / 9 + i) * 3;
						return t.palm ? (
							<g key={i} transform={`translate(${x} ${y}) scale(${g})`}>
								<Palm x={0} y={0} s={t.s} sway={sway * 2} />
							</g>
						) : (
							<Tree key={i} x={x} y={y} s={t.s} grow={g} sway={sway} />
						);
					})}
				</g>
			</svg>
			<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 70}}>
				<Interactive.Div
					name="Intro caption"
					style={{opacity: easeIn(frame, 14, 6)}}
				>
					<Caption line="Did you know *India* is home to *incredible wildlife*?" startFrame={16} />
				</Interactive.Div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
