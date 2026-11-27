"""Voice-over: Piper neural TTS, voice en_US-john-medium (public-domain dataset, see assets/VOICE_MODEL_CARD.txt).
Each line is synthesised separately, speed-fitted to its slot and placed on the timeline.
Usage: python3 audio/vo.py <model.onnx> <out.wav>   (writes 48 kHz mono + out.json with placements)"""
import sys, json, subprocess, wave, os, tempfile
import numpy as np
MODEL, OUT = sys.argv[1], sys.argv[2]
SR = 48000
# (start s, latest end s, text)
LINES = [
 (0.6,  8.5,  "Spreadsheets. Vendor portals. Billing that doesn't add up. Running a cloud business shouldn't feel like this."),
 (8.95, 13.1, "Meet RackNap Easy. One platform, from quote to cash."),
 (13.5, 19.6, "See subscription value, billing and gross profit, the moment you sign in."),
 (20.4, 25.7, "Every customer in one view: subscriptions, quotes, invoices and status."),
 (26.5, 33.6, "Discover every vendor's products in one catalog, with clear dollar pricing. Add the right one in a click."),
 (34.4, 39.7, "Then publish a branded storefront, just by dragging components into place."),
 (40.4, 46.7, "Build an accurate quote. Pick the customer, set the quantity, and watch the total and margin update instantly."),
 (47.4, 53.7, "Accept it, and the quote becomes an order, then an active subscription. All connected."),
 (54.4, 60.7, "Track every subscription, renewal date and recurring charge, from one place."),
 (61.4, 67.7, "Invoices are built from the subscriptions themselves. Check the totals, then export the data in a click."),
 (68.4, 74.8, "Reconciliation compares vendor and customer billing, so no unbilled seat slips through."),
 (75.4, 82.6, "And profitability shows revenue, cost and margin for every customer, with every module connected."),
 (84.1, 85.15, "RackNap Easy."),
 (85.25, 86.15, "Sell smarter."),
 (86.2, 87.2, "Operate simpler."),
 (87.22, 88.05, "Grow faster."),
 (88.15, 89.75, "Discover RackNap Easy."),
]
def synth(text, length_scale):
    fd, path = tempfile.mkstemp(suffix='.wav'); os.close(fd)
    subprocess.run([sys.executable, '-m', 'piper', '-m', MODEL, '-f', path, '--length-scale', str(length_scale), '--sentence-silence', '0.18'],
                   input=text.encode(), check=True, capture_output=True)
    with wave.open(path) as w:
        sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float32) / 32768
    os.remove(path)
    # trim leading/trailing silence
    nz = np.where(np.abs(a) > 0.01)[0]
    a = a[max(0, nz[0]-int(0.02*sr)): nz[-1]+int(0.08*sr)] if len(nz) else a
    # resample to 48 kHz
    x = np.linspace(0, len(a)-1, int(len(a)*SR/sr)); a = np.interp(x, np.arange(len(a)), a)
    return a
track = np.zeros(int(91*SR), np.float32); place = []
for start, end, text in LINES:
    slot = end - start; ls = 0.98
    a = synth(text, ls)
    while len(a)/SR > slot and ls > 0.84:
        ls -= 0.04; a = synth(text, ls)
    dur = len(a)/SR
    if dur > slot: print(f'WARNING: line overruns by {dur-slot:.2f}s: {text}')
    i = int(start*SR); track[i:i+len(a)] += a
    place.append({'start': start, 'end': round(start+dur, 3), 'slot_end': end, 'length_scale': round(ls, 2), 'text': text})
    print(f'{start:6.2f}–{start+dur:6.2f}s (slot {end:5.2f}) ls={ls:.2f}  {text}')
track = track[:int(90*SR)]
# gentle broadcast EQ: high-pass 90 Hz, presence lift via simple shelving
def hp(x, fc):
    rc = 1/(2*np.pi*fc); dt = 1/SR; a = rc/(rc+dt); y = np.zeros_like(x); prev = 0; px = 0
    for n in range(len(x)): y[n] = a*(prev + x[n] - px); prev = y[n]; px = x[n]
    return y
track = hp(track, 90)
track /= max(1e-9, np.max(np.abs(track))); track *= 0.89
with wave.open(OUT, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((track*32767).astype('<i2').tobytes())
json.dump(place, open(OUT.replace('.wav', '.json'), 'w'), indent=1)
