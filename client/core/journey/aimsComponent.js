import * as d3 from 'd3';
//import "d3-selection-multi";
import { grey10, COLOURS, DIMNS, WIDGET_WIDTH, WIDGET_HEIGHT } from "./constants";
import dragEnhancements from './enhancedDragHandler';
import menuComponent from './menuComponent';
import planetsComponent from './planetsComponent';
import { pointIsInRect } from "./geometryHelpers";
import nameComponent from "./nameComponent";
import { calcLinkPos } from './linksLayout';
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
    let selectedMeasure;

    let prevSelectedTimer;

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
    let onSetEditing = function(){};
    let onClick = function(){};
    let onLongpressStart = function(){};
    let onDragStart = function() {};
    let onDrag = function() {};
    let onDragEnd = function() {};
    let onMouseover = function(){};
    let onMouseout = function(){};
    let onClickName = function(){};
    let onDblClickGoal = function(){};
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

    let enhancedDrag = dragEnhancements();

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

        //helper
        //returns the first (and only longpressed goal)
        //note - atm, there can infact be multiple
        function longpressedGoal(){
            Object.keys(planets).forEach(aimId => {
                if(planets[aimId].longpressed()){
                    return planets[aimId].longpressed();
                }
                return null;
            })
        }
        //console.log("aims", planetSettings.availablePlanetSizeMultiplier)
        //enhancedDrag.onClick(onClick)
        enhancedDrag
            .onClick(handleClick)
            .onDblClick((e,d) => { onSetEditing(d) })
            .onLongpressStart(longpressStart);

        const drag = d3.drag()
            .filter((e,d) => d.id !== "main")
            .on("start", enhancedDrag(dragStart))
            .on("drag", enhancedDrag(dragged))
            .on("end", enhancedDrag(dragEnd));

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
                            .attr("fill-opacity", selectedAim?.id === d.id ? 1 : 0.15)
                            .attr("fill", selectedAim?.id === d.id ? COLOURS.selected : (d.colour || "transparent"))
                        
                        controlledContentsG.select("rect.solid-bg")
                            .attr("fill", view.goals ? "none" : COLOURS.canvas);
                            
                        //name
                        const nameCentred = !view.goals && d.id !== "main";
                        updateTopLeftName(d.name);
                        updateCentredName(d.width, d.height, d.name);
                        //top-left name
                        function updateTopLeftName(name){
                            //console.log("update top left name")
                            const { width, height, margin, fontSize } = nameSettings(d);
                            const contentsWidth = d3.max([width - margin.left - margin.right, 0]);
                            const contentsHeight = d3.max([height - margin.top - margin.bottom, 0]);

                            /*

                            todo next - sort out nameComponent - maybe turn it into a details component,
                            so user can change colour too etc, and also it has a solid rect bg to click
                            or longoress. 
                            - lp should bring up teh delete aim animation.
                            - click should be same as aim click -> so it selects the aim, and makes a link if 
                            another goal or aim is already selected
                             - drag should be same as draggin aim too.
                             so its all the saem as aim, except longpress.

                             BUT this is not ideal - it makes the user have to think! Mayber its better to remove all this
                             , put it back to how it was so we just haev a native click handler,
                             and allow aims and links to be deleted differently to goals.

                             so its just goals that have the longpress to delete or create
                             so the instruciton is just 'longpress to create or delete goals'
                             and for aims and links, the delete icon shows up on edit maybe? ie dbl-click.
                             and this can also be true for goals, so goals haev two ways to delete - longopress or dbl-click

                            */
                            controlledContentsG.call(nameComponent, {
                                className:"top-left-name", //note: curr name compo can only take one classname else it messes selection up
                                shouldDisplay:!nameCentred,
                                onClick:(e,d) => {
                                    console.log("click name---------", d)
                                },
                                onDblClick:(e,d) => {
                                    console.log("dbl click name", d)
                                },
                                onLongpressStart:(e,d) => {
                                    console.log("longpress name", d)
                                },
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
                                    .onClick(handleClickGoal)
                                    .onDblClick(onDblClickGoal)
                                    .onDragStart(dragGoalStart)
                                    .onDrag(draggedGoal)
                                    .onDragEnd(dragGoalEnd)
                                    //.onLongpressStart(longpressGoalStart)
                                    //.onLongpressDragged(longpressGoalDragged)
                                    //.onLongpressEnd(longpressGoalEnd)

                                    //.onMouseover(onMouseoverGoal)
                                    //.onMouseout(onMouseoutGoal)
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
                        const menuG = controlledContentsG.selectAll("g.menu").data([]/*selectedAim?.id === d.id ? [menuOptions(d)] : []*/, opt => opt.key);
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

        


        //longpress
        function longpressStart(e, d) {
            onLongpressStart.call(this, e, d)
        };

        //note - 'this' is g.controlled-contents not g.aim
        function handleClick(e, d){
            const prevSelectedAim = selectedAim;
            const prevSelectedGoal = selectedGoal;
            selectedAim = d;
            selectedGoal = null;

            //in all cases, reset timer
            if(prevSelectedTimer) { prevSelectedTimer.stop(); }
            prevSelectedTimer = d3.timeout(() => {
                selectedAim = null;
                //need to update
                containerG.call(aims);
            }, 4000);

            //grab the bg rect to be animated
            const clickedRect = d3.select(this).select("rect.semi-transparent-bg");

            //check if same aim was clicked twice
            if(prevSelectedAim?.id === selectedAim.id){
                //treat same as a dbl-click
                prevSelectedTimer.stop();
                prevSelectedTimer = null;
                //@todo - remove this when onDblClickAim implemented as it will update anyway
                clickedRect.attr("opacity", 0.15).attr("fill", selectedAim.colour || "transparent")
                selectedAim = null;
                onSetEditing(d);
                //@todo - impl this so it opens name form
                //onDblClickAim.call(this, e, d);
                return;
            }

            //show clicked aim as selected
            clickedRect
                .transition("selecting")
                .duration(200)
                    .attr("fill", COLOURS.selected);
    
            if(prevSelectedAim && prevSelectedAim.id !== selectedAim.id){
                const { x1, x2, y1, y2 } = calcLinkPos(prevSelectedAim, selectedAim);
                //create link from aim to aim
                //transition a temp link in
                 const tempLine = d3.select("g.aims")
                 .append("line")
                     .attr("class", "temp")
                     .attr("stroke", COLOURS.creatingLink)
                     .attr("opacity", 0)
                     .attr("x1", x1)
                     .attr("y1", y1)
                     .attr("x2", x2)
                     .attr("y2", y2)
             
                tempLine
                    .transition("enter")
                    .duration(600)
                        .attr("opacity", 1)
             
                //@todo - also allow any delay for fading in of links in linksComponent - or just remove that transition in there
                tempLine
                    .transition("exit")
                    .delay(1000) 
                    .duration(200)
                        .attr("opacity", 0)
                        .on("end", function(){
                            d3.select(this).remove();
                        })


                //grab the prev ellipse to be animated
                const prevRect = d3.select("g.aim-"+prevSelectedAim.id).select("rect.semi-transparent-bg");
                const bothRects = d3.selectAll("g.aim").select("rect.semi-transparent-bg")
                    .filter(a => a.id === prevSelectedAim.id || a.id === selectedAim.id);

                //light both up both
                bothRects
                    .transition("creating-link-rects")
                    .delay(200) //allow first anim to run
                    .duration(200)
                        .attr("fill", COLOURS.creatingLink);

                //put fill back for prev
                /*
                //should need this, but atm its overridden by the add link change
                prevRect
                    .transition("link-created")
                    .delay(1200) //allow first and second anim to run, plus a 400ms gap
                    .duration(200)
                        .attr("fill", prevSelectedAim.colour) //using .colour instead of .fill for aims
                */

                //store goal in case state changes again before transition ends
                const a1 = prevSelectedAim;
                const a2 = selectedAim;

                //put fill back for clicked, then create link
                clickedRect
                    .transition("link-created")
                        .delay(1000) //allow first and second anim to run, plus a 400ms gap
                        .duration(200)
                        .attr("fill", COLOURS.selected)
                        .on("end", () => {
                            onAddLink(a1, a2)
                        })
            }
            else if(prevSelectedGoal && prevSelectedGoal.aimId !== selectedAim.id){
                //create link from goal to aim
                const { x1, x2, y1, y2 } = calcLinkPos(prevSelectedGoal, selectedAim);
                //transition a temp link in
                const tempLine = d3.select("g.aims")
                    .append("line")
                        .attr("class", "temp")
                        .attr("stroke", COLOURS.creatingLink)
                        .attr("opacity", 0)
                        .attr("x1", x1)
                        .attr("y1", y1)
                        .attr("x2", x2)
                        .attr("y2", y2)
                
                tempLine
                    .transition("enter")
                    .duration(600)
                        .attr("opacity", 1)
                
                //@todo - also allow any delay for fading in of links in linksComponent - or just remove that transition in there
                tempLine
                    .transition("exit")
                    .delay(1000) 
                    .duration(200)
                        .attr("opacity", 0)
                        .on("end", function(){
                            d3.select(this).remove();
                        })


                //grab the prev ellipse to be animated
                const prevEllipse = d3.select("g.planet-"+prevSelectedGoal.id).select("ellipse.core-inner.visible");

                //light both up
                clickedRect
                    .transition("creating-link-aim")
                    .delay(200) //allow first anim to run
                        .duration(200)
                            .attr("fill", COLOURS.creatingLink);

                prevEllipse
                    .transition("creating-link-goal")
                    .delay(200) //allow first anim to run
                    .duration(200)
                        .attr("fill", COLOURS.creatingLink);
                /*
                //put fill back for prev
                //should need this, but atm its overridden by the add link change
                prevEllipse
                    .transition("link-created")
                    .delay(1600) //allow first and second anim to run, plus a 400ms gap
                    .duration(200)
                       .attr("fill", prevSelectedGoal.fill)
                */

                //store goal in case state changes again before transition ends
                const g = prevSelectedGoal;
                const a = selectedAim;

                //put fill back for clicked, then add link
                clickedRect
                    .transition("link-created")
                        .delay(1000) //allow first and second anim to run, plus a 400ms gap
                        .duration(200)
                        .attr("fill", COLOURS.selected)
                        .on("end", () => {
                            onAddLink(g, a)
                        })
            }else{
                //manually call dom update as no react state change
                containerG.call(aims);
            }
        }

        function handleClickGoal(e, d){
            const prevSelectedAim = selectedAim;
            const prevSelectedGoal = selectedGoal;
            selectedAim = null;
            selectedGoal = d;

            //in all cases, reset timer
            if(prevSelectedTimer) { prevSelectedTimer.stop(); }
            prevSelectedTimer = d3.timeout(() => {
                d3.selectAll("g.planet")
                    .each(function(e,d){
                        d3.select(this).select("ellipse.core-inner.visible").attr("fill", d => d.fill);
                    })
                selectedGoal = null;
                //need to update
                containerG.call(aims);

            }, 4000);

            //grab the ellipse to be animated
            const clickedEllipse = d3.select(this).select("ellipse.core-inner.visible");
            
            //check if same goal was clicked twice
            if(prevSelectedGoal?.id === selectedGoal.id){
                //treat same as a dbl-click
                prevSelectedTimer.stop();
                prevSelectedTimer = null;
                clickedEllipse.attr("fill", d.fill)
                selectedGoal = null;
                onSetEditing(d);
                //onDblClickGoal.call(this, e, d);
                return;
            }

            //show clicked goal as selected
            clickedEllipse
                .transition("selecting")
                .duration(200)
                    .attr("fill", COLOURS.selected);

            //animate then add link to state
            //2 cases: goal to goal, and aim to goal (src-targ order determined by dates though)
            //helper
            const linkIncludesGoal = (link, g) => link && g && (g.id === link.src.id || g.id === link.targ.id);
            const linkExists = (g1, g2) => linksData.find(l => linkIncludesGoal(l, g1) && linkIncludesGoal(l, g2));
            if(prevSelectedGoal && prevSelectedGoal.id !== selectedGoal.id && !linkExists(prevSelectedGoal, selectedGoal)){
                //create link from goal to goal
                const { x1, x2, y1, y2 } = calcLinkPos(prevSelectedGoal, selectedGoal);
                //transition a temp link in
                const tempLine = d3.select("g.aims")
                    .append("line")
                        .attr("class", "temp")
                        .attr("stroke", COLOURS.creatingLink)
                        .attr("opacity", 0)
                        .attr("x1", x1)
                        .attr("y1", y1)
                        .attr("x2", x2)
                        .attr("y2", y2)
                
                tempLine
                    .transition("enter")
                    .duration(600)
                        .attr("opacity", 1)
                
                //@todo - also allow any delay for fading in of links in linksComponent - or just remove that transition in there
                tempLine
                    .transition("exit")
                    .delay(1000) 
                    .duration(200)
                        .attr("opacity", 0)
                        .on("end", function(){
                            d3.select(this).remove();
                        })


                //grab the prev ellipse to be animated
                const prevEllipse = d3.select("g.planet-"+prevSelectedGoal.id).select("ellipse.core-inner.visible");
                const bothEllipses = d3.selectAll("g.planet").select("ellipse.core-inner.visible")
                    .filter(g => g.id === prevSelectedGoal.id || g.id === selectedGoal.id);

                //light both up both
                bothEllipses
                    .transition("creating-link-goal1")
                    .delay(200) //allow first anim to run
                    .duration(200)
                        .attr("fill", COLOURS.creatingLink);

                //put fill back for prev
                /*
                //should need this, but atm its overridden by the add link change
                prevEllipse
                    .transition("link-created")
                    .delay(1200) //allow first and second anim to run, plus a 400ms gap
                    .duration(200)
                       .attr("fill", prevSelectedGoal.fill)*/

                //store goal in case state changes again before transition ends
                const g1 = prevSelectedGoal;
                const g2 = selectedGoal;

                //put fill back for clicked, then create link
                clickedEllipse
                    .transition("link-created")
                        .delay(1000) //allow first and second anim to run, plus a 400ms gap
                        .duration(200)
                        .attr("fill", COLOURS.selected)
                        .on("end", () => {
                            onAddLink(g1, g2)
                        })
            }
            else if(prevSelectedAim && prevSelectedAim.id !== selectedGoal.aimId){
                //create link from aim to goal
                const { x1, x2, y1, y2 } = calcLinkPos(prevSelectedAim, selectedGoal);
                //transition a temp link in
                const tempLine = d3.select("g.aims")
                    .append("line")
                        .attr("class", "temp")
                        .attr("stroke", COLOURS.creatingLink)
                        .attr("opacity", 0)
                        .attr("x1", x1)
                        .attr("y1", y1)
                        .attr("x2", x2)
                        .attr("y2", y2)
                
                tempLine
                    .transition("enter")
                    .duration(600)
                        .attr("opacity", 1)
                
                //@todo - also allow any delay for fading in of links in linksComponent - or just remove that transition in there
                tempLine
                    .transition("exit")
                    .delay(1000) 
                    .duration(200)
                        .attr("opacity", 0)
                        .on("end", function(){
                            d3.select(this).remove();
                        })


                //grab the prev ellipse to be animated

                const prevRect = d3.select("g.aim-"+prevSelectedAim.id).select("rect.semi-transparent-bg");

                //light both up both
                clickedEllipse
                    .transition("creating-link-goal1")
                    .delay(200) //allow first anim to run
                    .duration(200)
                        .attr("fill", COLOURS.creatingLink);
                
                prevRect
                    .transition("creating-link-aim")
                    .delay(200) //allow first anim to run
                        .duration(200)
                            .attr("fill", COLOURS.creatingLink);

                //put fill back for prev
                /*
                //should need this, but atm its overridden by the add link change
                prevRect
                    .transition("link-created")
                    .delay(1200) //allow first and second anim to run, plus a 400ms gap
                    .duration(200)
                       .attr("fill", prevSelectedGoal.fill)*/

                //store goal in case state changes again before transition ends
                const a = prevSelectedAim;
                const g = selectedGoal;

                //put fill back for clicked, then create link
                clickedEllipse
                    .transition("link-created")
                        .delay(1000) //allow first and second anim to run, plus a 400ms gap
                        .duration(200)
                        .attr("fill", COLOURS.selected)
                        .on("end", () => {
                            onAddLink(a, g)
                        })
            }else{
                //manually update as no state change
                containerG.call(aims);
            }
        }

        function dragGoalStart(e , d){
            //const s = Snap(this);
            //console.log("bbox", s.getBBox())
            //works - will use the inner circle
            d3.select(this).raise();
            //note - called on click too - could improve enhancedDrag by preveting dragStart event
            //until a drag event has also been recieved, so stroe it and then release when first drag event comes through
            onDragGoalStart.call(this, e, d)

        }
        function draggedGoal(e , d, shouldUpdateSelected){
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
            console.log("drag aim start")
            d3.select(this.parentNode).raise();

            planetGsStartingOutsideAim = d3.selectAll("g.planet").filter(g => g.id !== d.id);

            //onDragStart does nothing
            onDragStart.call(this, e, d)
        }
        function dragged(e , d){
            //console.log("aim dragged")
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
            console.log("aim drag end", d)
            //on next update, we want aim dimns/pos to transition
            shouldTransitionAim = true;

            if(enhancedDrag.isClick()) { return; }

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
        if (!arguments.length) { return { aim:selectedAim, goal:selectedGoal }; }
        if(value?.dataType === "aim"){
            selectedAim = value;
            selectedGoal = undefined;
        }else if(value?.dataType === "planet"){
            selectedAim = undefined;
            selectedGoal = value;
        }else if(value?.dataType === "link"){
            selectedAim = undefined;
            selectedGoal = undefined;
        }else{
            //reset as no value
            selectedAim = undefined;
            selectedGoal = undefined;
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
    aims.onLongpressStart = function (value) {
        if (!arguments.length) { return onLongpressStart; }
        onLongpressStart = value;
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
    aims.onSetEditing = function (value) {
        if (!arguments.length) { return onSetEditing; }
        onSetEditing = value;
        return aims;
    };
    aims.onClickName = function (value) {
        if (!arguments.length) { return onClickName; }
        onClickName = value;
        return aims;
    };
    aims.onDblClickGoal = function (value) {
        if (!arguments.length) { return onDblClickGoal; }
        onDblClickGoal = value;
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
