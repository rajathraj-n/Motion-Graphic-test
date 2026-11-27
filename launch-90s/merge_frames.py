"""Averages each frame's motion-blur samples (render.js) into .frames/out/fNNNNN.png."""
import sys, os, json, shutil
from multiprocessing import Pool
import numpy as np
from PIL import Image
D=sys.argv[1]; man=json.load(open(os.path.join(D,'manifest.json')))
def job(f):
    n=man[f]; src=[os.path.join(D,'sub',f'f{f:05d}_{k}.jpg') for k in range(n)]; dst=os.path.join(D,'out',f'f{f:05d}.png')
    if n==1: Image.open(src[0]).convert('RGB').save(dst,compress_level=1); os.remove(src[0]); return
    acc=None
    for p in src:
        a=np.asarray(Image.open(p).convert('RGB'),dtype=np.float32); acc=a if acc is None else acc+a
    Image.fromarray(np.clip(acc/n+0.5,0,255).astype(np.uint8)).save(dst,compress_level=1)
    for p in src: os.remove(p)
if __name__=='__main__':
    with Pool(max(1,os.cpu_count()-1)) as pool: pool.map(job,range(len(man)),chunksize=4)
    print('merged',len(man),'frames; samples total',sum(man))
