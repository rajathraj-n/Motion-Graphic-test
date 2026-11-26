// Generates RackNap_Catalog_Marketplace.jsx (After Effects build script) from
// ae/layout.json + the timeline used by composition/index.html.
//   node ae/build-jsx.js
const fs=require('fs'),path=require('path');
const L=JSON.parse(fs.readFileSync(path.join(__dirname,'layout.json'),'utf8'));
const A=L.assets, T=L.T;
const U=4, MG=600;                 // Browser UI precomp: 4 px per CSS px + margin
const S=2;                         // 4K main comp: 2 px per CSS px
const BW=1600*U+2*MG, BH=1046*U+2*MG;
const OX=Math.round(0.62*1920*S*2)/2; // perspective-origin x (CSS 62%) in 4K px
const SCENE_W=Math.round(OX*2);
const r2=v=>Math.round(v*1000)/1000;

/* ---------- key helpers ---------- */
function K(list){ // [[t,v,e],...] -> sorted, de-duplicated (later wins)
  const m=new Map(); for(const k of list) m.set(r2(k[0]),k);
  return [...m.values()].sort((a,b)=>a[0]-b[0]).map(([t,v,e,extra])=>({t:r2(t),v:Array.isArray(v)?v.map(r2):r2(v),e:e||'linear',...(extra||{})}));
}
function ranges(rs,on=100,off=0){ // hold keys from [[a,b],...]
  const ks=[[0,off,'hold']]; for(const [a,b] of rs){ ks.push([a,on,'hold']); ks.push([b,off,'hold']); }
  if(rs.length&&rs[0][0]===0) ks[0]=[0,on,'hold'];
  return K(ks);
}
const offsetKeys=(ks,base,mul)=>ks.map(k=>({...k,v:[r2(base[0]),r2(base[1]+k.v*mul)]}));

/* ---------- Browser UI precomp ---------- */
const ui=[];
const imgAt=(file,clip)=>({x:MG+clip.x*U,y:MG+clip.y*U});
// shadow
ui.push({type:'solid',name:'Window Shadow',color:[28,33,26],w:1520*U,h:996*U,position:[MG+800*U,MG+578*U],opacity:30,
  effects:[{match:'ADBE Gaussian Blur 2',props:{'ADBE Gaussian Blur 2-0001':400}}]});
ui.push({type:'image',name:'Page (static UI)',file:A.base.file,anchor:[0,0],position:[MG,MG]});

