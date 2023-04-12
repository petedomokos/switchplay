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
import { round } from "../../../../data/dataHelpers";
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
        if(!data || data.length === 0){ return; }
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        itemWidth = contentsWidth;
        itemContentsWidth = itemWidth - itemMargin.left - itemMargin.right;
        itemContentsHeight = itemHeight - itemMargin.top - itemMargin.bottom;
        //item dimns
        descWidth = contentsWidth - symbolWidth - checkboxWidth;

        symbolContentsWidth = symbolWidth - symbolMargin.left - symbolMargin.right;
        descContentsWidth = descWidth - descMargin.left - descMargin.right;
        checkboxContentsWidth = checkboxWidth - checkboxMargin.left - checkboxMargin.right;

        const actualListHeight = (data.length + 1) * itemHeight;
        scrollMin = -actualListHeight + contentsHeight;
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
    let onDeleteItem = () => {};
    let onToggleItemCompletion = () => {};

    let scrollMin = -50;
    const scrollMax = 0;
    let draggedDeltaY = 0;
    //dom
    let zoomG;
    let itemsG;
    const zoom = d3.zoom();
    let enhancedDrag = dragEnhancements();
    const itemDrag = d3.drag();
    let checkboxClicked = false;

    function list(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log} = options;
        selection
            .call(background("list-bg")
                .width((d,i) => contentsWidth)
                .height((d,i) => contentsHeight)
                .margin(margin)
                .styles((d, i) => ({
                    stroke:"none",
                    fill:_styles(d).bg?.fill || "transparent"
                })))
            .call(container("list-contents")
                .transform((d,i) => `translate(${margin.left},${margin.top})`));

        selection.selectAll("g.list-contents").call(container("items-zoom"));
        selection.selectAll("g.items-zoom").call(container("items"));

        selection.call(update);

        function update(selection){
            selection.each(function(data,i){
                const containerG = d3.select(this);
                updateDimns(data);

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

                enhancedDrag
                    //.onDblClick(onDblClick)
                    .onClick(function(e,d){
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
                    if(checkboxClicked){ 
                        checkboxClicked = false;
                        return; 
                    }
                    const dimns = {
                        heights:{ item: itemHeight, itemContents: itemContentsHeight },
                        widths: { item: itemWidth, itemContents: itemContentsWidth, symbol:symbolWidth, descContents:descContentsWidth },
                        margins: { item: itemMargin, list:margin, desc:descMargin }
                    }
                    onEditItem.call(this, d.id, dimns);
                }
                function endEditItem(){
                }
                function deleteItem(d){
                    onDeleteItem(d)
                }
                function toggleItemCompletion(d){
                    //persist
                    onToggleItemCompletion(d.id)
                }

                let prospectivePosition;
                let initDraggedPos;
                const posYPairs = [...data.map((d,i) => [i, i * itemHeight]), [data.length, data.length * itemHeight]];
                let deleteTriggered = false;
                function longpressStart(e , d){
                    if(d.id === "newItem"){
                        createNewItem();
                        return;
                    }
                    d3.select(this).raise();
                    d3.select(this).select("rect.item-bg").attr("stroke", "aqua");
                    initDraggedPos = getTransformationFromTrans(d3.select(this).attr("transform")).translateY;
                    //todo - clipPath shouldnt apply to the dragged item, so we can see the delete animation 
                    //but still need the clipPath for the rest

                }
                function calcProspectivePosition(y){
                    const _y = y - itemHeight/2;
                    //then simply return the position that y is closest to
                    const least = d3.least(posYPairs, d => Math.abs(d[1] - _y));
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
                    if(d.id === "newItem"){ return; }
                    if(deleteTriggered){ return; }
                    //console.log("lpDragged initPos", console.log("initDraggedPos", initDraggedPos))
                    const itemG = d3.select(this);
                    const { translateY } = getTransformationFromTrans(itemG.attr("transform"));
                    const newY = translateY + e.dy
                    //console.log("newY", newY)
                    itemG.attr("transform", `translate(0, ${newY})`);
                    prospectivePosition = calcProspectivePosition(newY, d.id);
                    const distanceToNearestSlot = d3.min(posYPairs, d => Math.abs(d[1] - newY))
                    //console.log("dist", distanceToNearestSlot)
                    const standardDeletionDragSpeedReached = enhancedDrag.distanceDragged() > 200 && enhancedDrag.avgSpeed() > 0.08;
                    const draggedFarAwayFromList = Math.abs(distanceToNearestSlot) > 5 * itemHeight;
                    if(draggedFarAwayFromList || standardDeletionDragSpeedReached){
                        deleteTriggered = true;
                        deleteItem(d);
                    }
                    /*
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
                    if(d.id === "newItem"){ return; }
                    if(deleteTriggered){ 
                        deleteTriggered = false;
                        return; 
                    }
                    d3.select(this).select("rect.item-bg").attr("stroke", "none");
                    //re-order the data and update
                    const itemsBeforeNewPos = data.slice(0, prospectivePosition + 1).filter(it => it.id !== d.id);
                    const itemsAfterNewPos = data.slice(prospectivePosition + 1, data.length).filter(it => it.id !== d.id);
                    const updatedData = [...itemsBeforeNewPos, d, ...itemsAfterNewPos];
                    console.log("updateddata", updatedData)
                    selection.data([updatedData]).call(update)

                    //if(enhancedDrag.isClick()) { return; }
                }
            })
            selection.call(updateItems);
        }

        function updateItems(selection){
            selection./*.selectAll("g.list-contents").*/each(function(data, i){
                const containerG = d3.select(this);
                const contentsG = containerG.select("g.list-contents");
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
    
                //ITEMS
                zoomG = contentsG.select("g.items-zoom")
                    .call(zoom);
    
                itemsG = zoomG.select("g.items");
                const listData = [...data, newItemDatum]
    
                const itemG = itemsG.selectAll("g.item").data(listData, d => d.id);
                itemG.enter()
                    .append("g")
                        .attr("class",(d,i) => `item item-${i} ${d.id === "newItem" ? "new-item" : "regular-item"}`)
                        .attr("pointer-events", "none")
                        .each(function(d,i){
                            const itemG = d3.select(this);
                            const itemContentsG = itemG.append("g").attr("class", "item-contents");
                            //hitbox on outer G so margin drags still respond
                            itemG.append("rect").attr("class", "item-hitbox")
                                .attr("stroke", "none")
                                .attr("fill", "transparent")
                                .attr("pointer-events", "all");

                            //bg rect is only on contentsG so margin gaps are seen
                            itemContentsG.append("rect").attr("class", "item-bg")
                                .attr("stroke", "none")
                                .attr("fill", COLOURS.step.list);
                            
    
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
                            
                            const symbolG = itemContentsG.select("g.symbol")
                                .attr("transform", (d,i) => `translate(${symbolMargin.left}, 0)`)
    
                            symbolG.select("rect")
                                .attr("width", symbolContentsWidth)
                                .attr("height", itemContentsHeight)
                                .attr("fill","none")// "red")
                            
                            symbolG.select("text")
                                .attr("y", itemContentsHeight * 0.8)
                                .attr("font-size", styles.symbol?.fontSize || itemContentsHeight * 0.8)
                                .text(`${i+1}.`);
    
                            const descG = itemContentsG.select("g.desc")
                                .attr("transform", (d,i) => `translate(${symbolWidth + descMargin.left}, 0)`)
    
                            descG.select("rect")
                                .attr("width", descContentsWidth)
                                .attr("height", itemContentsHeight)
                                .attr("fill","none")// "yellow")
                            
                            descG.select("text")
                                .attr("y", itemContentsHeight * 0.8)
                                .attr("font-size", styles.desc?.fontSize || itemContentsHeight * 0.5)
                                .text(d.desc);
    
                            const checkboxG = itemContentsG.select("g.checkbox")
                                .attr("transform", (d,i) => `translate(${symbolWidth + descWidth + checkboxMargin.left}, 0)`)
                                .attr("display", d.id === "newItem" ? "none" : null)
    
                            checkboxG.select("rect")
                                .attr("width", checkboxContentsWidth)
                                .attr("height", itemContentsHeight)
                                .attr("stroke", grey10(5))
                                .attr("fill", d.completed ? "#D4AF37" : "transparent")
                                .on("click", (e,d) => {
                                    checkboxClicked = true;
                                    onToggleItemCompletion(d)
                                    e.stopPropagation();
                                    e.stopImmediatePropagation();
                                })
    
                            
                        })
                        //.on("click", () => { console.log("item clicked")})
                        .call(itemDrag)
                itemG.exit().call(remove)
            })

            function initItem(contentsG, data, i){
                contentsG
                    .append("defs")
                        .append('clipPath')
                            .attr("id", `list-clip-${i}`)
                                .append('rect')
            }
        }

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
                name:{ ...defaultStyles.name, ...requiredStyles.name },
                //others here
            }
        };
        return list;
    };
    list.newItemDesc = function (value) {
        if (!arguments.length) { return newItemDatum.desc; }
        newItemDatum = { ...newItemDatum, desc:value }
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
    list.onDeleteItem = function (f) {
        if (!arguments.length) { return onDeleteItem; }
        if(typeof f === "function"){
            onDeleteItem = f;
        }
        return list;
    };
    list.onToggleItemCompletion = function (f) {
        if (!arguments.length) { return onToggleItemCompletion; }
        if(typeof f === "function"){
            onToggleItemCompletion = f;
        }
        return list;
    };
    return list;
}
