/* DYNAMIC PRICING MODELS (Service Delivery and Pricing Guide, UK 2026) */
const PM_MODELS={
  hourly:{name:'Hourly',how:'Hours worked × hourly rate, with a minimum booking',best:'Jobs you can’t fully scope in advance; regular cleans for new clients'},
  size:{name:'Fixed price by size',how:'One price by number of bedrooms, plus extra bathrooms',best:'Regular domestic cleans, end of tenancy, short-let turnovers'},
  fixed:{name:'Fixed price per job',how:'One set price for a defined job',best:'Oven cleans, pest control treatments, set-spec jobs'},
  unit:{name:'Per item or unit',how:'Price per room, garment, rug, window, seat or bin',best:'Carpets, dry cleaning, assembly, washroom services'},
  area:{name:'Per area',how:'Area × rate per m² or sq ft, with a minimum charge',best:'Carpets, floors, jet washing, warehouses'},
  weight:{name:'Per kg or bag',how:'Weight or bags × rate, with a minimum order',best:'Wash and fold, ironing'},
  day:{name:'Day rate',how:'A set price for a half or full working day',best:'Decorators, handymen, organisers'},
  contract:{name:'Monthly contract',how:'A monthly fee for an agreed schedule, worked out from visits and hours',best:'Offices, gyms, clinics, communal areas'},
  tier:{name:'Packages',how:'Bronze, Silver and Gold style bundles at set prices',best:'Car valeting, tutoring packs, personal training, grooming by size'},
  sub:{name:'Subscription',how:'A recurring plan with a member discount on each visit',best:'Cleaning plans, memberships, online sessions'},
  callout:{name:'Call-out + labour + parts',how:'A fixed fee to attend that covers the first part of the job, then labour, with parts at cost',best:'Plumbing, electrical, appliance repair, pest control'},
  percent:{name:'Percentage of value',how:'A share of the booking or project value',best:'Short-let management, agency work'},
  quote:{name:'Quote only',how:'The customer describes the job and you reply with a price',best:'Unusual, large or specialist jobs'}};
