import * as d3 from 'd3';
import { COLOURS, DIMNS, grey10, TRANSITIONS } from "../../constants";
import dragEnhancements from '../../enhancedDragHandler';
import container from './container';
import background from './background';
import remove from "./remove";
import { fadeIn } from "../../domHelpers";
import { boundValue, isNumber } from '../../../../data/dataHelpers';

const MED_SLIDE_DURATION = TRANSITIONS.DEFAULT_DURATIONS.SLIDE.MED;

/*

*/
export default function barComponent() {
    //API SETTINGS
    let parentSelector = "";
    let parent = function(){ return d3.select(this); };
    // dimensions
    let DEFAULT_WIDTH = 100;
    let DEFAULT_HEIGHT = 30;
    let DEFAULT_MARGIN = { left:0, right:0, top:0, bottom:0 }
    let _width = () => DEFAULT_WIDTH;
    let _height = () => DEFAULT_HEIGHT;
    let _margin = () => DEFAULT_MARGIN;

    let _scale;

    let dimns = [];

    let scales = {};
    let fixedDomain = [0,100]
    let _domain;

    const NO_MIN_MAX_ERROR_MESG = "no start or end";
    const NO_DATA_ERROR_MESG = "no data";
    const NO_TARGET_ERROR_MESG = "no target";
    let errorMesgs = {};

    function updateDimns(data, options ={}){
        dimns = []
        return data.forEach((d,i) => {
            const { barData } = d;
            const { sectionsData } = barData;
            console.log("d", d)
            const shouldDisplayBar = displayFormat === "stats" || displayFormat === "both";
            const shouldDisplaySteps = d.milestoneId !== "current" && (displayFormat === "steps" || displayFormat === "both");

            //temp -  this repeats here and later down!
            //also, for now, current card just flattens allSteps, and is not draggable
            //@todo - keep them nested, and allow dragging between profiles
            let stepsData;
            if(barData.stepsData[0] && Array.isArray(barData.stepsData[0])){
                stepsData = barData.stepsData.reduce((a, b) => [...a, ...b], []);
            }else{
                stepsData = barData.stepsData || [];
            }

            const width = _width(d,i)
            const height = _height(d,i);
            const margin = _margin(d,i);
            const contentsWidth = width - margin.left - margin.right;
            const contentsHeight = height - margin.top - margin.bottom;

            const barHeight = shouldDisplaySteps ? contentsHeight * 0.75 : contentsHeight;
            const stepHeight = contentsHeight;

            const stepWidth = stepsData.length === 0 ? 0 : contentsWidth/stepsData.length;

            dimns.push({
                width, height, margin, contentsWidth, contentsHeight, barHeight, stepWidth, stepHeight
            })

            //scales - can either be passed in via _scale or is determined here
            if(_scale){
                //update the latest passed-in scale
                scales[i] = _scale(d,i)
            }else{
                //scales determined here
                //init
                /*
                if(!scales[i]){ scales[i] = d3.scaleLinear(); }
                //update
                const extent = [barData.start, barData.end]
                scales[i]
                    .domain(extent)
                    .range([0, contentsWidth])*/
            }
            const scale = scales[i];
            
            //error mesg
            if(!isNumber(sectionsData.find(d => d.key === "current").endValue)){
                //to undefined means no data
                errorMesgs[i] = NO_DATA_ERROR_MESG;
            }else if(!isNumber(scale.domain()[0]) || !isNumber(scale.domain()[1])){
                errorMesgs[i] = NO_MIN_MAX_ERROR_MESG;
            }else{
                errorMesgs[i] = "";
            }
        })
    }

    const defaultStyles = {
    };
    let _styles = () => defaultStyles;
    let _transform = () => null;
    let _className = (d, i) => `bar-${d.key || i}`;

    let editable = false;
    let displayFormat = "both";
    //API CALLBACKS
    let onClick = function(){};
    let onDblClick = function(){};
    let onLongpressStart = function(){};
    let onLongpressEnd = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};

    //extensions and components
    const enhancedDrag = dragEnhancements();

    function bar(selection, options={}) {
        const { transitionEnter=false, transitionUpdate=false, log} = options;
        const shouldDisplayBar = displayFormat === "stats" || displayFormat === "both";
        const shouldDisplaySteps = displayFormat === "steps" || displayFormat === "both";

        updateDimns(selection.data());
        // expression elements
        selection
            .call(container("bar-contents")
                .transform((d,i) => `translate(${dimns[i].margin.left},${dimns[i].margin.top})`));

        //main-bar
        selection.select("g.bar-contents")
            .call(background()
                .width((d,i) => dimns[i].contentsWidth)
                .height((d,i) => dimns[i].contentsHeight)
                .styles((d, i) => ({
                    stroke:"grey",
                    strokeWidth:0.1,
                    fill:"transparent"
                })), { transitionEnter, transitionUpdate} 
            )
            .each(function(data,i){
                const { barData } = data;
                const { sectionsData } = barData;
                const { contentsWidth, contentsHeight, barHeight, stepWidth, stepHeight } = dimns[i];
                const scale = scales[i];
                const styles = _styles(data,i);

                //temp - for now, current card just flattens allSteps, and is not draggable
                //@todo - keep them nested, and allow dragging between profiles
                let stepsData;
                if(barData.stepsData[0] && Array.isArray(barData.stepsData[0])){
                    stepsData = barData.stepsData.reduce((a, b) => [...a, ...b], []);
                }else{
                    stepsData = barData.stepsData || [];
                }
                //helper
                const bound = boundValue(scale.domain());

                const barContentsG = d3.select(this);

                //steps
                const stepsG = barContentsG.selectAll("g.steps").data(shouldDisplaySteps ? [1] : []);
                stepsG.enter()
                    .append("g")
                        .attr("class", "steps")
                        .call(fadeIn)
                            .each(function(d,j){
                            })
                            .merge(stepsG)
                            .attr("display", displayFormat !== "stats" ? null : "none")
                            .each(function(d,j){
                                const stepG = d3.select(this).selectAll("g.step").data(stepsData);
                                stepG.enter()
                                    .append("g")
                                        .attr("class", "step")
                                        .each(function(d){
                                            d3.select(this).append("rect").attr("class", "step-bg")
                                                .attr("rx", 3)
                                                .attr("ry", 3)
                                                .attr("stroke-width", 0.2)
                                        })
                                        .merge(stepG)
                                        .attr("transform", (d,i) => `translate(${i * stepWidth})`)
                                        .each(function(d){
                                            d3.select(this).select("rect.step-bg")
                                                .attr("width", stepWidth)
                                                .attr("height", stepHeight)
                                                .attr("fill", d.completed ? COLOURS.step.bar : "transparent")
                                                .attr("stroke", "white")
                                        })

                                stepG.exit().call(remove);
                            
                            })

                stepsG.exit().call(remove);


                //sections
                const barSectionG = barContentsG.selectAll("g.bar-section").data(sectionsData, d => d.key);
                barSectionG.enter()
                    .append("g")
                        .attr("class", "bar-section")
                        .call(fadeIn)
                            .each(function(d,j){
                                const sectionWidth = scale(bound(d.endValue)) - scale.range()[0];
                                //append rect
                                d3.select(this)
                                    .append("rect")
                                        .attr("class", "bar-section")
                                        .attr("pointer-events", "none")
                                        .attr("width", sectionWidth || 0)
                                        .attr("height", barHeight)
                                        .attr("fill", d.fill);;
                            })
                            .merge(barSectionG)
                            .attr("display", displayFormat !== "steps" ? null : "none")
                            .each(function(d,j){
                                const sectionWidth = scale(bound(d.endValue)) - scale.range()[0];
                                //adjust rect width to end - start
                                if(transitionUpdate){
                                    d3.select(this).select("rect.bar-section")
                                        .transition()
                                        .duration(MED_SLIDE_DURATION)
                                            .attr("width", sectionWidth || 0)
                                            .attr("height", barHeight)
                                            .attr("fill", d.fill);
                                }else{
                                    d3.select(this).select("rect.bar-section")
                                        .attr("width", sectionWidth || 0)
                                        .attr("height", barHeight)
                                        .attr("fill", d.fill);
                                }
                            })

                barSectionG.exit().call(remove);

                //error mesg
                const errorMesgData = errorMesgs[i] ? [errorMesgs[i]] : [];
                barContentsG.selectAll("text.error-mesg").data(errorMesgData)
                    .join("text")
                        .attr("class", "error-mesg")
                        .attr("display", displayFormat !== "steps" ? null : "none")
                        .attr("text-anchor", "middle")
                        .attr("dominant-baseline", "central")
                        .attr("pointer-events", "none")
                        .attr("x", contentsWidth/2)
                        .attr("y", contentsHeight/2)
                        .attr("font-size", contentsHeight * 0.7)
                        .attr("stroke", "grey")
                        .attr("stroke-width", 0.1)
                        .attr("fill", grey10(3))
                        .text(d => d);

            })

        return selection;
    }
    
    //api
    bar.parent = function (value) {
        if (!arguments.length) { return parent; }
        if(typeof value === "string"){
            parentSelector = value;
            parent = function(){ return d3.select(this).select(parentSelector); }
        }else {
            parent = value;
        }
        return bar;
    };
    bar.className = function (value) {
        if (!arguments.length) { return _className; }
        if(typeof value === "string"){
            _className = () => value;
        }else{
            _className = value;
        }
        return bar;
    };
    bar.width = function (value) {
        if (!arguments.length) { return _width; }
        _width = value;
        return bar;
    };
    bar.height = function (value) {
        if (!arguments.length) { return _height; }
        _height = value;
        return bar;
    };
    bar.margin = function (func) {
        if (!arguments.length) { return _margin; }
        _margin = (d,i) => ({ ...DEFAULT_MARGIN, ...func(d,i) })
        return bar;
    };
    bar.scale = function (value) {
        if (!arguments.length) { return _scale; }
        _scale = value;
        return bar;
    };
    bar.handleHeightFactor = function (value) {
        if (!arguments.length) { return _handleHeightFactor; }
        handleHeightFactor = value;
        return bar;
    };
    bar.transform = function (value) {
        if (!arguments.length) { return _transform; }
        if(typeof value === "function"){
            _transform = value;
        }
        return bar;
    };
    bar.styles = function (func) {
        if (!arguments.length) { return _styles; }
        _styles = (d,i) => {
            const requiredStyles = func(d,i);
            return {
                name:{ ...defaultStyles.name, ...requiredStyles.name },
                //others here
            }
        };
        return bar;
    };
    bar.domain = function (value) {
        if (!arguments.length) { return fixedDomain || _domain; }
        if(typeof value === "function"){
            _domain = value;
            fixedDomain = null;
        }else{
            fixedDomain = value;
        }
        return bar;
    };
    bar.editable = function (value) {
        if (!arguments.length) { return editable; }
        editable = value;
        return bar;
    };
    bar.displayFormat = function (value) {
        if (!arguments.length) { return displayFormat; }
        displayFormat = value;
        return bar;
    };
    bar._name = function (value) {
        if (!arguments.length) { return _name; }
        if(typeof value === "function"){
            _name = value;
        }
        return bar;
    };
    bar.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return bar;
    };
    bar.onDblClick = function (value) {
        if (!arguments.length) { return onDblClick; }
        onDblClick = value;
        return bar;
    };
    bar.onLongpressStart = function (value) {
        if (!arguments.length) { return onLongpressStart; }
        if(typeof value === "function"){
            onLongpressStart = value;
        }
        return bar;
    };
    bar.onLongpressEnd = function (value) {
        if (!arguments.length) { return onLongpressEnd; }
        if(typeof value === "function"){
            onLongpressEnd = value;
        }
        return bar;
    };
    bar.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return bar;
    };
    bar.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return bar;
    };
    return bar;
}
