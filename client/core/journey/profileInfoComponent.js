import * as d3 from 'd3';
import { DIMNS } from "./constants";
//import dragEnhancements from './enhancedDragHandler';

/*

*/
export default function profileInfoComponent() {
    //API SETTINGS
    // dimensions
    let width = DIMNS.profile.width;
    let height = DIMNS.profile.height / 2;
    let photoHeight;
    let textInfoHeight;

    function updateDimns(){
        photoHeight = height * 0.8;
        textInfoHeight = height * 0.2;
    }

    let fontSizes = {
        name:9,
        age:11,
        position:8,
        date:8
    };

    let editable;

    //API CALLBACKS
    let onClick = function(){};
    let onDblClick = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};

    //let enhancedDrag = dragEnhancements();
    let dateIntervalTimer;
    let showDateCount = false;

    //dom
    let containerG;

    function profileInfo(selection, options={}) {
        //console.log("profileinfo", height)
        updateDimns();
        const { transitionEnter=true, transitionUpdate=true } = options;
        // expression elements
        selection.each(function (data) {
            //console.log("profileInfo data", data)
            const { firstname, surname, age, position, photos, isCurrent, isFuture, settings } = data;
            containerG = d3.select(this);
            //can use same enhancements object for outer and inner as click is same for both
            /*
            enhancedDrag
                .onDblClick(onDblClick)
                .onClick(onClick);

            const drag = d3.drag()
                .on("start", enhancedDrag())
                .on("drag", enhancedDrag())
                .on("end", enhancedDrag());*/

            // todo - append photo, name, age, pos
            //helper
            const photoUrl = d => (`/players/${firstname}_${surname}/${d.label}.png`).toLowerCase();
            const photosG = containerG.selectAll("g.photos").data(photos, d => d.label);
            photosG.enter()
                .append("g")
                    .attr("class", "photos")
                    .each(function(d){
                        d3.select(this)
                            .insert("image","text")
                            .attr("xlink:href", photoUrl(d)) 
                    })
                    .merge(photosG)
                    .each(function(d){
                        d3.select(this).select("image")  
                            .attr("width", width)
                            //.attr("height", photoHeight)

                    })
                    .on("click", (e,d) => { onClick.call(this, e, d, data, "photo") })
                    .on("contextmenu", (e) => { 
                        console.log("photo contextmenu event")
                        e.preventDefault(); 
                    })

            const format = d3.timeFormat("%_d %b, %y");

            const dateMargin = 10;
            //const fDate = format(data.date);
            //if its a single digit day, then remove first space
            const nrChars = fDate => fDate[0] === " " ? fDate.length - 1 : fDate.length;
            //todo- make a pseudo text element and use getComputerTxtlngth, instead of this bodge to make TODAY work
            const calcLength = (text, fontSize, isUpperCase=false) =>  nrChars(text) * fontSize * (isUpperCase ? 0.7 : 0.47);
            const length = d => calcLength((d.isCurrent ? currentValueDataMethod.selectedLabel() : format(d.date)), fontSizes.date, d.isCurrent);
            const dateHeight = fontSizes.date;
            const horizandVertLength = d => length(d) * Math.sin(Math.PI/4);
            const x = d => dateMargin + horizandVertLength(d)/2;
            const y = d => dateMargin + horizandVertLength(d)/2
            
            //settings are only defined for current card
            const currentValueDataMethod = settings?.find(s => s.key === "currentValueDataMethod");
            
            const dateG = containerG.selectAll("g.date").data([data])
            dateG.enter()
                .append("g")
                    .attr("class", "date date-info")
                    .attr("opacity", showDateCount ? 0 : 1)
                    .each(function(d){
                        d3.select(this)
                            .append("text")
                                .attr("class", "primary")
                                .attr("dominant-baseline", "hanging")
                                .attr("text-anchor", "middle")
                                .style("font-family", "helvetica, sans-serifa")

                        d3.select(this)
                            .append("text")
                                .attr("class", "secondary")
                                .attr("dominant-baseline", "hanging")
                                .attr("text-anchor", "middle")
                                .style("font-family", "helvetica, sans-serifa")
                        
                        d3.select(this)
                                .append("rect")
                                    .attr("class", "hitbox")
                                    .attr("fill", "transparent");
                    })
                    .merge(dateG)
                    .attr("transform", d => `translate(${x(d)},${y(d)}) rotate(-45)`) //rotates from start
                    .attr("pointer-events", showDateCount ? "none" : "all")
                    .each(function(d){
                        d3.select(this).select("text.primary")
                            .attr("font-size", fontSizes.date)
                            .attr("fill", d.isFuture ? "grey" : "white")
                            .text(d.isCurrent ? currentValueDataMethod.selectedLabel() : format(d.date))

                        d3.select(this).select("text.secondary")
                            .attr("y", dateHeight * 1.2)
                            .attr("font-size", fontSizes.date * 0.8)
                            .attr("fill", d.isFuture ? "grey" : "white")
                            .text(d.specificDate ? format(d.specificDate) : "")

                        d3.select(this).select("rect.hitbox")
                            .attr("x", -length(d)/2)
                            .attr("width", length(d))
                            .attr("height", dateHeight * 2.1)
                            .on("click", (e,d) => { onClick.call(this, e, d, data, "date") })
                    })

            dateG.exit().remove();

            const dateCountG = containerG.selectAll("g.date-count").data(data.dateCount ? [data.dateCount] : [])
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
                        
                        d3.select(this).append("rect").attr("class", "hitbox")
                            .attr("fill", "transparent")
                            .on("click", (e,d) => { onClick.call(this, e, d, data, "date") })
                    })
                    .merge(dateCountG)
                    .attr("transform", d => `translate(${dateMargin},${dateMargin})`) //rotates from start
                    .attr("pointer-events", showDateCount ? "all" : "none")
                    .each(function(d){
                        const width = horizandVertLength(d) * 1.25;
                        const height = width;
                        const margin = { top: height * 0.1, bottom: height * 0.3 }
                        const contentsHeight = height - margin.top - margin.bottom;
                        const numberHeight = contentsHeight * 0.75;
                        const wordsHeight = contentsHeight - numberHeight;

                        const numberFontSize = d3.min([20, fontSizes.date * 1.5]);
                        const wordsFontSize = numberFontSize * 0.5;

                        d3.select(this).select("text.number")
                            .attr("x", width/2)
                            .attr("y", margin.top + numberHeight / 2)
                            .attr("font-size", numberFontSize)
                            .attr("fill", isFuture ? "grey" : "white")
                            .text(d => Math.abs(d.value))

                        d3.select(this).select("text.words")
                            .attr("x", width/2)
                            .attr("y", margin.top + numberHeight + wordsHeight / 2)
                            .attr("font-size", wordsFontSize)
                            .attr("fill", isFuture ? "grey" : "white")
                            .text(d => `${d.label} ${d.value < 0 ? "ago" : "to go"}`)

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

            const textInfoG = containerG.selectAll("g.text-info").data([data]);
            textInfoG.enter()
                .append("g")
                    .attr("class", "text-info")
                    .each(function(d){
    
                        const textInfoG = d3.select(this);

                        textInfoG.append("rect")
                            .attr("class", "bg")
                            .attr("fill", "black");

                        //NAME
                        const nameG = textInfoG.append("g").attr("class", "name");
                        nameG.append("text").attr("class", "first-name")
                        nameG.append("text").attr("class", "surname");

                        nameG.selectAll("text")
                            .attr("dominant-baseline", "central")
                            .attr("stroke", "white")
                            .attr("stroke-width", 0.5)
                            .style("font-family", "impact, sans-serifa")
                            .attr("fill", "white");

                        //OTHER TEXT: AGE AND POSITION
                        const otherTextInfoG = textInfoG.append("g").attr("class", "other-text-info");
                        otherTextInfoG.append("text").attr("class", "age")
                            .attr("font-size", fontSizes.age)
                            .style("font-family", "impact, sans-serifa");

                        otherTextInfoG.append("text").attr("class", "position")
                            .attr("font-size", fontSizes.position)
                            .style("font-family", "helvetica, sans-serifa");

                        otherTextInfoG.selectAll("text")
                            .attr("dominant-baseline", "central")
                            .attr("text-anchor", "middle")
                            .attr("stroke", "white")
                            .attr("stroke-width", 0.5)
                            .attr("fill", "white");
                        


                        textInfoG.append("line").attr("class", "divider")
                            .attr("stroke", "white");

                    })
                    .merge(textInfoG)
                    .attr("transform", `translate(0, ${photoHeight})`)
                    .each(function(d){
                        const maxNrLetters = d3.max([d.firstname, d.surname], d => d.length);
                        const marginReductionPerLetter = 0.02;
                        const marginReduction = marginReductionPerLetter * maxNrLetters;
                        //@todo - do this based on name length so its centred
                        const textMargin = { 
                            left: width * (0.3 - marginReduction), 
                            right: width * (0.3 - marginReduction),
                        };

                        const textInfoG = d3.select(this);
                        textInfoG.select("rect.bg")
                            .attr("width", width)
                            .attr("height", textInfoHeight);

                        const nameG = textInfoG.select("g.name")
                            .attr("transform", `translate(${textMargin.left},0)`) //move to middle of name area
                        
                        nameG.select("text.first-name")
                            .attr("transform", `translate(0, ${textInfoHeight * 0.33})`)
                            .text(d.firstname?.toUpperCase() || "FIRST NAME");
                        
                        nameG.select("text.surname")
                            .attr("transform", `translate(0, ${textInfoHeight * 0.67})`)
                            .text(d.surname?.toUpperCase() || "SURNAME");
                        
                        nameG.selectAll("text")
                            .attr("font-size", fontSizes.name);
                        
                        //OTHER: AGE, POSITION
                        const otherTextInfoG = textInfoG.select("g.other-text-info")
                            .attr("transform", "translate("+width * 0.75 +",0)");
                            

                        otherTextInfoG.select("text.age")
                            .attr("transform", `translate(0, ${textInfoHeight * 0.33})`)
                            .attr("font-size", fontSizes.age)
                            .text("23");

                        otherTextInfoG.select("text.position")
                            .attr("transform", `translate(0, ${textInfoHeight * 0.67})`)
                            .attr("font-size", fontSizes.position)
                            .text("midfield");;

                        textInfoG.select("line.divider")
                            .attr("transform", `translate(${width/2},0)`)
                            .attr("y2", textInfoHeight);

                    })

        })

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
    profileInfo.onDblClick = function (value) {
        if (!arguments.length) { return onDblClick; }
        onDblClick = value;
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
