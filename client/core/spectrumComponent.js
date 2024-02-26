import * as d3 from 'd3';
import { grey10 } from "./cards/constants"
import { updateTransform, updateRectDimns } from './journey/transitionHelpers';
import { fadeIn, remove } from './journey/domHelpers';

const eyeImgDimns = { width: 304, height:215 };
//note  //width was 4677, went to 300 = scale 15.59, so height 3307 becomes 212.123
const eyeAspectRatio = eyeImgDimns.height / eyeImgDimns.width;
const eyeImage = {
    ...eyeImgDimns,
    aspectRatio:eyeAspectRatio,
    url:"website/data-display/eye_transparent.png"
}
const transition = { duration: 400 }
export default function spectrumComponent() {
    //API SETTINGS
    // dimensions
    let width = 300;
    let height = 600;
    let margin = { left:0, right:0, top:0, bottom:0 };
    let contentsWidth;
    let contentsHeight;

    let eyeWidth;
    let eyeHeight;
    let eyeScaleK;
    let extraVertSpace;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        eyeWidth = contentsWidth;
        eyeHeight = eyeWidth * eyeImage.aspectRatio;
        console.log("ew eh", eyeWidth, eyeHeight)
        eyeScaleK = eyeWidth / eyeImage.width;
        extraVertSpace = contentsHeight - eyeHeight;

    }

    let styles = {
    }

    //state


    function spectrum(selection, options={}) {
        const { } = options;

        updateDimns();

        // expression elements
        selection.each(function (data) {
            //console.log("spectrum update")
            const containerG = d3.select(this);

            if(containerG.select("g.spectrum-contents").empty()){
                init.call(this, data);
            }

            update.call(this, data);

            function init(){
                const containerElement = d3.select(this)
                    .attr("width", width)
                    .attr("height", height);

                containerElement.append("rect")
                    .attr("class", "spectrum-bg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("stroke", "none")
                    .attr("stroke-width", 1)
                    .attr("fill", "transparent");

                const contentsG = containerElement.append("g")
                    .attr("class", "spectrum-contents")
                    .attr("transform", `translate(${margin.left},${margin.top})`);
                
                contentsG
                    .append("rect")
                        .attr("class", "spectrum-contents-bg")
                        .attr("stroke", grey10(2))
                        .attr("stroke-width", 0.3)
                        .attr("stroke-dasharray", 3)
                        .attr("stroke", "none")
                        .attr("fill", "none");

                const eyeG = contentsG.append("g")
                    .attr("class", "eye")

                eyeG.append("rect")
                    .attr("class", "eye-bg bg")
                    .attr("fill", "transparent")
                    .attr("stroke", "none")
                    .attr("stroke-width", 0.1)

                eyeG.append("image");

            }


            function update(data, options={}){
                //Main gs and bgs
                const containerElement = d3.select(this)
                    .attr("width", width)
                    .attr("height", height);
            
                containerElement.select("rect.spectrum-bg")
                    .call(updateRectDimns, { 
                        width: () => width, 
                        height:() => height,
                        transition
                    })

                const contentsG = containerElement.select("g.spectrum-contents")
                    .call(updateTransform, { x:() => margin.left, y:() => margin.top, transition })
                    //.attr("transform", `translate(${margin.left},${margin.top})`);

                contentsG.select("rect.spectrum-contents-bg")
                    .call(updateRectDimns, { 
                        width: () => contentsWidth, 
                        height:() => contentsHeight,
                        transition
                    })
                    
                const eyeG = contentsG.select("g.eye")
                    .attr("transform", `translate(0, ${extraVertSpace/2})`);

                eyeG.select("rect")
                    .attr("width", eyeWidth)
                    .attr("height", eyeHeight)

                const eyeTransform = `scale(${eyeScaleK})`
                eyeG.select("image")
                    .attr("xlink:href", eyeImage.url)
                    .attr("transform", eyeTransform)
                    .attr("opacity", 1);

            }

        })

        return selection;
    }
    
    //api
    spectrum.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return spectrum;
    };
    spectrum.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return spectrum;
    };
    spectrum.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = { ...margin, ...value };
        return spectrum;
    };
    spectrum.styles = function (value) {
        if (!arguments.length) { return styles; }
        styles = { ...styles, ...value };
        return spectrum;
    };

    return spectrum;
}
