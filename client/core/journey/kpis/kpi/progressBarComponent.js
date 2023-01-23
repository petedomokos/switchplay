import * as d3 from 'd3';
import { DIMNS, grey10 } from "../../constants";
import dragEnhancements from '../../enhancedDragHandler';
import tooltipsComponent from '../../tooltipsComponent';
import barComponent from './barComponent';
import container from './container';
import background from './background';
import { getTransformationFromTrans } from '../../helpers';

/*

*/
export default function progressBarComponent() {
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

    let _upperTooltipsHeight = () => 0;

    let dimns = [];
    let xScales = {};

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
    function updateDimns(data){
        dimns = [];
        return data.forEach((d,i) => {
            const { barData, numbersData, tooltipsData } = d;
            const nrTooltips = tooltipsData?.length || 2; //@todo - change default to 0

            const width = _width(d,i)
            const height = _height(d,i);
            const margin = _margin(d,i);
            const contentsWidth = width - margin.left - margin.right;
            const contentsHeight = height - margin.top - margin.bottom;
            //console.log("bar contentsH for ", i, contentsHeight)
            //todo - also subtract space for tooltips above and below
            const barComponentHeight = d3.min([20, contentsHeight * 0.2]);
            const tooltipsTotalHeight = contentsHeight - barComponentHeight;
            const tooltipHeight = tooltipsTotalHeight/nrTooltips;

            const barComponentWidth = contentsWidth;
            //build up widths from numbers
            //group numbers into 1, 2 or 3 cols
            const nrNumbers = numbersData.length
            let nrNumberCols = nrNumbers;
            if(nrNumbers > 3){
                nrNumberCols = nrNumberCols % 3 === 0 ? 3 :(nrNumbers % 2 === 0 ? 2 : 1)
            }
            const numberWidth = barComponentWidth * 0.2;
            const numbersWidth = nrNumberCols * numberWidth;
            const barWidth = barComponentWidth - numbersWidth;

            const targetTooltipWidth = tooltipHeight * 1.3;
            const expectedTooltipWidth = tooltipHeight;

            //tooltips must use same scale as bar, so range is same
            const tooltipsWidth = barWidth;
            //target margins
            const targetTooltipMargin = {
                left:targetTooltipWidth * 0.25, 
                right:targetTooltipWidth * 0.25, 
                top:tooltipHeight * 0.25, 
                bottom:tooltipHeight * 0.25
            }
            //expected margins
            const expectedTooltipMargin = {
                left:expectedTooltipWidth * 0.15, 
                right:expectedTooltipWidth * 0.15,
                top:tooltipHeight * 0.15, 
                bottom:tooltipHeight * 0.15
            }

            const targetTooltipDimns = { 
                width:targetTooltipWidth, height:tooltipHeight,
                contentsWidth: targetTooltipWidth - targetTooltipMargin.left - targetTooltipMargin.right, 
                contentsHeight:tooltipHeight - targetTooltipMargin.top - targetTooltipMargin.bottom,
                margin:targetTooltipMargin
            }
            const expectedTooltipDimns = { 
                width: expectedTooltipWidth, height:tooltipHeight,
                contentsWidth:expectedTooltipWidth - expectedTooltipMargin.left - expectedTooltipMargin.right, 
                contentsHeight:tooltipHeight - expectedTooltipMargin.top - expectedTooltipMargin.bottom,
                margin:expectedTooltipMargin
            }
            const tooltipDimns = { target: targetTooltipDimns, expected:expectedTooltipDimns };
            dimns.push({
                width, height, margin, contentsWidth, contentsHeight,
                barComponentWidth, barComponentHeight,
                barWidth,
                tooltipDimns, tooltipHeight
            })
            //SCALES
            //xScale (ie bar scale) set here as it is used by tooltips too
            //init
            if(!xScales[d.key]){ xScales[d.key] = d3.scaleLinear(); }
            //update
            const extent = [barData.start, barData.end]
            xScales[d.key]
                .domain(extent)
                .range([0, barWidth])

            //yScale
        })
    }

    const defaultStyles = {
        barSections:{
        }
    };
    let _styles = () => defaultStyles;
    let _transform = () => null;
    let transitionUpdate = false;

    let fixedDomain = [0,100]
    let _domain;

    let editable = () => false;

    let display = () => null;


    //API CALLBACKS
    let onBarClick = function(){};
    let onBarDblClick = function(){};
    let onBarLongpressStart = function(){};
    let onBarLongpressEnd = function(){};
    let onBarMouseover = function(){};
    let onBarMouseout = function(){};

    let onBarHandleClick = function(){};
    let onBarHandleDblClick = function(){};
    let onStoreValue = function(){};
    let onSaveValue = function(){};

    const enhancedDrag = dragEnhancements();
    const tooltips = tooltipsComponent();
    const bar = barComponent();

    function progressBar(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log} = options;
        updateDimns(selection.data());

        selection
            .call(container("progress-bar-contents")
                .transform((d,i) => `translate(${dimns[i].margin.left},${dimns[i].margin.top})`)
            )
        
        selection.select("g.progress-bar-contents")
            .call(background()
                .width((d,i) => dimns[i].contentsWidth)
                .height((d,i) => dimns[i].contentsHeight)
                .styles((d, i) => ({
                    stroke:"none",
                    fill:_styles(d).bg?.fill || "transparent"
                })))
            .call(container("tooltips")
                //.transform((d,i) => `translate(${_margin(d,i).left},${_margin(d,i).top})`)
            )
            .call(container("bar-area")
                //.transform((d,i) => `translate(0,${_upperTooltipsHeight(d,i)})`)
                .transform((d,i) => `translate(0,${dimns[i].tooltipHeight})`)
            )
        
        selection.select("g.bar-area")
            //.data(selection.data().map(d => d.barData))
            .call(bar
                .width((d,i) => dimns[i].barComponentWidth)
                .height((d,i) => dimns[i].barComponentHeight)
                .scale((d,i) => xScales[d.key])
                .editable(editable)
            , { transitionEnter, transitionUpdate} )

        const enrichedTooltipsData = selection.data().map(d => d.tooltipsData.map(t => ({ ...t, progBarKey: d.key })))
        selection.select("g.tooltips")
            .data(enrichedTooltipsData)
        //pass in tooltips data
        //error - this same component is being called for very single kpi...need to look back at pattern
        //how am i doing it ?
            .call(tooltips
                .width((d,i) => dimns[i].barWidth)
                .height((d,i) => dimns[i].contentsHeight)
                //bug when open, tooltipdimns dont increase
                .tooltipDimns((d,i) => dimns[i].tooltipDimns)
                .xScale(d => xScales[d[0]?.progBarKey])
                //y is 1 or -1
                .yScale((d,i) => (rowNr) => rowNr === 1 ? 0.5 * dimns[i].tooltipHeight : (1.5 * dimns[i].tooltipHeight + dimns[i].barComponentHeight))
                .onClick(function(e,d){
                    //console.log("clicked", this, e, d)
                })
                .onDragEnd(function(e, d){
                    //store the new value
                    onStoreValue(d.value, d.progBarKey, d.key)
                    //show a save btn
                })
                .onMouseover(function(e,d){
                    //console.log("mover")
                })
                .onMouseout(function(e,d){
                    //console.log("mout")
                }))

        return selection;
    }
    
    //api
    progressBar.parent = function (value) {
        if (!arguments.length) { return parent; }
        if(typeof value === "string"){
            parentSelector = value;
            parent = function(){ return d3.select(this).select(parentSelector); }
        }else {
            parent = value;
        }
        return progressBar;
    };
    progressBar.width = function (value) {
        if (!arguments.length) { return _width; }
        _width = value;
        return progressBar;
    };
    progressBar.height = function (value) {
        if (!arguments.length) { return _height; }
        _height = value;
        return progressBar;
    };
    progressBar.margin = function (func) {
        if (!arguments.length) { return _margin; }
        _margin = (d,i) => ({ ...DEFAULT_MARGIN, ...func(d,i) })
        return progressBar;
    };
    progressBar.editable = function (value) {
        if (!arguments.length) { return editable; }
        editable = value;
        return progressBar;
    };
    progressBar.transitionUpdate = function (value) {
        if (!arguments.length) { return transitionUpdate; }
        transitionUpdate = value;
        return progressBar;
    };
    progressBar.transform = function (value) {
        if (!arguments.length) { return _transform; }
        if(typeof value === "function"){
            _transform = value;
        }
        return progressBar;
    };
    progressBar.styles = function (func) {
        if (!arguments.length) { return _styles; }
        _styles = (d,i) => {
            const requiredStyles = func(d,i);
            return {
                name:{ ...defaultStyles.name, ...requiredStyles.name },
                //others here
            }
        };
        return progressBar;
    };
    progressBar._name = function (value) {
        if (!arguments.length) { return _name; }
        if(typeof value === "function"){
            _name = value;
        }s
        return progressBar;
    };
    progressBar.domain = function (value) {
        if (!arguments.length) { return fixedDomain || _domain; }
        if(typeof value === "function"){
            _domain = value;
            fixedDomain = null;
        }else{
            fixedDomain = value;
        }
        return progressBar;
    };
    progressBar.onBarClick = function (value) {
        if (!arguments.length) { return onBarClick; }
        onBarClick = value;
        return progressBar;
    };
    progressBar.onBarDblClick = function (value) {
        if (!arguments.length) { return onBarDblClick; }
        onBarDblClick = value;
        return progressBar;
    };
    progressBar.onBarLongpressStart = function (value) {
        if (!arguments.length) { return onBarLongpressStart; }
        if(typeof value === "function"){
            onBarLongpressStart = value;
        }
        return progressBar;
    };
    progressBar.onBarLongpressEnd = function (value) {
        if (!arguments.length) { return onBarLongpressEnd; }
        if(typeof value === "function"){
            onBarLongpressEnd = value;
        }
        return progressBar;
    };
    progressBar.onBarMouseover = function (value) {
        if (!arguments.length) { return onBarMouseover; }
        if(typeof value === "function"){
            onBarMouseover = value;
        }
        return progressBar;
    };
    progressBar.onBarMouseout = function (value) {
        if (!arguments.length) { return onBarMouseout; }
        if(typeof value === "function"){
            onBarMouseout = value;
        }
        return progressBar;
    };
    progressBar.onStoreValue = function (value) {
        if(typeof value === "function"){
            onStoreValue = value;
        }
        return progressBar;
    };
    progressBar.onSaveValue = function (value) {
        if(typeof value === "function"){
            onSaveValue = value;
        }
        return progressBar;
    };
    return progressBar;
}
