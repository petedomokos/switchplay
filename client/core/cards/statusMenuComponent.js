import * as d3 from 'd3';
import { DIMNS, FONTSIZES, STYLES, grey10, OVERLAY, COLOURS, TRANSITIONS } from "./constants";
import { fadeInOut, fadeIn, remove } from '../journey/domHelpers';

const { GOLD, NOT_STARTED_FILL } = COLOURS;

/*

*/
export default function statusMenuComponent() {
    //API SETTINGS
    let optionWidth = 12;
    let optionHeight = 9;
    let titleHeight = 5;
    let instructionsHeight = 4;

    function updateDimns(){

    }

    let styles = {
    }

    //API CALLBACKS

    let onClick = function(){};
    function statusMenu(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;
        updateDimns();
        selection.each(function (data, i) {
            update.call(this, data);
        })

        function update(data){
            const { status, optionsData } = data

            const nrOptions = optionsData?.length || 0;
            const margin = { left: 1, right: 1, top: 0, bottom: 2 }
            const optionMarginHoz = 1.5; //2 * 1.5 = 3 ensures square area for radio button
            const optionMarginVert = optionHeight * 0.15;
            const optionContentsWidth = optionWidth - 2 * optionMarginHoz;
            const optionContentsHeight = optionHeight - 2 * optionMarginVert;

            const menuWidth = nrOptions * optionWidth + margin.left + margin.right;
            const menuHeight = titleHeight + instructionsHeight + optionHeight + margin.top + margin.bottom;

            const containerG = d3.select(this);
            const statusMenuG = containerG.selectAll("g.status-menu").data(optionsData ? [1] : []);

            statusMenuG.enter()
                .append("g")
                    .attr("class", "status-menu")
                    .call(fadeIn)
                    .each(function(){
                        const statusMenuG = d3.select(this);
                        statusMenuG.append("rect").attr("class", "status-menu-bg")
                            .attr("rx", 1.5)
                            .attr("ry", 1.5)
                            .attr("fill", "black")
                            .attr("opacity", 1);

                        statusMenuG
                            .append("text")
                                .attr("class", "status-menu-title")
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")
                                .attr("stroke", grey10(3))
                                .attr("fill", grey10(3))
                                .attr("stroke-width", 0.03)
                                .attr("font-size", 2.5)
                                .attr("font-family", "helvetica")
                                .attr("font-style", "normal")

                        statusMenuG
                            .append("text")
                                .attr("class", "status-menu-instructions")
                                .attr("text-anchor", "middle")
                                .attr("dominant-baseline", "central")
                                .attr("stroke", grey10(3))
                                .attr("fill", grey10(3))
                                .attr("stroke-width", 0.03)
                                .attr("font-size", 2)
                                .attr("font-family", "helvetica")
                                .attr("font-style", "normal")
                            
                        statusMenuG.append("g").attr("class", "options");
                    })
                    .merge(statusMenuG)
                    .attr("transform", `translate(${-menuWidth/2},${-menuHeight})`)
                    .each(function(){
                        const statusMenuG = d3.select(this);
                        statusMenuG.select("rect.status-menu-bg")
                            .attr("width", menuWidth)
                            .attr("height", menuHeight);

                        statusMenuG.select("text.status-menu-title").attr("class", "status-menu-title")
                            .attr("x", menuWidth/2)
                            .attr("y", margin.top + titleHeight/2)
                            .text("ITEM STATUS");

                        statusMenuG.select("text.status-menu-instructions").attr("class", "status-menu-instructions")
                            .attr("x", menuWidth/2)
                            .attr("y", margin.top + titleHeight + instructionsHeight/2)
                            .text("Click to change");

                        const optionsG = statusMenuG.select("g.options")
                            .attr("transform", `translate(${margin.left}, ${margin.top + titleHeight + instructionsHeight})`)
                                    
                        const optionG = optionsG.selectAll("g.option").data(optionsData, d => d.key)
                        optionG.enter()
                            .append("g")
                                .attr("class", "option")
                                .each(function(optD, i){
                                    const optionG = d3.select(this);
                                    optionG.append("rect")
                                        .attr("rx", 1.5)
                                        .attr("ry", 1.5)
                                        .attr("stroke", grey10(3))
                                        .attr("stroke-width", 1)
                                        .attr("fill", status >= i + 1 ? GOLD : NOT_STARTED_FILL)
                                        //.attr("opacity", 0.75)
                                })
                                .merge(optionG)
                                .attr("transform", (d,i) => `translate(${optionMarginHoz + i * optionWidth}, ${optionMarginVert})`)
                                .each(function(optD,i){
                                    const optionG = d3.select(this);

                                    optionG.select("rect")
                                        .attr("width", optionContentsWidth)
                                        .attr("height", optionContentsHeight)
                                    
                                    optionG.select("rect")
                                        .transition()
                                        .duration(TRANSITIONS.VERY_FAST)
                                        .attr("fill", status >= i + 1 ? GOLD : NOT_STARTED_FILL)

                                })

                        optionG.exit().remove();
                        })
                        .on("click", onClick)

            statusMenuG.exit().call(remove)

        }

        return selection;
    }
    
    //api
    statusMenu.optionWidth = function (value) {
        if (!arguments.length) { return optionWidth; }
        optionWidth = value;
        return statusMenu;
    };
    statusMenu.optionHeight = function (value) {
        if (!arguments.length) { return optionHeight; }
        optionHeight = value;
        return statusMenu;
    };
    statusMenu.titleHeight = function (value) {
        if (!arguments.length) { return titleHeight; }
        titleHeight = value;
        return statusMenu;
    };
    statusMenu.instructionsHeight = function (value) {
        if (!arguments.length) { return instructionsHeight; }
        instructionsHeight = value;
        return statusMenu;
    };
    statusMenu.styles = function (obj) {
        if (!arguments.length) { return styles; }
        styles = {
            ...styles,
            ...obj,
        };
        return statusMenu;
    };
    statusMenu.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return statusMenu;
    };
    return statusMenu;
}
