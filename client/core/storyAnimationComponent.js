import * as d3 from 'd3';
import { grey10, COLOURS } from "./cards/constants"
const { GOLD } = COLOURS;

import { updateTransform, updateRectDimns } from './journey/transitionHelpers';
/*import deckComponent from './deckComponent';
import { getTransformationFromTrans } from '../journey/helpers';*/
import { fadeIn, remove } from './journey/domHelpers';

const nillOpp = () => 0;
//todo - make a random point generator for x and y deltas
//const squiggleD = `M 0 0, 5 5, -3 9, -7 14, 9 17, -5 22, 5 28`;

const heroes = [
    {
        key:"coach", label:"Coach", 
        transform:{ 1:{ x: -90, y: -5, k:0.22 }, 2:{ x: -63, y: -3, k:0.15 } }
    },
    { 
        key:"analyst", label:"Analyst",  
        transform:{ 1:{ x: -10, y: 0, k:0.11 }, 2:{ x: -9, y: 0, k:0.08 } }
    },
    { 
        key:"player", label:"Player", 
        transform:{ 1:{ x: -68, y: 0, k:0.34 }, 2:{ x: -30, y: -4, k:0.13 } }
    },
    { 
        key:"manager", label:"Manager",
        transform:{ 1:{ x: -160, y: -30, k:0.33 }, 2:{ x: -105, y: -20, k:0.22 } } 
    },
    { 
        key:"parent", label:"Parent",
        transform:{ 1:{ x: -60, y: -30, k:0.35 }, 2:{ x: -45, y: -22, k:0.25 } }  
    },
]

const characters = [
    { key:"kitman", label:"IT" }, //need IDP admin in here too
    { key:"data", label:"Data" },
    { key:"video", label:"Video" },
    { key:"goals", label:"Goals" },
    { key:"reviews", label:"Reviews" },
    { key:"reports", label:"Reports" },
]

