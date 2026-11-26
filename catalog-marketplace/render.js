// Renders composition/index.html frame-by-frame with Playwright and encodes with ffmpeg.
// usage: node render.js [--fps 30] [--scale 2] [--sub 2] [--out out/racknap-easy-catalog-marketplace-4k.mp4]
//        node render.js --stills 0.5,3.2,7.9 --scale 1   (preview stills only)
const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};
const FPS=+arg('fps',30), SCALE=+arg('scale',2), SUB=+arg('sub',2), DUR=15;
const OUT=arg('out','out/racknap-easy-catalog-marketplace-4k.mp4'), STILLS=arg('stills',null);
const ROOT=__dirname, FRAMES=arg('frames',path.join(ROOT,'.frames'));
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
  for(const t of [0,5,8.5,11]){ await page.evaluate(t=>window.seek(t),t);
    const bad=await page.evaluate(()=>forbiddenVisibleText()); if(bad.length){console.error('Visible prototype wording at',t,bad);process.exit(1)} }
  const stage=await page.$('#stage');
  if(STILLS){ fs.mkdirSync(path.join(ROOT,'out/stills'),{recursive:true});
    for(const t of STILLS.split(',').map(Number)){ await page.evaluate(t=>window.seek(t),t);
      await stage.screenshot({path:path.join(ROOT,`out/stills/t${t.toFixed(2)}.png`)}); console.log('still',t);}
    await browser.close(); srv.close(); return; }
  fs.rmSync(FRAMES,{recursive:true,force:true}); fs.mkdirSync(FRAMES,{recursive:true});
  const N=DUR*FPS*SUB; const t0=Date.now();
  for(let i=0;i<N;i++){
    // sub-frames sample a 180° shutter: offsets within the first half of each output frame
    const f=Math.floor(i/SUB), s=i%SUB, t=(f+ (SUB>1? s/(SUB)*0.5 : 0))/FPS;
    await page.evaluate(t=>window.seek(t),t);
    await stage.screenshot({path:path.join(FRAMES,`f${String(i).padStart(5,'0')}.png`)});
    if(i%60===0) console.log(`frame ${i}/${N}  ${((Date.now()-t0)/1000).toFixed(0)}s`);
  }
  await browser.close(); srv.close();
  fs.mkdirSync(path.dirname(path.join(ROOT,OUT)),{recursive:true});
  const vf=[]; if(SUB>1) vf.push(`tmix=frames=${SUB}`,`select='eq(mod(n\\,${SUB})\\,${SUB-1})'`,`setpts=N/(${FPS}*TB)`);
  vf.push('format=yuv420p');
  const ff=['-y','-framerate',String(FPS*SUB),'-i',path.join(FRAMES,'f%05d.png'),'-vf',vf.join(','),
    '-r',String(FPS),'-c:v','libx264','-preset','slow','-crf','14','-profile:v','high','-tune','animation',
    '-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart',path.join(ROOT,OUT)];
  const r=spawnSync('ffmpeg',ff,{stdio:'inherit'}); process.exit(r.status);
})();
