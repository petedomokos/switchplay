import * as d3 from 'd3';
import { planetsGenerator } from "./planetsGenerator";
import { expressionGenerator } from "./expression/expressionGenerator";
import { editorGenerator } from "./editor/editorGenerator";
import { elementsBefore, elementsAfter, findActiveBlock, isActive } from "./helpers";
import { funcs, getInstances, getPropValueType, areRelated  } from "./data";
import { COLOURS, DIMNS, INIT_CHAIN_STATE } from "./constants";

/*

*/

export default function expressionBuilderGenerator() {
    //type
    let context = "Planet"
    let visType = "Concept"
    // dimensions
    let width = 600;
    let height = 600;
    const margin = DIMNS.expBuilder.margin;
    let contentsWidth;
    let contentsHeight;

    let planetsWidth = DIMNS.planets.width;
    let planetsHeight;

    let chainWrapperWidth;
    let chainWrapperContentsWidth;
    let editorWidth;
    let expWidth;
    let buttonsWidth;

    //let chainWrapperFullHeight;
    //let chainWrapperFullContentsHeight;
    const editorHeight = DIMNS.editor.height; //100
    const expHeight = DIMNS.exp.height; //150
    const buttonsHeight = DIMNS.chainButtons.height; //40
    const expAndButtonsHeight = expHeight + buttonsHeight;

    const chainWrapperMargin = DIMNS.chainWrapper.margin;

    function updateDimns(nrOfChains){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        planetsHeight = contentsHeight;

        chainWrapperWidth = contentsWidth - planetsWidth;
        chainWrapperContentsWidth = chainWrapperWidth- chainWrapperMargin.left - chainWrapperMargin.right;
        editorWidth = chainWrapperContentsWidth;
        expWidth = chainWrapperContentsWidth;
        buttonsWidth = chainWrapperContentsWidth;
    };

    //functions
    let planets;
    let editors = [];
    let expressions = [];

    //dom
    let svg;
    let chainWrapperG;

    //data
    //Q - DO WE NEED TO STORE DATA AND STATE HERE??
    let expBuilderData;
    let planetsData;
    const buttonsInfo = ["New", "Copy", "Del"];

    //state
    let updateBlock = () =>{};
    let setActiveBlock = () => {};
    let addChain = () => {};
    let copyChain = () => {};
    let deleteChain = () => {};

    //updates
    //atm , this doesnt update when context changes, so we rely on parent to re-render
    //which is fine because we are starting again anyway. But no reason why this comp cant auto-update
    //here just like the children do
    function expressionBuilder(selection) {
        // expression elements
        selection.each(function (data) {
            svg = d3.select(this);
            expBuilderData = data;
            console.log("expBuilderData...", expBuilderData)
            
            //dimensions
            updateDimns(expBuilderData.length)
            
            //INIT COMPONENTS
            if(!planets) { planets = planetsGenerator(); }
            expBuilderData.forEach((chainState,i) => {
                //create child components
                if(!editors[i]) { editors[i] = editorGenerator(); }
                if(!expressions[i]) {  expressions[i] = expressionGenerator(); }
            })
            //UPDATE CHILD COMPONENTS
            //todo - remove this and do as part of teh selectAll update chain
            updateComponents()

            //DOM
            //PLANETS
            const planetsG = svg.selectAll("g.planets").data([planetsData])
            planetsG.enter()
                .append("g")
                    .attr("class", "planets")
                    .merge(planetsG)
                    .attr("transform", "translate("+margin.left +"," + (margin.top + editorHeight) +")")
                    .call(planets)
            //exit
            planetsG.exit().remove();

            //EXPRESSION-WRAPPERS
            const chainWrappersContG = svg.selectAll("g.chain-wrappers-cont").data([expBuilderData])
            const chainWrappersContGEnter= chainWrappersContG.enter()
                .append("g")
                .attr("class", "chain-wrappers-cont")
                .attr("transform", "translate(" + (margin.left +planetsWidth) + ", " +margin.top  + ")")
            
            const chainWrappersContGMerged = chainWrappersContG.merge(chainWrappersContGEnter)
            
            //exit
            chainWrappersContG.exit().remove();

            //bind
            chainWrapperG = chainWrappersContGMerged.selectAll("g.chain-wrapper").data(expBuilderData);
            
            //enter
            const chainWrapperGEnter = chainWrapperG.enter()
                .append("g")
                    .attr("class", (d,i) => "chain-wrapper chain-wrapper-"+i)
                    .each(function(d,i){
                        d3.select(this).append("g").attr("class", "editor")
                        d3.select(this).append("g").attr("class", "expression")
                        const g = d3.select(this).append("g").attr("class", "buttons")
                    })
            //update
            const chainWrapperGMerged = chainWrapperG.merge(chainWrapperGEnter)
                .attr("transform", (d,i) => {
                     //if active chain is before, then the calc box will also be above it, as well as the margins, exp and buttons
                    const activeChainNr = findActiveBlock(expBuilderData).chainNr;
                    const expressionAndButtonsHeight = chainWrapperMargin.top +expAndButtonsHeight +chainWrapperMargin.bottom;
                    const chainHeightsAbove = i * (expressionAndButtonsHeight) + activeChainNr < i ? editorHeight : 0;
                    return "translate("+chainWrapperMargin.left +"," +chainHeightsAbove +")"
                })

            chainWrapperGMerged.select("g.editor")
                .attr("transform", "translate(0,0)")
                .attr("display", (d) => isActive(d) ? "inline" : "none")
                .each(function(d,i){
                    d3.select(this).datum(d.find(d => d.isActive)).call(editors[i])
                })

            //shift exp down below the calc box if it is active
            chainWrapperGMerged.select("g.expression")
                .attr("transform", (d,i) => "translate(0," +(isActive(d) ? editorHeight : 0) +")")
                .each(function(d,i){
                    d3.select(this).datum(d).call(expressions[i])
                })

            //buttons
            chainWrapperGMerged.select("g.buttons")
                .attr("transform", (d) => "translate(0," +(expHeight + (isActive(d) ? editorHeight : 0)) +")")
                .each(function(){
                    const buttonsHeight = DIMNS.chainButtons.height;
                    const buttonWidth = 30;
                    const buttonHeight = buttonsHeight * 0.8;
                    const buttonMargin = { left:0, right:5, top:buttonsHeight * 0.1, bottom:buttonsHeight * 0.1}
                    const buttonG = d3.select(this).selectAll("g.button").data(buttonsInfo, d => d);
                    const buttonGEnter = buttonG.enter()
                        .append("g")
                            .attr("class", "button")
                            .attr("transform", (d,j) => "translate(" +(j * (buttonWidth + buttonMargin.right)) + "," +buttonMargin.top +")")
                            .style("cursor", "pointer")
                            .on("click", (e,d) => onChainButtonClick(d, i))
                            .attr("display", "none")

                    //note - this will become the full name and show on hover just below icon

                    buttonGEnter.append("rect")
                        .attr("class", "background")
                        .attr("width", buttonWidth)
                        .attr("height", buttonHeight)
                        .attr("fill", COLOURS.chainWrapper.btn.bg)

                       // why when we put buttonsHeight down do they no longer stay in the chainWrapper?

                    buttonGEnter.append("text")
                        .attr("transform", "translate("+(buttonWidth/2) + "," +(buttonsHeight/2) +")")
                        .attr("dominant-baseline", "middle")
                        .attr("text-anchor", "middle")
                        .attr("font-size", 12)
                        .attr("fill", COLOURS.chainWrapper.btn.block)
                        .text(d => d)

                })
            
            //exit - this removes everything to do with this chain
            chainWrapperG.exit().remove();

            function onChainButtonClick(d, i){
                //check index usages throughout - if a chain is added,
                /*
                the ones after it will have new index numbers
                so need to check that they will Work...do they 
                use indeax numbers anywhere otehr than EUE pattern?
                also must make sure 2nd param of .data() is set in all EUE usages
                so not bound by index
                also what is blockNr when is it set and how is it used
                */
                if(d === "New"){
                    addChain(i);
                }else if(d === "Copy"){
                    copyChain(i)
                }else{
                    deleteChain(i)
                    editors = [...elementsBefore(i, editors), ...elementsAfter(i, editors)];
                    expressions = [...elementsBefore(i, expressions), ...elementsAfter(i, expressions)];
                }
            }
                    
        })
        return selection;
    }

    function updateComponents(){
        //planets
        planets
            .width(planetsWidth)
            .height(planetsHeight)
            .onSelect(function(planet, property){
                const activeBlock = findActiveBlock(expBuilderData)
                const { blockNr, func } = activeBlock;
                if(activeBlock.blockNr === 0){
                    applyHomeSel(planet, activeBlock)
                }else{
                    //temp - disable ability to change a blocks func
                    if(func && func.id !== "sel") { 
                        alert("Changing an existing operation is not implemented yet. Click Next to add a new operation.")
                        return; 
                    }
                    applySel(planet, property, activeBlock)
                }
            })
        
        function applyHomeSel(planet, block){
            const { blockNr, chainNr } = block;
            //its the home block
            const updatedBlock = {
                ...block,
                func:funcs.find(func => func.id === "homeSel"),
                //we just take the first instance as it is for the home planet
                //@todo - allow user to change which instance is used
                of:{planet}
            }
            //add new empty block if this is the last one
            const shouldAddEmptyBlock = blockNr === expBuilderData[chainNr].length - 1;
            //update state
            updateBlock(updatedBlock, shouldAddEmptyBlock)
        }

        function applySel(planet, property, block){
            const { blockNr, chainNr, func } = block;
            const valueType = getPropValueType(planet.id, property?.id);
            //helper to get the right value for each instance based on property selected
            const calculateValue = (instance, propertyId, valueType) => {
                const rawValue = instance.propertyValues[propertyId];
                if(valueType === "date"){
                    return new Date(rawValue)
                }
                if(valueType === "number"){
                    return +rawValue
                }
                return rawValue
            }

            const of = getInstances(planet.id)
                .filter(inst => {
                    return areRelated(inst, expBuilderData[chainNr][0].res)
                })
                .map(inst => ({
                    ...inst,
                    //add the appropriate value if property has been specified.
                    value:property ? calculateValue(inst, property.id, valueType) : undefined
                }))
            //attach the planet and property selected to the dataset for reference purposes
            of.planet = planet;
            of.property = property;
            of.valueType = valueType;
            //add the dataset to block state as the of property 
            //(note - of can be a dataset (as here) or a function (with its own 'of') that returns a dataset)
            const updatedBlock = {
                ...block,
                //if func is alrady chosen use that, otherwise its a sel
                func:func || funcs.find(func => func.id === "sel"),
                of
            };
            //add new empty block if this is the last one
            const shouldAddEmptyBlock = blockNr === expBuilderData[chainNr].length - 1;
            //update state
            updateBlock(updatedBlock, shouldAddEmptyBlock)

        }

        //editor
        editors.forEach((editor,i) => {
            editor
                .width(editorWidth)
                .height(editorHeight)
                .funcs(funcs)
                .selectFunc((func) => {
                    //@todo ?- need to update of values and res here too, unless no planet selected???
                    const block = findActiveBlock(expBuilderData)
                    const { chainNr, blockNr, prev } = block;
                    //if(!prev?.of?.planet){
                    if(["filter", "agg", "groupby"].includes(func.id) && !Array.isArray(prev?.of)){
                        alert("You must define your dataset before the operation.");
                        //todo - go into func-first mode
                        return;
                    }
                    //temp - disable ability to change a blocks func
                    if(block.func && block.func.id !== func.id) { 
                        alert("Click Next before applying the next operation. Changing an existing operation is not implemented yet.")
                        return; 
                    }

                    //if filter
                    if(func.id === "filter"){
                        //note - applySel turns func into a sel func
                        //@todo - keep the block as active so filters are shown, 
                        //@todo later maybe - dont display the selection until filters are applied initially
                        applySel(prev.of.planet, prev.of.property, block);

                        setActiveBlock([chainNr, blockNr])
                        return;
                    }
                    /*
                        if prev has a dataset as its of value, then if func is agg and no dataset selected, we sum the prev block
                        if prev has no dataset as its value, we assume its functionFirst, so do f() eg sum()
                        But before all that, user must choose sum
                    */
                    //set the default subFunc in some cases
                    let subFunc;
                    const { planet, valueType } = prev.of;
                    if(func.id === "agg" && valueType === "number"){
                        subFunc = func.subFuncs.find(f => f.id === "sum");
                    }
                    else if(func.id === "agg" && planet){
                        subFunc = func.subFuncs.find(f => f.id === "count");
                    }
                    const updatedBlock = {...block, func, subFunc};
                    //update state
                    updateBlock(updatedBlock, true);
                })
                .selectSubFunc((subFunc) => {
                    //@todo - need to update of values and res here too, unless no planet selected
                    const activeBlock = findActiveBlock(expBuilderData);
                    const updatedBlock = {...activeBlock, subFunc};
                    //update state
                    updateBlock(updatedBlock);
                })
                .updateBlock(updatedBlock =>{
                    const { chainNr, blockNr } = updatedBlock;
                    //trouble is, res depends on prev, so unless we up[dte all prevs too, we should move res to after the state update
                    //this makes more sense anyway, do it as part of the data augmentation in Expression
                    updateBlock({ ...updatedBlock, });
                })
        })

        //expression
        expressions.forEach((expression,i) => {
            expression
                .context(context)
                .width(expWidth)
                .height(expHeight)
                .setActiveBlock(setActiveBlock);
        })
    }     

    // api
    expressionBuilder.context = function (value) {
        if (!arguments.length) { return context; }
        context = value;
        return expressionBuilder;
    };
    expressionBuilder.visType = function (value) {
        if (!arguments.length) { return visType; }
        visType = value;
        return expressionBuilder;
    };
    expressionBuilder.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        //update();
        return expressionBuilder;
    };
    expressionBuilder.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        //update();
        return expressionBuilder;
    };
    expressionBuilder.planetsData = function (value) {
        if (!arguments.length) { return planetsData; }
        planetsData = value;
        return expressionBuilder;
    };
    //handlers
    expressionBuilder.updateBlock = function (value) {
        if (!arguments.length) { return updateBlock; }
        updateBlock = value;
        return expressionBuilder;
    };
    expressionBuilder.setActiveBlock = function (value) {
        if (!arguments.length) { return setActiveBlock; }
        setActiveBlock = value;
        return expressionBuilder;
    };
    expressionBuilder.addChain = function (value) {
        if (!arguments.length) { return addChain; }
        addChain = value;
        return expressionBuilder;
    };
    expressionBuilder.copyChain = function (value) {
        if (!arguments.length) { return copyChain; }
        copyChain = value;
        return expressionBuilder;
    };
    expressionBuilder.deleteChain = function (value) {
        if (!arguments.length) { return deleteChain; }
        deleteChain = value;
        return expressionBuilder;
    };
    expressionBuilder.on = function () {
        if (!dispatch) return expressionBuilder;
        // attach extra arguments
        const value = dispatch.on.apply(dispatch, arguments);
        return value === dispatch ? expressionBuilder : value;
    };
    return expressionBuilder;
}