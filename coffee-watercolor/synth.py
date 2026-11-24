"""Small synthesized instrument kit for the coffee films (numpy only, no sample downloads).
Every function returns mono float64 at SR. Uses the library's sfx helpers for filters and noise."""
import os, sys
import numpy as np
sys.path.insert(0, os.path.join(os.environ['LIB'], 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, add, compress, limit  # noqa: E402

rng = np.random.default_rng(11)


def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)


def adsr(d, a=.005, r=.05):
    tt = t_(d); e = np.minimum(1, tt / max(a, 1e-4)) * np.minimum(1, np.maximum(0, (d - tt) / max(r, 1e-4)))
    return e


def partials(f, d, parts, attack=.002):
    """parts: [(ratio, amp, tau)]"""
    tt = t_(d); y = np.zeros_like(tt)
    for r, a, tau in parts:
        if f * r < SR / 2.2: y += a * np.sin(2 * np.pi * f * r * tt + rng.random() * 6) * np.exp(-tt / tau)
    return y * np.minimum(1, tt / attack)


# —— pitched ——
def marimba(m, v=1.0, d=1.2):
    f = mtof(m); y = partials(f, d, [(1, 1, .45 * (440 / f) ** .3), (3.93, .35, .08), (9.2, .08, .02)])
    y += lp(noise(d), 2500) * env_exp(d, .004) * .25
    return y * v


def glock(m, v=1.0, d=1.8):
    f = mtof(m); return partials(f, d, [(1, 1, .9), (2.76, .35, .25), (5.4, .2, .08), (8.9, .1, .03)]) * v


def kalimba(m, v=1.0, d=2.0):
    f = mtof(m); y = partials(f, d, [(1, 1, .7), (5.9, .25, .05), (13.1, .08, .015)], attack=.001)
    y += hp(noise(d), 3000) * env_exp(d, .002) * .15
    return y * v


def felt_piano(m, v=1.0, d=2.5):
    f = mtof(m); B = .0004
    parts = [(n * np.sqrt(1 + B * n * n), 1 / n ** 1.4, 1.6 / (1 + .5 * n)) for n in range(1, 9)]
    y = partials(f, d, parts, attack=.008)
    y += lp(noise(d), 600) * env_exp(d, .01) * .1      # felt thump
    return lp(y, 2200) * v


def harpsichord(m, v=1.0, d=1.4):
    f = mtof(m)
    parts = [(n * 1.0005 ** n, 1 / n ** .65, .9 / (1 + .35 * n)) for n in range(1, 24)]
    y = partials(f, d, parts, attack=.0015)
    y += bp(noise(d), 2000, 7000) * env_exp(d, .003) * .2   # quill pluck
    return hp(y, 90) * v


def celesta(m, v=1.0, d=1.6):
    f = mtof(m); return partials(f, d, [(1, 1, .7), (4.0, .18, .1), (10.1, .05, .02)]) * v


def bassoon(m, v=1.0, d=1.0):
    f = mtof(m); tt = t_(d)
    vib = 1 + .004 * np.sin(2 * np.pi * 5.2 * tt) * np.minimum(1, tt / .3)
    ph = np.cumsum(2 * np.pi * f * vib / SR)
    y = sum(np.sin(n * ph) / n ** .9 * (1.4 if n in (2, 3, 4) else 1) for n in range(1, 14) if f * n < 9000)
    y = bp(y, 120, 2400)
    return y * adsr(d, .05, .08) * v


def bass(m, v=1.0, d=.4):
    f = mtof(m); tt = t_(d)
    y = np.sin(2 * np.pi * f * tt) + .45 * np.sin(4 * np.pi * f * tt) + .25 * np.sin(6 * np.pi * f * tt)
    return y * adsr(d, .004, .05) * np.exp(-tt / (d * 1.5)) * v


def pad(ms, d, v=1.0):
    tt = t_(d); y = np.zeros_like(tt)
    for m in ms:
        f = mtof(m)
        for det in (-.004, 0, .004):
            ph = 2 * np.pi * f * (1 + det) * tt + rng.random() * 6
            y += np.sin(ph) + .3 * np.sin(2 * ph) + .12 * np.sin(3 * ph)
    y = lp(y, 1400) / (len(ms) * 3)
    return y * adsr(d, min(1.0, d / 3), min(1.2, d / 3)) * v


def sine_glide(f0, f1, d, v=1.0):
    tt = t_(d); f = f0 * (f1 / f0) ** (tt / d); ph = np.cumsum(2 * np.pi * f / SR)
    return np.sin(ph) * adsr(d, .05, .1) * v


# —— drums ——
def kick(v=1.0):
    d = .35; tt = t_(d); f = 48 + 90 * np.exp(-tt / .03)
    y = np.sin(np.cumsum(2 * np.pi * f / SR)) * np.exp(-tt / .12)
    y += .6 * np.sin(np.cumsum(2 * np.pi * f * 2 / SR)) * np.exp(-tt / .04)   # harmonic so it speaks on small speakers
    return (y + hp(noise(d), 3000) * env_exp(d, .002) * .2) * v


def hat(v=1.0, open_=False):
    d = .25 if open_ else .05; return hp(noise(d), 7000) * env_exp(d, .07 if open_ else .012) * v


def snare(v=1.0):
    d = .22; tt = t_(d)
    return (bp(noise(d), 1200, 6000) * env_exp(d, .05) + .5 * np.sin(2 * np.pi * 190 * tt) * env_exp(d, .03)) * v


def shaker(v=1.0):
    d = .09; return bp(noise(d), 4000, 10000) * adsr(d, .03, .05) * v


# —— foley ——
def tss(d=.4, v=1.0, lo=3500, hi=9000):
    tt = t_(d); return bp(noise(d), lo, hi) * np.minimum(1, tt / .02) * np.exp(-tt / (d * .5)) * v


def slide(d=.45, v=1.0, lo=500, hi=3000):
    tt = t_(d); e = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 1.5
    return bp(noise(d), lo, hi) * e * v


def thunk(v=1.0, f=90):
    d = .3; tt = t_(d); y = np.sin(2 * np.pi * f * tt * (1 + .5 * np.exp(-tt / .01))) * np.exp(-tt / .07)
    return (y + lp(noise(d), 1500) * env_exp(d, .01) * .6) * v


def snick(v=1.0):
    d = .08; tt = t_(d)
    return (hp(noise(d), 4000) * env_exp(d, .004) + .5 * np.sin(2 * np.pi * 5200 * tt) * env_exp(d, .01)) * v


def clack(v=1.0):
    d = .12; tt = t_(d)
    return (bp(noise(d), 800, 5000) * env_exp(d, .006) + .7 * np.sin(2 * np.pi * 1300 * tt) * env_exp(d, .012) + .5 * np.sin(2 * np.pi * 160 * tt) * env_exp(d, .02)) * v


def tap(v=1.0, f=1800):
    d = .05; tt = t_(d); return (np.sin(2 * np.pi * f * tt) * env_exp(d, .006) + bp(noise(d), 1500, 5000) * env_exp(d, .002) * .5) * v


def rustle(d=.6, v=1.0, lo=1500, hi=6000):
    tt = t_(d); trem = .6 + .4 * np.sin(2 * np.pi * 13 * tt + rng.random() * 6)
    e = np.sin(np.pi * np.clip(tt / d, 0, 1))
    return bp(noise(d), lo, hi) * trem * e * v


def scratch(d=.5, v=1.0):
    tt = t_(d); grain = (rng.random(len(tt)) > .7) * 1.0
    return bp(noise(d) * (.4 + grain), 2000, 6000) * adsr(d, .02, .05) * v


def pour(d=2.0, v=1.0):
    tt = t_(d); y = lp(noise(d), 1200) * .6
    # bubbly component: random short resonances
    for k in range(int(d * 40)):
        at = rng.random() * d; f = 400 + rng.random() * 900; dd = .04
        s = np.sin(2 * np.pi * f * (1 + 2 * t_(dd)) * t_(dd)) * env_exp(dd, .012) * .3
        i = int(at * SR); y[i:i + len(s)] += s[:max(0, len(y) - i)]
    return y * adsr(d, .1, .4) * v


def room_bed(d, v=1.0, f=300):
    return lp(noise(d), f) * v


def bird(v=1.0):
    d = .25; tt = t_(d); f = 3000 + 1200 * np.sin(2 * np.pi * 14 * tt) + 800 * (tt / d)
    return np.sin(np.cumsum(2 * np.pi * f / SR)) * adsr(d, .02, .08) * v


def reverb(x, sr=SR, decay=1.2, mix=.2, seed=3):
    r = np.random.default_rng(seed); n = int(decay * sr)
    ir = r.standard_normal(n) * np.exp(-np.arange(n) / (decay * sr / 6.9)); ir = lp(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
    from scipy.signal import fftconvolve
    out = np.stack([fftconvolve(x[:, c], ir * (1 if c == 0 else -1) if False else ir)[:len(x)] for c in range(2)], 1)
    return x * (1 - mix) + out * mix * 3


def stereo(n): return np.zeros((n, 2))


def write(path, buf):
    import soundfile as sf
    pk = np.abs(buf).max()
    if pk > 0: buf = buf / pk * .89
    sf.write(path, buf.astype(np.float32), SR, subtype='PCM_24')


def S(*xs):
    """Sum sounds of different lengths (padded to the longest)."""
    n = max(len(x) for x in xs); y = np.zeros(n)
    for x in xs: y[:len(x)] += x
    return y
