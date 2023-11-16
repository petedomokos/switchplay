import * as d3 from 'd3';
import { grey10, COLOURS, TRANSITIONS, DIMNS } from "./constants";
import { updateRectDimns } from '../journey/transitionHelpers';
import trophyComponent from "./trophyComponent.js"
import { fadeIn, fadeInOut, remove } from '../journey/domHelpers';
import { truncateIfNecc } from '../journey/helpers';
const { GOLD } = COLOURS;

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

    let titleWidth;
    let titleHeight;

    let subtitleWidth;
    let subtitleHeight;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        //@todo - put teh 20 in constants as its also used in Decks for form
        progressIconWidth = DIMNS.DECK.PROGRESS_ICON_WIDTH;
        progressIconHeight = contentsHeight;
        progressIconMargin = {
            left: progressIconWidth * 0.1, right: progressIconWidth * 0.1,
            top:progressIconHeight * 0.2, bottom:progressIconHeight * 0.2
        }

        subtitleWidth = contentsWidth - progressIconWidth;
        subtitleHeight = withSpaceForSubtitle ? contentsHeight * DIMNS.DECK.HEADER_SUBTITLE_HEIGHT_PROP : 0;
        titleWidth = contentsWidth - progressIconWidth;
        titleHeight = contentsHeight - subtitleHeight;

    }
    let DEFAULT_STYLES = {
        header:{ info:{ date:{ fontSize:9 } } },
    }
    let _styles = () => DEFAULT_STYLES;
    let transformTransition;
    let maxTitleFont = 16;
    let maxTitleChars = 20;

    let onClickTitle = function(){};
    let onClickSubtitle = function(){};
    let onClickProgressIcon = function(){};

    let withTitle = true;
    let withSubtitle = false;
    let withSpaceForSubtitle = false;

    const trophy = trophyComponent();

    let containerG;
    let contentsG;
    let titleG;
    let progressIconG;

    function header(selection, options={}) {
        const { } = options;
       
        updateDimns();
        // expression elements
        selection.each(function (data) {
            //console.log("header", data.completion)
            containerG = d3.select(this);

            if(containerG.select("g").empty()){
                init(data);
            }

            update(data);

            function init(data){
                //bg
                containerG.append("rect")
                    .attr("class", "header-bg")
                    .attr("width", width)
                    .attr("height", height)
                    //.attr("pointer-events", "none")
                    .attr("fill", COLOURS.DECK.HEADER.BG)
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
                    .attr("y", titleHeight/2)
                    .attr("font-size", d3.min([maxTitleFont, titleHeight * 0.5]))
                    .attr("dominant-baseline", "central");
                    
                titleG.append("rect")
                    .attr("class", "title-hitbox")
                    .attr("width", titleWidth)
                    .attr("height", titleHeight)
                    .attr("fill", "transparent")
                    //.attr("stroke", "yellow")
                    //.attr("stroke-width", 0.03)

                    
                //progress-icon
                progressIconG = contentsG.append("g")
                    .attr("class", "progress-icon")
                    .attr("transform", `translate(${contentsWidth - progressIconWidth}, 0)`);

            }

            function update(data, options={}){
                //console.log("update")
                const { } = options;
                const { id, title, subtitle, status, completion } = data

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
                const titleFontSize = d3.min([maxTitleFont, titleHeight * 0.5]);
                titleG.select("text")
                    .transition()
                    .duration(TRANSITIONS.MED)
                        .attr("y", titleHeight/2)
                        .attr("font-size", titleFontSize);

                titleG.select("text")
                    .attr("stroke", grey10(2))
                    .attr("fill", grey10(2))
                    .attr("stroke-width", 0.1)
                    .text(truncateIfNecc(title, maxTitleChars) || "Enter Title...")
                    
                
                titleG.select("rect.title-hitbox")
                    .transition("title-hitbox")
                    .duration(TRANSITIONS.MED)
                        .attr("width", contentsWidth - progressIconWidth)
                        .attr("height", contentsHeight)

                titleG
                    .attr("display", withTitle ? null : "none")
                    .on("click", function(e){ 
                        console.log("title click")
                        onClickTitle.call(this, e, data);
                        e.stopPropagation(); 
                    })

                const subtitleG = contentsG.selectAll("g.subtitle").data(withSubtitle ? [1] : [])
                subtitleG.enter()
                    .append("g")
                        .attr("class", "subtitle")
                        .call(fadeIn)
                        .each(function(){
                            const subtitleG = d3.select(this);
                            subtitleG.append("text")
                                .attr("dominant-baseline", "hanging")
                                //.attr("y", subtitleHeight/2)
                                .attr("font-size", subtitleHeight * 0.7)
                                .attr("stroke", grey10(5))
                                .attr("fill", grey10(5))
                                .attr("stroke-width", 0.05)

                            subtitleG.append("rect").attr("class", "hitbox")
                                .attr("fill", "transparent")
                                //.attr("stroke", "white")
                                //.attr("stroke-width", 0.03)

                        })
                        .merge(subtitleG)
                        .attr("transform", `translate(0, ${titleHeight})`)
                        .each(function(){
                            const subtitleG = d3.select(this);

                            subtitleG.select("text")
                                .transition()
                                .duration(TRANSITIONS.MED)
                                    //.attr("y", subtitleHeight/2)
                                    .attr("font-size", subtitleHeight * 0.7)

                            subtitleG.select("text")
                                .text(truncateIfNecc(subtitle, maxTitleChars))

                            subtitleG.select("rect")
                                .attr("width", subtitleWidth)
                                .attr("height", subtitleHeight)

                        })
                        .on("click", function(e){ 
                            console.log("subtitle click")
                            onClickSubtitle.call(this, e, data);
                            e.stopPropagation(); 
                        })

                subtitleG.exit().call(remove);


                

                //progress-icon
                progressIconG
                    .transition("progress-icon")
                    .duration(TRANSITIONS.MED)
                        .attr("transform", `translate(${contentsWidth - progressIconWidth}, 0)`);

                progressIconG
                    .datum({ id, completion })
                    .call(trophy
                        .width(progressIconWidth)
                        .height(progressIconHeight)
                        .margin(progressIconMargin)
                        .iconTransform({ x:-3, y:-4 })
                        .onClick(onClickProgressIcon))
                    
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
    header.withTitle = function (value) {
        if (!arguments.length) { return withTitle; }
        withTitle = value;
        return header;
    };
    header.withSubtitle = function (value) {
        if (!arguments.length) { return withSubtitle; }
        withSubtitle = value;
        return header;
    };
    header.withSpaceForSubtitle = function (value) {
        if (!arguments.length) { return withSpaceForSubtitle; }
        withSpaceForSubtitle = value;
        return header;
    };
    header.maxTitleFont = function (value) {
        if (!arguments.length) { return maxTitleFont; }
        maxTitleFont = value;
        return header;
    };
    header.maxTitleChars = function (value) {
        if (!arguments.length) { return maxTitleChars; }
        maxTitleChars = value;
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
    header.onClickSubtitle = function (value) {
        if (!arguments.length) { return onClickSubtitle; }
        onClickSubtitle = value;
        return header;
    };
    header.onClickProgressIcon = function (value) {
        if (!arguments.length) { return onClickProgressIcon; }
        onClickProgressIcon = value;
        return header;
    };
    return header;
}
