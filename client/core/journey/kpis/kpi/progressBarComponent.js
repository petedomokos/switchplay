import * as d3 from 'd3';
import { DIMNS, grey10 } from "../../constants";
import dragEnhancements from '../../enhancedDragHandler';
import barComponent from './barComponent';
import numbersComponent from './numbersComponent';
import tooltipsComponent from '../../tooltipsComponent';
import ctrlsComponent from '../../ctrlsComponent';
import container from './container';
import background from './background';
import { getTransformationFromTrans } from '../../helpers';
import { round, isNumber } from "../../../../data/dataHelpers";

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

    //per datum
    function updateDimns(kpisData){
        dimns = [];

        return kpisData.forEach((kpiD,i) => {
            //console.log("kpiD", kpiD)
            //each d is a milestone
            const tooltipsData = kpiD.tooltipsData.filter(d => d.shouldDisplay(status, editing, displayFormat));
            //we dont want editing toggling to affect positions, so we fix editing to be false here,
            //even though the numbersData in the render function removes the number
            const numbersData = kpiD.numbersData.filter(d => d.shouldDisplay(status, false, displayFormat));

            const barData = { 
                ...kpiD.barData, 
                sectionsData:kpiD.barData.sectionsData.filter(d => d.shouldDisplay(status, editing, displayFormat))
            };

            const width = _width(kpiD,i)
            const height = _height(kpiD,i);
            const margin = _margin(kpiD,i);
            const contentsWidth = width - margin.left - margin.right;
            const contentsHeight = height - margin.top - margin.bottom;

            const MAX_BAR_HEIGHT = 25;
            const vertSpaceForTooltips = contentsHeight - MAX_BAR_HEIGHT;
            const expectedTooltipOpenHeight = vertSpaceForTooltips * 0.55;
            const targetTooltipOpenHeight = vertSpaceForTooltips * 0.45;

            const expectedTooltipAspectRatio = 1; //this is approx, as the shiny one is not exactly 1
            const targetTooltipAspectRatio = 42/56;

            const expectedTooltipOpenWidth = expectedTooltipOpenHeight / expectedTooltipAspectRatio;
            const targetTooltipOpenWidth = targetTooltipOpenHeight / targetTooltipAspectRatio;

            const endTooltipsHeight = status === "closed" ? contentsHeight : 0;
            const endToolTipsMarginLeft = status === "closed"? 10 : 0;
            
            //we want expecetd icon to be a bit bigger due to its circular shape
            const expectedMultiplier = 1.3;
            const boundsMultiplier = 0.6;
            const boundsFontMultiplier = 1;
            //end tooltips
            const nrEndTooltips = tooltipsData.filter(t => t.tooltipType === "comparison").length;
            const endExpectedTooltipWidth = (endTooltipsHeight) / expectedTooltipAspectRatio;
            const endTargetTooltipWidth = endTooltipsHeight / targetTooltipAspectRatio;
            const endTooltipsWidth = nrEndTooltips === 0 ? 0 : endExpectedTooltipWidth + endTargetTooltipWidth + endToolTipsMarginLeft;

            //BAR COMPONENT (BAR AND NUMBERS)
            //const barHeight = contentsHeight - expectedTooltipOpenHeight - bottomTooltipsHeight;
            const barHeight = contentsHeight - expectedTooltipOpenHeight - targetTooltipOpenHeight;
            //numbers 
            //group numbers into 1, 2 or 3 cols
            const nrNumbers = numbersData.length
            let nrNumberCols = nrNumbers;
            if(nrNumbers > 3){
                nrNumberCols = nrNumberCols % 3 === 0 ? 3 :(nrNumbers % 2 === 0 ? 2 : 1)
            }
            // width is built bottom up, whereas height is top down
            const numbersHeight = status === "closed" ?  contentsHeight : barHeight;// d3.min([35, contentsHeight]);
            const maxNumbersContentsHeight = 40;
            const numbersMarginVert = d3.max([0, (numbersHeight - maxNumbersContentsHeight)/2]);
            const numberWidth = status === "closed" ? contentsWidth * 0.2 : contentsWidth * 0.1;
            const numbersContentsWidth = nrNumberCols * numberWidth;
            const numbersMargin = { 
                left: numbersContentsWidth * 0.1, 
                right:0, 
                top:numbersMarginVert, 
                bottom:numbersMarginVert, 
            };
            const numbersWidth = numbersData.length === 0 ? 0 : numbersContentsWidth + numbersMargin.left + numbersMargin.right;
            //@todo - numberheight mx should be in sync with barheight max
           
            const numbers = {
                width:numbersWidth,
                height:numbersHeight,
                margin:numbersMargin,
            }

            //bar
            //const horizMarginToSeeDynamicTooltips = d3.max([topExpectedTooltipWidth, bottomTargetTooltipWidth]) / 2;
            const horizMarginToSeeDynamicTooltips = d3.max([expectedTooltipOpenWidth, targetTooltipOpenWidth]) / 2;
            const extraMarginRight = d3.max([0, horizMarginToSeeDynamicTooltips - numbersWidth]); 
            const barWidth = contentsWidth - endTooltipsWidth - numbersWidth;
            const barMarginLeft = status === "closed" ? 0 : horizMarginToSeeDynamicTooltips;
            const barMarginRight = status === "closed" ? 0 : extraMarginRight;
            //need this for scale here
            const barContentsWidth = barWidth - barMarginLeft - barMarginRight;
            const bar = {
                width:barWidth,
                height:barHeight,
                margin:{ 
                    left: barMarginLeft,
                    right: barMarginRight,
                    top:barHeight * 0.15,
                    bottom:barHeight * 0.15
                }
            }

            //define fontsize here so it is not increased by the expectedMultiplier
            const fontSize = status === "closed" ? endTooltipsHeight * 0.45 : targetTooltipOpenHeight * 0.3;
            const boundsFontsize = fontSize * boundsFontMultiplier
            const tooltips = {
                open:{
                    start: {
                        width: targetTooltipOpenWidth * boundsMultiplier,
                        height:targetTooltipOpenHeight * boundsMultiplier,
                        margin: { 
                            left:0,
                            right:0,
                            top:0,
                            bottom:0
                        },
                        fontSize:boundsFontsize
                    },
                    currentValue: {
                        width: targetTooltipOpenWidth * boundsMultiplier,
                        height:targetTooltipOpenHeight * boundsMultiplier,
                        margin: { 
                            left:0,
                            right:0,
                            top:0,
                            bottom:0
                        },
                        fontSize:boundsFontsize
                    },
                    end: {
                        width:targetTooltipOpenWidth * boundsMultiplier,
                        height:targetTooltipOpenHeight * boundsMultiplier,
                        margin: { 
                            left:0,
                            right:0,
                            top:0,
                            bottom:0
                        },
                        fontSize:boundsFontsize
                    },
                    expected: {
                        width:expectedTooltipOpenWidth,
                        height:expectedTooltipOpenWidth,
                        margin: { 
                            left:0,
                            right:0,
                            top:3,//expectedTooltipOpenHeight * 0.15,
                            bottom:3//expectedTooltipOpenHeight * 0.15
                        },
                        fontSize
                    },
                    expectedSteps: {
                        width:expectedTooltipOpenWidth,
                        height:expectedTooltipOpenWidth,
                        margin: { 
                            left:0,
                            right:0,
                            top:3,//expectedTooltipOpenHeight * 0.15,
                            bottom:3//expectedTooltipOpenHeight * 0.15
                        },
                        fontSize
                    },
                    target: {
                        width:targetTooltipOpenWidth,
                        height:targetTooltipOpenHeight,
                        margin: { 
                            left:0,//bottomTargetTooltipWidth * 0.15,
                            right:0,//bottomTargetTooltipWidth * 0.15,
                            top:3,//bottomTooltipsHeight * 0.15,
                            bottom:3,//bottomTooltipsHeight * 0.15
                        },
                        fontSize
            
                    },
                    current: {
                        width:10,
                        height:barHeight,
                        margin: { 
                            left:0,
                            right:0,
                            top:0,
                            bottom:0
                        },
                        fontSize
            
                    }
                },
                closed:{
                    expected:{
                        width:endExpectedTooltipWidth * expectedMultiplier,
                        height:endTooltipsHeight * expectedMultiplier,
                        margin: { 
                            left:endExpectedTooltipWidth * 0.15,
                            right:endExpectedTooltipWidth * 0.15,
                            top:0,//endTooltipsHeight * 0.15,
                            bottom:0//endTooltipsHeight * 0.15
                        },
                        fontSize
                    },
                    target:{
                        width:endTargetTooltipWidth,
                        height:endTooltipsHeight,
                        margin: { 
                            left:endTargetTooltipWidth * 0.15,
                            right:endTargetTooltipWidth * 0.15,
                            top:0,//endTooltipsHeight * 0.15,
                            bottom:0//endTooltipsHeight * 0.15
                        },
                        fontSize
                    }
                }
            }

            dimns.push({
                width, height, margin, contentsWidth, contentsHeight,
                bar, numbers, tooltips, expectedTooltipOpenHeight, endToolTipsMarginLeft
            })
            //SCALES
            //xScale (ie bar scale) set here as it is used by tooltips too
            //init
            if(!xScales[kpiD.key]){ xScales[kpiD.key] = d3.scaleLinear(); }
            //update
            const extent = editing?.desc === "target" ? [barData.dataStart, barData.dataEnd] : [barData.start, barData.end]
            xScales[kpiD.key]
                .domain(extent)
                .range([0, barContentsWidth])

            //yScale
        })
    }

    const defaultStyles = {
        bg:{},
        barSections:{},
        name:{}
    };
    let _styles = () => defaultStyles;
    let _transform = () => null;
    let transitionUpdate = false;

    let fixedDomain = [0,100]
    let _domain;

    let status = "closed";
    let kpiFormat = "actual";
    let displayFormat = "both";
    let editable = false;
    let editing = null;

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
    let onSaveValue = function(){};
    let onSetEditing = function(){};

    const enhancedDrag = dragEnhancements();
    const tooltips = tooltipsComponent();
    const bar = barComponent();
    const numbers = numbersComponent();
    const ctrls = ctrlsComponent();

    function progressBar(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log} = options;
        updateDimns(selection.data());
        //console.log("progbar data", selection.data())

        selection
            .call(background()
                .width((d,i) => dimns[i].width)
                .height((d,i) => dimns[i].height)
                .styles((d, i) => ({
                    stroke:"none",
                    fill:_styles(d).bg?.fill || "transparent"
                }))
            )
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
                }))
            )
            .call(container("bar")
                .transform((d,i) => `translate(0,${dimns[i].expectedTooltipOpenHeight})`)
            )
            .call(container("numbers")
            //needs to also be shifted down by half the extra vert gap when numberheight is at its max
               .transform((d,i) => `translate(${dimns[i].bar.width},${dimns[i].expectedTooltipOpenHeight})`)
            )
            .call(container("tooltips")
                .transform((d,i) => `translate(${dimns[i].bar.margin.left},0)`))
        
        const editingTarget = editing?.desc === "target";
        const dataWithEnrichedBarData = selection.data()
            .map(d => ({ 
                ...d,
                barData:{
                    ...d.barData,
                    sectionsData:d.barData.sectionsData.filter(d => d.shouldDisplay(status, editing, displayFormat))
                }
            }))
            //console.log("sel data", selection.data())
            //console.log("enriched", dataWithEnrichedBarData)

        selection.select("g.bar")
            .data(dataWithEnrichedBarData)
            .call(bar
                .width((d,i) => dimns[i].bar.width)
                .height((d,i) => dimns[i].bar.height)
                .margin((d,i) => dimns[i].bar.margin)
                .scale((d,i) => xScales[d.key])
                .editable(editable)
                .displayFormat(displayFormat)
            , { transitionEnter, transitionUpdate} )

        const enrichedNumbersData = selection.data()
            .map(d => d.numbersData
                .filter(numberD => numberD.shouldDisplay(status, editing, displayFormat)))
                
        selection.select("g.numbers")
            .data(enrichedNumbersData)
            .call(numbers
                .width((d,i) => dimns[i].numbers.width)
                .height((d,i) => dimns[i].numbers.height)
                .margin((d,i) => dimns[i].numbers.margin));

        //helper to get value
        const getTooltipScaleValue = d => editingTarget && typeof d.fullScaleValue === "number" ? d.fullScaleValue : d.value;
        const getTooltipValue = d => {
            if(d.tooltipType === "scale"){ return getTooltipScaleValue(d) }
            return typeof d.unsavedValue === "number" ? d.unsavedValue : d.value;
        }
        const enrichedTooltipsData = selection.data()
            .map(d => d.tooltipsData
                .map(t => ({ ...t, progBarKey: d.key }))
                .filter(d => d.shouldDisplay(status, editing, displayFormat)))

        //issue - the i in getX below is teh tooltip i, eg target, expected, rther than the kpi i,
        //which is what dimnns needs
        selection.select("g.tooltips")
            .data(enrichedTooltipsData)
            .call(tooltips
                .width((d,i) => dimns[i].contentsWidth)
                .height((d,i) => dimns[i].contentsHeight)
                //bug when open, tooltipdimns dont increase
                .tooltipDimns((d,i) => dimns[i].tooltips[status])
                .styles((d,i) => ({
                    bg:{ fill: _styles(d).bg.fill },
                    hitbox:{
                        fill:d.key === "current" ? grey10(3) : "transparent",
                        stroke:d.key === "current" ? grey10(10) : "none",
                        strokeOpacity:1,
                        opacity:0.3,
                        strokeWidth:0.2
                    },
                    text:{
                        stroke:d.milestoneId !== "current" && d.key === "end" && !d.isTarget ? "red" : 
                            (d.key === "expected" || d.key === "target" ? grey10(6) : grey10(4))
                    },
                    subtext:{
                        stroke: editing || !d.isTarget ? "red" : grey10(4)
                    }
                }))
                .getSubtext((d,i) => {
                    if(d.key !== "end" || (d.milestoneId === "current" && !editing)){ return ""; }
                    return editing?.desc === "target" ? "End Edit" : (d.isTarget ? "Edit" : "Set")
                })
                .getValue(getTooltipValue)
                .getX((d,i,j) =>{
                    if(d.key === "expectedSteps"){
                        const { width, margin } = dimns[i].bar;
                        const barContentsWidth = width - margin.left - margin.right
                        return barContentsWidth * (d.value/100);
                    }
                    //i is kpi index, j is tooltip datum index
                    if(status === "open"){
                        //in open format, all tooptips are positioned according to the x scale
                        const value = getTooltipValue(d);
                        const scale = xScales[d.progBarKey];
                        //if(d.milestoneId === "current" && d.key === "target" && d.progBarKey === "longJump-distance-left"){ }
                        return isNumber(value) ? scale(value) : scale.range()[0];
                    }
                    const extraHorizGap = 0;// 20;
                    if(d.key === "expected"){
                        return dimns[i].bar.width + dimns[i].numbers.width + dimns[i].endToolTipsMarginLeft + dimns[i].tooltips.closed.expected.width/2;
                    }
                    return dimns[i].bar.width + dimns[i].numbers.width + dimns[i].endToolTipsMarginLeft + dimns[i].tooltips.closed.expected.width + dimns[i].tooltips.closed.target.width/2;
                })
                //y is 1 or -1
                .getY((d,i) => {
                    const { contentsHeight, expectedTooltipOpenHeight, tooltips, bar,  } = dimns[i];
                    if(status === "open"){
                        if(d.key === "current"){
                            return expectedTooltipOpenHeight + bar.height/2;
                        }
                        if(d.tooltipType === "scale"){
                            return expectedTooltipOpenHeight + bar.height - bar.margin.bottom + tooltips.open.start.height/2;
                        }
                        if(d.key === "expected"){
                            return tooltips.open.expected.height * 0.5;
                        }
                        if(d.key === "target"){
                            return contentsHeight - 0.5 * tooltips.open.target.height;
                        }
                        if(d.key === "expectedSteps"){
                            return tooltips.open.expectedSteps.height * 0.5;
                        }
                        return 0;
                    }
                    //closed
                    if(d.key === "expected" || d.key === "target"){
                        return tooltips.open.expected.height + bar.height/2;
                    }
                    return 0;
                })
                .draggable(editable)
                .onClick(function(e,d){
                    if(d.key !== "end") { return; }
                    //start editing
                    if(!editing && d.milestoneId !== "current"){
                        editing = { milestoneId:d.milestoneId, desc:"target" }
                        selection.call(progressBar)
                        //tell react so overlay can be applied
                        onSetEditing(editing);
                        return;
                    }
                    //cancel if editing
                    if(editing){
                        editing = null
                        selection.call(progressBar)
                        //tell react so overlay can be removed
                        onSetEditing(null)
                    }
                })
                .onDrag(function(e,d, tooltipDimns){
                    //i think the bar is wrong coz getEndValue and getValue etc funcs are not updating??
                    //also what happend if w drag the currnt valeu out of range of the 
                    //normal start to target range -> then need to redo the boundedValue....
                    //so need to rethink where boundedvalue is calculated -maybe just do it in barComponent
                    //using the domain() to display it correct
                    //update tooltip position
                    const { translateX, translateY } = getTransformationFromTrans(d3.select(this).attr("transform"));
                    const newX = translateX + e.dx;
                    d3.select(this).attr("transform", `translate(${newX},${translateY})`)

                    //update tooltip value
                    const scale = xScales[d.progBarKey];
                    const newValue = round(Number(scale.invert(newX)), d.accuracy);
                    d.unsavedValue = newValue;
                    //we need to update alltooltips so index for dimns is maintained
                    //@todo - go back to using a key instead of array for dimns?
                    const tooltipsG = d3.select(this.parentNode);
                    tooltipsG.selectAll("g.tooltip").call(tooltips.updateTooltip, tooltipDimns)

                    //update corresponding bar section
                    const barG = d3.select(this.parentNode.parentNode).select("g.bar")
                    //@todo - for now, we assume only 1 kpi datum here, but cant always do this for a reusabel component
                    const kpiDatum = dataWithEnrichedBarData[0];
                    const newKpiDatum = {
                        ...kpiDatum,
                        barData:{
                            ...kpiDatum.barData,
                            sectionsData:kpiDatum.barData.sectionsData.map(sectionD => {
                                if(sectionD.key !== d.key) { return sectionD; }
                                return {
                                    ...sectionD,
                                    endValue:newValue
                                }
                            })
                        }
                    }
                    barG.datum(newKpiDatum).call(bar)

                    //numbers
                    //WARNING: when we grab the numbersG from selection.select("g.numbers"), it doesnt have the numbersData it has the kpi data
                    //but when we get it from selection.selectAll("g.numbers")
                    //lesson -> whenever using .data() to bind subdata, when need to use selectAll to get it
                    const numbersData = selection.selectAll("g.numbers").data();
                    //todo - need to generalise the top level array too - how to do this?
                    const newNumbersData = numbersData.map(data => (data.map(n => n.key === d.key ? ({ ...n, value:newValue }) : n)))
                    selection.select("g.numbers")
                        .data(newNumbersData)
                        .call(numbers)

                })
                .onSaveValue(onSaveValue)
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
    progressBar.status = function (value) {
        if (!arguments.length) { return status; }
        status = value;
        return progressBar;
    };
    progressBar.kpiFormat = function (value) {
        if (!arguments.length) { return kpiFormat; }
        kpiFormat = value;
        return progressBar;
    };
    progressBar.displayFormat = function (value) {
        if (!arguments.length) { return displayFormat; }
        displayFormat = value;
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
                bg:{ ...defaultStyles.bg, ...requiredStyles.bg },
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
            onBarLongpressEnd = value
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
    progressBar.onSaveValue = function (value) {
        if (!arguments.length) { return onSaveValue; }
        if(typeof value === "function"){
            onSaveValue = value;
        }
        return progressBar;
    };
    progressBar.onSetEditing = function (value) {
        if (!arguments.length) { return onSetEditing; }
        if(typeof value === "function"){
            onSetEditing = value;
        }
        return progressBar;
    };
    return progressBar;
}
