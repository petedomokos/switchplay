import * as d3 from 'd3';
import { grey10, COLOURS, TRANSITIONS } from "./constants";
import { updateRectDimns } from '../journey/transitionHelpers';
import deckComponent from './deckComponent';

const transformTransition = { update: { duration: TRANSITIONS.MED } };

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
    let updateItemStatus = function(){};
    let updateFrontCardNr = function(){};

    let x = (d,i) => d.x;
    let y = (d,i) => d.y;
    let _deckWidth = (d,i) => 50;
    let _deckHeight = (d,i) => 75;

    let containerG;

    //components
    const deckComponents = {};

    function decks(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;

        updateDimns();
        // expression elements
        selection.each(function (decksData) {
            containerG = d3.select(this)
            //console.log("decks....")

            if(containerG.select("rect").empty()){
                init();
            }

            update(decksData);

            function init(){
            }

            function update(decksData, options={}){
                //console.log("update", selectedDeckId)

                const deckG = containerG.selectAll("g.deck").data(decksData);
                deckG.enter()
                    .append("g")
                        .attr("class", "deck")
                        .each(function(d,i){
                            deckComponents[d.id] = deckComponent();

                            /*d3.select(this).append("rect")
                                .attr("pointer-events", "none")
                                .attr("fill", "none")
                                .attr("stroke", "aqua")*/
                        })
                        .merge(deckG)
                        .attr("transform", (d,i) => `translate(${x(d,i)}, ${y(d,i)})`)
                        .each(function(d,i){
                            const deckWidth = _deckWidth(d,i);
                            const deckHeight = _deckHeight(d,i);

                            /*d3.select(this).select("rect")
                                .attr("width", width)
                                .attr("height", height)*/

                            const deck = deckComponents[d.id];
                            deck
                                .width(deckWidth)
                                .height(deckHeight)
                                //.selectedDeckId(selectedDeckId)
                                .deckIsSelected(selectedDeckId === d.id)
                                .onClickDeck(onClickDeck)
                                .updateItemStatus(updateItemStatus)
                                .updateFrontCardNr(updateFrontCardNr)
                                .transformTransition(transformTransition)
                                //.setForm(setForm)

                            d3.select(this).call(deck)
                        })

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
    decks._deckWidth = function (func) {
        if (!arguments.length) { return _deckWidth; }
        _deckWidth = func;
        return decks;
    };
    decks._deckHeight = function (func) {
        if (!arguments.length) { return _deckHeight; }
        _deckHeight = func;
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
