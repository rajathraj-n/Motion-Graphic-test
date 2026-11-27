'use strict';
/* ======================================================================
   RackNap Easy — 90s launch film. All animation is a pure function of t.
   ====================================================================== */
const B={ // beats (seconds)
  merge:7.0, core:7.9, logo:8.65, logoOut:10.25, app:10.3,
  dash:13.0, c360:20.0, cat:26.0, build:34.0, quote:40.0, order:47.0, subs:54.0, inv:61.0, rec:68.0, prof:75.0, fin:83.0,
};
const APP_W=1600, APP_H=1000;
const FRAME={ax:1045,ay:628,fx:800,fy:500,s:0.74,rx:0,ry:0};

/* ---------------- build DOM ---------------- */
$('#appwrap').innerHTML=`<div class="ui" id="appui">${appShell()}</div>`;
const app=$('#app');
const panes={}; $$('.pane').forEach(p=>panes[p.dataset.pane]=p);
// subscriptions table: add a Manage control to each row
$$('[data-pane="subscriptions"] .tr:not(.th) > div:last-child').forEach(d=>d.insertAdjacentHTML('beforeend',' <span class="btn sm">Manage →</span>'));
document.head.insertAdjacentHTML('beforeend',`<style>.btn.sm{padding:6px 9px;font-size:10px;margin-left:6px}.tbl.t6 .tr{grid-template-columns:2fr 1.3fr .7fr .8fr .9fr 1.2fr}
  .hilite{background:linear-gradient(90deg,#FFF1EA,#fff 70%)!important;box-shadow:inset 3px 0 0 var(--o)}
  #rp-barlist .bar{grid-template-columns:150px 1fr 120px}</style>`);
const F=$('#floaters'), C=$('#chaos');
const add=(parent,html)=>{ const e=h(html); parent.appendChild(e); return e; };
const place=(el,x,y,z=0,rx=0,ry=0,rz=0,s=1)=>{ el.style.transform=tf(x,y,z,rx,ry,rz,s); };

/* ---------------- camera keys ---------------- */
CAM=[
  {t:0,    ax:960, ay:560, fx:800,fy:470,fz:0, s:0.56, rx:16, ry:-26, rz:3},
  {t:3.4,  ax:960, ay:545, fx:760,fy:480,fz:0, s:0.64, rx:7,  ry:-9,  rz:1, e:E.smooth},
  {t:6.8,  ax:960, ay:540, fx:820,fy:500,fz:0, s:0.70, rx:9,  ry:16,  rz:-1.5, e:E.inOut},
  {t:8.5,  ax:960, ay:540, fx:800,fy:500,fz:0, s:0.78, rx:0,  ry:0,   rz:0, e:E.cam},
  {t:10.3, ax:960, ay:560, fx:800,fy:500,fz:0, s:0.66, rx:0,  ry:0,   rz:0, e:E.smooth},
  {t:12.6, ...FRAME, s:0.75, rx:2, ry:-5, e:E.cam},
  // dashboard orbit
  {t:15.2, ax:1040,ay:620,fx:820,fy:480,s:0.70,rx:6,ry:-16, e:E.inOut},
  {t:17.6, ax:1080,ay:640,fx:560,fy:330,s:1.02,rx:3,ry:-6, e:E.inOut},
  {t:19.6, ax:1000,ay:600,fx:800,fy:520,s:0.66,rx:4,ry:8, e:E.inOut},
  // customer 360 focus tour
  {t:21.0, ax:1000,ay:600,fx:800,fy:520,fz:200,s:0.86,rx:4,ry:6, e:E.inOut},
  {t:22.2, ax:1060,ay:640,fx:340,fy:290,fz:160,s:1.02,rx:3,ry:9, e:E.inOut},
  {t:23.4, ax:1000,ay:640,fx:1260,fy:290,fz:160,s:1.02,rx:3,ry:-9, e:E.inOut},
  {t:24.5, ax:1060,ay:620,fx:340,fy:800,fz:160,s:1.02,rx:-3,ry:9, e:E.inOut},
  {t:25.5, ax:1000,ay:620,fx:1260,fy:800,fz:160,s:1.0,rx:-3,ry:-9, e:E.inOut},
  // catalog
  {t:26.6, ...FRAME, s:0.74, rx:4, ry:-8, e:E.inOut},
  {t:28.3, ax:1060,ay:620,fx:900,fy:420,s:0.92,rx:3,ry:-6, e:E.inOut},
  {t:30.2, ax:1080,ay:600,fx:1170,fy:420,s:1.30,rx:2,ry:-4, e:E.inOut},
  {t:31.6, ax:1080,ay:600,fx:1170,fy:470,s:1.38,rx:2,ry:-4, e:E.smooth},
  {t:33.2, ax:1050,ay:600,fx:1100,fy:300,s:0.95,rx:3,ry:-6, e:E.inOut},
  // storefront builder (concept)
  {t:34.6, ax:1010,ay:600,fx:800,fy:500,fz:240,s:0.80,rx:2,ry:-4, e:E.inOut},
  {t:37.8, ax:1010,ay:600,fx:820,fy:520,fz:240,s:0.86,rx:2,ry:4, e:E.smooth},
  {t:39.6, ax:1010,ay:600,fx:800,fy:500,fz:240,s:0.80,rx:2,ry:-2, e:E.inOut},
  // quote
  {t:40.8, ax:1080,ay:610,fx:800,fy:470,fz:150,s:1.00,rx:2,ry:-6, e:E.inOut},
  {t:42.4, ax:1080,ay:610,fx:800,fy:560,fz:150,s:1.18,rx:1,ry:-3, e:E.inOut},
  {t:44.2, ax:1080,ay:610,fx:800,fy:520,fz:150,s:1.10,rx:1,ry:-3, e:E.smooth},
  {t:46.4, ax:1060,ay:620,fx:800,fy:500,fz:150,s:0.98,rx:2,ry:5, e:E.inOut},
  // order + fulfillment pan
  {t:48.6, ax:1000,ay:640,fx:330,fy:500,fz:160,s:0.98,rx:3,ry:8, e:E.inOut},
  {t:52.6, ax:960,ay:640,fx:1280,fy:500,fz:160,s:0.98,rx:3,ry:-8, e:E.smooth},
  // subscriptions
  {t:54.8, ...FRAME, s:0.80, rx:3, ry:-5, e:E.inOut},
  {t:57.2, ax:1040,ay:620,fx:900,fy:600,s:0.86,rx:4,ry:7, e:E.smooth},
  {t:59.0, ax:1060,ay:600,fx:820,fy:520,fz:120,s:0.98,rx:2,ry:-4, e:E.inOut},
  {t:60.6, ax:1060,ay:600,fx:820,fy:520,fz:120,s:0.98,rx:2,ry:-4, e:E.smooth},
  // invoice
  {t:62.6, ax:1080,ay:600,fx:1060,fy:500,fz:160,s:0.92,rx:2,ry:-8, e:E.inOut},
  {t:64.4, ax:1080,ay:600,fx:1060,fy:560,fz:160,s:1.06,rx:1,ry:-4, e:E.smooth},
  {t:66.8, ax:1060,ay:640,fx:1080,fy:640,fz:160,s:0.96,rx:2,ry:-6, e:E.inOut},
  // reconciliation
  {t:69.2, ax:1000,ay:610,fx:800,fy:500,fz:150,s:0.90,rx:4,ry:5, e:E.inOut},
  {t:71.6, ax:1000,ay:610,fx:800,fy:430,fz:150,s:1.00,rx:2,ry:-4, e:E.smooth},
  {t:73.6, ax:1000,ay:610,fx:800,fy:420,fz:150,s:1.06,rx:2,ry:-2, e:E.smooth},
  // profit, then pull back
  {t:75.8, ...FRAME, s:0.80, rx:3, ry:-6, e:E.inOut},
  {t:78.4, ax:1060,ay:620,fx:900,fy:560,s:0.90,rx:2,ry:6, e:E.smooth},
  {t:81.6, ax:960,ay:560,fx:800,fy:500,fz:0,s:0.40,rx:14,ry:-14, e:E.cam},
  {t:84.4, ax:960,ay:550,fx:800,fy:500,fz:0,s:0.46,rx:8,ry:10, e:E.smooth},
  {t:86.0, ax:960,ay:540,fx:800,fy:500,fz:0,s:0.30,rx:4,ry:0, e:E.inOut},
  {t:90.0, ax:960,ay:540,fx:800,fy:500,fz:0,s:0.30,rx:4,ry:0, e:E.smooth},
];

/* ======================================================================
   S1 — fragmented tools  (0–7) + magnetic merge (7–8.5)
   ====================================================================== */
const xl=(cols,rows,widths)=>`<div class="xl" style="grid-template-columns:${widths}">${['','A','B','C','D'].slice(0,cols+1).map((c,i)=>`<div class="h ${i?'':'rh'}">${c}</div>`).join('')}${rows.map((r,ri)=>`<div class="rh">${ri+1}</div>`+r.map(c=>`<div class="${c[0]==='!'?'err':ri===0?'h':''}">${c.replace(/^!/,'')}</div>`).join('')).join('')}</div>`;
const FRAGS=[
  {x:-60,y:20,z:-160,rx:8,ry:22,rz:-4,w:560,html:`<div class="tb"><i></i><i></i><i></i><span class="t">subscriptions_oct_FINAL.xlsx</span></div>${xl(4,[['Customer','Product','Seats','Price'],['Cedarline Solutions','M365 Business Standard','52','$15'],['Solace Digital','M365 Business Basic','80','$8'],['Harborstone Systems','Cloud Backup','30','$10'],['Total MRR','','','!#REF!']],'28px 1.4fr 1.6fr .6fr .7fr')}`},
  {x:1120,y:640,z:140,rx:-6,ry:-22,rz:3,w:480,html:`<div class="tb"><i></i><i></i><i></i><span class="t">invoices_v3_copy(2).xlsx</span></div>${xl(4,[['Invoice','Customer','Seats','Amount'],['INV-2601','Cedarline','!48','$720'],['INV-2602','Solace','80','$640'],['INV-2603','Harborstone','30','$300']],'28px 1fr 1.2fr .6fr .8fr')}`},
  {x:1140,y:20,z:-320,rx:10,ry:-26,rz:2,w:460,html:`<div class="tb"><i></i><i></i><i></i><span class="t">Supplier portal — License summary</span></div><div class="doc"><div class="lbl">October 2026</div>
    <div class="ln" style="margin-top:10px"><span>M365 Business Standard · Cedarline</span><b>52 licenses</b></div><div class="ln"><span>M365 Business Basic · Solace</span><b>80 licenses</b></div><div class="ln"><span>Exported 3 days ago</span><span class="warnchip">⚠ Manual export</span></div></div>`},
  {x:40,y:660,z:260,rx:-8,ry:24,rz:-3,w:380,html:`<div class="tb"><i></i><i></i><i></i><span class="t">Backup console</span></div><div class="doc"><div class="lbl">Harborstone Systems</div><div class="dt" style="margin:8px 0">30 workloads</div><div class="ln"><span>Billing link</span><span class="warnchip">Not connected</span></div></div>`},
  {x:520,y:-170,z:380,rx:12,ry:6,rz:-2,w:440,html:`<div class="tb"><i></i><i></i><i></i><span class="t">Billing system — Draft invoices</span></div><div class="doc"><span class="warnchip">⚠ Sync failed: supplier quantities unavailable</span>
    <div class="ln" style="margin-top:10px"><span>INV-2601 · Cedarline Solutions</span><b>$720</b></div><div class="ln"><span>INV-2602 · Solace Digital</span><b>$640</b></div><div class="ln"><span>INV-2603 · Harborstone Systems</span><b>$300</b></div></div>`},
  ...['INV-2601|Cedarline Solutions|M365 Business Standard|48 × $15|$720','INV-2602|Solace Digital|M365 Business Basic|80 × $8|$640','INV-2603|Harborstone Systems|Cloud Backup|30 × $10|$300'].map((s,i)=>{const [id,c,p,q,a]=s.split('|');
    return {x:[300,980,640][i],y:[560,300,760][i],z:[480,-60,620][i],rx:[14,-10,20][i],ry:[-30,24,-12][i],rz:[-12,9,6][i],w:230,html:`<div class="doc"><div class="lbl">Invoice</div><div class="dt" style="margin:6px 0 2px">${id}</div><div style="color:var(--mut)">${c}</div>
      <div style="height:1px;background:#EEF0F2;margin:12px 0"></div><div class="ln" style="border:0"><span>${p}</span></div><div class="ln"><span>${q}</span><b>${a}</b></div><div class="ln"><span>Total</span><b>${a}</b></div>
      <div style="margin-top:10px;height:5px;background:#F1F2F4;border-radius:3px;width:80%"></div><div style="margin-top:6px;height:5px;background:#F1F2F4;border-radius:3px;width:60%"></div></div>`};}),
  {x:860,y:380,z:300,rx:-8,ry:-14,rz:5,w:220,paper:true,html:`<div class="doc" style="background:#FFF6B8;min-height:150px;font:600 15px/1.4 Inter;color:#4A4020">Cedarline seats??<br>supplier 52 vs invoice 48<br><span style="font-weight:500;font-size:12px">check before month end</span></div>`},
];
FRAGS.forEach((f,i)=>{ f.el=add(C,`<div class="frag ui" style="width:${f.w}px">${f.html}</div>`); f.i=i; });
// disconnected data paths (in the z=0 plane)
const pathSvg=svgEl('svg',{width:2400,height:1800,viewBox:'-400 -400 2400 1800',style:'position:absolute;left:-400px;top:-400px;overflow:visible'});
C.appendChild(pathSvg);
const centerOf=f=>({x:f.x+f.w/2,y:f.y+120});
const LINKS=[[0,4],[0,3],[4,2],[2,1],[1,6],[3,5],[5,8],[7,1],[0,8]];
const PATHS=LINKS.map(([a,b],k)=>{ const A=centerOf(FRAGS[a]),Bp=centerOf(FRAGS[b]); const mx=(A.x+Bp.x)/2+((k%2)?120:-120), my=(A.y+Bp.y)/2+((k%3)?-90:90);
  const d=`M${A.x},${A.y} Q${mx},${my} ${Bp.x},${Bp.y}`;
  const p=svgEl('path',{d,fill:'none',stroke:'#9AA0A6','stroke-width':3,'stroke-linecap':'round'}); pathSvg.appendChild(p);
  const x=svgEl('g'); x.innerHTML=`<circle r="15" fill="#fff" stroke="#D64545" stroke-width="2.5"/><path d="M-6,-6 L6,6 M6,-6 L-6,6" stroke="#D64545" stroke-width="3" stroke-linecap="round"/>`; pathSvg.appendChild(x);
  const mid=p.getPointAtLength(p.getTotalLength()*0.5); x.setAttribute('transform',`translate(${mid.x},${mid.y})`);
  return {p,x,k}; });
