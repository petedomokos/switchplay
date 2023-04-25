import * as d3 from 'd3';
import textWrap from "./textWrap";
import { fadeIn, remove, show, hide } from './domHelpers';
import { isNumber } from '../../data/dataHelpers';
import { grey10, COLOURS, TRANSITIONS } from './constants';
import dragEnhancements from './enhancedDragHandler';
import { getTransformationFromTrans } from './helpers';
import { AccountBalance } from '@material-ui/icons';

const MED_SLIDE_DURATION = TRANSITIONS.DEFAULT_DURATIONS.SLIDE.MED;
const MED_FADE_DURATION = TRANSITIONS.DEFAULT_DURATIONS.SLIDE.MED;

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
    let getSubtext = d => "";

    const DEFAULT_TOOLTIP_DIMNS = { 
        target: { width:0, height: 0, margin:{left:0, right:0, top:0, bottom:0 } },
        expected: { width:0, height: 0, margin:{left:0, right:0, top:0, bottom:0 } },
    }
    let _tooltipDimns = () => DEFAULT_TOOLTIP_DIMNS;
    
    const defaultStyles = {
        bg:{
            fill:"transparent"
        },
        text:{
            fill:grey10(6),
            stroke:grey10(6)
        },
        subtext:{
            fill:grey10(4),
            stroke:grey10(4)
        },
        hitbox:{
            fill:"transparent",
            stroke:"none",
            strokeOpacity:1,
            opacity:1,
            strokeWidth:0.1
        }
    };
    let _styles = () => defaultStyles;

    //state
    let hovered;

    let isAchieved = d => {
        //if(d.milestoneId === "profile-5"){
            //console.log("isAchieved...", d.key)
        //}
        if(d.key === "expectedSteps"){
            //note - this tooltip wont even show if there are no steps
            if(!isNumber(d.currentActualSteps) || !isNumber(d.expectedActualSteps)) { return false; }
            //if(d.milestoneId === "profile-5"){
                //console.log("ach? d", d)
                //console.log(d.currentActualSteps >= d.expectedActualSteps)
            //}
            return d.currentActualSteps >= d.expectedActualSteps;
        }
        if(!isNumber(d.current) || !isNumber(getValue(d))) { return false; }
        return d.dataOrder === "highest is best" ? d.current >= getValue(d) : d.current <= getValue(d);
    }

    let draggable = false;
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
    let onSaveValue = function(){};

    let updateTooltip = function(selection, tooltipDimns){
        //console.log("uT...data", selection.data())
        //const tooltipDimns = _tooltipDimns(data, i);
        selection.each(function(d,i){
            const tooltipG = d3.select(this);
            const { width, height, margin, fontSize } = tooltipDimns[d.key];

            const styles = _styles(d,i);

            const contentsWidth = width - margin.left - margin.right;
            const contentsHeight = height - margin.top - margin.bottom;
            const dragTextHeight = draggable && d.withDragValueAbove ? 12 : 0;
            const mainContentsHeight = contentsHeight - dragTextHeight;
            //this text below is not part of the normal dimns
            const subtextHeight = contentsHeight * 0.4;

            const btnWidth = d3.max([40, contentsWidth]);
            const btnHeight = contentsHeight;

            //bg
            tooltipG.select("rect.tooltip-bg")
                .attr("x", -width/2)
                .attr("y", -height/2)
                .attr("width", width)
                .attr("height", height)
                .attr("fill","transparent")// d.fill || styles.bg.fill)// COLOURS.selectedMilestone)
                .attr("stroke", d.stroke || "none")
                .attr("stroke-width", d.strokeWidth || null)
                .attr("opacity", d.opacity || null)

            //saveBtn
            const saveBtnG = tooltipG.selectAll("g.save-btn").data(isNumber(d.unsavedValue) && !beingDragged(d) ? [1] : []);
            saveBtnG.enter()
                .append("g")
                    .attr("class", "save-btn")
                    .each(function(){
                        d3.select(this)
                            .append("rect")
                                .attr("class", "save-btn-bg")
                                .attr("fill", "red")
                                .attr("rx", 5)
                                .attr("ry", 5);

                        d3.select(this)
                            .append("text")
                                .attr("class", "save-btn-txt")
                                    .attr("text-anchor", "middle")
                                    .attr("dominant-baseline", "central")
                                    .attr("font-size", 10)
                                    .text("SAVE")
                    })
                    .merge(saveBtnG)
                    .attr("transform", `translate(${-btnWidth/2}, ${-contentsHeight/2 + dragTextHeight})`)
                    .each(function(){
                        d3.select(this).select("rect.save-btn-bg")
                            .attr("width", btnWidth)
                            .attr("height", btnHeight)
                        
                        d3.select(this).select("text")
                            .attr("x", btnWidth/2)
                            .attr("y", btnHeight/2)
                    })
                    .on("click", function(){
                        //@todo - Date editing...add a date icon which if clicked opens a React form from MilestonesBar
                        //for changing the date.
                        //@todo - handle case of a very late close-to-midnight time.
                        const date = new Date();
                        const valueObj = { 
                            //actual: `${d.unsavedValue}`,
                            actual:Number(d.unsavedValue.toFixed(d.accuracy || 1)), 
                            date,
                            orientationFocus:d.orientationFocus
                        }
                        onSaveValue(valueObj, d.milestoneId, d.datasetKey, d.statKey, d.kpiKey, d.key);
                        //reset what is displayed (the save btn will disappear on update after save)
                        tooltipG.select("text.drag-value")
                            .transition()
                            .duration(MED_SLIDE_DURATION)
                                .style("opacity", 0);
                    
                        tooltipG.select("g.icon").select("text.value")
                            .transition()
                            .duration(MED_SLIDE_DURATION)
                                .style("opacity", 1);

                    })
                    //next - allow save btn to be dragged i same way as the tooltipicon under it. could just apply drag to tooltipG? and impl the click stuff
                    // that is above inside tooltip drag when ther eis an unsaved value - drag updates it as usual, click saves it

            saveBtnG.exit().remove();

            tooltipG.select("rect.hitbox")
                .attr("x", -contentsWidth/2)
                .attr("y", -contentsHeight/2)
                .attr("width", contentsWidth)
                .attr("height", contentsHeight)
                //ok, need a bg rect, and target opacity must be 1 an dbg must have fill same as bg to open-kpi
                //so teh end tooltip doesnt show thru
                .attr("fill", styles.hitbox.fill)
                .attr("stroke", styles.hitbox.stroke)
                .attr("stroke-width", styles.hitbox.strokeWidth)
                .attr("opacity", styles.hitbox.opacity)
                .attr("stroke-opacity", styles.hitbox.strokeOpacity)

            //dragtext
            tooltipG.select("text.drag-value")
                .attr("y", -contentsHeight/2 - 3)
                .attr("fill", styles.text.stroke)
                .attr("stroke", styles.text.stroke)
                .attr("stroke-width", 0.1)
                .attr("font-size", dragTextHeight)
                .attr("display", draggable && d.withDragValueAbove && isNumber(getValue(d)) ? null : "none")
                .text(`${getValue(d)}${d.unit || ""}`)

            //tooltip settings
            const isSmall = mainContentsHeight < 10
            const iconObject = isSmall ? (d.smallIcons || d.icons) : d.icons;
            //icon is first selected by status, and if no status, then by isAchieved 
            const icon = d.status ? iconObject[d.status] : (isAchieved(d) ? iconObject?.achieved : iconObject?.notAchieved);
            const shouldShowValue = isNumber(getValue(d)) && d.withInnerValue && !isSmall && (!isAchieved(d) || hovered === d.key) && !beingDragged(d);

            const mainContentsG = tooltipG.select("g.main-contents")
                .attr("transform", `translate(0, ${dragTextHeight/2})`)
                //why is this /2 in the line above? need to go over all dimns for tooltips,

            //icon
            const iconData = icon ? [1] : [];
            const iconG = mainContentsG.selectAll("g.icon").data(iconData);
            iconG.enter()
                .append("g")
                    .attr("class", "icon")
                    .merge(iconG)
                    .each(function(){
                        //if(d.key === "expected" && d.milestoneId === "current" && d.progBarKey === "pressUps-reps"){}
                        //todo - make the tooltips with and height based on iconAspect ratio
                        const iconG = d3.select(this)
                            .attr("transform", iconTranslate(icon.width, icon.height, contentsWidth, mainContentsHeight));

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

                    });

            iconG.exit().remove();

            //text
            // problem - this gets added mid-drag, so it doesnt have its opacity set to 0
            const valueText = mainContentsG.selectAll("text.value").data(shouldShowValue ? [1] : [])
            valueText.enter()
                .append("text")
                    .attr("class", "value")
                    .call(fadeIn)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "central")
                    .merge(valueText)
                    .attr("y", d.key === "expected" ? -contentsWidth * 0.05 : 0)
                    //temp - use width, not contentsW, so all tooltip fonts the same
                    .attr("font-size", d.unit ? fontSize * 0.9 : fontSize)
                    .attr("fill", styles.text.stroke)
                    .attr("stroke", styles.text.stroke)
                    .attr("stroke-width", 0.1)
                    .text(`${getValue(d)}${d.unit || ""}`)

            valueText.exit().remove();//need to also transition icon changes.call(remove)


            //text-below
            tooltipG.select("text.subtext")
                .attr("display", getSubtext(d,i) ? null : "none")
                .attr("y", contentsHeight/2)
                .attr("fill", styles.subtext.stroke)
                .attr("stroke", styles.subtext.stroke)
                .attr("stroke-width", 0.1)
                .attr("font-size", subtextHeight * 0.85)
                .text(getSubtext(d,i))
        })                    
    }

    //const titleWrap = textWrap();
    
    function tooltips(selection, options={}) {
        //console.log("tooltips update sel.data()", selection.data())
        //specific tooltip updates
        selection.each(function(data,i){
            //console.log("data", data)
            const tooltipDimns = _tooltipDimns(data, i);
            const styles = _styles(data,i);
            const containerG = d3.select(this);
                //.attr("pointer-events", "none");
            
            //enter
            if(containerG.select("*").empty()){ 
                //console.log("enter.......", i)
                enter();
            }

            update();

            function enter() {
                //const containerG = d3.select(this);

                containerG
                    .style("opacity", 0)
                    .transition()
                        .duration(MED_SLIDE_DURATION)
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
                    if(isAchieved(d)){ d3.select(this).select("text.drag-value").call(showText, 2000); }
                    onClick.call(this, e, d)
                }

                function handleMouseover(e,d){
                    //dont need to show value if not achieved as its showing anyway
                    if(isAchieved(d)){ d3.select(this).select("text.drag-value").call(showText, 2000); }
                }

                function showText(text, expiryTime){
                    if(!text.attr("class").includes("transitioning") && text.style("opacity") !== 1) {
                        text
                            .classed("transitioning", true)
                            .transition()
                            .duration(MED_FADE_DURATION)
                                .style("opacity", 1)
                                .on("end", function(){
                                    if(!expiryTime) { return; }
                                    d3.timeout(() => {
                                        d3.select(this).call(hideText)
                                    }, expiryTime)
                                })
                    }

                }
                function hideText(text){
                    text
                        .classed("transitioning", true)
                        .transition()
                        .duration(MED_FADE_DURATION)
                            .style("opacity", 0)
                            .on("end", function(){
                                d3.select(this).classed("transitioning", false);
                            })
                }

                function dragStart(e,d){
                    d3.select(this).raise();
                    if(!d.editable) { 
                        if(d.key === "expected"){
                            alert("The expected value can't be changed. It is calculated based on your target.")
                            return;
                        }
                        if(d.key === "target"){
                            //must be a past card
                            alert("You can only change future targets. This card is in the past.")

                        }
                        return; }
                    beingDragged = t => t.progBarKey === d.progBarKey && t.key === d.key;
                    if(d.withDragValueAbove){
                        d3.select(this).select("text.drag-value")
                            .transition()
                            .duration(MED_FADE_DURATION)
                                .style("opacity", 1)

                        d3.select(this).select("g.icon").select("text.value")
                            .style("opacity", 1)
                            .transition()
                            .duration(MED_FADE_DURATION)
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
                    //save option
                    /*
                    d3.select(this).select("text.drag-value")
                        .transition()
                        .duration(MED_FADE_DURATION )
                            .style("opacity", 0);
                    
                    d3.select(this).select("g.icon").select("text.value")
                        .transition()
                        .duration(MED_FADE_DURATION )
                            .style("opacity", 1);*/

                    //store the values as 'unsaved'
                    onDragEnd.call(this, e, d)
                    //make sure target is on top as expected may have been dragged and hence raised
                    const targetTooltipG = d3.select(this.parentNode).select("g.tooltip-target");
                    if(targetTooltipG){ targetTooltipG.raise(); }
                    d3.select(this.parentNode).selectAll("g.tooltip").call(updateTooltip, tooltipDimns); 
                }

                containerG.select("rect.tooltips-bg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("fill", "none");

                const tooltipG = containerG.selectAll("g.tooltip").data(data, d => d.key);
                tooltipG.enter()
                    .append("g")
                        .attr("class", "tooltip")
                        .style("cursor", "pointer")
                        .each(function(d,i){
                            d3.select(this).append("rect").attr("class", "tooltip-bg")
                            d3.select(this).append("text").attr("class", "drag-value")
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "auto")
                                .style("opacity", 0); //starts hidden

                            d3.select(this).append("g").attr("class", "main-contents")

                            d3.select(this).append("text").attr("class", "subtext")
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central");
                            //hitbox must be on top, as contents under it will change              
                            d3.select(this).append("rect").attr("class", "hitbox");
                        })
                        .attr("transform", (d,j) => `translate(${getX(d, i, j)}, ${getY(d, i, j)})`)
                        .merge(tooltipG)
                        /*.style("display", d => {
                            if(d.key === "end")
                            console.log("shouldDisp?", d)
                            //d.shouldDisplay(status, editing, displayFormat) ? null : "none"
                        })*/
                        //i is the data's i, not the tooltip datum's i
                        .call(updateTransform, { x: (d,j) => getX(d, i, j), y: (d,j) => getY(d, i, j), transition:{ duration:MED_SLIDE_DURATION } })
                        .call(updateTooltip, tooltipDimns)
                        .call(drag)
                        .on("mouseover", handleMouseover);

                tooltipG.exit().remove();
            }
        })

        return selection;

        function updateTransform(selection, options={}){
            //console.log("updateTransform-----------------------")
            const { x = d => d.x, y = d => d.y, transition, cb = () => {} } = options;
            selection.each(function(d, i){
                const { translateX, translateY } = getTransformationFromTrans(d3.select(this).attr("transform"));
                if(Math.abs(translateX - x(d, i)) < 0.001 && Math.abs(translateY - y(d, i)) < 0.001){
                    //already where it needs to be
                    return;
                }
                if(d3.select(this).attr("class").includes("transitioning")){
                    //already in transition - so we ignore the new request
                    return;
                }
                if(transition){
                    d3.select(this)
                        .classed("transitioning", true)
                        .transition()
                        .ease(transition.ease || d3.easeLinear)
                        .delay(transition.delay || null)
                        .duration(transition.duration || MED_SLIDE_DURATION)
                            .attr("transform", "translate("+x(d, i) +"," +y(d, i) +")")
                            .on("end", function(d,i){
                                d3.select(this).classed("transitioning", false);
                                cb.call(this, d, i);
                            });
                }else{
                    d3.select(this)
                        .attr("transform", "translate("+x(d, i) +"," +y(d, i) +")");
                    
                    cb.call(this);
                }
            })
        }
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
                bg:{ ...defaultStyles.bg, ...requiredStyles.bg },
                text:{ ...defaultStyles.text, ...requiredStyles.text },
                subtext:{ ...defaultStyles.subtext, ...requiredStyles.subtext },
                hitbox:{ ...defaultStyles.hitbox, ...requiredStyles.hitbox }
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
    tooltips.getSubtext = function (value) {
        if (!arguments.length) { return getSubtext; }
        getSubtext = value;
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
    tooltips.onSaveValue = function (value) {
        if (!arguments.length) { return onSaveValue; }
        if(typeof value === "function"){
            onSaveValue = value;
        }
        return tooltips;
    };
    tooltips.updateTooltip = updateTooltip;
    
    return tooltips;
}
