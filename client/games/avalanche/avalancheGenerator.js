import * as d3 from 'd3';
import { gridGenerator } from "./gridGenerator";
import { playerGenerator } from "./playerGenerator";
import { COLOURS, NR_CELL_ROWS, NR_CELL_COLOURS } from '../constants';

export function avalancheGenerator(){
    //api vars
    let width = 500;
    let height = 500;
    let margin = {left:0, right:0, top:0, bottom:0};
    let contentsWidth;
    let contentsHeight;
    let mountainHeight;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
        mountainHeight = contentsHeight * 0.5;
    };

    let grid = gridGenerator();
    let player = playerGenerator();

    function avalanche(selection){
        updateDimns();

        selection.each(function(data){
            //console.log("av")
            const contentsG = d3.select(this)
                .attr("transform", "translate(" +margin.left +"," +margin.top +")")

            const gridWidth = contentsHeight * 0.6//0.475;
            const gridHeight = gridWidth * 0.8;
            const cellWidth = gridWidth / NR_CELL_COLOURS;
            const cellHeight = gridHeight / NR_CELL_ROWS;

            const plainG = contentsG.append("g")
            .attr("class", "plain")
            .attr("transform", "translate(" +(contentsWidth/2 - gridWidth/2) +"," +(contentsHeight * 0.5)+")")

            plainG.append("g")
                .attr("class", "grid")
                /*.call(grid
                    .width(gridWidth)
                    .height(gridHeight))*/

            const playerData = {
                x:100,
                y:100
            }
            plainG.append("g")
            .attr("class", "player")
            .datum(playerData)
            .call(player
                .width(cellWidth)
                .height(cellHeight)
                .dragExtent({x:[0, gridWidth], y:[0, gridHeight]}))

        })

    }

    // api
    avalanche.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return avalanche;
    };
    avalanche.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return avalanche;
    };
    return avalanche;
}

