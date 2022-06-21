import * as d3 from 'd3';
import { COLOURS, DIMNS } from "../../constants"

/*
    note - downside of merging blockG before pasing through here is ts a bit trickier to do update only
    but we can still do it using and else() after the if statement
*/
export function homeVisGenerator(selection){
    let width = 130;
    let height = 40;
    let margin =  DIMNS.block.children.margin;
    let contentsWidth;
    let contentsHeight;
    const updateDimns = () =>{
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
    }

    function myHomeVis(selection){        
        selection.each(function(blockData){
            const visMargins =  { ...DIMNS.block.vis.margins, ...DIMNS.block.vis.home.margins }
            //bind
            const contentsG = d3.select(this).selectAll("g.vis-contents").data([blockData])
            //enter contents
            const contentsGEnter = contentsG.enter().append("g").attr("class", "vis-contents")
                .attr("transform", "translate(+"+margin.left +"," + margin.right +")")
                .each(function(d){
                    //ellipse
                    d3.select(this)
                        .append("ellipse")
                            .attr("stroke", COLOURS.exp.vis.val)
                            .attr("fill", "#C0C0C0")

                    //text
                    d3.select(this)
                        .append("text")
                            .attr("class", "display-name")
                           // .attr("stroke", "black")
                            //.attr("fill", "black")
                            .attr("text-anchor", "middle")
                            .attr("dominant-baseline", "middle")
                            .attr("font-size", 9)
                });
            //upate contents
            contentsG.merge(contentsGEnter)
                //.attr("opacity", d => d.res ? 1 : 0)

            //@todo - check we are merging twice here
            
            //ellipse
            contentsGEnter
                .merge(contentsG)
                .each(function(d){
                    //ellipse
                    d3.select(this).select("ellipse")
                        .attr("cx", contentsWidth/2)
                        .attr("cy", contentsHeight/2)
                        .attr("rx", 30)
                        .attr("ry", 10)
                    
                    //text
                    d3.select(this).select("text.display-name")
                        .attr("transform", "translate(+"+contentsWidth/2 +"," + contentsHeight/2 +")")
                        .text(d.res?.displayName || "")
                
                })
        })
        return selection;
    }

    // api
    myHomeVis.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        updateDimns();
        return myHomeVis;
        };
    myHomeVis.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        updateDimns();
        return myHomeVis;
    };
    myHomeVis.applicableContext = "Planet"
    myHomeVis.funcType = "homeSel"
    return myHomeVis;

    }
