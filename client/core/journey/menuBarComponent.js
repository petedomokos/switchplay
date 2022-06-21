import * as d3 from 'd3';
//import "d3-selection-multi";
import { grey10, COLOURS, DIMNS, FONTSIZES } from "./constants";
import profileComponent from "./profileComponent";
/*

*/
export default function menuBarComponent() {
    // dimensions
    let margin;
    let customMargin;
    let width = 4000;
    let height = 2600;
    let contentsWidth;
    let contentsHeight;

    const titleWidth = DIMNS.menuBar.title.width;
    const titleHeight = DIMNS.menuBar.title.height;
    const btnWidth = DIMNS.menuBar.btn.width;
    const btnHeight = DIMNS.menuBar.btn.height;
    const btnGap = DIMNS.menuBar.btn.gap;

    let menuBarHeight;
    //width constant
    const itemWidth = DIMNS.menuBarItem.width;
    //height varies
    let itemHeight;
    const itemMargin = DIMNS.menuBarItem.margin;


    function updateDimns(){
        margin = customMargin || { 
            left: d3.min([width * 0.05, DIMNS.menuBar.maxMargin.left]),
            right: d3.min([width * 0.05, DIMNS.menuBar.maxMargin.right]),
            top: d3.min([height * 0.05, DIMNS.menuBar.maxMargin.top]),
            bottom: d3.min([height * 0.05, DIMNS.menuBar.maxMargin.bottom])
        }
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
        menuBarHeight = contentsHeight - titleHeight;
        itemHeight = menuBarHeight;
    };

    let importsAvailable = false;
    let getItemsDraggable = d => true;

    //handlers
    let onNewItemButtonClick = () => {};
    let openImportItemsComponent = () => {};
    let onUpdateSelected = () => {};
    let onItemClick = function(){};
    let onItemDragStart = function(){};
    let onItemDrag = function(){};
    let onItemDragEnd = function(){};

    //dom
    let containerG;
    let contentsG;
    let titleG;
    let titleText;
    let subtitleG;
    let subtitleText;
    let newItemBtnG;
    let importItemsBtnG;
    let itemsG;
    let bgRect;

    //components
    let profiles = {};

    //state
    let selected;
    let dragged;
    let clicked;

    let prevData;

    function menuBar(selection) {
        updateDimns();
        selection.each(function (data) {
            containerG = d3.select(this);
            //console.log("menubar data", data)
            if(containerG.select("g.menu-bar-contents").empty()){
                //enter
                init.call(this);
                update(data);
            }else{
                //update
                update(data);
            }

            prevData = data;
        })

        function update(data, options={}){
            const { key, title, subtitle, itemsData, withNewButton=true } = data;

            //call drag on bg to stop propagation
            bgRect.attr("width", width).attr("height", height).call(d3.drag())
            itemsG.attr("transform", "translate(0," +titleHeight +")");

            titleG.attr("transform", "translate(0," +titleHeight/2 +")");
            titleText.text(title);
            subtitleG.attr("transform", "translate(" +titleWidth +",0)");
            subtitleText.text(subtitle);

            //btns
            //@todo - use enter-update with btnsData
            contentsG.selectAll("g.btn").select("rect")
                .attr("width", btnWidth)
                .attr("height", btnHeight);
            
            contentsG.selectAll("g.btn").select("text")
                .attr("transform", "translate("+btnWidth/2 +"," +btnHeight/2 +")");

            newItemBtnG
                .attr("transform", "translate("+(contentsWidth - btnWidth) +",2.5)")
                .attr("display", withNewButton ? null : "none")
            
            importItemsBtnG
                .attr("transform", "translate("+(contentsWidth - (btnWidth * 2) - btnGap) +",2.5)")
                .attr("display", importsAvailable ? null : "none");
        
            const itemG = itemsG.selectAll("g.item").data(itemsData, m => m.id);
            itemG.enter()
                .append("g")
                    .attr("class", "item")
                    .attr("pointer-events", "all")
                    .each(function(d){ profiles[d.id] = profileComponent(); })
                    .merge(itemG)
                    .attr("transform", (d,i) =>  "translate("+(i * itemWidth) +",0)")
                    .each(function(d){
                        const col = selected === d.id ? COLOURS.selectedBarMenuItem : COLOURS.barMenuItem;
                        d3.select(this)
                            .call(profiles[d.id]
                                .itemsDraggable(getItemsDraggable(data))
                                .bgSettings({ fill: selected === d.id ? COLOURS.selectedBarMenuItem : COLOURS.barMenuItem })
                                .width(itemWidth)
                                .height(itemHeight)
                                .margin(itemMargin)
                                .onClick(function(e, d){
                                    dragged = undefined;
                                    clicked = d.id;
                                    onItemClick.call(this, e, d)
                                })
                                .onDragStart(function(e,d){
                                    dragged = d.id;
                                    //cant rely on mouseover as may be touch
                                    //@todo - this is a problem as measure bg doesnt change colour as it does for mouseover
                                    if(selected !==  d.id){
                                        selected = d.id;
                                        update(prevData)
                                        //pass to journey to update planets
                                        onUpdateSelected(d.id)
                                    }
                                    //and if clicked, measure stays selected until anoither measure is clicked,
                                    //or measure bar is closed or measurebackground clicked
                                    onItemDragStart.call(this, e, d)
                                })
                                .onDrag(function(e,d){
                                    onItemDrag.call(this, e, d);
                                })
                                .onDragEnd(function(e,d){
                                    //note - measure stays selected after drag until mouseout or another is clicked
                                    dragged = undefined;
                                    onItemDragEnd.call(this, e, d)
                                }));
                    })
                    .on("mouseover", function(e, d){
                        //if a measure is being dragged, we dont want mouseover to work in case its dragged over another measure
                        if(dragged) { return ; }

                        selected = d.id;
                        update(prevData)
                        //pass to journey to update planets
                        onUpdateSelected(d.id)
                    })
                    .on("mouseout", function(e, d){
                        if(dragged || clicked === d.id ) { return ; }
                        selected = undefined;
                        update(prevData);
                        //pass to journey to update planets
                        onUpdateSelected(undefined);
                    })

            itemG.exit().remove();

        }

        function init(){
            containerG = d3.select(this)
                //()); //prevents zoom/click being triggered on canvas underneath

            bgRect = containerG
                .append("rect")
                    .attr("class", "bg")
                    .attr("fill",  grey10(2));

            contentsG = containerG
                .append("g")
                    .attr("class", "contents menu-bar-contents")
                    .attr("transform", "translate(" +margin.left +"," +margin.top +")")

            titleG = contentsG.append("g").attr("class", "title");
            subtitleG = titleG.append("g").attr("class", "subtitle");
            titleText = titleG
                .append("text")
                    .attr("class", "main")
                    .attr("font-size", FONTSIZES.menuBar.title);
            
            titleG.selectAll("text").attr("dominant-baseline", "text-bottom")

            subtitleText = subtitleG
                .append("text")
                    .attr("font-size", FONTSIZES.menuBar.subtitle);

            //new btn
            newItemBtnG = contentsG
                .append("g")
                .attr("class", "btn new-item-btn")
                .style("cursor", "pointer")
                .call(d3.drag()) //prevent propagation
                .on("click", onNewItemButtonClick);

            newItemBtnG
                .append("rect")
                    .attr("fill", "transparent")
                    .attr("stroke", grey10(8))
                    .attr("stroke-width", 0.1);

            newItemBtnG
                .append("text")
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "central")
                    .attr("font-size", 8)
                    .text("New");

            //import btn
            importItemsBtnG = contentsG
                .append("g")
                .attr("class", "btn import-item-btn")
                .style("cursor", "pointer")
                .on("click", openImportItemsComponent);

            importItemsBtnG
                .append("rect")
                    .attr("fill", "transparent")
                    .attr("stroke", grey10(8))
                    .attr("stroke-width", 0.1);

            importItemsBtnG
                .append("text")
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "central")
                    .attr("font-size", 8)
                    .text("Import");

            itemsG = contentsG.append("g").attr("class", "measures");


        }

        return selection;
    }

    //api
    menuBar.margin = function (value) {
        if (!arguments.length) { return customMargin || margin; }
        customMargin = { ...customMargin, ...value};
        return menuBar;
    };
    menuBar.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return menuBar;
    };
    menuBar.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return menuBar;
    };
    menuBar.getItemsDraggable = function (value) {
        if (!arguments.length) { return getItemsDraggable; }
        getItemsDraggable = value;
        return menuBar;
    };
    menuBar.onNewItemButtonClick = function (value) {
        if (!arguments.length) { return onNewItemButtonClick; }
        onNewItemButtonClick = value;
        return menuBar;
    };
    menuBar.openImportItemsComponent = function (value) {
        if (!arguments.length) { return openImportItemsComponent; }
        openImportItemsComponent = value;
        return menuBar;
    };
    menuBar.onUpdateSelected = function (value) {
        if (!arguments.length) { return onUpdateSelected; }
        onUpdateSelected = value;
        return menuBar;
    };
    menuBar.onItemClick = function (value) {
        if (!arguments.length) { return onItemClick; }
        onItemClick = value;
        return menuBar;
    };
    menuBar.onItemDragStart = function (value) {
        if (!arguments.length) { return onItemDragStart; }
        onItemDragStart = value;
        return menuBar;
    };
    menuBar.onItemDrag = function (value) {
        if (!arguments.length) { return onItemDrag; }
        onItemDrag = value;
        return menuBar;
    };
    menuBar.onItemDragEnd = function (value) {
        if (!arguments.length) { return onItemDragEnd; }
        onItemDragEnd = value;
        return menuBar;
    };
    menuBar.selected = function (value) {
        if (!arguments.length) { return selected; }
        selected = value;
        return menuBar;
    };
    menuBar.dragged = function () {
        return dragged;
    };

    return menuBar;
}
