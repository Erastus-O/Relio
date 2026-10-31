/* ADMIN: BUSINESSES, DISPUTES, SETTINGS */
function adHash(k){let h=7;for(const c of k)h=(h*31+c.charCodeAt(0))%9973;return h}
function adBizInit(){mktInit();const M=S.mkt;if(M.bizAdm)return M.bizAdm;
  const meta={ff:['Fenland Fresh Cleaning Ltd','14820391','hello@fenlandfresh.example','01733 210 455','Dami Cole','Growth'],
    ss:['Spotless Spalding Ltd','13377120','team@spotless.example','01775 300 118','Jade Holt','Starter'],
    pc:['Peterborough Clean Co Ltd','11290044','ops@pbclean.example','01733 555 020','Ravi Patel','Growth'],
    fx:['Fixwell Repairs Ltd','12988201','jobs@fixwell.example','01733 840 731','Sam Ortiz','Starter'],
    rc:['Stamford Repair Workshop','Sole trader','workshop@stamfordrepair.example','01780 411 902','Hugh Bell','Starter'],
    nt:['Nene Tutors Ltd','10822615','office@nenetutors.example','01733 291 777','Aisha Khan','Growth'],
    bm:['BrightMind Online Ltd','12450093','support@brightmind.example','0330 123 9087','Lena Ward','Scale'],
    dk:['Deepings Domestic','Sole trader','deepingsdomestic@mail.example','07700 900 318','Kerry Marsh','Starter'],
    sw:['Swift Sparkle Cleaning Ltd','13902247','bookings@swiftsparkle.example','01733 702 219','Owen Price','Starter'],
    gl:['Garden Lads','Sole trader','gardenlads@mail.example','07700 900 552','Connor Hale','Starter']};
  const out={};Object.entries(M.prov).forEach(([k,P])=>{const m=meta[k]||[P.name,'–','–','–','–','Starter'];
    const creds=['Identity check (owner)',...new Set(P.cats.flatMap(c=>M.cats[c].creds||[]))];const h=adHash(k);
    const docs=creds.map((t,i)=>{const up=addDays(today(),-(40+((h+i*37)%300)));const exp=/insurance/i.test(t)?addDays(up,365):/DBS/i.test(t)?'':/Identity/.test(t)?'':addDays(up,730);
      return {id:`DOC-${k}-${i+1}`,type:t,file:`${t.replace(/[^A-Za-z]+/g,'-').replace(/^-|-$/g,'').toLowerCase()}.pdf`,uploaded:up,expires:exp,status:'approved',by:'Morgan Lee',at:fmtD(addDays(up,1))}});
    out[k]={legal:m[0],co:m[1],email:m[2],phone:m[3],owner:m[4],plan:m[5],status:'active',docs,notes:[]}});
  ['dk','gl'].forEach(k=>{if(!out[k])return;out[k].status='pending';out[k].docs.forEach((d,i)=>{d.status='pending';d.uploaded=addDays(today(),-(2+i));d.by=null})});
  if(out.sw){const ins=out.sw.docs.find(d=>/insurance/i.test(d.type));if(ins){ins.expires=addDays(today(),9)}}
  if(out.rc){const ins=out.rc.docs.find(d=>/insurance/i.test(d.type));if(ins){ins.status='pending';ins.uploaded=addDays(today(),-1);ins.expires=addDays(today(),365);ins.renewal=true;ins.by=null}}
  M.bizAdm=out;
  M.disputes=[
    {id:'D-301',prov:'ff',cust:'Amara O.',issue:'Quality: kitchen not cleaned to standard',type:'Quality',amount:6750,opened:addDays(today(),-6),due:addDays(today(),-1),status:'open',
      tl:[[addDays(today(),-6),'Customer','Raised concern with Fenland Fresh. Kitchen worktops and hob left greasy.'],[addDays(today(),-5),'Business','Offered a free re-clean on Thu 15 Oct.'],[addDays(today(),-3),'Customer','Declined re-clean and asked for a refund. Escalated to the platform.']],ev:'4 customer photos · cleaner checklist with 2 kitchen photos'},
    {id:'D-302',prov:'sw',cust:'Daniel R.',issue:'No-show: cleaner didn’t arrive',type:'No-show',amount:5500,opened:addDays(today(),-3),due:addDays(today(),2),status:'awaiting_business',
      tl:[[addDays(today(),-3),'Customer','Nobody arrived for the 09:00 booking. No message received.'],[addDays(today(),-2),'Platform','Asked Swift Sparkle for check-in records within 48 hours.']],ev:'No check-in recorded for this booking'},
    {id:'D-303',prov:'fx',cust:'Priya N.',issue:'Damage claim: scratched kitchen worktop',type:'Damage',amount:18000,opened:addDays(today(),-2),due:addDays(today(),3),status:'open',
      tl:[[addDays(today(),-2),'Customer','Worktop scratched while a cupboard hinge was replaced. Quote for repair attached.'],[addDays(today(),-1),'Business','Disputes the claim: completion photo shows no damage.']],ev:'Customer photo · repair quote £180 · completion photo from Pro app'},
    {id:'D-304',prov:'pc',cust:'Tom W.',issue:'Refund request: late cancellation fee',type:'Refund',amount:4000,opened:addDays(today(),-14),due:addDays(today(),-9),status:'resolved',outcome:'Partial refund of £20.00',
      tl:[[addDays(today(),-14),'Customer','Charged a late cancellation fee after a hospital appointment changed.'],[addDays(today(),-10),'Platform','Partial refund of £20.00. Fee reduced as a goodwill gesture; policy was shown at booking.']],ev:'Cancellation policy v2 accepted at booking'}];
  M.adTeam=[{id:'a1',name:'Morgan Lee',email:'ops@relio.example',role:'super',status:'active',since:'Mar 2025',me:true},
    {id:'a2',name:'Priya Shah',email:'priya.shah@relio.example',role:'ops',status:'active',since:'Jun 2025'},
    {id:'a3',name:'Tom Becker',email:'tom.becker@relio.example',role:'support',status:'active',since:'Jan 2026'},
    {id:'a4',name:'Leo Chen',email:'leo.chen@relio.example',role:'finance',status:'active',since:'Apr 2026'},
    {id:'a5',name:'Ana Ruiz',email:'ana.ruiz@relio.example',role:'trust',status:'invited',since:'Invited Mon 12 Oct'}];
  M.adMe={name:'Morgan Lee',title:'Head of platform operations',phone:'07700 900 410',tz:'Europe/London',pwAt:'Tue 1 Sep',mfaAt:'Mon 3 Mar 2025',
    sessions:[{id:'s1',dev:'Chrome on macOS',where:'Peterborough, UK',last:'Now',cur:true},{id:'s2',dev:'Safari on iPhone',where:'Peterborough, UK',last:'Yesterday 18:40'}]};
  M.adRules={fee:12,hold:2,bizHrs:48,decDays:5,remind:30,autoSus:true,refundCap:500};
  M.adNotif={verify:[true,true],expiry:[true,true],dispute:[true,true],sla:[true,true],report:[false,true],jobs:[true,true]};
  M.adSec={timeout:'30',accessMax:'4',ips:''};
  return out}
