import * as d3 from 'd3';
import { COLOURS, DIMNS } from "../../constants"
import { onlyUnique } from "../../helpers"

export function selSettingsGenerator(selection){
    //dimensions
    let width = 350;
    let height = 100;
    let margin =  DIMNS.smallMargin;
    let contentsWidth;
    let contentsHeight;
    const updateDimns = () =>{
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
    }

    let settingsSelection;
    let propertyToFilter;
    let selectedOptions = [];
    function updatePropertyToFilter(e, property){
        propertyToFilter = property;
        //update
        settingsSelection.call(mySelSettings);
    }
    function updateSelectedOptions(e, option){
        if(selectedOptions.includes(option)){
            //remove
            selectedOptions = selectedOptions.filter(opt => opt !== option)
        }else{
            //add
            selectedOptions = [...selectedOptions, option]
        }
        //update dom
        settingsSelection.call(mySelSettings);
    }
    let updateBlock = () => {};

    function mySelSettings(selection){
        settingsSelection = selection;
        selection.each(function(blockData){
            const { func, of={} } = blockData;

            const { planet } = of;
            //console.log("sel settings ", blockData)
            updateDimns();
            //ENTER
            const instructionText = d3.select(this).selectAll("text.instruction").data([1])
            instructionText.enter()
                .append("text")
                    .attr("class", "instruction")
                    .attr("transform", "translate(5,5)")
                    //.attr("dominant-baseline", "hanging")
                    .attr("text-anchor", "start")
                    .attr("font-size", 10)
                    .attr("fill", COLOURS.instruction)
                    .merge(instructionText)
                    .text(propertyToFilter ? "Select values to include" : "Select property to filter")

            const propertiesG = d3.select(this).selectAll("g.properties").data([1])
            propertiesG.enter()
                .append("g")
                    .attr("class", "properties")
                    .attr("transform", "translate(5,20)")
                    .merge(propertiesG)
                    .each(function(){
                        const btnWidth = 70;
                        const btnHeight = 20;
                        const btnMargin = {right: 5};

                        const propertiesData = planet.properties || [];
                        const propertyBtnG = d3.select(this).selectAll("g.btn").data(propertiesData, d => d.id)
                        propertyBtnG.enter()
                            .append("g")
                                .attr("class", "btn")
                                .each(function(d,i){
                                    const propertyBtnG = d3.select(this)
                                        .on("click", updatePropertyToFilter);
                                    //rect
                                    propertyBtnG
                                        .append("rect")
                                            .attr("height", btnHeight)

                                    //text
                                    propertyBtnG
                                        .append("text")
                                            .attr("dominant-baseline", "middle")
                                            .attr("text-anchor", "middle")
                                            .style("font-size", "10px")
                                            .attr("pointer-events", "none")

                                })
                                .merge(propertyBtnG)
                                .attr("transform", (d,i) => "translate(" +(i * (btnWidth + btnMargin.right)) +",0)")
                                .each(function(d,i){
                                    const propertyBtnG = d3.select(this);
                                    //rect
                                    propertyBtnG.select("rect")
                                        .attr("width", btnWidth)
                                        .attr("fill", COLOURS.editor.optionBtn.nonSelected.fill)

                                    //text
                                    propertyBtnG.select("text")
                                        .attr("transform", (d,i) => "translate(" +(btnWidth/2) +"," +(btnHeight/2) +")")
                                        .attr("fill", COLOURS.editor.optionBtn.nonSelected.text)
                                        .text(d => d.name)

                                })
                        
                        propertyBtnG.exit().remove();
                    })

            const optionsG = d3.select(this).selectAll("g.options").data([1])
            optionsG.enter()
                .append("g")
                    .attr("class", "options")
                    .attr("transform", "translate(5,50)")
                    .merge(optionsG)
                    .attr("display", propertyToFilter ? "inline" : "none")
                    .each(function(){
                        const btnWidth = 50;
                        const btnHeight = 20;
                        const btnMargin = {right: 3};

                        const optionsData = propertyToFilter?.options || [];
                       
                        const optionBtnG = d3.select(this).selectAll("g.btn").data(optionsData, d => d)
                        optionBtnG.enter()
                            .append("g")
                                .attr("class", "btn")
                                .each(function(d,i){
                                    const optionBtnG = d3.select(this)
                                        .style("cursor", "pointer")
                                        .on("click", updateSelectedOptions);
                                    //rect
                                    optionBtnG
                                        .append("rect")
                                            .attr("width", btnWidth)
                                            .attr("height", btnHeight)

                                    //text
                                    optionBtnG
                                        .append("text")
                                            .attr("transform", (d,i) => "translate(" +(btnWidth/2) +"," +(btnHeight/2) +")")
                                            .attr("dominant-baseline", "middle")
                                            .attr("text-anchor", "middle")
                                            .style("font-size", "10px")
                                            .attr("pointer-events", "none")

                                })
                                .merge(optionBtnG)
                                .attr("transform", (d,i) => "translate(" +(i * (btnWidth + btnMargin.right)) +",0)")
                                .each(function(d,i){
                                    const optionBtnG = d3.select(this);
                                    //rect
                                    const colours = COLOURS.editor.optionBtn
                                    optionBtnG.select("rect")
                                        .attr("fill", selectedOptions.includes(d) ? colours.selected.fill : colours.nonSelected.fill)

                                    //text
                                    optionBtnG.select("text")
                                        .attr("fill", selectedOptions.includes(d) ? colours.selected.text : colours.nonSelected.text)
                                        .text(d => d.name || d)

                                })
                        optionBtnG.exit().remove();
                    })
            
                    

            //apply btn
            const applyBtnWidth = 50;
            const applyBtnHeight = 20;
            const applyBtnMargin = { right:10 } ///note - need this coz contentsWidth already shifts the bakground in by the top level margin

            const applyBtnG = d3.select(this).selectAll("text.applyBtn").data([blockData])
            applyBtnG.enter()
                .append("g")
                    .attr("class", "applyBtn")
                    .attr("transform", "translate(" +(contentsWidth - applyBtnWidth - applyBtnMargin.right) + "," +(contentsHeight - applyBtnHeight) +")")
                    .each(function(){
                        const applyBtnG = d3.select(this)
                            .style("cursor", "pointer")
                            .on("click", (e,d) => {
                                const currentSettings = func.settings || { filters:[] }
                                const filtersToKeep = currentSettings.filters.filter(filt => filt.propertyId !== propertyToFilter.id)
                                const newSettings = {
                                    ...currentSettings,
                                    filters:[...filtersToKeep, { propertyId: propertyToFilter.id, selectedOptions}]
                                }
                                updateBlock({...d, func:{ ...d.func, settings:newSettings}})
                            })
                        //rect
                        applyBtnG
                            .append("rect")
                                .attr("width", applyBtnWidth)
                                .attr("height", applyBtnHeight)

                        //text
                        applyBtnG
                            .append("text")
                                .attr("transform", (d,i) => "translate(" +(applyBtnWidth/2) +"," +(applyBtnHeight/2) +")")
                                .attr("dominant-baseline", "middle")
                                .attr("text-anchor", "middle")
                                .style("font-size", "10px")
                                .attr("pointer-events", "none")
                                .attr("fill", "black")
                                .text("Apply")

                    })
                    .merge(applyBtnG)
                    .each(function(){
                        const applyBtnG = d3.select(this);
                        //rect
                        applyBtnG.select("rect").attr("fill", COLOURS.editor.optionBtn.nonSelected.fill)
                        //text
                        applyBtnG.select("text").attr("fill", COLOURS.editor.optionBtn.nonSelected.text)
                        
                    })
            
        })
        return selection;
    }

    // api
    mySelSettings.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return mySelSettings;
        };
    mySelSettings.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return mySelSettings;
    };
    mySelSettings.updateBlock = function (value) {
        if (!arguments.length) { return updateBlock; }
        updateBlock = value;
        return mySelSettings;
    };
    mySelSettings.funcType = "sel"
    return mySelSettings;

    }
