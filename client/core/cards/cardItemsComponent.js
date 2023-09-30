import * as d3 from 'd3';
import { DIMNS, grey10, TRANSITIONS } from "./constants";
import pentagonComponent from './pentagonComponent';

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

    let itemWidth;
    let itemHeight;
    let innerRadius;
    let outerRadius;

    function updateDimns(){
        margin = { left: width * 0.05, right:width * 0.05, top:height * 0.1, bottom:height * 0.1 }
        const availContentsWidth = width - margin.left - margin.right;
        const availContentsHeight = height - margin.top - margin.bottom;
        const actualContentsLength = d3.min([availContentsWidth, availContentsHeight]);
        contentsWidth = actualContentsLength;
        contentsHeight = actualContentsLength; 
        extraHorizMargin = availContentsWidth - contentsWidth;
        extraVertMargin = availContentsHeight - contentsHeight;

        itemWidth = contentsWidth/4.5;
        itemHeight = itemWidth;
        const longestItemLength = d3.max([itemWidth, itemHeight]);
        innerRadius = 0;// (actualContentsLength/2 - longestItemLength/2) * (withSections ? 0.5 : 1);
        outerRadius = contentsWidth/2;
    }

    let styles = {
        _lineStrokeWidth: () => 5,
        _lineStroke:() => "white"
    }

    let withSections = true;
    let editable = true;
    let proposedNewStatus;
    let statusTimer;

;    //API CALLBACKS
    let onSelectItem = function(){};
    let onUpdateItemStatus = function(){};
    let onDragStart = function(){};
    let onDrag = function(){};
    let onDragEnd = function(){};

    //let onMouseover = function(){};
    //let onMouseout = function(){};

    const pentagon = pentagonComponent();
    /*

    */

    function cardItems(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;

        updateDimns();

        // expression elements
        selection.each(function (data, i) {
            if(d3.select(this).select("g.centre").empty()){
                init.call(this);
            }
            //update
            update.call(this, data);
        })

        function init(data){
            const contentsG = d3.select(this).append("g").attr("class", "card-items-contents");
            contentsG.append("rect").attr("class", "card-items-contents-bg")
                .attr("fill", "none");
            contentsG.append("g").attr("class", "centre");
        }

        function update(data){
            //console.log("cardItems", data)
            const { } = data;

            const contentsG = d3.select(this).select("g.card-items-contents")
                .attr("transform", `translate(${margin.left + extraHorizMargin/2},${margin.top + extraVertMargin/2})`);

            contentsG.select("rect.card-items-contents-bg")
                .attr("width", contentsWidth)
                .attr("height", contentsHeight)
                .attr("fill", "none")

            let newStatus;
            contentsG.select("g.centre")
                .attr("transform", `translate(${contentsWidth/2},${contentsHeight/2})`)
                .datum(data)
                .call(pentagon
                    .r1(innerRadius)
                    .r2(outerRadius)
                    .withSections(withSections)
                    .editable(editable)
                    .styles(styles)
                    .onClick(function(e,d){
                        if(!editable){ return; }
                        onSelectItem(d);
                    })
                    .onLongpressStart(function(e,d){
                        if(!editable){ return; }
                        //console.log("this", this)
                        //d3.select(this).raise();
                        const changeStatus = (prevStatus) => {
                            newStatus = (prevStatus + 1) % 3;
                            const newD = { ...d, status: newStatus }
                            //update stroke

                            d3.select(this).selectAll("line.visible")
                                .attr("stroke-width", styles._lineStrokeWidth(newD))
                                .attr("stroke", styles._lineStroke(newD))

                            /*const finishLineStroke = newStatus === 0 ? 0 : (newStatus === 1 ? 4.5 : 5.5)
                            //first, show the 4th line (finish line)
                            d3.select(this).select("line.finish")
                                .attr("display", null)
                                .attr("opacity", 1)
                                .attr("stroke-width", finishLineStroke)*/
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
    cardItems.editable = function (value) {
        if (!arguments.length) { return editable; }
        editable = value;
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
