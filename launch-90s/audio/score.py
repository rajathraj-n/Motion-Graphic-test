"""Original score + sound design for the 90 s RackNap Easy launch film (all synthesised, no samples).
118 BPM, A minor / C major. Tension intro → beat drop on the logo reveal (8.65 s) → energetic feature
section → build → brand impact on the closing logo (84.1 s).
Usage: python3 audio/score.py assets/cues.json audio/build/vo.wav audio/build/   (writes music.wav, sfx.wav, mix.wav)"""
import sys, json, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
CUES = json.load(open(sys.argv[1])); VO = sys.argv[2]; OUTD = sys.argv[3]
SR = 48000; DUR = 90.0; N = int(SR*DUR); rng = np.random.default_rng(11)
BPM = 118; BEAT = 60/BPM; BAR = 4*BEAT
DROP = CUES['B']['logo']            # 8.65 — downbeat of the drop
LOGO2 = 84.1                         # closing logo
def beat_t(k): return DROP + k*BEAT
def z(): return np.zeros((N, 2), np.float32)
def put(buf, sig, t, gain=1.0, pan=0.0):
    i = int(round(t*SR));
    if i >= N or i+len(sig) <= 0: return
    s = sig if sig.ndim == 2 else np.stack([sig*np.sqrt((1-pan)/2)*1.41421, sig*np.sqrt((1+pan)/2)*1.41421], 1)
    a, b = max(0, i), min(N, i+len(s)); buf[a:b] += s[a-i:b-i]*gain
def env(n, a, d, sustain=0.0, r=None):
    x = np.arange(n)/SR; e = np.minimum(1, x/max(a, 1e-4))*np.exp(-x/max(d, 1e-4))
    return e
def lp(x, fc, order=2):
    sos = butter(order, min(fc, SR/2*0.95), 'low', fs=SR, output='sos'); return sosfilt(sos, x, axis=0)
def hp(x, fc, order=2):
    sos = butter(order, fc, 'high', fs=SR, output='sos'); return sosfilt(sos, x, axis=0)
def bp(x, lo, hi):
    sos = butter(2, [lo, hi], 'band', fs=SR, output='sos'); return sosfilt(sos, x, axis=0)
def note(m): return 440*2**((m-69)/12)
def saw(f, n, det=0.0, ph=0.0):
    t = np.arange(n)/SR; return 2*((t*f*(1+det)+ph) % 1)-1
def reverb(x, secs=2.2, mix=0.25, pre=0.02):
    n = int(secs*SR); t = np.arange(n)/SR
    ir = rng.standard_normal((n, 2))*np.exp(-t*6.5/secs)[:, None]; ir[:int(pre*SR)] = 0
    ir = lp(ir, 6000); ir /= np.sqrt((ir**2).sum(0))
    wet = np.stack([fftconvolve(x[:, c], ir[:, c])[:len(x)] for c in range(2)], 1)
    return x*(1-mix) + wet*mix*1.6

# ---------------- section helpers ----------------
def section_gain(t):
    """energy envelope per element over time (0..1)"""
    return t
CHORDS = {  # voicings (MIDI)
 'Am': [57, 60, 64, 67, 72], 'F': [53, 57, 60, 64, 69], 'C': [55, 60, 64, 67, 72], 'G': [55, 59, 62, 67, 71], 'Em': [52, 55, 59, 64, 67],
 'Cadd9': [48, 55, 60, 62, 64, 67, 72],
}
ROOT = {'Am': 45, 'F': 41, 'C': 48, 'G': 43, 'Em': 40}
PROG = ['Am', 'F', 'C', 'G']           # vi–IV–I–V, two bars each
def chord_at(t):
    k = int(np.floor((t-DROP)/(2*BAR))) % 4; return PROG[k]

music = z()
# ---------- intro (0 → drop): drone, ticking hats, pulse bass, riser ----------
n = int(DROP*SR); tt = np.arange(n)/SR
drone = sum(saw(note(m), n, d) for m in (33, 40, 45) for d in (-0.002, 0.0021))/6
lfo = 300+250*(0.5+0.5*np.sin(2*np.pi*0.18*tt))+tt*90
drone_f = np.zeros(n); blk = 2048
for i in range(0, n, blk):
    seg = drone[i:i+blk]; drone_f[i:i+blk] = lp(seg, lfo[i])  # block-wise sweep
