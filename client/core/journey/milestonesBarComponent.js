import * as d3 from 'd3';
import { DIMNS, FONTSIZES } from "./constants";
import contractsComponent from './contractsComponent';
import profileCardsComponent from './profileCardsComponent';
/*

*/
export default function milestonesBarComponent() {
    //API SETTINGS
    // dimensions
    let width;
    let height = DIMNS.milestonesBar.list.height
    let margin = DIMNS.milestonesBar.list.margin;
    let contentsWidth;
    let contentsHeight;
    let phaseLabelsHeight;
    let milestonesHeight;
    //api to determine widths of milestones based on type
    let milestoneWidth = m => 100;
    let profileCardDimns = DIMNS.milestonesBar.profile;
    let contractDimns = DIMNS.milestonesBar.contract;

    let phaseGap;

    //special points
    let endOfLastPastCard;
    let middleOfCurrentCard;
    let startOfFirstFutureCard;


    function updateDimns(data){
        phaseGap = DIMNS.milestonesBar.PHASE_GAP_MULTIPLE * profileCardDimns.width;
        //first, calc width based on number of milestones and their widths
        contentsWidth = d3.sum(data, m => milestoneWidth(m)) + 2 * phaseGap;
        width = contentsWidth + margin.left + margin.right;
        //height is passed in so calc contentsHeight in the usual way
        /*
        contentsHeight = height - margin.top - margin.bottom;
        phaseLabelsHeight = d3.min([20, contentsHeight * 0.1]);
        console.log("phaseh", phaseLabelsHeight)
        milestonesHeight = contentsHeight - phaseLabelsHeight;
        */
        milestonesHeight = profileCardDimns.height; //this is the largest type of milestone
        phaseLabelsHeight = d3.min([20, milestonesHeight * 0.1]);
        contentsHeight = milestonesHeight + phaseLabelsHeight;
        height = contentsHeight + margin.top + margin.bottom;

        //special points
        const pastCards = data.filter(m => m.datePhase === "past");
        const currentCard = data.find(m => m.datePhase === "current")
        //note - will also be extra space for gap 'pastCurrentGap' and 'currentFutureGap'
        const labelMarginHoz = profileCardDimns.width * 0.1;
        endOfLastPastCard = d3.sum(pastCards, m => milestoneWidth(m)) - labelMarginHoz;
        middleOfCurrentCard = d3.sum(pastCards, m => milestoneWidth(m)) + phaseGap + milestoneWidth(currentCard)/2;
        startOfFirstFutureCard = d3.sum([...pastCards, currentCard], m => milestoneWidth(m)) /* +margin*/ + 2 * phaseGap + labelMarginHoz;
        
        datePhasesData = [
            { label:"Past", x:endOfLastPastCard, textAnchor:"end" },
            { label: "Current", x:middleOfCurrentCard, textAnchor:"middle" },
            { label: "Future", x:startOfFirstFutureCard, textAnchor:"start" }
        ]
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

    let slidePosition = 0;
    let slideBack;
    let slideForward;
    let currentXOffset = 0;

    let datePhasesData;

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
        selection.each(function (data) {
            updateDimns(data);
            console.log("milestones bar update", data);
            containerG = d3.select(this);
            //why not empty>??
            if(containerG.select("g").empty()){
                init();
            }

            update();
            function init(){
                contentsG = containerG.append("g").attr("class", "milestone-bar-contents");
                contentsG.append("rect")
                    .attr("class", "milestones-bar-bg")
                    .attr("fill", "blue");

                milestonesWrapperG = contentsG.append("g").attr("class", "milestones-wrapper")
                    .attr("transform", `translate(0,0)`);

                phaseLabelsG = milestonesWrapperG.append("g").attr("class", "phase-labels")
                milestonesG = milestonesWrapperG.append("g").attr("class", "milestones")

                phaseLabelsG.append("rect")
                    .attr("class", "phase-labels-bg")
                    .attr("fill", "black")
                    .attr("stroke", "black");
                milestonesG.append("rect")
                    .attr("class", "milestones-bg")
                    .attr("fill", "none")
                    .attr("stroke", "pink");

                contractsG = milestonesG.append("g").attr("class", "contracts");
                profilesG = milestonesG.append("g").attr("class", "profiles");
            }

            function update(){
                contentsG.attr("transform", `translate(${margin.left},${margin.top})`);
                const xOffset = -d3.sum(data.filter(m => m.nr < slidePosition), m => milestoneWidth(m));

                if(xOffset !== currentXOffset){
                    console.log("setting milestones translate")
                    milestonesWrapperG
                        .transition()
                            .duration(500)
                            .attr("transform", `translate(${xOffset},0)`);

                    currentXOffset = xOffset;
                }else{
                    milestonesWrapperG
                        .attr("transform", `translate(${xOffset},0)`);
                }

                contentsG.select("rect.milestones-bar-bg")
                    .attr("width", contentsWidth)
                    .attr("height", contentsHeight)

                milestonesG.attr("transform", `translate(0,${phaseLabelsHeight})`);
                    
                
                phaseLabelsG.select("rect.phase-labels-bg")
                    .attr("width", contentsWidth)
                    .attr("height", phaseLabelsHeight)
                milestonesG.select("rect.milestones-bg")
                    .attr("width", contentsWidth)
                    .attr("height", milestonesHeight)
                
            
                //phase labels
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
                
                //SCALES
                //normally, xScale domain is a date but here the children pass through i aswell
                const x = (nr) => {
                    const milestone = data[nr];
                    const { datePhase } = milestone;
                    const previousMilestonesData = data.filter((m,i) => i < nr);
                    
                    const extraGaps = datePhase === "future" ? phaseGap * 2 : (datePhase === "current" ? phaseGap : 0)
                    return d3.sum(previousMilestonesData, d => milestoneWidth(d)) + milestoneWidth(milestone)/2 + extraGaps;
                }

                //y is just the middle of the bar for all
                const y = () => milestonesHeight/2;

                //call profileCsrds abd contarcts comps, passing in a yscale that centres each one
                contractsG
                    .datum(data.filter(m => m.dataType === "contract"))
                    .call(contracts
                        .width(contractDimns.width)
                        .height(contractDimns.height)
                        .margin(contractDimns.margin)
                        .fontSizes(fontSizes.contract)
                        .xScale(x, "nr")
                        .yScale(y), { log:true });

                profilesG
                    .datum(data.filter(m => m.dataType === "profile"))
                    .call(profiles
                        .width(profileCardDimns.width)
                        .height(profileCardDimns.height)
                        .margin(profileCardDimns.margin)
                        .fontSizes(fontSizes.profile)
                        .kpiHeight(50)
                        .editable(true)
                        .xScale(x, "nr")
                        .yScale(y)
                        .onClickKpi(onSelectKpiSet)
                        .onDblClickKpi((e,d) => {
                            console.log("dbl click kpi", d)
                            onSelectKpiSet(d);
                        }), { log:true });

                //functions
                slideBack = function(){
                    if(slidePosition > 0){
                        slidePosition -= 1;
                        update();
                    }
                }

                slideForward = function(){
                    if(slidePosition < data.length - 1){
                        slidePosition += 1;
                        update();
                    }
                }

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
    milestonesBar.contractDimns = function (value) {
        if (!arguments.length) { return width; }
        contractDimns = value;
        //helper
        milestoneWidth = m => m.dataType === "profile" ? profileCardDimns.width: contractDimns.width;
        return milestonesBar;
    };
    milestonesBar.profileCardDimns = function (value) {
        if (!arguments.length) { return width; }
        profileCardDimns = value;
        //helper
        milestoneWidth = m => m.dataType === "profile" ? profileCardDimns.width: contractDimns.width;
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
    milestonesBar.milestoneWidth = function (value) {
        if (!arguments.length) { return milestoneWidth; }
        milestoneWidth = value;
        return milestonesBar;
    };
    milestonesBar.milestoneHeight = function (value) {
        if (!arguments.length) { return milestoneHeight; }
        milestoneHeight = value;
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

    milestonesBar.slideBack = function(){ slideBack() };
    milestonesBar.slideForward = function(){ slideForward() };
    return milestonesBar;
}
