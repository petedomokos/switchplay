import * as d3 from 'd3';
import { grey10 } from "./cards/constants"
/*
import { updateTransform } from '../journey/transitionHelpers';
import deckComponent from './deckComponent';
import { getTransformationFromTrans } from '../journey/helpers';
import { fadeIn, remove } from '../journey/domHelpers';*/

//const transformTransition = { update: { duration: TRANSITIONS.MED } };


const peopleData = [
    { key:"coach", label:"Coach" },
    { key:"analyst", label:"Analyst" },
    { key:"player", label:"Player" },
    { key:"manager", label:"Manager" }
]

const charactersData = [
    { key:"kitman", label:"Kitman Labs & IDPs", type:"villain" },
    { key:"data", label:"Data", type:"villain" },
    { key:"goals", label:"Goals", type:"neutral" },
    { key:"reviews", label:"Reviews", type:"neutral" },
    { key:"reports", label:"Reports", type:"neutral" },
    { key:"comms", label:"Communication", type:"neutral" }
]

/*const middleData = [
    { key:"easy", label:"Easy To Use", linkToMultiplier:0.5 },
    { key:"time-saving", label:"Time-Saving", linkToMultiplier:1.5 },
    { key:"engaging", label:"Engaging", linkToMultiplier:2.5 },
    { key:"purposeful", label:"Impactful", linkToMultiplier:3.5 }
]*/

const middleData = [
    { key:"smooth", label:"Smooth" },
    { key:"impactful", label:"Impactful" },
    { key:"consistent", label:"Consistent" },
]

