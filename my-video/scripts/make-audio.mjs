// Generates the soundtrack and sound effects for "Wild India" as WAV files.
// Everything is synthesized, so the output is royalty-free and reproducible.
// Run with: node scripts/make-audio.mjs
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const TAU = Math.PI * 2;

// ---------- helpers ----------
const mulberry32 = (seed) => () => {
	seed |= 0;
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rnd = mulberry32(42);
const noise = () => rnd() * 2 - 1;
const buffer = (sec) => new Float32Array(Math.ceil(sec * SR));

const writeWav = (name, data, peak = 0.89) => {
	let max = 0;
	for (const v of data) max = Math.max(max, Math.abs(v));
	const g = max > 0 ? peak / max : 1;
	const out = Buffer.alloc(44 + data.length * 2);
	out.write('RIFF', 0);
	out.writeUInt32LE(36 + data.length * 2, 4);
	out.write('WAVEfmt ', 8);
	out.writeUInt32LE(16, 16);
	out.writeUInt16LE(1, 20);
	out.writeUInt16LE(1, 22);
	out.writeUInt32LE(SR, 24);
	out.writeUInt32LE(SR * 2, 28);
	out.writeUInt16LE(2, 32);
	out.writeUInt16LE(16, 34);
	out.write('data', 36);
	out.writeUInt32LE(data.length * 2, 40);
	for (let i = 0; i < data.length; i++) {
		const s = Math.max(-1, Math.min(1, data[i] * g));
		out.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
	}
	const file = join(OUT, name);
	mkdirSync(dirname(file), {recursive: true});
	writeFileSync(file, out);
	console.log('wrote', name, (data.length / SR).toFixed(2) + 's');
};

// State-variable filter, returns a stateful processor.
const svf = (type) => {
	let low = 0;
	let band = 0;
	return (x, cutoff, q = 0.7) => {
		const f = 2 * Math.sin((Math.PI * Math.min(cutoff, SR / 6)) / SR);
		low += f * band;
		const high = x - low - (1 / q) * band;
		band += f * high;
		return type === 'low' ? low : type === 'high' ? high : band;
	};
};

const add = (buf, t0, len, fn) => {
	const start = Math.floor(t0 * SR);
	const n = Math.floor(len * SR);
	for (let i = 0; i < n && start + i < buf.length; i++) {
		if (start + i >= 0) buf[start + i] += fn(i / SR, i);
	}
};

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

// ---------- instruments ----------
const marimba = (buf, t, f, amp = 0.3) =>
	add(buf, t, 0.9, (x) => {
		const env = Math.exp(-x * 7);
		return (
			amp *
			(Math.sin(TAU * f * x) * env +
				0.3 * Math.sin(TAU * f * 4 * x) * Math.exp(-x * 30) +
				0.12 * Math.sin(TAU * f * 10 * x) * Math.exp(-x * 80))
		);
	});

const pluck = (buf, t, f, amp = 0.25, len = 1.2) => {
	// Karplus-Strong with a slight "buzz" for a sitar-like colour.
	const n = Math.round(SR / f);
	const line = new Float32Array(n);
	for (let i = 0; i < n; i++) line[i] = noise();
	let idx = 0;
	add(buf, t, len, (x) => {
		const a = line[idx];
		const b = line[(idx + 1) % n];
		line[idx] = 0.4985 * (a + b);
		idx = (idx + 1) % n;
		const buzz = Math.tanh(a * 2.2);
		return amp * buzz * Math.min(1, x * 400);
	});
};

const tablaGe = (buf, t, amp = 0.55) =>
	add(buf, t, 0.5, (x) => {
		const f = 70 + 80 * Math.exp(-x * 9);
		const phase = TAU * (70 * x + (80 / 9) * (1 - Math.exp(-x * 9)));
		void f;
		return amp * Math.sin(phase) * Math.exp(-x * 7);
	});

const tablaNa = (buf, t, amp = 0.28) => {
	const hp = svf('high');
	add(buf, t, 0.35, (x) => {
		const ring =
			Math.sin(TAU * 560 * x) * Math.exp(-x * 14) +
			0.5 * Math.sin(TAU * 1130 * x) * Math.exp(-x * 22) +
			0.25 * Math.sin(TAU * 1690 * x) * Math.exp(-x * 30);
		const click = hp(noise(), 3000) * Math.exp(-x * 120);
		return amp * (ring + 0.6 * click);
	});
};

const tablaTi = (buf, t, amp = 0.16) => {
	const hp = svf('high');
	add(buf, t, 0.1, (x) => {
		return (
			amp *
			(Math.sin(TAU * 940 * x) * Math.exp(-x * 45) +
				0.8 * hp(noise(), 4000) * Math.exp(-x * 90))
		);
	});
};

const shaker = (buf, t, amp = 0.05) => {
	const hp = svf('high');
	add(buf, t, 0.08, (x) => amp * hp(noise(), 7000) * Math.sin(Math.PI * Math.min(1, x / 0.08)));
};

const bass = (buf, t, f, len, amp = 0.32) =>
	add(buf, t, len, (x) => {
		const env = Math.min(1, x * 80) * Math.exp(-x * 2.2) * Math.min(1, (len - x) * 30);
		return amp * env * (Math.sin(TAU * f * x) + 0.25 * Math.sin(TAU * 2 * f * x));
	});

const pad = (buf, t, freqs, len, amp = 0.05) =>
	add(buf, t, len, (x) => {
		const env = Math.min(1, x / 0.25) * Math.min(1, (len - x) / 0.4);
		let s = 0;
		for (const f of freqs) {
			for (let h = 1; h <= 4; h++) {
				s += (Math.sin(TAU * f * h * x + h) / h) * (1 + 0.003 * Math.sin(TAU * 5 * x));
			}
		}
		return amp * env * s;
	});

const crash = (buf, t, amp = 0.25, len = 1.6) => {
	const hp = svf('high');
	add(buf, t, len, (x) => amp * hp(noise(), 5000) * Math.exp(-x * 2.5));
};

// ---------- music: 24s at 120 BPM ----------
const makeMusic = () => {
	const dur = 24;
	const buf = buffer(dur);
	const beat = 0.5;
	const bar = beat * 4;
	const D4 = 62;
	// D - G - Bm - A
	const chords = [
		{bass: 38, tones: [62, 66, 69]},
		{bass: 43, tones: [62, 67, 71]},
		{bass: 47, tones: [62, 66, 71]},
		{bass: 45, tones: [61, 64, 69]},
	];
	const melody = [
		[12, null, 9, null, 7, 9, 12, null],
		[14, null, 12, 9, null, 7, 9, null],
		[16, null, 14, 12, null, 9, 12, 14],
		[12, null, 9, 7, 4, null, 7, null],
	];

	for (let b = 0; b < 12; b++) {
		const t0 = b * bar;
		const ch = chords[b % 4];
		const intro = b < 2;
		const outro = b >= 11;

		// Pad underneath everything
		if (!outro) pad(buf, t0, ch.tones.map(midi), bar, 0.035);

		// Bass
		if (!outro) {
			bass(buf, t0, midi(ch.bass), beat * 1.5);
			bass(buf, t0 + beat * 1.5, midi(ch.bass), beat * 0.5, 0.22);
			bass(buf, t0 + beat * 2, midi(ch.bass + 7), beat * 1.5, 0.26);
			bass(buf, t0 + beat * 3.5, midi(ch.bass + 12), beat * 0.5, 0.2);
		}

		// Bright intro arpeggio (rising)
		if (intro) {
			const arp = [0, 4, 7, 12, 16, 19, 24, 19];
			arp.forEach((n, i) => marimba(buf, t0 + i * beat * 0.5, midi(D4 + n + (b === 1 ? 2 : 0)), 0.22));
		}

		// Tabla groove: dha . na . dha na ge ti
		if (!outro) {
			for (let s = 0; s < 8; s++) {
				const t = t0 + s * beat * 0.5;
				const light = intro ? 0.6 : 1;
				if (s === 0 || s === 4) {
					tablaGe(buf, t, 0.55 * light);
					tablaNa(buf, t, 0.22 * light);
				}
				if (s === 2 || s === 5) tablaNa(buf, t, 0.26 * light);
				if (s === 6) tablaGe(buf, t, 0.4 * light);
				if (s === 1 || s === 3 || s === 7) tablaTi(buf, t, 0.14 * light);
				if (!intro) {
					shaker(buf, t, 0.045);
					shaker(buf, t + beat * 0.25, 0.025);
				}
			}
		}

		// Marimba melody during the groove
		if (!intro && !outro) {
			melody[b % 4].forEach((n, i) => {
				if (n !== null) marimba(buf, t0 + i * beat * 0.5, midi(D4 + n), 0.24);
			});
		}

		// Plucked strings on the off-beats
		if (!intro && !outro) {
			for (let s = 1; s < 8; s += 2) {
				pluck(buf, t0 + s * beat * 0.5, midi(ch.tones[(s >> 1) % 3]), 0.1, 0.6);
			}
		}

		// Outro: flourish run + final hit
		if (outro) {
			const run = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
			run.forEach((n, i) => marimba(buf, t0 + i * 0.07, midi(D4 + n), 0.22));
			tablaGe(buf, t0, 0.5);
			tablaNa(buf, t0 + 0.28, 0.25);
			tablaNa(buf, t0 + 0.42, 0.25);
			tablaNa(buf, t0 + 0.56, 0.25);
			const hit = t0 + 0.9;
			tablaGe(buf, hit, 0.8);
			bass(buf, hit, midi(38), 1.1, 0.45);
			pad(buf, hit, [62, 66, 69, 74].map(midi), 1.1, 0.05);
			[74, 78, 81, 86].forEach((m) => marimba(buf, hit, midi(m), 0.2));
			crash(buf, hit, 0.18, 1.1);
		}
	}

	// Gentle stereo-free glue: soft clip + fade-out
	for (let i = 0; i < buf.length; i++) {
		const x = i / SR;
		buf[i] = Math.tanh(buf[i] * 1.1);
		if (x > dur - 0.25) buf[i] *= (dur - x) / 0.25;
	}
	return buf;
};

// ---------- sound effects ----------
const sfxWhoosh = () => {
	const len = 0.6;
	const buf = buffer(len);
	const bp = svf('band');
	add(buf, 0, len, (x) => {
		const p = x / len;
		const env = Math.sin(Math.PI * Math.pow(p, 0.7));
		return bp(noise(), 300 + 2500 * Math.sin(Math.PI * p), 1.5) * env;
	});
	return buf;
};

const sfxPop = () => {
	const len = 0.18;
	const buf = buffer(len);
	add(buf, 0, len, (x) => {
		const phase = TAU * (500 * x + 3000 * x * x);
		return Math.sin(phase) * Math.exp(-x * 30) * Math.min(1, x * 2000);
	});
	return buf;
};

const sfxGrowl = () => {
	const len = 1.0;
	const buf = buffer(len);
	const lp = svf('low');
	add(buf, 0, len, (x) => {
		const env = Math.min(1, x * 6) * Math.min(1, (len - x) * 4);
		const am = 0.6 + 0.4 * Math.sin(TAU * 23 * x);
		const saw = ((65 * x) % 1) * 2 - 1;
		return env * am * lp(noise() * 0.8 + saw * 0.6, 420, 1.2);
	});
	return buf;
};

const sfxTrumpet = () => {
	const len = 1.1;
	const buf = buffer(len);
	const bp = svf('band');
	let phase = 0;
	add(buf, 0, len, (x) => {
		const p = x / len;
		const f = 380 + 380 * Math.sin(Math.PI * Math.min(1, p * 1.6)) + 12 * Math.sin(TAU * 7 * x);
		phase += f / SR;
		const saw = (phase % 1) * 2 - 1;
		const env = Math.min(1, x * 12) * Math.min(1, (len - x) * 5);
		return env * (bp(saw, 1200, 1.4) * 1.4 + 0.2 * noise() * env);
	});
	return buf;
};

const sfxFootsteps = () => {
	const len = 1.4;
	const buf = buffer(len);
	[0, 0.35, 0.7, 1.05].forEach((t) => {
		const lp = svf('low');
		add(buf, t, 0.25, (x) => {
			return (
				(Math.sin(TAU * (60 + 40 * Math.exp(-x * 20)) * x) * 0.8 + lp(noise(), 800) * 0.7) *
				Math.exp(-x * 18)
			);
		});
	});
	// soft grass swish
	const bp = svf('band');
	add(buf, 0, len, (x) => 0.08 * bp(noise(), 3500, 0.8) * (0.5 + 0.5 * Math.sin(TAU * 1.4 * x)));
	return buf;
};

const sfxDrum = () => {
	const len = 1.4;
	const buf = buffer(len);
	add(buf, 0, len, (x) => {
		const phase = TAU * (45 * x + (60 / 6) * (1 - Math.exp(-x * 6)));
		return Math.sin(phase) * Math.exp(-x * 3.2) * Math.min(1, x * 500);
	});
	crash(buf, 0, 0.15, 1.2);
	return buf;
};

const sfxRoar = () => {
	const len = 1.6;
	const buf = buffer(len);
	const lp = svf('low');
	const bp = svf('band');
	let phase = 0;
	add(buf, 0, len, (x) => {
		const p = x / len;
		const env = Math.min(1, x * 5) * Math.pow(1 - p, 1.3);
		const f = 95 + 40 * Math.sin(Math.PI * p);
		phase += f / SR;
		const saw = (phase % 1) * 2 - 1;
		const rough = 0.6 + 0.4 * Math.sin(TAU * 31 * x);
		const body = lp(saw * 0.9 + noise() * 0.7, 900, 1.1);
		const formant = bp(saw + noise() * 0.4, 650 + 250 * Math.sin(Math.PI * p), 3);
		return env * rough * (body + 0.6 * formant);
	});
	return buf;
};

const sfxWind = () => {
	const len = 3.6;
	const buf = buffer(len);
	const bp = svf('band');
	add(buf, 0, len, (x) => {
		const env = Math.min(1, x / 0.8) * Math.min(1, (len - x) / 0.8);
		const gust = 0.55 + 0.45 * Math.sin(TAU * 0.45 * x + 1) * Math.sin(TAU * 0.17 * x);
		return env * gust * bp(noise(), 500 + 400 * Math.sin(TAU * 0.3 * x), 2.5);
	});
	return buf;
};

const sfxRising = () => {
	const len = 2.2;
	const buf = buffer(len);
	[69, 74, 76, 78, 81, 83, 86, 90].forEach((m, i) => {
		add(buf, i * 0.16, 1.4, (x) => {
			const f = midi(m);
			return 0.3 * Math.sin(TAU * f * x) * Math.exp(-x * 2.6) * Math.min(1, x * 200) +
				0.08 * Math.sin(TAU * f * 2 * x) * Math.exp(-x * 5);
		});
	});
	return buf;
};

const sfxSparkle = () => {
	const len = 1.6;
	const buf = buffer(len);
	const notes = [86, 90, 93, 98, 93, 98, 102, 105];
	notes.forEach((m, i) => {
		const t = i * 0.08 + rnd() * 0.03;
		add(buf, t, 0.8, (x) => 0.3 * Math.sin(TAU * midi(m) * x) * Math.exp(-x * 7) * Math.min(1, x * 400));
	});
	return buf;
};

const sfxSwoosh = () => {
	const len = 0.35;
	const buf = buffer(len);
	const hp = svf('high');
	add(buf, 0, len, (x) => {
		const p = x / len;
		return hp(noise(), 1500 + 5000 * p) * Math.sin(Math.PI * p);
	});
	return buf;
};

writeWav('music.wav', makeMusic(), 0.85);
writeWav('sfx/whoosh.wav', sfxWhoosh());
writeWav('sfx/pop.wav', sfxPop());
writeWav('sfx/growl.wav', sfxGrowl());
writeWav('sfx/trumpet.wav', sfxTrumpet());
writeWav('sfx/footsteps.wav', sfxFootsteps());
writeWav('sfx/drum.wav', sfxDrum());
writeWav('sfx/roar.wav', sfxRoar());
writeWav('sfx/wind.wav', sfxWind());
writeWav('sfx/rising.wav', sfxRising());
writeWav('sfx/sparkle.wav', sfxSparkle());
writeWav('sfx/swoosh.wav', sfxSwoosh());
