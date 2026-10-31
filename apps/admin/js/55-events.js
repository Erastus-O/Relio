/* events */
(function(){let tip=null;const show=(el,x,y)=>{if(!tip){tip=document.createElement('div');tip.id='antip';tip.setAttribute('role','tooltip');document.body.appendChild(tip)}
  const lines=el.dataset.tip.split('\n');tip.innerHTML='<b>'+esc(lines[0])+'</b>'+lines.slice(1).map(esc).join('\n');tip.hidden=false;
  const w=tip.offsetWidth,h=tip.offsetHeight;let L=x+14,T=y-h-12;if(L+w>innerWidth-8)L=x-w-14;if(L<8)L=8;if(T<8)T=y+16;tip.style.left=L+'px';tip.style.top=T+'px'};
  const hide=()=>{if(tip)tip.hidden=true};
  document.addEventListener('mousemove',ev=>{const el=ev.target.closest&&ev.target.closest('[data-tip]');if(el)show(el,ev.clientX,ev.clientY);else hide()});
  document.addEventListener('focusin',ev=>{const el=ev.target.closest&&ev.target.closest('[data-tip]');if(el){const r=el.getBoundingClientRect();show(el,r.left+r.width/2,r.top)}else hide()});
  document.addEventListener('focusout',hide);document.addEventListener('scroll',hide,true);})();
