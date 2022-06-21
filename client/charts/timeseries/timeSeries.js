import { SyncDisabledSharp } from '@material-ui/icons';
import * as d3 from 'd3';
import { updateXAxis, updateYAxis, updateClipPath, updateDatapoints, updateDatapointTracks, updateLineToTarget } from "./updateTimeSeriesComponents";
import { calculateBuffer, domainWithBuffer } from "../ChartHelpers"

function timeSeries(){
    var svg, chartG;
    var sizes ={
        //default is MS sizes
        width:600, height:400,
        margin: {top:50, bottom:50, left:50, right:50},
        chartWidth:500, chartHeight:300
    }
    var scales = {
        x:d3.scaleTime(),
        y:d3.scaleLinear()
    }
    function chart(selection){
        selection.each(function(data){
            //console.log("timeSeires data", data);
            const { ds }= data;
            //console.log("ds", ds)
            const actualDs = ds.filter(d => !d.isTarget && !d.isProjection);
            const targetDs = ds.filter(d => d.isTarget);
            const projectedDs = ds.filter(d => d.isProjection);

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
			const yExtent = d3.extent(ds, d => d.value);
            const buffer = calculateBuffer(yExtent, 10)
            const yDomain = domainWithBuffer(yExtent, buffer)
            //default chart order is 'highest is best'
            if(data.measure.order === "lowest is best"){
                yDomain.reverse();
            }
            scales.y.domain(yDomain).nice();
			//ranges
            //todo - handle y number order
			scales.x.range([margin.left, chartWidth + margin.left])//.nice();
            scales.y.range([chartHeight + margin.top, margin.top])//.nice();
            //console.log("x range", scales.x.range())
            //console.log("y range", scales.y.range())
			updateXAxis(svg, scales.x, sizes);
			updateYAxis(svg, scales.y, sizes);
			updateDatapoints(chartG, ds, scales);
            //@TODO - add selected d to trackDs when user hovers 
            //in that ds band (must split background into rect strip bands)
            updateDatapointTracks(chartG, targetDs, scales);

            //line to target
            const lastActualDate = d3.max(actualDs, d => d.date)
            const lastActualD = actualDs.find(d => d.date === lastActualDate);
            const nextTargetDate = d3.min(targetDs, d => d.date)
            const nextTargetD = targetDs.find(d => d.date === nextTargetDate);
            updateLineToTarget(svg, lastActualD, nextTargetD, scales)

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
    chart.timeDomain = function(value){
		if(!arguments.length)
			return scales.x.domain();
        if(value !== undefined){
            scales.x.domain(value).nice();
        } 
		return chart;
	}
    return chart;
}

export default timeSeries;