import * as d3 from 'd3';

/*

*/
export default function container() {
    //API SETTINGS
    let parentSelector = "";
    let parent = function(){ return d3.select(this); };
    // dimensions
    let margin = { left: 0, right:0, top: 0, bottom: 0 };
    let className = "";

    //API CALLBACKS
    /*
    let onClick = function(){};
    let onDblClick = function(){};
    let onDragStart = function(){};
    let onDrag = function() {};
    let onDragEnd = function() {};
    let onLongpressStart = function(){};
    let onLongpressDragged = function(){};
    let onLongpressEnd = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};
    let onDelete = function(){};

    const enhancedDrag = dragEnhancements();
    */

    function _container(selection, options={}) {
        /*
        const drag = d3.drag()
            .on("start", enhancedDrag())
            .on("drag", enhancedDrag())
            .on("end", enhancedDrag());
            */

        // expression elements
        selection
            .each(function(){
                const parentG = parent.call(this, parent);
                parentG.selectAll(`g.${className}`).data([1])
                    .join("g")
                        .attr("class", `${className}`)
                        .attr("transform", `translate(${margin.left},${margin.top})`)
            })
            //.call(drag)


        return selection;
    }
    
    //api
    _container.className = function (value) {
        if (!arguments.length) { return className; }
        className = value;
        return _container;
    };
    _container.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = { ...margin, ...value };
        return _container;
    };
    _container.parent = function (value) {
        if (!arguments.length) { return parent; }
        if(typeof value === "string"){
            parentSelector = value;
            parent = function(){ return d3.select(this).select(parentSelector); }
        }else {
            parent = value;
        }
        return _container;
    };
    /*
    container.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return container;
    };
    container.onDblClick = function (value) {
        if (!arguments.length) { return onDblClick; }
        onDblClick = value;
        return container;
    };
    container.onDragStart = function (value) {
        if (!arguments.length) { return onDragStart; }
        if(typeof value === "function"){
            onDragStart = value;
        }
        return container;
    };
    container.onDrag = function (value) {
        if (!arguments.length) { return onDrag; }
        if(typeof value === "function"){
            onDrag = value;
        }
        return container;
    };
    container.onDragEnd = function (value) {
        if (!arguments.length) { return onDragEnd; }
        if(typeof value === "function"){
            onDragEnd = value;
        }
        return container;
    };
    container.onLongpressStart = function (value) {
        if (!arguments.length) { return onLongpressStart; }
        if(typeof value === "function"){
            onLongpressStart = value;
        }
        return container;
    };
    container.onLongpressDragged = function (value) {
        if (!arguments.length) { return onLongpressDragged; }
        if(typeof value === "function"){
            onLongpressDragged = value;
        }
        return container;
    };
    container.onLongpressEnd = function (value) {
        if (!arguments.length) { return onLongpressEnd; }
        if(typeof value === "function"){
            onLongpressEnd = value;
        }
        return container;
    };
    container.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return container;
    };
    container.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return container;
    };
    container.onDelete = function (value) {
        if (!arguments.length) { return onDelete; }
        if(typeof value === "function"){
            onDelete = value;
        }
        return container;
    };
    */
    return _container;
}
