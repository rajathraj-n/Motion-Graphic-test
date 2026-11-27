'use strict';
/* Markup builders for the RackNap Easy interface, reconstructed from the reference app
   (same navigation, labels, tables and records; prototype banners removed). */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const NAV=[['overview','Overview','▦'],['catalog','Catalog & marketplace','▤'],['quotes','Quote management','◇'],['orders','Orders','▱'],
  ['subscriptions','Subscriptions','◈'],['invoices','Billing & invoices','▥'],['reconciliation','Reconciliation','↔'],['self-service','Customer self-service','♙'],['reports','Profitability & reports','▥']];
const pill=(s)=>{const cls={Active:'ok',Aligned:'ok',Fulfilled:'ok',Accepted:'ok',Draft:'warn',Pending:'info',Review:'bad'}[s]||'info';return `<span class="pill ${cls}"><i></i>${s}</span>`;};
const vendorMark='<span class="vmark"><i></i><i></i><i></i><i></i></span>';
const kpi=(id,label,val,sub,accent='')=>`<div class="kpi ${accent}" id="${id}"><span>${label}</span><strong data-v>${val}</strong><small>${sub}</small></div>`;

function appShell(){
  return `<div class="app" id="app">
    <aside class="sb">
      <div class="sb-brand"><img src="assets/logo.png" alt="RackNap Easy"></div>
      <div class="sb-ws"><span class="mono">${WORKSPACE.initials}</span><div><strong>${WORKSPACE.name}</strong><span>${WORKSPACE.country}</span></div></div>
      <div class="sb-label">COMMERCE WORKSPACE</div>
      <nav class="sb-nav"><div class="sb-active" id="nav-active"></div>${NAV.map(([k,l,i])=>`<a data-nav="${k}" id="nav-${k}"><span class="ico">${i}</span>${l}${k==='reconciliation'?'<b class="badge" id="nav-badge">1</b>':''}</a>`).join('')}</nav>
    </aside>
    <div class="main">
      <header class="top"><div class="crumb">Workspace <span>/</span> <strong id="crumb">Overview</strong></div><div class="top-r"><span class="qchip" id="qchip">Quote <b id="qchip-n">0</b></span><span class="avatar">NP</span></div></header>
      <div class="panes" id="panes">
        ${paneOverview()}${paneCatalog()}${paneQuotes()}${paneOrders()}${paneSubs()}${paneInvoices()}${paneRecon()}${paneReports()}
      </div>
    </div>
  </div>`;
}
const head=(t,d,a='')=>`<div class="ph"><div><h1>${t}</h1><p>${d}</p></div><div>${a}</div></div>`;
const table=(cols,rows,cls='')=>`<div class="tbl ${cls}"><div class="tr th">${cols.map(c=>`<div>${c}</div>`).join('')}</div>${rows.join('')}</div>`;