const PM_MODS0={weekend:0,evening:0,urgent:0,heavy:0,extreme:0,weekly:0,fortnightly:0,travelFree:0,travelKm:0,vat:false};
const p_=x=>Math.round(x*100);
const PM_PRESETS={
  cleaning:{
    'Regular clean':{pm:{model:'size',sizes:{1:p_(75),2:p_(100),3:p_(135),4:p_(170),5:p_(210)},extraBath:p_(15),mods:{weekly:10,fortnightly:5,heavy:20,extreme:40,weekend:15}},range:'£20–£28/hr, or 1-bed £65–£90, 2-bed £85–£120, 3-bed £110–£160 per visit'},
    'Deep clean':{pm:{model:'hourly',rate:p_(32),minH:3,estH:{1:4,2:5,3:7,4:9,5:11},mods:{heavy:20,extreme:40,weekend:15}},range:'£25–£40/hr'},
    'End of tenancy':{pm:{model:'size',sizes:{1:p_(200),2:p_(260),3:p_(360),4:p_(450),5:p_(560)},extraBath:p_(30),mods:{heavy:20,extreme:40,urgent:20}},range:'London agency: 1-bed £180–£230, 2-bed £220–£300, 3-bed £300–£420'},
    'After-builders':{pm:{model:'hourly',rate:p_(30),minH:4,estH:{1:6,2:8,3:11,4:14,5:17},mods:{extreme:30}},range:'From £185, typical job £325'},
    'Oven and appliance':{pm:{model:'unit',items:[{name:'Single oven',price:p_(55)},{name:'Double oven',price:p_(75)},{name:'Range cooker',price:p_(110)},{name:'Hob',price:p_(25)},{name:'Extractor',price:p_(25)},{name:'Fridge freezer',price:p_(40)}],min:p_(50)},range:'From about £45–£50 an appliance'},
    'Carpet and upholstery':{pm:{model:'unit',items:[{name:'Room (up to 15 m²)',price:p_(45)},{name:'Staircase and landing',price:p_(40)},{name:'Sofa, per seat',price:p_(25)},{name:'Mattress',price:p_(40)},{name:'Rug',price:p_(35)}],min:p_(60)},range:'£30–£60 per room, or about £2.50/m²'},
    'Window cleaning':{pm:{model:'size',sizes:{1:p_(20),2:p_(25),3:p_(30),4:p_(38),5:p_(48)},extraBath:0,mods:{weekly:0,fortnightly:0}},range:'Average £30 (£25–£50) per visit by bedrooms'},
    'Ironing and laundry':{pm:{model:'weight',per:'bag',rate:p_(15),min:p_(15)},range:'£10–£20 per bag, or £12.50/hr'},
    'Wash and fold':{pm:{model:'weight',per:'kg',rate:p_(3.25),min:p_(20)},range:'From £19.50 per 6 kg, £20 minimum order'},
    'Short-let turnover':{pm:{model:'size',sizes:{1:p_(55),2:p_(70),3:p_(90),4:p_(115),5:p_(140)},extraBath:p_(10),mods:{urgent:25}},range:'Quoted per property; linen charged separately'},
    'Decluttering and organising':{pm:{model:'day',half:p_(180),full:p_(320)},range:'£45/hr, half day (4 hrs) £180'},
    'Office and commercial':{pm:{model:'contract',rate:p_(26),minMonths:12,minHpv:2},range:'£20–£35/hr; offices £300–£2,000+ a month'},
    'Medical and clinic':{pm:{model:'fixed',price:p_(85),mods:{evening:20}},range:'GP surgery £50–£120 per visit'},
    'Gym cleaning':{pm:{model:'fixed',price:p_(60),mods:{evening:15}},range:'£35–£70 a visit for a small studio'},
    'Warehouse and industrial':{pm:{model:'area',unit:'m²',rate:p_(1.8),min:p_(250)},range:'£1–£3/m², or £15–£40/hr + VAT'},
    'Washroom services':{pm:{model:'unit',items:[{name:'Sanitary bin, per week',price:p_(3)},{name:'Nappy bin, per week',price:p_(4)},{name:'Soap and paper restock, per week',price:p_(6)}],min:p_(10)},range:'£2–£4 per bin per week'},
    'Jet washing':{pm:{model:'area',unit:'m²',rate:p_(3.5),min:p_(85)},range:'£3.50/m²; driveway wash £85'}},
  repairs:{
    'Handyman':{pm:{model:'hourly',rate:p_(45),minH:1,estH:{1:1,2:2,3:3,4:4,5:6},mods:{weekend:25,urgent:25}},range:'London £26–£85/hr, £180–£400 a day'},
    'Plumbing':{pm:{model:'callout',fee:p_(144),incl:60,rate30:p_(36),mods:{evening:50,weekend:50}},range:'First hour £114–£180, typically £144'},
    'Electrical':{pm:{model:'hourly',rate:p_(90),minH:1,estH:{1:1,2:2,3:3,4:4,5:6},mods:{evening:50}},range:'£80–£100/hr'},
    'Appliance repair':{pm:{model:'callout',fee:p_(125),incl:60,rate30:p_(30)},range:'£125 call-out including labour; repairs £100–£400'},
    'Decorating':{pm:{model:'day',half:p_(180),full:p_(320)},range:'Greater London £245–£405 a day'},
    'Furniture assembly':{pm:{model:'unit',items:[{name:'Small item (bedside, shelf)',price:p_(40)},{name:'Medium item (desk, chest)',price:p_(65)},{name:'Large item (wardrobe, bed)',price:p_(100)}],min:p_(40)},range:'£30–£60 small, £60–£120+ large'},
    'Moving help':{pm:{model:'hourly',rate:p_(60),minH:2,estH:{1:2,2:3,3:4,4:5,5:6},extraPerson:p_(25)},range:'£55–£65/hr, 2-hour minimum'},
    'Pest control':{pm:{model:'fixed',price:p_(175),note:'Includes 2 follow-up visits'},range:'£173–£259 including follow-up visits'}},
  tutoring:{
    'Maths':{pm:{model:'hourly',rate:p_(35),minH:1,estH:{1:1,2:1,3:1,4:1,5:1}},range:'Median £29/hr, middle range £21–£41'},
    'English':{pm:{model:'hourly',rate:p_(32),minH:1,estH:{1:1,2:1,3:1,4:1,5:1}},range:'Median £29/hr'},
    'Science':{pm:{model:'hourly',rate:p_(35),minH:1,estH:{1:1,2:1,3:1,4:1,5:1}},range:'Median £29/hr'},
    'Exam preparation':{pm:{model:'tier',tiers:[{name:'Single session',price:p_(40),incl:'1 hour'},{name:'5-session pack',price:p_(180),incl:'5 hours, save £20'},{name:'10-session pack',price:p_(340),incl:'10 hours, save £60'}]},range:'Higher than standard tutoring'},
    'Languages':{pm:{model:'sub',price:p_(30),member:15},range:'£21–£41/hr'},
    'Music':{pm:{model:'hourly',rate:p_(38),minH:1,estH:{1:1,2:1,3:1,4:1,5:1}},range:'£21–£41/hr'}},
  gardening:{
    'Lawn care':{pm:{model:'hourly',rate:p_(20),minH:2,estH:{1:2,2:2,3:3,4:3,5:4},mods:{weekly:10,fortnightly:5}},range:'£14–£25/hr, average £20'},
    'Hedges and pruning':{pm:{model:'hourly',rate:p_(22),minH:2,estH:{1:2,2:3,3:4,4:5,5:6}},range:'£14–£25/hr'},
    'Garden clearance':{pm:{model:'day',half:p_(140),full:p_(260)},range:'Waste removal extra'}},
  pets:{
    'Dog walking':{pm:{model:'tier',tiers:[{name:'Group walk, 60 min',price:p_(14),incl:'Up to 4 dogs'},{name:'Solo walk, 30 min',price:p_(16),incl:'Just your dog'},{name:'Solo walk, 60 min',price:p_(24),incl:'Just your dog'}]},range:'£16–£25/hr'},
    'Pet sitting':{pm:{model:'unit',items:[{name:'Dog, per day',price:p_(50)},{name:'Cat, per day',price:p_(40)},{name:'Extra pet, per day',price:p_(10)}],min:p_(40)},range:'Dog £50/day, cat £40/day'},
    'Grooming':{pm:{model:'tier',tiers:[{name:'Small dog',price:p_(45),incl:'Bath, cut, nails'},{name:'Medium dog',price:p_(58),incl:'Bath, cut, nails'},{name:'Large dog',price:p_(76),incl:'Bath, cut, nails'}]},range:'£42 (extra small) to £76 (extra large)'}}};
