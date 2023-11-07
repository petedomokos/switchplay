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


const getTableAndDeckColours = bgColour => {
    if(bgColour === "dark-grey"){ return { table: grey10(9.5), deck:grey10(9.15) } }
    if(bgColour === "blue"){ return { table:"hsla(211, 45%, 10%, 1)", deck:"hsla(211, 45%, 15%, 1)" } }
    return { table: grey10(9), deck:grey10(8.5) }
}

const calcCardHeldPos = cardD => {
    const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
    if(!isHeld) { return 4; }
    else if(isFront || isSelected){ return 0; }
    else if(isNext){ return 1; }
    else if(isSecondNext){ return 2; }
    else if(isThirdNext){ return 3; }
    //isFourthNext or more
    else { return 4; }
}

//shadow factor, s
const cardsShadowFactor = 0.9;

export const GREY_COLOUR_THEME = (backgroundColour) => ({
    CARDS_TABLE:getTableAndDeckColours(bgColour).table,
    GOLD:"#FFE10A",// brighter #ffd700,   darker #ccad00
    SILVER:grey10(2),
    NOT_STARTED_FILL:grey10(6),
    SECTION_VIEW_NOT_STARTED_FILL:grey10(5),
    DECK:{
        STROKE:getTableAndDeckColours(bgColour).deck,
        HEADER:{
            BG:getTableAndDeckColours(bgColour).deck
        },
        CONTROLS:getTableAndDeckColours(bgColour).deck
    },
    CARD:{
        FILL:cardD => {
            const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
            if(!isHeld){ return grey10(8); }
            if(isFront || isSelected){ return grey10(3); }
            if(isNext){ return grey10(4); }
            if(isSecondNext){ return grey10(4.5); }
            if(isThirdNext){ return grey10(5); }
            //fourthNext
            return grey10(5.5);
        },
        STROKE:cardD => {
            const heldPos = calcCardHeldPos(cardD);
            return `hsla(0, 0%, ${80 * (cardsShadowFactor ** heldPos)}%, 1)`;
        },
        EXPAND_COLLAPSE_BTN:grey10(5.5),
        HEADER:cardD => {
            const heldPos = calcCardHeldPos(cardD);
            return {
                DATE:`hsla(0, 0%, ${80 * (cardsShadowFactor ** heldPos)}%, 1)`,
                DATE_COUNT_WORDS:`hsla(0, 0%, ${70 * (cardsShadowFactor ** heldPos)}%, 1)`,
                TITLE: `hsla(0, 0%, ${80 * (cardsShadowFactor ** heldPos)}%, 1)`
            }
        },
        SECTION_VIEW_HEADER:{
            DATE:grey10(5),
            DATE_COUNT_WORDS:grey10(5),
            TITLE:grey10(6)
        },
        SECTION_ID:grey10(6),
        ITEM_TEXT:grey10(7),
        ITEM_ATTACHMENT:grey10(6),
        //section-view has same colours for each card
        SECTION_VIEW_FILL:grey10(7),
        SECTION_VIEW_STROKE:grey10(5),
        SECTION_VIEW_ITEM_TEXT:grey10(2)
    },
    BACK_OF_CARD:{
        FILL:cardD => { return grey10(9.75); },
        STROKE:cardD => { return grey10(5.5); },
        HEADER:cardD => {
            return {
                DATE:grey10(7),
                DATE_COUNT_WORDS:grey10(7),
                TITLE: grey10(7)
            }
        },
        SECTION_VIEW_HEADER:{
            DATE:grey10(5),
            DATE_COUNT_WORDS:grey10(5),
            TITLE:grey10(8)
        },
        KPIS:{
            TITLE:"",
            SUBTITLE:"",
            BAR:{
                LINE:"",
                CURRENT:"",
                EXPECTED:"", //red - will be completely covered if target achieved
                TARGET:"",
                NUMBER_ON_TRACK:"",
                NUMBER_OFF_TRACK:""
            }
        }
    }
})

