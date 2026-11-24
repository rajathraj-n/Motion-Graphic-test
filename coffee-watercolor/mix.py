"""Score + foley for Where a Cup Begins. Reads events.json → out/mix.wav"""
import json, os
import numpy as np
from synth import *  # noqa: F401,F403

HERE = os.path.dirname(os.path.abspath(__file__))
E = json.load(open(os.path.join(HERE, 'events.json')))
DUR = E['dur']; EV = E['ev']
B = 60 / 84; BAR = 4 * B
N = int((DUR + 2) * SR)
mus = stereo(N); fx = stereo(N); bed = stereo(N)

# —— score: kalimba, felt piano, soft pad (C major / A minor) ——
CH = [[48, 60, 64, 67, 74], [45, 57, 60, 64, 67], [41, 57, 60, 64, 69], [43, 55, 59, 62, 67]]  # Cadd9, Am7, Fmaj7, G
def chord_at(t): return CH[int(t / BAR) % 4]

# opening motif on 3.6 (kalimba enters after the question)
for k, m in enumerate([72, 76, 79]): add(mus, kalimba(m, .5), 3.6 + k * B / 2, 1.0, -.2 + .2 * k)
t = 4.0 + 0.0
while t < 36.3:
    c = chord_at(t); bar_i = int(t / BAR); step = int(round((t % BAR) / (B / 2)))
    sect = 'branch' if t < 14 else 'lean' if t < 21 else 'roast' if t < 30 else 'cup'
    if sect == 'lean':
        if step % 2 == 0: add(mus, kalimba(c[1 + (step // 2) % 4] + 12, .45), t, 1.0, -.3 + .2 * ((step // 2) % 4))
    else:
        add(mus, kalimba(c[1 + step % 4] + (12 if step % 8 >= 4 else 0), .38 if step % 2 else .48), t, 1.0, -.35 + .1 * (step % 8))
    if step == 0:
        if sect != 'lean': add(mus, pad([c[0] + 12, c[2], c[3]], BAR + .4, .25), t, 1.0)
        if sect in ('roast', 'cup'): add(mus, felt_piano(c[0], .35, 3.0), t, 1.0, -.1)
    if sect in ('roast', 'cup') and step in (0, 3, 6):   # rising felt-piano line
        mel = [67, 69, 72, 74, 76, 79, 81, 79][(bar_i * 3 + step // 3) % 8]
        add(mus, felt_piano(mel, .42, 2.0), t, 1.0, .15)
    t += B / 2
# pull-back swell and the last note under the answer
add(mus, pad([48, 55, 64, 67, 72], 7.0, .5), 37.0, 1.0)
for k, m in enumerate([48, 55, 64, 67, 72]): add(mus, felt_piano(m, .45, 5.0), 37.0 + k * .06, 1.0, -.3 + .15 * k)
add(mus, kalimba(84, .55, 4.0), 39.2, 1.0, .2); add(mus, kalimba(79, .35, 4.0), 39.2 + B, 1.0, -.2)
mus = reverb(mus, decay=1.6, mix=.22)
# near silence before the pull-back (brush lifted)
a, b = int(36.3 * SR), int(37.0 * SR); f = int(.25 * SR)
mus[a - f:a] *= np.linspace(1, .08, f)[:, None]; mus[a:b] *= .08

# —— foley ——
rg = np.random.default_rng(5)
for e in EV:
    t, ty, d = e['t'], e['type'], e.get('d', .5)
    if ty == 'brush':
        n = max(1, int(d / .35))
        for k in range(n): add(fx, rustle(.45, .22, 1200, 5000), t + k * d / n, 1.0, rg.uniform(-.5, .5))
    elif ty == 'dab':
        for k in range(3): add(fx, rustle(.25, .25, 900, 4000), t + k * d / 3, 1.0, rg.uniform(-.4, .4))
    elif ty == 'pencil': add(fx, scratch(d, .2), t, 1.0, .3)
    elif ty == 'tilt': add(fx, slide(1.2, .12, 300, 1800), t, 1.0, 0)
    elif ty == 'pull': add(fx, slide(2.0, .18, 200, 2500), t, 1.0, 0)
    elif ty == 'pour': add(fx, pour(d, .5), t, 1.0, .1)
    elif ty == 'clink': add(fx, S(tap(.35, 3100), tap(.2, 4650)), t, 1.0, .1); add(fx, glock(95, .08, 1.0), t, 1.0, .1)
# beds: room throughout; birds and breeze at the branch; warm air + roast crackle at the swatches
r = room_bed(DUR + 2, .006, 400); bed[:len(r), 0] += r; bed[:len(r), 1] += r[::-1]
add(bed, slide(9.0, .05, 200, 1200), 5.5, 1.0, -.3)
for k in range(9): add(bed, bird(.09), 6.4 + k * .9 + rg.uniform(0, .4), 1.0, rg.uniform(-.8, .8))
add(bed, lp(noise(9.0), 400) * adsr(9.0, 1.0, 1.5) * .05, 21.0, 1.0)
for k in range(60): add(bed, tap(.05, rg.uniform(2500, 5000)), 24.2 + rg.uniform(0, 3.4), 1.0, rg.uniform(-.6, .6))

out = mus * .75 + fx + bed
out = out[:int(DUR * SR)]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
write(os.path.join(HERE, 'out', 'mix.wav'), out)
print('mix →', os.path.join(HERE, 'out', 'mix.wav'), f'{len(out) / SR:.2f}s')
