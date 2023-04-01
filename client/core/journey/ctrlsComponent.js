import * as d3 from 'd3';
import { DIMNS, FONTSIZES, grey10 } from "./constants";
import dragEnhancements from './enhancedDragHandler';
/*

*/
export default function ctrlsComponent() {
    //API SETTINGS
    // dimensions
    let width = 0;
    let height = 0;
    let margin = { left: 0, right: 0, top: 0, bottom:0 };
    let contentsWidth;
    let contentsHeight;
    let extraMarginTop;   
    let extraMarginLeft;

    let btnWidth;
    let btnHeight;
    let btnGap;
    let fixedBtnWidth;
    let fixedBtnHeight;
    let fixedBtnGap;

    let orientation = "vertical";

    function updateDimns(nrBtns){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
        btnWidth = fixedBtnWidth || (orientation === "vertical" ? contentsWidth : 30); //todo - instead of 50, calc max text length
        btnHeight = fixedBtnHeight || (orientation === "vertical" ? contentsHeight * 0.25 : contentsHeight);
        btnGap = fixedBtnGap || (orientation === "vertical" ? btnHeight * 0.5 : btnWidth * 0.1);

        let totalBtnsWidth;
        let totalBtnsHeight;
        if(orientation === "vertical"){
            totalBtnsWidth = btnWidth;
            totalBtnsHeight = nrBtns * (btnHeight + btnGap) - btnGap;
        }else{
            totalBtnsWidth = nrBtns * (btnWidth + btnGap) - btnGap;
            totalBtnsHeight = btnHeight;
        }
        const remainingHorizSpace = contentsWidth - totalBtnsWidth;
        const remainingVertSpace = contentsHeight - totalBtnsHeight;
        extraMarginLeft = remainingHorizSpace/2;
        extraMarginTop = remainingVertSpace/2; 
    }

    //@todo - replace fontsizes with styles only
    let DEFAULT_STYLES = {
    }
    let _styles = () => DEFAULT_STYLES;


    let enhancedDrag = dragEnhancements();

    let onClick = function(){};
    let onDblClick = function(){};
    let onLongpress = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};

    function ctrls(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;
        selection.each(function (data, i) { update.call(this, data, i); })
        return selection;
    }

    function update(data, i){
        const styles = _styles(data);

        const { btnData } = data;
        //dimns only once
        if(i === 0){ updateDimns(btnData.length);}

        d3.select(this).selectAll("g.ctrls-contents").data([1])
            .join("g")
            .attr("class", "ctrls-contents")
            .attr("transform", `translate(${margin.left + extraMarginLeft}, ${margin.top + extraMarginTop})`)
            .each(function(){
                const contentsG = d3.select(this);

                const btnG = contentsG.selectAll("g.btn").data(btnData, d => d.key);
                btnG.enter()
                    .append("g")
                        .attr("class", "placeholder-btn")
                        .each(function(){
                            const btnG = d3.select(this);
                            btnG
                                .append("rect")
                                .attr("rx", 5)
                                .attr("ry", 5);
                            btnG
                                .append("text")
                                    .attr("text-anchor", "middle")
                                    .attr("dominant-baseline", "central")
                                    .attr("stroke", "white")
                                    .attr("fill", "white")
                                    .attr("stroke-width", 0.3)
                        })
                        .merge(btnG)
                        .attr("transform",(d,i) => `translate(0, ${i * (btnHeight + btnGap)})`)
                        .each(function(d){
                            const btnG = d3.select(this);
                            btnG.select("rect")
                                .attr("width", btnWidth)
                                .attr("height", btnHeight)
                                .attr("fill", grey10(5))
                                .attr("stroke", "none")

                            btnG.select("text")
                                .attr("x", btnWidth/2)
                                .attr("y", btnHeight/2)
                                .attr("font-size", btnHeight * 0.4)
                                .text(d => d.label)
                        })
                        .on("mouseover", function(){ 
                            d3.select(this).select("rect").attr("stroke", "white") 
                        })
                        .on("mouseout", function(){ 
                            d3.select(this).select("rect").attr("stroke", "none") 
                        })
                        .on("click", onClick)
            })
    }
    
    //api
    ctrls.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return ctrls;
    };
    ctrls.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return ctrls;
    };
    ctrls.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = value;
        return ctrls;
    };
    ctrls.styles = function (value) {
        if (!arguments.length) { return _styles; }
        if(typeof value === "function"){
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value(d,i) });
        }else{
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value });
        }
        
        return ctrls;
    };
    ctrls.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return ctrls;
    };
    ctrls.onDblClick = function (value) {
        if (!arguments.length) { return onDblClick; }
        onDblClick = value;
        return ctrls;
    };
    ctrls.onLongpress = function (value) {
        if (!arguments.length) { return onLongpress; }
        onLongpress = value;
        return ctrls;
    };
    ctrls.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return ctrls;
    };
    ctrls.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return ctrls;
    };
    return ctrls;
}
