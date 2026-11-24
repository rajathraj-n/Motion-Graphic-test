import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {config} from '../config';
import {useContent} from '../content';
import {VO} from '../timeline';
import {FONT, FPS, tween} from '../theme';

/** Optional burned-in VO subtitles (config.showCaptions). */
export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const content = useContent();
  if (!config.showCaptions && !content.showCaptions) return null;
  const t = f / FPS;
  const idx = VO.findIndex((l) => t >= l.start && t <= l.end + 0.2);
  if (idx < 0) return null;
  const line = VO[idx];
  const text = content.vo[idx] ?? line.text;
  const o = Math.min(tween(t, [line.start, line.start + 0.2], [0, 1]), tween(t, [line.end, line.end + 0.2], [1, 0]));
  const onWhite = t > 45.5;
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 46}}>
      <div
        style={{
          opacity: o,
          fontFamily: FONT,
          fontSize: 26,
          fontWeight: 500,
          color: onWhite ? '#111318' : '#fff',
          background: onWhite ? 'rgba(17,19,24,0.06)' : 'rgba(17,19,24,0.6)',
          padding: '10px 22px',
          borderRadius: 10,
          maxWidth: 1400,
          textAlign: 'center',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
