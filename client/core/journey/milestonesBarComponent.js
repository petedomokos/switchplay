import * as d3 from 'd3';
import { DIMNS, FONTSIZES, grey10, COLOURS, PROFILE_PAGES, TRANSITIONS  } from "./constants";
import contractsComponent from './contractsComponent';
import profileCardsComponent from './profileCardsComponent';
import dragEnhancements from './enhancedDragHandler';
import { calculateOffsetForCardsBeforePlaceholder, calculateOffsetForCardsAfterPlaceholder, calculatePlaceholderX, calcNewMilestoneNr } from "./milestonesBarHelpers";
import { addMilestonePlaceholderContents, removeMilestonePlaceholderContents } from './milestonePlaceholder';
import { addMonths } from '../../util/TimeHelpers';
import { milestoneContainingPt } from "./screenGeometryHelpers";
import { icons } from '../../util/icons';
import { hide, show, Oscillator } from './domHelpers';
import { getTransformationFromTrans } from './helpers';
import { updateRectDimns } from './transitionHelpers';
import { remove } from 'lodash';

const CONTENT_FADE_DURATION = TRANSITIONS.KPI.FADE.DURATION;
const SLIDE_TRANSITION = { duration: 200 };
const transformTransition = { update: { duration: 1000 } };

/*

*/

const EASE_IN = d3.easeCubicIn;
//const EASE_OUT = d3.easeCubicOut;
const EASE_IN_OUT = d3.easeCubicInOut;

