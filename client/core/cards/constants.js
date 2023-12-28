import * as d3 from 'd3';
import { GREY_COLOUR_THEME, BLUE_COLOUR_THEME, SATURATED_BLUE_COLOUR_THEME } from './colourThemes';


export const DECK_SETTINGS = [
    {
        key:"currentValueDataMethod",
        value: "latest",
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
    {
        key:"achievedValueDataMethod",
        value: "mean",
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
    {
        key:"dataToIncludeInCards",
        value: "all",
        label:"Data To Include In Cards",
        desc:"...",
        valueType:"string",
        positionInCurrentCardSettings:2,
        displayFormat:"buttons",
        options:[
            { key:"dataToIncludeInCards", value:"all", label:"All Data", desc:"..." },
            { key:"dataToIncludeInCards", value:"fromStart", label:"From Start Date", desc:"..." },
        ]
    },
    {
        key:"dataExpiryTimeNumber",
        value: 2,
        positionInCurrentCardSettings:3,
        label:"Data Expiry Amount",
        desc:"...",
        valueType:"naturalNumber",
        displayFormat:"dropdown",
    },
    {
        key:"dataExpiryTimeUnits",
        value: "months",
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
    {
        key:"defaultDeckStartDate",
        value: "creationDate",
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
            { key:"defaultDeckStartDate", value: "creationDate", label:"Creation Date", desc:"desc..." },
            { key:"defaultDeckStartDate", value: "lastPastFixed", label:"Most Recent Past Card Date (fixed)", desc:"desc..." },
            { key:"defaultDeckStartDate", value: "lastPastDynamic", label:"Most Recent Past Card Date (dynamic)", desc:"desc..." },
            { key:"defaultDeckStartDate", value: "prevCardFixed",/*defaults to last session*/ label:"Previous Card (fixed)", desc:"desc..." },
            { key:"defaultDeckStartDate", value: "prevCardDynamic",/*defaults to last session*/ label:"Previous Card (dynamic)", desc:"desc..." },
        ]
    },
    {
        key:"cardDateGranularity",
        value:"day",
        label:"Date Granularity On Cards",
        desc:"...",
        valueType:"string",
        displayFormat:"buttons",
        options:[
            { key:"cardDateGranularity", value: "week", label:"Weeks", desc:"desc..." },
            { key:"cardDateGranularity", value: "day", label:"Days", desc:"desc..." },
            { key:"cardDateGranularity", value: "hour", label:"Hours", desc:"desc..." },
            { key:"cardDateGranularity", value: "minute", label:"Minutes", desc:"desc..." },
            { key:"cardDateGranularity", value: "second", label:"Seconds", desc:"desc..." },
        ]
    },
    {
        key:"progressStatusOnlyIncludesKpisWithTargets",
        label:"Only Include Kpis With Targets When Calculating Progress",
        desc:"...",
        valueType:"boolean",
        displayFormat:"buttons",
        options:[
            { key:"progressStatusOnlyIncludesKpisWithTargets", value: true, label:"True", desc:"desc..." },
            { key:"progressStatusOnlyIncludesKpisWithTargets", value: false, label:"False", desc:"desc..." },
        ]
    },
]

export const STATUS_OPTIONS = [
    { key:"status-1", status:1 },
    { key:"status-2", status:2 }
]

export const TRANSITIONS = {
    SLOW:800,
    //med:400,
    //MED:500,
    MED:500,
    FAST:200,
    VERY_FAST:50
}

export const INFO_HEIGHT_PROPORTION_OF_CARDS_AREA = 0.07;

export const grey3pt5 = "#C8C8C8";
export const grey4pt5 = "#B0B0B0";
export const grey5pt5 = "#989898";
export const grey6pt5 = "#787878";
export const grey10 = (i) => {
    if(i === 3.5){ return grey3pt5; }
    if(i === 4.5){ return grey4pt5; }
    if(i === 5.5){ return grey5pt5; }
    if(i === 6.5){ return grey6pt5; }
    return ["#FFFFFF", "#E8E8E8","#D3D3D3", "#BEBEBE", "#A8A8A8", "#888888", "#696969", "#505050", "#303030", "#000000"][i-1]
};

//export const colourTheme = "blue";
export const colourTheme = "saturatedBlue";
//export const colourTheme = "grey";
//export const backgroundColour = "blue"
//export const backgroundColour = "grey"
export const backgroundColour = "dark-grey"


const getColours = colourTheme => {
    if(colourTheme === "blue"){
        return BLUE_COLOUR_THEME(backgroundColour);
    }
    if(colourTheme === "saturatedBlue"){
        return SATURATED_BLUE_COLOUR_THEME(backgroundColour);
    }
    return GREY_COLOUR_THEME(backgroundColour);
}

//todo - get colours in CardsTable and pass down
export const COLOURS = getColours(colourTheme);

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

export const OVERLAY = { FILL:"black", OPACITY:0.5 }

export const TIME_SETTINGS = {
    YEAR_END : { MONTH:4, DAY_OF_MONTH:31 },
    WEEK_END_DAY:0, //0 = sunday,
    DAY_END_HRS:22
}

export const FONTSIZES = { 
    SECTION_ID:3
}

export const STYLES = {
    SECTION_ID_OPACITY:0.5,
    CARD:{
        STROKE_WIDTH:0.5
    }
}

export const DECK_PHOTO_POS = "centre";

export const DIMNS = {
    burgerBarWidth:50,
    CUSTOMER_LOGO_WIDTH:35,
    CUSTOMER_LOGO_HEIGHT:35,
    DECK:{
        ASPECT_RATIO:9/16,
        HEADER_HEIGHT:25,
        HEADER_SUBTITLE_HEIGHT_PROP:0.3,
        PROGRESS_ICON_WIDTH:20
    },
    CARD:{
        ASPECT_RATIO:(62/88) * 1.1 //for normal -> 88/62;
    },
    CONTEXT_MENU:{
        ITEM_WIDTH:30,
        ITEM_HEIGHT:50,
        ITEM_GAP:15
    },
    //cards are scaled up so must be smaller about 3 times
    CARD_CONTEXT_MENU:{
        ITEM_WIDTH:8,
        ITEM_HEIGHT:13.333,
        ITEM_GAP:4
    }
}
