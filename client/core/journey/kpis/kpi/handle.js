import * as d3 from 'd3';

export default { enter, update, exit }

function enter(selection){
    selection.each(function(d,i){
        const handleG = d3.select(this);
        switch(d.handleType){
            case "rect":{
                handleG.append("rect").attr("class", "element");
                break;
            }
            case "line":{
                handleG.append("line").attr("class", "element");
                break;
            }
            default:{
                //triangle
                handleG.append("path").attr("class", "element");
            }
        }  
    })
}

const handlePathD = (w, h, pos) =>  {
    if(pos === "below"){
        return `M0 0 l ${-w/2} ${h} h ${w} l ${-w/2} ${-h}`;
    }
    return `M0 0 l ${-w/2} ${-h} h ${w} l ${-w/2} ${h}`;  
}


const _styles = d => ({
    opacity:d.handleType === "rect" ? 0.4 : 0.8,
    fill:d.colour || "grey",
})
function update(selection, dimns){
    selection.each(function(d,i){
        const _dimns = typeof dimns === "function" ? dimns(d,i) : dimns;
        const styles = _styles(d);
        const { width, height } = _dimns;
        const handleElement = d3.select(this).select(".element")
            .attr("opacity", styles.opacity)
            .attr("fill", d.colour || styles.fill)
            .attr("stroke", d.colour || "none")
            .attr("stroke-width", d.strokeWidth || null)
            .attr("stroke-dasharray", d.strokeDasharray || null)



        switch(d.handleType){
            case "rect":{
                handleElement
                    .attr("x", -width/2)
                    .attr("y", -height/2)
                    .attr("width", width)
                    //note - handleHeight is split between above and below so rect overspills the bar
                    .attr("height", height);

                break;
            }
            case "line":{
                handleElement
                    .attr("y1", -height/2)
                    //note - handleHeight is split between above and below so line overspills the bar
                    .attr("y2", height/2);
    
                break;
            }
            default:{
                //triangle so element is a path
                handleElement
                    .attr("d", handlePathD(width, height, d.pos));
            }
        }  
    })
}

function exit(selection){
    selection.each(function(){
        d3.select(this).selectAll("*").remove(); 
    })
}