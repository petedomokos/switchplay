import * as d3 from 'd3';
//import tooltipChart from '../tooltip/TooltipChart';

export const updateClipPath = (selection, sizes) =>{
	selection.select('clipPath#clip').select('rect')
		//.transition()
		//.duration(500)
		.attr('width', sizes.chartWidth)
		.attr('height', sizes.chartHeight)
		.attr('x', sizes.margin.left)
		.attr('y', sizes.margin.top)
}

export const updateDatapoints = (container, ds, scales) =>{
    const { x, y } = scales;

    //bind
    const datapointG = container.selectAll('g.datapointG')
        .data(ds, d => d.date)

    //enter
    const datapointGEnter = datapointG
        .enter()
        .append('g')
            .attr('class', 'datapointG')
    
    datapointGEnter
            .append('circle')
                .attr('r', 2.5)
                .attr("stroke-width", 0.1);
        
    //update
    datapointG.merge(datapointGEnter)
        .attr('transform', d => 'translate('+x(d.date) +',' + y(d.value) +')')
        .select("circle")
            //darker for current difficulty ds
            .attr('fill', d => d.isProjection ? "transparent" : d.isTarget ? "red" : d.isCurrentDifficulty ? "#505050" : "#D3D3D3")
            .attr('stroke', d => d.isTarget ? "red" : "grey");


    /*
    datapointGEnter
            .on('mouseover', handleMouseover)
            .on('mouseout', handleMouseout);
    
    //note - function declarations are hoisted 
    function handleMouseover(e){
        const tooltip = tooltipChart().x(e.pageX +10).y(e.pageY +10);
        //add a tooltip on the circle
        const tooltipContainer = d3.select(this);
        tooltipContainer.data(['data here']).call(tooltip)
    }
    function handleMouseout(e){
        //remove tooltip
        //todo - this couples this func to tooltip chart - maybe we should pass
        //through the classname
        d3.select('.tooltip-container').remove();
    }
    */
}

export const updateDatapointTracks = (container, ds, scales) =>{
    const { x, y } = scales;
    //bind
    const trackG = container.selectAll("g.trackG").data(ds);

    //enter
    const trackGEnter = trackG.enter()
        .append("g")
            .attr("class", "trackG")

    trackGEnter
        .append("line")
            .attr("class", "horiz")
            .call(styleLine)
            

    trackGEnter
        .append("line")
            .attr("class", "vert")
            .call(styleLine)
          
    //update
    trackG.merge(trackGEnter)
        .select("line.horiz")
            .attr("x1", x.range()[0])
            .attr("x2", d => x(d.date))
            .attr("y1", d => y(d.value))
            .attr("y2", d => y(d.value))
    
    trackG.merge(trackGEnter)
        .select("line.vert")
            .attr("x1", d => x(d.date))
            .attr("x2", d => x(d.date))
            .attr("y1", y.range()[0])
            .attr("y2", d => y(d.value))
    
    //helper
    function styleLine(selection){
        selection.each(function(d){
            d3.select(this)
                .attr("stroke", "red")
                .attr("stroke-opacity", 0.7)
                .attr("stroke-width", 0.5)
                .attr("stroke-dasharray", 3)
        })
    }
}

export const updateLineToTarget = (container, fromD={}, targetD={}, scales) =>{
    const { x, y } = scales;
    const line = container.selectAll("line.lineToTarget").data([1])
    //enter
    const lineEnter = line.enter()
        .append("line")
        .attr("class", "lineToTarget")
        .attr("stroke", "grey")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-width", 0.5)
        .attr("stroke-dasharray", 1)
        
    //update
    line.merge(lineEnter)
        .attr("display", fromD.date && targetD.date ? "initial" : "none")
        .attr("x1", x(fromD.date))
        .attr("x2", x(targetD.date))
        .attr("y1", y(fromD.value))
        .attr("y2", y(targetD.value))
}

export const updateXAxis = (container, scale, sizes) =>{
    const { margin, chartHeight } = sizes;
    const axis = d3.axisBottom().scale(scale).ticks(6)
    const axisG = container.selectAll("g.xAxisG").data([1])

    //enter
    const axisGEnter = axisG
        .enter()
        .append("g")
            .attr("class", "axisG xAxisG")
            .call(axis);

    axisGEnter
        .selectAll('*')
            .style("stroke-width", 0.6)
            .style("stroke", "black")
            .style("opacity", 0.5);

    axisGEnter
        .selectAll('text')
            .style("font-size", "9px")
            .attr('transform', 'translate(15,15) rotate(45) ');

    //update
    axisG.merge(axisGEnter)
        .attr("transform", 'translate(0,' +(margin.top +chartHeight) +')');
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
