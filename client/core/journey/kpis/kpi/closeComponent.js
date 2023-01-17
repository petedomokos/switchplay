import * as d3 from 'd3';
import { DIMNS, grey10 } from "../../constants";
import dragEnhancements from '../../enhancedDragHandler';
import container from './container';

/*

*/
export default function closeComponent() {
    //API SETTINGS
    let parentSelector = "";
    let parent = function(){ return d3.select(this); };
    // dimensions
    let DEFAULT_WIDTH = 30;
    let DEFAULT_HEIGHT = 30;
    let DEFAULT_MARGIN = { left: 0, right:0, top: 0, bottom: 0 };
    let contentsWidth;
    let contentsHeight;
    let _width = DEFAULT_WIDTH;
    let _height = DEFAULT_HEIGHT;
    let _margin = DEFAULT_MARGIN;

    function getDimns(d, i, data){
        const width = typeof _width === "function" ? _width(d,i) : _width;
        const height = typeof _height === "function" ? _height(d,i) : _height;
        const margin = typeof _margin === "function" ? _margin(d,i) : _margin;
        const contentsWidth = width - margin.left - margin.right;
        const contentsHeight = height - margin.top - margin.bottom;

        return {
            width, height, margin, contentsWidth, contentsHeight,
        }
    }

    const defaultStyles = {
        bg:{
            fill:"transparent",
            stroke:"none"
        },
        icon:{
            stroke:grey10(8),
            fill:grey10(8),
        },
        text:{
            fontSize:9,
            stroke:grey10(8),
            strokeWidth:1,
            fill:grey10(8),
        }
    };
    let _styles = () => defaultStyles;
    let transform = () => null;

    let text;
    //API CALLBACKS
    let onClick = function(){};

    function close(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log} = options;

        // expression elements
        selection
            .style("cursor", "pointer")
            .call(container()
                .className("close-contents")
                .transform(transform)
                .enter(function(d,i){
                    const contentsG = d3.select(this);

                    contentsG
                        .append("rect")
                            .attr("class", "close-bg")
                            .attr("stroke", "black")
                            .attr("fill", "white");

                    //for now, just have one bg rect for the whole close
                    contentsG.append("text");

                })
                .update(function(d,i){
                    const styles = _styles(d, i);
                    const { width, height }= getDimns(d, i);
                    const contentsG = d3.select(this)
                        .on("click", onClick);

                    contentsG.select("rect.close-bg")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("fill", styles.bg.fill)
                        .attr("stroke", styles.bg.stroke)

                    contentsG.select("text")
                        .attr("x", width/2)
                        .attr("y", height/2)
                        .attr("text-anchor", "middle")
                        .attr("dominant-baseline", "central")
                        .attr("font-size", styles.text.fontSize)
                        .attr("stroke", styles.text.stroke)
                        .attr("fill", styles.text.fill)
                        .attr("stroke-width", styles.text.strokeWidth)
                        .text(text)

                })
                .exit(function(){
                    //will be multiple exits because of the delay in removing
                    if(!d3.select(this).attr("class").includes("exiting")){
                        d3.select(this)
                            .classed("exiting", true)
                            .transition()
                                .duration(200)
                                .attr("opacity", 0)
                                .on("end", function() { d3.select(this).remove(); });
                    }
                }))

            return selection;
    }
    
    //api
    close.parent = function (value) {
        if (!arguments.length) { return parent; }
        if(typeof value === "string"){
            parentSelector = value;
            parent = function(){ return d3.select(this).select(parentSelector); }
        }else {
            parent = value;
        }
        return close;
    };
    close.width = function (value) {
        if (!arguments.length) { return _width; }
        _width = value;
        return close;
    };
    close.height = function (value) {
        if (!arguments.length) { return _height; }
        _height = value;
        return close;
    };
    close.margin = function (func) {
        if (!arguments.length) { return _margin; }
        _margin = (d,i) => ({ ...DEFAULT_MARGIN, ...func(d,i) })
        return close;
    };
    close.transform = function (value) {
        if (!arguments.length) { return transform; }
        if(typeof value === "function"){
            transform = value;
        }
        return close;
    };
    close.styles = function (func) {
        if (!arguments.length) { return _styles; }
        _styles = (d,i) => {
            const requiredStyles = func(d,i);
            return {
                text:{ ...defaultStyles.text, ...requiredStyles.text },
                icon:{ ...defaultStyles.icon, ...requiredStyles.icon },
                bg:{ ...defaultStyles.bg, ...requiredStyles.bg }
                //others here
            }
        };
        return close;
    };
    close.text = function (value) {
        if (!arguments.length) { return text; }
        text = value;
        return close;
    };
    close.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return close;
    };
    return close;
}
