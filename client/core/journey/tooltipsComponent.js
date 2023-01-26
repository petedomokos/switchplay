import * as d3 from 'd3';
import textWrap from "./textWrap";
import { fadeIn, remove, show, hide } from './domHelpers';
import { grey10 } from './constants';
import dragEnhancements from './enhancedDragHandler';
import { getTransformationFromTrans } from './helpers';
import { FlashOnRounded } from '@material-ui/icons';


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
    let unsavedValues = {}
    let getUnsavedValue = d => unsavedValues[d.progBarKey] ? unsavedValues[d.progBarKey][d.key] : null;
    //for now, x and value are same
    let getValue = d => typeof getUnsavedValue(d) === "number" ? getUnsavedValue(d) : d.value;
    let getX = d => getValue(d);
    let isAchieved = d => typeof d.current === "number" && typeof getValue(d) === "number" && d.current >= getValue(d);

    let draggable = false;
    let showDragValueAbove = true;
    let beingDragged = () => false;

    const enhancedDrag = dragEnhancements();
    //API CALLBACKS
    let onDragStart = function() {};
    let onDrag = function() {};
    let onDragEnd = function() {};
    let onClick = function(){};
    let onDblClick = function(){};
    let onLongpressStart = function(){};
    let onLongpressEnd = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};

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
                    .style("opacity", 0)
                    .transition()
                        .duration(200)
                        .style("opacity", 1);

                containerG
                    .append("rect")
                        .attr("class", "tooltips-bg");
                
            }

            

            function update(){
                enhancedDrag
                    .onClick(onClick)
                    //.onMouseover(onMouseover)
                    //.onMouseout(onMouseout);

                const drag = d3.drag()
                    .on("start", enhancedDrag(dragStart))
                    .on("drag", enhancedDrag(dragged))
                    .on("end", enhancedDrag(dragEnd));

                function dragStart(e,d){
                    beingDragged = t => t.progBarKey === d.progBarKey && t.key === d.key;
                    if(showDragValueAbove){
                        d3.select(this).select("text.drag-value")
                            .transition()
                            .duration(200)
                                .style("opacity", 0.7)

                        d3.select(this).select("g.icon").select("text.value")
                            .style("opacity", 1)
                            .transition()
                            .duration(200)
                                .style("opacity", 0)
                    }
                }

                function dragged(e,d){                       
                    //console.log("xScale dom range", xScale.domain(), xScale.range())
                    const { translateX, translateY } = getTransformationFromTrans(d3.select(this).attr("transform"));
                    //console.log("currX currVal", translateX, xScale.invert(translateX))
                    const newX = translateX + e.dx;
                    const newValue = Number(xScale.invert(newX).toFixed(1));
                    d3.select(this).attr("transform", `translate(${newX},${translateY})`)
                    //@todo - handle dataset order eg lowest-is-best
                    if(!unsavedValues[d.progBarKey]){
                        unsavedValues[d.progBarKey] = {}
                    }
                    unsavedValues[d.progBarKey][d.key] = newValue;
                    d3.select(this).call(updateTooltip)
                }


                function dragEnd(e,d){
                    beingDragged = () => false;
                    d3.select(this).select("text.drag-value")
                        .transition()
                        .duration(200)
                            .style("opacity", 0);
                    
                    d3.select(this).select("g.icon").select("text.value")
                        .transition()
                        .duration(200)
                            .style("opacity", 1);

                    d3.select(this).call(updateTooltip); 
                }

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
                            d3.select(this).append("rect").attr("class", "hitbox")
                                .attr("fill", "transparent")

                            d3.select(this).append("text").attr("class", "drag-value")
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")
                                .style("opacity", 0); //starts hidden

                            d3.select(this)
                                .append("g")
                                    .attr("class", "icon-cont") 
                                        .append("g")
                                            .attr("class", "icon") 
                        })
                        .merge(tooltipG)
                        .attr("transform", (d,i) => `translate(${xScale(getX(d)) || xScale.range()[0]}, ${yScale(d.y)})`)
                        .call(updateTooltip)
                        .call(drag)
                        .on("mouseover", onMouseover)
                        .on("mouseout", onMouseout)
                        /*
                        .on("click", (e,d) => {
                            hovered = d.key;
                            console.log("click", d.key)
                            update();
                            //todo next - use thus listener just to get the transition from showing values to not showing
                            //eg need to set display of ball .inner-overlay to null and its fill to the sme as our bg fill here,
                            //then move into enhanced drag and also do it on mouseover with enhancedDrag
                            
                        })*/

                tooltipG.exit().remove();

                function updateSaveBtns(selection){

                };

                function updateTooltip(selection){
                    selection.each(function(d,i){
                        const tooltipG = d3.select(this);
                        const { height, contentsWidth, contentsHeight } = tooltipDimns[d.key];
                        const dragTextHeight = draggable && showDragValueAbove ? contentsHeight * 0.333 : 0;
                        const iconHeight = contentsHeight - dragTextHeight;

                        tooltipG.select("rect.hitbox")
                            .attr("x", -contentsWidth/2)
                            .attr("y", -contentsHeight/2)
                            .attr("width", contentsWidth)
                            .attr("height", contentsHeight)

                        //dragtext
                        tooltipG.select("text.drag-value")
                            .attr("y", -contentsHeight/2 + dragTextHeight/2)
                            .attr("font-size", dragTextHeight * 0.8)
                            .attr("display", draggable && showDragValueAbove ? null : "none")
                            .text(getValue(d) || "")

                        //shoft iconCont down so its in the centre of the icon space not the tooltip space
                        const iconContG = tooltipG.select("g.icon-cont")
                            .attr("transform", `translate(0, ${dragTextHeight/2})`)

                        //settings
                        const isSmall = iconHeight < 10
                        const iconObject = isSmall ? (d.smallIcons || d.icons) : d.icons;
                        const icon = isAchieved(d) ? iconObject.achieved : iconObject.notAchieved;
                        const shouldShowValue = !isSmall && (!isAchieved(d) || hovered === d.key) && !beingDragged(d);

                        //todo - make the tooltips with and height based on iconAspect ratio
                        const iconG = iconContG.select("g.icon")
                            .attr("transform", iconTranslate(icon.width, icon.height, contentsWidth, iconHeight));
                        iconG.html(icon.html)
                        const innerG = iconG.select("g");
                        innerG.style("opacity", isSmall && !isAchieved(d) ? 1 : 0.85)

                        iconG.select(".inner-content").attr("display", shouldShowValue ? "none" : null)

                        //iconG.attr("transform", "scale(2)")
                        if(icon.styles?.fill){
                            iconG.selectAll("*").style("fill", icon.styles.fill)
                        }
                        if(shouldShowValue){
                            iconG.select(".inner-overlay").attr("display", null)
                        }
                        
                        iconG.selectAll(".net")
                            .style("fill", "#f0f0f0")
                        iconG.select(".posts")
                            .style("fill", "#afafaf")

                        //value
                        // problem - this gets added mid-drag, so it doesnt have its opacity set to 0
                        const valueText = iconContG.selectAll("text.value").data(shouldShowValue ? [1] : [])
                        valueText.enter()
                            .append("text")
                                .attr("class", "value")
                                .call(fadeIn)
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")
                                .merge(valueText)
                                .attr("y", d.key === "expected" ? -contentsWidth * 0.1 : 0)
                                //temp - use width, not contentsW, so all tooltip fonts the same
                                .attr("font-size", height * 0.175)
                                .attr("stroke", grey10(6))
                                .attr("fill", grey10(6))
                                .attr("stroke-width", 0.1)
                                .text(getValue(d) || "")

                        valueText.exit().remove();//need to also transition icon changes.call(remove)
                    })
                    
                }

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
    tooltips.draggable = function (value) {
        if (!arguments.length) { return draggable; }
        draggable = value;
        return tooltips;
    };
    tooltips.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return tooltips;
    };
    tooltips.onLongpressStart = function (value) {
        if (!arguments.length) { return onLongpressStart; }
        onLongpressStart = value;
        return tooltips;
    };
    tooltips.onDragStart = function (value) {
        if (!arguments.length) { return onDragStart; }
        if(typeof value === "function"){
            onDragStart = value;
        }
        return tooltips;
    };
    tooltips.onDrag = function (value) {
        if (!arguments.length) { return onDrag; }
        if(typeof value === "function"){
            onDrag = value;
        }
        return tooltips;
    };
    tooltips.onDragEnd = function (value) {
        if (!arguments.length) { return onDragEnd; }
        if(typeof value === "function"){
            onDragEnd = value;
        }
        return tooltips;
    };
    tooltips.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return tooltips;
    };
    tooltips.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return tooltips;
    };

    return tooltips;
}
