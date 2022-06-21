import * as d3 from 'd3';

export const sum = ds => ds.reduce((a,b) => a + b, 0)

export const max = ds => d3.max(ds)

export const min = ds => d3.min(ds)