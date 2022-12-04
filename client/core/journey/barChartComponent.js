import * as d3 from 'd3';
import { COLOURS, grey10 } from "./constants";

/*

*/
export default function barChartComponent() {
    // dimensions
    let width = 600;
    let height = 600;
    let valAxisExtraEndSpaceRequired;
    let margin;

    let contentsWidth;
    let contentsHeight;

    let labelSettings = { fontSize:7, width:30 };
    let axisSettings = { show: true, ticks: { fontSize: 5 } }

    let zoomScale = 1;

    function updateDimns(){
        valAxisExtraEndSpaceRequired = axisSettings.show ? 5 : 0;

        margin = margin = {
            left:width * 0.05, 
            right:d3.max([valAxisExtraEndSpaceRequired, width * 0.05]), 
            top:height * 0.05, 
            bottom:height * 0.05
        }
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

    };

    //handlers
    function onMouseover (){};
    function onMouseout (){};

    //dom
    let containerG;
    let contentsG;
    let backgroundRect;
    let contentsBackgroundRect;

    function barChart(selection) {
        //note - container g is positioned in the middle of where the chart needs to be, so need to base coods off that
        updateDimns();
        // expression elements
        selection.each(function (data) {
            if(d3.select(this).select("g.contents").empty()){
                init.call(this);
            }
            //console.log("barChart.....", data);
            function init(){
                //console.log("barChart init", this);
                containerG = d3.select(this);

                backgroundRect = containerG
                    .append("rect")
                        .attr("class", "border")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("fill", COLOURS?.canvas || "white")
                
                contentsG = containerG
                    .append("g")
                    .attr("class", "contents")
                
                contentsBackgroundRect = contentsG
                    .append("rect")
                        .attr("fill", "transparent")
            }

            backgroundRect.attr("width", width).attr("height", height)
            contentsG.attr("transform", "translate("+margin.left +"," +margin.top +")");
            contentsBackgroundRect.attr("width", contentsWidth).attr("height", contentsHeight);

            //make the chart
            //axis
            const valAxisHeight = axisSettings.show ? 15 : 0;
            const catAxisWidth = labelSettings.width;

            const barsAreaWidth = contentsWidth - catAxisWidth;
            const barsAreaHeight = contentsHeight - valAxisHeight;

            //flipped coz horizonatl bar chart
            const barWrapperWidth = barsAreaHeight/data.length;
            const barSpacing = barWrapperWidth * 0.4;
            const barWidth = barWrapperWidth - barSpacing; 
            //const barTextX = barsAreaWidth+10
            const valScale = d3.scaleLinear().domain([0, 100]).range([0, barsAreaWidth]);

            const valAxis = d3.axisBottom().scale(valScale).ticks(5)
            const valAxisG = contentsG.selectAll("g.val-axis").data(axisSettings.show ? [1] : []);
            valAxisG.enter()
                .append("g")
                    .attr("class", "axis val-axis")
                    //.attr("transform", "translate("+(margin.left +catAxisWidth) +"," +(contentsHeight - valAxisHeight)+")")
                    .merge(valAxisG)
                    .attr("transform", "translate(" +catAxisWidth +"," +(contentsHeight - valAxisHeight)+")")
                    .call(valAxis)
                    .each(function(){
                        d3.select(this)
                            .style("stroke-width", 0.05)
                            .style("stroke", "black")
                            .style("opacity", 0.5);
                        
                        d3.select(this).selectAll("text")
                            .style("opacity", 0.5)
                            .style("font-size", axisSettings.ticks.fontSize);
                    });
            valAxisG.exit().remove();

            //bars
            const barsAreaG = contentsG.selectAll("g.bars-area").data([1])
            barsAreaG.enter()
                .append("g")
                .attr("class", "bars-area")
                .merge(barsAreaG)
                .attr("transform", "translate("+catAxisWidth +",0)")
                .each(function(){
                    //bars
                    const barG = d3.select(this).selectAll("g.bar").data(data)
                    barG.enter()
                        .append("g")
                        .attr("class", "bar")
                        .attr("id", d => "bar-"+d.key)
                        .attr("cursor", "pointer")
                        .each(function(d,i){
                            //console.log("d...", d)
                            //datapoint
                            //for now, assume only 1 datasetMeasure per goal
                            const g = d3.select(this);

                            //border rect
                            g.append("rect")
                                .attr("class", "border")
                                .attr("fill", "none")
                                .attr("stroke", "blue")
                                .attr("stroke-width", 0.1);

                            //actual rect
                            g.append("rect")
                                .attr("class", "bar")
                                .attr("fill", "blue")
                                

                            //projected rect
                            g.append("rect")
                                .attr("class", "proj-bar")
                                .attr("fill", "blue")
                                .attr("opacity", 0.1);

                            g.append("text")
                                .style("font-size", 5)//labelSettings.fontSize)
                                .attr("text-anchor", "end")
                                .attr("dominant-baseline", "central");

                            // g.append("svg:image")
                                // .attr("href", "/tick.svg")
                                // .attr("class", "tick");
                            
                        })
                        .merge(barG)
                        .attr("transform", (d,i) => "translate(0, "+((barSpacing/2) +i * barWrapperWidth) +")")
                        .on("mouseover", onMouseover)
                        .on("mouseout", onMouseout)
                        .each(function(d,i){
                            //console.log("d...", d)
                            //datapoint
                            //for now, assume only 1 datasetMeasure per goal
                            const g = d3.select(this);

                            //border rect
                            g.select("rect.border")
                                .attr("width", valScale.range()[1])
                                .attr("height", barWidth)

                            //actual rect
                            g.select("rect.bar")
                                //.attr("y", valScale(d.pcValue))
                                .attr("width", valScale(d.pcValue))
                                .attr("height", barWidth)

                            //@todo - instead, use axis.clamp(true)
                            const clamp = projValue => d3.max([0, d3.min([projValue, 100])]);

                            //projected rect
                            g.select("rect.proj-bar")
                                .attr("height", barWidth)
                                .attr("x", valScale(d.pcValue))
                                //.attr("width", 0)
                                //.transition()
                                //.duration(1000)
                                    //.attr("x", valScale(projPCValueToShow(d))) //@todo - instead, use axis.clamp(true)
                                    .attr("width", d3.max([valScale(clamp(d.projPCValue)) - valScale(d.pcValue), 0]));

                            g.select("text")
                                .attr("transform", "translate(-3," +barWidth/2 +")")
                                .attr("fill", d.isSelected ? grey10(7) : grey10(5))
                                .style("font-size", labelSettings.fontSize)
                                .text(d.label);
                            
                            //const tickWidth = barWidth * 0.33;
                            //const tickHeight = tickWidth;
                            //g.select(".tick")
                              //  .attr("display", d.projPCValue < 100 ?  "none" : "inline")
                              //.attr("width", tickWidth)
                               // .attr("height", tickHeight)
                               // .attr("x", barWidth/2 - tickWidth/2)
                                //.attr("y",-tickHeight)
                                //.attr("opacity", 0)
                               // .transition()
                                //.delay(1000)
                               // .duration(300)
                                   // .attr("opacity", 1);
                            
                        })
                })

        })
        return selection;
    }     

    barChart.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return barChart;
    };
    barChart.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return barChart;
    };
    barChart.zoomScale = function (value) {
        if (!arguments.length) { return zoomScale; }
        zoomScale = value;
        return barChart;
    };
    barChart.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }else{
            onMouseover = function(){};
        }
        return barChart;
    };
    barChart.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }else{
            onMouseout = function(){};
        }
        return barChart;
    };
    barChart.labelSettings = function (value) {
        if (!arguments.length) { return labelSettings; }
        labelSettings = { ...labelSettings, ...value };
        return barChart;
    };
    barChart.axisSettings = function (value) {
        if (!arguments.length) { return axisSettings; }
        axisSettings = { ...axisSettings, ...value };
        return barChart;
    };
    barChart.on = function () {
        if (!dispatch) return barChart;
        // attach extra arguments
        const value = dispatch.on.apply(dispatch, arguments);
        return value === dispatch ? barChart : value;
    };
    return barChart;
}