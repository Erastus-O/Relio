/* business activity (inactive detection) */
const AD_ACT_SEED={ff:[0,0,-3],ss:[-2,-1,-20],pc:[-1,0,-9],fx:[-3,-2,-30],rc:[-38,-45,-120],nt:[-5,-3,-40],bm:[-1,0,-12],dk:[-2,null,-2],sw:[-64,-70,-150],gl:[-21,null,-21]};
function adActSeed(k){const b=adBizInit()[k];if(b.lastLogin===undefined){const s=AD_ACT_SEED[k]||[0,null,0];b.lastLogin=addDays(today(),s[0]);b.lastBooking=s[1]==null?null:addDays(today(),s[1]);b.lastListing=addDays(today(),s[2]);b.nudges=[]}return b}
function adDaysSince(d){return d?Math.max(0,Math.round((dt(today())-dt(d))/86400000)):null}
function adAct(k){const b=adActSeed(k);const thr=(S.mkt.adRules&&S.mkt.adRules.inactiveDays)||30;const M=S.mkt;
  const ob=(M.orders||[]).filter(o=>o.prov===k).map(o=>o.booked||o.date).filter(Boolean).sort().pop();let lastBk=b.lastBooking;if(ob&&(!lastBk||ob>lastBk)&&ob<=today())lastBk=ob;
  const dl=adDaysSince(b.lastLogin),db=adDaysSince(lastBk),dli=adDaysSince(b.lastListing);const unanswered=(M.req||[]).filter(r=>r.to===k&&r.outcome==='pending').length;
  let st,label,tone,why;
  if(b.status==='suspended'){st='suspended';label='Suspended';tone='bad';why='Suspended by the platform'}
  else if(['onboarding','pending'].includes(b.status)){if(dl>14){st='stuck';label='Stuck in setup';tone='warn';why=`Signed up but no sign-in for ${dl} days`}else{st='setup';label='Setting up';tone='';why='Still completing verification'}}
  else{const quiet=Math.min(dl??999,db??999);
    if(quiet>=thr*2){st='dormant';label='Dormant';tone='bad';why=`No sign-in for ${dl} days and no bookings for ${db??'over '+thr*2} days`}
    else if(quiet>=thr){st='inactive';label='Inactive';tone='bad';why=`No sign-in for ${dl} days and no bookings for ${db} days`}
    else if(db==null||db>=14){st='slowing';label='Slowing down';tone='warn';why=db==null?'No bookings yet':`No bookings for ${db} days`}
    else{st='active';label='Active';tone='good';why=`Signed in ${dl===0?'today':dl+' days ago'}`}}
  return {st,label,tone,why,dl,db,dli,lastBk,unanswered,thr,live:M.listings.filter(l=>l.prov===k&&l.status==='published').length,nudges:b.nudges||[]}}
function adIsInactive(k){return ['inactive','dormant','stuck'].includes(adAct(k).st)}
function adAgo(n){return n==null?'Never':n===0?'Today':n===1?'Yesterday':`${n} days ago`}
function adActCard(k){const a=adAct(k);const P=S.mkt.prov[k];
  return `<section class="card stack"><div class="set-row"><h2>Activity</h2>${pill(a.label,a.tone)}</div>
  <dl class="kv small"><dt>Last sign-in</dt><dd>${adAgo(a.dl)}</dd><dt>Last booking</dt><dd>${adAgo(a.db)}</dd><dt>Last listing change</dt><dd>${adAgo(a.dli)}</dd><dt>Live listings</dt><dd>${a.live}</dd><dt>Quote requests waiting</dt><dd>${a.unanswered}</dd><dt>Check-ins sent</dt><dd>${a.nudges.length?a.nudges.map(n=>esc(n)).join('<br>'):'None'}</dd></dl>
  <p class="small muted">Inactive means no sign-in and no bookings for ${a.thr} days. Change this in Settings › Platform rules.</p></section>`}
