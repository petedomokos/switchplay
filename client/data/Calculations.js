import * as d3 from 'd3';

export const mean = values => {
    if(values.length === 0){
        return undefined;
    }
    return values.reduce((a,b) => a + b) / values.length;
}

//for now, just deal with up to 3 values
//@TODO - implement properly
export const median = values => {
    if(values.length === 0){
        return undefined;
    }
    const ascending = values.sort(d3.ascending)
    if(values.length % 2 === 0){
        const middleValues = [
            ascending[(values.length / 2) - 1],
            ascending[(values.length / 2)]
        ]
        return mean(middleValues);
    }
    //odd
    return ascending[(values.length - 1) / 2]
}

/*
*/

export const fraction = (numerator, denominator, as) => {
    if(denominator === 0){
        return NaN;
    }
    if(as === "percentage"){
        return (numerator / denominator ) * 100;
    }
    /*if(as === "fraction"){
        return 
    }*/
    return numerator / denominator;

}

export const percentage =  (numerator, denominator) => fraction(numerator, denominator, "percentage")

export const sum = values => {
    return values.reduce((a,b) => a + b, 0)
}

//only handles 2 values
export const difference = values => {
    if(typeof values[0] !== 'number' || typeof values[1] !== 'number'){
        return NaN;
    }
    return values[0] - values[1]
}