/* PAYROLL REPORTS (weekly / monthly / yearly) */
const PR_START='2026-06-01';
function prMonday(d){const w=dt(d).getDay();return addDays(d,-((w+6)%7))}
function prDaily(){const out={};const t=today();
  Object.values(S.staff).forEach(s=>{empPayHistory(s).forEach(h=>{const days=[];for(let d=h.from;d<=h.to;d=addDays(d,1)){if(d>t)break;if(s.start&&d<s.start)continue;if(s.avail&&s.avail.days&&!s.avail.days.includes(dt(d).getDay()))continue;days.push(d)}
      if(!days.length||!h.gross)return;const wts=days.map((d,i)=>1+(((i*13+s.id.charCodeAt(1)*7)%9)-4)*.06);const W=wts.reduce((a,b)=>a+b,0);
      days.forEach((d,i)=>{const f=wts[i]/W;(out[s.id]=out[s.id]||[]).push({d,hours:h.hours*f,gross:h.gross*f,tax:h.tax*f,ni:h.ni*f,loan:h.loan*f,net:h.net*f,paid:h.status==='Paid',pay:h.pay,erni:Math.max(0,h.gross-Math.round(500000/24))*.15*f})})})});
  return out}
function prOptions(type){const t=today();const o=[];
  if(type==='week'){for(let w=prMonday(t);w>=prMonday(PR_START);w=addDays(w,-7))o.push([w,`${fmtD(w).slice(4)} – ${fmtD(addDays(w,6)).slice(4)} ${addDays(w,6).slice(0,4)}${w===prMonday(t)?' (this week)':''}`,w,addDays(w,6)])}
  if(type==='month'){let m=t.slice(0,7);while(m>=PR_START.slice(0,7)){const a=m+'-01';const nx=(+m.slice(5)===12?(+m.slice(0,4)+1)+'-01':m.slice(0,5)+String(+m.slice(5)+1).padStart(2,'0'))+'-01';o.push([m,new Date(a+'T12:00').toLocaleDateString('en-GB',{month:'long',year:'numeric'})+(m===t.slice(0,7)?' (so far)':''),a,addDays(nx,-1)]);m=addDays(a,-1).slice(0,7)}}
  if(type==='year'){o.push(['ty2026','Tax year 2026/27 (6 Apr 2026 – 5 Apr 2027)','2026-04-06','2027-04-05'],['cy2026','Calendar year 2026','2026-01-01','2026-12-31'])}
  return o}
function prBuild(R){const opt=prOptions(R.type).find(x=>x[0]===R.key)||prOptions(R.type)[0];const [,label,a,b0]=opt;const b=b0>today()?today():b0;const D=prDaily();const rows=[];
  const ids=R.staff==='all'?Object.keys(S.staff):[R.staff];
  ids.forEach(id=>{const L=(D[id]||[]).filter(x=>x.d>=a&&x.d<=b);if(!L.length)return;const r={id,hours:0,gross:0,tax:0,ni:0,loan:0,net:0,erni:0,unpaid:0};L.forEach(x=>{['hours','gross','tax','ni','loan','net','erni'].forEach(k=>r[k]+=x[k]);if(!x.paid)r.unpaid+=x.net});
    ['gross','tax','ni','loan','net','erni','unpaid'].forEach(k=>r[k]=Math.round(r[k]));r.hours=Math.round(r.hours*4)/4;rows.push(r)});
  const tot=rows.reduce((T,r)=>{['hours','gross','tax','ni','loan','net','erni','unpaid'].forEach(k=>T[k]+=r[k]);return T},{hours:0,gross:0,tax:0,ni:0,loan:0,net:0,erni:0,unpaid:0});
  // breakdown buckets: week→day, month→week, year→month
  const bk={};const keyOf=d=>R.type==='week'?d:R.type==='month'?prMonday(d):d.slice(0,7);
  ids.forEach(id=>(D[id]||[]).filter(x=>x.d>=a&&x.d<=b).forEach(x=>{const k=keyOf(x.d);const B=bk[k]||(bk[k]={gross:0,hours:0});B.gross+=x.gross;B.hours+=x.hours}));
  const blabel=k=>R.type==='week'?fmtD(k):R.type==='month'?`Week of ${fmtD(k<a?a:k).slice(4)}`:new Date(k+'-01T12:00').toLocaleDateString('en-GB',{month:'short',year:'numeric'});
  const breakdown=Object.keys(bk).sort().map(k=>({k,label:blabel(k),gross:Math.round(bk[k].gross),hours:Math.round(bk[k].hours*4)/4}));
  return {label,a,b,rows,tot,breakdown,staffLabel:R.staff==='all'?'All employees':S.staff[R.staff].name}}
