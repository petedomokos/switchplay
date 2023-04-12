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

import { turnPage } from "../../../assets/icons/milestoneIcons.js"

const CONTENT_FADE_DURATION = TRANSITIONS.KPI.FADE.DURATION;

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
    let margin = { left: 0, right: 0, top: 0, bottom: 20 };
    let contentsWidth;
    let contentsHeight;

    let milestonesWrapperWidth;

    let topBarHeight;
    let milestonesHeight;
    //api to determine widths of milestones based on type
    let profileWidth;
    let profileHeight;
    let profileMargin = { top:0, bottom: 0, left:0, right:0 };
    let contractWidth;
    let contractHeight;
    let placeholderWidth;
    let placeholderHeight;
    //quick access helpers
    let getWidth;
    let getHeight;
    let getDimns;

    let phaseGap;
    let hitSpace;
    let labelMarginHoz;

    function updateDimns(data){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
        topBarHeight = d3.min([40, contentsHeight * 0.1]);
        milestonesHeight = contentsHeight - topBarHeight;
        //todo - add space either side for creating new milestones
        //also space at top
        //and on dbl-click, the milestone will expand
        hitSpace = 40;
        //the width must be fixed so we can control the hitspace on screen
        const maxMilestoneWidth = width - (2 * hitSpace);
        const maxMilestoneHeight = milestonesHeight;
        //helper
        //maximise the width if possible
        const calcMilestoneDimns = (stdWidth, stdHeight) => {
            const aspectRatio = stdHeight / stdWidth;
            const _height = maxMilestoneWidth * aspectRatio;
            if(_height <= maxMilestoneHeight){
                return { width: maxMilestoneWidth, height: _height };
            }
            return { width: maxMilestoneHeight / aspectRatio, height: maxMilestoneHeight }
        } 
        const profileDimns = calcMilestoneDimns(DIMNS.profile.width, DIMNS.profile.height);
        const contractDimns = calcMilestoneDimns(DIMNS.contract.width, DIMNS.contract.height);
        profileWidth = profileDimns.width;
        profileHeight = profileDimns.height;
        contractWidth = contractDimns.width;
        contractHeight = contractDimns.height;
        placeholderWidth = profileWidth;
        placeholderHeight = profileHeight;

        //base other spacings on the profile card width to keep proportions reasonable
        phaseGap = 0.075 * profileWidth;
        labelMarginHoz = profileWidth * 0.025;
        
        //quick access helper
        getWidth = m => m.dataType === "profile" ? profileWidth : (m.dataType === "placeholder" ? placeholderWidth : contractWidth);
        getHeight = m => m.dataType === "profile" ? profileHeight : (m.dataType === "placeholder" ? placeholderHeight : contractHeight);
        getDimns = m => ({ width: getWidth(m), height: getHeight(m) });

        //we add two extra normal hitspaces for the placeholder spaces at the ends. So in total it (data.length + 1)* hitspace
        milestonesWrapperWidth = 2 * placeholderWidth + (data.length + 1) * hitSpace + d3.sum(data, m => getWidth(m)) + 2 * phaseGap;
        //styles
        const k = profileWidth / DIMNS.profile.width;
        fontSizes = {
            profile:FONTSIZES.profile(k),
            contract:FONTSIZES.contract(k)
        }
    }

    let fontSizes = {}
    //@todo - replace fontsizes with styles only
    let DEFAULT_STYLES = {
        profiles:{
            info:{
                date:{
                    fontSize:9
                }
            },
            kpis:{
    
            },
            goal:{

            }
        },
        contracts:{

        },
    }
    let _styles = () => DEFAULT_STYLES;

    let fixedAvailableScale;
    let availableScale = 1;

    let positionedData = [];
    let swipable = true;
    let currentPage = PROFILE_PAGES[0];
    let milestoneBeingEdited = null;

    let xScale = x => 0;

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
    let milestonesWrapperG;
    let topBarG;
    let milestonesG;
    let contractsG;
    let profilesG;
    let overlayCtrlsG;

    //components
    const contracts = contractsComponent();
    const profiles = profileCardsComponent()
        .onCtrlClick((e,d) => { 
            ignoreNextWrapperClick = true;
            //not needed anymore...kpisComponent handles it and nothing else changes
            //onSetKpiFormat(d.key) 
        });

    let requiredSliderPosition = 0;
    let currentSliderPosition;
    let currentSliderOffset;
    let canSlideForward;
    let canSlideBack;
    let slideBack;
    let slideForward;
    let slideTo;
    let slideToOffset;
    let slideToBeforeStart;
    let slideToAfterEnd;

    let datePhasesData;

    //temp settings
    let ignoreNextWrapperClick = false;

    //helper
    //data is passed in here, so we can call this function with other data too eg with placeholder
    const calcMilestoneX = data => nr => {
        const milestone = data.find(m => m.nr === nr);
        const { isPast, isCurrent, isFuture, i } = milestone;
        const previousMilestonesData = data.filter(m => m.nr < nr);
        const extraGaps = isFuture ? phaseGap * 2 : (isCurrent ? phaseGap : 0)
        //add one extra hit-space for the placeholder space at start
        return placeholderWidth + ((i + 1) * hitSpace) + d3.sum(previousMilestonesData, d => getWidth(d)) + getWidth(milestone)/2 + extraGaps;
    }

    const calculateOffsetX = positionedData => sliderPosition => {
        if(Number.isInteger(sliderPosition)){
            return contentsWidth/2 - positionedData.find(m => m.nr === sliderPosition)?.x || 0;
        }
        //it halfway between
        const prev = positionedData.find(m => m.nr === Math.floor(sliderPosition));
        const next = positionedData.find(m => m.nr === Math.ceil(sliderPosition));
        if(prev && next){
            let extraGaps;
            if(prev.isPast && next.isPast){
                    extraGaps = 0;
            }else if(prev.isPast && next.isCurrent){
                extraGaps = phaseGap/2;
            }else if(prev.isCurrent){
                extraGaps = phaseGap * 3/2;
            }else{
                //both future
                extraGaps = 2 * phaseGap
            }
            return contentsWidth/2 - prev.x - prev.width/2 - hitSpace/2 - extraGaps;
        }
        if(prev){
            //show at end - prev.x may contain the extraGaps already
            //prev must be at least current because there is no next
            let extraGaps;
            if(prev.isFuture){
                //prev.x has the gaps
                    extraGaps = 0;
            }else {
                //prev is current...prev.x has one of the gaps
                extraGaps = phaseGap;
            }
            return contentsWidth/2 - prev.x - prev.width/2 - extraGaps - placeholderWidth/2;
        }
        //show at start
        return contentsWidth/2 - placeholderWidth/2;
    }

    let transitionOn = true;
    const SLIDE_TRANSITION = { duration: 200 };
    const transformTransition = { update: { duration: 1000 } };

    function milestonesBar(selection, options={}) {
        //console.log("milestonesBar......")
        const { transitionEnter=true, transitionUpdate=true } = options;
        // expression elements
        selection.each(function (data) {
            //console.log("updateMBar", data)
            //console.log("shuttles kpi values", data.map(p => ({ id:p.id, values: p.kpis.kpisData[1]?.values })))
            containerG = d3.select(this)
                .attr("width", width)
                .attr("height", height);

            //dimns is needed for init too
            updateDimns(data);
            if(containerG.select("g").empty()){
                init();
            }

            update(data, { slideTransition:SLIDE_TRANSITION });
            function init(){
                containerG.append("rect").attr("class", "container-bg")
                    .attr("fill", "transparent");
                contentsG = containerG.append("g").attr("class", "milestone-bar-contents");
                contentsG.append("rect")
                    .attr("class", "milestones-bar-contents-bg")
                    .attr("fill", "transparent");

                milestonesWrapperG = contentsG.append("g").attr("class", "milestones-wrapper")
                    .attr("transform", `translate(0,0)`);

                topBarG = milestonesWrapperG.append("g").attr("class", "top-bar")

                topBarG.append("rect").attr("fill", "none")

                milestonesG = milestonesWrapperG
                    .append("g")
                    .attr("class", "milestones")
                    .style("cursor", "pointer")

                milestonesG.append("rect")
                    .attr("class", "milestones-bg")
                    .call(updateRectDimns, { 
                        width: () => milestonesWrapperWidth, 
                        height:() => milestonesHeight,
                        transition:transformTransition
                    })
                    .attr("fill", "transparent");
                
                milestonesG.append("g").attr("class", "phase-labels");

                contractsG = milestonesG.append("g").attr("class", "contracts");
                profilesG = milestonesG.append("g").attr("class", "profiles");

                overlayCtrlsG = milestonesG.append("g").attr("class", "overlay-ctrls");

            }

            //data can be passed in from a general update (ie dataWithDimns above) or from a listener (eg dataWithPlaceholder)
            function update(data, options={}){
                //console.log("MBarComponent update....swip ", swipable)
                const { slideTransition, milestoneTransition } = options;

                //milestone positioning
                const calcX = calcMilestoneX(data);
                positionedData = data.map(m => ({ 
                    ...m, 
                    x: calcX(m.nr), 
                    y: milestonesHeight/2,
                    width:getWidth(m),
                    height:getHeight(m)
                }));

                //console.log("positionedData", positionedData)
                const calcOffsetX = calculateOffsetX(positionedData)

                slideTo = function(position, options={} ){
                    //console.log("slideTo...", d3.select("div#react-container").node())
                    if(data.length ===  0) { return; }
                    //helper
                    const convertToNumber = wordPosition => {
                        if(wordPosition === "beforeStart"){ return d3.min(data, d => d.nr) - 0.5 }
                        if(wordPosition === "afterEnd") { return d3.max(data, d => d.nr) + 0.5; }
                        return 0;
                    }
                    //need to also check offset, incase slider pos hadnt changed but dimns have changed
                    const numericalPosition = typeof position === "number" ? position : convertToNumber(position);
                    const offset = calcOffsetX(numericalPosition);
                    //console.log("offset", offset)
                    if(currentSliderPosition === position && offset === currentSliderOffset) {
                        //still need to check if react-container has been positioned - it may need updating
                        /*console.log("only applying change to react-container...")
                        d3.select("div#react-container")
                            .style("left", `${currentSliderOffset}px`)
                            .style("top", `${topBarHeight}px`)
                            */

                        return; 
                    }
                    const { transition, cb } = options;

                    milestonesWrapperG.call(updateTransform, {
                        x: () => offset,
                        y: () => 0,
                        transition:transitionOn ? transition : null,
                        cb
                    });
                    //set state before end of slide, to prevent another slide if an update is 
                    //called again before this slide has ended
                    currentSliderPosition = position;
                    currentSliderOffset = offset;
                    canSlideBack = currentSliderPosition === null || currentSliderPosition > positionedData[0].nr;
                    canSlideForward = currentSliderPosition === null || currentSliderPosition < positionedData[positionedData.length - 1].nr;
                }

                slideToOffset = function(offset, options={} ){
                    if(currentSliderOffset === offset) { return; }
                    const { transition, cb } = options;

                    milestonesWrapperG.call(updateTransform, {
                        x: () => offset,
                        y: () => 0,
                        transition:transitionOn ? transition : null,
                        cb
                    });
                    currentSliderOffset = offset;
                    currentSliderPosition = null;
                    canSlideForward = true;
                    canSlideBack = true;
                }

                containerG.select("rect.container-bg")
                    .attr("width", width)
                    .attr("height", height)

                const topRightCtrlsWidth = 24;
                const topRightCtrlsHeight = 24;
                const topRightCtrlsMargin = d3.min([15, 0.025 * width]);

                const topRightMilestoneCtrlsG = overlayCtrlsG.selectAll("g.top-right-milestone-ctrls")
                    .data(positionedData.filter(d => selectedMilestone !== d.id), d => d.id);

                topRightMilestoneCtrlsG.enter()
                    .append("g")
                        .attr("class", d => `top-right-milestone-ctrls top-right-milestone-ctrls-${d.id}`)
                        .attr("display", "none")
                        .each(function(d,i){
                            d3.select(this)
                                .append("g")
                                    .attr("class", "icon")
                                    .attr("transform", "scale(0.75)")
                                        .append("path")
                                        .attr("fill", COLOURS.btnIcons.expand)
                                        .attr("stroke", COLOURS.btnIcons.expand)

                            d3.select(this).append("rect").attr("class", "hitbox")
                                .attr("fill", "transparent");

                            //transition in
                            d3.select(this)
                                .attr("opacity", 0)
                                    .transition()
                                    .delay(200)
                                    .duration(200)
                                        .attr("opacity", 1)

                        })
                        .merge(topRightMilestoneCtrlsG)
                        .attr("transform", d => `translate(${
                            d.x + d.width/2 - topRightCtrlsWidth - topRightCtrlsMargin},
                            ${d.y - d.height/2 +topRightCtrlsMargin
                        })`)
                        .each(function(d,i){
                            d3.select(this).select("g.icon").select("path")
                                .attr("d", icons.expand.d)
                            
                            d3.select(this).select("rect.hitbox")
                                .attr("width", topRightCtrlsWidth)
                                .attr("height", topRightCtrlsHeight)
                        })
                        .on("click", (e,d) => updateSelected(d));

                topRightMilestoneCtrlsG.exit().remove();
    

                contentsG
                    .attr("transform", `translate(${margin.left},${margin.top})`)
                    .select("rect.milestones-bar-contents-bg")
                        .attr("width", contentsWidth)
                        .attr("height", contentsHeight);
                
                topBarG.select("rect")
                    .attr("width", milestonesWrapperWidth)
                    .attr("height", topBarHeight)
                    
                milestonesG
                    .attr("transform", `translate(0,${topBarHeight})`)
                    .select("rect.milestones-bg")
                        .call(updateRectDimns, { 
                            width: () => milestonesWrapperWidth, 
                            height:() => milestonesHeight,
                            transition:transformTransition
                        })

                //helper removes offset and phase labels height so we can compare with data 
                const adjustPtForData = pt => ({ x: pt.x - currentSliderOffset, y: pt.y - topBarHeight })
                enhancedDrag
                    .onClick(handleMilestoneWrapperClick)
                    /*
                    for when its differentiated from dbl-click on laptops and safari
                    .onClick(function(e, d){
                        //doing now - dbl click on chrome mobile comes thru as a click
                        //next - add a dar overly over whole screen inc burger menu so only the 
                        //selcted milestoen shows.
                        //alert("click m")
                        console.log("clicked.....")
                        //const milestone = milestoneContainingPt(adjustPtForData(e), positionedData);
                        //if(milestone){
                        //}else{
                        //}
                        
                    })
                    */
                    .onDblClick(handleMilestoneWrapperClick) //see note about chrome on mobile
                    .onLongpressStart(function(e, d){
                        //remove any open forms
                        setForm(null);

                        const pt = adjustPtForData(e);
                        const milestone = milestoneContainingPt(pt, positionedData);
                        if(!milestone){
                            createMilestonePlaceholder(prevCard(pt.x), nextCard(pt.x));
                        }
                        /*
                        //DELETE
                        //@TODO - INSTEAD, WE WILL IMPL THIS IN TEH LITTLE LABEL OUTSIDE THE PROFILE AT TOP
                        if(milestone?.id === "current"){
                            alert("You can't delete your current profile.");
                            return;
                        }
                        if(milestone){
                            startDeleteMilestone(milestone)
                        }
                        */
                    })
                    .onLongpressDragged(longpressDragged)
                    .onLongpressEnd(endDeleteMilestone)
                    //try having drag always on, but for ls we have the wrapperg under the profiles etc. we can use
                    //insert, as we will need it to update when screen size changes, so not enuff to append.
                
                let milestoneBeingDeleted;
                let deleted = false;
                function startDeleteMilestone(milestone){
                    milestoneBeingDeleted = milestone;
                    d3.select(`g.milestone-${milestone.id}`)//.select("rect.bg")
                    //.style("filter", "url(#drop-shadow)")
                    //work out whats happening with k
                    .call(oscillator.start);
                }
                function longpressDragged(e){
                    if(!milestoneBeingDeleted){ return; }
                    const milestoneG = d3.select(`g.milestone-${milestoneBeingDeleted.id}`);
                    const { translateX, translateY } = getTransformationFromTrans(milestoneG.attr("transform"));
                    milestoneG
                        .attr("transform", "translate(" + (translateX) +"," + (translateY + e.dy) +")")

                    if(enhancedDrag.distanceDragged() > 200 && enhancedDrag.avgSpeed() > 0.08){
                        if(deleted){ return; }
                        //oscillator.stop();
    
                        deleted = true;
                        milestoneG
                            .transition()
                            .duration(50)
                                .attr("opacity", 0)
                                .on("end", () => {
                                    onDeleteMilestone("profile", milestoneBeingDeleted.id)
                                })
                    }
                }

                function endDeleteMilestone(){
                    milestoneBeingDeleted = null;
                    deleted = false;
                    oscillator.stop();
                }
                
                drag
                    .on("start", enhancedDrag(dragStart))
                    .on("drag", enhancedDrag(dragged))
                    .on("end", enhancedDrag(dragEnd));
                /*drag
                    .on("start", swipable ? enhancedDrag(dragStart) : null)
                    .on("drag", swipable ? enhancedDrag(dragged) : null)
                    .on("end", swipable ? enhancedDrag(dragEnd) : null);*/
                
                //click and dbl-click 
                //todo: chrome mobile had no dbl-click so currently no difference if no dbl-click
                //but need a way of distinguisng this -eg on laptop we do want it differentiated
                //but maybe best is to just make dbl-click teh same as two clicks , and 
                //then ppl on chrome mobile just cant do two clicks in quick succession
                function handleMilestoneWrapperClick(e,d){
                    //console.log("wrapperclk...ignore?", ignoreNextWrapperClick)
                    //remove any open reactcomponent (these are not opened from d3 components so we can be 
                    //sure that it is not a d3 click thatis opening it)
                    onSetEditingReactComponent(null);

                    if(ignoreNextWrapperClick){
                        ignoreNextWrapperClick = false;
                        return;
                    }
                    if(milestoneBeingEdited){
                        endMilestoneEdit();
                        return;
                    }
                    //dont setForm to null if click is ignored as the click may be to open the form!
                    setForm(null);
                    if(selectedMilestone){ return; }
                    //this click is only to turn off swiping ann dturn on scrolling, so if not swipable then its not needed
                    if(!swipable) { return; }
                    
                    const milestone = milestoneContainingPt(adjustPtForData(e), positionedData);
                    if(milestone) {
                        updateSelected(milestone);
                    }
                }

                function updateSelected(milestone){
                    //any changes should close any open form
                    onSetEditingReactComponent(null);
                    setForm(null);
                    //deselecting
                    if(!milestone){
                        if(selectedMilestone){
                            //show all that were hidden
                            milestonesG.selectAll("g.milestone").filter(d => d.id !== selectedMilestone)
                                .call(profiles.removeOverlay/*, { delay:200, duration:200 }*/)
                        }
                    }
                    //selecting
                    else if(!selectedMilestone){
                        //hide all others
                        milestonesG.selectAll("g.milestone").filter(d => d.id !== milestone.id).call(profiles.applyOverlay)
                    }else{
                        //only need to hide the the previous selected
                        milestonesG
                            .selectAll("g.milestone")
                            //d3 doesnt like this line below for some reason - it re-enters the profile card - so filter instead
                            //.select(`g.milestone-${selectedMilestone}`)
                            .filter(d => d.id === selectedMilestone)
                            .call(profiles.applyOverlay)

                        //show the new selected
                        milestonesG.selectAll("g.milestone")
                            .filter(d => d.id === milestone.id)
                            .call(profiles.removeOverlay)
                    }
                    //@todo - BUG - why is there a delay in removing the burger bars? cut it out for now
                    //onTakeOverScreen();
                    //hide phase labels
                    //if(selected){
                        //treat it as a dbl-click => clicking a selected milestone zooms user in even further
                        //or maybe this needs to be doen at next evel as drag is turned off when selected i think
                    //}
                    //set selected and slider pos (note - we need both of these, as we will have a sliderPos even if no selected)
                    selectedMilestone = milestone?.id;
                    isSelected = milestoneId => milestoneId === selectedMilestone;
                    if(milestone) { requiredSliderPosition = milestone.nr; }
                    onSetSelectedMilestone(milestone?.id);
                    //hide any menu from parent components (eg burger menu)
                }

                //dragging
                let dragStartX;
                function dragStart(e,d){
                    console.log("ds")
                    onSetEditingReactComponent(null);
                    setForm(null);
                    if(!swipable) { return; }
                    //check pos
                    dragStartX = e.x;
                }
                function dragged(e,d){
                    if(!swipable) { return; }
                    if((e.dx > 0 && !canSlideBack) || (e.dx < 0 && !canSlideForward)){ return; }
                    slideToOffset(currentSliderOffset + e.dx)
                }
                function dragEnd(e,d){
                    if(!swipable) { return; }
                    if(e.x < dragStartX){
                        slideForward();
                    }else{
                        slideBack();
                    }
                    dragStartX = null;
                }

                milestonesWrapperG.call(drag)
                //profilesG.attr("pointer-events", swipable ? "none" : null)

                //POSITIONING
                //offsetting due to slide
                //slideTo(requiredSliderPosition, { transition:slideTransition });

                //first set the react component, then slideTo will update its position as part of tha transition
                const reactComponent = /*currentPage.key === "goal" ?*/ {
                    componentType:currentPage.key,//"goal",
                    transform:[currentSliderOffset, topBarHeight],
                    items:positionedData
                }// : null;
                // left: currentSliderOffset + x - (width/2) *k, 
                //top: topBarHeight + y - (height/2) * k
                setReactComponent(reactComponent)
                //console.log("update, about to call slide", d3.select("div#react-container").node())

                slideTo(requiredSliderPosition, { transition:SLIDE_TRANSITION });
                //the slideTo call above doesnt apply transform because it has alreayd been applied the first time before react-container
                //is defined
                /*if(!d3.select("div#react-container").empty()){
                    console.log("applying pos to react-container................", d3.select("div#react-container").node())
                    d3.select("div#react-container")
                        .style("left", `${currentSliderOffset}px`)
                        .style("top", `${topBarHeight}px`)
                }*/
                

                const prevCard = x => d3.greatest(positionedData.filter(m => m.x < x), m => m.x);
                const nextCard = x => d3.least(positionedData.filter(m => m.x > x), m => m.x);

                function createMilestonePlaceholder(prev, next){
                    //remove datephase labels and navigation ctrls
                    //@todo - datephase labels could remain but would need to slide wth profile-cards
                    //disable the slider
                    onToggleSliderEnabled();
                    containerG.select("g.phase-labels").attr("display", "none");
                    //positioning
                    const xOffsetForCardsBefore = calculateOffsetForCardsBeforePlaceholder(placeholderWidth, hitSpace)(prev, next);
                    const xOffsetForCardsAfter = calculateOffsetForCardsAfterPlaceholder(placeholderWidth, hitSpace, phaseGap)(prev, next);
                    const placeholderX = calculatePlaceholderX(placeholderWidth, hitSpace, phaseGap)(prev, next);
                    //helpers
                    const addPlaceholder = () => {
                        const handlePlaceholderBtnClick = key => {
                            //temp fix to stop click selected a milestone. stopProagation doesnt work with d3.drag
                            ignoreNextWrapperClick = true;
                            if(key === "cancel"){ 
                                handleCancelMilestone(); 
                            }else{
                                //interpolate dates to get new date, or adds/subtracts one month if its at an end
                                const interpolator = d3.interpolateDate(prev?.date, next?.date);
                                console.log("createM prev next", prev, next)
                                const newDate = prev && next ? interpolator(0.5) :
                                    (prev ? addMonths(1, prev.date) : addMonths(-1, next.date))

                                newDate.setUTCHours(22); 
                                newDate.setUTCMinutes(0); 
                                newDate.setUTCSeconds(0); 
                                newDate.setUTCMilliseconds(0); 
                                console.log("new Date after reset", newDate)

                                handleCreateMilestone(key, newDate, calcNewMilestoneNr(prev, next));
                            }
                        }

                        milestonesG
                            .append("g")
                                .attr("class", "placeholder")
                                .attr("transform", `translate(${placeholderX}, ${milestonesHeight/2})`)
                                .attr("opacity", 0)
                                .call(addMilestonePlaceholderContents, placeholderWidth, placeholderHeight, handlePlaceholderBtnClick)
                                    .transition()
                                    .duration(300)
                                        .attr("opacity", 0.5);

                    }
                    //@todo - only slide if the space is not on screen, and only side a little so its on screen
                    //slide to between prev and next cards, unless its an the start or end
                    const tempSliderPosition = prev && next ? prev.nr + 0.5 :(prev ? "afterEnd" : "beforeStart");
                    slideTo(tempSliderPosition, {
                        transition:{ duration: 300, ease:EASE_IN_OUT },
                        cb:() => {
                            if(prev && next){
                                //in this case, must slide cards out either side to create space
                                milestonesG.selectAll("g.milestone")
                                    .call(updateTransform, { 
                                        //for those after, we add the phaseGap and the new hitspace that will be created from new milestone
                                        x:d => d.x +(d.nr >= next.nr ? xOffsetForCardsAfter :  xOffsetForCardsBefore),
                                        y:d => d.y,
                                        transition:{ duration: 300, ease:EASE_IN_OUT }
                                    });
                            }
                            addPlaceholder();
                        }
                    });
                }

                function handleCreateMilestone(dataType, date, newMilestoneNr){
                    //immediately remove placeholder (no trans)
                    removeMilestonePlaceholder();

                    milestonesG.selectAll("g.milestone")
                        .attr("transform", d => `translate(${d.x},${d.y})`)
                        //.call(updateTransform, { x:d => d.x, y:d => d.y, transition:null });

                    //update will be auto-tiggered by react state update
                    //do the slide update manually so no transition
                    //slideTo(newMilestoneNr, { transition: null })
                    //ensure it doesnt try to slide on next update
                    requiredSliderPosition = newMilestoneNr;

                    //disable transition for the next update
                    transitionOn = false;

                    //simplest soln to jerkiness is to have a fade out an din on th eplaceholder
                    //and the new milestone, until the position is sorted.
                    onCreateMilestone(dataType, date);
                
                    //set slider position
                    //requiredSliderPosition = newMilestoneNr

                }
                function handleCancelMilestone(){
                    milestonesG.select("g.placeholder")
                        .transition()
                        //.delay(1000)
                        .duration(300)
                                .attr("opacity", 0)
                                    .on("end", function(){ 
                                        d3.select(this).remove();
                                        milestonesG.selectAll("g.milestone")
                                            .call(updateTransform, { 
                                                x:d => d.x,
                                                y:d => d.y,
                                                transition:{ duration: 300, ease:EASE_IN_OUT },
                                                cb:() => {
                                                    update(data, { slideTransition:{ duration:300, ease: EASE_IN } }); 
                                                }
                                            });

                                        //re-enabled slider and phase labels
                                        onToggleSliderEnabled();
                                        containerG.select("g.phase-labels").attr("display", null)
                                    });
                    
                }
                function removeMilestonePlaceholder(wasCancelled){
                    milestonesG.select("g.placeholder").remove();
                    //re-enabled slider
                    onToggleSliderEnabled();
                    containerG.select("g.phase-labels").attr("display", null)

                    //make sliderPositon equal to new profile (if it wasnt cancelled)

                    //re-position if cancelled
                    if(wasCancelled){
                        slideTo(prevSliderPosition);
                        prevSliderPosition = null;
                    }
                }

                //phase labels
                const currentCard = positionedData.find(m => m.isCurrent);
                const endOfLastPastCard = data.length === 0 ? 0 : currentCard.x - currentCard.width/2 - phaseGap - hitSpace - labelMarginHoz;
                const startOfFirstFutureCard = data.length === 0 ? 0 : currentCard.x + currentCard.width/2 + phaseGap + hitSpace + labelMarginHoz;
                const labelY = data.length === 0 ? 0 : -currentCard.height/2 - 10;
                datePhasesData = [
                    { label:"<-- Past", x:endOfLastPastCard, y:labelY, textAnchor:"end", },
                    { label: "Current", x:currentCard?.x, y:labelY, textAnchor:"middle"},
                    { label: "Future -->", x:startOfFirstFutureCard, y:labelY, textAnchor:"start" }
                ]
                milestonesG.select("g.phase-labels")
                    .attr("transform", `translate(0, ${milestonesHeight/2})`)
                    .selectAll("text")
                    .data(datePhasesData, d => d.label)
                        .join("text")
                            .attr("x", d => d.x)
                            .attr("y", d => d.y)
                            .attr("text-anchor", d => d.textAnchor)
                            .attr("dominant-baseline", "auto")
                            .attr("stroke", grey10(5))
                            .attr("fill", grey10(5))
                            .attr("stroke-width", 0.3)
                            .attr("font-size", 14)
                            .attr("font-family", "helvetica, sans-serifa")
                            .text(d => d.label)

                //call profileCsrds abd contarcts comps, passing in a yscale that centres each one
                contractsG
                    .datum(positionedData.filter(m => m.dataType === "contract"))
                    .call(contracts
                        .width(contractWidth)
                        .height(contractHeight)
                        .fontSizes(fontSizes.contract)
                        .transformTransition(milestoneTransition || (transitionOn ? transformTransition : { update:null })));

                //scaling helpers - allows them to increase to full height or width including margin
                const horizScale = width / profileWidth;
                const vertScale = height / profileHeight;
                availableScale = fixedAvailableScale || d3.min([horizScale, vertScale]);

                profilesG
                    //.attr("transform", "translate(0, -20")
                    .datum(positionedData.filter(m => m.dataType === "profile"))
                    .call(profiles
                        .width(profileWidth)
                        .height(profileHeight)
                        .margin(profileMargin)
                        .fontSizes(fontSizes.profile)
                        .currentPage(currentPage)
                        .selected(selectedMilestone)
                        .expanded([{
                            id:selectedMilestone,
                            //if landscape, then vert space is less so we scale according to that 
                            k: availableScale,// width > height ? vertScale : horizScale
                        }])
                        //.kpiHeight(30) //if we want to fix the kpiheIght
                        .kpiFormat(kpiFormat)
                        .editable(swipable ? false : true)
                        .scrollable(swipable ? false : true)
                        .onSaveValue(onSaveValue)
                        .onSetEditing(onSetEditingSVGComponent)
                        .onStartEditingPhotoTransform(function(milestoneId, locationKey){
                            milestoneBeingEdited = { id:milestoneId, desc:"photo" }
                            milestonesG
                                .selectAll("g.milestone")
                            //d3 doesnt like this line below for some reason - it re-enters the profile card - so filter instead
                            //.select(`g.milestone-${selectedMilestone}`)
                                .filter(d => d.id !== milestoneId)
                                .call(profiles.applyOverlay, {
                                    onClick:()=>{
                                        ignoreNextWrapperClick = true;
                                        endMilestoneEdit();
                                    }
                                })

                            milestonesG
                                .selectAll("g.milestone")
                            //d3 doesnt like this line below for some reason - it re-enters the profile card - so filter instead
                            //.select(`g.milestone-${selectedMilestone}`)
                                .filter(d => d.id === milestoneId)
                                .call(profiles.applyOverlay, {
                                    include:["bottom"],
                                    onClick:()=>{
                                        ignoreNextWrapperClick = true;
                                        endMilestoneEdit();
                                    }
                                })
                            //pass to react parent
                            onSetEditingSVGComponent(milestoneBeingEdited)
                        })
                        .onEndEditingPhotoTransform(function(milestoneId, locationKey){
                            milestoneBeingEdited = null;
                            ignoreNextWrapperClick = true;
                            milestonesG
                                .selectAll("g.milestone")
                                .call(profiles.removeOverlay);

                            //pass to react parent
                            onSetEditingSVGComponent(null);
                        })
                        .onClickInfo(function(e, d, data, desc, location){
                            ignoreNextWrapperClick = true;
                            const milestone = positionedData.find(m => m.id === data.id);
                            const { id, x, y, date, width, height, dataType } = milestone;
                            if(desc === "date"){
                                //need to calc left so it includes all transforms eg offset
                                const k = isSelected(id) ? availableScale : 1;
                                const commonProps = {
                                    formType: "date", 
                                    milestoneType:dataType, 
                                    milestoneId:id,
                                    //if its selected, then we also need to use scale when positioning the form within the profile
                                    left: currentSliderOffset + x - (width/2) *k, 
                                    top: topBarHeight + y - (height/2) * k
                                }
                                const dateForm = id === "current" ? { ...commonProps, key:"settings" } : { ...commonProps, value: date };

                                //hide date-info for this milestone, and show others
                                milestonesG.selectAll("g.milestone")
                                    .filter(d => d.id === id)
                                    .selectAll("g.date-info")
                                    .attr("display", "none")
                                
                                milestonesG.selectAll("g.milestone")
                                    .filter(d => d.id !== id)
                                    .selectAll("g.date-info")
                                    .attr("display", null)
                        
                                //show form
                                setForm(dateForm)
                                return;
                            }
                            //@todo - CHECK WE DEFO DONT NEED THIS AS ITS UPDATED ELSEWHERE
                            //milestonesG.selectAll("g.milestone").selectAll("g.date-info")
                               //.attr("display", null)

                            //photo
                            if(desc === "photo"){
                                const photoForm = {
                                    formType:"photo",
                                    milestoneId:id,
                                    location
                                }
                                setForm(photoForm);
                                return;
                            }


                            //default -> remove form
                            setForm(null)
                        })
                        //if closing a kpi, we dont want it to reopen or close the card (via wrapperClick). 
                        //but if its selecting a kpi, we do want it to also open the card 
                        .onUpdateSelectedKpi((profileId, key, dimns) => { 
                            //Remove forms, including any selectedStep form
                            setForm(null);
                            if(!key){ 
                                ignoreNextWrapperClick = true;
                                //must delay changing the display to none, to allow teh opacity to fade out
                                //@todo - refcator into a clearer and consistent pattern how we handle react comp 
                                //opacity ad display updates
                                d3.timeout(() => {
                                    onSetSelectedKpi(null);
                                }, CONTENT_FADE_DURATION)
                            }else{
                                const _dimns = { ...dimns, heights:{ ...dimns.heights, topBar: topBarHeight }, offset:currentSliderOffset };
                                onSetSelectedKpi({ profileId, key, dimns:_dimns });
                            }
                        })
                        .onEditStep((stepId, dimns) => {
                            //console.log("editStep dimns", dimns)
                            if(!stepId){ 
                                //close any stepform if it is open
                                setForm(null);
                                return; 
                            }
                            //dimns
                            const { widths, heights, margins, profile } = dimns;
                            const leftOfCard = profile.x - profile.width/2 + currentSliderOffset;
                            const marginsBeforeItem = margins.kpi.left + margins.list.left + margins.item.left;
                            const outerContainerLeft = leftOfCard;
                            const left = marginsBeforeItem + widths.symbol + margins.desc.left;

                            const topOfCard = topBarHeight + profile.y - profile.height/2;
                            const cardHeightAboveList = heights.textInfo + margins.kpi.top + heights.title + heights.progressBar
                            const listHeightAboveItem = margins.list.top + heights.stepsAbove + margins.item.top;
                            const outerContainerTop = topOfCard;
                            const top = cardHeightAboveList + listHeightAboveItem;
    
                            const width = widths.descContents;
                            const height = heights.itemContents;

                            const milestone = positionedData.find(m => m.id === selectedMilestone);
                            const kpi = milestone.kpis.kpisData.find(kpi => kpi.key === selectedKpi);
                            //const step = kpi.steps?.find(step => step.id === stepId);

                            //apply the scale 

                            //todo next - got hruh teh x,y,width,height funcs check tehy are correct
                            //then implement the form textfield 
                            const form = {
                                formType:"step",
                                milestoneType:milestone.dataType, 
                                milestoneId:milestone.id,
                                outerContainerLeft,
                                outerContainerTop,
                                outerContainerWidth:milestone.width,
                                outerContainerHeight:milestone.height,
                                left,
                                top,
                                width,//calcStepWidth(dimns),
                                height,//calcStepHeight(dimns)
                                //left:currentSliderOffset + x - (width/2) * k,
                                //top:topBarHeight + y - (height/2) * k
                            }
                            //console.log("form..........", form)
                            //set form for the profile, kpi and stepId
                            setForm(form)
                        })
                        .onMilestoneWrapperPseudoDragStart(dragStart)
                        .onMilestoneWrapperPseudoDrag(dragged)
                        .onMilestoneWrapperPseudoDragEnd(dragEnd)
                        .ctrls(d => ({
                            topRight: [
                                { 
                                    label:selectedMilestone === d.id ? "collapse" : "expand", 
                                    icon:{ 
                                        iconType:"path", 
                                        d:selectedMilestone === d.id ? icons.collapse.d : icons.expand.d,
                                        //todo - refactor...we temp apply a manula scale to expand so they are same size
                                        transform: selectedMilestone === d.id ? null : "scale(0.75)"
                                    },
                                    onClick:() => {
                                        //@todo - why is this so slow to update? had to cut it out for now
                                        //onReleaseScreen();
                                        ignoreNextWrapperClick = true;
                                        if(selectedMilestone === d.id){
                                            updateSelected();
                                        }else{
                                            updateSelected(d);
                                        }
                                        
                                    }
                                }
                            ],
                            botRight: d.isCurrent ? [] : [
                                { 
                                    label:"turnPage", 
                                    icon:turnPage,
                                    styles:{
                                        fill:grey10(5)
                                    },
                                    onClick:d => {
                                        ignoreNextWrapperClick = true;
                                        currentPage = PROFILE_PAGES[currentPage.nr + 1] || PROFILE_PAGES[0];
                                        update(data, { slideTransition:SLIDE_TRANSITION });
                                    }
                                }
                            ]
                        }))
                        .onClick(() => { console.log("handler: profile card clicked")})
                        //.onClickKpi((kpi, stepId) => {})
                        .onDblClickKpi((e,d) => {
                            onSelectKpiSet(d);
                        })
                        .transformTransition(milestoneTransition || (transitionOn ? transformTransition : { update:null })));

                endMilestoneEdit = function(){
                    //bug - this is being called twice when cliking eg bottom overlay of profile
                    if(!milestoneBeingEdited){ return; }
                    const { id, desc } = milestoneBeingEdited;
                    profiles.endEditing(id);
                    milestonesG
                        .selectAll("g.milestone")
                        .call(profiles.removeOverlay);
                        
                    //pass transform to react parent to save
                    //const initTransformState = d3.zoomTransform(containerG.select("g.photo").node());
                    //console.log("tttttttt", initTransformState)
                    const transform = d3.select(`g.milestone-${id}`).select("g.photo").select("image").attr("transform");
                    const { translateX=0, translateY=0, scaleX=1 } = getTransformationFromTrans(transform);
                    //@todo - work out why I cant seem to gran teh transform from the d3 transform object
                    //const trans = d3.zoomTransform(milestoneG.select("g.photo")) -> returns the identity instead
                    const locationKey = id === "current" ? "profile" : currentPage.key;
                    const updates = {
                        x:Number(translateX.toFixed(3)),
                        y:Number(translateY.toFixed(3)),
                        k:Number(scaleX.toFixed(3))
                    }
                    onUpdateMilestone(id, "media", locationKey, updates);
                }

                function updateTransform(selection, options={}){
                    //console.log("updateTransform...", selection.nodes())
                    const { x = d => d.x, y = d => d.y, transition, cb = () => {} } = options;
                    selection.each(function(d){
                        if(transition){
                            d3.select(this)
                                .transition()
                                .ease(transition.ease || d3.easeLinear)
                                .duration(transition.duration || 200)
                                //add delay option here
                                    .attr("transform", "translate("+x(d) +"," +y(d) +")")
                                    .on("end", cb);

                            //react-component (ie must keep in pos with wrapperG)
                            if(d3.select(this).attr("class") === "milestones-wrapper" && !d3.select("div#react-container").empty()){
                                d3.select("div#react-container")
                                    .transition()
                                    .ease(transition.ease || d3.easeLinear)
                                    .duration(transition.duration || 200)
                                    //add delay option here
                                        .style("left", `${x(d)}px`)
                                        //must add topBarHeight as this is higher up than the milestoneWrapper so not counted in y(d)
                                        .style("top", `${y(d) + topBarHeight}px`)

                            }
                            //react-component-items (children) (must keep in pos with milestoneGs)
                            if(d3.select(this).classed("milestone") === true){
                                //react milestones
                                d3.select(`div#milestone-${d.id}`)
                                    .transition()
                                    .duration(200)
                                        .style("left", `${x(d) - (profileWidth - profileMargin.left)/2}px`)
                                        .style("top", `${y(d)}px`)
                            }

                        }else{
                            d3.select(this)
                                .attr("transform", "translate("+x(d) +"," +y(d) +")");

                            //react-component (ie must keep in pos with wrapperG)
                            if(d3.select(this).attr("class") === "milestones-wrapper" && !d3.select("div#react-container").empty()){
                                d3.select("div#react-container")
                                    .style("left", `${x(d)}px`)
                                    //must add topBarHeight as this is higher up than the milestoneWrapper so not counted in y(d)
                                    .style("top", `${y(d) + topBarHeight}px`)
                            }
                            //react-component-items (children) (must keep in pos with milestoneGs)
                            if(d3.select(this).classed("milestone") === true){
                                //react milestones
                                d3.select(`div#milestone-${d.id}`)
                                    .style("left", `${x(d)}px`)
                                    .style("top", `${y(d)}px`)
                            }
                            
                            cb.call(this);
                        }
                    })
                }

                slideBack = function(){
                    setForm(null)
                    if(canSlideBack){
                        if(selectedMilestone){
                            //move on by one
                            const selected = data.find(d => d.id === selectedMilestone);
                            const newSelected = data.find(d => d.nr === selected.nr - 1);
                            updateSelected(newSelected);
                        }else{
                            requiredSliderPosition -= 1;
                            update(data, { slideTransition:SLIDE_TRANSITION });
                        }
                    }
                }

                slideForward = function(){
                    setForm(null)
                    if(canSlideForward){
                        if(selectedMilestone){
                            //move back by 1
                            const selected = data.find(d => d.id === selectedMilestone);
                            const newSelected = data.find(d => d.nr === selected.nr + 1)
                            updateSelected(newSelected);
                        }else{
                            requiredSliderPosition += 1;
                            update(data, { slideTransition:SLIDE_TRANSITION });
                        }
                    }
                }
                /*
                slideTo = function(nr, onEnd=() => {}){update(data, { slideTransition:SLIDE_TRANSITION });
                    sliderPosition = nr;
                    update(data);
                }
                */
                slideToBeforeStart = function(){
                    slideTo(d3.min(data, d => d.nr) - 0.5);
                }
                slideToAfterEnd = function(){
                    slideTo(d3.max(data, d => d.nr) + 0.5);
                }
            }

            function updateRectDimns(selection, options={}){
                const { width = d => d.width, height = d => d.height, transition, cb = () => {} } = options;
                selection.each(function(d){
                    if(transition){
                        d3.select(this)
                            .transition()
                            .duration(200)
                                .attr("width", width(d))
                                .attr("height", height(d))
                                .on("end", cb);
                    }else{
                        d3.select(this)
                            .attr("width", width(d))
                            .attr("height", height(d));
                        
                        cb.call(this);
                    }
                })
            }

        })


        //icon practice
        /*
        const iconContG = containerG.selectAll("g.icon-cont").data([1])
        iconContG.enter()
            .append("g")
                .attr("class", "icon-cont")
                .each(function(){
                    d3.select(this).append("rect");
                    //d3.select(this).appendSvg(emptyGoal)
                    d3.select(this)
                        .append("g")
                            .html(ball.html)
                })
                .merge(iconContG)
                .attr("transform", "translate(100,100)")
                .each(function(){
                    d3.select(this).select("rect")
                        .attr("width", 200)
                        .attr("height", 200)
                        .attr("fill", "white")

                    const iconG = d3.select(this).select("g");
                    //iconG.selectAll("path").attr("opacity", "0.5")
                    iconG.selectAll(".net")
                        .style("fill", "#f0f0f0")
                    iconG.select(".posts")
                        .style("fill", "#afafaf")
                    
                })*/
        

        //reset one-time only settings
        transitionOn = true;

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
    milestonesBar.availableScale = function (value) {
        if (!arguments.length) { return availableScale; }
        fixedAvailableScale = value;
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
    milestonesBar.requiredSliderPosition = function (value) {
        if (!arguments.length) { return requiredSliderPosition; }
        requiredSliderPosition = value;
        return milestonesBar;
    };
    milestonesBar.xScale = function (value) {
        if (!arguments.length) { return xScale; }
        xScale = value;
        return milestonesBar;
    };
    milestonesBar.yScale = function (value) {
        if (!arguments.length) { return xScale; }
        xScale = value;
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
    /*
    milestonesBar.onSetSelectedStep = function (value) {
        if (!arguments.length) { return onSetSelectedStep; }
        if(typeof value === "function"){
            onSetSelectedStep = value;
        }
        return milestonesBar;
    };
    */
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
