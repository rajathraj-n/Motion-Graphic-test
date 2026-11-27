// Builds RackNap_Catalog_Marketplace_v2.jsx from ae/v2/data.json (sampled from composition/index.html).
//   node ae/v2/build-v2.js
const fs=require('fs'),path=require('path');
const D=JSON.parse(fs.readFileSync(path.join(__dirname,'data.json'),'utf8'));
const A=D.assets, F=D.frames, T=D.T, G=D.G;
const U=4, MG=600, S=2;
const BW=1600*U+2*MG, BH=1046*U+2*MG;
const OX=Math.round(0.62*1920*S*2)/2, SCENE_W=Math.round(OX*2);
const SCENE='3D Scene – RackNap Catalog v2';
const r3=v=>Math.round(v*1000)/1000;

/* ---------- sampled tracks -> reduced linear keyframes ---------- */
function track(fn,tol){ // fn(frame)-> number|array ; returns keys or a static value
  const samp=F.map(f=>{const v=fn(f); return {t:f.t,v:Array.isArray(v)?v:[v]};});
  const err=(a,b,m)=>{ let e=0; for(let i=a+1;i<b;i++){ const p=(samp[i].t-samp[a].t)/(samp[b].t-samp[a].t);
      for(let d=0;d<samp[a].v.length;d++){ const x=samp[a].v[d]+(samp[b].v[d]-samp[a].v[d])*p; e=Math.max(e,Math.abs(x-samp[i].v[d])); } } return e; };
  const keep=new Set([0,samp.length-1]);
  (function rdp(a,b){ if(b-a<2) return; let worst=-1,wi=-1;
    for(let i=a+1;i<b;i++){ const p=(samp[i].t-samp[a].t)/(samp[b].t-samp[a].t); let e=0;
      for(let d=0;d<samp[a].v.length;d++){ const x=samp[a].v[d]+(samp[b].v[d]-samp[a].v[d])*p; e=Math.max(e,Math.abs(x-samp[i].v[d])); }
      if(e>worst){worst=e;wi=i;} }
    if(worst>tol){ keep.add(wi); rdp(a,wi); rdp(wi,b); } })(0,samp.length-1);
  const idx=[...keep].sort((a,b)=>a-b);
  const one=samp[0].v.length===1;
  if(idx.length===2 && err(0,samp.length-1)<=tol && samp[0].v.every((x,d)=>Math.abs(x-samp[samp.length-1].v[d])<=tol)) return {static:one?r3(samp[0].v[0]):samp[0].v.map(r3)};
  return {keys:idx.map(i=>({t:r3(samp[i].t),v:one?r3(samp[i].v[0]):samp[i].v.map(r3),e:'linear'}))};
}
function apply(spec,prop,tr){ if(tr.static!==undefined){ if(prop==='opacity') spec.opacity=tr.static; else spec[prop==='anchorPoint'?'anchor':prop]=tr.static; } else { spec.keys=spec.keys||{}; spec.keys[prop]=tr.keys; } return spec; }
const invExpr='value * (thisComp.layer("Rig Controls").effect("Invert X/Y rotation")(1) == 1 ? -1 : 1)';

/* ================= Browser UI precomp ================= */
const ui=[];
ui.push({type:'solid',name:'Window Shadow',color:[0,0,0],w:1540*U,h:1016*U,position:[MG+800*U,MG+578*U],opacity:62,
  effects:[{match:'ADBE Gaussian Blur 2',props:{'ADBE Gaussian Blur 2-0001':460}}]});
