export function getBandsAndStandards(datasetKey, statKey){
    const datasetBandsAndStandards = bandsAndStandards[datasetKey];
    const emptyDefault = { bands:[], standards:[] };
    if(!datasetBandsAndStandards) { return emptyDefault; }
    //if statKey not specified, just return entire dataset object, which may have gaps in it
    return statKey ? { ...emptyDefault, ...datasetBandsAndStandards[statKey] } : datasetBandsAndStandards;
}

const bandsAndStandards = {
    "pressUps":{
        "reps":{
            bands:[ { min:0, max:100 } ],
            standards:[ { name:"minimum", value:20 }]
        }
    }
}