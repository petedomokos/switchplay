import * as d3 from 'd3';
import { DIMNS, grey10, COLOURS } from "./constants";
import dragEnhancements from '../journey/enhancedDragHandler';
import cardInfoComponent from './cardInfoComponent';
import cardItemsComponent from './cardItemsComponent';
import { remove } from '../journey/domHelpers';
import { updateTransform } from '../journey/transitionHelpers';

const { GOLD } = COLOURS;

export default function cardStackComponent() {
    //API SETTINGS
    // dimensions
    let width = 300;
    let height = 600;

    let placedCardWidth = 0;
    let placedCardHeight = 0;

    let selectedCardWidth = width;
    let selectedCardHeight = height;

    let infoHeight = 30;
    let spaceHeight;
    let bottomBarHeight = 40
    let itemsAreaHeight;

    function updateDimns(){
        spaceHeight = 20;
        bottomBarHeight = 0;
        itemsAreaHeight = height - infoHeight - spaceHeight - bottomBarHeight;
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
    let format = "actual";

    let transformTransition = { 
        enter: null, 
        update: { duration:d => 200,// d.statusChanging ? 200 : 500,
            delay:d => 0,//d => d.statusChanging ? 0 : 100,
            ease:d3.easeQuadInOut
        } 
    };

    //API CALLBACKS
    let onSelectCard = function(){};
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
    let cardInfoComponents = {};
    let cardItemsComponents = {};

    function cardStack(selection, options={}) {
        //check the height of info, make smaller if necc and create a bottom bar, so the pentagon is in centre
        const { transitionEnter=true, transitionUpdate=true, log=false } = options;
        updateDimns();
        selection.each(function (data) {
            //console.log("stack data", data)
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
                        cardInfoComponents[d.cardNr] = cardInfoComponent();
                        cardItemsComponents[d.cardNr] = cardItemsComponent();

                        //ENTER
                        const contentsG = d3.select(this).append("g").attr("class", "contents card-contents")

                        contentsG.append("rect").attr("class", "card-bg")
                                .attr("rx", 3)
                                .attr("ry", 3)
                                .attr("stroke", getCardStroke(d))
                                .attr("fill", getCardFill(d))

                        contentsG
                            .append("g")
                                .attr("class", "info")
                                    .append("rect")
                                        .attr("class", "info-bg")
                        contentsG
                            .append("g")
                                .attr("class", "items-area")
                                    .append("rect")
                                        .attr("class", "items-area-bg");

                        contentsG
                            .append("g")
                                .attr("class", "bottom-bar")
                                    .append("rect")
                                        .attr("class", "bottom-bar-bg")
                                        .attr("fill", "white");
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
                    .each(function(cardD,i){
                        const { cardNr, isHeld, isFront, isNext, isSecondNext, isSelected, info, status, items } = cardD;            
                        //const infoHeight;
                        //components
                        const cardInfo = cardInfoComponents[cardNr]
                            .width(width)
                            .height(infoHeight)
                            .styles({
                                statusFill:() => getProgressStatusFill(cardD),
                                trophyTranslate:isHeld || isSelected ? 
                                    "translate(-3,3) scale(0.25)" : "translate(-45,3) scale(0.6)"
                            })
                            .fontSizes(fontSizes.info)
                            .onClick(function(e){
                                onSelectCard(e, cardD); 
                            })

                        const cardIsEditable = (isHeld && isFront) || isSelected;

                        const cardItems = cardItemsComponents[cardNr]
                            .styles({ 
                                _lineStrokeWidth:lineD => {
                                    if(isHeld || isSelected){
                                        return lineD.status === 2 ? 5 : (lineD.status === 1 ? 2.5 : 0.8);
                                    }
                                    return lineD.status === 2 ? 10 : (lineD.status === 1 ? 5 : 2.5)
                                },
                                _lineStroke:(lineD,i) => {
                                    if(isHeld || isSelected){
                                        return lineD.status === 2 ? GOLD : (lineD.status === 1 ? grey10(2) : "#989898")
                                    }
                                    return lineD.status === 2 ? GOLD : (lineD.status === 1 ? grey10(2) : grey10(6))
                                }
                            })
                            .width(width)
                            .height(itemsAreaHeight)
                            .withSections(cardIsEditable)
                            .editable(cardIsEditable)
                            .onSelectItem(onSelectItem)
                            .onUpdateItemStatus(function(itemNr, newStatus){
                                onUpdateItemStatus(cardNr, itemNr, newStatus);
                            })
                            .onDrag(e => dragged(e, cardD))
                            .onDragEnd(e => dragEnd(e, cardD))
                    
                        const contentsG = d3.select(this).select("g.card-contents")
                        contentsG.select("rect.card-bg")
                            .attr("width", width)
                            .attr("height", height)
                            .transition()
                            .delay(200)
                            .duration(400)
                                .attr("fill", getCardFill(cardD))
                                .attr("stroke", getCardStroke(cardD))

                        contentsG.select("rect.info-bg")
                            .attr("width", width)
                            .attr("height", infoHeight)
                            .attr("fill","none")
                        

                        const infoDatum = { ...info, itemsData:cardD.items, isSelected, isFront, isNext, isSecondNext };
                        
                        contentsG.selectAll("g.info")
                            .datum(infoDatum)
                            .call(cardInfo);

                        //hide if placed
                        contentsG.select("g.info")
                            .transition()
                                .delay(200)
                                .duration(200)
                                    .attr("opacity", isHeld || isSelected ? 1 : 0)

                        contentsG.select("g.items-area")
                            .attr("transform", `translate(0, ${infoHeight + spaceHeight})`)
                            .datum(cardD.items)
                            .call(cardItems)

                        //remove items for cards behind
                        const shouldHideItems = isHeld && !isFront && !isSelected;
                        contentsG.select("g.items-area")
                            .attr("pointer-events", shouldHideItems ? "none" : null)
                            .transition("items-trans")
                                .duration(100)
                                .attr("opacity", shouldHideItems ? 0 : 1)
                        
                        contentsG.select("rect.items-area-bg")
                            .attr("width", width)
                            .attr("height", itemsAreaHeight)
                            .attr("fill", "none")

                    }).call(drag)
  
            //EXIT
            cardG.exit().call(remove);

            let swipeTriggered = false;
            function dragged(e , d){
                if(swipeTriggered){ return; }
                const swipeDirection = e.dy <= 0 ? "up" : "down";
                let cardD;
                if(Array.isArray(d)){
                    //the bg has been dragged, so apply it to the correct card
                    const frontCard = data.find(c => c.isFront);
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
                console.log("dragged cardD", cardD?.cardNr)
                if(swipeDirection === "up" && !cardD.isHeld){ 
                    onPickUp(cardD);
                    swipeTriggered = true;
                }
                if(swipeDirection === "down" && cardD.isHeld){
                    onPutDown(cardD);
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
    cardStack.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return cardStack;
    };
    cardStack.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return cardStack;
    };
    cardStack.infoHeight = function (value) {
        if (!arguments.length) { return infoHeight; }
        infoHeight = value;
        return cardStack;
    };
    cardStack.placedCardWidth = function (value) {
        if (!arguments.length) { return placedCardWidth; }
        placedCardWidth = value;
        return cardStack;
    };
    cardStack.placedCardHeight = function (value) {
        if (!arguments.length) { return placedCardHeight; }
        placedCardHeight = value;
        return cardStack;
    };
    cardStack.selectedCardWidth = function (value) {
        if (!arguments.length) { return selectedCardWidth; }
        selectedCardWidth = value;
        return cardStack;
    };
    cardStack.selectedCardHeight = function (value) {
        if (!arguments.length) { return selectedCardHeight; }
        selectedCardHeight = value;
        return cardStack;
    };
    cardStack.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = value;
        return cardStack;
    };
    cardStack.x = function (func) {
        if (!arguments.length) { return x; }
        x = func;
        return cardStack;
    };
    cardStack.y = function (func) {
        if (!arguments.length) { return y; }
        y = func;
        return cardStack;
    };
    cardStack.kpiHeight = function (value) {
        if (!arguments.length) { return fixedKpiHeight; }
        kpiHeight = value;
        return cardStack;
    };
    cardStack.fontSizes = function (values) {
        if (!arguments.length) { return fontSizes; }
        fontSizes = { ...fontSizes, ...values };
        return cardStack;
    };
    cardStack.format = function (value) {
        if (!arguments.length) { return format; }
        format = value;
        return cardStack;
    };
    cardStack.transformTransition = function (value) {
        if (!arguments.length) { return transformTransition; }
        transformTransition = { 
            enter:value.enter,// || transformTransition.enter,
            update:value.update// || transformTransition.update
        }
        return cardStack;
    };
    cardStack.yScale = function (value, key) {
        if (!arguments.length) { return yScale; }
        yScale = value;
        if(key) { yKey = key; }
        calcY = y => typeof d.y === "number" ? d.y : yScale(d[yKey]);

        return cardStack;
    };
    cardStack.xScale = function (value, key) {
        if (!arguments.length) { return xScale; }
        xScale = value;
        if(key) { xKey = key; }
        calcX = x => typeof d.x === "number" ? d.x : xScale(d[xKey]);

        return cardStack;
    };
    cardStack.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return cardStack;
    };
    cardStack.onSelectCard = function (value) {
        if (!arguments.length) { return onSelectCard; }
        onSelectCard = value;
        return cardStack;
    };
    cardStack.onSelectItem = function (value) {
        if (!arguments.length) { return onSelectItem; }
        onSelectItem = value;
        return cardStack;
    };
    cardStack.onUpdateItemStatus = function (value) {
        if (!arguments.length) { return onUpdateItemStatus; }
        onUpdateItemStatus = value;
        return cardStack;
    };
    cardStack.onPickUp = function (value) {
        if (!arguments.length) { return onPickUp; }
        onPickUp = value;
        return cardStack;
    };
    cardStack.onPutDown = function (value) {
        if (!arguments.length) { return onPutDown; }
        onPutDown = value;
        return cardStack;
    };
    cardStack.onClickInfo = function (value) {
        if (!arguments.length) { return onClickInfo; }
        onClickInfo = value;
        return cardStack;
    };
    cardStack.onDragStart = function (value) {
        if (!arguments.length) { return onDragStart; }
        if(typeof value === "function"){
            onDragStart = value;
        }
        return cardStack;
    };
    cardStack.onDrag = function (value) {
        if (!arguments.length) { return onDrag; }
        if(typeof value === "function"){
            onDrag = value;
        }
        return cardStack;
    };
    cardStack.onDragEnd = function (value) {
        if (!arguments.length) { return onDragEnd; }
        if(typeof value === "function"){
            onDragEnd = value;
        }
        return cardStack;
    };
    cardStack.onLongpressStart = function (value) {
        if (!arguments.length) { return onLongpressStart; }
        if(typeof value === "function"){
            onLongpressStart = value;
        }
        return cardStack;
    };
    cardStack.onLongpressDragged = function (value) {
        if (!arguments.length) { return onLongpressDragged; }
        if(typeof value === "function"){
            onLongpressDragged = value;
        }
        return cardStack;
    };
    cardStack.onLongpressEnd = function (value) {
        if (!arguments.length) { return onLongpressEnd; }
        if(typeof value === "function"){
            onLongpressEnd = value;
        }
        return cardStack;
    };
    cardStack.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return cardStack;
    };
    cardStack.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return cardStack;
    };
    return cardStack;
}
