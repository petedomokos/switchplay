
import * as d3 from 'd3';
import dragEnhancements from './enhancedDragHandler';

const enhancedDrag = dragEnhancements();

export default function nameComponent(containerG, options={}){
    const {
        shouldDisplay = true,
        className = "name", //note - can only take one classname
        translate = { x: 0, y: 0},
        bg,
        text,
        onClick = function(){ console.log("clicked")},
        onDblClick = function(){},
        longpressStart = function(){}
    } = options;
    //console.log("opts", options)

    const { width, height } = bg;  //can also pass x and y
    const { name, textAnchor = "start", fill = "transparent", fontSize = 12, stroke = "black", strokeWidth = 0.1 } = text;  //can also pass x and y

    enhancedDrag
        .onClick((e, d) => { 
            console.log("clk", onClick)
            onClick(e, d)
        })
        .onDblClick(onDblClick)
        .onLongpressStart(longpressStart);

    const drag = d3.drag()
        .on("start", enhancedDrag(() => { console.log("test")} ))
        .on("drag", enhancedDrag())
        .on("end", enhancedDrag());

    containerG.each(function(d){
        const nameG = containerG.selectAll("g." +className).data(shouldDisplay ? [d] : []);
        nameG.enter()
            .append("g")
                .attr("class", className)
                .each(function(d){
                    const nameG = d3.select(this);

                    nameG
                        .attr("opacity", 0)
                        .transition()
                            .delay(200)
                            .duration(300)
                            .attr("opacity", 1);

                    nameG
                        .append("rect")
                            .attr("class", "bg")
                            .attr("fill", fill)
                            .attr("stroke", "none");
                    nameG
                        .append("text")
                            .attr("class", "main")
                            .attr("dominant-baseline", "central")
                            .attr("stroke", stroke)
                            .attr("stroke-width", strokeWidth);

                })
                .merge(nameG)
                .attr("transform", "translate(" + translate.x + "," +translate.y +")")
                .attr("cursor", "pointer")
                .call(drag) //need drag just to prevent canvas receiving the click - dont know why
                .each(function(d){
                    const nameG = d3.select(this);
                    nameG.select("rect.bg")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("x", bg.x)
                        .attr("y", bg.y);

                    nameG.select("text.main")
                        .attr("x", text.x)
                        .attr("y", text.y)
                        .attr("text-anchor", textAnchor)
                        .attr("dominant-baseline", "central")
                        .attr("font-size", fontSize)
                        .text(name)

                })
                        
                nameG.exit().each(function(d){
                    //will be multiple exits because of the delay in removing
                    if(!d3.select(this).attr("class").includes("exiting")){
                        d3.select(this)
                            .classed("exiting", true)
                            .transition()
                                .duration(300)
                                .attr("opacity", 0)
                                .on("end", function() { d3.select(this).remove(); });
                    }
                })
        


        
    })

    return containerG;
}
                       