function prCsv(rep){const h='employee_ref,employee,hours,gross_gbp,income_tax_gbp,employee_ni_gbp,student_loan_gbp,net_pay_gbp,employer_ni_gbp,total_cost_gbp';const f=p=>(p/100).toFixed(2);
  return [`# Payroll report,${rep.label},${rep.a} to ${rep.b},${rep.staffLabel}`,h].concat(rep.rows.map(r=>[empRef(r.id),S.staff[r.id].name,r.hours.toFixed(2),f(r.gross),f(r.tax),f(r.ni),f(r.loan),f(r.net),f(r.erni),f(r.gross+r.erni)].join(','))).concat([['','Total',rep.tot.hours.toFixed(2),f(rep.tot.gross),f(rep.tot.tax),f(rep.tot.ni),f(rep.tot.loan),f(rep.tot.net),f(rep.tot.erni),f(rep.tot.gross+rep.tot.erni)].join(',')]).join('\n')}
function payReports(){const R=S.biz.prep||(S.biz.prep={type:'month',key:today().slice(0,7),staff:'all'});const opts=prOptions(R.type);if(!opts.some(o=>o[0]===R.key))R.key=opts[0][0];
  const gen=S.biz.prepGen;const rep=gen?prBuild(gen):null;const hist=S.payReports||[];
  const max=rep?Math.max(1,...rep.breakdown.map(x=>x.gross)):1;
  return `<section class="card stack"><div class="panel-h" style="margin:0"><h2>Generate a payroll report</h2></div>
    <div class="pr-seg" role="group" aria-label="Report type">${[['week','Weekly'],['month','Monthly'],['year','Yearly']].map(([k,l])=>`<button class="${R.type===k?'on':''}" aria-pressed="${R.type===k}" data-act="prType" data-v="${k}">${l}</button>`).join('')}</div>
    <div class="grid2"><label class="f">${R.type==='week'?'Week':R.type==='month'?'Month':'Year'}<select data-adch="prKey">${opts.map(o=>`<option value="${o[0]}" ${o[0]===R.key?'selected':''}>${esc(o[1])}</option>`).join('')}</select></label>
      <label class="f">Employees<select data-adch="prStaff"><option value="all">All employees</option>${Object.values(S.staff).map(s=>`<option value="${s.id}" ${R.staff===s.id?'selected':''}>${esc(s.name)}</option>`).join('')}</select></label></div>
    <div class="row"><button class="btn primary" data-act="prGen">Generate report</button><span class="small muted">Covers pay from ${fmtD(PR_START)} ${PR_START.slice(0,4)}, when payroll started on the platform.</span></div></section>
  ${rep?`<section class="card stack" id="pr-report"><div class="set-row" style="align-items:flex-start"><div><h2 style="margin:0">Payroll report · ${esc(rep.label)}</h2><p class="small muted" style="margin:2px 0 0">${fdY(rep.a)} to ${fdY(rep.b)} · ${esc(rep.staffLabel)} · generated ${esc(gen.at)}</p></div>
      <div class="row pr-noprint"><button class="btn sm" data-act="prCsv">Download CSV</button><button class="btn sm" data-act="prPrint">Print or save as PDF</button></div></div>
    <div class="pr-tiles">${[['Gross pay',rep.tot.gross],['Net pay',rep.tot.net],['Tax and NI deducted',rep.tot.tax+rep.tot.ni+rep.tot.loan],['Employer NI',rep.tot.erni],['Total employment cost',rep.tot.gross+rep.tot.erni]].map(([l,v])=>`<div><span>${l}</span><b>${money(v)}</b></div>`).join('')}<div><span>Hours paid</span><b>${rep.tot.hours.toFixed(2)}</b></div></div>
    ${rep.tot.unpaid?`<div class="note info small">${money(rep.tot.unpaid)} of net pay in this report is for the current pay period and hasn’t been paid yet. It’s due on ${fmtD(S.payroll.period.pay)}.</div>`:''}
    <div class="tablewrap"><table class="t"><thead><tr><th>Employee</th><th class="num">Hours</th><th class="num">Gross</th><th class="num">Income tax</th><th class="num">Employee NI</th><th class="num">Student loan</th><th class="num">Net pay</th><th class="num">Employer NI</th></tr></thead><tbody>
      ${rep.rows.map(r=>`<tr><td>${esc(S.staff[r.id].name)}<div class="small muted mono">${empRef(r.id)}</div></td><td class="num mono">${r.hours.toFixed(2)}</td><td class="num mono">${money(r.gross)}</td><td class="num mono">${money(r.tax)}</td><td class="num mono">${money(r.ni)}</td><td class="num mono">${money(r.loan)}</td><td class="num mono"><b>${money(r.net)}</b></td><td class="num mono">${money(r.erni)}</td></tr>`).join('')||'<tr><td colspan="8" class="muted">No pay in this period.</td></tr>'}
      ${rep.rows.length?`<tr class="pr-tot"><td><b>Total</b></td><td class="num mono"><b>${rep.tot.hours.toFixed(2)}</b></td><td class="num mono"><b>${money(rep.tot.gross)}</b></td><td class="num mono"><b>${money(rep.tot.tax)}</b></td><td class="num mono"><b>${money(rep.tot.ni)}</b></td><td class="num mono"><b>${money(rep.tot.loan)}</b></td><td class="num mono"><b>${money(rep.tot.net)}</b></td><td class="num mono"><b>${money(rep.tot.erni)}</b></td></tr>`:''}</tbody></table></div>
    ${rep.breakdown.length>1?`<div class="stack tight"><h3 style="margin:0;font-size:15px">Gross pay by ${gen.type==='week'?'day':gen.type==='month'?'week':'month'}</h3>${rep.breakdown.map(x=>`<div class="pr-bar"><span>${esc(x.label)}</span><div><i style="width:${Math.max(2,x.gross/max*100)}%"></i></div><b class="mono">${money(x.gross)}</b></div>`).join('')}</div>`:''}
    <p class="small muted" style="margin:0">Tax, NI and student loan come from your payroll provider’s figures for each pay period, split by the days worked. Employer NI is an estimate at 15% above the secondary threshold. Use your provider’s payslips and P60s for HMRC.</p></section>`:''}
  ${hist.length?`<section class="card"><h2 style="margin-bottom:8px">Recent reports</h2>${hist.slice(0,6).map((h,i)=>`<div class="row small" style="justify-content:space-between;border-bottom:1px solid var(--line);padding:6px 0;gap:8px"><span><b>${esc(h.label)}</b> · ${esc(h.staffLabel)}</span><span class="muted">${esc(h.at)}</span><button class="btn sm ghost" data-act="prRepOpen" data-v="${i}">Open</button></div>`).join('')}</section>`:''}`}
