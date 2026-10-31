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
const SET_TABS=[['personal','Personal settings'],['users','Users and roles'],['pricing','Pricing and policies'],['prefs','Preferences']];
const ROLES={
  owner:{name:'Main admin',desc:'The sole owner of this account. Full access, including pricing, policies and roles.'},
  ops:{name:'Operations manager',desc:'Runs the day: rota, bookings, quality and disputes. No access to pay or pricing.'},
  supervisor:{name:'Supervisor',desc:'Reviews evidence and signs off visits. Also works shifts in the cleaner app.'},
  dispatcher:{name:'Dispatcher',desc:'Fills shifts and handles cover. Sees bookings and the rota only.'},
  finance:{name:'Finance',desc:'Invoices, payments, refunds and payroll exports.'},
  hiring:{name:'Hiring manager',desc:'Employee records, right to work, DBS and training.'},
  viewer:{name:'Read only',desc:'Can view reports and analytics. Can’t change anything.'}
};
const PERMS=[
  ['Rota and bookings',{owner:'f',ops:'f',supervisor:'v',dispatcher:'f',finance:'v',hiring:'',viewer:'v'}],
  ['Quality reviews and disputes',{owner:'f',ops:'f',supervisor:'f',dispatcher:'v',finance:'v',hiring:'',viewer:'v'}],
  ['Invoices, payments and refunds',{owner:'f',ops:'v',supervisor:'',dispatcher:'',finance:'f',hiring:'',viewer:'v'}],
  ['Payroll',{owner:'f',ops:'',supervisor:'',dispatcher:'',finance:'f',hiring:'',viewer:''}],
  ['Employee records and pay details',{owner:'f',ops:'v',supervisor:'',dispatcher:'',finance:'v',hiring:'f',viewer:''}],
  ['Client records',{owner:'f',ops:'f',supervisor:'v',dispatcher:'v',finance:'f',hiring:'',viewer:'v'}],
  ['Training and development',{owner:'f',ops:'f',supervisor:'v',dispatcher:'',finance:'',hiring:'f',viewer:'v'}],
  ['Analytics',{owner:'f',ops:'f',supervisor:'',dispatcher:'',finance:'f',hiring:'',viewer:'v'}],
  ['Pricing and policies',{owner:'f',ops:'v',supervisor:'',dispatcher:'',finance:'v',hiring:'',viewer:''}],
  ['Users and roles',{owner:'f',ops:'',supervisor:'',dispatcher:'',finance:'',hiring:'',viewer:''}]
];
const NOTIF_TOPICS=[
  ['work','Bookings and rota','New bookings, unfilled shifts, swap and cover requests'],
  ['quality','Evidence to review','Submitted visits and evidence exceptions'],
  ['disputes','Disputes','New concerns and responses due'],
  ['finance','Money','Failed payments, overdue invoices and payroll ready to export'],
  ['people','People','Expiring credentials, training due and staff invites']
];
function bizAcc(){const a=S.auth.business||{};return (S.accounts||[]).find(x=>x.type==='business'&&x.email===a.email)||(S.accounts||[]).find(x=>x.type==='business')}
function setInit(){
  if(!S.set)S.set={tab:'personal',sub:{personal:'profile',users:'staff',pricing:'pricing',prefs:'notif'}};
  if(!S.me)S.me={phone:'07700 900455',phoneAt:'23 Oct 2026',mfaAt:'12 Sep 2026, 09:12',pwAt:'12 Sep 2026, 09:10',
    sessions:[{id:'d1',dev:'Chrome on Mac',where:'Crowland, UK',last:'Active now',cur:true},{id:'d2',dev:'Safari on iPhone',where:'Peterborough, UK',last:'Wed 14 Oct, 19:02'},{id:'d3',dev:'Edge on Windows',where:'Peterborough, UK',last:'Mon 5 Oct, 08:40'}]};
  if(!S.prefs)S.prefs={theme:'system',start:'overview',digest:'07:00',notif:{work:{email:true,sms:false},quality:{email:true,sms:false},disputes:{email:true,sms:true},finance:{email:true,sms:false},people:{email:false,sms:false}}};
  const seed={'Dami Cole':['owner','active','1 Sep 2025','dami.cole@fenlandfresh.example'],'Tomasz Nowak':['supervisor','active','3 Nov 2025','tomasz.nowak@fenlandfresh.example'],'Femi Bello':['dispatcher','active','12 Jan 2026','femi.bello@fenlandfresh.example'],'Rachel Moore':['hiring','mfa','2 Oct 2026','rachel.moore@fenlandfresh.example']};
  (S.members||[]).forEach((m,i)=>{if(m.role)return;const sd=seed[m.name]||['viewer','active',fmtD(today()),''];m.id=m.id||'m'+i;m.role=sd[0];m.status=sd[1];m.since=sd[2];m.email=m.email||sd[3]});
}
function applyTheme(){const t=S.prefs&&S.prefs.theme;const r=document.documentElement;if(t==='light'||t==='dark')r.setAttribute('data-theme',t);else r.removeAttribute('data-theme')}
const last4=p=>String(p||'').replace(/\D/g,'').slice(-4);
const isMe=m=>m.role==='owner';
function tgl(attrs,on,label){return `<label class="tgl"><input type="checkbox" role="switch" ${attrs} ${on?'checked':''} aria-label="${esc(label)}"><span aria-hidden="true"></span></label>`}
function setSeg(tab,items){const cur=S.set.sub[tab];return `<div class="seg set-seg" role="tablist" aria-label="Section">${items.map(([k,l,n])=>`<button role="tab" aria-selected="${cur===k}" aria-pressed="${cur===k}" data-act="setSub" data-v="${k}">${l}${n!==undefined?` <span class="set-n">${n}</span>`:''}</button>`).join('')}</div>`}
function pwField(id,label,hint){return `<label class="f">${label}<span class="pw-wrap"><input type="password" id="${id}" autocomplete="${id.includes('cur')?'current-password':'new-password'}"><button type="button" class="pw-eye" data-act="pwEye" data-v="${id}" aria-label="Show password">${SET_IC.eye}</button></span>${hint||''}</label>`}
function bizSettings(){
  setInit();const t=S.set.tab;
  const body={personal:setPersonal,users:setUsers,pricing:setPricing,prefs:setPrefs}[t]();
  return `<div><h1>Settings</h1><p class="muted">Your account, your team’s access, and how the business runs.</p></div>
  <div class="set">
    <nav class="set-nav" aria-label="Settings sections">${SET_TABS.map(([k,l])=>`<button data-act="setTab" data-v="${k}" ${t===k?'aria-current="page"':''}>${SET_IC[k]}<span>${l}</span></button>`).join('')}</nav>
    <div class="set-body">${body}</div>
  </div>`;
}
function setPersonal(){
  const a=bizAcc()||{};const me=S.me;const sub=S.set.sub.personal;
  const head=`<div class="set-h"><h2>Personal settings</h2><p class="muted">Your own Fenland Fresh staff account.</p></div>${setSeg('personal',[['profile','Profile'],['security','Sign-in and security']])}`;
  if(sub==='profile')return `${head}
    <section class="card stack set-card"><h3>Profile</h3>
      <div class="set-grid2"><label class="f">Full name<input type="text" id="me-name" value="${esc(a.name||ME_BIZ)}" autocomplete="name"></label>
      <label class="f">Sign-in email<input type="email" value="${esc(a.email||'')}" readonly aria-readonly="true"></label></div>
      <dl class="kv small"><dt>Role</dt><dd><b>${ROLES.owner.name}</b> · ${esc(ROLES.owner.desc)}</dd><dt>Business</dt><dd>Fenland Fresh Cleaning</dd></dl>
      <p class="small muted">Change your sign-in email under Sign-in and security.</p>
      <div id="me-err" class="ferr"></div>
      <div class="row"><button class="btn primary" data-act="meSave">Save</button></div></section>
    <section class="card stack set-card"><h3 class="ic-h">${SET_IC.lock}Mobile number for key decisions</h3>
      <p class="small muted">As Main admin, key decisions need a 6-digit code sent to this phone: adding staff, changing or removing someone’s role, and changing this number. Changing it needs a code to the current phone first.</p>
      <p class="set-phone"><b class="mono">•••• ${last4(me.phone)}</b> · confirmed ${esc(me.phoneAt)}</p>
      <label class="f">New mobile number<input type="tel" id="me-phone" placeholder="07700 900000" autocomplete="tel"></label>
      <div id="ph-err" class="ferr"></div>
      <div class="row"><button class="btn" data-act="mePhone">Change phone</button></div></section>`;
  return `${head}
    <section class="card stack set-card"><h3>Sign-in email</h3><p class="muted">Currently <b>${esc(a.email||'')}</b>.</p>
      <div class="set-grid2"><label class="f">New email<input type="email" id="me-email-new" autocomplete="email"></label>${pwField('me-email-cur','Current password')}</div>
      <div id="em-err" class="ferr"></div>
      <div class="row"><button class="btn" data-act="meEmail">Change email</button></div></section>
    <section class="card stack set-card"><h3>Password</h3>
      <div class="set-grid2">${pwField('me-pw-cur','Current password')}${pwField('me-pw-new','New password',`<span class="pw-checks" id="pw-checks"><span data-c="len">${SET_IC.check}At least 8 characters</span><span data-c="let">${SET_IC.check}A letter</span><span data-c="num">${SET_IC.check}A number</span></span>`)}</div>
      <div id="pw-err" class="ferr"></div>
      <div class="row"><button class="btn" data-act="mePw">Change password</button></div>
      <p class="small muted">Last changed ${esc(me.pwAt)}. Changing your password signs you out on other devices.</p></section>
    <section class="card stack set-card"><div class="set-row"><div><h3>Two-factor authentication</h3><p class="muted">On. You’re asked for a 6-digit code from your authenticator app each time you sign in.</p></div>
      <span class="tgl-wrap">${tgl('disabled',true,'Two-factor authentication')}<b>On</b></span></div>
      <p class="small muted set-ok">${SET_IC.check}Turned on ${esc(me.mfaAt)}. Required for the Main admin role, so it can’t be turned off.</p></section>
    <section class="card stack set-card"><div class="set-row"><h3>Sessions</h3>${me.sessions.length>1?'<button class="btn sm" data-act="sessAll">Sign out other sessions</button>':''}</div>
      <div class="tablewrap"><table class="t"><thead><tr><th>Device</th><th>Location</th><th>Last active</th><th><span class="sr">Action</span></th></tr></thead><tbody>
      ${me.sessions.map(s=>`<tr><td><b>${esc(s.dev)}</b>${s.cur?` ${pill('This device','good')}`:''}</td><td>${esc(s.where)}</td><td>${esc(s.last)}</td><td class="num">${s.cur?'':`<button class="btn sm ghost" data-act="sessOut" data-v="${s.id}">Sign out</button>`}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function setUsers(){
  const sub=S.set.sub.users;const M=S.members;
  const head=`<div class="set-h"><h2>Users and roles</h2><p class="muted">Give staff access to this workspace by role. You’re the Main admin, the sole owner of this account.</p></div>
    ${setSeg('users',[['staff','Staff',M.length],['roles','Roles']])}`;
  if(sub==='roles')return `${head}
    <div class="role-grid">${Object.entries(ROLES).map(([k,r])=>`<div class="card set-role"><div class="row" style="justify-content:space-between"><b>${r.name}</b><span class="small muted">${M.filter(m=>m.role===k).length} ${M.filter(m=>m.role===k).length===1?'person':'people'}</span></div><p class="small muted">${esc(r.desc)}</p></div>`).join('')}</div>
    <section class="card set-card stack"><h3>What each role can do</h3>
      <div class="tablewrap set-perm"><table class="t"><thead><tr><th>Area</th>${Object.values(ROLES).map(r=>`<th class="c">${r.name}</th>`).join('')}</tr></thead><tbody>
      ${PERMS.map(([a,p])=>`<tr><th scope="row">${a}</th>${Object.keys(ROLES).map(k=>`<td class="c">${p[k]==='f'?'<span class="perm f">Edit</span>':p[k]==='v'?'<span class="perm v">View</span>':'<span class="perm n" aria-label="No access">–</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="small muted">Cleaners use the cleaner app and only see their own work. Every role except Read only needs two-factor before it can sign in.</p></section>`;
  const st=m=>m.status==='active'?pill('Active','good'):m.status==='invited'?pill('Invited','info'):pill('Two-factor pending','warn');
  return `${head}
    <div class="set-row"><h3>Staff</h3><button class="btn primary" data-act="staffAdd">${SET_IC.plus}Add staff member</button></div>
    <div class="card tablewrap set-table set-staff"><table class="t"><thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Since</th><th><span class="sr">Actions</span></th></tr></thead><tbody>
    ${M.map(m=>`<tr><td><b>${esc(m.name)}</b>${isMe(m)?' <span class="muted small">(you)</span>':''}<div class="small muted">${esc(m.email||'–')}</div></td>
      <td>${isMe(m)?`<b>${ROLES.owner.name}</b>`:`<select data-act="roleSet" data-id="${m.id}" aria-label="Role for ${esc(m.name)}">${Object.entries(ROLES).filter(([k])=>k!=='owner').map(([k,r])=>`<option value="${k}" ${m.role===k?'selected':''}>${r.name}</option>`).join('')}</select>`}</td>
      <td>${st(m)}</td><td class="small nw">${esc(m.since)}</td>
      <td class="num">${isMe(m)?'':m.status==='invited'?`<button class="btn sm ghost" data-act="inviteResend" data-id="${m.id}">Resend</button><button class="btn sm ghost danger-t" data-act="inviteCancel" data-id="${m.id}">Cancel invite</button>`:`<button class="btn sm ghost danger-t" data-act="memberRemove" data-id="${m.id}">Remove</button>`}</td></tr>`).join('')}</tbody></table></div>
    <p class="small muted">Invited staff join when they accept the email invite and set up two-factor. Role changes take effect at their next action.</p>`;
}
function setPricing(){
  const st=S.settings;const PR=S.pricing;const sub=S.set.sub.pricing;
  const head=`<div class="set-h"><h2>Pricing and policies</h2><p class="muted">Changes apply to new quotes, bookings and rota publications. Accepted bookings keep the version they were accepted under.</p></div>
    ${setSeg('pricing',[['pricing','Pricing'],['policies','Policies'],['area','Service area'],['business','Business details']])}`;
  if(sub==='pricing')return `${head}
    <section class="card stack set-card"><div class="set-row"><h3>Pricing and rates</h3>${pill('Price list v'+PR.version,'info')}</div>
      <div class="grid4 small">${[['Region',REGION[PR.region].label],['Regular cleaning',PR.models.regular==='perroom'?`Per room from ${money(PR.perRoom.min)}`:PR.models.regular==='hourly'?`${money(PR.hourly.regular)}/h, min ${PR.minHours} h`:`Fixed per visit, from ${money(PR.fixed.regular.studio)}`],['Deep cleaning',PR.models.deep==='hourly'?`${money(PR.hourly.deep)}/cleaner-hour`:PR.models.deep==='custom'?'Custom quote':`Fixed, from ${money(PR.fixed.deep.studio)}`],['End of tenancy',`Fixed, from ${money(PR.fixed.eot.studio)}`],['Commercial',`${money(PR.hourly.commercial)}/h contract`],['Costs',`${money(loadedRate(PR))}/cleaner-hour + ${money(visitCosts(PR))}/visit`],['Target contribution margin',`${PR.costs.margin}%`],['VAT',PR.vat.registered?'Registered, +20%':'Not registered']].map(([k,v])=>`<div class="note"><div class="label">${k}</div><b>${esc(v)}</b></div>`).join('')}</div>
      <div class="row"><button class="btn primary" data-act="prOpen">Open price setup</button><button class="btn" data-act="biz" data-v="pricing">Go to Pricing</button><span class="small muted">Quotes, the cost calculator and performance live in Pricing.</span></div></section>
    <section class="card stack set-card"><h3>Price list history</h3>${(PR.history||[]).length?(PR.history||[]).slice(0,6).map(h=>`<div class="small set-hist"><b class="mono">v${h.v}</b> · ${esc(h.at)}<div class="muted">${esc(h.changes)}</div></div>`).join(''):'<p class="small muted">No changes yet.</p>'}</section>`;
  if(sub==='policies'){
    const f=(id,label,val,hint,min,max)=>`<label class="f">${label}<input type="number" id="${id}" value="${val}" min="${min}" max="${max}"><span class="hint">${hint}</span></label>`;
    return `${head}
    <section class="card stack set-card"><div class="set-row"><h3>Policies</h3>${pill('Current version v'+st.version,'info')}</div>
      <div class="set-grid2">${f('set-notice','Rota notice (days)',st.noticeDays,'Shifts published inside this window need employee acceptance.',1,28)}${f('set-horizon','Rota planning horizon (weeks)',st.horizonWeeks,'How far ahead rotas are planned.',1,8)}${f('set-cancelh','Free cancellation (hours before)',st.cancelHours,'Customers cancel free of charge before this point.',0,168)}${f('set-fee','Late cancellation fee (%)',st.cancelFee,'Charged on the visit price inside the window.',0,100)}${f('set-hold','Checkout hold (minutes)',st.holdMinutes,'How long a slot is held while a customer pays.',5,30)}${f('set-tol','Arrival tolerance (minutes)',st.tolerance,'After this, a visit with no check-in shows as late.',5,60)}</div>
      <div id="seterr" class="ferr"></div>
      <label class="f">Reason for change (recorded with the new version)<input type="text" id="set-reason" placeholder="e.g. Staff asked for more notice"></label>
      <div class="row"><button class="btn primary" data-act="setSave">Save as v${st.version+1}</button></div></section>
    <section class="card stack set-card"><h3>Version history</h3>${st.history.map(h=>`<div class="small set-hist"><b class="mono">v${h.v}</b> · ${esc(h.at)} · ${esc(h.by)}<div class="muted">${esc(h.changes)}</div></div>`).join('')}</section>`}
  if(sub==='area')return `${head}
    <section class="card stack set-card"><h3>Service area</h3><p class="small muted">Postcode districts you accept bookings from. Other postcodes are shown your phone number instead.</p>
      <div class="row">${st.zones.map(z=>`<span class="pill acc">${esc(z)} <button class="btn sm ghost" style="min-height:0;padding:0 2px" data-act="zoneRemove" data-v="${esc(z)}" aria-label="Remove ${esc(z)}">✕</button></span>`).join('')}</div>
      <div class="row"><input type="text" id="set-zone" placeholder="e.g. PE8" style="max-width:160px" aria-label="Postcode district"><button class="btn" data-act="zoneAdd">Add district</button></div><div id="zoneerr" class="ferr"></div></section>`;
  const ready=[['Business details and contact',true],['Service area and working hours',true],['Pricing and rates',PR.version>0,`Price list v${PR.version} · ${REGION[PR.region].label}`],['Payment provider account',true,'Connected (sandbox) · webhooks verified'],['Tax treatment',true,PR.vat.registered?'VAT registered':'Not VAT registered'],['Cancellation policy',true,`v${st.version}`],['Evidence and photo policy',true],['Call scheduling provider',false,'Optional. Calls are recorded internally until connected.']];
  return `${head}
    <div class="set-grid2"><section class="card stack set-card"><h3>Business</h3><dl class="kv small"><dt>Trading name</dt><dd>Fenland Fresh Cleaning</dd><dt>Contact</dt><dd class="mono">01733 960 412</dd><dt>Base</dt><dd>Crowland, Peterborough</dd><dt>Timezone</dt><dd>Europe/London</dd><dt>Currency</dt><dd>GBP</dd><dt>Working hours</dt><dd>Mon–Sat 06:00–22:00 · closed bank holidays</dd></dl></section>
    <section class="card stack set-card"><h3>Booking readiness</h3>${ready.map(r=>`<div class="row small set-hist" style="justify-content:space-between"><span>${r[0]}${r[2]?`<div class="muted">${esc(r[2])}</div>`:''}</span>${r[1]?pill('Done','good'):pill('Not set','')}</div>`).join('')}<div class="note good small">Paid bookings are open. Every mandatory item is complete.</div></section></div>`;
}
function setPrefs(){
  const P=S.prefs;const sub=S.set.sub.prefs;
  const head=`<div class="set-h"><h2>Preferences</h2><p class="muted">How the workspace looks and what it tells you about.</p></div>
    ${setSeg('prefs',[['notif','Notifications'],['appearance','Appearance'],['integrations','Integrations']])}`;
  if(sub==='notif')return `${head}
    <section class="card stack set-card"><div class="note info small set-note">${SET_IC.info}<div><b>In-app notifications are always on</b><br>Urgent items, like a visit with nobody checked in or a failed payment, also send a push notification to your phone.</div></div>
      <div class="tablewrap set-table"><table class="t"><thead><tr><th>Topic</th><th class="c">In-app</th><th class="c">Email</th><th class="c">Text</th></tr></thead><tbody>
      ${NOTIF_TOPICS.map(([k,n,d])=>`<tr><td><b>${n}</b><div class="small muted">${d}</div></td><td class="c"><span class="set-tick" aria-label="Always on">${SET_IC.check}</span></td><td class="c">${tgl(`data-nt="${k}.email"`,P.notif[k].email,n+' by email')}</td><td class="c">${tgl(`data-nt="${k}.sms"`,P.notif[k].sms,n+' by text')}</td></tr>`).join('')}</tbody></table></div>
      <label class="f" style="max-width:280px">Daily summary email<select id="pf-digest">${[['off','Don’t send'],['06:00','06:00'],['07:00','07:00'],['08:00','08:00'],['18:00','18:00, for tomorrow']].map(([v,l])=>`<option value="${v}" ${P.digest===v?'selected':''}>${l}</option>`).join('')}</select></label>
      <div class="row"><button class="btn primary" data-act="prefSave">Save preferences</button></div></section>`;
  if(sub==='appearance')return `${head}
    <section class="card stack set-card"><h3>Theme</h3><p class="small muted">Applies to this workspace on this account.</p>
      <div class="theme-pick" role="radiogroup" aria-label="Theme">${[['system','Match device'],['light','Light'],['dark','Dark']].map(([k,l])=>`<button role="radio" aria-checked="${P.theme===k}" data-act="themeSet" data-v="${k}"><span class="th-sw th-${k}" aria-hidden="true"><i></i><i></i><i></i></span>${l}</button>`).join('')}</div></section>
    <section class="card stack set-card"><h3>Start page</h3><p class="small muted">The page you see after signing in.</p>
      <div class="seg" role="radiogroup" aria-label="Start page">${[['overview','Overview'],['rota','Rota'],['bookings','Bookings'],['analytics','Analytics']].map(([k,l])=>`<button role="radio" aria-checked="${P.start===k}" aria-pressed="${P.start===k}" data-act="startSet" data-v="${k}">${l}</button>`).join('')}</div></section>
    <section class="card stack set-card"><h3>Region and format</h3><dl class="kv small"><dt>Timezone</dt><dd>Europe/London</dd><dt>Dates</dt><dd>Thu 15 Oct 2026</dd><dt>Time</dt><dd>24-hour, 14:30</dd><dt>Currency</dt><dd>GBP, £1,234.50</dd><dt>Week starts</dt><dd>Monday</dd></dl><p class="small muted">Set from the business location. Contact support to change it.</p></section>`;
  return `${head}
    <div class="note info small"><b>Campaign platforms</b> like Mailchimp, Google Ads and Meta Ads are under Growth › Integrations. <button class="linkbtn" data-act="igTab" data-v="campaigns">Open Integrations</button></div>
    <div class="set-grid2">${[['Payment provider','Connected · sandbox','good','Hosted checkout. Card details never touch this platform.'],['Payroll export','CSV (generic)','good','Batch file with stable line IDs and checksum.'],['Notifications','Push + SMS fallback','good','Access codes are never included in previews.'],['Call scheduling','Not connected','','Calls are booked as internal appointments.']].map(i=>`<section class="card stack set-card"><div class="set-row"><b>${i[0]}</b>${pill(i[1],i[2])}</div><p class="small muted">${i[3]}</p></section>`).join('')}</div>`;
}
function pwLive(v){const box=document.getElementById('pw-checks');if(!box)return;const ok={len:v.length>=8,let:/[a-z]/i.test(v),num:/\d/.test(v)};box.querySelectorAll('[data-c]').forEach(s=>s.classList.toggle('ok',ok[s.dataset.c]))}
const SET_MODALS={
  keyCode(m){return {title:'Confirm with your phone',sub:`We sent a 6-digit code to •••• ${last4(S.me.phone)}`,
    body:`<div class="note small">${m.summary}</div><label class="f">6-digit code<input type="text" id="kc-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000"><span class="hint">Demo: use 246810.</span></label><div id="kc-err" class="ferr"></div>`,
    foot:`<button class="btn primary" data-act="kcConfirm">Confirm</button>`}},
  staffAdd(m){return {title:'Add staff member',sub:'They get an email invite and set up their own password and two-factor.',
    body:`<label class="f">Full name<input type="text" id="sa-name" value="${esc(m.name||'')}" autocomplete="off"></label><label class="f">Work email<input type="email" id="sa-email" value="${esc(m.email||'')}" autocomplete="off"></label>
    <label class="f">Role<select id="sa-role">${Object.entries(ROLES).filter(([k])=>k!=='owner').map(([k,r])=>`<option value="${k}" ${m.role===k?'selected':''}>${r.name}</option>`).join('')}</select><span class="hint">You can change this later. See Roles for what each one can do.</span></label><div id="sa-err" class="ferr"></div>`,
    foot:`<button class="btn primary" data-act="staffAddNext">Send invite</button>`}}
};
function kcOpen(kind,summary,data){S.modal={type:'keyCode',kind,summary,data}}
const KC_DO={
  add(d){S.members.push({id:'m'+Date.now(),name:d.name,email:d.email,role:d.role,roles:ROLES[d.role].name,status:'invited',since:(fmtD(today()).slice(4)+' '+today().slice(0,4)),mfa:'Setup pending'});audit('Invited staff member',`${d.name} · ${d.email}`,ROLES[d.role].name);toast(`Invite sent to ${d.email}.`)},
  role(d){const m=S.members.find(x=>x.id===d.id);const was=ROLES[m.role].name;m.role=d.role;m.roles=ROLES[d.role].name;audit('Changed staff role',m.name,`${was} → ${ROLES[d.role].name}`);toast(`${m.name} is now ${ROLES[d.role].name}.`)},
  remove(d){const m=S.members.find(x=>x.id===d.id);S.members=S.members.filter(x=>x.id!==d.id);audit('Removed staff access',m.name,ROLES[m.role].name);toast(`${m.name} no longer has access.`)},
  phone(d){S.me.phone=d.phone;S.me.phoneAt=(fmtD(today()).slice(4)+' '+today().slice(0,4));audit('Changed key-decision phone',`•••• ${last4(d.phone)}`,'Confirmed with code to previous phone');toast('Mobile number changed.')}
};
const SET_ACT={
  setTab:e=>{S.set.tab=e.v;window.scrollTo(0,0)},
  setSub:e=>{S.set.sub[S.set.tab]=e.v},
  pwEye:e=>{const i=document.getElementById(e.v);if(i){i.type=i.type==='password'?'text':'password'}return false},
  meSave:()=>{const n=val('me-name');if(n.length<2){setErr('me-err','Enter your full name.');return false}const a=bizAcc();if(a.name===n){setErr('me-err','Nothing has changed.');return false}
    a.name=n;if(S.auth.business)S.auth.business.name=n;S.members.filter(isMe).forEach(m=>m.name=n);audit('Updated profile','Full name',n);toast('Profile saved.')},
  mePhone:()=>{const raw=val('me-phone').replace(/[\s()-]/g,'').replace(/^\+44/,'0');if(!/^07\d{9}$/.test(raw)){setErr('ph-err','Enter a UK mobile number, like 07700 900000.');return false}
    if(last4(raw)===last4(S.me.phone)&&raw.replace(/\D/g,'')===S.me.phone.replace(/\D/g,'')){setErr('ph-err','That’s already your number.');return false}
    const p=raw.slice(0,5)+' '+raw.slice(5);kcOpen('phone',`Change the key-decision phone to <b class="mono">${esc(p)}</b>. The code goes to your current phone.`,{phone:p})},
  meEmail:()=>{const e=val('me-email-new').toLowerCase();const a=bizAcc();if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)){setErr('em-err','Enter a valid email address.');return false}
    if(e===a.email){setErr('em-err','That’s already your sign-in email.');return false}
    if(S.accounts.some(x=>x.email===e)){setErr('em-err','That email is already used by another account.');return false}
    if(pwHash(val('me-email-cur'))!==a.pw){setErr('em-err','Your current password isn’t right.');return false}
    const old=a.email;a.email=e;if(S.auth.business)S.auth.business.email=e;S.members.filter(isMe).forEach(m=>m.email=e);audit('Changed sign-in email',`${old} → ${e}`,'');toast(`Sign-in email changed. We’ve told ${old}.`)},
  mePw:()=>{const a=bizAcc();const cur=document.getElementById('me-pw-cur').value;const n=document.getElementById('me-pw-new').value;
    if(pwHash(cur)!==a.pw){setErr('pw-err','Your current password isn’t right.');return false}
    if(n.length<8||!/[a-z]/i.test(n)||!/\d/.test(n)){setErr('pw-err','Use at least 8 characters, with a letter and a number.');return false}
    if(n===cur){setErr('pw-err','Choose a password you haven’t just used.');return false}
    a.pw=pwHash(n);S.me.pwAt=stamp();const out=S.me.sessions.filter(s=>!s.cur).length;S.me.sessions=S.me.sessions.filter(s=>s.cur);audit('Changed password',a.email,`Signed out ${out} other session${out===1?'':'s'}`);toast('Password changed. Other devices have been signed out.')},
  sessOut:e=>{const s=S.me.sessions.find(x=>x.id===e.v);S.me.sessions=S.me.sessions.filter(x=>x.id!==e.v);audit('Signed out session',s.dev,s.where);toast(`Signed out ${s.dev}.`)},
  sessAll:()=>{const n=S.me.sessions.filter(s=>!s.cur).length;S.me.sessions=S.me.sessions.filter(s=>s.cur);audit('Signed out other sessions',`${n} session${n===1?'':'s'}`,'');toast('Other sessions signed out.')},
  staffAdd:()=>{S.modal={type:'staffAdd',role:'dispatcher'}},
  staffAddNext:()=>{const n=val('sa-name'),e=val('sa-email').toLowerCase(),r=document.getElementById('sa-role').value;
    if(n.length<2){setErr('sa-err','Enter their full name.');return false}
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)){setErr('sa-err','Enter a valid email address.');return false}
    if(S.members.some(m=>(m.email||'').toLowerCase()===e)){setErr('sa-err','Someone with that email is already on your team.');return false}
    kcOpen('add',`Invite <b>${esc(n)}</b> (${esc(e)}) as <b>${ROLES[r].name}</b>.`,{name:n,email:e,role:r})},
  roleSet:e=>{const m=S.members.find(x=>x.id===e.id);if(!m||m.role===e.value)return;kcOpen('role',`Change <b>${esc(m.name)}</b> from ${ROLES[m.role].name} to <b>${ROLES[e.value].name}</b>.`,{id:m.id,role:e.value})},
  memberRemove:e=>{const m=S.members.find(x=>x.id===e.id);kcOpen('remove',`Remove <b>${esc(m.name)}</b>’s access. They’re signed out straight away. Their history stays in the audit log.`,{id:m.id})},
  inviteResend:e=>{const m=S.members.find(x=>x.id===e.id);audit('Resent invite',m.email,'');toast(`Invite resent to ${m.email}.`)},
  inviteCancel:e=>{const m=S.members.find(x=>x.id===e.id);S.members=S.members.filter(x=>x.id!==e.id);audit('Cancelled invite',m.email,'');toast('Invite cancelled.')},
  kcConfirm:()=>{const c=val('kc-code').replace(/\s/g,'');if(c!==AUTH_DEMO.sms){setErr('kc-err',c.length!==6?'Enter the 6-digit code.':'That code isn’t right. Check the latest text.');return false}
    const m=S.modal;S.modal=null;KC_DO[m.kind](m.data)},
  prefSave:()=>{document.querySelectorAll('[data-nt]').forEach(i=>{const [k,c]=i.dataset.nt.split('.');S.prefs.notif[k][c]=i.checked});S.prefs.digest=document.getElementById('pf-digest').value;audit('Updated notification preferences',ME_BIZ,'');toast('Preferences saved.')},
  themeSet:e=>{S.prefs.theme=e.v;applyTheme();toast(e.v==='system'?'Theme now matches your device.':`${e.v[0].toUpperCase()+e.v.slice(1)} theme on.`)},
  startSet:e=>{S.prefs.start=e.v;toast('Start page saved.')}
};
