import { filterUniqueByProperties } from "../util/ArrayHelpers"

export const getKpis = (userId, journeyId, groupId) => {
   if(!userId && !journeyId && !groupId){
      return generalKpis;
   }
   //can have kpis for a journey, and for a user for all their journeys too, and for a group
   const _groupKpis = groupKpis[groupId]?.map(kpi => ({ ...kpi, level:"group" })) || [];
   const _userKpis = userKpis[userId]?.map(kpi => ({ ...kpi, level:"user" })) || [];
   const _journeyKpis = journeyKpis[journeyId]?.map(kpi => ({ ...kpi, level:"journey" })) || [];
   //journey kpis override user kpis, which overide groupkpis
   const allKpis = [..._groupKpis, ..._userKpis, ..._journeyKpis];
   const datasetKpis = allKpis.filter(kpi => kpi.datasetKey && kpi.statKey)
   const uniqueDatasetKpis = filterUniqueByProperties(["datasetKey", "statKey"], datasetKpis)
   const nonDatasetKpis = allKpis.filter(kpi => !kpi.datasetKey);
   const uniqueNonDatasetKpis = filterUniqueByProperties(["key"], nonDatasetKpis);
   return [ ...uniqueDatasetKpis, ...uniqueNonDatasetKpis ]
}
const generalKpis = [
   { datasetKey:"pressUps", statKey:"reps" }
];

/*
 - Kpis can be linked to a dataset or not. If no key or name, these are derived from the datasetKey and statKey
 - All kpis can have steps given to them for a particular profile
*/
const userKpis = {
   //pd
   "643d79844aa4af07d60f394c":[
      { datasetKey:"sleep", statKey:"score" },
      { key:"meditation", name:"Meditation" },
      { key:"nutrition", name:"Nutrition" },
      { key:"exercise", name:"Exercise" },
      { key: "social", name:"Social" },
      { key:"admin", name:"Admin" },
      { key:"money", name:"Money" },
      { key:"customers", name:"Customers" },
      { key:"product", name:"Product" },
   ],
   //pd heroku
   "643d81262b7e4f0015e55bb6":[
      { key: "sleep", name:"Sleep" },
      { key:"meditation", name:"Meditation" },
      { key:"nutrition", name:"Nutrition" },
      { key:"exercise", name:"Exercise" },
      { key: "social", name:"Social" },
      { key:"admin", name:"Admin" },
      { key:"money", name:"Money" },
      { key:"customers", name:"Customers" },
      { key:"product", name:"Product" },
   ],
   //Lewis
   "606b2f1f3eecde47d8864798":[
      { datasetKey:"pressUps", statKey:"reps" },
      { datasetKey:"shuttles", statKey:"time" },
      { datasetKey:"longJump", statKey:"distance-left" },
      { datasetKey:"longJump", statKey:"distance-right" },
      { datasetKey:"hurdleJumps1Min", statKey:"score" },
      { datasetKey:"shootingRightFoot", statKey:"score" },
      { datasetKey:"shootingLeftFoot", statKey:"score" },
      { datasetKey:"game-Options", statKey:"score-1" },
   ],
   //aa
   "606b2ef13eecde47d8864797":[
      { key:"admin", name:"Admin" },
      { key:"healthAndFitness", name:"Health & Fitness" },
      { key:"prodDev", name:"Product Development" },
      { key:"reading", name:"Reading" },
      { key:"social", name:"Social" }
   ]
}

const groupKpis = {};

const journeyKpis = {};
/*
function getAvailableSteppedKpis(userId){
   return steppedKpis.filter(kpi => 
      kpi.access === "public" || kpi.owner === userId || kpi.userAccess?.includes(userId));
}
const steppedKpis = [
   {
      id:"ps1", kpiType:"stepped", access:"public", owner:"", name:"Admin", shortName:"Admin", initials:"Adm", desc:"", photo:null
   },
   {
      id:"ps2", kpiType:"stepped", access:"public", owner:"", name:"Health & Fitness", shortName:"HFit", initials:"H&F", desc:"", photo:null
   },
   {
      id:"ps3", kpiType:"stepped", access:"public", owner:"", name:"Nutrition", shortName:"Nutr", initials:"Nut", desc:"", photo:null
   },
   {
      id:"ps4", kpiType:"stepped", access:"public", owner:"", name:"Finance", shortName:"Fin", initials:"Fin", desc:"", photo:null
   },
   {
      id:"ps5", kpiType:"stepped", access:"public", owner:"", name:"Reading", shortName:"Read", initials:"Rd", desc:"", photo:null
   },
   {
      id:"ps6", kpiType:"stepped", access:"public", owner:"", name:"Social", shortName:"Soc", initials:"Soc", desc:"", photo:null
   },
   {
      id:"ps7", kpiType:"stepped", access:"public", owner:"", name:"Family", shortName:"Fam", initials:"Fam", desc:"", photo:null
   },
   {
      id:"ps8", kpiType:"stepped", access:"public", owner:"", name:"Study", shortName:"Stud", initials:"Std", desc:"", photo:null
   },
   {
      id:"ps9", kpiType:"stepped", access:"public", owner:"", name:"Career", shortName:"Car", initials:"Car", desc:"", photo:null
   },
   {
      id:"ps10", kpiType:"stepped", access:"public", owner:"", name:"Personal Development", shortName:"Pers", initials:"PD", desc:"", photo:null
   },

]
*/
