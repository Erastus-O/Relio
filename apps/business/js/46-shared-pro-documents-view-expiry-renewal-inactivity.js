/* PRO DOCUMENTS: view, expiry, renewal, inactivity */
const DOC_GRACE=5;
function daysBetween(a,b){return Math.round((dt(b)-dt(a))/86400000)}
function proDocs(s){if(!s)return [];if(s.docs)return s.docs;const D=[];
  const legacy=!s.proOnb&&onboardingDone(s);const V=s.verif||{};
  if(legacy){const seed={s1:{id:['Passport','2031-04-11'],rtw:['GOV.UK share code','2026-10-13']},s2:{id:['UK driving licence','2026-10-07'],rtw:['British passport','']}}[s.id]||{id:['UK driving licence','2032-06-30'],rtw:['British passport','']};
    D.push({k:'id',name:'Photo ID',type:seed.id[0],file:seed.id[0].toLowerCase().replace(/[^a-z]+/g,'-')+'.jpg',uploaded:'2025-09-01',expires:seed.id[1]});
    D.push({k:'rtw',name:'Right to work',type:seed.rtw[0],file:seed.rtw[0].includes('share')?'share-code-check.pdf':'passport-photo-page.jpg',uploaded:'2025-09-01',expires:seed.rtw[1]})}
  if(s.cred&&s.cred.verified&&(legacy||s.cred.status==='verified'))D.push({k:'dbs',name:s.cred.type,type:'Certificate',file:'dbs-certificate.pdf',uploaded:s.cred.verified||'',expires:s.cred.expires&&s.cred.expires>'2001-01-01'?s.cred.expires:'',fromCred:true});
  s.docs=D;return D}
function docAdd(s,k,data){const D=proDocs(s);let d=D.find(x=>x.k===k);const name={id:'Photo ID',rtw:'Right to work',dbs:(s.cred||{}).type||'DBS check'}[k];
  if(!d){d={k,name};D.push(d)}Object.assign(d,data,{renewal:null});return d}
function docState(d){if(d.renewal&&d.renewal.status==='submitted')return {k:'pending',label:'Renewal waiting for check',tone:'info'};
  if(!d.expires)return {k:'valid',label:'No expiry',tone:'good'};const t=today();const left=daysBetween(t,d.expires);
  if(left<0){const over=-left;const by=addDays(d.expires,DOC_GRACE);if(over>DOC_GRACE)return {k:'lapsed',label:`Expired ${over} days ago`,tone:'bad',by};return {k:'expired',label:`Expired · renew by ${fmtD(by)}`,tone:'bad',by,left:DOC_GRACE-over}}
  if(left<=30)return {k:'soon',label:`Expires in ${left} day${left===1?'':'s'}`,tone:'warn'};return {k:'valid',label:`Valid until ${fmtD(d.expires)} ${d.expires.slice(0,4)}`,tone:'good'}}
function proInactive(s){return proDocs(s).filter(d=>docState(d).k==='lapsed')}
function docsDue(s){return proDocs(s).filter(d=>['expired','lapsed','soon'].includes(docState(d).k))}
