"""Score + foley for Specification for One Cup. Reads events.json → out/mix.wav"""
import json, os
import numpy as np
from synth import *  # noqa: F401,F403

HERE = os.path.dirname(os.path.abspath(__file__))
E = json.load(open(os.path.join(HERE, 'events.json')))
DUR = E['dur']; EV = E['ev']
B = .625; E8 = B / 2; BAR = 4 * B
N = int((DUR + 2) * SR)
mus = stereo(N); fx = stereo(N); bed = stereo(N)

# —— score: G minor two-voice invention on harpsichord; bassoon for the roaster; celesta for the gears ——
CH = [(43, [67, 70, 74, 79]), (48, [67, 72, 75, 79]), (50, [66, 69, 72, 74]), (43, [67, 70, 74, 79]),
      (39, [67, 70, 75, 79]), (48, [67, 72, 75, 79]), (50, [66, 69, 72, 74]), (43, [62, 67, 70, 74])]
MOT = [0, 1, 2, 3, 2, 1, 2, 0]           # arpeggio order per 8th
for bar in range(12):
    t0 = bar * BAR
    if t0 >= 28.75: break
    root, arp = CH[bar % 8]
    sect = 'inv' if t0 < 7.5 else 'roast' if t0 < 15 else 'gears' if t0 < 21.5 else 'full'
    for i in range(8):
        t = t0 + i * E8
        if t >= 28.75: break
        rit = 1 + max(0, t - 27.5) * .5   # written-out ritardando into the hold
        if t >= 1.25:
            m = arp[MOT[i]] + (12 if (sect == 'full' and i in (3, 4)) else 0)
            add(mus, harpsichord(m, .42 if i % 2 else .5, 1.0 * rit), t, 1.0, .25)
            if sect == 'gears':      # canon at the octave below, one beat later
                add(mus, harpsichord(m - 12, .3, 1.0), t + B, 1.0, -.25)
        if i % 2 == 0 and t >= 1.25:   # left hand: walking quarters
            lm = root + [0, 7, 12, 7][i // 2]
            add(mus, harpsichord(lm, .38, 1.2), t, 1.0, -.3)
    if sect in ('roast', 'full'):
        mel = [arp[2] - 12, arp[3] - 12, arp[1] - 12, arp[0] - 12]
        for j, m in enumerate(mel): add(mus, bassoon(m, .32, B * .95), t0 + j * B, 1.0, -.1)
# hold 28.75–30: near silence (paper only). suspended chord 30–32.5, cadence on the stamp
add(mus, bassoon(43, .3, 2.4), 30.05, 1.0, -.1); add(mus, bassoon(48, .22, 2.4), 30.05, 1.0, .1)
for k in range(8): add(mus, harpsichord([67, 72, 74][k % 3], .22, .8), 30.1 + k * E8, 1.0, .2)
for k, m in enumerate([50, 62, 66, 69, 72]): add(mus, harpsichord(m, .4, 1.2), 31.875 + k * .03, 1.0, -.3 + .15 * k)
for k, m in enumerate([43, 55, 62, 67, 70, 74, 79]): add(mus, harpsichord(m, .55, 3.5), 32.5 + k * .025, 1.0, -.4 + .13 * k)
add(mus, bassoon(43, .4, 3.0), 32.5, 1.0); add(mus, celesta(79, .3, 3.0), 32.5, 1.0, .3)
add(mus, celesta(86, .35, 4.0), 34.4, 1.0, .4); add(mus, celesta(79, .2, 4.0), 34.4 + B, 1.0, -.2)
mus = reverb(mus, decay=1.1, mix=.15)

# —— foley ——
rg = np.random.default_rng(3)
for e in EV:
    t, ty, d, v = e['t'], e['type'], e.get('d', .4), e.get('v', 1.0)
    if ty == 'pen': add(fx, scratch(d, .2 * v), t, 1.0, rg.uniform(-.4, .4))
    elif ty == 'compass': add(fx, S(scratch(d, .14), sine_glide(2600, 3100, d, .02)), t, 1.0, -.2)
    elif ty == 'hatch':
        for k in range(10): add(fx, scratch(.05, .2), t + k * d / 10, 1.0, .1)
    elif ty == 'letter':
        for k in range(6): add(fx, scratch(.08, .17), t + k * .11, 1.0, .35)
    elif ty == 'travel': add(fx, slide(d, .12, 600, 3000), t, 1.0, 0); add(fx, tap(.2, 2400), t + d, 1.0)
    elif ty == 'tick': add(fx, S(tap(.22, 3600), tap(.1, 5200)), t, 1.0, .2)
    elif ty == 'burner': add(bed, hp(noise(d), 2500) * adsr(d, .3, .6) * .02, t, 1.0, 0); add(bed, lp(noise(d), 200) * adsr(d, .3, .6) * .06, t, 1.0)
    elif ty == 'needle': add(fx, sine_glide(500, 1400, d, .05), t, 1.0, .3)
    elif ty == 'ding': add(fx, celesta(91, .2, 1.0), t, 1.0, .3)
    elif ty == 'gear': add(fx, S(clack(.25), tap(.12, 4200)), t, 1.0, .15)
    elif ty == 'grounds':
        for k in range(int(d * 30)): add(fx, tap(.05, rg.uniform(1500, 4000)), t + rg.uniform(0, d), 1.0, rg.uniform(-.3, .5))
    elif ty == 'cut': add(fx, slide(.18, .15, 1500, 6000), t - .06, 1.0)
    elif ty == 'section': add(fx, tss(d, .12, 3000, 9000), t, 1.0, 0)
    elif ty == 'trickle': add(fx, pour(d, .28), t, 1.0, .1)
    elif ty == 'slap': add(fx, S(thunk(.4, 110), slide(.3, .3, 300, 2500)), t + .9, 1.0)
    elif ty == 'stamp': add(fx, thunk(1.0, 75), t, 1.0, .3); add(fx, clack(.5), t, 1.0, .3)
    elif ty == 'ring': add(fx, S(thunk(.35, 180), tap(.15, 2900)), t - .05, 1.0, .3)
r = room_bed(DUR + 2, .006, 350); bed[:len(r), 0] += r; bed[:len(r), 1] += r[::-1]
for k in range(6): add(bed, slide(.2, .05, 2000, 6000), 28.9 + k * .2 + rg.uniform(0, .1), 1.0, rg.uniform(-.5, .5))   # paper only in the hold

out = mus * .8 + fx + bed
out = out[:int(DUR * SR)]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
write(os.path.join(HERE, 'out', 'mix.wav'), out)
print('mix →', os.path.join(HERE, 'out', 'mix.wav'), f'{len(out) / SR:.2f}s')
