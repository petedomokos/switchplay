import * as d3 from 'd3';
import { OPEN_CHANNEL_EXT_WIDTH } from './constants';
import { channelContainsPoint, channelContainsDate } from './geometryHelpers';

export function calcPlanetHeight(svgHeight){
    return d3.min([svgHeight * 0.2, 100]);
}

export function calcChartHeight(svgHeight, planetHeight){
    //svg must contain 2 planets plus one chart, up to a certain point
    return d3.min([svgHeight - 2 * planetHeight, 400]);
}

export function planetsAfterDate(planetData, date){
    return planetData.filter(p => p.targetDate > date);
}

export function findFuturePlanets(planetData){
    return planetsAfterDate(planetData, new Date());
}

//assumes planets in ascending order by date
export function findFirstFuturePlanet(planetData){
    const now = new Date();
    return findFuturePlanets(planetData)[0];
}

export function findNearestDate(dateToTest, dates){
    return d3.least(dates, date => Math.abs(date - dateToTest) )
}

export function msToMonths(ms){
    return ms / 2629746000;
}

export function linearProjValue(x0MS, y0, x1MS, y1, xProjMS, dps){
    const x0 = msToMonths(x0MS);
    const x1 = msToMonths(x1MS);
    const xProj = msToMonths(xProjMS);
    /*
    console.log("linearprojvalue...")
    console.log("x0", x0)
    console.log("x1", x1)
    console.log("y0", y0)
    console.log("y1", y1)
    */
    const m = (y1 - y0) / (x1 - x0);
    //the eqn of line must also be shifted so its deltaX not x
    const y = (deltaX) => m * deltaX + y0;
    const deltaX = xProj - x0;
    //console.log("returning...", dps ? (+y(deltaX)).toFixed(dps) : y(deltaX))
    return dps ? (+y(deltaX)).toFixed(dps) : y(deltaX);
}

export function getTransformation(selection){
    return getTransformationFromTrans(selection.attr("transform"));
}

export function getTransformationFromTrans(transform) {
    if(!transform) { 
        return {
            translateX:0,
            translateY:0,
            scaleX:1,
            scaleY:1,
            rotate:0,
            skew:0
        } 
    }
    // Create a dummy g for calculation purposes only. This will never
    // be appended to the DOM and will be discarded once this function 
    // returns.
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    // Set the transform attribute to the provided string value.
    g.setAttributeNS(null, "transform", transform);
    
    // consolidate the SVGTransformList containing all transformations
    // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
    // its SVGMatrix. 
    var matrix = g.transform.baseVal.consolidate().matrix;
    
    // Below calculations are taken and adapted from the private function
    // transform/decompose.js of D3's module d3-interpolate.
    var {a, b, c, d, e, f} = matrix;   // ES6, if this doesn't work, use below assignment
    // var a=matrix.a, b=matrix.b, c=matrix.c, d=matrix.d, e=matrix.e, f=matrix.f; // ES5
    var scaleX, scaleY, skewX;
    if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
    if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
    if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
    if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
    return {
      translateX: e,
      translateY: f,
      rotate: Math.atan2(b, a) * 180 / Math.PI,
      skewX: Math.atan(skewX) * 180 / Math.PI,
      scaleX: scaleX,
      scaleY: scaleY
    };
  }

export const calcTrueX = (channelsData) => (adjX) => {
    const channel = channelsData.find(ch => ch.endX >= adjX)
    const extraX = adjX - channel.startX;
    return channel.startX + ((extraX/channel.width) * channel.closedWidth) - (channel.nrPrevOpenChannels * OPEN_CHANNEL_EXT_WIDTH);
}
export const calcAdjX = (channelsData) => (trueX) => {
    const channel = channelsData.find(ch => ch.trueEndX >= trueX);
    //startX already includes any previous shifts for open channels, so we need trueStartX
    const trueExtraX = trueX - channel.trueStartX;
    const extraXProp = trueExtraX / channel.closedWidth; //channels are closed for ture values
    const adjExtraX = extraXProp * channel.width; //cancels out if channel is closed
    //we return startX + extra not trueStartX, because we want to incude prev open channel widths
    return channel.startX + adjExtraX;
}
export const findPointChannel = (channelsData) => (pt) => {
    return channelsData.find(ch => channelContainsPoint(pt, ch))
}
export const findDateChannel = (channelsData) => (date) => channelsData.find(ch => channelContainsDate(date, ch))
export const findNearestChannelByEndDate = (channelsData) => (date) => {
    const nearestDate = findNearestDate(date, channelsData.map(d => d.endDate))
    return channelsData.find(ch => ch.endDate === nearestDate)
}

/*
receives props, which is an object that includes an id.
finds teh corresponding item with that id, and replaces any other properties contained in props.
Then returns the entire state array, maintaining the order if applicable.
*/

export function updatedState(prevState, props, orderComparator){
    const updated = { ...prevState.find(item => item.id === props.id), ...props };
    const rest = prevState.filter(item => item.id !== props.id);
    if(orderComparator){
        //ordered
        const before = rest.filter(item => orderComparator(item, updated));
        const after = rest.filter(item => !orderComparator(item, updated));
        const newState = [...before, updated, ...after];
        return newState;
    }
    //unordered
    return [updated, ...rest];
}

export function createId(existingIds=[]){
    const check = (idToCheck) => {
        if(!existingIds.find(existingId => existingId === idToCheck+"")){
            return idToCheck+"";
        }else{
            return check(idToCheck + 1)
        }
    }
    return check(1);
}

const COLOURS = ["red", "blue", "orange", "yellow", "olive"]
export function createColour(nrPrevColours){
    return COLOURS[nrPrevColours % COLOURS.length]
}