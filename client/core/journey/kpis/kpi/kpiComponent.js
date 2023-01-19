import * as d3 from 'd3';
import { DIMNS, grey10, TRANSITIONS } from "../../constants";
import dragEnhancements from '../../enhancedDragHandler';
import { pcCompletion } from "../../../../util/NumberHelpers"
import { Oscillator, fadeIn, remove } from '../../domHelpers';
import { getTransformationFromTrans } from '../../helpers';
import titleComponent from './titleComponent';
import progressBarComponent from './progressBarComponent';
import container from './container';
import background from './background';

const CONTENT_FADE_DURATION = TRANSITIONS.KPI.FADE.DURATION;
const AUTO_SCROLL_DURATION = TRANSITIONS.KPIS.AUTO_SCROLL.DURATION;


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

    let dimns = [];
    //components
    let closedProgressBars = {};
    let openProgressBars = {};

    //per datum
    function updateDimns(data){
        dimns = [];
        return data.forEach((d,i) => {
            const width = _width(d,i)
            const height = _height(d,i);
            const margin = _margin(d,i);
            const contentsWidth = width - margin.left - margin.right;
            const contentsHeight = height - margin.top - margin.bottom;

            const titleDimns = _titleDimns(d,i);
            //progressBar is bar, handles and tooltips
            const progressBarWidth = contentsWidth;
            const progressBarHeight = contentsHeight - titleDimns.height;
            //todo - need to calc ALL kpi dimns together at start of kpisComponent
            //so it can be passed down and accessed anywhere. for now we just manuall estimate
            //teh margin needed on left to keep the tooltips in screen even when at the very end of bar
            //const horizMarginSpaceForTooltips =
            //@todo - only need left margin if expected is near bottom, or doesnt exist
            const progressBarMargin = {
                //base left margin on height, as that is what affects tooltips width
                 //right has numbers anyway so no extra margin needed for tooltips as they are above numbers
                left:progressBarHeight * 0.25, right:0,
                top: progressBarHeight * 0.1, bottom: progressBarHeight * 0.1 
            };

            dimns.push({
                width, height, margin, contentsWidth, contentsHeight,
                titleDimns,
                progressBarWidth, progressBarHeight, progressBarMargin
            })
        })
    }

    const DEFAULT_STYLES = {};
    let _styles = () => DEFAULT_STYLES;

    let _name = d => d.name;
    let isEditable = () => false;
    let withTooltips = () => false;
    let status = () => "closed";

    //API CALLBACKS
    let onClick = function(){};
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

    const enhancedDrag = dragEnhancements()
        .onClick((e,d) => { 
            onClick.call(this, e, d); 
        }) //todo - why do i have to write it out like this?
        //.onClick(onClick) not working
        .onDblClick(onDblClick);

    //const contents = containerComponent();
    //const background = backgroundComponent();
    const title = titleComponent();
    //const openProgressBar = progressBarComponent()
        //.editable(() => true);
   //const closedProgressBar = progressBarComponent()
        //.editable(() => false);

    function kpi(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log } = options;
        updateDimns(selection.data());

        const drag = d3.drag()
            .on("start", enhancedDrag())
            .on("drag", enhancedDrag())
            .on("end", enhancedDrag());

        // expression elements
        selection
            .call(container()
                .className("kpi-contents")
                .transform((d, i) => `translate(${dimns[i].margin.left},${dimns[i].margin.top})`)
            )
        const kpiContentsG = selection.select("g.kpi-contents");
        kpiContentsG
            .call(background()
                .width((d,i) => dimns[i].contentsWidth)
                .height((d,i) => dimns[i].contentsHeight)
                .styles((d, i) => ({
                    stroke:"blue",
                    fill:/*_styles(d).bg.fill || */"transparent"
                })))
            .call(container().className("name"))
            //.call(container().className("non-selected-progress-bar")
                //.transform((d, i) => `translate(0,${dimns[i].titleHeight})`))
            .on("click", onClick)
            //.call(drag)

        //console.log("marginTop titleMarginTop titleHeight", dimns[2].margin.top, dimns[2].titleMargin.top, dimns[2].titleHeight)
        kpiContentsG.select("g.name")
            .call(title
                .width((d,i) => dimns[i].titleDimns.width)
                .height((d,i) => dimns[i].titleDimns.height)
                .margin((d,i) => dimns[i].titleDimns.margin)
                .styles((d,i) => ({
                    primaryTitle:{ 
                        fontSize:dimns[i].titleDimns.fontSize,
                        strokeWidth:0.2,
                        ..._styles(d,i).name,
                        dominantBaseline:"central",
                    },
                    secondaryTitle:{

                    }
                }))
                .primaryTitle(d => `${d.datasetName} (${d.statName})`)
                //@todo - make statName a sec title, and measure length of primaryTitle
                //.secondaryTitle(d => d.statName)
                .textDirection("horiz")
                .fontSizeTransition({ delay:CONTENT_FADE_DURATION, duration: AUTO_SCROLL_DURATION}))
    
        kpiContentsG.each(function(data,i){
            const closedData = status(data) === "closed" ? [data] : [];
            const openData = status(data) === "open" ? [data] : [];
            //components
            //const closedProgressBar = closedProgressBarComponents[data.key];
            //const openProgressBar = openProgressBarComponents[data.key];
            //if(i == 2)
            //console.log("kpiContents i,d, stat, progH ", i, d.key, status(d), dimns[i].progressBarHeight)
            const kpiContentsG = d3.select(this);
            const closedContentsG = kpiContentsG.selectAll("g.closed-kpi-contents").data(closedData, d => d.key);
            closedContentsG.enter()
                .append("g")
                    .attr("class", "closed-kpi-contents")
                    .call(fadeIn)
                    .each(d => {
                        closedProgressBars[d.key] = progressBarComponent()
                            .editable(() => false);
                    })
                    .merge(closedContentsG)
                    .attr("transform", `translate(0,${dimns[i].titleDimns.height})`)
                    .each(function(d){
                        d3.select(this)
                            .call(closedProgressBars[d.key]
                                    .width(() => dimns[i].progressBarWidth)
                                    .height(() => dimns[i].progressBarHeight)
                                    .margin(() => dimns[i].progressBarMargin)
                                , { transitionEnter, transitionUpdate} )

                    })

            closedContentsG.exit().call(remove, { transition:{ duration: CONTENT_FADE_DURATION }})
                
            const openContentsG = kpiContentsG.selectAll("g.open-kpi-contents").data(openData, d => d.key);
            openContentsG.enter()
                .append("g")
                    .attr("class", "open-kpi-contents")
                    .call(fadeIn)
                    .each(d => {
                        openProgressBars[d.key] = progressBarComponent()
                            .editable(() => true);
                        d3.select(this)//todo - fade in
                            .append("text")
                    })
                    .merge(openContentsG)
                    .attr("transform", `translate(0,${dimns[i].titleDimns.height})`)
                    .each(function(d, j){
                        d3.select(this)//todo - fade in
                            .select("text")
                            .attr("x", 50)
                            .attr("y", 50)
                            .text("open content")

                        d3.select(this)
                            .call(openProgressBars[d.key]
                                .width((d) => dimns[i].progressBarWidth)
                                .height((d) => dimns[i].progressBarHeight)
                                .margin((d) => dimns[i].progressBarMargin))
                    })

            openContentsG.exit().call(remove, { transition:{ duration: CONTENT_FADE_DURATION }});

        })
        
        /*kpiContents.select("g.numbers")
            .data(selection.data().map(d => d.numbersData))
            .call(numbers
                .width((d,i) => dimns[i].numbersWidth)
                .height((d,i) => dimns[i].numbersHeight)
                .margin((d,i) => dimns[i].numbersMargin)
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
    kpi.withTooltips = function (value) {
        if (!arguments.length) { return withTooltips; }
        withTooltips = value;
        return kpi;
    };
    kpi.status = function (value) {
        if (!arguments.length) { return status; }
        status = value;
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
    kpi.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
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
    return kpi;
}
