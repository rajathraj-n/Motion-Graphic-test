/*
 * audio.js — an original 30-second cinematic score + SFX, synthesised with
 * the Web Audio API (rendered offline, so it is deterministic).
 *
 * Arrangement follows the music direction:
 *   00–04  tanpura drone, soft strings, low cinematic hit, ink-drop SFX
 *   04–09  dhol-style percussion, rising sarangi-like bowed line, hooves
 *   09–14  stronger rhythm, urgent strings, restrained brass, paper rustle
 *   14–19  drop to bansuri-style flute and warm strings, sea breeze, steps
 *   19–24  percussion returns, layered build, marching
 *   24–30  full crescendo (peak ≈ 27s), resolving D-major chord, reverb tail
 * Tempo: 88 BPM. This is a temp/guide score — swap in a composed or
 * licensed track for final delivery if desired.
 */
(function () {
  const FC = window.FC;
  const SR = 48000, DUR = 30.6;
  const BEAT = 60 / 88;
  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

  async function renderScore() {
    const ac = new OfflineAudioContext(2, Math.ceil(SR * DUR), SR);
    const rand = FC.rng(1947).next;

    // ---- buses --------------------------------------------------------
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
    const master = ac.createGain(); master.gain.value = 0.8;
    master.connect(comp); comp.connect(ac.destination);
    const verb = ac.createConvolver();
    const irLen = Math.floor(SR * 3.2), ir = ac.createBuffer(2, irLen, SR);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < irLen; i++) d[i] = (rand() * 2 - 1) * Math.pow(1 - i / irLen, 3.2); }
    verb.buffer = ir;
    const wet = ac.createGain(); wet.gain.value = 0.32;
    verb.connect(wet); wet.connect(master);
    const bus = (gain, rev = 0.3, pan = 0) => {
      const g = ac.createGain(); g.gain.value = gain;
      const p = ac.createStereoPanner(); p.pan.value = pan;
      g.connect(p); p.connect(master);
      const s = ac.createGain(); s.gain.value = rev; p.connect(s); s.connect(verb);
      return g;
    };
    const noiseBuf = ac.createBuffer(1, SR * 2, SR);
    { const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = rand() * 2 - 1; }
    const noise = (t, dur, dest, f = {}) => {
      const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      const flt = ac.createBiquadFilter(); flt.type = f.type || 'bandpass'; flt.frequency.value = f.freq || 1000; flt.Q.value = f.q ?? 1;
      const g = ac.createGain(); g.gain.value = 0;
      src.connect(flt); flt.connect(g); g.connect(dest);
      src.start(t, rand() * 1.5); src.stop(t + dur + 0.05);
      return { g: g.gain, f: flt.frequency };
    };

    // intensity curve (matches the creative mix curve)
    const curve = [[0, 0.25], [4, 0.45], [9, 0.62], [14, 0.4], [19, 0.68], [24, 0.85], [27, 1.0], [29, 0.8], [30.6, 0.6]];

    // ---- tanpura drone (Pa – Sa – Sa – low Sa), key of D -------------------
    const tanpura = bus(0.16, 0.45);
    const tanNotes = [midi(57), midi(62), midi(62), midi(50)];
    for (let t = 0.05, i = 0; t < 30; t += 0.62, i++) {
      if (t > 14 && t < 19 && i % 2) continue;
      const f = tanNotes[i % 4];
      for (const det of [-2.5, 2.5]) {
        const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det;
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(700, t + 2.2); lp.Q.value = 2;
        const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.25, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + 2.6);
        o.connect(lp); lp.connect(g); g.connect(tanpura); o.start(t); o.stop(t + 2.7);
      }
    }

    // ---- string pads: dark (D minor) to light (D major) --------------------
    const strings = bus(0.085, 0.5);
    const chords = [
      [0.0, 4.2, [50, 57, 62, 65]],
      [4.0, 2.6, [46, 53, 62, 65]], [6.5, 2.7, [48, 55, 64, 67]],
      [9.0, 2.6, [50, 57, 62, 65, 69]], [11.5, 2.7, [43, 50, 58, 62, 67]],
      [14.0, 2.6, [53, 57, 60, 65]], [16.5, 2.7, [52, 55, 60, 67]],
      [19.0, 2.6, [46, 53, 58, 62, 65]], [21.5, 1.6, [48, 55, 60, 64, 67]], [23.0, 1.2, [45, 52, 61, 64, 69]],
      [24.0, 3.0, [38, 50, 54, 57, 62, 66, 69]], [27.0, 3.6, [38, 50, 57, 62, 66, 69, 74]],
    ];
    const lvl = (t) => { for (let i = 1; i < curve.length; i++) if (t <= curve[i][0]) { const [t0, v0] = curve[i - 1], [t1, v1] = curve[i]; return v0 + (v1 - v0) * (t - t0) / (t1 - t0); } return 0.6; };
    for (const [t, d, notes] of chords) {
      const L = lvl(t + 0.5);
      for (const n of notes) {
        for (const det of [-7, 0, 7]) {
          const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = midi(n); o.detune.value = det + (rand() - 0.5) * 4;
          const vib = ac.createOscillator(); vib.frequency.value = 5 + rand(); const vg = ac.createGain(); vg.gain.value = 4; vib.connect(vg); vg.connect(o.detune);
          const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900 + 2200 * L; lp.Q.value = 0.5;
          const g = ac.createGain();
          g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(L / notes.length, t + 0.6); g.gain.setValueAtTime(L / notes.length, t + d - 0.2); g.gain.linearRampToValueAtTime(0, t + d + (t >= 27 ? 2.4 : 0.5));
          o.connect(lp); lp.connect(g); g.connect(strings); o.start(t); o.stop(t + d + 2.6); vib.start(t); vib.stop(t + d + 2.6);
        }
      }
    }

    // ---- melodic voices ----------------------------------------------------
    function voice(dest, notes, o = {}) {
      const osc = ac.createOscillator(); osc.type = o.type || 'sine';
      const g = ac.createGain(); g.gain.value = 0;
      const vib = ac.createOscillator(); vib.frequency.value = o.vibHz || 5.5; const vg = ac.createGain(); vg.gain.value = o.vib || 8; vib.connect(vg); vg.connect(osc.detune);
      let node = osc;
      if (o.bp) { const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = o.bp; f.Q.value = 0.9; osc.connect(f); node = f; }
      if (o.lp) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; node.connect(f); node = f; }
      node.connect(g); g.connect(dest);
      const t0 = notes[0][0], tEnd = notes[notes.length - 1][0] + notes[notes.length - 1][1];
      osc.frequency.setValueAtTime(midi(notes[0][2]), t0);
      for (const [t, d, n, v = 1] of notes) {
        osc.frequency.setTargetAtTime(midi(n), t, o.glide ?? 0.03);
        g.gain.setTargetAtTime(v * (o.level || 0.2), t, o.attack ?? 0.05);
        g.gain.setTargetAtTime(v * (o.level || 0.2) * 0.75, t + d * 0.6, 0.2);
      }
      g.gain.setTargetAtTime(0, tEnd, o.release ?? 0.3);
      osc.start(t0); osc.stop(tEnd + 2); vib.start(t0); vib.stop(tEnd + 2);
      if (o.breath) { const b = noise(t0, tEnd - t0, dest, { type: 'bandpass', freq: 2400, q: 1.5 }); b.g.setValueAtTime(0, t0); b.g.linearRampToValueAtTime(o.breath, t0 + 0.2); b.g.setValueAtTime(o.breath, tEnd - 0.2); b.g.linearRampToValueAtTime(0, tEnd); }
    }
    // sarangi-like bowed line (rising)
    voice(bus(0.5, 0.45, -0.15), [[4.4, 0.9, 62], [5.3, 0.6, 64], [5.9, 0.9, 65], [6.8, 0.7, 67], [7.5, 0.6, 69], [8.1, 1.0, 70]], { type: 'sawtooth', bp: 1400, lp: 3200, level: 0.13, vib: 18, vibHz: 5.8, glide: 0.08, attack: 0.12 });
    // urgent strings ostinato
    const ost = bus(0.28, 0.3, 0.15);
    for (let t = 9.0, i = 0; t < 13.9; t += BEAT / 2, i++) voice(ost, [[t, BEAT / 2 - 0.04, [62, 65, 69, 65][i % 4] + (t > 11.5 ? -2 : 0), 0.8]], { type: 'sawtooth', lp: 2200, level: 0.12, vib: 4, attack: 0.01, release: 0.05 });
    // restrained brass
    const brass = bus(0.35, 0.45);
    voice(brass, [[10.2, 1.3, 50], [11.5, 2.3, 43]], { type: 'sawtooth', lp: 700, level: 0.16, vib: 3, attack: 0.25, glide: 0.1 });
    voice(brass, [[10.2, 1.3, 57], [11.5, 2.3, 50]], { type: 'sawtooth', lp: 700, level: 0.12, vib: 3, attack: 0.25, glide: 0.1 });
    // bansuri-style flute for Gandhi
    voice(bus(0.6, 0.6, 0.1), [[14.3, 0.7, 69], [15.0, 0.4, 72], [15.4, 1.0, 74], [16.4, 0.5, 72], [16.9, 0.5, 69], [17.4, 0.4, 67], [17.8, 1.3, 69]], { type: 'sine', level: 0.22, vib: 12, vibHz: 5, glide: 0.06, attack: 0.08, breath: 0.03 });
    // finale melody (strings + flute, D major)
    const fin = [[24.2, 0.8, 74], [25.0, 0.5, 76], [25.5, 0.9, 78], [26.4, 0.6, 81], [27.0, 1.2, 78], [28.2, 0.6, 76], [28.8, 1.6, 74]];
    voice(bus(0.5, 0.55, 0.1), fin, { type: 'sine', level: 0.2, vib: 10, glide: 0.05, attack: 0.06, breath: 0.02 });
    voice(bus(0.35, 0.5, -0.1), fin.map(([t, d, n]) => [t, d, n - 12]), { type: 'sawtooth', lp: 2600, level: 0.12, vib: 8, glide: 0.06, attack: 0.15 });
    voice(brass, [[24.0, 3.0, 50], [27.0, 3.2, 50]], { type: 'sawtooth', lp: 900, level: 0.15, vib: 3, attack: 0.3 });
    voice(brass, [[24.0, 3.0, 57], [27.0, 3.2, 54]], { type: 'sawtooth', lp: 900, level: 0.12, vib: 3, attack: 0.3 });

    // ---- percussion -------------------------------------------------------
    const drums = bus(0.9, 0.22);
    function dhol(t, v = 1, low = true) {
      if (low) {
        const o = ac.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.25);
        const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.75 * v, t + 0.005); g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
        o.connect(g); g.connect(drums); o.start(t); o.stop(t + 0.6);
        const n = noise(t, 0.08, drums, { type: 'lowpass', freq: 900 }); n.g.setValueAtTime(0.25 * v, t); n.g.exponentialRampToValueAtTime(0.001, t + 0.07);
      } else {
        const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(420, t); o.frequency.exponentialRampToValueAtTime(300, t + 0.08);
        const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22 * v, t + 0.003); g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        o.connect(g); g.connect(drums); o.start(t); o.stop(t + 0.2);
        const n = noise(t, 0.06, drums, { type: 'bandpass', freq: 2600, q: 1.2 }); n.g.setValueAtTime(0.18 * v, t); n.g.exponentialRampToValueAtTime(0.001, t + 0.05);
      }
    }
    function boom(t, v = 1) {
      const o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(30, t + 1.4);
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.9 * v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + 2.2);
      o.connect(g); g.connect(drums); o.start(t); o.stop(t + 2.3);
      const n = noise(t, 1.2, drums, { type: 'lowpass', freq: 1800 }); n.g.setValueAtTime(0.3 * v, t); n.g.exponentialRampToValueAtTime(0.001, t + 1.1);
    }
    function swell(t0, t1, v = 0.12) { // reverse-cymbal / brush sweep riser
      const n = noise(t0, t1 - t0 + 0.3, bus(1, 0.5), { type: 'highpass', freq: 3000, q: 0.5 });
      n.g.setValueAtTime(0.0001, t0); n.g.exponentialRampToValueAtTime(v, t1); n.g.exponentialRampToValueAtTime(0.0001, t1 + 0.3);
    }
    boom(0.45, 0.7);
    for (let b = 0, t = 4.0; t < 9; b++, t = 4.0 + b * BEAT) { if (b % 2 === 0) dhol(t, 0.55 + 0.05 * b, true); dhol(t + BEAT / 2, 0.35, false); }
    for (let b = 0, t = 9.0; t < 14; b++, t = 9.0 + b * BEAT) {
      dhol(t, 0.8, true); if (b % 2 === 1) dhol(t + BEAT * 0.5, 0.6, true);
      for (let s = 0; s < 2; s++) dhol(t + s * BEAT / 2 + BEAT / 4, 0.3 + 0.1 * s, false);
    }
    for (let b = 0, t = 14.0; t < 19; b += 4, t = 14.0 + b * BEAT) dhol(t, 0.25, true);
    for (let b = 0, t = 19.0; t < 23.4; b++, t = 19.0 + b * BEAT) {
      dhol(t, 0.6 + 0.08 * b, true);
      const sub = b < 3 ? 2 : 4;
      for (let s = 1; s < sub; s++) dhol(t + s * BEAT / sub, 0.25 + 0.04 * b, false);
    }
    for (let i = 0; i < 10; i++) dhol(23.3 + i * 0.07, 0.4 + i * 0.06, i % 2 === 0);
    boom(24.0, 1.0);
    for (let b = 0, t = 24.0 + BEAT; t < 27; b++, t = 24.0 + BEAT + b * BEAT) dhol(t, 0.7, b % 2 === 0);
    boom(27.0, 1.0); dhol(27.0, 1.0, true);
    dhol(28.4, 0.5, true);

    // ---- SFX ----------------------------------------------------------------
    const sfx = bus(0.8, 0.25);
    { // ink drop "plip"
      const o = ac.createOscillator(); o.frequency.setValueAtTime(1500, 0.42); o.frequency.exponentialRampToValueAtTime(500, 0.5);
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, 0.42); g.gain.exponentialRampToValueAtTime(0.3, 0.425); g.gain.exponentialRampToValueAtTime(0.001, 0.56);
      o.connect(g); g.connect(sfx); o.start(0.42); o.stop(0.6);
    }
    // brush sweeps (saffron stroke + every transition + final)
    for (const [t0, t1, v] of [[1.9, 2.6, 0.08], [3.5, 4.1, 0.1], [8.6, 9.1, 0.1], [13.5, 14.1, 0.08], [18.5, 19.1, 0.08], [23.4, 24.0, 0.14], [27.9, 28.6, 0.06]]) {
      const n = noise(t0, t1 - t0 + 0.4, sfx, { type: 'bandpass', freq: 1200, q: 0.6 });
      n.g.setValueAtTime(0.0001, t0); n.g.exponentialRampToValueAtTime(v, t1 - 0.1); n.g.exponentialRampToValueAtTime(0.0001, t1 + 0.35);
      n.f.setValueAtTime(600, t0); n.f.exponentialRampToValueAtTime(3500, t1);
    }
    swell(22.6, 24.0, 0.1);
    // hooves — gallop triplets, settling at the end of the scene
    for (let t = 5.0; t < 8.4; t += 1 / 1.35) for (const off of [0, 0.09, 0.2]) {
      const v = t > 7.6 ? 0.4 : 0.8;
      const n = noise(t + off, 0.1, sfx, { type: 'bandpass', freq: 380, q: 1.5 }); n.g.setValueAtTime(0.35 * v, t + off); n.g.exponentialRampToValueAtTime(0.001, t + off + 0.09);
    }
    { // paper rustle, crowd murmur
      const n = noise(9.0, 1.3, sfx, { type: 'highpass', freq: 2500, q: 0.7 });
      for (let i = 0; i < 26; i++) n.g.setValueAtTime(rand() * 0.1, 9.0 + i * 0.05);
      n.g.linearRampToValueAtTime(0, 10.3);
      const c = noise(11.0, 3.4, sfx, { type: 'bandpass', freq: 700, q: 0.8 });
      c.g.setValueAtTime(0, 11); c.g.linearRampToValueAtTime(0.05, 12.0); c.g.linearRampToValueAtTime(0.04, 13.5); c.g.linearRampToValueAtTime(0, 14.3);
    }
    { // sea breeze + footsteps
      const b = noise(14.0, 5.2, sfx, { type: 'lowpass', freq: 600, q: 0.3 });
      b.g.setValueAtTime(0, 14); b.g.linearRampToValueAtTime(0.12, 15); b.g.linearRampToValueAtTime(0.08, 18.5); b.g.linearRampToValueAtTime(0, 19.2);
      for (let t = 15.6; t < 18.8; t += 1 / 1.7) { const n = noise(t, 0.08, sfx, { type: 'bandpass', freq: 900, q: 2 }); n.g.setValueAtTime(0.06, t); n.g.exponentialRampToValueAtTime(0.001, t + 0.07); }
    }
    for (let t = 21.0; t < 23.8; t += 0.5) { const n = noise(t, 0.09, sfx, { type: 'bandpass', freq: 500, q: 1.5 }); n.g.setValueAtTime(0.12, t); n.g.exponentialRampToValueAtTime(0.001, t + 0.08); }
    { // soft wind under the finale
      const w = noise(24.0, 6.6, sfx, { type: 'bandpass', freq: 500, q: 0.4 });
      w.g.setValueAtTime(0, 24); w.g.linearRampToValueAtTime(0.05, 26); w.g.linearRampToValueAtTime(0.03, 30.6);
    }
    // gentle fade at the very end so the reverb tail lands cleanly
    master.gain.setValueAtTime(0.8, 29.4);
    master.gain.linearRampToValueAtTime(0.0, 30.5);

    return ac.startRendering();
  }

  function toWav(buf) {
    const ch = buf.numberOfChannels, len = Math.min(buf.length, Math.round(SR * 30)), bytes = 44 + len * ch * 2;
    const dv = new DataView(new ArrayBuffer(bytes));
    const w = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); dv.setUint32(4, bytes - 8, true); w(8, 'WAVE'); w(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true);
    dv.setUint16(22, ch, true); dv.setUint32(24, SR, true); dv.setUint32(28, SR * ch * 2, true); dv.setUint16(32, ch * 2, true); dv.setUint16(34, 16, true);
    w(36, 'data'); dv.setUint32(40, len * ch * 2, true);
    const data = []; for (let c = 0; c < ch; c++) data.push(buf.getChannelData(c));
    let o = 44;
    for (let i = 0; i < len; i++) for (let c = 0; c < ch; c++) { const v = Math.max(-1, Math.min(1, data[c][i])); dv.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2; }
    return new Uint8Array(dv.buffer);
  }

  FC.renderScore = renderScore;
  FC.renderScoreWavBase64 = async function () {
    const bytes = toWav(await renderScore());
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  };
})();
