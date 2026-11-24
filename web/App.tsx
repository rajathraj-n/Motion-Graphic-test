import "./boot";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Player, PlayerRef } from "@remotion/player";
import { BeyondPossibilities } from "../src/Video";
import { Copy, DEFAULT_COPY } from "../src/copy";
import { FPS, SCENES, STAGE_H, STAGE_W, TOTAL_FRAMES } from "../src/theme";

type Field = { key: keyof Copy; label: string; long?: boolean };
type Group = { scene: number; title: string; fields: Field[] };

const GROUPS: Group[] = [
  { scene: 0, title: "The curiosity hook", fields: [{ key: "hookHeadline", label: "Headline" }] },
  {
    scene: 1,
    title: "Meet ChatGPT",
    fields: [
      { key: "meetHeadline", label: "Headline" },
      { key: "meetSub", label: "Subline" },
      { key: "meetPrompt", label: "Typed prompt" },
      { key: "meetResponse", label: "Streamed reply", long: true },
    ],
  },
  { scene: 2, title: "Create effortlessly", fields: [{ key: "createHeadline", label: "Headline" }, { key: "createPrompt", label: "Typed prompt" }] },
  { scene: 3, title: "Think smarter", fields: [{ key: "thinkHeadline", label: "Headline" }, { key: "thinkPrompt", label: "Typed prompt" }] },
  { scene: 4, title: "Imagine visually", fields: [{ key: "imagineHeadline", label: "Headline" }, { key: "imaginePrompt", label: "Typed prompt" }] },
  { scene: 5, title: "One intelligent workspace", fields: [{ key: "workspaceWords", label: "Beat words (one per 2 beats, split by spaces)" }] },
  { scene: 6, title: "The emotional payoff", fields: [{ key: "payoffLine1", label: "First line" }, { key: "payoffLine2", label: "Second line" }] },
  {
    scene: 7,
    title: "Brand reveal and CTA",
    fields: [
      { key: "brandName", label: "Brand name" },
      { key: "brandTagline", label: "Tagline" },
      { key: "brandUrl", label: "Website" },
    ],
  },
];

const STORE_KEY = "beyond-possibilities-copy";
const tc = (frame: number) => {
  const s = Math.floor(frame / FPS);
  return `00:${String(s).padStart(2, "0")}`;
};

const loadDraft = (): Copy => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return { ...DEFAULT_COPY, ...JSON.parse(raw) };
  } catch {
    /* storage unavailable */
  }
  return DEFAULT_COPY;
};

