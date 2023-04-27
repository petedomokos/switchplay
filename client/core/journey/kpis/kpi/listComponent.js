import * as d3 from 'd3';
import { DIMNS, grey10, COLOURS } from "../../constants";
import dragEnhancements from '../../enhancedDragHandler';
import barComponent from './barComponent';
import numbersComponent from './numbersComponent';
import tooltipsComponent from '../../tooltipsComponent';
import ctrlsComponent from '../../ctrlsComponent';
import container from './container';
import background from './background';
import { getTransformationFromTrans } from '../../helpers';
import { round, isNumber } from "../../../../data/dataHelpers";
import { Oscillator, fadeIn, remove } from '../../domHelpers';
/*

*/
//helper

const getIndexById = (arr, id) => arr.map(d => d.id).indexOf(id);

export default function listComponent() {
    let width = 800;
    let height = 600;
    let margin = { left: 0, right: 0, top: 0, bottom: 0 };
    let contentsWidth = 0;
    let contentsHeight = 0;
    let listWidth;
    let listHeight;
    let actualListHeight;

    let noItemsMesgHeight;
    let newItemAreaHeight;

    let itemWidth;
    let itemHeight = DIMNS.list.item.height;
    let itemMargin = DIMNS.list.item.margin;
    let itemContentsWidth;
    let itemContentsHeight;

    //item dimns
    let symbolWidth = 20;
    let descWidth;
    let checkboxWidth = 30;

    let symbolMargin = { left: 2.5, right: 2.5 };
    let symbolContentsWidth;

    let descMargin = { left: 10, right: 10 };
    let descContentsWidth;

    let checkboxMargin = { left: 5, right: 5 };
    let checkboxContentsWidth;


    //todo - decide will I use React component for the content - advantage is teh scrolling is much easier,
    //and so is eg checkbox, but downside is the positioning is more complex as we will still have the svg rects
    //over the top, for dragging purposes, do prob best to just keep all as svg and impl a zoom same as with kpis
    //at least its a consistent approach. Same with teh longpress for creating a new, its consistent.
    //so best is to keepit all svg except textfield.
    //per datum
    function updateDimns(data){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        noItemsMesgHeight = data.length === 0 && noItemsMesg ? 40 : 0;
        newItemAreaHeight = newItemDatum ? 50 : 0;

        listWidth = contentsWidth;
        listHeight = contentsHeight - noItemsMesgHeight - newItemAreaHeight;

        itemWidth = listWidth;
        itemContentsWidth = itemWidth - itemMargin.left - itemMargin.right;
        itemContentsHeight = itemHeight - itemMargin.top - itemMargin.bottom;

        //item dimns
        descWidth = listWidth - symbolWidth - checkboxWidth;

        symbolContentsWidth = symbolWidth - symbolMargin.left - symbolMargin.right;
        descContentsWidth = descWidth - descMargin.left - descMargin.right;
        checkboxContentsWidth = checkboxWidth - checkboxMargin.left - checkboxMargin.right;

        //newItem datum is twice the height of others, so +2
        actualListHeight = data.length * itemHeight;
        scrollMin = -actualListHeight + listHeight;
    }

    const defaultStyles = {
        list:{

        },
        item:{

        },
        symbol:{
            //fontsize:14
        },
        desc:{
            //fontsize:11
        },
        checkbox:{

        }
    };
    let _styles = () => defaultStyles;

    let newItemDatum = { id:"newItem", desc:"Add Item" }
    let onCreateItem = () => {};
    let onEditItem = () => {};
    let onUpdateItem = () => {};
    let onUpdateItems = function(){};
    let onDeleteItem = () => {};

    //api settings
    let orderEditable = true;
    let noItemsMesg = "";

    //state
    let scrollMin = -50;
    const scrollMax = 0;
    let draggedDeltaY = 0;
    let deleteTriggered = false;
    //dom
    let zoomG;
    let itemsG;
    const zoom = d3.zoom();
    let enhancedDrag = dragEnhancements();
    const itemDrag = d3.drag();
    let enhancedNewItemLongpress = dragEnhancements();
    const newItemLongpress = d3.drag();
    let shouldIgnoreNextItemClick = false;

    let prevData;
    let reloadingData = false;

    function list(selection, options={}) {
       //console.log("list", selection.data())
        const { transitionEnter=true, transitionUpdate=true, log} = options;

        updateDimns(selection.data()[0]);

        selection
            .call(background("list-bg")
                .width((d,i) => width)
                .height((d,i) => height)
                //.margin(margin)
                .styles((d, i) => ({
                    stroke:"none",
                    fill:_styles(d).bg?.fill || "transparent"
                })))
            .call(container("list-component-contents")
                .transform((d,i) => `translate(${margin.left},${margin.top})`));

        selection.selectAll("g.list-component-contents")
            .call(background("list-component-contents-bg")
                .width((d,i) => contentsWidth)
                .height((d,i) => contentsHeight)
                .styles((d, i) => ({
                    stroke:"none",
                    fill:_styles(d).bg?.fill || "transparent"
                })))
            .call(container("items-zoom"));

        selection.selectAll("g.items-zoom").call(container("items"));

        selection.each(function(data,i){
            //console.log("list", data)
            const containerG = d3.select(this);
            const contentsG = containerG.select("g.list-component-contents");
            const styles = _styles(data,i);

            //@todo - learn why these are not working as expected
            //.extent([[0,0], [contentsWidth, contentsHeight]])
            //.translateExtent([[-contentsWidth,-contentsHeight], [contentsWidth, contentsHeight]])
            zoom.on("zoom", function(e){
                //console.log("zmd")
                const { y } = e.transform;
                //if(y < scrollMin || y > scrollMax) { return; }
                d3.select(this).select("g.items")
                    .attr("transform", `translate(0, ${e.transform.y})`)
            })
            //.on("end", function(e, i){
                //console.log("zm end")
                /*
                if(e.transform.y < scrollMin){
                    e.transform.y = scrollMin;
                }else if(e.transform.y > scrollMax){ //replace with max
                    e.transform.y = scrollMax; //replace with max
                }
                */
                    //});

            enhancedNewItemLongpress
                .onLongpressStart(newItemLongpressStart);

            newItemLongpress
                .on("start", enhancedNewItemLongpress())
                .on("drag", enhancedNewItemLongpress())
                .on("end", enhancedNewItemLongpress())

            function newItemLongpressStart(){
                if(orderEditable){
                    console.log("lp firstItemG", contentsG.select("g.item").attr("transform"))
                    console.log("lp newItemG", contentsG.select("g.new-item").attr("transform"))
                }
                createNewItem();
            }

            enhancedDrag
                //.onDblClick(onDblClick)
                .onClick(function(e,d){
                    if(d.id === "newItem"){ return; }
                    if(shouldIgnoreNextItemClick){
                        shouldIgnoreNextItemClick = false;
                        return;
                }
                    editItem.call(this, d)
                })
                .onLongpressStart(longpressStart)
                .onLongpressDragged(longpressDragged)
                .onLongpressEnd(longpressEnd);

            itemDrag
                .on("start", enhancedDrag(dragStart))
                .on("drag", enhancedDrag(dragged))
                .on("end", enhancedDrag(dragEnd))

            function dragStart(e , d){

            }

            function dragged(e , d){
                const firstItemG = itemsG.select("g.item");
                const firstTransY = getTransformationFromTrans(firstItemG.attr("transform")).translateY;
                if(firstTransY >= 0 && e.dy > 0){ return; }
                if(firstTransY <= scrollMin && e.dy < 0){ return; }
                itemsG.selectAll("g.item").attr("translate", function(d,i){
                    const itemG = d3.select(this);
                    const { translateY } = getTransformationFromTrans(itemG.attr("transform"));

                    //if its the first item, we use it to store the delta so its available on any updates (eg onDragEnd)
                    if(i === 0){ draggedDeltaY = translateY + e.dy - itemMargin.top; }
                    itemG.attr("transform", `translate(0, ${translateY + e.dy})`);
                })

                const newItemG = contentsG.select("g.new-item");
                const newItemGTransY = getTransformationFromTrans(newItemG.attr("transform")).translateY;
                newItemG.attr("transform", `translate(0, ${newItemGTransY + e.dy})`);


            }
            //note: newX and Y should be stored as d.x and d.y
            function dragEnd(e, d){
                //if(enhancedDrag.isClick()) { return; }
            }

            function createNewItem(){
                onCreateItem()
            }
            function cancelNewItem(){

            }
            function editItem(d){
                const dimns = {
                    //note - if editing an item, tehn we knwo the noItemMesg height must be 0 so dont pass it through
                    heights:{ item: itemHeight, itemContents: itemContentsHeight },
                    widths: { item: itemWidth, itemContents: itemContentsWidth, symbol:symbolWidth, descContents:descContentsWidth },
                    margins: { item: itemMargin, list:margin, desc:descMargin }
                }
                onEditItem.call(this, d, dimns);
            }
            function endEditItem(){
            }
            function deleteItem(d){
                onDeleteItem(d)
            }
            function onToggleItemCompletion(d){
                onUpdateItem({ ...d, completed:!d.completed })
            }

            let prospectivePosition;
            let initDraggedPos;
            //pairs of each items position in the array, along with its y transform value
            const posYPairs = [
                ...data.map((d,i) => [i, i * itemHeight]), 
                //newItem at end
                [data.length, data.length * itemHeight]
            ];

            let initPos;
            const calcDeltaX = e => Math.round(Math.abs(e.x - initPos?.x));
            const calcDeltaY = e => Math.round(Math.abs(e.y - initPos?.y));
            let isHorizSwipe = false;
            let deltaXMax = 0;
            let deltaYMax = 0;
            function longpressStart(e , d){
                initPos = e;
                d3.select(this).raise();
                d3.select(this).select("rect.item-bg")
                    .attr("stroke", "aqua")
                    .attr("stroke-width", 1);

                initDraggedPos = getTransformationFromTrans(d3.select(this).attr("transform")).translateY;
                //todo - clipPath shouldnt apply to the dragged item, so we can see the delete animation 
                //but still need the clipPath for the rest
            }

            function calcProspectivePosition(y){
                const middleOfBarY = y + itemHeight/2;
                //then simply return the position that y is closest to
                const least = d3.least(posYPairs, d => Math.abs(d[1] - middleOfBarY));
                return least[0];
            }

                    
            let prevProspectivePosition;
            /*
            let itemGBefore;
            let itemGBeforeOrigTransform;
            let itemGAfter;
            let itemGAfterOrigTransform;
            */
            function longpressDragged(e , d){
                //console.log("x,y", Math.round(e.x), Math.round(e.y))
                const deltaX = calcDeltaX(e);
                const deltaY = calcDeltaY(e);
                if(deltaX > deltaXMax){ deltaXMax = deltaX; }
                if(deltaY > deltaYMax){ deltaYMax = deltaY; }

                if(deleteTriggered){ 
                    //console.log("deleteAlreadyTrg")
                    return; 
                }
                const itemG = d3.select(this);
                const { translateX, translateY } = getTransformationFromTrans(itemG.attr("transform"));

                //CASE 1: HORIZONTAL SWIPE TO DELETE
                //if vert drag to re-order is also enabled, then we need to place some limits to distinguish between the two actions
                const horizDeleteYMax = orderEditable ? 5 : 20;
                const horizDeleteXMin = orderEditable ? 20 : 0;
                if(isHorizSwipe || (deltaXMax > deltaYMax && deltaYMax < horizDeleteYMax && deltaXMax > horizDeleteXMin)){
                    isHorizSwipe = true;
                    //@todo - transform on x axis, and put y back to where to was in case its move a bit, then put it all back in dragEnd if not deleted
                    if(deltaX > itemWidth/2){
                        //console.log("delete----------------------")
                        deleteTriggered = true;
                        deleteItem(d);
                        return;
                    }
                    const newX = translateX + e.dx
                    itemG.attr("transform", `translate(${newX},${translateY})`);
                    return;
                }
                //console.log("lpDragged initPos", console.log("initDraggedPos", initDraggedPos))
                //CASE 2: RE-ORDERING
                if(!orderEditable){ return; }
               
                const newY = translateY + e.dy
                //console.log("newY", newY)
                itemG.attr("transform", `translate(0, ${newY})`);
                prospectivePosition = calcProspectivePosition(newY, d.id);
                //console.log("pos", prospectivePosition)
                const distanceToNearestSlot = d3.min(posYPairs, d => Math.abs(d[1] - newY))
                //console.log("dist", distanceToNearestSlot)
                //CASE 3: DRAG OUT OF LIST TO DELETE (only if we also allow re-ordering)
                const standardDeletionDragSpeedReached = enhancedDrag.distanceDragged() > 200 && enhancedDrag.avgSpeed() > 0.08;
                const draggedFarAwayFromList = Math.abs(distanceToNearestSlot) > 5 * itemHeight;
                if(draggedFarAwayFromList || standardDeletionDragSpeedReached){
                    //console.log("setting delete to triggered!!!!!!!!!!!")
                    deleteTriggered = true;
                    deleteItem(d);
                }
                /*
                //@todo - fix this animaiton to show the prospective order change
                if(prospectivePosition !== prevProspectivePosition){
                    //reset old
                    if(itemGBefore){
                        //itemGBefore.attr("transform", itemGBeforeOrigTransform)
                    }
                    if(itemGAfter){
                        //itemGAfter.attr("transform", itemGAfterOrigTransform)
                    }
                    //set new
                    const idBefore = data[prospectivePosition].id;
                    const idAfter = data[prospectivePosition + 1].id;
                    if(idBefore){
                        itemGBefore = containerG.select(`g.item-${idBefore}`);
                        itemGBeforeOrigTransform = itemGBefore.attr("transform");
                        const { translateX, translateY } = getTransformationFromTrans(itemGBeforeOrigTransform);
                        //apply a little shift up
                        //itemGBefore.attr("transform", `translate(${translateX}, ${translateY})`)
                    }else{
                        itemGBefore = null;
                        itemGBeforeOrigTransform = null;
                    }
                    if(idAfter){
                        itemGAfter = containerG.select(`g.item-${idAfter}`);
                        itemGAfterOrigTransform = itemGAfter.attr("transform");
                        const { translateX, translateY } = getTransformationFromTrans(itemGAfterOrigTransform);
                        //apply a little shift down
                        //itemGBefore.attr("transform", `translate(${translateX}, ${translateY})`)
                    }else{
                        itemGAfter = null;
                        itemGAfterOrigTransform = null;
                    }

                }
                */
            
                prevProspectivePosition = prospectivePosition;
            }

            //note: newX and Y should be stored as d.x and d.y
            function longpressEnd(e, d){
                d3.select(this).select("rect.item-bg")
                    .attr("stroke", d.id !== "newItem" ? (styles.item.stroke || "none") : "none")
                    .attr("stroke-width", styles.item.strokeWidth || 0.5);
                    
                if(deleteTriggered){ 
                    deleteTriggered = false;
                    prospectivePosition = null;
                    return; 
                }
                if(isHorizSwipe){
                    isHorizSwipe = false;
                    prospectivePosition = null;
                    return;
                    //didnt swipe enough to delete - need to put back
                    //@todo - ---put it back i think
                }
                if(!orderEditable) {
                    prospectivePosition = null;
                    return; 
                }

                if(!isNumber(prospectivePosition)){ return; }
                //re-order the data and update
                const itemsBeforeNewPos = data.slice(0, prospectivePosition).filter(it => it.id !== d.id);
                const itemsAfterNewPos = data.slice(prospectivePosition, data.length).filter(it => it.id !== d.id);
                const updatedData = [...itemsBeforeNewPos, d, ...itemsAfterNewPos];
                prospectivePosition = null;

                selection.data([updatedData]).call(list)
                //persist
                onUpdateItems(updatedData);

                //if(enhancedDrag.isClick()) { return; }
            }
                
            //INIT
            if(contentsG.select("defs").empty()){
                contentsG.call(initItem, data, i);
            }
            //UPDATE
            //clip path 
            contentsG.select("defs").select('clipPath').select("rect")
                .attr("width", contentsWidth)
                .attr("height", contentsHeight)

            contentsG.attr('clip-path', `url(#list-clip-${i})`)

            //no item mesg
            const noItemsG = contentsG.selectAll("g.no-items").data(noItemsMesg && data.length === 0 ? [noItemsMesg] : []);
            noItemsG.enter()
                .append("g")
                    .attr("class", "no-items")
                    .each(function(){
                        d3.select(this).append("text")
                            .attr("dominant-baseline", "central");
                    })
                    .merge(noItemsG)
                    .attr("transform", `translate(0, ${noItemsMesgHeight/2})`)
                    .each(function(){
                        d3.select(this).select("text")
                            .attr("font-size", styles.desc?.fontSize || itemContentsHeight * 0.5)
                            .attr("stroke", grey10(7))
                            .attr("fill", grey10(7))
                            .attr("stroke-width", 0.1)
                            .text(noItemsMesg);
                    })

            noItemsG.exit().call(remove)

            //ITEMS
            zoomG = contentsG.select("g.items-zoom")
                .call(zoom);
            
            itemsG = zoomG.select("g.items");
            
            const itemG = itemsG.selectAll("g.item").data(data, d => d.id);
            itemG.enter()
                .append("g")
                    .attr("class",(d,i) => `item item-${i} item-${d.id}`)
                    .attr("pointer-events", "none")
                    .each(function(d,i){
                        //workaround - sometimes, it appears that a new item is added when itemData goes from empty to full,
                        //because the whole component is not always removed
                        //soln - flag it as a reload if more than 2 item entered, as only one can be added at a time by the user
                        if(i === 1){ reloadingData = true; }
                        const itemG = d3.select(this);
                        const itemContentsG = itemG.append("g").attr("class", "item-contents");
                        //hitbox on outer G so margin drags still respond
                        itemG.append("rect").attr("class", "item-hitbox")
                            .attr("stroke", "none")
                            .attr("fill", "transparent")
                            .attr("pointer-events", "all");

                        //bg rect is only on contentsG so margin gaps are seen
                        itemContentsG.append("rect").attr("class", "item-bg");
                        

                        const symbolG = itemContentsG.append("g").attr("class", "symbol") ;
                        symbolG.append("rect");
                        symbolG.append("text");

                        const descG = itemContentsG.append("g").attr("class", "desc");
                        descG.append("rect");
                        descG.append("text");

                        const checkboxG = itemContentsG.append("g").attr("class", "checkbox") 
                            .attr("pointer-events", "all")
                        checkboxG.append("rect");

                        itemG.selectAll("text")
                            //.attr("text-anchor", "middle");
                    })
                    .merge(itemG)
                    .attr("transform", (d,i) => `translate(0, ${draggedDeltaY + i * itemHeight})`)
                    .each(function(d,i){
                        const styles = _styles(d,i);
                        const itemG = d3.select(this);
                        const itemContentsG = itemG.select("g.item-contents")
                            .attr("transform", (d,i) => `translate(${itemMargin.left}, ${itemMargin.top})`);
                        //hitbox  - takes up full item height, not just contents, but width doesnt include checkboxes
                        itemG.select("rect.item-hitbox")
                            .attr("width", itemWidth - itemMargin.right - checkboxWidth)
                            .attr("height", itemHeight)

                        //contents
                        itemContentsG.select("rect.item-bg")
                            .attr("width", itemContentsWidth)
                            .attr("height", itemContentsHeight)
                            .attr("fill", styles.item?.fill || COLOURS.step.list)
                            .attr("stroke", styles.item.stroke || "none")
                            .attr("stroke-width", styles.item.strokeWidth || 0.5);
                        
                        const symbolG = itemContentsG.select("g.symbol")
                            .attr("transform", (d,i) => `translate(${symbolMargin.left}, 0)`);


                        symbolG.select("rect")
                            .attr("width", symbolContentsWidth)
                            .attr("height", itemContentsHeight)
                            .attr("fill","none")
                        
                        symbolG.select("text")
                            .attr("y", itemContentsHeight * 0.8)
                            .attr("font-size", styles.symbol?.fontSize || itemContentsHeight * 0.8)
                            .text(`${i+1}.`);

                        const descG = itemContentsG.select("g.desc")
                            .attr("transform", (d,i) => `translate(${symbolWidth + descMargin.left}, 0)`)

                        descG.select("rect")
                            .attr("width", descContentsWidth)
                            .attr("height", itemContentsHeight)
                            .attr("fill","none")
                        
                        descG.select("text")
                            .attr("y", itemContentsHeight * 0.8)
                            .attr("font-size", styles.desc?.fontSize || itemContentsHeight * 0.5)
                            .text(d.desc);
        
                        const checkboxG = itemContentsG.select("g.checkbox")
                            .attr("transform", (d,i) => `translate(${symbolWidth + descWidth + checkboxMargin.left}, 0)`);

                        checkboxG.select("rect")
                            .attr("width", checkboxContentsWidth)
                            .attr("height", itemContentsHeight)
                            .attr("stroke", styles.item.stroke || "none")
                            .attr("stroke-width", styles.item.strokeWidth || 0.5)
                            .attr("fill", d.completed ? "#D4AF37" : "transparent")
                            .on("click", (e,d) => {
                                shouldIgnoreNextItemClick = true;
                                onToggleItemCompletion(d)
                                e.stopPropagation();
                                e.stopImmediatePropagation();
                            })

                        
                    })
                    //.on("click", () => { console.log("item clicked")})
                    .call(itemDrag)

            itemG.exit().call(remove)

            const newItemG = contentsG.selectAll("g.new-item").data(newItemDatum ? [newItemDatum] : []);
            newItemG.enter()
                .append("g")
                    .attr("class", "new-item")
                    .each(function(d){
                        //@todo - replace text with an icon
                        d3.select(this).append("text")
                            .attr("dominant-baseline", "central")
                            .attr("stroke", grey10(7))
                            .attr("fill", grey10(7))
                            .attr("stroke-width", 0.1)

                        d3.select(this).append("rect").attr("class", "new-item-hitbox")
                            .attr("fill", "transparent")
                    })
                    .merge(newItemG)
                    .attr("transform", `translate(0,${draggedDeltaY + noItemsMesgHeight + actualListHeight})`)
                    .each(function(d){
                        d3.select(this).select("text")
                            .attr("x", 20)
                            .attr("y", newItemAreaHeight/2)
                            .attr("font-size", 14)
                            .text("Add New")

                        d3.select(this).select("rect.new-item-hitbox")
                            .attr("width", contentsWidth)
                            .attr("height", newItemAreaHeight);
                    })
                    .call(newItemLongpress)

            newItemG.exit().call(remove)

            function initItem(contentsG, data, i){
                contentsG
                    .append("defs")
                        .append('clipPath')
                            .attr("id", `list-clip-${i}`)
                                .append('rect')
            }


            //set any new item into edit mode
            const newItem = prevData && !reloadingData && data.find(it => !prevData.find(item => item.id === it.id))
            if(newItem){ 
                editItem.call(containerG.select(`g.item-${newItem.id}`).node(), newItem) 
            }
            prevData = data;
            reloadingData = false;
        })

        return selection;
    }
    
    //api
    list.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return list;
    };
    list.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return list;
    };
    list.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = { ...margin, ...value }
        return list;
    };
    list.newStepAreaHeight = function (value) {
        if (!arguments.length) { return newStepAreaHeight; }
        newStepAreaHeight  = value;
        return list;
    };
    list.styles = function (func) {
        if (!arguments.length) { return _styles; }
        _styles = (d,i) => {
            const requiredStyles = func(d,i);
            return {
                ...requiredStyles,
                item:{ ...defaultStyles.item, ...requiredStyles.item },
                //others here
            }
        };
        return list;
    };
    list.orderEditable = function (value) {
        if (!arguments.length) { return orderEditable; }
        orderEditable  = value;
        return list;
    };
    list.noItemsMesg = function (value) {
        if (!arguments.length) { return noItemsMesg; }
        noItemsMesg  = value;
        return list;
    };
    list.newItemDatum = function (value) {
        if (!arguments.length) { return newItemDatum.desc; }
        newItemDatum = value === null ? null : { ...newItemDatum, ...value }
        return list;
    };
    list.onCreateItem = function (f) {
        if (!arguments.length) { return onCreateItem; }
        if(typeof f === "function"){
            onCreateItem = f;
        }
        return list;
    };
    list.onEditItem = function (f) {
        if (!arguments.length) { return onEditItem; }
        if(typeof f === "function"){
            onEditItem = f;
        }
        return list;
    };
    list.onUpdateItem = function (f) {
        if (!arguments.length) { return onUpdateItem; }
        if(typeof f === "function"){
            onUpdateItem = f;
        }
        return list;
    };
    list.onUpdateItems = function (f) {
        if (!arguments.length) { return onUpdateItems; }
        if(typeof f === "function"){
            onUpdateItems = f;
        }
        return list;
    };
    list.onDeleteItem = function (f) {
        if (!arguments.length) { return onDeleteItem; }
        if(typeof f === "function"){
            onDeleteItem = f;
        }
        return list;
    };
    return list;
}
