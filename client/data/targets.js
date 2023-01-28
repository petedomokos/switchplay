import * as d3 from 'd3';
import { filterUniqueByProperties } from "../util/ArrayHelpers"

export const getTargets = (userId, groupId) => {
   if(!userId && !groupId){
      return generalTargets;
   }
   //can have kpis for a journey, and for a user for all their journeys too, and for a group
   const _groupTargets = groupTargets[groupId]?.map(t => ({ 
      ...t, level:"group", date:new Date(t.dateString) 
   })) || [];
   const _userTargets = userTargets[userId]?.map(t => 
      ({ ...t, level:"user", date:new Date(t.dateString) 
   })) || [];
   //user targets overide group targets
   return filterUniqueByProperties(["datasetKey", "statKey", "dateString"], [ ..._groupTargets, ..._userTargets ])
}

export const findDefaultTarget = (targets, datasetKey, statKey, date) => {
   return d3.greatest(targets
      .filter(t => t.datasetKey === datasetKey & t.statKey === statKey)
      //note - target dates are set by day only so time is 00:00 so all targets set to same day
      //as a profile will be included for the profile
      .filter(t => t.date <= date), d => d.date)
}

const generalTargets = [
   //press-ups in 1 min
   {
      datasetKey:"pressUps",
      statKey:"reps",
      dateString:"03/25/2015",
      value:30
   }
];
//note dateString is in short form eg "03/25/2015"
const userTargets = {
   //Lewis
   "606b2f1f3eecde47d8864798":[
      //press-ups in 1 min
      { datasetKey:"pressUps", statKey:"reps", dateString:"09/30/2022", value:30 },
      { datasetKey:"pressUps", statKey:"reps", dateString:"10/31/2022", value:35 },
      { datasetKey:"pressUps", statKey:"reps", dateString:"12/30/2022", value:43 },
      { datasetKey:"pressUps", statKey:"reps", dateString:"02/15/2023", value:55 }
      //shuttles time

   ]
}

const groupTargets = {}
