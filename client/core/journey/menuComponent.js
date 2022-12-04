import * as d3 from 'd3';
//import "d3-selection-multi";
import { COLOURS, grey10 } from "./constants";
import dragEnhancements from './enhancedDragHandler';
/*

*/
export default function menuComponent() {
    // dimensions
    let margin = {left:2, right:2, top: 2, bottom:2};
    let width;
    let height;
    let contentsWidth;
    let contentsHeight;

    let optWrapperWidth;
    let optDimns = {
        width:50,
        height:15,
        spacing:5
    }

    let bg = {
        fill: COLOURS.canvas, //"transparent",
        stroke: "none"
    }
    let optBg = {
        fill: "transparent",
        stroke: grey10(7),
        strokeWidth:0.3
    }
    let optText = {
        stroke: grey10(7),
        fill:grey10(7),
        fontSize:10,
        strokeWidth:0.3
    }

    let withClick = dragEnhancements();
    let onClick = () => {};

    function updateDimns(data=[]){
        if(width) {
            //specified total width
            contentsWidth = width - margin.left - margin.right;
            optWrapperWidth = contentsWidth / data.length;
            //optDimns.spacing = 3 + optWrapperWidth * 0.2;
            optDimns.spacing = optWrapperWidth * 0.1;
            optDimns.width = optWrapperWidth - optDimns.spacing;
        }else{
            //adjustable total width
            optWrapperWidth = optDimns.width + optDimns.spacing;
            contentsWidth = optWrapperWidth * data.length;
            width = contentsWidth + margin.left + margin.right;
        }

        //height - always 1 row of options and nothing else
        if(height){
            //specifed total height
            contentsHeight = height - margin.top - margin.bottom;
            optDimns.height = contentsHeight;
        }else{
            contentsHeight = optDimns.height;
            height = contentsHeight + margin.left + margin.right;
        }
    };

    withClick.onClick((e,d) => onClick(d))
    const drag = d3.drag()
        .on("start", withClick())
        .on("end", withClick(function(e,d){
            if(withClick.isClick()) { 
                return; }
            onDragEnd.call(this, e, d);
        }));

    function menu(selection) {
        selection.each(function (data) {
            updateDimns(data);
            //console.log("menu", data)
            //we call it container as it doesnt include the margins, it just deals with position of entire component
            const containerG = d3.select(this).selectAll("g.container").data([1]);
            containerG.enter()
                .append("g")
                .attr("class", "container")
                .each(function(){
                    //enter outer bg
                    d3.select(this).append("rect").attr("class", "bg")
                    //enter contents
                    d3.select(this).append("g").attr("class", "contents")
                })
                .merge(containerG)
                .attr("transform", "translate("+ (-width/2) +", 0)")
                .each(function(){
                    //enter and update
                    //outer bg
                    d3.select(this).select("rect.bg")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("fill", bg.fill)
                        .attr("stroke", bg.stroke)

                    //contents (these are just options atm)
                    const contentsG = d3.select(this).select("g.contents")
                        .attr("transform", "translate("+margin.left + "," +margin.right +")")

                    const optionG = contentsG.selectAll("g.option").data(data || [], d => d.key);
                    optionG.enter()
                        .append("g")
                        .attr("class", "option")
                        .attr("cursor", "pointer")
                        .each(function(d){
                            //option-bg
                            d3.select(this).append("rect").attr("class", "option-bg");
                            //text
                            d3.select(this)
                                .append("text")
                                    .attr("text-anchor", "middle")
                                    .attr("dominant-baseline", "central")

                        })
                        .merge(optionG)
                        .attr("transform", (d,i) => "translate(" + ((optDimns.spacing/2) + i * optWrapperWidth) +", 0)")
                        .each(function(d){
                            //option-bg
                            d3.select(this).select("rect.option-bg")
                                .attr("width", optDimns.width)
                                .attr("height", optDimns.height)
                                .attr("fill", optBg.fill)
                                .attr("stroke", optBg.stroke)
                                .attr("stroke-width", optBg.strokeWidth);

                            //opt-text
                            d3.select(this).select("text")
                                .attr("x", optDimns.width/2)
                                .attr("y", optDimns.height/2)
                                .attr("fill", optText.fill)
                                .attr("stroke", optText.stroke)
                                .attr("stroke-width", optText.strokeWidth)
                                .attr("font-size", optText.fontSize)
                                .text(d.label);

                        })
                        .call(drag);

                })
        })

        return selection;
    }     
    menu.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = { ...margin, ...value};
        return menu;
    };
    menu.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return menu;
    };
    menu.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return menu;
    };
    menu.optDimns = function (value) {
        if (!arguments.length) { return optDimns; }
        optDimns = { ...optDimns, ...value };
        return menu;
    };
    menu.fontSize = function (value) {
        if (!arguments.length) { return fontSize; }
        fontSize = value;
        return menu;
    };
    menu.fill = function (value) {
        if (!arguments.length) { return fill; }
        fill = value;
        return menu;
    };
    menu.stroke = function (value) {
        if (!arguments.length) { return stroke; }
        stroke = value;
        return menu;
    };
    menu.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return menu;
    };
    return menu;
}
