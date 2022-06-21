import * as d3 from 'd3';

function timeSeriesData(){
    let measure;
    function data(dataset){
        const { datapoints, measures } = dataset;
        const ds = datapoints.map(d => ({
            ...d,
            value: measure? Number(d.values.find(v => v.measure === measure._id).value) : d.value,
            date:new Date(d.date)
        }))
        .filter(d => d.value)

        return {
            ...dataset,
            datapoints:ds,
        }
    }
    //api
	data.measure = function(value){
		if(!arguments.length)
			return measure;
        
        if(value !== undefined){
            measure = value;
        } 
		return data;
	}

    /*chart.timeDomain = function(value){
		if(!arguments.length)
			return scales.x.domain();
        if(value !== undefined){
            scales.x.domain(value).nice();
        } 
		return chart;
	}*/
    return data;
}

export default timeSeriesData;