/* PRICING */
const SIZES=['studio','1','2','3','4','5'];
const SIZE_LABEL={studio:'Studio','1':'1-bed','2':'2-bed','3':'3-bed','4':'4-bed','5':'5-bed'};
const REGION={rest:{label:'Rest of the UK',note:'Example starting prices only. Set and validate your own; rates vary by provider, location, frequency and scope.',band:[1300,2500]},
  london:{label:'London and the South East',note:'Usually higher than elsewhere. Don’t treat London ranges as universal prices; check your own local market.',band:[2000,2800]}};
const CONDITIONS={well:{label:'Well maintained',desc:'Regularly cleaned; ready for routine service'},average:{label:'Average',desc:'Normal cleaning needs'},extra:{label:'Requires extra attention',desc:'Additional time may be needed'},heavy:{label:'Heavy or specialist',desc:'Scope can’t be assessed reliably online'}};
const COND_RULES={standard:'Standard price',pct:'Percentage adjustment',review:'Manual review',quote:'Custom quote or site survey'};
const ADDON_UNITS={fixed:'Fixed fee',room:'Per room',window:'Per window',hour:'Per hour'};
function pricingPreset(region){const L=region==='london';const k=v=>L?Math.round(v*1.25/500)*500:v;return {region,version:0,schema:2,
  costs:{wage:1271,oncost:30,margin:30,travel:600,products:300,overheadVisit:500},
  models:{regular:'fixed',deep:'fixed',eot:'fixed'},
  hourly:{regular:L?2900:2500,deep:L?3500:2800,commercial:L?2900:2500,commercialOneOff:L?3200:2800},
  minHours:2,
  hoursBySize:{studio:2,'1':2.5,'2':3,'3':4,'4':4.5,'5':5},
  bathsIncluded:{studio:1,'1':1,'2':1,'3':1,'4':2,'5':2},extraBath:1200,
  fixed:{regular:{studio:k(6000),'1':k(7500),'2':k(10000),'3':k(13500),'4':k(16500),'5':k(19500)},
         deep:L?{studio:18000,'1':22000,'2':28000,'3':36000,'4':45000,'5':60000}:{studio:14500,'1':17500,'2':22500,'3':29000,'4':36000,'5':48000},
         eot:L?{studio:13500,'1':17500,'2':23000,'3':32500,'4':40000,'5':47500}:{studio:11000,'1':14000,'2':18500,'3':26000,'4':32000,'5':38000}},
  perRoom:L?{bed:2500,bath:3000,kitchen:5500,min:15500,admin:8}:{bed:2000,bath:2400,kitchen:4400,min:12500,admin:8},
  condition:{well:{rule:'standard',pct:0},average:{rule:'standard',pct:0},extra:{rule:'pct',pct:20},heavy:{rule:'quote',pct:0}},
  extras:{ovenSingle:2500,ovenDouble:4500,ovenRange:6000,carpetRoom:L?9000:7000,fridge:1500,windows:2000,ironing:2200},
  addonMeta:{oven:{unit:'fixed',mins:45,review:false},fridge:{unit:'fixed',mins:20,review:false},windows:{unit:'fixed',mins:30,review:false},carpet:{unit:'room',mins:60,review:true},ironing:{unit:'hour',mins:60,review:false}},
  adj:{weekly:15,fortnightly:10,monthly:5,firstAtOneOff:true,sameDay:25,ownSupplies:5,minCharge:L?6000:5000},
  area:{outer:[{d:'PE8',fee:1000},{d:'PE9',fee:1000},{d:'PE10',fee:1000}],outside:'quote'},
  commercial:{perVisit:L?18000:15000,monthly:L?150000:120000,visitsIncluded:8},
  quoteDays:14,
  vat:{registered:false},history:[]}}
