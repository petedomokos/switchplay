import { addWeeks } from "../util/TimeHelpers"
import { getGoals, getStartDate } from "./goals";

/*
some default configurables are put in for some measures. User has option to change when they select measure
//id is namekey-nrkey-sidekey eg time-1-l, time-1-r or time-0-u
number - 1,2,3,... this can be used to have multiple measures for a dataset of same name eg laps (time) or attempts (distance/time/points)
side - left or right or both

MANUAL - WHEN USER SELECTS, THEY ALSO CHOOSE THESE, ALTHOUYGH SOME DEFAULT VALUES ARE SHOW (eg time min = 0)
numberOrder - highest is best or lowest is best
min
max
*/

const measuresWithUnitOptions = [
	{ 
		key:'time', name : 'Time', initials: "Time", order:'lowest is best', 
	  	unit:'seconds',  /*not part of measure*/unitOptionNames:['seconds', 'minutes', 'hours']
	},
	{ 
		key:'distance', name : 'Distance', initials: "Dist",
		unit:'metres', /*not part of measure*/unitOptionNames:['centimetres', 'metres', 'kilometres', 'yards', 'miles', 'cones']
	},
    { 
		key:'score', name : 'Score', initials: "Score",
		unit:'points', /*not part of measure*/unitOptionNames:['points', 'goals', 'laps', 'reps', 'sets']
	},
    { 
		key:'total', name : 'Total', initials: "Total"
	},
	{ 
		key:'level', name : 'Level', initials: "Level",
		/*not part of measure*/unitOptionNames:[]
	},
    { 
		key:'difficulty', name : 'Difficulty',  initials: "Level",
		/*not part of measure*/unitOptionNames:[]
	},
	//pens default unit is '' ie none
	{ 
		key:'penalties', name : 'Penalties', initials: "Pens", order:'lowest is best',
	  	unitOptionNames:['points', 'seconds', 'goals']
	},
    { 
		key:'attempts', name : 'Attempts', initials: "Atmpts", order:'lowest is best',
	  	unit:'attempts', unitOptionNames:['attempts', 'reps', 'passes', 'shots']
	}
]

export const getAvailableMeasures = () => {
    let configDefaults = {};
    Object.keys(measureConfig).forEach(key =>{
        configDefaults[key] = measureConfig[key].default;
    })
    return measuresWithUnitOptions.map(m => {
        //remove unitOptions from measure
        const { unitOptionNames, ...measure } = m;
        return{
            ...configDefaults,
            ...measure
        }
    })
}

export const units = [
	{name:'seconds', initials:'s'},
	{name:'minutes', initials:'min'},
	{name:'hours', initials:'hrs'},
	{name:'centimetres', initials:'cm'},
	{name:'metres', initials:'m'},
	{name:'kilometres', initials:'km'},
    {name:'yards', initials:'yds'},
    {name:'miles', initials:'mls'},
    {name:'cones', initials:'cns'}, //note 10 cones = 189cm
	{name: 'points', initials:'pts'},
	{name: 'goals', initials:'gls'},
    {name: 'laps', initials:'laps'},
	{name: 'reps', initials:'reps'},
    {name: 'sets', initials:'sets'},
    {name: 'attempts', initials:'atmps'},
    {name: 'passes', initials:'passes'},
    {name: 'shots', initials:'shots'}
]

const getUnitOptions = measureKey =>{
    const measure = measuresWithUnitOptions.find(m => m.key === measureKey);
    //if measure specifies unit options, return only those
    if(measure.unitOptionNames){
        return units.filter(opt => measure.unitOptionNames.includes(opt.name))
    }
    //else return all
    return units;
}

