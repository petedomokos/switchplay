import * as d3 from 'd3';
import { addDays } from '../util/TimeHelpers';

export const getValueForStat = statKey => datapoint => {
    return datapoint
        ?.values
        ?.find(v => v.key === statKey)
        ?.value;
}

export const getGreatestValueForStat = statKey => datapoints => {
    return d3.greatest(datapoints, d => d.date)
        ?.values
        ?.find(v => v.key === statKey)
        ?.value;
}


//helper - can move out of here
export const getRangeFormat = granularity => {
    //for now, default to day 
    return d3.timeFormat("%Y/%m/%d");
}
//params include the format as an option, to avoid creating a new format each time
//format should match granularity
export const roundDown = (date, granularity="days", format) => {
    //for now, assume granularity is days
    if(granularity === "days"){
        const _format = format || d3.timeFormat("%Y/%m/%d");
        return new Date(_format(date));
    }
    return date;
};

export const roundUp = (date, granularity="day", format) => {
    //for now, assume granularity is days
    if(granularity === "day"){
        const _format = format || d3.timeFormat("%Y/%m/%d");
        //round it down then add 1 day
        return addDays(1, new Date(_format(date)));
    }
    return date;
}

export const dateIsInRange = (date, range, options={}) => {
    const { includeStart = true, includeEnd = false } = options;
    if(includeStart && includeEnd){ return date >= range[0] && date <= range[1]; }
    if(includeStart){ return date >= range[0] && date < range[1]; }
    return date > range[0] && date <= range[1];
}

/*
export const statValue = (date, statId, datapoints, method="latest") => {
    const relevantDatapoints = datapoints
        .filter(d => d.date <= date)
        .map(d => ({ ...d, value:d.values.find(v => v.measure === statId)?.value }))
        .map(d => ({ ...d, value:d.value ? +d.value : undefined }))
        .filter(d => d);

    //if(method === "latest"){
    //for now, assume latest only
    return d3.greatest(relevantDatapoints, d => d.date);
    //}
}
*/
