import * as d3 from 'd3';
import { COLOURS, DIMNS } from "../constants"

/*
We call a diffrent boxGenerator for each boxG

*/
export function expressionBoxGenerator(selection){
    //todo - work out why heights and widths are not dynamically being upated
    let width = 130;
    let height = 50;
    let margin =  DIMNS.block.children.margin;
    let contentsHeight;
    let contentsWidth;
    const updateDimns = () =>{
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
    }

    //dom
    //store contents on a separate g that can be removed if op or context changes without affecting the EUE pattern
    let contentsG;
    //children
    let preText;
    let primaryText;
    let secondaryText;

    //handlers
    let onFuncClick = () =>{}
    let onFiltersClick = () =>{}
    let onEmptyBlockClick = () => {}
    let onBlockClick = () => {}

    //Note: We call a different boxGenerator for each boxG, so i is always 0
    function myExpressionBox(selection){
        //selection is a single boxG so i always 0
        selection.each(function(blockData){
            const { chainNr, blockNr, func, subFunc, of, isActive } = blockData;

            updateDimns();
            //console.log("expBox",blockData)
            const boxG = d3.select(this)
                .on("click", onBlockClick);
            //ENTER
            if(boxG.select("*").empty()){
                contentsG = boxG.append("g").attr("class", "box-contents");
                //background
                contentsG
                    .append("rect")
                    .attr("class", "background");

                //text
                preText = contentsG
                    .append("text")
                        .attr("class", "pre")
                        .attr("stroke-width", 0.1)
                        //.attr("transform", "translate(5,5)")
                        .attr("transform", "translate(" +(width/2)+", 5)")
                        .attr("text-anchor", "start")
                        .attr("text-anchor", "middle")
                        .attr("dominant-baseline", "hanging")
                        .attr("font-size", 11)
                        .style("cursor", "pointer")
                        //.on("click", onFiltersClick)

                primaryText = contentsG
                    .append("text")
                        .attr("class", "primary")
                        .attr("dominant-baseline", "middle")
                        .attr("stroke-width", 0.1)
                        .attr("font-size", 12)
                        .style("cursor", "pointer")

                secondaryText = contentsG
                    .append("text")
                        .attr("class", "secondary")
                        .attr("dominant-baseline", "middle")
                        .attr("stroke-width", 0.1)
                        .attr("font-size", 11)
                        .style("cursor", "pointer")
                        //.attr("dominant-baseline", "text-bottom")
                    
            }
            //UPDATE
            //@todo - have another g which translates the left and right margin
            //background
            contentsG.select("rect.background")
                .attr("transform", "translate(+"+margin.left +"," + margin.right +")")
                .attr("width", contentsWidth).attr("height", contentsHeight)
                //.attr("fill", isActive ? COLOURS.exp.box.bg.active : COLOURS.exp.box.bg.inactive)
                .attr("fill", "none")
            //text
            //colours
            const colours = COLOURS.exp.box;
            preText.attr("fill", isActive ? colours.pre.active : colours.pre.inactive)
            secondaryText.attr("fill", isActive ? colours.secondary.active : colours.secondary.inactive)
            primaryText.attr("fill", isActive ? colours.primary.active : colours.primary.inactive)

            //note - if func not defined, then planet/prop is also not defined becuse it would at least be 'sel'
            if(func){
                if(func.id === "homeSel"){
                    //show planet in middle
                    primaryText
                        .attr("transform", "translate(" +(width * 0.5) +"," +(height * 0.65) +")")
                        .attr("text-anchor", "middle")
                        .text(of.planet.name.slice(0, of.planet.name.length-1))
                    
                    secondaryText.attr("opacity", 0)
                }
                else if(func.id === "sel" && !of.property){
                    //show planet in middle
                    primaryText
                        .attr("transform", "translate(" + (width * 0.5) +"," + (height * 0.55) +")")
                        .attr("text-anchor", "middle")
                        .text(of.planet.name)
                    
                    secondaryText.attr("opacity", 0)
                }
                else if(func.id === "sel"){
                    //show planet and property (case of no prop is handled above)
                    primaryText
                        .attr("transform", "translate(" +(contentsWidth * 0.5 - 2) + "," + (height * 0.55) +")")
                        .attr("text-anchor", "end")
                        .text(of.planet.name)
                    
                    secondaryText
                        .attr("transform", "translate(" +(contentsWidth * 0.5 + 2) + "," + (height * 0.565) +")")
                        .attr("text-anchor", "start")
                        .attr("opacity", 1)
                        .text(of.property.name)
                }
                else{
                    //show func (and no pre or secondary)
                    primaryText
                        .attr("transform", "translate(" + (width * 0.5) +"," + (height * 0.7) +")")
                        .attr("text-anchor", "middle")
                        .text(subFunc?.name || func.name) //only show func name if no subFunc
                        //.on("click", onFuncClick)
                    
                    secondaryText.attr("opacity", 0)
                }
            }
            else{
                //show instruction
                primaryText
                    .attr("transform", "translate(" +(width * 0.5) +"," +(height * 0.5) +")")
                    .attr("text-anchor", blockNr === 0 ? "start" : "middle")
                    .attr("opacity", 0.7)
                    .text(blockNr === 0 ?  "Choose a home planet for your property" : "Next...")
                    //.on("click", onEmptyBlockClick)
                    //.on("click", () => setActiveBlock([chainNr, blockNr]))
                
                secondaryText.attr("opacity", 0)
            }

            //pre-text
            if(func?.id === 'homeSel'){
                preText
                    .attr("display", "inline")
                    .text("For each")

            }else if(["sel", "filter"].includes(func?.id)){
                preText
                    .attr("display", "inline")
                    .text(func?.settings?.filters ? "Filtered Related" : "All Related")
            }else{
                preText.attr("display", "none")
            }
        })

        return selection;
    }

    // api
    myExpressionBox.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return myExpressionBox;
        };
    myExpressionBox.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return myExpressionBox;
    }
    myExpressionBox.onFuncClick = function (value) {
        if (!arguments.length) { return onFuncClick; }
        onFuncClick = value;
        return myExpressionBox;
    }
    myExpressionBox.onFiltersClick = function (value) {
        if (!arguments.length) { return onFiltersClick; }
        onFiltersClick = value;
        return myExpressionBox;
    }
    myExpressionBox.onEmptyBlockClick = function (value) {
        if (!arguments.length) { return onEmptyBlockClick; }
        onEmptyBlockClick = value;
        return myExpressionBox;
    }
    myExpressionBox.onBlockClick = function (value) {
        if (!arguments.length) { return onBlockClick; }
        onBlockClick = value;
        return myExpressionBox;
    }
    myExpressionBox.applicableContext = "Planet"
    myExpressionBox.funcType = "get"
    
    return myExpressionBox;

    }
