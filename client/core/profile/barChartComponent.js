import * as d3 from 'd3';

export default function barChartComponent() {
    // dimensions
    let margin = { left:0, right:0, top: 0, bottom:0 };
    let width = 800;
    let height = 600;
    let contentsWidth;
    let contentsHeight;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
    };

    let orientation = "vertical";
    let direction = () => "up";
    let fixedBarWidth;
    let gap = 5;
    let fixedScale;
    let scale;

    function chart(selection) {
        updateDimns();

        selection.each(function (data, i) {
            const { title, barData } = data;
            const containerG = d3.select(this);
            console.log("bar", data)
            containerG.call(init);

            if(!fixedScale) {
                //@todo - update scale
            }

            const barScale = fixedScale || scale;

            const contentsG = containerG.select("g.contents")
                .attr("transform", `translate(${margin.left},${margin.left})`)

            contentsG.select("rect.inner-bg")
                .attr("width", contentsWidth)
                .attr("height", contentsHeight)
                .attr("stroke", "grey")
                .attr("stroke-width", 0.3)
                .attr("fill", "transparent")
            
            //BARS
            //@todo - instead of 10, default to calculating the space available
            const barWidth = fixedBarWidth || 10;
            const _direction = direction(data,i);

            const barG = contentsG.selectAll("g.bar").data(barData, d => d.key)
            barG.enter()
                .append("g")
                    .attr("class", "bar")
                    .each(function(d,j){
                        const barG = d3.select(this);
                        barG.append("rect");
                    })
                    .merge(barG)
                    .attr("transform",(d,j) => `translate(${j * barWidth}, ${_direction === "up" ? contentsHeight - barScale(d.value) : 0})`)
                    .each(function(d,j){
                        const barG = d3.select(this);
                        barG.select("rect")
                            .attr("width", barWidth)
                            .attr("height", barScale(d.value))
                            .attr("stroke", "red")
                            .attr("fill", "#E97451")

                    })

            //TITLE
            const x = contentsWidth * (i % 2 === 0 ? 0.2 : 0.8);
            const y = contentsHeight * (i <= 1 ? 0.2 : 0.8);
            contentsG.select("text.title")
                .raise()
                .attr("transform", `translate(${x}, ${y})`)
                .attr("stroke-width", 0.3)
                .attr("font-size", 14)
                .attr("stroke", "grey")
                .attr("fill", "grey")
                .text(title)
            
        })

        function update(settings={}){
            
           
        }

        function init(containerG){
            const contentsG = containerG.append("g").attr("class", "contents");

            contentsG.append("rect").attr("class", "inner-bg");

            contentsG.append("text").attr("class", "title quadrant-title")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "central")

            //@todo - if no fixed scale passed in, must create one

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
    chart.orientation = function (value) {
        if (!arguments.length) { return orientation; }
        if(typeof value === "function"){
            orientation = value;
        }
        return chart;
    };
    chart.direction = function (value) {
        if (!arguments.length) { return direction; }
        direction = value;
        return chart;
    };
    chart.gap = function (value) {
        if (!arguments.length) { return gap; }
        gap = value;
        return chart;
    };
    chart.barWidth = function (value) {
        if (!arguments.length) { return fixedBarWidth; }
        fixedBarWidth = value;
        return chart;
    };
    chart.scale = function (value) {
        if (!arguments.length) { return fixedScale || scale; }
        fixedScale = value;
        return chart;
    };

    return chart;
};