const st=i=>T.cardsIn+i*0.075;
const NAMES=['M365 Business Basic','M365 Business Standard','M365 Business Premium','Acronis Cloud Backup','Managed Cloud Support','Azure Plan'];
A.cards.forEach((c,i)=>{
  const P=imgAt(c.normal.file,c.normal);
  const dy=[[st(i),34,'out'],[st(i)+.8,0,'hold']], op=[[st(i),0,'out'],[st(i)+.8,100,'hold']];
  if(i<3){ dy.push([T.clickProd,8,'hold'],[T.clickProd+.02+i*.06,8,'out'],[T.clickProd+.5+i*.06,0,'hold'],
                   [T.clickAll,6,'hold'],[T.clickAll+i*.05,6,'out'],[T.clickAll+.55+i*.05,0,'hold']);
           op.push([T.clickProd,55,'hold'],[T.clickProd+.02+i*.06,55,'out'],[T.clickProd+.5+i*.06,100,'hold'],
                   [T.clickAll,75,'hold'],[T.clickAll+i*.05,75,'out'],[T.clickAll+.55+i*.05,100,'hold']); }
  else { const s2=T.clickAll+.06+(i-3)*.085; dy.push([s2,30,'out'],[s2+.75,0,'hold']); op.push([T.clickProd,0,'hold'],[s2,0,'out'],[s2+.75,100,'hold']); }
  if(i<2) op.push([T.hoverPremium,100,'smooth'],[T.hoverPremium+.55,52,'hold'],[8.75,52,'smooth'],[9.35,100,'hold']);
  if(i===2) dy.push([T.hoverPremium-.08,0,'outSoft'],[T.hoverPremium+.28,-4,'hold'],[9.2,-4,'smooth'],[9.6,0,'hold']);
  if(i===3) dy.push([T.hoverMcs-.06,0,'outSoft'],[T.hoverMcs+.3,-4,'hold'],[T.cursorOut-.2,-4,'smooth'],[T.cursorOut+.25,0,'hold']);
  const nul=`Card ${i+1}`;
  ui.push({type:'null',name:nul,comment:NAMES[i],anchor:[0,0],position:[P.x,P.y],
    keys:{position:offsetKeys(K(dy),[P.x,P.y],U)},
    effects:[{match:'ADBE Slider Control',name:'Opacity',props:{'ADBE Slider Control-0001':0},keys:{'ADBE Slider Control-0001':K(op)}}]});
  const expr=`value * thisComp.layer("${nul}").effect("Opacity")(1) / 100`;
  const state=(key,file,keys)=>ui.push({type:'image',name:`${NAMES[i]} – ${key}`,file,anchor:[0,0],position:[P.x,P.y],parent:nul,
    keys:keys?{opacity:keys}:undefined,expressions:{opacity:expr},motionBlur:true});
  if(i===2){
    const H=T.hoverPremium;
    state('normal',c.normal.file,K([[0,100,'hold'],[H+.28,0,'hold']]));
    state('hover',c.hover.file,K([[0,0,'hold'],[H-.08,0,'outSoft'],[H+.28,100,'hold'],[7.05,0,'hold']]));
    state('hover + button hover',c.hoverBtn.file,K([[0,0,'hold'],[7.05,100,'hold'],[T.clickAdd,0,'hold']]));
    state('added (Add another +), button hover',c.hoverBtnAdded.file,K([[0,0,'hold'],[T.clickAdd,100,'hold'],[8.9,0,'hold']]));
    state('added, hover',c.hoverAdded.file,K([[0,0,'hold'],[8.9,100,'hold'],[9.6,0,'hold']]));
    state('added',c.added.file,K([[0,0,'hold'],[9.2,0,'smooth'],[9.6,100,'hold']]));
  } else if(i===3){
    state('normal',c.normal.file,null);
    state('hover',c.hover.file,K([[0,0,'hold'],[T.hoverMcs-.06,0,'outSoft'],[T.hoverMcs+.3,100,'hold'],[T.cursorOut-.2,100,'smooth'],[T.cursorOut+.25,0,'hold']]));
  } else state('normal',c.normal.file,null);
});
// filter chips
const CH=A.chips, chipP=imgAt(CH.all.file,CH.all);
const chipRanges={all:[[0,4.32],[T.clickAll+.25,15]],allHoverProd:[[4.32,T.clickProd]],prodHoverProd:[[T.clickProd,T.clickProd+.25]],
  prod:[[T.clickProd+.25,9.48]],prodHoverAll:[[9.48,T.clickAll]],allHoverAll:[[T.clickAll,T.clickAll+.25]]};
const chipLabel={all:'All products active',allHoverProd:'All active · hover Productivity',prodHoverProd:'Productivity active · hover',
  prod:'Productivity active',prodHoverAll:'Productivity active · hover All',allHoverAll:'All active · hover All'};
for(const k of Object.keys(chipRanges)) ui.push({type:'image',name:`Filter chips – ${chipLabel[k]}`,file:CH[k].file,anchor:[0,0],position:[chipP.x,chipP.y],keys:{opacity:ranges(chipRanges[k])}});
// quote bar
{ const P=imgAt(A.cart.file,A.cart), d=L.cartProd.y-L.cartAll.y;
  ui.push({type:'image',name:'Quote bar (1 unit · $28)',file:A.cart.file,anchor:[0,0],position:[P.x,P.y+d*U],motionBlur:true,
    keys:{position:offsetKeys(K([[T.cartIn,d+26,'out'],[T.cartIn+.55,d,'hold'],[T.clickAll+.05,d,'inOut'],[T.clickAll+.75,0,'hold']]),[P.x,P.y],U),
          opacity:K([[T.cartIn,0,'out'],[T.cartIn+.55,100,'hold']])}}); }
