import * as d3 from 'd3';
import { DIMNS, grey10 } from "../../constants";
import dragEnhancements from '../../enhancedDragHandler';
import container from './container';
import background from "./background";

/*

*/
export default function closeComponent() {
    //API SETTINGS
    let parentSelector = "";
    let parent = function(){ return d3.select(this); };
    // dimensions
    let width = 30;
    let height = 30;
    let margin = { left: 0, right:0, top: 0, bottom: 0 };
    let contentsWidth;
    let contentsHeight;

    function updateDimns(d, i, data){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
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

    const ICON_LENGTH = 12;

    function close(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log} = options;

        updateDimns();

        // expression elements
        selection
            .style("cursor", "pointer")
            .call(background("close-btn")
                .width((d,i) => width)
                .height((d,i) => height)
                .styles((d, i) => ({
                    fill:"transparent"
                }))
            )
            .on("click", onClick)
            .call(container("close-contents")
                .enter(function(d,i){
                    const contentsG = d3.select(this);

                    contentsG.append("path")
                        .attr("stroke", "#292929")
                        .attr("opacity", 0.35)
                        .attr("stroke-width", "1.5")
                        .attr("stroke-linecap", "round")
                        .attr("stroke-linejoin", "round")
                        .attr("d", "M1 1.00006L11 11.0001M1 11.0001L11 1.00006")

                })
                .update(function(d,i){
                    const styles = _styles(d, i);
                    const contentsG = d3.select(this)
                        .attr("transform", `translate(${margin.left},${margin.top})`);
                    
                    const horizScale = contentsWidth/ICON_LENGTH;
                    const vertScale = contentsHeight/ICON_LENGTH;
                    contentsG.select("path").attr("transform", `scale(${horizScale})`)

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
        if (!arguments.length) { return width; }
        width = value;
        return close;
    };
    close.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return close;
    };
    close.margin = function (value) {
        if (!arguments.length) { return _margin; }
        margin = { ...margin, ...value }
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
