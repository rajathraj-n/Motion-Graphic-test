// Exports assets + per-frame animation data for the v2 After Effects build.
//   node ae/v2/export-v2.js   -> ae/v2/assets/*.png, ae/v2/data.json
const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const ROOT=path.join(__dirname,'..','..'), OUT=path.join(__dirname,'assets');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png'};
const srv=http.createServer((q,r)=>{const p=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(p,(e,b)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':types[path.extname(p)]||'application/octet-stream'});r.end(b)})});
const FPS=30, NF=450;

(async()=>{
  await new Promise(r=>srv.listen(0,r)); const url=`http://localhost:${srv.address().port}/composition/index.html`;
  fs.rmSync(OUT,{recursive:true,force:true}); fs.mkdirSync(OUT,{recursive:true});
  const browser=await chromium.launch({args:['--force-color-profile=srgb','--disable-lcd-text','--font-render-hinting=none']});

  /* ---------- 1. per-frame samples ---------- */
  const pg=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  await pg.goto(url); await pg.evaluate(()=>window.ready);
  const D=await pg.evaluate(({NF,FPS})=>{
    const out={frames:[], G:{cards:G.cards,cartAll:G.cartAll,cartProd:G.cartProd,chips:rectB(doc.querySelector('.filters-inline'))},
      T:{...T}, stats:STATS, vendors:[...document.querySelectorAll('#vendors')].map(v=>v.textContent)[0]};
    const N=s=>((s||'').match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi)||[]).map(Number);
    const ty=s=>{const m=/translate3d\(([^)]*)\)/.exec(s||''); if(!m) return [0,0]; const n=N(m[1]); return [n[0]||0,n[1]||0,n[2]||0];};
    const fn=(s,name)=>{const m=new RegExp(name+'\\(([^)]*)\\)').exec(s||''); return m?N(m[1])[0]:1;};
    const num=v=>v===''||v==null?1:+v;
    for(let f=0;f<=NF;f++){
      const t=f/FPS; window.seek(t);
      const c=camAt(t), k=cursorAt(t);
      const rec={t,cam:{ax:c.ax,ay:c.ay,fx:c.fx,fy:c.fy,s:c.s,rx:c.rx,ry:c.ry,rz:c.rz}};
      const win=document.getElementById('win').style; rec.win={o:num(win.opacity),z:ty(win.transform)[2]};
      rec.cards=cards.map(el=>({o:num(el.style.opacity),y:ty(el.style.transform)[1]}));
      rec.liftP=liftPremium(t);
      rec.liftB=ease(t,T.hoverBackup-.06,T.hoverBackup+.3,E.outSoft)*(1-ease(t,T.cursorOut-.2,T.cursorOut+.25,E.smooth));
      rec.btnHover=premiumBtn.classList.contains('is-hover')?1:0; rec.added=t>=T.clickAdd?1:0;
      rec.chips=chips.map(ch=>(ch.classList.contains('active')?'A':'-')+(ch.classList.contains('is-hover')?'H':'-')).join('');
      rec.cart={on:cart.style.display!=='none'?1:0,o:num(cart.style.opacity),y:ty(cart.style.transform)[1]};
      rec.clones=clones.map(cl=>{const P=clonePose(cl.i,t); return P?{x:P.x,y:P.y,z:P.z,rx:P.rx,ry:P.ry,rz:P.rz,s:P.s,o:P.o,sh:P.sh,hover:P.hover?1:0}:null;});
      rec.cursor={x:k.x,y:k.y,z:k.z,o:k.o,
        press:[T.clickProd,T.clickAdd,T.clickAll].some(ct=>t>=ct-0.1&&t<ct+0.03)?0.86:1,
        hand:((t>=4.25&&t<5.0)||(t>=6.95&&t<8.9)||(t>=9.42&&t<10.1))?1:0, sz:Math.pow(c.s,-0.55)*1.05};
      rec.dim=+document.getElementById('dim').style.opacity||0;
      const sh=document.getElementById('sheen').style; rec.sheen={o:+sh.opacity||0,x:ty(sh.transform)[0]};
      rec.bg=(()=>{const s=document.getElementById('bg').style.transform; const p=ty(s); return {x:p[0],y:p[1],s:fn(s,'scale')};})();
      const gl=document.getElementById('glow').style; rec.glow={x:ty(gl.transform)[0],y:ty(gl.transform)[1],o:+gl.opacity};
      rec.copyX=ty(document.getElementById('copy').style.transform)[0];
      rec.mo=1-ease(t,0.9,2.0,E.smooth);
      rec.hair=parseFloat(document.getElementById('hairline').style.width)||0;
      // callouts
      rec.callouts=[...document.querySelectorAll('.callout')].map(n=>{
        if(n.style.display==='none') return null;
        const d=n.querySelector('.dot').style, l=n.querySelector('.line').style, lab=n.querySelector('.label').style;
        const sc=s=>fn(s,'scale'), sx=s=>fn(s,'scaleX');
        return {dx:parseFloat(d.left),dy:parseFloat(d.top),ds:sc(d.transform),lx:parseFloat(l.left),ly:parseFloat(l.top),lw:parseFloat(l.width),ls:sx(l.transform),
          bx:parseFloat(lab.left),by:parseFloat(lab.top),
          k:ty(n.querySelector('.k span').style.transform)[1],v:ty(n.querySelector('.v span').style.transform)[1]};
      });
      // copy: per block, per moving part, the translate % or px
      rec.copy=BLOCKS.map(B=>{const el=document.getElementById(B.id); if(el.style.visibility!=='visible') return null;
        return {lines:[...el.querySelectorAll('.ln > span')].map(s=>ty(s.style.transform)[1]),
          bar:el.querySelector('.bar')?fn(el.querySelector('.bar').style.transform,'scaleX'):null,
          lbl:el.querySelector('.lbl span')?ty(el.querySelector('.lbl span').style.transform)[1]:null,
          sub:el.querySelector('.sub span')?ty(el.querySelector('.sub span').style.transform)[1]:null,
          logo:el.querySelector('.logo')?{o:+el.querySelector('.logo').style.opacity,y:ty(el.querySelector('.logo').style.transform)[1]}:null,
          stats:[...el.querySelectorAll('.stat')].map(s=>({y:ty(s.firstElementChild.style.transform)[1],n:+s.querySelector('b').textContent})),
          vend:el.querySelector('.vendors span')?ty(el.querySelector('.vendors span').style.transform)[1]:null};});
      out.frames.push(rec);
    }
    out.calloutText=CALLOUTS.map(o=>({k:o.k.toUpperCase(),v:o.v}));
    return out;
  },{NF,FPS});

  /* ---------- 2. rest-position geometry of the editorial copy (stage CSS px) ---------- */
  D.copyGeo=await pg.evaluate(()=>{
    document.getElementById('copy').style.transform='none';
    const sr=document.getElementById('stage').getBoundingClientRect();
    const R=el=>{const r=el.getBoundingClientRect();return {x:r.left-sr.left,y:r.top-sr.top,w:r.width,h:r.height}};
    const baseline=el=>{const i=document.createElement('i');i.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';el.appendChild(i);const y=i.getBoundingClientRect().top-sr.top;i.remove();return y};
    return BLOCKS.map(B=>{ const el=document.getElementById(B.id); el.style.visibility='visible';
      el.querySelectorAll('span,img,div').forEach(s=>{s.style.transform='none';});
      const g={id:B.id,in:B.in,out:B.out,lines:[]};
      el.querySelectorAll('.ln').forEach(ln=>{const sp=ln.firstElementChild; g.lines.push({text:sp.textContent,accent:!!sp.querySelector('em'),box:R(ln),h:sp.getBoundingClientRect().height,base:baseline(sp),x:R(sp).x});});
      const bar=el.querySelector('.bar'); if(bar){ g.bar=R(bar); const l=el.querySelector('.lbl'); g.lbl={text:l.textContent.toUpperCase(),box:R(l),h:l.firstElementChild.getBoundingClientRect().height,base:baseline(l.firstElementChild),x:R(l.firstElementChild).x}; }
      const sub=el.querySelector('.sub'); if(sub) g.sub={text:sub.textContent,box:R(sub),h:sub.firstElementChild.getBoundingClientRect().height,base:baseline(sub.firstElementChild),x:R(sub.firstElementChild).x};
      const logo=el.querySelector('.logo'); if(logo) g.logo=R(logo);
      g.stats=[...el.querySelectorAll('.stat')].map(s=>{const b=s.querySelector('b'),sp=s.querySelector('span');
        return {box:R(s),h:s.firstElementChild.getBoundingClientRect().height,num:{x:R(b).x,base:baseline(s.firstElementChild)},lab:{text:sp.textContent.toUpperCase(),x:R(sp).x}};});
      const v=el.querySelector('.vendors'); if(v) g.vend={text:v.textContent.replace(/\s+/g,' ').trim(),box:R(v),h:v.firstElementChild.getBoundingClientRect().height,base:baseline(v.firstElementChild),x:R(v.firstElementChild).x};
      return g; });
  });
  D.hairGeo=await pg.evaluate(()=>{const h=document.getElementById('hairline'),sr=document.getElementById('stage').getBoundingClientRect(),r=h.getBoundingClientRect();return {x:r.left-sr.left,y:r.top-sr.top};});
  await pg.close();

  /* ---------- 3. UI layers @4x ---------- */
  const ui=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:4});
  await ui.goto(url); await ui.evaluate(()=>window.ready);
  await ui.evaluate(()=>{
    window.seek(14.9);
    document.getElementById('world').style.webkitMaskImage=document.getElementById('world').style.maskImage='none';
    const cam=document.getElementById('cam'); cam.style.transform='none'; cam.style.opacity=1;
    for(const id of ['bg','glow','copy','hairline','grain','cursor','shadow','vignette','callouts','clones','dim','sheen']) document.getElementById(id).style.display='none';
    document.documentElement.style.background=document.body.style.background=document.getElementById('stage').style.background='transparent';
    const w=document.getElementById('win'); w.style.boxShadow='none'; w.style.opacity=1; w.style.transform='none';
    setFilter('All products');
    cards.forEach(c=>{c.style.opacity=1;c.style.transform='none';c.style.boxShadow='';c.classList.remove('is-hover');});
    doc.querySelectorAll('.is-hover,.is-press').forEach(e=>e.classList.remove('is-hover','is-press'));
    premiumBtn.textContent=premiumBtn.dataset.labelBefore;
    cart.style.display='';cart.style.opacity=1;cart.style.transform='none';
    window.__iso=(el)=>{
      const f=document.getElementById('frame'), w=document.getElementById('win'), ch=document.getElementById('chrome'), on=!!el;
      doc.documentElement.style.background=doc.body.style.background=on?'transparent':'';
      f.style.background=w.style.background=on?'transparent':''; ch.style.visibility=on?'hidden':''; doc.body.style.visibility=on?'hidden':'';
      doc.querySelectorAll('[data-iso]').forEach(e=>{e.style.visibility='';e.removeAttribute('data-iso')});
      if(el){el.style.visibility='visible';el.setAttribute('data-iso','')}
    };
  });
  const A={};
  const shotEl=async(name,sel,margin)=>{
    const r=await ui.evaluate(([sel])=>{const el=eval(sel); __iso(el); return rectB(el);},[sel]);
    const clip={x:r.x-margin,y:r.y-margin,width:r.w+2*margin,height:r.h+2*margin};
    await ui.screenshot({path:path.join(OUT,name+'.png'),clip,omitBackground:true});
    return {file:name+'.png',x:clip.x,y:clip.y,w:clip.width,h:clip.height,m:margin};
  };
  await ui.evaluate(()=>{__iso(null); cards.forEach(c=>c.style.visibility='hidden'); doc.querySelector('.filters-inline').style.visibility='hidden'; cart.style.visibility='hidden';});
  await ui.screenshot({path:path.join(OUT,'ui_page_base.png'),clip:{x:0,y:0,width:1600,height:1046},omitBackground:true});
  A.base='ui_page_base.png';
  await ui.evaluate(()=>{cards.forEach(c=>c.style.visibility=''); doc.querySelector('.filters-inline').style.visibility=''; cart.style.visibility='';});
  const M=40, lift=`0 18px 40px -6px rgba(37,43,38,0.16), 0 1px 2px rgba(37,43,38,0.04)`;
  const setCard=async(i,{hover,shadow,btnHover,added})=>ui.evaluate(([i,hover,shadow,btnHover,added,lift])=>{
    const c=cards[i]; c.classList.toggle('is-hover',!!hover); c.style.boxShadow=shadow?lift:'';
    const b=c.querySelector('[data-action="add-cart"]'); b.classList.toggle('is-hover',!!btnHover);
    if(c===premium) b.textContent=added?b.dataset.labelAfter:b.dataset.labelBefore;
  },[i,hover,shadow,btnHover,added,lift]);
  A.cards=[];
  const NAMES=['M365 Business Basic','M365 Business Standard','M365 Business Premium','Acronis Cloud Backup','Managed Cloud Support','Azure Plan'];
  for(let i=0;i<6;i++){ await setCard(i,{}); A.cards.push({name:NAMES[i],normal:await shotEl(`ui_card${i+1}_normal`,`cards[${i}]`,M)}); }
  const st={hover:{hover:1,shadow:1},hoverBtn:{hover:1,shadow:1,btnHover:1},hoverBtnAdded:{hover:1,shadow:1,btnHover:1,added:1},hoverAdded:{hover:1,shadow:1,added:1},added:{added:1},
    liftHover:{hover:1},liftHoverBtn:{hover:1,btnHover:1},liftHoverBtnAdded:{hover:1,btnHover:1,added:1}};
  for(const [k,s] of Object.entries(st)){ await setCard(2,s); A.cards[2][k]=await shotEl(`ui_card3_${k}`,'cards[2]',M); }
  await setCard(2,{});
  await setCard(3,{hover:1,shadow:1}); A.cards[3].hover=await shotEl('ui_card4_hover','cards[3]',M); await setCard(3,{});
  const chipVar=async(active,hoverCat)=>{
    await ui.evaluate(([active,hoverCat])=>{ chips.forEach(c=>{c.classList.toggle('active',c.dataset.category===active); c.classList.toggle('is-hover',c.dataset.category===hoverCat);}); },[active,hoverCat]);
  };
  A.chips={};
  // chip-state code: per chip "A"/"-" (active) + "H"/"-" (hover), in DOM order
  const codes=[...new Set(D.frames.map(f=>f.chips))];
  const chipNames=await ui.evaluate(()=>chips.map(c=>c.dataset.category));
  for(const code of codes){
    const active=chipNames[[...Array(chipNames.length).keys()].find(i=>code[i*2]==='A')], hov=chipNames[[...Array(chipNames.length).keys()].find(i=>code[i*2+1]==='H')];
    await chipVar(active,hov); A.chips[code]={...(await shotEl(`ui_chips_${code.replace(/-/g,'_')}`,"doc.querySelector('.filters-inline')",8)),label:`${active} active`+(hov?` · hover ${hov}`:'')};
  }
  A.cart=await shotEl('ui_quote_bar','cart',M);
  await ui.evaluate(()=>__iso(null));
  // sheen
  await ui.evaluate(()=>{ for(const id of ['chrome','frame']) document.getElementById(id).style.visibility='hidden'; document.getElementById('win').style.background='transparent';
    const s=document.getElementById('sheen'); s.style.display=''; s.style.opacity=1; s.style.transform='none'; });
  const sr=await ui.evaluate(()=>{const r=document.getElementById('sheen').getBoundingClientRect(); return {x:r.left,y:r.top,w:r.width,h:r.height};});
  await ui.screenshot({path:path.join(OUT,'ui_sheen.png'),clip:{x:0,y:0,width:sr.w,height:1046},omitBackground:true});
  A.sheen={file:'ui_sheen.png',w:sr.w};
  // cursors
  for(const [name,id] of [['cursor_arrow','cur-arrow'],['cursor_hand','cur-hand']]){
    await ui.evaluate(([id])=>{ document.getElementById('sheen').style.display='none'; const cu=document.getElementById('cursor'); cu.style.display=''; cu.style.opacity=1;
      cu.style.transform='translate3d(16px,16px,0)';
      document.getElementById('cur-arrow').style.opacity=id==='cur-arrow'?1:0; document.getElementById('cur-hand').style.opacity=id==='cur-hand'?1:0; },[id]);
    await ui.screenshot({path:path.join(OUT,name+'.png'),clip:{x:8,y:8,width:48,height:48},omitBackground:true});
  }
  A.cursorTip={x:12,y:11};
  await ui.close();

  /* ---------- 4. stage layers @2x ---------- */
  const sp=await browser.newPage({viewport:{width:2080,height:1240},deviceScaleFactor:2});
  await sp.goto(url); await sp.evaluate(()=>window.ready);
  await sp.evaluate(()=>{ window.seek(14.9); const s=document.getElementById('stage'); s.style.margin='80px 0 0 80px'; s.style.overflow='visible'; document.body.style.overflow='visible'; });
  const only=async(ids,transparent)=>sp.evaluate(([ids,transparent])=>{
    for(const id of ['bg','glow','world','copy','callouts','hairline','vignette','grain']) document.getElementById(id).style.display=ids.includes(id)?'':'none';
    document.getElementById('bg').style.transform='none'; document.getElementById('glow').style.transform='none'; document.getElementById('glow').style.opacity=1;
    const c=transparent?'transparent':''; document.documentElement.style.background=document.body.style.background=document.getElementById('stage').style.background=c;
  },[ids,transparent]);
  await only(['bg'],false); await sp.screenshot({path:path.join(OUT,'stage_background.png'),clip:{x:0,y:0,width:2080,height:1240}});
  await only(['glow'],true); await sp.screenshot({path:path.join(OUT,'stage_glow.png'),clip:{x:80,y:80,width:1920,height:1080},omitBackground:true});
  await only(['vignette'],true); await sp.screenshot({path:path.join(OUT,'stage_vignette.png'),clip:{x:80,y:80,width:1920,height:1080},omitBackground:true});
  await browser.close(); srv.close();

  // simple generated assets
  const py=`
from PIL import Image, ImageDraw
import numpy as np
W,H=3840,2160
a=np.zeros((H,W),np.float32); x=np.arange(W)
a[:]=np.interp(x,[0,1080,1240,1400,1560,1720,1880,2040,2160,W],[0,0,.04,.14,.32,.56,.80,.95,1,1])
img=np.zeros((H,W,4),np.uint8); img[...,:3]=255; img[...,3]=(a*255).astype(np.uint8)
Image.fromarray(img).save('${OUT}/world_matte_gradient.png')
s=4; im=Image.new('RGBA',(44*s,44*s),(0,0,0,0)); d=ImageDraw.Draw(im)
c=22*s; d.ellipse([c-11*s,c-11*s,c+11*s,c+11*s],fill=(237,107,40,56)); d.ellipse([c-6*s,c-6*s,c+6*s,c+6*s],fill=(237,107,40,255))
im.resize((44,44),Image.LANCZOS).save('${OUT}/callout_dot.png')
g=np.zeros((3,800,4),np.uint8); t=np.linspace(0,1,800)
for i,(a0,b0) in enumerate(zip((237,107,40),(243,241,234))): g[...,i]=(a0+(b0-a0)*t).astype(np.uint8)
g[...,3]=(255*(1+(0.65-1)*t)).astype(np.uint8)
Image.fromarray(g).save('${OUT}/callout_line.png')
Image.open('${path.join(ROOT,'app/assets/racknap-easy-reversed.png')}').save('${OUT}/logo_racknap_easy_reversed.png')
`;
  const r=spawnSync('python3',['-c',py],{stdio:'inherit'}); if(r.status) process.exit(1);
  fs.copyFileSync(path.join(ROOT,'out','sfx_music.wav'),path.join(OUT,'sfx_music.wav'));
  D.assets=A;
  fs.writeFileSync(path.join(__dirname,'data.json'),JSON.stringify(D));
  console.log('exported', Object.keys(A).length, 'asset groups;', D.frames.length,'frames');
})();
