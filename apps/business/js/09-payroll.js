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
function linesFrom(PL){const out=[];let n=1;Object.entries(PL).forEach(([id,L])=>{[['ordinary',L.job],['travel',L.travel],['adjustment',L.adj]].forEach(([cat,h])=>{if(Math.abs(h)>0.001)out.push({line:'L'+(n++),staff:id,cat,hours:Math.round(h*100)/100,rate:L.rate,amount:Math.round(h*L.rate),status:'pending'})})});return out}
function payExceptions(){const P=S.payroll;const out=[];
  P.corrections.filter(c=>c.status==='pending').forEach(c=>out.push({kind:'corr',c}));
  Object.values(S.visits).filter(v=>v.timeIssue&&v.timeIssue.status==='open'&&v.date>=P.period.from&&v.date<=P.period.to).forEach(v=>out.push({kind:'missing',v}));
  return out}
function csvOf(B){return ['batch_id,line_id,employee_ref,employee,category,hours,rate_gbp,amount_gbp'].concat(B.lines.map(l=>[B.id,l.line,empRef(l.staff),S.staff[l.staff].name,l.cat,l.hours.toFixed(2),(l.rate/100).toFixed(2),(l.amount/100).toFixed(2)].join(','))).join('\n')}
function bizPayroll(){const tab=S.biz.payTab||'run';const tabs=`<div class="seg emp-tabs" role="tablist" aria-label="Payroll" style="margin-bottom:4px">${[['run','Current pay run'],['reports','Reports']].map(([k,l])=>`<button role="tab" aria-selected="${tab===k}" aria-pressed="${tab===k}" data-act="payTab" data-v="${k}">${l}</button>`).join('')}</div>`;
  if(tab==='reports')return `<div class="rota-top"><div><h1>Payroll</h1><p class="muted">Generate weekly, monthly or yearly payroll reports for your records, your accountant or a lender.</p></div></div>${tabs}${payReports()}`;
  return bizPayroll0(tabs)}
