import * as d3 from 'd3';
import { DIMNS, grey10 } from "../../constants";
import dragEnhancements from '../../enhancedDragHandler';

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


    function getDimns(d, i, data){
        const width = _width(d,i);
        const height = _height(d,i);
        const margin = _margin(d,i);
        const contentsWidth = width - margin.left - margin.right;
        const contentsHeight = height - margin.top - margin.bottom;

        return {
            width, height, margin, contentsWidth, contentsHeight,
        }
    }

    const defaultStyles = {
    };
    let _styles = () => defaultStyles;
    let _transform = () => null;
    let _className = (d, i) => `bar-${d.key || i}`;


    //API CALLBACKS
    let onClick = function(){};
    let onDblClick = function(){};
    let onLongpressStart = function(){};
    let onLongpressEnd = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};

    const enhancedDrag = dragEnhancements();;

    function bar(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log} = options;

        // expression elements
        selection.each(function(d, i){
            console.log("Bar i", i, d)

            const barG = d3.select(this).selectAll("g.bar").data([1]);
            barG.enter()
                .append("g")
                    .attr("class", "bar " + _className(d, i))
                    .merge(barG)
                    .attr("transform", _transform(d,i))
                    .each(function(){
                        const barSectionG = d3.select(this).selectAll("g.bar-section").data(d.barData, (b,i) => b.key || i);
                        barSectionG.enter()
                            .append("g")
                                .attr("class", "bar-section")
                                .each(function(){
                                    d3.select(this).append("rect");
                                })
                                .merge(barSectionG)
                                .attr("transform", (b,i) => `translate(${i * 10},0)`)
                                .each(function(){
                                    d3.select(this).select("rect")
                                        .attr("width", 5)
                                        .attr("height", 5)
                                        .attr("fill", "yellow");
                                })
                        
                    })

                    //console.log("bar parent", parentG.node())
                    /*
                    const { key } = data;

                    const styles = _styles(data, i);
                    const { margin, contentsWidth, contentsHeight }= getDimns(data, i);

                    enhancedDrag
                        .onClick(onBarClick)
                        .onDblClick(onBarDblClick);
                        
                    const drag = d3.drag()
                        .on("start", enhancedDrag())
                        .on("drag", enhancedDrag())
                        .on("end", enhancedDrag());
                    */

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
