"""Synthesises a 15 s, 48 kHz stereo bed: soft 118 BPM electronic pulse + pad,
UI clicks and whooshes locked to the composition timeline. Placeholder for a
licensed track / voiceover — replace freely. Usage: python3 audio.py out/sfx_music.wav"""
import sys, wave, numpy as np
SR=48000; DUR=15.0; N=int(SR*DUR); t=np.arange(N)/SR
rng=np.random.default_rng(7)
L=np.zeros(N); R=np.zeros(N)
def add(sig,start,gain=1.0,pan=0.0):
    i=int(start*SR); n=min(len(sig),N-i)
    if n<=0: return
    L[i:i+n]+=sig[:n]*gain*np.sqrt((1-pan)/2); R[i:i+n]+=sig[:n]*gain*np.sqrt((1+pan)/2)
def env(n,a,d):  # attack/decay in seconds
    x=np.arange(n)/SR; return np.minimum(1,x/max(a,1e-4))*np.exp(-x/d)
def lp(x,k):  # one-pole lowpass, k in (0,1]
    y=np.empty_like(x); acc=0.0
    for i,v in enumerate(x): acc+=k*(v-acc); y[i]=acc
    return y
BPM=118; beat=60/BPM
# --- pad: Fmaj9 -> Dm9 -> Bbmaj7 -> C (2 bars each ~4.07s), soft detuned saws through lowpass
chords=[[53,57,60,64,67],[50,53,57,60,64],[46,50,53,57,62],[48,52,55,60,62]]
pad=np.zeros(N); bar=4*beat
for ci in range(4):
    st=ci*2*bar; ln=min(2*bar+0.4,DUR-st)
    if ln<=0: break
    n=int(ln*SR); x=np.arange(n)/SR; s=np.zeros(n)
    for m in chords[ci]:
        f=440*2**((m-69)/12)
        for det in (-0.12,0.0,0.13):
            ph=rng.random(); s+=2*((x*f*(1+det/100)+ph)%1)-1
    s/=len(chords[ci])*3
    e=np.minimum(1,x/0.6)*np.minimum(1,(ln-x)/0.5)
    i=int(st*SR); pad[i:i+n]+=s*e
pad=lp(lp(pad,0.035),0.06)
fade=np.minimum(1,t/1.2)*np.clip((DUR-t)/1.6,0,1)
add(pad*fade,0,0.55)
# --- soft kick + closed hat + sub pulse from bar 2, drop-out for the hero tail
def kick():
    n=int(.35*SR); x=np.arange(n)/SR; f=48+90*np.exp(-x*28)
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*9)
def hat():
    n=int(.07*SR); return lp(rng.standard_normal(n),0.9)*env(n,.001,.018)-lp(rng.standard_normal(n),0.2)*env(n,.001,.018)*0.0
k=kick(); h=hat()
for b in range(int(DUR/beat)+1):
    tb=b*beat
    if tb<2.0 or tb>13.4: continue
    add(k,tb,0.42)
    add(h,tb+beat/2,0.10,0.3 if b%2 else -0.3)
# --- UI clicks (cursor presses) and whooshes (scene moves)
def click():
    n=int(.045*SR); x=np.arange(n)/SR
    return (np.sin(2*np.pi*2400*x)*0.5+lp(rng.standard_normal(n),0.5))*env(n,.0005,.006)
def whoosh(d=0.9,up=True):
    n=int(d*SR); x=np.arange(n)/SR; nz=rng.standard_normal(n)
    sweep=np.linspace(0.02,0.18,n) if up else np.linspace(0.18,0.02,n)
    y=np.empty(n); acc=0.0
    for i in range(n): acc+=sweep[i]*(nz[i]-acc); y[i]=acc
    shape=np.sin(np.pi*np.clip(x/d,0,1))**2
    return y*shape
for ct in (4.62,7.55,9.72): add(click(),ct-0.01,0.55,0.15)
# whooshes: opening drift, cards gather, push-in, filter lift-away, card lifts out, settles, cards fly back, pull-back
for wt,d,g,up in ((0.0,1.2,0.16,True),(0.95,1.25,0.30,True),(2.95,0.8,0.20,True),(4.6,0.55,0.12,True),(6.35,0.75,0.24,True),
                  (7.98,0.7,0.18,False),(9.85,0.9,0.24,True),(12.15,1.4,0.28,False)):
    add(whoosh(d,up),wt,g)
# soft ticks as each card lands in the grid (opening) and as returning cards land
def tick():
    n=int(.03*SR); x=np.arange(n)/SR
    return np.sin(2*np.pi*1800*x)*env(n,.0005,.005)
for i in range(6): add(tick(),2.02+i*0.075,0.22,(i-2.5)/4)
for i in range(3): add(tick(),9.88+i*0.09+0.85,0.18,0.2)
# soft riser into the hero + gentle tail chime
n=int(1.2*SR); x=np.arange(n)/SR; chime=sum(np.sin(2*np.pi*f*x)*np.exp(-x*a) for f,a in ((1046.5,3.2),(1568,4.0),(2093,5.5)))/3
add(chime*np.minimum(1,x/0.004),12.62,0.10,-0.1)
mix=np.stack([L,R],1)
mix/=np.max(np.abs(mix))+1e-9; mix*=10**(-3/20)
with wave.open(sys.argv[1] if len(sys.argv)>1 else 'out/sfx_music.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix*32767).astype('<i2').tobytes())
print('ok')