function bizPayroll0(tabs){
  const P=S.payroll;const PL=payLines(P.period.from,P.period.to);const B=P.batch;const lines=B?B.lines:linesFrom(PL);
  const total=lines.reduce((x,l)=>x+l.amount,0);const hrs=lines.reduce((x,l)=>x+l.hours,0);const ex=payExceptions();
  const steps=[['draft','Draft'],['reviewed','Reviewed'],['approved','Approved'],['locked','Locked'],['exported','Exported'],['acknowledged','Acknowledged'],['paid','Paid']];
  const idx=steps.findIndex(s=>s[0]===(P.status==='partially_rejected'?'exported':P.status));
  const by={};lines.forEach(l=>{const r=by[l.staff]||(by[l.staff]={ordinary:0,travel:0,adjustment:0,amount:0,st:[]});r[l.cat]+=l.hours;r.amount+=l.amount;r.st.push(l.status)});
  const liveTotal=Object.values(PL).reduce((x,L)=>x+L.amount,0);
  const act={draft:`<button class="btn primary" data-act="payStep" data-v="reviewed" ${ex.length?'disabled':''}>Mark as reviewed</button>${ex.length?'<span class="small" style="color:var(--warn)">Resolve the exceptions first</span>':''}`,
    reviewed:`<button class="btn primary" data-act="payStep" data-v="approved">Approve pay input</button>`,
    approved:`<button class="btn primary" data-act="payLock">Lock period</button><span class="small muted">Locking snapshots every line. Later changes become adjustments.</span>`,
    locked:`<button class="btn primary" data-act="payExport">Export to payroll provider</button>`,
    exported:`<button class="btn" data-act="payReexport">Re-export</button><button class="btn primary" data-act="payImport" data-v="ok">Simulate import: all accepted</button><button class="btn" data-act="payImport" data-v="reject">Simulate import: one line rejected</button>`,
    partially_rejected:`<button class="btn primary" data-act="payCorrect">Send correction batch for the rejected line</button>`,
    acknowledged:`<button class="btn primary" data-act="payPaid">Record payment confirmation</button><span class="small muted">Only an authoritative confirmation marks the batch paid.</span>`,paid:''}[P.status];
  const stPill=st=>st.includes('rejected')?pill('Rejected','bad'):st.every(x=>x==='accepted'||x.startsWith('accepted'))?pill('Accepted','good'):pill(B?'Sent':'Preview','');
  return `<div class="rota-top"><div><h1>Payroll</h1><p class="muted">Pay period ${fmtD(P.period.from).slice(4)} – ${fmtD(P.period.to).slice(4)} · semi-monthly · pay date ${fmtD(P.period.pay)}. Prepares approved pay input for your payroll provider; tax, NI and pension are calculated there.</p></div></div>${tabs}
  <ol class="steps">${steps.map((s,i)=>`<li class="${i===idx?'on':i<idx?'dn':''}"><span class="k">${i<idx?'✓':i+1}</span>${s[1]}</li>`).join('')}</ol>
  ${ex.length?`<div class="card"><div class="panel-h"><h2>Exceptions to resolve</h2><span class="small muted">${ex.length} blocking</span></div><ul class="alerts">${ex.map(payExItem).join('')}</ul></div>`:''}
  <div class="card tablewrap"><div class="panel-h"><h2>${B?`Batch ${esc(B.id)}`:'Preview from approved time'}</h2><span class="row">${P.status==='paid'?pill('Paid '+P.paidAt,'good'):pill(steps[idx][1]+(P.status==='partially_rejected'?' · 1 line rejected':''),P.status==='partially_rejected'?'bad':'info')}</span></div>
    <table class="t"><thead><tr><th>Employee</th><th>Ordinary h</th><th>Travel h</th><th>Adjust. h</th><th>Overtime h</th><th>Rate</th><th style="text-align:right">Gross</th>${B?'<th>Provider</th>':''}</tr></thead><tbody>
    ${Object.entries(by).map(([id,r])=>`<tr><td>${esc(S.staff[id].name)}<div class="small muted mono">${empRef(id)}</div></td><td class="mono">${r.ordinary.toFixed(2)}</td><td class="mono">${r.travel.toFixed(2)}</td><td class="mono">${r.adjustment.toFixed(2)}</td><td class="mono muted">0.00</td><td class="mono">${money(rateOf(id))}</td><td class="mono" style="text-align:right">${money(r.amount)}</td>${B?`<td>${stPill(r.st)}</td>`:''}</tr>`).join('')||`<tr><td colspan="8" class="muted">No approved time in this period.</td></tr>`}
    <tr><td><b>Total</b></td><td colspan="3" class="mono"><b>${hrs.toFixed(2)} h</b></td><td></td><td></td><td class="mono" style="text-align:right"><b>${money(total)}</b></td>${B?'<td></td>':''}</tr></tbody></table>
    <p class="small muted" style="margin-top:8px">Ordinary = supervisor-approved job time. Travel = ${TRAVEL_MIN} minutes paid between different sites on the same day. Overtime applies above 40 hours a week at 1.5× (none this period). No automatic rounding. Customer disputes never remove approved hours.</p>
    ${B&&liveTotal!==total?`<div class="note info" style="margin-top:8px">${money(liveTotal-total)} of time was approved after this period was locked. It will go into the next period as adjustments.</div>`:''}
    <div class="row" style="margin-top:12px">${act}</div></div>
  ${B?`<div class="grid2"><div class="card"><h2 style="margin-bottom:8px">Batch record</h2><dl class="kv small"><dt>Batch ID</dt><dd class="mono">${esc(B.id)} · v${B.version}</dd><dt>Lines</dt><dd>${B.lines.length}</dd><dt>Checksum</dt><dd class="mono">${esc(B.checksum)}</dd><dt>Locked</dt><dd>${esc(B.lockedAt)} by ${esc(B.lockedBy)}</dd><dt>Exported</dt><dd>${esc(B.exportedAt||'Not yet')}</dd><dt>Provider</dt><dd>${esc(B.providerNote||'Awaiting import')}</dd>${B.corrections&&B.corrections.length?`<dt>Corrections</dt><dd>${B.corrections.map(c=>esc(c)).join(', ')}</dd>`:''}</dl></div>
    ${B.exportedAt?`<div class="card stack tight" style="min-width:0"><div class="panel-h" style="margin:0"><h2>Export file</h2><button class="btn sm" data-act="copyCsv">Copy CSV</button></div><pre class="csv" id="csvout">${esc(csvOf(B))}</pre><p class="small muted">Re-exporting gives the same batch ID, lines and checksum. "Exported" is never shown as "paid".</p></div>`:''}</div>`:''}
  ${(P.history||[]).length?`<div class="card"><h2 style="margin-bottom:8px">Earlier pay periods</h2>${P.history.map(h=>`<div class="row small" style="justify-content:space-between;border-bottom:1px solid var(--line);padding:6px 0"><span class="mono">${esc(h.id)}</span><span>${esc(h.period)}</span><span class="mono">${money(h.total)}</span>${pill(h.status,'good')}</div>`).join('')}</div>`:''}`;
}
function payExItem(x){
  if(x.kind==='corr'){const c=x.c,v=V_(c.visit);return `<li><span class="sev warn"></span><div class="stack tight" style="flex:1;min-width:0"><div><b>Time correction request</b> · ${esc(S.staff[c.staff].name)} · ${esc(site(v).short)} ${fmtD(v.date)}</div>
    <div class="cmp" style="max-width:360px"><div><div class="label">${esc(c.field)} recorded</div><b class="mono">${esc(c.old)}</b></div><div class="new"><div class="label">Requested</div><b class="mono">${esc(c.new)}</b></div></div>
    <div class="small">"${esc(c.reason)}" · requested ${esc(c.at)}</div><input type="text" id="corrnote-${c.id}" placeholder="Supervisor note (required to reject)" aria-label="Supervisor note">
    <div class="row"><button class="btn sm primary" data-act="corrDecide" data-id="${c.id}" data-v="1">Approve (+${c.hours.toFixed(2)} h)</button><button class="btn sm danger" data-act="corrDecide" data-id="${c.id}" data-v="0">Reject</button></div></div></li>`}
  const v=x.v,a=allocsFor(v.id)[0];
  return `<li><span class="sev bad"></span><div class="stack tight" style="flex:1;min-width:0"><div><b>Missing check-out</b> · ${esc(S.staff[v.timeIssue.staff].name)} · ${esc(site(v).short)} ${fmtD(v.date)} ${v.start}–${v.end}</div>
    <div class="small muted">Checked in ${esc(v.checkin?v.checkin.capture:'')}. No check-out was received, so this time is held back from payroll.</div>
    <div class="grid2" style="gap:8px"><label class="f">Confirmed finish time<input type="time" id="mc-${v.id}" value="${a?a.end:v.end}"></label><label class="f">How it was confirmed<input type="text" id="mcr-${v.id}" placeholder="e.g. Site sign-out sheet"></label></div>
    <div class="row"><button class="btn sm primary" data-act="mcResolve" data-id="${v.id}">Resolve</button></div></div></li>`;
}
