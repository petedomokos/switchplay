import * as d3 from 'd3';
import { editBoxGenerator } from './editBoxGenerator'
import { functionIconsGenerator } from './functionIconsGenerator'
import { DIMNS } from "../constants";
import { availableFuncs } from "../data";

export function editorGenerator(){
    //dimensions
    let width = 130;
    let height = 150;
    let margin =  DIMNS.margin;
    let contentsHeight;
    let contentsWidth;

    //funcs api
    let funcs = [];

    let funcIconsWidth;
    //icons height is fixed
    const funcIconsHeight = DIMNS.editor.icons.height;
    //calc box width is fixed
    const editBoxWidth = DIMNS.editor.width;
    let editBoxHeight;
    const updateDimns = () =>{
        contentsHeight = height - margin.top - margin.bottom;
        contentsWidth = width - margin.left - margin.right;
        editBoxHeight = height - margin.top - margin.bottom - funcIconsHeight;
        funcIconsWidth = width - margin.left - margin.right;
    }

    //components
    let editBox;
    let funcIcons;

    //dom
    let editorG;

    //handlers
    let selectFunc = () => {};
    let selectSubFunc = () => {};
    let updateBlock = () => {};

    function myEditor(selection){
        //blockData will be undefined if chain not active
        selection.each(function(blockData){
            //handle clase of no active block in chain
            if(!blockData){ return; }
            //console.log("editor data", blockData)
            //dimensions
            updateDimns()
            //init
            if(!editorG){
                editorG = d3.select(this);
                //editing-box
                editorG.append("g").attr("class", "editing-box")
                //icons
                editorG.append("g").attr("class", "icons")
                //functions
                editBox = editBoxGenerator()
                    .selectSubFunc(selectSubFunc)
                    .updateBlock(updateBlock);

                funcIcons = functionIconsGenerator();
            }

            //component settings
            editBox.width(editBoxWidth).height(editBoxHeight)
            funcIcons.width(funcIconsWidth).height(funcIconsHeight).selectFunc(selectFunc);
            //funcs data
            //const funcsData = availableFuncs(funcs, blockData).map(d => ({ ...d, isSelected:blockData.func?.id === d.id }))
            const { func } = blockData;
            let funcsData;
            if(!func || func.id === "homeSel"){
                funcsData = availableFuncs(funcs, blockData).map(d => ({ ...d, isSelected:blockData.func?.id === d.id }))
            }else{
                if(func.id == "sel"){
                    funcsData = [];
                }else{
                    funcsData = [{...funcs.find(func => func.id === blockData.func.id), isSelected:true}];
                }
            }

            //DOM UPDATE
            //editorG
            editorG.attr("transform", "translate("+(width/2 - editBoxWidth/2) + "," +margin.top +")")
            //editing-box
            editorG.select("g.editing-box")
                .datum(blockData)
                .call(editBox)
            //icons
            editorG.select("g.icons")
                .attr("transform", "translate(0," +editBoxHeight +")")
                .datum(funcsData)
                .call(funcIcons)
        })
        return selection;
    }

    // api
    myEditor.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return myEditor;
        };
    myEditor.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return myEditor;
    };
    myEditor.funcs = function (value) {
        if (!arguments.length) { return funcs; }
        funcs = value;
        return myEditor;
    };
    //todo - dispatch event for setFunc instead so dont have to pass up anddown teh chain all the way to icons
    myEditor.selectFunc = function (value) {
        if (!arguments.length) { return selectFunc; }
        selectFunc = value;
        return myEditor;
    };
    myEditor.selectSubFunc = function (value) {
        if (!arguments.length) { return selectSubFunc; }
        selectSubFunc = value;
        return myEditor;
    };
    myEditor.updateBlock = function (value) {
        if (!arguments.length) { return updateBlock; }
        updateBlock = value;
        
        return myEditor;
    };
    return myEditor;

    }
