/* reference data */
const SERVICES={
  regular:{id:'regular',name:'Regular home clean',skill:'domestic',skillLabel:'Domestic',basis:'Fixed price by property size',
    prices:{1:6000,2:6000,3:7500,4:9000},dur:{1:2,2:2,3:2.5,4:3},crew:1,
    inc:['Dust reachable surfaces','Vacuum and mop floors','Kitchen worktops, hob and sink','Bathrooms and toilets','Empty bins'],
    exc:['Inside oven or fridge (available as add-ons)','Exterior windows','Moving heavy furniture','Biohazard or clinical waste']},
  deep:{id:'deep',name:'Deep clean',skill:'deep',skillLabel:'Deep clean',basis:'Fixed price by property size, two cleaners',
    prices:{1:14000,2:14000,3:17000,4:20000},dur:{1:2,2:2,3:2.5,4:3},crew:2,
    inc:['Everything in a regular clean','Skirting boards and door frames','Descale taps and shower heads','Inside kitchen cupboards (emptied)','Behind movable appliances'],
    exc:['Carpet shampoo','Exterior windows','Post-construction dust','Biohazard or clinical waste']},
  eot:{id:'eot',name:'End of tenancy clean',skill:'deep',skillLabel:'Deep clean',basis:'Fixed price by property size',crew:2,
    inc:['Every room cleaned to inventory standard','Inside oven, fridge and cupboards','Skirting boards, doors and frames','Bathrooms descaled','Windows cleaned inside'],
    exc:['Carpet steam cleaning (add-on)','Exterior windows','Removing rubbish or belongings','Pest or mould treatment']},
  office:{id:'office',name:'Office clean (contract)',skill:'office',skillLabel:'Commercial',basis:'Contract quote',prices:{},dur:{},crew:1,inc:[],exc:[]}
};
const ADDONS={carpet:{name:'Carpet steam clean (1 room)',p:7000,task:['Living room','Steam clean carpet (1 room)',null]},oven:{name:'Inside oven (single)',p:2500,task:['Kitchen','Clean inside oven','pair']},fridge:{name:'Inside fridge',p:1500,task:['Kitchen','Clean inside fridge','after']},windows:{name:'Interior windows',p:2000,task:['Living room','Clean interior windows',null]},ironing:{name:'Ironing (1 hour)',p:2200,task:['Bedrooms','Ironing, up to 1 hour',null]}};
const FREQ={once:{label:'One-off',pct:0},weekly:{label:'Weekly',pct:15},fortnightly:{label:'Fortnightly',pct:10},monthly:{label:'Monthly',pct:5}};
const TEMPLATES={
  dom:[['Kitchen','Clean worktops and hob','after'],['Kitchen','Clean sink and taps',null],['Kitchen','Mop floor',null],['Bathroom','Clean toilet',null],['Bathroom','Clean shower and screen','pair'],['Bathroom','Wipe mirrors and tiles',null],['Living room','Dust reachable surfaces',null],['Living room','Vacuum floors',null],['Bedrooms','Change bed linen if left out',null],['Bedrooms','Vacuum floors',null]],
  office:[['Open office','Empty bins and replace liners',null],['Open office','Wipe clear desks',null],['Open office','Vacuum carpet',null],['Kitchenette','Clean sink and worktops','after'],['Kitchenette','Load and run dishwasher',null],['Toilets','Clean toilets and basins','pair'],['Toilets','Restock soap and paper',null],['Toilets','Mop floor',null]]
};
const ME_BIZ='Dami Cole';
const CONTRACT={harbour:11000,warehouse:7500,nene:8000};
const FEE_PCT=1.5, FEE_FIXED=20;
