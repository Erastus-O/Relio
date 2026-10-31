/* CUSTOMER */
const PERSONAS={amara:{name:'Amara Okafor',role:'Domestic customer',customer:'amara'},sam:{name:'Sam Ellis',role:'Approver · Harbour Logistics',customer:'harbour',approver:true,limit:200000},jordan:{name:'Jordan Price',role:'Requester · Harbour Logistics',customer:'harbour',approver:false}};
const SLOTS=[{id:'sl1',date:'2026-10-27',start:'09:00',left:3},{id:'sl2',date:'2026-10-28',start:'13:00',left:2},{id:'sl3',date:'2026-10-30',start:'09:00',left:1},{id:'sl4',date:'2026-11-03',start:'09:00',left:4},{id:'sl5',date:'2026-11-04',start:'13:00',left:2}];
function slotState(sl){return S.flags['slot_'+sl.id]!==undefined?S.flags['slot_'+sl.id]:sl.left}
