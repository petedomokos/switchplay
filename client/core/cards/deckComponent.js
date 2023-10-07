import * as d3 from 'd3';
import { grey10, COLOURS, DIMNS, INFO_HEIGHT_PROPORTION_OF_CARDS_AREA, TRANSITIONS } from "./constants";
import cardsComponent from './cardsComponent';
import headerComponent from './headerComponent';
import contextMenuComponent from "./contextMenuComponent";
import dragEnhancements from '../journey/enhancedDragHandler';
import { updateRectDimns } from '../journey/transitionHelpers';
import { getTransformationFromTrans } from '../journey/helpers';
import { isNumber } from '../../data/dataHelpers';
import { ContactSupportOutlined } from '@material-ui/icons';

function maxDimns(maxWidth, maxHeight, aspectRatio){
    const potentialHeight = maxWidth * aspectRatio;
    if(potentialHeight <= maxHeight){
        return { width: maxWidth, height: potentialHeight }
    }
    return { width: maxHeight/aspectRatio, height: maxHeight }
}

const CONTEXT_MENU_ITEM_HEIGHT = 50;
const CONTEXT_MENU_GAP = 10;
const contextMenuData = [ 
    { key:"delete", url:"/delete.png" }, 
    { key:"archive", url:"/archive.png" } 
]

