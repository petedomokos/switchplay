import * as d3 from 'd3';
import { GREY_COLOUR_THEME, BLUE_COLOUR_THEME, SATURATED_BLUE_COLOUR_THEME } from './colourThemes';

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


const getColours = colourTheme => {
    if(colourTheme === "blue"){
        return BLUE_COLOUR_THEME;
    }
    if(colourTheme === "saturatedBlue"){
        return SATURATED_BLUE_COLOUR_THEME;
    }
    return GREY_COLOUR_THEME
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

export const DIMNS = {
    burgerBarWidth:45,
    DECK:{
        HEADER_HEIGHT:25,
        HEADER_SUBTITLE_HEIGHT_PROP:0.3,
        PROGRESS_ICON_WIDTH:20
    }
}