const core=add(C,`<div class="abs" style="width:180px;height:180px;margin:-90px 0 0 -90px;border-radius:44px;background:radial-gradient(circle at 50% 45%,#FFE36B 0%,#FFB347 30%,#F06023 70%);box-shadow:0 0 120px 30px rgba(240,96,35,.45)"></div>`);
const kin=['Spreadsheets.','Vendor portals.','Disconnected <em>billing.</em>','There’s a <em>better way.</em>'].map(s=>add($('#hud'),`<div class="kin" style="left:120px;top:806px"><span style="display:inline-block">${s}</span></div>`));
const KIN_T=[[0.7,2.25],[2.25,3.8],[3.8,5.5],[5.5,7.6]];

scene({render(t){
  const vis=t<B.core+0.8; show(C,vis); if(!vis){ kin.forEach(k=>show(k,false)); $('#tension').style.opacity=0; return; }
  $('#tension').style.opacity=(0.85*(1-ease(t,B.merge,B.merge+1.2,E.smooth))).toFixed(3);
  FRAGS.forEach(f=>{
    const st=0.15+f.i*0.13, pin=sp(t,st,1.1,4.6,9);
    const drift=t*0.9, dx=Math.sin(drift*0.7+f.i)*16, dy=Math.cos(drift*0.6+f.i*1.7)*12, dr=Math.sin(drift*0.5+f.i)*2.2;
    let x=f.x+dx, y=f.y+dy, z=f.z-(1-pin)*900, rx=f.rx+dr, ry=f.ry-dr, rz=f.rz+dr*0.6, s=1, o=Math.min(1,pin*1.4);
    // magnetic merge into the core
    const m=ease(t,B.merge+f.i*0.045,B.core+0.25+f.i*0.03,E.expo);
    if(m>0){ x=lerp(x,800-f.w/2,m); y=lerp(y,500-110,m); z=lerp(z,0,m); rx*=1-m; ry*=1-m; rz*=1-m; s=lerp(1,0.12,m); o*=1-ease(t,B.core+0.05+f.i*0.03,B.core+0.3+f.i*0.03,E.smooth); }
    place(f.el,x,y,z,rx,ry,rz,s); op(f.el,o);
  });
  const red=1-ease(t,B.merge,B.merge+0.6,E.smooth);
  PATHS.forEach(o=>{ const st=0.8+o.k*0.18; const d=ease(t,st,st+1.1,E.outSoft);
    const L=o.p.__len||(o.p.__len=o.p.getTotalLength());
    const g=L*0.12*red; // the break in the middle closes when everything connects
    o.p.style.strokeDasharray=`${(L/2-g/2)*d} ${g+ (L/2-g/2)*(1-d)*2} ${(L/2-g/2)*d} ${L}`;
    o.p.style.stroke= red>0.5?'#9AA0A6':'#F06023'; o.p.style.opacity=(0.85*(1-ease(t,B.core-0.2,B.core+0.3,E.smooth))).toFixed(3);
    const xs=ease(t,st+0.7,st+1.0,E.out)*red; o.x.style.opacity=xs.toFixed(3); o.x.style.transform=`scale(${(0.6+0.4*xs).toFixed(3)})`;
  });
  const cs=sp(t,B.merge+0.55,0.9,4,10)*(1-ease(t,B.logo-0.15,B.logo+0.25,E.in));
  const flash=ease(t,B.logo-0.3,B.logo+0.1,E.in);
  place(core,800,500,0,0,0,45*(1-cs),Math.max(0.001,cs*(1+flash*5))); op(core,cs*(1-flash));
  kin.forEach((k,i)=>{ const [a,b]=KIN_T[i]; const pin=sp(t,a,0.8,5,10), pout=ease(t,b-0.25,b,E.in);
    const vis=t>=a&&t<b; show(k,vis); if(!vis) return;
    k.firstElementChild.style.transform=`translate3d(${((1-pin)*-60).toFixed(1)}px,${(-pout*40).toFixed(1)}px,0) skewX(${((1-pin)*-10).toFixed(2)}deg)`;
    k.style.opacity=(Math.min(1,pin*1.6)*(1-pout)).toFixed(3); });
  $('#hudbg').style.transform=t<B.logo?'translate3d(-120px,780px,0) scale(1.1,0.8)':'translate3d(0,0,0)';
}});

/* ======================================================================
   S2 — logo reveal + platform reveal (7.9–13)
   ====================================================================== */
const logoR=add($('#hud'),`<div id="logoReveal"><img src="assets/logo.png" alt="RackNap Easy"><div class="tg"><span>One platform for cloud <b style="color:var(--o);font-weight:600">quote-to-cash</b>.</span></div></div>`);
scene({render(t){
  const vis=t>=B.logo-0.1&&t<B.logoOut+0.8; show(logoR,vis);
  const sw=prog(t,B.logo-0.05,B.logo+1.3); const s1=$('#sweep'), s2=$('#sweepL');
  s1.style.opacity=(sw>0&&sw<1)?Math.sin(Math.PI*sw).toFixed(3):0; s1.style.transform=`translate3d(${lerp(-600,2200,E.inOut(sw))}px,0,0)`;
  s2.style.opacity=(sw>0&&sw<1)?(0.8*Math.sin(Math.PI*sw)).toFixed(3):0; s2.style.transform=`translate3d(${lerp(-500,2300,E.inOut(sw))}px,0,0)`;
  if(!vis) return;
  const m=ease(t,B.logo,B.logo+0.85,E.expo), out=ease(t,B.logoOut-0.1,B.logoOut+0.25,E.in);
  const img=logoR.querySelector('img');
  img.style.clipPath=`inset(0 ${((1-m)*100).toFixed(2)}% 0 0)`;
  img.style.transform=`scale(${(1.08-0.08*sp(t,B.logo,1.2,5,8)+out*0.06).toFixed(4)})`;
  const tg=ease(t,B.logo+0.6,B.logo+1.3,E.out);
  logoR.querySelector('.tg span').style.transform=`translate3d(0,${((1-tg)*110).toFixed(2)}%,0)`;
  logoR.style.opacity=(1-out).toFixed(3); logoR.style.transform=`translate3d(0,${(-out*40).toFixed(1)}px,0)`;
}});

/* ======================================================================
   APP — persistent product frame, pane switching, counters
   ====================================================================== */
const PANE_SCHED=[[B.app,'overview'],[B.cat-0.2,'catalog'],[B.quote-0.2,'quotes'],[B.order+0.9,'orders'],[B.subs+0.3,'subscriptions'],[B.inv+1.4,'invoices'],[B.rec+0.4,'reconciliation'],[B.prof+0.4,'reports']];
const CRUMB={overview:'Overview',catalog:'Catalog & marketplace',quotes:'Quote management',orders:'Orders',subscriptions:'Subscriptions',invoices:'Billing & invoices',reconciliation:'Reconciliation',reports:'Profitability & reports'};
const NAVIDX={}; NAV.forEach(([k],i)=>NAVIDX[k]=i);
const navA=$('#nav-active');
function paneState(t){ let cur=PANE_SCHED[0], prev=null; for(const s of PANE_SCHED){ if(t>=s[0]){ prev=cur; cur=s; } } return {cur,prev}; }
// overview stagger children
const ovItems=[...panes.overview.querySelectorAll('.ph,.kpi,.panel')];
// bars in reports
$('#rp-barlist').innerHTML=PC_FIXED.map((c,i)=>`<div class="bar"><span>${c.name}</span><div class="trk"><div class="rv" id="rpb-r${i}"></div><div class="cs" id="rpb-c${i}"></div></div><b id="rpb-v${i}">${money(c.revenue)}</b></div>`).join('');
const RP_MAX=1200;
const subKPI=[$('#sb-k1 [data-v]'),$('#sb-k2 [data-v]'),$('#sb-k3 [data-v]'),$('#sb-k4 [data-v]')];
const ovKPI=[$('#ov-k1 [data-v]'),$('#ov-k2 [data-v]'),$('#ov-k3 [data-v]'),$('#ov-k4 [data-v]')];
const rpKPI=[$('#rp-k1 [data-v]'),$('#rp-k2 [data-v]'),$('#rp-k3 [data-v]'),$('#rp-k4 [data-v]')];
const appAppear=t=>sp(t,B.app+0.05,1.3,4.2,8);
scene({render(t){
  const a=appAppear(t);
  // which scenes push the product frame into the background
  const back=Math.max(ease(t,B.c360-0.3,B.c360+0.6,E.inOut)*(1-ease(t,B.cat-0.6,B.cat+0.3,E.inOut)),
                      ease(t,B.build-0.4,B.build+0.5,E.inOut)*(1-ease(t,B.quote-0.6,B.quote+0.2,E.inOut)));
  const fin=ease(t,B.fin+0.6,B.fin+1.6,E.inOut);
  const vis=t>=B.app&&fin<1; show($('#appwrap'),vis); if(!vis) return;
  const z=-760*back, o=Math.min(1,a*1.5)*(1-0.84*back)*(1-fin);
  $('#appwrap').style.transform=tf(0,lerp(80,0,a),z,0,0,0,lerp(0.88,1,a));
  $('#appwrap').style.opacity=o.toFixed(3);
  app.style.clipPath= a<1?`inset(${((1-a)*48).toFixed(2)}% ${((1-a)*48).toFixed(2)}% ${((1-a)*48).toFixed(2)}% ${((1-a)*48).toFixed(2)}% round 16px)`:'';
  // panes
  const {cur,prev}=paneState(t); const p=ease(t,cur[0],cur[0]+0.5,E.smooth);
  for(const k in panes){ const el=panes[k];
    let o=0,y=0; if(k===cur[1]){o=p;y=(1-p)*18;} else if(prev&&k===prev[1]&&p<1){o=1-p;y=-p*10;}
    el.style.opacity=o.toFixed(3); el.style.transform=`translate3d(0,${y.toFixed(1)}px,0)`; show(el,o>0.002); }
  $('#crumb').textContent=CRUMB[p<0.5&&prev?prev[1]:cur[1]];
  const i0=prev?NAVIDX[prev[1]]:NAVIDX[cur[1]], i1=NAVIDX[cur[1]], np=ease(t,cur[0],cur[0]+0.45,E.inOut);
  navA.style.transform=`translate3d(0,${(lerp(i0,i1,np)*40).toFixed(2)}px,0)`;
  $$('.sb-nav a').forEach(el=>el.classList.toggle('on',el.dataset.nav===(np<0.5?NAV[i0][0]:cur[1])));
  // overview reveal + counters
  ovItems.forEach((el,i)=>{ const q=ease(t,B.app+0.5+i*0.07,B.app+1.2+i*0.07,E.out); el.style.opacity=q.toFixed(3); el.style.transform=`translate3d(0,${((1-q)*22).toFixed(1)}px,0)`; });
  const cnt=ease(t,B.app+0.9,B.app+2.3,E.outSoft);
  countTo(ovKPI[0],0,M_START.value,cnt); countTo(ovKPI[1],0,M_START.revenue,cnt); countTo(ovKPI[2],0,M_START.profit,cnt); countTo(ovKPI[3],0,UNBILLED_START,cnt);
  // subscriptions counters (after fulfillment)
  const cs=ease(t,B.subs+0.9,B.subs+2.3,E.outSoft);
  subKPI[0].textContent=t<B.subs+1.3?'3':'4'; countTo(subKPI[1],M_START.value,M_AFTER.value,cs); countTo(subKPI[2],M_START.cost,M_AFTER.cost,cs); subKPI[3].textContent=t<B.subs+1.3?'3':'4';
  // reconciliation fix ripples into the app
  const fixed=t>=B.rec+5.2; $('#nav-badge').style.display=fixed?'none':'';
  const uv=1-ease(t,B.rec+5.2,B.rec+6.0,E.out); countTo($('#rc-k3 [data-v]'),0,60,uv); $('#rc-k4 [data-v]').textContent=fixed?'0':'1';
  $('#rc-row0 > div:last-child').innerHTML=fixed?pill('Aligned'):pill('Review');
  $('#rc-row0 > div:nth-child(4)').textContent=fixed?'52':'48'; $('#rc-row0 > div:nth-child(5)').innerHTML=fixed?'<strong>0</strong><small>$0 unbilled</small>':'<strong>+4</strong><small>$60 unbilled</small>';
  // reports: graph interpolation from the starting month to the closed-out month
  const g=ease(t,B.prof+0.9,B.prof+2.8,E.inOut);
  countTo(rpKPI[0],M_START.revenue,M_FIXED.revenue,g); countTo(rpKPI[1],M_START.cost,M_FIXED.cost,g); countTo(rpKPI[2],M_START.profit,M_FIXED.profit,g);
  rpKPI[3].textContent=lerp(M_START.margin,M_FIXED.margin,g).toFixed(1)+'%';
  PC_FIXED.forEach((c,i)=>{ const s0=PC_START[i]; const rv=lerp(s0.revenue,c.revenue,g), cv=lerp(s0.cost,c.cost,g);
    const grow=ease(t,B.prof+0.4,B.prof+1.4,E.out);
    $('#rpb-r'+i).style.width=(rv/RP_MAX*100*grow).toFixed(2)+'%'; $('#rpb-c'+i).style.width=(cv/RP_MAX*100*grow).toFixed(2)+'%';
    $('#rpb-v'+i).textContent=money(rv);
    const row=$('#rp-row'+i); row.querySelector('[data-rev]').textContent=money(rv); row.querySelector('[data-gp]').textContent=money(rv-cv); row.querySelector('[data-mg]').textContent=((rv-cv)/rv*100).toFixed(1)+'%'; });
  // quote chip in the top bar
  $('#qchip-n').textContent=t>=B.cat+5.55?'1':'0';
  const qb=sp(t,B.cat+5.55,0.6,4,14); $('#qchip').style.transform=`scale(${(1+0.18*(1-qb)*(t>=B.cat+5.55?1:0)).toFixed(3)})`;
}});

