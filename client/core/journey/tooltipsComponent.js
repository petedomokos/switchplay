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
    let getX = () => () => 0;
    let getY = () => () => 0;
    let getValue = d => d.value;

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

    let updateTooltip = function(){};

    //const titleWrap = textWrap();
    
    function tooltips(selection, options={}) {
        //console.log("tooltips update  ", selection.data())
        //specific tooltip updates
        selection.each(function(data,i){
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
                    .onClick(onClick)
                    //.onMouseover(onMouseover)
                    //.onMouseout(onMouseout);

                const drag = d3.drag()
                    .on("start", draggable ? enhancedDrag(dragStart) : null)
                    .on("drag", draggable ? enhancedDrag(dragged) : null)
                    .on("end", draggable ? enhancedDrag(dragEnd) : null);

                function dragStart(e,d){
                    if(!d.editable) { return; }
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
                    const { translateX, translateY } = getTransformationFromTrans(d3.select(this).attr("transform"));
                    const newX = translateX + e.dx;
                    //problem - now we dont have xScale, how do e invert? could pass it all up so tooltipsComponent
                    //doesnt handle drags,
                    //or could have an invert setting passed in too.
                    const newValue = d.value;//Number(xScale.invert(newX).toFixed(1));
                    d3.select(this).attr("transform", `translate(${newX},${translateY})`)
                    //@todo - handle dataset order eg lowest-is-best
                    if(!unsavedValues[d.progBarKey]){
                        unsavedValues[d.progBarKey] = {}
                    }
                    unsavedValues[d.progBarKey][d.key] = newValue;
                    d.unsavedValue = newValue;
                    d3.select(this).call(updateTooltip)
                    onDrag.call(this, e, d, newValue);
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

        function updateTooltip(selection, tooltipDimns, isTest){
            if(isTest){
                console.log("test!!!!!!!!!!!!!!!!")
                return;
            }

            /*

            todo 
            - whats this error now when dragging
            - test this funciton being called from teh listener in prgBarComp
            - do we need unsavedValues object - whast it for?
            - move the drag logic into teh listener


            */
            selection.each(function(d,i){
                //decide the saem common pattern for tooltips - it should probably always be
                //an array, even if its top then bottom
                const tooltipG = d3.select(this);
                const { width, height, margin } = tooltipDimns[i];

                
                const contentsWidth = width - margin.left - margin.right;
                const contentsHeight = height - margin.top - margin.bottom;
                const dragTextHeight = draggable && showDragValueAbove ? contentsHeight * 0.333 : 0;
                const iconHeight = contentsHeight - dragTextHeight;


                if(d.key === "expected" && d.milestoneId === "current" && d.progBarKey === "pressUps-reps"){
                    //console.log("d", d)
                    //console.log("width height", width, height)
                    //console.log("cwidth cheight iconH", contentsWidth, contentsHeight, iconHeight)
                }
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

                if(icon.styles?.fill){
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
                        .attr("font-size", contentsHeight * 0.4)
                        .attr("stroke", grey10(6))
                        .attr("fill", grey10(6))
                        .attr("stroke-width", 0.1)
                        .text(getValue(d) || "")

                valueText.exit().remove();//need to also transition icon changes.call(remove)
            })                    
        }

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
    tooltips.updateTooltip = function(selection, dimns, isTest){ updateTooltip(selection, dimns, isTest) }

    return tooltips;
}
