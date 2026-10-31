
(function(){
  const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gbp=p=>'£'+(p/100).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});

  /* product preview */
  const V={
    overview:$('#fmain').innerHTML,
    rota:`<div class="row-b"><h4>Rota · w/c 26 Oct</h4><span class="badge warn">Draft · private to planners</span></div>
      <div class="rgrid"><div class="hd">Cleaner</div><div class="hd">Mon</div><div class="hd">Tue</div><div class="hd">Wed</div><div class="hd">Thu</div><div class="hd">Fri</div>
      <div><b>Grace A.</b></div><div></div><div></div><div></div><div><span class="rchip">Okafor 13:00</span></div><div></div>
      <div><b>Tomasz N.</b></div><div><span class="rchip">Harbour 18:00</span></div><div></div><div><span class="rchip">Harbour 18:00</span></div><div></div><div><span class="rchip">Harbour 18:00</span></div>
      <div><b>Kwame M.</b></div><div></div><div><span class="rchip d">Nene 07:00</span></div><div></div><div></div><div></div>
      <div><b>Ellie B.</b></div><div><span class="rchip">Harbour 18:00</span></div><div></div><div><span class="rchip g">Gap · 1/2</span></div><div><span class="rchip g">Nene · unfilled</span></div><div><span class="rchip">Harbour 18:00</span></div></div>
      <div class="mini-btns"><button type="button" class="pri" data-msg="Shown in the demo: publishing checks notice, skills and DBS checks first.">Review and publish week</button><button type="button" data-msg="2 visits are short of crew. Allocate from the unfilled list.">Fill 2 gaps</button></div>`,
    bookings:`<h4>Bookings</h4><div class="tbl"><div class="tr"><span>When</span><span>Site</span><span>Invoice</span><span>Payment</span></div>
      <div class="tr"><span>Wed 7 Oct</span><span>Harbour Logistics · Unit 4</span><span>INV-0041</span><span class="badge ok">Paid</span></div>
      <div class="tr"><span>Thu 8 Oct</span><span>Okafor home</span><span>–</span><span class="badge ok">Paid £67.50</span></div>
      <div class="tr"><span>Tue 13 Oct</span><span>Nene Valley Accountants</span><span>INV-0040</span><span class="badge bad">Overdue</span></div>
      <div class="tr"><span>Wed 14 Oct</span><span>Reid home</span><span>–</span><span class="badge warn">Dispute open</span></div></div>`,
    disputes:`<div class="row-b"><h4>C-2041 · Missed task</h4><span class="badge bad">Past response target</span></div>
      <div class="dcase"><span class="muted">Jo Reid · Reid home visit Wed 14 Oct</span><p>“The oven was on the booking and paid for but it was not cleaned.”</p><span>Cleaner recorded: <b>not done</b>. Oven heavily carbonised, needs a longer slot.</span>
      <div class="mini-btns"><button type="button" class="pri" data-msg="Remedy proposed: free re-clean of the oven. Customer notified.">Offer a re-clean</button><button type="button" data-msg="Partial refund proposed: 20% (£19.25). Customer notified.">Offer 20% refund</button></div></div>`,
    payroll:`<div class="row-b"><h4>Payroll · 1 – 15 Oct</h4><span class="badge info">Pay date Fri 23 Oct</span></div>
      <div class="tbl"><div class="tr"><span>Hours</span><span>Employee</span><span>Rate</span><span>Amount</span></div>
      <div class="tr"><span>27.5</span><span>Tomasz Nowak</span><span>£13.40</span><span class="num">£368.50</span></div>
      <div class="tr"><span>21.0</span><span>Grace Adeyemi</span><span>£12.85</span><span class="num">£269.85</span></div>
      <div class="tr"><span>18.0</span><span>Ellie Barker</span><span>£12.85</span><span class="num">£231.30</span></div>
      <div class="tr"><span>13.8</span><span>Kwame Mensah</span><span>£12.85</span><span class="num">£177.33</span></div></div>
      <div class="mini-btns"><button type="button" class="pri" data-msg="Batch locked and exported. Exported is never shown as paid.">Approve and export</button></div>`,
    analytics:`<div class="row-b"><h4>Revenue by month</h4><div class="legend"><span><i style="background:var(--brand)"></i>Commercial</span><span><i style="background:var(--moss)"></i>Domestic</span></div></div>
      <div class="mbars">${[['May',215,114],['Jun',206,124],['Jul',222,128],['Aug',198,68],['Sep',214,117],['Oct',98,37,163]].map(([m,c,d,p])=>`<div title="${m}">${p?`<i class="p" style="height:${p/3.6}%"></i>`:''}<i class="c" style="height:${d/3.6}%"></i><i style="height:${c/3.6}%"></i><span>${m}</span></div>`).join('')}</div>
      <div class="dcase"><span class="badge bad">Risk</span><b>49% of revenue comes from one client</b><span class="muted">Harbour Logistics. Aim to keep any single client under 30%.</span></div>`,
    training:`<h4>Training</h4><div class="tbl"><div class="tr"><span>Course</span><span>Cleaner</span><span>Due</span><span>Status</span></div>
      <div class="tr"><span>Fire safety</span><span>Priya Shah</span><span>20 Sep</span><span class="badge bad">Expired</span></div>
      <div class="tr"><span>COSHH</span><span>Priya Shah</span><span>4 Nov</span><span class="badge warn">Renew soon</span></div>
      <div class="tr"><span>Safeguarding</span><span>Ellie Barker</span><span>13 Nov</span><span class="badge info">Assigned</span></div>
      <div class="tr"><span>Manual handling</span><span>Grace Adeyemi</span><span>Feb 2028</span><span class="badge ok">Valid</span></div></div>
      <div class="mini-btns"><button type="button" class="pri" data-msg="2 refreshers assigned, due Thu 5 Nov. Cleaners notified in their app.">Assign due refreshers</button></div>`};
  const fm=$('#fmain');const ftabs=$$('.f-side [role=tab]');
  function showView(b){ftabs.forEach(t=>{const on=t===b;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1});fm.innerHTML=V[b.dataset.v];fm.classList.remove('swap');void fm.offsetWidth;fm.classList.add('swap');
    $('.f-top .url').textContent='business.relio.com/'+b.dataset.v}
  ftabs.forEach((b,i)=>{b.tabIndex=i?-1:0;b.addEventListener('click',()=>showView(b));b.addEventListener('keydown',e=>{const d=e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0;if(d){e.preventDefault();const n=ftabs[(i+d+ftabs.length)%ftabs.length];showView(n);n.focus()}})});
  fm.addEventListener('click',e=>{const b=e.target.closest('[data-msg]');if(!b)return;const n=document.createElement('div');n.className='badge ok';n.style.width='auto';n.textContent=b.dataset.msg;b.closest('.mini-btns').replaceWith(n)});

  /* search the strip */
  const q=$('#q'),strip=$('.strip'),cards=$$('.strip .mini'),hint=$('#qhint');
  q.addEventListener('input',()=>{const t=q.value.trim().toLowerCase();strip.classList.toggle('static',!!t);let n=0;
    cards.forEach(c=>{const dup=c.classList.contains('dupe');const hit=!t||c.dataset.k.split(' ').some(w=>w.startsWith(t)||t.split(/\s+/).some(x=>x.length>2&&w.startsWith(x)));c.hidden=t?(dup||!hit):false;if(t&&hit&&!dup)n++});
    hint.textContent=!t?'Try “oven”, “invoice”, “rota” or “training”.':n?`${n} match${n>1?'es':''} in your workspace.`:'Nothing found. Try “oven”, “invoice”, “rota” or “training”.'});

  /* booking tile */
  let slot='Thu 13:00',disc=15;const base=13500;
  function bk(){const f={0:'once',5:'monthly',10:'fortnightly',15:'weekly'}[disc];$('#bk-when').textContent=`3-bed · ${slot} · ${f}`;$('#bk-price').textContent=gbp(Math.round(base*(1-disc/100)))}
  $$('.slot [role=radio]').forEach(b=>b.addEventListener('click',()=>{$$('.slot [role=radio]').forEach(x=>x.setAttribute('aria-checked',x===b));slot=b.textContent;bk()}));
  $$('.seg-mini [role=radio]').forEach(b=>b.addEventListener('click',()=>{$$('.seg-mini [role=radio]').forEach(x=>x.setAttribute('aria-checked',x===b));disc=+b.dataset.f;bk()}));
  bk();

  /* rota tile */
  function gaps(){const n=$$('#week button.g').length;const g=$('#gaps');g.textContent=n?`${n} gap${n>1?'s':''}`:'Ready to publish';g.className='badge '+(n?'bad':'ok')}
  $('#week').addEventListener('click',e=>{const b=e.target.closest('button.g');if(!b)return;const d=document.createElement('div');d.className='j new';b.replaceWith(d);gaps()});

  /* compare slider */
  const cr=$('#cmp-r'),cmp=$('#cmp');cr.addEventListener('input',()=>cmp.style.setProperty('--x',cr.value+'%'));

  /* credit note */
  const cn=$('#cn');function cnu(){const pct=+cn.value,a=Math.round(72000*pct/100);$('#cn-v').textContent=pct;$('#cn-a').textContent=(a?'−':'')+gbp(a);$('#cn-b').textContent=gbp(72000-a)}cn.addEventListener('input',cnu);cnu();

  /* payroll */
  const pc=$$('.pay input');function pay(){const t=pc.filter(x=>x.checked).reduce((a,x)=>a+ +x.dataset.amt,0);$('#pay-t').textContent=`${gbp(t)} approved`}pc.forEach(x=>x.addEventListener('change',pay));pay();

  /* bars */
  const bv=$('#bar-v');$$('#bars button').forEach(b=>{const on=()=>{$$('#bars button').forEach(x=>x.classList.toggle('on',x===b));bv.textContent=b.dataset.l};b.addEventListener('mouseenter',on);b.addEventListener('focus',on);b.addEventListener('click',on)});

  /* assistant */
  const A={
    cover:{q:"Who can cover Saturday's Reid visit?",used:['Checked rota','Checked cover rules'],a:`<p><b>Reid home, Sat 17 Oct 10:00–12:30</b> needs 1 cleaner. Kwame declined.</p><ul><li><b>Grace Adeyemi</b> is eligible and free that morning.</li><li>Tomasz and Ellie aren't trained for domestic work yet.</li><li>Priya can't take home visits until her DBS check is renewed.</li></ul>`,open:'Open Rota'},
    today:{q:'What needs my attention today?',used:['Checked visits','Checked disputes'],a:`<p>You have <b>3 visits</b> today and four things to act on:</p><ul><li>Dispute C-2041 is past its response target.</li><li>1 visit is waiting for evidence review.</li><li>A cover request for Saturday is still open.</li><li>2 payroll exceptions before the pay period locks.</li></ul><p>Start with the dispute.</p>`,open:'Open Disputes'},
    profit:{q:'Which clients are least profitable?',used:['Checked clients','Checked finance'],a:`<p>By estimated margin this month, against your 25% target:</p><ul><li><b>Okafor home</b>: 24%, £27.00 per cleaner-hour</li><li><b>Harbour Logistics</b>: 25%, 49% of your revenue</li><li><b>Reid home</b>: 36%</li><li><b>Nene Valley</b>: 49%</li></ul><p>Review Okafor at the next price change, and win another contract to reduce reliance on Harbour.</p>`,open:'Open Analytics'},
    quote:{q:'Quote a 3-bed end of tenancy',used:['Priced the job'],a:`<p><b>End of tenancy, 3 bed: £260.00</b> (not VAT registered).</p><ul><li>Fixed price for the property size, 1 bathroom included</li><li>About 10 cleaner-hours: 2 cleaners, around 5 hours on site</li><li>Estimated cost about £179 including travel and products; contribution margin about 31%</li></ul>`,open:'Open Pricing setup'},
    rate:{q:'Are my prices high enough?',used:['Checked pricing','Ran the cost calculator'],a:`<p>Mostly. A 2-bed regular clean costs about <b>£63.56</b> (3 cleaner-hours at £16.52 plus £14 travel, products and overhead). At £100 that’s a <b>36%</b> contribution margin, above your 30% target.</p><ul><li>Studio at £60 is 22%: the suggested price for 30% is £67.20</li><li>End of tenancy studio at £110 is 12%: worth reviewing</li></ul><p>Existing bookings and accepted quotes keep their agreed prices.</p>`,open:'Open Pricing setup'}};
  const chat=$('#chat');let timer;
  function ask(k){const x=A[k];clearTimeout(timer);$$('.asks button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.a===k));
    chat.innerHTML=`<div class="bub">${x.q}</div><div class="ans"><div class="av" aria-hidden="true">✦</div><div class="b"><span class="typing" aria-label="Thinking"><i></i><i></i><i></i></span></div></div>`;
    timer=setTimeout(()=>{$('.ans .b',chat).innerHTML=`<div class="used">${x.used.map(u=>`<span>${u}</span>`).join('')}</div>${x.a}<span class="open">${x.open} →</span>`},reduce?0:700)}
  $$('.asks button').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.a)));

  /* cleaner tasks */
  const tk=$$('#tasks .task');function tn(){$('#task-n').textContent=`${tk.filter(t=>t.getAttribute('aria-pressed')==='true').length}/${tk.length}`}
  tk.forEach(t=>t.addEventListener('click',()=>{t.setAttribute('aria-pressed',t.getAttribute('aria-pressed')!=='true');tn()}));tn();

  /* apps tabs */
  const tabs=$$('.applist [role=tab]');
  function sel(t){tabs.forEach(b=>{const on=b===t;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;document.getElementById('pane-'+b.dataset.pane).hidden=!on})}
  tabs.forEach((b,i)=>{b.addEventListener('click',()=>sel(b));b.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();const n=tabs[(i+1)%tabs.length];sel(n);n.focus()}if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();const n=tabs[(i-1+tabs.length)%tabs.length];sel(n);n.focus()}})});
  sel(tabs[0]);

  /* floating icons follow the pointer a little */
  const comm=$('.comm');if(!reduce&&comm){comm.addEventListener('pointermove',e=>{const r=comm.getBoundingClientRect();const dx=(e.clientX-r.left)/r.width-.5,dy=(e.clientY-r.top)/r.height-.5;$$('.float',comm).forEach((f,i)=>{const k=(i%3+1)*8;f.style.translate=`${-dx*k}px ${-dy*k}px`})});comm.addEventListener('pointerleave',()=>$$('.float',comm).forEach(f=>f.style.translate=''))}

  /* estimator */
  const est=$('#est');const H={studio:2,'1':2.5,'2':3,'3':4,'4':4.5,'5':5};const BI={studio:1,'1':1,'2':1,'3':1,'4':2,'5':2};
  const RC={regular:{studio:6000,'1':7500,'2':10000,'3':13500,'4':16500,'5':19500},deep:{studio:14500,'1':17500,'2':22500,'3':29000,'4':36000,'5':48000},eot:{studio:11000,'1':14000,'2':18500,'3':26000,'4':32000,'5':38000}};
  const NM={regular:'Regular clean',deep:'Deep clean',eot:'End of tenancy'};const SZ={studio:'studio','1':'1-bed','2':'2-bed','3':'3-bed','4':'4-bed','5':'5-bed'};
  function calc(){const q=n=>{const c=est.querySelector(`input[name=${n}]:checked`);return c?c.value:null};
    const svc=q('svc'),size=q('size'),baths=+q('baths'),cond=q('cond'),area=q('area');const fx=svc==='regular';$('#freq-fs').disabled=!fx;
    const L=[];L.push([`${NM[svc]}, ${SZ[size]} (${BI[size]} bathroom${BI[size]>1?'s':''} included)`,RC[svc][size]]);
    const xb=Math.max(0,baths-BI[size]);if(xb)L.push([`Extra bathroom${xb>1?'s':''} × ${xb}`,xb*1200]);
    if(cond==='extra'){const b0=L.reduce((a,l)=>a+l[1],0);L.push(['Needs extra attention (+20%)',Math.round(b0*.2)])}
    const base=L.reduce((a,l)=>a+l[1],0);
    const xs=$$('input[name=x]:checked',est);xs.forEach(x=>L.push([x.dataset.n,+x.value]));
    if(area==='outer')L.push(['Travel adjustment (outer area)',1000]);
    const d=fx?+(q('freq')||0):0;const disc=Math.round(base*d/100);if(disc)L.push([`${{5:'Monthly',10:'Fortnightly',15:'Weekly'}[d]} discount (${d}% of the clean)`,-disc]);
    let tot=L.reduce((a,l)=>a+l[1],0);if(tot<5000){L.push(['Minimum charge adjustment',5000-tot]);tot=5000}
    const first=disc?tot+disc:0;
    const review=[];if(cond==='heavy')review.push('heavy or specialist cleans need a custom quote');if(area==='outside')review.push('your postcode is outside the usual area');if(xs.some(x=>x.dataset.review))review.push('carpet cleaning needs a quick review first');
    $('#est-lines').innerHTML=L.map(l=>`<div><span>${l[0]}</span><span class="num">${l[1]<0?'−':''}${gbp(Math.abs(l[1]))}</span></div>`).join('')+`<div class="muted"><span>VAT</span><span class="num">Not registered</span></div>`;
    const rv=review.length>0;$('#est-k').textContent=rv?'Guide price · quote requested':fx&&d?'Your price per visit':'Your fixed price';$('#est-p').textContent=gbp(tot);
    const lab=(svc==='regular'?Math.max(2,H[size]):svc==='deep'?H[size]*2:H[size]*2.5)+xb*.5;const crew=svc==='regular'?1:2;const onsite=Math.round(lab/crew*2)/2;
    $('#est-d').textContent=rv?`We’d review first because ${review.join(' and ')}. Nothing is booked or charged.`:`About ${onsite} hours on site · ${crew} cleaner${crew>1?'s':''}${first?` · first visit ${gbp(first)}, then ${gbp(tot)}`:''}`;
    $('#est-cta').textContent=rv?'Request a quote in the demo':'Book it in the demo'}
  if(est){est.addEventListener('change',calc);calc()}


  /* discovery demo */
  const DX={PE1:[20.75,30.83,'Peterborough'],PE2:[18.79,33.84,'Orton'],PE3:[17.58,29.72,'Bretton'],PE4:[19.47,26.93,'Werrington'],PE6:[25.69,20.48,'Crowland'],PE7:[28.39,33.84,'Whittlesey'],PE8:[5.54,42.18,'Oundle'],PE9:[4.73,23.15,'Stamford'],PE10:[11.63,10.24,'Bourne'],PE11:[26.84,8.12,'Spalding'],PE12:[38.26,6.23,'Holbeach'],PE13:[48,21.81,'Wisbech'],PE15:[43.13,34.39,'March']};

  const DXY={};Object.entries(DX).forEach(([k,v])=>DXY[k]={x:v[0],y:v[1]});
  function rng(seed){let a=seed>>>0;return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
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
      [th,th+Math.PI/2].forEach(fam=>{const ux=Math.cos(fam),uy=Math.sin(fam),nx=-uy,ny=ux;for(let off=-rad;off<=rad;off+=.26+R()*.14){const half=Math.sqrt(Math.max(0,rad*rad-off*off))*(.55+R()*.45);if(half<.25)continue;const s=(R()-.5)*half*.4;const cx=p.x+nx*off+ux*s,cy=p.y+ny*off+uy*s;o+=`<path class="mb-street" d="M${f(cx-ux*half)} ${f(cy-uy*half)} L${f(cx+ux*half)} ${f(cy+uy*half)}"/>`}})});
    o+=`<path class="mb-rail" d="M${DXY.PE9.x} ${DXY.PE9.y} Q 12 27, ${DXY.PE1.x} ${DXY.PE1.y} Q 25 33, ${DXY.PE7.x} ${DXY.PE7.y} L ${DXY.PE15.x} ${DXY.PE15.y}"/><path class="mb-rail" d="M${DXY.PE1.x} ${DXY.PE1.y} Q 23 18, ${DXY.PE11.x} ${DXY.PE11.y}"/>`;
    o+=`<path class="mb-trunk-c" d="M9 70 Q 7 30, 5 -20"/><path class="mb-trunk" d="M9 70 Q 7 30, 5 -20"/>`;
    const rd=MAJOR_ROADS.map(([a,b])=>{const A=DXY[a],B=DXY[b];const mx=(A.x+B.x)/2+(R()-.5)*3,my=(A.y+B.y)/2+(R()-.5)*3;return `M${A.x} ${A.y} Q${f(mx)} ${f(my)} ${B.x} ${B.y}`});
    o+=rd.map(d=>`<path class="mb-major-c" d="${d}"/>`).join('')+rd.map(d=>`<path class="mb-major" d="${d}"/>`).join('');
    MAPBASE={g:o,shields:MAJOR_ROADS.map(([a,b,n],i)=>{if(!n)return null;const A=DXY[a],B=DXY[b];return {x:(A.x+B.x)/2,y:(A.y+B.y)/2,n}}).filter(Boolean).concat([{x:6.6,y:12,n:'A1'}])};return MAPBASE}
  
  function baseSvg(vb,px,ph,extra,top){const B=mapBase();const s=Math.min(vb[2]/px,vb[3]/ph);const T=n=>(n*s).toFixed(3);
    const towns=Object.entries(DX).map(([k,p])=>`<text class="mb-town${k==='PE1'?' big':''}" x="${p[0]}" y="${p[1]}" style="font-size:${T(k==='PE1'?15:12)}px;stroke-width:${T(3)}px" text-anchor="middle">${p[2]}</text>`).join('');
    const sh=B.shields.map(r=>`<g class="mb-shield"><rect x="${(r.x-r.n.length*3.2*s-3*s).toFixed(2)}" y="${(r.y-7*s).toFixed(2)}" width="${(r.n.length*6.4*s+6*s).toFixed(2)}" height="${(14*s).toFixed(2)}" rx="${T(3)}"/><text x="${r.x}" y="${(r.y+4*s).toFixed(2)}" style="font-size:${T(10)}px" text-anchor="middle">${r.n}</text></g>`).join('');
    return {s,html:B.g+(extra||'')+sh+towns+(top||'')}}
  function pinSvg(x,y,n,s,sel){const r=12*s,h=31*s,cy=y-h+r;return `<g class="pn${sel?' sel':''}"><path d="M${x} ${y} L${(x-r*.62).toFixed(2)} ${(cy+r*.72).toFixed(2)} A${r.toFixed(3)} ${r.toFixed(3)} 0 1 1 ${(x+r*.62).toFixed(2)} ${(cy+r*.72).toFixed(2)} Z"/><text x="${x}" y="${(cy+4.5*s).toFixed(2)}" style="font-size:${(12*s).toFixed(3)}px" text-anchor="middle">${n}</text></g>`}
  const near=(x,y)=>Object.entries(DX).sort((a,b)=>Math.hypot(a[1][0]-x,a[1][1]-y)-Math.hypot(b[1][0]-x,b[1][1]-y))[0][0];
  const DL=[
    {p:'Fenland Fresh Cleaning',c:'cleaning',m:'mobile',base:'PE6',pub:true,cov:['PE1','PE2','PE3','PE4','PE6','PE7','PE11','PE12','PE8','PE9','PE10'],r:4.6,n:38,price:'From £60 per visit',b:'Bookable'},
    {p:'Spotless Spalding',c:'cleaning',m:'mobile',base:'PE11',pub:false,cov:['PE11','PE12','PE6','PE10'],r:4.8,n:21,price:'From £70 per visit',b:'Choose a time'},
    {p:'Peterborough Clean Co',c:'cleaning',m:'mobile',base:'PE1',pub:true,rad:9,ex:['PE7'],r:4.4,n:56,price:'From £65 per visit',b:'Choose a time'},
    {p:'Fixwell Repairs',c:'repairs',m:'mobile',base:'PE2',pub:true,cov:['PE1','PE2','PE3','PE4','PE6','PE7'],r:4.7,n:33,price:'£45 an hour',b:'Bookable'},
    {p:'Stamford Repair Workshop',c:'repairs',m:'venue',base:'PE9',pub:true,rad:40,r:4.5,n:12,price:'£20 assessment, then a quote',b:'Quote needed'},
    {p:'Nene Tutors',c:'tutoring',m:'venue',base:'PE1',pub:true,rad:35,r:4.9,n:40,price:'£35 an hour',b:'Choose a time'},
    {p:'Nene Tutors',c:'tutoring',m:'online',r:4.9,n:40,price:'£32 an hour online',b:'Choose a time'},
    {p:'BrightMind Online',c:'tutoring',m:'online',r:4.6,n:90,price:'£30 an hour online',b:'Choose a time'}];
  const BANDS=[[0,2,'Under 2 km'],[2,5,'2–5 km'],[5,10,'5–10 km'],[10,20,'10–20 km'],[20,999,'Over 20 km']];
  const dd=$('#dd');function town(){let t='';Object.entries(DX).forEach(([k,[x,y,n]])=>t+=`<g class="tw"><circle cx="${x}" cy="${y}" r=".35"/><text x="${x+.7}" y="${y+.35}">${n}</text></g>`);return t}
  function ddRun(){const c=dd.querySelector('input[name=dc]:checked').value,d=dd.querySelector('input[name=dl]:checked').value;const [lx,ly]=DX[d];const loc={x:lx+.4,y:ly-.3};
    const rows=[];const online=[];DL.filter(l=>l.c===c).forEach(l=>{if(l.m==='online'){online.push(l);return}const b=DX[l.base];const dist=Math.hypot(b[0]-loc.x,b[1]-loc.y);
      const ok=l.cov?l.cov.includes(near(loc.x,loc.y)):dist<=l.rad&&!(l.ex||[]).includes(near(loc.x,loc.y));if(!ok)return;rows.push({...l,dist,band:BANDS.findIndex(q=>dist>=q[0]&&dist<q[1])})});
    rows.sort((a,b)=>a.band-b.band||(a.pub&&b.pub?a.dist-b.dist:0)||b.r-a.r);
    const box=$('#dd-svg').getBoundingClientRect();const px=box.width||560,ph=box.height||440;const wide=innerWidth>860;
    const pts=[loc,...rows.filter(r=>r.pub).map(r=>({x:DX[r.base][0],y:DX[r.base][1]}))];const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);
    let w=Math.max(16,(Math.max(...xs)-Math.min(...xs))*(wide?2.4:1.4)+8),h=w*ph/px;if((Math.max(...ys)-Math.min(...ys))*1.4+6>h){h=(Math.max(...ys)-Math.min(...ys))*1.4+6;w=h*px/ph}
    const cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;const vb=[cx-w*(wide?.74:.5),cy-h/2,w,h];
    const s=Math.min(vb[2]/px,vb[3]/ph);let pins='';rows.forEach((r,i)=>{if(!r.pub)return;const b=DX[r.base];pins+=pinSvg(b[0],b[1],i+1,s,i===0)});
    const me=`<g class="me"><circle cx="${loc.x}" cy="${loc.y}" r="${(20*s).toFixed(2)}"/><circle cx="${loc.x}" cy="${loc.y}" r="${(6.5*s).toFixed(2)}" class="d" style="stroke-width:${(3*s).toFixed(2)}px"/></g>`;
    $('#dd-svg').setAttribute('viewBox',vb.map(v=>v.toFixed(2)).join(' '));$('#dd-svg').innerHTML=baseSvg(vb,px,ph,'',me+pins).html;
    const card=(r,i)=>`<div class="dd-card"><div class="row-b"><b>${i===null?'◎':i+1} · ${r.p}</b><span class="badge ${r.b==='Bookable'?'ok':r.b==='Quote needed'?'warn':'info'}">${r.b}</span></div><span class="muted">${r.m==='online'?'Online':r.m==='venue'?'At their venue · '+r.dist.toFixed(1)+' km':r.pub?'Comes to you · '+r.dist.toFixed(1)+' km from their base':'Comes to you · '+BANDS[r.band][2]+' (base private, no pin)'} · ★ ${r.r} (${r.n})</span><span>${r.price}</span></div>`;
    $('#dd-list').innerHTML=`<div class="eyebrow">${rows.length?`${rows.length} nearby, nearest first`:'Nobody nearby covers '+DX[d][2]+' yet'}</div>${rows.map((r,i)=>card(r,i)).join('')}${!rows.length?`<div class="dd-card none"><b>No coverage here yet</b><span class="muted">You can request the service. No business is contacted; it’s recorded as demand for ${DX[d][2]}, which providers see as an anonymous total.</span></div>`:''}${online.length?`<div class="eyebrow" style="margin-top:6px">Online · not ranked by distance</div>${online.map(r=>card(r,null)).join('')}`:''}`}
  dd.addEventListener('change',ddRun);ddRun();

  /* demand demo */
  const DEM={req:{'4,6':3,'3,6':2,'3,5':2,'5,1':2,'9,4':2,'8,6':1,'0,4':1,'2,2':1,'5,4':1},unmet:{'9,4':3,'8,6':2,'8,4':1,'2,2':1},supply:{}};
  const SUP={'4,6':'b','3,6':'b','3,5':'b','4,5':'b','5,4':'b','5,3':'b','5,1':'b','7,1':'q','5,6':'b','2,2':'p','0,4':'q','1,8':'p','8,6':'n','9,4':'n','8,4':'n','9,6':'n'};
  const SUPP=['7,0','1,1','10,7'];
  function demRun(){const ly=document.querySelector('input[name=dly]:checked').value;let g='';
    for(let x=0;x<11;x++)for(let y=0;y<10;y++){const k=x+','+y;let cls='';let op='';
      if(ly==='supply'){const v=SUP[k];if(v)cls='s'+v}else{const v=DEM[ly][k];if(v){cls='d';op=`style="fill-opacity:${(.18+v*.24).toFixed(2)}"`}else if(SUPP.includes(k))cls='h'}
      g+=`<rect class="c ${cls}" x="${x*5}" y="${y*5}" width="5" height="5" ${op}/>`}
    const db=$('#dem-svg').getBoundingClientRect();const vb=[-1,-1,53,48];$('#dem-svg').setAttribute('viewBox',vb.join(' '));$('#dem-svg').innerHTML=baseSvg(vb,db.width||560,db.height||500,g).html;
    $('#dem-cap').textContent={req:'Submitted requests per 5 km cell, last 30 days. Hatched cells have too few customers to show.',unmet:'Requests nobody could take: no coverage, no provider or no capacity. Open and cancelled requests aren’t counted.',supply:'Green: bookable supply. Amber: quote-only. Grey: no platform coverage. Dashed: partial coverage.'}[ly]}
  $$('input[name=dly]').forEach(i=>i.addEventListener('change',demRun));demRun();
  /* nav highlight */
  const links=$$('.nav nav a');const secs=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}})},{rootMargin:'-45% 0px -50% 0px'});secs.forEach(s=>io.observe(s))}

  /* cookie */
  const ck=$('#cookie');let seen=false;try{seen=localStorage.getItem('relio-cookie')==='1'}catch(e){}
  if(!seen)ck.hidden=false;
  $('#cookie-ok').addEventListener('click',()=>{ck.hidden=true;try{localStorage.setItem('relio-cookie','1')}catch(e){}});
})();


