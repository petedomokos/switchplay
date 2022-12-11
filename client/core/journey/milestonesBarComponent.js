import * as d3 from 'd3';
import { DIMNS, FONTSIZES, grey10 } from "./constants";
import contractsComponent from './contractsComponent';
import profileCardsComponent from './profileCardsComponent';
import dragEnhancements from './enhancedDragHandler';
import { calculateOffsetForCardsBeforePlaceholder, calculateOffsetForCardsAfterPlaceholder, calculatePlaceholderX, calcNewMilestoneNr } from "./milestonesBarHelpers";
import { addMilestonePlaceholderContents, removeMilestonePlaceholderContents } from './milestonePlaceholder';
import { addMonths } from '../../util/TimeHelpers';
/*

*/
export default function milestonesBarComponent() {
    //API SETTINGS
    // dimensions
    let width;
    let minWidth = 0;
    let height = DIMNS.milestonesBar.height
    let margin = DIMNS.milestonesBar.margin;
    let contentsWidth;
    let milestonesWrapperWidth;
    let contentsHeight;
    let phaseLabelsHeight;
    let milestonesHeight;
    //api to determine widths of milestones based on type
    let profileCardDimns = DIMNS.milestonesBar.profile;
    let contractDimns = DIMNS.milestonesBar.contract;
    let placeholderDimns;
    let milestoneDimns = m => m.dataType === "profile" || m.dataType === "placeholder" ? profileCardDimns: contractDimns;

    let phaseGap;
    let hitSpace;
    let labelMarginHoz;

    function updateDimns(data){
        placeholderDimns = profileCardDimns;
        //base other spacings on the profile card width to keep proportions reasonable
        phaseGap = 0.075 * profileCardDimns.width;
        hitSpace = d3.max([40,profileCardDimns.width * 0.1]);
        labelMarginHoz = profileCardDimns.width * 0.025;
        contentsWidth = width - margin.left - margin.right;
        //we add two extra normal hitspaces for the placeholder spaces at the ends. So in total it (data.length + 1)* hitspace
        milestonesWrapperWidth = 2 * placeholderDimns.width + (data.length + 1) * hitSpace + d3.sum(data, m => m.width) + 2 * phaseGap;
        contentsHeight = height - margin.top - margin.bottom;
        milestonesHeight = profileCardDimns.height;
        phaseLabelsHeight = contentsHeight - milestonesHeight;

    }

    let fontSizes = {
        profile: FONTSIZES.profile(1),
        contract: FONTSIZES.contract(1)
    }
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

    let xScale = x => 0;
    let selected;

    let kpiFormat;
    let onSetKpiFormat = function(){};
    let onSelectKpiSet = function(){};
    let onToggleSliderEnabled = function(){};

    let onCreateMilestone = () => {};
    let onDeleteMilestone = () => {};

    let enhancedBgDrag = dragEnhancements();

    let onClick = function(){};
    let onDblClick = function(){};
    let onLongpress = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};

    let containerG;
    let contentsG;
    let milestonesWrapperG;
    let phaseLabelsG;
    let milestonesG;
    let contractsG;
    let profilesG;

    //components
    const contracts = contractsComponent();
    const profiles = profileCardsComponent()
        .onCtrlClick((e,d) => { onSetKpiFormat(d.key) });

    let requiredSliderPosition = 0;
    let currentSliderPosition;
    let slideBack;
    let slideForward;
    let slideTo;
    let slideToBeforeStart;
    let slideToAfterEnd;
    let currentXOffset = 0;

    let datePhasesData;

    let transitionOn = true;

    //helper
    //data is passed in here, so we can call this function with other data too eg with placeholder
    const calcMilestoneX = data => nr => {
        const milestone = data.find(m => m.nr === nr);
        const { datePhase, i } = milestone;
        const previousMilestonesData = data.filter(m => m.nr < nr);
        const extraGaps = datePhase === "future" ? phaseGap * 2 : (datePhase === "current" ? phaseGap : 0)
        //add one extra hit-space for the placeholder space at start
        return placeholderDimns.width + ((i + 1) * hitSpace) + d3.sum(previousMilestonesData, d => d.width) + milestone.width/2 + extraGaps;
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
            return contentsWidth/2 - prev.x - prev.width/2 - extraGaps - placeholderDimns.width/2;
        }
        //show at start
        return contentsWidth/2 - placeholderDimns.width/2;
    }

    const transformTransition = { update: { duration: 1000 } };

    function milestonesBar(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;
        // expression elements
        selection.each(function (_data) {
            containerG = d3.select(this);
            //dimns is needed for init too
            const dataWithDimns = _data.map(m => ({ ...m, ...milestoneDimns(m) }));
            updateDimns(dataWithDimns);
            if(containerG.select("g").empty()){
                init();
            }

            update(dataWithDimns);
            function init(){
                contentsG = containerG.append("g").attr("class", "milestone-bar-contents");
                contentsG.append("rect")
                    .attr("class", "milestones-bar-bg")
                    .attr("fill", "blue");

                milestonesWrapperG = contentsG.append("g").attr("class", "milestones-wrapper")
                    .attr("transform", `translate(0,0)`);

                phaseLabelsG = milestonesWrapperG.append("g").attr("class", "phase-labels")
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
                    .attr("fill", "pink")
                    .attr("stroke", "pink")
                    .attr("opacity", 0.7);

                contractsG = milestonesG.append("g").attr("class", "contracts");
                profilesG = milestonesG.append("g").attr("class", "profiles");
            }

            //data can be passed in from a general update (ie dataWithDimns above) or from a listener (eg dataWithPlaceholder)
            function update(data){
                //console.log("milestones bar update", data);

                //milestone positioning
                const calcX = calcMilestoneX(data);
                const positionedData = data.map(m => ({ 
                    ...m, 
                    x: calcX(m.nr), 
                    y: milestonesHeight/2
                }));

                // console.log("positionedData", positionedData)

                const calcOffsetX = calculateOffsetX(positionedData)

                slideTo = function(position, options={} ){
                    if(currentSliderPosition === position) { return; }
                    const { transition = { duration: 500 }, cb } = options;

                    //helper
                    const convertToNumber = wordPosition => {
                        if(wordPosition === "beforeStart"){ return d3.min(data, d => d.nr) - 0.5 }
                        if(wordPosition === "afterEnd") { return d3.max(data, d => d.nr) + 0.5; }
                        return 0;
                    }
                    //console.log("slideTo..... transitionON?", transitionOn, transition)

                    const numericalPosition = typeof position === "number" ? position : convertToNumber(position);
                    milestonesWrapperG.call(updateTransform, {
                        x: () => calcOffsetX(numericalPosition),
                        y: () => 0,
                        transition : transitionOn ? transition : null,
                        cb
                    });
                    //set state before end of slide, to prevent another slide if an update is 
                    //called again before this slide has ended
                    currentSliderPosition = position
                }

                //console.log("positionedData", positionedData)

                contentsG
                    .attr("transform", `translate(${margin.left},${margin.top})`)
                    .select("rect.milestones-bar-bg")
                        .attr("width", contentsWidth)
                        .attr("height", contentsHeight);

                        
                //POSITIONING
                //offsetting due to slide
                slideTo(requiredSliderPosition);

                const prevCard = x => d3.greatest(positionedData.filter(m => m.x < x), m => m.x);
                const nextCard = x => d3.least(positionedData.filter(m => m.x > x), m => m.x);

                enhancedBgDrag.onLongpressStart(e => {
                    createMilestonePlaceholder(prevCard(e.x), nextCard(e.x))
                });

                const createMilestonePlaceholder = (prev, next) => {
                    //positioning
                    const xOffsetForCardsBefore = calculateOffsetForCardsBeforePlaceholder(placeholderDimns, hitSpace)(prev, next);
                    const xOffsetForCardsAfter = calculateOffsetForCardsAfterPlaceholder(placeholderDimns, hitSpace, phaseGap)(prev, next);
                    const placeholderX = calculatePlaceholderX(placeholderDimns, hitSpace, phaseGap)(prev, next);
                    //helpers
                    const addPlaceholder = () => {
                        const handlePlaceholderBtnClick = key => {
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
                                .attr("transform", `translate(${placeholderX}, 0)`)
                                .attr("opacity", 0)
                                .call(addMilestonePlaceholderContents, placeholderDimns, handlePlaceholderBtnClick)
                                    .transition()
                                    .duration(500)
                                        .attr("opacity", 0.5);

                    }
                    //@todo - only slide if the space is not on screen, and only side a little so its on screen
                    //slide to between prev and next cards, unless its an the start or end
                    const tempSliderPosition = prev && next ? prev.nr + 0.5 :(prev ? "afterEnd" : "beforeStart");
                    slideTo(tempSliderPosition, {cb:() => {
                        if(prev && next){
                            //in this case, must slide cards out either side to create space
                            milestonesG.selectAll("g.profile-card")
                                .call(updateTransform, { 
                                    //for those after, we add the phaseGap and the new hitspace that will be created from new milestone
                                    //x:d => d.x + (placeholderDimns.width/2 * (d.nr >= next.nr ? 1 : -1)) +(d.nr >= next.nr ? (phaseGap +hitSpace) : 0),
                                    x:d => d.x +(d.nr >= next.nr ? xOffsetForCardsAfter :  xOffsetForCardsBefore),
                                    y:d => d.y,
                                    transition:{ duration: 200 }
                                });
                        }
                        addPlaceholder();
                        //disable the slider
                        onToggleSliderEnabled();
                    }});
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
                    //disable transition for next update
                    transitionOn = false;

                    //simplest soln to jerkiness is to have a fade out an din on th eplaceholder
                    //and the new milestone, until the position is sorted.
                    onCreateMilestone(dataType, date)
                
                    //set slider position
                    //requiredSliderPosition = newMilestoneNr

                }
                function handleCancelMilestone(){
                    milestonesG.select("g.placeholder")
                        .transition()
                        //.delay(1000)
                        .duration(500)
                                .attr("opacity", 0)
                                    .on("end", function(){ 
                                        d3.select(this).remove();
                                        milestonesG.selectAll("g.profile-card")
                                        .call(updateTransform, { 
                                            x:d => d.x,
                                            y:d => d.y,
                                            transition:{ duration: 200 },
                                            cb:() => { update(data); }
                                        });

                                        //re-enabled slider
                                        onToggleSliderEnabled();
                                    });
                    
                }
                function removeMilestonePlaceholder(wasCancelled){
                    milestonesG.select("g.placeholder").remove();
                    //re-enabled slider
                    onToggleSliderEnabled();

                    //make sliderPositon equal to new profile (if it wasnt cancelled)

                    //re-position if cancelled
                    if(wasCancelled){
                        slideTo(prevSliderPosition);
                        prevSliderPosition = null;
                    }
                }
                

                const bgDrag = d3.drag()
                    .on("start", enhancedBgDrag())
                    .on("drag", enhancedBgDrag())
                    .on("end", enhancedBgDrag())
                    
                milestonesG
                    .attr("transform", `translate(0,${phaseLabelsHeight})`)
                    .select("rect.milestones-bg")
                        .call(updateRectDimns, { 
                            width: () => milestonesWrapperWidth, 
                            height:() => milestonesHeight,
                            transition:transformTransition
                        })
                        .on("mouseover", onMouseover)
                        .on("mouseout", onMouseout)
                        .call(bgDrag)
                
            
                //phase labels
                const currentCard = positionedData.find(m => m.datePhase === "current")
                const endOfLastPastCard = currentCard.x - currentCard.width/2 - phaseGap - hitSpace - labelMarginHoz;
                const middleOfCurrentCard = currentCard.x;
                const startOfFirstFutureCard = currentCard.x + currentCard.width/2 + phaseGap + hitSpace + labelMarginHoz;
                
                datePhasesData = [
                    { label:"Past", x:endOfLastPastCard, textAnchor:"end" },
                    { label: "Current", x:middleOfCurrentCard, textAnchor:"middle" },
                    { label: "Future", x:startOfFirstFutureCard, textAnchor:"start" }
                ]
                phaseLabelsG.selectAll("text").data(datePhasesData, d => d.label)
                    .join("text")
                        .attr("x", d => d.x)
                        .attr("y", phaseLabelsHeight/2)
                        .attr("text-anchor", d => d.textAnchor)
                        .attr("dominant-baseline", "central")
                        .attr("stroke", "white")
                        .attr("fill", "white")
                        .attr("stroke-width", 0.3)
                        .attr("font-size", 12)
                        .text(d => d.label)

                //call profileCsrds abd contarcts comps, passing in a yscale that centres each one
                contractsG
                    .datum(positionedData.filter(m => m.dataType === "contract"))
                    .call(contracts
                        .width(contractDimns.width)
                        .height(contractDimns.height)
                        .fontSizes(fontSizes.contract)
                        .transformTransition(transformTransition));

                profilesG
                    .datum(positionedData.filter(m => m.dataType === "profile"))
                    .call(profiles
                        .width(profileCardDimns.width)
                        .height(profileCardDimns.height)
                        .fontSizes(fontSizes.profile)
                        .kpiHeight(50)
                        .editable(true)
                        .onClickKpi(onSelectKpiSet)
                        .onDblClickKpi((e,d) => {
                            onSelectKpiSet(d);
                        })
                        .onLongpressStart((e,d) => {
                            console.log("lp ", e, d)
                        })
                        .transformTransition(transitionOn ? transformTransition : { update:null }));

                //functions
                function updateTransform(selection, options={}){
                    const { x = d => d.x, y = d => d.y, transition, cb = () => {} } = options;
                    selection.each(function(d){
                        if(transition){
                            //console.log("transitioning update", transition)
                            d3.select(this)
                                .transition()
                                .duration(transition.duration || 200)
                                    .attr("transform", "translate("+x(d) +"," +y(d) +")")
                                    .on("end", cb);
                        }else{
                            //console.log("no transition update............")
                            d3.select(this)
                                .attr("transform", "translate("+x(d) +"," +y(d) +")");
                            
                            cb.call(this);
                        }
                    })
                }

                slideBack = function(){
                    if(currentSliderPosition > d3.min(data, d => d.nr)){
                        requiredSliderPosition -= 1;
                        update(data);
                    }
                }

                slideForward = function(){
                    if(currentSliderPosition < d3.max(data, d => d.nr)){
                        requiredSliderPosition += 1;
                        update(data);
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

        //reset once-only settings
        transitionOn = true;

        return selection;
    }
    
    //api
    milestonesBar.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return milestonesBar;
    };
    milestonesBar.minWidth = function (value) {
        if (!arguments.length) { return minWidth; }
        minWidth = value;
        return milestonesBar;
    };
    milestonesBar.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return milestonesBar;
    };
    milestonesBar.contractDimns = function (value) {
        if (!arguments.length) { return width; }
        contractDimns = value;
        //helper
        milestoneDimns = m => m.dataType === "profile" || m.dataType === "placeholder" ? profileCardDimns: contractDimns;
        return milestonesBar;
    };
    milestonesBar.profileCardDimns = function (value) {
        if (!arguments.length) { return width; }
        profileCardDimns = value;
        //helper
        milestoneDimns = m => m.dataType === "profile" || m.dataType === "placeholder" ? profileCardDimns: contractDimns;
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
    milestonesBar.fontSizes = function (value) {
        if (!arguments.length) { return _styles; }
        fontSizes = { ...fontSizes, ...value };
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
