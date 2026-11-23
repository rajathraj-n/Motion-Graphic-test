import React from 'react';
import {fontFamily, INK} from '../theme';

/** Rounded pill with a map pin, used to label where each animal lives. */
export const LocationTag: React.FC<{readonly label: string; readonly color?: string}> = ({
	label,
	color = '#ff5d8f',
}) => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			gap: 16,
			padding: '14px 34px 14px 22px',
			borderRadius: 999,
			background: '#ffffff',
			border: `6px solid ${INK}`,
			boxShadow: `0 8px 0 ${INK}`,
			fontFamily,
			fontWeight: 800,
			fontSize: 50,
			color: INK,
		}}
	>
		<svg width={44} height={56} viewBox="-22 -50 44 56">
			<path
				d="M0 4 C-6 -8 -18 -20 -18 -32 A18 18 0 0 1 18 -32 C18 -20 6 -8 0 4 Z"
				fill={color}
				stroke={INK}
				strokeWidth={5}
				strokeLinejoin="round"
			/>
			<circle cx={0} cy={-32} r={7} fill="#ffffff" stroke={INK} strokeWidth={4} />
		</svg>
		{label}
	</div>
);
