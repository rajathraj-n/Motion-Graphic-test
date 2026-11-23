import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {DURATION} from './timeline';
import {FPS, H, W} from './theme';

/**
 * Designed on a 1920×1080 grid and rendered at 3840×2160 with `--scale=2`
 * (true 2× device-pixel rendering: vector UI, text and SVG stay razor sharp at 4K).
 */
export const RemotionRoot: React.FC = () => (
  <Composition id="InTimeTecPromo" component={Video} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
);
