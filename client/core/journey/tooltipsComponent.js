import * as d3 from 'd3';
import textWrap from "./textWrap";
import { grey10 } from './constants';

/*

*/
export default function tooltipsComponent() {
    // dimensions
    let width = 100;
    let height = 30;

    //function updateDimns(){
    //};
    let _xScale = () => () => 0;
    let _yScale = () => () => 0;
    const DEFAULT_TOOLTIP_DIMNS = { 
        target: { width:0, height: 0, margin:{left:0, right:0, top:0, bottom:0 } },
        expected: { width:0, height: 0, margin:{left:0, right:0, top:0, bottom:0 } },
    }
    let _tooltipDimns = () => DEFAULT_TOOLTIP_DIMNS;
    
    //note - styles may be implemntd as attrs instead
    let styles = {};
    //dom

    //const titleWrap = textWrap();
    
    function tooltips(selection, options={}) {
        //console.log("tooltips update  ", selection.data())
        //specific tooltip updates
        selection.each(function(data,i){
            //console.log("tooltips i d",i, data)
            const xScale = _xScale(data,i);
            const yScale = _yScale(data,i);
            const tooltipDimns = _tooltipDimns(data, i);
            const containerG = d3.select(this);
                //.attr("pointer-events", "none");
            
            //enter
            if(containerG.select("g.tooltip-contents").empty()){ 
                //console.log("enter.......", i)
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
                        .attr("class", "tooltips-bg");
                
            }

            function update(){
                //console.log("update.......", data)
                containerG.select("rect.tooltips-bg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("fill", styles.bg?.fill || "none");

                const tooltipG = containerG.selectAll("g.tooltip").data(data);
                tooltipG.enter()
                    .append("g")
                        .attr("class", "tooltip")
                        .each(function(){
                            d3.select(this).append("rect")
                        })
                        .merge(tooltipG)
                        .attr("transform", (d,i) => `translate(${xScale(d.x) || xScale.range()[0]}, ${yScale(d.y)})`)
                        .each(function(d){
                            //console.log("d xscale", d, xScale(d.x))
                            const { contentsWidth, contentsHeight } = tooltipDimns[d.key];
                            d3.select(this).select("rect")
                                .attr("x", -contentsWidth/2)
                                .attr("y", -contentsHeight/2)
                                .attr("width", contentsWidth)
                                .attr("height", contentsHeight)
                                .attr("fill", "white")
                        })

                tooltipG.exit().remove();

            }
        })

        return selection;
    }

    //api
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
    tooltips.tooltipDimns = function (func) {
        if (!arguments.length) { return _tooltipDimns; }
        _tooltipDimns = (d,i) => ({ ...DEFAULT_TOOLTIP_DIMNS, ...func(d,i) });
        return tooltips;
    };
    tooltips.xScale = function (value) {
        if (!arguments.length) { return _xScale; }
        _xScale = value;
        return tooltips;
    };
    tooltips.yScale = function (value) {
        if (!arguments.length) { return _yScale; }
        _yScale = value;
        return tooltips;
    };
    tooltips.styles = function (value) {
        if (!arguments.length) { return styles; }
        styles = { ...styles, ...value};
        return tooltips;
    };

    return tooltips;
}
