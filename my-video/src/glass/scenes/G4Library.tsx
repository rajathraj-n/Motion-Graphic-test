import React from 'react';
import {AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {GameArt} from '../../steam/GameArt';
import {GAMES} from '../../steam/games';
import {C, font} from '../../steam/theme';
import {Cursor, ease, easeIO, easeOutro, Headline, lerp, Subtitle} from '../../steam/ui';
import {ArtCard, Label, MiniNav} from '../content';
import {GlassPanel} from '../Glass';
import {dof, Environment, place, project, Stage} from '../stage';
import {LIB_COVER} from './G3Wishlist';
import type {GlassSceneProps} from './types';

const DASH = {x: -70, y: -50, w: 1340, h: 600};
const GRID = [GAMES.ember, GAMES.starfall, GAMES.frost, GAMES.neon, GAMES.hollow, GAMES.skyreach, GAMES.abyss, GAMES.wildgrove];
const SEL = 1;
const COVER = {w: 150, h: 225, gap: 18};
const GRID_X = 270;
const GRID_Y = 96;
// Selected game panel (pops forward from the dashboard)
const DETAIL = {x: 450, y: -40, z: 110, w: 440, h: 540};
const PLAY_LOCAL = {x: 30, y: 430, w: 380, h: 78};

export const G4Library: React.FC<GlassSceneProps> = ({subtitles, logoSrc}) => {
	const frame = useCurrentFrame();
	const g = GAMES.starfall;

	const glide = easeIO(frame, 0, 26);
	const grid = (i: number) => ease(frame, 18 + i * 2.5, 16);
	const highlight = ease(frame, 34, 14);
	const detail = ease(frame, 50, 18);
	const playSweep = interpolate(frame, [66, 84], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const separate = easeIO(frame, 94, 26);
	const travel = easeOutro(frame, 96, 24);

	// Diagonal dolly-in with a controlled orbit, then travel between the separated layers.
	const cam = {
		x: lerp(-60, 0, glide),
		y: lerp(-30, 0, glide),
		z: lerp(-120, 40, easeIO(frame, 0, 90)) + travel * 1500,
		rx: lerp(-3, 0, glide),
		ry: lerp(-8, -2, glide),
	};

	const dash = {...DASH, z: lerp(-500, 0, glide), ry: lerp(16, 6, glide)};
	const layerZ = (n: number) => separate * n;

	// Flying cover from G3 lands here, then hands over to the grid.
	const selLocal = {x: GRID_X + (SEL % 4) * (COVER.w + COVER.gap), y: GRID_Y + Math.floor(SEL / 4) * (COVER.h + COVER.gap)};
	const handoff = 1 - ease(frame, 4, 14);

	const playWorld = {x: DETAIL.x - DETAIL.w / 2 + PLAY_LOCAL.x + PLAY_LOCAL.w / 2, y: DETAIL.y - DETAIL.h / 2 + PLAY_LOCAL.y + PLAY_LOCAL.h / 2};
	const playScreen = project(playWorld.x, playWorld.y, DETAIL.z, cam);
	const cur = ease(frame, 70, 16);
	const curX = lerp(1560, playScreen.x + 30, cur);
	const curY = lerp(1000, playScreen.y, cur);
	const press = interpolate(frame, [87, 90, 93], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const ring = interpolate(frame, [90, 116], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1)});
	const fade = 1 - interpolate(frame, [108, 120], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	// Cursor position in detail-panel coordinates, for the glass highlight that follows it.
	const dtl = project(DETAIL.x - DETAIL.w / 2, DETAIL.y - DETAIL.h / 2, DETAIL.z, cam);
	const hl = {x: (curX - dtl.x) / dtl.k, y: (curY - dtl.y) / dtl.k};

	return (
		<AbsoluteFill>
			<Environment hazeX={45} />
			<Stage>
				{/* Two smaller panels at the rear */}
				<GlassPanel style={place({x: -780, y: -250, z: -480 + layerZ(-200), w: 380, h: 240, ry: 14}, cam)} opacity={ease(frame, 10, 20) * fade} blur={dof(-480, 0)} padding={12} glow={0.2}>
					<ArtCard game={GAMES.skyreach} t={frame} w={356} h={216} titleSize={24} />
				</GlassPanel>
				<GlassPanel style={place({x: 800, y: 250, z: -520 + layerZ(-200), w: 360, h: 210, ry: -14}, cam)} opacity={ease(frame, 14, 20) * fade} blur={dof(-520, 0)} padding={22} glow={0.2}>
					<div style={{fontFamily: font, color: C.text}}>
						<Label>ACHIEVEMENTS</Label>
						<div style={{fontSize: 26, fontWeight: 700, color: C.white, marginTop: 10}}>27 / 40 unlocked</div>
						<div style={{height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)', marginTop: 16}}>
							<div style={{width: '67%', height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${C.cta}, ${C.blue})`}} />
						</div>
					</div>
				</GlassPanel>

				{/* Main library dashboard (splits into depth layers at the end) */}
				<GlassPanel style={place({...dash, z: dash.z + layerZ(-120)}, cam)} glow={0.35} sweep={(frame - 20) / 40} opacity={fade}>
					<MiniNav active="LIBRARY" logoSrc={logoSrc} />
					<div style={{position: 'absolute', left: 0, top: 56, bottom: 0, width: 230, background: 'rgba(23,29,37,0.55)', padding: '18px 16px', fontFamily: font, fontSize: 17, color: C.text, display: 'flex', flexDirection: 'column', gap: 9}}>
						<Label style={{fontSize: 13}}>ALL GAMES (10)</Label>
						{Object.values(GAMES).map((gm) => (
							<div key={gm.id} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '3px 6px', borderRadius: 6, background: gm.id === g.id ? `rgba(103,193,245,${0.22 * highlight})` : 'transparent', color: gm.id === g.id && highlight > 0.5 ? C.white : C.text}}>
								<GameArt game={gm} t={frame} width={24} height={24} showTitle={false} radius={4} />
								{gm.title}
							</div>
						))}
					</div>
					<div style={{position: 'absolute', left: GRID_X, top: 70}}>
						<Label>RECENT GAMES</Label>
					</div>
				</GlassPanel>

				{/* Grid layer, sits slightly above the dashboard face */}
				{GRID.map((gm, i) => {
					const isSel = i === SEL;
					const p = grid(i);
					const lx = GRID_X + (i % 4) * (COVER.w + COVER.gap) + COVER.w / 2 - DASH.w / 2;
					const ly = GRID_Y + Math.floor(i / 4) * (COVER.h + COVER.gap) + COVER.h / 2 - DASH.h / 2;
					return (
						<div
							key={gm.id}
							style={{
								...place(
									{
										x: DASH.x + lx * Math.cos((dash.ry * Math.PI) / 180),
										y: DASH.y + ly + (1 - p) * 40,
										z: dash.z - lx * Math.sin((dash.ry * Math.PI) / 180) + 6 + (isSel ? highlight * 60 : 0) + layerZ(isSel ? 160 : 60),
										w: COVER.w,
										h: COVER.h,
										ry: dash.ry,
									},
									cam,
								),
								opacity: (isSel ? Math.max(p, 1 - handoff) : p) * (isSel ? 1 : 1 - highlight * 0.5) * fade,
							}}
						>
							<ArtCard game={gm} t={frame} w={COVER.w} h={COVER.h} titleSize={17} active={isSel ? highlight : 0} />
						</div>
					);
				})}

				{/* Selected game panel expands forward */}
				<GlassPanel
					style={place({...DETAIL, z: DETAIL.z + layerZ(260), s: lerp(0.35, 1, detail), x: lerp(DASH.x + selLocal.x - DASH.w / 2 + COVER.w / 2, DETAIL.x, detail)}, cam)}
					opacity={detail * fade}
					glow={0.4 + (frame > 84 ? 0.3 : 0)}
					padding={30}
					sweep={(frame - 54) / 28}
				>
					<GameArt game={g} t={frame} width={DETAIL.w - 60} height={230} radius={12} titleSize={30} />
					<div style={{fontFamily: font, color: C.text, marginTop: 18}}>
						<div style={{fontSize: 30, fontWeight: 800, color: C.white}}>{g.title}</div>
						<div style={{fontSize: 17, color: C.muted, marginTop: 6}}>Ready to play · 12.6 GB</div>
						<div style={{height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', marginTop: 18}}>
							<div style={{width: `${interpolate(frame, [52, 72], [62, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}%`, height: '100%', borderRadius: 4, background: frame > 72 ? C.green : C.blue}} />
						</div>
					</div>
					{/* PLAY button with restrained light sweep */}
					<div
						style={{
							position: 'absolute',
							left: PLAY_LOCAL.x,
							top: PLAY_LOCAL.y,
							width: PLAY_LOCAL.w,
							height: PLAY_LOCAL.h,
							borderRadius: 14,
							overflow: 'hidden',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 14,
							background: `linear-gradient(180deg, #86c530, ${C.green} 50%, #5c9a1a)`,
							boxShadow: `0 0 ${18 + (frame > 84 ? 16 : 0)}px rgba(117,176,34,0.55), inset 0 1px 0 rgba(255,255,255,0.35)`,
							fontFamily: font,
							fontSize: 30,
							fontWeight: 800,
							letterSpacing: 3,
							color: C.white,
							scale: String(1 - press * 0.04),
						}}
					>
						<svg width={22} height={24} viewBox="0 0 22 24">
							<path d="M2 1 L21 12 L2 23 Z" fill="#ffffff" />
						</svg>
						PLAY
						<div style={{position: 'absolute', top: 0, bottom: 0, width: 90, left: -120 + playSweep * 560, rotate: '18deg', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'}} />
					</div>
					{/* Translucent glass highlight following the cursor */}
					{frame > 72 ? (
						<div style={{position: 'absolute', left: hl.x - 90, top: hl.y - 90, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,235,255,0.22) 0%, rgba(200,235,255,0) 70%)', pointerEvents: 'none'}} />
					) : null}
				</GlassPanel>
			</Stage>

			{/* Flying cover from the previous scene */}
			{handoff > 0.01 ? (
				<div style={{position: 'absolute', left: LIB_COVER.x, top: LIB_COVER.y, opacity: handoff, borderRadius: 10, boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
					<GameArt game={g} t={frame} width={LIB_COVER.w} height={LIB_COVER.h} radius={10} titleSize={20} />
				</div>
			) : null}

			{/* Luminous ring from the PLAY click */}
			{ring > 0 && ring < 1 ? (
				<div
					style={{
						position: 'absolute',
						left: playScreen.x - 1200,
						top: playScreen.y - 1200,
						width: 2400,
						height: 2400,
						borderRadius: '50%',
						border: `${6 - ring * 4}px solid rgba(160,215,255,${1 - ring})`,
						boxShadow: `0 0 40px rgba(103,193,245,${0.8 * (1 - ring)}), inset 0 0 40px rgba(103,193,245,${0.5 * (1 - ring)})`,
						scale: String(0.04 + ring),
					}}
				/>
			) : null}

			<div style={{position: 'absolute', left: 160, top: 828, opacity: fade}}>
				<Interactive.Div name="Glass library headline">
					<Headline text="ALL YOUR GAMES. ONE PLACE." start={34} size={92} accentWords={['ONE', 'PLACE.']} exitAt={96} />
				</Interactive.Div>
			</div>

			<Cursor x={curX} y={curY} press={press} opacity={interpolate(frame, [70, 76, 96, 102], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />

			{subtitles ? (
				<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 48}}>
					<Interactive.Div name="Glass subtitle 4">
						<Subtitle text="Your entire gaming library. One place." start={6} end={100} />
					</Interactive.Div>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};
