import React, {useId} from 'react';
import {random} from 'remotion';
import {font} from './theme';
import type {ArtKind, Game} from './games';

// Each artwork is drawn in a 1000x1000 space and cropped to fit ("slice"),
// so the same art works for wide store capsules and tall library covers.
const Art: React.FC<{readonly kind: ArtKind; readonly t: number; readonly id: string}> = ({kind, t, id}) => {
	const g = (name: string) => `${id}-${name}`;
	const stars = (n: number, seed: string, maxY = 1000) =>
		Array.from({length: n}).map((_, i) => (
			<circle
				key={i}
				cx={random(`${seed}x${i}`) * 1000}
				cy={random(`${seed}y${i}`) * maxY}
				r={1 + random(`${seed}r${i}`) * 2.5}
				fill="#ffffff"
				opacity={0.4 + 0.6 * Math.abs(Math.sin(t / 15 + i))}
			/>
		));

	switch (kind) {
		case 'space':
			return (
				<>
					<defs>
						<linearGradient id={g('bg')} x1="0" y1="0" x2="1" y2="1">
							<stop offset="0" stopColor="#090c2e" />
							<stop offset="1" stopColor="#4a1a78" />
						</linearGradient>
						<radialGradient id={g('pl')} cx="0.35" cy="0.35" r="0.75">
							<stop offset="0" stopColor="#ffd08a" />
							<stop offset="0.5" stopColor="#f0567a" />
							<stop offset="1" stopColor="#5b1550" />
						</radialGradient>
						<radialGradient id={g('neb')} cx="0.3" cy="0.6" r="0.5">
							<stop offset="0" stopColor="#3fd0ff" stopOpacity="0.45" />
							<stop offset="1" stopColor="#3fd0ff" stopOpacity="0" />
						</radialGradient>
					</defs>
					<rect width={1000} height={1000} fill={`url(#${g('bg')})`} />
					<rect width={1000} height={1000} fill={`url(#${g('neb')})`} />
					{stars(90, 'space')}
					<g transform={`rotate(${t * 0.05} 620 480)`}>
						<circle cx={620} cy={480} r={230} fill={`url(#${g('pl')})`} />
						<ellipse cx={620} cy={480} rx={380} ry={70} fill="none" stroke="#ffd9a8" strokeWidth={14} opacity={0.75} transform="rotate(-18 620 480)" />
					</g>
					<circle cx={260} cy={300} r={46} fill="#9fb6ff" opacity={0.9} />
					<path d={`M${120 + t * 1.5} 760 l60 -16 l-50 30 Z`} fill="#e9f3ff" />
				</>
			);
		case 'castle':
			return (
				<>
					<defs>
						<linearGradient id={g('bg')} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#3b0f3f" />
							<stop offset="0.55" stopColor="#c2410c" />
							<stop offset="1" stopColor="#ffb347" />
						</linearGradient>
					</defs>
					<rect width={1000} height={1000} fill={`url(#${g('bg')})`} />
					<circle cx={500} cy={640} r={170} fill="#ffd166" opacity={0.9} />
					<path d="M0 760 L120 700 L240 740 L380 660 L520 720 L700 650 L860 720 L1000 680 L1000 1000 L0 1000 Z" fill="#5a1530" />
					<path d="M330 820 L330 520 L370 520 L370 480 L400 480 L400 520 L440 520 L440 420 L470 380 L500 340 L530 380 L560 420 L560 520 L600 520 L600 480 L630 480 L630 520 L670 520 L670 820 Z" fill="#1d0718" />
					<path d="M0 860 C300 800 700 820 1000 840 L1000 1000 L0 1000 Z" fill="#12030f" />
					<path d="M470 600 a30 30 0 0 1 60 0 L530 650 L470 650 Z" fill="#ffb347" />
				</>
			);
		case 'neon':
			return (
				<>
					<defs>
						<linearGradient id={g('bg')} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#12002b" />
							<stop offset="0.55" stopColor="#5b0a6e" />
							<stop offset="0.56" stopColor="#0b0020" />
							<stop offset="1" stopColor="#0b0020" />
						</linearGradient>
						<linearGradient id={g('sun')} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#ffe36e" />
							<stop offset="1" stopColor="#ff2e88" />
						</linearGradient>
						<clipPath id={g('sc')}>
							<rect x={0} y={0} width={1000} height={560} />
						</clipPath>
					</defs>
					<rect width={1000} height={1000} fill={`url(#${g('bg')})`} />
					{stars(40, 'neon', 450)}
					<g clipPath={`url(#${g('sc')})`}>
						<circle cx={500} cy={520} r={220} fill={`url(#${g('sun')})`} />
						{[0, 1, 2, 3, 4].map((i) => (
							<rect key={i} x={260} y={440 + i * 26} width={480} height={6 + i * 3} fill="#5b0a6e" />
						))}
					</g>
					{Array.from({length: 13}).map((_, i) => (
						<line key={i} x1={500} y1={560} x2={-700 + i * 200} y2={1000} stroke="#2ef2ff" strokeWidth={3} opacity={0.8} />
					))}
					{Array.from({length: 7}).map((_, i) => {
						const p = ((i + (t / 20) % 1) / 7) ** 2;
						return <line key={i} x1={0} y1={560 + p * 440} x2={1000} y2={560 + p * 440} stroke="#2ef2ff" strokeWidth={3} opacity={0.8} />;
					})}
				</>
			);
		case 'frost':
			return (
				<>
					<defs>
						<linearGradient id={g('bg')} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#0c2340" />
							<stop offset="1" stopColor="#5c8fc7" />
						</linearGradient>
					</defs>
					<rect width={1000} height={1000} fill={`url(#${g('bg')})`} />
					<path d={`M0 ${330 + Math.sin(t / 20) * 20} C300 230 600 420 1000 280 L1000 380 C650 500 300 330 0 430 Z`} fill="#4effb0" opacity={0.35} />
					{stars(40, 'frost', 400)}
					<path d="M-50 800 L250 380 L420 600 L600 330 L820 620 L1050 420 L1050 1000 L-50 1000 Z" fill="#a9c8ec" />
					<path d="M250 380 L320 480 L280 470 L240 520 L200 450 Z M600 330 L680 440 L630 430 L590 490 L550 400 Z" fill="#ffffff" />
					<path d="M-50 900 L300 640 L520 820 L760 620 L1050 860 L1050 1000 L-50 1000 Z" fill="#e8f3ff" />
				</>
			);
		case 'tactics':
			return (
				<>
					<rect width={1000} height={1000} fill="#2d3b22" />
					{Array.from({length: 9}).map((_, r) =>
						Array.from({length: 9}).map((__, c) => {
							const x = c * 120 + (r % 2) * 60;
							const y = r * 104;
							return (
								<path
									key={`${r}-${c}`}
									d={`M${x} ${y - 60} L${x + 52} ${y - 30} L${x + 52} ${y + 30} L${x} ${y + 60} L${x - 52} ${y + 30} L${x - 52} ${y - 30} Z`}
									fill={(r + c) % 3 === 0 ? '#4a5e2f' : '#3a4b28'}
									stroke="#6f8a45"
									strokeWidth={3}
								/>
							);
						}),
					)}
					{[[420, 416, '#e94b3c'], [540, 520, '#e94b3c'], [660, 416, '#3c8ce9'], [600, 312, '#3c8ce9']].map(([x, y, c], i) => (
						<g key={i} transform={`translate(${x} ${Number(y) - Math.abs(Math.sin(t / 8 + i)) * 8})`}>
							<circle r={34} fill={String(c)} stroke="#ffffff" strokeWidth={6} />
							<path d="M-12 8 L0 -16 L12 8 Z" fill="#ffffff" />
						</g>
					))}
				</>
			);
		case 'crystal':
			return (
				<>
					<defs>
						<radialGradient id={g('glow')} cx="0.5" cy="0.6" r="0.5">
							<stop offset="0" stopColor="#2ef2d0" stopOpacity="0.6" />
							<stop offset="1" stopColor="#2ef2d0" stopOpacity="0" />
						</radialGradient>
					</defs>
					<rect width={1000} height={1000} fill="#041418" />
					<rect width={1000} height={1000} fill={`url(#${g('glow')})`} opacity={0.7 + 0.3 * Math.sin(t / 10)} />
					<path d="M0 0 L1000 0 L1000 220 C800 320 650 180 500 280 C350 180 200 320 0 220 Z" fill="#0b2a30" />
					<path d="M0 1000 L0 780 C250 700 380 820 500 760 C640 700 760 820 1000 760 L1000 1000 Z" fill="#0b2a30" />
					{[[500, 760, 120, 300], [400, 780, 70, 180], [610, 780, 80, 200], [300, 800, 50, 110], [700, 800, 50, 120]].map(([x, y, w, h], i) => (
						<g key={i}>
							<path d={`M${x - w / 2} ${y} L${x - w / 3} ${y - h * 0.7} L${x} ${y - h} L${x + w / 3} ${y - h * 0.7} L${x + w / 2} ${y} Z`} fill="#39f0d8" opacity={0.85} />
							<path d={`M${x} ${y - h} L${x + w / 3} ${y - h * 0.7} L${x + w / 2} ${y} L${x} ${y} Z`} fill="#0fb3a0" />
						</g>
					))}
				</>
			);
		case 'sky':
			return (
				<>
					<defs>
						<linearGradient id={g('bg')} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#3aa0ff" />
							<stop offset="1" stopColor="#d6f0ff" />
						</linearGradient>
					</defs>
					<rect width={1000} height={1000} fill={`url(#${g('bg')})`} />
					{[[300, 460, 1.2], [720, 380, 0.9], [560, 720, 0.7]].map(([x, y, s], i) => (
						<g key={i} transform={`translate(${x} ${Number(y) + Math.sin(t / 15 + i) * 12}) scale(${s})`}>
							<path d="M-180 0 L180 0 L90 140 L20 220 L-60 160 Z" fill="#8a6a4a" />
							<path d="M-190 -30 C-120 -80 120 -80 190 -30 L180 10 L-180 10 Z" fill="#5ccc6a" />
							<circle cx={-60} cy={-60} r={40} fill="#3fa654" />
							<circle cx={40} cy={-70} r={50} fill="#3fa654" />
						</g>
					))}
					<ellipse cx={180} cy={220} rx={120} ry={34} fill="#ffffff" opacity={0.85} />
					<ellipse cx={860} cy={600} rx={150} ry={40} fill="#ffffff" opacity={0.8} />
				</>
			);
		case 'dunes':
			return (
				<>
					<defs>
						<linearGradient id={g('bg')} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#ffb25b" />
							<stop offset="1" stopColor="#ffe3a3" />
						</linearGradient>
					</defs>
					<rect width={1000} height={1000} fill={`url(#${g('bg')})`} />
					<circle cx={680} cy={380} r={120} fill="#fff4c2" />
					<path d="M0 620 C200 520 420 640 600 560 C760 490 880 560 1000 530 L1000 1000 L0 1000 Z" fill="#e8913f" />
					<path d="M0 760 C250 660 500 800 1000 680 L1000 1000 L0 1000 Z" fill="#c8682a" />
					<path d="M0 880 C300 820 650 900 1000 840 L1000 1000 L0 1000 Z" fill="#9e4a1e" />
					<path d="M300 660 l8 -60 l14 0 l6 60 M290 620 l50 0" stroke="#5a2a10" strokeWidth={10} />
				</>
			);
		case 'ocean':
			return (
				<>
					<defs>
						<linearGradient id={g('bg')} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#0a6e9c" />
							<stop offset="1" stopColor="#021530" />
						</linearGradient>
					</defs>
					<rect width={1000} height={1000} fill={`url(#${g('bg')})`} />
					{[0, 1, 2, 3].map((i) => (
						<path key={i} d={`M${200 + i * 200} 0 L${260 + i * 200} 0 L${120 + i * 240} 1000 L${40 + i * 240} 1000 Z`} fill="#bff4ff" opacity={0.08} />
					))}
					{Array.from({length: 18}).map((_, i) => (
						<circle key={i} cx={random(`bx${i}`) * 1000} cy={(1000 - ((t * 2 + random(`by${i}`) * 1000) % 1000))} r={4 + random(`br${i}`) * 8} fill="none" stroke="#bff4ff" strokeWidth={2} opacity={0.6} />
					))}
					<path d={`M${300 + Math.sin(t / 20) * 30} 520 c80 -60 220 -60 300 0 c-80 60 -220 60 -300 0 Z m300 0 l60 -50 l0 100 Z`} fill="#06263f" />
					<path d="M0 900 C200 840 300 920 500 870 C700 820 800 900 1000 860 L1000 1000 L0 1000 Z" fill="#011022" />
				</>
			);
		case 'forest':
		default:
			return (
				<>
					<defs>
						<linearGradient id={g('bg')} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#0b1f2a" />
							<stop offset="1" stopColor="#2f6b4f" />
						</linearGradient>
					</defs>
					<rect width={1000} height={1000} fill={`url(#${g('bg')})`} />
					<circle cx={700} cy={300} r={90} fill="#f4f1c9" />
					{stars(30, 'forest', 450)}
					{Array.from({length: 12}).map((_, i) => {
						const x = i * 90 + (i % 2) * 30;
						const h = 300 + (i % 3) * 90;
						return <path key={i} d={`M${x} 1000 L${x} ${1000 - h * 0.3} L${x - 70} ${1000 - h * 0.3} L${x} ${1000 - h} L${x + 70} ${1000 - h * 0.3} L${x} ${1000 - h * 0.3}`} fill="#0d2a1e" />;
					})}
					{Array.from({length: 8}).map((_, i) => (
						<circle key={i} cx={150 + i * 100} cy={700 + Math.sin(t / 10 + i) * 30} r={4} fill="#d6ff7a" opacity={0.8} />
					))}
				</>
			);
	}
};

