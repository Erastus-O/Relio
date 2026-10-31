/* services (new business) */
const OB_ACT={
  auSubmit:(e)=>{if(S.surface==='business'&&AU.business.mode==='signup')return obSubmit();if(S.surface==='cleaner')return proAuthSubmit();return AU_ACT.auSubmit(e)},
  auBack:()=>{const s=S.surface;const A=AU[s];A.err='';A.info='';A.f.otp='';if(A.step>1)A.step--;},
  obGo:e=>{AU.business.step=+e.v;AU.business.err=''},
  obAddSvc:()=>{const A=AU.business;A.svcs.push(obNewSvc(A.f))},
  obDelSvc:e=>{const A=AU.business;A.svcs.splice(+e.v,1);A.adds.forEach(a=>{if(a.to!=='all'&&+a.to===+e.v)a.to='all';else if(a.to!=='all'&&+a.to>+e.v)a.to=String(+a.to-1)})},
  obAddAdd:e=>{AU.business.adds.push({name:e.name||'',price:e.price||'',to:'all'})},
  obDelAdd:e=>{AU.business.adds.splice(+e.v,1)},
  obSample:()=>{const A=AU.business;const f=A.f;Object.assign(f,{biz:'Bright Homes Cleaning',struct:'ltd',co:'15550123',about:'Friendly, insured home cleaning team covering Peterborough and the villages. Eco products included.',cat:'cleaning',team:'2–5 people',phone:'01733 555 777',addr:'12 Station Road',pc:'PE2 5AB',m_mobile:true,radius:'15',d1:true,d2:true,d3:true,d4:true,d5:true,d6:true,from:'8',to:'18'});
    if(!f.name)f.name='Kemi Adeyemi';if(!f.email)f.email='kemi@brighthomes.example';if(!f.pw)f.pw='Bright2026home';
    A.svcs=[{name:'Regular home clean',cat:'cleaning',type:'Regular clean',mode:'mobile',pm:pmPreset('cleaning','Regular clean'),desc:'Kitchen, bathrooms, dusting, vacuuming and mopping. Products included.'},{name:'Deep clean',cat:'cleaning',type:'Deep clean',mode:'mobile',pm:pmPreset('cleaning','Deep clean'),desc:'Top-to-bottom clean including skirting, cupboards and limescale.'},{name:'End of tenancy clean',cat:'cleaning',type:'End of tenancy',mode:'mobile',pm:pmPreset('cleaning','End of tenancy'),desc:'To inventory standard, oven included.'},{name:'Carpet and sofa cleaning',cat:'cleaning',type:'Carpet and upholstery',mode:'mobile',pm:pmPreset('cleaning','Carpet and upholstery'),desc:''}];
    A.adds=[{name:'Inside the oven',price:'35',to:'all'},{name:'Inside the fridge',price:'15',to:'all'},{name:'Interior windows',price:'20',to:'1'}];A.err='';if(A.step<2)A.step=2}
};
const OB_MODALS={
  
};
