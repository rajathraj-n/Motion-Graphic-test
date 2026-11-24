import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Player, PlayerRef} from '@remotion/player';
import {Video} from '../../src/Video';
import {DURATION, SCENES} from '../../src/timeline';
import {FPS, H, W} from '../../src/theme';

const tc = (f: number) => {
  const s = Math.floor(f / FPS);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(f % FPS).padStart(2, '0')}`;
};

const App: React.FC = () => {
  const ref = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    const on = (e: {detail: {frame: number}}) => setFrame(e.detail.frame);
    p.addEventListener('frameupdate', on);
    p.addEventListener('seeked', on);
    return () => {
      p.removeEventListener('frameupdate', on);
      p.removeEventListener('seeked', on);
    };
  }, []);
  const current = SCENES.findIndex((s) => frame >= s.start * FPS && frame < s.end * FPS);
  const step = (d: number) => {
    ref.current?.pause();
    ref.current?.seekTo(Math.max(0, Math.min(DURATION - 1, frame + d)));
  };
  return (
    <>
      <div className="stage">
        <Player
          ref={ref}
          component={Video}
          durationInFrames={DURATION}
          fps={FPS}
          compositionWidth={W}
          compositionHeight={H}
          controls
          clickToPlay
          doubleClickToFullscreen
          allowFullscreen
          acknowledgeRemotionLicense
          style={{width: '100%', aspectRatio: '16 / 9', display: 'block'}}
        />
      </div>
      <div className="bar">
        <div className="tc" aria-live="off">
          <span>{tc(frame)}</span>
          <span className="dim">frame {frame} / {DURATION - 1}</span>
        </div>
        <div className="steps">
          <button id="back10" onClick={() => step(-10)} aria-label="Back 10 frames">−10</button>
          <button id="back1" onClick={() => step(-1)} aria-label="Back 1 frame">−1</button>
          <button id="fwd1" onClick={() => step(1)} aria-label="Forward 1 frame">+1</button>
          <button id="fwd10" onClick={() => step(10)} aria-label="Forward 10 frames">+10</button>
        </div>
      </div>
      <ol className="scenes">
        {SCENES.map((s, i) => (
          <li key={s.id}>
            <button
              id={`scene-${s.id}`}
              className={i === current ? 'on' : ''}
              onClick={() => {
                ref.current?.seekTo(s.start * FPS);
                ref.current?.play();
              }}
            >
              <span className="t">0:{String(s.start).padStart(2, '0')}</span>
              <span className="n">{s.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </>
  );
};

createRoot(document.getElementById('app')!).render(<App />);