ui.push({type:'image',name:'Page (static UI)',file:A.base,anchor:[0,0],position:[MG,MG]});
const prodTime=t=>t>=T.clickProd && t<T.clickAll;
A.cards.forEach((c,i)=>{
  const P={x:MG+c.normal.x*U,y:MG+c.normal.y*U}, nul=`Card ${i+1}`;
  ui.push(apply({type:'null',name:nul,comment:c.name,anchor:[0,0],position:[P.x,P.y]},'position',track(f=>[P.x,P.y+f.cards[i].y*U],0.4)));
  const st=(label,file,fn)=>{ const s={type:'image',name:`${c.name} – ${label}`,file:A.cards[i][file].file,anchor:[0,0],position:[0,0],parent:nul,motionBlur:true};
    ui.push(apply(s,'opacity',track(f=>100*fn(f),0.4))); };
  const o=f=>f.cards[i].o;
  if(i===2){
    const L=f=>f.liftP, b=f=>f.btnHover, a=f=>f.added;
    st('normal','normal',f=>o(f)*(1-a(f)));
    st('added (Add another +)','added',f=>o(f)*a(f));
    st('hover','hover',f=>o(f)*L(f)*(1-b(f))*(1-a(f)));
    st('hover + button hover','hoverBtn',f=>o(f)*L(f)*b(f)*(1-a(f)));
    st('added, button hover','hoverBtnAdded',f=>o(f)*L(f)*b(f)*a(f));
    st('added, hover','hoverAdded',f=>o(f)*L(f)*(1-b(f))*a(f));
  } else if(i===3){ st('normal','normal',o); st('hover','hover',f=>o(f)*f.liftB); }
  else st('normal','normal',o);
});
for(const [code,ch] of Object.entries(A.chips))
  ui.push(apply({type:'image',name:`Filter chips – ${ch.label}`,file:ch.file,anchor:[0,0],position:[MG+ch.x*U,MG+ch.y*U]},'opacity',track(f=>f.chips===code?100:0,0.5)));
{ const c=A.cart, base={x:MG+c.x*U,y:MG+c.y*U}, d=G.cartProd.y-G.cartAll.y;
  const s={type:'image',name:'Quote bar (1 unit · $28)',file:c.file,anchor:[0,0],position:[base.x,base.y],motionBlur:true};
  apply(s,'position',track(f=>[base.x,base.y+((prodTime(f.t)?d:0)+f.cart.y)*U],0.4));
  ui.push(apply(s,'opacity',track(f=>100*f.cart.on*f.cart.o,0.4))); }
ui.push(apply({type:'solid',name:'Page dim (behind lifted card)',color:[20,25,20],w:1600*U,h:1000*U,position:[MG+800*U,MG+546*U]},'opacity',track(f=>100*f.dim,0.4)));
{ const s={type:'image',name:'Glass sheen',file:A.sheen.file,anchor:[0,0],position:[MG,MG]};
  apply(s,'position',track(f=>[MG+f.sheen.x/100*A.sheen.w*U,MG],0.5)); ui.push(apply(s,'opacity',track(f=>100*f.sheen.o,0.4))); }

/* ================= 3D scene ================= */
const sc=[];
sc.push({type:'null',name:'Rig Controls',position:[200,200],guide:true,
  effects:[{match:'ADBE Checkbox Control',name:'Invert X/Y rotation',props:{'ADBE Checkbox Control-0001':1}}]});
{ const rig={type:'null',name:'Camera Rig',threeD:true,anchor:[0,0,0],position:[0,0,0],
    comment:'Camera move: Anchor = point of the page in view, Position = where it sits on screen, Scale = zoom (50% = 1:1).'};
  apply(rig,'anchorPoint',track(f=>[MG+f.cam.fx*U,MG+f.cam.fy*U,0],0.3));
  apply(rig,'position',track(f=>[f.cam.ax*S,f.cam.ay*S,0],0.15));
  apply(rig,'scale',track(f=>[f.cam.s*50,f.cam.s*50,f.cam.s*50],0.01));
  apply(rig,'xRotation',track(f=>f.cam.rx,0.01)); apply(rig,'yRotation',track(f=>f.cam.ry,0.01)); apply(rig,'zRotation',track(f=>f.cam.rz,0.01));
  rig.expressions={xRotation:invExpr,yRotation:invExpr};
  sc.push(rig); }
{ const b={type:'comp',name:'Browser',comp:'browser',threeD:true,collapse:true,motionBlur:true,parent:'Camera Rig',position:[BW/2,BH/2,0]};
  apply(b,'position',track(f=>[BW/2,BH/2,-f.win.z*U],0.3));
  sc.push(apply(b,'opacity',track(f=>100*f.win.o,0.4))); }
