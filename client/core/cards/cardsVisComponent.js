import * as d3 from 'd3';
import { grey10, COLOURS } from "./constants";
import cardStackComponent from './cardStackComponent';
import { updateRectDimns } from '../journey/transitionHelpers';
import { trophy } from "../../../assets/icons/milestoneIcons.js"

const { GOLD } = COLOURS;

const transformTransition = { update: { duration: 1000 } };

function maxDimns(maxWidth, maxHeight, aspectRatio){
    const potentialHeight = maxWidth * aspectRatio;
    if(potentialHeight <= maxHeight){
        return { width: maxWidth, height: potentialHeight }
    }
    return { width: maxHeight/aspectRatio, height: maxHeight }
}

/*

*/

export default function cardsVisComponent() {
    //API SETTINGS
    // dimensions
    let width = 300;
    let height = 600
    let margin = { left: 40, right: 40, top: 20, bottom: 20 };
    let extraMargin; //if cards dont take up full space
    let contentsWidth;
    let contentsHeight;

    let cardsAreaWidth;
    let cardsAreaHeight;
    let cardsAreaMargin;
    let cardsAreaAspectRatio;
    let topSpaceHeight;
    let botSpaceHeight;

    let progressSummaryWidth = 30;
    let progressSummaryHeight = 30;

    let heldCardsAreaHeight;
    let placedCardsAreaHeight;

    let vertSpaceForIncs;

    let heldCardWidth;
    let heldCardHeight;
    //const cardAspectRatio = 88/62; - normal cards
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

        cardsAreaWidth = contentsWidth;
        topSpaceHeight = contentsHeight * 0.1;
        cardsAreaHeight = contentsHeight * 0.9;
        botSpaceHeight = 0;// contentsHeight * 0.1;
        //this aspectRatio is only needed to aid with selecting a card to takeover entire area
        cardsAreaAspectRatio = cardsAreaWidth/cardsAreaHeight;

        const minInc = 30;
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
        const horizSpaceForIncs = d3.min([cardsAreaWidth * 0.25, maxHorizSpaceForIncs]); 
        horizCardInc = i => {
            if(i === 0) { return 0; }
            if(i === 1) { return horizSpaceForIncs * 0.07; }
            if(i === 2) { return horizSpaceForIncs * (0.07 + 0.13); }
            if(i === 3) { return horizSpaceForIncs * (0.07 + 0.13 + 0.27); }
            if(i === 4) { return horizSpaceForIncs * (0.07 + 0.13 + 0.27 + 0.53); }
        }

        const maxHeldCardWidth = cardsAreaWidth - (horizSpaceForIncs * 2); //need it to be symmetrical
        vertSpaceForIncs = vertCardInc(4);
        placedCardsAreaHeight = d3.min([80, cardsAreaHeight/7]);
        const maxHeldCardHeight = cardsAreaHeight - vertSpaceForIncs - placedCardsAreaHeight;
        const heldCardDimns = maxDimns(maxHeldCardWidth, maxHeldCardHeight, cardAspectRatio);
        heldCardWidth = heldCardDimns.width;
        heldCardHeight = heldCardDimns.height;
    
        heldCardsAreaHeight = heldCardHeight + vertSpaceForIncs;
        //make margin 0 and see if it sorts out horiz overlap
        const cardsAreaMarginVert = (cardsAreaHeight - vertSpaceForIncs - heldCardHeight - placedCardsAreaHeight)/2;
        const cardsAreaMarginHoriz = (cardsAreaWidth - heldCardWidth)/2;
        cardsAreaMargin = { 
            top:cardsAreaMarginVert/2, bottom:cardsAreaMarginVert/2,
            left:cardsAreaMarginHoriz/2, right:cardsAreaMarginHoriz/2
        }

        //placed cards
        const maxPlacedCardHeight = placedCardsAreaHeight * 0.8;
        const maxPlacedCardWidth = d3.min([60, (cardsAreaWidth/5) * 0.8]); //ensure some gap
        const placedCardDimns = maxDimns(maxPlacedCardWidth, maxPlacedCardHeight, cardAspectRatio)
        placedCardWidth = placedCardDimns.width;
        placedCardHeight = placedCardDimns.height;

        placedCardHorizGap = (cardsAreaWidth - 5 * placedCardWidth) / 4;
        placedCardMarginVert = (placedCardsAreaHeight - placedCardHeight)/2;
    }
    let DEFAULT_STYLES = {
        stack:{ info:{ date:{ fontSize:9 } } },
    }
    let _styles = () => DEFAULT_STYLES;

    let frontCardNr = 0; //0 is the first card of 5
    let selectedCardNr;
    let format;

    let setForm = function(){};
    let updateItemStatus = function(){};

    let containerG;
    let contentsG;
    let topSpaceG;
    let cardsG;

    //components
    const stack = cardStackComponent();

    function cardsVis(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;

        updateDimns();
        // expression elements
        selection.each(function (stackData) {
            containerG = d3.select(this)
                .attr("width", width)
                .attr("height", height);

            if(containerG.select("g").empty()){
                init();
            }

            update(stackData);

            function init(){
                containerG.append("rect").attr("class", "cards-vis-bg")
                    .attr("fill", "transparent");
                contentsG = containerG.append("g").attr("class", "cards-vis-contents");

                topSpaceG = contentsG
                    .append("g")
                    .attr("class", "top-space");

                topSpaceG.append("rect").attr("class", "top-space-bg")
                const progressSummaryG = topSpaceG.append("g").attr("class", "cards-progress-summary");
                progressSummaryG.append("rect").attr("class", "cards-progress-summary-hitbox");
                progressSummaryG.append("path")
                    .attr("d", trophy.pathD)
                    .attr("transform", "translate(-2.5,-5) scale(0.4)");
                    
                topSpaceG.append("text")
                    .attr("class", "cards-title")
                    .attr("dominant-baseline", "central")
                    .attr("text-anchor", "middle")

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

            function update(stackData, options={}){
                const { } = options;
                //console.log("update stackData", stackData)
                //dimns for specific chart
                const cardsData = stackData.cards
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
                //console.log("cardsData", cardsData)

                //gs
                contentsG.attr("transform", `translate(${margin.left}, ${margin.top})`)
                cardsG.attr("transform", `translate(0, ${topSpaceHeight})`)

                containerG.select("rect.cards-vis-bg")
                    .call(updateRectDimns, { 
                        width: () => width, 
                        height:() => height,
                        transition:transformTransition
                    })
                
                topSpaceG.select("rect.top-space-bg")
                    .attr("width", contentsWidth)
                    .attr("height", topSpaceHeight)
                    .attr("stroke", "none")
                    .attr("fill", "none")

                topSpaceG.select("text.cards-title")
                    .attr("x", cardsAreaWidth/2)
                    .attr("y", progressSummaryHeight/2)
                    .attr("stroke-width", 0.3)
                    .attr("stroke", grey10(7))
                    .attr("fill", grey10(7))
                    .attr("font-family", "Arial, Helvetica, sans-serif")
                    .text("ENTER TITLE ...");

                const progressSummaryG = topSpaceG.select("g.cards-progress-summary")
                    .attr("transform", `translate(${cardsAreaWidth - progressSummaryWidth}, 0)`)
                
                progressSummaryG.select("rect.cards-progress-summary-hitbox")
                    .attr("width", progressSummaryWidth)
                    .attr("height", progressSummaryHeight)
                    .attr("fill", "transparent")
                    .attr("stroke", "none");

                progressSummaryG.select("path")
                    .attr("fill", stackData.status === 2 ? GOLD : (stackData.status === 1 ? grey10(2) : grey10(6)))

                cardsG
                    .select("rect.cards-bg")
                    .call(updateRectDimns, { 
                        width: () => cardsAreaWidth, 
                        height:() => cardsAreaHeight,
                        transition:transformTransition
                    })

                cardsG
                    .select("rect.placed-cards-bg")
                    .attr("transform", `translate(0,${vertSpaceForIncs + heldCardHeight})`)
                    .call(updateRectDimns, { 
                        width: () => cardsAreaWidth, 
                        height:() => placedCardsAreaHeight,
                        transition:transformTransition
                    })

                //selected card dimns
                const selectedCardDimns = maxDimns(cardsAreaWidth, cardsAreaHeight, cardAspectRatio)
                const selectedCardWidth = selectedCardDimns.width;
                const selectedCardHeight = selectedCardDimns.height;

                cardsG
                    .datum(cardsData)
                    .call(stack
                        .width(heldCardWidth)
                        .height(heldCardHeight)
                        .placedCardWidth(placedCardWidth)
                        .placedCardHeight(placedCardHeight)
                        .selectedCardWidth(selectedCardWidth)
                        .selectedCardHeight(selectedCardHeight)
                        .x((d,i) => {
                            if(d.isSelected){
                                //keep it centred
                                return (cardsAreaWidth - selectedCardWidth)/2;
                            }
                            if(d.isHeld){
                                const extraMarginLeft = (cardsAreaWidth - heldCardWidth)/2;
                                return extraMarginLeft + horizCardInc(d.handPos);
                            }
                            return d.cardNr * (placedCardWidth + placedCardHorizGap);
                        })
                        .y((d,i) => {
                            if(d.isSelected){
                                return (cardsAreaHeight - selectedCardHeight)/2;
                            }
                            if(d.isHeld){
                                return vertSpaceForIncs - vertCardInc(d.handPos)
                            }
                            return heldCardsAreaHeight + placedCardMarginVert;;
                        })
                        .onClickItem(function(e,d){ setForm({ formType: "item", value:d }) })  
                        .onClickLine(function(e,d){
                            const { cardNr, itemNr, status } = d;
                            //new status - todo - use mod 2
                            const newStatus = status === 0 ? 1 : (status === 1 ?  2 : 0)
                            updateItemStatus(cardNr, itemNr, newStatus)
                        })
                        .onClick(function(e,d){
                            //hide/show others
                            containerG.selectAll("g.card").filter(dat => dat.cardNr !== d.cardNr)
                                .attr("pointer-events", d.isSelected ? null : "none")
                                .transition()
                                .duration(200)
                                    .attr("opacity", d.isSelected ? 1 : 0)

                            selectedCardNr = d.isSelected ? null : d.cardNr
                            update(stackData);
                        })
                        .onPickUp(function(d){
                            const prevActiveCardNr = frontCardNr;
                            frontCardNr = d.cardNr;
                            update(stackData);
                        })
                        .onPutDown(function(d){
                            if(d.isSelected){
                                //show other cards as we need to deselect the card too
                                containerG.selectAll("g.card").filter(dat => dat.cardNr !== d.cardNr)
                                    .attr("pointer-events", null)
                                    .attr("opacity", 1)
                            }
                            frontCardNr = d.cardNr + 1;
                            selectedCardNr = null;
                            update(stackData);
                        })) 

            }

        })

        return selection;
    }
    
    //api
    cardsVis.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return cardsVis;
    };
    cardsVis.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return cardsVis;
    };
    cardsVis.styles = function (value) {
        if (!arguments.length) { return _styles; }
        if(typeof value === "function"){
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value(d,i) });
        }else{
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value });
        }
        
        return cardsVis;
    };
    cardsVis.format = function (value) {
        if (!arguments.length) { return format; }
        format = value;
        return cardsVis;
    };
    cardsVis.updateItemStatus = function (value) {
        if (!arguments.length) { return updateItemStatus; }
        updateItemStatus = value;
        return cardsVis;
    };
    cardsVis.setForm = function (value) {
        if (!arguments.length) { return setForm; }
        setForm = value;
        return cardsVis;
    };
    return cardsVis;
}
