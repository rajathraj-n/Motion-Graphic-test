import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Inter (SIL Open Font License) stands in for Motiva Sans, which is a licensed font.
// To use Motiva Sans, add the font file to public/fonts and point this at it.
const FAMILY = 'Inter';
export const font = `"${FAMILY}", "Motiva Sans", Arial, sans-serif`;

loadFont({
	family: FAMILY,
	url: staticFile('fonts/Inter-latin.woff2'),
	weight: '100 900',
});

export const C = {
	bg: '#171A21',
	ui: '#1B2838',
	panel: '#2A475E',
	blue: '#67C1F5',
	cta: '#1A9FFF',
	green: '#75B022',
	text: '#C7D5E0',
	white: '#FFFFFF',
	muted: '#8F98A0',
	discountBg: '#4C6B22',
	discountText: '#BEEE11',
};
