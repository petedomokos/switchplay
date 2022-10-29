import * as d3 from 'd3';
import { DIMNS, grey10 } from "../../constants";
import dragEnhancements from '../../enhancedDragHandler';
import tooltipsComponent from '../../tooltipsComponent';

/*

*/
export default function progressBarComponent() {
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
        barSections:{
        }
    };
    let _styles = () => defaultStyles;
    let transform = () => null;


    //API CALLBACKS
    let onBarClick = function(){};
    let onBarDblClick = function(){};
    let onBarLongpressStart = function(){};
    let onBarLongpressEnd = function(){};
    let onBarMouseover = function(){};
    let onBarMouseout = function(){};

    let onBarHandleClick = function(){};
    let onBarHandleDblClick = function(){};

    const enhancedDrag = dragEnhancements();
    const tooltips = tooltipsComponent();

    function progressBar(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log} = options;

        // expression elements
        selection
            .each(function (data, i) {
                //console.log("Bar i", i)
                const margin = _margin(data, i);
                //console.log("PB margin", margin)
                const parentG = parent.call(this, parent)
                    .attr("transform", `translate(${margin.left},${margin.top})`);
                //console.log("progressBar parent", parentG.node())
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
            //.call(container().className("tooltip-contents").margin((d,i) => dimns[i].tooltipsMargin))
            //tooltips component will remove all tool
            //.call(tooltips)

        return selection;
    }
    
    //api
    progressBar.parent = function (value) {
        if (!arguments.length) { return parent; }
        if(typeof value === "string"){
            parentSelector = value;
            parent = function(){ return d3.select(this).select(parentSelector); }
        }else {
            parent = value;
        }
        return progressBar;
    };
    progressBar.width = function (value) {
        if (!arguments.length) { return _width; }
        _width = value;
        return progressBar;
    };
    progressBar.height = function (value) {
        if (!arguments.length) { return _height; }
        _height = value;
        return progressBar;
    };
    progressBar.margin = function (func) {
        if (!arguments.length) { return _margin; }
        _margin = (d,i) => ({ ...DEFAULT_MARGIN, ...func(d,i) })
        return progressBar;
    };
    progressBar.transform = function (value) {
        if (!arguments.length) { return transform; }
        if(typeof value === "function"){
            transform = value;
        }
        return progressBar;
    };
    progressBar.styles = function (func) {
        if (!arguments.length) { return _styles; }
        _styles = (d,i) => {
            const requiredStyles = func(d,i);
            return {
                name:{ ...defaultStyles.name, ...requiredStyles.name },
                //others here
            }
        };
        return progressBar;
    };
    progressBar._name = function (value) {
        if (!arguments.length) { return _name; }
        if(typeof value === "function"){
            _name = value;
        }
        return progressBar;
    };
    progressBar.onBarClick = function (value) {
        if (!arguments.length) { return onBarClick; }
        onBarClick = value;
        return progressBar;
    };
    progressBar.onBarDblClick = function (value) {
        if (!arguments.length) { return onBarDblClick; }
        onBarDblClick = value;
        return progressBar;
    };
    progressBar.onBarLongpressStart = function (value) {
        if (!arguments.length) { return onBarLongpressStart; }
        if(typeof value === "function"){
            onBarLongpressStart = value;
        }
        return progressBar;
    };
    progressBar.onBarLongpressEnd = function (value) {
        if (!arguments.length) { return onBarLongpressEnd; }
        if(typeof value === "function"){
            onBarLongpressEnd = value;
        }
        return progressBar;
    };
    progressBar.onBarMouseover = function (value) {
        if (!arguments.length) { return onBarMouseover; }
        if(typeof value === "function"){
            onBarMouseover = value;
        }
        return progressBar;
    };
    progressBar.onBarMouseout = function (value) {
        if (!arguments.length) { return onBarMouseout; }
        if(typeof value === "function"){
            onBarMouseout = value;
        }
        return progressBar;
    };
    return progressBar;
}
