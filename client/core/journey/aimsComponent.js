import * as d3 from 'd3';
//import "d3-selection-multi";
import { grey10, COLOURS, DIMNS, WIDGET_WIDTH, WIDGET_HEIGHT } from "./constants";
import dragEnhancements from './enhancedDragHandler';
import menuComponent from './menuComponent';
import planetsComponent from './planetsComponent';
import { pointIsInRect } from "./geometryHelpers";
import nameComponent from "./nameComponent";
/*

*/

export default function aimsComponent() {
    let transitionsOn = true;
    // dimensions
    let width = 800;
    let height = 600;

    let defaultNameSettings = {
        fontSize: 7,
        width: 100,
        height: 20,
        margin:{ left: 5, right: 5, top:3, bottom: 3 }
    }
    let nameSettings = d => defaultNameSettings;

    let planetSettings = {
        fontSize:12,
        availablePlanetSizeMultiplier:1.5
    }

    let timeScale = x => 0;
    let yScale = x => 0;

    let view = { name: true, goals: { details: true }};

    let selectedAim;
    let selectedGoal;
    let selectedLink;
    let selectedMeasure;

    let prevData = [];
    let linksData = [];
    let channelsData = [];
    //helper
    //contents to show can be none, nameOnly, "basic", "all".
    let contentsToShow = aim => "basic";
    let goalContentsToShow = goal => "basic";
    let updateAimForGoals = function(){};

    //API FUNCTIONS
    let showAvailabilityStatus = function() {};
    let stopShowingAvailabilityStatus = function() {};

    //API CALLBACKS
    let onClick = function(){};
    let onDragStart = function() {};
    let onDrag = function() {};
    let onDragEnd = function() {};
    let onMouseover = function(){};
    let onMouseout = function(){};
    let onClickName = function(){};
    let onClickGoal = function(){};
    let onDragGoalStart = function() {};
    let onDragGoal = function() {};
    let onDragGoalEnd = function() {};
    let onMouseoverGoal = function(){};
    let onMouseoutGoal = function(){};

    let onResizeDragEnd = function() {};

    let deletePlanet = function(){};
    let updatePlanet = function(){};
    let onAddLink = function(){};
    let startEditPlanet = function(){};
    let convertGoalToAim = function(){};

    let onDeleteAim = function() {};

    let withClick = dragEnhancements();

    //components
    let planets = {};
    let menus = {};
    let menuOptions = (d) => {
        const basicOpts = [
            { key: "delete", label:"Delete" }
        ]
        return basicOpts;
    };

    //dom
    let containerG;

    //state
    let shouldTransitionAim = false;

    function aims(selection, options={}) {
        //console.log("aims", planetSettings.availablePlanetSizeMultiplier)
        withClick.onClick(onClick)
        const drag = d3.drag()
            .filter((e,d) => d.id !== "main")
            .on("start", withClick(dragStart))
            .on("drag", withClick(dragged))
            .on("end", withClick(dragEnd));

        // expression elements
        selection.each(function (data) {
            containerG = d3.select(this);
            const aimG = containerG.selectAll("g.aim").data(data, d => d.id);

            aimG.enter()
                .append("g")
                    .attr("class", d => "aim aim-"+d.id)
                    .classed("entering", true)
                    .each(function(d){
                        //if(d.id !== "main") console.log("enterng.....", d.displayWidth)
                        const nameWidth = 100;
                        const nameHeight = 20;
                        const aimG = d3.select(this);

                        const controlledContentsG = aimG.append("g").attr("class", "controlled-contents")
                            .call(updateTransform, { x:d => d.displayX });

                        const dragHandlesG = aimG.append("g").attr("class", "drag-handles")

                        //@todo - transition this out, so links reappear in aim at same time as planets
                        controlledContentsG
                            .append("rect")
                                .attr("class", "solid-bg aim-bg")
                                .attr("display", d.id === "main" ? "none" : null)

                        controlledContentsG
                            .append("rect")
                                .attr("class", "semi-transparent-bg aim-bg")
                                .attr("stroke", "none")
                                .attr("display", d.id === "main" ? "none" : null)
                                //.attr("pointer-events", d.id === "main" ? "none" : "all")
                                .attr("fill-opacity", 0.15)

                        controlledContentsG.selectAll("rect.aim-bg")
                            .attr("rx", 15)
                            .call(updateRectDimns, {
                                width:() => WIDGET_WIDTH, 
                                height: () => WIDGET_HEIGHT 
                            })
                            .call(updateRectDimns, {
                                width: d => d.displayWidth, 
                                height: d => d.height, 
                                transition:true,
                                //must remove entering from aimG, not the rects
                                cb:function(){ d3.select("g.aim-"+d.id).classed("entering", false) } })
             
                        //components        
                        planets[d.id] = planetsComponent();
                        menus[d.id] = menuComponent();
                    })
                    .merge(aimG)
                    .each(function(d){
                        //if(d.id !== "main") console.log("update.....", d.displayWidth)
                        //enter and update
                        planets[d.id].transitionsOn(transitionsOn);
                        const aimG = d3.select(this);
                        const controlledContentsG = aimG.select("g.controlled-contents")
                            //.attr("transform", "translate(" + (d.displayX) +"," + d.y +")")
                            .call(updateTransform, { x:d => d.displayX, transition:shouldTransitionAim })
                            .call(drag);

                        //hide contents if necc eg if aim form open
                        controlledContentsG.select("text.name").attr("display", contentsToShow(d) === "none" ? "none" : null);
                        
                        //drag handlers must not be in controlled components else they will be moved during the drag, causing a flicker
                        const dragHandlesG = aimG.select("g.drag-handles")
                            .attr("transform", "translate(" + (d.displayX) +"," + d.y +")")
                        
                        controlledContentsG.select("rect.semi-transparent-bg")
                            .attr("fill", d.colour || "transparent")
                        
                        controlledContentsG.select("rect.solid-bg")
                            .attr("fill", view.goals ? "none" : COLOURS.canvas);
                            
                        //name
                        const nameCentred = !view.goals && d.id !== "main";
                        updateTopLeftName(d.name);
                        updateCentredName(d.width, d.height, d.name);
                        //top-left name
                        function updateTopLeftName(name){
                            //console.log("set", nameSettings(d))
                            const { width, height, margin, fontSize } = nameSettings(d);
                            const contentsWidth = d3.max([width - margin.left - margin.right, 0]);
                            const contentsHeight = d3.max([height - margin.top - margin.bottom, 0]);

                            controlledContentsG.call(nameComponent, {
                                className:"top-left-name", //note: curr name compo can only take one classname else it messes selection up
                                shouldDisplay:!nameCentred,
                                onClick:onClickName,
                                translate:{ x: margin.left, y: margin.top },
                                bg:{
                                    width:contentsWidth,
                                    height:contentsHeight
                                },
                                text:{
                                    x:5,
                                    y:contentsHeight / 2,
                                    fontSize,
                                    stroke:grey10(1),
                                    name:name || (d.id === "main" ? "unnamed journey" : "unnamed group")
                                }
                            })
                        }
                        //centred name
                        function updateCentredName(aimWidth, aimHeight, name){
                            const { width, height, margin, fontSize } = nameSettings(d);
                            const contentsWidth = d3.max([width - margin.left - margin.right, 0]);
                            const contentsHeight = d3.max([height - margin.top - margin.bottom, 0]);
                            //enlarge as font is larger
                            const centredRectWidth = contentsWidth * 2.2;
                            const centredRectHeight = contentsHeight * 1.4;

                            controlledContentsG.call(nameComponent, {
                                className:"centred-name",
                                shouldDisplay:nameCentred,
                                onClick:onClickName,
                                translate:{ x: aimWidth/2, y: aimHeight/2 },
                                bg:{
                                    width:centredRectWidth,
                                    height:centredRectHeight,
                                    x:- centredRectWidth / 2,
                                    y: - centredRectHeight / 2
                                },
                                text:{
                                    textAnchor:"middle",
                                    fontSize:fontSize,
                                    stroke:grey10(1),
                                    name:name || "unnamed group"
                                }
                            })
                        }

                        //resize handle
                        //note - d is aim
                        const resizeDrag = d3.drag()
                            .on("start", function(e, resizeD) { resizeDragStart.call(this.parentNode.parentNode, e, resizeD.loc, d); })
                            .on("drag", function(e, resizeD) { resizeDragged.call(this.parentNode.parentNode, e, resizeD.loc, d); })
                            .on("end", function(e, resizeD) { resizeDragEnd.call(this.parentNode.parentNode, e, d); })

                        const handleWidth = d3.min([d3.max([d.width * 0.1, d.height * 0.1, 50]), 75]);
                        const handleHeight = handleWidth;
                        const resizeData = [
                            //{ x: 0, y: 0 },
                            { loc:"top-left", x: -handleWidth * 0.33, y: -handleHeight * 0.33 }, 
                            { loc:"top-right", x: d.displayWidth - handleWidth * 0.66, y: -handleHeight * 0.33 }, 
                            { loc:"bot-right", x: d.displayWidth - handleWidth * 0.66, y: d.height - handleHeight * 0.66 }, 
                            { loc:"bot-left", x: -handleWidth * 0.33, y: d.height - handleHeight * 0.66}
                        ];

                        let enteringAim = false;
                        const resizeG = dragHandlesG.selectAll("g.resize").data(d.id === "main" ? [] : resizeData);
                        resizeG.enter()
                            .append("g")
                                .attr("class", "resize")
                                .each(function(r, i){
                                    enteringAim = true;
                                    d3.select(this)
                                        .append("rect")
                                            .attr("opacity", 0)
                                            .attr("fill", "transparent")
                                            .attr("stroke", grey10(4))
                                            .attr("stroke-width", 0.4)
                                            .attr("stroke-dasharray", 1)
                                            .style("cursor", "pointer")
                                            .on("mouseover", function(){
                                                if(!enteringAim){
                                                    d3.select(this).attr("opacity", 1); 
                                                }
                                            })
                                            .on("mouseout", function(){ 
                                                //because a new aim starts over the mouse, we cn use the first mouse to reset entering aim to false;
                                                enteringAim = false;
                                                d3.select(this).attr("opacity", 0); 
                                            });
                                })
                                .merge(resizeG)
                                .attr("transform", r => "translate("+r.x +"," +r.y +")")
                                .each(function(){
                                    d3.select(this).select("rect")
                                        .attr("width", handleWidth)
                                        .attr("height", handleHeight)
                                })
                                .call(resizeDrag)
                        
                        function resizeDragStart(){
                            d3.select(this).select("g.drag-handles").attr("opacity", 0)
                        }

                        function resizeDragged(e, loc, aim){
                            if(loc === "top-left"){
                                //reduce width (but dx < 0 this will be an increase) and increase x pos (which is decrease if dx < 0)
                                aim.displayWidth -= e.dx;
                                aim.displayX += e.dx;
                                //reduce height (but dy < 0 this will be an increase) and increase y pos (which is decrease if dy < 0)
                                aim.height -= e.dy;
                                aim.y += e.dy;

                            } else if(loc === "top-right"){
                                //increase width only
                                aim.displayWidth += e.dx;
                                //reduce height (but dy < 0 this will be an increase) and increase y pos (which is decrease if dy < 0)
                                aim.height -= e.dy;
                                aim.y += e.dy;

                            } else if(loc === "bot-right"){
                                //increase width and height only
                                aim.displayWidth += e.dx;
                                aim.height += e.dy;

                            } else {
                                //bot-left
                                //reduce width (but dx < 0 this will be an increase) and increase x pos (which is decrease if dx < 0)
                                aim.displayWidth -= e.dx;
                                aim.displayX += e.dx;
                                //increase height only
                                aim.height += e.dy;

                            }

                            //check all planets if aim has changed, including those outside
                            d3.selectAll("g.planet").call(updateAimForGoals);

                            //dom
                            // note - we will get flickering if we move the drag handle during the drag.
                            d3.select(this).select("g.controlled-contents")
                                .call(updateTransform, { x: () => aim.displayX, y:() => aim.y });

                            d3.select(this).select("g.controlled-contents").selectAll("rect.aim-bg")
                                .call(updateRectDimns, { width: () => aim.displayWidth, height:() => aim.height })

                            //centred name
                            updateCentredName(aim.displayWidth, aim.height, aim.name)
                            
                        }

                        function resizeDragEnd(e, d){
                            d3.select(this).select("g.drag-handles").attr("opacity", 1)
                            onResizeDragEnd.call(this, e, d, d3.selectAll("g.planet").data());
                        }

                        //planets
                        //todo - find out why all the d values that were updated in onResizeDragEnd are undefined
                        const planetsG = aimG.selectAll("g.planets").data((d.id === "main" || view.goals) ? [d.planets] : []);
                        planetsG.enter()
                            .append("g") // @todo - chqnge to insert so its before resize and drag handles so they arent blocked
                                .attr("class", "planets planets-"+d.id)
                                .each(function(){
                                    d3.select(this)
                                        .attr("opacity", 0)
                                        .transition()
                                            .delay(200)
                                            .duration(300)
                                            .attr("opacity", 1)
                                })
                                .merge(planetsG)
                                .call(planets[d.id]
                                    .contentsToShow(goalContentsToShow)
                                    .selected(selectedGoal)
                                    .selectedMeasure(selectedMeasure)
                                    .channelsData(channelsData) 
                                    .linksData(linksData) 
                                    .timeScale(timeScale)
                                    .yScale(yScale)
                                    .fontSize(planetSettings.fontSize)
                                    .availablePlanetSizeMultiplier(planetSettings.availablePlanetSizeMultiplier)

                                    .onClick(onClickGoal)
                                    .onDragStart(dragGoalStart)
                                    .onDrag(draggedGoal)
                                    .onDragEnd(dragGoalEnd)
                                    .onLongpressStart(longpressGoalStart)
                                    .onLongpressDragged(longpressGoalDragged)
                                    .onLongpressEnd(longpressGoalEnd)

                                    .onMouseover(onMouseoverGoal)
                                    .onMouseout(onMouseoutGoal)
                                    .onAddLink(onAddLink)
                                    .updatePlanet(updatePlanet)
                                    .deletePlanet(deletePlanet)
                                    .onAddLink(onAddLink)
                                    .startEditPlanet(startEditPlanet)
                                    .convertToAim(convertGoalToAim), 
                                    options.goals);
                            
                        planetsG.exit().each(function(d){
                            //will be multiple exits because of the delay in removing
                            if(!d3.select(this).attr("class").includes("exiting")){
                                d3.select(this)
                                    .classed("exiting", true)
                                    .transition()
                                        .duration(300)
                                        .attr("opacity", 0)
                                        .on("end", function() { d3.select(this).remove(); });
                            }
                        })

                        //menu
                        const menuG = controlledContentsG.selectAll("g.menu").data(selectedAim?.id === d.id ? [menuOptions(d)] : [], opt => opt.key);
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
                            .attr("transform", "translate(" +DIMNS.form.single.width/2 +"," + -20 +")")
                            .call(menus[d.id]
                                .onClick((opt) => {
                                    switch(opt.key){
                                        case "delete": { 
                                            onDeleteAim.call(this, d.id);
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

                        //update only
                        if(!d3.select(this).classed("entering")){
                            d3.select(this).selectAll("rect.aim-bg")
                                .call(updateRectDimns, {
                                    width: d => d.displayWidth,
                                    height: d => d.height,
                                    transition: shouldTransitionAim
                                })
                        }

                    });

            aimG.exit().remove();

            //reset
            transitionsOn = true;

            prevData = data;
        })

        function updateRectDimns(selection, options={}){
            //console.log("uRD options", options)
            const { width = d => d.width, height = d => d.height, transition, cb = () => {} } = options;
            selection.each(function(d){
                if(d.id !== "main"){
                    //console.log("updateRectDimns", transition)
                }
                if(transition){
                    d3.select(this)
                        .transition()
                        .duration(200)
                            .attr("width", width(d))
                            .attr("height", height(d))
                            .on("end", cb);
                }else{
                    d3.select(this)
                        .attr("width", width(d))
                        .attr("height", height(d));
                    
                    cb.call(this);
                }
                
            })

        }

        //todo next - impl this func so aim updates when planet makes it exapnad to the left ie the trans x changes
        function updateTransform(selection, options={}){
            //console.log("uRD options", options)
            const { x = d => d.x, y = d => d.y, transition, cb = () => {} } = options;
            selection.each(function(d){
                if(d.id !== "main"){
                    //console.log("updateTransform", transition)
                }
                if(transition){
                    d3.select(this)
                        .transition()
                        .duration(200)
                            .attr("transform", "translate("+x(d) +"," +y(d) +")")
                            .on("end", cb);
                }else{
                    d3.select(this)
                        .attr("transform", "translate("+x(d) +"," +y(d) +")");
                    
                    cb.call(this);
                }
                
            })

        }

        updateAimForGoals = function(planetGs){
            planetGs.each(function(g){
                const newAim = prevData
                    .filter(a => a.id !== "main")
                    .find(a => pointIsInRect(g, { x: a.displayX, y:a.y, width: a.displayWidth, height:a.height }))
            
                if(newAim?.id !== g.aimId){
                    g.aimId = newAim?.id;
                    //@todo - think about how .colours is used, rather tan doing it manually here again
                    //dom
                    d3.select(this).selectAll("ellipse.core.visible")
                        .attr("fill", newAim?.colour || COLOURS.planet);
                }
            })
        }

        function dragGoalStart(e , d){
            console.log("drag goal start")
            //const s = Snap(this);
            //console.log("bbox", s.getBBox())
            //works - will use the inner circle
            d3.select(this).raise();
            //note - called on click too - could improve enhancedDrag by preveting dragStart event
            //until a drag event has also been recieved, so stroe it and then release when first drag event comes through
            onDragGoalStart.call(this, e, d)

        }
        function draggedGoal(e , d, shouldUpdateSelected){
            console.log("dragged goal")
            d.x += e.dx;
            d.y += e.dy;

            d3.select(this)
                .attr("transform", "translate("+(d.x) +"," +(d.y) +")")
                .call(updateAimForGoals);

            //obv need to tidy up teh way trueX is added in planetslayout too
            //but first look at why link line
            //becomes short and what happens to bar charts
            const targetDate = timeScale.invert(d.channel.trueX(d.x))
            const yPC = yScale.invert(d.y)

            onDragGoal.call(this, e, { ...d, targetDate, yPC, unaligned:true }, shouldUpdateSelected)
        }
        function dragGoalEnd(e, d){
            console.log("drag goal end")
            //we want aim width to transition in next update
            shouldTransitionAim = true;
            onDragGoalEnd.call(this, e, d);
        }

        function longpressGoalStart(e, d) {
        }
    
        function longpressGoalDragged(e, d) {
        }
    
        function longpressGoalEnd(e, d) {
        };
    

        let planetGsStartingOutsideAim;

        function dragStart(e , d){
            //console.log("drag aim start", this)
            d3.select(this.parentNode).raise();

            planetGsStartingOutsideAim = d3.selectAll("g.planet").filter(g => g.id !== d.id);

            //onDragStart does nothing
            onDragStart.call(this, e, d)
        }
        function dragged(e , d){
            //controlled components
            d.displayX += e.dx;
            d.y += e.dy;
            d3.select(this)
                .call(updateTransform, { x: d => d.displayX })
            //.attr("transform", "translate(" + d.displayX +"," + d.y +")")

            //goals
            //ones inside aim
            d3.select(this.parentNode).selectAll("g.planet")
                .each(function(planetD){
                    planetD.x += e.dx;
                    planetD.y += e.dy;
                    d3.select(this)
                        .attr("transform", "translate(" + planetD.x +"," + planetD.y +")")

                })
            //goals outside aim  - check aimid
            //note - we select in dragStart so that it continues to update those which become part of aim and then go out of
            //it again as user drags aim around
            planetGsStartingOutsideAim.call(updateAimForGoals)
    
            //onDrag does nothing
            onDrag.call(this, e, d)
        }

        //note: newX and Y should be stored as d.x and d.y
        function dragEnd(e, d){
            //on next update, we want aim dimns/pos to transition
            shouldTransitionAim = true;

            if(withClick.isClick()) { return; }

            const outsidePlanetsToUpdate = planetGsStartingOutsideAim
                .filter(p => p.aimId === d.id)
                .data()
                .map(g => ({ id: g.id, aimId: g.aimId }));

            onDragEnd.call(this, e, d, outsidePlanetsToUpdate);
        }

        //reset temp settings
        shouldTransitionAim = false;

        return selection;
    }

    //api
    aims.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return aims;
    };
    aims.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return aims;
    };
    aims.nameSettings = function (f) {
        if (!arguments.length) { return nameSettings; }
        nameSettings = d => { 
            const settings = { ...defaultNameSettings, ...f(d) };
            return {
                ...settings,
                contentsWidth: settings.width - settings.margin.left - settings.margin.right,
                contentsHeight: settings.height - settings.margin.top - settings.margin.bottom,
            }
        }
        return aims;
    };
    aims.planetSettings = function (value) {
        if (!arguments.length) { return planetSettings; }
        planetSettings = { ...planetSettings, ...value };
        return aims;
    };
    aims.contentsToShow = function (value) {
        if (!arguments.length) { return contentsToShow; }
        contentsToShow = value;
        return aims;
    };
    aims.goalContentsToShow = function (value) {
        if (!arguments.length) { return goalContentsToShow; }
        goalContentsToShow = value;
        return aims;
    };
    aims.selectedMeasure = function (value) {
        if (!arguments.length) { return selectedMeasure; }
        selectedMeasure = value;
        return aims;
    };
    aims.selected = function (value) {
        if (!arguments.length) { return { selectedAim, selectedGoal }; }
        if(value?.dataType === "aim"){
            selectedAim = value;
            selectedGoal = undefined;
            selectedLink = undefined;
        }else if(value?.dataType === "planet"){
            selectedAim = undefined;
            selectedGoal = value;
            selectedLink = undefined;
        }else if(value?.dataType === "link"){
            selectedAim = undefined;
            selectedGoal = undefined;
            selectedLink = value;
        }else{
            //reset as no value
            selectedAim = undefined;
            selectedGoal = undefined;
            selectedLink = undefined;

        }
        return aims;
    };
    aims.withRing = function (value) {
        if (!arguments.length) { return withRing; }
        withRing = value;
        containerG.call(aims);
    
        return aims;
    };
    aims.channelsData = function (value) {
        if (!arguments.length) { return channelsData; }
        channelsData = value;
        //updateChannelsData(value); for helper fuctins that use channels eg adjX in planetsComponent
        //@todo - probably makes more sense to update these funciton sonce in journeyComponent
        return aims;
    };
    aims.linksData = function (value) {
        if (!arguments.length) { return linksData; }
        linksData = value;
        return aims;
    };
    aims.yScale = function (value) {
        if (!arguments.length) { return yScale; }
        yScale = value;
        return aims;
    };
    aims.timeScale = function (value) {
        if (!arguments.length) { return timeScale; }
        timeScale = value;
        return aims;
    };
    aims.view = function (value) {
        if (!arguments.length) { return view; }
        view = value;
        return aims;
    };

    aims.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return aims;
    };
    aims.onDragStart = function (value) {
        if (!arguments.length) { return onDragStart; }
        if(typeof value === "function"){
            onDragStart = value;
        }
        return aims;
    };
    aims.onDrag = function (value) {
        if (!arguments.length) { return onDrag; }
        if(typeof value === "function"){
            onDrag = value;
        }
        return aims;
    };
    aims.onDragEnd = function (value) {
        if (!arguments.length) { return onDragEnd; }
        if(typeof value === "function"){
            onDragEnd = value;
        }
        return aims;
    };
    aims.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return aims;
    };
    aims.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return aims;
    };
    aims.onClickName = function (value) {
        if (!arguments.length) { return onClickName; }
        onClickName = value;
        return aims;
    };
    aims.onClickGoal = function (value) {
        if (!arguments.length) { return onClickGoal; }
        onClickGoal = value;
        return aims;
    };
    aims.onDragGoalStart = function (value) {
        if (!arguments.length) { return onDragGoalStart; }
        if(typeof value === "function"){
            onDragGoalStart = value;
        }
        return aims;
    };
    aims.onDragGoal = function (value) {
        if (!arguments.length) { return onDragGoal; }
        if(typeof value === "function"){
            onDragGoal = value;
        }
        return aims;
    };
    aims.onDragGoalEnd = function (value) {
        if (!arguments.length) { return onDragGoalEnd; }
        if(typeof value === "function"){
            onDragGoalEnd = value;
        }
        return aims;
    };
    aims.onMouseoverGoal = function (value) {
        if (!arguments.length) { return onMouseoverGoal; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return aims;
    };
    aims.onMouseoutGoal = function (value) {
        if (!arguments.length) { return onMouseoutGoal; }
        if(typeof value === "function"){
            onMouseoutGoal = value;
        }
        return aims;
    };
    aims.onResizeDragEnd = function (value) {
        if (!arguments.length) { return onResizeDragEnd; }
        if(typeof value === "function"){
            onResizeDragEnd = value;
        }
        return aims;
    };
    aims.deletePlanet = function (value) {
        if (!arguments.length) { return deletePlanet; }
        if(typeof value === "function"){
            deletePlanet = value;
        }
        return aims;
    };
    aims.updatePlanet = function (value) {
        if (!arguments.length) { return updatePlanet; }
        if(typeof value === "function"){
            updatePlanet = value;
        }
        return aims;
    };
    aims.onDeleteAim = function (value) {
        if (!arguments.length) { return onDeleteAim; }
        if(typeof value === "function"){
            onDeleteAim = value;
        }
        return aims;
    };
    aims.onAddLink = function (value) {
        if (!arguments.length) { return onAddLink; }
        if(typeof value === "function"){
            onAddLink = value;
        }
        return aims;
    };
    aims.startEditPlanet = function (value) {
        if (!arguments.length) { return startEditPlanet; }
        if(typeof value === "function"){
            startEditPlanet = value;
        }
        return aims;
    };
    aims.convertGoalToAim = function (value) {
        if (!arguments.length) { return convertGoalToAim; }
        if(typeof value === "function"){
            convertGoalToAim = value;
        }
        return aims;
    };
    aims.transitionsOn = function (value) {
        if (!arguments.length) { return transitionsOn; }
        transitionsOn = value;
        return aims;
    }
    //functions
    aims.showAvailabilityStatus = function (goals, cb) {
        goals.forEach(g => { planets[g.aimId || "main"].showAvailabilityStatus(g, cb); });
        return aims;
    };
    aims.stopShowingAvailabilityStatus = function (goals, cb) {
        goals.forEach(g => { planets[g.aimId || "main"].stopShowingAvailabilityStatus(g, cb); });
        return aims;
    };
    aims.updateAimForGoals = updateAimForGoals;
    return aims;
}
