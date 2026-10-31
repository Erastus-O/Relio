/* SIGN IN AND SIGN UP */
const AUTH_DEMO={pw:'Clean2026!',mfa:'482913',sms:'246810',email:'735204'};
const AU={business:{mode:'login',step:1,f:{},err:'',info:''},cleaner:{mode:'welcome',step:1,f:{},err:'',info:''},customer:{mode:'login',step:1,f:{},err:'',info:''},fails:{},lock:{}};
const AUTH_COPY={
  business:{title:'Business workspace',who:'For service businesses: owners, managers and office staff',points:['Plan the rota and fill gaps before the notice deadline','Review evidence, resolve disputes and invoice in one place','See your margins, cash and capacity, and ask the assistant'],login:'Log in to your workspace',signup:'Add your business'},
  cleaner:{title:'Pro app',who:'For pros invited by the business they work for',points:['See your published shifts and jobs, and respond in one tap','Record start and finish, tasks and the right evidence for each job, even offline','Find your training and materials in one place'],login:'Log in to the Pro app',signup:'Activate your account'},
  customer:{title:'Find and book local services',who:'One account for every provider you use',points:['Find nearby businesses that cover your address, on a map or a list','Book instantly or request a quote, with the price shown up front','Track each booking and raise a concern with the right provider'],login:'Log in to your account',signup:'Create your account'}};
const pwHash=p=>'ck:'+cks('nok-salt|'+p);
const normMob=m=>String(m||'').replace(/[\s()-]/g,'').replace(/^\+44/,'0');
const okEmail=e=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e||'');
const okMob=m=>/^07\d{9}$/.test(normMob(m));
const pwIssue=p=>!p||p.length<10?'Use at least 10 characters.':!/[A-Za-z]/.test(p)||!/\d/.test(p)?'Include at least one letter and one number.':'';
function inviteCode(){const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='FF-';for(let i=0;i<4;i++)s+=a[Math.floor(Math.random()*a.length)];return s}
function authInit(){
  if(!S.auth)S.auth={business:null,cleaner:null,customer:null};
  if(!S.accounts){const pw=pwHash(AUTH_DEMO.pw);
    S.accounts=[{type:'business',email:'dami.cole@fenlandfresh.example',pw,name:ME_BIZ,role:'Owner',mfa:true}];
    [['amara','amara.okafor@example.com','Amara Okafor'],['sam','sam.ellis@harbour-logistics.example','Sam Ellis'],['jordan','jordan.price@harbour-logistics.example','Jordan Price']].forEach(([p,e,n])=>S.accounts.push({type:'customer',email:e,pw,name:n,persona:p}));
    ['s1','s2','s4','s5'].forEach(id=>S.accounts.push({type:'cleaner',mobile:normMob(S.staff[id].phone),name:S.staff[id].name,staff:id}));Object.entries(XPROS).forEach(([k,x])=>S.accounts.push({type:'cleaner',mobile:normMob(x.mobile),name:x.name,ext:k}));
    if(S.staff.s3&&!S.staff.s3.invite)S.staff.s3.invite='FF-3PS9';}
  if(S.extraPersonas)Object.assign(PERSONAS,S.extraPersonas);
  proSeed();proEmailSeed();
}
function authSignIn(s,acc){if(s==='business'&&S.mkt&&S.mkt.bizAdm){const k=acc.prov||'ff';if(S.mkt.bizAdm[k])S.mkt.bizAdm[k].lastLogin=today()}S.auth[s]={name:acc.name,email:acc.email||null,mobile:acc.mobile||null,at:stamp(),persona:acc.persona||acc.staff||null};if(s==='business'&&S.prefs&&S.prefs.start&&S.biz)S.biz.view=S.prefs.start;
  if(s==='cleaner'&&acc.staff){S.cl.persona=acc.staff;S.cl.ext=null;S.cl.view='today';S.cl.job=null}if(s==='cleaner'&&acc.ext){S.cl.ext=acc.ext;S.cl.xjob=null}
  if(s==='customer'&&acc.persona){S.cu.persona=acc.persona;S.cu.visit=null;S.cu.caseId=null;const p=PERSONAS[acc.persona];S.cu.view='home'}
  AU.fails[s]=0;AU[s]={mode:'login',step:1,f:{},err:'',info:''};audit('Signed in',`${acc.name} · ${s}`,'',acc.name)}