/* ======================================================================
   S3 — dashboard with extracted analytics panels (13–20)
   ====================================================================== */
const hlDash=headline('hl-dash','DASHBOARD','Your business, <em>in</em> <em>view.</em>');
const tot0=M_START.revenue;
const donut=add(F,`<div class="fp ui" style="width:360px;padding:20px 22px"><div class="lbl">Revenue by customer · Oct 2026</div>
  <div style="display:flex;align-items:center;gap:20px;margin-top:14px"><svg width="150" height="150" viewBox="-75 -75 150 150" id="dn"></svg>
  <div style="flex:1">${PC_START.map((c,i)=>`<div style="display:flex;align-items:center;gap:8px;margin:8px 0;font-size:11.5px"><i style="width:10px;height:10px;border-radius:3px;background:${['#F06023','#FFD600','#1E2227'][i]}"></i><span style="flex:1">${c.name.split(' ')[0]}</span><b id="dn-v${i}">${money(c.revenue)}</b></div>`).join('')}</div></div>
  <div style="border-top:1px solid var(--line);margin-top:12px;padding-top:10px;display:flex;justify-content:space-between;font-size:11px;color:var(--mut)"><span>Draft customer invoices</span><b style="color:var(--ink)" id="dn-tot">$1,660</b></div></div>`);
const dnSvg=$('#dn'); dnSvg.innerHTML=`<circle r="54" fill="none" stroke="#F1F2F4" stroke-width="20"/>`+PC_START.map((c,i)=>`<circle id="dn-s${i}" r="54" fill="none" stroke="${['#F06023','#FFD600','#1E2227'][i]}" stroke-width="20" transform="rotate(-90)"/>`).join('')+`<text id="dn-pct" y="8" text-anchor="middle" style="font:700 22px 'Inter Display'">0%</text>`;
const barsP=add(F,`<div class="fp ui" style="width:420px;padding:20px 22px"><div class="lbl">Revenue &amp; supplier cost by customer</div>
  ${PC_START.map((c,i)=>`<div style="margin-top:14px"><div style="display:flex;justify-content:space-between;font-size:11.5px"><span>${c.name}</span><b id="bp-v${i}">${money(c.revenue)}</b></div>
  <div style="position:relative;height:20px;margin-top:6px"><div id="bp-r${i}" style="position:absolute;left:0;top:0;height:9px;border-radius:5px;background:var(--o)"></div><div id="bp-c${i}" style="position:absolute;left:0;top:11px;height:9px;border-radius:5px;background:#C9CED4"></div></div></div>`).join('')}</div>`);
const subsP=add(F,`<div class="fp ui" style="width:330px;padding:20px 22px"><div class="lbl">Subscription metrics</div>
  <div style="display:flex;gap:22px;margin-top:12px"><div><div style="font:600 34px 'Inter Display'" id="sm-n">0</div><small>Active subscriptions</small></div><div><div style="font:600 34px 'Inter Display'" id="sm-v">$0</div><small>Monthly value</small></div></div>
  <div style="margin-top:14px;font-size:11px;color:var(--mut)">Next renewals</div>
  <div style="display:flex;gap:8px;margin-top:8px"><span class="pill info"><i></i>Nov 15, 2026</span><span class="pill info"><i></i>Nov 30, 2026</span></div></div>`);
scene({render(t){
  animHeadline(hlDash,t,B.dash+0.15,B.c360-0.75);
  const vis=t>=B.dash-0.3&&t<B.c360+0.6; [donut,barsP,subsP].forEach(e=>show(e,vis)); if(!vis) return;
  const P=[[donut,1350,150,240,0],[barsP,-60,560,320,1],[subsP,1330,660,180,2]];
  P.forEach(([el,x,y,z,i])=>{ const pin=sp(t,B.dash+0.3+i*0.25,1.0,4.5,9), pout=ease(t,B.c360-0.4+i*0.08,B.c360+0.3+i*0.08,E.in);
    const fl=Math.sin(t*1.1+i*2)*8;
    place(el,x,y+fl+(1-pin)*60-pout*80,z*pin+pout*300,(1-pin)*20,(i===1?14:-14)*(1-pin*0.5),0,0.9+0.1*pin); op(el,Math.min(1,pin*1.5)*(1-pout)); });
  const d=ease(t,B.dash+0.8,B.dash+2.2,E.inOut); let acc=0; const C2=2*Math.PI*54;
  PC_START.forEach((c,i)=>{ const f=c.revenue/tot0; const s=$('#dn-s'+i); s.setAttribute('stroke-dasharray',`${(C2*f*d).toFixed(2)} ${C2}`); s.setAttribute('stroke-dashoffset',(-C2*acc*d).toFixed(2)); acc+=f;
    countTo($('#dn-v'+i),0,c.revenue,d); });
  $('#dn-pct').textContent=Math.round(PC_START[2].revenue/tot0*100*d)+'%'; $('#dn-pct').textContent=money(tot0*d).replace('$','$');
  $('#dn-pct').style.fontSize='19px';
  const bg=ease(t,B.dash+1.0,B.dash+2.4,E.out);
  PC_START.forEach((c,i)=>{ $('#bp-r'+i).style.width=(c.revenue/800*100*bg).toFixed(2)+'%'; $('#bp-c'+i).style.width=(c.cost/800*100*bg).toFixed(2)+'%'; countTo($('#bp-v'+i),0,c.revenue,bg); });
  const sm=ease(t,B.dash+0.9,B.dash+2.2,E.outSoft); $('#sm-n').textContent=Math.round(3*sm); countTo($('#sm-v'),0,M_START.value,sm);
  // KPI pulse on unbilled value
  const pu=t>B.dash+3&&t<B.c360?(0.5+0.5*Math.sin((t-B.dash)*5)):0; $('#ov-k4').style.boxShadow=`0 0 0 ${(pu*6).toFixed(1)}px rgba(240,96,35,${(0.18*pu).toFixed(3)})`;
}});

/* ======================================================================
   S4 — Customer 360 (20–26)
   ====================================================================== */
const hl360=headline('hl-360','CUSTOMER 360','Every customer, <em>connected.</em>');
const C360Z=160;
const c360=add(F,`<div class="w3"></div>`);
const c360svg=svgEl('svg',{width:1600,height:1000,viewBox:'0 0 1600 1000',style:'position:absolute;left:0;top:0;overflow:visible'}); c360.appendChild(c360svg);
const cCenter=add(c360,`<div class="fp ui" style="width:440px;padding:24px 26px"><div class="eyb">CUSTOMER 360</div>
  <div style="display:flex;gap:14px;align-items:center;margin-top:14px"><span class="mono" style="width:56px;height:56px;border-radius:14px;font-size:17px;background:#FFF1EA;color:var(--o)">HS</span><div><h1 style="font-size:26px">Harborstone Systems</h1><small style="font-size:11px">Customer of ${WORKSPACE.name}</small></div></div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px">${[['1','Active subscription'],['1','Open quote'],['$300','Draft invoice']].map(([v,l])=>`<div style="border:1px solid var(--line);border-radius:10px;padding:10px 12px"><b style="font:600 20px 'Inter Display'">${v}</b><small>${l}</small></div>`).join('')}</div></div>`);
const sat=[
  ['Subscriptions',`<div style="display:flex;justify-content:space-between;align-items:center"><b>Cloud Backup</b>${pill('Active')}</div><small>SUB-1003 · Acronis</small><div class="ln2"><span>Quantity</span><b>30 workloads</b></div><div class="ln2"><span>Price</span><b>$10 / unit / month</b></div><div class="ln2"><span>Renews</span><b>Nov 30, 2026</b></div>`],
  ['Quotes & orders',`<div style="display:flex;justify-content:space-between;align-items:center"><b>Q-1024</b>${pill('Draft')}</div><small>Managed Cloud Support · Oct 28, 2026</small><div class="ln2"><span>Quantity</span><b>10 units</b></div><div class="ln2"><span>Value / cycle</span><b>$850</b></div><div class="ln2"><span>Orders</span><b>Awaiting acceptance</b></div>`],
  ['Invoice history',`<div style="display:flex;justify-content:space-between;align-items:center"><b>INV-2603</b>${pill('Draft')}</div><small>Billing period Oct 2026</small><div class="ln2"><span>Cloud Backup · 30 × $10</span><b>$300</b></div><div class="ln2"><span>Total</span><b>$300</b></div>`],
  ['Billing check',`<div style="display:flex;justify-content:space-between;align-items:center"><b>Cloud Backup</b>${pill('Aligned')}</div><small>Supplier vs subscription vs invoice</small><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px">${[['Supplier',30],['Subscription',30],['Invoiced',30]].map(([l,v])=>`<div style="background:#F6F7F9;border-radius:8px;padding:8px 10px"><b style="font:600 18px 'Inter Display'">${v}</b><small>${l}</small></div>`).join('')}</div>`],
].map(([t2,body],i)=>add(c360,`<div class="fp ui" style="width:380px;padding:18px 20px"><div class="lbl" style="margin-bottom:10px">${t2}</div>${body}</div>`));
document.head.insertAdjacentHTML('beforeend','<style>.ln2{display:flex;justify-content:space-between;font-size:11.5px;padding:7px 0;border-top:1px solid #F0F1F3;margin-top:6px}.ln2 span{color:var(--mut)}</style>');
const SATPOS=[[150,190],[1070,190],[150,700],[1070,700]];
const satLines=SATPOS.map(([x,y],i)=>{ const p=svgEl('path',{fill:'none',stroke:'#F06023','stroke-width':2.5,'stroke-dasharray':'6 7',d:`M800,500 C${800+(x+190-800)*0.3},${500} ${x+190},${y+100+(y<500?140:-140)} ${x+190},${y+(y<500?200:0)}`}); c360svg.appendChild(p);
  const dot=svgEl('circle',{r:6,fill:'#F06023'}); c360svg.appendChild(dot); return {p,dot}; });
scene({render(t){
  animHeadline(hl360,t,B.c360+0.2,B.cat-0.7);
  const vis=t>=B.c360-0.3&&t<B.cat+0.6; show(c360,vis); if(!vis) return;
  place(c360,0,0,C360Z);
  const out=ease(t,B.cat-0.5,B.cat+0.4,E.in);
  const cin=sp(t,B.c360,1.0,4.5,9);
  place(cCenter,580,420,60+out*500,(1-cin)*-25,0,0,lerp(0.7,1,cin)); op(cCenter,Math.min(1,cin*1.4)*(1-out));
  const focus=[B.c360+2.2,B.c360+3.4,B.c360+4.5,B.c360+5.5];
  sat.forEach((el,i)=>{ const [x,y]=SATPOS[i]; const st=B.c360+0.55+i*0.16, pin=sp(t,st,1.0,4.6,9);
    const f=ease(t,focus[i]-0.7,focus[i]-0.2,E.smooth)*(1-ease(t,focus[i]+0.6,focus[i]+1.0,E.smooth));
    const fl=Math.sin(t*1.2+i)*6;
    place(el,lerp(800-190,x,pin),lerp(500-100,y,pin)+fl,lerp(-200,0,pin)+f*70+out*(300+i*80),0,0,0,lerp(0.6,1,pin)*(1+0.05*f)); op(el,Math.min(1,pin*1.5)*(1-out));
    const L=satLines[i]; trim(L.p,ease(t,st+0.2,st+0.9,E.out)*(1-out)); L.p.style.strokeDasharray='6 7';
    const len=L.p.__len||(L.p.__len=L.p.getTotalLength()); const tt=((t*0.55+i*0.27)%1); const pt=L.p.getPointAtLength(len*tt);
    L.dot.setAttribute('cx',pt.x); L.dot.setAttribute('cy',pt.y); L.dot.style.opacity=(ease(t,st+0.8,st+1.1)*(1-out)).toFixed(3); L.p.style.opacity=(1-out).toFixed(3);
  });
}});

