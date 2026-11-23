/*
 * audio.js — original 50-second guide track (118 BPM tech-house) + UI SFX,
 * synthesised with Web Audio and rendered offline (deterministic).
 *
 *   0–5   suspense: pad, soft bass impact, light sweep, whoosh into the UI
 *   5–11  minimal clicks + filtered arp; bass held back; riser into 11 s
 *  11–18  main groove enters (kick, clap, hats, pumping bass)
 *  18–34  build through the capability showcases, risers at each transition
 *  34–46  full energy, lift at 41–46
 *  46–50  breath, logo hit at 47 s, final accent at 49 s with reverb tail
 * Leaves the 1–4 kHz band light so a voiceover sits on top.
 */
(function () {
  const FC = window.FC;
  const SR = 48000, DUR = 51.2, BEAT = 60 / 118;
  const G0 = 11.0 - 22 * BEAT; // beat grid anchored so a downbeat lands at 11.0 s
  const beatT = (n) => G0 + n * BEAT;
  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

  async function renderScore() {
    const ac = new OfflineAudioContext(2, Math.ceil(SR * DUR), SR);
    let seed = 118;
    const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3.5; comp.attack.value = 0.005; comp.release.value = 0.2;
    const master = ac.createGain(); master.gain.value = 0.85;
    master.connect(comp); comp.connect(ac.destination);
    const verb = ac.createConvolver();
    const irLen = Math.floor(SR * 2.4), ir = ac.createBuffer(2, irLen, SR);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < irLen; i++) d[i] = (rand() * 2 - 1) * Math.pow(1 - i / irLen, 3.5); }
    verb.buffer = ir;
    const wet = ac.createGain(); wet.gain.value = 0.28; verb.connect(wet); wet.connect(master);
    const bus = (gain, rev = 0.2, pan = 0) => {
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
      src.start(t, rand()); src.stop(t + dur + 0.05);
      return { g: g.gain, f: flt.frequency };
    };
    const osc = (type, f, t, dur, dest, env) => {
      const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t);
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(env.peak, t + (env.a || 0.005));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
      return o;
    };

    // sidechain "pump" envelope shared by bass + pads once the groove is in
    const pumpBus = ac.createGain(); pumpBus.gain.value = 1; pumpBus.connect(master);
    const pumpSend = ac.createGain(); pumpSend.gain.value = 0.18; pumpBus.connect(pumpSend); pumpSend.connect(verb);
    for (let n = 22; beatT(n) < 46.0; n++) {
      const t = beatT(n);
      pumpBus.gain.setValueAtTime(0.35, t); pumpBus.gain.linearRampToValueAtTime(1, t + BEAT * 0.7);
    }

    // ---- chords: Am – F – C – G (one per bar) ------------------------------
    const PROG = [[57, 60, 64], [53, 57, 60], [48, 55, 60, 64], [55, 59, 62]];
    const ROOT = [45, 41, 48, 43];
    const BAR = BEAT * 4;
    const level = (t) => (t < 5 ? 0.5 : t < 11 ? 0.45 : t < 18 ? 0.7 : t < 34 ? 0.8 : t < 41 ? 0.9 : t < 46 ? 1 : 0.6);

    // pad
    const pad = ac.createGain(); pad.gain.value = 0.05; pad.connect(pumpBus);
    for (let bar = -1; beatT(bar * 4) < 50; bar++) {
      const t = Math.max(0, beatT(bar * 4)), d = beatT(bar * 4 + 4) - t;
      const ch = PROG[((bar % 4) + 4) % 4];
      for (const n of ch) for (const det of [-9, 9]) {
        const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = midi(n + 12); o.detune.value = det;
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600 + 1800 * level(t); lp.Q.value = 0.6;
        const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5 * level(t) / ch.length, t + 0.25); g.gain.setValueAtTime(0.5 * level(t) / ch.length, t + d - 0.05); g.gain.linearRampToValueAtTime(0, t + d + 0.1);
        o.connect(lp); lp.connect(g); g.connect(pad); o.start(t); o.stop(t + d + 0.2);
      }
    }
    // final sustained chord (F → C resolution feel) from 46 s
    for (const n of [48, 55, 60, 64, 67, 72]) {
      const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = midi(n);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, 46); lp.frequency.linearRampToValueAtTime(3200, 49);
      const g = ac.createGain(); g.gain.setValueAtTime(0, 46); g.gain.linearRampToValueAtTime(0.022, 47); g.gain.setValueAtTime(0.022, 49.2); g.gain.linearRampToValueAtTime(0, 50.6);
      o.connect(lp); lp.connect(g); g.connect(bus(1, 0.5)); o.start(46); o.stop(51);
    }

    // arp (16ths) with filter opening over time
    const arpBus = bus(0.11, 0.3, 0.15);
    for (let s = 0; ; s++) {
      const t = beatT(0) + s * BEAT / 4;
      if (t >= 46) break;
      if (t < 1.4) continue;
      const bar = Math.floor((t - G0) / BAR);
      const ch = PROG[((bar % 4) + 4) % 4];
      const n = ch[[0, 1, 2, 1, 0, 2, 1, 2][s % 8] % ch.length] + 12 + (s % 16 >= 12 ? 12 : 0);
      const lvl = t < 5 ? 0.35 : t < 11 ? 0.55 : t < 18 ? 0.75 : 1;
      const cut = t < 11 ? 900 + 400 * (t / 11) : t < 41 ? 1600 + 1600 * ((t - 11) / 30) : 3600;
      const o = ac.createOscillator(); o.type = 'square'; o.frequency.value = midi(n);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 4; lp.frequency.setValueAtTime(cut * 1.6, t); lp.frequency.exponentialRampToValueAtTime(cut * 0.5, t + 0.12);
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.4 * lvl, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(lp); lp.connect(g); g.connect(arpBus); o.start(t); o.stop(t + 0.2);
    }

    // ---- drums -------------------------------------------------------------
    const drums = bus(0.9, 0.08);
    const kick = (t, v = 1) => {
      const o = ac.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.12);
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.95 * v, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
      o.connect(g); g.connect(drums); o.start(t); o.stop(t + 0.45);
      const n = noise(t, 0.02, drums, { type: 'highpass', freq: 3000 }); n.g.setValueAtTime(0.12 * v, t); n.g.exponentialRampToValueAtTime(0.001, t + 0.015);
    };
    const clap = (t, v = 1) => { for (const d of [0, 0.011, 0.022]) { const n = noise(t + d, 0.18, drums, { type: 'bandpass', freq: 1500, q: 0.8 }); n.g.setValueAtTime(0.32 * v, t + d); n.g.exponentialRampToValueAtTime(0.001, t + d + (d === 0.022 ? 0.17 : 0.02)); } };
    const hat = (t, v = 1, open = false) => { const n = noise(t, open ? 0.2 : 0.05, drums, { type: 'highpass', freq: 8000, q: 0.7 }); n.g.setValueAtTime(0.16 * v, t); n.g.exponentialRampToValueAtTime(0.001, t + (open ? 0.18 : 0.04)); };
    for (let n = 22; beatT(n) < 46.0; n++) {
      const t = beatT(n), inBar = n % 4;
      kick(t, t > 41 ? 1 : 0.9);
      if (inBar === 1 || inBar === 3) clap(t, t > 18 ? 1 : 0.8);
      hat(t + BEAT / 2, 0.8, t > 34);
      if (t > 18) { hat(t + BEAT / 4, 0.35); hat(t + (3 * BEAT) / 4, 0.4); }
    }
    // pre-groove pulse (5–11 s): soft clicks on the beat, held back 9–11 s
    for (let n = 0; beatT(n) < 11; n++) { const t = beatT(n); if (t < 5 || (t > 9 && n % 2)) continue; hat(t, 0.35); }

    // ---- bass ---------------------------------------------------------------
    const bass = ac.createGain(); bass.gain.value = 0.32; bass.connect(pumpBus);
    for (let n = 22; beatT(n) < 46.0; n++) {
      const t = beatT(n) + BEAT / 2;
      const bar = Math.floor((beatT(n) - G0 + 0.001) / BAR);
      const f = midi(ROOT[((bar % 4) + 4) % 4]);
      for (const [type, mul, lvl] of [['sine', 1, 0.8], ['sawtooth', 1, 0.18]]) {
        const o = ac.createOscillator(); o.type = type; o.frequency.value = f * mul;
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
        const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(lvl, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + BEAT * 0.48);
        o.connect(lp); lp.connect(g); g.connect(bass); o.start(t); o.stop(t + BEAT);
      }
    }
    // lead hook in the lift (41–46)
    const lead = bus(0.09, 0.35, -0.1);
    [[0, 76], [1, 74], [1.5, 72], [2, 74], [3, 79], [4, 76], [5, 74], [5.5, 72], [6, 74], [7, 72]].forEach(([b, n]) => {
      const t = beatT(84 - 4) + b * BEAT; // starts one bar before the cards
      if (t < 41.2 || t > 45.8) return;
      const o = osc('sawtooth', midi(n), t, BEAT * 0.9, lead, { peak: 0.5, a: 0.01 });
      o.detune.value = 6;
    });

    // ---- transitions: impacts, risers, whooshes -----------------------------
    const fx = bus(0.8, 0.35);
    const impact = (t, v = 1) => {
      const o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(32, t + 0.9);
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.8 * v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      o.connect(g); g.connect(fx); o.start(t); o.stop(t + 1.5);
      const n = noise(t, 0.6, fx, { type: 'lowpass', freq: 2500 }); n.g.setValueAtTime(0.18 * v, t); n.g.exponentialRampToValueAtTime(0.001, t + 0.5);
    };
    const riser = (t0, t1, v = 0.12) => {
      const n = noise(t0, t1 - t0 + 0.1, fx, { type: 'bandpass', freq: 500, q: 1.2 });
      n.g.setValueAtTime(0.0001, t0); n.g.exponentialRampToValueAtTime(v, t1); n.g.exponentialRampToValueAtTime(0.0001, t1 + 0.08);
      n.f.setValueAtTime(400, t0); n.f.exponentialRampToValueAtTime(7000, t1);
      const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(220, t0); o.frequency.exponentialRampToValueAtTime(880, t1);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v * 0.25, t1); g.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.05);
      o.connect(lp); lp.connect(g); g.connect(fx); o.start(t0); o.stop(t1 + 0.1);
    };
    const whoosh = (t, d = 0.6, v = 0.1, f0 = 300, f1 = 3000) => {
      const n = noise(t, d + 0.1, fx, { type: 'bandpass', freq: f0, q: 0.9 });
      n.g.setValueAtTime(0.0001, t); n.g.exponentialRampToValueAtTime(v, t + d * 0.6); n.g.exponentialRampToValueAtTime(0.0001, t + d);
      n.f.setValueAtTime(f0, t); n.f.exponentialRampToValueAtTime(f1, t + d * 0.7);
    };
    impact(0.12, 0.6);
    whoosh(0.15, 0.9, 0.07, 800, 5000);               // orange light sweep
    [1.0, 1.2, 1.4].forEach((t) => whoosh(t, 0.5, 0.05, 400, 2500));
    whoosh(4.15, 0.85, 0.14, 200, 4000);               // push through the hero panel
    riser(9.4, 11.0, 0.12); impact(11.0, 0.7);
    riser(16.9, 17.95, 0.1); whoosh(17.5, 0.6, 0.12);
    riser(25.0, 26.0, 0.08); whoosh(25.6, 0.5, 0.1);
    riser(33.1, 34.0, 0.09); whoosh(33.4, 0.6, 0.1);
    riser(40.0, 41.0, 0.12); impact(41.0, 0.6);
    riser(44.6, 46.0, 0.14); whoosh(45.3, 0.7, 0.14);
    whoosh(46.8, 0.7, 0.08, 1000, 6000);               // logo reveal
    impact(47.0, 0.75);
    [22.0, 23.0, 30.0, 34.3, 34.58, 34.86].forEach((t) => whoosh(t, 0.45, 0.06, 500, 3500));

    // ---- UI SFX ------------------------------------------------------------
    const ui = bus(0.7, 0.15);
    const click = (t, v = 1, f = 2200) => { osc('sine', f, t, 0.05, ui, { peak: 0.22 * v }); const n = noise(t, 0.02, ui, { type: 'highpass', freq: 4000 }); n.g.setValueAtTime(0.08 * v, t); n.g.exponentialRampToValueAtTime(0.001, t + 0.015); };
    const blip = (t, f, v = 1) => osc('sine', f, t, 0.12, ui, { peak: 0.12 * v, a: 0.004 });
    [5.2, 5.33, 5.46, 5.59].forEach((t) => click(t, 0.6, 1800));
    [7.0, 7.18, 7.36, 7.54].forEach((t) => blip(t, 1320, 0.6));
    for (let i = 0; i < 3; i++) for (let k = 0; k < 3; k++) blip(8.05 + i * 0.18 + k * 0.05, 1400 - k * 260, 0.5); // interrupted pulses
    [11.1, 11.35, 11.6, 11.85].forEach((t, i) => click(t, 0.9, 1600 + i * 200));         // connection clicks
    [13.2, 13.35, 13.5, 13.65].forEach((t) => click(t, 0.6, 2400));
    [15.75, 16.2, 16.65].forEach((t) => { click(t, 1, 2000); blip(t + 0.02, 1760, 0.6); });
    for (let t = 20.0; t < 22.4; t += BEAT / 2) blip(t, 1568, 0.35);                    // data pulses
    click(24.95, 1.2, 1700);                                                             // review action
    [[25.05, 1568], [25.13, 2093], [25.22, 2637]].forEach(([t, f]) => osc('sine', f, t, 0.6, ui, { peak: 0.14, a: 0.006 })); // confirmation chime
    click(28.5, 1, 1900);
    [31.0].forEach((t) => blip(t, 1175, 0.6));
    [36.9, 37.1, 37.3, 37.5, 37.7].forEach((t, i) => blip(t, 988 + i * 110, 0.5));       // network joins
    [37.8, 38.02, 38.24].forEach((t, i) => osc('sine', 1318 + i * 330, t, 0.3, ui, { peak: 0.1 })); // secure steps
    [42.54, 42.54 + BEAT, 42.54 + 2 * BEAT].forEach((t) => click(t, 0.8, 2600));
    // final accent at 49 s with a short tail
    impact(49.0, 0.5);
    for (const n of [72, 76, 79, 84]) osc('triangle', midi(n), 49.0, 1.4, bus(0.12, 0.6), { peak: 0.5, a: 0.01 });

    master.gain.setValueAtTime(0.85, 49.6);
    master.gain.linearRampToValueAtTime(0, 50.0);
    return ac.startRendering();
  }

  function toWav(buf, seconds) {
    const ch = buf.numberOfChannels, len = Math.min(buf.length, Math.round(SR * seconds)), bytes = 44 + len * ch * 2;
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
    const bytes = toWav(await renderScore(), 50);
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  };
})();
