// Renders composition/index.html frame-by-frame with Playwright and encodes with ffmpeg.
// usage: node render.js [--fps 30] [--scale 2] [--sub 2] [--out out/racknap-easy-catalog-marketplace-4k.mp4]
//        node render.js --stills 0.5,3.2,7.9 --scale 1   (preview stills only)
const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};
const FPS=+arg('fps',30), SCALE=+arg('scale',2), SUB=+arg('sub',2) /* 1 = no motion blur */, DUR=15;
const OUT=arg('out','out/racknap-easy-catalog-marketplace-4k.mp4'), STILLS=arg('stills',null);
const ROOT=__dirname, FRAMES=arg('frames',path.join(ROOT,'.frames'));
const WORKERS=+arg('workers',1), RANGE=arg('range',null), IS_WORKER=!!RANGE;
if(WORKERS>1 && !IS_WORKER){ // parallel driver: split frames across child renderers, then merge + encode
  const {spawn}=require('child_process'); const NF=DUR*FPS; const per=Math.ceil(NF/WORKERS);
  if(!IS_WORKER){ fs.rmSync(FRAMES,{recursive:true,force:true}); fs.mkdirSync(path.join(FRAMES,'sub'),{recursive:true}); fs.mkdirSync(path.join(FRAMES,'out'),{recursive:true}); }
  const pass=process.argv.slice(2).filter((x,i,a)=>!(x==='--workers'||a[i-1]==='--workers'));
  let left=WORKERS, fail=0;
  for(let w=0;w<WORKERS;w++){ const r=`${w*per}:${Math.min(NF,(w+1)*per)}`;
    const c=spawn(process.execPath,[__filename,...pass,'--range',r],{stdio:['ignore','inherit','inherit']});
    c.on('exit',code=>{ if(code) fail=1; if(--left===0) finish(); }); }
  function finish(){ if(fail) process.exit(1);
    let man=[]; for(let w=0;w<WORKERS;w++) man=man.concat(JSON.parse(fs.readFileSync(path.join(FRAMES,`manifest_${w*per}.json`))));
    fs.writeFileSync(path.join(FRAMES,'manifest.json'),JSON.stringify(man));
    let r=spawnSync('python3',[path.join(ROOT,'merge_frames.py'),FRAMES],{stdio:'inherit'}); if(r.status) process.exit(r.status);
    fs.mkdirSync(path.dirname(path.join(ROOT,OUT)),{recursive:true});
    r=spawnSync('ffmpeg',['-y','-framerate',String(FPS),'-i',path.join(FRAMES,'out','f%05d.png'),'-vf','format=yuv420p','-r',String(FPS),'-c:v','libx264','-preset','slow','-crf','14','-profile:v','high','-tune','animation',
      '-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart',path.join(ROOT,OUT)],{stdio:'inherit'});
    process.exit(r.status); }
  return;
}
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png'};
const srv=http.createServer((q,r)=>{const p=path.join(ROOT,decodeURIComponent(q.url.split('?')[0].split('#')[0]));
  fs.readFile(p,(e,b)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':types[path.extname(p)]||'application/octet-stream'});r.end(b)})});
(async()=>{
  await new Promise(r=>srv.listen(0,r)); const port=srv.address().port;
  const browser=await chromium.launch({args:['--force-color-profile=srgb','--disable-lcd-text','--font-render-hinting=none']});
  const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:SCALE});
  await page.goto(`http://localhost:${port}/composition/index.html`);
  await page.evaluate(()=>window.ready);
  // guard: no prototype wording may be visible in any interaction state
  for(const t of (IS_WORKER&&!RANGE.startsWith('0:'))?[]:[0.5,1.5,4.8,7.5,8.5,10.2,11,14]){ await page.evaluate(t=>window.seek(t),t);
    const bad=await page.evaluate(()=>forbiddenVisibleText()); if(bad.length){console.error('Visible prototype wording at',t,bad);process.exit(1)} }
  const stage=await page.$('#stage');
  if(STILLS){ fs.mkdirSync(path.join(ROOT,'out/stills'),{recursive:true});
    for(const t of STILLS.split(',').map(Number)){ await page.evaluate(t=>window.seek(t),t);
      await stage.screenshot({path:path.join(ROOT,`out/stills/t${t.toFixed(2)}.png`)}); console.log('still',t);}
    await browser.close(); srv.close(); return; }
  if(!IS_WORKER){ fs.rmSync(FRAMES,{recursive:true,force:true}); fs.mkdirSync(path.join(FRAMES,'sub'),{recursive:true}); fs.mkdirSync(path.join(FRAMES,'out'),{recursive:true}); }
  // Adaptive motion blur: each frame gets enough samples across a 180-degree shutter
  // that no element moves more than ~STEP px (CSS) between samples. Still frames get 1.
  const NF=DUR*FPS, SH=0.5/FPS, STEP=+arg('step',1.2), MAXN=+arg('maxn',10); const manifest=[]; const t0=Date.now(); let shots=0;
  const [FA,FB]=IS_WORKER?RANGE.split(':').map(Number):[0,NF];
  for(let f=FA;f<FB;f++){
    const ta=f/FPS;
    let N=1;
    if(SUB>1){ const a=await page.evaluate(t=>trackPoints(t),ta), b=await page.evaluate(t=>trackPoints(t),ta+SH);
      let d=0; for(let i=0;i<a.length;i++) d=Math.max(d,Math.hypot(a[i][0]-b[i][0],a[i][1]-b[i][1]));
      N=Math.max(1,Math.min(MAXN,Math.ceil(d/STEP))); }
    for(let k=0;k<N;k++){
      await page.evaluate(t=>window.seek(t),ta+(N>1?k/(N-1):0)*SH*(N>1?1:0));
      await stage.screenshot({path:path.join(FRAMES,'sub',`f${String(f).padStart(5,'0')}_${k}.jpg`),type:'jpeg',quality:96}); shots++;
    }
    manifest.push(N);
    if(f%30===0) console.log(`frame ${f}/${NF}  samples=${N}  shots=${shots}  ${((Date.now()-t0)/1000).toFixed(0)}s`);
  }
  if(IS_WORKER){ fs.writeFileSync(path.join(FRAMES,`manifest_${FA}.json`),JSON.stringify(manifest)); await browser.close(); srv.close(); process.exit(0); }
  fs.writeFileSync(path.join(FRAMES,'manifest.json'),JSON.stringify(manifest));
  { const r=spawnSync('python3',[path.join(ROOT,'merge_frames.py'),FRAMES],{stdio:'inherit'}); if(r.status) process.exit(r.status); }
  await browser.close(); srv.close();
  fs.mkdirSync(path.dirname(path.join(ROOT,OUT)),{recursive:true});
  const ff=['-y','-framerate',String(FPS),'-i',path.join(FRAMES,'out','f%05d.png'),'-vf','format=yuv420p',
    '-r',String(FPS),'-c:v','libx264','-preset','slow','-crf','14','-profile:v','high','-tune','animation',
    '-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart',path.join(ROOT,OUT)];
  const r=spawnSync('ffmpeg',ff,{stdio:'inherit'}); process.exit(r.status);
})();