/* business plans: billing toggle + comparison table */
(function(){
  const Y='y',N='n';
  const IC={
    book:'<path d="M4 6h16M4 12h16M4 18h10"/>',
    team:'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2c3 .3 5.5 2.6 5.5 5.8"/>',
    cam:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    money:'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/>',
    grow:'<path d="M4 18l6-6 4 4 6-8"/><path d="M15 8h5v5"/>',
    shield:'<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/>'};
  const G=[
    ['book','Bookings and marketplace',[
      ['Marketplace profile and portfolio','Appear in search and on the map, with your services, prices, ratings and photos of past work.',Y,Y,Y,Y],
      ['Online booking page','Customers book instantly or ask for a quote from your own link, at any hour.',Y,Y,Y,Y],
      ['Services listed','How many services you can publish, each with its own add-ons.','3','Unlimited','Unlimited','Unlimited'],
      ['Task checklists customers can tailor','Every service lists its tasks by room. Customers untick or add tasks up to the limit you set.',Y,Y,Y,Y],
      ['Customer before photos and photo choice','Customers show how the place looks before the visit and choose whether photos are allowed.',Y,Y,Y,Y],
      ['Pricing models','Fixed price by size, per room, hourly, or quote. Customers see every line before they pay.','Fixed price','All models','All models','All models'],
      ['Recurring plans and quotes','Weekly, fortnightly and monthly plans, quotes customers accept online, and price-change approvals.',N,Y,Y,Y],
      ['Marketplace booking fee','Charged only on bookings the marketplace brings you. Your own customers are always fee-free.','6%','4%','2.5%','Custom']]],
    ['team','Team and Pro app',[
      ['Pros included','People who can sign in to the Pro app and be given jobs. Extra pros can be added on paid plans.','1','5','15','Unlimited'],
      ['Pro app with onboarding','Pros sign in with their email, finish onboarding on their phone and see only their own work.',Y,Y,Y,Y],
      ['Rota, cover and swaps','Publish a week with the notice promised, fill gaps with cover requests and approve swaps.',N,Y,Y,Y],
      ['Pro verification','Check ID, right to work, DBS and bank details before a pro can take jobs.',N,Y,Y,Y],
      ['Document expiry tracking','Pros renew expiring documents in the app. After 5 days without a renewal they stop getting new jobs.',N,Y,Y,Y],
      ['Training and refreshers','Assign courses, share materials and see who needs a refresher before it lapses.',N,N,Y,Y],
      ['Pro earnings and withdrawals','Pros see what they’ve earned, their next pay day, and move their balance to their bank.',N,N,Y,Y]]],
    ['cam','Quality and evidence',[
      ['Before and after photos by task','Pros attach photos to each task. Customers and supervisors see them side by side.',Y,Y,Y,Y],
      ['Check-in by QR code or location','Arrival is recorded once at the door. Location is never tracked continuously.',Y,Y,Y,Y],
      ['Quality review queue','Accept a visit, ask for a correction or record a partial service before the customer is told.',N,Y,Y,Y],
      ['Concerns, re-cleans and refunds','Customers raise a concern on a task. You offer a re-clean or refund from one place.',Y,Y,Y,Y],
      ['Dispute support','If a concern can’t be settled, the platform reviews the booking evidence and decides.','Standard','Standard','Standard','Priority']]],
    ['money','Money',[
      ['Card payments and payouts','Customers pay by card when they book. Processing is passed on at cost.',Y,Y,Y,Y],
      ['Invoices for contract clients','Monthly invoices for business clients, with purchase order numbers and payment tracking.',N,Y,Y,Y],
      ['Finance and margin','See takings, costs and margin by client and service.',N,Y,Y,Y],
      ['Payroll from approved hours','Pay comes from approved visit time and travel, exported to your payroll provider.',N,N,Y,Y],
      ['Payroll reports','Weekly, monthly and yearly reports with tax, NI and employer costs.',N,N,Y,Y]]],
    ['grow','Growth',[
      ['Discounts and offer codes','Welcome offers, quiet-day discounts and codes, with redemptions and cost tracked.','1 active','Unlimited','Unlimited','Unlimited'],
      ['Email and text campaigns','Win back past customers or fill gaps in the rota. Built-in sending, no account needed.',N,'1,000 emails a month','5,000 emails a month','Custom'],
      ['Campaign platform integrations','Connect Mailchimp, Brevo, Klaviyo, Google Ads, Meta Ads and Google Business Profile.',N,N,Y,Y],
      ['Google review requests','Ask happy customers for a review the day after a 4 or 5 star visit.',N,Y,Y,Y],
      ['Demand map','See where customers ask for your services, and where nobody could take the booking.','Your area','Full map','Full map','Full map']]],
    ['shield','Insights, security and support',[
      ['Analytics','Bookings, repeat rate, ratings and team performance over time.','Basic',Y,Y,Y],
      ['AI business assistant','Ask questions like “Who can cover Saturday?” or “Which clients are least profitable?”',N,'50 questions a month','Unlimited','Unlimited'],
      ['Staff roles and permissions','Control who can see pay, customer details and access codes.','Owner only','3 roles','All roles','Custom roles and single sign-on'],
      ['Activity log','Every booking change, payment and approval recorded with who did it.','30 days','1 year','3 years','Custom'],
      ['Support','How to reach us when you need help.','Help centre','Email','Priority chat','Dedicated manager']]]];
  const P=[['Starter','Get started','light'],['Growth','Start trial','light'],['Team','Start trial','dark'],['Enterprise','Talk to sales','light']];
  const tick='<svg class="ck" viewBox="0 0 20 20" width="18" height="18" role="img" aria-label="Included"><circle cx="10" cy="10" r="9"/><path d="M6 10.3l2.6 2.6L14 7.5"/></svg>';
  const dash='<span class="ppno" aria-label="Not included">–</span>';
  const cell=v=>v===Y?tick:v===N?dash:`<span class="tv">${v}</span>`;
  const t=document.getElementById('ppc');if(!t)return;let tid=0;
  t.innerHTML=`<thead><tr><th scope="col" class="c0"><span class="sr-only">Feature</span></th>${P.map((p,i)=>`<th scope="col" class="${i===2?'hl':''}"><span class="pppn">${p[0]}</span><a class="btn sm ${p[2]}" href="${i===3?'#top':'platform-prototype.html'}" ${i===3?'':'target="_blank" rel="noopener"'}>${p[1]}</a></th>`).join('')}</tr></thead>`+
    G.map(([ic,name,rows])=>`<tbody><tr class="grp"><th scope="rowgroup" colspan="5"><span class="gi"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[ic]}</svg>${name}</span></th></tr>${rows.map(r=>{const id='tip-'+(tid++);return `<tr><th scope="row" class="c0"><button type="button" class="ppfeat" aria-describedby="${id}">${r[0]}</button><span class="pptip" role="tooltip" id="${id}">${r[1]}</span></th>${r.slice(2).map((v,i)=>`<td class="${i===2?'hl':''}">${cell(v)}</td>`).join('')}</tr>`}).join('')}</tbody>`).join('');
  t.addEventListener('click',e=>{const b=e.target.closest('.ppfeat');t.querySelectorAll('.ppfeat.open').forEach(x=>{if(x!==b)x.classList.remove('open')});if(b)b.classList.toggle('open')});
  const bm=document.getElementById('bill-m'),by=document.getElementById('bill-y');
  function bill(y){bm.setAttribute('aria-pressed',String(!y));by.setAttribute('aria-pressed',String(y));document.querySelectorAll('.plan-price b[data-m]').forEach(b=>{b.textContent='£'+(y?b.dataset.y:b.dataset.m)});document.querySelectorAll('.plan .yr').forEach(s=>s.hidden=!y)}
  bm.addEventListener('click',()=>bill(false));by.addEventListener('click',()=>bill(true));
})();
