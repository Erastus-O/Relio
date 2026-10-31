/* EMPLOYEE MANAGEMENT */
function bizEmployees(){
  if(S.biz.empView&&S.staff[S.biz.empView])return empDetail(S.staff[S.biz.empView]);
  const ids=Object.keys(S.staff);const sel={id:null};
  const ready=ids.filter(id=>readiness(S.staff[id])[1]==='good').length;
  return `<div class="rota-top"><div><h1>Employee management</h1><p class="muted">${ids.length} people · ${ready} fully ready. Sensitive documents are restricted to the owner and hiring manager; customers only see a display name and verification status.</p></div><button class="btn primary" data-act="empInvite">Add employee</button></div>
  <div class="card tablewrap"><table class="t"><thead><tr><th>Employee</th><th>Type</th><th>Started</th><th>DBS check</th><th>Mandatory training</th><th>Readiness</th><th><span class="sr">Actions</span></th></tr></thead><tbody>
  ${ids.map(id=>{const s=S.staff[id];const [rl,rt]=readiness(s);const [cl,ct]=credLabel(s.cred);const mi=mandIssues(id);
    return `<tr class="click" data-act="empView" data-id="${id}" tabindex="0"><td><b>${esc(s.name)}</b><div class="small muted">${esc(s.role)} · <span class="mono">${empRef(id)}</span></div></td><td>${esc(s.type)}</td><td class="mono small">${s.start?fmtD(s.start).slice(4)+' '+s.start.slice(0,4):'–'}</td><td>${pill(cl,ct)}</td><td>${mi.length?pill(`${mi.length} outstanding`,'bad'):pill('Up to date','good')}</td><td>${pill(rl,rt)}</td><td><button class="btn sm" data-act="empView" data-id="${id}">View</button></td></tr>`}).join('')}
  </tbody></table></div>`;
}