// cursor
{ const C=L.cursor, pos=[], op=[];
  for(let j=0;j<C.length;j++){
    const k=C[j], p=[MG+k.x*U,MG+k.y*U], extra={};
    if(j>0){ const a=C[j-1]; const t=tan(a,k); extra.inT=t.inT; }
    if(j<C.length-1){ const t=tan(k,C[j+1]); extra.outT=t.outT; }
    pos.push([k.t,p,'smooth',extra]); op.push([k.t,(k.o??1)*100,'smooth']);
  }
  function tan(a,b){ const dx=(b.x-a.x)*U,dy=(b.y-a.y)*U,len=Math.hypot(dx,dy)||1,k=(b.arc||0)*U/0.75,nx=-dy/len*k,ny=dx/len*k;
    return {outT:[r2(dx/3+nx),r2(dy/3+ny)],inT:[r2(-dx/3+nx),r2(-dy/3+ny)]}; }
  const press=[];[T.clickProd,T.clickAdd,T.clickAll].forEach(ct=>press.push([ct-.1,86,'hold'],[ct+.03,100,'hold']));
  const p0=[MG+C[0].x*U,MG+C[0].y*U];
  ui.push({type:'null',name:'Cursor',anchor:[0,0],position:p0,motionBlur:true,
    keys:{position:K(pos),scale:K([[0,100,'hold'],...press]).map(k=>({...k,v:[k.v,k.v]}))},
    expressions:{scale:`// keeps the cursor a readable size while the camera zooms\nvar b = comp("3D Scene – RackNap Catalog").layer("Browser").transform.scale[0] / 50;\nvar k = Math.pow(b, -0.55) * 1.05;\n[value[0] * k, value[1] * k]`},
    effects:[{match:'ADBE Slider Control',name:'Opacity',props:{'ADBE Slider Control-0001':0},keys:{'ADBE Slider Control-0001':K(op)}},
             {match:'ADBE Checkbox Control',name:'Hand',props:{'ADBE Checkbox Control-0001':0},keys:{'ADBE Checkbox Control-0001':ranges([[4.25,5.0],[6.95,8.9],[9.42,10.1]],1,0)}}]});
  const tip=[A.cursorTip.x*U,A.cursorTip.y*U];
  ui.push({type:'image',name:'Cursor – arrow',file:'cursor_arrow.png',anchor:tip,position:p0,parent:'Cursor',motionBlur:true,
    expressions:{opacity:'var c = thisComp.layer("Cursor");\nc.effect("Opacity")(1) * (1 - c.effect("Hand")(1))'}});
  ui.push({type:'image',name:'Cursor – pointer hand',file:'cursor_hand.png',anchor:tip,position:p0,parent:'Cursor',motionBlur:true,
    expressions:{opacity:'var c = thisComp.layer("Cursor");\nc.effect("Opacity")(1) * c.effect("Hand")(1)'}});
}

