/* businesses linked to a pro's email */
function xproStatus(k){const X=XPROS[k];return ((S.xinv||{})[k])||(X.invited?'invited':'active')}
function proLinks(email){const em=normEm(email);const L=[];
  Object.values(S.staff).filter(st=>normEm((st.app&&st.app.email)||st.email)===em).forEach(st=>{const acc=S.accounts.find(a=>a.type==='cleaner'&&a.staff===st.id);
    const status=st.app&&st.app.status==='removed'?'removed':acc?'active':st.app&&st.app.status==='invited'?'invited':'active';
    L.push({key:st.id,biz:'Fenland Fresh Cleaning',prov:'ff',role:st.role,status,since:st.start,staff:st.id,setup:status==='active'&&st.proOnb&&!st.proOnb.done})});
  Object.entries(XPROS).filter(([k,x])=>normEm(x.email)===em).forEach(([k,x])=>L.push({key:k,biz:S.mkt.prov[x.prov].name,prov:x.prov,role:x.role,status:xproStatus(k),ext:k,invited:x.invited}));
  const o={active:0,invited:1,removed:2};return L.sort((a,b)=>o[a.status]-o[b.status])}
const PA_ACT={
  
};
