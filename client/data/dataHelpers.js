import * as d3 from 'd3';
import { addDays } from '../util/TimeHelpers';

//@todo - handle showTrailingZeros = false
//@todo - handle accuracy >= 5...round to that number
export const round = (value, accuracy=0, showTrailingZeros=true) => {
    if(!value || isNaN(value)) { return value; }
    if(typeof accuracy === "undefined") { return value; }
    if(accuracy < 5){
        return showTrailingZeros ? Number(value.toFixed(accuracy)) : value; //must finish
    }
    return value; //must finish
}

//@todo - edge case, where target is lower than start, eg player has been injured
//do we deal with that edge case here, or in another way? probably another way.
export const convertToPC = (startValue, targetValue) => (value, options={}) => {
    const { dps=0, min=0, max=100, defaultToZero=true } = options;
    if(typeof startValue !== "number" || typeof targetValue !== "number" || typeof value !== "number"){
        return defaultToZero ? 0 : null;
    }
    const actualChange = value - startValue;
    const targetChange = targetValue - startValue;
    if(targetChange === 0){ return 100; }
    const pc = Number(((actualChange/targetChange) * 100).toFixed(dps))
    const lowerBounded = typeof min === "number" ? d3.max([min, pc]) : pc;
    const fullyBounded = typeof max === "number" ? d3.min([max, lowerBounded]) : lowerBounded;
    return fullyBounded;
}

export const getValueForStat = (statKey, accuracy, showTrailingZeros=true) => datapoint => {
    const value = Number(datapoint
        ?.values
        ?.find(v => v.key === statKey)
        ?.value);
        
    return round(value, accuracy, showTrailingZeros)
}

export const getGreatestValueForStat = statKey => datapoints => {
    return d3.greatest(datapoints, d => d.date)
        ?.values
        ?.find(v => v.key === statKey)
        ?.value;
}

export const isNumber = number => typeof number === "number";
export const boundValue = bounds => value => {
    const lowerBound = d3.min(bounds);
    const upperBound = d3.max(bounds);
    if(!isNumber(value)){ return value; }
    return d3.min([upperBound, d3.max([lowerBound, value])])
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
    if(!date || !range || !range[1]) { return false; }
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
