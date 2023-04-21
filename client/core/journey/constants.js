import * as d3 from 'd3';
import { addWeeks } from '../../util/TimeHelpers';
import { createId } from './helpers';

export const createFutureProfile = (existingProfiles=[]) => {
	const now = new Date();
	const firstFutureProfileDate = addWeeks(4, now);
	firstFutureProfileDate.setHours(22);
	return {
		date:firstFutureProfileDate,
		id:createId(existingProfiles.map(p => p.id), "profile"),
		media:[],
		created:now,
		yPC:"50",
		customTargets:[],
		customExpected:[],
        profileKpis:[],
	}
}
export const createEmptyJourney = user => ({ 
	_id:"temp", 
	profiles:[ createFutureProfile() ],
	contracts:[], aims:[], goals:[], links:[],
	settings:[],
	measures:[], kpis:[], media:[],
	playerId:user.isPlayer ? user._id : null,
	coachId:user.isCoach && !user.isPlayer ? user._id : null,
	groupId: null //todo - this can be an option for a coach
})

export const JOURNEY_SETTINGS_INFO = {
    currentValueDataMethod:{
        label:"Data Method",
        desc:"...",
        valueType:"string",
        positionInCurrentCardSettings:1,
        displayFormat:"buttons",
        options:[
            { key:"currentValueDataMethod", value: "best", label:"BEST", desc:"desc..." },
            { key:"currentValueDataMethod", value: "specificSession",/*defaults to last session*/ label:"SESSION", desc:"desc..." },
            { key:"currentValueDataMethod", value: "latest", label:"LATEST", desc:"desc..." }
        ]
    },
    achievedValueDataMethod:{
        label:"Data Method For Past Cards",
        desc:"...",
        valueType:"string",
        displayFormat:"buttons",
        options:[
            { key:"achievedValueDataMethod", value: "best", label:"BEST", desc:"desc..." },
            { key:"achievedDataMethod", value: "specificSession",/*defaults to last session*/ label:"SESSION", desc:"desc..." },
            { key:"achievedValueDataMethod", value: "latest", label:"LATEST", desc:"desc..." },
        ]
    },
    dataToIncludeInMilestones:{
        label:"Data To Include In Milestones",
        desc:"...",
        valueType:"string",
        positionInCurrentCardSettings:2,
        displayFormat:"buttons",
        options:[
            { key:"dataToIncludeInMilestones", value:"all", label:"All Data", desc:"..." },
            { key:"dataToIncludeInMilestones", value:"fromStart", label:"From Start Date", desc:"..." },
        ]
    },
    dataExpiryTimeNumber:{
        positionInCurrentCardSettings:3,
        label:"Data Expiry Amount",
        desc:"...",
        valueType:"naturalNumber",
        displayFormat:"dropdown",
    },
    dataExpiryTimeUnits:{
        positionInCurrentCardSettings:4,
        label:"Data Expiry Unit",
        desc:"...",
        valueType:"string",
        displayFormat:"dropdown",
        options:[
            //{ key:"dataExpiryTimeUnits", value:"hours", label:"hours" },
            //{ key:"dataExpiryTimeUnits", value:"days", label:"days" },
            { key:"dataExpiryTimeUnits", value:"weeks", label:"weeks" },
            { key:"dataExpiryTimeUnits", value:"months", label:"months" },
            { key:"dataExpiryTimeUnits", value:"years", label:"years" }
        ]
    },
     //note - this does not apply to newly created pastcards - these always use the prevCard date as a start date, 
    //and if no prev card, then 1 month before the card date.
    defaultProfileStartDate:{
        //note - this does not update, it is set at the time of the cards creation
        label:"Default Start Date",
        desc:"...",
        valueType:"string",
        positionInCurrentCardSettings:5,
        displayFormat:"buttons",
        options:[
            //note - fixed means it is set at the time of creation and then doesnt change, 
            //       even if new cards are created, deleted or move from future to past
            //note - both lastPast and chain settings default to creationDate if no pastCard (or no prevcard for chain)
            { key:"defaultProfileStartDate", value: "creationDate", label:"Creation Date", desc:"desc..." },
            { key:"defaultProfileStartDate", value: "lastPastFixed", label:"Most Recent Past Card Date (fixed)", desc:"desc..." },
            { key:"defaultProfileStartDate", value: "lastPastDynamic", label:"Most Recent Past Card Date (dynamic)", desc:"desc..." },
            { key:"defaultProfileStartDate", value: "prevCardFixed",/*defaults to last session*/ label:"Previous Card (fixed)", desc:"desc..." },
            { key:"defaultProfileStartDate", value: "prevCardDynamic",/*defaults to last session*/ label:"Previous Card (dynamic)", desc:"desc..." },
        ]
    },
}

