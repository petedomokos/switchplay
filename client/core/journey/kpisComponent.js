import * as d3 from 'd3';
import { DIMNS } from "./constants";
import dragEnhancements from './enhancedDragHandler';
import { Oscillator } from './domHelpers';
/*

*/
export default function kpisComponent() {
    //API SETTINGS
    // dimensions
    let width = DIMNS.profile.width;
    let height = DIMNS.profile.height;
    let margin;
    let contentsWidth;
    let contentsHeight;

    let kpiHeight;
    let gapBetweenKpis;

    let kpiNameHeight;
    let kpiNameMargin;

    let barWidth;
    let numbersWidth;

    let barHeight;
    let barMargin;
    let barContentsWidth;
    let barContentsHeight;

    function updateDimns(){
        margin = { left: width * 0.1, right: width * 0.1, top:height * 0.1, bottom: height * 0.1 };
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        barWidth = contentsWidth * 0.7;
        numbersWidth = contentsWidth * 0.3;
        //todo - reduce kpiHeight and place kpi name above each bar 
        gapBetweenKpis = kpiHeight * 0.3;
        kpiNameHeight = kpiHeight * 0.4;
        barHeight = kpiHeight * 0.6;
        kpiNameMargin = { left: 0, right: 0, top: kpiNameHeight * 0.1, bottom: kpiNameHeight * 0.1 };
        barMargin = { left: 0, right: 0, top: barHeight * 0.15, bottom: barHeight * 0.15 };
        barContentsWidth = barWidth - barMargin.left - barMargin.right;
        barContentsHeight = barHeight - barMargin.top - barMargin.bottom; 
        
    }

    let fontSizes = {
        name:12
    };

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

    let scales = {};

    //dom
    let containerG;

    function kpis(selection, options={}) {
        updateDimns();
        const { transitionEnter=true, transitionUpdate=true } = options;
        // expression elements
        selection.each(function (data) {
            console.log("kpis update", data)
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

            containerG.selectAll("g.contents").data([1])
                .join("g")
                .attr("class", "contents")
                .attr("transform", d =>  `translate(${margin.left},${margin.top})`)
                .each(function(){
                    const kpiG = d3.select(this).selectAll("g.kpi").data(data, d => d.id);
                    kpiG.enter()
                        .append("g")
                        .attr("class", d => "kpi kpi-"+d.id)
                        .each(function(d,i){
                            scales[d.id] = d3.scaleLinear();

                            const kpiG = d3.select(this);
                            kpiG.append("rect")
                                .attr("class", "bg");

                            kpiG.append("g")
                                    .attr("class", "name")
                                        .append("text")
                                            .attr("dominant-baseline", "central");

                            kpiG.append("g").attr("class", "bars");

                            kpiG.append("g").attr("class", "numbers");

    
        
                        })
                        .style("cursor", "grab")
                        .merge(kpiG)
                        .attr("transform", (d,i) =>  `translate(0,${i * (kpiHeight + gapBetweenKpis)})`)
                        .each(function(d){
                            const { min, max } = d;
                            const kpiG = d3.select(this);
                            kpiG.select("rect.bg")
                                .attr("width", contentsWidth)
                                .attr("height", kpiHeight)
                                .attr("fill", "none")
                                .attr("stroke", "black")
                                .attr("stroke-width", 0.3)  
                            
                            const nameG = kpiG.select("g.name")
                                .attr("transform", `translate(0, ${kpiNameHeight/2})`);
                            
                            nameG.select("text")
                                .attr("font-size", fontSizes.name)
                                .text("kpi name here")
                    
                            const scale = scales[d.id].domain([min, max]).range([0, barContentsWidth])

                            const barsG = kpiG.select("g.bars")
                                .attr("transform", `translate(${barMargin.left}, ${kpiNameHeight +barMargin.top})`)
                            
                            console.log("update barsData", d.barsData)
                            console.log("barsG", barsG.node())
                            const barRect = barsG.selectAll("rect.bar").data(d.barsData, d => d.key)
                            barRect.enter()
                                .append("rect")
                                    .attr("class", "bar")
                                    .attr("fill", d => {
                                        console.log("enter rect")
                                        return d.fill
                                    })
                                    .merge(barRect)
                                    .attr("x", d => scale(d.from))
                                    .attr("width", d => scale(d.to) - scale(d.from))
                                    .attr("height", barContentsHeight)

                            //target lines
                            const linesData = [
                                { key:"expected-current", value: 0 },
                                { key: "target", value: 0 }
                            ]
                            //...
                        })

                    //EXIT
                    kpiG.exit().each(function(d){
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
                containerG.call(kpis);

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
    kpis.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return kpis;
    };
    kpis.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return kpis;
    };
    kpis.kpiHeight = function (value) {
        if (!arguments.length) { return kpiHeight; }
        kpiHeight = value;
        return kpis;
    };
    kpis.fontSizes = function (values) {
        if (!arguments.length) { return fontSizes; }
        fontSizes = { ...fontSizes, ...values };
        return kpis;
    };
    kpis.selected = function (value) {
        if (!arguments.length) { return selected; }
        selected = value;
        return kpis;
    };
    kpis.longpressed = function (value) {
        if (!arguments.length) { return longpressed; }
        longpressed = value;
        return kpis;
    };
    kpis.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return kpis;
    };
    kpis.onDblClick = function (value) {
        if (!arguments.length) { return onDblClick; }
        onDblClick = value;
        return kpis;
    };
    kpis.onDragStart = function (value) {
        if (!arguments.length) { return onDragStart; }
        if(typeof value === "function"){
            onDragStart = value;
        }
        return kpis;
    };
    kpis.onDrag = function (value) {
        if (!arguments.length) { return onDrag; }
        if(typeof value === "function"){
            onDrag = value;
        }
        return kpis;
    };
    kpis.onDragEnd = function (value) {
        if (!arguments.length) { return onDragEnd; }
        if(typeof value === "function"){
            onDragEnd = value;
        }
        return kpis;
    };
    kpis.onLongpressStart = function (value) {
        if (!arguments.length) { return onLongpressStart; }
        if(typeof value === "function"){
            onLongpressStart = value;
        }
        return kpis;
    };
    kpis.onLongpressDragged = function (value) {
        if (!arguments.length) { return onLongpressDragged; }
        if(typeof value === "function"){
            onLongpressDragged = value;
        }
        return kpis;
    };
    kpis.onLongpressEnd = function (value) {
        if (!arguments.length) { return onLongpressEnd; }
        if(typeof value === "function"){
            onLongpressEnd = value;
        }
        return kpis;
    };
    kpis.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return kpis;
    };
    kpis.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return kpis;
    };
    kpis.onDelete = function (value) {
        if (!arguments.length) { return onDelete; }
        if(typeof value === "function"){
            onDelete = value;
        }
        return kpis;
    };
    return kpis;
}
