import * as d3 from 'd3';

export const JOURNEY_SETTINGS_OPTIONS = [
    //current card format
    { key:"currentValueDataMethod", value: "best", label:"Best", desc:"desc..." },
    { key:"currentValueDataMethod", value: "specificSession",/*defaults to last session*/ label:"Last Session", desc:"desc..." },
    { key:"currentValueDataMethod", value: "latestValue", label:"Latest Value", desc:"desc..." },
    //data expiry unit
    { key:"dataExpiryTimeUnits", value:"hours", label:"hours" },
    { key:"dataExpiryTimeUnits", value:"days", label:"days" },
    { key:"dataExpiryTimeUnits", value:"weeks", label:"weeks" },
    { key:"dataExpiryTimeUnits", value:"months", label:"months" },
    { key:"dataExpiryTimeUnits", value:"years", label:"years" },
    //data expiry value
    { key:"dataExpiryTimeNumber", unit:"integer" },
    //restrict data
    { key:"restrictMilestoneDataToWindow", value:true, label:"True", desc:"..." },
    { key:"restrictMilestoneDataToWindow", value:false, label:"False", desc:"..." },
]

export const JOURNEY_SETTINGS = [
    { key:"currentValueDataMethod", defaultValue: "best" },
    { key:"dataExpiryTimeNumber", defaultValue:2 },
	{ key:"dataExpiryTimeUnits", defaultValue:"months" },
	{ key:"restrictMilestoneDataToWindow", defaultValue:false }
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

export const KPI_CTRLS = format => ([
    { key: "actual", label:"Raw Value", isSelected:format === "actual" },
    { key: "completion", label:"Completion", isSelected:format === "completion" }
]);

export const TIME_SETTINGS = {
    YEAR_END : { MONTH:4, DAY_OF_MONTH:31 },
    WEEK_END_DAY:0, //0 = sunday,
    DAY_END_HRS:22
}

export const TRANSITIONS = {
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
            date:4 * k
        },
        kpis:{
            name:4 * k,
            values:4 * k,
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
    profile:{
        width:100,
        height:150
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
    
    btnIcons:{
        default:grey10(5),
        expand: grey10(5),
        collapse: grey10(5)
    },
    tooltipIcons:{
        shinyBall:"#D4AF37",
        shinyCrystalBall:"#D4AF37"

    }
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