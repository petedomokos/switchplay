import * as d3 from 'd3';
import { grey10, COLOURS, TRANSITIONS } from "./constants";
import { updateRectDimns } from '../journey/transitionHelpers';

export default function contextMenuComponent() {
    //API SETTINGS
    // dimensions
    let width;
    let height;
    let menuMargin = { left: 10, right: 10, top: 10, bottom: 10 };
    let contentsWidth;
    let contentsHeight;

    let itemWidth = 40;
    let itemHeight = 40;
    let itemGap = 15;

    function updateDimns(data){
        const contentsWidth = data.length * itemWidth +(data.length - 1) * itemGap;
        const contentsHeight = itemHeight;
        width = contentsWidth + menuMargin.left + menuMargin.right;
        height = contentsHeight + menuMargin.top + menuMargin.bottom;
    }

    let styles = {
        bgFill:grey10(10),
        bgOpacity:0.6
    }

    let onClick = function(){};

    let containerG;
    let contentsG;

    function contextMenu(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;

        // expression elements
        selection.each(function (data) {
            containerG = d3.select(this);
            updateDimns(data);

            if(containerG.select("g").empty()){
                init();
            }

            update(data);

            function init(){
                //bg
                containerG
                    .append("rect")
                        .attr("class", "context-menu-bg")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("opacity", styles.bgOpacity)
                        .attr("fill", styles.bgFill)
                        .attr("rx", 1.5)
                        .attr("ry", 1.5)

                contentsG = containerG.append("g").attr("class", "context-menu-contents");
                
            }

            function update(data, options={}){
                //console.log("update", data)
                const { } = options;
              
                //bg
                containerG.select("rect.context-menu-bg")
                    .attr("width", width)
                    .attr("height", height)
                    /*.call(updateRectDimns, { 
                        width: () => width, 
                        height:() => height,
                        transition:transformTransition,
                        name:d => `contextMenu-dimns-${d.id}`
                    })*/

                //contents
                contentsG.attr("transform", `translate(${menuMargin.left}, ${menuMargin.top})`)

                //items
                //todo next - enter-update for data - each has a rect and text for now (icon tomorrow), and do onClick
                const itemG = contentsG.selectAll("g.context-menu-item").data(data);
                itemG.enter()
                    .append("g")
                        .attr("class", "context-menu-item")
                        .each(function(d,i){
                            const itemContentsG = d3.select(this).append("g")
                                .attr("class", "item-contents")

                            itemContentsG.append("rect")
                                .attr("stroke", "none")
                                .attr("fill", "transparent");

                            //append img
                            let x, y, k;
                            if(d.key === "delete-card"){
                                x = -2;
                                y = 1;
                                k = 0.15
                            } else if(d.key === "copy"){
                                x = -3;
                                y = 6;
                                k = 0.5;
                            }else{
                                x = -8;
                                y = 0;
                                k= 0.55;
                            }
                            itemContentsG.append("image")
                                .attr("transform", `translate(${x},${y}) scale(${k})`); //imgs are 80 x 80

                        })
                        .merge(itemG)
                        .attr("transform", (d,i) => `translate(${i * (itemWidth + itemGap)}, 0)`)
                        .each(function(d,i){
                            //@todo - add text desc word under each icon on hover? (or just have an undo button appear prominently)
                            const itemContentsG = d3.select(this).select("g.item-contents");
                            itemContentsG.select("rect")
                                .attr("width", itemWidth)
                                .attr("height", itemHeight);

                            itemContentsG.select("image")
                                .attr("xlink:href", d.url)

                        })
                        .on("click", onClick)

                itemG.exit().remove();
                
            }

        })

        return selection;
    }
    
    //api
    contextMenu.itemWidth = function (value) {
        if (!arguments.length) { return itemWidth; }
        itemWidth = value;
        return contextMenu;
    };
    contextMenu.itemHeight = function (value) {
        if (!arguments.length) { return itemHeight; }
        itemHeight = value;
        return contextMenu;
    };
    contextMenu.itemGap = function (value) {
        if (!arguments.length) { return itemGap; }
        itemGap = value;
        return contextMenu;
    };
    contextMenu.menuMargin = function (value) {
        if (!arguments.length) { return menuMargin; }
        menuMargin = value;
        return contextMenu;
    };
    contextMenu.styles = function (value) {
        if (!arguments.length) { return styles; }
        styles = { ...styles, ...value };
        return contextMenu;
    };
    contextMenu.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return contextMenu;
    };
    return contextMenu;
}
