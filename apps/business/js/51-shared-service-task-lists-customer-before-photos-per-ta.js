/* SERVICE TASK LISTS, CUSTOMER BEFORE PHOTOS, PER-TASK PHOTOS */
const SVC_TASKS={
  regular:{max:20,rooms:{
    'Kitchen':[['Clean worktops and hob','after'],['Clean sink and taps'],['Wipe cupboard fronts'],['Wipe outside of appliances'],['Empty bins and replace liners'],['Mop floor']],
    'Bathroom':[['Clean toilet'],['Clean shower, bath and screen','pair'],['Clean basin and taps'],['Wipe mirrors and tiles'],['Mop floor']],
    'Living areas':[['Dust reachable surfaces'],['Vacuum floors and rugs'],['Tidy and plump cushions']],
    'Bedrooms':[['Dust surfaces'],['Vacuum floors'],['Make beds (change linen if left out)']]}},
  deep:{max:32,rooms:{
    'Kitchen':[['Degrease worktops and hob','after'],['Descale sink and taps'],['Clean inside cupboards (emptied)'],['Wipe cupboard fronts and handles'],['Clean behind movable appliances'],['Wipe outside of appliances'],['Scrub tiles and splashback grout'],['Wipe skirting boards'],['Empty, wash and reline bins'],['Mop floor, edges included']],
    'Bathroom':[['Clean toilet, including the base','after'],['Descale shower head and taps'],['Remove limescale from shower screen','pair'],['Clean bath and basin'],['Scrub tiles and grout'],['Polish mirrors'],['Clean extractor fan cover'],['Mop floor']],
    'Living areas':[['Dust high and low, including light fittings'],['Wipe skirting boards and door frames'],['Clean door handles and light switches'],['Vacuum under and behind furniture'],['Wipe windowsills'],['Vacuum sofa and cushions']],
    'Bedrooms':[['Dust all surfaces'],['Vacuum under beds'],['Wipe skirting boards'],['Wipe wardrobe fronts']]}},
  eot:{max:36,rooms:null}};
SVC_TASKS.eot.rooms=JSON.parse(JSON.stringify(SVC_TASKS.deep.rooms));
SVC_TASKS.eot.rooms.Kitchen.push(['Clean inside oven','pair'],['Clean inside fridge and freezer','after']);
SVC_TASKS.eot.rooms['Living areas'].push(['Clean interior windows']);
SVC_TASKS.eot.rooms.Bedrooms.push(['Clean inside wardrobes and drawers']);
const tkKey=(r,n)=>r+'|'+n;
function tkB(){return S.modal&&S.modal.type==='mktBook'?S.modal:S.book}
function tkCat(svc){const T=SVC_TASKS[svc];return T?Object.entries(T.rooms).flatMap(([r,L])=>L.map(([n,p])=>({room:r,name:n,photo:p||null,key:tkKey(r,n)}))):[]}
function tkSel(b){b.tsel=b.tsel||{};const s=b.tsel[b.svc]||(b.tsel[b.svc]={off:[],custom:[]});return s}
function tkCount(b){const s=tkSel(b);return tkCat(b.svc).filter(t=>!s.off.includes(t.key)).length+s.custom.length}
function bkTaskPicker(b){const T=SVC_TASKS[b.svc];if(!T)return '';const s=tkSel(b);const n=tkCount(b);const full=n>=T.max;const cat=tkCat(b.svc);
  return `<section class="tkp stack tight"><div class="set-row"><div><h3 style="margin:0">What’s included in your ${esc(SERVICES[b.svc].name.toLowerCase())}</h3><p class="small muted" style="margin:2px 0 0">Everything is ticked. Untick what you don’t need, or add your own tasks.</p></div><span class="tkp-n ${full?'full':''}" aria-live="polite"><b>${n}</b> of up to ${T.max} tasks</span></div>
    <div class="tkp-grid">${Object.keys(T.rooms).map(r=>{const L=cat.filter(t=>t.room===r);const cu=s.custom.map((c,i)=>({...c,i})).filter(c=>c.room===r);const on=L.filter(t=>!s.off.includes(t.key)).length+cu.length;
      return `<div class="tkp-room"><div class="row" style="justify-content:space-between"><span class="label" style="margin:0">${esc(r)}</span><span class="small muted">${on}/${L.length+cu.length}</span></div>
        ${L.map(t=>{const ch=!s.off.includes(t.key);return `<label class="tkp-t"><input type="checkbox" data-adch="tkToggle" value="${esc(t.key)}" ${ch?'checked':''} ${!ch&&full?'disabled title="You’ve reached the maximum for this service"':''}><span>${esc(t.name)}</span></label>`}).join('')}
        ${cu.map(c=>`<div class="tkp-t own"><span>✓</span><span>${esc(c.name)} <em>your task</em></span><button type="button" class="linkbtn small" data-act="tkDel" data-v="${c.i}" aria-label="Remove ${esc(c.name)}">Remove</button></div>`).join('')}</div>`}).join('')}</div>
    <div class="tkp-add row" style="gap:8px;align-items:flex-end">${full?`<p class="small muted" style="margin:0">You’ve reached the maximum of ${T.max} tasks for this service. Untick or remove a task to add another.</p>`:`<label class="f small" style="max-width:170px">Room<select id="tk-room">${Object.keys(T.rooms).map(r=>`<option>${esc(r)}</option>`).join('')}</select></label><label class="f small" style="flex:1;min-width:180px">Add your own task<input type="text" id="tk-name" maxlength="60" placeholder="e.g. Clean the conservatory floor"></label><button class="btn" data-act="tkAdd">Add task</button>`}</div><div id="tk-err" class="ferr"></div>
    <details class="small"><summary>Not included in this service</summary><ul style="margin:6px 0 0;padding-left:18px">${SERVICES[b.svc].exc.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details></section>`}
