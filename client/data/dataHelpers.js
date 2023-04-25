import * as d3 from 'd3';
import { addDays } from '../util/TimeHelpers';

export const isNumber = number => typeof number === "number" && !isNaN(number);
export const boundValue = bounds => value => {
    const lowerBound = d3.min(bounds);
    const upperBound = d3.max(bounds);
    if(!isNumber(value)){ return value; }
    return d3.min([upperBound, d3.max([lowerBound, value])])
}
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

export const calcPCIntervalsFromValue = (requiredPC, extent, refValue, options={}) => {
    const { keepInRange=false, accuracy=0 } = options;
    const domainDiff = extent[1] - extent[0];
    const isIncreasing = domainDiff > 0;
    //note - if decr4asing, then diff will be neg, so subtracting a neg will be an increase
    const pc = (requiredPC/100) * domainDiff;
    const pcWorseThanTarget = refValue - pc;
    const pcBetterThanTarget = refValue + pc
    //if decreasing, then its out of range if the value is above extent[0], otherwise it is if its less than
    const worseIsOutOfRange = isIncreasing ? pcWorseThanTarget < extent[0] : pcWorseThanTarget > extent[0];
    const worseValueToUse = worseIsOutOfRange && keepInRange ? extent[0] : pcWorseThanTarget;
    const betterIsOutOfRange = isIncreasing ? pcBetterThanTarget > extent[1] : pcBetterThanTarget < extent[1];
    const betterValueToUse = betterIsOutOfRange && keepInRange ? extent[1] : pcBetterThanTarget;
    return [Number(worseValueToUse.toFixed(accuracy)), Number(betterValueToUse.toFixed(accuracy))]
}

export const valueIsInDomain = (value, domain) => {
    if(!isNumber(value)){ return false; }
    const isIncreasing = domain[1] - domain[0] > 0;
    if(isIncreasing){ return domain[0] <= value && value <= domain[1] }
    return domain[0] >= value && value >= domain[1];
}

const datesAreOnSameDay = (date1, date2) => 
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate();

export const dateIsInRange = (date, range, options={}) => {
    const { includeStartDay = true, includeEndDay = true } = options;
    if(!date || !range || !range[1]) { return false; }

    const isBelowUpperBound = date <= range[1];
    const isAboveLowerBound = date >= range[0];
    const lowerBoundConditionMet = includeStartDay ? isAboveLowerBound || datesAreOnSameDay(date, range[0]) : isAboveLowerBound;
    const upperBoundConditionMet = includeEndDay ? isBelowUpperBound || datesAreOnSameDay(date, range[1]) : isBelowUpperBound;

    return lowerBoundConditionMet && upperBoundConditionMet;
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
