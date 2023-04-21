import * as d3 from 'd3';
import { DIMNS, PROFILE_PAGES, grey10, OVERLAY } from "./constants";
import container from './kpis/kpi/container';
import dragEnhancements from './enhancedDragHandler';

/*

*/
export default function profileInfoComponent() {
    //API SETTINGS
    // dimensions
    let width = DIMNS.profile.width;
    let height = DIMNS.profile.height / 2;
    let topBorderHeight;
    let bottomBorderHeight;
    let textInfoHeight;
    let photoHeight;

    function updateDimns(data){
        //console.log("data", data)
        const borderHeight = d3.max([45, height * 0.2]);
        topBorderHeight = 0;// data.isCurrent || currentPage.key === "profile" ? borderHeight : 0;
        bottomBorderHeight = data.isCurrent || currentPage.key === "profile" ? borderHeight : 0;// topBorderHeight * 0.3;
        textInfoHeight = bottomBorderHeight;
        photoHeight = height - topBorderHeight - bottomBorderHeight;
    }

    let fontSizes = {
        name:9,
        age:11,
        position:8,
        date:8
    };

    let editable;
    let beingEdited = "";
    let initZoomApplied = false;

    //API CALLBACKS
    let onClick = function(){};
    let onDblClick = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};
    let onStartEditingPhotoTransform = function(){};
    let onEndEditingPhotoTransform = function(){};

    let onMilestoneWrapperPseudoDragStart = function(){};
    let onMilestoneWrapperPseudoDrag = function(){};
    let onMilestoneWrapperPseudoDragEnd = function(){};

    //let enhancedDrag = dragEnhancements();
    let dateIntervalTimer;
    let showDateCount = false;
    let currentPage = PROFILE_PAGES[0];

    //dom
    let containerG;
    /*
    decide how user can change the main photo
    (ideally, user should be able to have a different photo under current card for each path, but thats later)

    refactor the way photos Data is created, both in hydrateUser and in Journey, so that each profile has a ne-item array
    just as now, except the label in the item is the photoLabel of that profile, not always main

    we also want some kind of carousel or gallery option for user to select a different photolabel for eahc profile

    if user does this on current, then it updates the photo that is stored in "main" I think
    Otherwise need a way to store photoLabel for current = could just store it on top level of Journey

    */

    const photoZoom = d3.zoom();
    const photoDrag = d3.drag();
    const enhancedDrag = dragEnhancements();
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
            const { id, firstname, surname, age, position, isCurrent, isFuture, settings } = data;
            const photosData = isCurrent ? data.photos["profile"] : data.photos[currentPage.key];

            const bgRect = containerG.selectAll("rect.info-bg").data([1]);
            bgRect.enter()
                .append("rect")
                    .attr("class", "info-bg")
                    .merge(bgRect)
                    .attr("width", width)
                    .attr("height", height)
                    .attr("fill", currentPage.key === "goal" && !isCurrent ? "none" : "black")
                    .attr("rx", 3)
                    .attr("ry", 3)
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
            //todo next - new url

            //const photoUrl = d => (`/users/${firstname}_${surname}/${d.label}.png`).toLowerCase();

            //next - try a clipPath over the image
            //also, longpress at bottom of kpiscoponent to create a new kpi
            //and target completion
            const photoG = containerG.selectAll("g.photo").data(photosData);
            photoG.enter()
                .append("g")
                    .attr("class", "photo")
                    .each(function(d){
                        d3.select("svg#milestones-bar").select('defs')
                            .append('clipPath')
                                .attr('id', `photo-clip-${id}`)
                                    .append('rect');
                            
                        d3.select(this)
                            .insert("image","text");
                        
                        d3.select(this)
                            .attr('clip-path', `url(#photo-clip-${id})`)

                        d3.select(this).append("rect")
                            .attr('class', "photo-border")
                    })
                    .merge(photoG)
                    .attr("transform", d => `translate(0, ${topBorderHeight})`)
                    .each(function(d){
                        d3.select("svg#milestones-bar").select(`#photo-clip-${id}`)
                            .select("rect")
                                .attr("width", width)
                                .attr("height", photoHeight)

                        d3.select(this).select("rect.photo-border")
                            .attr("width", width)
                            .attr("height", photoHeight)
                            .attr("fill", "none")
                            .attr("stroke", beingEdited === "photo" ? "orange" : "none")
                            .attr("stroke-width", 5)

                        const img = d3.select(this).select("image")  
                            //.attr("width", width)
                            .attr("xlink:href", d.url)
                            //.attr("height", photoHeight)

                        //console.log("actual w h", img.attr("width"), img.attr("height"))
                    })
                    //.on("click", (e,d) => {
                        //console.log("native photo click")
                        //const locationKey = isCurrent ? "profile" : currentPage.key;
                        //onClick.call(this, e, d, data, "photo", locationKey) 
                    //})
                    .on("contextmenu", (e) => { 
                        //console.log("photo contextmenu event")
                        e.preventDefault(); 
                    })
                    .call(photoDrag)
                    .call(photoZoom);
        
            photoZoom.on("zoom", function(e, d){
                
                if(beingEdited !== "photo"){ return; }
                //origin is centre otherwise if its based on sourceEvent it jumps
        
                //const cX = width/2;
                //const cY = photoHeight/2;
                const { x, y, k } = e.transform;
                d3.select(this).select("image")
                    //.attr("transform-origin",`${cX} ${cY}`)
                    .attr("transform", `translate(${x},${y}) scale(${k})`)

                //todo - apply transfrorm in same way as below and see if this means teh transfrom objkect is correct
                //when saving at the end in milestonesBarComponent
            })
            //init zoom
            //for now, we just assume there is only one photo
            if(!initZoomApplied){
                beingEdited = "photo";
                const { x=0, y=0, k=1 } = photosData[0];
                const identity = d3.zoomIdentity;
                const requiredTransformState = identity.translate(x, y).scale(k);
                containerG.select("g.photo").call(photoZoom.transform, requiredTransformState)
                //flags
                beingEdited = "";
                initZoomApplied = true;
            }


            enhancedDrag
                .onClick((e,d) => {
                    const locationKey = isCurrent ? "profile" : currentPage.key;
                    onClick.call(this, e, d, data, "photo", locationKey) 
                })
                .onLongpressStart(startEditing);

            function startEditing(){
                onStartEditingPhotoTransform(id, currentPage.key);
                beingEdited = "photo";
                update(data);
            }
            //todo - make this available via api
            function endEditing(){
                //shouldnt call parent if its being triggered from the parent
                onEndEditingPhotoTransform(id, currentPage.key);
                beingEdited = "";
                update(data);
            }


            photoDrag
                .on("start", enhancedDrag(function(e, d){
                    if(!beingEdited){
                        onMilestoneWrapperPseudoDragStart.call(this, e, d);
                        return;
                    }
                }))
                .on("drag", enhancedDrag(function(e, d){
                    if(!beingEdited){
                        onMilestoneWrapperPseudoDrag.call(this, e, d)
                        return;
                    }
                    if(beingEdited === "photo"){
                        const transformState = d3.zoomTransform(this);
                        //console.log("transformState", transformState)
                        //need to divide to undo the scale effect to keep the drag effect consistent
                        const { k } = transformState;
                        const newTransformState = transformState.translate(e.dx/k, e.dy/k);
                        d3.select(this)
                            .call(photoZoom.transform, newTransformState)
                    }
                }))
                .on("end", enhancedDrag(function(e, d){
                    if(!beingEdited){
                        onMilestoneWrapperPseudoDragEnd.call(this, e, d)
                        return;
                    }
                }))

            photoG.exit().remove();

            const format = d3.timeFormat("%_d %b, %y");

            const dateMargin = 10;
            //const fDate = format(data.date);
            //if its a single digit day, then remove first space

            //Next: I changed setting to use latest datapointm nd now this line below causes a bug
            //also, manually changing teh setting by oressing btn doesnt work anymore!!
            const nrChars = formattedDate => formattedDate[0] === " " ? formattedDate.length - 1 : formattedDate.length;
            //todo- make a pseudo text element and use getComputerTxtlngth, instead of this bodge to make TODAY work
            const calcLength = (text, fontSize, isUpperCase=false) =>  nrChars(text) * fontSize * (isUpperCase ? 0.7 : 0.47);
            const length = d => {
                const text = d.isCurrent ? currentValueDataMethod.selectedLabel() : format(d.date);
                return calcLength(text, fontSizes.date, d.isCurrent);
            }
            //date dimns
            const dateHeight = fontSizes.date;
            const horizandVertLength = d => length(d) * Math.sin(Math.PI/4);
            const x = d => dateMargin + horizandVertLength(d)/2;
            const y = d => dateMargin + horizandVertLength(d)/2;
            //datCount dimns
            const horizandVertLengthOfDateCount = d => calcLength(d.label, fontSizes.date, false) * Math.sin(Math.PI/4);
            
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


                        d3.select(this).selectAll("text")
                            .attr("stroke","black")// grey10(5))
                            .attr("stroke-width", 0.5)
                            .attr("fill", grey10(5))
                        
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
                            //.attr("fill", d.isFuture ? "grey" : "white")
                            .text(d.isCurrent ? currentValueDataMethod.selectedLabel() : format(d.date))

                        d3.select(this).select("text.secondary")
                            .attr("y", dateHeight * 1.2)
                            .attr("font-size", fontSizes.date * 0.8)
                            //.attr("fill", d.isFuture ? "grey" : "white")
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
                            .attr("stroke", "black")// grey10(5))
                            .attr("stroke-width", 0.5)
                            .attr("fill", grey10(5))
                        
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

            const textInfoG = containerG.selectAll("g.text-info").data(currentPage.key === "goal" && !isCurrent ? [] : [data]);
            textInfoG.enter()
                .append("g")
                    .attr("class", "text-info")
                    .each(function(d){
                        const textInfoG = d3.select(this);

                        textInfoG.append("rect")
                            .attr("class", "text-info-bg")
                            .attr("fill", "black")
                            .attr("rx", 3)
                            .attr("ry", 3);

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

                        textInfoG.append("rect")
                            .attr("class", "text-info-overlay")
                            .style("fill", OVERLAY.FILL)
                            .style("opacity", OVERLAY.OPACITY)
                            .attr("display", "none")
                            .attr("rx", 3)
                            .attr("ry", 3)
                            .on("click", endEditing);

                    })
                    .merge(textInfoG)
                    .attr("transform", d => `translate(0, ${topBorderHeight + photoHeight})`)
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
                        textInfoG.select("rect.text-info-bg")
                            .attr("width", width)
                            .attr("height", textInfoHeight);
                        
                        textInfoG.select("rect.text-info-overlay")
                            .attr("width", width)
                            .attr("height", textInfoHeight)
                            .attr("display", beingEdited && beingEdited !== "text" ? null : "none");

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
                            .attr("font-size", age ? fontSizes.age : fontSizes.age * 0.7)
                            .text(age || "Age Unknown");

                        otherTextInfoG.select("text.position")
                            .attr("transform", `translate(0, ${textInfoHeight * 0.67})`)
                            .attr("font-size", fontSizes.position)
                            .text("midfield");;

                        textInfoG.select("line.divider")
                            .attr("transform", `translate(${width/2},0)`)
                            .attr("y2", textInfoHeight);

                    })

            textInfoG.exit().remove();

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
    profileInfo.fontSizes = function (values) {
        if (!arguments.length) { return fontSizes; }
        fontSizes = { ...fontSizes, ...values };
        return profileInfo;
    };
    profileInfo.currentPage = function (value) {
        if (!arguments.length) { return currentPage; }
        currentPage = value;
        initZoomApplied = false;
        return profileInfo;
    };
    profileInfo.editable = function (value) {
        if (!arguments.length) { return editable; }
        editable = value;
        return profileInfo;
    };
    profileInfo.onStartEditingPhotoTransform = function (value) {
        if(typeof value === "function"){
            onStartEditingPhotoTransform = value;
        }
        return profileInfo;
    };
    profileInfo.onEndEditingPhotoTransform = function (value) {
        if(typeof value === "function"){
            onEndEditingPhotoTransform = value;
        }
        return profileInfo;
    };
    profileInfo.onMilestoneWrapperPseudoDragStart = function (value) {
        if (!arguments.length) { return onMilestoneWrapperPseudoDragStart; }
        if(typeof value === "function"){
            onMilestoneWrapperPseudoDragStart = value;
        }
        return profileInfo;
    };
    profileInfo.onMilestoneWrapperPseudoDrag = function (value) {
        if (!arguments.length) { return onMilestoneWrapperPseudoDrag; }
        if(typeof value === "function"){
            onMilestoneWrapperPseudoDrag = value;
        }
        return profileInfo;
    };
    profileInfo.onMilestoneWrapperPseudoDragEnd = function (value) {
        if (!arguments.length) { return onMilestoneWrapperPseudoDragEnd; }
        if(typeof value === "function"){
            onMilestoneWrapperPseudoDragEnd = value;
        }
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
    profileInfo.endEditing = function (){
        beingEdited = "";
        containerG.call(profileInfo)
    }
    return profileInfo;
}
