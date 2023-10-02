import * as d3 from 'd3';
import { grey10, COLOURS, TRANSITIONS } from "./constants";
import { updateRectDimns } from '../journey/transitionHelpers';
import { trophy } from "../../../assets/icons/milestoneIcons.js"

export default function headerComponent() {
    //API SETTINGS
    // dimensions
    let width = 300;
    let height = 100
    let margin = { left: 0, right: 0, top: 0, bottom: 0 };
    let contentsWidth;
    let contentsHeight;

    let progressIconWidth;
    let progressIconHeight;
    let progressIconMargin;
    let progressIconContentsWidth;
    let progressIconContentsHeight;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        progressIconWidth = d3.min([20, contentsWidth * 0.3])
        progressIconHeight = contentsHeight;
        progressIconMargin = {
            left: progressIconWidth * 0.1, right: progressIconWidth * 0.1,
            top:progressIconHeight * 0.1, bottom:progressIconHeight * 0.1
        }
        progressIconContentsWidth = progressIconWidth - progressIconMargin.left - progressIconMargin.right;
        progressIconContentsHeight = progressIconHeight - progressIconMargin.top - progressIconMargin.bottom;
    }
    let DEFAULT_STYLES = {
        header:{ info:{ date:{ fontSize:9 } } },
    }
    let _styles = () => DEFAULT_STYLES;
    let transformTransition;

    let onClickTitle = function(){};
    let onClickProgressIcon = function(){};

    let containerG;
    let contentsG;
    let titleG;
    let progressIconG;

    function header(selection, options={}) {
        const { } = options;

        updateDimns();
        // expression elements
        selection.each(function (data) {
            //console.log("header", data)
            containerG = d3.select(this)

            if(containerG.select("g").empty()){
                init();
            }

            update(data);

            function init(){
                //bg
                containerG.append("rect")
                    .attr("class", "header-bg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("pointer-events", "none")
                    .attr("fill", grey10(8))
                    .attr("rx", 3)
                    .attr("ry", 3);

                //contents
                contentsG = containerG.append("g")
                    .attr("class", "header-contents")
                    .attr("transform", `translate(${margin.left},${margin.top})`);;

                //title
                titleG = contentsG.append("g").attr("class", "title")
                titleG.append("text")
                    .attr("class", "title")
                    .attr("y", contentsHeight/2)
                    .attr("font-size", contentsHeight * 0.3)
                    .attr("dominant-baseline", "central");
                    
                titleG.append("rect")
                    .attr("class", "title-hitbox")
                    .attr("width", contentsWidth - progressIconWidth)
                    .attr("height", contentsHeight)
                    .attr("fill", "transparent")
                    
                //progress-icon
                progressIconG = contentsG.append("g")
                    .attr("class", "progress-icon")
                    .attr("transform", `translate(${contentsWidth - progressIconWidth}, 0)`);

                progressIconG.append("path");
                
                progressIconG.append("rect")
                    .attr("class", "progress-icon-hitbox")
                    .attr("fill", "transparent")
                    //.attr("stroke", grey10(6))
                    .attr("rx", 3)
                    .attr("ry", 3)

            }

            function update(data, options={}){
                //console.log("update")
                const { } = options;
                const { title, status } = data

                //bg
                containerG
                    .select("rect.header-bg")
                        .transition("header-bg")
                        .duration(TRANSITIONS.MED)
                            .attr("width", width)
                            .attr("height", height);

                //contents
                contentsG
                    .transition("header-contents")
                    .duration(TRANSITIONS.MED)
                        .attr("transform", `translate(${margin.left}, ${margin.top})`)

                //title
                titleG.select("text")
                    .attr("stroke", grey10(2))
                    .attr("fill", grey10(2))
                    .attr("stroke-width", 0.1)
                    .text(title || "Enter Title...")
                        .transition("title-text")
                        .duration(TRANSITIONS.MED)
                            .attr("y", contentsHeight/2)
                            .attr("font-size", contentsHeight * 0.3)
                    
                
                titleG.select("rect.title-hitbox")
                    .on("click", function(e){ onClickTitle(e, data); })
                    .transition("title-hitbox")
                    .duration(TRANSITIONS.MED)
                        .attr("width", contentsWidth - progressIconWidth)
                        .attr("height", contentsHeight)

                //progress-icon
                contentsG.select("g.progress-icon")
                    .transition("progress-icon")
                    .duration(TRANSITIONS.MED)
                        .attr("transform", `translate(${contentsWidth - progressIconWidth}, 0)`)
                
                contentsG.select("rect.progress-icon-hitbox")
                    .on("click", function(e){ onClickProgressIcon(e, data); })
                    .transition("progress-icon-hitbox")
                    .duration(TRANSITIONS.MED)
                        .attr("width", progressIconWidth)
                        .attr("height", progressIconHeight)

                //dimns
                const actualIconWidth = 90;
                const iconScale = progressIconContentsWidth/actualIconWidth;
                const iconX = 0
                const iconY = -0.7;
                progressIconG.select("path")
                    .attr("d", trophy.pathD)
                    .attr("fill", status === 2 ? GOLD : (status === 1 ? grey10(2) : grey10(6)))
                    .attr("transform", `translate(${iconX},${iconY}) scale(${iconScale})`)

            }

        })

        return selection;
    }
    
    //api
    header.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return header;
    };
    header.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return header;
    };
    header.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = value;
        return header;
    };
    header.styles = function (value) {
        if (!arguments.length) { return _styles; }
        if(typeof value === "function"){
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value(d,i) });
        }else{
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value });
        }
        
        return header;
    };
    header.transformTransition = function (value) {
        if (!arguments.length) { return transformTransition; }
        transformTransition = value; 
        return header;
    };
    header.onClickDeck = function (value) {
        if (!arguments.length) { return onClickDeck; }
        onClickDeck = value;
        return header;
    };
    header.onClickTitle = function (value) {
        if (!arguments.length) { return onClickTitle; }
        onClickTitle = value;
        return header;
    };
    header.onClickProgressIcon = function (value) {
        if (!arguments.length) { return onClickProgressIcon; }
        onClickProgressIcon = value;
        return header;
    };
    return header;
}