// lifted / flying copies of product cards
A.cards.forEach((c,i)=>{
  const r=G.cards[i], img=c.normal, iw=img.w*U, ih=img.h*U;
  const act=f=>f.clones[i];
  const base={x:MG+r.cx*U,y:MG+r.cy*U};
  const nm=`Card ${i+1} 3D – ${c.name}`;
  const L={type:'null',name:nm,threeD:true,parent:'Camera Rig',anchor:[0,0,0],position:[base.x,base.y,0],motionBlur:true};
  apply(L,'position',track(f=>{const p=act(f); return p?[base.x+p.x*U,base.y+p.y*U,-p.z*U]:[base.x,base.y,0];},0.4));
  apply(L,'xRotation',track(f=>act(f)?act(f).rx:0,0.02)); apply(L,'yRotation',track(f=>act(f)?act(f).ry:0,0.02)); apply(L,'zRotation',track(f=>act(f)?act(f).rz:0,0.02));
  apply(L,'scale',track(f=>{const s=act(f)?act(f).s*100:100; return [s,s,s];},0.02));
  L.expressions={xRotation:invExpr,yRotation:invExpr};
  sc.push(L);
  // shadow (behind the card, inherits its tilt)
  const shw={type:'solid',name:`${nm} – shadow`,color:[0,0,0],w:Math.round(r.w*U),h:Math.round(r.h*U),threeD:true,parent:nm,position:[0,0,8],
    effects:[{match:'ADBE Gaussian Blur 2',props:{'ADBE Gaussian Blur 2-0001':200},keys:{'ADBE Gaussian Blur 2-0001':track(f=>act(f)?(30+70*act(f).sh)*U*0.9:30*U,1).keys||undefined}}]};
  if(!shw.effects[0].keys['ADBE Gaussian Blur 2-0001']) delete shw.effects[0].keys;
  apply(shw,'position',track(f=>[0,act(f)?(10+40*act(f).sh)*U:0,8],0.4));
  sc.push(apply(shw,'opacity',track(f=>act(f)?100*(0.10+0.32*act(f).sh)*act(f).o:0,0.4)));
  const face=(label,key,fn)=>sc.push(apply({type:'image',name:`${nm} – ${label}`,file:A.cards[i][key].file,threeD:true,parent:nm,anchor:[iw/2,ih/2,0],position:[0,0,0],motionBlur:true},'opacity',track(f=>act(f)?100*act(f).o*fn(f):0,0.4)));
  if(i===2){
    face('lifted','liftHover',f=>(1-f.btnHover)*(1-f.added)); // (file key resolved below)
    face('lifted, button hover','liftHoverBtn',f=>f.btnHover*(1-f.added));
    face('lifted, Add another +','liftHoverBtnAdded',f=>f.added);
  } else face('card','normal',()=>1);
});
{ const cur={type:'null',name:'Cursor',threeD:true,parent:'Camera Rig',anchor:[0,0,0],position:[0,0,0],motionBlur:true};
  apply(cur,'position',track(f=>[MG+f.cursor.x*U,MG+f.cursor.y*U,-f.cursor.z*U],0.4));
  apply(cur,'scale',track(f=>{const k=f.cursor.sz*f.cursor.press*100; return [k,k,k];},0.05));
  sc.push(cur);
  const tip=[A.cursorTip.x*U,A.cursorTip.y*U,0];
  sc.push(apply({type:'image',name:'Cursor – arrow',file:'cursor_arrow.png',threeD:true,parent:'Cursor',anchor:tip,position:[0,0,0],motionBlur:true},'opacity',track(f=>100*f.cursor.o*(1-f.cursor.hand),0.5)));
  sc.push(apply({type:'image',name:'Cursor – pointer hand',file:'cursor_hand.png',threeD:true,parent:'Cursor',anchor:tip,position:[0,0,0],motionBlur:true},'opacity',track(f=>100*f.cursor.o*f.cursor.hand,0.5)));
}
sc.push({type:'camera',name:'Camera (perspective 2600px)',center:[OX,1080],zoom:2600*S});

