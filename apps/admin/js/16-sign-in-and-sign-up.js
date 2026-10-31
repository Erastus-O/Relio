/* SIGN IN AND SIGN UP */
const AUTH_DEMO={pw:'Clean2026!',mfa:'482913',sms:'246810',email:'735204'};
const AU={business:{mode:'login',step:1,f:{},err:'',info:''},cleaner:{mode:'welcome',step:1,f:{},err:'',info:''},customer:{mode:'login',step:1,f:{},err:'',info:''},fails:{},lock:{}};
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
const BRAND_SVG='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 20h16"/><path d="M7 20V9l5-5 5 5v11"/><path d="M10 14l1.5 1.5L15 12"/></svg>';
function auFail(s,msg){AU.fails[s]=(AU.fails[s]||0)+1;if(AU.fails[s]>=5){AU.lock[s]=Date.now()+15*60000;AU.fails[s]=0}AU[s].err=msg;return}
const AU_ACT={
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
        notify(st.id,'Your cleaner app account is active.');audit('Cleaner app activated',st.name,'Invite code redeemed',st.name);authSignIn(s,acc);toast(`Welcome, ${st.name.split(' ')[0]}`);return}}}
};
