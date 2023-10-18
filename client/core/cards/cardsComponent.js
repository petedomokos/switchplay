import * as d3 from 'd3';
import { DIMNS, grey10, COLOURS, TRANSITIONS } from "./constants";
import dragEnhancements from '../journey/enhancedDragHandler';
import cardHeaderComponent from './cardHeaderComponent';
import cardItemsComponent from './cardItemsComponent';
import { fadeIn, remove } from '../journey/domHelpers';
import { updateTransform } from '../journey/transitionHelpers';
import { icons } from '../../util/icons';
import { isNumber } from '../../data/dataHelpers';


const { GOLD } = COLOURS;

export default function cardsComponent() {
    //API SETTINGS
    // dimensions
    let heldCardWidth = 300;
    let heldCardHeight = 600;
    let margin = { left:3, right: 3, top:2.5, bottom:2.5 }
    let contentsWidth;
    let contentsHeight;
    //non-section view dimns
    let normalContentsWidth;
    let normalContentsHeight;

    let placedCardWidth = 0;
    let placedCardHeight = 0;

    let selectedCardWidth = contentsWidth;
    let selectedCardHeight = contentsHeight;

    let sectionViewHeldCardWidth;
    let sectionViewHeldCardHeight;

    let headerHeight = 30;
    let gapBetweenHeaderAndItems = 0;
    let itemsAreaHeight;

    let itemsOuterRadius;

    function updateDimns(){
        normalContentsWidth = heldCardWidth - margin.left - margin.right;
        normalContentsHeight = heldCardHeight - margin.top - margin.bottom;
        const heldCardWidthToUse = isNumber(selectedSectionNr) ? sectionViewHeldCardWidth : heldCardWidth;
        const heldCardHeightToUse = isNumber(selectedSectionNr) ? sectionViewHeldCardHeight : heldCardHeight;
        contentsWidth = heldCardWidthToUse - margin.left - margin.right;
        contentsHeight = heldCardHeightToUse - margin.top - margin.bottom; 

        itemsAreaHeight = contentsHeight - headerHeight - gapBetweenHeaderAndItems;
    }

    let fontSizes = {
        info:{
            name:9,
            age:11,
            position:8,
            date:7
        }
    };

    let x = (d,i) => 0;
    let y = (d,i) => 0;

    //state
    let deckIsSelected;
    let format = "actual";
    let form;
    let selectedCardNr;
    let selectedItemNr;
    let selectedSectionNr;

    let transformTransition = { 
        enter: null, 
        update: { duration:d => TRANSITIONS.MED,// d.statusChanging ? 200 : 500,
            delay:d => 0,//d => d.statusChanging ? 0 : 100,
            //ease:d3.easeQuadInOut
        } 
    };

    //API CALLBACKS
    let onClickCard = function(){};
    let onClickCardTitle = function(){};
    let onSelectItem = function(){};
    let onUpdateItemStatus = function(){};
    let onPickUp = function(){};
    let onPutDown = function(){};
    let onClickInfo = function(){};

    let onClick = function(){};
    let onDragStart = function() {};
    let onDrag = function() {};
    let onDragEnd = function() {};
    let onLongpressStart = function() {};
    let onLongpressDragged = function() {};
    let onLongpressEnd = function() {};
    let onMouseover = function(){};
    let onMouseout = function(){};

    let enhancedDrag = dragEnhancements();

    //dom
    let containerG;
    //components
    let headerComponents = {};
    let itemsComponents = {};

    function cards(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log=false } = options;
        updateDimns();
        selection.each(function (data) {
            containerG = d3.select(this);
            //can use same enhancements object for outer and inner as click is same for both
            enhancedDrag
                .dragThreshold(100)
                .onLongpressStart(longpressStart)
                .onLongpressDragged(longpressDragged)
                .onLongpressEnd(longpressEnd);

            const drag = d3.drag()
                .on("start", enhancedDrag())
                .on("drag", enhancedDrag(dragged))
                .on("end", enhancedDrag(dragEnd))

            const getCardFill = d => { 
                const { isSelected, isFront, isNext, isSecondNext, status } = d;
                if(isFront || isSelected){ return grey10(3); }
                if(isNext){ return grey10(5); }
                if(isSecondNext){ return "#989898"; }
                return (d.isHeld ? grey10(6) : grey10(8))
            };

            const getProgressStatusFill = d => { 
                const { isSelected, isFront, isNext, isSecondNext, info } = d;
                const { status } = info;

                if(isFront || isSelected){ 
                    return status === 2 ? GOLD : (status === 1 ? grey10(1) : grey10(2)) 
                }
                if(isNext){ 
                    return status === 2 ? GOLD : (status === 1 ? grey10(2) : grey10(4))
                }
                if(isSecondNext){ 
                    return status === 2 ? GOLD : (status === 1 ? grey10(2) : "#B0B0B0") //4.5 
                }
                if(d.isHeld){
                    return status === 2 ? GOLD : (status === 1 ? grey10(2) : grey10(5))
                }
                //its placed
                return status === 2 ? GOLD : (status === 1 ? grey10(2) : grey10(5))
            };

            const getCardStroke = d => {
                if(d.isFront){ return grey10(1); }
                if(d.isNext){ return grey10(2); }
                if(d.isSecondNext){ return grey10(4); }
                return (d.isSelected || d.isHeld ? grey10(5) : grey10(8))
            }

            //bgdrag
            containerG.call(drag);

            const cardG = containerG.selectAll("g.card").data(data, d => d.cardNr);
            cardG.enter()
                //.insert("g", ":first-child")
                .append("g")
                    .attr("class", d => `card card-${d.cardNr}`)
                    .attr("opacity", 1)
                    .each(function(d,i){
                        const { cardNr, isHeld, isSelected } = d;

                        headerComponents[cardNr] = cardHeaderComponent();
                        itemsComponents[cardNr] = cardItemsComponent();

                        //ENTER
                        const contentsG = d3.select(this).append("g").attr("class", "contents card-contents")

                        contentsG
                            .append("rect")
                                .attr("class", "card-bg")
                                .attr("rx", 3)
                                .attr("ry", 3)
                                //for placed cards, we dont want the dimns to be changed when in section view
                                .attr("width", isHeld ? contentsWidth : normalContentsWidth)
                                .attr("height", isHeld ? contentsHeight : normalContentsHeight)
                                .attr("fill", isNumber(selectedSectionNr) ? COLOURS.CARD.SECTION_VIEW_FILL :COLOURS.CARD.FILL(d))
                                .attr("stroke", isNumber(selectedSectionNr) ? COLOURS.CARD.SECTION_VIEW_STROKE : getCardStroke(d))
                                .on("click", e => {
                                    //console.log("card bg click")
                                    onClickCard.call(this, e, d)
                                    e.stopPropagation();
                                })
                        
                        contentsG
                            .append("g")
                                .attr("class", "card-header")
                                //.attr("pointer-events", deckIsSelected & (isHeld || isSelected) ? "all" : "none")
                                .attr("opacity", deckIsSelected & (isHeld || isSelected) ? 1 : 0)
                        
                        contentsG
                            .append("g")
                                .attr("class", "items-area");

                        /*contentsG
                            .append("rect")
                                .attr("class", "card-overlay")
                                .attr("rx", 3)
                                .attr("ry", 3)
                                .attr("stroke", "none")
                                .attr("fill", "transparent")
                                .on("click", onClickCard)*/
                    })
                    .call(updateTransform, { 
                        x, 
                        y,
                        k:d => d.isSelected ? (selectedCardHeight/heldCardHeight) : (d.isHeld ? 1 : placedCardHeight/heldCardHeight),  
                        transition:transformTransition.enter,
                        name:d => `card-pos-${d.id}`,
                        force:true
                    })
                    .merge(cardG)
                    .call(updateTransform, { 
                        x, 
                        y, 
                        k:d => d.isSelected ? (selectedCardHeight/heldCardHeight) : (d.isHeld ? 1 : placedCardHeight/heldCardHeight),
                        transition:transformTransition.update,
                        name:(d,i) => `card-pos-${i}-${d.id}`,
                        force:true
                    })
                    .each(function(cardD,i){
                        const { cardNr, isHeld, isFront, isNext, isSecondNext, isSelected, info, status } = cardD; 
                        const contentsG = d3.select(this).select("g.card-contents")
                            .attr("transform", `translate(${margin.left},${margin.top})`);

                        
                        //bg colour
                        contentsG.select("rect.card-bg")
                            .transition("card-bg-appearance")
                            .delay(200)
                            .duration(400)
                                .attr("fill", isNumber(selectedSectionNr) ? COLOURS.CARD.SECTION_VIEW_FILL :COLOURS.CARD.FILL(cardD))
                                .attr("stroke", isNumber(selectedSectionNr) ? COLOURS.CARD.SECTION_VIEW_STROKE : getCardStroke(cardD))

                        contentsG.select("rect.card-bg")
                            .transition("card-bg-dimns")
                            //.delay(200)
                            .duration(TRANSITIONS.MED)
                                .attr("width", isHeld ? contentsWidth : normalContentsWidth)
                                .attr("height", isHeld ? contentsHeight : normalContentsHeight);
                        
                        //const headerHeight;
                        //components
                        const dateColour = isNumber(selectedSectionNr) ? grey10(5) : grey10(7);
                        const header = headerComponents[cardNr]
                            .width(contentsWidth)
                            .height(headerHeight)
                            .styles({
                                statusFill:() => getProgressStatusFill(cardD),
                                trophyTranslate:isHeld || isSelected ? 
                                    "translate(-3,3) scale(0.25)" : "translate(-45,3) scale(0.6)",
                                date:{ 
                                    fill:dateColour, stroke:dateColour 
                                },
                                dateCount:{
                                    numberFill:dateColour, wordsFill:dateColour,
                                    numberStroke:dateColour, wordsStroke:dateColour
                                }
                            })
                            .fontSizes(fontSizes.info)
                            .onClick(function(e){
                                //console.log("header click ->")
                                onClickCard(e, cardD); 
                            })
                            .onClickTitle(function(e){
                                //console.log("card title click ->")
                                e.stopPropagation(); 
                                onClickCardTitle(cardD) 
                            })
                        
                        const headerDatum = { ...info, itemsData:cardD.items, isSelected, isFront, isNext, isSecondNext, cardNr };
                        contentsG.selectAll("g.card-header")
                            //.attr("pointer-events", deckIsSelected & (isHeld || isSelected) ? "all" : "none")
                            .datum(headerDatum)
                            .call(header)
                                .transition() //hide if small
                                .delay(200)
                                .duration(200)
                                    .attr("opacity", (isHeld || isSelected) ? 1 : 0);

                        //ITEMS
                        
                        //note - deckIsSelected && form is handled in Decks - it turns the entire container pointer-events on/off
                        const cardIsEditable = isNumber(selectedSectionNr) || ((isHeld && isFront) || isSelected);
                        const items = itemsComponents[cardNr]
                            .styles({ 
                                _lineStrokeWidth:lineD => {
                                    if(deckIsSelected){
                                        if(isHeld || isSelected){
                                            return lineD.status === 2 ? 1 : (lineD.status === 1 ? 0.8 : 0.2);
                                        }
                                        return lineD.status === 2 ? 3 : (lineD.status === 1 ? 2 : 0.2)
                                    }
                                    //multiple deck view
                                    if(isHeld || isSelected){
                                        return lineD.status === 2 ? 3 : (lineD.status === 1 ? 3 : 0.2);
                                    }
                                    return lineD.status === 2 ? 3 : (lineD.status === 1 ? 2 : 0.2);
                                    
                                },
                                _lineStroke:(lineD,i) => {
                                    if(isHeld || isSelected){
                                        return lineD.status === 2 ? GOLD : (lineD.status === 1 ? grey10(2) : "#989898")
                                    }
                                    return lineD.status === 2 ? GOLD : (lineD.status === 1 ? grey10(2) : grey10(6))
                                }
                            })
                            .width(contentsWidth)
                            .height(itemsAreaHeight)
                            .withSections(cardIsEditable)
                            .withText(deckIsSelected && (isFront || isSelected))
                            .selectedItemNr(selectedItemNr)
                            .editable(cardIsEditable)
                            .onSetOuterRadius(r => { itemsOuterRadius = r })
                            .onSelectItem(onSelectItem)
                            .onUpdateItemStatus(function(itemNr, newStatus){
                                onUpdateItemStatus(cardNr, itemNr, newStatus);
                            })
                            .onDrag(e => dragged(e, cardD))
                            .onDragEnd(e => dragEnd(e, cardD))

                        contentsG.select("g.items-area")
                            .attr("transform", `translate(0, ${headerHeight + gapBetweenHeaderAndItems})`)
                            .datum(isNumber(selectedSectionNr) ? cardD.items.filter(it => it.sectionNr === selectedSectionNr) : cardD.items)
                            .call(items)

                        //remove items for cards behind
                        const shouldHideItems = isHeld && !isFront && !isSelected;
                        /*contentsG.select("g.items-area")
                            //.attr("pointer-events", shouldHideItems ? "none" : null)
                            .transition("items-trans")
                                .duration(100)
                                .attr("opacity", shouldHideItems ? 0 : 1)*/

                        //btm right btn
                        const expandBtnDatum = { 
                            key:"expand", 
                            onClick:e => { onClickCard(e, cardD);  },
                            icon:icons.expand,
                        }
                        const collapseBtnDatum = { 
                            key:"collapse", 
                            onClick:e => { onClickCard(e, cardD) },
                            icon:icons.collapse,
                        }
                        const botRightBtnData = isNumber(selectedSectionNr) ? [] : (isSelected ? [collapseBtnDatum] : [expandBtnDatum]);
                        const btnHeight = d3.max([1, d3.min([15, 0.12 * normalContentsHeight])]);
                        const btnWidth = btnHeight;
                        //assumme all are square
                        //note: 0.8 is a bodge coz iconsseems to be bigger than they state
                        const scale = d => (0.8 * btnHeight)/d.icon.height;
                        const btnMargin = btnHeight * 0.1;
                        const btnContentsWidth = btnWidth - 2 * btnMargin;
                        const btnContentsHeight = btnHeight - 2 * btnMargin;
                        const botRightBtnG = contentsG.selectAll("g.bottom-right-btn").data(botRightBtnData, d => d.key);
                        botRightBtnG.enter()
                            .append("g")
                                .attr("class", "bottom-right-btn")
                                .call(fadeIn, { transition:{ delay:TRANSITIONS.MED }})
                                .each(function(d){
                                    const btnG = d3.select(this);
                                    btnG.append("path")
                                        .attr("fill", grey10(5));

                                    btnG.append("rect").attr("class", "btn-hitbox")
                                        .attr("fill", "transparent")
                                        //.attr("fill", "red")
                                        .attr("opacity", 0.3)
                                        .attr("stroke", "none")
                                })
                                .merge(botRightBtnG)
                                .attr("transform", `translate(${contentsWidth - btnWidth + btnMargin},${contentsHeight - btnHeight + btnMargin})`)
                                .each(function(d){
                                    const btnG = d3.select(this);
                                    btnG.select("path")
                                        .attr("transform", `scale(${scale(d)})`)
                                        .attr("d", d.icon.d)
                            
                                    btnG.select("rect.btn-hitbox")
                                        .attr("width", btnContentsWidth)
                                        .attr("height", btnContentsHeight)

                                })
                                .on("click", (e,d) => { 
                                    d.onClick(e, d) 
                                });

                        botRightBtnG.exit().remove();

                    })
                    .call(drag)
                    .on("click", e => { 
                        //console.log("card click")
                        e.stopPropagation(); 
                    })
  
            //EXIT
            cardG.exit().call(remove);

            let swipeTriggered = false;
            function dragged(e , d){
                if(d.isSelected){ return; }
                //console.log("card dragged")
                if(swipeTriggered){ return; }
                const swipeDirection = e.dy <= 0 ? "up" : "down";
                const frontCard = data.find(c => c.isFront);

                let cardD;
                if(Array.isArray(d)){
                    //the bg has been dragged, so apply it to the correct card
                    if(swipeDirection === "down"){
                        cardD = frontCard;
                    }else{
                        const nr = d3.max([0, frontCard.cardNr - 1]);
                        cardD = data.find(c => c.cardNr === nr);
                    } 
                }else{
                    //the crad itself has been dragged
                    cardD =d;
                }

                if(swipeDirection === "up" && !cardD.isHeld){ 
                    onPickUp(cardD);
                    swipeTriggered = true;
                }
                if(swipeDirection === "up" && cardD.isHeld){
                    const nr = d3.max([0, frontCard.cardNr - 1]);
                    const cardD = data.find(c => c.cardNr === nr);
                    onPickUp(cardD);
                    swipeTriggered = true;
                }
                if(swipeDirection === "down" && cardD.isHeld){
                    onPutDown(cardD);
                    swipeTriggered = true;
                }
                if(swipeDirection === "down" && !cardD.isHeld){
                    onPutDown(frontCard);
                    swipeTriggered = true;
                }
                //onDrag.call(this, e, d)
            }

            function dragEnd(e, d){
                if(enhancedDrag.isClick()) {
                    return; 
                }
                if(d.isSelected){ return; }
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
    cards.heldCardWidth = function (value) {
        if (!arguments.length) { return heldCardWidth; }
        heldCardWidth = value;
        return cards;
    };
    cards.heldCardHeight = function (value) {
        if (!arguments.length) { return heldCardHeight; }
        heldCardHeight = value;
        return cards;
    };
    cards.headerHeight = function (value) {
        if (!arguments.length) { return headerHeight; }
        headerHeight = value;
        return cards;
    };
    cards.gapBetweenHeaderAndItems = function (value) {
        if (!arguments.length) { return gapBetweenHeaderAndItems; }
        gapBetweenHeaderAndItems = value;
        return cards;
    };
    cards.placedCardWidth = function (value) {
        if (!arguments.length) { return placedCardWidth; }
        placedCardWidth = value;
        return cards;
    };
    cards.placedCardHeight = function (value) {
        if (!arguments.length) { return placedCardHeight; }
        placedCardHeight = value;
        return cards;
    };
    cards.selectedCardWidth = function (value) {
        if (!arguments.length) { return selectedCardWidth; }
        selectedCardWidth = value;
        return cards;
    };
    cards.selectedCardHeight = function (value) {
        if (!arguments.length) { return selectedCardHeight; }
        selectedCardHeight = value;
        return cards;
    };
    cards.sectionViewHeldCardWidth = function (value) {
        if (!arguments.length) { return sectionViewHeldCardWidth; }
        sectionViewHeldCardWidth = value;
        return cards;
    };
    cards.sectionViewHeldCardHeight = function (value) {
        if (!arguments.length) { return sectionViewHeldCardHeight; }
        sectionViewHeldCardHeight = value;
        return cards;
    };
    cards.itemsOuterRadius = function (value) {
        if (!arguments.length) { return itemsOuterRadius; }
        itemsOuterRadius = value;
        return cards;
    };
    cards.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = value;
        return cards;
    };
    cards.x = function (func) {
        if (!arguments.length) { return x; }
        x = func;
        return cards;
    };
    cards.y = function (func) {
        if (!arguments.length) { return y; }
        y = func;
        return cards;
    };
    cards.kpiHeight = function (value) {
        if (!arguments.length) { return fixedKpiHeight; }
        kpiHeight = value;
        return cards;
    };
    cards.fontSizes = function (values) {
        if (!arguments.length) { return fontSizes; }
        fontSizes = { ...fontSizes, ...values };
        return cards;
    };
    cards.deckIsSelected = function (value) {
        if (!arguments.length) { return deckIsSelected; }
        deckIsSelected = value;
        return cards;
    };
    cards.form = function (value) {
        if (!arguments.length) { return form; }
        form = value;
        return cards;
    };
    cards.selectedCardNr = function (value) {
        if (!arguments.length) { return selectedCardNr; }
        if(isNumber(value) && selectedCardNr !== value){
            //select
        }
        if(value === "" && selectedCardNr !== ""){
            //deselect
        }
        selectedCardNr = value;
        return cards;
    };
    cards.selectedItemNr = function (value) {
        if (!arguments.length) { return selectedItemNr; }
        if(isNumber(value) && selectedItemNr !== value){
            //select
        }
        if(value === "" && selectedItemNr !== ""){
            //deselect
        }
        selectedItemNr = value;
        return cards;
    };
    cards.selectedSectionNr = function (value) {
        if (!arguments.length) { return selectedSectionNr; }
        selectedSectionNr = value;
        Object.values(headerComponents).forEach(headerComponent => {
            headerComponent.selectedSectionNr(value);
        })
        Object.values(itemsComponents).forEach(itemsComponent => {
            itemsComponent.selectedSectionNr(value);
        })
        return cards;
    };
    cards.format = function (value) {
        if (!arguments.length) { return format; }
        format = value;
        return cards;
    };
    cards.transformTransition = function (value) {
        if (!arguments.length) { return transformTransition; }
        transformTransition = { 
            enter:value.enter,// || transformTransition.enter,
            update:value.update// || transformTransition.update
        }
        return cards;
    };
    cards.yScale = function (value, key) {
        if (!arguments.length) { return yScale; }
        yScale = value;
        if(key) { yKey = key; }
        calcY = y => typeof d.y === "number" ? d.y : yScale(d[yKey]);

        return cards;
    };
    cards.xScale = function (value, key) {
        if (!arguments.length) { return xScale; }
        xScale = value;
        if(key) { xKey = key; }
        calcX = x => typeof d.x === "number" ? d.x : xScale(d[xKey]);

        return cards;
    };
    cards.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return cards;
    };
    cards.onClickCard = function (value) {
        if (!arguments.length) { return onClickCard; }
        onClickCard = value;
        return cards;
    };
    cards.onClickCardTitle = function (value) {
        if (!arguments.length) { return onClickCardTitle; }
        onClickCardTitle = value;
        return cards;
    };
    cards.onSelectItem = function (value) {
        if (!arguments.length) { return onSelectItem; }
        onSelectItem = value;
        return cards;
    };
    cards.onUpdateItemStatus = function (value) {
        if (!arguments.length) { return onUpdateItemStatus; }
        onUpdateItemStatus = value;
        return cards;
    };
    cards.onPickUp = function (value) {
        if (!arguments.length) { return onPickUp; }
        onPickUp = value;
        return cards;
    };
    cards.onPutDown = function (value) {
        if (!arguments.length) { return onPutDown; }
        onPutDown = value;
        return cards;
    };
    cards.onClickInfo = function (value) {
        if (!arguments.length) { return onClickInfo; }
        onClickInfo = value;
        return cards;
    };
    cards.onDragStart = function (value) {
        if (!arguments.length) { return onDragStart; }
        if(typeof value === "function"){
            onDragStart = value;
        }
        return cards;
    };
    cards.onDrag = function (value) {
        if (!arguments.length) { return onDrag; }
        if(typeof value === "function"){
            onDrag = value;
        }
        return cards;
    };
    cards.onDragEnd = function (value) {
        if (!arguments.length) { return onDragEnd; }
        if(typeof value === "function"){
            onDragEnd = value;
        }
        return cards;
    };
    cards.onLongpressStart = function (value) {
        if (!arguments.length) { return onLongpressStart; }
        if(typeof value === "function"){
            onLongpressStart = value;
        }
        return cards;
    };
    cards.onLongpressDragged = function (value) {
        if (!arguments.length) { return onLongpressDragged; }
        if(typeof value === "function"){
            onLongpressDragged = value;
        }
        return cards;
    };
    cards.onLongpressEnd = function (value) {
        if (!arguments.length) { return onLongpressEnd; }
        if(typeof value === "function"){
            onLongpressEnd = value;
        }
        return cards;
    };
    cards.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return cards;
    };
    cards.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return cards;
    };
    return cards;
}
