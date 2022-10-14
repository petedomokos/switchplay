export const pcCompletion = (previousValue, targetValue, currentValue) => {
    if(targetValue === previousValue){ return 100; }
    const amountToImproveBy = targetValue - previousValue;
    const amountImproved = currentValue - previousValue;
    return +(((amountImproved/amountToImproveBy) * 100).toFixed(0));
}