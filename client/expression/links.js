import * as d3 from 'd3';
import { planetsComponent} from "./planetsComponent";
import { DIMNS } from "./constants";

/*

*/

export default function links() {
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
            console.log("links...", data)
            const { x, y } = scales;

            const pathD = (l) => {
                const x0 = x(l.src.colNr) + l.src.displayWidth * 0.5;
                const y0 = y(l.src.height) + l.src.displayHeight;
                const x1 = x(l.targ.colNr) + l.src.displayWidth * 0.5;
                const y1 = y(l.targ.height);
                return "M" + x0 +"," + y0 +"L" + x1 + "," +y1;
            }

            //PLANETS
            const linkG = d3.select(this).selectAll("g.link").data(data);
            linkG.enter()
                .append("g")
                    .attr("class", "link")
                    .each(function(d){
                        d3.select(this)
                            .append("path")
                                .attr("stroke", "black")
                                .attr("stroke-width", 0.1)
                    })
                    .merge(linkG)
                    //.attr("transform", d => "translate("+xScale(d.src.colNr)+"," + yScale(d.src.height) +")")
                    .each(function(d){
                        d3.select(this).select("path")
                            .attr("d", pathD(d));
                    })
            //exit
            linkG.exit().remove();


       
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