import * as d3 from 'd3';
import { DIMNS, grey10, COLOURS, TRANSITIONS, STYLES } from "./constants";
import dragEnhancements from '../journey/enhancedDragHandler';
import cardHeaderComponent from './cardHeaderComponent';
import cardItemsComponent from './cardItemsComponent';
import flagsComponent from "./flagsComponent";
import purposeComponent from './purposeComponent';
import mediaComponent from '../journey/mediaComponent';
import kpisComponent from '../journey/kpis/kpisComponent';
import contextMenuComponent from "./contextMenuComponent";
import { fadeIn, fadeInOut, remove, fadeOut } from '../journey/domHelpers';
import { updateTransform } from '../journey/transitionHelpers';
import { icons } from '../../util/icons';
import { isNumber } from '../../data/dataHelpers';

const { GOLD, SILVER, NOT_STARTED_FILL, SECTION_VIEW_NOT_STARTED_FILL } = COLOURS;

const CONTEXT_MENU_ITEM_WIDTH = DIMNS.CARD_CONTEXT_MENU.ITEM_WIDTH;
const CONTEXT_MENU_ITEM_HEIGHT = DIMNS.CARD_CONTEXT_MENU.ITEM_HEIGHT;
const CONTEXT_MENU_ITEM_GAP = DIMNS.CARD_CONTEXT_MENU.ITEM_GAP;

const contextMenuData = [ 
    { key:"delete-card", url:"/delete.png" }
]

