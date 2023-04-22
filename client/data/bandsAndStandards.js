import { isNumber } from './dataHelpers';

export function getBandsAndStandards(datasetKey, statKey){
    if(!datasetKey || !statKey){ return null; }
    const datasetBandsAndStandards = bandsAndStandards[datasetKey];
    const emptyDefault = { 
        bands:[ { min:0, max: 10 }], 
        standards:isNumber(minStandards[datasetKey]) ? [ { key:"minimum", label:"Minimum", value:minStandards[datasetKey] }] : [], 
        accuracy:1 
    };
    if(!datasetBandsAndStandards) { return emptyDefault; }
    //if statKey not specified, just return entire dataset object, which may have gaps in it
    return statKey ? { ...emptyDefault, ...datasetBandsAndStandards[statKey] } : datasetBandsAndStandards;
}

const minStandards = {
    "sleep":5
}

const bandsAndStandards = {
    "pressUps":{
        "reps":{
            bands:[ { min:0, max:120 } ],
            standards:[ { key:"minimum", label:"Minimum", value:20 }],
            accuracy:0
        }
    },
    "shuttles":{
        "time":{
            bands:[ { min:8, max:16 } ],
            accuracy:1
        }
    },
    "longJump":{
        "distance-left":{
            bands:[ { min:3, max:12 } ],
            accuracy:2
        },
        "distance-right":{
            bands:[ { min:3, max:12 } ],
            accuracy:2
        }
    },
    "hurdleJumps1Min":{
        "score":{
            bands:[ { min:20, max:80 } ],
            accuracy:0
        }
    },
    "shootingLeftFoot":{
        "score":{
            bands:[ { min:0, max:10 } ],
            accuracy:0
        }
    },
    "shootingRightFoot":{
        "score":{
            bands:[ { min:0, max:10 } ],
            accuracy:0
        }
    }
}