import * as d3 from 'd3';
import { DIMNS, grey10 } from "./constants";
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
;    //API CALLBACKS
    let onClickItem = function(){};
    let onClickLine = function(){};
    let onDblClick = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};

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
            const { } = data;

            const contentsG = d3.select(this).select("g.card-items-contents")
                .attr("transform", `translate(${margin.left + extraHorizMargin/2},${margin.top + extraVertMargin/2})`);

            contentsG.select("rect.card-items-contents-bg")
                .attr("width", contentsWidth)
                .attr("height", contentsHeight)
                .attr("fill","yellow")// "none")

            contentsG.select("g.centre")
                .attr("transform", `translate(${contentsWidth/2},${contentsHeight/2})`)
                .datum(data)
                .call(pentagon
                    .r1(innerRadius)
                    .r2(outerRadius)
                    .withSections(withSections)
                    .styles(styles)
                    .onClickSectionLine(onClickLine)
                    .onClickSectionContent(onClickItem));
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
    cardItems.onClickItem = function (value) {
        if (!arguments.length) { return onClickItem; }
        onClickItem = value;
        return cardItems;
    };
    cardItems.onClickLine = function (value) {
        if (!arguments.length) { return onClickLine; }
        onClickLine = value;
        return cardItems;
    };
    cardItems.onDblClick = function (value) {
        if (!arguments.length) { return onDblClick; }
        onDblClick = value;
        return cardItems;
    };
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
    return cardItems;
}
