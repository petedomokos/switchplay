import * as d3 from 'd3';
import { DIMNS, grey10 } from "./constants";
import dragEnhancements from './enhancedDragHandler';
// import menuComponent from './menuComponent';
import profileInfoComponent from './profileInfoComponent';
import kpisComponent from './kpis/kpisComponent';
import { Oscillator } from './domHelpers';
import { getTransformationFromTrans } from './helpers';
const noop = () => {};
/*

*/
export default function profileCardsComponent() {
    //API SETTINGS
    // dimensions
    let width = DIMNS.profile.width;
    let height = DIMNS.profile.height;
    let margin = { top:0, bottom: 0, left:0, right:0 }
    let contentsWidth;
    let contentsHeight;

    let infoHeight;
    let kpisHeight;

    let kpiHeight;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
        infoHeight = contentsHeight/2;
        kpisHeight = contentsHeight/2;
    }

    let fontSizes = {
        info:{
            name:9,
            age:11,
            position:8
        },
        kpis:{
            name:9,
            values:9,
            ctrls:8
        }
    };

    let topRightCtrls = d => [];

    //state
    let expanded = [];
    let selected;
    let editable = false;
    let movable = true;
    let scrollable = false;

    let transformTransition = { enter: null, update: null };

    let xScale = x => 0;
    let xKey = "date";
    let yScale = x => 0;
    let yKey = "yPC";
    let calcX = d => typeof d.x === "number" ? d.x : xScale(d[xKey]);
    let calcY = d => typeof d.y === "number" ? d.y : yScale(d[yKey]);

    //API CALLBACKS
    let onClick = function(){};
    let onCtrlClick = () => {};
    let onClickKpi = () => {};
    let onDblClickKpi = function(){};

    let onDblClick = function(){};
    let onDragStart = function() {};
    let onDrag = function() {};
    let onDragEnd = function() {};
    let onLongpressStart = function() {};
    let onLongpressDragged = function() {};
    let onLongpressEnd = function() {};
    let onMouseover = function(){};
    let onMouseout = function(){};
    let onDelete = function() {};
    

    let enhancedDrag = dragEnhancements();
    //@todo - find out why k=1.05 makes such a big increase in size
    let oscillator = Oscillator({k:1});

    let longpressed;

    //dom
    let containerG;

    //components
    let profileInfoComponents = {};
    let kpisComponents = {};


    function profileCards(selection, options={}) {
        //console.log("update profCards expanded", expanded)
        const { transitionEnter=true, transitionUpdate=true, log=false } = options;
        // expression elements
        selection.each(function (data) {
            updateDimns();
            //plan - dont update dom twice for name form
            //or have a transitionInProgress flag
            containerG = d3.select(this);
            //can use same enhancements object for outer and inner as click is same for both
            enhancedDrag
                .onDblClick(onDblClick)
                .onClick(onClick)
                .onLongpressStart(longpressStart)
                .onLongpressDragged(longpressDragged)
                .onLongpressEnd(longpressEnd);

            const drag = editable ? () => {} : d3.drag()
                .on("start", enhancedDrag(dragStart))
                .on("drag", enhancedDrag(dragged))
                .on("end", enhancedDrag(dragEnd))
                /*.container(function(){
                    console.log("this p p", this.parentNode.parentNode.parentNode)
                    return this.parentNode.parentNode.parentNode
                });*/ 

            const profileCardG = containerG.selectAll("g.profile-card").data(data, d => d.id);
            profileCardG.enter()
                .append("g")
                .attr("class", d => "milestone profile-card profile-card-"+d.id)
                .each(function(d,i){
                    profileInfoComponents[d.id] = profileInfoComponent();
                    kpisComponents[d.id] = kpisComponent();
                    // console.log("entering card", d)
                    //ENTER
                    const contentsG = d3.select(this)
                        .append("g")
                        .attr("class", "contents profile-card-contents")

                    //bg rect
                    contentsG
                        .append("rect")
                            .attr("class", "bg")
                            .attr("rx", 3)
                            .attr("ry", 3)
                            .attr("fill", d.isCurrent ? grey10(1) :grey10(2))
                            //.attr("stroke", "red")
                            //.attr("stroke-width", 5);

                    contentsG.append("g").attr("class", "info")
                    contentsG.append("g").attr("class", "kpis")

                    contentsG.append("g").attr("class", "top-right-ctrls")
                
                })
                .style("cursor", editable ? "default" : "grab")
                //.call(transform, { x: d => d.x, y:d => d.y }, transitionEnter && transitionsOn)
                .call(updateTransform, { 
                    x:calcX, 
                    y:calcY, 
                    scale:d => expanded.find(m => m.id === d.id)?.k || 1,
                    transition:transformTransition.enter 
                })
                .merge(profileCardG)
                // .on("click", () => { console.log("prof card click native")})
                //.call(drag)
                .call(updateTransform, { 
                    x:calcX, 
                    y:calcY,
                    scale:d => expanded.find(m => m.id === d.id)?.k || 1,
                    transition:transformTransition.update 
                })
                .each(function(d){
                    const profileInfo = profileInfoComponents[d.id]
                        .width(contentsWidth)
                        .height(infoHeight)
                        .fontSizes(fontSizes.info)
                        .editable(editable);

                    const kpis = kpisComponents[d.id]
                        .width(contentsWidth)
                        .height(kpisHeight)
                        .kpiHeight(kpiHeight) //may be undefined
                        .fontSizes(fontSizes.kpis)
                        .editable(editable)
                        .scrollable(scrollable)
                        .onCtrlClick(onCtrlClick)
                        //pass scroll events on any kpiComponent to all other kpiComponents
                        .onZoomStart(function(e){
                            data.filter(p => p.id !== d.id).forEach(p => {
                                kpisComponents[p.id].handleZoomStart.call(this, e)
                           })
                        })
                        .onZoom(function(e){
                            data.filter(p => p.id !== d.id).forEach((p,i) => {
                                kpisComponents[p.id].handleZoom.call(this, e, i)
                           })
                        })
                        .onZoomEnd(function(e){
                            data.filter(p => p.id !== d.id).forEach(p => {
                                kpisComponents[p.id].handleZoomEnd.call(this, e)
                           })
                        })
                        /*
                        .onClickKpi((e,kpi) => {
                            console.log("profileCrad kpi.onClickKpi---")
                            //update selected KPI in all profile cards
                            data.filter(p => p.id !== d.id).forEach(p => {
                                //must sway the profile id from the key
                                const keyParts = kpi.key.split("-");
                                const keyWithoutProfileId = keyParts.slice(0, keyParts.length - 1).join("-");
                                const kpiKeyInThisProfile = `${keyWithoutProfileId}-${p.id}`
                                kpisComponents[p.id].selected(kpiKeyInThisProfile, true, true);
                            })
                        })*/
                        .onDblClickKpi(onDblClickKpi);

                    //ENTER AND UPDATE
                    const contentsG = d3.select(this).select("g.contents")
                        .attr("transform", d =>  `translate(${-contentsWidth/2},${-contentsHeight/2})`)

                    //rect sizes
                    contentsG.selectAll("rect.bg")
                        .attr("width", contentsWidth)
                        .attr("height", contentsHeight)
                        //.attr("stroke", "none")// d.isMilestone ? grey10(1) : "none")
                   
                    // why is this too far down
                    contentsG.selectAll("g.info")
                        .datum({ ...d.info, date:d.date })
                        .call(profileInfo)
                    
                    contentsG.selectAll("g.kpis")
                        .attr("transform", "translate(0," +(contentsHeight/2) +")")
                        .datum(d.kpis)
                        .call(kpis);

                    //top right ctrls (dependent on each card)
                    let btnWidth = 25;
                    let btnHeight = 25;

                    const topRightBtnG = contentsG.select("g.top-right-ctrls")
                        .attr("transform", `translate(${contentsWidth * 0.98}, ${contentsHeight * 0.02})`)
                        .selectAll("g.top-right-btn")
                        .data(topRightCtrls(d), b => b.label)
                    
                    topRightBtnG.enter()
                        .append("g")
                            .attr("class", "top-right-btn")
                            .each(function(){
                                d3.select(this)
                                    .append("rect")
                                        .attr("fill", "transparent");

                                d3.select(this)
                                    .append("path")
                                        .attr("fill", grey10(3))
                                        .attr("stroke", grey10(3))
                            })
                            .merge(topRightBtnG)
                            .attr("transform", (b,i) => `translate(${-(i + 1) * btnWidth})`)
                            .each(function(b){
                                d3.select(this).select("rect")
                                    .attr("width", btnWidth)
                                    .attr("height", btnHeight)

                                d3.select(this).select("path")
                                    .attr("d", b.icon.d)
                            })
                            .style("cursor", "pointer")
                            .on("click",(e,b) => { if(b.onClick){ b.onClick(b)} })
                            .on("mouseover", (e,b) => { if(b.onMouseover){ b.onMouseover(b)} })
                            .on("mouseout", (e,b) => { if(b.onMouseout){ b.onMouseout(b)} })

                    topRightBtnG.exit().remove();
                    //targ
                    /*
                    let kpiData = [];
                    //getting error when doing this
                    if(selectedMeasureIsInGoal(d)){
                        const planetMeasureData = d.measures.find(m => m.id === selectedMeasure.id);
                        targData.push({ ...selectedMeasure, ...planetMeasureData });
                    }

                    const kpiG = contentsG.selectAll("g.kpi").data(kpiData)
                    kpiG.enter()
                        .append("g")
                            .attr("class", "kpi")
                            .each(function(measure){
                                d3.select(this)
                                    .append("text")
                                        .attr("text-anchor", "middle")
                                        .attr("dominant-baseline", "middle")
                                        .style("pointer-events", "none")
                            })
                            .merge(kpiG)
                            .attr("transform", "translate(0, " +d.ry(height)/2 +")")
                            .each(function(m){
                                d3.select(this).select("text")
                                    .attr("opacity", !selectedMeasure || selectedMeasureIsInGoal(d) ? planetOpacity.normal : planetOpacity.unavailable)
                                    .style("font-size", fontSize * 1.2)
                                    //.attr("stroke-width", 0.5)
                                    .attr("fill", "white")
                                    //.attr("stroke", COLOURS.selectedMeasure)
                                    .text("target "+(typeof m.targ === "number" ? m.targ : "not set"))

                            })
                            
                    kpiG.exit().remove();
                    */
                            
                })
                //.call(updateHighlighted)
                //.call(drag)
                .each(function(d){

                })

            function updateTransform(selection, options={}){
                //console.log("updateTransform profileCards", options.transition)
                const { x = d => d.x, y = d => d.y, scale = d => 1, transition, cb = () => {} } = options;
                selection.each(function(d){
                    if(transition){
                        d3.select(this)
                            .transition()
                            .duration(200)
                                .attr("transform", `translate(${x(d)} , ${y(d)}) scale(${scale(d)})`)
                                .on("end", cb);
                    }else{
                        d3.select(this)
                            .attr("transform", `translate(${x(d)} , ${y(d)}) scale(${scale(d)})`);
                        
                        cb.call(this);
                    }
                })
            }

            function updatePosition(selection, options={}){
                //console.log("uRD options", options)
                const { x = d => d.x || 0, y = d => d.y || 0, transition, cb = () => {} } = options;
                selection.each(function(d){
                    if(transition){
                        d3.select(this)
                            .transition()
                            .duration(200)
                                .attr("x", x(d))
                                .on("end", cb);
                    }else{
                        d3.select(this)
                            .attr("transform", y(d));
                        
                        cb.call(this);
                    }
                })
            }
                /*
            function transform(selection, transform={}, transition){
                const { x = d => 0, y = d => 0, k = d => 1 } = transform;
                selection.each(function(d){
                    const planetG = d3.select(this);
                    //translate is undefined when we drag a planet into an aim and release
                    const { translateX, translateY } = getTransformationFromTrans(planetG.attr("transform"));
                    //on call from enter, there will be no translate so deltas are 0 so no transition
                    //but then transform is called again on entered profileCards after merge with update
                    const deltaX = translateX ? Math.abs(translateX - x(d)) : 0;
                    const deltaY = translateY ? Math.abs(translateY - y(d)) : 0;
                    if(transition && (deltaX > 0.1 || deltaY > 0.1)){
                        planetG
                            .transition()
                                .delay(transition.delay || 0)
                                .duration(transition.duration || 200)
                                .attr("transform", "translate("+x(d) +"," +y(d) +") scale("+k(d) +")");

                    }else{
                        planetG.attr("transform", "translate("+x(d) +"," +y(d) +") scale("+k(d) +")");
                    }
                })
            }
            */

            //EXIT
            profileCardG.exit().each(function(d){
                //will be multiple exits because of the delay in removing
                if(!d3.select(this).attr("class").includes("exiting")){
                    d3.select(this)
                        .classed("exiting", true)
                        .transition()
                            .duration(200)
                            .attr("opacity", 0)
                            .on("end", function() { d3.select(this).remove(); });
                }
            })

            function dragStart(e , d){
                if(movable){
                    d3.select(this).raise();
                }
                onDragStart.call(this, e, d)
            }
            function dragged(e , d){
                //controlled components
                if(movable){
                    const { translateX, translateY } = getTransformationFromTrans(d3.select(this).attr("transform"));
                    d3.select(this)
                        .attr("transform", "translate(" + (translateX +e.dx) +"," + (translateY + e.dy) +")")
                        //.call(updateTransform, { x: d => d.displayX })
                }
        
                //onDrag does nothing
                onDrag.call(this, e, d)
            }
    
            //note: newX and Y should be stored as d.x and d.y
            function dragEnd(e, d){
                //console.log("dragEnd", d.x)
                //on next update, we want aim dimns/pos to transition
                //shouldTransitionAim = true;
    
                if(enhancedDrag.isClick()) { return; }
    
                onDragEnd.call(this, e, d);
            }

            //DELETION
            let deleted = false;
            const svg = d3.select("svg");

            //longpress
            function longpressStart(e, d) {
                console.log("lp start")
                //todo - check defs appended, and use them here, then longopressDrag should trigger the delete of a goal
                //then do same for aims and links
                /*
                svg.select("defs").select("filter").select("feDropShadow")
                    .attr("flood-opacity", 0.6)
                    .attr("stdDeviation", 10)
                    .attr("dy", 10);
                */

                d3.select(this).select("rect.bg")
                    //.style("filter", "url(#drop-shadow)")
                    .call(oscillator.start);

                longpressed = d;
                containerG.call(profileCards);

                onLongpressStart.call(this, e, d)
            };
            function longpressDragged(e, d) {
                if(deleted) { return; }

                if(enhancedDrag.distanceDragged() > 200 && enhancedDrag.avgSpeed() > 0.08){
                    d3.select(this)
                        //.style("filter", "url(#drop-shadow)")
                        .call(oscillator.stop);

                    deleted = true;
                    d3.select(this)
                        .transition()
                        .duration(50)
                            .attr("opacity", 0)
                            .on("end", () => {
                                onDelete(d.id)
                            })
                }else{
                    dragged.call(this, e, d)
                }

                onLongpressDragged.call(this, e, d)
            };

            function longpressEnd(e, d) {
                if(deleted){ 
                    deleted = false;
                    return; 
                }
                /*
                svg.select("defs").select("filter").select("feDropShadow")
                    .transition("filter-transition")
                    .duration(300)
                        .attr("flood-opacity", 0)
                        .attr("stdDeviation", 0)
                        .attr("dy", 0)
                        .on("end", () => {
                            d3.select(this).style("filter", null);
                        });*/

                d3.select(this)
                    //.style("filter", "url(#drop-shadow)")
                    .call(oscillator.stop);
                
                onLongpressEnd.call(this, e, d)
            };
        })
        //remove one-off settings
        longpressed = null;

        return selection;
    }
    
    //api
    profileCards.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return profileCards;
    };
    profileCards.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return profileCards;
    };
    profileCards.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = value;
        return profileCards;
    };
    profileCards.kpiHeight = function (value) {
        if (!arguments.length) { return fixedKpiHeight; }
        kpiHeight = value;
        return profileCards;
    };
    profileCards.fontSizes = function (values) {
        if (!arguments.length) { return fontSizes; }
        fontSizes = { ...fontSizes, ...values };
        return profileCards;
    };
    profileCards.expanded = function (value) {
        if (!arguments.length) { return expanded; }
        expanded = value;
        return profileCards;
    };
    profileCards.editable = function (value) {
        if (!arguments.length) { return editable; }
        editable = value;
        return profileCards;
    };
    profileCards.scrollable = function (value) {
        if (!arguments.length) { return scrollable; }
        scrollable = value;
        return profileCards;
    };
    profileCards.movable = function (value) {
        if (!arguments.length) { return movable; }
        movable = value;
        return profileCards;
    };
    profileCards.selected = function (value) {
        if (!arguments.length) { return selected; }
        selected = value;
        return profileCards;
    };
    profileCards.topRightCtrls = function (value) {
        if (!arguments.length) { return topRightCtrls; }
        topRightCtrls = value;
        return profileCards;
    };
    profileCards.longpressed = function (value) {
        if (!arguments.length) { return longpressed; }
        longpressed = value;
        return profileCards;
    };
    profileCards.transformTransition = function (value) {
        if (!arguments.length) { return transformTransition; }
        //console.log("setting trans...", value)
        transformTransition = { 
            enter:value.enter,// || transformTransition.enter,
            update:value.update// || transformTransition.update
        }
        //console.log("Trans is now", transformTransition)
        return profileCards;
    };
    profileCards.yScale = function (value, key) {
        if (!arguments.length) { return yScale; }
        yScale = value;
        if(key) { yKey = key; }
        calcY = y => typeof d.y === "number" ? d.y : yScale(d[yKey]);

        return profileCards;
    };
    profileCards.xScale = function (value, key) {
        if (!arguments.length) { return xScale; }
        xScale = value;
        if(key) { xKey = key; }
        calcX = x => typeof d.x === "number" ? d.x : xScale(d[xKey]);

        return profileCards;
    };
    profileCards.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return profileCards;
    };
    profileCards.onClickKpi = function (value) {
        if (!arguments.length) { return onClickKpi; }
        if(typeof value === "function"){
            onClickKpi = value;
        }
        return profileCards;
    };
    profileCards.onDblClickKpi = function (value) {
        if (!arguments.length) { return onDblClickKpi; }
        onDblClickKpi = value;
        return profileCards;
    };
    profileCards.onCtrlClick = function (value) {
        if (!arguments.length) { return onCtrlClick; }
        onCtrlClick = value;
        return profileCards;
    };
    profileCards.onDblClick = function (value) {
        if (!arguments.length) { return onDblClick; }
        onDblClick = value;
        return profileCards;
    };
    profileCards.onDragStart = function (value) {
        if (!arguments.length) { return onDragStart; }
        if(typeof value === "function"){
            onDragStart = value;
        }
        return profileCards;
    };
    profileCards.onDrag = function (value) {
        if (!arguments.length) { return onDrag; }
        if(typeof value === "function"){
            onDrag = value;
        }
        return profileCards;
    };
    profileCards.onDragEnd = function (value) {
        if (!arguments.length) { return onDragEnd; }
        if(typeof value === "function"){
            onDragEnd = value;
        }
        return profileCards;
    };
    profileCards.onLongpressStart = function (value) {
        if (!arguments.length) { return onLongpressStart; }
        if(typeof value === "function"){
            onLongpressStart = value;
        }
        return profileCards;
    };
    profileCards.onLongpressDragged = function (value) {
        if (!arguments.length) { return onLongpressDragged; }
        if(typeof value === "function"){
            onLongpressDragged = value;
        }
        return profileCards;
    };
    profileCards.onLongpressEnd = function (value) {
        if (!arguments.length) { return onLongpressEnd; }
        if(typeof value === "function"){
            onLongpressEnd = value;
        }
        return profileCards;
    };
    profileCards.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return profileCards;
    };
    profileCards.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return profileCards;
    };
    profileCards.onDelete = function (value) {
        if (!arguments.length) { return onDelete; }
        if(typeof value === "function"){
            onDelete = value;
        }
        return profileCards;
    };
    profileCards.onAddLink = function (value) {
        if (!arguments.length) { return onAddLink; }
        if(typeof value === "function"){ onAddLink = value; }
        return profileCards;
    };
    return profileCards;
}
