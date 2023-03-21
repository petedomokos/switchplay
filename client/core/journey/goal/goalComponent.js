import * as d3 from 'd3';
import { DIMNS, grey10, TRANSITIONS } from "../constants";

const CONTENT_FADE_DURATION = TRANSITIONS.KPI.FADE.DURATION;
const AUTO_SCROLL_DURATION = TRANSITIONS.KPIS.AUTO_SCROLL.DURATION;
//faster speed than scroll to ensure it leaves page before scroll finishes
const KPI_SLIDE_DURATION = AUTO_SCROLL_DURATION * 0.66;

/*

*/
export default function goalComponent() {
    //API SETTINGS
    // dimensions
    let width = DIMNS.profile.width;
    let height = DIMNS.profile.height;
    let margin;
    let contentsWidth;
    let contentsHeight;

    let detailsWidth;
    let detailsHeight;
    let ctrlsWidth;
    let ctrlsHeight;

    let ctrlsMargin;
    let ctrlsContentsWidth;
    let ctrlsContentsHeight;
    let btnWidth;
    let btnHeight;
    let btnFontSize;

    let scrollMin;
    let scrollMax;

    function updateDimns(nrCtrlsButtons){
        margin = { left: width * 0.1, right: width * 0.1, top:height * 0.1, bottom: height * (nrCtrlsButtons === 0 ? 0.1 : 0.05) };
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        ctrlsWidth = 0 ;// contentsWidth * (contentsWidth < 200 ? 0.8 : 0.7);
        ctrlsHeight = 0;// nrCtrlsButtons !== 0 ? contentsHeight * 0.15 : 0;
        ctrlsMargin = { left: contentsWidth * 0.1, right: contentsWidth * 0.1, top: ctrlsHeight * 0.1, bottom: ctrlsHeight * 0.1 };
        ctrlsContentsWidth = ctrlsWidth - ctrlsMargin.left - ctrlsMargin.right;
        ctrlsContentsHeight = ctrlsHeight - ctrlsMargin.top - ctrlsMargin.bottom;
        btnWidth = nrCtrlsButtons === 0 ? 0 : ctrlsContentsWidth / nrCtrlsButtons;
        btnHeight = ctrlsContentsHeight;
        
        //width
        detailsWidth = contentsWidth;
        //height
        detailsHeight = contentsHeight - ctrlsHeight;

        scrollMin = 1000;
        scrollMax = 0;

    }

    let fontSizes = {
    };
    let styles = {}

    let withCtrls = true;
    let selected;
    let isSelected = d => false;

    let editable = false;
    let scrollable = false;
    let scrollEnabled = false;

    //API CALLBACKS
    let onUpdateSelected = function(){};
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
    let onSaveValue = function(){};

    const zoom = d3.zoom();

    //dom
    let containerG;
    function goal(selection, options={}) {
        //console.log("goal update...........................")
        const { transitionEnter=true, transitionUpdate=true, log } = options;

        // expression elements
        selection.each(function (data,i) {
            //console.log("goal", data)
            const ctrlsData = withCtrls && data.ctrlsData ? data.ctrlsData : [];

            updateDimns(ctrlsData.length);
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

                        const detailsG = contentsG.append("g").attr("class", "details");
                        detailsG
                            .append("rect")
                                .attr("class", "details-bg")
                                .attr("fill", "transparent")
                                //.attr("stroke", "blue");
                        
                        detailsG
                            .append("text")
                                .attr("class", "title");
                        detailsG
                            .append("text")
                                .attr("class", "title")

                        contentsG.append("g").attr("class", "goal-ctrls")
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

                        const detailsG = contentsG.select("g.details");
                        detailsG.select("rect.details-bg")
                            .attr("width", detailsWidth)
                            .attr("height", detailsHeight)

                        
                        //ctrls
                        const ctrlsG = contentsG.select("g.goal-ctrls")
                            .attr("transform", d => `translate(${ctrlsMargin.left +((contentsWidth-ctrlsWidth)/2)},${detailsHeight + ctrlsMargin.top})`);
                        
                        ctrlsG.select("rect.ctrls-bg")
                            .attr("width", ctrlsContentsWidth)
                            .attr("height", ctrlsContentsHeight)
                            .attr("fill", "yellow")// "none")

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
        })

        return selection;
    }
    
    //api
    goal.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return goal;
    };
    goal.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return goal;
    };
    goal.fontSizes = function (values) {
        if (!arguments.length) { return fontSizes; }
        fontSizes = { ...fontSizes, ...values };
        return goal;
    };
    goal.styles = function (values) {
        if (!arguments.length) { return styles; }
        styles = { ...styles, ...values };
        return goal;
    };
    goal.withCtrls = function (value) {
        if (!arguments.length) { return withCtrls; }
        withCtrls = value;
        return goal;
    };
    goal.editable = function (value) {
        if (!arguments.length) { return editable; }
        editable = value;
        return goal;
    };
    goal.scrollable = function (value) {
        if (!arguments.length) { return scrollable; }
        scrollable = value;
        scrollEnabled = scrollable && !selected;
        return goal;
    };
    // todo - kpiClick not working in KpiView
    //todo - fix below in journey and milestonesBar versions of goalComponent so it renders properly,
    //ie the tooltips etc
    goal.selected = function (value, shouldUpdateScroll, shouldUpdateDom) {
        if (!arguments.length) { return selected; }
        updateSelected(value, prevData, shouldUpdateScroll, shouldUpdateDom);
        return goal;
    };
    goal.onUpdateSelected = function (value) {
        if (!arguments.length) { return onUpdateSelected; }
        onUpdateSelected = value;
        return goal;
    };
    goal.onCtrlClick = function (value) {
        if (!arguments.length) { return onCtrlClick; }
        onCtrlClick = value;
        return goal;
    };
    goal.onZoomStart = function (value) {
        if (!arguments.length) { return onZoomStart; }
        if(typeof value === "function"){
            onZoomStart = value;
        }
        return goal;
    };
    goal.onZoom = function (value) {
        if (!arguments.length) { return onZoom; }
        if(typeof value === "function"){
            onZoom = value;
        }
        return goal;
    };
    goal.onZoomEnd = function (value) {
        if (!arguments.length) { return onZoomEnd; }
        if(typeof value === "function"){
            onZoomEnd = value;
        }
        return goal;
    };
    goal.onDragStart = function (value) {
        if (!arguments.length) { return onDragStart; }
        if(typeof value === "function"){
            onDragStart = value;
        }
        return goal;
    };
    goal.onDrag = function (value) {
        if (!arguments.length) { return onDrag; }
        if(typeof value === "function"){
            onDrag = value;
        }
        return goal;
    };
    goal.onDragEnd = function (value) {
        if (!arguments.length) { return onDragEnd; }
        if(typeof value === "function"){
            onDragEnd = value;
        }
        return goal;
    };
    goal.onLongpressStart = function (value) {
        if (!arguments.length) { return onLongpressStart; }
        if(typeof value === "function"){
            onLongpressStart = value;
        }
        return goal;
    };
    goal.onLongpressDragged = function (value) {
        if (!arguments.length) { return onLongpressDragged; }
        if(typeof value === "function"){
            onLongpressDragged = value;
        }
        return goal;
    };
    goal.onLongpressEnd = function (value) {
        if (!arguments.length) { return onLongpressEnd; }
        if(typeof value === "function"){
            onLongpressEnd = value;
        }
        return goal;
    };
    goal.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return goal;
    };
    goal.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return goal;
    };
    goal.onDelete = function (value) {
        if (!arguments.length) { return onDelete; }
        if(typeof value === "function"){
            onDelete = value;
        }
        return goal;
    };
    goal.onSaveValue = function (value) {
        if(typeof value === "function"){
            onSaveValue = value;
        }
        return goal;
    };
    return goal;
}