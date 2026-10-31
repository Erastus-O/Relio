/* PLATFORM ADMIN (SP-33, SP-38, FR-58, FR-59) */
function adAudit(action,obj,reason){S.mkt.adminAudit.unshift({at:stamp(),actor:(S.auth.admin||{}).name||'Platform admin',action,obj,reason})}
const AD_ACT={
  
};
