/* PRO APP: ACCESS (employer-added only) + ONBOARDING */
function proSeed(){if(!S.staff||S.flags.proSeed)return;S.flags.proSeed=true;
  Object.values(S.staff).forEach(s=>{if(!s.app){const acc=(S.accounts||[]).some(a=>a.type==='cleaner'&&a.staff===s.id);s.app=acc?{status:'active',mobile:s.phone,at:'2025'}:s.invite?{status:'invited',mobile:s.phone,code:s.invite,at:fmtD(addDays(today(),-3))}:{status:'none'}}});
  if(!S.staff.s9){const st=addDays(today(),7);S.staff.s9={id:'s9',name:'Tom Okoro',display:'Tom O.',role:'Cleaner',skills:[],type:'Employee',isNew:true,cred:{type:'DBS basic check',status:'pending',verified:null,expires:'2000-01-01'},avail:{days:[1,2,3,4,5],from:'08:00',to:'16:00',label:'Mon–Fri 08:00–16:00'},pay:'Hourly · £12.85 ordinary',rate:1285,start:st,phone:'07700 900 109',rates:[{from:st,rate:1285}],onboarding:{right:false,contract:false,induction:false,uniform:false,bank:false},invite:'FF-7KQ2',app:{status:'invited',mobile:'07700 900 109',code:'FF-7KQ2',at:fmtD(today())}};
    S.training.s9={coshh:{status:'assigned',assigned:today(),due:addDays(today(),14)},manual:{status:'assigned',assigned:today(),due:addDays(today(),14)},privacy:{status:'assigned',assigned:today(),due:addDays(today(),14)}}}}
const PO_ACT={
  
};
const PO_MODALS={
  
};
