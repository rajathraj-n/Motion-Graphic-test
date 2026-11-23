// Generates the electronic soundtrack and UI sound effects for the Steam demo.
// Everything is synthesized, so it is royalty-free and reproducible.
// Run with: node scripts/make-steam-audio.mjs
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'steam');
const TAU = Math.PI * 2;

// ---------- helpers ----------
let seed = 7;
const rnd = () => {
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const noise = () => rnd() * 2 - 1;
const buffer = (sec) => new Float32Array(Math.ceil(sec * SR));
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

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
		out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, data[i] * g)) * 32767), 44 + i * 2);
	}
	const file = join(OUT, name);
	mkdirSync(dirname(file), {recursive: true});
	writeFileSync(file, out);
	console.log('wrote', name, (data.length / SR).toFixed(2) + 's');
};

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

// Small Schroeder reverb for polish on hits and chimes.
const reverb = (buf, wet = 0.3, size = 1) => {
	const combs = [1557, 1617, 1491, 1422].map((d) => ({d: Math.round(d * size), b: new Float32Array(Math.round(d * size)), i: 0}));
	const aps = [225, 556].map((d) => ({d, b: new Float32Array(d), i: 0}));
	const out = new Float32Array(buf.length);
	for (let n = 0; n < buf.length; n++) {
		let s = 0;
		for (const c of combs) {
			const y = c.b[c.i];
			c.b[c.i] = buf[n] + y * 0.84;
			c.i = (c.i + 1) % c.d;
			s += y;
		}
		s *= 0.25;
		for (const a of aps) {
			const y = a.b[a.i];
			const x = s + y * 0.5;
			a.b[a.i] = x;
			a.i = (a.i + 1) % a.d;
			s = y - x * 0.5;
		}
		out[n] = buf[n] * (1 - wet) + s * wet;
	}
	return out;
};

// ---------- instruments ----------
const kick = (buf, t, amp = 0.9) =>
	add(buf, t, 0.45, (x) => {
		const phase = TAU * (48 * x + (110 / 25) * (1 - Math.exp(-x * 25)));
		return amp * Math.sin(phase) * Math.exp(-x * 7) * Math.min(1, x * 3000);
	});

const clap = (buf, t, amp = 0.35) => {
	const bp = svf('band');
	add(buf, t, 0.3, (x) => {
		const bursts = x < 0.03 ? 0.6 + 0.4 * Math.sin(TAU * 110 * x) : 1;
		return amp * bp(noise(), 1500, 1.2) * Math.exp(-x * 16) * bursts * 2.2;
	});
};

const hat = (buf, t, amp = 0.08, open = false) => {
	const hp = svf('high');
	add(buf, t, open ? 0.25 : 0.06, (x) => amp * hp(noise(), 8000) * Math.exp(-x * (open ? 14 : 70)));
};

// Detuned saw through a low-pass filter.
const synth = (buf, t, f, len, amp, cutoff, {attack = 0.005, release = 0.05, detune = 0.006, q = 1} = {}) => {
	const lp = svf('low');
	let p1 = rnd();
	let p2 = rnd();
	add(buf, t, len + release, (x) => {
		p1 += (f * (1 + detune)) / SR;
		p2 += (f * (1 - detune)) / SR;
		const saw = (p1 % 1) * 2 - 1 + ((p2 % 1) * 2 - 1);
		const env = Math.min(1, x / attack) * (x > len ? Math.max(0, 1 - (x - len) / release) : 1);
		const c = typeof cutoff === 'function' ? cutoff(x) : cutoff;
		return amp * env * lp(saw * 0.5, c, q);
	});
};

const sub = (buf, t, f, len, amp = 0.4) =>
	add(buf, t, len, (x) => amp * Math.sin(TAU * f * x) * Math.min(1, x * 200) * Math.min(1, (len - x) * 60));

const impact = (buf, t, amp = 1) => {
	const lp = svf('low');
	add(buf, t, 2.4, (x) => {
		const boom = Math.sin(TAU * (34 * x + (90 / 8) * (1 - Math.exp(-x * 8)))) * Math.exp(-x * 1.6);
		const body = lp(noise(), 600) * Math.exp(-x * 6);
		return amp * (boom * 0.9 + body * 0.8) * Math.min(1, x * 2000);
	});
	const hp = svf('high');
	add(buf, t, 1.6, (x) => amp * 0.18 * hp(noise(), 5000) * Math.exp(-x * 3));
};

const riser = (buf, t, len, amp = 0.2) => {
	const bp = svf('band');
	add(buf, t, len, (x) => {
		const p = x / len;
		return amp * Math.pow(p, 2) * bp(noise(), 300 + 6000 * p * p, 2);
	});
};

