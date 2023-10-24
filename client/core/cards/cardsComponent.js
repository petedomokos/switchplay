import * as d3 from 'd3';
import { DIMNS, grey10, COLOURS, TRANSITIONS } from "./constants";
import dragEnhancements from '../journey/enhancedDragHandler';
import cardHeaderComponent from './cardHeaderComponent';
import cardItemsComponent from './cardItemsComponent';
import mediaComponent from '../journey/mediaComponent';
import kpisComponent from '../journey/kpis/kpisComponent';
import { fadeIn, fadeInOut, remove } from '../journey/domHelpers';
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

    //back
    let mediaHeight;
    let kpisHeight;

    function updateDimns(){
        normalContentsWidth = heldCardWidth - margin.left - margin.right;
        normalContentsHeight = heldCardHeight - margin.top - margin.bottom;
        const heldCardWidthToUse = isNumber(selectedSectionNr) ? sectionViewHeldCardWidth : heldCardWidth;
        const heldCardHeightToUse = isNumber(selectedSectionNr) ? sectionViewHeldCardHeight : heldCardHeight;
        contentsWidth = heldCardWidthToUse - margin.left - margin.right;
        contentsHeight = heldCardHeightToUse - margin.top - margin.bottom; 

        itemsAreaHeight = contentsHeight - headerHeight - gapBetweenHeaderAndItems;

        //back
        mediaHeight = (contentsHeight - headerHeight) * 0.33;
        kpisHeight = contentsHeight - headerHeight - mediaHeight;
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
    let cardsAreFlipped = false;
    let form;
    let selectedCardNr;
    let selectedItemNr;
    let selectedSectionNr;

    let transformTransition = { 
        enter: null, 
        update: { duration:d => TRANSITIONS.MED,// d.statusChanging ? 200 : 500,
            delay:() => 0,//d => d.statusChanging ? 0 : 100,
            //ease:d3.easeQuadInOut
        } 
    };

    //API CALLBACKS
    let onClickCard = function(){};
    let onClickCardDate = function(){};
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
    let frontHeaderComponents = {};
    let itemsComponents = {};
    let backHeaderComponents = {};
    let mediaComponents = {};
    let kpisComponents = {};

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
                        const { cardNr, isHeld, isSelected, profile } = d;

                        //front components
                        frontHeaderComponents[cardNr] = cardHeaderComponent();
                        itemsComponents[cardNr] = cardItemsComponent();
                        //back components
                        backHeaderComponents[cardNr] = cardHeaderComponent();
                        mediaComponents[cardNr] = mediaComponent();
                        kpisComponents[cardNr] = kpisComponent();

                        //FRONT
                        const contentsG = d3.select(this).append("g").attr("class", "contents card-contents");

                        //bgs for front and back
                        contentsG
                            .append("rect")
                                .attr("class", "card-bg card-front-bg")
                                .attr("opacity", cardsAreFlipped ? 0 : 1)
                                .attr("display", cardsAreFlipped ? "none" : null)
                                .attr("rx", 3)
                                .attr("ry", 3)
                                //for placed cards, we dont want the dimns to be changed when in section view
                                .attr("width", isHeld ? contentsWidth : normalContentsWidth)
                                .attr("height", isHeld ? contentsHeight : normalContentsHeight)
                                .attr("fill", isNumber(selectedSectionNr) ? COLOURS.CARD.SECTION_VIEW_FILL : COLOURS.CARD.FILL(d))
                                .attr("stroke", isNumber(selectedSectionNr) ? COLOURS.CARD.SECTION_VIEW_STROKE : getCardStroke(d))
                                .attr("stroke-width", 0.5)
                                .on("click", e => {
                                    //console.log("card bg click")
                                    onClickCard.call(this, e, d)
                                    e.stopPropagation();
                                })

                        contentsG
                            .append("rect")
                                .attr("class", "card-bg card-back-bg")
                                .attr("opacity", cardsAreFlipped ? 1 : 0)
                                .attr("display", cardsAreFlipped ? null : "none")
                                .attr("rx", 3)
                                .attr("ry", 3)
                                .attr("width", isHeld ? contentsWidth : normalContentsWidth)
                                .attr("height", isHeld ? contentsHeight : normalContentsHeight)
                                .attr("fill", grey10(2))
                                .attr("stroke", grey10(3))
                                .attr("stroke-width", 0.5);

                        //inner contents of front and back
                        const frontContentsG = contentsG.append("g").attr("class", "front-contents")
                            .attr("opacity", cardsAreFlipped ? 0 : 1)
                            .attr("display", cardsAreFlipped ? "none" : null);
                            
                        const backContentsG = contentsG.append("g").attr("class", "back-contents")
                            .attr("opacity", cardsAreFlipped ? 1 : 0)
                            .attr("display", cardsAreFlipped ? null : "none");

                        frontContentsG
                            .append("g")
                                .attr("class", "card-header")
                                //.attr("pointer-events", deckIsSelected & (isHeld || isSelected) ? "all" : "none")
                                .attr("opacity", deckIsSelected & (isHeld || isSelected) ? 1 : 0)
                        
                        frontContentsG
                            .append("g")
                                .attr("class", "items-area");

                        //BACK
                        backContentsG
                            .append("g")
                                .attr("class", "card-back-header")
                                //.attr("pointer-events", deckIsSelected & (isHeld || isSelected) ? "all" : "none")
                                .attr("opacity", deckIsSelected & (isHeld || isSelected) ? 1 : 0)

                        //other two back contents components are using their own enter-exit pattern below
                        
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
                        const { cardNr, isHeld, isFront, isNext, isSecondNext, isSelected, info, status, profile } = cardD;
                        const contentsG = d3.select(this).select("g.card-contents")
                            .attr("transform", `translate(${margin.left},${margin.top})`)

                        //bgs for front and back
                        contentsG.select("rect.card-front-bg")
                            .transition("card-front-bg-appearance")
                            .delay(200)
                            .duration(400)
                                .attr("fill", isNumber(selectedSectionNr) ? COLOURS.CARD.SECTION_VIEW_FILL :COLOURS.CARD.FILL(cardD))
                                .attr("stroke", isNumber(selectedSectionNr) ? COLOURS.CARD.SECTION_VIEW_STROKE : getCardStroke(cardD))

                        contentsG.select("rect.card-front-bg")
                            .transition("card-front-bg-dimns")
                            //.delay(200)
                            .duration(TRANSITIONS.MED)
                                .attr("width", isHeld ? contentsWidth : normalContentsWidth)
                                .attr("height", isHeld ? contentsHeight : normalContentsHeight);
    
                        contentsG.select("rect.card-back-bg")
                            .transition("card-back-bg-dimns")
                            //.delay(200)
                            .duration(TRANSITIONS.MED)
                                .attr("width", isHeld ? contentsWidth : normalContentsWidth)
                                .attr("height", isHeld ? contentsHeight : normalContentsHeight);

                        //inner contents for front and back
                        const frontContentsG = d3.select(this).select("g.front-contents")
                        const backContentsG = d3.select(this).select("g.back-contents")
                            //.call(fadeInOut, cardsAreFlipped);
                        
                        //const headerHeight;
                        //components
                        const dateColour = isNumber(selectedSectionNr) ? grey10(5) : grey10(7);
                        const frontHeader = frontHeaderComponents[cardNr]
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
                                e.stopPropagation();
                            })
                            .onClickDate(function(e){
                                onClickCardDate(cardD, i); 
                                e.stopPropagation();
                            })
                            .onClickTitle(function(d, headerDimns){
                                //alert("card title click")
                                const dimns = {
                                    ...headerDimns,
                                    left:margin.left + headerDimns.left,
                                    top:margin.top + headerDimns.top
                                }
                                onClickCardTitle(cardD, i, dimns);
                                e.stopPropagation();
                            })
                        
                        const frontHeaderDatum = { ...info, itemsData:cardD.items, isSelected, isFront, isNext, isSecondNext, cardNr };
                        frontContentsG.selectAll("g.card-header")
                            //.attr("pointer-events", deckIsSelected & (isHeld || isSelected) ? "all" : "none")
                            .datum(frontHeaderDatum)
                            .call(frontHeader)
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
                                    //deal with non-defined items separately, incase a user deletes title of an item
                                    if(!lineD.title) { return isHeld || isSelected ? "#989898" : grey10(6)}

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

                        frontContentsG.select("g.items-area")
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
                        const botRightBtnData = isNumber(selectedSectionNr) || !isFront ? [] : (isSelected ? [collapseBtnDatum] : [expandBtnDatum]);
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


                        //BACK CONTENTS ---------------------------------------
                        //header
                        const backHeader = backHeaderComponents[cardNr]
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
                            .rightContent("")
                            .onClick(function(e){
                                onClickCard(e, cardD); 
                            })
                            .onClickDate(function(e){
                                onClickCardDate(cardD, i); 
                                e.stopPropagation();
                            })
                            .onClickTitle(function(d, headerDimns){
                                const dimns = {
                                    ...headerDimns,
                                    left:margin.left + headerDimns.left,
                                    top:margin.top + headerDimns.top
                                }
                                onClickCardTitle(cardD, i, dimns);
                            })

                        const backHeaderDatum = { ...info, itemsData:cardD.items, isSelected, isFront, isNext, isSecondNext, cardNr };
                        backContentsG.selectAll("g.card-back-header")
                            //.attr("pointer-events", deckIsSelected & (isHeld || isSelected) ? "all" : "none")
                            .datum(backHeaderDatum)
                            .call(backHeader)
                                .transition() //hide if small
                                .delay(200)
                                .duration(200)
                                    .attr("opacity", (isHeld || isSelected) ? 1 : 0);

                        //media
                        /*const media = mediaComponents[cardNr]
                            .width(contentsWidth)
                            .height(mediaHeight)

                        const shouldShowMedia = isFront && cardsAreFlipped && !isNumber(selectedSectionNr);
                        const mediaG = backContentsG.selectAll("g.profile-info").data(shouldShowMedia ? [1] : []);
                        mediaG.enter()
                            .append("g")
                                .attr("display", cardsAreFlipped ? null : "none")
                                .attr("class", "profile-info")
                                //fade in so it doesnt show up for a glimpse on first load of page
                                //.call(fadeIn, { transition:{ delay: 500, duration:500 }})
                                .merge(mediaG)
                                .attr("transform", `translate(0,${headerHeight})`)
                                .datum(profile.info)
                                .call(media)
                                .call(fadeInOut, isFront, { 
                                    transitionIn:{ delay: 0, duration:200 },
                                    transitionOut:{ delay: 200, duration:200 }
                                });

                        mediaG.exit().remove();*/
                        
                        

                        //kpis
                        //const textInfoHeight = 20;
                        const kpis = kpisComponents[cardNr]
                            .width(contentsWidth)
                            .height(kpisHeight)
                            //.expandedHeight(contentsHeight - textInfoHeight)
                            .gapBetweenKpis(2)
                            .styles({
                                kpi:{
                                    title:{

                                    },
                                    progressBar:{
                                        

                                    }
                                },
                                ctrls:{

                                }
                            })
                            //.kpiHeight(10)//kpiHeight)
                            .fontSizes(4)//fontSizes.kpis)
                            //.kpiFormat(kpiFormat)
                            .displayFormat("stats")
                            .withTooltips(false)
                            .editable(false)
                            .scrollable(false)
                            .profileIsSelected(false)

                        const shouldShowKpis = deckIsSelected && isFront && cardsAreFlipped && !isNumber(selectedSectionNr);
                        if(deckIsSelected && isFront)
                        console.log("shouldShowKpis", shouldShowKpis)

                        const kpisG = backContentsG.selectAll("g.kpis").data(shouldShowKpis ? [1] : []);
                        kpisG.enter()
                            .append("g")
                                .attr("class", "kpis")
                                .merge(kpisG)
                                .attr("transform", `translate(0, ${headerHeight + mediaHeight})`)
                                .call(fadeInOut, isFront)
                                .datum(profile.kpis)
                                .call(kpis);

                        kpisG.exit().remove();
                    })
                    .call(drag)
                    .on("click", e => { 
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
        Object.values(frontHeaderComponents).forEach(header => {
            header.selectedSectionNr(value);
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
    cards.cardsAreFlipped = function (value) {
        if (!arguments.length) { return cardsAreFlipped; }
        cardsAreFlipped = value;
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
    cards.onClickCardDate = function (value) {
        if (!arguments.length) { return onClickCardDate; }
        onClickCardDate = value;
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
