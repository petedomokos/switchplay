import * as d3 from 'd3';

export default function profileCardsLayout(){
    let timeScale = x => 0;
    let yScale = x => 0;
    let currentZoom = d3.zoomIdentity;

    let aligned = false;

    function update(data){
        
        return data.map(p => ({
            ...p,
            x:timeScale(p.date),
            y:yScale(p.yPC)
        }));
    }

    update.aligned = function (value) {
        if (!arguments.length) { return aligned; }
        aligned = value;
        return update;
    };
    update.timeScale = function (value) {
        if (!arguments.length) { return timeScale; }
        timeScale = value;
        return update;
    };
    update.yScale = function (value) {
        if (!arguments.length) { return yScale; }
        yScale = value;
        return update;
    };
    update.currentZoom = function (value) {
        if (!arguments.length) { return currentZoom; }
        currentZoom = value;
        return update;
    };

    return update;
}