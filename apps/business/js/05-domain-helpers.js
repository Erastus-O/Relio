/* domain helpers */
function audit(action,object,reason='',actor=ME_BIZ){S.tick++;S.audit.unshift({at:stamp(),actor,action,object,reason})}
function event(name,ref){S.events.unshift({name,ref,at:stamp()})}
function notify(to,text,status='sent'){S.notifs.unshift({id:'n-'+(S.seq++),to,text,status,at:stamp()})}
function toast(msg){const t=document.createElement('div');t.className='toast';t.textContent=msg;document.getElementById('toasts').appendChild(t);setTimeout(()=>t.remove(),3200)}
const V_=id=>S.visits[id];
const site=v=>S.sites[v.site];
const allocsFor=id=>S.allocs.filter(a=>a.visitId===id&&!['cancelled','replaced'].includes(a.status));
const confirmedCount=v=>allocsFor(v.id).filter(a=>a.status==='published'&&a.response!=='declined'&&(!a.requiresAcceptance||a.response==='accepted')).length;
const plannedCount=v=>allocsFor(v.id).filter(a=>a.response!=='declined').length;
const periodState=w=>(S.periods[w]&&S.periods[w].status)||'not_started';
function custOf(v){return site(v).customer}
function refundable(pid){const p=S.payments[pid];if(!p)return 0;const used=S.refunds.filter(r=>r.paymentId===pid&&['pending','succeeded'].includes(r.status)).reduce((s,r)=>s+r.amount,0);return p.captured-used}
function elig(sid,v,ignoreId){
  const s=S.staff[sid],st=site(v),svc=SERVICES[v.svc];const blocks=[],warns=[];
  if(!s.skills.includes(svc.skill))blocks.push(`Missing skill: ${svc.skillLabel}`);
  if(s.onboarding&&Object.values(s.onboarding).some(x=>!x))blocks.push('Onboarding incomplete');
  if(s.verif&&!proCanWork(s))blocks.push('Pro app verification not complete');
  {const ina=proInactive(s);if(ina.length)blocks.push(`Inactive: ${ina.map(d=>d.name).join(', ')} renewal overdue`)}
  if(st.type==='domestic'){const c=s.cred;if(c.status==='pending')blocks.push(`${c.type} not yet verified (domestic sites need a verified check)`);else if(c.status!=='verified')blocks.push(`${c.type} expired ${fmtD(c.expires)} (domestic sites need a verified check)`);else if(c.expires<v.date)blocks.push(`${c.type} expires before visit`)}
  const d=dt(v.date).getDay();
  if(!s.avail.days.includes(d)||v.start<s.avail.from||v.end>s.avail.to)warns.push(`Outside stated availability (${s.avail.label})`);
  if(S.allocs.some(a=>a.visitId===v.id&&a.staffId===sid&&a.id!==ignoreId&&!['cancelled','replaced'].includes(a.status)&&a.response!=='declined'))blocks.push('Already allocated to this visit');
  for(const a of S.allocs){
    if(a.staffId!==sid||a.id===ignoreId||['cancelled','replaced'].includes(a.status)||a.response==='declined')continue;
    const o=V_(a.visitId);if(o.id===v.id||o.date!==v.date)continue;
    const buf=o.site===v.site?0:30;
    if(mins(v.start)<mins(a.end)+buf&&mins(a.start)<mins(v.end)+buf)blocks.push(`Overlaps ${S.sites[o.site].short} ${a.start}–${a.end} (incl. ${buf} min travel)`);
  }
  return {ok:!blocks.length,blocks,warns};
}
function allocLabel(a){
  if(a.status==='draft')return ['Draft',''];
  if(a.status==='cancelled')return ['Cancelled',''];
  if(a.status==='replaced')return ['Replaced',''];
  if(a.amendment&&a.amendment.status==='proposed')return ['Amendment pending','warn'];
  if(a.response==='declined')return ['Declined','bad'];
  if(a.requiresAcceptance&&!a.response)return ['Awaiting acceptance','warn'];
  if(!a.ack)return ['Awaiting acknowledgement','warn'];
  if(a.response==='accepted'&&a.requiresAcceptance)return ['Accepted','good'];
  return ['Acknowledged','good'];
}
function visitOpLabel(v){
  return {scheduled:['Scheduled','info'],in_progress:['In progress','acc'],submitted:['Awaiting review','warn'],completed:['Completed','good'],partial:['Partially completed','warn'],stopped:['Stopped: incident','bad'],cancelled:['Cancelled','']}[v.state]||[v.state,''];
}
function payLabel(v){
  if(v.payment==='invoice'){const inv=v.invoiceId&&S.invoices&&invById(v.invoiceId);if(inv&&inv.status!=='void'){if(inv.status==='paid')return ['Paid','good'];if(inv.status==='settled')return ['Settled by credit',''];if(invOverdue(inv))return ['Overdue','bad'];if(inv.status==='partially_paid')return ['Part paid','warn'];return ['Invoiced · awaiting payment','info']}return ['completed','partial'].includes(v.state)?['Awaiting invoice','warn']:['Contract · billed monthly','']}
  if(v.price===0)return ['No charge (re-clean)',''];
  const p=S.payments[v.payment];if(!p)return ['No payment',''];
  const refs=S.refunds.filter(r=>r.paymentId===p.id);
  if(p.status==='succeeded'){const pend=refs.find(r=>r.status==='pending');const ok=refs.filter(r=>r.status==='succeeded').reduce((s,r)=>s+r.amount,0);
    if(pend)return [`Paid ${money(p.captured)} · refund ${money(pend.amount)} pending`,'warn'];
    if(ok)return [`Paid ${money(p.captured)} · ${money(ok)} refunded`,'info'];
    return [`Paid ${money(p.captured)}`,'good']}
  if(p.status==='processing')return ['Payment processing','warn'];
  if(p.status==='scheduled')return [`${money(p.amount)} due 24h before`,''];
  if(p.status==='failed')return ['Payment failed','bad'];
  return [p.status,''];
}
