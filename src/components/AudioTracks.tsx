import React from 'react';
import {Audio, interpolate, staticFile} from 'remotion';
import {config} from '../config';
import {VO} from '../timeline';
import {FPS} from '../theme';

/** Music gain with smooth ~8 dB ducking under each VO line. */
const musicGain = (f: number) => {
  const {musicVolume, duckGain} = config.audio;
  const t = f / FPS;
  let duck = 0;
  for (const l of VO) {
    const d = interpolate(t, [l.start - 0.25, l.start, l.end, l.end + 0.35], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    duck = Math.max(duck, d);
  }
  const fadeOut = interpolate(t, [48.6, 50], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return musicVolume * (1 - duck * (1 - duckGain)) * fadeOut;
};

/** Separate music / VO / SFX stems. Each is optional — set paths in src/config.ts. */
export const AudioTracks: React.FC = () => {
  const {music, voiceover, sfx} = config.audio;
  return (
    <>
      {music && <Audio src={staticFile(music)} volume={musicGain} name="Music" />}
      {voiceover && <Audio src={staticFile(voiceover)} volume={1} name="Voiceover" />}
      {sfx && <Audio src={staticFile(sfx)} volume={0.8} name="SFX" />}
    </>
  );
};
