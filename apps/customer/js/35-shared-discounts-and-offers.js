/* DISCOUNTS AND OFFERS (business pricing) */
const OF_SVCS=[['regular','Regular clean'],['deep','Deep clean'],['eot','End of tenancy']];
const OF_DAYS=[[1,'Mon'],[2,'Tue'],[3,'Wed'],[4,'Thu'],[5,'Fri'],[6,'Sat'],[0,'Sun']];
function ofInit(){if(!S.offers){S.offers=[
  {id:'OF-1',name:'Welcome offer',how:'code',code:'WELCOME10',type:'pct',value:10,svcs:['regular','deep','eot'],min:0,first:true,days:[],from:'2026-09-01',to:'',limit:0,perCust:true,status:'active',used:6,cost:6150,rev:55350,made:'Tue 1 Sep'},
  {id:'OF-2',name:'Midweek saver',how:'auto',code:'',type:'pct',value:15,svcs:['regular'],min:6000,first:false,days:[2,3],from:'2026-10-01',to:'2026-11-30',limit:40,perCust:false,status:'active',used:4,cost:6000,rev:34000,made:'Thu 1 Oct'},
  {id:'OF-3',name:'Spring deep clean',how:'code',code:'SPRING20',type:'fixed',value:2000,svcs:['deep'],min:12000,first:false,days:[],from:'2026-03-01',to:'2026-05-31',limit:30,perCust:true,status:'ended',used:17,cost:34000,rev:263500,made:'Sun 1 Mar'}];S.offerRed=[]}return S.offers}
function ofLive(o){if(o.status!=='active')return false;const t=today();if(o.from&&t<o.from)return false;if(o.to&&t>o.to)return false;if(o.limit&&o.used>=o.limit)return false;return true}
function ofState(o){if(o.status==='paused')return ['Paused',''];if(o.status==='ended'||(o.to&&today()>o.to))return ['Ended',''];if(o.from&&today()<o.from)return ['Scheduled','info'];if(o.limit&&o.used>=o.limit)return ['Used up','warn'];return ['Active','good']}
function ofDesc(o){return o.type==='pct'?`${o.value}% off`:`${money(o.value)} off`}
function ofIsFirst(cust){return !Object.values(S.visits).some(v=>custOf(v)===cust&&!v.correctiveOf)}
function ofCheck(o,ctx){if(!ofLive(o))return o.status==='paused'?'This offer is paused.':(o.to&&today()>o.to)?'This offer has ended.':(o.limit&&o.used>=o.limit)?'This offer has been fully used.':'This offer isn’t active yet.';
  if(!o.svcs.includes(ctx.svc))return `This offer is for ${o.svcs.map(k=>(OF_SVCS.find(x=>x[0]===k)||[0,k])[1].toLowerCase()).join(' or ')} only.`;
  if(o.min&&ctx.amount<o.min)return `Spend ${money(o.min)} or more to use this offer.`;
  if(o.first&&!ofIsFirst(ctx.cust))return 'This offer is for your first booking only.';
  if(o.days.length&&ctx.date&&!o.days.includes(dt(ctx.date).getDay()))return `This offer is for ${OF_DAYS.filter(d=>o.days.includes(d[0])).map(d=>d[1]).join(' and ')} bookings only.`;
  if(o.perCust&&(S.offerRed||[]).some(r=>r.offer===o.id&&r.cust===ctx.cust))return 'You’ve already used this offer.';return ''}
function ofAmount(o,amount){return Math.min(amount,o.type==='pct'?Math.round(amount*o.value/100):o.value)}
function ofFor(ctx){ofInit();let codeErr='';let pick=null;
  if(ctx.code){const o=S.offers.find(x=>x.how==='code'&&x.code===ctx.code.trim().toUpperCase());if(!o)codeErr='We don’t recognise that code.';else{const e=ofCheck(o,ctx);if(e)codeErr=e;else pick=o}}
  if(!pick){S.offers.filter(o=>o.how==='auto'&&!ofCheck(o,ctx)).forEach(o=>{if(!pick||ofAmount(o,ctx.amount)>ofAmount(pick,ctx.amount))pick=o})}
  return {offer:pick,disc:pick?ofAmount(pick,ctx.amount):0,codeErr}}
