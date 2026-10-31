/* seed state */
function mkTasks(tpl,site,extra=[]){
  const photoOk=site.photo==='allowed';
  return [...TEMPLATES[tpl],...extra].map((t,i)=>({id:'t'+i,room:t[0],name:t[1],photo:photoOk?t[2]:null,result:null,reason:'',ev:[],excReq:'',excOk:null}));
}
function seed(){
  const S={tick:0,seq:3000,surface:'business',flags:{},
    biz:{view:'overview',period:'month',week:'2026-10-26',caseId:null,reviewId:null,showInternal:true},
    cl:{persona:'s1',view:'today',job:null,week:'2026-10-12',offline:false,lastSync:'Thu 15 Oct, 12:38',issues:null},
    cu:{persona:'amara',view:'book',visit:null,caseId:null},
    book:freshBooking(),
    modal:null,audit:[],notifs:[],events:[],
    staff:{
      s1:{id:'s1',name:'Grace Adeyemi',display:'Grace A.',role:'Cleaner',skills:['domestic','office','deep'],cred:{type:'DBS basic check',status:'verified',verified:'2026-03-02',expires:'2029-03-02'},avail:{days:[1,2,3,4,5,6],from:'07:00',to:'17:00',label:'Mon–Sat 07:00–17:00'},type:'Employee',pay:'Hourly · £12.85 ordinary · paid travel between jobs'},
      s2:{id:'s2',name:'Tomasz Nowak',display:'Tomasz N.',role:'Senior cleaner',skills:['office','deep'],cred:{type:'DBS basic check',status:'verified',verified:'2025-11-20',expires:'2028-11-20'},avail:{days:[1,2,3,4,5,6],from:'06:00',to:'22:00',label:'Mon–Sat 06:00–22:00'},type:'Employee',pay:'Hourly · £13.40 ordinary'},
      s3:{id:'s3',name:'Priya Shah',display:'Priya S.',role:'Cleaner',skills:['domestic','office'],cred:{type:'DBS basic check',status:'expired',verified:'2023-10-10',expires:'2026-10-10'},avail:{days:[1,2,3,4,5],from:'07:00',to:'20:00',label:'Mon–Fri 07:00–20:00'},type:'Employee',pay:'Hourly · £12.85 ordinary'},
      s4:{id:'s4',name:'Kwame Mensah',display:'Kwame M.',role:'Cleaner',skills:['domestic','office','deep'],cred:{type:'DBS basic check',status:'verified',verified:'2026-01-15',expires:'2029-01-15'},avail:{days:[2,3,4,5,6],from:'06:00',to:'18:00',label:'Tue–Sat 06:00–18:00'},type:'Employee',pay:'Hourly · £12.85 ordinary'},
      s5:{id:'s5',name:'Ellie Barker',display:'Ellie B.',role:'Cleaner (evenings)',skills:['office'],cred:{type:'DBS basic check',status:'verified',verified:'2026-05-08',expires:'2029-05-08'},avail:{days:[1,2,3,4,5],from:'16:00',to:'22:00',label:'Mon–Fri 16:00–22:00'},type:'Employee',pay:'Hourly · £12.85 ordinary'}
    },
    sites:{
      amara:{id:'amara',customer:'amara',name:'Amara Okafor',short:'Okafor home',type:'domestic',tpl:'dom',addr:'14 Willow Lane, Crowland PE6 0JH',photo:'allowed',access:'Key safe by the back door',secret:'Key safe code 4821',needs:'One cat. Keep the kitchen door closed.'},
      reid:{id:'reid',customer:'reid',name:'Jo and Callum Reid',short:'Reid home',type:'domestic',tpl:'dom',addr:'7 Church Street, Market Deeping PE6 8AN',photo:'none',access:'Spare key with neighbour',secret:'Key with neighbour at No. 9, ask for Pat',needs:'No indoor photos. Customer sign-off by text.'},
      harbour:{id:'harbour',customer:'harbour',name:'Harbour Logistics Ltd · Unit 4',short:'Harbour U4',type:'commercial',tpl:'office',addr:'Unit 4, Fengate Business Park, Peterborough PE1 5XG',photo:'allowed',access:'Collect fob from the security desk',secret:'Alarm code 7730#',needs:'Crew of two. Sign the visitor book.'},
      warehouse:{id:'warehouse',customer:'harbour',name:'Harbour Logistics Ltd · Warehouse B',short:'Harbour WhB',type:'commercial',tpl:'office',addr:'Warehouse B, Fengate, Peterborough PE1 5XH',photo:'allowed',access:'Gatehouse sign-in',secret:'Mezzanine door code 2290',needs:'Hi-vis required on the warehouse floor.'},
      nene:{id:'nene',customer:'nene',name:'Nene Valley Accountants',short:'Nene Valley',type:'commercial',tpl:'office',addr:'2 Priestgate, Peterborough PE1 1JA',photo:'none',access:'Rear door from car park',secret:'Door code 1966',needs:'Confidential papers on desks. No photography. Do not move papers.'}
    },
    customers:{amara:{name:'Amara Okafor',type:'domestic'},reid:{name:'Jo Reid',type:'domestic'},harbour:{name:'Harbour Logistics Ltd',type:'commercial'},nene:{name:'Nene Valley Accountants',type:'commercial'}},
    periods:{
      '2026-10-12':{status:'published',version:3,publishedAt:'Fri 2 Oct, 16:05',publishedBy:ME_BIZ},
      '2026-10-19':{status:'published',version:1,publishedAt:'Fri 9 Oct, 10:15',publishedBy:ME_BIZ},
      '2026-10-26':{status:'draft',version:0},
      '2026-11-02':{status:'not_started',version:0}
    },
    visits:{},allocs:[],payments:{},refunds:[],cases:[],feedback:{},covers:[],swaps:[],quotes:[],plans:[]
  };
  return S;
}
function freshBooking(){return {step:1,svc:'regular',postcode:'',beds:'3',baths:'1',products:'cleaner',addons:{},condition:'average',pets:'',access:'',photo:'allowed',freq:'once',slot:null,contactName:'Amara Okafor',contactPhone:'07700 900 418',errors:{},compete:false,delay:false,pay:null,bookingVisit:null,hold:null}}
let S;
function buildSeed(){
  S=seed();
  const V=(id,site,date,start,end,svc,crew,extra={})=>{
    const st=S.sites[site];
    S.visits[id]=Object.assign({id,site,date,start,end,svc,crew,state:'scheduled',tasks:mkTasks(st.tpl,st,extra.addonTasks||[]),checkin:null,checkout:null,submission:null,revisions:[],evidenceComplete:null,incidents:[],review:null,ack:null,price:null,payment:null,correctiveOf:null,occurrence:null,accessViewed:false,supConfirm:false},extra);
    return S.visits[id];
  };
  const A=(visitId,staffId,o={})=>{const v=S.visits[visitId];const a=Object.assign({id:'al-'+(S.seq++),visitId,staffId,status:'published',start:v.start,end:v.end,firstPublishedAt:'Fri 9 Oct, 10:15',version:1,notif:'sent',ack:'Fri 9 Oct, 11:02',response:'accepted',requiresAcceptance:false,shortNotice:false,amendment:null,cancel:null,history:[{at:'Fri 9 Oct, 10:15',text:'Published in rota v1'}]},o);S.allocs.push(a);return a};
  const done=(v,photoT='13:2')=>{v.tasks.forEach((t,i)=>{t.result='done';if(t.photo){const kinds=t.photo==='pair'?['before','after']:['after'];kinds.forEach(k=>t.ev.push({id:'ev-'+(S.seq++),kind:k,status:'synced',capture:`${fmtD(v.date)}, ${k==='before'?v.start.slice(0,3)+'0'+i%10:String(+v.end.slice(0,2)-1).padStart(2,'0')+':1'+i%10}`,receipt:`${fmtD(v.date)}, ${k==='before'?v.start.slice(0,3)+'0'+i%10:String(+v.end.slice(0,2)-1).padStart(2,'0')+':1'+i%10}`,checksum:'sha256:'+hex()}))}})};

  // past
  const v950=V('v-0950','amara','2026-10-08','13:00','15:30','regular',1,{state:'completed',price:6750,payment:'p-0950',occurrence:'plan-okafor#2026-10-08'});
  done(v950); v950.checkin={method:'Site QR',capture:'Thu 8 Oct, 13:06',receipt:'Thu 8 Oct, 13:06'}; v950.checkout='Thu 8 Oct, 15:21';
  v950.submission={rev:1,idem:'sub-v-0950-r1',at:'Thu 8 Oct, 15:22',queued:false}; v950.evidenceComplete=true; v950.review={by:'Tomasz Nowak (supervisor)',at:'Thu 8 Oct, 17:40',outcome:'completed',note:''};
  A('v-0950','s1',{firstPublishedAt:'Fri 25 Sep, 15:00',ack:'Fri 25 Sep, 17:12'});
  S.payments['p-0950']={id:'p-0950',visitId:'v-0950',amount:6750,captured:6750,status:'succeeded',ref:'pi_3QxF…a91'};

  const v990=V('v-0990','reid','2026-10-14','10:00','12:30','regular',1,{state:'partial',price:9625,payment:'p-0990',addonTasks:[ADDONS.oven.task]});
  done(v990); const ov=v990.tasks.find(t=>t.name==='Clean inside oven'); ov.result='not_done'; ov.reason='Ran out of time. Oven heavily carbonised, needs a longer slot.';
  v990.checkin={method:'Point GPS',capture:'Wed 14 Oct, 10:04',receipt:'Wed 14 Oct, 10:04'}; v990.checkout='Wed 14 Oct, 12:33'; v990.submission={rev:1,idem:'sub-v-0990-r1',at:'Wed 14 Oct, 12:34',queued:false};
  v990.evidenceComplete=true; v990.supConfirm=true; v990.review={by:'Tomasz Nowak (supervisor)',at:'Wed 14 Oct, 16:10',outcome:'partial',note:'Oven not completed. Offer re-clean if customer raises it.'};
  A('v-0990','s1',{firstPublishedAt:'Fri 2 Oct, 16:05',ack:'Fri 2 Oct, 18:30'});
  S.payments['p-0990']={id:'p-0990',visitId:'v-0990',amount:9625,captured:9625,status:'succeeded',ref:'pi_3QyL…07c'};
  S.cases.push({id:'C-2041',visitId:'v-0990',customer:'reid',category:'Missed task',taskId:ov.id,desc:'The oven was on the booking and paid for but it was not cleaned.',wanted:'Re-clean',status:'open',owner:ME_BIZ,respondBy:'Thu 15 Oct, 10:00',createdAt:'Wed 14 Oct, 18:02',timeline:[{who:'Jo Reid',text:'The oven was on the booking and paid for but it was not cleaned.',photos:[samplePhoto()],internal:false,at:'Wed 14 Oct, 18:02'}],remedies:[]});

  // earlier October history (delivered, reviewed)
  const past=(id,siteId,date,start,end,svc,crew,staff,extra={})=>{const v=V(id,siteId,date,start,end,svc,crew,Object.assign({state:'completed'},extra));done(v);const d=fmtD(date);
    v.checkin={method:'Site QR',capture:`${d}, ${start}`,receipt:`${d}, ${start}`};v.checkout=`${d}, ${end}`;v.submission={rev:1,idem:`sub-${id}-r1`,at:`${d}, ${end}`,queued:false};
    v.evidenceComplete=true;v.supConfirm=S.sites[siteId].photo!=='allowed';v.review={by:'Tomasz Nowak (supervisor)',at:`${d}, 21:00`,outcome:'completed',note:''};
    staff.forEach(x=>A(id,x,{firstPublishedAt:'Fri 18 Sep, 15:00',ack:'Fri 18 Sep, 16:00'}));return v};
  let hn=900;
  for(let d=1;d<=14;d++){const date=`2026-10-${pad(d)}`;const dow=dt(date).getDay();
    if([1,3,5].includes(dow))past('v-0'+(hn++),'harbour',date,'18:00','20:00','office',2,['s2','s5'],{payment:'invoice'});
    if([2,4].includes(dow))past('v-0'+(hn++),'nene',date,'07:00','09:00','office',1,['s4'],{payment:'invoice'});}
  [['v-0920','amara','2026-10-01','13:00','15:30',6750,'s4'],['v-0921','reid','2026-10-03','10:00','12:30',7125,'s4'],['v-0922','reid','2026-10-10','10:00','12:30',7125,'s4']].forEach(([id,si,d,st,en,pr,w])=>{
    past(id,si,d,st,en,'regular',1,[w],{price:pr,payment:'p-'+id});S.payments['p-'+id]={id:'p-'+id,visitId:id,amount:pr,captured:pr,status:'succeeded',ref:'pi_'+hex()}});

  {const mc=Object.values(S.visits).find(v=>v.site==='nene'&&v.date==='2026-10-06');if(mc){mc.checkout=null;mc.timeIssue={type:'missing_checkout',staff:'s4',status:'open'}}}
  // today & this week
  const v1002=V('v-1002','nene','2026-10-15','07:00','09:00','office',1,{state:'submitted',payment:'invoice'});
  done(v1002); v1002.checkin={method:'Site QR',capture:'Thu 15 Oct, 07:02',receipt:'Thu 15 Oct, 07:02'}; v1002.checkout='Thu 15 Oct, 08:57'; v1002.submission={rev:1,idem:'sub-v-1002-r1',at:'Thu 15 Oct, 08:58',queued:false};
  A('v-1002','s4',{firstPublishedAt:'Fri 2 Oct, 16:05',ack:'Fri 2 Oct, 16:40'});
  const v1001=V('v-1001','amara','2026-10-15','13:00','15:30','regular',1,{price:6750,payment:'p-1001',occurrence:'plan-okafor#2026-10-15'});
  A('v-1001','s1',{firstPublishedAt:'Fri 2 Oct, 16:05',ack:'Fri 2 Oct, 18:30'});
  S.payments['p-1001']={id:'p-1001',visitId:'v-1001',amount:6750,captured:6750,status:'succeeded',ref:'pi_3R0a…5de'};
  V('v-1003','harbour','2026-10-15','18:00','20:00','office',2,{payment:'invoice'}); A('v-1003','s2',{firstPublishedAt:'Fri 2 Oct, 16:05'}); A('v-1003','s5',{firstPublishedAt:'Fri 2 Oct, 16:05'});
  V('v-1005','harbour','2026-10-16','18:00','20:00','office',2,{payment:'invoice'}); A('v-1005','s2',{firstPublishedAt:'Fri 2 Oct, 16:05'}); A('v-1005','s5',{firstPublishedAt:'Fri 2 Oct, 16:05'});
  V('v-1010','reid','2026-10-17','10:00','12:30','regular',1,{price:7125,payment:'p-1010'});
  S.payments['p-1010']={id:'p-1010',visitId:'v-1010',amount:7125,captured:0,status:'scheduled',ref:'charged 24h before visit'};
  A('v-1010','s4',{firstPublishedAt:'Fri 2 Oct, 16:05',response:'declined',ack:'Fri 2 Oct, 17:00',history:[{at:'Fri 2 Oct, 16:05',text:'Published in rota v3'},{at:'Thu 15 Oct, 08:10',text:'Kwame reported unavailable: childcare fell through'}]});
  S.covers.push({id:'cv-1',visitId:'v-1010',status:'open',reservedBy:null,openedAt:'Thu 15 Oct, 08:14',expires:'Fri 16 Oct, 18:00',pay:'Ordinary rate plus £10 short-notice supplement. Voluntary.'});

  // week of 19 Oct (published)
  V('v-1020','harbour','2026-10-19','18:00','20:00','office',2,{payment:'invoice'}); A('v-1020','s2'); A('v-1020','s5');
  V('v-1021','nene','2026-10-20','07:00','09:00','office',1,{payment:'invoice'});
  A('v-1021','s1',{firstPublishedAt:'Wed 14 Oct, 14:20',ack:null,response:null,requiresAcceptance:true,shortNotice:true,history:[{at:'Wed 14 Oct, 14:20',text:'Late first allocation, short notice. Replaces Kwame (moved to Thu cover).'}]});
  V('v-1022','harbour','2026-10-21','18:00','20:00','office',2,{payment:'invoice'}); A('v-1022','s2'); A('v-1022','s5');
  V('v-1023','amara','2026-10-22','13:00','15:30','regular',1,{price:6750,payment:'p-1023',occurrence:'plan-okafor#2026-10-22'}); A('v-1023','s1');
  S.payments['p-1023']={id:'p-1023',visitId:'v-1023',amount:6750,captured:0,status:'scheduled',ref:'charged 24h before visit'};
  V('v-1024','nene','2026-10-22','07:00','09:00','office',1,{payment:'invoice'}); A('v-1024','s4');
  V('v-1025','harbour','2026-10-23','18:00','20:00','office',2,{payment:'invoice'}); A('v-1025','s2'); A('v-1025','s3',{ack:null,response:null});
  V('v-1026','reid','2026-10-24','10:00','12:30','regular',1,{price:7125,payment:'p-1026'}); A('v-1026','s4');
  S.payments['p-1026']={id:'p-1026',visitId:'v-1026',amount:7125,captured:0,status:'scheduled',ref:'charged 24h before visit'};

  // week of 26 Oct (draft)
  const D={status:'draft',firstPublishedAt:null,version:0,notif:null,ack:null,response:null,history:[{at:'Tue 13 Oct, 11:30',text:'Drafted from recurring demand'}]};
  V('v-1030','harbour','2026-10-26','18:00','20:00','office',2,{payment:'invoice'}); A('v-1030','s2',{...D}); A('v-1030','s5',{...D});
  V('v-1031','nene','2026-10-27','07:00','09:00','office',1,{payment:'invoice'}); A('v-1031','s4',{...D});
  V('v-1032','harbour','2026-10-28','18:00','20:00','office',2,{payment:'invoice'}); A('v-1032','s2',{...D});
  V('v-1033','amara','2026-10-29','13:00','15:30','regular',1,{price:6750,payment:'p-1033',occurrence:'plan-okafor#2026-10-29'}); A('v-1033','s3',{...D,history:[{at:'Tue 13 Oct, 11:30',text:'Copied from last week (needs revalidation)'}]});
  S.payments['p-1033']={id:'p-1033',visitId:'v-1033',amount:6750,captured:0,status:'scheduled',ref:'charged 24h before visit'};
  V('v-1034','nene','2026-10-29','07:00','09:00','office',1,{payment:'invoice'});
  V('v-1035','harbour','2026-10-30','18:00','20:00','office',2,{payment:'invoice'}); A('v-1035','s2',{...D}); A('v-1035','s5',{...D});
  // week of 2 Nov (not started)
  V('v-1040','harbour','2026-11-02','18:00','20:00','office',2,{payment:'invoice'});
  V('v-1041','nene','2026-11-03','07:00','09:00','office',1,{payment:'invoice'});
  V('v-1042','amara','2026-11-05','13:00','15:30','regular',1,{price:6750,payment:'p-1042',occurrence:'plan-okafor#2026-11-05'});
  S.payments['p-1042']={id:'p-1042',visitId:'v-1042',amount:6750,captured:0,status:'scheduled',ref:'charged 24h before visit'};

  // people, clients, settings
  const ex={s1:['2025-02-03',1285,'07700 900 101'],s2:['2024-11-18',1340,'07700 900 102'],s3:['2023-10-09',1285,'07700 900 103'],s4:['2026-01-12',1285,'07700 900 104'],s5:['2026-05-05',1285,'07700 900 105']};
  Object.entries(ex).forEach(([id,[st,r,ph]])=>Object.assign(S.staff[id],{start:st,rate:r,phone:ph,rates:[{from:'2026-04-01',rate:r}].concat(st<'2025-04-01'?[{from:'2025-04-01',rate:r-64}]:[]),onboarding:{right:true,contract:true,induction:true,uniform:true,bank:true}}));
  const T=(done,m)=>({status:'complete',done,expires:m?addMonths(done,m):null});
  S.training={s1:{coshh:T('2026-02-10',12),manual:T('2025-02-10',36),privacy:T('2026-02-10',24),dom:T('2025-02-12'),deep:T('2025-09-01'),office:T('2025-03-01')},
    s2:{coshh:T('2026-01-20',12),manual:T('2024-11-20',36),privacy:T('2025-11-20',24),deep:T('2024-12-01'),office:T('2024-11-25')},
    s3:{coshh:T('2025-11-04',12),manual:T('2024-10-10',36),privacy:T('2025-01-10',24),dom:T('2023-10-15'),office:T('2023-10-20')},
    s4:{coshh:T('2026-01-15',12),manual:T('2026-01-15',36),privacy:T('2026-01-15',24),dom:T('2026-01-20'),deep:T('2026-03-02'),office:T('2026-01-25')},
    s5:{coshh:T('2026-05-08',12),manual:T('2026-05-08',36),office:T('2026-05-12'),dom:{status:'assigned',assigned:'2026-10-01',due:'2026-10-31'},privacy:{status:'assigned',assigned:'2026-09-01',due:'2026-10-09'}}};
  {const T2=(d,m)=>({status:'complete',done:d,expires:m?addMonths(d,m):null});const tr=S.training;
    Object.assign(tr.s1,{hs:T2('2025-02-10',36),infection:T2('2025-02-10',24),fire:T2('2026-02-10',12),safeguard:T2('2025-02-11',36),lone:T2('2025-02-11',36),conduct:T2('2025-02-04'),equip:T2('2025-03-01',36),bics:T2('2025-09-01')});
    Object.assign(tr.s2,{hs:T2('2024-11-20',36),infection:T2('2024-11-20',24),fire:T2('2026-01-20',12),safeguard:T2('2024-11-21',36),lone:T2('2024-11-21',36),conduct:T2('2024-11-19'),equip:T2('2024-12-01',36),height:T2('2024-12-01',36),firstaid:T2('2024-03-10',36)});
    Object.assign(tr.s3,{hs:T2('2024-10-01',36),infection:T2('2025-10-20',24),fire:T2('2025-09-20',12),safeguard:T2('2023-10-12',36),lone:T2('2023-10-12',36),conduct:T2('2023-10-10'),waste:T2('2023-10-20',36)});
    Object.assign(tr.s4,{hs:T2('2026-01-14',36),infection:T2('2026-01-14',24),fire:T2('2026-01-15',12),safeguard:T2('2026-01-16',36),lone:T2('2026-01-16',36),conduct:T2('2026-01-13'),firstaid:T2('2026-02-20',36)});
    Object.assign(tr.s5,{hs:T2('2026-05-06',36),infection:T2('2026-05-06',24),fire:T2('2026-05-08',12),lone:T2('2026-05-07',36),conduct:T2('2026-05-06'),safeguard:{status:'assigned',assigned:'2026-10-01',due:'2026-11-13',prev:null}});
    S.customCourses=[];
    S.trainMats=[
      {id:'mat-1',course:'coshh',kind:'file',title:'COSHH risk assessments and product list',name:'Fenland-COSHH-assessments-v3.pdf',size:482000,type:'application/pdf',addedAt:'Mon 7 Sep, 10:00',assign:[{staff:'s1',at:'Mon 7 Sep, 10:05',opened:'Mon 7 Sep, 18:20'},{staff:'s2',at:'Mon 7 Sep, 10:05',opened:'Tue 8 Sep, 07:40'},{staff:'s3',at:'Mon 7 Sep, 10:05',opened:null},{staff:'s4',at:'Mon 7 Sep, 10:05',opened:'Mon 7 Sep, 21:02'},{staff:'s5',at:'Mon 7 Sep, 10:05',opened:null}]},
      {id:'mat-2',course:'coshh',kind:'link',title:'Online COSHH awareness module',url:'https://training.example.com/coshh-awareness',addedAt:'Mon 7 Sep, 10:02',assign:[]},
      {id:'mat-3',course:'dom',kind:'file',title:'Home cleaning standards handbook',name:'Domestic-standards-handbook.pdf',size:1310000,type:'application/pdf',addedAt:'Thu 1 Oct, 09:30',assign:[{staff:'s5',at:'Thu 1 Oct, 09:31',opened:'Thu 1 Oct, 19:45'}]},
      {id:'mat-4',course:'safeguard',kind:'link',title:'Safeguarding e-learning (45 minutes)',url:'https://training.example.com/safeguarding',addedAt:'Thu 1 Oct, 09:35',assign:[{staff:'s5',at:'Thu 1 Oct, 09:36',opened:null}]},
      {id:'mat-5',course:'deep',kind:'file',title:'End of tenancy checklist',name:'EOT-inventory-checklist.docx',size:86000,type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',addedAt:'Tue 2 Jun, 14:00',assign:[]},
      {id:'mat-6',course:'lone',kind:'file',title:'Lone working procedure',name:'Lone-working-procedure.pdf',size:210000,type:'application/pdf',addedAt:'Tue 2 Jun, 14:10',assign:[]},
      {id:'mat-7',course:'privacy',kind:'file',title:'Photo evidence and key handling rules',name:'Privacy-and-keys.pdf',size:156000,type:'application/pdf',addedAt:'Tue 2 Jun, 14:20',assign:[]}];}
  S.goals=[{staff:'s5',text:'Move into daytime domestic work',steps:'Complete Domestic cleaning standards; shadow Grace on two home visits',target:'2026-11-30',status:'In progress'},
    {staff:'s4',text:'Step up to senior cleaner',steps:'Shadow Tomasz on supervision; lead two deep cleans',target:'2027-01-29',status:'Planned'},
    {staff:'s3',text:'Renew DBS check and COSHH',steps:'Renewal application with the manager; COSHH refresher booked',target:'2026-10-30',status:'Blocked: waiting on check'}];
  Object.assign(S.customers.amara,{since:'2025-06-12',entity:'Amara Okafor (individual)',arrangement:'Weekly regular clean · Thu 13:00 · Grace preferred, not guaranteed',billing:'Card via payment provider · charged 24 hours before each visit',contacts:[{name:'Amara Okafor',role:'Account holder',scope:'All',limit:'–',email:'amara.okafor@example.com',phone:'07700 900 418'}]});
  Object.assign(S.customers.reid,{since:'2025-11-02',entity:'Jo Reid (individual)',arrangement:'Weekly regular clean · Sat 10:00 · no indoor photos',billing:'Card via payment provider · charged 24 hours before each visit',contacts:[{name:'Jo Reid',role:'Account holder',scope:'All',limit:'–',email:'jo.reid@example.com'},{name:'Callum Reid',role:'Authorised contact',scope:'Bookings and reports',limit:'–'}]});
  Object.assign(S.customers.harbour,{since:'2026-03-02',entity:'Harbour Logistics Ltd (Co. 08812345)',arrangement:'Office clean contract · Unit 4 Mon/Wed/Fri 18:00, crew of two · Warehouse B quote Q-118 v2 awaiting approval',billing:'Monthly invoice · 30 days · purchase order required',contacts:[{name:'Sam Ellis',role:'Approver',scope:'All sites',limit:'£2,000 / month',email:'sam.ellis@harbour-logistics.example'},{name:'Jordan Price',role:'Requester',scope:'Unit 4 only',limit:'–',email:'jordan.price@harbour-logistics.example'},{name:'Accounts payable',role:'Accounts',scope:'Invoices only',limit:'–',email:'accounts@harbour-logistics.example'}]});
  Object.assign(S.customers.nene,{since:'2025-09-15',entity:'Nene Valley Accountants LLP',arrangement:'Office clean contract · Tue/Thu 07:00 · no photography',billing:'Monthly invoice · 14 days',contacts:[{name:'Martin Hale',role:'Approver',scope:'Priestgate',limit:'£500 / month',email:'martin.hale@nenevalley.example'}]});
  [['v-0950',5],['v-0920',4],['v-0921',5],['v-0922',4],['v-0990',2]].forEach(([id,sc])=>{S.feedback[id]={score:sc,at:fmtD(S.visits[id].date)+', 18:00',history:[]}});
  Object.assign(S.customers.harbour,{poRequired:true,termsDays:30});Object.assign(S.customers.nene,{termsDays:14});Object.assign(S.customers.amara,{termsDays:0});Object.assign(S.customers.reid,{termsDays:0});
  S.invSeq=42;S.cnSeq=3;
  S.invoices=[
    {id:'inv-s1',no:'INV-2026-0039',customer:'harbour',status:'paid',from:'2026-09-01',to:'2026-09-30',issued:'2026-10-01',due:'2026-10-31',terms:30,po:'HL-PO-55107',notes:'',group:true,visitIds:[],extra:[],lines:[{date:null,booked:'2026-03-02',svcRange:'2 Sep – 30 Sep',desc:'Office clean (contract) · Harbour Logistics Ltd · Unit 4',detail:'13 visits',qty:13,unit:11000,amount:143000}],prepaid:0,paid:143000,payments:[{at:'Mon 12 Oct, 09:40',date:'2026-10-12',amt:143000,method:'Bank transfer',ref:'HARBOUR LOG 55107'}],reminders:[],created:'Thu 1 Oct, 09:00'},
    {id:'inv-s2',no:'INV-2026-0040',customer:'nene',status:'issued',from:'2026-09-01',to:'2026-09-30',issued:'2026-09-30',due:'2026-10-14',terms:14,po:'',notes:'',group:true,visitIds:[],extra:[],lines:[{date:null,booked:'2025-09-15',svcRange:'1 Sep – 29 Sep',desc:'Office clean (contract) · Nene Valley Accountants',detail:'9 visits',qty:9,unit:8000,amount:72000}],prepaid:0,paid:0,payments:[],reminders:[],created:'Wed 30 Sep, 16:00'},
    {id:'inv-s3',no:'INV-2026-0041',customer:'reid',status:'paid',from:'2026-10-03',to:'2026-10-03',issued:'2026-10-03',due:'2026-10-03',terms:0,po:'',notes:'',group:false,visitIds:['v-0921'],extra:[],lines:[{date:'2026-10-03',booked:'2025-11-02',desc:'Regular home clean · Reid home',detail:'Arrival 10:00',qty:1,unit:7125,amount:7125}],prepaid:7125,paid:0,payments:[],reminders:[],created:'Sat 3 Oct, 14:00'}];
  S.visits['v-0921'].invoiceId='inv-s3';
  S.pricing=Object.assign(pricingPreset('rest'),{version:1,history:[{v:1,at:'Mon 7 Sep, 10:00',by:ME_BIZ,changes:'Set up at onboarding: Rest of the UK rates'}]});
  S.settings={noticeDays:7,horizonWeeks:2,cancelHours:24,cancelFee:50,holdMinutes:10,tolerance:15,version:4,zones:['PE1','PE2','PE3','PE4','PE6','PE7','PE11','PE12'],history:[{v:4,at:'Mon 7 Sep, 10:00',by:ME_BIZ,changes:'Pilot policies: 7-day rota notice, 24-hour free cancellation, 50% late fee'}]};
  S.members=[{name:'Dami Cole',roles:'Owner · Finance',mfa:'On'},{name:'Tomasz Nowak',roles:'Supervisor · Cleaner',mfa:'On'},{name:'Femi Bello',roles:'Dispatcher',mfa:'On'},{name:'Rachel Moore',roles:'Hiring manager',mfa:'Setup pending'}];
  S.payroll={period:{from:'2026-10-01',to:'2026-10-15',pay:'2026-10-23'},status:'draft',batch:null,adjustments:[],
    corrections:[{id:'tc-1',staff:'s1',visit:'v-0950',field:'Check-out',old:'15:21',new:'15:45',hours:0.4,date:'2026-10-08',reason:'Key safe jammed when leaving; waited for the customer to come back. Messaged dispatch at 15:25.',status:'pending',at:'Wed 14 Oct, 09:12'}],
    history:[{id:'PB-2026-09B',period:'16 – 30 Sep',total:61240,status:'Paid'},{id:'PB-2026-09A',period:'1 – 15 Sep',total:58815,status:'Paid'}]};
  S.quotes.push(
    {id:'Q-118',ver:1,status:'superseded',site:'warehouse',sent:'Thu 1 Oct',expires:'Thu 15 Oct',lines:[['Office clean, Tue and Thu 06:00–08:00 (approx. 9 visits a month × £80)',72000],['Washroom consumables restock',7000]],total:79000},
    {id:'Q-118',ver:2,status:'sent',site:'warehouse',sent:'Mon 12 Oct',expires:'Mon 26 Oct',lines:[['Office clean, Tue and Thu 06:00–08:00 (approx. 9 visits a month × £75)',67500],['Washroom consumables restock',6000]],total:73500,crew:1,terms:'Commercial terms v2 · 30-day invoice · 1 month notice'}
  );
  S.notifs.push({id:'n-1',to:'s1',text:'Short-notice shift added: Tue 20 Oct 07:00 at Nene Valley. Please accept or decline.',status:'sent',at:'Wed 14 Oct, 14:20'});
  S.notifs.push({id:'n-2',to:'s3',text:'Rota published: Fri 23 Oct 18:00 at Harbour U4.',status:'sent',at:'Fri 9 Oct, 10:15'});
  S.audit.push({at:'Thu 15 Oct, 08:14',actor:ME_BIZ,action:'Opened cover request',object:'v-1010 Reid home Sat 17 Oct',reason:'Kwame unavailable'});
  S.audit.push({at:'Wed 14 Oct, 14:20',actor:ME_BIZ,action:'Published late allocation (short notice)',object:'v-1021 Nene Valley Tue 20 Oct → Grace Adeyemi',reason:'Rebalanced Kwame to Thursday'});
}
