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


export const LIGHT_COLOUR_THEME = {
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



export const DARK_COLOUR_THEME = {
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



