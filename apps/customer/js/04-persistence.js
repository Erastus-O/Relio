/* persistence */
const KEY='relio-customer-v1';
function save(){DataStore.save(S)}
function load(){const r=DataStore.load();if(r){S=r;S.modal=null;return true}return false}
