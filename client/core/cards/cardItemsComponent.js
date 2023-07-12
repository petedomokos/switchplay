import * as d3 from 'd3';
import { DIMNS, grey10 } from "./constants";
//import dragEnhancements from '../journey/enhancedDragHandler';
import { toRadians } from '../journey/screenGeometryHelpers';

/*

*/
//helper
//always returns vertices s.t. first vertex angle from North is 0.
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
    let radius;

    function updateDimns(){
        margin = { left: width * 0.1, right:width * 0.1, top:height * 0.1, bottom:height * 0.1 }
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
        radius = (actualContentsLength/2 - longestItemLength/2) * (withLabels ? 0.5 : 1);
    }

    let styles = {
        lineStrokeWidth:5,
        _lineStroke:() => "white"
    }

    let withLabels = true;
;    //API CALLBACKS
    let onClickItem = function(){};
    let onClickLine = function(){};
    let onDblClick = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};

    /*

    */

    function cardItems(selection, options={}) {
        //console.log("profileinfo", height)
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
                .attr("fill", "none")

            const centreG = contentsG.select("g.centre")
                .attr("transform", `translate(${contentsWidth/2},${contentsHeight/2})`);

            const vertices = pentagonVertices({ 
                r:radius,
                theta:i => i * 72
            });
            const itemContentVertices = pentagonVertices({ 
                r:radius + contentsWidth * 0.2,// 35, 
                theta:i => (i + 0.5) * 72
            })

            /*const itemG = centreG.selectAll("g.card-item").data(data);
            itemG.enter()
                .append("g")
                    .attr("class", "card-item")
                    .each(function(d,i){
                        const itemG = d3.select(this);
                        itemG.append("rect")
                            .attr("class", "card-item-bg")
                            .attr("fill", grey10(2))
                            .attr("rx", 6)
                            .attr("ry", 6);

                    })
                    .merge(itemG)
                    .attr("transform", (d,i) => `translate(${-itemWidth/2 + vertices[i][0]}, ${-itemHeight/2 + vertices[i][1]})`)
                    .each(function(d,i){
                        //console.log("item", d, i)
                        const itemG = d3.select(this);
                        itemG.select("rect.card-item-bg")
                            .attr("width", itemWidth)
                            .attr("height", itemHeight);

                    })

            itemG.exit().remove();*/

            const itemG = centreG.selectAll("g.item").data(data);
            itemG.enter()
                .append("g")
                    .attr("class", "item")
                    .each(function(){
                        const itemG = d3.select(this)
                            .attr("opacity", withLabels ? 1 : 0);

                        itemG.append("text")
                            .attr("text-anchor", "middle")
                            .attr("dominant-baseline", "central")
                            .attr("font-size", "9")
                            .attr("stroke-width", 0.1)
                            .attr("stroke", grey10(7))
                            .attr("fill", grey10(7));

                        itemG.append("rect").attr("class", "item-hitbox")
                            .attr("stroke", "none")
                            .attr("fill", "transparent")

                    })
                    .attr("transform", (d,i) => `translate(${itemContentVertices[i][0]}, ${itemContentVertices[i][1]})`)
                    .merge(itemG)
                    .each(function(d, i){
                        const itemG = d3.select(this);
                        itemG
                            .transition()
                            .delay(300)
                            .duration(200)
                                .attr("transform", `translate(${itemContentVertices[i][0]}, ${itemContentVertices[i][1]})`)
                                .attr("opacity", withLabels ? 1 : 0);
                        
                        const shouldTruncate = contentsWidth < 150;
                        const itemWidth = shouldTruncate ? 50 : contentsWidth * 0.5;
                        const itemHeight = 40;
                        itemG.select("rect.item-hitbox")
                            .attr("x", -itemWidth/2)
                            .attr("y", -itemHeight/2)
                            .attr("width", itemWidth)
                            .attr("height", itemHeight)

                        //text
                        const truncateIfNecc = text => shouldTruncate ? `${text.slice(0,7)}...` : text;
                        let text;
                        if(d.title){
                            text = truncateIfNecc(d.title);
                        } else {
                            text = `Item ${d.itemNr + 1}`;
                        }

                        //text
                        itemG.select("text")
                            .text(text)
                    })
                    .on("click", function(e,d){ onClickItem.call(this, e, d)})
                    

            const chainSectionHitboxLine = centreG.selectAll("line.chain-section-hitbox").data(data);
            chainSectionHitboxLine.enter()
                    .append("line")
                        .attr("class", "chain-section-hitbox")
                        .merge(chainSectionHitboxLine)
                        .attr("x1", (d,i) => vertices[i][0])
                        .attr("y1", (d,i) => vertices[i][1])
                        .attr("x2", (d,i) => vertices[i + 1] ? vertices[i+1][0] : vertices[0][0])
                        .attr("y2", (d,i) => vertices[i + 1] ? vertices[i+1][1] : vertices[0][1])
                        .attr("stroke", "transparent")
                        .attr("stroke-width", 40)
                        .on("click", function(e,d){ onClickLine.call(this, e, d) })

            chainSectionHitboxLine.exit().remove();

            const chainSectionLine = centreG.selectAll("line.chain-section").data(data);
            chainSectionLine.enter()
                .append("line")
                    .attr("class", "chain-section")
                    .attr("pointer-events", "none")
                    .merge(chainSectionLine)
                    .each(function(d,i){
                        //delay needed so when card swiped the lines dont transition too soon
                        d3.select(this)
                            .transition("trans1")
                            .delay(300)
                            .duration(200)
                                .attr("x1", vertices[i][0])
                                .attr("y1", vertices[i][1])
                                .attr("x2", vertices[i + 1] ? vertices[i+1][0] : vertices[0][0])
                                .attr("y2", vertices[i + 1] ? vertices[i+1][1] : vertices[0][1])
                                .attr("stroke-width", styles.lineStrokeWidth)

                        //no delay for pressing line
                        d3.select(this)
                            .transition("trans2")
                            .duration(200)
                                .attr("stroke", styles._lineStroke(d,i))

                    })

            chainSectionLine.exit().remove();

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
    cardItems.withLabels = function (value) {
        if (!arguments.length) { return withLabels; }
        withLabels = value;
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
