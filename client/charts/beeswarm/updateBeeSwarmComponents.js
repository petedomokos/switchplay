import * as d3 from 'd3';
//import tooltipChart from '../tooltip/TooltipChart';


export const updateBeeSwarmDs = (chartG, ds, options={}) =>{
    const { fillScale, radius } = options;
    const r = radius || 20;
	//helpers
	let circleFill = d =>{
		if(d.projected)
			return "none"
		if(d.isTarget)
			return "black"
		if(fillScale)
			return fillScale(d.key)
		return 'red'
	}
	let circleStroke = (d, i) => {
		if(fillScale)
			return fillScale(d.key)
		return 'red'
	}
	//1. BIND
	const updatedChartG = chartG.selectAll(("g.datapointG"))
		.data(ds, d => d.key)
	//2. EXIT - old elements not present in new data
	updatedChartG.exit()
		.attr('class', 'exit')
		.remove()

	//3.UPDATE - ONLY old elements with NEW data bound to them
	//updatedChartG.classed('enter', false)

	//4. ENTER - new elements present in new data

	let chartGEnter = updatedChartG.enter()
		.append("g")
		  	.attr("class", d => "enter datapointG "+(d.key ? d.key : ''))

	chartGEnter
		.append("circle")
			//each actual d has a unique id from schema
			.attr("r", r)
		    .style("fill", d => circleFill(d))
		    .style("stroke", (d,i) => {
		    	//console.log('entering d...')
		    	return circleStroke(d, i)
		    })
		    .style('stroke-width', 3)
		    //.style('opacity', 0)
		  	//.transition(d3.transition().duration(250).delay(500))
		  	.style('opacity', 1)
    chartGEnter
        .append("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", "10px")
            .text(d => d.label)
}

export const updateClipPath = (selection, sizes) =>{
	selection.select('clipPath#clip').select('rect')
		//.transition()
		//.duration(500)
		.attr('width', sizes.chartWidth)
		.attr('height', sizes.chartHeight)
		.attr('x', sizes.margin.left)
		.attr('y', sizes.margin.top)
}
    
export const updateYAxis = (container, scale, sizes) =>{
    const { margin } = sizes;
    const axis = d3.axisLeft().scale(scale).ticks(5)
    const axisG = container.selectAll("g.yAxisG").data([1]);

    //enter
    const axisGEnter = axisG
        .enter()
        .append("g")
            .attr("class", "axisG yAxisG")
            .call(axis);
    
    axisGEnter
        .selectAll('*')
            .style("stroke-width", 0.6)
            .style("stroke", "black")
            .style("opacity", 0.6);
    
    axisGEnter
        .selectAll('text')
            .style("font-size", "9px");
    //update
    axisG.merge(axisGEnter)
        .attr("transform", 'translate(' +margin.left +',0)');
}
