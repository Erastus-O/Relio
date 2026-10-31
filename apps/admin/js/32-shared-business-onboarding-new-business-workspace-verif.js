/* BUSINESS ONBOARDING + NEW-BUSINESS WORKSPACE + VERIFICATION */
const OB_TYPES={cleaning:['Regular clean','Deep clean','End of tenancy','Office and commercial','Carpet and upholstery','Specialist'],repairs:['Handyman','Plumbing (minor)','Electrical (minor)','Appliance repair','Assembly and fitting'],tutoring:['Maths','English','Science','Exam preparation','Languages','Music'],gardening:['Lawn care','Hedges and pruning','Garden clearance'],pets:['Dog walking','Pet sitting','Grooming']};
const OB_DAYS=[[1,'Mon'],[2,'Tue'],[3,'Wed'],[4,'Thu'],[5,'Fri'],[6,'Sat'],[0,'Sun']];
function obModes(f){const m=[];if(f.m_mobile)m.push('mobile');if(f.m_venue)m.push('venue');if(f.m_online)m.push('online');return m.length?m:['mobile']}
function obNewSvc(f){const cat=f.cat&&OB_TYPES[f.cat]?f.cat:'cleaning';const type=OB_TYPES[cat][0];return {name:'',cat,type,mode:obModes(f)[0],pm:pmPreset(cat,type),desc:''}}
function obSet(path,val){const A=AU.business;const parts=path.split('.');if(parts[0]==='svcs'){const sv=A.svcs[+parts[1]];const k=parts[2];if(k==='model'){sv.pm=pmDefaults(val,sv.cat,sv.type);return}if(k==='cat'){sv.cat=val;sv.type=OB_TYPES[val][0];sv.pm=pmPreset(sv.cat,sv.type);return}if(k==='type'){sv.type=val;sv.pm=pmPreset(sv.cat,val);return}}let o=parts[0]==='f'?A.f:A[parts[0]];for(let i=1;i<parts.length-1;i++)o=o[parts[i]];o[parts[parts.length-1]]=val}
function obSubmit(){const A=AU.business;const f=A.f;A.err='';A.info='';const n=A.step;
  if(n===1){if(!f.name||f.name.trim().split(/\s+/).length<2){A.err='Enter your first and last name.';return}if(!okEmail(f.email)){A.err='Enter a valid work email.';return}if(S.accounts.some(a=>a.email===f.email.trim().toLowerCase())){A.err='An account already uses that email. Log in instead.';return}const p=pwIssue(f.pw);if(p){A.err=p;return}
    ['d1','d2','d3','d4','d5'].forEach(k=>{if(f[k]==null)f[k]=true});if(f.m_mobile==null)f.m_mobile=true;A.step=2;return}
  if(n===2){if(!f.biz||f.biz.trim().length<2){A.err='Enter your trading name.';return}if((f.struct||'ltd')==='ltd'&&!/^[A-Z0-9]{8}$/i.test((f.co||'').trim())){A.err='Enter your 8-character company number, or choose sole trader.';return}
    if(!f.about||f.about.trim().length<20){A.err='Describe your business in at least 20 characters.';return}if(!/^0\d{9,10}$/.test(normMob(f.phone||''))){A.err='Enter a UK phone number.';return}if(!f.addr){A.err='Enter your address.';return}
    const pe=pcError(f.pc||'');if(pe){A.err=pe;return}const d=normPc(f.pc).split(' ')[0];if(!GEO[d]){A.err=`We’re not live in ${d} yet. You can still register interest, but you can’t publish services there.`;return}
    if(!OB_DAYS.some(([x])=>f['d'+x])){A.err='Choose at least one working day.';return}if(+(f.to||18)<=+(f.from||8)){A.err='Finish time must be after start time.';return}
    if(!A.svcs.length)A.svcs.push(obNewSvc(f));const ms=obModes(f);A.svcs.forEach(s=>{if(!ms.includes(s.mode))s.mode=ms[0]});A.step=3;return}
  if(n===3){for(const [i,s] of A.svcs.entries()){if(!s.name||s.name.trim().length<3){A.err=`Name service ${i+1}.`;return}if(!s.pm)s.pm=pmPreset(s.cat,s.type);const pe=pmValid(s.pm);if(pe){A.err=`${s.name}: ${pe}`;return}}A.step=4;return}
  if(n===4){for(const a of A.adds){if(!a.name||a.name.trim().length<2){A.err='Name each add-on, or remove it.';return}if(!(+a.price>=0)||a.price===''){A.err=`Enter a price for “${a.name}”.`;return}}A.step=5;A.info=`We’ve emailed a code to ${f.email}.`;return}
  if(!f.terms){A.err='Agree to the business terms to continue.';return}if((f.otp||'').trim()!==AUTH_DEMO.email){A.err='That code isn’t right. Check the email we sent.';return}
  obCreate()}