function pmClone(x){return JSON.parse(JSON.stringify(x))}
function pmPreset(cat,type){const P=PM_PRESETS[cat]||{};const p=P[type]||Object.values(P)[0];const pm=pmClone(p?p.pm:{model:'hourly',rate:p_(25),minH:1});pm.mods={...PM_MODS0,...(pm.mods||{})};return pm}
function pmDefaults(model,cat,type){const fromType=pmPreset(cat,type);if(fromType.model===model)return fromType;const mods=fromType.mods;
  const D={hourly:{rate:p_(25),minH:2,estH:{1:2,2:3,3:4,4:5,5:6}},size:{sizes:{1:p_(70),2:p_(95),3:p_(125),4:p_(160),5:p_(200)},extraBath:p_(15)},fixed:{price:p_(80)},unit:{items:[{name:'Item',price:p_(30)}],min:p_(30)},area:{unit:'m²',rate:p_(2.5),min:p_(60)},weight:{per:'kg',rate:p_(3),min:p_(20)},
    day:{half:p_(160),full:p_(300)},contract:{rate:p_(25),minMonths:12,minHpv:2},tier:{tiers:[{name:'Basic',price:p_(50),incl:''},{name:'Standard',price:p_(85),incl:''},{name:'Premium',price:p_(150),incl:''}]},sub:{price:p_(30),member:10},callout:{fee:p_(95),incl:60,rate30:p_(30)},percent:{pct:18,minFee:p_(50)},quote:{}}[model];
  return {model,...pmClone(D),mods:{...mods}}}
