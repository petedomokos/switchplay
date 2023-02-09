import * as d3 from 'd3';
import { DIMNS, grey10 } from "../../constants";
import container from './container';
import background from './background';
import numberComponent from "./numberComponent"

/*

*/
export default function numbersComponent() {
    //API SETTINGS
    let parentSelector = "";
    let parent = function(){ return d3.select(this); };
    // dimensions
    let DEFAULT_WIDTH = 100;
    let DEFAULT_HEIGHT = 30;
    let DEFAULT_MARGIN = { left: 0, right:0, top: 0, bottom: 0 };
    let contentsWidth;
    let contentsHeight;
    let _width = () => DEFAULT_WIDTH;
    let _height = () => DEFAULT_HEIGHT;
    let _margin = () => DEFAULT_MARGIN;

    let dimns = [];

    /*
    function _dimns(d, i, data){
        const width = _width(d,i)
        const height = _height(d,i);
        const margin = _margin(d,i);
        const contentsWidth = width - margin.left - margin.right;
        const contentsHeight = height - margin.top - margin.bottom;
        return {
            width, height, margin, contentsWidth, contentsHeight,
        }
    }
    */

    //per datum
    function updateDimns(numbersData){
        dimns = [];
        return numbersData.forEach((numberData,i) => {
            const width = _width(numberData,i)
            const height = _height(numberData,i);
            const margin = _margin(numberData,i);
            const contentsWidth = width - margin.left - margin.right;
            const contentsHeight = height - margin.top - margin.bottom;

            const numberWidth = numberData.length > 0 ? contentsWidth / numberData.length : contentsWidth;
            const numberHeight = contentsHeight;
            const numberMargin = { 
                left: numberWidth * 0, right: numberWidth * 0,
                top: numberHeight * 0, bottom:numberHeight * 0
            }
            const fontSize = d3.max([12, d3.min([16, numberHeight * 0.8])]);
 
            dimns.push({
                width, height, margin, contentsWidth, contentsHeight,
                numberWidth, numberHeight, numberMargin, fontSize
            })
        })
    }

    //helper
    const sumOfPrevious = (arr, i, accessor = d => d) => d3.sum(arr.slice(0,i), accessor);

    const DEFAULT_STYLES = {};
    let _styles = () => DEFAULT_STYLES;

    let _transform = () => null;

    //API CALLBACKS
    let onClick = function(){};
    let onDblClick = function(){};
    let onLongpressStart = function(){};
    let onLongpressEnd = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};

    function numbers(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log} = options;
        updateDimns(selection.data());

        selection
            .call(container()
                .className("numbers-contents")
                .transform((d,i) => `translate(${_margin(d,i).left},${_margin(d,i).top})`));
        
        const numbersContentsG = selection.select("g.numbers-contents");

        numbersContentsG
            .call(background()
                .width((d,i) => dimns[i].contentsWidth)
                .height((d,i) => {
                    return dimns[i].contentsHeight
                })
                .styles((d, i) => ({
                    fill:"transparent"
                })))
            .each(function(d,i){
                const { numberWidth, numberHeight, numberMargin, fontSize } = dimns[i];
                //call a separate numberComponent for each kpi set of numbers, as these are grouped together logically
                d3.select(this).selectAll("g.number").data(d)
                    .join("g")
                        .attr("class", "number")
                        .attr("transform", (d,i) => `translate(${sumOfPrevious(dimns, i, d => d.numberWidth)}, 0)`)
                        .call(numberComponent()
                            .width(numberWidth)
                            .height(numberHeight)
                            .margin(numberMargin)
                            .styles({ fontSize }));
            })
    
        /*

        const numberWidth = numbersContentsWidth / d.numbersData.length;
        //ext - could allow quadrants if 4 numbers
        const numberHeight = numbersContentsHeight;
        const numberFontSize = numberWidth * 0.4;

        //position numbers from top of top handle to bottom of bottom handle
        const numbersY = kpiNameHeight + (isSelected(d) ? 2 * tooltipHeight : 0);

        const numbersG = contentsG.select("g.numbers")
            .attr("transform", `translate(${barWidth}, ${numbersY})`)
        
        const numbersContentsG = numbersG.select("g.numbers-contents")
            .attr("transform", `translate(${numbersMargin.left}, ${numbersMargin.top})`)
        
        numbersContentsG.select("rect")
            .attr("width", numbersContentsWidth)
            .attr("height", numbersContentsHeight);
        
        */

        return selection;
    }
    
    //api
    numbers.parent = function (value) {
        if (!arguments.length) { return parent; }
        if(typeof value === "string"){
            parentSelector = value;
            parent = function(){ return d3.select(this).select(parentSelector); }
        }else {
            parent = value;
        }
        return numbers;
    };
    numbers.width = function (value) {
        if (!arguments.length) { return _width; }
        _width = value;
        return numbers;
    };
    numbers.height = function (value) {
        if (!arguments.length) { return _height; }
        _height = value;
        return numbers;
    };
    numbers.margin = function (func) {
        if (!arguments.length) { return _margin; }
        _margin = (d,i) => ({ ...DEFAULT_MARGIN, ...func(d,i) })
        return numbers;
    };
    numbers.transform = function (value) {
        if (!arguments.length) { return _transform; }
        if(typeof value === "function"){
            _transform = value;
        }
        return numbers;
    };
    numbers.styles = function (func) {
        if (!arguments.length) { return _styles; }
        _styles = (d,i) => ({ ...DEFAULT_STYLES, ...func(d,i) });
        return numbers;
    };
    numbers.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return numbers;
    };
    numbers.onDblClick = function (value) {
        if (!arguments.length) { return onDblClick; }
        onDblClick = value;
        return numbers;
    };
    numbers.onLongpressStart = function (value) {
        if (!arguments.length) { return onLongpressStart; }
        if(typeof value === "function"){
            onLongpressStart = value;
        }
        return numbers;
    };
    numbers.onLongpressEnd = function (value) {
        if (!arguments.length) { return onLongpressEnd; }
        if(typeof value === "function"){
            onLongpressEnd = value;
        }
        return numbers;
    };
    numbers.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return numbers;
    };
    numbers.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return numbers;
    };
    return numbers;
}
