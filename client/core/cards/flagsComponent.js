import * as d3 from 'd3';
import { DIMNS, grey10, COLOURS, TRANSITIONS, STYLES } from "./constants";
import dragEnhancements from '../journey/enhancedDragHandler';
import mediaComponent from '../journey/mediaComponent';
import { updateTransform } from '../journey/transitionHelpers';
import { fadeIn, fadeInOut, remove } from '../journey/domHelpers';

export default function flagsComponent() {
    //API SETTINGS
    // dimensions

    //overall dimns can be given, or mesg dimns
    let width;
    let height;
    let mesgWidth = 0;
    let mesgHeight = 0;
    let eventWidth = 0;
    let eventHeight = 0;

    let _flagWidth;
    let _flagHeight;

    function updateDimns(){
        _flagWidth = d => d.eventType === "mesg" ? mesgWidth : eventWidth;
        _flagHeight = d => d.eventType === "mesg" ? mesgHeight : eventHeight;

    }

    let _x;
    let _y;
    let alignment = "left";

    let styles = {
        mesgBg:{ fill:COLOURS.FLAG.MESG, stroke:COLOURS.FLAG.MESG, strokeWidth:0 },
        eventBg:{ fill:COLOURS.FLAG.EVENT, stroke:COLOURS.FLAG.EVENT, strokeWidth:0 },
        title:{},
        subtitle:{},
        content:{}
    }

    //API CALLBACKS
    let onClick = function(){};

    function flags(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;
        updateDimns();
        selection.each(function (data) {
            const containerG = d3.select(this);
            //helpers
            const maxFlagWidth = d3.max(data, d => _flagWidth(d));
            const maxFlagHeight = d3.max(data, d => _flagHeight(d));
            const _sumOfHeights = data => d3.sum(data, d => _flagHeight(d));
            const sumOfAllDataHeights = _sumOfHeights(data);
            const nrGaps = data.length - 1;
            const calcFlagsVertGap = () => {
                //not relevant if y pos is a specified by a function
                if(_y) { return null; }
                //if height is limited, must calc remaining space
                if(height){ 
                    const remaining = height - sumOfAllDataHeights;
                    return d3.min([remaining/nrGaps, maxFlagHeight * 0.3]); 
                }
                return maxFlagHeight * 0.1;
            }
            const flagsVertGap = calcFlagsVertGap();
            const sumOfAllGaps = flagsVertGap * nrGaps;
            const extraFlagMarginTop = height ? (height - (sumOfAllDataHeights + sumOfAllGaps))/2 : 0;

            const flagG = containerG.selectAll("g.flag").data(data, d => d.key);
            flagG.enter()
                //.insert("g", ":first-child")
                .append("g")
                    .attr("class", (d,i) => `flag flag-${i}`)
                    .call(fadeIn)
                    .each(function(d,i){
                        const flagG = d3.select(this);
                        const contentsG = flagG.append("g").attr("class", "flag-contents");
                        //bottom layer has straight corners to cover right corners
                        contentsG.append("rect").attr("class", "flag-bg-bottom-layer flag-bg");
                        contentsG
                            .append("rect")
                                .attr("class", "flag-bg-top-layer flag-bg")
                                .attr("rx", 3)
                                .attr("ry", 3);
                        
                        contentsG.append("text")
                            .attr("text-anchor", "middle")
                            .attr("dominant-baseline", "hanging")
                            .attr("stroke-width", 0.1)
                        
                    })
                    .call(updateTransform, { 
                        //a func can be passed in, or else an alignment choice of left or right
                        x:(d,i) => _x ? _x(d,i) : (alignment = "right" ? maxFlagWidth - _flagWidth(d) : 0),  
                        y:(d,i) => _y ? _y(d,i) : _sumOfHeights(data.slice(0,i)) + (i * flagsVertGap),
                        transition: { duration: 0 },
                        //force:true
                    })
                    .merge(flagG)
                    .call(updateTransform, { 
                        x:(d,i) => _x ? _x(d,i) : (alignment = "right" ? maxFlagWidth - _flagWidth(d) : 0),  
                        y:(d,i) => _y ? _y(d,i) : _sumOfHeights(data.slice(0,i)) + (i * flagsVertGap) + extraFlagMarginTop,
                        transition:{ duration: 0 },
                        //force:true
                    })
                    .each(function(d,i){
                        const { flagType } = d;
                        const flagWidth = _flagWidth(d);
                        const flagHeight = _flagHeight(d);
                        const headingHeight = d3.min([flagHeight * 0.8, d3.max([flagHeight * 0.25, 3])]);

                        const flagG = d3.select(this);
                        const contentsG = flagG.select("g.flag-contents");
            
                        //bg
                        contentsG.selectAll("rect.flag-bg")
                            .transition("flag-appearance")
                            .delay(200)
                            .duration(400)
                                .attr("fill", flagType === "mesg" ? styles.mesgBg.fill : styles.eventBg.fill)
                                .attr("stroke", flagType === "mesg" ? styles.mesgBg.stroke : styles.eventBg.stroke)
                                .attr("stroke-width", flagType === "mesg" ? styles.mesgBg.strokeWidth : styles.eventBg.strokeWidth)

                        contentsG.select("rect.flag-bg-bottom-layer")
                            .transition("flag-dimns")
                            .duration(TRANSITIONS.MED)
                                .attr("x", flagType === "mesg" ? mesgWidth/2 : eventWidth/2)
                                .attr("width", flagType === "mesg" ? mesgWidth/2 : eventWidth/2)
                                .attr("height", flagType === "mesg" ? mesgHeight : eventHeight);

                        contentsG.select("rect.flag-bg-top-layer")
                            .transition("flag-dimns")
                            .duration(TRANSITIONS.MED)
                                .attr("width", flagType === "mesg" ? mesgWidth : eventWidth)
                                .attr("height", flagType === "mesg" ? mesgHeight : eventHeight);

                        contentsG.select("text")
                            .attr("x", flagWidth/2)
                            .attr("y", flagHeight * 0.1)
                            .attr("font-size", headingHeight)
                            .attr("stroke", flagType === "mesg" ? grey10(3) : grey10(2))
                            .attr("fill", flagType === "mesg" ? grey10(3) : grey10(2))
                            .text(d.heading)
                       
                    })
                    .on("click", onClick)
  
            //EXIT
            flagG.exit().call(remove);

            
        })

        return selection;
    }
    
    //api
    flags.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return flags;
    };
    flags.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return flags;
    };
    flags.mesgWidth = function (value) {
        if (!arguments.length) { return mesgWidth; }
        mesgWidth = value;
        return flags;
    };
    flags.mesgHeight = function (value) {
        if (!arguments.length) { return mesgHeight; }
        mesgHeight = value;
        return flags;
    };
    flags.eventWidth = function (value) {
        if (!arguments.length) { return eventWidth; }
        eventWidth = value;
        return flags;
    };
    flags.eventHeight = function (value) {
        if (!arguments.length) { return eventHeight; }
        eventHeight = value;
        return flags;
    };
    flags.alignment = function (value) {
        if (!arguments.length) { return alignment; }
        alignment = value;
        return flags;
    };
    flags.styles = function (obj) {
        if (!arguments.length) { return styles; }
        const mesgBg = obj.mesgBg ? { ...styles.mesgBg, ...obj.mesgBg } : styles.mesgBg;
        const eventBg = obj.eventBg ? { ...styles.eventBg, ...obj.eventBg } : styles.eventBg;
        const title = obj.title ? { ...styles.title, ...obj.title } : styles.title;
        const subtitle = obj.subtitle ? { ...styles.subtitle, ...obj.subtitle } : styles.subtitle;
        const content = obj.content ? { ...styles.content, ...obj.content } : styles.content;
        styles = {
            ...styles,
            ...obj,
            mesgBg,
            eventBg,
            title,
            subtitle,
            content,
            
        };
        return flags;
    };
    flags._x = function (func) {
        if (!arguments.length) { return _x; }
        _x = func;
        return flags;
    };
    flags._y = function (func) {
        if (!arguments.length) { return _y; }
        _y = func;
        return flags;
    };
    flags.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return flags;
    };
    return flags;
}
