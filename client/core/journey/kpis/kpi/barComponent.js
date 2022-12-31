import * as d3 from 'd3';
import { DIMNS, grey10 } from "../../constants";
import dragEnhancements from '../../enhancedDragHandler';
import container from './container';
import background from './background';
import handle from "./handle";
import remove from "./remove";
import numbersComponent from './numbersComponent';

/*

*/
export default function barComponent() {
    //API SETTINGS
    let parentSelector = "";
    let parent = function(){ return d3.select(this); };
    // dimensions
    let DEFAULT_WIDTH = 100;
    let DEFAULT_HEIGHT = 30;
    let DEFAULT_MARGIN = { left: 0, right:0, top: 0, bottom: 0 };
    let contentsWidth;
    let contentsHeight;
    let _width = () => DEFAULT_WIDTH;
    let _height = () => DEFAULT_HEIGHT;
    let _margin = () => DEFAULT_MARGIN;

    let _barWidth = () => 10;
    let _barHeight = () => 10;

    let handleHeightFactor = 0.333;

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
            console.log("updateDimns d", d)
            const width = _width(d,i)
            const height = _height(d,i);
            const margin = _margin(d,i);
            const contentsWidth = width - margin.left - margin.right;
            const contentsHeight = height - margin.top - margin.bottom;
            //bar and handles
            const withHandles = contentsHeight > 5 && !!barData.find(d => d.handle);
            const withTopHandles = withHandles && !!barData.find(d => ["above", "over"].includes(d.handle.pos));
            const withBottomHandles = withHandles && !!barData.find(d => ["below", "over"].includes(d.handle.pos));

            const handleHeight = contentsHeight * handleHeightFactor;
            const handleWidth = handleHeight * 0.6;

            const spaceForHandles = (withTopHandles ? handleHeight : 0) + (withBottomHandles ? handleHeight : 0);

            //group numbers into 1, 2 or 3 cols
            const nrNumbers = numbersData.length
            let nrNumberCols = nrNumbers;
            if(nrNumbers > 3){
                nrNumberCols = nrNumberCols % 3 === 0 ? 3 :(nrNumbers % 2 === 0 ? 2 : 1)
            }
            const barWidth = contentsWidth * (0.8 - (nrNumberCols * 0.1));
            const barHeight = contentsHeight - spaceForHandles;

            //numbers
            const numbersWidth = contentsWidth - barWidth;
            //need to numbers to be centred on the bar, even if only top handles
            const numbersHeight = contentsHeight;
            const numbersMargin = { 
                left: numbersWidth * 0.1, right: numbersWidth * 0.1, 
                top: numbersHeight * 0.1, bottom:numbersHeight * 0.1
            };

            dimns.push({
                width, height, margin, contentsWidth, contentsHeight,
                barWidth, barHeight,
                numbersWidth, numbersHeight, numbersMargin,
                withHandles, withTopHandles, withBottomHandles, handleWidth, handleHeight,
            })

            //scales
            if(!scales[i]){
                scales[i] = d3.scaleLinear()
            }

            const extent = [barData.start, barData.end]
            scales[i]
                .domain(extent)
                .range([0, barWidth])
            
            //error mesg
            if(typeof barData.start !== "number" || typeof barData.end !== "number"){
                errorMesgs[i] = NO_MIN_MAX_ERROR_MESG;
            }else if(!barData.find(d => d.key === "current").to){
                //to undefined means no data
                errorMesgs[i] = NO_DATA_ERROR_MESG;
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
    const numbers = numbersComponent();

    function bar(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log} = options;

        const allData = selection.data();
        console.log("Bar data", allData)

        updateDimns(selection.data());
        // expression elements
        selection
            .call(container("bar-contents")
                .transform((d,i) => {
                    const { margin, withTopHandles, handleHeight } = dimns[i];
                    return `translate(${margin.left},${margin.top + (withTopHandles ? handleHeight : 0)})`
                }));
        
        selection.select("g.bar-contents")
            .call(container("main-bar"))
            .call(container("numbers")
                .transform((d,i) => {
                    const { barWidth, withTopHandles, withBottomHandles, handleHeight } = dimns[i];
                    //shift numbers up for handles, and by half if there are only top or bot handles
                    let extraYShift = 0;
                    if(withTopHandles && withBottomHandles){
                        extraYShift = -handleHeight
                    }else if(withTopHandles){
                        extraYShift = -handleHeight/2
                    }else if(withBottomHandles){
                        extraYShift = +handleHeight/2
                    }
                    return `translate(${barWidth},${extraYShift})`
                }))

        //main-bar
        selection.select("g.main-bar")
            .call(background()
                .width((d,i) => dimns[i].barWidth)
                .height((d,i) => dimns[i].barHeight)
                .styles((d, i) => ({
                    stroke:"grey",
                    strokeWidth:0.3
                })))
            .each(function(data,i){
                const { barData } = data;
                console.log("i data", i, barData)
                const { withHandles, handleHeight, handleWidth,contentsWidth, barWidth, barHeight } = dimns[i];
                const scale = scales[i];
                const styles = _styles(data,i);

                const barContentsG = d3.select(this);

                //sections
                const barSectionG = barContentsG.selectAll("g.bar-section").data(barData, d => d.key);
                barSectionG.enter()
                    .append("g")
                        .attr("class", "bar-section")
                            .each(function(d,i){
                                //append rect
                                d3.select(this)
                                    .append("rect")
                                        .attr("class", "bar-section")
                                        .attr("pointer-events", "none");
                            })
                            .merge(barSectionG)
                            .attr("transform", (d,i) => `translate(${scales[i](d.from)}, 0)`)
                            .each(function(d,i){
                                console.log("d",i, d)
                                console.log("domain", scale.domain())
                                const sectionWidth = scale(d.to) - scale(d.from);
                                //adjust rect width to end - start
                                d3.select(this).select("rect.bar-section")
                                    .attr("width", sectionWidth)
                                    .attr("height", barHeight)
                                    .attr("fill", d.fill);

                                //start in the middle if the handle is over the bar
                                /*
                                const { pos } = d.handle;
                                const handleStartY = pos === "below" ? barHeight : (pos === "over" ? barHeight/2 : 0);
                                const handleDimns = {
                                    width:handleWidth,
                                    //if its over, then it goes above and below the bar by half the handleHeight 
                                    height:pos === "over" ? handleHeight + barHeight : handleHeight
                                }

                                //adjust handleG to be at the end of the section, and above or below
                                const handleG = d3.select(this).selectAll("g.handle").data(withHandles ? [d.handle] : []);
                                handleG.enter()
                                    .append("g")
                                        .attr("class", "handle")
                                        .call(handle.enter)
                                        .merge(handleG)
                                        .attr("transform", `translate(${sectionWidth},${handleStartY})`)
                                        .style("cursor", editable ? "pointer" : "default")
                                        .call(handle.update, handleDimns)

                                handleG.exit().call(remove)
                                */
                                

                            })

                barSectionG.exit().call(remove);

                 //error mesg
                const errorMesgData = errorMesgs[i] ? [errorMesgs[i]] : [];
                console.log("errorMesgData", errorMesgData)
                /*const errorMesgText = */barContentsG.selectAll("text.error-mesg").data(errorMesgData)
                    .join("text")
                        .attr("class", "error-mesg")
                        .attr("text-anchor", "middle")
                        .attr("dominant-baseline", "central")
                        .attr("pointer-events", "none")
                        .attr("x", barWidth/2)
                        .attr("y", barHeight/2)
                        .attr("font-size", barHeight * 0.7)
                        .text(d => d);

            })
        //numbers
        selection.select("g.numbers")
            .data(selection.data().map(d => d.numbersData))
            .call(numbers
                .width((d,i) => dimns[i].numbersWidth)
                .height((d,i) => dimns[i].numbersHeight)
                .margin((d,i) => dimns[i].numbersMargin));

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
    bar.handleHeightFactor = function (value) {
        if (!arguments.length) { return _handleHeightFactor; }
        handleHeightFactor = value;
        return bar;
    };
    bar.margin = function (func) {
        if (!arguments.length) { return _margin; }
        _margin = (d,i) => ({ ...DEFAULT_MARGIN, ...func(d,i) })
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
