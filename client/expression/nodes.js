import * as d3 from 'd3';
import { planetsComponent} from "./planetsComponent";
import { DIMNS } from "./constants";

/*

*/

export default function nodes() {
    // DIMENSIONS
    let width = 600;
    let height = 600; 
    //SCALES
    let scales = { 
        x:(colNr) => colNr * 75,
        y:(nodeHeight) => (3 - nodeHeight) * 50
    }

    //GENERAL UPDATE
    function update(selection) {
        // expression elements
        selection.each(function (data) {
            console.log("nodes...", data)
            const { x, y } = scales;

            //DOM
            //PLANETS
            const nodeG = d3.select(this).selectAll("g.node").data(data);
            nodeG.enter()
                .append("g")
                    .attr("class", "node")
                    .each(function(d){
                        d3.select(this)
                            .append("rect")
                                .attr("width", 50)
                                .attr("height", 15)
                                .attr("fill", "grey")

                        d3.select(this)
                            .append("text")
                            .attr("transform", "translate(5, 10)")
                            .attr("font-size", 8)
                    })
                    .merge(nodeG)
                    .attr("transform", d => "translate("+x(d.colNr)+"," + y(d.height) +")")
                    .each(function(d){
                        d3.select(this).select("text")
                            .text(d.name)
                    })
            //exit
            nodeG.exit().remove();


       
        })
        return selection;
    }

    // api
    update.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        //update();
        return update;
    };
    update.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        //update();
        return update;
    };
    update.scales = function (value) {
        if (!arguments.length) { return scales; }
        scales = { ...scales, ...value };
        //update();
        return update;
    };
    return update;
}