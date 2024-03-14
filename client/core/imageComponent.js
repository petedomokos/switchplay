import * as d3 from 'd3';
import { grey10 } from "./cards/constants"

import { updateTransform, updateRectDimns } from './journey/transitionHelpers';
import { fadeIn, remove } from './journey/domHelpers';
import { isNumber } from '../data/dataHelpers';

export default function imageComponent() {
    //API SETTINGS
    // dimensions
    let width = 300;
    let height = 600;
    let borderWidth;
    let borderHeight;
    let contentsWidth;
    let contentsHeight;

    let withBorderGradient = false;
    let cornerRadius = 0;
    let imgKey = ""

    function updateDimns(){
        borderWidth = isNumber(borderWidth) ? borderWidth : width * 0.05;
        borderHeight = isNumber(borderHeight) ? borderHeight : borderWidth;
        contentsWidth = withBorderGradient ? width : width - 2 * borderWidth;
        contentsHeight = withBorderGradient ? height : height - 2 * borderHeight;
    }

    let styles = {
        borderColour:"black"
    }

    //state
    function image(selection, options={}) {
        const { } = options;

        updateDimns();

        //transitions into and out of this scene
        const duration = 500;
        const transitionIn = { duration }
        //scene 1 must remove any stuff from the final scene (which may ) quicker
        const transitionOut = { duration }

        // expression elements
        selection.each(function (data) {
            const containerG = d3.select(this);

            if(containerG.select("g.image-contents").empty()){
                init.call(this, data);
            }

            update.call(this, data);

            function init(){
                const container = d3.select(this)
                    .attr("width", width)
                    .attr("height", height);

                container.append("rect")
                    .attr("class", "image-bg")
                    .attr("width", width)
                    .attr("height", height);

                container.append("g").attr("class", "image-contents")
                    .append("image")

            }


            function update(data, options={}){
                //Data
               
                //Main gs and bgs
                const container = d3.select(this)
                    /*.call(updateRectDimns, { 
                        width: () => width, 
                        height:() => height,
                        transition:transitionIn
                    })*/
            
                container.select("rect.image-bg")
                    //.attr("stroke-width", borderWidth)
                    .attr("rx", cornerRadius)
                    .attr("ry", cornerRadius)
                    .attr("width", width)
                    .attr("height", height)
                    //.attr("display", "none")
                    .attr("stroke", "white")
                    .attr("fill","none")// withBorderGradient ? "none" : styles.borderColour)
                    /*.call(updateRectDimns, { 
                        width: () => width, 
                        height:() => height,
                        transition:transitionIn
                    })*/

                const contentsG = container.select("g.image-contents")
                    .attr("transform", `translate(${withBorderGradient ? 0 : borderWidth}, ${withBorderGradient ? 0 : borderHeight})`)
                    //.attr('clip-path',`url(#${imgKey}-rect-clip)`)

                //next - diagonal rects for corners
                //next - change compatible list into two rows always, 

                //BUG - SAFARI ACTS WIERD WITH CLIPPATH DIMNS, BUTNOT NEEDED ANYWAY
                /*
                console.log("cw ch", contentsWidth, contentsHeight)
                const roundedW = Math.round(contentsWidth);
                console.log("roundedCW", roundedW, typeof roundedW)
                container.select("defs").select(`#${imgKey}-rect-clip`)
                    .select("rect")
                        .attr("width", roundedW + 71)// Math.round(contentsWidth))
                        .attr("height", 1000)// Math.round(contentsHeight))
                        .attr("rx", cornerRadius)
                        .attr("ry", cornerRadius)*/

                contentsG.select("image")
                    .attr("xlink:href", data.url)
                    //.attr("transform", "translate(0px, 0px) scale(0.65)")
                    .attr("transform", data.transform || null)
                    .attr("transform-origin", "top left")
                    //.attr("transform-box", "fill-box")

                const borderGradientData = withBorderGradient ? 
                    ["left", "right", "top", "bottom", "top-left", "top-right", "bottom-left", "bottom-right"] : [];

                const maxBorderDimn = d3.max([borderWidth, borderHeight]);
                const diagonalHeight = maxBorderDimn;
                const diagonalWidth = diagonalHeight;
                const borderGradientRect = container.selectAll("rect.border-gradient").data(borderGradientData);
                borderGradientRect.enter()
                    .append("rect")
                        .attr("class", "border-gradient")
                        .merge(borderGradientRect)
                        .attr("transform", d =>{
                            if(d === "top-left") { return `rotate(45) translate(${maxBorderDimn * 0.05}, ${0})` } 
                            if(d === "top-right") { return `rotate(45) translate(${0}, ${maxBorderDimn * 0.05})` } 
                            if(d === "bottom-left") { return `rotate(-45) translate(${maxBorderDimn * 0.05}, ${0})` } 
                            if(d === "bottom-right") { return `rotate(-45) translate(${0}, ${-maxBorderDimn * 0.05})` } 
                            return null;
                        })
                        .attr("transform-origin", d => {
                            if(d === "top-left"){ return `${diagonalWidth/2} ${diagonalHeight/2}`; }
                            if(d === "top-right"){ return `${width - diagonalWidth/2} ${diagonalHeight/2}`; }
                            if(d === "bottom-left"){ return `${diagonalWidth/2} ${height - diagonalHeight/2}`; }
                            if(d === "bottom-right"){ return `${width - diagonalWidth/2} ${height - diagonalHeight/2}`; }
                            return null;
                        })
                        .attr("x", d => {
                            if(d.includes("right")){ return width - borderWidth; }
                            return 0;
                        })
                        .attr("y", d => {
                            if(d.includes("bottom")){ return height - borderHeight; }
                            return 0;
                        })
                        .attr("width", (d,i) => d.includes("-") ? diagonalWidth : (i <= 1 ? borderWidth : width))
                        .attr("height", (d,i) => d.includes("-") ? diagonalHeight : (i <= 1 ? height : borderHeight))
                        //.attr("fill", d => d.includes("-") ? "red" : "blue")// d => `url(#${imgKey}-img-grad-${d})`)
                        .attr("fill", d => {
                            //corners
                            if(d === "top-left"){ return `url(#${imgKey}-img-grad-left)`; }
                            if(d === "top-right"){ return `url(#${imgKey}-img-grad-top)`; }
                            if(d === "bottom-left"){ return `url(#${imgKey}-img-grad-left)`; }
                            if(d === "bottom-right"){ return `url(#${imgKey}-img-grad-bottom)`; }
                            //sides
                            return `url(#${imgKey}-img-grad-${d})`
                        })

                borderGradientRect.exit().remove();


            }

        })

        return selection;
    }
    
    //api
    image.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return image;
    };
    image.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return image;
    };
    image.borderWidth = function (value) {
        if (!arguments.length) { return borderWidth; }
        borderWidth = value;
        return image;
    };
    image.borderHeight = function (value) {
        if (!arguments.length) { return borderHeight; }
        borderHeight = value;
        return image;
    };
    image.withBorderGradient = function (value) {
        if (!arguments.length) { return withBorderGradient; }
        withBorderGradient = value;
        return image;
    };
    image.styles = function (value) {
        if (!arguments.length) { return styles; }
        styles = { ...this.styles, ...value };
        return image;
    };
    image.imgKey = function (value) {
        if (!arguments.length) { return imgKey; }
        imgKey = value;
        return image;
    };

    return image;
}
