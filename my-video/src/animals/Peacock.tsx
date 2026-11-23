import React from 'react';
import {INK} from '../theme';
import {Eye, blinkAt, ink} from './parts';

const BLUE = '#1f63c9';
const N = 19;

/**
 * Indian peacock facing right, standing on y=0.
 * `fan` (0..1) opens the tail; `shimmer` animates the eye spots.
 */
export const Peacock: React.FC<{readonly t: number; readonly fan?: number}> = ({t, fan = 0}) => {
	const spread = 85 * fan;
	const len = 120 + 260 * fan;
	return (
		<g>
			<ellipse cx={0} cy={4} rx={120 + 200 * fan} ry={16} fill="rgba(0,0,0,0.18)" />
			{/* tail feathers, drawn back-to-front */}
			<g transform="translate(-20 -150)">
				{Array.from({length: N}).map((_, i) => {
					const k = i / (N - 1) - 0.5; // -0.5..0.5
					const ang = -90 + k * 2 * spread + Math.sin(t * 0.2 + i) * 1.5 * fan;
					const l = len * (1 - Math.abs(k) * 0.25);
					const glow = 0.5 + 0.5 * Math.sin(t * 0.25 - i * 0.5);
					return (
						<g key={i} transform={`rotate(${ang + 90})`}>
							<path d={`M0 0 L0 ${-l + 40}`} stroke={INK} strokeWidth={6} />
							<path d={`M0 0 L0 ${-l + 40}`} stroke="#2a8a4a" strokeWidth={2} />
							<ellipse cx={0} cy={-l * 0.62} rx={34 * (0.4 + 0.6 * fan)} ry={l * 0.42} fill="#2ea85a" {...ink} strokeWidth={4} />
							<ellipse cx={0} cy={-l + 46} rx={36} ry={46} fill="#1f9a6e" {...ink} strokeWidth={4} />
							<ellipse cx={0} cy={-l + 50} rx={26} ry={34} fill="#f4c430" />
							<ellipse cx={0} cy={-l + 54} rx={18} ry={24} fill={`rgb(${20 + glow * 30}, ${160 + glow * 50}, ${200 + glow * 40})`} />
							<ellipse cx={0} cy={-l + 58} rx={10} ry={14} fill="#122a6b" />
						</g>
					);
				})}
			</g>
			{/* legs */}
			<path d="M-10 -60 L-18 0 M20 -60 L26 0" stroke={INK} strokeWidth={10} strokeLinecap="round" />
			<path d="M-10 -60 L-18 0 M20 -60 L26 0" stroke="#c9a38a" strokeWidth={5} strokeLinecap="round" />
			<path d="M-34 0 L0 0 M10 0 L42 0" stroke={INK} strokeWidth={8} strokeLinecap="round" />
			{/* body and neck */}
			<path d="M-70 -110 C-80 -180 0 -200 30 -170 C55 -230 40 -290 70 -320 C95 -300 85 -240 80 -180 C90 -120 40 -60 -10 -62 C-50 -64 -66 -80 -70 -110 Z" fill={BLUE} {...ink} />
			<path d="M-60 -110 C-40 -90 0 -84 30 -100" fill="none" stroke="#5aa9ff" strokeWidth={8} strokeLinecap="round" opacity={0.7} />
			<path d="M-50 -130 C-30 -165 10 -165 20 -140 C0 -120 -30 -110 -50 -130 Z" fill="#2c9a6a" {...ink} strokeWidth={4} />
			{/* head */}
			<g transform={`translate(78 -330) rotate(${Math.sin(t * 0.15) * 5})`}>
				{[-22, 0, 22].map((a) => (
					<g key={a} transform={`rotate(${a})`}>
						<path d="M0 -20 L0 -62" stroke={INK} strokeWidth={4} />
						<circle cx={0} cy={-66} r={8} fill={BLUE} {...ink} strokeWidth={3} />
					</g>
				))}
				<ellipse cx={0} cy={0} rx={30} ry={26} fill={BLUE} {...ink} />
				<path d="M8 -14 C20 -14 26 -4 20 4 C14 -2 6 -4 8 -14 Z" fill="#ffffff" />
				<Eye x={12} y={-6} r={6} blink={blinkAt(t, 70, 15)} />
				<path d="M26 2 L52 8 L26 14 Z" fill="#f2b33d" {...ink} strokeWidth={4} />
			</g>
		</g>
	);
};
