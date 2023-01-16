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
   return filterUniqueByProperties(["datasetKey", "statKey"], [..._groupKpis, ..._userKpis, ..._journeyKpis])
}
const generalKpis = [
   { datasetKey:"pressUps", statKey:"reps" }
];

const userKpis = {
   //Lewis
   "606b2f1f3eecde47d8864798":[
      //press-ups in 1 min
      { datasetKey:"pressUps", statKey:"reps" },
      { datasetKey:"shuttles", statKey:"time" },
      /*
      { datasetKey:"longJump", statKey:"distance-left" },
      { datasetKey:"longJump", statKey:"distance-right" },
      { datasetKey:"hurdleJumps1Min", statKey:"score" },
      { datasetKey:"shootingRightFoot", statKey:"score" },
      { datasetKey:"shootingLeftFoot", statKey:"score" },
      { datasetKey:"game-Options", statKey:"score-1" },*/
   ]
}

const groupKpis = {};

const journeyKpis = {};
