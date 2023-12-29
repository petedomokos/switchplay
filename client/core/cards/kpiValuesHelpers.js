import * as d3 from 'd3';
import { linearProjValue } from "../journey/helpers";
import { isNumber } from '../../data/dataHelpers';
import { addDays, addYears, addMonths, addWeeks, calcDateCount, calcAge } from '../../util/TimeHelpers';
import { sortAscending } from '../../util/ArrayHelpers';
import { convertToPC, round, roundDown, roundUp, getRangeFormat, dateIsInRange, getValueForStat, getGreatestValueForStat } from "../../data/dataHelpers";
//helper
/*
export const requiredValueIsAchieved = (value, required, options={}) => {
    const { order="highest is best", log, useSteps } = options;
    if(log){ 
        //console.log("tia..val", value)
        //console.log("tia..req", required)
    }
    if(!isNumber(value?.actual) || !isNumber(required?.actual)){ return false; }
    if(order === "highest is best"){ 
        if(log){
            //console.log("res", useSteps ? value.actual >= required.actualSteps : value.actual >= required.actual )
        }
        return useSteps ? value.actual >= required.actualSteps : value.actual >= required.actual 
    }
    return value.actual <= required.actual;
}

export const targetIsAchieved = (values, options) => requiredValueIsAchieved(values.current, values.target, options);
export const expectedIsAchieved = (values, options) => requiredValueIsAchieved(values.current, values.expected, options);


//note - we are using all datasets here, even ones potentially that have in involvemnet in kpis
export function getLastSessionDate(datasets){
    const dateMaxes = datasets
        .map(dset => dset.datapoints)
        .map(ds => d3.max(ds, d => d.date))

    const max = d3.max(dateMaxes);
    if(!max){ return null; }

    max.setHours(22);
    return max;
}

export function calcStepsValues(startDate, date, steps=[]){
    const nrSteps = steps.length;
    const start = { actual:0, completion:0, date:startDate };
    const target = { 
        actual:nrSteps,
        actualSteps:nrSteps, 
        completion:100 
    };
    const nrCompletedSteps = steps.filter(s => s.completed).length;
    const current = { 
        actual:nrCompletedSteps,
        actualSteps:nrCompletedSteps,
        completion: nrSteps === 0 ? 0 : Math.round((nrCompletedSteps/nrSteps) * 100) 
    } 
    //@todo - impl showTrailingZeros in round function so we can set it to false
    const _expected = calcExpected(start, { ...target, date }, new Date(), { accuracy:2, showTrailingZeros:false });
    const expected = { ..._expected, actualSteps:Math.floor(_expected.actual) }
    return { start, current, target, expected }
}
*/

export function calcExpected(startDate, startValue, targetDate, targetValue, expectedDate, options={}){
    const { accuracyPowerOften=0, showTrailingZeros=true, mustChange, order="highest is best" } = options;
    const startDateMS = startDate.getTime();
    const targetDateMS = targetDate.getTime();
    const expectedDateMS = expectedDate.getTime();
    const completion = Math.round(linearProjValue(startDateMS, 0, targetDateMS, 100, expectedDateMS, accuracyPowerOften));
    if(!isNumber(startValue) || !isNumber(targetValue)){ 
        return { raw:null, completion }; 
    }
    const _raw = linearProjValue(startDateMS, startValue, targetDateMS, targetValue, expectedDateMS, accuracyPowerOften);
    //temp fix it so expected is never rounded down to same as start
    //@todo - scrap this, or adjust to handle order too
    const raw = mustChange && _raw === startValue ? (order === "highest is best" ? _raw + 1 : _raw - 1) : _raw;
    return { 
        raw,//: Math.round(rawUnrounded, accuracyPowerOften, showTrailingZeros), 
        completion
    }
}
/*
export function isSameDay(d1, d2){
    return  d1.getUTCDate() === d2.getUTCDate() && 
            d1.getUTCMonth() === d2.getUTCMonth() && 
            d1.getUTCFullYear() === d2.getUTCFullYear();
}

export function getValueForSession(stat, datapoints, sessionDate, start, target){
    //if dataset unavailable, stat will be undefined
    if(!stat){ return { actual:undefined, completion:null } }
    //helper
    const getValue = getValueForStat(stat.key, stat.accuracy);
    //note for now we assume one per day, but will soon implement a sessionId property of each datapoint too
    const datapointThatDay = datapoints.find(d => {
        return isSameDay(d.date, sessionDate) && !d.isTarget
    });
    const actual = getValue(datapointThatDay);
    const completion = start && target ? convertToPC(start.actual, target.actual)(actual) : null;
    return { actual , completion };
}
*/

export function getStatValue(stat, datapoints, options={}){
    const { dateRange, dataMethod, completionCalcInfo:{ startValue, targetValue }, deckIndex, cardNr } = options;
    //console.log("getStatValue......", stat.key, datapoints)
    if(!datapoints || datapoints.length === 0){
        const raw = null;
        const completion = null;
        return { raw, completion }
    }
    //null case 1: dataset unavailable
    if(!stat){ return { raw:null, completion:null } }
    //helper
    const getValue = getValueForStat(stat.key, stat.accuracy);
    const dateValueObjs = datapoints
        .map(d => ({ date: d.date, value: getValue(d) }))
        .filter(d => isNumber(d.value));

    //console.log("nrvalues", dateValueObjs.length)

    //null case 2: no datapoints
    if(dateValueObjs.length === 0){ return { raw:null, completion:null } }
    
    const values = dateValueObjs.map(d => d.value);
    
    //helper
    const getBest = values => stat.order === "lowest is best" ? d3.min(values) : d3.max(values);
    const getOverallValue = values => {
        if(dataMethod === "best"){ return getBest(values); }
        if(dataMethod === "latest") { return d3.greatest(dateValueObjs, d => d.date).value }
        //if(dataMethod === "mean"){ return Math.round(d3.mean(values)); }
        if(dataMethod === "mean"){ return d3.mean(values); }
        return null;
    }

    const raw = getOverallValue(values);
    //console.log("raw", raw)
    const completion = convertToPC(startValue, targetValue)(raw);
    //console.log("completion", completion)
    return { raw, completion }
}
/*
export function createTargetFromDefault(datasetKey, statKey, date, defaultTargets){
    const defaultTarget = findDefaultTarget(defaultTargets, datasetKey, statKey, date);
    return defaultTarget?.value || null;
}

export function twentyYearsAgo(now){ return addMonths(-240, now); }
export function oneMonthAgo(now){ return addMonths(-1, now); }
export function calcDateRange(start, end, format){
    return [
        roundUp(start, "day", format), 
        roundUp(end, "day", format)
    ];
}

export const goBackByExpiryDurationFromDate = (duration, units) => date => {
    if(units === "years"){ return addYears(-duration, date); }
    if(units === "months"){ return addMonths(-duration, date); }
    if(units === 'weeks'){ return addWeeks(-duration, date); }
    return date;
}
*/