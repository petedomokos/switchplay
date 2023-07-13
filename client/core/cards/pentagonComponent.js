import * as d3 from 'd3';
import { DIMNS, grey10, OVERLAY, COLOURS } from "./constants";
import { trophy } from "../../../assets/icons/milestoneIcons.js"
import { toRadians } from '../journey/screenGeometryHelpers';

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
    let outerHitboxVertices;
    let segmentVertices;
    let hitlineStrokeWidth;

    let shouldTruncate;
    
    
    function updateDimns(){
        hitlineStrokeWidth = r2 * 0.45;
        innerVertices = pentagonVertices({ r:r1, theta:i => i * 72 });
        outerVertices = pentagonVertices({ r:r2, theta:i => i * 72 });
        outerHitboxVertices = pentagonVertices({ r:r2+hitlineStrokeWidth/2, theta:i => i * 72 });
        segmentVertices = pentagonVertices({ r:r1 + (r2 - r1)/2, theta:i => (i + 0.5) * 72 });

        //console.log("r2 - r1", r2 - r1)
        shouldTruncate = r2 - r1 < 100;
    }

    let styles = {
        _lineStrokeWidth:() => 5,
        _lineStroke:() => "grey"
    }

    //API CALLBACKS
    let onClick = function(){};
    let onClickSectionLine = function(){};
    let onClickSectionContent = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};

    //next - put expand btn in bottom right -> when it is expanded, we can allow flipping the card, but not when not expanded? or flip is a two finger
    //gesture

    function pentagon(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;
        updateDimns();
        selection.each(function (sectionsData, i) {
            update.call(this, sectionsData);
        })

        function update(sectionsData){
            //console.log("pentagon", sectionsData)
            const containerG = d3.select(this);
            const sectionG = containerG.selectAll("g.section").data(sectionsData);
            sectionG.enter()
                .append("g")
                    .attr("class", "section")
                    .each(function(d,i){
                        const sectionG = d3.select(this);
                        sectionG.append("line").attr("class", "start show-with-section visible");
                        sectionG.append("line").attr("class", "inner show-with-section visible");
                        sectionG.append("line").attr("class", "outer visible");
                        /*sectionG.append("rect").attr("class", "outer-line-hitbox")
                            .attr("fill", "pink")
                            .attr("opacity", 0.3);*/
                        sectionG.append("line").attr("class", "outer-line-hitbox")
                            .attr("stroke","aqua")// "transparent")
                            .attr("opacity", 0.3);

                        const sectionContentsG = sectionG.append("g").attr("class", "section-contents show-with-section");
                        sectionContentsG
                            .append("text")
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")
                                .attr("font-size", "9px")
                                .attr("stroke-width", 0.1)
                                .attr("stroke", grey10(7))
                                .attr("fill", grey10(7));

                        sectionContentsG
                            .append("rect") //@todo 0 use a path to do it accurately
                                .attr("class", "contents-hitbox")
                                .attr("fill", "transparent")
                                .attr("opacity", 0.3)
                    })
                    .merge(sectionG)
                    .each(function(d,i){
                        const sectionG = d3.select(this);
                        //startLine
                        sectionG.select("line.start")
                            .transition("start-trans")
                            .delay(300)
                            .duration(200)
                                .attr("x1", innerVertices[i][0])
                                .attr("y1", innerVertices[i][1])
                                .attr("x2", outerVertices[i][0])
                                .attr("y2", outerVertices[i][1])

                        //inner line
                        //delay needed so when card swiped the lines dont transition too soon
                        const innerLine = sectionG.select("line.inner");
                        innerLine
                            .transition("inner-trans")
                            .delay(300)
                            .duration(200)
                                .attr("x1", innerVertices[i][0])
                                .attr("y1", innerVertices[i][1])
                                .attr("x2", innerVertices[i + 1] ? innerVertices[i+1][0] : innerVertices[0][0])
                                .attr("y2", innerVertices[i + 1] ? innerVertices[i+1][1] : innerVertices[0][1])

                        //outer line
                        const outerLine = sectionG.select("line.outer");
                        outerLine
                            .transition("outer-trans")
                            .delay(300)
                            .duration(200)
                                .attr("x1", outerVertices[i][0])
                                .attr("y1", outerVertices[i][1])
                                .attr("x2", outerVertices[i + 1] ? outerVertices[i+1][0] : outerVertices[0][0])
                                .attr("y2", outerVertices[i + 1] ? outerVertices[i+1][1] : outerVertices[0][1])

                        //outerLine hitbox
                        /*
                        @todo - use a rect
                        sectionG.select("rect.outer-line-hitbox")
                            .attr("x", outerVertices[i][0])
                            .attr("y", outerVertices[i][1])
                            .attr("width", outerVertices[i + 1] ? outerVertices[i+1][0] : outerVertices[0][0])
                            .attr("y2", outerVertices[i + 1] ? outerVertices[i+1][1] : outerVertices[0][1])*/

                        console.log("r2", r2)
                        sectionG.select("line.outer-line-hitbox")
                            .attr("x1", outerHitboxVertices[i][0])
                            .attr("y1", outerHitboxVertices[i][1])
                            .attr("x2", outerHitboxVertices[i + 1] ? outerHitboxVertices[i+1][0] : outerHitboxVertices[0][0])
                            .attr("y2", outerHitboxVertices[i + 1] ? outerHitboxVertices[i+1][1] : outerHitboxVertices[0][1])
                            .attr("stroke-width", hitlineStrokeWidth)
                            .attr("display", editable ? null : "none")
                            .on("click", onClickSectionLine)

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
                        const hitboxWidth = (r2-r1) * 0.4;
                        const hitboxHeight = d3.min([40, (r2-r1) * 0.3]);
                        const sectionContentsG = sectionG.select("g.section-contents")

                        sectionContentsG.select("rect.contents-hitbox")
                            .attr("x", -hitboxWidth/2)
                            .attr("y", -hitboxHeight/2)
                            .attr("width", hitboxWidth)
                            .attr("height", hitboxHeight)
                            .on("click", onClickSectionContent)


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
    return pentagon;
}
