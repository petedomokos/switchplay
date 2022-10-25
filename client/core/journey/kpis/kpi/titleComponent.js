import * as d3 from 'd3';
import { DIMNS, grey10 } from "../../constants";
import dragEnhancements from '../../enhancedDragHandler';

/*

*/
export default function titleComponent() {
    //API SETTINGS
    let parentSelector = "";
    let parent = function(){ return d3.select(this); };
    // dimensions
    let width = 100;
    let height = 30;
    let margin = { left: 0, right:0, top: 0, bottom: 0 };
    let contentsWidth;
    let contentsHeight;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
    }

    const defaultStyles = {
        name:{
            fontSize:9,
            stroke:grey10(8),
            fill:grey10(8),
            textAnchor:null,
            dominantBaseline:null
        }
    };
    let _styles = () => defaultStyles;
    let transform = () => null;

    let getName = d => d.name;


    //API CALLBACKS
    let onNameClick = function(){};
    let onNameDblClick = function(){};
    let onNameLongpressStart = function(){};
    let onNameLongpressEnd = function(){};
    let onNameMouseover = function(){};
    let onNameMouseout = function(){};

    let onDescClick = function(){};
    let onDescDblClick = function(){};

    const enhancedDrag = dragEnhancements();

    function title(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log} = options;

        updateDimns();

        // expression elements
        selection.each(function (data, i) {
            //console.log("title", data)
            const { key } = data;
            const parentG = parent.call(this, parent);
            const styles = _styles(data, i);

            enhancedDrag
                .onClick(onNameClick)
                .onDblClick(onNameDblClick);
                
            const drag = d3.drag()
                .on("start", enhancedDrag())
                .on("drag", enhancedDrag())
                .on("end", enhancedDrag());

            const titleG = parentG.selectAll("g.title").data([data]);
            titleG.enter()
                .append("g")
                .attr("class", `title title-${key}`)
                .style("cursor", "pointer")
                .each(function(d, i){
                    const contentsG = d3.select(this).append("g").attr("class", "title-contents");

                    contentsG
                        .append("rect")
                            .attr("class", "title-bg")
                            .attr("stroke", "black")
                            .attr("fill", "white");

                    //for now, just have one bg rect for the whole title
                    contentsG
                        .append("g")
                            .attr("class", "name")
                                .append("text");

                })
                .merge(titleG)
                .attr("transform", (d,i) => transform(d, i))
                .each(function(d, i){
                    //console.log("d", d)
                    //console.log("i", i)
                    const contentsG = d3.select(this).select("g.title-contents")
                        .attr("transform", `translate(${margin.left},${margin.top})`);

                    contentsG.select("rect.title-bg")
                        .attr("width", contentsWidth)
                        .attr("height", contentsHeight)
                        .attr("fill", styles.bg?.fill || null)
                        .attr("fill", "red")
                    
                    //nameG.select("rect")
                        //.attr("width", nameCharWidth * getName(data).length)
                        //.attr("height", nameHeight);

                    const nameTextAnchor = styles.name.textAnchor;
                    const nameDomBaseline = styles.name.dominantBaseline;
                    const nameX = nameTextAnchor === "end" ? contentsWidth : (nameTextAnchor === "middle" ? contentsWidth/2 : 0);
                    const nameY = nameDomBaseline === "bottom" ? contentsHeight : (nameDomBaseline === "central" ? contentsHeight/2 : 0);
                    const nameG = contentsG.select("g.name")
                        .attr("transform", `translate(${nameX},${nameY})`);

                    nameG.select("text")
                        .attr("text-anchor", styles.name.textAnchor)
                        .attr("dominant-baseline", styles.name.dominantBaseline)
                        .attr("font-size", styles.name.fontSize)
                        .attr("stroke", styles.name.stroke)
                        .attr("fill", styles.name.fill)
                        .attr("stroke-width", styles.name.strokeWidth)
                        .text(getName(d) +" " +i) //temp add i so they different 
    
                })
                .call(drag)

            //EXIT
            titleG.exit().each(function(d){
                //will be multiple exits because of the delay in removing
                if(!d3.select(this).attr("class").includes("exiting")){
                    d3.select(this)
                        .classed("exiting", true)
                        .transition()
                            .duration(200)
                            .attr("opacity", 0)
                            .on("end", function() { d3.select(this).remove(); });
                }
            })
        })

        return selection;
    }
    
    //api
    title.parent = function (value) {
        if (!arguments.length) { return parent; }
        if(typeof value === "string"){
            parentSelector = value;
            parent = function(){ return d3.select(this).select(parentSelector); }
        }else {
            parent = value;
        }
        return title;
    };
    title.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return title;
    };
    title.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return title;
    };
    title.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = { ...margin, ...value };
        return title;
    };
    title.transform = function (value) {
        if (!arguments.length) { return transform; }
        if(typeof value === "function"){
            transform = value;
        }
        return title;
    };
    title.styles = function (func) {
        if (!arguments.length) { return _styles; }
        _styles = (d,i) => {
            const requiredStyles = func(d,i);
            return {
                name:{ ...defaultStyles.name, ...requiredStyles.name },
                //others here
            }
        };
        return title;
    };
    title.getName = function (value) {
        if (!arguments.length) { return getName; }
        if(typeof value === "function"){
            getName = value;
        }
        return title;
    };
    title.onNameClick = function (value) {
        if (!arguments.length) { return onNameClick; }
        onNameClick = value;
        return title;
    };
    title.onNameDblClick = function (value) {
        if (!arguments.length) { return onNameDblClick; }
        onNameDblClick = value;
        return title;
    };
    title.onNameLongpressStart = function (value) {
        if (!arguments.length) { return onNameLongpressStart; }
        if(typeof value === "function"){
            onNameLongpressStart = value;
        }
        return title;
    };
    title.onNameLongpressEnd = function (value) {
        if (!arguments.length) { return onNameLongpressEnd; }
        if(typeof value === "function"){
            onNameLongpressEnd = value;
        }
        return title;
    };
    title.onNameMouseover = function (value) {
        if (!arguments.length) { return onNameMouseover; }
        if(typeof value === "function"){
            onNameMouseover = value;
        }
        return title;
    };
    title.onNameMouseout = function (value) {
        if (!arguments.length) { return onNameMouseout; }
        if(typeof value === "function"){
            onNameMouseout = value;
        }
        return title;
    };
    return title;
}
