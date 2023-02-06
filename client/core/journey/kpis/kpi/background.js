import * as d3 from 'd3';
import { DIMNS, grey10 } from "../../constants";
import dragEnhancements from '../../enhancedDragHandler';

/*

*/
export default function background(initKey) {
    //API SETTINGS
    let key = initKey || "";
    let parentSelector = "";
    let parent = function(){ return d3.select(this); };
    
    let sharedClassName = key ? `bg ${key}-bg` : "bg";
    let _className;
    // dimensions
    let DEFAULT_WIDTH = 0;
    let DEFAULT_HEIGHT = 0;
    let fixedWidth;
    let fixedHeight;
    let _width = () => DEFAULT_WIDTH;
    let _height =() => DEFAULT_HEIGHT;

    const defaultStyles = {
        stroke:"none",
        strokeWidth:0.3,
        fill:"none",
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
            const width = fixedWidth || _width(data, i) || DEFAULT_WIDTH;
            const height = fixedHeight || _height(data, i) || DEFAULT_HEIGHT;

            /*
            const drag = d3.drag()
                .on("start", enhancedDrag())
                .on("drag", enhancedDrag())
                .on("end", enhancedDrag());
                */

            // expression elements
            /*
            //for some reason, this seems to be appending a new one each time or something
            parentG.selectAll("rect.bg").data([1])
                .join("rect")
                    .attr("class", "bg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("fill", styles.fill)
                    .attr("stroke", styles.stroke)
                    .attr("stroke-width", styles.strokeWidth);
                    //.call(drag)
            */
            const rect = parentG.selectAll("rect.bg").data([1])
            rect.enter()
                .append("rect")
                    .attr("class", key ? `bg ${key}-bg` : "bg")
                    .merge(rect)
                    .attr("width", width)
                    .attr("height", height)
                    .attr("fill", styles.fill)
                    .attr("stroke", styles.stroke)
                    .attr("stroke-width", styles.strokeWidth);
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
    _background.className = function (value) {
        if (!arguments.length) { return _className; }
        if(typeof value === "string"){
            sharedClassName = value;
        }else{
            _className = value;
        }
        return _background;
    };
    _background.width = function (value) {
        if (!arguments.length) { return getWidth; }
        if(typeof value === "number"){
            fixedWidth = value;
        }else{
            fixedWidth = null;
            _width = value; 
        }
        return _background;
    };
    _background.height = function (value) {
        if (!arguments.length) { return _height; }
        if(typeof value === "number"){
            fixedHeight = value;
        }else{
            fixedHeight = null;
            _height = value; 
        }
        return _background;
    };
    _background.styles = function (value) {
        if (!arguments.length) { return _styles; }
        _styles = (d,i) => {
            const stylesToAdd = typeof value === "function" ? value(d,i) : value;
            return { ...defaultStyles, ...stylesToAdd };
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
