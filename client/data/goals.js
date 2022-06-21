import * as d3 from 'd3';

export function getGoals(userId){
    //for now, same all users
    return Goals;
}

const Goals = [
    /*
    {
        key:"goal-"+1,
        id:"goal1",
        name:"My passes and crosses are good on both feet",
        label:"Both feet",
        desc:"",
        datasetMeasures:[
            //...
            { datasetId:"606b2f653eecde47d886479a", measureKey:undefined} //will use isMain or first 
        ]
    },
    */
    {
        key:"goal-"+2,
        id:"goal2",
        name:"I am strong",
        label:"Strength",
        desc:"",
        datasetMeasures:[
            //pressups 1 min
            { datasetId:"606b6aef720202523cc3589d", measureKey:undefined} //will use isMain or first
        ]
    },
    {
        key:"goal-"+3,
        id:"goal3",
        name:"I am clinical",
        label:"Clinical",
        desc:"I am clinical, ruthless and direct on the ball. End product always happens and is of good quality",
        datasetMeasures:[
            //Bounce Dribble game
            //measure - score-3 (todo - use dervied measure median of score-1, score-2 and score-3)
            { datasetId:"608c6196285a17514c8147d0", measureKey:"score-3"}
        ]
    },
    /*
    {
        key:"goal-"+4,
        id:"goal4",
        name:"I am strong",
        label:"",
        desc:"",
        datasetMeasures:[
            //pressups 1 min
            { datasetId:"...", measureKey:"reps"}
        ]
    },
    {
        key:"goal-"+5,
        id:"goal5",
        name:"I am strong",
        label:"",
        desc:"",
        datasetMeasures:[
            //pressups 1 min
            { datasetId:"...", measureKey:"reps"}
        ]
    }
    */
]

//todo - change to using datasetKey
const datasetStartDates = {
    //situps
    "606b2f653eecde47d886479a":undefined,
    //pressups
    "606b6aef720202523cc3589d":undefined
}

export const getStartDate = (dataset) => {
    const overideDate = datasetStartDates[dataset._id]
    if(overideDate){
        return overideDate;
    }
    if(dataset.datapoints[0]){
        return d3.min(dataset.datapoints, d => new Date(d.date))
    }
    return new Date().toString();
}

//"2021-04-05T00:00:00";