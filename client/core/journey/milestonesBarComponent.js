import * as d3 from 'd3';
import { DIMNS, FONTSIZES, grey10 } from "./constants";
import contractsComponent from './contractsComponent';
import profileCardsComponent from './profileCardsComponent';
import dragEnhancements from './enhancedDragHandler';
import { calculateOffsetForCardsBeforePlaceholder, calculateOffsetForCardsAfterPlaceholder, calculatePlaceholderX, calcNewMilestoneNr } from "./milestonesBarHelpers";
import { addMilestonePlaceholderContents, removeMilestonePlaceholderContents } from './milestonePlaceholder';
import { addMonths } from '../../util/TimeHelpers';
import { milestoneContainingPt } from "./screenGeometryHelpers";
import { icons } from '../../util/icons';
import { hide, show } from './domHelpers';
/*

*/

const EASE_IN = d3.easeCubicIn;
//const EASE_OUT = d3.easeCubicOut;
const EASE_IN_OUT = d3.easeCubicInOut;

export default function milestonesBarComponent() {
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
        topBarHeight = d3.min([30, contentsHeight * 0.1]);
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
    
            }
        },
        contracts:{

        }
    }
    let _styles = () => DEFAULT_STYLES;

    let swipable = true;

    let xScale = x => 0;

    //state
    let selected;

    let kpiFormat;
    let onSetSelectedMilestone = function(){};
    let onSetKpiFormat = function(){};
    let onSelectKpiSet = function(){};
    let onToggleSliderEnabled = function(){};

    let onCreateMilestone = () => {};
    let onDeleteMilestone = () => {};

    let onTakeOverScreen = () => {};
    let onReleaseScreen = () => {};

    const drag = d3.drag();
    const enhancedDrag = dragEnhancements();

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

    //components
    const contracts = contractsComponent();
    const profiles = profileCardsComponent()
        .onCtrlClick((e,d) => { onSetKpiFormat(d.key) });

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
    let ignoreNextClick = false;

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
        const { transitionEnter=true, transitionUpdate=true } = options;
        // expression elements
        selection.each(function (data) {
            //console.log("updateMBar")
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
                    .attr("fill", "transparent")
                contentsG = containerG.append("g").attr("class", "milestone-bar-contents");
                contentsG.append("rect")
                    .attr("class", "milestones-bar-contents-bg")
                    .attr("fill", "transparent");

                milestonesWrapperG = contentsG.append("g").attr("class", "milestones-wrapper")
                    .attr("transform", `translate(0,0)`);

                topBarG = milestonesWrapperG.append("g").attr("class", "top-bar")

                topBarG.append("rect").attr("fill", "transparent")

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

            }

            //data can be passed in from a general update (ie dataWithDimns above) or from a listener (eg dataWithPlaceholder)
            function update(data, options={}){
                //console.log("updateMBarComponent......")
                const { slideTransition, milestoneTransition } = options;

                //milestone positioning
                const calcX = calcMilestoneX(data);
                const positionedData = data.map(m => ({ 
                    ...m, 
                    x: calcX(m.nr), 
                    y: milestonesHeight/2,
                    width:getWidth(m),
                    height:getHeight(m)
                }));

                //console.log("positionedData", positionedData)
                const calcOffsetX = calculateOffsetX(positionedData)

                slideTo = function(position, options={} ){
                    //need to also check offset, incase slider pos hadnt changed but dimns have changed
                    const numericalPosition = typeof position === "number" ? position : convertToNumber(position);
                    const offset = calcOffsetX(numericalPosition);
                    
                    if(currentSliderPosition === position && offset === currentSliderOffset) { return; }
                    const { transition, cb } = options;

                    //helper
                    const convertToNumber = wordPosition => {
                        if(wordPosition === "beforeStart"){ return d3.min(data, d => d.nr) - 0.5 }
                        if(wordPosition === "afterEnd") { return d3.max(data, d => d.nr) + 0.5; }
                        return 0;
                    }

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
                    .onClick(handleMilestoneClick)
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
                    .onDblClick(handleMilestoneClick) //see note about chrome on mobile
                    .onLongpressStart(function(e, d){
                        const pt = adjustPtForData(e);
                        const milestone = milestoneContainingPt(pt, positionedData);
                        if(milestone){
                            console.log("remove animation")
                        }else{
                            createMilestonePlaceholder(prevCard(pt.x), nextCard(pt.x))
                        }
                    })

                drag
                    .on("start", selected ? null : enhancedDrag(dragStart))
                    .on("drag", selected ? null : enhancedDrag(dragged))
                    .on("end", selected ? null : enhancedDrag(dragEnd));
                
                //click and dbl-click 
                //todo: chrome mobile had no dbl-click so currently no difference if no dbl-click
                //but need a way of distinguisng this -eg on laptop we do want it differentiated
                //but maybe best is to just make dbl-click teh same as two clicks , and 
                //then ppl on chrome mobile just cant do two clicks in quick succession
                function handleMilestoneClick(e,d){
                    //this is a temp setting to save us having to turn drag off whilst creating a milestone
                    //otherwise the confirm click would also trigger this.
                    if(ignoreNextClick){
                        ignoreNextClick = false;
                        return;
                    }
                    //hide phase labels
                    //@todo - BUG - why is there a delay in removing the burger bars?
                    onTakeOverScreen();
                    milestonesG.select("g.phase-labels").call(hide);
                    //if(selected){
                        //treat it as a dbl-click => clicking a selected milestone zooms user in even further
                        //or maybe this needs to be doen at next evel as drag is turned off when selected i think
                    //}
                    const milestone = milestoneContainingPt(adjustPtForData(e), positionedData);
                    if(milestone){
                        selected = milestone.id;
                        //this triggers update
                        onSetSelectedMilestone(milestone.id);
                    }
                }
                //dragging
                let dragStartX;
                function dragStart(e,d){
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
                profilesG.attr("pointer-events", swipable && !selected ? "none" : null)

                //POSITIONING
                //offsetting due to slide
                //slideTo(requiredSliderPosition, { transition:slideTransition });
                slideTo(requiredSliderPosition, { transition:SLIDE_TRANSITION });

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
                            ignoreNextClick = true;
                            if(key === "cancel"){ 
                                handleCancelMilestone(); 
                            }else{
                                //interpolate dates to get new date, or adds/subtracts one month if its at an end
                                const interpolator = d3.interpolateDate(prev?.date, next?.date);
                                const newDate = prev && next ? interpolator(0.5) :
                                    (prev ? addMonths(1, prev.date) : addMonths(-1, next.date))

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
                                milestonesG.selectAll("g.profile-card")
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

                    milestonesG.selectAll("g.profile-card")
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
                                        milestonesG.selectAll("g.profile-card")
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
                //console.log("data", positionedData)

                //phase labels
                const currentCard = positionedData.find(m => m.isCurrent);
                const endOfLastPastCard = currentCard.x - currentCard.width/2 - phaseGap - hitSpace - labelMarginHoz;
                const startOfFirstFutureCard = currentCard.x + currentCard.width/2 + phaseGap + hitSpace + labelMarginHoz;
                const labelY = -currentCard.height/2 - 10;
                datePhasesData = [
                    { label:"<-- Past", x:endOfLastPastCard, y:labelY, textAnchor:"end", },
                    { label: "Current", x:currentCard.x, y:labelY, textAnchor:"middle"},
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
                            .attr("font-size", 12)
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
                /*console.log("height", height)
                console.log("contentsH", contentsHeight)
                console.log("milestonesh", milestonesHeight)
                console.log("topBarH", topBarHeight)
                console.log("scaleused", width > height ? "v" : "h")*/
                const horizScale = width / profileWidth;
                const vertScale = height / profileHeight;
                const scale = d3.min([horizScale, vertScale]);
                //also need to pass through max width and height to ensure not exceeded

                // const horizScale = (profileWidth + (2 * hitSpace)) / profileWidth;
                // const vertScale = (milestonesHeight + topBarHeight) / profileHeight;
                profilesG
                    //.attr("transform", "translate(0, -20")
                    .datum(positionedData.filter(m => m.dataType === "profile"))
                    .call(profiles
                        .width(profileWidth)
                        .height(profileHeight)
                        .fontSizes(fontSizes.profile)
                        .expanded([{
                            id:selected,
                            //if landscape, then vert space is less so we scale according to that 
                            k: scale,// width > height ? vertScale : horizScale
                        }])
                        //.kpiHeight(30) //if we want to fix the kpiheIght
                        .editable(swipable ? false : true)
                        .scrollable(swipable ? false : true)
                        .topRightCtrls(d => selected === d.id ? [
                            //todo - toggle between expand and reduce for now, its just reduce
                            { 
                                label:"collapse", 
                                icon:{ iconType:"path", d:icons.collapse.d },
                                onClick:d => {
                                    milestonesG.select("g.phase-labels").call(show);
                                    onReleaseScreen();
                                    //problem - the line below will prompt an update, which will
                                    //make the manulal call here useless. Either need to pass in a 
                                    //2nd arg, shouldUpdate = false, or have a temp stting here so it transitions
                                    //or dont send thru selectedMilestone, instead just maually change the height here.

                                    //EVEN BETTER, WE SHOULDNT BE CURTAILING THE DISPLAY IN TEH PARENT CONTAINER AT ALL
                                    //WE CAN JUST HABNLE IT HERE THRU THE STANDARD MARGIN CONVENTIO, AND THEN JUST CHANGE IT
                                    //TO 0 WHEN SELECTED
                                    onSetSelectedMilestone("");
                                    selected = null;
                                    update(data, { milestoneTransition:{ update:{ duration:2000 }} })
                                }
                            }
                        ] : [])
                        .onClick(() => { console.log("handler: profile card clicked")})
                        .onClickKpi(onSelectKpiSet)
                        .onDblClickKpi((e,d) => {
                            onSelectKpiSet(d);
                        })
                        .transformTransition(milestoneTransition || (transitionOn ? transformTransition : { update:null })));

                //functions
                function updateTransform(selection, options={}){
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
                        }else{
                            d3.select(this)
                                .attr("transform", "translate("+x(d) +"," +y(d) +")");
                            
                            cb.call(this);
                        }
                    })
                }

                slideBack = function(){
                    if(canSlideBack){
                        requiredSliderPosition -= 1;
                        update(data, { slideTransition:SLIDE_TRANSITION });
                    }
                }

                slideForward = function(){
                    if(canSlideForward){
                        requiredSliderPosition += 1;
                        update(data, { slideTransition:SLIDE_TRANSITION });
                    }
                }
                /*
                slideTo = function(nr, onEnd=() => {}){
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
    milestonesBar.swipable = function (value) {
        if (!arguments.length) { return swipable; }
        swipable = value;
        return milestonesBar;
    };
    milestonesBar.selected = function (value) {
        if (!arguments.length) { return selected; }
        selected = value;
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

    milestonesBar.slideBack = function(){ slideBack() };
    milestonesBar.slideForward = function(){ slideForward() };
    milestonesBar.slideTo = function(){ slideTo() };
    return milestonesBar;
}
