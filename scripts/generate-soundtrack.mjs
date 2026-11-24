// Procedural 40-second, 120 BPM cinematic tech-house soundtrack + synced SFX.
// Writes public/audio/soundtrack.wav (44.1 kHz, 16-bit stereo).
//
// This is a fully original, synthesized placeholder score so the edit has a beat grid
// to lock to. Swap it for a licensed/produced track with the same structure later
// (see the music prompt in README.md) — scene timings are on the same 120 BPM grid.
//
// Run: npm run music

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const DUR = 40;
const N = SR * DUR;
const BPM = 120;
const BEAT = 60 / BPM; // 0.5 s
const BAR = BEAT * 4; // 2 s

const L = new Float32Array(N);
const R = new Float32Array(N);
const VL = new Float32Array(N); // reverb send
const VR = new Float32Array(N);
const DUCK = new Float32Array(N).fill(1); // sidechain gain from kicks

// deterministic noise
let seed = 1234567;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noise = () => rnd() * 2 - 1;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const idx = (t) => Math.floor(t * SR);

function add(i, l, r, send = 0) {
  if (i < 0 || i >= N) return;
  L[i] += l;
  R[i] += r;
  if (send) {
    VL[i] += l * send;
    VR[i] += r * send;
  }
}
const pan = (x, p) => [x * Math.cos(((p + 1) * Math.PI) / 4), x * Math.sin(((p + 1) * Math.PI) / 4)];

