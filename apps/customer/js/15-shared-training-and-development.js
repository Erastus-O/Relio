/* TRAINING AND DEVELOPMENT */
function allCourses(){return COURSES.concat((S&&S.customCourses)||[])}
function courseById(id){return allCourses().find(c=>c.id===id)}
function courseKind(c){return c.grants?`Unlocks ${SKILL_LABEL[c.grants]} visits`:c.mand?(c.months?`Mandatory · refresh every ${c.months>=12&&c.months%12===0?(c.months/12)+' year'+(c.months>12?'s':''):c.months+' months'}`:'Mandatory · one-off'):(c.months?`Recommended · refresh every ${c.months/12} years`:'Recommended · one-off')}
const TR={pending:null};
function matsFor(cid){return (S.trainMats||[]).filter(m=>m.course===cid)}
function trRec(sid,cid){return ((S.training||{})[sid]||{})[cid]}
function fileSize(b){return b>=1048576?(b/1048576).toFixed(1)+' MB':Math.max(1,Math.round(b/1024))+' KB'}
function matMeta(m){if(m.kind==='link'){try{return new URL(m.url).hostname}catch(e){return m.url}}return `${m.name} · ${fileSize(m.size||0)}`}
const IC_LINK='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>';
const IC_DOC='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>';
function matRow(m,opts={}){const as=m.assign||[];
  return `<div class="mat"><span class="mat-ic">${m.kind==='link'?IC_LINK:IC_DOC}</span><div class="mat-body">${m.kind==='link'?`<a class="mat-t small" href="${esc(m.url)}" target="_blank" rel="noopener noreferrer">${esc(m.title)}</a>`:`<button class="mat-t small" data-act="matOpen" data-id="${m.id}">${esc(m.title)}</button>`}
    <div class="small muted">${esc(matMeta(m))}${m.kind==='file'&&!m.data?' · sample file':''}</div></div></div>`}
const TR_MODALS={
  
};
async function matSave(M){let blob;try{const bin=atob(M.data.split(',')[1]);const u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);blob=new Blob([u8],{type:M.type||'application/octet-stream'})}catch(x){toast('Could not open this file');return}
  let dl=null;try{dl=window.claude&&window.claude.use?await window.claude.use('downloads'):null}catch(x){}
  if(dl){try{await dl.save({filename:M.name,data:blob})}catch(e){if(e&&e.code&&e.code!=='cancelled'&&e.code!=='declined')toast('The file could not be saved here')}return}
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';a.download=M.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
function checked(name){return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(x=>x.value)}
function shareMats(cid,ids){matsFor(cid).forEach(M=>{M.assign=M.assign||[];ids.forEach(id=>{if(!M.assign.some(a=>a.staff===id))M.assign.push({staff:id,at:stamp(),opened:null})})})}
function assignTraining(sid,cid,due,msg){const c=courseById(cid);const old=trRec(sid,cid);const prev=old&&old.status==='complete'?{done:old.done,expires:old.expires,note:old.note}:old&&old.prev||null;
  (S.training[sid]=S.training[sid]||{})[cid]={status:'assigned',assigned:today(),due,prev};
  notify(sid,`Training assigned: ${c.name}${prev?' (refresher)':''}. Complete by ${fmtD(due)}.${msg?' '+msg:''}`);audit(prev?'Assigned refresher':'Assigned training',`${S.staff[sid].name} · ${c.name}`,`Due ${fmtD(due)}`)}
const TR_ACT={
  matOpen:e=>{const M=S.trainMats.find(x=>x.id===e.id);if(!M)return false;if(e.sid)ACT.matOpened({id:e.id,sid:e.sid});
    if(!M.data){toast('Sample document: no file is stored in this demo');return}
    matSave(M);},
  matOpened:e=>{const M=S.trainMats.find(x=>x.id===e.id);const sid=e.sid||S.cl.persona;const a=M&&(M.assign||[]).find(x=>x.staff===sid);if(a&&!a.opened){a.opened=stamp()}}
};
