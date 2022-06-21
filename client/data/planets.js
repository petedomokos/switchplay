import * as d3 from 'd3';

export function getPlanetsData(userId){
    //for now, same all users
    return planetsData;
}

export function getGoalsData(linkId){
    //for now, same all users
    if(!linkId) { return planetsData[2].goals; }
    return goals[linkId] || goals["p4-p6"];
}

export function getStarData(userId){
    //for now, same all users
    return starData;
}

//goals for 8 planets, split as follows for 4 months... 1 / 3-1 / 1-1 / 1
const goals = {
    //COMPLETED
    //group 1 to 3
    //incomplete to show just one link
    "p1-p2":[
        createGoal("p1p2-g1", 95, "Shot Acc", "My shots are accurate"), 
        createGoal("p1p2-g2", 70, "Both Feet", "My shots and crosses are good with both feet"), 
        createGoal("p1p2-g3", 60, "1 v 1s", "I am reliable finisher when 1v1 against the keeper")
    ],
    /*
    //fully complete for path
    "p1-p2":[
        createGoal("p1p2-g1", 100, "Shot Acc"), 
        createGoal("p1p2-g2", 100, ""), 
        createGoal("p1p2-g3", 100)
    ],
    */
    "p1-p3":[createGoal("p1p3-g1", 100), createGoal("p1p3-g2", 100), createGoal("p1p3-g3", 100)],
    "p1-p4":[createGoal("p1p4-g1", 100), createGoal("p1p4-g2", 100), createGoal("p1p4-g3", 100)],
    //group 1 to 1
    "p1-p5":[createGoal("p1p5-g1", 100), createGoal("p1p5-g2", 100), createGoal("p1p5-g3", 100)],
    //MIDWAY
    //group 3 to 1
    "p2-p6":[createGoal("p2p6-g1", 60), createGoal("p2p6-g2", 60), createGoal("p2p6-g3", 50)],
    "p3-p6":[createGoal("p3p6-g1", 90), createGoal("p3p6-g2", 70), createGoal("p3p6-g3", 40)],
    "p4-p6":[createGoal("p4p6-g1", 80), createGoal("p4p6-g2", 70), createGoal("p4p6-g3", 60)],
    //group 1 to 1
    "p5-p7":[createGoal("p5p7-g1", 75), createGoal("p5p7-g2", 70), createGoal("p5p7-g3", 30)],
    //NOT STARTED
    "p6-p8":[createGoal("p6p8-g1", 0), createGoal("p6p8-g2", 0), createGoal("p6p8-g3", 0)],
    "p7-p8":[createGoal("p7p8-g1", 0), createGoal("p7p8-g2", 0), createGoal("p7p8-g3", 0)],
}

function createGoal(id, pcScore, label="Both Feet", title="My passes and crosses are good on both feet"){
    return {
        key:"goal-"+1,
        id,
        title,
        label,
        desc:"",
        datasetMeasures:[
            //for now, one per goal
            { 
                datasetId:"606b2f653eecde47d886479a", 
                measureKey:undefined, //will use isMain or first one
                startValue:"7",
                targetValue:"25",
                //for now, just put in the measure properties as mocks
                key:"m1",
                title:"M1",
                order:"highest is best",
                unit:"secs",
                //datapoints will be added here when got from server, embellishing each with a date and value property
                //for now. put in mock
                datapoints:[ 
                    {date:"2021-10-09", value:"" +(7 + pcScore * (25 - 7) / 100)},
                ],
            } 
        ]
    }
}

const starData = {
    id:"star",
    title:"Premier League Regular",
    label:"PL Regular",
    desc:"I am a Premier league regular",
    goals:[
        {
            key:"goal-"+1,
            id:"sg1",
            title:"My passes and crosses are good on both feet",
            label:"Both feet",
            desc:"",
            datasetMeasures:[
                //...
                { datasetId:"606b2f653eecde47d886479a", measureKey:undefined} //will use isMain or first 
            ]
        },
        {
            key:"goal-"+2,
            id:"sg2",
            title:"I am strong",
            label:"Strength",
            desc:"",
            datasetMeasures:[
                //pressups 1 min
                { datasetId:"606b6aef720202523cc3589d", measureKey:undefined} //will use isMain or first
            ]
        },
        {
            key:"goal-"+3,
            id:"sg3",
            title:"I am clinical",
            label:"Clinical",
            desc:"I am clinical, ruthless and direct on the ball. End product always happens and is of good quality",
            datasetMeasures:[
                //Bounce Dribble game
                //measure - score-3 (todo - use dervied measure median of score-1, score-2 and score-3)
                { datasetId:"608c6196285a17514c8147d0", measureKey:"score-3"}
            ]
        },
        {
            key:"goal-"+4,
            id:"sg4",
            title:"I am strong",
            label:"",
            desc:"",
            datasetMeasures:[
                //pressups 1 min
                { datasetId:"...", measureKey:"reps"}
            ]
        }
    ]
}

