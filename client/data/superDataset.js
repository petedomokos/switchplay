import * as d3 from 'd3';

import { sum } from "./summaryHelpers";

function superDataset(){
    //default summary functoin returns the sum of all ds
    let summary = sum;
    //default datapoint value accesor is just d.value
    let datapointValue = dset => d => Number(d.value);
    //can also pass in a function that returns a value for each dataset directly. this takes priority over datapointValue
    let datasetValue;
    let datasetName;
    //for each dataset, it looks in measuresToUse for that dataset. if not htere, it uses measure.ismain, or else first one
    function data(datasets){
        //convert each datapoints array into 1 datapoint called value.
        //todo - later, handle multiple values to be selected from, eg multiple measures
        const ds = datasets.map((dset,i) =>{
            let value;
            if(datasetValue){
                //we use the dataset accessor to get a value for each dataset
                value = datasetValue(dset);
            }else{
                //we use the datapoint accessor to get a value for each datapoint, 
                //and then a summary function to get one value for each dataset ( see defaults in outer scope)
                const { datapoints } = dset;

                const datapointValues = datapoints
                    .filter(d => !d.isTarget)
                    .map(d => datapointValue(dset)(d))
                    .filter(d => d !== "undefined" && d !== NaN && d !== null)

                value = summary(datapointValues, dset)
            }

            return {
                dataset:dset,
                name:dset.name,
                key:dset.initials,
                label:dset.initials,
                tags:dset.tags,
                value
            };
        })
        const _id = datasets.map(dset => dset._id).join("-");
        return {
            name:datasetName,
            _id,
            ds,
            measure:{

            }
        }
    }
    //api
    data.datasetName = function(arg){
		if(!arguments.length)
			return datasetName;
        
        if(arg !== undefined){
            datasetName = arg;
        } 
		return data;
	}
    data.datapointValue = function(arg){
		if(!arguments.length)
			return datapointValue;
        
        if(arg !== undefined){
            datapointValue = arg;
        } 
		return data;
	}
    data.datasetValue = function(arg){
		if(!arguments.length)
			return datasetValue;
        
        if(arg !== undefined){
            datasetValue = arg;
        } 
		return data;
	}
    data.summary = function(arg){
		if(!arguments.length)
			return summary;
        
        if(arg !== undefined){
            summary = arg;
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

export default superDataset;