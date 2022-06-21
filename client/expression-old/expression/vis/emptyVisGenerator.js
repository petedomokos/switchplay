import * as d3 from 'd3';
import { COLOURS, DIMNS } from "../../constants"

/*
    note - downside of merging blockG before pasing through here is ts a bit trickier to do update only
    but we can still do it using and else() after the if statement
*/
export function emptyVisGenerator(selection){
    let width = 130;
    let height = 40;
    let margin =  { bottom:10 };
    let contentsHeight = height - margin.bottom;
    let contentsWidth = width;
    const updateDimns = () =>{
        contentsHeight = height - margin.bottom;
        contentsWidth = width;
        //todo - call update
    }

    //dom
    //store contents on a separate g that can be removed if op or context changes without affecting the EUE pattern
    let visContentsG;
    function myEmptyVis(selection){  /*     
        selection.each(function(d,i){
            const visG = d3.select(this);
            const visMargins =  { ...DIMNS.block.vis.margins, ...DIMNS.block.vis.empty.margins }
            //enter
            if(visG.select("line").empty()){
                visContentsG = visG.append("g").attr("class", "contents");
                visContentsG
                    .append("line")
                        .attr("x1", 0)
                        .attr("y1", contentsHeight/2)
                        .attr("x2", contentsWidth)
                        .attr("y2", contentsHeight/2)
                        .attr("stroke", "white")
                        //.attr("fill", "#C0C0C0")
                        //.attr("stroke", "grey")

            }

            //update
            visContentsG.attr("opacity", d.of || d.func ? 1 : 0)   

        })
        */
        return selection;
    }

    // api
    myEmptyVis.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        updateDimns();
        return myEmptyVis;
        };
    myEmptyVis.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        updateDimns();
        return myEmptyVis;
    };
    myEmptyVis.applicableContext = "Planet";
    return myEmptyVis;

    }
