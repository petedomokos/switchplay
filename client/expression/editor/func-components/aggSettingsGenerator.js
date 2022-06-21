import * as d3 from 'd3';
import { aggSubFuncs, getPropValueType } from "../../data"
import { COLOURS, DIMNS } from "../../constants"

export function aggSettingsGenerator(selection){
    //dimensions
    let width = 350;
    let height = 100;
    let margin = DIMNS.smallMargin;
    let contentsWidth;
    let contentsHeight;
    const updateDimns = () =>{
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
    }

    //functions
    let selectSubFunc = () => {};

    //dom
    let settingsG;

    //selected
    let selectedSubFunc;

    //components

    function myAggSettings(selection){
        selection.each(function(blockData){
            updateDimns();
            //console.log("myAggSettings", blockData);
            settingsG = d3.select(this);
        
            const btnWidth = 40;
            const btnHeight = 15;

            const subFuncsG = settingsG.selectAll("g.subFuncs").data([blockData.func])
            subFuncsG.enter()
                .append("g")
                .attr("class", "subFuncs")
                .merge(subFuncsG)
                .attr("transform", "translate(0,10)")
                .each(function(aggFunc){
                    const subFuncG = d3.select(this).selectAll("g.subFunc").data(aggFunc.subFuncs, d => d.id)
                    const subFuncGMerged = subFuncG.enter()
                        .append("g")
                            .attr("class", d => d.id + "-btn-g btn-g")
                            .attr("transform", (d,i) => "translate(" +(i *(btnWidth + 10)) +",0)")
                            .each(function(d,i){
                                const buttonG = d3.select(this)
                                    .style("cursor", "pointer")
                                    .on("click", (e,d) => selectSubFunc(d));
                                buttonG
                                    .append("rect")
                                        .attr("width", btnWidth)
                                        .attr("height", btnHeight);
                                
                                buttonG
                                    .append("text")
                                        .attr("transform", (d,i) => "translate(" +(btnWidth/2) +"," +(btnHeight/2) +")")
                                        .attr("dominant-baseline", "middle")
                                        .attr("text-anchor", "middle")
                                        .style("font-size", "10px")
                                        .attr("pointer-events", "none")
                                        .text(d => d.name)

                            })
                            .merge(subFuncG)

                    subFuncGMerged.select("rect")
                            .attr("fill", d => d.id === blockData.subFunc?.id ? COLOURS.editor.optionBtn.selected.fill : COLOURS.editor.optionBtn.nonSelected.fill);
                    subFuncGMerged.select("text")
                            .attr("fill", d => d.id === blockData.subFunc?.id ? COLOURS.editor.optionBtn.selected.text : COLOURS.editor.optionBtn.nonSelected.text)

                    
                    
                    

                    
                })
        })
        return selection;
    }

    // api
    myAggSettings.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return myAggSettings;
        };
    myAggSettings.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return myAggSettings;
    };
    myAggSettings.selectSubFunc = function (value) {
        if (!arguments.length) { return selectSubFunc; }
        selectSubFunc = value;
        return myAggSettings;
    };
    myAggSettings.funcType = "agg"
    return myAggSettings;

    }
