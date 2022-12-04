import * as d3 from 'd3';
import { DIMNS, grey10 } from "../../constants";
import dragEnhancements from '../../enhancedDragHandler';
import tooltipsComponent from '../../tooltipsComponent';
import barComponent from './barComponent';
import container from './container';
import background from './background';

/*

*/
export default function numberComponent() {
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

    let dimns = [];

    /*
    function _dimns(d, i, data){
        const width = _width(d,i)
        const height = _height(d,i);
        const margin = _margin(d,i);
        const contentsWidth = width - margin.left - margin.right;
        const contentsHeight = height - margin.top - margin.bottom;
        return {
            width, height, margin, contentsWidth, contentsHeight,
        }
    }
    */

    //per datum
    function updateDimns(data){
        dimns = [];
        return data.forEach((d,i) => {
            const width = _width(d,i)
            const height = _height(d,i);
            const margin = _margin(d,i);
            const contentsWidth = width - margin.left - margin.right;
            const contentsHeight = height - margin.top - margin.bottom;
 
            dimns.push({
                width, height, margin, contentsWidth, contentsHeight
            })
        })
    }

    const DEFAULT_STYLES = {
        fontSize:10,
        fill:"grey",
        stroke:"grey",
        strokeWidth:0.2,
        bg:{
            fill:"none",
            stroke:"none"
        }
    };
    let _styles = () => DEFAULT_STYLES;

    let _transform = () => null;


    //API CALLBACKS
    let onClick = function(){};
    let onDblClick = function(){};
    let onLongpressStart = function(){};
    let onLongpressEnd = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};

    const enhancedDrag = dragEnhancements();

    function number(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log} = options;
        updateDimns(selection.data());

        selection
            .call(container()
                .className("number-contents")
                .transform((d,i) => `translate(${_margin(d,i).left},${_margin(d,i).top})`)
                .enter(function(d,i){
                    const styles = _styles(d,i);
                    d3.select(this)
                        .append("rect")

                    d3.select(this)
                        .append("text")
                            .attr("text-anchor", "middle")
                            .attr("dominant-baseline", "central")
                })
                .update(function(d,i){
                    const { contentsWidth, contentsHeight } = dimns[i];
                    const styles = _styles(d,i);

                    d3.select(this).select("rect")
                        .attr("width", contentsWidth)
                        .attr("height", contentsHeight)
                        .attr("fill", "red")// styles.bg.fill)
                        .attr("stroke", styles.bg.stroke)

                    d3.select(this).select("text")
                        .attr("x", contentsWidth/2)
                        .attr("y", contentsHeight/2)
                        .attr("font-size", styles.fontSize)
                        .attr("fill", styles.fill)
                        .attr("stroke", styles.stroke)
                        .attr("stroke-width", 0.1)// styles.strokeWidth)
                        .text(d.value)

                }))

        /*
        const numberG = numberContentsG.selectAll("g.number").data(d.numberData, n => n.key);
        numberG.enter()
            .append("g")
                .attr("class", n => `number number-${n.key}`)
                .each(function(){
                    d3.select(this)
                        .append("rect")
                        .attr("stroke", "none")
                        .attr("fill", "none")

                    d3.select(this)
                        .append("text")
                            .attr("text-anchor", "middle")
                            .attr("dominant-baseline", "central")
                })
                .merge(numberG)
                .attr("transform", (n,i) => `translate(${i * numberWidth},0)`)
                .each(function(n){
                    d3.select(this).select("rect")
                        .attr("width", numberWidth)
                        .attr("height", numberHeight)


                    d3.select(this).select("text")
                        .attr("x", numberWidth/2)
                        .attr("y", numberHeight/2)
                        .attr("font-size", numberFontSize)
                        .attr("stroke-width", 0.3)
                        .attr("fill", n => n.colour)
                        .attr("stroke", n => n.colour)
                        .text(n.value)

                })
        numberG.exit().each(function(d){
            //will be multiple exits because of the delay in removing
            if(!d3.select(this).attr("class").includes("exiting")){
                d3.select(this)
                    .classed("exiting", true)
                    .transition()
                        .duration(200)
                        .attr("opacity", 0)
                        .on("end", function() { d3.select(this).remove(); });
            }
        })
        */

        return selection;
    }
    
    //api
    number.parent = function (value) {
        if (!arguments.length) { return parent; }
        if(typeof value === "string"){
            parentSelector = value;
            parent = function(){ return d3.select(this).select(parentSelector); }
        }else {
            parent = value;
        }
        return number;
    };
    number.width = function (value) {
        if (!arguments.length) { return _width; }
        if(typeof value === "number"){
            _width = () => value;
        }else {
            _width = value;
        }
        return number;
    };
    number.height = function (value) {
        if (!arguments.length) { return _height; }
        if(typeof value === "number"){
            _height = () => value;
        }else {
            _height = value;
        }
        return number;
    };
    number.margin = function (value) {
        if (!arguments.length) { return _margin; }
        if(typeof value === "function"){
            _margin = (d,i) => ({ ...DEFAULT_MARGIN, ...value(d,i) })
        }else {
            _margin = (d,i) => ({ ...DEFAULT_MARGIN, ...value })
        }
        return number;
    };
    number.transform = function (value) {
        if (!arguments.length) { return _transform; }
        if(typeof value === "function"){
            _transform = value;
        }
        return number;
    };
    number.styles = function (value) {
        if (!arguments.length) { return _styles; }
        if(typeof value === "function"){
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value(d,i) });
        }else{
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value });
        }
        
        return number;
    };
    number.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return number;
    };
    number.onDblClick = function (value) {
        if (!arguments.length) { return onDblClick; }
        onDblClick = value;
        return number;
    };
    number.onLongpressStart = function (value) {
        if (!arguments.length) { return onLongpressStart; }
        if(typeof value === "function"){
            onLongpressStart = value;
        }
        return number;
    };
    number.onLongpressEnd = function (value) {
        if (!arguments.length) { return onLongpressEnd; }
        if(typeof value === "function"){
            onLongpressEnd = value;
        }
        return number;
    };
    number.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return number;
    };
    number.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return number;
    };
    return number;
}
