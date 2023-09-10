import * as d3 from 'd3';
import { grey10, COLOURS, INFO_HEIGHT_PROPORTION_OF_CARDS_AREA, TRANSITIONS } from "./constants";
import cardsComponent from './cardsComponent';
import { updateRectDimns } from '../journey/transitionHelpers';
import { trophy } from "../../../assets/icons/milestoneIcons.js"

const { GOLD } = COLOURS;

//const transformTransition = { update: { duration: 1000 } };
const transformTransition = { update: { duration: TRANSITIONS.MED } };

function maxDimns(maxWidth, maxHeight, aspectRatio){
    const potentialHeight = maxWidth * aspectRatio;
    if(potentialHeight <= maxHeight){
        return { width: maxWidth, height: potentialHeight }
    }
    return { width: maxHeight/aspectRatio, height: maxHeight }
}

/*
next - get transitions working perfectly, so selecting/deselecting a deck is smooth
then - we want the cards to all slide together into one pile so we only see the top one
       when its not selected, and then slide out into position when selected/held,
       with some on the table depening on teh fronNr

*/

export default function deckComponent() {
    //API SETTINGS
    // dimensions
    let width = 300;
    let height = 600
    let margin = { left: 40, right: 40, top: 20, bottom: 20 };
    let extraMargin; //if deck dont take up full space
    let contentsWidth;
    let contentsHeight;

    let deckAreaWidth;
    let deckAreaHeight;
    let deckAreaMargin;
    let deckAreaAspectRatio;
    let botSpaceHeight;

    let heldCardsAreaHeight;
    let placedCardsAreaHeight;
    let heldCardInfoHeight;

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

        deckAreaWidth = contentsWidth;
        deckAreaHeight = contentsHeight;
        botSpaceHeight = 0;// contentsHeight * 0.1;
        //this aspectRatio is only needed to aid with selecting a card to takeover entire area
        deckAreaAspectRatio = deckAreaWidth/deckAreaHeight;

        heldCardInfoHeight = deckAreaHeight * INFO_HEIGHT_PROPORTION_OF_CARDS_AREA;
        const minInc = heldCardInfoHeight * 0.9;
        vertCardInc = i => {
            const incA = 16;
            const incB = 10;
            const incC = 4;
            const incD = 0;
            if(i === 0) { return 0; }
            if(i === 1) { return minInc + incA }
            if(i === 2) { return (minInc * 2) + incA + incB; }
            if(i === 3) { return (minInc * 3) + incA + incB + incC; }
            if(i === 4) { return (minInc * 4) + incA + incB + incC + incD; }
        }

        const maxHorizSpaceForIncs = 50;
        const horizSpaceForIncs = d3.min([deckAreaWidth * 0.25, maxHorizSpaceForIncs]); 
        horizCardInc = i => {
            if(i === 0) { return 0; }
            if(i === 1) { return horizSpaceForIncs * 0.07; }
            if(i === 2) { return horizSpaceForIncs * (0.07 + 0.13); }
            if(i === 3) { return horizSpaceForIncs * (0.07 + 0.13 + 0.27); }
            if(i === 4) { return horizSpaceForIncs * (0.07 + 0.13 + 0.27 + 0.53); }
        }

        const maxHeldCardWidth = deckAreaWidth - (horizSpaceForIncs * 2); //need it to be symmetrical
        vertSpaceForIncs = vertCardInc(4);
        placedCardsAreaHeight = d3.min([80, deckAreaHeight/7]);
        const maxHeldCardHeight = deckAreaHeight - vertSpaceForIncs - placedCardsAreaHeight;
        const heldCardDimns = maxDimns(maxHeldCardWidth, maxHeldCardHeight, cardAspectRatio);
        heldCardWidth = heldCardDimns.width;
        heldCardHeight = heldCardDimns.height;
    
        heldCardsAreaHeight = heldCardHeight + vertSpaceForIncs;
        //make margin 0 and see if it sorts out horiz overlap
        const deckAreaMarginVert = (deckAreaHeight - vertSpaceForIncs - heldCardHeight - placedCardsAreaHeight)/2;
        const deckAreaMarginHoriz = (deckAreaWidth - heldCardWidth)/2;
        deckAreaMargin = { 
            top:deckAreaMarginVert/2, bottom:deckAreaMarginVert/2,
            left:deckAreaMarginHoriz/2, right:deckAreaMarginHoriz/2
        }

        //placed deck
        const maxPlacedCardHeight = placedCardsAreaHeight * 0.8;
        const maxPlacedCardWidth = d3.min([60, (deckAreaWidth/5) * 0.8]); //ensure some gap
        const placedCardDimns = maxDimns(maxPlacedCardWidth, maxPlacedCardHeight, cardAspectRatio)
        placedCardWidth = placedCardDimns.width;
        placedCardHeight = placedCardDimns.height;

        placedCardHorizGap = (deckAreaWidth - 5 * placedCardWidth) / 4;
        placedCardMarginVert = (placedCardsAreaHeight - placedCardHeight)/2;
    }
    let DEFAULT_STYLES = {
        deck:{ info:{ date:{ fontSize:9 } } },
    }
    let _styles = () => DEFAULT_STYLES;

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
                .attr("width", width)
                .attr("height", height);

            if(containerG.select("g").empty()){
                init();
            }

            update(deckData);

            function init(){
                containerG.append("rect").attr("class", "deck-bg")
                    .attr("fill", "transparent");
                contentsG = containerG.append("g").attr("class", "deck-contents");

                cardsG = contentsG
                    .append("g")
                    .attr("class", "cards");

                cardsG.append("rect")
                    .attr("class", "cards-bg")
                    .attr("fill", "transparent")
                    .attr("stroke", "none");

                cardsG.append("rect").attr("class", "placed-cards-bg")
                    .attr("stroke", "none")
                    .attr("fill", "none")
            }

            function update(_deckData, options={}){
                const { } = options;
                const { frontCardNr } = _deckData;

                //dimns for specific chart
                const deckData = _deckData.cards
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
                contentsG.attr("transform", `translate(${margin.left}, ${margin.top})`)

                containerG.select("rect.deck-bg")
                    .call(updateRectDimns, { 
                        width: () => width, 
                        height:() => height,
                        transition:transformTransition
                    })
                
                cardsG
                    .select("rect.cards-bg")
                    .call(updateRectDimns, { 
                        width: () => deckAreaWidth, 
                        height:() => deckAreaHeight,
                        transition:transformTransition
                    })

                cardsG
                    .select("rect.placed-cards-bg")
                    .attr("transform", `translate(0,${vertSpaceForIncs + heldCardHeight})`)
                    .call(updateRectDimns, { 
                        width: () => deckAreaWidth, 
                        height:() => placedCardsAreaHeight,
                        transition:transformTransition
                    })

                //selected card dimns
                const selectedCardDimns = maxDimns(deckAreaWidth, deckAreaHeight, cardAspectRatio)
                const selectedCardWidth = selectedCardDimns.width;
                const selectedCardHeight = selectedCardDimns.height;

                cardsG
                    .datum(deckData)
                    .call(cards
                        .width(heldCardWidth)
                        .height(heldCardHeight)
                        .infoHeight(heldCardInfoHeight)
                        .placedCardWidth(placedCardWidth)
                        .placedCardHeight(placedCardHeight)
                        .selectedCardWidth(selectedCardWidth)
                        .selectedCardHeight(selectedCardHeight)
                        .x((d,i) => {
                            if(d.isSelected){
                                //keep it centred
                                return (deckAreaWidth - selectedCardWidth)/2;
                            }
                            if(d.isHeld){
                                const extraMarginLeft = (deckAreaWidth - heldCardWidth)/2;
                                return extraMarginLeft + horizCardInc(d.handPos);
                            }
                            return d.cardNr * (placedCardWidth + placedCardHorizGap);
                        })
                        .y((d,i) => {
                            if(d.isSelected){
                                return (deckAreaHeight - selectedCardHeight)/2;
                            }
                            if(d.isHeld){
                                return vertSpaceForIncs - vertCardInc(d.handPos)
                            }
                            return heldCardsAreaHeight + placedCardMarginVert;;
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