/* ================= world matte ================= */
const wm=[];
wm.push(apply({type:'solid',name:'Open (start of film)',color:[255,255,255],w:3840,h:2160,position:[1920,1080]},'opacity',track(f=>100*f.mo,0.4)));
wm.push({type:'image',name:'Fade behind headline column',file:'world_matte_gradient.png',position:[1920,1080]});

/* ================= main ================= */
const mn=[];
const CREAM=[243,241,234],ORANGE=[237,107,40],SUB=[167,176,162];
mn.push({type:'audio',name:'Music + SFX bed (placeholder)',file:'sfx_music.wav'});
{ const s={type:'image',name:'Background',file:'stage_background.png',position:[1920,1080]};
  apply(s,'position',track(f=>[1920+f.bg.x*S,1080+f.bg.y*S],0.3)); mn.push(apply(s,'scale',track(f=>[f.bg.s*100,f.bg.s*100],0.01))); }
{ const s={type:'image',name:'Orange glow',file:'stage_glow.png',position:[1920,1080]};
  apply(s,'position',track(f=>[1920+f.glow.x*S,1080+f.glow.y*S],0.3)); mn.push(apply(s,'opacity',track(f=>100*f.glow.o,0.4))); }
mn.push({type:'comp',name:'3D Scene',comp:'scene',anchor:[0,0],position:[0,0],motionBlur:true,matte:'World Matte'});
mn.push({type:'comp',name:'World Matte',comp:'matte',position:[1920,1080],isMatte:true});
mn.push({type:'image',name:'Vignette',file:'stage_vignette.png',position:[1920,1080]});
mn.push(apply({type:'null',name:'Copy Parallax',anchor:[0,0],position:[0,0]},'position',track(f=>[f.copyX*S,0],0.2)));

// masked text helper: text + matte, both parented
function masked(name,text,x,base,box,parent,yTrack,opTrack){
  const s={type:'text',name,text,position:[x*S,base*S],parent,motionBlur:true,matte:`Matte – ${name}`};
  if(yTrack) apply(s,'position',yTrack); if(opTrack) apply(s,'opacity',opTrack);
  mn.push(s);
  mn.push({type:'solid',name:`Matte – ${name}`,color:[255,255,255],w:Math.max(2,Math.ceil(box.w*S)),h:Math.max(2,Math.ceil(box.h*S)),
    position:[(box.x+box.w/2)*S,(box.y+box.h/2)*S],parent,isMatte:true});
  return s;
}
const fill=(get)=>{ // copy values only exist while a block is visible: hold the nearest value outside
  let last=null; const vals=F.map(f=>{const v=get(f); if(v!=null) last=v; return v;}); let next=null;
  for(let i=vals.length-1;i>=0;i--){ if(vals[i]!=null) next=vals[i]; else vals[i]=next; }
  last=null; for(let i=0;i<vals.length;i++){ if(vals[i]!=null) last=vals[i]; else vals[i]=last; }
  return i=>vals[i]; };
