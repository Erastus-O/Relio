/* actions */
const ACT={
  surface:e=>{S.surface=e.v;S.modal=null},
  reset:()=>{try{localStorage.removeItem(KEY)}catch(x){}buildSeed();toast('Demo reset to sample data')},
  biz:e=>{if(S.agentOpen&&window.innerWidth<900)S.agentOpen=false;if(e.v==='pricing')S.prDraft=JSON.parse(JSON.stringify(S.pricing));S.biz.invView=null;S.biz.invDraft=null;S.biz.visitView=null;S.biz.empView=null;S.biz.empReveal=null;S.biz.clientView=null;S.biz.clientReveal=null;if(e.v==='invoices'){S.biz.view='bookings';S.biz.bkTab='invoices'}else S.biz.view=e.v},
  period:e=>{S.biz.period=e.v},
  prOpen:()=>{S.prDraft=JSON.parse(JSON.stringify(S.pricing));S.biz.view='pricing';phInit();S.ph.tab='setup';window.scrollTo(0,0)},
  prAreaAdd:()=>{const z=val('pr-area-new').toUpperCase().replace(/\s/g,'');if(!/^[A-Z]{1,2}\d[A-Z\d]?$/.test(z)){setErr('pr-area-err','Enter a postcode district, like PE13.');return false}if(S.settings.zones.includes(z)||S.prDraft.area.outer.some(o=>o.d===z)){setErr('pr-area-err',`${z} is already covered.`);return false}S.prDraft.area.outer.push({d:z,fee:1000})},
  prAreaDel:e=>{S.prDraft.area.outer.splice(+e.v,1)},
  prAddonForm:()=>{S.prAddonForm=!S.prAddonForm},
  prAddonAdd:()=>{const D=S.prDraft;const n=val('pra-name');const pr=parseFloat(val('pra-price'));const mins=parseInt(val('pra-mins'))||0;
    if(n.length<3){setErr('pra-err','Name the add-on.');return false}if(!(pr>=0)||val('pra-price')===''){setErr('pra-err','Enter a price.');return false}if(pr>1000){setErr('pra-err','Check the price.');return false}
    const all=[...Object.values(ADDONS).map(a=>a.name),...(D.customAddons||[]).map(c=>c.name)];if(all.some(x=>x.toLowerCase().replace(/ \(.*\)/,'')===n.toLowerCase())){setErr('pra-err','You already have an add-on with that name.');return false}
    const k='x_'+Date.now().toString(36);(D.customAddons=D.customAddons||[]).push({k,name:n});D.extras[k]=Math.round(pr*100);D.addonMeta[k]={unit:document.getElementById('pra-unit').value,mins,review:document.getElementById('pra-rev').checked};
    S.prAddonForm=false;toast(`${n} added. Publish the price list to make it live.`)},
  prAddonDel:e=>{const D=S.prDraft;const c=(D.customAddons||[]).find(x=>x.k===e.v);D.customAddons=D.customAddons.filter(x=>x.k!==e.v);delete D.extras[e.v];delete D.addonMeta[e.v];toast(`${c?c.name:'Add-on'} removed. Publish the price list to apply it.`)},
  prCancel:()=>{S.prDraft=null;phInit();S.ph.tab='overview'},
  prPreset:()=>{const keep={costs:S.prDraft.costs,version:S.prDraft.version,history:S.prDraft.history,models:S.prDraft.models,vat:S.prDraft.vat};S.prDraft=Object.assign(pricingPreset(S.prDraft.region),keep);toast(`Suggested ${REGION[S.prDraft.region].label} rates filled in. Review, then save.`)},
  prSave:()=>{const D=S.prDraft;const bad=[];const walk=(o,p)=>Object.entries(o).forEach(([k,v])=>{if(typeof v==='number'&&(isNaN(v)||v<0))bad.push(p+k);else if(v&&typeof v==='object'&&!Array.isArray(v))walk(v,p+k+'.')});walk(D,'');
    if(bad.length){setErr('prerr','Some values are missing or negative. Check the highlighted fields.');bad.forEach(p=>{const el=document.getElementById('pr-'+p.replace(/\./g,'-'));if(el)el.classList.add('err')});return false}
    if(D.costs.margin>=90){setErr('prerr','Target margin must be below 90%.');return false}
    const old=S.pricing;const ch=[];if(old.region!==D.region)ch.push('region '+REGION[D.region].label);if(old.hourly.regular!==D.hourly.regular)ch.push(`regular ${money(old.hourly.regular)} → ${money(D.hourly.regular)}/h`);if(old.models.regular!==D.models.regular)ch.push('regular priced '+({perroom:'per room',hourly:'hourly',fixed:'fixed per visit'}[D.models.regular]));if(JSON.stringify(old.fixed.regular)!==JSON.stringify(D.fixed.regular))ch.push('regular rate card');if(JSON.stringify(old.costs)!==JSON.stringify(D.costs))ch.push('costs');if(JSON.stringify(old.condition)!==JSON.stringify(D.condition))ch.push('condition rules');if(JSON.stringify(old.area)!==JSON.stringify(D.area))ch.push('travel areas');if(JSON.stringify(old.adj)!==JSON.stringify(D.adj))ch.push('discounts and minimum');if(old.models.deep!==D.models.deep)ch.push('deep clean '+D.models.deep);if(old.costs.margin!==D.costs.margin)ch.push(`target margin ${D.costs.margin}%`);if(old.vat.registered!==D.vat.registered)ch.push(D.vat.registered?'VAT registered':'not VAT registered');
    D.version=(old.version||0)+1;D.history=[{v:D.version,at:stamp(),by:ME_BIZ,changes:ch.join('; ')||'Rates updated'}].concat(old.history||[]);
    S.pricing=JSON.parse(JSON.stringify(D));S.prDraft=null;S.biz.view='pricing';phInit();S.ph.tab='overview';audit(`Published price list v${D.version}`,ch.join('; ')||'Rates updated','Applies to new quotes and bookings only');
    toast(`Price list v${D.version} saved. New bookings use it; Finance now uses your costs.`)},
  bkTab:e=>{S.biz.bkTab=e.v;S.biz.invView=null;S.biz.invDraft=null;S.biz.visitView=null},
  visitOpen:e=>{S.biz.view='bookings';S.biz.bkTab='visits';S.biz.visitView=e.id;S.biz.invView=null;S.biz.invDraft=null;S.modal=null},
  visitBack:()=>{S.biz.visitView=null},
  reviewGo:e=>{S.biz.view='quality';S.biz.reviewId=e.id},
  invNew:e=>{const cid=e.id&&S.customers[e.id]?e.id:'harbour';const C=S.customers[cid];
    const d={id:'inv-'+(S.seq++),no:null,customer:cid,status:'draft',from:today().slice(0,8)+'01',to:today(),group:C.type==='commercial',terms:C.termsDays!=null?C.termsDays:14,po:'',notes:'',extra:[],visitIds:[],created:stamp(),payments:[],reminders:[],paid:0};
    d.visitIds=availVisits(d).map(v=>v.id);S.invoices.push(d);S.biz.view='bookings';S.biz.bkTab='invoices';S.biz.invDraft=d.id;S.biz.invView=null},
  invEdit:e=>{S.biz.invDraft=e.id;S.biz.invView=null},
  invOpen:e=>{S.biz.view='bookings';S.biz.bkTab='invoices';S.biz.invView=e.id;S.biz.invDraft=null},
  invBack:()=>{S.biz.invView=null},
  invCloseBuilder:()=>{S.biz.invDraft=null;toast('Draft saved. Clients can\'t see drafts.')},
  invDeleteDraft:()=>{S.invoices=S.invoices.filter(i=>i.id!==S.biz.invDraft);S.biz.invDraft=null;toast('Draft deleted')},
  invAddLine:()=>{const d=invById(S.biz.invDraft);const desc=val('x-desc'),q=parseInt(val('x-qty'),10),u=Math.round(parseFloat(val('x-unit'))*100);
    if(!desc||!(q>0)||isNaN(u)){setErr('inverr2','Add a description, a quantity of 1 or more, and a unit price.');return false}d.extra.push({desc,qty:q,unit:u})},
  invDelLine:e=>{invById(S.biz.invDraft).extra.splice(+e.i,1)},
  invIssue:()=>{const d=invById(S.biz.invDraft);const C=S.customers[d.customer];const T=invTotals(d);
    if(!T.lines.length){setErr('inverr2','Select at least one visit or add a line.');return false}
    if(T.total<=0){setErr('inverr2','The invoice total must be more than £0.00.');return false}
    if(C.poRequired&&!(d.po||'').trim()){setErr('inverr2',`${C.name} requires a purchase order number on every invoice.`);document.getElementById('inv-po').classList.add('err');return false}
    d.lines=T.lines;d.prepaid=T.pre;d.no='INV-2026-'+String(S.invSeq++).padStart(4,'0');d.issued=today();d.due=addDays(today(),d.terms);d.status=T.bal<=0?'paid':'issued';
    d.visitIds.forEach(id=>{V_(id).invoiceId=d.id});const bc=billContact(C);
    S.notifs.unshift({id:'n-'+(S.seq++),to:bc.email||bc.name,text:`Invoice ${d.no} issued: ${money(T.total)}${d.terms?', due '+fmtD(d.due):''}.`,status:'sent',at:stamp()});
    audit('Issued invoice',`${d.no} · ${C.name} · ${money(T.total)}`,`${d.visitIds.length} visits${d.extra.length?' + '+d.extra.length+' extra line(s)':''}`);event('invoice.issued',d.no);
    S.biz.invDraft=null;S.biz.invView=d.id;toast(`${d.no} issued and sent to ${bc.email||bc.name}`)},
  invPayOpen:e=>{S.modal={type:'invPay',id:e.id}},
  invPayConfirm:e=>{const i=invById(e.id);const T=invTotals(i);const amt=Math.round(parseFloat(val('ip-amt'))*100);
    if(!(amt>0)){setErr('iperr','Enter the amount received.');return false}if(amt>T.bal){setErr('iperr',`That's more than the balance of ${money(T.bal)}. Record overpayments as a credit instead.`);return false}
    i.payments.push({at:stamp(),date:today(),amt,ref:val('ip-ref')});i.paid=(i.paid||0)+amt;i.status=invTotals(i).bal<=0?'paid':'partially_paid';
    audit('Recorded invoice payment',`${i.no} · ${money(amt)}`,val('ip-ref')||'');event('payment.succeeded',i.no);S.modal=null;toast(i.status==='paid'?`${i.no} paid in full`:`Part payment recorded. ${money(invTotals(i).bal)} still due.`)},
  invRemind:e=>{const i=invById(e.id);(i.reminders=i.reminders||[]).push(stamp());const bc=billContact(S.customers[i.customer]);
    S.notifs.unshift({id:'n-'+(S.seq++),to:bc.email||bc.name,text:`Reminder: invoice ${i.no}, ${money(invTotals(i).bal)} due ${fmtD(i.due)}.`,status:'sent',at:stamp()});audit('Sent invoice reminder',i.no);toast(`Reminder sent to ${bc.email||bc.name}`)},
  cSample:()=>{if(!S.modal)return false;S.modal.photos=S.modal.photos||[];if(S.modal.photos.length>=3){setErr('cphotoerr','You can add up to 3 photos.');return false}S.modal.photos.push(samplePhoto());cPrevRefresh();return false},
  cPhotoDel:e=>{S.modal.photos.splice(+e.i,1);cPrevRefresh();return false},
  cImgOpen:e=>{S.modal={type:'cImg',c:e.c,at:e.at,i:+e.i}},
  cImgNav:e=>{const m=S.modal;const c=S.cases.find(x=>x.id===m.c);const n=c.timeline.find(x=>x.at===m.at&&x.photos).photos.length;m.i=(m.i+(+e.v)+n)%n},
  evOpen:e=>{S.modal={type:'evPreview',v:e.v,e:e.e}},
  evNav:e=>{const m=S.modal;const list=visitPhotos(V_(m.v));const i=list.findIndex(x=>x.e.id===m.e);const n=list.length;
    let j=(i+(+e.v)+n)%n;const cur=list[i];if(cur){const step=+e.v;while(j!==i&&list[j].t.id===cur.t.id&&cur.t.ev.length>1)j=(j+step+n)%n}m.e=list[j].e.id},
  invVoidOpen:e=>{S.modal={type:'invVoid',id:e.id}},
  invCreditOpen:e=>{S.modal={type:'invCredit',id:e.id}},
  cnPick:e=>{const el=document.getElementById('cn-pct');if(el){el.value=e.v;cnCalc()}return false},
  invCreditConfirm:e=>{const i=invById(e.id);const T=invTotals(i);const pct=parseFloat(val('cn-pct'));const reason=val('cn-reason');
    if(!(pct>0)||pct>100){setErr('cnerr','Enter a percentage between 0.5 and 100.');return false}
    const amount=Math.round(T.total*pct/100);const left=T.total-T.cred;
    if(amount>left){setErr('cnerr',`Only ${money(left)} of this invoice is left to credit (${(left/T.total*100).toFixed(1)}%).`);return false}
    if(!reason){setErr('cnerr','Give a reason. It appears on the credit note.');return false}
    const no='CN-2026-'+String(S.cnSeq++).padStart(4,'0');(i.credits=i.credits||[]).push({no,pct,amount,reason,at:stamp(),date:today()});
    const nb=invTotals(i).bal;if(nb<=0&&['issued','partially_paid'].includes(i.status))i.status='settled';
    const bc=billContact(S.customers[i.customer]);S.notifs.unshift({id:'n-'+(S.seq++),to:bc.email||bc.name,text:`Credit note ${no} issued against ${i.no}: ${money(amount)} (${pct}%).`,status:'sent',at:stamp()});
    audit('Issued partial credit note',`${no} · ${pct}% of ${i.no} · ${money(amount)}`,reason);event('invoice.credited',no);S.modal=null;
    toast(nb<0?`${no} issued. ${money(-nb)} is now owed to the client.`:`${no} issued for ${money(amount)}. Balance now ${money(Math.max(0,nb))}.`)},
  invVoidConfirm:e=>{const i=invById(e.id);const r=val('iv-reason');if(!r){setErr('iverr','Give a reason. It appears on the credit note.');return false}
    i.status='void';i.credit='CN-2026-'+String(S.cnSeq++).padStart(4,'0');i.voidAt=stamp();i.voidReason=r;(i.visitIds||[]).forEach(id=>{if(V_(id))V_(id).invoiceId=null});
    audit('Voided invoice',`${i.no} → credit note ${i.credit}`,r);S.modal=null;toast(`${i.no} voided. Credit note ${i.credit} issued.`)},
  caseGo:e=>{S.biz.view='cases';S.biz.caseId=e.id},
  empView:e=>{S.biz.staffId=e.id;S.biz.empView=e.id;S.biz.empTab='personal';S.biz.empReveal=null;window.scrollTo(0,0)},
  empBack:()=>{S.biz.empView=null;S.biz.empReveal=null},
  empTab:e=>{S.biz.empTab=e.v},
  empReveal:e=>{if(S.biz.empReveal===e.id)S.biz.empReveal=null;else{S.biz.empReveal=e.id;audit('Viewed sensitive employee details',S.staff[e.id].name,'Owner review of employee record')}},
  empInvite:()=>{S.modal={type:'invite'}},
  empInviteConfirm:()=>{const name=val('inv-name'),role=val('inv-role'),type=val('inv-type'),rate=parseFloat(val('inv-rate'));
    if(name.split(' ').filter(Boolean).length<2){setErr('inverr','Enter a first and last name.');return false}if(!(rate>0)){setErr('inverr','Enter an hourly rate.');return false}const em=normEm(val('inv-email'));if(!okEmail(em)){setErr('inverr','Enter their email. The Pro app invite is sent to it.');return false}if(Object.values(S.staff).some(x=>normEm(x.email)===em)){setErr('inverr','Someone on your team already uses that email.');return false}const mob=val('inv-mob');if(mob&&!okMob(mob)){setErr('inverr','Check the mobile number, or leave it blank.');return false}
    const id='s'+(S.seq++);const parts=name.split(' ').filter(Boolean);const st=addDays(today(),7);
    S.staff[id]={id,name,display:parts[0]+' '+parts[parts.length-1][0]+'.',role,skills:[],type,isNew:true,cred:{type:'DBS basic check',status:'pending',verified:null,expires:'2000-01-01'},avail:{days:[1,2,3,4,5],from:'08:00',to:'16:00',label:'Mon–Fri 08:00–16:00'},pay:`Hourly · £${rate.toFixed(2)} ordinary`,rate:Math.round(rate*100),start:st,phone:mob||'Not yet provided',email:em,rates:[{from:st,rate:Math.round(rate*100)}],onboarding:{right:false,contract:false,induction:false,uniform:false,bank:false}};S.staff[id].invite=inviteCode();S.staff[id].app={status:'invited',email:em,mobile:mob,code:S.staff[id].invite,at:fmtD(today())};
    S.training[id]={coshh:{status:'assigned',assigned:today(),due:addDays(today(),14)},manual:{status:'assigned',assigned:today(),due:addDays(today(),14)},privacy:{status:'assigned',assigned:today(),due:addDays(today(),14)}};
    S.biz.staffId=id;S.biz.empView=id;S.biz.empTab='work';S.biz.empReveal=null;audit('Added employee',`${name} · ${role} · ${type}`,`Pro app invite ${S.staff[id].invite} emailed to ${em}`);S.modal=null;toast(`${name} added. Invite code ${S.staff[id].invite} emailed to ${em}.`)},
  onbToggle:e=>{const s=S.staff[e.id];s.onboarding[e.v]=!s.onboarding[e.v];audit(s.onboarding[e.v]?'Completed onboarding item':'Reopened onboarding item',`${s.name} · ${ONB.find(o=>o[0]===e.v)[1]}`);if(onboardingDone(s)){toast(`${s.name} has finished onboarding and can now be allocated.`)}},
  credRenew:e=>{S.modal={type:'credRenew',id:e.id}},
  credRenewConfirm:e=>{const s=S.staff[e.id];const n=val('cr-note');if(!n){setErr('crerr','Record how the check was verified.');return false}
    s.cred={...s.cred,status:'verified',verified:today(),expires:addMonths(today(),36)};audit('Recorded verified DBS check',s.name,n);S.modal=null;toast(`${s.display} is verified. Domestic visits are unblocked.`)},
  trainOpen:e=>{S.modal={type:'train',id:e.id,c:e.c}},
  trainAssign:e=>{const d=addDays(today(),14);assignTraining(e.id,e.c,d,'');shareMats(e.c,[e.id]);S.modal=null;toast('Assigned and employee notified')},
  trainComplete:e=>{const n=val('tr-note');if(!n){setErr('trerr','Record the evidence you checked.');return false}const c=allCourses().find(x=>x.id===e.c);const s=S.staff[e.id];
    (S.training[e.id]=S.training[e.id]||{})[e.c]={status:'complete',done:today(),expires:c.months?addMonths(today(),c.months):null,note:n};audit('Recorded training completion',`${s.name} · ${c.name}`,n);
    let msg='Completion recorded';if(c.grants&&!s.skills.includes(c.grants)){s.skills.push(c.grants);audit('Skill added',`${s.name} · ${SKILL_LABEL[c.grants]}`,`Completed ${c.name}`);msg=`Recorded. ${s.display} can now be allocated to ${SKILL_LABEL[c.grants].toLowerCase()} visits.`}
    S.modal=null;toast(msg)},
  clientView:e=>{S.biz.view='clients';S.biz.clientId=e.id;S.biz.clientView=e.id;S.biz.clientTab='details';S.biz.clientReveal=null;window.scrollTo(0,0)},
  clientBack:()=>{S.biz.clientView=null;S.biz.clientReveal=null},
  clientTab:e=>{S.biz.clientTab=e.v},
  clientRevealAll:e=>{if(S.biz.clientReveal===e.id)S.biz.clientReveal=null;else{S.biz.clientReveal=e.id;audit('Viewed sensitive client details',S.customers[e.id].name,'Owner review of client record')}},
  anRange:e=>{S.an.range=+e.v},
  agAsk:e=>{agSend(e.v);return false},
  agSend:()=>{const el=document.getElementById('ag-in');const t=el?el.value:'';AG.draft='';agSend(t);return false},
  agStop:()=>{if(AG.ctl)AG.ctl.abort();return false},
  agOpen:()=>{S.agentOpen=true;AG.enter=true;if(!AG.mode)agGetSample().then(()=>{if(S.agentOpen&&!AG.busy)render()});setTimeout(()=>{AG.enter=false;const t=document.getElementById('ag-in');if(t)t.focus();agScroll()},30)},
  agClose:()=>{S.agentOpen=false;AG.enter=false;setTimeout(()=>{const f=document.querySelector('.ag-fab');if(f)f.focus()},0)},
  agNew:()=>{if(AG.ctl)AG.ctl.abort();S.agent={turns:[]};AG.draft=''},
  anGo:e=>{S.biz.view=e.v;if(e.v==='clients'){S.biz.clientId=e.id;S.biz.clientView=e.id;S.biz.clientTab='details';S.biz.clientReveal=null}else if(e.v==='employees'){S.biz.staffId=e.id;S.biz.empView=e.id;S.biz.empTab='personal';S.biz.empReveal=null}else if(e.v==='cases')S.biz.caseId=e.id;window.scrollTo(0,0)},
  anScroll:e=>{const t=document.getElementById(e.v);if(t)t.scrollIntoView({behavior:'smooth',block:'start'});return false},
  anSim:e=>{const P=S.pricing;if(e.v==='price')S.an.sim.reg=Math.min(25,Math.round((targetRate(P)/P.hourly.regular-1)*100));if(e.v==='add')S.an.sim.add=Math.min(10,+e.id||1);
    if(e.v==='price'&&!S.an.sim.add)S.an.sim.add=2;setTimeout(()=>{const t=document.getElementById('an-sim');if(t)t.scrollIntoView({behavior:'smooth',block:'start'})},30)},
  anSimReset:()=>{S.an.sim={...AN_SIM0}},
  clientReveal:e=>{S.biz.reveal=e.id;audit('Viewed site access code',S.sites[e.id].name,'Owner review in client record')},
  clientAdd:()=>{S.modal={type:'addClient'}},
  clientAddConfirm:()=>{const name=val('ac-name'),type=val('ac-type'),addr=val('ac-addr'),pc=val('ac-pc').toUpperCase(),contact=val('ac-contact'),email=val('ac-email');
    if(!name||!addr||!contact){setErr('acerr','Name, address and contact are required.');return false}
    if(!/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/.test(pc)){setErr('acerr','Enter a full UK postcode.');return false}
    const area=pc.replace(/\s/g,'').slice(0,-3);if(!S.settings.zones.includes(area)){setErr('acerr',`${area} is outside your service area. Add it in Settings first.`);return false}
    const id='c'+(S.seq++);S.customers[id]={name,type,since:today(),entity:name,arrangement:'No active plan yet',billing:type==='commercial'?'Monthly invoice · terms to agree':'Card via payment provider',contacts:[{name:contact,role:type==='commercial'?'Requester':'Account holder',scope:'All',limit:'–',email}]};
    S.sites[id]={id,customer:id,name,short:name.split(' ')[0]+(type==='domestic'?' home':''),type,tpl:type==='domestic'?'dom':'office',addr:`${addr}, ${pc}`,photo:'allowed',access:'To be confirmed at first visit',secret:'Not set',needs:''};
    S.biz.clientId=id;S.biz.clientView=id;S.biz.clientTab='details';S.biz.clientReveal=null;audit('Added client',`${name} · ${type}`);S.modal=null;toast(`${name} added`)},
  setSave:()=>{const g=id=>parseInt(val(id),10);const v={noticeDays:g('set-notice'),horizonWeeks:g('set-horizon'),cancelHours:g('set-cancelh'),cancelFee:g('set-fee'),holdMinutes:g('set-hold'),tolerance:g('set-tol')};
    const lim={noticeDays:[1,28],horizonWeeks:[1,8],cancelHours:[0,168],cancelFee:[0,100],holdMinutes:[5,30],tolerance:[5,60]};
    for(const k in v){if(isNaN(v[k])||v[k]<lim[k][0]||v[k]>lim[k][1]){setErr('seterr',`Check the values: each must be between its minimum and maximum (${k==='noticeDays'?'notice 1–28 days':k}).`);return false}}
    const names={noticeDays:'rota notice',horizonWeeks:'planning horizon',cancelHours:'free cancellation hours',cancelFee:'late fee %',holdMinutes:'checkout hold',tolerance:'arrival tolerance'};
    const ch=Object.keys(v).filter(k=>v[k]!==S.settings[k]).map(k=>`${names[k]} ${S.settings[k]} → ${v[k]}`);if(!ch.length){setErr('seterr','Nothing has changed.');return false}
    const reason=val('set-reason');if(!reason){setErr('seterr','Add a reason for the change.');return false}
    Object.assign(S.settings,v);S.settings.version++;S.settings.history.unshift({v:S.settings.version,at:stamp(),by:ME_BIZ,changes:ch.join('; ')+'. '+reason});
    audit(`Published policy v${S.settings.version}`,ch.join('; '),reason);toast(`Policy v${S.settings.version} saved. Existing bookings keep their accepted version.`)},
  zoneAdd:()=>{const z=val('set-zone').toUpperCase().replace(/\s/g,'');if(!/^[A-Z]{1,2}\d[A-Z\d]?$/.test(z)){setErr('zoneerr','Enter a postcode district, like PE8.');return false}if(S.settings.zones.includes(z)){setErr('zoneerr',`${z} is already in your area.`);return false}S.settings.zones.push(z);audit('Added service district',z);toast(`${z} added`)},
  zoneRemove:e=>{S.settings.zones=S.settings.zones.filter(z=>z!==e.v);audit('Removed service district',e.v,'Existing bookings unaffected');toast(`${e.v} removed. Existing bookings there are unaffected.`)},
  corrDecide:e=>{const P=S.payroll;const c=P.corrections.find(x=>x.id===e.id);const note=val('corrnote-'+c.id);
    if(e.v==='0'&&!note){toast('Add a note explaining the rejection');return false}
    c.status=e.v==='1'?'approved':'rejected';c.decidedAt=stamp();c.note=note;
    if(e.v==='1')P.adjustments.push({staff:c.staff,date:c.date,hours:c.hours,ref:c.visit,reason:`${c.field} ${c.old} → ${c.new}`});
    notify(c.staff,`Time correction ${c.status}: ${c.field} ${c.old} → ${c.new}${note?'. '+note:''}`);audit(e.v==='1'?'Approved time correction':'Rejected time correction',`${S.staff[c.staff].name} · ${c.visit} · ${c.field} ${c.old} → ${c.new}`,note||c.reason);toast(e.v==='1'?`Approved. +${c.hours} h added as an adjustment.`:'Rejected. The employee has been told why.')},
  mcResolve:e=>{const v=V_(e.id);const t=val('mc-'+v.id),r=val('mcr-'+v.id);if(!t||!r){toast('Enter the finish time and how it was confirmed');return false}
    const a=allocsFor(v.id)[0];v.checkout=`${fmtD(v.date)}, ${t}`;v.timeIssue.status='resolved';v.timeIssue.resolution=`${t} · ${r}`;
    const diff=(mins(t)-mins(a.end))/60;if(Math.abs(diff)>0.001)S.payroll.adjustments.push({staff:a.staffId,date:v.date,hours:diff,ref:v.id,reason:'Confirmed finish '+t});
    audit('Resolved missing check-out',`${v.id} ${site(v).short} · ${S.staff[a.staffId].name}`,`${t} · ${r}`);toast('Resolved. That time now counts toward payroll.')},
  payStep:e=>{const P=S.payroll;if(e.v==='reviewed'&&payExceptions().length){toast('Resolve the exceptions first');return false}P.status=e.v;audit(e.v==='reviewed'?'Payroll reviewed':'Payroll approved',`Pay period ${P.period.from} – ${P.period.to}`);toast(e.v==='reviewed'?'Marked as reviewed':'Pay input approved')},
  payLock:()=>{const P=S.payroll;const lines=linesFrom(payLines(P.period.from,P.period.to));const body=JSON.stringify(lines.map(l=>[l.line,l.staff,l.cat,l.hours,l.rate,l.amount]));
    P.batch={id:'PB-2026-10A',version:1,lines,checksum:cks(body),lockedAt:stamp(),lockedBy:ME_BIZ,exportedAt:null,corrections:[]};P.status='locked';
    audit('Locked pay period',`${P.batch.id} · ${lines.length} lines · ${money(lines.reduce((x,l)=>x+l.amount,0))}`,'checksum '+P.batch.checksum);toast('Locked. Lines are now fixed.')},
  payExport:()=>{const P=S.payroll;P.batch.exportedAt=stamp();P.status='exported';audit('Exported payroll batch',`${P.batch.id} · checksum ${P.batch.checksum}`);event('payroll.exported',P.batch.id);toast('Exported. Not paid until the provider confirms.')},
  payReexport:()=>{const B=S.payroll.batch;audit('Re-exported payroll batch',`${B.id} · checksum ${B.checksum}`,'Same batch, unchanged');toast(`Same batch ${B.id}, checksum unchanged. No duplicate lines.`)},
  payImport:e=>{const P=S.payroll;const B=P.batch;if(e.v==='ok'){B.lines.forEach(l=>l.status='accepted');B.providerNote=`Imported ${stamp()} · all ${B.lines.length} lines accepted`;P.status='acknowledged';audit('Payroll import acknowledged',B.id,'All lines accepted','Payroll provider');toast('All lines accepted by the provider')}
    else{const bad=B.lines.find(l=>l.staff==='s5')||B.lines[B.lines.length-1];B.lines.forEach(l=>l.status=l===bad?'rejected':'accepted');bad.reason='Employee reference not found in payroll system';B.providerNote=`Imported ${stamp()} · ${B.lines.length-1} accepted, line ${bad.line} rejected: ${bad.reason}`;P.status='partially_rejected';audit('Payroll import partially rejected',`${B.id} line ${bad.line}`,bad.reason,'Payroll provider');toast('One line rejected. The accepted lines are kept.')}},
  payCorrect:()=>{const P=S.payroll;const B=P.batch;const bad=B.lines.find(l=>l.status==='rejected');const cid=B.id+'-C1';bad.status='accepted via '+cid;B.corrections.push(`${cid}: line ${bad.line} resent with corrected employee reference`);B.providerNote+=` · ${cid} accepted`;P.status='acknowledged';audit('Sent payroll correction batch',`${cid} · line ${bad.line}`,'Linked to '+B.id);toast(`Correction ${cid} accepted. Original lines unchanged.`)},
  payPaid:()=>{const P=S.payroll;P.status='paid';P.paidAt=fmtD(P.period.pay);audit('Recorded payroll payment confirmation',P.batch.id,'Confirmation from payroll provider','Payroll provider');toast('Marked paid from provider confirmation')},
  copyCsv:()=>{const el=document.getElementById('csvout');const txt=el?el.textContent:'';try{navigator.clipboard.writeText(txt).then(()=>toast('CSV copied'),()=>{selectEl(el);toast('Select and copy the highlighted text')})}catch(x){selectEl(el)}return false},
  week:e=>{S.biz.week=e.v},
  closeModal:()=>{S.modal=null;S.cwResume=null},
  scrim:(e,ev)=>{if(ev.target.classList.contains('scrim'))S.modal=null;else return false},
  allocOpen:e=>{S.modal={type:'alloc',id:e.id}},
  demandOpen:e=>{S.modal={type:'demand',id:e.id}},
  openShift:e=>{S.modal={type:'shift',id:e.id}},
  allocConfirm:e=>{const v=V_(e.id);const r=document.querySelector('input[name=allocstaff]:checked');const reason=val('allocreason');
    if(!r){toast('Choose an eligible employee');return false}
    const el=elig(r.value,v);const pubWeek=periodState(weekOf(v.date))==='published';const short=pubWeek&&isShort(v.date,v.start);
    if((el.warns.length||short)&&!reason){toast('Add a reason for the override or short notice');return false}
    const a={id:'al-'+(S.seq++),visitId:v.id,staffId:r.value,status:pubWeek?'published':'draft',start:v.start,end:v.end,firstPublishedAt:pubWeek?stamp():null,version:pubWeek?1:0,notif:pubWeek?'sent':null,ack:null,response:null,requiresAcceptance:short,shortNotice:short,amendment:null,cancel:null,history:[{at:stamp(),text:pubWeek?`Published${short?' at short notice':''}${reason?': '+reason:''}`:'Added to draft'+(reason?': '+reason:'')}]};
    S.allocs.push(a);audit(pubWeek?'Published allocation':'Drafted allocation',`${v.id} ${site(v).short} ${fmtD(v.date)} → ${S.staff[r.value].name}`,reason+(el.warns.length?` (override: ${el.warns.join('; ')})`:''));
    if(pubWeek){notify(r.value,`${short?'Short-notice shift':'New shift'}: ${fmtD(v.date)} ${v.start} at ${site(v).short}.${short?' Please accept or decline.':''}`);event('rota.published',v.id)}
    S.modal=null;toast(pubWeek?`Published to ${S.staff[r.value].display}`:'Added to draft')},
  draftRemove:e=>{S.allocs=S.allocs.filter(a=>a.id!==e.id);audit('Removed draft allocation',e.id);S.modal=null;toast('Removed from draft')},
  publishOpen:()=>{S.modal={type:'publish'}},
  startDraft:()=>{S.periods[S.biz.week]={status:'draft',version:0};audit('Started draft rota',`w/c ${fmtD(S.biz.week)}`);toast('Draft started. Allocate from unfilled demand.')},
  publishConfirm:()=>{const w=S.biz.week;const drafts=S.allocs.filter(a=>a.status==='draft'&&weekOf(V_(a.visitId).date)===w);
    if(drafts.some(a=>!elig(a.staffId,V_(a.visitId),a.id).ok)){toast('Blocking conflicts remain');return false}
    const at=stamp();const per=S.periods[w];per.version=(per.version||0)+1;per.status='published';per.publishedAt=at;per.publishedBy=ME_BIZ;
    drafts.forEach(a=>{const v=V_(a.visitId);a.status='published';a.firstPublishedAt=at;a.version=1;a.shortNotice=isShort(v.date,a.start);a.requiresAcceptance=a.shortNotice;
      a.notif=a.staffId==='s5'&&!S.flags.pushFailed?'failed':'sent';a.history.push({at,text:`Published in rota v${per.version}${a.shortNotice?' (short notice)':''}`});
      notify(a.staffId,`Rota published: ${fmtD(v.date)} ${a.start} at ${site(v).short}.`,a.notif)});
    if(drafts.some(a=>a.staffId==='s5'))S.flags.pushFailed=true;
    audit(`Published rota v${per.version}`,`w/c ${fmtD(w)} · ${drafts.length} shifts · ${[...new Set(drafts.map(a=>S.staff[a.staffId].name))].join(', ')}`);event('rota.published',`w/c ${fmtD(w)}`);
    S.modal=null;toast(`Published ${drafts.length} shifts${S.flags.pushFailed&&drafts.some(a=>a.notif==='failed')?' · 1 push failed, see exceptions':''}`)},
  contacted:e=>{const a=S.allocs.find(x=>x.id===e.id);a.contacted=true;a.history.push({at:stamp(),text:'Manager confirmed contact by phone'});audit('Recorded alternative contact',`${S.staff[a.staffId].name} · ${a.visitId}`,'Push delivery failed');toast('Recorded. Acknowledgement is still needed from the employee.')},
  amendSeen:e=>{const a=S.allocs.find(x=>x.id===e.id);a.amendment.seen=true},
  amendOpen:e=>{S.modal={type:'amend',id:e.id}},
  amendConfirm:e=>{const a=S.allocs.find(x=>x.id===e.id);const v=V_(a.visitId);const ns=val('amstart'),ne=val('amend'),reason=val('amreason');
    if(!reason){setErr('amerr','Add a reason. The employee will see it.');return false}
    if(!ns||!ne||mins(ne)<=mins(ns)){setErr('amerr','End must be after start.');return false}
    if(ns===a.start&&ne===a.end){setErr('amerr','Nothing has changed.');return false}
    const short=isShort(v.date,a.start)||isShort(v.date,ns);
    const deadlineD=new Date(Math.min(dt(v.date,a.start).getTime()-2*3600000,clock().getTime()+24*3600000));
    if(short){a.amendment={from:{start:a.start,end:a.end},to:{start:ns,end:ne},reason,short:true,status:'proposed',deadline:stamp(deadlineD),proposedAt:stamp()};a.history.push({at:stamp(),text:`Short-notice change proposed ${a.start}–${a.end} → ${ns}–${ne}: ${reason}`});
      notify(a.staffId,`Change proposed for ${fmtD(v.date)}: ${a.start}–${a.end} → ${ns}–${ne}. Your current shift stands unless you accept.`);event('rota.change_proposed',a.id);audit('Proposed short-notice amendment',`${S.staff[a.staffId].name} ${v.id}`,reason);toast('Proposal sent. Original shift stands until accepted.')}
    else{a.history.push({at:stamp(),text:`Changed ${a.start}–${a.end} → ${ns}–${ne} (v${a.version+1}): ${reason}`});a.amendment={from:{start:a.start,end:a.end},to:{start:ns,end:ne},reason,short:false,status:'applied'};a.start=ns;a.end=ne;a.version++;a.ack=null;
      notify(a.staffId,`Shift updated for ${fmtD(v.date)}: now ${ns}–${ne}. Please acknowledge.`);event('rota.change_applied',a.id);audit('Applied amendment (outside notice window)',`${S.staff[a.staffId].name} ${v.id}`,reason);toast('New version published. Awaiting acknowledgement.')}
    S.modal=null},
  cancelShiftOpen:e=>{S.modal={type:'cancelShift',id:e.id}},
  cancelShiftConfirm:e=>{const a=S.allocs.find(x=>x.id===e.id);const r=val('canreason');if(!r){setErr('canerr','Add a reason. The employee will see it.');return false}
    const v=V_(a.visitId);const short=isShort(v.date,a.start);a.status='cancelled';a.cancel={at:stamp(),reason:r,pay:short?'Pending review (inside notice window)':'Not applicable (outside notice window)',ack:null};a.history.push({at:stamp(),text:'Cancelled: '+r});
    notify(a.staffId,`Shift cancelled: ${fmtD(v.date)} ${a.start} at ${site(v).short}. Reason: ${r}.`);event('rota.shift_cancelled',a.id);audit('Cancelled published shift',`${S.staff[a.staffId].name} ${v.id}`,r);S.modal=null;toast('Shift cancelled and employee notified')},
  coverOpen:e=>{S.modal={type:'coverOpen',id:e.id}},
  coverConfirm:e=>{const v=V_(e.id);S.covers.push({id:'cv-'+(S.seq++),visitId:v.id,status:'open',reservedBy:null,openedAt:stamp(),expires:`${fmtD(addDays(v.date,-1))}, 18:00`,pay:'Ordinary rate plus £10 short-notice supplement. Voluntary.'});
    Object.values(S.staff).filter(s=>elig(s.id,v).ok).forEach(s=>notify(s.id,`Voluntary cover available: ${fmtD(v.date)} ${v.start} at ${site(v).short}.`));audit('Opened cover request',`${v.id} ${site(v).short}`);S.modal=null;toast('Cover request sent to eligible staff')},
  coverApprove:e=>{const c=S.covers.find(x=>x.id===e.id);const v=V_(c.visitId);const el=elig(c.reservedBy,v);if(!el.ok){toast('No longer eligible: '+el.blocks[0]);return false}
    S.allocs.push({id:'al-'+(S.seq++),visitId:v.id,staffId:c.reservedBy,status:'published',start:v.start,end:v.end,firstPublishedAt:stamp(),version:1,notif:'sent',ack:stamp(),response:'accepted',requiresAcceptance:true,shortNotice:true,amendment:null,cancel:null,history:[{at:stamp(),text:'Assigned from approved cover request (voluntary)'}]});
    c.status='assigned';notify(c.reservedBy,`Cover confirmed: ${fmtD(v.date)} ${v.start} at ${site(v).short}. Access details unlock 30 minutes before.`);audit('Approved cover',`${v.id} → ${S.staff[c.reservedBy].name}`);event('assignment.changed',v.id);toast('Assigned. Customer team details updated.')},
  swapSimAccept:e=>{const s=S.swaps.find(x=>x.id===e.id);s.status='replacement_accepted';audit('Swap accepted by replacement',s.id,'',S.staff[s.to].name)},
  swapApprove:e=>{const s=S.swaps.find(x=>x.id===e.id);const a=S.allocs.find(x=>x.id===s.allocId);const v=V_(a.visitId);const el=elig(s.to,v,a.id);
    if(!el.ok){s.status='rejected';s.reason='No longer eligible: '+el.blocks[0];toast('Swap invalid now: '+el.blocks[0]);return}
    a.status='replaced';a.history.push({at:stamp(),text:`Swapped to ${S.staff[s.to].name}`});
    S.allocs.push({...a,id:'al-'+(S.seq++),staffId:s.to,status:'published',firstPublishedAt:stamp(),ack:stamp(),response:'accepted',history:[{at:stamp(),text:`Received by approved swap from ${S.staff[a.staffId].name}`}]});
    s.status='approved';notify(a.staffId,`Swap approved: ${fmtD(v.date)} now with ${S.staff[s.to].display}.`);notify(s.to,`Swap approved: you're on ${fmtD(v.date)} ${a.start} at ${site(v).short}.`);audit('Approved swap',`${v.id} ${S.staff[a.staffId].name} → ${S.staff[s.to].name}`);toast('Swap applied to both rotas and the visit')},
  swapReject:e=>{const s=S.swaps.find(x=>x.id===e.id);s.status='rejected';s.reason='Manager rejected';audit('Rejected swap',s.id)},
  reviewSel:e=>{S.biz.reviewId=e.id},
  supConfirm:e=>{V_(e.id).supConfirm=!V_(e.id).supConfirm},
  excDecide:e=>{const v=V_(e.id);const t=v.tasks.find(x=>x.id===e.t);t.excOk=e.v==='1';audit(t.excOk?'Accepted evidence exception':'Rejected evidence exception',`${v.id} · ${t.name}`,t.excReq)},
  reviewAccept:e=>{const v=V_(e.id);{const es=evStatus(v);if(es.missing>0){toast(es.photo?'Required evidence is missing. Request a correction instead.':'Confirm the checklist as supervisor first.');return false}}const nd=v.tasks.some(t=>t.result==='not_done');const exc=v.tasks.some(t=>t.excReq);const note=val('revnote');
    v.state=nd?'partial':'completed';v.evidenceComplete=!exc;v.review={by:ME_BIZ+' (supervisor)',at:stamp(),outcome:nd?'partial':'completed',note};
    audit(nd?'Recorded partial service':'Accepted evidence and completed visit',`${v.id} ${site(v).short}`,note);event('visit.reviewed',v.id);toast(nd?'Recorded as partially completed. Report ready.':'Visit completed and moved to Bookings. Report sent to customer.')},
  reviewCorrect:e=>{const v=V_(e.id);const note=val('revnote');if(!note){toast('Tell the cleaner what to correct');return false}
    v.revisions.push({rev:v.submission.rev,note,at:stamp()});v.submission=null;v.state='in_progress';const a=allocsFor(v.id)[0];if(a)notify(a.staffId,`Correction requested for ${site(v).short}: ${note}`);
    audit('Requested evidence correction',v.id,note);toast('Correction requested. Revision history kept.')},
  reviewFail:e=>{const v=V_(e.id);const note=val('revnote');if(!note){toast('Add a note explaining why');return false}v.state='partial';v.tasks.forEach(t=>{if(t.result==='done'&&false)t.result='done'});v.evidenceComplete=false;v.review={by:ME_BIZ,at:stamp(),outcome:'failed',note};audit('Marked visit failed',v.id,note);toast('Marked as failed service')},
  caseSel:e=>{S.biz.caseId=e.id},
  toggleInternal:()=>{S.biz.showInternal=!S.biz.showInternal},
  caseTriage:e=>{const c=S.cases.find(x=>x.id===e.id);c.status='triaged';c.timeline.push({who:ME_BIZ,text:'Thanks for letting us know. I\'m looking into this now and will come back to you with options.',internal:false,at:stamp()});audit('Acknowledged concern',c.id);toast('Acknowledged. Customer notified.')},
  caseMsg:e=>{const c=S.cases.find(x=>x.id===e.id);const t=val('casemsg');if(!t){toast('Write a message first');return false}c.timeline.push({who:ME_BIZ,text:t,internal:e.v==='1',at:stamp()});if(c.status==='open'&&e.v!=='1')c.status='triaged';audit(e.v==='1'?'Added staff-only note':'Messaged customer',c.id);toast(e.v==='1'?'Staff-only note added (hidden from customer)':'Sent')},
  remedyOpen:e=>{S.modal={type:'remedy',id:e.id}},
  remedyConfirm:e=>{const c=S.cases.find(x=>x.id===e.id);const v=V_(c.visitId);const type=(document.querySelector('input[name=remtype]:checked')||{}).value;const note=val('remnote');const max=refundable(v.payment);
    let amount=0;if(type==='partial'||type==='credit'){amount=Math.round(parseFloat(val('remamt'))*100);if(!amount||amount<=0){setErr('remerr','Enter an amount.');return false}if(type==='partial'&&amount>max){setErr('remerr',`That's more than the refundable balance of ${money(max)} (captured minus refunds already pending or paid).`);return false}}
    if(type==='full')amount=max;if(type==='reject'&&!note){setErr('remerr','Give the customer a reason.');return false}
    const r={id:'rm-'+(S.seq++),type,amount,status:'proposed',note,reason:type==='reject'?note:'',date:val('remdate')};c.remedies.push(r);c.status='remedy_proposed';
    c.timeline.push({who:ME_BIZ,text:`Proposed: ${remedyText(r)}${note&&type!=='reject'?'. '+note:''}`,internal:false,at:stamp()});audit('Proposed remedy',c.id,remedyText(r));S.modal=null;toast('Remedy sent to customer')},
  refundConfirm:e=>{const r=S.refunds.find(x=>x.id===e.id);r.status='succeeded';const c=S.cases.find(x=>x.id===r.caseId);c.status='resolved';c.timeline.push({who:'System',text:`Payment provider confirmed refund of ${money(r.amount)}.`,internal:false,at:stamp()});audit('Refund confirmed by provider',`${r.id} ${money(r.amount)}`,'Verified webhook','Payment provider');event('refund.updated',r.id);toast('Refund succeeded. Case resolved.')},
  refundFail:e=>{const r=S.refunds.find(x=>x.id===e.id);r.status='failed';audit('Refund failed at provider',r.id,'Provider error','Payment provider');toast('Refund failed. It stays actionable.')},
  refundRetry:e=>{const r=S.refunds.find(x=>x.id===e.id);r.status='pending';audit('Retried refund',`${r.id} (idempotency key ${r.idem})`);toast('Resubmitted with the same idempotency key. No duplicate possible.')},
  caseClose:e=>{const c=S.cases.find(x=>x.id===e.id);c.status='closed';audit('Closed case',c.id,'Remedy completed');toast('Case closed')},
  offline:()=>{S.cl.offline=!S.cl.offline;if(!S.cl.offline){S.cl.lastSync=stamp();syncNow();toast('Back online. Syncing queued items.')}else toast('Offline. New work is queued on this phone.')},
  refresh:()=>{S.cl.lastSync=stamp();toast('Rota refreshed')},
  ack:e=>{const a=S.allocs.find(x=>x.id===e.id);a.ack=stamp();a.history.push({at:a.ack,text:'Receipt acknowledged'});audit('Acknowledged shift',`${a.visitId}`,'',S.staff[a.staffId].name);event('rota.acknowledged',a.id);toast('Acknowledged')},
  declineConfirm:e=>{const a=S.allocs.find(x=>x.id===e.id);const r=val('decreason');if(!r){setErr('decerr','Add a short reason.');return false}if(S.cl.offline){setErr('decerr','You\'re offline. Try again when connected.');return false}
    a.response='declined';a.ack=a.ack||stamp();a.history.push({at:stamp(),text:(e.v==='unavail'?'Reported unavailable: ':'Declined: ')+r});audit(e.v==='unavail'?'Reported unavailable':'Declined shift',a.visitId,r,S.staff[a.staffId].name);event('rota.assignment_declined',a.id);S.modal=null;toast('Sent. Dispatch has been alerted.')},
  swapConfirm:e=>{S.swaps.push({id:'sw-'+(S.seq++),allocId:e.id,to:val('swapto'),status:'requested',reason:val('swapreason'),at:stamp()});audit('Requested swap',e.id,val('swapreason'),S.staff[S.cl.persona].name);S.modal=null;toast('Swap requested. Your shift stays yours until approved.')},
  checkin:e=>doCheckin(e.id,'Site QR'),
  manualConfirm:e=>{const r=val('manreason');if(!r){setErr('manerr','Tell your supervisor what happened.');return false}S.modal=null;doCheckin(e.id,'Manual exception',r)},
  photo:e=>{const v=V_(e.id);const t=v.tasks.find(x=>x.id===e.t);S.flags.photos=(S.flags.photos||0)+1;S.tick++;
    const ev={id:'ev-'+(S.seq++),kind:e.v,status:S.cl.offline?'queued':'uploading',capture:stamp(),receipt:null,checksum:'sha256:'+hex()};t.ev.push(ev);
    if(!S.cl.offline)upload(v.id,t.id,ev.id,S.flags.photos===3)},
  excConfirm:e=>{const r=val('excreason');if(!r){setErr('excerr','Add a reason.');return false}V_(e.id).tasks.find(x=>x.id===e.t).excReq=r;S.modal=null},
  incidentConfirm:e=>{const v=V_(e.id);const cat=document.querySelector('input[name=inccat]:checked').value;const note=val('incnote');const stop=document.getElementById('incstop').checked;
    v.incidents.push({cat,note:note||'No details',at:stamp(),by:S.staff[S.cl.persona].name,resolved:false});if(stop||cat==='Unsafe site'&&stop){v.state='stopped';v.checkout=stamp()}
    audit('Incident reported',`${v.id} ${cat}`,note,S.staff[S.cl.persona].name);S.modal=null;toast('Dispatch alerted'+(stop?'. Work stopped.':''))},
  rate:e=>{const f=S.feedback[e.id];if(f){f.history.push({score:f.score,at:f.at});f.score=+e.v;f.at=stamp()}else S.feedback[e.id]={score:+e.v,at:stamp(),history:[]};toast('Rating saved. You can change it.')},
  concernConfirm:e=>{const v=V_(e.id);const desc=val('cdesc');if(!desc){setErr('cerr','Tell us briefly what happened.');return false}const photos=(S.modal.photos||[]).slice();if(NEEDS_PHOTO.includes(val('ccat'))&&!photos.length){setErr('cphotoerr','Add at least one photo showing the problem, so we can check it quickly.');return false}
    const id='C-'+(2040+S.cases.length+1);const tid=val('ctask');if(tid)v.tasks.find(t=>t.id===tid).flagged=true;
    S.cases.unshift({id,visitId:v.id,customer:custOf(v),category:val('ccat'),taskId:tid||null,desc,wanted:val('cwant'),status:'open',owner:ME_BIZ,respondBy:'Fri 16 Oct, '+hhmm(),createdAt:stamp(),timeline:[{who:PERSONAS[S.cu.persona].name,text:desc,photos,internal:false,at:stamp()}],remedies:[]});
    audit('Concern opened',`${id} · ${v.id}`,'',PERSONAS[S.cu.persona].name);event('case.opened',id);S.modal=null;S.cu.caseId=id;S.cu.visit=null;toast(`Case ${id} opened`)},
  bkFind:()=>{const b=S.book;b.errors={};b.outsideReq=false;const err=pcError(val('bk-postcode'));b.postcode=val('bk-postcode');if(err){b.errors.postcode=err;b.addrs=null;return}
    b.postcode=normPc(b.postcode);b.addrs=genAddrs(b.postcode);b.addrsFor=b.postcode;b.addr='';setTimeout(()=>{const el=document.getElementById('bk-addr');if(el)el.focus()},0)}
};
function selectEl(el){try{const r=document.createRange();r.selectNodeContents(el);const s=window.getSelection();s.removeAllRanges();s.addRange(r)}catch(x){}}
function val(id){const el=document.getElementById(id);return el?el.value.trim():''}
function setErr(id,msg){const el=document.getElementById(id);if(el)el.textContent=msg}
function normPc(pc){const c=(pc||'').toUpperCase().replace(/\s/g,'');return c.length>3?c.slice(0,-3)+' '+c.slice(-3):c}
function pcError(pc){const p=normPc(pc);if(!/^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/.test(p))return 'Enter a full UK postcode, like PE6 0JH.';
  if(areaOf(p).kind==='outside')return `${p.split(' ')[0]} is outside our usual service area. You can still request a quote and we'll tell you if we can help.`;return ''}
