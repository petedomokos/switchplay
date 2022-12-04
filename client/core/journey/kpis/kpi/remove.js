import * as d3 from 'd3';

export default function remove(selection, options={}){
    const { delay=0, duration=200 } = options;
    selection.each(function(d){
        //will be multiple exits because of the delay in removing
        if(!d3.select(this).attr("class").includes("exiting")){
            d3.select(this)
                .classed("exiting", true)
                .transition()
                    .delay(delay)
                    .duration(duration)
                    .attr("opacity", 0)
                    .on("end", function() { d3.select(this).remove(); });
        }
    })
}