export default function storyAnimationComponent() {
    //API SETTINGS
    // dimensions
    let width = 300;
    let height = 600;

    let margin = null;
    let contentsWidth;
    let contentsHeight;

    let sceneTitleHeight;
    let storyContentsHeight;

    let peopleWidth;

    let middleWidth;
    let middleMargin;
    let middleContentsWidth;
    let middleContentsHeight;
    let middleTitleHeight;
    let middleItemsHeight;

    let charactersWidth;
    let charactersHeight;

    /*let peopleX;
    let peopleY;
    let middleX;
    let middleY;
    let charactersX;
    let charactersY;*/

    function updateDimns(){
        margin = { left: width * 0.1, right:width * 0.1, top: height * 0.1, bottom: height * 0.1 }
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        sceneTitleHeight = sceneNr >= 9 ? 0 : d3.max([20, Math.round(contentsHeight * 0.15)]);
        storyContentsHeight = contentsHeight - sceneTitleHeight;

        peopleWidth = contentsWidth * 0.2;
        charactersWidth = contentsWidth * 0.2;
        middleWidth = contentsWidth - peopleWidth - charactersWidth;


        middleMargin = { 
            left: contentsWidth * 0.1, right: contentsWidth * 0.1, top: storyContentsHeight * 0.1, bottom:storyContentsHeight * 0.1
        }

        middleContentsWidth = middleWidth - middleMargin.left - middleMargin.right;
        middleContentsHeight = storyContentsHeight - middleMargin.top - middleMargin.bottom;

        middleTitleHeight = 0;// 50;
        middleItemsHeight = Math.round(middleContentsHeight - middleTitleHeight);
    }

    let DEFAULT_STYLES = {
        storyAnimation:{ info:{ date:{ fontSize:9 } } },
    }
    let _styles = () => DEFAULT_STYLES;

    //state
    let sceneNr = 0;
    /*
    next
    - sort scene 6 positinong of middle waves (also change name to waves)
     - Merge the "The Scene" scene with teh heroes scene, ie when person is introduced, thats when they say something


     - add fade outs and ins, using d3 enter-update pattern (maybe change the display functions to a boolean flag func -> shouldDisplay) and then
     obviusly remove the display line, and instead we filter the data arrays so the ones to fade out go into exit group, and those to fade in go itno enter group
     (note - these transitoins will often be within a scene too, so need to think how to do that
        -> could use a seoarate subscene variable, or just have more scenes so scene 2 becomes scenes 2 to 5, adding a person each time)
        -> soln -> have a sceneTitle function which maps sceneNr to a value, so eg scenes 2-5 all map to "heroes" ie the heroes scene, prev called scene 2
        so then when applyig values that relate to that scene name, then we can use the key instead of having to check numbers



     - add speech bubbles to each person that speaks, along with funcs for speechBubbleDisplay, location and path of the bubble
     - add a d3 timeout to update scene and trigger an update (should move the functions out of the update) and check it all works
    
     
     - add transitions to position functions too, but if dislpay is changing to none, then dont transition the pos (ie we dont want one to start transitioning as it is fading out too)
     
     
     - create a general function to split a single text line into parts os we can style 1 word or phrase, then 
     apply it to teh word enhance in scene 9 and the word heroes and secret weapon in 8
     -adjust styles and sizes and positions of everything
     - find photos and icons online and add them in
     - add music nd sound effects
     - add some other visual effects

    */

    function storyAnimation(selection, options={}) {
        const { } = options;

        updateDimns();
        // expression elements
        selection.each(function (data) {
            console.log("w h", width, height)
            const containerG = d3.select(this);

            if(containerG.select("g.story-animation-contents").empty()){
                init.call(this, data);
            }

            update.call(this, data);

            function init(){
                const containerElement = d3.select(this);
                containerElement.append("rect")
                    .attr("class", "story-animation-bg")
                    .attr("stroke", grey10(5))
                    .attr("fill", "none");

                const contentsG = containerElement.append("g")
                    .attr("class", "story-animation-contents");

                const storyContentsG = contentsG.append("g").attr("class", "story-contents");
                
                contentsG
                    .append("rect")
                        .attr("class", "contents-bg")
                        //.attr("stroke", "red")
                        .attr("fill", "none")
                storyContentsG
                    .append("rect")
                        .attr("class", "story-contents-bg")
                        //.attr("stroke", "yellow")
                        .attr("fill", "none")

                storyContentsG.append("g").attr("class", "people")
                    .append("rect")
                        .attr("class", "people-bg")
                        .attr("fill", "none")
                        //.attr("stroke", "white");

                storyContentsG.append("g").attr("class", "characters")
                    .append("rect")
                        .attr("class", "characters-bg")
                        .attr("fill", "none")
                        //.attr("stroke", "white");

                //middle 
                const middleG = storyContentsG.append("g").attr("class", "middle");
                const middleContentsG = middleG.append("g").attr("class", "middle-contents");
                middleContentsG
                    .append("rect")
                        .attr("class", "middle-bg")
                        .attr("fill", "none")
                        //.attr("stroke", "white")
                        //.attr("rx", 10)
                        //.attr("ry", 10);

                //title
                middleContentsG
                    .append("text")
                        .attr("class", "middle-title")
                            .attr("text-anchor", "middle")
                            .attr("dominant-baseline", "hanging")
                            .attr("stroke", "white")
                            .attr("stroke-width", 1)
                            .attr("font-size", 16)
                            .attr("fill", "white");
                //items
                middleContentsG
                    .append("g")
                        .attr("class", "middle-items")

            }


            function update(data, options={}){
                const containerElement = d3.select(this)
                    .attr("width", width)
                    .attr("height", height)
                
                containerElement.select("rect.story-animation-bg")
                    .attr("width", width)
                    .attr("height", height)

                const contentsG = containerElement.select("g.story-animation-contents")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

                const storyContentsG = contentsG.select("g.story-contents")
                    .attr("transform", `translate(0,${sceneTitleHeight})`);

                contentsG.select("rect.contents-bg")
                    .attr("width", contentsWidth)
                    .attr("height", contentsHeight)

                storyContentsG.select("rect.story-contents-bg")
                    .attr("width", contentsWidth)
                    .attr("height", storyContentsHeight)

                const middleG = storyContentsG.select("g.middle")
                    .attr("transform", `translate(${peopleWidth}, 0)`)

                //middle
                const middleContentsG = middleG.select("g.middle-contents")
                    .attr("transform", `translate(${middleMargin.left}, ${middleMargin.top})`)

                middleContentsG.select("rect.middle-bg")
                    .attr("width", middleContentsWidth)
                    .attr("height", middleContentsHeight)

                //people data
                const personWidth = peopleWidth;
                const personHeight = storyContentsHeight/peopleData.length;
                const personRadius = d3.min([personWidth, personHeight * 0.6])/2;

                const sceneTitlesGeneralInfo = {
                    case:"upper", fontFamily:"helvetica", fontSize:36, strokeWidth:3, stroke:grey10(2), fill:grey10(2),
                    textAnchor:"middle", dominantBaseline:"hanging", x:contentsWidth * 0.5, y:0,
                }
                const sceneTitlesCustomInfo = {
                    1:{ 
                        title: "Let us tell you a story...", x:0, y:0,
                        case:"lower", fontFamily:"helvetica", fontSize:30, strokeWidth:2, stroke:"blue", fill:"blue",
                        textAnchor:"start", dominantBaseline:"hanging"
                    },
                    2:{ 
                        title: "THE HEROES"
                    },
                    3:{ 
                        title: "THE VILLAINS"
                    },
                    4:{ 
                        title: "OTHER CHARACTERS"
                    },
                    5:{ 
                        title: "THE QUEST"
                    }
                }
                const sceneTitleData = sceneTitlesCustomInfo[sceneNr] ? [ { ...sceneTitlesGeneralInfo, ...sceneTitlesCustomInfo[sceneNr] }] : [];

                const sceneLinesGeneralInfo = {
                    6:{ 
                        getX: i => contentsWidth * 0, getY: i => 50 + i * 58,
                        case:"upper", fontFamily:"helvetica", fontSize:42, strokeWidth:3, stroke:grey10(2), fill:grey10(2),
                        textAnchor:"start", dominantBaseline:"central"
                    },
                    7:{ 
                        getX: i => contentsWidth * 0, getY: i => 50 + i * 55 + (i > 1 ? 30 : 0) + (i > 2 ? 30 : 0),
                        case:"upper", fontFamily:"helvetica", fontSize:38, strokeWidth:2, stroke:grey10(2), fill:grey10(2),
                        textAnchor:"start", dominantBaseline:"central"
                    },
                    8:{ 
                        fontFamily:"helvetica", getX:() => contentsWidth * 0.5, getY: i => contentsHeight * 0.9 + i * 25,
                        fontSize:16, strokeWidth:0.8, stroke:"red", fill:"red",
                        textAnchor:"middle", dominantBaseline:"central"
                    }
                    /*8:{ 
                        fontFamily:"helvetica", getX:() => contentsWidth * 0.08, getY: i => contentsHeight + i * 15,
                        fontSize:10, strokeWidth:0.8, stroke:"red", fill:"red",
                        textAnchor:"start", dominantBaseline:"central"
                    }*/
                }

                const sceneLinesCustomInfo = {
                    6:[
                        { text:"SO" },
                        { text:"HOW DID" },
                        { text:"THEY" },
                        { text:"DO IT?" }
                    ],
                    7:[
                        { text:"ASK THEM, BECAUSE" },
                        { text:"THEY ARE THE HEROES" }, 
                        { text:"BUT" },
                        { text:"THEY DID HAVE A" },
                        { text:"SECRET WEAPON" }
                    ],
                    8:[
                        { 
                            text:"USER WARNING: SWITCHPLAY CANNOT REPLACE YOUR FACE-TO-FACE COMMUNICATION", 
                        }, 
                        //{ text:"YOUR FACE-TO-FACE COMMUNICATION!"}, 
                        { 
                            text:"(but it does enhance it)", stroke:grey10(4), fill:grey10(4),
                        }
                    ]
                }

                const getSceneLinesData = () => sceneLinesCustomInfo[sceneNr]?.map(line => ({ ...sceneLinesGeneralInfo[sceneNr], ...line }))
                const sceneLinesData = getSceneLinesData() || [];

                const personX = (d, i) => {
                    switch(sceneNr) {
                        default:
                          return 0;
                    }
                }
                const personY = (d, i) => {
                    switch(sceneNr) {
                        case 2:{
                            return i * personHeight;
                        }
                        case 5:
                        case 9:
                        case 10:{
                            return i * personHeight;
                        }
                        default:
                          return 0;
                    }
                }
                const personDisplay = (d, i) => {
                    switch(sceneNr) {
                        case 2:
                        case 5: 
                        case 9:
                        case 10:{
                            return null;
                        }
                        default:
                          return "none";
                    }
                }

                //characters data
                const nrCharacters = charactersData.length;
                const characterWidth = charactersWidth;
                const vertGapBetweenCharacters = (storyContentsHeight/nrCharacters) * 0.2;
                const nrCharacterGaps = nrCharacters - 1;
                const vertSpaceForCharacters = storyContentsHeight - (vertGapBetweenCharacters * nrCharacterGaps);
                const characterHeight = vertSpaceForCharacters/charactersData.length;

                const characterX = (d, i) => {
                    switch(sceneNr) {
                        default:
                            return contentsWidth - characterWidth;
                    }
                }
                const characterY = (d, i) => {
                    switch(sceneNr) {
                        case 3:{
                            return i * (characterHeight + vertGapBetweenCharacters);
                        }
                        case 4:{
                            return i * (characterHeight + vertGapBetweenCharacters);
                        }
                        case 5:
                        case 9:
                        case 10:{
                            return i * (characterHeight + vertGapBetweenCharacters);
                        }
                        default:
                            return 0;
                    }
                }
                const characterDisplay = (d, i) => {
                    switch(sceneNr) {
                        case 5:
                        case 9:
                        case 10:{
                            return null;
                        }
                        case 3:{
                            return d.key === "kitman" || d.key ==="data" ? null : "none";
                        }
                        case 4 :{
                            return d.key === "goals" || d.key ==="reviews" || d.key === "reports" || d.key === "communication" ? null : "none";
                        }
                        default:
                            return "none";
                    }
                }

                //middle data
                const middleItemsG = middleContentsG.select("g.middle-items")
                    .attr("transform", `translate(0, ${middleTitleHeight})`);
                        
                const middleItemWidth = middleContentsWidth;
                const middleItemHeight = middleItemsHeight/middleData.length;

                const middleDisplay = (d, i) => {
                    switch(sceneNr) {
                        case 5:
                        case 9:
                        case 10:{
                            return null;
                        }
                        default:{
                            return "none";
                        }
                    }
                }

                //scene 9 switchplay logo in ipad
                //next - finich this and add speech bubbles to people,
                //and deccie how to handle scene 10 - fitting in space - > maybe move teh herostatement into the story scene underneath the rest?
                //and move the rest up for scene 10 as compared to scene 6
                //and could even put in the call to action inside the scene too
                const switchplayLogoG = contentsG.selectAll("g.switchplay-logo").data(sceneNr === 8 ? [1] : [])
                switchplayLogoG.enter()
                    .append("g")
                        .attr("class", "switchplay-logo")
                        .each(function(){
                            d3.select(this).append("rect")
                                .attr("rx", 15)
                                .attr("ry", 15)
                                .attr("fill", "none")
                                .attr("stroke", grey10(5))
                            
                            d3.select(this).append("text")
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")
                                .attr("font-family", "helvetica")
                                .attr("font-size", 14)
                                .attr("stroke-width", 1)
                                .attr("stroke", grey10(2))
                                .attr("fill", grey10(2))
                                .text("SWITCHPLAY")
                        })
                        .merge(switchplayLogoG)
                        .each(function(){
                            d3.select(this).select("rect")
                                .attr("x", -60)
                                .attr("y", -92.5)
                                .attr("width", 120)
                                .attr("height", 185)
                        })
                        .attr("transform", d => `translate(${contentsWidth/2},${contentsHeight/2})`)

                switchplayLogoG.exit().remove();


                //scene title
                const sceneTitleG = contentsG.selectAll("text.scene-title").data(sceneTitleData)
                sceneTitleG.enter()
                    .append("text")
                        .attr("class", "scene-title")
                        .merge(sceneTitleG)
                        .attr("transform", d => `translate(${d.x},${d.y})`)
                        .attr("text-anchor", d => d.textAnchor)
                        .attr("dominant-baseline", d => d.dominantBaseline)
                        .attr("font-family", d => d.fontFamily)
                        .attr("font-size", d => d.fontSize)
                        .attr("stroke-width", d => d.strokeWidth)
                        .attr("stroke", d => d.stroke)
                        .attr("fill", d => d.fill)
                        .text(d => d.title)

                sceneTitleG.exit().remove();

                //paragraph
                const sceneLineG = contentsG.selectAll("text.scene-line").data(sceneLinesData)
                sceneLineG.enter()
                    .append("text")
                        .attr("class", "scene-line")
                        .merge(sceneLineG)
                        .attr("x", (d,i) => d.getX(i))
                        .attr("y", (d,i) => d.getY(i))
                        .attr("text-anchor", d => d.textAnchor)
                        .attr("dominant-baseline", d => d.dominantBaseline)
                        .attr("font-family", d => d.fontFamily)
                        .attr("font-size", d => d.fontSize)
                        .attr("stroke-width", d => d.strokeWidth)
                        .attr("stroke", d => d.stroke)
                        .attr("fill", d => d.fill)
                        .text(d => d.text)

                sceneLineG.exit().remove();





                //people
                const personG = storyContentsG.selectAll("g.person").data(peopleData);
                personG.enter()
                    .append("g")
                        .attr("class", "person")
                        .each(function(d){
                            const personG = d3.select(this);
                            personG.append("circle")
                                .attr("fill", "none")
                                .attr("stroke", "grey")
                                .attr("stroke-width", 0.5)

                            personG.append("text").attr("class", "person-title")
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")
                                .attr("stroke", "white")
                                .attr("stroke-width", 0.2)
                                .attr("font-size", 10)
                                .attr("fill", "white");

                            personG.append("rect").attr("class", "person-hitbox")
                                .attr("fill", "transparent")
                                //.attr("stroke", "aqua");

                        })
                        .merge(personG)
                        .attr("display", (d,i) => personDisplay(d,i))
                        .attr("transform", (d,i) => `translate(${personX(d,i)}, ${personY(d,i)})`)
                        .each(function(d,i){
                            const personG = d3.select(this);

                            personG.select("circle")
                                .attr("cx", personWidth/2)
                                .attr("cy", personHeight/2)
                                .attr("r", personRadius)

                            personG.select("text.person-title")
                                .attr("x", personWidth/2)
                                .attr("y", personHeight/2)
                                .text(d.label)
                            
                            personG.select("rect.person-hitbox")
                                .attr("width", personWidth)
                                .attr("height", personHeight)

                        });

                personG.exit().remove();
        
                //characters
                const characterG = storyContentsG.selectAll("g.character").data(charactersData);
                characterG.enter()
                    .append("g")
                        .attr("class", "character")
                        .each(function(d){
                            const characterG = d3.select(this);
                            characterG.append("text").attr("class", "character-title")
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")
                                .attr("stroke", "white")
                                .attr("stroke-width", 0.5)
                                .attr("font-size", 10)
                                .attr("fill", "white");

                            characterG.append("image")
                            characterG.append("rect").attr("class", "character-hitbox")
                                .attr("fill", "transparent")
                                .attr("rx", 15)
                                .attr("ry", 15)
                                .attr("stroke", "aqua")
                                //.attr("stroke", d.type === "villain" ? "red" : "aqua");

                        })
                        .merge(characterG)
                        .attr("display", (d,i) => characterDisplay(d,i))
                        .attr("transform", (d,i) => `translate(${characterX(d,i)}, ${characterY(d,i)})`)
                        .each(function(d,i){
                            const characterG = d3.select(this);

                            characterG.select("text.character-title")
                                .attr("x", characterWidth/2)
                                .attr("y", characterHeight/2)
                                .text(d.label)

                            characterG.select("image")
                                .attr("xmiddle:href", d.url)
                                //.attr("transform", `scale(${photoContentsWidth / 250})`)
                            
                            characterG.select("rect.character-hitbox")
                                .attr("width", characterWidth)
                                .attr("height", characterHeight)

                        });

                //middle
                const middleItemG = middleItemsG.selectAll("g.middle-item").data(middleData);
                middleItemG.enter()
                    .append("g")
                        .attr("class", "middle-item")
                        .each(function(d){
                            const middleItemG = d3.select(this);
                            middleItemG.append("text").attr("class", "middle-item-title")
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")
                                .attr("stroke", "white")
                                .attr("stroke-width", 0.5)
                                .attr("font-size", 14)
                                .attr("fill", "white");

                            middleItemG.append("path")
                                .attr("stroke", grey10(3))
                                .attr("stroke-width", 1)
                                .attr("fill", "none");

                            middleItemG.append("rect").attr("class", "middle-item-hitbox")
                                .attr("fill", "transparent")
                                //.attr("stroke", "aqua");

                        })
                        .merge(middleItemG)
                        .attr("display", (d,i) => middleDisplay(d,i))
                        .attr("transform", (d,i) => `translate(0, ${i * middleItemHeight})`)
                        .each(function(d,i){
                            const middleItemG = d3.select(this);

                            middleItemG.select("text.middle-item-title")
                                .attr("x", middleItemWidth/2)
                                .attr("y", middleItemHeight * 0)
                                .text(d.label)

                            const amplitude = Math.round(middleItemHeight/2);
                            const wavelength = Math.round(middleContentsWidth);
                   
                            const halfWavelength = Math.round(wavelength/2);
                            const quarterWavelength = Math.round(wavelength/4);
                            const deltaX = 10;
                            const deltaY = 5;
                            const pt1X = quarterWavelength - deltaX;
                            const pt2X = quarterWavelength + deltaX;
                            const pt3X = halfWavelength + quarterWavelength - deltaX;
                            const pt4X = halfWavelength + quarterWavelength + deltaX;

                            const pt1Y = - amplitude + deltaY;
                            const pt2Y = pt1Y;
                            const pt3Y = amplitude - deltaY;
                            const pt4Y = pt3Y;

                            const pathD = `M 0 0 C ${pt1X} ${pt1Y}, ${pt2X} ${pt2Y}, ${halfWavelength} 0 C ${pt3X} ${pt3Y}, ${pt4X} ${pt4Y}, ${wavelength} 0`

                            middleItemG.select("path")
                                .attr("d", pathD)
                                //.attr("d", `M0,0 C 40 -45, 60 -45, 100 0 C 140 45, 160 45, 200 0`)
                                .attr("transform", `translate(0, ${middleItemHeight/2})`)
                            
                            middleItemG.select("rect.middle-item-hitbox")
                                .attr("width", middleItemWidth)
                                .attr("height", middleItemHeight)

                        });

                middleItemG.exit().remove();

            }

        })

        return selection;
    }
    
    //api
    storyAnimation.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return storyAnimation;
    };
    storyAnimation.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return storyAnimation;
    };
    storyAnimation.sceneNr = function (value) {
        if (!arguments.length) { return sceneNr; }
        sceneNr = value;
        return storyAnimation;
    };

    return storyAnimation;
}
