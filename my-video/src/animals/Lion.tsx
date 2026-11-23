import React from 'react';
import {INK} from '../theme';
import {Eye, Leg, blinkAt, ink} from './parts';

const GOLD = '#ecae45';
const MANE = '#b8571c';

const manePath = (() => {
	const pts: string[] = [];
	const n = 18;
	for (let i = 0; i < n * 2; i++) {
		const ang = (i / (n * 2)) * Math.PI * 2;
		const r = i % 2 === 0 ? 118 : 92;
		pts.push(`${(Math.cos(ang) * r).toFixed(1)} ${(Math.sin(ang) * r).toFixed(1)}`);
	}
	return `M${pts.join(' L')} Z`;
})();

/**
 * Asiatic lion facing right, standing.
 * `lift` raises the head (0..1), `roar` opens the mouth (0..1).
 */
export const Lion: React.FC<{readonly t: number; readonly lift?: number; readonly roar?: number}> = ({
	t,
	lift = 0,
	roar = 0,
}) => {
	const breathe = Math.sin(t * 0.12) * 3;
	const tail = Math.sin(t * 0.13) * 15;
	return (
		<g>
			<ellipse cx={0} cy={4} rx={190} ry={16} fill="rgba(0,0,0,0.18)" />
			<Leg x={-95} y={-95} len={88} w={40} angle={4} color="#d3922f" paw="#f7dfae" />
			<Leg x={100} y={-95} len={88} w={40} angle={-4} color="#d3922f" paw="#f7dfae" />
			<g transform={`rotate(${tail} -150 -140)`}>
				<path d="M-150 -140 C-230 -130 -240 -60 -210 -40" fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" />
				<path d="M-150 -140 C-230 -130 -240 -60 -210 -40" fill="none" stroke={GOLD} strokeWidth={13} strokeLinecap="round" />
				<path d="M-215 -45 l-22 10 l12 -26 l-14 -10 l28 2 Z" fill={MANE} {...ink} strokeWidth={4} />
			</g>
			<ellipse cx={0} cy={-140 + breathe * 0.3} rx={165} ry={65 + breathe} fill={GOLD} {...ink} />
			<ellipse cx={10} cy={-95} rx={120} ry={20} fill="#f7d58e" />
			{/* head with mane */}
			<g transform={`translate(160 -190) rotate(${-lift * 22})`}>
				<g transform={`rotate(${t * 0.4})`}>
					<path d={manePath} fill={MANE} {...ink} />
				</g>
				<circle cx={0} cy={0} r={84} fill="#d9752a" {...ink} />
				<circle cx={-44} cy={-58} r={18} fill={GOLD} {...ink} />
				<circle cx={44} cy={-58} r={18} fill={GOLD} {...ink} />
				<circle cx={0} cy={4} r={64} fill={GOLD} {...ink} />
				{/* muzzle & mouth */}
				<ellipse cx={12} cy={30 + roar * 10} rx={40} ry={26 + roar * 6} fill="#fbe6bd" {...ink} />
				<g transform={`translate(12 ${46 + roar * 14})`}>
					<ellipse cx={0} cy={0} rx={22 + roar * 8} ry={2 + roar * 30} fill="#7a1d2b" stroke={INK} strokeWidth={4} />
					{roar > 0.2 ? (
						<>
							<path d={`M-12 ${-roar * 26} l5 12 l5 -12 M2 ${-roar * 26} l5 12 l5 -12`} fill="#ffffff" stroke={INK} strokeWidth={2} />
							<ellipse cx={0} cy={roar * 16} rx={12} ry={roar * 8} fill="#ff8aa0" />
						</>
					) : null}
				</g>
				<path d="M0 12 L24 12 L12 26 Z" fill="#7b3b2a" {...ink} strokeWidth={4} />
				<Eye x={-16} y={-14} r={10} blink={Math.max(blinkAt(t, 85, 10), roar * 0.75)} />
				<Eye x={34} y={-14} r={10} blink={Math.max(blinkAt(t, 85, 10), roar * 0.75)} />
				<path d={`M-30 ${-36 - roar * 4} l22 ${6 + roar * 4} M20 ${-30 + roar * 2} l24 ${-6 - roar * 4}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
			</g>
			<Leg x={-70} y={-95} len={88} w={42} angle={-3} color={GOLD} paw="#fbe6bd" />
			<Leg x={125} y={-95} len={88} w={42} angle={3} color={GOLD} paw="#fbe6bd" />
		</g>
	);
};
