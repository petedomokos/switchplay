import * as d3 from 'd3';
import { DIMNS, grey10, OVERLAY, COLOURS } from "./constants";
import { trophy } from "../../../assets/icons/milestoneIcons.js"
import { toRadians } from '../journey/screenGeometryHelpers';
import dragEnhancements from '../journey/enhancedDragHandler';

const { GOLD } = COLOURS;

function pentagonVertices(options={}){
    const { r=1, centre=[0,0], theta, n=5 } = options;
    const a = [centre[0], -r];

    return d3.range(n).map((pos,i) => {
        const thetaVal = theta(i);
        return [
            a[0]+ r * Math.sin(toRadians(thetaVal)),
            a[1] + r * (1 - Math.cos(toRadians(thetaVal)))
        ]
    })
}
/*

*/
export default function pentagonComponent() {
    //API SETTINGS
    // dimensions
    let r1 = 0;
    let r2 = 100;
    let withSections = true;
    let editable = true;

    let innerVertices;
    let outerVertices;
    //let outerHitboxVertices;
    let segmentVertices;
    let hitlineStrokeWidth;

    let shouldTruncate;
    
    
    function updateDimns(){
        hitlineStrokeWidth = r2 * 0.45;
        innerVertices = pentagonVertices({ r:r1, theta:i => i * 72 });
        outerVertices = pentagonVertices({ r:r2, theta:i => i * 72 });
        //outerHitboxVertices = pentagonVertices({ r:r2+hitlineStrokeWidth/2, theta:i => i * 72 });
        segmentVertices = pentagonVertices({ r:r1 + (r2 - r1)/2, theta:i => (i + 0.5) * 72 });

        shouldTruncate = r2 - r1 < 100;
    }

    let styles = {
        _lineStrokeWidth:() => 5,
        _lineStroke:() => "grey"
    }

    //API CALLBACKS
    let onClick = function(){};
    let onLongpressStart = function(){};
    let onLongpressEnd = function(){};
    let onDragStart = function(){};
    let onDrag = function(){};
    let onDragEnd = function(){};
    //let onMouseover = function(){};
    //let onMouseout = function(){};

    let enhancedDrag = dragEnhancements();

    function pentagon(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;
        updateDimns();
        selection.each(function (sectionsData, i) {
            update.call(this, sectionsData);
        })

        function update(sectionsData){

            //drag
            enhancedDrag
                .dragThreshold(100)
                .onLongpressStart(onLongpressStart)
                .onLongpressEnd(onLongpressEnd)
                .onClick(onClick);

            const drag = d3.drag()
                .on("start", enhancedDrag(onDragStart))
                .on("drag", enhancedDrag(onDrag))
                .on("end", enhancedDrag(onDragEnd))

            const containerG = d3.select(this);
            const sectionG = containerG.selectAll("g.section").data(sectionsData);
            sectionG.enter()
                .append("g")
                    .attr("class", "section")
                    .each(function(d,i){
                        const sectionG = d3.select(this);
                        sectionG.append("line").attr("class", "start show-with-section visible");
                        sectionG.append("line").attr("class", "finish show-with-section visible")
                            //.attr("opacity", 1)
                            //.attr("display", "none");

                        sectionG.append("line").attr("class", "inner show-with-section visible");
                        sectionG.append("line").attr("class", "outer visible");
                        //sectionG.append("line").attr("class", "outer-line-hitbox")
                            //.style("stroke", "transparent");
                            
                        sectionG.append("path").attr("class", "section-hitbox")
                            .attr("fill", "transparent")
                            //.style("fill", i % 2 === 0 ? "blue" : "yellow");

                        const sectionContentsG = sectionG.append("g").attr("class", "section-contents show-with-section");
                        sectionContentsG
                            .append("text")
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")
                                .attr("font-size", "9px")
                                .attr("stroke-width", 0.1)
                                .attr("stroke", grey10(7))
                                .attr("fill", grey10(7));

                    })
                    .merge(sectionG)
                    .attr("pointer-events", editable ? null : "none")
                    .each(function(d,i){
                        //segement points start from centre (a) clockwise around the quadrilateral
                        const ax = innerVertices[i][0];
                        const ay = innerVertices[i][1];
                        const bx = outerVertices[i][0];
                        const by = outerVertices[i][1];
                        const cx = outerVertices[i + 1] ? outerVertices[i+1][0] : outerVertices[0][0];
                        const cy = outerVertices[i + 1] ? outerVertices[i+1][1] : outerVertices[0][1];
                        const dx = innerVertices[i + 1] ? innerVertices[i+1][0] : innerVertices[0][0];
                        const dy = innerVertices[i + 1] ? innerVertices[i+1][1] : innerVertices[0][1];

                        const sectionG = d3.select(this);
                        //startLine
                        sectionG.select("line.start")
                            .transition("start-trans")
                            .delay(300)
                            .duration(200)
                                .attr("x1", ax)
                                .attr("y1", ay)
                                .attr("x2", bx)
                                .attr("y2", by)

                        //finishLine
                        //@todo - include this when a section is clicked, or longpressed
                        sectionG.select("line.finish")
                            .transition("finish-trans")
                            .delay(300)
                            .duration(200)
                                .attr("x1", cx)
                                .attr("y1", cy)
                                .attr("x2", dx)
                                .attr("y2", dy)
                        
                        /*sectionG.select("line.finish")
                            .transition("finish-trans")
                            .delay(500)
                            .duration(500)
                                .attr("opacity", 0)
                                .on("end", function(){
                                    d3.select(this).attr("display", "none")
                                })*/
                        

                        //inner line
                        //delay needed so when card swiped the lines dont transition too soon
                        const innerLine = sectionG.select("line.inner");
                        innerLine
                            .transition("inner-trans")
                            .delay(300)
                            .duration(200)
                                .attr("x1", ax)
                                .attr("y1", ay)
                                .attr("x2", dx)
                                .attr("y2", dy)

                        //outer line
                        const outerLine = sectionG.select("line.outer");
                        outerLine
                            .transition("outer-trans")
                            .delay(300)
                            .duration(200)
                                .attr("x1", bx)
                                .attr("y1", by)
                                .attr("x2", cx)
                                .attr("y2", cy)

                        

                        //outerLine hitbox
                        /*
                        sectionG.select("line.outer-line-hitbox")
                            .attr("x1", bx)
                            .attr("y1", by)
                            .attr("x2", cx)
                            .attr("y2", cy)
                            .attr("stroke-width", hitlineStrokeWidth)
                            .attr("display", editable ? null : "none")*/

                        sectionG.select("path.section-hitbox")
                            .attr("d", `M${ax},${ay} L${bx},${by} L${cx},${cy} L${dx},${dy}`)

                        //all lines
                        sectionG.selectAll("line.visible")
                            .transition("trans-stroke")
                            .duration(200)
                                .attr("stroke", styles._lineStroke(d,i))
                                .attr("stroke-width", styles._lineStrokeWidth(d,i))

                        sectionG.selectAll(".show-with-section")
                            .attr("pointer-events", withSections ? null : "none")
                            .transition("outer-trans")
                            .delay(300)
                            .duration(200)
                                .attr("opacity", withSections ? 1 : 0)

                        //text
                        const truncateIfNecc = text => shouldTruncate ? `${text.slice(0,7)}...` : text;
                        let text;
                        if(d.title){
                            text = truncateIfNecc(d.title);
                        } else {
                            text = `Item ${d.itemNr + 1}`;
                        }

                        //contents
                        const sectionContentsG = sectionG.select("g.section-contents")
                        sectionContentsG
                            .transition()
                            .delay(300)
                            .duration(200)
                                .attr("transform", `translate(${segmentVertices[i][0]}, ${segmentVertices[i][1]})`)

                        //text
                        sectionContentsG.select("text")
                            .attr("font-size", 10)
                            .text(text)

                    })
                    .call(drag)

            sectionG.exit().remove();

        }

        return selection;
    }
    
    //api
    pentagon.r1 = function (value) {
        if (!arguments.length) { return r1; }
        r1 = value;
        return pentagon;
    };
    pentagon.r2 = function (value) {
        if (!arguments.length) { return r2; }
        r2 = value;
        return pentagon;
    };
    pentagon.withSections = function (value) {
        if (!arguments.length) { return withSections; }
        withSections = value;
        return pentagon;
    };
    pentagon.editable = function (value) {
        if (!arguments.length) { return editable; }
        editable = value;
        return pentagon;
    };
    
    pentagon.styles = function (obj) {
        if (!arguments.length) { return styles; }
        styles = {
            ...styles,
            ...obj,
        };
        return pentagon;
    };
    pentagon.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return pentagon;
    };
    pentagon.onLongpressStart = function (value) {
        if (!arguments.length) { return onLongpressStart; }
        onLongpressStart = value;
        return pentagon;
    };
    pentagon.onLongpressEnd = function (value) {
        if (!arguments.length) { return onLongpressEnd; }
        onLongpressEnd = value;
        return pentagon;
    };
    pentagon.onDragStart = function (value) {
        if (!arguments.length) { return onDragStart; }
        onDragStart = value;
        return pentagon;
    };
    pentagon.onDrag = function (value) {
        if (!arguments.length) { return onDrag; }
        onDrag = value;
        return pentagon;
    };
    pentagon.onDragEnd = function (value) {
        if (!arguments.length) { return onDragEnd; }
        onDragEnd = value;
        return pentagon;
    };
    /*
    pentagon.onClickSectionLine = function (value) {
        if (!arguments.length) { return onClickSectionLine; }
        onClickSectionLine = value;
        return pentagon;
    };
    pentagon.onClickSectionContent = function (value) {
        if (!arguments.length) { return onClickSectionContent; }
        onClickSectionContent = value;
        return pentagon;
    };
    pentagon.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return pentagon;
    };
    pentagon.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return pentagon;
    };
    */
    return pentagon;
}
