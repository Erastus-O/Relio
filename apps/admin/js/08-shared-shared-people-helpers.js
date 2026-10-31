/* SHARED PEOPLE HELPERS */
const TRAVEL_MIN=20;
const COURSES=[
  {id:'hs',cat:'core',name:'Health and safety at work',mand:true,months:36,desc:'Spotting hazards, slips and trips, reporting accidents and near misses, PPE, and everyone\'s duties under health and safety law.'},
  {id:'coshh',cat:'core',name:'COSHH and chemical safety',mand:true,months:12,desc:'Reading labels and safety data sheets, correct dilution, never mixing products such as bleach and acid cleaners, storage, spills and first aid for exposure.'},
  {id:'manual',cat:'core',name:'Manual handling',mand:true,months:36,desc:'Safe lifting, carrying kit up stairs, limits on moving furniture and avoiding repetitive strain.'},
  {id:'infection',cat:'core',name:'Infection prevention and control',mand:true,months:24,desc:'Colour-coded cloths and mops, avoiding cross-contamination, hand hygiene, cleaning versus disinfecting, and contact times.'},
  {id:'fire',cat:'core',name:'Fire safety awareness',mand:true,months:12,desc:'Finding exits at each site, evacuation, fire doors, and safe use of electrical equipment and extension leads.'},
  {id:'safeguard',cat:'core',name:'Safeguarding adults and children',mand:true,months:36,desc:'Recognising signs of abuse or neglect in homes, what to do and who to tell, and keeping professional boundaries.'},
  {id:'privacy',cat:'core',name:'Data protection and customer privacy',mand:true,months:24,desc:'UK GDPR basics, handling keys and alarm codes, photo evidence rules and confidentiality in homes and offices.'},
  {id:'lone',cat:'core',name:'Lone working and personal safety',mand:true,months:36,desc:'Checking in and out, what to do if you feel unsafe, dogs or unexpected people on site, and travelling between jobs.'},
  {id:'conduct',cat:'core',name:'Customer service and professional conduct',mand:true,months:0,desc:'Punctuality, appearance, respecting property, handling complaints, and when to call the office.'},
  {id:'dom',cat:'skill',name:'Domestic cleaning standards',grants:'domestic',desc:'Room-by-room standards for homes, kitchens and bathrooms, surface types and final checks.'},
  {id:'deep',cat:'skill',name:'Deep clean and end of tenancy',grants:'deep',desc:'Ovens, limescale, appliances, inventory standard for end of tenancy, and working as a pair.'},
  {id:'office',cat:'skill',name:'Commercial site induction',grants:'office',desc:'Site access and alarms, washrooms, kitchens, waste and recycling, and out-of-hours working.'},
  {id:'equip',cat:'pro',name:'Cleaning equipment and machinery',months:36,desc:'Commercial vacuums, steam cleaners, carpet extractors and floor scrubbers: safe use, pre-use checks and care.'},
  {id:'height',cat:'pro',name:'Working at height (steps and ladders)',months:36,desc:'Choosing and checking steps, keeping three points of contact, and when not to work at height.'},
  {id:'waste',cat:'pro',name:'Waste handling and sharps awareness',months:36,desc:'Separating waste and recycling, what to do on finding needles or broken glass, and safe disposal.'},
  {id:'firstaid',cat:'pro',name:'Emergency first aid at work',months:36,desc:'A one-day course from an approved provider: CPR, choking, bleeding, burns and calling for help.'},
  {id:'bics',cat:'pro',name:'BICSc cleaning skills certificate',months:0,desc:'Industry-recognised competency assessment from the British Institute of Cleaning Science.'}];
const SKILL_LABEL={domestic:'Domestic',office:'Commercial',deep:'Deep clean'};
const ONB=[['right','Right to work checked'],['contract','Contract signed'],['induction','Site safety induction'],['uniform','Uniform and kit issued'],['bank','Payroll details received']];
function addMonths(date,n){const x=dt(date);x.setMonth(x.getMonth()+n);return iso(x)}
function monYr(date){const x=dt(date);return `${MON[x.getMonth()]} ${x.getFullYear()}`}
function rateOf(id){return (S.staff[id]&&S.staff[id].rate)||1285}
function cks(str){let h1=0x811c9dc5,h2=7;for(let i=0;i<str.length;i++){h1^=str.charCodeAt(i);h1=Math.imul(h1,16777619)>>>0;h2=(Math.imul(h2,31)+str.charCodeAt(i))>>>0}return h1.toString(16).padStart(8,'0')+h2.toString(16).padStart(8,'0')}
function trainStatus(sid,cid){
  const r=((S.training||{})[sid]||{})[cid];const c=allCourses().find(x=>x.id===cid);
  if(!r)return {k:'none',label:c.mand?'Missing':'Not started',tone:c.mand?'bad':''};
  if(r.status==='assigned')return r.due<today()?{k:'overdue',label:`Overdue · due ${fmtD(r.due).slice(4)}`,tone:'bad'}:{k:'assigned',label:`Assigned · due ${fmtD(r.due).slice(4)}`,tone:'info'};
  if(r.expires&&r.expires<today())return {k:'expired',label:`Expired ${fmtD(r.expires).slice(4)}`,tone:'bad'};
  if(r.expires&&r.expires<=addDays(today(),30))return {k:'due',label:`Renew by ${fmtD(r.expires).slice(4)}`,tone:'warn'};
  return {k:'done',label:r.expires?`Valid to ${monYr(r.expires)}`:`Completed ${monYr(r.done)}`,tone:'good'};
}
function mandIssues(sid){return allCourses().filter(c=>c.mand).map(c=>({c,st:trainStatus(sid,c.id)})).filter(x=>['none','expired','overdue'].includes(x.st.k))}
function onboardingDone(s){return !s.onboarding||Object.values(s.onboarding).every(Boolean)}
function readiness(s){
  if(!onboardingDone(s))return ['Not assignable: onboarding incomplete','bad'];
  if(proInactive(s).length)return ['Inactive: document renewal overdue','bad'];
  {const ex=proDocs(s).filter(d=>docState(d).k==='expired');if(ex.length&&s.cred.status==='verified')return [`Renew ${ex[0].name} by ${fmtD(docState(ex[0]).by)}`,'warn']}
  const c=s.cred;if(c.status!=='verified'||c.expires<today())return ['Restricted: no domestic visits','warn'];
  if(mandIssues(s.id).length)return ['Ready · training overdue','warn'];
  return ['Ready','good'];
}
