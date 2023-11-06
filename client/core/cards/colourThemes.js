export const grey3pt5 = "#C8C8C8";
export const grey4pt5 = "#B0B0B0";
export const grey5pt5 = "#989898";
export const grey6pt5 = "#787878";
export const grey10pt5 = "#181818";
export const grey8pt5 = "#404040"
export const grey10 = (i) => {
    if(i === 3.5){ return grey3pt5; }
    if(i === 4.5){ return grey4pt5; }
    if(i === 5.5){ return grey5pt5; }
    if(i === 6.5){ return grey6pt5; }
    if(i === 8.5){ return grey8pt5; }
    if(i === 10.5){ return grey10pt5; }
    return ["#FFFFFF", "#E8E8E8","#D3D3D3", "#BEBEBE", "#A8A8A8", "#888888", "#696969", "#505050", "#303030", "#000000"][i-1]
}; 

export const GREY_COLOUR_THEME = {
    CARDS_TABLE:grey10(9),
    GOLD:"#FFE10A",// brighter #ffd700,   darker #ccad00
    SILVER:grey10(2),
    NOT_STARTED_FILL:grey10(6),
    SECTION_VIEW_NOT_STARTED_FILL:grey10(5),
    DECK:{
        STROKE:grey10(8.5),
        HEADER:{
            BG:grey10(8.5)
        },
        CONTROLS:"#404040"
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
            const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
            if(isFront || isSelected){ return grey10(1); }
            if(isNext){ return grey10(2); }
            if(isSecondNext){ return grey10(3); }
            if(isThirdNext){ return grey10(4); }
            //fourthNext
            return grey10(5);
        },
        EXPAND_COLLAPSE_BTN:grey10(5.5),
        HEADER:{
            DATE:cardD => { return grey10(7); },
            DATE_COUNT_WORDS:cardD => { return grey10(7); },
            TITLE:cardD => { return grey10(7) },
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
        FILL:cardD => { return grey10(10.5); },
        STROKE:cardD => { return grey10(5.5); },
        HEADER:{
            DATE:cardD => { return grey10(7); },
            DATE_COUNT_WORDS:cardD => { return grey10(7); },
            TITLE:cardD => { return grey10(7) },
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
}

//"#fe9923", //"#ffd700",  //"#FFE10A",// brighter #ffd700,   darker #ccad00
export const BLUE_COLOUR_THEME = {
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
            const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
            let heldPos;
            if(!isHeld) { heldPos = 4; }
            else if(isFront || isSelected){ heldPos = 0; }
            else if(isNext){ heldPos = 1; }
            else if(isSecondNext){ heldPos = 2; }
            else if(isThirdNext){ heldPos = 3; }
            //isFourthNext or more
            else { heldPos = 4; }
            // lightness, l
            const l = 62 * (deckIsSelected ? 1 : 0.6);
            //shadow factor, s
            const s = 0.9;
            return `hsla(211, 96%, ${l * (s ** heldPos)}%, 1)`;
        },
        STROKE:cardD => {
            const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
            if(!isHeld){ return grey10(8); }
            if(isFront || isSelected){ return grey10(3); }
            if(isNext){ return grey10(4); }
            if(isSecondNext){ return grey10(4.5); }
            if(isThirdNext){ return grey10(5); }
            //fourthNext
            return grey10(5.5);
        },
        EXPAND_COLLAPSE_BTN:grey10(5.5),
        HEADER:{
            DATE:cardD => { return grey10(7); },
            DATE_COUNT_WORDS:cardD => { return grey10(7); },
            TITLE:cardD => { return grey10(7) },
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
        BACK_OF_CARD:{
            FILL:cardD => { return grey10(10.5); },
            STROKE:cardD => { return grey10(5.5); },
            HEADER:{
                DATE:cardD => { return grey10(7); },
                DATE_COUNT_WORDS:cardD => { return grey10(7); },
                TITLE:cardD => { return grey10(7) },
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
    }
}


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

export const SATURATED_BLUE_COLOUR_THEME = {
    CARDS_TABLE:grey10(9),
    GOLD:"#FFE10A",// brighter #ffd700,   darker #ccad00
    SILVER:grey10(2),
    NOT_STARTED_FILL:grey10(6),
    SECTION_VIEW_NOT_STARTED_FILL:grey10(5),
    DECK:{
        STROKE:grey10(8.5),
        HEADER:{
            BG:grey10(8.5)
        },
        CONTROLS:"#404040"
    },
    CARD:{
        FILL:(cardD, deckIsSelected) => {
            const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
            let heldPos;
            if(!isHeld) { heldPos = 4; }
            else if(isFront || isSelected){ heldPos = 0; }
            else if(isNext){ heldPos = 1; }
            else if(isSecondNext){ heldPos = 2; }
            else if(isThirdNext){ heldPos = 3; }
            //isFourthNext or more
            else { heldPos = 4; }
            // lightness, l
            const l = 62 * (deckIsSelected ? 1 : 0.6);
            //shadow factor, s
            const s = 0.9;
            return `hsla(211, 45%, ${l * (s ** heldPos)}%, 1)`; //was 96% saturation in nrmal blue colour scheme
        },
        STROKE:cardD => {
            const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
            if(isFront || isSelected){ return grey10(1); }
            if(isNext){ return grey10(2); }
            if(isSecondNext){ return grey10(3); }
            if(isThirdNext){ return grey10(4); }
            //fourthNext
            return grey10(5);
        },
        EXPAND_COLLAPSE_BTN:grey10(5.5),
        HEADER:{
            DATE:cardD => { return grey10(4); },
            DATE_COUNT_WORDS:cardD => { return grey10(5); },
            TITLE:cardD => { return grey10(4) },
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
        FILL:cardD => { return grey10(10.5); },
        STROKE:cardD => { return grey10(5.5); },
        HEADER:{
            DATE:cardD => { return grey10(7); },
            DATE_COUNT_WORDS:cardD => { return grey10(7); },
            TITLE:cardD => { return grey10(7) },
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
}
    