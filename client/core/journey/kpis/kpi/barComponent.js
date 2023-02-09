import * as d3 from 'd3';
import { DIMNS, grey10 } from "../../constants";
import dragEnhancements from '../../enhancedDragHandler';
import container from './container';
import background from './background';
import remove from "./remove";

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

    const NO_MIN_MAX_ERROR_MESG = "no min/max";
    const NO_DATA_ERROR_MESG = "no data";
    const NO_TARGET_ERROR_MESG = "no target";
    let errorMesgs = {};

    function updateDimns(data, options ={}){
        dimns = []
        return data.forEach((d,i) => {
            const { barData, numbersData } = d;
            const width = _width(d,i)
            const height = _height(d,i);
            const margin = _margin(d,i);
            const contentsWidth = width - margin.left - margin.right;
            const contentsHeight = height - margin.top - margin.bottom;

            dimns.push({
                width, height, margin, contentsWidth, contentsHeight,
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
            
            //error mesg
            if(!barData.find(d => d.key === "current").value){
                //to undefined means no data
                errorMesgs[i] = NO_DATA_ERROR_MESG;
            }else if(typeof barData.start !== "number" || typeof barData.end !== "number"){
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

        const allData = selection.data();

        updateDimns(selection.data());
        // expression elements
        selection
            .call(background()
                .width((d,i) => dimns[i].width)
                .height((d,i) => dimns[i].eight)
                .styles((d, i) => ({
                    stroke:"grey",
                    strokeWidth:0.3,
                    fill:"red"
                })), { transitionEnter, transitionUpdate} 
            )
            .call(container("bar-contents")
                .transform((d,i) => `translate(${dimns[i].margin.left},${dimns[i].margin.top})`));

        //main-bar
        selection.select("g.bar-contents")
            .call(background()
                .width((d,i) => dimns[i].contentsWidth)
                .height((d,i) => dimns[i].contentsHeight)
                .styles((d, i) => ({
                    stroke:"grey",
                    strokeWidth:0.3,
                    fill:"transparent"
                })), { transitionEnter, transitionUpdate} 
            )
            .each(function(data,i){
                const { barData } = data;
                const { contentsWidth, contentsHeight } = dimns[i];
                const scale = scales[i];
                const styles = _styles(data,i);
                //console.log("bardata-------------------------------", data.key, data)
                //console.log("contentsw ch scale", contentsWidth, contentsHeight, scale)

                const barContentsG = d3.select(this);

                //sections
                const barSectionG = barContentsG.selectAll("g.bar-section").data(barData, d => d.key);
                barSectionG.enter()
                    .append("g")
                        .attr("class", "bar-section")
                            .each(function(d,j){
                                //console.log("key scale",d.key, scale.domain(), scale.range())
                                //error - scale(d.value) is neg
                                //console.log("value...", d.value, scale(d.value))
                                //console.log("start value...", d.startValue, scale(d.startValue))
                                const sectionWidth = scale(d.value) - scale(d.startValue) || 0;
                                //console.log("setting sectw!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! to sectw", sectionWidth)
                                //append rect
                                d3.select(this)
                                    .append("rect")
                                        .attr("class", "bar-section")
                                        .attr("pointer-events", "none")
                                        .attr("width", sectionWidth)
                                        .attr("height", contentsHeight)
                                        .attr("fill", d.fill);;
                            })
                            .merge(barSectionG)
                            .attr("transform", (d,j) => `translate(${scale(d.startValue) || 0}, 0)`)
                            .each(function(d,j){
                                //console.log("update bar i j editable",data, d, i, j, editable(data,i))
                                const sectionWidth = scale(d.value) - scale(d.startValue) || 0;
                                //adjust rect width to end - start
                                if(transitionUpdate){
                                    d3.select(this).select("rect.bar-section")
                                        .transition()
                                        .duration(400)
                                            .attr("width", sectionWidth)
                                            .attr("height", contentsHeight)
                                            .attr("fill", d.fill);
                                }else{
                                    d3.select(this).select("rect.bar-section")
                                        .attr("width", sectionWidth)
                                        .attr("height", contentsHeight)
                                        .attr("fill", d.fill);
                                }
                            })

                barSectionG.exit().call(remove);

                 //error mesg
                const errorMesgData = errorMesgs[i] ? [errorMesgs[i]] : [];
                barContentsG.selectAll("text.error-mesg").data(errorMesgData)
                    .join("text")
                        .attr("class", "error-mesg")
                        .attr("text-anchor", "middle")
                        .attr("dominant-baseline", "central")
                        .attr("pointer-events", "none")
                        .attr("x", contentsWidth/2)
                        .attr("y", contentsHeight/2)
                        .attr("font-size", contentsHeight * 0.7)
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