function paneOverview(){
  const m=M_START;
  return `<section class="pane" data-pane="overview">
    ${head('Your cloud business, in view.',`${WORKSPACE.name} · ${WORKSPACE.period}`,'<span class="btn primary">Create a quote +</span>')}
    <div class="kpis">
      ${kpi('ov-k1','Active subscription value',money(m.value),'Per month · before taxes')}
      ${kpi('ov-k2','Draft customer invoices',money(m.revenue),'October 2026 billing')}
      ${kpi('ov-k3','Gross profit',money(m.profit),m.margin.toFixed(1)+'% of invoiced revenue')}
      ${kpi('ov-k4','Unbilled value',money(UNBILLED_START),'1 exception to review','alert')}
    </div>
    <div class="cols">
      <div class="panel" id="ov-recon"><div class="panel-h"><h2>Reconciliation needs a look</h2>${pill('Review')}</div>
        <div class="issue"><span class="issue-ico">↔</span><div><strong>Cedarline Solutions · Microsoft 365 Business Standard</strong><p>The supplier and active subscription show 52 seats. The customer invoice shows 48. Follow the record to review the difference.</p><a>Review the mismatch →</a></div></div>
        <div class="istats"><div><span>SUPPLIER</span><strong>52</strong></div><div><span>INVOICED</span><strong>48</strong></div><div><span>UNBILLED VALUE</span><strong>$60</strong></div></div></div>
      <div class="panel" id="ov-act"><div class="panel-h"><h2>Recent activity</h2></div>
        <ul class="act"><li><i></i><div>Supplier, subscription and draft invoice data loaded.<small>Workspace · Oct 2026</small></div></li>
        <li><i></i><div>Quantity mismatch identified for Cedarline Solutions.<small>52 supplier seats · 48 invoiced seats</small></div></li></ul></div>
    </div>
  </section>`;
}
function productCard(id,i){
  const p=PRODUCTS[id];
  return `<article class="pc" id="pc-${id}" data-cat="${p.category}"><div class="pv">${vendorMark}${p.vendor} / ${p.category}</div><h3>${p.name}</h3><p>${p.desc}</p>
    <div class="pp"><strong>${money(p.price)}</strong><span>/ ${p.unit}</span></div><span class="btn" id="pc-btn-${id}">Add to quote +</span>
    <div class="pd"><span>Cost: ${money(p.cost)}</span><span>${Math.round((p.price-p.cost)/p.price*100)}% margin</span></div></article>`;
}
function paneCatalog(){
  return `<section class="pane" data-pane="catalog">
    ${head('Catalog & marketplace','Cloud products from every vendor, alongside your own recurring services.')}
    <div class="cat-ctl"><div class="search"><span>⌕</span><em id="cat-search">Search products or vendors…</em></div>
      <div class="chips">${['All products','Productivity','Security','Services','Consumption'].map((c,i)=>`<span class="chip ${i?'':'on'}" data-chip="${c}">${c}</span>`).join('')}</div></div>
    <div class="grid" id="cat-grid">${PRODUCT_ORDER.map(productCard).join('')}</div>
  </section>`;
}
function paneQuotes(){
  const row=(q,st)=>`<div class="tr" ${q.id==='Q-1025'?'id="q-row-new"':''}><div><strong>${q.id}</strong><small>${q.created}</small></div><div>${CUSTOMERS[q.customer].name}</div><div>${q.lines.length} product</div><div class="num">${money(sumLines(q.lines))}</div><div>${pill(st)}</div></div>`;
  return `<section class="pane" data-pane="quotes">
    ${head('Quote management','Create a clear offer, then carry the accepted quote into an order.','<span class="btn primary">New quote +</span>')}
    <div class="panel">${table(['Quote','Customer','Items','Value / cycle','Status'],[row(NEW_QUOTE,'Draft'),row(QUOTE_EXISTING,'Draft')],'t5')}</div>
  </section>`;
}
function paneOrders(){
  return `<section class="pane" data-pane="orders">
    ${head('Orders','Follow accepted quotes into fulfillment.','<span class="btn">View quotes →</span>')}
    <div class="panel">${table(['Order','Customer','Quote','Value / cycle','Status'],[`<div class="tr" id="ord-row"><div><strong>${NEW_ORDER.id}</strong></div><div>${CUSTOMERS.harborstone.name}</div><div>${NEW_ORDER.quote}</div><div class="num">${money(840)}</div><div id="ord-pill">${pill('Pending')}</div></div>`],'t5')}</div>
  </section>`;
}
function subRow(s,extra=''){const p=PRODUCTS[s.product];
  return `<div class="tr" id="sr-${s.id}" ${extra}><div><strong>${p.name}</strong><small>${s.id} · Monthly billing cycle</small></div><div>${CUSTOMERS[s.customer].name}</div><div><strong>${s.qty}</strong><small>Supplier: ${s.supplierQty}</small></div><div><strong>${money(s.price)}</strong><small>Per unit / cycle</small></div><div>${s.renewal}</div><div>${pill(s.status)}</div></div>`;}
