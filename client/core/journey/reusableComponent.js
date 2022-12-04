import * as d3 from 'd3';

/*

*/
export default function somethingComponent() {
    // dimensions
    let margin = {left:5, right:5, top: 5, bottom:5};
    let width = 100;
    let height = 60;
    let contentsWidth;
    let contentsHeight;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
    };

    //dom
    let containerG;
    let contentsG;

    function something(selection) {
        updateDimns();
        selection.each(function (data) {
            
        })


        function init(){
            containerG = d3.select(this);

            contentsG = containerG
                .append("g")
                    .attr("class", "contents")
                    .attr("transform", "translate(" +margin.left +"," +margin.top +")")

        }

        return selection;
    }

    //api
    something.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = { ...margin, ...value};
        return something;
    };
    something.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return something;
    };
    something.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return something;
    };
    something.on = function () {
        if (!dispatch) return something;
        // attach extra arguments
        const value = dispatch.on.apply(dispatch, arguments);
        return value === dispatch ? something : value;
    };

    return something;
}
