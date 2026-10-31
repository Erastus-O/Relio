/* CAMPAIGNS: own page + "New campaign" wizard */
const CW_CH={email:['Email','Send an email to customers who agreed to marketing.','email'],sms:['Text message','Send a short text to customers who agreed to marketing.','email'],ads:['Online ads','Show ads to people in your service area on Google, Facebook and others.','ads'],local:['Google reviews','Ask happy customers for a Google review after a visit.','local']};
function cwPlats(ch){intgInit();const kind=CW_CH[ch][2];const con=Object.keys(INTG).filter(k=>INTG[k].kind===kind&&S.intg[k]&&S.intg[k].status==='connected'&&(ch!=='sms'||['brevo','klaviyo'].includes(k)));return (ch==='email'||ch==='sms'?['own']:[]).concat(con)}
const CW_ACT={
  
};
