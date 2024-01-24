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
            heroBubbles:[0],
        },
        3:{
            heroes:[0,1], 
            heroBubbles:[0,1],
        },
        4:{
            heroes:[0,1,2], 
            heroBubbles:[0,1,2],
        },
        5:{
            heroes:[0,1,2,3], 
            heroBubbles:[0,1,2,3],
        }
    },
    //s3 - villains
    3:{
        key:"villains",
        title: "THE VILLAINS",
        characterX:(d,i,dimns) => dimns.contentsWidth - dimns.characterWidth,
        characterY:(d,i, dimns) => i * (dimns.characterHeight + dimns.vertGapBetweenCharacters),
        1:{
        },
        2:{
            characters:[0], 
            characterBubbles:[0],
        },
        3:{
            characters:[0,1], 
            characterBubbles:[0,1],
        }
    },
    //s4 - other characters
    4:{
        key:"other-characters",
        title: "OTHER CHARACTERS",
        characterX:(d,i,dimns) => dimns.contentsWidth - dimns.characterWidth,
        characterY:(d,i, dimns) => i * (dimns.characterHeight + dimns.vertGapBetweenCharacters),
        1:{
        },
        2:{
            characters:[2], 
        },
        3:{
            characters:[2,3], 
        },
        4:{
            characters:[2,3,4], 
        },
        5:{
            characters:[2,3,4,5], 
        }
    },
    //s5 - the quest
    5:{
        key:"quest",
        title: "THE QUEST",
        heroX:(d,i,dimns) => 0,
        heroY:(d,i,dimns) => i * dimns.heroHeight,
        characterX:(d,i,dimns) => dimns.contentsWidth - dimns.characterWidth,
        characterY:(d,i, dimns) => i * (dimns.characterHeight + dimns.vertGapBetweenCharacters),
        1:{
            heroes:[0,1,2,3],
            characters:[0,1,2,3,4,5], 
        },
        /*2:{
            waves:[0,1,2],
            heroes:[0,1,2,3],
            characters:[0,1,2,3,4,5], 
        }*/
        2:{
            waves:[0],
            heroes:[0,1,2,3],
            characters:[0,1,2,3,4,5], 
        },
        3:{
            waves:[0,1],
            heroes:[0,1,2,3],
            characters:[0,1,2,3,4,5], 
        },
        4:{
            waves:[0,1,2],
            heroes:[0,1,2,3],
            characters:[0,1,2,3,4,5], 
        }
    },
    //s6 - How did they do it
    6:{
        key:"s6",
        lineStyles:{ 
            getX: (i,dimns) => dimns.contentsWidth * 0, getY: i => 50 + i * 58,
            case:"upper", fontFamily:"helvetica", fontSize:42, strokeWidth:3, stroke:grey10(2), fill:grey10(2),
            textAnchor:"start", dominantBaseline:"central"
        },
        lines:[
            { text:"SO" },
            { text:"HOW DID" },
            { text:"THEY" },
            { text:"DO IT?" }
        ],
        1:{
            lines:[0,1,2,3]
        }
        /*1:{
            lines:[0]
        },
        2:{
            lines:[0,1]
        },
        3:{
            lines:[0,1,2]
        },
        4:{
            lines:[0,1,2,3]
        }
        */
        
    },
    //s7 - ask them
    7:{
        key:"s7",
        lineStyles:{ 
            getX: (i,dimns) => dimns.contentsWidth * 0, getY: (i,dimns) => 50 + i * 55 + (i > 1 ? 30 : 0) + (i > 2 ? 30 : 0),
            case:"upper", fontFamily:"helvetica", fontSize:38, strokeWidth:2, stroke:grey10(2), fill:grey10(2),
            textAnchor:"start", dominantBaseline:"central"
        },
        lines:[
            { text:"ASK THEM, BECAUSE" },
            { text:"THEY ARE THE HEROES" }, 
            { text:"BUT" },
            { text:"THEY DID HAVE A" },
            { text:"SECRET WEAPON" }
        ],
        1:{
            lines:[0,1]
        },
        2:{
            lines:[0,1,2]
        },
        3:{
            lines:[0,1,2,3,4]
        },
    },
    8:{
        key:"s8",
        lineStyles:{ 
            fontFamily:"helvetica", getX:(i, dimns) => dimns.contentsWidth * 0.5, getY: (i,dimns) => dimns.contentsHeight * 0.9 + i * 25,
            fontSize:16, strokeWidth:0.8, stroke:"red", fill:"red",
            textAnchor:"middle", dominantBaseline:"central"
        },
        lines:[
            { 
                text:"USER WARNING: SWITCHPLAY CANNOT REPLACE YOUR FACE-TO-FACE COMMUNICATION", 
            }, 
            //{ text:"YOUR FACE-TO-FACE COMMUNICATION!"}, 
            { 
                text:"(but it does enhance it)", stroke:grey10(4), fill:grey10(4),
            }
        ],
        1:{
            //sp Logo
        },
        2:{
            //sp logo
            lines:[0]
        },
        3:{
            lines:[0,1]
        },
    },
    9:{
        key:"s9",
    },
    10:{
        key:"s10",
    },
    11:{
        key:"s11",
        heroX:(d,i) => 0,
        heroY:(d,i,dimns) => i * dimns.heroHeight,
        characterX:(d,i,dimns) => dimns.contentsWidth - dimns.characterWidth,
        characterY:(d,i,dimns) => i * (dimns.characterHeight + dimns.vertGapBetweenCharacters),
        1:{
            waves:[0,1,2],
            heroes:[0,1,2,3],
            characters:[0,1,2,3,4,5], 
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
    },
}