const planetsData = [
    {
        id:"p6",
        title:"Prem Regular",
        label:"Prem Regular",
        desc:"I am a regular starter in the Prem",
        startDate:"2022-10-07",
        targetDate:"2023-05-07", //YYYY-MM-DD
        goals:[]
    },
    {
        id:"p5",
        title:"Played in Prem",
        label:"Played in Prem",
        desc:"I have played in the Prem",
        startDate:"2022-05-03",
        targetDate:"2022-10-07", //YYYY-MM-DD
        goals:[]
    },
    //p1 will be the 'NEXT' planet - ie its date will be the nearest planet in the future
    {
        id:"p4",
        title:"Signed for Prem",
        label:"Signed for PL",
        desc:"I have signed for a Premier League Club",
        startDate:"2021-08-07",
        targetDate:"2022-05-03", //YYYY-MM-DD
        goals:[
            {
                key:"goal-"+1,
                id:"p4g1",
                title:"My passes and crosses are good on both feet",
                label:"Both feet",
                desc:"",
                datasetMeasures:[
                    //for now, one per goal
                    { 
                        datasetId:"606b2f653eecde47d886479a", 
                        measureKey:undefined, //will use isMain or first one
                        startValue:"7",
                        targetValue:"25",
                        //for now, just put in the measure properties as mocks
                        key:"m1",
                        title:"M1",
                        order:"highest is best",
                        unit:"secs",
                        //datapoints will be added here when got from server, embellishing each with a date and value property
                        //for now. put in mock
                        datapoints:[ 
                            {date:"2021-10-09", value:"9"},
                            {date:"2021-10-25", value:"10"},
                            {date:"2021-11-07", value:"10"}
                        ],
                    } 
                ]
            },
            {
                key:"goal-"+2,
                id:"p4g2",
                title:"I am strong",
                label:"Strength",
                desc:"",
                datasetMeasures:[
                    //for now, one per goal
                    { 
                        datasetId:"606b6aef720202523cc3589d", 
                        measureKey:undefined, //will use isMain or first one
                        startValue:"15",
                        targetValue:"48",
                        //for now, just put in the measure properties as mocks
                        key:"m1",
                        title:"M1",
                        order:"highest is best",
                        unit:"secs",
                        //datapoints will be added here when got from server, embellishing each with a date and value property
                        //for now. put in mock
                        datapoints:[ 
                            {date:"2021-10-09", value:"16"},
                            {date:"2021-10-25", value:"17"},
                            {date:"2021-11-07", value:"23"}
                        ],
                    } 
                ]
            },
            {
                key:"goal-"+3,
                id:"p4g3",
                title:"I am clinical",
                label:"Clinical",
                desc:"I am clinical, ruthless and direct on the ball. End product always happens and is of good quality",
                datasetMeasures:[
                    //for now, one per goal
                    { 
                        datasetId:"608c6196285a17514c8147d0", 
                        measureKey:"score-4",//(todo - use dervied measure median of score-1, score-2 and score-3)
                        startValue:"18",
                        targetValue:"40",
                        //for now, just put in the measure properties as mocks
                        key:"m1",
                        title:"M1",
                        order:"highest is best",
                        unit:"secs",
                        //datapoints will be added here when got from server, embellishing each with a date and value property
                        //for now. put in mock
                        datapoints:[ 
                            {date:"2021-10-09", value:"19"},
                            {date:"2021-10-25", value:"21"},
                            {date:"2021-11-07", value:"22"}
                        ],
                    } 
                ]
            },
            {
                key:"goal-"+4,
                id:"p4g4",
                title:"I eat well",
                label:"Eating",
                desc:"",
                datasetMeasures:[
                    //for now, one per goal
                    { 
                        datasetId:"606b6aef720202523cc3589d", 
                        measureKey:undefined, //will use isMain or first one
                        startValue:"8",
                        targetValue:"35",
                        //for now, just put in the measure properties as mocks
                        key:"m1",
                        title:"M1",
                        order:"highest is best",
                        unit:"secs",
                        //datapoints will be added here when got from server, embellishing each with a date and value property
                        //for now. put in mock
                        datapoints:[ 
                            {date:"2021-10-09", value:"8"},
                            {date:"2021-10-25", value:"7"},
                            {date:"2021-11-07", value:"9"}
                        ],
                    } 
                ]
            }
        ]
    },
    //p2 will be the NOW planet - ie its date will me the most recent planet whose targetDate is in the past
    {
        id:"p3",
        title:"Championship top 3",
        label:"Top 3 Champ",
        desc:"I am one of the top 3 strikers in the Championship",
        startDate:"2021-05-07",
        targetDate:"2021-08-07", //YYYY-MM-DD
        goals:[]
    },
    {
        id:"p2",
        title:"Champ Regular",
        label:"Top 3 Champ",
        desc:"I am a regular starter in the Championship",
        startDate:"2020-05-07", //YYYY-MM-DD
        targetDate:"2021-05-07", //YYYY-MM-DD
        goals:[]
    },
    {
        id:"p1",
        title:"Signed for Champ",
        label:"Top 3 Champ",
        desc:"I have signed for a club in the Championship",
        targetDate:"2020-05-07", //YYYY-MM-DD
        goals:[]
    }
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