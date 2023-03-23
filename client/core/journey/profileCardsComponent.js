import * as d3 from 'd3';
import { DIMNS, grey10, COLOURS, PROFILE_PAGES, OVERLAY } from "./constants";
import dragEnhancements from './enhancedDragHandler';
// import menuComponent from './menuComponent';
import profileInfoComponent from './profileInfoComponent';
import kpisComponent from './kpis/kpisComponent';
import goalComponent from './goal/goalComponent';
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
    let bottomAreaHeight;

    let kpiHeight;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
        infoHeight = contentsHeight/2;
        bottomAreaHeight = contentsHeight/2;
    }

    let fontSizes = {
        info:{
            name:9,
            age:11,
            position:8,
            date:5
        },
        kpis:{
            name:9,
            values:9,
            ctrls:8
        }
    };

    let ctrls = () => ({
        topLeft: [],
        topRight: [],
        botLeft: [],
        botRight: [],
    });

    //state
    let expanded = [];
    let selected = [];
    let isSelected = () => false;
    let editable = false;
    let movable = true;
    let scrollable = false;
    let currentPage = PROFILE_PAGES[0];

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
    let onSaveValue = function(){};
    let onUpdateSelectedKpi = function(){};

    let onClickInfo = function(){};

    let enhancedDrag = dragEnhancements();
    //@todo - find out why k=1.05 makes such a big increase in size
    let oscillator = Oscillator({k:1});

    let longpressed;

    //dom
    let containerG;

    //components
    let profileInfoComponents = {};
    let kpisComponents = {};
    let goalComponents = {};


    function profileCards(selection, options={}) {
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
                    .attr("class", d => `milestone profile-card milestone-${d.id} profile-card-${d.id}`)
                    .each(function(d,i){
                        profileInfoComponents[d.id] = profileInfoComponent();
                        kpisComponents[d.id] = kpisComponent();
                        goalComponents[d.id] = goalComponent();
                        //ENTER
                        const contentsG = d3.select(this)
                            .append("g")
                            .attr("class", "contents profile-card-contents")

                        //bg rect
                        contentsG
                            .append("rect")
                                .attr("class", "profile-card-bg")
                                .attr("rx", 3)
                                .attr("ry", 3)
                                .call(updateFill, { 
                                    fill:d => isSelected(d) ? COLOURS.selectedMilestone : COLOURS.milestone
                                })

                    contentsG.append("g").attr("class", "info")
                    contentsG.append("g").attr("class", "bottom-area")

                    contentsG.append("g").attr("class", "top-right-ctrls")
                    contentsG.append("g").attr("class", "bot-right-ctrls")

                    d3.select(this).append("rect").attr("class", "overlay")
                        .attr("display", "none");
                
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
                    //overlay 
                    d3.select(this).select("rect.overlay")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("x", -width/2)
                        .attr("y", -height/2)
                        .style("fill", OVERLAY.FILL)
                        .style("opacity", OVERLAY.OPACITY)
                    
                    d3.select(this).select("g.contents").select("rect.profile-card-bg")
                    .call(updateFill, { 
                        fill:d => isSelected(d) ? COLOURS.selectedMilestone : COLOURS.milestone,
                        transition:{ duration: 300 }
                    })

                    const profileInfo = profileInfoComponents[d.id]
                        .currentPage(currentPage)
                        .width(contentsWidth)
                        .height(infoHeight)
                        .fontSizes(fontSizes.info)
                        .editable(editable)
                        .onClick(onClickInfo);

                    const goal = goalComponents[d.id]
                        .width(contentsWidth)
                        .height(contentsHeight/2)
                        .fontSizes(fontSizes.goal)
                        //.editable(editable)
                        //.scrollable(scrollable)
                        .editable(false)
                        .scrollable(false)
                        .onCtrlClick(onCtrlClick)


                    const kpis = kpisComponents[d.id]
                        .width(contentsWidth)
                        .height(bottomAreaHeight)
                        .kpiHeight(kpiHeight) //may be undefined
                        .fontSizes(fontSizes.kpis)
                        .editable(editable)
                        .scrollable(scrollable)
                        .onUpdateSelected((profileId, kpiKey, shouldUpdateScroll, shouldUpdateDom) => {
                            data.filter(p => p.id !== profileId).forEach(p => {
                                kpisComponents[p.id].selected(kpiKey, data, shouldUpdateScroll, shouldUpdateDom);
                           })
                           //parent needs to know so it can control how to handle the wrapperClick event
                           onUpdateSelectedKpi(kpiKey);
                        })
                        .onCtrlClick(onCtrlClick)
                        .onSaveValue((valueObj, profileId, datasetKey, statKey, key) => {
                            //if profileid is current, swap it for the first future profile
                            const requiredProfileId = profileId === "current" ? data.find(p => p.isFuture).id : profileId;
                            onSaveValue(valueObj, requiredProfileId, datasetKey, statKey, key);
                        })
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

                    const getStrokeWidth = status => {
                        if(status === "fullyOnTrack"){
                            return 15;
                        }
                        if(status === "mostlyOnTrack"){
                            return 7.5;
                        }
                        return 0;
                    }
                    //rect sizes
                    contentsG.selectAll("rect.profile-card-bg")
                        .attr("width", contentsWidth)
                        .attr("height", contentsHeight)
                        .attr("stroke-width", getStrokeWidth(d.onTrackStatus))
                        .attr("stroke", grey10(2))// d.isMilestone ? grey10(1) : "none")
                        //.attr("filter", "url(#filter1)");
                   
                    // why is this too far down
                    contentsG.selectAll("g.info")
                        .datum(d.info)
                        .call(profileInfo)

                    const bottomAreaG = contentsG.select("g.bottom-area")
                        .attr("transform", "translate(0," +(contentsHeight/2) +")");

                    const kpisG = bottomAreaG.selectAll("g.kpis").data(currentPage.key === "kpis" || d.isCurrent ? [1] : []);
                    kpisG.enter()
                        .append("g")
                            .attr("class", "kpis")
                            .merge(kpisG)
                            .datum(d.kpis)
                            .call(kpis);

                    kpisG.exit().remove();

                    const goalG = bottomAreaG.selectAll("g.goal").data(currentPage.key === "goal" && !d.isCurrent ? [1] : []);
                    goalG.enter()
                        .append("g")
                            .attr("class", "goal")
                            .merge(goalG)
                            .datum(d.goal)
                            .call(goal);
                    
                    goalG.exit().remove();

                    //top right ctrls (dependent on each card)
                    let btnWidth = 25;
                    let btnHeight = 25;

                    const topRightBtnG = contentsG.select("g.top-right-ctrls")
                        .attr("transform", `translate(${contentsWidth * 0.98}, ${contentsHeight * 0.02})`)
                        .selectAll("g.top-right-btn")
                        .data(ctrls(d).topRight, b => b.label)
                    
                    topRightBtnG.enter()
                        .append("g")
                            .attr("class", "top-right-btn")
                            .each(function(b){
                                d3.select(this)
                                    .append("rect")
                                        .attr("fill", "transparent");

                                d3.select(this)
                                    .append("path")
                                        .attr("transform", b.icon.transform || null)
                                        .attr("fill", COLOURS.btnIcons.default)
                                        .attr("stroke", COLOURS.btnIcons.default)
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

                    const botRightBtnG = contentsG.select("g.bot-right-ctrls")
                        .attr("transform", `translate(${contentsWidth * 0.96}, ${(contentsHeight * 0.98) - btnHeight})`)
                        .selectAll("g.bot-right-btn")
                        .data(ctrls(d).botRight, b => b.label)
                    
                    botRightBtnG.enter()
                        .append("g")
                            .attr("class", "bot-right-btn")
                            .each(function(b){
                                d3.select(this)
                                    .append("rect")
                                        .attr("fill", "transparent");

                                d3.select(this)
                                    .append("g")
                                        .attr("class", "icon")
                                        //.attr("fill", COLOURS.btnIcons.default)
                                        //.attr("stroke", COLOURS.btnIcons.default)
                            })
                            .merge(botRightBtnG)
                            .attr("transform", (b,i) => `translate(${-(i + 1) * btnWidth})`)
                            .each(function(b){
                                d3.select(this).select("rect")
                                    .attr("width", btnWidth * 1.1) //@todo - replqce x1.1 with proper measurements
                                    .attr("height", btnHeight * 1.1)

                                d3.select(this).select("g.icon")
                                    //.style("stroke", b.styles.stroke)
                                    .style("fill", b.styles.fill)
                                    .html(b.icon.html)
                            })
                            .style("cursor", "pointer")
                            .on("click",(e,b) => { 
                                //e.stopPropagation(); doesnt work
                                //e.stopImmediatePropagation()2
                                if(b.onClick){ b.onClick(b)} 
                            })
                            .on("mouseover", (e,b) => { if(b.onMouseover){ b.onMouseover(b)} })
                            .on("mouseout", (e,b) => { if(b.onMouseout){ b.onMouseout(b)} })

                    botRightBtnG.exit().remove(); 
                })
                //.call(updateHighlighted)
                //.call(drag)
                .each(function(d){

                })

            function updateTransform(selection, options={}){
                //console.log("updateTransform profileCards")
                const { x = d => d.x, y = d => d.y, scale = d => 1, transition, cb = () => {} } = options;
                selection.each(function(d){
                    const k = scale(d);
                    const scaledContentsWidth = contentsWidth * k;
                    const scaledContentsHeight = contentsHeight * k

                    if(transition){
                        d3.select(this)
                            .transition()
                            .duration(200)
                                .attr("transform", `translate(${x(d)} , ${y(d)}) scale(${k})`)
                                .on("end", cb);

                        //react milestones - we dont apply scale as a transform because it effects the margin
                        //instead, use scaledValues
                        d3.select(`div#milestone-${d.id}`)
                            .transition()
                            .duration(200)
                                /*
                                .style("width", `${scaledContentsWidth}px`)
                                .style("height", `${scaledContentsHeight/2}px`)
                                .style("left", `${x(d) - scaledContentsWidth/2}px`)
                                .style("top", `${y(d)}px`)
                                */
                                .style("width", `${contentsWidth}px`)
                                .style("height", `${height/2}px`)
                                .style("left", `${x(d) - contentsWidth/2}px`)
                                .style("top", `${y(d)}px`)
                                .style("transform-origin", "top center")
                                .style("transform", ` scale(${k})`)

                    }else{
                        d3.select(this)
                            .attr("transform", `translate(${x(d)} , ${y(d)}) scale(${k})`);

                        //react milestones
                        d3.select(`div#milestone-${d.id}`)
                            /*
                            .style("width", `${scaledContentsWidth}px`)
                            .style("height", `${scaledContentsHeight/2}px`)
                            .style("left", `${x(d) - scaledContentsWidth/2}px`)
                            .style("top", `${y(d)}px`)
                            */
                            .style("width", `${contentsWidth}px`)
                            .style("height", `${height/2}px`)
                            .style("left", `${x(d) - contentsWidth/2}px`)
                            .style("top", `${y(d)}px`)
                            .style("transform-origin", "top center")
                            .style("transform", ` scale(${k})`)
                        
                        cb.call(this);
                    }
                })
            }

            function updateFill(selection, options={}){
                const { fill = d => d.colour || "none", transition, cb = () => {} } = options;
                selection.each(function(d){
                    if(transition){
                        d3.select(this)
                            .transition()
                            .duration(transition.duration || 200)
                                .attr("fill", fill(d))
                                .on("end", cb);
                    }else{
                        d3.select(this).attr("fill", fill(d))
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
                //console.log("lp start")
                //todo - check defs appended, and use them here, then longopressDrag should trigger the delete of a goal
                //then do same for aims and links
                /*
                svg.select("defs").select("filter").select("feDropShadow")
                    .attr("flood-opacity", 0.6)
                    .attr("stdDeviation", 10)
                    .attr("dy", 10);
                */

                d3.select(this).select("rect.profile-card-bg")
                    //.style("filter", "url(#drop-shadow)")
                    .call(oscillator.start);

                longpressed = d;
                containerG.call(profileCards);

                onLongpressStart.call(this, e, d)
            };
            function longpressDragged(e, d) {
                if(deleted) { return; }

                //@todo - call dragged first, so that even as it disappears, it is moving away
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
    profileCards.currentPage = function (value) {
        if (!arguments.length) { return currentPage; }
        currentPage = value;
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
    profileCards.selected = function (values) {
        if (!arguments.length) { return selected; }
        selected = values;
        isSelected = d => values.includes(d.id);
        return profileCards;
    };
    profileCards.ctrls = function (f) {
        if (!arguments.length) { return ctrls; }
        ctrls = d => {
            const _ctrls = f(d);
            return {
                topLeft:_ctrls.topleft || [],
                topRight:_ctrls.topRight || [],
                botLeft:_ctrls.botleft || [],
                botRight:_ctrls.botRight || [],
            }
        }
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
    profileCards.onClickInfo = function (value) {
        if (!arguments.length) { return onClickInfo; }
        onClickInfo = value;
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
    profileCards.onSaveValue = function (value) {
        if(typeof value === "function"){
            onSaveValue = value;
        }
        return profileCards;
    };
    profileCards.onUpdateSelectedKpi = function (value) {
        if(typeof value === "function"){
            onUpdateSelectedKpi = value;
        }
        return profileCards;
    };
    profileCards.applyOverlay = function(selection){
        selection.selectAll("rect.overlay").attr("display", null)
    }
    profileCards.removeOverlay = function(selection){
        selection.selectAll("rect.overlay").attr("display", "none");
    }
    return profileCards;
}