// ---------- music: 24 s at 120 BPM ----------
const makeMusic = () => {
	const dur = 24;
	let buf = buffer(dur);
	const beat = 0.5;
	const s16 = beat / 4;
	// Am - F - C - G, one chord per bar (2 s)
	const chords = [
		{root: 45, tones: [57, 60, 64]},
		{root: 41, tones: [57, 60, 65]},
		{root: 48, tones: [55, 60, 64]},
		{root: 43, tones: [55, 59, 62]},
	];

	// 0-4 s: cinematic hook, pad swell and a pulsing low note
	impact(buf, 0, 1);
	for (let b = 0; b < 2; b++) {
		const ch = chords[b];
		synth(buf, b * 2, midi(ch.root - 12), 2, 0.25, (x) => 200 + 300 * Math.min(1, x), {attack: 0.3, release: 0.2});
		ch.tones.forEach((m) => synth(buf, b * 2, midi(m), 2, 0.05, 1200, {attack: 0.6, release: 0.4, detune: 0.01}));
		for (let s = 0; s < 8; s++) {
			sub(buf, b * 2 + s * beat * 0.5, midi(ch.root - 12), 0.18, 0.22 + s * 0.02);
		}
	}
	riser(buf, 2.8, 1.2, 0.25);

	// 4-20 s: beat, building at 12 s
	for (let b = 2; b < 10; b++) {
		const t0 = b * 2;
		const ch = chords[b % 4];
		const strong = b >= 6;
		for (let q = 0; q < 4; q++) {
			kick(buf, t0 + q * beat, strong ? 0.95 : 0.8);
			if (b >= 4 && (q === 1 || q === 3)) clap(buf, t0 + q * beat, strong ? 0.4 : 0.3);
			hat(buf, t0 + q * beat + beat / 2, strong ? 0.1 : 0.07, strong && q % 2 === 1);
			if (strong) {
				hat(buf, t0 + q * beat + s16, 0.04);
				hat(buf, t0 + q * beat + s16 * 3, 0.04);
			}
		}
		// Off-beat bass with a sidechain-like gap after each kick
		for (let e = 0; e < 8; e++) {
			const tt = t0 + e * beat * 0.5;
			if (e % 2 === 1 || strong) {
				synth(buf, tt + 0.02, midi(ch.root - 12), 0.2, strong ? 0.3 : 0.26, 500, {q: 1.5});
			}
		}
		// 16th-note arpeggio
		const arp = [ch.tones[0], ch.tones[1], ch.tones[2], ch.tones[1] + 12, ch.tones[2], ch.tones[1], ch.tones[0] + 12, ch.tones[2]];
		for (let s = 0; s < 16; s++) {
			const m = arp[s % 8] + 12;
			const open = 1500 + 2500 * ((b - 2) / 8) + 800 * Math.sin(s / 3);
			synth(buf, t0 + s * s16, midi(m), s16 * 0.7, strong ? 0.06 : 0.05, open, {release: 0.06, q: 2});
		}
		// Pad
		ch.tones.forEach((m) => synth(buf, t0, midi(m), 2, 0.035, 1600, {attack: 0.2, release: 0.3, detune: 0.012}));
	}
	riser(buf, 18.5, 1.5, 0.3);

	// 20-24 s: uplift into the logo hit at 22 s
	[45, 41].forEach((root, i) => {
		const t0 = 20 + i;
		kick(buf, t0, 0.7);
		kick(buf, t0 + 0.5, 0.6);
		[root + 12, root + 19, root + 24, root + 28].forEach((m) =>
			synth(buf, t0, midi(m), 1, 0.045, 2000, {attack: 0.05, release: 0.3, detune: 0.012}),
		);
		sub(buf, t0, midi(root - 12), 1, 0.3);
	});
	for (let s = 0; s < 8; s++) synth(buf, 21 + s * 0.125, midi(72 + [0, 4, 7, 12, 16, 19, 24, 28][s]), 0.1, 0.04, 4000, {release: 0.1});
	const hit = 22;
	impact(buf, hit, 1.1);
	[48, 55, 60, 64, 67, 74].forEach((m) => synth(buf, hit, midi(m), 1.6, 0.05, (x) => 3000 * Math.exp(-x * 1.5) + 400, {attack: 0.01, release: 0.4, detune: 0.01}));
	sub(buf, hit, midi(36), 1.8, 0.45);

	buf = reverb(buf, 0.22, 1.1);
	for (let i = 0; i < buf.length; i++) {
		const x = i / SR;
		buf[i] = Math.tanh(buf[i] * 1.2);
		if (x > dur - 0.3) buf[i] *= (dur - x) / 0.3;
	}
	return buf;
};

