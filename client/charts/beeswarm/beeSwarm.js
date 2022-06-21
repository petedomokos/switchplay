import * as d3 from 'd3';
import {  updateYAxis, updateClipPath, updateBeeSwarmDs } from "./updateBeeSwarmComponents";
import { calculateBuffer, domainWithBuffer } from "../ChartHelpers";

/*
  const beeSwarmDataMock = {
    name:"Summary",
    chartType:"beeSwarm",
    measure:overallMeasure,
    //need to pass in start and end date, so it can calculate the ontrack line based on current date
    //strats on 0, ie current score on start date, and aim is to end on 100, but could go above 100 or even below 
    //(regression od performance)
    settings:{
      bounds:[overallMeasure.min, overallMeasure.max]
    },
    ds:[
      {key:"pressups", label:"Press up", value:45, tags:["strength", "goal2", "LME", "UB"]},
      {key:"situps", label:"Sit-up", value:34, tags:["strength", "goal2", "LME", "core"]},
      {key:"sprint", label:"Sprint", value:11, tags:["speed", "LB"]}
    ]

  };


*/

function beeSwarm(){
    var svg, chartG;
    var sizes ={
        //default is MS sizes
        width:600, height:400,
        margin: {top:50, bottom:50, left:50, right:50},
        chartWidth:500, chartHeight:300
    }
    var yDomain;
    var scales = {
        //x:d3.scaleTime(), todo - maybe still use a time Scale for the animation?
        y:d3.scaleLinear()
    }
    var force;

    function chart(selection){
        selection.each(function(data){
            //console.log("beeswarm data", data);
            const { ds, measure }= data;
            //console.log("ds", ds)
            const actualDs = ds.filter(d => !d.isTarget && !d.isProjection).filter(d => d.value);
            const targetDs = ds.filter(d => d.isTarget);

            //console.log("actualDs", actualDs)
            svg = d3.select(this);
            const { margin, chartWidth, chartHeight } = sizes;

            //init clipPath G
			svg.append('defs')
                .append('clipPath')
                    .attr('id', 'clip')
                .append('rect')

            //chartG
           chartG = svg
                .append('g')
                    .attr('class', 'chartG')
                    .attr('clip-path', "url(#clip)")

            updateClipPath(svg, sizes)

            //SCALES
            //y domain
            //asume no negative values and no mins/maxes on dataset measures yet
            if(!yDomain){
                //@TODO - check that d3.extent maintains numberOrder eg increasing or decreasing
                const yExtent = d3.extent(ds, d => d.value);
                //console.log("yExtent", yExtent)
                const buffer = calculateBuffer(yExtent, 20); //20pc
                //console.log("buffer", buffer)
                yDomain = domainWithBuffer(yExtent, buffer);
                // console.log("yDomain", yDomain)
            }
            scales.y.domain(yDomain).nice();
            //console.log("y nice domain", scales.y.domain())
            scales.y.range([chartHeight + margin.top, margin.top])//.nice();

			updateYAxis(svg, scales.y, sizes);

            //var manyBody = d3.forceManyBody().strength(10)
            const r = 20;
            force = d3.forceSimulation()
                .force("x", d3.forceX(sizes.margin.left + sizes.chartWidth * 0.5))
                //y a little stronger than default(0.1) to prioritise y pos
                .force("y", d3.forceY(d => scales.y(d.value)).strength(0.2))
                .force("collision", d3.forceCollide(r))
                .velocityDecay(0.7) //up from 0.4 to stop oscillation
                .alphaDecay(0.001) 
                .on("tick", updateNetwork)
    
            function updateNetwork(){
                chartG.selectAll('g.datapointG')
                    .attr("transform", d => "translate(" +d.x +" , " +d.y +")")
            }
            //non-animated simulation
            updateBeeSwarmDs(chartG, actualDs, {radius:r})
            force.nodes(actualDs)
        })

    }
    //api
	chart.sizes = function(value){
		if(!arguments.length)
			return sizes;
        
        if(value !== undefined){
            sizes = {...sizes, ...value};
        } 
		return chart;
	}
    chart.yDomain = function(value){
		if(!arguments.length)
			return scales.y.domain();
        if(value !== undefined){
            scales.y.domain(value);
        } 
		return chart;
	}
    /*chart.timeDomain = function(value){
		if(!arguments.length)
			return scales.x.domain();
        if(value !== undefined){
            scales.x.domain(value).nice();
        } 
		return chart;
	}*/
    return chart;
}

export default beeSwarm;