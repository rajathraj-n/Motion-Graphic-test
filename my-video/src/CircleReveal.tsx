import React from 'react';
import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';
import {AbsoluteFill} from 'remotion';
import {INK} from './theme';

type Props = Record<string, never>;

/** The next scene is revealed through a growing circle with a playful ink ring. */
const CircleRevealPresentation: React.FC<TransitionPresentationComponentProps<Props>> = ({
	children,
	presentationDirection,
	presentationProgress,
}) => {
	if (presentationDirection === 'exiting') {
		return <AbsoluteFill>{children}</AbsoluteFill>;
	}
	const r = presentationProgress * 1200;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{clipPath: `circle(${r}px at 50% 50%)`}}>{children}</AbsoluteFill>
			{presentationProgress < 1 ? (
				<svg width={1920} height={1080} style={{position: 'absolute'}}>
					<circle cx={960} cy={540} r={r} fill="none" stroke={INK} strokeWidth={22} />
					<circle cx={960} cy={540} r={r + 14} fill="none" stroke="#ffd23f" strokeWidth={12} />
				</svg>
			) : null}
		</AbsoluteFill>
	);
};

export const circleReveal = (): TransitionPresentation<Props> => ({
	component: CircleRevealPresentation,
	props: {},
});
