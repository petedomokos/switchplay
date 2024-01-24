import * as d3 from 'd3';
import { grey10 } from "./cards/constants"

import { updateTransform, updateRectDimns } from './journey/transitionHelpers';
/*import deckComponent from './deckComponent';
import { getTransformationFromTrans } from '../journey/helpers';*/
import { fadeIn, remove } from './journey/domHelpers';

const nillOpp = () => 0;
//todo - make a random point generator for x and y deltas
const squiggleD = `M 0 0, 5 5, -3 9, -7 14, 9 17, -5 22, 5 28`;

const heroes = [
    { key:"coach", label:"Coach", imgTransform:{ x: 20, y: 5, k:0.22 }, imgTransformSmall:{ x: 18, y: 8, k:0.1 } },
    { key:"analyst", label:"Analyst", imgTransform:{ x: 25, y: 5, k:0.2 }, imgTransformSmall:{ x: 20, y: 7, k:0.1 } },
    { key:"player", label:"Player", imgTransform:{ x: -7, y: -25, k:0.43 }, imgTransformSmall:{ x: 20, y: 5, k:0.1 } },
    { key:"manager", label:"Manager", imgTransform:{ x: 20, y: 5, k:0.22 }, imgTransformSmall:{ x: 20, y: 10, k:0.1 } },
    { key:"parent", label:"Parent", imgTransform:{ x: 20, y: 5, k:0.2 }, imgTransformSmall:{ x: 20, y: 5, k:0.1 } },
]

const characters = [
    { key:"kitman", label:"IT Systems" }, //need IDP admin in here too
    { key:"data", label:"Data" },
    { key:"goals", label:"Goals" },
    { key:"reviews", label:"Reviews" },
    { key:"reports", label:"Reports" },
    { key:"comms", label:"Communication" }
]

const waves = [
    { key:"smooth", label:"Smooth" },
    { key:"impactful", label:"Impactful" },
    { key:"consistent", label:"Consistent" },
]