function obCreate(){const A=AU.business;const f=A.f;mktInit();adBizInit();const M=S.mkt;const key='n'+(S.seq++);const d=normPc(f.pc).split(' ')[0];
  const cats=[...new Set(A.svcs.map(s=>s.cat))];const ms=obModes(f);const days=OB_DAYS.filter(([x])=>f['d'+x]).map(([x])=>x);
  M.prov[key]={name:f.biz.trim(),cats,base:{d,public:!!f.m_venue,label:f.m_venue?f.addr.trim():''},rating:0,reviews:0,verified:false,since:'2026',about:f.about.trim(),isNew:true};
  A.svcs.forEach((s,i)=>{const p=pmFrom(s.pm);M.listings.push({id:`L-${key}-${i+1}`,prov:key,cat:s.cat,name:s.name.trim(),type:s.type,mode:s.mode,booking:pmBooking(s.pm),status:'draft',pm:pmClone(s.pm),
    cov:s.mode==='online'?{type:'online'}:s.mode==='venue'?{type:'venue',km:15}:{type:'radius',km:+(f.radius||15),ex:[]},price:pmLabel(s.pm),from:p,pt:s.pm.model,desc:s.desc||'',avail:{days,from:+(f.from||8),to:+(f.to||18)},
    addons:A.adds.filter(a=>a.to==='all'||+a.to===i).map(a=>({name:a.name.trim(),price:Math.round(+a.price*100)}))})});
  const creds=['Identity check (owner)',...new Set(cats.flatMap(c=>M.cats[c].creds||[]))];
  M.bizAdm[key]={legal:f.biz.trim()+((f.struct||'ltd')==='ltd'&&!/ltd|limited/i.test(f.biz)?' Ltd':''),co:(f.struct||'ltd')==='ltd'?f.co.trim().toUpperCase():(f.struct==='sole'?'Sole trader':'Partnership'),email:f.email.trim().toLowerCase(),phone:f.phone,owner:f.name.trim(),plan:'Starter',status:'onboarding',
    docs:creds.map((t,i)=>({id:`DOC-${key}-${i+1}`,type:t,file:'',uploaded:'',expires:'',status:'missing'})),notes:[]};
  (S.nb=S.nb||{})[key]={struct:f.struct||'ltd',addr:f.addr.trim(),pc:normPc(f.pc),web:f.web||'',team:f.team||'Just me',hours:{days,from:+(f.from||8),to:+(f.to||18)},radius:+(f.radius||15),modes:ms,
    v:{mobile:{num:'',ok:false,sent:false},biz:{ok:false},id:{file:'',selfie:false,ok:false},docs:{},pay:{ok:false},status:'draft'}};
  const acc={type:'business',email:f.email.trim().toLowerCase(),pw:pwHash(f.pw),name:f.name.trim(),role:'Owner',mfa:false,business:f.biz.trim(),prov:key};S.accounts.push(acc);
  audit('Business account created',`${f.biz} · ${acc.email}`,`${A.svcs.length} services, ${A.adds.length} add-ons`,acc.name);adAudit('New business registered',`${key}: ${f.biz}`,'Verification not started');
  authSignIn('business',acc);S.biz.nview='start';toast('Workspace created. Next, verify your business.')}
function bizTenant(){const a=S.auth&&S.auth.business;if(!a)return 'ff';const acc=(S.accounts||[]).find(x=>x.type==='business'&&x.email===a.email);return acc&&acc.prov&&S.mkt&&S.mkt.prov[acc.prov]?acc.prov:'ff'}
function nbState(k){return S.nb[k]}
