import * as d3 from 'd3';
import { DIMNS, grey10 } from "../../constants";
import dragEnhancements from '../../enhancedDragHandler';
import { pcCompletion } from "../../../../util/NumberHelpers"
import { Oscillator } from '../../domHelpers';
import { getTransformationFromTrans } from '../../helpers';
import tooltipsComponent from '../../tooltipsComponent';
import titleComponent from './titleComponent';
//import progressBarComponent from './progressBarComponent';
//import numbersComponent from './numbersComponent';
import container from './container';
import background from './background';

/*

*/
export default function kpiComponent() {
    //API SETTINGS
    // dimensions
    let width = DIMNS.profile.width;
    let height = DIMNS.profile.height;
    let expandedHeight = height * 3;
    let margin = { left: 0, right:0, top: 0, bottom: 0 };
    let contentsWidth;
    let contentsHeight;
    let expandedContentsHeight;

    let nameCharWidth;
    let titleWidth;
    let titleHeight;
    let titleMargin;

    let barWrapperWidth;
    let barWrapperHeight;
    let expandedBarWrapperHeight;
    let barWrapperMargin;
    let barWrapperContentsWidth;
    let barWrapperContentsHeight;

    let barAndHandlesHeight;

    let barWidth;
    let barHeight;
    let barMargin;
    let barContentsWidth;
    let barContentsHeight;

    let numbersWrapperWidth;
    let numbersWrapperHeight;
    let numbersMargin;
    let numbersContentsWidth;
    let numbersContentsHeight;

    let handleWidth;
    let handleHeight;
    let topHandleHeight;
    let bottomHandleHeight;

    let totalTooltipsHeight;
    let tooltipWidth;
    let tooltipHeight;

    //this function overrides the general dimns within a specific selection
    function getExpandedDimns(d, handlesAreAbove, handlesAreBelow){
        const contentsHeight = expandedContentsHeight;
        const barWrapperHeight = expandedBarWrapperHeight;

        //must know tooltips situation before we know barAndHandleHeight
        const nrTooltipRowsAbove = d3.max(d.tooltipsData.filter(t => t.location === "above"), d => d.row + 1);
        const tooltipsAboveHeight = nrTooltipRowsAbove * tooltipHeight;

        const barWrapperContentsHeight = barWrapperHeight - barWrapperMargin.top - barWrapperMargin.bottom;
        const barAndHandlesHeight = barWrapperContentsHeight;
        //this is same on both
        const handleHeight = barAndHandlesHeight * 0.25;
        const topHandleHeight = handlesAreAbove ? handleHeight : 0;
        const bottomHandleHeight = handlesAreBelow ? handleHeight : 0;
        //normal bar height only needs to reduce to include handles, not tooltips
        barHeight = barAndHandlesHeight - topHandleHeight - bottomHandleHeight;
        

        const barHeight = barWrapperHeight - totalTooltipHeight - (handlesAreAbove ? handleHeight : 0) - (handlesAreBelow ? handleHeight : 0);
        const barContentsHeight = barHeight - barMargin.top - barMargin.bottom; 

        return { 
            contentsHeight, 
            barWrapperHeight, 
            handleHeight, 
            barHeight, 
            barContentsHeight,
            tooltipsAboveHeight,
        }
    }

    function getNormalDimns(d){
        return { 
            contentsHeight, 
            barWrapperHeight, 
            handleHeight, 
            barHeight, 
            barContentsHeight,
            tooltipsAboveHeight:0,
        }
    }
    function updateDimns(nrOfNumberValues, handlesAreAbove, handlesAreBelow, nrTooltipRows){
        contentsHeight = height - margin.top - margin.bottom;
        titleHeight = d3.min([contentsHeight * 0.5, 10]);
        //name margin is same for normal and expanded
        titleMargin = { left: 0, right: 0, top: titleHeight * 0.1, bottom: titleHeight * 0.1 };


        //NOTE - CALL THIS PROGRESSBAR NOW, AND TEH BAR IS PART OF THAT, BUT SO ARE TOOLTIPS AND HANDLES
        barWrapperHeight = contentsHeight - titleHeight;

        //need to do some expanded dimns because all selections need to know tooltipsDimns as margin will depend on them
        expandedContentsHeight = expandedHeight - margin.top - margin.bottom;
        expandedBarWrapperHeight = expandedContentsHeight - titleHeight;

        totalTooltipsHeight = expandedBarWrapperHeight * 0.75;
        tooltipHeight = totalTooltipsHeight / nrTooltipRows;
        tooltipWidth = tooltipHeight * 0.9;
        const defaultHorizMargin = width * 0.1;
        const horizMargin = d3.max([tooltipWidth/2, defaultHorizMargin]);

        barWrapperMargin = { left: horizMargin, right: horizMargin, top:height * 0.1, bottom: height * 0.05 };

        barWrapperContentsHeight = barWrapperHeight - barWrapperMargin.top - barWrapperMargin.bottom;

        barAndHandlesHeight = barWrapperContentsHeight;
        handleHeight = barAndHandlesHeight * 0.25;
        topHandleHeight = handlesAreAbove ? handleHeight : 0;
        bottomHandleHeight = handlesAreBelow ? handleHeight : 0;
        //normal bar height only needs to reduce to include handles, not tooltips
        barHeight = barAndHandlesHeight - topHandleHeight - bottomHandleHeight;

        contentsWidth = width - margin.left - margin.right;
        const numbersWrapperProportionalWidth = nrOfNumberValues === 2 ? 0.4 : (nrOfNumberValues === 1 ? 0.3 : 0);
        numbersWrapperWidth = contentsWidth * numbersWrapperProportionalWidth;
        barWrapperWidth = contentsWidth - numbersWrapperWidth;
        titleWidth = barWrapperWidth * 0.5;
        barWidth = barWrapperWidth;
        handleWidth = handleHeight * 0.6;
        nameCharWidth = barWidth * 0.04; //todo - use pseudo element
    
        //numbers are same for normal and expanded
        numbersWrapperHeight = contentsHeight - titleHeight;
        numbersMargin = { left:numbersWrapperWidth * 0.1, right:numbersWrapperWidth * 0.1, top:numbersWrapperHeight * 0.1, bottom: numbersWrapperHeight * 0.1 };
        numbersContentsWidth = numbersWrapperWidth - numbersMargin.left - numbersMargin.right;
        numbersContentsHeight = numbersWrapperHeight - numbersMargin.top - numbersMargin.bottom;

        //bar contents will be overriden for expanded
        barMargin = { left: 0, right: 0, top: 0, bottom: 0 };
        barContentsWidth = barWidth - barMargin.left - barMargin.right;
        barContentsHeight = barHeight - barMargin.top - barMargin.bottom; 

        //fonts
        fontSizes.name = titleHeight;
    }

    let fontSizes = {
    };

    const defaultStyles = {};
    let getStyles = () => defaultStyles;

    let getName = d => d.name;
    let isEditable = () => false;
    let isExpanded = () => false;


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

    const enhancedDrag = dragEnhancements();
    const enhancedHandleDrag = dragEnhancements();
    const tooltips = tooltipsComponent();

    //const contents = containerComponent();
    //const background = backgroundComponent();
    const title = titleComponent();
    //const progressBar = progressBarComponent();
    //const numbers = numbersComponent();

    let scales = {};

    //dom

    function kpi(selection, options={}) {
        //console.log("kpi update...........", height)
        const { transitionEnter=true, transitionUpdate=true, log} = options;
        updateDimns();

        const drag = d3.drag()
            .on("start", enhancedDrag())
            .on("drag", enhancedDrag())
            .on("end", enhancedDrag());

        // expression elements
        selection
            .call(container().className("kpi-contents").margin(margin))
            //could apply other contentshere too eg 
            .call(container().parent("g.kpi-contents").className("progress-bar-contents").margin(margin))
            .call(container().parent("g.kpi-contents").className("numbers-contents").margin(margin))
            .call(background()
                .parent("g.kpi-contents")
                .width(contentsWidth)
                .height(contentsHeight)
                .styles((d, i) => ({
                    fill:i % 2 === 0 ? "blue" : "aqua"
                }))
            )
            .call(title
                .parent("g.kpi-contents")
                .width(titleWidth)
                .height(titleHeight)
                .margin(titleMargin)
                .styles(() => ({
                    name:{ 
                        fontSize:titleHeight * 0.8,
                        strokeWidth:0.2,
                        dominantBaseline:"central",
                    }
                })))
            /*.call(progressBar
                .transform(() => `translate(0,${titleHeight})`)
            )
            .call(numbers
                .transform(() => `translate(${barWrapperWidth},0)`) //numbersY should be centred on bar
            )*/
            .call(drag)


        return selection;
    }
    
    //api
    kpi.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return kpi;
    };
    kpi.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return kpi;
    };
    kpi.expandedHeight = function (value) {
        if (!arguments.length) { return expandedHeight; }
        expandedHeight = value;
        return kpi;
    };
    kpi.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = { ...margin, ...value };
        return kpi;
    };
    kpi.isExpanded = function (value) {
        if (!arguments.length) { return isExpanded; }
        isExpanded = value;
        return kpi;
    };
    kpi.fontSizes = function (values) {
        if (!arguments.length) { return fontSizes; }
        fontSizes = { ...fontSizes, ...values };
        return kpi;
    };
    kpi.getStyles = function (func) {
        if (!arguments.length) { return getStyles; }
        getStyles = (d,i) => ({ ...defaultStyles, ...func(d,i) });
        return kpi;
    };
    kpi.isEditable = function (value) {
        if (!arguments.length) { return isEditable; }
        isEditable = value;
        return kpi;
    };
    kpi.getName = function (value) {
        if (!arguments.length) { return getName; }
        if(typeof value === "function"){
            getName = value;
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
