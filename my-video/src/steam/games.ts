// Fictional games used throughout the demo. Their key art is drawn in GameArt.tsx.
export type ArtKind =
	| 'space'
	| 'castle'
	| 'neon'
	| 'frost'
	| 'tactics'
	| 'crystal'
	| 'sky'
	| 'dunes'
	| 'ocean'
	| 'forest';

export type Game = {
	id: string;
	title: string;
	genre: string;
	tags: string[];
	art: ArtKind;
	price: number;
	discount?: number;
};

export const GAMES: Record<string, Game> = {
	starfall: {id: 'starfall', title: 'Starfall Odyssey', genre: 'Action', tags: ['Space', 'Open World', 'Sci-fi', 'Action'], art: 'space', price: 59.99, discount: 60},
	ember: {id: 'ember', title: 'Ember Crown', genre: 'RPG', tags: ['RPG', 'Fantasy'], art: 'castle', price: 39.99},
	neon: {id: 'neon', title: 'Neon Drift', genre: 'Racing', tags: ['Racing', 'Arcade'], art: 'neon', price: 24.99, discount: 40},
	frost: {id: 'frost', title: 'Frostbound', genre: 'Survival', tags: ['Survival', 'Co-op'], art: 'frost', price: 29.99},
	tactics: {id: 'tactics', title: 'Iron Tactics', genre: 'Strategy', tags: ['Strategy', 'Turn-based'], art: 'tactics', price: 34.99, discount: 25},
	hollow: {id: 'hollow', title: 'Hollow Depths', genre: 'Roguelike', tags: ['Roguelike', 'Dungeon'], art: 'crystal', price: 19.99},
	skyreach: {id: 'skyreach', title: 'Skyreach', genre: 'Adventure', tags: ['Adventure', 'Exploration'], art: 'sky', price: 44.99},
	dune: {id: 'dune', title: 'Dune Vanguard', genre: 'Action', tags: ['Action', 'Shooter'], art: 'dunes', price: 14.99, discount: 50},
	abyss: {id: 'abyss', title: 'Abyssal Tide', genre: 'Exploration', tags: ['Exploration', 'Underwater'], art: 'ocean', price: 29.99},
	wildgrove: {id: 'wildgrove', title: 'Wildgrove', genre: 'RPG', tags: ['RPG', 'Cozy'], art: 'forest', price: 24.99},
};

export const salePrice = (g: Game) => (g.discount ? g.price * (1 - g.discount / 100) : g.price);
export const fmt = (n: number) => `$${n.toFixed(2)}`;
