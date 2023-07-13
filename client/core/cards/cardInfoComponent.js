import * as d3 from 'd3';
import { DIMNS, grey10, OVERLAY, COLOURS } from "./constants";
import { trophy } from "../../../assets/icons/milestoneIcons.js"
import pentagonComponent from './pentagonComponent';

const { GOLD } = COLOURS;

/*

*/
export default function profileInfoComponent() {
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
        margin = { left:width * 0.05, right:width * 0.05, top:height * 0.05, bottom: height * 0.05 }
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        /*dateWidth = 30;
        dateHeight = height;
        //use margin to make it a square for exact diagonal, so build up the other way 
        const dateMarginHoriz = 3;
        dateContentsWidth = dateWidth - dateMarginHoriz * 2;
        dateContentsHeight = dateContentsWidth;
        const dateMarginVert = (dateHeight - dateContentsHeight) / 2;
        dateMargin = { left: dateMarginHoriz, top:dateMarginVert }*/
        dateHeight = contentsHeight;
        dateWidth = dateHeight;
        const dateMarginValue = dateHeight * 0.05;
        //use margin to make it a square for exact diagonal, so build up the other way 
        dateMargin = { left: dateMarginValue, top:dateMarginValue }
        dateContentsWidth = dateWidth - dateMarginValue * 2;
        dateContentsHeight = dateContentsWidth;

        progressSummaryHeight = contentsHeight;
        progressSummaryWidth = progressSummaryHeight;
        progressSummaryHeight = contentsHeight;
        progressSummaryMargin = { left: 3, right:3, top:height * 0.1, bottom:height * 0.1 };
        progressSummaryContentsWidth = progressSummaryWidth - progressSummaryMargin.left - progressSummaryMargin.right;
        progressSummaryContentsHeight = progressSummaryHeight - progressSummaryMargin.top - progressSummaryMargin.bottom;

        titleHeight = contentsHeight;
        titleWidth = contentsWidth - dateWidth - progressSummaryWidth;
        titleMargin = { left: 10, right:10, top:height * 0.1, bottom:height * 0.1 }
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
        trophyTranslate:`translate(-3,3) scale(0.25)`
    }

    let editable;

    //API CALLBACKS
    let onClick = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};

    const pentagon = pentagonComponent();
    //let enhancedDrag = dragEnhancements();
    let dateIntervalTimer;
    let showDateCount = false;

    //dom
    let containerG;

    function profileInfo(selection, options={}) {
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
                                            .attr("stroke", grey10(7))
                                            .attr("stroke-width", 0.5)
                                            .attr("fill", grey10(7));

                                    d3.select(this).append("rect")
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
                                        .attr("font-size", titleContentsHeight * 0.4)
                                        //.attr("fill", d.isFuture ? "grey" : "white")
                                        //.text(d.title || d.id)
                                        .text(d.title || `Card ${cardNr + 1}`)

                                    //hitbox
                                    d3.select(this).select("rect.hitbox")
                                        .attr("width", titleWidth)
                                        .attr("height", titleHeight)
                                        //.on("click", (e,d) => { onClick.call(this, e, d, data, "date") })
                                })

                        //TITLE
                        const progressSummaryG = contentsG.selectAll("g.progress-summary").data([data])
                        progressSummaryG.enter()
                            .append("g")
                                .attr("class", "progress-summary")
                                .each(function(d){
                                    const contentsG = d3.select(this).append("g").attr("class", "summary-contents");

                                    contentsG.append("g").attr("class", "pentagon")
                                    /*
                                    //@todo - change to trophy when completed all 5
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
                                            .withSections(false)
                                            .editable(false)
                                            .styles({
                                                _lineStrokeWidth:(itemD) => {
                                                    const { status } = itemD;
                                                    return status === 2 ? 4 : (status === 1 ? 2 : 1)
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


                        //DATE

                        const format = d3.timeFormat("%_d %b, %y");
                        //const nrChars = formattedDate => formattedDate[0] === " " ? formattedDate.length - 1 : formattedDate.length;
                        //todo- make a pseudo text element and use getComputerTxtlngth, instead of this bodge to make TODAY work
                        //const calcLength = (text, fontSize, isUpperCase=false) =>  nrChars(text) * fontSize * (isUpperCase ? 0.7 : 0.47);
                        /*const length = d => {
                            const text = d.isCurrent ? currentValueDataMethod.selectedLabel() : format(d.date);
                            return calcLength(text, fontSizes.date, d.isCurrent);
                        }*/
                        //date dimns
                        //const horizandVertLength = d => length(d) * Math.sin(Math.PI/4);
                        //const x = d => dateMargin + horizandVertLength(d)/2;
                        //const y = d => dateMargin + horizandVertLength(d)/2;
                        //datCount dimns
                        //const horizandVertLengthOfDateCount = d => calcLength(d.label, fontSizes.date, false) * Math.sin(Math.PI/4);
                        
                        //settings are only defined for current card
                        //const currentValueDataMethod = settings?.find(s => s.key === "currentValueDataMethod");
                        
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
                                            .style("font-family", "helvetica, sans-serifa")
                                            .attr("stroke", grey10(7))
                                            .attr("stroke-width", 0.5)
                                            .attr("fill", grey10(7))
                                    
                                    d3.select(this)
                                        .append("rect")
                                            .attr("class", "hitbox")
                                            .attr("fill", "transparent")
                                            .attr("stroke", "none");
                                })
                                .merge(dateG)
                                //.attr("transform", d => `translate(${x(d)},${y(d)}) rotate(-45)`) //rotates from start
                                .attr("pointer-events", showDateCount ? "none" : "all")
                                .each(function(d){
                                    const contentsG = d3.select(this).select("g.date-contents")
                                        .attr("transform", `translate(${dateMargin.left},${dateMargin.top})`)

                                    contentsG.select("text.primary")
                                        .attr("transform", d => `translate(${dateContentsWidth/2},${dateContentsHeight/2}) rotate(-45)`)
                                        .attr("font-size", dateHeight * 0.15)
                                        .text(format(d.date))

                                    d3.select(this).select("rect.hitbox")
                                        .attr("width", dateWidth)
                                        .attr("height", dateHeight)
                                        .on("click", (e,d) => { onClick.call(this, e, d, data, "date") })
                                })

                        dateG.exit().remove();

                        /*
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
                                        .style("font-family", "helvetica, sans-serifa")
                                        .attr("stroke", grey10(7))
                                        .attr("stroke-width", 0.5)
                                        .attr("fill", grey10(7))
                                    
                                    d3.select(this).append("rect").attr("class", "hitbox")
                                        .attr("fill", "transparent")
                                        .on("click", (e,d) => { onClick.call(this, e, d, data, "date") })
                                })
                                .merge(dateCountG)
                                .attr("transform", d => `translate(${dateMargin},${dateMargin})`) //rotates from start
                                .attr("pointer-events", showDateCount ? "all" : "none")
                                .each(function(d){
                                    const width = horizandVertLengthOfDateCount(d) * 1.25;
                                    const height = width;
                                    const margin = { top: height * 0.1, bottom: height * 0.3 }
                                    const contentsHeight = height - margin.top - margin.bottom;
                                    const numberHeight = contentsHeight * 0.75;
                                    const wordsHeight = contentsHeight - numberHeight;

                                    const numberFontSize = d3.min([20, fontSizes.date * 1.5]);
                                    const wordsFontSize = numberFontSize * 0.75;

                                    const extraGap = 8;

                                    d3.select(this).select("text.number")
                                        .attr("x", width/2)
                                        .attr("y", margin.top + numberHeight / 2)
                                        .attr("font-size", numberFontSize)
                                        //.attr("fill", isFuture ? "grey" : "white")
                                        .text(d => Math.abs(d.value))

                                    d3.select(this).select("text.words")
                                        .attr("x", width/2)
                                        .attr("y", margin.top + numberHeight + wordsHeight / 2 + extraGap)
                                        .attr("font-size", wordsFontSize)
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

                        */
                    })
                    .on("click", function(e,d){ onClick.call(this, e, d)})

        }

        return selection;
    }
    
    //api
    profileInfo.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return profileInfo;
    };
    profileInfo.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return profileInfo;
    };
    profileInfo.styles = function (obj) {
        if (!arguments.length) { return styles; }
        styles = {
            ...styles,
            ...obj,
        };
        return profileInfo;
    };
    profileInfo.fontSizes = function (values) {
        if (!arguments.length) { return fontSizes; }
        fontSizes = { ...fontSizes, ...values };
        return profileInfo;
    };
    profileInfo.editable = function (value) {
        if (!arguments.length) { return editable; }
        editable = value;
        return profileInfo;
    };
   
    profileInfo.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return profileInfo;
    };
    profileInfo.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return profileInfo;
    };
    profileInfo.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return profileInfo;
    };
    return profileInfo;
}
