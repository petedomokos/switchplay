import * as d3 from 'd3';
import { DIMNS, grey10 } from "../../constants";
import dragEnhancements from '../../enhancedDragHandler';
import { pcCompletion } from "../../../../util/NumberHelpers"
import { Oscillator } from '../../domHelpers';
import { getTransformationFromTrans } from '../../helpers';
import titleComponent from './titleComponent';
import progressBarComponent from './progressBarComponent';
//import numbersComponent from './numbersComponent';
import container from './container';
import background from './background';

/*

*/
export default function kpiComponent() {
    //API SETTINGS
    // dimensions
    //general
    let DEFAULT_WIDTH = DIMNS.profile.width;
    let DEFAULT_HEIGHT = DIMNS.profile.height;
    let DEFAULT_MARGIN = { left: 0, right:0, top: 0, bottom: 0 };

    let _width = () => DEFAULT_WIDTH;
    let _height = () => DEFAULT_HEIGHT;
    let _margin = () => DEFAULT_MARGIN;

    let dimns = [];

    //common
    function updateCommonDimns(data){
    }

    //per datum
    function updateDimns(data){
        dimns = [];
        return data.forEach((d,i) => {
            const width = _width(d,i)
            const height = _height(d,i);
            const margin = _margin(d,i);
            const contentsWidth = width - margin.left - margin.right;
            const contentsHeight = height - margin.top - margin.bottom;

            const titleWidth = contentsWidth * 0.5;
            const titleHeight = d3.min([contentsHeight * 0.5, 10]);
            const titleMargin = { left: 0, right: 0, top: titleHeight * 0.1, bottom: titleHeight * 0.1 };

            //progressBar is bar, handles and tooltips
            const progressBarWidth = contentsWidth;
            const progressBarHeight = contentsHeight - titleHeight;
            const progressBarMargin = { 
                left: progressBarWidth * 0.1, right: progressBarWidth * 0.1, 
                top: progressBarHeight * 0.1, bottom: progressBarHeight * 0.1 
            };
 
            dimns.push({
                width, height, margin, contentsWidth, contentsHeight,
                titleWidth, titleHeight, titleMargin,
                progressBarWidth, progressBarHeight, progressBarMargin
            })
        })
    }

    const DEFAULT_STYLES = {};
    let _styles = () => DEFAULT_STYLES;

    let _name = d => d.name;
    let isEditable = () => false;
    let withTooltips = () => false;


    //API CALLBACKS
    let onClick = function(){};
    let onDblClick = function(){};
    let onDragStart = function(){};
    let onDrag = function() {};
    let onDragEnd = function() {};
    let onLongpressStart = function(){};
    let onLongpressDragged = function(){};
    let onLongpressEnd = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};
    let onDelete = function(){};

    const enhancedDrag = dragEnhancements()
        .onClick((e,d) => { onClick.call(this, e, d); }) //todo - why do i have to write it out like this?
        //.onClick(onClick) not working
        .onDblClick(onDblClick);

    //const contents = containerComponent();
    //const background = backgroundComponent();
    const title = titleComponent();
    const progressBar = progressBarComponent();
    //const numbers = numbersComponent();

    //dom

    function kpi(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log} = options;
        updateDimns(selection.data());

        const drag = d3.drag()
            .on("start", enhancedDrag())
            .on("drag", enhancedDrag())
            .on("end", enhancedDrag());

        // expression elements
        selection
            .call(container()
                .className("kpi-contents")
                .transform((d, i) => {
                    console.log("trans", i, dimns[i].margin.top)
                    return `translate(${dimns[i].margin.left},${dimns[i].margin.top})`
                })
            )
            //could apply other contentshere too eg 
            /*
            .call(container()
                .parent("g.kpi-contents")
                .className("progress-bar-contents")
                .transform((d, i) => `translate(${dimns[i].progressBarMargin.left},${dimns[i].progressBarMargin.top})`)
            )
            */
            //.call(container().parent("g.kpi-contents").className("numbers-contents").margin(numbersMargin))
            //but probably best to do that as part of teh components, as happens with titleCompoennt
            //can ice these components a className let which is accessible from outside and can be overridden eg className = numbers
            .call(background()
                .parent("g.kpi-contents")
                .width((d,i) => dimns[i].contentsWidth)
                .height((d,i) => {
                    console.log("bg", i, dimns[i].contentsHeight)
                    return dimns[i].contentsHeight
                })
                .styles((d, i) => ({
                    fill:i % 2 === 0 ? "blue" : "aqua"
                }))
            )
            .call(title
                .parent("g.kpi-contents")
                .width((d,i) => dimns[i].titleWidth)
                .height((d,i) => dimns[i].titleHeight)
                .margin((d,i) => dimns[i].titleMargin)
                .styles((d,i) => ({
                    name:{ 
                        fontSize:dimns[i].titleHeight * 0.8,
                        strokeWidth:0.2,
                        dominantBaseline:"central",
                    }
                })))
            .call(progressBar
                .parent("g.kpi-contents")
                .transform((d, i) => `translate(0,${dimns[i].titleHeight})`)
                .width((d,i) => dimns[i].progressBarWidth)
                .height((d,i) => dimns[i].progressBarHeight)
                .margin((d,i) => dimns[i].progressBarMargin)
            )
            /*
            .call(numbers
                .transform(() => `translate(${barWrapperWidth},0)`) //numbersY should be centred on bar
            )*/
            .call(drag)


        return selection;
    }
    
    //api
    kpi.width = function (value) {
        if (!arguments.length) { return _width; }
        _width = value;
        return kpi;
    };
    kpi.height = function (value) {
        if (!arguments.length) { return _height; }
        _height = value;
        return kpi;
    };
    kpi.margin = function (func) {
        if (!arguments.length) { return _margin; }
        _margin = (d,i) => ({ ...DEFAULT_MARGIN, ...func(d,i) })
        return kpi;
    };
    kpi.withTooltips = function (value) {
        if (!arguments.length) { return withTooltips; }
        withTooltips = value;
        return kpi;
    };
    kpi.fontSizes = function (values) {
        if (!arguments.length) { return fontSizes; }
        fontSizes = { ...fontSizes, ...values };
        return kpi;
    };
    kpi.styles = function (func) {
        if (!arguments.length) { return _styles; }
        _styles = (d,i) => ({ ...DEFAULT_STYLES, ...func(d,i) });
        return kpi;
    };
    kpi.isEditable = function (value) {
        if (!arguments.length) { return isEditable; }
        isEditable = value;
        return kpi;
    };
    kpi._name = function (value) {
        if (!arguments.length) { return _name; }
        if(typeof value === "function"){
            _name = value;
        }
        return kpi;
    };
    kpi.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return kpi;
    };
    kpi.onDblClick = function (value) {
        if (!arguments.length) { return onDblClick; }
        onDblClick = value;
        return kpi;
    };
    kpi.onDragStart = function (value) {
        if (!arguments.length) { return onDragStart; }
        if(typeof value === "function"){
            onDragStart = value;
        }
        return kpi;
    };
    kpi.onDrag = function (value) {
        if (!arguments.length) { return onDrag; }
        if(typeof value === "function"){
            onDrag = value;
        }
        return kpi;
    };
    kpi.onDragEnd = function (value) {
        if (!arguments.length) { return onDragEnd; }
        if(typeof value === "function"){
            onDragEnd = value;
        }
        return kpi;
    };
    kpi.onLongpressStart = function (value) {
        if (!arguments.length) { return onLongpressStart; }
        if(typeof value === "function"){
            onLongpressStart = value;
        }
        return kpi;
    };
    kpi.onLongpressDragged = function (value) {
        if (!arguments.length) { return onLongpressDragged; }
        if(typeof value === "function"){
            onLongpressDragged = value;
        }
        return kpi;
    };
    kpi.onLongpressEnd = function (value) {
        if (!arguments.length) { return onLongpressEnd; }
        if(typeof value === "function"){
            onLongpressEnd = value;
        }
        return kpi;
    };
    kpi.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return kpi;
    };
    kpi.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return kpi;
    };
    kpi.onDelete = function (value) {
        if (!arguments.length) { return onDelete; }
        if(typeof value === "function"){
            onDelete = value;
        }
        return kpi;
    };
    return kpi;
}
