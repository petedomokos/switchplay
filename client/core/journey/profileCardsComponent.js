import * as d3 from 'd3';
import { DIMNS, grey10, COLOURS, PROFILE_PAGES, OVERLAY, TRANSITIONS } from "./constants";
import dragEnhancements from './enhancedDragHandler';
// import menuComponent from './menuComponent';
import profileInfoComponent from './profileInfoComponent';
import cardItemsComponent from './cardItemsComponent';
import { Oscillator, remove } from './domHelpers';
import { getTransformationFromTrans } from './helpers';
import { updateTransform } from './transitionHelpers';
const noop = () => {};

const CONTENT_FADE_DURATION = TRANSITIONS.KPI.FADE.DURATION;
const AUTO_SCROLL_DURATION = TRANSITIONS.KPIS.AUTO_SCROLL.DURATION;

export default function profileCardsComponent() {
    //API SETTINGS
    // dimensions
    let width = DIMNS.profile.width * 1.2;
    let height = DIMNS.profile.height * 1.2;
    let margin = { top:0, bottom: 0, left:0, right:0 }
    let contentsWidth;
    let contentsHeight;
    const infoHeight = 80;
    let itemsAreaHeight;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
        itemsAreaHeight = contentsHeight - infoHeight;
    }

    let fontSizes = {
        info:{
            name:9,
            age:11,
            position:8,
            date:5
        },
        kpis:{
            name:9,
            values:9,
            ctrls:8
        }
    };

    let ctrls = () => ({
        topLeft: [],
        topRight: [],
        botLeft: [],
        botRight: [],
    });

    let x = (d,i) => 0;
    let y = (d,i) => 0;

    //state
    let kpiFormat = "actual";
    let expanded = [];
    let selected = "";
    let selectedKpiKey = "";
    let editable = false;
    let movable = true;
    let scrollable = false;
    let currentPage = PROFILE_PAGES[0];

    let transformTransition = { enter: null, update: null };

    //API CALLBACKS
    let onClick = function(){};
    let onCtrlClick = () => {};
    let onClickKpi = () => {};
    let onDblClickKpi = function(){};

    let onDblClick = function(){};
    let onDragStart = function() {};
    let onDrag = function() {};
    let onDragEnd = function() {};
    let onLongpressStart = function() {};
    let onLongpressDragged = function() {};
    let onLongpressEnd = function() {};
    let onMouseover = function(){};
    let onMouseout = function(){};
    let onDelete = function() {};
    let onSaveValue = function(){};
    let onUpdateSelectedKpi = function(){};

    let onCreateStep = function(){};
    let onEditStep = function(){};
    let onUpdateStep = function(){};
    let onUpdateSteps = function(){};
    let onDeleteStep = function(){};


    let onClickInfo = function(){};

    let enhancedDrag = dragEnhancements();
    //@todo - find out why k=1.05 makes such a big increase in size
    let oscillator = Oscillator({k:1});

    let longpressed;

    //dom
    let containerG;
    //components
    let cardInfoComponents = {};
    let cardItemsComponents = {};

    function profileCards(selection, options={}) {
        //check the height of info, make smaller if necc and create a bottom bar, so the pentagon is in centre
        const { transitionEnter=true, transitionUpdate=true, log=false } = options;
        updateDimns();
        selection.each(function (data) {
            containerG = d3.select(this);
            //can use same enhancements object for outer and inner as click is same for both
            enhancedDrag
                .onDblClick(onDblClick)
                .onClick(onClick)
                .onLongpressStart(longpressStart)
                .onLongpressDragged(longpressDragged)
                .onLongpressEnd(longpressEnd);

            const drag = editable ? () => {} : d3.drag()
                .on("start", enhancedDrag(dragStart))
                .on("drag", enhancedDrag(dragged))
                .on("end", enhancedDrag(dragEnd))

            const cardG = containerG.selectAll("g.card").data(data, d => d.id);
            cardG.enter()
                .insert("g", ":first-child")
                    .attr("class", d => `card card-${d.id}`)
                    .each(function(d,i){
                        //console.log("enter card", i, d)
                        cardInfoComponents[d.id] = profileInfoComponent();
                        cardItemsComponents[d.id] = cardItemsComponent();
                        //ENTER
                        const contentsG = d3.select(this)
                            .append("g")
                                .attr("class", "contents card-contents")

                        contentsG
                            .append("rect")
                                .attr("class", "card-bg")
                                .attr("rx", 3)
                                .attr("ry", 3)
                                .attr("stroke", "white")
                                .attr("fill", grey10(4))// "transparent")//d.id === selected ? COLOURS.selectedMilestone : COLOURS.milestone)

                        contentsG.append("g").attr("class", "info")
                        contentsG.append("g").attr("class", "items-area")

                        contentsG.append("g").attr("class", "top-right-ctrls")
    
                    })
                    .call(updateTransform, { x, y, transition:transformTransition.enter })
                    .merge(cardG)
                    .call(updateTransform, { x, y, transition:transformTransition.update })
                    .each(function(d,i){
                        //console.log("update", d.id)
                        //components
                        const cardInfo = cardInfoComponents[d.id]
                            .currentPage(currentPage)
                            .width(contentsWidth)
                            .height(infoHeight)
                            .fontSizes(fontSizes.info)
                            .editable(editable)
                            .onClick(onClickInfo)

                        const cardItems = cardItemsComponents[d.id]
                            .width(contentsWidth)
                            .height(itemsAreaHeight)
                    
                        const contentsG = d3.select(this).select("g.card-contents")
                            //.attr("transform", d =>  `translate(${-contentsWidth/2},${-contentsHeight/2})`)
                        
                        contentsG.select("rect.card-bg")
                            .attr("width", contentsWidth)
                            .attr("height", contentsHeight)

                        contentsG.selectAll("g.info")
                            .datum(d.info)
                            .call(cardInfo);

                        const itemsData = [{}, {}, {}, {}, {}];
                        if(i === 0){
                            contentsG.select("g.items-area")
                                .attr("transform", `translate(0, ${infoHeight})`)
                                .datum(itemsData)
                                .call(cardItems)
                        }


                        //top right ctrls (dependent on each card)
                        let btnWidth = 25;
                        let btnHeight = 25;

                        const topRightBtnG = contentsG.select("g.top-right-ctrls")
                            .attr("transform", `translate(${contentsWidth}, ${0})`)
                            .selectAll("g.top-right-btn")
                            .data(ctrls(d).topRight, b => b.label)
                    
                        topRightBtnG.enter()
                            .append("g")
                                .attr("class", "top-right-btn")
                                .each(function(b){
                                    d3.select(this)
                                        .append("rect")
                                            .attr("fill", "transparent");

                                    d3.select(this)
                                        .append("path")
                                            .attr("transform", b.icon.transform || null)
                                            .attr("fill", COLOURS.btnIcons.default)
                                            .attr("stroke", COLOURS.btnIcons.default)
                                })
                                .merge(topRightBtnG)
                                .attr("transform", (b,i) => `translate(${-(i + 1) * btnWidth})`)
                                .each(function(b){
                                    d3.select(this).select("rect")
                                        .attr("x", -20)
                                        .attr("width", btnWidth + 20)
                                        .attr("height", btnHeight + 20);

                                    d3.select(this).select("path")
                                        .attr("transform", `translate(${selected === d.id ? -7.5 : -15},10)`)
                                        .attr("d", b.icon.d)
                                })
                                .style("cursor", "pointer")
                                .on("click",(e,b) => { if(b.onClick){ b.onClick(b)} })
                                .on("mouseover", (e,b) => { if(b.onMouseover){ b.onMouseover(b)} })
                                .on("mouseout", (e,b) => { if(b.onMouseout){ b.onMouseout(b)} })

                        topRightBtnG.exit().remove(); 



                    })

            //EXIT
            cardG.exit().call(remove);

            function dragStart(e , d){
                if(movable){
                    d3.select(this).raise();
                }
                onDragStart.call(this, e, d)
            }
            function dragged(e , d){
                onDrag.call(this, e, d)
            }
    
            //note: newX and Y should be stored as d.x and d.y
            function dragEnd(e, d){
                if(enhancedDrag.isClick()) { return; }
    
                onDragEnd.call(this, e, d);
            }

            //DELETION
            let deleted = false;
            const svg = d3.select("svg");

            //longpress
            function longpressStart(e, d) {
                onLongpressStart.call(this, e, d)
            };
            function longpressDragged(e, d) {
                if(deleted) { return; }
                onLongpressDragged.call(this, e, d)
            };

            function longpressEnd(e, d) {
                if(deleted){ 
                    deleted = false;
                    return; 
                }
                onLongpressEnd.call(this, e, d)
            };
        })

        return selection;
    }
    
    //api
    profileCards.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return profileCards;
    };
    profileCards.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return profileCards;
    };
    profileCards.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = value;
        return profileCards;
    };
    profileCards.x = function (func) {
        if (!arguments.length) { return x; }
        x = func;
        return profileCards;
    };
    profileCards.y = function (func) {
        if (!arguments.length) { return y; }
        y = func;
        return profileCards;
    };
    profileCards.kpiHeight = function (value) {
        if (!arguments.length) { return fixedKpiHeight; }
        kpiHeight = value;
        return profileCards;
    };
    profileCards.fontSizes = function (values) {
        if (!arguments.length) { return fontSizes; }
        fontSizes = { ...fontSizes, ...values };
        return profileCards;
    };
    profileCards.currentPage = function (value) {
        if (!arguments.length) { return currentPage; }
        currentPage = value;
        return profileCards;
    };
    profileCards.expanded = function (value) {
        if (!arguments.length) { return expanded; }
        expanded = value;
        return profileCards;
    };
    profileCards.editable = function (value) {
        if (!arguments.length) { return editable; }
        editable = value;
        return profileCards;
    };
    profileCards.scrollable = function (value) {
        if (!arguments.length) { return scrollable; }
        scrollable = value;
        return profileCards;
    };
    profileCards.movable = function (value) {
        if (!arguments.length) { return movable; }
        movable = value;
        return profileCards;
    };
    profileCards.selected = function (value) {
        //console.log("profileCards selected....", value)
        if (!arguments.length) { return selected; }
        selected = value;
        return profileCards;
    };
    profileCards.kpiFormat = function (value) {
        if (!arguments.length) { return kpiFormat; }
        kpiFormat = value;
        return profileCards;
    };
    profileCards.ctrls = function (f) {
        if (!arguments.length) { return ctrls; }
        ctrls = d => {
            const _ctrls = f(d);
            return {
                topLeft:_ctrls.topleft || [],
                topRight:_ctrls.topRight || [],
                botLeft:_ctrls.botleft || [],
                botRight:_ctrls.botRight || [],
            }
        }
        return profileCards;
    };
    profileCards.longpressed = function (value) {
        if (!arguments.length) { return longpressed; }
        longpressed = value;
        return profileCards;
    };
    profileCards.transformTransition = function (value) {
        if (!arguments.length) { return transformTransition; }
        //console.log("setting trans...", value)
        transformTransition = { 
            enter:value.enter,// || transformTransition.enter,
            update:value.update// || transformTransition.update
        }
        //console.log("Trans is now", transformTransition)
        return profileCards;
    };
    profileCards.yScale = function (value, key) {
        if (!arguments.length) { return yScale; }
        yScale = value;
        if(key) { yKey = key; }
        calcY = y => typeof d.y === "number" ? d.y : yScale(d[yKey]);

        return profileCards;
    };
    profileCards.xScale = function (value, key) {
        if (!arguments.length) { return xScale; }
        xScale = value;
        if(key) { xKey = key; }
        calcX = x => typeof d.x === "number" ? d.x : xScale(d[xKey]);

        return profileCards;
    };
    profileCards.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return profileCards;
    };
    profileCards.onClickInfo = function (value) {
        if (!arguments.length) { return onClickInfo; }
        onClickInfo = value;
        return profileCards;
    };
    profileCards.onClickKpi = function (value) {
        if (!arguments.length) { return onClickKpi; }
        if(typeof value === "function"){
            onClickKpi = value;
        }
        return profileCards;
    };
    profileCards.onDblClickKpi = function (value) {
        if (!arguments.length) { return onDblClickKpi; }
        onDblClickKpi = value;
        return profileCards;
    };
    profileCards.onCtrlClick = function (value) {
        if (!arguments.length) { return onCtrlClick; }
        onCtrlClick = value;
        return profileCards;
    };
    profileCards.onDblClick = function (value) {
        if (!arguments.length) { return onDblClick; }
        onDblClick = value;
        return profileCards;
    };
    profileCards.onDragStart = function (value) {
        if (!arguments.length) { return onDragStart; }
        if(typeof value === "function"){
            onDragStart = value;
        }
        return profileCards;
    };
    profileCards.onDrag = function (value) {
        if (!arguments.length) { return onDrag; }
        if(typeof value === "function"){
            onDrag = value;
        }
        return profileCards;
    };
    profileCards.onDragEnd = function (value) {
        if (!arguments.length) { return onDragEnd; }
        if(typeof value === "function"){
            onDragEnd = value;
        }
        return profileCards;
    };
    profileCards.onLongpressStart = function (value) {
        if (!arguments.length) { return onLongpressStart; }
        if(typeof value === "function"){
            onLongpressStart = value;
        }
        return profileCards;
    };
    profileCards.onLongpressDragged = function (value) {
        if (!arguments.length) { return onLongpressDragged; }
        if(typeof value === "function"){
            onLongpressDragged = value;
        }
        return profileCards;
    };
    profileCards.onLongpressEnd = function (value) {
        if (!arguments.length) { return onLongpressEnd; }
        if(typeof value === "function"){
            onLongpressEnd = value;
        }
        return profileCards;
    };
    profileCards.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return profileCards;
    };
    profileCards.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return profileCards;
    };
    profileCards.onMilestoneWrapperPseudoDragStart = function (value) {
        if (!arguments.length) { return onMilestoneWrapperPseudoDragStart; }
        if(typeof value === "function"){
            onMilestoneWrapperPseudoDragStart = value;
        }
        return profileCards;
    };
    profileCards.onMilestoneWrapperPseudoDrag = function (value) {
        if (!arguments.length) { return onMilestoneWrapperPseudoDrag; }
        if(typeof value === "function"){
            onMilestoneWrapperPseudoDrag = value;
        }
        return profileCards;
    };
    profileCards.onMilestoneWrapperPseudoDragEnd = function (value) {
        if (!arguments.length) { return onMilestoneWrapperPseudoDragEnd; }
        if(typeof value === "function"){
            onMilestoneWrapperPseudoDragEnd = value;
        }
        return profileCards;
    };
    profileCards.onDelete = function (value) {
        if (!arguments.length) { return onDelete; }
        if(typeof value === "function"){
            onDelete = value;
        }
        return profileCards;
    };
    profileCards.onAddLink = function (value) {
        if (!arguments.length) { return onAddLink; }
        if(typeof value === "function"){ onAddLink = value; }
        return profileCards;
    };
    profileCards.onSaveValue = function (value) {
        if(typeof value === "function"){
            onSaveValue = value;
        }
        return profileCards;
    };
    profileCards.onStartEditingPhotoTransform = function (value) {
        if(typeof value === "function"){
            onStartEditingPhotoTransform = value;
        }
        return profileCards;
    };
    profileCards.onEndEditingPhotoTransform = function (value) {
        if(typeof value === "function"){
            onEndEditingPhotoTransform = value;
        }
        return profileCards;
    };
    profileCards.onSetEditing = function (value) {
        if (!arguments.length) { return onSetEditing; }
        if(typeof value === "function"){
            onSetEditing = value;
        }
        return profileCards;
    };
    profileCards.onUpdateSelectedKpi = function (value) {
        if(typeof value === "function"){
            onUpdateSelectedKpi = value;
        }
        return profileCards;
    };
    profileCards.onCreateStep = function (value) {
        if (!arguments.length) { return onCreateStep; }
        onCreateStep = value;
        return profileCards;
    };
    profileCards.onEditStep = function (value) {
        if(typeof value === "function"){
            onEditStep = value;
        }
        return profileCards;
    };
    profileCards.onUpdateStep = function (value) {
        if (!arguments.length) { return onUpdateStep; }
        onUpdateStep = value;
        return profileCards;
    };
    profileCards.onUpdateSteps = function (value) {
        if (!arguments.length) { return onUpdateSteps; }
        onUpdateSteps = value;
        return profileCards;
    };
    profileCards.onDeleteStep = function (value) {
        if (!arguments.length) { return onDeleteStep; }
        onDeleteStep = value;
        return profileCards;
    };
    profileCards.applyOverlay = function(selection, options={}){
        const { include, onClick=() => {} } = options;
        selection.selectAll("rect.overlay")
            .filter(function(){
                if(!include){ return true; }
                const className = d3.select(this).attr("class");
                let shouldInclude = false;
                include.forEach(nameToInclude => {
                    if(className.includes(nameToInclude)){
                        shouldInclude = true;
                    }
                })
                return shouldInclude;
            })
            .attr("display", null)
            .on("click", onClick)
    }
    profileCards.removeOverlay = function(selection, include){
        selection.selectAll("rect.overlay").attr("display", "none");
    }
    profileCards.endEditing = function(milestoneId){
        profileInfoComponents[milestoneId].endEditing();
    }
    return profileCards;
}
