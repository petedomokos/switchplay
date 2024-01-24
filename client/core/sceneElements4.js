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
        heroX:(d,i,dimns) => {
            switch(i){
                case 0:return (dimns.contentsWidth - dimns.heroWidth)/2;
                case 1:return (dimns.contentsWidth - dimns.heroWidth)/2 - 100;
                case 2:return (dimns.contentsWidth - dimns.heroWidth)/2 + 100;
                case 3:return (dimns.contentsWidth - dimns.heroWidth)/2;
                default: return 0;
            }
        },
        heroY:(d,i,dimns) => {
            switch(i){
                case 0:return 10
                case 1:return 170
                case 2:return 170
                case 3:return 100
                default: return 0;
            }
            i * dimns.heroHeight
        },
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
        characterX:(d,i,dimns) => {
            return  i * (dimns.contentsWidth - dimns.characterWidth)/4
        },
        characterY:(d,i, dimns) => {
            switch(i){
                case 0:return 2 * (dimns.characterHeight + dimns.vertGapBetweenCharacters);
                case 1:return 1 * (dimns.characterHeight + dimns.vertGapBetweenCharacters);
                case 2:return 0 * (dimns.characterHeight + dimns.vertGapBetweenCharacters);
                case 3:return 1 * (dimns.characterHeight + dimns.vertGapBetweenCharacters);
                case 4:return 2 * (dimns.characterHeight + dimns.vertGapBetweenCharacters);
                default: return 0;
            }
            //return i * (dimns.characterHeight + dimns.vertGapBetweenCharacters)
        },
        1:{
        },
        2:{
            characters:[], 
            otherElements:[{ key:"communication", withLine:true }]
        },
        3:{
            characters:[0], 
            otherElements:[{ key:"communication", withLine:true }]
        },
        4:{
            characters:[0,1], 
            otherElements:[{ key:"communication", withLine:true }]
        },
        5:{
            characters:[0,1,2], 
            otherElements:[{ key:"communication", withLine:true }]
        },
        6:{
            characters:[0,1,2,3], 
            otherElements:[{ key:"communication", withLine:true }]
        },
        7:{
            characters:[0,1,2,3,4], 
            otherElements:[{ key:"communication", withLine:true }]
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
            otherElements:[{ key:"squiggle" }],
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
                text:"centred on your players and their journeys", 
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
    //same as 7, but smaller size
    8:{
        key:"s11",
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
                text:"centred on your players and their journeys", 
            }
        ],
        1:{
            otherElements:[{ key:"logo" }],
            lines:[0,1,2]
        }
    },
    9:{
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