export const NAVBAR_HEIGHT = 70;

export const MAIN_BANNER_MARGIN_VERT = {
    xs:25,
    sm:25,
    md:25,
    lg:25,
    xl:25
}

export const COLOURS = {
    OFFBLACK:"#1E1E1E",
    OFFWHITE:"",
    banner:{
        bg:"#DBEFF0"

    }
}

export const PEOPLE_WITH_QUOTES = {
    titleHeightPC:{ smDown:25, mdUp:20 }
}

export const grey3pt5 = "#C8C8C8";
export const grey4pt5 = "#B0B0B0";
export const grey5pt5 = "#989898";
export const grey6pt5 = "#787878";
export const grey8pt5 = "#404040";
export const grey9pt15 = "#282828";
export const grey9pt35 = "#202020";
export const grey9pt5 = "#181818";
export const grey9pt75 = "#101010";

export const grey10 = (i) => {
    if(i === 3.5){ return grey3pt5; }
    if(i === 4.5){ return grey4pt5; }
    if(i === 5.5){ return grey5pt5; }
    if(i === 6.5){ return grey6pt5; }
    if(i === 8.5){ return grey8pt5; }
    if(i === 9.15){ return grey9pt15; }
    if(i === 9.35){ return grey9pt35; }
    if(i === 9.5){ return grey9pt5; }
    if(i === 9.75){ return grey9pt75; }
    return ["#FFFFFF", "#E8E8E8","#D3D3D3", "#BEBEBE", "#A8A8A8", "#888888", "#696969", "#505050", "#303030", "#000000"][i-1]
}; 