export default function deckComponent() {
    //API SETTINGS
    // dimensions
    let width = 300;
    let height = 600
    let margin = { left: 0, right: 0, top: 0, bottom: 0 };
    //let margin = { left: 40, right: 40, top: 20, bottom: 20 };
    let extraMargin; //if deck dont take up full space

    let contentsWidth;
    let contentsHeight;

    let contextMenuWidth;

    let headerWidth;
    let headerHeight;

    let cardsAreaWidth;
    let cardsAreaHeight;

    let cardsAreaAspectRatio;
    let botSpaceHeight;

    let heldCardsAreaHeight;
    let placedCardsAreaHeight;
    let heldCardInfoHeight;

    //next - go through hw this space is done, as we want it reduced when small
    let vertSpaceForIncs;

    let heldCardWidth;
    let heldCardHeight;
    //const cardAspectRatio = 88/62; - normal deck
    const cardAspectRatio = (88/62) * 0.925; //wider

    let placedCardWidth;
    let placedCardHeight;
    let placedCardMarginVert;
    let placedCardHorizGap;

    let extraMarginLeftForCards;

    //increments
    let vertCardInc;
    let horizCardInc;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        contextMenuWidth = contentsWidth;

        headerWidth = contentsWidth;
        headerHeight = DIMNS.DECK.HEADER_HEIGHT;

        cardsAreaWidth = contentsWidth;
        cardsAreaHeight = contentsHeight - headerHeight;

        //this aspectRatio is only needed to aid with selecting a card to takeover entire area
        cardsAreaAspectRatio = cardsAreaWidth/cardsAreaHeight;

        heldCardInfoHeight = contentsHeight * INFO_HEIGHT_PROPORTION_OF_CARDS_AREA;
        const minInc = heldCardInfoHeight * 0.9;
        const visibleVertCardInc = i => {
            const incA = minInc * 0.6;// 16;
            const incB = minInc * 0.4;// 10;
            const incC = minInc * 0.1;// 4;
            const incD = 0;
            if(i === 0) { return 0; }
            if(i === 1) { return minInc + incA }
            if(i === 2) { return (minInc * 2) + incA + incB; }
            if(i === 3) { return (minInc * 3) + incA + incB + incC; }
            if(i === 4) { return (minInc * 4) + incA + incB + incC + incD; }
        };

        //@todo - change the way horiz is done so its the other way round like vert
        //so horizSpaceForIncs can be calculated after in same way as vertSpaceForIncs
        const maxHorizSpaceForIncs = 20;
        const horizSpaceForVisibleIncs = d3.min([cardsAreaWidth * 0.25, maxHorizSpaceForIncs]); 
        const horizSpaceForNonVisibleIncs = horizSpaceForVisibleIncs * 0.4;
        const visibleHorizCardInc = i => {
            if(i === 0) { return 0; }
            if(i === 1) { return horizSpaceForVisibleIncs * 0.1; }
            if(i === 2) { return horizSpaceForVisibleIncs * (0.1 + 0.13); }
            if(i === 3) { return horizSpaceForVisibleIncs * (0.1 + 0.13 + 0.3); }
            if(i === 4) { return horizSpaceForVisibleIncs * (0.1 + 0.13 + 0.3 + 0.47); }
        };

        //when deck is reduced in size, the cards behind are not visible exceot a tiny bit
        const nonVisibleVertInc = i => i * heldCardInfoHeight * 0.2;
        const nonVisibleHorizInc = i => (i/5) * horizSpaceForNonVisibleIncs; //5 cards

        vertCardInc = deckIsSelected ? visibleVertCardInc : nonVisibleVertInc;
        horizCardInc = deckIsSelected ? visibleHorizCardInc : nonVisibleHorizInc;

        //NOTE: this max must also be same regardless of multideck view or single deck view
        const maxHeldCardWidth = cardsAreaWidth - (horizSpaceForVisibleIncs * 2); //need it to be symmetrical
        //NOTE: vertSpaceForIncs is the same regardless of whether the deck is selected 
        //(ie all card info sections visible) or not
        vertSpaceForIncs = visibleVertCardInc(4);
        //vertSpaceForIncs = vertCardInc(4);
        placedCardsAreaHeight = d3.min([80, cardsAreaHeight/7]); 
        heldCardsAreaHeight = cardsAreaHeight - placedCardsAreaHeight;

        //need to use visibleVertCardInc to calc the dimns...
        const maxHeldCardHeight = cardsAreaHeight - vertSpaceForIncs - placedCardsAreaHeight;
        const heldCardDimns = maxDimns(maxHeldCardWidth, maxHeldCardHeight, cardAspectRatio);
        heldCardWidth = heldCardDimns.width;
        heldCardHeight = heldCardDimns.height;

        //placed deck
        const maxPlacedCardHeight = placedCardsAreaHeight * 0.8;
        //ensure at least 0.1 for gaps
        const maxPlacedCardWidth = (heldCardWidth * 0.9)/5;
        const placedCardDimns = maxDimns(maxPlacedCardWidth, maxPlacedCardHeight, cardAspectRatio)
        placedCardWidth = placedCardDimns.width;
        placedCardHeight = placedCardDimns.height;

        placedCardHorizGap = (heldCardWidth - 5 * placedCardWidth) / 4;

        extraMarginLeftForCards = (cardsAreaWidth - heldCardWidth)/2;
        placedCardMarginVert = (placedCardsAreaHeight - placedCardHeight)/2;
    }
    let DEFAULT_STYLES = {
        deck:{ info:{ date:{ fontSize:9 } } },
    }
    let _styles = () => DEFAULT_STYLES;

    //settings
    let deckIsSelected;
    let selectedCardNr;
    let format;
    let transformTransition;
    let longpressedDeckId;

    //for dragging decks
    let getCell = position => [0,0];
    let cloneG;
    let newCell;

    //data 
    let id;

    let onClickDeck = function(){};
    let onSetLongpressed = function(){};
    let onMoveDeck = function(){};
    let onDeleteDeck = function(){};
    let onArchiveDeck = function(){};
    let setForm = function(){};
    let updateItemStatus = function(){};
    let updateFrontCardNr = function(){};

    let deckIsLongpressed = false;
    let wasLongpressDragged = false;

    let longpressStart;
    let longpressEnd;

    let containerG;
    let contentsG;
    let headerG;
    let cardsAreaG;
    let contextMenuG;

    //components
    const header = headerComponent();
    const cards = cardsComponent();
    const contextMenu = contextMenuComponent();
    const enhancedDrag = dragEnhancements();

    function deck(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;

        updateDimns();
        // expression elements
        selection.each(function (deckData) {
            id = deckData.id;
            containerG = d3.select(this)

            if(containerG.select("g").empty()){
                init();
            }

            update(deckData);

            function init(){
                //bg
                containerG
                    .append("rect")
                        .attr("class", "deck-bg")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("fill", grey10(9))

                contentsG = containerG.append("g").attr("class", "deck-contents");

                contentsG.append("rect")
                    .attr("class", "contents-bg")
                    .attr("pointer-events", "none")
                    .attr("fill", "none")
                    .attr("stroke", grey10(8))
                    .attr("rx", 3)
                    .attr("ry", 3);
                
                headerG = contentsG.append("g")
                    .attr("class", "header")
                    .attr("opacity", isNumber(selectedCardNr) ? 0 : 1);

                cardsAreaG = contentsG
                    .append("g")
                    .attr("class", "cards-area");

                containerG
                    .append("rect")
                        .attr("class", "deck-overlay")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("fill", "transparent")
                        .attr("opacity", 0.3);

                contextMenuG = containerG.append("g")
                    .attr("class", "context-menu")
            }

            function update(_deckData, options={}){
                const { } = options;
                const { id, frontCardNr, listPos, colNr, rowNr } = _deckData;

                //dimns for specific chart
                const cardsData = _deckData.cards
                    .map((card,i) => { 
                        const { cardNr } = card;
                        return {
                            ...card,
                            handPos:cardNr - frontCardNr,
                            isFront:cardNr === frontCardNr,
                            isNext:cardNr - 1 === frontCardNr,
                            isSecondNext:cardNr - 2 === frontCardNr,
                            isHeld:cardNr >= frontCardNr,
                            isSelected:selectedCardNr === card.cardNr
                        }
                    });

                //bg
                containerG.select("rect.deck-bg")
                    .attr("display", isNumber(selectedCardNr) ? null : "none")
                    .attr("width", width)
                    .attr("height", height)
                    .on("click", e => {
                        deselectCard();
                        e.stopPropagation();
                        setForm(null);
                    })
                    /*.call(updateRectDimns, { 
                        width: () => width, 
                        height:() => height,
                        transition:transformTransition,
                        name:d => `deck-dimns-${d.id}`
                    })*/

                //contextMenu
                //note - hoz and vert margins are not the same proportion of total
                const menuMargin = {
                    left: contextMenuWidth * 0.1, right:contextMenuWidth * 0.1,
                    top:CONTEXT_MENU_ITEM_HEIGHT * 0.1, bottom: CONTEXT_MENU_ITEM_HEIGHT * 0.1
                }
                const nrItems = contextMenuData.length;
                const menuItemWidth = (contextMenuWidth - menuMargin.left - menuMargin.right)/nrItems;
                const contextMenuHeight = CONTEXT_MENU_ITEM_HEIGHT + menuMargin.top + menuMargin.bottom;
                contextMenuG
                    .attr("transform", `translate(${(width - contextMenuWidth)/2},${-contextMenuHeight - CONTEXT_MENU_GAP})`)
                
                contextMenu
                    .itemWidth(menuItemWidth)
                    .itemHeight(CONTEXT_MENU_ITEM_HEIGHT)
                    .margin(menuMargin)
                    .onClick((e,d) => {
                        if(d.key === "delete"){
                            console.log("delete")
                            onDeleteDeck(id);
                            cleanupLongpress();
                        }
                        if(d.key === "archive"){
                            console.log("archive")
                            onArchiveDeck(id);
                            cleanupLongpress();
                        }
                        e.stopPropagation();
                    })

                //drag overlay
                enhancedDrag
                    .dragThreshold(100)
                    .onLongpressStart(function(){
                        console.log("lp start") //this not being triggered after delete
                        onSetLongpressed(true); 
                    })
                    .onLongpressDragged(longpressDragged)
                    .onLongpressEnd(function(){
                        if(wasLongpressDragged){
                            onSetLongpressed(false);
                        }
                    });

                const drag = d3.drag()
                    .on("start", deckIsSelected ? null : enhancedDrag(dragStart))
                    .on("drag", deckIsSelected ? null : enhancedDrag(dragged))
                    .on("end", deckIsSelected ? null : enhancedDrag(dragEnd))

                function dragStart(e,d){
                }

                function dragged(e,d){
                    if(longpressedDeckId === id){ wasLongpressDragged = true; }
                    handleDrag(e);
                }

                function dragEnd(e,d){ if(longpressedDeckId === id){ onSetLongpressed(false); } }

                //issue - cloneG is a child of container, which moves, making the clone move too????
                longpressStart = function(e,d){
                    d3.selectAll("g.deck").filter(d => d.id !== id).attr("pointer-events", "none")
                    //create a clone 
                    cloneG = containerG
                        .clone(true)
                        .attr("class", "cloned-deck")
                        .attr("pointer-events", "none") //this allows orig deck to be dragged
                        .attr("opacity", 1)
                        .raise();
                    
                    cloneG.select("rect.deck-overlay").attr("fill", "green")
                    cloneG.select("g.context-menu")
                        .attr("pointer-events", "all")
                        .datum(contextMenuData)
                        .call(contextMenu)

                    //now we have cloned it, we hide the original
                    containerG.attr("opacity", 0)

                    onSetLongpressed(true)
                }
                function longpressDragged(e,d){
                    wasLongpressDragged = true;
                    handleDrag(e);
                }

                function handleDrag(e,d){
                    if(!cloneG) { return; }
                    cloneG.select("g.context-menu").remove();

                    const { translateX, translateY } = getTransformationFromTrans(cloneG.attr("transform"));
                    const newX = translateX + e.dx;
                    const newY = translateY + e.dy;
                    const latestNewCell = getCell([newX, newY]);
                    const currentNewCell = newCell;
                    if(!newCell || latestNewCell.key !== currentNewCell.key){
                        newCell = latestNewCell;
                        // add newCell stroke
                        d3.select(`g.deck-${newCell.deckId}`).select("rect.deck-overlay")
                            .attr("opacity", 0.8)
                            .attr("stroke", "green")
                            .attr("stroke-width", 3)
                    
                        //remove prev 
                        d3.select(`g.deck-${currentNewCell?.deckId}`).select("rect.deck-overlay")
                            .attr("opacity", 0.3)
                            .attr("stroke", null)
                            .attr("stroke-width", null)
                    }
                       
                    //console.log("newcell", newCell)
                    //drag the clone
                    cloneG.attr("transform", `translate(${newX},${newY})`);
                }

                longpressEnd = function(e,d){
                    if(wasLongpressDragged){
                        console.log("newCell", newCell)
                        //@todo - handle grid format if layoutFormat is grid
                        onMoveDeck(listPos, newCell.listPos);

                        cloneG
                            .transition("clone")
                            .duration(TRANSITIONS.MED)
                            .attr("transform", `translate(${newCell.deckX},${newCell.deckY})`)
                            .on("end", function(){
                                cleanupLongpress();
                            })
                        wasLongpressDragged = false;
                    }else{
                        cleanupLongpress();
                    }
                
                    d3.selectAll("g.deck").filter(d => d.id !== id).attr("pointer-events", "all");
                }

                function cleanupLongpress(){
                    cloneG.remove();
                    containerG.attr("opacity", 1);

                    //remove newCell stroke if it exists
                    d3.select(`g.deck-${newCell?.deckId}`).select("rect.deck-overlay")
                        .attr("opacity", 0.3)
                        .attr("stroke", null)
                        .attr("stroke-width", null)

                    onSetLongpressed(false)

                }

                containerG.call(drag)
                    
                containerG.select("rect.deck-overlay")
                    .attr("display", deckIsSelected ? "none" : null)
                    .attr("width", width)
                    .attr("height", height)
                    .on("click", e => {
                        if(longpressedDeckId === id){ 
                            e.stopPropagation();
                            return;
                        }
                        onClickDeck(e, _deckData)
                    })
                    /*.call(updateRectDimns, { 
                        width: () => width, 
                        height:() => height,
                        transition:transformTransition,
                        name:d => `deck-dimns-${d.id}`
                    })*/

                //contents
                contentsG.attr("transform", `translate(${margin.left}, ${margin.top})`)

                contentsG
                    .select("rect.contents-bg")
                        .attr("width", contentsWidth)
                        .attr("height", contentsHeight)
                
                //header
                headerG
                    .datum({ ..._deckData, title:_deckData.title || id })
                    .call(header
                        .width(headerWidth)
                        .height(headerHeight)
                        .margin({ left:deckIsSelected ? 15 : 7.5, right: 0, top: 0, bottom: 0 } )
                        .onClickTitle(function(e){
                            e.stopPropagation();
                            setForm({ formType: "deck-title" }) 
                        })
                        .onClickProgressIcon(onClickDeck))
                

                //Cards area
                /*cardsAreaG
                    .select("rect.cards-area-bg")
                        .attr("width", cardsAreaWidth)
                        .attr("height", cardsAreaHeight)*/


                //selected card dimns
                const selectedCardDimns = maxDimns(cardsAreaWidth, cardsAreaHeight, cardAspectRatio)
                const selectedCardWidth = selectedCardDimns.width;
                const selectedCardHeight = selectedCardDimns.height;

                function selectCard(d){
                    //hide/show others
                    //@todo - this can be part of update process instead
                    containerG.selectAll("g.card").filter(cardD => cardD.cardNr !== d.cardNr)
                        .attr("pointer-events", "none")
                        .transition("cards")
                        .duration(400)
                            .attr("opacity", 0)
                                .on("end", function(){ d3.select(this).attr("display", "none"); })
                
                    headerG
                        .transition("header")
                        .duration(400)
                           .attr("opacity", 0)
                           .on("end", function(){ d3.select(this).attr("display", "none"); })

                    selectedCardNr = d.cardNr;
                    update(deckData);
                }

                //2 issues - clicking card backgrounddoes nothing, but it should still prevent 
                //propagation to the div bg to deslect deck.

                //2nd - swiping the placed cards is not being picked up - perhaps start with clicking
                //all cards, check that is picked up, it should just prevetn ptopagtion thats all

                function deselectCard(){
                    //hide/show others
                    //@todo - this can be part of update process instead
                    containerG.selectAll("g.card")//.filter(d => d.cardNr !== cardD.cardNr)
                        .attr("display", null)
                            .transition("cards")
                            .delay(400)
                            .duration(600)
                                .attr("opacity", 1)
                
                    headerG
                        .attr("display", null)
                            .transition("header")
                            .delay(400)
                            .duration(600)
                            .attr("opacity", 1)

                    selectedCardNr = null
                    update(deckData);
                }


                cardsAreaG
                    .attr("transform", `translate(0, ${headerHeight})`)
                    .datum(cardsData)
                    .call(cards
                        .width(heldCardWidth)
                        .height(heldCardHeight)
                        .infoHeight(heldCardInfoHeight)
                        .placedCardWidth(placedCardWidth)
                        .placedCardHeight(placedCardHeight)
                        .selectedCardWidth(selectedCardWidth)
                        .selectedCardHeight(selectedCardHeight)
                        .deckIsSelected(deckIsSelected)
                        .transformTransition(transformTransition)
                        .x((d,i) => {
                            if(d.isSelected){
                                //keep it centred
                                return (cardsAreaWidth - selectedCardWidth)/2;
                            }
                            if(d.isHeld){
                                return extraMarginLeftForCards + horizCardInc(d.handPos);
                            }
                            return extraMarginLeftForCards + d.cardNr * (placedCardWidth + placedCardHorizGap);
                        })
                        .y((d,i) => {
                            if(d.isSelected){
                                return (cardsAreaHeight - selectedCardHeight)/2;
                            }
                            
                            if(d.isHeld){
                                //extra shift up in multiview to create a pseudo margin between decks
                                //const vertShiftUpForMultiview = heldCardsAreaHeight * 0.25; 
                                //in multideck view, not all the incr space is taken up
                                const totalVertIncs = vertSpaceForIncs;// deckIsSelected ? vertSpaceForIncs : vertCardInc(4);
                                const extraMarginTop = (heldCardsAreaHeight - heldCardHeight - totalVertIncs)/2;
                                //return extraMarginTop + totalVertIncs - vertCardInc(d.handPos) 
                                return extraMarginTop + totalVertIncs - vertCardInc(d.handPos) 
                                   // - (deckIsSelected ? 0 : vertShiftUpForMultiview)
                            }

                            //extra shift up in multiview to create a pseudo margin between decks
                            const vertShiftUpForMultiview = heldCardsAreaHeight * 0.15; 
                            return heldCardsAreaHeight + placedCardMarginVert //- (deckIsSelected ? 0 : vertShiftUpForMultiview);
                        })
                        .onSelectItem(function(item){ 
                            setForm({ formType: "item", value:item }) 
                        })
                        .onUpdateItemStatus(updateItemStatus)
                        .onClickCard(function(e, d){
                            if(!deckIsSelected){
                                onClickDeck(e, _deckData);
                            } else if(d.isSelected){
                                deselectCard(d);
                            } else{
                                selectCard(d);
                            }
                        })
                        .onPickUp(function(d){
                            updateFrontCardNr(d.cardNr)
                        })
                        .onPutDown(function(d){
                            if(d.isSelected){
                                selectedCardNr = null;
                                //show other deck as we need to deselect the card too
                                containerG.selectAll("g.card").filter(dat => dat.cardNr !== d.cardNr)
                                    .attr("pointer-events", null)
                                    .attr("opacity", 1);
                            }
                            updateFrontCardNr(d.cardNr + 1);
                        }))

            }

        })

        return selection;
    }
    
    //api
    deck.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return deck;
    };
    deck.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return deck;
    };
    deck.styles = function (value) {
        if (!arguments.length) { return _styles; }
        if(typeof value === "function"){
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value(d,i) });
        }else{
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value });
        }
        
        return deck;
    };
    deck.deckIsSelected = function (value) {
        if (!arguments.length) { return deckIsSelected; }
        deckIsSelected = value; 
        return deck;
    };
    deck.format = function (value) {
        if (!arguments.length) { return format; }
        format = value;
        return deck;
    };
    deck.transformTransition = function (value) {
        if (!arguments.length) { return transformTransition; }
        transformTransition = value; 
        return deck;
    };
    deck.longpressedDeckId = function (value) {
        if (!arguments.length) { return longpressedDeckId; }
        if(longpressedDeckId === id && value !== id){
            longpressEnd();
        }else if(longpressedDeckId !== id && value === id){
            longpressStart();
        }
        longpressedDeckId = value;
        return deck;
    };
    deck.getCell = function (func) {
        if (!arguments.length) { return getCell; }
        getCell = func;
        return deck;
    };
    //functions
    deck.onClickDeck = function (value) {
        if (!arguments.length) { return onClickDeck; }
        onClickDeck = value;
        return deck;
    };
    deck.onMoveDeck = function (value) {
        if (!arguments.length) { return onMoveDeck; }
        onMoveDeck = value;
        return deck;
    };
    deck.onDeleteDeck = function (value) {
        if (!arguments.length) { return onDeleteDeck; }
        onDeleteDeck = value;
        return deck;
    };
    deck.onArchiveDeck = function (value) {
        if (!arguments.length) { return onArchiveDeck; }
        onArchiveDeck = value;
        return deck;
    };
    deck.onSetLongpressed = function (value) {
        if (!arguments.length) { return onSetLongpressed; }
        onSetLongpressed = value;
        return deck;
    };
    deck.updateItemStatus = function (value) {
        if (!arguments.length) { return updateItemStatus; }
        updateItemStatus = value;
        return deck;
    };
    deck.updateFrontCardNr = function (value) {
        if (!arguments.length) { return updateFrontCardNr; }
        updateFrontCardNr = value;
        return deck;
    };
    deck.setForm = function (value) {
        if (!arguments.length) { return setForm; }
        setForm = value;
        return deck;
    };
    return deck;
}
