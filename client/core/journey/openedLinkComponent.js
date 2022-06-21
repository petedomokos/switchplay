import * as d3 from 'd3';
import barChartComponent from './barChartComponent';
import tooltipComponent from './tooltipComponent';

/*

*/
export default function openedLinkComponent() {
    // dimensions
    let width = 600;
    let height = 600;
    let margin = { left:0, right:0, top:0, bottom:0 }
    let contentsWidth;
    let contentsHeight;

    let TOOLTIP_WIDTH = 140;
    let TOOLTIP_HEIGHT = 60;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
    };

    let barChartSettings = {};

    //let hoveredLinkId;
    let activeGoalId;
    let mouseoutTimer;

    //components
    let barChart;
    let tooltip;

    //api handlers
    let onMouseover = function(){};

    //dom
    let containerG;
    let prevData;

    function openedLink(selection) {
        selection.each(function(data){
            //console.log("olc data", data)
            updateDimns();
            prevData = data;

            //store ref so we can access it in api settings
            containerG = selection;
            const { id, goalsData: { barChartData, tooltipData } } = data;
            const linkId = id;
            //console.log("update", id)

            //bars
            const barChartG = containerG.selectAll("g.bar-chart").data([barChartData])
            barChartG.enter()
                .append("g")
                    .attr("class", "bar-chart")
                    .each(function(){ barChart = barChartComponent(); })
                    .merge(barChartG)
                    .attr("transform", "translate("+(-contentsWidth * 0.5) +",0)")
                    .each(function(d){
                        d3.select(this)
                            .call(barChart
                                .width(contentsWidth)
                                .height(contentsHeight)
                                .labelSettings(barChartSettings.labels)
                                .axisSettings(barChartSettings.axis)
                                .onMouseover((e, goal) => {
                                    //console.log("mouseover", id, goal)
                                    //@todo - bug - if going out then back in before timer ends, it sometimes errors - "transition 60 not found"
                                    //inform parent compoiennt so other tooltips are immediately removed
                                    onMouseover(linkId, goal.id);
                                    if(mouseoutTimer) { 
                                        //console.log("stop timer!!!!!!!!!!")
                                        mouseoutTimer.stop();
                                    }
                                    containerG.raise();
                                    activeGoalId = goal.id;
                                    containerG.call(openedLink);

                                })
                                .onMouseout(() => {
                                    mouseoutTimer = d3.timeout(() => {
                                        activeGoalId = undefined;
                                        containerG.call(openedLink);
                                    }, 500)
                                }))
                    })
            //this exit only caled if link stays open but no bar chart data
            // eg user swipes to get a different chart
            barChartG.exit().remove();
                
            //tooltip
            const openedTooltipData = tooltipData.filter(g => g.id === activeGoalId);
            //console.log("activeGoal", activeGoal)
            //console.log("otd for link "+linkId, openedTooltipData)
            const tooltipG = containerG.selectAll("g.tooltip").data(openedTooltipData)
            //BUG - since changing containerG to be passed through, we have tooltipG not entering but updating!
            tooltipG.enter()
                .append("g")
                    .attr("class", "tooltip")
                    .attr("opacity", 0)
                    .each(function(d){ 
                        tooltip = tooltipComponent();
                        d3.select(this)
                            .transition()
                                .delay(200)
                                .duration(200)
                                .attr("opacity", 1)
                    })
                    .merge(tooltipG)
                    .attr("transform", "translate("+(-TOOLTIP_WIDTH * 0.5) +"," +(contentsHeight * 1.1) +")")
                    .each(function(d){
                        //console.log("update tooltip", linkId)
                        d3.select(this).call(tooltip
                            .width(TOOLTIP_WIDTH)
                            .height(TOOLTIP_HEIGHT)) 
                    })

            tooltipG.exit()
                .transition()
                    .duration(200)
                    .attr("opacity", 0)
                    .on("end", function(){ d3.select(this).remove() });
        }) 
        
        return selection;
    }     

    openedLink.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return openedLink;
    };
    openedLink.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return openedLink;
    };
    openedLink.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = { ...margin, ...value };
        return openedLink;
    };
    openedLink.barChartSettings = function (value) {
        if (!arguments.length) { return barChartSettings; }
        barChartSettings = { ...barChartSettings, ...value };
        return openedLink;
    };
    openedLink.activeGoalId = function (value) {
        if (!arguments.length) { return activeGoalId; }
        activeGoalId = value;
        containerG.call(openedLink)

        return openedLink;
    };
    openedLink.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        onMouseover = value;
        return openedLink;
    };
    return openedLink;
}