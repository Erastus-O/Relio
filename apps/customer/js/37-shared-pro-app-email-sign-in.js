/* Pro app: email sign-in */
function proMail(name){return name.toLowerCase().replace(/[^a-z ]/g,'').trim().split(/\s+/).join('.')+'@mail.example'}
function proEmailSeed(){if(!S.staff||!S.accounts)return;Object.values(S.staff).forEach(st=>{if(!st.email)st.email=proMail(st.name);if(st.app&&!st.app.email)st.app.email=st.email});
  Object.entries(XPROS).forEach(([k,x])=>{if(!x.email)x.email=proMail(x.name)});
  S.accounts.filter(a=>a.type==='cleaner'&&!a.email).forEach(a=>{a.email=a.staff&&S.staff[a.staff]?S.staff[a.staff].email:a.ext&&XPROS[a.ext]?XPROS[a.ext].email:null})}
const normEm=e=>String(e||'').trim().toLowerCase();
function proAuthSubmit(){const A=AU.cleaner;const f=A.f;A.err='';A.info='';if(AU.lock.cleaner&&AU.lock.cleaner>Date.now())return;
  if(A.mode==='login'){if(A.step===1){if(!okEmail(f.email)){A.err='Enter your email address.';return}A.step=2;A.info=`We’ve emailed a 6-digit code to ${f.email}.`;return}
    if(A.step===2){if((f.otp||'').trim()!==AUTH_DEMO.email){auFail('cleaner','That code isn’t right. Check the latest email we sent.');return}
      const L=proLinks(f.email);if(!L.length){A.step=1;A.err='We couldn’t find a business that has added this email. Ask your employer to add you as an employee, then sign in with the email they used.';return}
      A.step=3;A.verified=normEm(f.email);return}return}
  if(A.mode==='signup'){if(A.step===1){const code=(f.invite||'').trim().toUpperCase();const st=Object.values(S.staff).find(x=>x.invite===code);if(!st){A.err='We don’t recognise that invite code. Check the email from your employer.';return}
      if(st.app&&st.app.status==='removed'){A.err='This invite is no longer valid. Ask your employer for a new one.';return}if(S.accounts.some(a=>a.type==='cleaner'&&a.staff===st.id)){A.err='This invite has already been used. Sign in instead.';return}
      if(!okEmail(f.email)){A.err='Enter your email address.';return}const want=normEm((st.app&&st.app.email)||st.email);if(want&&want!==normEm(f.email)){A.err=`Use the email your employer has for you (${want.replace(/^(.).*@/,'$1•••@')}).`;return}
      if(!f.terms){A.err='Agree to the terms to continue.';return}A.staff=st.id;A.step=2;A.info=`Invite found for ${st.name}. We’ve emailed you a 6-digit code.`;return}
    if((f.otp||'').trim()!==AUTH_DEMO.email){A.err='That code isn’t right. Check the latest email we sent.';return}
    const st=S.staff[A.staff];const acc={type:'cleaner',email:normEm(f.email),mobile:normMob(st.phone),name:st.name,staff:st.id};S.accounts.push(acc);st.email=acc.email;st.invite=null;st.app={status:'active',email:acc.email,mobile:st.phone,at:stamp()};if(!st.proOnb)st.proOnb={step:0,d:{email:acc.email}};
    notify(st.id,'Your Pro app account is active.');audit('Pro app activated',st.name,'Invite code redeemed',st.name);authSignIn('cleaner',acc);toast(`Welcome, ${st.name.split(' ')[0]}`)}}
