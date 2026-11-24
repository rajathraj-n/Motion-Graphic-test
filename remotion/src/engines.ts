/*
 * Loads each film's original engine files (the same ones the standalone
 * HTML players use) into an isolated sandbox, so both films can live in one
 * Remotion Studio without sharing globals.
 */
import ittEngine from '../../intimetec/src/engine.js?raw';
import ittUi from '../../intimetec/src/ui.js?raw';
import ittScenes from '../../intimetec/src/scenes.js?raw';
import fCore from '../../src/core.js?raw';
import fFigures from '../../src/figures.js?raw';
import fScenes from '../../src/scenes.js?raw';

export type FilmId = 'intimetec' | 'freedom';

const SOURCES: Record<FilmId, string[]> = {
  intimetec: [ittEngine, ittUi, ittScenes],
  freedom: [fCore, fFigures, fScenes],
};

/** Changes whenever an engine file is edited (used to re-initialise on hot reload). */
export const sourceVersion = (id: FilmId) => SOURCES[id].reduce((h, s) => (h * 31 + s.length) | 0, 7);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FC = any;

export function loadEngine(id: FilmId): FC {
  const sandbox: { FC?: FC } = {};
  for (const code of SOURCES[id]) {
    // Each file is an IIFE that only touches `window.FC`.
    new Function('window', code)(sandbox);
  }
  return sandbox.FC;
}

/** Default on-screen copy, read straight from the engine. */
export const defaultText = (id: FilmId) => loadEngine(id).DEFAULT_TEXT;