const TOWNS={PE1:'Peterborough',PE2:'Peterborough',PE3:'Peterborough',PE4:'Peterborough',PE6:'Crowland',PE7:'Whittlesey',PE8:'Oundle',PE9:'Stamford',PE10:'Bourne',PE11:'Spalding',PE12:'Holbeach',PE13:'Wisbech'};
const STREETS=['Willow Lane','Church Street','North Street','Abbey Walk','Mill Road','Station Road','Orchard Close','Thorney Road','The Green','Meadow Way','Elm Grove','Fen View'];
function genAddrs(pc){const p=normPc(pc);const area=p.split(' ')[0];const town=TOWNS[area]||'Peterborough';
  let h=0;for(const ch of p)h=(h*31+ch.charCodeAt(0))>>>0;const street=p==='PE6 0JH'?'Willow Lane':STREETS[h%STREETS.length];const start=p==='PE6 0JH'?8:(h>>4)%6*2+2;
  const out=[];for(let i=0;i<8;i++)out.push(`${start+i*2} ${street}, ${town}, ${p}`);
  out.splice(3,0,`Flat 1, ${start+5} ${street}, ${town}, ${p}`,`Flat 2, ${start+5} ${street}, ${town}, ${p}`);
  out.push(`${['Rose Cottage','The Old Bakery','Fenside House'][h%3]}, ${street}, ${town}, ${p}`);
  return [...new Set(out)];}