/* ---------- 3D scene (camera move) ---------- */
const scene=[];
scene.push({type:'null',name:'Rig Controls',position:[200,200],guide:true,
  effects:[{match:'ADBE Checkbox Control',name:'Invert X/Y rotation',props:{'ADBE Checkbox Control-0001':1}}]});
{ const C=L.cam, ap=[],po=[],sc=[],rx=[],ry=[],rz=[];
  C.forEach((k,j)=>{ const e=j<C.length-1?C[j+1].e:'linear';
    ap.push([k.t,[MG+k.fx*U,MG+k.fy*U,0],e]); po.push([k.t,[k.ax*S,k.ay*S,0],e]); sc.push([k.t,[k.s*50,k.s*50,k.s*50],e]);
    rx.push([k.t,k.rx,e]); ry.push([k.t,k.ry,e]); rz.push([k.t,k.rz,e]); });
  const inv='value * (thisComp.layer("Rig Controls").effect("Invert X/Y rotation")(1) == 1 ? -1 : 1)';
  const c0=C[0];
  scene.push({type:'comp',name:'Browser',comp:'browser',threeD:true,collapse:true,motionBlur:true,
    anchor:[MG+c0.fx*U,MG+c0.fy*U,0],position:[c0.ax*S,c0.ay*S,0],
    keys:{anchorPoint:K(ap),position:K(po),scale:K(sc),xRotation:K(rx),yRotation:K(ry),zRotation:K(rz),opacity:K([[0,0,'smooth'],[0.7,100,'hold']])},
    expressions:{xRotation:inv,yRotation:inv}});
  scene.push({type:'camera',name:'Camera (CSS perspective 2600px)',center:[OX,1080],zoom:2600*S});
}

/* ---------- main comp ---------- */
const main=[];
const parallaxHead=`var b = comp("3D Scene – RackNap Catalog").layer("Browser").transform;\nvar fx = (b.anchorPoint[0] - ${MG}) / ${U}, fy = (b.anchorPoint[1] - ${MG}) / ${U}, s = b.scale[0] / 50;\n`;
main.push({type:'audio',name:'Music + SFX bed (placeholder)',file:'sfx_music.wav'});
main.push({type:'image',name:'Background',file:'stage_background.png',position:[1920,1080],
  expressions:{position:parallaxHead+'[1920 - (fx - 800) * 0.035 * 2, 1080 - (fy - 523) * 0.03 * 2]',
               scale:parallaxHead+'var k = 100 * (1 + (s - 0.6) * 0.02);\n[k, k]'}});
