import React from 'react';
import {INK} from '../theme';

export const ink = {
	stroke: INK,
	strokeWidth: 5,
	strokeLinejoin: 'round' as const,
	strokeLinecap: 'round' as const,
};

/** A rounded leg that rotates around its hip. */
export const Leg: React.FC<{
	readonly x: number;
	readonly y: number;
	readonly len: number;
	readonly w: number;
	readonly angle: number;
	readonly color: string;
	readonly paw?: string;
}> = ({x, y, len, w, angle, color, paw}) => (
	<g transform={`rotate(${angle} ${x} ${y})`}>
		<rect x={x - w / 2} y={y - w / 2} width={w} height={len + w / 2} rx={w / 2} fill={color} {...ink} />
		{paw ? <ellipse cx={x + w * 0.12} cy={y + len - w * 0.15} rx={w * 0.62} ry={w * 0.38} fill={paw} {...ink} /> : null}
	</g>
);

/** Cartoon eye with a highlight. Blinks when `blink` is near 1. */
export const Eye: React.FC<{readonly x: number; readonly y: number; readonly r?: number; readonly blink?: number}> = ({
	x,
	y,
	r = 11,
	blink = 0,
}) => (
	<g transform={`translate(${x} ${y}) scale(1 ${Math.max(0.08, 1 - blink)})`}>
		<ellipse cx={0} cy={0} rx={r} ry={r * 1.15} fill={INK} />
		<circle cx={r * 0.35} cy={-r * 0.4} r={r * 0.38} fill="#ffffff" />
	</g>
);

/** Blink curve: returns ~1 for a few frames every `period` frames. */
export const blinkAt = (t: number, period = 70, offset = 0) => {
	const p = (t + offset) % period;
	return p < 4 ? Math.sin((p / 4) * Math.PI) : 0;
};

/** Walk cycle angle for a leg. */
export const swing = (t: number, speed: number, phase: number, amp: number) =>
	Math.sin(t * speed + phase) * amp;
