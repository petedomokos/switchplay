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
    let margin = { left: 20, right: 20, top: 20, bottom: 20 };
    let contentsWidth;
    let contentsHeight;
    const topSpaceHeight = 80;
    let milestonesAreaWidth;
    let milestonesAreaHeight;

    let cardWidth;
    let cardHeight;
    let profileMargin = { top:0, bottom: 0, left:0, right:0 };

    let nonVisibleCardWidth;
    let nonVisibleCardHeight;

    const horizCardGap = 15;
    const vertCardGap = 50;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        //helper
        cardWidth = 280;
        cardHeight = 370;
        nonVisibleCardWidth = 28;
        nonVisibleCardHeight = 37;

        milestonesAreaWidth = contentsWidth;
        milestonesAreaHeight = cardHeight + 4 * vertCardGap;
    }
    let DEFAULT_STYLES = {
        profiles:{ info:{ date:{ fontSize:9 } }, kpis:{}, goal:{} },
    }
    let _styles = () => DEFAULT_STYLES;


    //let activeCardNr = 1; //0 is the first card of 5

    let positionedData = [];
    let swipable = true;
    let currentPage = PROFILE_PAGES[0];
    let milestoneBeingEdited = null;

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
    let milestonesAreaG;
    let visibleCardsG;
    let nonVisibleCardsG;

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

                milestonesAreaG = contentsG
                    .append("g")
                    .attr("class", "milestones-area")
                    .style("cursor", "pointer")

                milestonesAreaG.append("rect")
                    .attr("class", "milestones-area-bg")
                    .attr("fill", "transparent")
                    .attr("stroke", "grey");

                visibleCardsG = milestonesAreaG.append("g").attr("class", "visible-cards");
                //prevCardsG starts at bottom and cards pile upwards
                nonVisibleCardsG = milestonesAreaG.append("g").attr("class", "non-visible-cards");
                nonVisibleCardsG.append("rect").attr("class", "non-visible-cards-bg").attr("opacity", 0.2)
            }

            //data can be passed in from a general update (ie dataWithDimns above) or from a listener (eg dataWithPlaceholder)
            function update(data, options={}){
                const { milestoneTransition } = options;
                //next...its working, but will be better logic if it justkeeps all cards
                //in one array, and positions and sizes them on enter only, based 
                //on whether it is vis or not. then just updates teh pos of them
                //and the internal visibility of the card contents whenever user
                //drags them.
                
                //can make cards that are below others non draggable in the nonVis
                //so it is only the top one that can be dragged.


                //re. updates, we just need to update the profileCard component so it
                //can update what contents are displayed based on visibility


                //dimns for specific chart
                const activeCardNr = 3;
                const indexedCardsData = positionedData
                    .filter(m => m.dataType === "profile")
                    .map((p,i) => ({ ...p, cardIndex:i }));

                const visibleCardsData = indexedCardsData.slice(activeCardNr, indexedCardsData.length);
                const nonVisibleCardsData = indexedCardsData.slice(0, activeCardNr);
                //console.log("cData", indexedCardsData)
                //console.log("visibleCData", visibleCardsData)
                //console.log("nonVisCData", nonVisibleCardsData)
                const visibleCardsHeight = cardHeight + (visibleCardsData.length - 1) * vertCardGap;
                const nonVisibleCardsHeight = milestonesAreaHeight - visibleCardsHeight;
                const y0 = vertCardGap * (data.length - 1);

                //milestone positioning
                const calcX = calcMilestoneX(data);
                const calcY = calcMilestoneY(data);
                positionedData = data.map(m => ({ 
                    ...m, 
                    x: calcX(m.nr), 
                    y: calcY(m.nr),
                    width:cardWidth,
                    height:cardHeight
                }));

                //console.log("positionedData", positionedData)

                //gs
                contentsG.attr("transform", `translate(${margin.left}, ${margin.top})`)
                milestonesAreaG.attr("transform", `translate(${0}, ${topSpaceHeight})`)
                nonVisibleCardsG.attr("transform", `translate(${0}, ${visibleCardsHeight})`)
                //prevCardsG.attr("transform", `translate(${10}, ${10})`)

                containerG.select("rect.mbar-container-bg")
                    .call(updateRectDimns, { 
                        width: () => width, 
                        height:() => height,
                        transition:transformTransition
                    })

                contentsG
                    .select("rect.milestones-area-bg")
                    .call(updateRectDimns, { 
                        width: () => milestonesAreaWidth, 
                        height:() => milestonesAreaHeight,
                        transition:transformTransition
                    })

                milestonesAreaG
                    .select("rect.milestones-area-bg")
                        .call(updateRectDimns, { 
                            width: () => milestonesAreaWidth, 
                            height:() => milestonesAreaHeight,
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

                visibleCardsG
                    .datum(visibleCardsData)
                    .call(profiles
                        .width(cardWidth)
                        .height(cardHeight)
                        .margin(profileMargin)
                        .x((d,i) => d.cardIndex * horizCardGap)
                        .y((d,i) => y0 - d.cardIndex * vertCardGap)
                        .currentPage(currentPage)
                        .selected(selectedMilestone))
                
                //temp bg
                nonVisibleCardsG.select("rect.non-visible-cards-bg")
                    .attr("width", milestonesAreaWidth)
                    .attr("height", nonVisibleCardsHeight)
                    .attr("fill", "yellow");

                const nonVisibleCardG = nonVisibleCardsG.selectAll("g.non-visible-card").data(nonVisibleCardsData);
                nonVisibleCardG.enter()
                    .append("g")
                        .attr("class", "non-visible-card")
                        .each(function(){
                            d3.select(this).append("rect")
                        })
                        .merge(nonVisibleCardG)
                        .attr("transform", (d,i) => `translate(${i * 5}, ${nonVisibleCardsHeight - nonVisibleCardHeight - (i * 10)})`)
                        .each(function(){
                            d3.select(this).select("rect")
                                .attr("width", nonVisibleCardWidth)
                                .attr("height", nonVisibleCardHeight)
                                .attr("rx", 2)
                                .attr("ry", 2)
                                .attr("fill", grey10(4))
                                .attr("stroke", "white")
                        })

                nonVisibleCardG.exit().remove();

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
