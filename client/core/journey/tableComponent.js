import * as d3 from 'd3';
import textWrap from "./textWrap";
import { grey10 } from './constants';

/*

*/
export default function tableComponent() {
    // dimensions
    let margin = { left:0, right:0, top: 0, bottom:0};
    let width = 100;
    let height = 60;
    let contentsWidth;
    let contentsHeight;
    let rowHeadingsWidth;
    let colHeadingsHeight;
    let cellsAreaWidth;
    let cellsAreaHeight;
    let cellWidth;
    let cellHeight;
    let cellMargin;

    function updateDimns(nrCols, nrRows){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
        rowHeadingsWidth = contentsWidth * 0.2;
        colHeadingsHeight = contentsHeight * 0.2;
        rowHeadingsWidth = d3.max([contentsWidth * 0.2, 15]);
        colHeadingsHeight = d3.max([contentsHeight * 0.2, 7.5]);
        cellsAreaWidth = contentsWidth - rowHeadingsWidth;
        cellsAreaHeight = contentsHeight - colHeadingsHeight;
        cellWidth = cellsAreaWidth / nrCols;
        cellHeight = cellsAreaHeight / nrRows;
        cellMargin = { left: cellWidth * 0.2, top:cellHeight * 0.1 }
    };

    let entered = false;

    //dom
    let containerG;
    let contentsG;
    let contentsBgG;
    let colHeadingsG;
    let rowHeadingsG;
    let cellsAreaG;
    let colHeadingsRect;
    let rowHeadingsRect;
    let cellsAreaRect;

    //let nameWrap = textWrap();

    function table(selection) {
        selection.each(function(data){
            containerG = d3.select(this);

            const { colHeadings, rowHeadings, datapoints } = data;
            const cellData = d3.cross(colHeadings, rowHeadings)
                .map(colRowPos => ({
                    pos:[colHeadings.indexOf(colRowPos[0]), rowHeadings.indexOf(colRowPos[1])],
                    colRowPos,
                    value:datapoints.find(d => d.col === colRowPos[0] && d.row === colRowPos[1])?.value
                }));
            //console.log("cellData", cellData)
            if(colHeadings.length === 0 || rowHeadings.length === 0) { return selection; }
            updateDimns(colHeadings.length, rowHeadings.length);

            //enter
            if(containerG.select("g.table-contents").empty()){
                enter.call(this);
            }

            update();

            function enter(){
                containerG = d3.select(this);
                containerG
                    .attr("opacity", 0)
                    .transition()
                        .duration(200)
                        .attr("opacity", 1);

                contentsG = containerG
                    .append("g")
                        .attr("class", "contents table-contents")
                        .attr("transform", "translate(" +margin.left +"," +margin.top +")")

                /*contentsBgG = contentsG
                    .append("rect")
                        .attr("class", "contents-bg")
                        .attr("fill", "transparent")
                        .attr("stroke", "black");*/

                colHeadingsG = contentsG.append("g").attr("class", "col-headings headings");
                rowHeadingsG = contentsG.append("g").attr("class", "row-headings headings");
                cellsAreaG = contentsG.append("g").attr("class", "cells-area");
                //rects
                /*
                colHeadingsRect = colHeadingsG.append("rect").attr("fill", "yellow");
                rowHeadingsRect = rowHeadingsG.append("rect").attr("fill", "yellow");
                cellsAreaRect = cellsAreaG.append("rect").attr("fill", "orange");
                */
            }

            function update(){
                //contentsBgG
                    //.attr("width", contentsWidth)
                    //.attr("height", contentsHeight);

                colHeadingsG
                    .attr("transform", "translate("+rowHeadingsWidth +",0)")
                
                //colHeadingsRect
                    //.attr("width", cellsAreaWidth)
                    //.attr("height", colHeadingsHeight)
                
                rowHeadingsG
                    .attr("transform", "translate(0," +colHeadingsHeight +")")
                //rowHeadingsRect
                // .attr("width", rowHeadingsWidth)
                    //.attr("height", cellsAreaHeight)

                
                //@todo - use a nested entre-update pattern
                cellsAreaG
                    .attr("transform", "translate("+rowHeadingsWidth +"," +colHeadingsHeight +")")
                
                //cellsAreaRect
                // .attr("width", cellsAreaWidth)
                    //.attr("height", cellsAreaHeight)

                //col headings
                const colHeadingG = colHeadingsG.selectAll("g.col-heading").data(colHeadings)
                colHeadingG.enter()
                    .append("g")
                        .attr("class", "col-heading heading")
                        .each(function(){ 
                            d3.select(this)
                                .append("text")
                                    .attr("dominant-baseline", "central")
                                    .attr("text-anchor", "start")
                                    .attr("font-size", 5) 
                        })
                        .merge(colHeadingG)
                        .attr("transform", (d,i) => "translate("+(i * cellWidth) +",0)")
                        .each(function(d){
                            d3.select(this).select("text")
                                .attr("transform", "translate("+cellMargin.left +"," +(colHeadingsHeight/2) +")")
                                .text(d|| "N/A")
                        })

                //row headings
                const rowHeadingG = rowHeadingsG.selectAll("g.row-heading").data(rowHeadings)
                rowHeadingG.enter()
                    .append("g")
                        .attr("class", "row-heading heading")
                        .each(function(){ 
                            d3.select(this)
                                .append("text")
                                    .attr("dominant-baseline", "central")
                                    .attr("font-size", 5) 
                        })
                        .merge(rowHeadingG)
                        .attr("transform", (d,i) => "translate(0, "+(i * cellHeight) +")")
                        .each(function(d){
                            d3.select(this).select("text")
                                .attr("transform", "translate(0," +(cellHeight/2) +")")
                                .text(d|| "N/A")
                        })

                //cells
                const cellG = cellsAreaG.selectAll("g.cell").data(cellData);
                cellG.enter()
                    .append("g")
                        .attr("class", d => "cell col-"+d.pos[0] +" row-"+d.pos[1])
                        .each(function(d){ 
                            d3.select(this)
                                .append("text")
                                    .attr("dominant-baseline", "central")
                                    .attr("font-size", 5) 
                        })
                        .merge(cellG)
                        .attr("transform", d => "translate("+(d.pos[0] * cellWidth) +"," +(d.pos[1] * cellHeight) +")")
                        .each(function(d){
                            d3.select(this).select("text")
                                .attr("transform", "translate("+cellMargin.left +"," +(cellHeight/2) +")")
                                .text(d.value || "N/A")
                        })
            }
        })

        return selection;
    }

    //api
    table.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = { ...margin, ...value};
        return table;
    };
    table.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return table;
    };
    table.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return table;
    };

    return table;
}
