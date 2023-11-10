import * as d3 from 'd3';
import { COLOURS, DIMNS, grey10, TRANSITIONS, STATUS_OPTIONS } from "./constants";
import pentagonComponent from './pentagonComponent';
import textComponent from './textComponent';
import dragEnhancements from '../journey/enhancedDragHandler';
import statusMenuComponent from './statusMenuComponent';
import { isNumber } from '../../data/dataHelpers';
import { fadeIn, remove, fadeInOut } from '../journey/domHelpers';

/*

*/

export default function cardItemsComponent() {
    //API SETTINGS
    // dimensions
    let width = 250;
    let height = 350;
    let margin;
    let extraHorizMargin;
    let extraVertMargin;
    let contentsWidth;
    let contentsHeight;

    //needed for unerlay dimns
    let headerHeight = 0;

    let extraShiftDownForAngleDiscrepancy;

    let itemWidth;
    let itemHeight;
    let innerRadius;
    let outerRadius;

    let listItemWidth;
    let listItemHeight;

    function updateDimns(){
        margin = { 
            left: width * 0.05, right:width * 0.05, 
            top:0,//height * (selectedSectionKey ? 0 : 0.05),
            bottom:0,//height * (selectedSectionKey ? 0.15 : 0.05)
        }
        const availContentsWidth = width - margin.left - margin.right;
        const availContentsHeight = height - margin.top - margin.bottom;
        const actualContentsLength = d3.min([availContentsWidth, availContentsHeight]);
        contentsWidth = selectedSectionKey ? availContentsWidth : actualContentsLength;
        contentsHeight = selectedSectionKey ? availContentsHeight : actualContentsLength; 
        extraHorizMargin = availContentsWidth - contentsWidth;
        extraVertMargin = availContentsHeight - contentsHeight;

        itemWidth = contentsWidth/4.5;
        itemHeight = itemWidth;
        const longestItemLength = d3.max([itemWidth, itemHeight]);
        innerRadius = 0;// (actualContentsLength/2 - longestItemLength/2) * (withSections ? 0.5 : 1);
        //radius is slightly linger than half contentsWidt, because the total length is nerve quite 2 * radius
        //due to angles
        outerRadius = contentsWidth * 0.53;
        onSetOuterRadius(outerRadius)
        //we need to shift down by theis extra 0.03 of contentsWidth to centre it. 
        extraShiftDownForAngleDiscrepancy = contentsWidth * 0.03;

        //list
        listItemWidth = contentsWidth;
        listItemHeight = contentsHeight;
    }

    let styles = {
        getItemStrokeWidth: () => 2,
        getItemStroke:() => "white"
    }

    let withSections = true;
    let withText = true;
    let editable = true;
    let newStatus;
    let statusTimer;

    let cardIsSelected = false;
    let selectedItemNr;
    let selectedSectionKey;
    let clickedItemNr;

    //API CALLBACKS
    let onSetOuterRadius = function(){};
    let onClickItem = function(){};
    let onSelectItem = function(){};
    let onUpdateItemStatus = function(){};
    let setForm = function(){};

    let onDragStart = function(){};
    let onDrag = function(){};
    let onDragEnd = function(){};

    //let onMouseover = function(){};
    //let onMouseout = function(){};

    const itemDrag = d3.drag();
    let enhancedItemDrag = dragEnhancements();

    const pentagon = pentagonComponent();
    const itemTitle = textComponent()
        .text(it => it.title)
        .placeholder("Enter Title...");
    /*

    */

    function cardItems(selection, options={}) {

        updateDimns();

        // expression elements
        selection.each(function (data, i) {
            if(d3.select(this).select("g.card-items-contents").empty()){
                init.call(this);
            }
            //update
            update.call(this, data, options);
        })

        function init(data){
            const contentsG = d3.select(this).append("g").attr("class", "card-items-contents");
            contentsG.append("rect").attr("class", "card-items-contents-bg")
                .attr("fill", "none")
                .attr("stroke", "none");
        }

        function update(data, options){
            const { transitionEnter=true, transitionUpdate=true, updateShouldRaiseTitledItems=true } = options;
            const { } = data;
            const containerG = d3.select(this);
            const contentsG = containerG.select("g.card-items-contents")
                .attr("transform", `translate(
                    ${margin.left + extraHorizMargin/2},
                    ${margin.top + extraVertMargin/2})`);

            contentsG.select("rect.card-items-contents-bg")
                .attr("width", contentsWidth)
                .attr("height", contentsHeight)

            const statusMenuDimns = cardIsSelected ? { optionWidth: 12, optionHeight: 9, titleHeight: 5, instructionsHeight:3 } :
                { optionWidth:20, optionHeight: 10, titleHeight:7, instructionsHeight:4 }

            const polygonCentreG = contentsG.selectAll("g.polygon-centre").data(contentsHeight < 40 ? [] : [1]);
            polygonCentreG.enter()
                .append("g")
                    .attr("class", "polygon-centre")
                    .call(fadeIn)
                    .each(function(){
                        const polygonCentreG = d3.select(this);

                    })
                    .merge(polygonCentreG)
                    .each(function(){
                        const polygonCentreG = d3.select(this);
                        polygonCentreG
                            .attr("transform", `translate(${contentsWidth/2},${contentsHeight/2 + extraShiftDownForAngleDiscrepancy})`)
                            .datum(data)
                            .call(pentagon
                                .r1(innerRadius)
                                .r2(outerRadius)
                                .underlay({
                                    width:4000,//width,
                                    height:4000, //height + headerHeight,
                                    offsetX:-4000/2,// -width/2,
                                    //@todo: offset wont be accurat if pentagon is centred in cardItems -> But it should be centred
                                    offsetY:-4000/2,// -height/2 - headerHeight
                                })
                                .withSections(withSections)
                                .withText(withText && !isNumber(selectedItemNr))
                                .statusMenuItemNr(clickedItemNr)
                                .statusMenuDimns(statusMenuDimns)
                                .editable(editable)
                                .styles(styles)
                                .onClickSection(onClickSection)
                                .onUnclickSection(onUnclickSection)
                                .onClickStatusOption(function(itemD){ 
                                    const { itemNr, status } = itemD;
                                    const newStatus = status === 0 ? 1 : (status === 1 ? 2 : 0)
                                    onUpdateItemStatus(itemNr, newStatus)
                                })
                                .onLongpressStart(longpressStart)
                                .onLongpressEnd(longpressEnd)
                                .onDrag(onDrag)
                                .onDragEnd(onDragEnd)
                                //updates triggered by status change should not raise other items until statusmenu closed
                                , { updateShouldRaiseTitledItems:updateShouldRaiseTitledItems && !isNumber(clickedItemNr) });
                                    
                    })

            polygonCentreG.exit().call(remove, { transition:{ duration:TRANSITIONS.FAST }});

            const cardBgRect = d3.select(this.parentNode.parentNode).select("rect.card-front-bg");

            function onClickSection(e, itemD){
                e.stopPropagation();
                if(!editable){ return; }
                handleClickItem.call(this, e, itemD)
            }

            function onUnclickSection(e){
                e.stopPropagation();
                clickedItemNr = null;
                update.call(containerG.node(), data, { ...options, updateShouldRaiseTitledItems:false });
            }

            function handleClickItem(e, d){
                const { title, cardNr, itemNr } = d;
                //undefined items just open to edit mode on first click
                if(!title){
                    clickedItemNr = null;
                    onSelectItem.call(this, d)
                    return;
                }
                //defined items open to edit mode on second click
                if(clickedItemNr === itemNr){
                    clickedItemNr = null; 
                    onSelectItem.call(this, d);
                    return;
                }
                //show the item status menu
                d3.select(this).raise();
                setForm(null)
                clickedItemNr = itemNr;
                //update.call(containerG.node(), data, { ...options, updateShouldRaiseTitledItems:false });
                //pass it up to trigger the updte at next level in case we are in section view
                onClickItem(d);
            }

            function longpressStart(e,d){
                console.log("lpstart")
                return;
                if(!editable || !d.title){ return; }
                d3.select(this).raise();
                const changeStatus = (prevStatus) => {
                    newStatus = (prevStatus + 1) % 3;
                    const newD = { ...d, status: newStatus }
                    //update stroke
                    if(selectedSectionKey){
                        //update card stroke
                        cardBgRect.attr("stroke", styles.getItemStroke({ ...newD, isSectionView:true }))

                    }else{
                        //update polygon section stroke
                        d3.select(this).selectAll("line.visible")
                            .attr("stroke-width", styles.getItemStrokeWidth(newD))
                            .attr("stroke", styles.getItemStroke(newD))
                    }
                }
                changeStatus(d.status);
                statusTimer = d3.interval(() => {
                    changeStatus(newStatus);
                }, 1200)
            }

            function longpressEnd(e,d){
                return;
                if(!editable || !d.title){ return; }
                statusTimer.stop();
                onUpdateItemStatus(d.itemNr, newStatus);
            }

            //@todo - impl drag handling - if longpressed, then allow dragging to move items between cards etc
            function dragStart(e,d){}
            function dragged(e,d){}
            function dragEnd(e,d){}

            enhancedItemDrag
                .dragThreshold(100)
                .onLongpressStart(longpressStart)
                .onLongpressEnd(longpressEnd);

            itemDrag
                .on("start", enhancedItemDrag(dragStart))
                .on("drag", enhancedItemDrag(dragged))
                .on("end", enhancedItemDrag(dragEnd))

            const listG = contentsG.selectAll("g.list").data(contentsHeight < 40 ? [1] : []);
            listG.enter()
                .append("g")
                    .attr("class", "list")
                    .call(fadeIn)
                    .each(function(){
                        const listG = d3.select(this);
                    })
                    .merge(listG)
                    .each(function(){
                        //need to decide whether to do enter-exit here or in textComp
                        const listG = d3.select(this);
                        const itemG = listG.selectAll("g.item").data(data, it => it.itemNr);
                        itemG.enter()
                            .append("g")
                                .attr("class", "item")
                                .each(function(){ 
                                    const itemG = d3.select(this);
                                    itemG.append("rect").attr("class", "item-hitbox").attr("fill", "transparent");
                                    itemG.append("g").attr("class", "list-item-status-menu-container")
                                })
                                .merge(itemG)
                                .attr("transform", (d,i) => `translate(0, ${i * listItemHeight})`)
                                .each(function(itemD){
                                    const { cardNr, itemNr, status } = itemD; 

                                    const itemG = d3.select(this);

                                    itemG.select("rect.item-hitbox")
                                        .attr("width", listItemWidth)
                                        .attr("height", listItemHeight)

                                    //status - renders iff optionsData non-null
                                    const statusOptionsData = selectedSectionKey && editable && clickedItemNr === itemNr ? STATUS_OPTIONS : null;
                                    const gapBetweenItemAndMenu = 5;
                                    //containerG is positioned in hoz middle of menu, and vertically at the bottom because its expands out and up
                                    itemG.select("g.list-item-status-menu-container")
                                        .attr("transform", `translate(${listItemWidth/2}, ${-gapBetweenItemAndMenu})`)
                                        .datum({ status, optionsData:statusOptionsData })
                                        .call(statusMenuComponent()
                                            .optionWidth(statusMenuDimns?.optionWidth)
                                            .optionHeight(statusMenuDimns?.optionHeight)
                                            .titleHeight(statusMenuDimns?.titleHeight)
                                            .instructionsHeight(statusMenuDimns?.instructionsHeight)
                                            .onClick(function(e){
                                                e.stopPropagation();
                                                const newStatus = status === 0 ? 1 : (status === 1 ? 2 : 0)
                                                onUpdateItemStatus(itemNr, newStatus)
                                            })); 

                                })
                                .call(itemTitle
                                    .width(listItemWidth)
                                    .height(listItemHeight)
                                    .withAttachments(false)
                                    .styles((d,i) => ({
                                        opacity:d.title ? 1 : 0.5,
                                        stroke:"white",//COLOURS.CARD.SECTION_VIEW_ITEM_TEXT,
                                        strokeWidth:0.05,
                                        fill:"white",//COLOURS.CARD.SECTION_VIEW_ITEM_TEXT,
                                        fontMin:1,
                                        fontMax:5,
                                        fontSize:3
                                    }))
                                )
                                .on("click", onClickSection)
                                .call(itemDrag)

                        
                    })

            listG.exit().call(remove, { transition:{ duration:TRANSITIONS.FAST }});
        }

        return selection;
    }
    
    //api
    cardItems.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return cardItems;
    };
    cardItems.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return cardItems;
    };
    cardItems.headerHeight = function (value) {
        if (!arguments.length) { return headerHeight; }
        headerHeight = value;
        return cardItems;
    };
    cardItems.getItemStroke = function (func) {
        if (!arguments.length) { return getItemStroke; }
        getItemStroke = func;
        return cardItems;
    };
    cardItems.styles = function (obj) {
        if (!arguments.length) { return styles; }
        styles = {
            ...styles,
            ...obj,
        };
        return cardItems;
    };
    cardItems.withSections = function (value) {
        if (!arguments.length) { return withSections; }
        withSections = value;
        return cardItems;
    };
    cardItems.withText = function (value) {
        if (!arguments.length) { return withText; }
        withText = value;
        return cardItems;
    };
    cardItems.cardIsSelected = function (value) {
        if (!arguments.length) { return cardIsSelected; }
        cardIsSelected = value;
        return cardItems;
    };
    cardItems.selectedItemNr = function (value) {
        if (!arguments.length) { return selectedItemNr; }
        selectedItemNr = value;
        return cardItems;
    };
    cardItems.selectedSectionKey = function (value) {
        if (!arguments.length) { return selectedSectionKey; }
        if(value !== selectedSectionKey){ clickedItemNr = null; }
        selectedSectionKey = value;
        pentagon.selectedSectionKey(value);
        return cardItems;
    };
    cardItems.clickedItemNr = function (value) {
        if (!arguments.length) { return clickedItemNr; }
        clickedItemNr = value;
        return cardItems;
    };
    cardItems.editable = function (value) {
        if (!arguments.length) { return editable; }
        editable = value;
        return cardItems;
    };
    cardItems.onSetOuterRadius = function (value) {
        if (!arguments.length) { return onSetOuterRadius; }
        onSetOuterRadius = value;
        return cardItems;
    };
    cardItems.onClickItem = function (value) {
        if (!arguments.length) { return onClickItem; }
        onClickItem = value;
        return cardItems;
    };
    cardItems.onSelectItem = function (value) {
        if (!arguments.length) { return onSelectItem; }
        onSelectItem = value;
        return cardItems;
    };
    cardItems.onUpdateItemStatus = function (value) {
        if (!arguments.length) { return onUpdateItemStatus; }
        onUpdateItemStatus = value;
        return cardItems;
    };
    cardItems.setForm = function (value) {
        if (!arguments.length) { return setForm; }
        setForm = value;
        return cardItems;
    };
    cardItems.onDragStart = function (value) {
        if (!arguments.length) { return onDragStart; }
        onDragStart = value;
        return cardItems;
    };
    cardItems.onDrag = function (value) {
        if (!arguments.length) { return onDrag; }
        onDrag = value;
        return cardItems;
    };
    cardItems.onDragEnd = function (value) {
        if (!arguments.length) { return onDragEnd; }
        onDragEnd = value;
        return cardItems;
    };
    /*
    cardItems.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return cardItems;
    };
    cardItems.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return cardItems;
    };
    */
    return cardItems;
}
