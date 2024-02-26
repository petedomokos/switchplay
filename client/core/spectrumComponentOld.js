import * as d3 from 'd3';
import { grey10 } from "./cards/constants"
import { updateTransform, updateRectDimns } from './journey/transitionHelpers';
import { fadeIn, remove } from './journey/domHelpers';

const eyePathD1 = "M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z";
const eyePathD2 = "M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94291 16.4788 5 12.0012 5Z";
const dataPathD = "M30.000,32.000 L23.000,32.000 C22.447,32.000 22.000,31.552 22.000,31.000 L22.000,1.000 C22.000,0.448 22.447,-0.000 23.000,-0.000 L30.000,-0.000 C30.553,-0.000 31.000,0.448 31.000,1.000 L31.000,31.000 C31.000,31.552 30.553,32.000 30.000,32.000 ZM29.000,2.000 L24.000,2.000 L24.000,30.000 L29.000,30.000 L29.000,2.000 ZM19.000,32.000 L12.000,32.000 C11.448,32.000 11.000,31.552 11.000,31.000 L11.000,17.000 C11.000,16.448 11.448,16.000 12.000,16.000 L19.000,16.000 C19.553,16.000 20.000,16.448 20.000,17.000 L20.000,31.000 C20.000,31.552 19.553,32.000 19.000,32.000 ZM18.000,18.000 L13.000,18.000 L13.000,30.000 L18.000,30.000 L18.000,18.000 ZM8.000,32.000 L1.000,32.000 C0.448,32.000 0.000,31.552 0.000,31.000 L0.000,11.000 C0.000,10.448 0.448,10.000 1.000,10.000 L8.000,10.000 C8.552,10.000 9.000,10.448 9.000,11.000 L9.000,31.000 C9.000,31.552 8.552,32.000 8.000,32.000 ZM7.000,12.000 L2.000,12.000 L2.000,30.000 L7.000,30.000 L7.000,12.000 Z"
const dataPathTransform = "translate(5,15) scale(1.2)"
const transition = { duration: 400 }
export default function spectrumComponent() {
    //API SETTINGS
    // dimensions
    let width = 300;
    let height = 600;

    let margin = { left:0, right:0, top:0, bottom:0 };
    let contentsWidth;
    let contentsHeight;

    let endPointWidth;
    let endPointHeight;
    let endPointMargin;
    let endPointContentsWidth;
    let endPointContentsHeight;

    let spectrumLineWidth;
    let spectrumLineHeight;
    let waveAmplitude;

    let fusedWidth;
    let fusedHeight;
    let fusedMargin;
    let fusedContentsWidth;
    let fusedContentsHeight;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        endPointWidth = 80;
        endPointHeight = 80;
        endPointMargin = { left: 15, right: 15, top: 0, bottom: 30 };
        endPointContentsWidth = endPointWidth - endPointMargin.left - endPointMargin.right;
        endPointContentsHeight = endPointHeight - endPointMargin.top - endPointMargin.bottom;

        spectrumLineWidth = contentsWidth - 2 * endPointWidth;
        spectrumLineHeight = contentsHeight * 0.7;
        waveAmplitude = d3.max([20, spectrumLineWidth * 0.1]);

        fusedContentsWidth = endPointContentsWidth * 2.25;
        fusedContentsHeight = endPointContentsHeight * 2.25;
        fusedMargin = { left: 5, right: 5, top: 5, bottom: 5 };
        fusedWidth = fusedContentsWidth + fusedMargin.left + fusedMargin.right;
        fusedHeight = fusedContentsHeight + fusedMargin.top + fusedMargin.bottom;

    }

    let styles = {
        wvaeColor:"black",
        eyeStroke:grey10(2),
        barStroke:grey10(2),
        fusedStroke:grey10(2),
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
                        .attr("fill", "none");

                const spectrumLineG = contentsG.append("g").attr("class", "spectrum-line")
                spectrumLineG.append("path")
                    .attr("class", "spectrum-line")
                    .attr("fill", "none")
                    .attr("stroke-width", 0.7)
                    .attr("stroke-dasharray", 3)
                    .attr("stroke", styles.waveColor);

                const startG = spectrumLineG.append("g")
                    .attr("class", "start end-point");

                startG.append("rect")
                    .attr("class", "start-bg bg")
                    .attr("fill", "none")

                const endG = spectrumLineG.append("g")
                    .attr("class", "end end-point");

                endG.append("rect")
                    .attr("class", "end-bg bg")
                    .attr("fill", "none");

                const fusedG = contentsG.append("g")
                    .attr("class", "fused")

                fusedG.append("rect")
                    .attr("class", "fused-bg bg")
                    .attr("fill", "transparent")

                const startContentsG = startG.append("g").attr("class", "start-contents").attr("opacity", 0.9);
                const endContentsG = endG.append("g").attr("class", "end-contents").attr("opacity", 0.9);
                const fusedContentsG = fusedG.append("g").attr("class", "fused-contents");

                startContentsG.append("rect")
                    .attr("class", "start-contents-bg")
                    //.attr("stroke", "black")
                    //.attr("stroke-width", 0.1)
                    .attr("fill", "none")
                
                endContentsG.append("rect")
                    .attr("class", "end-contents-bg")
                    //.attr("stroke", "black")
                    //.attr("stroke-width", 0.1)
                    .attr("fill", "transparent")
                
                fusedContentsG.append("rect")
                    .attr("class", "fused-contents-bg")
                    //.attr("stroke", "black")
                    //.attr("stroke-width", 0.1)
                    .attr("fill", "transparent");

                //images and paths
                startContentsG.append("path").attr("class", " start-path start-path1")
                startContentsG.append("path").attr("class", "start-path start-path2")
                startContentsG.selectAll("path.start-path")
                    .attr("stroke", styles.eyeStroke)
                    .attr("stroke-width", 1)
                    .attr("stroke-linecap", "round")
                    .attr("stroke-linejoin", "round")
                    .attr("fill", "none");

                endContentsG.append("path").attr("class", "end-path")
                    .attr("stroke", styles.barStroke)
                    .attr("stroke-width", 0.8)

                fusedContentsG.append("image")
                    .attr("stroke", styles.fusedStroke)
                    .attr("stroke-width", 1)

            }


            function update(data, options={}){
                //DATA
            
                //RENDER

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

                const spectrumLineG = contentsG.select("g.spectrum-line")
                    .attr("transform", `translate(${endPointWidth},${endPointHeight/2})`);

                //@todo - make the wave only take a middle part of the line, and make it more messy
                const wavelength = Math.round(spectrumLineWidth);
                const halfWavelength = Math.round(wavelength/2);
                const quarterWavelength = Math.round(wavelength/4);
                const deltaX = 10;
                const deltaY = 5;
                const pt1X = quarterWavelength - deltaX;
                const pt2X = quarterWavelength + deltaX;
                const pt3X = halfWavelength + quarterWavelength - deltaX;
                const pt4X = halfWavelength + quarterWavelength + deltaX;

                const pt1Y = - waveAmplitude + deltaY;
                const pt2Y = pt1Y;
                const pt3Y = waveAmplitude - deltaY;
                const pt4Y = pt3Y;

                spectrumLineG.select("path.spectrum-line")
                    .attr("d", `M 0 0 C ${pt1X} ${pt1Y}, ${pt2X} ${pt2Y}, ${halfWavelength} 0 C ${pt3X} ${pt3Y}, ${pt4X} ${pt4Y}, ${wavelength} 0`);

                const endPointGs = spectrumLineG.selectAll("g.end-point");
                const startG = spectrumLineG.select("g.start")
                    .attr("transform", `translate(${-endPointWidth}, ${(-endPointHeight/2)})`);
                const endG = spectrumLineG.select("g.end")
                    .attr("transform", `translate(${spectrumLineWidth}, ${(-endPointHeight/2)})`);

                endPointGs.select("rect.bg")
                    .attr("width", endPointWidth)
                    .attr("height", endPointHeight)

                const fusedG = contentsG.select("g.fused")
                    .attr("transform", `translate(${(contentsWidth - fusedWidth)/2}, ${(contentsHeight - fusedHeight)})`);

                fusedG.select("rect.bg")
                    .attr("width", fusedWidth)
                    .attr("height", fusedHeight)

                //contents-bgs
                const startContentsG = startG.select("g.start-contents")
                    .attr("transform", `translate(${endPointMargin.left}, ${endPointMargin.top})`);
                
                startContentsG.select("rect")
                    .attr("width", endPointContentsWidth)
                    .attr("height", endPointContentsHeight)
                
                const endContentsG = endG.select("g.end-contents")
                    .attr("transform", `translate(${endPointMargin.left}, ${endPointMargin.top})`);
                
                endContentsG.select("rect")
                    .attr("width", endPointContentsWidth)
                    .attr("height", endPointContentsHeight)
                    
                const fusedContentsG = fusedG.select("g.fused-contents")
                    .attr("transform", `translate(${fusedMargin.left}, ${fusedMargin.top})`);
                
                fusedContentsG.select("rect")
                    .attr("width", fusedContentsWidth)
                    .attr("height", fusedContentsHeight)

                //images and paths
                //start and end points
                const eyeTransform = contentsHeight < 200 ? "translate(0,15) scale(2)" : "translate(0,15) scale(2)"
                const barsTransform = contentsHeight < 200 ? "translate(-10,20) scale(0.025)" : "translate(-33,-8) scale(0.035)"
                startContentsG.selectAll("path.start-path").attr("transform", eyeTransform)
                startContentsG.select("path.start-path1").attr("d", eyePathD1)
                startContentsG.select("path.start-path2").attr("d", eyePathD2)
                endContentsG.select("path.end-path").attr("d", dataPathD).attr("transform", dataPathTransform)

                //const fusedTransform = contentsHeight < 200 ? "translate(-10,25) scale(0.025)" : "translate(-33,-8) scale(0.035)"
                const fusedTransform = "scale(0.2)"
                fusedContentsG.select("image")
                    .attr("xlink:href", "website/icons/confused.svg")
                    .attr("transform", fusedTransform)
                    .attr("opacity", 0.9)



               
                //title
                /*const titleG = contentsG.selectAll("text.spectrum-title").data(titleData, d => d.key)
                titleG.enter()
                    .append("text")
                        .attr("class", "scene-title")
                        .call(fadeIn, { transition: transitionIn })
                        .merge(titleG)
                        .attr("transform", d => `translate(${d.x},${d.y})`)
                        .attr("text-anchor", d => d.textAnchor)
                        .attr("dominant-baseline", d => d.dominantBaseline)
                        .attr("font-family", d => d.fontFamily)
                        .attr("font-size", d => d.fontSize)
                        .attr("stroke-width", d => d.strokeWidth)
                        .attr("stroke", d => d.stroke)
                        .attr("fill", d => d.fill)
                        .text(d => d.title)

                titleG.exit().call(remove, { transition });*/

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
