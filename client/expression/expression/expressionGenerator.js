import * as d3 from 'd3';
import { expressionBoxGenerator } from "./expressionBoxGenerator"

//import { expressionBoxGenerator } from "./expressionBoxGenerator"
import { homeVisGenerator } from './vis/homeVisGenerator';
import { selVisGenerator } from './vis/selVisGenerator';
import { aggVisGenerator } from './vis/aggVisGenerator';
import { emptyVisGenerator } from './vis/emptyVisGenerator';
import { connectorsGenerator } from './connectors/connectorsGenerator';
import { COLOURS, DIMNS } from "../constants"
import { getVisHeight, getBlockWidth, sumPrevBlockWidths } from "../helpers";

export function expressionGenerator(){
    //dimns
    let width = 600;
    let { height } = DIMNS.exp
    //we take of the bottom margin as we already have one from a higher level
    const margin = { ...DIMNS.margin};
    let contentsWidth;
    let contentsHeight;
    const blockMargin = DIMNS.block.margin;
    const initBlockExtraMarginLeft = 20;
    let blockContentsHeight;
    const boxHeight = DIMNS.block.box.height;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
        blockContentsHeight = contentsHeight - blockMargin.top - blockMargin.bottom;
    };

    //context
    let context;

    //components
    // must be a sep generator for each col
    let expressionBoxComponents = {};
    let visComponents = {};
    let connectors;

    //dom
    let expressionG;

    //funcs
    let setActiveBlock = () => {};

    function updateExpressionComponents(d, i){
        //remove previous
        if(expressionBoxComponents[i]){
            //we don't want to remove the gs themselves, as they are managed via the EUE pattern
            d3.select(this).select("g.vis").selectAll("g.vis-contents").remove();
            d3.select(this).select("g.vis").select("g.box").selectAll("g.box-contents").remove();
        }
        switch(d.func?.id){
            case "homeSel":{
                expressionBoxComponents[i] = expressionBoxGenerator(); //for now, boxes are same
                visComponents[i] = homeVisGenerator();
                break;
            }
            case "sel":{
                expressionBoxComponents[i] = expressionBoxGenerator(); //for now, boxes are same
                visComponents[i] = selVisGenerator();
                break;
            }
            case "agg":{
                expressionBoxComponents[i] = expressionBoxGenerator(); //for now, boxes are same
                visComponents[i] = aggVisGenerator();
                break;
            }
            //default when no op ie col will be empty
            default:{
                expressionBoxComponents[i] = expressionBoxGenerator(); //for now, boxes are same
                visComponents[i] = emptyVisGenerator();
            }
        }

        //set handlers 
        expressionBoxComponents[i]
        /*
            .onFuncClick(function(){
                //set active block to this
                setActiveBlock([d.chainNr, d.blockNr])
            })
            .onFiltersClick(function(){
                //set active block to this
                setActiveBlock([d.chainNr, d.blockNr])
            })
            .onEmptyBlockClick(function(){
                console.log("hello")
                //set active block to this
                setActiveBlock([d.chainNr, d.blockNr])
            })
            */
            .onBlockClick(function(){
                //set active block to this
                setActiveBlock([d.chainNr, d.blockNr])
            })
    }
    function expression(selection){
        expressionG = selection;

        updateDimns();

        if(!connectors){ connectors = connectorsGenerator() };

        const backgroundRect = expressionG.selectAll("rect.background").data([{contentsWidth, contentsHeight}])
        backgroundRect.enter()
            .append("rect")
            .attr("class", "background")
            .merge(backgroundRect)
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("width", d => d.contentsWidth)
            .attr("height", d => d.contentsHeight)
            //.attr("width", d => d.width)
            //.attr("height", d => d.height)
            .attr("fill", COLOURS.exp.bg)

        selection.each(function(chainData){


            //BLOCKS
            //BIND
            //@todo - could put in sn2 param of .data() wit a uniqueId of the block,
            //which we would have to create as it odesnt change if other vlocks are deleted,
            //so not the saem as blockNr
            const blockG = selection.selectAll("g.block").data(chainData)
            //ENTER
            //here we append the g, but after this point .enter will still refer to the pre-entered placeholder nodes
            const blockGEnter = blockG.enter().append("g").attr("class", (d,i) => "block block-"+i)
            blockGEnter.append("rect").attr("class", "block-background").attr("fill", COLOURS.exp.block.bg)
            //vis
            const visG = blockGEnter.append("g").attr("class", "vis")
            //children of vis
            //box above main vis
            visG.append("g").attr("class", "box")
            //count text below main vis
            visG
                .append("text")
                    .attr("class", "count")
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "hanging")
                    .style("font-size", 12)
                    .attr("fill", COLOURS.exp.vis.count)

            //UPDATE
            blockG.merge(blockGEnter)
                .each(function(d,i){
                    //dimns
                    const blockWidth = getBlockWidth(d.func?.id);
                    const blockContentsWidth = blockWidth - blockMargin.left - blockMargin.right;
                    //we pass in heightavailable for vis which leaves space for boxes above and below
                    const availableVisHeight = blockContentsHeight - 2 * boxHeight;
                    const visHeight = getVisHeight(d, availableVisHeight);
                    //update components
                    //expressionBox and vis are both updated in sync with each other
                    const contextHasChanged = visComponents[i]?.applicableContext !== context;
                    const functionHasChanged = visComponents[i]?.funcType !== d.func?.id;
                    if(contextHasChanged || functionHasChanged){
                        updateExpressionComponents.call(this, d, i);
                    }
                    //update dom
                    //sumPrevBlcokWidths includes block margins
                    const dx = margin.left + initBlockExtraMarginLeft + sumPrevBlockWidths(i, chainData);
                    const dy = margin.top + blockMargin.top;
                    const blockG = d3.select(this).attr("transform", "translate(" +dx +"," + dy+")")
                    //background
                    blockG.select("rect.block-background").attr("width", blockContentsWidth).attr("height", blockContentsHeight)
                    //vis
                    blockG.select("g.vis").each(function(d){
                        const visG = d3.select(this);
                        //vis - shift to middle then back up to start of vis
                        visG
                            .attr("transform", "translate(0," + (blockContentsHeight/2 - visHeight/2) +")")
                            .call(visComponents[i].width(blockContentsWidth).height(visHeight))

                        //children
                        //box - shift to middle is visHeightis 0, otherwise it is directly above vis
                        visG.select("g.box")
                            .attr("transform", d => "translate(0," + (visHeight === 0 ? -boxHeight/2 : -boxHeight) +")")
                            .call(expressionBoxComponents[i].width(blockContentsWidth).height(boxHeight))

                        //count
                        visG.select("text.count")
                            .attr("transform", "translate("+(blockContentsWidth * 0.5) +"," + (visHeight + 5) +")")
                            .attr("display", d.func?.id === "sel" ? "inline" : "none")
                            .text(Array.isArray(d.res) ? "Count: " +d.res?.length : "")

                    })
                })

            //overlay (rendered last so on top)
            /*
            blockGEnter.append("rect")
                .attr("class", "overlay")
                .attr("width", blockWidth)
                .attr("height", contentsHeight)
                .attr("fill", "red")
                //.on("click", () => { console.log("overlay clicked")})
                .merge(blockG)
                .attr("display", d => {
                    return d.isActive ? "none" : "inline";
                   // why not rendering when not active???????????
                })
                */

            //EXIT
            blockG.exit().remove();

            //CONNECTORS
            //console.log("connectorsData...", connectorData)
            const connectorsG = selection.selectAll("g.connectors").data([chainData])
            connectorsG.enter()
                .append("g")
                    .attr("class", "connectors")
                    .attr("transform", () =>{
                        //we want connectorsG to start at the beginning of the margin between block 0 and 1
                        const homeBlockContentsWidth = DIMNS.block.width.homeSel - blockMargin.left - blockMargin.right;
                        const dx = initBlockExtraMarginLeft + margin.left + homeBlockContentsWidth 
                        return "translate("+dx +"," +(margin.top + blockMargin.top) +")"
                    })
                    .merge(connectorsG)
                    .call(connectors.width(contentsWidth).height(blockContentsHeight))

        })
    }
    // api
    expression.context = function (value) {
        if (!arguments.length) { return context; }
        context = value;
        return expression;
    };
    expression.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return expression;
    };
    expression.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return expression;
    };
    expression.setActiveBlock = function (value) {
        if (!arguments.length) { return setActiveBlock; }
        setActiveBlock = value;
        return expression;
    };
    return expression;
}

