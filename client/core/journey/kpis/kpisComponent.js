import * as d3 from 'd3';
import { DIMNS, grey10, TRANSITIONS } from "../constants";
import kpiComponent from './kpi/kpiComponent';
import closeComponent from './kpi/closeComponent';
import { getTransformationFromTrans } from '../helpers';

const CONTENT_FADE_DURATION = TRANSITIONS.KPI.FADE.DURATION;
const AUTO_SCROLL_DURATION = TRANSITIONS.KPIS.AUTO_SCROLL.DURATION;
//faster speed than scroll to ensure it leaves page before scroll finishes
const KPI_SLIDE_DURATION = AUTO_SCROLL_DURATION * 0.66;

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
    let kpiMargin;

    let fixedKpiHeight;
    let kpiHeight;
    let gapBetweenKpis;

    let fixedSelectedKpiHeight;
    let openKpiHeight;

    let closeBtnWidth;
    let closeBtnHeight;
    let closeBtnOuterMargin;

    let scrollMin;
    let scrollMax;

    function updateDimns(nrCtrlsButtons=0, nrTooltipRows=0, kpisData){
        const nrKpis = kpisData.length;

        margin = { left: width * 0.1, right: width * 0.1, top:height * 0.1, bottom: height * 0.05 };
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        ctrlsWidth = d3.min([180, contentsWidth]);
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
        //selectedKpi must expand for tooltip rows, by 0.75 of kpiHeight per tooltip
        openKpiHeight = fixedSelectedKpiHeight || listHeight;//kpiHeight + (0.75 * kpiHeight * nrTooltipRows);
        const kpiHeights = kpisData
            .map(kpi => status(kpi) === "open" || status(kpi) === "closing" ? openKpiHeight : kpiHeight);

        scrollMin = -d3.sum(kpiHeights.slice(0, kpiHeights.length - 1)); //stop when last kpi is at top
        scrollMax = 0;

        //kpi margin
        gapBetweenKpis = kpiHeight * 0.15;
        kpiMargin = { top: gapBetweenKpis/2, bottom: gapBetweenKpis/2, left:0, right:0 }

        closeBtnWidth = 40;// contentsWidth * 0.1;
        closeBtnHeight = closeBtnWidth;
        closeBtnOuterMargin = { 
            right: closeBtnWidth * 0.2, top:closeBtnHeight * 0.2
        }
    }

    let fontSizes = {
    };
    let styles = {}

    let withTooltips = true;
    let withCtrls = true;
    let selected;
    let isSelected = d => false;
    let statuses = {}; //closing, open, opening
    let status = d => statuses[d.key] || "closed";

    let editable = false;
    let scrollable = false;
    let scrollEnabled = false;

    //API CALLBACKS
    let onUpdateSelected = function(){};
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

    let onZoomStart = function(){};
    let onZoom = function(){};
    let onZoomEnd = function(){};
    let handleZoomStart = function(){};
    let handleZoom = function(){};
    let handleZoomEnd = function(){};
    let onSaveValue = function(){};

    const zoom = d3.zoom();

    //d3 components
    let kpi = kpiComponent();

    let prevData = [];

    //dom
    let containerG;
    function kpis(selection, options={}) {
        //console.log("kpis update...........................")
        const { transitionEnter=true, transitionUpdate=true, log } = options;

        // expression elements
        selection.each(function (data,i) {
            prevData = data;
            const { kpisData } = data;
            //console.log("kpisData", kpisData)
            //console.log("kpis",this.parentNode.parentNode, data)
            const ctrlsData = withCtrls ? data.ctrlsData : [];

            const nrOfCtrlsButtons = ctrlsData?.length;
            const nrTooltipRowsAbove = kpisData[0] ? d3.max(kpisData[0].tooltipsData, d => d.rowNr) : 0;
            //console.log("rowsAb", nrTooltipRowsAbove)
            const nrTooltipRowsBelow = kpisData[0] ? Math.abs(d3.max(kpisData[0].tooltipsData.filter(t => t.rowNr < 0), d => d.rowNr)) : 0;
            //console.log("rowsbe", nrTooltipRowsBelow)
            const nrTooltipRows = nrTooltipRowsAbove + nrTooltipRowsBelow || 0;
            updateDimns(nrOfCtrlsButtons, nrTooltipRows, kpisData);
            //plan - dont update dom twice for name form
            //or have a transitionInProgress flag
            containerG = d3.select(this);

            //close kpi component
            //helper
            const openKpi = kpisData.find(d => status(d) === "open" || status(d) === "closing");
            const closeData = openKpi ? [openKpi] : []
            containerG.selectAll("g.close-kpi").data(closeData)
                .join("g")
                    .attr("class", "close-kpi")
                    .attr("transform", `translate(${width - closeBtnWidth - closeBtnOuterMargin.right}, ${closeBtnOuterMargin.top})`)
                    .call(closeComponent()
                        .width(closeBtnWidth)
                        .height(closeBtnHeight)
                        .margin({ 
                            left: closeBtnWidth * 0.25, right:closeBtnWidth * 0.25,
                            top:closeBtnHeight * 0.25, bottom:closeBtnHeight * 0.25
                        })
                        .onClick((e, d) => {
                            //false flag ensures scroll stays where it is
                            updateSelected("", data, false, true);
                            onUpdateSelected(d.milestoneId, null, true, true);
                        }));
    
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

                        //container that the listG zoom transforms are applied to
                        listG
                            .append("g")
                                .attr("class", "kpis-list-contents")

                        //init zoom
                        const y = calculateListY(selected, data.kpisData, kpiHeight, 1);
                        const transformState = d3.zoomTransform(listG.node());
                        const newTransformState = transformState.translate(0, y);
                        listG.call(zoom.transform, newTransformState)

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
                        //scroll
                        //todo - 1. put clipPath in place
                        //2. put extent in place so it doesnt scroll beyond the start and end 
                        const listG = contentsG.select("g.kpis-list")
                            .attr('clip-path', "url(#clip)")

                        if(scrollEnabled){
                            //this is a temp fix - we need to be able to toggle it 
                            listG.call(zoom);
                        }

                        const clipRect = listG.select("clipPath#clip").select('rect');
                        clipRect
                                .attr('width', 1000)// listWidth) //dont need horiz clip
                                .attr('height', listHeight)
                                .attr('x', 0)
                                .attr('y', 0);

                        const listContentsG = listG.select("g.kpis-list-contents")
                        zoom
                            .on('zoom', scrollEnabled ? function(e){
                                handleZoom.call(this, e);
                                if(e.sourceEvent){
                                    onZoom.call(this, e)
                                }
                            } : null)
                            .on('end', scrollEnabled ? function(e){
                                handleZoomEnd.call(this, e);
                                if(e.sourceEvent){
                                    onZoomEnd.call(this, e)
                                }
                            } : null)

                        listG.select("rect.list-bg")
                            .attr("width", listWidth)
                            .attr("height", listHeight)
                            .on("click", () => { console.log("clk...")});;

                        //todo - get liust bg showing
                        //make kpi bar width font size etc based on listHeight
                        //console.log("statuses", statuses)
                        //helper to get y pos
                        const calcY = (d,i) => {

                            const extraSpaceForSelected = openKpiHeight - kpiHeight;
                            const isAfterOpenKpi = !!kpisData
                                .slice(0, i)
                                .find(kpi => status(kpi) === "open" || status(kpi) === "closing");
                            return i * kpiHeight +(isAfterOpenKpi ? extraSpaceForSelected : 0)
                        }


                        const kpiG = listContentsG.selectAll("g.kpi").data(kpisData, d => d.key);
                        kpiG.enter()
                            .append("g")
                            .attr("class", d => "kpi kpi-"+d.key)
                            .call(updateTransform, { x: d => 0, y: calcY })
                            .merge(kpiG) 
                            /*
                            .attr("transf
                            orm", (d,i) => {
                                //console.log("trans i, d", i, d)
                                const extraSpaceForSelected = openKpiHeight - kpiHeight;
                                //console.log("extraspace", extraSpaceForSelected)
                                const isAfterOpenKpi = kpisData
                                    .slice(0, i)
                                    .find(kpi => statuses[kpi] === "opening" || statuses[kpi] === "open");
                                //console.log("isAfter Selcted", isAfterSelectedKpi)
                                const vertShift = i * kpiHeight +(isAfterOpenKpi ? extraSpaceForSelected : 0)
                                //console.log("vertShift", vertShift)
                                return `translate(0,${vertShift})`
                            })
                            */
                            .style("cursor", d => isSelected(d) ? "default" : "pointer")
                            .call(kpi
                                .width(() => kpiWidth)
                                .height((d,i) => status(d) === "open" || status(d) === "closing" ? openKpiHeight : kpiHeight)
                                //.expandedHeight(openKpiHeight)
                                .status(d => status(d) || "closed")
                                .withTooltips(d => isSelected(d))
                                .margin(() => kpiMargin)
                                .titleDimns((d) => {
                                    //need contentsWidth and Height to work out name dimns and fontsize so it doesnt change based on status in general update
                                    const kpiContentsWidth = kpiWidth - kpiMargin.left - kpiMargin.right;
                                    const kpiContentsHeight = kpiHeight - kpiMargin.top - kpiMargin.bottom;
                                    const width = kpiContentsWidth * 0.5;
                                    const height = d3.min([kpiContentsHeight * 0.35, 10]);
                                    const margin = { top: height * 0.1, bottom: height * 0.1 };
                                    const fontSize = status(d) === "open" || status(d) === "opening" ? height : height * 0.7;
                                    return { width, height, margin, fontSize }
                                })
                                .styles((d,i) => ({
                                    bg:{
                                        fill:isSelected(d) ? grey10(1) : "transparent"
                                    },
                                    name:{
                                    }
                                }))
                                .onDblClick(onDblClickKpi)
                                .onClick(function(e,d){
                                    //console.log("kpi.onClick........", d)
                                    //@todo - bug - after clicking several kpis, the profiles dont 
                                    //stay in sync with each other. it seems that teh ones called from externally,
                                    //ie teh ones not actually scrolled, seem to jump back to 0 again, and go from there
                                    updateSelected(d.key, data, true, true);
                                    onUpdateSelected(d.milestoneId, d.key, true, true);
                                })
                                .onSaveValue(onSaveValue)
                            )
                            .each(function(d,i){
                                //close btn component
                                /*
                                const closeData = status(d) === "open" || status(d) === "closing" ? [1] : []
                                d3.select(this).selectAll("g.close").data(closeData)
                                    .join("g")
                                        .attr("class", "close")
                                        .call(closeComponent()
                                            .transform(() => `translate(${kpiWidth - closeBtnWidth}, 0)`)
                                            .width((d,i) => closeBtnWidth)
                                            .height((d,i) => closeBtnHeight)
                                            .onClick(() => {
                                                //false flag ensures scroll stays where it is
                                                updateSelected("", data, false, true);
                                                onUpdateSelected(d.milestoneId, null, true, true);
                                            }));*/
                            })
                        //UPDATE ONLY
                        //kpiG.call(updateTransform, { x: d => 0, y: calcY, transition:{ duration:300, delay:400 } })

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
                            .attr("transform", d => `translate(${ctrlsMargin.left +((contentsWidth-ctrlsWidth)/2)},${listHeight + ctrlsMargin.top})`);
                        
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
                                        .attr("fill", d => d.isSelected ? grey10(8) : grey10(5))
                                        .attr("stroke", d => d.isSelected ? grey10(8) : grey10(5))
                                        .attr("opacity", d => d.isSelected ? 0.7 : 0.5)
                                        .attr("font-size", fontSizes.ctrls)
                                        .attr("stroke-width", 0.1)
                                        .text(d => d.label)

                                })

                    })

            handleZoom = function(e, i){
                //scope to containerG instead of 'this' so can be called from outside
                const y = d3.min([d3.max([scrollMin, e.transform.y]), scrollMax])
                containerG.select("g.kpis-list-contents")
                    .attr("transform", `translate(0, ${y})`);
            }
            handleZoomEnd = function(e, i){
                if(e.transform.y < scrollMin){
                    e.transform.y = scrollMin;
                }else if(e.transform.y > scrollMax){ //replace with max
                    e.transform.y = scrollMax; //replace with max
                }
            }
        })

        return selection;
    }

    //requires each listItem to have an index i
    function calculateListY(selectedKey, data, itemHeight, nrItemsToShowBefore = 0){
        const selectedIndex = data.findIndex(d => d.key === selectedKey);
        if(!selectedKey){ return 0; }
        const actualNrToShowBefore = d3.min([selectedIndex, nrItemsToShowBefore]);
        return itemHeight * (selectedIndex - actualNrToShowBefore);
    }

    function updateSelected(key, data, shouldUpdateScroll, shouldUpdateDom){
        //console.log("updateSelected", data.kpisData[0].milestoneId, key, shouldUpdateScroll, shouldUpdateDom)
        const { kpisData } = data;
        const newSelectedDatum = kpisData.find(d => d.key === key);
        //console.log("updateSel key, d-------", key, newSelectedDatum)
        //1. UPDATE STATUS TO OPENING/CLOSING
        if(selected === key) { return; }
        //todo next - check this works with statusses , once i implement it in chldren
        //if currently somethign is selected, we will deselct and close
        let prevSelected;
        if(selected && selected !== key){
            prevSelected = selected;
            //console.log("setting status to closing for", selected)
            statuses[selected] = "closing";
        }
        //start opening new one
        if(key){
            statuses[key] = "opening";
        }
        //update accessors
        status = d => statuses[d.key] || "closed";
        selected = key;
        isSelected = d => d.key === selected;
        //2.GENERAL UPDATE TO REMOVE CLOSED/OPEN CONTENT
        if(shouldUpdateDom){ containerG.call(kpis) }

        //3. AFTER DELAY TO ALLOW REMOVAL OF CONTENT, SLIDE THE KPIS BELOW DOWN/BACK UP
        const calcY = (d,i) => {
            const extraSpaceForSelected = openKpiHeight - kpiHeight;
            //find the newly opening one, if it exists, otherwise its false for all kpis (note, it isnt 'open' yet)
            const isAfterOpenKpi = !!kpisData
                .slice(0, i)
                .find(kpi => status(kpi) === "opening");
            return i * kpiHeight +(isAfterOpenKpi ? extraSpaceForSelected : 0)
        }
        //faster speed than scroll to ensure it leaves page before scroll finishes
        containerG.selectAll("g.kpi")
            .call(updateTransform, { x: d => 0, y: calcY, 
                transition:{ duration:KPI_SLIDE_DURATION, delay:CONTENT_FADE_DURATION } })
        //4.AT THE SAME TIME, SCROLL TO TOP (ONLY IF OPENING)
        if(shouldUpdateScroll){
            //console.log("update scroll-------")
            //@todo - for KpiView, we want to show one before because they are connected
            const nrToShowBefore = 0;
            const y = calculateListY(selected, data.kpisData, kpiHeight, nrToShowBefore);
            //console.log("y", y)
            containerG.select("g.kpis-list")
               .transition()
                    .delay(CONTENT_FADE_DURATION)
                    .duration(AUTO_SCROLL_DURATION)
                    .call(zoom.translateTo, 0, y, [0,0])
                    .on("end", () => { 
                        //console.log("scroll end")
                        //kpi is now open so scroll should not be enabled
                        scrollEnabled = scrollable && !selected;
                        if(shouldUpdateDom){
                            //console.log("update after trans")
                            if(key) { statuses[key] = "open"; }
                            if(prevSelected) { statuses[prevSelected] = "closed";}
                            status = d => statuses[d.key] || "closed";
                            //here the open stuff shopuld fade in
                            containerG.call(kpis) 
                        }
                    }); 
        }else if(shouldUpdateDom){
            //console.log("update no trans")
            //still need slight delay to allow open cntent to close
            //kpi is now open so scroll should not be enabled
            d3.timeout(() => {
                scrollEnabled = scrollable && !selected;
                if(key) { statuses[key] = "open"; }
                if(prevSelected) { statuses[prevSelected] = "closed";}
                status = d => statuses[d.key] || "closed";
                containerG.call(kpis) 
            }, CONTENT_FADE_DURATION + KPI_SLIDE_DURATION)
        }
    }

    function updateTransform(selection, options={}){
        //console.log("updateTransform-----------------------")
        const { x = d => d.x, y = d => d.y, transition, cb = () => {} } = options;
        //console.log("transition", transition)
        selection.each(function(d, i){
            const { translateX, translateY } = getTransformationFromTrans(d3.select(this).attr("transform"));
            if(Math.abs(translateX - x(d, i)) < 0.001 && Math.abs(translateY - y(d, i)) < 0.001){
                //already where it needs to be
                return;
            }
            if(d3.select(this).attr("class").includes("transitioning")){
                //already in transition - so we ignore the new request
                return;
            }
            if(transition){
                //console.log("updateTrans withTrans............", x(d, i))
                d3.select(this)
                    .classed("transitioning", true)
                    .transition()
                    .ease(transition.ease || d3.easeLinear)
                    .delay(transition.delay || null)
                    .duration(transition.duration || 200)
                        .attr("transform", "translate("+x(d, i) +"," +y(d, i) +")")
                        .on("end", function(d,i){
                            d3.select(this).classed("transitioning", false);
                            cb.call(this, d, i);
                        });
            }else{
                //console.log("updateTrans no transxxxxxxx", x(d, i))
                d3.select(this)
                    .attr("transform", "translate("+x(d, i) +"," +y(d, i) +")");
                
                cb.call(this);
            }
        })
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
    kpis.openKpiHeight = function (value) {
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
        scrollEnabled = scrollable && !selected;
        return kpis;
    };
    // todo - kpiClick not working in KpiView
    //todo - fix below in journey and milestonesBar versions of kpisComponent so it renders properly,
    //ie the tooltips etc
    kpis.selected = function (value, shouldUpdateScroll, shouldUpdateDom) {
        if (!arguments.length) { return selected; }
        updateSelected(value, prevData, shouldUpdateScroll, shouldUpdateDom);
        return kpis;
    };
    kpis.onUpdateSelected = function (value) {
        if (!arguments.length) { return onUpdateSelected; }
        onUpdateSelected = value;
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
    kpis.onZoomStart = function (value) {
        if (!arguments.length) { return onZoomStart; }
        if(typeof value === "function"){
            onZoomStart = value;
        }
        return kpis;
    };
    kpis.onZoom = function (value) {
        if (!arguments.length) { return onZoom; }
        if(typeof value === "function"){
            onZoom = value;
        }
        return kpis;
    };
    kpis.onZoomEnd = function (value) {
        if (!arguments.length) { return onZoomEnd; }
        if(typeof value === "function"){
            onZoomEnd = value;
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
    kpis.onSaveValue = function (value) {
        if(typeof value === "function"){
            onSaveValue = value;
        }
        return kpis;
    };
    kpis.handleZoomStart = function(e){ handleZoomStart.call(this, e) };
    kpis.handleZoom = function(e, i){ handleZoom.call(this, e, i) };
    kpis.handleZoomEnd = function(e){ handleZoomEnd.call(this, e) };
    return kpis;
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