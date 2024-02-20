import { grey10 } from "./cards/constants"

export const sceneElements = {
    1:{
        key:"heroes",
        //title: "THE HEROES",
        heroX:(d,i,dimns) => {
            switch(d.key){
                case "coach":return 0;
                case "analyst":return dimns.contentsWidth - dimns.heroDiameter;
                case "manager":return 0;
                case "parent":return dimns.contentsWidth - dimns.heroDiameter;
                case "player":return (dimns.contentsWidth - dimns.playerDiameter)/2;
                default: return 0;
            }
        },
        heroY:(d,i,dimns) => {
            switch(d.key){
                case "coach":return 0;
                case "analyst":return 0;
                case "manager":return dimns.contentsHeight - dimns.heroDiameter - dimns.personLabelHeight;
                case "parent":return dimns.contentsHeight - dimns.heroDiameter - dimns.personLabelHeight;
                case "player":return (dimns.contentsHeight - dimns.playerDiameter)/2;
                default: return 0;
            }
        },
        1:{
            heroes:[0,1,2,3,4], 
        }
    },
    2:{
        key:"logo",
        heroX:(d,i,dimns) => 0,
        heroY:(d,i,dimns) => i * (dimns.heroDiameter + dimns.vertGapBetweenPeople),
        characterX:(d,i,dimns) => dimns.contentsWidth - dimns.characterWidth,
        characterY:(d,i, dimns) => i * (dimns.characterHeight + dimns.vertGapBetweenCharacters),
        1:{
            otherElements:[{ key:"logo" }],
            heroes:[0,1,2,3,4],
            characters:[0,1,2,3,4,5], 
        },
    },
    /*3:{
        key:"waves",
        heroX:(d,i,dimns) => 0,
        heroY:(d,i,dimns) => i * dimns.heroHeight,
        characterX:(d,i,dimns) => dimns.contentsWidth - dimns.characterWidth,
        characterY:(d,i, dimns) => i * (dimns.characterHeight + dimns.vertGapBetweenCharacters),
        1:{
            waves:[0,1,2],
            heroes:[0,1,2,3,4],
            characters:[0,1,2,3,4,5], 
        },
    }*/
}