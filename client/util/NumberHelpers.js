import * as d3 from 'd3';

export const pcCompletion = (previousValue, targetValue, currentValue) => {
    if(targetValue === previousValue){ return 100; }
    const amountToImproveBy = targetValue - previousValue;
    const amountImproved = currentValue - previousValue;
    return d3.max([0, +(((amountImproved/amountToImproveBy) * 100).toFixed(0))]);
}