import * as d3 from 'd3';
import { grey10, COLOURS, INFO_HEIGHT_PROPORTION_OF_CARDS_AREA, TRANSITIONS } from "./constants";
import cardsComponent from './cardsComponent';
import { updateRectDimns } from '../journey/transitionHelpers';

//const transformTransition = { update: { duration: 1000 } };
const transformTransition = { update: { duration: TRANSITIONS.MED, delay:0 } };

function maxDimns(maxWidth, maxHeight, aspectRatio){
    const potentialHeight = maxWidth * aspectRatio;
    if(potentialHeight <= maxHeight){
        return { width: maxWidth, height: potentialHeight }
    }
    return { width: maxHeight/aspectRatio, height: maxHeight }
}

export default function deckComponent() {
    //API SETTINGS
    // dimensions
    let width = 300;
    let height = 600
    let margin = { left: 40, right: 40, top: 20, bottom: 20 };
    let extraMargin; //if deck dont take up full space
    let contentsWidth;
    let contentsHeight;

    let deckAreaAspectRatio;
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

    //increments
    let vertCardInc;
    let horizCardInc;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
        //this aspectRatio is only needed to aid with selecting a card to takeover entire area
        deckAreaAspectRatio = contentsWidth/contentsHeight;

        heldCardInfoHeight = contentsHeight * INFO_HEIGHT_PROPORTION_OF_CARDS_AREA;
        const minInc = heldCardInfoHeight * 0.9;
        const visibleVertCardInc = i => {
            const incA = 16;
            const incB = 10;
            const incC = 4;
            const incD = 0;
            if(i === 0) { return 0; }
            if(i === 1) { return minInc + incA }
            if(i === 2) { return (minInc * 2) + incA + incB; }
            if(i === 3) { return (minInc * 3) + incA + incB + incC; }
            if(i === 4) { return (minInc * 4) + incA + incB + incC + incD; }
        };

        //@todo - change the way horiz is done so its the other way round like vert
        //so horizSpaceForIncs can be calculated after in same way as vertSpaceForIncs
        const maxHorizSpaceForIncs = 50;
        const horizSpaceForVisibleIncs = d3.min([contentsWidth * 0.25, maxHorizSpaceForIncs]); 
        const horizSpaceForNonVisibleIncs = horizSpaceForVisibleIncs * 0.4;
        const visibleHorizCardInc = i => {
            if(i === 0) { return 0; }
            if(i === 1) { return horizSpaceForVisibleIncs * 0.07; }
            if(i === 2) { return horizSpaceForVisibleIncs * (0.07 + 0.13); }
            if(i === 3) { return horizSpaceForVisibleIncs * (0.07 + 0.13 + 0.27); }
            if(i === 4) { return horizSpaceForVisibleIncs * (0.07 + 0.13 + 0.27 + 0.53); }
        };

        //when deck is reduced in size, the cards behind are not visible exceot a tiny bit
        const nonVisibleVertInc = i => i * heldCardInfoHeight * 0.2;
        const nonVisibleHorizInc = i => (i/5) * horizSpaceForNonVisibleIncs; //5 cards

        //if no deck is selected, then we are in Table view mode so only front card info is seen
        vertCardInc = selectedDeckId ? visibleVertCardInc : nonVisibleVertInc;
        horizCardInc = selectedDeckId ? visibleHorizCardInc : nonVisibleHorizInc;

        //NOTE: this max must also be same regardless of multideck view or single deck view
        const maxHeldCardWidth = contentsWidth - (horizSpaceForVisibleIncs * 2); //need it to be symmetrical
        //NOTE: vertSpaceForIncs is the same regardless of whether the deck is selected 
        //(ie all card info sections visible) or not
        vertSpaceForIncs = visibleVertCardInc(4);
        //vertSpaceForIncs = vertCardInc(4);
        placedCardsAreaHeight = d3.min([80, contentsHeight/7]);
        heldCardsAreaHeight = contentsHeight - placedCardsAreaHeight;

        //need to use visibleVertCardInc to calc the dimns...
        const maxHeldCardHeight = contentsHeight - vertSpaceForIncs - placedCardsAreaHeight;
        const heldCardDimns = maxDimns(maxHeldCardWidth, maxHeldCardHeight, cardAspectRatio);
        heldCardWidth = heldCardDimns.width;
        heldCardHeight = heldCardDimns.height;

        //placed deck
        const maxPlacedCardHeight = placedCardsAreaHeight * 0.8;
        const maxPlacedCardWidth = d3.min([60, (contentsWidth/5) * 0.8]); //ensure some gap
        const placedCardDimns = maxDimns(maxPlacedCardWidth, maxPlacedCardHeight, cardAspectRatio)
        placedCardWidth = placedCardDimns.width;
        placedCardHeight = placedCardDimns.height;

        placedCardHorizGap = (contentsWidth - 5 * placedCardWidth) / 4;
        placedCardMarginVert = (placedCardsAreaHeight - placedCardHeight)/2;
    }
    let DEFAULT_STYLES = {
        deck:{ info:{ date:{ fontSize:9 } } },
    }
    let _styles = () => DEFAULT_STYLES;

    let selectedDeckId;
    let selectedCardNr;
    let format;

    let setForm = function(){};
    let updateItemStatus = function(){};
    let updateFrontCardNr = function(){};

    let containerG;
    let contentsG;
    let cardsG;

    //components
    const cards = cardsComponent();

    function deck(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;

        updateDimns();
        // expression elements
        selection.each(function (deckData) {
            containerG = d3.select(this)

            if(containerG.select("g").empty()){
                init();
            }

            update(deckData);

            function init(){
                containerG
                    .attr("width", width)
                    .attr("height", height);

                containerG
                    .append("rect")
                        .attr("class", "deck-bg")
                        .attr("fill", "transparent")
                        //.attr("fill", "red")
                        //.attr("stroke", "yellow");

                contentsG = containerG.append("g").attr("class", "deck-contents");

                cardsG = contentsG
                    .append("g")
                    .attr("class", "cards");

                cardsG.append("rect")
                    .attr("class", "cards-bg")
                    .attr("fill", "transparent")
                    //.attr("fill", "red")
                    //.attr("stroke", "red");

                /*cardsG.append("rect").attr("class", "placed-cards-bg")
                    .attr("stroke", "none")
                    .attr("fill", "none");*/
            }

            function update(_deckData, options={}){
                //console.log("update", _deckData)
                const { } = options;
                const { frontCardNr } = _deckData;

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

                //gs
                //we can transition even on enter as it will just have no effect
                containerG
                    //.transition("svg-dimns")
                    //.duration(TRANSITIONS.MED)
                        .attr("width", width)
                        .attr("height", height)

                contentsG.attr("transform", `translate(${margin.left}, ${margin.top})`)

                containerG.select("rect.deck-bg")
                    .attr("width", width)
                    .attr("height", height)
                    /*.call(updateRectDimns, { 
                        width: () => width, 
                        height:() => height,
                        transition:transformTransition,
                        name:d => `deck-dimns-${d.id}`
                    })*/
                
                cardsG
                    .select("rect.cards-bg")
                        .attr("width", contentsWidth)
                        .attr("height", contentsHeight)

                    /*.call(updateRectDimns, { 
                        width: () => contentsWidth, 
                        height:() => contentsHeight,
                        transition:transformTransition,
                        name:d => `cards-dimns-${d.id}`
                    })

                cardsG
                    .select("rect.placed-cards-bg")
                    .attr("transform", `translate(0,${heldCardsAreaHeight})`)
                    .call(updateRectDimns, { 
                        width: () => contentsWidth, 
                        height:() => placedCardsAreaHeight,
                        transition:transformTransition,
                        name:d => `placed-cards-dimns-${d.id}`
                    })*/

                //selected card dimns
                const selectedCardDimns = maxDimns(contentsWidth, contentsHeight, cardAspectRatio)
                const selectedCardWidth = selectedCardDimns.width;
                const selectedCardHeight = selectedCardDimns.height;

                cardsG
                    .datum(cardsData)
                    .call(cards
                        .width(heldCardWidth)
                        .height(heldCardHeight)
                        //.width(247.5)
                        //.height(324.94)
                        //.width(187.5)
                        //.height(246.17)
                        .infoHeight(heldCardInfoHeight)
                        .placedCardWidth(placedCardWidth)
                        .placedCardHeight(placedCardHeight)
                        .selectedCardWidth(selectedCardWidth)
                        .selectedCardHeight(selectedCardHeight)
                        //.selectedDeckId(selectedDeckId)
                        .transformTransition(transformTransition)
                        .x((d,i) => {
                            if(d.isSelected){
                                //keep it centred
                                return (contentsWidth - selectedCardWidth)/2;
                            }
                            if(d.isHeld){
                                const extraMarginLeft = (contentsWidth - heldCardWidth)/2;
                                return extraMarginLeft + horizCardInc(d.handPos);
                            }
                            return d.cardNr * (placedCardWidth + placedCardHorizGap);
                        })
                        .y((d,i) => {
                            if(d.isSelected){
                                return (contentsHeight - selectedCardHeight)/2;
                            }
                            
                            if(d.isHeld){
                                //extra shift up in multiview to create a pseudo margin between decks
                                const vertShiftUpForMultiview = heldCardsAreaHeight * 0.15; 
                                //in multideck view, not all the incr space is taken up
                                const totalVertIncs = selectedDeckId ? vertSpaceForIncs : vertCardInc(4);
                                const extraMarginTop = (heldCardsAreaHeight - heldCardHeight - totalVertIncs)/2;
                                return extraMarginTop + totalVertIncs - vertCardInc(d.handPos) 
                                    - (selectedDeckId ? 0 : vertShiftUpForMultiview)
                            }

                            //extra shift up in multiview to create a pseudo margin between decks
                            const vertShiftUpForMultiview = heldCardsAreaHeight * 0.25; 
                            return heldCardsAreaHeight + placedCardMarginVert - (selectedDeckId ? 0 : vertShiftUpForMultiview);
                        })
                        .onSelectItem(function(item){ 
                            setForm({ formType: "item", value:item }) 
                        })  
                        .onUpdateItemStatus(updateItemStatus)
                        .onClickCard(function(e, d){
                            //hide/show others
                            containerG.selectAll("g.card").filter(dat => dat.cardNr !== d.cardNr)
                                .attr("pointer-events", d.isSelected ? null : "none")
                                .transition()
                                .duration(200)
                                    .attr("opacity", d.isSelected ? 1 : 0)

                            selectedCardNr = d.isSelected ? null : d.cardNr
                            update(deckData);
                        })
                        .onPickUp(function(d){
                            updateFrontCardNr(d.cardNr)
                            //frontCardNr = d.cardNr;
                            //update(deckData);
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
                            //frontCardNr = d.cardNr + 1;
                            //update(deckData);
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
    deck.selectedDeckId = function (value) {
        if (!arguments.length) { return selectedDeckId; }
        selectedDeckId = value;
        return deck;
    };
    deck.format = function (value) {
        if (!arguments.length) { return format; }
        format = value;
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
