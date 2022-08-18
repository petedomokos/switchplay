import * as d3 from 'd3';
import barChartComponent from './barChartComponent';

export default function quadrantBarChartComponent() {
    // dimensions
    let margin = {left:10, right:10, top: 10, bottom:10};
    let width = 800;
    let height = 600;
    let contentsWidth;
    let contentsHeight;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

    };

    const barChartComponents = {};
    let scale;

    function chart(selection) {
        updateDimns();
        if(!scale){
            selection.call(init);
        }
        selection.each(function (data,i) {
            console.log("quad chart", data)
            const { maxScore, maxNrOfBars, quadrantsData } = data;
             //COMMON SETTINGS
            //bar width 
            //note - width is based on maxNrOfBrs, not actual number of bars
            //@todo - if maxNrBars notset, default to the max actual nr of bars in the 4 quadrants data
            //note - no gaps for bars in this chart
            const barChartWidth = contentsWidth / 2;
            //const barChartMargin = { left:0, right:0, top: 0, bottom:0 };
            const barChartMargin = { left:1, right:1, top: 1, bottom:1 };
            const barsAreaWidth = barChartWidth - barChartMargin.left - barChartMargin.right;
            const barWidth = (barsAreaWidth / maxNrOfBars);

            //labels
            //@todo - space for labels and subtract from contentsHeight to get barChartHeight
            const barChartHeight = contentsHeight/2;
            const barsAreaHeight = barChartHeight - barChartMargin.top - barChartMargin.bottom;

            //scale
            scale.domain([0, maxScore]).range([0, barsAreaHeight]);

            const containerG = d3.select(this);

            const contentsG = containerG.select("g.contents")
                .attr("transform", `translate(${margin.left},${margin.right})`)
                .attr("width", contentsWidth)
                .attr("height", contentsHeight)

            contentsG.selectAll("g.bar-chart").data(quadrantsData, d => d.key)
                .join(
                    enter => enter.append("g")
                        .attr("class", "bar-chart")
                )
                .attr("transform", (d,i) => {
                    const x = i % 2 === 0 ? 0 : contentsWidth / 2;
                    const y = i <= 1 ? 0 : contentsHeight / 2;
                    return `translate(${x},${y})`
                })
                .call(barChartComponents[i]
                    .width(contentsWidth/2)
                    .height(contentsHeight/2)
                    .margin(barChartMargin)
                    .barWidth(barWidth)
                    .gap(0)
                    .orientation("vertical")
                    .direction((d,i) => i <= 1 ? "up" : "down")
                    .scale(scale))
        })

        function init(selection){
            selection.each(function(d,i){
                d3.select(this).append("g").attr("class", "contents");

                //1 bar chart component per quadrantBarChart 
                barChartComponents[i] = barChartComponent();

                //common scale
                scale = d3.scaleLinear();
            })
        }

        function update(settings={}){
            
           
        }

        return selection;
    }

    //api
    chart.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = { ...margin, ...value};
        return chart;
    };
    chart.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return chart;
    };
    chart.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return chart;
    };

    return chart;
};
