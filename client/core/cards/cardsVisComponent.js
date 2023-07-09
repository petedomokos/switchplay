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
    const cardAspectRatio = 88/62;

    let placedCardWidth;
    let placedCardHeight;
    let placedCardMarginVert;
    let placedCardHorizGap;

    //increments
    let vertCardInc;
    let horizCardInc;

    function updateDimns(){
        console.log("height", height)
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
    let allItemsProgressData = [
        [2,2,2,1,0],
        [2,1,2,1,0],
        [2,1,0,0,0],
        [0,0,0,0,0],
        [0,0,0,0,0]
    ];

    const itemsDataLayout = allItemsProgressData => 
        allItemsProgressData.map((itemsProgressData,i) =>
            itemsProgressData.map((progressStatus, j) => 
                ({ cardNr:i, itemNr:j, progressStatus })))
    

    const calcCardProgressStatus = items => {
        if(items.filter(it => it.progressStatus !== 2).length === 0){ return 2; }
        if(items.filter(it => it.progressStatus !== 2).length <= 2) { return 1; }
        return 0;
    }
    const calcCardsProgressStatus = cards => {
        if(cards.filter(c => c.progressStatus !== 2).length === 0){ return 2; }
        if(cards.filter(c => c.progressStatus !== 2).length <= 2) { return 1; }
        return 0;
    }

    let format;

    let setReactComponent = function(){};

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
        selection.each(function (data) {
            containerG = d3.select(this)
                .attr("width", width)
                .attr("height", height);

            if(containerG.select("g").empty()){
                init();
            }

            update(data);

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
                    .attr("stroke", "yellow")//none");

                cardsG.append("rect").attr("class", "placed-cards-bg")
                    .attr("stroke", "white")
                    .attr("fill", "none")
            }

            function update(data, options={}){
                const { } = options;
                //dimns for specific chart
                const allItemsData = itemsDataLayout(allItemsProgressData);
                //console.log("allItemsData", allItemsData)
                const cardsData = data
                    .map((card,i) => { 
                        const cardNr = data.length - 1 - i;
                        return {
                            ...card,
                            cardNr,
                            handPos:cardNr - frontCardNr,
                            isFront:cardNr === frontCardNr,
                            isNext:cardNr - 1 === frontCardNr,
                            isSecondNext:cardNr - 2 === frontCardNr,
                            isHeld:cardNr >= frontCardNr,
                            itemsData:allItemsData[cardNr],
                            progressStatus:calcCardProgressStatus(allItemsData[cardNr])
                        }
                    });
                
                const cardsProgressStatus = calcCardsProgressStatus(cardsData);
                const selectedCard = cardsData.find(c => c.isSelected)

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
                    .attr("fill", cardsProgressStatus === 2 ? GOLD : (cardsProgressStatus === 1 ? grey10(2) : grey10(6)))

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
                        .onLineClick(function(e,d){
                            const { cardNr, itemNr, progressStatus } = d;
                            //new status - todo - use mod 2
                            const newProgressStatus = progressStatus === 0 ? 1 : (progressStatus === 1 ?  2 : 0)
                            allItemsProgressData = allItemsProgressData
                                .map((cardItemsData,i) => {
                                    if(i !== cardNr) { return cardItemsData; }
                                    return cardItemsData.map((progressStatus,j) => {
                                        if(j !== itemNr) { return progressStatus; }
                                        return newProgressStatus;
                                    })
                                })
                            update(data);
                        })
                        .onClick(function(e,d){
                            //hide/show others
                            containerG.selectAll("g.card").filter(dat => dat.id !== d.id)
                                .attr("pointer-events", d.isSelected ? null : "none")
                                .transition()
                                .duration(200)
                                    .attr("opacity", d.isSelected ? 1 : 0)

                            //todo next - sort out the confusion between data and cardsData... this use of i
                            //is causing issues, when we use cardsdata below, teh selecion works but the 
                            //opacities of 5th card is not 0. and then they all become about 0.6!

                            //need to simplify the data processing, using layout instead of this component to label 
                            //cardNr, and using cardNr instead of i so its clear. and then just thinking it through
                            const newData = cardsData.map((dat,i) => ({ 
                                ...dat,
                                statusChanging:dat.id === d.id,
                                isSelected:dat.id === d.id ? !dat.isSelected : dat.isSelected
                            }))
                            update(newData);
                        })
                        .onPickUp(function(d){
                            const prevActiveCardNr = frontCardNr;
                            frontCardNr = d.cardNr;

                            update(data.map((dat,i) => ({ 
                                ...dat,
                                statusChanging:dat.cardNr < prevActiveCardNr && data.cardNr >= frontCardNr
                            })));
                        })
                        .onPutDown(function(d){
                            if(d.isSelected){
                                //show other cards as we need to deselect the card too
                                containerG.selectAll("g.card").filter(dat => dat.id !== d.id)
                                    .attr("pointer-events", null)
                                    .attr("opacity", 1)
                            }
                            const prevActiveCardNr = frontCardNr;
                            frontCardNr = d.cardNr + 1;
                            update(data.map((dat,i) => ({ 
                                ...dat, 
                                statusChanging:data.cardNr >= prevActiveCardNr && data.cardNr < frontCardNr,
                                isSelected:false
                            })));
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
    cardsVis.setReactComponent = function (value) {
        if (!arguments.length) { return setReactComponent; }
        setReactComponent = value;
        return cardsVis;
    };
    return cardsVis;
}
