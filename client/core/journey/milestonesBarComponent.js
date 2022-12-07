import * as d3 from 'd3';
import { DIMNS, FONTSIZES } from "./constants";
import contractsComponent from './contractsComponent';
import profileCardsComponent from './profileCardsComponent';
import dragEnhancements from './enhancedDragHandler';
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
    let milestoneDimns = m => m.dataType === "profile" || m.dataType === "placeholder" ? profileCardDimns: contractDimns;

    let phaseGap;
    let hitSpace;
    let endHitSpace;
    let labelMarginHoz;

    function updateDimns(data){
        //base other spacings on the profile card width to keep proportions reasonable
        phaseGap = 0.075 * profileCardDimns.width;
        hitSpace = d3.max([40,profileCardDimns.width * 0.1]);
        endHitSpace = profileCardDimns.width;
        labelMarginHoz = profileCardDimns.width * 0.025;
        //first, calc width based on number of milestones and their widths
        //contentsWidth = d3.max([minWidth - margin.left - margin.right, d3.sum(data, m => m.width) + 2 * phaseGap ]);
        //contentsWidth = 2 * endHitSpace + d3.sum(data, m => m.width) + 2 * phaseGap;
        contentsWidth = width - margin.left - margin.right;
        milestonesWrapperWidth = 2 * endHitSpace + (data.length - 1) * hitSpace + d3.sum(data, m => m.width) + 2 * phaseGap;
        //height is passed in so calc contentsHeight in the usual way
        //milestonesHeight = profileCardDimns.height; //this is the largest type of milestone
        //phaseLabelsHeight = d3.min([20, milestonesHeight * 0.1]);
        //contentsHeight = milestonesHeight + phaseLabelsHeight;
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

    let sliderPosition = 0;
    let slideBack;
    let slideForward;
    let slideTo;
    let slideToBeforeStart;
    let slideToAfterEnd;
    let currentXOffset = 0;

    let datePhasesData;

    //helper
    //data is passed in here, so we can call this function with other data too eg with placeholder
    const calcMilestoneX = (data, phaseGap) => (nr) => {
        const milestone = data.find(m => m.nr === nr);
        const { datePhase, i } = milestone;
        const previousMilestonesData = data.filter(m => m.nr < nr);
        const extraGaps = datePhase === "future" ? phaseGap * 2 : (datePhase === "current" ? phaseGap : 0)
        return endHitSpace + (i * hitSpace) + d3.sum(previousMilestonesData, d => d.width) + milestone.width/2 + extraGaps;
    }

    const transformTransition = { update: { duration: 1000 } };

    function milestonesBar(selection, options={}) {

        //todo 
        //make kpiHeight higher for milestones bar to allow easy adjusting
        //- horizontal scrollimg in div - not working for some reason -> 
           //soln is instead to use d3 drag - take up teh whole overlay size with teh svg, and put a d3 drag on teh svg
           //or on a rect above and below the milestoneBar. when this is dragged, 
           //simply update the transform x positon of the milestoneG.
           //OR... JUST ADD TWO ARROWS AT BOTTOM OR SIDES < AND >, AND MOVE IT ALONG BY 1 milestone EACH PRESS
        //- kpi bars bug - 2nd card doesnt seem to have all the bars

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
                const calcX = calcMilestoneX(data, phaseGap);
                const positionedData = data.map(m => ({ 
                    ...m, 
                    x: calcX(m.nr), 
                    y: milestonesHeight/2
                }));

                //console.log("positionedData", positionedData)

                contentsG
                    .attr("transform", `translate(${margin.left},${margin.top})`)
                    .select("rect.milestones-bar-bg")
                        .attr("width", contentsWidth)
                        .attr("height", contentsHeight);

                        
                //POSITIONING
                //offsetting due to slide
                let xOffset;
                if(Number.isInteger(sliderPosition)){
                    xOffset = contentsWidth/2 - positionedData.find(m => m.nr === sliderPosition)?.x || 0;
                }else{
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
                        xOffset = contentsWidth/2 - prev.x - prev.width/2 - hitSpace/2 - extraGaps;
                    }else if(prev){
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
                        xOffset = contentsWidth/2 - prev.x - prev.width/2 - extraGaps - endHitSpace/2;

                    }else{
                        //show at start
                        xOffset = contentsWidth/2 - endHitSpace/2;
                    }
                }
                if(xOffset !== currentXOffset){
                    milestonesWrapperG
                        .transition()
                            .duration(500)
                            .attr("transform", `translate(${xOffset},0)`);

                    currentXOffset = xOffset;
                }else{
                    milestonesWrapperG
                        .attr("transform", `translate(${xOffset},0)`);
                }

                const prevCard = x => d3.greatest(positionedData.filter(m => m.x < x), m => m.x);
                const nextCard = x => d3.least(positionedData.filter(m => m.x > x), m => m.x);

                enhancedBgDrag.onLongpressStart(e => {
                    createMilestonePlaceholder(prevCard(e.x), nextCard(e.x))
                });

                let prevSliderPosition;
                const createMilestonePlaceholder = (prevCard, nextCard) => {
                    //store pos to go back to if cancelled
                    prevSliderPosition = sliderPosition;
                    //slider position
                    //@todo - only slide if the space is not on screen, and only side a little so its on screen
                    if(prevCard && nextCard){
                        slideTo(prevCard.nr + 0.5);
                    }else if(prevCard){
                        slideToAfterEnd();
                        //slideTo(d3.min(data, d => d.nr) - 0.5);
                    }else{
                        //next card but no previous
                        slideToBeforeStart();
                    }

                    //remove helper functions and create another for extraGaps calc

                    //apply transition

                    //fade-in placeholder with 3 opts: Profile, Contract, Cancel

                    //disable the slider
                    //onToggleSliderEnabled();
                }
                const removeMilestonePlaceholder = (wasCancelled) => {
                    //remove

                    //re-enabled slider
                    //onToggleSliderEnabled();

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
        const lastPastCard = d3.greatest(positionedData.filter(m => m.datePhase === "past"), d => d.x);
        const firstFutureCard = d3.least(positionedData.filter(m => m.datePhase === "future"), d => d.x);
        console.log("lastPastcard", lastPastCard)
        const currentCard = positionedData.find(m => m.datePhase === "current")
        //note - will also be extra space for gap 'pastCurrentGap' and 'currentFutureGap'
        const endOfLastPastCard = currentCard.x - currentCard.width/2 - phaseGap - hitSpace - labelMarginHoz;
        // lastPastCard.x + lastPastCard.width/2 - labelMarginHoz;
        console.log("end", endOfLastPastCard)
        const middleOfCurrentCard = currentCard.x;
        console.log("mid", middleOfCurrentCard)
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
                        .transformTransition(transformTransition));

                //functions
                slideBack = function(){
                    if(sliderPosition > d3.min(data, d => d.nr)){
                        sliderPosition -= 1;
                        update(data);
                    }
                }

                slideForward = function(){
                    if(sliderPosition < d3.max(data, d => d.nr)){
                        sliderPosition += 1;
                        update(data);
                    }
                }

                slideTo = function(nr){
                    sliderPosition = nr;
                    update(data);
                }
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
