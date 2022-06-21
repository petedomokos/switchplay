import { getGoals, getStartDate } from "./goals";
import { derivedMeasures } from './measures';
import { mean, median, percentage, sum, difference } from "./Calculations"

export function hydrateDataset(dataset){
    const startDate = getStartDate(dataset);
    const derivedMeasures = getDerivedMeasures(dataset);
    const rawMeasures = dataset.measures.map(m => hydrateMeasure(m))
    const datapoints = dataset.datapoints.map(d => {
        //add measure key to rawMeasure values (server stores the measure id instead - need to change)
        const rawValues = d.values.map(v => {
            //v.measure is measure _id
            const measure = rawMeasures.find(m => m._id === v.measure);
            return {
                ...v,
                key:measure.key
            }
        })
        //derivedValues need a measure key to access the rawValues
        const dWithValueKeys = { ...d, values:rawValues };
        return{
            ...d,
            //values:[...d.values, ...getDerivedValues(dWithValueKeys, derivedMeasures)]
            values:[...rawValues, ...getDerivedValues(dWithValueKeys, derivedMeasures)]
        }
    });
    return {
        ...dataset,
        startDate, 
        rawMeasures, 
        derivedMeasures,
        datapoints
    }
}


export function getDerivedMeasures(dataset){
    const measureSchemas = derivedMeasures[dataset._id];
    if(!measureSchemas){
        return [];
    }
    return measureSchemas.map(schema => hydrateMeasure(schema));
}

export function getDerivedValues(datapoint, derivedMeasures=[]){
    return derivedMeasures.map(derivedMeasure => ({
        measure:derivedMeasure._id,
        value:calcDerivedValue(datapoint, derivedMeasure.formula),
        //fake an id - probably dont need anyway - > @TODO - move to using only key for measures and values in dataviz
        _id:new Date().getTime() + ""
    }))
}

function calcDerivedValue(datapoint, formula){
    const { type, of } = formula;
    const values = of
        .map(valueDescription => {
            if(typeof valueDescription === "string"){
                const requiredKey = valueDescription;
                //its a measure key so get the corresponding value
                return datapoint.values.find(v => v.key === requiredKey).value
            }
            if(typeof valueDescription === "number"){
                //its a constant
                return valueDescription;
            }
            //must be an inner formula itself
            console.log("its a formula", valueDescription)
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
        if(i === 0){
            return str.toLowerCase();
        }
        return str[0].toUpperCase() + str.substring(1);
    })
    .join("")
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

export function hydrateMeasure(measure){
    const { name, key, side, nr, custom } = measure;
    const newKey = [key, side, nr, custom]
        .filter(part => part)
        .join("-");

    const newName = side || nr || custom ? name + " - " +capitalizeAndSpace(side) +space(nr) + capitalize(custom) : name;

    return {
        ...measure,
        key:newKey,
        name:newName,
        //use key for id for derived measures (raw measures have _id set on server)
        _id:measure._id || newKey
    }
}