drone_f *= np.minimum(1, tt/1.5)*0.35
put(music, drone_f, 0, 0.9)
for k in range(-40, 0):               # 16th ticks, sparse
    t = beat_t(k/2) if False else DROP + k*BEAT/2
    if t < 0.3: continue
    tick = hp(rng.standard_normal(int(0.03*SR)), 7000)*env(int(0.03*SR), .001, .008)
    put(music, tick, t, 0.10 + 0.08*(t/DROP), 0.3 if k % 2 else -0.3)
for k in range(-16, 0):               # pulse bass on 8ths, filter opening
    t = DROP + k*BEAT/2
    if t < 1.0: continue
    m = 33; ln = int(BEAT/2*0.9*SR); s = saw(note(m), ln)*env(ln, .005, .18)
    put(music, lp(s, 180+900*(t/DROP)), t, 0.32)
rl = int(3.6*SR); rt = np.arange(rl)/SR                  # noise riser into the drop
riser = hp(rng.standard_normal(rl), 400)*(rt/3.6)**2.2
riser = np.concatenate([lp(riser[i:i+4800], 1500+(i/SR/3.6)*9000) for i in range(0, rl, 4800)])
put(music, riser, DROP-3.6, 0.22)
# ---------- drums / bass / pads / arps ----------
def kick():
    n = int(0.42*SR); t = np.arange(n)/SR; f = 45+110*np.exp(-t*32)
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*7.5)*1.0 + hp(rng.standard_normal(n), 3000)*env(n, .0005, .004)*0.3
def clap():
    n = int(0.25*SR); x = bp(rng.standard_normal(n), 900, 5000); e = np.zeros(n)
    for o in (0, .011, .022): e += np.roll(env(n, .0005, .012), int(o*SR))
    return x*(e*0.5 + env(n, .002, .09)*0.6)
def hat(open_=False):
    n = int((0.22 if open_ else 0.05)*SR); return hp(rng.standard_normal(n), 7500)*env(n, .0005, .06 if open_ else .012)
def crash():
    n = int(2.2*SR); return hp(rng.standard_normal(n), 3500)*env(n, .002, .8)
def boom():
    n = int(2.0*SR); t = np.arange(n)/SR; f = 32+60*np.exp(-t*6)
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*1.6)
K, CL, HC, HO, CR, BM = kick(), clap(), hat(), hat(True), crash(), boom()
def energy(t):
    if t < DROP: return 0
    if 34.0 <= t < 39.6: return 0.55      # storefront: lighter
    if 68.0 <= t < 73.2: return 0.8       # reconciliation: tension
    if 82.9 <= t < LOGO2: return 0.0      # breakdown before the closing logo
    if t >= LOGO2: return 0.75
    return 1.0
side = np.ones(N, np.float32)             # sidechain envelope from the kick
kb = 0
while True:
    t = DROP + kb*BEAT
    if t >= DUR-0.3: break
    e = energy(t)
    if e > 0:
        halftime = 34.0 <= t < 39.6
        if (not halftime) or kb % 2 == 0: put(music, K, t, 0.62*min(1, e+0.2))
        i = int(t*SR); sl = min(N-i, int(0.32*SR)); side[i:i+sl] = np.minimum(side[i:i+sl], 0.45+0.55*(np.arange(sl)/sl)**0.6)
        if kb % 4 in (1, 3): put(music, CL, t, 0.30*e, 0.05)
        put(music, HC, t+BEAT/2, 0.10*e, 0.25)
        if kb % 4 == 3: put(music, HO, t+BEAT/2, 0.07*e, -0.2)
        if e >= 1.0: put(music, HC, t+BEAT/4, 0.04, -0.3); put(music, HC, t+3*BEAT/4, 0.04, -0.3)
    kb += 1
# snare roll build 79–83
for j, t in enumerate(np.concatenate([np.arange(79.0, 81.0, BEAT/2), np.arange(81.0, 82.2, BEAT/4), np.arange(82.2, 82.9, BEAT/8)])):
    put(music, CL, t, 0.08+0.22*((t-79)/4)**1.5, 0.1 if j % 2 else -0.1)
