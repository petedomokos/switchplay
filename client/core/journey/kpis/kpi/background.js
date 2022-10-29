import * as d3 from 'd3';
import { DIMNS, grey10 } from "../../constants";
import dragEnhancements from '../../enhancedDragHandler';

/*

*/
export default function background() {
    //API SETTINGS
    let key = "";
    let parentSelector = "";
    let parent = function(){ return d3.select(this); };
    // dimensions
    let DEFAULT_WIDTH = 0;
    let DEFAULT_HEIGHT = 0;
    let _width = () => DEFAULT_WIDTH;
    let _height = () => DEFAULT_HEIGHT;

    const defaultStyles = {
        stroke:null,
        fill:null,
    };
    let _styles = () => defaultStyles;

    //API CALLBACKS
    /*
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
    */

    function _background(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log} = options;

        // expression elements
        selection.each(function (data, i) {
            const parentG = parent.call(this, parent);

            const styles = _styles(data, i);
            const width = _width(data, i);
            const height = _height(data, i);

            /*
            const drag = d3.drag()
                .on("start", enhancedDrag())
                .on("drag", enhancedDrag())
                .on("end", enhancedDrag());
                */

            // expression elements
            parentG.selectAll(`rect.${key}-bg`).data([1])
                .join("rect")
                    .attr("class", `bg ${key}-bg`)
                    .attr("width", width)
                    .attr("height", height)
                    .attr("fill", styles.fill)
                    .attr("stroke", styles.stroke);
                    //.call(drag)
        })

        return selection;
    }
    
    //api
    _background.key = function (value) {
        if (!arguments.length) { return key; }
        key = value;
        return _background;
    };
    _background.parent = function (value) {
        if (!arguments.length) { return parent; }
        if(typeof value === "string"){
            parentSelector = value;
            parent = function(){ return d3.select(this).select(parentSelector); }
        }else {
            parent = value;
        }
        return _background;
    };
    _background.width = function (value) {
        if (!arguments.length) { return _width; }
        _width = value;
        return _background;
    };
    _background.height = function (value) {
        if (!arguments.length) { return _height; }
        _height = value;
        return _background;
    };
    _background.styles = function (func) {
        if (!arguments.length) { return _styles; }
        _styles = (d,i) => {
            return { ...defaultStyles, ...func(d,i) };
        };
        return _background;
    };
/*
    contents.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return contents;
    };
    contents.onDblClick = function (value) {
        if (!arguments.length) { return onDblClick; }
        onDblClick = value;
        return contents;
    };
    contents.onDragStart = function (value) {
        if (!arguments.length) { return onDragStart; }
        if(typeof value === "function"){
            onDragStart = value;
        }
        return contents;
    };
    contents.onDrag = function (value) {
        if (!arguments.length) { return onDrag; }
        if(typeof value === "function"){
            onDrag = value;
        }
        return contents;
    };
    contents.onDragEnd = function (value) {
        if (!arguments.length) { return onDragEnd; }
        if(typeof value === "function"){
            onDragEnd = value;
        }
        return contents;
    };
    contents.onLongpressStart = function (value) {
        if (!arguments.length) { return onLongpressStart; }
        if(typeof value === "function"){
            onLongpressStart = value;
        }
        return contents;
    };
    contents.onLongpressDragged = function (value) {
        if (!arguments.length) { return onLongpressDragged; }
        if(typeof value === "function"){
            onLongpressDragged = value;
        }
        return contents;
    };
    contents.onLongpressEnd = function (value) {
        if (!arguments.length) { return onLongpressEnd; }
        if(typeof value === "function"){
            onLongpressEnd = value;
        }
        return contents;
    };
    contents.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return contents;
    };
    contents.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return contents;
    };
    contents.onDelete = function (value) {
        if (!arguments.length) { return onDelete; }
        if(typeof value === "function"){
            onDelete = value;
        }
        return contents;
    };
    */
    return _background;
}
