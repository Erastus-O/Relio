/* PRICING HUB (business) */
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
function calcOut(){const c=S.ph.calc;const ch=c.hours*c.cleaners;const lab=Math.round(ch*c.loaded);const cost=lab+c.travel+c.products+c.overhead;const sug=suggestedPrice(cost,c.margin);
  const contr=c.price-cost;const m=c.price>0?contr/c.price*100:0;const markup=cost>0?contr/cost*100:0;
  return `<table class="ledger" style="width:100%"><tr><td>Labour · ${ch} cleaner-hour${ch===1?'':'s'} × ${money(c.loaded)}</td><td>${money(lab)}</td></tr><tr class="sub"><td>Travel</td><td>${money(c.travel)}</td></tr><tr class="sub"><td>Cleaning products</td><td>${money(c.products)}</td></tr><tr class="sub"><td>Allocated overhead</td><td>${money(c.overhead)}</td></tr><tr class="tot"><td>Total estimated cost</td><td>${money(cost)}</td></tr>
    <tr class="tot"><td>Suggested price for ${c.margin}% margin</td><td style="color:var(--accent)">${money(sug)}</td></tr></table>
    <p class="small muted">${money(cost)} ÷ (1 − ${c.margin/100}) = ${money(sug)}. Adding ${c.margin}% to cost would be a markup (${money(Math.round(cost*(1+c.margin/100)))}), which gives a lower margin.</p>
    <div class="note ${m<0?'bad':m<c.margin?'warn':'good'} small"><b>At your price of ${money(c.price)}</b>: estimated contribution ${money(contr)}, contribution margin ${m.toFixed(1)}% (markup ${markup.toFixed(1)}%). This is a job estimate, not company net profit after all costs and taxes.</div>
    <div class="label">Revenue per on-site hour at ${money(c.price)}</div>
    <div class="row small">${[c.hours-0.5,c.hours,c.hours+1].filter(h=>h>0).map(h=>`<span class="note" style="padding:6px 10px"><b class="mono">${money(Math.round(c.price/h))}</b>/h if it takes ${h} h</span>`).join('')}</div>
    <p class="small muted">These are revenue rates, not profit. Compare the estimate with approved timesheets on the Performance tab.</p>`}
function quoteTable(d){return `<table class="price" style="width:100%">${d.lines.map(l=>`<tr><td>${esc(l[0])}</td><td>${money(l[1])}</td></tr>`).join('')}${d.disc?`<tr><td>Frequency discount (${d.pct}%)</td><td>−${money(d.disc)}</td></tr>`:''}${d.minAdj?`<tr><td>Minimum charge adjustment</td><td>${money(d.minAdj)}</td></tr>`:''}<tr><td class="muted">${d.vat?'VAT at 20%':'VAT (not VAT registered)'}</td><td>${money(d.vat||0)}</td></tr><tr class="tot"><td>${d.o&&d.o.freq&&d.o.freq!=='once'?'Total per visit':'Total'}</td><td>${money(d.total)}</td></tr>${d.first?`<tr><td class="muted">First visit (one-off price)</td><td>${money(d.first)}</td></tr>`:''}</table>`}
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
    foot:`<button class="btn primary" data-act="qbSend">Send quote</button>`}}
};
function snapQuote(q,m,status){return {lines:q.lines,net:q.net,vat:q.vat,total:q.total,first:q.first?q.first.total:null,disc:q.disc,pct:q.pct,minAdj:q.minAdj,labour:q.labour,status:q.status,reasons:q.reasons,model:q.model,basis:q.basis,priceList:S.pricing.version,terms:S.settings.version}}
const PH_ACT={
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
  cuChg:e=>{const c=S.chg.find(x=>x.id===e.id);const v=S.visits[c.visit];
    if(e.v==='yes'){const before=v.price||0;v.price=before+c.amount;const p=S.payments[v.payment];if(p)p.amount=v.price;c.status='approved';c.decidedAt=stamp();
      audit('Customer approved additional work',`${c.id} +${money(c.amount)}`,`${v.id}: ${money(before)} → ${money(v.price)}`,PERSONAS[S.cu.persona].name);toast(`Approved. This visit is now ${money(v.price)}.`)}
    else{c.status='declined';c.decidedAt=stamp();audit('Customer declined additional work',c.id,'Original scope stands',PERSONAS[S.cu.persona].name);toast('Declined. Your cleaner sticks to the original booking.')}},
  dqAccept:e=>{const d=S.dq.find(x=>x.id===e.id);if(d.expires<today()){d.status='expired';toast('This quote has expired. Ask for an updated version.');return}
    d.status='accepted';d.acceptedAt=stamp();audit('Customer accepted quote',`${d.id} v${d.ver} · ${money(d.total)}`,`Snapshot: price list v${d.priceList}, terms v${d.terms}`,PERSONAS[S.cu.persona].name);toast('Quote accepted. We’ll confirm a date with you.')},
  dqDecline:e=>{const d=S.dq.find(x=>x.id===e.id);d.status='declined';audit('Customer declined quote',d.id,'',PERSONAS[S.cu.persona].name);toast('Quote declined.')},
  dqUpdate:e=>{const d=S.dq.find(x=>x.id===e.id);d.updateAsked=true;audit('Customer asked for an updated quote',d.id,'',PERSONAS[S.cu.persona].name);toast('We’ve asked for an updated quote.')},
  bkRequestQuote:()=>{const b=S.book;const p=PERSONAS[S.cu.persona];const q=priceFor(b);
    const d={id:'DQ-'+(203+S.dq.filter(x=>+x.id.slice(3)>202).length),ver:1,customer:p.customer,name:p.name,addr:bookAddr(b),o:{svc:b.svc,size:b.beds,baths:+b.baths||1,condition:b.condition||'average',freq:b.freq,addons:{...b.addons},products:b.products},
      status:'requested',created:today(),sent:null,expires:null,note:'',by:'Customer',...snapQuote(q)};d.status='requested';S.dq.unshift(d);b.requested=d.id;
    audit('Quote requested',`${d.id} · ${SERVICES[b.svc].name}`,q.reasons.join('; '),p.name);toast('Quote requested. Nothing is booked or charged yet.')},
  bkOutsideQuote:()=>{const b=S.book;b.outsideReq=true;b.errors={};b.postcode=normPc(val('bk-postcode')||b.postcode);b.addrs=genAddrs(b.postcode);b.addrsFor=b.postcode;b.addr=''}
};
function cuChgCards(){phInit();const p=PERSONAS[S.cu.persona];const cs=S.chg.filter(c=>c.customer===p.customer&&c.status==='proposed');if(!cs.length)return '';
  return cs.map(c=>{const v=S.visits[c.visit];const now=v.price||visitValue(v)||0;return `<div class="card stack cu-approve"><div class="row" style="justify-content:space-between"><h2>Approve extra work?</h2>${pill('Your approval needed','warn')}</div>
    <p>${esc(c.desc)}</p><table class="price" style="width:100%;max-width:420px"><tr><td>Booked visit, ${fmtD(v.date)}</td><td>${money(now)}</td></tr><tr><td>Proposed extra work</td><td>+${money(c.amount)}</td></tr><tr class="tot"><td>New total if you approve</td><td>${money(now+c.amount)}</td></tr></table>
    <p class="small muted">Nothing changes unless you approve. If you decline, your cleaner sticks to the original booking.</p>
    <div class="row"><button class="btn primary" data-act="cuChg" data-id="${c.id}" data-v="yes">Approve +${money(c.amount)}</button><button class="btn" data-act="cuChg" data-id="${c.id}" data-v="no">Decline</button></div></div>`}).join('')}