const pmM=v=>money(Math.round(v));
const pmP=v=>'£'+(v/100).toFixed(2).replace(/\.00$/,'');
function pmLabel(pm){if(!pm)return '';const m=pm.model;switch(m){
  case 'hourly':return `${pmP(pm.rate)} an hour${pm.minH>1?`, ${pm.minH}-hour minimum`:''}`;
  case 'size':return `From ${pmP(pm.sizes[1])} (1 bedroom) to ${pmP(pm.sizes[5])} (5 bedrooms)`;
  case 'fixed':return `${pmP(pm.price)} per job${pm.note?` · ${pm.note}`:''}`;
  case 'unit':return `${pm.items.slice(0,2).map(i=>`${i.name} ${pmP(i.price)}`).join(' · ')}${pm.items.length>2?' and more':''}`;
  case 'area':return `${pmP(pm.rate)} per ${pm.unit}, ${pmP(pm.min)} minimum`;
  case 'weight':return `${pmP(pm.rate)} per ${pm.per}, ${pmP(pm.min)} minimum order`;
  case 'day':return `Half day ${pmP(pm.half)} · full day ${pmP(pm.full)}`;
  case 'contract':return `From ${pmP(pmFrom(pm))} a month · ${pmP(pm.rate)} per cleaner hour`;
  case 'tier':return pm.tiers.map(t=>`${t.name} ${pmP(t.price)}`).join(' · ');
  case 'sub':return `${pmP(pm.price)} a session, or ${pmP(pm.price*(1-pm.member/100))} as a member`;
  case 'callout':return `${pmP(pm.fee)} call-out including the first ${pm.incl} min, then ${pmP(pm.rate30)} per 30 min + parts`;
  case 'percent':return `${pm.pct}% of booking value${pm.minFee?`, ${pmP(pm.minFee)} minimum`:''}`;
  default:return 'Quote after details'}}
function pmFrom(pm){if(!pm)return 0;const m=pm.model;return m==='hourly'?pm.rate*pm.minH:m==='size'?pm.sizes[1]:m==='fixed'?pm.price:m==='unit'?Math.max(pm.min||0,Math.min(...pm.items.map(i=>i.price))):m==='area'?pm.min:m==='weight'?pm.min:m==='day'?pm.half:m==='contract'?Math.round(pm.rate*(pm.minHpv||1)*52/12/100)*100:m==='tier'?Math.min(...pm.tiers.map(t=>t.price)):m==='sub'?Math.round(pm.price*(1-pm.member/100)):m==='callout'?pm.fee:m==='percent'?(pm.minFee||0):0}
function pmBooking(pm){return !pm||['quote','contract','percent'].includes(pm.model)?'quote':'instant'}
function pmValid(pm){const m=pm.model;const pos=v=>v>0;
  if(m==='hourly'&&(!pos(pm.rate)||!(pm.minH>=0.5)))return 'Set an hourly rate and minimum.';if(m==='size'&&[1,2,3,4,5].some(i=>!pos(pm.sizes[i])))return 'Set a price for every size.';
  if(m==='size'&&[2,3,4,5].some(i=>pm.sizes[i]<pm.sizes[i-1]))return 'Bigger homes should cost the same or more.';if(m==='fixed'&&!pos(pm.price))return 'Set the job price.';
  if(m==='unit'&&(!pm.items.length||pm.items.some(i=>!i.name||!pos(i.price))))return 'Name and price every item.';if(m==='area'&&!pos(pm.rate))return 'Set a rate per area.';if(m==='weight'&&!pos(pm.rate))return 'Set a rate.';
  if(m==='day'&&(!pos(pm.half)||!pos(pm.full)||pm.full<pm.half))return 'Set half and full day prices; a full day should cost more.';if(m==='contract'&&!pos(pm.rate))return 'Set a rate per cleaner hour.';
  if(m==='tier'&&(!pm.tiers.length||pm.tiers.some(t=>!t.name||!pos(t.price))))return 'Name and price every package.';if(m==='sub'&&(!pos(pm.price)||pm.member<0||pm.member>50))return 'Set a session price and a member discount of 0–50%.';
  if(m==='callout'&&(!pos(pm.fee)||!pos(pm.rate30)))return 'Set the call-out fee and labour rate.';if(m==='percent'&&!(pm.pct>0&&pm.pct<=50))return 'Set a percentage between 1 and 50.';return ''}
