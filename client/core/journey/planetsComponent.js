import * as d3 from 'd3';
//import "d3-selection-multi";
import { calcAdjX, findPointChannel, findDateChannel, findNearestChannelByEndDate, getTransformationFromTrans } from './helpers';
//import { ellipse } from "./ellipse";
import { grey10, COLOURS, DIMNS, AVAILABLE_GOAL_MULTIPLIER } from "./constants";
import { findNearestPlanet, distanceBetweenPoints, channelContainsPoint, channelContainsDate } from './geometryHelpers';
import dragEnhancements from './enhancedDragHandler';
import menuComponent from './menuComponent';
import { Oscillator } from './domHelpers';
/*

*/
export default function planetsComponent() {
    //API SETTINGS
    let transitionsOn = true;
    // dimensions
    let width = DIMNS.planet.width;
    let height = DIMNS.planet.height;

    let fontSize = 9;

    let timeScale = x => 0;
    let yScale = x => 0;

    let selected;
    let selectedMeasure;
    let selectedMeasureIsInGoal = goal => false;

    let prevData = [];
    let linksData = [];
    let channelsData;
    //let trueX = x => x;
    let adjX = x => x;
    let pointChannel = () => {};
    let dateChannel = () => {};
    let nearestChannelByEndDate = () => {};

    let withRing = true;
    let highlighted = [];
    const bgColour = COLOURS.canvas;
    //contents to show can be none, nameOnly, targOnly, "basic", "all"
    let contentsToShow = goal => "basic";

    let colours = {
        planet:COLOURS.planet
    }

    const planetOpacity = {
        normal: 0.7,
        available: 0.3,
        //unavailable: 0.2
    }
    let availablePlanetSizeMultiplier = AVAILABLE_GOAL_MULTIPLIER;

    //API FUNCTIONS
    let showAvailabilityStatus = function() {};
    let stopShowingAvailabilityStatus = function() {};

    //API CALLBACKS
    let onDblClick = function(){};
    let onDragStart = function() {};
    let onDrag = function() {};
    let onDragEnd = function() {};
    let onLongpressStart = function() {};
    let onLongpressDragged = function() {};
    let onLongpressEnd = function() {};


    let onMouseover = function(){};
    let onMouseout = function(){};

    let createPlanet = function(){};
    let updatePlanet = function(){};
    let startEditPlanet = function(){};
    let convertToAim = function(){};
    let deletePlanet = function(){};
    let onAddLink = function(){};

    function updateChannelsData(newChannelsData){
        channelsData = newChannelsData;
        //trueX = calcTrueX(channelsData);
        adjX = calcAdjX(channelsData);
        pointChannel = findPointChannel(channelsData);
        dateChannel = findDateChannel(channelsData);
        nearestChannelByEndDate = findNearestChannelByEndDate(channelsData);
    }

    //api


    let enhancedDrag = dragEnhancements();
    //@todo - find out why k=1.05 makes such a big increase in size
    let oscillator = Oscillator({k:1});

    //components
    //const ring = ellipse().className("ring");
    let menus = {};
    let menuOptions = (d) => {
        const basicOpts = [
            //{ key: "edit", label:"Edit" },
            { key: "delete", label:"Delete" }
        ]
        return basicOpts;//d.aimId !== "main" ? basicOpts: [ { key: "aim", label:"Make Aim" }, ...basicOpts ];
         //put goals on planet, and only show it in bar chart when it is 
        //also on src planet. BUT it does mean we need to also put it on src. Could have a goals library, or just use the dataset library (1 goal per dataset for now)
    };

    //state
    let prevClickedGoal;
    let timer;

    //dom
    let containerG;

    function planets(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;
        // expression elements
        selection.each(function (data) {
            //console.log("planets..........", transitionsOn)
            //plan - dont update dom twice for name form
            //or have a transitionInProgress flag
            containerG = d3.select(this);
            //can use same enhancements object for outer and inner as click is same for both
            enhancedDrag
                .onDblClick(onDblClick)
                .onClick(handleClick)
                .onLongpressStart(longpressStart)
                .onLongpressDragged(longpressDragged)
                .onLongpressEnd(longpressEnd);

            const planetDrag = d3.drag()
                .on("start", enhancedDrag(onDragStart))
                .on("drag", enhancedDrag(onDrag))
                .on("end", enhancedDrag(function(e,d){
                    if(enhancedDrag.isClick() || enhancedDrag.isDblClick()) { 
                        return; 
                    }
                    onDragEnd.call(this, e, d);
                }));

            const planetG = containerG.selectAll("g.planet").data(data, d => d.id);
            planetG.enter()
                .append("g")
                .attr("class", d => "planet planet-"+d.id)
                .attr("id", d => "planet-"+d.id)
                .each(function(d,i){
                    //console.log("entering", d)
                    //ENTER
                    const contentsG = d3.select(this)
                        .append("g")
                        .attr("class", "contents")

                    //bg ellipse (stops elements under it showing through when opacity < 1)
                    contentsG
                        .append("ellipse")
                            .attr("class", "core core-inner bg solid-bg")
                            .attr("fill", bgColour);

                    contentsG
                        .append("ellipse")
                            .attr("class", "core core-inner visible")
                            .attr("stroke-width", 2)
                            .attr("cursor", "pointer")
                    
                    //title text
                    contentsG
                        .append("text")
                        .attr("class", "title")
                        .attr("text-anchor", "middle")
                        .attr("dominant-baseline", "middle")
                        .style("pointer-events", "none")
                    
                    //menu component
                    menus[d.id] = menuComponent();
                
                })
                //we call both transitions for enter separate to update. This allows us to 
                //specify when we want the entered nodes to transition. We dont want that to 
                //occur when loading a pre-existing canvas. In that case, the first call below
                //will have no effect because transitionEnter=false in the 2nd call
                .call(transform, { x: d => adjX(timeScale(d.targetDate)), y:d => d.y })
                .call(transform, { x: d => d.x, y:d => d.y }, transitionEnter && transitionsOn)
                .merge(planetG)
                .attr("opacity", 1)
                .each(function(d){
                    //ENTER AND UPDATE
                    const contentsG = d3.select(this).select("g.contents")

                    //for now, we assume all contents are text, and dont btoher with transition.
                    //so to turn off contents, set display to none
                    contentsG.selectAll("text").attr("display", contentsToShow(d) === "none" ? "none" : null);

                    //ellipse sizes
                    contentsG.selectAll("ellipse.core-inner")
                        .attr("rx", d.rx(width))
                        .attr("ry", d.ry(height))
                        .attr("stroke", "none")// d.isMilestone ? grey10(1) : "none")

                    //ellipse fills and opacities
                    contentsG.select("ellipse.core-inner.visible")
                        //@todo - add transition to this opacity change
                        .attr("opacity", !selectedMeasure || selectedMeasureIsInGoal(d) ? planetOpacity.normal : planetOpacity.available)
                        .attr("fill", prevClickedGoal?.id === d.id ? COLOURS.potentialLinkPlanet : d.fill)
                   
                    //title
                    contentsG.select("text.title")
                        .attr("opacity", !selectedMeasure || selectedMeasureIsInGoal(d) ? planetOpacity.normal : planetOpacity.available)
                        .attr("font-size", fontSize)
                        .text(d.name || d.id.slice(-1))
                        //.text(d.name || "enter name")

                    //targ
                    let targData = [];
                    //getting error when doing this
                    if(selectedMeasureIsInGoal(d)){
                        const planetMeasureData = d.measures.find(m => m.id === selectedMeasure.id);
                        targData.push({ ...selectedMeasure, ...planetMeasureData });
                    }

                    const targG = contentsG.selectAll("g.targ").data(targData)
                    targG.enter()
                        .append("g")
                            .attr("class", "targ")
                            .each(function(measure){
                                d3.select(this)
                                    .append("text")
                                        .attr("text-anchor", "middle")
                                        .attr("dominant-baseline", "middle")
                                        .style("pointer-events", "none")
                            })
                            .merge(targG)
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
                            
                    targG.exit().remove();
                            
                })
                //.call(updateHighlighted)
                .call(planetDrag)
                .each(function(d){
                    //helper
                    //dont show menu if targOnly form open is if planet has the selectedMeasure on it
                    const showContextMenu = d => selected?.id === d.id;// && !d.measures.find(m => m.id === selectedMeasure?.id);
                    const menuG = d3.select(this).selectAll("g.menu").data(showContextMenu(d) ? [menuOptions(d)] : [], d => d.key);
                    const menuGEnter = menuG.enter()
                        .append("g")
                            .attr("class", "menu")
                            .attr("opacity", 1)
                            /*
                            .attr("opacity", 0)
                            .transition()
                                .duration(200)
                                .attr("opacity", 1);*/
                    
                    menuGEnter.merge(menuG)
                        .attr("transform", "translate(0," + (d.rx(width) * 0.8) +")")
                        .call(menus[d.id]
                            .onClick((opt) => {
                                switch(opt.key){
                                    case "delete": { 
                                        deletePlanet.call(this, d.id);
                                        break;
                                    };
                                    //for goals
                                    case "edit": { 
                                        startEditPlanet.call(this, d);
                                        break; 
                                    };
                                    case "aim": { 
                                        convertToAim.call(this, d);
                                        break; 
                                    };
                                    default:{};
                                }
                            }))

                    menuG.exit().each(function(d){
                        //will be multiple exits because of the delay in removing
                        if(!d3.select(this).attr("class").includes("exiting")){
                            d3.select(this)
                                .classed("exiting", true)
                                .transition()
                                    .duration(100)
                                    .attr("opacity", 0)
                                    .on("end", function() { d3.select(this).remove(); });
                        }
                    }) 
                })

            //update only
            planetG.call(transform, { x: d => d.x, y:d => d.y }, transitionUpdate)

            function transform(selection, transform={}, transition){
                const { x = d => 0, y = d => 0, k = d => 1 } = transform;
                selection.each(function(d){
                    const planetG = d3.select(this);
                    //translate is undefined when we drag a planet into an aim and release
                    const { translateX, translateY } = getTransformationFromTrans(planetG.attr("transform"));
                    //on call from enter, there will be no translate so deltas are 0 so no transition
                    //but then transform is called again on entered planets after merge with update
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

            //EXIT
            planetG.exit().each(function(d){
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

            function handleClick(e, d){
                const planetG = d3.select("g#planet-"+d.id);
                const ellipse = planetG.select("ellipse.core-inner.visible");
                
                if(prevClickedGoal?.id === d.id){
                    //treat same as a dbl-click
                    console.log("reset fill")
                    timer.stop();
                    timer = null;
                    ellipse.attr("fill", d.fill)
                    prevClickedGoal = null;
                    onDblClick.call(this, e, d);
                    return;
                }

                ellipse.attr("fill", COLOURS.potentialLinkPlanet);
                
                if(prevClickedGoal && prevClickedGoal.id !== d.id){
                    //create link
                    onAddLink({ src:prevClickedGoal.id, targ:d.id })
                }

                prevClickedGoal = d;
                if(timer) { timer.stop(); }
                timer = d3.timeout(() => {
                    d3.selectAll("g.planet")
                        .each(function(e,d){
                            d3.select(this).select("ellipse.core-inner.visible").attr("fill", d => d.fill);
                        })
                prevClickedGoal = null;
                }, 2000);

            }

            let linkPlanets = [];
            let deleted = false;

            //temp way to grab svg
            const svg = d3.select("svg");

            //longpress
            function longpressStart(e, d) {
                //console.log("e", e)
                //todo - check defs appended, and use them here, then longopressDrag should trigger the delete of a goal
                //then do same for aims and links
                /*
                svg.select("defs").select("filter").select("feDropShadow")
                    .attr("flood-opacity", 0.6)
                    .attr("stdDeviation", 10)
                    .attr("dy", 10);
                */

                d3.select(this)
                    //.style("filter", "url(#drop-shadow)")
                    .call(oscillator.start);

                // onLongpressStart.call(this, e, d)
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
                                deletePlanet(d.id)
                            })
                }else{
                    onDrag.call(this, e, d)
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
                
                // onLongpressEnd.call(this, e, d)
            };

            prevData = data;
        })

        return selection;
    }
    
    //api
    planets.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return planets;
    };
    planets.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return planets;
    };
    planets.selected = function (value) {
        if (!arguments.length) { return selected; }
        selected = value;
        return planets;
    };
    planets.selectedMeasure = function (value) {
        if (!arguments.length) { return selectedMeasure; }
        selectedMeasure = value;
        selectedMeasureIsInGoal = goal => selectedMeasure && goal.measures.find(m => m.id === selectedMeasure.id);
        return planets;
    };
    planets.transitionsOn = function (value) {
        if (!arguments.length) { return transitionsOn; }
        transitionsOn = value;
        return planets;
    }
    planets.withRing = function (value) {
        if (!arguments.length) { return withRing; }
        withRing = value;
        if(containerG){
            containerG.call(planets);
        }

        return planets;
    };
    planets.channelsData = function (value) {
        if (!arguments.length) { return channelsData; }
        updateChannelsData(value);
        return planets;
    };
    planets.linksData = function (value) {
        if (!arguments.length) { return linksData; }
        linksData = value;
        return planets;
    };
    planets.yScale = function (value) {
        if (!arguments.length) { return yScale; }
        yScale = value;
        return planets;
    };
    planets.fontSize = function (value) {
        if (!arguments.length) { return fontSize; }
        fontSize = value;
        return planets;
    };
    planets.availablePlanetSizeMultiplier = function (value) {
        if (!arguments.length) { return availablePlanetSizeMultiplier; }
        availablePlanetSizeMultiplier = value;
        return planets;
    };
    planets.contentsToShow = function (value) {
        if (!arguments.length) { return contentsToShow; }
        contentsToShow = value;
        return planets;
    };
    planets.timeScale = function (value) {
        if (!arguments.length) { return timeScale; }
        timeScale = value;
        return planets;
    };
    planets.onDblClick = function (value) {
        if (!arguments.length) { return onDblClick; }
        onDblClick = value;
        return planets;
    };
    planets.onDragStart = function (value) {
        if (!arguments.length) { return onDragStart; }
        if(typeof value === "function"){
            onDragStart = value;
        }
        return planets;
    };
    planets.onDrag = function (value) {
        if (!arguments.length) { return onDrag; }
        if(typeof value === "function"){
            onDrag = value;
        }
        return planets;
    };
    planets.onDragEnd = function (value) {
        if (!arguments.length) { return onDragEnd; }
        if(typeof value === "function"){
            onDragEnd = value;
        }
        return planets;
    };
    planets.onLongpressStart = function (value) {
        if (!arguments.length) { return onLongpressStart; }
        if(typeof value === "function"){
            onLongpressStart = value;
        }
        return planets;
    };
    planets.onLongpressDragged = function (value) {
        if (!arguments.length) { return onLongpressDragged; }
        if(typeof value === "function"){
            onLongpressDragged = value;
        }
        return planets;
    };
    planets.onLongpressEnd = function (value) {
        if (!arguments.length) { return onLongpressEnd; }
        if(typeof value === "function"){
            onLongpressEnd = value;
        }
        return planets;
    };
    planets.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return planets;
    };
    planets.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return planets;
    };
    planets.createPlanet = function (value) {
        if (!arguments.length) { return createPlanet; }
        if(typeof value === "function"){
            createPlanet = value;
        }
        return planets;
    };
    planets.updatePlanet = function (value) {
        if (!arguments.length) { return updatePlanet; }
        if(typeof value === "function"){
            updatePlanet = value;
        }
        return planets;
    };
    planets.startEditPlanet = function (value) {
        if (!arguments.length) { return startEditPlanet; }
        if(typeof value === "function"){
            startEditPlanet = value;
        }
        return planets;
    };
    planets.convertToAim = function (value) {
        if (!arguments.length) { return convertToAim; }
        if(typeof value === "function"){
            convertToAim = value;
        }
        return planets;
    };
    planets.deletePlanet = function (value) {
        if (!arguments.length) { return deletePlanet; }
        if(typeof value === "function"){
            deletePlanet = value;
        }
        return planets;
    };
    planets.onAddLink = function (value) {
        if (!arguments.length) { return onAddLink; }
        if(typeof value === "function"){ onAddLink = value; }
        return planets;
    };
    //functions
    planets.showAvailabilityStatus = function (g, cb = () => {}) {
        //const goal = prevData.find(g => g.id === goalId);
        //todo - find out why if we reference containeG instead of d3 here, it causes a new enter of planetG!
        const rx = g.rx(width);
        const ry =  g.ry(height);
        const ringRx = g.ringRx(width);
        const ringRy = g.ringRy(height);
        const deltaRx = ringRx - rx;
        const deltaRy = ringRy - ry;

        const planetG = d3.select("g.planet-"+g.id);
        const innerEllipses = planetG.selectAll("ellipse.core-inner");
        //check - does attr("rx") still return a value when multiple sel?
        const alreadyIncreased = +innerEllipses.attr("rx") !== rx;
        //Math.abs(+coreEllipse.attr("rx") - planetG.datum().rx(width)) > 0.001;
        //console.log("already increased?", alreadyIncreased)
        if(!selectedMeasureIsInGoal(g) && !alreadyIncreased){
            //console.log("increase size", goal.id)
            //increase size to show available
            //ellipses
            console.log("available", availablePlanetSizeMultiplier)
            innerEllipses
                .transition()
                    .duration(200)
                    .attr("rx", (rx - deltaRx) * availablePlanetSizeMultiplier)
                    .attr("ry", (ry - deltaRy) * availablePlanetSizeMultiplier)
                        .on("end", () => cb(g.id. measureId));
        }
        
        return planets;
    };
    planets.stopShowingAvailabilityStatus = function (g, cb = () => {}) {
        //const goal = prevData.find(g => g.id === goalId);
        //todo -see above - why cant use containerG instead of d3
        const rx = g.rx(width);
        const ry =  g.ry(height);
        const ringRx = g.ringRx(width);
        const ringRy = g.ringRy(height);
        const deltaRx = ringRx - rx;
        const deltaRy = ringRy - ry;

        const planetG = d3.select("g.planet-"+g.id);
        //ellipses
        const innerEllipses = planetG.selectAll("ellipse.core-inner");
        const alreadyReset = +innerEllipses.attr("rx") === rx;
        //Math.abs(+coreEllipse.attr("rx") - planetG.datum().rx(width)) < 0.001;
        //console.log("already reset?", alreadyReset)
        if(!selectedMeasureIsInGoal(g) && !alreadyReset){
            //console.log("reduce size", goal.id)
            //stop showing available
            innerEllipses
                .transition()
                    .duration(200)
                        .attr("rx", rx - deltaRx)
                        .attr("ry", ry - deltaRy)
                            .on("end", () => cb(g.id. selectedMeasure?.id));
        }
        return planets;
    };
    return planets;
}
