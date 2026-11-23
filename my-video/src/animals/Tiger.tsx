import React, {useId} from 'react';
import {INK} from '../theme';
import {Eye, Leg, blinkAt, ink, swing} from './parts';

const ORANGE = '#f7891f';
const LIGHT = '#fff1d6';

/** Bengal tiger facing right. Ground is at y=0. `walk` 0..1 blends the walk cycle. */
export const Tiger: React.FC<{readonly t: number; readonly walk?: number}> = ({t, walk = 1}) => {
	const id = useId();
	const sp = 0.32;
	const a = (phase: number) => swing(t, sp, phase, 26 * walk);
	const bob = Math.abs(Math.sin(t * sp)) * 5 * walk;
	const tail = Math.sin(t * 0.15) * 12;
	return (
		<g>
			<ellipse cx={0} cy={4} rx={190} ry={16} fill="rgba(0,0,0,0.18)" />
			{/* far legs */}
			<Leg x={-95} y={-95} len={88} w={38} angle={a(Math.PI)} color="#d86f12" paw="#f5e2c4" />
			<Leg x={95} y={-95} len={88} w={38} angle={a(0)} color="#d86f12" paw="#f5e2c4" />
			<g transform={`translate(0 ${-bob})`}>
				{/* tail */}
				<g transform={`rotate(${tail} -150 -130)`}>
					<path d="M-150 -130 C-220 -150 -230 -230 -190 -250" fill="none" stroke={INK} strokeWidth={30} strokeLinecap="round" />
					<path d="M-150 -130 C-220 -150 -230 -230 -190 -250" fill="none" stroke={ORANGE} strokeWidth={20} strokeLinecap="round" />
					<path d="M-205 -175 l22 -4 M-215 -212 l22 6" stroke={INK} strokeWidth={8} strokeLinecap="round" />
					<circle cx={-190} cy={-250} r={12} fill={INK} />
				</g>
				{/* body */}
				<defs>
					<clipPath id={`${id}b`}>
						<ellipse cx={0} cy={-135} rx={165} ry={68} />
					</clipPath>
				</defs>
				<ellipse cx={0} cy={-135} rx={165} ry={68} fill={ORANGE} />
				<g clipPath={`url(#${id}b)`}>
					<ellipse cx={10} cy={-82} rx={140} ry={30} fill={LIGHT} />
					{[-120, -80, -40, 0, 40, 80].map((x) => (
						<path key={x} d={`M${x} -205 Q${x + 18} -165 ${x - 4} -130 Q${x + 4} -160 ${x - 14} -205 Z`} fill={INK} />
					))}
				</g>
				<ellipse cx={0} cy={-135} rx={165} ry={68} fill="none" {...ink} />
				{/* head */}
				<g transform={`translate(165 -175) rotate(${Math.sin(t * sp * 2) * 2 * walk})`}>
					<circle cx={-38} cy={-52} r={20} fill={ORANGE} {...ink} />
					<circle cx={38} cy={-52} r={20} fill={ORANGE} {...ink} />
					<circle cx={-38} cy={-52} r={9} fill={INK} />
					<circle cx={38} cy={-52} r={9} fill={INK} />
					<circle cx={0} cy={0} r={66} fill={ORANGE} {...ink} />
					<path d="M-10 -66 l6 22 l6 -22 M-40 -54 l12 18 M40 -54 l-12 18" stroke={INK} strokeWidth={7} strokeLinecap="round" />
					<path d="M-66 -6 l20 4 M-64 14 l18 0 M66 -6 l-20 4 M64 14 l-18 0" stroke={INK} strokeWidth={7} strokeLinecap="round" />
					<ellipse cx={8} cy={26} rx={44} ry={30} fill={LIGHT} {...ink} />
					<path d="M-6 8 L22 8 L8 22 Z" fill="#e8577a" {...ink} strokeWidth={4} />
					<path d="M8 22 q-10 14 -20 6 M8 22 q10 14 20 6" fill="none" {...ink} strokeWidth={4} />
					<Eye x={-20} y={-14} r={10} blink={blinkAt(t, 80)} />
					<Eye x={28} y={-14} r={10} blink={blinkAt(t, 80)} />
				</g>
			</g>
			{/* near legs */}
			<Leg x={-75} y={-95} len={88} w={40} angle={a(0)} color={ORANGE} paw="#fff4e0" />
			<Leg x={115} y={-95} len={88} w={40} angle={a(Math.PI)} color={ORANGE} paw="#fff4e0" />
		</g>
	);
};
