import * as d3 from 'd3';
import { DIMNS, grey10, COLOURS, TRANSITIONS, STYLES } from "./constants";
import dragEnhancements from '../journey/enhancedDragHandler';
import cardHeaderComponent from './cardHeaderComponent';
import cardItemsComponent from './cardItemsComponent';
import mediaComponent from '../journey/mediaComponent';
import kpisComponent from '../journey/kpis/kpisComponent';
import { fadeIn, fadeInOut, remove } from '../journey/domHelpers';
import { updateTransform } from '../journey/transitionHelpers';
import { icons } from '../../util/icons';
import { isNumber } from '../../data/dataHelpers';

const { GOLD, SILVER } = COLOURS;

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
        const heldCardWidthToUse = selectedSectionKey ? sectionViewHeldCardWidth : heldCardWidth;
        const heldCardHeightToUse = selectedSectionKey ? sectionViewHeldCardHeight : heldCardHeight;
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
    let selectedSectionKey;

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

    let drag = d3.drag();

    //dom
    let containerG;
    //components
    let frontHeaderComponents = {};
    let itemsComponents = {};
    let backHeaderComponents = {};
    let mediaComponents = {};
    let kpisComponents = {};

    /*
    //darker blue-purple
    background: hsla(211, 96%, 62%, 1);

    background: linear-gradient(90deg, hsla(211, 96%, 62%, 1) 0%, hsla(295, 94%, 76%, 1) 100%);

    background: -moz-linear-gradient(90deg, hsla(211, 96%, 62%, 1) 0%, hsla(295, 94%, 76%, 1) 100%);

    background: -webkit-linear-gradient(90deg, hsla(211, 96%, 62%, 1) 0%, hsla(295, 94%, 76%, 1) 100%);

    filter: progid: DXImageTransform.Microsoft.gradient( startColorstr="#439CFB", endColorstr="#F187FB", GradientType=1 );
*/

    /*background: hsla(206, 91%, 66%, 1);

background: linear-gradient(90deg, hsla(206, 91%, 66%, 1) 0%, hsla(190, 90%, 51%, 1) 100%);

background: -moz-linear-gradient(90deg, hsla(206, 91%, 66%, 1) 0%, hsla(190, 90%, 51%, 1) 100%);

background: -webkit-linear-gradient(90deg, hsla(206, 91%, 66%, 1) 0%, hsla(190, 90%, 51%, 1) 100%);

filter: progid: DXImageTransform.Microsoft.gradient( startColorstr="#5AB2F7", endColorstr="#12CFF3", GradientType=1 );
*/

    function cards(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log=false } = options;
        updateDimns();
        selection.each(function (data) {
            containerG = d3.select(this);

            drag
                .on("drag", dragged)
                .on("end", dragEnd)

            const getFrontCardFill = d => COLOURS.CARD.FILL(d, deckIsSelected);

            const getProgressStatusFill = d => { 
                const { isSelected, isFront, isNext, isSecondNext, info } = d;
                const { status } = info;

                if(isFront || isSelected){ 
                    return status === 2 ? GOLD : (status === 1 ? grey10(1) : SILVER) 
                }
                if(isNext){ 
                    return status === 2 ? GOLD : (status === 1 ? SILVER : grey10(4))
                }
                if(isSecondNext){ 
                    return status === 2 ? GOLD : (status === 1 ? SILVER : "#B0B0B0") //4.5 
                }
                if(d.isHeld){
                    return status === 2 ? GOLD : (status === 1 ? SILVER : grey10(5))
                }
                //its placed
                return status === 2 ? GOLD : (status === 1 ? SILVER : grey10(5))
            };

            const getItemStrokeWidth = (itemD, cardD={}) => {
                const { status, isSectionView, title } = itemD;
                const { isHeld, isSelected } = cardD;
                if(!title){ return 0.15 }
                if(deckIsSelected){
                    if(isHeld || isSelected){
                        return status === 2 ? 1 : (status === 1 ? 0.8 : 0.2);
                    }
                    return status === 2 ? 3 : (status === 1 ? 2 : 0.2)
                }
                //multiple deck view
                if(isHeld || isSelected){
                    return status === 2 ? 1.5 : (status === 1 ? 1 : 0.2);
                }
                return status === 2 ? 3 : (status === 1 ? 2 : 0.2);
            }

            //we also use this for the card stoke when in section view, as each card only has one item
            const getItemStroke = (itemD, cardD={}) => {
                const { title, status, isSectionView } = itemD;
                const { isHeld, isSelected } = cardD;

                if(!title){ return GOLD; }

                if(isSectionView){
                    //if(!title) { return grey10(6); }
                    return status === 2 ? GOLD : (status === 1 ? SILVER : COLOURS.CARD.SECTION_VIEW_STROKE);
                }

                //deal with non-defined items separately, incase a user deletes title of an item
                //if(!title) { return isHeld || isSelected ? "#989898" : grey10(6) }

                if(isHeld || isSelected){
                    return status === 2 ? GOLD : (status === 1 ? SILVER : "#989898")
                }
                return status === 2 ? GOLD : (status === 1 ? SILVER : grey10(6))   
            }

            const getCardStroke = d => {
                if(d.isFront){ return grey10(1); }
                if(d.isNext){ return SILVER; }
                if(d.isSecondNext){ return grey10(4); }
                return (d.isSelected || d.isHeld ? grey10(5) : grey10(8))
            }

            const getBackCardFill = d =>  "#181818" //grey10.5
            const getBackCardStroke = d => grey10(6);
            const getBackCardStrokeWidth = d => 0.5;

            
           
            //in section view, we use the card storke to show status compleitn of seciton item
            //@todo later - in future, this may be more than one item so we will need to use item bg stroke instead
            const getSectionViewCardStroke = itemsData => {
                //can assume 1 item per card per section for now
                const itemD = itemsData[0];
                return getItemStroke({ ...itemD, isSectionView:true });
            }

            const getSectionViewCardStrokeWidth = itemsData => {
                //can assume 1 item per card per section for now
                const itemD = itemsData ? itemsData[0] : null;
                return itemD?.title ? STYLES.CARD.STROKE_WIDTH : 0.15
            }

            //bgdrag
            containerG.call(drag).on('click', function(){ console.log("clicked", this)});

            console.log("update cards", deckIsSelected)

            const cardG = containerG.selectAll("g.card").data(data, d => d.cardNr);
            cardG.enter()
                //.insert("g", ":first-child")
                .append("g")
                    .attr("class", d => `card card-${d.cardNr}`)
                    .attr("opacity", 1)
                    .each(function(cardD,i){
                        const { cardNr, isHeld, isSelected, profile } = cardD;

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
                                .attr("fill", selectedSectionKey ? COLOURS.CARD.SECTION_VIEW_FILL : getFrontCardFill(cardD))
                                .attr("stroke", selectedSectionKey ? COLOURS.CARD.SECTION_VIEW_STROKE : getCardStroke(cardD))
                                .attr("stroke-width", selectedSectionKey ? getSectionViewCardStrokeWidth() : STYLES.CARD.STROKE_WIDTH)
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
                                .attr("width", isHeld ? contentsWidth : normalContentsWidth)
                                .attr("height", isHeld ? contentsHeight : normalContentsHeight)
                                .attr("opacity", cardsAreFlipped ? 1 : 0)
                                .attr("fill", getBackCardFill(cardD))
                                .attr("stroke", getBackCardStroke(cardD))
                                .attr("stroke-width", getBackCardStrokeWidth(cardD));

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
                                //.attr("opacity", deckIsSelected & (isHeld || isSelected) ? 1 : 0)

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
                        const { cardNr, isHeld, isFront, isNext, isSecondNext, isSelected, info, status, profile, deckListPos } = cardD;
                        const itemsData = selectedSectionKey ? cardD.items.filter(it => it.section?.key === selectedSectionKey) : cardD.items;
                        const cardG = d3.select(this)
                            .call(fadeInOut, itemsData.length !== 0 && (!isNumber(selectedCardNr) || selectedCardNr === cardNr));

                        const contentsG = cardG.select("g.card-contents")
                            .attr("transform", `translate(${margin.left},${margin.top})`)

                        //bgs for front and back
                        contentsG.select("rect.card-front-bg")
                            .transition("card-front-bg-appearance")
                            .delay(200)
                            .duration(400)
                                .attr("fill", selectedSectionKey ? COLOURS.CARD.SECTION_VIEW_FILL : getFrontCardFill(cardD))
                                .attr("stroke", selectedSectionKey ? getSectionViewCardStroke(itemsData) : getCardStroke(cardD))
                                .attr("stroke-width", selectedSectionKey ? getSectionViewCardStrokeWidth(itemsData) : STYLES.CARD.STROKE_WIDTH)

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
                                .attr("fill", getBackCardFill(cardD))
                                .attr("stroke", getBackCardStroke(cardD))
                                .attr("stroke-width", getBackCardStrokeWidth(cardD))
    
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
                        //components
                        const dateColour = selectedSectionKey ? grey10(5) : grey10(7);
                        const frontHeader = frontHeaderComponents[cardNr]
                            .width(contentsWidth)
                            .height(headerHeight)
                            .withTitle(!cardTitleIsBeingEdited)
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
                                e.stopPropagation();
                                //@todo - enable date change from section view
                                if(selectedSectionKey){ return; }
                                onClickCardDate(cardD, i); 
                               
                            })
                            .onClickTitle(function(e, headerDimns){
                                e.stopPropagation();
                                //@todo - enable title change from section view
                                if(selectedSectionKey){ return; }
                                const dimns = {
                                    ...headerDimns,
                                    left:margin.left + headerDimns.left,
                                    top:margin.top + headerDimns.top
                                }
                                onClickCardTitle(cardD, i, dimns);
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
                        //helper
                        //note - deckIsSelected && form is handled in Decks - it turns the entire container pointer-events on/off
                        const cardIsEditable = selectedSectionKey || ((isHeld && isFront) || isSelected);
                        const items = itemsComponents[cardNr]
                            .styles({ 
                                _polygonLineStrokeWidth:itemD => getItemStrokeWidth(itemD, cardD),
                                _itemStroke:itemD => getItemStroke(itemD, cardD)
                            })
                            .width(contentsWidth)
                            .height(itemsAreaHeight)
                            .withSections(cardIsEditable)
                            .withText(d => deckIsSelected && (isFront || isSelected))
                            .selectedItemNr(selectedItemNr)
                            .editable(cardIsEditable)
                            .onSetOuterRadius(r => { itemsOuterRadius = r })
                            .onSelectItem(onSelectItem)
                            .onUpdateItemStatus(function(itemNr, newStatus){
                                onUpdateItemStatus(cardNr, itemNr, newStatus);
                            })
                            .onDrag(e => { dragged(e, cardD) })
                            .onDragEnd(function(e){
                                console.log('calling de from items')
                                dragEnd.call(this, e, cardD)
                            })

                        frontContentsG.select("g.items-area")
                            //not sure why we need this when entire containr shold have pointer-events none when no deck selected
                            .attr("pointer-events", deckIsSelected ? null : "none")
                            .attr("transform", `translate(0, ${headerHeight + gapBetweenHeaderAndItems})`)
                            .call(fadeInOut, isFront || !isHeld)
                            .datum(itemsData)
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
                        const botRightBtnData = !deckIsSelected || selectedSectionKey || !isFront ? [] : (isSelected ? [collapseBtnDatum] : [expandBtnDatum]);
                        //console.log("btnRight", botRightBtnData)
                        const btnHeight = d3.max([1, d3.min([15, 0.12 * normalContentsHeight])]);
                        const btnWidth = btnHeight;
                        //assumme all are square
                        //note: 0.8 is a bodge coz iconsseems to be bigger than they state
                        const scale = d => (0.8 * btnHeight)/d.icon.height;
                        const btnMargin = btnHeight * 0.1;
                        const btnContentsWidth = btnWidth - 2 * btnMargin;
                        const btnContentsHeight = btnHeight - 2 * btnMargin;
                        const botRightBtnG = contentsG.selectAll("g.card-bottom-right-btn").data(botRightBtnData, d => d.key);
                        botRightBtnG.enter()
                            .append("g")
                                .attr("class", "card-bottom-right-btn")
                                .each(function(d){
                                    const btnG = d3.select(this);
                                    btnG.append("path")
                                        .attr("fill", grey10(5.5));

                                    btnG.append("rect").attr("class", "btn-hitbox")
                                        .attr("fill", "transparent")
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
                            .withTitle(form?.formType !== "card-title")
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
                        const media = mediaComponents[cardNr]
                            .width(contentsWidth * 0.92)
                            .height(mediaHeight)

                        const shouldShowMedia = isFront && cardsAreFlipped && !selectedSectionKey;
                        const photosData = [
                            { 
                                key:"profile-1", 
                                url:`/d${deckListPos}c${0}p1.png`,  //`/d${deckListPos}c${cardNr}p1.png`,
                                transform:`scale(0.041)`, isVideo:true 
                            },
                            { 
                                key:"profile-2", 
                                url:`/d${deckListPos}c${0}p2.png`, //`/d${deckListPos}c${cardNr}p2.png`,
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
                    .on("click", e => { 
                        e.stopPropagation(); 
                    })
  
            //EXIT
            cardG.exit().call(remove);

            let swipeTriggered = false;
            function dragged(e , d){
                if(d.isSelected){ return; }
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
                    //the card itself has been dragged
                    cardD = d;
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
            }

            function dragEnd(e, d){
                console.log("cards dragEnd")
                if(d.isSelected){ return; }
                //reset
                swipeTriggered = false;
            }

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