const waves = [
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
    let scaledContentsWidth;
    let scaledContentsHeight;
    let contentsWidth;
    const fixedContentsHeight = 400;
    let scaleK;

    //scene 1
    const heroRadiusScene1 = fixedContentsHeight * 0.125;
    const playerRadiusScene1 = fixedContentsHeight * 0.25;
    const personLabelHeight = 30;
    const personLabelMargin = { top: 5, bottom: 5}
    const personLabelContentsHeight = personLabelHeight - personLabelMargin.top - personLabelMargin.bottom; 

    //scene 2
    const nrPeople = 5;
    const vertGapBetweenPeople = 15;
    const heroRadiusScene2 = ((fixedContentsHeight - (4 * vertGapBetweenPeople))/nrPeople)/2;

    const _heroRadius = sceneNr => sceneNr === 1 ? heroRadiusScene1 : heroRadiusScene2;
    const _playerRadius = sceneNr => sceneNr === 1 ? playerRadiusScene1 : heroRadiusScene2;

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
        margin = { left: width * 0, right:width * 0, top: height * 0, bottom: height * 0 }

        scaledContentsWidth = width - margin.left - margin.right;
        scaledContentsHeight = height - margin.top - margin.bottom;
        const aspectRatio = height / width || 1;
        contentsWidth = fixedContentsHeight / aspectRatio;
        scaleK = scaledContentsHeight / fixedContentsHeight;

        heroesWidth = d3.max([55, contentsWidth * 0.2]);
        charactersWidth = d3.max([70, contentsWidth * 0.2]);
        wavesWidth = contentsWidth - heroesWidth - charactersWidth;
        wavesHeight = fixedContentsHeight;
        wavesMargin = { 
            left: d3.max([35, contentsWidth * 0.1]), 
            right: d3.max([35, contentsWidth * 0.1]), 
            top: fixedContentsHeight * 0.1, 
            bottom:fixedContentsHeight * 0.1
        }

        wavesContentsWidth = wavesWidth - wavesMargin.left - wavesMargin.right;
        wavesContentsHeight = wavesHeight - wavesMargin.top - wavesMargin.bottom;

        logoRectWidth = d3.max([75, fixedContentsHeight/3.5]);
        logoRectHeight = logoRectWidth * 1.5;

        fontSizes = {
            hero:16,
            character:15,
            logo:logoRectWidth * 0.12,
            wave:d3.max([10, contentsWidth/20]),
        }

    }

    let DEFAULT_STYLES = {
        storyAnimation:{ info:{ date:{ fontSize:9 } } },
    }
    let _styles = () => DEFAULT_STYLES;

    //state
    let sceneNr = 0;
    let frameNr = 0;

    function storyAnimation(selection, options={}) {
        const { } = options;

        updateDimns();

        //transitions into and out of this scene
        const duration = 500;
        const transitionIn = { delay:duration + 50, duration }
        //scene 1 must remove any stuff from the final scene (which may ) quicker
        const transitionOut = { duration:1000/*sceneNr === 1 ? 200 : duration*/ }

        // expression elements
        selection.each(function (frameData) {
            const containerG = d3.select(this);

            if(containerG.select("g.story-animation-contents").empty()){
                init.call(this, frameData);
            }

            update.call(this, frameData);

            function init(){
                const containerElement = d3.select(this)
                    .attr("width", width)
                    .attr("height", height);

                containerElement.append("rect")
                    .attr("class", "story-animation-bg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("stroke", "none")// grey10(5))
                    .attr("stroke-width", 0.3)
                    .attr("fill", "transparent");

                const contentsG = containerElement.append("g")
                    .attr("class", "story-animation-contents")
                    .attr("transform", `translate(${margin.left},${margin.top}) scale(${scaleK})`);
                
                contentsG
                    .append("rect")
                        .attr("class", "contents-bg")
                        //.attr("stroke", "red")
                        .attr("fill", "none")

                contentsG.append("g").attr("class", "heroes")
                    .append("rect")
                        .attr("class", "heroes-bg")
                        .attr("fill", "none")
                        //.attr("stroke", "white");

                contentsG.append("g").attr("class", "characters")
                    .append("rect")
                        .attr("class", "characters-bg")
                        .attr("fill", "none")
                        //.attr("stroke", "white");

                //waves 
                const wavesG = contentsG.append("g").attr("class", "waves")
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
                const heroRadius = _heroRadius(sceneNr);
                const playerRadius = _playerRadius(sceneNr);
                const heroDiameter = heroRadius * 2;
                const playerDiameter = playerRadius * 2;

                //characters data
                const characterWidth = charactersWidth;
                const vertGapBetweenCharacters = nrCharacters === 0 ? 0 : (fixedContentsHeight/nrCharacters) * 0.2;
                const nrCharacterGaps = nrCharacters - 1;
                const vertSpaceForCharacters = fixedContentsHeight - (vertGapBetweenCharacters * nrCharacterGaps);
                const characterHeight = nrCharacters === 0 ? 0 : vertSpaceForCharacters/nrCharacters;

                //waves data   
                const waveWidth = wavesContentsWidth;
                const waveHeight = nrWaves === 0 ? 0 : wavesContentsHeight/nrWaves;
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
                    contentsWidth, contentsHeight:fixedContentsHeight,
                    heroDiameter, characterWidth, characterHeight, waveWidth, waveHeight, waveAmplitude,
                    playerDiameter, personLabelHeight, vertGapBetweenPeople, vertGapBetweenCharacters
                }


                //RENDER
                //Main gs and bgs
                const containerElement = d3.select(this)
                containerElement.select("rect.story-animation-bg")
                    .call(updateRectDimns, { 
                        width: () => width * 0.999, //not sure why it doesnt show when * 1
                        height:() => height,
                        transition:transitionIn
                    })

                const contentsG = containerElement.select("g.story-animation-contents")
                    .call(updateTransform, { x:() => margin.left, y:() => margin.top, k:() => scaleK, transition:transitionIn })
                    //.attr("transform", `translate(${margin.left},${margin.top})`);

                const wavesG = contentsG.select("g.waves")
                    .call(updateTransform, { x:() => heroesWidth, y:() => 0, transition:transitionIn })
                    //.attr("transform", `translate(${heroesWidth}, 0)`)

                const wavesContentsG = wavesG.select("g.waves-contents")
                    .call(updateTransform, { x:() => wavesMargin.left, y:() => wavesMargin.top, transition:transitionIn })
                    //.attr("transform", `translate(${wavesMargin.left}, ${wavesMargin.top})`)

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
                        .attr("transform", d => {
                            //we remove half the extra gao that is seen due to char width being nore than person diameter
                            const extraGapDueToCharWidth = characterWidth - heroDiameter;
                            return `translate(${(contentsWidth - extraGapDueToCharWidth/2)/2},${fixedContentsHeight/2})`
                        })
                        .each(function(){
                            d3.select(this).select("rect")
                                .attr("x", -logoRectWidth/2)
                                .attr("y", -logoRectHeight/2)
                                .attr("width", logoRectWidth)
                                .attr("height", logoRectHeight)
                        })

                switchplayLogoG.exit().call(remove, { transition:transitionOut });

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
                                .attr("r", playerRadius)

                //const imgWidth = sceneNr === 1 ? 95 : 95 * 0.65;
                //const imgHeight = sceneNr === 1 ? 70 : 70 * 0.65;
                //const createTransform = obj => `translate(${(obj?.x || 0) - imgWidth/2},${(obj?.y || 0) - imgHeight/2}) scale(${obj?.k || 1})`
                const _r = d => d.key === "player" ? playerRadius : heroRadius;
                const createTransform = d => {
                    const transObj = d.transform[sceneNr];
                    const r = _r(d);
                    return `translate(${transObj?.x - r},${transObj?.y - r}) scale(${transObj?.k})`
                }
               
                const heroG = contentsG.selectAll("g.hero").data(heroesData, d => d.key);
                heroG.enter()
                    .append("g")
                        .attr("class", "hero")
                        .call(fadeIn, { transition: transitionIn })
                        .each(function(d){
                            const heroG = d3.select(this);
                            const heroImageG = heroG.append("g")
                                .attr("class", "image")
                                .attr('clip-path', d.key === "player" ? `url(#player-clip)` : `url(#hero-clip)`)
                                .attr("transform", d.key === "player" ?
                                    `translate(${playerRadius},${playerRadius})` : 
                                    `translate(${heroRadius},${heroRadius})`)

                            heroG.append("text").attr("class", "hero-title")
                                .attr("display", d.key === "player" || sceneNr === 2 ? "none" : null)
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")
                                .attr("stroke", "white")
                                .attr("stroke-width", 0.2)
                                .attr("font-size", fontSizes.hero)
                                .attr("fill", "white")
                                .attr("x", heroRadius/2)
                                .attr("y", heroDiameter + personLabelMargin.top + personLabelHeight/2)
                                .attr("opacity", sceneNr === 1 ? 1 : 0.6)
                                .text(d.label);

                            heroImageG.append("image")
                                .attr("transform", createTransform(d))

                            heroImageG.append("circle")
                                .attr("fill", "none")
                                .attr("stroke", d.key === "player" ? GOLD : grey10(2))
                                .attr("stroke-width", d.key === "player" ? 0.7 : 0.5)
                                .attr("r", _r(d))

                        })
                        .attr("transform", (d,i) => `translate(${heroX(d,i,dimns)}, ${heroY(d,i,dimns)})`)
                        .merge(heroG)
                        .call(updateTransform, { 
                            x:(d, i) => heroX(d, i, dimns), 
                            y:(d, i) => heroY(d, i, dimns),
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
                                .attr("transform", d.key === "player"? 
                                    `translate(${playerRadius},${playerRadius})` : 
                                    `translate(${heroRadius},${heroRadius})`)

                            heroImageG.select("circle")
                                .transition("pers-circ-pos")
                                .duration(transitionIn.duration)
                                .delay(transitionIn.delay)
                                    .attr("r", _r(d));

                            heroG.select("text.hero-title")
                                .transition("pers-text-pos")
                                .duration(transitionIn.duration)
                                .delay(transitionIn.delay)
                                    .attr("x", heroRadius)
                                    .attr("y", heroDiameter + personLabelMargin.top + personLabelContentsHeight/2)
                                    .attr("opacity", sceneNr === 1 ? 1 : 0)
                                    .attr("font-size", fontSizes.hero)
                                    .text(d.label)

                            heroG.select("image")
                                .attr("xlink:href", `/website/${d.key}.png`)
                                    .transition()
                                    .duration(transitionIn.duration)
                                    .delay(transitionIn.delay)
                                        .attr("transform", createTransform(d))
                        })

                heroG.exit().call(remove, { transition:transitionOut });
        
                //characters
                const characterG = contentsG.selectAll("g.character").data(charactersData, d => d.key);
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
                                    .attr("font-size", fontSizes.character)
                                    .text(d.label)
                            
                            characterG.select("rect.character-hitbox")
                                .call(updateRectDimns, { 
                                    width:() => characterWidth, 
                                    height:() => characterHeight, 
                                    transition:transitionIn,
                                    name:"char-hitbox-size"
                                })

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