//Name, Number, Side and Custom Label uniquely identifies the measure within any dataset. Thsi combination of 4 cannot be identical for 2
//measures in the same dataset.
//The id is just m1,m2,m3 etc, which combines with datasetId to give a uId throughout the entire app.
//name is displayed as Primary Text = name, Secondary Text = Side Number
// eg Time (Left) would be if nr is "none". also side = "unspecified" shows as "" 
// - so if its number = 0 and side unspecified, the secondary Text = "" ie we just see primary text
//so if user just wants a custom name eg Score Volleys, then it will have id score-U-0-Volleys
//whereas if they want left volleys, then its score-L-0-Volleys
//custome names have spaces replaced with -

//also, each measure is given an id which is datasetId-m1, datasetId-m2, etc and 
//when typing in a formula for a custom measure, we can us the last part of is eg m1 + m2 / 3  [use d for divided by if there are html issues]
//for custom measure, key is name with spaces replaced by _ (not - as user may use that in a name)

//defaults can be overridden in a measure ( see measures object above -> for time, default is set to "lowest is best")

const measureConfig = {
    nr:{
		name:"Number", options:["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], default:""
	},
	side:{
		name:"Side", options:["", "left", "right"], default:""
	},
	custom:{
		name:"Custom Label", valueType:"string", default:""
	},
	unit:{
		name:"Unit", options:[""], default:""
	},
	order:{
		name:"Order", options:["highest is best", "lowest is best"], default:"highest is best"
	},
	min:{
		name:"Minimum", valueType:"number", default:"0"
	},
	max:{
		name:"Maximum", valueType:"number", default:""
	},
    notes:{
		name:"Notes", valueType:"string", default:""
	},
    hidden:{
        name:"Hide", valueType:"boolean", default:false, options:[false, true]
    },
    isMain:{
        name:"Is Main Measure", valueType:"boolean", default:false, options:[false, true]
    }
}

export const getMeasureConfigForForm = (measureKey) => ({
        ...measureConfig,
        //amend the unit config by adding specific options
        unit:{
            ...measureConfig.unit,
            options:getUnitOptions(measureKey).map(opt => opt.name)
        }
})
	

const templates = [
    {
        name:"median",
        of:[]
    },
    {
        name:"fraction",
        numerator:[],
        denominator:[],
        as:{
            default:"normal fraction", options:["normal fraction", "simplest form", "percentage", "decimal"]
        }
    },
    {
        name:"formula",
        numerator:[],
        denominator:[],
        as:{
            default:"normal fraction", options:["normal fraction", "simplest form", "percentage", "decimal"]
        }
    },
    {
        name:"Target Completion", id:"targetComp", start:"", end:"",
        desc:"Shows the journey from start score (shown as 0%) to target score (shown as 100%) as a percentage. This can also be compared against where they should be if they were on track to meet their target, given teh dates of teh start and end"
    },
    {
        name:"Precentage of Target", id:"targetComp",
        desc:"Shows current score as a percentage of next target"
    },
    {
        name:"On/Off Track", id:"onTrack", start:"", end:"", trackedMeasure:"",
        //trackedMeasure specifes which other measure (could be a raw or dervied one) is being used to calculate this
        //note - could even be multiple onTrack nmeasures fro 1 dset, with different trckedmeasures
        //so the dsetId, the measure id, and the tracked measure combine to uniquely identify an onTrack measure
        desc:"Shows how much the player is on or off track w.r.t. there next target for this dataset. ) means they are exactly on track to meet target by the target date"
    },
    {
        name:"Chronic Upper Bound",
        desc:"This is 1.2 times the mean average of the total for for the previous 4 datapoints. Usually used for 1 datapoint per week."
    },
    {
        name:"Chronic Super Upper Bound",
        desc:"This is 1.5 times the mean average of the total for for the previous 4 datapoints. Usually used for 1 datapoint per week."
    },
    {
        name:"Chronic Lower Bound",
        desc:"This is 0.8 times the mean average of the total for for the previous 4 datapoints. Usually used for 1 datapoint per week."
    },
    {
        name:"Chronic Super Lower Bound",
        desc:"This is 0.5 times the mean average of the total for for the previous 4 datapoints. Usually used for 1 datapoint per week."
    }

]

const createMeasure = measureObject => { //.there is a better word than object to describe the make up

}

//note - if no tunit, it is worked out from the measures that it is derived from eg speed = m/s
export const derivedMeasures = {
    //long jump
    "608c595b285a17514c8147bc":[
        {
            name:"Mean Score", side:"", nr:"", custom:"", unit:"points", label:"Score", desc:"", isMain:true,
            formula:{
                type:"mean",
                of:[
                    "distance-left",
                    "distance-right",
                    "distance-left-lateral",
                    "distance-right-lateral"
                ]
            }
        }
    ],
     //med ball throw
     "608fffec1871db342cf3d58f":[
        {
            name:"Mean Score", side:"", nr:"", custom:"", unit:"points", label:"Score", desc:"", isMain:true,
            formula:{
                type:"mean",
                of:[
                    "distance-left",
                    "distance-right",
                    "distance-chest"
                ]
            }
        }
    ],
    //long pass left foot
    /*"609005fa1871db342cf3d5c0":[
        {
            name:"Mean Score", side:"", nr:"", custom:"", unit:"points", label:"Score", desc:"", isMain:true,
            formula:{
                type:"mean",
                of:[

                    //???
                ]
            }
        }
    ],
    //long pass left foot
    "609005fa1871db342cf3d5c0":[
        {
            name:"Mean Score", side:"", nr:"", custom:"", unit:"points", label:"Score", desc:"", isMain:true,
            formula:{
                type:"mean",
                of:[

                    //???
                ]
            }
        }
    ],
    */
    //long pass right mixed
    "60958ece51e4122608e96f16":[
        {
            name:"Percentage", side:"", nr:"", custom:"", unit:"%", label:"Score", desc:"", isMain:true,
            formula:{
                type:"percentage",
                //note - val 1 is numerator, val2 is denom
                of:["score", "attempts"]
            }
        }
    ],

    //Dribble and shot
    "6090123265f6760a6093a25a":[
        {
            name:"Median Score", key:"median", side:"", nr:"", custom:"", unit:"points", label:"Score", desc:"",
            formula:{
                type:"median",
                of:[
                    "score-1",
                    "score-2",
                    "score-3"
                ]
            }
        },
        {
            name:"Mean Score", key:"mean", side:"", nr:"", custom:"", unit:"points", label:"Score", desc:"", isMain:true,
            formula:{
                type:"mean",
                of:[
                    "score-1",
                    "score-2",
                    "score-3"
                ]
            }
        }
    ],
    //Control and Dribble
     "6090127165f6760a6093a25e":[
        {
            name:"Median Score", key:"median", side:"", nr:"", custom:"", unit:"points", label:"Score", desc:"",
            formula:{
                type:"median",
                of:[
                    "score-1",
                    "score-2",
                    "score-3"
                ]
            }
        },
        {
            name:"Mean Score", key:"mean", side:"", nr:"", custom:"", unit:"%", label:"Score", desc:"", isMain:true,
            formula:{
                type:"mean",
                of:[
                    "score-1",
                    "score-2",
                    "score-3"
                ]
            }
        }
    ],
    //options
    "609012a965f6760a6093a262":[
        {
            name:"Median Score", key:"median", side:"", nr:"", custom:"", unit:"%", label:"Score", desc:"",
            formula:{
                type:"median",
                of:[
                    "score-1",
                    "score-2",
                    "score-3"
                ]
            }
        },
        {
            name:"Mean Score", key:"mean", side:"", nr:"", custom:"", unit:"%", label:"Score", desc:"", isMain:true,
            formula:{
                type:"mean",
                of:[
                    "score-1",
                    "score-2",
                    "score-3"
                ]
            }
        }
    ],
    //keep ball 1 v 1 
    "6090154f65f6760a6093a275":[
        {
            name:"Score", key:"score", side:"", nr:"", custom:"", unit:"points", label:"Score", desc:"",
            formula:{
                type:"difference",
                of:[ 
                    {
                        type:"sum",
                        of:[
                            "score-left-taking-ball",
                            "score-right-taking-ball",
                        ]
                    },
                    {
                        type:"sum",
                        of:[
                            "score-left-keeping-ball",
                            "score-right-keeping-ball",
                        ]
                    }
                ]
            }
        }
    ],
    //game shot %
    /*"...":[
        {
            name:"Shot Percentage", side:"left", nr:"", custom:"", unit:"%", label:"Shot %", desc:"",
            formula:{
                type:"percentage", //for %, array[0] is numerator, array[1] is denominator
                of:[
                    "goals-left",
                    {
                        type:"sum", //for sum, of is just array of values to add
                        of:[
                            "goals-left", "nongoals-left"
                        ]
                    }
                ]
            }
        },
        {
            name:"Shot Percentage", side:"right", nr:"", custom:"", unit:"%", label:"Shot %", desc:"",
            formula:{
                type:"percentage", //for %, array[0] is numerator, array[1] is denominator
                of:[
                    "goals-right",
                    {
                        type:"sum", //for sum, of is just array of values to add
                        of:[
                            "goals-right", "nongoals-right"
                        ]
                    }
                ]
            }
        },
        {
            name:"Shot Percentage", side:"", nr:"", custom:"", unit:"%", label:"Shot %", desc:"",
            formula:{
                type:"percentage", //for %, array[0] is numerator, array[1] is denominator
                of:[
                    {
                        type:"sum", //for sum, of is just array of values to add
                        of:[
                            "goals-leftt", "goals-right"
                        ]
                    },
                    {
                        type:"sum", //for sum, of is just array of values to add
                        of:[
                            "goals-leftt", "goals-right", "nongoals-leftt", "nongoals-right"
                        ]
                    }
                ]
            }
        },
    ]*/
}

export function hydrateDataset(dataset){
    const derivedMeasures = getDerivedMeasures(dataset);
    const datapoints = dataset.datapoints.map(d => ({
        ...d,
        values:[...d.values, getDerivedValues(d, derivedMeasures)]
    }));
    return 


}


export function getDerivedMeasures(dataset){
    const measureSchemas = derivedMeasures[dataset._id];
    if(!measureSchemas){
        return [];
    }
    return measureSchemas.map(schema => hydrateMeasure(schema));
}

export function getDerivedValues(datapoint, derivedMeasures=[]){
    return derivedMeasures.map(derivedMeasure => ({
        measure:derivedMeasure._id,
        value:calcDerivedValue(derivedMeasure, datapoint),
        //fake an id - probably dont need anyway - > @TODO - move to using only key for measures and values in dataviz
        _id:new Date.getTime() + ""
    }))
}

function calcDerivedValue(schema, dataset){
    switch(schema.formula.type){
        case "mean":{
            return 0;
        }
        case "median":{
            return 1;
        }
        default: return 0
    }
}

export const toCamelCase = str =>{
    if(str.length === 0) {return str; };
    return str.split(" ").map((word,i) => {
        if(i === 0){
            return str.toLowerCase();
        }
        return str[0].toUpperCase() + str.substring(1);
    })
    .join("")
}

const capitalize = str => {
    if(!str) {return "";}
    return str[0].toUpperCase() + str.substring(1, str.length)
}

const capitalizeAndSpace = str => {
    if(!str){ return "";}
    return capitalize(str) + " "
}

const space = str => str ? str + " " : "";

export function hydrateMeasure(measure){
    const { name, key, side, nr, custom } = measure;
    const newKey = [key, side, nr, custom]
        .filter(part => part)
        .join("-");

    const newName = side || nr || custom ? name + " - " +capitalizeAndSpace(side) +space(nr) + capitalize(custom) : name;

    return {
        ...measure,
        key:newKey,
        name:newName,
        //use key for id for derived measures (raw measures have _id set on server)
        _id:measure._id || newKey
    }
}

