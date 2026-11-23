import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Baloo 2 (SIL Open Font License) is bundled in public/fonts so renders work offline.
// It is a variable font, so one file covers every weight we use.
const FAMILY = 'Baloo 2';
// Quoted, because an unquoted family name ending in a number is invalid CSS.
export const fontFamily = `"${FAMILY}", "Arial Rounded MT Bold", sans-serif`;

loadFont({
	family: FAMILY,
	url: staticFile('fonts/Baloo2-latin.woff2'),
	weight: '400 800',
});

export const INK = '#2b1a12';
