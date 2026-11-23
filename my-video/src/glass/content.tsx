import React from 'react';
import {GameArt} from '../steam/GameArt';
import type {Game} from '../steam/games';
import {C, font} from '../steam/theme';
import {Logo} from '../steam/ui';

/** Compact Steam-style top bar for use inside glass panels. */
export const MiniNav: React.FC<{readonly active: string; readonly logoSrc?: string; readonly items?: string[]}> = ({
	active,
	logoSrc,
	items = ['STORE', 'LIBRARY', 'COMMUNITY'],
}) => (
	<div
		style={{
			height: 56,
			display: 'flex',
			alignItems: 'center',
			gap: 34,
			padding: '0 26px',
			background: 'rgba(23,26,33,0.78)',
			borderBottom: '1px solid rgba(103,193,245,0.15)',
			fontFamily: font,
			fontWeight: 700,
			fontSize: 17,
			letterSpacing: 1.4,
			color: C.text,
		}}
	>
		<Logo size={20} src={logoSrc} />
		{items.map((it) => (
			<span key={it} style={{color: it === active ? C.blue : C.text}}>
				{it}
			</span>
		))}
		<div style={{flex: 1}} />
		<div style={{width: 200, height: 30, borderRadius: 15, background: 'rgba(103,193,245,0.12)', border: '1px solid rgba(103,193,245,0.2)'}} />
	</div>
);

export const Label: React.FC<{readonly children: React.ReactNode; readonly style?: React.CSSProperties}> = ({children, style}) => (
	<div style={{fontFamily: font, fontSize: 15, fontWeight: 700, letterSpacing: 2.4, color: C.muted, ...style}}>{children}</div>
);

export const Tag: React.FC<{readonly children: React.ReactNode}> = ({children}) => (
	<div style={{fontFamily: font, fontSize: 15, background: 'rgba(103,193,245,0.15)', color: C.blue, padding: '4px 10px', borderRadius: 4}}>{children}</div>
);

/** Game art card with a glowing outline when `active`. */
export const ArtCard: React.FC<{
	readonly game: Game;
	readonly t: number;
	readonly w: number;
	readonly h: number;
	readonly active?: number;
	readonly lift?: number;
	readonly titleSize?: number;
	readonly dim?: number;
	readonly style?: React.CSSProperties;
}> = ({game, t, w, h, active = 0, lift = 0, titleSize, dim = 0, style}) => (
	<div
		style={{
			position: 'relative',
			width: w,
			height: h,
			borderRadius: 10,
			scale: String(1 + lift * 0.05),
			translate: `0px ${-lift * 8}px`,
			boxShadow: `0 ${10 + lift * 18}px ${24 + lift * 30}px rgba(0,0,0,0.5), 0 0 ${active * 26}px rgba(103,193,245,${active * 0.7})`,
			outline: active > 0.01 ? `${1 + active * 1.5}px solid rgba(103,193,245,${0.4 + active * 0.6})` : 'none',
			opacity: 1 - dim * 0.55,
			...style,
		}}
	>
		<GameArt game={game} t={t} width={w} height={h} radius={10} titleSize={titleSize} />
	</div>
);
