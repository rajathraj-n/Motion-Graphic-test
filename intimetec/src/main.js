/*
 * main.js — preview player and the hooks used by tools/render.mjs.
 */
(function () {
  const FC = window.FC;
  const params = new URLSearchParams(location.search);
  const canvas = document.getElementById('stage');

  if (params.has('render')) {
    document.body.classList.add('render');
    FC.ready = FC.init(canvas, parseFloat(params.get('scale') || '2')).then(() => true);
    FC.frameData = (t, type = 'image/jpeg', q = 0.95) => { FC.renderFrame(t); return canvas.toDataURL(type, q); };
    return;
  }

  const $ = (id) => document.getElementById(id);
  const playBtn = $('play'), scrub = $('scrub'), timeEl = $('time'), status = $('status'), quality = $('quality');
  let t = 0, playing = false, audioCtx = null, scoreBuf = null, src = null, t0 = 0;
  scrub.max = FC.DURATION;
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(2).padStart(5, '0')}`;
  const draw = () => { FC.renderFrame(t); scrub.value = t; timeEl.textContent = fmt(t); };

  async function boot(scale) {
    status.textContent = 'Loading…'; playBtn.disabled = true;
    await FC.init(canvas, scale);
    draw(); playBtn.disabled = false; status.textContent = '';
  }
  async function play() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (!scoreBuf) { status.textContent = 'Rendering music…'; scoreBuf = await FC.renderScore(); status.textContent = ''; }
    await audioCtx.resume();
    if (t >= FC.DURATION - 0.05) t = 0;
    if (src) try { src.stop(); } catch (e) {}
    src = audioCtx.createBufferSource(); src.buffer = scoreBuf; src.connect(audioCtx.destination); src.start(0, t);
    t0 = audioCtx.currentTime - t; playing = true; playBtn.textContent = '❚❚ Pause';
    requestAnimationFrame(tick);
  }
  function pause() { playing = false; if (src) try { src.stop(); } catch (e) {} src = null; playBtn.textContent = '▶ Play'; }
  function tick() {
    if (!playing) return;
    t = Math.min(FC.DURATION, audioCtx.currentTime - t0);
    draw();
    if (t >= FC.DURATION) return pause();
    requestAnimationFrame(tick);
  }
  playBtn.onclick = () => (playing ? pause() : play());
  scrub.oninput = () => { if (playing) pause(); t = parseFloat(scrub.value); draw(); };
  quality.onchange = () => { pause(); boot(parseFloat(quality.value)); };
  $('still').onclick = () => { const a = document.createElement('a'); a.download = `intimetec_${t.toFixed(2)}s.png`; a.href = canvas.toDataURL('image/png'); a.click(); };
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); playBtn.click(); }
    if (e.code === 'ArrowRight') { pause(); t = Math.min(FC.DURATION, t + 1 / 30); draw(); }
    if (e.code === 'ArrowLeft') { pause(); t = Math.max(0, t - 1 / 30); draw(); }
  });
  boot(parseFloat(quality.value));
})();
