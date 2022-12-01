import * as d3 from 'd3';

/*

*/
export default function container() {
    //API SETTINGS
    let parentSelector = "";
    let parent = function(){ return d3.select(this); };
    // dimensions
    let DEFAULT_MARGIN = { left: 0, right: 0, top: 0, bottom: 0 };
    let _margin = () => DEFAULT_MARGIN;
    let _transformEnter = () => null;
    let _transform = () => null;

    let _enter = function(){};
    let _update = function(){};
    let _updateOnly = function(){};
    let _exit = function(){};

    let sharedClassName = "container";
    let _className;

    let returnOriginalSelection = false;

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
            .each(function(d, i){
                //pass through the corect index to enter/update/exit
                const enter = function() { _enter.call(this, d, i) }
                const update = function() { _update.call(this, d, i) }
                const updateOnly = function() { _updateOnly.call(this, d, i) }
                const exit = function() { _exit.call(this, d, i) }

                //const margin = _margin(d,i)
                const className = _className ? `${_className(d,i)} ${sharedClassName}` : sharedClassName;
                const parentG = parent.call(this, parent);
                const contG = parentG.selectAll(`g.${sharedClassName}`).data([d])
                contG.enter()
                    .append("g")
                        .attr("class", className)
                        .attr("transform", _transformEnter(d,i))
                        .each(enter)
                        .merge(contG)
                        .attr("transform", _transform(d,i))
                        .each(update)
                
                contG.each(updateOnly);

                contG.exit().each(exit)
            })
            //.call(drag)
    }
    
    //api
    _container.className = function (value) {
        if (!arguments.length) { return _className; }
        if(typeof value === "string"){
            sharedClassName = value;
        }else{
            _className = value;
        }
        return _container;
    };
    _container.margin = function (func) {
        if (!arguments.length) { return _margin; }
        _margin = (d,i) => ({ ...DEFAULT_MARGIN, ...func(d,i) })
        return _container;
    };
    _container.transformEnter = function (func) {
        if (!arguments.length) { return _transformEnter; }
        _transformEnter = func;
        return _container;
    };
    _container.transform = function (value) {
        if (!arguments.length) { return _transform; }
        if(typeof value === "string"){
            _transform = () => value;
        }else{
            _transform = value;
        }
        return _container;
    };
    _container.enter = function (func) {
        if (!arguments.length) { return _enter; }
        _enter = func;
        return _container;
    };
    _container.update = function (func) {
        if (!arguments.length) { return _update; }
        _update = func;
        return _container;
    };
    _container.updateOnly = function (func) {
        if (!arguments.length) { return _updateOnly; }
        _updateOnly = func;
        return _container;
    };
    _container.exit = function (func) {
        if (!arguments.length) { return _exit; }
        _exit = func;
        return _container;
    };
    _container.parent = function (value) {
        if (!arguments.length) { return parent; }
        if(typeof value === "string"){
            parentSelector = value;
            parent = function(){ 
                return d3.select(this).select(parentSelector); }
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