/* ======================================================================
   S5 — catalog & marketplace (26–34)
   ====================================================================== */
const hlCat=headline('hl-cat','CATALOG & MARKETPLACE','Every vendor. <em>One</em> <em>catalog.</em>');
const cards=PRODUCT_ORDER.map(id=>$('#pc-'+id));
const PANE_OFF=offs(panes.catalog,app); // pane origin in app space
const cardPos=cards.map(c=>{ const o=offs(c,app); return o; });
const cardClones=cards.map((c,i)=>{ const o=cardPos[i]; const e=add(F,`<div class="ui abs" style="width:${o.w}px;height:${o.h}px;transform-origin:50% 50%"></div>`);
  const cc=c.cloneNode(true); cc.removeAttribute('id'); cc.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id')); cc.style.height='100%'; e.appendChild(cc); return {e,card:cc,btn:cc.querySelector('.btn'),o}; });
const chipProd=panes.catalog.querySelector('[data-chip="Productivity"]'), chipAll=panes.catalog.querySelector('[data-chip="All products"]');
const CAT={chip:B.cat+2.85, hover:B.cat+4.15, add:B.cat+5.45, fly:B.cat+5.9};
const prem=2; const chipPos=offs(chipProd,app), qchipPos=offs($('#qchip'),app);
scene({render(t){
  animHeadline(hlCat,t,B.cat+0.3,B.build-0.7);
  const filtered=t>=CAT.chip;
  chipProd.classList.toggle('on',filtered); chipAll.classList.toggle('on',!filtered);
  chipProd.classList.toggle('hov',t>=CAT.chip-0.4&&t<CAT.chip+0.2);
  // in-app cards: hidden while the 3D copies fly in; non-productivity cards leave after filtering
  cards.forEach((c,i)=>{ const p=PRODUCTS[PRODUCT_ORDER[i]]; let o=1;
    const land=B.cat+0.35+i*0.11+1.05; if(t<land) o=0;
    if(p.category!=='Productivity'&&filtered){ o*=1-ease(t,CAT.chip,CAT.chip+0.35,E.smooth); }
    if(i===prem&&t>=CAT.hover-0.05&&t<CAT.fly+1.2) o=0;
    c.style.opacity=o.toFixed(3); c.classList.toggle('hov',false);
    const btn=c.querySelector('.btn'); btn.textContent=t>=CAT.add?'Add another +':'Add to quote +'; });
  cardClones.forEach((k,i)=>{ const o=k.o; let vis=false, x=o.x,y=o.y,z=0,rx=0,ry=0,rz=0,s=1,a=1;
    const st=B.cat+0.35+i*0.11;
    if(t>=st-0.01&&t<st+1.05){ vis=true; const pp=sp(t,st,1.05,4.2,8.5); z=(1-pp)*620; rx=(1-pp)*38; ry=(i%3-1)*(1-pp)*-18; y+=(1-pp)*-60; a=Math.min(1,pp*2); }
    if(i===prem&&t>=CAT.hover-0.05&&t<CAT.fly+1.2){ vis=true;
      const lift=ease(t,CAT.hover,CAT.hover+0.5,E.outSoft);
      z=lift*150; s=1+0.06*lift; k.card.classList.add('hov');
      k.btn.textContent=t>=CAT.add?'Add another +':'Add to quote +';
      k.btn.classList.toggle('hov',t>=CAT.add-0.55&&t<CAT.add+0.3); k.btn.classList.toggle('press',isPress(t,CAT.add));
      // shared-element flight into the quote chip
      const f=ease(t,CAT.fly,CAT.fly+0.9,E.expo);
      if(f>0){ x=lerp(o.x,qchipPos.x+qchipPos.w/2-o.w/2,f); y=lerp(o.y,qchipPos.y+qchipPos.h/2-o.h/2,f); z=lerp(z,30,f); s=lerp(s,0.08,f); a=1-ease(t,CAT.fly+0.7,CAT.fly+0.9); rz=f*-8; }
    }
    show(k.e,vis); if(!vis) return; place(k.e,x,y,z,rx,ry,rz,s); k.e.style.opacity=a.toFixed(3); });
}});

/* ======================================================================
   S6 — storefront builder (concept) (34–40)
   ====================================================================== */
const hlBuild=headline('hl-build','STOREFRONT BUILDER','Drag. Drop. <em>Publish.</em>');
const BW=1360,BH=640;
const builder=add(F,`<div class="fp ui" style="width:${BW}px;height:${BH}px;overflow:hidden;display:grid;grid-template-rows:56px 1fr">
  <div style="display:flex;align-items:center;gap:14px;padding:0 20px;border-bottom:1px solid var(--line)"><img src="assets/logo.png" style="width:110px"><span style="color:var(--mut2)">/</span><b style="font-size:13px">Storefront</b><span class="pill ok"><i></i>Draft</span>
    <div style="margin-left:auto;display:flex;gap:6px;background:#F3F4F6;border-radius:9px;padding:4px" id="dev">${['Desktop','Tablet','Mobile'].map((d,i)=>`<span class="devb" data-dev="${i}" style="padding:7px 12px;border-radius:7px;font:600 11px Inter;color:var(--mut)">${d}</span>`).join('')}</div>
    <span class="btn">Preview</span><span class="btn primary">Publish</span></div>
  <div style="display:grid;grid-template-columns:250px 1fr;min-height:0">
    <div style="border-right:1px solid var(--line);padding:18px 16px;background:#FBFBFC"><div class="lbl" style="margin-bottom:12px">Components</div>
      ${[['▭','Hero banner'],['▦','Product grid'],['◆','Featured product'],['➜','Call to action'],['¶','Text block'],['▁','Footer']].map(([ic,l],i)=>`<div class="comp" id="comp${i}"><span>${ic}</span>${l}</div>`).join('')}</div>
    <div id="canvasWrap" style="position:relative;background:#EEF0F3;overflow:hidden"><div id="canvas"></div></div></div></div>`);
document.head.insertAdjacentHTML('beforeend',`<style>
.comp{display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--line);border-radius:10px;background:#fff;margin-bottom:10px;font:600 12px Inter}
.comp span{width:28px;height:28px;border-radius:7px;background:#FFF1EA;color:var(--o);display:grid;place-items:center}
.devb.on{background:#fff;color:var(--ink)!important;box-shadow:0 1px 3px rgba(0,0,0,.1)}
#canvas{position:absolute;top:30px;left:50%;background:#fff;border-radius:10px;box-shadow:0 10px 30px -12px rgba(0,0,0,.2);overflow:hidden}
.cv-nav{height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;border-bottom:1px solid var(--line);font:600 13px Inter}
.cv-nav span{font-weight:500;color:var(--mut);font-size:11px;margin-left:18px}
.blk{position:absolute;left:0;right:0;overflow:hidden}
.drop{position:absolute;left:16px;right:16px;border:2px dashed #CDD2D8;border-radius:10px;display:grid;place-items:center;color:var(--mut2);font:500 12px Inter}
.ghost{position:absolute;left:0;top:0;width:220px;display:flex;align-items:center;gap:12px;padding:12px;border:1.5px solid var(--o);border-radius:10px;background:#fff;font:600 12px Inter;box-shadow:0 20px 40px -12px rgba(240,96,35,.45)}
.ghost span{width:28px;height:28px;border-radius:7px;background:#FFF1EA;color:var(--o);display:grid;place-items:center}
.guide{position:absolute;background:var(--o);opacity:0}
.tile{position:absolute;border:1px solid var(--line);border-radius:10px;padding:14px;background:#fff;font-size:11px}
.tile b{display:block;font-size:12.5px;margin:6px 0 10px;line-height:1.3}.tile strong{font:600 20px 'Inter Display'}
</style>`);
const cv=$('#canvas');
cv.innerHTML=`<div class="cv-nav">${WORKSPACE.name}<div><span>Products</span><span>Services</span><span>Contact</span></div></div>
  <div class="drop" id="dropz">Drag components here</div>
  <div class="blk" id="blk-hero"><div style="margin:16px;border-radius:12px;padding:34px 36px;background:linear-gradient(120deg,#1E2227,#3A3F45);color:#fff">
    <div style="font:700 10px Inter;letter-spacing:.2em;color:var(--y)">CLOUD SERVICES</div><div style="font:600 30px/1.15 'Inter Display';margin-top:10px;max-width:520px" class="herot">Cloud services for your business.</div>
    <div style="font-size:12px;color:#C9CED4;margin-top:10px;max-width:460px" class="herop">Microsoft 365, backup and managed support from one trusted partner.</div><span class="btn primary" style="margin-top:16px">Browse products</span></div></div>
  <div class="blk" id="blk-grid"></div>
  <div class="blk" id="blk-cta"><div style="margin:0 16px;border-radius:12px;padding:20px 24px;background:#FFF1EA;display:flex;align-items:center;justify-content:space-between;gap:12px"><b style="font-size:15px">Need help choosing the right plan?</b><span class="btn primary">Talk to our team</span></div></div>`;
const TILES=['m365-premium','acronis-backup','managed-support'].map(id=>{ const p=PRODUCTS[id];
  return add($('#blk-grid'),`<div class="tile"><span style="color:var(--mut)">${p.vendor}</span><b>${p.name}</b><strong>${money(p.price)}</strong> <span style="color:var(--mut2);font-size:10px">/ ${p.unit}</span></div>`); });
const ghost=add($('#floaters'),`<div class="ghost ui"><span>▭</span><em style="font-style:normal">Hero banner</em></div>`);
const guides=[0,1,2].map(()=>add(cv,`<div class="guide"></div>`));
const BLD={g1:B.build+0.75,d1:B.build+1.75,g2:B.build+2.15,d2:B.build+3.05,g3:B.build+3.35,d3:B.build+4.15,tab:B.build+4.55,mob:B.build+5.15};
const DEVW=[[1000,3],[700,2],[400,1]];
function canvasLayout(t){ // width + columns, animated between device widths
  const p1=ease(t,BLD.tab,BLD.tab+0.6,E.inOut), p2=ease(t,BLD.mob,BLD.mob+0.6,E.inOut);
  const w=lerp(lerp(1000,700,p1),400,p2); return {w,p1,p2};
}
const builderPos={x:120,y:70,z:240};
const compPos=i=>({x:builderPos.x+16+0,y:builderPos.y+56+18+22+i*54});
scene({render(t){
  animHeadline(hlBuild,t,B.build+0.25,B.quote-0.7);
  const vis=t>=B.build-0.5&&t<B.quote+0.5; show(builder,vis); show(ghost,false); if(!vis) return;
  const pin=sp(t,B.build-0.4,1.1,4.4,9), out=ease(t,B.quote-0.5,B.quote+0.3,E.in);
  place(builder,builderPos.x+out*900,builderPos.y+(1-pin)*120,builderPos.z-(1-pin)*500+out*200,(1-pin)*16,(1-pin)*-12+out*-20,0,1); op(builder,Math.min(1,pin*1.4)*(1-out));
  const {w,p1,p2}=canvasLayout(t); cv.style.width=w+'px'; cv.style.marginLeft=(-w/2)+'px'; cv.style.height='560px';
  $$('#dev .devb').forEach((b,i)=>b.classList.toggle('on',i===(t>=BLD.mob?2:t>=BLD.tab?1:0)));
  // blocks drop in with springs
  const hb=sp(t,BLD.d1,0.8,5,11), gb=sp(t,BLD.d2,0.8,5,11), cb=sp(t,BLD.d3,0.8,5,11);
  const heroH=lerp(220,lerp(250,330,p2),p1), gridTop=52+(t>=BLD.d1?heroH:0), cols=p2>0.5?1:p1>0.5?2:3;
  const hero=$('#blk-hero'); hero.style.top='52px'; hero.style.opacity=(t>=BLD.d1?Math.min(1,hb*1.3):0).toFixed(3); hero.style.transform=`scale(${lerp(0.94,1,hb).toFixed(4)})`;
  hero.querySelector('.herot').style.fontSize=lerp(30,22,p2)+'px';
  // product grid with responsive reflow
  const gw=w-32, gap=12, tw=(gw-gap*(cols-1))/cols, th=120;
  const grid=$('#blk-grid'); grid.style.top=gridTop+'px'; const rows=Math.ceil(3/cols); grid.style.height=(rows*(th+gap)+16)+'px';
  grid.style.opacity=(t>=BLD.d2?Math.min(1,gb*1.3):0).toFixed(3); grid.style.transform=`scale(${lerp(0.94,1,gb).toFixed(4)})`;
  TILES.forEach((el,i)=>{ el.style.width=tw+'px'; el.style.height=th+'px'; el.style.left=(16+(i%cols)*(tw+gap))+'px'; el.style.top=(8+Math.floor(i/cols)*(th+gap))+'px'; });
  const ctaTop=gridTop+(t>=BLD.d2?rows*(th+gap)+16:0);
  const cta=$('#blk-cta'); cta.style.top=ctaTop+'px'; cta.style.opacity=(t>=BLD.d3?Math.min(1,cb*1.3):0).toFixed(3); cta.style.transform=`scale(${lerp(0.94,1,cb).toFixed(4)})`;
  const dz=$('#dropz'); const dzTop=t<BLD.d1?62:t<BLD.d2?gridTop+8:t<BLD.d3?ctaTop+8:ctaTop+80; dz.style.top=dzTop+'px'; dz.style.height='70px';
  dz.style.opacity=(t<BLD.d3+0.3?1-ease(t,BLD.d3,BLD.d3+0.3):0).toFixed(3);
  const dragging=[[BLD.g1,BLD.d1,0],[BLD.g2,BLD.d2,1],[BLD.g3,BLD.d3,3]].find(([a,b])=>t>=a&&t<b);
  dz.style.borderColor=dragging&&t>dragging[1]-0.35?'#F06023':'#CDD2D8'; dz.style.background=dragging&&t>dragging[1]-0.35?'rgba(240,96,35,.06)':'transparent';
  // snap guides
  guides.forEach((g,i)=>{ const on=dragging&&t>dragging[1]-0.35; g.style.opacity=on?(0.9).toFixed(2):0;
    if(i===0){ g.style.left='16px'; g.style.right='16px'; g.style.height='2px'; g.style.top=dzTop+'px'; }
    if(i===1){ g.style.left='16px'; g.style.width='2px'; g.style.top=(dzTop-30)+'px'; g.style.height='130px'; }
    if(i===2){ g.style.right='16px'; g.style.width='2px'; g.style.top=(dzTop-30)+'px'; g.style.height='130px'; } });
  $$('.comp').forEach((c,i)=>{ c.style.opacity=dragging&&dragging[2]===i?0.45:1; });
  if(dragging){ const [a,b,ci]=dragging; show(ghost,true); ghost.querySelector('em').textContent=['Hero banner','Product grid','','Call to action'][ci]; ghost.querySelector('span').textContent=['▭','▦','','➜'][ci];
    const k=cursorAt(t); const s=1+0.05*Math.sin(Math.PI*prog(t,a,b)); place(ghost,k.x-30,k.y-22,k.z+2,0,0,lerp(-3,0,prog(t,b-0.3,b)),s); ghost.style.opacity=(ease(t,a,a+0.15)*(1-ease(t,b-0.05,b+0.05))).toFixed(3); }
}});

/* ======================================================================
   S7 — quote generation (40–47)
   ====================================================================== */
const hlQuote=headline('hl-quote','QUOTES','Accurate quotes, <em>priced</em> <em>instantly.</em>');
const QZ=150, QX=480, QY=170, QW=640;
const NW=300, NGAP=90, NY=420, NX0=800-(NW*4+NGAP*3)/2, NZ=160;
const qb=add(F,`<div class="fp ui" style="width:${QW}px;padding:28px 30px">
  <div id="qb-form"><div class="eyb">01 / CREATE A QUOTE</div><h1 style="margin-top:10px">Make the offer clear.</h1><p style="color:var(--mut);margin-top:8px">Choose a customer and set quantities. Prices before taxes.</p>
  <div class="lbl" style="margin-top:20px">Customer</div>
  <div id="qb-sel" style="position:relative;margin-top:8px;height:42px;border:1px solid #D5D9DE;border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;font-size:13px"><span id="qb-cust">Solace Digital</span><span style="color:var(--mut2)">▾</span></div>
  <div id="qb-dd" class="fp" style="position:absolute;left:30px;top:200px;width:${QW-60}px;padding:6px;z-index:5;border-radius:10px">${Object.values(CUSTOMERS).map((c,i)=>`<div class="dd" id="dd${i}" style="padding:10px 12px;border-radius:7px;font-size:13px;display:flex;gap:10px;align-items:center"><span class="mono" style="width:26px;height:26px;font-size:9px">${c.initials}</span>${c.name}</div>`).join('')}</div>
  <div class="tbl" style="margin-top:20px;border:1px solid var(--line);border-radius:10px"><div class="tr th" style="grid-template-columns:2fr .9fr .9fr .9fr"><div>Product</div><div>Quantity</div><div>Price / unit</div><div>Line total</div></div>
    <div class="tr" style="grid-template-columns:2fr .9fr .9fr .9fr"><div><strong>Microsoft 365 Business Premium</strong></div><div><span id="qb-qty" style="display:inline-block;width:64px;border:1px solid #D5D9DE;border-radius:7px;padding:7px 10px;font-variant-numeric:tabular-nums">1</span></div><div><span style="display:inline-block;width:64px;border:1px solid #D5D9DE;border-radius:7px;padding:7px 10px">28</span></div><div class="num"><b id="qb-line">$28</b></div></div></div>
  <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:20px"><div><small style="font-size:11px">Quote value / cycle</small><div id="qb-total" style="font:600 34px 'Inter Display';font-variant-numeric:tabular-nums">$28</div></div>
    <div style="text-align:right"><small style="font-size:11px">Gross margin</small><div style="font:600 34px 'Inter Display'">21.4%</div></div></div>
  <span class="btn primary" id="qb-save" style="width:100%;margin-top:18px;padding:13px">Save draft quote →</span></div>
  <div id="qb-doc" style="position:absolute;inset:28px 30px;opacity:0"><div class="eyb">QUOTE / ${NEW_QUOTE.id}</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px"><h1>Harborstone Systems</h1><span id="qd-pill">${pill('Draft')}</span></div>
    <p style="color:var(--mut);margin-top:8px">${NEW_QUOTE.created} · Monthly billing cycle</p>
    <div class="tbl" style="margin-top:20px;border:1px solid var(--line);border-radius:10px"><div class="tr th" style="grid-template-columns:2fr .6fr .8fr .8fr"><div>Product</div><div>Qty</div><div>Unit price</div><div>Amount</div></div>
      <div class="tr" style="grid-template-columns:2fr .6fr .8fr .8fr"><div><strong>Microsoft 365 Business Premium</strong></div><div>30</div><div>$28</div><div class="num">$840</div></div></div>
    <div style="display:flex;justify-content:flex-end;align-items:baseline;gap:16px;margin-top:22px"><small style="font-size:11px">Total / billing cycle</small><b style="font:600 40px 'Inter Display'">$840</b></div>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px"><span class="btn">Export CSV ↓</span><span class="btn primary" id="qd-accept">Accept &amp; create order →</span></div>
    <div id="qd-check" style="position:absolute;right:-10px;top:-14px;width:46px;height:46px;border-radius:50%;background:var(--ok);color:#fff;display:grid;place-items:center;font:700 22px Inter;box-shadow:0 8px 20px -6px rgba(46,139,87,.6)">✓</div></div></div>`);
document.head.insertAdjacentHTML('beforeend','<style>.dd.hov{background:#FFF1EA;color:var(--o)}</style>');
const QT={open:B.quote+0.95,pick:B.quote+1.75,qty:B.quote+2.35,qtyEnd:B.quote+3.75,save:B.quote+4.35,doc:B.quote+4.55};
const qbH0=640;
scene({render(t){
  animHeadline(hlQuote,t,B.quote+0.25,B.order-0.6);
  const vis=t>=B.quote-0.3&&t<B.order+1.4; show(qb,vis); if(!vis) return;
  const pin=sp(t,B.quote-0.2,1.0,4.6,9);
  // quote → order morph handled in S8 (shrink + move into the workflow)
  const m=ease(t,B.order+0.35,B.order+1.25,E.expo);
  const x=lerp(QX,1600*0.5-120-QW*0.5*0+0,0)+0;
  place(qb,lerp(QX,NX0,m),lerp(QY+(1-pin)*80,NY,m),lerp(QZ-(1-pin)*400,NZ,m),(1-pin)*14,0,0,lerp(1,NW/QW,m)); qb.style.transformOrigin='0 0';
  op(qb,Math.min(1,pin*1.5)*(1-ease(t,B.order+1.0,B.order+1.25)));
  const form=$('#qb-form'), doc=$('#qb-doc'); const dp=ease(t,QT.doc,QT.doc+0.6,E.inOut);
  form.style.opacity=(1-dp).toFixed(3); doc.style.opacity=dp.toFixed(3); doc.style.transform=`translate3d(0,${((1-dp)*16).toFixed(1)}px,0)`;
  qb.style.height=lerp(qbH0,500,dp)+'px';
  const dd=$('#qb-dd'), ddo=ease(t,QT.open,QT.open+0.2)*(1-ease(t,QT.pick+0.05,QT.pick+0.25)); dd.style.opacity=ddo.toFixed(3); dd.style.transform=`translate3d(0,${((1-ddo)*-8).toFixed(1)}px,0)`; show(dd,ddo>0.01);
  $$('.dd').forEach((d,i)=>d.classList.toggle('hov',i===2&&t>QT.pick-0.4));
  $('#qb-cust').textContent=t>=QT.pick?'Harborstone Systems':'Solace Digital';
  $('#qb-sel').style.borderColor=t>=QT.open&&t<QT.pick+0.3?'#F06023':'#D5D9DE';
  const q=Math.round(lerp(1,30,ease(t,QT.qty,QT.qtyEnd,E.inOut)));
  $('#qb-qty').textContent=q; $('#qb-qty').style.borderColor=t>=QT.qty-0.2&&t<QT.qtyEnd+0.2?'#F06023':'#D5D9DE';
  $('#qb-line').textContent=money(q*28); $('#qb-total').textContent=money(q*28);
  const save=$('#qb-save'); save.classList.toggle('hov',t>=QT.save-0.4); save.classList.toggle('press',isPress(t,QT.save));
  const ck=sp(t,QT.doc+0.4,0.7,4,12); $('#qd-check').style.transform=`scale(${ck.toFixed(3)})`; $('#qd-check').style.opacity=(1-ease(t,B.order+0.2,B.order+0.5)).toFixed(3);
  const acc=$('#qd-accept'); acc.classList.toggle('hov',t>=B.order-0.15&&t<B.order+0.4); acc.classList.toggle('press',isPress(t,B.order+0.2));
  $('#qd-pill').innerHTML=pill(t>=B.order+0.25?'Accepted':'Draft');
  // new row appears in the quotes table behind
  const nr=$('#q-row-new'); const rr=ease(t,QT.doc+0.3,QT.doc+0.8,E.out); nr.style.opacity=rr.toFixed(3); nr.classList.toggle('hilite',t>QT.doc+0.3);
}});

/* ======================================================================
   S8 — quote → order → fulfillment → subscription (47–54)
   ====================================================================== */
const hlOrder=headline('hl-order','ORDERS & FULFILLMENT','From quote to <em>active</em> <em>service.</em>');
const NODES=[
  {k:'QUOTE',id:NEW_QUOTE.id,sub:'Harborstone Systems · $840',st:['Draft','Accepted']},
  {k:'ORDER',id:NEW_ORDER.id,sub:'Linked to Q-1025 · $840 / cycle',st:['Pending','Fulfilled']},
  {k:'FULFILLMENT',id:'1 subscription',sub:'Order ORD-1026 fulfilled',st:['Pending','Fulfilled']},
  {k:'SUBSCRIPTION',id:NEW_SUB.id,sub:'30 seats · Renews Nov 28, 2026',st:['Pending','Active']},
];
const SUBROW={}; SUBS_AFTER.forEach(x=>SUBROW[x.id]=offs($('#sr-'+x.id),app));

const NODE_IN=i=>i===0?B.order+1.0:NT[i][0]-0.5;
const nodes=NODES.map((n,i)=>add(F,`<div class="fp ui" style="width:${NW}px;padding:18px 20px"><div style="display:flex;align-items:center;gap:12px">
  <svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" fill="none" stroke="#EEF0F2" stroke-width="4"/><circle class="ring" cx="22" cy="22" r="18" fill="none" stroke="#F06023" stroke-width="4" stroke-linecap="round" transform="rotate(-90 22 22)" stroke-dasharray="113.1 113.1" stroke-dashoffset="113.1"/>
  <text class="ck" x="22" y="28" text-anchor="middle" style="font:700 16px Inter;fill:#2E8B57;opacity:0">✓</text><text class="nn" x="22" y="27" text-anchor="middle" style="font:700 13px Inter;fill:#9AA0A6">${i+1}</text></svg>
  <div><div class="eyb">${n.k}</div><div style="font:600 18px 'Inter Display';margin-top:4px">${n.id}</div></div></div>
  <small style="font-size:11px;margin-top:12px">${n.sub}</small><div class="nst" style="margin-top:10px">${pill(n.st[0])}</div></div>`));
const flowSvg=svgEl('svg',{width:1600,height:1000,viewBox:'0 0 1600 1000',style:'position:absolute;left:0;top:0;overflow:visible'});
const flowWrap=add(F,`<div class="w3"></div>`); flowWrap.appendChild(flowSvg);
const conns=[0,1,2].map(i=>{ const x1=NX0+(i+1)*NW+i*NGAP, x2=x1+NGAP, y=NY+56; const p=svgEl('path',{d:`M${x1+4},${y} L${x2-4},${y}`,stroke:'#F06023','stroke-width':3,fill:'none','stroke-linecap':'round'}); flowSvg.appendChild(p);
  const pulse=svgEl('circle',{r:7,fill:'#FFD600',stroke:'#F06023','stroke-width':2}); flowSvg.appendChild(pulse); return {p,pulse,x1,x2,y}; });
const NT=[[B.order+0.6,B.order+1.2],[B.order+1.6,B.order+3.0],[B.order+3.3,B.order+4.5],[B.order+4.8,B.order+5.5]]; // progress windows
scene({render(t){
  animHeadline(hlOrder,t,B.order+0.3,B.subs-0.6);
  const vis=t>=B.order+0.6&&t<B.subs+1.2; nodes.forEach(n=>show(n,vis)); show(flowWrap,vis); if(!vis) return;
  place(flowWrap,0,0,NZ);
  const out=ease(t,B.subs-0.3,B.subs+0.5,E.in);
  nodes.forEach((el,i)=>{ const [a,b]=NT[i]; const pin=i===0?ease(t,B.order+0.95,B.order+1.2,E.smooth):sp(t,a-0.5,0.9,4.6,10);
    let x=NX0+i*(NW+NGAP), y=NY, z=NZ, s=1;
    if(i===3){ // the new subscription flies on into the subscriptions table (shared element)
      const f=ease(t,B.subs-0.1,B.subs+0.9,E.expo); const row=SUBROW['SUB-1027']; x=lerp(x,row.x+40,f); y=lerp(y,row.y-20,f); z=lerp(z,10,f); s=lerp(1,0.85,f); }
    place(el,x,y+(i?(1-pin)*50:0),z-(i?(1-pin)*300:0),i?(1-pin)*20:0,0,0,s); op(el,Math.min(1,pin*1.5)*(i===3?1-ease(t,B.subs+0.6,B.subs+1.0):1-out));
    const pr=ease(t,a,b,E.inOut); const ring=el.querySelector('.ring'); ring.setAttribute('stroke-dashoffset',(113.1*(1-pr)).toFixed(2));
    const done=t>=b; el.querySelector('.ck').style.opacity=done?1:0; el.querySelector('.nn').style.opacity=done?0:1; ring.setAttribute('stroke',done?'#2E8B57':'#F06023');
    el.querySelector('.nst').innerHTML=pill(done?NODES[i].st[1]:NODES[i].st[0]);
    el.style.boxShadow=(t>=a&&t<b+0.3)?'0 0 0 3px rgba(240,96,35,.25),0 30px 70px -24px rgba(30,34,39,.3)':'';
  });
  conns.forEach((c,i)=>{ const d=ease(t,NT[i][1],NT[i][1]+0.5,E.out); trim(c.p,d); c.p.style.opacity=(1-out).toFixed(3);
    const pp=((t-NT[i][1])*1.6)%1; const on=t>NT[i][1]+0.4&&t<B.subs; c.pulse.setAttribute('cx',lerp(c.x1,c.x2,pp)); c.pulse.setAttribute('cy',c.y); c.pulse.style.opacity=on?(1-out):0; });
  // the order row in the app updates when fulfilled
  $('#ord-pill').innerHTML=pill(t>=NT[1][1]?'Fulfilled':'Pending');
}});

/* ======================================================================
   S9 — subscriptions (54–61)
   ====================================================================== */
const hlSubs=headline('hl-subs','SUBSCRIPTIONS','Recurring revenue, <em>under</em> <em>control.</em>');
const renew=add(F,`<div class="fp ui" style="width:560px;padding:20px 24px"><div style="display:flex;justify-content:space-between"><div class="lbl">Upcoming renewals · November 2026</div><span class="lbl" style="color:var(--o)">MONTHLY CYCLE</span></div>
  <div style="position:relative;height:120px;margin-top:16px"><div id="rn-line" style="position:absolute;left:0;right:0;top:44px;height:3px;border-radius:2px;background:#EEF0F2"></div><div id="rn-fill" style="position:absolute;left:0;top:44px;height:3px;border-radius:2px;background:var(--o)"></div>
  ${[1,8,15,22,30].map(d=>`<span style="position:absolute;left:${(d-1)/29*100}%;top:58px;transform:translateX(-50%);font-size:10px;color:var(--mut2)">Nov ${d}</span>`).join('')}
  ${[[15,'Solace Digital','SUB-1002'],[28,'Harborstone Systems','SUB-1027'],[30,'Cedarline · Harborstone','SUB-1001 · SUB-1003']].map(([d,c,s],i)=>`<div class="rn-m" style="position:absolute;left:${(d-1)/29*100}%;top:34px;transform:translateX(-50%)"><div style="width:22px;height:22px;border-radius:50%;background:#fff;border:3px solid ${i===1?'#F06023':'#1E2227'}"></div>
    <div style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:10.5px;text-align:center;background:#fff;border:1px solid var(--line);border-radius:7px;padding:5px 8px"><b>Nov ${d}, 2026</b><small>${c}</small></div></div>`).join('')}</div>
  <div style="display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:12px;font-size:11.5px"><span style="color:var(--mut)">Recurring billing · 4 active subscriptions</span><b id="rn-val">$2,560 / month</b></div></div>`);
const manage=add(F,`<div class="fp ui" style="width:600px;padding:26px 28px"><div class="eyb">SUBSCRIPTION / ${NEW_SUB.id}</div><h1 style="margin-top:10px;font-size:26px">Microsoft 365 Business Premium</h1>
  <p style="color:var(--mut);margin-top:6px">Harborstone Systems · Active · Renewal Nov 28, 2026</p>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px">${[['Current quantity','30'],['Price / unit','$28'],['Value / cycle','$840']].map(([l,v])=>`<div style="border:1px solid var(--line);border-radius:10px;padding:12px 14px"><small style="font-size:10px;margin:0">${l}</small><b style="font:600 22px 'Inter Display'">${v}</b></div>`).join('')}</div>
  <div class="lbl" style="margin-top:18px">Subscription quantity</div><div style="margin-top:8px;height:40px;border:1px solid #D5D9DE;border-radius:8px;display:flex;align-items:center;padding:0 14px">30</div>
  <span class="btn primary" style="width:100%;margin-top:14px;padding:12px">Save quantity →</span>
  <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:12px"><span class="btn">Suspend</span><span class="btn" id="mg-bill">View billing →</span></div></div>`);
const SB={row:B.subs+0.6, manage:B.subs+4.45, bill:B.subs+6.4};
scene({render(t){
  animHeadline(hlSubs,t,B.subs+0.3,B.inv-0.6);
  const row=$('#sr-SUB-1027'); row.classList.toggle('hilite',t>=SB.row&&t<B.inv+1.6);
  row.style.opacity=t<B.subs+0.55?0:1;
  const vis=t>=B.subs+0.6&&t<B.inv+0.8; show(renew,vis); show(manage,vis); if(!vis) return;
  const rin=sp(t,B.subs+1.3,1.0,4.6,9), rout=ease(t,B.inv-0.3,B.inv+0.4,E.in);
  place(renew,960,660+(1-rin)*60,180-(1-rin)*300+rout*300,(1-rin)*18,-10,0,1); op(renew,Math.min(1,rin*1.5)*(1-rout));
  const fl=ease(t,B.subs+1.7,B.subs+3.0,E.inOut); $('#rn-fill').style.width=(fl*100).toFixed(2)+'%';
  $$('.rn-m').forEach((m,i)=>{ const p=sp(t,B.subs+1.9+i*0.35,0.7,4,12); m.style.opacity=Math.min(1,p*2).toFixed(3); m.style.transform=`translateX(-50%) scale(${(0.6+0.4*p).toFixed(3)})`; });
  const min=sp(t,SB.manage,0.9,4.6,10), mout=ease(t,SB.bill+0.15,SB.bill+0.6,E.in);
  place(manage,560,240+(1-min)*50,200-(1-min)*300+mout*250,(1-min)*14,0,0,lerp(0.9,1,min)); op(manage,t>=SB.manage?Math.min(1,min*1.5)*(1-mout):0);
  const vb=$('#mg-bill'); vb.classList.toggle('hov',t>=SB.bill-0.45&&t<SB.bill+0.2); vb.classList.toggle('press',isPress(t,SB.bill));
  // "Manage" button in the row
  const mb=row.querySelector('.btn.sm'); mb.classList.toggle('hov',t>=SB.manage-0.5&&t<SB.manage+0.2); mb.classList.toggle('press',isPress(t,SB.manage-0.05));
}});

/* ======================================================================
   S10 — invoice processing + export (61–68)
   ====================================================================== */
const hlInv=headline('hl-inv','BILLING & INVOICES','Invoices from <em>real</em> <em>subscriptions.</em>');
const IW=620, IX=880, IY=160, IZ=160;
const invDoc=add(F,`<div class="fp ui" style="width:${IW}px;padding:30px 34px"><div style="display:flex;justify-content:space-between"><div><div class="eyb">INVOICE</div><div style="font:600 32px 'Inter Display';margin-top:8px">${INV_HARBOR_NEW.id}</div></div><div>${pill('Draft')}</div></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px;font-size:11.5px;color:var(--mut)"><div>From<br><b style="color:var(--ink)">${WORKSPACE.name}</b></div><div>Bill to<br><b style="color:var(--ink)">Harborstone Systems</b></div><div>Billing period<br><b style="color:var(--ink)">Oct 2026</b></div><div>Currency<br><b style="color:var(--ink)">USD · before taxes</b></div></div>
  <div class="tbl" style="margin-top:20px;border:1px solid var(--line);border-radius:10px"><div class="tr th" style="grid-template-columns:2fr .5fr .8fr .8fr"><div>Product</div><div>Qty</div><div>Unit price</div><div>Amount</div></div>
    ${INV_HARBOR_NEW.lines.map((l,i)=>`<div class="tr" id="il${i}" style="grid-template-columns:2fr .5fr .8fr .8fr"><div><strong>${PRODUCTS[l.product].name}</strong><small>${l.sub}</small></div><div>${l.qty}</div><div>${money(l.price)}</div><div class="num"><b id="ila${i}">${money(l.qty*l.price)}</b></div></div>`).join('')}</div>
  <div style="display:flex;justify-content:flex-end;align-items:baseline;gap:16px;margin-top:20px"><small style="font-size:11px">Total / billing cycle</small><b id="inv-tot" style="font:600 44px 'Inter Display';font-variant-numeric:tabular-nums">$0</b></div>
  <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px"><span class="btn" id="inv-exp">Export invoice data ↓</span><span class="btn primary">Review reconciliation →</span></div></div>`);
const rowFly=INV_HARBOR_NEW.lines.map(l=>add(F,`<div class="ui abs" style="width:1270px;background:#fff;border:1px solid #F9CDB5;border-radius:10px;box-shadow:0 16px 36px -14px rgba(240,96,35,.4)"><div class="tbl t6" style="pointer-events:none">${subRow(SUBS_AFTER.find(s=>s.id===l.sub)).replace(/id="[^"]*"/,'')}</div></div>`));
const dl=add(F,`<div class="fp ui" style="width:300px;padding:14px 16px;display:flex;align-items:center;gap:14px"><svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="#EEF0F2" stroke-width="4"/><circle id="dl-ring" cx="20" cy="20" r="16" fill="none" stroke="#2E8B57" stroke-width="4" stroke-linecap="round" transform="rotate(-90 20 20)" stroke-dasharray="100.5 100.5" stroke-dashoffset="100.5"/><text id="dl-ck" x="20" y="26" text-anchor="middle" style="font:700 15px Inter;fill:#2E8B57;opacity:0">✓</text></svg>
  <div><b style="font-size:13px">INV-2603.csv</b><small id="dl-st">Exporting…</small></div></div>`);
const IV={fly:B.inv+0.7, flyEnd:B.inv+1.9, total:B.inv+2.2, exp:B.inv+3.9, dl:B.inv+4.1};
scene({render(t){
  animHeadline(hlInv,t,B.inv+0.3,B.rec-0.6);
  const vis=t>=B.inv-0.2&&t<B.rec+1.2; show(invDoc,vis); show(dl,vis&&t>=IV.dl); rowFly.forEach(r=>show(r,false)); if(!vis) return;
  const pin=sp(t,B.inv,1.0,4.6,9);
  const toRec=ease(t,B.rec-0.2,B.rec+0.8,E.expo); // shrinks to the side as reconciliation opens
  place(invDoc,lerp(IX,1250,toRec),IY+(1-pin)*60,lerp(IZ-(1-pin)*400,60,toRec),(1-pin)*16,lerp(-6,-18,toRec),0,lerp(1,0.6,toRec)); invDoc.style.transformOrigin='0 0';
  op(invDoc,Math.min(1,pin*1.5)*(1-ease(t,B.rec-0.2,B.rec+0.25)));
  // subscription rows lift out of the table and become invoice lines
  INV_HARBOR_NEW.lines.forEach((l,i)=>{ const st=IV.fly+i*0.25, en=IV.flyEnd+i*0.25; const il=$('#il'+i);
    il.style.opacity=t<en?0:1;
    if(t>=st&&t<en+0.05){ const r=rowFly[i], src=SUBROW[l.sub]; const f=ease(t,st,en,E.expo);
      const tgt=offs(il,invDoc); const dx=IX+tgt.x, dy=IY+tgt.y;
      show(r,true); place(r,lerp(src.x,dx,f),lerp(src.y,dy,f),lerp(4,IZ,f),0,0,0,lerp(1,0.44,f)); r.style.transformOrigin='0 0'; r.style.opacity=(1-ease(t,en-0.2,en)).toFixed(3); }
    const a=ease(t,en,en+0.6,E.outSoft); countTo($('#ila'+i),0,l.qty*l.price,a); });
  countTo($('#inv-tot'),0,sumLines(INV_HARBOR_NEW.lines),ease(t,IV.total,IV.total+1.1,E.outSoft));
  const ex=$('#inv-exp'); ex.classList.toggle('hov',t>=IV.exp-0.45&&t<IV.exp+0.2); ex.classList.toggle('press',isPress(t,IV.exp));
  // download chip pops out of the button and settles bottom-right
  const dp=sp(t,IV.dl,1.0,4.6,9), dout=ease(t,B.rec-0.3,B.rec+0.3,E.in);
  place(dl,lerp(IX+300,1240,dp),lerp(IY+520,820,dp),lerp(IZ+40,240,dp),0,0,0,lerp(0.4,1,dp)); op(dl,t>=IV.dl?Math.min(1,dp*2)*(1-dout):0);
  const pr=ease(t,IV.dl+0.5,IV.dl+1.6,E.inOut); $('#dl-ring').setAttribute('stroke-dashoffset',(100.5*(1-pr)).toFixed(2));
  const done=pr>=1; $('#dl-ck').style.opacity=done?1:0; $('#dl-st').textContent=done?'Downloaded · 2 line items':'Exporting…';
  // invoice row in the app updates to the new total
  const ir=$('#ir-INV-2603'); if(ir) ir.classList.toggle('hilite',t>=B.inv+1.4&&t<B.rec+0.6);
}});

/* ======================================================================
   S11 — reconciliation (68–75)
   ====================================================================== */
const hlRec=headline('hl-rec','RECONCILIATION','Catch every <em>billing</em> <em>gap.</em>');
const REC=[
  {c:'Cedarline Solutions',p:'Microsoft 365 Business Standard',sq:52,cost:624,inv:'INV-2601',iq:48,amt:720,fixQ:52,fixA:780},
  {c:'Solace Digital',p:'Microsoft 365 Business Basic',sq:80,cost:480,inv:'INV-2602',iq:80,amt:640},
  {c:'Harborstone Systems',p:'Microsoft 365 Business Premium',sq:30,cost:660,inv:'INV-2603',iq:30,amt:840},
  {c:'Harborstone Systems',p:'Cloud Backup',sq:30,cost:210,inv:'INV-2603',iq:30,amt:300},
];
const RW=1340, RX=130, RY=150, RZ=150;
const board=add(F,`<div class="fp ui" style="width:${RW}px;padding:24px 28px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:220px">
  <div><div class="lbl">Supplier records</div><div style="font:600 20px 'Inter Display';margin:6px 0 14px">Vendor billing · Oct 2026</div>${REC.map((r,i)=>`<div class="rr" id="rl${i}"><div><b>${r.c}</b><small>${r.p}</small></div><div class="q"><b>${r.sq}</b><small>units · ${money(r.cost)} cost</small></div></div>`).join('')}</div>
  <div><div class="lbl">Customer billing</div><div style="font:600 20px 'Inter Display';margin:6px 0 14px">Draft invoices · Oct 2026</div>${REC.map((r,i)=>`<div class="rr" id="rr${i}"><div><b>${r.inv} · ${r.c.split(' ')[0]}</b><small>${r.p}</small></div><div class="q"><b class="iq">${r.iq}</b><small class="ia">units · ${money(r.amt)}</small></div></div>`).join('')}</div></div></div>`);
document.head.insertAdjacentHTML('beforeend',`<style>.rr{display:flex;justify-content:space-between;align-items:center;border:1px solid var(--line);border-radius:10px;padding:12px 16px;margin-bottom:12px;height:66px;background:#fff}
.rr .q{text-align:right}.rr .q b{font:600 22px 'Inter Display'}.rr.bad{border-color:#F3B4B4;background:#FFF7F7}.rr.good{border-color:#BFE3CD}</style>`);
const recSvg=svgEl('svg',{width:RW,height:500,viewBox:`0 0 ${RW} 500`,style:'position:absolute;left:0;top:0;overflow:visible;pointer-events:none'}); board.appendChild(recSvg);
const recLines=REC.map((r,i)=>{ const p=svgEl('path',{fill:'none','stroke-width':3,'stroke-linecap':'round'}); recSvg.appendChild(p);
  const b=svgEl('g'); b.innerHTML=`<circle r="13" fill="#fff" stroke-width="2.5"/><text y="5" text-anchor="middle" style="font:700 13px Inter"></text>`; recSvg.appendChild(b); return {p,b}; });
const gapBadge=add(board,`<div style="position:absolute;left:50%;top:0;transform:translate(-50%,-50%);background:#FDECEC;color:var(--bad);border:1px solid #F3B4B4;border-radius:20px;padding:8px 14px;font:700 12px Inter;white-space:nowrap;box-shadow:0 10px 24px -10px rgba(214,69,69,.5)">+4 seats · $60 unbilled</div>`);
const fixP=add(F,`<div class="fp ui" style="width:520px;padding:22px 24px"><div class="eyb">RECONCILIATION / REVIEW THE EXCEPTION</div><h1 style="font-size:24px;margin-top:8px">Cedarline Solutions</h1>
  <p style="color:var(--mut);margin-top:4px">Microsoft 365 Business Standard · SUB-1001 · October 2026</p>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px">${[['Supplier quantity','52'],['Subscription','52'],['Draft invoice','48']].map(([l,v],i)=>`<div style="border:1px solid ${i===2?'#FAD8C4':'var(--line)'};background:${i===2?'#FFF8F3':'#fff'};border-radius:10px;padding:10px 12px"><small style="margin:0;font-size:9.5px">${l}</small><b style="font:600 22px 'Inter Display'">${v}</b></div>`).join('')}</div>
  <div style="display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);border-radius:10px;padding:12px;margin-top:14px;font-size:12px"><span id="fx-cb" style="width:18px;height:18px;border-radius:5px;border:2px solid #C9CED4;display:grid;place-items:center;color:#fff;font:700 12px Inter;flex:none"></span>
  <div><b>I have reviewed the difference.</b><small style="font-size:11px">Align the active subscription and its draft invoice quantity to the supplier’s 52 units.</small></div></div>
  <span class="btn primary" id="fx-apply" style="width:100%;margin-top:14px;padding:12px">Apply correction →</span></div>`);
const RC={draw:B.rec+0.9, badge:B.rec+2.3, open:B.rec+3.4, check:B.rec+4.25, apply:B.rec+4.9, fixed:B.rec+5.2};
scene({render(t){
  animHeadline(hlRec,t,B.rec+0.3,B.prof-0.6);
  const vis=t>=B.rec-0.2&&t<B.prof+0.8; show(board,vis); show(fixP,vis&&t>=RC.open-0.1&&t<RC.fixed+0.7); if(!vis) return;
  const pin=sp(t,B.rec+0.1,1.0,4.6,9), out=ease(t,B.prof-0.3,B.prof+0.5,E.in);
  place(board,RX,RY+(1-pin)*60,RZ-(1-pin)*400+out*300,(1-pin)*16,0,0,1); op(board,Math.min(1,pin*1.5)*(1-out));
  const fixed=t>=RC.fixed;
  REC.forEach((r,i)=>{ const L=$('#rl'+i), Rr=$('#rr'+i); const lo=offs(L,board), ro=offs(Rr,board);
    const y1=lo.y+lo.h/2, y2=ro.y+ro.h/2, x1=lo.x+lo.w+8, x2=ro.x-8;
    const {p,b}=recLines[i]; p.setAttribute('d',`M${x1},${y1} C${x1+90},${y1} ${x2-90},${y2} ${x2},${y2}`);
    const d=ease(t,RC.draw+i*0.22,RC.draw+0.7+i*0.22,E.out); trim(p,d);
    const bad=!!r.fixQ&&!fixed; p.setAttribute('stroke',bad?'#D64545':'#2E8B57'); if(bad) p.style.strokeDasharray='8 8';
    const mid=p.getPointAtLength((p.__len||p.getTotalLength())*0.5); b.setAttribute('transform',`translate(${mid.x},${mid.y}) scale(${sp(t,RC.draw+0.6+i*0.22,0.6,4,12).toFixed(3)})`);
    b.querySelector('circle').setAttribute('stroke',bad?'#D64545':'#2E8B57'); const tx=b.querySelector('text'); tx.textContent=bad?'!':'✓'; tx.style.fill=bad?'#D64545':'#2E8B57';
    L.classList.toggle('bad',bad&&d>0.9); Rr.classList.toggle('bad',bad&&d>0.9); L.classList.toggle('good',!bad&&d>0.9); Rr.classList.toggle('good',!bad&&d>0.9);
    if(r.fixQ){ Rr.querySelector('.iq').textContent=fixed?r.fixQ:r.iq; Rr.querySelector('.ia').textContent='units · '+money(fixed?r.fixA:r.amt);
      const pulse=bad&&t>RC.badge?0.5+0.5*Math.sin(t*7):0; Rr.style.boxShadow=`0 0 0 ${(pulse*6).toFixed(1)}px rgba(214,69,69,${(0.2*pulse).toFixed(3)})`;
      const gb=sp(t,RC.badge,0.6,4,12)*(1-ease(t,RC.fixed,RC.fixed+0.3)); gapBadge.style.top=(mid.y-34)+'px'; gapBadge.style.transform=`translate(-50%,-50%) scale(${gb.toFixed(3)})`; gapBadge.style.left=mid.x+'px'; }
  });
  const fin=sp(t,RC.open,0.8,4.6,10), fout=ease(t,RC.fixed+0.1,RC.fixed+0.6,E.in);
  place(fixP,560,330+(1-fin)*40,RZ+120-(1-fin)*200+fout*200,(1-fin)*12,0,0,lerp(0.9,1,fin)); op(fixP,Math.min(1,fin*1.5)*(1-fout));
  const cb=$('#fx-cb'), ck=t>=RC.check; cb.style.background=ck?'#F06023':'#fff'; cb.style.borderColor=ck?'#F06023':'#C9CED4'; cb.textContent=ck?'✓':'';
  const ap=$('#fx-apply'); ap.classList.toggle('hov',t>=RC.apply-0.4&&t<RC.apply+0.2); ap.classList.toggle('press',isPress(t,RC.apply));
}});

/* ======================================================================
   S12 — profitability + ecosystem pull-back (75–83)
   ====================================================================== */
const hlProf=headline('hl-prof','PROFITABILITY','See margin, <em>not</em> <em>just</em> <em>revenue.</em>');
const gauge=add(F,`<div class="fp ui" style="width:360px;padding:20px 22px;text-align:center"><div class="lbl" style="text-align:left">Gross margin · Oct 2026</div>
  <svg width="300" height="170" viewBox="0 0 300 170" style="margin-top:6px"><path d="M30,150 A120,120 0 0 1 270,150" fill="none" stroke="#EEF0F2" stroke-width="22" stroke-linecap="round"/><path id="gg" d="M30,150 A120,120 0 0 1 270,150" fill="none" stroke="url(#ggr)" stroke-width="22" stroke-linecap="round"/>
  <defs><linearGradient id="ggr"><stop offset="0" stop-color="#FFD600"/><stop offset="1" stop-color="#F06023"/></linearGradient></defs><text id="gg-t" x="150" y="140" text-anchor="middle" style="font:700 40px 'Inter Display'">20.8%</text></svg>
  <div style="display:flex;justify-content:space-between;font-size:11.5px;border-top:1px solid var(--line);padding-top:10px"><span style="color:var(--mut)">Gross profit</span><b id="gg-p">$346</b></div></div>`);
const ECO=[['Catalog & marketplace','6 products · 4 categories','▤'],['Customer 360','3 customers','♙'],['Storefront','Drag-and-drop pages','▭'],['Quotes','Q-1025 · $840','◇'],
  ['Orders','ORD-1026 · Fulfilled','▱'],['Subscriptions','4 active · $2,560 / mo','◈'],['Billing & invoices','3 drafts · $2,560','▥'],['Reconciliation','0 exceptions','↔'],['Profitability','22.9% gross margin','▥']];
const ecoWrap=add(F,`<div class="w3"></div>`);
const ecoSvg=svgEl('svg',{width:4000,height:3000,viewBox:'-1200 -1000 4000 3000',style:'position:absolute;left:-1200px;top:-1000px;overflow:visible'}); ecoWrap.appendChild(ecoSvg);
const eco=ECO.map(([t2,s,ic],i)=>{ const a=-Math.PI/2+i/ECO.length*Math.PI*2; const rx=1450, ry=930;
  const x=800+Math.cos(a)*rx, y=500+Math.sin(a)*ry, z=(i%3-1)*160;
  const el=add(ecoWrap,`<div class="fp ui" style="width:380px;padding:20px 22px;display:flex;gap:16px;align-items:center"><span class="mono" style="width:56px;height:56px;border-radius:14px;background:#FFF1EA;color:var(--o);font-size:22px">${ic}</span><div><b style="font:600 20px 'Inter Display'">${t2}</b><small style="font-size:13px">${s}</small></div></div>`);
  const line=svgEl('path',{d:`M800,500 L${x},${y}`,stroke:'#F06023','stroke-width':5,fill:'none','stroke-linecap':'round'}); ecoSvg.appendChild(line);
  const pulse=svgEl('circle',{r:12,fill:'#FFD600',stroke:'#F06023','stroke-width':3}); ecoSvg.appendChild(pulse);
  return {el,line,pulse,x,y,z,a}; });
scene({render(t){
  animHeadline(hlProf,t,B.prof+0.3,B.prof+4.6);
  const gv=t>=B.prof+0.6&&t<B.prof+5.6; show(gauge,gv);
  if(gv){ const pin=sp(t,B.prof+0.7,1.0,4.6,9), out=ease(t,B.prof+4.6,B.prof+5.4,E.in);
    place(gauge,1320,560+(1-pin)*60,220-(1-pin)*300+out*300,(1-pin)*14,-14,0,1); op(gauge,Math.min(1,pin*1.5)*(1-out));
    const g=ease(t,B.prof+0.9,B.prof+2.8,E.inOut), mg=lerp(M_START.margin,M_FIXED.margin,g);
    const path=$('#gg'); const L=path.__len||(path.__len=path.getTotalLength()); const frac=mg/40*ease(t,B.prof+0.7,B.prof+1.6,E.out);
    path.style.strokeDasharray=`${(L*frac).toFixed(2)} ${L}`; $('#gg-t').textContent=mg.toFixed(1)+'%'; countTo($('#gg-p'),M_START.profit,M_FIXED.profit,g); }
  // ecosystem: every module around the central dashboard
  const ev=t>=B.prof+4.5&&t<B.fin+1.8; show(ecoWrap,ev); if(!ev) return;
  const fin=ease(t,B.fin-0.2,B.fin+1.4,E.inOut); // finale: converge into the centre
  eco.forEach((e,i)=>{ const st=B.prof+4.6+i*0.1, pin=sp(t,st,1.0,4.4,9);
    const orbit=(t-B.prof-3.6)*0.05*(1-fin*0.3);
    const a=e.a+orbit; const rx=lerp(1450,700,fin), ry=lerp(930,420,fin);
    const x=800+Math.cos(a)*rx, y=500+Math.sin(a)*ry;
    place(e.el,x-190,y-48,e.z*(1-fin)+(1-pin)*-600,0,0,0,lerp(0.9,1.75,pin)*(1-fin*0.45)); op(e.el,Math.min(1,pin*1.5)*(1-ease(t,B.fin+0.9,B.fin+1.6)));
    e.line.setAttribute('d',`M800,500 L${x.toFixed(1)},${y.toFixed(1)}`); trim(e.line,ease(t,st+0.3,st+1.0,E.out)); e.line.style.opacity=(1-ease(t,B.fin+0.7,B.fin+1.4)).toFixed(3);
    const pp=((t*0.45+i*0.13)%1); e.pulse.setAttribute('cx',lerp(x,800,pp).toFixed(1)); e.pulse.setAttribute('cy',lerp(y,500,pp).toFixed(1)); e.pulse.style.opacity=(ease(t,st+1.0,st+1.3)*(1-ease(t,B.fin+0.6,B.fin+1.2))).toFixed(3);
  });
}});

/* ======================================================================
   S13 — finale: logo, tagline, CTA (83–90)
   ====================================================================== */
scene({render(t){
  const f=$('#final'); const vis=t>=B.fin+0.9; f.style.visibility=vis?'visible':'hidden';
  const wash=ease(t,B.fin+0.8,B.fin+1.7,E.inOut);
  $('#world').style.opacity=(1-wash).toFixed(3);
  if(!vis) return;
  const lg=ease(t,B.fin+1.0,B.fin+1.9,E.expo); const img=f.querySelector('.logo');
  img.style.clipPath=`inset(0 ${((1-lg)*100).toFixed(2)}% 0 0)`; img.style.transform=`scale(${(1.06-0.06*sp(t,B.fin+1.0,1.3,5,8)).toFixed(4)})`;
  const sw=prog(t,B.fin+0.9,B.fin+2.2), s1=$('#sweep');
  if(sw>0&&sw<1){ s1.style.opacity=Math.sin(Math.PI*sw).toFixed(3); s1.style.transform=`translate3d(${lerp(-600,2200,E.inOut(sw))}px,0,0)`; }
  f.querySelectorAll('.tag .ph2 > span').forEach((s,i)=>{ const p=sp(t,B.fin+2.2+i*0.95,0.9,5,10);
    s.style.transform=`translate3d(0,${((1-p)*110).toFixed(2)}%,0)`; });
  const c=sp(t,B.fin+5.0,0.9,4.4,11); const cta=f.querySelector('.cta');
  cta.style.transform=`translateX(-50%) scale(${c.toFixed(4)})`; cta.style.opacity=Math.min(1,c*2).toFixed(3);
  f.querySelector('.uline').style.transform=`scaleX(${ease(t,B.fin+5.5,B.fin+6.3,E.out).toFixed(4)})`;
  $('#glowO').style.opacity=(1+0.6*ease(t,B.fin+1,B.fin+3)).toFixed(3);
}});

/* ======================================================================
   cursor path (world space) and clicks
   ====================================================================== */
function appPt(el,fx=0.5,fy=0.5,dx=0,dy=0){ const o=offs(el,app); return {x:o.x+o.w*fx+dx,y:o.y+o.h*fy+dy}; }
function fpPt(fp,el,fx,fy,base,z){ const o=offs(el,fp); return {x:base.x+o.x+o.w*fx,y:base.y+o.y+o.h*fy,z}; }
(function buildCursor(){
  const P=[];
  // catalog
  const chip=appPt(chipProd,0.55,0.6), card=cardPos[prem], btn=offs(cards[prem].querySelector('.btn'),app);
  P.push({t:B.cat+1.9,x:chip.x+260,y:chip.y+420,o:0},{t:B.cat+2.2,x:chip.x+200,y:chip.y+330},{t:CAT.chip-0.1,...chip,arc:30},{t:CAT.chip+0.25,...chip},
    {t:CAT.hover,x:card.x+card.w*0.72,y:card.y+card.h*0.42,z:150,arc:-24},{t:CAT.add-0.4,x:btn.x+btn.w*0.6,y:btn.y+btn.h*0.55,z:150,arc:20},{t:CAT.add+0.25,x:btn.x+btn.w*0.6+4,y:btn.y+btn.h*0.55+2,z:150},
    {t:CAT.fly+0.6,x:btn.x+btn.w*0.6+60,y:btn.y+140,z:150,o:0});
  // builder
  const bp=builderPos, comp=i=>({x:bp.x+16+110,y:bp.y+56+18+22+i*54+20,z:bp.z});
  const canvasPt=(yy)=>({x:bp.x+250+(BW-250)/2,y:bp.y+56+30+yy,z:bp.z});
  P.push({t:BLD.g1-0.6,...comp(0),x:comp(0).x+80,y:comp(0).y+260,o:0},{t:BLD.g1-0.05,...comp(0),arc:20},{t:BLD.d1-0.1,...canvasPt(100),arc:-40},{t:BLD.g2-0.05,...comp(1),arc:30},
    {t:BLD.d2-0.1,...canvasPt(300),arc:-30},{t:BLD.g3-0.05,...comp(3),arc:30},{t:BLD.d3-0.1,...canvasPt(470),arc:-30});
  const devPt=i=>{ const d=$(`#dev .devb[data-dev="${i}"]`); const o=offs(d,builder); return {x:bp.x+o.x+o.w/2,y:bp.y+o.y+o.h*0.6,z:bp.z}; };
  P.push({t:BLD.tab-0.05,...devPt(1),arc:30},{t:BLD.mob-0.05,...devPt(2),arc:10},{t:B.quote-0.3,...devPt(2),x:devPt(2).x+60,y:devPt(2).y+80,o:0});
  // quote
  const qbase={x:QX,y:QY}; const sel=fpPt(qb,$('#qb-sel'),0.7,0.55,qbase,QZ), dd2=fpPt(qb,$('#dd2'),0.4,0.5,qbase,QZ), qty=fpPt(qb,$('#qb-qty'),0.7,0.55,qbase,QZ), sv=fpPt(qb,$('#qb-save'),0.55,0.55,qbase,QZ);
  P.push({t:QT.open-0.55,...sel,x:sel.x+120,y:sel.y+260,o:0},{t:QT.open-0.05,...sel,arc:30},{t:QT.pick-0.05,...dd2,arc:-20},{t:QT.qty-0.1,...qty,arc:30},{t:QT.qtyEnd,...qty,x:qty.x+2},
    {t:QT.save-0.05,...sv,arc:-30},{t:QT.doc+0.3,...sv,y:sv.y+40});
  // accept (doc layout: measure inside the doc view)
  const ac=offs($('#qd-accept'),qb); const acp={x:QX+ac.x+ac.w*0.55,y:QY+ac.y+ac.h*0.55,z:QZ};
  P.push({t:B.order-0.3,...acp,arc:20},{t:B.order+0.35,...acp},{t:B.order+1.1,...acp,x:acp.x+80,y:acp.y+120,o:0});
  // subscriptions: manage → view billing
  const mb=(()=>{const o=offs($('#sr-SUB-1027 .btn.sm'),app);return {x:o.x+o.w*0.5,y:o.y+o.h*0.6};})(); const mpos={x:560,y:240,z:200}; const vb=fpPt(manage,$('#mg-bill'),0.55,0.55,mpos,200);
  P.push({t:SB.manage-1.2,x:mb.x-200,y:mb.y+260,o:0},{t:SB.manage-0.1,...mb,arc:30},{t:SB.bill-0.05,...vb,arc:-40},{t:SB.bill+0.5,...vb,x:vb.x+60,y:vb.y+90,o:0});
  // invoice export
  const ex=fpPt(invDoc,$('#inv-exp'),0.5,0.55,{x:IX,y:IY},IZ);
  P.push({t:IV.exp-1.1,...ex,x:ex.x-220,y:ex.y+200,o:0},{t:IV.exp-0.05,...ex,arc:24},{t:IV.exp+0.8,...ex,x:ex.x+30,y:ex.y+80,o:0});
  // reconciliation: badge → checkbox → apply
  const fpos={x:560,y:330,z:RZ+120}; const cbp=fpPt(fixP,$('#fx-cb'),0.5,0.5,fpos,fpos.z), app2=fpPt(fixP,$('#fx-apply'),0.5,0.55,fpos,fpos.z);
  const badgeP={x:RX+RW/2,y:RY+170,z:RZ};
  P.push({t:RC.badge-0.6,...badgeP,x:badgeP.x+200,y:badgeP.y+260,o:0},{t:RC.open-0.1,...badgeP,arc:20},{t:RC.check-0.05,...cbp,arc:-30},{t:RC.apply-0.05,...app2,arc:20},{t:RC.fixed+0.6,...app2,x:app2.x+60,y:app2.y+90,o:0});
  CURSOR=P.sort((a,b)=>a.t-b.t);
  CLICKS=[CAT.chip,CAT.add,BLD.tab,BLD.mob,QT.open,QT.pick,QT.save,B.order+0.2,SB.manage-0.05,SB.bill,IV.exp,RC.open,RC.check,RC.apply];
  HAND=[[CAT.chip-0.5,CAT.chip+0.3],[CAT.add-0.6,CAT.add+0.4],[BLD.g1-0.1,BLD.d1],[BLD.g2-0.1,BLD.d2],[BLD.g3-0.1,BLD.d3],[BLD.tab-0.4,BLD.mob+0.3],[QT.open-0.3,QT.save+0.3],[B.order-0.4,B.order+0.4],
    [SB.manage-0.5,SB.manage+0.2],[SB.bill-0.5,SB.bill+0.3],[IV.exp-0.5,IV.exp+0.3],[RC.open-0.5,RC.apply+0.3]];
  // drags: clicks at pick-up and drop
  CLICKS.push(BLD.g1,BLD.d1,BLD.g2,BLD.d2,BLD.g3,BLD.d3);
})();

/* ---------------- title zone: world fades out behind the top-left headline ---------------- */
scene({render(t){
  const m=ease(t,B.dash-0.6,B.dash+0.4,E.smooth)*(1-ease(t,B.prof+4.4,B.prof+5.2,E.smooth));
  const a=(1-m).toFixed(3);
  const mk=`linear-gradient(90deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1000px, #000 1240px), linear-gradient(180deg, rgba(0,0,0,${a}) 0px, rgba(0,0,0,${a}) 175px, #000 320px)`;
  const w=$('#world').style; w.webkitMaskImage=w.maskImage=m>0.001?mk:'none'; w.webkitMaskComposite='source-over'; w.maskComposite='add';
  $('#hudbg').style.opacity=(1-m*0.7).toFixed(3);
}});
/* cues for the sound design / voice-over (read by the audio build) */
window.CUES={B,CAT,BLD,QT,NT,SB,IV,RC,CLICKS};
window.ready=document.fonts.ready.then(()=>{ window.seek(0); return true; });
if(location.search.includes('play')) window.ready.then(()=>{ const t0=performance.now(); const m=location.search.match(/from=([\d.]+)/); const off=m?+m[1]:0;
  const loop=()=>{ window.seek((off+(performance.now()-t0)/1000)%DURATION); requestAnimationFrame(loop); }; loop(); });
// screen-space positions of moving things (renderer uses this to choose motion-blur samples)
window.trackPoints=function(t){
  window.seek(t); const pts=[];
  const push=el=>{ const r=el.getBoundingClientRect(); if(!r.width){ pts.push([0,0],[0,0]); return; } pts.push([r.left,r.top],[r.right,r.bottom]); };
  push(app); push($('#cursor'));
  $$('#floaters .fp, #floaters > .abs, #chaos .frag').forEach(push);
  $$('.hl .w > span, .kin > span, #final .ph2 > span').forEach(push);
  return pts;
};
