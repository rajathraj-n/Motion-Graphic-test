"""Score + foley for Seven Steps to a Cup. Reads events.json (exported from the page) → out/mix.wav"""
import json, os
import numpy as np
from synth import *  # noqa: F401,F403

HERE = os.path.dirname(os.path.abspath(__file__))
E = json.load(open(os.path.join(HERE, 'events.json')))
DUR = E['dur']; EV = E['ev']
BEAT = 0.5; BAR = 2.0
N = int((DUR + 1) * SR)
mus = stereo(N); fx = stereo(N)

# —— score: 120 bpm motorik in D dorian; one instrument joins per rule ——
PROG = [(50, [62, 65, 69, 72]), (50, [62, 65, 69, 74]), (46, [62, 65, 70, 74]), (48, [64, 67, 72, 76])]   # root, arpeggio tones
def chord(bar): return PROG[bar % 4]

def section(t):
    if t < 2: return 'intro'
    if t < 6: return 's1'
    if t < 10: return 's2'
    if t < 14: return 's3'
    if t < 18: return 's4'
    if t < 19: return 'silence'
    if t < 23: return 'full'
    if t < 27: return 'thin'
    if t < 31: return 'full'
    if t < 34: return 'out'
    return 'end'

for b in range(19):
    t0 = b * BAR; root, arp = chord(b)
    for i in range(16):   # 16ths
        t = t0 + i * BEAT / 4; s = section(t)
        if s in ('intro', 'silence', 'end'): continue
        # marimba ostinato on 8ths (16ths in the full sections)
        if i % 2 == 0 or s == 'full':
            m = arp[(i // (1 if s == 'full' else 2)) % 4] + (12 if (s == 'full' and i % 4 == 3) else 0)
            add(mus, marimba(m, .5 if i % 4 else .65), t, 1.0, -.25 + .5 * ((i // 2) % 2))
        if s in ('s2', 's3', 's4', 'full') and i % 4 == 0: add(mus, kick(.9), t, 1.0)
        if s in ('s3', 's4', 'full', 'thin') and i % 2 == 0: add(mus, bass(root - 12 + (12 if i % 4 == 2 else 0), .55, .22), t, 1.0)
        if s in ('s4', 'full') and i % 2 == 1: add(mus, hat(.25), t, 1.0, .3)
        if s in ('s4', 'full') and i in (4, 12): add(mus, snare(.35), t, 1.0, -.1)
        if s == 'full' and i == 0: add(mus, glock(arp[3] + 12, .3), t, 1.0, .4)
        if s == 'out' and i % 4 == 0:
            add(mus, marimba(arp[(i // 4) % 4], .45), t, 1.0, -.2)
            if i == 0: add(mus, bass(root - 12, .5, 1.6), t, 1.0)
# final chord on 34.0, rolled
for k, m in enumerate([50, 57, 62, 65, 69, 74]):
    add(mus, marimba(m, .6, 3.5), 34.0 + k * .03, 1.0, -.4 + k * .16)
add(mus, glock(81, .35, 3.5), 34.5, 1.0, .3)
add(mus, bass(38, .6, 3.0), 34.0, 1.0)

# —— foley from the page's events ——
for e in EV:
    t, ty, v = e['t'], e['type'], e.get('v', 1.0)
    if ty == 'glide':   # the exception is the only element that sings
        d = e['t1'] - t; add(fx, sine_glide(660, 990 if d > 1 else 880, d, .12), t, 1.0, 0)
    elif ty == 'grid': add(fx, tss(.5, .35), t, 1.0, -.3); add(fx, tss(.5, .3), t + .05, 1.0, .3)
    elif ty == 'numeral': add(fx, thunk(.8, 95), t, 1.0, -.2); add(fx, clack(.4), t, 1.0, -.2)
    elif ty == 'pen': add(fx, tss(.3, .2, 4000, 10000), t, 1.0, -.3)
    elif ty == 'pan': add(fx, slide(.5, .35), t, 1.0, .2)
    elif ty == 'snap': add(fx, clack(.55 * v), t, 1.0, .3); add(fx, thunk(.35 * v, 120), t, 1.0, .3)
    elif ty == 'knife': add(fx, tss(.22, .45 * v, 3000, 11000), t, 1.0, .2); add(fx, snick(.5 * v), t + .2, 1.0, .2)
    elif ty == 'slide': add(fx, slide(.5, .3, 300, 2000), t, 1.0, .3)
    elif ty == 'tick': add(fx, tap(.18, 2400), t, 1.0, .35)
    elif ty == 'big':
        add(fx, thunk(1.3, 55), t, 1.0); add(fx, clack(.8), t, 1.0); add(fx, lp(noise(1.6), 200) * env_exp(1.6, .5) * .5, t, 1.0)
    elif ty == 'clack': add(fx, clack(.45 * v), t, 1.0, .3)
    elif ty in ('rotate', 'push', 'pull'): add(fx, slide(.6, .3, 200, 1500), t, 1.0, 0)
    elif ty == 'tap': add(fx, tap(.12, 1500 + 600 * np.random.default_rng(int(t * 100)).random()), t, 1.0, (t * 7 % 2) - 1)
    elif ty == 'land': add(fx, thunk(.6, 70), t, 1.0, .2); add(fx, tap(.15, 900), t, 1.0, .2)

# dry room tone, very low; a low roast rumble under 19–23
room = stereo(N); r = room_bed(DUR + 1, .004, 250); room[:len(r), 0] += r; room[:len(r), 1] += r[::-1]
add(room, lp(noise(4.0), 160) * adsr(4.0, .3, 1.0) * .05, 19.0, 1.0)

# hard stop: silence 18.0–19.0 in the music (marimba tails cut on the downbeat)
a, b = int(18.0 * SR), int(19.0 * SR); fade = int(.01 * SR)
mus[a:a + fade] *= np.linspace(1, 0, fade)[:, None]; mus[a + fade:b] = 0

out = mus * .8 + fx * 1.0 + room
out = out[:int(DUR * SR)]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
write(os.path.join(HERE, 'out', 'mix.wav'), out)
print('mix →', os.path.join(HERE, 'out', 'mix.wav'), f'{len(out) / SR:.2f}s')