function doCheckin(id,method,flag){
  const v=V_(id);S.tick++;v.checkin={method,capture:stamp(),receipt:S.cl.offline?null:stamp(),flag:flag||null};v.state='in_progress';v.accessViewed=true;
  audit('Checked in',`${id} · ${method}`,flag||'',S.staff[S.cl.persona].name);event('visit.started',id);toast(S.cl.offline?'Checked in. Will sync when online.':'Checked in')
}
function upload(vid,tid,eid,fail){
  setTimeout(()=>{const t=V_(vid).tasks.find(x=>x.id===tid);const ev=t.ev.find(x=>x.id===eid);if(!ev||ev.status!=='uploading')return;
    if(S.cl.offline){ev.status='queued'}else if(fail){ev.status='failed'}else{ev.status='synced';ev.receipt=stamp()}
    trySubmitQueued();render()},900);
}
function syncNow(){
  Object.values(S.visits).forEach(v=>{if(v.checkin&&!v.checkin.receipt)v.checkin.receipt=stamp();
    v.tasks.forEach(t=>t.ev.forEach(ev=>{if(ev.status==='queued'){ev.status='uploading';upload(v.id,t.id,ev.id,false)}}))});
  trySubmitQueued();
}
function trySubmitQueued(){
  Object.values(S.visits).forEach(v=>{if(v.submission&&v.submission.queued&&!S.cl.offline&&v.tasks.every(t=>t.ev.every(e=>e.status==='synced'))){
    v.submission.queued=false;v.submission.receivedAt=stamp();v.state='submitted';v.checkout=v.checkout||stamp();audit('Completion submission received',`${v.id} r${v.submission.rev} key ${v.submission.idem}`,'Synced from offline queue','System');event('visit.submitted',v.id)}});
}
