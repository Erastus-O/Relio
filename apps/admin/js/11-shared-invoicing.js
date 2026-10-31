/* INVOICING */
const BIZ_ADDR='Crowland, Peterborough PE6 · 01733 960 412 · accounts@fenlandfresh.example';
function invById(id){return S.invoices.find(i=>i.id===id)}
function availVisits(d){
  const inDraft=new Set(S.invoices.filter(i=>i.status==='draft'&&i.id!==d.id).flatMap(i=>i.visitIds||[]));
  return Object.values(S.visits).filter(v=>custOf(v)===d.customer&&v.date>=d.from&&v.date<=d.to&&['completed','partial'].includes(v.state)&&!(v.review&&v.review.outcome==='failed')&&!v.invoiceId&&!inDraft.has(v.id)&&visitValue(v)>0)
    .sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
}
function refundsFor(vid){return S.refunds.filter(r=>r.status==='succeeded'&&S.payments[r.paymentId]&&S.payments[r.paymentId].visitId===vid)}
function bookedOn(v){return v.bookedOn||(S.customers[custOf(v)]||{}).since||v.date}
function invLines(inv){
  if(inv.status!=='draft'&&inv.lines)return inv.lines;
  const vs=(inv.visitIds||[]).map(V_).filter(Boolean).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));const lines=[];
  if(inv.group){const g={};vs.forEach(v=>{const val=visitValue(v);const k=v.site+'|'+v.svc+'|'+val;(g[k]=g[k]||{v,val,list:[]}).list.push(v)});
    Object.values(g).forEach(x=>{const n=x.list.length;lines.push({date:null,booked:x.list.map(bookedOn).sort()[0],svcRange:`${fmtD(x.list[0].date).slice(4)} – ${fmtD(x.list[n-1].date).slice(4)}`,desc:`${SERVICES[x.v.svc].name} · ${site(x.v).name}`,detail:`${n} visit${n>1?'s':''}${x.list.some(v=>v.state==='partial')?' · includes a partially completed visit':''}`,qty:n,unit:x.val,amount:n*x.val})})}
  else vs.forEach(v=>{const nd=v.tasks.filter(t=>t.result==='not_done').map(t=>t.name);lines.push({date:v.date,booked:bookedOn(v),desc:`${SERVICES[v.svc].name} · ${site(v).short}`,detail:v.state==='partial'?`Partially completed: ${nd.join(', ')} not done`:`Arrival ${v.start}`,qty:1,unit:visitValue(v),amount:visitValue(v)})});
  vs.forEach(v=>refundsFor(v.id).forEach(r=>lines.push({date:r.date||null,desc:`Refund agreed · ${r.caseId}`,detail:`For the ${fmtD(v.date).slice(4)} visit`,qty:1,unit:-r.amount,amount:-r.amount})));
  (inv.extra||[]).forEach(x=>lines.push({date:null,desc:x.desc,detail:'',qty:x.qty,unit:x.unit,amount:Math.round(x.qty*x.unit)}));
  return lines;
}
function prepaidFor(inv){if(inv.status!=='draft'&&inv.prepaid!=null)return inv.prepaid;
  return (inv.visitIds||[]).map(V_).filter(Boolean).reduce((x,v)=>{const p=S.payments[v.payment];if(!p||!p.captured)return x;return x+p.captured-refundsFor(v.id).reduce((s,r)=>s+r.amount,0)},0)}
function invTotals(inv){const lines=invLines(inv);const sub=lines.reduce((x,l)=>x+l.amount,0);const total=sub;const pre=prepaidFor(inv);const paid=inv.paid||0;const cred=(inv.credits||[]).reduce((x,c)=>x+c.amount,0);return {lines,sub,vat:0,total,pre,paid,cred,bal:total-pre-paid-cred}}
function cnCalcText(i,pct){const T=invTotals(i);const amt=Math.round(T.total*(pct||0)/100);const nb=T.bal-amt;const left=T.total-T.cred;
  if(!(pct>0))return 'Enter a percentage.';if(amt>left)return `That's more than the ${money(left)} left to credit.`;
  return `<b>${pct}% of ${money(T.total)} = ${money(amt)}</b><br>Balance ${T.bal<0?'(credit owed) ':''}${money(Math.abs(T.bal))} → ${nb<0?`credit owed to client ${money(-nb)}`:money(nb)}`}
