import * as d3 from 'd3';
import { DIMNS, grey10, OVERLAY, COLOURS, TRANSITIONS } from "./constants";
import { trophy } from "../../../assets/icons/milestoneIcons.js"
import pentagonComponent from './pentagonComponent';
import { truncateIfNecc } from '../journey/helpers';
import { isNumber } from '../../data/dataHelpers';
import { fadeIn, remove } from '../journey/domHelpers';

const { GOLD } = COLOURS;

/*

*/
export default function cardHeaderComponent() {
    //API SETTINGS
    // dimensions
    let width = 250;
    let height = 45;
    let margin;
    let contentsWidth;
    let contentsHeight;

    let dateWidth;
    let dateHeight;
    let dateMargin;
    let dateContentsWidth;
    let dateContentsHeight;
    
    let titleWidth;
    let titleHeight;
    let titleMargin;
    let titleContentsWidth;
    let titleContentsHeight;

    let progressSummaryWidth;
    let progressSummaryHeight;
    let progressSummaryMargin;
    let progressSummaryContentsWidth;
    let progressSummaryContentsHeight;

    function updateDimns(){
        const infoMarginValue = height * 0.2;
        margin = { left:infoMarginValue, right:infoMarginValue, top:infoMarginValue, bottom: infoMarginValue }
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        dateHeight = contentsHeight;
        dateWidth = dateHeight;
        const infoItemsMarginValue = contentsHeight * 0.1;
        //use margin to make it a square for exact diagonal, so build up the other way 
        dateMargin = { left: infoItemsMarginValue, top:infoItemsMarginValue }
        dateContentsWidth = dateWidth - infoItemsMarginValue * 2;
        dateContentsHeight = dateContentsWidth;

        progressSummaryHeight = contentsHeight;
        progressSummaryWidth = progressSummaryHeight;
        progressSummaryHeight = contentsHeight;
        progressSummaryMargin = { 
            left: infoItemsMarginValue, right:infoItemsMarginValue, 
            top:infoItemsMarginValue, bottom:infoItemsMarginValue 
        };
        progressSummaryContentsWidth = progressSummaryWidth - progressSummaryMargin.left - progressSummaryMargin.right;
        progressSummaryContentsHeight = progressSummaryHeight - progressSummaryMargin.top - progressSummaryMargin.bottom;

        titleHeight = contentsHeight;
        titleWidth = contentsWidth - dateWidth - progressSummaryWidth;
        titleMargin = {
            //left:titleWidth * 0.4, right:titleWidth * 0.4, top: infoItemsMarginValue, bottom: infoItemsMarginValue
            left: infoItemsMarginValue, right:infoItemsMarginValue, 
            top:infoItemsMarginValue, bottom:infoItemsMarginValue 
        };
        titleContentsWidth = titleWidth - titleMargin.left - titleMargin.right;
        titleContentsHeight = titleHeight - titleMargin.top - titleMargin.bottom;
    }

    let fontSizes = {
        name:9,
        age:11,
        position:8,
        date:8
    };
    let styles = {
        statusFill:"white",
        trophyTranslate:`translate(-3,3) scale(0.25)`,
        date:{
            fill:grey10(7),
            stroke:grey10(7),
            strokeWidth:0.075
        },
        dateCount:{
            numberFill:grey10(7),
            numberStroke:grey10(7),
            numberStrokeWidth:0.1,
            wordsFill:grey10(7),
            wordsStroke:grey10(7),
            wordsStrokeWidth:0.1
        }
    }

    let editable;
    let selectedSectionNr;

    //API CALLBACKS
    let onClick = function(){};
    let onClickTitle = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};

    const pentagon = pentagonComponent().withSections(false).withText(false).editable(false);
    let dateIntervalTimer;
    let showDateCount = false;

    //dom
    let containerG;

    function header(selection, options={}) {
        //console.log("profileinfo", height)
        const { transitionEnter=true, transitionUpdate=true } = options;

        // expression elements
        selection.each(function (data) {
            updateDimns(data);
            containerG = d3.select(this);
            //update
            update(data);
        })

        function update(data){
            const { id, firstname, surname, age, position, isCurrent, isFuture, settings, personType } = data;

            const contentsG = containerG.selectAll("g.info-contents").data([data])
            contentsG.enter()
                .append("g")
                    .attr("class", "info-contents")
                    .each(function(data,i){
                        const contentsG = d3.select(this);
                        contentsG.append("rect").attr("class", "contents-bg")
                            .attr("fill", "transparent")
                            .attr("opacity", 0.5);
                    })
                    .merge(contentsG)
                    .attr("transform", `translate(${margin.left},${margin.top})`)
                    .each(function(data,i){
                        const contentsG = d3.select(this);
                        contentsG.select("rect.contents-bg")
                            .attr("width", contentsWidth)
                            .attr("height", contentsHeight)

                        //TITLE
                        const titleG = contentsG.selectAll("g.card-title").data([data])
                        titleG.enter()
                            .append("g")
                                .attr("class", "card-title")
                                .each(function(d){
                                    const contentsG = d3.select(this).append("g").attr("class", "title-contents");
                                    contentsG.append("text")
                                            .attr("class", "primary")
                                            .attr("dominant-baseline", "central")
                                            .attr("text-anchor", "middle")
                                            .style("font-family", "helvetica, sans-serifa")
                                            .attr("stroke", grey10(8))
                                            .attr("stroke-width", 0.5)
                                            .attr("fill", grey10(8));

                                    contentsG.append("rect")
                                        .attr("class", "hitbox")
                                        .attr("fill", "transparent")
                                        .attr("stroke", "none");
                                    
                                })
                                .merge(titleG)
                                .attr("transform", `translate(${dateWidth},${0})`)
                                .each(function(d,i){
                                    const contentsG = d3.select(this).select("g.title-contents")
                                        .attr("transform", `translate(${titleMargin.left},${titleMargin.top})`)

                                    contentsG.select("text.primary")
                                        .attr("x", titleContentsWidth/2)
                                        .attr("y", titleContentsHeight/2)
                                        .attr("font-size", titleContentsHeight * 0.5)
                                        .attr("stroke", grey10(7))
                                        .attr("stroke-width", 0.1)
                                        //.attr("fill", d.isFuture ? "grey" : "white")
                                        //.text(d.title || d.id)
                                        .text(truncateIfNecc(d.title, 17) || `Card ${d.cardNr + 1}`)

                                    //hitbox
                                    contentsG.select("rect.hitbox")
                                        .attr("width", titleContentsWidth)
                                        .attr("height", titleContentsHeight)
                                })
                                .on("click", onClickTitle)

                        //TITLE
                        const progressSummaryData = isNumber(selectedSectionNr) ? [] : [data];
                        const progressSummaryG = contentsG.selectAll("g.progress-summary").data(progressSummaryData)
                        progressSummaryG.enter()
                            .append("g")
                                .attr("class", "progress-summary")
                                .call(fadeIn)
                                .each(function(d){
                                    const contentsG = d3.select(this).append("g").attr("class", "summary-contents");

                                    contentsG.append("g").attr("class", "pentagon")
                                    /*
                                    //@todo - info change to trophy when completed all 5
                                     - pros - it creates a sense of reward
                                     - cons - it may interfere with pattern-finding potential eg user can 
                                     quickly look up teh path and see which bits of teh pentagon are ocnsistently
                                     underachiecved. a trophy breaks the pattern
                                    contentsG.append("path")
                                        .attr("d", trophy.pathD)
                                        .attr("transform", styles.trophyTranslate)
                                        .attr("fill", styles.statusFill);*/

                                    d3.select(this)
                                        .append("rect")
                                            .attr("class", "hitbox")
                                            .attr("fill", "transparent")
                                            .attr("stroke", "none");  
                                })
                                .merge(progressSummaryG)
                                .attr("transform", `translate(${dateWidth + titleWidth},${0})`)
                                .each(function(d,i){
                                    const { isFront, isNext, isSecondNext, isSelected, isHeld } = d;
                                    const contentsG = d3.select(this).select("g.summary-contents")
                                        .attr("transform", `translate(${progressSummaryMargin.left},${progressSummaryMargin.top})`);

                                    contentsG.select("g.pentagon")
                                        .attr("transform", `translate(${progressSummaryContentsWidth/2},${progressSummaryContentsHeight/2})`)
                                        .datum(d.itemsData)
                                        .call(pentagon
                                            .r2(d3.min([progressSummaryContentsWidth * 0.5, progressSummaryContentsHeight * 0.5]))
                                            .styles({
                                                _lineStrokeWidth:(itemD) => {
                                                    const { status } = itemD;
                                                    return status === 2 ? 2 : (status === 1 ? 1 : 0.5)
                                                },
                                                _lineStroke:(itemD) => {
                                                    const { status } = itemD;
                                                    if(status === 2){
                                                        return isFront || isSelected ? GOLD : (isNext ? GOLD : GOLD);
                                                    }
                                                    if(status === 1){
                                                        return isFront || isSelected ? grey10(1) : (isNext ? grey10(2) : grey10(3));
                                                    }
                                                    return isFront || isSelected ? grey10(5) : (isNext ? grey10(6) : grey10(7))

                                                }
                                            }))

                                    /*
                                    //@todo - change to trophy when completed all 5
                                    contentsG.select("path") 
                                        .transition("transA")
                                        .delay(300)
                                        .duration(200)
                                            .attr("transform", styles.trophyTranslate);

                                    contentsG.select("path") 
                                        .transition("transB")
                                            .delay(300)
                                            .duration(200)
                                                .attr("fill", styles.statusFill)*/

                                    //hitbox
                                    d3.select(this).select("rect.hitbox")
                                        .attr("width", progressSummaryWidth)
                                        .attr("height", progressSummaryHeight);
                                })
                                
                        progressSummaryG.exit().call(remove)


                        //DATE
                        const format = d3.timeFormat("%_d %b, %y");
                        
                        const dateG = contentsG.selectAll("g.date").data([data])
                        dateG.enter()
                            .append("g")
                                .attr("class", "date date-info")
                                .attr("opacity", showDateCount ? 0 : 1)
                                .each(function(d){
                                    const contentsG = d3.select(this).append("g").attr("class", "date-contents");
                                    contentsG
                                        .append("text")
                                            .attr("class", "primary")
                                            .attr("dominant-baseline", "central")
                                            .attr("text-anchor", "middle")
                                            .style("font-family", "helvetica, sans-serifa");
                                    
                                    d3.select(this)
                                        .append("rect")
                                            .attr("class", "hitbox")
                                            .attr("fill", "transparent")
                                            .attr("stroke", "none");
                                })
                                .merge(dateG)
                                //.attr("transform", d => `translate(${x(d)},${y(d)}) rotate(-45)`) //rotates from start
                                //.attr("pointer-events", showDateCount ? "none" : "all")
                                .each(function(d){
                                    const contentsG = d3.select(this).select("g.date-contents")
                                        .attr("transform", `translate(${dateMargin.left},${dateMargin.top})`)

                                    contentsG.select("text.primary")
                                        .attr("transform", d => `translate(${dateContentsWidth/2},${dateContentsHeight/2}) rotate(-45)`)
                                        .attr("font-size", dateHeight * 0.3)
                                        .attr("stroke", styles.date.stroke)
                                        .attr("stroke-width", styles.date.strokeWidth)
                                        .attr("fill", styles.date.fill)
                                        .text(format(d.date))

                                    d3.select(this).select("rect.hitbox")
                                        .attr("width", dateWidth)
                                        .attr("height", dateHeight)
                                        .on("click", (e,d) => { onClick.call(this, e, d, data, "date") })
                                })

                        dateG.exit().remove();

                        const dateCountG = contentsG.selectAll("g.date-count").data(data.dateCount ? [data.dateCount] : [])
                        dateCountG.enter()
                            .append("g")
                                .attr("class", "date-count date-info")
                                .attr("opacity", showDateCount ? 1 : 0)
                                .each(function(d){
                                    dateIntervalTimer = d3.interval(() => {
                                        showDateCount = !showDateCount;
                                        containerG.select("g.date-count")
                                            .transition()
                                            .duration(1000)
                                            .delay(showDateCount ? 500 : 0)
                                            .attr("opacity", showDateCount ? 1 : 0)
                    
                                        containerG.select("g.date")
                                            .transition()
                                            .duration(1000)
                                            .delay(showDateCount ? 0 : 500)
                                            .attr("opacity", showDateCount && !isCurrent ? 0 : 1)
                                    }, 5000)

                                    d3.select(this).append("text")
                                        .attr("class", "number");

                                    d3.select(this).append("text")
                                        .attr("class", "words")

                                    d3.select(this).selectAll("text")
                                        .attr("dominant-baseline", "central")
                                        .attr("text-anchor", "middle")
                                        .style("font-family", "helvetica, sans-serifa");
                                    
                                    d3.select(this).append("rect").attr("class", "hitbox")
                                        .attr("fill", "transparent")
                                        .attr("stroke", "none")
                                        //.on("click", (e,d) => { onClick.call(this, e, d, data, "date") })
                                })
                                .merge(dateCountG)
                                .attr("transform", d => `translate(${dateMargin.left},${dateMargin.top})`) //rotates from start
                                //.attr("pointer-events", showDateCount ? "all" : "none")
                                .each(function(d){
                                    const width = dateWidth;
                                    const numberHeight = contentsHeight * 0.65;
                                    const wordsHeight = contentsHeight - numberHeight;

                                    const numberFontSize = numberHeight * 0.9;
                                    const wordsFontSize = wordsHeight * 0.9;

                                    const extraShiftUp = 1.5;
                                    const extraGapBetween = 0;// height < 30 ? 5 : 0;

                                    d3.select(this).select("text.number")
                                        .attr("x", width/2)
                                        .attr("y", numberHeight * 0.8 - extraGapBetween/2 - extraShiftUp)
                                        .attr("dominant-baseline", "auto") //line at bottom of text
                                        //.attr("font-size", numberFontSize)
                                        .attr("font-size", numberFontSize)
                                        .attr("fill", styles.dateCount.numberFill)
                                        .attr("stroke", styles.dateCount.numberStroke)
                                        .attr("stroke-width", styles.dateCount.numberStrokeWidth)
                                        //.attr("fill", isFuture ? "grey" : "white")
                                        .text(d => Math.abs(d.value))

                                    d3.select(this).select("text.words")
                                        .attr("x", width/2)
                                        .attr("y", numberHeight + extraGapBetween/2 - extraShiftUp)
                                        .attr("dominant-baseline", "hanging")
                                        .attr("font-size", wordsFontSize)
                                        .attr("fill", styles.dateCount.wordsFill)
                                        .attr("stroke", styles.dateCount.wordsStroke)
                                        .attr("stroke-width", styles.dateCount.wordsStrokeWidth)
                                        //.attr("fill", isFuture ? "grey" : "white")
                                        .text(d => `${d.label} ${d.value < 0 ? "ago" : ""}`)

                                    d3.select(this).select("rect.hitbox")
                                        //@todo - make it accurate which takes into account the height of the date line so we dont have to enlarge by 1.2
                                        .attr("width", width) 
                                        .attr("height", height);

                                })

                        dateCountG.exit()
                            .each(() => {
                                dateIntervalTimer.stop();
                                dateIntervalTimer = null;
                            })
                            .remove();
                    })
                    .on("click", onClick)

        }

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
    header.styles = function (obj) {
        if (!arguments.length) { return styles; }
        const date = obj.date ? { ...styles.date, ...obj.date } : styles.date;
        const dateCount = obj.dateCount ? { ...styles.dateCount, ...obj.dateCount } : styles.dateCount;
        styles = {
            ...styles,
            ...obj,
            date,
            dateCount
        };
        return header;
    };
    header.fontSizes = function (values) {
        if (!arguments.length) { return fontSizes; }
        fontSizes = { ...fontSizes, ...values };
        return header;
    };
    header.editable = function (value) {
        if (!arguments.length) { return editable; }
        editable = value;
        return header;
    };
    header.selectedSectionNr = function (value) {
        if (!arguments.length) { return selectedSectionNr; }
        selectedSectionNr = value;
        return header;
    };
   
    header.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return header;
    };
    header.onClickTitle = function (value) {
        if (!arguments.length) { return onClickTitle; }
        onClickTitle = value;
        return header;
    };
    header.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return header;
    };
    header.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return header;
    };
    return header;
}
