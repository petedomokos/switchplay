import { grey10 } from "./cards/constants"

export const sceneElements = {
    //s1
    1:{
        key:"s1",
        lineStyles:{ 
            getX:() => 0, getY:() => 0,
            case:"lower", fontFamily:"helvetica", fontSize:30, strokeWidth:2, stroke:"blue", fill:"blue",
            textAnchor:"start", dominantBaseline:"hanging"
        },
        lines:[
            { text:"Let us tell you a story" }
        ],
        1:{ 
            lines:[0]
        }
    },
    //s2
    2:{
        key:"heroes",
        title: "THE HEROES",
        heroX:(d,i,dimns) => 0,
        heroY:(d,i,dimns) => i * dimns.heroHeight,
        1:{
        },
        2:{
            heroes:[0], 
        },
        3:{
            heroes:[0,1], 
        },
        4:{
            heroes:[0,1,2], 
        },
        5:{
            heroes:[0,1,2,3], 
        }
    },
    3:{
        key:"landscape",
        title: "THE LANDSCAPE",
        characterX:(d,i,dimns) => dimns.contentsWidth - dimns.characterWidth,
        characterY:(d,i, dimns) => i * (dimns.characterHeight + dimns.vertGapBetweenCharacters),
        1:{
        },
        2:{
            characters:[0], 
        },
        3:{
            characters:[0,1], 
        },
        4:{
            characters:[0,1,2], 
        },
        5:{
            characters:[0,1,2,3], 
        },
        6:{
            characters:[0,1,2,3,4], 
        },
        7:{
            characters:[0,1,2,3,4,5], 
        }
    },
    4:{
        key:"quest-quotes",
        title: "THE QUEST",
        heroX:(d,i,dimns) => 0,
        heroY:(d,i,dimns) => i * dimns.heroHeight,
        1:{
        },
        2:{
            heroes:[0,1,2,3], 
            heroBubbles:[0],
        },
        3:{
            heroes:[0,1,2,3], 
            heroBubbles:[0,1],
        },
        4:{
            heroes:[0,1,2,3], 
            heroBubbles:[0,1,2],
        },
        5:{
            heroes:[0,1,2,3], 
            heroBubbles:[0,1,2,3],
        }
    },
    //need to fix scenes 5 onwards, not as expected. also, remove communication from characters, it is int he atmospehere, see diagram
    5:{
        key:"quest-messy",
        lineStyles:{ 
            getX:() => 0, getY:() => 0,
            case:"lower", fontFamily:"helvetica", fontSize:30, strokeWidth:2, stroke:"blue", fill:"blue",
            textAnchor:"start", dominantBaseline:"hanging"
        },
        lines:[
            { 
                text:"Could they change a messy process...", 
            }, 
        ],
        heroX:(d,i,dimns) => 0,
        heroY:(d,i,dimns) => i * dimns.heroHeight,
        characterX:(d,i,dimns) => dimns.contentsWidth - dimns.characterWidth,
        characterY:(d,i, dimns) => i * (dimns.characterHeight + dimns.vertGapBetweenCharacters),
        1:{
            lines:[0],
            heroes:[0,1,2,3],
            characters:[0,1,2,3,4,5], 
        },
        2:{
            //add messy line and communication word
            lines:[0],
            heroes:[0,1,2,3],
            characters:[0,1,2,3,4,5], 
        }
    },
    6:{
        key:"quest-smooth",
        lineStyles:{ 
            getX:() => 0, getY:() => 0,
            case:"lower", fontFamily:"helvetica", fontSize:30, strokeWidth:2, stroke:"blue", fill:"blue",
            textAnchor:"start", dominantBaseline:"hanging"
        },
        lines:[
            { 
                text:"into something better?", 
            }, 
        ],
        heroX:(d,i,dimns) => 0,
        heroY:(d,i,dimns) => i * dimns.heroHeight,
        characterX:(d,i,dimns) => dimns.contentsWidth - dimns.characterWidth,
        characterY:(d,i, dimns) => i * (dimns.characterHeight + dimns.vertGapBetweenCharacters),
        1:{
            lines:[0],
            heroes:[0,1,2,3],
            characters:[0,1,2,3,4,5], 
        },
        2:{
            lines:[0],
            waves:[0],
            heroes:[0,1,2,3],
            characters:[0,1,2,3,4,5], 
        },
        3:{
            lines:[0],
            waves:[0,1],
            heroes:[0,1,2,3],
            characters:[0,1,2,3,4,5], 
        },
        4:{
            lines:[0],
            waves:[0,1,2],
            heroes:[0,1,2,3],
            characters:[0,1,2,3,4,5], 
        }
    },
    7:{
        key:"s7",
        lineStyles:{ 
            getX: (i,dimns) => dimns.contentsWidth * 0.5, getY: (i,dimns) => dimns.contentsHeight * 0.5,
            case:"upper", fontFamily:"helvetica", fontSize:28, strokeWidth:1.5, stroke:grey10(2), fill:grey10(2),
            textAnchor:"middle", dominantBaseline:"central"
        },
        lines:[
            { text:"2 months later..." },
        ],
        1:{
            lines:[0],
        },
    },
    10:{
        key:"s10",
        lineStyles:{ 
            fontFamily:"helvetica", 
            getX:(i, dimns) => dimns.contentsWidth * 0.5, 
            getY: (i,dimns) => i === 0 ? 0 : dimns.contentsHeight * 0.9 + (i - 1) * 25,
            fontSize:16, strokeWidth:0.8, stroke:grey10(3), fill:grey10(3),
            textAnchor:"middle", dominantBaseline:"central"
        },
        lines:[
            { 
                text:"Take control of your story", fontSize:30, strokeWidth:2, stroke:"blue", fill:"blue",
            }, 
            { 
                text:"A user-friendly and inspiring app for academies", 
            }, 
            { 
                text:"centred on your players, your team and their story", 
            }
        ],
        1:{
            otherElements:[{ key:"logo" }]
        },
        2:{
            otherElements:[{ key:"logo" }],
            lines:[0,1,2]
        }
    },
    //same as 10, but smaller size
    11:{
        key:"s11",
        lineStyles:{ 
            fontFamily:"helvetica", getX:(i, dimns) => dimns.contentsWidth * 0.5, getY: (i,dimns) => dimns.contentsHeight * 0.9 + i * 25,
            fontSize:16, strokeWidth:0.8, stroke:"red", fill:"red",
            textAnchor:"middle", dominantBaseline:"central"
        },
        lines:[
            { 
                text:"A user-friendly and inspiring app for academies", 
            }, 
            { 
                text:"centred on the player and their journey", 
            }
        ],
        1:{
            otherElements:[{ key:"logo" }],
            lines:[0,1]
        }
    },
    12:{
        key:"s12",
        heroX:(d,i) => 0,
        heroY:(d,i,dimns) => i * dimns.heroHeight,
        characterX:(d,i,dimns) => dimns.contentsWidth - dimns.characterWidth,
        characterY:(d,i,dimns) => i * (dimns.characterHeight + dimns.vertGapBetweenCharacters),
        1:{
            waves:[0,1,2],
            heroes:[0,1,2,3],
            characters:[0,1,2,3,4,5], 
        }
    }
}