function cnCalc(){const m=S.modal;if(!m||m.type!=='invCredit')return;const el=document.getElementById('cn-calc');if(el)el.innerHTML=cnCalcText(invById(m.id),parseFloat((document.getElementById('cn-pct')||{}).value))}
function invOverdue(i){return ['issued','partially_paid'].includes(i.status)&&i.due<today()}
function invLabel(i){if(i.status==='draft')return ['Draft',''];if(i.status==='void')return [`Void · ${i.credit}`,''];if(i.status==='settled')return ['Settled by credit',''];if(i.status==='paid')return invTotals(i).bal<0?['Paid · credit owed','warn']:['Paid','good'];if(invOverdue(i))return [`Overdue · due ${fmtD(i.due).slice(4)}`,'bad'];if(i.status==='partially_paid')return ['Part paid','warn'];return [`Issued · due ${fmtD(i.due).slice(4)}`,'info']}
function billContact(C){return (C.contacts||[]).find(c=>c.role==='Accounts')||(C.contacts||[])[0]||{name:C.name}}
function invDoc(inv){
  const C=S.customers[inv.customer];const T=invTotals(inv);const bc=billContact(C);const st=Object.values(S.sites).find(s=>s.customer===inv.customer);
  const issued=inv.issued||today();const due=inv.due||addDays(issued,inv.terms||0);
  const wm=inv.status==='draft'?'Draft':inv.status==='void'?'Void':inv.status==='paid'?'Paid':'';
  const d=x=>`${fmtD(x).slice(4)} ${x.slice(0,4)}`;
  return `<article class="paper" aria-label="Invoice preview">${wm?`<div class="wm" aria-hidden="true">${wm}</div>`:''}
  <header class="paper-h"><div><div class="ph-brand">Fenland Fresh Cleaning</div><div class="small muted">${BIZ_ADDR}</div></div><div class="ph-right"><div class="ph-title">Invoice</div><div class="mono">${inv.no?esc(inv.no):'Number assigned on issue'}</div></div></header>
  <div class="paper-meta"><div><div class="label">Bill to</div><b>${esc(C.entity||C.name)}</b><div>${esc(bc.name)}${bc.email?`<br><span class="small">${esc(bc.email)}</span>`:''}</div><div class="small muted">${esc(st?st.addr:'')}</div></div>
    <dl class="kv small"><dt>Issue date</dt><dd>${d(issued)}${inv.status==='draft'?' (on issue)':''}</dd><dt>Due date</dt><dd>${inv.terms?d(due):'On receipt'}</dd><dt>Service period</dt><dd>${fmtD(inv.from).slice(4)} – ${fmtD(inv.to).slice(4)} ${inv.to.slice(0,4)}</dd>${inv.po?`<dt>PO number</dt><dd class="mono">${esc(inv.po)}</dd>`:''}<dt>Terms</dt><dd>${inv.terms?`${inv.terms} days`:'Due on receipt'}</dd></dl></div>
  <div class="tablewrap"><table class="t inv-lines"><thead><tr><th>Booked</th><th>Description</th><th style="text-align:right">Qty</th><th style="text-align:right">Unit price</th><th style="text-align:right">Amount</th></tr></thead><tbody>
  ${T.lines.length?T.lines.map(l=>`<tr><td class="mono small">${l.booked?`${fmtD(l.booked).slice(4)} ${l.booked.slice(0,4)}`:'–'}</td><td>${esc(l.desc)}${l.detail?`<div class="small muted">${esc(l.detail)}</div>`:''}</td><td class="mono" style="text-align:right">${l.qty}</td><td class="mono" style="text-align:right">${l.unit<0?'−':''}${money(Math.abs(l.unit))}</td><td class="mono" style="text-align:right">${l.amount<0?'−':''}${money(Math.abs(l.amount))}</td></tr>`).join(''):'<tr><td colspan="5" class="muted">No lines yet. Select visits or add a line.</td></tr>'}
  </tbody></table></div>
  <table class="ledger inv-tot"><tr><td>Subtotal</td><td>${money(T.sub)}</td></tr><tr class="sub"><td>VAT · business not VAT registered</td><td>${money(0)}</td></tr><tr class="tot"><td>Total</td><td>${money(T.total)}</td></tr>
  ${T.pre?`<tr class="sub"><td>Paid by card at booking</td><td>−${money(T.pre)}</td></tr>`:''}${T.paid?`<tr class="sub"><td>Payments received</td><td>−${money(T.paid)}</td></tr>`:''}${(inv.credits||[]).map(c=>`<tr class="sub"><td>Credit note ${esc(c.no)} (${c.pct}%)</td><td>−${money(c.amount)}</td></tr>`).join('')}${T.bal<0?`<tr class="tot"><td>Credit owed to client</td><td>${money(-T.bal)}</td></tr>`:`<tr class="tot"><td>Balance due</td><td>${money(T.bal)}</td></tr>`}</table>
  <footer class="small paper-f">${T.bal<0?`A credit of ${money(-T.bal)} is owed to you. We'll refund it or apply it to your next invoice, whichever you prefer.`:T.bal===0&&T.total>0?(T.cred?'No payment is due.':'Paid in full. No payment is due.'):`Please pay ${inv.terms?`by ${d(due)}`:'on receipt'} by bank transfer quoting ${inv.no?esc(inv.no):'the invoice number'}, or use the secure payment link in the invoice email.`}${inv.notes?`<div style="margin-top:6px"><b>Note:</b> ${esc(inv.notes)}</div>`:''}<div class="muted" style="margin-top:6px">Questions about this invoice? Reply to the invoice email or call 01733 960 412.</div></footer></article>`;
}
function invField(el,full){
  const d=invById(S.biz.invDraft);if(!d||d.status!=='draft')return;const k=el.dataset.inv;
  if(k==='visit'){d.visitIds=el.checked?[...new Set([...d.visitIds,el.value])]:d.visitIds.filter(x=>x!==el.value)}
  else if(k==='group')d.group=el.checked;
  else if(k==='customer'){d.customer=el.value;const C=S.customers[d.customer];d.group=C.type==='commercial';d.terms=C.termsDays!=null?C.termsDays:14;d.po='';d.visitIds=availVisits(d).map(v=>v.id)}
  else if(k==='from'||k==='to'){if(!el.value)return;d[k]=el.value;d.visitIds=availVisits(d).map(v=>v.id)}
  else if(k==='terms')d.terms=+el.value;
  else d[k]=el.value;
  save();
  if(full&&['customer','from','to','visit','group','terms'].includes(k))render();
  else{const p=document.getElementById('invprev');if(p)p.innerHTML=invDoc(d)}
}
