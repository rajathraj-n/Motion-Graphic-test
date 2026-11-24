import React, {useEffect, useMemo, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Player, PlayerRef} from '@remotion/player';
import {Video} from '../../src/Video';
import {DURATION, SCENES, VO} from '../../src/timeline';
import {FPS, H, W} from '../../src/theme';
import {Content, defaultContent} from '../../src/content';

const STORE = 'itt-promo-content-v1';

type SceneKey = 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7' | 's8';
const FIELDS: Record<SceneKey, [string, string][]> = {
  s1: [['left', 'Left word'], ['right', 'Right word (orange)']],
  s2: [['kicker', 'Label'], ['chip1', 'Chip 1'], ['chip2', 'Chip 2'], ['chip3', 'Chip 3']],
  s3: [['kicker', 'Label'], ['headline', 'Headline']],
  s4: [['kicker', 'Label'], ['line1', 'Headline line 1'], ['line2', 'Headline line 2 (orange)'], ['sub1', 'Supporting line 1'], ['sub2', 'Supporting line 2 (bold)']],
  s5: [['headline', 'Headline'], ['sub', 'Supporting line']],
  s6: [['kicker', 'Label'], ['headline', 'Headline']],
  s7: [['word1', 'Word 1'], ['word2', 'Word 2'], ['word3', 'Word 3 (orange)']],
  s8: [['tagline', 'Tagline'], ['cta', 'Call to action'], ['url', 'Website']],
};

const tc = (f: number) => {
  const s = Math.floor(f / FPS);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(f % FPS).padStart(2, '0')}`;
};

const load = (): Content => {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) {
      const saved = JSON.parse(raw);
      const merged: any = {...defaultContent};
      for (const k of Object.keys(defaultContent) as (keyof Content)[]) {
        const d: any = defaultContent[k];
        merged[k] = d && typeof d === 'object' && !Array.isArray(d) ? {...d, ...(saved[k] ?? {})} : saved[k] ?? d;
      }
      return merged;
    }
  } catch {
    /* storage unavailable — start from defaults */
  }
  return defaultContent;
};

const App: React.FC = () => {
  const ref = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(0);
  const [content, setContent] = useState<Content>(load);
  const [copied, setCopied] = useState<'' | 'ok' | 'manual'>('');

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(content));
    } catch {
      /* ignore — e.g. logo too large for storage */
    }
  }, [content]);

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

  const inputProps = useMemo(() => ({content}), [content]);
  const current = SCENES.findIndex((s) => frame >= s.start * FPS && frame < s.end * FPS);

  const seekScene = (i: number, play = false) => {
    const s = SCENES[i];
    // land just after the headline has animated in
    ref.current?.seekTo(Math.min(DURATION - 1, s.start * FPS + (play ? 0 : i === 7 ? 140 : 100)));
    if (play) ref.current?.play();
    else ref.current?.pause();
  };
  const step = (d: number) => {
    ref.current?.pause();
    ref.current?.seekTo(Math.max(0, Math.min(DURATION - 1, frame + d)));
  };
  const setField = (scene: SceneKey, key: string, value: string) =>
    setContent((c) => ({...c, [scene]: {...(c[scene] as any), [key]: value}}));

  const onLogo = (file?: File) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      setContent((c) => ({...c, s8: {...c.s8, logo: String(r.result)}}));
      seekScene(7);
    };
    r.readAsDataURL(file);
  };

  const exportText = useMemo(() => {
    const out = {...content, s8: {...content.s8, logo: null}};
    return `// Paste into src/content.ts, replacing the defaultContent object.\n// Logo: put the file in public/brand/ and set logoFile in src/config.ts.\nexport const defaultContent = ${JSON.stringify(out, null, 2)};\n`;
  }, [content]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied('ok');
    } catch {
      setCopied('manual');
    }
  };

  const changed = JSON.stringify(content) !== JSON.stringify(defaultContent);

  return (
    <div className="layout">
      <section className="left">
        <div className="stage">
          <Player
            ref={ref}
            component={Video}
            inputProps={inputProps}
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
          <div className="tc">
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
              <button id={`scene-${s.id}`} className={i === current ? 'on' : ''} onClick={() => seekScene(i, true)}>
                <span className="t">0:{String(s.start).padStart(2, '0')}</span>
                <span className="n">{s.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      <aside className="editor" aria-label="Edit video content">
        <div className="ed-head">
          <h2>Edit</h2>
          <div className="ed-actions">
            <button id="reset" disabled={!changed} onClick={() => setContent(defaultContent)}>Reset</button>
            <button id="copy" className="primary" onClick={copy}>{copied === 'ok' ? 'Copied' : 'Copy for code'}</button>
          </div>
        </div>
        <p className="hint">Changes play back instantly. Click a scene heading to jump to it. Your edits are kept in this browser.</p>
        {copied === 'manual' && (
          <textarea id="export" className="export" readOnly value={exportText} onFocus={(e) => e.currentTarget.select()} />
        )}

        {(Object.keys(FIELDS) as SceneKey[]).map((k, i) => (
          <fieldset key={k} className={i === current ? 'grp on' : 'grp'}>
            <legend>
              <button className="jump" onClick={() => seekScene(i)}>
                <span className="t">0:{String(SCENES[i].start).padStart(2, '0')}</span> {SCENES[i].title}
              </button>
            </legend>
            {FIELDS[k].map(([key, label]) => {
              const id = `f-${k}-${key}`;
              return (
                <label key={key} htmlFor={id}>
                  <span>{label}</span>
                  <input
                    id={id}
                    type="text"
                    value={(content[k] as any)[key]}
                    onFocus={() => current !== i && seekScene(i)}
                    onChange={(e) => setField(k, key, e.target.value)}
                  />
                </label>
              );
            })}
            {k === 's8' && (
              <div className="logo">
                <span>Logo</span>
                <div className="logo-row">
                  <label className="file" htmlFor="logo-file">
                    {content.s8.logo ? 'Replace logo' : 'Upload logo (SVG or PNG)'}
                    <input id="logo-file" type="file" accept="image/svg+xml,image/png,image/webp,image/jpeg" onChange={(e) => onLogo(e.target.files?.[0])} />
                  </label>
                  {content.s8.logo && (
                    <button id="logo-clear" onClick={() => setContent((c) => ({...c, s8: {...c.s8, logo: null}}))}>Remove</button>
                  )}
                </div>
                <small>Shown at its own proportions. For the final render, also put the file in public/brand/.</small>
              </div>
            )}
          </fieldset>
        ))}

        <fieldset className="grp">
          <legend>Voiceover captions</legend>
          <label className="check" htmlFor="captions">
            <input id="captions" type="checkbox" checked={content.showCaptions} onChange={(e) => setContent((c) => ({...c, showCaptions: e.target.checked}))} />
            <span>Show captions on the video</span>
          </label>
          {content.showCaptions &&
            VO.map((l, i) => (
              <label key={i} htmlFor={`vo-${i}`}>
                <span>
                  {l.start.toFixed(1)}–{l.end.toFixed(1)} s
                </span>
                <textarea
                  id={`vo-${i}`}
                  rows={2}
                  value={content.vo[i]}
                  onFocus={() => ref.current?.seekTo(Math.round((l.start + 0.5) * FPS))}
                  onChange={(e) => setContent((c) => ({...c, vo: c.vo.map((v, j) => (j === i ? e.target.value : v))}))}
                />
              </label>
            ))}
        </fieldset>
      </aside>
    </div>
  );
};

createRoot(document.getElementById('app')!).render(<App />);