export default function cardsComponent() {
    //API SETTINGS
    // dimensions
    let width = 1400;
    let height = 1000;
    let heldCardWidth = 300;
    let heldCardHeight = 600;
    let margin = { left:3, right: 3, top:2.5, bottom:2.5 }
    let contentsWidth;
    let contentsHeight;
    //non-section view dimns
    let normalContentsWidth;
    let normalContentsHeight;

    let getCardContentsWidth; 
    let getCardContentsHeight;

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

    let btnWidth;
    let btnHeight;

    function updateDimns(){
        normalContentsWidth = heldCardWidth - margin.left - margin.right;
        normalContentsHeight = heldCardHeight - margin.top - margin.bottom;
        const heldCardWidthToUse = selectedSectionKey ? sectionViewHeldCardWidth : heldCardWidth;
        const heldCardHeightToUse = selectedSectionKey ? sectionViewHeldCardHeight : heldCardHeight;
        contentsWidth = heldCardWidthToUse - margin.left - margin.right;
        contentsHeight = heldCardHeightToUse - margin.top - margin.bottom; 

        getCardContentsWidth = cardD => cardD.isHeld ? contentsWidth : normalContentsWidth;
        getCardContentsHeight = cardD => cardD.isHeld ? contentsHeight : normalContentsHeight;

        itemsAreaHeight = contentsHeight - headerHeight - gapBetweenHeaderAndItems;

        //back
        mediaHeight = (contentsHeight - headerHeight) * 0.33;
        const bottomCtrlsHeight = 4;
        kpisHeight = contentsHeight - headerHeight - mediaHeight - bottomCtrlsHeight;

        btnHeight = d3.max([1.3, d3.min([15, 0.15 * normalContentsHeight])]);
        btnWidth = btnHeight;
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
    let groupingTag;
    let timeframeKey = "singleDeck";
    let deckIsSelected;
    let format = "actual";
    let cardsAreFlipped = false;
    let shouldShowFlags = false;
    let form;
    let selectedCardNr;
    let selectedItemNr;
    let selectedSectionKey;

    let transformTransition = { 
        enter: null, 
        update: { duration:d => TRANSITIONS.MED,// d.statusChanging ? 200 : 500,
            delay:() => 0,//d => d.statusChanging ? 0 : 100,
            //ease:d3.easeQuadInOut
        } 
    };

    //card swiping state
    let swipeTriggered = false;
    let deltaY = 0;

    //API CALLBACKS
    let onClickCard = function(){};
    let onClickCardDate = function(){};
    let onClickCardTitle = function(){};
    let onSelectItem = function(){};
    let onUpdateItemStatus = function(){};
    let onAddCard = function(){};
    let onDeleteCard = function(){};
    let onPickUp = function(){};
    let onPutDown = function(){};
    let onClickInfo = function(){};
    let setForm = function(){};

    let onClick = function(){};
    let onDragStart = function() {};
    let onDrag = function() {};
    let onDragEnd = function() {};
    let onLongpressStart = function() {};
    let onLongpressDragged = function() {};
    let onLongpressEnd = function() {};
    let onMouseover = function(){};
    let onMouseout = function(){};

    let longpressedCardId;
    let drag = d3.drag();
    const enhancedDrag = dragEnhancements();

    //dom
    let containerG;
    //components
    let frontHeaderComponents = {};
    let itemsComponents = {};
    let purposeComponents = {};
    let flagsComponents = {};
    let contextMenuComponents = {};
    let backHeaderComponents = {};
    let mediaComponents = {};
    let kpisComponents = {};

    function cards(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log=false } = options;
        updateDimns();
        selection.each(function (data) {
            containerG = d3.select(this)

            //drag overlay
            enhancedDrag
                .dragThreshold(100)
                .onLongpressStart(function(e, d){
                    if(!d.isHeld || d.isHidden){ return; }
                    //onSetLongpressed(true); 
                    longpressedCardId = d.id;
                    containerG.call(cards);

                })
                //.onLongpressDragged(longpressDragged)
                .onLongpressEnd(function(){
                    //console.log("lpend")
                    //onSetLongpressed(false);
                });

            const drag = d3.drag()
                .on("start", enhancedDrag())
                .on("drag", enhancedDrag(dragged))
                .on("end", enhancedDrag(dragEnd))

            containerG.call(drag);


            const shouldShowBg = deckIsSelected && data.filter(c => c.isHeld).length === 0;
            const cardsBackgroundG = containerG.selectAll("g.cards-background").data(shouldShowBg ? [1] : []);
            cardsBackgroundG.enter()
                .insert("g", ":first-child")
                    .attr("class", "cards-background")
                    .call(fadeIn)
                    .each(function(){
                        const g = d3.select(this);
                        g.append("rect").attr("class", "cards-bg")
                            .attr("fill", "transparent");

                        const newCardButtonG = g.append("g").attr("class", "new-card-btn");
                        newCardButtonG.append("path")
                            //.attr("transform-origin", "center")
                            .attr("transform", "translate(-28.85,-29) scale(2.4)")
                            .attr("fill", "none")
                            .attr("stroke", grey10(4))
                            .attr("stroke-width", 1.5)
                            .attr("stroke-linecap", "round")
                            .attr("d", "M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15")
        
                        newCardButtonG.append("circle")
                            .attr("r", 18)
                            .attr("fill", "none")
                            .attr("stroke", grey10(4))
                            .attr("stroke-width", 1.5)

                    })
                    .merge(cardsBackgroundG)
                    .each(function(){
                        const g = d3.select(this);
                        g.select("g.new-card-btn")
                            .call(fadeInOut, timeframeKey === "singleDeck", { transitionOut:{ duration: 0 }})
                            .attr("transform", `translate(${width/2}, ${height/2}) scale(0.4)`)
                            .on("click", e => {
                                e.stopPropagation()
                                onAddCard();
                            });

                        g.select("rect.cards-bg")
                            .attr("width", width)
                            .attr("height", height);

                    })

            cardsBackgroundG.exit().call(remove);

            //card fill and stroke
            const getCardFill = d => COLOURS.CARD.FILL(d, deckIsSelected);
            const getCardStroke = d => COLOURS.CARD.STROKE(d);
            const getBackOfCardFill = d => COLOURS.BACK_OF_CARD.FILL(d);
            const getBackOfCardStroke = d => COLOURS.BACK_OF_CARD.STROKE(d);
            const getBackOfCardStrokeWidth = d => 0.5;

            const getCardStrokeWidth = cardD => {
                return STYLES.CARD.STROKE_WIDTH * (cardD.isPlaced && cardD.isHidden ? 3 : 1)
            }

            //stroke-widths
            const getMainItemStrokeWidth = (cardD, itemD) => {
                const { status, isSectionView, title } = itemD;
                const { isHeld, isSelected } = cardD;
                if(!title){ return 0.15 }
                if(deckIsSelected){
                    if(isHeld || isSelected){
                        return status === 2 ? 1 : 0.8;//(status === 1 ? 0.8 : 0.2);
                    }
                    return status === 2 ? 3 : (status === 1 ? 1.5 : 0.2)
                }
                //multiple deck view
                if(isHeld || isSelected){
                    return status === 2 ? 1.5 : (status === 1 ? 1 : 0.2);
                }
                return status === 2 ? 3 : (status === 1 ? 2 : 0.2);
            }

            const getHeaderStatusItemStrokeWidth = itemD => {
                const { status, title } = itemD;
                if(!title){ return 0.1; }
                //return status === 2 ? 1.3 : 1;// (status === 1 ? 1 : 0.5)
                return 0.7
            }
            const getSectionViewCardStrokeWidth = (itemsData, cardD) => {
                //can assume 1 item per card per section for now
                const itemD = itemsData ? itemsData[0] : null;

                if(itemD?.title){
                    const { status } = itemD;
                    return status === 2 ? STYLES.CARD.STROKE_WIDTH : STYLES.CARD.STROKE_WIDTH * 0.75;
                }
                return itemD?.title ? STYLES.CARD.STROKE_WIDTH : 0.15
            }

            //status fills

            //@todo - reduce staturation as cardNr goes out (actually need to use the heldCardPos, eg from isNext, is SecondNext etc
            //to help with this, replace isNext etc with heldCardPos property on each card)
            const getProgressStatusColour = (cardD, itemD, linePartNr=1) => { 
                //console.log("getItemColor", cardD.cardNr, itemD.itemNr, linePartNr)
                //const { isSelected, isFront, isNext, isSecondNext, info } = cardD;
                const { status, title, isSectionView } = itemD;

                const NOT_STARTED_COLOUR = isSectionView ? SECTION_VIEW_NOT_STARTED_FILL : NOT_STARTED_FILL;

                if(linePartNr === 1){ return status >= 1 ? GOLD : NOT_STARTED_COLOUR; }
                if(linePartNr === 2){ return status === 2 ? GOLD : NOT_STARTED_COLOUR; }
            };

            //in section view, we use the card storke to show status compleitn of seciton item
            //@todo later - in future, this may be more than one item so we will need to use item bg stroke instead
            const getSectionViewCardStroke = (itemsData, linePartNr) => {
                //can assume 1 item per card per section for now
                const itemD = itemsData[0];
                if(itemD){
                    //cardNr is irrelevant for sections as there is no shadow effect so just use 1
                    return getProgressStatusColour({ cardNr: 1 }, { ...itemD, isSectionView:true }, linePartNr);
                }
                return SECTION_VIEW_NOT_STARTED_FILL;
            }

            const cardG = containerG.selectAll("g.card").data(data, d => d.id);
            cardG.enter()
                //.insert("g", ":first-child")
                .append("g")
                    .attr("class", d => `card card-${d.id}`)
                    .attr("opacity", 1)
                    .each(function(cardD,i){
                        const { id, cardNr, pos, isHeld, isHidden, isSelected, profile } = cardD;
                        const itemsData = timeframeKey !== "singleDeck" || isHidden ? [] : (selectedSectionKey ? cardD.items.filter(it => it.section?.key === selectedSectionKey) : cardD.items);

                        //front components
                        frontHeaderComponents[id] = cardHeaderComponent();
                        itemsComponents[id] = cardItemsComponent();
                        purposeComponents[id] = purposeComponent();
                        flagsComponents[id] = flagsComponent();
                        contextMenuComponents[id] = contextMenuComponent();
                        //back components
                        backHeaderComponents[id] = cardHeaderComponent();
                        mediaComponents[id] = mediaComponent();
                        kpisComponents[id] = kpisComponent();

                        const cardG = d3.select(this);
                        cardG.append("rect").attr("class", "card-underlay")
                            .attr("opacity", 0)
                            .attr("width", 4000)
                            .attr("height", 4000);

                            //next - last step of status is to spplit the bg rect into two halves , a
                            //left an right, and status 1 has only teh left in gold, status two has both


                        //FRONT
                        const contentsG = cardG.append("g").attr("class", "contents card-contents");

                        //append flags container under the bg so its hidden until it slides out
                        contentsG
                            .append("g")
                                .attr("class", "flags-container");

                        //bgs for front and back
                        contentsG
                            .append("rect")
                                .attr("class", "card-bg card-front-bg")
                                .attr("opacity", cardsAreFlipped ? 0 : 1)
                                .attr("display", cardsAreFlipped ? "none" : null)
                                .attr("rx", 3)
                                .attr("ry", 3)
                                //for placed cards, we dont want the dimns to be changed when in section view
                                .attr("width", getCardContentsWidth(cardD))
                                .attr("height", getCardContentsHeight(cardD))
                                .attr("fill", selectedSectionKey ? getCardFill({ pos: 0 }) : getCardFill(cardD))
                                .attr("stroke", selectedSectionKey ? getSectionViewCardStroke(itemsData, 1) : getCardStroke(cardD))
                                .attr("stroke-width", selectedSectionKey ? getSectionViewCardStrokeWidth() : getCardStrokeWidth(cardD))
                                .on("click", e => {
                                    //console.log("card bg click")
                                    onClickCard.call(this, e, cardD)
                                    e.stopPropagation();
                                })

                        contentsG
                            .append("rect")
                                .attr("class", "card-bg card-back-bg")
                                .attr("rx", 3)
                                .attr("ry", 3)
                                .attr("width", getCardContentsWidth(cardD))
                                .attr("height", getCardContentsHeight(cardD))
                                .attr("opacity", cardsAreFlipped ? 1 : 0)
                                .attr("fill", getBackOfCardFill(cardD))
                                .attr("stroke", getBackOfCardStroke(cardD))
                                .attr("stroke-width", getBackOfCardStrokeWidth(cardD));

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
                                .attr("class", "items-area")
                                    .attr("pointer-events", "none");

                        //BACK
                        backContentsG
                            .append("g")
                                .attr("class", "card-back-header")
                                //.attr("pointer-events", deckIsSelected & (isHeld || isSelected) ? "all" : "none")
                                //.attr("opacity", deckIsSelected & (isHeld || isSelected) ? 1 : 0)

                        //other two back contents components are using their own enter-exit pattern below
                        
                    })
                    .call(updateTransform, { 
                        x, 
                        y,
                        k:d => d.isSelected ? (selectedCardHeight/heldCardHeight) : (d.isHeld ? 1 : placedCardHeight/heldCardHeight),  
                        transition:transformTransition.enter,
                        name:d => `card-pos-${d.pos}`,
                        force:true
                    })
                    .merge(cardG)
                    .call(updateTransform, { 
                        x, 
                        y, 
                        k:d => d.isSelected ? (selectedCardHeight/heldCardHeight) : (d.isHeld ? 1 : placedCardHeight/heldCardHeight),
                        transition:transformTransition.update,
                        name:(d,i) => `card-pos-${i}-${d.pos}`,
                        force:true
                    })
                    .sort((a,b) => d3.descending(a.cardNr, b.cardNr))
                    .each(function(cardD,i){
                        const { deckId, cardNr, id, pos, isHidden, slotPos, isHeld, isPlaced, isFront, hasBeenPickedUp, isNext, isSecondNext, isSelected, info, status, profile, deckListPos, purposeData=[], flagsData } = cardD;
                        const itemsData = selectedSectionKey ? cardD.items.filter(it => it.section?.key === selectedSectionKey) : cardD.items;
                        const items = itemsComponents[id];

                        const cardIsLongpressed = longpressedCardId === id;
                        const anotherCardIsLongpressed = longpressedCardId && longpressedCardId !== id;
                        const cardG = d3.select(this)
                            .call(fadeInOut, !anotherCardIsLongpressed && itemsData.length !== 0 && (!isNumber(selectedCardNr) || selectedCardNr === cardNr));

                        //if there are hidden placedcrads, we need to lower them -> will be lowered in the right order coz
                        //the rendering is done in reverse order
                        if(slotPos < 0){ cardG.lower(); }

                        //if the card has a clicked item and we are in section view, we show the underlay, or if card longpressed
                        const shouldShowUnderlay = (selectedSectionKey && isNumber(items.clickedItemNr())) || cardIsLongpressed;
                        cardG.select("rect.card-underlay")
                            .call(fadeInOut, shouldShowUnderlay, { opacity:shouldShowUnderlay ? 0.8 : 0 })
                            .attr("transform", `translate(${-2000},${-2000})`)
                            .on("click", function(e){
                                //console.log("click card underlay")
                                //unclick item code
                                e.stopPropagation();
                                if(longpressedCardId){
                                    longpressedCardId = null;
                                    containerG.call(cards);
                                    return;
                                }
                                //@todo - consider why do we need to raise the card when item clicked, why not just make other cards 
                                //fade out like i do for longpressed card
                                //must lower card back to its correct pos in deck
                                containerG.selectAll("g.card").each(function(d,i){
                                    if(d.isHeld && d.cardNr < cardNr){
                                        //timeout so it only raises after overlay fades out
                                        setTimeout(() => { d3.select(this).raise(); }, TRANSITIONS.MED)
                                    }
                                })
                                items.clickedItemNr(null);
                                containerG.call(cards);
                            })

                        const contentsG = cardG.select("g.card-contents")
                            .attr("transform", `translate(${margin.left},${margin.top})`)
                        
                        //context-menu
                        const menuMargin = {
                            left: CONTEXT_MENU_ITEM_WIDTH * 0.4, right:CONTEXT_MENU_ITEM_WIDTH * 0.4,
                            top:CONTEXT_MENU_ITEM_HEIGHT * 0.1, bottom: CONTEXT_MENU_ITEM_HEIGHT * 0.1
                        }
            
                        const nrItems = contextMenuData.length;
                        const contextMenuWidth = nrItems * CONTEXT_MENU_ITEM_WIDTH + (nrItems - 1) * CONTEXT_MENU_ITEM_GAP + menuMargin.left + menuMargin.right;
                        const contextMenuHeight = CONTEXT_MENU_ITEM_HEIGHT + menuMargin.top + menuMargin.bottom;
                        const gapBetweenDeckAndMenu = 2;

                        const contextMenuG = contentsG.selectAll("g.card-context-menu").data(cardIsLongpressed ? [contextMenuData] : []);
                        contextMenuG.enter()
                            .append("g")
                                .attr("class", "card-context-menu")
                                .call(fadeIn)
                                .merge(contextMenuG)
                                .attr("transform", `translate(${(contentsWidth - contextMenuWidth)/2},${-contextMenuHeight - gapBetweenDeckAndMenu})`)
                                .call(contextMenuComponents[id]
                                    .itemWidth(CONTEXT_MENU_ITEM_WIDTH)
                                    .itemHeight(CONTEXT_MENU_ITEM_HEIGHT)
                                    .itemGap(CONTEXT_MENU_ITEM_GAP)
                                    .menuMargin(menuMargin)
                                    .styles({ bgFill: grey10(9)})
                                    .onClick((e,d) => {
                                        e.stopPropagation();
                                        if(d.key === "delete-card"){ onDeleteCard(cardD); }
                                        longpressedCardId = null;
                                    }))

                        contextMenuG.exit().call(remove);

                        //bgs for front and back
                        contentsG.select("rect.card-front-bg")
                            .transition("card-front-bg-appearance")
                            .delay(200)
                            .duration(400)
                                .attr("fill", selectedSectionKey ? getCardFill({ pos: 0 }) : getCardFill(cardD))
                                .attr("stroke", selectedSectionKey ? getSectionViewCardStroke(itemsData, 1) : getCardStroke(cardD))
                                .attr("stroke-width", selectedSectionKey ? getSectionViewCardStrokeWidth(itemsData) : getCardStrokeWidth(cardD))
                                .attr("stroke-dasharray", selectedSectionKey && itemsData[0] && itemsData[0].status === 1 ? "3 4" : null)

                        contentsG.select("rect.card-front-bg")
                            .transition("card-front-bg-dimns")
                            .duration(TRANSITIONS.MED)
                                .attr("width", isHeld ? contentsWidth : normalContentsWidth)
                                .attr("height", isHeld ? contentsHeight : normalContentsHeight);

                        contentsG.select("rect.card-back-bg")
                            .transition("card-back-bg-appearance")
                            .delay(200)
                            .duration(400)
                                .attr("opacity", cardsAreFlipped ? 1 : 0)
                                .attr("fill", getBackOfCardFill(cardD))
                                .attr("stroke", getBackOfCardStroke(cardD))
                                .attr("stroke-width", getBackOfCardStrokeWidth(cardD))
    
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
                        const cardTitleIsBeingEdited = form?.formType !== "card-title" && form?.value?.cardNr === cardD.cardNr;
                        //component colours
                        //in section view, pos for all cads is overwritten to be 0
                        const _cardD = { ...cardD, pos: selectedSectionKey ? 0 : cardD.pos }
                        const dateColour = COLOURS.CARD.HEADER(_cardD).DATE;
                        const dateCountWordsColour = COLOURS.CARD.HEADER(_cardD).DATE_COUNT_WORDS;
                        const titleColour = COLOURS.CARD.HEADER(_cardD).TITLE;

                        const backDateColour = COLOURS.BACK_OF_CARD.HEADER(cardD).DATE;
                        const backDateCountWordsColour = COLOURS.BACK_OF_CARD.HEADER(cardD).DATE_COUNT_WORDS;
                        const backTitleColour = COLOURS.BACK_OF_CARD.HEADER(cardD).TITLE;

                        //Components
                        const frontHeader = frontHeaderComponents[id]
                            .width(contentsWidth)
                            .height(headerHeight)
                            .withTitle(!cardTitleIsBeingEdited)
                            .rightContent(timeframeKey === "singleDeck" ? "progress-chain" : "progress-trophy")
                            .styles({
                                //need to decide whether to do stroke from here or just inside cardHeader
                                getStatusItemStroke:(itemD,linePartNr) => getProgressStatusColour(cardD, itemD, linePartNr),
                                getStatusItemStrokeWidth:getHeaderStatusItemStrokeWidth,
                                trophyTranslate:isHeld || isSelected ? 
                                    "translate(-3,3) scale(0.25)" : "translate(-45,3) scale(0.6)",
                                date:{ 
                                    fill:dateColour, stroke:dateColour 
                                },
                                dateCount:{
                                    numberFill:dateColour, wordsFill:dateCountWordsColour,
                                    numberStroke:dateColour, wordsStroke:dateCountWordsColour
                                },
                                title:{ fill: titleColour }
                            })
                            .fontSizes(fontSizes.info)
                            .onClick(function(e){
                                e.stopPropagation();
                                if(timeframeKey !== "singleDeck"){ return; }
                                //console.log("header click ->")
                                onClickCard(e, cardD); 
                            })
                            .onClickDate(function(e){
                                e.stopPropagation();
                                if(timeframeKey !== "singleDeck"){ return; }
                                //@todo - enable date change from section view
                                if(selectedSectionKey){ return; }
                                onClickCardDate(cardD, i); 
                               
                            })
                            .onClickTitle(function(e, headerDimns){
                                e.stopPropagation();
                                if(timeframeKey !== "singleDeck"){ return; }
                                //@todo - enable title change from section view
                                if(selectedSectionKey){ return; }
                                const dimns = {
                                    ...headerDimns,
                                    left:margin.left + headerDimns.left,
                                    top:margin.top + headerDimns.top
                                }
                                onClickCardTitle(cardD, i, dimns);
                            })
                        
                        const headerId = `deck-${deckId}-card-${cardNr}`
                        const frontHeaderDatum = { ...info, itemsData:cardD.items, isSelected, isFront, isNext, isSecondNext, cardNr, id:headerId };
                        frontContentsG.selectAll("g.card-header")
                            //.attr("pointer-events", deckIsSelected & (isHeld || isSelected) ? "all" : "none")
                            .datum(frontHeaderDatum)
                            .call(frontHeader)
                                .transition() //hide if small
                                .delay(200)
                                .duration(200)
                                    .attr("opacity", (isHeld || isSelected) ? 1 : 0);

                        //ITEMS
                        //helper
                        //note - deckIsSelected && form is handled in Decks - it turns the entire container pointer-events on/off
                        const cardIsEditable = deckIsSelected && (!!selectedSectionKey || ((isHeld && isFront) || isSelected));
                        items
                            .styles({ 
                                getItemStrokeWidth:itemD => getMainItemStrokeWidth(cardD, itemD),
                                getItemStroke:(itemD, linePartNr) => getProgressStatusColour(cardD, itemD, linePartNr)
                            })
                            .width(contentsWidth)
                            .height(itemsAreaHeight)
                            .headerHeight(headerHeight)
                            .withSections(cardIsEditable)
                            .withText(d => cardIsEditable)
                            .cardIsSelected(selectedCardNr === cardNr)
                            .selectedItemNr(selectedItemNr)
                            .editable(cardIsEditable)
                            .onSetOuterRadius(r => { itemsOuterRadius = r })
                            .onClickItem(() => {
                                cardG.raise();
                                containerG.call(cards) 
                            })
                            .onSelectItem(onSelectItem)
                            .onUpdateItemStatus(function(itemNr, newStatus){
                                onUpdateItemStatus(id, itemNr, newStatus);
                            })
                            .onDrag(e => { 
                                //console.log("drag from items")
                                dragged(e, cardD) 
                            })
                            .onDragEnd(function(e){
                                //console.log('calling de from items')
                                dragEnd.call(this, e, cardD)
                            })
                            .setForm(setForm)

                        const shouldShowItems = !isHidden && timeframeKey === "singleDeck" && (isPlaced || isSelected || isFront || (isHeld && selectedSectionKey && deckIsSelected))
                        frontContentsG.select("g.items-area")
                            //not sure why we need this when entire containr shold have pointer-events none when no deck selected
                            .attr("pointer-events", deckIsSelected ? null : "none")
                            .attr("transform", `translate(0, ${headerHeight + gapBetweenHeaderAndItems})`)
                            .call(fadeInOut, shouldShowItems)
                            .datum(itemsData)
                            .call(items);

                        //PURPOSE (instead of items when in long-term longTerm view)
                        const shouldShowPurpose = deckIsSelected && isFront && timeframeKey === "longTerm" && !cardsAreFlipped;
                        const purpose = purposeComponents[id];
                        const purposeG = frontContentsG.selectAll("g.card-purpose").data(shouldShowPurpose ? [purposeData] : [])
                        purposeG.enter()
                            .append("g")
                                .attr("class", "card-purpose")
                                .attr("pointer-events", "none")
                                .call(fadeIn)
                                .merge(purposeG)
                                .attr("transform", () => `translate(0, ${headerHeight})`)
                                .call(purpose
                                    .width(contentsWidth)
                                    .height(contentsHeight - headerHeight - btnHeight)
                                    .styles({ fill:"#0047AB", placeholderFill:"#0047AB" }))
        
                        purposeG.exit().call(remove)

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
                        const botRightBtnData = !deckIsSelected || selectedSectionKey || (!isFront && !isSelected) ? 
                            [] : (isSelected ? [collapseBtnDatum] : [expandBtnDatum]);

                        //assumme all are square
                        //note: 0.8 is a bodge coz iconsseems to be bigger than they state
                        const scale = d => (0.8 * btnHeight)/d.icon.height;
                        const btnMargin = btnHeight * 0.2;
                        const btnContentsWidth = btnWidth - 2 * btnMargin;
                        const btnContentsHeight = btnHeight - 2 * btnMargin;
                        const botRightBtnG = contentsG.selectAll("g.card-bottom-right-btn").data(botRightBtnData, d => d.key);
                        botRightBtnG.enter()
                            .append("g")
                                .attr("class", "card-bottom-right-btn")
                                .call(fadeIn, { transition:{ delay: TRANSITIONS.MED }})
                                .each(function(d){
                                    const btnG = d3.select(this);
                                    btnG.append("path")
                                        .attr("fill", COLOURS.CARD.EXPAND_COLLAPSE_BTN);

                                    btnG.append("rect").attr("class", "btn-hitbox")
                                        .attr("fill", "transparent")
                                        //.attr("stroke-width", 0.3)
                                        //.attr("stroke", "black")
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

                        //btm left btn
                        const flagsTurnedOnForCard = deckIsSelected && !selectedSectionKey && isFront && !isSelected;
                        const notificationBtnDatum = { 
                            key:"notification", 
                            onClick:e => { 
                                shouldShowFlags = !shouldShowFlags;
                                containerG.call(cards)  
                            },
                            icon:icons.notification,
                        }
                       
                        const botLeftBtnData = flagsTurnedOnForCard ? [notificationBtnDatum] : [];
                        //console.log("btnLeft", botLeftBtnData)
                        //assumme all are square
                        //note: 0.8 is a bodge coz iconsseems to be bigger than they state
                        const botLeftBtnG = contentsG.selectAll("g.card-bottom-left-btn").data(botLeftBtnData, d => d.key);
                        botLeftBtnG.enter()
                            .append("g")
                                .attr("class", "card-bottom-left-btn")
                                .call(fadeIn, { transition:{ delay: TRANSITIONS.MED }})
                                .each(function(d){
                                    const btnG = d3.select(this);
                                    btnG.append("path")
                                        .attr("fill", shouldShowFlags ? grey10(2) : COLOURS.CARD.EXPAND_COLLAPSE_BTN);

                                    btnG.append("rect").attr("class", "btn-hitbox")
                                        .attr("fill", "transparent")
                                        //.attr("stroke-width", 0.3)
                                        //.attr("stroke", "black")
                                })
                                .merge(botLeftBtnG)
                                .attr("transform", `translate(${btnMargin},${contentsHeight - btnHeight + btnMargin})`)
                                .each(function(d){
                                    const btnG = d3.select(this);
                                    btnG.select("path")
                                        .attr("transform", `scale(${scale(d)}) translate(-2.5,-2.5)`)
                                        .attr("d", d.icon.d)
                                            .transition()
                                            .duration(TRANSITIONS.FAST)
                                                .attr("fill", COLOURS.CARD.NOTIFICATION_BTN)
                                                .attr("opacity", shouldShowFlags ? 1 : 0.5);

                            
                                    btnG.select("rect.btn-hitbox")
                                        .attr("width", btnContentsWidth)
                                        .attr("height", btnContentsHeight)

                                })
                                .on("click", (e,d) => { 
                                    d.onClick(e, d) 
                                });

                        botLeftBtnG.exit().remove();

                        //flags
                        const flags = flagsComponents[id];

                        const flagsMargin = { top: 2, bottom: 2 }
                        const flagsContentsHeight = contentsHeight - flagsMargin.top - flagsMargin.bottom;
                        const mesgWidth = 20;
                        const mesgHeight = 10;
                        const eventWidth = 20;
                        const eventHeight = 10;
                        const maxFlagWidth = d3.max([mesgWidth, eventWidth]);

                        const flagsContainerG = contentsG.select("g.flags-container")
                            .classed("is-rendered-but-hidden", flagsTurnedOnForCard && !shouldShowFlags)
                            .call(updateTransform, { 
                                x:() => flagsTurnedOnForCard && shouldShowFlags ? -maxFlagWidth : 0,
                                y:() => 0,
                                transition:{ duration: 500 }
                            });
                        //@todo -tidy this below - shoulndt need to hardcode
                        //we have done this to avoid a transition on enter, which 
                        //caused main card transition to be jagged
                        if(flagsTurnedOnForCard){
                            flagsContainerG.attr("display", null)
                        }else{
                            flagsContainerG
                                .transition()
                                .delay(500)
                                .attr("display","none")
                        }

                        const flagsG = flagsContainerG.selectAll("g.flags").data([flagsData]);

                        flagsG.enter()
                            .append("g")
                                .attr("class", "flags")
                                .merge(flagsG)
                                .attr("transform", `translate(0, ${flagsMargin.top})`)
                                .call(flags
                                    .height(flagsContentsHeight)
                                    .mesgWidth(mesgWidth)
                                    .mesgHeight(mesgHeight)
                                    .eventWidth(eventWidth)
                                    .eventHeight(eventHeight)
                                    .alignment("right"))

                        flagsG.exit().call(remove);






                        //BACK CONTENTS ---------------------------------------
                        //header
                        const backHeader = backHeaderComponents[id]
                            .width(contentsWidth)
                            .height(headerHeight)
                            .withTitle(form?.formType !== "card-title")
                            .styles({
                                trophyTranslate:isHeld || isSelected ? 
                                    "translate(-3,3) scale(0.25)" : "translate(-45,3) scale(0.6)",
                                date:{ 
                                    fill:backDateColour, stroke:backDateColour 
                                },
                                dateCount:{
                                    numberFill:backDateColour, wordsFill:backDateCountWordsColour,
                                    numberStroke:backDateColour, wordsStroke:backDateCountWordsColour
                                },
                                title:{ fill: backTitleColour }
                            })
                            .fontSizes(fontSizes.info)
                            .onClick(function(e){
                                e.stopPropagation();
                                if(timeframeKey !== "singleDeck"){ return; }
                                onClickCard(e, cardD); 
                            })
                            .onClickDate(function(e){
                                e.stopPropagation();
                                if(timeframeKey !== "singleDeck"){ return; }
                                onClickCardDate(cardD, i); 
                            })
                            .onClickTitle(function(d, headerDimns){
                                e.stopPropagation();
                                if(timeframeKey !== "singleDeck"){ return; }
                                const dimns = {
                                    ...headerDimns,
                                    left:margin.left + headerDimns.left,
                                    top:margin.top + headerDimns.top
                                }
                                onClickCardTitle(cardD, i, dimns);
                            })

                        const backHeaderDatum = { ...info, itemsData:cardD.items, isSelected, isFront, isNext, isSecondNext, cardNr, id:headerId };
                        backContentsG.selectAll("g.card-back-header")
                            //.attr("pointer-events", deckIsSelected & (isHeld || isSelected) ? "all" : "none")
                            .datum(backHeaderDatum)
                            .call(backHeader)
                                .transition() //hide if small
                                .delay(200)
                                .duration(200)
                                    .attr("opacity", (isHeld || isSelected) ? 1 : 0);

                        //media
                        const media = mediaComponents[id]
                            .width(contentsWidth * 0.92)
                            .height(mediaHeight)

                        const shouldShowMedia = isFront && cardsAreFlipped && !selectedSectionKey;
                        const photosData = [
                            { 
                                key:"profile-1", 
                                url:`profile-media/d${deckListPos}c${0}p1.png`,  //`/d${deckListPos}c${cardNr}p1.png`,
                                transform:`scale(0.041)`, isVideo:true 
                            },
                            { 
                                key:"profile-2", 
                                url:`profile-media/d${deckListPos}c${0}p2.png`, //`/d${deckListPos}c${cardNr}p2.png`,
                                transform:`scale(0.041)`, isVideo:true 
                            },
                        ]
                        const mediaG = backContentsG.selectAll("g.profile-info").data(shouldShowMedia ? [1] : []);
                        mediaG.enter()
                            .append("g")
                                .attr("display", cardsAreFlipped ? null : "none")
                                .attr("class", "profile-info")
                                //fade in so it doesnt show up for a glimpse on first load of page
                                //.call(fadeIn, { transition:{ delay: 500, duration:500 }})
                                .merge(mediaG)
                                .attr("transform", `translate(0.5,${headerHeight})`)
                                .datum({ ...profile.info, photosData })
                                .call(media)
                                .call(fadeInOut, isFront, { 
                                    transitionIn:{ delay: 0, duration:200 },
                                    transitionOut:{ delay: 200, duration:200 }
                                });

                        mediaG.exit().remove();
                        
                        

                        //kpis
                        //const textInfoHeight = 20;
                        const kpis = kpisComponents[id]
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
                            //.kpiHeight(10)//kpiHeight)...
                            .fontSizes(4)//fontSizes.kpis)
                            //.kpiFormat(kpiFormat)
                            .displayFormat("stats")
                            .withTooltips(false)
                            .editable(false)
                            .scrollable(false)
                            .profileIsSelected(false)

                        const shouldShowKpis = /*deckIsSelected &&*/ isFront && cardsAreFlipped && !selectedSectionKey;

                        const kpisG = backContentsG.selectAll("g.kpis").data(shouldShowKpis ? [1] : []);
                        kpisG.enter()
                            .append("g")
                                .attr("class", "kpis")
                                .call(fadeIn)
                                .merge(kpisG)
                                .attr("transform", `translate(0, ${headerHeight + mediaHeight})`)
                                .datum(profile.kpis)
                                .call(kpis);

                        kpisG.exit().call(remove);
                    })
                    .call(drag)
                    .on("click", function(e, cardD){ 
                        e.stopPropagation(); 
                        if(!cardD.isHeld){ 
                            //console.log("calling pickup from click...")
                            onPickUp.call(this, cardD); 
                        }
                    })
  
            //EXIT
            cardG.exit().call(remove);

            function dragged(e , d){
                //console.log("drg")
                if(d.isSelected){ return; }
                if(swipeTriggered){ return; }
                //bug next - this is 0 when swiping down on items 4/5 -> need to look at teh drag handler inside cardItems, why dy is 0
                //also, dy should really be teh total of all dys so far, not just each dy
                if(Math.abs(deltaY) < 10){
                    deltaY += e.dy;
                    return;
                }
                const swipeDirection = deltaY <= 0 ? "up" : "down";
                const frontCard = data.find(c => c.isFront);

                let cardD;
                //CASE 1: THE BG IS DRAGGED, NOT A CARD
                if(Array.isArray(d)){
                    //the bg has been dragged, so apply it to the correct card
                    if(swipeDirection === "down"){
                        cardD = frontCard;
                    }else{
                        const nr = frontCard ? d3.max([0, frontCard.cardNr - 1]) : data.length - 1;
                        cardD = data.find(c => c.cardNr === nr);
                    } 
                }else{
                    //the card itself has been dragged
                    cardD = d;
                }


                //CASE 2 - A PLACED CARD IS DRAGGED UP
                if(swipeDirection === "up" && !cardD.isHeld){ 
                    swipeTriggered = true;
                    //const cardNode = containerG.select(`g.card-${cardD.cardNr}`).node();
                    //console.log("calling pickup1......")
                    //onPickUp.call(cardNode, cardD);
                    onPickUp(cardD)
                    
                }
                //CASE 3 - A HELD CARD IS DRAGGED UP -> pick up the next card
                if(swipeDirection === "up" && cardD.isHeld){
                    swipeTriggered = true;
                    const nr = d3.max([0, frontCard.cardNr - 1]);
                    const cardD = data.find(c => c.cardNr === nr);
                    //const cardNode = containerG.select(`g.card-${cardD.cardNr}`).node();
                    //console.log("calling pickup2.........")
                    //onPickUp.call(cardNode, cardD);
                    onPickUp(cardD)
                }
                if(swipeDirection === "down" && cardD.isHeld){
                    swipeTriggered = true;
                    //const cardNode = containerG.select(`g.card-${cardD.cardNr}`).node();
                    //console.log("calling putdown1.......", cardNode)
                    onPutDown(cardD);
                }
                if(swipeDirection === "down" && !cardD.isHeld){
                    swipeTriggered = true;
                    //const cardNode = containerG.select(`g.card-${cardD.cardNr}`).node();
                    //console.log("calling putdown2.....", cardNode)
                    onPutDown(frontCard);
                }
                //cleanup here because dragEnd seems to not be called sometimes - an update cuts off the drag handling
                //@todo - fix the issue above properly
                //cleanUp();
            }

            function dragEnd(e, d){
                //console.log("cards dragEnd")
                if(d.isSelected){ return; }
                cleanUp();
            }
            function cleanUp(e,d){
                //console.log("cleanup----------------")
                swipeTriggered = false;
                deltaY = 0;
            }

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
    cards.groupingTag = function (value) {
        if (!arguments.length) { return groupingTag; }
        groupingTag = value;
        return cards;
    };
    cards.timeframeKey = function (value) {
        if (!arguments.length) { return timeframeKey; }
        timeframeKey = value;
        return cards;
    };
    cards.deckIsSelected = function (value) {
        if (!arguments.length) { return deckIsSelected; }
        if(value !== deckIsSelected){
            Object.values(itemsComponents).forEach(itemsComponent => {
                itemsComponent.clickedItemNr(null);
            })
        }
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
    cards.selectedSectionKey = function (value) {
        if (!arguments.length) { return selectedSectionKey; }
        selectedSectionKey = value;
        Object.values(frontHeaderComponents).forEach(header => {
            header.selectedSectionKey(value);
        })
        Object.values(itemsComponents).forEach(itemsComponent => {
            itemsComponent.selectedSectionKey(value);
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
    cards.onAddCard = function (value) {
        if (!arguments.length) { return onAddCard; }
        onAddCard = value;
        return cards;
    };
    cards.onDeleteCard = function (value) {
        if (!arguments.length) { return onDeleteCard; }
        onDeleteCard = value;
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
    cards.setForm = function (value) {
        if (!arguments.length) { return setForm; }
        setForm = value;
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
