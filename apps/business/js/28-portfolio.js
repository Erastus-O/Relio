/* PORTFOLIO (business uploads, customer profile gallery) */
function pfSrc(x){return x&&x.startsWith('pf:')?PF_IMG[x.slice(3)]:x}
function pfInit(){mktInit();if(S.mkt.portfolio)return S.mkt.portfolio;
  S.mkt.portfolio={ff:[
    {id:'PF-1',title:'Child’s bedroom reset',svc:'L-ff-deep',area:'Crowland',date:'2026-09-18',before:'pf:bedBefore',after:'pf:bedAfter',caption:'Toys sorted, bed made, floors vacuumed and surfaces wiped. About 2 hours.',status:'published'},
    {id:'PF-2',title:'Main bedroom, regular clean',svc:'L-ff-reg',area:'Market Deeping',date:'2026-09-30',before:'',after:'pf:master',caption:'Weekly clean: linen changed, floors vacuumed, dusting throughout.',status:'published'},
    {id:'PF-3',title:'Guest room before handover',svc:'L-ff-eot',area:'Spalding',date:'2026-08-27',before:'',after:'pf:guest',caption:'End of tenancy clean ready for the landlord’s inventory check.',status:'published'}]};
  return S.mkt.portfolio}
function pfItems(prov,all){const P=pfInit();return (P[prov]||[]).filter(x=>all||x.status==='published').sort((a,b)=>b.date.localeCompare(a.date))}
function pfSvcName(it){const l=S.mkt.listings.find(x=>x.id===it.svc);return l?l.name:(it.svcName||'')}
function pfTile(it,act){return `<button class="pf-tile" data-act="${act}" data-v="${it.id}" aria-label="Open ${esc(it.title)}">
  <span class="pf-img ${it.before?'pair':''}">${it.before?`<span><img src="${pfSrc(it.before)}" alt="" loading="lazy"><i>Before</i></span>`:''}<span><img src="${pfSrc(it.after)}" alt="" loading="lazy">${it.before?'<i>After</i>':''}</span></span>
  <span class="pf-cap"><b>${esc(it.title)}</b><span class="small muted">${esc(pfSvcName(it))}${it.area?' · '+esc(it.area):''} · ${fmtD(it.date)} ${it.date.slice(0,4)}</span></span></button>`}
function pfGallery(prov,name){const its=pfItems(prov);
  return `<section class="card stack"><div class="set-row"><h2>Work by ${esc(name)}</h2><span class="small muted">${its.length} project${its.length===1?'':'s'}</span></div>
  ${its.length?`<div class="pf-grid">${its.map(it=>pfTile(it,'pfView')).join('')}</div><p class="small muted">Photos are uploaded by the business. Customers’ faces, names and house numbers are never shown.</p>`:'<div class="empty">No portfolio photos yet.</div>'}</section>`}
function pfManage(){const its=pfItems(bizTenant(),true);
  return `<section class="card stack"><div class="set-row"><div><h2>Portfolio</h2><p class="small muted">Photos of work you’ve done. Customers see these on your public profile.</p></div><button class="btn primary" data-act="pfNew">Add work</button></div>
  ${its.length?`<div class="pf-grid">${its.map(it=>`<div class="pf-card ${it.status==='hidden'?'off':''}">${pfTile(it,'pfEdit')}<span class="pf-badge">${it.status==='hidden'?pill('Hidden'):pill('On profile','good')}</span><div class="row small pf-acts"><button class="btn sm ghost" data-act="pfToggle" data-v="${it.id}">${it.status==='hidden'?'Show':'Hide'}</button><button class="btn sm ghost" data-act="pfEdit" data-v="${it.id}">Edit</button><button class="btn sm ghost ls-del" data-act="pfDel" data-v="${it.id}">Delete</button></div></div>`).join('')}</div>`:'<div class="empty">No work added yet. Add before and after photos to show customers what you do.</div>'}</section>`}
