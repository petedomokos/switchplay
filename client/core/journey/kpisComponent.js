import * as d3 from 'd3';
import { DIMNS, grey10 } from "./constants";
import dragEnhancements from './enhancedDragHandler';
import { Oscillator } from './domHelpers';
import tooltipsComponent from './tooltipsComponent';

/*

*/
export default function kpisComponent() {
    //API SETTINGS
    // dimensions
    let width = DIMNS.profile.width;
    let height = DIMNS.profile.height;
    let margin;
    let contentsWidth;
    let contentsHeight;

    let listHeight;
    let ctrlsHeight;

    let ctrlsMargin;
    let ctrlsContentsWidth;
    let ctrlsContentsHeight;
    let btnWidth;
    let btnHeight;
    let btnFontSize;

    let kpiHeight = 100;
    let gapBetweenKpis;

    let kpiNameWidth;
    let kpiNameHeight;
    let kpiNameMargin;

    let barWidth;
    let numbersWidth;

    let barHeight;
    let barMargin;
    let barContentsWidth;
    let barContentsHeight;

    let numbersHeight;
    let numbersMargin;
    let numbersContentsWidth;
    let numbersContentsHeight;

    let handleWidth;
    let handleHeight;
    let topHandleHeight;
    let bottomHandleHeight;
    let tooltipWidth;
    let tooltipHeight;
    let selectedKpiHeight;

    function updateDimns(nrOfNumberValues, nrCtrlsButtons=0, handlesAreAbove, handlesAreBelow){
        //must make sure outer-most tooltips will be displayed
        tooltipHeight = kpiHeight * 0.5;
        tooltipWidth = tooltipHeight * 0.9;
        handleHeight = kpiHeight * 0.25;
        handleWidth = handleHeight * 0.6;
        topHandleHeight = handlesAreAbove ? handleHeight : 0;
        bottomHandleHeight = handlesAreBelow ? handleHeight : 0;

        const horizMargin = withTooltips ? tooltipWidth/2 : 0;
        margin = { left: horizMargin, right: horizMargin, top:height * 0.1, bottom: height * 0.05 };
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        ctrlsHeight = nrCtrlsButtons !== 0 ? contentsHeight * 0.15 : 0;
        listHeight = contentsHeight - ctrlsHeight;

        ctrlsMargin = { left: contentsWidth * 0.1, right: contentsWidth * 0.1, top: ctrlsHeight * 0.1, bottom: ctrlsHeight * 0.1 };
        ctrlsContentsWidth = contentsWidth - ctrlsMargin.left - ctrlsMargin.right;
        ctrlsContentsHeight = ctrlsHeight - ctrlsMargin.top - ctrlsMargin.bottom;
        btnWidth = ctrlsContentsWidth / nrCtrlsButtons;
        btnHeight = ctrlsContentsHeight;

        const numbersPCWidth = nrOfNumberValues === 2 ? 0.4 : (nrOfNumberValues === 1 ? 0.3 : 0);
        numbersWidth = contentsWidth * numbersPCWidth;
        barWidth = contentsWidth - numbersWidth;
        //todo - calculate name width based on text length
        kpiNameWidth = barWidth * 0.8;
        //todo - reduce kpiHeight and place kpi name above each bar 
        //kpi margin
        gapBetweenKpis = kpiHeight * 0.3;

        //kpi content
        //note - dont include tooltips as they are given extra space on top of kpiHeight if they are shown
        const kpiNameAndBarHeight = kpiHeight - topHandleHeight - bottomHandleHeight;

        kpiNameHeight = kpiNameAndBarHeight * 0.6;
        barHeight = kpiNameAndBarHeight * 0.4;

        kpiNameMargin = { left: 0, right: 0, top: kpiNameHeight * 0.1, bottom: kpiNameHeight * 0.1 };
        //barMargin = { left: 0, right: 0, top: barHeight * 0.15, bottom: barHeight * 0.15 };
        barMargin = { left: 0, right: 0, top: 0, bottom: 0 };
        barContentsWidth = barWidth - barMargin.left - barMargin.right;
        barContentsHeight = barHeight - barMargin.top - barMargin.bottom; 

        selectedKpiHeight = kpiHeight + 3 * tooltipHeight;

        numbersHeight = kpiHeight - kpiNameHeight;
        numbersMargin = { left:numbersWidth * 0.1, right:numbersWidth * 0.1, top:numbersHeight * 0.1, bottom: numbersHeight * 0.1 };
        numbersContentsWidth = numbersWidth - numbersMargin.left - numbersMargin.right;
        numbersContentsHeight = numbersHeight - numbersMargin.top - numbersMargin.bottom;

    }

    let fontSizes = {
    };
    let styles = {}

    let withTooltips = true;
    let selected;
    let isSelected = d => false;
    let getName = d => d.name;

    //API CALLBACKS
    let onClick = function(){};
    let onClickKpi = function(){};
    let onDblClick = function(){};
    let onDragStart = function() {};
    let onDrag = function() {};
    let onDragEnd = function() {};
    let onLongpressStart = function() {};
    let onLongpressDragged = function() {};
    let onLongpressEnd = function() {};
    let onMouseover = function(){};
    let onMouseout = function(){};
    let onDelete = function() {};
    let onCtrlClick = () => {};

    const enhancedDrag = dragEnhancements();
    const tooltips = tooltipsComponent();
    //@todo - find out why k=1.05 makes such a big increase in size
    const oscillator = Oscillator({k:1});

    let longpressed;

    let scales = {};

    //dom
    let containerG;

    function kpis(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log} = options;

        // expression elements
        selection.each(function (data) {
            //console.log("kpis update", data)
            const kpisData = data.kpisData || data;
            const ctrlsData = data.ctrlsData || [];
            const nrOfNumberValues = kpisData[0] ? kpisData[0].numbersData.length : 0;
            const nrOfCtrlsButtons = ctrlsData?.length;

            //grab the first kpi to check wht handles there are
            const handlesAreAbove = data[0] ? data[0].handlesData?.filter(h => h.position === "above") !== 0 : false;
            const handlesAreBelow = data[0] ? data[0].handlesData?.filter(h => h.position === "below") !== 0 : false;
            updateDimns(nrOfNumberValues, nrOfCtrlsButtons, handlesAreAbove, handlesAreBelow);
            //plan - dont update dom twice for name form
            //or have a transitionInProgress flag
            containerG = d3.select(this);
            //can use same enhancements object for outer and inner as click is same for both
            enhancedDrag
                .onDblClick(onDblClick)
                .onClick(onClick)
                .onLongpressStart(longpressStart)
                .onLongpressDragged(longpressDragged)
                .onLongpressEnd(longpressEnd);

            const drag = d3.drag()
                .on("start", enhancedDrag(dragStart))
                .on("drag", enhancedDrag(dragged))
                .on("end", enhancedDrag(dragEnd));

            const contentsG = containerG.selectAll("g.contents").data([1]);
            contentsG.enter()
                .append("g")
                    .attr("class", "contents")
                    .each(function(){
                        const contentsG = d3.select(this)

                        contentsG
                            .append("rect")
                                .attr("class", "contents-bg")
                                .attr("fill", "transparent")
                                .attr("stroke", "none");

                        contentsG.append("g").attr("class", "kpis-list")
                            .append("rect")
                                .attr("class", "list-bg");

                        contentsG.append("g").attr("class", "kpis-ctrls")
                            .append("rect")
                                .attr("class", "ctrls-bg");;
                    })
                    .merge(contentsG)
                    .attr("transform", d =>  `translate(${margin.left},${margin.top})`)
                    .each(function(){
                        const contentsG = d3.select(this);

                        contentsG.select("rect.contents-bg")
                            .attr("width", contentsWidth)
                            .attr("height", contentsHeight)

                        //kpi list
                        const listG = contentsG.select("g.kpis-list");
                        listG.select("rect.list-bg")
                            .attr("width", contentsWidth)
                            .attr("height", listHeight)
                            .attr("fill", "transparent")
                            .attr("stroke", "none")

                        //todo - get liust bg showing
                        //make kpi bar width font size etc based on listHeight

                        const kpiG = listG.selectAll("g.kpi").data(kpisData, d => d.id);
                        kpiG.enter()
                            .append("g")
                            .attr("class", d => "kpi kpi-"+d.id)
                            .each(function(d,i){
                                scales[d.id] = d3.scaleLinear();

                                const kpiG = d3.select(this);
                                kpiG.append("rect")
                                    .attr("class", "kpi-bg")
                                    .attr("fill", "none")
                                    .attr("stroke", "none")
                                    .attr("stroke-width", 0.3);

                                const nameG = kpiG.append("g")
                                    .attr("class", "name")
                                        .style("cursor", "pointer")
                                        .on("click", onClickKpi);

                                nameG.append("rect")
                                    .attr("fill", "transparent")
                                    .attr("stroke", "none");

                                nameG.append("text")
                                    .attr("dominant-baseline", "central");

                                kpiG.append("g").attr("class", "bars");

                                kpiG.append("g")
                                        .attr("class", "numbers")
                                            .append("g")
                                                .attr("class", "numbers-contents")
                                                    .append("rect")
                                                        .attr("fill", "none")
                                                        .attr("stroke", "none");
            
                            })
                            .style("cursor", "grab")
                            .merge(kpiG)
                            .attr("transform", (d,i) => {
                                const extraSpaceForSelected = selectedKpiHeight - kpiHeight;
                                const selectedKpiBefore = kpisData
                                    .slice(0, i)
                                    .find(kpi => isSelected(kpi));
                                const vertShift = i * (kpiHeight + gapBetweenKpis) +(selectedKpiBefore ? extraSpaceForSelected : 0)
                                return `translate(0,${vertShift})`
                            })
                            .each(function(d){
                                //console.log("kpi", d)
                                const { start, end } = d;

                                const kpiG = d3.select(this);
                                kpiG.select("rect.kpi-bg")
                                    .attr("width", contentsWidth)
                                    .attr("height", isSelected(d) ? selectedKpiHeight : kpiHeight) 
                                
                                const nameG = kpiG.select("g.name");
                                nameG.select("rect")
                                    .attr("width", kpiNameWidth)
                                    .attr("height", kpiNameHeight);
                                
                                nameG.select("text")
                                    .attr("y", kpiNameHeight/2)
                                    .attr("font-size", fontSizes.name)
                                    .attr("stroke", styles.kpi?.name?.stroke || grey10(8))
                                    .attr("fill", styles.kpi?.name?.stroke || grey10(8))
                                    .attr("stroke-width", styles.kpi?.name?.strokeWidth || 0.2)
                                    .text(getName(d))
                        
                                const scale = scales[d.id].domain([start, end]).range([0, barContentsWidth])

                                //barsG starts at top-left of bars, so must shoft down for handle above
                                const barsY = kpiNameHeight + (isSelected(d) ? 2 * tooltipHeight : 0) + topHandleHeight;
                                const barsG = kpiG.select("g.bars")
                                    .attr("transform", `translate(${barMargin.left}, ${barsY + barMargin.top})`)

                                const barRect = barsG.selectAll("rect.bar").data(d.barsData, d => d.id)
                                barRect.enter()
                                    .append("rect")
                                        .attr("class", b => "bar bar-"+b.id)
                                        .attr("fill", b => b.fill || "none")
                                        .attr("stroke", b => b.stroke || "none")
                                        .attr("opacity", b => {
                                            //parent comp may have set an overide for opacity
                                            //this is temp way to reduce opacity in KpiView due to bg fill
                                            const stylesObj = styles.kpi?.bars ? styles.kpi.bars[b.id] : null;
                                            return stylesObj?.opacity || (b.id === "target" ? 0.5 : 1);
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

                                const handlePathD = (w, h, pos) =>  {
                                    if(pos === "below"){
                                        return `M0 0 l ${-w/2} ${h} h ${w} l ${-w/2} ${-h}`;
                                    }
                                    return `M0 0 l ${-w/2} ${-h} h ${w} l ${-w/2} ${h}`;  
                                }

                                //console.log("handlesData", d.handlesData)
                                const handleG = barsG.selectAll("g.handle").data(d.handlesData, d => d.id)
                                handleG.enter()
                                    .append("g")
                                        .attr("class", "handle")
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
                                const tooltipG = barsG.selectAll("g.tooltip").data(tooltipsData, d => d.key);
                                tooltipG.enter()
                                    .append("g")
                                        .attr("class", "tooltip")
                                        .merge(tooltipG)
                                        .attr("transform", t => `translate(${scale(t.value) - tooltipWidth/2}, ${tooltipY(t)})`)
                                        .call(tooltips
                                            .width(tooltipWidth)
                                            .height(tooltipHeight), { log })

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

                                const numbersG = kpiG.select("g.numbers")
                                    .attr("transform", `translate(${barWidth}, ${numbersY})`)
                                
                                const numbersContentsG = numbersG.select("g.numbers-contents")
                                    .attr("transform", `translate(${numbersMargin.left}, ${numbersMargin.top})`)
                                
                                numbersContentsG.select("rect")
                                    .attr("width", numbersContentsWidth)
                                    .attr("height", numbersContentsHeight);
                                
                                const numberG = numbersContentsG.selectAll("g.number").data(d.numbersData, n => n.id);
                                numberG.enter()
                                    .append("g")
                                        .attr("class", "number")
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
                
                            })

                        //EXIT
                        kpiG.exit().each(function(d){
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

                        //ctrls
                        const ctrlsG = contentsG.select("g.kpis-ctrls")
                            .attr("transform", d => `translate(${ctrlsMargin.left},${listHeight + ctrlsMargin.top})`);
                        
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
                                        .attr("fill", d => d.isSelected ? "white" : "grey")
                                        .attr("stroke", d => d.isSelected ? "white" : "grey")
                                        .attr("opacity", d => d.isSelected ? 1 : 0.6)
                                        .attr("font-size", fontSizes.ctrls)
                                        .attr("stroke-width", 0.1)
                                        .text(d => d.label)

                                })

                    })


            function dragStart(e , d){
                //console.log("dragStart", d.x)
                d3.select(this).raise();

                onDragStart.call(this, e, d)
            }
            function dragged(e , d){
                //controlled components
                d.x += e.dx;
                d.y += e.dy;
                d3.select(this)
                    .attr("transform", "translate(" + d.x +"," + d.y +")")
                    //.call(updateTransform, { x: d => d.displayX })
        
                //onDrag does nothing
                onDrag.call(this, e, d)
            }
    
            //note: newX and Y should be stored as d.x and d.y
            function dragEnd(e, d){
                //console.log("dragEnd", d.x)
                //on next update, we want aim dimns/pos to transition
                //shouldTransitionAim = true;
    
                if(enhancedDrag.isClick()) { return; }
    
                onDragEnd.call(this, e, d);
            }

            //DELETION
            let deleted = false;
            const svg = d3.select("svg");

            //longpress
            function longpressStart(e, d) {
                //todo - check defs appended, and use them here, then longopressDrag should trigger the delete of a goal
                //then do same for aims and links
                /*
                svg.select("defs").select("filter").select("feDropShadow")
                    .attr("flood-opacity", 0.6)
                    .attr("stdDeviation", 10)
                    .attr("dy", 10);
                */

                d3.select(this).select("rect.bg")
                    //.style("filter", "url(#drop-shadow)")
                    .call(oscillator.start);

                longpressed = d;
                containerG.call(kpis);

                onLongpressStart.call(this, e, d)
            };
            function longpressDragged(e, d) {
                if(deleted) { return; }

                if(enhancedDrag.distanceDragged() > 200 && enhancedDrag.avgSpeed() > 0.08){
                    d3.select(this)
                        //.style("filter", "url(#drop-shadow)")
                        .call(oscillator.stop);

                    deleted = true;
                    d3.select(this)
                        .transition()
                        .duration(50)
                            .attr("opacity", 0)
                            .on("end", () => {
                                onDelete(d.id)
                            })
                }else{
                    dragged.call(this, e, d)
                }

                onLongpressDragged.call(this, e, d)
            };

            function longpressEnd(e, d) {
                if(deleted){ 
                    deleted = false;
                    return; 
                }
                /*
                svg.select("defs").select("filter").select("feDropShadow")
                    .transition("filter-transition")
                    .duration(300)
                        .attr("flood-opacity", 0)
                        .attr("stdDeviation", 0)
                        .attr("dy", 0)
                        .on("end", () => {
                            d3.select(this).style("filter", null);
                        });*/

                d3.select(this)
                    //.style("filter", "url(#drop-shadow)")
                    .call(oscillator.stop);
                
                onLongpressEnd.call(this, e, d)
            };
        })
        //remove one-off settings
        longpressed = null;

        return selection;
    }
    
    //api
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
    kpis.kpiHeight = function (value) {
        if (!arguments.length) { return kpiHeight; }
        kpiHeight = value;
        return kpis;
    };
    kpis.fontSizes = function (values) {
        if (!arguments.length) { return fontSizes; }
        fontSizes = { ...fontSizes, ...values };
        return kpis;
    };
    kpis.styles = function (values) {
        if (!arguments.length) { return styles; }
        styles = { ...styles, ...values };
        return kpis;
    };
    kpis.withTooltips = function (value) {
        if (!arguments.length) { return withTooltips; }
        withTooltips = value;
        return kpis;
    };
    kpis.selected = function (value) {
        if (!arguments.length) { return selected; }
        selected = value;
        isSelected = d => d.id === selected;
        return kpis;
    };
    kpis.getName = function (value) {
        if (!arguments.length) { return getName; }
        if(typeof value === "function"){
            getName = value;
        }
        return kpis;
    };
    kpis.longpressed = function (value) {
        if (!arguments.length) { return longpressed; }
        longpressed = value;
        return kpis;
    };
    kpis.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return kpis;
    };
    kpis.onCtrlClick = function (value) {
        if (!arguments.length) { return onCtrlClick; }
        onCtrlClick = value;
        return kpis;
    };
    kpis.onClickKpi = function (value) {
        if (!arguments.length) { return onClickKpi; }
        if(typeof value === "function"){
            onClickKpi = value;
        }
        return kpis;
    };
    kpis.onDblClick = function (value) {
        if (!arguments.length) { return onDblClick; }
        onDblClick = value;
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
    return kpis;
}
