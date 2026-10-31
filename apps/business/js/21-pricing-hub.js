/* PRICING HUB (business) */
const PH_TABS=[['overview','Overview'],['setup','Price setup'],['models','Pricing models'],['offers','Discounts and offers'],['calc','Cost calculator'],['quotes','Quotes and changes'],['perf','Performance']];
const DOC_CALC={hours:3,cleaners:1,loaded:1500,travel:800,products:400,overhead:800,margin:30,price:9500};
function phInit(){
  if(!S.ph)S.ph={tab:'overview',calc:{...DOC_CALC}};
  if(!S.dq){const P=S.pricing;const mk=(o)=>{const q=quote(P,o);return {lines:q.lines,net:q.net,vat:q.vat,total:q.total,first:q.first?q.first.total:null,disc:q.disc,pct:q.pct,minAdj:q.minAdj,labour:q.labour,status:q.status,reasons:q.reasons,model:q.model,basis:q.basis}};
    S.dq=[
      {id:'DQ-202',ver:1,customer:'amara',name:'Amara Okafor',addr:'14 Willow Lane, Crowland PE6 0JH',o:{svc:'regular',size:'2',baths:1,condition:'average',freq:'once',addons:{carpet:true},products:'cleaner'},status:'sent',created:'2026-10-13',sent:'2026-10-14',expires:'2026-10-28',note:'Carpet steam clean added after a photo review: living room only.',by:ME_BIZ},
      {id:'DQ-201',ver:1,customer:null,name:'Priya Shah',addr:'3 Orchard Close, Spalding PE11 2QT',o:{svc:'deep',size:'4',baths:2,condition:'heavy',freq:'once',addons:{},products:'cleaner'},status:'requested',created:'2026-10-14',sent:null,expires:null,note:'Customer says the property has been empty for a year. Mould in one bathroom.',by:'Customer'},
      {id:'DQ-198',ver:1,customer:'reid',name:'Jo and Callum Reid',addr:'7 Church Street, Market Deeping PE6 8AN',o:{svc:'deep',size:'3',baths:2,condition:'extra',freq:'once',addons:{oven:true},products:'cleaner'},status:'sent',created:'2026-10-08',sent:'2026-10-08',expires:'2026-10-22',note:'Spring deep clean before the regular plan resumes.',by:ME_BIZ},
      {id:'DQ-190',ver:1,customer:null,name:'Mark Ellis',addr:'22 Station Road, Oundle PE8 4BX',o:{svc:'eot',size:'2',baths:1,condition:'average',freq:'once',addons:{oven:true,fridge:true},area:'PE8'},status:'expired',created:'2026-09-20',sent:'2026-09-21',expires:'2026-10-05',note:'Tenancy ends 31 Oct.',by:ME_BIZ}
    ];S.dq.forEach(d=>{const ar=d.o.area?areaOf(d.o.area+' 1AA'):{kind:'main',fee:0};d.o.areaInfo=ar;const st=d.status;Object.assign(d,mk({...d.o,area:ar}));d.qstatus=d.status;d.status=st;d.priceList=P.version;d.terms=S.settings.version})}
  if(!S.chg){const up=Object.values(S.visits).filter(v=>v.site==='amara'&&v.date>=today()&&v.state==='scheduled').sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start))[0];
    const nene=Object.values(S.visits).find(v=>v.site==='nene'&&v.date>=today());
    S.chg=[];
    if(up)S.chg.push({id:'CR-31',visit:up.id,customer:'amara',desc:'Oven and hob heavily soiled. Deep clean of the oven and hob, about 45 minutes extra.',raisedBy:'Grace Adeyemi',raisedAt:'Wed 14 Oct, 14:05',amount:3000,status:'proposed',proposedBy:ME_BIZ,proposedAt:'Wed 14 Oct, 16:30'});
    if(nene)S.chg.push({id:'CR-32',visit:nene.id,customer:'nene',desc:'Kitchen floor needs a machine scrub: grease build-up behind the fridge.',raisedBy:'Kwame Mensah',raisedAt:'Thu 15 Oct, 08:10',amount:null,status:'raised'});}
  S.dq.forEach(d=>{if(d.status==='sent'&&d.expires&&d.expires<today())d.status='expired'});
}
function dqStatus(d){return {requested:['Quote requested','warn'],sent:['Sent · awaiting customer','info'],accepted:['Accepted','good'],expired:['Expired','bad'],declined:['Declined',''],draft:['Draft','']}[d.status]||[d.status,'']}
function chgStatus(c){return {raised:['Needs a price','warn'],proposed:['Awaiting customer approval','info'],approved:['Approved','good'],declined:['Declined','']}[c.status]}
function perfRows(){const P=S.pricing;
  return Object.values(S.visits).filter(v=>['completed','partial'].includes(v.state)&&!v.correctiveOf&&v.svc!=='office'&&v.date<=today()).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,12).map(v=>{
    const sz=v.svc==='regular'?'2':'3';const est=v.estHours||labourFor(v.svc,sz,P);
    let act=null;if(v.checkin&&v.checkout){const a=mins((v.checkin.capture.split(', ')[1]||'').trim()),b=mins(String(v.checkout).split(', ').pop().trim());if(b>a)act=Math.round((b-a)/60*(v.crew||1)*4)/4}
    if(act==null){const h=[...v.id].reduce((x,c)=>x+c.charCodeAt(0),0);act=Math.round(est*(0.85+(h%40)/100)*4)/4}
    const rev=visitValue(v);return {v,est,act,var:(act-est)/est*100,rev,rph:act?rev/act:0}})}
