// Exports the After Effects assets + layout data from composition/index.html.
//   node ae/export-assets.js      -> ae/assets/*.png, ae/layout.json
// UI layers are captured at 4x (6400 px wide window) so the AE camera can zoom
// to ~1.8x on a 4K comp and stay pixel-sharp.
const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'), OUT=path.join(__dirname,'assets');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{const p=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(p,(e,b)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':types[path.extname(p)]||'application/octet-stream'});r.end(b)})});

(async()=>{
  await new Promise(r=>srv.listen(0,r)); const url=`http://localhost:${srv.address().port}/composition/v1.html`;
  fs.rmSync(OUT,{recursive:true,force:true}); fs.mkdirSync(OUT,{recursive:true});
  const browser=await chromium.launch({args:['--force-color-profile=srgb','--disable-lcd-text','--font-render-hinting=none']});

  /* ---------------- UI layers @4x ---------------- */
  const ui=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:4});
  await ui.goto(url); await ui.evaluate(()=>window.ready);
  const layout=await ui.evaluate(()=>{
    const names=new Map([[E.inOut,'inOut'],[E.smooth,'smooth'],[E.out,'out'],[E.outSoft,'outSoft'],[E.in,'in'],[E.cam,'cam']]);
    const cam=CAM.map(k=>({t:k.t,ax:k.ax,ay:k.ay,fx:k.fx,fy:k.fy,s:k.s,rx:k.rx,ry:k.ry,rz:k.rz,e:k.e?names.get(k.e):'inOut'}));
    const fr=rectB(doc.querySelector('.filters-inline'));
    return {cam, cursor:CURSOR.map(k=>({...k})), T:{...T}, blocks:BLOCKS.map(b=>({...b})),
      cards:G.cards, cartProd:G.cartProd, cartAll:G.cartAll, chips:fr,
      categories:cards.map(c=>c.dataset.category)};
  });
  // put the page into a neutral, static state at the camera origin
  await ui.evaluate(()=>{
    window.seek(0);
    const cam=document.getElementById('cam'); cam.style.transform='none'; cam.style.opacity=1;
    for(const id of ['bg','floor','scrim','copy','hairline','grain','cursor','shadow']) document.getElementById(id).style.display='none';
    document.documentElement.style.background=document.body.style.background=document.getElementById('stage').style.background='transparent';
    document.getElementById('win').style.boxShadow='none';
    setFilter('All products');
    cards.forEach(c=>{c.style.opacity=1;c.style.transform='none';c.style.boxShadow='';c.classList.remove('is-hover');});
    doc.querySelectorAll('.is-hover,.is-press').forEach(e=>e.classList.remove('is-hover','is-press'));
    premiumBtn.textContent=premiumBtn.dataset.labelBefore;
    cart.style.display='';cart.style.opacity=1;cart.style.transform='none';
    window.__iso=(el)=>{ // isolate one element on a transparent page
      const f=document.getElementById('frame'), w=document.getElementById('win'), ch=document.getElementById('chrome');
      const on=!!el;
      doc.documentElement.style.background=doc.body.style.background=on?'transparent':'';
      f.style.background=w.style.background=on?'transparent':'';
      ch.style.visibility=on?'hidden':'';
      doc.body.style.visibility=on?'hidden':'';
      doc.querySelectorAll('[data-iso]').forEach(e=>{e.style.visibility='';e.removeAttribute('data-iso')});
      if(el){el.style.visibility='visible';el.setAttribute('data-iso','')}
    };
  });
  const shotEl=async(name,sel,margin)=>{
    const r=await ui.evaluate(([sel])=>{const el=eval(sel); __iso(el); const b=rectB(el); return b;},[sel]);
    const clip={x:r.x-margin,y:r.y-margin,width:r.w+2*margin,height:r.h+2*margin};
    await ui.screenshot({path:path.join(OUT,name+'.png'),clip,omitBackground:true});
    return {file:name+'.png',x:clip.x,y:clip.y,w:clip.width,h:clip.height};
  };
  const A={};
  // base page: everything but the animated parts
  await ui.evaluate(()=>{__iso(null); cards.forEach(c=>c.style.visibility='hidden'); doc.querySelector('.filters-inline').style.visibility='hidden'; cart.style.visibility='hidden';});
  await ui.screenshot({path:path.join(OUT,'ui_page_base.png'),clip:{x:0,y:0,width:1600,height:1046},omitBackground:true});
  A.base={file:'ui_page_base.png',x:0,y:0,w:1600,h:1046};
  await ui.evaluate(()=>{cards.forEach(c=>c.style.visibility=''); doc.querySelector('.filters-inline').style.visibility=''; cart.style.visibility='';});

  const M=40; // margin around cards for hover shadow
  const lift=`0 18px 40px -6px rgba(37,43,38,0.16), 0 1px 2px rgba(37,43,38,0.04)`;
  A.cards=[];
  for(let i=0;i<6;i++) A.cards.push({normal:await shotEl(`ui_card${i+1}_normal`,`cards[${i}]`,M)});
  const setCard=async(i,{hover,btnHover,added})=>ui.evaluate(([i,hover,btnHover,added,lift])=>{
    const c=cards[i]; c.classList.toggle('is-hover',!!hover); c.style.boxShadow=hover?lift:'';
    const b=c.querySelector('[data-action="add-cart"]'); b.classList.toggle('is-hover',!!btnHover);
    if(c===premium) b.textContent=added?b.dataset.labelAfter:b.dataset.labelBefore;
  },[i,hover,btnHover,added,lift]);
  const premStates={hover:{hover:1},hoverBtn:{hover:1,btnHover:1},hoverBtnAdded:{hover:1,btnHover:1,added:1},hoverAdded:{hover:1,added:1},added:{added:1}};
  for(const [k,s] of Object.entries(premStates)){ await setCard(2,s); A.cards[2][k]=await shotEl(`ui_card3_premium_${k}`,'cards[2]',M); }
  await setCard(2,{});
  await setCard(3,{hover:1}); A.cards[3].hover=await shotEl('ui_card4_backup_hover','cards[3]',M); await setCard(3,{});

  // filter chip row variants
  const chipVar=async(name,active,hoverCat)=>{
    await ui.evaluate(([active,hoverCat])=>{ chips.forEach(c=>{c.classList.toggle('active',c.dataset.category===active); c.classList.toggle('is-hover',c.dataset.category===hoverCat);}); },[active,hoverCat]);
    return shotEl(name,"doc.querySelector('.filters-inline')",8);
  };
  A.chips={
    all:await chipVar('ui_chips_all','All products',null),
    allHoverProd:await chipVar('ui_chips_all_hoverProductivity','All products','Productivity'),
    prodHoverProd:await chipVar('ui_chips_productivity_hoverProductivity','Productivity','Productivity'),
    prod:await chipVar('ui_chips_productivity','Productivity',null),
    prodHoverAll:await chipVar('ui_chips_productivity_hoverAll','Productivity','All products'),
    allHoverAll:await chipVar('ui_chips_all_hoverAll','All products','All products'),
  };
  A.cart=await shotEl('ui_quote_bar','cart',M);
  await ui.evaluate(()=>__iso(null));

  // cursors (tip at CSS (4,3) inside the 28px svg)
  for(const [name,id] of [['cursor_arrow','cur-arrow'],['cursor_hand','cur-hand']]){
    await ui.evaluate(([id])=>{ const cu=document.getElementById('cursor'); cu.style.display=''; cu.style.opacity=1;
      cu.style.transform='translate3d(16px,16px,0)'; document.getElementById('frame').style.visibility='hidden';
      document.getElementById('chrome').style.visibility='hidden'; document.getElementById('win').style.background='transparent';
      document.getElementById('cur-arrow').style.opacity=id==='cur-arrow'?1:0; document.getElementById('cur-hand').style.opacity=id==='cur-hand'?1:0; },[id]);
    await ui.screenshot({path:path.join(OUT,name+'.png'),clip:{x:8,y:8,width:48,height:48},omitBackground:true});
  }
  A.cursorTip={x:16+4-8,y:16+3-8}; // in CSS px inside the 48px cursor image

  /* ---------------- stage layers @2x (4K) ---------------- */
  const st=await browser.newPage({viewport:{width:2080,height:1240},deviceScaleFactor:2});
  await st.goto(url); await st.evaluate(()=>window.ready);
  await st.evaluate(()=>{ window.seek(15); const s=document.getElementById('stage'); s.style.margin='80px 0 0 80px'; s.style.overflow='visible';
    document.body.style.overflow='visible'; });
  const only=async(ids,transparent)=>st.evaluate(([ids,transparent])=>{
    for(const id of ['bg','floor','cam','scrim','copy','hairline','grain']) document.getElementById(id).style.display=ids.includes(id)?'':'none';
    document.getElementById('bg').style.transform='none';
    const bgc=transparent?'transparent':''; document.documentElement.style.background=document.body.style.background=document.getElementById('stage').style.background=bgc;
  },[ids,transparent]);
  await only(['bg'],false); await st.screenshot({path:path.join(OUT,'stage_background.png'),clip:{x:0,y:0,width:2080,height:1240}});
  await only(['floor'],true); await st.screenshot({path:path.join(OUT,'stage_floor_gradient.png'),clip:{x:80,y:80,width:1920,height:1080},omitBackground:true});
  await st.evaluate(()=>document.getElementById('scrim').style.opacity=1);
  await only(['scrim'],true); await st.screenshot({path:path.join(OUT,'stage_left_scrim.png'),clip:{x:80,y:80,width:1920,height:1080},omitBackground:true});
  await st.evaluate(()=>{const g=document.getElementById('grain'); g.style.opacity=1; g.style.mixBlendMode='normal';});
  await only(['grain'],true); await st.screenshot({path:path.join(OUT,'stage_grain.png'),clip:{x:80,y:80,width:1920,height:1080},omitBackground:true});

  // editorial copy geometry (rest position)
  layout.copy=await st.evaluate(()=>{
    const out=[]; for(const id of ['copy','hairline']) document.getElementById(id).style.display=''; document.getElementById('copy').style.transform='none';
    const sr=document.getElementById('stage').getBoundingClientRect();
    const R=el=>{const r=el.getBoundingClientRect();return {x:r.left-sr.left,y:r.top-sr.top,w:r.width,h:r.height}};
    const baseline=el=>{const i=document.createElement('i');i.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';el.appendChild(i);const y=i.getBoundingClientRect().top-sr.top;i.remove();return y};
    for(const B of BLOCKS){ const el=document.getElementById(B.id); el.style.visibility='visible';
      el.querySelectorAll('span,img').forEach(s=>{s.style.transform='none';s.style.opacity=1});
      const o={id:B.id,in:B.in,out:B.out,lines:[]};
      el.querySelectorAll('.ln').forEach(ln=>{const sp=ln.firstElementChild;
        o.lines.push({text:sp.textContent,accent:!!sp.querySelector('em'),box:R(ln),spanH:sp.getBoundingClientRect().height,base:baseline(sp),x:R(sp).x});});
      const bar=el.querySelector('.bar'); if(bar){ bar.style.transform='none'; o.bar=R(bar);
        const lbl=el.querySelector('.lbl'); o.label={text:lbl.textContent.toUpperCase(),box:R(lbl),spanH:lbl.firstElementChild.getBoundingClientRect().height,base:baseline(lbl.firstElementChild),x:R(lbl.firstElementChild).x}; }
      const sub=el.querySelector('.sub'); if(sub) o.sub={text:sub.textContent,box:R(sub),spanH:sub.firstElementChild.getBoundingClientRect().height,base:baseline(sub.firstElementChild),x:R(sub.firstElementChild).x};
      const logo=el.querySelector('.logo'); if(logo) o.logo=R(logo);
      out.push(o); }
    const h=document.getElementById('hairline'); h.style.width='120px'; return {blocks:out, hairline:R(h)};
  });
  layout.assets=A;
  fs.writeFileSync(path.join(__dirname,'layout.json'),JSON.stringify(layout,null,1));
  await browser.close(); srv.close(); console.log('assets exported');
})();