export const JOURNEY_SETTINGS = [
    { key:"defaultProfileStartDate", defaultValue: "creationDate" },
    { key:"currentValueDataMethod", defaultValue: "latest" },
    { key:"achievedValueDataMethod", defaultValue: "latest" },
    { key:"dataExpiryTimeNumber", defaultValue: 2 },
	{ key:"dataExpiryTimeUnits", defaultValue: "months" },
	{ key:"dataToIncludeInMilestones", defaultValue: "all" },
    { key: "progressStatusOnlyIncludesKpisWithTargets", defaultValue: true }
]

export const grey10 = (i) => ["#FFFFFF", "#E8E8E8","#D3D3D3", "#BEBEBE", "#A8A8A8", "#888888", "#696969", "#505050", "#303030", "#000000"][i-1];

//1 = summary, 2 = standard, 3 = detail
export const zoomLevel = k => k < 0.35 ? -1 : k < 1.3 ? 0 : 1;
export const OPEN_CHANNEL_EXT_WIDTH = 50;
export const DEFAULT_D3_TICK_SIZE = 6;
export const DEFAULT_PLANET_RX = 70;
export const DEFAULT_PLANET_RY = 50;
export const PLANET_RING_MULTIPLIER = 1.4;
export const AVAILABLE_GOAL_MULTIPLIER = 2.5;

export const WIDGET_WIDTH = 30;
export const WIDGET_HEIGHT = 40;
export const WIDGET_MARGIN = { left: 0, right: 0, top:5, bottom:5 }

export const OVERLAY = { FILL:"black", OPACITY:0.5 }

export const KPI_CTRLS = displayFormat => [
    { key: "steps", label:"Steps", isSelected: displayFormat === "steps" },
    { key: "stats", label:"Stats", isSelected: displayFormat === "stats" },
    { key: "both", label:"Both", isSelected: displayFormat === "both" }
];
export const GOAL_CTRLS = format => [
];

export const PROFILE_PAGES = [
    { nr:0, key:"goal", label:"Goal", photoDimns:{ width: 1, height: 1} }, 
    { nr: 1, key:"profile", label:"Profile", photoDimns:{ width: 1, height: 1} }
];

//@todo - whats time for in book??? '/api/user/photo/' +user._id +'?'+new Date().getTime()
export const getURLForUser = userId => (photoId, locationKey) => {
    if(!userId || !photoId){
        //if(locationKey){
            //@todo - if we have userId, we could just send aother photo from users library?
            //@todo - use locationKey to send a specific default per location
            //return '/api/users/defaultphoto-${locationKey}'
        //} 
        return '/api/users/defaultphoto'; 
    }
    return `/api/users/photo/${userId}/${photoId}`
}

export const TIME_SETTINGS = {
    YEAR_END : { MONTH:4, DAY_OF_MONTH:31 },
    WEEK_END_DAY:0, //0 = sunday,
    DAY_END_HRS:22
}

export const TRANSITIONS = {
    DEFAULT_DURATIONS:{
        SLIDE:{
            FAST:200,
            MED:400,
            SLOW:600
        },
        FADE:{
            FAST:50,
            MED:200,
            SLOW:400
        }
    },
    KPI:{
        FADE:{
            DURATION:400
        }
    },
    KPIS:{
        AUTO_SCROLL:{
            DURATION:300
        }
    }
}

export const FONTSIZES = {
    ctrls:{
        btn:10
    },
    journey:{
        name:12
    },
    aim:{
        name:{
            min:9,
            standard:11
        },
        centredName:{
            min:9,
            standard:40 //appears when zoom is approx 0.3 so it is scaled down
        }
    },
    planet:{
        name:{
            min:10,
            standard:12
        },

        target:8
    },
    contract:k => ({
        club:8 * k,
        wage:9 * k,
        wageUnit:6 * k
    }),
    profile:k => ({
        info:{
            name:4 * k,
            age:6 * k,
            position: 3 * k,
            date:3 * k
        },
        kpis:{
            name:4 * k,
            values:4 * k,
            ctrls:d3.min([14, 4 * k])
        },
        goal:{
            title:5 * k,
            desc:4 * k,
            ctrls:d3.min([14, 4 * k])
        }
    }),
    menuBar:{
        title:12,
        subtitle:8
    },
    menuBarItem:{
        name:11,
        desc:8,
        targs:10
    }
}

