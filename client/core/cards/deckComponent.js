import * as d3 from 'd3';
import { grey10, COLOURS, DIMNS, FONTSIZES, STYLES, INFO_HEIGHT_PROPORTION_OF_CARDS_AREA, TRANSITIONS } from "./constants";
import cardsComponent from './cardsComponent';
import headerComponent from './headerComponent';
import contextMenuComponent from "./contextMenuComponent";
import textComponent from './textComponent';
import dragEnhancements from '../journey/enhancedDragHandler';
import { updateRectDimns } from '../journey/transitionHelpers';
import { getTransformationFromTrans } from '../journey/helpers';
import { isNumber } from '../../data/dataHelpers';
import { maxDimns } from "../../util/geometryHelpers";
import { angleFromNorth } from '../journey/screenGeometryHelpers';
import { icons } from '../../util/icons';
import { fadeIn, remove, getPosition, fadeInOut } from '../journey/domHelpers';
import { TextBox } from 'd3plus-text';
import { ContactSupportOutlined } from '@material-ui/icons';

const magIconPath1D = "M39.94,44.142c-3.387,2.507 7.145,-8.263 4.148,-4.169c0.075,-0.006 -0.064,0.221 -0.53,0.79c0,0 8.004,7.95 11.933,11.996c1.364,1.475 -1.097,4.419 -2.769,2.882c-3.558,-3.452 -11.977,-12.031 -11.99,-12.045l-0.792,0.546Z"
const magIconPath2D = "M28.179,48.162c5.15,-0.05 10.248,-2.183 13.914,-5.806c4.354,-4.303 6.596,-10.669 5.814,-16.747c-1.34,-10.415 -9.902,-17.483 -19.856,-17.483c-7.563,0 -14.913,4.731 -18.137,11.591c-2.468,5.252 -2.473,11.593 0,16.854c3.201,6.812 10.431,11.518 18.008,11.591c0.086,0 0.172,0 0.257,0Zm-0.236,-3.337c-7.691,-0.074 -14.867,-6.022 -16.294,-13.648c-1.006,-5.376 0.893,-11.194 4.849,-15.012c4.618,-4.459 11.877,-5.952 17.913,-3.425c5.4,2.261 9.442,7.511 10.187,13.295c0.638,4.958 -1.141,10.154 -4.637,13.733c-3.067,3.14 -7.368,5.014 -11.803,5.057c-0.072,0 -0.143,0 -0.215,0Z"
const CONTEXT_MENU_ITEM_WIDTH = 30;
const CONTEXT_MENU_ITEM_HEIGHT = 50;
const CONTEXT_MENU_ITEM_GAP = 15;

const contextMenuData = [ 
    { key:"delete", url:"/delete.png" }, 
    { key:"archive", url:"/archive.png" },
    { key:"copy", url:"/copy.png" }
]