let PF_TMP={};
function pfShrink(file,cb){if(!file||!/^image\//.test(file.type)){cb(null,'Choose a JPG or PNG image.');return}if(file.size>15*1024*1024){cb(null,'That image is over 15 MB.');return}
  const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,900/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',0.75))};im.onerror=()=>cb(null,'We couldn’t read that image.');im.src=r.result};r.readAsDataURL(file)}
function pfSlot(k,label,cur,req){return `<div class="pf-slot"><span class="small"><b>${label}</b>${req?'':' <span class="muted">(optional)</span>'}</span><label class="pf-drop" id="pf-prev-${k}">${cur?`<img src="${pfSrc(cur)}" alt="">`:'<span class="small muted">Choose a photo</span>'}<input type="file" accept="image/*" data-pfimg="${k}" class="sr"></label>${cur&&!req?`<button class="linkbtn small" data-act="pfClearImg" data-v="${k}">Remove</button>`:''}</div>`}
const PF_ACT={
  pfView:e=>{S.modal={type:'pfView',id:e.v}},
  pfNew:()=>{PF_TMP={};S.modal={type:'pfForm'}},
  pfEdit:e=>{const it=pfItems(bizTenant(),true).find(x=>x.id===e.v);PF_TMP={before:it.before,after:it.after};S.modal={type:'pfForm',id:e.v}},
  pfClearImg:e=>{PF_TMP[e.v]='';const el=document.getElementById('pf-prev-'+e.v);if(el){el.querySelector('img')&&el.querySelector('img').remove();el.insertAdjacentHTML('afterbegin','<span class="small muted">Choose a photo</span>')}return false},
  pfSave:e=>{const title=val('pf-title');const svc=document.getElementById('pf-svc').value;const area=val('pf-area');const date=val('pf-date');const cap=val('pf-cap');
    if(title.length<3){setErr('pf-err','Give the job a short title.');return false}
    if(!PF_TMP.after){setErr('pf-err','Add a photo of the finished work.');return false}
    if(!date||date>today()){setErr('pf-err','Choose the date the work was done (not in the future).');return false}
    if(!document.getElementById('pf-ok').checked){setErr('pf-err','Confirm you have the customer’s permission and nothing personal is visible.');return false}
    const L=(pfInit()[bizTenant()]=pfInit()[bizTenant()]||[]);let it=S.modal.id?L.find(x=>x.id===S.modal.id):null;
    const data={title,svc,area,date,caption:cap,before:PF_TMP.before||'',after:PF_TMP.after};
    if(it)Object.assign(it,data);else{it={id:'PF-'+Date.now().toString(36),status:'published',...data};L.push(it)}
    const isNew=!S.modal.id;S.modal=null;PF_TMP={};audit(isNew?'Added portfolio work':'Edited portfolio work',title,'Shown on public profile');toast(isNew?'Added to your portfolio. Customers can see it on your profile.':'Saved.')},
  pfToggle:e=>{const it=pfItems(bizTenant(),true).find(x=>x.id===e.v);it.status=it.status==='hidden'?'published':'hidden';audit(it.status==='hidden'?'Hid portfolio work':'Showed portfolio work',it.title,'');toast(it.status==='hidden'?'Hidden from your profile.':'Shown on your profile.')},
  pfDel:e=>{S.modal={type:'pfDel',id:e.v}},
  pfDelGo:e=>{const L=(pfInit()[bizTenant()]=pfInit()[bizTenant()]||[]);const i=L.findIndex(x=>x.id===e.v);const it=L[i];L.splice(i,1);S.modal=null;audit('Deleted portfolio work',it.title,'');toast('Deleted from your portfolio.')}
};
const PF_MODALS={
  pfView:m=>{let it=null,prov=null;Object.entries(pfInit()).forEach(([k,a])=>{const f=a.find(x=>x.id===m.id);if(f){it=f;prov=k}});const P=S.mkt.prov[prov];
    return {title:esc(it.title),sub:`${esc(P.name)} · ${esc(pfSvcName(it))}${it.area?' · '+esc(it.area):''} · ${fmtD(it.date)} ${it.date.slice(0,4)}`,wide:true,
      body:`<div class="pf-big ${it.before?'pair':''}">${it.before?`<figure><img src="${pfSrc(it.before)}" alt="Before: ${esc(it.title)}"><figcaption>Before</figcaption></figure>`:''}<figure><img src="${pfSrc(it.after)}" alt="${it.before?'After: ':''}${esc(it.title)}">${it.before?'<figcaption>After</figcaption>':''}</figure></div>${it.caption?`<p>${esc(it.caption)}</p>`:''}`,closeLabel:'Close'}},
  pfForm:m=>{const it=m.id?pfItems(bizTenant(),true).find(x=>x.id===m.id):null;const ls=S.mkt.listings.filter(l=>l.prov===bizTenant());
    return {title:it?'Edit work':'Add work to your portfolio',sub:'Shown on your public profile',wide:true,
      body:`<div class="pf-slots">${pfSlot('before','Before',PF_TMP.before,false)}${pfSlot('after','After',PF_TMP.after,true)}</div>
      <label class="f">Title<input type="text" id="pf-title" value="${it?esc(it.title):''}" placeholder="e.g. Kitchen deep clean"></label>
      <div class="grid2"><label class="f">Service<select id="pf-svc">${ls.map(l=>`<option value="${l.id}" ${it&&it.svc===l.id?'selected':''}>${esc(l.name)}</option>`).join('')}</select></label><label class="f">Date done<input type="date" id="pf-date" max="${today()}" value="${it?it.date:today()}"></label></div>
      <label class="f">Town or area <span class="hint">Town only. Never a street or house number.</span><input type="text" id="pf-area" value="${it?esc(it.area):''}" placeholder="e.g. Crowland"></label>
      <label class="f">What you did (optional)<textarea id="pf-cap" rows="2" placeholder="e.g. Oven, hob and extractor degreased. About 3 hours.">${it?esc(it.caption||''):''}</textarea></label>
      <label class="row small"><input type="checkbox" id="pf-ok" ${it?'checked':''}> The customer agreed to these photos being shared, and no people, names, documents or house numbers are visible.</label><div id="pf-err" class="ferr"></div>`,
      foot:`<button class="btn primary" data-act="pfSave">${it?'Save changes':'Add to portfolio'}</button>`}},
  pfDel:m=>{const it=pfItems(bizTenant(),true).find(x=>x.id===m.id);return {title:`Delete “${esc(it.title)}”?`,sub:'This can’t be undone.',body:'<p class="small">The photos are removed from your profile and from the platform. To keep them but stop showing them, use Hide.</p>',foot:`<button class="btn danger" data-act="pfDelGo" data-v="${it.id}">Delete</button>`}}
};
