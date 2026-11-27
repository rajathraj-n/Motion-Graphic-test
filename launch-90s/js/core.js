'use strict';
const DURATION=90;
/* ---------------- easing ---------------- */
function bezier(p1x,p1y,p2x,p2y){
  const cx=3*p1x,bx=3*(p2x-p1x)-cx,ax=1-cx-bx,cy=3*p1y,by=3*(p2y-p1y)-cy,ay=1-cy-by;
  const sx=t=>((ax*t+bx)*t+cx)*t, sy=t=>((ay*t+by)*t+cy)*t;
  return x=>{ if(x<=0)return 0; if(x>=1)return 1; let lo=0,hi=1,t=x;
    for(let i=0;i<36;i++){ const v=sx(t); if(Math.abs(v-x)<1e-7)break; if(v<x)lo=t; else hi=t; t=(lo+hi)/2; } return sy(t); };
}
const E={inOut:bezier(.65,0,.35,1),smooth:bezier(.45,0,.2,1),out:bezier(.16,1,.3,1),outSoft:bezier(.22,1,.36,1),in:bezier(.55,0,.75,.06),
  cam:bezier(.6,.02,.22,1),fly:bezier(.7,0,.12,1),expo:bezier(.87,0,.13,1),lin:x=>x};
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,p)=>a+(b-a)*p;
const prog=(t,a,b)=>clamp((t-a)/(b-a));
const ease=(t,a,b,fn=E.inOut)=>fn(prog(t,a,b));
// damped spring 0→1 (slight overshoot), duration-normalised
function spring(x,damp=5.2,freq=11){ if(x<=0) return 0; if(x>=1) return 1; return 1-Math.exp(-damp*x)*Math.cos(freq*x)*(1-x*0.0)+0*x; }
const sp=(t,a,dur,damp,freq)=>spring(prog(t,a,a+dur),damp,freq);
const win=(t,a,b,fi=.4,fo=.4)=>Math.min(ease(t,a,a+fi,E.smooth),1-ease(t,b-fo,b,E.smooth)); // fade window
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function h(html){ const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstElementChild; }
function tf(x=0,y=0,z=0,rx=0,ry=0,rz=0,s=1){ return `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg) scale(${s.toFixed(4)})`; }
function show(el,on){ const v=on?'':'none'; if(el.style.display!==v) el.style.display=v; }
function op(el,o){ el.style.opacity=o.toFixed(4); show(el,o>0.002); }
const fmtMoney=n=>money(n);
function countTo(el,from,to,p,fmt=fmtMoney){ el.textContent=fmt(lerp(from,to,p)); }
// layout offset of an element relative to an ancestor (ignores transforms)
function offs(el,root){ let x=0,y=0,e=el; while(e&&e!==root){ x+=e.offsetLeft; y+=e.offsetTop; e=e.offsetParent; } return {x,y,w:el.offsetWidth,h:el.offsetHeight}; }

/* ---------------- camera ---------------- */
// key: {t, ax,ay (screen point), fx,fy,fz (world point under it), s, rx,ry,rz, e}
let CAM=[];
function camAt(t){
  let a=CAM[0],b=CAM[CAM.length-1]; if(t<=a.t) return a; if(t>=b.t) return b;
  for(let i=0;i<CAM.length-1;i++) if(t>=CAM[i].t&&t<=CAM[i+1].t){a=CAM[i];b=CAM[i+1];break;}
  const p=(b.e||E.inOut)(prog(t,a.t,b.t)), o={};
  for(const k of ['ax','ay','fx','fy','fz','rx','ry','rz']) o[k]=lerp(a[k]??0,b[k]??0,p);
  o.s=Math.exp(lerp(Math.log(a.s),Math.log(b.s),p)); return o;
}
function applyCam(t){
  const c=camAt(t);
  // subtle handheld drift (deterministic), makes holds feel alive
  const dx=Math.sin(t*0.53)*3+Math.sin(t*1.31)*1.2, dy=Math.cos(t*0.47)*2.4, dr=Math.sin(t*0.37)*0.25;
  $('#cam').style.transform=`translate3d(${(c.ax+dx).toFixed(2)}px,${(c.ay+dy).toFixed(2)}px,0) rotateX(${(c.rx+dr).toFixed(3)}deg) rotateY(${(c.ry-dr).toFixed(3)}deg) rotateZ(${(c.rz||0).toFixed(3)}deg) scale(${c.s.toFixed(4)}) translate3d(${-c.fx}px,${-c.fy}px,${-(c.fz||0)}px)`;
  const bx=-(c.fx-800)*0.03, by=-(c.fy-500)*0.025;
  $('#bgfx').style.transform=`translate3d(${bx.toFixed(2)}px,${by.toFixed(2)}px,0)`;
  return c;
}

