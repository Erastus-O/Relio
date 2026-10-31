/* PORTFOLIO (business uploads, customer profile gallery) */
function pfSrc(x){return x&&x.startsWith('pf:')?PF_IMG[x.slice(3)]:x}
function pfInit(){mktInit();if(S.mkt.portfolio)return S.mkt.portfolio;
  S.mkt.portfolio={ff:[
    {id:'PF-1',title:'Child’s bedroom reset',svc:'L-ff-deep',area:'Crowland',date:'2026-09-18',before:'pf:bedBefore',after:'pf:bedAfter',caption:'Toys sorted, bed made, floors vacuumed and surfaces wiped. About 2 hours.',status:'published'},
    {id:'PF-2',title:'Main bedroom, regular clean',svc:'L-ff-reg',area:'Market Deeping',date:'2026-09-30',before:'',after:'pf:master',caption:'Weekly clean: linen changed, floors vacuumed, dusting throughout.',status:'published'},
    {id:'PF-3',title:'Guest room before handover',svc:'L-ff-eot',area:'Spalding',date:'2026-08-27',before:'',after:'pf:guest',caption:'End of tenancy clean ready for the landlord’s inventory check.',status:'published'}]};
  return S.mkt.portfolio}
function pfItems(prov,all){const P=pfInit();return (P[prov]||[]).filter(x=>all||x.status==='published').sort((a,b)=>b.date.localeCompare(a.date))}
function pfSvcName(it){const l=S.mkt.listings.find(x=>x.id===it.svc);return l?l.name:(it.svcName||'')}
function pfTile(it,act){return `<button class="pf-tile" data-act="${act}" data-v="${it.id}" aria-label="Open ${esc(it.title)}">
  <span class="pf-img ${it.before?'pair':''}">${it.before?`<span><img src="${pfSrc(it.before)}" alt="" loading="lazy"><i>Before</i></span>`:''}<span><img src="${pfSrc(it.after)}" alt="" loading="lazy">${it.before?'<i>After</i>':''}</span></span>
  <span class="pf-cap"><b>${esc(it.title)}</b><span class="small muted">${esc(pfSvcName(it))}${it.area?' · '+esc(it.area):''} · ${fmtD(it.date)} ${it.date.slice(0,4)}</span></span></button>`}
function pfGallery(prov,name){const its=pfItems(prov);
  return `<section class="card stack"><div class="set-row"><h2>Work by ${esc(name)}</h2><span class="small muted">${its.length} project${its.length===1?'':'s'}</span></div>
  ${its.length?`<div class="pf-grid">${its.map(it=>pfTile(it,'pfView')).join('')}</div><p class="small muted">Photos are uploaded by the business. Customers’ faces, names and house numbers are never shown.</p>`:'<div class="empty">No portfolio photos yet.</div>'}</section>`}
let PF_TMP={};
function pfShrink(file,cb){if(!file||!/^image\//.test(file.type)){cb(null,'Choose a JPG or PNG image.');return}if(file.size>15*1024*1024){cb(null,'That image is over 15 MB.');return}
  const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,900/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',0.75))};im.onerror=()=>cb(null,'We couldn’t read that image.');im.src=r.result};r.readAsDataURL(file)}
const PF_ACT={
  pfView:e=>{S.modal={type:'pfView',id:e.v}}
};
const PF_MODALS={
  pfView:m=>{let it=null,prov=null;Object.entries(pfInit()).forEach(([k,a])=>{const f=a.find(x=>x.id===m.id);if(f){it=f;prov=k}});const P=S.mkt.prov[prov];
    return {title:esc(it.title),sub:`${esc(P.name)} · ${esc(pfSvcName(it))}${it.area?' · '+esc(it.area):''} · ${fmtD(it.date)} ${it.date.slice(0,4)}`,wide:true,
      body:`<div class="pf-big ${it.before?'pair':''}">${it.before?`<figure><img src="${pfSrc(it.before)}" alt="Before: ${esc(it.title)}"><figcaption>Before</figcaption></figure>`:''}<figure><img src="${pfSrc(it.after)}" alt="${it.before?'After: ':''}${esc(it.title)}">${it.before?'<figcaption>After</figcaption>':''}</figure></div>${it.caption?`<p>${esc(it.caption)}</p>`:''}`,closeLabel:'Close'}}
};