function pmQuote(pm,i,ctx={}){const m=pm.model;const L=[];let base=0;const md=pm.mods||PM_MODS0;const size=+i.size||1;let note='';
  if(m==='hourly'){const h=Math.max(pm.minH,+i.hours||((pm.estH||{})[size])||pm.minH);base=pm.rate*h;L.push([`${h} hour${h===1?'':'s'} × ${pmP(pm.rate)}`,base]);if(h===pm.minH&&(+i.hours||0)<pm.minH&&i.hours)note=`Minimum booking is ${pm.minH} hours.`;
    if(pm.extraPerson&&+i.persons>1){const x=pm.extraPerson*h*(+i.persons-1);L.push([`${+i.persons-1} extra person${+i.persons>2?'s':''} × ${h} h × ${pmP(pm.extraPerson)}`,x]);base+=x}}
  else if(m==='size'){base=pm.sizes[Math.min(5,size)];L.push([`${size} bedroom${size>1?'s':''}`,base]);const xb=Math.max(0,(+i.baths||1)-1);if(xb&&pm.extraBath){L.push([`${xb} extra bathroom${xb>1?'s':''}`,xb*pm.extraBath]);base+=xb*pm.extraBath}}
  else if(m==='fixed'){base=pm.price;L.push(['Job price',base])}
  else if(m==='unit'){pm.items.forEach((it,j)=>{const q=+((i.qty||{})[j]||0);if(q>0){L.push([`${q} × ${it.name}`,q*it.price]);base+=q*it.price}});if(base<pm.min&&base>0){L.push(['Minimum order top-up',pm.min-base]);base=pm.min}}
  else if(m==='area'){const a=+i.area||0;base=Math.round(a*pm.rate);L.push([`${a} ${pm.unit} × ${pmP(pm.rate)}`,base]);if(base<pm.min){L.push(['Minimum charge top-up',pm.min-base]);base=pm.min}}
  else if(m==='weight'){const w=+i.weight||0;base=Math.round(w*pm.rate);L.push([`${w} ${pm.per}${w===1||pm.per==='kg'?'':'s'} × ${pmP(pm.rate)}`,base]);if(base<pm.min){L.push(['Minimum order top-up',pm.min-base]);base=pm.min}}
  else if(m==='day'){const n=+i.days||1;const full=i.dayType!=='half';base=(full?pm.full:pm.half)*n;L.push([`${n} × ${full?'full day':'half day'}`,base])}
  else if(m==='contract'){const v=+i.visits||1,h=Math.max(pm.minHpv||1,+i.hpv||pm.minHpv||1);base=Math.round(pm.rate*h*v*52/12);L.push([`${v} visit${v>1?'s':''} a week × ${h} h × ${pmP(pm.rate)} × 52 ÷ 12`,base]);note=`Monthly fee. ${pm.minMonths||12}-month agreement, confirmed after a site survey.`}
  else if(m==='tier'){const t=pm.tiers[+i.tier||0];base=t.price;L.push([t.name+(t.incl?` (${t.incl})`:''),base])}
  else if(m==='sub'){base=pm.price;L.push(['Session',base]);if(i.member){const d=Math.round(base*pm.member/100);L.push([`Member discount ${pm.member}%`,-d]);base-=d}}
  else if(m==='callout'){const mins=Math.max(pm.incl,+i.mins||pm.incl);base=pm.fee;L.push([`Call-out, includes the first ${pm.incl} min`,pm.fee]);const extra=Math.ceil((mins-pm.incl)/30);if(extra>0){L.push([`${extra} × 30 min extra labour`,extra*pm.rate30]);base+=extra*pm.rate30}note='Parts are charged at cost and agreed with you before fitting.'}
  else if(m==='percent'){const v=p_(+i.value||0);base=Math.max(pm.minFee||0,Math.round(v*pm.pct/100));L.push([`${pm.pct}% of ${pmP(v)}`,base])}
  /* adjustments */
  const adj=[];const pc=(label,pct)=>{if(pct){const x=Math.round(base*pct/100);adj.push([label,x])}};
  if(['hourly','size','fixed','day','unit','area'].includes(m)){if(i.condition==='heavy')pc(`Heavily soiled +${md.heavy}%`,md.heavy);if(i.condition==='extreme')pc(`Very heavily soiled +${md.extreme}%`,md.extreme)}
  if(ctx.date){const dow=dt(ctx.date).getDay();if((dow===0||dow===6)&&md.weekend)pc(`Weekend +${md.weekend}%`,md.weekend);if(ctx.time&&+ctx.time.slice(0,2)>=17&&md.evening)pc(`Evening +${md.evening}%`,md.evening);if(ctx.date<=addDays(today(),1)&&md.urgent)pc(`Within 24 hours +${md.urgent}%`,md.urgent)}
  if(i.freq==='weekly'&&md.weekly)pc(`Weekly plan −${md.weekly}%`,-md.weekly);if(i.freq==='fortnightly'&&md.fortnightly)pc(`Fortnightly plan −${md.fortnightly}%`,-md.fortnightly);
  if(ctx.km!=null&&md.travelKm&&ctx.km>md.travelFree){const x=Math.round((ctx.km-md.travelFree)*md.travelKm);adj.push([`Travel, ${(ctx.km-md.travelFree).toFixed(1)} km beyond ${md.travelFree} km`,x])}
  (ctx.addons||[]).forEach(a=>adj.push([a.name,a.price]));
  let net=base+adj.reduce((a,x)=>a+x[1],0);const vat=md.vat?Math.round(net*0.2):0;
  return {lines:L,adj,net,vat,total:net+vat,note}}