const App: React.FC = () => {
  const player = useRef<PlayerRef>(null);
  const [copy, setCopy] = useState<Copy>(loadDraft);
  const [frame, setFrame] = useState(0);
  const [toast, setToast] = useState("");
  const jsonRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(copy));
    } catch {
      /* storage unavailable */
    }
  }, [copy]);

  useEffect(() => {
    const p = player.current;
    if (!p) return;
    const onFrame = (e: { detail: { frame: number } }) => setFrame(e.detail.frame);
    p.addEventListener("frameupdate", onFrame);
    return () => p.removeEventListener("frameupdate", onFrame);
  }, []);

  const inputProps = useMemo(() => ({ music: true, copy, scale: 1, musicFile: "audio/soundtrack.mp3" }), [copy]);
  const activeScene = SCENES.findIndex((s, i) => frame >= s.start && (i === SCENES.length - 1 || frame < SCENES[i + 1].start));
  const changed = (Object.keys(DEFAULT_COPY) as (keyof Copy)[]).filter((k) => copy[k] !== DEFAULT_COPY[k]).length;

  const seek = useCallback((scene: number) => {
    const s = SCENES[scene];
    // land just after the headline has built in
    const offsets = [150, 110, 220, 260, 120, 200, 70, 120];
    player.current?.seekTo(s.start + offsets[scene]);
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  };

  const json = JSON.stringify({ copy }, null, 2);
  const copyJson = () => {
    navigator.clipboard.writeText(json).then(
      () => flash("Copied. Paste it into Studio's props panel or send it to Claude."),
      () => {
        jsonRef.current?.select();
        flash("Copy blocked here. The text is selected, press Ctrl+C.");
      },
    );
  };

  return (
    <div className="shell">
      <header className="top">
        <div>
          <h1>Beyond Possibilities</h1>
          <p className="meta">40 s · 60 fps · 120 BPM · edit the text and the video updates as you type</p>
        </div>
        <div className="actions">
          <button type="button" className="btn ghost" onClick={() => setCopy(DEFAULT_COPY)} disabled={changed === 0}>
            Reset text
          </button>
          <button type="button" className="btn" onClick={copyJson}>
            Copy text as JSON
          </button>
        </div>
      </header>

      <main className="grid">
        <section className="stage">
          <div className="playerWrap">
            <Player
              ref={player}
              component={BeyondPossibilities}
              inputProps={inputProps}
              durationInFrames={TOTAL_FRAMES}
              fps={FPS}
              compositionWidth={STAGE_W}
              compositionHeight={STAGE_H}
              style={{ width: "100%", aspectRatio: "16 / 9" }}
              controls
              clickToPlay
              doubleClickToFullscreen
              allowFullscreen
              acknowledgeRemotionLicense
            />
          </div>
          <ol className="timeline" aria-label="Scenes">
            {SCENES.map((s, i) => (
              <li key={s.id} style={{ flexGrow: s.dur }}>
                <button type="button" className={i === activeScene ? "seg on" : "seg"} onClick={() => seek(i)} title={`Jump to ${GROUPS[i].title}`}>
                  <span className="segNum">{i + 1}</span>
                  <span className="segTc">{tc(s.start)}</span>
                </button>
              </li>
            ))}
          </ol>
          <p className="note">
            Click the video or press space to play with sound. This preview renders at 1080p in your browser; the 4K master comes from <code>npm run render</code>.
            The logo is a placeholder until the official file is added.
          </p>
        </section>

        <aside className="panel" aria-label="On-screen text">
          {GROUPS.map((g) => {
            const s = SCENES[g.scene];
            const end = s.start + s.dur;
            return (
              <fieldset key={g.scene} className={g.scene === activeScene ? "group on" : "group"}>
                <legend>
                  <button type="button" className="legendBtn" onClick={() => seek(g.scene)}>
                    <span className="tc">
                      {tc(s.start)}–{tc(end)}
                    </span>
                    <span className="gTitle">{g.title}</span>
                  </button>
                </legend>
                {g.fields.map((fd) => {
                  const id = `f-${fd.key}`;
                  const dirty = copy[fd.key] !== DEFAULT_COPY[fd.key];
                  return (
                    <label key={fd.key} htmlFor={id} className="field">
                      <span className="fLabel">
                        {fd.label}
                        {dirty && <span className="dot" aria-label="edited" />}
                      </span>
                      {fd.long ? (
                        <textarea id={id} rows={4} value={copy[fd.key]} onChange={(e) => setCopy({ ...copy, [fd.key]: e.target.value })} onFocus={() => seek(g.scene)} />
                      ) : (
                        <input id={id} type="text" value={copy[fd.key]} onChange={(e) => setCopy({ ...copy, [fd.key]: e.target.value })} onFocus={() => seek(g.scene)} />
                      )}
                    </label>
                  );
                })}
              </fieldset>
            );
          })}
          <label htmlFor="json" className="field">
            <span className="fLabel">Your text as JSON ({changed} {changed === 1 ? "line" : "lines"} edited)</span>
            <textarea id="json" ref={jsonRef} readOnly rows={6} value={json} className="mono" />
          </label>
        </aside>
      </main>
      <div className={toast ? "toast show" : "toast"} role="status">
        {toast}
      </div>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
