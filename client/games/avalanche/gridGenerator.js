import * as d3 from 'd3';
import { COLOURS, NR_CELL_ROWS, NR_CELL_COLOURS } from '../constants';

export function gridGenerator(){
    //api vars
    let width = 500;
    let height = 400;
    let margin = {left:0, right:0, top:0, bottom:0};
    let contentsWidth;
    let contentsHeight;

    let nrRows = NR_CELL_ROWS || 4;
    let nrCols = NR_CELL_COLOURS || 5;
    let cellWidth;
    let cellHeight;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
        cellWidth = contentsWidth / nrCols;
        cellHeight = contentsHeight / nrRows;
    };

    const colours = COLOURS.grid;

    function grid(selection){
        updateDimns();

        selection.each(function(data){
            const contentsG = d3.select(this)
                .append("g")
                .attr("class", "grid-contents")
                .attr("transform", "translate(" +margin.left +"," +margin.top +")");

            //@todo - generalise, and use d3-matrix
            const cellData = Array.from(Array(nrRows).keys()).map(rowIndex => {
                const colNrs = Array.from(Array(nrCols).keys())
                return colNrs.map(colIndex => ([rowIndex, colIndex]))
            }).reduce((a,b) => [...a, ...b], [])
            
            const cellG = contentsG.selectAll("g.cell").data(cellData, d => d[0] +"-" +d[1])

            cellG.enter()
                .append("g")
                .attr("class", "cell")
                .each(function(d){
                    d3.select(this).append("rect")
                        .attr("fill", d => (d[0] + d[1]) % 2 === 0 ? colours.cell.even : colours.cell.odd)
                })
                .merge(cellG)
                .attr("transform", d => "translate(" +(d[1] * cellWidth) +"," +(d[0] * cellHeight) +")")
                .each(function(d){
                    d3.select(this).select("rect")
                        .attr("width", cellWidth)
                        .attr("height", cellHeight)
                });

        })

    }

    // api
    grid.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return grid;
    };
    grid.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return grid;
    };
    return grid;
}