function pmInputs(pm,l){const m=pm.model;const sel=(k,lab,opts,v)=>`<label class="f">${lab}<select data-pmi="${k}">${opts.map(([a,b])=>`<option value="${a}" ${String(v)===String(a)?'selected':''}>${b}</option>`).join('')}</select></label>`;
  const num=(k,lab,v,o={})=>`<label class="f">${lab}<input type="number" data-pmi="${k}" value="${v}" min="${o.min||0}" step="${o.step||1}"></label>`;
  const sizes=[1,2,3,4,5].map(n=>[n,`${n} bedroom${n>1?'s':''}${n===5?' or more':''}`]);const cond=['hourly','size','fixed','day','unit','area'].includes(m)&&((pm.mods||{}).heavy||(pm.mods||{}).extreme)?sel('condition','Condition',[['normal','Normal'],['heavy','Heavily soiled'],['extreme','Very heavily soiled']],'normal'):'';
  const freq=(pm.mods||{}).weekly||(pm.mods||{}).fortnightly?sel('freq','How often',[['once','One-off'],...((pm.mods||{}).fortnightly?[['fortnightly',`Fortnightly (save ${pm.mods.fortnightly}%)`]]:[]),...((pm.mods||{}).weekly?[['weekly',`Weekly (save ${pm.mods.weekly}%)`]]:[])],'once'):'';
  let f='';
  if(m==='hourly')f=(pm.estH&&l.cat!=='tutoring'?sel('size','Size of the job',sizes,2):'')+num('hours',`Hours (minimum ${pm.minH})`,'',{min:pm.minH,step:0.5}).replace('value=""',`value="" placeholder="We’ll estimate"`)+(pm.extraPerson?sel('persons','People needed',[[1,'1'],[2,'2'],[3,'3']],1):'');
  if(m==='size')f=sel('size','Bedrooms',sizes,2)+sel('baths','Bathrooms',[[1,'1'],[2,'2'],[3,'3'],[4,'4']],1);
  if(m==='unit')f=`<div class="pm-items">${pm.items.map((it,j)=>`<label class="row small pm-item"><span style="flex:1">${esc(it.name)} <span class="muted">${pmP(it.price)}</span></span><input type="number" min="0" step="1" value="${j===0?1:0}" data-pmi="qty.${j}" aria-label="How many: ${esc(it.name)}" style="max-width:80px"></label>`).join('')}</div>`;
  if(m==='area')f=num('area',`Area (${pm.unit})`,pm.unit==='m²'?40:400,{min:1});
  if(m==='weight')f=num('weight',pm.per==='kg'?'Weight (kg)':'Number of bags',pm.per==='kg'?6:1,{min:1,step:pm.per==='kg'?0.5:1});
  if(m==='day')f=sel('dayType','Length',[['half','Half day (4 hours)'],['full','Full day (8 hours)']],'full')+num('days','Number of days',1,{min:1});
  if(m==='contract')f=sel('visits','Visits a week',[[1,'1'],[2,'2'],[3,'3'],[5,'5 (weekdays)']],2)+num('hpv','Hours a visit',pm.minHpv||2,{min:pm.minHpv||1,step:0.5});
  if(m==='tier')f=`<fieldset class="au-fs"><legend class="label">Choose a package</legend><div class="pm-tiers">${pm.tiers.map((t,j)=>`<label class="pm-tier"><input type="radio" name="pm-tier" data-pmi="tier" value="${j}" ${j===0?'checked':''}><b>${esc(t.name)}</b><span class="mono">${pmP(t.price)}</span>${t.incl?`<span class="small muted">${esc(t.incl)}</span>`:''}</label>`).join('')}</div></fieldset>`;
  if(m==='sub')f=`<label class="row small"><input type="checkbox" data-pmi="member"> Join as a member and save ${pm.member}% on every session</label>`;
  if(m==='callout')f=sel('mins','How long you think it’ll take',[[pm.incl,`Up to ${pm.incl} minutes`],[pm.incl+30,`About ${(pm.incl+30)/60} hours`],[pm.incl+60,`About ${(pm.incl+60)/60} hours`],[pm.incl+120,`About ${(pm.incl+120)/60} hours`]],pm.incl);
  if(m==='percent')f=num('value','Booking value (£)',500,{min:0});
  return `<div class="pm-in">${f}${cond}${freq}</div>`}
