import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  AbsoluteFill, Audio, Sequence, cancelRender, continueRender, delayRender, getRemotionEnvironment,
  getStaticFiles, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';
import { FC, FilmId, loadEngine, sourceVersion } from './engines';

const FONTS: Record<FilmId, [string, string, FontFaceDescriptors][]> = {
  intimetec: ['400', '500', '600', '700'].map((w) => ['Poppins', `intimetec/assets/fonts/Poppins-${w}.woff2`, { weight: w }]),
  freedom: [
    ['Cinzel', 'freedom/assets/fonts/Cinzel-latin.woff2', { weight: '400 900' }],
    ['Cormorant Garamond', 'freedom/assets/fonts/CormorantGaramond-latin.woff2', { weight: '500' }],
    ['Cormorant Garamond', 'freedom/assets/fonts/CormorantGaramond-Italic-latin.woff2', { weight: '500', style: 'italic' }],
  ],
};

async function loadFonts(id: FilmId) {
  await Promise.all(FONTS[id].map(async ([family, file, desc]) => {
    const face = new FontFace(family, `url(${staticFile(file)})`, desc);
    await face.load();
    (document.fonts as unknown as { add: (f: FontFace) => void }).add(face);
  }));
}

export type FilmProps = {
  film: FilmId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  text: Record<string, any>;
  music: boolean;
  musicVolume: number;
  voiceoverVolume: number;
  musicFile: string;
  voOffsets: number[];
};

/** Renders one of the code-driven films frame by frame inside Remotion. */
export const EngineFilm: React.FC<FilmProps> = ({ film, text, music, musicVolume, voiceoverVolume, musicFile, voOffsets }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fcRef = useRef<FC>(null);
  const [ready, setReady] = useState(0);
  const [firstHandle] = useState(() => delayRender(`Preparing ${film}`, { timeoutInMilliseconds: 180000 }));
  const firstDone = useRef(false);
  const version = sourceVersion(film);

  useEffect(() => {
    let cancelled = false;
    const handle = delayRender(`Loading ${film}`, { timeoutInMilliseconds: 180000 });
    (async () => {
      await loadFonts(film);
      const fc = loadEngine(film);
      fc.ASSET_BASE = staticFile(film) + '/';
      // Render at full device resolution (e.g. --scale=2 → 4K); keep the Studio preview light.
      const dpr = getRemotionEnvironment().isRendering ? window.devicePixelRatio || 1 : 1;
      const scale = (width / 1920) * dpr;
      const canvas = canvasRef.current!;
      if (film === 'intimetec') {
        await fc.init(canvas, scale);
      } else {
        canvas.width = Math.round(1920 * scale);
        canvas.height = Math.round(1080 * scale);
        await fc.init(scale);
        fc.ctx2d = canvas.getContext('2d');
      }
      if (cancelled) return;
      fcRef.current = fc;
      setReady((r) => r + 1);
    })()
      .catch((e) => cancelRender(e))
      .finally(() => {
        continueRender(handle);
        if (!firstDone.current) { firstDone.current = true; continueRender(firstHandle); }
      });
    return () => { cancelled = true; };
  }, [film, width, version, firstHandle]);

  // Draw synchronously for every frame so the renderer always captures the right image.
  useLayoutEffect(() => {
    const fc = fcRef.current;
    if (!ready || !fc) return;
    fc.setText(text);
    const t = frame / fps;
    if (film === 'intimetec') fc.renderFrame(t);
    else fc.renderFrame(fc.ctx2d, t);
  }, [frame, fps, ready, text, film]);

  const voFiles = getStaticFiles()
    .filter((f) => f.name.startsWith(`voiceover/${film}/`) && /\/\d\d\.(mp3|wav|m4a)$/i.test(f.name))
    .map((f) => ({ src: f.src, index: parseInt(f.name.split('/').pop()!, 10) - 1 }))
    .filter((f) => f.index >= 0 && f.index < voOffsets.length);

  return (
    <AbsoluteFill style={{ backgroundColor: 'white' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      {music ? <Audio src={staticFile(musicFile)} volume={musicVolume} /> : null}
      {voFiles.map((v) => (
        <Sequence key={v.src} from={Math.round(voOffsets[v.index] * fps)} layout="none">
          <Audio src={v.src} volume={voiceoverVolume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
