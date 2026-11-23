import React from 'react';
import {INK} from '../theme';

const stroke = {stroke: INK, strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

export const Tree: React.FC<{
	readonly x: number;
	readonly y: number;
	readonly s?: number;
	readonly grow?: number;
	readonly sway?: number;
	readonly color?: string;
	readonly dark?: string;
}> = ({x, y, s = 1, grow = 1, sway = 0, color = '#3dbb5c', dark = '#1f8a4c'}) => (
	<g transform={`translate(${x} ${y}) scale(${s * grow}) rotate(${sway})`}>
		<path d="M-10 0 L-7 -70 L7 -70 L10 0 Z" fill="#8a5a33" {...stroke} />
		<circle cx={-32} cy={-90} r={36} fill={dark} {...stroke} />
		<circle cx={32} cy={-92} r={36} fill={dark} {...stroke} />
		<circle cx={0} cy={-125} r={46} fill={color} {...stroke} />
		<circle cx={-14} cy={-138} r={12} fill="#ffffff" opacity={0.25} />
	</g>
);

export const Palm: React.FC<{
	readonly x: number;
	readonly y: number;
	readonly s?: number;
	readonly sway?: number;
	readonly color?: string;
}> = ({x, y, s = 1, sway = 0, color = '#2fa65a'}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<path d="M-8 0 Q-2 -90 10 -180 L22 -178 Q12 -90 10 0 Z" fill="#9b6a3f" {...stroke} />
		<g transform={`translate(16 -180) rotate(${sway})`}>
			{[-150, -110, -60, -20, 25].map((a) => (
				<path
					key={a}
					transform={`rotate(${a})`}
					d="M0 0 Q50 -30 110 10 Q55 0 0 0 Z"
					fill={color}
					{...stroke}
				/>
			))}
		</g>
	</g>
);

export const Bush: React.FC<{
	readonly x: number;
	readonly y: number;
	readonly s?: number;
	readonly color?: string;
	readonly dark?: string;
}> = ({x, y, s = 1, color = '#4cc46a', dark = '#239152'}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<path
			d="M-120 0 C-140 -50 -90 -80 -60 -60 C-50 -110 20 -115 30 -65 C60 -95 120 -70 110 -25 C140 -20 135 0 120 0 Z"
			fill={dark}
			{...stroke}
		/>
		<path d="M-80 -10 C-85 -45 -45 -55 -30 -35 C-20 -70 30 -70 35 -35 C55 -50 80 -30 70 -10 Z" fill={color} />
	</g>
);

export const Cloud: React.FC<{readonly x: number; readonly y: number; readonly s?: number; readonly opacity?: number}> = ({
	x,
	y,
	s = 1,
	opacity = 1,
}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
		<path
			d="M-90 20 C-120 20 -120 -20 -85 -22 C-80 -60 -20 -70 0 -35 C20 -70 90 -55 80 -15 C120 -15 120 20 90 20 Z"
			fill="#ffffff"
			{...stroke}
			strokeWidth={4}
		/>
	</g>
);

export const Mountain: React.FC<{
	readonly x: number;
	readonly y: number;
	readonly w: number;
	readonly h: number;
	readonly color: string;
	readonly snow?: boolean;
	readonly shade?: string;
}> = ({x, y, w, h, color, snow = true, shade = 'rgba(0,0,0,0.12)'}) => {
	const cap = h * 0.32;
	return (
		<g transform={`translate(${x} ${y})`}>
			<path d={`M${-w / 2} 0 L0 ${-h} L${w / 2} 0 Z`} fill={color} {...stroke} />
			<path d={`M0 ${-h} L${w / 2} 0 L${w * 0.08} 0 Z`} fill={shade} />
			{snow ? (
				<path
					d={`M${(-w / 2) * (cap / h)} ${-h + cap} L0 ${-h} L${(w / 2) * (cap / h)} ${-h + cap} L${w * 0.06} ${-h + cap * 0.75} L${-w * 0.02} ${-h + cap * 1.05} L${-w * 0.08} ${-h + cap * 0.8} Z`}
					fill="#ffffff"
					{...stroke}
					strokeWidth={4}
				/>
			) : null}
		</g>
	);
};

export const GrassBlade: React.FC<{
	readonly x: number;
	readonly y: number;
	readonly h: number;
	readonly bend: number;
	readonly color: string;
}> = ({x, y, h, bend, color}) => (
	<path
		d={`M${x - 9} ${y} Q${x + bend * 0.4} ${y - h * 0.6} ${x + bend} ${y - h} Q${x + bend * 0.3 + 4} ${y - h * 0.55} ${x + 9} ${y} Z`}
		fill={color}
		stroke={INK}
		strokeWidth={3}
		strokeLinejoin="round"
	/>
);
