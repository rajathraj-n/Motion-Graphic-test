import React from 'react';
import {AbsoluteFill, Interactive, interpolate, random, useCurrentFrame} from 'remotion';
import {easeIn, easeInOut} from '../anim';
import {Lion} from '../animals/Lion';
import {Caption} from '../props/Caption';
import {LocationTag} from '../props/LocationTag';
import {Bush, Tree} from '../props/Scenery';
import {INK} from '../theme';

const ROAR_START = 50;

export const GirScene: React.FC = () => {
	const frame = useCurrentFrame();
	const rise = easeInOut(frame, 8, 34);
	const lift = easeInOut(frame, 40, 12);
	const roar = interpolate(frame, [ROAR_START, ROAR_START + 6, ROAR_START + 36, ROAR_START + 46], [0, 1, 0.9, 0.1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const shakeAmt = roar > 0.5 ? 6 * roar : 0;
	const shakeX = (random(`sx${frame}`) - 0.5) * shakeAmt * 2;
	const shakeY = (random(`sy${frame}`) - 0.5) * shakeAmt * 2;
	const bushPart = easeInOut(frame, 6, 30);

	return (
		<AbsoluteFill style={{background: 'linear-gradient(#ffe7a3 0%, #ffc56b 55%, #f4a34b 100%)'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute'}}>
				<g transform={`translate(${shakeX} ${shakeY})`}>
					<circle cx={960} cy={420} r={260} fill="#fff1b8" opacity={0.7} />
					<circle cx={960} cy={420} r={190} fill="#fff6d0" opacity={0.8} />
					{/* dry teak forest */}
					<path d="M-50 720 C300 640 600 690 960 660 C1300 630 1600 690 1980 650 L1980 1100 L-50 1100 Z" fill="#c9a24a" />
					{[80, 330, 600, 1330, 1600, 1850].map((x, i) => (
						<Tree key={x} x={x} y={760} s={1.5 + (i % 2) * 0.3} color="#a8b844" dark="#7f9132" sway={Math.sin(frame / 16 + i) * 1.5} />
					))}
					<path d="M-50 800 C400 770 900 820 1980 780 L1980 1100 L-50 1100 Z" fill="#d9b25a" stroke={INK} strokeWidth={5} />

					{/* roar sound waves */}
					{roar > 0.2
						? [0, 1, 2].map((i) => {
								const p = ((frame - ROAR_START + i * 8) % 24) / 24;
								return (
									<path
										key={i}
										d={`M${1180 + p * 260} ${740 - 70 - p * 90} Q${1240 + p * 300} 740 ${1180 + p * 260} ${740 + 70 + p * 90}`}
										fill="none"
										stroke="#ffffff"
										strokeWidth={14}
										strokeLinecap="round"
										opacity={(1 - p) * roar}
									/>
								);
							})
						: null}

					{/* lion rises from behind bushes */}
					<g transform={`translate(880 ${960 + (1 - rise) * 420}) scale(1.15)`}>
						<Lion t={frame} lift={lift} roar={roar} />
					</g>

					{/* bushes part as the lion emerges */}
					<Bush x={560 - bushPart * 140} y={1000} s={2.1} color="#9cc24a" dark="#6f9633" />
					<Bush x={1360 + bushPart * 140} y={1005} s={2.2} color="#9cc24a" dark="#6f9633" />
					<Bush x={960} y={1110} s={2.6} color="#b2cf55" dark="#7f9f3a" />
				</g>
			</svg>
			<AbsoluteFill style={{padding: '60px 90px'}}>
				<Interactive.Div
					name="Gir tag"
					style={{
						alignSelf: 'flex-start',
						translate: `${interpolate(easeIn(frame, 18, 20), [0, 1], [-560, 0])}px 0px`,
					}}
				>
					<LocationTag label="Gir Forest, Gujarat" color="#ff9933" />
				</Interactive.Div>
			</AbsoluteFill>
			<AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 200}}>
				<Interactive.Div name="Gir caption" style={{opacity: easeIn(frame, 6, 6)}}>
					<Caption line="And the majestic *Asiatic lions* of Gir Forest!" startFrame={8} />
				</Interactive.Div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
