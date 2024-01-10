import * as d3 from 'd3';
//import { grey10, COLOURS, TRANSITIONS } from "./constants";
/*
import { updateTransform } from '../journey/transitionHelpers';
import deckComponent from './deckComponent';
import { getTransformationFromTrans } from '../journey/helpers';
import { fadeIn, remove } from '../journey/domHelpers';*/

//const transformTransition = { update: { duration: TRANSITIONS.MED } };


const peopleData = [
    { key:"coach", label:"Coach" },
    { key:"analyst", label:"Analyst" },
    { key:"player", label:"Player" },
    { key:"others", label:"Others" }
]

const activitiesData = [
    { key:"kitman", label:"Kitman Labs & IDPs" },
    { key:"reviews", label:"Reviews & Reports" },
    { key:"goals", label:"Goals & KPIs" },
    { key:"comms", label:"Communication" }
]

const middleData = [
    { key:"easy", label:"Easy To Use", linkToMultiplier:0.5 },
    { key:"time-saving", label:"Time-Saving", linkToMultiplier:1.5 },
    { key:"engaging", label:"Engaging", linkToMultiplier:2.5 },
    { key:"purposeful", label:"Purposeful", linkToMultiplier:3.5 }
]

export default function missingLinkVizComponent() {
    //API SETTINGS
    // dimensions
    let width = 300;
    let height = 600;

    let margin = { left:0, right:0, top:0, bottom:0 };
    let contentsWidth;
    let contentsHeight;

    let peopleWidth;
    let peopleHeight;
    /*let peopleMargin;
    let peopleContentsWidth;
    let peopleContentsHeight;*/
    let middleWidth;
    let middleHeight;
    let middleMargin;
    let middleContentsWidth;
    let middleContentsHeight;
    let middleTitleHeight;
    let middleItemsHeight;

    let activitiesWidth;
    let activitiesHeight;
    /*let activitiesMargin;
    let activitiesContentsWidth;
    let activitiesContentsHeight;*/

    /*let peopleX;
    let peopleY;
    let middleX;
    let middleY;
    let activitiesX;
    let activitiesY;*/

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        peopleWidth = contentsWidth * 0.25;
        activitiesWidth = contentsWidth * 0.25;
        middleWidth = contentsWidth * 0.5;

        peopleHeight = contentsHeight;
        activitiesHeight = contentsHeight;
        middleHeight = contentsHeight;

        middleMargin = { 
            left: contentsWidth * 0.1, right: contentsWidth * 0.1, top: middleHeight * 0.2, bottom:middleHeight * 0.2
        }

        middleContentsWidth = middleWidth - middleMargin.left - middleMargin.right;
        middleContentsHeight = middleHeight - middleMargin.top - middleMargin.bottom;

        middleTitleHeight = 50;
        middleItemsHeight = middleContentsHeight - middleTitleHeight;
    }

    let DEFAULT_STYLES = {
        missingLinkViz:{ info:{ date:{ fontSize:9 } } },
    }
    let _styles = () => DEFAULT_STYLES;

    function missingLinkViz(selection, options={}) {
        const { } = options;

        updateDimns();
        // expression elements
        selection.each(function (data) {
            const containerG = d3.select(this);

            if(containerG.select("g.missing-middle-viz-contents").empty()){
                init.call(this, data);
            }

            update.call(this, data);

            function init(){
                const contentsG = d3.select(this).append("g")
                    .attr("class", "missing-middle-viz-contents");
                
                /*contentsG
                    .append("rect")
                        .attr("class", "contents-bg")
                        .attr("stroke", "white")*/

                contentsG.append("g").attr("class", "people")
                    .append("rect")
                        .attr("class", "people-bg")
                        .attr("fill", "none")
                        //.attr("stroke", "white");

                contentsG.append("g").attr("class", "activities")
                    .append("rect")
                        .attr("class", "activities-bg")
                        .attr("fill", "none")
                        //.attr("stroke", "white");

                //middle
                const middleG = contentsG.append("g").attr("class", "middle");
                const middleContentsG = middleG.append("g").attr("class", "middle-contents");
                middleContentsG
                    .append("rect")
                        .attr("class", "middle-bg")
                        .attr("fill", "none")
                        .attr("stroke", "white")
                        .attr("rx", 10)
                        .attr("ry", 10);

                //title
                middleContentsG
                    .append("text")
                        .attr("class", "middle-title")
                            .attr("text-anchor", "middle")
                            .attr("dominant-baseline", "hanging")
                            .attr("stroke", "white")
                            .attr("stroke-width", 1)
                            .attr("font-size", 16)
                            .attr("fill", "white");
                //items
                middleContentsG
                    .append("g")
                        .attr("class", "middle-items")

                //links
                contentsG.append("g").attr("class", "links-to-middle")
                contentsG.append("g").attr("class", "links-from-middle")

            }


            function update(data, options={}){
                const containerG = d3.select(this)
                    .attr("width", width)
                    .attr("height", height)

                const contentsG = containerG.select("g.missing-middle-viz-contents")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

                contentsG.select("rect.contents-bg")
                    .attr("width", contentsWidth)
                    .attr("height", contentsHeight)

                //positions of blocks
                /*const peopleX = 0;
                const peopleY = 0;
                const middleX = peopleWidth;
                const middleY = */

                const peopleG = contentsG.select("g.people")
                    //.attr("transform", `translate()`)

                const middleG = contentsG.select("g.middle")
                    .attr("transform", `translate(${peopleWidth}, 0)`)

                const activitiesG = contentsG.select("g.activities")
                    .attr("transform", `translate(${peopleWidth + middleWidth}, 0)`)

                peopleG.select("rect.people-bg")
                    .attr("width", peopleWidth)
                    .attr("height", peopleHeight)

                activitiesG.select("rect.activities-bg")
                    .attr("width", activitiesWidth)
                    .attr("height", activitiesHeight)

                //middle
                const middleContentsG = middleG.select("g.middle-contents")
                    .attr("transform", `translate(${middleMargin.left}, ${middleMargin.top})`)

                middleContentsG.select("rect.middle-bg")
                    .attr("width", middleContentsWidth)
                    .attr("height", middleContentsHeight)
                
                middleContentsG.select("text.middle-title")
                    .attr("x", middleContentsWidth/2)
                    .attr("y", 15)
                    .text("SWITCHPLAY")

                const personWidth = peopleWidth;
                const personHeight = peopleHeight/peopleData.length;

                //people data
                const personG = peopleG.selectAll("g.person").data(peopleData);
                personG.enter()
                    .append("g")
                        .attr("class", "person")
                        .each(function(d){
                            const personG = d3.select(this);
                            personG.append("text").attr("class", "person-title")
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")
                                .attr("stroke", "white")
                                .attr("stroke-width", 0.5)
                                .attr("font-size", 12)
                                .attr("fill", "white");

                            personG.append("image")
                            personG.append("rect").attr("class", "person-hitbox")
                                .attr("fill", "transparent")
                                //.attr("stroke", "aqua");

                        })
                        .merge(personG)
                        .attr("transform", (d,i) => `translate(0, ${i * personHeight})`)
                        .each(function(d,i){
                            const personG = d3.select(this);

                            personG.select("text.person-title")
                                .attr("x", personWidth/2)
                                .attr("y", personHeight/2)
                                .text(d.label)

                            personG.select("image")
                                .attr("xmiddle:href", d.url)
                                //.attr("transform", `scale(${photoContentsWidth / 250})`)
                            
                            personG.select("rect.person-hitbox")
                                .attr("width", personWidth)
                                .attr("height", personHeight)

                        });

                personG.exit().remove();

                //activities data
                const activityWidth = activitiesWidth;
                const activityHeight = activitiesHeight/activitiesData.length;

                const activityG = activitiesG.selectAll("g.activity").data(activitiesData);
                activityG.enter()
                    .append("g")
                        .attr("class", "activity")
                        .each(function(d){
                            const activityG = d3.select(this);
                            activityG.append("text").attr("class", "activity-title")
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")
                                .attr("stroke", "white")
                                .attr("stroke-width", 0.5)
                                .attr("font-size", 12)
                                .attr("fill", "white");

                            activityG.append("image")
                            activityG.append("rect").attr("class", "activity-hitbox")
                                .attr("fill", "transparent")
                                //.attr("stroke", "aqua");

                        })
                        .merge(activityG)
                        .attr("transform", (d,i) => `translate(0, ${i * activityHeight})`)
                        .each(function(d,i){
                            const activityG = d3.select(this);

                            activityG.select("text.activity-title")
                                .attr("x", activityWidth/2)
                                .attr("y", activityHeight/2)
                                .text(d.label)

                            activityG.select("image")
                                .attr("xmiddle:href", d.url)
                                //.attr("transform", `scale(${photoContentsWidth / 250})`)
                            
                            activityG.select("rect.activity-hitbox")
                                .attr("width", activityWidth)
                                .attr("height", activityHeight)

                        });

                //middle data
                const middleItemsG = middleContentsG.select("g.middle-items")
                        .attr("transform", `translate(0, ${middleTitleHeight})`);
                        
                const middleItemWidth = middleContentsWidth;
                const middleItemHeight = middleItemsHeight/middleData.length;

                const middleItemG = middleItemsG.selectAll("g.middle-item").data(middleData);
                middleItemG.enter()
                    .append("g")
                        .attr("class", "middle-item")
                        .each(function(d){
                            const middleItemG = d3.select(this);
                            middleItemG.append("text").attr("class", "middle-item-title")
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")
                                .attr("stroke", "white")
                                .attr("stroke-width", 0.5)
                                .attr("font-size", 12)
                                .attr("fill", "white");

                            middleItemG.append("image")
                            middleItemG.append("rect").attr("class", "middle-item-hitbox")
                                .attr("fill", "transparent")
                                .attr("stroke", "aqua");

                        })
                        .merge(middleItemG)
                        .attr("transform", (d,i) => `translate(0, ${i * middleItemHeight})`)
                        .each(function(d,i){
                            const middleItemG = d3.select(this);

                            middleItemG.select("text.middle-item-title")
                                .attr("x", middleItemWidth/2)
                                .attr("y", middleItemHeight/2)
                                .text(d.label)

                            middleItemG.select("image")
                                .attr("xmiddle:href", d.url)
                                //.attr("transform", `scale(${photoContentsWidth / 250})`)
                            
                            middleItemG.select("rect.middle-item-hitbox")
                                .attr("width", middleItemWidth)
                                .attr("height", middleItemHeight)

                        });

                middleItemG.exit().remove();


                //links
                /*
                const linkToMiddleG = contentsG.select("g.links-to-middle").selectAll("g.link-to-middle").data(peopleData);
                linkToMiddleG.enter()
                    .append("line")
                        .attr("class", "link-to-middle")
                        .attr("stroke", "white")
                        .merge(linkToMiddleG)
                        .attr("x1", peopleWidth)
                        .attr("y1", (d,i) => (i + 0.5) * personHeight)
                        .attr("x2", peopleWidth + middleMargin.left)
                        .attr("y2", (d,i) => middleMargin.top + middleTitleHeight + (i + 0.5) * middleItemHeight)

                linkToMiddleG.exit().remove();

                const linkFromMiddleG = contentsG.select("g.links-from-middle").selectAll("g.link-from-middle").data(middleData);
                linkFromMiddleG.enter()
                    .append("line")
                        .attr("class", "link-from-middle")
                        .attr("stroke", "white")
                        .merge(linkFromMiddleG)
                        .attr("x1", peopleWidth + middleMargin.left + middleContentsWidth)
                        .attr("y1", (d,i) => middleMargin.top + middleTitleHeight + (i + 0.5) * middleItemHeight)
                        .attr("x2", peopleWidth + middleWidth)
                        .attr("y2", (d,i) => d.linkToMultiplier * activityHeight)

                linkFromMiddleG.exit().remove();*/


            }

        })

        return selection;
    }
    
    //api
    missingLinkViz.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return missingLinkViz;
    };
    missingLinkViz.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return missingLinkViz;
    };

    return missingLinkViz;
}
