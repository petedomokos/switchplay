

export const calculateBuffer = (extent, bufferPercentage) => {
    const range = Math.abs(extent[1] - extent[0]);
    if(range !== 0){
        return range * bufferPercentage / 100;
    }
    //use max value instead
    const maxValue = Math.max(Math.abs(extent[0]), Math.abs(extent[1]))
    if(maxValue !== 0){
        return maxValue * bufferPercentage;
    }
    //default to 20
    return 20;
}

export const domainWithBuffer = (domain, buffer) =>{
    const lowerBound = Math.min(...domain) - buffer;
    const upperBound = Math.max(...domain) + buffer;
    const isIncreasing = domain[0] <= domain[domain.length - 1];
    return isIncreasing ? [lowerBound, upperBound] : [upperBound, lowerBound];
}

/*
//SCALES
//y domain
//asume no negative values and no mins/maxes on dataset measures yet
if(!yDomain){
    //@TODO - check that d3.extent maintains numberOrder eg increasing or decreasing
    const yExtent = d3.extent(ds, d => d.value);
    //console.log("yExtent", yExtent)
    const buffer = calculateBuffer(yExtent, 20); //20pc
    //console.log("buffer", buffer)
    yDomain = domainWithBuffer(yExtent, buffer);
    // console.log("yDomain", yDomain)
}
scales.y.domain(yDomain).nice();
//console.log("y nice domain", scales.y.domain())
scales.y.range([chartHeight + margin.top, margin.top])//.nice();

*/