//"#fe9923", //"#ffd700",  //"#FFE10A",// brighter #ffd700,   darker #ccad00
export const BLUE_COLOUR_THEME = (backgroundColour) => ({
    CARDS_TABLE:"hsla(211, 96%, 12%, 1)",
    GOLD:"#fe9923", //"#FFE10A",// brighter #ffd700,   darker #ccad00
    SILVER:"#C0C0C0",
    NOT_STARTED_FILL:grey10(6),
    SECTION_VIEW_NOT_STARTED_FILL:grey10(5),
    DECK:{
        STROKE:"hsla(211, 96%, 18%, 1)",
        HEADER:{
            BG:"hsla(211, 96%, 18%, 1)"
        },
        CONTROLS:"#404040"
    },
    CARD:{
        FILL:(cardD, deckIsSelected) => {
            const heldPos = calcCardHeldPos(cardD);
            // lightness, l
            const l = 62 * (deckIsSelected ? 1 : 0.6);
            return `hsla(211, 96%, ${l * (cardsShadowFactor ** heldPos)}%, 1)`;
        },
        STROKE:cardD => {
            const heldPos = calcCardHeldPos(cardD);
            return `hsla(0, 0%, ${80 * (cardsShadowFactor ** heldPos)}%, 1)`;
        },
        EXPAND_COLLAPSE_BTN:grey10(5.5),
        HEADER:cardD => {
            const heldPos = calcCardHeldPos(cardD);
            return {
                DATE:`hsla(0, 0%, ${80 * (cardsShadowFactor ** heldPos)}%, 1)`,
                DATE_COUNT_WORDS:`hsla(0, 0%, ${70 * (cardsShadowFactor ** heldPos)}%, 1)`,
                TITLE: `hsla(0, 0%, ${80 * (cardsShadowFactor ** heldPos)}%, 1)`
            }
        },
        SECTION_VIEW_HEADER:{
            DATE:grey10(5),
            DATE_COUNT_WORDS:grey10(5),
            TITLE:grey10(6)
        },
        SECTION_ID:grey10(4),
        ITEM_TEXT:grey10(2),
        ITEM_ATTACHMENT:grey10(3),
        //section-view has same colours for each card
        SECTION_VIEW_FILL:grey10(7),
        SECTION_VIEW_STROKE:grey10(5),
        SECTION_VIEW_ITEM_TEXT:grey10(2),
    },
    BACK_OF_CARD:{
        FILL:cardD => { return grey10(9.75); },
        STROKE:cardD => { return grey10(5.5); },
        HEADER:cardD => {
            return {
                DATE:grey10(4),
                DATE_COUNT_WORDS:grey10(5),
                TITLE: grey10(4)
            }
        },
        SECTION_VIEW_HEADER:{
            DATE:grey10(5),
            DATE_COUNT_WORDS:grey10(5),
            TITLE:grey10(8)
        },
        KPIS:{
            TITLE:"",
            SUBTITLE:"",
            BAR:{
                LINE:"",
                CURRENT:"",
                EXPECTED:"", //red - will be completely covered if target achieved
                TARGET:"",
                NUMBER_ON_TRACK:"",
                NUMBER_OFF_TRACK:""
            }
        }
    }
})


/* SCSS HSL */
/*
$ice-blue: hsla(177, 87%, 79%, 1);
$non-photo-blue: hsla(191, 83%, 77%, 1);
$light-sky-blue: hsla(202, 84%, 75%, 1);
$jordy-blue: hsla(212, 86%, 74%, 1);
$vista-blue: hsla(220, 87%, 73%, 1);
$cornflower-blue: hsla(228, 89%, 72%, 1);
$medium-slate-blue: hsla(235, 89%, 70%, 1);
*/

export const SATURATED_BLUE_COLOUR_THEME = (bgColour) => ({
    CARDS_TABLE:getTableAndDeckColours(bgColour).table,
    GOLD:"#FFE10A",// brighter #ffd700,   darker #ccad00
    SILVER:grey10(2),
    NOT_STARTED_FILL:grey10(6),
    SECTION_VIEW_NOT_STARTED_FILL:"blue",//grey10(5),
    DECK:{
        STROKE:getTableAndDeckColours(bgColour).deck,
        HEADER:{
            BG:getTableAndDeckColours(bgColour).deck
        },
        CONTROLS:getTableAndDeckColours(bgColour).deck
    },
    CARD:{
        FILL:(cardD, deckIsSelected) => {
            const heldPos = calcCardHeldPos(cardD);
            // lightness, l
            const l = 62 * (deckIsSelected ? 1 : 0.6);
            return `hsla(211, 35%, ${l * (cardsShadowFactor ** heldPos)}%, 1)`; //was 96% saturation in nrmal blue colour scheme
        },
        STROKE:cardD => {
            const heldPos = calcCardHeldPos(cardD);
            return `hsla(0, 0%, ${80 * (cardsShadowFactor ** heldPos)}%, 1)`;
        },
        EXPAND_COLLAPSE_BTN:grey10(5.5),
        HEADER:cardD => {
            const heldPos = calcCardHeldPos(cardD);
            return {
                DATE:`hsla(0, 0%, ${80 * (cardsShadowFactor ** heldPos)}%, 1)`,
                DATE_COUNT_WORDS:`hsla(0, 0%, ${70 * (cardsShadowFactor ** heldPos)}%, 1)`,
                TITLE: `hsla(0, 0%, ${80 * (cardsShadowFactor ** heldPos)}%, 1)`
            }
        },
        SECTION_VIEW_HEADER:{
            DATE:grey10(5),
            DATE_COUNT_WORDS:grey10(5),
            TITLE:grey10(6)
        },
        SECTION_ID:grey10(4),
        ITEM_TEXT:grey10(2),
        ITEM_ATTACHMENT:grey10(3),
        //section-view has same colours for each card
        SECTION_VIEW_FILL:grey10(7),
        SECTION_VIEW_STROKE:grey10(5),
        SECTION_VIEW_ITEM_TEXT:grey10(2)
    },
    BACK_OF_CARD:{
        FILL:cardD => { return grey10(9.75); },
        STROKE:cardD => { return grey10(5.5); },
        HEADER:cardD => {
            return {
                DATE:grey10(4),
                DATE_COUNT_WORDS:grey10(5),
                TITLE: grey10(4)
            }
        },
        SECTION_VIEW_HEADER:{
            DATE:grey10(5),
            DATE_COUNT_WORDS:grey10(5),
            TITLE:grey10(8)
        },
        KPIS:{
            TITLE:"",
            SUBTITLE:"",
            BAR:{
                LINE:"",
                CURRENT:"",
                EXPECTED:"", //red - will be completely covered if target achieved
                TARGET:"",
                NUMBER_ON_TRACK:"",
                NUMBER_OFF_TRACK:""
            }
        }
    }
})
    