main.push({type:'image',name:'Floor gradient',file:'stage_floor_gradient.png',position:[1920,1080]});
main.push({type:'comp',name:'3D Scene',comp:'scene',anchor:[0,0],position:[0,0],motionBlur:true});
main.push({type:'image',name:'Left scrim',file:'stage_left_scrim.png',position:[1920,1080],keys:{opacity:K([[0.2,25,'smooth'],[1.2,100,'hold']])}});
main.push({type:'null',name:'Copy Parallax',anchor:[0,0],position:[0,0],expressions:{position:parallaxHead+'[-(fx - 800) * 0.012 * 2, 0]'}});
const INK=[37,43,38],ORANGE=[237,107,40],MUTED=[111,118,109];
const masked=(name,txt,x,base,box,h,keysY,blockIn,blockOut)=>{
  main.push({type:'text',name,text:txt,position:[x*S,base*S],parent:'Copy Parallax',motionBlur:true,inPoint:blockIn,outPoint:blockOut,
    keys:{position:keysY.map(k=>({...k,v:[r2(x*S),r2((base+k.v*h)*S)]}))},matte:`Matte – ${name}`});
  main.push({type:'solid',name:`Matte – ${name}`,color:[255,255,255],w:Math.ceil(box.w*S),h:Math.ceil(box.h*S),
    position:[(box.x+box.w/2)*S,(box.y+box.h/2)*S],parent:'Copy Parallax',isMatte:true,inPoint:blockIn,outPoint:blockOut});
};
L.copy.blocks.forEach((B,bi)=>{
  const n=bi+1, inn=B.in, out=B.out<90?B.out:null, bIn=Math.max(0,inn-0.05), bOut=out?Math.min(15,out+0.65):15;
  B.lines.forEach((ln,i)=>{
    const a=inn+.10+i*.085, ky=[[a,1.12,'out'],[a+.85,0,'hold']]; if(out) ky.push([out+i*.05,0,'in'],[out+i*.05+.42,-1.12,'hold']);
    masked(`S${n} Headline ${i+1} – ${ln.text}`,{string:ln.text,font:'InterDisplay-SemiBold',size:74*S,color:ln.accent?ORANGE:INK,tracking:-28},
      ln.x,ln.base,ln.box,ln.spanH,K(ky),bIn,bOut);
  });
  if(B.label){ const ky=[[inn+.12,1.1,'out'],[inn+.8,0,'hold']]; if(out) ky.push([out,0,'in'],[out+.35,-1.1,'hold']);
    masked(`S${n} Eyebrow – ${B.label.text}`,{string:B.label.text,font:'Inter-SemiBold',size:15*S,color:ORANGE,tracking:220},
      B.label.x,B.label.base,B.label.box,B.label.spanH,K(ky),bIn,bOut);
    const sk=[[inn,0,'out'],[inn+.6,100,'hold']]; if(out) sk.push([out,100,'in'],[out+.35,0,'hold']);
    main.push({type:'solid',name:`S${n} Eyebrow bar`,color:ORANGE,w:Math.round(B.bar.w*S),h:Math.round(B.bar.h*S),anchor:[0,B.bar.h*S/2],
      position:[B.bar.x*S,(B.bar.y+B.bar.h/2)*S],parent:'Copy Parallax',inPoint:bIn,outPoint:bOut,keys:{scale:K(sk).map(k=>({...k,v:[k.v,100]}))}}); }
  if(B.sub){ masked(`S${n} Supporting line – ${B.sub.text}`,{string:B.sub.text,font:'Inter-Regular',size:25*S,color:MUTED,tracking:0},
      B.sub.x,B.sub.base,B.sub.box,B.sub.spanH,K([[inn+.55,1.05,'out'],[inn+1.35,0,'hold']]),bIn,bOut); }
  if(B.logo){ const c=[(B.logo.x+B.logo.w/2)*S,(B.logo.y+B.logo.h/2)*S];
    main.push({type:'image',name:'RackNap Easy logo',file:'logo_racknap_easy.png',position:c,fitWidth:B.logo.w*S,parent:'Copy Parallax',inPoint:bIn,outPoint:bOut,
      keys:{opacity:K([[inn-.05,0,'out'],[inn+.9,100,'hold']]),position:K([[inn-.05,[c[0],c[1]+18*S],'out'],[inn+.9,c,'hold']])}}); }
});
{ const h=L.copy.hairline; main.push({type:'solid',name:'Hairline',color:INK,w:Math.round(h.w*S),h:2,anchor:[0,1],position:[h.x*S,(h.y+h.h/2)*S],opacity:18,
  keys:{scale:K([[12.7,0,'out'],[14.1,100,'hold']]).map(k=>({...k,v:[k.v,100]}))}}); }
main.push({type:'adjustment',name:'Film grain (subtle)',effects:[{match:'ADBE Noise',props:{'ADBE Noise-0001':1.6}}]});

const recipe={
  fps:30,dur:15,
  comps:[
    {id:'browser',name:'Browser UI – Catalog & marketplace',w:BW,h:BH,bg:[247,248,245],layers:ui},
    {id:'scene',name:'3D Scene – RackNap Catalog',w:SCENE_W,h:2160,bg:[241,240,235],layers:scene},
    {id:'main',name:'RackNap Easy – Catalog & Marketplace 4K',w:3840,h:2160,bg:[241,240,235],layers:main,open:true},
  ],
  ease:{inOut:[.65,0,.35,1],smooth:[.45,0,.2,1],out:[.16,1,.3,1],outSoft:[.22,1,.36,1],in:[.55,0,.75,.06],cam:[.6,.02,.22,1]},
};
const tpl=fs.readFileSync(path.join(__dirname,'jsx-template.jsx'),'utf8');
const out=tpl.replace('/*__RECIPE__*/null',JSON.stringify(recipe));
fs.writeFileSync(path.join(__dirname,'RackNap_Catalog_Marketplace.jsx'),out);
console.log('jsx written', (out.length/1024).toFixed(0)+' KB', 'layers:',ui.length,scene.length,main.length);
