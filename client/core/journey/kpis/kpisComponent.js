import * as d3 from 'd3';
import { DIMNS, grey10, TRANSITIONS, KPI_CTRLS, COLOURS } from "../constants";
import kpiComponent from './kpi/kpiComponent';
import closeComponent from './kpi/closeComponent';
import { getTransformationFromTrans } from '../helpers';
import { remove, fadeIn } from '../domHelpers';

const CONTENT_FADE_DURATION = TRANSITIONS.KPI.FADE.DURATION;
const AUTO_SCROLL_DURATION = TRANSITIONS.KPIS.AUTO_SCROLL.DURATION;
//faster speed than scroll to ensure it leaves page before scroll finishes
const KPI_SLIDE_DURATION = AUTO_SCROLL_DURATION * 0.66;

//helper
const getOpenedKpiKey = statuses => {
    const open = Object.entries(statuses).find(pair => pair[1] === "open");
    return open ? open[0] : null;
}
const getNotClosedKpiKey = statuses => {
    const pair = Object.entries(statuses).find(pair => pair[1] !== "closed");
    return pair ? pair[0] : null;
}
/*

*/
export default function kpisComponent() {
    //API SETTINGS
    // dimensions
    let width = DIMNS.profile.width;
    let height = DIMNS.profile.height;
    let expandedHeight = height;
    let margin;
    let fixedMargin;
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
    let maxKpiHeight = 40;
    let kpiHeight;
    let gapBetweenKpis;

    let fixedSelectedKpiHeight;
    let fixedGapBetweenKpis;
    let openedKpiHeight;

    let closeBtnWidth;
    let closeBtnHeight;
    let closeBtnOuterMargin;

    let scrollMin;
    let scrollMax;

    function updateDimns(nrCtrlsButtons=0, nrTooltipRows=0, kpisData){
        const nrKpis = kpisData.length;

        margin = fixedMargin || { 
            left: width * 0.1, 
            right: width * 0.1, 
            top:height * 0.1, 
            bottom: height * (nrCtrlsButtons === 0 ? 0.1 : 0.05) 
        };
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        ctrlsWidth = contentsWidth * (contentsWidth < 200 ? 0.8 : 0.7);
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
        //@todo
        //if we have eg 8kpis, and the max kpihwight doesnt take up all space esp on large screen 
        //then increase margin a little -> but read not on line 106 - dont want kpimargin change to affect
        //title to create a little jump
        //but also we should make 
        listHeight = contentsHeight - ctrlsHeight;
        kpiHeight = fixedKpiHeight || d3.min([maxKpiHeight, listHeight/nrKpis]);
        //selectedKpi must expand for tooltip rows, by 0.75 of kpiHeight per tooltip
        const expandedContentsHeight = expandedHeight - margin.top - margin.bottom;
        //const expandedListHeight = expandedContentsHeight - ctrlsHeight;
        openedKpiHeight = expandedContentsHeight - ctrlsHeight;// fixedSelectedKpiHeight || listHeight;//kpiHeight + (0.75 * kpiHeight * nrTooltipRows);
        const kpiHeights = kpisData
            .map(kpi => status(kpi) === "open" || status(kpi) === "closing" ? openedKpiHeight : kpiHeight);

        scrollMin = -d3.sum(kpiHeights.slice(0, kpiHeights.length - 1)); //stop when last kpi is at top
        scrollMax = 0;

        //kpi margin (top must be constant so title pos doesnt shift when opening a kpi)
        gapBetweenKpis = fixedGapBetweenKpis || kpiHeight * 0.5;// 0.15;
        kpiMargin = { top: gapBetweenKpis/2, bottom: gapBetweenKpis/2, left:0, right:0 }

        closeBtnWidth = 40;// contentsWidth * 0.1;
        closeBtnHeight = closeBtnWidth;
        closeBtnOuterMargin = { 
            //@todo work out what this extra is that I neeed to subtract
            right:0 /*closeBtnWidth/2*/, top:margin.top + 10
        }
    }

    let fontSizes = {
        ctrls:10
    };
    let styles = {
        numberLabels:{
            fontSize:1.35
        },
        kpi:{
            bg:{},
            title:{},
            progressBar:{},
            step:{}
        },
        ctrls:{
        }
    }

    let milestoneId;
    let kpiFormat = "actual";
    let withTooltips = true;
    let withNumbers = true;
    let withCtrls = true;
    let displayFormat = "both";
    let profileIsSelected = false;
    let selected;
    let isSelected = d => false;
    let statuses = {}; //closing, open, opening
    let status = d => statuses[d.key] || "closed";

    let editable = false;
    let scrollable = false;
    let scrollEnabled = false;

    //API CALLBACKS
    let onUpdateSelected = function(){};
    let onClickKpi = function(){};

    let onCreateStep = function(){};
    let onEditStep = function(){};
    let onUpdateStep = function(){};
    let onUpdateSteps = function(){};
    let onDeleteStep = function(){};

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
    let onSetEditing = function(){};

    const zoom = d3.zoom();

    //d3 components
    let kpi = kpiComponent();

    let prevData = [];

    //dom
    let containerG;
    let openedKpiDiv;
    let listClipPathId;

    function kpis(selection, options={}) {
        //console.log("kpis update..............", selection.node())
        const { transitionEnter=true, transitionUpdate=true, log } = options;

        // expression elements
        selection.each(function (kpisData,i) {
            prevData = kpisData;
            const nrDefenceKpis = kpisData.filter(kpi => kpi.orientationFocus === "defence").length;
            //const attackKpisData = kpisData.filter(kpi => kpi.orientationFocus === "attack")
            //next - go down this file implementing two nest lists instead, 
            //but all one list just display with a label before each nest
            openedKpiDiv = d3.select(`div#opened-kpi-${milestoneId}`)
            const nrDatasetKpis = kpisData.filter(kpi => kpi.datasetKey).length;
            const ctrlsData = withCtrls && milestoneId !== "current" && nrDatasetKpis !== 0 ? KPI_CTRLS(displayFormat) : [];
            if(nrDatasetKpis === 0){
                displayFormat = "steps";
            }

            listClipPathId = `kpis-list-clip-${milestoneId}`;

            //we dont want lack of a target or numbers to affect positioning of some progressBars differently, so we will work out the 
            //nr of end tooltips and of numbers here and pass it through as a setting

            //we also fix 'editing' to be null so that toggling editing modes doesnt adjust overall positions
            //and we know that only closed bars have end tooltips, so we can assume its closed

            const getNrEndTooltips = (status, displayFormat) => {
                if(!withTooltips){ return 0; }
                if(milestoneId === "current") { return 0; }
                const nrPerKpi = kpisData.map(kpiD => kpiD.tooltipsData
                    .filter(d => d.shouldDisplay(status, null, displayFormat))
                    .filter(t => t.tooltipType === "comparison")
                    .length
                )
                return d3.max(nrPerKpi)
            }

            const getNrNumbers = (status, displayFormat) => {
                if(!withNumbers){ return 0; }
                const nrsPerKpi = kpisData
                    .filter(kpiD => !!kpiD.numbersData)
                    .map(kpiD => kpiD.numbersData.filter(d => d.shouldDisplay("closed", null, displayFormat)).length);
                    
                return d3.max(nrsPerKpi)
            }

            const nrOfCtrlsButtons = ctrlsData?.length || 0;
            const nrTooltipRowsAbove = kpisData[0]?.tooltipsData ? d3.max(kpisData[0].tooltipsData, d => d.rowNr) : 0;
            const nrTooltipRowsBelow = kpisData[0].tooltipsData ? Math.abs(d3.max(kpisData[0].tooltipsData.filter(t => t.rowNr < 0), d => d.rowNr)) : 0;
            const nrTooltipRows = nrTooltipRowsAbove + nrTooltipRowsBelow || 0;
            updateDimns(nrOfCtrlsButtons, nrTooltipRows, kpisData);
            //plan - dont update dom twice for name form
            //or have a transitionInProgress flag
            containerG = d3.select(this);

            //close kpi component
            //dont removebtn until other content removes so its a smooth transition
            const openedKpi = getOpenedKpiKey(statuses);
            const closeBtnData = openedKpi ? [openedKpi] : [];
            //const openOrClosingKpi = kpisData.find(d => status(d) === "open" || status(d) === "closing");
            //const closeBtnData = openOrClosingKpi ? [openOrClosingKpi] : [];
            /*
            const closeBtnG = containerG.selectAll("g.close-btn").data(closeBtnData);
            closeBtnG.enter()
                .append("g")
                    .attr("class", "close-btn")
                    .call(fadeIn)
                    .merge(closeBtnG)
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
                            //WARNING - NEXT LINE MAY ERROR AS NO MILESTONE ID
                            onUpdateSelected(d.milestoneId, null, true, true);
                        }));
            closeBtnG.exit().call(remove);*/
    
            const contentsG = containerG.selectAll("g.contents").data([1]);
            contentsG.enter()
                .append("g")
                    .attr("class", "contents")
                    .each(function(){
                        const contentsG = d3.select(this);

                        contentsG
                            .append("rect")
                                .attr("class", "contents-bg")
                                .attr("width", contentsWidth)
                                .attr("height", contentsHeight)
                                .attr("fill", "transparent")
                                .attr("stroke", "none");

                        contentsG.append("g").attr("class", "number-labels");
                                
                        const listG = contentsG.append("g").attr("class", "kpis-list");
                        listG
                            .append("rect")
                                .attr("class", "list-bg")
                                    .attr("width", listWidth)
                                    .attr("height", listHeight)
                                    .attr("fill", "transparent")
                                    .attr("stroke", "none");

                        listG
                            .append("rect")
                                .attr("class", "defence-list-bg")
                                .attr("fill", "transparent")
                                .attr("stroke", "none")
                                .attr("opacity", 0.2);

                        //container that the listG zoom transforms are applied to
                        listG
                            .append("g")
                                .attr("class", "kpis-list-contents")

                        //init zoom
                        const y = calculateListY(selected, kpisData, kpiHeight, 1);
                        const transformState = d3.zoomTransform(listG.node());
                        const newTransformState = transformState.translate(0, y);
                        listG.call(zoom.transform, newTransformState)

                        listG
                            .append("defs")
                                .append('clipPath')
                                    .attr('id', listClipPathId)
                                        .append('rect')

                        contentsG
                            .append("g")
                                .attr("class", "kpis-ctrls")
                                .attr("transform", d => `translate(${ctrlsMargin.left +((contentsWidth-ctrlsWidth)/2)},${listHeight + ctrlsMargin.top})`)
                                    .append("rect")
                                        .attr("class", "ctrls-bg");

                    })
                    .merge(contentsG)
                    .attr("transform", `translate(${margin.left},${margin.top})`)
                    .each(function(){
                        const contentsG = d3.select(this);

                        //temp - grabbed from, progressbarcomponent
                        //const isMobile = listWidth < 45; //listWidth is 43.78 on mobile, 47.91 on laptop 
                        //const numbersWidth = isMobile ? 17.513 : 19.163 
                        //const numberWidth = isMobile ? 8.757 : 9.2;//9.582;
                        const numbersWidth = listWidth/2.4;// listWidth/2.5;
                        const numberWidth = listWidth/5;

                        //number labels
                        //@todo - move these labels to numberComponent, and use a withLabel setting to oly show it for 1st kpi
                        const labelsData = kpisData[0]?.numbersData || [];
                        const labelG = contentsG.select("g.number-labels").selectAll("g.number-label").data(labelsData);
                        labelG.enter()
                            .append("g")
                                .attr("class", "number-label")
                                .each(function(d){
                                    d3.select(this).append("text")
                                        .attr("dominant-baseline", "hanging")
                                        .attr("text-anchor", "middle");
                                })
                                .merge(labelG)
                                //.attr("transform", (d,i) => `translate(${listWidth - numbersWidth + (i+1) * numberWidth},0)`)
                                .attr("transform", (d,i) => `translate(${listWidth - numbersWidth + (i+1) * numberWidth},0)`)
                                .each(function(d){
                                    d3.select(this).select("text")
                                        .attr("fill", styles.numberLabels.fill || grey10(3))
                                        .attr("font-size", styles.numberLabels.fontSize || 1.35)
                                        .attr("transform", styles.numberLabels.transform || null)
                                        .attr("transform-origin", styles.numberLabels.transformOrigin || null)
                                        .text(d.label)
                                })

                        labelG.exit().remove();

                        //kpi list
                        //scroll
                        //todo - 1. put clipPath in place
                        //2. put extent in place so it doesnt scroll beyond the start and end 
                        const listG = contentsG.select("g.kpis-list")
                            .attr('clip-path', `url(#${listClipPathId})`);

                        listG.select("defs").select(`clipPath#${listClipPathId}`).select("rect")
                            .attr('width', 1000)
                            .attr('height', listHeight);

                        listG.select("rect.defence-list-bg")
                            .attr('width', listWidth)
                            .attr('height', nrDefenceKpis * kpiHeight)
                            .attr("display", selected ? "none" : null)

                        if(scrollEnabled){
                            //this is a temp fix - we need to be able to toggle it 
                            listG.call(zoom);
                        }
                        /*
                        const clipRect = listG.select("clipPath#kpis-list-clip").select('rect');
                        clipRect
                                .attr('width', 1000)
                                .attr('height', listHeight)
                                .attr('x', 0)
                                .attr('y', 0);
                        */

                        const listContentsG = listG.select("g.kpis-list-contents")
                        zoom
                            .on('zoom', scrollEnabled || 2 === 2 ? function(e){
                                handleZoom.call(this, e);
                                if(e.sourceEvent){
                                    onZoom.call(this, e)
                                }
                            } : null)
                            .on('end', scrollEnabled || 2 === 2 ? function(e){
                                handleZoomEnd.call(this, e);
                                if(e.sourceEvent){
                                    onZoomEnd.call(this, e)
                                }
                            } : null)

                        /*
                        listG.select("rect.list-bg")
                            .attr("width", listWidth)
                            .attr("height", listHeight)
                            .on("click", () => { console.log("clk...")});
                            */

                        //todo - get liust bg showing
                        //make kpi bar width font size etc based on listHeight
                        //console.log("statuses", statuses)
                        //helper to get y pos
                        const calcY = (d,i) => {

                            const extraSpaceForSelected = openedKpiHeight - kpiHeight;
                            const isAfterOpenKpi = !!kpisData
                                .slice(0, i)
                                .find(kpi => status(kpi) === "open" || status(kpi) === "closing");
                            return i * kpiHeight +(isAfterOpenKpi ? extraSpaceForSelected : 0)
                        }

                        //NOT SURE IF WE SHOULD FILTER OUT KPIS HERE?
                        //ALSO, WHY IS THERE A DELYA BEFORE THE CONTENTS ARE REMOVED?
                        //we want the list items that are not-selected to fade out immeditaely,
                        //and we also at teh same time want the closedKpi to fade out for the selected kpi.
                        //this should happen before the scroll.
                        //a delay seems ot have crept in

                        //helpers
                        const calcProgressBarHeight = (d,i) => {
                            status(d) === "open" || status(d) === "closing" ? openedKpiHeight : kpiHeight
                        }
                        const calcTitleDimns = (d,i) => {
                             //need contentsWidth and Height to work out name dimns and fontsize so it doesnt change based on status in general update
                             const kpiContentsWidth = kpiWidth - kpiMargin.left - kpiMargin.right;
                             const kpiContentsHeight = kpiHeight - kpiMargin.top - kpiMargin.bottom;
                             const width = kpiContentsWidth * 0.5;
                             const height = d3.min([kpiContentsHeight * 0.35, 10]);
                             const margin = { top: height * 0.1, bottom: height * 0.1 };
                             const fontSize = status(d) === "open" || status(d) === "opening" ? height : height * 0.7;
                             return { width, height, margin, fontSize }
                        }

                        const notClosedKpi = getNotClosedKpiKey(statuses);
                        const kpisDataToUse = notClosedKpi ? kpisData.filter(d => d.key === notClosedKpi) : kpisData;
                        const kpiG = listContentsG.selectAll("g.kpi").data(kpisDataToUse, d => d.key);
                        kpiG.enter()
                            .append("g")
                            .attr("class", d => "kpi kpi-"+d.key)
                            .call(fadeIn)
                            .call(updateTransform, { x: d => 0, y: calcY })
                            .merge(kpiG) 
                            .style("cursor", d => isSelected(d) ? "default" : "pointer")
                            .call(kpi
                                .width(() => kpiWidth)
                                .height((d,i) => status(d) === "open" || status(d) === "closing" ? openedKpiHeight : kpiHeight)
                                //.status(d => status(d) || "closed")
                                .displayFormat(displayFormat)
                                .getNrEndTooltips(getNrEndTooltips)
                                .getNrNumbers(getNrNumbers)
                                .margin(() => kpiMargin)
                                .titleDimns((d) => {
                                    //need contentsWidth and Height to work out name dimns and fontsize so it doesnt change based on status in general update
                                    const kpiContentsWidth = kpiWidth - kpiMargin.left - kpiMargin.right;
                                    const kpiContentsHeight = kpiHeight - kpiMargin.top - kpiMargin.bottom;
                                    const width = kpiContentsWidth * 0.5;
                                    const height = d3.min([kpiContentsHeight * 0.5, 14]);
                                    //console.log("kpih kpich texth",kpiHeight, kpiContentsHeight, height)
                                    const margin = { top: height * 0.1, bottom: height * 0.4 };
                                    const fontSize = 7;// status(d) === "open" || status(d) === "opening" ? height * 0.8 : height * 1.5;
                                    return { width, height, margin, fontSize }
                                })
                                .styles((d,i) => ({
                                    bg:{
                                        fill:profileIsSelected ? COLOURS.selectedMilestone : COLOURS.milestone,
                                        ...styles.kpi.bg

                                    },
                                    title:styles.kpi.title,
                                    progressBar: styles.kpi.progressBar,
                                    step:{
                                        fill:"transparent",
                                        //fill:profileIsSelected ? COLOURS.selectedMilestone : COLOURS.milestone
                                        stroke:profileIsSelected ? grey10(5) : grey10(6),
                                        strokeWidth:0.1,
                                        ...styles.kpi.step
                                    }
                                }))
                                /*
                                .onDblClick(onDblClickKpi)
                                .onClick(function(e, d){
                                    if(selected !== d.key){
                                        //select the kpi
                                        updateSelected(d.key, data, true, true);
                                        const dimns = {
                                            heights: { kpi:openedKpiHeight },
                                            margins:{ kpi:margin },
                                            heightsBelow:{ kpisCtrlsHeight:ctrlsHeight }
                                        }
                                        //WARNING - MAY ERROR as no milestoneid
                                        onUpdateSelected(d.milestoneId, d.key, true, true, dimns);
                                    }
                                })
                                .onCreateStep(onCreateStep)
                                .onEditStep((id, dimns) => {
                                    const _dimns = {
                                        widths:dimns.widths,
                                        heights: { 
                                            ...dimns.heights,
                                            kpisCtrlsHeight:ctrlsHeight, 
                                            kpi:openedKpiHeight 
                                        },
                                        margins:{ 
                                            ...dimns.margins, 
                                            kpi:margin 
                                        },
                                    }
                                    onEditStep(id, _dimns);
                                })
                                .onUpdateStep(onUpdateStep)
                                .onUpdateSteps(onUpdateSteps)
                                .onDeleteStep(onDeleteStep)
                                .onSaveValue(onSaveValue)
                                .onSetEditing(onSetEditing)*/
                            )

                        //EXIT
                        kpiG.exit().call(remove);
                        
                        //ctrls
                        /*
                        //change so its positioned from the bottom and not part of contents
                        const ctrlsG = contentsG.select("g.kpis-ctrls")
                            //.attr("transform", d => `translate(${ctrlsMargin.left +((contentsWidth-ctrlsWidth)/2)},${listHeight + ctrlsMargin.top})`);
                        
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
                                .attr("transform", (b,i) => `translate(${i * btnWidth * 1.1}, 0)`)
                                .each(function(b){
                                    const btnG = d3.select(this)
                                        .on("click", function(){
                                            //stop any eiditng that is happening in a kpi
                                            kpi.editing(null)

                                            displayFormat = b.key;
                                            //update is triggered from profileCards so it aplies to all cards
                                            //containerG.call(kpis)
                                            onCtrlClick(b.key);
                                        });
                                        
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
                        btnG.exit().remove();*/

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

    function updateSelected(key, data, shouldUpdateScroll=false, shouldUpdateDom=false){
        return;
        const { kpisData } = data;
        const newSelectedDatum = kpisData.find(d => d.key === key);
        //console.log("updateSel key--------------", key)
        //console.log("selected----", selected)
        //1. UPDATE STATUS TO OPENING/CLOSING
        if(selected === key) { return; }

        //set editing to null in all cases
        kpi.editing(null)

        //todo next - check this works with statusses , once i implement it in chldren
        //if currently somethign is selected, we will deselct and close
        let prevSelected;
        if(selected && selected !== key){
            prevSelected = selected;
            statuses[selected] = "closing";
            if(!key){
                //close everything to return to normal dimns
                //bug - there is an extra delay to the removal of the d3 openedKpi contents
                //need to find  it, or at least add it on to this...
                //d3.selectAll("div.openedKpi")
                openedKpiDiv
                    .transition()
                    .duration(CONTENT_FADE_DURATION)
                        .style("opacity", 0)
                        //.on("end", function(){ d3.select(this).style("display", "none"); })

                containerG.select("rect.contents-bg")
                    .transition()
                    .delay(CONTENT_FADE_DURATION)
                    .duration(AUTO_SCROLL_DURATION)
                        .attr("height", contentsHeight)
                
                containerG.select("rect.list-bg")
                    .transition()
                    .delay(CONTENT_FADE_DURATION)
                    .duration(AUTO_SCROLL_DURATION)
                        .attr("height", listHeight)
    
                containerG.select(`clipPath#${listClipPathId}`).select('rect')
                    .transition()
                    .delay(CONTENT_FADE_DURATION)
                    .duration(AUTO_SCROLL_DURATION)
                        .attr('height', listHeight)
    
                containerG.select("g.kpis-ctrls")
                    .transition()
                    .delay(CONTENT_FADE_DURATION)
                    .duration(AUTO_SCROLL_DURATION)
                        .attr("transform", d => `translate(${ctrlsMargin.left +((contentsWidth-ctrlsWidth)/2)},${listHeight + ctrlsMargin.top})`)
            }
        }
        //start opening new one (we can assume for now that there isnt one open atm 
        //as you cant see other kpis when one is open)
        if(key){
            statuses[key] = "opening";
        }
        //update accessors
        status = d => statuses[d.key] || "closed";
        selected = key;
        isSelected = d => d.key === selected;

        //2.GENERAL UPDATE TO REMOVE CLOSED/OPEN CONTENT
        if(shouldUpdateDom){ 
            containerG.call(kpis)
        }

        //3. AFTER DELAY TO ALLOW REMOVAL OF CONTENT, SLIDE THE KPIS BELOW DOWN/BACK UP
        const calcY = (d,i) => {
            const extraSpaceForSelected = openedKpiHeight - kpiHeight;
            //find the newly opening one, if it exists, otherwise its false for all kpis (note, it isnt 'open' yet)
            const isAfterOpenKpi = !!kpisData
                .slice(0, i)
                .find(kpi => status(kpi) === "opening");
            return i * kpiHeight +(isAfterOpenKpi ? extraSpaceForSelected : 0)
        }
        //faster speed than scroll to ensure it leaves page before scroll finishes
        //containerG.selectAll("g.kpi")
            //.call(updateTransform, { x: d => 0, y: calcY, 
                //transition:{ duration:KPI_SLIDE_DURATION, delay:CONTENT_FADE_DURATION } })
        //4.AT THE SAME TIME, SCROLL TO TOP (ONLY IF OPENING)
        if(shouldUpdateScroll){
            //console.log("update scroll-------")
            //@todo - for KpiView, we want to show one before because they are connected
            const nrToShowBefore = 0;
            const y = calculateListY(selected, kpisData, kpiHeight, nrToShowBefore);
            //console.log("zoom", zoom)
            containerG.select("g.kpis-list")
               .transition()
                .delay(CONTENT_FADE_DURATION)
                .duration(AUTO_SCROLL_DURATION)
                    .call(zoom.translateTo, 0, y, [0,0])
                    .on("end", () => { 
                        //kpi is now open so scroll should not be enabled
                        scrollEnabled = scrollable && !selected;
                        if(shouldUpdateDom){
                            if(key) { 
                                statuses[key] = "open";
                            }
                            if(prevSelected) { statuses[prevSelected] = "closed";}
                            status = d => statuses[d.key] || "closed";
                            //console.log("calling 2nd update...")
                            containerG.call(kpis) 
                        }
                    });
            if(!key){ return; }
            //open everything, and also transition the height of the opening kpi
            openedKpiDiv
                .style("display", null)
                .style("opacity", 0)
                    .transition()
                    .delay(CONTENT_FADE_DURATION + AUTO_SCROLL_DURATION)
                    .duration(CONTENT_FADE_DURATION)
                        .style("opacity", 1)

            const expandedContentsHeight = expandedHeight - margin.top - margin.bottom;
            const expandedListHeight = expandedContentsHeight - ctrlsHeight;
            containerG.select("rect.contents-bg")
                .transition()
                .delay(CONTENT_FADE_DURATION)
                .duration(AUTO_SCROLL_DURATION)
                    .attr("height", expandedContentsHeight)
            
            containerG.select("rect.list-bg")
                .transition()
                .delay(CONTENT_FADE_DURATION)
                .duration(AUTO_SCROLL_DURATION)
                    .attr("height", expandedListHeight)

            containerG.select(`clipPath#${listClipPathId}`).select('rect')
                .transition()
                .delay(CONTENT_FADE_DURATION)
                .duration(AUTO_SCROLL_DURATION)
                    .attr('height', expandedListHeight)

            containerG.select("g.kpis-ctrls")
                .transition()
                .delay(CONTENT_FADE_DURATION)
                .duration(AUTO_SCROLL_DURATION)
                    .attr("transform", d => `translate(${ctrlsMargin.left +((contentsWidth-ctrlsWidth)/2)},${expandedListHeight + ctrlsMargin.top})`)

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
    kpis.milestoneId = function (value) {
        if (!arguments.length) { return milestoneId; }
        milestoneId = value;
        return kpis;
    };
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
    kpis.margin = function (value) {
        if (!arguments.length) { return margin; }
        fixedMargin = value;
        return kpis;
    };
    kpis.maxKpiHeight = function (value) {
        if (!arguments.length) { return maxKpiHeight; }
        maxKpiHeight = value;
        return kpis;
    };
    kpis.gapBetweenKpis = function (value) {
        if (!arguments.length) { return gapBetweenKpis; }
        fixedGapBetweenKpis = value;
        return kpis;
    };
    kpis.expandedHeight = function (value) {
        if (!arguments.length) { return expandedHeight; }
        expandedHeight = value;
        return kpis;
    };
    kpis.kpiHeight = function (value) {
        if (!arguments.length) { return fixedKpiHeight; }
        fixedKpiHeight = value;
        return kpis;
    };
    kpis.openedKpiHeight = function (value) {
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
        const kpi = values.kpi ? { ...styles.kpi, ...values.kpi } : styles.kpi;
        const ctrls = values.ctrls ? { ...styles.ctrls, ...values.ctrls } : styles.ctrls;
        styles = { ...styles, ...values, kpi, ctrls };
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
    kpis.kpiFormat = function (value) {
        if (!arguments.length) { return kpiFormat; }
        kpiFormat = value;
        return kpis;
    };
    kpis.displayFormat = function (value) {
        if (!arguments.length) { return displayFormat; }
        displayFormat = value;
        return kpis;
    };
    kpis.profileIsSelected = function (value) {
        if (!arguments.length) { return profileIsSelected; }
        profileIsSelected = value;
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
        if(prevData.length !== 0){
            updateSelected(value, prevData, shouldUpdateScroll, shouldUpdateDom);
        }
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
    kpis.onClickKpi = function (value) {
        if (!arguments.length) { return onClickKpi; }
        onClickKpi = value;
        return kpis;
    };
    kpis.onCreateStep = function (value) {
        if (!arguments.length) { return onCreateStep; }
        onCreateStep = value;
        return kpis;
    };
    kpis.onEditStep = function (value) {
        if (!arguments.length) { return onEditStep; }
        onEditStep = value;
        return kpis;
    };
    kpis.onUpdateStep = function (value) {
        if (!arguments.length) { return onUpdateStep; }
        onUpdateStep = value;
        return kpis;
    };
    kpis.onUpdateSteps = function (value) {
        if (!arguments.length) { return onUpdateSteps; }
        onUpdateSteps = value;
        return kpis;
    };
    kpis.onDeleteStep = function (value) {
        if (!arguments.length) { return onDeleteStep; }
        onDeleteStep = value;
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
    kpis.onSetEditing = function (value) {
        if (!arguments.length) { return onSetEditing; }
        if(typeof value === "function"){
            onSetEditing = value;
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