rl = int(4.0*SR); rt = np.arange(rl)/SR
put(music, lp(hp(rng.standard_normal(rl), 600)*(rt/4)**2, 12000), 78.9, 0.2)
# impacts
put(music, BM, DROP, 0.9); put(music, CR, DROP, 0.18)
put(music, BM, LOGO2, 0.95); put(music, CR, LOGO2, 0.2)
for t in (85.25, 86.2, 87.22): put(music, K, t, 0.45); put(music, CR[:int(0.8*SR)], t, 0.06)
# bass: 8th notes on the chord root, sidechained
bass = np.zeros(N, np.float32)
k = 0
while True:
    t = DROP + k*BEAT/2
    if t >= DUR-0.2: break
    e = energy(t)
    if e > 0:
        c = 'Cadd9' if t >= LOGO2 else chord_at(t); m = ROOT.get(c, 36) - 12 + (12 if k % 2 else 0)*0
        ln = int(BEAT/2*0.92*SR); s = (saw(note(m), ln) + saw(note(m), ln, 0.004))*0.5*env(ln, .004, .25)
        s = lp(s, 380 + 500*e)
        i = int(t*SR); b = min(N, i+ln); bass[i:b] += s[:b-i]*0.5*e
    k += 1
music[:, 0] += bass*side; music[:, 1] += bass*side
# pads (whole song after drop + intro swell), chord per 2 bars
pad = np.zeros((N, 2), np.float32)
def pad_chord(c, t0, t1, g):
    n = int((t1-t0)*SR);
    if n <= 0: return
    s = np.zeros((n, 2))
    for j, m in enumerate(CHORDS[c]):
        for d, ch in ((-0.003, 0), (0.0032, 1)):
            s[:, ch] += saw(note(m), n, d, ph=rng.random())
    s /= len(CHORDS[c])*1.5
    x = np.arange(n)/SR; e = np.minimum(1, x/0.35)*np.minimum(1, (t1-t0-x)/0.25)
    s = lp(s, 1800)*e[:, None]
    put(pad, s.astype(np.float32), t0, g)
t = DROP
while t < 82.9:
    c = chord_at(t+0.01); g = 0.16 if 68 <= t < 73.2 else 0.20
    pad_chord('Em' if (68 <= t < 73.2 and c == 'C') else c, t, min(t+2*BAR, 82.9), g); t += 2*BAR
pad_chord('F', 82.9, LOGO2, 0.26)          # breakdown swell
pad_chord('Cadd9', LOGO2, DUR, 0.30)       # brand chord
pad_chord('Am', 3.5, DROP, 0.10)           # intro hint
music += reverb(pad, 2.8, 0.35)*side[:, None]**0.5
# pluck arpeggio 16ths (feature sections)
arp = np.zeros((N, 2), np.float32); k = 0
while True:
    t = DROP + k*BEAT/4
    if t >= 82.9: break
    e = energy(t)
    if e >= 0.75 and t > 10.2:
        c = chord_at(t); tones = CHORDS[c][1:]; m = tones[[0, 2, 1, 3, 2, 1, 3, 2][k % 8]] + 12
        ln = int(0.16*SR); s = (saw(note(m), ln)+saw(note(m), ln, .003))*0.5*env(ln, .002, .06)
        s = lp(s, 2600 + 1400*np.sin(2*np.pi*t/16)**2)
        put(arp, s, t, 0.07*e, 0.35 if k % 2 else -0.35)
    k += 1
music += reverb(arp, 1.4, 0.3)
# final fade
fade = np.ones(N); fs = int(89.2*SR); fade[fs:] = np.linspace(1, 0, N-fs)**1.5
music *= fade[:, None]

# ---------------- sound effects ----------------
sfx = z()
def click():
    n = int(0.05*SR); x = np.arange(n)/SR
    return (np.sin(2*np.pi*2300*x)*0.5 + bp(rng.standard_normal(n), 2000, 8000)*0.6)*env(n, .0004, .007)
def whoosh(d=0.8, up=True):
    n = int(d*SR); x = np.arange(n)/SR; nz = rng.standard_normal(n)
    out = np.zeros(n); blk = 1024
    for i in range(0, n, blk):
        p = i/n; fc = (300+5000*p) if up else (5300-5000*p)
        out[i:i+blk] = bp(nz[i:i+blk], max(150, fc*0.6), min(16000, fc*1.6))
    return out*np.sin(np.pi*np.clip(x/d, 0, 1))**2
def chime(notes=(84, 88, 91), d=1.6):
    n = int(d*SR); x = np.arange(n)/SR
    s = sum(np.sin(2*np.pi*note(m)*x)*np.exp(-x*(3+j)) + 0.3*np.sin(2*np.pi*note(m)*2*x)*np.exp(-x*(6+j)) for j, m in enumerate(notes))
    for j in range(len(notes)): pass
    return s/len(notes)*np.minimum(1, x/0.003)
def blip(m=88):
    n = int(0.12*SR); x = np.arange(n)/SR; return np.sin(2*np.pi*note(m)*x)*env(n, .002, .035)