function bkBeforePhotos(b){const L=b.before||[];const rooms=SVC_TASKS[b.svc]?Object.keys(SVC_TASKS[b.svc].rooms):['Kitchen','Bathroom','Living areas','Bedrooms'];
  return `<div class="stack tight"><div class="label" style="margin-bottom:0">Photos of how it looks now <span class="muted" style="text-transform:none;letter-spacing:0;font-weight:400">(optional)</span></div><p class="small muted" style="margin:0">They help your cleaner plan, and they’re kept as the “before” record for your booking. Up to 6.</p>
    <div class="bp-grid">${L.map((p,i)=>`<figure class="bp"><img src="${p.src}" alt="Your photo ${i+1}"><select data-adch="bpRoom" data-i="${i}" aria-label="Room for photo ${i+1}">${rooms.concat(['Other']).map(r=>`<option ${p.room===r?'selected':''}>${esc(r)}</option>`).join('')}</select><button type="button" class="linkbtn small" data-act="bpDel" data-v="${i}">Remove</button></figure>`).join('')}
      ${L.length<6?`<label class="bp bp-add"><input type="file" accept="image/*" multiple data-bkimg="1" class="sr"><span>+ Add photos</span></label>`:''}</div><div id="bp-err" class="ferr"></div></div>`}
const TPH_COL={Kitchen:['#c9b79c','#8a6f4e'],Bathroom:['#a9c6cf','#4f7783'],'Open office':['#b9b6c9','#5d5875'],Kitchenette:['#c7c0a5','#7b7350'],Toilets:['#a8c3b4','#4c7360'],'Living room':['#cdb8a8','#7d5f4c'],'Living areas':['#cdb8a8','#7d5f4c'],Bedrooms:['#bfc2d6','#5d6385']};
function tphSample(room,name,kind){const [a,b]=TPH_COL[room]||['#bbb','#666'];const t=String(name).replace(/[<&>]/g,'');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/><rect x="0" y="250" width="600" height="150" fill="rgba(0,0,0,.18)"/><circle cx="470" cy="110" r="60" fill="rgba(255,255,255,.25)"/><rect x="60" y="150" width="240" height="110" rx="10" fill="rgba(255,255,255,.3)"/><rect x="330" y="200" width="200" height="60" rx="8" fill="rgba(255,255,255,.22)"/>${kind==='before'?'<g fill="rgba(60,40,20,.35)"><circle cx="120" cy="300" r="34"/><circle cx="200" cy="330" r="22"/><circle cx="420" cy="320" r="40"/><circle cx="500" cy="290" r="18"/><ellipse cx="180" cy="200" rx="60" ry="18"/></g><rect width="600" height="400" fill="rgba(70,55,30,.22)"/>':''}<text x="575" y="36" text-anchor="end" font-family="Arial" font-size="18" fill="rgba(255,255,255,.8)">Sample photo</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)}
function tphSeed(){if(S&&S.sites&&S.sites.nene&&S.flags&&!S.flags.tph4)S.sites.nene.photo='allowed';if(S&&S.visits&&S.flags&&!S.flags.tph5){S.flags.tph5=true;Object.values(S.visits).forEach(v=>{const st=site(v);if(!st||(v.photoPerm||st.photo)!=='allowed'||!['completed','submitted','partial'].includes(v.state))return;v.tasks.forEach(t=>{if(t.result==='done'&&!t.ev.some(e=>e.kind==='before')){const cap=(v.checkin&&v.checkin.capture)||`${fmtD(v.date)}, ${v.start}`;t.ev.unshift({id:'ev-'+(S.seq++),kind:'before',status:'synced',capture:cap,receipt:cap,checksum:'sha256:'+hex(),src:tphSample(t.room,t.name,'before'),extra:true})}})})}
  if(!S||!S.visits||(S.flags&&S.flags.tph4))return;S.flags.tph4=true;if(S.sites.nene){S.sites.nene.photo='allowed';S.sites.nene.needs='Confidential papers on desks. Photos of floors, bins, kitchen and toilets only, never of desks or papers. Do not move papers.'}
  Object.values(S.visits).forEach(v=>{const st=site(v);if(!st||st.photo!=='allowed')return;if(!['completed','submitted','partial'].includes(v.state))return;
    v.tasks.forEach(t=>{if(t.result==='done'&&!t.ev.some(e=>e.kind==='after')){const cap=(v.submission&&v.submission.at)||`${fmtD(v.date)}, ${v.end}`;t.ev.push({id:'ev-'+(S.seq++),kind:'after',status:'synced',capture:cap,receipt:cap,checksum:'sha256:'+hex(),src:tphSample(t.room,t.name,'after'),extra:true})}})});
  // customer's own before photos on Amara's most recent visit (linked to dispute D-301)
  const av=Object.values(S.visits).filter(v=>v.site==='amara'&&['completed','partial'].includes(v.state)).sort((a,b)=>b.date.localeCompare(a.date))[0];
  if(av&&!(av.custPhotos||[]).length){av.custPhotos=[{id:'cp1',room:'Kitchen',src:tphSample('Kitchen','Worktops and hob','before'),at:'when booking'},{id:'cp2',room:'Bathroom',src:tphSample('Bathroom','Shower screen','before'),at:'when booking'}];av.photoPerm='allowed'}}