function pmBreak(q){return `<table class="t pm-break"><tbody>${q.lines.map(([l,a])=>`<tr><td>${esc(l)}</td><td class="num mono">${a<0?'−'+pmM(-a):pmM(a)}</td></tr>`).join('')}${q.adj.map(([l,a])=>`<tr><td>${esc(l)}</td><td class="num mono">${a<0?'−'+pmM(-a):'+'+pmM(a)}</td></tr>`).join('')}${q.vat?`<tr><td>VAT 20%</td><td class="num mono">${pmM(q.vat)}</td></tr>`:''}<tr class="ad-tot"><td><b>Total</b></td><td class="num mono"><b>${pmM(q.total)}</b></td></tr></tbody></table>${q.note?`<p class="small muted">${esc(q.note)}</p>`:''}`}
function pmReadInputs(){const i={qty:{}};document.querySelectorAll('[data-pmi]').forEach(el=>{const k=el.dataset.pmi;if(el.type==='radio'){if(el.checked)i[k]=el.value;return}const v=el.type==='checkbox'?el.checked:el.value;if(k.startsWith('qty.'))i.qty[k.slice(4)]=v;else i[k]=v});return i}
function pmCtx(l){const D=S.disc;const g=n=>{const e=document.querySelector(`[data-mk="${n}"]`);return e?e.value:''};const P=provOf(l);let km=null;if(l.mode!=='online'&&D&&D.loc&&P.base&&DXY[P.base.d])km=dist2(DXY[P.base.d],D.loc);
  return {date:g('_date'),time:g('_time'),km,addons:[...document.querySelectorAll('.mk-addon:checked')].map(c=>l.addons[+c.dataset.i])}}
function pmLive(){const m=S.modal;if(!m||m.type!=='mktBook')return;const l=S.mkt.listings.find(x=>x.id===m.id);if(!l||!l.pm)return;const box=document.getElementById('pm-live');if(box)box.innerHTML=pmBreak(pmQuote(l.pm,pmReadInputs(),pmCtx(l)))}
