/* ANALYTICS */
const MON_FULL=['January','February','March','April','May','June','July','August','September','October','November','December'];
const AN_SVC={regular:'Regular cleaning',deep:'Deep cleaning',eot:'End of tenancy',office:'Commercial contracts'};
const AN_SVC_ORDER=['office','regular','deep','eot'];
const AN_RPH={regular:2700,deep:3200,eot:3300,office:3060};
const AN_JOB={regular:6900,deep:16000,eot:23000,office:9500};
const AN_HIST=[
  ['2026-05',{regular:59000,deep:32000,eot:23000,office:215000},34,1,1,4.6,7,94,1,3,0],
  ['2026-06',{regular:61500,deep:16000,eot:46000,office:206000},35,0,1,4.7,6,96,0,3,0],
  ['2026-07',{regular:57000,deep:48000,eot:23000,office:222000},37,2,2,4.4,8,91,2,4,4500],
  ['2026-08',{regular:52000,deep:16000,eot:0,office:198000},30,1,1,4.5,5,93,3,1,0],
  ['2026-09',{regular:62000,deep:32000,eot:23000,office:214000},35,1,2,4.5,7,92,1,2,2000]];
const AN_AVG_RATE=1295;
const anPct=(a,b)=>b?Math.round((a-b)/Math.abs(b)*100):0;
const kpounds=p=>{const v=p/100;return Math.abs(v)>=1000?'£'+(v/1000).toFixed(v>=10000?0:1)+'k':'£'+Math.round(v)};
const monLabel=m=>MON[+m.slice(5)-1];
function anCosts(hours,pay,dom,domVisits,refunds){const C=S.pricing.costs;
  const oncost=Math.round(pay*C.oncost/100),overhead=Math.round(hours*ohPerHour(S.pricing)),fees=Math.round(dom*FEE_PCT/100)+domVisits*FEE_FIXED;
  return {oncost,overhead,fees,refunds}}
function anHistMonth(r){const [m,svc,visits,disputes,partial,rating,ratingN,onTime,cancels,newC,refunds]=r;
  const rev=Object.values(svc).reduce((x,y)=>x+y,0);const dom=rev-svc.office;
  const svcH={};Object.keys(svc).forEach(k=>svcH[k]=svc[k]/AN_RPH[k]);const hours=Object.values(svcH).reduce((x,y)=>x+y,0);
  const pay=Math.round(hours*AN_AVG_RATE);const domVisits=['regular','deep','eot'].reduce((x,k)=>x+Math.round(svc[k]/AN_JOB[k]),0);
  const c=anCosts(hours,pay,dom,domVisits,refunds);const net=rev-refunds-c.fees-pay-c.oncost-c.overhead;
  return {m,label:monLabel(m),kind:'history',svc,svcH,rev,dom,com:svc.office,proj:0,projSvc:{},hours,pay,...c,net,margin:rev?net/rev*100:0,visits,disputes,partial,rating,ratingN,onTime,cancels,newC,recurring:svc.office+svc.regular}}
function visitHours(v,planned){if(planned)return v.crew*(mins(v.end)-mins(v.start))/60;
  const h=allocsFor(v.id).filter(a=>a.status==='published'&&a.response!=='declined').reduce((x,a)=>x+(mins(a.end)-mins(a.start))/60,0);return h||v.crew*(mins(v.end)-mins(v.start))/60}
function onTimeOf(v){if(!v.checkin)return null;const t=(v.checkin.capture.split(', ')[1]||'').trim();if(!t)return null;return mins(t)<=mins(v.start)+S.settings.tolerance}
function anLive(){
  const F=fin('month');const t=today();const m=t.slice(0,7);
  const svc={regular:0,deep:0,eot:0,office:0},svcH={regular:0,deep:0,eot:0,office:0},projSvc={regular:0,deep:0,eot:0,office:0},projH={regular:0,deep:0,eot:0,office:0};
  F.rows.forEach(r=>{const k=r.v.svc in svc?r.v.svc:'regular';svc[k]+=r.val;svcH[k]+=visitHours(r.v)});
  const future=Object.values(S.visits).filter(v=>v.date.slice(0,7)===m&&['scheduled','in_progress','submitted'].includes(v.state)&&!v.correctiveOf);
  future.forEach(v=>{const k=v.svc in svc?v.svc:'regular';projSvc[k]+=visitValue(v);projH[k]+=visitHours(v,true)});
  const rev=F.earned,dom=rev-svc.office;const proj=Object.values(projSvc).reduce((x,y)=>x+y,0);
  const monthVisits=Object.values(S.visits).filter(v=>v.date.slice(0,7)===m&&v.date<=t);
  const delivered=F.rows.map(r=>r.v);const ids=new Set(delivered.map(v=>v.id));
  const disputes=S.cases.filter(c=>{const v=V_(c.visitId);return v&&v.date.slice(0,7)===m}).length;
  const partial=delivered.filter(v=>v.state==='partial').length;
  const fb=Object.entries(S.feedback).filter(([id])=>S.visits[id]&&S.visits[id].date.slice(0,7)===m).map(x=>x[1].score);
  const ot=delivered.map(onTimeOf).filter(x=>x!==null);
  const net=F.net;
  return {m,label:monLabel(m),kind:'live',F,svc,svcH,projSvc,projH,rev,dom,com:svc.office,proj,hours:F.hours,pay:F.pay,oncost:F.oncost,overhead:F.overhead,fees:F.fees,refunds:F.refundTotal+F.creditTotal,net,margin:rev?net/rev*100:0,
    visits:delivered.length,disputes,partial,rating:fb.length?fb.reduce((x,y)=>x+y,0)/fb.length:null,ratingN:fb.length,onTime:ot.length?Math.round(ot.filter(Boolean).length/ot.length*100):null,
    cancels:monthVisits.filter(v=>v.state==='cancelled').length,newC:Object.values(S.customers).filter(c=>(c.since||'').slice(0,7)===m).length,recurring:svc.office+svc.regular,ids}
}
function anMonths(){return AN_HIST.map(anHistMonth).concat([anLive()])}
function anClients(L){const P=S.pricing;const c=costPerHour(P);const g={};
  L.F.rows.forEach(r=>{const cid=custOf(r.v);const G=g[cid]||(g[cid]={rev:0,h:0,n:0});G.rev+=r.val;G.h+=visitHours(r.v);G.n++});
  const tot=Object.values(g).reduce((x,G)=>x+G.rev,0);
  return Object.entries(g).map(([cid,G])=>{const st=clientStats(cid);const open=st.disputes.filter(d=>!['resolved','closed'].includes(d.status)).length;
    const upc=st.upcoming.filter(v=>v.date<=addDays(today(),28)).reduce((x,v)=>x+visitValue(v),0);
    return {cid,name:S.customers[cid].name,type:S.customers[cid].type,...G,share:tot?G.rev/tot*100:0,rph:G.h?G.rev/G.h:0,m:G.rev?(G.rev-G.h*c)/G.rev*100:0,disputes:st.disputes.length,open,avg:st.avg,upc}}).sort((a,b)=>b.rev-a.rev)}
