/* pick a standard service (Fenland) */
function lsPickModal(m){const M=S.mkt;const P=M.prov.ff;const cats=P.cats;const q=(m.q||'').toLowerCase();const have=new Set(M.listings.filter(l=>l.prov==='ff').map(l=>(l.type||'').toLowerCase()).concat(M.listings.filter(l=>l.prov==='ff'&&l.svc).map(l=>({regular:'regular clean',deep:'deep clean',eot:'end of tenancy',office:'office and commercial'})[l.svc]||'')));
  const opts=cats.flatMap(c=>Object.entries(PM_PRESETS[c]||{}).map(([t,p])=>({c,t,p}))).filter(o=>!q||o.t.toLowerCase().includes(q)||PM_MODELS[o.p.pm.model].name.toLowerCase().includes(q));
  const others=Object.keys(PM_PRESETS).filter(c=>!cats.includes(c));
  return {title:'Add a service',sub:'Choose the services you offer. Recommended pricing comes from the Service Delivery and Pricing Guide (UK, 2026); you set your own price next.',wide:true,
    body:`<input type="search" id="lsp-q" data-lspq="1" value="${esc(m.q||'')}" placeholder="Search services, e.g. oven, carpet, jet washing" aria-label="Search services">
    <div class="lsp-list">${opts.map(o=>{const own=have.has(o.t.toLowerCase());const pm={...o.p.pm,mods:{...PM_MODS0,...(o.p.pm.mods||{})}};const on=!!(m.sel||{})[o.t];
      return `<label class="lsp-opt ${own?'own':''} ${on?'on':''}"><input type="checkbox" data-lsp="${esc(o.t)}" ${on?'checked':''} ${own?'disabled':''}><span class="lsp-m"><b>${esc(o.t)}</b>${own?' '+pill('Already offered','good'):''}<span class="small">${PM_MODELS[pm.model].name} · suggested ${esc(pmLabel(pm))}</span><span class="small muted">Typical UK/London: ${esc(o.p.range)}</span></span></label>`}).join('')||'<div class="empty">No standard service matches. Try another word.</div>'}</div>
    ${others.length?`<p class="small muted">Other categories (${others.map(c=>esc((M.cats[c]||{name:c}).name)).join(', ')}) need approval first. <button class="linkbtn" data-act="lsCatReq">Request another category</button></p>`:''}
    <div id="lsp-err" class="ferr"></div>`,
    foot:`<button class="btn primary" data-act="lsPickGo">Add ${Object.values(m.sel||{}).filter(Boolean).length||''} service${Object.values(m.sel||{}).filter(Boolean).length===1?'':'s'}</button>`}}
const LSP_ACT={
  lsPick:()=>{S.modal={type:'lsPick',sel:{},q:''}},
  lsPickGo2:()=>{S.modal={type:'lsPick',sel:{},q:'',back:'pricing'}},
  lsPickGo:()=>{const m=S.modal;const ts=Object.keys(m.sel||{}).filter(t=>m.sel[t]);if(!ts.length){setErr('lsp-err','Choose at least one service.');return false}const M=S.mkt;const added=[];
    ts.forEach(t=>{const c=M.prov.ff.cats.find(cc=>(PM_PRESETS[cc]||{})[t]);const pm=pmPreset(c,t);const id='L-ff-'+t.toLowerCase().replace(/[^a-z]+/g,'-')+'-'+Date.now().toString(36).slice(-3);
      M.listings.push({id,prov:'ff',cat:c,type:t,name:t==='Oven and appliance'?'Oven and appliance cleaning':t==='Carpet and upholstery'?'Carpet and upholstery cleaning':t,mode:'mobile',booking:pmBooking(pm),status:'draft',cov:{type:'ff'},pm,price:pmLabel(pm),from:pmFrom(pm),pt:pm.model,priceSet:false,avail:'slots'});added.push(id)});
    audit('Added services',ts.join(', '),'Drafts, prices to set');S.modal=null;S.prFocus=added[0];
    if(m.back==='pricing'){toast(`${ts.length} service${ts.length>1?'s':''} added. Set the price below.`)}else{S.prDraft=JSON.parse(JSON.stringify(S.pricing));S.biz.view='pricing';phInit();S.ph.tab='setup';toast(`${ts.length} service${ts.length>1?'s':''} added. Set the price in Pricing.`)}
    setTimeout(()=>{const e=document.getElementById('pr-other');if(e)e.scrollIntoView({behavior:'smooth',block:'start'})},60)}
};