function cuDomQuotes(only){phInit();const p=PERSONAS[S.cu.persona];const ds=S.dq.filter(d=>d.customer===p.customer&&d.status!=='superseded'&&(!only||d.id===only));
  return `${ds.length?ds.map(d=>{const [l,tone]=dqStatus(d);const svc=SERVICES[d.o.svc];const exp=d.status==='expired'||(d.expires&&d.expires<today());
    return `<div class="card stack"><div class="row" style="justify-content:space-between"><div><b class="mono">${d.id} v${d.ver}</b> · ${esc(svc.name)}, ${SIZE_LABEL[d.o.size]}<div class="small muted">${d.sent?`Sent ${fmtD(d.sent)} · ${exp?'expired':'valid until'} ${fmtD(d.expires)}`:`Requested ${fmtD(d.created)}`}</div></div>${pill(d.status==='sent'?'Ready to accept':l,d.status==='sent'?'acc':tone)}</div>
      ${d.status==='requested'?`<div class="note warn small"><b>Quote requested, not confirmed.</b> We’ll review your home and send a price to accept here. Nothing is booked or charged yet.</div>`:quoteTable(d)}
      ${d.status!=='requested'?`<details class="small"><summary>What’s included</summary><div class="grid2" style="margin-top:6px"><ul style="margin:0;padding-left:18px">${svc.inc.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><ul style="margin:0;padding-left:18px">${svc.exc.map(x=>`<li>Not included: ${esc(x)}</li>`).join('')}</ul></div></details>`:''}
      ${d.note?`<p class="small">${esc(d.note)}</p>`:''}
      ${d.status==='sent'&&!exp?`<p class="small muted">Price list v${d.priceList} · terms v${d.terms}. The price you accept is kept, even if our prices change later. Cancellation: free until ${S.settings.cancelHours} hours before.</p><div class="row"><button class="btn primary" data-act="dqAccept" data-id="${d.id}">Accept ${money(d.total)}</button><button class="btn" data-act="dqDecline" data-id="${d.id}">Decline</button></div>`:''}
      ${exp&&d.status!=='accepted'?`<div class="note small">This quote has expired and can’t be accepted. ${d.updateAsked?'We’ve asked for an updated version.':`<button class="btn sm" data-act="dqUpdate" data-id="${d.id}">Ask for an updated quote</button>`}</div>`:''}
      ${d.status==='accepted'?`<p class="small">Accepted ${esc(d.acceptedAt)}. We’ll confirm a date with you.</p>`:''}</div>`}).join(''):'<div class="empty">No quotes yet. If your home needs more than a standard clean, choose the condition when you book and we’ll send a quote.</div>'}`;
}
