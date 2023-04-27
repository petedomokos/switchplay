import * as d3 from 'd3';
import { DIMNS, grey10, TRANSITIONS } from "../../constants";
import dragEnhancements from '../../enhancedDragHandler';
import { pcCompletion } from "../../../../util/NumberHelpers"
import { Oscillator, fadeIn, remove } from '../../domHelpers';
import { getTransformationFromTrans } from '../../helpers';
import titleComponent from './titleComponent';
import progressBarComponent from './progressBarComponent';
import listComponent from './listComponent';
import container from './container';
import background from './background';
import { styles } from '@material-ui/pickers/views/Calendar/Calendar';

const CONTENT_FADE_DURATION = TRANSITIONS.KPI.FADE.DURATION;
const AUTO_SCROLL_DURATION = TRANSITIONS.KPIS.AUTO_SCROLL.DURATION;

const MAX_PROGRESS_BAR_HEIGHT = 100;
/*

*/
export default function kpiComponent() {
    //API SETTINGS
    // dimensions
    //general
    let DEFAULT_WIDTH = DIMNS.profile.width;
    let DEFAULT_HEIGHT = DIMNS.profile.height;
    let DEFAULT_MARGIN = { left: 0, right:0, top: 0, bottom: 0 };
    let DEFAULT_TITLE_DIMNS = { width: 0, height:0, margin:{ left:0, right:0, top:0, bottom:0 }, fontSize:9 }

    let _width = () => DEFAULT_WIDTH;
    let _height = () => DEFAULT_HEIGHT;
    let _margin = () => DEFAULT_MARGIN;
    let _titleDimns = () => DEFAULT_TITLE_DIMNS;

    let dimns = {};
    //components
    let closedProgressBars = {};
    let openProgressBars = {};

    //per datum
    function updateDimns(data){
        dimns = {};
        return data.forEach((d,i) => {
            const width = _width(d,i)
            const height = _height(d,i);
            const margin = _margin(d,i);
            const contentsWidth = width - margin.left - margin.right;
            const contentsHeight = height - margin.top - margin.bottom;

            const titleDimns = _titleDimns(d,i);

            const progressBarWidth = contentsWidth;

            /*
            I have added a max value for progBarheight. This is best way to deal with numbers not wantitng to be too
            large. but need to work thru the consequences to ensure things are still centred within kpi.

            the other factor is the margins of teh bar 
            */
            //this needs to change so it stays at top when open
            const progressBarHeight = d3.min([MAX_PROGRESS_BAR_HEIGHT, contentsHeight - titleDimns.height]);

            const kpiInfoWidth = contentsWidth;

            const historyWidth = 110;
            const historyHeight = 15;
            const kpiInfoHeight = contentsHeight - titleDimns.height - progressBarHeight - historyHeight;
            const progressBarMargin = { 
                //@todo - decide if we need a margin when closed
                left:status(d) === "open" ? 0 : progressBarWidth * 0, 
                right: 0, 
                top: 0, 
                bottom: 0 
            };
            //console.log("kpiH kpiCH titleH pbh", height, contentsHeight, titleDimns.height, progressBarHeight)
            dimns[d.key] = {
                width, height, margin, contentsWidth, contentsHeight,
                titleDimns,
                progressBarWidth, progressBarHeight, progressBarMargin,
                kpiInfoWidth, kpiInfoHeight,
                historyWidth, historyHeight
            }
        })
    }

    function updateComponents(data){
        data.forEach(d => {
            if(!closedProgressBars[d.key]){
                closedProgressBars[d.key] = progressBarComponent()
                    .status("closed")
                    .editable(false)
                    .onSetEditing(onSetEditing)
                
                openProgressBars[d.key]  = progressBarComponent()
                    .status("open")
                    .editable(true)
                    .onSetEditing(onSetEditing)
            }
        })
    }

    const DEFAULT_STYLES = {};
    let _styles = () => DEFAULT_STYLES;

    let _name = d => d.name;
    let isEditable = () => false;
    let status = () => "closed";
    let profileIsSelected = false;
    let displayFormat = "both";

    let getNrEndTooltips = (status, displayFormat) => 0;
    let getNrNumbers = (status, displayFormat) => 0;

    //API CALLBACKS
    let onClick = function(){};

    let onCreateStep = function(){};
    let onEditStep = function(){};
    let onUpdateStep = function(){};
    let onUpdateSteps = function(){};
    let onDeleteStep = function(){};

    let onDblClick = function(){};
    let onDragStart = function(){};
    let onDrag = function() {};
    let onDragEnd = function() {};
    let onLongpressStart = function(){};
    let onLongpressDragged = function(){};
    let onLongpressEnd = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};
    let onDelete = function(){};
    let onSaveValue = function(){};
    let onSetEditing = function(){};

    /*
    const enhancedDrag = dragEnhancements()
        .onClick((e,d) => {
            console.log("clicked", d)
            onClick.call(this, e, d, { progressBarHeight }); 
        }) //todo - why do i have to write it out like this?
        //.onClick(onClick) not working
        .onDblClick(onDblClick)
        .onLongpressStart(function(e, d){
            console.log("lp...........")
        });
    */

    //const contents = containerComponent();
    //const background = backgroundComponent();
    const title = titleComponent();
    const stepsList = listComponent();
    //const openProgressBar = progressBarComponent()
        //.editable(() => true);
   //const closedProgressBar = progressBarComponent()
        //.editable(() => false);

    function kpi(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log } = options;
        updateDimns(selection.data());
        updateComponents(selection.data());

        /*const drag = d3.drag()
            .on("start", enhancedDrag())
            .on("drag", enhancedDrag())
            .on("end", enhancedDrag());*/

        // expression elements
        selection
            .call(container()
                .className("kpi-contents")
                .transform((d, i) => `translate(${dimns[d.key].margin.left},${dimns[d.key].margin.top})`)
            )
        const kpiContentsG = selection.select("g.kpi-contents");
        kpiContentsG
            .call(background()
                .width((d,i) => dimns[d.key].contentsWidth)
                .height((d,i) => dimns[d.key].contentsHeight)
                .styles((d, i) => ({
                    stroke:"none",
                    //need to trabnsition bg, but may aswell just be transparent
                    fill:/*_styles(d).bg.fill ||*/ "transparent"
                })))
            .call(container().className("name"))
            //.call(container().className("non-selected-progress-bar")
                //.transform((d, i) => `translate(0,${dimns[d.key].titleHeight})`))
            .on("click", onClick)
            //.call(drag)

        //console.log("marginTop titleMarginTop titleHeight", dimns[2].margin.top, dimns[2].titleMargin.top, dimns[2].titleHeight)
        kpiContentsG.select("g.name")
            .call(title
                .width((d,i) => dimns[d.key].titleDimns.width)
                .height((d,i) => dimns[d.key].titleDimns.height)
                .margin((d,i) => dimns[d.key].titleDimns.margin)
                .styles((d,i) => ({
                    primaryTitle:{ 
                        fontSize:dimns[d.key].titleDimns.fontSize,
                        strokeWidth:0.1,
                        ..._styles(d,i).name,
                        dominantBaseline:"central",
                        fontFamily:"helvetica, sans-serifa",
                        fill:grey10(4)
                    },
                    secondaryTitle:{

                    }
                }))
                .primaryTitle(d => {
                    if(d.name){ return `${d.nr}. ${d.name}`; }
                    return d.statName !== "Score" ? `${d.nr}. ${d.datasetName} (${d.statName})` : `${d.nr}. ${d.datasetName}`
                })
                //@todo - make statName a sec title, and measure length of primaryTitle
                //.secondaryTitle(d => d.statName)
                .textDirection("horiz")
                .fontSizeTransition({ delay:CONTENT_FADE_DURATION, duration: AUTO_SCROLL_DURATION}))

    
        //open and closed contents
        kpiContentsG.each(function(data,i){
            const { contentsHeight, titleDimns, progressBarWidth, progressBarHeight, progressBarMargin, 
                kpiInfoWidth, kpiInfoHeight, historyWidth, historyHeight } = dimns[data.key];

            const styles = _styles(data,i);

            const closedData = status(data) === "closed" ? [data] : [];
            const openData = status(data) === "open" ? [data] : [];
            //components
            const kpiContentsG = d3.select(this);
            const closedContentsG = kpiContentsG.selectAll("g.closed-kpi-contents").data(closedData, d => d.key);
            closedContentsG.enter()
                .append("g")
                    .attr("class", "closed-kpi-contents")
                    .call(fadeIn)
                    .merge(closedContentsG)
                    //closedkpi doesnt show info so that space is just turned into an extra margin
                    .attr("transform", `translate(10,${titleDimns.height})`)
                    .each(function(d){
                        d3.select(this)
                            .call(closedProgressBars[d.key]
                                    .width(() => progressBarWidth)
                                    .height(() => progressBarHeight)
                                    .margin(() => progressBarMargin)
                                    .displayFormat(displayFormat)
                                    .nrEndTooltips(getNrEndTooltips("closed", displayFormat))
                                    .nrNumbers(getNrNumbers("closed", displayFormat))
                                , { transitionEnter, transitionUpdate} )
                    })

            closedContentsG.exit().call(remove)
                
            const openContentsG = kpiContentsG.selectAll("g.open-kpi-contents").data(openData, d => d.key);
            openContentsG.enter()
                .append("g")
                    .attr("class", "open-kpi-contents")
                    .call(fadeIn)
                    .merge(openContentsG)
                    .attr("transform", `translate(0,${titleDimns.height})`)
                    .each(function(d, j){
                        d3.select(this)
                            .call(openProgressBars[d.key]
                                .width((d) => progressBarWidth)
                                .height((d) => progressBarHeight)
                                .margin((d) => progressBarMargin)
                                .styles(d => ({ bg:{ fill: _styles(d).bg.fill } }))
                                .displayFormat(displayFormat)
                                .nrEndTooltips(getNrEndTooltips("open", displayFormat))
                                .nrNumbers(getNrNumbers("open", displayFormat))
                                .onSaveValue(onSaveValue))

                        const kpiStepsG = d3.select(this).selectAll("g.kpi-steps").data([d.steps]);
                        kpiStepsG.enter()
                            .append("g")
                                .attr("class", "kpi-steps")
                                .merge(kpiStepsG)
                                .attr("transform", `translate(0, ${progressBarHeight})`)
                                .call(stepsList
                                    .width(kpiInfoWidth)
                                    .height(kpiInfoHeight)
                                    .margin({ left:0, right: 0, top:kpiInfoHeight * 0.1, bottom:kpiInfoHeight * 0.1 })
                                    .styles((d,i) => ({ item:styles.step }))
                                    //.orderEditable(d.milestoneId !== "current")
                                    .orderEditable(d.milestoneId === "profile-2")
                                    .noItemsMesg("No Steps Yet")
                                    .newItemDatum(d.milestoneId === "current" ? null : { desc:"Add Step" })
                                    .onCreateItem(() => {
                                        onCreateStep(d.milestoneId, d.key)
                                    })
                                    //.onUpdateItem(onUpdateStep)
                                    //@todo - edit
                                    .onEditItem(function(d, dimns){
                                        const { translateY } = getTransformationFromTrans(d3.select(this).attr("transform"));
                                        const _dimns = {
                                            widths:dimns.widths,
                                            margins:dimns.margins,
                                            heights:{
                                                ...dimns.heights,
                                                title:titleDimns.height,
                                                progressBar:progressBarHeight,
                                                stepsAbove:translateY,
                                            }
                                        }

                                        onEditStep(d, _dimns)
                                    })
                                    .onUpdateItem(step => {
                                        if(d.milestoneId === "current"){
                                            //pass through the milestone that the step was actually created in
                                            onUpdateStep(step.milestoneId, d.key, step)
                                        }else{
                                            onUpdateStep(d.milestoneId, d.key, step)
                                        }
                                    })
                                    .onUpdateItems(steps => {
                                        if(d.milestoneId === "current"){
                                            //pass through the milestone that the step was actually created in
                                            onUpdateSteps(step.milestoneId, d.key, steps)
                                        }else{
                                            onUpdateSteps(d.milestoneId, d.key, steps)
                                        }
                                    })
                                    .onDeleteItem(step => {
                                        if(d.milestoneId === "current"){
                                            //pass through the milestone that the step was actually created in
                                            onDeleteStep(step.milestoneId, d.key, step.id)
                                        }else{
                                            onDeleteStep(d.milestoneId, d.key, step.id)
                                        }
                                    }))
                        
                        kpiStepsG.exit().call(remove);
                                 
                    })

            openContentsG.exit().call(remove, { transition:{ duration: CONTENT_FADE_DURATION }});

            //history
            const historyData = status(data) === "open" && data.lastDataUpdate ? [data] : [];
            const historyG = kpiContentsG.selectAll("g.history").data(historyData, d => d.key);
            historyG.enter()
                .append("g")
                    .attr("class", "history")
                    .call(fadeIn)
                    .each(function(){
                        d3.select(this).append("rect");
                        const mainRowG = d3.select(this).append("g").attr("class", "main-row")
                        mainRowG.append("text").attr("class", "label")
                        mainRowG.append("text").attr("class", "date")
                        mainRowG.selectAll("text")
                            .attr("dominant-baseline", "central")
                            .attr("stroke-width", 0.1)
                            .attr("stroke", grey10(2))
                            .attr("opacity", 0.5)
                    })
                    .merge(historyG)
                    .attr("transform", `translate(${0}, ${contentsHeight - historyHeight})`)
                    .each(function(d){
                        d3.select(this).select("rect")
                            .attr("width", historyWidth)
                            .attr("height", historyHeight)
                            .attr("fill", "none")

                        const mainRowG = d3.select(this).select("g.main-row")
                            .attr("transform", `translate(0, ${historyHeight/2})`)
                        
                        mainRowG.select("text.label")
                            .attr("font-size", 9)
                            .text("Last data:")

                        mainRowG.select("text.date")
                            .attr("x", 37.5)
                            .attr("font-size", 9)
                            .text(d3.timeFormat("%_d %b, %y")(d.lastDataUpdate))
                    })
            
            historyG.exit().call(remove, { transition:{ duration: CONTENT_FADE_DURATION }});
        })
        
        /*kpiContents.select("g.numbers")
            .data(selection.data().map(d => d.numbersData))
            .call(numbers
                .width((d,i) => dimns[d.key].numbersWidth)
                .height((d,i) => dimns[d.key].numbersHeight)
                .margin((d,i) => dimns[d.key].numbersMargin)
            )*/
            //.call(drag)


        return selection;
    }
    
    //api
    kpi.width = function (value) {
        if (!arguments.length) { return _width; }
        _width = value;
        return kpi;
    };
    kpi.height = function (value) {
        if (!arguments.length) { return _height; }
        _height = value;
        return kpi;
    };
    kpi.margin = function (func) {
        if (!arguments.length) { return _margin; }
        _margin = (d,i) => ({ ...DEFAULT_MARGIN, ...func(d,i) })
        return kpi;
    };
    kpi.titleDimns = function (func) {
        if (!arguments.length) { return _titleDimns; }
        _titleDimns = (d,i) => ({ ...DEFAULT_TITLE_DIMNS, ...func(d,i) });
        return kpi;
    };
    kpi.status = function (value) {
        if (!arguments.length) { return status; }
        status = value;
        return kpi;
    };
    kpi.profileIsSelected = function (value) {
        if (!arguments.length) { return profileIsSelected; }
        profileIsSelected = value;
        return kpi;
    };
    kpi.displayFormat = function (value) {
        if (!arguments.length) { return displayFormat; }
        displayFormat = value;
        return kpi;
    };
    kpi.editing = function (value) {
        //get the openKpi progressBar component and get/set ediitng value from uit
        //if (!arguments.length) { return data.forEach(); }
        Object.values(closedProgressBars).forEach(progressBar => { progressBar.editing(value) })
        Object.values(openProgressBars).forEach(progressBar => { progressBar.editing(value) })
        return kpi;
    };
    kpi.fontSizes = function (values) {
        if (!arguments.length) { return fontSizes; }
        fontSizes = { ...fontSizes, ...values };
        return kpi;
    };
    kpi.styles = function (func) {
        if (!arguments.length) { return _styles; }
        _styles = (d,i) => ({ ...DEFAULT_STYLES, ...func(d,i) });
        return kpi;
    };
    kpi.isEditable = function (value) {
        if (!arguments.length) { return isEditable; }
        if(typeof value === "function"){
            isEditable = value;
        }else{
            isEditable = () => value;
        }
        return kpi;
    };
    kpi._name = function (value) {
        if (!arguments.length) { return _name; }
        if(typeof value === "function"){
            _name = value;
        }
        return kpi;
    };
    kpi.getNrNumbers = function (f) {
        if (!arguments.length) { return getNrNumbers; }
        if(typeof f === "function"){
            getNrNumbers = f;
        }
        return kpi;
    };
    kpi.getNrEndTooltips = function (f) {
        if (!arguments.length) { return getNrEndTooltips; }
        if(typeof f === "function"){
            getNrEndTooltips = f;
        }
        return kpi;
    };
    kpi.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return kpi;
    };
    kpi.onCreateStep = function (value) {
        if (!arguments.length) { return onCreateStep; }
        onCreateStep = value;
        return kpi;
    };
    kpi.onEditStep = function (value) {
        if (!arguments.length) { return onEditStep; }
        onEditStep = value;
        return kpi;
    };
    kpi.onUpdateStep = function (value) {
        if (!arguments.length) { return onUpdateStep; }
        onUpdateStep = value;
        return kpi;
    };
    kpi.onUpdateSteps = function (value) {
        if (!arguments.length) { return onUpdateSteps; }
        onUpdateSteps = value;
        return kpi;
    };
    kpi.onDeleteStep = function (value) {
        if (!arguments.length) { return onDeleteStep; }
        onDeleteStep = value;
        return kpi;
    };
    kpi.onDblClick = function (value) {
        if (!arguments.length) { return onDblClick; }
        onDblClick = value;
        return kpi;
    };
    kpi.onDragStart = function (value) {
        if (!arguments.length) { return onDragStart; }
        if(typeof value === "function"){
            onDragStart = value;
        }
        return kpi;
    };
    kpi.onDrag = function (value) {
        if (!arguments.length) { return onDrag; }
        if(typeof value === "function"){
            onDrag = value;
        }
        return kpi;
    };
    kpi.onDragEnd = function (value) {
        if (!arguments.length) { return onDragEnd; }
        if(typeof value === "function"){
            onDragEnd = value;
        }
        return kpi;
    };
    kpi.onLongpressStart = function (value) {
        if (!arguments.length) { return onLongpressStart; }
        if(typeof value === "function"){
            onLongpressStart = value;
        }
        return kpi;
    };
    kpi.onLongpressDragged = function (value) {
        if (!arguments.length) { return onLongpressDragged; }
        if(typeof value === "function"){
            onLongpressDragged = value;
        }
        return kpi;
    };
    kpi.onLongpressEnd = function (value) {
        if (!arguments.length) { return onLongpressEnd; }
        if(typeof value === "function"){
            onLongpressEnd = value;
        }
        return kpi;
    };
    kpi.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return kpi;
    };
    kpi.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return kpi;
    };
    kpi.onDelete = function (value) {
        if (!arguments.length) { return onDelete; }
        if(typeof value === "function"){
            onDelete = value;
        }
        return kpi;
    };
    kpi.onSaveValue = function (value) {
        if(typeof value === "function"){
            onSaveValue = value;
        }
        return kpi;
    };
    kpi.onSetEditing = function (value) {
        if (!arguments.length) { return onSetEditing; }
        if(typeof value === "function"){
            onSetEditing = value;
        }
        return kpi;
    };
    return kpi;
}
