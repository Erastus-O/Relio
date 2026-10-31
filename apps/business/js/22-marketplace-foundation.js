/* MARKETPLACE FOUNDATION (Relio PRD/FRD v2.0) */
const PLATFORM='Relio';
const GEO={PE1:[52.583,-0.243,'Peterborough'],PE2:[52.556,-0.272,'Orton'],PE3:[52.593,-0.290,'Bretton'],PE4:[52.618,-0.262,'Werrington'],PE6:[52.676,-0.170,'Crowland'],PE7:[52.556,-0.130,'Whittlesey'],PE8:[52.481,-0.468,'Oundle'],PE9:[52.652,-0.480,'Stamford'],PE10:[52.768,-0.378,'Bourne'],PE11:[52.787,-0.153,'Spalding'],PE12:[52.804,0.016,'Holbeach'],PE13:[52.664,0.160,'Wisbech'],PE15:[52.551,0.088,'March']};
const MAP_W=51,MAP_H=46,CELL=5;
function kmOf(lat,lng){return {x:+((lng+0.55)*67.6).toFixed(2),y:+((52.86-lat)*111.3).toFixed(2)}}
const DXY={};
Object.entries(GEO).forEach(([k,[a,b]])=>DXY[k]=kmOf(a,b));
function dist2(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function nearestDistrict(p){let best=null,bd=1e9;Object.entries(DXY).forEach(([k,c])=>{const d=dist2(p,c);if(d<bd){bd=d;best=k}});return best}
function hashStr(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
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
function cellRef(k){const [x,y]=k.split(',').map(Number);return 'ABCDEFGHIJK'[x]+(y+1)}
function cellKey(p){return Math.floor(p.x/CELL)+','+Math.floor(p.y/CELL)}
function bandCount(n){return n<5?null:n<10?'5–9':n<20?'10–19':n<50?'20–49':'50+'}
function outcomeOf(r){/* outcome at cutoff, derived from coverage at request point */
  if(r.outcome)return r.outcome;const cut=addDays(today(),-3);if(r.created>cut)return 'pending';
  const cov=S.mkt.listings.some(l=>l.cat===r.cat&&l.status==='published'&&eligibleAt(l,r.p));
  if(r.outcomeRoll<.06)return 'cancelled';if(!cov)return 'no_coverage';if(r.outcomeRoll<.16)return 'no_capacity';if(r.outcomeRoll<.24)return 'declined';return 'booked'}
function periodRangeM(p){return p==='sep'?['2026-09-01','2026-09-30']:p==='oct'?['2026-10-01',today()]:[addDays(today(),-30),today()]}
function aggregate(cat,period,mode){const [a,b]=periodRangeM(period);const cells={};
  const C=k=>cells[k]||(cells[k]={req:0,cust:new Set(),booked:0,unmet:0,pending:0,cancelled:0,search:new Set()});
  S.mkt.req.filter(r=>r.cat===cat&&r.created>=a&&r.created<=b&&(!mode||mode==='all'||r.mode===mode)).forEach(r=>{const c=C(cellKey(r.p));c.req++;c.cust.add(r.cust);const o=outcomeOf(r);
    if(o==='booked')c.booked++;else if(['no_coverage','no_provider','no_capacity'].includes(o))c.unmet++;else if(o==='pending')c.pending++;else if(o==='cancelled')c.cancelled++});
  S.mkt.searches.filter(s=>s.cat===cat&&s.created>=a&&s.created<=b).forEach(s=>C(cellKey(s.p)).search.add(s.sess));
  return cells}
function cellSupply(cat,cx,cy){const pts=[[.1,.1],[.9,.1],[.1,.9],[.9,.9],[.5,.5]].map(([u,v])=>({x:(cx+u)*CELL,y:(cy+v)*CELL}));
  const provs={};S.mkt.listings.filter(l=>l.cat===cat&&l.status==='published'&&l.mode!=='online').forEach(l=>{const hit=pts.filter(p=>eligibleAt(l,p)).length;if(!hit)return;const P=provs[l.prov]||(provs[l.prov]={full:false,instant:false});if(hit===pts.length)P.full=true;if(l.booking==='instant')P.instant=true});
  const ids=Object.keys(provs);const status=!ids.length?'none':ids.some(k=>provs[k].instant)?'bookable':'quote';return {n:ids.length,full:ids.some(k=>provs[k].full),status,provs}}
function healthStale(){const h=S.mkt.health;return h.demand.status!=='ok'||h.coverage.status!=='ok'}
let MAPBASE=null;
const MAJOR_ROADS=[['PE9','PE3','A47'],['PE3','PE1',''],['PE1','PE7','A605'],['PE7','PE15','A141'],['PE15','PE13','A141'],['PE1','PE6','A1073'],['PE6','PE11','A1073'],['PE11','PE12','A151'],['PE12','PE13','A17'],['PE6','PE13','A47'],['PE10','PE11','A151'],['PE9','PE10','A6121'],['PE8','PE2','A605'],['PE2','PE1',''],['PE4','PE1',''],['PE10','PE4','A15']];
function mapBase(){if(MAPBASE)return MAPBASE;const R=rng(77);const f=n=>n.toFixed(2);let o='';const X0=-45,Y0=-20,X1=95,Y1=66;
  o+=`<rect class="mb-land" x="${X0}" y="${Y0}" width="${X1-X0}" height="${Y1-Y0}"/>`;
  for(let i=0;i<70;i++){const x=X0+R()*(X1-X0),y=Y0+R()*(Y1-Y0);o+=`<ellipse class="mb-field" cx="${f(x)}" cy="${f(y)}" rx="${f(1+R()*3)}" ry="${f(.6+R()*1.8)}" transform="rotate(${(R()*180).toFixed(0)} ${f(x)} ${f(y)})"/>`}
  o+=`<path class="mb-sea" d="M30 -20 C33 -4, 42 1, 52 0 S 72 -4, 95 2 L95 -20 Z"/>`;
  Object.entries(DXY).forEach(([k,p])=>{const big=['PE1','PE2','PE3','PE4'].includes(k);o+=`<circle class="mb-urban" cx="${p.x}" cy="${p.y}" r="${big?3.4:2.4}"/>`});
  Object.entries(DXY).forEach(([k,p])=>{for(let i=0;i<3;i++){const a=R()*6.28,d=.8+R()*2.4;const x=p.x+Math.cos(a)*d,y=p.y+Math.sin(a)*d;o+=`<rect class="mb-park" x="${f(x-.4)}" y="${f(y-.3)}" width="${f(.5+R()*1.2)}" height="${f(.4+R()*.9)}" rx=".2" transform="rotate(${(R()*60-30).toFixed(0)} ${f(x)} ${f(y)})"/>`}});
  o+=`<path class="mb-river" d="M-45 42 C-10 40, 4 37, 12 34 S 18 31, 24 31 S 36 30, 44 24 S 50 16, 56 12 S 70 5, 95 3"/><path class="mb-river thin" d="M26.8 8 C27 14, 26 18, 25.7 21"/>`;
  for(let i=0;i<150;i++){const x=X0+R()*(X1-X0),y=Y0+R()*(Y1-Y0),a=R()*6.28,l=2+R()*7;const x2=x+Math.cos(a)*l,y2=y+Math.sin(a)*l;o+=`<path class="mb-lane" d="M${f(x)} ${f(y)} Q${f((x+x2)/2+(R()-.5)*2.5)} ${f((y+y2)/2+(R()-.5)*2.5)} ${f(x2)} ${f(y2)}"/>`}
  Object.entries(DXY).forEach(([k,p])=>{const big=['PE1','PE2','PE3','PE4'].includes(k);const rad=big?3.1:2.1;const th=R()*Math.PI/2;
    [th,th+Math.PI/2].forEach((fam,fi)=>{const ux=Math.cos(fam),uy=Math.sin(fam),nx=-uy,ny=ux;for(let off=-rad;off<=rad;off+=(fi?.7:.38)+R()*.2){const half=Math.sqrt(Math.max(0,rad*rad-off*off))*(.45+R()*.5);if(half<.25||R()<.15)continue;const s=(R()-.5)*half*.4;const cx=p.x+nx*off+ux*s,cy=p.y+ny*off+uy*s;o+=`<path class="mb-street" d="M${f(cx-ux*half)} ${f(cy-uy*half)} L${f(cx+ux*half)} ${f(cy+uy*half)}"/>`}})});
  o+=`<path class="mb-rail" d="M${DXY.PE9.x} ${DXY.PE9.y} Q 12 27, ${DXY.PE1.x} ${DXY.PE1.y} Q 25 33, ${DXY.PE7.x} ${DXY.PE7.y} L ${DXY.PE15.x} ${DXY.PE15.y}"/><path class="mb-rail" d="M${DXY.PE1.x} ${DXY.PE1.y} Q 23 18, ${DXY.PE11.x} ${DXY.PE11.y}"/>`;
  o+=`<path class="mb-trunk-c" d="M9 70 Q 7 30, 5 -20"/><path class="mb-trunk" d="M9 70 Q 7 30, 5 -20"/>`;
  const rd=MAJOR_ROADS.map(([a,b])=>{const A=DXY[a],B=DXY[b];const mx=(A.x+B.x)/2+(R()-.5)*3,my=(A.y+B.y)/2+(R()-.5)*3;return `M${A.x} ${A.y} Q${f(mx)} ${f(my)} ${B.x} ${B.y}`});
  o+=rd.map(d=>`<path class="mb-major-c" d="${d}"/>`).join('')+rd.map(d=>`<path class="mb-major" d="${d}"/>`).join('');
  MAPBASE={g:o,shields:MAJOR_ROADS.map(([a,b,n],i)=>{if(!n)return null;const A=DXY[a],B=DXY[b];return {x:(A.x+B.x)/2,y:(A.y+B.y)/2,n}}).filter(Boolean).concat([{x:6.6,y:12,n:'A1'}])};return MAPBASE}
function svgMap(o){const vbA=o.vb?o.vb.split(' ').map(Number):[0,0,MAP_W,MAP_H];const px=o.px||1000,ph=o.ph||px*.62;const s=Math.min(vbA[2]/px,vbA[3]/ph);/* km per screen px (approx, slice) */
  const B=mapBase();const T=n=>(n*s).toFixed(3);
  const towns=Object.entries(DXY).map(([k,p])=>{const big=['PE1'].includes(k);return `<text class="mb-town ${big?'big':''}" x="${p.x}" y="${p.y}" style="font-size:${T(big?17:13)}px;stroke-width:${T(3)}px" text-anchor="middle">${GEO[k][2]}</text>`}).join('');
  const shields=B.shields.map(r=>`<g class="mb-shield"><rect x="${(r.x-r.n.length*3.2*s-3*s).toFixed(2)}" y="${(r.y-7*s).toFixed(2)}" width="${(r.n.length*6.4*s+6*s).toFixed(2)}" height="${(14*s).toFixed(2)}" rx="${T(3)}"/><text x="${r.x}" y="${(r.y+4*s).toFixed(2)}" style="font-size:${T(10)}px" text-anchor="middle">${r.n}</text></g>`).join('');
  const grid=o.cells?o.cells.join(''):'';
  const cov=(o.coverage||[]).map(d=>{const p=DXY[d];return p?`<circle class="mp-cov ${o.draft&&o.draft.includes(d)?'draft':''}" cx="${p.x}" cy="${p.y}" r="3.6"/>`:''}).join('');
  const pins=(o.pins||[]).map(p=>{const r=13*s,h=34*s;const cy=p.y-h+r;return `<g class="mp-pin ${p.sel?'sel':''} ${p.kind||''}" data-act="${p.act||'discSel'}" data-v="${p.id}" aria-hidden="true"><path d="M${p.x} ${p.y} L${(p.x-r*.62).toFixed(2)} ${(cy+r*.72).toFixed(2)} A${r.toFixed(3)} ${r.toFixed(3)} 0 1 1 ${(p.x+r*.62).toFixed(2)} ${(cy+r*.72).toFixed(2)} Z"/>${p.n!=null?`<text x="${p.x}" y="${(cy+5*s).toFixed(2)}" style="font-size:${T(p.kind==='cluster'?12:13)}px" text-anchor="middle">${p.n}</text>`:''}</g>`}).join('');
  const loc=o.loc?`<g class="mp-loc"><circle cx="${o.loc.x}" cy="${o.loc.y}" r="${T(22)}"/><circle class="dot" cx="${o.loc.x}" cy="${o.loc.y}" r="${T(7)}" style="stroke-width:${T(3)}px"/></g>`:'';
  return `<svg class="mp" id="${o.id||'map'}" viewBox="${vbA.join(' ')}" role="img" aria-label="${esc(o.label||'Map')}" preserveAspectRatio="xMidYMid slice">${B.g}${grid}${cov}${shields}${towns}${loc}${pins}</svg>`}
