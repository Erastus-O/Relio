/* rendering */
const app=document.getElementById('app');
function render(){try{tphSeed()}catch(_){}
  S.surface=APP_SURFACE;
  NOTICE_DAYS=(S.settings&&S.settings.noticeDays)||7;syncPricing();authInit();setInit();applyTheme();if(S.mkt)pmMigrate();
  app.innerHTML=`${renderBar()}<main id="main">${!S.auth.business?renderAuth('business'):(mktInit(),bizTenant()!=='ff'?renderNewBiz(bizTenant()):renderBiz())}</main>${S.modal?renderModal():''}`;
  if(S.agentOpen)agScroll();
  if(S.modal&&S.modal.type==='mktBook')pmLive();
  save();
}
function renderBar(){
  return `<header class="bar"><div class="bar-in">
    <div class="brand"><div class="brand-mark" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 20h16"/><path d="M7 20V9l5-5 5 5v11"/><path d="M10 14l1.5 1.5L15 12"/></svg></div>
      <div><b>Relio</b><span>${S.auth&&S.auth.business&&bizTenant()!=='ff'?esc(S.mkt.prov[bizTenant()].name):'Fenland Fresh Cleaning · Crowland'}</span></div></div>
    <div class="bar-meta">${DataStore.demo?'<button class="btn sm ghost" data-act="reset">Reset demo data</button>':''}</div>
  </div></header>`;
}
