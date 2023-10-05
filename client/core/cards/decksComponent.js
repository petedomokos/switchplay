import * as d3 from 'd3';
import { grey10, COLOURS, TRANSITIONS } from "./constants";
import { updateRectDimns } from '../journey/transitionHelpers';
import deckComponent from './deckComponent';

const transformTransition = { update: { duration: TRANSITIONS.MED } };

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

    let selectedDeckId = "";
    let longpressedDeckId = "";
    let selectedCardNr;
    let format;

    let onClickDeck = function(){}
    let onSetLongpressedDeckId = function(){}
    let onMoveDeck = function(){};
    let onDeleteDeck = function(){};
    let onArchiveDeck = function(){};
    let updateItemStatus = function(){};
    let updateFrontCardNr = function(){};
    let setForm = function(){};

    let x = (d,i) => d.x;
    let y = (d,i) => d.y;
    let _deckWidth = (d,i) => 50;
    let _deckHeight = (d,i) => 75;
    let getCell = position => [0,0];

    let containerG;

    //components
    const deckComponents = {};

    function decks(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;

        updateDimns();
        // expression elements
        selection.each(function (decksData) {
            containerG = d3.select(this);

            if(containerG.select("rect").empty()){
                init();
            }

            update(decksData);

            function init(){
            }

            function update(decksData, options={}){
                const deckG = containerG.selectAll("g.deck").data(decksData, d => d.id);
                deckG.enter()
                    .append("g")
                        .attr("class", d => `deck deck-${d.id}`)
                        .each(function(d,i){
                            deckComponents[d.id] = deckComponent();
                        })
                        .merge(deckG)
                        .attr("transform", (d,i) => `translate(${x(d,i)}, ${y(d,i)})`)
                        .each(function(d,i){
                            const deckWidth = _deckWidth(d,i);
                            const deckHeight = _deckHeight(d,i);

                            const deck = deckComponents[d.id];
                            deck
                                .width(deckWidth)
                                .height(deckHeight)
                                .deckIsSelected(selectedDeckId === d.id)
                                .getCell(getCell)
                                .onClickDeck(onClickDeck)
                                .onSetLongpressed(isLongpressed => { 
                                    onSetLongpressedDeckId( isLongpressed ? d.id : "") 
                                })
                                .onMoveDeck(onMoveDeck)
                                .onDeleteDeck(onDeleteDeck)
                                .onArchiveDeck(onArchiveDeck)
                                .updateItemStatus(updateItemStatus)
                                .updateFrontCardNr(updateFrontCardNr)
                                .transformTransition(transformTransition)
                                .setForm(setForm)

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
    decks.getCell = function (func) {
        if (!arguments.length) { return getCell; }
        getCell = func;
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
    decks.longpressedDeckId = function (value) {
        if (!arguments.length) { return longpressedDeckId; }
        longpressedDeckId = value;
        //pass on to each deck
        Object.values(deckComponents).forEach(deck => deck.longpressedDeckId(value))
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
    decks.onSetLongpressedDeckId = function (value) {
        if (!arguments.length) { return onSetLongpressedDeckId; }
        onSetLongpressedDeckId = value;
        return decks;
    };
    decks.onMoveDeck = function (value) {
        if (!arguments.length) { return onMoveDeck; }
        onMoveDeck = value;
        return decks;
    };
    decks.onDeleteDeck = function (value) {
        if (!arguments.length) { return onDeleteDeck; }
        onDeleteDeck = value;
        return decks;
    };
    decks.onArchiveDeck = function (value) {
        if (!arguments.length) { return onArchiveDeck; }
        onArchiveDeck = value;
        return decks;
    };
    return decks;
}
