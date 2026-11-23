#!/usr/bin/env node
/*
 * Headless renderer: draws every frame in Chromium (Playwright), pipes the
 * frames to ffmpeg, renders the score, and mixes in the voiceover if present.
 *
 *   node tools/render.mjs                 # 4K master  → out/freedom_4k.mp4
 *   node tools/render.mjs --hd            # 1080p      → out/freedom_1080p.mp4
 *   node tools/render.mjs --stills 2,6.5  # PNG stills → out/stills/
 *   node tools/render.mjs --hd --from 9 --to 14   # render a time range only
 *
 * Voiceover (optional): put ElevenLabs exports in audio/voiceover/ as
 * 01.mp3 … 06.mp3 (one per line, auto-placed at each scene), or a single
 * audio/voiceover.mp3 that is already timed to the 30-second cut.
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// CommonJS require so a globally installed Playwright (NODE_PATH) also resolves.
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };

const hd = flag('--hd');
const scale = hd ? 1 : 2;
const fps = parseInt(opt('--fps', '24'), 10);
const from = parseFloat(opt('--from', '0')), to = parseFloat(opt('--to', '30'));
const outDir = path.join(root, 'out');
fs.mkdirSync(outDir, { recursive: true });
const out = path.resolve(root, opt('--out', path.join('out', hd ? 'freedom_1080p.mp4' : 'freedom_4k.mp4')));
const stills = opt('--stills', null);

// Voiceover line placement (seconds) — one line per scene.
const VO_OFFSETS = [0.35, 4.45, 9.45, 14.45, 19.45, 24.4];

const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()); });
page.on('pageerror', (e) => console.error('[page error]', e.message));
const url = pathToFileURL(path.join(root, 'index.html')).href + `?render=1&scale=${scale}`;
await page.goto(url);
console.log(`Preparing paint layers at ${1920 * scale}×${1080 * scale}…`);
await page.evaluate(() => window.FC.ready);

async function frame(t, type) {
  const data = await page.evaluate(([tt, ty]) => window.FC.frameData(tt, ty, 0.95), [t, type]);
  return Buffer.from(data.slice(data.indexOf(',') + 1), 'base64');
}

if (stills) {
  const dir = path.resolve(root, opt('--dir', path.join('out', 'stills')));
  fs.mkdirSync(dir, { recursive: true });
  for (const s of stills.split(',').map(Number)) {
    const file = path.join(dir, `still_${s.toFixed(2).padStart(5, '0')}s.png`);
    fs.writeFileSync(file, await frame(s, 'image/png'));
    console.log('wrote', path.relative(root, file));
  }
  await browser.close();
  process.exit(0);
}

// ---- score ---------------------------------------------------------------
console.log('Rendering score…');
const wavPath = path.join(outDir, 'score.wav');
fs.writeFileSync(wavPath, Buffer.from(await page.evaluate(() => window.FC.renderScoreWavBase64()), 'base64'));

// ---- voiceover -----------------------------------------------------------
const voDir = path.join(root, 'audio', 'voiceover');
const voSingle = ['mp3', 'wav', 'm4a'].map((e) => path.join(root, 'audio', `voiceover.${e}`)).find(fs.existsSync);
let voLines = [];
if (fs.existsSync(voDir)) {
  voLines = fs.readdirSync(voDir).filter((f) => /^0[1-6]\.(mp3|wav|m4a)$/i.test(f)).sort()
    .map((f) => ({ file: path.join(voDir, f), at: VO_OFFSETS[parseInt(f, 10) - 1] }));
}

// ---- encode --------------------------------------------------------------
const inputs = ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-'];
inputs.push('-ss', String(from), '-t', String(to - from), '-i', wavPath);
let filter = null, amap = ['-map', '1:a'];
if (voLines.length || voSingle) {
  const vos = voLines.length ? voLines : [{ file: voSingle, at: 0 }];
  vos.forEach((v) => inputs.push('-i', v.file));
  const parts = vos.map((v, i) => { const ms = Math.max(0, Math.round((v.at - from) * 1000)); return `[${i + 2}:a]aresample=48000,adelay=${ms}|${ms},volume=1.6[v${i}]`; });
  const vlabels = vos.map((_, i) => `[v${i}]`).join('');
  filter = `${parts.join(';')};${vlabels}amix=inputs=${vos.length}:normalize=0[vo];[vo]asplit=2[vo1][vo2];` +
    `[1:a][vo1]sidechaincompress=threshold=0.05:ratio=4:attack=20:release=400[duck];[duck][vo2]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[aout]`;
  amap = ['-map', '[aout]'];
  console.log(`Mixing ${vos.length} voiceover file(s).`);
} else {
  console.log('No voiceover found in audio/ — exporting with music & SFX only.');
  filter = '[1:a]loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[aout]';
  amap = ['-map', '[aout]'];
}
const enc = [...inputs, ...(filter ? ['-filter_complex', filter] : []), '-map', '0:v', ...amap,
  '-c:v', 'libx264', '-preset', hd ? 'medium' : 'slow', '-crf', hd ? '18' : '16', '-pix_fmt', 'yuv420p',
  '-profile:v', 'high', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '256k', '-shortest', out];
const ff = spawn('ffmpeg', enc, { stdio: ['pipe', 'ignore', 'pipe'] });
let ffErr = '';
ff.stderr.on('data', (d) => { ffErr += d; if (ffErr.length > 20000) ffErr = ffErr.slice(-10000); });
const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg failed:\n' + ffErr.slice(-3000))))));

const n0 = Math.round(from * fps), n1 = Math.round(to * fps);
const start = Date.now();
for (let i = n0; i < n1; i++) {
  const buf = await frame(i / fps, 'image/jpeg');
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if ((i - n0) % 24 === 0) {
    const el = (Date.now() - start) / 1000, k = i - n0 + 1;
    process.stdout.write(`\rframe ${i + 1}/${n1}  ${(k / el).toFixed(2)} fps  eta ${Math.round(((n1 - i - 1) * el) / k)}s   `);
  }
}
ff.stdin.end();
await done;
await browser.close();
console.log(`\nDone → ${path.relative(root, out)}`);
