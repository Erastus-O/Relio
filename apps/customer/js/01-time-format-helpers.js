/* time & format helpers */
const BASE = new Date(2026,9,15,12,40);
const pad=n=>String(n).padStart(2,'0');
const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function dt(date,time){const [y,m,d]=date.split('-').map(Number);const [h,mi]=(time||'00:00').split(':').map(Number);return new Date(y,m-1,d,h,mi)}
function iso(x){return `${x.getFullYear()}-${pad(x.getMonth()+1)}-${pad(x.getDate())}`}
function addDays(date,n){const x=dt(date);x.setDate(x.getDate()+n);return iso(x)}
function fmtD(date){const x=dt(date);return `${DOW[x.getDay()]} ${x.getDate()} ${MON[x.getMonth()]}`}
function clock(){return new Date(BASE.getTime()+S.tick*60000)}
function stamp(x){x=x||clock();return `${fmtD(iso(x))}, ${pad(x.getHours())}:${pad(x.getMinutes())}`}
function hhmm(x){x=x||clock();return `${pad(x.getHours())}:${pad(x.getMinutes())}`}
const today=()=>iso(clock());
const mins=t=>{const [h,m]=t.split(':').map(Number);return h*60+m};
const money=p=>'£'+(p/100).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function weekOf(date){const x=dt(date);x.setDate(x.getDate()-((x.getDay()+6)%7));return iso(x)}
const pill=(t,tone='')=>`<span class="pill ${tone}">${esc(t)}</span>`;
const hex=()=>Math.random().toString(16).slice(2,10);
let NOTICE_DAYS=7;
function isShort(date,start){return (dt(date,start)-clock()) < NOTICE_DAYS*86400000}
