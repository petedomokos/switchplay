import * as d3 from 'd3';
import textWrap from "./textWrap";
import { fadeIn, remove } from './domHelpers';
import { grey10 } from './constants';


//helper
const iconTranslate = (width, height, requiredWidth, requiredHeight) => {
    const vertScale = requiredHeight/height;
    const horizScale = requiredWidth/width;
    const scaleToUse = d3.min([vertScale, horizScale])

    const renderedWidth = width * scaleToUse;
    const renderedHeight = height * scaleToUse;
    return `translate(${-renderedWidth/2},${-renderedHeight/2}) scale(${scaleToUse})`
}
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

    //state
    let hovered;
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
                            //d3.select(this).append("rect").attr("fill", "none")
                            d3.select(this).append("g").attr("class", "icon")
                            
                        })
                        .merge(tooltipG)
                        .attr("transform", (d,i) => `translate(${xScale(d.x) || xScale.range()[0]}, ${yScale(d.y)})`)
                        .each(function(d){
                            const tooltipG = d3.select(this);
                            //console.log("d xscale", d, xScale(d.x))
                            const { height, contentsWidth, contentsHeight } = tooltipDimns[d.key];
                            //console.log("cW", contentsWidth)
                            /*d3.select(this).select("rect")
                                .attr("x", -contentsWidth/2)
                                .attr("y", -contentsHeight/2)
                                .attr("width", contentsWidth)
                                .attr("height", contentsHeight)*/

                            //settings
                            const isSmall = contentsWidth < 10
                            const icon = isSmall ? (d.smallIcon || d.icon) : d.icon;
                            const shouldShowValue = !isSmall && (!d.achieved || hovered === d.key)

                            //todo - make the tooltips with and height based on iconAspect ratio
                            const iconG = tooltipG.select("g.icon")
                                .attr("transform", iconTranslate(icon.width, icon.height, contentsWidth, contentsHeight));
                            iconG.html(icon.html)
                            const innerG = iconG.select("g");
                            innerG.style("opacity", isSmall && !d.achieved ? 1 : 0.85)

                            iconG.select(".inner-content").attr("display", shouldShowValue ? "none" : null)

                            //iconG.attr("transform", "scale(2)")
                            if(icon.styles?.fill){
                                iconG.selectAll("*").style("fill", icon.styles.fill)
                            }
                            
                            iconG.selectAll(".net")
                                .style("fill", "#f0f0f0")
                            iconG.select(".posts")
                                .style("fill", "#afafaf")

                            //value
                            const valueText = tooltipG.selectAll("g.value").data(shouldShowValue ? [1] : [])
                            valueText.enter()
                                .append("text")
                                    .attr("class", "value")
                                    .call(fadeIn)
                                    .attr("text-anchor", "middle")
                                    .attr("dominant-baseline", "central")
                                    .merge(valueText)
                                    .attr("y", d.key === "expected" ? -contentsWidth * 0.1 : 0)
                                    //temp - use width, not contentsW, so all tooltip fonts the same
                                    .attr("font-size", height * 0.3)
                                    .attr("stroke", grey10(6))
                                    .attr("fill", grey10(6))
                                    .attr("stroke-width", 0.1)
                                    .text(d.value || "99")

                            valueText.exit().call(remove)
                        })
                        .on("click", () => {
                            //todo next - use thus listener just to get the transition form showing values to not showing
                            //eg need to set display of ball .inner-overlay to null and its fill to the sme as our bg fill here,
                            //then move into enhanced drag and also do it on mouseover with enhancedDrag
                            
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