const PR_ACT={
  prType:e=>{const R=S.biz.prep;R.type=e.v;R.key=prOptions(e.v)[0][0]},
  prKey:e=>{S.biz.prep.key=e.value},
  prStaff:e=>{S.biz.prep.staff=e.value},
  prGen:()=>{const R=S.biz.prep;const g={...R,at:stamp()};S.biz.prepGen=g;const rep=prBuild(g);S.payReports=S.payReports||[];S.payReports.unshift({...g,label:rep.label,staffLabel:rep.staffLabel});S.payReports=S.payReports.slice(0,10);audit('Generated payroll report',rep.label,rep.staffLabel);toast('Report ready.')},
  prRepOpen:e=>{const h=S.payReports[+e.v];S.biz.prepGen={type:h.type,key:h.key,staff:h.staff,at:h.at};S.biz.prep={type:h.type,key:h.key,staff:h.staff}},
  prCsv:()=>{const rep=prBuild(S.biz.prepGen);const blob=new Blob([prCsv(rep)],{type:'text/csv'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=`payroll-report-${rep.a}-to-${rep.b}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);toast('CSV downloaded.');return false},
  prPrint:()=>{document.body.classList.add('print-rep');setTimeout(()=>{window.print();document.body.classList.remove('print-rep')},50);return false},
  payTab:e=>{S.biz.payTab=e.v}
};