// ---------- instruments ----------
function kick(t0, g = 1) {
  const len = 0.45;
  let ph = 0;
  for (let k = 0; k < len * SR; k++) {
    const t = k / SR;
    const f = 45 + 110 * Math.exp(-t * 28);
    ph += (2 * Math.PI * f) / SR;
    const env = Math.exp(-t * 7);
    const click = k < 90 ? noise() * 0.3 * (1 - k / 90) : 0;
    const s = (Math.sin(ph) * env + click) * g;
    add(idx(t0) + k, s, s);
  }
  // sidechain envelope
  for (let k = 0; k < 0.3 * SR; k++) {
    const i = idx(t0) + k;
    if (i < N) DUCK[i] = Math.min(DUCK[i], 1 - 0.75 * g * Math.exp(-(k / SR) * 12));
  }
}
function hat(t0, g = 0.12, decay = 45, p = 0.3) {
  let prev = 0;
  for (let k = 0; k < 0.08 * SR; k++) {
    const n = noise();
    const hp = n - prev;
    prev = n;
    const s = hp * Math.exp(-(k / SR) * decay) * g;
    const [l, r] = pan(s, p);
    add(idx(t0) + k, l, r, 0.1);
  }
}
function clap(t0, g = 0.35) {
  let lp = 0;
  for (let k = 0; k < 0.25 * SR; k++) {
    const t = k / SR;
    const burst = t < 0.03 ? Math.exp(-((t % 0.01) * 300)) : Math.exp(-(t - 0.03) * 18);
    const n = noise();
    lp += 0.35 * (n - lp);
    const s = (n - lp) * burst * g;
    add(idx(t0) + k, s, s, 0.35);
  }
}
function bass(t0, midi, dur, g = 0.32) {
  const f = mtof(midi);
  let ph = 0,
    lp = 0;
  for (let k = 0; k < dur * SR; k++) {
    const t = k / SR;
    ph += f / SR;
    const saw = 2 * (ph % 1) - 1;
    const sub = Math.sin(2 * Math.PI * ph);
    const cutoff = 0.04 + 0.1 * Math.exp(-t * 10);
    lp += cutoff * (saw - lp);
    const env = Math.min(1, t * 200) * Math.min(1, (dur - t) * 40);
    const s = (lp * 0.7 + sub * 0.6) * env * g;
    const i = idx(t0) + k;
    add(i, s * (DUCK[i] ?? 1), s * (DUCK[i] ?? 1));
  }
}
function pluck(t0, midi, g = 0.12, p = 0) {
  const f = mtof(midi);
  let ph = 0,
    lp = 0;
  const len = 0.32;
  for (let k = 0; k < len * SR; k++) {
    const t = k / SR;
    ph += f / SR;
    const sq = (ph % 1) < 0.5 ? 1 : -1;
    const saw = 2 * (ph % 1) - 1;
    const cutoff = 0.05 + 0.4 * Math.exp(-t * 22);
    lp += cutoff * ((sq * 0.5 + saw * 0.5) - lp);
    const s = lp * Math.exp(-t * 9) * g;
    const [l, r] = pan(s, p);
    add(idx(t0) + k, l, r, 0.3);
  }
}
function pad(t0, midis, dur, g = 0.05, bright = 0.03) {
  const voices = [];
  for (const m of midis) for (const d of [-0.12, 0, 0.11]) voices.push({ f: mtof(m) * Math.pow(2, d / 12), ph: rnd(), p: d * 6 });
  const lps = voices.map(() => 0);
  for (let k = 0; k < dur * SR; k++) {
    const t = k / SR;
    const env = Math.min(1, t / 0.6) * Math.min(1, (dur - t) / 0.5);
    const i = idx(t0) + k;
    let l = 0,
      r = 0;
    voices.forEach((v, j) => {
      v.ph += v.f / SR;
      const saw = 2 * (v.ph % 1) - 1;
      lps[j] += (bright + 0.01 * Math.sin(t * 1.3 + j)) * (saw - lps[j]);
      const [a, b] = pan(lps[j], v.p);
      l += a;
      r += b;
    });
    const d = DUCK[i] ?? 1;
    const gg = env * g * (0.55 + 0.45 * d);
    add(i, l * gg, r * gg, 0.5);
  }
}
function lead(t0, midi, dur, g = 0.11) {
  const f = mtof(midi);
  let ph = 0,
    ph2 = 0;
  for (let k = 0; k < (dur + 0.25) * SR; k++) {
    const t = k / SR;
    const vib = 1 + 0.004 * Math.sin(2 * Math.PI * 5.5 * t) * Math.min(1, t * 3);
    ph += (f * vib) / SR;
    ph2 += (f * 2.003 * vib) / SR;
    const tri = 1 - 4 * Math.abs((ph % 1) - 0.5);
    const s0 = tri * 0.7 + Math.sin(2 * Math.PI * ph2) * 0.2;
    const env = Math.min(1, t * 60) * (t < dur ? 1 : Math.exp(-(t - dur) * 14)) * (0.8 + 0.2 * Math.exp(-t * 4));
    const s = s0 * env * g;
    add(idx(t0) + k, s * 0.9, s, 0.45);
  }
}
function riser(t0, dur, g = 0.2, reverse = false) {
  let lp = 0;
  for (let k = 0; k < dur * SR; k++) {
    const t = k / SR;
    const x = t / dur;
    const p = reverse ? x * x * x : x * x;
    lp += (0.01 + 0.5 * p) * (noise() - lp);
    const s = lp * p * g;
    add(idx(t0) + k, s * (1 - 0.3 * Math.sin(t * 6)), s * (1 - 0.3 * Math.cos(t * 6)), 0.4);
  }
}
function impact(t0, g = 0.8) {
  let ph = 0,
    lp = 0;
  for (let k = 0; k < 1.6 * SR; k++) {
    const t = k / SR;
    ph += (38 + 60 * Math.exp(-t * 9)) / SR;
    lp += 0.08 * (noise() - lp);
    const s = (Math.sin(2 * Math.PI * ph) * Math.exp(-t * 2.4) + lp * 2 * Math.exp(-t * 10)) * g;
    add(idx(t0) + k, s, s, 0.25);
  }
}
function whoosh(t0, dur = 0.7, g = 0.22, dir = 1) {
  let lp = 0;
  for (let k = 0; k < dur * SR; k++) {
    const t = k / SR;
    const x = t / dur;
    const env = Math.sin(Math.PI * Math.pow(x, 0.7));
    lp += (0.02 + 0.25 * (dir > 0 ? x : 1 - x)) * (noise() - lp);
    const s = lp * env * g;
    const [l, r] = pan(s, -0.8 + 1.6 * x);
    add(idx(t0) + k, l, r, 0.3);
  }
}
function tick(t0, g = 0.09, freq = 3200) {
  for (let k = 0; k < 0.03 * SR; k++) {
    const t = k / SR;
    const s = (Math.sin(2 * Math.PI * freq * t) * 0.6 + noise() * 0.4) * Math.exp(-t * 260) * g;
    add(idx(t0) + k, s, s * 0.9, 0.1);
  }
}
function typing(t0, t1, g = 0.07) {
  let t = t0;
  while (t < t1) {
    tick(t, g * (0.7 + rnd() * 0.5), 2200 + rnd() * 2400);
    t += 0.045 + rnd() * 0.05;
  }
}
function glassClick(t0, g = 0.16) {
  for (let k = 0; k < 0.25 * SR; k++) {
    const t = k / SR;
    const s = (Math.sin(2 * Math.PI * 2600 * t) + 0.6 * Math.sin(2 * Math.PI * 4150 * t) + 0.3 * Math.sin(2 * Math.PI * 6900 * t)) * Math.exp(-t * 30) * g;
    add(idx(t0) + k, s, s, 0.5);
  }
}
function pop(t0, g = 0.2, base = 700) {
  let ph = 0;
  for (let k = 0; k < 0.09 * SR; k++) {
    const t = k / SR;
    ph += (base + 900 * Math.min(1, t * 30)) / SR;
    const s = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 45) * g;
    add(idx(t0) + k, s, s, 0.3);
  }
}
function shimmer(t0, dur, g = 0.05) {
  const notes = [81, 84, 88, 91, 93, 96, 100];
  let t = t0;
  while (t < t0 + dur) {
    const m = notes[Math.floor(rnd() * notes.length)];
    const f = mtof(m);
    const p = rnd() * 2 - 1;
    for (let k = 0; k < 0.6 * SR; k++) {
      const tt = k / SR;
      const s = Math.sin(2 * Math.PI * f * tt) * Math.exp(-tt * 6) * Math.min(1, tt * 200) * g;
      const [l, r] = pan(s, p);
      add(idx(t) + k, l, r, 0.6);
    }
    t += 0.05 + rnd() * 0.06;
  }
}
function bell(t0, midi, g = 0.12, len = 3) {
  const f = mtof(midi);
  for (let k = 0; k < len * SR; k++) {
    const t = k / SR;
    const mod = Math.sin(2 * Math.PI * f * 3.5 * t) * 2.2 * Math.exp(-t * 3);
    const s = Math.sin(2 * Math.PI * f * t + mod) * Math.exp(-t * 1.6) * Math.min(1, t * 400) * g;
    add(idx(t0) + k, s, s, 0.6);
  }
}

