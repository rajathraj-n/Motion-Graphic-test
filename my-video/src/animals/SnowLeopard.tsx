import React, {useId} from 'react';
import {INK} from '../theme';
import {Eye, Leg, blinkAt, ink} from './parts';

const FUR = '#eeeae0';
const SHADE = '#d6d0c2';

const rosettes: [number, number][] = [
	[-110, -150], [-70, -170], [-30, -150], [10, -172], [50, -150], [90, -168], [-90, -120], [-40, -118], [20, -125], [75, -128],
];

/**
 * Snow leopard facing right. `stretch` (0..1) extends legs forward/back for a leap.
 * Ground is at y=0.
 */
export const SnowLeopard: React.FC<{readonly t: number; readonly stretch?: number}> = ({t, stretch = 0}) => {
	const id = useId();
	const front = -15 - stretch * 50;
	const back = 10 + stretch * 55;
	const tail = Math.sin(t * 0.18) * 8 - stretch * 12;
	return (
		<g>
			<ellipse cx={0} cy={4} rx={180 * (1 - stretch * 0.6)} ry={14} fill="rgba(0,0,0,0.15)" />
			<Leg x={-95} y={-95} len={86} w={36} angle={back + 8} color={SHADE} paw={FUR} />
			<Leg x={95} y={-95} len={86} w={36} angle={front - 8} color={SHADE} paw={FUR} />
			{/* long thick tail */}
			<g transform={`rotate(${tail} -150 -140)`}>
				<path d="M-150 -140 C-260 -150 -300 -60 -250 -20 C-230 -5 -210 -25 -225 -40" fill="none" stroke={INK} strokeWidth={46} strokeLinecap="round" />
				<path d="M-150 -140 C-260 -150 -300 -60 -250 -20 C-230 -5 -210 -25 -225 -40" fill="none" stroke={FUR} strokeWidth={36} strokeLinecap="round" />
				<circle cx={-215} cy={-130} r={8} fill="none" stroke={INK} strokeWidth={5} />
				<circle cx={-262} cy={-90} r={8} fill="none" stroke={INK} strokeWidth={5} />
				<circle cx={-245} cy={-38} r={8} fill={INK} />
			</g>
			<defs>
				<clipPath id={`${id}b`}>
					<ellipse cx={0} cy={-140} rx={160} ry={58} />
				</clipPath>
			</defs>
			<ellipse cx={0} cy={-140} rx={160} ry={58} fill={FUR} />
			<g clipPath={`url(#${id}b)`}>
				<ellipse cx={0} cy={-92} rx={140} ry={24} fill="#ffffff" />
				{rosettes.map(([x, y]) => (
					<g key={`${x}${y}`}>
						<circle cx={x} cy={y} r={11} fill="#b9b2a2" stroke={INK} strokeWidth={4} strokeDasharray="10 6" />
					</g>
				))}
			</g>
			<ellipse cx={0} cy={-140} rx={160} ry={58} fill="none" {...ink} />
			{/* head */}
			<g transform={`translate(165 -170) rotate(${-stretch * 8})`}>
				<circle cx={-32} cy={-44} r={16} fill={FUR} {...ink} />
				<circle cx={32} cy={-44} r={16} fill={FUR} {...ink} />
				<circle cx={-32} cy={-44} r={7} fill={INK} />
				<circle cx={32} cy={-44} r={7} fill={INK} />
				<circle cx={0} cy={0} r={56} fill={FUR} {...ink} />
				<circle cx={-30} cy={-24} r={5} fill={INK} />
				<circle cx={-8} cy={-38} r={5} fill={INK} />
				<circle cx={16} cy={-36} r={5} fill={INK} />
				<ellipse cx={8} cy={22} rx={34} ry={22} fill="#ffffff" {...ink} strokeWidth={4} />
				<path d="M-4 8 L20 8 L8 20 Z" fill="#e8869a" {...ink} strokeWidth={3} />
				<Eye x={-16} y={-8} r={9} blink={blinkAt(t, 85, 30)} />
				<Eye x={28} y={-8} r={9} blink={blinkAt(t, 85, 30)} />
			</g>
			<Leg x={-70} y={-95} len={86} w={38} angle={back} color={FUR} paw="#ffffff" />
			<Leg x={120} y={-95} len={86} w={38} angle={front} color={FUR} paw="#ffffff" />
		</g>
	);
};
