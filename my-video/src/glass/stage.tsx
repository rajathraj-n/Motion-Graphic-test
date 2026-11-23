import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../steam/theme';

export const PERSPECTIVE = 1800;

/** Virtual camera. z > 0 dollies toward the scene; ry orbits around the centre. */
export type Cam = {x: number; y: number; z: number; rx: number; ry: number};
export const CAM0: Cam = {x: 0, y: 0, z: 0, rx: 0, ry: 0};

export type Placement = {
	x: number;
	y: number;
	z: number;
	w: number;
	h: number;
	rx?: number;
	ry?: number;
	rz?: number;
	s?: number;
};

/**
 * Positions an element in a shared 3D world. All elements are direct children of
 * <Stage>, which owns the perspective, so they converge to one vanishing point
 * and backdrop blur keeps working (no preserve-3d needed).
 */
export const place = (p: Placement, cam: Cam): React.CSSProperties => ({
	position: 'absolute',
	left: 960 - p.w / 2,
	top: 540 - p.h / 2,
	width: p.w,
	height: p.h,
	transform: [
		`translate3d(0px, 0px, ${cam.z}px)`,
		`rotateX(${cam.rx}deg)`,
		`rotateY(${cam.ry}deg)`,
		`translate3d(${p.x - cam.x}px, ${p.y - cam.y}px, ${p.z}px)`,
		`rotateX(${p.rx ?? 0}deg)`,
		`rotateY(${p.ry ?? 0}deg)`,
		`rotateZ(${p.rz ?? 0}deg)`,
		`scale(${p.s ?? 1})`,
	].join(' '),
});

/** Approximate screen position of a world point (ignores camera rotation). */
export const project = (x: number, y: number, z: number, cam: Cam) => {
	const k = PERSPECTIVE / (PERSPECTIVE - (z + cam.z));
	return {x: 960 + (x - cam.x) * k, y: 540 + (y - cam.y) * k, k};
};

/** Depth-of-field blur for an element at depth z when focusing on focusZ. */
export const dof = (z: number, focusZ = 0, strength = 1) => Math.min(9, (Math.abs(z - focusZ) / 70) * strength);

/** Dark Steam-navy environment with a soft blue haze. */
export const Environment: React.FC<{readonly haze?: number; readonly hazeX?: number; readonly hazeY?: number; readonly darken?: number}> = ({
	haze = 1,
	hazeX = 50,
	hazeY = 45,
	darken = 0,
}) => (
	<>
		<AbsoluteFill style={{background: C.bg}} />
		<AbsoluteFill
			style={{
				background: `radial-gradient(ellipse 60% 55% at ${hazeX}% ${hazeY}%, rgba(26,159,255,${0.16 * haze}) 0%, rgba(26,159,255,0) 70%), radial-gradient(ellipse 90% 70% at 50% 110%, rgba(103,193,245,${0.07 * haze}) 0%, transparent 60%)`,
			}}
		/>
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
		{darken > 0 ? <AbsoluteFill style={{background: `rgba(8,10,14,${darken})`}} /> : null}
	</>
);

/** Container that owns the shared perspective. */
export const Stage: React.FC<{readonly children: React.ReactNode}> = ({children}) => (
	<AbsoluteFill style={{perspective: PERSPECTIVE, perspectiveOrigin: '50% 50%'}}>{children}</AbsoluteFill>
);