// ---------- score ----------
const CHORDS = [
  { root: 45, pad: [57, 60, 64] }, // Am
  { root: 41, pad: [53, 57, 60] }, // F
  { root: 48, pad: [55, 60, 64] }, // C
  { root: 43, pad: [55, 59, 62] }, // G
];
const chordAt = (bar) => CHORDS[bar % 4];

for (let bar = 0; bar < 20; bar++) {
  const t = bar * BAR;
  const ch = chordAt(bar);

  // 0–4 s: digital pulse + drone
  if (t < 4) {
    for (let e = 0; e < 8; e++) pluck(t + e * BEAT * 0.5, 69 + (e % 2 ? 12 : 0), 0.05 * (0.4 + t / 4), e % 2 ? 0.4 : -0.4);
    pad(t, [45, 52, 57], BAR, 0.035, 0.012);
  }

  // 4–33 s: groove
  if (t >= 4 && t < 33) {
    const drop = t >= 27;
    for (let b = 0; b < 4; b++) {
      const bt = t + b * BEAT;
      kick(bt, drop ? 1.0 : t < 9 ? 0.6 : 0.8);
      hat(bt + BEAT / 2, drop ? 0.16 : 0.11, 40, 0.3);
      if (t >= 9) {
        hat(bt + BEAT / 4, 0.05, 70, -0.4);
        hat(bt + (3 * BEAT) / 4, 0.05, 70, -0.4);
      }
      if (t >= 9 && (b === 1 || b === 3)) clap(bt, drop ? 0.4 : 0.28);
      // offbeat bass
      bass(bt + BEAT / 2, ch.root - 12 + (b === 3 && drop ? 12 : 0), BEAT * 0.45, drop ? 0.36 : 0.28);
      if (drop) bass(bt, ch.root - 12, BEAT * 0.35, 0.2);
    }
    // 16th-note arpeggio from 9 s
    if (t >= 9) {
      for (let s = 0; s < 16; s++) {
        const [a, b, c] = ch.pad;
        const m = 12 + [a, b, c, a + 12, c, b, a + 12, b + 12][s % 8];
        pluck(t + s * (BEAT / 4), m, drop ? 0.075 : 0.06, s % 2 ? 0.5 : -0.5);
      }
    }
    // pads from 21 s
    if (t >= 21) pad(t, ch.pad.concat([ch.pad[0] + 12]), BAR, drop ? 0.045 : 0.04, drop ? 0.05 : 0.03);
    else pad(t, ch.pad, BAR, 0.022, 0.015);
  }

  // 33–37 s: breakdown — no drums, chord + reverse riser
  if (t >= 33 && t < 37) {
    pad(t, ch.pad.concat([ch.pad[0] + 12, ch.pad[2] + 12]), BAR + 0.2, 0.05, 0.035);
    bass(t, ch.root - 12, BAR, 0.12);
  }
}

// melodic lead (21–33 s): two-bar phrase per chord pair
const PHRASE = [
  // [beat, midi offset from chord top, beats]
  [0, 12, 1], [1, 7, 0.5], [1.5, 9, 0.5], [2, 12, 1.5], [3.5, 14, 0.5],
];
for (let bar = 10; bar < 16; bar++) {
  const ch = chordAt(bar);
  const top = ch.pad[0] + 12;
  for (const [b, off, len] of PHRASE) lead(bar * BAR + b * BEAT, top + off - 12, len * BEAT * 0.95, bar >= 13 ? 0.12 : 0.085);
}

