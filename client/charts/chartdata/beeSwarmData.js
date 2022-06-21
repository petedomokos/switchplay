import * as d3 from 'd3';

function beeSwarmData(){
    //for each dataset, it looks in measuresToUse for that dataset. if not htere, it uses measure.ismain, or else first one
    function data(datasets, measuresToUse){
        //convert each datapoints array into 1 datapoint called value.
        //todo - later, handle multiple values to be selected from, eg multiple measures
        return datasets.map((dset,i) =>{
            const { datapoints, measures } = dset;
            if(!measure) {
                //note - dset.value could also be externally set instead of via the onTrack measure
                return dset 
            };
            const values = datapoints
                .filter(d => !d.isTarget)
                .map(d => d.values.find(v => v.measure === measure._id).value)
            console.log("values", values)
            const value = d3.max(values)
            console.log("value", value)
            //for now, get 1 value from the derviedMeasre called id = onTrack
            return {
                ...dset,
                value
            }
        }).filter(dset => dset.value)
    }
    //api
	/*data.sizes = function(value){
		if(!arguments.length)
			return sizes;
        
        if(value !== undefined){
            sizes = {...sizes, ...value};
        } 
		return chart;
	}*/
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

export default beeSwarmData;