function authOut(s){const a=S.auth[s];S.auth[s]=null;if(s==='business')S.agentOpen=false;AU[s]={mode:s==='cleaner'?'welcome':'login',step:1,f:{},err:'',info:'You have signed out.'};if(a)audit('Signed out',`${a.name} · ${s}`,'',a.name)}
function authField(s,k,label,o={}){const v=AU[s].f[k]||'';const id=`au-${k}`;const type=o.type||'text';
  const pw=type==='password';const show=pw&&AU[s].show;
  return `<label class="f" for="${id}">${label}${o.req===false?' <span class="hint">(optional)</span>':''}<span class="au-in${pw?' pw':''}"><input id="${id}" type="${show?'text':type}" data-au="${k}" value="${esc(v)}" ${o.ac?`autocomplete="${o.ac}"`:''} ${o.ph?`placeholder="${esc(o.ph)}"`:''} ${o.mode?`inputmode="${o.mode}"`:''} ${o.max?`maxlength="${o.max}"`:''}>${pw?`<button type="button" class="btn sm ghost au-eye" data-act="auShow" aria-pressed="${!!show}">${show?'Hide':'Show'}</button>`:''}</span>${o.hint?`<span class="hint">${o.hint}</span>`:''}</label>`}
function authCheck(s,k,label){return `<label class="row small au-check"><input type="checkbox" data-au="${k}" ${AU[s].f[k]?'checked':''}> <span>${label}</span></label>`}
function authDemo(s){const d=AUTH_DEMO;
  const row=(l,v,act,id)=>`<div class="row" style="justify-content:space-between;gap:8px;flex-wrap:nowrap"><span>${l}: <b class="mono">${esc(v)}</b></span>${act?`<button type="button" class="btn sm" data-act="${act}" ${id?`data-id="${id}"`:''}>Use</button>`:''}</div>`;
  if(s==='business')return row('Email','dami.cole@fenlandfresh.example','auFill','biz')+row('Password',d.pw)+row('Authenticator code',d.mfa);
  if(s==='customer')return row('Home','amara.okafor@example.com','auFill','amara')+row('Business approver','sam.ellis@harbour-logistics.example','auFill','sam')+row('Password',d.pw);
  const em=id=>(S.staff&&S.staff[id]?S.staff[id].email:XPROS[id]?XPROS[id].email:'')||'';return row('Grace (cleaning)',em('s1')||'grace.adeyemi@mail.example','auFill','s1')+row('Sam (repairs)',em('x1')||'sam.okoro@mail.example','auFill','x1')+row('Aisha (tutoring)',em('x2')||'aisha.khan@mail.example','auFill','x2')+row('Email code',d.email)+row('Priya’s invite code','FF-3PS9','auFill','invite')+row('Tom’s invite code (new hire)','FF-7KQ2','auFill','invite2')}