const bubbleLines = {
    coach: ["We need everyone pulling", "in the same direction"],
    analyst: ["I'm so busy because everything goes through me,", "I dont have time to do my actual job!"],
    player: ["It would be great to see my progress", "on my phone, all mapped out"],
    manager: ["Our face to face communication is good,", "but things can sometimes get siloed"],
    kitman: ["My names Killman Tabs, I'm software.", "I love menus, lists and tabs.", "I hate users!"],
    data: ["My names Dangerpoint, I'm data.", "I'm meant to serve people", "but sometimes I act like I'm the master!"]
}

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

    let heroesWidth;

    let wavesWidth;
    let wavesMargin;
    let wavesContentsWidth;
    let wavesContentsHeight;
    let wavesHeight;

    let charactersWidth;

    let logoRectWidth;
    let logoRectHeight;

    let fontSizes = {};

    function updateDimns(){
        margin = { left: width * 0.1, right:width * 0.1, top: height * 0.1, bottom: height * 0.1 }
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        sceneTitleHeight = 0;// sceneNr >= 9 ? 0 : d3.max([20, Math.round(contentsHeight * 0.15)]);
        storyContentsHeight = contentsHeight - sceneTitleHeight;

        heroesWidth = d3.max([55, contentsWidth * 0.2]);
        charactersWidth = d3.max([70, contentsWidth * 0.2]);
        wavesWidth = contentsWidth - heroesWidth - charactersWidth;
        wavesHeight = storyContentsHeight;
        wavesMargin = { 
            left: d3.max([35, contentsWidth * 0.1]), 
            right: d3.max([35, contentsWidth * 0.1]), 
            top: storyContentsHeight * 0.1, 
            bottom:storyContentsHeight * 0.1
        }

        wavesContentsWidth = wavesWidth - wavesMargin.left - wavesMargin.right;
        wavesContentsHeight = wavesHeight - wavesMargin.top - wavesMargin.bottom;

        logoRectWidth = d3.max([75, contentsHeight/3.5]);
        logoRectHeight = logoRectWidth * 1.5;

        fontSizes = {
            hero:d3.max([9, contentsHeight/27.5]),
            character:d3.max([9, contentsHeight/27.5]),
            logo:logoRectWidth * 0.12,
            wave:d3.max([10, contentsHeight/20]),
            bubble:d3.max([10, contentsHeight/25]),
        }

    }

    let DEFAULT_STYLES = {
        storyAnimation:{ info:{ date:{ fontSize:9 } } },
    }
    let _styles = () => DEFAULT_STYLES;

    //state
    let sceneNr = 0;
    let frameNr = 0;
    /*
    next
     - add speech bubbleLines to each hero that speaks, along with funcs for speechBubbleDisplay, location and path of the bubble
     - add a d3 timeout to update scene and trigger an update (should move the functions out of the update) and check it all works
     
     - create a general function to split a single text line into parts os we can style 1 word or phrase, then 
     apply it to teh word enhance in scene 9 and the word heroes and secret weapon in 8

     -adjust styles and sizes and positions of everything
     - find photos and icons online and add them in
     - add music and sound effects
     - add some other visual effects

    */

    function storyAnimation(selection, options={}) {
        const { } = options;

        updateDimns();

        //transitions into and out of this scene
        const duration = 500;
        const transitionIn = { delay:duration + 50, duration }
        //scene 1 must remove any stuff from the final scene (which may ) quicker
        const transitionOut = { duration:sceneNr === 1 ? 200 : duration }

        // expression elements
        selection.each(function (frameData) {
            //console.log("sceneNr", sceneNr, frameNr)
            //console.log("frameData", frameData)
            const containerG = d3.select(this);

            if(containerG.select("g.story-animation-contents").empty()){
                init.call(this, frameData);
            }

            update.call(this, frameData);

            function init(){
                const containerElement = d3.select(this)
                    .attr("width", width)
                    .attr("height", height)
                    .attr("transform", "scale(1.3)");

                containerElement.append("rect")
                    .attr("class", "story-animation-bg")
                    .attr("width", width)
                    .attr("height", height)
                    //.attr("stroke", grey10(5))
                    //.attr("stroke-width", 0.3)
                    .attr("fill", "none");

                const contentsG = containerElement.append("g")
                    .attr("class", "story-animation-contents")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

                const storyContentsG = contentsG.append("g").attr("class", "story-contents")
                    .attr("transform", `translate(0,${sceneTitleHeight})`);
                
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

                storyContentsG.append("g").attr("class", "heroes")
                    .append("rect")
                        .attr("class", "heroes-bg")
                        .attr("fill", "none")
                        //.attr("stroke", "white");

                storyContentsG.append("g").attr("class", "characters")
                    .append("rect")
                        .attr("class", "characters-bg")
                        .attr("fill", "none")
                        //.attr("stroke", "white");

                //waves 
                const wavesG = storyContentsG.append("g").attr("class", "waves")
                    .attr("transform", `translate(${heroesWidth}, 0)`);
                const wavesContentsG = wavesG.append("g").attr("class", "waves-contents")
                    .attr("transform", `translate(${wavesMargin.left}, ${wavesMargin.top})`);
                wavesContentsG
                    .append("rect")
                        .attr("class", "waves-contents-bg")
                        .attr("fill", "none")
                        //.attr("stroke", "white")
                        //.attr("rx", 10)
                        //.attr("ry", 10);

            }


            function update(frameData, options={}){
                //Data
                const { sceneMetadata, otherElements=[] } = frameData;
                const { key, title, lineStyles, lines, nrHeroes, nrCharacters, nrWaves } = sceneMetadata;
                const heroX = frameData.heroX || sceneMetadata.heroX || nillOpp;
                const heroY = frameData.heroY || sceneMetadata.heroY || nillOpp;
                const characterX = frameData.characterX || sceneMetadata.characterX || nillOpp;
                const characterY = frameData.characterY || sceneMetadata.characterY || nillOpp;

                //dimns based on number of items
                const heroWidth = heroesWidth * 1.5;
                const heroHeight = sceneNr === 1 ? heroWidth : storyContentsHeight/nrHeroes;
                const heroMarginVert = heroHeight * 0.05;
                const gapBetweenHeroAndName = heroHeight * 0.05;
                const heroContentsHeight = heroHeight - 2 * heroMarginVert - gapBetweenHeroAndName;;
                const heroNameHeight = d3.max([heroContentsHeight * 0.2, 12]);
                const heroRadius = (heroContentsHeight - heroNameHeight)/2;

                const playerWidth = heroWidth * 1.3;
                const playerHeight = heroHeight * 1.3;
                const playerRadius = playerHeight/2;

                //characters data
                const characterWidth = charactersWidth;
                const vertGapBetweenCharacters = (storyContentsHeight/nrCharacters) * 0.2;
                const nrCharacterGaps = nrCharacters - 1;
                const vertSpaceForCharacters = storyContentsHeight - (vertGapBetweenCharacters * nrCharacterGaps);
                const characterHeight = vertSpaceForCharacters/nrCharacters;

                //waves data   
                const waveWidth = wavesContentsWidth;
                const waveHeight = wavesContentsHeight/nrWaves;
                const waveAmplitude = d3.max([20, waveWidth * 0.2]);// d3.min([waveWidth * 0.3, waveHeight]);

                const heroesData = frameData.heroes?.map(i => heroes[i]) || [];
                const charactersData = frameData.characters?.map(i => characters[i]) || [];
                const wavesData = frameData.waves?.map(i => waves[i]) || [];

                const sceneTitlesGeneralInfo = {
                    case:"upper", fontFamily:"helvetica", fontSize:36, strokeWidth:3, stroke:grey10(2), fill:grey10(2),
                    textAnchor:"middle", dominantBaseline:"hanging", x:contentsWidth * 0.5, y:0,
                }
                const sceneTitleData = title ? [ { ...sceneTitlesGeneralInfo, key, title }] : [];

                const sceneLines = lines?.map(line => ({ ...lineStyles, ...line })) || [];
                const frameLinesData = frameData.lines?.map(i => sceneLines[i]) || [];

                const dimns = {
                    contentsWidth, contentsHeight, storyContentsHeight, sceneTitleHeight,
                    heroWidth, heroHeight, characterWidth, characterHeight, waveWidth, waveHeight, waveAmplitude,
                    playerWidth, playerHeight,
                    vertGapBetweenCharacters
                }


                //RENDER
                //Main gs and bgs
                const containerElement = d3.select(this)
                    .call(updateRectDimns, { 
                        width: () => width, 
                        height:() => height,
                        transition:transitionIn
                    })
            
                containerElement.select("rect.story-animation-bg")
                    .call(updateRectDimns, { 
                        width: () => width, 
                        height:() => height,
                        transition:transitionIn
                    })

                const contentsG = containerElement.select("g.story-animation-contents")
                    .call(updateTransform, { x:() => margin.left, y:() => margin.top, transition:transitionIn })
                    //.attr("transform", `translate(${margin.left},${margin.top})`);

                const storyContentsG = contentsG.select("g.story-contents")
                    .call(updateTransform, { x:() => 0, y:() => sceneTitleHeight, transition:transitionIn })
                    //.attr("transform", `translate(0,${sceneTitleHeight})`);

                /*contentsG.select("rect.contents-bg")
                    .attr("width", contentsWidth)
                    .attr("height", contentsHeight)*/

                /*storyContentsG.select("rect.story-contents-bg")
                    .attr("width", contentsWidth)
                    .attr("height", storyContentsHeight)*/

                const wavesG = storyContentsG.select("g.waves")
                    .call(updateTransform, { x:() => heroesWidth, y:() => 0, transition:transitionIn })
                    //.attr("transform", `translate(${heroesWidth}, 0)`)

                const wavesContentsG = wavesG.select("g.waves-contents")
                    .call(updateTransform, { x:() => wavesMargin.left, y:() => wavesMargin.top, transition:transitionIn })
                    //.attr("transform", `translate(${wavesMargin.left}, ${wavesMargin.top})`)

                /*wavesContentsG.select("rect.waves-contents-bg")
                    .attr("width", wavesContentsWidth)
                    .attr("height", wavesContentsHeight)*/

                const logoDatum = otherElements.find(el => el.key === "logo");
                const switchplayLogoG = contentsG.selectAll("g.switchplay-logo").data(logoDatum ? [logoDatum] : [])
                switchplayLogoG.enter()
                    .append("g")
                        .attr("class", "switchplay-logo")
                        .call(fadeIn, { transition: transitionIn })
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
                                .attr("font-size", fontSizes.logo)
                                .attr("stroke-width", 0.5)
                                .attr("stroke", grey10(1))
                                .attr("fill", grey10(1))
                                .text("SWITCHPLAY")
                        })
                        .merge(switchplayLogoG)
                        .each(function(){
                            d3.select(this).select("rect")
                                .attr("x", -logoRectWidth/2)
                                .attr("y", -logoRectHeight/2)
                                .attr("width", logoRectWidth)
                                .attr("height", logoRectHeight)
                        })
                        .attr("transform", d => `translate(${contentsWidth/2},${contentsHeight/2})`)

                switchplayLogoG.exit().call(remove, { transition:transitionOut });

                /*const communicationDatum = otherElements.find(el => el.key === "communication");
                const communicationG = contentsG.selectAll("g.communication").data(communicationDatum ? [communicationDatum] : [])
                communicationG .enter()
                    .append("g")
                        .attr("class", "communication")
                        .call(fadeIn, { transition: transitionIn })
                        .each(function(){
                            d3.select(this).append("line")
                                .attr("stroke", grey10(5))
                            
                            d3.select(this).append("text")
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")
                                .attr("font-family", "helvetica")
                                .attr("font-size", 20)
                                .attr("stroke-width", 1)
                                .attr("stroke", grey10(1))
                                .attr("fill", grey10(1))
                                .text("COMMUNICATION")
                        })
                        .merge(communicationG )
                        .each(function(d){
                            d3.select(this).select("line")
                                .attr("display", d.withLine ? null : "none")
                                .attr("x1", 20)
                                .attr("y1", 0)
                                .attr("x2", contentsWidth - 20)
                                .attr("y2", 0)
                                .attr("stroke", grey10(5))
                                .attr("stroke-width", 0.5)

                            d3.select(this).select("text")
                                .attr("x", contentsWidth/2)
                                .attr("y", contentsHeight * 0.1)
                        })
                        .attr("transform", d => `translate(${0},${contentsHeight * 0.8})`)

                communicationG.exit().call(remove, { transition:transitionOut });*/



                //scene title
                /*const sceneTitleG = contentsG.selectAll("text.scene-title").data(sceneTitleData, d => d.key)
                sceneTitleG.enter()
                    .append("text")
                        .attr("class", "scene-title")
                        .call(fadeIn, { transition: transitionIn })
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

                sceneTitleG.exit().call(remove, { transition:transitionOut });*/

                //paragraph
                /*
                const sceneLineG = contentsG.selectAll("text.scene-line").data(frameLinesData, d => d.text) //note - could cause issue of two lines have saem text different i
                sceneLineG.enter()
                    .append("text")
                        .attr("class", "scene-line")
                        .call(fadeIn, { transition: transitionIn })
                        .merge(sceneLineG)
                        .attr("x", (d,i) => d.getX(i, dimns))
                        .attr("y", (d,i) => d.getY(i, dimns))
                        .attr("text-anchor", d => d.textAnchor)
                        .attr("dominant-baseline", d => d.dominantBaseline)
                        .attr("font-family", d => d.fontFamily)
                        .attr("font-size", d => d.fontSize)
                        .attr("stroke-width", d => d.strokeWidth)
                        .attr("stroke", d => d.stroke)
                        .attr("fill", d => d.fill)
                        .text(d => d.text)

                sceneLineG.exit().call(remove, { transition:transitionOut });*/


                //heroes
                d3.select(`clipPath#hero-clip`)
                    .select("circle")
                            .transition("hero-clip")
                            .duration(transitionIn.duration)
                            .delay(transitionIn.delay)
                                .attr("r", heroRadius)
                d3.select(`clipPath#player-clip`)
                    .select("circle")
                            .transition("player-clip")
                            .duration(transitionIn.duration)
                            .delay(transitionIn.delay)
                                .attr("r", sceneNr === 1 ? playerRadius : heroRadius)

                const imgWidth = sceneNr === 1 ? 95 : 95 * 0.65;
                const imgHeight = sceneNr === 1 ? 70 : 70 * 0.65;
                const createTransform = obj => `translate(${(obj?.x || 0) - imgWidth/2},${(obj?.y || 0) - imgHeight/2}) scale(${obj?.k || 1})`
               
                const heroG = storyContentsG.selectAll("g.hero").data(heroesData, d => d.key);
                heroG.enter()
                    .append("g")
                        .attr("class", "hero")
                        .call(fadeIn, { transition: transitionIn })
                        .each(function(d){
                            const heroG = d3.select(this);
                            const heroImageG = heroG.append("g")
                                .attr("class", "image")
                                .attr('clip-path', d.key === "player" && sceneNr === 1 ? `url(#player-clip)` : `url(#hero-clip)`)
                                .attr("transform", d.key === "player" && sceneNr === 1 ? 
                                    `translate(${playerWidth/2},${heroMarginVert + playerRadius})` : 
                                    `translate(${heroWidth/2},${heroMarginVert + heroRadius})`)

                            heroImageG.append("circle")
                                .attr("fill", "none")
                                .attr("stroke", grey10(3))
                                .attr("stroke-width",2)// 0.5)
                                .attr("r", d.key === "player" && sceneNr === 1 ? playerRadius : heroRadius)

                            heroG.append("text").attr("class", "hero-title")
                                .attr("display", d.key === "player" && sceneNr === 1 ? "none" : null)
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")
                                .attr("stroke", "white")
                                .attr("stroke-width", 0.2)
                                .attr("font-size", fontSizes.hero * (sceneNr === 1 ? 1.2 : 0.8))
                                .attr("fill", "white")
                                .attr("x", heroWidth/2)
                                .attr("y", heroHeight - heroMarginVert - heroNameHeight/2)
                                .attr("opacity", sceneNr === 1 ? 1 : 0.6)
                                .text(d.label);

                            heroImageG.append("image")
                                .attr("transform", sceneNr >= 2 ? createTransform(d.imgTransformSmall) : createTransform(d.imgTransform))

                            heroG.append("rect").attr("class", "hero-hitbox")
                                .attr("fill", "transparent")
                                //.attr("stroke", "aqua")
                                .attr("width", d.key === "player" && sceneNr === 1 ? playerWidth : heroWidth)
                                .attr("height", d.key === "player" && sceneNr === 1 ? playerHeight : heroHeight)

                        })
                        .attr("transform", (d,i) => `translate(${heroX(d,i,dimns)}, ${heroY(d,i,dimns)})`)
                        .merge(heroG)
                        .call(updateTransform, { 
                            x:(d, i) => heroX(d, i, dimns), 
                            y:(d, i) => {
                                if(d.key === "player" && sceneNr === 1){ heroY(d, i, dimns); }
                                return heroY(d, i, dimns) + (sceneNr >= 2 ? (gapBetweenHeroAndName +heroNameHeight)/2 : 0)
                            },
                            transition:transitionIn 
                        })
                        //.attr("transform", (d,i) => `translate(${heroX(d,i)}, ${heroY(d,i)})`)
                        .each(function(d,i){
                            const heroG = d3.select(this);
                            const heroImageG = heroG.select("g.image")
                            
                            heroImageG
                                .transition("image-g-pos")
                                .duration(transitionIn.duration)
                                .delay(transitionIn.delay)
                                .attr("transform", d.key === "player" && sceneNr === 1 ? 
                                    `translate(${playerWidth/2},${heroMarginVert + playerHeight/2})` : 
                                    `translate(${heroWidth/2},${heroMarginVert + heroRadius})`)

                            heroImageG.select("circle")
                                .transition("pers-circ-pos")
                                .duration(transitionIn.duration)
                                .delay(transitionIn.delay)
                                    .attr("r", d.key === "player" && sceneNr === 1 ? playerRadius : heroRadius);

                            heroG.select("text.hero-title")
                                .transition("pers-text-pos")
                                .duration(transitionIn.duration)
                                .delay(transitionIn.delay)
                                    .attr("x", heroWidth/2)
                                    .attr("y", heroHeight - heroMarginVert - heroNameHeight/2)
                                    .attr("opacity", sceneNr === 1 ? 1 : 0)
                                    .attr("font-size", fontSizes.hero * (sceneNr === 1 ? 1.2 : 0.8))
                                    .text(d.label)

                            heroG.select("image")
                                .attr("xlink:href", `/website/${d.key}.png`)
                                    .transition()
                                    .duration(transitionIn.duration)
                                    .delay(transitionIn.delay)
                                        .attr("transform", sceneNr >= 2 ? createTransform(d.imgTransformSmall) : createTransform(d.imgTransform))
                                

                            
                            heroG.select("rect.hero-hitbox")
                                .call(updateRectDimns, { 
                                    width:() => d.key === "player" && sceneNr === 1 ? playerWidth : heroWidth, 
                                    height:() => d.key === "player" && sceneNr === 1 ? playerHeight : heroHeight, 
                                    transition:transitionIn,
                                    name:"pers-hitbox-size"
                                })

                            //speech bubble
                            const bubbleWidth = 300;
                            const bubbleHeight = 50;
                            const bubbleData = frameData.heroBubbles?.includes(i) && bubbleLines[d.key] ? [1] : [];
                            const bubbleG = heroG.selectAll("g.bubble").data(bubbleData);
                            bubbleG.enter()
                                .append("g")
                                    .attr("class", "bubble")
                                    .each(function(){
                                        const bubbleG = d3.select(this);
                                        bubbleG.append("rect")
                                            .attr("rx", 25)
                                            .attr("ry", 25)
                                            .attr("fill", grey10(3));

                                        bubbleG.append("text").attr("class", "line1")
                                        bubbleG.append("text").attr("class", "line2")
                                        bubbleG.selectAll("text")
                                            .attr("text-anchor", "middle")
                                            .attr("font-size", fontSizes.bubble)
                                            .attr("stroke-width", 0.8)
                                            .attr("stroke", grey10(8))
                                            .attr("fill", grey10(8));
                                    })
                                    .merge(bubbleG)
                                    .attr("transform", `translate(${heroWidth * 0.8},${(heroHeight - bubbleHeight)/2 + 20})`)
                                    .each(function(){
                                        const bubbleG = d3.select(this);
                                        bubbleG.select("rect")
                                            .attr("width", bubbleWidth)
                                            .attr("height", bubbleHeight);

                                        bubbleG.select("text.line1")
                                            .attr("x", bubbleWidth/2)
                                            .attr("y", 20)
                                            .text(bubbleLines[d.key][0]);
                                        
                                        bubbleG.select("text.line2")
                                            .attr("x", bubbleWidth/2)
                                            .attr("y", 37.5)
                                            .text(bubbleLines[d.key][1]);
                                    })

                            bubbleG.exit().remove();

                        });

                heroG.exit().call(remove, { transition:transitionOut });
        
                //characters
                const characterG = storyContentsG.selectAll("g.character").data(charactersData, d => d.key);
                characterG.enter()
                    .append("g")
                        .attr("class", "character")
                        .call(fadeIn, { transition: transitionIn })
                        .each(function(d){
                            const characterG = d3.select(this);
                            characterG.append("text").attr("class", "character-title")
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")
                                .attr("stroke", "white")
                                .attr("stroke-width", 0.5)
                                .attr("font-size", fontSizes.character)
                                .attr("fill", "white")
                                .attr("x", characterWidth/2)
                                .attr("y", characterHeight/2)
                                .text(d.label);

                            characterG.append("rect").attr("class", "character-hitbox")
                                .attr("fill", "transparent")
                                .attr("rx", 15)
                                .attr("ry", 15)
                                .attr("stroke", "aqua")
                                //.attr("stroke", d.type === "villain" ? "red" : "aqua");
                                .attr("width", characterWidth)
                                .attr("height", characterHeight)

                        })
                        .attr("transform", (d,i) => `translate(${characterX(d,i,dimns)}, ${characterY(d,i,dimns)})`)
                        .merge(characterG)
                        .call(updateTransform, { x:(d, i) => characterX(d, i, dimns), y:(d, i) => characterY(d, i, dimns), transition:transitionIn })
                        //.attr("transform", (d,i) => `translate(${characterX(d,i)}, ${characterY(d,i)})`)
                        .each(function(d,i){
                            const characterG = d3.select(this);

                            characterG.select("text.character-title")
                                .transition("char-text-pos")
                                .duration(transitionIn.duration)
                                .delay(transitionIn.delay)
                                    .attr("x", characterWidth/2)
                                    .attr("y", characterHeight/2)
                                    .text(d.label)
                            
                            characterG.select("rect.character-hitbox")
                                .call(updateRectDimns, { 
                                    width:() => characterWidth, 
                                    height:() => characterHeight, 
                                    transition:transitionIn,
                                    name:"char-hitbox-size"
                                })

                            //speech bubble
                            const bubbleWidth = 300;
                            const bubbleHeight = 65;
                            const bubbleData = frameData.characterBubbles?.includes(i) && bubbleLines[d.key] ? [1] : [];
                            const bubbleG = characterG.selectAll("g.bubble").data(bubbleData);
                            bubbleG.enter()
                                .append("g")
                                    .attr("class", "bubble")
                                    .each(function(){
                                        const bubbleG = d3.select(this);
                                        bubbleG.append("rect")
                                            .attr("rx", 25)
                                            .attr("ry", 25)
                                            .attr("fill", grey10(3));

                                        bubbleG.append("text").attr("class", "line1")
                                        bubbleG.append("text").attr("class", "line2")
                                        bubbleG.append("text").attr("class", "line3")
                                        bubbleG.selectAll("text")
                                            .attr("text-anchor", "middle")
                                            .attr("font-size", fontSizes.bubble)
                                            .attr("stroke-width", 0.8)
                                            .attr("stroke", grey10(8))
                                            .attr("fill", grey10(8));
                                    })
                                    .merge(bubbleG)
                                    .attr("transform", `translate(${-300},${(characterHeight - bubbleHeight)/2 + 20})`)
                                    .each(function(){
                                        const bubbleG = d3.select(this);
                                        bubbleG.select("rect")
                                            .attr("width", bubbleWidth)
                                            .attr("height", bubbleHeight);

                                        bubbleG.select("text.line1")
                                            .attr("x", bubbleWidth/2)
                                            .attr("y", 20)
                                            .text(bubbleLines[d.key][0]);
                                        
                                        bubbleG.select("text.line2")
                                            .attr("x", bubbleWidth/2)
                                            .attr("y", 37.5)
                                            .text(bubbleLines[d.key][1]);

                                        bubbleG.select("text.line3")
                                            .attr("x", bubbleWidth/2)
                                            .attr("y", 55)
                                            .text(bubbleLines[d.key][2]);
                                    })

                            bubbleG.exit().remove();
  

                        });
                
                characterG.exit().call(remove, { transition:transitionOut });

                //middle
                let waveInterval;
                const waveG = wavesContentsG.selectAll("g.wave").data(wavesData);
                waveG.enter()
                    .append("g")
                        .attr("class", "wave")
                        .call(fadeIn, { transition: transitionIn })
                        .each(function(d,i){
                            const waveG = d3.select(this);
                            waveG.append("text").attr("class", "wave-title")
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")
                                .attr("stroke", "white")
                                .attr("stroke-width", 0.5)
                                .attr("font-size", fontSizes.wave)
                                .attr("fill", "white");

                            waveG.append("path")
                                .attr("stroke", grey10(3))
                                .attr("stroke-width", 1)
                                .attr("fill", "none");

                            waveG.append("rect").attr("class", "wave-hitbox")
                                .attr("fill", "transparent")
                                //.attr("stroke", "aqua");

                            let count = -1;
                            //let subcount = 1;
                            waveInterval = d3.interval(() => {
                                if(count === 3){ waveInterval.stop(); }
                                count += 1; 
                                /*if(subcount === 2){
                                    subcount = 1; 
                                    count += 1; 
                                }
                                else{ 
                                    subcount += 1; 
                                }*/
                                

                                waveG.select("text")
                                    .transition("pers-text-pos")
                                    .duration(500)
                                        .attr("font-size", fontSizes.wave * (count === i ? 1.1 : 1))
                                        .attr("stroke-width", count === i ? 0.8 : 0.4)
                                        .attr("stroke", count === i ? grey10(1) : grey10(3));
                                
                                waveG.select("path")
                                    .transition("pers-text-pos")
                                    .duration(500)
                                        //.attr("transform", `scale(${count === i && subcount === 2 ? 1.2 : 1})`)
                                        .attr("stroke-width", count === i ? 3 : 1)
                                        .attr("stroke", count === i ? grey10(1) : grey10(3));
                            }, 500)

                        })
                        .attr("transform", (d,i) => `translate(0, ${i * waveHeight})`)
                        .merge(waveG)
                        .call(updateTransform, { x:() => 0, y:(d, i) => i * waveHeight, transition:transitionIn })
                        //.attr("transform", (d,i) => `translate(0, ${i * waveHeight})`)
                        .each(function(d,i){
                            const waveG = d3.select(this);

                            waveG.select("text.wave-title")
                                .attr("x", waveWidth/2)
                                .attr("y", waveHeight * 0)
                                .text(d.label)

                            const wavelength = Math.round(waveWidth);
                   
                            const halfWavelength = Math.round(wavelength/2);
                            const quarterWavelength = Math.round(wavelength/4);
                            const deltaX = 10;
                            const deltaY = 5;
                            const pt1X = quarterWavelength - deltaX;
                            const pt2X = quarterWavelength + deltaX;
                            const pt3X = halfWavelength + quarterWavelength - deltaX;
                            const pt4X = halfWavelength + quarterWavelength + deltaX;

                            const pt1Y = - waveAmplitude + deltaY;
                            const pt2Y = pt1Y;
                            const pt3Y = waveAmplitude - deltaY;
                            const pt4Y = pt3Y;

                            const pathD = `M 0 0 C ${pt1X} ${pt1Y}, ${pt2X} ${pt2Y}, ${halfWavelength} 0 C ${pt3X} ${pt3Y}, ${pt4X} ${pt4Y}, ${wavelength} 0`

                            waveG.select("path")
                                .attr("d", pathD)
                                //.attr("d", `M0,0 C 40 -45, 60 -45, 100 0 C 140 45, 160 45, 200 0`)
                                .attr("transform", `translate(0, ${waveHeight/2})`)
                            
                            waveG.select("rect.wave-hitbox")
                                .attr("width", waveWidth)
                                .attr("height", waveHeight)

                        });

                waveG.exit().call(remove, { transition:transitionOut });

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
    storyAnimation.frameNr = function (value) {
        if (!arguments.length) { return frameNr; }
        frameNr = value;
        return storyAnimation;
    };

    return storyAnimation;
}
