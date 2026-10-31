/* BUSINESS: LISTINGS, PROFILE AND DEMAND MAP (SP-01–08, SP-19–31) */
const BIZM_ACT={
  lsCatReq:()=>{S.mkt.catRequests.push({id:'CQ-'+(5+S.mkt.catRequests.length),cat:'repairs',by:'Fenland Fresh Cleaning',at:stamp(),status:'open',note:'Small repairs alongside end of tenancy cleans.'});toast('Request sent to the platform team. You can draft listings now but can’t publish them until it’s approved.')},
  soloToggle:()=>{S.prefs.solo=!S.prefs.solo;toast(S.prefs.solo?'Team modules hidden. Turn them back on here any time.':'Team modules are back.')}
};
const BIZM_MODALS={
  
};
