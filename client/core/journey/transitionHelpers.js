import * as d3 from 'd3';
import { getTransformationFromTrans } from './helpers';
import { TRANSITIONS } from "./constants"

export function updateTransform(selection, options={}){
    //console.log("updateTransform-----------------------")
    const { x = d => d.x, y = d => d.y, k= () => 1, transition, cb = () => {} } = options;
    selection.each(function(d, i){
        const { translateX, translateY } = getTransformationFromTrans(d3.select(this).attr("transform"));
        if(Math.abs(translateX - x(d, i)) < 0.001 && Math.abs(translateY - y(d, i)) < 0.001){
            //already where it needs to be
            return;
        }
        if(d3.select(this).attr("class").includes("transitioning")){
            //already in transition - so we ignore the new request
            return;
        }
        if(transition){
            d3.select(this)
                .classed("transitioning", true)
                .transition()
                .ease(typeof transition.ease() === "function" ? transition.ease(d,i) : (transition.ease || d3.easeLinear))
                .delay(typeof transition.delay === "function" ? transition.delay(d,i) : (transition.delay || null))
                //.duration(typeof transition.duration === "function" ? transition.duration(d,i) : (transition.duration || TRANSITIONS.MED))
                .duration(TRANSITIONS.MED)
                    .attr("transform", `translate(${x(d, i)},${y(d, i)}) scale(${k(d, i)})`)
                    .on("end", function(d,i){
                        d3.select(this).classed("transitioning", false);
                        cb.call(this, d, i);
                    });
        }else{
            d3.select(this)
                .attr("transform", `translate(${x(d, i)},${y(d, i)}) scale(${k(d, i)})`);
            
            cb.call(this);
        }
    })
}

export function updateRectDimns(selection, options={}){
    const { width = d => d.width, height = d => d.height, transition, cb = () => {} } = options;
    selection.each(function(d){
        if(transition){
            d3.select(this)
                .transition()
                //.duration(200)
                .duration(TRANSITIONS.MED)
                    .attr("width", width(d))
                    .attr("height", height(d))
                    .on("end", cb);
        }else{
            d3.select(this)
                .attr("width", width(d))
                .attr("height", height(d));
            
            cb.call(this);
        }
    })
}
