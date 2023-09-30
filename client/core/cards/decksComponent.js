import * as d3 from 'd3';
import { grey10, COLOURS, TRANSITIONS } from "./constants";
import { updateRectDimns } from '../journey/transitionHelpers';

//const transformTransition = { update: { duration: 1000 } };
const transformTransition = { update: { duration: TRANSITIONS.MED, delay:1000 } };

function maxDimns(maxWidth, maxHeight, aspectRatio){
    const potentialHeight = maxWidth * aspectRatio;
    if(potentialHeight <= maxHeight){
        return { width: maxWidth, height: potentialHeight }
    }
    return { width: maxHeight/aspectRatio, height: maxHeight }
}

export default function decksComponent() {
    //API SETTINGS
    // dimensions
    let width = 300;
    let height = 600;

    function updateDimns(){

    }
    let DEFAULT_STYLES = {
        decks:{ info:{ date:{ fontSize:9 } } },
    }
    let _styles = () => DEFAULT_STYLES;

    let selectedDeckId;
    let selectedCardNr;
    let format;

    let onClickDeck = function(){}

    let x = (d,i) => d.x;
    let y = (d,i) => d.y;
    let deckWidth = (d,i) => 50;
    let deckHeight = (d,i) => 75;

    let containerG;

    //components
    const deckComponents = {};

    function decks(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;

        updateDimns();
        // expression elements
        selection.each(function (decksData) {
            containerG = d3.select(this)
            //console.log("containerG", this)

            if(containerG.select("rect").empty()){
                init();
            }

            update(decksData);

            function init(){

            }

            function update(decksData, options={}){
                //console.log("update", decksData)

                const deckG = containerG.selectAll("g.deck").data(decksData);
                deckG.enter()
                    .append("g")
                        .attr("class", "deck")
                        .each(function(d,i){
                            const deckG = d3.select(this);
                            deckG.append("rect")
                                .attr("fill", "red")
                                .attr("stroke", "aqua")
                        })
                        .merge(deckG)
                        .attr("transform", (d,i) => `translate(${x(d,i)}, ${y(d,i)})`)
                        .each(function(d,i){
                            d3.select(this).select("rect")
                                .attr("width", deckWidth(d,i))
                                .attr("height", deckHeight(d,i))
                        })
                        .on("click", onClickDeck)

                deckG.exit().remove();

            }

        })

        return selection;
    }
    
    //api
    decks.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return decks;
    };
    decks.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return decks;
    };
    //each deck
    decks.deckWidth = function (func) {
        if (!arguments.length) { return deckWidth; }
        deckWidth = func;
        return decks;
    };
    decks.deckHeight = function (func) {
        if (!arguments.length) { return deckHeight; }
        deckHeight = func;
        return decks;
    };
    decks.x = function (func) {
        if (!arguments.length) { return x; }
        x = func;
        return decks;
    };
    decks.y = function (func) {
        if (!arguments.length) { return y; }
        y = func;
        return decks;
    };
    decks.styles = function (value) {
        if (!arguments.length) { return _styles; }
        if(typeof value === "function"){
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value(d,i) });
        }else{
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value });
        }
        
        return decks;
    };
    decks.selectedDeckId = function (value) {
        if (!arguments.length) { return selectedDeckId; }
        selectedDeckId = value;
        return decks;
    };
    decks.format = function (value) {
        if (!arguments.length) { return format; }
        format = value;
        return decks;
    };
    decks.updateItemStatus = function (value) {
        if (!arguments.length) { return updateItemStatus; }
        updateItemStatus = value;
        return decks;
    };
    decks.updateFrontCardNr = function (value) {
        if (!arguments.length) { return updateFrontCardNr; }
        updateFrontCardNr = value;
        return decks;
    };
    decks.setForm = function (value) {
        if (!arguments.length) { return setForm; }
        setForm = value;
        return decks;
    };
    decks.onClickDeck = function (value) {
        if (!arguments.length) { return onClickDeck; }
        onClickDeck = value;
        return decks;
    };
    return decks;
}
