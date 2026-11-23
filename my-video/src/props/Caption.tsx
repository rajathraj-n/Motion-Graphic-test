import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {fontFamily, INK} from '../theme';

type Word = {text: string; highlight?: boolean; suffix?: string};

// Turns "Meet the *Bengal tiger*" into words, highlighting the *starred* part.
const parse = (line: string): Word[] => {
	const words: Word[] = [];
	line.split(/(\*[^*]+\*)/).forEach((part) => {
		const highlight = part.startsWith('*');
		part
			.replace(/\*/g, '')
			.split(' ')
			.filter(Boolean)
			.forEach((text) => {
				// Keep punctuation attached to the word before it, in the normal colour.
				if (/^[?!.,]+$/.test(text) && words.length > 0) {
					words[words.length - 1].suffix = (words[words.length - 1].suffix ?? '') + text;
				} else {
					words.push({text, highlight});
				}
			});
	});
	return words;
};

/**
 * Kinetic narration text. Words pop in one by one; animal names are highlighted.
 * Wrap the line's animal names in *asterisks*.
 */
export const Caption: React.FC<{
	readonly line: string;
	readonly startFrame?: number;
	readonly stagger?: number;
	readonly color?: string;
	readonly highlightColor?: string;
}> = ({line, startFrame = 6, stagger = 3, color = '#ffffff', highlightColor = '#ffd23f'}) => {
	const frame = useCurrentFrame();
	const words = parse(line);
	return (
		<div
			style={{
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'center',
				columnGap: 24,
				rowGap: 0,
				maxWidth: 1500,
				fontFamily,
				fontWeight: 800,
				fontSize: 84,
				lineHeight: 1.1,
				textAlign: 'center',
			}}
		>
			{words.map((w, i) => {
				const local = frame - startFrame - i * stagger;
				const pop = interpolate(local, [0, 10], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: Easing.spring({damping: 9, mass: 0.6}),
				});
				const wiggle = w.highlight ? Math.sin((frame - startFrame) / 5 + i) * 3 : 0;
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							color: w.highlight ? highlightColor : color,
							opacity: interpolate(local, [0, 3], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							scale: String(pop),
							translate: `0px ${(1 - pop) * 40}px`,
							rotate: `${wiggle}deg`,
							WebkitTextStroke: `10px ${INK}`,
							paintOrder: 'stroke fill',
							textShadow: `0 6px 0 ${INK}`,
						}}
					>
						{w.text}
						{w.suffix ? <span style={{color}}>{w.suffix}</span> : null}
					</span>
				);
			})}
		</div>
	);
};
