import * as d3 from 'd3';

export const TRANSITIONS = {
    SLOW:800,
    //med:400,
    //MED:500,
    MED:500,
    FAST:200,
    VERY_FAST:50
}

export const INFO_HEIGHT_PROPORTION_OF_CARDS_AREA = 0.07;

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

export const FONTSIZES = { 
}

export const STYLES = {
}

export const DIMNS = {
    burgerBarWidth:45,
    DECK:{
        HEADER_HEIGHT:20,
        PROGRESS_ICON_WIDTH:20
    }
}

export const COLOURS = {
    CARDS_TABLE:grey10(9),
    GOLD:"#FFE10A",// brighter #ffd700,   darker #ccad00
    HEADER:{
        BG:grey10(8)
    },
    CARD:{
        FILL:cardD => {
            const { isSelected, isFront, isNext, isSecondNext, status } = cardD;
            if(isFront || isSelected){ return grey10(3); }
            if(isNext){ return grey10(5); }
            if(isSecondNext){ return "#989898"; }
            return (cardD.isHeld ? grey10(6) : grey10(8))
        }
    }
}