function bizPricingHub(){phInit();const t=S.ph.tab;const P=S.pricing;
  const reqN=S.dq.filter(d=>d.status==='requested').length+S.chg.filter(c=>c.status==='raised').length;
  const body={overview:phOverview,setup:prSetupForm,models:phModels,offers:phOffers,calc:phCalc,quotes:phQuotes,perf:phPerf}[t]();
  return `<div class="rota-top"><div><h1>Pricing</h1><p class="muted">Set prices from your own costs, send clear quotes, and check whether jobs earn what you expected. Price list v${P.version} · costs and margins are never shown to customers.</p></div>
    ${t!=='setup'?`<div class="row"><button class="btn" data-act="qbOpen">New quote</button><button class="btn primary" data-act="prOpen">Edit price list</button></div>`:''}</div>
  <div class="seg emp-tabs" role="tablist" aria-label="Pricing">${PH_TABS.map(([k,l])=>`<button role="tab" aria-selected="${t===k}" aria-pressed="${t===k}" data-act="phTab" data-v="${k}">${l}${k==='quotes'&&reqN?` <span class="set-n">${reqN}</span>`:''}</button>`).join('')}</div>
  ${body}`;
}
function rateCard(P,svc){return SIZES.map(z=>{const q=quote(P,{svc,size:z,baths:P.bathsIncluded[z],condition:'average',freq:'once',addons:{},products:'cleaner'});return {z,q}})}
function phOverview(){const P=S.pricing;
  const reg=rateCard(P,'regular'),deep=rateCard(P,'deep'),eot=rateCard(P,'eot');
  const low=[...reg.map(r=>['Regular',r]),...deep.map(r=>['Deep',r]),...eot.map(r=>['End of tenancy',r])].filter(([,r])=>r.q.margin<P.costs.margin);
  const active=S.dq.filter(d=>d.status==='sent');const soon=active.filter(d=>d.expires<=addDays(today(),3));
  const pr=perfRows();const over=pr.filter(r=>r.var>15);
  const alerts=[];
  if(low.length)alerts.push(['warn',`${low.length} price${low.length>1?'s':''} below your ${P.costs.margin}% target margin`,`Lowest: ${low.sort((a,b)=>a[1].q.margin-b[1].q.margin).slice(0,3).map(([n,r])=>`${n} ${SIZE_LABEL[r.z]} ${Math.round(r.q.margin)}%`).join(', ')}. Check the cost calculator before changing them.`,'calc']);
  if(S.dq.some(d=>d.status==='requested'))alerts.push(['warn',`${S.dq.filter(d=>d.status==='requested').length} quote request needs a price`,'Requests outside your instant-price limits are labelled “Quote requested”, not confirmed.','quotes']);
  if(S.chg.some(c=>c.status==='raised'))alerts.push(['warn','Additional work reported by a cleaner','Propose a price. Nothing is charged until the customer approves.','quotes']);
  if(soon.length)alerts.push(['info',`${soon.length} quote${soon.length>1?'s':''} expiring in the next 3 days`,soon.map(d=>`${d.id} ${d.name}`).join(', '),'quotes']);
  if(over.length)alerts.push(['bad',`${over.length} recent job${over.length>1?'s':''} took over 15% longer than estimated`,'Compare estimated and actual cleaner-hours on the Performance tab.','perf']);
  const freqRow=z=>{const o={svc:'regular',size:z,baths:P.bathsIncluded[z],condition:'average',addons:{},products:'cleaner'};return ['once','monthly','fortnightly','weekly'].map(f=>quote(P,{...o,freq:f}).total)};
  return `<div class="tiles">
    <div class="tile"><span class="label">Price list</span><span class="n mono">v${P.version}</span><span class="d">${esc(SERVICES.regular.basis)}</span></div>
    <div class="tile"><span class="label">Cost per cleaner-hour</span><span class="n mono">${money(loadedRate(P))}</span><span class="d">loaded labour + ${money(visitCosts(P))} a visit for travel, products, overhead</span></div>
    <div class="tile"><span class="label">Active quotes</span><span class="n mono">${active.length}</span><span class="d">${S.dq.filter(d=>d.status==='requested').length} requested · ${S.dq.filter(d=>d.status==='expired').length} expired</span></div>
    <div class="tile"><span class="label">Additional work</span><span class="n mono">${S.chg.filter(c=>['raised','proposed'].includes(c.status)).length}</span><span class="d">waiting for a price or the customer</span></div></div>
  ${alerts.length?`<div class="stack tight">${alerts.map(a=>`<button class="note ${a[0]} small ph-alert" data-act="phTab" data-v="${a[3]}"><b>${a[1]}</b><span>${a[2]}</span></button>`).join('')}</div>`:''}
  <section class="card stack"><div class="set-row"><h2>Service prices</h2><span class="small muted">One-off price for a home in average condition with the standard bathrooms. Margins are estimates from your costs.</span></div>
    <div class="tablewrap"><table class="t ph-table"><thead><tr><th>Property</th><th class="num">Regular</th><th class="num">Deep clean</th><th class="num">End of tenancy</th><th class="num">Bathrooms included</th></tr></thead><tbody>
    ${SIZES.map((z,i)=>`<tr><th scope="row">${SIZE_LABEL[z]}</th>${[reg[i],deep[i],eot[i]].map(r=>`<td class="num"><b class="mono">${money(r.q.total)}</b> <span class="ph-m ${marginTone(r.q.margin,P)}">${Math.round(r.q.margin)}%</span></td>`).join('')}<td class="num">${P.bathsIncluded[z]} · then ${money(P.extraBath)} each</td></tr>`).join('')}
    <tr><th scope="row">Larger homes</th><td colspan="4" class="num muted">Custom quote</td></tr></tbody></table></div></section>
  <section class="card stack"><div class="set-row"><h2>Recurring regular cleans, per visit</h2><span class="small muted">${P.adj.firstAtOneOff?'The first visit of a plan is charged at the one-off price.':'First visits are charged at the plan price.'}</span></div>
    <div class="tablewrap"><table class="t ph-table"><thead><tr><th>Property</th><th class="num">One-off</th><th class="num">Monthly (−${P.adj.monthly}%)</th><th class="num">Fortnightly (−${P.adj.fortnightly}%)</th><th class="num">Weekly (−${P.adj.weekly}%)</th></tr></thead><tbody>
    ${SIZES.map(z=>`<tr><th scope="row">${SIZE_LABEL[z]}</th>${freqRow(z).map(v=>`<td class="num mono">${money(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>
  <div class="set-grid2">
    <section class="card stack"><h2>Commercial</h2><dl class="kv small"><dt>Per visit</dt><dd>${money(P.commercial.perVisit)} for each office clean</dd><dt>Hourly</dt><dd>${money(P.hourly.commercial)} per cleaner-hour (contract) · ${money(P.hourly.commercialOneOff)} one-off</dd><dt>Monthly contract</dt><dd>${money(P.commercial.monthly)} a month for ${P.commercial.visitsIncluded} agreed visits; extra visits at the per-visit price</dd><dt>Large sites</dt><dd>Custom quote after a site visit</dd></dl>
      <p class="small muted">Contracts say how many visits and tasks are included, how extra work is priced, and whether months with more or fewer visits change the charge.</p></section>
    <section class="card stack"><h2>Rules customers see</h2><dl class="kv small"><dt>Instant price</dt><dd>Standard domestic work in your service area</dd><dt>Hourly estimate</dt><dd>Rate, estimated hours, and approval before extra time</dd><dt>Manual review</dt><dd>${Object.entries(P.condition).filter(([,r])=>['review','quote'].includes(r.rule)).map(([k])=>CONDITIONS[k].label).join(', ')||'None'}; extras marked for review</dd><dt>Travel</dt><dd>${(P.area.outer||[]).map(o=>`${o.d} +${money(o.fee)}`).join(' · ')||'No outer areas'}; outside: request a quote</dd><dt>Minimum charge</dt><dd>${money(P.adj.minCharge)} a visit, shown in the breakdown</dd><dt>Quotes</dt><dd>Valid for ${P.quoteDays} days. Accepted prices don’t change when the rate card does.</dd></dl></section></div>
  <p class="small muted">Prices, costs and quotes belong to Fenland Fresh Cleaning only. Other businesses on the platform can’t see or change them. All prices are illustrative and ${P.vat.registered?'include VAT at 20% where shown':'exclude VAT (not VAT registered)'}.</p>`;
}
function calcOut(){const c=S.ph.calc;const ch=c.hours*c.cleaners;const lab=Math.round(ch*c.loaded);const cost=lab+c.travel+c.products+c.overhead;const sug=suggestedPrice(cost,c.margin);
  const contr=c.price-cost;const m=c.price>0?contr/c.price*100:0;const markup=cost>0?contr/cost*100:0;
  return `<table class="ledger" style="width:100%"><tr><td>Labour · ${ch} cleaner-hour${ch===1?'':'s'} × ${money(c.loaded)}</td><td>${money(lab)}</td></tr><tr class="sub"><td>Travel</td><td>${money(c.travel)}</td></tr><tr class="sub"><td>Cleaning products</td><td>${money(c.products)}</td></tr><tr class="sub"><td>Allocated overhead</td><td>${money(c.overhead)}</td></tr><tr class="tot"><td>Total estimated cost</td><td>${money(cost)}</td></tr>
    <tr class="tot"><td>Suggested price for ${c.margin}% margin</td><td style="color:var(--accent)">${money(sug)}</td></tr></table>
    <p class="small muted">${money(cost)} ÷ (1 − ${c.margin/100}) = ${money(sug)}. Adding ${c.margin}% to cost would be a markup (${money(Math.round(cost*(1+c.margin/100)))}), which gives a lower margin.</p>
    <div class="note ${m<0?'bad':m<c.margin?'warn':'good'} small"><b>At your price of ${money(c.price)}</b>: estimated contribution ${money(contr)}, contribution margin ${m.toFixed(1)}% (markup ${markup.toFixed(1)}%). This is a job estimate, not company net profit after all costs and taxes.</div>
    <div class="label">Revenue per on-site hour at ${money(c.price)}</div>
    <div class="row small">${[c.hours-0.5,c.hours,c.hours+1].filter(h=>h>0).map(h=>`<span class="note" style="padding:6px 10px"><b class="mono">${money(Math.round(c.price/h))}</b>/h if it takes ${h} h</span>`).join('')}</div>
    <p class="small muted">These are revenue rates, not profit. Compare the estimate with approved timesheets on the Performance tab.</p>`}
function phCalc(){const c=S.ph.calc;const f=(k,l,u,step)=>`<label class="f small">${l}<span class="row" style="flex-wrap:nowrap;gap:6px">${u==='p'?'<span>£</span>':''}<input type="number" min="0" step="${step||(u==='p'?'0.01':'0.5')}" data-calc="${k}" data-u="${u}" value="${u==='p'?(c[k]/100).toFixed(2):c[k]}">${u==='%'?'<span>%</span>':''}</span></label>`;
  const opts=[['','Load from a service…'],...['regular','deep','eot'].flatMap(s=>['1','2','3'].map(z=>[`${s}|${z}`,`${SERVICES[s].name}, ${SIZE_LABEL[z]}`]))];
  return `<div class="split pr-split"><section class="card stack"><h2>Estimate a job</h2><p class="small muted">Two cleaners working two hours each is four cleaner-hours, even though the visit lasts two hours. Enter your own costs: the 25–30% employment cost allowance and 10–25% margin range are assumptions to test, not standards.</p>
    <label class="f small" style="max-width:340px">Start from<select id="calc-load" data-act="calcLoad">${opts.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label>
    <div class="grid4">${f('hours','Hours on site','n')}${f('cleaners','Cleaners','n','1')}${f('loaded','Loaded labour cost','p')}${f('margin','Target contribution margin','%','1')}</div>
    <div class="grid4">${f('travel','Travel','p')}${f('products','Cleaning products','p')}${f('overhead','Allocated overhead','p')}${f('price','Price you’ll charge','p')}</div>
    <div class="row"><button class="btn sm" data-act="calcReset">Reset to the worked example</button><button class="btn sm" data-act="calcMine">Use my saved costs</button></div></section>
    <section class="card stack" id="calcout">${calcOut()}</section></div>`}
function quoteTable(d){return `<table class="price" style="width:100%">${d.lines.map(l=>`<tr><td>${esc(l[0])}</td><td>${money(l[1])}</td></tr>`).join('')}${d.disc?`<tr><td>Frequency discount (${d.pct}%)</td><td>−${money(d.disc)}</td></tr>`:''}${d.minAdj?`<tr><td>Minimum charge adjustment</td><td>${money(d.minAdj)}</td></tr>`:''}<tr><td class="muted">${d.vat?'VAT at 20%':'VAT (not VAT registered)'}</td><td>${money(d.vat||0)}</td></tr><tr class="tot"><td>${d.o&&d.o.freq&&d.o.freq!=='once'?'Total per visit':'Total'}</td><td>${money(d.total)}</td></tr>${d.first?`<tr><td class="muted">First visit (one-off price)</td><td>${money(d.first)}</td></tr>`:''}</table>`}
function phQuotes(){const P=S.pricing;
  const row=d=>{const [l,tone]=dqStatus(d);return `<tr><td><b class="mono">${d.id}</b> v${d.ver}<div class="small muted">${esc(d.name)}</div></td><td class="small">${esc(SERVICES[d.o.svc].name)}, ${SIZE_LABEL[d.o.size]}<div class="muted">${esc(CONDITIONS[d.o.condition||'average'].label)} · ${FREQ[d.o.freq||'once'].label}</div></td><td class="num mono">${d.status==='requested'?'–':money(d.total)}</td><td>${pill(l,tone)}</td><td class="small">${d.status==='requested'?'Received '+fmtD(d.created):d.expires?`${d.status==='expired'?'Expired':'Expires'} ${fmtD(d.expires)}`:'–'}</td>
    <td class="num">${d.status==='requested'?`<button class="btn sm primary" data-act="qbReview" data-id="${d.id}">Review and price</button>`:d.status==='expired'?`<button class="btn sm" data-act="qbRevise" data-id="${d.id}">Send updated version</button>`:d.status==='sent'?`<button class="btn sm ghost" data-act="dqWithdraw" data-id="${d.id}">Withdraw</button>`:''}<button class="btn sm ghost" data-act="dqView" data-id="${d.id}">View</button></td></tr>`};
  const crow=c=>{const v=S.visits[c.visit];const [l,tone]=chgStatus(c);const C=S.customers[c.customer];return `<div class="card stack tight"><div class="set-row"><div><b class="mono">${c.id}</b> · ${esc(C?C.name:'')} · ${v?fmtD(v.date)+' '+v.start:''}</div>${pill(l,tone)}</div>
    <p class="small">${esc(c.desc)}</p><p class="small muted">Reported by ${esc(c.raisedBy)} · ${esc(c.raisedAt)}${c.proposedAt?` · price proposed ${esc(c.proposedAt)}`:''}</p>
    ${c.status==='raised'?`<div class="row"><label class="f small" style="max-width:180px">Proposed price<span class="row" style="flex-wrap:nowrap;gap:6px"><span>£</span><input type="number" min="1" step="0.01" id="cr-amt-${c.id}" placeholder="30.00"></span></label><button class="btn primary sm" data-act="crPropose" data-id="${c.id}" style="align-self:flex-end">Send to customer for approval</button><button class="btn sm ghost" data-act="crNoCharge" data-id="${c.id}" style="align-self:flex-end">No charge</button></div><div id="cr-err-${c.id}" class="ferr"></div>`:
     c.status==='proposed'?`<p class="small">Proposed <b class="mono">+${money(c.amount)}</b>. The visit stays at ${money(v?v.price||visitValue(v):0)} until the customer approves.</p>`:
     c.status==='approved'?`<p class="small">Approved by the customer: visit now ${money(v?v.price||visitValue(v):0)}.</p>`:`<p class="small">Declined. Work continues to the original scope.</p>`}</div>`};
  return `<section class="card stack"><div class="set-row"><h2>Quotes</h2><button class="btn primary sm" data-act="qbOpen">New quote</button></div>
    <div class="tablewrap"><table class="t"><thead><tr><th>Quote</th><th>Scope</th><th class="num">Total</th><th>Status</th><th>Date</th><th><span class="sr">Actions</span></th></tr></thead><tbody>${S.dq.map(row).join('')}
    ${(S.quotes||[]).filter(q=>q.status!=='superseded').map(q=>`<tr><td><b class="mono">${q.id}</b> v${q.ver}<div class="small muted">Harbour Logistics</div></td><td class="small">Monthly office contract<div class="muted">${esc(S.sites[q.site].name)}</div></td><td class="num mono">${money(q.total)}/mo</td><td>${q.status==='accepted'?pill('Accepted','good'):pill('Sent · awaiting customer','info')}</td><td class="small">Expires ${esc(q.expires)}</td><td></td></tr>`).join('')}</tbody></table></div>
    <p class="small muted">Each quote records the scope, inclusions, exclusions, pricing model, itemised prices, tax, expiry, and the price list and terms versions. An expired quote can’t be accepted until you send an updated version.</p></section>
  <section class="stack"><div class="set-row"><h2>Additional work and condition changes</h2></div><p class="small muted">When a cleaner or supervisor finds more work than agreed, you propose a revised price and the customer approves or declines. No unapproved charge is ever applied.</p>
    ${S.chg.map(crow).join('')||'<div class="empty">Nothing reported.</div>'}</section>`;
}
function phPerf(){const P=S.pricing;const rows=perfRows();
  const avg=rows.length?rows.reduce((x,r)=>x+r.var,0)/rows.length:0;const over=rows.filter(r=>r.var>15);
  const bySvc={};rows.forEach(r=>{const k=r.v.svc;(bySvc[k]=bySvc[k]||[]).push(r)});
  return `<div class="tiles"><div class="tile"><span class="label">Jobs compared</span><span class="n mono">${rows.length}</span><span class="d">completed, last 4 weeks</span></div>
    <div class="tile"><span class="label">Average variance</span><span class="n mono ${avg>10?'neg':''}">${avg>0?'+':''}${avg.toFixed(0)}%</span><span class="d">actual vs estimated cleaner-hours</span></div>
    <div class="tile ${over.length?'alert':''}"><span class="label">Over estimate by 15%+</span><span class="n mono">${over.length}</span><span class="d">review the scope or price</span></div>
    <div class="tile"><span class="label">Labour cost</span><span class="n mono">${money(loadedRate(P))}</span><span class="d">loaded, per cleaner-hour</span></div></div>
  <section class="card stack"><h2>By service</h2><div class="tablewrap"><table class="t"><thead><tr><th>Service</th><th class="num">Jobs</th><th class="num">Estimated hours</th><th class="num">Actual hours</th><th class="num">Variance</th></tr></thead><tbody>
    ${Object.entries(bySvc).map(([k,rs])=>{const e=rs.reduce((x,r)=>x+r.est,0),a=rs.reduce((x,r)=>x+r.act,0);const vv=(a-e)/e*100;return `<tr><td>${esc(SERVICES[k].name)}</td><td class="num">${rs.length}</td><td class="num mono">${e.toFixed(1)}</td><td class="num mono">${a.toFixed(1)}</td><td class="num">${pill((vv>0?'+':'')+vv.toFixed(0)+'%',vv>15?'bad':vv>5?'warn':'good')}</td></tr>`}).join('')}</tbody></table></div>
    ${Object.entries(bySvc).some(([k,rs])=>{const e=rs.reduce((x,r)=>x+r.est,0),a=rs.reduce((x,r)=>x+r.act,0);return (a-e)/e>0.1})?'<div class="note warn small">Actual time regularly exceeds the estimate for at least one service. Raise the typical hours in Price setup, or the price, so margins stay on target.</div>':''}</section>
  <section class="card stack"><h2>Recent jobs</h2><div class="tablewrap"><table class="t"><thead><tr><th>Visit</th><th>Service</th><th class="num">Estimated</th><th class="num">Actual</th><th class="num">Variance</th><th class="num">Revenue per cleaner-hour</th></tr></thead><tbody>
    ${rows.map(r=>`<tr><td><b>${esc(site(r.v).short)}</b><div class="small muted">${fmtD(r.v.date)}</div></td><td class="small">${esc(SERVICES[r.v.svc].name)}</td><td class="num mono">${r.est} h</td><td class="num mono">${r.act} h</td><td class="num">${pill((r.var>0?'+':'')+r.var.toFixed(0)+'%',r.var>15?'bad':r.var>5?'warn':'good')}</td><td class="num mono">${r.rev?money(Math.round(r.rph)):'–'}</td></tr>`).join('')}</tbody></table></div>
    <p class="small muted">Actual hours come from approved check-in and check-out times multiplied by the crew size. Estimates come from your typical hours by size.</p></section>`;
}
function qbQuote(m){const P=S.pricing;const ar=m.pc?areaOf(m.pc):{kind:'main',fee:0};return quote(P,{svc:m.svc,size:m.size,baths:m.baths,condition:m.condition,freq:m.freq,addons:m.addons||{},products:m.products,area:ar})}
const PH_MODALS={
  qbuild(m){const P=S.pricing;const q=qbQuote(m);const opt=(v,cur,l)=>`<option value="${v}" ${String(cur)===String(v)?'selected':''}>${l}</option>`;
    const needCustom=q.status==='review';
    return {title:m.from?`Price ${m.from}${m.revise?' (updated version)':''}`:'New quote',sub:'Itemised prices from your price list. You make the final decision.',wide:true,
    body:`<div class="grid2"><div class="stack">
      <div class="grid2"><label class="f">Customer<input type="text" id="qb-name" value="${esc(m.name||'')}" data-qbt="name"></label><label class="f">Postcode<input type="text" id="qb-pc" value="${esc(m.pc||'')}" data-qb="pc" placeholder="PE6 0JH"></label></div>
      <div class="grid2"><label class="f">Service<select data-qb="svc">${['regular','deep','eot'].map(k=>opt(k,m.svc,SERVICES[k].name)).join('')}</select></label><label class="f">Property<select data-qb="size">${SIZES.map(z=>opt(z,m.size,SIZE_LABEL[z])).join('')}</select></label></div>
      <div class="grid2"><label class="f">Bathrooms<select data-qb="baths">${['1','2','3','4'].map(b=>opt(b,m.baths,b)).join('')}</select><span class="hint">${P.bathsIncluded[m.size]} included</span></label><label class="f">Condition<select data-qb="condition">${Object.entries(CONDITIONS).map(([k,c])=>opt(k,m.condition,c.label)).join('')}</select></label></div>
      <label class="f">Frequency<select data-qb="freq">${Object.entries(FREQ).map(([k,f])=>opt(k,m.freq,f.label)).join('')}</select></label>
      <div><div class="label">Extras</div><div class="choice">${Object.entries(ADDONS).map(([k,a])=>`<label><input type="checkbox" data-qbx="${k}" ${(m.addons||{})[k]?'checked':''}>${esc(a.name)} <span class="mono small">+${money(a.p)}</span></label>`).join('')}</div></div>
      <label class="f">Notes for the customer<input type="text" id="qb-note" value="${esc(m.note||'')}" placeholder="e.g. Living room carpet only"></label></div>
      <div class="stack"><div class="row" style="justify-content:space-between"><b>Customer sees</b>${pill(Q_STATUS[q.status][0],Q_STATUS[q.status][1])}</div>
        ${quoteTable({...q,o:m,first:q.first?q.first.total:null})}
        ${q.reasons.length?`<div class="note warn small"><b>Outside instant-price limits.</b> ${q.reasons.map(esc).join('. ')}. Set the price after your review.</div><label class="f">Custom price for this job<span class="row" style="flex-wrap:nowrap;gap:6px"><span>£</span><input type="number" min="1" step="0.01" id="qb-custom" value="${m.custom?(m.custom/100).toFixed(2):(Math.max(q.net,q.suggested)/100).toFixed(2)}"></span><span class="hint">Pre-filled with the higher of the guide price and the suggested price for your ${P.costs.margin}% margin (${money(q.suggested)}). Adjust it after your review.</span></label>`:''}
        <div class="note small"><b>Only you see this</b><br>Estimated ${q.labour} cleaner-hours · cost ${money(q.cost.total)} · suggested ${money(q.suggested)} · contribution ${money(q.contribution)} (${Math.round(q.margin)}%)</div>
        <p class="small muted">Valid for ${P.quoteDays} days · price list v${P.version} · terms v${S.settings.version}</p></div></div>
      <div id="qb-err" class="ferr"></div>`,
    foot:`<button class="btn primary" data-act="qbSend">Send quote</button>`}},
  dqView(m){const d=S.dq.find(x=>x.id===m.id);const [l,tone]=dqStatus(d);const svc=SERVICES[d.o.svc];
    return {title:`${d.id} v${d.ver} · ${esc(d.name)}`,sub:esc(d.addr),wide:true,body:`<div class="row">${pill(l,tone)}${d.sent?`<span class="small muted">Sent ${fmtD(d.sent)} · ${d.status==='expired'?'expired':'expires'} ${fmtD(d.expires)}</span>`:''}</div>
      <div class="grid2"><div class="stack tight"><dl class="kv small"><dt>Service</dt><dd>${esc(svc.name)}, ${SIZE_LABEL[d.o.size]}, ${d.o.baths} bathroom${d.o.baths>1?'s':''}</dd><dt>Condition</dt><dd>${esc(CONDITIONS[d.o.condition||'average'].label)}</dd><dt>Frequency</dt><dd>${FREQ[d.o.freq||'once'].label}</dd><dt>Pricing</dt><dd>${esc(d.basis||'')}</dd><dt>Versions</dt><dd>Price list v${d.priceList} · terms v${d.terms}</dd></dl>
      <div class="label">Included</div><ul class="small" style="margin:0;padding-left:18px">${svc.inc.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="label">Not included</div><ul class="small" style="margin:0;padding-left:18px">${svc.exc.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${d.note?`<p class="small"><b>Note:</b> ${esc(d.note)}</p>`:''}</div>
      <div>${d.status==='requested'?`<div class="note warn small"><b>Quote requested, not confirmed.</b> ${d.reasons.map(esc).join('. ')}.</div>`:quoteTable(d)}</div></div>`}}
};
function qbFrom(d,revise){return {type:'qbuild',from:d.id,revise:!!revise,name:d.name,pc:(d.addr.match(/[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/)||[''])[0],svc:d.o.svc,size:d.o.size,baths:String(d.o.baths||1),condition:d.o.condition||'average',freq:d.o.freq||'once',addons:{...d.o.addons},products:'cleaner',note:d.note}}
function snapQuote(q,m,status){return {lines:q.lines,net:q.net,vat:q.vat,total:q.total,first:q.first?q.first.total:null,disc:q.disc,pct:q.pct,minAdj:q.minAdj,labour:q.labour,status:q.status,reasons:q.reasons,model:q.model,basis:q.basis,priceList:S.pricing.version,terms:S.settings.version}}
const PH_ACT={
  phTab:e=>{S.ph.tab=e.v;if(e.v!=='setup'&&S.prDraft)S.prDraft=null},
  qbOpen:()=>{S.modal={type:'qbuild',name:'',pc:'',svc:'regular',size:'2',baths:'1',condition:'average',freq:'once',addons:{},products:'cleaner'}},
  qbReview:e=>{S.modal=qbFrom(S.dq.find(x=>x.id===e.id))},
  qbRevise:e=>{S.modal=qbFrom(S.dq.find(x=>x.id===e.id),true)},
  dqView:e=>{S.modal={type:'dqView',id:e.id}},
  dqWithdraw:e=>{const d=S.dq.find(x=>x.id===e.id);d.status='declined';audit('Withdrew quote',`${d.id} v${d.ver}`,d.name);toast(`${d.id} withdrawn.`)},
  qbSend:()=>{const m=S.modal;m.name=val('qb-name');m.note=val('qb-note');if(m.name.length<2){setErr('qb-err','Enter the customer’s name.');return false}
    const q=qbQuote(m);let snap=snapQuote(q,m);
    if(q.status==='review'){const c=Math.round(parseFloat(val('qb-custom'))*100);if(!(c>0)){setErr('qb-err','Set a custom price for this job.');return false}
      const vat=S.pricing.vat.registered?Math.round(c*0.2):0;snap={...snap,lines:[[`${SERVICES[m.svc].name}, ${SIZE_LABEL[m.size]}: custom price after review`,c]],net:c,vat,total:c+vat,first:null,disc:0,minAdj:0,status:'custom',reasons:[],basis:'Custom price after a review of your home.'}}
    const o={svc:m.svc,size:m.size,baths:+m.baths,condition:m.condition,freq:m.freq,addons:{...m.addons},products:m.products};
    let d=m.from?S.dq.find(x=>x.id===m.from):null;
    if(d&&m.revise){const n={...d,ver:d.ver+1};d.status='superseded';d=n;S.dq.unshift(d)}
    else if(!d){d={id:'DQ-'+(203+S.dq.filter(x=>+x.id.slice(3)>202).length),ver:1,customer:null,created:today(),by:ME_BIZ};S.dq.unshift(d)}
    Object.assign(d,snap,{name:m.name,addr:d.addr||(m.pc?normPc(m.pc):'Address to confirm'),o,note:m.note,status:'sent',sent:today(),expires:addDays(today(),S.pricing.quoteDays)});
    S.modal=null;audit('Sent quote',`${d.id} v${d.ver} · ${money(d.total)}`,`${d.name} · expires ${fmtD(d.expires)}`);toast(`Quote ${d.id} v${d.ver} sent. Valid for ${S.pricing.quoteDays} days.`)},
  crPropose:e=>{const c=S.chg.find(x=>x.id===e.id);const a=Math.round(parseFloat(val('cr-amt-'+c.id))*100);if(!(a>0)){setErr('cr-err-'+c.id,'Enter the price for the extra work.');return false}
    c.amount=a;c.status='proposed';c.proposedBy=ME_BIZ;c.proposedAt=stamp();audit('Proposed additional work',`${c.id} +${money(a)}`,'Awaiting customer approval');toast('Sent to the customer for approval. Nothing is charged until they approve.')},
  crNoCharge:e=>{const c=S.chg.find(x=>x.id===e.id);c.amount=0;c.status='approved';audit('Additional work at no charge',c.id,'');toast('Recorded as no charge.')},
  calcReset:()=>{S.ph.calc={...DOC_CALC}},
  calcMine:()=>{const P=S.pricing;Object.assign(S.ph.calc,{loaded:loadedRate(P),travel:P.costs.travel,products:P.costs.products,overhead:P.costs.overheadVisit,margin:P.costs.margin})},
  calcLoad:e=>{if(!e.value)return;const [s,z]=e.value.split('|');const P=S.pricing;const q=quote(P,{svc:s,size:z,baths:P.bathsIncluded[z],condition:'average',freq:'once',addons:{},products:'cleaner'});
    Object.assign(S.ph.calc,{hours:q.dur,cleaners:q.crew,loaded:loadedRate(P),travel:P.costs.travel,products:P.costs.products,overhead:P.costs.overheadVisit,margin:P.costs.margin,price:q.net})}
};