/** Fictional key art with the game's title over it. */
export const GameArt: React.FC<{
	readonly game: Game;
	readonly t: number;
	readonly width: number;
	readonly height: number;
	readonly showTitle?: boolean;
	readonly titleSize?: number;
	readonly radius?: number;
	readonly style?: React.CSSProperties;
}> = ({game, t, width, height, showTitle = true, titleSize, radius = 6, style}) => {
	const id = useId().replace(/:/g, '');
	const size = titleSize ?? Math.max(18, Math.min(width, height * 1.6) * 0.085);
	return (
		<div style={{position: 'relative', width, height, borderRadius: radius, overflow: 'hidden', ...style}}>
			<svg width={width} height={height} viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0}}>
				<Art kind={game.art} t={t} id={id} />
			</svg>
			{showTitle ? (
				<div
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						alignItems: 'flex-end',
						padding: size * 0.7,
						background: 'linear-gradient(transparent 45%, rgba(0,0,0,0.65))',
						fontFamily: font,
						fontWeight: 900,
						fontSize: size,
						lineHeight: 1,
						letterSpacing: size * 0.04,
						textTransform: 'uppercase',
						color: '#ffffff',
						textShadow: '0 2px 12px rgba(0,0,0,0.6)',
					}}
				>
					{game.title}
				</div>
			) : null}
		</div>
	);
};