function renderAuth(s){authInit();const A=AU[s];const C=AUTH_COPY[s];const locked=AU.lock[s]&&AU.lock[s]>Date.now();
  let form='',title='',sub='';
  const err=A.err?`<div class="note bad small" role="alert">${esc(A.err)}</div>`:'';const info=A.info?`<div class="note good small" role="status">${esc(A.info)}</div>`:'';
  const submit=(l,act='auSubmit')=>`<button type="button" class="btn primary au-go" data-act="${act}" ${locked?'disabled':''}>${l}</button>`;
  if(A.mode==='login'){title=C.login;
    if(s==='business'){if(A.step===1){sub='Use your work email.';form=authField(s,'email','Work email',{type:'email',ac:'username',ph:'you@business.co.uk'})+authField(s,'pw','Password',{type:'password',ac:'current-password'})+`<div class="row" style="justify-content:space-between">${authCheck(s,'remember','Keep me signed in on this device')}<button type="button" class="linkbtn small" data-act="auMode" data-v="forgot">Forgot password?</button></div>`+submit('Log in')}
      else{sub='Your account uses two-step verification.';form=authField(s,'otp','6-digit code from your authenticator app',{mode:'numeric',max:6,ac:'one-time-code',ph:'000000'})+submit('Verify and continue')+`<button type="button" class="linkbtn small" data-act="auBack">Use a different account</button>`}}
    if(s==='customer'){sub='Welcome back.';form=authField(s,'email','Email',{type:'email',ac:'username'})+authField(s,'pw','Password',{type:'password',ac:'current-password'})+`<div class="row" style="justify-content:space-between">${authCheck(s,'remember','Keep me signed in')}<button type="button" class="linkbtn small" data-act="auMode" data-v="forgot">Forgot password?</button></div>`+submit('Log in')+`<div class="au-or"><span>or</span></div><button type="button" class="btn au-go" data-act="auLink">Email me a sign-in link</button>`}
    if(s==='cleaner'){if(A.step===1){sub='We’ll text you a code. No password to remember.';form=authField(s,'mobile','Mobile number',{type:'tel',mode:'tel',ac:'tel',ph:'07700 900 123',hint:'The number your employer has on file.'})+submit('Text me a code')}
      else{sub=`We sent a 6-digit code to ${esc(A.f.mobile||'')}.`;form=authField(s,'otp','Code',{mode:'numeric',max:6,ac:'one-time-code',ph:'000000'})+submit('Log in')+`<div class="row" style="justify-content:space-between"><button type="button" class="linkbtn small" data-act="auResend">Resend code</button><button type="button" class="linkbtn small" data-act="auBack">Change number</button></div>`}}}
  if(A.mode==='signup'){title=C.signup;
    if(s==='business'){mktInit();const r=obForm(A);sub=r.sub;form=r.form}
    if(s==='customer'){sub=A.step===1?'Takes about a minute.':'Check your email';
      if(A.step===1)form=`<fieldset class="au-fs"><legend class="label">Account type</legend><div class="choice">${[['home','For my home'],['business','For a business']].map(([k,l])=>`<label><input type="radio" name="au-kind" data-au="kind" value="${k}" ${(A.f.kind||'home')===k?'checked':''}> ${l}</label>`).join('')}</div></fieldset>`
        +((A.f.kind==='business')?authField(s,'company','Company name',{ac:'organization'}):'')
        +authField(s,'name','Full name',{ac:'name'})+authField(s,'email','Email',{type:'email',ac:'email'})+`<div class="grid2">${authField(s,'mobile','Mobile number',{type:'tel',ac:'tel',ph:'07…'})}${authField(s,'pc','Postcode',{ac:'postal-code',ph:'PE6 0AB',hint:'Used to suggest nearby services. You can book for any address.'})}</div>`
        +authField(s,'pw','Create a password',{type:'password',ac:'new-password',hint:'At least 10 characters, with a letter and a number.'})
        +authCheck(s,'terms','I agree to the <a href="#" onclick="return false">terms of service</a> and <a href="#" onclick="return false">privacy notice</a>')+authCheck(s,'mkt','Send me occasional offers (optional)')+submit('Create account');
      else form=authField(s,'otp',`Code we emailed to ${esc(A.f.email||'')}`,{mode:'numeric',max:6,ac:'one-time-code',ph:'000000'})+submit('Verify and continue')+`<div class="row" style="justify-content:space-between"><button type="button" class="linkbtn small" data-act="auResend">Resend email</button><button type="button" class="linkbtn small" data-act="auBack">Back</button></div>`}
    if(s==='cleaner'){sub=A.step===1?'Your employer sends you an invite code when they add you.':A.step===2?`We sent a 6-digit code to ${esc(A.f.mobile||'')}.`:'';
      if(A.step===1)form=authField(s,'invite','Invite code',{ph:'FF-XXXX',hint:'It’s in the message from your employer.'})+authField(s,'mobile','Your mobile number',{type:'tel',ac:'tel',ph:'07…'})+authCheck(s,'terms','I agree to the <a href="#" onclick="return false">app terms</a> and <a href="#" onclick="return false">privacy notice</a>')+submit('Text me a code');
      else form=authField(s,'otp','Code',{mode:'numeric',max:6,ac:'one-time-code',ph:'000000'})+submit('Activate account')+`<div class="row" style="justify-content:space-between"><button type="button" class="linkbtn small" data-act="auResend">Resend code</button><button type="button" class="linkbtn small" data-act="auBack">Back</button></div>`}}
  if(A.mode==='forgot'){title='Reset your password';sub='We’ll email you a link to choose a new one.';form=authField(s,'email','Email',{type:'email',ac:'username'})+submit('Send reset link','auReset')+`<button type="button" class="linkbtn small" data-act="auMode" data-v="login">Back to log in</button>`}
  if(A.mode==='link'){title='Check your email';sub=`If ${esc(A.f.email||'that address')} has an account, a sign-in link is on its way. It works once and expires in 15 minutes.`;form=`<button type="button" class="btn primary au-go" data-act="auLinkOpen">Open sign-in link (demo)</button><button type="button" class="linkbtn small" data-act="auMode" data-v="login">Back to log in</button>`}
  const tabs=['login','signup'].includes(A.mode)?`<div class="seg au-tabs" role="tablist" aria-label="Log in or sign up">${[['login','Log in'],['signup','Sign up']].map(([k,l])=>`<button role="tab" aria-selected="${A.mode===k}" aria-pressed="${A.mode===k}" data-act="auMode" data-v="${k}">${l}</button>`).join('')}</div>`:'';
  return `<div class="au-wrap${s==='business'&&A.mode==='signup'&&A.step>1?' au-wide':''}"><section class="au-brand" aria-hidden="false"><div class="au-mark" aria-hidden="true">${BRAND_SVG}</div><p class="label">${s==='business'||s==='cleaner'?'Fenland Fresh Cleaning':PLATFORM}</p><h1>${C.title}</h1><p class="muted">${C.who}</p>
      <ul class="au-points">${C.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul></section>
    <section class="card au-card"><form class="stack" onsubmit="return false" novalidate>${tabs}<div class="stack tight"><h2>${title}</h2>${sub?`<p class="muted small">${sub}</p>`:''}</div>${info}${err}${locked?`<div class="note bad small">Too many attempts. Try again in ${Math.ceil((AU.lock[s]-Date.now())/60000)} minutes, or reset your password.</div>`:''}${form}</form>
      <details class="au-demo"><summary class="small">Demo accounts</summary><div class="stack tight small">${authDemo(s)}</div></details></section></div>`}
