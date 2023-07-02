import * as d3 from 'd3';
import { DIMNS, PROFILE_PAGES, grey10, OVERLAY } from "./constants";
import container from './kpis/kpi/container';
import dragEnhancements from './enhancedDragHandler';
import { initial } from 'lodash';
import { toRadians } from './screenGeometryHelpers';

/*

*/
//helper
//always returns vertices s.t. first vertex angle from North is 0.
function pentagonVertices(options={}){
    const { r=1, centre=[0,0] } = options;
    const a = [centre[0], -r];
    const b = [r * Math.cos(toRadians(18)), -r * Math.sin(toRadians(18))];
    const c = [r * Math.cos(toRadians(-54)), -r * Math.sin(toRadians(-54))];
    const d = [-c[0], c[1]];
    const e = [-b[0], b[1]];

    return [a,b,c,d,e];
}

export default function cardItemsComponent() {
    //API SETTINGS
    // dimensions
    let width = DIMNS.profile.width;
    let height = DIMNS.profile.height / 2;
    let margin = { left: 20, right: 20, top:10, bottom:10 };
    let extraHorizMargin;
    let extraVertMargin;
    let contentsWidth;
    let contentsHeight;

    let itemWidth;
    let itemHeight;
    let radius;

    function updateDimns(){
        const availContentsWidth = width - margin.left - margin.right;
        const availContentsHeight = height - margin.top - margin.bottom;
        const actualContentsLength = d3.min([availContentsWidth, availContentsHeight]);
        contentsWidth = actualContentsLength;
        contentsHeight = actualContentsLength; 
        extraHorizMargin = availContentsWidth - contentsWidth;
        extraVertMargin = availContentsHeight - contentsHeight;

        itemWidth = 60;
        itemHeight = 60;
        const longestItemLength = d3.max([itemWidth, itemHeight]);
        radius = actualContentsLength/2 - longestItemLength/2;
    }

    //API CALLBACKS
    let onClick = function(){};
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

            const centreG = contentsG.select("g.centre")
                .attr("transform", `translate(${contentsWidth/2},${contentsHeight/2})`);

            const vertices = pentagonVertices({ r:radius });

            const itemG = centreG.selectAll("g.card-item").data(data);
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

            itemG.exit().remove();

            const chainSectionLine = centreG.selectAll("line.chain-section").data(data);
            chainSectionLine.enter()
                    .append("line")
                        .attr("class", "chain-section")
                        .attr("stroke", grey10(2))
                        .attr("stroke-width", 5)
                        .merge(chainSectionLine)
                        .attr("x1", (d,i) => vertices[i][0])
                        .attr("y1", (d,i) => vertices[i][1])
                        .attr("x2", (d,i) => vertices[i + 1] ? vertices[i+1][0] : vertices[0][0])
                        .attr("y2", (d,i) => vertices[i + 1] ? vertices[i+1][1] : vertices[0][1])

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
    cardItems.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
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
