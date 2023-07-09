import * as d3 from 'd3';

export const grey10 = (i) => ["#FFFFFF", "#E8E8E8","#D3D3D3", "#BEBEBE", "#A8A8A8", "#888888", "#696969", "#505050", "#303030", "#000000"][i-1];

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

export const TRANSITIONS = {
    DEFAULT_DURATIONS:{
        SLIDE:{ FAST:200, MED:400, SLOW:600 },
        FADE:{ FAST:50, MED:200, SLOW:400 }
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
}

export const STYLES = {
}

export const DIMNS = {
    burgerBarWidth:45,
}

export const COLOURS = {
    GOLD:"#FFE10A"// brighter #ffd700,   darker #ccad00
}