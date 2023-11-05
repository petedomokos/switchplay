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

export const GREY_COLOUR_THEME = {
    CARDS_TABLE:grey10(9),
    GOLD:"#FFE10A",// brighter #ffd700,   darker #ccad00
    SILVER:grey10(2),
    DECK:{
        HEADER:{
            BG:grey10(8)
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
            if(!isHeld){ return grey10(8); }
            if(isFront || isSelected){ return grey10(3); }
            if(isNext){ return grey10(4); }
            if(isSecondNext){ return grey10(4.5); }
            if(isThirdNext){ return grey10(5); }
            //fourthNext
            return grey10(5.5);
        },
        HEADER:{
            DATE:cardD => {
                const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
                if(!isHeld){ return grey10(8); }
                if(isFront || isSelected){ return grey10(3); }
                if(isNext){ return grey10(4); }
                if(isSecondNext){ return grey10(4.5); }
                if(isThirdNext){ return grey10(5); }
                //fourthNext
                return grey10(5.5);
            },
            DATE_COUNT_WORDS:cardD => {
                const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
                if(!isHeld){ return grey10(8); }
                if(isFront || isSelected){ return grey10(3); }
                if(isNext){ return grey10(4); }
                if(isSecondNext){ return grey10(4.5); }
                if(isThirdNext){ return grey10(5); }
                //fourthNext
                return grey10(5.5);
            },
            TITLE:cardD => {
                const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
                if(!isHeld){ return grey10(8); }
                if(isFront || isSelected){ return grey10(3); }
                if(isNext){ return grey10(4); }
                if(isSecondNext){ return grey10(4.5); }
                if(isThirdNext){ return grey10(5); }
                //fourthNext
                return grey10(5.5);
            },
        },
        SECTION_ID:grey10(6),
        ITEM_TEXT:cardD => {
            const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
            if(!isHeld){ return grey10(8); }
            if(isFront || isSelected){ return grey10(3); }
            if(isNext){ return grey10(4); }
            if(isSecondNext){ return grey10(4.5); }
            if(isThirdNext){ return grey10(5); }
            //fourthNext
            return grey10(5.5);
        },
        //section-view has same colours for each card
        SECTION_VIEW_FILL:grey10(7),
        SECTION_VIEW_STROKE:grey10(5),
        SECTION_VIEW_HEADER:{
            DATE:"",
            DATE_COUNT_WORDS:"",
            TITLE:""
        },
        SECTION_VIEW_ITEM_TEXT:"",
        CARD_BACK:{
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
                if(!isHeld){ return grey10(8); }
                if(isFront || isSelected){ return grey10(3); }
                if(isNext){ return grey10(4); }
                if(isSecondNext){ return grey10(4.5); }
                if(isThirdNext){ return grey10(5); }
                //fourthNext
                return grey10(5.5);
            },
            HEADER:{
                DATE:cardD => {
                    const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
                    if(!isHeld){ return grey10(8); }
                    if(isFront || isSelected){ return grey10(3); }
                    if(isNext){ return grey10(4); }
                    if(isSecondNext){ return grey10(4.5); }
                    if(isThirdNext){ return grey10(5); }
                    //fourthNext
                    return grey10(5.5);
                },
                DATE_COUNT_WORDS:cardD => {
                    const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
                    if(!isHeld){ return grey10(8); }
                    if(isFront || isSelected){ return grey10(3); }
                    if(isNext){ return grey10(4); }
                    if(isSecondNext){ return grey10(4.5); }
                    if(isThirdNext){ return grey10(5); }
                    //fourthNext
                    return grey10(5.5);
                },
                TITLE:cardD => {
                    const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
                    if(!isHeld){ return grey10(8); }
                    if(isFront || isSelected){ return grey10(3); }
                    if(isNext){ return grey10(4); }
                    if(isSecondNext){ return grey10(4.5); }
                    if(isThirdNext){ return grey10(5); }
                    //fourthNext
                    return grey10(5.5);
                },
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
            },
            VIDEO_ICON:""
        }
    }
}