function anStaffAvail(sid,from,to,date){const s=S.staff[sid];if(!s.avail)return 0;const d=dt(date).getDay();if(!s.avail.days.includes(d))return 0;
  return Math.max(0,Math.min(mins(to),mins(s.avail.to))-Math.max(mins(from),mins(s.avail.from)))/60}
function anTeam(L){const [a]=periodRange('month');const t=today();const end=addDays(t,28);
  return Object.values(S.staff).map(s=>{const mine=Object.values(S.visits).filter(v=>v.date>=a&&v.date<=t&&L.ids.has(v.id)&&allocsFor(v.id).some(x=>x.staffId===s.id&&x.status==='published'&&x.response!=='declined'));
    const hrs=(L.F.labour[s.id]||{}).hours||0;let avail=0;for(let d=a;d<=t;d=addDays(d,1))avail+=anStaffAvail(s.id,'00:00','23:59',d);
    const ot=mine.map(onTimeOf).filter(x=>x!==null);const issues=mine.filter(v=>v.state==='partial'||S.cases.some(c=>c.visitId===v.id)).length;
    const fb=mine.map(v=>S.feedback[v.id]).filter(Boolean);
    const ahead=S.allocs.filter(x=>x.staffId===s.id&&!['cancelled','replaced'].includes(x.status)&&x.response!=='declined'&&V_(x.visitId).date>t&&V_(x.visitId).date<=end).reduce((x,al)=>x+(mins(al.end)-mins(al.start))/60,0);
    return {s,visits:mine.length,hrs,avail,util:avail?hrs/avail*100:0,onTime:ot.length?Math.round(ot.filter(Boolean).length/ot.length*100):null,issues,avg:fb.length?fb.reduce((x,f)=>x+f.score,0)/fb.length:null,ahead,ready:readiness(s)}}).sort((x,y)=>y.hrs-x.hrs)}
const AN_BANDS=[['07:00','10:00','Early','07–10'],['10:00','13:00','Late morning','10–13'],['13:00','17:00','Afternoon','13–17'],['17:00','21:00','Evening','17–21']];
const AN_DAYS=[1,2,3,4,5,6,0];
function anCapacity(){const w0=weekOf(today());const weeks=[0,1,2,3].map(i=>addDays(w0,i*7));const cells={};
  AN_DAYS.forEach(d=>AN_BANDS.forEach((b,bi)=>{let booked=0,avail=0;
    weeks.forEach(w=>{const date=addDays(w,(d+6)%7);
      Object.keys(S.staff).forEach(sid=>{if(readiness(S.staff[sid])[1]!=='bad')avail+=anStaffAvail(sid,b[0],b[1],date)});
      Object.values(S.visits).filter(v=>v.date===date&&v.state!=='cancelled').forEach(v=>{const o=Math.max(0,Math.min(mins(v.end),mins(b[1]))-Math.max(mins(v.start),mins(b[0])))/60;booked+=o*v.crew})});
    cells[d+'|'+bi]={booked:booked/4,avail:avail/4,util:avail?booked/avail*100:null}}));
  const spareDay=AN_DAYS.filter(d=>d>=1&&d<=5).reduce((x,d)=>x+[0,1,2].reduce((y,bi)=>y+Math.max(0,cells[d+'|'+bi].avail-cells[d+'|'+bi].booked),0),0);
  return {cells,weeks,spareDay}}
function anForecast(){const w0=weekOf(today());return [0,1,2,3].map(i=>{const w=addDays(w0,i*7);const vs=Object.values(S.visits).filter(v=>weekOf(v.date)===w&&v.state!=='cancelled'&&!v.correctiveOf);
  const rest=vs.filter(v=>!['completed','partial'].includes(v.state));
  return {w,ps:periodState(w),n:vs.length,rev:vs.reduce((x,v)=>x+visitValue(v),0),done:vs.filter(v=>['completed','partial'].includes(v.state)).reduce((x,v)=>x+visitValue(v),0),hours:vs.reduce((x,v)=>x+visitHours(v,true),0),
    slots:rest.reduce((x,v)=>x+v.crew,0),gaps:rest.reduce((x,v)=>x+Math.max(0,v.crew-plannedCount(v)),0),unconf:rest.reduce((x,v)=>x+Math.max(0,plannedCount(v)-confirmedCount(v)),0)}})}
