import { getGoals, getStartDate } from "./goals";
import { getDerivedMeasures, hydrateMeasure } from './measures';
import { mean, median, percentage, sum, difference } from "./Calculations"

export function hydrateDatasets(datasets){
    //console.log("hydrate-----------------------------------", datasets)
    return datasets.map(dset => hydrateDataset(dset))
}
//may be shallow or deep
export function hydrateDataset(dataset){
    console.log("hydrate Dset", dataset)
    const isDeep = !!dataset.datapoints;
    //key - legacy - some dsets have no key
    const key = dataset.key || toCamelCase(dataset.name);
    //owner - legacy - some dsets dont have owner
    const owner = dataset.owner || dataset.admin[0];

    //we dont bother with some properties if its a shallow version eg no datapoints or measures
    const startDate = isDeep ? getStartDate(dataset) : null;
    console.log("getting derived...")
    const derivedMeasures = isDeep ? getDerivedMeasures(key) : null;
    console.log("derived", derivedMeasures)
    console.log("getting raw...")
    const rawMeasures = dataset.measures?.map(m => hydrateMeasure(m));
    console.log("raw", rawMeasures)
    const datapoints = isDeep ? hydrateDatapoints(dataset.datapoints, rawMeasures, derivedMeasures) : null;
    console.log("ds", datapoints)
    return {
        ...dataset,
        key,
        owner,
        startDate, 
        rawMeasures, 
        derivedMeasures,
        stats: isDeep ? [...rawMeasures, ...derivedMeasures] : null,
        datapoints
    }
}

export function hydrateDatapoints(datapoints, hydratedRawMeasures, hydratedDerivedMeasures){
    console.log("hydrateDatapoints", datapoints)
    console.log("raw derived", hydratedRawMeasures, hydratedDerivedMeasures)
    return datapoints
        .map(d => hydrateDatapoint(d, hydratedRawMeasures, hydratedDerivedMeasures)
        .filter(d => !d.key || !d.value));
}

export function hydrateDatapoint(datapoint, hydratedRawMeasures, hydratedDerivedMeasures){
    console.log("hydrateD", datapoint)
    //add measure key to rawMeasure values (server stores the measure id instead - need to change)
    const enteredKeyedValues = datapoint.values.map(v => {
        //v.measure is measure _id - we convert it to its key
        return {
            //value could be for a rawmeasure or could be for a raw or derivedMeasure using the key
            key:hydratedRawMeasures.find(m => m._id === v.measure || m.key === v.key)?.key || hydratedDerivedMeasures.find(m => m.key === v.key)?.key,
            value:v.value,
            wasCalculated:false
        }
    })
    //derivedValues need a measure key to access the rawValues
    const datapointWithEnteredKeyedValues = { ...datapoint, values:enteredKeyedValues };
    return{
        ...datapoint,
        date:new Date(datapoint.date),
        created:new Date(datapoint.date),
        //values:[...d.values, ...getDerivedValues(dWithValueKeys, derivedMeasures)]
        values:[...enteredKeyedValues, ...getDerivedValues(datapointWithEnteredKeyedValues, hydratedDerivedMeasures)]
    }
}

export function getDerivedValues(datapoint, derivedMeasures=[]){
    return derivedMeasures
        .filter(m => !datapoint.values.find(v => v.key === m.key)) //remove any whose values have been entered
        .map(derivedNonEnteredMeasure => {
            return {
                key:derivedNonEnteredMeasure.key,
                value:calcDerivedValue(datapoint, derivedNonEnteredMeasure.formula),
                wasCalculated:true 
            }
        })
}

function calcDerivedValue(datapoint, formula){
    const { type, of } = formula;
    const values = of
        .map(valueDescription => {
            if(typeof valueDescription === "string"){
                const requiredKey = valueDescription;
                //its a measure key so get the corresponding value
                return datapoint.values.find(v => v.key === requiredKey)?.value
            }
            if(typeof valueDescription === "number"){
                //its a constant
                return valueDescription;
            }
            //must be an inner formula itself
            // console.log("its a formula", valueDescription)
            return calcDerivedValue(datapoint, valueDescription);
        })
        .map(value => Number(value))
        .filter(value => typeof value === "number")

    switch(type){
        case "mean":{ return mean(values) }
        case "median":{ return median(values) }
        case "percentage":{ return percentage(...values) }
        case "sum":{ return sum(values) }
        case "difference":{ return difference(values) }
        default: return 0
    }
}

export const toCamelCase = str =>{
    if(str.length === 0) {return str; };
    return str.split(" ").map((word,i) => {
        if(i === 0){ return word.toLowerCase();}
        return word[0].toUpperCase()+ word.substring(1);
    })
    .join("");
}

const capitalize = str => {
    if(!str) {return "";}
    return str[0].toUpperCase() + str.substring(1, str.length)
}

const capitalizeAndSpace = str => {
    if(!str){ return "";}
    return capitalize(str) + " "
}

const space = str => str ? str + " " : "";


