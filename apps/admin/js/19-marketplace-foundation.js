/* MARKETPLACE FOUNDATION (Relio PRD/FRD v2.0) */
const PLATFORM='Relio';
const GEO={PE1:[52.583,-0.243,'Peterborough'],PE2:[52.556,-0.272,'Orton'],PE3:[52.593,-0.290,'Bretton'],PE4:[52.618,-0.262,'Werrington'],PE6:[52.676,-0.170,'Crowland'],PE7:[52.556,-0.130,'Whittlesey'],PE8:[52.481,-0.468,'Oundle'],PE9:[52.652,-0.480,'Stamford'],PE10:[52.768,-0.378,'Bourne'],PE11:[52.787,-0.153,'Spalding'],PE12:[52.804,0.016,'Holbeach'],PE13:[52.664,0.160,'Wisbech'],PE15:[52.551,0.088,'March']};
const MAP_W=51,MAP_H=46,CELL=5;
function kmOf(lat,lng){return {x:+((lng+0.55)*67.6).toFixed(2),y:+((52.86-lat)*111.3).toFixed(2)}}
const DXY={};
Object.entries(GEO).forEach(([k,[a,b]])=>DXY[k]=kmOf(a,b));
function dist2(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function nearestDistrict(p){let best=null,bd=1e9;Object.entries(DXY).forEach(([k,c])=>{const d=dist2(p,c);if(d<bd){bd=d;best=k}});return best}
function rng(seed){let a=seed>>>0;return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const CAT_SEED={
  cleaning:{name:'Cleaning',status:'enabled',ver:3,syn:['clean','cleaner','cleaners','cleaning','house clean','home clean','deep clean','end of tenancy','tenancy','office clean','domestic','maid'],
    intake:['Property type','Bedrooms','Bathrooms','Condition','Frequency','Access'],evidence:'Before and after photos by task, or checklist with supervisor or customer sign-off',creds:['Basic DBS check (domestic)','Public liability insurance']},
  repairs:{name:'Home repairs',status:'pilot',ver:1,syn:['repair','repairs','handyman','fix','fixing','plumber','leak','leaking','tap','appliance','odd jobs','shelves','door'],
    intake:['Issue description','Item or asset type','Photos of the issue (optional)','Access'],evidence:'Assessment notes, parts used, completion photo or customer sign-off',creds:['Public liability insurance']},
  tutoring:{name:'Tutoring',status:'pilot',ver:1,syn:['tutor','tutors','tutoring','maths','math','english','science','gcse','a level','homework','lessons','lesson'],
    intake:['Subject','Level','Venue or online','Session length'],evidence:'Session attendance and customer sign-off. No photos',creds:['Enhanced DBS check','Subject qualification']},
  gardening:{name:'Gardening',status:'interest',ver:0,syn:['garden','gardener','gardening','lawn','hedge','mowing'],intake:[],evidence:'Not configured',creds:[]},
  pets:{name:'Pet care',status:'interest',ver:0,syn:['dog walker','dog walking','pet sitter','pet','cat sitter'],intake:[],evidence:'Not configured',creds:[]}};
const MODE_L={mobile:'Comes to you',venue:'At their venue',online:'Online'};
function mktInit(){if(S.mkt)return;const T=today();
  const prov={
    ff:{name:'Fenland Fresh Cleaning',cats:['cleaning'],base:{d:'PE6',public:true,label:'Crowland office'},rating:4.6,reviews:38,verified:true,since:'2025'},
    ss:{name:'Spotless Spalding',cats:['cleaning'],base:{d:'PE11',public:false},rating:4.8,reviews:21,verified:true,since:'2024'},
    pc:{name:'Peterborough Clean Co',cats:['cleaning'],base:{d:'PE1',public:true,label:'City centre office'},rating:4.4,reviews:56,verified:true,since:'2022'},
    fx:{name:'Fixwell Repairs',cats:['repairs'],base:{d:'PE2',public:true,label:'Orton workshop'},rating:4.7,reviews:33,verified:true,since:'2023'},
    rc:{name:'Stamford Repair Workshop',cats:['repairs'],base:{d:'PE9',public:true,label:'Workshop, Stamford'},rating:4.5,reviews:12,verified:true,since:'2025'},
    nt:{name:'Nene Tutors',cats:['tutoring'],base:{d:'PE1',public:true,label:'Study centre, Peterborough'},rating:4.9,reviews:40,verified:true,since:'2021'},
    bm:{name:'BrightMind Online',cats:['tutoring'],base:null,rating:4.6,reviews:90,verified:true,since:'2023'},
    dk:{name:'Deepings Domestic',cats:['cleaning'],base:{d:'PE6',public:false},rating:0,reviews:0,verified:false,since:'2026'},
    sw:{name:'Swift Sparkle',cats:['cleaning'],base:{d:'PE7',public:false},rating:3.9,reviews:14,verified:true,since:'2024'},
    gl:{name:'Garden Lads',cats:['gardening'],base:{d:'PE13',public:false},rating:0,reviews:0,verified:false,since:'2026'}};
  const wk={days:[1,2,3,4,5,6],from:8,to:18};
  const L=[
    {id:'L-ff-reg',prov:'ff',cat:'cleaning',svc:'regular',name:'Regular home clean',mode:'mobile',booking:'instant',status:'published',cov:{type:'ff'},avail:'slots'},
    {id:'L-ff-deep',prov:'ff',cat:'cleaning',svc:'deep',name:'Deep clean',mode:'mobile',booking:'instant',status:'published',cov:{type:'ff'},avail:'slots'},
    {id:'L-ff-eot',prov:'ff',cat:'cleaning',svc:'eot',name:'End of tenancy clean',mode:'mobile',booking:'instant',status:'published',cov:{type:'ff'},avail:'slots'},
    {id:'L-ff-off',prov:'ff',cat:'cleaning',svc:'office',name:'Office and commercial cleaning',mode:'mobile',booking:'quote',status:'published',cov:{type:'ff'},price:'Custom quote after a survey'},
    {id:'L-ff-carpet',prov:'ff',cat:'cleaning',name:'Carpet steam cleaning',mode:'mobile',booking:'quote',status:'draft',cov:{type:'ff'},price:'From £70 a room'},
    {id:'L-ss-reg',prov:'ss',cat:'cleaning',name:'Home cleaning',mode:'mobile',booking:'instant',status:'published',cov:{type:'districts',d:['PE11','PE12','PE6','PE10'],ex:[]},price:'From £70 per visit',from:7000,avail:{...wk,days:[1,2,3,4,5],taken:['2026-10-16 10:00']}},
    {id:'L-pc-reg',prov:'pc',cat:'cleaning',name:'Regular and deep cleaning',mode:'mobile',booking:'instant',status:'published',cov:{type:'radius',km:9,ex:['PE7']},price:'From £65 per visit',from:6500,avail:{...wk}},
    {id:'L-fx-hm',prov:'fx',cat:'repairs',name:'Handyman and small repairs',mode:'mobile',booking:'instant',status:'published',cov:{type:'districts',d:['PE1','PE2','PE3','PE4','PE6','PE7'],ex:[]},price:'£45 an hour, 1 hour minimum',from:4500,avail:{...wk}},
    {id:'L-fx-tap',prov:'fx',cat:'repairs',name:'Leaking tap and toilet repair',mode:'mobile',booking:'quote',status:'published',cov:{type:'districts',d:['PE1','PE2','PE3','PE4','PE6','PE7'],ex:[]},price:'Quote after photos, typically £85'},
    {id:'L-rc-app',prov:'rc',cat:'repairs',name:'Small appliance repair (bring it in)',mode:'venue',booking:'instant',status:'published',cov:{type:'venue',km:40},price:'£20 assessment, then a quote',from:2000,avail:{days:[2,4,6],from:10,to:16}},
    {id:'L-nt-math',prov:'nt',cat:'tutoring',name:'GCSE maths tutoring',mode:'venue',booking:'instant',status:'published',cov:{type:'venue',km:35},price:'£35 per hour',from:3500,avail:{days:[1,2,3,4,6],from:9,to:19}},
    {id:'L-nt-on',prov:'nt',cat:'tutoring',name:'Maths and English tutoring online',mode:'online',booking:'instant',status:'published',cov:{type:'online'},price:'£32 per hour',from:3200,avail:{days:[1,2,3,4,5,6],from:9,to:20}},
    {id:'L-bm-on',prov:'bm',cat:'tutoring',name:'Online tutoring, all subjects',mode:'online',booking:'instant',status:'published',cov:{type:'online'},price:'£30 per hour',from:3000,avail:{days:[0,1,2,3,4,5,6],from:8,to:21}},
    {id:'L-dk-reg',prov:'dk',cat:'cleaning',name:'Domestic cleaning',mode:'mobile',booking:'instant',status:'review',cov:{type:'districts',d:['PE6','PE9'],ex:[]},price:'From £55 per visit',from:5500,avail:{...wk},submitted:'Wed 14 Oct, 16:20',checks:{creds:false,cov:true,price:true}},
    {id:'L-sw-reg',prov:'sw',cat:'cleaning',name:'Home cleaning',mode:'mobile',booking:'instant',status:'suspended',cov:{type:'districts',d:['PE7','PE15'],ex:[]},price:'From £60 per visit',from:6000,avail:{...wk},reason:'Public liability insurance expired 30 Sep. Awaiting new certificate.'},
    {id:'L-gl-gdn',prov:'gl',cat:'gardening',name:'Garden maintenance',mode:'mobile',booking:'quote',status:'draft',cov:{type:'districts',d:['PE13','PE15'],ex:[]},price:'Quote',note:'Category not enabled yet'}];
  /* seeded demand: request records (demo, labelled and excluded from production analytics) */
  const R=rng(20261028);const req=[];let n=1;
  const clusters={cleaning:[['PE1',34],['PE2',20],['PE4',14],['PE11',18],['PE6',11],['PE13',16],['PE15',9],['PE9',8],['PE7',8],['PE12',3],['PE8',2],['PE10',6]],repairs:[['PE13',15],['PE15',11],['PE1',13],['PE11',7],['PE2',6],['PE9',3]],tutoring:[['PE9',12],['PE1',16],['PE3',9],['PE10',4],['PE13',6]]};
  Object.entries(clusters).forEach(([cat,cl])=>cl.forEach(([d,w])=>{const c=DXY[d];const cust=Math.max(2,Math.round(w*0.8));
    for(let i=0;i<w;i++){const p={x:Math.min(MAP_W-0.5,Math.max(0.5,c.x+(R()-.5)*5)),y:Math.min(MAP_H-0.5,Math.max(0.5,c.y+(R()-.5)*5))};
      const day=Math.floor(R()*45);const created=addDays('2026-09-01',day);const r=R();
      req.push({id:'RQ-'+(n++),cat,p,cust:cat+'-'+d+'-'+Math.floor(R()*cust),created,mode:cat==='tutoring'&&R()<.3?'venue':'mobile',outcomeRoll:r,demo:true})}}));
  const searches=[];Object.entries(clusters).forEach(([cat,cl])=>cl.forEach(([d,w])=>{const c=DXY[d];for(let i=0;i<w*3;i++)searches.push({cat,p:{x:c.x+(R()-.5)*6,y:c.y+(R()-.5)*6},sess:cat+d+Math.floor(R()*w*2),created:addDays('2026-09-01',Math.floor(R()*45)),demo:true})}));
  S.mkt={prov,listings:L,req,searches,cats:JSON.parse(JSON.stringify(CAT_SEED)),catRequests:[{id:'CQ-4',cat:'gardening',by:'Garden Lads',at:'Mon 12 Oct, 09:30',status:'open',note:'We do hedges, lawns and clearance around Wisbech and March.'}],
    health:{demand:{run:'Thu 15 Oct, 02:00',status:'ok',dur:'4 min'},coverage:{run:'Thu 15 Oct, 12:35',status:'ok',dur:'40 s'},quality:{bots:41,test:12,self:7,noLoc:19}},
    reports:[{id:'MR-12',type:'Listing',target:'L-pc-reg',what:'Peterborough Clean Co · Regular and deep cleaning',reason:'Says “all areas” but declined my PE7 booking.',by:'A customer',at:'Tue 13 Oct, 18:02',status:'open'},
             {id:'MR-13',type:'Review',target:'R-ss-9',what:'Review of Spotless Spalding (2★)',reason:'Review contains the cleaner’s full name and phone number.',by:'Spotless Spalding',at:'Wed 14 Oct, 11:40',status:'open'}],
    access:[{id:'TA-7',tenant:'Fenland Fresh Cleaning',by:'Support · Lee M.',reason:'Customer reports a duplicate payment on v-0990',scope:'Payments for one booking',hours:2,status:'pending',at:'Thu 15 Oct, 09:05'}],
    adminAudit:[],expDraft:null,disc:null,orders:null};
  mktOrdersInit();
}
function mktOrdersInit(){const M=S.mkt;if(M.orders)return;
  M.orders=[
    {id:'O-501',prov:'fx',listing:'L-fx-hm',cat:'repairs',customer:'amara',custName:'Amara Okafor',name:'Handyman and small repairs',where:'14 Willow Lane, Crowland PE6 0JH',date:'2026-10-16',time:'10:00',dur:1.5,price:6750,priceNote:'£45 an hour × 1.5 h estimate. Extra time needs your approval.',status:'booked',pro:'x1',intake:{'Issue description':'Kitchen cupboard door hanging off, and a loose shelf in the hall.'},pay:'Card on completion',ev:null},
    {id:'O-502',prov:'nt',listing:'L-nt-on',cat:'tutoring',customer:'amara',custName:'Amara Okafor',name:'Maths and English tutoring online',where:'Online',date:'2026-10-17',time:'11:00',dur:1,price:3200,priceNote:'£32 per hour, 1 hour session.',status:'booked',pro:'x2',intake:{Subject:'Maths',Level:'GCSE','Venue or online':'Online'},pay:'Paid',ev:null},
    {id:'O-488',prov:'fx',listing:'L-fx-hm',cat:'repairs',customer:null,custName:'Ben Harris',name:'Handyman and small repairs',where:'PE4',date:'2026-10-12',time:'14:00',dur:2,price:9000,status:'completed',pro:'x1',intake:{'Issue description':'Fit three shelves'},pay:'Paid',ev:{type:'repairs',notes:'Fitted 3 shelves with wall plugs.',parts:'Brackets £8',signoff:'Ben Harris',photo:true,at:'Mon 12 Oct, 15:55'}},
    {id:'O-480',prov:'sw',listing:'L-sw-reg',cat:'cleaning',customer:null,custName:'R. Walsh',name:'Home cleaning',where:'PE7',date:'2026-10-20',time:'09:00',dur:2,price:6000,status:'booked',pro:null,intake:{},pay:'Paid',ev:null,flag:'Listing suspended: operations review needed'}];
}
const XPROS={x1:{name:'Sam Okoro',prov:'fx',role:'Repairs technician',mobile:'07700 900 201'},x2:{name:'Aisha Khan',prov:'nt',role:'Maths and English tutor',mobile:'07700 900 202'},x3:{name:'Grace Adeyemi',prov:'ss',role:'Weekend cleaner',mobile:'07700 900 101',email:'grace.adeyemi@mail.example'},x4:{name:'Grace Adeyemi',prov:'dk',role:'Cleaner',mobile:'07700 900 101',email:'grace.adeyemi@mail.example',invited:'Mon 26 Oct'}};
function provOf(l){return S.mkt.prov[l.prov]}
function ffZones(){return [...S.settings.zones,...((S.pricing.area||{}).outer||[]).map(o=>o.d)]}
function covDistricts(l){if(l.cov.type==='ff')return ffZones();if(l.cov.type==='districts')return l.cov.d;return null}
function baseXY(l){const b=provOf(l).base;return b?DXY[b.d]:null}
function eligibleAt(l,loc){if(l.mode==='online')return true;const d=nearestDistrict(loc);
  if(l.cov.ex&&l.cov.ex.includes(d))return false;
  if(l.cov.type==='ff'||l.cov.type==='districts')return covDistricts(l).includes(d);
  const b=baseXY(l);if(!b)return false;return dist2(b,loc)<=l.cov.km}
function listingFrom(l){if(l.svc&&l.prov==='ff'&&SERVICES[l.svc]&&l.svc!=='office')return fromPrice(l.svc);return l.from||0}
function priceLabel(l){if(l.prov==='ff'&&l.svc&&l.svc!=='office')return `From ${money(listingFrom(l))} per visit`;if(l.pm)return pmLabel(l.pm);return l.price||'Quote'}
function slotStateFor(l,date,time){/* returns 'available'|'unavailable'|null */
  if(!date||!time)return null;
  if(l.avail==='slots'){const s=SLOTS.find(x=>x.date===date&&x.start===time);return s&&slotState(s)>0?'available':'unavailable'}
  const A=l.avail;if(!A)return 'unavailable';const dow=dt(date).getDay();const h=+time.slice(0,2);
  if(!A.days.includes(dow)||h<A.from||h>=A.to)return 'unavailable';if((A.taken||[]).includes(date+' '+time))return 'unavailable';
  const taken=(S.mkt.orders||[]).some(o=>o.listing===l.id&&o.date===date&&o.time===time&&o.status!=='cancelled');return taken?'unavailable':'available'}
const MIN_CUST=5;
function outcomeOf(r){/* outcome at cutoff, derived from coverage at request point */
  if(r.outcome)return r.outcome;const cut=addDays(today(),-3);if(r.created>cut)return 'pending';
  const cov=S.mkt.listings.some(l=>l.cat===r.cat&&l.status==='published'&&eligibleAt(l,r.p));
  if(r.outcomeRoll<.06)return 'cancelled';if(!cov)return 'no_coverage';if(r.outcomeRoll<.16)return 'no_capacity';if(r.outcomeRoll<.24)return 'declined';return 'booked'}
function periodRangeM(p){return p==='sep'?['2026-09-01','2026-09-30']:p==='oct'?['2026-10-01',today()]:[addDays(today(),-30),today()]}
function healthStale(){const h=S.mkt.health;return h.demand.status!=='ok'||h.coverage.status!=='ok'}
