/* Business: documents on the Verification tab */
function empDocsSection(s){const D=proDocs(s);const ina=proInactive(s);
  return `<section class="card stack"><div class="set-row"><h2>Documents</h2>${ina.length?pill('Inactive','bad'):D.some(d=>d.renewal&&d.renewal.status==='submitted')?pill('Renewal to check','info'):docsDue(s).length?pill('Renewal due','warn'):pill('All valid','good')}</div>
  ${ina.length?`<div class="note bad small"><b>Inactive.</b> ${esc(ina.map(d=>d.name).join(', '))} expired more than ${DOC_GRACE} days ago and hasn’t been renewed. ${esc(s.name.split(' ')[0])} can’t be given new jobs.</div>`:''}
  <div class="tablewrap"><table class="t"><thead><tr><th>Document</th><th>Uploaded</th><th>Expires</th><th>Status</th><th><span class="sr">Actions</span></th></tr></thead><tbody>
  ${D.map(d=>{const st=docState(d);const r=d.renewal;return `<tr><td><b>${esc(d.name)}</b><div class="small muted">${esc(d.type||'')} · ${esc(d.file||'')}</div>${r&&r.status==='submitted'?`<div class="small">Renewal sent ${esc(r.at)}: <b>${esc(r.file)}</b>${r.expires?` · expires ${fmtD(r.expires)} ${r.expires.slice(0,4)}`:''}${r.cert?` · certificate ••••${esc(r.cert.slice(-4))}`:''}${r.share?` · share code ${esc(r.share)}`:''}</div>`:''}</td>
    <td class="small">${d.uploaded?fmtD(d.uploaded)+' '+d.uploaded.slice(0,4):'–'}</td><td class="small">${d.expires?fmtD(d.expires)+' '+d.expires.slice(0,4):'No expiry'}</td><td>${pill(st.label,st.tone)}</td>
    <td class="num ls-acts">${r&&r.status==='submitted'?`<button class="btn sm ghost ls-del" data-act="pdReject" data-id="${s.id}" data-v="${d.k}">Send back</button><button class="btn sm primary" data-act="pdApprove" data-id="${s.id}" data-v="${d.k}">Approve renewal</button>`:['expired','lapsed','soon'].includes(st.k)?`<button class="btn sm ghost" data-act="pdRemind" data-id="${s.id}" data-v="${d.k}">Send reminder</button>`:''}</td></tr>`}).join('')}</tbody></table></div>
  <p class="small muted">Pros get a reminder 30 days before a document expires. After it expires they have ${DOC_GRACE} days to renew; after that they become inactive and can’t be given new jobs until a renewal is sent.</p></section>`}
const PD_ACT={
  pdApprove:e=>{const s=S.staff[e.id];const d=proDocs(s).find(x=>x.k===e.v);const r=d.renewal;d.file=r.file;d.uploaded=today();d.expires=r.expires||'';if(r.share)d.type='GOV.UK share code';d.renewal=null;
    if(e.v==='dbs'){s.cred={...s.cred,status:'verified',verified:r.iss||today(),expires:r.expires}}
    audit('Approved document renewal',`${s.name} · ${d.name}`,`Valid until ${d.expires?fmtD(d.expires):'no expiry'}`);notify(s.id,`${d.name} renewal approved.`);toast(`${d.name} renewed for ${s.name}.${proInactive(s).length?'':' They’re active again.'}`)},
  pdReject:e=>{S.modal={type:'pdReject',id:e.id,k:e.v}},
  pdRejectGo:()=>{const m=S.modal;const s=S.staff[m.id];const d=proDocs(s).find(x=>x.k===m.k);const r=val('pdr-why');if(r.length<8){setErr('pdr-err','Say what needs fixing (at least 8 characters).');return false}d.renewal={...d.renewal,status:'rejected',note:r};S.modal=null;audit('Sent document renewal back',`${s.name} · ${d.name}`,r);notify(s.id,`Please fix your ${d.name} renewal: ${r}`);toast('Sent back. The countdown continues until a valid renewal is sent.')},
  pdRemind:e=>{const s=S.staff[e.id];const d=proDocs(s).find(x=>x.k===e.v);notify(s.id,`Please renew your ${d.name} in the Pro app.`);audit('Sent renewal reminder',`${s.name} · ${d.name}`,'');toast(`Reminder sent to ${s.name}.`)}
};
const PD_MODALS={
  pdReject:m=>{const s=S.staff[m.id];const d=proDocs(s).find(x=>x.k===m.k);return {title:`Send back ${esc(d.name)} renewal?`,sub:esc(s.name),body:`<label class="f">What needs fixing<input type="text" id="pdr-why" placeholder="e.g. The photo is cut off; please retake it"></label><div id="pdr-err" class="ferr"></div>`,foot:'<button class="btn danger" data-act="pdRejectGo">Send back</button>'}}
};