const BRAND_SVG='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 20h16"/><path d="M7 20V9l5-5 5 5v11"/><path d="M10 14l1.5 1.5L15 12"/></svg>';
function auFail(s,msg){AU.fails[s]=(AU.fails[s]||0)+1;if(AU.fails[s]>=5){AU.lock[s]=Date.now()+15*60000;AU.fails[s]=0}AU[s].err=msg;return}
const AU_ACT={
  auMode:e=>{const s=S.surface;AU[s]={mode:e.v,step:1,f:{email:AU[s].f.email||''},err:'',info:''}},
  auBack:()=>{const s=S.surface;const A=AU[s];A.err='';A.info='';A.f.otp='';if(A.step>1)A.step--;},
  auShow:()=>{const s=S.surface;AU[s].show=!AU[s].show},
  auResend:()=>{const s=S.surface;AU[s].info=s==='cleaner'?'New code sent. Codes expire after 10 minutes.':'We’ve sent another email.';AU[s].err=''},
  auFill:e=>{const s=S.surface;const A=AU[s];A.err='';
    if(e.id==='biz'){A.mode='login';A.step=1;A.f={email:'dami.cole@fenlandfresh.example',pw:AUTH_DEMO.pw}}
    else if(PERSONAS[e.id]){const acc=S.accounts.find(a=>a.persona===e.id);A.mode='login';A.step=1;A.f={email:acc.email,pw:AUTH_DEMO.pw}}
    else if(e.id==='invite'){A.mode='signup';A.step=1;A.f={invite:'FF-3PS9',email:S.staff.s3.email,terms:true}}
    else if(e.id==='invite2'){A.mode='signup';A.step=1;A.f={invite:'FF-7KQ2',email:S.staff.s9.email,terms:true}}
    else if(S.staff[e.id]){A.mode='login';A.step=1;A.f={email:S.staff[e.id].email}}
    else if(XPROS[e.id]){A.mode='login';A.step=1;A.f={email:XPROS[e.id].email}}},
  auLink:()=>{const s=S.surface;const A=AU[s];if(!okEmail(A.f.email)){A.err='Enter your email address first.';return}A.mode='link';A.err=''},
  auLinkOpen:()=>{const s=S.surface;const acc=S.accounts.find(a=>a.type===s&&a.email===(AU[s].f.email||'').toLowerCase());if(!acc){AU[s]={mode:'login',step:1,f:{},err:'That link isn’t valid any more. Log in or request a new one.',info:''};return}authSignIn(s,acc);toast(`Signed in as ${acc.name}`)},
  auReset:()=>{const s=S.surface;const A=AU[s];if(!okEmail(A.f.email)){A.err='Enter a valid email address.';return}const em=A.f.email;AU[s]={mode:'login',step:1,f:{email:em},err:'',info:`If ${em} has an account, we’ve sent a reset link. Check your inbox.`}},
  auSubmit:()=>{const s=S.surface;const A=AU[s];const f=A.f;A.err='';A.info='';
    if(AU.lock[s]&&AU.lock[s]>Date.now())return;
    if(A.mode==='login'){
      if(s==='business'){if(A.step===1){if(!okEmail(f.email)||!f.pw){A.err='Enter your work email and password.';return}const acc=S.accounts.find(a=>a.type==='business'&&a.email===f.email.trim().toLowerCase());if(!acc||acc.pw!==pwHash(f.pw)){auFail(s,'That email and password don’t match an account.');return}A.pending=acc.email;A.step=2;f.pw='';return}
        if((f.otp||'').trim()!==AUTH_DEMO.mfa){auFail(s,'That code isn’t right. Codes change every 30 seconds.');return}const acc=S.accounts.find(a=>a.email===A.pending);authSignIn(s,acc);toast(`Welcome back, ${acc.name.split(' ')[0]}`);return}
      if(s==='customer'){if(!okEmail(f.email)||!f.pw){A.err='Enter your email and password.';return}const acc=S.accounts.find(a=>a.type==='customer'&&a.email===f.email.trim().toLowerCase());if(!acc||acc.pw!==pwHash(f.pw)){auFail(s,'That email and password don’t match an account.');return}authSignIn(s,acc);toast(`Welcome back, ${acc.name.split(' ')[0]}`);return}
      if(s==='cleaner'){if(A.step===1){if(!okMob(f.mobile)){A.err='Enter a UK mobile number starting 07.';return}A.step=2;A.info='';return}
        if((f.otp||'').trim()!==AUTH_DEMO.sms){auFail(s,'That code isn’t right. Check the latest text we sent.');return}const acc=S.accounts.find(a=>a.type==='cleaner'&&a.mobile===normMob(f.mobile));
        if(!acc){const gone=Object.values(S.staff).find(x=>x.app&&x.app.status==='removed'&&normMob(x.app.mobile||x.phone)===normMob(f.mobile));if(gone){A.step=1;A.err='Your access to the Pro app has been removed by Fenland Fresh. Contact your employer if you think this is a mistake.';return}const inv=Object.values(S.staff).find(x=>x.app&&x.app.status==='invited'&&normMob(x.app.mobile||x.phone)===normMob(f.mobile));A.step=1;A.err=inv?`${inv.name.split(' ')[0]}, Fenland Fresh has added you to their team. Activate your account with the invite code they texted you.`:'Only professionals added by their employer can use the Pro app. Ask your employer to add you as an employee, then use the invite code they send.';return}
        if(acc.staff&&S.staff[acc.staff]&&S.staff[acc.staff].app&&S.staff[acc.staff].app.status==='removed'){A.step=1;A.err='Your access to the Pro app has been removed. Contact your employer.';return}
        authSignIn(s,acc);toast(`Hi ${acc.name.split(' ')[0]}`);return}}
    if(A.mode==='signup'){
      if(s==='business'){if(A.step===1){if(!f.name||f.name.trim().split(/\s+/).length<2){A.err='Enter your first and last name.';return}if(!okEmail(f.email)){A.err='Enter a valid work email.';return}if(S.accounts.some(a=>a.email===f.email.trim().toLowerCase())){A.err='An account already uses that email. Log in instead.';return}const p=pwIssue(f.pw);if(p){A.err=p;return}A.step=2;return}
        if(A.step===2){if(!f.biz){A.err='Enter your business name.';return}const pe=pcError(f.pc||'');if(pe){A.err=pe;return}if(!['svc_reg','svc_deep','svc_eot','svc_com'].some(k=>f[k])){A.err='Choose at least one service.';return}if(!f.terms){A.err='Agree to the terms to continue.';return}A.step=3;A.info=`We’ve emailed a code to ${f.email}.`;return}
        if((f.otp||'').trim()!==AUTH_DEMO.email){A.err='That code isn’t right. Check the email we sent.';return}
        const acc={type:'business',email:f.email.trim().toLowerCase(),pw:pwHash(f.pw),name:f.name.trim(),role:'Owner',mfa:false,business:f.biz};S.accounts.push(acc);audit('Business account created',`${f.biz} · ${acc.email}`,'',acc.name);
        authSignIn(s,acc);ACT.biz({v:'pricing'});toast('Workspace created. Start by setting your prices.');return}
      if(s==='customer'){if(A.step===1){const kind=f.kind||'home';if(kind==='business'&&!f.company){A.err='Enter your company name.';return}if(!f.name||f.name.trim().split(/\s+/).length<2){A.err='Enter your first and last name.';return}if(!okEmail(f.email)){A.err='Enter a valid email address.';return}
          if(S.accounts.some(a=>a.email===f.email.trim().toLowerCase())){A.err='An account already uses that email. Log in instead.';return}if(!okMob(f.mobile)){A.err='Enter a UK mobile number starting 07.';return}
          const pe=pcError(f.pc||'');if(pe){A.err=pe;return}const area=normPc(f.pc).split(' ')[0];
          const p=pwIssue(f.pw);if(p){A.err=p;return}if(!f.terms){A.err='Agree to the terms to continue.';return}A.step=2;A.info=`We’ve emailed a code to ${f.email}.`;return}
        if((f.otp||'').trim()!==AUTH_DEMO.email){A.err='That code isn’t right. Check the email we sent.';return}
        const kind=f.kind||'home';const cid='c'+(S.seq++);const nm=f.name.trim();const em=f.email.trim().toLowerCase();const pc=normPc(f.pc);
        S.customers[cid]={name:kind==='business'?f.company.trim():nm,type:kind==='business'?'commercial':'domestic',since:today(),entity:kind==='business'?f.company.trim():`${nm} (individual)`,arrangement:'No active plan yet',billing:kind==='business'?'Monthly invoice · terms to agree':'Card via payment provider · charged 24 hours before each visit',termsDays:kind==='business'?14:0,contacts:[{name:nm,role:kind==='business'?'Approver':'Account holder',scope:'All',limit:'–',email:em,phone:f.mobile}]};
        S.sites[cid]={id:cid,customer:cid,name:kind==='business'?f.company.trim():nm,short:kind==='business'?f.company.trim().split(' ')[0]:nm.split(' ').slice(-1)[0]+' home',type:kind==='business'?'commercial':'domestic',tpl:kind==='business'?'office':'dom',addr:`Address to confirm, ${pc}`,photo:'allowed',access:'To be confirmed at first visit',secret:'Not set',needs:''};
        const pid='p'+cid;const per={name:nm,role:kind==='business'?'Business customer':'Domestic customer',customer:cid,approver:kind==='business',limit:kind==='business'?100000:0};PERSONAS[pid]=per;(S.extraPersonas=S.extraPersonas||{})[pid]=per;
        const acc={type:'customer',email:em,pw:pwHash(f.pw),name:nm,persona:pid,marketing:!!f.mkt};S.accounts.push(acc);audit('Customer account created',`${S.customers[cid].name} · ${em}`,'',nm);
        authSignIn(s,acc);toast('Account created. Welcome!');return}
      if(s==='cleaner'){if(A.step===1){const code=(f.invite||'').trim().toUpperCase();const st=Object.values(S.staff).find(x=>x.invite===code);if(!st){A.err='We don’t recognise that invite code. Check the message from your employer.';return}
          if(st.app&&st.app.status==='removed'){A.err='This invite is no longer valid. Ask your employer for a new one.';return}if(S.accounts.some(a=>a.type==='cleaner'&&a.staff===st.id)){A.err='This invite has already been used. Log in instead.';return}if(st.app&&st.app.mobile&&/^07/.test(normMob(st.app.mobile))&&normMob(st.app.mobile)!==normMob(f.mobile||'')){A.err=`Use the mobile number your employer has for you, ending ${normMob(st.app.mobile).slice(-3)}.`;return}if(!okMob(f.mobile)){A.err='Enter a UK mobile number starting 07.';return}if(!f.terms){A.err='Agree to the terms to continue.';return}A.staff=st.id;A.step=2;A.info=`Invite found for ${st.name}.`;return}
        if((f.otp||'').trim()!==AUTH_DEMO.sms){A.err='That code isn’t right. Check the latest text we sent.';return}
        const st=S.staff[A.staff];const acc={type:'cleaner',mobile:normMob(f.mobile),name:st.name,staff:st.id};S.accounts.push(acc);if(!/^07/.test(normMob(st.phone)))st.phone=f.mobile;st.invite=null;st.app={status:'active',mobile:f.mobile,at:stamp()};if(!st.proOnb)st.proOnb={step:0,d:{}};
        notify(st.id,'Your cleaner app account is active.');audit('Cleaner app activated',st.name,'Invite code redeemed',st.name);authSignIn(s,acc);toast(`Welcome, ${st.name.split(' ')[0]}`);return}}},
  signOut:()=>{const s=S.surface;authOut(s)}
};
