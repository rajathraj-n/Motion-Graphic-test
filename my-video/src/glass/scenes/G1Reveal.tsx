import React from 'react';
import {AbsoluteFill, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {GAMES, fmt, salePrice} from '../../steam/games';
import {C, font} from '../../steam/theme';
import {ease, easeIO, easeOutro, Headline, lerp, PriceBlock, Subtitle} from '../../steam/ui';
import {ArtCard, Label, MiniNav, Tag} from '../content';
import {Beam, GlassPanel, ScreenSweep} from '../Glass';
import {dof, Environment, place, Stage} from '../stage';
import type {GlassSceneProps} from './types';

const HERO = {w: 1000, h: 580};
// Featured card position inside the hero panel (panel-local, from its centre).
export const FEATURED_LOCAL = {x: -130, y: 10};

export const G1Reveal: React.FC<GlassSceneProps> = ({subtitles, logoSrc}) => {
	const frame = useCurrentFrame();
	const g = GAMES.starfall;

	const beam = ease(frame, 0, 22);
	const emerge = (d: number) => ease(frame, 8 + d, 30);
	const turn = easeIO(frame, 28, 32);
	const forward = easeIO(frame, 60, 34);
	const separate = ease(frame, 64, 26);
	const highlight = ease(frame, 70, 18);
	const push = easeOutro(frame, 94, 26);

	// Camera: slow dolly-in with a slight right-to-left orbit, then a push through the featured card.
	const cam = {
		x: lerp(0, -320 + FEATURED_LOCAL.x, push),
		y: lerp(0, FEATURED_LOCAL.y, push),
		z: lerp(0, 140, easeIO(frame, 0, 110)) + push * 1500,
		rx: 0,
		ry: lerp(5, -3, easeIO(frame, 0, 110)),
	};

	const heroP = {
		x: -320,
		y: -10,
		z: lerp(-700, -80, emerge(0)) + forward * 70,
		w: HERO.w,
		h: HERO.h,
		ry: lerp(38, 7, turn),
		rx: lerp(6, 0, turn),
	};
	const back1 = {x: 560, y: -250, z: -520, w: 460, h: 270, ry: -12};
	const back2 = {x: 520, y: 270, z: -680, w: 420, h: 250, ry: -12};

	return (
		<AbsoluteFill>
			<Environment haze={emerge(0)} hazeX={38} />
			<Stage>
				<GlassPanel style={place({...back2, z: lerp(-1200, back2.z, emerge(10))}, cam)} opacity={emerge(10) * 0.85 * (1 - push)} blur={dof(back2.z, heroP.z)} padding={14} glow={0.25} sweep={(frame - 20) / 40}>
					<ArtCard game={GAMES.frost} t={frame} w={back2.w - 28} h={back2.h - 28} titleSize={30} />
				</GlassPanel>
				<GlassPanel style={place({...back1, z: lerp(-1100, back1.z, emerge(6))}, cam)} opacity={emerge(6) * 0.9 * (1 - push)} blur={dof(back1.z, heroP.z)} padding={14} glow={0.25} sweep={(frame - 14) / 40}>
					<ArtCard game={GAMES.neon} t={frame} w={back1.w - 28} h={back1.h - 28} titleSize={32} />
				</GlassPanel>

				{/* Hero Store panel */}
				<GlassPanel style={place(heroP, cam)} opacity={emerge(0)} glow={0.35 + highlight * 0.35} sweep={(frame - 12) / 46} padding={0}>
					<div style={{opacity: ease(frame, 34, 20)}}>
						<MiniNav active="STORE" logoSrc={logoSrc} />
						<div style={{position: 'absolute', left: 30, top: 70}}>
							<Label>FEATURED &amp; RECOMMENDED</Label>
						</div>
						<div style={{position: 'absolute', left: 30, top: 108, display: 'flex', gap: 22}}>
							<ArtCard game={g} t={frame} w={600} h={290} active={highlight} lift={separate} titleSize={40} />
							<div style={{width: 300, display: 'flex', flexDirection: 'column', gap: 14, fontFamily: font, color: C.text, translate: `${separate * 6}px 0px`}}>
								<div style={{fontSize: 28, fontWeight: 700, color: C.white}}>{g.title}</div>
								<div style={{fontSize: 17, color: C.muted, lineHeight: 1.45}}>Chart a course through a living galaxy and uncover the secret of the stars.</div>
								<div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
									{g.tags.slice(0, 3).map((tg) => (
										<Tag key={tg}>{tg}</Tag>
									))}
								</div>
								<div style={{flex: 1}} />
								<PriceBlock discount={g.discount} price={fmt(g.price)} sale={fmt(salePrice(g))} />
							</div>
						</div>
						<div style={{position: 'absolute', left: 30, top: 426, display: 'flex', gap: 16}}>
							{[GAMES.ember, GAMES.tactics, GAMES.skyreach, GAMES.dune].map((gm, i) => (
								<ArtCard key={gm.id} game={gm} t={frame} w={222} h={124} lift={separate * (0.4 + i * 0.1)} titleSize={17} dim={highlight * 0.35} />
							))}
						</div>
					</div>
				</GlassPanel>
			</Stage>

			<Beam progress={beam} opacity={interpolate(frame, [20, 36], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
			<ScreenSweep progress={interpolate(frame, [72, 104], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />

			{/* Headline beside the panel */}
			<div style={{position: 'absolute', left: 1270, top: 340, width: 580}}>
				<Interactive.Div name="Glass hook headline">
					<Headline text="YOUR NEXT ADVENTURE STARTS HERE" start={56} size={80} accentWords={['ADVENTURE']} exitAt={102} />
				</Interactive.Div>
			</div>

			{/* Flash of the featured art as the camera passes through the card */}
			<AbsoluteFill style={{background: C.bg, opacity: interpolate(frame, [112, 120], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />

			{subtitles ? (
				<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 48}}>
					<Interactive.Div name="Glass subtitle 1">
						<Subtitle text="Every great game starts with discovery." start={6} end={104} />
					</Interactive.Div>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};
