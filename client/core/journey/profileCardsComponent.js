import * as d3 from 'd3';
import { DIMNS } from "./constants";
import dragEnhancements from './enhancedDragHandler';
// import menuComponent from './menuComponent';
import { Oscillator } from './domHelpers';
/*

*/
export default function profileCardsComponent() {
    //API SETTINGS
    // dimensions
    let width = DIMNS.profile.width;
    let height = DIMNS.profile.height;

    let fontSizes = {
        name:9
    };

    let timeScale = x => 0;
    let yScale = x => 0;

    let selected;

    //API CALLBACKS
    let onClick = function(){};
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

    function profileCards(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;
        // expression elements
        selection.each(function (data) {
            //console.log("profileCards update", data)
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

            const drag = d3.drag()
                .on("start", enhancedDrag(dragStart))
                .on("drag", enhancedDrag(dragged))
                .on("end", enhancedDrag(dragEnd));

            const profileCardG = containerG.selectAll("g.profile-card").data(data, d => d.id);
            profileCardG.enter()
                .append("g")
                .attr("class", d => "profile-card profile-card-"+d.id)
                .each(function(d,i){
                    //console.log("entering", d)
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
                            .attr("fill", "orange");

                    //title text
                    contentsG
                        .append("text")
                        .attr("class", "name")
                        .attr("text-anchor", "middle")
                        .attr("dominant-baseline", "middle")
                        .style("pointer-events", "none")
                
                })
                .style("cursor", "grab")
                //.call(transform, { x: d => adjX(timeScale(d.targetDate)), y:d => d.y })
                //.call(transform, { x: d => d.x, y:d => d.y }, transitionEnter && transitionsOn)
                .merge(profileCardG)
                .attr("transform", d =>  "translate(" +d.x +"," +d.y +")")
                .each(function(d){
                    //ENTER AND UPDATE
                    const contentsG = d3.select(this).select("g.contents")

                    //rect sizes
                    contentsG.selectAll("rect.bg")
                        .attr("x", -width/2)
                        .attr("y", -height/2)
                        .attr("width", width)
                        .attr("height", height)
                        //.attr("stroke", "none")// d.isMilestone ? grey10(1) : "none")
                   
                    //title
                    contentsG.select("text.name")
                        .attr("font-size", fontSizes.name)
                        .text(d.name || "Profile Name")

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
                .call(drag)
                .each(function(d){

                })

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
                console.log("dragStart", d.x)
                d3.select(this).raise();

                onDragStart.call(this, e, d)
            }
            function dragged(e , d){
                //controlled components
                d.x += e.dx;
                d.y += e.dy;
                d3.select(this)
                    .attr("transform", "translate(" + d.x +"," + d.y +")")
                    //.call(updateTransform, { x: d => d.displayX })
        
                //onDrag does nothing
                onDrag.call(this, e, d)
            }
    
            //note: newX and Y should be stored as d.x and d.y
            function dragEnd(e, d){
                console.log("dragEnd", d.x)
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
    profileCards.fontSizes = function (values) {
        if (!arguments.length) { return fontSizes; }
        fontSizes = { ...fontSizes, ...values };
        return profileCards;
    };
    profileCards.selected = function (value) {
        if (!arguments.length) { return selected; }
        selected = value;
        return profileCards;
    };
    profileCards.longpressed = function (value) {
        if (!arguments.length) { return longpressed; }
        longpressed = value;
        return profileCards;
    };
    profileCards.yScale = function (value) {
        if (!arguments.length) { return yScale; }
        yScale = value;
        return profileCards;
    };
    profileCards.timeScale = function (value) {
        if (!arguments.length) { return timeScale; }
        timeScale = value;
        return profileCards;
    };
    profileCards.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
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