document.addEventListener('click',ev=>{
  const el=ev.target.closest('[data-act]');if(!el)return;
  if(el.tagName==='INPUT'&&el.type==='checkbox'&&!['offline','toggleInternal','supConfirm','onbToggle','soloToggle'].includes(el.dataset.act))return;
  if(el.tagName==='SELECT')return;
  const fn=ACT[el.dataset.act];if(!fn)return;
  const r=fn({...el.dataset,value:el.value},ev);
  if(r===false)return;render();
});
document.addEventListener('change',ev=>{
  const el=ev.target;
  if(el.dataset&&el.dataset.disc&&S.disc){S.disc[el.dataset.disc]=el.value;if(el.dataset.disc==='date'&&!el.value)S.disc.time='';if(el.dataset.disc==='mode'||el.dataset.disc==='sort')S.disc.sel=null;save();render();return}
  if(el.dataset&&el.dataset.pfimg){const k=el.dataset.pfimg;pfShrink(el.files&&el.files[0],(url,err)=>{if(!url){setErr('pf-err',err);return}PF_TMP[k]=url;const box=document.getElementById('pf-prev-'+k);if(box){const old=box.querySelector('img,span');if(old)old.remove();box.insertAdjacentHTML('afterbegin',`<img src="${url}" alt="">`)}});return}
  if(el.dataset&&(el.dataset.pmi!=null||el.classList.contains('mk-addon')||el.dataset.mk==='_date'||el.dataset.mk==='_time')&&S.modal&&S.modal.type==='mktBook'){pmLive();if(el.dataset.mk)return;return}
  if(el.dataset&&el.dataset.pme&&S.modal&&S.modal.type==='pmEdit'){pmEditSet(el);if(el.dataset.pmer)render();else{const b=document.getElementById('pm-prevbox');if(b)b.innerHTML=pmSample(S.modal.d,S.modal.cat)}return}
  if(el.dataset&&el.dataset.ob&&AU.business){obSet(el.dataset.ob,el.type==='checkbox'?el.checked:el.value);if(el.dataset.obr)render();return}
  if(el.dataset&&el.dataset.nbf){const f=el.files&&el.files[0];if(!f)return;if(f.size>10*1024*1024){toast('That file is over 10 MB.');return}const k=bizTenant();const V=nbState(k).v;const nm=`${f.name} · ${Math.max(1,Math.round(f.size/1024))} KB`;if(el.dataset.nbf==='id')V.id.file=nm;else{(V.docs[el.dataset.nbf]=V.docs[el.dataset.nbf]||{}).file=nm}const h=document.getElementById('nbf-'+el.dataset.nbf);if(h)h.textContent=nm+' · uploaded';save();return}
  if(el.dataset&&el.dataset.ofd&&S.modal&&S.modal.type==='ofForm'){ofSet(el);if(el.dataset.ofr||el.type==='radio'||el.type==='checkbox')render();else{const p=document.getElementById('of-prev');if(p)p.innerHTML=ofPreview(S.modal.d)}return}
  if(el.dataset&&el.dataset.bkimg){const fs=[...(el.files||[])];const b=tkB();b.before=b.before||[];const room=SVC_TASKS[b.svc]?Object.keys(SVC_TASKS[b.svc].rooms)[0]:'Kitchen';fs.slice(0,6-b.before.length).forEach(f=>pfShrink(f,(url,err)=>{if(!url){setErr('bp-err',err);return}if(b.before.length<6)b.before.push({src:url,room});save();render()}));return}
  if(el.dataset&&el.dataset.xph){const [oid,i]=el.dataset.xph.split('|');const f=el.files&&el.files[0];if(!f)return;pfShrink(f,(url,err)=>{if(!url){toast(err);return}const t=S.mkt.orders.find(x=>x.id===oid).tasks[+i];t.ph.push({src:url,at:stamp()});save();render()});return}
  if(el.dataset&&el.dataset.tph){const [id,tid,kind]=el.dataset.tph.split('|');const f=el.files&&el.files[0];if(!f)return;pfShrink(f,(url,err)=>{if(!url){toast(err);return}ACT.photo({id,t:tid,v:kind});const t=V_(id).tasks.find(x=>x.id===tid);const ev=t.ev[t.ev.length-1];ev.src=url;if(kind==='extra'){ev.kind='after';ev.extra=true}save();render()});return}
  if(el.dataset&&el.dataset.prn){const f=el.files&&el.files[0];if(!f)return;S.cl.rnFile=f.name;const h=document.getElementById('prn-file');if(h)h.textContent=f.name+' · added';save();return}
  if(el.dataset&&el.dataset.pof){const f=el.files&&el.files[0];if(!f)return;const s=S.staff[S.cl.persona];if(s&&s.proOnb){s.proOnb.d[el.dataset.pof]=f.name;const h=document.getElementById('pof-'+el.dataset.pof);if(h)h.textContent=f.name+' · added';save()}return}
  if(el.dataset&&el.dataset.lsp&&S.modal&&S.modal.type==='lsPick'){S.modal.sel[el.dataset.lsp]=el.checked;render();return}
  if(el.dataset&&el.dataset.adch&&ACT[el.dataset.adch]){ACT[el.dataset.adch]({...el.dataset,value:el.value,checked:el.checked});save();render();return}
  if(el.dataset&&el.dataset.adbq&&S.ad){S.ad.bq=el.value;save();render();setTimeout(()=>{const i=document.getElementById('adb-q');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},0);return}
  if(el.dataset&&el.dataset.adf&&S.ad){S.ad.lf[el.dataset.adf]=el.value;save();render();return}
  if(el.dataset&&el.dataset.adfq&&S.ad){S.ad.lf.q=el.value;save();render();setTimeout(()=>{const i=document.getElementById('adf-q');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},0);return}
  if(el.dataset&&el.dataset.dem&&S.dem){S.dem[el.dataset.dem]=el.value;S.dem.sel=null;save();render();return}
  if(el.dataset&&el.dataset.mqalso&&S.modal){S.modal.also[el.dataset.mqalso]=el.checked;return}
  if(el.dataset&&el.dataset.qb&&S.modal&&S.modal.type==='qbuild'){const n=document.getElementById('qb-name');if(n)S.modal.name=n.value;const t=document.getElementById('qb-note');if(t)S.modal.note=t.value;S.modal[el.dataset.qb]=el.value;render();return}
  if(el.dataset&&el.dataset.qbx&&S.modal&&S.modal.type==='qbuild'){const n=document.getElementById('qb-name');if(n)S.modal.name=n.value;S.modal.addons[el.dataset.qbx]=el.checked;render();return}
  if(el.dataset&&el.dataset.prfull&&S.prDraft){const p=el.dataset.prfull;prSet(p,el.type==='checkbox'?el.checked:el.value);render();return}
  if(el.dataset&&el.dataset.au&&AU[S.surface]){AU[S.surface].f[el.dataset.au]=el.type==='checkbox'?el.checked:el.value;if(el.dataset.au==='kind')render();return}
  if(el.id==='cfile'){addConcernPhotos(el.files);el.value='';return}
  if(el.id==='mat-file'){const f=el.files&&el.files[0];TR.pending=null;const h=document.getElementById('mat-fhint');if(!f)return;
    const t=document.getElementById('mat-title');if(t&&!t.value)t.value=f.name.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ');
    if(f.size>25*1048576){if(h)h.textContent='That file is over 25 MB. Upload a smaller copy or add a link instead.';el.value='';return}
    if(f.size>1048576){TR.pending={name:f.name,size:f.size,type:f.type,data:null};if(h)h.textContent=`${f.name} · ${fileSize(f.size)}. In this demo, files over 1 MB keep the name only.`;return}
    const r=new FileReader();r.onload=()=>{TR.pending={name:f.name,size:f.size,type:f.type,data:r.result};if(h)h.textContent=`${f.name} · ${fileSize(f.size)} ready to upload`};r.readAsDataURL(f);return}
  if(el.id==='ccat'){const r=document.getElementById('creq');if(r){const req=NEEDS_PHOTO.includes(el.value);r.textContent=req?'(required)':'(optional)';r.style.color=req?'var(--bad)':'var(--muted)'}return}
  if(el.dataset&&el.dataset.inv){invField(el,true);return}
  if(el.matches('select[data-act]')){const fn=ACT[el.dataset.act];if(fn){fn({...el.dataset,value:el.value});render()}return}
  const k=el.dataset.inp;if(!k)return;const b=S.book;
  if(k==='bk.svc'){b.svc=el.value;render()}
  else if(k==='bk.addon'){b.addons[el.value]=el.checked}
  else if(k==='bk.photo'){b.photo=el.value}
  else if(k==='bk.freq'){b.freq=el.value;save();render();return}
  else if(k==='bk.beds'){b.beds=el.value;save();render();return}
  else if(k==='bk.condition'){b.condition=el.value}
  else if(k==='bk.baths'){b.baths=el.value}
  else if(k==='bk.products'){b.products=el.value}
  else if(k==='bk.addr'){b.addr=el.value;b.errors={};render();return}
  else if(k==='bk.compete'){b.compete=el.checked}
  else if(k==='bk.delay'){b.delay=el.checked}
  save();
});
document.addEventListener('input',ev=>{
  const el=ev.target;if(el.id==='cn-pct'){cnCalc();return}if(el.dataset&&el.dataset.adfq&&S.ad){S.ad.lf.q=el.value;render();const i=document.getElementById('adf-q');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}return}if(el.dataset&&el.dataset.calc&&S.ph){const n=parseFloat(el.value);if(!isNaN(n)&&n>=0){S.ph.calc[el.dataset.calc]=el.dataset.u==='p'?Math.round(n*100):n;const o=document.getElementById('calcout');if(o)o.innerHTML=calcOut();save()}return}if(el.id==='me-pw-new'){pwLive(el.value);return}
  if(el.dataset&&el.dataset.au&&AU[S.surface]){AU[S.surface].f[el.dataset.au]=el.type==='checkbox'?el.checked:el.value;return}
  if(el.dataset&&el.dataset.ob&&AU.business&&el.type!=='checkbox'&&el.tagName!=='SELECT'){obSet(el.dataset.ob,el.value);return}
  if(el.dataset&&el.dataset.pmi!=null&&S.modal&&S.modal.type==='mktBook'){pmLive();return}
  if(el.dataset&&el.dataset.ofd&&S.modal&&S.modal.type==='ofForm'&&!['checkbox','radio'].includes(el.type)&&el.tagName!=='SELECT'){ofSet(el);const p=document.getElementById('of-prev');if(p)p.innerHTML=ofPreview(S.modal.d);return}
  if(el.dataset&&el.dataset.lspq&&S.modal&&S.modal.type==='lsPick'){S.modal.q=el.value;render();const i=document.getElementById('lsp-q');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}return}
  if(el.dataset&&el.dataset.pme&&S.modal&&S.modal.type==='pmEdit'&&el.type!=='checkbox'&&el.tagName!=='SELECT'){pmEditSet(el);const b=document.getElementById('pm-prevbox');if(b)b.innerHTML=pmSample(S.modal.d,S.modal.cat);return}
  if((el.id==='pmc-cost'||el.id==='pmc-m')&&S.modal&&S.modal.type==='pmEdit'){S.modal.ch={cost:+val('pmc-cost')||0,margin:Math.min(80,+val('pmc-m')||0)};const o=document.getElementById('pmc-out');if(o)o.textContent=`£${(S.modal.ch.cost/(1-S.modal.ch.margin/100)).toFixed(2)} an hour`;return}
  if(el.id==='ag-in'){AG.draft=el.value;el.style.height='auto';el.style.height=Math.min(160,el.scrollHeight)+'px';return}
  if(el.dataset.an&&S.an){const k=el.dataset.an;S.an.sim[k]=+el.value;const o=document.getElementById('an-o-'+k);const pc=v=>(v>0?'+':'')+v+'%';
    if(o)o.textContent=k==='wage'?(S.an.sim[k]<0?'−':'+')+'£'+(Math.abs(S.an.sim[k])/100).toFixed(2):['lost','add'].includes(k)?String(S.an.sim[k]):pc(S.an.sim[k]);
    const out=document.getElementById('ansimout');if(out)out.innerHTML=anSimOut();save();return}
  if(el.dataset.pr&&S.prDraft){const n=parseFloat(el.value);const v=el.dataset.u==='p'?Math.round(n*100):n;prSet(el.dataset.pr,isNaN(n)?NaN:v);el.classList.toggle('err',isNaN(n)||n<0);const sd=document.getElementById('prside');if(sd)sd.innerHTML=prSide();return}if(el.dataset.inv){if(['po','notes'].includes(el.dataset.inv))invField(el,false);return}
  const k=el.dataset.inp;if(!k)return;
  if(k==='bk.postcode'){S.book.postcode=el.value;const ab=document.getElementById('addr-block');if(ab)ab.hidden=!(S.book.addrs&&S.book.addrsFor===normPc(el.value))}
  else if(k==='bk.pets')S.book.pets=el.value;
  else if(k==='bk.access')S.book.access=el.value;
  else if(k==='bk.line1')S.book.line1=el.value;
  else if(k==='bk.town')S.book.town=el.value;
  else if(k==='po')S.flags.po=el.value;
  else if(k==='reason'){V_(el.dataset.id).tasks.find(t=>t.id===el.dataset.t).reason=el.value}
  save();
});
document.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&ev.target.dataset&&ev.target.dataset.au&&ev.target.tagName==='INPUT'&&ev.target.type!=='checkbox'&&ev.target.type!=='radio'){ev.preventDefault();AU[S.surface].f[ev.target.dataset.au]=ev.target.value;ACT.auSubmit();render();const f=document.querySelector('[data-au]');if(f&&!document.querySelector('.au-card [role=alert]'))f.focus();return}if(ev.key==='Escape'&&S.agentOpen&&!S.modal){S.agentOpen=false;render();const f=document.querySelector('.ag-fab');if(f)f.focus();return}if(ev.target.id==='ag-in'&&ev.key==='Enter'&&!ev.shiftKey&&!ev.isComposing){ev.preventDefault();const t=ev.target.value;AG.draft='';agSend(t);return}if(S.modal&&S.modal.type==='evPreview'&&(ev.key==='ArrowRight'||ev.key==='ArrowLeft')){ACT.evNav({v:ev.key==='ArrowRight'?1:-1});render();return}if(ev.key==='Enter'&&ev.target.id==='bk-postcode'){ev.preventDefault();ACT.bkFind();render();return}if(ev.key==='Enter'&&ev.target.matches&&ev.target.matches('tr[data-act]')){ev.preventDefault();ev.target.click();return}if(ev.key==='Escape'&&S.modal){S.modal=null;render()}});
Object.assign(ACT,{
  
});
Object.assign(MODALS,TR_MODALS);
Object.assign(ACT,TR_ACT);
Object.assign(ACT,AU_ACT);
Object.assign(MODALS,SET_MODALS);
Object.assign(ACT,SET_ACT);
Object.assign(MODALS,PH_MODALS);
Object.assign(ACT,PH_ACT);
Object.assign(MODALS,DISC_MODALS,BIZM_MODALS,PF_MODALS,ADX_MODALS);
Object.assign(ACT,DISC_ACT,BIZM_ACT,AD_ACT,PRO_ACT,CU_ACT,PF_ACT,ADX_ACT);
Object.assign(MODALS,OB_MODALS);
Object.assign(ACT,OB_ACT);
Object.assign(MODALS,PM_MODALS);
Object.assign(ACT,PM_ACT);
Object.assign(ACT,LSP_ACT);
MODALS.lsPick=lsPickModal;
Object.assign(ACT,IG_ACT);
Object.assign(MODALS,IG_MODALS);
Object.assign(ACT,OF_ACT);
Object.assign(MODALS,OF_MODALS);
Object.assign(ACT,PO_ACT);
Object.assign(MODALS,PO_MODALS);
Object.assign(ACT,PV_ACT);
Object.assign(ACT,PD_ACT);
Object.assign(ACT,PA_ACT);
Object.assign(ACT,WD_ACT);
Object.assign(ACT,PR_ACT);
Object.assign(ACT,CW_ACT);
Object.assign(ACT,TK_ACT);
{const _ig=ACT.igNext;ACT.igNext=e=>{const r=_ig(e);if(r!==false&&!S.modal&&S.cwResume){S.modal=S.cwResume;S.cwResume=null;S.modal.d.plat=cwPlats(S.modal.d.ch)[0]||''}return r}}
{const _ig=ACT.igTab;ACT.igTab=e=>{if(e.v==='run'){S.biz.view='campaigns';return}return _ig(e)}}
Object.assign(MODALS,PD_MODALS);
if(!load())buildSeed();
render();