// ---------- SFX (seconds, aligned to the scene frame timings at 60 fps) ----------
const s = (sceneStartSec, frame) => sceneStartSec + frame / 60;
// Scene 1
riser(1.6, 2.4, 0.16, true);
typing(1.2, 2.45, 0.05);
impact(4.0, 0.5);
// Scene 2 (4 s)
typing(s(4, 70), s(4, 150));
glassClick(s(4, 158));
pop(s(4, 165), 0.12, 500);
whoosh(s(4, 262), 0.8, 0.18);
// Scene 3 (9 s)
typing(s(9, 16), s(9, 64));
glassClick(s(9, 66));
[176, 183, 190].forEach((fr, i) => pop(s(9, fr), 0.2, 650 + i * 120));
whoosh(s(9, 318), 0.9, 0.25);
// Scene 4 (15 s)
whoosh(s(15, 6), 0.8, 0.16);
glassClick(s(15, 56), 0.12);
for (let k = 0; k < 8; k++) tick(s(15, 58 + k * 5), 0.05, 1800 + k * 200);
typing(s(15, 60), s(15, 122));
glassClick(s(15, 124));
for (let k = 0; k < 14; k++) tick(s(15, 170 + k * 3), 0.04, 900 + (k % 4) * 500);
impact(s(15, 200), 0.6);
whoosh(s(15, 300), 0.9, 0.22);
// Scene 5 (21 s)
typing(s(21, 8), s(21, 76));
glassClick(s(21, 80));
shimmer(s(21, 100), 1.6, 0.04);
whoosh(s(21, 200), 0.8, 0.24);
riser(25.0, 2.0, 0.22);
whoosh(s(21, 322), 0.7, 0.2, -1);
// Scene 6 (27 s) – drop + word hits
impact(27.0, 0.9);
[27.0, 28.0, 29.0, 30.0].forEach((t) => glassClick(t, 0.1));
riser(s(27, 262), 0.85, 0.2); // magnetic sweep
impact(s(27, 318), 0.6);
// Scene 7 (33 s)
riser(35.4, 1.6, 0.18, true);
// Scene 8 (37 s) – sonic logo
impact(37.0, 1.0);
[60, 67, 72, 76, 74 + 12].forEach((m, i) => bell(37.0 + i * 0.045, m, 0.07, 3));
pad(37.0, [48, 55, 60, 64, 74], 3.0, 0.05, 0.03);
bass(37.0, 36, 2.6, 0.2);

// ---------- reverb (Schroeder) ----------
function reverb(inp, offset) {
  const out = new Float32Array(N);
  const combs = [1557, 1617, 1491, 1422, 1277, 1356].map((d) => ({ d: d + offset, buf: new Float32Array(d + offset), i: 0, lp: 0 }));
  const aps = [556, 441, 341, 225].map((d) => ({ d: d + offset, buf: new Float32Array(d + offset), i: 0 }));
  for (let n = 0; n < N; n++) {
    let acc = 0;
    for (const c of combs) {
      const y = c.buf[c.i];
      c.lp = y * 0.7 + c.lp * 0.3;
      c.buf[c.i] = inp[n] + c.lp * 0.86;
      c.i = (c.i + 1) % c.d;
      acc += y;
    }
    acc /= combs.length;
    for (const a of aps) {
      const b = a.buf[a.i];
      const y = -acc + b;
      a.buf[a.i] = acc + b * 0.5;
      a.i = (a.i + 1) % a.d;
      acc = y;
    }
    out[n] = acc;
  }
  return out;
}
const RL = reverb(VL, 0);
const RR = reverb(VR, 23);

// ---------- master ----------
let peak = 0;
for (let n = 0; n < N; n++) {
  L[n] = Math.tanh((L[n] + RL[n] * 0.9) * 1.1);
  R[n] = Math.tanh((R[n] + RR[n] * 0.9) * 1.1);
  peak = Math.max(peak, Math.abs(L[n]), Math.abs(R[n]));
}
const norm = 0.89 / peak; // ≈ -1 dBFS
// fades
for (let n = 0; n < N; n++) {
  const t = n / SR;
  const fin = Math.min(1, t / 0.05);
  const fout = t > 39.2 ? Math.max(0, (40 - t) / 0.8) : 1;
  L[n] *= norm * fin * fout;
  R[n] *= norm * fin * fout;
}

// ---------- write WAV ----------
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write("WAVE", 8);
buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(N * 4, 40);
for (let n = 0; n < N; n++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[n])) * 32767), 44 + n * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[n])) * 32767), 46 + n * 4);
}
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "audio", "soundtrack.wav");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, buf);
console.log(`Wrote ${out} (${DUR}s, ${BPM} BPM)`);
