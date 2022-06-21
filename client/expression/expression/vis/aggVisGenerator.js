import * as d3 from 'd3';
import { COLOURS, DIMNS } from "../../constants"
/*
    note - downside of merging blockG before pasing through here is ts a bit trickier to do update only
    but we can still do it using and else() after the if statement
*/
export function aggVisGenerator(selection){
    let width = 130;
    let height = 40;
    let margin =  { bottom:0 };
    let contentsHeight = height - margin.bottom;
    let contentsWidth = width;
    const updateDimns = () =>{
        contentsHeight = height - margin.bottom;
        contentsWidth = width;
        //todo - call update
    }
    function myAggVis(selection){      
        selection.each(function(blockData){
            console.log("AggVis data", blockData)
            const visMargins =  { ...DIMNS.block.vis.margins, ...DIMNS.block.vis.agg.margins }
            //visContentsG 
            const visContentsG = d3.select(this).selectAll("g.vis-contents").data([blockData])
            //we call the merged version contents 
            const contentsG = visContentsG.enter()
                .append("g")
                .attr("class", "vis-contents")
                .merge(visContentsG)
                //.attr("opacity", d => d.selected || d.op ? 1 : 0)
           
            //result
            const resG = contentsG.selectAll("g.res").data([blockData])
            const resGEnter = resG.enter()
                .append("g")
                    .attr("class", "res")
                    .attr("transform", "translate(" +(contentsWidth * 0.5) +"," +(contentsHeight * 0.5) +")")
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
            
            resGEnter
                .append("text")
                    .attr("class", "result")
                    .attr("fill", COLOURS.exp.vis.val)
                    .style("font-size", "18px")

            //for agg, we know res will be a value
            resG.merge(resGEnter).select("text.result")
                    .text(d => "= "+(d.res || ""))

        })
        return selection;
    }

    // api
    myAggVis.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        updateDimns();
        return myAggVis;
        };
    myAggVis.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        updateDimns();
        return myAggVis;
    }
    myAggVis.applicableContext = "Planet"
    myAggVis.funcType = "agg"

    return myAggVis;

}