function custPhotosBlock(v,opts={}){const L=v.custPhotos||[];const perm=(v.photoPerm||site(v).photo)==='allowed';
  return `<div class="stack tight"><div class="row" style="justify-content:space-between"><span class="label" style="margin:0">${opts.title||'Customer’s photos before the visit'}</span>${pill(perm?'Photos allowed':'No photos allowed',perm?'good':'warn')}</div>
    ${L.length?`<div class="bp-grid">${L.map(p=>`<figure class="bp ro"><img src="${p.src}" alt="Customer photo: ${esc(p.room)}"><figcaption class="small"><b>Before</b> · ${esc(p.room)}${p.at?` · sent ${esc(p.at)}`:''}</figcaption></figure>`).join('')}</div>`:`<p class="small muted" style="margin:0">The customer didn’t add photos when booking.</p>`}
    ${perm?'':'<p class="small muted" style="margin:0">The customer asked for no photos, so the cleaner records the checklist only and a supervisor confirms it.</p>'}</div>`}
const TK_ACT={
  tkToggle:e=>{const b=tkB();const s=tkSel(b);const k=e.value;if(e.checked){if(tkCount(b)>=SVC_TASKS[b.svc].max){toast(`You can have up to ${SVC_TASKS[b.svc].max} tasks.`);return}s.off=s.off.filter(x=>x!==k)}else if(!s.off.includes(k))s.off.push(k)},
  tkAdd:()=>{const b=tkB();const T=SVC_TASKS[b.svc];if(!T)return false;const s=tkSel(b);const n=val('tk-name').trim();const room=document.getElementById('tk-room').value;
    if(n.length<3){setErr('tk-err','Describe the task (at least 3 characters).');return false}if(tkCount(b)>=T.max){setErr('tk-err',`You can have up to ${T.max} tasks for this service.`);return false}
    if(tkCat(b.svc).some(t=>t.room===room&&t.name.toLowerCase()===n.toLowerCase())||s.custom.some(c=>c.room===room&&c.name.toLowerCase()===n.toLowerCase())){setErr('tk-err','That task is already on the list.');return false}
    s.custom.push({room,name:n})},
  tkDel:e=>{tkSel(tkB()).custom.splice(+e.v,1)},
  bpRoom:e=>{tkB().before[+e.i].room=e.value},
  bpDel:e=>{tkB().before.splice(+e.v,1)},
  mkSvc:e=>{S.modal.svc=e.value},
  mkPhoto:e=>{S.modal.photo=e.value},
  mkTasksNext:()=>{const m=S.modal;if(tkCount(m)<1){setErr('tk-err','Choose at least one task.');return false}m.step='form'},
  mkTasksBack:()=>{S.modal.step='tasks'}
};
