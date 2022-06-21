import * as d3 from 'd3';
import { COLOURS, DIMNS } from "../constants"

export function functionIconsGenerator(selection){
    //dimensions
    let width = 130;
    let height = 40;
    let margin = { left:DIMNS.editor.children.margin.left, right:5, top:5, bottom:5};
    let contentsWidth;
    let contentsHeight;
    const updateDimns = () =>{
        contentsWidth = width - margin.left - margin.right
        contentsHeight = height - margin.top - margin.bottom;
    }

    //handlers
    let selectFunc = () => {}

    //dom
    let funcIconsG;

    function myFuncIcons(selection){
        selection.each(function(funcsData){
            //console.log("funcsData", funcsData)
            if(!funcIconsG){
                funcIconsG = d3.select(this)
            }

            //dimensions
            updateDimns()
            //Bind
            const iconG = funcIconsG.selectAll("g.icon").data(funcsData, func => func.id)
            //Enter
            const iconGEnter = iconG.enter()
                .append("g")
                    .attr("class", "icon")
                    .merge(iconG)
                    //@todo - put in iconsG so we can aply the margin transfrom just once
                    .attr("transform", (d,i) =>"translate(" +(margin.left +i * 50) + ",0)")
                    .on("click", (e,d) => {
                        selectFunc({...d, isSelected:undefined})
                    }) //donet send isSelected

            //note - this will become the full name and show on hover just below icon
            iconGEnter.append("text")
                .attr("dominant-baseline", "hanging")
                .attr("font-size", 12)

            iconGEnter.append("rect")
                .attr("class", "hitbox")
                .attr("width", 30)
                .attr("height", 15)
                .style("cursor", "pointer")
                .attr("fill", "transparent")

            //Update
            iconG.merge(iconGEnter).select("text")
                .attr("fill", d => d.isSelected ? COLOURS.editor.func.selected : COLOURS.editor.func.nonSelected)
                .text(d => d.name)

            iconG.exit().remove();
            
        })
        return selection;
    }

    // api
    myFuncIcons.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        
        return myFuncIcons;
        };
    myFuncIcons.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        
        return myFuncIcons;
    };
    myFuncIcons.selectFunc = function (value) {
        if (!arguments.length) { return selectFunc; }
        selectFunc = value;
        return myFuncIcons;
    };
    return myFuncIcons;

    }
