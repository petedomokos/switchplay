import * as d3 from 'd3';
import textWrap from "./textWrap";
import { grey10 } from './constants';

/*

*/
export default function tooltipsComponent() {
    // dimensions
    let margin;
    let width = 100;
    let height = 60;
    let contentsWidth;
    let contentsHeight;
    let titleHeight;
    let valueHeight;

    function updateDimns(){
        margin = { left: width * 0.05, right: width * 0.05, top:height * 0.05, bottom:height * 0.05 };
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
        titleHeight = contentsHeight * 0.35;
        valueHeight = contentsHeight * 0.65;
    };

    //note - styles may be implemntd as attrs instead
    let styles = {};
    //dom

    //const titleWrap = textWrap();
    
    function tooltips(selection, options) {
        const { log } = options;
        //general updates that apply to all tooltips
        updateDimns();

        //specific tooltip updates
        selection.each(function(d){
            const containerG = d3.select(this);
                //.attr("pointer-events", "none");
            
            //enter
            if(containerG.select("g.tooltip-contents").empty()){ 
                enter();
            }

            update();

            function enter() {
                //const containerG = d3.select(this);

                containerG
                    .attr("opacity", 0)
                    .transition()
                        .duration(200)
                        .attr("opacity", 1);

                containerG
                    .append("rect")
                        .attr("class", "bg");

                const contentsG = containerG
                    .append("g")
                        .attr("class", "contents tooltip-contents");
                
                contentsG
                    .append("g")
                        .attr("class", "title")
                            .append("text")
                                .attr("class", "title")
                                .attr("x", contentsWidth/2)
                                .attr("y", titleHeight/2)
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")

                const valueG = contentsG.append("g").attr("class", "value");
                valueG
                    .append("rect")
                        .attr("class", "value-bg")
                valueG
                    .append("text")
                        .attr("class", "value")
                        .attr("text-anchor", "middle")
                        .attr("dominant-baseline", "central")
                
            }

            function update(){
                console.log("update tooltip styles", styles)
                console.log("contentsHeight", contentsHeight)
                console.log("titleHeight", titleHeight)
                console.log("valueHeight", valueHeight)
                containerG.select("rect.bg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("fill", styles.bg?.fill || "none");

                const contentsG = containerG.select("g.tooltip-contents")
                    .attr("transform", "translate(" +margin.left +"," +margin.top +")")

                contentsG.select("g.title").select("text.title")
                    .attr("x", contentsWidth/2)
                    .attr("y", titleHeight/2)
                    .attr("font-size", styles.title?.fontSize || 9)
                    .attr("stroke", styles.title?.stroke || "white")
                    .attr("fill", styles.title?.stroke || "white")
                    .attr("stroke-width", styles.title?.strokeWidth || 0.3)
                    .text((contentsWidth < 40 && d.shortTitle) ? d.shortTitle : (d.title || d.label || d.name || ""))
                    

                const valueG = contentsG.select("g.value")
                    .attr("transform", "translate(0," +titleHeight +")");

                valueG.select("rect")
                    .attr("width", contentsWidth)
                    .attr("height", valueHeight)
                    .attr("fill", styles.value?.fill || "none")
                
                valueG.select("text.value")
                    .attr("x", contentsWidth/2)
                    .attr("y", valueHeight/2)
                    .attr("font-size", styles.value?.fontSize || 11)
                    .attr("stroke", styles.value?.stroke || "black")
                    .attr("stroke-width", styles?.value?.strokeWidth || 0.3)
                    .attr("fill", styles.value?.stroke || "black")
                    .text(d.format === "pc" ? d.pcValue : d.value)

                    
            }
        })

        return selection;
    }

    //api
    tooltips.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = { ...margin, ...value};
        return tooltips;
    };
    tooltips.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return tooltips;
    };
    tooltips.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return tooltips;
    };
    tooltips.styles = function (value) {
        if (!arguments.length) { return styles; }
        styles = { ...styles, ...value};
        return tooltips;
    };

    return tooltips;
}
