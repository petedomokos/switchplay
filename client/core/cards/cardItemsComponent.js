import * as d3 from 'd3';
import { DIMNS, grey10, TRANSITIONS } from "./constants";
import pentagonComponent from './pentagonComponent';
import textComponent from './textComponent';
import { isNumber } from '../../data/dataHelpers';
import { fadeIn, remove } from '../journey/domHelpers';

/*

*/

export default function cardItemsComponent() {
    //API SETTINGS
    // dimensions
    let width = 250;
    let height = 350;
    let margin;
    let extraHorizMargin;
    let extraVertMargin;
    let contentsWidth;
    let contentsHeight;

    let extraShiftDownForAngleDiscrepancy;

    let itemWidth;
    let itemHeight;
    let innerRadius;
    let outerRadius;

    let listItemWidth;
    let listItemHeight;

    function updateDimns(){
        margin = { 
            left: width * 0.05, right:width * 0.05, 
            top:0,//height * (isNumber(selectedSectionNr) ? 0 : 0.05),
            bottom:0,//height * (isNumber(selectedSectionNr) ? 0.15 : 0.05)
        }
        const availContentsWidth = width - margin.left - margin.right;
        const availContentsHeight = height - margin.top - margin.bottom;
        const actualContentsLength = d3.min([availContentsWidth, availContentsHeight]);
        contentsWidth = isNumber(selectedSectionNr) ? availContentsWidth : actualContentsLength;
        contentsHeight = isNumber(selectedSectionNr) ? availContentsHeight : actualContentsLength; 
        extraHorizMargin = availContentsWidth - contentsWidth;
        extraVertMargin = availContentsHeight - contentsHeight;

        itemWidth = contentsWidth/4.5;
        itemHeight = itemWidth;
        const longestItemLength = d3.max([itemWidth, itemHeight]);
        innerRadius = 0;// (actualContentsLength/2 - longestItemLength/2) * (withSections ? 0.5 : 1);
        //radius is slightly linger than half contentsWidt, because the total length is nerve quite 2 * radius
        //due to angles
        outerRadius = contentsWidth * 0.53;
        onSetOuterRadius(outerRadius)
        //we need to shift down by theis extra 0.03 of contentsWidth to centre it. 
        extraShiftDownForAngleDiscrepancy = contentsWidth * 0.03;

        //list
        listItemWidth = contentsWidth;
        listItemHeight = contentsHeight;
    }

    let styles = {
        _lineStrokeWidth: () => 5,
        _lineStroke:() => "white"
    }

    let withSections = true;
    let withText = true;
    let editable = true;
    let proposedNewStatus;
    let statusTimer;
    let selectedItemNr;
    let selectedSectionNr;

    //API CALLBACKS
    let onSetOuterRadius = function(){};
    let onSelectItem = function(){};
    let onUpdateItemStatus = function(){};
    let onDragStart = function(){};
    let onDrag = function(){};
    let onDragEnd = function(){};

    //let onMouseover = function(){};
    //let onMouseout = function(){};

    const pentagon = pentagonComponent();
    const itemTitle = textComponent()
        .getText(it => it.title || "Enter Title...");
    /*

    */

    function cardItems(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;

        updateDimns();

        // expression elements
        selection.each(function (data, i) {
            if(d3.select(this).select("g.card-items-contents").empty()){
                init.call(this);
            }
            //update
            update.call(this, data);
        })

        function init(data){
            const contentsG = d3.select(this).append("g").attr("class", "card-items-contents");
            contentsG.append("rect").attr("class", "card-items-contents-bg")
                .attr("fill", "none")
                .attr("stroke", "none");
        }

        function update(data){
            const { } = data;

            const contentsG = d3.select(this).select("g.card-items-contents")
                .attr("transform", `translate(
                    ${margin.left + extraHorizMargin/2},
                    ${margin.top + extraVertMargin/2})`);

            contentsG.select("rect.card-items-contents-bg")
                .attr("width", contentsWidth)
                .attr("height", contentsHeight)

            const polygonCentreG = contentsG.selectAll("g.polygon-centre").data(contentsHeight < 40 ? [] : [1]);
            polygonCentreG.enter()
                .append("g")
                    .attr("class", "polygon-centre")
                    .call(fadeIn)
                    .each(function(){
                        const polygonCentreG = d3.select(this);

                    })
                    .merge(polygonCentreG)
                    .each(function(){
                        const polygonCentreG = d3.select(this);
                        let newStatus;
                        polygonCentreG
                            .attr("transform", `translate(${contentsWidth/2},${contentsHeight/2 + extraShiftDownForAngleDiscrepancy})`)
                            .datum(data)
                            .call(pentagon
                                .r1(innerRadius)
                                .r2(outerRadius)
                                .withSections(withSections)
                                .withText(withText && !isNumber(selectedItemNr))
                                .editable(editable)
                                .styles(styles)
                                .onClick(function(e,d){
                                    if(!editable){ return; }
                                    onSelectItem(d);
                                })
                                .onLongpressStart(function(e,d){
                                    if(!editable){ return; }
                                    //d3.select(this).raise();
                                    const changeStatus = (prevStatus) => {
                                        newStatus = (prevStatus + 1) % 3;
                                        const newD = { ...d, status: newStatus }
                                        //update stroke

                                        d3.select(this).selectAll("line.visible")
                                            .attr("stroke-width", styles._lineStrokeWidth(newD))
                                            .attr("stroke", styles._lineStroke(newD))
                                    }
                                    changeStatus(d.status);
                                    statusTimer = d3.interval(() => {
                                        changeStatus(newStatus);
                                    }, 600)
                                })
                                .onLongpressEnd(function(e,d){
                                    if(!editable){ return; }
                                    statusTimer.stop();
                                    onUpdateItemStatus(d.itemNr, newStatus);
                                })
                                .onDrag(onDrag));
                                    
                    })

            polygonCentreG.exit().call(remove, { transition:{ duration:TRANSITIONS.FAST }});

            const listG = contentsG.selectAll("g.list").data(contentsHeight < 40 ? [1] : []);
            listG.enter()
                .append("g")
                    .attr("class", "list")
                    .call(fadeIn)
                    .each(function(){
                        const listG = d3.select(this);
                    })
                    .merge(listG)
                    .each(function(){
                        //need to decide whether to do enter-exit here or in textComp
                        const listG = d3.select(this);
                        const itemG = listG.selectAll("g.item").data(data, it => it.itemNr);
                        itemG.enter()
                            .append("g")
                                .attr("class", "item")
                                .each(function(){ 
                                    d3.select(this).append("rect").attr("fill", "transparent") 
                                })
                                .merge(itemG)
                                .attr("transform", (d,i) => `translate(0, ${i * listItemHeight})`)
                                .each(function(){
                                    d3.select(this).select("rect")
                                        .attr("width", listItemWidth)
                                        .attr("height", listItemHeight)
                                })
                                .call(itemTitle
                                    .width(listItemWidth)
                                    .height(listItemHeight)
                                    .withAttachments(false)
                                    .styles((d,i) => ({
                                        text:{
                                            opacity:d.title ? 1 : 0.5,
                                            stroke:grey10(2),
                                            strokeWidth:0.05,
                                            fill:grey10(2),
                                            fontMin:1,
                                            fontMax:5,
                                            fontSize:3
                                        }
                                    }))
                                )
                                .on("click", function(e,d){
                                    if(!editable){ return; }
                                    onSelectItem(d);
                                })

                        
                    })

            listG.exit().call(remove, { transition:{ duration:TRANSITIONS.FAST }});
        }

        return selection;
    }
    
    //api
    cardItems.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return cardItems;
    };
    cardItems.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return cardItems;
    };
    cardItems.styles = function (obj) {
        if (!arguments.length) { return styles; }
        styles = {
            ...styles,
            ...obj,
        };
        return cardItems;
    };
    cardItems.withSections = function (value) {
        if (!arguments.length) { return withSections; }
        withSections = value;
        return cardItems;
    };
    cardItems.withText = function (value) {
        if (!arguments.length) { return withText; }
        withText = value;
        return cardItems;
    };
    cardItems.selectedItemNr = function (value) {
        if (!arguments.length) { return selectedItemNr; }
        selectedItemNr = value;
        return cardItems;
    };
    cardItems.selectedSectionNr = function (value) {
        if (!arguments.length) { return selectedSectionNr; }
        selectedSectionNr = value;
        pentagon.selectedSectionNr(value);
        return cardItems;
    };
    cardItems.editable = function (value) {
        if (!arguments.length) { return editable; }
        editable = value;
        return cardItems;
    };
    cardItems.onSetOuterRadius = function (value) {
        if (!arguments.length) { return onSetOuterRadius; }
        onSetOuterRadius = value;
        return cardItems;
    };
    cardItems.onSelectItem = function (value) {
        if (!arguments.length) { return onSelectItem; }
        onSelectItem = value;
        return cardItems;
    };
    cardItems.onUpdateItemStatus = function (value) {
        if (!arguments.length) { return onUpdateItemStatus; }
        onUpdateItemStatus = value;
        return cardItems;
    };
    cardItems.onDragStart = function (value) {
        if (!arguments.length) { return onDragStart; }
        onDragStart = value;
        return cardItems;
    };
    cardItems.onDrag = function (value) {
        if (!arguments.length) { return onDrag; }
        onDrag = value;
        return cardItems;
    };
    cardItems.onDragEnd = function (value) {
        if (!arguments.length) { return onDragEnd; }
        onDragEnd = value;
        return cardItems;
    };
    /*
    cardItems.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return cardItems;
    };
    cardItems.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return cardItems;
    };
    */
    return cardItems;
}