function pricingMigrate(P){if(!P||P.schema>=2)return P;const N=pricingPreset(P.region||'rest');
  ['models','hourly','fixed','perRoom','extras','adj','costs','vat','hoursBySize','minHours'].forEach(k=>{if(P[k]&&typeof P[k]==='object'&&!Array.isArray(P[k]))P[k]=Object.assign({},N[k],P[k]);else if(P[k]==null)P[k]=N[k]});
  P.fixed.regular=P.fixed.regular||N.fixed.regular;P.models.regular=P.models.regular==='hourly'?'fixed':P.models.regular;
  if(P.costs.overhead!=null){delete P.costs.overhead}if(P.costs.margin===25)P.costs.margin=30;P.adj.weekly=N.adj.weekly;P.adj.fortnightly=N.adj.fortnightly;P.extras.ovenSingle=N.extras.ovenSingle;P.hoursBySize=N.hoursBySize;
  ['bathsIncluded','extraBath','condition','addonMeta','area','commercial','quoteDays'].forEach(k=>{if(P[k]==null)P[k]=JSON.parse(JSON.stringify(N[k]))});
  P.schema=2;return P}
const VAT_THRESHOLD=9000000;
const AVG_VISIT_HOURS=3;
function loadedRate(P){return Math.round(P.costs.wage*(1+P.costs.oncost/100))}
function visitCosts(P){return P.costs.travel+P.costs.products+P.costs.overheadVisit}
function ohPerHour(P){return Math.round(visitCosts(P)/AVG_VISIT_HOURS)}
function costPerHour(P){return loadedRate(P)+ohPerHour(P)}
function targetRate(P){return Math.round(costPerHour(P)/(1-Math.min(P.costs.margin,90)/100))}
function jobCost(P,hours,o={}){const lab=Math.round(hours*loadedRate(P));const travel=o.noTravel?0:P.costs.travel;const prod=o.customerProducts?0:P.costs.products;
  return {hours,labour:lab,travel,products:prod,overhead:P.costs.overheadVisit,total:lab+travel+prod+P.costs.overheadVisit}}
function suggestedPrice(cost,m){return Math.round(cost/(1-Math.min(m,90)/100))}
function labourFor(svc,size,P){const H=P.hoursBySize[size]||3;return svc==='regular'?Math.max(P.minHours,H):svc==='deep'?H*2:svc==='eot'?H*2.5:H}
function marginTone(m,P){return m<0?'bad':m<P.costs.margin?'warn':'good'}
function marginLabel(m,P){return m<0?'Below cost':m<P.costs.margin?`Below ${P.costs.margin}% target`:'On target'}
function areaOf(pc,P){P=P||S.pricing;const d=normPc(pc||'').split(' ')[0];if(!d)return {kind:'main',fee:0,d};if(S.settings.zones.includes(d))return {kind:'main',fee:0,d};
  const o=(P.area.outer||[]).find(x=>x.d===d);if(o)return {kind:'outer',fee:o.fee,d};return {kind:'outside',fee:0,d}}
function syncPricing(){const P=S.pricing;if(!P)return;pricingMigrate(P);if(S.prDraft)pricingMigrate(S.prDraft);
  ADDONS.oven.p=P.extras.ovenSingle;ADDONS.fridge.p=P.extras.fridge;ADDONS.windows.p=P.extras.windows;ADDONS.ironing.p=P.extras.ironing;ADDONS.carpet.p=P.extras.carpetRoom;
  Object.keys(ADDONS).filter(k=>k.startsWith('x_')&&!(P.customAddons||[]).some(c=>c.k===k)).forEach(k=>delete ADDONS[k]);
  (P.customAddons||[]).forEach(c=>{ADDONS[c.k]={name:c.name,p:P.extras[c.k]||0,task:['Whole home',c.name,null]}});
  Object.keys(ADDONS).forEach(k=>{const m=P.addonMeta[k]||{};ADDONS[k].unit=m.unit||'fixed';ADDONS[k].mins=m.mins||0;ADDONS[k].review=!!m.review});
  FREQ.weekly.pct=P.adj.weekly;FREQ.fortnightly.pct=P.adj.fortnightly;FREQ.monthly.pct=P.adj.monthly;
  SERVICES.regular.basis=P.models.regular==='perroom'?'Priced per room':P.models.regular==='hourly'?`Hourly, ${money(P.hourly.regular)}/h`:'Fixed price per visit by property size';
  SERVICES.deep.basis=P.models.deep==='hourly'?`Hourly, ${money(P.hourly.deep)} per cleaner-hour, two cleaners`:P.models.deep==='custom'?'Custom quote after a review or survey':'Fixed price by property size, two cleaners';
  SERVICES.eot.basis='Fixed price by property size';}
