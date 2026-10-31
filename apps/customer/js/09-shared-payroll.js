/* PAYROLL */
function payLines(a,b){
  const out={};const byDay={};
  const blank=()=>({job:0,travel:0,adj:0,visits:0});
  Object.values(S.visits).filter(v=>v.date>=a&&v.date<=b&&['completed','partial'].includes(v.state)&&!(v.review&&v.review.outcome==='failed')).forEach(v=>{
    if(v.timeIssue&&v.timeIssue.status==='open')return;
    allocsFor(v.id).filter(x=>x.status==='published'&&x.response!=='declined').forEach(x=>{
      const L=out[x.staffId]||(out[x.staffId]=blank());L.job+=(mins(x.end)-mins(x.start))/60;L.visits++;
      (byDay[x.staffId+'|'+v.date]=byDay[x.staffId+'|'+v.date]||new Set()).add(v.site)})});
  Object.entries(byDay).forEach(([k,set])=>{if(set.size>1)out[k.split('|')[0]].travel+=(set.size-1)*TRAVEL_MIN/60});
  (S.payroll.adjustments||[]).filter(j=>j.date>=a&&j.date<=b).forEach(j=>{const L=out[j.staff]||(out[j.staff]=blank());L.adj+=j.hours});
  Object.entries(out).forEach(([id,L])=>{L.rate=rateOf(id);L.hours=L.job+L.travel+L.adj;L.amount=[L.job,L.travel,L.adj].reduce((x,h)=>x+Math.round(h*L.rate),0)});
  return out;
}
function payExceptions(){const P=S.payroll;const out=[];
  P.corrections.filter(c=>c.status==='pending').forEach(c=>out.push({kind:'corr',c}));
  Object.values(S.visits).filter(v=>v.timeIssue&&v.timeIssue.status==='open'&&v.date>=P.period.from&&v.date<=P.period.to).forEach(v=>out.push({kind:'missing',v}));
  return out}
