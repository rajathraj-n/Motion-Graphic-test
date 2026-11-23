/*
 * main.js — preview player (scrub, play with score) and the hooks the
 * headless renderer (tools/render.mjs) calls.
 */
(function () {
  const FC = window.FC;
  const params = new URLSearchParams(location.search);
  const renderMode = params.has('render');
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');

  async function setup(scale) {
    canvas.width = Math.round(FC.W * scale);
    canvas.height = Math.round(FC.H * scale);
    await FC.init(scale);
  }

  if (renderMode) {
    document.body.classList.add('render');
    const scale = parseFloat(params.get('scale') || '2');
    FC.ready = setup(scale).then(() => true);
    FC.frameData = (t, type = 'image/jpeg', q = 0.95) => { FC.renderFrame(ctx, t); return canvas.toDataURL(type, q); };
    return;
  }

  // ---------------------------------------------------------------- player
  const $ = (id) => document.getElementById(id);
  const playBtn = $('play'), scrub = $('scrub'), timeEl = $('time'), status = $('status'), quality = $('quality');
  let t = 0, playing = false, audioCtx = null, scoreBuf = null, src = null, t0 = 0;
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(2).padStart(5, '0')}`;
  const draw = () => { FC.renderFrame(ctx, t); scrub.value = t; timeEl.textContent = fmt(t); };

  async function boot(scale) {
    status.textContent = 'Preparing paint…';
    playBtn.disabled = true;
    await new Promise((r) => setTimeout(r, 30));
    await setup(scale);
    draw();
    playBtn.disabled = false;
    status.textContent = '';
  }

  async function ensureAudio() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (!scoreBuf) { status.textContent = 'Rendering score…'; scoreBuf = await FC.renderScore(); status.textContent = ''; }
  }
  function stopAudio() { if (src) { try { src.stop(); } catch (e) {} src = null; } }

  async function play() {
    await ensureAudio();
    await audioCtx.resume();
    if (t >= FC.DURATION - 0.05) t = 0;
    stopAudio();
    src = audioCtx.createBufferSource(); src.buffer = scoreBuf; src.connect(audioCtx.destination);
    src.start(0, t);
    t0 = audioCtx.currentTime - t;
    playing = true; playBtn.textContent = '❚❚ Pause';
    requestAnimationFrame(tick);
  }
  function pause() { playing = false; stopAudio(); playBtn.textContent = '▶ Play'; }
  function tick() {
    if (!playing) return;
    t = Math.min(FC.DURATION, audioCtx.currentTime - t0);
    draw();
    if (t >= FC.DURATION) { pause(); return; }
    requestAnimationFrame(tick);
  }

  playBtn.onclick = () => (playing ? pause() : play());
  scrub.oninput = () => { if (playing) pause(); t = parseFloat(scrub.value); draw(); };
  quality.onchange = () => { pause(); boot(parseFloat(quality.value)); };
  $('still').onclick = () => { const a = document.createElement('a'); a.download = `freedom_${t.toFixed(2)}s.png`; a.href = canvas.toDataURL('image/png'); a.click(); };
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); playBtn.click(); }
    if (e.code === 'ArrowRight') { pause(); t = Math.min(30, t + 1 / 24); draw(); }
    if (e.code === 'ArrowLeft') { pause(); t = Math.max(0, t - 1 / 24); draw(); }
  });
  boot(parseFloat(quality.value));
})();
