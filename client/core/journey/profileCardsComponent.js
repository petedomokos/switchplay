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

    let placedCardWidth = 0;
    let placedCardHeight = 0;

    let selectedCardWidth = width;
    let selectedCardHeight = height;

    //next - make info height smaller, adn add an extra margin between info and items
    //then make info height reduce, or it just disappears altogether, if card is sufficiently smalled eg placed
    //we dont need an info component in this case
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

    let transformTransition = { 
        enter: null, 
        update: { duration:d => d.statusChanging ? 200 : 500,
            delay:d => d.statusChanging ? 0 : 100,
            ease:d3.easeQuadInOut
        } 
    };

    //API CALLBACKS
    let onClick = function(){};
    let onPickUp = function(){};
    let onPutDown = function(){};

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
                .dragThreshold(100)
                .onDblClick(onDblClick)
                .onClick(onClick)
                .onLongpressStart(longpressStart)
                .onLongpressDragged(longpressDragged)
                .onLongpressEnd(longpressEnd);

            const drag = editable ? () => {} : d3.drag()
                .on("start", enhancedDrag(dragStart))
                .on("drag", enhancedDrag(dragged))
                .on("end", enhancedDrag(dragEnd))
            
            containerG.selectAll("g.cards")

            const cardG = containerG.selectAll("g.card").data(data, d => d.id);
            cardG.enter()
                //.insert("g", ":first-child")
                .append("g")
                    .attr("class", d => `card card-${d.id}`)
                    .attr("opacity", 1)
                    .each(function(d,i){
                        cardInfoComponents[d.id] = profileInfoComponent();
                        cardItemsComponents[d.id] = cardItemsComponent();
                        //ENTER
                        const contentsG = d3.select(this)
                            .append("g")
                                .attr("class", "contents card-contents")
                        //contentsG
                            //.attr("transform", `scale(${d.isHeld ? 1 : placedCardHeight/height})`)

                        contentsG
                            .append("rect")
                                .attr("class", "card-bg")
                                .attr("rx", 3)
                                .attr("ry", 3)
                                .attr("stroke", "white")
                                .attr("fill", grey10(4))// "transparent")//d.id === selected ? COLOURS.selectedMilestone : COLOURS.milestone)

                        contentsG.append("g").attr("class", "info")
                        contentsG.append("g").attr("class", "items-area")
    
                    })
                    .call(updateTransform, { 
                        x, 
                        y,
                        k:d => d.isSelected ? (selectedCardHeight/height) : (d.isHeld ? 1 : placedCardHeight/height),  
                        transition:transformTransition.enter
                    })
                    .merge(cardG)
                    .call(updateTransform, { 
                        x, 
                        y, 
                        k:d => d.isSelected ? (selectedCardHeight/height) : (d.isHeld ? 1 : placedCardHeight/height),
                        transition:transformTransition.update 
                    })
                    .each(function(d,i){
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
                        contentsG.select("rect.card-bg")
                            .attr("width", contentsWidth)
                            .attr("height", contentsHeight)

                        contentsG.selectAll("g.info")
                            .datum(d.info)
                            .call(cardInfo);

                        const itemsData = [{}, {}, {}, {}, {}];
                        contentsG.select("g.items-area")
                            .attr("transform", `translate(0, ${infoHeight})`)
                            .datum(itemsData)
                            .call(cardItems)
                    })
                    .call(drag)
                    /*
                    .on("click", function(e,d){
                        //raise

                        //move to centre and enlarge ie transform translate and scale


                        onClick.call(this, e, d);
                        return;

                        //and then clicking can enlarge the active front card to take over whole cardsArea,
                        //going over the placedcards and the stacked cards behind it

                        //then, move date to top-right, and put nrs 1 to 5 in top-left

                        //design idea - remove the squares from the chain, instead just have words at teh right angles and
                        //positions to make the pentagon. could even make different shape, ro a letter eg S for success,
                        
                    })*/

            //EXIT
            cardG.exit().call(remove);

            function dragStart(e , d){
                console.log("ds")
                //onDragStart.call(this, e, d)
            }
            let swipeTriggered = false;
            function dragged(e , d){
                if(swipeTriggered){ return; }
                if(e.dy <= 0 && !d.isHeld){ 
                    onPickUp(d);
                    swipeTriggered = true;
                }
                if(e.dy >= 0 && d.isHeld){
                    onPutDown(d);
                    swipeTriggered = true;
                }
                //onDrag.call(this, e, d)
            }

            function dragEnd(e, d){
                if(enhancedDrag.isClick()) { return; }
                //reset
                swipeTriggered = false;
                //onDragEnd.call(this, e, d);
            }

            //DELETION
            let deleted = false;
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
    profileCards.placedCardWidth = function (value) {
        if (!arguments.length) { return placedCardWidth; }
        placedCardWidth = value;
        return profileCards;
    };
    profileCards.placedCardHeight = function (value) {
        if (!arguments.length) { return placedCardHeight; }
        placedCardHeight = value;
        return profileCards;
    };
    profileCards.selectedCardWidth = function (value) {
        if (!arguments.length) { return selectedCardWidth; }
        selectedCardWidth = value;
        return profileCards;
    };
    profileCards.selectedCardHeight = function (value) {
        if (!arguments.length) { return selectedCardHeight; }
        selectedCardHeight = value;
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
    profileCards.onPickUp = function (value) {
        if (!arguments.length) { return onPickUp; }
        onPickUp = value;
        return profileCards;
    };
    profileCards.onPutDown = function (value) {
        if (!arguments.length) { return onPutDown; }
        onPutDown = value;
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