const fi=f=>Math.round(f.t*30);
D.copyGeo.forEach((g,bi)=>{
  const n=bi+1, cp=f=>f.copy[bi];
  g.lines.forEach((ln,li)=>{
    const y=fill(f=>cp(f)?cp(f).lines[li]:null);
    masked(`S${n} Headline ${li+1} – ${ln.text}`,{string:ln.text,font:'InterDisplay-SemiBold',size:76*S,color:ln.accent?ORANGE:CREAM,tracking:-30},
      ln.x,ln.base,ln.box,'Copy Parallax',track(f=>[ln.x*S,(ln.base+y(fi(f))/100*ln.h)*S],0.3));
  });
  if(g.lbl){ const y=fill(f=>cp(f)?cp(f).lbl:null);
    masked(`S${n} Eyebrow – ${g.lbl.text}`,{string:g.lbl.text,font:'Inter-SemiBold',size:15*S,color:ORANGE,tracking:220},
      g.lbl.x,g.lbl.base,g.lbl.box,'Copy Parallax',track(f=>[g.lbl.x*S,(g.lbl.base+y(fi(f))/100*g.lbl.h)*S],0.3));
    const sx=fill(f=>cp(f)?cp(f).bar:null);
    mn.push(apply({type:'solid',name:`S${n} Eyebrow bar`,color:ORANGE,w:Math.round(g.bar.w*S),h:Math.round(g.bar.h*S),anchor:[0,g.bar.h*S/2],
      position:[g.bar.x*S,(g.bar.y+g.bar.h/2)*S],parent:'Copy Parallax'},'scale',track(f=>[100*(sx(fi(f))||0),100],0.3))); }
  if(g.sub){ const y=fill(f=>cp(f)?cp(f).sub:null);
    masked(`S${n} Supporting line – ${g.sub.text}`,{string:g.sub.text,font:'Inter-Regular',size:25*S,color:SUB,tracking:0},
      g.sub.x,g.sub.base,g.sub.box,'Copy Parallax',track(f=>[g.sub.x*S,(g.sub.base+y(fi(f))/100*g.sub.h)*S],0.3)); }
  if(g.logo){ const lo=fill(f=>cp(f)&&cp(f).logo?cp(f).logo:null), c=[(g.logo.x+g.logo.w/2)*S,(g.logo.y+g.logo.h/2)*S];
    const s={type:'image',name:'RackNap Easy logo (reversed)',file:'logo_racknap_easy_reversed.png',position:c,fitWidth:g.logo.w*S,parent:'Copy Parallax'};
    apply(s,'position',track(f=>{const v=lo(fi(f)); return [c[0],c[1]+(v?v.y:18)*S];},0.3));
    mn.push(apply(s,'opacity',track(f=>{const v=lo(fi(f)); return 100*(v&&cp(f)?v.o:0);},0.4))); }
  (g.stats||[]).forEach((st,k)=>{
    const y=fill(f=>cp(f)?cp(f).stats[k].y:null), cnt=fill(f=>cp(f)?cp(f).stats[k].n:null);
    const yt=(x,b)=>track(f=>[x*S,(b+y(fi(f))/100*st.h)*S],0.3);
    const num=masked(`S${n} Stat ${k+1} number`,{string:String(D.stats[k][0]),font:'InterDisplay-SemiBold',size:54*S,color:CREAM,tracking:-20},st.num.x,st.num.base,st.box,'Copy Parallax',yt(st.num.x,st.num.base));
    num.effects=[{match:'ADBE Slider Control',name:'Count',props:{'ADBE Slider Control-0001':0},keys:{'ADBE Slider Control-0001':track(f=>cnt(fi(f))||0,0.01).keys}}];
    num.textExpression='Math.round(effect("Count")(1))';
    masked(`S${n} Stat ${k+1} label – ${st.lab.text}`,{string:st.lab.text,font:'Inter-Medium',size:16*S,color:SUB,tracking:140},st.lab.x,st.num.base,st.box,'Copy Parallax',yt(st.lab.x,st.num.base));
  });
  if(g.vend){ const y=fill(f=>cp(f)?cp(f).vend:null), txt=D.vendors.split('·').map(s=>s.trim()).join('  ·  ');
    masked(`S${n} Vendors`,{string:txt,font:'Inter-Regular',size:19*S,color:SUB,tracking:0},g.vend.x,g.vend.base,g.vend.box,'Copy Parallax',track(f=>[g.vend.x*S,(g.vend.base+y(fi(f))/100*g.vend.h)*S],0.3)); }
});
// callouts (screen space, baked from the lifted card's live position)
D.calloutText.forEach((c,j)=>{
  const co=f=>f.callouts[j], on=f=>co(f)?1:0, last=fill(f=>co(f));
  const g=i=>last(i)||{dx:0,dy:0,ds:0,lx:0,ly:0,lw:0,ls:0,bx:0,by:0,k:110,v:110};
  const dot={type:'image',name:`Callout ${j+1} – dot`,file:'callout_dot.png',position:[0,0]};
  apply(dot,'position',track(f=>[g(fi(f)).dx*S,g(fi(f)).dy*S],0.3)); apply(dot,'scale',track(f=>{const s=100*on(f)*g(fi(f)).ds; return [s,s];},0.3));
  mn.push(dot);
  const line={type:'image',name:`Callout ${j+1} – line`,file:'callout_line.png',anchor:[0,1.5],position:[0,0]};
  apply(line,'position',track(f=>[g(fi(f)).lx*S,(g(fi(f)).ly+0.75)*S],0.3));
  apply(line,'scale',track(f=>[on(f)*g(fi(f)).lw*S*g(fi(f)).ls/800*100,100],0.3));
  mn.push(line);
  const nul=`Callout ${j+1} – label`;
  mn.push(apply({type:'null',name:nul,anchor:[0,0],position:[0,0]},'position',track(f=>[g(fi(f)).bx*S,g(fi(f)).by*S],0.3)));
  const kH=15.6, vTop=kH+6, vH=33.75;
  masked(`Callout ${j+1} key – ${c.k}`,{string:c.k,font:'Inter-SemiBold',size:13*S,color:ORANGE,tracking:200},0,12.5,{x:-4,y:0,w:420,h:kH},nul,
    track(f=>[0,(12.5+g(fi(f)).k/100*kH)*S],0.3),track(f=>100*on(f),0.5));
  masked(`Callout ${j+1} value – ${c.v}`,{string:c.v,font:'InterDisplay-SemiBold',size:27*S,color:CREAM,tracking:-15},0,vTop+26.7,{x:-4,y:vTop,w:520,h:vH},nul,
    track(f=>[0,(vTop+26.7+g(fi(f)).v/100*vH)*S],0.3),track(f=>100*on(f),0.5));
});
mn.push(apply({type:'solid',name:'Hairline',color:CREAM,w:240,h:2,anchor:[0,1],position:[D.hairGeo.x*S,(D.hairGeo.y+0.5)*S],opacity:22},'scale',track(f=>[f.hair/120*100,100],0.3)));
mn.push({type:'adjustment',name:'Film grain (subtle)',effects:[{match:'ADBE Noise',props:{'ADBE Noise-0001':1.8}}]});

