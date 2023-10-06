import * as d3 from 'd3';
import { DIMNS, grey10, COLOURS, TRANSITIONS } from "./constants";
import dragEnhancements from '../journey/enhancedDragHandler';
import cardHeaderComponent from './cardHeaderComponent';
import cardItemsComponent from './cardItemsComponent';
import { remove } from '../journey/domHelpers';
import { updateTransform } from '../journey/transitionHelpers';
import { icons } from '../../util/icons';

const { GOLD } = COLOURS;

export default function cardsComponent() {
    //API SETTINGS
    // dimensions
    let width = 300;
    let height = 600;
    let margin = { left:3, right: 3, top:10, bottom:0 }
    let contentsWidth;
    let contentsHeight;

    let placedCardWidth = 0;
    let placedCardHeight = 0;

    let selectedCardWidth = contentsWidth;
    let selectedCardHeight = contentsHeight;

    let infoHeight = 30;
    let gapBetweenInfoAndItems;
    let bottomBarHeight = 0
    let itemsAreaHeight;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom; 
        gapBetweenInfoAndItems = 0;
        bottomBarHeight = 0;
        itemsAreaHeight = contentsHeight - infoHeight - gapBetweenInfoAndItems - bottomBarHeight;
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

    let transformTransition = { 
        enter: null, 
        update: { duration:d => TRANSITIONS.MED,// d.statusChanging ? 200 : 500,
            delay:d => 0,//d => d.statusChanging ? 0 : 100,
            //ease:d3.easeQuadInOut
        } 
    };

    //API CALLBACKS
    let onClickCard = function(){};
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
        //check the height of info, make smaller if necc and create a bottom bar, so the pentagon is in centre
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
                                .attr("width", contentsWidth)
                                .attr("height", contentsHeight)
                                .attr("stroke", getCardStroke(d))
                                .attr("fill", getCardFill(d))
                                .on("click", e => {
                                    console.log("card bg click...do nothing")
                                    e.stopPropagation();
                                })
                        
                        contentsG
                            .append("g")
                                .attr("class", "card-header")
                                .attr("pointer-events", deckIsSelected & (isHeld || isSelected) ? "all" : "none")
                                .attr("opacity", deckIsSelected & (isHeld || isSelected) ? 1 : 0)
                        
                        contentsG
                            .append("g")
                                .attr("class", "items-area")
                                    .append("rect")
                                        .attr("class", "items-area-bg")
                                        .attr("fill", "blue");

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
                        k:d => d.isSelected ? (selectedCardHeight/height) : (d.isHeld ? 1 : placedCardHeight/height),  
                        transition:transformTransition.enter,
                        name:d => `card-pos-${d.id}`,
                        force:true
                    })
                    .merge(cardG)
                    .call(updateTransform, { 
                        x, 
                        y, 
                        k:d => d.isSelected ? (selectedCardHeight/height) : (d.isHeld ? 1 : placedCardHeight/height),
                        transition:transformTransition.update,
                        name:(d,i) => `card-pos-${i}-${d.id}`,
                        force:true
                    })
                    .each(function(cardD,i){
                        const { cardNr, isHeld, isFront, isNext, isSecondNext, isSelected, info, status } = cardD; 
                        const contentsG = d3.select(this).select("g.card-contents")
                            .attr("transform", `translate(${margin.left},${margin.top})`);
                        
                        /*contentsG.select("rect.card-overlay")
                            .attr("width", contentsWidth)
                            .attr("height", contentsHeight)
                            .attr("display", deckIsSelected ? "none" : null)*/

                        
                        //bg colour
                        contentsG.select("rect.card-bg")
                            .transition("card-bg-appearance")
                            .delay(200)
                            .duration(400)
                                .attr("fill", getCardFill(cardD))
                                .attr("stroke", getCardStroke(cardD))

                        contentsG.select("rect.card-bg")
                            .transition("card-bg-dimns")
                            //.delay(200)
                            .duration(TRANSITIONS.MED)
                                .attr("width", contentsWidth)
                                .attr("height", contentsHeight)
                        
                        //const infoHeight;
                        //components
                        const header = headerComponents[cardNr]
                            .width(contentsWidth)
                            .height(infoHeight)
                            .styles({
                                statusFill:() => getProgressStatusFill(cardD),
                                trophyTranslate:isHeld || isSelected ? 
                                    "translate(-3,3) scale(0.25)" : "translate(-45,3) scale(0.6)"
                            })
                            .fontSizes(fontSizes.info)
                            .onClick(function(e){
                                onClickCard(e, cardD); 
                            })
                        
                        const headerDatum = { ...info, itemsData:cardD.items, isSelected, isFront, isNext, isSecondNext, cardNr };
                        contentsG.selectAll("g.card-header")
                            .attr("pointer-events", deckIsSelected & (isHeld || isSelected) ? "all" : "none")
                            .datum(headerDatum)
                            .call(header)
                                .transition() //hide if small
                                .delay(200)
                                .duration(200)
                                    .attr("opacity", /*deckIsSelected &*/ (isHeld || isSelected) ? 1 : 0);

                        //ITEMS
                        const cardIsEditable = (isHeld && isFront) || isSelected;

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
                            .editable(cardIsEditable)
                            .onSelectItem(onSelectItem)
                            .onUpdateItemStatus(function(itemNr, newStatus){
                                onUpdateItemStatus(cardNr, itemNr, newStatus);
                            })
                            .onDrag(e => dragged(e, cardD))
                            .onDragEnd(e => dragEnd(e, cardD))

                        contentsG.select("g.items-area")
                            .attr("transform", `translate(0, ${infoHeight + gapBetweenInfoAndItems})`)
                            .datum(cardD.items)
                            .call(items)

                        //remove items for cards behind
                        const shouldHideItems = isHeld && !isFront && !isSelected;
                        contentsG.select("g.items-area")
                            .attr("pointer-events", shouldHideItems ? "none" : null)
                            .transition("items-trans")
                                .duration(100)
                                .attr("opacity", shouldHideItems ? 0 : 1)
                        
                        contentsG.select("rect.items-area-bg")
                            .attr("width", contentsWidth)
                            .attr("height", itemsAreaHeight)
                            .attr("fill", "none");

                        //btm right btn
                        const expandBtnDatum = { 
                            key:"expand", 
                            onClick:e => { onClickCard(e, cardD);  },
                            icon:icons.expand,
                            shouldDisplay:!isSelected
                        }
                        const collapseBtnDatum = { 
                            key:"expand", 
                            onClick:e => { onClickCard(e, cardD) },
                            icon:icons.collapse,
                            shouldDisplay:isSelected
                        }
                        const botRightBtnData = [collapseBtnDatum, expandBtnDatum];
                        const btnHeight = d3.max([1, d3.min([15, 0.12 * contentsHeight])]);
                        const btnWidth = btnHeight;
                        //assumme all are square
                        //note: 0.8 is a bodge coz iconsseems to be bigger than they state
                        const scale = d => (0.8 * btnHeight)/d.icon.height;
                        const btnMargin = btnHeight * 0.1;
                        const btnContentsWidth = btnWidth - 2 * btnMargin;
                        const btnContentsHeight = btnHeight - 2 * btnMargin;
                        const botRightBtnG = contentsG.selectAll("g.bottom-right-btn").data(botRightBtnData);
                        botRightBtnG.enter()
                            .append("g")
                                .attr("class", "bottom-right-btn")
                                .attr("opacity", d => d.shouldDisplay ? 1 : 0)
                                .attr("pointer-events",d => d.shouldDisplay ? "all" : "none")
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
                                    //visibility
                                    btnG
                                        .transition()
                                        .duration(TRANSITIONS.MED)
                                            .attr("opacity", d.shouldDisplay ? 1 : 0);

                                    btnG.select("path")
                                        .attr("transform", `scale(${scale(d)})`)
                                        .attr("d", d.icon.d)
                            
                                    btnG.select("rect.btn-hitbox")
                                        .attr("width", btnContentsWidth)
                                        .attr("height", btnContentsHeight)

                                })
                                .on("click", (e,d) => d.onClick(e, d));

                        botRightBtnG.exit().remove();

                    })
                    .call(drag)
                    .on("click", e => { e.stopPropagation(); })
  
            //EXIT
            cardG.exit().call(remove);

            let swipeTriggered = false;
            function dragged(e , d){
                console.log("card dragged")
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
    cards.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return cards;
    };
    cards.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return cards;
    };
    cards.infoHeight = function (value) {
        if (!arguments.length) { return infoHeight; }
        infoHeight = value;
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
