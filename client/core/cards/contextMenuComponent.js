import * as d3 from 'd3';
import { grey10, COLOURS, TRANSITIONS } from "./constants";
import { updateRectDimns } from '../journey/transitionHelpers';

export default function contextMenuComponent() {
    //API SETTINGS
    // dimensions
    let width;
    let height;
    let margin = { left: 10, right: 10, top: 10, bottom: 10 };
    let contentsWidth;
    let contentsHeight;

    let itemWidth = 40;
    let itemHeight = 40;
    let itemMargin;
    let itemContentsWidth;
    let itemContentsHeight;

    function updateDimns(data){
        const contentsWidth = data.length * itemWidth;
        const contentsHeight = itemHeight;
        width = contentsWidth + margin.left + margin.right;
        height = contentsHeight + margin.top + margin.bottom;

        itemMargin = { left: itemWidth * 0.2, right:itemWidth * 0.2, top:itemHeight * 0.1, bottom:itemHeight * 0.1 };
        itemContentsWidth = itemWidth - itemMargin.left - itemMargin.right;
        itemContentsHeight = itemHeight - itemMargin.top - itemMargin.bottom;
    }

    let DEFAULT_STYLES = {
        contextMenu:{ info:{ date:{ fontSize:9 } } },
    }
    let _styles = () => DEFAULT_STYLES;

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
                        .attr("opacity", 0.6)
                        .attr("fill", grey10(10))
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
                contentsG.attr("transform", `translate(${margin.left}, ${margin.top})`)

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
                                .attr("stroke", "white")
                                .attr("fill", "transparent")

                        })
                        .merge(itemG)
                        .attr("transform", (d,i) => `translate(${i * itemWidth}, 0)`)
                        .each(function(d,i){
                            const itemContentsG = d3.select(this).select("g.item-contents")
                                .attr("transform", `translate(${itemMargin.left}, ${itemMargin.top})`);
                            itemContentsG.select("rect")
                                .attr("width", itemContentsWidth)
                                .attr("height", itemContentsHeight);

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
    contextMenu.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = value;
        return contextMenu;
    };
    contextMenu.styles = function (value) {
        if (!arguments.length) { return _styles; }
        if(typeof value === "function"){
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value(d,i) });
        }else{
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value });
        }
        return contextMenu;
    };
    contextMenu.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return contextMenu;
    };
    return contextMenu;
}
