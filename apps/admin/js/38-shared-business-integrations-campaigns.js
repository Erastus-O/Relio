/* BUSINESS: INTEGRATIONS + CAMPAIGNS */
const INTG={
  mailchimp:{name:'Mailchimp',kind:'email',grp:'Email and text campaigns',desc:'Send newsletters and offers to customers who agreed to marketing.',sync:'Contacts who agreed to marketing, with tags for customer type, area and last booking',acct:'Audience',accts:['Fenland Fresh customers','Newsletter (2025)']},
  brevo:{name:'Brevo',kind:'email',grp:'Email and text campaigns',desc:'Email and SMS campaigns with automated reminders.',sync:'Contacts who agreed to marketing, and booking events for automations',acct:'Contact list',accts:['All customers','Domestic customers']},
  klaviyo:{name:'Klaviyo',kind:'email',grp:'Email and text campaigns',desc:'Automated email and SMS flows based on bookings.',sync:'Contacts who agreed to marketing, and booking events',acct:'List',accts:['Customers']},
  googleads:{name:'Google Ads',kind:'ads',grp:'Advertising',desc:'Search and map ads when people look for cleaners near you.',sync:'Booking conversions, and your service area for targeting',acct:'Ads account',accts:['Fenland Fresh (123-456-7890)']},
  meta:{name:'Meta Ads',kind:'ads',grp:'Advertising',desc:'Facebook and Instagram ads to people in your area.',sync:'Booking conversions, and your service area for targeting',acct:'Ad account',accts:['Fenland Fresh Cleaning']},
  tiktok:{name:'TikTok Ads',kind:'ads',grp:'Advertising',desc:'Short video ads to local audiences.',sync:'Booking conversions, and your service area',acct:'Ad account',accts:['Fenland Fresh']},
  nextdoor:{name:'Nextdoor Ads',kind:'ads',grp:'Advertising',desc:'Sponsored posts in neighbourhoods you cover.',sync:'Your service area and booking link',acct:'Business page',accts:['Fenland Fresh Cleaning, Crowland']},
  gbp:{name:'Google Business Profile',kind:'local',grp:'Local listings and reviews',desc:'Show a Book button on Google and ask happy customers for reviews.',sync:'Your booking link, opening hours, services and review requests after completed visits',acct:'Location',accts:['Fenland Fresh Cleaning, Crowland PE6']}};
function intgInit(){if(!S.intg)S.intg={};if(!S.camps)S.camps=[];if(!S.mktConsent){S.mktConsent={amara:true,reid:false,harbour:true,nene:false}}return S.intg}
function intgContacts(){intgInit();const cs=Object.entries(S.customers||{});const ok=cs.filter(([k])=>S.mktConsent[k]||((S.accounts||[]).find(a=>a.persona&&PERSONAS[a.persona]&&PERSONAS[a.persona].customer===k)||{}).marketing);
  const leads=(S.dq||[]).filter(d=>!d.customer);return {total:cs.length+leads.length,ok:ok.length,okIds:ok.map(x=>x[0]),leads:leads.length}}
const IG_ACT={
  igTab:e=>{S.biz.igTab=e.v;S.biz.view='integrations'},
  igNext:()=>{const m=S.modal;if(m.step===1){if([...document.querySelectorAll('.ig-ack')].some(c=>!c.checked)){setErr('ig-err','Tick each item to continue.');return false}m.step=2;return}
    if(m.step===2){if(!okEmail(val('ig-email'))){setErr('ig-err',`Enter the email you use for ${INTG[m.k].name}.`);return false}m.email=val('ig-email');m.step=3;return}
    const I=INTG[m.k];const C=intgContacts();const opts={freq:(document.getElementById('ig-freq')||{}).value||'change',audience:!!(document.getElementById('ig-aud')||{}).checked,tags:!!(document.getElementById('ig-tags')||{}).checked};
    S.intg[m.k]={status:'connected',account:document.getElementById('ig-acct').value,login:m.email,at:stamp(),last:stamp(),synced:I.kind==='email'?C.ok:0,opts};S.modal=null;audit('Connected integration',I.name,`${I.acct}: ${S.intg[m.k].account}`);toast(`${I.name} connected.${I.kind==='email'?` ${C.ok} contacts synced.`:''}`)}
};
const IG_MODALS={
  
};
