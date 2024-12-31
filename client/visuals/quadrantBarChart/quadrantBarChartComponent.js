import * as d3 from 'd3';
import { isNumber } from '../../data/dataHelpers';
import { fadeInOut, remove } from '../../core/journey/domHelpers';

export default function quadrantBarChart() {
    // settings that apply to all quadrantBartCharts, in case there is more than 1 eg a row of players
    let margin = { left:0, right:0, top: 0, bottom:0 };
    let width = 800;
    let height = 600;
    let contentsWidth;
    let contentsHeight;

    let chartTitleHeight = 30;

    let axesStrokeWidth;
    let quadrantWidth;
    let quadrantHeight;
    let quadrantTitleHeight = 20;

    let barsAreaWidth;
    let barsAreaHeight;
    let extraHorizMargin;
    let extraVertMargin;

    let styles = {
        chart:{
            title:{
                fontSize:12
            }
        },
        quadrant:{
            title:{
                fontSize:10
            }
        },
        bar:{
            fontSize:10
        }
    }

    //settings
    let withChartTitles = true;
    let withQuadrantTitles = true;

    function updateDimns(){
        //console.log("w h m", width, height, margin)
        const maxContentsWidth = width - margin.left - margin.right;
        const maxContentsHeight = height - margin.top - margin.bottom;
        //set chartTitleheight to reduce down to a min
        chartTitleHeight = d3.max([11, maxContentsHeight * 0.1]);
        //console.log("maxCW, maxCH chartTitH", maxContentsWidth, maxContentsHeight, chartTitleHeight)
        if(maxContentsWidth < 100 || maxContentsHeight < 120){
            //remove quad labels
            withQuadrantTitles = false;
            quadrantTitleHeight = 0;
            if(maxContentsWidth < 40 || maxContentsHeight < 70){
                withChartTitles = false;
                chartTitleHeight = 0;
            }
        }

        //contentsheight includes space for quad titles, whereas contenstWidth doesnt
        contentsWidth = d3.min([maxContentsWidth, maxContentsHeight - chartTitleHeight - 2 * quadrantTitleHeight]);
        contentsHeight = contentsWidth + chartTitleHeight + 2 * quadrantTitleHeight;

        const extraHorizSpace = maxContentsWidth - contentsWidth;
        const extraVertSpace = maxContentsHeight - contentsHeight;
        extraHorizMargin = extraHorizSpace/2;
        extraVertMargin = extraVertSpace/2;

        axesStrokeWidth = d3.min([10, contentsWidth * 0.01]);
        quadrantWidth = (contentsWidth - axesStrokeWidth)/2;
        //quadrant title is part of the quadrant, whereas chart title is not, so we subtract it
        quadrantHeight = (contentsHeight - chartTitleHeight - axesStrokeWidth)/2;
        //Each bar area works out as a square because of the way dimns are done above
        barsAreaWidth = quadrantWidth;
        barsAreaHeight = quadrantHeight - quadrantTitleHeight;

        //styles that are based on dimns
        styles.chart.title.fontSize = chartTitleHeight * 0.6;
        styles.quadrant.title.fontSize = quadrantHeight * 0.11;
        styles.bar.fontSize = quadrantHeight * 0.09;;//d3.min([]) barsAreaHeight
        //console.log("title fontsize.........", styles.quadrant.title.fontSize)
        if(styles.quadrant.title.fontSize < 6){ withQuadrantTitles = false; }
    };

    //state
    let selectedQuadrantIndex = null;
    //handlers
    let setSelectedQuadrantIndex = () => {};

    function chart(selection) {
        updateDimns();

        selection.each(function (data,i) {
            //console.log("selection", i)
            //console.log("data", data);
            if(d3.select(this).selectAll("*").empty()){ init(this, data); }
            update(this, data);
        })

        function init(containerElement, data, settings={}){
            //'this' is the container
            const container = d3.select(containerElement);
            //here do anything for the chart that isnt repeated for all quadrants
            //or just remove the init-update functions altogether
            //bg
            container.append("rect").attr("class", "chart-bg")
                //.attr("stroke", "grey")
                .attr("fill", "transparent");

            const contentsG = container.append("g").attr("class", "contents");
            /*contentsG.append("rect").attr("class", "contents-bg")
                .attr("stroke-width", 0.1)
                .attr("stroke", "black")
                .attr("fill", "orange")// "transparent");*/

            //chart title and contents gs
            const chartTitleG = contentsG.append("g").attr("class", "chart-title");
            const chartContentsG = contentsG.append("g").attr("class", "chart-contents");

            //title
            chartTitleG.append("text").attr("class", "primary")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "central");

            /*chartTitleG.append("rect").attr("class", "chart-title-bg")
                .attr("stroke", "black")
                .attr("fill", "transparent");*/

            //g that handles scaling when selections made
            chartContentsG.append("g").attr("class", "scale");
        }

        function update(containerElement, data, settings={}){
            update
            //'this' is the container
            const container = d3.select(containerElement);
            //bg
            container.select("rect.chart-bg")
                .attr("width", `${width}px`)
                .attr("height", `${height}px`)
                .on("click", e => {
                    if(isNumber(selectedQuadrantIndex)){
                        setSelectedQuadrantIndex("");
                    }
                });

            const contentsG = container.select("g.contents")
                .attr("transform", `translate(${margin.left + extraHorizMargin}, ${margin.top + extraVertMargin})`)

            /*contentsG.select("rect.contents-bg")
                .attr("width", `${contentsWidth}px`)
                .attr("height", `${contentsHeight}px`);*/

            //chart title
            const chartTitleG = contentsG.select("g.chart-title");
            /*chartTitleG.select("rect.chart-title-bg")
                .attr("width", `${contentsWidth}px`)
                .attr("height", `${chartTitleHeight}px`);*/

            chartTitleG.select("text.primary")
                .attr("transform", `translate(${contentsWidth/2}, ${chartTitleHeight/2})`)
                .attr("font-size", styles.chart.title.fontSize)
                .text(data.title || "")

            //Chart contents
            const chartContentsG = contentsG.select("g.chart-contents")
                .attr("transform", `translate(0, ${chartTitleHeight})`);

            //scaling transforms
            const scaleG = chartContentsG.select("g.scale");

            const chartTransformOrigin = 
                selectedQuadrantIndex === 0 ? `${contentsWidth} ${contentsHeight}` :
                selectedQuadrantIndex === 1 ? `0 ${contentsHeight}` :
                selectedQuadrantIndex === 2 ? `${contentsWidth} 0` :
                `0 0`;

            scaleG
                .transition()
                .delay(isNumber(selectedQuadrantIndex) ? 0 : 75)
                .duration(500)
                    .attr("transform", `scale(${isNumber(selectedQuadrantIndex) ? 0.5 : 1})`)
                    .attr("transform-origin", chartTransformOrigin);

            
            //Quadrants
            //@todo - USE JOIN INSTEAD OF THIS OUT-OF-DATE TECHNIQUE
            const quadrantContainerG = scaleG.selectAll("g.quadrant-container").data(data.quadrantsData, d => d.key)
            quadrantContainerG.enter()
                .append("g")
                    .attr("class", (d,i) => `quadrant-container quandrant-container-${d.key}`)
                    .each(function(d,i){
                        const quadrantContainerG = d3.select(this);
                        const quadrantG = quadrantContainerG.append("g").attr("class", "quadrant")

                        quadrantG
                            .append("text")
                                .attr("class", "quadrant-title")
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")
                                .attr("opacity", withQuadrantTitles ? 1 : 0)
                                .attr("display", withQuadrantTitles ? null : "none");

                        /*quadrantG
                            .append("rect")
                                .attr("class", "quadrant-bg")
                                .attr("stroke", "grey")
                                .attr("stroke-width", 0.1)
                                .attr("fill", "none");*/

                        const barsAreaG = quadrantG.append("g").attr("class", "bars-area");
                        barsAreaG
                            .append("rect")
                                .attr("class", "bars-area-bg")
                                .attr("stroke", isNumber(selectedQuadrantIndex) && selectedQuadrantIndex !== i ? "grey" : "blue")
                                .attr("stroke-width", isNumber(selectedQuadrantIndex) && selectedQuadrantIndex !== i ? 0.1 : 0.5)
                                .attr("fill", "transparent");
                         
                        barsAreaG.append("g").attr("class", "bars");
                    })
                    .merge(quadrantContainerG)
                    .attr("transform", (d,i) => `translate(${(i === 0 || i === 2) ? 0 : quadrantWidth + axesStrokeWidth}, ${(i === 0 || i === 1) ? 0 : quadrantHeight + axesStrokeWidth})`)
                    .on("click", function(e,d){
                        e.stopPropagation();
                        if(selectedQuadrantIndex !== d.i){
                            setSelectedQuadrantIndex(d.i)
                        }else{
                            //this is temp until we have a close icon and cna then interact with selected chart
                            setSelectedQuadrantIndex("")
                        }
                    })
                    .each(function(quadD,i){
                        const quadrantContainerG = d3.select(this);
                        //make sure bar labels etc are on top of DOM
                        if(selectedQuadrantIndex === i){ quadrantContainerG.raise(); }

                        const quadScale = i === selectedQuadrantIndex ? 3 : 1;
                        const quadTransformOrigin =
                            selectedQuadrantIndex === 0 ? `${quadrantWidth} ${quadrantHeight}` :
                            selectedQuadrantIndex === 1 ? `0 ${quadrantHeight}` :
                            selectedQuadrantIndex === 2 ? `${quadrantWidth} 0` :
                            `0 0`;

                        const quadrantG = quadrantContainerG.select("g.quadrant");
                        quadrantG
                            .transition()
                            .delay(isNumber(selectedQuadrantIndex) ? 75 : 0)
                            .duration(500)
                                .attr("transform", `scale(${quadScale})`)
                                .attr("transform-origin", quadTransformOrigin);

                        const titleShiftHoriz = i === 0 || i === 2 ? barsAreaWidth/2 : barsAreaWidth/2;
                        const titleShiftVert = i === 0 || i === 1 ? quadrantTitleHeight/2 : quadrantHeight - quadrantTitleHeight/2;
                        quadrantG.select("text.quadrant-title")
                            .attr("transform", `translate(${titleShiftHoriz}, ${titleShiftVert})`)
                            .attr("font-size", styles.quadrant.title.fontSize)
                            .text(quadD.title)
                                .transition()
                                .duration(200)
                                    .attr("opacity", withQuadrantTitles ? 1 : 0)
                                    .on("end", function(){ d3.select(this).attr("display", withQuadrantTitles ? null : "none") });
                        
                        /*
                        quadrantG.select("rect.quadrant-bg")
                            .attr("width", quadrantWidth)
                            .attr("height", quadrantHeight);*/
                        
                        const barAreaShiftVert = i === 0 || i === 1 ? quadrantTitleHeight : 0;
                        const barsAreaG = quadrantG.select("g.bars-area")
                            .attr("transform", `translate(0, ${barAreaShiftVert})`);

                        barsAreaG.select("rect.bars-area-bg")
                            .attr("width", barsAreaWidth)
                            .attr("height", barsAreaHeight);

                        barsAreaG.select("rect.bars-area-bg")
                                .transition()
                                .duration(500)
                                .attr("stroke", isNumber(selectedQuadrantIndex) && selectedQuadrantIndex !== i ? "grey" : "blue")
                                .attr("stroke-width", isNumber(selectedQuadrantIndex) && selectedQuadrantIndex !== i ? 0.1 : 0.5)

                        //bars
                        const nrBars = quadD.values.length;
                        const nrGaps = nrBars - 1;
                        const potentialTotalSpaceForGaps = barsAreaWidth * 0.05;
                        const potentialGapBetweenBars = potentialTotalSpaceForGaps / nrGaps;
                        //gap must not be as large as the axeswidth
                        const gapBetweenBars = d3.min([axesStrokeWidth * 0.7, potentialGapBetweenBars]);
                        const totalSpaceForBars = barsAreaWidth - gapBetweenBars * nrGaps;
                        const barWidth = totalSpaceForBars/nrBars;
                        const barLabelWidth = 50;
                        const barLabelHeight = 15;

                        const barsG = barsAreaG.select("g.bars");
                        const barG = barsG.selectAll("g.bar").data(quadD.values);
                        barG.enter()
                            .append("g")
                                .attr("class", "bar")
                                .each(function(barD,i){
                                    const barHeight = (barD.value/100) * barsAreaHeight;
                                    const barG = d3.select(this);
                                    barG.append("rect")
                                        .attr("class", "bar")
                                        .attr("width", barWidth)
                                        .attr("height", barHeight)
                                        .attr("fill", !isNumber(selectedQuadrantIndex) || selectedQuadrantIndex === i ? "blue" : "grey");

                                    /*
                                    const labelG = barG.append("g")
                                        .attr("class", "bar-label")
                                        .attr("opacity", selectedQuadrantIndex === i ? 1 : 0);
                                    
                                    labelG.append("rect")
                                        .attr("fill", "black")
                                        .attr("rx", "2")
                                        .attr("ry", "2")
                                    
                                    labelG.append("text")
                                        .attr("x", "5px")
                                        .attr("y", `${barLabelHeight/2}`)
                                        .attr("dominant-baseline", "central")
                                        .attr("fill", "white")
                                        .attr("stroke", "white")
                                        .attr("stroke-width", 0.1)
                                        .attr("font-size", styles.bar.fontSize)
                                        .text("label");
                                    */

                                })
                                .merge(barG)
                                .each(function(barD,j){
                                    const barHeight = (barD.value/100) * barsAreaHeight;
                                    //no space between bars and outer edge of chart
                                    const barG = d3.select(this)
                                        .attr("transform", `translate(${j * (barWidth + gapBetweenBars)},${i < 2 ? barsAreaHeight - barHeight : 0})`);

                                    barG.select("rect.bar")
                                        .transition()
                                        .duration(500)
                                            .attr("width", barWidth)
                                            .attr("height", barHeight)
                                            .attr("fill", !isNumber(selectedQuadrantIndex) || selectedQuadrantIndex === i ? "blue" : "grey");

                                    //@todo- work out why (Math.cos(Math.PI/4) * barLabelHeight) doesnt shift teh label down enough
                                    const labelX = i < 2 ? -barWidth/2 + barLabelHeight * 0.3 : barWidth/2 - barLabelHeight * 0.3;
                                    const labelY = i < 2 ? barHeight +(barLabelHeight * 1.65) /*+ (Math.cos(Math.PI/4) * barLabelHeight)*/: 0// barLabelHeight * 0.25;
                                    const labelG = barG.select("g.bar-label")
                                        .attr("transform", `translate(${labelX} ${labelY}) rotate(-45)`)
                                        
                                    /*
                                    labelG
                                        .transition()
                                        .duration(500)
                                            .attr("opacity", selectedQuadrantIndex === i ? 1 : 0);

                                    labelG.select("rect")
                                        .attr("width", `${barLabelWidth}px`)
                                        .attr("height", `${barLabelHeight}px`)
                                        .attr("opacity", 0.8);
                                        */

                                })

                        barG.exit().remove();

                    })
            
            quadrantContainerG.exit().remove();


        }

        return selection;
    }

    //api
    chart.sizes = function (values) {
        if (!arguments.length) { return sizes; }
        width = values.width || width;
        height = values.height || height;
        //@todo - add margin in, but this be on outside of each quadrant
        margin = values.margin ? { ...margin, ...values.margin } : margin;
        return chart;
    };
    chart.selectedQuadrantIndex = function (value) {
        if (!arguments.length) { return selectedQuadrantIndex; }
        selectedQuadrantIndex = value;
        return chart;
    };
    chart.setSelectedQuadrantIndex = function (func) {
        if (!arguments.length) { return setSelectedQuadrantIndex; }
        setSelectedQuadrantIndex = func;
        return chart;
    };
    return chart;
};
