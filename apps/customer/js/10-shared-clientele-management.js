/* CLIENTELE MANAGEMENT */
function clientStats(cid){
  const [a,b]=periodRange('month');const vs=Object.values(S.visits).filter(v=>custOf(v)===cid);
  const delivered=vs.filter(v=>v.date>=a&&v.date<=b&&['completed','partial'].includes(v.state));
  const upcoming=vs.filter(v=>v.date>=today()&&['scheduled','in_progress'].includes(v.state)).sort((x,y)=>(x.date+x.start).localeCompare(y.date+y.start));
  const fb=vs.map(v=>S.feedback[v.id]).filter(Boolean);
  return {vs,delivered,earned:delivered.reduce((x,v)=>x+visitValue(v),0),upcoming,avg:fb.length?fb.reduce((x,f)=>x+f.score,0)/fb.length:null,fbn:fb.length,
    disputes:S.cases.filter(c=>c.customer===cid),sites:Object.values(S.sites).filter(s=>s.customer===cid)};
}
