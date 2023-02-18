import * as d3 from 'd3';
import textWrap from "./textWrap";
import { fadeIn, remove, show, hide } from './domHelpers';
import { grey10 } from './constants';
import dragEnhancements from './enhancedDragHandler';
import { getTransformationFromTrans } from './helpers';

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
    let getX = () => () => 0;
    let getY = () => () => 0;
    let getValue = d => d.value;

    const DEFAULT_TOOLTIP_DIMNS = { 
        target: { width:0, height: 0, margin:{left:0, right:0, top:0, bottom:0 } },
        expected: { width:0, height: 0, margin:{left:0, right:0, top:0, bottom:0 } },
    }
    let _tooltipDimns = () => DEFAULT_TOOLTIP_DIMNS;
    
    const defaultStyles = {
        text:{
            fill:grey10(6),
            stroke:grey10(6)
        }
    };
    let _styles = () => defaultStyles;

    //state
    let hovered;
    let unsavedValues = {}

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

    let updateTooltip = function(selection, tooltipDimns){
        selection.each(function(d,i){
            //decide the saem common pattern for tooltips - it should probably always be
            //an array, even if its top then bottom
            const tooltipG = d3.select(this);
            const { width, height, margin, fontSize } = tooltipDimns[i];
            const styles = _styles(d,i);

            const contentsWidth = width - margin.left - margin.right;
            const contentsHeight = height - margin.top - margin.bottom;
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
                .attr("fill", styles.text.fill)
                .attr("stroke", styles.text.stroke)
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
            if(d.key === "expected" && d.milestoneId === "current" && d.progBarKey === "pressUps-reps"){
            }

            //todo - make the tooltips with and height based on iconAspect ratio
            const iconG = iconContG.select("g.icon")
                .attr("transform", iconTranslate(icon.width, icon.height, contentsWidth, iconHeight));
            iconG.html(icon.html)
            const innerG = iconG.select("g");
            innerG.style("opacity", isSmall && !isAchieved(d) ? 1 : 0.85)

            if(icon.styles?.fill){
                //not being used
                iconG.selectAll("*").style("fill", icon.styles.fill)
            }
            iconG.select(".inner-overlay").attr("display", shouldShowValue ? null : "none")
            
            iconG.selectAll(".net").style("fill", "#f0f0f0")
            iconG.select(".posts").style("fill", "#afafaf")
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
                    .attr("font-size", fontSize)
                    .attr("fill", styles.text.fill)
                    .attr("stroke", styles.text.stroke)
                    .attr("stroke-width", 0.1)
                    .text(getValue(d) || "")

            valueText.exit().remove();//need to also transition icon changes.call(remove)
        })                    
    }

    //const titleWrap = textWrap();
    
    function tooltips(selection, options={}) {
        //console.log("tooltips update  ", selection.data())
        //specific tooltip updates
        selection.each(function(data,i){
            const tooltipDimns = _tooltipDimns(data, i);
            const styles = _styles(data,i);
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
                /*
                data.forEach(d => {
                    if(d.progBarKey === "pressUps-reps-current"){
                        console.log("tooltip d",d)
                        if(d.key === "expected"){
                            console.log("val", getValue(d))
                        }
                    }
                })
                */
                enhancedDrag
                    .onClick(handleClick)
                    //.onMouseover(onMouseover)
                    //.onMouseout(onMouseout);

                const drag = d3.drag()
                    .on("start", draggable ? enhancedDrag(dragStart) : null)
                    .on("drag", draggable ? enhancedDrag(dragged) : null)
                    .on("end", draggable ? enhancedDrag(dragEnd) : null);

                function handleClick(e,d){
                    //dont need to show value if not achieved as its showing anyway
                    const dragValueText = d3.select(this).select("text.drag-value");
                    if(isAchieved(d) && !dragValueText.attr("class").includes("transitioning") && dragValueText.style("opacity") !== 1) {
                        dragValueText
                            .classed("transitioning", true)
                            .transition()
                            .duration(200)
                                .style("opacity", 1)
                                .on("end", function(){
                                    d3.timeout(() => {
                                        d3.select(this)
                                            .transition()
                                            .duration(200)
                                                .style("opacity", 0)
                                                .on("end", function(){
                                                    d3.select(this).classed("transitioning", false);
                                                })
                                    }, 2000)
                                })
                    }
                    onClick.call(this, e, d)
                }

                function dragStart(e,d){
                    if(!d.editable) { 
                        if(d.key === "expected"){
                            alert("The expected value can't be changed. It is calculated based on your target.")
                        }
                        if(d.key === "target"){
                            //must be a past card
                            alert("You can only change future targets. This card is in the past.")
                        }
                        return; }
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
                    if(!d.editable) { return; }                       
                    onDrag.call(this, e, d, tooltipDimns);
                }

                function dragEnd(e,d){
                    if(!d.editable) { return; }
                    beingDragged = () => false;
                    d3.select(this).select("text.drag-value")
                        .transition()
                        .duration(200)
                            .style("opacity", 0);
                    
                    d3.select(this).select("g.icon").select("text.value")
                        .transition()
                        .duration(200)
                            .style("opacity", 1);

                    //store the values as 'unsaved'
                    onDragEnd.call(this, e, d)
                    //
                    d3.select(this.parentNode).selectAll("g.tooltip").call(updateTooltip, tooltipDimns); 
                }

                containerG.select("rect.tooltips-bg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("fill", styles.bg?.fill || "none");

                const tooltipG = containerG.selectAll("g.tooltip").data(data);
                tooltipG.enter()
                    .append("g")
                        .attr("class", "tooltip")
                        .each(function(d,i){
                            d3.select(this).append("text").attr("class", "drag-value")
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")
                                .style("opacity", 0); //starts hidden

                            d3.select(this)
                                .append("g")
                                    .attr("class", "icon-cont") 
                                        .append("g")
                                            .attr("class", "icon")
                            //hitbox must be on top, as contents under it will change              
                            d3.select(this).append("rect").attr("class", "hitbox")
                                .attr("fill", "transparent")
                                //.attr("stroke", "red")
                        })
                        .merge(tooltipG)
                        .style("display", d => d.shouldDisplay ? null : "none")
                        //i is the data's i, not the tooltip datum's i
                        .attr("transform", (d,j) => `translate(${getX(d, i, j)}, ${getY(d, i, j)})`)
                        .call(updateTooltip, tooltipDimns)
                        .call(drag)
                        .on("mouseover", onMouseover)
                        .on("mouseout", onMouseout);

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
        _tooltipDimns = (d,i) => func(d,i) || DEFAULT_TOOLTIP_DIMNS;
        return tooltips;
    };
    tooltips.styles = function (func) {
        if (!arguments.length) { return _styles; }
        _styles = (d,i) => {
            const requiredStyles = func(d,i);
            return {
                text:{ ...defaultStyles.text, ...requiredStyles.text },
                //others here
            }
        };
        return tooltips;
    };
    tooltips.getValue = function (value) {
        if (!arguments.length) { return getValue; }
        getValue = value;
        return tooltips;
    };
    tooltips.getX = function (value) {
        if (!arguments.length) { return getX; }
        getX = value;
        return tooltips;
    };
    tooltips.getY = function (value) {
        if (!arguments.length) { return getY; }
        getY = value;
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
    tooltips.updateTooltip = updateTooltip;
    
    return tooltips;
}
