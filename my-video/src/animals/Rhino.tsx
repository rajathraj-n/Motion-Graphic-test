import React from 'react';
import {INK} from '../theme';
import {Eye, Leg, blinkAt, ink, swing} from './parts';

const SKIN = '#a99a8c';
const DARK = '#8c7d70';

/** Indian one-horned rhinoceros facing right. Ground is at y=0. */
export const Rhino: React.FC<{readonly t: number; readonly walk?: number}> = ({t, walk = 1}) => {
	const sp = 0.3;
	const a = (phase: number) => swing(t, sp, phase, 20 * walk);
	const bob = Math.abs(Math.sin(t * sp)) * 4 * walk;
	const ear = Math.sin(t * 0.3) * 10;
	return (
		<g>
			<ellipse cx={10} cy={4} rx={200} ry={16} fill="rgba(0,0,0,0.18)" />
			<Leg x={-100} y={-80} len={75} w={52} angle={a(Math.PI)} color={DARK} />
			<Leg x={95} y={-80} len={75} w={52} angle={a(0)} color={DARK} />
			<g transform={`translate(0 ${-bob})`}>
				<path d="M-170 -150 q-30 10 -30 50" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
				<path d="M-170 -130 C-190 -230 170 -235 175 -140 C180 -60 -150 -50 -170 -130 Z" fill={SKIN} {...ink} />
				{/* armour folds */}
				<path d="M-80 -205 Q-95 -140 -70 -80" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
				<path d="M60 -210 Q40 -150 70 -85" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
				<path d="M-150 -120 Q0 -100 160 -125" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.5} />
				{[-130, -40, 20, 110].map((x, i) => (
					<circle key={x} cx={x} cy={-170 + (i % 2) * 18} r={7} fill={DARK} />
				))}
				{/* head */}
				<g transform={`rotate(${Math.sin(t * sp) * 3 * walk} 165 -140)`}>
					<path d="M150 -185 C210 -205 280 -150 300 -95 C305 -70 270 -60 240 -70 C200 -80 140 -90 150 -185 Z" fill={SKIN} {...ink} />
					{/* the one horn */}
					<path d="M262 -112 C262 -150 280 -185 300 -205 C298 -170 300 -130 292 -100 Z" fill="#f4ead7" {...ink} />
					<path d="M248 -102 C250 -125 258 -140 268 -150 C268 -130 270 -115 266 -100 Z" fill="#f4ead7" {...ink} strokeWidth={4} />
					<g transform={`rotate(${ear} 165 -185)`}>
						<path d="M160 -180 C150 -230 175 -240 185 -195 Z" fill={SKIN} {...ink} />
					</g>
					<Eye x={215} y={-140} r={9} blink={blinkAt(t, 75, 40)} />
					<path d="M268 -76 q10 6 22 0" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
				</g>
			</g>
			<Leg x={-70} y={-80} len={75} w={54} angle={a(0)} color={SKIN} />
			<Leg x={125} y={-80} len={75} w={54} angle={a(Math.PI)} color={SKIN} />
		</g>
	);
};
