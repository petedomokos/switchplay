import * as d3 from 'd3';

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

    function chart(selection) {
        updateDimns();

        selection.each(function (data) {
            console.log("data", data)
        })

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
