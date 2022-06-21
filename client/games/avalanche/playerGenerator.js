import * as d3 from 'd3';
import { COLOURS } from '../constants';

export function playerGenerator(){
    //api vars
    let width = 70;
    let height = 60;
    let bodyHeight;
    let headHeight;
    let dragExtent = {};

    let circleRadius;

    function updateDimns(){
        bodyHeight = height * 0.7;
        headHeight = height * 0.3;
    };

    function player(selection){
        selection.each(function(data){
            console.log("player")

            updateDimns();

            const drag = d3.drag()
                .on("start", dragStart)
                .on("drag", dragged)
                .on("end", dragEnd);

            const playerG = d3.select(this)
                .attr("fill", "blue")
                .attr("opacity", 0.5)
                .attr("transform", "translate("+data.x +"," + data.y +")")
                .call(drag);

            const bodyRect = playerG.append("rect")
                .attr("y", headHeight)
                .attr("width", width)
                .attr("height", bodyHeight)

            const headCircle = playerG.append("circle")
                .attr("cx", width/2)
                .attr("cy", headHeight/2)
                .attr("r", headHeight/2)

        })

        function dragStart(e,d){

        }
        function dragged(e,d){
            const newX = d.x + e.dx;
            const newY = d.y + e.dy;
            if(!(newX < dragExtent.x[0]) && !(newX > dragExtent.x[1] - width)) {
                d.x = newX;
            }
            if(!(newY < dragExtent.y[0]) && !(newY > dragExtent.y[1] - height)) {
                d.y = newY;
            }
            
            d3.select(this).attr("transform", "translate("+ d.x +"," + d.y +")")
            
        }
        function dragEnd(e,d){
            
        }

    }

    // api
    player.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return player;
    };
    player.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return player;
    };
    player.dragExtent = function (value) {
        if (!arguments.length) { return dragExtent; }
        dragExtent = value;
        return player;
    };
    return player;
}