function anInsights(M,L,CL,CAP,FC){const P=S.pricing;const out=[];const tgt=targetRate(P),cph=costPerHour(P);const pm=P.costs.margin;
  const regQ=quote(P,{svc:'regular',size:'2',baths:1,addons:{},freq:'weekly',products:'cleaner'});
  if(P.models.regular==='hourly'&&P.hourly.regular<tgt){const per=Math.round((tgt-P.hourly.regular)*regQ.labour*52/12);
    out.push({tone:'opp',title:`Your regular hourly rate is below your target`,body:`New regular bookings are priced at ${money(P.hourly.regular)}/h, but you need ${money(tgt)}/h for a ${pm}% margin (it costs you ${money(cph)} per cleaner-hour). A typical new weekly 2-bed client would earn about ${Math.round(regQ.margin)}% margin. Your existing regular clients pay around ${money(Math.round(L.svcH.regular?L.svc.regular/L.svcH.regular:0))}/h, so the market is already paying more.`,impact:per,impactL:'more per new weekly client a month at target',acts:[['prOpen','','Review pricing'],['anSim','price','Model a rate change']]})}
  CL.filter(c=>c.m<pm).forEach(c=>{const gap=Math.round(c.rev*(pm-c.m)/100);
    out.push({tone:'risk',title:`${c.name} is below your margin target`,body:`${Math.round(c.m)}% estimated margin this month (${money(Math.round(c.rph))} per cleaner-hour against ${money(tgt)}). ${c.open?`It also has ${c.open} open dispute${c.open>1?'s':''}. `:''}Agreed prices stay fixed, so plan a price review at renewal or reduce the time on site.`,impact:Math.round(gap/Math.max(1,(dt(today())-dt(periodRange('month')[0]))/86400000+1)*365),impactL:'a year to reach target',acts:[['anGo','clients','View client',c.cid],['prOpen','','Pricing setup']]})});
  const top=CL[0];if(top&&top.share>=35){const lossNet=Math.round(top.rev-top.h*cph);
    out.push({tone:'risk',title:`${Math.round(top.share)}% of your revenue comes from one client`,body:`${top.name} brought in ${pounds(top.rev)} of ${pounds(L.rev)} this month. Losing it would remove about ${pounds(lossNet)} of contribution and leave ${CL[0].type==='commercial'?'your evening crew':'your team'} under-used. Aim to keep any single client under 30%: win another contract or more regular homes, and agree a longer notice period at renewal.`,impact:top.rev,impactL:'revenue this month from one client',acts:[['anGo','clients','View client',top.cid]]})}
  const spare=CAP.spareDay;if(spare>=6){const perClient=regQ.labour;const n=Math.max(1,Math.min(5,Math.floor(spare*0.1/perClient)));const rev=Math.round(n*regQ.net*52/12);
    out.push({tone:'opp',title:`About ${Math.round(spare)} spare weekday daytime cleaner-hours a week`,body:`Your team offers availability Monday to Friday, 07:00–17:00, that no visit uses (offered hours, not contracted ones). Even ${n} new weekly 2-bed client${n>1?'s':''} would bring in roughly ${pounds(rev)} a month at your current rates. Daytime domestic and end of tenancy work fits these gaps; evenings are already busy with contracts.`,impact:rev,impactL:'potential revenue a month',acts:[['anSim','add',`Model ${n} new client${n>1?'s':''}`,String(n)],['anScroll','an-cap','See capacity']]})}
  const missed=[];Object.values(S.visits).filter(v=>v.date>=addDays(today(),-30)&&v.date<=today()).forEach(v=>v.tasks.filter(t=>t.result==='not_done').forEach(t=>missed.push({v,t})));
  if(missed.length){const byName={};missed.forEach(x=>(byName[x.t.name]=byName[x.t.name]||[]).push(x));const [name,list]=Object.entries(byName).sort((a,b)=>b[1].length-a[1].length)[0];
    const disp=S.cases.filter(c=>list.some(x=>x.v.id===c.visitId));const refundRisk=list.reduce((x,y)=>x+(y.v.price||0),0);
    out.push({tone:'risk',title:`"${name}" is the task most often left undone`,body:`${list.length} time${list.length>1?'s':''} in the last 30 days. Reason given: "${esc(list[0].t.reason||'not recorded')}". ${disp.length?`It led to dispute ${disp.map(c=>c.id).join(', ')}. `:''}Allow more time on bookings with this add-on, or price ovens by type so the slot matches the work.`,impact:0,acts:[['visitOpen','','Open visit',list[0].v.id]].concat(disp.length?[['anGo','cases','Open dispute',disp[0].id]]:[])})}
  const gaps=FC.reduce((x,w)=>x+w.gaps,0),unc=FC.reduce((x,w)=>x+w.unconf,0);const blocked=Object.values(S.staff).filter(s=>readiness(s)[1]==='bad');
  if(gaps||blocked.length){out.push({tone:'risk',title:`${gaps} crew slot${gaps===1?'':'s'} unfilled in the next 4 weeks`,body:`${gaps?`Booked work worth ${pounds(FC.reduce((x,w)=>x+w.rev-w.done,0))} is scheduled, and ${gaps} slot${gaps===1?' has':'s have'} no cleaner yet${unc?`; ${unc} more ${unc===1?'is':'are'} not yet confirmed`:''}. `:''}${blocked.length?`${blocked.map(s=>s.name).join(', ')} can't be allocated until ${blocked.length>1?'their checks are':'a check is'} renewed, which shrinks your bench. `:''}Fix gaps before the notice deadline to avoid short-notice supplements.`,impact:0,acts:[['biz','rota','Open rota']].concat(blocked.length?[['anGo','employees','View employee',blocked[0].id]]:[])})}
  const out_=S.invoices.filter(i=>['issued','partially_paid'].includes(i.status));const owed=out_.reduce((x,i)=>x+Math.max(0,invTotals(i).bal),0);const od=out_.filter(invOverdue);
  if(od.length||L.F.toInvoice>0){out.push({tone:od.length?'risk':'watch',title:od.length?`${od.length} invoice${od.length>1?'s are':' is'} overdue`:`${pounds(L.F.toInvoice)} of delivered work isn't invoiced yet`,body:`${pounds(owed)} is owed on issued invoices${od.length?`, ${pounds(od.reduce((x,i)=>x+invTotals(i).bal,0))} of it overdue`:''}. ${pounds(L.F.toInvoice)} of delivered work this month hasn't been invoiced. Wages are paid before most contract invoices are, so invoice promptly to protect cash flow.`,impact:owed+L.F.toInvoice,impactL:'cash to collect',acts:[['biz','invoices','Open invoices']]})}
  const H=M.filter(x=>x.kind==='history');let drop=null;for(let i=1;i<H.length;i++){const d=anPct(H[i].rev,H[i-1].rev);if(d<=-10&&(!drop||d<drop.d))drop={d,m:H[i],p:H[i-1]}}
  if(drop)out.push({tone:'watch',title:`Revenue fell ${Math.abs(drop.d)}% in ${MON_FULL[+drop.m.m.slice(5)-1]}`,body:`${pounds(drop.m.rev)} against ${pounds(drop.p.rev)} in ${MON_FULL[+drop.p.m.slice(5)-1]}, with ${drop.m.cancels} cancellations and no end of tenancy work. Expect the same dip next summer: plan staff holidays for that month and promote end of tenancy cleans in late summer, when tenancies change.`,impact:drop.p.rev-drop.m.rev,impactL:'revenue lost that month',acts:[['anScroll','an-rev','See trend']]});
  const [a]=periodRange('month');const days=Math.max(1,(dt(today())-dt(a))/86400000+1);const annual=Math.round(L.rev/days*365);
  if(annual>=VAT_THRESHOLD*0.6)out.push({tone:'watch',title:'You are approaching the VAT threshold',body:`Projected 12-month turnover is ${pounds(annual)}, ${Math.round(annual/VAT_THRESHOLD*100)}% of £90,000. Decide whether to raise prices by 20% or absorb VAT once registered.`,impact:0,acts:[['biz','finance','Open finance']]});
  const order={risk:0,opp:1,watch:2};return out.sort((x,y)=>order[x.tone]-order[y.tone]||y.impact-x.impact)}
function niceMax(v){if(v<=0)return 1;const e=Math.pow(10,Math.floor(Math.log10(v)));const f=v/e;return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*e}
function anRevChart(M){const max=niceMax(Math.max(...M.map(x=>x.rev+x.proj))*1.08);const ticks=[0,.25,.5,.75,1].map(f=>max*f);
  const cols=M.map(x=>{const tot=x.rev+x.proj;const tip=[`${MON_FULL[+x.m.slice(5)-1]} ${x.m.slice(0,4)}${x.kind==='live'?' (month to date)':''}`,`Commercial: ${pounds(x.com)}`,`Domestic: ${pounds(x.dom)}`].concat(x.proj?[`Booked, not yet delivered: ${pounds(x.proj)}`,`Forecast: ${pounds(tot)}`]:[`Total: ${pounds(x.rev)}`]).join('\n');
    return `<div class="an-col" tabindex="0" data-tip="${esc(tip)}" aria-label="${esc(tip.replace(/\n/g,', '))}"><div class="an-stack" style="height:${tot/max*100}%"><span class="an-val mono">${kpounds(tot)}</span>
      ${x.proj?`<i class="anseg proj" style="flex:${x.proj}"></i>`:''}${x.dom?`<i class="anseg s2" style="flex:${x.dom}"></i>`:''}${x.com?`<i class="anseg s1" style="flex:${x.com}"></i>`:''}</div></div>`}).join('');
  return `<div class="an-legend small"><span><i class="sw s1"></i>Commercial</span><span><i class="sw s2"></i>Domestic</span>${M.some(x=>x.proj)?'<span><i class="sw proj"></i>Booked, not yet delivered</span>':''}</div>
  <div class="an-chart"><div class="an-plot">${ticks.map(t=>`<div class="an-grid" style="bottom:${t/max*100}%"><span class="mono">${kpounds(t)}</span></div>`).join('')}<div class="an-cols">${cols}</div></div>
  <div class="an-x">${M.map(x=>`<span>${x.label}${x.kind==='live'?'<br><b class="muted">MTD</b>':''}</span>`).join('')}</div></div>
  <details class="an-tbl"><summary class="small">Show as table</summary><div class="tablewrap"><table class="t"><thead><tr><th>Month</th><th>Commercial</th><th>Domestic</th><th>Booked ahead</th><th>Total</th></tr></thead><tbody>${M.map(x=>`<tr><td>${x.label}</td><td class="mono">${pounds(x.com)}</td><td class="mono">${pounds(x.dom)}</td><td class="mono">${x.proj?pounds(x.proj):'–'}</td><td class="mono">${pounds(x.rev+x.proj)}</td></tr>`).join('')}</tbody></table></div></details>`}
function anMarginChart(M){const pm=S.pricing.costs.margin;const max=Math.max(40,Math.ceil((Math.max(...M.map(x=>x.margin),pm)+5)/10)*10);const n=M.length;
  const pts=M.map((x,i)=>[(i+.5)/n*100,Math.max(0,x.margin)/max*100]);
  return `<div class="an-legend small"><span><i class="sw s1 dot"></i>Net margin</span><span><i class="sw tgt"></i>Target ${pm}%</span></div>
  <div class="an-chart"><div class="an-plot">${[0,.5,1].map(f=>`<div class="an-grid" style="bottom:${f*100}%"><span class="mono">${Math.round(max*f)}%</span></div>`).join('')}
    <div class="an-target" style="bottom:${pm/max*100}%"></div>
    <svg class="an-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts.map(p=>`${p[0]},${100-p[1]}`).join(' ')}" style="fill:none;stroke:var(--an1);stroke-width:2" vector-effect="non-scaling-stroke"/></svg>
    ${M.map((x,i)=>{const tip=`${MON_FULL[+x.m.slice(5)-1]}${x.kind==='live'?' (month to date)':''}\nNet margin: ${Math.round(x.margin)}%\nNet income: ${pounds(x.net)} on ${pounds(x.rev)}`;return `<span class="an-dot" tabindex="0" style="left:${pts[i][0]}%;bottom:${pts[i][1]}%" data-tip="${esc(tip)}" aria-label="${esc(tip.replace(/\n/g,', '))}">${i===n-1||i===0?`<b class="mono">${Math.round(x.margin)}%</b>`:''}</span>`}).join('')}</div>
  <div class="an-x">${M.map(x=>`<span>${x.label}</span>`).join('')}</div></div>
  <details class="an-tbl"><summary class="small">Show as table</summary><div class="tablewrap"><table class="t"><thead><tr><th>Month</th><th>Revenue</th><th>Pay and employer costs</th><th>Overheads</th><th>Fees, refunds</th><th>Net</th><th>Margin</th></tr></thead><tbody>${M.map(x=>`<tr><td>${x.label}</td><td class="mono">${pounds(x.rev)}</td><td class="mono">${pounds(x.pay+x.oncost)}</td><td class="mono">${pounds(x.overhead)}</td><td class="mono">${pounds(x.fees+x.refunds)}</td><td class="mono">${pounds(x.net)}</td><td class="mono">${Math.round(x.margin)}%</td></tr>`).join('')}</tbody></table></div></details>`}
function anHeat(CAP){const lvl=u=>u===null?'':u<1?'h0':u<25?'h1':u<50?'h2':u<75?'h3':'h4';
  return `<div class="tablewrap"><table class="an-heat"><thead><tr><th></th>${AN_BANDS.map(b=>`<th class="small">${b[2]}<br><span class="mono muted">${b[3]}</span></th>`).join('')}</tr></thead><tbody>
  ${AN_DAYS.map(d=>`<tr><th class="small">${DOW[d]}</th>${AN_BANDS.map((b,bi)=>{const c=CAP.cells[d+'|'+bi];const tip=`${DOW[d]} ${b[3]}\nBooked: ${c.booked.toFixed(1)} cleaner-hours a week\nOffered: ${c.avail.toFixed(1)} cleaner-hours a week${c.util!==null?`\n${Math.round(c.util)}% used`:''}`;
    return `<td class="${lvl(c.util)}" tabindex="0" data-tip="${esc(tip)}" aria-label="${esc(tip.replace(/\n/g,', '))}">${c.util===null?'<span class="muted">–</span>':`<b class="mono">${Math.round(c.util)}%</b><span class="mono">${c.booked.toFixed(0)}/${c.avail.toFixed(0)} h</span>`}</td>`}).join('')}</tr>`).join('')}</tbody></table></div>
  <div class="an-legend small" style="margin-top:8px"><span>Share of offered hours that are booked:</span>${[['h0','0%'],['h1','1–24%'],['h2','25–49%'],['h3','50–74%'],['h4','75%+']].map(([k,l])=>`<span><i class="sw ${k}"></i>${l}</span>`).join('')}</div>`}
function anBase(L){const t=today();const cust=Object.keys(S.customers).filter(c=>S.customers[c].type==='domestic'&&Object.values(S.visits).some(v=>custOf(v)===c&&v.svc==='regular'&&v.date>t&&v.state==='scheduled'));
  const dom=L.dom+['regular','deep','eot'].reduce((x,k)=>x+L.projSvc[k],0),com=L.com+L.projSvc.office;
  const hoursDom=['regular','deep','eot'].reduce((x,k)=>x+L.svcH[k]+L.projH[k],0),hoursCom=L.svcH.office+L.projH.office;
  const regRev=L.svc.regular+L.projSvc.regular,regH=L.svcH.regular+L.projH.regular;
  const avail=Object.keys(S.staff).filter(s=>readiness(S.staff[s])[1]!=='bad').reduce((x,s)=>{let h=0;for(let i=0;i<7;i++)h+=anStaffAvail(s,'00:00','23:59',addDays(weekOf(t),i));return x+h},0)*52/12;
  return {dom,com,hoursDom,hoursCom,nReg:cust.length,regPer:cust.length?regRev/cust.length:0,regHPer:cust.length?regH/cust.length:0,domVisits:Math.round(dom/AN_JOB.regular),avail}}
function anRun(B,o){const P=S.pricing;const q=quote(P,{svc:'regular',size:'2',baths:1,addons:{},freq:'weekly',products:'cleaner'});
  const k=52/12;const lost=Math.min(o.lost,B.nReg);
  const dom=B.dom*(1+o.dom/100)-lost*B.regPer*(1+o.dom/100)+o.add*k*q.net*(1+o.reg/100);
  const com=B.com*(1+o.com/100);const hours=B.hoursDom+B.hoursCom-lost*B.regHPer+o.add*k*q.labour;
  const rate=AN_AVG_RATE+o.wage;const pay=hours*rate;const C=P.costs;const wageRatio=rate/AN_AVG_RATE;
  const oncost=pay*C.oncost/100,overhead=hours*ohPerHour(P),fees=dom*FEE_PCT/100+(B.domVisits+o.add*k-lost*k)*FEE_FIXED;
  const rev=dom+com,net=rev-pay-oncost-overhead-fees;
  return {rev,dom,com,hours,pay:pay+oncost,overhead,fees,net,margin:rev?net/rev*100:0,util:B.avail?hours/B.avail*100:0,addH:o.add*k*q.labour,q,wageRatio}}
function anSimOut(){const L=anLive();const B=anBase(L);const o=S.an.sim;const z=anRun(B,{dom:0,com:0,reg:0,lost:0,add:0,wage:0});const s=anRun(B,o);const pm=S.pricing.costs.margin;
  const d=(a,b,inv)=>{const x=Math.round((a-b)/100);if(!x)return '<span class="muted">–</span>';const good=inv?x<0:x>0;return `<span style="color:var(--${good?'good':'bad'})">${x>0?'+':'−'}£${Math.abs(x).toLocaleString('en-GB')}</span>`};
  const row=(l,k,inv)=>`<tr><td>${l}</td><td class="mono">${pounds(Math.round(z[k]))}</td><td class="mono"><b>${pounds(Math.round(s[k]))}</b></td><td class="mono">${d(s[k],z[k],inv)}</td></tr>`;
  const CAP=anCapacity();const spareM=CAP.spareDay*52/12;const msgs=[];
  if(s.addH>spareM)msgs.push(['bad',`The new clients need ${Math.round(s.addH)} hours a month, but only about ${Math.round(spareM)} weekday daytime hours are free. You'd need another cleaner.`]);
  else if(o.add)msgs.push(['good',`The new clients need ${Math.round(s.addH)} hours a month, which fits inside the ${Math.round(spareM)} free weekday daytime hours.`]);
  if(o.dom>8&&!o.lost)msgs.push(['warn',`A ${o.dom}% rise for domestic clients may cost you some of them. Try setting clients who leave to 1 to see whether it still pays.`]);
  if(s.margin<pm)msgs.push(['warn',`Margin of ${Math.round(s.margin)}% is below your ${pm}% target.`]);else msgs.push(['good',`Margin of ${Math.round(s.margin)}% meets your ${pm}% target.`]);
  return `<div class="tablewrap"><table class="t"><thead><tr><th>A month</th><th>October forecast</th><th>Scenario</th><th>Change</th></tr></thead><tbody>
    ${row('Revenue','rev')}${row('Staff pay and employer costs','pay',true)}${row('Supplies, travel and overheads','overhead',true)}${row('Card fees','fees',true)}
    <tr class="tot"><td><b>Net income</b></td><td class="mono">${pounds(Math.round(z.net))}</td><td class="mono"><b>${pounds(Math.round(s.net))}</b></td><td class="mono"><b>${d(s.net,z.net)}</b></td></tr>
    <tr><td>Net margin</td><td class="mono">${Math.round(z.margin)}%</td><td class="mono"><b>${Math.round(s.margin)}%</b></td><td class="mono">${Math.round(s.margin-z.margin)?`${s.margin>z.margin?'+':'−'}${Math.abs(Math.round(s.margin-z.margin))} pts`:'–'}</td></tr>
    <tr><td>Cleaner-hours</td><td class="mono">${Math.round(z.hours)}</td><td class="mono">${Math.round(s.hours)}</td><td class="mono">${Math.round(s.hours-z.hours)?(s.hours>z.hours?'+':'−')+Math.abs(Math.round(s.hours-z.hours)):'–'}</td></tr></tbody></table></div>
    <div class="stack tight" style="margin-top:10px">${msgs.map(([t,m])=>`<div class="small an-msg ${t}">${pill(t==='good'?'OK':t==='bad'?'Capacity':'Check',t)} ${esc(m)}</div>`).join('')}</div>
    <p class="small muted" style="margin-top:8px">Starts from October's delivered work plus visits already booked this month. A new client is a weekly 2-bed regular clean at your current price list (${money(s.q.net)} a visit, ${s.q.labour} h). Costs use your pricing setup. This is an estimate to compare options, not a forecast.</p>`}
function anSimControls(){const o=S.an.sim;const B=anBase(anLive());
  const r=(k,l,min,max,step,fmt,hint)=>`<label class="f small an-range"><span class="row" style="justify-content:space-between"><span>${l}</span><b class="mono" id="an-o-${k}">${fmt(o[k])}</b></span><input type="range" data-an="${k}" min="${min}" max="${max}" step="${step}" value="${o[k]}" aria-label="${esc(l)}"><span class="hint">${hint}</span></label>`;
  const pc=v=>(v>0?'+':'')+v+'%';
  return `<div class="stack">${r('dom','Price change for existing domestic clients',-10,25,1,pc,'Applied at their next price review')}
    ${r('lost','Domestic clients who leave',0,Math.max(1,B.nReg),1,v=>String(v),`You have ${B.nReg} regular domestic client${B.nReg===1?'':'s'}`)}
    ${r('com','Price change for commercial contracts',-10,25,1,pc,'Applied at renewal')}
    ${r('add','New weekly regular clients',0,10,1,v=>String(v),'2-bed weekly clean at your price list')}
    ${r('reg','Change to your regular price list',-10,25,1,pc,'Affects new clients only')}
    ${r('wage','Change to hourly pay',-50,300,5,v=>(v<0?'−':'+')+'£'+(Math.abs(v)/100).toFixed(2),'For example a National Living Wage rise')}
    <button class="btn sm ghost" data-act="anSimReset" style="align-self:flex-start">Reset scenario</button></div>`}
const AN_SIM0={dom:0,com:0,reg:0,lost:0,add:0,wage:0};
function bizAnalytics(){S.an=S.an||{range:6,sim:{...AN_SIM0}};S.an.sim=Object.assign({...AN_SIM0},S.an.sim);
  const all=anMonths();const M=all.slice(-S.an.range);const L=all[all.length-1],prev=all[all.length-2];const P=S.pricing;
  const CL=anClients(L),TM=anTeam(L),CAP=anCapacity(),FC=anForecast();const INS=anInsights(all,L,CL,CAP,FC);
  const fc=L.rev+L.proj;const tgt=targetRate(P);const rph=L.hours?L.rev/L.hours:0;
  const ftr=L.visits?Math.round((L.visits-L.partial-S.cases.filter(c=>L.ids.has(c.visitId)&&!(V_(c.visitId).state==='partial')).length)/L.visits*100):0;
  const ftrPrev=prev.visits?Math.round((prev.visits-prev.partial-prev.disputes)/prev.visits*100):0;
  const recShare=L.rev?L.recurring/L.rev*100:0;
  const kpi=(l,n,d,tone='')=>`<div class="tile"><span class="label">${l}</span><span class="n mono">${n}</span><span class="d">${d}</span>${tone}</div>`;
  const delta=(a,b,suf,unit='%')=>{const x=Math.round(a-b);return x===0?`level with ${suf}`:`<span style="color:var(--${x>0?'good':'bad'})">${x>0?'▲':'▼'} ${Math.abs(x)}${unit}</span> vs ${suf}`};
  const svcRows=AN_SVC_ORDER.map(k=>{const r=M.reduce((x,m)=>x+m.svc[k],0),h=M.reduce((x,m)=>x+m.svcH[k],0);return {k,r,h}});
  const svcTot=svcRows.reduce((x,y)=>x+y.r,0);const cph=costPerHour(P);
  const tone={risk:['Risk','bad'],opp:['Opportunity','good'],watch:['Watch','warn']};
  return `<div class="rota-top"><div><h1>Analytics</h1><p class="muted">How the business is performing and where to act. ${monLabel(AN_HIST[0][0])}–Sep are sample history; October is live from your visits, invoices and payroll.</p></div>
    <div class="seg" role="group" aria-label="Trend range">${[[3,'3 months'],[6,'6 months']].map(([k,l])=>`<button aria-pressed="${S.an.range===k}" data-act="anRange" data-v="${k}">${l}</button>`).join('')}</div></div>



  <div class="an-layout"><div class="an-main stack">
  <section class="stack tight" aria-labelledby="h-kpi"><div class="sec-h"><h2 class="label" id="h-kpi">October at a glance</h2></div>
  <div class="tiles an-kpis">
    ${kpi('Revenue forecast',pounds(fc),`${delta(anPct(fc,prev.rev),0,'September')} · ${pounds(L.rev)} delivered so far`)}
    ${kpi('Net margin',Math.round(L.margin)+'%',`Target ${P.costs.margin}% · ${delta(L.margin,prev.margin,'September',' pts')}`)}
    ${kpi('Revenue per cleaner-hour',money(Math.round(rph)),`Cost ${money(cph)} · target ${money(tgt)}`)}
    ${kpi('Recurring revenue',Math.round(recShare)+'%','Contracts and regular cleans: the predictable base')}
    ${kpi('Right first time',ftr+'%',`Visits with no partial or dispute · ${delta(ftr,ftrPrev,'September',' pts')}`)}
    ${kpi('On-time arrival',L.onTime!==null?L.onTime+'%':'–',`Checked in within ${S.settings.tolerance} min · September ${prev.onTime}%`)}
    ${kpi('Customer rating',L.rating?L.rating.toFixed(1)+' / 5':'–',`${L.ratingN} rating${L.ratingN===1?'':'s'} · September ${prev.rating.toFixed(1)}`)}
    ${(()=>{const owed=S.invoices.filter(i=>['issued','partially_paid'].includes(i.status)).reduce((x,i)=>x+Math.max(0,invTotals(i).bal),0);return kpi('To collect',pounds(owed+L.F.toInvoice),`${pounds(owed)} on issued invoices · ${pounds(L.F.toInvoice)} not yet invoiced`)})()}
  </div></section>

  <div class="grid2 an-2">
    <div class="card" id="an-rev"><div class="panel-h"><h2>Revenue by month</h2></div>${anRevChart(M)}</div>
    <div class="card"><div class="panel-h"><h2>Net margin by month</h2></div>${anMarginChart(M)}<p class="small muted" style="margin-top:6px">Earlier months use your current cost rates from pricing setup.</p></div>
  </div>

  <div class="card tablewrap"><div class="panel-h"><h2>Service economics · last ${S.an.range} months</h2><button class="btn sm ghost" data-act="prOpen">Pricing setup</button></div>
    <p class="small muted" style="margin-bottom:8px">Which work earns its time. Margin compares revenue per cleaner-hour with your cost of ${money(cph)}/h.</p>
    <table class="t"><thead><tr><th>Service</th><th>Revenue</th><th style="min-width:120px">Share</th><th>Cleaner-hours</th><th>£ per cleaner-hour</th><th>Est. margin</th></tr></thead><tbody>
    ${svcRows.map(x=>{const rp=x.h?x.r/x.h:0;const m=x.r?(x.r-x.h*cph)/x.r*100:0;const sh=svcTot?x.r/svcTot*100:0;return `<tr><td>${AN_SVC[x.k]}</td><td class="mono">${pounds(x.r)}</td><td><span class="an-share"><i style="width:${sh}%"></i></span><span class="mono small">${Math.round(sh)}%</span></td><td class="mono">${Math.round(x.h)}</td><td class="mono">${x.h?money(Math.round(rp)):'–'}</td><td>${x.h?pill(Math.round(m)+'% · '+marginLabel(m,P),marginTone(m,P)):'–'}</td></tr>`}).join('')}</tbody></table></div>

  <div class="card tablewrap"><div class="panel-h"><h2>Clients · month to date</h2></div>
    <table class="t"><thead><tr><th>Client</th><th>Revenue</th><th>Share</th><th>£ per cleaner-hour</th><th>Est. margin</th><th>Disputes</th><th>Rating</th><th>Booked next 4 weeks</th></tr></thead><tbody>
    ${CL.map(c=>`<tr class="click" data-act="anGo" data-v="clients" data-id="${c.cid}" tabindex="0"><td><b>${esc(c.name)}</b><div class="small muted">${c.type==='commercial'?'Commercial':'Domestic'} · ${c.n} visit${c.n===1?'':'s'}</div></td><td class="mono">${pounds(c.rev)}</td><td><span class="an-share"><i style="width:${c.share}%"></i></span><span class="mono small">${Math.round(c.share)}%</span></td><td class="mono">${money(Math.round(c.rph))}</td><td>${pill(Math.round(c.m)+'%',marginTone(c.m,P))}</td><td>${c.open?pill(c.open+' open','bad'):c.disputes?`<span class="small">${c.disputes} resolved</span>`:'<span class="muted small">None</span>'}</td><td class="mono">${c.avg?c.avg.toFixed(1):'–'}</td><td class="mono">${c.upc?pounds(c.upc):'–'}</td></tr>`).join('')||'<tr><td colspan="8" class="muted">No delivered visits yet this month.</td></tr>'}</tbody></table></div>

  <div class="grid2 an-2">
    <div class="card tablewrap"><div class="panel-h"><h2>Team · month to date</h2></div>
      <table class="t"><thead><tr><th>Cleaner</th><th>Hours</th><th>Availability used</th><th>On time</th><th>Issues</th><th>Booked ahead</th></tr></thead><tbody>
      ${TM.map(x=>`<tr class="click" data-act="anGo" data-v="employees" data-id="${x.s.id}" tabindex="0"><td><b>${esc(x.s.name)}</b>${x.ready[1]==='bad'?`<div>${pill(x.ready[0],'bad')}</div>`:''}</td><td class="mono">${x.hrs.toFixed(1)}</td><td><span class="an-share"><i style="width:${Math.min(100,x.util)}%"></i></span><span class="mono small">${Math.round(x.util)}%</span></td><td class="mono">${x.onTime!==null?x.onTime+'%':'–'}</td><td>${x.issues?pill(x.issues,'warn'):'<span class="muted small">0</span>'}</td><td class="mono">${x.ahead?x.ahead.toFixed(1)+' h':'–'}</td></tr>`).join('')}</tbody></table>
      <p class="small muted" style="margin-top:8px">Availability used is approved hours against the hours each person offers. Issues are partial visits or disputes on their visits.</p></div>
    <div class="card" id="an-cap"><div class="panel-h"><h2>Capacity · next 4 weeks</h2></div>
      <p class="small muted" style="margin-bottom:8px">Average booked cleaner-hours a week against the hours your team offers. Pale cells are spare capacity you could sell.</p>${anHeat(CAP)}</div>
  </div>

  <div class="card tablewrap"><div class="panel-h"><h2>Booked work · next 4 weeks</h2><button class="btn sm ghost" data-act="biz" data-v="rota">Open rota</button></div>
    <table class="t"><thead><tr><th>Week</th><th>Rota</th><th>Visits</th><th style="min-width:140px">Booked value</th><th>Cleaner-hours</th><th>Crew slots</th><th>Unfilled</th></tr></thead><tbody>
    ${(()=>{const mx=Math.max(...FC.map(w=>w.rev),1);return FC.map(w=>`<tr><td class="mono">${fmtD(w.w).slice(4)}</td><td>${w.ps==='published'?pill('Published','good'):w.ps==='draft'?pill('Draft','warn'):pill('Not started','')}</td><td class="mono">${w.n}</td><td><span class="an-share"><i style="width:${w.rev/mx*100}%"></i></span><span class="mono small">${pounds(w.rev)}</span></td><td class="mono">${w.hours.toFixed(1)}</td><td class="mono">${w.slots}</td><td>${w.gaps?pill(w.gaps+' unfilled','bad'):'<span class="muted small">0</span>'}${w.unconf?` ${pill(w.unconf+' unconfirmed','warn')}`:''}</td></tr>`).join('')})()}</tbody></table>
    <p class="small muted" style="margin-top:8px">Includes contract visits at the contract rate and card bookings at the price agreed. The current week includes work already delivered.</p></div>

  <div class="card" id="an-sim"><div class="panel-h"><div><h2>What if…</h2><p class="small muted">Test a price rise, new clients or a pay change before you commit.</p></div></div>
    <div class="an-simgrid">${anSimControls()}<div id="ansimout">${anSimOut()}</div></div></div>
  </div>
  <aside class="an-side stack tight" aria-labelledby="h-dec"><div class="sec-h"><h2 class="label" id="h-dec">Decisions to consider · ${INS.length}</h2></div>
    <div class="an-ins">${INS.map(x=>`<article class="card an-card ${x.tone}"><div class="row" style="justify-content:space-between;gap:8px">${pill(tone[x.tone][0],tone[x.tone][1])}${x.impact?`<span class="small"><b class="mono">≈ ${pounds(x.impact)}</b> <span class="muted">${esc(x.impactL)}</span></span>`:''}</div>
      <h3>${esc(x.title)}</h3><p class="small">${x.body}</p><div class="row">${x.acts.map(([a,v,l,id])=>`<button class="btn sm ${a==='anSim'?'':'ghost'}" data-act="${a}" data-v="${v}"${id?` data-id="${esc(id)}"`:''}>${esc(l)}</button>`).join('')}</div></article>`).join('')||'<p class="muted">Nothing needs a decision right now.</p>'}</div></aside></div>`;
}
