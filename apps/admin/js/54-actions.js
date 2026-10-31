/* actions */
const ACT={
  surface:e=>{S.surface=e.v;S.modal=null},
  reset:()=>{try{localStorage.removeItem(KEY)}catch(x){}buildSeed();toast('Demo reset to sample data')},
  biz:e=>{if(S.agentOpen&&window.innerWidth<900)S.agentOpen=false;if(e.v==='pricing')S.prDraft=JSON.parse(JSON.stringify(S.pricing));S.biz.invView=null;S.biz.invDraft=null;S.biz.visitView=null;S.biz.empView=null;S.biz.empReveal=null;S.biz.clientView=null;S.biz.clientReveal=null;if(e.v==='invoices'){S.biz.view='bookings';S.biz.bkTab='invoices'}else S.biz.view=e.v},
  period:e=>{S.biz.period=e.v},
  prOpen:()=>{S.prDraft=JSON.parse(JSON.stringify(S.pricing));S.biz.view='pricing';phInit();S.ph.tab='setup';window.scrollTo(0,0)},
  bkTab:e=>{S.biz.bkTab=e.v;S.biz.invView=null;S.biz.invDraft=null;S.biz.visitView=null},
  visitOpen:e=>{S.biz.view='bookings';S.biz.bkTab='visits';S.biz.visitView=e.id;S.biz.invView=null;S.biz.invDraft=null;S.modal=null},
  cSample:()=>{if(!S.modal)return false;S.modal.photos=S.modal.photos||[];if(S.modal.photos.length>=3){setErr('cphotoerr','You can add up to 3 photos.');return false}S.modal.photos.push(samplePhoto());cPrevRefresh();return false},
  cPhotoDel:e=>{S.modal.photos.splice(+e.i,1);cPrevRefresh();return false},
  evOpen:e=>{S.modal={type:'evPreview',v:e.v,e:e.e}},
  evNav:e=>{const m=S.modal;const list=visitPhotos(V_(m.v));const i=list.findIndex(x=>x.e.id===m.e);const n=list.length;
    let j=(i+(+e.v)+n)%n;const cur=list[i];if(cur){const step=+e.v;while(j!==i&&list[j].t.id===cur.t.id&&cur.t.ev.length>1)j=(j+step+n)%n}m.e=list[j].e.id},
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
  empView:e=>{S.biz.staffId=e.id;S.biz.empView=e.id;S.biz.empTab='personal';S.biz.empReveal=null;window.scrollTo(0,0)},
  empTab:e=>{S.biz.empTab=e.v},
  empReveal:e=>{if(S.biz.empReveal===e.id)S.biz.empReveal=null;else{S.biz.empReveal=e.id;audit('Viewed sensitive employee details',S.staff[e.id].name,'Owner review of employee record')}},
  empInviteConfirm:()=>{const name=val('inv-name'),role=val('inv-role'),type=val('inv-type'),rate=parseFloat(val('inv-rate'));
    if(name.split(' ').filter(Boolean).length<2){setErr('inverr','Enter a first and last name.');return false}if(!(rate>0)){setErr('inverr','Enter an hourly rate.');return false}const em=normEm(val('inv-email'));if(!okEmail(em)){setErr('inverr','Enter their email. The Pro app invite is sent to it.');return false}if(Object.values(S.staff).some(x=>normEm(x.email)===em)){setErr('inverr','Someone on your team already uses that email.');return false}const mob=val('inv-mob');if(mob&&!okMob(mob)){setErr('inverr','Check the mobile number, or leave it blank.');return false}
    const id='s'+(S.seq++);const parts=name.split(' ').filter(Boolean);const st=addDays(today(),7);
    S.staff[id]={id,name,display:parts[0]+' '+parts[parts.length-1][0]+'.',role,skills:[],type,isNew:true,cred:{type:'DBS basic check',status:'pending',verified:null,expires:'2000-01-01'},avail:{days:[1,2,3,4,5],from:'08:00',to:'16:00',label:'Mon–Fri 08:00–16:00'},pay:`Hourly · £${rate.toFixed(2)} ordinary`,rate:Math.round(rate*100),start:st,phone:mob||'Not yet provided',email:em,rates:[{from:st,rate:Math.round(rate*100)}],onboarding:{right:false,contract:false,induction:false,uniform:false,bank:false}};S.staff[id].invite=inviteCode();S.staff[id].app={status:'invited',email:em,mobile:mob,code:S.staff[id].invite,at:fmtD(today())};
    S.training[id]={coshh:{status:'assigned',assigned:today(),due:addDays(today(),14)},manual:{status:'assigned',assigned:today(),due:addDays(today(),14)},privacy:{status:'assigned',assigned:today(),due:addDays(today(),14)}};
    S.biz.staffId=id;S.biz.empView=id;S.biz.empTab='work';S.biz.empReveal=null;audit('Added employee',`${name} · ${role} · ${type}`,`Pro app invite ${S.staff[id].invite} emailed to ${em}`);S.modal=null;toast(`${name} added. Invite code ${S.staff[id].invite} emailed to ${em}.`)},
  onbToggle:e=>{const s=S.staff[e.id];s.onboarding[e.v]=!s.onboarding[e.v];audit(s.onboarding[e.v]?'Completed onboarding item':'Reopened onboarding item',`${s.name} · ${ONB.find(o=>o[0]===e.v)[1]}`);if(onboardingDone(s)){toast(`${s.name} has finished onboarding and can now be allocated.`)}},
  trainAssign:e=>{const d=addDays(today(),14);assignTraining(e.id,e.c,d,'');shareMats(e.c,[e.id]);S.modal=null;toast('Assigned and employee notified')},
  trainComplete:e=>{const n=val('tr-note');if(!n){setErr('trerr','Record the evidence you checked.');return false}const c=allCourses().find(x=>x.id===e.c);const s=S.staff[e.id];
    (S.training[e.id]=S.training[e.id]||{})[e.c]={status:'complete',done:today(),expires:c.months?addMonths(today(),c.months):null,note:n};audit('Recorded training completion',`${s.name} · ${c.name}`,n);
    let msg='Completion recorded';if(c.grants&&!s.skills.includes(c.grants)){s.skills.push(c.grants);audit('Skill added',`${s.name} · ${SKILL_LABEL[c.grants]}`,`Completed ${c.name}`);msg=`Recorded. ${s.display} can now be allocated to ${SKILL_LABEL[c.grants].toLowerCase()} visits.`}
    S.modal=null;toast(msg)},
  clientView:e=>{S.biz.view='clients';S.biz.clientId=e.id;S.biz.clientView=e.id;S.biz.clientTab='details';S.biz.clientReveal=null;window.scrollTo(0,0)},
  clientTab:e=>{S.biz.clientTab=e.v},
  anGo:e=>{S.biz.view=e.v;if(e.v==='clients'){S.biz.clientId=e.id;S.biz.clientView=e.id;S.biz.clientTab='details';S.biz.clientReveal=null}else if(e.v==='employees'){S.biz.staffId=e.id;S.biz.empView=e.id;S.biz.empTab='personal';S.biz.empReveal=null}else if(e.v==='cases')S.biz.caseId=e.id;window.scrollTo(0,0)},
  anScroll:e=>{const t=document.getElementById(e.v);if(t)t.scrollIntoView({behavior:'smooth',block:'start'});return false},
  anSim:e=>{const P=S.pricing;if(e.v==='price')S.an.sim.reg=Math.min(25,Math.round((targetRate(P)/P.hourly.regular-1)*100));if(e.v==='add')S.an.sim.add=Math.min(10,+e.id||1);
    if(e.v==='price'&&!S.an.sim.add)S.an.sim.add=2;setTimeout(()=>{const t=document.getElementById('an-sim');if(t)t.scrollIntoView({behavior:'smooth',block:'start'})},30)},
  clientReveal:e=>{S.biz.reveal=e.id;audit('Viewed site access code',S.sites[e.id].name,'Owner review in client record')},
  week:e=>{S.biz.week=e.v},
  closeModal:()=>{S.modal=null;S.cwResume=null},
  scrim:(e,ev)=>{if(ev.target.classList.contains('scrim'))S.modal=null;else return false},
  allocOpen:e=>{S.modal={type:'alloc',id:e.id}},
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
  supConfirm:e=>{V_(e.id).supConfirm=!V_(e.id).supConfirm},
  toggleInternal:()=>{S.biz.showInternal=!S.biz.showInternal},
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