def tick(): n = int(0.02*SR); return np.sin(2*np.pi*1800*np.arange(n)/SR)*env(n, .0003, .004)
def glitch():
    n = int(0.09*SR); s = np.sign(np.sin(2*np.pi*np.arange(n)/SR*rng.uniform(300, 900)))*env(n, .001, .03)
    return bp(s, 400, 6000)
C = CUES; Bq = C['B']
for t in C['CLICKS']: put(sfx, click(), t-0.01, 0.55, 0.1)
for t, d, up, g in [(0.05, 1.6, True, 0.18), (Bq['merge'], 1.0, True, 0.32), (Bq['app'], 1.0, True, 0.22), (Bq['dash'], 0.8, True, 0.16), (Bq['c360'], 0.9, True, 0.2),
                    (Bq['cat'], 0.9, True, 0.2), (Bq['build'], 0.9, False, 0.2), (Bq['quote'], 0.9, True, 0.2), (Bq['order']+0.3, 0.9, True, 0.2), (Bq['subs'], 0.9, True, 0.2),
                    (Bq['inv'], 0.9, True, 0.2), (Bq['rec'], 0.9, True, 0.2), (Bq['prof'], 0.9, True, 0.2), (78.9, 1.5, False, 0.18), (82.9, 1.3, True, 0.26),
                    (C['CAT']['fly'], 0.9, True, 0.18), (C['IV']['fly'], 1.0, True, 0.16)]:
    put(sfx, whoosh(d, up), t, g)
for i in range(9): put(sfx, whoosh(0.5, True), 0.15+i*0.13, 0.05, (i % 3-1)*0.5)          # fragments arrive
for k in range(9): put(sfx, glitch(), 0.8+k*0.18+0.85, 0.10, (k % 3-1)*0.4)                # broken data paths
for i in range(6): put(sfx, whoosh(0.35, False), Bq['cat']+0.35+i*0.11+0.6, 0.06, (i % 3-1)*0.4)  # grid lands
for t in (Bq['app']+0.9, Bq['dash']+0.8, Bq['dash']+1.0, Bq['subs']+0.9, C['IV']['total'], Bq['prof']+0.9):
    for j in range(6): put(sfx, blip(86+j % 3*3), t+j*0.09, 0.07)                           # data pulses on counters
q = C['QT']
for j in range(29): put(sfx, tick(), q['qty']+(q['qtyEnd']-q['qty'])*(j/29)**0.9, 0.18)      # quantity rolls 1→30
put(sfx, chime((84, 88, 91)), q['doc']+0.4, 0.22)                                              # quote saved
for a, b in C['NT']: put(sfx, chime((88, 91, 96), 1.0), b, 0.14)                               # workflow nodes complete
put(sfx, chime((86, 90, 93), 1.2), C['IV']['dl']+1.6, 0.18)                                    # download complete
put(sfx, chime((84, 88, 91, 96), 1.8), C['RC']['fixed'], 0.24)                                 # reconciliation aligned
for t in (C['BLD']['d1'], C['BLD']['d2'], C['BLD']['d3']): put(sfx, blip(76), t, 0.18); put(sfx, tick(), t+0.04, 0.2)  # magnetic snaps
put(sfx, chime((84, 88, 91, 96, 100), 2.4), 88.0, 0.22)                                        # CTA
sfx = reverb(sfx, 1.2, 0.18)

# ---------------- mix with voice-over (music ducks under the voice) ----------------
with wave.open(VO) as w: vo = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float32)/32768
vo = np.pad(vo, (0, max(0, N-len(vo))))[:N]
lvl = np.sqrt(lp(vo**2, 6, 1).clip(0))                     # loudness follower
act = (lvl > 0.01).astype(np.float32)
act = lp(act, 3, 1)                                        # smooth attack/release
duck = 1 - 0.55*np.clip(act*1.6, 0, 1)                     # ≈ −7 dB under speech
def norm(x, peak): return x/np.max(np.abs(x)+1e-9)*peak
music = norm(music, 0.9); sfx = norm(sfx, 0.9)
mix = music*0.42*duck[:, None] + sfx*0.30 + np.stack([vo, vo], 1)*0.95
mix = np.tanh(mix*1.1)/np.tanh(1.1)                         # soft limiter
def wr(path, x):
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1)*32767).astype('<i2').tobytes())
wr(OUTD+'music.wav', music*0.5); wr(OUTD+'sfx.wav', sfx*0.5); wr(OUTD+'mix.wav', mix)
print('audio written')