function paneSubs(){
  const m=M_AFTER;
  return `<section class="pane" data-pane="subscriptions">
    ${head('Subscriptions','Track active services, quantities, renewal dates and billing relationships.','<span class="btn primary">Generate invoice</span>')}
    <div class="kpis">${kpi('sb-k1','Active subscriptions','4','Across 3 customers')}${kpi('sb-k2','Monthly subscription value',money(m.value),'Billable subscriptions')}${kpi('sb-k3','Supplier cost',money(m.cost),'For the billing cycle')}${kpi('sb-k4','Renewal visibility','4','Renewal dates in view')}</div>
    <div class="panel">${table(['Subscription','Customer','Quantity','Selling price','Renewal','Status'],SUBS_AFTER.map(s=>subRow(s)),'t6')}</div>
  </section>`;
}
function paneInvoices(){
  const inv=INVOICES_AFTER;
  return `<section class="pane" data-pane="invoices">
    ${head('Billing & invoices','Prepare customer billing and follow it back to subscriptions.','<span class="btn primary">Generate invoice +</span>')}
    <div class="kpis">${kpi('iv-k1','Draft invoices','3','October 2026 period')}${kpi('iv-k2','Draft invoice value',money(M_AFTER.revenue),'Before taxes')}${kpi('iv-k3','Subscription value',money(M_AFTER.value),'From active subscriptions')}${kpi('iv-k4','Quantity exceptions','1','Review in reconciliation','alert')}</div>
    <div class="panel">${table(['Invoice','Customer','Period','Amount','Status'],inv.map(i=>`<div class="tr" id="ir-${i.id}"><div><strong>${i.id}</strong><small>${i.lines.length} line item${i.lines.length>1?'s':''}</small></div><div>${CUSTOMERS[i.customer].name}</div><div>${i.period}</div><div class="num">${money(sumLines(i.lines))}</div><div>${pill('Draft')}</div></div>`),'t5')}</div>
  </section>`;
}
function paneRecon(){
  const rows=[['Cedarline Solutions','Microsoft 365 Business Standard',52,52,48,'+4','$60 unbilled','Review'],['Solace Digital','Microsoft 365 Business Basic',80,80,80,'0','$0 unbilled','Aligned'],
    ['Harborstone Systems','Microsoft 365 Business Premium',30,30,30,'0','$0 unbilled','Aligned'],['Harborstone Systems','Cloud Backup',30,30,30,'0','$0 unbilled','Aligned']];
  return `<section class="pane" data-pane="reconciliation">
    ${head('Reconciliation','Compare supplier quantities, active subscriptions and draft customer billing.','<span class="btn">Export comparison ↓</span>')}
    <div class="kpis">${kpi('rc-k1','Supplier cost',money(M_AFTER.cost),'Billable subscriptions')}${kpi('rc-k2','Customer invoices',money(M_AFTER.revenue),'Current draft invoices')}${kpi('rc-k3','Unbilled value','$60','Quantity differences × selling price','alert')}${kpi('rc-k4','Exceptions to review','1','Supplier / subscription / invoice','alert')}</div>
    <div class="panel">${table(['Customer / product','Supplier','Subscription','Invoiced','Difference','Status'],rows.map((r,i)=>`<div class="tr" id="rc-row${i}"><div><strong>${r[0]}</strong><small>${r[1]}</small></div><div>${r[2]}</div><div>${r[3]}</div><div>${r[4]}</div><div><strong>${r[5]}</strong><small>${r[6]}</small></div><div>${pill(r[7])}</div></div>`),'t6')}</div>
  </section>`;
}
function paneReports(){
  const m=M_FIXED;
  return `<section class="pane" data-pane="reports">
    ${head('Profitability & reports','See how customer billing and supplier costs connect to gross profit.','<span class="btn">Export profitability ↓</span>')}
    <div class="kpis">${kpi('rp-k1','Customer revenue',money(m.revenue),'From draft invoices')}${kpi('rp-k2','Supplier cost',money(m.cost),'Supplier quantity × cost')}${kpi('rp-k3','Gross profit',money(m.profit),'Revenue less supplier cost')}${kpi('rp-k4','Gross margin',m.margin.toFixed(1)+'%','Gross profit / invoiced revenue')}</div>
    <div class="cols"><div class="panel" id="rp-bars"><div class="panel-h"><h2>Revenue & cost by customer</h2><span class="legend"><i class="r"></i>Revenue <i class="c"></i>Supplier cost</span></div><div class="bars" id="rp-barlist"></div></div>
    <div class="panel"><div class="panel-h"><h2>Customer profitability</h2><small>USD / OCTOBER 2026</small></div>${table(['Customer','Revenue','Supplier cost','Gross profit','Margin'],PC_FIXED.map((c,i)=>`<div class="tr" id="rp-row${i}"><div><strong>${c.name}</strong></div><div class="num" data-rev>${money(c.revenue)}</div><div class="num">${money(c.cost)}</div><div class="num" data-gp>${money(c.profit)}</div><div class="num" data-mg>${c.margin.toFixed(1)}%</div></div>`),'t5 compact')}</div></div>
  </section>`;
}
