import { isNumber } from './dataHelpers';

export function getBandsAndStandards(datasetKey, statKey){
    if(!datasetKey || !statKey){ return null; }
    const datasetBandsAndStandards = bandsAndStandards[datasetKey];
    const emptyDefault = { 
        bands:[ { min:0, max: 10 }], 
        standards:isNumber(minStandards[datasetKey]) ? [ { key:"minimum", label:"Minimum", value:minStandards[datasetKey] }] : [], 
        accuracy:0
    };
    if(!datasetBandsAndStandards) { return emptyDefault; }
    //if statKey not specified, just return entire dataset object, which may have gaps in it
    return statKey ? { ...emptyDefault, ...datasetBandsAndStandards[statKey] } : datasetBandsAndStandards;
}

const minStandards = {
    "sleep":5
}

const bandsAndStandards = {
    //samuel
    //defence
    "plank":{
        "time":{
            bands:[ { min:0, max:120 } ],
            standards:[ { key:"minimum", label:"Minimum", value:120 }],
            accuracy:0
        }
    },
    "bridge":{
        "time":{
            bands:[ { min:0, max:120 } ],
            standards:[ { key:"minimum", label:"Minimum", value:120 }],
            accuracy:0
        }
    },
    "touch":{
        "score":{
            bands:[ { min:0, max:100 } ],
            standards:[ { key:"minimum", label:"Minimum", value:70 }],
            accuracy:0
        }
    },
    //attack
    "standingHighJump":{
        "distance":{
            bands:[ { min:0, max:100 } ],
            standards:[ /*{ key:"minimum", label:"Minimum", value:50 }*/],
            accuracy:1
        }
    },
    "quickFeetWithBall":{
        "total":{
            bands:[ { min:0, max:20 } ],
            standards:[],
            accuracy:1
        }
    },
    //PD personal
    //defence
    "sleep":{
        "hoursPastSleeptime":{
            bands:[ { min:0, max:6 } ],
            //note - minimum standard is actually a maximum value here due to order
            standards:[ { key:"minimum", label:"Minimum", value:1 }],
            accuracy:1
        }
    },
    "meditation":{
        "timeDaily":{
            bands:[ { min:0, max:60 } ],
            standards:[ { key:"minimum", label:"Minimum", value:5 }],
            accuracy:0
        }
    },
    "nourishment":{
        "healthyMealsDaily":{
            bands:[ { min:0, max:3 } ],
            standards:[ { key:"minimum", label:"Minimum", value:3 }],
            accuracy:0
        }
    },
    "organisation":{
        "offTrackTasks":{
            bands:[ { min:0, max:10 } ],
            //note - minimum standard is actually a maximum value here due to order
            standards:[ { key:"minimum", label:"Minimum", value:0 }],
            accuracy:0
        }
    },
    "money":{
        "spendMonthly":{
            bands:[ { min:0, max:3000 } ],
            standards:[ { key:"minimum", label:"Minimum", value:800 }],
            accuracy:0
        }
    },
    //attack
    "fitness":{
        "sessionsWeekly":{
            bands:[ { min:0, max:5 } ],
            standards:[ { key:"minimum", label:"Minimum", value:3 }],
            accuracy:1
        }
    },
    //Switchplay
    //attack
    "users":{
        "active":{
            bands:[ { min:0, max:50 } ],
            standards:[],
            accuracy:0
        }
    },
    "customers":{
        "score":{
            bands:[ { min:0, max:50 } ],
            standards:[],
            accuracy:0
        }
    },
    "network":{
        "score":{
            bands:[ { min:0, max:50 } ],
            standards:[],
            accuracy:0
        }
    },
    //sports 
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