export default function milestonesBarComponent() {
    //bug - we are not unmounting the jourrny on signout
    //need to check all data is wiped and store is reset
    //API SETTINGS
    // dimensions
    let width = 800;
    let height = DIMNS.milestonesBar.minHeight
    let margin = { left: 40, right: 40, top: 20, bottom: 20 };
    let contentsWidth;
    let contentsHeight;

    let cardsAreaWidth;
    let cardsAreaHeight;
    let cardsAreaAspectRatio;
    let topSpaceHeight;
    let botSpaceHeight;

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
        profiles:{ info:{ date:{ fontSize:9 } }, kpis:{}, goal:{} },
    }
    let _styles = () => DEFAULT_STYLES;


    let activeCardNr = 0; //0 is the first card of 5
    let allItemsData = [
        [2,2,2,1,0],
        [2,1,2,1,0],
        [2,1,0,0,0],
        [0,0,0,0,0],
        [0,0,0,0,0]
    ];

    let swipable = true;
    let currentPage = PROFILE_PAGES[0];

    //state
    let selectedMilestone;
    let isSelected = milestoneId => false;
    let selectedKpi;

    let endMilestoneEdit = function(){}

    let kpiFormat;
    let onSetSelectedMilestone = function(){};
    let onSetSelectedKpi = function(){};
    //let onSetSelectedStep = function(){};
    let onSetKpiFormat = function(){};
    let onSelectKpiSet = function(){};
    let onToggleSliderEnabled = function(){};

    let onCreateMilestone = () => {};
    let onUpdateMilestone = () => {};
    let onDeleteMilestone = () => {};

    let onTakeOverScreen = () => {};
    let onReleaseScreen = () => {};
    let onSaveValue = function(){};

    let onCreateStep = function(){};
    let onEditStep = function(){};
    let onUpdateStep = function(){};
    let onUpdateSteps = function(){};
    let onDeleteStep = function(){};

    const drag = d3.drag();
    const enhancedDrag = dragEnhancements();
    let oscillator = Oscillator({ k:1.01, dx:10 });

    let setReactComponent = function(){};
    let onSetEditingReactComponent = function(){};
    let onSetEditingSVGComponent = function(){};
    let updateReactComponent = function(){};
    let setForm = function(){};
   

    let onClick = function(){};
    let onDblClick = function(){};
    let onLongpress = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};

    let containerG;
    let contentsG;
    let topSpaceG;
    let cardsG;

    //components
    const profiles = profileCardsComponent()
        .onCtrlClick((e,d) => { 
            ignoreNextWrapperClick = true;
        });

    //temp settings
    //let ignoreNextWrapperClick = false;

    //helper
    //data is passed in here, so we can call this function with other data too eg with placeholder
    const calcMilestoneX = data => nr => {
    }
    const calcMilestoneY = data => nr => {
    }

    function milestonesBar(selection, options={}) {
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

            update(data, { slideTransition:SLIDE_TRANSITION });
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

                cardsG = contentsG
                    .append("g")
                    .attr("class", "cards")
                    .style("cursor", "pointer");

                cardsG.append("rect")
                    .attr("class", "cards-bg")
                    .attr("fill", "transparent")
                    .attr("stroke", grey10(3));
            }

            //data can be passed in from a general update (ie dataWithDimns above) or from a listener (eg dataWithPlaceholder)
            function update(data, options={}){
                const { } = options;
                //dimns for specific chart
                const cardsData = data
                    .filter(m => m.dataType === "profile")
                    .map((p,i) => ({ 
                        ...p,
                        i,
                        isHeld:i >= activeCardNr,
                        itemsData:allItemsData[i]
                    }))
                    .reverse();
                //console.log("cardsData", cardsData.map(d => ({ i: d.i, isHeld: d.isHeld })))

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
                    .call(profiles
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
                                return (cardsAreaWidth - heldCardWidth)/2 + (d.i - activeCardNr) * horizCardInc
                            }
                            return d.i * (placedCardWidth + placedCardHorizGap);
                        })
                        .y((d,i) => {
                            if(d.isSelected){
                                return (cardsAreaHeight - selectedCardHeight)/2;
                            }
                            if(d.isHeld){
                                return y0 - (d.i - activeCardNr) * vertCardInc
                            }
                            return heldCardsAreaHeight + placedCardMarginVert;;
                        })
                        .onClick(function(e,d){
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
                            const prevActiveCardNr = activeCardNr;
                            activeCardNr = d.i;

                            update(data.map((dat,i) => ({ 
                                ...dat,
                                statusChanging:dat.i < prevActiveCardNr && dat.i >= activeCardNr
                            })));
                        })
                        .onPutDown(function(d){
                            const prevActiveCardNr = activeCardNr;
                            activeCardNr = d.i + 1;
                            update(data.map((dat,i) => ({ 
                                ...dat, 
                                statusChanging:dat.i >= prevActiveCardNr && dat.i < activeCardNr
                            })));
                        })
                        .currentPage(currentPage)
                        .selected(selectedMilestone))

            }

        })

        return selection;
    }
    
    //api
    milestonesBar.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return milestonesBar;
    };
    milestonesBar.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return milestonesBar;
    };
    milestonesBar.styles = function (value) {
        if (!arguments.length) { return _styles; }
        if(typeof value === "function"){
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value(d,i) });
        }else{
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value });
        }
        
        return milestonesBar;
    };
   
    milestonesBar.swipable = function (value) {
        if (!arguments.length) { return swipable; }
        swipable = value;
        return milestonesBar;
    };
    milestonesBar.selectedMilestone = function (value) {
        if (!arguments.length) { return selectedMilestone; }
        selectedMilestone = value;
        return milestonesBar;
    };
    milestonesBar.selectedKpi = function (value) {
        if (!arguments.length) { return selectedKpi; }
        selectedKpi = value;
        return milestonesBar;
    };
    
    milestonesBar.kpiFormat = function (value) {
        if (!arguments.length) { return kpiFormat; }
        kpiFormat = value;
        return milestonesBar;
    };
    milestonesBar.onSetKpiFormat = function (value) {
        if (!arguments.length) { return onSetKpiFormat; }
        if(typeof value === "function"){
            onSetKpiFormat = value;
        }
        return milestonesBar;
    };
    milestonesBar.onSetSelectedMilestone = function (value) {
        if (!arguments.length) { return onSetSelectedMilestone; }
        if(typeof value === "function"){
            onSetSelectedMilestone = value;
        }
        return milestonesBar;
    };
    milestonesBar.onSetSelectedKpi = function (value) {
        if (!arguments.length) { return onSetSelectedKpi; }
        if(typeof value === "function"){
            onSetSelectedKpi = value;
        }
        return milestonesBar;
    };
    
    milestonesBar.onSelectKpiSet = function (value) {
        if (!arguments.length) { return onSelectKpiSet; }
        if(typeof value === "function"){
            onSelectKpiSet = value;
        }
        return milestonesBar;
    };
    milestonesBar.onCreateMilestone = function (value) {
        if (!arguments.length) { return onCreateMilestone; }
        if(typeof value === "function"){
            onCreateMilestone = value;
        }
        return milestonesBar;
    };
    milestonesBar.onUpdateMilestone = function (value) {
        if (!arguments.length) { return onUpdateMilestone; }
        if(typeof value === "function"){
            onUpdateMilestone = value;
        }
        return milestonesBar;
    };
    milestonesBar.onDeleteMilestone = function (value) {
        if (!arguments.length) { return onDeleteMilestone; }
        if(typeof value === "function"){
            onDeleteMilestone = value;
        }
        return milestonesBar;
    };
    milestonesBar.onToggleSliderEnabled = function (value) {
        if (!arguments.length) { return onToggleSliderEnabled; }
        if(typeof value === "function"){
            onToggleSliderEnabled = value;
        }
        return milestonesBar;
    };
    milestonesBar.onTakeOverScreen = function (value) {
        if (!arguments.length) { return onTakeOverScreen; }
        onTakeOverScreen = value;
        return milestonesBar;
    };
    milestonesBar.onReleaseScreen = function (value) {
        if (!arguments.length) { return onReleaseScreen; }
        onReleaseScreen = value;
        return milestonesBar;
    };
    milestonesBar.setReactComponent = function (value) {
        if (!arguments.length) { return setReactComponent; }
        setReactComponent = value;
        return milestonesBar;
    };
    milestonesBar.onSetEditingReactComponent = function (value) {
        if (!arguments.length) { return onSetEditingReactComponent; }
        onSetEditingReactComponent = value;
        return milestonesBar;
    };
    milestonesBar.onSetEditingSVGComponent = function (value) {
        if (!arguments.length) { return onSetEditingSVGComponent; }
        onSetEditingSVGComponent = value;
        return milestonesBar;
    };
    milestonesBar.updateReactComponent = function (value) {
        if (!arguments.length) { return updateReactComponent; }
        updateReactComponent = value;
        return milestonesBar;
    };
    milestonesBar.setForm = function (value) {
        if (!arguments.length) { return setForm; }
        setForm = value;
        return milestonesBar;
    };
    milestonesBar.onCreateStep = function (value) {
        if (!arguments.length) { return onCreateStep; }
        onCreateStep = value;
        return milestonesBar;
    };
    milestonesBar.onEditStep = function (value) {
        if(typeof value === "function"){
            onEditStep = value;
        }
        return milestonesBar;
    };
    milestonesBar.onUpdateStep = function (value) {
        if (!arguments.length) { return onUpdateStep; }
        onUpdateStep = value;
        return milestonesBar;
    };
    milestonesBar.onUpdateSteps = function (value) {
        if (!arguments.length) { return onUpdateSteps; }
        onUpdateSteps = value;
        return milestonesBar;
    };
    milestonesBar.onDeleteStep = function (value) {
        if (!arguments.length) { return onDeleteStep; }
        onDeleteStep = value;
        return milestonesBar;
    };
    milestonesBar.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return milestonesBar;
    };
    milestonesBar.onDblClick = function (value) {
        if (!arguments.length) { return onDblClick; }
        onDblClick = value;
        return milestonesBar;
    };
    milestonesBar.onLongpress = function (value) {
        if (!arguments.length) { return onLongpress; }
        onLongpress = value;
        return milestonesBar;
    };
    milestonesBar.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return milestonesBar;
    };
    milestonesBar.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return milestonesBar;
    };
    milestonesBar.onSaveValue = function (value) {
        if(typeof value === "function"){
            onSaveValue = value;
        }
        return milestonesBar;
    };

    milestonesBar.positionedData = function () {
        return onDblClick;
    };

    milestonesBar.slideBack = function(){ slideBack() };
    milestonesBar.slideForward = function(){ slideForward() };
    milestonesBar.slideTo = function(){ slideTo() };
    milestonesBar.updateDatesShown = function(milestonesToShow){
        const ids = typeof milestonesToShow[0] === "object" ? milestonesToShow.map(m => m.id) : milestonesToShow;
        milestonesG.selectAll("g.milestone")
            .filter(d => ids.includes(d.id))
            .selectAll("g.date-info")
            .attr("display", null)

        milestonesG.selectAll("g.milestone")
            .filter(d => !ids.includes(d.id))
            .selectAll("g.date-info")
            .attr("display", "none")
    };
    milestonesBar.endMilestoneEdit = function () {  endMilestoneEdit(); }
    return milestonesBar;
}