export default function deckComponent() {
    //API SETTINGS
    // dimensions
    let width = 300;
    let height = 600
    let margin = { left: 0, right: 0, top: 0, bottom: 0 };
    //let margin = { left: 40, right: 40, top: 20, bottom: 20 };
    let extraMargin; //if deck dont take up full space

    let contentsWidth;
    let contentsHeight;

    let headerWidth;
    let headerHeight;

    let cardsAreaWidth;
    let cardsAreaHeight;

    let cardsAreaAspectRatio;
    let botSpaceHeight;

    let heldCardsAreaHeight;
    let placedCardsAreaHeight;
    let cardHeaderHeight;

    let vertSpaceForIncs;

    let heldCardWidth;
    let heldCardHeight;
    //const cardAspectRatio = 88/62; - normal deck
    const cardAspectRatio = (62/88) * 1.1; //wider

    let placedCardWidth;
    let placedCardHeight;
    let placedCardMarginVert;
    let placedCardHorizGap;

    let extraMarginLeftForCards;

    //increments
    let vertCardInc;
    let horizCardInc;

    let selectedCardWidth;
    let selectedCardHeight;

    let sectionViewHeldCardWidth;
    let sectionViewHeldCardHeight;

    let cardX;
    let cardY;

    function updateDimns(data){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        headerWidth = contentsWidth;
        headerHeight = DIMNS.DECK.HEADER_HEIGHT;

        cardsAreaWidth = contentsWidth;
        cardsAreaHeight = contentsHeight - headerHeight;

        //this aspectRatio is only needed to aid with selecting a card to takeover entire area
        cardsAreaAspectRatio = cardsAreaWidth/cardsAreaHeight;

        cardHeaderHeight = contentsHeight * INFO_HEIGHT_PROPORTION_OF_CARDS_AREA;
        const minInc = cardHeaderHeight * 0.9;
        const visibleVertCardInc = i => {
            const incA = minInc * 0.6;// 16;
            const incB = minInc * 0.4;// 10;
            const incC = minInc * 0.1;// 4;
            const incD = 0;
            if(i === 0) { return 0; }
            if(i === 1) { return minInc + incA }
            if(i === 2) { return (minInc * 2) + incA + incB; }
            if(i === 3) { return (minInc * 3) + incA + incB + incC; }
            if(i === 4) { return (minInc * 4) + incA + incB + incC + incD; }
        };

        //@todo - change the way horiz is done so its the other way round like vert
        //so horizSpaceForIncs can be calculated after in same way as vertSpaceForIncs
        const maxHorizSpaceForIncs = 20;
        const horizSpaceForVisibleIncs = d3.min([cardsAreaWidth * 0.25, maxHorizSpaceForIncs]); 
        const horizSpaceForNonVisibleIncs = horizSpaceForVisibleIncs * 0.4;
        const visibleHorizCardInc = i => {
            if(i === 0) { return 0; }
            if(i === 1) { return horizSpaceForVisibleIncs * 0.1; }
            if(i === 2) { return horizSpaceForVisibleIncs * (0.1 + 0.13); }
            if(i === 3) { return horizSpaceForVisibleIncs * (0.1 + 0.13 + 0.3); }
            if(i === 4) { return horizSpaceForVisibleIncs * (0.1 + 0.13 + 0.3 + 0.47); }
        };

        //when deck is reduced in size, the cards behind are not visible exceot a tiny bit
        const nonVisibleVertInc = i => i * cardHeaderHeight * 0.2;
        const nonVisibleHorizInc = i => (i/5) * horizSpaceForNonVisibleIncs; //5 cards

        vertCardInc = deckIsSelected ? visibleVertCardInc : nonVisibleVertInc;
        horizCardInc = deckIsSelected ? visibleHorizCardInc : nonVisibleHorizInc;

        //NOTE: this max must also be same regardless of multideck view or single deck view
        const maxHeldCardWidth = cardsAreaWidth - (horizSpaceForVisibleIncs * 2); //need it to be symmetrical
        //NOTE: vertSpaceForIncs is the same regardless of whether the deck is selected 
        //(ie all card info sections visible) or not
        vertSpaceForIncs = visibleVertCardInc(4);
        //vertSpaceForIncs = vertCardInc(4);
        placedCardsAreaHeight = d3.min([80, cardsAreaHeight/7]); 
        heldCardsAreaHeight = cardsAreaHeight - placedCardsAreaHeight;

        //need to use visibleVertCardInc to calc the dimns...
        const maxHeldCardHeight = cardsAreaHeight - vertSpaceForIncs - placedCardsAreaHeight;
        const heldCardDimns = maxDimns(maxHeldCardWidth, maxHeldCardHeight, cardAspectRatio);
        heldCardWidth = heldCardDimns.width;
        heldCardHeight = heldCardDimns.height;

        //placed deck
        const maxPlacedCardHeight = placedCardsAreaHeight * 0.8;
        //ensure at least 0.1 for gaps
        const maxPlacedCardWidth = (heldCardWidth * 0.9)/5;
        const placedCardDimns = maxDimns(maxPlacedCardWidth, maxPlacedCardHeight, cardAspectRatio)
        placedCardWidth = placedCardDimns.width;
        placedCardHeight = placedCardDimns.height;

        placedCardHorizGap = (heldCardWidth - 5 * placedCardWidth) / 4;

        extraMarginLeftForCards = (cardsAreaWidth - heldCardWidth)/2;
        placedCardMarginVert = (placedCardsAreaHeight - placedCardHeight)/2;

        //section view changes
        //note - for now, its 1 item per card per section
        sectionViewHeldCardWidth = heldCardWidth;
        sectionViewHeldCardHeight = heldCardsAreaHeight / data.cards.length;

        //selected card dimns
        const selectedCardDimns = maxDimns(cardsAreaWidth, cardsAreaHeight, cardAspectRatio)
        selectedCardWidth = selectedCardDimns.width;
        selectedCardHeight = selectedCardDimns.height;

        //cardX and Y
        cardX = (d,i) => {
            if(selectedSection?.key && d.isHeld){
                const gapForHorizIncs = contentsWidth - sectionViewHeldCardWidth;
                const horizInc = gapForHorizIncs / 4;
                return (4 - i) * horizInc;
            }
            if(d.isSelected){
                //keep it centred
                return (cardsAreaWidth - selectedCardWidth)/2;
            }
            if(d.isHeld){
                return extraMarginLeftForCards + horizCardInc(d.handPos);
            }
            return extraMarginLeftForCards + d.cardNr * (placedCardWidth + placedCardHorizGap);
        }

        cardY = (d,i) => {
            if(selectedSection?.key && d.isHeld){
                return i * sectionViewHeldCardHeight;
            }
            if(d.isSelected){
                return (cardsAreaHeight - selectedCardHeight)/2;
            }
            
            if(d.isHeld){
                //extra shift up in multiview to create a pseudo margin between decks
                //const vertShiftUpForMultiview = heldCardsAreaHeight * 0.25; 
                //in multideck view, not all the incr space is taken up
                const totalVertIncs = vertSpaceForIncs;// deckIsSelected ? vertSpaceForIncs : vertCardInc(4);
                const extraMarginTop = (heldCardsAreaHeight - heldCardHeight - totalVertIncs)/2;
                //return extraMarginTop + totalVertIncs - vertCardInc(d.handPos) 
                return extraMarginTop + totalVertIncs - vertCardInc(d.handPos) 
                    // - (deckIsSelected ? 0 : vertShiftUpForMultiview)
            }

            //extra shift up in multiview to create a pseudo margin between decks
            const vertShiftUpForMultiview = heldCardsAreaHeight * 0.15; 
            return heldCardsAreaHeight + placedCardMarginVert //- (deckIsSelected ? 0 : vertShiftUpForMultiview);
        }
    }
    let DEFAULT_STYLES = {
        deck:{ info:{ date:{ fontSize:9 } } },
    }
    let _styles = () => DEFAULT_STYLES;

    //settings
    let deckIsSelected;
    let selectedCardNr;
    let selectedItemNr;
    let selectedSection;
    let content = "cards"; //can be "purpose"
    let format;
    let cardsAreFlipped = false;
    let form;
    let transformTransition;
    let longpressedDeckId;

    //for dragging decks
    let getCell = position => [0,0];
    let cloneG;
    let newCell;

    //controlbtns
    const btnDrag = d3.drag();

    //data 
    let id;

    let onFlipCards = function(){};
    let onSelectItem = function(){};
    let onSelectSection = function(){};
    let onSetContent = function(){};
    let onClickDeck = function(){};
    let onSetLongpressed = function(){};
    let onSetSelectedCardNr = function(){};
    let onMoveDeck = function(){};
    let onDeleteDeck = function(){};
    let onArchiveDeck = function(){};
    let onCopyDeck = function(){};
    let setForm = function(){};
    let updateItemStatus = function(){};
    let updateFrontCardNr = function(){};

    let deckIsLongpressed = false;
    let wasDragged = false;

    let handleDrag;
    let startLongpress;
    let endLongpress;

    let selectCard;
    let deselectCard;

    let containerG;
    let contentsG;
    let headerG;
    let cardsAreaG;
    let contextMenuG;
    let controlsG;

    //components
    const header = headerComponent();
    const cards = cardsComponent();
    const contextMenu = contextMenuComponent();
    const enhancedDrag = dragEnhancements();
    const purposeTextComponents = {};

    function deck(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;

        // expression elements
        selection.each(function (deckData) {
            updateDimns(deckData);
            id = deckData.id;
            //console.log("update", id, selectedSection?.key, selectedSection?.title)
            containerG = d3.select(this)

            if(containerG.select("g").empty()){
                init();
            }

            update(deckData);

            function init(){
                //bg
                /*containerG
                    .append("rect")
                        .attr("class", "deck-bg")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("fill", grey10(9));*/

                contentsG = containerG.append("g").attr("class", "deck-contents");

                contentsG.append("rect")
                    .attr("class", "contents-bg")
                    //.attr("pointer-events", "none")
                    .attr("fill", "none")
                    .attr("stroke", grey10(8))
                    .attr("rx", 3)
                    .attr("ry", 3);
                
                headerG = contentsG.append("g")
                    .attr("class", "header")
                    .attr("opacity", isNumber(selectedCardNr) ? 0 : 1);

                cardsAreaG = contentsG
                    .append("g")
                    .attr("class", "cards-area");

                containerG
                    .append("rect")
                        .attr("class", "deck-overlay")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("fill", "transparent")
                        .attr("opacity", 0.3);

                contextMenuG = containerG.append("g")
                    .attr("class", "context-menu")

                controlsG = contentsG.append("g").attr("class", "controls");
                controlsG.append("rect").attr("class", "controls-bg").attr("fill", COLOURS.DECK.CONTROLS)
            }

            function update(_deckData, options={}){
                const { } = options;
                const { id, frontCardNr, listPos, colNr, rowNr, purpose, sections } = _deckData;

                cardsAreaG.call(fadeInOut, content === "cards" /*{ transition:{ duration: 1000 } }*/);

                const purposeWidth = contentsWidth;
                const purposeHeight = contentsHeight - headerHeight;
                const purposeMargin = {
                    left: purposeWidth * 0.1, right:purposeWidth * 0.1,
                    top:purposeHeight * 0.1, bottom:purposeHeight * 0.1
                }
                const purposeContentsWidth = purposeWidth - purposeMargin.left - purposeMargin.right;
                const purposeContentsHeight = purposeHeight - purposeMargin.top - purposeMargin.bottom;

                const paragraphWidth = purposeContentsWidth;
                const paragraphHeight = purposeContentsHeight * 0.4;
                const paragraphMargin = { left:0, right:0, top:paragraphHeight * 0.1, bottom:paragraphHeight * 0.1 }
                const paragraphContentsWidth = paragraphWidth - paragraphMargin.left - paragraphMargin.right;
                const paragraphContentsHeight = paragraphHeight - paragraphMargin.top - paragraphMargin.bottom;

                const getPlaceholder = (d,i) => {
                    if(i === 0){ return "I will achieve..." }
                    if(i === 1){ return "I will do this by..." }
                    return "";
                }

                const nrLines = purpose?.length || 0;
                const paraFontSize = 6.5;
                const paragraphs = nrLines > 1 ? purpose : (nrLines === 1 ? [...purpose, ""] : ["", ""]);
                const paragraphsData = paragraphs
                    .map((text,i) => ({ 
                        text, 
                        i,
                        deckId:id,
                        placeholder:getPlaceholder(text, i),
                    }))
                const getPurposeFormDimns = i => ({
                    //@todo - vert can calc this based ont he variable length of previous paragraphs
                    width:paragraphContentsWidth,
                    height:paragraphContentsHeight,
                    left:margin.left + purposeMargin.left,
                    //extra added on end - not sure why it is needed
                    top:margin.top + headerHeight + purposeMargin.top 
                        + i * paragraphHeight + paragraphMargin.top - (4 + i * 1.5),
                    fontSize:paraFontSize
                })
        
                const purposeG = contentsG.selectAll("g.purpose").data(content === "purpose" ? [1] : [])

                purposeG.enter()
                    .append("g")
                        .attr("class", "purpose")
                        .call(fadeIn, { transition:{ delay:400 }})
                        .merge(purposeG)
                        .attr("transform", () => `translate(${purposeMargin.left}, ${headerHeight + purposeMargin.top})`)
                        .each(function(){
                            
                            const purposeG = d3.select(this);
                            //enter-exit each paragraph
                            const paragraphG = purposeG.selectAll("g.paragraph").data(paragraphsData);
                            paragraphG.enter()
                                .append("g")
                                    .attr("class", "paragraph")
                                    .each(function(d,i){
                                        const paragraphG = d3.select(this);

                                        paragraphG.append("rect").attr("class", "bg")
                                            .attr("fill", "transparent");

                                        purposeTextComponents[i] = textComponent()
                                            .text(d => d.text);
            
                                    })
                                    .merge(paragraphG)
                                    .attr("transform", (d,i) => `translate(0, ${i * paragraphHeight})`)
                                    .each(function(d,i){
                                        const paragraphG = d3.select(this);
                                        paragraphG.select("rect.bg")
                                            .attr("width", paragraphWidth)
                                            .attr("height", paragraphHeight)

                                        paragraphG.call(purposeTextComponents[i]
                                                .width(paragraphWidth)
                                                .height(paragraphHeight)
                                                .margin(paragraphMargin)
                                                .withAttachments(false)
                                                .placeholder(d.placeholder)
                                                .styles((d,i) => ({
                                                    verticalAlign:"top",
                                                    opacity:1,
                                                    fontFamily: "Avant Garde",
                                                    fontStyle:"italic",
                                                    stroke:grey10(2),
                                                    strokeWidth:0.05,
                                                    fill:grey10(3),
                                                    fontMin:4,
                                                    fontMax:10,
                                                    fontSize:paraFontSize,
                                                    placeholderFill:grey10(5),
                                                    placeholderStroke:grey10(5),
                                                    placeholderOpacity:0.5
                                                }))
                                            )
                                    })
                                    .on("click", function(e,d){
                                        setForm({ formType:"purpose", value:d, formDimns:getPurposeFormDimns(d.i) } )
                                        e.stopPropagation();
                                    })

                            paragraphG.exit().call(remove);


                           

                        })

                purposeG.exit().call(remove)

                //dimns for specific chart
                const cardsData = _deckData.cards
                    .map((card,i) => { 
                        const { cardNr } = card;
                        return {
                            ...card,
                            handPos:cardNr - frontCardNr,
                            isFront:cardNr === frontCardNr,
                            isNext:cardNr - 1 === frontCardNr,
                            isSecondNext:cardNr - 2 === frontCardNr,
                            isHeld:cardNr >= frontCardNr,
                            isSelected:selectedCardNr === card.cardNr
                        }
                    });

                //bg
                /*
                containerG.select("rect.deck-bg")
                    .attr("display", isNumber(selectedCardNr) ? null : "none")
                    .attr("width", width)
                    .attr("height", height)
                    .on("click", e => {
                        console.log("deck-bg click")
                        //deselectCard();
                        onSetSelectedCardNr("")
                        e.stopPropagation();
                        setForm(null);
                    })*/

                //contextMenu
                //note - hoz and vert margins are not the same proportion of total

                const menuMargin = {
                    left: CONTEXT_MENU_ITEM_WIDTH * 0.4, right:CONTEXT_MENU_ITEM_WIDTH * 0.4,
                    top:CONTEXT_MENU_ITEM_HEIGHT * 0.1, bottom: CONTEXT_MENU_ITEM_HEIGHT * 0.1
                }
    
                const nrItems = contextMenuData.length;
                const contextMenuWidth = nrItems * CONTEXT_MENU_ITEM_WIDTH + (nrItems - 1) * CONTEXT_MENU_ITEM_GAP + menuMargin.left + menuMargin.right;
                const contextMenuHeight = CONTEXT_MENU_ITEM_HEIGHT + menuMargin.top + menuMargin.bottom;
    
                
                const gapBetweenDeckAndMenu = rowNr === 0 ? -10 : 10;
                contextMenuG
                    .attr("transform", `translate(${(width - contextMenuWidth)/2},${-contextMenuHeight - gapBetweenDeckAndMenu})`)
                
                contextMenu
                    .itemWidth(CONTEXT_MENU_ITEM_WIDTH)
                    .itemHeight(CONTEXT_MENU_ITEM_HEIGHT)
                    .itemGap(CONTEXT_MENU_ITEM_GAP)
                    .menuMargin(menuMargin)
                    .onClick((e,d) => {
                        if(d.key === "delete"){ onDeleteDeck(id); }
                        if(d.key === "archive"){ onArchiveDeck(id); }
                        if(d.key === "copy"){ onCopyDeck(id); }
                        cleanupLongpress();
                        e.stopPropagation();
                    })

                //drag overlay
                enhancedDrag
                    .dragThreshold(100)
                    .onLongpressStart(function(){
                        onSetLongpressed(true); 
                    })
                    .onLongpressDragged(longpressDragged)
                    .onLongpressEnd(function(){
                        if(wasDragged){
                            onSetLongpressed(false);
                        }
                    });

                const drag = d3.drag()
                    .on("start", deckIsSelected ? null : enhancedDrag(dragStart))
                    .on("drag", deckIsSelected ? null : enhancedDrag(dragged))
                    .on("end", deckIsSelected ? null : enhancedDrag(dragEnd))

                function dragStart(e,d){
                }

                function dragged(e,d){
                    if(longpressedDeckId === id){ wasDragged = true; }
                    handleDrag(e);
                }

                function dragEnd(e,d){ 
                    if(longpressedDeckId === id && wasDragged){ 
                        onSetLongpressed(false); 
                    }
                }

                //issue - cloneG is a child of container, which moves, making the clone move too????
                startLongpress = function(e,d){
                    //d3.selectAll("g.deck").filter(d => d.id !== id).attr("pointer-events", "none");

                    //create a clone 
                    cloneG = containerG
                        .clone(true)
                        .attr("class", "cloned-deck")
                        .attr("pointer-events", "all") //override the pointerevents none for d3 when in multideck view
                        //.attr("pointer-events", "none") //this allows orig deck to be dragged
                        .attr("opacity", 1)
                        .call(drag)
                        .raise();
                    
                    cloneG.select("rect.deck-overlay").attr("fill", "green")
                    cloneG.select("g.context-menu")
                        .datum(contextMenuData)
                        .call(contextMenu)

                    //now we have cloned it, we hide the original
                    containerG.attr("opacity", 0)

                    //onSetLongpressed(true)
                }
                function longpressDragged(e,d){
                    wasDragged = true;
                    handleDrag(e);
                }

                handleDrag = function(e,d){
                    wasDragged = true;
                    if(!cloneG) { return; }
                    cloneG.select("g.context-menu").remove();

                    const { translateX, translateY } = getTransformationFromTrans(cloneG.attr("transform"));
                    const newX = translateX + e.dx;
                    const newY = translateY + e.dy;
                    const currentNewCell = getCell([newX, newY]);
                    const prevNewCell = newCell;
                    if(!prevNewCell || currentNewCell.key !== prevNewCell.key){
                        newCell = currentNewCell;
                        // add newCell stroke
                        d3.select(`g.deck-${newCell.deckId}`).select("rect.deck-overlay")
                            .attr("opacity", 0.8)
                            .attr("stroke", "green")
                            .attr("stroke-width", 3)
                    
                        //remove prev 
                        d3.select(`g.deck-${prevNewCell?.deckId}`).select("rect.deck-overlay")
                            .attr("opacity", 0.3)
                            .attr("stroke", null)
                            .attr("stroke-width", null)
                    }
                       
                    //drag the clone
                    cloneG.attr("transform", `translate(${newX},${newY})`);
                }

                endLongpress = function(){
                    if(newCell){
                        //@todo - handle grid format if layoutFormat is grid
                        onMoveDeck(listPos, newCell.listPos);

                        cloneG
                            .transition("clone")
                            .duration(TRANSITIONS.MED)
                            .attr("transform", `translate(${newCell.deckX},${newCell.deckY})`)
                            .on("end", function(){ cleanupLongpress(); })
                    }else{
                        cleanupLongpress();
                    }
                
                    //d3.selectAll("g.deck").filter(d => d.id !== id).attr("pointer-events", null);
                }

                function cleanupLongpress(){
                    cloneG.remove();
                    containerG.attr("opacity", 1);

                    //remove newCell stroke if it exists
                    d3.select(`g.deck-${newCell?.deckId}`).select("rect.deck-overlay")
                        .attr("opacity", 0.3)
                        .attr("stroke", null)
                        .attr("stroke-width", null)

                    onSetLongpressed(false);
                    newCell = null;

                }

                //containerG.call(drag);
                    
                containerG.select("rect.deck-overlay")
                    .attr("display", deckIsSelected ? "none" : null)
                    .attr("width", width)
                    .attr("height", height)
                    .on("click", e => {
                        //console.log("click deck overlay")
                        if(longpressedDeckId === id){ 
                            e.stopPropagation();
                            return;
                        }
                        onClickDeck(e, _deckData)
                    })
                    /*.call(updateRectDimns, { 
                        width: () => width, 
                        height:() => height,
                        transition:transformTransition,
                        name:d => `deck-dimns-${d.id}`
                    })*/

                //contents
                contentsG.attr("transform", `translate(${margin.left}, ${margin.top})`)

                contentsG
                    .select("rect.contents-bg")
                        .attr("width", contentsWidth)
                        .attr("height", contentsHeight)
                
                //header
                headerG
                    .datum({ ..._deckData, title:_deckData.title || id, subtitle:selectedSection?.title })
                    .call(header
                        .width(headerWidth)
                        .height(headerHeight)
                        .margin({ left: 7.5, right: 0, top: 0, bottom: 0 } )
                        .maxTitleFont(deckIsSelected ? 7 : 14)
                        .maxTitleChars(deckIsSelected ? 24 : 14)
                        .onClickTitle(function(e){
                            e.stopPropagation();
                            setForm({ formType: "deck-title" }) 
                        })
                        .onClickSubtitle(function(e){
                            e.stopPropagation();
                            setForm({ formType: "section", sectionKey:selectedSection.key }) 
                        })
                        .onClickProgressIcon(() => onSetContent("purpose")))

                selectCard = function(cardNr){
                    //hide/show others
                    //@todo - this can be part of update process instead
                    containerG.selectAll("g.card").filter(cardD => cardD.cardNr !== cardNr)
                        //.attr("pointer-events", "none")
                        .transition("cards")
                        .duration(400)
                            .attr("opacity", 0)
                                .on("end", function(){ d3.select(this).attr("display", "none"); })
                
                    headerG
                        .transition("header")
                        .duration(400)
                           .attr("opacity", 0)
                           .on("end", function(){ d3.select(this).attr("display", "none"); })

                    //selectedCardNr = d.cardNr;
                    //onSetSelectedCardNr(d.cardNr);
                    //update(deckData);
                }

                //2 issues - clicking card backgrounddoes nothing, but it should still prevent 
                //propagation to the div bg to deslect deck.

                //2nd - swiping the placed cards is not being picked up - perhaps start with clicking
                //all cards, check that is picked up, it should just prevetn ptopagtion thats all

                deselectCard = function(){
                    //hide/show others
                    //@todo - this can be part of update process instead
                    containerG.selectAll("g.card")//.filter(d => d.cardNr !== cardD.cardNr)
                        .attr("display", null)
                            .transition("cards")
                            .delay(400)
                            .duration(600)
                                .attr("opacity", 1)
                
                    headerG
                        .attr("display", null)
                            .transition("header")
                            .delay(400)
                            .duration(600)
                            .attr("opacity", 1)

                    //selectedCardNr = null
                    //update(deckData);
                    //onSetSelectedCardNr("");
                }

                cardsAreaG
                    .attr("transform", `translate(0, ${headerHeight})`)
                    .datum(cardsData)
                    .call(cards
                        .heldCardWidth(heldCardWidth)
                        .heldCardHeight(heldCardHeight)
                        .headerHeight(cardHeaderHeight)
                        .placedCardWidth(placedCardWidth)
                        .placedCardHeight(placedCardHeight)
                        .selectedCardWidth(selectedCardWidth)
                        .selectedCardHeight(selectedCardHeight)
                        .sectionViewHeldCardWidth(sectionViewHeldCardWidth)
                        .sectionViewHeldCardHeight(sectionViewHeldCardHeight)
                        .deckIsSelected(deckIsSelected)
                        .cardsAreFlipped(cardsAreFlipped)
                        .form(form)
                        .transformTransition(transformTransition)
                        .x(cardX)
                        .y(cardY)
                        .onSelectItem(onSelectItem)
                        .onClickCardDate((cardD,i) => {
                            setForm({
                                formType: "card-date",
                                value:cardD
                            })
                        })
                        .onClickCardTitle((cardD, i, cardDimns) => {
                            setForm({ 
                                formType: "card-title", 
                                value:cardD, 
                                formDimns:{
                                    ...cardDimns,
                                    left:margin.left + cardX(cardD, i) + cardDimns.left,
                                    top:margin.top + headerHeight + cardY(cardD, i) + cardDimns.top,
                                    //todo - scale for selected card

                                }
                            }) 
                        })
                        .onUpdateItemStatus(updateItemStatus)
                        .onClickCard(function(e, d){
                            if(!deckIsSelected){
                                onClickDeck(e, _deckData);
                            } else if(selectedCardNr === d.cardNr){
                                onSetSelectedCardNr("")
                            } else{
                                onSetSelectedCardNr(d.cardNr)
                            }
                        })
                        .onPickUp(function(d){
                            updateFrontCardNr(d.cardNr)
                        })
                        .onPutDown(function(d){
                            /*if(d.isSelected){
                                selectedCardNr = null;
                                //show other deck as we need to deselect the card too
                                containerG.selectAll("g.card").filter(dat => dat.cardNr !== d.cardNr)
                                    //.attr("pointer-events", null)
                                    .attr("opacity", 1);
                            }*/
                            updateFrontCardNr(d.cardNr + 1);
                        }))


            //controls
            const controlsData = !sections || cardsAreFlipped ? [] : [
                { key:"section-view" }
            ];

            const btnWidth = 10;
            const btnHeight = 18;
            const btnMargin = { left: 1, right: 1, top:5, bottom:5 }
            const btnContentsWidth = btnWidth - btnMargin.left - btnMargin.right;
            const btnContentsHeight = btnHeight - btnMargin.top - btnMargin.bottom;

            const controlsMarginVert = 0;
            const controlsContentsWidth = btnWidth;
            const controlsWidth = controlsContentsWidth;
            const controlsContentsHeight = controlsData.length * btnHeight;
            const controlsHeight = controlsContentsHeight + 2 * controlsMarginVert;
            
            const spaceAvailableOnLeftOfCards = (width - heldCardWidth)/2;
            const controlsOuterMarginLeft = (spaceAvailableOnLeftOfCards - controlsWidth)/2;
            const controlsOuterMarginBottom = controlsOuterMarginLeft;

            const xToCentre = -controlsOuterMarginLeft + (width - btnWidth)/2;//+ deckToCentrePos.x   // -controlsOuterMarginLeft + (width - btnWidth)/2;
            const cardItemsAreaHeight = heldCardHeight - cardHeaderHeight;
            const yToCentre = controlsOuterMarginBottom + controlsMarginVert - placedCardsAreaHeight - cardItemsAreaHeight/2 + btnHeight/2 + 1;

            controlsG.call(fadeInOut, content === "cards" && deckIsSelected && !isNumber(selectedCardNr) && !selectedSection?.key)
            controlsG
                .attr("transform", `translate(${controlsOuterMarginLeft},${height - controlsOuterMarginBottom - controlsHeight})`)


            controlsG.select("rect.controls-bg")
                .attr("width", controlsWidth)
                .attr("height", controlsHeight)
                .attr("rx", 1.5)
                .attr("ry", 1.5)

            let potentialSelectedSectionItemNr;
            const highlightSection = key => {
                const sectionG = containerG.selectAll("g.card").selectAll(`g.section-${key}`);
                sectionG.select("path.section-bg")
                    .transition("highlight")
                    .duration(TRANSITIONS.VERY_FAST)
                        .attr("fill", grey10(2))

                sectionG.selectAll("text.section-identifier")
                    .attr("transform", "scale(1)")
                        .transition("highlight")
                        .duration(TRANSITIONS.VERY_FAST)
                            .attr("fill", grey10(2))
                            .attr("font-size", FONTSIZES.SECTION_ID * 1.2)
                            .attr("opacity", 1)

                
            }

            const unhighlightSection = key => {
                const sectionG = containerG.selectAll("g.card").selectAll(`g.section-${key}`);
                sectionG.select("path.section-bg")
                    .transition("unhighlight")
                    .duration(TRANSITIONS.VERY_FAST)
                        .attr("fill", "transparent")

                sectionG.selectAll("text.section-identifier")
                    .transition("highlight")
                    .duration(TRANSITIONS.VERY_FAST)
                        .attr("fill", COLOURS.CARD.SECTION_ID)
                        .attr("font-size", FONTSIZES.SECTION_ID)
                        .attr("opacity", STYLES.SECTION_ID_OPACITY)

            }

            btnDrag
                .on("start", function(e,d){
                })
                .on("drag", function(e, d, i){
                    const btnG = d3.select(this);
                    const { translateX, translateY } = getTransformationFromTrans(btnG.attr("transform"));
                    const newX = translateX + e.dx;
                    const newY = translateY + e.dy;
                    btnG.attr("transform", `translate(${newX}, ${newY}) scale(${btnScaleWhenDragged})`);

                    //Determine the section
                    //const _x = newX - centreX;
                    //const _y = newY - centreY;
                    const _x = newX - xToCentre;
                    const _y = newY - yToCentre;

                    //console.log("_x", _x)
                    const distFromCentre = Math.sqrt(_x ** 2 + _y ** 2);
                    //console.log("distFromCentre", distFromCentre)
                    const theta = angleFromNorth([[_x, _y]])
                    //console.log("theta", Math.round(theta))
                    if(distFromCentre > cards.itemsOuterRadius()){ 
                        if(potentialSelectedSectionItemNr !== ""){ unhighlightSection(potentialSelectedSectionItemNr); }
                        potentialSelectedSectionItemNr = ""; 
                    }
                    else {
                        const newPotentialSelectedSectionItemNr = Math.floor(theta/(360/5));
                        
                        if(potentialSelectedSectionItemNr === ""){ highlightSection(newPotentialSelectedSectionItemNr) }
                        else { 
                            unhighlightSection(potentialSelectedSectionItemNr);
                            highlightSection(newPotentialSelectedSectionItemNr);
                        }
                        potentialSelectedSectionItemNr = newPotentialSelectedSectionItemNr;
                    }
                    //console.log("pot", potentialSelectedSectionItemNr)  
                })
                .on("end", function(e,d){
                    if(selectedSection?.key !== potentialSelectedSectionItemNr){
                        const section = sections.find(s => s.itemNr === potentialSelectedSectionItemNr)
                        onSelectSection(section?.key || "")
                        potentialSelectedSectionItemNr = "";
                    }else{
                        //call update here to clean up
                        update(_deckData)
                    }
                })
            
            const btnY = (d,i) => controlsMarginVert + i * btnHeight;
            const btnScaleWhenDragged = 1.8;
            
            const btnG = controlsG.selectAll("g.deck-control-btn").data(controlsData, d => d.key);
            btnG.enter()
                .append("g")
                    .attr("class", "deck-control-btn")
                    .each(function(d){
                        const btnG = d3.select(this);
                        
                        const btnContentsG = btnG.append("g").attr("class", 'btn-contents');
                        if(d.key === "section-view"){
                            btnContentsG.append("circle").attr("class", "btn-bg")
                                .attr("fill", COLOURS.DECK.CONTROLS)
                                .attr("opacity", 0.6)

                            const iconG = btnContentsG.append("g").attr("class", "icon")
                            iconG.append("path").attr("class", "path1")
                                .attr("fill", grey10(4));
                            iconG.append("path").attr("class", "path2")
                                .attr("fill", grey10(4));
                        }else{
                            btnContentsG.append("rect").attr("class", "btn-bg")
                                .attr("fill", COLOURS.DECK.CONTROLS)
                                .attr("opacity", 0.6)
                                .attr("rx", 1)
                                .attr("ry", 1);

                            const iconG = btnContentsG.append("g").attr("class", "icon");
                            //@todo - impl icons for other controls as they are added
                        }

                        //hitbox
                        btnG.append("rect")
                            .attr("class", "hitbox")
                            .attr("fill", "transparent");

                    })
                    .merge(btnG)
                    .attr("transform-origin",(d,i) => `${btnWidth/2} ${btnY(d,i) + btnHeight/2}`)
                    //.attr("transform", (d,i) => `translate(0, ${btnY(d,i)})`)
                    .attr("transform", (d,i) => `translate(0, ${btnY(d,i)})`)
                    .each(function(d){
                        const btnG = d3.select(this);

                        btnG.select("rect.hitbox")
                            .attr("width", btnWidth)
                            .attr("height", btnHeight)

                        const btnContentsG = btnG.select("g.btn-contents")
                            .attr("transform", `translate(${btnMargin.left},${btnMargin.top})`);

                        if(d.key === "section-view"){
                            //bg
                            const r = btnContentsWidth/2;
                            btnContentsG.select("circle.btn-bg")
                                .attr("cx", r)
                                .attr("cy", r)
                                .attr("r", r)
                                .attr("stroke", "white")
                                .attr("stroke-width", 0.05)

                            //icon
                            const iconG = btnContentsG.select("g.icon")
                            .attr("transform", `translate(0.6,0.6) scale(0.12)`);

                            iconG.select("path.path1")
                                .attr("d", magIconPath1D)
                            iconG.select("path.path2")
                                .attr("d", magIconPath2D)
                        }else{
                            //bg
                            btnContentsG.select("rect.btn-bg")
                                .attr("width", btnContentsWidth)
                                .attr("height", btnContentsHeight)
                        }

                    })
                    .call(btnDrag)

            btnG.exit().remove();

            //deck botright btn
            const closeBtnDatum = { 
                key:"close", 
                onClick:e => { 
                    e.stopPropagation();
                    if(selectedSection?.key){
                        onSelectSection() 
                    }else{
                        onSetContent("cards");
                    }
                },
                fill:grey10(3),
                icon:icons.close,
            }

            const flipBtnDatum = { 
                key:"flip", 
                onClick:e => { 
                    e.stopPropagation();
                    onFlipCards();
                },
                fill:grey10(5),
                icon:icons.flip,
            }

            const inSectionOrPurposeView = selectedSection?.key || content === "purpose";
            let cornerBtnData = !deckIsSelected ? [] : (inSectionOrPurposeView ? [closeBtnDatum] : [flipBtnDatum]);
            const cornerBtnHeight = 20;
            const cornerBtnWidth = cornerBtnHeight;
            //assumme all are square
            //note: 0.8 is a bodge coz iconsseems to be bigger than they state
            const scale = d => (0.8 * cornerBtnHeight)/d.icon.height;
            const cornerBtnMargin = cornerBtnHeight * 0.1;
            const cornerBtnContentsWidth = cornerBtnWidth - 2 * cornerBtnMargin;
            const cornerBtnContentsHeight = cornerBtnHeight - 2 * cornerBtnMargin;
            const cornerBtnG = contentsG.selectAll("g.corner-btn").data(cornerBtnData, d => d.key);
            cornerBtnG.enter()
                .append("g")
                    .attr("class", "corner-btn")
                    .call(fadeIn)
                    .each(function(d){
                        const btnG = d3.select(this);
                        btnG.append("path");

                        btnG.append("rect").attr("class", "btn-hitbox")
                            .attr("fill", "transparent")
                            //.attr("fill", "red")
                            .attr("opacity", 0.3)
                            .attr("stroke", "none")
                    })
                    .merge(cornerBtnG)
                    .attr("transform", `translate(
                        ${contentsWidth - cornerBtnWidth + cornerBtnMargin},
                        ${contentsHeight - cornerBtnHeight + cornerBtnMargin})`)
                    .each(function(d){
                        const btnG = d3.select(this);
                        btnG.select("path")
                            .attr("transform", `scale(${scale(d)})`)
                            .attr("d", d.icon.d)
                            .attr("fill", d.fill)
                
                        btnG.select("rect.btn-hitbox")
                            .attr("width", cornerBtnContentsWidth)
                            .attr("height", cornerBtnContentsHeight)

                    })
                    .on("click", (e,d) => { 
                        d.onClick(e, d) 
                    });

                cornerBtnG.exit().remove();
            

            }

        })

        return selection;
    }
    
    //api
    deck.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return deck;
    };
    deck.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return deck;
    };
    deck.styles = function (value) {
        if (!arguments.length) { return _styles; }
        if(typeof value === "function"){
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value(d,i) });
        }else{
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value });
        }
        
        return deck;
    };
    deck.deckIsSelected = function (value) {
        if (!arguments.length) { return deckIsSelected; }
        deckIsSelected = value; 
        return deck;
    };
    deck.selectedCardNr = function (value) {
        if (!arguments.length) { return selectedCardNr; }
        if(isNumber(value) && selectedCardNr !== value){
            selectCard(value);
            //pass it on
            cards.selectedCardNr(value);
        }
        if(value === "" && selectedCardNr !== ""){
            deselectCard();
            //pass it on
            cards.selectedCardNr("");
        }
        selectedCardNr = value;
        return deck;
    };
    deck.selectedItemNr = function (value) {
        if (!arguments.length) { return selectedItemNr; }
            selectedItemNr = value;
            cards.selectedItemNr(value);
        return deck;
    };
    deck.selectedSection = function (value) {
        if (!arguments.length) { return selectedSection; }
        selectedSection = value;
        //cards dont need selected section info, just key
        cards.selectedSectionKey(value?.key || "");
        return deck;
    };
    deck.content = function (value) {
        if (!arguments.length) { return content; }
        content = value;
        return deck;
    };
    deck.cardsAreFlipped = function (value) {
        if (!arguments.length) { return cardsAreFlipped; }
        cardsAreFlipped = value;
        return deck;
    };
    deck.format = function (value) {
        if (!arguments.length) { return format; }
        format = value;
        return deck;
    };
    deck.form = function (value) {
        if (!arguments.length) { return form; }
        form = value;
        return deck;
    };
    deck.transformTransition = function (value) {
        if (!arguments.length) { return transformTransition; }
        transformTransition = value; 
        return deck;
    };
    deck.longpressedDeckId = function (value) {
        if (!arguments.length) { return longpressedDeckId; }
        if(longpressedDeckId === id && value !== id){
            endLongpress();
        }else if(longpressedDeckId !== id && value === id){
            startLongpress();
        }
        longpressedDeckId = value;
        return deck;
    };
    deck.getCell = function (func) {
        if (!arguments.length) { return getCell; }
        getCell = func;
        return deck;
    };
    //functions
    deck.onFlipCards = function (value) {
        if (!arguments.length) { return onFlipCards; }
        onFlipCards = value;
        return deck;
    };
    deck.onSetContent = function (value) {
        if (!arguments.length) { return onSetContent; }
        onSetContent = value;
        return deck;
    };
    deck.onClickDeck = function (value) {
        if (!arguments.length) { return onClickDeck; }
        onClickDeck = value;
        return deck;
    };
    deck.onMoveDeck = function (value) {
        if (!arguments.length) { return onMoveDeck; }
        onMoveDeck = value;
        return deck;
    };
    deck.onDeleteDeck = function (value) {
        if (!arguments.length) { return onDeleteDeck; }
        onDeleteDeck = value;
        return deck;
    };
    deck.onArchiveDeck = function (value) {
        if (!arguments.length) { return onArchiveDeck; }
        onArchiveDeck = value;
        return deck;
    };
    deck.onCopyDeck = function (value) {
        if (!arguments.length) { return onCopyDeck; }
        onCopyDeck = value;
        return deck;
    };
    deck.onSetLongpressed = function (value) {
        if (!arguments.length) { return onSetLongpressed; }
        onSetLongpressed = value;
        return deck;
    };
    deck.onSetSelectedCardNr = function (value) {
        if (!arguments.length) { return onSetSelectedCardNr; }
        onSetSelectedCardNr = value;
        return deck;
    };
    deck.onSelectItem = function (value) {
        if (!arguments.length) { return onSelectItem; }
        onSelectItem = value;
        return deck;
    };
    deck.onSelectSection = function (value) {
        if (!arguments.length) { return onSelectSection; }
        onSelectSection = value;
        return deck;
    };
    deck.updateItemStatus = function (value) {
        if (!arguments.length) { return updateItemStatus; }
        updateItemStatus = value;
        return deck;
    };
    deck.updateFrontCardNr = function (value) {
        if (!arguments.length) { return updateFrontCardNr; }
        updateFrontCardNr = value;
        return deck;
    };
    deck.setForm = function (value) {
        if (!arguments.length) { return setForm; }
        setForm = value;
        return deck;
    };
    deck.startLongpress = function () { startLongpress(); };
    deck.endLongpress = function () { endLongpress(); };
    deck.handleDrag = function (e) { handleDrag(e); };
    return deck;
}
