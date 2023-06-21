import * as d3 from 'd3';

export default function edgeChartComponent() {
    // dimensions
    let width = 0;
    let height = 0;
    let margin = { left: 0, right: 0, top: 0, bottom: 0 };
    let contentsWidth;
    let contentsHeight;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
    }

    let _styles = () => DEFAULT_STYLES;

    function edgeChart(selection, options={}) {
        //dimns are shared between all charts (if more than one, eg. a series of small multiples)
        updateDimns();

        selection.each(function (data) {
            const containerG = d3.select(this)
                .attr("width", width)
                .attr("height", height);

            if(containerG.select("g.edge-chart-contents").empty()){
                containerG.call(init);
            }

            containerG.call(update, data);
        })

        function init(containerG){
            const contentsG = containerG.append("g").attr("class", "edge-chart-contents");
            contentsG.append("rect").attr("class", "edge-chart-contents-bg")
            
        }

        function update(containerG, data){
            const contentsG = containerG.select("g.edge-chart-contents");
            contentsG.select("rect.edge-chart-contents-bg")
                .attr("width", width)
                .attr("height", height)
                .attr("stroke", "grey")
                .attr("fill", "transparent")

            console.log("data", data)


        }

         
    }
    
    //api
    edgeChart.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return edgeChart;
    };
    edgeChart.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return edgeChart;
    };
    edgeChart.styles = function (value) {
        if (!arguments.length) { return _styles; }
        if(typeof value === "function"){
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value(d,i) });
        }else{
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value });
        }
        
        return edgeChart;
    };
    return edgeChart;
}
 