//"#fe9923", //"#ffd700",  //"#FFE10A",// brighter #ffd700,   darker #ccad00
export const BLUE_COLOUR_THEME = {
    CARDS_TABLE:"hsla(211, 96%, 12%, 1)",
    GOLD:"#fe9923", //"#FFE10A",// brighter #ffd700,   darker #ccad00
    SILVER:"#C0C0C0",
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

            /*if(!isHeld){ return `hsla(211, 96%, ${l * (s **)}%, 1)`; }
            if(isFront || isSelected){ return `hsla(211, ${l * (s ** 0)}%, 62%, 1)`; } //alternative...hsla(259, 84%, 78%, 1);
            if(isNext){ return `hsla(211, 96%, 52%, 1)`; }
            if(isSecondNext){ return `hsla(211, 96%, 42%, 1)`; }
            if(isThirdNext){ return `hsla(211, 96%, 32%, 1)`; }
            //fourthNext
            return `hsla(211, 96%, 22%, 1)`;*/
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
        HEADER:{
            DATE:cardD => {
                const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
                if(!isHeld){ return grey10(8); }
                if(isFront || isSelected){ return grey10(3); }
                if(isNext){ return grey10(4); }
                if(isSecondNext){ return grey10(4.5); }
                if(isThirdNext){ return grey10(5); }
                //fourthNext
                return grey10(5.5);
            },
            DATE_COUNT_WORDS:cardD => {
                const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
                if(!isHeld){ return grey10(8); }
                if(isFront || isSelected){ return grey10(3); }
                if(isNext){ return grey10(4); }
                if(isSecondNext){ return grey10(4.5); }
                if(isThirdNext){ return grey10(5); }
                //fourthNext
                return grey10(5.5);
            },
            TITLE:cardD => {
                const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
                if(!isHeld){ return grey10(8); }
                if(isFront || isSelected){ return grey10(3); }
                if(isNext){ return grey10(4); }
                if(isSecondNext){ return grey10(4.5); }
                if(isThirdNext){ return grey10(5); }
                //fourthNext
                return grey10(5.5);
            },
        },
        SECTION_ID:grey10(6),
        ITEM_TEXT:cardD => {
            const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
            if(!isHeld){ return grey10(8); }
            if(isFront || isSelected){ return grey10(3); }
            if(isNext){ return grey10(4); }
            if(isSecondNext){ return grey10(4.5); }
            if(isThirdNext){ return grey10(5); }
            //fourthNext
            return grey10(5.5);
        },
        //section-view has same colours for each card
        SECTION_VIEW_FILL:grey10(7),
        SECTION_VIEW_STROKE:grey10(5),
        SECTION_VIEW_HEADER:{
            DATE:"",
            DATE_COUNT_WORDS:"",
            TITLE:""
        },
        SECTION_VIEW_ITEM_TEXT:"",
        CARD_BACK:{
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
                if(!isHeld){ return grey10(8); }
                if(isFront || isSelected){ return grey10(3); }
                if(isNext){ return grey10(4); }
                if(isSecondNext){ return grey10(4.5); }
                if(isThirdNext){ return grey10(5); }
                //fourthNext
                return grey10(5.5);
            },
            HEADER:{
                DATE:cardD => {
                    const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
                    if(!isHeld){ return grey10(8); }
                    if(isFront || isSelected){ return grey10(3); }
                    if(isNext){ return grey10(4); }
                    if(isSecondNext){ return grey10(4.5); }
                    if(isThirdNext){ return grey10(5); }
                    //fourthNext
                    return grey10(5.5);
                },
                DATE_COUNT_WORDS:cardD => {
                    const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
                    if(!isHeld){ return grey10(8); }
                    if(isFront || isSelected){ return grey10(3); }
                    if(isNext){ return grey10(4); }
                    if(isSecondNext){ return grey10(4.5); }
                    if(isThirdNext){ return grey10(5); }
                    //fourthNext
                    return grey10(5.5);
                },
                TITLE:cardD => {
                    const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
                    if(!isHeld){ return grey10(8); }
                    if(isFront || isSelected){ return grey10(3); }
                    if(isNext){ return grey10(4); }
                    if(isSecondNext){ return grey10(4.5); }
                    if(isThirdNext){ return grey10(5); }
                    //fourthNext
                    return grey10(5.5);
                },
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
            },
            VIDEO_ICON:""
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

export const LIGHT_BLUE_COLOUR_THEME = {
    CARDS_TABLE:"hsla(235, 89%, 70%, 1)",
    GOLD:"#fe9923", //"#ffd700",  //"#FFE10A",// brighter #ffd700,   darker #ccad00
    SILVER:"#808080", //grey10(2),
    DECK:{
        HEADER:{
            BG:grey10(8)
        },
        CONTROLS:"#404040"
    },
    CARD:{
        FILL:cardD => {
            const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
            if(!isHeld){ return grey10(8); }
            if(isFront || isSelected){ return "hsla(191, 83%, 77%, 1)"; }
            if(isNext){ return "hsla(202, 84%, 75%, 1)"; }
            if(isSecondNext){ return grey10(4.5); }
            if(isThirdNext){ return grey10(5); }
            //fourthNext
            return grey10(5.5);
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
        HEADER:{
            DATE:cardD => {
                const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
                if(!isHeld){ return grey10(8); }
                if(isFront || isSelected){ return grey10(3); }
                if(isNext){ return grey10(4); }
                if(isSecondNext){ return grey10(4.5); }
                if(isThirdNext){ return grey10(5); }
                //fourthNext
                return grey10(5.5);
            },
            DATE_COUNT_WORDS:cardD => {
                const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
                if(!isHeld){ return grey10(8); }
                if(isFront || isSelected){ return grey10(3); }
                if(isNext){ return grey10(4); }
                if(isSecondNext){ return grey10(4.5); }
                if(isThirdNext){ return grey10(5); }
                //fourthNext
                return grey10(5.5);
            },
            TITLE:cardD => {
                const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
                if(!isHeld){ return grey10(8); }
                if(isFront || isSelected){ return grey10(3); }
                if(isNext){ return grey10(4); }
                if(isSecondNext){ return grey10(4.5); }
                if(isThirdNext){ return grey10(5); }
                //fourthNext
                return grey10(5.5);
            },
        },
        SECTION_ID:grey10(6),
        ITEM_TEXT:cardD => {
            const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
            if(!isHeld){ return grey10(8); }
            if(isFront || isSelected){ return grey10(3); }
            if(isNext){ return grey10(4); }
            if(isSecondNext){ return grey10(4.5); }
            if(isThirdNext){ return grey10(5); }
            //fourthNext
            return grey10(5.5);
        },
        //section-view has same colours for each card
        SECTION_VIEW_FILL:grey10(7),
        SECTION_VIEW_STROKE:grey10(5),
        SECTION_VIEW_HEADER:{
            DATE:"",
            DATE_COUNT_WORDS:"",
            TITLE:""
        },
        SECTION_VIEW_ITEM_TEXT:"",
        CARD_BACK:{
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
                if(!isHeld){ return grey10(8); }
                if(isFront || isSelected){ return grey10(3); }
                if(isNext){ return grey10(4); }
                if(isSecondNext){ return grey10(4.5); }
                if(isThirdNext){ return grey10(5); }
                //fourthNext
                return grey10(5.5);
            },
            HEADER:{
                DATE:cardD => {
                    const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
                    if(!isHeld){ return grey10(8); }
                    if(isFront || isSelected){ return grey10(3); }
                    if(isNext){ return grey10(4); }
                    if(isSecondNext){ return grey10(4.5); }
                    if(isThirdNext){ return grey10(5); }
                    //fourthNext
                    return grey10(5.5);
                },
                DATE_COUNT_WORDS:cardD => {
                    const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
                    if(!isHeld){ return grey10(8); }
                    if(isFront || isSelected){ return grey10(3); }
                    if(isNext){ return grey10(4); }
                    if(isSecondNext){ return grey10(4.5); }
                    if(isThirdNext){ return grey10(5); }
                    //fourthNext
                    return grey10(5.5);
                },
                TITLE:cardD => {
                    const { isHeld, isSelected, isFront, isNext, isSecondNext, isThirdNext, status } = cardD;
                    if(!isHeld){ return grey10(8); }
                    if(isFront || isSelected){ return grey10(3); }
                    if(isNext){ return grey10(4); }
                    if(isSecondNext){ return grey10(4.5); }
                    if(isThirdNext){ return grey10(5); }
                    //fourthNext
                    return grey10(5.5);
                },
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
            },
            VIDEO_ICON:""
        }
    }
}