function fromPrice(k,P){P=P||S.pricing;if(k==='regular')return P.models.regular==='perroom'?P.perRoom.min:P.models.regular==='hourly'?Math.round(P.minHours*P.hourly.regular):P.fixed.regular.studio;
  if(k==='deep')return P.models.deep==='hourly'?Math.round(labourFor('deep','studio',P)*P.hourly.deep):P.fixed.deep.studio;return P.fixed.eot.studio}
function quote(P,o){
  const size=o.size||'2';const lines=[];const reasons=[];let labour=labourFor(o.svc,size,P);let basis='';let model='fixed';
  const baths=Math.max(1,+o.baths||1);const incB=P.bathsIncluded[size]||1;const extraB=Math.max(0,baths-incB);
  if(o.svc==='regular'){
    if(P.models.regular==='perroom'){model='perroom';const beds=size==='studio'?1:+size,R=P.perRoom;
      lines.push([`Bedrooms: ${beds} × ${money(R.bed)}`,beds*R.bed],[`Bathrooms: ${baths} × ${money(R.bath)}`,baths*R.bath],['Kitchen',R.kitchen]);
      const rooms=beds*R.bed+baths*R.bath+R.kitchen;if(rooms<R.min)lines.push([`Minimum booking (${money(R.min)})`,R.min-rooms]);
      lines.push([`Admin fee (${R.admin}%)`,Math.round(Math.max(rooms,R.min)*R.admin/100)]);basis='Priced per room. The price is fixed for the rooms listed.'}
    else if(P.models.regular==='hourly'){model='hourly';const h=labour+extraB*0.5;labour=h;lines.push([`Regular home clean · about ${h} h × ${money(P.hourly.regular)}/h`,Math.round(h*P.hourly.regular)]);
      basis=`Hourly at ${money(P.hourly.regular)}/h for about ${h} hours (minimum ${P.minHours} h). Extra time is only charged if you approve it first.`}
    else{lines.push([`Regular home clean, ${SIZE_LABEL[size]} (includes ${incB} bathroom${incB>1?'s':''})`,P.fixed.regular[size]]);basis='Fixed price per visit for the rooms and tasks listed.'}}
  else if(o.svc==='deep'){
    if(P.models.deep==='hourly'){model='hourly';lines.push([`Deep clean · about ${labour} cleaner-hours × ${money(P.hourly.deep)}/h`,Math.round(labour*P.hourly.deep)]);basis=`Hourly at ${money(P.hourly.deep)} per cleaner-hour, two cleaners. Extra time needs your approval.`}
    else if(P.models.deep==='custom'){model='custom';reasons.push('Deep cleans are priced after a review or survey');lines.push([`Deep clean, ${SIZE_LABEL[size]} (guide price)`,P.fixed.deep[size]]);basis='Guide price only. We confirm a custom quote after reviewing your home.'}
    else{lines.push([`Deep clean, ${SIZE_LABEL[size]} (includes ${incB} bathroom${incB>1?'s':''})`,P.fixed.deep[size]]);basis='Fixed price for your property size.'}}
  else if(o.svc==='eot'){lines.push([`End of tenancy clean, ${SIZE_LABEL[size]} (includes ${incB} bathroom${incB>1?'s':''})`,P.fixed.eot[size]]);basis='Fixed price for your property size.'}
  if(extraB&&model!=='perroom'&&model!=='hourly'){lines.push([`Extra bathroom${extraB>1?'s':''}: ${extraB} × ${money(P.extraBath)}`,extraB*P.extraBath]);labour+=extraB*0.5}
  const cond=o.condition||'average';const cr=P.condition[cond]||{rule:'standard'};let condAdj=0;
  if(cr.rule==='pct'&&cr.pct){const b0=lines.reduce((x,l)=>x+l[1],0);condAdj=Math.round(b0*cr.pct/100);lines.push([`Condition: ${CONDITIONS[cond].label.toLowerCase()} (+${cr.pct}%)`,condAdj]);labour=Math.round(labour*(1+cr.pct/100)*2)/2}
  if(cr.rule==='review')reasons.push(`Condition “${CONDITIONS[cond].label}” needs a manual review`);
  if(cr.rule==='quote')reasons.push(`Condition “${CONDITIONS[cond].label}” needs a custom quote or site survey`);
  const base=lines.reduce((x,l)=>x+l[1],0);
  const ad=Object.keys(o.addons||{}).filter(k=>o.addons[k]&&ADDONS[k]);
  ad.forEach(k=>{const A=ADDONS[k];lines.push([`${A.name}${A.unit&&A.unit!=='fixed'?` (${ADDON_UNITS[A.unit].toLowerCase()})`:''}`,A.p]);labour+=(A.mins||0)/60;if(A.review)reasons.push(`${A.name} needs a quick review of your home first`)});
  const area=o.area||{kind:'main',fee:0};
  if(area.kind==='outer'&&area.fee)lines.push([`Travel adjustment (${area.d||'outer'} area)`,area.fee]);
  if(area.kind==='outside')reasons.push(`${area.d||'This postcode'} is outside the published service area`);
  const sub=lines.reduce((x,l)=>x+l[1],0);
  const pct=o.freq==='weekly'?P.adj.weekly:o.freq==='fortnightly'?P.adj.fortnightly:o.freq==='monthly'?P.adj.monthly:0;const disc=Math.round(base*pct/100);
  const prodDisc=o.products==='customer'?Math.round(base*P.adj.ownSupplies/100):0;
  const finish=d=>{let n=sub-d-prodDisc;const m=n<P.adj.minCharge?P.adj.minCharge-n:0;n+=m;const v=P.vat.registered?Math.round(n*0.2):0;return {net:n,minAdj:m,vat:v,total:n+v}};
  const F=finish(disc);const first=pct&&P.adj.firstAtOneOff?finish(0):null;
  const crew=SERVICES[o.svc]?SERVICES[o.svc].crew:1;labour=Math.round(labour*4)/4;
  const cost=jobCost(P,labour,{customerProducts:o.products==='customer'});
  const status=reasons.length?'review':model==='hourly'?'estimate':'instant';
  return {lines,sub,base,disc,pct,prodDisc,minAdj:F.minAdj,net:F.net,vat:F.vat,total:F.total,first:first&&first.total!==F.total?first:null,labour,crew,dur:Math.round(labour/crew*2)/2,basis,model,status,reasons,area,condition:cond,
    cost,suggested:suggestedPrice(cost.total,P.costs.margin),contribution:F.net-cost.total,margin:F.net>0?(F.net-cost.total)/F.net*100:0};
}
const Q_STATUS={instant:['Instant fixed price','good'],estimate:['Hourly estimate','info'],review:['Quote requested','warn']};
function prGet(path){return path.split('.').reduce((o,k)=>o[k],S.prDraft)}
function prSet(path,val){const ks=path.split('.');const last=ks.pop();ks.reduce((o,k)=>o[k],S.prDraft)[last]=val}
function prIn(path,unit,opts={}){const v=prGet(path);const val=unit==='p'?(v/100).toFixed(2):v;
  return `<input type="number" id="pr-${path.replace(/\./g,'-')}" data-pr="${path}" data-u="${unit}" value="${val}" min="0" step="${unit==='p'?'0.01':opts.step||'1'}" ${opts.max?`max="${opts.max}"`:''} aria-label="${esc(opts.label||path)}" style="${opts.w?`max-width:${opts.w}`:''}">`}
