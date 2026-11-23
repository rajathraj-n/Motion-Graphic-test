import React from 'react';
import {INK} from '../theme';
import {Eye, Leg, blinkAt, ink, swing} from './parts';

const GREY = '#9aa6bd';
const DARK = '#7c88a2';

/**
 * Asian elephant facing right. `trunk` swings the trunk (-1..1).
 * Ground is at y=0.
 */
export const Elephant: React.FC<{readonly t: number; readonly walk?: number; readonly trunk?: number}> = ({
	t,
	walk = 1,
	trunk = 0,
}) => {
	const sp = 0.25;
	const a = (phase: number) => swing(t, sp, phase, 16 * walk);
	const bob = Math.abs(Math.sin(t * sp)) * 4 * walk;
	// Trunk: 3 control points that curl upward as `trunk` rises.
	const tipX = 300 + trunk * 40;
	const tipY = -40 - trunk * 210;
	const trunkPath = `M232 -205 C290 -190 ${300 + trunk * 10} ${-130 - trunk * 40} ${tipX} ${tipY}`;
	return (
		<g>
			<ellipse cx={20} cy={4} rx={210} ry={18} fill="rgba(0,0,0,0.18)" />
			<Leg x={-110} y={-110} len={105} w={62} angle={a(Math.PI)} color={DARK} />
			<Leg x={95} y={-110} len={105} w={62} angle={a(0)} color={DARK} />
			<g transform={`translate(0 ${-bob})`}>
				<path d="M-185 -190 Q-215 -160 -205 -110" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />
				<path d="M-205 -110 l-10 18 l14 -4 l6 14 Z" fill={INK} />
				<ellipse cx={0} cy={-185} rx={190} ry={120} fill={GREY} {...ink} />
				<path d="M-120 -260 Q-60 -295 10 -290" fill="none" stroke="#ffffff" strokeWidth={10} strokeLinecap="round" opacity={0.35} />
				{/* head */}
				<g transform={`rotate(${Math.sin(t * sp) * 2 * walk} 170 -220)`}>
					<path d={trunkPath} fill="none" stroke={INK} strokeWidth={58} strokeLinecap="round" />
					<path d={trunkPath} fill="none" stroke={GREY} strokeWidth={48} strokeLinecap="round" />
					<circle cx={175} cy={-225} r={92} fill={GREY} {...ink} />
					<path d="M230 -175 q22 18 40 6" fill="none" stroke="#fffaf0" strokeWidth={14} strokeLinecap="round" />
					<path d="M230 -175 q22 18 40 6" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
					{/* ear flaps gently */}
					<g transform={`rotate(${Math.sin(t * 0.2) * 6} 130 -240)`}>
						<path d="M135 -290 C60 -300 50 -170 115 -150 C150 -150 160 -230 135 -290 Z" fill="#c9a3b8" {...ink} />
						<path d="M128 -270 C85 -270 80 -190 115 -175" fill="none" stroke="#b28aa0" strokeWidth={10} strokeLinecap="round" />
					</g>
					<Eye x={210} y={-245} r={11} blink={blinkAt(t, 90, 20)} />
					<ellipse cx={232} cy={-215} rx={14} ry={9} fill="#f59ab5" opacity={0.7} />
				</g>
			</g>
			<Leg x={-80} y={-110} len={105} w={64} angle={a(0)} color={GREY} />
			<Leg x={125} y={-110} len={105} w={64} angle={a(Math.PI)} color={GREY} />
			{[-80, 125].map((x) => (
				<g key={x} transform={`rotate(${a(x < 0 ? 0 : Math.PI)} ${x} -110)`}>
					<path d={`M${x - 18} -12 l0 -8 M${x} -12 l0 -8 M${x + 18} -12 l0 -8`} stroke="#fffaf0" strokeWidth={8} strokeLinecap="round" />
				</g>
			))}
		</g>
	);
};