function ofPreview(d){const q=quote(S.pricing,{svc:d.svcs[0]||'regular',size:'2',baths:1,condition:'average',freq:'once',addons:{},products:'cleaner'});const price=q.total;const disc=d.value>0?Math.min(price,d.type==='pct'?Math.round(price*d.value/100):d.value):0;
  const net=Math.round(q.net-disc/(q.vat?1.2:1));const cost=q.cost?q.cost.total:0;const mg=net>0?Math.round((net-cost)/net*100):-100;const tgt=S.pricing.costs.margin;const ok=!d.min||price>=d.min;
  return `<div class="pm-prev"><b class="small">Example: ${(OF_SVCS.find(x=>x[0]===(d.svcs[0]||'regular'))||[0,''])[1].toLowerCase()}, 2 bedrooms</b><table class="t pm-break"><tbody><tr><td>Price</td><td class="num mono">${money(price)}</td></tr><tr><td>${esc(d.name||'Offer')}</td><td class="num mono">${ok?'−'+money(disc):'not eligible'}</td></tr><tr class="ad-tot"><td><b>Customer pays</b></td><td class="num mono"><b>${money(ok?price-disc:price)}</b></td></tr></tbody></table>
    ${cost?`<p class="small">Margin on this job: <b style="color:${mg<0?'var(--bad)':mg<tgt?'var(--warn)':'var(--good,#15803d)'}">${mg}%</b> <span class="muted">(target ${tgt}%)</span></p>${mg<tgt&&ok?`<p class="small" style="color:${mg<0?'var(--bad)':'var(--warn)'}">${mg<0?'This discount makes the job lose money.':'Below your target margin. Consider a smaller discount or a minimum spend.'}</p>`:''}`:''}</div>`}
function ofForm(m){const d=m.d;const chk=(k,on,l,extra='')=>`<label class="row small"><input type="checkbox" data-ofd="${k}" ${on?'checked':''} ${extra}> ${l}</label>`;
  return `<div class="pm-ed"><div class="stack">
    <label class="f">Offer name<input type="text" data-ofd="name" value="${esc(d.name)}" placeholder="e.g. Autumn deep clean"><span class="hint">Customers see this on their price breakdown.</span></label>
    <fieldset class="au-fs"><legend class="label">How customers get it</legend><div class="choice"><label><input type="radio" name="of-how" data-ofd="how" value="code" ${d.how==='code'?'checked':''}> They enter a code</label><label><input type="radio" name="of-how" data-ofd="how" value="auto" ${d.how==='auto'?'checked':''}> Automatically, when the booking qualifies</label></div></fieldset>
    ${d.how==='code'?`<label class="f" style="max-width:260px">Code<input type="text" data-ofd="code" value="${esc(d.code)}" placeholder="e.g. AUTUMN15" style="text-transform:uppercase"><span class="hint">4–15 letters or numbers.</span></label>`:''}
    <div class="grid3"><label class="f">Discount type<select data-ofd="type" data-ofr="1"><option value="pct" ${d.type==='pct'?'selected':''}>Percentage off</option><option value="fixed" ${d.type==='fixed'?'selected':''}>Amount off</option></select></label><label class="f">${d.type==='pct'?'Percentage (%)':'Amount (£)'}<input type="number" data-ofd="value" value="${d.type==='pct'?d.value:(d.value/100).toFixed(2)}" min="0" step="${d.type==='pct'?1:0.5}"></label><label class="f">Minimum spend (£)<input type="number" data-ofd="min" value="${(d.min/100).toFixed(2)}" min="0" step="5"></label></div>
    <fieldset class="au-fs"><legend class="label">Services</legend><div class="choice">${OF_SVCS.map(([k,l])=>`<label><input type="checkbox" data-ofd="svc" value="${k}" ${d.svcs.includes(k)?'checked':''}> ${l}</label>`).join('')}</div></fieldset>
    <fieldset class="au-fs"><legend class="label">Days <span class="muted" style="font-weight:400;text-transform:none">(leave empty for any day)</span></legend><div class="choice ob-days">${OF_DAYS.map(([k,l])=>`<label><input type="checkbox" data-ofd="day" value="${k}" ${d.days.includes(k)?'checked':''}> ${l}</label>`).join('')}</div></fieldset>
    <div class="grid3"><label class="f">Starts<input type="date" data-ofd="from" value="${d.from}"></label><label class="f">Ends <span class="muted" style="font-weight:400">(optional)</span><input type="date" data-ofd="to" value="${d.to}"></label><label class="f">Total uses <span class="muted" style="font-weight:400">(0 = no limit)</span><input type="number" data-ofd="limit" value="${d.limit}" min="0" step="1"></label></div>
    ${chk('first',d.first,'First booking only (new customers)')}${chk('perCust',d.perCust,'Once per customer')}
    <div id="of-err" class="ferr"></div></div><div id="of-prev">${ofPreview(d)}</div></div>`}