function prSide(){const P=S.prDraft;const L=loadedRate(P),R=REGION[P.region];
  const ex=[['Regular clean, 2-bed, one-off',{svc:'regular',size:'2',baths:1,freq:'once'}],['Regular clean, 3-bed, weekly',{svc:'regular',size:'3',baths:1,freq:'weekly'}],['Regular 2-bed + oven + extra bathroom',{svc:'regular',size:'2',baths:2,freq:'once',addons:{oven:true}}],['Deep clean, 2-bed',{svc:'deep',size:'2',baths:1,freq:'once'}],['End of tenancy, 2-bed',{svc:'eot',size:'2',baths:1,freq:'once'}]];
  const reg2=quote(P,{svc:'regular',size:'2',baths:1,freq:'once',condition:'average'});
  return `<div class="card stack"><h2>Your numbers</h2>
    <table class="ledger" style="width:100%"><tr><td>Wage</td><td>${money(P.costs.wage)}/h</td></tr><tr class="sub"><td>+ employer costs (${P.costs.oncost}%)</td><td>${money(L-P.costs.wage)}</td></tr><tr class="tot"><td>Loaded labour per cleaner-hour</td><td>${money(L)}</td></tr>
    <tr class="sub"><td>+ travel, products, overhead per visit</td><td>${money(visitCosts(P))}</td></tr></table>
    <div class="label">Regular 2-bed, one-off</div>
    <table class="ledger" style="width:100%"><tr class="sub"><td>${reg2.cost.hours} cleaner-hours × ${money(L)}</td><td>${money(reg2.cost.labour)}</td></tr><tr class="sub"><td>Travel, products, overhead</td><td>${money(reg2.cost.travel+reg2.cost.products+reg2.cost.overhead)}</td></tr><tr class="tot"><td>Estimated cost</td><td>${money(reg2.cost.total)}</td></tr><tr class="tot"><td>Suggested for ${P.costs.margin}% margin</td><td style="color:var(--accent)">${money(reg2.suggested)}</td></tr><tr><td>Your price</td><td><b>${money(reg2.net)}</b> ${pill(Math.round(reg2.margin)+'%',marginTone(reg2.margin,P))}</td></tr></table>
    <p class="small muted">Suggested price = estimated cost ÷ (1 − target margin). Adding ${P.costs.margin}% to cost is a markup and gives a lower margin.</p>
    <div class="label">Example quotes</div>
    ${ex.map(([n,o])=>{const q=quote(P,{condition:'average',...o});return `<div class="row small" style="justify-content:space-between;border-bottom:1px solid var(--line);padding:5px 0;flex-wrap:nowrap;gap:8px"><span style="min-width:0">${n}<div class="muted">${q.labour} cleaner-hours · cost ${money(q.cost.total)}</div></span><span style="text-align:right"><b class="mono">${money(q.total)}</b><div>${pill(`${Math.round(q.margin)}% margin`,marginTone(q.margin,P))}</div></span></div>`}).join('')}
    <p class="small muted">${esc(R.note)} Margins are job estimates, not company net profit.</p></div>`;
}
function prSetupForm(){
  if(!S.prDraft)S.prDraft=JSON.parse(JSON.stringify(S.pricing));const P=S.prDraft;pricingMigrate(P);const R=REGION[P.region];
  const grid=(path)=>`<div class="sizegrid">${SIZES.map(z=>`<label class="f small">${SIZE_LABEL[z]}${prIn(path+'.'+z,'p',{label:`${path} ${SIZE_LABEL[z]}`})}</label>`).join('')}</div>`;
  const ngrid=(path,step)=>`<div class="sizegrid">${SIZES.map(z=>`<label class="f small">${SIZE_LABEL[z]}${prIn(path+'.'+z,'n',{label:`${path} ${SIZE_LABEL[z]}`,step:step||'1'})}</label>`).join('')}</div>`;
  const row=(label,inner,hint)=>`<div class="prrow"><div><b>${label}</b>${hint?`<div class="small muted">${hint}</div>`:''}</div><div class="stack tight" style="min-width:0">${inner}</div></div>`;
  const money2=(path,label,suffix='')=>`<label class="f small">${label}<span class="row" style="flex-wrap:nowrap;gap:6px"><span>£</span>${prIn(path,'p',{label})}${suffix?`<span class="muted">${suffix}</span>`:''}</span></label>`;
  const pctIn=(path,label,max=100)=>`<label class="f small">${label}<span class="row" style="flex-wrap:nowrap;gap:6px">${prIn(path,'n',{label,max,step:'0.5'})}<span>%</span></span></label>`;
  const radio=(name,path,cur,opts)=>`<div class="choice">${opts.map(([v,l])=>`<label><input type="radio" name="${name}" data-prfull="${path}" value="${v}" ${cur===v?'checked':''}>${l}</label>`).join('')}</div>`;
  return `<div class="rota-top"><div><h2>Price setup</h2><p class="muted">New quotes and bookings use these prices once you save. Existing bookings and accepted quotes keep the price and terms they were accepted at.</p></div>
    <div class="row"><button class="btn" data-act="prCancel">Cancel</button><button class="btn primary" data-act="prSave">Save price list v${(S.pricing.version||0)+1}</button></div></div>
  <div id="prerr" class="ferr"></div>
  <div class="split pr-split"><div class="stack" style="min-width:0">
  <div class="card stack"><h2>1. Where you work</h2><div class="choice">${Object.entries(REGION).map(([k,r])=>`<label><input type="radio" name="prregion" data-prfull="region" value="${k}" ${P.region===k?'checked':''}>${r.label}</label>`).join('')}</div>
    <p class="small muted">${R.note}</p><button class="btn sm" data-act="prPreset" style="align-self:flex-start">Fill in example rates for ${R.label}</button></div>
  <div class="card stack"><h2>2. Your costs</h2><p class="small muted">Enter your actual costs. They set the suggested price, feed Finance, and are never shown to customers. The 25–30% employment cost allowance is an assumption to test.</p>
    <div class="grid4">${money2('costs.wage','Cleaner wage','per hour')}${pctIn('costs.oncost','Employer costs (NI, holiday, pension)')}${pctIn('costs.margin','Target contribution margin',90)}</div>
    <div class="grid4">${money2('costs.travel','Travel','per visit')}${money2('costs.products','Cleaning products','per visit')}${money2('costs.overheadVisit','Allocated overhead','per visit')}</div>
    <p class="small muted">National Living Wage is £12.71/h. A 10–25% margin range is common guidance, not a guarantee.</p></div>
  <div class="card stack"><h2>3. How you price each service</h2>
    ${row('Regular home cleaning',`${radio('prreg','models.regular',P.models.regular,[['fixed','Fixed price per visit'],['hourly','Hourly'],['perroom','Per room']])}
      ${P.models.regular==='fixed'?grid('fixed.regular'):P.models.regular==='hourly'?`<div class="grid4">${money2('hourly.regular','Hourly rate','per hour')}<label class="f small">Minimum hours${prIn('minHours','n',{label:'Minimum hours',step:'0.5'})}</label></div><p class="small muted">Customers see the rate, the estimated hours, and that extra time needs their approval first.</p>`
      :`<div class="grid4">${money2('perRoom.bed','Per bedroom')}${money2('perRoom.bath','Per bathroom')}${money2('perRoom.kitchen','Kitchen')}${money2('perRoom.min','Minimum booking')}${pctIn('perRoom.admin','Admin fee')}</div>`}`,'A fixed price suits predictable regular cleans: it improves profit when the job is estimated accurately. Hourly suits uncertain scope or condition.')}
    ${row('Deep cleaning',`${radio('prdeep','models.deep',P.models.deep,[['fixed','Fixed by property size'],['hourly','Hourly'],['custom','Custom quote']])}
      ${P.models.deep==='hourly'?`<div class="grid4">${money2('hourly.deep','Rate per cleaner-hour','per hour')}</div>`:grid('fixed.deep')}${P.models.deep==='custom'?'<p class="small muted">Shown to customers as a guide price. Every request becomes “Quote requested” until you set the price.</p>':''}`,'Two cleaners. A fixed price gives customers certainty; hourly or a custom quote protects you when condition is unknown.')}
    ${row('End of tenancy',grid('fixed.eot'),'Usually priced by property size.')}
    ${row('Typical hours by size',ngrid('hoursBySize','0.5'),'Cleaner-hours for a regular clean. Deep cleans take about 2×, end of tenancy about 2.5×. Used for duration, rota and estimated cost.')}
    ${row('Commercial',`<div class="grid4">${money2('commercial.perVisit','Per visit','each clean')}${money2('hourly.commercial','Hourly, contract','per cleaner-hour')}${money2('hourly.commercialOneOff','Hourly, one-off','per cleaner-hour')}${money2('commercial.monthly','Monthly contract','per month')}</div><label class="f small" style="max-width:220px">Visits included in the monthly contract${prIn('commercial.visitsIncluded','n',{label:'Visits included'})}</label>`,'Large or complex sites get a custom quote after a site visit. Contracts state the visits and tasks included and how extra work is priced.')}</div>
  <div class="card stack"><h2>4. Property rules</h2>
    ${row('Bathrooms included',`${ngrid('bathsIncluded')}<div class="grid4">${money2('extraBath','Each extra bathroom','fixed fee')}</div>`,'Bedroom count is a starting point. Extra bathrooms add time, so they add a fixed fee.')}
    ${row('Condition',`<div class="tablewrap"><table class="t small"><thead><tr><th>Condition</th><th>Result</th><th>Adjustment</th></tr></thead><tbody>${Object.entries(CONDITIONS).map(([k,c])=>`<tr><td><b>${c.label}</b><div class="muted">${c.desc}</div></td><td><select data-prfull="condition.${k}.rule" aria-label="Rule for ${c.label}">${Object.entries(COND_RULES).map(([r,l])=>`<option value="${r}" ${P.condition[k].rule===r?'selected':''}>${l}</option>`).join('')}</select></td><td>${P.condition[k].rule==='pct'?`<span class="row" style="flex-wrap:nowrap;gap:6px">${prIn(`condition.${k}.pct`,'n',{label:'Adjustment',w:'90px'})}<span>%</span></span>`:'<span class="muted">–</span>'}</td></tr>`).join('')}</tbody></table></div>`,'Customers choose their home’s condition. Labels and rules are yours to set; never apply an unclear condition charge.')}</div>
  <div class="card stack"><h2>5. Add-ons</h2><p class="small muted">Customers pick extras themselves and see the price impact before accepting.</p>
    <div class="tablewrap"><table class="t small"><thead><tr><th>Add-on</th><th>Price</th><th>Unit</th><th>Extra time</th><th>Needs review</th><th><span class="sr">Remove</span></th></tr></thead><tbody>
    ${[['oven','extras.ovenSingle'],['fridge','extras.fridge'],['windows','extras.windows'],['carpet','extras.carpetRoom'],['ironing','extras.ironing'],...(P.customAddons||[]).map(c=>[c.k,'extras.'+c.k,c])].map(([k,path,cu])=>{const nm=cu?cu.name:ADDONS[k].name;return `<tr><td><b>${esc(nm.replace(/ \(.*\)/,''))}</b>${cu&&!(S.pricing.customAddons||[]).some(x=>x.k===k)?' '+pill('New','info'):''}</td><td><span class="row" style="flex-wrap:nowrap;gap:6px"><span>£</span>${prIn(path,'p',{label:nm+' price',w:'110px'})}</span></td>
      <td><select data-prfull="addonMeta.${k}.unit" aria-label="Unit">${Object.entries(ADDON_UNITS).map(([u,l])=>`<option value="${u}" ${P.addonMeta[k].unit===u?'selected':''}>${l}</option>`).join('')}</select></td><td><span class="row" style="flex-wrap:nowrap;gap:6px">${prIn(`addonMeta.${k}.mins`,'n',{label:'Extra minutes',w:'80px'})}<span>min</span></span></td><td><input type="checkbox" data-prfull="addonMeta.${k}.review" ${P.addonMeta[k].review?'checked':''} aria-label="Needs review"></td><td class="num">${cu?`<button class="btn sm ghost ls-del" data-act="prAddonDel" data-v="${k}">Remove</button>`:''}</td></tr>`}).join('')}</tbody></table></div>
    ${S.prAddonForm?`<div class="pr-addf"><div class="grid4"><label class="f small">Add-on name<input type="text" id="pra-name" placeholder="e.g. Inside the microwave"></label><label class="f small">Price (£)<input type="number" id="pra-price" min="0" step="0.01" placeholder="15.00"></label><label class="f small">Unit<select id="pra-unit">${Object.entries(ADDON_UNITS).map(([u,l])=>`<option value="${u}">${l}</option>`).join('')}</select></label><label class="f small">Extra time (min)<input type="number" id="pra-mins" min="0" step="5" value="30"></label></div>
      <label class="row small"><input type="checkbox" id="pra-rev"> Needs a quick review before it’s confirmed</label><div id="pra-err" class="ferr"></div><div class="row"><button class="btn sm primary" data-act="prAddonAdd">Add to price list</button><button class="btn sm ghost" data-act="prAddonForm">Cancel</button></div></div>`
      :`<button class="btn sm" data-act="prAddonForm" style="align-self:flex-start">${SET_IC.plus.replace('<svg','<svg width="14" height="14"')}Add an add-on</button>`}
    <p class="small muted">New add-ons go live when you publish the price list. Customers see them when booking and in quotes.</p></div>
  ${(()=>{const os=(S.mkt?S.mkt.listings:[]).filter(l=>l.prov==='ff'&&!(l.svc&&l.svc!=='office'));return `<div class="card stack" id="pr-other"><div class="set-row"><div><h2>Other services</h2><p class="small muted">Services you added in Listings and profile. Each has its own pricing model. Changes here save straight away and don’t need the price list published.</p></div><button class="btn sm" data-act="lsPickGo2">Add service</button></div>
    ${os.length?`<div class="tablewrap"><table class="t small"><thead><tr><th>Service</th><th>Pricing model</th><th>Price</th><th>Typical UK / London</th><th><span class="sr">Edit</span></th></tr></thead><tbody>${os.map(l=>{const pr=(PM_PRESETS[l.cat]||{})[l.type];return `<tr${S.prFocus===l.id?' class="pr-hl"':''}><td><b>${esc(l.name)}</b><div class="muted">${pill(...L_STATUS[l.status])}</div></td><td>${l.pm?PM_MODELS[l.pm.model].name:'–'}</td><td>${l.priceSet===false?pill('Not set','warn'):esc(priceLabel(l))}</td><td class="muted">${pr?esc(pr.range):'–'}</td><td class="num"><button class="btn sm${l.priceSet===false?' primary':''}" data-act="pmEdit" data-src="listing" data-v="${l.id}">${l.priceSet===false?'Set price':'Edit price'}</button></td></tr>`}).join('')}</tbody></table></div>`:'<p class="small muted">None yet.</p>'}</div>`})()}
  <div class="card stack"><h2>6. Recurring cleans and discounts</h2>
    <div class="grid4">${pctIn('adj.weekly','Weekly discount')}${pctIn('adj.fortnightly','Fortnightly discount')}${pctIn('adj.monthly','Monthly discount')}${pctIn('adj.ownSupplies','When the customer supplies products')}</div>
    <div class="grid4">${money2('adj.minCharge','Minimum charge','per visit')}${pctIn('adj.sameDay','Same-day surcharge',200)}</div>
    <label class="row"><input type="checkbox" data-prfull="adj.firstAtOneOff" ${P.adj.firstAtOneOff?'checked':''}> Charge the first visit of a recurring plan at the one-off price</label>
    <p class="small muted">Customers see the price per visit, frequency, first-visit price, and how future price changes are proposed. Check the margin impact in Overview before saving.</p></div>
  <div class="card stack"><h2>7. Service areas and travel</h2><p class="small muted">Main area: ${S.settings.zones.join(', ')} (no travel charge). Edit the main area in Settings. Outer areas add a travel adjustment, shown before the customer accepts.</p>
    <div class="stack tight">${(P.area.outer||[]).map((o,i)=>`<div class="row" style="flex-wrap:nowrap;gap:8px"><b class="mono" style="min-width:56px">${esc(o.d)}</b><span>+ £</span>${prIn(`area.outer.${i}.fee`,'p',{label:`Travel ${o.d}`,w:'110px'})}<button class="btn sm ghost" data-act="prAreaDel" data-v="${i}" aria-label="Remove ${esc(o.d)}">Remove</button></div>`).join('')}</div>
    <div class="row"><input type="text" id="pr-area-new" placeholder="e.g. PE13" style="max-width:140px" aria-label="Postcode district"><button class="btn sm" data-act="prAreaAdd">Add outer area</button></div><div id="pr-area-err" class="ferr"></div>
    <p class="small muted">Anywhere else: customers can request a quote; nothing is booked automatically.</p></div>
  <div class="card stack"><h2>8. Quotes and VAT</h2>
    <label class="f small" style="max-width:220px">Quotes are valid for (days)${prIn('quoteDays','n',{label:'Quote validity'})}</label>
    <label class="row"><input type="checkbox" data-prfull="vat.registered" ${P.vat.registered?'checked':''}> We're VAT registered (add 20% and show it on every quote)</label>
    <p class="small muted">Registration is mandatory once taxable turnover passes £90,000 in any rolling 12 months. Finance tracks how close you are.</p></div>
  </div><div class="stack" id="prside" style="position:sticky;top:calc(80px + env(safe-area-inset-top,0px))">${prSide()}</div></div>`;
}
function bizPricing(){return bizPricingHub()}
