import * as d3 from 'd3';
import { DIMNS, grey10 } from "../../constants";
import dragEnhancements from '../../enhancedDragHandler';
import { pcCompletion } from "../../../../util/NumberHelpers"
import { Oscillator } from '../../domHelpers';
import { getTransformationFromTrans } from '../../helpers';
import tooltipsComponent from '../../tooltipsComponent';

/*

*/
export default function nameComponent() {
    //API SETTINGS
    // dimensions
    let width = DIMNS.profile.width;
    let height = DIMNS.profile.height;
    let expandedHeight = height * 3;
    let margin = { left: 0, right:0, top: 0, bottom: 0 };
    let contentsWidth;
    let contentsHeight;
    let expandedContentsHeight;

    let nameCharWidth;
    let nameWidth;
    let nameHeight;
    let nameMargin;

    let barWrapperWidth;
    let barWrapperHeight;
    let expandedBarWrapperHeight;
    let barWrapperMargin;
    let barWrapperContentsWidth;
    let barWrapperContentsHeight;

    let barAndHandlesHeight;

    let barWidth;
    let barHeight;
    let barMargin;
    let barContentsWidth;
    let barContentsHeight;

    let numbersWrapperWidth;
    let numbersWrapperHeight;
    let numbersMargin;
    let numbersContentsWidth;
    let numbersContentsHeight;

    let handleWidth;
    let handleHeight;
    let topHandleHeight;
    let bottomHandleHeight;

    let totalTooltipsHeight;
    let tooltipWidth;
    let tooltipHeight;

    //this function overrides the general dimns within a specific selection
    function getExpandedDimns(d, handlesAreAbove, handlesAreBelow){
        const contentsHeight = expandedContentsHeight;
        const barWrapperHeight = expandedBarWrapperHeight;

        //must know tooltips situation before we know barAndHandleHeight
        const nrTooltipRowsAbove = d3.max(d.tooltipsData.filter(t => t.location === "above"), d => d.row + 1);
        const tooltipsAboveHeight = nrTooltipRowsAbove * tooltipHeight;

        const barWrapperContentsHeight = barWrapperHeight - barWrapperMargin.top - barWrapperMargin.bottom;
        const barAndHandlesHeight = barWrapperContentsHeight;
        //this is same on both
        const handleHeight = barAndHandlesHeight * 0.25;
        const topHandleHeight = handlesAreAbove ? handleHeight : 0;
        const bottomHandleHeight = handlesAreBelow ? handleHeight : 0;
        //normal bar height only needs to reduce to include handles, not tooltips
        barHeight = barAndHandlesHeight - topHandleHeight - bottomHandleHeight;
        

        const barHeight = barWrapperHeight - totalTooltipHeight - (handlesAreAbove ? handleHeight : 0) - (handlesAreBelow ? handleHeight : 0);
        const barContentsHeight = barHeight - barMargin.top - barMargin.bottom; 

        return { 
            contentsHeight, 
            barWrapperHeight, 
            handleHeight, 
            barHeight, 
            barContentsHeight,
            tooltipsAboveHeight,
        }
    }

    function getNormalDimns(d){
        return { 
            contentsHeight, 
            barWrapperHeight, 
            handleHeight, 
            barHeight, 
            barContentsHeight,
            tooltipsAboveHeight:0,
        }
    }
    function updateDimns(nrOfNumberValues, handlesAreAbove, handlesAreBelow, nrTooltipRows){
        contentsHeight = height - margin.top - margin.bottom;
        nameHeight = d3.min([contentsHeight * 0.5, 10]);
        //name margin is same for normal and expanded
        nameMargin = { left: 0, right: 0, top: nameHeight * 0.1, bottom: nameHeight * 0.1 };

        barWrapperHeight = contentsHeight - nameHeight;

        //need to do some expanded dimns because all selections need to know tooltipsDimns as margin will depend on them
        expandedContentsHeight = expandedHeight - margin.top - margin.bottom;
        expandedBarWrapperHeight = expandedContentsHeight - nameHeight;

        totalTooltipsHeight = expandedBarWrapperHeight * 0.75;
        tooltipHeight = totalTooltipsHeight / nrTooltipRows;
        tooltipWidth = tooltipHeight * 0.9;
        const defaultHorizMargin = width * 0.1;
        const horizMargin = d3.max([tooltipWidth/2, defaultHorizMargin]);
        barWrapperMargin = { left: horizMargin, right: horizMargin, top:height * 0.1, bottom: height * 0.05 };

        barWrapperContentsHeight = barWrapperHeight - barWrapperMargin.top - barWrapperMargin.bottom;

        barAndHandlesHeight = barWrapperContentsHeight;
        handleHeight = barAndHandlesHeight * 0.25;
        topHandleHeight = handlesAreAbove ? handleHeight : 0;
        bottomHandleHeight = handlesAreBelow ? handleHeight : 0;
        //normal bar height only needs to reduce to include handles, not tooltips
        barHeight = barAndHandlesHeight - topHandleHeight - bottomHandleHeight;

        contentsWidth = width - margin.left - margin.right;
        const numbersWrapperProportionalWidth = nrOfNumberValues === 2 ? 0.4 : (nrOfNumberValues === 1 ? 0.3 : 0);
        numbersWrapperWidth = contentsWidth * numbersWrapperProportionalWidth;
        barWrapperWidth = contentsWidth - numbersWrapperWidth;
        barWidth = barWrapperWidth;
        handleWidth = handleHeight * 0.6;
        nameCharWidth = barWidth * 0.04; //todo - use pseudo element
    
        //numbers are same for normal and expanded
        numbersWrapperHeight = contentsHeight - nameHeight;
        numbersMargin = { left:numbersWrapperWidth * 0.1, right:numbersWrapperWidth * 0.1, top:numbersWrapperHeight * 0.1, bottom: numbersWrapperHeight * 0.1 };
        numbersContentsWidth = numbersWrapperWidth - numbersMargin.left - numbersMargin.right;
        numbersContentsHeight = numbersWrapperHeight - numbersMargin.top - numbersMargin.bottom;

        //bar contents will be overriden for expanded
        barMargin = { left: 0, right: 0, top: 0, bottom: 0 };
        barContentsWidth = barWidth - barMargin.left - barMargin.right;
        barContentsHeight = barHeight - barMargin.top - barMargin.bottom; 

        //fonts
        fontSizes.name = nameHeight;
    }

    let fontSizes = {
    };

    const defaultStyles = {};
    let getStyles = () => defaultStyles;

    let getName = d => d.name;
    let isEditable = () => false;
    let isExpanded = () => false;


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

    const enhancedDrag = dragEnhancements();
    const enhancedHandleDrag = dragEnhancements();
    const tooltips = tooltipsComponent();

    let scales = {};

    //dom

    function numbers(selection, options={}) {
        //console.log("kpi update...........", height)
        const { transitionEnter=true, transitionUpdate=true, log} = options;

        // expression elements
        selection.each(function (data, i) {
            console.log("kpi key", data.key)
            const containerG = d3.select(this);
            const { key, numbersData, handlesData, start, end } = data

            const nrOfNumberValues = numbersData?.length || 0;
            //grab the first kpi to check wht handles there are
            const handlesAreAbove = handlesData?.filter(h => h.position === "above") !== 0 || false;
            const handlesAreBelow = handlesData?.filter(h => h.position === "below") !== 0 || false;

            const nrTooltipRowsAbove = d3.max(data.tooltipsData.filter(t => t.location === "above"), d => d.row + 1);
            const nrTooltipRowsBelow = d3.max(data.tooltipsData.filter(t => t.location === "below"), d => d.row + 1);
            const nrTooltipRows = nrTooltipRowsAbove + nrTooltipRowsBelow;

            updateDimns(data, nrOfNumberValues, handlesAreAbove, handlesAreBelow, nrTooltipRows);
            //override some dimns for expanded
            const { 
                contentsHeight, 
                barWrapperHeight, 
                handleHeight, 
                barHeight, 
                barContentsHeight,
                tooltipsAboveHeight,
            } = isExpanded(data) ? getExpandedDimns(data) : getNormalDimns(data);

            const styles = getStyles(data);

            enhancedDrag
                .onDblClick(onDblClick)
                .onClick(onClick);
                
            const drag = d3.drag()
                .on("start", enhancedDrag())
                .on("drag", enhancedDrag())
                .on("end", enhancedDrag());


            enhancedHandleDrag
                //.onDblClick(onDblClickKpi)
                //.onClick(onClickKpi);

            const handleDrag = !isEditable(data) ? () => {} : d3.drag()
                .on("start", enhancedHandleDrag(handleDragStart))
                .on("drag", enhancedHandleDrag(handleDragged))
                .on("end", enhancedHandleDrag(handleDragEnd));

            const contentsG = containerG.selectAll("g.kpi-contents").data([data]);
            contentsG.enter()
                .append("g")
                .attr("class", "kpi-contents")
                .each(function(d){
                    scales[d.key] = d3.scaleLinear();

                    const contentsG = d3.select(this);
                    contentsG.append("rect")
                        .attr("class", "kpi-bg")
                        .attr("stroke", "none")
                        .attr("stroke-width", 0.3);

                    const nameG = contentsG.append("g")
                        .attr("class", "name")
                            .style("cursor", "pointer");

                    nameG.append("rect")
                        .attr("fill", "transparent")
                        .attr("fill", "yellow")
                        .attr("stroke", "none");

                    nameG.append("text")
                        .attr("dominant-baseline", "central");

                    const barWrapperG = contentsG.append("g").attr("class", "bar-wrapper");
                    barWrapperG.append("rect").attr("class", "bar-wrapper-bg")
                    barWrapperG.append("g").attr("class", "bar")

                    /*
                    contentsG.append("g")
                            .attr("class", "numbers")
                                .append("g")
                                    .attr("class", "numbers-contents")
                                        .append("rect")
                                            .attr("fill", "none")
                                            .attr("stroke", "none");*/

                })
                .merge(contentsG)
                .attr("transform", (d,i) => `translate(${margin.left},${margin.top})`)
                .each(function(d){
                    //console.log("d", d)
                    //console.log("i", i)
                    const contentsG = d3.select(this);
                    contentsG.select("rect.kpi-bg")
                        .attr("width", contentsWidth)
                        .attr("height", contentsHeight)
                        .attr("fill", styles.bg?.fill || "none")
                        .attr("fill", "red")
                    
                    const nameG = contentsG.select("g.name");
                    nameG.select("rect")
                        .attr("width", nameCharWidth * getName(data).length)
                        .attr("height", nameHeight);
                    
                    nameG.select("text")
                        .attr("y", nameHeight/2)
                        .attr("font-size", fontSizes.name || 9)
                        .attr("stroke", styles.name?.stroke || grey10(8))
                        .attr("fill", styles.name?.stroke || grey10(8))
                        .attr("stroke-width", styles.name?.strokeWidth || 0.2)
                        .text(getName(d) +" " +i) //temp add i so they different

                    //contentsG.select("g.bar-wrapper").datum()
            
                    const scale = scales[d.key].domain([start, end]).range([0, barContentsWidth])

                    //barsG starts at top-left of bars, so must shoft down for handle above
                    const barY = tooltipsAboveHeight + topHandleHeight;
                    const barWrapperG = contentsG.select("g.bar-wrapper")
                        .attr("transform", `translate(${barWrapperMargin.left}, ${nameHeight + barWrapperMargin.top})`);

                    barWrapperG.select("rect.bar-wrapper-bg")
                        .attr("width", barWrapperContentsWidth)
                        .attr("height", barWrapperContentsHeight)
                        .attr("fill", "pink")

                    const barG = barWrapperG.select("g.bar")
                        .attr("transform", `translate(${barMargin.left}, ${barY + barMargin.top})`)

                    const barRect = barG.selectAll("rect.bar-section").data(d.barData, d => d.key)
                    barRect.enter()
                        .append("rect")
                            .attr("class", b => "bar-section bar-section-"+b.key)
                            .attr("fill", b => b.fill || "none")
                            .attr("stroke", b => b.stroke || "none")
                            .attr("opacity", b => {
                                //parent comp may have set an overide for opacity
                                //this is temp way to reduce opacity in KpiView due to bg fill
                                const stylesObj = styles.bars ? styles.bars[b.key] : null;
                                return stylesObj?.opacity || (b.key === "target" ? 0.5 : 1);
                            })
                            .merge(barRect)
                            .attr("x", b => scale(b.from))
                            .attr("width", b => scale(b.to) - scale(b.from))
                            .attr("height", barContentsHeight)

                    barRect.exit().each(function(d){
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

                    /*

                    const handlePathD = (w, h, pos) =>  {
                        if(pos === "below"){
                            return `M0 0 l ${-w/2} ${h} h ${w} l ${-w/2} ${-h}`;
                        }
                        return `M0 0 l ${-w/2} ${-h} h ${w} l ${-w/2} ${h}`;  
                    }

                    //console.log("handlesData", d.handlesData)
                    const handleG = barsG.selectAll("g.handle").data(d.handlesData, hd => hd.key)
                    handleG.enter()
                        .append("g")
                            .attr("class", hd => `handle handle-${hd.key}`)
                            .style("cursor", isEditable ? "pointer" : "default")
                            .each(function(hd){
                                const handleG = d3.select(this);
                                switch(hd.handleType){
                                    case "rect":{
                                        handleG.append("rect");
                                        break;
                                    }
                                    case "line":{
                                        handleG.append("line");
                                        break;
                                    }
                                    default:{
                                        //triangle
                                        handleG.append("path");
                                    }
                                }  
                            })
                            .merge(handleG)
                            .attr("transform", h => `translate(${scale(h.value)}, ${h.pos === "below" ? barContentsHeight : 0})`)
                            .each(function(hd){
                                const handleG = d3.select(this);
                                switch(hd.handleType){
                                    case "rect":{
                                        const rectHandleWidth = handleWidth/2;
                                        handleG.select("rect")
                                            .attr("x", -rectHandleWidth/2)
                                            .attr("y", -handleHeight/2)
                                            .attr("width", rectHandleWidth)
                                            //note - handleHeight is split between above and below so rect overspills the bar
                                            .attr("height", barHeight + handleHeight);
                                        break;
                                    }
                                    case "line":{
                                        handleG.select("line")
                                            .attr("y1", -handleHeight/2)
                                            //note - handleHeight is split between above and below so line overspills the bar
                                            .attr("y2", barHeight + handleHeight/2);
                                        break;
                                    }
                                    default:{
                                        //triangle
                                        handleG.select("path")
                                            .attr("d", handlePathD(handleWidth, handleHeight, hd.pos));
                                    }
                                }
                                //applies to all
                                handleG.select("*")
                                    .attr("fill", hd => hd.fill || null)
                                    .attr("stroke", hd => hd.stroke || null)
                                    .attr("stroke-width", hd => hd.strokeWidth || null)
                                    .attr("stroke-dasharray", hd => hd.strokeDasharray || null);
                            })
                            .call(handleDrag)

                    handleG.exit().each(function(d){
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

                    //tooltips
                    //helper
                    const tooltipY = t => {
                        if(t.location === "above"){
                            return -((t.row + 1) * tooltipHeight + (handlesAreAbove ? handleHeight : 0));
                        }
                        return barHeight + t.row * tooltipHeight + (handlesAreBelow ? handleHeight : 0);
                    }
                    const tooltipsData = isSelected(d) ? d.tooltipsData : [];
                    const tooltipG = barsG.selectAll("g.tooltip").data(tooltipsData, t => t.key);
                    tooltipG.enter()
                        .append("g")
                            .attr("class", t => `tooltip tooltip-${t.key}`)
                            .merge(tooltipG)
                            .attr("transform", t => `translate(${scale(t.value) - tooltipWidth/2}, ${tooltipY(t)})`)
                            .call(tooltips
                                .width(tooltipWidth)
                                .height(tooltipHeight)
                                .styles({
                                    title:{
                                        fontSize:d3.min([kpiHeight * 0.25, 9])
                                    },
                                    value:{
                                        fontSize:d3.min([kpiHeight * 0.3, 11])
                                    }
                                }), { log })

                    tooltipG.exit().each(function(d){
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



                    //numbers
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
                    
                    const numberG = numbersContentsG.selectAll("g.number").data(d.numbersData, n => n.key);
                    numberG.enter()
                        .append("g")
                            .attr("class", n => `number number-${n.key}`)
                            .each(function(){
                                d3.select(this)
                                    .append("rect")
                                    .attr("stroke", "none")
                                    .attr("fill", "none")

                                d3.select(this)
                                    .append("text")
                                        .attr("text-anchor", "middle")
                                        .attr("dominant-baseline", "central")
                            })
                            .merge(numberG)
                            .attr("transform", (n,i) => `translate(${i * numberWidth},0)`)
                            .each(function(n){
                                d3.select(this).select("rect")
                                    .attr("width", numberWidth)
                                    .attr("height", numberHeight)


                                d3.select(this).select("text")
                                    .attr("x", numberWidth/2)
                                    .attr("y", numberHeight/2)
                                    .attr("font-size", numberFontSize)
                                    .attr("stroke-width", 0.3)
                                    .attr("fill", n => n.colour)
                                    .attr("stroke", n => n.colour)
                                    .text(n.value)

                            })
                    numberG.exit().each(function(d){
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

                    */
    
                })
                .call(drag)

            //EXIT
            contentsG.exit().each(function(d){
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

            //flags
            let boundAlreadyReached = false;
            function handleDragStart(e , d){
                //console.log("dragstart", d)
                onDragStart.call(this, e, d)
            }
            function handleDragged(e , d){
                const contentsG = d3.select(this.parentNode.parentNode)
                const scale = scales[contentsG.datum().id];
                const domain = scale.domain();
                const newValue = +scale.invert(e.x).toFixed(0);
                const newPCCompletion = pcCompletion(d.previousValue, d.targetValue, newValue);
                const newValueIsAtBound = newValue <= domain[0] || newValue >= domain[1];
                if(newValueIsAtBound && boundAlreadyReached){
                    return;
                }

                const handleDraggedHandleG = d3.select(this);
                const handleDraggedBarRect = d3.select(this.parentNode).select(`rect.bar-${d.key}`);
                const handleDraggedTooltipG = d3.select(this.parentNode).select(`g.tooltip-${d.key}`);
                //todo - need to grab pcCompletion and actual, as one or both may exist
                /*
                const actualNumberG = d3.select(this.parentNode.parentNode).select(`g.number-${d.key}-actual`)
                const completionNumberG = d3.select(this.parentNode.parentNode).select(`g.number-${d.key}-completion`)
                */
                const actualNumberG = contentsG.select(`g.number-${d.key}-actual`)
                const completionNumberG = contentsG.select(`g.number-${d.key}-completion`)
                
                //just transform its position thats all
                //handle
                const currHandleTrans = getTransformationFromTrans(handleDraggedHandleG.attr("transform"));
                const currHandleX = +currHandleTrans.translateX;
                const currHandleY = +currHandleTrans.translateY;
                handleDraggedHandleG.attr("transform", `translate(${currHandleX + e.dx},${currHandleY})`);
                //bar if it exists
                if(!handleDraggedBarRect.empty()){
                    const currBarWidth = +handleDraggedBarRect.attr("width")
                    handleDraggedBarRect.attr("width", currBarWidth + e.dx);
                    //handleDraggedBarRect.attr("width", e.x);
                }
               
                //tooltip if it exists
                if(!handleDraggedTooltipG.empty()){
                    const currTooltipTrans = getTransformationFromTrans(handleDraggedTooltipG.attr("transform"));
                    const currTooltipX = +currTooltipTrans.translateX;
                    const currTooltipY = +currTooltipTrans.translateY;
                    handleDraggedTooltipG.attr("transform", `translate(${currTooltipX + e.dx},${currTooltipY})`);
                    if(d.format === "completion"){
                        //console.log("format is completion")
                        handleDraggedTooltipG.select("text.value").text(newPCCompletion);
                    }else{
                        //console.log("format is actual")
                        handleDraggedTooltipG.select("text.value").text(newValue);
                    }
                }
                
                if(!actualNumberG.empty()){
                    actualNumberG.select("text").text(newValue);
                }
                if(!completionNumberG.empty()){
                    completionNumberG.select("text").text(newPCCompletion);
                }

                //flag
                if(newValueIsAtBound){
                    boundAlreadyReached = true;
                }else{
                    boundAlreadyReached = false;
                }
                
                /*
                switch(d.id){
                    case "current":{ currentDragged.call(this, e, d) }
                    case "expected":{ expectedDragged.call(this, e, d) }
                    case "target":{ targetDragged.call(this, e, d) }
                    default:() => {}
                }
                */
                //todo - finish handling, and decide do we dispatch here or in the specific funcs below?
                //onDrag.call(this, e, d)
            }
            function handleDragEnd(e, d){
                //cleanup
                boundAlreadyReached = false;
                if(enhancedHandleDrag.isClick()) { return; }
                onDragEnd.call(this, e, d);
            }

            //longpress
            /*
            function longpressStart(e, d) {
                onLongpressStart.call(this, e, d)
            };
            function longpressDragged(e, d) {
                onLongpressDragged.call(this, e, d)
            };

            function longpressEnd(e, d) {
                onLongpressEnd.call(this, e, d)
            };
            */
        })

        return selection;
    }
    
    //api
    kpi.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return kpi;
    };
    kpi.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return kpi;
    };
    kpi.expandedHeight = function (value) {
        if (!arguments.length) { return expandedHeight; }
        expandedHeight = value;
        return kpi;
    };
    kpi.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = { ...margin, ...value };
        return kpi;
    };
    kpi.isExpanded = function (value) {
        if (!arguments.length) { return isExpanded; }
        isExpanded = value;
        return kpi;
    };
    kpi.fontSizes = function (values) {
        if (!arguments.length) { return fontSizes; }
        fontSizes = { ...fontSizes, ...values };
        return kpi;
    };
    kpi.getStyles = function (func) {
        if (!arguments.length) { return getStyles; }
        getStyles = (d,i) => ({ ...defaultStyles, ...func(d,i) });
        return kpi;
    };
    kpi.isEditable = function (value) {
        if (!arguments.length) { return isEditable; }
        isEditable = value;
        return kpi;
    };
    kpi.getName = function (value) {
        if (!arguments.length) { return getName; }
        if(typeof value === "function"){
            getName = value;
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
