import * as d3 from 'd3';
import { DIMNS, grey10 } from "../../constants";
import dragEnhancements from '../../enhancedDragHandler';
import barComponent from './barComponent';
import numbersComponent from './numbersComponent';
import tooltipsComponent from '../../tooltipsComponent';
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
    //state
    let tooltipsLocation = "end";
    //let tooltipsLocation = "dynamic"

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

            const MAX_BAR_HEIGHT = 25;
            const vertSpaceForTooltips = contentsHeight - MAX_BAR_HEIGHT;
            //@todo - can expand to have two top tooltips eg when we want current value to be editable
            //and can expand end to include more than 2
            //Note: we need height of dynamic tooltips, and width of endTooltips, for other calculations
            //note - we make dynamicTooltipHeight 0 too, so it doesnt incorrectly affect calculations lower down
            const nrTopTooltips = tooltipsLocation === "end" ? 0 : 1;
            const nrBottomTooltips = tooltipsLocation === "end" ? 0 : 1;
            let dynamicTooltipHeight = 0;
            if(tooltipsLocation === "dynamic"){
                const tooltipHeightMultiplier = nrTooltips <= 2 ? 0.33 : 0.25;
                const standardTooltipHeight = contentsHeight * tooltipHeightMultiplier;
                const minTooltipHeight = vertSpaceForTooltips / nrTooltips;
                dynamicTooltipHeight = d3.max([standardTooltipHeight, minTooltipHeight])
            } 
            const endTooltipsHeight = tooltipsLocation === "end" ? contentsHeight : 0;
            const endToolTipsMarginLeft = tooltipsLocation === "end" ? 10 : 0;

            const topTooltipsHeight = dynamicTooltipHeight * nrTopTooltips;
            const bottomTooltipsHeight = dynamicTooltipHeight * nrBottomTooltips;
            
            //for now, hardcode aspect ratios as we know there are two tooltips
            const expectedTooltipAspectRatio = 1; //this is approx, as the shiny one is not exactly 1
            const targetTooltipAspectRatio = 42/56;
            //end tooltips
            //@todo next
            //tooltip and numbers heights can go all the way to the top ad bottom of progBar
            const endExpectedTooltipWidth = endTooltipsHeight / expectedTooltipAspectRatio;
            const endTargetTooltipWidth = endTooltipsHeight / targetTooltipAspectRatio;
            //dynamic tooltips (top and bottom)
            const topExpectedTooltipWidth = dynamicTooltipHeight / expectedTooltipAspectRatio;
            const bottomTargetTooltipWidth = dynamicTooltipHeight / targetTooltipAspectRatio;
            
            const endTooltipsWidth = endExpectedTooltipWidth + endTargetTooltipWidth + endToolTipsMarginLeft;

            //BAR COMPONENT (BAR AND NUMBERS)
            const barHeight = contentsHeight - topTooltipsHeight - bottomTooltipsHeight;
            //numbers 
            //group numbers into 1, 2 or 3 cols
            const nrNumbers = numbersData.length
            let nrNumberCols = nrNumbers;
            if(nrNumbers > 3){
                nrNumberCols = nrNumberCols % 3 === 0 ? 3 :(nrNumbers % 2 === 0 ? 2 : 1)
            }
            // width is built bottom up, whereas height is top down
            const numbersHeight = tooltipsLocation === "end" ?  contentsHeight : barHeight;// d3.min([35, contentsHeight]);
            const maxNumbersContentsHeight = 40;
            const numbersMarginVert = d3.max([0, (numbersHeight - maxNumbersContentsHeight)/2]);
            const numberWidth = tooltipsLocation === "end" ? contentsWidth * 0.2 : contentsWidth * 0.1;
            const numbersContentsWidth = nrNumberCols * numberWidth;
            const numbersMargin = { 
                left: numbersContentsWidth * 0.1, 
                right:0, 
                top:numbersMarginVert, 
                bottom:numbersMarginVert, 
            };
            const numbersWidth = numbersContentsWidth + numbersMargin.left + numbersMargin.right;
            //@todo - numberheight mx should be in sync with barheight max
           
            const numbers = {
                width:numbersWidth,
                height:numbersHeight,
                margin:numbersMargin,
            }

            //bar
            const horizMarginToSeeDynamicTooltips = d3.max([topExpectedTooltipWidth, bottomTargetTooltipWidth]) / 2;
            const extraMarginRight = d3.max([0, horizMarginToSeeDynamicTooltips - numbersWidth]); 
            const barWidth = contentsWidth - endTooltipsWidth - numbersWidth;
            const barMarginLeft = tooltipsLocation === "end" ? 0 : horizMarginToSeeDynamicTooltips;
            const barMarginRight = tooltipsLocation === "end" ? 0 : extraMarginRight;
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

            const tooltips = {
                dynamic:[
                    {
                        width:topExpectedTooltipWidth,
                        height:topTooltipsHeight,
                        margin: { 
                            left:0,
                            right:0,
                            top:topTooltipsHeight * 0.15,
                            bottom:topTooltipsHeight * 0.15
                        }
                    },
                    //target
                    {
                        width:bottomTargetTooltipWidth, //target is wider
                        height:bottomTooltipsHeight,
                        margin: { 
                            left:bottomTargetTooltipWidth * 0.15,
                            right:bottomTargetTooltipWidth * 0.15,
                            top:bottomTooltipsHeight * 0.15,
                            bottom:bottomTooltipsHeight * 0.15
                        }
            
                    },
                ],
                //both
                end:[
                    //expected
                    {
                        width:endExpectedTooltipWidth,
                        height:endTooltipsHeight,
                        margin: { 
                            left:endExpectedTooltipWidth * 0.15,
                            right:endExpectedTooltipWidth * 0.15,
                            top:0,//endTooltipsHeight * 0.15,
                            bottom:0//endTooltipsHeight * 0.15
                        }
                    },
                    //target
                    {
                        width:endTargetTooltipWidth,
                        height:endTooltipsHeight,
                        margin: { 
                            left:endTargetTooltipWidth * 0.15,
                            right:endTargetTooltipWidth * 0.15,
                            top:0,//endTooltipsHeight * 0.15,
                            bottom:0//endTooltipsHeight * 0.15
                        }
                    }
                ] 
            }

            //if(d.isCurrent && d.key === "pressUps-reps"){
            if(d.isCurrent && d.key === "longJump-distance-left"){
                //console.log("d", d)
                //console.log("numbersH maxCH vertmarg", numbersHeight, maxNumbersContentsHeight, numbersMarginVert)
                //console.log("h ch", height, contentsHeight)
                //console.log("numbersH", numbersHeight)
                //console.log("BARHEIGHT", barHeight)
            }

            dimns.push({
                width, height, margin, contentsWidth, contentsHeight,
                bar, numbers, tooltips, topTooltipsHeight, endToolTipsMarginLeft
            })
            //SCALES
            //xScale (ie bar scale) set here as it is used by tooltips too
            //init
            if(!xScales[d.key]){ xScales[d.key] = d3.scaleLinear(); }
            //update
            //console.log("barwidth", barWidth)
            //console.log("start end", barData.start, barData.end)
            const extent = [barData.start, barData.end]
            xScales[d.key]
                .domain(extent)
                .range([0, barContentsWidth])

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

    let editable = false;

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

    const enhancedDrag = dragEnhancements();
    const tooltips = tooltipsComponent();
    const bar = barComponent();
    const numbers = numbersComponent();

    function progressBar(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log} = options;
        updateDimns(selection.data());

        selection
            .call(background()
                .width((d,i) => dimns[i].width)
                .height((d,i) => dimns[i].height)
                .styles((d, i) => ({
                    stroke:"none",
                    fill:"blue"//_styles(d).bg?.fill || "transparent"
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
                .transform((d,i) => `translate(0,${dimns[i].topTooltipsHeight})`)
            )
            .call(container("numbers")
            //needs to also be shifted down by half the extra vert gap when numberheight is at its max
               .transform((d,i) => `translate(${dimns[i].bar.width},${dimns[i].topTooltipsHeight})`)
            )
            .call(container("tooltips")
                .transform((d,i) => `translate(${dimns[i].bar.margin.left},0)`))
        
        selection.select("g.bar")
            //.data(selection.data().map(d => d.barData))
            .call(bar
                .width((d,i) => dimns[i].bar.width)
                .height((d,i) => dimns[i].bar.height)
                .margin((d,i) => dimns[i].bar.margin)
                .scale((d,i) => xScales[d.key])
                .editable(editable)
            , { transitionEnter, transitionUpdate} )

        selection.select("g.numbers")
            .data(selection.data().map(d => d.numbersData))
            .call(numbers
                .width((d,i) => dimns[i].numbers.width)
                .height((d,i) => dimns[i].numbers.height)
                .margin((d,i) => dimns[i].numbers.margin));


        //helper to get value
        const getValue = d => typeof d.unsavedValue === "number" ? d.unsavedValue : d.value;
        
        const enrichedTooltipsData = selection.data().map(d => d.tooltipsData.map(t => ({ ...t, progBarKey: d.key })));
        //issue - the i in getX below is teh tooltip i, eg target, expected, rther than the kpi i,
        //which is what dimnns needs
        selection.select("g.tooltips")
            .data(enrichedTooltipsData)
            .call(tooltips
                .width((d,i) => dimns[i].contentsWidth)
                .height((d,i) => dimns[i].contentsHeight)
                //bug when open, tooltipdimns dont increase
                .tooltipDimns((d,i) => dimns[i].tooltips[tooltipsLocation])
                //this is when open
                .getValue(getValue)
                .getX((d,i,j) =>{
                    //i is kpi index, j is tooltip datum index
                    if(tooltipsLocation === "dynamic"){
                        const value = getValue(d);
                        const scale = xScales[d.progBarKey];
                        if(d.milestoneId === "current" && d.key === "target" && d.progBarKey === "longJump-distance-left"){
                        }
                        return value ? scale(value) : scale.range()[0];
                    }
                    const extraHorizGap = 0;// 20;
                    if(d.key === "expected"){
                        return dimns[i].bar.width + dimns[i].numbers.width + dimns[i].endToolTipsMarginLeft + dimns[i].tooltips.end[0].width/2;
                    }
                    return dimns[i].bar.width + dimns[i].numbers.width + dimns[i].endToolTipsMarginLeft + dimns[i].tooltips.end[0].width + dimns[i].tooltips.end[1].width/2;
                })
                //y is 1 or -1
                .getY((d,i) => {
                    if(tooltipsLocation === "dynamic"){
                        if(d.key === "expected"){
                            return 0.5 * dimns[i].tooltips.dynamic[0].height;
                        }
                        return dimns[i].contentsHeight - 0.5 * dimns[i].tooltips.dynamic[1].height;
                    }
                    return dimns[i].tooltips.dynamic[0].height + dimns[i].bar.height/2;
                })
                .draggable(editable)
                .onClick(function(e,d){
                    //console.log("clicked", this, e, d)
                })
                .onDrag(function(e,d, newValue){
                    const barAreaG = d3.select(this.parentNode.parentNode).select("g.bar-area")
                    //@todo - can assume only 1 datum here, but cant always do this for a reusabel component
                    const _d = barAreaG.data()[0]
                    const newBarData = _d.barData.map(barD => {
                        if(barD.key !== d.key) { return barD; }
                        return {
                            ...barD,
                            value:newValue
                        }
                    });
                    newBarData.start = _d.barData.start;
                    newBarData.end = _d.barData.end;
                    const newD = {
                        ..._d,
                        barData:newBarData
                    }
                    barAreaG.datum(newD).call(bar)
                })
                .onDragEnd(function(e, d){
                    console.log("dragEnd d", d)
                    //store the new value
                    //need each tooltip to have profilekey, kpikey and ley,
                    //and get rid of progBarKey
                    //assume format is actual for now
                    if(typeof d.unsavedValue !== "number" || Number.isNaN(d.unsavedValue)){
                        console.log("ERROR: NOT A NUMBER");
                        return;
                    }
                    const valueObj = { actual: `${d.unsavedValue}`, completion:"" };
                    onSaveValue(valueObj, d.milestoneId, d.datasetKey, d.statKey, d.key)
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
    progressBar.tooltipsLocation = function (value) {
        if (!arguments.length) { return tooltipsLocation; }
        tooltipsLocation = value;
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
        if(typeof value === "function"){
            onSaveValue = value;
        }
        return progressBar;
    };
    return progressBar;
}