function ofSet(el){const d=S.modal.d;const k=el.dataset.ofd;
  if(k==='svc'){d.svcs=el.checked?[...new Set([...d.svcs,el.value])]:d.svcs.filter(x=>x!==el.value);return}if(k==='day'){const n=+el.value;d.days=el.checked?[...new Set([...d.days,n])]:d.days.filter(x=>x!==n);return}
  if(k==='first'||k==='perCust'){d[k]=el.checked;return}if(k==='value')d.value=d.type==='pct'?(+el.value||0):Math.round((+el.value||0)*100);else if(k==='min')d.min=Math.round((+el.value||0)*100);else if(k==='limit')d.limit=Math.max(0,parseInt(el.value)||0);
  else if(k==='code')d.code=el.value.toUpperCase().replace(/\s/g,'');else if(k==='type'){d.type=el.value;d.value=el.value==='pct'?10:1000}else d[k]=el.value}
const OF_ACT={
  ofSave:()=>{const m=S.modal;const d=m.d;
    if(d.name.trim().length<3)return setErr('of-err','Name the offer.'),false;if(d.how==='code'&&!/^[A-Z0-9]{4,15}$/.test(d.code))return setErr('of-err','Codes need 4–15 letters or numbers, no spaces.'),false;
    if(d.how==='code'&&S.offers.some(o=>o.code===d.code&&o.id!==m.id&&ofState(o)[0]!=='Ended'))return setErr('of-err','Another offer already uses that code.'),false;
    if(d.type==='pct'&&!(d.value>=1&&d.value<=50))return setErr('of-err','Percentage offers must be between 1% and 50%.'),false;if(d.type==='fixed'&&!(d.value>=100))return setErr('of-err','Set an amount of at least £1.'),false;
    if(d.type==='fixed'&&d.min&&d.value>=d.min)return setErr('of-err','The amount off must be less than the minimum spend.'),false;if(!d.svcs.length)return setErr('of-err','Choose at least one service.'),false;
    if(!d.from)return setErr('of-err','Choose a start date.'),false;if(d.to&&d.to<d.from)return setErr('of-err','The end date must be after the start.'),false;
    if(m.id){Object.assign(S.offers.find(o=>o.id===m.id),d);audit('Edited offer',d.name,ofDesc(d))}else{S.offers.unshift({...d,id:'OF-'+(S.offers.length+1)+Date.now().toString(36).slice(-2),status:'active',used:0,cost:0,rev:0,made:stamp()});audit('Created offer',d.name,`${ofDesc(d)}${d.code?' · '+d.code:' · automatic'}`)}
    S.modal=null;toast(m.id?'Offer saved.':d.how==='code'?`Offer created. Share the code ${d.code}.`:'Offer created. It applies automatically to qualifying bookings.')},
  bkPromo:()=>{const b=S.book;const c=val('bk-promo').toUpperCase();b.promo=c;b.promoTried=true},
  bkPromoClear:()=>{const b=S.book;b.promo='';b.promoTried=false}
};
const OF_MODALS={
  ofForm:m=>({title:m.id?'Edit offer':'New offer',sub:'One offer applies per booking, to the first visit.',wide:true,body:ofForm(m),foot:'<button class="btn primary" data-act="ofSave">Save offer</button>'})
};
