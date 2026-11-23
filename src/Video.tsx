import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Background} from './components/Stage';
import {SceneShell} from './components/UI';
import {AudioTracks} from './components/AudioTracks';
import {Captions} from './components/Captions';
import {OVERLAP, SCENES, SceneId} from './timeline';
import {FPS} from './theme';
import {Scene1Hook} from './scenes/Scene1Hook';
import {Scene2Challenge} from './scenes/Scene2Challenge';
import {Scene3Solution} from './scenes/Scene3Solution';
import {Scene4AI} from './scenes/Scene4AI';
import {Scene5Software} from './scenes/Scene5Software';
import {Scene6Automation} from './scenes/Scene6Automation';
import {Scene7Enterprise} from './scenes/Scene7Enterprise';
import {Scene8Outro} from './scenes/Scene8Outro';

const REGISTRY: Record<SceneId, React.FC> = {
  s1: Scene1Hook,
  s2: Scene2Challenge,
  s3: Scene3Solution,
  s4: Scene4AI,
  s5: Scene5Software,
  s6: Scene6Automation,
  s7: Scene7Enterprise,
  s8: Scene8Outro,
};

export const Video: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#111318'}}>
    <Background />
    {SCENES.map((s, i) => {
      const Comp = REGISTRY[s.id];
      const first = i === 0;
      const last = i === SCENES.length - 1;
      const from = s.start * FPS - (first ? 0 : OVERLAP);
      const to = s.end * FPS + (last ? 0 : OVERLAP);
      return (
        <Sequence key={s.id} from={from} durationInFrames={to - from} name={s.title}>
          <SceneShell dur={to - from} fadeIn={first ? 0 : OVERLAP * 2} fadeOut={last ? 0 : OVERLAP * 2}>
            <Comp />
          </SceneShell>
        </Sequence>
      );
    })}
    <Captions />
    <AudioTracks />
  </AbsoluteFill>
);
