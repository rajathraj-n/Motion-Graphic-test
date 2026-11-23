import React from 'react';
import {INK} from '../theme';

// Simplified, cartoon-friendly outline of India as [longitude, latitude] points.
const OUTLINE: [number, number][] = [
	[74.6, 37.0], [77.0, 35.8], [78.6, 35.0], [79.4, 33.8], [78.8, 32.4], [79.4, 31.0],
	[80.6, 30.3], [80.2, 28.8], [81.7, 27.9], [83.4, 27.4], [84.8, 27.1], [86.2, 26.6],
	[88.0, 26.4], [88.3, 27.6], [88.9, 27.2], [89.9, 26.8], [91.8, 26.9], [92.2, 27.8],
	[93.8, 28.7], [95.4, 29.3], [96.7, 28.9], [97.3, 28.1], [96.4, 27.3], [95.2, 26.6],
	[94.9, 25.3], [94.4, 23.9], [93.4, 23.6], [93.0, 22.0], [92.4, 22.4], [92.2, 23.8],
	[91.6, 24.2], [92.2, 25.1], [90.6, 25.2], [89.8, 25.4], [89.7, 26.1], [88.6, 26.2],
	[88.5, 25.4], [88.9, 24.3], [88.7, 23.2], [89.0, 22.0], [88.6, 21.6], [87.2, 21.4],
	[86.8, 20.6], [86.2, 19.9], [85.0, 19.4], [84.2, 18.4], [83.2, 17.5], [82.3, 16.6],
	[81.2, 16.2], [80.3, 15.4], [80.2, 13.6], [80.3, 12.8], [79.8, 11.5], [79.9, 10.3],
	[79.2, 10.2], [78.9, 9.2], [78.1, 8.8], [77.5, 8.1], [76.7, 8.8], [76.2, 10.0],
	[75.7, 11.5], [74.9, 12.8], [74.5, 14.2], [73.9, 15.6], [73.4, 16.9], [72.9, 18.6],
	[72.8, 20.0], [72.7, 21.2], [72.3, 21.7], [71.4, 20.9], [70.2, 21.0], [69.2, 22.0],
	[69.9, 22.6], [70.4, 23.1], [69.2, 22.9], [68.4, 23.5], [68.8, 24.2], [70.0, 24.3],
	[71.0, 24.5], [70.6, 25.6], [70.1, 26.6], [69.6, 27.2], [70.6, 28.0], [72.0, 28.2],
	[72.9, 29.0], [73.4, 29.9], [74.0, 30.5], [74.6, 31.1], [75.3, 32.2], [74.6, 32.8],
	[74.1, 33.5], [73.9, 34.6], [74.2, 35.7],
];

const K = 27; // pixels per degree
export const MAP_W = (97.6 - 68) * K;
export const MAP_H = (37.3 - 7.8) * K * 1.05;

/** Convert longitude/latitude to map-local pixel coordinates. */
export const project = (lon: number, lat: number): [number, number] => [
	(lon - 68) * K,
	(37.3 - lat) * K * 1.05,
];

const smoothPath = (pts: [number, number][]) => {
	// Closed Catmull-Rom spline converted to cubic Béziers.
	const p = pts.map(([lon, lat]) => project(lon, lat));
	const n = p.length;
	let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
	for (let i = 0; i < n; i++) {
		const p0 = p[(i - 1 + n) % n];
		const p1 = p[i];
		const p2 = p[(i + 1) % n];
		const p3 = p[(i + 2) % n];
		const t = 0.18;
		const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
		const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
		d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
	}
	return d + ' Z';
};

export const INDIA_PATH = smoothPath(OUTLINE);

/** The India landmass. Children are drawn in map coordinates, clipped to the land. */
export const IndiaMap: React.FC<{readonly children?: React.ReactNode; readonly id: string}> = ({
	children,
	id,
}) => (
	<g>
		<defs>
			<clipPath id={`${id}-clip`}>
				<path d={INDIA_PATH} />
			</clipPath>
			<linearGradient id={`${id}-land`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#9be36b" />
				<stop offset="0.55" stopColor="#5fcf5f" />
				<stop offset="1" stopColor="#3fb86a" />
			</linearGradient>
		</defs>
		{/* drop shadow */}
		<path d={INDIA_PATH} fill={INK} transform="translate(10 16)" opacity={0.85} />
		<path d={INDIA_PATH} fill={`url(#${id}-land)`} />
		<g clipPath={`url(#${id}-clip)`}>
			{/* Thar desert tint and Deccan plateau tint for some texture */}
			<ellipse cx={project(71.5, 26.8)[0]} cy={project(71.5, 26.8)[1]} rx={130} ry={110} fill="#f2d27a" opacity={0.85} />
			<ellipse cx={project(77.5, 18)[0]} cy={project(77.5, 18)[1]} rx={170} ry={150} fill="#b8e070" opacity={0.6} />
			{children}
		</g>
		<path d={INDIA_PATH} fill="none" stroke="#ffffff" strokeWidth={14} strokeLinejoin="round" opacity={0.9} />
		<path d={INDIA_PATH} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
	</g>
);
