/* SETTINGS (tabbed) */
const SET_IC={
  personal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.6-5.5 6.5-5.5s5.5 2 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c1.8.7 3 2.5 3.5 5.2"/></svg>',
  pricing:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
  prefs:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h0"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4.5 4.5L19 7"/></svg>',
  eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>'
};
function setInit(){
  if(!S.set)S.set={tab:'personal',sub:{personal:'profile',users:'staff',pricing:'pricing',prefs:'notif'}};
  if(!S.me)S.me={phone:'07700 900455',phoneAt:'23 Oct 2026',mfaAt:'12 Sep 2026, 09:12',pwAt:'12 Sep 2026, 09:10',
    sessions:[{id:'d1',dev:'Chrome on Mac',where:'Crowland, UK',last:'Active now',cur:true},{id:'d2',dev:'Safari on iPhone',where:'Peterborough, UK',last:'Wed 14 Oct, 19:02'},{id:'d3',dev:'Edge on Windows',where:'Peterborough, UK',last:'Mon 5 Oct, 08:40'}]};
  if(!S.prefs)S.prefs={theme:'system',start:'overview',digest:'07:00',notif:{work:{email:true,sms:false},quality:{email:true,sms:false},disputes:{email:true,sms:true},finance:{email:true,sms:false},people:{email:false,sms:false}}};
  const seed={'Dami Cole':['owner','active','1 Sep 2025','dami.cole@fenlandfresh.example'],'Tomasz Nowak':['supervisor','active','3 Nov 2025','tomasz.nowak@fenlandfresh.example'],'Femi Bello':['dispatcher','active','12 Jan 2026','femi.bello@fenlandfresh.example'],'Rachel Moore':['hiring','mfa','2 Oct 2026','rachel.moore@fenlandfresh.example']};
  (S.members||[]).forEach((m,i)=>{if(m.role)return;const sd=seed[m.name]||['viewer','active',fmtD(today()),''];m.id=m.id||'m'+i;m.role=sd[0];m.status=sd[1];m.since=sd[2];m.email=m.email||sd[3]});
}
function applyTheme(){const t=S.prefs&&S.prefs.theme;const r=document.documentElement;if(t==='light'||t==='dark')r.setAttribute('data-theme',t);else r.removeAttribute('data-theme')}
function tgl(attrs,on,label){return `<label class="tgl"><input type="checkbox" role="switch" ${attrs} ${on?'checked':''} aria-label="${esc(label)}"><span aria-hidden="true"></span></label>`}
function pwLive(v){const box=document.getElementById('pw-checks');if(!box)return;const ok={len:v.length>=8,let:/[a-z]/i.test(v),num:/\d/.test(v)};box.querySelectorAll('[data-c]').forEach(s=>s.classList.toggle('ok',ok[s.dataset.c]))}
const SET_MODALS={
  
};
const SET_ACT={
  
};
