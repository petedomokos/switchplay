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
            const vertSpaceForTooltips = d3.max([0,contentsHeight - MAX_BAR_HEIGHT]);
            const expectedTooltipOpenHeight = vertSpaceForTooltips * 0.55;
            const targetTooltipOpenHeight = vertSpaceForTooltips * 0.45;

            const expectedTooltipAspectRatio = 1; //this is approx, as the shiny one is not exactly 1
            const targetTooltipAspectRatio = 42/56;

            const expectedTooltipOpenWidth = expectedTooltipOpenHeight / expectedTooltipAspectRatio;
            const targetTooltipOpenWidth = targetTooltipOpenHeight / targetTooltipAspectRatio;
            
            //we want expecetd icon to be a bit bigger due to its circular shape
            const expectedMultiplier = 1.3;
            const boundsMultiplier = 0.6;
            const boundsFontMultiplier = 1;
            //end tooltips - these will all be the same
            const endTooltipAspectRatio = 1;
            const extraSpaceBeforeTooltips = status === "closed" && kpiD.milestoneId !== "current" ? 10 : 0;
            //width is based on height, because height must be same as contentsHeight
            const endTooltipsHeight = status === "closed" ? contentsHeight : 0;

            const endTooltipHeight = endTooltipsHeight;
            const endTooltipMarginTop = 0;
            const endTooltipMarginBottom = 0;
            const endTooltipContentsHeight = endTooltipHeight - endTooltipMarginTop - endTooltipMarginBottom;
            const endTooltipContentsWidth = endTooltipContentsHeight / endTooltipAspectRatio;
            const endTooltipHorizMargin = endTooltipContentsWidth * 0.15;
            const endTooltipWidth = endTooltipContentsWidth + 2 * endTooltipHorizMargin;
            //total all tooltips
            //console.log("nrEndTs", nrEndTooltips)
            const endTooltipsWidth = nrEndTooltips  * endTooltipWidth;

            //BAR COMPONENT (BAR AND NUMBERS)
            //const barHeight = contentsHeight - expectedTooltipOpenHeight - bottomTooltipsHeight;
            const barHeight = contentsHeight - expectedTooltipOpenHeight - targetTooltipOpenHeight;
            //numbers 
            //group numbers into 1, 2 or 3 cols
            //const nrNumbers = numbersData.length
            let nrNumberCols = nrNumbers;
            if(nrNumbers > 3){
                nrNumberCols = nrNumberCols % 3 === 0 ? 3 :(nrNumbers % 2 === 0 ? 2 : 1)
            }
            // width is built bottom up, whereas height is top down
            const numbersHeight = status === "closed" ?  contentsHeight : barHeight;// d3.min([35, contentsHeight]);
            const maxNumbersContentsHeight = 40;
            const numbersMarginVert = d3.max([0, (numbersHeight - maxNumbersContentsHeight)/2]);
            const numberWidth = contentsWidth * 0.2;
            const numbersContentsWidth = nrNumberCols * numberWidth;
            const numbersMargin = { 
                left: numbersContentsWidth * 0.1, 
                right:0, 
                top:numbersMarginVert, 
                bottom:numbersMarginVert, 
            };
            const numbersWidth = nrNumbers === 0 ? 0 : numbersContentsWidth + numbersMargin.left + numbersMargin.right;
            //@todo - numberheight mx should be in sync with barheight max
           
            const numbers = {
                width:numbersWidth,
                height:numbersHeight,
                margin:numbersMargin,
            }

            //bar
            //current card bars dont show steps as there will be too many and doesnt make sense. The steps list is still shown.
            const shouldDisplaySteps = kpiD.milestoneId !== "current" && displayFormat !== "stats";
            //need an extra space in case user slides tooltip right to teh end so it is still seen
            const horizMarginToSeeDynamicTooltips = d3.max([expectedTooltipOpenWidth, targetTooltipOpenWidth]) / 2;
            const extraMarginRight = d3.max([0, horizMarginToSeeDynamicTooltips - numbersWidth]); 
            const barWidth = contentsWidth - endTooltipsWidth - numbersWidth - extraSpaceBeforeTooltips;
            const barMarginLeft = status === "closed" ? 0 : horizMarginToSeeDynamicTooltips;
            const barMarginRight = status === "closed" ? 0 : extraMarginRight;
            const barMarginTop = barHeight * 0.15;
            const barMarginBottom  = barHeight * 0.15;
            //need this for scale here
            const barContentsWidth = barWidth - barMarginLeft - barMarginRight;
            const barContentsHeight = barHeight - barMarginTop - barMarginBottom;
            const bar = {
                width:barWidth,
                height:barHeight,
                margin:{ 
                    left: barMarginLeft,
                    right: barMarginRight,
                    top:barMarginTop,
                    bottom:barMarginBottom
                },
                statBarHeight:shouldDisplaySteps ? 0.4 * barContentsHeight  : barContentsHeight
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
                    minStandard: {
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
                    minStandardEdit: {
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
                    profileStart: {
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
                        //height:d3.max([20, bar.statBarHeight * 1.25]),
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
                    current: {
                        width:10,
                        //height:d3.max([20, bar.statBarHeight * 1.25]),
                        height:barHeight,
                        margin: { 
                            left:0,
                            right:0,
                            top:0,
                            bottom:0
                        },
                        fontSize
            
                    },
                    statProgress:{
                        width:endTooltipWidth,
                        height:endTooltipHeight,
                        margin: { 
                            left:endTooltipHorizMargin,
                            right:endTooltipHorizMargin,
                            top:endTooltipMarginTop,
                            bottom:endTooltipMarginBottom
                        },
                        fontSize
                    },
                    stepsProgress:{
                        width:endTooltipWidth,
                        height:endTooltipHeight,
                        margin: { 
                            left:endTooltipHorizMargin,
                            right:endTooltipHorizMargin,
                            top:endTooltipMarginTop,
                            bottom:endTooltipMarginBottom
                        },
                        fontSize
                    }
                }
            }

            dimns.push({
                width, height, margin, contentsWidth, contentsHeight,
                bar, numbers, tooltips, expectedTooltipOpenHeight, extraSpaceBeforeTooltips
            })
            //SCALES
            //xScale (ie bar scale) set here as it is used by tooltips too
            //init
            if(!xScales[kpiD.key]){ xScales[kpiD.key] = d3.scaleLinear(); }
            //update
            const extent = editing ? [barData.dataStart, barData.dataEnd] : [barData.start, barData.end]
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
    let nrEndTooltips = 0;
    let nrNumbers = 0;

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
                .statBarHeight((d,i) => dimns[i].bar.statBarHeight)
                .scale((d,i) => xScales[d.key])
                .editable(editable)
                .withStandards(d => d.orientationFocus === "attack" || displayFormat === "steps" ? false : true)
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
        const getTooltipScaleValue = d => editing && isNumber(d.fullScaleValue) ? d.fullScaleValue : d.value;
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

        let totalValueDelta = 0;
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
                        stroke:d.milestoneId !== "current" && d.isDefault ? "red" : 
                            (d.key === "expected" || d.key === "target" ? grey10(6) : grey10(6))
                    },
                    subtext:{
                        stroke: editing || d.isDefault? "red" : grey10(4)
                    }
                }))
                .getSubtext((d,i) => {
                    if(!d.clickableToEdit){ return ""; }
                    //@todo - refactor...temp - must handle target separately as it is piggy backing on the 'end' tooltip
                    if(d.key === "end"){
                        if(editing?.desc === "target"){ return "End Edit"; }
                        return d.isDefault ? "Set" : "Edit"
                    }
                    //other cases
                    if(editing?.desc === d.key){ return "End Edit"}
                    return d.isDefault ? "Set" : "Edit";
                })
                .getValue(getTooltipValue)
                .getX((d,i,j) =>{
                    const { bar, numbers, extraSpaceBeforeTooltips, tooltips } = dimns[0];
                    if(d.key === "expectedSteps"){
                        const { width, margin } = bar;
                        const barContentsWidth = width - margin.left - margin.right
                        return barContentsWidth * (d.x/100);
                    }
                    //i is kpi index, j is tooltip datum index
                    if(status === "open" || d.key === "current"){
                        //in open format, all tooptips are positioned according to the x scale
                        const value = getTooltipValue(d);
                        const scale = xScales[d.progBarKey];
                        return isNumber(value) ? scale(value) : scale.range()[0];
                    }
                    const extraHorizGap = 0;// 20;

                    //closed options - statProgress and stepsProgress
                    //note - barMarginleft is already applied to g.tooltips so that scale works for other tooltips
                    const restOfBar = bar.width - bar.margin.left;
                    const widthBeforeTooltips = restOfBar + numbers.width + extraSpaceBeforeTooltips;
                    if(d.key === "stepsProgress"){
                        return widthBeforeTooltips + tooltips.closed.stepsProgress.width/2;
                    }
                    if(d.key === "statProgress"){
                        if(displayFormat === "stats"){
                            //it will be the only tooltip
                            return widthBeforeTooltips + tooltips.closed.statProgress.width/2;
                        }
                        return widthBeforeTooltips + tooltips.closed.stepsProgress.width + tooltips.closed.statProgress.width/2;
                    }
                    return 0;
                })
                //y is 1 or -1
                .getY((d,i) => {
                    const { contentsHeight, expectedTooltipOpenHeight, tooltips, bar,  } = dimns[i];
                    if(status === "open"){
                        //current
                        if(d.key === "current"){
                            //we want it centred on teh statBar not the whole bar
                            //return expectedTooltipOpenHeight + bar.margin.top + bar.statBarHeight/2; //+ bar.height/2;
                            return expectedTooltipOpenHeight + bar.height/2;
                        }
                        const heightAboveBottomTooltips = expectedTooltipOpenHeight + bar.height - bar.margin.bottom;
                        if(d.tooltipType === "scale"){
                            return heightAboveBottomTooltips + tooltips.open.start.height/2;
                        }
                        //start (editing), target and expectedStats
                        if(d.rowNr === 1){
                            return tooltips.open.expected.height/2;
                        }
                        //expectedSteps
                        if(d.rowNr === -1){
                            return heightAboveBottomTooltips + tooltips.open.expectedSteps.height/2;
                        }
                        return 0;
                    }
                    //closed
                    return tooltips.open.expected.height + bar.height/2;
                })
                .draggable(editable)
                .onClick(function(e,d){
                    if(!d.clickableToEdit) { return; }
                    //@todo - impl the code below, by refactoring the way tooltips are keyed so teh key that you click 
                    //(eg end) is same as the key that gets set to editing (eg target)
                    //so should have same key name, but have another property to determine if its the editing version or the display version
                    /*
                    if(editing?.desc !== d.key){
                        editing = { milestoneId:d.milestoneId, desc:d.key }
                        console.log("set edit to ", editing)
                        selection.call(progressBar)
                        //tell react so overlay can be applied
                        onSetEditing(editing);
                        return;
                    } else{
                        //cancel editing
                        editing = null
                        selection.call(progressBar)
                        //tell react so overlay can be removed
                        onSetEditing(null)
                    }
                    */

                    //for now, handle each case separately
                    //CASE 1 - START
                    //start editing the "start" value
                    if(d.key === "start"){
                        //start editing the "start" value
                        if(editing?.desc !== "start"){
                            editing = { milestoneId:d.milestoneId, desc:"start" }
                            selection.call(progressBar)
                            //tell react so overlay can be applied
                            onSetEditing(editing);
                            return;
                        } else{
                            //cancel editing
                            editing = null
                            selection.call(progressBar)
                            //tell react so overlay can be removed
                            onSetEditing(null)
                        }
                        return;
                    }
                    //CASE 2 - END (FOR TARGET)
                    if(d.key === "end"){
                        //start editing the "end" value
                        if(editing?.desc !== "target"){
                            editing = { milestoneId:d.milestoneId, desc:"target" }
                            selection.call(progressBar)
                            //tell react so overlay can be applied
                            onSetEditing(editing);
                            return;
                        }else{
                            //cancel editing
                            editing = null
                            selection.call(progressBar)
                            //tell react so overlay can be removed
                            onSetEditing(null)
                        }

                    }
                    //CASE 3 - MINSTANDARD (FOR MINSTANDARDEDIT)
                    if(d.key === "minStandard"){
                        //start editing the "minStandard" value (ie display minStandardEdit tooltip)
                        if(editing?.desc !== "minStandard"){
                            editing = { milestoneId:d.milestoneId, desc:"minStandard" }
                            selection.call(progressBar)
                            //tell react so overlay can be applied
                            onSetEditing(editing);
                            return;
                        }else{
                            //cancel editing
                            editing = null
                            selection.call(progressBar)
                            //tell react so overlay can be removed
                            onSetEditing(null)
                        }

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
                    //update bar standardsLine position
                    /*
                    const progBarG = this.parentNode.parentNode;
                    d3.select(progBarG).select("g.standards").selectAll("g.standard").each(function(d,i){
                        const { translateX, translateY } = getTransformationFromTrans(d3.select(this).attr("transform"));
                        const newX = translateX + e.dx;
                        d3.select(this).attr("transform", `translate(${newX},${translateY})`)
                    })
                    */

                    //update tooltip value
                    const scale = xScales[d.progBarKey];
                    const newValue = round(Number(scale.invert(newX)), d.accuracy);
                    const valueDelta = scale.invert(e.dx);
                    totalValueDelta += valueDelta;
                    d.unsavedValue = newValue;
                    //we need to update alltooltips so index for dimns is maintained
                    //@todo - go back to using a key instead of array for dimns?
                    const tooltipsG = d3.select(this.parentNode);
                    tooltipsG.selectAll("g.tooltip").call(tooltips.updateTooltip, tooltipDimns)

                    //update corresponding bar section
                    const barG = d3.select(this.parentNode.parentNode).select("g.bar")

                    //helper
                    //@todo - for now, we assume only 1 kpi datum here, but cant always do this for a reusabel component
                    //const kpiDatum = dataWithEnrichedBarData[0];
                    const kpiDatum = barG.datum();
                    const newKpiDatum = {
                        ...kpiDatum,
                        barData:{
                            ...kpiDatum.barData,
                            sectionsData:kpiDatum.barData.sectionsData.map(sectionD => {
                                if(sectionD.key !== d.key) { return sectionD; }
                                return {
                                    ...sectionD,
                                    endValue:newValue,
                                }
                            }),
                            standardsData:kpiDatum.barData.standardsData.map(standD => ({
                                ...standD,
                                //@todo - refactor - not sure why value doesnt  get updated on this d, 
                                //so we are using a totalValueDelta instead. Although this may be ok, but tehn we should 
                                //tidy up the code above as some is repeated/unnecc

                                value:d.key === "minStandardEdit" ? standD.value + totalValueDelta : standD.value
                            }))
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
                .onDragEnd(() => {
                    totalValueDelta = 0;
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
    progressBar.editing = function (value) {
        if (!arguments.length) { return editing; }
        editing = value;
        return progressBar;
    };
    progressBar.nrEndTooltips = function (value) {
        if (!arguments.length) { return nrEndTooltips; }
        nrEndTooltips = value;
        return progressBar;
    };
    progressBar.nrNumbers = function (value) {
        if (!arguments.length) { return nrNumbers; }
        nrNumbers = value;
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
