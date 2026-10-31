/* PRO VERIFICATION (pro submits, business verifies) */
const PV_ITEMS=[['id','Photo ID','rtw',true],['rtw','Right to work','rtw',true],['dbs','DBS check','dbs',true],['bank','Bank details','pay',true],['contact','Contact and emergency contact','about',false],['skills','Experience and skills','exp',false]];
function pvState(s,k){const V=(s.verif||{})[k];if(V)return V.status;
  if(k==='rtw'&&s.onboarding&&s.onboarding.right)return 'verified';if(k==='bank'&&s.onboarding&&s.onboarding.bank)return 'verified';if(k==='dbs'&&s.cred&&s.cred.status==='verified')return 'verified';if(k==='id'&&!s.proOnb)return 'verified';return 'missing'}
function pvPill(st){return st==='verified'?pill('Verified','good'):st==='submitted'?pill('Waiting for check','warn'):st==='rejected'?pill('Needs attention','bad'):st==='info'?pill('Provided','info'):pill('Not provided','')}
function proCanWork(s){if(!s)return false;if(!onboardingDone(s))return false;if(!s.verif)return true;return PV_ITEMS.filter(x=>x[3]).every(([k])=>pvState(s,k)==='verified')}
function proWaiting(s){const w=PV_ITEMS.filter(x=>x[3]).filter(([k])=>pvState(s,k)!=='verified').map(([,l])=>l);ONB.forEach(([k,l])=>{if(s.onboarding&&!s.onboarding[k]&&!['right','bank'].includes(k))w.push(l)});return w}