const recipe={fps:30,dur:15,
  comps:[
    {id:'browser',name:'Browser UI – Catalog & marketplace v2',w:BW,h:BH,bg:[247,248,245],layers:ui},
    {id:'scene',name:SCENE,w:SCENE_W,h:2160,bg:[27,33,28],layers:sc},
    {id:'matte',name:'World Matte v2',w:3840,h:2160,bg:[0,0,0],layers:wm},
    {id:'main',name:'RackNap Easy – Catalog & Marketplace v2 4K',w:3840,h:2160,bg:[27,33,28],layers:mn,open:true},
  ],
  ease:{}, localParenting:true};
const tpl=fs.readFileSync(path.join(__dirname,'..','jsx-template.jsx'),'utf8')
  .replace('RackNap Easy — Catalog & Marketplace (15 s, 3840x2160, 30 fps)','RackNap Easy — Catalog & Marketplace v2 (15 s, 3840x2160, 30 fps)')
  .replace(/"RackNap Easy – Catalog & Marketplace 4K"[^\n]*\n[^\n]*\n[^\n]*\n/, '"RackNap Easy – Catalog & Marketplace v2 4K" (main) + precomps: 3D Scene (camera rig,\n        flying/lifted cards, cursor), Browser UI (real page layers), World Matte.\n')
  .replace('Build RackNap Easy – Catalog & Marketplace','Build RackNap Easy – Catalog & Marketplace v2')
  .replace('Generated by ae/build-jsx.js','Generated by ae/v2/build-v2.js');
const out=tpl.replace('/*__RECIPE__*/null',JSON.stringify(recipe));
fs.writeFileSync(path.join(__dirname,'RackNap_Catalog_Marketplace_v2.jsx'),out);
let nk=0; for(const c of recipe.comps) for(const l of c.layers){ for(const k in (l.keys||{})) nk+=l.keys[k].length; (l.effects||[]).forEach(e=>{for(const k in (e.keys||{})) nk+=e.keys[k].length;}); }
console.log('jsx written', (out.length/1024).toFixed(0)+' KB; layers', recipe.comps.map(c=>c.layers.length).join('/'), '; keyframes', nk);
