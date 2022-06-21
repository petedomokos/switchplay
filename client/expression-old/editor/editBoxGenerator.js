import * as d3 from 'd3';
import { emptySettingsGenerator } from "./func-components/emptySettingsGenerator"
import { selSettingsGenerator } from "./func-components/selSettingsGenerator"
import { aggSettingsGenerator } from "./func-components/aggSettingsGenerator"
import { COLOURS, DIMNS } from "../constants"

export function editBoxGenerator(selection){
    //dimensions
    let width = 350;
    let height = 100;
    let margin = { left:DIMNS.editor.children.margin.left, right:5, top:5, bottom:5};
    let contentsWidth;
    let contentsHeight;
    const updateDimns = () =>{
        contentsWidth = width - margin.left - margin.bottom;
        contentsHeight = height - margin.top - margin.bottom;
    }

    let editBoxG;

    //components
    let funcSettingsComponent;
    let selectSubFunc = () => {};
    let updateBlock = () => {};

    //'this' is funcSettingsComponentG
    function updateFuncSettingsComponent(func){
        if(funcSettingsComponent){
            //remove everything from editorG, because there is no EUE pattern attached to the g
            editBoxG.select("g.func-settings").selectAll("*").remove();
        }
        switch(func?.id){
            case "homeSel":{
                //@todo - home editor settings
                funcSettingsComponent = emptySettingsGenerator();
                break;
            }
            case "sel":{
                funcSettingsComponent = selSettingsGenerator().updateBlock(updateBlock);
                break;
            }
            case "agg":{
                funcSettingsComponent = aggSettingsGenerator().selectSubFunc(selectSubFunc);
                break;
            }
            //if no func selected
            default:{
                funcSettingsComponent = emptySettingsGenerator();
            }
        }
    }

    function myEditingBox(selection){
        selection.each(function(blockData){
            //console.log("editingbox", blockData)
            const { func } = blockData;
            updateDimns();
            //init
            if(!editBoxG){
                editBoxG = d3.select(this);
                //background
                editBoxG.append("rect")
                    .attr("class", "background")
                    .attr("fill", COLOURS.editor.bg)
                //func description
                /*
                editBoxG.append("text")
                    .attr("class", "func-desc")
                    .attr("transform", "translate(10,10)")
                    .attr("dominant-baseline", "hanging")
                    .attr("font-size", "12px")
                    .attr("fill", COLOURS.editor.func.selected)*/
                
                //func settings
                editBoxG.append("g")
                    .attr("class", "func-settings")
                    .attr("transform", "translate(20,10)")
            }

            //UPDATE
            //render a new func component if required
            if(!funcSettingsComponent || func?.id !== funcSettingsComponent?.funcType){
                updateFuncSettingsComponent(func);
            }

            //background
            editBoxG.select("rect.background")
                .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
                .attr("width", contentsWidth)
                .attr("height", contentsHeight)

            //func description
            //editBoxG.select("text.desc").text(blockData.func?.name || "")

            //func settings
            editBoxG.select("g.func-settings").datum(blockData)
                .call(funcSettingsComponent.width(contentsWidth).height(contentsHeight))
            
        })
        return selection;
    }

    // api
    myEditingBox.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return myEditingBox;
        };
    myEditingBox.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return myEditingBox;
    };
    myEditingBox.selectSubFunc = function (value) {
        if (!arguments.length) { return selectSubFunc; }
        selectSubFunc = value;
        return myEditingBox;
    };
    myEditingBox.updateBlock = function (value) {
        if (!arguments.length) { return updateBlock; }
        updateBlock = value;
        
        return myEditingBox;
    };
    return myEditingBox;

}
