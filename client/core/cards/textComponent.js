import * as d3 from 'd3';
import { DIMNS, grey10, OVERLAY, COLOURS, TRANSITIONS } from "./constants";
import { trophy } from "../../../assets/icons/milestoneIcons.js"
import { toRadians } from '../journey/screenGeometryHelpers';
import dragEnhancements from '../journey/enhancedDragHandler';
import { TextBox } from "d3plus-text";
import { grey } from '@material-ui/core/colors';
import { isNumber } from '../../data/dataHelpers';
import { fadeIn, remove } from '../journey/domHelpers';

const { GOLD } = COLOURS;

const videoIconD = "M85.527,80.647c2.748,0,4.973-2.225,4.973-4.974V24.327c0-2.749-2.225-4.974-4.973-4.974H14.474c-2.748,0-4.974,2.225-4.974,4.974v51.346c0,2.749,2.225,4.974,4.974,4.974H85.527z M80.553,70.699H19.446V29.301h61.107V70.699z"
const videoIconPolygonPoints = "64.819,50.288 52.839,57.201 40.865,64.118 40.865,50.288 40.865,36.462 52.839,43.38"
/*

*/
export default function textComponent() {
    //API SETTINGS
    let width = 100;
    let height = 50;
    let margin = { left: 0, right: 0, top:0, bottom:0 }
    let contentsWidth;
    let contentsHeight;

    let text = d => typeof d === "string" ? d : (d.text || d.title || d.name);
    let editable = true;
    let withAttachments = true;
    
    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
    }

    let DEFAULT_STYLES = {
        fill:"white",
        stroke:"white",
        strokeWidth:0.1,
        opacity:1,
        placeholderFill:"white",
        placeholderStroke:"white",
        placeholderStrokeWidth:0.05,
        placeholderOpacity:0.4,
        fontMin:1,
        fontMax:5,
        fontSize:3,
        fontFamily:"arial",
        fontStyle:"normal",
    }
    let _styles = () => DEFAULT_STYLES;

    let placeholder = () => "";

    //API CALLBACKS
    let onClick = function(){};
    let onLongpressStart = function(){};
    let onLongpressEnd = function(){};
    let onDragStart = function(){};
    let onDrag = function(){};
    let onDragEnd = function(){};
    //let onMouseover = function(){};
    //let onMouseout = function(){};

    const drag = d3.drag()
    let enhancedDrag = dragEnhancements();
    let textboxes = {};

    function myText(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;
        updateDimns();
        enhancedDrag
            .dragThreshold(100)
            .onLongpressStart(onLongpressStart)
            .onLongpressEnd(onLongpressEnd);

        drag
            .on("start", enhancedDrag(onDragStart))
            .on("drag", enhancedDrag(onDrag))
            .on("end", enhancedDrag(onDragEnd))


        selection.each(function (d, i) {
            
            if(d3.select(this).select("text").empty()){
                init.call(this, d, i)
            }
            update.call(this, d, i);
        })
        .call(drag)
        .on("click", onClick)

        function init(d, i){
            const contentsG = d3.select(this).append("g").attr("class", "contents");
            textboxes[i] = new TextBox()
                .select(contentsG.node());
        }

        function update(d, i){
            const { title, attachments } = d;
            const containerG = d3.select(this);
            const styles =  _styles(d,i);

            const hasAttachments = false;// attachments.length > 0;
            const maxNrLines = hasAttachments ? 3 : 4;
            const textLineHeight = contentsHeight * 0.25;
            const textAreaMaxHeight = maxNrLines * textLineHeight;
            /*
            const attachmentsAreaHeight = itemAreaHeight - textAreaMaxHeight;

            const attachmentWidth = 4;
            const attachmentHeight = attachmentsAreaHeight;
            const attachmentMargin = { 
                left:0, right:attachmentWidth * 0.2, 
                top:attachmentHeight * 0.1, bottom: attachmentHeight * 0.1 
            }
            const attachmentContentsWidth = attachmentWidth - attachmentMargin.left - attachmentMargin.right;
            const attachmentContentsHeight = attachmentHeight - attachmentMargin.top - attachmentMargin.bottom;
            */

            //bg
            const contentsG = d3.select(this).select("g.contents")
                .attr("transform", `translate(${margin.left},${margin.top})`);
            contentsG.select("rect")
                .attr("width", contentsWidth)
                .attr("height", contentsHeight)
            //text
            const textData = [{
                "width": contentsWidth,
                "height": 40,// textAreaMaxHeight,
                "text": text(d,i) || placeholder(d,i)
            }];

            const placeholderUsed = !text(d,i);
                       
            //text
            textboxes[i]
                .data(textData)
                .maxLines(maxNrLines)
                .fontSize(styles.fontSize)
                .fontMin(styles.fontMin)
                .fontMax(styles.fontMax)
                .fontFamily(styles.fontFamily)
                .verticalAlign(styles.verticalAlign || "middle")
                .overflow(styles.overflow || "visible")
                    .render();

            contentsG.selectAll("text")
            //next --am trying to turn off pointer-evetns for all sections except the selected one,
            //and if no selected then turn on for all.
            //but something is still picking up the click

            //afer, we can then turn it off for cardHeader too, and then juts have the g.card itself have a click handler that
            //simply resets clickedItemNr to null, so first click outside of status will simply remove the status menu.
                .style("pointer-events", "none")
                .style("fill", placeholderUsed ? styles.placeholderFill : styles.fill)
                .style("stroke", placeholderUsed ? styles.placeholderStroke : styles.stroke)
                .style("stroke-width", placeholderUsed ? styles.placeholderStrokeWidth : styles.strokeWidth)
                .style("opacity", placeholderUsed ? styles.placeholderOpacity : styles.opacity)
                .style("font-style", styles.fontStyle)     


            //@todo - attachments
            //first we need to know how many lines of text there are so we can shoft attachments up if necc
            /*
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
            */

            /*
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

            }*/

        }

        return selection;
    }
    
    //api
    myText.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return myText;
    };
    myText.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return myText;
    };
    myText.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = value;
        return myText;
    };
    myText.text = function (value) {
        if (!arguments.length) { return text; }
        if(typeof value === "function"){
            text = value;
        }else{
            text = () => value;
        }
        return myText;
    };
    myText.placeholder = function (value) {
        if (!arguments.length) { return placeholder; }
        if(typeof value === "function"){
            placeholder = value;
        }else{
            placeholder = () => value;
        }
        return myText;
    };
    myText.editable = function (value) {
        if (!arguments.length) { return editable; }
        editable = value;
        return myText;
    };
    myText.withAttachments = function (value) {
        if (!arguments.length) { return withAttachments; }
        withAttachments = value;
        return myText;
    };
    myText.styles = function (value) {
        if (!arguments.length) { return _styles; }
        if(typeof value === "function"){
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value(d,i) });
        }else{
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value });
        }
        return myText;
    };
    myText.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return myText;
    };
    myText.onLongpressStart = function (value) {
        if (!arguments.length) { return onLongpressStart; }
        onLongpressStart = value;
        return myText;
    };
    myText.onLongpressEnd = function (value) {
        if (!arguments.length) { return onLongpressEnd; }
        onLongpressEnd = value;
        return myText;
    };
    myText.onDragStart = function (value) {
        if (!arguments.length) { return onDragStart; }
        onDragStart = value;
        return myText;
    };
    myText.onDrag = function (value) {
        if (!arguments.length) { return onDrag; }
        onDrag = value;
        return myText;
    };
    myText.onDragEnd = function (value) {
        if (!arguments.length) { return onDragEnd; }
        onDragEnd = value;
        return myText;
    };
    return myText;
}