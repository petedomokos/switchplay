import * as d3 from 'd3';
import { DIMNS, FONTSIZES, STYLES, grey10, OVERLAY, COLOURS, TRANSITIONS } from "./constants";
import { trophy } from "../../../assets/icons/milestoneIcons.js"
import { toRadians, posFromCentre } from '../journey/screenGeometryHelpers';
import dragEnhancements from '../journey/enhancedDragHandler';
import { TextBox } from "d3plus-text";
import { grey } from '@material-ui/core/colors';
import { isNumber } from '../../data/dataHelpers';

const { GOLD } = COLOURS;

const NR_SECTIONS = 5;

const videoIconD = "M85.527,80.647c2.748,0,4.973-2.225,4.973-4.974V24.327c0-2.749-2.225-4.974-4.973-4.974H14.474c-2.748,0-4.974,2.225-4.974,4.974v51.346c0,2.749,2.225,4.974,4.974,4.974H85.527z M80.553,70.699H19.446V29.301h61.107V70.699z"
const videoIconPolygonPoints = "64.819,50.288 52.839,57.201 40.865,64.118 40.865,50.288 40.865,36.462 52.839,43.38"
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
    let withSectionLabels = true;
    let withText = true;
    let editable = true;
    let selectedSectionKey;

    let innerVertices;
    let outerVertices;
    //let outerHitboxVertices;
    let segmentVertices;
    let hitlineStrokeWidth;

    let shouldTruncate;

    let prevR2 = 0; //can say it starts at 0 as it doesnt exist at that point
    
    
    function updateDimns(){
        const anglePerSection = 360 / NR_SECTIONS;
        hitlineStrokeWidth = r2 * 0.45;
        innerVertices = pentagonVertices({ r:r1, theta:i => i * anglePerSection });
        outerVertices = pentagonVertices({ r:r2, theta:i => i * anglePerSection });
        //outerHitboxVertices = pentagonVertices({ r:r2+hitlineStrokeWidth/2, theta:i => i * anglePerSection });
        segmentVertices = pentagonVertices({ r:r1 + (r2 - r1)/2, theta:i => (i + 0.5) * anglePerSection });

        shouldTruncate = r2 - r1 < 100;
    }

    let styles = {
        _polygonLineStrokeWidth:() => 5,
        _itemStroke:() => "grey"
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
    let textboxes = {};

    function pentagon(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;
        updateDimns();
        selection.each(function (itemsData, i) {
            update.call(this, itemsData);
        })

        function update(itemsData){

            //drag
            enhancedDrag
                .dragThreshold(100)
                .onLongpressStart(onLongpressStart)
                .onLongpressEnd(onLongpressEnd);

            const drag = d3.drag()
                .on("start", enhancedDrag(onDragStart))
                .on("drag", enhancedDrag(onDrag))
                .on("end", enhancedDrag(onDragEnd))

            const containerG = d3.select(this);
            const sectionG = containerG.selectAll("g.section").data(itemsData, s => s.key);
            sectionG.enter()
                .append("g")
                    //section is identified in the dom by its itemNr ie it pos in the polygon
                    //notice, we get this from thr secitn object, which allows user to reassign an item from a 
                    //different pos in the polygon (ie a different itemNr) to another section
                    .attr("class", d => `section section-${d.section?.itemNr}`)
                    .attr("display", d => !selectedSectionKey || selectedSectionKey === d.section?.key ? null : "none")
                    .each(function(d,i){
                        const sectionG = d3.select(this);
                        sectionG.append("path").attr("class", "section-bg").attr("fill", "transparent");
                        sectionG.append("line").attr("class", "start show-with-section visible");
                        sectionG.append("line").attr("class", "finish show-with-section visible")
                            //.attr("opacity", 1)
                            //.attr("display", "none");

                        sectionG.append("line").attr("class", "inner show-with-section visible");
                        sectionG.append("line").attr("class", "outer visible");
                        //sectionG.append("line").attr("class", "outer-line-hitbox")
                            //.style("stroke", "transparent");

                        const sectionContentsG = sectionG.append("g").attr("class", "section-contents show-with-section");
                        const itemContentsG = sectionContentsG.append("g").attr("class", "item-contents")
                            .style("opacity", withText ? 1 : 0)
                            
                        sectionG.append("path").attr("class", "section-hitbox")
                            .attr("fill", "transparent")
                            .on("click", onClick);

                        itemContentsG
                            .append("rect")
                                //.attr("fill","white")
                                .attr("fill","transparent");

                        textboxes[i] = new TextBox()
                            .select(itemContentsG.node())
                            .fontSize(2)
                            .fontMin(1)
                            .fontMax(12)
                            .verticalAlign("middle")
                            .overflow("visible");

                        sectionG.append("g").attr("section-identifier")

                    })
                    //WARNING: drag is before merge so it doesnt get broken when a longpress causes an update
                    //if it breaks, the enhancedDH will trigger onClick because isLongpress is reset to false
                    //it still seems to be reset here, but is not reappended - this may cause a problem
                    //with the d that is sent through notbeing the latest)
                    //if so, could put it back bekow merge so it updates, but find another way to prevent 
                    //click if its been longpressed. eg store an isLongpress here in outer scope
                    .call(drag)
                    .merge(sectionG)
                    .attr("display", d => !selectedSectionKey || selectedSectionKey === d.section?.key ? null : "none")
                    .style("pointer-events", editable ? null : "none")
                    .each(function(d,i){
                        const { deckId, cardNr, itemNr, title, section } = d;
                        //ensure any items with titles are above those without
                        if(title){ d3.select(this).raise(); }
                        //for now, we fake a video attachment using a special item name
                        const includesVideo = title.includes("Video") || title.includes("video");
                        const attachments = includesVideo ? [{ key:"att-1", type: "video" }] : [];
                        //if a title is set, this means the item exists as a defined task or target
                        const itemIsDefined = !!title;
                        //console.log("d", d)
                        const key = `deck-${deckId}-card-${cardNr}-item-${itemNr}`;
                        //segement points start from centre (a) clockwise around the quadrilateral
                        const ax = innerVertices[i][0];
                        const ay = innerVertices[i][1];
                        const bx = outerVertices[i][0];
                        const by = outerVertices[i][1];
                        const cx = outerVertices[i + 1] ? outerVertices[i+1][0] : outerVertices[0][0];
                        const cy = outerVertices[i + 1] ? outerVertices[i+1][1] : outerVertices[0][1];
                        const dx = innerVertices[i + 1] ? innerVertices[i+1][0] : innerVertices[0][0];
                        const dy = innerVertices[i + 1] ? innerVertices[i+1][1] : innerVertices[0][1];

                        const sizeIsIncreasing = r2 - prevR2 > 0;
                        const sectionG = d3.select(this);
                        //startLine
                        sectionG.select("line.start")
                            .transition("start-trans")
                            .delay(sizeIsIncreasing ? 300 : 0)
                            .duration(TRANSITIONS.MED)
                                .attr("x1", ax)
                                .attr("y1", ay)
                                .attr("x2", bx)
                                .attr("y2", by)

                        //finishLine
                        //@todo - include this when a section is clicked, or longpressed
                        sectionG.select("line.finish")
                            .transition("finish-trans")
                            .delay(sizeIsIncreasing ? 300 : 0)
                            .duration(TRANSITIONS.MED)
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
                            .delay(sizeIsIncreasing ? 300 : 0)
                            .duration(TRANSITIONS.MED)
                                .attr("x1", ax)
                                .attr("y1", ay)
                                .attr("x2", dx)
                                .attr("y2", dy)

                        //outer line
                        const outerLine = sectionG.select("line.outer");
                        outerLine
                            .transition("outer-trans")
                            .delay(sizeIsIncreasing ? 300 : 0)
                            .duration(TRANSITIONS.MED)
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

                        sectionG.select("path.section-bg")
                            .attr("d", `M${ax},${ay} L${bx},${by} L${cx},${cy} L${dx},${dy}`);

                        sectionG.select("path.section-hitbox")
                            .attr("d", `M${ax},${ay} L${bx},${by} L${cx},${cy} L${dx},${dy}`);

                        //all lines
                        sectionG.selectAll("line.visible")
                            .transition("trans-stroke")
                            .delay(sizeIsIncreasing ? 300 : 0)
                            .duration(TRANSITIONS.MED)
                                .attr("stroke", styles._itemStroke(d,i))
                                .attr("stroke-width", styles._polygonLineStrokeWidth(d,i))

                        sectionG.selectAll(".show-with-section")
                            .attr("pointer-events", withSections ? null : "none")
                            .transition("outer-trans")
                            .delay(sizeIsIncreasing ? 300 : 0)
                            .duration(TRANSITIONS.MED)
                                .attr("opacity", withSections ? 1 : 0)


                        //text
                        const _itemAreaWidth = () => {
                            if(i === 0){ return r2 * 0.45 }
                            if(i === 4){ return r2 * 0.45 }
                            //middle 2
                            if(i === 1) { return r2 * 0.5; }
                            if(i === 3) { return r2 * 0.5; }
                            //bottom 1
                            if(i === 2) { return r2 * 0.5; }
                        }
                        const _textAreaHeight = () => {
                            if(i === 0){ return r2 * 0.4 }
                            if(i === 4){ return r2 * 0.4 }
                            //middle 2
                            if(i === 1) { return r2 * 0.35; }
                            if(i === 3) { return r2 * 0.35; }
                            //bottom 1
                            if(i === 2) { return r2 * 0.4; }
                        }

                        const hasAttachments = attachments.length > 0;
                        const maxNrLines = hasAttachments ? 3 : 4;
                        const itemAreaWidth = _itemAreaWidth();
                        const itemAreaHeight = _textAreaHeight();
                        const textLineHeight = itemAreaHeight * 0.25;

                        const textAreaMaxHeight = maxNrLines * textLineHeight;
                        const attachmentsAreaHeight = itemAreaHeight - textAreaMaxHeight;

                        const attachmentWidth = 4;
                        const attachmentHeight = attachmentsAreaHeight;
                        const attachmentMargin = { 
                            left:0, right:attachmentWidth * 0.2, 
                            top:attachmentHeight * 0.1, bottom: attachmentHeight * 0.1 
                        }
                        const attachmentContentsWidth = attachmentWidth - attachmentMargin.left - attachmentMargin.right;
                        const attachmentContentsHeight = attachmentHeight - attachmentMargin.top - attachmentMargin.bottom;

                        const xShift = () => {
                            //top 2
                            if(i === 0){ return itemAreaWidth * 0 }
                            if(i === 4){ return -itemAreaWidth * 0 }
                            //middle 2
                            if(i === 1) { return 0; }
                            if(i === 3) { return 0; }
                            //bottom 1
                            if(i === 2) { return 0; }

                        }
                        const yShift = () => {
                            //top 2
                            if(i === 0){ return 0 }
                            if(i === 4){ return 0 }
                            //middle 2
                            if(i === 1) { return -textAreaMaxHeight * 0.12; }
                            if(i === 3) { return -textAreaMaxHeight * 0.12; }
                            //bottom 1
                            if(i === 2) { return textAreaMaxHeight * 0.2; }

                        }

                        const transX = () => segmentVertices[i][0] - itemAreaWidth * 0.5 + xShift();
                        const transY = () => segmentVertices[i][1] - itemAreaHeight * 0.5 + yShift();

                        //contents
                        const sectionContentsG = sectionG.select("g.section-contents");
                        const itemContentsG = sectionContentsG.select("g.item-contents");
                        sectionContentsG
                            .transition()
                            //.delay(sizeIsIncreasing ? 300 : 0)
                            .duration(TRANSITIONS.MED)
                                //.attr("transform", `translate(${segmentVertices[i][0]}, ${segmentVertices[i][1]})`)
                                .attr("transform", `translate(${transX()}, ${transY()})`)

                        //bg
                        itemContentsG.select("rect")
                            .attr("width", itemAreaWidth)
                            .attr("height", itemAreaHeight)
                        //text
                        const textData = [{
                            "width": itemAreaWidth,
                            "height": textAreaMaxHeight,
                            "text": title || `Enter Item ${d.itemNr}` 
                          }];

                        //show or hide text based on deck status
                        itemContentsG.selectAll("text")
                            .attr("display", withText ? null : "none")

                        itemContentsG
                            .transition(`text-${key}`)
                            .duration(TRANSITIONS.FAST)
                                .style("opacity", withText ? 1 : 0)
                       
                        if(withText){
                            //we put a fake delay on rendering so it doesnt clash with zooming transitions,
                            //as for some reason it stops the zooming happening smoothly
                            setTimeout(() => {
                                //text
                                textboxes[i]
                                        .data(textData)
                                        .maxLines(maxNrLines)
                                        .render();

                                    itemContentsG.selectAll("text")
                                        .style("fill", grey10(6))
                                        .style("stroke", grey10(6))
                                        .style("stroke-width", 0.1)
                                        .style("opacity", itemIsDefined ? 1 : 0.5);          

                                //attachments
                                //first we need to know how many lines of text there are so we can shoft attachments up if necc
                                const actualNrLines = itemContentsG.selectAll("text").nodes().length;
                                const textAreaActualHeight = () => {
                                    if(actualNrLines === 1){
                                        return 1.9 * textLineHeight;
                                    }
                                    if(actualNrLines === 2){
                                        return 2.5 * textLineHeight;
                                    }
                                    if(actualNrLines === 3){
                                        return 2.8 * textLineHeight;
                                    }
                                }

                                const attachmentsG = sectionContentsG.selectAll("g.item-attachments").data(hasAttachments ? [1] : []);
                                attachmentsG.enter()
                                    .append("g")
                                        .attr("class", "item-attachments")
                                        .attr("pointer-events", "none")
                                        .each(function(){
                                            d3.select(this).append("rect").attr("fill", "none")
                                        })
                                        .merge(attachmentsG)
                                        .attr("transform", `translate(0,${textAreaActualHeight()})`)
                                        .each(function(){
                                            d3.select(this).select("rect")
                                                .attr("width", itemAreaWidth)
                                                .attr("height", attachmentsAreaHeight)

                                            const attachmentG = d3.select(this).selectAll("g.attachment").data(attachments, d => d.type);
                                            attachmentG.enter()
                                                .append("g")
                                                    .attr("class", "attachment")
                                                    .each(function(d){
                                                        const contentsG = d3.select(this).append("g")
                                                        contentsG.append("rect")
                                                            .attr("fill", "transparent")

                                                        const iconG = contentsG.append("g").attr("class", "icon");
                                                        
                                                        if(d.type === "video"){
                                                            iconG.append("path")
                                                                .attr("d", videoIconD)
                                                                .attr("fill", grey10(7))

                                                            iconG.append("polygon")
                                                                .attr("points", videoIconPolygonPoints)
                                                                .attr("fill", grey10(7))
                                                        }
                                                    })
                                                    .merge(attachmentG)
                                                    .attr("transform", (d,i) => `translate(${i * attachmentWidth},0)`)
                                                    .each(function(d){
                                                        const contentsG = d3.select(this).select("g")
                                                            .attr("transform", (d,i) => `translate(${attachmentMargin.left}, ${attachmentMargin.top})`)
                                                        contentsG.select("rect")
                                                            .attr("width", attachmentContentsWidth)
                                                            .attr("height", attachmentContentsHeight)

                                                        contentsG.select("g.icon").attr("transform", "scale(0.03) translate(0, -15)")
                                                    })

                                            attachmentG.exit().remove();

                                        })

                                attachmentsG.exit().remove();

                            }, 0)
                        }

                        //section initial/icon;
                        const sectionDatum = section || {};
                        const sectionIdentifierG = sectionG.selectAll("g.section-identifier").data(withSectionLabels ? [sectionDatum] : [])

                        sectionIdentifierG.enter()
                            .append("g")
                                .attr("class", "section-identifier")
                                .attr("pointer-events", "none")
                                .each(function(){
                                    const idG = d3.select(this);
                                    idG.append("text").attr("class", "initials section-identifier section-identifier-initials")
                                        .attr("text-anchor", "middle")
                                        .attr("dominant-baseline", "central")
                                        .attr("stroke-width", 0.05)
                                        //.attr("stroke", COLOURS.CARD.SECTION_ID)
                                        .attr("fill", COLOURS.CARD.SECTION_ID)
                                        .attr("opacity", STYLES.SECTION_ID_OPACITY)
                                        .attr("font-size", FONTSIZES.SECTION_ID)
                                })
                                .merge(sectionIdentifierG)
                                .attr("transform", () => {
                                    //i is the section index
                                    const theta = (i + 0.5) * (360/NR_SECTIONS);
                                    const { x, y } = posFromCentre(theta, r2 * 0.95)
                                    return `translate(${x},${y})`
                                })
                                .each(function(d){
                                    const idG = d3.select(this);
                                    idG.select("text.initials")
                                        .text(d.initials || d?.title?.slice(0,2) || `S${itemNr}`)

                                })

                        sectionIdentifierG.exit().remove();

                           
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
        prevR2 = r2;
        r2 = value;
        return pentagon;
    };
    pentagon.withSections = function (value) {
        if (!arguments.length) { return withSections; }
        withSections = value;
        return pentagon;
    };
    pentagon.withSectionLabels = function (value) {
        if (!arguments.length) { return withSectionLabels; }
        withSectionLabels = value;
        return pentagon;
    };
    pentagon.withText = function (value) {
        if (!arguments.length) { return withText; }
        withText = value;
        return pentagon;
    };
    pentagon.editable = function (value) {
        if (!arguments.length) { return editable; }
        editable = value;
        return pentagon;
    };
    pentagon.selectedSectionKey = function (value) {
        if (!arguments.length) { return selectedSectionKey; }
        selectedSectionKey = value;
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