export const STYLES = {
    kpiView:{
        kpis:{
            kpi:{ 
                name: { 
                  stroke:grey10(3)
                },
                bars:{
                  target:{
                    opacity:0.1
                  }
                }
            }
        }
    }
}

export const DIMNS = {
    burgerBarWidth:45,
    journey:{
        margin:{ left:0, right:0, top:0, bottom:0 },
        name:{
            width:100,
            height:25,
            margin:{ left: 15, right: 0, top: 15, bottom: 0 }
        }
    },
    milestonesBar:{
        maxHeight:800,
        //@todo - margins left and right should be 20
        margin:{ left:20, right:20, top:0, bottom:0 },
        PHASE_GAP_MULTIPLE: 0.15,
        list:{
            height:480,
            margin:{ left:0, right:0, top:0, bottom:0 },
        },
        ctrls:{
            width:160,
            height:80
        },
        timeCategory:{
            height:30
        },
    },
    ctrls:{
        btnWidth:130,
        btnHeight:20
    },
    xAxis:{
        height: 60
    },
    menuBar:{
        height:100,
        maxMargin:{ left: 10, right:10, top:10, bottom:10 },
        title:{
            width:50,
            height:20
        },
        btn:{
            width:30,
            height:10,
            gap:5
        }
    },
    menuBarItem:{
        width:100,
        margin:{ left: 5, right: 5, top: 0, bottom: 0 },
        maxMargin:{
            left:10, right:10, top:10, bottom:10
        },
        text:{
            margin:{ left: 2.5, right: 2.5, top: 0, bottom: 0 }
        },
        name:{
            height:20
        },
        targs:{
            minHeight:10
        }


    },
    contract:{
        width:60,
        height:75
    },
    list:{
        item:{
            height:25,
            margin:{ left: 2.5, right: 2.5, top: 2.5, bottom: 2.5 }
        }
    },
    progressBar:{
        maxHeight:140
    },
    profile:{
        width:100,
        height:150,
    },
    planet:{
        width:110,
        height:70
    },
    aim:{
        initWidth:300,
        initHeight:150,
        name:{
            //todo - usethe below, and we have a diff min for centred name.
            width:{
                min:100,
                standard:100
            },
            height:{
                min:25,
                standard:25
            },
            margin: { left: 10, right: 0, top: 10, bottom: 0 }
        },
        centredName:{
            width:{
                min:100,
                standard:100
            },
            height:{
                min:25,
                standard:25
            },
            height:25,
            margin: { left: 10, right: 0, top: 10, bottom: 0 }
        },
        vertPlanetGap:3,
        margin:{ left: 5, right: 5, top: 15, bottom: 5 }
    },
    form:{
        single:{
            width:85,
            height:15
        },
        journeyName:{
            width:180,
            height:15
        }
    }
}
export const COLOURS = {
    canvas:"#F8F8F8",
    planet:"#6495ED",//grey10(5),
    milestone:grey10(2),
    //selectedMilestone:"#375CD4" - this is complemetary blue to the gold of tooltip icons,//"#FFFDFA", //grey10(1),
    selectedMilestone:grey10(1),
    link:grey10(5),
    selected:grey10(2),
    creatingLink:"white",
    potentialLinkPlanet:grey10(3),
    potentialLink:grey10(3),
    barMenuItem:"none",
    selectedBarMenuItem:"white",
    step:{
        bar:grey10(4),
        list:grey10(3)
    },
    btnIcons:{
        default:grey10(5),
        expand: grey10(5),
        collapse: grey10(5)
    },
    tooltipIcons:{
        shinyBall:"#D4AF37",
        shinyCrystalBall:"#D4AF37"

    },
    /*
    canvas:"#FAEBD7",
    planet:grey10(5),
    milestone:grey10(2),
    link:grey10(5),
    selected:grey10(2),
    creatingLink:"white",
    potentialLinkPlanet:grey10(3),
    potentialLink:grey10(3),
    barMenuItem:"none",
    selectedBarMenuItem:"white"
    */
}

export const SMALL_FONT = 9;