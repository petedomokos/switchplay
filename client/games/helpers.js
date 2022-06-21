import * as d3 from 'd3';
import { getInstances } from "./data";
import { DIMNS } from "./constants";
import { SettingsApplications } from '@material-ui/icons';


//active block is last block that has a selection, unless only 1 block
export function getActiveBlockState(chainState){
    return { ...chainState[chainState.length-1], blockNr:chainState.length - 1}
}

export function getPrevActiveBlockState(state){
    return state[state.length -2 ] ? 
        { ...state[state.length -2], blockNr:state.length - 2 } : undefined;
}

/*
todo - replace with
export function getActiveBlockState(state){
    return state[state.length-1];
}

export function getPrevActiveBlockState(state){
    return state[state.length -2 ] ? state[state.length -2] : undefined;
}
*/

export function getActiveChainBlockState(expBuilderState, chainIndex){
    return getActiveBlockState(expBuilderState[chainIndex])
}

/*

export function getActiveBlockState(state){
    return [...state] //may not need this ...
            .map((block, i) => ({ ...block, blockNr:i}))
            .reverse()
            .find(block => block.selected || block.op) || state[0];
}

export function getPrevActiveBlockState(state){
    return [...state] //may not need this ...
            .map((block, i) => ({ ...block, blockNr:i}))
            .reverse()
            .slice(0,1) //gets rid of first (which is the last block)
            .find(block => block.selected || block.op); //gets the new first, which is the 2nd last block that is selected
}

*/

export const elementsBefore = (i, arr) => arr.slice(0, i)
export const elementsAfter = (i, arr) => arr.slice(i + 1, arr.length)

export const onlyUnique = (value, index, self) => {
    return self.indexOf(value) === index;
}

//export function calculateResult(f, data, accessor = x => x){
    //return f(data, accessor);
//}

export function calculateResult(blockData){
    //console.log("calcRes", blockData)
    //of is a datset or possibly a value???
    const { func, subFunc, prev={}} = blockData;
    //@todo:  implement 'ofs' within an 'ofs' eg diff(sum(xs), sum(ys))
    //const { planet, property, of } = of;
    //selection is this 'of' or prev 'of'
    const of = blockData.of || prev?.of || {};

    if(!func || (!of.planet)){
        //cant be a value unless we have a func and a planet selected
        return undefined;
    }

    //we know func and of.planet are defined, and hence of must have a dataset unless its homeSel
    switch(func.id){
        //in homeSel case, selection is never from prev
        case "homeSel":{ return homeSel(of.planet, func.settings)};
        //for sel, res will already be the dataset itself
        case "sel":{ return sel(of, func.settings?.filters)};
        case "filter":{ return filter(of, func.settings) }
        case "agg":{ return agg(prev.res, subFunc) }
        return undefined;
    };
}

export function homeSel(planet, settings={}){
    //@todo - impl settings which is user choice eg instanceId or something else that allows one to be picked eg median
    return getInstances(planet.id)[0]
}

//for now, this only processes numbers
export function sel(of, filters=[]){
    //console.log("calcualting sel res filters", filters)
    //console.log("of", of)
    const applyNextFilter = (next, dataset, remaining) => {
        if(!next){
            return dataset;
        }
        const filteredDataset = applyFilter(next, dataset);
        const [newNext, ...newRemaining] = remaining;
        return applyNextFilter(newNext, filteredDataset, newRemaining);
    }
    const [firstFilter, ...remainingFilters] = filters;
    const newOf= applyNextFilter(firstFilter, of, remainingFilters)
    //console.log("newOf", newOf)
    return newOf;
}

function applyFilter(filter, dataset){
    return dataset.filter(inst => filterIncludes(filter, inst))
}

//for now, this only works with numbers
function filterIncludes(filter, inst){
    //for now, assume it a number
    return filter.selectedOptions.includes(+inst.propertyValues[filter.propertyId])
}

export function agg(dataset, subFunc){
    if(!Array.isArray(dataset)) { return undefined; }
    //of has a planet so must be a dataset too
    return subFunc.f(dataset, x => x.value);
}

export function filter(of, settings={}){
    //@todo - implement
    //of has a planet so must be a dataset too
    //return of.filter(x => ...)
    return of;
}


export function isActive(chainData){
    return chainData.filter(b => b.isActive).length !== 0;
}

export function findActiveBlock(expBuilderData){
    return expBuilderData
        .find(chain => isActive(chain))
        .find(block => block.isActive)
}

//dimn helpers
export const getVisHeight = (blockData, availableHeight) => {
    const { func, of, prev } = blockData;
    //in some cases, vis is smaller
    if(func?.id === "homeSel"){
        //just show 1 planet
        return d3.min([availableHeight,30]);
    }
    if(func?.id === "agg"){
        //just show results box and agg icon
        return d3.min([availableHeight,20]);
    }
        //if no func, or no dataset to apply to func yet, visHeight is 0
        if(!func || (!of && !prev?.of)){ return 0; }
    //default to max size possible
    return availableHeight;
}
export const getBlockWidth = (funcId) => DIMNS.block.width[funcId || "default"];
export const sumPrevBlockWidths = (blockNr, chainData) => d3.sum(chainData.slice(0, blockNr).map(d => getBlockWidth(d.func?.id))) || 0;
