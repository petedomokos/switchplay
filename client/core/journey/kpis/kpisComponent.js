import * as d3 from 'd3';
import { DIMNS, grey10 } from "../constants";
import kpiComponent from './kpi/kpiComponent';

/*

*/
export default function kpisComponent() {
    //API SETTINGS
    // dimensions
    let width = DIMNS.profile.width;
    let height = DIMNS.profile.height;
    let margin;
    let contentsWidth;
    let contentsHeight;

    let listWidth;
    let listHeight;
    let ctrlsWidth;
    let ctrlsHeight;

    let ctrlsMargin;
    let ctrlsContentsWidth;
    let ctrlsContentsHeight;
    let btnWidth;
    let btnHeight;
    let btnFontSize;

    let kpiWidth;

    let fixedKpiHeight;
    let kpiHeight;
    let gapBetweenKpis;

    let fixedSelectedKpiHeight;
    let selectedKpiHeight;

    function updateDimns(nrCtrlsButtons=0, nrTooltipRows=0){
        //console.log("updateDimns fixedselH", fixedSelectedKpiHeight, nrTooltipRows, kpiHeight)
        //selectedKpi must expand for tooltip rows, by 0.75 of kpiHeight per tooltip
        selectedKpiHeight = fixedSelectedKpiHeight || kpiHeight + (0.75 * kpiHeight * nrTooltipRows);
        //console.log("selecetedKpiHeight", selectedKpiHeight)

        margin = { left: width * 0.1, right: width * 0.1, top:height * 0.1, bottom: height * 0.05 };
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        ctrlsWidth = contentsWidth;
        ctrlsHeight = nrCtrlsButtons !== 0 ? contentsHeight * 0.15 : 0;
        ctrlsMargin = { left: contentsWidth * 0.1, right: contentsWidth * 0.1, top: ctrlsHeight * 0.1, bottom: ctrlsHeight * 0.1 };
        ctrlsContentsWidth = ctrlsWidth - ctrlsMargin.left - ctrlsMargin.right;
        ctrlsContentsHeight = ctrlsHeight - ctrlsMargin.top - ctrlsMargin.bottom;
        btnWidth = ctrlsContentsWidth / nrCtrlsButtons;
        btnHeight = ctrlsContentsHeight;
        
        //width
        listWidth = contentsWidth;
        kpiWidth = contentsWidth;

        //height
        listHeight = contentsHeight - ctrlsHeight;
        kpiHeight = fixedKpiHeight || listHeight/5;

        //kpi margin
        gapBetweenKpis = kpiHeight * 0.3;

    }

    let fontSizes = {
    };
    let styles = {}

    let withTooltips = true;
    let withCtrls = true;
    let selected;
    let isSelected = d => false;

    let editable = false;
    let scrollable = false;

    //API CALLBACKS
    let onClickKpi = function(){};
    let onDblClickKpi = function(){};
    let onDragStart = function(){};
    let onDrag = function() {};
    let onDragEnd = function() {};
    let onLongpressStart = function(){};
    let onLongpressDragged = function(){};
    let onLongpressEnd = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};
    let onDelete = function(){};
    let onCtrlClick = () => {};

    let onListScrollZoom = function(){};
    let handleListScrollZoom = function(){};

    const listScrollZoom = d3.zoom();

    //d3 components
    let kpi = kpiComponent();

    let prevData = [];

    //dom
    let containerG;

    function kpis(selection, options={}) {
        //console.log("kpis update sel", selected)
        const { transitionEnter=true, transitionUpdate=true, log} = options;

        // expression elements
        selection.each(function (data,i) {
            prevData = data;
            const { kpisData } = data;
            //console.log("kpis",this.parentNode.parentNode, data)
            const ctrlsData = withCtrls ? data.ctrlsData : [];

            const nrOfCtrlsButtons = ctrlsData?.length;
            const nrTooltipRowsAbove = kpisData[0] ? d3.max(kpisData[0].tooltipsData.filter(t => t.location === "above"), d => d.row + 1) : 0;
            //console.log("rowsAb", nrTooltipRowsAbove)
            const nrTooltipRowsBelow = kpisData[0] ? d3.max(kpisData[0].tooltipsData.filter(t => t.location === "below"), d => d.row + 1) : 0;
            //console.log("rowsbe", nrTooltipRowsBelow)
            const nrTooltipRows = nrTooltipRowsAbove + nrTooltipRowsBelow;
            updateDimns(nrOfCtrlsButtons, nrTooltipRows);
            //plan - dont update dom twice for name form
            //or have a transitionInProgress flag
            containerG = d3.select(this);
    
            const contentsG = containerG.selectAll("g.contents").data([1]);
            contentsG.enter()
                .append("g")
                    .attr("class", "contents")
                    .each(function(){
                        const contentsG = d3.select(this);

                        contentsG
                            .append("rect")
                                .attr("class", "contents-bg")
                                .attr("fill", "transparent")
                                .attr("stroke", "none");

                        const listG = contentsG.append("g").attr("class", "kpis-list");
                        listG
                            .append("rect")
                                .attr("class", "list-bg")
                                .attr("fill", "transparent")
                                .attr("stroke", "none");

                        const y = calculateListY(selected, data.kpisData, kpiHeight, 1);
                        listG.append("g").attr("class", "kpis-list-contents")
                            .call(listScrollZoom.translateTo, 0, y, [0,0])

                        listG
                            .append("defs")
                                .append('clipPath')
                                    .attr('id', "clip")
                                        .append('rect')

                        contentsG.append("g").attr("class", "kpis-ctrls")
                            .append("rect")
                                .attr("class", "ctrls-bg");


                    })
                    .merge(contentsG)
                    .attr("transform", `translate(${margin.left},${margin.top})`)
                    .each(function(){
                        const contentsG = d3.select(this);

                        contentsG.select("rect.contents-bg")
                            .attr("width", contentsWidth)
                            .attr("height", contentsHeight)

                        //kpi list
                        //sctool
                        //todo - 1. put clipPath in place
                        //2. put extent in place so it doesnt scroll beyond the start and end 

                        const listG = contentsG.select("g.kpis-list")
                            .attr('clip-path', "url(#clip)")
                        if(scrollable){
                            //this is a temp fix - we need to be able to toggle it 
                            listG.call(listScrollZoom);
                        }

                        const clipRect = listG.select("clipPath#clip").select('rect');
                        clipRect
                                .attr('width', listWidth)
                                .attr('height', listHeight)
                                .attr('x', 0)
                                .attr('y', 0);

                        //const listItemsHeight = data.kpisData.length * kpiHeight + (selected ? 3 * tooltipHeight : 0)
                        //const y = calculateListY(selected, data.kpisData, kpiHeight, 1);
                        //const extraGap = selected ? kpiHeight * 0.75 : 0;
                        const listContentsG = listG.select("g.kpis-list-contents")
                        //this line causes a random scroll when 2nd profile is created in journey

                        //if(selected){
                        //listContentsG
                            //.call(listScrollZoom.translateTo, 0, -extraGap, [0,y]);
                        //}
                        listScrollZoom
                            //.translateExtent([[0, 0], [0, 10]])
                            //.translateExtent([[0,0],[0, listHeight]])
                            //.translateExtent([[0,0],[0, listItemsHeight]])
                            //.translateExtent([[0, -1000],[0, 1000]])
                            //.translateExtent([[0, -listItemsHeight],[0, listItemsHeight]])
                            //.translateExtent([[0, 0], [0, 1]])
                            .on('zoom', function(e){
                                handleListScrollZoom.call(this, e);
                                //only pass to the callback if its a zoom event, not a programmatic zoom
                                if(e.sourceEvent){
                                    onListScrollZoom.call(this, e)
                                }
                            })

                        listG.select("rect.list-bg")
                            .attr("width", listWidth)
                            .attr("height", listHeight);

                        //todo - get liust bg showing
                        //make kpi bar width font size etc based on listHeight
                        const kpiG = listContentsG.selectAll("g.kpi").data(kpisData, d => d.id);
                        kpiG.enter()
                            .append("g")
                            .attr("class", d => "kpi kpi-"+d.id)
                            .merge(kpiG)
                            .attr("transform", (d,i) => {
                                const extraSpaceForSelected = selectedKpiHeight - kpiHeight;
                                //console.log("extraspace", extraSpaceForSelected)
                                const selectedKpiBefore = kpisData
                                    .slice(0, i)
                                    .find(kpi => isSelected(kpi));
                                //console.log("sel before", selectedKpiBefore)
                                const vertShift = i * kpiHeight +(selectedKpiBefore ? extraSpaceForSelected : 0)
                                //console.log("vertShift", vertShift)
                                return `translate(0,${vertShift})`
                            })
                            .style("cursor", d => isSelected(d) ? "default" : "pointer")
                            .call(kpi
                                .width(() => kpiWidth)
                                .height((d) => isSelected(d) ? selectedKpiHeight : kpiHeight)
                                //.expandedHeight(selectedKpiHeight)
                                .withTooltips(d => isSelected(d))
                                .margin(() => ({
                                    //todo - make sure margin is at least big enough for
                                    //half tooltipWidth, if tooltipsData exists
                                    //left:kpiWidth * 0.1, right: kpiWidth * 0.1,
                                    top:gapBetweenKpis/2, bottom:gapBetweenKpis/2
                                }))
                                .styles(d => ({
                                    bg:{
                                        fill:isSelected(d) ? "#FF8C00" : "transparent"
                                    },
                                    name:{
                                    }
                                }))
                                .onDblClick(onDblClickKpi)
                                .onClick(function(e,d){
                                    updateSelected(d.key, data, true);
                                    onClickKpi.call(this, e, d);
                                }));

                        //EXIT
                        kpiG.exit().each(function(){
                            //will be multiple exits because of the delay in removing
                            if(!d3.select(this).attr("class").includes("exiting")){
                                d3.select(this)
                                    .classed("exiting", true)
                                    .transition()
                                        .duration(200)
                                        .attr("opacity", 0)
                                        .on("end", function() { d3.select(this).remove(); });
                            }
                        })
                        
                        //ctrls
                        const ctrlsG = contentsG.select("g.kpis-ctrls")
                            .attr("transform", d => `translate(${ctrlsMargin.left},${listHeight + ctrlsMargin.top})`);
                        
                        ctrlsG.select("rect.ctrls-bg")
                            .attr("width", ctrlsContentsWidth)
                            .attr("height", ctrlsContentsHeight)
                            .attr("fill", "none")

                        const btnG = ctrlsG.selectAll("g.btn").data(ctrlsData);
                        btnG.enter()
                            .append("g")
                                .attr("class", "btn")
                                .each(function(b){
                                    const btnG = d3.select(this)
                                        .style("cursor", "pointer");

                                    btnG.append("rect").attr("class", "hitbox");
                                    btnG
                                        .append("text")
                                            .attr("class", "name")
                                            .attr("text-anchor", "middle")
                                            .attr("dominant-baseline", "central")

                                })
                                .merge(btnG)
                                .attr("transform", (b,i) => `translate(${i * btnWidth}, 0)`)
                                .each(function(b){
                                    const btnG = d3.select(this)
                                        .on("click", onCtrlClick);
                                        
                                    btnG.select("rect.hitbox")
                                        .attr("width", btnWidth)
                                        .attr("height", btnHeight)
                                        .attr("fill", "transparent")
                                        .attr("stroke", "none")
                                        
                                    btnG.select("text.name")
                                        .attr("x", btnWidth/2)
                                        .attr("y", btnHeight/2)
                                        .attr("fill", d => d.isSelected ? "white" : "grey")
                                        .attr("stroke", d => d.isSelected ? "white" : "grey")
                                        .attr("opacity", d => d.isSelected ? 1 : 0.6)
                                        .attr("font-size", fontSizes.ctrls)
                                        .attr("stroke-width", 0.1)
                                        .text(d => d.label)

                                })

                    })

            handleListScrollZoom = function(e){
                containerG.select("g.kpis-list-contents")
                    .attr("transform", `translate(0, ${e.transform.y})`);
            }

        })

        return selection;
    }

    /*
    function transform(selection, transform={}, transition, onEnd = () => {}){
        const { x, y, k = d => 1 } = transform;
        selection.each(function(d){
            const selection = d3.select(this);
            //translate is undefined when we drag a planet into an aim and release
            const { translateX, translateY } = getTransformationFromTrans(selection.attr("transform"));
            
            const _x = x ? x : d => translateX;
            const _y = y ? y : d => translateY;
            //on call from enter, there will be no translate so deltas are 0 so no transition
            //but then transform is called again on entered planets after merge with update
            const deltaX = typeof translateX === "number" ? Math.abs(translateX - _x(d)) : 0;
            const deltaY = typeof translateY === "number" ? Math.abs(translateY - _y(d)) : 0;
            if(transition && (deltaX > 0.1 || deltaY > 0.1)){
                const newY = _y(d);
                selection
                    .transition()
                        .delay(transition.delay || 0)
                        .duration(transition.duration || 200)
                        .attr("transform", "translate("+ _x(d) +"," + newY +") scale("+k(d) +")")
                        .on("end", onEnd);

            }else{
                selection.attr("transform", "translate("+ _x(d) +"," + _y(d) +") scale("+k(d) +")");
                onEnd();
            }
        })
    }
    */

    //requires each listItem to have an index i
    function calculateListY(selectedKey, data, itemHeight, nrItemsToShowBefore = 0){
        const selectedIndex = data.findIndex(d => d.key === selectedKey);
        if(!selectedKey){ return 0; }
        const actualNrToShowBefore = d3.min([selectedIndex, nrItemsToShowBefore]);
        //console.log("listY", itemHeight * (selectedIndex - actualNrToShowBefore))
        return itemHeight * (selectedIndex - actualNrToShowBefore);
    }

    function updateSelected(key, data, shouldUpdateDom){
        selected = key;
        isSelected = d => d.key === selected;
        if(shouldUpdateDom){
            const y = calculateListY(selected, data.kpisData, kpiHeight, 1);
            containerG.select("g.kpis-list-contents")
               .transition()
                    .duration(500)
                    .call(listScrollZoom.translateTo, 0, y, [0,0])
                    .on("end", () => { containerG.call(kpis) }); 
        }
    }
    
    //api
    kpis.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return kpis;
    };
    kpis.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return kpis;
    };
    kpis.kpiHeight = function (value) {
        if (!arguments.length) { return fixedKpiHeight; }
        fixedKpiHeight = value;
        return kpis;
    };
    kpis.selectedKpiHeight = function (value) {
        if (!arguments.length) { return fixedSelectedKpiHeight; }
        fixedSelectedKpiHeight = value;
        return kpis;
    };
    kpis.fontSizes = function (values) {
        if (!arguments.length) { return fontSizes; }
        fontSizes = { ...fontSizes, ...values };
        return kpis;
    };
    kpis.styles = function (values) {
        if (!arguments.length) { return styles; }
        styles = { ...styles, ...values };
        return kpis;
    };
    kpis.withTooltips = function (value) {
        if (!arguments.length) { return withTooltips; }
        withTooltips = value;
        return kpis;
    };
    kpis.withCtrls = function (value) {
        if (!arguments.length) { return withCtrls; }
        withCtrls = value;
        return kpis;
    };
    kpis.editable = function (value) {
        if (!arguments.length) { return editable; }
        editable = value;
        return kpis;
    };
    kpis.scrollable = function (value) {
        if (!arguments.length) { return scrollable; }
        scrollable = value;
        return kpis;
    };
    // todo - kpiClick not working in KpiView
    //todo - fix below in journey and milestonesBar versions of kpisComponent so it renders properly,
    //ie the tooltips etc
    kpis.selected = function (value, shouldUpdateDom) {
        if (!arguments.length) { return selected; }
        updateSelected(value, prevData, shouldUpdateDom);
        return kpis;
    };
    kpis.onClickKpi = function (value) {
        if (!arguments.length) { return onClickKpi; }
        onClickKpi = value;
        return kpis;
    };
    kpis.onCtrlClick = function (value) {
        if (!arguments.length) { return onCtrlClick; }
        onCtrlClick = value;
        return kpis;
    };
    kpis.onDblClickKpi = function (value) {
        if (!arguments.length) { return onDblClickKpi; }
        onDblClickKpi = value;
        return kpis;
    };
    kpis.onListScrollZoom = function (value) {
        if (!arguments.length) { return onListScrollZoom; }
        if(typeof value === "function"){
            onListScrollZoom = value;
        }
        return kpis;
    };
    kpis.onDragStart = function (value) {
        if (!arguments.length) { return onDragStart; }
        if(typeof value === "function"){
            onDragStart = value;
        }
        return kpis;
    };
    kpis.onDrag = function (value) {
        if (!arguments.length) { return onDrag; }
        if(typeof value === "function"){
            onDrag = value;
        }
        return kpis;
    };
    kpis.onDragEnd = function (value) {
        if (!arguments.length) { return onDragEnd; }
        if(typeof value === "function"){
            onDragEnd = value;
        }
        return kpis;
    };
    kpis.onLongpressStart = function (value) {
        if (!arguments.length) { return onLongpressStart; }
        if(typeof value === "function"){
            onLongpressStart = value;
        }
        return kpis;
    };
    kpis.onLongpressDragged = function (value) {
        if (!arguments.length) { return onLongpressDragged; }
        if(typeof value === "function"){
            onLongpressDragged = value;
        }
        return kpis;
    };
    kpis.onLongpressEnd = function (value) {
        if (!arguments.length) { return onLongpressEnd; }
        if(typeof value === "function"){
            onLongpressEnd = value;
        }
        return kpis;
    };
    kpis.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return kpis;
    };
    kpis.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return kpis;
    };
    kpis.onDelete = function (value) {
        if (!arguments.length) { return onDelete; }
        if(typeof value === "function"){
            onDelete = value;
        }
        return kpis;
    };
    kpis.handleListScrollZoom = function(e){ handleListScrollZoom.call(this, e) };
    return kpis;
}