// ---------- sound effects ----------
const sfx = {
	whoosh: () => {
		const len = 0.55;
		const b = buffer(len);
		const bp = svf('band');
		add(b, 0, len, (x) => {
			const p = x / len;
			return bp(noise(), 400 + 3000 * Math.sin(Math.PI * p), 1.4) * Math.sin(Math.PI * Math.pow(p, 0.6));
		});
		return reverb(b, 0.25);
	},
	click: () => {
		const b = buffer(0.08);
		const hp = svf('high');
		add(b, 0, 0.08, (x) => (Math.sin(TAU * 2200 * x) * 0.6 + hp(noise(), 4000) * 0.5) * Math.exp(-x * 90));
		return b;
	},
	hover: () => {
		const b = buffer(0.06);
		add(b, 0, 0.06, (x) => Math.sin(TAU * 3200 * x) * Math.exp(-x * 120) * 0.6);
		return b;
	},
	chime: () => {
		const b = buffer(1.4);
		[84, 91].forEach((m, i) =>
			add(b, i * 0.08, 1.2, (x) => Math.sin(TAU * midi(m) * x) * Math.exp(-x * 4) * 0.5 + Math.sin(TAU * midi(m) * 3 * x) * Math.exp(-x * 9) * 0.1),
		);
		return reverb(b, 0.35);
	},
	bass: () => {
		const b = buffer(0.8);
		add(b, 0, 0.8, (x) => Math.sin(TAU * (45 * x + (60 / 10) * (1 - Math.exp(-x * 10)))) * Math.exp(-x * 4) * Math.min(1, x * 1000));
		return b;
	},
	sweep: () => {
		const len = 0.9;
		const b = buffer(len);
		const bp = svf('band');
		add(b, 0, len, (x) => {
			const p = x / len;
			return bp(noise(), 200 + 7000 * p * p, 3) * Math.sin(Math.PI * p);
		});
		return reverb(b, 0.2);
	},
	complete: () => {
		const b = buffer(1.2);
		[79, 86, 91].forEach((m, i) =>
			add(b, i * 0.07, 0.9, (x) => Math.sin(TAU * midi(m) * x) * Math.exp(-x * 5) * 0.45),
		);
		return reverb(b, 0.3);
	},
	punch: () => {
		const b = buffer(0.6);
		kick(b, 0, 1);
		clap(b, 0, 0.3);
		return b;
	},
	achievement: () => {
		const b = buffer(1.8);
		[76, 79, 84, 88, 91].forEach((m, i) =>
			add(b, i * 0.07, 1.4, (x) => (Math.sin(TAU * midi(m) * x) + 0.3 * Math.sin(TAU * midi(m) * 2.01 * x)) * Math.exp(-x * 3.5) * 0.35),
		);
		return reverb(b, 0.4, 1.2);
	},
	rise: () => {
		const len = 1.5;
		const b = buffer(len);
		const lp = svf('low');
		let ph = 0;
		add(b, 0, len, (x) => {
			const p = x / len;
			ph += (110 * Math.pow(2, p * 2)) / SR;
			const saw = (ph % 1) * 2 - 1;
			return lp(saw, 300 + 5000 * p * p, 2) * p * Math.min(1, (len - x) * 20);
		});
		return b;
	},
	// Added for the glass version (appended so earlier sounds stay identical).
	shimmer: () => {
		const b = buffer(1.6);
		for (let i = 0; i < 14; i++) {
			const m = 96 + Math.floor(rnd() * 14);
			const t = i * 0.05 + rnd() * 0.04;
			add(b, t, 1.0, (x) => Math.sin(TAU * midi(m) * x) * Math.exp(-x * 6) * Math.min(1, x * 300) * 0.25);
		}
		const hp = svf('high');
		add(b, 0, 0.8, (x) => hp(noise(), 9000) * Math.sin(Math.PI * (x / 0.8)) * 0.08);
		return reverb(b, 0.45, 1.2);
	},
	activate: () => {
		const b = buffer(0.9);
		[60, 67, 72, 79].forEach((m, i) =>
			add(b, i * 0.05, 0.4, (x) => Math.sign(Math.sin(TAU * midi(m) * x)) * 0.12 * Math.exp(-x * 9)),
		);
		add(b, 0.2, 0.6, (x) => Math.sin(TAU * midi(91) * x) * Math.exp(-x * 5) * 0.35);
		return reverb(b, 0.3);
	},
	glass: () => {
		const len = 0.7;
		const b = buffer(len);
		const bp = svf('band');
		add(b, 0, len, (x) => {
			const p = x / len;
			return bp(noise(), 1500 + 5000 * Math.sin(Math.PI * p), 2.5) * Math.sin(Math.PI * p) * 0.8;
		});
		add(b, 0.1, 0.6, (x) => Math.sin(TAU * midi(100) * x) * Math.exp(-x * 7) * 0.15);
		return reverb(b, 0.4);
	},
};

writeWav('music.wav', makeMusic(), 0.85);
for (const [name, make] of Object.entries(sfx)) writeWav(`sfx/${name}.wav`, make());
