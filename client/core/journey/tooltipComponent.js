import * as d3 from 'd3';
import textWrap from "./textWrap";
import tableComponent from "./tableComponent";
import { grey10 } from './constants';

/*

*/
export default function tooltipComponent() {
    // dimensions
    let margin = { left:5, right:5, top: 5, bottom:5};
    let width = 100;
    let height = 60;
    let contentsWidth;
    let contentsHeight;
    let nameHeight;
    let tableHeight;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
        nameHeight = contentsHeight * 0.35;
        tableHeight = contentsHeight * 0.65;
    };

    let prevData;
    let entered = false;

    //dom
    let containerG;
    let contentsG;
    let bgG;
    let nameG;
    let tableG;

    const nameWrap = textWrap();
    const table = tableComponent();

    function tooltip(selection) {
        selection.each(function(data){
            containerG = d3.select(this)
                .attr("pointer-events", "none");
            updateDimns();
            //enter
            if(containerG.select("g.tooltip-contents").empty()){ 
                enter.call(this);
            }

            update();

            function enter() {
                containerG = d3.select(this);

                containerG
                    .attr("opacity", 0)
                    .transition()
                        .duration(200)
                        .attr("opacity", 1);

                bgG = containerG
                    .append("rect")
                        .attr("class", "bg")
                        .attr("fill", grey10(2))

                contentsG = containerG
                    .append("g")
                        .attr("class", "contents tooltip-contents")
                        .attr("transform", "translate(" +margin.left +"," +margin.top +")")
                
                nameG = contentsG.append("g").attr("class", "name")
                    .attr("text-anchor", "middle")
                    .attr("font-size", 5)

                tableG = contentsG.append("g").attr("class", "table")
                
            }

            function update(){
                bgG
                    .attr("width", width)
                    .attr("height", height);

                //nameG.select("rect")
                    //.attr("width", contentsWidth)
                    //.attr("height", nameHeight);

                nameG
                    .call(nameWrap
                        .text(data?.title), {
                            width:contentsWidth, 
                            height:nameHeight
                        });

                tableG
                    .attr("transform", "translate(0," +nameHeight +")")
                    .datum(data)
                    .call(table
                        .width(contentsWidth)
                        .height(tableHeight))
            }
        })

        return selection;
    }

    //api
    tooltip.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = { ...margin, ...value};
        return tooltip;
    };
    tooltip.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return tooltip;
    };
    tooltip.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return tooltip;
    };

    return tooltip;
}