/* ---------------- cursor ---------------- */
// keys: {t,x,y,z?,o?,arc?} in world space; CLICKS: times; HAND: [a,b] ranges
let CURSOR=[], CLICKS=[], HAND=[];
function cursorAt(t){
  const K=CURSOR; if(!K.length) return {x:0,y:0,z:0,o:0};
  if(t<=K[0].t) return {...K[0],z:K[0].z||0,o:0};
  if(t>=K[K.length-1].t) return {...K[K.length-1],z:K[K.length-1].z||0,o:0};
  let i=0; while(i<K.length-1&&!(t>=K[i].t&&t<=K[i+1].t)) i++;
  const a=K[i],b=K[i+1]; if(b.jump) return {x:a.x,y:a.y,z:a.z||0,o:a.o??1};
  const pa=typeof a.x==='function'?a.x(t):{x:a.x,y:a.y}, pb=typeof b.x==='function'?b.x(t):{x:b.x,y:b.y};
  const p=E.smooth(prog(t,a.t,b.t)), dx=pb.x-pa.x, dy=pb.y-pa.y, len=Math.hypot(dx,dy)||1, bow=(b.arc||0)*Math.sin(Math.PI*p);
  return {x:lerp(pa.x,pb.x,p)+(-dy/len)*bow, y:lerp(pa.y,pb.y,p)+(dx/len)*bow, z:lerp(a.z||0,b.z||0,p), o:lerp(a.o??1,b.o??1,p)};
}
function applyCursor(t,camS){
  const k=cursorAt(t), el=$('#cursor');
  const press=CLICKS.some(ct=>t>=ct-0.09&&t<ct+0.04)?0.84:1;
  const sz=Math.pow(camS,-0.6)*1.15;
  el.style.opacity=k.o.toFixed(3); show(el,k.o>0.002);
  el.style.transform=`translate3d(${(k.x-4).toFixed(2)}px,${(k.y-3).toFixed(2)}px,${(k.z+4).toFixed(2)}px) scale(${(sz*press).toFixed(4)})`;
  const hand=HAND.some(([a,b])=>t>=a&&t<b);
  $('#cur-hand').style.opacity=hand?1:0; $('#cur-arrow').style.opacity=hand?0:1;
}
const isPress=(t,ct)=>t>=ct-0.09&&t<ct+0.04;

/* ---------------- kinetic headlines ---------------- */
function headline(id,eyebrow,html){
  // html: words separated by spaces; wrap <em> words for accent
  const words=html.split(' ').map(w=>`<span class="w"><span>${w}</span></span>`).join(' ');
  const el=h(`<div class="hl" id="${id}"><div class="eb"><span class="bar"></span><span class="tx"><span>${eyebrow}</span></span></div><h2>${words}</h2></div>`);
  $('#hud').appendChild(el); return el;
}
function animHeadline(el,t,tin,tout){
  const vis=t>=tin-0.02&&t<=tout+0.7; el.style.visibility=vis?'visible':'hidden'; if(!vis) return;
  el.querySelectorAll('.w > span').forEach((s,i)=>{
    const pin=sp(t,tin+0.12+i*0.07,0.9,5.5,10), pout=ease(t,tout+i*0.03,tout+i*0.03+0.45,E.in);
    s.style.transform=`translate3d(0,${((1-pin)*105-pout*110).toFixed(2)}%,0) rotate(${((1-Math.min(pin,1))*6).toFixed(2)}deg)`;
  });
  el.querySelector('.bar').style.transform=`scaleX(${(ease(t,tin,tin+0.6,E.out)*(1-ease(t,tout,tout+0.35,E.in))).toFixed(4)})`;
  const pe=ease(t,tin+0.1,tin+0.7,E.out), po=ease(t,tout,tout+0.35,E.in);
  el.querySelector('.eb .tx span').style.transform=`translate3d(0,${((1-pe)*110-po*110).toFixed(2)}%,0)`;
}

/* ---------------- svg helpers ---------------- */
const SVGNS='http://www.w3.org/2000/svg';
function svgEl(tag,attrs={}){ const e=document.createElementNS(SVGNS,tag); for(const k in attrs) e.setAttribute(k,attrs[k]); return e; }
function trim(path,p){ const L=path.__len||(path.__len=path.getTotalLength()); path.style.strokeDasharray=`${L} ${L}`; path.style.strokeDashoffset=(L*(1-clamp(p))).toFixed(2); }

/* ---------------- scene registry ---------------- */
const SCENES=[];
function scene(def){ SCENES.push(def); return def; }
window.seek=function(t){
  t=clamp(t,0,DURATION);
  const c=applyCam(t);
  for(const s of SCENES) s.render(t,c);
  applyCursor(t,c.s);
  return true;
};
