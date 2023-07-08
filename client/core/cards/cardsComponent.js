import * as d3 from 'd3';
import { grey10 } from "./constants";
import cardStackComponent from './cardStackComponent';
import dragEnhancements from '../journey/enhancedDragHandler';
import { updateRectDimns } from './transitionHelpers';
//import { trophy } from "../../../assets/icons/milestoneIcons.js"

const transformTransition = { update: { duration: 1000 } };

/*

*/

export default function cardsComponent() {
    //API SETTINGS
    // dimensions
    let width = 300;
    let height = 600
    let margin = { left: 40, right: 40, top: 20, bottom: 20 };
    let contentsWidth;
    let contentsHeight;

    let cardsAreaWidth;
    let cardsAreaHeight;
    let cardsAreaAspectRatio;
    let topSpaceHeight;
    let botSpaceHeight;

    let progressSummaryWidth = 30;
    let progressSummaryHeight = 30;

    let heldCardsAreaHeight;
    let placedCardsAreaHeight;

    let heldCardWidth;
    let heldCardHeight;
    let cardAspectRatio = 0.7;

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
        cardsAreaHeight = contentsHeight * 0.8;
        botSpaceHeight = contentsHeight * 0.1;
        cardsAreaAspectRatio = cardsAreaWidth/cardsAreaHeight;

        heldCardsAreaHeight = cardsAreaHeight * (9/11);
        placedCardsAreaHeight = cardsAreaHeight * (2/11);

        //we want vertGap to be 1/7 of heldCardHeight, so 11/7 * heldCardHeight = heldCardsAreaHeight 
        // => heldCardHeight = 7/11 * heldCardsAreaHeight
        heldCardHeight = (7/11) * heldCardsAreaHeight;
        vertCardInc = (1/7) * heldCardHeight;

        //aspect-ratio of cards is 0.7
        heldCardWidth = heldCardHeight * cardAspectRatio;

        const horizSpaceForIncs = (contentsWidth - heldCardWidth)/2;
        horizCardInc = horizSpaceForIncs / 4;

        //placed cards
        placedCardMarginVert = placedCardsAreaHeight * 0.25, 
        placedCardHeight = placedCardsAreaHeight - 2 * placedCardMarginVert;
        //keep aspect-ratio same as placedCards
        placedCardWidth = placedCardHeight * (heldCardWidth/heldCardHeight);
        placedCardHorizGap = (cardsAreaWidth - 5 * placedCardWidth) / 4;
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

    let swipable = true;
    let currentPage = PROFILE_PAGES[0];

    //state
    let selectedMilestone;
    let isSelected = milestoneId => false;
    let selectedKpi;

    let endMilestoneEdit = function(){}

    let format;

    const drag = d3.drag();
    const enhancedDrag = dragEnhancements();

    let setReactComponent = function(){};

    let containerG;
    let contentsG;
    let topSpaceG;
    let cardsG;

    //components
    const stack = cardStackComponent()
        .onCtrlClick((e,d) => { 
            ignoreNextWrapperClick = true;
        });

    function cards(selection, options={}) {
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
            console.log("cardsComponent data", data)

            //update(data, { slideTransition:SLIDE_TRANSITION });
            function init(){
                containerG.append("rect").attr("class", "mbar-container-bg")
                    .attr("fill", "transparent");
                contentsG = containerG.append("g").attr("class", "mbar-contents");
                contentsG.append("rect")
                    .attr("class", "mbar-contents-bg")
                    .attr("fill","transparent");

                topSpaceG = contentsG
                    .append("g")
                    .attr("class", "top-space");

                topSpaceG.append("rect").attr("class", "top-space-bg")
                const progressSummaryG = topSpaceG.append("g").attr("class", "cards-progress-summary");
                progressSummaryG.append("rect").attr("class", "cards-progress-summary-hitbox");
                progressSummaryG.append("path")
                    //.attr("d", trophy.pathD)
                    .attr("transform", "translate(-2.5,-5) scale(0.4)");
                    
                topSpaceG.append("text")
                    .attr("class", "cards-title")
                    .attr("dominant-baseline", "central")
                    .attr("text-anchor", "middle")

                cardsG = contentsG
                    .append("g")
                    .attr("class", "cards")
                    .style("cursor", "pointer");

                cardsG.append("rect")
                    .attr("class", "cards-bg")
                    .attr("fill", "transparent")
                    .attr("stroke", "none");
            }

            function update(data, options={}){
                const { } = options;
                //dimns for specific chart
                const allItemsData = itemsDataLayout(allItemsProgressData);
                //console.log("allItemsData", allItemsData)
                const cardsData = data
                    .filter(m => m.dataType === "profile")
                    .map((p,i) => ({ 
                        ...p,
                        i,
                        isFront:i === frontCardNr,
                        isNext:i - 1 === frontCardNr,
                        isSecondNext:i - 2 === frontCardNr,
                        isHeld:i >= frontCardNr,
                        itemsData:allItemsData[i],
                        progressStatus:calcCardProgressStatus(allItemsData[i])
                    }))
                    .reverse();
                
                const cardsProgressStatus = calcCardsProgressStatus(cardsData);
                //console.log("cardsData", cardsData)

                //dimns specific to this chart
                const y0 = vertCardInc * 4;

                //gs
                contentsG.attr("transform", `translate(${margin.left}, ${margin.top})`)
                cardsG.attr("transform", `translate(${0}, ${topSpaceHeight})`)

                containerG.select("rect.mbar-container-bg")
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
                    .attr("fill", cardsProgressStatus === 2 ? "gold" : (cardsProgressStatus === 1 ? grey10(2) : grey10(6)))

                contentsG
                    .select("rect.cards-bg")
                    .call(updateRectDimns, { 
                        width: () => cardsAreaWidth, 
                        height:() => cardsAreaHeight,
                        transition:transformTransition
                    })

                enhancedDrag
                    .onLongpressStart(function(e, d){ })
                    .onLongpressDragged(longpressDragged);
                
                function longpressDragged(e){}
                
                drag
                    .on("start", enhancedDrag(dragStart))
                    .on("drag", enhancedDrag(dragged))
                    .on("end", enhancedDrag(dragEnd));

                //dragging
                function dragStart(e,d){}
                function dragged(e,d){}
                function dragEnd(e,d){}

                //selected card dimns
                //if cardsareaaspectratio is smaller, it means its narrower than the cards,
                //so in that case we use the cardsAreaWidth as the marker
                let selectedCardWidth;
                let selectedCardHeight;
                if(cardsAreaAspectRatio < cardAspectRatio){
                    selectedCardWidth = cardsAreaWidth;
                    selectedCardHeight = selectedCardWidth / cardAspectRatio;
                }else{
                    selectedCardHeight = cardsAreaHeight;
                    selectedCardWidth = selectedCardHeight * cardAspectRatio;
                }
                
                cardsG
                    .datum(cardsData)
                    .call(stack
                        .width(heldCardWidth)
                        .height(heldCardHeight)
                        //.margin(profileMargin)
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
                                const nrIncrements = d.i - frontCardNr;
                                const a = 5;
                                const b = 5;
                                const inc = a * (nrIncrements**2) + b * nrIncrements;
                                return extraMarginLeft + inc;
                            }
                            return d.i * (placedCardWidth + placedCardHorizGap);
                        })
                        .y((d,i) => {
                            if(d.isSelected){
                                return (cardsAreaHeight - selectedCardHeight)/2;
                            }
                            if(d.isHeld){
                                return y0 - (d.i - frontCardNr) * vertCardInc
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
                            containerG.selectAll("g.card").filter(dat => dat.i !== d.i)
                                .attr("pointer-events", d.isSelected ? null : "none")
                                .transition()
                                .duration(200)
                                    .attr("opacity", d.isSelected ? 1 : 0)

                            update(data.map((dat,i) => ({ 
                                ...dat,
                                statusChanging:dat.i === d.i,
                                isSelected:dat.i === d.i ? !dat.isSelected : dat.isSelected
                            })));
                        })
                        .onPickUp(function(d){
                            const prevActiveCardNr = frontCardNr;
                            frontCardNr = d.i;

                            update(data.map((dat,i) => ({ 
                                ...dat,
                                statusChanging:dat.i < prevActiveCardNr && dat.i >= frontCardNr
                            })));
                        })
                        .onPutDown(function(d){
                            if(d.isSelected){
                                //show other cards as we need to deselect the card too
                                containerG.selectAll("g.card").filter(dat => dat.i !== d.i)
                                    .attr("pointer-events", null)
                                    .attr("opacity", 1)
                            }
                            const prevActiveCardNr = frontCardNr;
                            frontCardNr = d.i + 1;
                            update(data.map((dat,i) => ({ 
                                ...dat, 
                                statusChanging:dat.i >= prevActiveCardNr && dat.i < frontCardNr,
                                isSelected:false
                            })));
                        })
                        .currentPage(currentPage)
                        .selected(selectedMilestone)) 

            }

        })

        return selection;
    }
    
    //api
    cards.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return cards;
    };
    cards.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return cards;
    };
    cards.styles = function (value) {
        if (!arguments.length) { return _styles; }
        if(typeof value === "function"){
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value(d,i) });
        }else{
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value });
        }
        
        return cards;
    };
    cards.format = function (value) {
        if (!arguments.length) { return format; }
        format = value;
        return cards;
    };
    cards.setReactComponent = function (value) {
        if (!arguments.length) { return setReactComponent; }
        setReactComponent = value;
        return cards;
    };
    return cards;
}
